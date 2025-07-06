const { getVoiceConnection } = require("@discordjs/voice");
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { queue } = require("../music/ServerQueue");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("스킵")
        .setDescription("재생중인 노래를 스킵합니다.")
        .addStringOption(option => option
            .setName(`주소`)
            .setDescription("재생할 영상의 주소를 입력해주세요.")),
    async execute(interaction) {
        if (!interaction.member.voice.channel) return await interaction.reply({content: "음성 채널에 입장한 뒤 명령어를 이용해주세요.", flags: MessageFlags.Ephemeral});
        let serverQueue = queue.get(interaction.guildId);
        if (!serverQueue || serverQueue.songs.length === 0) return await interaction.reply({content: "재생중인 음악이 없습니다!", MessageFlags: MessageFlags.Ephemeral});
        
        getVoiceConnection(interaction.guildId).state.subscription.player.stop();
        return await interaction.reply("음악을 스킵했습니다!")
    }
}