const {
    getCommandRole
} = require("./serverConfig");

function hasCommandRole(member, commandName) {
    // DMs or missing member → allow (DM commands handle their own restrictions)
    if (!member || !member.guild) {
        return true;
    }

    const roleId = getCommandRole(
        member.guild.id,
        commandName
    );

    if (!roleId) {
        return true;
    }

    return member.roles.cache.has(roleId);
}

module.exports = {
    hasCommandRole
};
