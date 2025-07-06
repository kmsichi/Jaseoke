const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");
const MusicPlayer = require("../music/MusicPlayer.js");
const { getYoutubeVideoInfo } = require("../util/YoutubeInfo.js");
const { secondsToString } = require("../util/SecondsToString.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("재생")
        .setDescription("음성으로 유튜브 영상을 재생합니다.")
        .addStringOption(option => option
            .setName(`주소`)
            .setDescription("재생할 영상의 주소를 입력해주세요.")
            .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: "음성 채널에 입장한 뒤 명령어를 이용해주세요.", flags: MessageFlags.Ephemeral});
        if (!interaction.member.voice.channel.joinable) 
            return await interaction.reply({content: ":x: 음성 채널에 접속할 권한이 없습니다!", flags: MessageFlags.Ephemeral});

        let url = interaction.options.getString(`주소`);
        // 유튜브 영상만을 처리
        const pattern = new RegExp("^.*(?:(?:youtu\\.be\\/|v\\/|vi\\/|u\\/\\w\\/|embed\\/)|(?:(?:watch)?\\?v(?:i)?=|\\&v(?:i)?=))([^#\\&\\?]*).*");
        let videoId = url.match(pattern);
        if (!videoId || !videoId[1]) return await interaction.reply({content: "올바른 유튜브 영상 주소가 아닙니다!", flags: MessageFlags.Ephemeral});
        videoId = videoId[1];

        joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        url = "https://youtu.be/" + videoId;
        console.log(url);
        const videoDetails = await getYoutubeVideoInfo(url);
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
            .setAuthor({name: `#${count+1} 곡을 추가했습니다`, icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/512px-YouTube_full-color_icon_%282017%29.svg.png", url: url})
            .setTitle(song.title)
            .setColor("#ff0000")
            .setThumbnail(`https://img.youtube.com/vi/${videoId}/0.jpg`)
            .setURL(url)
            .addFields(
                {name: '채널', value: song.channel, inline: true},
                {name: '영상 길이', value: song.length, inline: true}
            )
        await interaction.reply({embeds: [embed]});
    }
}