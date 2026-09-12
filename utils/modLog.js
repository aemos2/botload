const {
    EmbedBuilder
} = require("discord.js");

const {
    getLogChannel
} = require("./logger");

const {
    getServerConfig
} = require("./serverConfig");

async function sendModLog(guild, data) {
    const channelId = getLogChannel(guild.id);

    const config = getServerConfig(guild.id);

    if (!config.logging.enabled) return;

    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);

    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
        .setTitle(data.title)
        .addFields(
            {
                name: "User",
                value: data.user || "Unknown",
                inline: true
            },
            {
                name: "Moderator",
                value: data.moderator || "Unknown",
                inline: true
            }
        )
        .setTimestamp();

    if (data.reason) {
        embed.addFields({
            name: "Reason",
            value: data.reason.slice(0, 1024)
        });
    }

    if (data.extra) {
        embed.addFields(data.extra);
    }

    await channel.send({
        embeds: [embed]
    }).catch(() => {});
}

module.exports = {
    sendModLog
};