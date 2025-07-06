const { SlashCommandBuilder } = require('discord.js');
const { ServerQueue } = require("../music/ServerQueue.js");

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
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_voice") ?? "no_voice", flags: MessageFlags.Ephemeral});
        if (interaction.member.voice.channel !== interaction.guild.members.me.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_samechannel") ?? "not_samechannel", flags: MessageFlags.Ephemeral});
        let serverQueue = queue.get(interaction.guildId);
        if (!serverQueue || serverQueue.songs.length === 0)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_queue") ?? "no_queue", MessageFlags: MessageFlags.Ephemeral});
        
        
        const queue = ServerQueue.get(interaction.guildId);
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