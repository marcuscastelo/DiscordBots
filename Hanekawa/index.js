const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs');
const spawn = require('child_process').spawn;
const open = require('open');
const kurumi = require('./settings.json').token
const child_process = require('child_process')

const prefix = '//'
const role_name = 'Corrupto'
const role_color = '#ff0000'
const guildid = '264477926999719939'

const botCredits = {}

let userIDs = [
    '238325452588974081', //Luiz
    '301487687922221059', //Gary
    '264494046137810944', //Caorti
    '264284264475000842', //EU
    '202540947538444288', //Igor
    '254610197010448384', //Jair
    '163379389164290049', //Leoi
    '308058129231380500'  //Vinão
]

let nameToRole = {
    'Sem Cargo':'264477926999719939',
    'Vereador':'381128367451275271',
    'Prefeito':'381128297242820609',
    'Deputado Estadual':'381127884170854406',
    'Governador':'381127751224262656',
    'Deputado Federal':'381127402283204608',
    'Ministro':'330928554416275457',
    'Presidente':'380551258836172801'
}

let roletoDesc = {
    '264477926999719939':`Sem Cargo:

oficial_chat:
    +ler
    +ver histórico
    +enviar (apenas texto)
    +emoji (full)

+Dando o Cú: Conectar`,
    '381128367451275271':`Vereador:

oficial_chat:
    ler
    ver histórico
    +enviar (-tts)
    emoji (full)
random
    +ler
    +ver histórico
    +enviar (full)
    +emoji (full)
music:
    +ler
    +ver histórico
    +enviar (apenas texto)
downloads:P
    +ler
    +ver histórico
    +enviar (-tts)

Canais de Texto: 
    +ler

Canais de Voz:
    +conectar
    +falar
    +detecção de voz

Canais de Jogos:
    +conectar
    +falar
    +detecção de voz`,
    '381128297242820609':`Prefeito:

oficial_chat:
    ler
    ver histórico
    +enviar (full)
    emoji (full)
    +convite instantaneo
random:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    +convite instantaneo
music:
    ler
    ver histórico
    enviar (apenas texto)
    +convite instantaneo
downloads:
    ler
    ver histórico
    enviar (-tts)
    +convite instantaneo

Canais de Texto: 
    ler
    +ver histórico
    +enviar (-tts)
    +emoji (full)
    +convite instantaneo

Canais de Voz: 
    conectar
    falar
    detecção de voz
    +criar convite instantaneo

Canais de Jogos: 
    conectar
    falar
    detecção de voz
    +criar convite instantaneo`,
    '381127884170854406':`Deputado Estadual:

+Alterar o próprio apelido no servidor

oficial_chat:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
random:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    +gerenciar mensagens
music:
    ler
    ver histórico
    enviar (apenas texto)
    convite instantaneo
downloads:
    ler
    ver histórico
    enviar (-tts)
    convite instantaneo

Canais de texto: 
    ler
    ver histórico
    +enviar(full)
    emoji(full)
    convite instantaneo

Canais de Voz: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo

Canais de Jogos: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    +criar
    +editar visão geral
    +excluir`,
    '381127751224262656':`Governador:

Alterar o próprio apelido no servidor
+Mudar apelido de membros com cargos inferiores
+Expulsar membros com cargos inferiores
+Gerenciar emojis do server

oficial_chat:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    +gerenciar mensagens
    +mencionar todos
random:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    gerenciar mensagens
music:
    ler
    ver histórico
    enviar (apenas texto)
    convite instantaneo
    +gerenciar mensagens
downloads:
    ler
    ver histórico
    enviar (-tts)
    convite instantaneo
nsfw:
    +ler
    +ver histórico
    +enviar (-tts)
    +emoji (full)
    +gerenciar mensagens

Canais de texto: 
    ler
    ver histórico
    enviar(full)
    emoji(full)
    convite instantaneo
    +gerenciar mensagens
    +criar
    +editar visão geral
    +excluir

Canais de Voz: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    +silenciar
    +ensurdecer
    +mover

Canais de Jogos: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    criar
    editar visão geral
    excluir
    +silenciar
    +ensurdecer
    +mover`,
    '381127402283204608':`Deputado Federal:

Alterar o próprio apelido no servidor
Mudar apelido de membros com cargos inferiores
Expulsar membros com cargos inferiores
Gerenciar emojis do server
+Dar, remover, editar cargos inferiores ao seu

oficial_chat:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    gerenciar mensagens
    mencionar todos
random:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    gerenciar mensagens
music:
    ler
    ver histórico
    enviar (apenas texto)
    convite instantaneo
    gerenciar mensagens
downloads:
    ler
    ver histórico
    enviar (-tts)
    convite instantaneo
nsfw:
    ler
    ver histórico
    enviar (-tts)
    emoji (full)
    gerenciar mensagens

Canais de texto: 
    ler
    ver histórico
    enviar(full)
    emoji(full)
    convite instantaneo
    gerenciar mensagens
    criar
    editar visão geral
    excluir
    +editar permissões

Canais de Voz: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    +criar
    +editar visão geral
    +excluir
    silenciar
    ensurdecer
    mover

Canais de Jogos: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    criar
    editar visão geral
    excluir
    silenciar
    ensurdecer
    mover
    +editar permissões`,
    '330928554416275457':`Ministro & Presidente:

Alterar o próprio apelido no servidor
Mudar apelido de membros com cargos inferiores
Expulsar membros com cargos inferiores
Gerenciar emojis do server
Dar, remover, editar cargos inferiores ao seu
+Ver Audit Log
+Gerenciar Servidor
+Banir membros


oficial_chat:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    gerenciar mensagens
    mencionar todos
random:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    gerenciar mensagens
music:
    ler
    ver histórico
    enviar (apenas texto)
    convite instantaneo
    gerenciar mensagens
downloads:
    ler
    ver histórico
    enviar (-tts)
    convite instantaneo
    +gerenciar mensagens
nsfw:
    ler
    ver histórico
    enviar (-tts)
    emoji (full)
    gerenciar mensagens

Canais de texto: 
    ler
    ver histórico
    enviar(full)
    emoji(full)
    convite instantaneo
    gerenciar mensagens
    criar
    editar visão geral
    excluir
    editar permissões
    +mencionar todos

Canais de Voz: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    criar
    editar visão geral
    excluir
    silenciar
    ensurdecer
    mover
    +editar permissões

Canais de Jogos: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    criar
    editar visão geral
    excluir
    silenciar
    ensurdecer
    mover
    editar permissões`,
    '380551258836172801':`Ministro & Presidente:

Alterar o próprio apelido no servidor
Mudar apelido de membros com cargos inferiores
Expulsar membros com cargos inferiores
Gerenciar emojis do server
Dar, remover, editar cargos inferiores ao seu
+Ver Audit Log
+Gerenciar Servidor
+Banir membros


oficial_chat:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    gerenciar mensagens
    mencionar todos
random:
    ler
    ver histórico
    enviar (full)
    emoji (full)
    convite instantaneo
    gerenciar mensagens
music:
    ler
    ver histórico
    enviar (apenas texto)
    convite instantaneo
    gerenciar mensagens
downloads:
    ler
    ver histórico
    enviar (-tts)
    convite instantaneo
    +gerenciar mensagens
nsfw:
    ler
    ver histórico
    enviar (-tts)
    emoji (full)
    gerenciar mensagens

Canais de texto: 
    ler
    ver histórico
    enviar(full)
    emoji(full)
    convite instantaneo
    gerenciar mensagens
    criar
    editar visão geral
    excluir
    editar permissões
    +mencionar todos

Canais de Voz: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    criar
    editar visão geral
    excluir
    silenciar
    ensurdecer
    mover
    +editar permissões

Canais de Jogos: 
    conectar
    falar
    detecção de voz 
    criar convite instantaneo
    criar
    editar visão geral
    excluir
    silenciar
    ensurdecer
    mover
    editar permissões`,
}


