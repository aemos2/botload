const { EmbedBuilder } = require("discord.js");
const { fetchExecutorByName, buildExecutorEmbed } = require("./executor");

const URL_REGEX = /https?:\/\/[^\s<>()]+/i;
const BYPASS_API = "https://novahub-jj73.onrender.com/api/bypass";

module.exports = {
    name: "db",
    aliases: ["dbs", "dbsc", "dltbypass"],
    description: "Delta key bypass, or Delta executor info if no URL is given.",

    async execute(message, args) {
        const joined = args.join(" ").trim();
        const match = joined ? URL_REGEX.exec(joined) : null;

        // No URL → show Delta executor info
        if (!match) {
            try {
                const data = await fetchExecutorByName("Delta");
                if (!data) {
                    return message.reply(
                        "Provide a validation URL for bypass, or wait until Delta is listed.\nExample: `.delta https://gateway.platoboost.com/a/...`"
                    );
                }
                const { embed, components } = buildExecutorEmbed(data);
                return message.reply({ embeds: [embed], components });
            } catch (err) {
                console.error("[Delta] Info lookup failed:", err.message);
                return message.reply("Failed to fetch Delta info.");
            }
        }

        const targetUrl = match[0];
        const progress = await message.reply("Connecting to the bypass service...");

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
                    .setTitle("Bypass Completed")
                    .setColor(0x2b2d31)
                    .addFields(
                        {
                            name: "Link",
                            value: targetUrl.length > 100
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
            console.error("[Delta] Bypass failed:", err.message);

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
