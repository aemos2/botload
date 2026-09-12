const {
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    name: "clear",
    aliases: ["purge", "clean"],
    description: "Deletes a specified number of messages.",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply(
                "You need the Manage Messages permission to use this command."
            );
        }

        const amount = Number(args[0]);

        if (!Number.isInteger(amount) || amount < 1 || amount > 99) {
            return message.reply(
                "Please provide a number between 1 and 99."
            );
        }

        try {
            const deleted = await message.channel.bulkDelete(
                amount + 1,
                true
            );

            const count = Math.max(0, deleted.size - 1);

            const reply = await message.channel.send(
                `Deleted ${count} message(s).`
            );

            setTimeout(() => {
                reply.delete().catch(() => {});
            }, 3000);
        } catch (error) {
            console.error("Clear command error:", error);

            await message.reply(
                "I couldn't delete those messages. Make sure I have the Manage Messages permission."
            ).catch(() => {});
        }
    }
};