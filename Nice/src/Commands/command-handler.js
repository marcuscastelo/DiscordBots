import {
    Message,
    TextChannel,
    VoiceChannel,
    Client
} from 'discord.js'
import PersistenceManager from '../Persistence/persistence-manager.js'
import Music from './Music/music-commands.js'
import Logger from '../logger.js'

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
        if (message.content.indexOf(prefix)!=0){
            Logger.log('Mensagem não possui o prefixo, ignorando',4)
            return
        }
 
        Logger.log(`[${message.guild}] Comando Recebido de ${message.member.displayName}: ${message.content}`)
        let cfrags = message.content.substr(prefix.length).trim().split(' ')
        let command = cfrags.splice(0,1)[0]
        Logger.log(`Parametros do comando: "${cfrags}"`,5)
        Logger.log('Separando tipo de comando',4)
        let musicMatch = command.match(/(?:^)((j|lo|li|l|a|rp|r|c|e|i|pl|sh|v|p|st|q|d|sk|b).*)(?:$)/)
        Logger.log('musicMatch = '+JSON.stringify(musicMatch),5)
        let commandStr = command.toLowerCase()
        if (musicMatch){
            Logger.log('Comando de música',4)
            Music.lobby(musicMatch[2],cfrags,message);
        }
        else if(commandStr=='setprefix')
        {
            if (cfrags.length>0){
                PersistenceManager.set_prefix(message.guild,cfrags[0])
                message.reply('new prefix! = ' +cfrags[0])
            }
        }
        else
            Logger.warn('Commando Inválido')
    }
}