const { EmbedBuilder } = require("discord.js");

const {
    loadCache,
    saveCache,
    loadChannels,
    getRobloxVersionConfig,
    shouldNotify,
    markNotified,
    seedNotified,
    parseVersionPayload
} = require("../utils/robloxVersionChecker");

const CURRENT_URL = "https://weao.xyz/api/versions/current";
const FUTURE_URL = "https://weao.xyz/api/versions/future";
const PAST_URL = "https://weao.xyz/api/versions/past";
const POLL_INTERVAL_MS = 5 * 60 * 1000;

async function fetchJson(url) {
    const res = await fetch(url, {
        headers: {
            Accept: "application/json",
            "User-Agent": "Octobot/1.0"
        }
    });

    if (!res.ok) {
        throw new Error(`Request failed ${res.status} for ${url}`);
    }

    return res.json();
}

function detectedAt() {
    return (
        new Date().toLocaleString("en-US", {
            timeZone: "UTC",
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        }) + " UTC"
    );
}

function buildEmbed(event) {
    const { kind, platform, snap, oldSnap } = event;

    let title;
    if (kind === "future") {
        title = `${platform} Future Version`;
    } else if (snap.type === "revert" || (oldSnap && oldSnap.version && snap.version !== oldSnap.version && snap.type === "revert")) {
        title = `${platform} Version Reverted`;
    } else if (kind === "current") {
        title = `${platform} Version Updated`;
    } else {
        title = `${platform} Version Change`;
    }

    // Detect revert even if type field missing: current went back to a past value
    if (kind === "current" && event.isRevert) {
        title = `${platform} Version Reverted`;
    }

    const oldV = oldSnap?.version || "N/A";
    const newV = snap.version || "N/A";
    const versionLine = oldV === newV || oldV === "N/A" ? newV : `${oldV} -- ${newV}`;

    const fields = [
        {
            name: "Version",
            value: versionLine,
            inline: false
        }
    ];

    if (snap.clientVersion) {
        fields.push({
            name: "Client Version",
            value: snap.clientVersion,
            inline: false
        });
    }

    fields.push({
        name: "Detected At",
        value: detectedAt(),
        inline: false
    });

    if (snap.type) {
        fields.push({
            name: "Type",
            value: snap.type === "revert" ? "Revert" : snap.type === "new" ? "New" : String(snap.type),
            inline: false
        });
    } else if (event.isRevert) {
        fields.push({
            name: "Type",
            value: "Revert",
            inline: false
        });
    }

    if (kind === "future") {
        fields.push({
            name: "Status",
            value: "Future",
            inline: false
        });
    }

    return new EmbedBuilder()
        .setTitle(title)
        .setColor(0x2b2d31)
        .addFields(fields)
        .setTimestamp();
}

async function sendNotifications(client, events) {
    if (!events.length) return;

    const channels = loadChannels();
    const guildIds = Object.keys(channels);
    if (!guildIds.length) return;

    for (const event of events) {
        const embed = buildEmbed(event);

        for (const guildId of guildIds) {
            const config = getRobloxVersionConfig(guildId);
            if (!config?.channelId) continue;

            // Platform filter: null/empty = all platforms
            if (
                config.platforms &&
                config.platforms.length &&
                !config.platforms.includes(event.platform)
            ) {
                continue;
            }

            const guild = client.guilds.cache.get(guildId);
            if (!guild) continue;

            const channel = guild.channels.cache.get(config.channelId);
            if (!channel || !channel.isTextBased()) continue;

            await channel
                .send({ embeds: [embed] })
                .catch(err =>
                    console.error(
                        `[RobloxVersion] Failed to send to ${guildId}/${config.channelId}: ${err.message}`
                    )
                );
        }
    }
}

async function checkVersions(client) {
    try {
        const [currentData, futureData, pastData] = await Promise.all([
            fetchJson(CURRENT_URL),
            fetchJson(FUTURE_URL),
            fetchJson(PAST_URL).catch(() => ({}))
        ]);

        const current = parseVersionPayload(currentData, "current");
        const future = parseVersionPayload(futureData, "future");
        const past = parseVersionPayload(pastData, "past");

        const cache = loadCache();
        const hadPrevious = Boolean(
            cache.current && Object.keys(cache.current).length
        );

        const events = [];

        if (hadPrevious) {
            // Current version changes
            for (const [platform, snap] of Object.entries(current)) {
                const oldSnap = cache.current?.[platform];
                if (!oldSnap) continue;
                if (oldSnap.version === snap.version) continue;
                if (!shouldNotify("current", platform, snap.version)) continue;

                const pastVersion = past[platform]?.version;
                const isRevert =
                    snap.type === "revert" ||
                    (pastVersion && snap.version === pastVersion) ||
                    (oldSnap.version && snap.version < oldSnap.version);

                events.push({
                    kind: "current",
                    platform,
                    snap,
                    oldSnap,
                    isRevert
                });

                markNotified("current", platform, snap.version);
            }

            // Future version appears or changes
            for (const [platform, snap] of Object.entries(future)) {
                const oldSnap = cache.future?.[platform];
                if (oldSnap && oldSnap.version === snap.version) continue;
                if (!shouldNotify("future", platform, snap.version)) continue;

                // Skip if this future version is already the current one
                if (current[platform]?.version === snap.version) continue;

                events.push({
                    kind: "future",
                    platform,
                    snap,
                    oldSnap: oldSnap || null,
                    isRevert: false
                });

                markNotified("future", platform, snap.version);
            }
        }

        const newCache = { current, future, past };
        saveCache(newCache);

        if (!hadPrevious) {
            seedNotified(newCache);
            console.log(
                `[RobloxVersion] Initial cache built (${Object.keys(current).length} platforms)`
            );
            return;
        }

        if (events.length > 0) {
            console.log(`[RobloxVersion] ${events.length} change(s) recorded`);
            await sendNotifications(client, events);
        }
    } catch (err) {
        console.error(`[RobloxVersion] Check failed: ${err.message}`);
    }
}

function setupRobloxVersionChecker(client) {
    setTimeout(() => checkVersions(client), 15000);
    setInterval(() => checkVersions(client), POLL_INTERVAL_MS);
    console.log("[RobloxVersion] Monitor started");
}

module.exports = {
    setupRobloxVersionChecker,
    checkVersions
};
