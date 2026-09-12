const {
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    name: "lock",
    description: "Locks the current channel.",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply(
                "You need the Manage Channels permission to use this command."
            );
        }

        try {
            await message.channel.permissionOverwrites.edit(
                message.guild.roles.everyone,
                {
                    SendMessages: false
                }
            );

            await message.reply(
                "shut yall ass up."
            );
        } catch (error) {
            console.error("Lock command error:", error);

            await message.reply(
                "I couldn't lock this channel."
            );
        }
    }
};