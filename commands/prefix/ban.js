const {
    PermissionFlagsBits
} = require("discord.js");

const {
    getTargetMember,
    canModerate
} = require("../../utils/moderationSafety");

const {
    addHistory
} = require("../../utils/history");

const {
    sendModLog
} = require("../../utils/modLog");

module.exports = {
    name: "ban",

    async execute(message, args) {
        if (
            !message.member.permissions.has(
                PermissionFlagsBits.BanMembers
            )
        ) {
            return message.reply(
                "You do not have permission to use this command."
            );
        }

        const target = getTargetMember(message);
        const check = canModerate(message, target);

        if (!check.allowed) {
            return message.reply(check.reason);
        }

        const reason =
            args.slice(1).join(" ") ||
            "No reason provided.";

        try {
            await target.ban({
                reason
            });

            addHistory(
                message.guild.id,
                target.id,
                {
                    action: "Ban",
                    moderator: message.author.tag,
                    reason
                }
            );

            await sendModLog(message.guild, {
                title: "slammed his ass sobad he cant get back in",
                user: `${target.user}`,
                moderator: `${message.author}`,
                reason
            });

            return message.reply(
                `${target.user.tag} has been banned.`
            );
        } catch {
            return message.reply(
                "I could not ban that member."
            );
        }
    }
};