const {
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const {
    addHistory
} = require("../../utils/history");

const filePath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "tempbans.json"
);

function loadTempBans() {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, "{}");
        }

        return JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );
    } catch {
        return {};
    }
}

function saveTempBans(data) {
    fs.writeFileSync(
        filePath,
        JSON.stringify(data, null, 4)
    );
}

function parseDuration(input) {
    const match = /^(\d+)(s|m|h|d|w)$/i.exec(input);

    if (!match) return null;

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000
    };

    return amount * multipliers[unit];
}

module.exports = {
    name: "tempban",

    async execute(message, args) {
        if (
            !message.member.permissions.has(
                PermissionFlagsBits.BanMembers
            )
        ) {
            return message.reply(
                "You do not have permission to use this command."
            );
        }

        const user =
            message.mentions.users.first();

        if (!user) {
            return message.reply(
                "Usage: ?tempban @user <duration> [reason]"
            );
        }

        const duration =
            parseDuration(args[1]);

        if (!duration) {
            return message.reply(
                "Invalid duration. Use `30m`, `2h`, `7d`, or `1w`."
            );
        }

        const maxDuration =
            28 * 24 * 60 * 60 * 1000;

        if (duration > maxDuration) {
            return message.reply(
                "The maximum temporary ban duration is 28 days."
            );
        }

        if (user.id === message.author.id) {
            return message.reply(
                "You cannot tempban yourself."
            );
        }

        const member =
            await message.guild.members
                .fetch(user.id)
                .catch(() => null);

        if (
            member &&
            !member.bannable
        ) {
            return message.reply(
                "I cannot ban that user."
            );
        }

        const reason =
            args.slice(2).join(" ") ||
            "No reason provided.";

        const expiresAt =
            Date.now() + duration;

        const data = loadTempBans();

        if (!data[message.guild.id]) {
            data[message.guild.id] = {};
        }

        data[message.guild.id][user.id] = {
            expiresAt,
            moderatorId: message.author.id,
            reason
        };

        saveTempBans(data);

        await message.guild.members.ban(
            user.id,
            {
                reason
            }
        );

        addHistory(
            message.guild.id,
            user.id,
            {
                action: "Temporary Ban",
                moderator: message.author.tag,
                reason,
                duration: args[1]
            }
        );

        return message.reply(
            `${user.tag} has been temporarily banned for ${args[1]}.`
        );
    }
};