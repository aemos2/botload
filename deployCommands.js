require("dotenv").config({ override: true });

const { REST, Routes } = require("discord.js");
const { commands } = require("./handlers/slashHandler");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
    try {
        console.log(`Deploying ${commands.length} slash command(s)...`);

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log("Slash commands deployed successfully.");
    } catch (error) {
        console.error("Failed to deploy slash commands:", error);
    }
}

deployCommands();