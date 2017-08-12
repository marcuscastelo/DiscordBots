import moment from 'moment'
import {TextChannel, Message, User} from 'discord.js'
import Logger from '../logger.js'

export class PMessage{
    

    constructor(text,callback){
        this.text = text
        this.callback = callback
    }
    /**
     * 
     * @param {TextChannel|Message} channel 
     */
    send(channel){
        Logger.log('Enviando PMessage',5)
        MessageFormatter.sendMessage(this.text,channel,0,m=>{
            Logger.log('PMessage Enviado',5)
            if (this.callback)
            this.callback(m)
        })
    }
}

export default class MessageFormatter{

    /**
     * 
     * @param {Message} message 
     */
    static getAuthorName(message){
        if (message.member)
            return message.member.displayName
        if (message.author)
            return message.author.username
    }


    /**
     * 
     * @param {string} text 
     * @param {Message|TextChannel} ctx 
     * @param {number} delTime 
     */
    static sendMessage(text,ctx,delTime=0,callback=undefined){
        let channel = ctx
        if (ctx instanceof Message)
            channel = ctx.channel
        if (!channel) throw new Error("Vagabundo esqueceu o canal (MessageFormatting)")
        Logger.log(`Enviando mensagem em [${channel.guild} #${channel.name}]`,4)

        let action = m=>{
            if (callback)
                callback(m)

            if (delTime>0){
                if (m.deletable)
                    m.delete(delTime).catch((reason)=>Logger.error(reason))
            }
        }

        channel.send(text).then(action).catch(err=>{
            if (err){
                Logger.error(`[${channel.guild} #${channel.name}]: ${err.message}`,2)
                if (ctx.author){
                    Logger.log('Enviando mensagem para author',4)
                    ctx.author.send("Mals... to sem permissão no servidor")
                    if (delTime>0) delTime += 30000
                    ctx.author.send(text).then(action)
                }
                
            }
        })
    }
    /**
     * 
     * @param {string} mod 
     * @param {string} info 
     * @param {TextChannel|Message} channel 
     * @param {number} delTime 
     */
    static sendInfo(mod,info,channel,delTime=15000,callback=undefined){
        MessageFormatter.sendMessage(`\`\`\`css\n[${mod}] Info: ${info}\n\`\`\``,channel,delTime,callback)
    }

    /**
     * 
     * @param {string} mod 
     * @param {string} error 
     * @param {TextChannel|Message} channel 
     * @param {number} delTime 
     */
    static sendError(mod, error, channel, delTime = 5000,callback=undefined){
        MessageFormatter.sendMessage(`\`\`\`css\n[${mod}] ERROR: ${error}\n\`\`\``,channel,delTime,callback)
    }





    /**
     * @param {User} author
     * @param {string} question
     * @param {{[function]}} callback
     * @returns {PMessage}
     */
    static makeSelectFromMessage(author,question,callback,del=true){
        Logger.log('Criando mensagem interativa',4)
        let opts = Object.keys(callback)
        let text = '```css\n'+question+'\n\n'
        for (let i=0 ;i<opts.length; i++){
            let name = callback[opts[i]].text?callback[opts[i]].text:opts[i]
            text += (i+1)+'. '+name+'\n'
        }
        text+='\n[c]: Cancelar```'
        Logger.log('Criando objeto PMessage',5)
        Logger.log(JSON.stringify({del,x:10000}),5)
        let me = new PMessage(text,
            /**
             * @param {Message} msg
             */
            function(msg){

                Logger.log('Aguardando Resposta de '+author.username+' à mensagem interativa...',2)
                msg.channel.awaitMessages(m=>m.author==author&&(m.content=='c'||(!isNaN(m.content)&&parseInt(m.content)>0&&parseInt(m.content)<=opts.length)),{max:1,time:10000,errors: ['time']}).then(collected=>{
                    let c = collected.first().content
                    if (!isNaN(c)){
                        let cho = parseInt(c)-1
                        if (cho>=0&&cho<opts.length){
                            Logger.log('Opção escolhida: '+opts[cho],2)
                            if (callback[opts[cho]].callback)
                                callback[opts[cho]].callback()
                            else
                                callback[opts[cho]]()
                        }
                    }
                    else
                        Logger.log('Operação Cancelada',2)
                    if (del)
                    {
                        if (msg.deletable) msg.delete()
                        if (collected.first().deletable) collected.first().delete()
                    }
                }).catch(reason=>{
                    console.log(msg.content)
                    Logger.log('Tempo limite de resposta estourado: '+JSON.stringify(reason),2,true)
                    if (del)
                        if (msg.deletable) msg.delete()
                })
            })

        return me
    }
}


