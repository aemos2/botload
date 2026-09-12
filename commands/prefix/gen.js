const { EmbedBuilder } = require("discord.js");
const crypto = require("crypto");
const config = require("../../config");

const API_URL = "http://real.rtao.lol/api/real/auto-register/";

function randomString(length, chars) {
    const bytes = crypto.randomBytes(length);
    let out = "";
    for (let i = 0; i < length; i++) {
        out += chars[bytes[i] % chars.length];
    }
    return out;
}

function isOwner(userId) {
    const ownerId = config.ownerId || process.env.OWNER_ID;
    if (!ownerId) return false;
    return String(userId) === String(ownerId);
}

module.exports = {
    name: "gen",
    aliases: ["realgen", "genreal", "realexecutor"],
    description: "Create a Real Executor account (owner only).",

    async execute(message, args) {
        if (!isOwner(message.author.id)) {
            return;
        }

        let username = args[0] || null;
        let password = args[1] || null;
        let emailPrefix = args[2] || null;

        if (!username) {
            username = `SkibidiHub${randomString(7, "abcdefghijklmnopqrstuvwxyz0123456789")}`;
        }
        if (!password) {
            password = `SkibidiHub@${randomString(8, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")}!1`;
        }
        if (!emailPrefix) {
            emailPrefix = username;
        }

        let progress;
        try {
            progress = await message.channel.send(
                "generating..."
            );
        } catch (err) {
            console.error("[Gen] Couldnt generating:", err.message);
            return;
        }

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
                },
                body: JSON.stringify({
                    username,
                    password,
                    emailPrefix
                }),
                signal: AbortSignal.timeout(25000)
            });

            const rawText = await res.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch {
                data = { raw: rawText };
            }

            const isSuccess =
                res.status === 200 ||
                res.status === 201 ||
                (typeof data === "object" &&
                    (data.success === true ||
                        data.status === "success" ||
                        data.status === "ok" ||
                        "token" in data));

            if (isSuccess) {
                const apiSnippet = JSON.stringify(data, null, 2).slice(0, 400);

                const embed = new EmbedBuilder()
                    .setTitle("real executor account gen 24H")
                    .setColor(0x2b2d31)
                    .addFields(
                        {
                            name: "Username:",
                            value: username,
                            inline: false
                        },
                        {
                            name: "Password:",
                            value: password,
                            inline: false
                        },
                        {
                            name: "Email:",
                            value: emailPrefix,
                            inline: false
                        },
                        {
                            name: "codeblock:",
                            value: `\`\`\`json\n${apiSnippet}\n\`\`\``,
                            inline: false
                        }
                    )
                    .setFooter({ text: "Save these credentials." })
                    .setTimestamp();

                return progress.edit({ content: null, embeds: [embed] });
            }

            const errInfo =
                data.message ||
                data.error ||
                data.msg ||
                rawText.slice(0, 200) ||
                `HTTP ${res.status}`;

            const embed = new EmbedBuilder()
                .setTitle("Real Executor — Server Response")
                .setColor(0x2b2d31)
                .addFields(
                    {
                        name: "Response",
                        value: String(errInfo).slice(0, 1000),
                        inline: false
                    },
                    {
                        name: "Tried",
                        value: `Username: ${username}\nPassword: ${password}\nEmailPrefix: ${emailPrefix}`,
                        inline: false
                    }
                )
                .setFooter({ text: "Try another username: .gen myuser mypass123" })
                .setTimestamp();

            return progress.edit({ content: null, embeds: [embed] });
        } catch (err) {
            console.error("[Gen] Failed:", err.message);

            const isTimeout =
                err.name === "TimeoutError" ||
                err.name === "AbortError" ||
                /timeout/i.test(err.message);

            const embed = new EmbedBuilder()
                .setTitle(
                    isTimeout
                        ? "Real Executor Timed Out"
                        : "Connection Failure"
                )
                .setColor(0x2b2d31)
                .setDescription(
                    isTimeout
                        ? "The Real Executor server did not respond in time. It may be offline or under load."
                        : String(err.message).slice(0, 500)
                )
                .addFields({
                    name: "Generated Credentials",
                    value: `Username: ${username}\nPassword: ${password}\nEmailPrefix: ${emailPrefix}`,
                    inline: false
                })
                .setTimestamp();

            return progress.edit({ content: null, embeds: [embed] }).catch(() => {});
        }
    }
};