let time = 0
let delRole = null

function isBotOffline(id){
    return new Promise((res,rej)=>{
        bot.fetchUser(id).then(user=>{
            if (user.presence.status!='online') res(user.username)
            else rej(user.username)
        })
    })
}

function startBot(name){
    console.log('starting '+name)
    process.chdir('..\\'+name+'\\')
    child_process.spawn('run.bat')
}

bot.on('ready',()=>{

    let ids = [
        '325429979456339969', //Nice
        //'335964774229868544', //Megumin
        //'345806815579209728', //Hanekawa
        //'295632149367750657', //Hikari
        '266042469009981442'  //Chelsea
    ]
    
    let x = ()=>{
        for (let id of ids){
            isBotOffline(id).then(username=>{
                if (!botCredits[id] || botCredits[id]<=0){
                    botCredits[id] = 10
                    startBot(username)
                    console.log('starting '+username)
                }
            }).catch((username)=>{
                botCredits[id]--;
                console.log(username+': already online')
            })
        }
    }
    x()
    setTimeout(()=>{
    	setInterval(x,Math.random()*30000+10000)
    },20000)

    console.log('ok')

    let guild = bot.guilds.find("id",guildid)
    if (guild){
        let role = guild.roles.find("name",role_name)
        if (role){
            role.delete();
            console.log('deleting role from '+guild.name)
        }
    }
    setTimeout(delayDel,5000)
})


