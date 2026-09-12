function getTargetMember(message) {
    return message.mentions.members.first() || null;
}

function canModerate(message, target) {
    if (!target) {
        return {
            allowed: false,
            reason: "Please mention a valid member."
        };
    }

    if (target.id === message.author.id) {
        return {
            allowed: false,
            reason: "You cannot use this command on yourself."
        };
    }

    if (target.id === message.guild.ownerId) {
        return {
            allowed: false,
            reason: "You cannot use this command on the server owner."
        };
    }

    if (
        message.member.id !== message.guild.ownerId &&
        target.roles.highest.position >= message.member.roles.highest.position
    ) {
        return {
            allowed: false,
            reason: "You cannot moderate a member with an equal or higher role."
        };
    }

    if (
        target.roles.highest.position >=
        message.guild.members.me.roles.highest.position
    ) {
        return {
            allowed: false,
            reason: "My highest role must be above the target's highest role."
        };
    }

    return {
        allowed: true
    };
}

module.exports = {
    getTargetMember,
    canModerate
};