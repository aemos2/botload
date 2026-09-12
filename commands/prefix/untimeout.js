const {
    PermissionFlagsBits
} = require("discord.js");

const {
    sendModLog
} = require("../../utils/modLog");

module.exports = {
    name: "untimeout",
    aliases: ["unmute"],
    description: "Removes a member's timeout.",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply(
                "You need the Moderate Members permission to use this command."
            );
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply(
                "Please mention a member."
            );
        }

        if (!member.moderatable) {
            return message.reply(
                "I cannot remove that member's timeout."
            );
        }

        try {
            await member.timeout(
                null,
                `Timeout removed by ${message.author.tag}`
            );

            await message.reply(
                `Removed the timeout from ${member.user.tag}.`
            );

            await sendModLog(message.guild, {
                title: "you can now bark",
                user: `${member.user}`,
                moderator: `${message.author}`
            });
        } catch (error) {
            console.error("Untimeout command error:", error);

            await message.reply(
                "I couldn't remove that member's timeout."
            );
        }
    }
};