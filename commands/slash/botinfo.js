const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("botinfo")
        .setDescription("Show information about skibidi"),

    async execute(interaction) {
        const client = interaction.client;

        const embed = new EmbedBuilder()
            .setColor(0x0b1f3a)
            .setTitle("skibidi")
            .addFields(
                {
                    name: "Servers",
                    value: `${client.guilds.cache.size}`,
                    inline: true
                },
                {
                    name: "Users",
                    value: `${client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0)}`,
                    inline: true
                },
                {
                    name: "Discord.js",
                    value: require("discord.js").version,
                    inline: true
                }
            );

        await interaction.reply({ embeds: [embed] });
    }
};