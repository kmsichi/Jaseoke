class ServerQueue {
    #queue = new Map();
    has(guildId) {
        return this.#queue.has(guildId);
    }

    get(guildId) {
        return this.#queue.get(guildId);
    }

    set(guildId, queueData) {
        this.#queue.set(guildId, queueData);
        return this.#queue.get(guildId);
    }

    delete(guildId) {
        this.#queue.delete(guildId);
        return this.#queue.get(guildId);
    }

    clear() {
        this.#queue.clear();
    }
}

module.exports = new ServerQueue();