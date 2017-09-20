var request = require('superagent');
var fs = require('fs');
const API_KEY = "AIzaSyCneySjr5us11LlVZTMfDbe2stCNIwh-to";
const WATCH_VIDEO_URL = "https://www.youtube.com/watch?v=";

exports.watchVideoUrl = WATCH_VIDEO_URL;

exports.playlistUrls = function playlistUrls(playlistId,callback){
    var requestUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=15&playlistId=' + `${playlistId}&type=video&key=${API_KEY}`;

    let act = function act(error,response){
        var body = response.body;
        if (!error && response.statusCode == 200) {            
            
            if (body.items.length == 0) {
                console.log("Your search gave 0 results");
                callback(null,null);
                return;
            }

            for (var item of body.items) {

                if (item.kind === 'youtube#playlistItem') {
                    callback(item.snippet.resourceId.videoId, item.snippet.title);
                }
            }

            if (body.nextPageToken){
                request(requestUrl+`&pageToken=${body.nextPageToken}`, act);
                return
            }
            else
            {
                callback("end",null);
                return;
            }
        }
        else {
            if (body.error.errors[0].reason==='playlistItemsNotAccessible')
                callback("private",null);
            console.log("Unexpected error when searching YouTube");
            return;
        }
    };
    request(requestUrl, act);
}

exports.addById = function addById(videoId,callback){
    var requestUrl = 'https://www.googleapis.com/youtube/v3/videos' + `?part=snippet&id=${videoId}&fields=items(snippet(title))&key=${API_KEY}`;

    request(requestUrl, (error, response) => {
        if (!error && response.statusCode == 200) {

            var body = response.body;
            if (body.items.length == 0) {
                console.log("Your search gave 0 results");
                callback(null,null);
                return;
            }

            for (var item of body.items) {
                callback(videoId, item.snippet.title);
                callback("end",null);
                return;
            }
        }
        else {
            console.log("Unexpected error when searching YouTube");
            return;
        }
    });
}

exports.search = function search(searchKeywords, callback) {
    var requestUrl = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(searchKeywords)}&type=video&key=${API_KEY}`;

    request(requestUrl, (error, response) => {
        if (!error && response.statusCode == 200) {

            var body = response.body;
            if (body.items.length == 0) {
                console.log("Your search gave 0 results");
                callback(null,null);
                return;
            }

            for (var item of body.items) {
                if (item.id.kind === 'youtube#video') {
                    callback(item.id.videoId, item.snippet.title);
                    callback("end",null);
                    return; // prevent adding entire list of youtube videos
                }
            }
        }
        else {
            console.log("Unexpected error when searching YouTube");
            return;
        }
    });

    return;
};