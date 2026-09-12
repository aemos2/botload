const {
    PermissionFlagsBits
} = require("discord.js");

const {
    getHistory
} = require("../../utils/history");

module.exports = {
    name: "history",

    async execute(message) {
        if (
            !message.member.permissions.has(
                PermissionFlagsBits.ModerateMembers
            )
        ) {
            return message.reply(
                "You do not have permission to use this command."
            );
        }

        const user =
            message.mentions.users.first();

        if (!user) {
            return message.reply(
                "Please mention a user."
            );
        }

        const history = getHistory(
            message.guild.id,
            user.id
        );

        if (history.length === 0) {
            return message.reply(
                `${user.tag} has no moderation history.`
            );
        }

        const entries = history
            .slice(-10)
            .reverse()
            .map((entry, index) => {
                const date = new Date(
                    entry.timestamp
                ).toLocaleString();

                return `${index + 1}. **${entry.action}** | ${date}\n${entry.reason || "No reason provided."}`;
            });

        return message.reply(
            `**Moderation history for ${user.tag}**\n\n${entries.join("\n\n")}`
        );
    }
};