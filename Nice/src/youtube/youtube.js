import request from 'superagent'
import http from 'request'
import fs from 'fs'

const API_KEY = "AIzaSyCneySjr5us11LlVZTMfDbe2stCNIwh-to";
const WATCH_VIDEO_URL = "https://www.youtube.com/watch?v=";

function orderItems(orderer,ordered){
    let a = orderer.slice()
    let b = ordered.slice()

    let newd = []
    for (let ia of a){
        for (let ib of b){
            if (ib.videoId === ia){
                newd.push(ib)
                continue
            }
        }
    }
    return newd
}
export default class Youtube{

static get watchVideoUrl() {return WATCH_VIDEO_URL}

static addById(videoId,callback){
        var requestUrl = 'https://www.googleapis.com/youtube/v3/videos' + `?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`;
    
        request(requestUrl,(error, response) => {
            if (!error && response.statusCode == 200) {
    
                var body = response.body;
                if (body.items.length == 0) {
                    //console.log("Your search gave 0 results");
                    callback('404',null);
                    return;
                }
    
                for (var item of body.items) {
                    callback(videoId, item.snippet.title,item.contentDetails.duration);
                    return;
                }
            }
            else {
                //console.log("Unexpected error when searching YouTube");
                return;
            }
        });
    }

static playlistUrls(playlistId,callback){
        var requestUrl = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=15&playlistId=' + `${playlistId}&type=video&key=${API_KEY}`;

        let items = []
        let ordered = []
        let total = false
        
        let act = function act(error,response){
            var body = response.body;
            if (!error && response.statusCode == 200) {            
                
                if (body.items.length == 0) {
                    //console.log("Your search gave 0 results");
                    callback('404',null);
                    return;
                }

                if (!body.nextPageToken){
                    total = true;
                }                
                
                for (let item of body.items) {
                    if (item&&item.kind === 'youtube#playlistItem' && item.contentDetails.videoPublishedAt) {
                    
                        ordered.push(item.snippet.resourceId.videoId)
                        Youtube.addById(item.snippet.resourceId.videoId, (videoId,videoTitle,duration)=>{
                            //console.log(videoId)
                            
                            if (!items.find(i=>item.videoId==i.videoId))
                            items.push({
                                videoId:videoId,
                                videoTitle:videoTitle,
                                duration:duration
                            })

                            if (total && items.length == ordered.length){
                                callback('end',orderItems(ordered,items))
                            }
                        });
                    }
                }

                if (!total){
                    request(requestUrl+`&pageToken=${body.nextPageToken}`, act);
                    return
                }
    

            }
            else {
                if (body.error.errors[0].reason==='playlistItemsNotAccessible')
                    callback("private",null);
                else{
                    callback('404',null)
                }
                //console.log("Unexpected error when searching YouTube");
                return;
            }
        };
        request(requestUrl, act);
    }

static search(searchKeywords, callback) {
        
        var requestUrl = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${searchKeywords}&type=video&key=${API_KEY}`;

        var options = {
			uri: requestUrl,
            json: true
		};

        http.get(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                //console.dir(body)//
                if (body.items.length == 0) {
                    //console.log("Your search gave 0 results");
                    callback('404',null);
                    return;
                }
    
                let cie = 0
                for (var item of body.items) {
                    if (item.id.kind === 'youtube#video') {
                        callback(item.id.videoId, item.snippet.title);
                        cie++
                        if (cie>=3){
                            callback("end",null);
                            return
                        }
                    }
                    
                }
                if (cie<3){
                    callback("end",null);
                    return
                }
            }
            else {
                console.log("Unexpected error when searching YouTube");
                return;
            }
        });
    
        return;
    };

    static isLiveStream(videoID, callback){
        var requestUrl = 'https://www.googleapis.com/youtube/v3/videos' + `?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`;

            request(requestUrl,(error, response) => {
                if (!error && response.statusCode == 200) {
        
                    var body = response.body;
                    if (body.items.length == 0) {
                        //console.log("Your search gave 0 results");
                        callback(false);
                        return;
                    }
        
                    for (var item of body.items) {
                        callback(item.snippet.liveBroadcastContent == 'live');
                        return;
                    }
                }
                else {
                    //console.log("Unexpected error when searching YouTube");
                    return;
                }
            });
    }
}
