const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require(discord.js);
const { discordToken } = require('./config.json');
const { Message, MessageFlags } = require('discord.js');

const client = new Client({ intents: [
        GatewayIntentBits.Guilds
    ]
});

client.command

client.once(Events.ClientReady, readyClient => {
    console.log(`${readyClient.user.tag}, 온라인!`);
})

client.login(discordToken);


