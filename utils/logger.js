const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "logs.json");

function loadLogs() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "{}");
        }

        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
        return {};
    }
}

function saveLogs(data) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4)
    );
}

function getLogChannel(guildId) {
    const data = loadLogs();
    return data[guildId] || null;
}

function setLogChannel(guildId, channelId) {
    const data = loadLogs();

    data[guildId] = channelId;

    saveLogs(data);
}

function removeLogChannel(guildId) {
    const data = loadLogs();

    delete data[guildId];

    saveLogs(data);
}

module.exports = {
    getLogChannel,
    setLogChannel,
    removeLogChannel
};