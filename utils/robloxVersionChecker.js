const fs = require("fs");
const path = require("path");

const channelsPath = path.join(__dirname, "..", "data", "robloxVersionChannels.json");
const cachePath = path.join(__dirname, "..", "data", "robloxVersionCache.json");
const notifiedPath = path.join(__dirname, "..", "data", "robloxVersionNotified.json");

const PLATFORMS = ["Windows", "Mac", "Android", "iOS"];
const PLATFORM_ALIASES = {
    windows: "Windows",
    win: "Windows",
    mac: "Mac",
    macos: "Mac",
    osx: "Mac",
    android: "Android",
    ios: "iOS",
    iphone: "iOS",
    ipad: "iOS"
};

function ensureFile(filePath, defaultValue = "{}") {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, defaultValue);
    }
}

function loadChannels() {
    try {
        ensureFile(channelsPath);
        return JSON.parse(fs.readFileSync(channelsPath, "utf8"));
    } catch {
        return {};
    }
}

function saveChannels(data) {
    fs.writeFileSync(channelsPath, JSON.stringify(data, null, 4));
}

/**
 * Returns { channelId, platforms } or null
 * platforms: null means all platforms
 */
function getRobloxVersionConfig(guildId) {
    const data = loadChannels();
    const entry = data[guildId];
    if (!entry) return null;

    // Backwards compatible: plain channel id string
    if (typeof entry === "string") {
        return { channelId: entry, platforms: null };
    }

    if (entry.channelId) {
        return {
            channelId: entry.channelId,
            platforms: Array.isArray(entry.platforms) && entry.platforms.length
                ? entry.platforms
                : null
        };
    }

    return null;
}

function getRobloxVersionChannel(guildId) {
    const config = getRobloxVersionConfig(guildId);
    return config?.channelId || null;
}

function setRobloxVersionChannel(guildId, channelId, platforms = null) {
    const data = loadChannels();
    data[guildId] = {
        channelId,
        platforms: platforms && platforms.length ? platforms : null
    };
    saveChannels(data);
}

function removeRobloxVersionChannel(guildId) {
    const data = loadChannels();
    delete data[guildId];
    saveChannels(data);
}

function parsePlatformsInput(input) {
    if (!input || !String(input).trim()) return null;

    const parts = String(input)
        .split(/[,|\s]+/)
        .map(p => p.trim().toLowerCase())
        .filter(Boolean);

    const resolved = [];
    for (const part of parts) {
        const platform = PLATFORM_ALIASES[part] || PLATFORMS.find(
            p => p.toLowerCase() === part
        );
        if (platform && !resolved.includes(platform)) {
            resolved.push(platform);
        }
    }

    return resolved.length ? resolved : null;
}

function loadCache() {
    try {
        ensureFile(cachePath, "{}");
        return JSON.parse(fs.readFileSync(cachePath, "utf8"));
    } catch {
        return {};
    }
}

function saveCache(data) {
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 4));
}

function loadNotified() {
    try {
        ensureFile(notifiedPath, "{}");
        return JSON.parse(fs.readFileSync(notifiedPath, "utf8"));
    } catch {
        return {};
    }
}

function saveNotified(data) {
    fs.writeFileSync(notifiedPath, JSON.stringify(data, null, 4));
}

function notifyKey(kind, platform, version) {
    return `${kind}::${platform}::${String(version || "").trim()}`;
}

function shouldNotify(kind, platform, version) {
    if (!platform || !version) return false;
    const notified = loadNotified();
    return !notified[notifyKey(kind, platform, version)];
}

function markNotified(kind, platform, version) {
    if (!platform || !version) return;
    const notified = loadNotified();
    notified[notifyKey(kind, platform, version)] = new Date().toISOString();
    saveNotified(notified);
}

function seedNotified(cache) {
    const notified = loadNotified();
    let changed = false;

    for (const [platform, snap] of Object.entries(cache.current || {})) {
        const key = notifyKey("current", platform, snap.version);
        if (!notified[key]) {
            notified[key] = new Date().toISOString();
            changed = true;
        }
    }

    for (const [platform, snap] of Object.entries(cache.future || {})) {
        const key = notifyKey("future", platform, snap.version);
        if (!notified[key]) {
            notified[key] = new Date().toISOString();
            changed = true;
        }
    }

    if (changed) saveNotified(notified);
}

function parseVersionPayload(data, kind) {
    const result = {};

    for (const platform of PLATFORMS) {
        const hash = data[platform];
        if (!hash) continue;

        const response = data[`${platform}Response`] || {};
        const date = data[`${platform}Date`] || null;

        result[platform] = {
            platform,
            kind,
            version: String(hash).trim(),
            clientVersion: response.version || null,
            bootstrapperVersion: response.bootstrapperVersion || null,
            type: response.type || null,
            date: date,
            timestamp: response.timestamp || null
        };
    }

    return result;
}

module.exports = {
    getRobloxVersionChannel,
    getRobloxVersionConfig,
    setRobloxVersionChannel,
    removeRobloxVersionChannel,
    parsePlatformsInput,
    loadChannels,
    loadCache,
    saveCache,
    shouldNotify,
    markNotified,
    seedNotified,
    parseVersionPayload,
    PLATFORMS
};
