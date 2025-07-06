const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const ServerQueue = require('../music/ServerQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("플레이리스트")
        .setDescription("현재 재생목록을 표시합니다"),
    async execute(interaction) {
        const queue = ServerQueue.get(interaction.guildId);
        if (!queue) return await interaction.reply({content: "현재 재생목록이 없습니다!", flags: MessageFlags.Ephemeral});

        let titles = "";
        titles += `**현재 플레이 중)** ${queue.songs[0].title} - ${queue.songs[0].author}\n`;
        for (let i = 1; i < queue.songs.length; i++) {
            titles += `${i}) ` + queue.songs[i].title + ` - ${queue.songs[i].author}\n`
        }
        let embed = new EmbedBuilder()
            .setColor("#59DA50")
            .setTitle("현재 플레이리스트")
            .setDescription(titles.replace(undefined, ""));

        await interaction.reply({embeds: [embed]});
    }
}