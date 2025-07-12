const { SlashCommandBuilder, MessageFlags, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const locale = require("../util/Locale");
const MusicChannel = require('../music/MusicChannel');
const ServerQueue = require('../music/ServerQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setNameLocalizations({
            "ko": "셋업",
            "ja": "セットアップ",
            "zh-CN": "安装",
            "zh-TW": "安裝",
        })
        .setDescription("Open a channel for convenient music control")
        .setDescriptionLocalizations({
            "ko": "편리한 음악 제어를 위한 채널을 개설합니다",
            "ja": "便利な音楽コントロールのためにチャンネルを開きます",
            "zh-CN": "打开一个频道以便于音乐控制",
            "zh-TW": "打開一個頻道以便於音樂控制",
        }),
    async execute(interaction) {
        const lang = interaction.locale;
        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) 
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_permission_manageChannel") ?? "You need the ``Manage Channels`` permission to run this command!", flags: MessageFlags.Ephemeral});
        if (await MusicChannel.check(interaction.guildId, interaction.client)) {
            const errorMsg = await locale.getLanguage(lang, "error_has_musicChannel") ?? "Alreay_Has_Channel";
            return await interaction.reply({content: errorMsg, flags: MessageFlags.Ephemeral})
        }
        const queue = ServerQueue.get(interaction.guildId);
        if (queue)
            return await interaction.reply({content: await locale.getLanguage(lang, "error_no_setup") ?? "Please stop the music before using this command!", flags: MessageFlags.Ephemeral})

        const channel = await interaction.guild.channels.create({
            name: "자석이-노래-신청",
            type: ChannelType.GuildText,
            reason: "음악 재생용 채널 자동 생성"
        });
        
        let imageURLs = [
            "https://cdn.discordapp.com/attachments/346499577446400000/1393590906585612349/20240215_131944.jpg?ex=6873ba2b&is=687268ab&hm=c8f2659a411f0886c9e5ff0e4d6267ff66e174ec399c90b6275e321dcaa0267d&",
            "https://media.discordapp.net/attachments/346499577446400000/1393590894741028884/20240215_234126.jpg?ex=6873ba28&is=687268a8&hm=52f9c4a7fd7fd14c5e1997a7d0e2a62bb426ca34aefe140fa477551aeea2ce91&=&format=webp&width=799&height=599",
            "https://media.discordapp.net/attachments/346499577446400000/1393590681124995125/20240313_185126.jpg?ex=6873b9f6&is=68726876&hm=0f55b457837760ab1b6e2a9024d5dbd21399232e9f076b2a21b3b736029d1d70&=&format=webp&width=799&height=599",
            "https://media.discordapp.net/attachments/346499577446400000/1393590635591762000/20240220_204720.jpg?ex=6873b9eb&is=6872686b&hm=34d25bac7c21989edfcb4f54dd1ece76f1f650f9260c070a005533b9c7f39e58&=&format=webp&width=1065&height=599",
            "https://media.discordapp.net/attachments/346499577446400000/1393590328950525952/20231221_054029.jpg?ex=6873b9a2&is=68726822&hm=fc2259fcd39d8dbdf0614f0ac3336eb76dc29f3a2296105a6ff7e820aa9b6555&=&format=webp&width=1065&height=599"
        ]
        image = imageURLs[(Math.random() * imageURLs.length)];

        const embed = new EmbedBuilder()
            .setTitle("음악 신청을 기다리는 중...") // 자기장에 몸을 맡기는 중
            .setImage(image);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("pause")
                    .setEmoji("<:playpause:1393562201251512431>")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("stop")
                    .setEmoji("<:stop:1393562354641272973>")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("skip")
                    .setEmoji("<:skip:1393562705658642513>")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("repeat")
                    .setEmoji("<:repeat:1393564580327718983>")
                    .setStyle(ButtonStyle.Secondary),
            );
        const description = "# 플레이리스트:\n현재 플레이리스트가 비어있어요!"
        const message = await channel.send({content: description, embeds: [embed], components: [row]});

        MusicChannel.register(interaction.guildId, channel.id, message.id);
        const msg = await locale.getLanguage(lang, "message_setup") ?? "Channel_Created";
        await interaction.reply({content: msg.replace("[channel]", `<#${channel.id}>`)});
    }
}