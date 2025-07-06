const { REST, Routes } = require('discord.js');
const { clientId, guildId, discordToken } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
require("dotenv").config();

const commands = [];

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(__dirname, "commands", file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[자석이] [경고] ${filePath} 명령어에 data나 execute 프로퍼티가 존재하지 않습니다.`);
    }
}

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
	try {
		console.log(`[자석이] ${commands.length} 개 명령어를 새로고침 합니다..`);

		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
			{ body: commands },
		);

		console.log(`[자석이] ${data.length} 개 슬래시 명령어가 성공적으로 재설정 되었습니다.`);
	} catch (error) {
        console.error("[자석이] 명령어 재설정 중 에러가 발생했습니다 : " + error);
	}
})();