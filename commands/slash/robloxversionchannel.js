const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    MessageFlags
} = require("discord.js");

const {
    setRobloxVersionChannel,
    removeRobloxVersionChannel,
    getRobloxVersionConfig,
    parsePlatformsInput,
    PLATFORMS
} = require("../../utils/robloxVersionChecker");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("robloxversionchannel")
        .setDescription(
            "Set or clear the channel used for Roblox version notifications."
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription(
                    "Text channel for Roblox version notifications. Omit to disable."
                )
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("platforms")
                .setDescription(
                    "Platforms to watch, comma-separated (windows,mac,android,ios). Leave empty for all."
                )
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");
        const platformsRaw = interaction.options.getString("platforms");

        if (!channel) {
            const existing = getRobloxVersionConfig(interaction.guild.id);
            if (!existing) {
                return interaction.reply({
                    content: "No Roblox version notification channel is currently set.",
                    flags: MessageFlags.Ephemeral
                });
            }

            removeRobloxVersionChannel(interaction.guild.id);
            return interaction.reply({
                content: "Roblox version notifications have been disabled.",
                flags: MessageFlags.Ephemeral
            });
        }

        let platforms = null;
        if (platformsRaw) {
            platforms = parsePlatformsInput(platformsRaw);
            if (!platforms) {
                return interaction.reply({
                    content: `Invalid platforms. Use one or more of: ${PLATFORMS.map(p => p.toLowerCase()).join(", ")}`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        setRobloxVersionChannel(interaction.guild.id, channel.id, platforms);

        const platformText = platforms
            ? platforms.join(", ")
            : "all platforms";

        await interaction.reply({
            content: `Roblox version notifications will be sent to ${channel} for **${platformText}**.`
        });
    }
};
