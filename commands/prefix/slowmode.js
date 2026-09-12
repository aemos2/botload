const {
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    name: "slowmode",
    aliases: ["slow"],
    description: "Sets the channel slowmode.",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply(
                "You need the Manage Channels permission to use this command."
            );
        }

        const seconds = Number(args[0]);

        if (!Number.isInteger(seconds) || seconds < 0 || seconds > 21600) {
            return message.reply(
                "Please provide a number between 0 and 21600 seconds."
            );
        }

        try {
            await message.channel.setRateLimitPerUser(seconds);

            await message.reply(
                seconds === 0
                    ? "Slowmode has been disabled."
                    : `Slowmode has been set to ${seconds} second(s).`
            );
        } catch (error) {
            console.error("Slowmode command error:", error);

            await message.reply(
                "I couldn't change the slowmode."
            );
        }
    }
};