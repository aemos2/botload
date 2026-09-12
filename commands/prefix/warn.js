const {
    PermissionFlagsBits
} = require("discord.js");

const {
    getTargetMember,
    canModerate
} = require("../../utils/moderationSafety");

const {
    addWarning
} = require("../../utils/moderation");

const {
    addHistory
} = require("../../utils/history");

const {
    sendModLog
} = require("../../utils/modLog");

module.exports = {
    name: "warn",

    async execute(message, args) {
        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ModerateMembers
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

        const warning = {
            moderator: message.author.tag,
            reason,
            timestamp: Date.now()
        };

        try {
            const warnings = addWarning(
                message.guild.id,
                target.id,
                warning
            );

            addHistory(
                message.guild.id,
                target.id,
                {
                    action: "Warning",
                    moderator: message.author.tag,
                    reason
                }
            );

            await sendModLog(message.guild, {
                title: "Member Warned",
                user: `${target.user}`,
                moderator: `${message.author}`,
                reason,
                extra: [
                    {
                        name: "Total Warnings",
                        value: `${warnings.length}`,
                        inline: true
                    }
                ]
            });

            return message.reply(
                `${target.user.tag} has been warned. They now have ${warnings.length} warning(s).`
            );
        } catch {
            return message.reply(
                "I could not warn that member."
            );
        }
    }
};