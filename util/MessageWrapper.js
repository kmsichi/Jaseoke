class MessageWrapper {
    sentMsg = undefined;

    async defer(userInteract) {
        if (userInteract.isChatInputCommand?.()) {
            return await userInteract.deferReply();
        } else if(userInteract.isButton?.()) {
            return await userInteract.deferUpdate();
        } else {
            this.sentMsg = await userInteract.channel.send("Loading...");
            return this.sentMsg;
        }
    }

    async reply(userInteract, content) {
        if (userInteract.isChatInputCommand?.()) {
            return await userInteract.reply(content);
        } else {
            this.sentMsg = await userInteract.channel.send(content);
            return this.sentMsg;
        }
    }

    async edit(userInteract, content) {
        if (userInteract.isChatInputCommand?.()) {
            return await userInteract.editReply(content);
        } else {
            if (!this.sentMsg) throw new Error("답장하지 않아 답장을 수정할 수 없습니다.")
            return await this.sentMsg.edit(content);
        }
    }
}

module.exports = MessageWrapper;