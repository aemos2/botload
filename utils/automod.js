const fs = require("fs");
const path = require("path");

const filePath = path.join(
    __dirname,
    "..",
    "data",
    "automod.json"
);

const defaults = {
    enabled: false,
    keywords: [],
    caps: false,
    spam: false,
    links: false,
    invites: false,
    massMention: false
};

function loadAutoMod() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(
                filePath,
                JSON.stringify({}, null, 4)
            );
        }

        return JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );
    } catch {
        return {};
    }
}

function saveAutoMod(data) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4)
    );
}

function getAutoMod(guildId) {
    const data = loadAutoMod();

    return {
        ...defaults,
        ...(data[guildId] || {})
    };
}

function updateAutoMod(guildId, settings) {
    const data = loadAutoMod();

    data[guildId] = {
        ...defaults,
        ...(data[guildId] || {}),
        ...settings
    };

    saveAutoMod(data);

    return data[guildId];
}

module.exports = {
    getAutoMod,
    updateAutoMod
};