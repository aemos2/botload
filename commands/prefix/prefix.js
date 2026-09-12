module.exports = {
    name: "ping",
    aliases: ["p"],
    description: "Check the bot's latency",

    async execute(message) {
        const sent = await message.reply("Pinging...");
        const latency = sent.createdTimestamp - message.createdTimestamp;

        await sent.edit(`${latency}ms`);
    }
};