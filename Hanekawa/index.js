const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs');
const spawn = require('child_process').spawn;
const open = require('open');
const kurumi = require('./settings.json').token

const prefix = '//'
const role_name = 'Kuro Hanekawa'
const guildid = '264477926999719939'

let userIDs = [
    '238325452588974081', //Luiz
    '301487687922221059', //Gary
    '264494046137810944', //Caorti
    '264284264475000842', //EU
    '202540947538444288', //Igor
    '254610197010448384' //Jair
]


let time = 0
let delRole = null

bot.on("ready",()=>{
    let guild = bot.guilds.find("id",guildid)
    if (guild){
        let role = guild.roles.find("name",role_name)
        if (role){
            role.delete();
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
            
            let doit = (rol)=>{
                message.guild.setRolePosition(rol,message.guild.roles.array().length-2)
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
                message.guild.createRole({name:role_name,color:'#1bd492',position:5,permissions:("ADMINISTRATOR")}).then(_role=>{
                    doit(_role)
                })
            }
        }
    }
    else if (command == 'prune'){
         if (params.length>0 && params[0].trim().length>0 && !isNaN(params[0])){
                    let sec = parseInt(params[0]);
                    sec = sec>80?800:sec<5?5:sec
                    message.channel.send('WIP')
                }
                else
                	message.channel.send(`\`\`\`css\nprune <count>\nprune <count> [user]\nprune <count> bot\n\`\`\``)
    }
    else if (command == 'shutdown'){
    	bot.destroy()
    	process.exit(1)
    	return
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