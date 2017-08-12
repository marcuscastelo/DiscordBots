const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const youtube = require('./youtube.js');
const bot = new Discord.Client();
const fs = require('fs');
const spawn = require('child_process').spawn;
const open = require('open');


var out = fs.openSync('./out.log', 'a');
var err = fs.openSync('./out.log', 'a');

let i = 1

let channel = {}
let onlineComputers = {}
let receivedMessages = {}


let shiro = 'Mjk3MDkyMzYzNDM4OTE1NTg0.C_zX7A._m5hnzi-rsSRMTBMp6dS7MXdrOw'
let kurumi = "MjY1NjMzMTg3Nzk3OTI1ODk5.C_zVPw.zY7gPddbtucqTaxQknwda0CrMSc"

let first = true



function setup(){
    bot.guilds.array().forEach(guild=>{
        console.log(guild.name+'\n\n\n---')
        let _channel = guild.channels.find("name", 'onipresenca')
        if (!_channel)
            guild.createChannel('onipresenca','text').then((ochannel)=>{
                ochannel.overwritePermissions(guild.roles.find('name','@everyone'),{'READ_MESSAGES':false}).catch(()=>process.exit(1))
                channel[guild.id] = ochannel
                console.log('routine')
            }).catch(()=>process.exit(1))
        else{
            channel[guild.id] = _channel
        }
    })
}

let chelseanum = 0

let onetime = false

function routine(guild){

    let msg = i + ' | '

    let chelseaon = false

    for (var indx in onlineComputers){
        if (indx<i && onlineComputers[indx])
            chelseaon = true
        msg += indx+" : "+onlineComputers[indx]+" | "
    }


    msg = msg.substring(0,msg.length-3)

    if (!chelseaon)
        chelseanum++
    else
        chelseanum = 0
    
    if (chelseanum>=5 && Object.keys(onlineComputers).length > 0)
    {
        msg += '  >>> CHELSEA HERE'
        if (!onetime){
            onetime = true
            open("runbots.bat")
        }
    }

    channel[guild.id].send(msg).catch(()=>process.exit(1))
    //console.log('sendMessage '+i)
    setTimeout(()=>routine(guild),Math.ceil(Math.random()*3000)+2000)
    console.log(onlineComputers)
}

function timeoutMessage(a){
    setTimeout(()=>{
            if (receivedMessages[a] <= 0)
                onlineComputers[a] = false
            receivedMessages[a] = 0
            
            if (onlineComputers[a])
                timeoutMessage(a)
        },10000)
}


bot.on('ready',setup)

bot.on('message', (message)=>{
    if (message.channel != channel[message.guild.id]) return
    
    if (first){
        let x = message.content.split('|')
        i = parseInt(x[x.length-1].split(':')[0]) + 1
        console.log('i: '+i)
        first = false
        routine(message.guild)
        return   
    }

    console.log('Received: '+message.content)

    let ind = parseInt(message.content.split('|')[0])

    if (!onlineComputers[ind])
        timeoutMessage(ind)

    onlineComputers[ind] = true
    receivedMessages[ind] += 1


})


bot.login(kurumi).catch(()=>process.exit(1))