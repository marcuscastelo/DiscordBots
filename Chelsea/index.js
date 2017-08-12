const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const youtube = require('./youtube.js');
const bot = new Discord.Client();
const fs = require('fs');
const getDuration = require('get-video-duration')

//OPTIONS
let guild;
const optBotChannelName = "music_chelseabot";
const prefix = ",";
const separator = '\n------------------------------'
//END OPTIONS

let _voiceConnections = {}
let dispatcher = {}
let joined = {}
let playlist = {}
let index = {}
let skipping = {}
let volume = {}
let playing = {}
let loop = {}
let playindex = {}
let waitrestart = false
let shuffleindexes = {}
let shuffle = {}
let paused = {}

function updatePermanence(){
	
    if (fs.existsSync('permanence.p'))
        fs.unlinkSync('permanence.p')

    let lastVoiceChannelIds = {}
    
    for (var key in _voiceConnections){
        if (_voiceConnections[key] && _voiceConnections[key].channel){
            lastVoiceChannelIds[key] = _voiceConnections[key].channel.id
        }
    }

    try{
        fs.writeFileSync('permanence.p',JSON.stringify([lastVoiceChannelIds,playlist,index,volume,playing,playindex,shuffleindexes,shuffle,paused,loop,joined]))
    }
    catch (err){
       
    }
}

function updateVoiceConnections(){
	_voiceConnections = {}
	bot.guilds.array().forEach(guild=>{
                 if (guild.voiceConnection)
            _voiceConnections[guild.id] = guild.voiceConnection
        	if (guild.voiceConnection)
        		joined[guild.id] = true
        	else
        		joined[guild.id] = false
    })
    updatePermanence()
}

function aleatorizarIndex(message){
    console.log("[aleatorizarIndex] Começando aleatorização")

    let getIndex = (usedIndexes)=>{
        if (usedIndexes.length == playlist[message.guild.id].length){
            console.log("[aleatorizarIndex] Fim da Playlist")
            return usedIndexes.length
        }
        while(true){
            console.log("[aleatorizarIndex] Começando aleatorização")
            let x = 0;
            if (playlist[message.guild.id].length>1)
            {
                x = Math.floor(Math.random()*(playlist[message.guild.id].length-0.01))
                console.log("[aleatorizarIndex] Aleatorizado index: "+x);
            }
            else{
                console.log("[aleatorizarIndex] Apenas 1 música, retornando 0 como index")
                return 0;
            }
            if (usedIndexes.indexOf(x) < 0){
                console.log("[aleatorizarIndex] Retornando "+x);
                return x;
            }
            else
                console.log("[aleatorizarIndex] Index já foi tocado")
        }
            
    }

    index[message.guild.id] = getIndex(shuffleindexes[message.guild.id])
    shuffleindexes[message.guild.id].push(index[message.guild.id])
}

