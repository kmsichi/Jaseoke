const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ServerQueue = require("./ServerQueue");

class MusicChannel {
    guildChannel = new Map();
    client = undefined;

    setclient(c) {
        this.client = c;
    }

    register(guildId, channelId, messageId) {
        this.guildChannel.set(guildId, {
            channelId: channelId,
            messageId: messageId
        });
    }

    get(guildId) {
        return this.guildChannel.get(guildId);
    }

    async check(guildId) {
        const tempData = this.guildChannel.get(guildId);
        if (tempData) {
            const channel = await this.client.channels.fetch(tempData.channelId).catch(() => null);
            const message = await channel?.messages.fetch(tempData.messageId).catch(() => null);
            return !!message;
        }
        return false;
    }

    async update(guildId) {
        const tempData = this.guildChannel.get(guildId);
        if (tempData) {
            const channel = await this.client.channels.fetch(tempData.channelId).catch(() => null);;
            const message = await channel?.messages.fetch(tempData.messageId).catch(() => null);;

            if (!message) 
                return this.guildChannel.delete(guildId);

            let imageURLs = [
                "https://cdn.discordapp.com/attachments/346499577446400000/1393590906585612349/20240215_131944.jpg?ex=6873ba2b&is=687268ab&hm=c8f2659a411f0886c9e5ff0e4d6267ff66e174ec399c90b6275e321dcaa0267d&",
                "https://media.discordapp.net/attachments/346499577446400000/1393590894741028884/20240215_234126.jpg?ex=6873ba28&is=687268a8&hm=52f9c4a7fd7fd14c5e1997a7d0e2a62bb426ca34aefe140fa477551aeea2ce91&=&format=webp&width=799&height=599",
                "https://media.discordapp.net/attachments/346499577446400000/1393590681124995125/20240313_185126.jpg?ex=6873b9f6&is=68726876&hm=0f55b457837760ab1b6e2a9024d5dbd21399232e9f076b2a21b3b736029d1d70&=&format=webp&width=799&height=599",
                "https://media.discordapp.net/attachments/346499577446400000/1393590635591762000/20240220_204720.jpg?ex=6873b9eb&is=6872686b&hm=34d25bac7c21989edfcb4f54dd1ece76f1f650f9260c070a005533b9c7f39e58&=&format=webp&width=1065&height=599",
                "https://media.discordapp.net/attachments/346499577446400000/1393590328950525952/20231221_054029.jpg?ex=6873b9a2&is=68726822&hm=fc2259fcd39d8dbdf0614f0ac3336eb76dc29f3a2296105a6ff7e820aa9b6555&=&format=webp&width=1065&height=599"
            ]

            let title = "음악 신청을 기다리는 중...";
            let description = "# 플레이리스트:\n";
            let image = imageURLs[Math.floor(Math.random() * imageURLs.length)];
            let url = "https://discord.gg/3dhQYcm5N4";
            let footer = "";

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

            const queue = ServerQueue.get(guildId);
            if (queue.songs.length > 0) {
                title = `[${queue.songs[0].length}] - ${queue.songs[0].title}`
                description += `**현재 재생 중 :** ${queue.songs[0].title}\n`;
                image = `https://img.youtube.com/vi/${queue.songs[0].videoId}/0.jpg`;
                url = `https://youtu.be/${queue.songs[0].videoId}`;
                for (let i=1; i<queue.songs.length; i++) 
                    description += `${i}. ${queue.songs[i].title}\n`;
                if (queue.pause)
                    footer += "음악 일시정지 됨 | ";
                if (queue.loop) 
                    footer += "음악 반복 중 : " + ((queue.loop == 1) ? "플레이리스트" : "한 곡");
            } else 
                description += "현재 플레이리스트가 비어있어요!";

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setURL(url)
                .setImage(image)
                .setFooter({text: footer || null});
            await message.edit({embeds: [embed], content: description, components: [row]});
        }
    }
}

module.exports = new MusicChannel();