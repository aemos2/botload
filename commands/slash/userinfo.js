const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Show information about a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("The user to inspect")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;

        const embed = new EmbedBuilder()
            .setColor(0x0b1f3a)
            .setTitle(user.tag)
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .addFields(
                {
                    name: "Username",
                    value: user.username,
                    inline: true
                },
                {
                    name: "User ID",
                    value: user.id,
                    inline: true
                },
                {
                    name: "Created",
                    value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
                    inline: true
                }
            );

        await interaction.reply({ embeds: [embed] });
    }
};