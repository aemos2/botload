const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Show information about this server"),

    async execute(interaction) {
        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setColor(0x0b1f3a)
            .setTitle(guild.name)
            .addFields(
                {
                    name: "Owner",
                    value: `<@${guild.ownerId}>`,
                    inline: true
                },
                {
                    name: "Members",
                    value: `${guild.memberCount}`,
                    inline: true
                },
                {
                    name: "Channels",
                    value: `${guild.channels.cache.size}`,
                    inline: true
                },
                {
                    name: "Roles",
                    value: `${guild.roles.cache.size}`,
                    inline: true
                },
                {
                    name: "Server ID",
                    value: guild.id,
                    inline: true
                }
            );

        await interaction.reply({ embeds: [embed] });
    }
};