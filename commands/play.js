const { SlashCommandBuilder, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionCollector } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const MusicPlayer = require("../music/MusicPlayer.js");
const { getYoutubeVideoInfo, searchYoutubeVideo } = require("../util/YoutubeInfo.js");
const { secondsToString } = require("../util/SecondsToString.js");
const locale = require("../util/Locale");
const MessageWrapper = require("../util/MessageWrapper");

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
            .setRequired(true)
        ),
    async execute(interaction) {
        const lang = interaction.locale;
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_voice") ?? "Please join the voice channel before using the command.", flags: MessageFlags.Ephemeral});
        if (!interaction.member.voice.channel.joinable) 
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_joinable") ?? "😢 I can't join the voice channel—please don't ignore me!", flags: MessageFlags.Ephemeral});

        let word = interaction.content ?? interaction.options.getString(`searchword`);
        let videoDetails = undefined;

        // 유튜브 영상만을 처리
        const pattern = new RegExp("^.*(?:(?:youtu\\.be\\/|v\\/|vi\\/|u\\/\\w\\/|embed\\/)|(?:(?:watch)?\\?v(?:i)?=|\\&v(?:i)?=))([^#\\&\\?]*).*");
        let videoId = word.match(pattern);

        let msg = new MessageWrapper();
        await msg.defer(interaction);

        if (!videoId || !videoId[1]) 
            videoId = await waitForSelection(word, interaction, msg);
        else 
            videoId = videoId[1];

        videoDetails = await getYoutubeVideoInfo(videoId);
        if (!videoDetails)
            return await msg.edit(interaction, {content: await locale.getLanguage(lang, "error_no_videoId") ?? "Hmm, looks like that's not a vaild Youtube Video URL!", flags: MessageFlags.Ephemeral});

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
            );
        await msg.edit(interaction, {embeds: [embed], components: []});
    }
}

async function waitForSelection(word, interaction, msg) {
    let items = await searchYoutubeVideo(word, 5);
    let description = `${await locale.getLanguage(interaction.locale, "message_play_select_description") ?? "There are a total of [count] search results :"}\n`;
    description = description.replace("[count]", items.length);
    for (i=0; i<items.length; i++) 
        description += `${i+1}] ${items[i].snippet.title}\n`;
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("1")
                .setLabel("1")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("2")
                .setLabel("2")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("3")
                .setLabel("3")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("4")
                .setLabel("4")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("5")
                .setLabel("5")
                .setStyle(ButtonStyle.Secondary)
        );

    let embed = new EmbedBuilder()
        .setTitle(await locale.getLanguage(interaction.locale, "message_play_select_title") ?? "Which song would you like to add?")
        .setDescription(description);
    const message = await msg.edit(interaction, {content: "", embeds: [embed], components: [row]});

    return new Promise((resolve, reject) => {
        const collector = new InteractionCollector(interaction.client, {
            message: message,
            filter: i => i.user.id ?? i.member.user.id == interaction.user.id,
            time: 30000
        });
    
        collector.on("collect", async interaction => {
            msg.defer(interaction);
            resolve(items[parseInt(interaction.customId-1)].id.videoId);
            collector.stop("done");
        })
    
        collector.on("end", (collected, reason) => {
            if (reason !== "done") {
                interaction.deleteReply?.().catch(() => {});
            }
        })
    })
}