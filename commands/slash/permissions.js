const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    setCommandRole,
    removeCommandRole,
    getServerConfig
} = require("../../utils/serverConfig");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("permissions")
        .setDescription("Configures command role restrictions.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("Restricts a command to a role.")
                .addStringOption(option =>
                    option
                        .setName("command")
                        .setDescription("The command name.")
                        .setRequired(true)
                        .setMaxLength(32)
                )
                .addRoleOption(option =>
                    option
                        .setName("role")
                        .setDescription("The required role.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("Removes a command role restriction.")
                .addStringOption(option =>
                    option
                        .setName("command")
                        .setDescription("The command name.")
                        .setRequired(true)
                        .setMaxLength(32)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("Shows configured command permissions.")
        ),

    async execute(interaction) {
        const subcommand =
            interaction.options.getSubcommand();

        if (subcommand === "set") {
            const command = interaction.options
                .getString("command")
                .toLowerCase();

            const role = interaction.options.getRole("role");

            setCommandRole(
                interaction.guild.id,
                command,
                role.id
            );

            return interaction.reply(
                `The \`${command}\` command now requires ${role}.`
            );
        }

        if (subcommand === "remove") {
            const command = interaction.options
                .getString("command")
                .toLowerCase();

            removeCommandRole(
                interaction.guild.id,
                command
            );

            return interaction.reply(
                `The role restriction for \`${command}\` has been removed.`
            );
        }

        if (subcommand === "list") {
            const config = getServerConfig(
                interaction.guild.id
            );

            const entries = Object.entries(
                config.commandRoles
            );

            if (entries.length === 0) {
                return interaction.reply(
                    "No command role restrictions are configured."
                );
            }

            const list = entries
                .map(
                    ([command, roleId]) =>
                        `\`${command}\` - <@&${roleId}>`
                )
                .join("\n");

            return interaction.reply({
                content: `Command permissions:\n${list}`
            });
        }
    }
};