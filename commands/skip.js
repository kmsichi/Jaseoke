const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const ServerQueue = require("../music/ServerQueue");
const locale = require("../util/Locale");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setNameLocalizations({
            "ko": "스킵",
            "ja": "スキップ",
            "zh-CN": "跳过",
            "zh-TW": "跳過",
        })
        .setDescription("재생중인 노래를 스킵합니다.")
        .addStringOption(option => option
            .setName(`index`)
            .setNameLocalizations({
                "ko": "번호",
                "ja": "番号",
                "zh-CN": "号码",
                "zh-TW": "號碼",
            })
            .setDescription("Number to skip"))
            .setDescriptionLocalizations({
                "ko": "건너뛸 숫자",
                "ja": "スキップする番号",
                "zh-CN": "跳过的数字",
                "zh-TW": "跳過的數字",
            }),
    async execute(interaction) {
        const lang = interaction.locale;
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_voice") ?? "Please join the voice channel before using the command.", flags: MessageFlags.Ephemeral});
        let queue = ServerQueue.get(interaction.guildId);
        if (!queue || queue.songs.length === 0)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_queue") ?? "PlayList", MessageFlags: MessageFlags.Ephemeral});
        if (interaction.member.voice.channel !== interaction.guild.members.me.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_samechannel") ?? "Please make sure you’re in the same voice channel when using commands!", flags: MessageFlags.Ephemeral});
        
        let temp = queue.loop;
        queue.loop = 0;        
        getVoiceConnection(interaction.guildId).state.subscription.player.stop();
        queue.loop = temp;
        return await interaction.reply(await locale.getLanguage(lang, "message_skip") ?? "Music Skipped!");
    }
}