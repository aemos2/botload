const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const {
    setLogChannel
} = require("../../utils/logger");

const {
    updateServerConfig
} = require("../../utils/serverConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlog")
        .setDescription("Sets the server logging channel.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel where logs will be sent.")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        setLogChannel(
            interaction.guild.id,
            channel.id
        );

        updateServerConfig(
        interaction.guild.id,
        {
            logging: {
                enabled: true
            }
        }
    );

        await interaction.reply(
            `Logging channel set to ${channel}.`
        );
    }
};