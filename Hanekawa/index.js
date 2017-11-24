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
const astroid = '264477926999719939'
const gamescatname = 'CANAIS DE JOGOS'

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

const oficialRoles = [
    '340448257039794177',
    '330924975794159616',
    '330928554416275457',
    '381127402283204608',
    '381128297242820609',
    '381969333531967488',
    '264477926999719939'
];

let time = 0
let delRole = null

function isBotOffline(id){
    return new Promise((res,rej)=>{
        bot.users.fetch(id).then(user=>{
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

    for (let guild of bot.guilds.array()){
        if (guild.id !== astroid)
            guild.leave();
    }

    let guild = bot.guilds.find("id",astroid)
    if (guild){
        let role = guild.roles.find("name",role_name)
        if (role){
            role.delete();
            console.log('deleting role from '+guild.name)
        }
    }
    setTimeout(delayDel,5000)
})

function removeUselessRoles() {
    let guild = bot.guilds.get(astroid);
    for (let role of guild.roles.filter(r=>oficialRoles.indexOf(r.id) === -1).array()) {
        if (guild.channels.filter(c=>c.type=='voice'&&c.parent&&c.parent.name===gamescatname&&c.name.toUpperCase().startsWith(role.name.toUpperCase())).size<=0){
            role.delete()
        }
    }
}

bot.on('channelDelete', ()=> {
    removeUselessRoles();
})

bot.on('channelCreate', channel => {

    if (channel.type == 'dm' ||
        channel.type == 'group')
    {
        return;
    }

    let guild = bot.guilds.get(astroid);

    if (channel.type == 'category'){
        let etf = guild.channels.filter(c=>c.type==='category').filter(c=>c.name.toUpperCase()===gamescatname).size
        if (etf > 1) {
            channel.delete();
        }
        else {
            channel.overwritePermissions('340448257039794177',{MANAGE_ROLES:true}) //Meus Bots
            channel.overwritePermissions('330928554416275457',{MANAGE_ROLES:true}) //Astronautas
            channel.overwritePermissions('264477926999719939',{MANAGE_ROLES:false}) //Everyone
            removeUselessRoles();
        }
    }
    else if (channel.parent.name.toUpperCase() === gamescatname) {
        if (channel.type === 'voice'){
            let gamename = channel.name.match(/((.+)(?:[-_]\d+)|(.+))/)[1]
            let addPerms = function (role) {
                channel.overwritePermissions('340448257039794177',{CONNECT:true}) //Meus Bots
                channel.overwritePermissions('330928554416275457',{CONNECT:true})
                channel.overwritePermissions(role,{CONNECT:true});                //Novo Cargo
                channel.overwritePermissions('264477926999719939',{CONNECT:false});//Everyone
                removeUselessRoles();
            };


            let gamerole = guild.roles.find(r=>r.name.toUpperCase()===gamename.toUpperCase())
            if (!gamerole) {
                guild.createRole({
                    data:{
                        name:gamename.toUpperCase(),
                        color:'BLUE'
                    }
                }).then(addPerms)
            } else {
                removeUselessRoles();
            }
        }
        else
            channel.delete();
    }
});

bot.on('guildCreate', guild => {
    if (guild.id !== astroid)
    guild.leave();
})

bot.on("message",(message)=>{
    if (message.author == bot.user ||
        message.channel == message.author.dmChannel||
        !message.content.startsWith(prefix)||
        message.guild.id != astroid)
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
    else if (command == 'shutdown'){
        bot.destroy()
        process.exit(1)
        return
    }
    else{
        message.channel.send("Commands: //edit, //role, //roles, //help")
    }
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