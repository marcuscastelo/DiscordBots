const Discord = require('discord.js')
const child_process = require('child_process')
const bot = new Discord.Client()
const settings = require('./settings.json')

const botCredits = {}

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
        '345806815579209728', //Hanekawa
        '295632149367750657', //Hikari
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
})

bot.login(settings.token)
