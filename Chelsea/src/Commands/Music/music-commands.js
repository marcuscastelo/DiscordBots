import {Message} from 'discord.js'
import MusicGuild from './music-guild.js'
import MessageFormatter from '../../tools/message-formatting.js'
import Logger from '../../logger.js'

export default class MusicCommandHandler{
    /**
     * 
     * @param {string} command 
     * @param {string[]} frags 
     * @param {Message} message 
     */
    static lobby(command,frags,message){
        Logger.log('Inicializando Objeto MusicGuild',6)
        let musicGuild = MusicGuild.getMusicGuild(message.guild)

        switch(command){
            case 'j':
                musicGuild.join(message,frags)
                break;
            case 'l':
                musicGuild.leave(message)
                break;
            case 'a':
                musicGuild.add(message,frags)
                break;
            case 'q':
                musicGuild.queue(message,frags)
                break;
            case 'pl':
                if (frags&&frags.length>0){
                    if (!isNaN(frags[0]))
                        musicGuild.play(message,parseInt(frags[0])-1)
                }
                else
                    musicGuild.play(message,0)
                break;
            case 'v':
                musicGuild.setVolume(message,frags)
                break;
            case 'c':
                musicGuild.clear(message)
                break;
            case 'sk':
                musicGuild.skip(message)
                break;
            case 'r':
                musicGuild.remove(message, frags)
                break;
            case 'p':
                musicGuild.pause(message)
                break;
            case 'st':
                musicGuild.stop(message)
                break;
            case 'rp':
                musicGuild.replay(message)
                break;
            case 'e':
                musicGuild.export(message, frags)
                break;
            case 'i':
                musicGuild.import(message, frags)
                break;
            case 'li':
                musicGuild.list(message, frags)
                break;
            case 'd':
                musicGuild.delete(message, frags)
                break;
            case 'sh':
                musicGuild.setShuffle(message)
                break;
            case 'lo':
                musicGuild.setLoop(message,frags)
                break;
            case 'np':
            case 'now':
                musicGuild.nowPlaying(message);
            break;
            case 'b':
                musicGuild.back(message);
            break;
            default:
                Logger.warn(`Comando de música ainda não implementado [${command}]`)
                MessageFormatter.sendMessage('Em Breve!',message)
                break;
        }

    }
}