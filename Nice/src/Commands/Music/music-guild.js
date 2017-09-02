import {Guild, Message} from 'discord.js'
import PersistenceManager from '../../Persistence/persistence-manager.js'
import Logger from '../../logger.js'
import youtube from '../../youtube/youtube.js'
import MessageFormatter from '../../Tools/message-formatting.js'
import PlaylistManager from '../../Tools/playlist-manager.js'
import StringFormatter from '../../Tools/string-formatting.js'
import getVideoDuration from 'get-video-duration'
import ytdl from 'ytdl-core'
import shuffle from 'shuffle-array'

let guilds = {}
export default class MusicGuild{
    get data(){ return PersistenceManager.getData(this.guild) }
    get name(){ return this.data.name}
    get playlist(){ return this.data.playlist}
    get playlist_src(){ return this.data.playlist_src}
    get saved_playlists(){ return this.data.saved_playlists}
    get volume(){ return this.data.volume}
    get shuffle(){ return this.data.shuffle}
    get loop(){ return this.data.loop}
    get actualIndex(){ return this.data.actualIndex}
    get prefix(){ return this.data.prefix}
    get voiceConnection() {return this.guild.voiceConnection}
    get dispatcher() { return (this.voiceConnection?(this.voiceConnection.dispatcher?this.voiceConnection.dispatcher:undefined):undefined)}

	set playlist(value){ PersistenceManager.set_playlist(this.guild, value); }
    set playlist_src(value){ PersistenceManager.set_playlist_src(this.guild, value); }
    set saved_playlists(value){ PersistenceManager.set_saved_playlists(this.guild, value); }
    set volume(value){ PersistenceManager.set_volume(this.guild, value); }
    set shuffle(value){ PersistenceManager.set_shuffle(this.guild, value); }
    set loop(value){ PersistenceManager.set_loop(this.guild, value); }
    set actualIndex(value){ PersistenceManager.set_actualIndex(this.guild, value); }
    set prefix(value){ PersistenceManager.set_prefix(this.guild, value); }


    
    /**
     * 
     * @param {Guild} guild 
     */
    constructor(guild){
        this.guild = guild
        this.playlistManager = new PlaylistManager(this)
        this.lastPlayMessage = null
    }

    /**
     * 
     * @param {Guild} guild
     * @returns {MusicGuild}
     */
    static getMusicGuild(guild){
        if (!guilds[guild.id]){
            guilds[guild.id] = new MusicGuild(guild)
        }
        return guilds[guild.id]
    }

    /**
     * 
     * @param {Message} message 
     * @returns {MusicGuild}
     */
    join(message,cnames){
        Logger.log('Comando Join',3)
        if (cnames.length>0){
            let cname = cnames.join()
            let foundChannel = message.guild.channels
                .filter(c=>c.type == 'voice')
                .find(c=> c.name === cname)
            if (foundChannel){
                foundChannel.join()
                Logger.log(`[${message.guild}]: Joining found voice channel: ${foundChannel.name}`)
            }
            else
                message.reply('42 todo:not found')
        }
        else{
            if (message.member.voiceChannel)
                if (message.member.voiceChannel.joinable){
                    Logger.log(`[${message.guild}]: Entrando no canal de voz de ${message.member.displayName}`)
                    try{
                        message.member.voiceChannel.join()
                        .then(()=>Logger.log('Joined Sucessful',2))
                        .catch(reason=>{
                            Logger.error('Error joining ')
                            Logger.error(reason,5)
                        })
                    }
                    catch (err){
                        Logger.error('FATAL ERROR JOIN (DISCORD SIDE)',0)
                    }
                }
                else
                    message.reply('49 todo:lack permission join')
            else
                message.reply('51 todo:user not in a voice channel')
        }
        return this;
    }