function playMusic(message,lala){
    
    let chan_ = ''

    if (message == 'channel')
        chan_ = lala
    else
        chan_ = message.channel
    
    //console.log(chan_)

    console.log(separator)
    if (waitrestart)
    {
        console.log('***** [PlayMusic] BOT AGUARDANDO REINICIO, REINICIANDO...')
        bot.destroy()
        process.exit(1)
    }
    let playitem = playlist[chan_.guild.id][index[chan_.guild.id]];
    let myindex = index[chan_.guild.id];
    if (joined[chan_.guild.id]){
        if (playlist[chan_.guild.id].length<=0){
            console.log('+[PlayMusic] Playlist vazia, não vai tocar nada')
            chan_.send(`\`\`\`css\nPlaylist esta vazia\n\`\`\``)
            return
        }

        //Fim da playlist
        if (index[chan_.guild.id] >= playlist[chan_.guild.id].length){
            console.log('[PlayMusic] Index maior que tamanho, significa o FIM da playlist')
            //Loop All
            if (loop[chan_.guild.id]==2){
                console.log('+[PlayMusic] Loop na playlist toda, reiniciando reprodução')
                shuffleindexes[chan_.guild.id] = []
                if (shuffle[chan_.guild.id])
                    aleatorizarIndex(message)
                else
                    index[chan_.guild.id] = 0
                playMusic(message)
                return
            }
            //Sem Loop
            else{
                console.log('+[PlayMusic] Sem Loop, fim da reprodução')
                chan_.send(`\`\`\`css\n[End] of Playlist\n\`\`\``)
                return
            }
        }

        
        
        let voiceConnection = _voiceConnections[chan_.guild.id]
     
        let videoUrl = playitem.url
        let stream = ytdl(videoUrl, { filter: 'audioonly' })
        getDuration(stream).then(duration=>{
             let target = Math.ceil(duration)
             chan_.send(`\`\`\`css\nTocando agora [Loop = ${(loop[chan_.guild.id]==0)?"Off":(loop[chan_.guild.id]==1)?"Um":"Todos"}]:\n ${(index[chan_.guild.id]+1)}. [${playitem.name}] -- [0/${target}] -- added by ${playitem.user}\n\`\`\``).then(mensagen=>{
                 
                 let frozenindex = index[chan_.guild.id]
                 let timmy = 0

                 let convertTime = (seg)=>{
                     let resto = seg
                     let texto = ''
                     if (resto>=3600){
                        resto = Math.floor(seg/3600)
                        if (resto<10)
                            texto+='0'
                        texto += resto+':'
                        resto = (seg/3600.0-resto)*3600
                     }
                     if (resto>=60){
                         let min = Math.floor(resto/60)
                         if (min<10)
                            texto+='0'
                         texto += min + ':'
                        resto = Math.round((resto/60.0-min)*60)
                     }
                     if (resto<10)
                         texto+='0'
                     texto += resto       
                     return texto               
                 }

                 let edition = ()=>{
                     
                     if (timmy>target) timmy = target
                     let count = Math.floor(timmy/target*75)
                     let tracos = ''
                     for (i=0;i<count-1;i++){
                         tracos+='-'
                     }
                     tracos+='o'
                     for(i=count;i<75;i++){
                         tracos+=' '
                     }
                     mensagen.edit(`\`\`\`css\nTocando agora [Loop = ${(loop[chan_.guild.id]==0)?"Off":(loop[chan_.guild.id]==1)?"Um":"Todos"}] --- [Shuffle = ${(shuffle[chan_.guild.id])?"On":"Off"}]:\n ${(frozenindex+1)}. [${playitem.name}] -- added by ${playitem.user}\n|${tracos} |\n [${convertTime(timmy)}]                                                        ${timmy<60?'   ':''}${timmy<3600?'   ':''}${target<60?'   ':''}${target<3600?'   ':''}[${convertTime(target)}]\n\`\`\``).then(()=>{
                         if (timmy< target){
                            if (!paused[chan_.guild.id])
                                timmy+=5
                            if (index[chan_.guild.id]>frozenindex)
                                timmy = target
                            setTimeout(edition,5000)
                         }
                     })
                 
                 }
                 edition()

             })
        })   
        
        console.log('[PlayMusic] Iniciando stream da música: '+playitem.name)
        dispatcher[chan_.guild.id] = voiceConnection.playStream(stream, { seek:0, volume:volume[chan_.guild.id] })

        playing[chan_.guild.id]++;
        
        dispatcher[chan_.guild.id].on('end', ()=>{
            playing[chan_.guild.id]--;
            console.log('[PlayMusic] Fim do stram da Música: '+playitem.name)
            if ((loop[chan_.guild.id]!=1 || skipping[chan_.guild.id]) && !playindex[chan_.guild.id]) 
                if (shuffle[chan_.guild.id]){
                    console.log('[PlayMusic] Aleatorizando próximo index (shuffle)')
                    aleatorizarIndex(message)
                }
                else{
                    console.log('[PlayMusic] Somando um no index')
                    shuffleindexes[chan_.guild.id] = []
                    index[chan_.guild.id]++
                }


            skipping[chan_.guild.id] = false;
            if (!playindex[chan_.guild.id])
                playMusic(message)
            playindex[chan_.guild.id] = false;
        })
    }
    else console.error('Tentou método playmusic mas nao estava joined')

    updatePermanence()
}

