const cooldowns = new Map();

function checkCooldown(commandName, userId, cooldownTime) {
    const key = `${commandName}:${userId}`;
    const now = Date.now();

    if (cooldowns.has(key)) {
        const expiration = cooldowns.get(key);

        if (now < expiration) {
            return Math.ceil((expiration - now) / 1000);
        }
    }

    cooldowns.set(key, now + cooldownTime);
    return 0;
}

module.exports = {
    checkCooldown
};