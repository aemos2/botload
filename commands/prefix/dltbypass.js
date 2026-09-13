const { EmbedBuilder } = require("discord.js");

const URL_REGEX = /https?:\/\/[^\s<>()]+/i;
const BYPASS_API = "https://novahub-jj73.onrender.com/api/bypass";

module.exports = {
    name: "dltbypass",
    aliases: [],
    description: "Delta key bypass. Usage: .dltbypass <url>",

    async execute(message, args) {
        const joined = args.join(" ").trim();
        const match = joined ? URL_REGEX.exec(joined) : null;

        if (!match) {
            return message.channel.send(
                "put your Delta website link to bypass.\nExample: `.dltbypass https://gateway.platoboost.com/a/...`"
            );
        }

        const targetUrl = match[0];
        const progress = await message.channel.send(
            "bypassing..."
        );

        try {
            const res = await fetch(BYPASS_API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Octobot/1.0"
                },
                body: JSON.stringify({ url: targetUrl, lootResult: "" }),
                signal: AbortSignal.timeout(90000)
            });

            let data;
            try {
                data = await res.json();
            } catch {
                data = {};
            }

            const keyResult =
                data.result || data.key || data.bypassed || null;

            if (data.success || keyResult) {
                const embed = new EmbedBuilder()
                    .setTitle("done.")
                    .setColor(0x2b2d31)
                    .addFields(
                        {
                            name: "Link",
                            value:
                                targetUrl.length > 100
                                    ? targetUrl.slice(0, 100) + "..."
                                    : targetUrl,
                            inline: false
                        },
                        {
                            name: "Key / Result",
                            value: `\`\`\`\n${String(keyResult).slice(0, 1000)}\n\`\`\``,
                            inline: false
                        }
                    )
                    .setTimestamp();

                return progress.edit({ content: null, embeds: [embed] });
            }

            const errDesc =
                data.message ||
                data.error ||
                "Unable to resolve the provided link.";

            const embed = new EmbedBuilder()
                .setTitle("Bypass Failed")
                .setColor(0x2b2d31)
                .setDescription(String(errDesc).slice(0, 1000))
                .setTimestamp();

            return progress.edit({ content: null, embeds: [embed] });
        } catch (err) {
            console.error("[Bypass] Failed:", err.message);

            const isTimeout =
                err.name === "TimeoutError" ||
                err.name === "AbortError" ||
                /timeout/i.test(err.message);

            const embed = new EmbedBuilder()
                .setTitle(isTimeout ? "Timed Out" : "Bypass Error")
                .setColor(0x2b2d31)
                .setDescription(
                    isTimeout
                        ? "The bypass service took too long to respond."
                        : String(err.message).slice(0, 500)
                )
                .setTimestamp();

            return progress.edit({ content: null, embeds: [embed] }).catch(() => {});
        }
    }
};
