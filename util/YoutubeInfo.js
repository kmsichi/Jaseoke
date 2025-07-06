const axios = require("axios");

async function getYoutubeVideoInfo(videoId) {
    try {
        const response = await axios.get(`https://youtu.be/${videoId}`);
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

async function searchYoutubeVideo(searchword, resultsCount) {
    try {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search?`, {
            params: {
                "part": "snippet",
                "maxResults": resultsCount,
                "regionCode": "KR",
                "q": searchword,
                "type": "video",
                "key": process.env.YOUTUBE_API_TOKEN
            }
        });

        return response.data.items;
    } catch (err) {
        console.error("유튜브 영상 검색 중 에러가 발생했습니다. : "+ err);
        throw new Error("유튜브 영상 검색에 실패했습니다!");
    }
}

module.exports = { getYoutubeVideoInfo, searchYoutubeVideo };