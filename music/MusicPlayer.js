const { spawn } = require("child_process");
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ServerQueue = require("./ServerQueue.js");

class MusicPlayer {
    async addsong(guildId, song) {
        if (!ServerQueue.has(guildId)) {
            let guildQueue = {
                songs: [],
                loop: false,
                pause: false
            };
            guildQueue.songs.push(song);
            ServerQueue.set(guildId, guildQueue);
            this.play(guildId);
            return 0;
        } else {
            let queue = ServerQueue.get(guildId);
            queue.songs.push(song);
            return queue.songs.length-1;
        }
    }

    async play(guildId) {
        const queue = ServerQueue.get(guildId);
        if (!queue) throw "에러 발생, queue가 존재하지 않습니다.";
        const ytDlpProcess = spawn("yt-dlp", [
            "-f", "bestaudio",
            "-o", "-",
            "--no-playlist",
            queue.songs[0].url
        ]);

        const resource = createAudioResource(ytDlpProcess.stdout, {inlineVolume: true});
        const audioPlayer = createAudioPlayer();
        const connection = getVoiceConnection(guildId);
        
        connection.subscribe(audioPlayer);
        audioPlayer.play(resource);

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            queue.songs.shift();
            ytDlpProcess.kill();
            if (queue.songs.length === 0) {
                connection.destroy();
                ServerQueue.delete(guildId); // queue 접근 불가
            }
            else this.play(guildId);
        });
    }
}

module.exports = new MusicPlayer();