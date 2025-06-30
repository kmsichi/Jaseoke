const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const { clientId, discordToken } = require('./config.json');
const { REST, Routes, Message, MessageFlags } = require('discord.js');
const { error } = require('node:console');
const { } = require("./deployCommand.js");

const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith('js'));
for (const file of commandFiles) {
    const command = require(path.join(__dirname, "commands", file));
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[경고] ${filePath} 명령어가 제대로 설정되지 않았습니다.`);
    }
}

client.once(Events.ClientReady, readyClient => {
    console.log(`[자석이] ${readyClient.user.tag}, 온라인!`);
})

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`${interaction.commandName} 명령어가 존재하지 않으나, 실행이 시도되었습니다.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (err) {
            console.error("명령어 실행 중 에러가 발생했습니다 : " + err);
            if (interaction.replied || interaction.deferred) 
                await interaction.followUp({content: "명령어 실행 중 오류가 발생했습니다.", flags: MessageFlags.Ephemeral})
            else
                await interaction.reply({content: "명령어 실행 중 오류가 발생했습니다.", flags: MessageFlags.Ephemeral})
        }
    }
})

client.login(discordToken);