const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const MusicPlayer = require("../music/MusicPlayer.js");
const { getYoutubeVideoInfo, searchYoutubeVideo } = require("../util/YoutubeInfo.js");
const { secondsToString } = require("../util/SecondsToString.js");
const locale = require("../util/Locale");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setNameLocalizations({
            "ko": "재생",
            "ja": "再生",
            "zh-CN": "播放",
            "zh-TW": "播放",
        })
        .setDescription("Streams Youtube Video Sound through Discord Voice Channel.")
        .setDescriptionLocalizations({
            "ko": "음성채널에 유튜브 영상을 재생합니다",
            "ja": "YouTubeのビデオサウンドを音声チャネルでストリーミングします",
            "zh-CN": "通过语音频道播放流媒体视频声音",
            "zh-TW": "通過語音頻道播放流媒體視頻聲音",
        })
        .addStringOption(option => option
            .setName("searchword")
            .setNameLocalizations({
                "ko": "검색어",
                "ja": "検索語",
                "zh-CN": "检索语",
                "zh-TW": "檢索詞",
            })
            .setDescription("URL of Youtube Video")
            .setDescriptionLocalizations({
                "ko": "재생할 영상의 주소",
                "ja": "再生する動画URL",
                "zh-CN": "要播放的视频的URL",
                "zh-TW": "要播放的視頻的URL",
            })
            .setRequired(true)),
    async execute(interaction) {
        const lang = interaction.locale;
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_voice") ?? "Please join the voice channel before using the command.", flags: MessageFlags.Ephemeral});
        if (!interaction.member.voice.channel.joinable) 
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_joinable") ?? "😢 I can't join the voice channel—please don't ignore me!", flags: MessageFlags.Ephemeral});

        let word = interaction.options.getString(`searchword`);
        let videoDetails = undefined;

        // 유튜브 영상만을 처리
        const pattern = new RegExp("^.*(?:(?:youtu\\.be\\/|v\\/|vi\\/|u\\/\\w\\/|embed\\/)|(?:(?:watch)?\\?v(?:i)?=|\\&v(?:i)?=))([^#\\&\\?]*).*");
        let videoId = word.match(pattern);

        if (!videoId || !videoId[1]) {
            videoDetails = await searchYoutubeVideo(word);
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_videoId") ?? "Hmm, looks like that's not a vaild Youtube Video URL!", flags: MessageFlags.Ephemeral});
        } else {
            videoDetails = await getYoutubeVideoInfo(word);
            videoId = videoId[1];
        }

        if (!videoDetails) return await interaction.reply({content: await locale.getLanguage(lang, "error_no_videoId") ?? "Hmm, looks like that's not a vaild Youtube Video URL!", flags: MessageFlags.Ephemeral})

        joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        let url = "https://youtu.be/" + videoId;
        let song = {
            title: videoDetails.title,
            videoId: videoId,
            author: `${interaction.member.user.globalName}(${interaction.member.user.tag})`,
            channel: videoDetails.author,
            length: secondsToString(videoDetails.lengthSeconds),
            url: url
        };
        let count = await MusicPlayer.addsong(interaction.guildId, song);
        
        let embed = new EmbedBuilder()
            .setAuthor({name: `#${count+1} ${await locale.getLanguage(lang, "message_play_addsong") ?? "Song Added"}`, icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/512px-YouTube_full-color_icon_%282017%29.svg.png", url: url})
            .setTitle(song.title)
            .setColor("#ff0000")
            .setThumbnail(`https://img.youtube.com/vi/${videoId}/0.jpg`)
            .setURL(url)
            .addFields(
                {name: `${await locale.getLanguage(lang, "message_play_channel") ?? "Channel"}`, value: song.channel, inline: true},
                {name: `${await locale.getLanguage(lang, "message_play_length") ?? "Video length"}`, value: song.length, inline: true}
            )
        await interaction.reply({embeds: [embed]});
    }
}