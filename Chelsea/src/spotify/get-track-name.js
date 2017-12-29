import Logger from '../logger.js'

var request = require('request'); // "Request" library

var client_id = '661b1186b72e4423bdfb62c497b556f8'; // Your client id
var client_secret = '21b15c76b8554a9d9784d0f318b4af3a'; // Your secret

// your application requests authorization
var authOptions = {
	url: 'https://accounts.spotify.com/api/token',
	headers: {
		'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
	},
	form: {
		grant_type: 'client_credentials'
	},
	json: true
};


export default function getTrack(trackID){
    return new Promise((res,rej)=>{
		Logger.log('Fazendo request na api do spotify (auth)',4)
        request.post(authOptions, function(error, response, body) {
			Logger.log('Resposta obtida',4)
			if (!error && response.statusCode === 200) {
				Logger.log('Cod 200 OK',4)
				
				// use the access token to access the Spotify Web API
				var token = body.access_token;
				var options = {
					url: `https://api.spotify.com/v1/tracks/${trackID}`,
					headers: {
						'Authorization': 'Bearer ' + token
					},
					json: true
				};

				Logger.log('Fazendo request na api do spotify (track)',4)
				request.get(options, function(error, response, body) {
					Logger.log('Resposta obtida',4)
					if (!error && response.statusCode == 200){
                        Logger.log('Sem Erros',4)
                    	res(body.artists[0].name +' - '+ body.name)
					}
                    else {
						Logger.warn('Erro get request spotify (tracks)',2)
						rej(error,response)
					}
				});
            }
            else{
				Logger.warn('Erro post request spotify (auth)',2)
				rej(error,response)
			}
		});
    })
}