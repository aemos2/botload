module.exports = {
    name: "help",
    aliases: ["h"],
    description: "Shows available commands.",

    async execute(message) {
        const prefix = message.client.prefix || "?";

        const helpMessage = [
            `${prefix}exploits - list all executors`,
            `${prefix}solara - Solara info`,
            `${prefix}real - Real info`,
            `${prefix}delta - Delta info (or bypass with a URL)`,
            `Any executor name works (e.g. ${prefix}wave, ${prefix}potassium)`,
            `/executorcheckerchannel - set executor update channel`,
            `/robloxversionchannel - set Roblox version channel (optional platforms)`,
            "",
            `Prefix: ${prefix}`
        ].join("\n");

        await message.reply({
            content: `commands:\n\`\`\`\n${helpMessage}\n\`\`\``
        });
    }
};
