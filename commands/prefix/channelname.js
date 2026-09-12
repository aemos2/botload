const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "channelname",
    description: "Change the current channel name",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply("You need the Manage Channels permission.");
        }

        const name = args.join("-").toLowerCase();

        if (!name) {
            return message.reply("Usage: `?channelname <name>`");
        }

        try {
            await message.channel.setName(name);

            await message.reply(
                `Channel renamed to **${name}**.`
            );
        } catch (error) {
            console.error(error);
            await message.reply("Failed to rename the channel.");
        }
    }
};