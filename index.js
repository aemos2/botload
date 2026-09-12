require("dotenv").config({ override: true });

const fs = require("fs");
const path = require("path");

const {
    Client,
    GatewayIntentBits,
    Partials,
    REST,
    Routes,
    MessageFlags
} = require("discord.js");

const config = require("./config");

const {
    commands: slashCommands,
    commandMap
} = require("./handlers/slashHandler");

const {
    commands: prefixCommands,
    executePrefixCommand
} = require("./handlers/prefixHandler");

const {
    checkCooldown
} = require("./utils/cooldowns");

const {
    getPrefix
} = require("./utils/prefixes");

const {
    setupLogging
} = require("./handlers/logHandler");

const {
    setupAutoMod
} = require("./handlers/autoModHandler");

const {
    setupSecurity
} = require("./handlers/securityHandler");

const {
    setupExecutorChecker
} = require("./handlers/executorHandler");

const {
    setupRobloxVersionChecker
} = require("./handlers/robloxVersionHandler");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const tempbanPath = path.join(
    __dirname,
    "data",
    "tempbans.json"
);

function loadTempBans() {
    try {
        if (!fs.existsSync(tempbanPath)) {
            fs.writeFileSync(
                tempbanPath,
                "{}"
            );
        }

        return JSON.parse(
            fs.readFileSync(
                tempbanPath,
                "utf8"
            )
        );
    } catch {
        return {};
    }
}

function saveTempBans(data) {
    fs.writeFileSync(
        tempbanPath,
        JSON.stringify(
            data,
            null,
            4
        )
    );
}

async function processTempBans() {
    const data = loadTempBans();
    const now = Date.now();

    let changed = false;

    for (const [guildId, users] of Object.entries(data)) {
        const guild = client.guilds.cache.get(guildId);

        if (!guild) continue;

        for (const [userId, punishment] of Object.entries(users)) {
            if (now < punishment.expiresAt) {
                continue;
            }

            await guild.members.unban(
                userId,
                "Temporary ban expired"
            ).catch(() => {});

            delete data[guildId][userId];

            changed = true;
        }

        if (
            Object.keys(data[guildId]).length === 0
        ) {
            delete data[guildId];
        }
    }

    if (changed) {
        saveTempBans(data);
    }
}

client.once("clientReady", async () => {
    console.log("--------------------------------");
    console.log(
        `Octobot is online as ${client.user.tag}`
    );
    console.log(
        `Servers: ${client.guilds.cache.size}`
    );
    console.log(
        `Default Prefix: ${config.defaultPrefix}`
    );
    console.log("--------------------------------");

    try {
        const rest = new REST({
            version: "10"
        }).setToken(
            process.env.DISCORD_TOKEN
        );

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            {
                body: slashCommands
            }
        );

        console.log(
            `Deployed ${slashCommands.length} slash command(s).`
        );

        console.log(
            `Loaded ${prefixCommands.size} prefix command(s).`
        );
    } catch (error) {
        console.error(
            "Failed to deploy slash commands:",
            error
        );
    }

    await processTempBans();

    setInterval(
        processTempBans,
        15000
    );
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;

    // Discord may deliver empty content without Message Content Intent
    const content = message.content || "";
    if (!content) return;

    const isDM = !message.guild;

    if (isDM) {
        console.log(`[DM] from ${message.author.tag}: ${content}`);
    }

    let prefix;
    if (isDM) {
        const candidates = [config.defaultPrefix, ".", "?"].filter(
            (p, i, arr) => p && arr.indexOf(p) === i
        );
        prefix = candidates.find(p => content.startsWith(p)) || null;
        if (!prefix) return;
    } else {
        prefix = getPrefix(message.guild.id, config.defaultPrefix);
        if (!content.startsWith(prefix)) {
            return;
        }
    }

    message.client.prefix = prefix;

    const args = content
        .slice(prefix.length)
        .trim()
        .split(/\s+/);

    const commandName = args
        .shift()
        ?.toLowerCase();

    if (!commandName) return;

    const reply = async payload => {
        try {
            return await message.channel.send(payload);
        } catch (err) {
            console.error("[Send] Failed:", err.message);
            try {
                return await message.reply(payload);
            } catch (err2) {
                console.error("[Reply] Failed:", err2.message);
            }
        }
    };

    let command = prefixCommands.get(commandName);

    // Fallback: executor lookups (.solara, .real, etc.)
    if (!command) {
        const remaining = checkCooldown(
            "executor-lookup",
            message.author.id,
            3000
        );

        if (remaining > 0) {
            return reply(
                `Please wait ${remaining}s before using this command again.`
            );
        }

        try {
            const {
                fetchExecutorByName,
                buildExecutorEmbed
            } = require("./commands/prefix/executor");

            const data = await fetchExecutorByName(commandName);

            if (!data) return;

            const { embed, components } = buildExecutorEmbed(data);

            await reply({
                embeds: [embed],
                components
            });
        } catch (error) {
            console.error(
                `Error in executor lookup "${commandName}":`,
                error
            );
        }

        return;
    }

    const remaining = checkCooldown(
        command.name,
        message.author.id,
        3000
    );

    if (remaining > 0) {
        return reply(
            `Please wait ${remaining}s before using this command again.`
        );
    }

    try {
        await executePrefixCommand(
            command,
            message,
            args
        );
    } catch (error) {
        console.error(
            `Error in prefix command "${commandName}":`,
            error
        );

        await reply(
            "An error occurred while executing that command."
        );
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = commandMap.get(
        interaction.commandName
    );

    if (!command) return;

    const remaining = checkCooldown(
        interaction.commandName,
        interaction.user.id,
        3000
    );

    if (remaining > 0) {
        return interaction.reply({
            content: `Please wait ${remaining}s before using this command again.`,
            flags: MessageFlags.Ephemeral
        });
    }

    try {
        await command.execute(
            interaction
        );
    } catch (error) {
        console.error(
            `Error in slash command "/${interaction.commandName}":`,
            error
        );

        if (
            interaction.replied ||
            interaction.deferred
        ) {
            await interaction.editReply(
                "An error occurred while executing that command."
            ).catch(() => {});
        } else {
            await interaction.reply({
                content:
                    "An error occurred while executing that command.",
                flags: MessageFlags.Ephemeral
            }).catch(() => {});
        }
    }
});

client.on("error", error => {
    console.error(
        "Discord client error:",
        error
    );
});

process.on("unhandledRejection", error => {
    console.error(
        "Unhandled promise rejection:",
        error
    );
});

process.on("uncaughtException", error => {
    console.error(
        "Uncaught exception:",
        error
    );
});

if (!process.env.DISCORD_TOKEN) {
    console.error(
        "DISCORD_TOKEN is missing from .env"
    );

    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error(
        "CLIENT_ID is missing from .env"
    );

    process.exit(1);
}

setupLogging(client);
setupAutoMod(client);
setupSecurity(client);
setupExecutorChecker(client);
setupRobloxVersionChecker(client);

client.login(
    process.env.DISCORD_TOKEN
);