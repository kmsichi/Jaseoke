const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { spawn } = require("child_process");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("재생")
        .setDescription("하면 퐁 해요")
        .addStringOption(option => option
            .setName(`주소`)
            .setDescription("재생할 영상의 주소를 입력해주세요.")
            .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.voice.channel) return await interaction.reply({content: "음성 채널에 입장한 뒤 명령어를 이용해주세요.", flags: MessageFlags.Ephemeral});

        const url = interaction.options.getString(`주소`);
        // 유튜브 영상만을 처리
        const pattern = new RegExp("^.*(?:(?:youtu\\.be\\/|v\\/|vi\\/|u\\/\\w\\/|embed\\/)|(?:(?:watch)?\\?v(?:i)?=|\\&v(?:i)?=))([^#\\&\\?]*).*");
        if (!url.match(pattern)) return await interaction.reply({content: "올바른 유튜브 영상 주소가 아닙니다!", flags: MessageFlags.Ephemeral});

        const ytDlpProcess = spawn("yt-dlp", [
            "-f", "bestaudio",
            "-o", "-",
            "--no-playlist",
            url
        ]);

        const resource = createAudioResource(ytDlpProcess.stdout, {inlineVolume: true});
        const audioPlayer = createAudioPlayer();
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channelId,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        
        connection.subscribe(audioPlayer);
        audioPlayer.play(resource);

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            ytDlpProcess.kill();
            connection.destroy();
        });
        
        await interaction.reply(`주소는 다음과 같습니다 : ${url}`);
    }
}