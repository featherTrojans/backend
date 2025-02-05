exports.serverTime = () => {
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = String(date_ob.getDate()).padStart(2, '0');
    let month = String(date_ob.getMonth() + 1).padStart(2, '0');
    let year = date_ob.getFullYear();
    let now = String(date_ob.getHours()).padStart(2, '0') + ':' +  String(date_ob.getMinutes()).padStart(2, '0')

    let today = String(date_ob.getHours()).padStart(2, '0') + ':' +  String(date_ob.getMinutes()).padStart(2, '0') + ':' + String(date_ob.getSeconds()).padStart(2, '0')
    let time = date_ob.getTime();
    let yesterday = time - ( 24 * 3600 * 1000) + (3600 * 1000)
    date_ob.setSeconds(0,0);
    var timeToUse = date_ob.getTime();
    let fifteen_mins_ago = time - ( 75 * 60 * 1000) + (3600 * 1000) // in utc since the server timezone is utc
    let five_mins_ago = time - Math.round( 0.083 * 3600 * 1000) + (3600 * 1000) // in utc since the server timezone is utc
    let thirty_minutes_ago = time - Math.round(0.5 * 3600 * 1000) + (3600 + 1000)
    date_ob.setSeconds(0,0);
    return {now, fullYear: `${year}-${month}-${date}`, today, yesterday, timeToUse, fifteen_mins_ago, year, month, date, five_mins_ago, thirty_minutes_ago}
}