bot.on('ready',()=>{
    console.log('\n\nBot Online\nServers conectados:\n')
    bot.user.setPresence({status:'online', game: {name:'Type ,help'}})

    let lastVoiceChannelIds = {}
    if (fs.existsSync('permanence.p')){ ///////////////////////////////////////////////////////////////HERE FALSE
        console.log('Existe persistence')
        let back = JSON.parse(fs.readFileSync('permanence.p'))
        /*lastVoiceChannelIds = back[0]
        console.log(lastVoiceChannelIds)*/
        playlist = back[1]
        index = back[2]
        volume = back[3]/*
        playing = back[4]
        playindex = back[5]*/
        shuffleindexes = back[6]
        shuffle = back[7]/*
        paused = back[8]
        loop = back[9]
        joined = back[10]*/

        bot.guilds.array().forEach(guild=>{
        	playing[guild.id] = 0
			loop[guild.id] = 0
        	playindex[guild.id] = false
			paused[guild.id] = false
        	joined[guild.id] = false
        	skipping[guild.id] = false
    	});
    }
    else
        console.log('* NÃO Existe persistence')

    bot.guilds.array().forEach(guild=>{
        
        console.log(' -'+guild.name)
        
        if (!(guild.id in playlist)){
            console.log('GUILDA NOVA, CONFIGURAÇÕES PADRÃO')
            playlist[guild.id] = []
            index[guild.id] = 0
            volume[guild.id] = 0.1
            playing[guild.id] = 0
            loop[guild.id] = 0
            playindex[guild.id] = false
            shuffle[guild.id] = false
            shuffleindexes[guild.id] = []
            paused[guild.id] = false
            joined[guild.id] = false
        }
        else{
            console.log('LENDO INFO')
            if (joined[guild.id]){
                console.log('Joining?')
                if (lastVoiceChannelIds[guild.id]){
                    guild.channels.get(lastVoiceChannelIds[guild.id]).join().then((c=>{
                            console.log('+[Join] Sucesso canal PERMANENECE')
                            updateVoiceConnections()
                            joined[message.guild.id] = true
                            if (playing[guild.id] && playing[guild.id]>0){
                                let channel = guild.channels.filter(x=>x.name == optBotChannelName).find('type','text')
                                console.log(channel)
                                if (channel)
                                playMusic('channel',channel)
                            }
                    }))
                }
                
            }
        }
        skipping[guild.id] = false
    })
    console.log('\n'+separator+'\n')
})

let userIDs = [
    '238325452588974081', //Luiz
    '301487687922221059', //Gary
    '264494046137810944', //Caorti
    '264284264475000842'
]

let banned = []

