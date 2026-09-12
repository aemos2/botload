const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "nuke",
    description: "Recreate the current channel",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply("You need the Manage Channels permission.");
        }

        const channel = message.channel;

        try {
            const newChannel = await channel.clone({
                reason: `Nuked by ${message.author.tag}`
            });

            await newChannel.setPosition(channel.position);

            await channel.delete(
                `Nuked by ${message.author.tag}`
            );

            await newChannel.send(
                "Channel nuked."
            );
        } catch (error) {
            console.error(error);
            await message.reply("Failed to nuke this channel.");
        }
    }
};