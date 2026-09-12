const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "softban",
    description: "Ban and immediately unban a member",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply("You need the Ban Members permission.");
        }

        const member = message.mentions.members.first();

        if (!member) {
            return message.reply("Usage: `?softban @user [reason]`");
        }

        if (member.id === message.author.id) {
            return message.reply("You cannot softban yourself.");
        }

        if (!member.bannable) {
            return message.reply("I cannot ban that member.");
        }

        const reason = args.slice(1).join(" ") || "No reason provided.";

        try {
            await member.ban({
                deleteMessageSeconds: 604800,
                reason
            });

            await message.guild.members.unban(
                member.id,
                `Softban: ${reason}`
            );

            await message.reply(
                `im sorry you gonna get banned and unbanned :D **${member.user.tag}**.\nReason: ${reason}`
            );
        } catch (error) {
            console.error(error);
            await message.reply("Failed to softban that member.");
        }
    }
};