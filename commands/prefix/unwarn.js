const {
    PermissionFlagsBits
} = require("discord.js");

const {
    getWarnings,
    clearWarnings,
    addWarning
} = require("../../utils/moderation");

const fs = require("fs");
const path = require("path");

const filePath = path.join(
    __dirname,
    "..",
    "..",
    "data",
    "warnings.json"
);

module.exports = {
    name: "unwarn",
    description: "Removes a specific warning from a member.",

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply(
                "You need the Moderate Members permission to use this command."
            );
        }

        const member = message.mentions.members.first();
        const warningNumber = Number(args[1]);

        if (!member) {
            return message.reply(
                "Please mention a member."
            );
        }

        if (!Number.isInteger(warningNumber) || warningNumber < 1) {
            return message.reply(
                "Please provide a valid warning number."
            );
        }

        const warnings = getWarnings(
            message.guild.id,
            member.id
        );

        if (!warnings[warningNumber - 1]) {
            return message.reply(
                "That warning does not exist."
            );
        }

        warnings.splice(warningNumber - 1, 1);

        let data = {};

        try {
            if (fs.existsSync(filePath)) {
                data = JSON.parse(
                    fs.readFileSync(filePath, "utf8")
                );
            }
        } catch {
            return message.reply(
                "I couldn't update the warnings."
            );
        }

        if (!data[message.guild.id]) {
            data[message.guild.id] = {};
        }

        if (warnings.length === 0) {
            delete data[message.guild.id][member.id];
        } else {
            data[message.guild.id][member.id] = warnings;
        }

        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, 4)
        );

        await message.reply(
            `Removed warning #${warningNumber} from ${member.user.tag}.`
        );
    }
};