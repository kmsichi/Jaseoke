const { Events } = require('discord.js');
const Database = require('../util/Database.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		let db = new Database();
        db.init();
        console.log(`[자석이] ${client.user.tag}, 온라인!`);
	},
};