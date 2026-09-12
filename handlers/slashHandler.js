const fs = require("fs");
const path = require("path");

const commands = [];
const commandMap = new Map();

const commandsPath = path.join(__dirname, "..", "commands", "slash");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));

    if (!command.data || !command.execute) continue;

    commands.push(command.data.toJSON());
    commandMap.set(command.data.name, command);
}

module.exports = {
    commands,
    commandMap
};