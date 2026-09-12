const {
    EmbedBuilder
} = require("discord.js");

module.exports = {
    name: "botinfo",
    aliases: ["bi"],
    description: "Shows information about Octobot.",

    async execute(message) {
        const client = message.client;

        const embed = new EmbedBuilder()
            .setTitle("Octobot")
            .addFields(
                {
                    name: "Servers",
                    value: `${client.guilds.cache.size}`,
                    inline: true
                },
                {
                    name: "Users",
                    value: `${client.guilds.cache.reduce(
                        (total, guild) => total + guild.memberCount,
                        0
                    )}`,
                    inline: true
                },
                {
                    name: "Prefix",
                    value: message.client.prefix || "?",
                    inline: true
                },
                {
                    name: "Node.js",
                    value: process.version,
                    inline: true
                },
                {
                    name: "Discord.js",
                    value: require("discord.js").version,
                    inline: true
                }
            )
            .setTimestamp();

        await message.reply({
            embeds: [embed]
        });
    }
};