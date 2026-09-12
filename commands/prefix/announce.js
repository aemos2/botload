const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "announce",
    description: "Send an announcement",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply("You need the Manage Messages permission.");
        }

        const content = args.join(" ");

        if (!content) {
            return message.reply("Usage: `?announce <message>`");
        }

        await message.delete().catch(() => {});

        await message.channel.send({
            content: `# Announcement\n\n${content}\n\n-# Announced by ${message.author}`
        });
    }
};