    /**
     * @param {Message} message
     * @returns {MusicGuild}
     */
    leave(message){
        Logger.log('Comando Leave',3)
        if (this.voiceConnection){
            if (this.dispatcher)
                this.dispatcher.end('leave')
            try{
                this.voiceConnection.channel.leave()
            }
            catch (err){
                Logger.error('FATAL ERROR LEAVE (DISCORD SIDE)',0)
            }
        }
        return this
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} inputa 
     */
    add(message,inputa){
        Logger.log('Comando Add',3)
        if (inputa.length>0){
            let input = inputa.join(' ').trim()
            let ytVideoIDMatch = input.match(/(?:\S+(?:favicon|vi\/|v=|\/v\/|youtu\.be\/|\/embed\/|v%3D))((?:[a-z0-9A-Z]|-|\+|_)+)/)
            let ytPlaylistIDMatch = input.match(/^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?.*?(?:list)=(.*?)(?:&|$)/)
            let ytVideoID
            let ytPlaylistID

            let spotifyPlaylistMatch = input.match(/(?:user\/|spotify:user:)(.+)(?:\/playlist\/|:playlist:)(.+)/)

            if (spotifyPlaylistMatch&&spotifyPlaylistMatch.length==3){
                this.playlistManager.addSpotifyList(message,input)
                return;
            }

            if (ytVideoIDMatch && ytVideoIDMatch.length>1 && ytVideoIDMatch[1])
                ytVideoID = ytVideoIDMatch[1]
            if (ytPlaylistIDMatch && ytPlaylistIDMatch.length>1 && ytPlaylistIDMatch[1])
                ytPlaylistID = ytPlaylistIDMatch[1]

            if (ytPlaylistID&&ytVideoID){
                MessageFormatter.makeSelectFromMessage(message.author,"Deseja adicionar qual dessas opcoes?",{
                    "Playlist inteira":()=>{
                        this.playlistManager.addYTPlayListID(message,ytPlaylistID)
                    },
                    "Apenas este video":()=>{
                        this.playlistManager.addYTID(message,ytVideoID)
                    }
                }).send(message)                
            }
            else if (ytPlaylistID){
                this.playlistManager.addYTPlayListID(message,ytPlaylistID)
            }
            else if (ytVideoID){
                this.playlistManager.addYTID(message,ytVideoID)
            }
            else{
                this.playlistManager.addYTSearch(message,input)
            }
        }
        else{
            Logger.log(`[${message.guild}]: Add -> Falta de parâmetros`,3,true)
            MessageFormatter.sendError('Add','Parametros insuficientes:\n\nEx1: ,add gemidao do zap\nEx2: ,add https://www.youtube.com/watch?v=LYU-8IFcDPw\nEx3: ,add https://www.youtube.com/playlist?list=PLBiPNxqFKPZIWTooh9mCq3rIphK86Almm\nEx4: ,add https://www.youtube.com/watch?v=kXYiU_JCYtU&list=PLBiPNxqFKPZIWTooh9mCq3rIphK86Almm',message,20000)
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags 
     */
    queue(message,frags){
        Logger.log('Comando Queue',3)
        let page = -1
        if (frags.length>0){
            if (!isNaN(frags[0]))
                page = parseInt(frags[0])-1
        }

        if (!this.playlist || !this.playlist.length>0){
            MessageFormatter.sendInfo('Queue','Playlist vazia',message)
            return
        }

        let pages = []
        let total = this.playlist.length
        let perPage = 10
        
        let msg = ''
        for (let i=0;i<total;i++){
            msg += (this.actualIndex==i&&this.dispatcher?'#':' ')+(i+1)+'. ['+this.playlist[i].videoTitle+'] ['+StringFormatter.formatTime(this.playlist[i].duration,2)+']  #'+this.playlist[i].addedBy+'\n'
            if ((i+1)%10==0 || i+1>=total){
                msg += '\n```\n `Digite (p25 | > | <) para ver outras paginas`'
                pages.push(msg)
                msg = ''
            }
        }

        if (page < 0 || page >= pages.length) {
            if (this.guild.voiceConnection && this.guild.voiceConnection.dispatcher)
                page = Math.floor((this.actualIndex)/10)
            else
                page = 0;
        }

        let getHeader = (mystr) => {return  '```css\nPlaylist [Pagina '+(pages.length+1)+'/'+Math.ceil(total/perPage)+'] [Shuffle: '+(shuffle?'On':'Off')+'] [Loop: '+ (loop==0?'Off':(loop==1?'One':'All')) +']:\n\n'+mystr}

        let loop = (playmsg)=>{
            playmsg.channel.awaitMessages(m=>m.author.username==message.author.username,{max:1}).then(collected=>{
                    let c = collected.first().content
                    if (c=='>') page++;
                    else if (c=='<') page--;
                    else if (c.length>1&&!isNaN(c.substr(1))) page = parseInt(c.substr(1))-1
                    else {
                        page = page<0?0:(page>=pages.length?pages.length-1:page)
                        let exib = getHeader(pages[page])
                        playmsg.edit(exib.substr(0,exib.length-46))
                        return;
                    };
                    page = page<0?0:(page>=pages.length?pages.length-1:page)
                    playmsg.edit(getHeader(pages[page]))
                    loop(playmsg)
                    if (collected.first().deletable)
                        collected.first().delete()
                }).catch()
        }
        MessageFormatter.sendMessage(getHeader(pages[page]),message,0,playmsg=>loop(playmsg))
        

    }

    /**
     * 
     * @param {Message} message 
     * @param {number} index 
     */
    play(message,index){
        Logger.log('Comando Play',3)
        if (isNaN(index)) return;

        if (this.playlist.length<=0) {
            MessageFormatter.sendError('Play','Playlist vazia',message)
            return;
        }

        if (index<0)
            index = this.playlist.length-1
        else if (index>=this.playlist.length){
            if (this.loop == 2)
                index = 0
            else{
                MessageFormatter.sendInfo('Play','Fim da Reproducao',message)
                return
            }
        }
        
        if (!this.voiceConnection && message.member.voiceChannel && message.member.voiceChannel.joinable)
            message.member.voiceChannel.join()
            
        while (!this.voiceConnection && message.member.voiceChannel && message.member.voiceChannel.joinable);

        if (this.voiceConnection){
            if (this.dispatcher){
                this.dispatcher.end('playnew')
            }

            //console.log(this.playlist[0].videoId)

            this.stream = ytdl(youtube.watchVideoUrl+this.playlist[index].videoId,{filter:'audioonly'})
            this.actualIndex = index
            let item = this.playlist[index]
            let durStr = StringFormatter.formatTime(item.duration,2)
            this.voiceConnection.playStream(this.stream,{volume:this.volume}).on('end',reason=>{
                Logger.log('Fim da transmissão: '+item.videoTitle+" reason: "+reason)

                if (this.playingInterval)
                    clearInterval(this.playingInterval)
                if (this.lastPlayMessage){
                    this.lastPlayMessage.edit(`\`\`\`css\n[Play] Info: Reproducao Anterior:\n ${index+1}. ${item.videoTitle} - Adicionada por #${item.addedBy}\n[-------------------------------------------------------------------------o]\n[${durStr}/${durStr}]\`\`\``).then(()=>{
                        this.lastPlayMessage = null
                    })
                }

                if (reason=='Stream is not generating quickly enough.'||reason==undefined){
                    if (this.loop==1)
                        this.play(message,this.actualIndex)
                    else
                        this.play(message,this.actualIndex+1)
                }
                else if(reason=='skip'||reason=='remove'){
                    this.play(message,this.actualIndex+1)
                }
                else if (reason=='replay'){
                    this.play(message,this.actualIndex)
                }
            })

            this.dispatcher.on('start',()=>{
                Logger.log('Iniciando Reprodução de '+item.videoTitle)
                this.dispatcher.setVolume(this.volume)
                this.nowPlaying(message);
            })            
        }
        else MessageFormatter.sendError('Play','Nem o bot nem você estão em um canal de voz',message)
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags 
     */
    setVolume(message,frags){
        Logger.log('Comando Volume',3)
        if (frags.length>0){
            let input = frags.join(' ')
            if (isNaN(input)){
                MessageFormatter.sendError('Volume','Deve ser um numero precedido ou nao de [+/-]',message)
                return;
            }

            if (input.indexOf('-')>=0){
                this.volume -= parseFloat(input.substr(input.indexOf('-')+1))/100.0
            }
            else if(input.indexOf('+')>=0){
                this.volume += parseFloat(input.substr(input.indexOf('+')+1))/100.0
            }
            else{
                this.volume = frags[0]/100.0
            }

            if (this.volume < 0) this.volume = 0
            else if (this.volume > 1) this.volume = 1
            MessageFormatter.sendInfo('Volume',`${message.author.username} mudou o volume para: ${Math.round(this.volume*1000)/10.0}%`,message,0)
            if (this.dispatcher)
                this.dispatcher.setVolume(this.volume)
        }
        else
            MessageFormatter.sendInfo('Volume',`Volume atual: ${Math.round(this.volume*1000)/10.0}%`,message,5000)
    }

    /**
     * 
     * @param {Message} message 
     */
    clear(message){
        Logger.log('Comando Clear',3)
        if (this.dispatcher)
            this.dispatcher.end('clear')
        this.playlist = []
        this.playlist_src = []
        MessageFormatter.sendInfo('Clear','Playlist limpa',message,5000)
    }

    /**
     * 
     * @param {Message} message 
     */
    skip(message){
        Logger.log('Comando Skip',3)
        if (this.dispatcher){
            let music = this.playlist[this.actualIndex]
            Logger.log(`[${message.guild}]: ${message.member.displayName} Pulou a música atual: [${music.videoTitle}]`)
            MessageFormatter.sendInfo('Skip',`${message.member.displayName} pulou a musica:\n #${this.actualIndex+1}. [${music.videoTitle}] - Adicionada por #${message.member.displayName}`,message,0)
            this.dispatcher.end('skip')
        }
        else{
            Logger.log(`[${message.guild}]: Skip-> Nada tocando`,3,true)
            MessageFormatter.sendError('Skip','Nada tocando no momento',message)
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags 
     */
    remove(message, frags){
        if (this.playlist.length<=0){
            MessageFormatter.sendError('Remove','Playlist vazia',message)
            return
        } 

        if (frags.length>0){
            let input = frags.join(' ')
            let range = { start:0, count:0 }
            if (isNaN(input)){
                let match = input.match(/(\d+)(?:\s?-\s?)(\d+|[nN])/)
                Logger.log('Remove match: '+match,5)
                if (match&&match.length>=3){
                    range.start = parseInt(match[1])-1
                    if (match[2] == 'n' || match[2] == 'N')
                        range.count = this.playlist.length - range.start
                    else
                        range.count = parseInt(match[2]) - range.start

                    if (range.start<0 || range.start>=this.playlist.length){
                        MessageFormatter.sendError('Remove',`Primeiro valor fora dos limites (Minimo: 1, Maximo: ${this.playlist.length})`,message)
                        return
                    }   

                    if (range.count<0 || range.start+range.count>this.playlist.length){
                        MessageFormatter.sendError('Remove',`Segundo valor fora dos limites (Minimo: ${range.start+1}, Maximo: ${this.playlist.length})`,message)
                        return
                    }

                }
                else{
                    MessageFormatter.sendError('Remove','Sintaxe incorreta:\nEx1.: ,remove 2\nEx2.: ,remove 1 - 5\nEx3.: ,remove 3-n',message,10000)
                    return;
                }
            }
            else{
                range.start = parseInt(frags[0])-1
                range.count = 1
                if (range.start<0 || range.start>=this.playlist.length){
                    message.channel.send(`\`\`\`css\n[Remove] Erro: primeiro valor deve estar dentro do tamanho da playlist\n\`\`\``)
                    return
                }
            }
            let ai = this.actualIndex
        
            for (let i = range.start; this.shuffle && i<range.start+range.count;i++)
                this.playlist_src = this.playlist_src.filter(element=>element.videoID != this.playlist[i].videoID)

            let removedMusics = this.playlist.splice(range.start,range.count).reduce((p,n,i)=>{
                return p + `${range.start+i+1}. [${n.videoTitle}] - Adicionado por ${n.addedBy}\n`
            },':\n\n')
        
            if (range.start<=ai){
                if (range.start+range.count<=ai+1){
                    this.actualIndex-=range.count
                }
                else{
                    this.actualIndex-=ai+1
                }

                if (this.dispatcher && range.start+range.count>=ai+1)
                    this.dispatcher.end('remove')
            }
            MessageFormatter.sendInfo('Remove',`${message.member.displayName} Removeu ${range.count} musicas`+(range.count<=8?removedMusics:""),message)
            PersistenceManager.save()
        }

    }

    /**
     * 
     * @param {Message} message 
     */
    stop(message){
        if (this.dispatcher)
            this.dispatcher.end('stop')
        else
            message.reply('387 todo:nadatocando')
    }

    /**
     * 
     * @param {Message} message 
     */
    pause(message){
        if (this.dispatcher)
            if (this.dispatcher.paused){
                this.dispatcher.resume()
            }
            else {
                this.dispatcher.pause()
            }
        else message.reply('402 todo:nadatocando')
    }

    /**
     * 
     * @param {Message} message 
     */
    replay(message){
        if (this.dispatcher){
            this.dispatcher.end('replay')
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags 
     */
    export(message, frags){
        if (frags.length<=0){
            MessageFormatter.sendError('Export','Nenhum nome especificado',message)
            return;
        }
        
        if (this.playlist.length<=0){
            MessageFormatter.sendError('Export','A playlist atual está vazia, impossivel exportar',message)
            return;
        }

        let name = frags.join(' ')

        if (!isNaN(name.substr(0,1))){
            MessageFormatter.sendError('Export','O nome da playlist nao pode comecar com numeros',message)
            return
        }

        let newItem = {
                name:name,
                addedBy:message.member.displayName,
                playlist:this.playlist.slice()
            }

        let existItem = this.saved_playlists.find(item=>item.name==name)
        if (existItem){
            MessageFormatter.makeSelectFromMessage(message.author,`Ja existe uma playlist com o nome de ${name}, deseja subistituir?`,{
                'Sim':()=>{
                    let index = this.saved_playlists.indexOf(existItem)
                    if (index<0) throw new Error('DEU BOSTA NO INDEX EXPORT 450')
                    this.saved_playlists.splice(index,1)
                    this.saved_playlists.splice(index,0,newItem)
                    Logger.log('[Overwriting]Playlist atual exportada como '+name)
                    MessageFormatter.sendInfo('Export',`${message.member.displayName} sobrescreveu a playlist com o nome de ${name}\n\nDigite ,li para ver a lista delas`,message)
                    PersistenceManager.save()
                },
                'Nao':()=>{}
            }).send(message)
        }
        else{
            this.saved_playlists.push(newItem)
            Logger.log('Playlist atual exportada como '+name)
            MessageFormatter.sendInfo('Export',`${message.member.displayName} exportou a playlist atual como: ${name}\n\nDigite ,li para ver a lista delas`,message)
            PersistenceManager.save()
        }
        

    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags
     */
    list(message,frags){
        
        if (this.saved_playlists.length<=0){
            MessageFormatter.sendInfo('Lists','Nenhuma playlist salva',message)
            return
        }

        let page = 0
        if (frags.length>0 && !isNaN(frags[0]))
            page = parseInt(frags[0])-1

        let pages = []
        let total = this.saved_playlists.length
        let perPage = 10        

        let msg = '```css\nPlaylists Salvas [Pagina '+(pages.length+1)+'/'+Math.ceil(total/perPage)+']:\n\n'
        for (let i=0;i<total;i++){
            msg += `${i+1}. [${this.saved_playlists[i].name}] - Adicionado por ${this.saved_playlists[i].addedBy}\n`
            if ((i+1)%10==0 || i+1>=total){
                msg += '\n```\n `Digite (p25 | > | <) para ver outras paginas`'
                pages.push(msg)
                msg = '```css\nPlaylist [Pagina '+(pages.length+1)+'/'+Math.ceil(total/perPage)+']:\n'
            }
        }

        let loop = (playmsg)=>{
            playmsg.channel.awaitMessages(m=>m.author.username==message.author.username,{max:1}).then(collected=>{
                    let c = collected.first().content
                    if (c=='>') page++;
                    else if (c=='<') page--;
                    else if (c.length>1&&!isNaN(c.substr(1))) page = parseInt(c.substr(1))-1
                    else {
                        page = page<0?0:(page>=pages.length?pages.length-1:page)
                        playmsg.edit(pages[page].substr(0,pages[page].length-46))
                        return;
                    };
                    page = page<0?0:(page>=pages.length?pages.length-1:page)
                    playmsg.edit(pages[page])
                    loop(playmsg)
                    if (collected.first().deletable)
                        collected.first().delete()
                }).catch()
        }
        MessageFormatter.sendMessage(pages[page],message,0,loop)

    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags 
     */
    import(message,frags){
        Logger.log('Comando import',3)
        if (frags.length>0){
            Logger.log('Lendo parâmetros',4)
            let input = frags.join(' ')
            Logger.log('Fragmento de busca: '+input,5)
            let index = -1
            if (!isNaN(frags[0])){
                Logger.log('É um index',4)
                index = parseInt(frags[0])-1
                Logger.log(index,5)
            }
            else{
                Logger.log('É um nome',4)
                let f = this.saved_playlists.find(pl=>pl.name===input)
                Logger.log(f,6)
                if (f){
                    Logger.log('Encontrada a playlist',4)
                    index = this.saved_playlists.indexOf(f)
                }
                else{
                    Logger.log('Playlist inexistente')
                    MessageFormatter.sendError('Import','Playlist com o nome '+input+' nao foi encontrada',message)
                    return;
                }
            }
            if (this.saved_playlists[index]){
                this.playlist = this.saved_playlists[index].playlist
                this.playlist_src = []
                this.shuffle = false
                this.actualIndex = 0
                Logger.log('Playlist ['+input+'] carregada')
                MessageFormatter.sendInfo('Import',`${message.member.displayName} carregou a playlist:\n ${index+1}. [${this.saved_playlists[index].name}] - Adicionada por ${this.saved_playlists[index].addedBy}`,message)
                if (this.voiceConnection){
                    if(this.dispatcher){
                        this.dispatcher.end('import')
                    }
                    this.play(message,0)
                }
            }
            else{
                MessageFormatter.sendError('Import','Playlist inexistente',message)
            }
        }
        else{
            Logger.log('Import: Não foi especificado um parâmetro de identificação',2,true)
            MessageFormatter.sendError('Import','Parametros insuficientes\n\nEx1.: ,import random --- nome da lista\nEx2.: ,import 1 --- posicao da lista',message,10000)
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags 
     */
    delete(message,frags){
        Logger.log('Comando delete',3)
        if (frags.length>0){
            Logger.log('Lendo parâmetros',4)
            let input = frags.join(' ')
            Logger.log('Fragmento de busca: '+input,5)
            let index = -1
            if (!isNaN(frags[0])){
                Logger.log('É um index',4)
                index = parseInt(frags[0])-1
                Logger.log(index,5)
            }
            else{
                Logger.log('É um nome',4)
                let f = this.saved_playlists.find(pl=>pl.name===input)
                Logger.log(f,6)
                if (f){
                    Logger.log('Encontrada a playlist',4)
                    index = this.saved_playlists.indexOf(f)
                }
                else{
                    Logger.log('Playlist inexistente')
                    MessageFormatter.sendError('Delete','Playlist com o nome '+input+' nao foi encontrada',message)
                    return;
                }
            }
            if (this.saved_playlists[index]){
                MessageFormatter.makeSelectFromMessage(message.author,'Deseja realmente excluir esta playlist: '+this.saved_playlists[index].name+'?',{
                    'Sim':()=>{
                        Logger.log('Playlist ['+input+'] DELETADA')
                        MessageFormatter.sendInfo('Delete',`${message.member.displayName} APAGOU a playlist:\n ${index+1}. [${this.saved_playlists[index].name}] - Adicionada por ${this.saved_playlists[index].addedBy}`,message)
                        this.saved_playlists.splice(index,1)
                        PersistenceManager.save()
                    },
                    'Nao':()=>{}
                },true).send(message)
            }
            else{
                MessageFormatter.sendError('Delete','Playlist inexistente',message)
            }
        }
        else{
            Logger.log('Delete: Não foi especificado um parâmetro de identificação',2,true)
            MessageFormatter.sendError('Delete','Parametros insuficientes\n\nEx1.: ,delete random --- nome da lista\nEx2.: ,delete 1 --- posicao da lista',message,10000)
        }
    }

    /**
     * 
     * @param {Message} message 
     * @param {string[]} frags 
     */
    setLoop(message,frags){
        if (frags.length>0){
            let cho = frags[0].match(/(of|d|on|u|a|t).*/)
            if (cho&&cho.length>1)
                switch (cho[1]){
                    case 'of':
                    case 'd':
                        this.loop = 0
                        Logger.log(`[${this.guild}]: Loop desligado`)
                        MessageFormatter.sendInfo('Loop','Loop desligado por '+message.member.displayName,message,0)
                        return;

                    case 'on':
                    case 'u':
                        this.loop = 1
                        Logger.log(`[${this.guild}]: Loop uma musica`)
                        MessageFormatter.sendInfo('Loop','Loop ligado para uma musica por '+message.member.displayName,message,0)                    
                        return;

                    case 'a':
                    case 't':
                        this.loop = 2
                        Logger.log(`[${this.guild}]: Loop todas as musicas`)
                        MessageFormatter.sendInfo('Loop','Loop ligado para todas as musicas por '+message.member.displayName,message,0)
                        return; 
                }
        }
        MessageFormatter.sendError('Loop','Parametros incorretos\n\nEx1.: ,loop off | desligado\nEx2.: ,loop one | um\nEx3.: ,loop all | todos',message,15000)
    }

    /**
     * 
     * @param {Message} message 
     */
    setShuffle(message){
        if (!this.shuffle){
            if (this.dispatcher){
                let keep = this.playlist.slice(0,this.actualIndex+1)
                let random = this.playlist.slice(this.actualIndex+1)

                this.playlist_src = this.playlist.slice()
                shuffle(random)
                this.playlist = keep.concat(random)
            }
            else{
                this.playlist_src = this.playlist.slice()
                shuffle(this.playlist)
            }
            this.shuffle = true
            Logger.log(`[${this.guild}]: Shuffle ativado`)
            MessageFormatter.sendInfo('Shuffle','Shuffle ativado por '+message.member.displayName,message,0)
        }
        else{
            this.actualIndex = this.playlist_src.indexOf(this.playlist[this.actualIndex])
            this.playlist = this.playlist_src.slice()
            this.playlist_src = []
            this.shuffle = false
            Logger.log(`[${this.guild}]: Shuffle desativado`)
            MessageFormatter.sendInfo('Shuffle','Shuffle desativado por '+message.member.displayName,message,0)
            
        }
    }

    /**
     * 
     * @param {Message} message 
     */
    nowPlaying(message){
        if (!this.dispatcher){
            MessageFormatter.sendError('NowPlaying','Nada tocando no momento',message);
            return;
        }

        
        let index = this.actualIndex;
        let item = this.playlist[index]
        let durStr = StringFormatter.formatTime(item.duration,2)

        if (this.playingInterval)
            clearInterval(this.playingInterval)
        if (this.lastPlayMessage){
            if (this.lastPlayMessage.deletable)
                this.lastPlayMessage.delete()
        }

        let edited = true;

        let mg = MusicGuild.getMusicGuild(this.guild)
        MessageFormatter.sendInfo('NowPlaying',`Tocando agora:\n#${index+1}. [${item.videoTitle}] - Adicionada por [${item.addedBy}]`,message,0,pm=>{

            if (!edited) return;
            edited = false;

            mg.lastPlayMessage = pm 
            mg.playingInterval = setInterval(()=>{
                if (!mg.dispatcher || mg.dispatcher.time/1000>item.duration) return
                let pt = StringFormatter.formatTime(Math.round(mg.dispatcher.time/1000),durStr.split(':').length)
                let progressBar = '['
                let pos = Math.round(mg.dispatcher.time/1000/item.duration*75)
                for (let i = 1;i<=75;i++){
                    if (i==pos)
                        progressBar+='o'
                    else
                        progressBar+='-'
                }
                progressBar+=']'
                if (mg.dispatcher && mg.playlist[mg.actualIndex] == item)
                    if (pm.editable)
                        pm.edit(`\`\`\`css\n[NowPlaying] Info: Tocando agora: [Loop: ${mg.loop==0?'Off':(mg.loop==1?'One':'All')}] - [Shuffle: ${mg.shuffle?'On':'Off'}]\n#${index+1}. ${item.videoTitle} - Adicionada por #${item.addedBy}\n${progressBar}\n[${pt}/${durStr}]\`\`\``).then(m=>edited=true)
            },1500)
        })
    }

}