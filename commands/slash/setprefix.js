const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    MessageFlags
} = require("discord.js");

const {
    setPrefix
} = require("../../utils/prefixes");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setprefix")
        .setDescription("Change the prefix for this server")
        .addStringOption(option =>
            option
                .setName("prefix")
                .setDescription("The new prefix")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(3)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild.toString()
        ),

    async execute(interaction) {
        const prefix = interaction.options.getString("prefix");

        if (!interaction.guild) {
            return interaction.reply({
                content: "This command can only be used in a server.",
                flags: MessageFlags.Ephemeral
            });
        }

        if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({
                content: "You need Manage Server permission to use this command.",
                flags: MessageFlags.Ephemeral
            });
        }

        if (/\s/.test(prefix)) {
            return interaction.reply({
                content: "The prefix cannot contain spaces.",
                flags: MessageFlags.Ephemeral
            });
        }

        setPrefix(interaction.guild.id, prefix);

        await interaction.reply(
            `Server prefix has been changed to \`${prefix}\`.`
        );
    }
};
