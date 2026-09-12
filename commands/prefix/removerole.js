const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "removerole",
    description: "Remove a role from a member",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply("You need the Manage Roles permission.");
        }

        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!member || !role) {
            return message.reply(
                "Usage: `?removerole @user @role`"
            );
        }

        if (role.managed) {
            return message.reply("That role is managed by an integration.");
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("That role is higher than or equal to my highest role.");
        }

        if (role.position >= message.member.roles.highest.position) {
            return message.reply("You cannot manage a role higher than or equal to your highest role.");
        }

        if (!member.roles.cache.has(role.id)) {
            return message.reply("That member does not have this role.");
        }

        try {
            await member.roles.remove(
                role,
                `Removed by ${message.author.tag}`
            );

            await message.reply(
                `Removed **${role.name}** from **${member.user.tag}**.`
            );
        } catch (error) {
            console.error(error);
            await message.reply("Failed to remove the role.");
        }
    }
};