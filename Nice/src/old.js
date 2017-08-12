const Discord = require("discord.js");
const bot = new Discord.Client();
const youtubeUrl = require('./youtube/url.js')
const youtube = require('./youtube/youtube.js')
const ytdl = require('ytdl-core');
const PastebinAPI = require('pastebin-js')
const pastebin = new PastebinAPI('7c7b3c1e3ea35bebaeffee78ead1ab1d');
const shuffle = require('shuffle-array')
const fs = require('fs')
const speech = require('google-speech-api')

//OPTIONS
const botname = 'Shiro'
const optBotChannelName = ("music_"+botname+"bot").toLowerCase();
const prefix = ",";
const separator = '\n------------------------------'
//END OPTIONS

let waitRestart = false


let playlist = {}
let playlist_bkp = {}
let shuff = {}
let actualIndex = {}
let loop = {}
let volume = {}
let saved_lists = {}

function saveData(){
    fs.writeFileSync('perm.json',JSON.stringify([playlist,playlist_bkp,shuff,actualIndex,loop,volume,saved_lists],null,'\t'))
}

function loadData(){
    if (fs.existsSync('perm.json')){
        let data = fs.readFileSync('perm.json')
        let ar = JSON.parse(data);
        playlist = ar[0]
		playlist_bkp = ar[1]
		shuff = ar[2]
		actualIndex = ar[3]
		loop = ar[4]
        volume = ar[5]
        saved_lists = ar[6]
    }
}

let Message = Discord.Message
let TextChannel = Discord.TextChannel
let VoiceChannel = Discord.VoiceChannel

/**
   * Similar to createCollector but in promise form. Resolves with a collection of reactions that pass the specified
   * filter.
   * @param {Message} message The filter function to use
   * @returns {Promise<Collection<string, MessageReaction>>}
   */
function playMusic(message, index, moe = false){       
        message.     
            /*msg += `${((i==actualIndex[message.guild.id]&&message.guild.voiceConnection&&message.guild.voiceConnection.dispatcher)?'#':' ') +(i+1)}. [${playlist[message.guild.id][i].videoTitle}] - Added by ${playlist[message.guild.id][i].addedBy}\n`
            chan_.send(`\`\`\`css\nTocando agora [Loop = ${(loop[chan_.guild.id]==0)?"Off":(loop[chan_.guild.id]==1)?"Um":"Todos"}]:\n ${(index[chan_.guild.id]+1)}. [${playitem.name}] -- [0/${target}] -- added by ${playitem.user}\n\`\`\``).then(mensagen=>{*/
            if (!message.guild.voiceConnection && message.member.voiceChannel)
                message.member.voiceChannel.join()
            
            while(!message.guild.voiceConnection && message.member.voiceChannel);

            if (message.guild.voiceConnection){
                if (moe){
                    message.guild.voiceConnection.playArbitraryInput('https://listen.moe/stream',{volume:volume[message.guild.id]})
                    return;
                }
                if (playlist[message.guild.id].length<=index){
                    if (loop[message.guild.id] != 2){
                        message.channel.send(`\`\`\`css\n[Fim da Playlist] \n\`\`\``)
                        actualIndex[message.guild.id] = 0
                        return;   
                    }
                    index = 0
                }
                actualIndex[message.guild.id] = index
                let vc = message.guild.voiceConnection
            
                let stream = ytdl('https://www.youtube.com/watch?v='+playlist[message.guild.id][index].videoID,{highWaterMark:32768})
                let firstData = true;
                stream.on('data',chunk=>{
                    if (!firstData) return;
                    firstData = false;

                    message.channel.send('musica so agora')
                })


                let disp;
                disp = vc.playStream(stream,{volume:volume[message.guild.id]})
                
                disp.on('start',()=>{
                    message.guild.voiceConnection.player.streamingData.pausedTime = 0;
                })
                disp.on('end',reason=>{
                    if (waitRestart){
                        bot.destroy()
                        process.exit()
                    }
                    if (reason != undefined && reason != 'clear' && reason != 'stop'){
                        playMusic(message,actualIndex[message.guild.id]+(reason=='replay'||loop[message.guild.id]==1?0:1))
                    }
                })
                message.channel.send(`\`\`\`\css\nTocando agora:\n #${index+1}. [${playlist[message.guild.id][index].videoTitle}] - adicionada por ${playlist[message.guild.id][index].addedBy}\n\`\`\``)
            }
            else{
                message.channel.send(`\`\`\`css\n[Play] Erro: ${botname} nao se encontra em um canal de voz\n\`\`\``)
            }
}

