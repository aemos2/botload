const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Show available commands"),

    async execute(interaction) {
        const helpMessage = [
            `.exploits - list all executors`,
            `.solara - Solara info`,
            `.real - Real info`,
            `.delta - Delta info (or bypass with a URL)`,
            `Any executor name works (e.g. .wave, .potassium)`,
            `/executorcheckerchannel - set executor update channel`,
            `/robloxversionchannel - set Roblox version channel (optional platforms)`
        ].join("\n");

        await interaction.reply({
            content: `commands:\n\`\`\`\n${helpMessage}\n\`\`\``
        });
    }
};
