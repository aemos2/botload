const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "unban",
    description: "Unban a user",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply("You need the Ban Members permission.");
        }

        const userId = args[0];

        if (!userId || !/^\d{17,20}$/.test(userId)) {
            return message.reply("Usage: `?unban <userID> [reason]`");
        }

        const reason = args.slice(1).join(" ") || "No reason provided.";

        try {
            await message.guild.members.unban(userId, reason);

            await message.reply(
                `sorry for being arrogant banner, you are unbanned now **${userId}**.\nReason: ${reason}`
            );
        } catch (error) {
            if (error.code === 10026) {
                return message.reply("That user is not banned.");
            }

            console.error(error);
            await message.reply("Failed to unban that user.");
        }
    }
};