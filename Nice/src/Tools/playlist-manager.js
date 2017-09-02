import MusicGuild from '../Commands/Music/music-guild.js'
import youtube from '../youtube/youtube.js'
import {Message} from 'discord.js'
import PersistenceManager from '../Persistence/persistence-manager.js'
import MessageFormatter from '../Tools/message-formatting.js'
import Logger from '../logger.js'
import StringFormatter from '../Tools/string-formatting.js'
import ytdl from 'ytdl-core'
import getSpotifyTracks from '../spotify/get-playlist-tracks'

export default class PlaylistManager{
    /**
     * 
     * @param {MusicGuild} musicGuild 
     */
    constructor (musicGuild){
        this.musicGuild = musicGuild
    }

    get playlist() {return this.musicGuild.playlist}
    get playlist_src() {return this.musicGuild.playlist_src}

    /**
     * 
     * @param {Message} message 
     * @param {string} playlistUrl 
     */
    addSpotifyList(message,playlistUrl){
        this.message = message
        let startIndex = undefined
        MessageFormatter.sendInfo('Add','Navegando pela playlist... (spotify)',message,0,nm=>{
            getSpotifyTracks(playlistUrl).then(tracks=>{
                Logger.log('Músicas spotify obtidas com sucesso',4)
                let notFound = []
                let final = []
                let items = []
                let dict = {}
                for (let track of tracks){
                    youtube.search(track,(videoId)=>{
                        if (videoId == '404'){
                            notFound.push(track)
                        }
                        if (videoId!='end'){
                            if (!dict[track]) dict[track] = videoId
                            return;
                        }
                        youtube.addById(dict[track],(a,b,c)=>{
                            items.push([a,b,c,track])
                            if (items.length+notFound.length == (Object.keys(dict)).length){
                                for (let t of tracks){
                                    for (let i=0;i<items.length;i++){
                                        if (t==items[i][3]){
                                            final.push(items.splice(i,1).slice(0,2))
                                        }
                                    }
                                }
                                for (let b of final){
                                    let f = b[0]
                                    if (f[0] != '404'){
                                        let x = this._addVideo(f[0],f[1],f[2])
                                        if (!startIndex) startIndex = x
                                    }
                                }
                                MessageFormatter.sendInfo('Add',`${message.member.displayName} adicionou ${final.length} novas musicas da playlist do spotify:\n[${playlistUrl}]`,message,0)

                                notFound.forEach(nft=>{
                                    MessageFormatter.sendError('Add',`[${nft}] não pode ser encontrada no youtube :(`,message,15000)
                                })

                                if (nm.deletable)
                                    nm.delete();
                                PersistenceManager.save()
                                if (final.length>0 && this.musicGuild.voiceConnection && !this.musicGuild.dispatcher){
                                    this.musicGuild.play(message,startIndex)
                                
                                }
                            }
                        })
                    })
                }
            }).catch((error,response)=>{
                if (error) Logger.error(error)
                else if (response.statusCode != 200) Logger.warn('Spotify statusCode: '+response.statusCode)
            })
        })
    }

    /**
     * 
     * @param {Message} message
     * @param {string} search 
     */
    addYTSearch(message,search){
        Logger.log('Realizando Busca no Youtube',3)
        this.message = message
        let sresult = {}
        Logger.log('Pesquisa: '+search, 5)

        youtube.search(search,(videoId,videoTitle)=>{
            if (videoId == '404'){
                Logger.warn('Vídeo não encontrado',3)
                MessageFormatter.sendError('Add','Nenhum resultado no youtube para: '+search,message)
            }
            else if(videoId!='end'){
                sresult[videoId] = {}
                sresult[videoId].callback = ()=>{
                    this.addYTID(message,videoId)
                }
                sresult[videoId].text = videoTitle
            }
            else{
                MessageFormatter.makeSelectFromMessage(message.author,'Adicionar qual desses:',sresult).send(message)
            }
        })
    }

    /**
     * 
     * @param {Message} message
     * @param {string} ID 
     */
    addYTID(message,ID){
        this.message = message
        youtube.addById(ID,(a,b,c)=>{this.addSingleVideo(a,b,c)})
    }

     /**
     * 
     * @param {Message} message
     * @param {string} ID 
     */
    addYTPlayListID(message,ID){
        let indexB = this.playlist.length
        this.message = message
        
        MessageFormatter.sendInfo('Add','Navegando na playlist...',message,0,m=>{
            youtube.playlistUrls(ID,(state, items)=>{
                if (state == '404'){
                    m.edit(`\`\`\`css\n[Add] Erro: Playlist inexistente\n\`\`\``)
                    return;
                }
                else if (state == 'private'){
                    m.edit(`\`\`\`css\n[Add] Erro: Playlist privada, impossivel acessar \n\`\`\``)
                    return;
                }
                else if (state == 'end'){
                    for (let item of items){
                        Logger.log('Adicionando item playlist: '+item.videoTitle,6)
                        this._addVideo(item.videoId,item.videoTitle,item.duration)
                    }
                    
                    Logger.log(`[${this.message.guild}]: ${this.message.member.displayName} adicionou ${items.length} músicas da playlist: ${youtube.watchVideoUrl}${ID}`)
                    PersistenceManager.save()
                    let sendText = `\`\`\`css\n[Add] Info: ${message.author.username} adicionou ${items.length} novas musicas${items.length>0&&items.length<=8?":\n":""}`
                    if (items.length>0 && items.length<=5) 
                        for (let i = indexB; i <= this.playlist.length; i++)
                            sendText+=` ${i+1}. [${this.playlist[i].videoTitle}]  [${StringFormatter.formatTime(this.playlist[i].duration)}]\n`

                    m.edit(sendText+'\n\`\`\`')
                    if (items.length>0 && this.musicGuild.voiceConnection && !this.musicGuild.dispatcher){
                        this.musicGuild.play(message,indexB)
                    }
                    PersistenceManager.save()
                }
            })
        })
    }

    addSingleVideo(videoId,videoTitle,duration){
        let newIndex = this._addVideo(videoId,videoTitle,duration)
        Logger.log(`[${this.message.guild}]: ${this.message.member.displayName} adicionou: ${this.musicGuild.playlist.length}. [${videoTitle}]`)
        PersistenceManager.save()
        MessageFormatter.sendInfo('Add',MessageFormatter.getAuthorName(this.message)+' Adicionou:\n '+(newIndex+1)+'. ['+videoTitle+']',this.message,0)        

        if (this.musicGuild.voiceConnection && !this.musicGuild.dispatcher){
            this.musicGuild.play(this.message,newIndex)
        }
    }
 
    _addVideo(videoId,videoTitle,duration){
        let o = {
            videoId:videoId,
            videoTitle,videoTitle,
            addedBy:this.message.member.displayName,
            duration:StringFormatter.convert_time(duration)
        }
        if (this.musicGuild.shuffle){
            this.playlist_src.push(o)
            let randInd = 0
            if (this.musicGuild.dispatcher){
                randInd = parseInt(Math.round(Math.random()*((this.musicGuild.playlist.length-1)-(this.musicGuild.actualIndex+1))+(this.musicGuild.actualIndex+1)))
            }
            else
                randInd = parseInt(Math.round(Math.random()*(this.musicGuild.playlist.length-1)))
            this.playlist.splice(randInd,0,o)
            return randInd
        }
        else{
            this.playlist.push(o)
            return this.playlist.length-1
        }
    }
}