import {
    Message,
    TextChannel,
    VoiceChannel,
    Client
} from 'discord.js'
import PersistenceManager from '../Persistence/persistence-manager.js'
import Music from './Music/music-commands.js'
import Logger from '../logger.js'
import {bot_name} from '../../settings.json'
import {help as embed} from '../../settings.json'

export default class CommandHandler{
    /**
     * 
     * @param {Message} message 
     */
    static command(message){
        Logger.log('Buscando prefixo',4)
        let data = PersistenceManager.getData(message.guild)
        let prefix = data.prefix
        Logger.log('Prefixo = '+prefix,5)

        let cfrags = ''
        if (message.cleanContent.startsWith('@'+bot_name)){
			cfrags = message.cleanContent.substr(bot_name.length+1).trim().split(' ')
        }
        else if (message.content.indexOf(prefix)!=0){
            Logger.log('Mensagem não possui o prefixo, ignorando',4)
            return
        }
        else {
        	cfrags = message.content.substr(prefix.length).trim().split(' ')
        }

        Logger.log(`[${message.guild}] Comando Recebido de ${message.member.displayName}: ${message.content}`)
        
        let command = cfrags.splice(0,1)[0].replace('/\s/g','')
        Logger.log(`Parametros do comando: "${cfrags}"`,5)
        Logger.log('Separando tipo de comando',4)
        let musicMatch = command.match(/(?:^)((j|lo|li|l|a|rp|r|c|e|i|pl|sh|v|p|st|q|d|sk|b|np|now).*)(?:$)/)
        Logger.log('musicMatch = '+JSON.stringify(musicMatch),5)
        let commandStr = command.toLowerCase()
        
        if(commandStr=='setprefix')
        {
            if (cfrags.length>0){
                PersistenceManager.set_prefix(message.guild,cfrags[0])
                message.reply('new prefix! = ' +cfrags[0])
                message.client.user.setPresence({status:'online', game:{name:`${data.prefix}help`}})
            }
        }
        else if(commandStr=='shutdown'){
            message.client.destroy().then(()=>process.exit(0))
        }
        else if (musicMatch && musicMatch.length > 1){
            Logger.log('Comando de música',4)
            Music.lobby(musicMatch[2],cfrags,message);
        }
        else{
            message.channel.send({embed})
            Logger.warn('Commando Inválido')
        }
    }
}