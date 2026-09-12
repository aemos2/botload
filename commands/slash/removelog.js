const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    removeLogChannel
} = require("../../utils/logger");

const {
    updateServerConfig
} = require("../../utils/serverConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removelog")
        .setDescription("Disables server logging.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        ),

    async execute(interaction) {
        removeLogChannel(interaction.guild.id);

        updateServerConfig(
        interaction.guild.id,
        {
            logging: {
                enabled: false
            }
        }
    );

        await interaction.reply(
            "Server logging has been disabled."
        );
    }
};