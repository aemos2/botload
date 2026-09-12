const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    getAutoMod,
    updateAutoMod
} = require("../../utils/automod");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Configures the server AutoMod system.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.ManageGuild
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("status")
                .setDescription("Shows the current AutoMod settings.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("enable")
                .setDescription("Enables AutoMod.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("disable")
                .setDescription("Disables AutoMod.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("caps")
                .setDescription("Toggles excessive caps protection.")
                .addBooleanOption(option =>
                    option
                        .setName("enabled")
                        .setDescription("Enable or disable caps protection.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("spam")
                .setDescription("Toggles spam protection.")
                .addBooleanOption(option =>
                    option
                        .setName("enabled")
                        .setDescription("Enable or disable spam protection.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("links")
                .setDescription("Toggles link filtering.")
                .addBooleanOption(option =>
                    option
                        .setName("enabled")
                        .setDescription("Enable or disable link filtering.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("invites")
                .setDescription("Toggles Discord invite filtering.")
                .addBooleanOption(option =>
                    option
                        .setName("enabled")
                        .setDescription("Enable or disable invite filtering.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("massmention")
                .setDescription("Toggles mass mention protection.")
                .addBooleanOption(option =>
                    option
                        .setName("enabled")
                        .setDescription("Enable or disable mass mention protection.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("keyword")
                .setDescription("Adds a blocked keyword.")
                .addStringOption(option =>
                    option
                        .setName("word")
                        .setDescription("The keyword to block.")
                        .setRequired(true)
                        .setMaxLength(100)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("removekeyword")
                .setDescription("Removes a blocked keyword.")
                .addStringOption(option =>
                    option
                        .setName("word")
                        .setDescription("The keyword to remove.")
                        .setRequired(true)
                        .setMaxLength(100)
                )
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const subcommand = interaction.options.getSubcommand();
        const settings = getAutoMod(guildId);

        if (subcommand === "status") {
            return interaction.reply({
                content: [
                    `Enabled: ${settings.enabled ? "Yes" : "No"}`,
                    `Caps: ${settings.caps ? "Enabled" : "Disabled"}`,
                    `Spam: ${settings.spam ? "Enabled" : "Disabled"}`,
                    `Links: ${settings.links ? "Enabled" : "Disabled"}`,
                    `Invites: ${settings.invites ? "Enabled" : "Disabled"}`,
                    `Mass mentions: ${settings.massMention ? "Enabled" : "Disabled"}`,
                    `Blocked keywords: ${settings.keywords.length}`
                ].join("\n")
            });
        }

        if (subcommand === "enable") {
            updateAutoMod(guildId, {
                enabled: true
            });

            return interaction.reply(
                "AutoMod has been enabled."
            );
        }

        if (subcommand === "disable") {
            updateAutoMod(guildId, {
                enabled: false
            });

            return interaction.reply(
                "AutoMod has been disabled."
            );
        }

        const booleanSettings = {
            caps: "Excessive caps protection",
            spam: "Spam protection",
            links: "Link filtering",
            invites: "Discord invite filtering",
            massmention: "Mass mention protection"
        };

        if (booleanSettings[subcommand]) {
            const enabled =
                interaction.options.getBoolean("enabled");

            const property =
                subcommand === "massmention"
                    ? "massMention"
                    : subcommand;

            updateAutoMod(guildId, {
                [property]: enabled
            });

            return interaction.reply(
                `${booleanSettings[subcommand]} has been ${enabled ? "enabled" : "disabled"}.`
            );
        }

        if (subcommand === "keyword") {
            const word = interaction.options
                .getString("word")
                .trim()
                .toLowerCase();

            if (!word) {
                return interaction.reply(
                    "Please provide a valid keyword."
                );
            }

            if (settings.keywords.includes(word)) {
                return interaction.reply(
                    "That keyword is already blocked."
                );
            }

            if (settings.keywords.length >= 100) {
                return interaction.reply(
                    "You can only have 100 blocked keywords."
                );
            }

            updateAutoMod(guildId, {
                keywords: [
                    ...settings.keywords,
                    word
                ]
            });

            return interaction.reply(
                `Added \`${word}\` to the blocked keyword list.`
            );
        }

        if (subcommand === "removekeyword") {
            const word = interaction.options
                .getString("word")
                .trim()
                .toLowerCase();

            if (!settings.keywords.includes(word)) {
                return interaction.reply(
                    "That keyword is not blocked."
                );
            }

            updateAutoMod(guildId, {
                keywords: settings.keywords.filter(
                    keyword => keyword !== word
                )
            });

            return interaction.reply(
                `Removed \`${word}\` from the blocked keyword list.`
            );
        }
    }
};