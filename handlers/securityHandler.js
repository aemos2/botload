const {
    PermissionFlagsBits
} = require("discord.js");

const joinTracker = new Map();
const lockedGuilds = new Set();

function setupSecurity(client) {
    client.on("guildMemberAdd", async member => {
        const guildId = member.guild.id;
        const now = Date.now();

        const joins = joinTracker.get(guildId) || [];

        const recent = joins.filter(
            timestamp => now - timestamp < 10000
        );

        recent.push(now);

        joinTracker.set(guildId, recent);

        if (recent.length < 10) return;
        if (lockedGuilds.has(guildId)) return;

        lockedGuilds.add(guildId);

        const everyone = member.guild.roles.everyone;

        if (
            everyone &&
            everyone.permissions.has(
                PermissionFlagsBits.SendMessages
            )
        ) {
            try {
                await everyone.setPermissions(
                    everyone.permissions.remove(
                        PermissionFlagsBits.SendMessages
                    ),
                    "Automatic raid protection"
                );
            } catch (error) {
                console.error(
                    "Raid protection error:",
                    error
                );
            }
        }

        setTimeout(async () => {
            try {
                if (everyone) {
                    await everyone.setPermissions(
                        everyone.permissions.add(
                            PermissionFlagsBits.SendMessages
                        ),
                        "Automatic raid protection expired"
                    );
                }
            } catch (error) {
                console.error(
                    "Raid protection restore error:",
                    error
                );
            }

            lockedGuilds.delete(guildId);
            joinTracker.delete(guildId);
        }, 60000);
    });
}

module.exports = {
    setupSecurity
};