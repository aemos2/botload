const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const { fetchExecutorByName } = require("../../utils/executorApi");

function formatStatus(data) {
    return data.detected ? "Detected" : "Undetected";
}

function isValidUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

function buildExecutorEmbed(data) {
    const embed = new EmbedBuilder()
        .setTitle(data.title)
        .setColor(0x2b2d31)
        .addFields(
            {
                name: "Version",
                value: data.version || "N/A",
                inline: false
            },
            {
                name: "Roblox Version",
                value: data.rbxversion || "N/A",
                inline: false
            },
            {
                name: "Status",
                value: formatStatus(data),
                inline: false
            },
            {
                name: "Free",
                value: data.free ? "Yes" : "No",
                inline: true
            },
            {
                name: "Updated",
                value: data.updateStatus ? "Yes" : "No",
                inline: true
            },
            {
                name: "Platform",
                value: data.platform || "N/A",
                inline: true
            }
        )
        .setTimestamp();

    if (data.updatedDate) {
        embed.addFields({
            name: "Last API Update",
            value: data.updatedDate,
            inline: false
        });
    }

    const buttons = [];

    if (isValidUrl(data.websitelink)) {
        buttons.push(
            new ButtonBuilder()
                .setLabel("Website")
                .setStyle(ButtonStyle.Link)
                .setURL(data.websitelink)
        );
    }

    if (isValidUrl(data.discordlink)) {
        buttons.push(
            new ButtonBuilder()
                .setLabel("Discord")
                .setStyle(ButtonStyle.Link)
                .setURL(data.discordlink)
        );
    }

    const components = [];
    if (buttons.length > 0) {
        components.push(new ActionRowBuilder().addComponents(buttons));
    }

    return { embed, components };
}

module.exports = {
    name: "executor",
    aliases: ["ex", "exec"],
    description: "Show information about an executor. Usage: .executor <name> or .solara",

    async execute(message, args) {
        const name = args.join(" ").trim();

        if (!name) {
            return message.reply(
                "Provide an executor name. Example: `.executor solara` or `.solara`"
            );
        }

        try {
            const data = await fetchExecutorByName(name);

            if (!data) {
                return message.reply(`No executor found matching \`${name}\`.`);
            }

            const { embed, components } = buildExecutorEmbed(data);

            await message.reply({
                embeds: [embed],
                components
            });
        } catch (err) {
            console.error("[Executor] Lookup failed:", err.message);
            await message.reply("Failed to fetch executor information.");
        }
    },

    buildExecutorEmbed,
    fetchExecutorByName
};