function initGuild(guild){
    if (!playlist[guild.id])    
        playlist[guild.id] = []
    if (!playlist_bkp[guild.id])    
    	playlist_bkp[guild.id] = []
    if (!shuff[guild.id])    
    	shuff[guild.id] = false
    if (!loop[guild.id])    
        loop[guild.id] = 0
    if (!actualIndex[guild.id])    
        actualIndex[guild.id] = 0
    if (!volume[guild.id])    
        volume[guild.id] = 0.1
    else return;
    guild.defaultChannel.send(`Muito obrigado por me receber em ${guild.name}, digite \`,help\` para saber mais sobre meus comandos `)
    saveData();
}
bot.on('guildDelete',guild=>{
    if (playlist[guild.id])   
        delete playlist[guild.id] 
    if (playlist_bkp[guild.id])   
        delete playlist_bkp[guild.id] 
    if (shuff[guild.id])   
        delete shuff[guild.id] 
    if (loop[guild.id])   
        delete loop[guild.id]
    if (actualIndex[guild.id])   
        delete actualIndex[guild.id] 
    if (volume[guild.id])   
        delete volume[guild.id]
    else return;
    saveData();
})
bot.on('guildCreate',initGuild)
bot.on("ready", ()=>{
    loadData()
    bot.syncGuilds();
    bot.guilds.map(initGuild)
    bot.fetchUser('264284264475000842').then(u=>u.send('I\'m ready!'))
})


