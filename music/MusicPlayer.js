const { spawn, execSync } = require("child_process");
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, StreamType } = require('@discordjs/voice');
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

        const streamUrl = execSync(`yt-dlp -f bestaudio --get-url ${queue.songs[0].url}`).toString().trim();
        const ffmpeg = spawn("ffmpeg", [
            "-re",
            '-analyzeduration', '0',
            '-loglevel', '0',
            "-i", streamUrl,
            "-f", "s16le",
            "-ar", "48000",
            "-ac", "2",
            "pipe:1"
        ], { stdio: ['ignore', 'pipe', 'ignore'] });

        const resource = createAudioResource(ffmpeg.stdout, {inputType: StreamType.Raw, inlineVolume: true});
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
                MusicChannel.update(guildId).then(() => {
                    ServerQueue.delete(guildId); // queue 접근 불가
                });
            }
            else this.play(guildId);
        });
    }
}

module.exports = new MusicPlayer();