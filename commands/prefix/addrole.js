module.exports = {
    name: "addrole",
    description: "Add a role to a member",

    async execute(message, args) {
        const roleCommand = require("./role.js");

        return roleCommand.execute(message, args);
    }
};