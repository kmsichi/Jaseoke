const { SlashCommandBuilder } = require('discord.js');
const ServerQueue = require("../music/ServerQueue");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("멈춰")
        .setDescription("모든 음악의 재생을 정지합니다."),
    async execute(interaction) {
        const queue = ServerQueue.get(interaction.guildId);
        queue.songs.length = 1;
        getVoiceConnection(interaction.guildId).state.subscription.player.stop();
        await interaction.reply({content: "모든 음악의 재생을 멈춥니다."});
    }
}