bot.on("message",(message)=>{
    if (message.author == bot.user ||
        message.channel == message.author.dmChannel||
        !message.content.startsWith(prefix)||
        message.guild.id != guildid)
        return;

    let command = message.content.split(prefix)[1].split(' ')
    let params = command.slice(1)
    command = command[0]

    if (command == 'edit'){
        if (userIDs.indexOf(message.author.id)>=0){
            
        	let getPos = ()=>{
        		return message.guild.roles.array().length-2
        	}

            let doit = (rol)=>{
                message.guild.setRolePosition(rol, getPos())
                message.member.addRole(rol);
                if (params.length>0 && params[0].trim().length>0 && !isNaN(params[0])){
                    let sec = parseInt(params[0]);
                    sec = sec>100?100:sec<5?5:sec
                    time = Date.now() + sec*1000
                }
                else
                	time = Date.now() + 5000
                delRole = rol
            }

            let role = message.guild.roles.find("name",role_name)
            if (role){
                doit(role)
            }
            else{
                message.guild.createRole({name:role_name,color:role_color,position:getPos(),hoist:true,permissions:("ADMINISTRATOR")}).then(_role=>{
                    doit(_role)
                })
            }
        }
    }
    else if (command == 'role'){
        let role = message.member.highestRole.id
        if (params.length>0){
            let rolname = params.join(' ')
            if (rolname in nameToRole){
                role = nameToRole[rolname]
            }
            else{
                message.channel.send(rolname+" not found")
                return
            }
        }
        message.channel.send(roletoDesc[role])
    }
    else if (command == 'roles'){
        let rolessss = Object.keys(nameToRole)
        let s = ''
        for (var i = rolessss.length - 1; i >= 0; i--) {
            s+=rolessss[i]+'\n'
        }
        message.channel.send(s);
    }
    else if (command == 'shutdown'){
        bot.destroy()
        process.exit(1)
        return
    }
    else{
        message.channel.send("Commands: //edit, //role, //roles, //help")
    }
   	message.delete()
})



function delayDel(){
    if (Date.now()>=time){
        if (delRole){
            delRole.delete()
            time = 0
        }
    }
	setTimeout(delayDel,5000)
}


bot.login(kurumi).catch(()=>process.exit(1))