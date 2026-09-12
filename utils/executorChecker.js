const fs = require("fs");
const path = require("path");

const channelsPath = path.join(__dirname, "..", "data", "executorChannels.json");
const cachePath = path.join(__dirname, "..", "data", "executorCache.json");
const historyPath = path.join(__dirname, "..", "data", "executorHistory.json");
const notifiedPath = path.join(__dirname, "..", "data", "executorNotified.json");

const MAX_HISTORY = 200;

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

function getExecutorChannel(guildId) {
    const data = loadChannels();
    return data[guildId] || null;
}

function setExecutorChannel(guildId, channelId) {
    const data = loadChannels();
    data[guildId] = channelId;
    saveChannels(data);
}

function removeExecutorChannel(guildId) {
    const data = loadChannels();
    delete data[guildId];
    saveChannels(data);
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

function loadHistory() {
    try {
        ensureFile(historyPath, "[]");
        const data = JSON.parse(fs.readFileSync(historyPath, "utf8"));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveHistory(entries) {
    fs.writeFileSync(historyPath, JSON.stringify(entries, null, 4));
}

function addHistoryEntry(entry) {
    const history = loadHistory();
    history.unshift(entry);
    if (history.length > MAX_HISTORY) {
        history.length = MAX_HISTORY;
    }
    saveHistory(history);
    return history;
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

function normalizeVersion(version) {
    if (version == null) return "";
    return String(version).trim().replace(/\s+/g, " ");
}

/** Unique key per API entry — never use title alone (duplicates exist, e.g. two Deltas). */
function entryKey(executor) {
    if (executor._id) return String(executor._id);
    return `${executor.title}::${normalizeVersion(executor.version)}::${normalizeVersion(executor.rbxversion)}`;
}

function notifyKey(id, version, rbxversion) {
    return `${id}::${normalizeVersion(version)}::${normalizeVersion(rbxversion)}`;
}

function shouldNotify(id, version, rbxversion) {
    if (!id) return false;
    const notified = loadNotified();
    return !notified[notifyKey(id, version, rbxversion)];
}

function markNotified(id, version, rbxversion) {
    if (!id) return;
    const notified = loadNotified();
    notified[notifyKey(id, version, rbxversion)] = new Date().toISOString();
    saveNotified(notified);
}

function seedNotifiedFromCache(cache) {
    const notified = loadNotified();
    let changed = false;

    for (const [id, snap] of Object.entries(cache)) {
        if (!snap) continue;
        const key = notifyKey(id, snap.version, snap.rbxversion);
        if (!notified[key]) {
            notified[key] = new Date().toISOString();
            changed = true;
        }
    }

    if (changed) {
        saveNotified(notified);
    }
}

function snapshot(executor) {
    return {
        id: entryKey(executor),
        title: executor.title,
        version: normalizeVersion(executor.version) || null,
        updatedDate: executor.updatedDate || null,
        updateStatus: !!executor.updateStatus,
        detected: !!executor.detected,
        free: !!executor.free,
        rbxversion: normalizeVersion(executor.rbxversion) || null
    };
}

/**
 * Real update if executor version or Roblox version changed for this specific entry.
 */
function hasSignificantChange(oldSnap, newSnap) {
    if (!oldSnap || !newSnap) return false;

    const oldV = normalizeVersion(oldSnap.version);
    const newV = normalizeVersion(newSnap.version);
    const oldRbx = normalizeVersion(oldSnap.rbxversion);
    const newRbx = normalizeVersion(newSnap.rbxversion);

    const versionChanged = Boolean(oldV && newV && oldV !== newV);
    const rbxChanged = Boolean(oldRbx && newRbx && oldRbx !== newRbx);

    return versionChanged || rbxChanged;
}

function formatRbxVersion(rbxversion) {
    if (!rbxversion) return "N/A";
    return String(rbxversion).trim() || "N/A";
}

module.exports = {
    getExecutorChannel,
    setExecutorChannel,
    removeExecutorChannel,
    loadCache,
    saveCache,
    loadHistory,
    addHistoryEntry,
    shouldNotify,
    markNotified,
    seedNotifiedFromCache,
    snapshot,
    hasSignificantChange,
    normalizeVersion,
    formatRbxVersion,
    entryKey,
    loadChannels
};
