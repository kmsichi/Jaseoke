const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const MusicChannel = require('./music/MusicChannel');
require("dotenv").config();

const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages
    ]
});

client.commands = new Collection();
MusicChannel.setClient(client);

const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith('js'));
for (const file of commandFiles) {
    const command = require(path.join(__dirname, "commands", file));
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.error(`[경고] ${filePath} 명령어가 제대로 설정되지 않았습니다.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.DISCORD_BOT_TOKEN);