bot.on("message",message=>{
    if (message.author == bot.user ||
        message.channel == message.author.dmChannel)
        return;

    if (message.channel.name != optBotChannelName){
        return;
    }

    if (!message.content.startsWith(prefix)){
        message.delete()
        return
    }
    
    let command = message.content.split(' ')
    let params = command.slice(1)
    command = command[0].slice(1)

    if (command.startsWith('se')){
        message.reply('todo: settings')
    }
    else if (command.startsWith('j')){
        if (params.length > 0){
            let cname = params.join()
            let channel = message.guild.channels.findAll("type","voice").find(c=>c.name==cname)
            if (channel){
                channel.join().catch(err=>message.reply(err.message))
            }
            else(message.channel.send(`\`\`\`css\n[Join] Erro: [${cname}] nao foi encontrado\n\`\`\``))
                
        }
        else{
            voiceChannel = message.member.voiceChannel
            if (voiceChannel){
                if (message.guild.voiceConnection && message.guild.voiceConnection.channel == voiceChannel){
                    message.channel.send(`\`\`\`css\n[Join] Info: Ja estou no seu canal de voz\n\`\`\``)
                }
                else{
                    voiceChannel.join()/*then(connection=>{
                        let receiver = connection.createReceiver()
                        receiver.createOpusStream(message.author).pipe(speech({filetype:'opus'},(err,results)=>{
                            if (err) throw err;
                            console.log(results)
                        }))
                    })*/
                }
            }
            else{
                message.channel.send(`\`\`\`css\n[Join] Erro: Voce nao esta em nenhum canal, use ,join <nome> para especificar\n\`\`\``)
            }
            
        }
    }
    else if (command.startsWith('e')){
        if (params.length>0){
            let name = params.join(' ')
            if (!isNaN(name[0])){
                message.channel.send(`\`\`\`css\n[Playlist] Erro: O nome nao pode comecar com numeros\n\`\`\``)
                return;
            }
            if (!saved_lists[message.guild.id])
                saved_lists[message.guild.id] = {}
            if (!saved_lists[message.guild.id][name])
            saved_lists[message.guild.id][name] = {} 
            saved_lists[message.guild.id][name].list = (shuff[message.guild.id]?playlist_bkp[message.guild.id]:playlist[message.guild.id])
            saved_lists[message.guild.id][name].user = message.author.username
            message.channel.send(`\`\`\`css\n[Playlist] ${message.author.username} salvou a playlist atual como [${name}]\n\`\`\``)
            saveData()
        }
        else
            message.channel.send(`\`\`\`css\n[Playlist] Erro: Nenhum nome especificado\n\`\`\``)   
    }
    else if (command.startsWith('d')){
        if (params.length>0){
            let name = params.join(' ')
            if (saved_lists[message.guild.id] && Object.keys(saved_lists[message.guild.id]).length>0){
                if (!isNaN(name)){
                    let i = parseInt(params[0])-1
                    if (i<0||i>=Object.keys(saved_lists[message.guild.id]).length){
                        message.channel.send(`\`\`\`css\n[Playlist] Erro: Index fora do intervalo\n\`\`\``)
                        return
                    }
                    name = Object.keys(saved_lists[message.guild.id])[i]   
                    delete saved_lists[message.guild.id][name]
                }
                else if (saved_lists[message.guild.id][name])
                    delete saved_lists[message.guild.id][name]
                else{
                    message.channel.send(`\`\`\`css\n[Playlist] Erro: Nenhuma playlist encontrada com o nome [${name}]\n\`\`\``)
                    return
                }
                saveData()
                message.channel.send(`\`\`\`css\n[Playlist] Playlist ${name} foi removida com sucesso\n\`\`\``)
            }
            else    
                message.channel.send(`\`\`\`css\n[Playlist] Erro: Nenhuma playlist salva\n\`\`\``)
        }
        else
            message.channel.send(`\`\`\`css\n[Playlist] Erro: Nenhuma playlist especificada\n\`\`\``)   
    }
    else if (command == 'invite'){
        bot.generateInvite().then(i=>message.reply(i))
    }
    else if (command.startsWith('i')){
        if (params.length>0){
            let name = params.join(' ')
            if (saved_lists[message.guild.id]){
                if (!isNaN(name)){
                    let i = parseInt(params[0])-1
                    if (i<0||i>=Object.keys(saved_lists[message.guild.id]).length){
                        message.channel.send(`\`\`\`css\n[Playlist] Erro: Index fora do intervalo\n\`\`\``)
                        return
                    }
                    name = Object.keys(saved_lists[message.guild.id])[i]
                }
                playlist[message.guild.id] = saved_lists[message.guild.id][name].list
                actualIndex[message.guild.id] =0
                message.channel.send(`\`\`\`css\n[Playlist] ${message.author.username} carregou [${name} (criada por ${saved_lists[message.guild.id][name].user})]\n\`\`\``)
                if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher){
                    message.guild.voiceConnection.dispatcher.end('clear')
                    playMusic(message,0)
                }
                saveData()
            }
            else 
                message.channel.send(`\`\`\`css\n[Playlist] Erro: Nenhuma playlist salva\n\`\`\``)   
        }
        else
            message.channel.send(`\`\`\`css\n[Playlist] Erro: Nenhuma playlist especificada\n\`\`\``)   
    }
    else if (command.startsWith('li')){
        if (saved_lists[message.guild.id] && Object.keys(saved_lists[message.guild.id]).length>0){
            let msg = '```css\n[Playlist] Listas salvas:\n\n'
            let i=1
            for (let key of Object.keys(saved_lists[message.guild.id])){
                msg+=`${i++}. [${key}] -- criada por ${saved_lists[message.guild.id][key].user}\n`
            }
            message.channel.send(msg+'\n```')
        }
        else message.channel.send(`\`\`\`css\n[Playlist] Nenhuma playlist salva\n\`\`\``)
    }
    else if (command.startsWith('lo')){
        if (params.length>0){
            switch(params[0].toLowerCase()){
                case 'one':
                    loop[message.guild.id] = 1
                break;
                case 'all':
                    loop[message.guild.id] = 2
                break;
                case 'off':
                    loop[message.guild.id] = 0
                break;
                default:
                    message.channel.send(`\`\`\`css\n[Loop] Erro: loop deve prover uma dessas opcoes: [one/all/off] \n\`\`\``)
                break;
            }
        }
        else
            message.channel.send(`\`\`\`css\n[Loop] Erro: loop deve prover uma dessas opcoes: [one/all/off] \n\`\`\``)
    }
    else if (command.startsWith('moe')){
        playMusic(message,0,true)
    }
    else if (command.startsWith('l')){
        if (message.guild.voiceConnection){
            message.guild.voiceConnection.disconnect()
            message.channel.send(`\`\`\`css\n[Leave] Info: ${botname} saiu do canal \n\`\`\``) 
        }

    }
    else if (command == 'wr'){
        waitRestart=true;
    }
    else if (command == 'shutdown'){
        message.channel.send(`\`\`\`css\n[Shutdown] \n\`\`\``)
        bot.destroy();
        process.exit(1);
        return;
    }
    else if (command.startsWith('a')){
        if (params.length>0){
            let search = params.join(' ')

            let lastind = -1
            if (playlist[message.guild.id]) lastind = playlist[message.guild.id].length-1
            let playlistID = youtubeUrl.getPlaylistID(search)
            let videoID = youtubeUrl.getVideoID(search)
            let playlisterror = false;
            let playlistsize = 0


            let startIfDispatcher = ()=>{
                if (message.guild.voiceConnection&&message.guild.voiceConnection.dispatcher==undefined)
                {
                    playMusic(message,lastind+1)
                }
            }

            let addPlayList = (videoID,videoTitle)=>{
                if (videoID == 'private'){
                    playlisterror = true
                    message.channel.send(`\`\`\`css\n[Add] Erro: Playlist privada, impossivel acessar \n\`\`\``)
                }
                else if (videoID!='end'){
                    putVideo(videoID,videoTitle)
                    playlistsize++
                }
                else{
                    if (!playlisterror){
                        message.channel.send(`\`\`\`css\n[Add] Info: ${message.author.username} adicionou ${playlistsize} novas musicas\n\`\`\``)
                        saveData()
                        startIfDispatcher();
                    }
                }
            }

            let putVideo = (videoID, videoTitle)=>{
                if (playlist[message.guild.id] == undefined)
                    playlist[message.guild.id] = []
                
                if (shuff[message.guild.id] == undefined || !shuff[message.guild.id] ){
                    playlist[message.guild.id].push({
                        videoID:videoID,
                        videoTitle,videoTitle,
                        addedBy:message.author.username
                    })
                }
                else{
                    playlist_bkp[message.guild.id].push({
                        videoID:videoID,
                        videoTitle,videoTitle,
                        addedBy:message.author.username
                    })
                    let randInd = 0
                    if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher){
                        randInd = parseInt(Math.round(Math.random()*((playlist[message.guild.id].length-1)-(actualIndex[message.guild.id]+1))+(actualIndex[message.guild.id]+1)))
                    }
                    else
                        randInd = parseInt(Math.round(Math.random()*(playlist[message.guild.id].length-1)))
                    playlist[message.guild.id].splice(randInd,0,{
                        videoID:videoID,
                        videoTitle,videoTitle,
                        addedBy:message.author.username
                    })
                    
                }
            }

            let addVideo = (videoID, videoTitle)=>{
                message.channel.send(`\`\`\`css\n${message.author.username} adicionou:\n ${(playlist[message.guild.id]?playlist[message.guild.id].length+1:1)}. [${videoTitle}] \n\`\`\``)
                putVideo(videoID,videoTitle)
                saveData()
                startIfDispatcher()
            }
            let sresult = {}
            let searchResult = (videoID,videoTitle)=>{
                if (videoID == '404')
                    message.channel.send(`\`\`\`css\n[Add] Erro: [${search}] -> nenhum resultado no youtube \n\`\`\``)
                else if(videoID!='end')
                    sresult[videoID] = videoTitle
                else{
                    let i = 0
                    let cho = {}
                    let txt = '```css\nAdicionar qual desses:\n'
                    for (videoID_ of Object.keys(sresult)){
                        i++
                        txt+= i + '. ['+sresult[videoID_]+']\n'
                        cho[i] = videoID_
                    }
                    txt+='\n[c] - Cancelar```'
                    message.channel.send(txt).then(sm=>{
                        message.channel.awaitMessages(m=>m.author.username==message.author.username&&m.content=='1'||m.content=='2'||m.content=='3'||m.content=='c',{max:1,time:10000,errors: ['time']})
                        .then(collected=>{
                            if(collected.first().content != 'c'){
                                let choi = parseInt(collected.first().content)
                                let vidid = cho[choi]
                                addVideo(vidid,sresult[vidid])
                            }
                            collected.first().delete()
                            sm.delete()
                        }).catch(collected=>{
                            sm.delete()
                        })
                    })
                }
                
            }

            if (playlistID&&videoID){
                message.channel.send("```css\nDeseja adicionar qual das opcoes?\n\n1. Playlist inteira\n2. Apenas este video\n\n[c] - Cancelar```").then(sm=>{
                    message.channel.awaitMessages(m=>m.author.username==message.author.username&&m.content=='1'||m.content=='2'||m.content=='c',{max:1,time:10000,errors: ['time']})
                    .then(collected=>{
                        switch(collected.first().content){
                            case '1':
                                youtube.playlistUrls(playlistID,addPlayList)
                                break;
                            case '2':
                                youtube.addById(videoID,addVideo)
                                break;
                        }
                        collected.first().delete()
                        sm.delete()
                    })
                    .catch(collected=>{
                         sm.delete()
                    })
                })
                
            }
            else if (playlistID){
                youtube.playlistUrls(playlistID,addPlayList)
            }
            else if (videoID){
                youtube.addById(videoID,addVideo)
            }
            else{
                youtube.search(search,searchResult)
            }

        }
        else
            message.channel.send(`\`\`\`css\n[Add] Erro: add deve prover o nome/link da musica \n\`\`\``)
    }
    else if (command.startsWith('rp')){
        if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher)
            message.guild.voiceConnection.dispatcher.end('replay')
    }
    else if (command.startsWith('r')){
        if (!playlist[message.guild.id] || playlist[message.guild.id].length<=0){
            message.channel.send(`\`\`\`css\n[Remove] Erro: Playlist vazia \n\`\`\``)
            return
        } 

        if (params.length>0){
            let input = params.join(' ')
            let range = {
                start:0,
                count:0
            }
            if (isNaN(input)){
                if (input.indexOf('-')>=0){
                    let a = input.split('-')
                    if (a[1].toLowerCase()=='n') a[1] = playlist[message.guild.id].length
                
                    if (a.length<2 || a[0] == '' || a[1] == ''){
                        message.channel.send(`\`\`\`css\n[Remove] Erro: Sintaxe incorreta (ex.: ,remove 3-5 ; ,remove 7-n)\n\`\`\``)
                        return
                    }

                    if (isNaN(a[0]) || isNaN(a[1])){
                        message.channel.send(`\`\`\`css\n[Remove] Erro: Sintaxe incorreta use numeros ou a letra 'n'\n\`\`\``)
                        return;
                    }
                    else{
                        range.start = parseInt(a[0])-1       
                        range.count = parseInt(a[1]) - range.start     
                        if (range.count<1){
                            message.channel.send(`\`\`\`css\n[Remove] Erro: Sintaxe incorreta (,remove x-y) em que x < y \n\`\`\``)
                        }
                    }        
                }
                else{
                    message.channel.send(`\`\`\`css\n[Remove] Erro: Sintaxe incorreta, use numeros\n\`\`\``)
                    return;
                }
            }
            else{
                range.start = parseInt(params[0])-1
                range.count = 1
            }
            if (range.start<0 || range.start>=playlist[message.guild.id].length){
                message.channel.send(`\`\`\`css\n[Remove] Erro: primeiro valor deve estar dentro do tamanho da playlist\n\`\`\``)
                return
            }
            if (range.count<1 || range.start+range.count>playlist[message.guild.id].length){
                message.channel.send(`\`\`\`css\n[Remove] Erro: segundo valor deve estar dentro do tamanho da playlist\n\`\`\``)
                return
            }
            let ai = -1

            if (actualIndex[message.guild.id] != undefined)
                ai = actualIndex[message.guild.id]
        
            

            let commandRemove = (range_,playlist_,bkp)=>{

                if (range_.start<=ai && !bkp){
                    if (range_.start+range_.count<=ai){
                        playlist_[message.guild.id].splice(range_.start,range_.count)
                        actualIndex[message.guild.id]-=range_.count
                    }
                    else if (range_.start+range_.count==ai+1){
                        playlist_[message.guild.id].splice(range_.start,range_.count)
                        actualIndex[message.guild.id]-=range_.count
                        if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher)
                        message.guild.voiceConnection.dispatcher.end('remove')
                    }
                    else{
                        playlist_[message.guild.id].splice(range_.start,range_.count)
                        actualIndex[message.guild.id]-=ai+1
                        message.guild.voiceConnection.dispatcher.end('remove')
    
                    }
                    if (range_.count<=1 || true){
                        message.channel.send(`\`\`\`css\n${message.author.username} removeu umas musicas ai (fazer mais tarde, lembrese do ||true) \`\`\``)
                    }
                    saveData()
                }
                else playlist_[message.guild.id].splice(range_.start,range_.count)
            }

            

            for (let i = range.start; shuff[message.guild.id] && i<range.start+range.count;i++){
                let r = {}
                console.log(i)
                console.log(playlist[message.guild.id][i])
                playlist_bkp[message.guild.id] = playlist_bkp[message.guild.id].filter(element=>{
                    return element.videoID != playlist[message.guild.id][i].videoID
                })
                
            }

            commandRemove(range,playlist,false)

        } 
        else{
            message.channel.send(`\`\`\`css\n[Remove] Erro: Deve ser fornecido o index ou o range a se remover\n\`\`\``)
        }      
    }
    else if (command.startsWith('c')){
        playlist[message.guild.id] = []
        playlist_bkp[message.guild.id] = []
        if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher)
            message.guild.voiceConnection.dispatcher.end('clear')
        message.channel.send(`\`\`\`css\n[Clear] Info: ${message.author.username} limpou a playlist\n\`\`\``)
    }
    else if (command.startsWith('pl')){
        if (playlist[message.guild.id] == undefined || playlist[message.guild.id].length<=0){
            message.channel.send(`\`\`\`css\n[Play] Erro: Playlist vazia\n\`\`\``)
            return;
        }

        if (params.length>0){ //Specific index
            let arg = params[0]
            if (isNaN(arg) || parseInt(arg)<1 || parseInt(arg)>playlist[message.guild.id].length){
                message.channel.send(`\`\`\`css\n[Play] Erro: Use números\n\`\`\``)
                return;
            }
            playMusic(message,parseInt(arg)-1)
        }
        else{
            if (actualIndex[message.guild.id] == undefined)
                playMusic(message,0)
            else
                playMusic(message,actualIndex[message.guild.id])
        }
    }
    else if (command.startsWith('p')){
        if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher){
            if (message.guild.voiceConnection.dispatcher.paused){
                message.guild.voiceConnection.dispatcher.resume()
                message.channel.send(`\`\`\`css\n${message.author.username} despausou a reprodução de:\n #${actualIndex[message.guild.id]+1}. [${playlist[message.guild.id][actualIndex[message.guild.id]].videoTitle}] - adicionado por ${playlist[message.guild.id][actualIndex[message.guild.id]].addedBy} \n\`\`\``)
            }
            else{
                message.guild.voiceConnection.dispatcher.pause()
                message.channel.send(`\`\`\`css\n${message.author.username} pausou a reprodução de:\n #${actualIndex[message.guild.id]+1}. [${playlist[message.guild.id][actualIndex[message.guild.id]].videoTitle}] - adicionado por ${playlist[message.guild.id][actualIndex[message.guild.id]].addedBy} \n\`\`\``)
            }
        }
    }
    else if (command.startsWith('sk')){
        if (!playlist[message.guild.id] || playlist[message.guild.id].length<=0){
            message.channel.send('```css\nPlaylist esta [vazia]\n```')
            return
        }

        if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher){
            message.channel.send(`\`\`\`css\n${message.author.username} pulou a musica:\n #${actualIndex[message.guild.id]+1}. [${playlist[message.guild.id][actualIndex[message.guild.id]].videoTitle}] - adicionado por ${playlist[message.guild.id][actualIndex[message.guild.id]].addedBy} \n\`\`\``)
            message.guild.voiceConnection.dispatcher.end('skip')
        }
        else{
            message.channel.send('```css\nNada em reprodução...\n```')
        }
    }
    else if (command.startsWith('q')){
        
        if (!playlist[message.guild.id] || playlist[message.guild.id].length<=0){
            message.channel.send('```css\nPlaylist is [empty]\n```')
            return
        }

        let starti = 0
        let msg = '```css\nPlaylist: ['+playlist[message.guild.id].length+' musicas]\n'
        if (actualIndex[message.guild.id] && actualIndex[message.guild.id]>9)
            starti = actualIndex[message.guild.id]-2

        let fim = starti + 7;
        if (fim>playlist[message.guild.id].length)
            fim = playlist[message.guild.id].length


        for (let i = starti;i<fim;i++){
            msg += `${((i==actualIndex[message.guild.id]&&message.guild.voiceConnection&&message.guild.voiceConnection.dispatcher)?'#':' ') +(i+1)}. [${playlist[message.guild.id][i].videoTitle}] - Added by ${playlist[message.guild.id][i].addedBy}\n`
        }
        message.channel.send(msg+'\n```')
    }
    else if (command.startsWith('Q')){

        if (!playlist[message.guild.id] || playlist[message.guild.id].length<=0){
            message.channel.send('```css\nPlaylist is [empty]\n```')
            return
        }

        let text = ''
        for (let i = 0;i<playlist[message.guild.id].length;i++){
            text += `${((i==actualIndex[message.guild.id]&&message.guild.voiceConnection&&message.guild.voiceConnection.dispatcher)?'#':' ') +(i+1)}. [${playlist[message.guild.id][i].videoTitle}] - Added by ${playlist[message.guild.id][i].addedBy}\n`
        }
        pastebin.createPaste({
            text:text,
            title:'playlist',
            expiration: '10M'})
            .then(data=>{
                message.channel.send('```css\nPlaylist inteira:\n```')
                message.reply(data)
            }
        )
    }
    else if (command.startsWith('b')){
        if (!playlist[message.guild.id] || playlist[message.guild.id].length<=0){
            message.channel.send(`\`\`\`css\n[Back] Erro: Playlsit vazia\n\`\`\``)
            return
        }

        if (actualIndex[message.guild.id]==0){
            if (loop[message.guild.id] == 2)
                actualIndex[message.guild.id] = playlist[message.guild.id].length
            else return         
        }

        playMusic(message,actualIndex[message.guild.id]-1)
    }
    else if (command.startsWith('sh')){
        if ((params.length<=0&&!shuff[message.guild.id]) || (params.length>0&&params[0]=='on')){
            if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher){
                let frag1 = playlist[message.guild.id].slice(0,actualIndex[message.guild.id]+1)
                let frag2 = playlist[message.guild.id].slice(actualIndex[message.guild.id]+1)
                playlist_bkp[message.guild.id] = playlist[message.guild.id].slice()
                playlist[message.guild.id] = frag1.slice()
                shuffle(frag2)
                playlist[message.guild.id] = playlist[message.guild.id].concat(frag2)
            }
            else{
                playlist_bkp[message.guild.id] = playlist[message.guild.id].slice()
                shuffle(playlist[message.guild.id])
            }            
            shuff[message.guild.id]=true            
            message.channel.send(`\`\`\`css\n[Shuffle] Info: Playlist atual embaralhada\n\`\`\``)   
        }
        else{
            if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher)
                actualIndex[message.guild.id] = playlist_bkp[message.guild.id].indexOf(playlist[message.guild.id][actualIndex[message.guild.id]])
            playlist[message.guild.id] = playlist_bkp[message.guild.id]
            shuff[message.guild.id]=false
            message.channel.send(`\`\`\`css\n[Shuffle] Info: Playlist atual de volta ao normal\n\`\`\``)   
        }
    }
    else if (command.startsWith('st')){
        if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher)
            message.guild.voiceConnection.dispatcher.end('stop')
    }
    else if (command.startsWith('v')){
        if (params.length>0){
            let input = params.join(' ')
            if (isNaN(input)){
                message.channel.send(`\`\`\`css\n[Volume] Erro: Deve ser um numero precedido ou nao de [+/-]\n\`\`\``)
                return;
            }

            if (input.indexOf('-')>=0){
                volume[message.guild.id] -= parseFloat(input.substr(input.indexOf('-')+1))/100.0
            }
            else if(input.indexOf('+')>=0){
                volume[message.guild.id] += parseFloat(input.substr(input.indexOf('+')+1))/100.0
            }
            else{
                volume[message.guild.id] = params[0]/100.0
            }

            if (volume[message.guild.id] < 0) volume[message.guild.id] = 0
            else if (volume[message.guild.id] > 1) volume[message.guild.id] = 1
            message.channel.send(`\`\`\`css\n[Volume] Info: ${message.author.username} mudou o volume para: ${Math.round(volume[message.guild.id]*1000)/10.0}%\n\`\`\``)
            saveData()
            if (message.guild.voiceConnection && message.guild.voiceConnection.dispatcher)
                message.guild.voiceConnection.dispatcher.setVolume(volume[message.guild.id])
        }
        else
            message.channel.send(`\`\`\`css\n[Volume] Volume atual: ${Math.round(volume[message.guild.id]*1000)/10.0}%\n\`\`\``)
    }
    else{
        const embed = {
  "title": "Guia de Ajuda",
  "description": "Aqui está o funcionamento do Nice Bot, um bot de música muito maneiro. Deixe o seu like e clique no gostei pufufufu\n\n```css\nComandos - Controle da playlist```\n[,add]() <name/ yt url/ yt playlist> -> Adiciona nova música\n[,remove]() <music index> -> Remove uma música da playlist\n[,queue]() -> Exibe a playlist\n[,clear]() -> Limpa a playlist\n[,export]() <playlist name> -> Salva a playlist atual\n[,import]() <playlist name/index> -> Carrega uma playlist salva\n[,delete]() <playlist name/index> -> Deleta a playlist salva \n[,list]() -> Lista as playlists salvas\n```css\nComandos - Controle da reproducao```\n[,join]() [opicional:nomeCanal]-> Entra no canal seu/digitado\n[,leave]() -> Sai do canal de voz\n[,play]() [opc:index] -> Toca música do começo ou especifico\n[,pause]() -> Pausa/despausa\n[,stop]() -> Para a reprodução e volta ao começo da música\n[,replay]() -> Recomeça a música atual\n[,volume]() [novo volume(0-100%)] -> Exibe / altera o volume\n[,shuffle]() [on/off] -> Embaralha / desembaralha a playlist \n[,loop]() <off/one/all> -> Ativa o loop (1 ou todas músicas)\n[,skip]() -> Pula a música atual\n[,back]() -> Volta para a música anterior\n ```css\nMacetes para agilizar as coisas```",
  "color": 0x16870E,
  "footer": {
    "icon_url": bot.users.get('264284264475000842').avatarURL,
    "text": "Desenvolvido por Marucs"
  },
  "fields": [
    {
      "name": "Atalhos",
      "value": "[,a]()  -> [,add]()\n[,r]()  -> [,remove]()\n[,c]()  -> [,clear]()\n[,q]()  -> [,queue]()\n[,e]() -> [,export]()\n[,i]() -> [,import]()\n[,d]() -> [,delete]()\n[,li]() -> [,lists]()\n[,j]()   -> [,join]()\n[,l]()   -> [,leave]()\n[,pl]() -> [,play]()\n[,p]()  -> [,pause]()\n[,st]() -> [,stop]()\n[,rp]() -> [,replay]()\n[,v]()  -> [,volume]()\n[,sh]() -> [,shuffle]()\n[,lo]() -> [,loop]()\n[,sk]() -> [,skip]()\n[,b]() -> [,back]()"
    },
    {
      "name": "Funções Ocultas",
      "value": "[,add]() -> Se o bot já estiver em um canal, dá play após adicionar\n[,play]()-> Se o bot não estiver em nenhum canal, ele tenta se juntar\n[,back]()/[,skip]() -> Se o loop estiver em all, ele da a volta\n[,Q]()(maiúsculo) -> Exibe a playlist inteira\n[,remove]() -> é possível estabelecer um range (ex: ,r 10-15)\n[,remove]() -> no range a letra n é o fim da playlist (ex: ,r 3-n) apaga td depois do 2"
    }
  ]
};
    message.channel.send({embed})
    }
})

let login = ()=>{
    bot.login('Mjk3MDkyMzYzNDM4OTE1NTg0.DF1bnA.81L2Z88UIrNkrYhVBOJEn6gOlX4').catch(login)
    //bot.login("MzI1NDI5OTc5NDU2MzM5OTY5.DCYHzA.QtBMy1rwSSti-RiRjOdXCh_zGlI");
}
login()