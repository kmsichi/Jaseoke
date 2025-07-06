const { SlashCommandBuilder } = require('discord.js');
const locale = require("../util/Locale");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setNameLocalizations({
            "ko": "핑",
            "ja": "ピン",
            "zh-CN": "乒",
            "zh-TW": "乒",
        })
        .setDescription("then pong!")
        .setDescriptionLocalizations({
            "ko": "하면 퐁 해요",
            "ja": "ポンと答えます",
            "zh-CN": "就会说是乓",
            "zh-TW": "就會說是乓",
        }),
    async execute(interaction) {
        const lang = interaction.locale;
        await interaction.reply({
            content: await locale.getLanguage(lang, "message_ping") ?? "Pong!",
        });
    }
}