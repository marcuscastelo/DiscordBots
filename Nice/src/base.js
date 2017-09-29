import * as Discord from 'discord.js'
import {token,bot_name} from '../settings.json'
import PersistenceManager from './Persistence/persistence-manager.js'
import MessageFormatting from './tools/message-formatting.js'
import CommandHandler from './Commands/command-handler.js'
import fs from 'fs'
import Logger from './logger.js'

export default class DiscordClient{
    constructor(){
        Logger.log('Iniciando o bot '+bot_name,0)
        this.bot = new Discord.Client()
        Logger.log('Definido evento onReady', 4)
        this.bot.on('ready',()=>{
            Logger.log('Evento Ready Chamado', 3)
            PersistenceManager.init(this.bot)
            Logger.log('[Sucesso] Bot funcional',0)
        })
        Logger.log('Definindo evento onMessage', 4)
        this.bot.on('message',message=>{
            if (message.author.bot) return;
            if (message.channel.type == 'dm') return;
            if (!message.channel.name.startsWith('music')) return;
            Logger.log(`[${message.guild.name}]: `+"Evento OnMessage chamado por "+MessageFormatting.getAuthorName(message), 3)
            CommandHandler.command(message)
        })
        this.bot.on('guildCreate',guild=>{
            Logger.log("Evento guildCreate chamado em "+guild, 3)
            PersistenceManager.addGuild(guild)
            Logger.log("Nova guilda: "+guild)
        })
        this.bot.on('guildDelete', guild=>{
            Logger.log("Evento guildDelete chamado em "+guild, 3)
            PersistenceManager.removeGuild(guild)
            Logger.warn('Bot Removido da guilda: '+guild)
        })
        this.bot.on('error',(error)=>{
            console.log(error)
        })
    }
    start() {
        Logger.log('Fazendo Login...')
        this.bot.login(token)
    }
}