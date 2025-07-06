const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const ServerQueue = require('../music/ServerQueue');
const locale = require("../util/Locale");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("playlist")
        .setNameLocalizations({
            "ko": "목록",
            "ja": "プレイリスト",
            "zh-CN": "播放列表",
            "zh-TW": "播放列表",
        })
        .setDescription("displays current playlist")
        .setDescriptionLocalizations({
            "ko": "음성채널에 유튜브 영상을 재생합니다",
            "ja": "現在の再生リストを表示します",
            "zh-CN": "显示当前播放列表",
            "zh-TW": "顯示當前播放列表",
        }),
    async execute(interaction) {
        const queue = ServerQueue.get(interaction.guildId);
        const lang = interaction.locale;
        if (!queue) return await interaction.reply({content: await locale.getLanguage(lang, "error_no_queue") ?? "no_queue", flags: MessageFlags.Ephemeral});

        let titles = "";
        titles += `**${await locale.getLanguage(lang, "message_nowplaying") ?? "nowPlaying"})** ${queue.songs[0].title} - ${queue.songs[0].author}\n`;
        for (let i = 1; i < queue.songs.length; i++) {
            titles += `${i}) ` + queue.songs[i].title + ` - ${queue.songs[i].author}\n`
        }
        let embed = new EmbedBuilder()
            .setColor("#59DA50")
            .setTitle(await locale.getLanguage(lang, "message_queue") ?? "currentQueue")
            .setDescription(titles.replace(undefined, ""));

        await interaction.reply({embeds: [embed]});
    }
}