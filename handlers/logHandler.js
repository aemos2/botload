const {
    EmbedBuilder,
    AuditLogEvent
} = require("discord.js");

const {
    getLogChannel
} = require("../utils/logger");

const {
    getServerConfig
} = require("../utils/serverConfig");

async function sendLog(guild, embed) {
    const config = getServerConfig(guild.id);

    if (!config.logging.enabled) return;

    const channelId = getLogChannel(guild.id);

    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);

    if (!channel || !channel.isTextBased()) return;

    await channel.send({
        embeds: [embed]
    }).catch(() => {});
}

async function getAuditEntry(guild, type, targetId) {
    try {
        const logs = await guild.fetchAuditLogs({
            type,
            limit: 5
        });

        return logs.entries.find(
            entry =>
                entry.target?.id === targetId &&
                Date.now() - entry.createdTimestamp < 10000
        );
    } catch {
        return null;
    }
}

function setupLogging(client) {
    client.on("messageDelete", async message => {
        if (!message.guild || message.author?.bot) return;

        const embed = new EmbedBuilder()
            .setTitle("Message Deleted")
            .setDescription(
                `A message was deleted in ${message.channel}.`
            )
            .addFields(
                {
                    name: "Author",
                    value: `${message.author || "Unknown"}`
                },
                {
                    name: "Content",
                    value: message.content
                        ? message.content.slice(0, 1024)
                        : "No message content available."
                }
            )
            .setTimestamp();

        await sendLog(message.guild, embed);
    });

    client.on("messageUpdate", async (oldMessage, newMessage) => {
        if (!oldMessage.guild) return;
        if (oldMessage.author?.bot) return;

        if (oldMessage.content === newMessage.content) return;

        const embed = new EmbedBuilder()
            .setTitle("Message Edited")
            .setDescription(
                `A message was edited in ${oldMessage.channel}.`
            )
            .addFields(
                {
                    name: "Author",
                    value: `${oldMessage.author || "Unknown"}`
                },
                {
                    name: "Before",
                    value: oldMessage.content
                        ? oldMessage.content.slice(0, 1024)
                        : "No content available."
                },
                {
                    name: "After",
                    value: newMessage.content
                        ? newMessage.content.slice(0, 1024)
                        : "No content available."
                }
            )
            .setTimestamp();

        await sendLog(oldMessage.guild, embed);
    });

    client.on("guildMemberAdd", async member => {
        const embed = new EmbedBuilder()
            .setTitle("Member Joined")
            .setDescription(
                `${member.user.tag} joined the server.`
            )
            .addFields({
                name: "User",
                value: `${member.user}`
            })
            .setTimestamp();

        await sendLog(member.guild, embed);
    });

    client.on("guildMemberRemove", async member => {
        const auditEntry = await getAuditEntry(
            member.guild,
            AuditLogEvent.MemberKick,
            member.id
        );

        const embed = new EmbedBuilder()
            .setTitle(auditEntry ? "Member Kicked" : "Member Left")
            .setDescription(
                auditEntry
                    ? `${member.user.tag} was kicked from the server.`
                    : `${member.user.tag} left the server.`
            )
            .addFields({
                name: "User",
                value: `${member.user}`
            });

        if (auditEntry?.executor) {
            embed.addFields({
                name: "Moderator",
                value: `${auditEntry.executor}`
            });
        }

        embed.setTimestamp();

        await sendLog(member.guild, embed);
    });

    client.on("guildBanAdd", async ban => {
        const auditEntry = await getAuditEntry(
            ban.guild,
            AuditLogEvent.MemberBanAdd,
            ban.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("Member Banned")
            .setDescription(
                `${ban.user.tag} was banned from the server.`
            )
            .addFields({
                name: "User",
                value: `${ban.user}`
            });

        if (auditEntry?.executor) {
            embed.addFields({
                name: "Moderator",
                value: `${auditEntry.executor}`
            });
        }

        if (auditEntry?.reason) {
            embed.addFields({
                name: "Reason",
                value: auditEntry.reason.slice(0, 1024)
            });
        }

        embed.setTimestamp();

        await sendLog(ban.guild, embed);
    });

    client.on("guildBanRemove", async ban => {
        const auditEntry = await getAuditEntry(
            ban.guild,
            AuditLogEvent.MemberBanRemove,
            ban.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("Member Unbanned")
            .setDescription(
                `${ban.user.tag} was unbanned.`
            )
            .addFields({
                name: "User",
                value: `${ban.user}`
            });

        if (auditEntry?.executor) {
            embed.addFields({
                name: "Moderator",
                value: `${auditEntry.executor}`
            });
        }

        embed.setTimestamp();

        await sendLog(ban.guild, embed);
    });

    client.on("roleCreate", async role => {
        if (!role.guild) return;

        const embed = new EmbedBuilder()
            .setTitle("Role Created")
            .setDescription(
                `A new role was created: ${role}.`
            )
            .addFields({
                name: "Role",
                value: `${role.name}`
            })
            .setTimestamp();

        await sendLog(role.guild, embed);
    });

    client.on("roleDelete", async role => {
        if (!role.guild) return;

        const embed = new EmbedBuilder()
            .setTitle("Role Deleted")
            .setDescription(
                `A role was deleted: ${role.name}.`
            )
            .addFields({
                name: "Role",
                value: role.name
            })
            .setTimestamp();

        await sendLog(role.guild, embed);
    });

    client.on("channelCreate", async channel => {
        if (!channel.guild) return;

        const embed = new EmbedBuilder()
            .setTitle("Channel Created")
            .setDescription(
                `A channel was created: ${channel}.`
            )
            .addFields({
                name: "Channel",
                value: channel.name
            })
            .setTimestamp();

        await sendLog(channel.guild, embed);
    });

    client.on("channelDelete", async channel => {
        if (!channel.guild) return;

        const embed = new EmbedBuilder()
            .setTitle("Channel Deleted")
            .setDescription(
                `A channel was deleted: ${channel.name}.`
            )
            .addFields({
                name: "Channel",
                value: channel.name
            })
            .setTimestamp();

        await sendLog(channel.guild, embed);
    });
}

module.exports = {
    setupLogging
};