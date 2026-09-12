const fs = require("fs");
const path = require("path");

const filePath = path.join(
    __dirname,
    "..",
    "data",
    "serverConfig.json"
);

const defaults = {
    moderation: {
        enabled: true
    },
    logging: {
        enabled: true
    },
    commandRoles: {}
};

function loadConfig() {
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

function saveConfig(data) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4)
    );
}

function getServerConfig(guildId) {
    const data = loadConfig();

    return {
        ...defaults,
        ...(data[guildId] || {}),
        moderation: {
            ...defaults.moderation,
            ...(data[guildId]?.moderation || {})
        },
        logging: {
            ...defaults.logging,
            ...(data[guildId]?.logging || {})
        },
        commandRoles: {
            ...defaults.commandRoles,
            ...(data[guildId]?.commandRoles || {})
        }
    };
}

function updateServerConfig(guildId, settings) {
    const data = loadConfig();
    const current = getServerConfig(guildId);

    data[guildId] = {
        ...current,
        ...settings,
        moderation: {
            ...current.moderation,
            ...(settings.moderation || {})
        },
        logging: {
            ...current.logging,
            ...(settings.logging || {})
        },
        commandRoles: {
            ...current.commandRoles,
            ...(settings.commandRoles || {})
        }
    };

    saveConfig(data);

    return data[guildId];
}

function setCommandRole(guildId, commandName, roleId) {
    return updateServerConfig(guildId, {
        commandRoles: {
            [commandName]: roleId
        }
    });
}

function removeCommandRole(guildId, commandName) {
    const config = getServerConfig(guildId);

    const commandRoles = {
        ...config.commandRoles
    };

    delete commandRoles[commandName];

    return updateServerConfig(guildId, {
        commandRoles
    });
}

function getCommandRole(guildId, commandName) {
    const config = getServerConfig(guildId);

    return config.commandRoles[commandName] || null;
}

module.exports = {
    getServerConfig,
    updateServerConfig,
    getCommandRole,
    setCommandRole,
    removeCommandRole
};