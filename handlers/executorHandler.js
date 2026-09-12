const { EmbedBuilder } = require("discord.js");

const {
    loadCache,
    saveCache,
    snapshot,
    hasSignificantChange,
    loadChannels,
    addHistoryEntry,
    shouldNotify,
    markNotified,
    seedNotifiedFromCache,
    formatRbxVersion,
    entryKey
} = require("../utils/executorChecker");

const API_URL = "https://whatexpsare.online/api/status/exploits";
const POLL_INTERVAL_MS = 5 * 60 * 1000;

async function fetchExploits() {
    const res = await fetch(API_URL, {
        headers: {
            Accept: "application/json",
            "User-Agent": "Octobot/1.0"
        }
    });

    if (!res.ok) {
        throw new Error(`Status request failed with code ${res.status}`);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
        throw new Error("Unexpected response format");
    }

    return data;
}

function formatStatus(snap) {
    return snap.detected ? "Detected" : "Undetected";
}

function buildUpdateEmbed(item) {
    const { snap, oldSnap } = item;

    const oldVersion = oldSnap?.version || "N/A";
    const newVersion = snap.version || "N/A";
    const versionLine =
        oldVersion === newVersion
            ? newVersion
            : `${oldVersion} -- ${newVersion}`;

    const oldRbx = oldSnap?.rbxversion || "N/A";
    const newRbx = formatRbxVersion(snap.rbxversion);
    const rbxLine =
        oldRbx === newRbx || oldRbx === "N/A"
            ? newRbx
            : `${oldRbx} -- ${newRbx}`;

    const nowUnix = Math.floor(Date.now() / 1000);
    // Discord relative timestamp → "a few seconds ago", "an hour ago", etc.
    const detectedAt = `<t:${nowUnix}:R>`;

    return new EmbedBuilder()
        .setTitle(`${snap.title} Updated`)
        .setColor(0x2b2d31)
        .addFields(
            {
                name: "Version",
                value: versionLine,
                inline: false
            },
            {
                name: "Roblox Version",
                value: rbxLine,
                inline: false
            },
            {
                name: "Last Updated",
                value: detectedAt,
                inline: false
            },
            {
                name: "Status",
                value: formatStatus(snap),
                inline: false
            }
        )
        .setTimestamp(nowUnix * 1000);
}

async function sendNotifications(client, changesList) {
    if (changesList.length === 0) return;

    const channels = loadChannels();
    const guildIds = Object.keys(channels);

    if (guildIds.length === 0) return;

    for (const item of changesList) {
        const embed = buildUpdateEmbed(item);

        for (const guildId of guildIds) {
            const channelId = channels[guildId];
            if (!channelId) continue;

            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;

            const channel = guild.channels.cache.get(channelId);
            if (!channel || !channel.isTextBased()) continue;

            await channel
                .send({ embeds: [embed] })
                .catch(err =>
                    console.error(
                        `[Executor] Failed to send to ${guildId}/${channelId}: ${err.message}`
                    )
                );
        }
    }
}

async function checkExploits(client) {
    try {
        const exploits = await fetchExploits();
        const cache = loadCache();
        const hadPreviousCache = Object.keys(cache).length > 0;
        const newCache = {};
        const changesList = [];

        for (const exec of exploits) {
            if (!exec.title) continue;

            const id = entryKey(exec);
            const snap = snapshot(exec);
            newCache[id] = snap;

            if (!hadPreviousCache) continue;

            const oldSnap = cache[id];

            // No previous data for this specific entry → treat as first seen, not an update
            if (!oldSnap) continue;

            if (!hasSignificantChange(oldSnap, snap)) continue;

            if (!shouldNotify(id, snap.version, snap.rbxversion)) continue;

            changesList.push({ snap, oldSnap });

            addHistoryEntry({
                id,
                title: snap.title,
                version: {
                    from: oldSnap.version || null,
                    to: snap.version || null
                },
                rbxversion: {
                    from: oldSnap.rbxversion || null,
                    to: snap.rbxversion || null
                },
                detected: snap.detected,
                recordedAt: new Date().toISOString()
            });

            markNotified(id, snap.version, snap.rbxversion);
        }

        saveCache(newCache);

        if (!hadPreviousCache) {
            seedNotifiedFromCache(newCache);
            console.log(
                `[Executor] Initial cache built (${Object.keys(newCache).length} entries)`
            );
            return;
        }

        if (changesList.length > 0) {
            console.log(`[Executor] ${changesList.length} update(s) recorded`);
            await sendNotifications(client, changesList);
        }
    } catch (err) {
        console.error(`[Executor] Check failed: ${err.message}`);
    }
}

function setupExecutorChecker(client) {
    setTimeout(() => checkExploits(client), 10000);
    setInterval(() => checkExploits(client), POLL_INTERVAL_MS);
    console.log("[Executor] Update monitor started");
}

module.exports = {
    setupExecutorChecker,
    checkExploits
};
