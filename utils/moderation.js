const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "warnings.json");

function loadWarnings() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "{}");
        }

        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
        return {};
    }
}

function saveWarnings(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
}

function getWarnings(guildId, userId) {
    const data = loadWarnings();

    return data[guildId]?.[userId] || [];
}

function addWarning(guildId, userId, warning) {
    const data = loadWarnings();

    if (!data[guildId]) {
        data[guildId] = {};
    }

    if (!data[guildId][userId]) {
        data[guildId][userId] = [];
    }

    data[guildId][userId].push(warning);

    saveWarnings(data);

    return data[guildId][userId];
}

function clearWarnings(guildId, userId) {
    const data = loadWarnings();

    if (data[guildId]) {
        delete data[guildId][userId];
    }

    saveWarnings(data);
}

module.exports = {
    getWarnings,
    addWarning,
    clearWarnings
};