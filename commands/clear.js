const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const locale = require("../util/Locale");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setNameLocalizations({
            "ko": "청소",
            "ja": "クリア",
            "zh-CN": "清理",
            "zh-TW": "清除",
        })
        .setDescription("Deletes a specified amount of messages in the channel.")
        .setDescriptionLocalizations({
            "ko": "채널의 메시지를 지정한 수만큼 일괄 삭제합니다.",
            "ja": "チャンネルのメッセージを指定した数だけ一括削除します。",
            "zh-CN": "批量删除频道中指定数量的消息。",
            "zh-TW": "批量刪除頻道中指定數量的訊息。",
        })
        .setDescriptionLocalizations({
            ko: '채널의 메시지를 지정한 수만큼 일괄 삭제합니다.',
            ja: 'チャンネルのメッセージを指定した数だけ一括削除します。',
            'zh-CN': '批量删除频道中指定数量的消息。',
            'zh-TW': '批量刪除頻道中指定數量的訊息。',
        })
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('The number of messages to delete (1-100)')
                .setNameLocalizations({
                    ko: '수량',
                    ja: '数',
                    'zh-CN': '数量',
                    'zh-TW': '數量',
                })
                .setDescriptionLocalizations({
                    ko: '삭제할 메시지 수를 입력하세요 (1~100)',
                    ja: '削除するメッセージの数を入力してください（1〜100）',
                    'zh-CN': '请输入要删除的消息数量 (1~100)',
                    'zh-TW': '請輸入要刪除的訊息數量 (1~100)',
                })
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),
    async execute(interaction) {
        const lang = interaction.locale;
        const amount = interaction.options.getInteger('amount');

        if (!interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ 
            content: await locale.getLanguage(lang, "error_no_permission_manageMessage") ?? '❌ 봇에게 이 채널의 메시지를 관리할 권한이 없습니다.', 
            ephemeral: true 
        });
    }

        try {
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);
            
            await interaction.reply({
                content: (await locale.getLanguage(lang, "message_clear") ?? `[amount] messages deleted.`).replace("[amount]", deletedMessages.size),
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while deleting messages.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while deleting messages.', ephemeral: true });
            }
        }
    }
}