const {
    getAutoMod
} = require("../utils/automod");

const {
    sendModLog
} = require("../utils/modLog");

const spamTracker = new Map();
const duplicateTracker = new Map();

function isSpam(message) {
    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();

    const timestamps = spamTracker.get(key) || [];

    const recent = timestamps.filter(
        timestamp => now - timestamp < 5000
    );

    recent.push(now);

    spamTracker.set(key, recent);

    return recent.length >= 6;
}

function isDuplicate(message) {
    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();

    const content = message.content
        .trim()
        .toLowerCase();

    if (!content) return false;

    const previous = duplicateTracker.get(key);

    duplicateTracker.set(key, {
        content,
        timestamp: now
    });

    if (!previous) return false;

    return (
        previous.content === content &&
        now - previous.timestamp < 5000
    );
}

function isExcessiveCaps(content) {
    const letters = content.match(/[a-zA-Z]/g);

    if (!letters || letters.length < 10) {
        return false;
    }

    const uppercase = letters.filter(
        letter => letter === letter.toUpperCase()
    ).length;

    return uppercase / letters.length >= 0.8;
}

function containsKeyword(content, keywords) {
    const lowerContent = content.toLowerCase();

    return keywords.some(keyword =>
        lowerContent.includes(keyword.toLowerCase())
    );
}

function containsInvite(content) {
    return /(discord\.gg\/|discord\.com\/invite\/)/i.test(
        content
    );
}

function containsLink(content) {
    return /https?:\/\/\S+/i.test(content);
}

function hasMassMention(message) {
    return (
        message.mentions.everyone ||
        message.mentions.users.size >= 5 ||
        message.mentions.roles.size >= 5
    );
}

function setupAutoMod(client) {
    client.on("messageCreate", async message => {
        if (!message.guild) return;
        if (message.author.bot) return;

        const settings = getAutoMod(
            message.guild.id
        );

        if (!settings.enabled) return;

        let violation = null;

        if (
            settings.keywords.length > 0 &&
            containsKeyword(
                message.content,
                settings.keywords
            )
        ) {
            violation = "Blocked keyword";
        }

        if (
            !violation &&
            settings.invites &&
            containsInvite(message.content)
        ) {
            violation = "Discord invite";
        }

        if (
            !violation &&
            settings.links &&
            containsLink(message.content)
        ) {
            violation = "Blocked link";
        }

        if (
            !violation &&
            settings.caps &&
            isExcessiveCaps(message.content)
        ) {
            violation = "Excessive caps";
        }

        if (
            !violation &&
            settings.spam &&
            isSpam(message)
        ) {
            violation = "Spam";
        }

        if (
            !violation &&
            settings.spam &&
            isDuplicate(message)
        ) {
            violation = "Duplicate message";
        }

        if (
            !violation &&
            settings.massMention &&
            hasMassMention(message)
        ) {
            violation = "Mass mention";
        }

        if (!violation) return;

        try {
            await message.delete();

            await sendModLog(message.guild, {
                title: "AutoMod Action",
                user: `${message.author}`,
                moderator: "AutoMod",
                reason: violation,
                extra: [
                    {
                        name: "Channel",
                        value: `${message.channel}`,
                        inline: true
                    }
                ]
            });
        } catch (error) {
            console.error(
                "AutoMod error:",
                error
            );
        }
    });
}

module.exports = {
    setupAutoMod
};