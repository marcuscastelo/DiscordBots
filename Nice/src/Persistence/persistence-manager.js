import * as fs from 'fs'
import GuildData from './guild-prefs.js'
import {Guild, Client} from 'discord.js'
import Settings from '../../settings.json'

import Logger from '../logger.js'

const filename = './src/Persistence/persistence.json'


const _guildData = {}

/**
 * 
 * @param {Guild} guild 
 */
function newGD(guild){
    Logger.log('Criando objeto GuildData de '+guild,4)
    return new GuildData({
                id:guild.id,
                name:guild.name,
                playlist:[],
                playlist_src:[],
                saved_playlists:[],
                volume:Settings.default_volume,
                shuffle:false,
                loop:0,
                actualIndex:0,
                prefix:Settings.default_prefix
    })
}

export default class PersistenceManager{
    /**
     * 
     * @param {Client} bot 
     */
    static init(bot){
        Logger.log('Inicializando Persistence',2)
        PersistenceManager.loadFile()
        PersistenceManager.populateDefault(bot)
        PersistenceManager.save()
    }

    /**
     * 
     * @param {Client} bot 
     * @param {boolean} override
     */
    static populateDefault(bot,override=false){
        Logger.log('Preparando camada de forro default',3)
        bot.syncGuilds()
        bot.guilds.forEach(g=>{
            if (!_guildData[g.id] || override)
                _guildData[g.id] = newGD(g)
        })
    }

    static loadFile(){
        Logger.log('Carregando persistence.json...',2)
        if (!fs.existsSync(filename)){
            Logger.warn('JSON inexistente, ignorando')
            return;
        }
        try{
            let data = fs.readFileSync(filename)
            let guildsInfo = JSON.parse(data)
            for (let guildID of Object.keys(guildsInfo)){
                _guildData[guildID] = new GuildData(guildsInfo[guildID])
            }
            Logger.log('JSON importado com sucesso')
        }
        catch (err) { 
            fs.createReadStream(filename).pipe(fs.createWriteStream(filename+Date.now().toString().replace(':','-')))
            Logger.error('Arquivo JSON danificado, salvando backup e sobrescrevendo!') 
        }
    }


    static save(){
        Logger.log('Salvando dados em persistence.json...',2)
        fs.writeFileSync(filename,JSON.stringify(_guildData,null,'\t'))
        Logger.log('Dados Salvos com sucesso')
    }

    /**
     * 
     * @param {Guild} guild 
     * @returns {GuildData}
     */
    static getData(guild){
        Logger.log('Recebendo valores de '+guild,6)
        if (!_guildData[guild.id]){
            Logger.log('getData->Valores inexistentes, definindo valores padrão',4)
            _guildData[guild.id] = newGD(guild)
            PersistenceManager.save()   
        }
        return _guildData[guild.id]
    }

    static addGuild(guild){
        Logger.log('Adicionando valores padrão para a nova guilda: '+guild,4)
        _guildData[guild.id] = newGD(guild)
        PersistenceManager.save()
    }

    static removeGuild(guild){
        Logger.log('Removendo valores da guilda: '+guild,4)
        if (_guildData[guild.id]){
            delete _guildData[guild.id]
            PersistenceManager.save()
        }
    }












    static set_playlist(guild,playlist){ _guildData[guild.id].playlist = playlist; this.save() }
    static set_playlist_src(guild,playlist_src){ _guildData[guild.id].playlist_src = playlist_src; this.save() }
    static set_saved_playlists(guild,saved_playlists){ _guildData[guild.id].saved_playlists = saved_playlists; this.save() }
    static set_volume(guild,volume){ _guildData[guild.id].volume = volume; this.save() }
    static set_shuffle(guild,shuffle){ _guildData[guild.id].shuffle = shuffle; this.save() }
    static set_loop(guild,loop){ _guildData[guild.id].loop = loop; this.save() }
    static set_actualIndex(guild,actualIndex){ _guildData[guild.id].actualIndex = actualIndex; this.save() }
    static set_prefix(guild,prefix){ _guildData[guild.id].prefix = prefix; this.save() }
}