const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "data", "prefixes.json");

function loadPrefixes() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "{}");
        }

        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
        return {};
    }
}

function savePrefixes(prefixes) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(prefixes, null, 4)
    );
}

function getPrefix(guildId, defaultPrefix = "?") {
    const prefixes = loadPrefixes();
    return prefixes[guildId] || defaultPrefix;
}

function setPrefix(guildId, prefix) {
    const prefixes = loadPrefixes();

    prefixes[guildId] = prefix;

    savePrefixes(prefixes);
}

function removePrefix(guildId) {
    const prefixes = loadPrefixes();

    delete prefixes[guildId];

    savePrefixes(prefixes);
}

module.exports = {
    getPrefix,
    setPrefix,
    removePrefix
};