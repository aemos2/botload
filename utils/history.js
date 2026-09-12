const fs = require("fs");
const path = require("path");

const filePath = path.join(
    __dirname,
    "..",
    "data",
    "history.json"
);

function loadHistory() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "{}");
        }

        return JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );
    } catch {
        return {};
    }
}

function saveHistory(data) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4)
    );
}

function addHistory(guildId, userId, entry) {
    const data = loadHistory();

    if (!data[guildId]) {
        data[guildId] = {};
    }

    if (!data[guildId][userId]) {
        data[guildId][userId] = [];
    }

    data[guildId][userId].push({
        ...entry,
        timestamp: Date.now()
    });

    if (data[guildId][userId].length > 50) {
        data[guildId][userId] =
            data[guildId][userId].slice(-50);
    }

    saveHistory(data);
}

function getHistory(guildId, userId) {
    const data = loadHistory();

    return data[guildId]?.[userId] || [];
}

module.exports = {
    addHistory,
    getHistory
};