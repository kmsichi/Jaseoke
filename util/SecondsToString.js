function secondsToString(t) {
    let hour = undefined;
    if (t/3600 > 1)
        hour = (t/3600) > 10 ? (t/3600) : '0'+(t/3600);
    let min = (t%3600/60) > 10 ? (t%3600/60) : '0'+(t%3600/60);
    let sec = (t%60) > 10 ? (t%60) : '0'+(t%60);

    if (hour == undefined) 
        return `${min}:${sec}`;
    else
        return `${hour}:${min}:${sec}`;
}

module.exports = { secondsToString };