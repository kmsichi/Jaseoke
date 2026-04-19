const { Events } = require('discord.js');
const MusicChannel = require('../music/MusicChannel');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
        if (!message.inGuild()) return;
        let channelId = await MusicChannel.check(message.guildId);
        if (message.channelId == channelId) {
            if (!message.member.user.bot) {
                const cmd = message.client.commands.get("play");
                cmd.execute(message);
            }
            setTimeout(() => {
                message.delete().catch(() => null);
            }, 10000)
        }
    }
};