const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require("@discordjs/voice");
const ServerQueue = require("../music/ServerQueue.js");
const locale = require("../util/Locale");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setNameLocalizations({
            "ko": "일시정지",
            "ja": "休止",
            "zh-CN": "暂停",
            "zh-TW": "暫停",
        })
        .setDescription("Pause the music are playing.")
        .setDescriptionLocalizations({
            "ko": "재생중인 음악을 잠시 일시정지합니다..",
            "ja": "再生中の音楽を一時停止します",
            "zh-CN": "停止所有播放的音乐",
            "zh-TW": "停止所有播放的音樂",
        }),
    async execute(interaction) {
        const lang = interaction.locale;
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_voice") ?? "Please join the voice channel before using the command.", flags: MessageFlags.Ephemeral});
        if (interaction.member.voice.channel !== interaction.guild.members.me.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_samechannel") ?? "Please make sure you’re in the same voice channel when using commands!", flags: MessageFlags.Ephemeral});
        let serverQueue = ServerQueue.get(interaction.guildId);
        if (!serverQueue || serverQueue.songs.length === 0)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_queue") ?? "I'm not playing any music right now!", MessageFlags: MessageFlags.Ephemeral});
        
        const queue = await ServerQueue.get(interaction.guildId);
        const connection = getVoiceConnection(interaction.guildId);
        if (queue.pause == true) 
            connection.state.subscription.player.unpause();
        else 
            connection.state.subscription.player.pause();
        queue.pause == true ? await interaction.reply("음악을 다시 재생했습니다!") : await interaction.reply("음악을 일시정지했습니다!")
        queue.pause = !queue.pause;
        return;
    }
}