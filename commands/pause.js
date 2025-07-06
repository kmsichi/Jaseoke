const { SlashCommandBuilder } = require('discord.js');
const { ServerQueue } = require("../music/ServerQueue.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("일시정지")
        .setDescription("재생중인 음악을 잠시 일시정지합니다."),
    async execute(interaction) {
        if (!interaction.member.voice.channel)
            return await interaction.reply({content: "음성 채널에 입장한 뒤 명령어를 이용해주세요.", flags: MessageFlags.Ephemeral});
        if (interaction.member.voice.channel !== interaction.guild.members.me.voice.channel)
            return await interaction.reply({content: "봇과 같은 음성 채널에서 명령어를 이용해주세요.", flags: MessageFlags.Ephemeral});
        let serverQueue = queue.get(interaction.guildId);
        if (!serverQueue || serverQueue.songs.length === 0)
            return await interaction.reply({content: "재생중인 음악이 없습니다!", MessageFlags: MessageFlags.Ephemeral});
        
        
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