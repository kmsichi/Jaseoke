const fs = require('node:fs');
const { spawn } = require("child_process");
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ServerQueue = require("./ServerQueue.js");
const MusicChannel = require("./MusicChannel.js");

class MusicPlayer {
    addsong(guildId, song) {
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

    play(guildId) {
        const queue = ServerQueue.get(guildId);
        if (!queue) throw "에러 발생, queue가 존재하지 않습니다.";
        try {
            const tempDir = `./music/temp/${guildId}`;
            fs.mkdirSync(tempDir, { recursive: true });
            const ytDlpProcess = spawn("yt-dlp", [
                "-f", "bestaudio",
                "-o", "-",
                "--no-playlist",
                queue.songs[0].url
            ], {env: process.env, cwd: tempDir});

            const resource = createAudioResource(ytDlpProcess.stdout, {inlineVolume: true});
            const audioPlayer = createAudioPlayer();
            const connection = getVoiceConnection(guildId);
            
            connection.subscribe(audioPlayer);
            audioPlayer.play(resource);
            MusicChannel.update(guildId);

        audioPlayer.on(AudioPlayerStatus.Idle, () => {
            ffmpeg.kill();

                if (queue.loop === 2)
                    queue.songs.unshift(queue.songs[0]);
                else if (queue.loop === 1) 
                    queue.songs.push(queue.songs[0]);

                queue.songs.shift();

                if (queue.songs.length === 0) {
                    connection.destroy();
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    MusicChannel.update(guildId).then(() => {
                        ServerQueue.delete(guildId);
                    });
                }
                else this.play(guildId);
            });
        } catch (err) {
            console.log("음악 재생 중 에러가 발생했습니다 : " + err);
            queue.songs.shift();
            if (queue.songs.length > 0) {
                this.play(guildId);
            } else {
                const connection = getVoiceConnection(guildId);
                connection.destroy();
                MusicChannel.update(guildId).then(() => {
                    ServerQueue.delete(guildId);
                });
            }
        }
    }
}

module.exports = new MusicPlayer();