bot.on('message',(message)=>{
    if (message.author == bot.user ||
        message.channel == message.author.dmChannel||
        !message.content.startsWith(prefix)||
        message.channel.name != optBotChannelName||
        banned.indexOf(message.author.id)>0)
        return;

    let command = message.content.split(' ')
    let params = command.slice(1)
    command = command[0].slice(1)

    console.log(separator+'\nRecebido: '+command+' '+params.join(' '))

    if (command == "shutdown"){
        console.log('Desligando Nice...')
    	bot.destroy()
    	process.exit(1)
    }
    else if (command == 'ban'){
    	if (userIDs.indexOf(message.author.id)>=0){
    		if (params.length>0&&params[0].length>0){
    			let member = message.guild.member(params[0].trim())
                message.reply(params[0]+"WIP")
                if (member){
    			    if (banned.indexOf(member.user.id)){
    				    banned.push(member.user.id)
    					setTimeout(()=>{
    					    banned.splice(banned.indexOf(member.user.id))
        				},300000)
    				}
                }
                else
                    message.reply("User not found")
    		}
    	}
    }
    else if (command.startsWith('lo')){
        if (params.length<1){
            console.log('** [Loop] argumento inválido')
            message.channel.send(',loop <one | all | none>')
            return
        }
        let loption = params[0]
        switch(loption){
            case 'one':
                console.log('[Loop] Repetindo uma música')
                message.channel.send(`\`\`\`css\n[Loop] Repetindo apenas uma musica\n\`\`\``)
                loop[message.guild.id] = 1
            break
            case 'all':
                console.log('[Loop] Repetindo todas as músicas')
                message.channel.send(`\`\`\`css\n[Loop] Repetindo todas as musicas\n\`\`\``)
                loop[message.guild.id] = 2
            break
            case 'none':
                console.log('[Loop] Desligado')
                message.channel.send(`\`\`\`css\n[Loop] Repeticao desligada\n\`\`\``)
                loop[message.guild.id] = 0
            break
            default:
                console.log('** [Loop] argumento inválido')
                message.channel.send(',loop <one | all | none>')
            return
        }
        


    }
    else if (command.startsWith('j')){
        console.log(separator)
        if (params.length > 0){
            
            let cname = params.join()
            console.log('[Join] Canal Especificado: '+cname)
            let channels = message.guild.channels.findAll("name",cname)
            let oldvc = _voiceConnections[message.guild.id]

            channels.forEach((channel)=>{

                if (channel && channel.type == 'voice'){
                    channel.join().then((c=>{
                            console.log('+[Join] Sucesso canal especifico')
                            updateVoiceConnections()
                            joined[message.guild.id] = true
                        }))
                }
            })
            if (_voiceConnections[message.guild.id] && oldvc == _voiceConnections[message.guild.id] && _voiceConnections[message.guild.id].channel.name != cname)
            {
                message.reply('Canal '+cname+' não existe ou não é de voz')
                console.log('** [Join] Canal de voz específico não existe')
                console.log(separator)
            }
        }
        else{
            voiceChannel = message.member.voiceChannel
            if (voiceChannel){
                console.log('[Join] Usuário está em um canal de voz.')
                if (joined[message.guild.id] && _voiceConnections[message.guild.id] == message.guild.voiceConnection){
                    console.log('+[Join] Usuário está no mesmo canal que o bot.')
                    console.log(separator)
                    message.reply("Já estou no seu canal de voz, adicione uma música e dê play")
                }
                else{
                    console.log('[Join] Preparando join para seguir')
                    voiceChannel.join().then((c=>{
                        updateVoiceConnections()
                        joined[message.guild.id] = true
                        console.log('+[Join] Seguido com sucesso')
                        console.log(separator)
                    }))
                }
            }
            else{
                message.reply("Você não está em nenhum canal de voz :(")
                console.log('** [Join] Usuário não estava em nenhum canal')
                console.log(separator)
            }
            
        }
    }
    else if (command.startsWith('l')){
        vc = _voiceConnections[message.guild.id]
        if (vc)
            vc.disconnect()
        joined[message.guild.id] = false
        console.log(`${separator}\n[Leave] Sucesso${separator}`)
    }
    else if (command.startsWith('a') || command.startsWith('z')){
        let search = params.join(' ')

        

        if (search.trim() == ''){
            console.log(separator)
            console.log('** [Add] Parâmetros incorretos')
            console.log(separator)
            message.channel.send(`Correct Syntax: \n  ${prefix}add <music name/yt url>`)
            return
        }

        console.log(separator)
        console.log('[Add] Parâmetro: '+search)

        let listID = videoID = null

        if (search.indexOf('&list')>-1){
            console.log('[Add] Playlist (em vídeo) identificada... ')
            let bgfd = search.split('&list=')[1]
            if (bgfd.indexOf('&')>-1)
                bgfd = bgfd.split('&')[0]
            
            listID = bgfd
        }
        else if (search.indexOf('?list')>-1){
            console.log('[Add] Playlist (fora de vídeo) identificada... ')
            let bgfd = search.split('?list=')[1]
            if (bgfd.indexOf('&')>-1)
                bgfd = bgfd.split('&')[0]
            
            listID = bgfd
        }
        else{
            let dregExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?list=|\&list=)([^#\&\?]*).*/;
            let dmatch = search.match(dregExp); 
            if (dmatch && dmatch[2].length == 11) { 
                console.log('[Add] Playlist identificada (RegExp)... ')
                listID = dmatch[2]
            } else {
                
                var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                var match = search.match(regExp);
                if (match && match[2].length == 11) {
                    console.log('[Add] VideoID identificado (RegExp)... ')
                    videoID = match[2]
                } else {
                    console.log('[Add] Pesquisa normal no youtube... ')
                }
            }
        }

        let lastlength = playlist[message.guild.id].length
        
        let callback = (videoID, videoName)=>{
            if (videoID == null) {
                console.log('** [Add] Youtube não possui nenhum resultado para: '+search)
                message.channel.send('** [Add] Youtube não possui nenhum resultado para: '+search)
                return;
            }
            
            else if (videoID == "private") {
                console.log(`** [Add] Playlist privada, não deu pra adicionar`);
                message.channel.send(`** [Add] Playlist privada, não deu pra adicionar`)
                return;
            }
            else if (videoID == "end") {
                let newlength = playlist[message.guild.id].length
                if (newlength-lastlength == 1)
                	message.channel.send(`\`\`\`css\n${playlist[message.guild.id][newlength-1].user} Added:\n ${(playlist[message.guild.id].length)}. [${playlist[message.guild.id][playlist[message.guild.id].length-1].name}]\n\`\`\``)
                else
                	message.channel.send(`\`\`\`css\n${playlist[message.guild.id][newlength-1].user} Added ${newlength-lastlength} new musics from:\n\n[https://www.youtube.com/playlist?list=${listID}]\n\`\`\``)
                console.log(`+[Add] Fim da Adição`);
                console.log(separator)
                if (_voiceConnections[message.guild.id] && joined[message.guild.id] && playing[message.guild.id] == 0){
                    console.log(`+[Add] Joinada no canal, iniciar música.`);
                    playMusic(message)
                }
                updatePermanence()

                return;
            }
            else{
                playlist[message.guild.id].push({
                    'name':videoName,
                    'url':`${youtube.watchVideoUrl}${videoID}`,
                    'user':message.author.username
                })
            }
        }


        if (listID){
            youtube.playlistUrls(listID, callback)
            return;
        }        
        else{
            if (videoID){
                youtube.addById(videoID, callback)
            }
            else{
                youtube.search(search, callback)
            }
        }
    }
    else if (command.startsWith('re')){
        let indx = parseInt(params[0])-1

        if (playlist[message.guild.id].length<=0){
            message.channel.send(`\`\`\`css\n[Remove] Playlist vazia, nada para remover\n\`\`\``)
            return
        }

        if (indx<0 || indx>=playlist[message.guild.id].length){
            message.channel.send(`\`\`\`css\n[Remove] Index fora dos limites [1${playlist[message.guild.id].length>1?`-${playlist[message.guild.id].length}`:""}]\n\`\`\``)
            return
        }

        if (indx<index[message.guild.id]){
            index[message.guild.id]--
        }
        else{
            if (indx == index[message.guild.id] && playing[message.guild.id] > 0){   
                skipping[message.guild.id] = true;
            
            	dispatcher[message.guild.id].end()            
            }
        }
        message.channel.send(`\`\`\`css\n[${message.author.username}] Removeu a musica:\n ${indx+1}. [${playlist[message.guild.id][indx].name}] adicionada por [${playlist[message.guild.id][indx].user}]\n\`\`\``)
        playlist[message.guild.id].splice(indx,1)
        
    }
    else if (command.startsWith('q') || command.startsWith('e')){
        
        let startind = 0
        let fim = index[message.guild.id]+7
        let msg = '```css\nPlaylist: ['+playlist[message.guild.id].length+' musicas]\n'
        if (index[message.guild.id] > 2)
            startind = index[message.guild.id]-2
        else
            fim+=2;
        
        if (playlist[message.guild.id].length<=0){
            
            message.channel.send('```css\nPlaylist is [empty]\n```')
            return
        }

        for (i = startind;i<fim;i++){
            if (i>playlist[message.guild.id].length-1){
                break
            }
            msg += `${((i==index[message.guild.id]&&dispatcher[message.guild.id])?'#':' ') +(i+1)}. [${playlist[message.guild.id][i].name}] - Added by ${playlist[message.guild.id][i].user}\n`
        }
        message.channel.send((msg+'\n```').toString()).catch(console.error)
    }
    else if (command.startsWith('Q'|| command.startsWith('E'))){
        
        
        if (playlist[message.guild.id].length<=0){
            message.channel.send('```css\nPlaylist is [empty]\n```')
        }
        else {
            let msg = '```css\nPlaylist:\n'
            let nmsg = Math.ceil(playlist[message.guild.id].length/10)
            for (a = 0 ; a < nmsg ; a++){
                for (b = 0; b < 10; b++){
                    let i = a*10+b
                    if (i>playlist[message.guild.id].length-1)
                        break
                    msg += `${((i==index[message.guild.id]&&dispatcher[message.guild.id])?'#':' ') +(i+1)}. [${playlist[message.guild.id][i].name}] - Added by ${playlist[message.guild.id][i].user} - ${shuffleindexes[message.guild.id].indexOf(i)>=0?'[Played]':''}\n`
                }
                message.channel.send(msg+'\n```')
                msg = '```css\n'
            }
        }
    }
    else if (command.startsWith('sh')){
        shuffle[message.guild.id] = !shuffle[message.guild.id]
        message.channel.send(`\`\`\`css\n[Loop] Aleatorizar ${shuffle[message.guild.id]?'ligado':'desligado'}\n\`\`\``)
    }
    else if (command.startsWith('pl')){
        console.log(separator)
        let xindx = 0

        if (params.length>0){ 
            xindx = parseInt(params[0])-1
            console.log('[Play] index específico: '+xindx)
        }
        
        if (xindx < 0 || xindx >= playlist[message.guild.id].length){
            console.log('** [Play] index específico fora dos limites')
            console.log(separator)
            return
        }

        if (playlist[message.guild.id].length<=0){
            console.log('** [Play] playlist vazia')
            console.log(separator)
            message.channel.send(`\`\`\`css\nPlaylist is [empty]\n\`\`\``)
            return
        }


        let xxplay= ()=>{
            if (joined[message.guild.id]){
                
                console.log('[Play] Limpando indexes usados (shuffle)...')
                shuffleindexes[message.guild.id] = []
                console.log('[Play] Chamando PlayMusic()...')


                if (params.length>0){
                    console.log('[Play] index especificado, mudando')
                    index[message.guild.id] = xindx
                    shuffleindexes[message.guild.id].push(xindx)
                }
                else if (shuffle[message.guild.id]){
                    console.log('[Play] shuffle ligado, index nao especeificado, aleatorizando...')
                    shuffleindexes[message.guild.id] = []
                    aleatorizarIndex(message)
                }
                else{
                    console.log('[Play] index nao especeificado, começando do comeco...')
                    index[message.guild.id] = 0
                }
                if (playing[message.guild.id]>0){
                    playindex[message.guild.id] = true;
                }
                
                playMusic(message)    

            }
        }

        if (!joined[message.guild.id]){
            console.log('[Play] bot não joinado, joinando...')
            voiceChannel = message.member.voiceChannel
            if (voiceChannel){
                voiceChannel.join().then((c)=>{
                    console.log('[Play] bot joinou sucesso')
                    updateVoiceConnections();
                    xxplay()
                })
            }
        }
        else xxplay()
    }
    else if (command.startsWith('v')){
    	let oldv = volume[message.guild.id]
        if (params.length > 0){
            volume[message.guild.id] = parseFloat(params[0])/100
            volume[message.guild.id] = fs.existsSync('limit') ? (volume[message.guild.id] < 0 ? 0 : (volume[message.guild.id] > 1 ? 1 : volume[message.guild.id])) : volume[message.guild.id]
            if (dispatcher[message.guild.id])
                dispatcher[message.guild.id].setVolume(volume[message.guild.id])
            message.channel.send('```css\n[' + message.author.username + '] mudou o volume de ['+oldv*100+'%] para ['+volume[message.guild.id]*100+'%]\n```')
        }
        else{
            message.channel.send('```css\nActual volume is ['+volume[message.guild.id]*100+'%]\n```')
        }
    }
    else if (command.startsWith('p')){
        if (dispatcher[message.guild.id]){
            dispatcher[message.guild.id].pause();
        }
        paused[message.guild.id] = true
    }
    else if (command.startsWith('r')){
        if (dispatcher[message.guild.id]){
            dispatcher[message.guild.id].resume()
        }
        paused[message.guild.id] = false
    }
    else if (command.startsWith('c')){
        console.log(separator+'\n+[Clear] Resetando Valores e apagando playlist...\n'+separator)
        playing[message.guild.id] = 0;
        index[message.guild.id] = 0;
        shuffleindexes[message.guild.id] = []
        message.channel.send(`\`\`\`css\nPlaylist has been cleared!\n\`\`\``)
        playlist[message.guild.id] = [];
        if (dispatcher[message.guild.id])
            dispatcher[message.guild.id].pause()
    }
    else if (command.startsWith('s')){
        if (playing[message.guild.id]>0 && dispatcher[message.guild.id]){
            console.log('+[Skip] Forçando encerramento da stream...')
            message.channel.send(`\`\`\`css\n[${message.author.username}] Pulou a musica:\n ${index[message.guild.id]+1}. [${playlist[message.guild.id][index[message.guild.id]].name}] adicionada por [${playlist[message.guild.id][index[message.guild.id]].user}]\n\`\`\``)
            skipping[message.guild.id] = true;
            dispatcher[message.guild.id].end()
        }
        else{
            console.log(separator)
            console.log('** [Skip] Nada tocando para pular')
            console.log(separator)
            message.channel.send("```css\n[skip] Nada tocando...\n```");
        }
    }
    else if (command.startsWith('h')){
        message.channel.send(`
        \`\`\`\`css
Chelsea é um bot de Música dedicado, para controlá-la utilize estes comandos:

[h ] ,help - Este guia de comandos
[q ] ,queue - Exibe a playlist resumida e os números (,Q - playlist completa)
[a ] ,add <nome da música/url youtube>
[re] ,remove <número da música>
[c ] ,clear - Limpa a Playlist
[j ] ,join [nome do canal]- O bot entra no canal de voz especificado ou te segue
[l ] ,leave - Faz o bot sair do canal de voz
[pl] ,play [num] - Começa a tocar a playlist [a partir de uma música]
[p ] ,pause - Pausa
[r ] ,resume - Despausa
[v ] ,volume <1-100>
[s ] ,skip 
\`\`\``)
    }
    else if (command.startsWith('restartw')){
        waitrestart = true
    }
    updatePermanence()
})

bot.login("MjY2MDQyNDY5MDA5OTgxNDQy.DECCNg.kDczYKsxfuFfIP0AprSzSs1cFqI");