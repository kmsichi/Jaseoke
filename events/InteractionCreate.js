const { Events } = require('discord.js');
const { MessageFlags } = require('discord.js');
const locale = require("../util/Locale");

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`${interaction.commandName} 명령어가 존재하지 않으나, 실행이 시도되었습니다.`);
                return interaction.reply({content: await locale.getLanguage(lang, "error_no_such_command") ?? "I don’t recognize that command. Could you try again?", flags: MessageFlags.Ephemeral});
            }

            try {
                await command.execute(interaction);
            } catch (err) {
                let errorMessage = await locale.getLanguage(interaction.locale, "error_while_command") ?? "😵 Oops! Something went wrong while running the command.";
                console.error("명령어 실행 중 에러가 발생했습니다 : " + err);
                if (interaction.replied || interaction.deferred) 
                    await interaction.followUp({content: errorMessage, flags: MessageFlags.Ephemeral})
                else
                    await interaction.reply({content: errorMessage, flags: MessageFlags.Ephemeral})
            }
        } else if (interaction.isButton()) {
            const command = interaction.client.commands.get(interaction.customId);
            if (command) {
                try {
                    await command.execute(interaction);
                } catch (err) {
                    let errorMessage = await locale.getLanguage(interaction.locale, "error_while_command") ?? "😵 Oops! Something went wrong while running the command.";
                    console.error("명령어 실행 중 에러가 발생했습니다 : " + err);
                    if (interaction.replied || interaction.deferred) 
                        await interaction.followUp({content: errorMessage, flags: MessageFlags.Ephemeral})
                    else
                        await interaction.reply({content: errorMessage, flags: MessageFlags.Ephemeral})
                }
            }
        }
	},
};