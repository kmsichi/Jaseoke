const { SlashCommandBuilder } = require('discord.js');
const locale = require("../util/Locale");
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reload All Commands.")
        .setDescriptionLocalizations({
            "ko": "모든 명령어를 리로드합니다.",
        }),
    async execute(interaction) {
        const devId = process.env.DEV_IDS ? process.env.DEV_IDS.split(',') : [];
        if (!devId.includes(interaction.user.id)) {
            return interaction.reply({ 
                content: '🚫 이 명령어는 개발자만 사용할 수 있습니다.', 
                ephemeral: true 
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const commandPath = path.resolve(__dirname, '../commands');
            const musicPath = path.resolve(__dirname, '../music');
            const utilPath = path.resolve(__dirname, '../util');
            const ignoreList = ['ServerQueue.js', 'Locale.js']; // 리로드 제외할 파일.

            const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(cmdPath, file);
                delete require.cache[require.resolve(filePath)];
            }
            client.commands.clear();
            console.log(`[자석이] 리로드 (1) : 모든 명령어 캐시를 비웁니다...`);

            if (fs.existsSync(utilPath)) {
                const utilFiles = fs.readdirSync(utilPath).filter(file => file.endsWith('.js'));
                for (const file of utilFiles) {
                    const filePath = path.join(utilPath, file);
                    delete require.cache[require.resolve(filePath)];
                    require(filePath); 
                }
                console.log(`[자석이] 리로드 (2) : 모든 유틸리티 캐시를 비웁니다...`);
            }

            if (fs.existsSync(musicPath)) {
                const musicFiles = fs.readdirSync(musicPath).filter(file => file.endsWith('.js') && !ignoreList.includes(file));
                for (const file of musicFiles) {
                    const filePath = path.join(musicPath, file);
                    delete require.cache[require.resolve(filePath)];
                    require(filePath); 
                }
                console.log(`[자석이] 리로드 (3) : 모든 음악 파일 캐시를 비웁니다...`);
            }

            locale.clearCache();
            console.log(`[자석이] 리로드 (4) : 모든 언어 파일 캐시를 비웁니다...`)

            let loadedCount = 0;
            const newCommandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith('.js'));
            for (const file of newCommandFiles) {
                const filePath = path.join(commandPath, file);
                const newCommand = require(filePath);
                
                if (newCommand.data && newCommand.data.name) {
                    client.commands.set(newCommand.data.name, newCommand);
                    loadedCount++;
                }
            }

            await interaction.editReply(`[자석이] 전체 시스템 리로드 완료했습니다.\n${loadedCount} 개의 명령어가 로드되었습니다.`);
        } catch (error) {
            console.error("리로드 중 오류 발생! : \n" + error);
            await interaction.editReply(`리로드 중 오류가 발생했습니다:\n\`\`\`${error.message}\n\`\`\``);
        }
    }
}