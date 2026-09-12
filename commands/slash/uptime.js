const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("uptime")
        .setDescription("Show how long Octobot has been online"),

    async execute(interaction) {
        const uptime = Math.floor(process.uptime());

        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        await interaction.reply(
            `${days}d ${hours}h ${minutes}m ${seconds}s`
        );
    }
};