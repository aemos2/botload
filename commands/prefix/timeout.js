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

function parseDuration(input) {
    const match = /^(\d+)(s|m|h|d)$/i.exec(input);

    if (!match) return null;

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return amount * multipliers[unit];
}

module.exports = {
    name: "timeout",

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

        const duration = parseDuration(args[1]);

        if (!duration) {
            return message.reply(
                "Usage: ?timeout @user <duration> [reason]\nExample: ?timeout @user 30m spamming"
            );
        }

        const maxDuration =
            28 * 24 * 60 * 60 * 1000;

        if (duration > maxDuration) {
            return message.reply(
                "The maximum timeout duration is 28 days."
            );
        }

        const reason =
            args.slice(2).join(" ") ||
            "No reason provided.";

        try {
            await target.timeout(
                duration,
                reason
            );

            addHistory(
                message.guild.id,
                target.id,
                {
                    action: "Timeout",
                    moderator: message.author.tag,
                    reason,
                    duration: args[1]
                }
            );

            await sendModLog(message.guild, {
                title: "Took your tongue out, u cant talk now be quiet.",
                user: `${target.user}`,
                moderator: `${message.author}`,
                reason,
                extra: [
                    {
                        name: "Duration",
                        value: args[1],
                        inline: true
                    }
                ]
            });

            return message.reply(
                `${target.user.tag} has been timed out for ${args[1]}.`
            );
        } catch {
            return message.reply(
                "I could not timeout that member."
            );
        }
    }
};