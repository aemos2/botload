const {
    PermissionFlagsBits
} = require("discord.js");

const {
    getWarnings,
    clearWarnings
} = require("../../utils/moderation");

module.exports = {
    name: "delwarn",
    aliases: ["clearwarns"],
    description: "Clears all warnings from a member.",

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

        const warnings = getWarnings(
            message.guild.id,
            member.id
        );

        if (warnings.length === 0) {
            return message.reply(
                `${member.user.tag} has no warnings.`
            );
        }

        clearWarnings(
            message.guild.id,
            member.id
        );

        await message.reply(
            `Cleared all warnings for ${member.user.tag}.`
        );
    }
};