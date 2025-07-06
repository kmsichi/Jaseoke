const axios = require("axios");

async function getYoutubeVideoInfo(url) {
    try {
        const response = await axios.get(url);
        const regex = /ytInitialPlayerResponse\s*=\s*(\{.*?\});/s;
        const match = regex.exec(response.data);

        if (!match || !match[1]) 
            throw new Error("No Data");
        
        playerResponse = JSON.parse(match[1]);
        const videoDetails = playerResponse.videoDetails;

        return videoDetails;
    } catch (err) {
        throw new Error("유튜브 영상 정보 수집에 실패했습니다!");
    }
}

module.exports = { getYoutubeVideoInfo };