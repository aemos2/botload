const {
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    name: "unlock",
    description: "Unlocks the current channel.",

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
                    SendMessages: null
                }
            );

            await message.reply(
                "This channel has been unlocked."
            );
        } catch (error) {
            console.error("Unlock command error:", error);

            await message.reply(
                "I couldn't unlock this channel."
            );
        }
    }
};