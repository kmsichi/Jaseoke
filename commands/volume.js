const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getVoiceConnection } = require("@discordjs/voice");
const locale = require("../util/Locale");
const ServerQueue = require("../music/ServerQueue");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setNameLocalizations({
            "ko": "핑",
            "ja": "ピン",
            "zh-CN": "乒",
            "zh-TW": "乒",
        })
        .setDescription("Set volume of song")
        .setDescriptionLocalizations({
            "ko": "하면 퐁 해요",
            "ja": "ポンと答えます",
            "zh-CN": "就会说是乓",
            "zh-TW": "就會說是乓",
        })
        .addIntegerOption(option => option
            .setName("volume")
            .setNameLocalizations({
                "ko": "음량",
                "ja": "音量",
                "zh-CN": "音量",
                "zh-TW": "音量",
            })
            .setDescription("Volume value (0 - 200)")
            .setDescriptionLocalizations({
                "ko": "볼륨 값 (0 ~ 200)",
                "ja": "音量値 (0 ~ 200)",
                "zh-CN": "音量值 (0 ~ 200)",
                "zh-TW": "音量值 (0 ~ 200)",
            })
            .setRequired(true)),
    async execute(interaction) {
        const lang = interaction.locale;
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_voice") ?? "Please join the voice channel before using the command.", flags: MessageFlags.Ephemeral});
        let queue = ServerQueue.get(interaction.guildId);
        if (!queue || queue.songs.length === 0)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_queue") ?? "PlayList", MessageFlags: MessageFlags.Ephemeral});
        if (interaction.member.voice.channel !== interaction.guild.members.me.voice.channel)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_samechannel") ?? "Please make sure you’re in the same voice channel when using commands!", flags: MessageFlags.Ephemeral});

        const value = interaction.options.getInteger("volume");
        if (isNaN(value) || value < 0 || value > 200)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_volume_number") ?? "The volume can only be adjusted between 0 - 200!", flags: MessageFlags.Ephemeral});

        const connection = getVoiceConnection(interaction.guildId);
        connection.state?.subscription?.player?.state?.resource?.volume?.setVolume(value / 100);
        let errorMsg = await locale.getLanguage(lang, "message_volume") ?? "Volume has been adjusted to [volume]!";
        return await interaction.reply({content: errorMsg.replace("[volume]", value)});
        
    }
}