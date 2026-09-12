const fs = require("fs");
const path = require("path");

const {
    hasCommandRole
} = require("../utils/commandPermissions");

const commands = new Map();

const commandsPath = path.join(
    __dirname,
    "..",
    "commands",
    "prefix"
);

const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(
        path.join(commandsPath, file)
    );

    if (!command.name || !command.execute) continue;

    commands.set(
        command.name,
        command
    );

    if (command.aliases) {
        for (const alias of command.aliases) {
            commands.set(alias, command);
        }
    }
}

async function executePrefixCommand(
    command,
    message,
    args
) {
    if (
        !hasCommandRole(
            message.member,
            command.name
        )
    ) {
        return message.reply(
            "You do not have the required role to use this command."
        );
    }

    return command.execute(
        message,
        args,
        commands
    );
}

module.exports = {
    commands,
    executePrefixCommand
};