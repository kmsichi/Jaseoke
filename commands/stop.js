const { SlashCommandBuilder } = require('discord.js');
const ServerQueue = require("../music/ServerQueue");
const { getVoiceConnection } = require("@discordjs/voice");
const locale = require("../util/Locale");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setNameLocalizations({
            "ko": "멈춰",
            "ja": "音楽停止",
            "zh-CN": "停止",
            "zh-TW": "停止",
        })
        .setDescription("Stops all music playing.")
        .setDescriptionLocalizations({
            "ko": "모든 음악의 재생을 정지합니다.",
            "ja": "すべての音楽の再生を停止します",
            "zh-CN": "停止所有播放的音乐",
            "zh-TW": "停止所有播放的音樂",
        }),
    async execute(interaction) {
        const queue = await ServerQueue.get(interaction.guildId);
        queue.songs.length = 1;
        getVoiceConnection(interaction.guildId).state.subscription.player.stop();
        await interaction.reply({content: await locale.getLanguage(interaction.locale, "message_stop") ?? "Stop playing all music."});
    }
}