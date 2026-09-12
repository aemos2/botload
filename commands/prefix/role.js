const { PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "role",
    description: "Add a role to a member",

    async execute(message) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return message.reply("You need the Manage Roles permission.");
        }

        const member = message.mentions.members.first();
        const role = message.mentions.roles.first();

        if (!member || !role) {
            return message.reply(
                "Usage: `?role @user @role`"
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

        if (member.roles.cache.has(role.id)) {
            return message.reply("That member already has this role.");
        }

        try {
            await member.roles.add(
                role,
                `Added by ${message.author.tag}`
            );

            await message.reply(
                `Added **${role.name}** to **${member.user.tag}**.`
            );
        } catch (error) {
            console.error(error);
            await message.reply("Failed to add the role.");
        }
    }
};