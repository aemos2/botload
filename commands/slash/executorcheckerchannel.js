const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    MessageFlags
} = require("discord.js");

const {
    setExecutorChannel,
    removeExecutorChannel,
    getExecutorChannel
} = require("../../utils/executorChecker");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("executorcheckerchannel")
        .setDescription(
            "Set or clear the channel used for executor update notifications."
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription(
                    "Text channel for executor update notifications. Omit to disable."
                )
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        if (!channel) {
            const existing = getExecutorChannel(interaction.guild.id);
            if (!existing) {
                return interaction.reply({
                    content: "No notification channel is currently set.",
                    flags: MessageFlags.Ephemeral
                });
            }

            removeExecutorChannel(interaction.guild.id);
            return interaction.reply({
                content: "Executor update notifications have been disabled.",
                flags: MessageFlags.Ephemeral
            });
        }

        setExecutorChannel(interaction.guild.id, channel.id);

        await interaction.reply({
            content: `Executor update notifications will be sent to ${channel}.`
        });
    }
};
