const { PermissionFlagsBits } = require("discord.js");
const { getWarnings } = require("../../utils/moderation");

module.exports = {
    name: "warnings",
    description: "View member warnings",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply("You need the Moderate Members permission.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("Usage: `?warnings @user`");
        }

        const warnings = getWarnings(
            message.guild.id,
            member.id
        );

        if (!warnings.length) {
            return message.reply(
                `**${member.user.tag}** has no warnings.`
            );
        }

        const output = warnings
            .map((warning, index) => {
                const date = `<t:${Math.floor(warning.timestamp / 1000)}:R>`;

                return `${index + 1}. ${warning.reason} - <@${warning.moderator}> ${date}`;
            })
            .join("\n");

        await message.reply(
            `look at this ninjas warning, bro u better behave yourself **${member.user.tag}**:\n\n${output}`
        );
    }
};