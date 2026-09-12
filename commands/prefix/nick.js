const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "nick",
    description: "Change a member's nickname",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
            return message.reply("You need the Manage Nicknames permission.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("Usage: `?nick @user <nickname>`");
        }

        const nickname = args.slice(1).join(" ");

        if (!nickname) {
            return message.reply("Provide a nickname.");
        }

        if (!member.manageable) {
            return message.reply("I cannot change that member's nickname.");
        }

        try {
            await member.setNickname(
                nickname,
                `Changed by ${message.author.tag}`
            );

            await message.reply(
                `Changed **${member.user.tag}**'s nickname to **${nickname}**.`
            );
        } catch (error) {
            console.error(error);
            await message.reply("Failed to change the nickname.");
        }
    }
};