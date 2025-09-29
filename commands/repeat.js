const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const locale = require("../util/Locale");
const ServerQueue = require('../music/ServerQueue');
const MusicChannel = require('../music/MusicChannel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("repeat")
        .setNameLocalizations({
            "ko": "반복",
            "ja": "ピン",
            "zh-CN": "乒",
            "zh-TW": "乒",
        })
        .setDescription("repeat the song!")
        .setDescriptionLocalizations({
            "ko": "노래의 반복 상태를 설정합니다.",
            "ja": "ポンと答えます",
            "zh-CN": "就会说是乓",
            "zh-TW": "就會說是乓",
        }),
    async execute(interaction) {
        const lang = interaction.locale;
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_voice") ?? "Please join the voice channel before using the command.", flags: MessageFlags.Ephemeral});
        const queue = ServerQueue.get(interaction.guildId);
        if (!queue || queue.songs.length === 0)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_queue") ?? "PlayList", MessageFlags: MessageFlags.Ephemeral});
        if (interaction.member.voice.channel !== interaction.guild.members.me.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_samechannel") ?? "Please make sure you’re in the same voice channel when using commands!", flags: MessageFlags.Ephemeral});
        
        queue.loop = (queue.loop + 1) % 3;
        const msg = await locale.getLanguage(interaction.locale, `message_repeat_mode_${queue.loop}`) ?? "Repeat_Mode_Set";
        await MusicChannel.update(interaction.guildId);
        await interaction.reply({content: msg});
        return;
    }
}