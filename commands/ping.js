const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("핑")
        .setDescription("하면 퐁 해요"),
    async execute(interaction) {
        await interaction.reply("퐁!");
    }
}