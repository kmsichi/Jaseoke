class MessageWrapper {
    sentMsg = undefined;

    async deferReply(userInteract) {
        if (userInteract.isChatInputCommand?.()) {
            await userInteract.deferReply();
        } else {
            this.sentMsg = await userInteract.channel.send("Loading...");
        }
    }

    async reply(userInteract, content) {
        if (userInteract.isChatInputCommand?.()) {
            await userInteract.reply(content);
        } else {
            this.sentMsg = await userInteract.channel.send(content);
        }
    }

    async edit(userInteract, content) {
        if (userInteract.isChatInputCommand?.()) {
            await userInteract.editReply(content);
        } else {
            if (!this.sentMsg) throw new Error("답장하지 않아 답장을 수정할 수 없습니다.")
            await this.sentMsg.edit(content);
        }
    }
}

module.exports = MessageWrapper;