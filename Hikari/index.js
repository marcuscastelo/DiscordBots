const Discord = require("discord.js");
const ytdl = require('ytdl-core');
const youtube = require('./youtube.js');
const bot = new Discord.Client();
const fs = require('fs');
const path = require('path');

//OPTIONS
let guild;
const optBotChannelName = "music";
const prefix = ";";
//END OPTIONS

const dic = {'e_acabou':1, 'daijobu':1, 'shooting_stars':1, 'sumiu':1, 'mccree':3, 'soldier':1, 'sombra':1, 'reaper':1, 'reaper_':1, 'tracer':6, 'pharah':1, 'junk':2, 'bastion':1, 'mei':1, 'widow':3, 'winston':1, 'torb':2, 'rein':1, 'zarya':2, 'roadhog':1, 'dva':4, 'lucio':2, 'orisa':2, 'ana':2, 'mercy':3, 'symmetra':5, 'zenny':1, 'genji':1, 'hanzo':1}

let playing = false
let _message = null
let lastChannel = null
let lastVoiceChannel = null
let lastVoiceConnection = null

function playSound(soundName, index){
    playing = true
    let max = dic[soundName]
    let num = Math.floor(Math.random()*(max)+1)
    if (index>0)
    	num = index
    
    
    lastVoiceChannel = _message.member.voiceChannel
    if (lastVoiceChannel){
        lastVoiceChannel.join().then((c)=>{
            lastVoiceConnection = c
            console.log('Sounds\\'+soundName+num+'.mp3')
            let dispacher = lastVoiceConnection.playFile('Sounds\\'+soundName+num+'.mp3', {seek:0, volume:0.4})
            dispacher.on('end',()=>{
                playing = false
            })
        })
    }
}

bot.on('message',(message)=>{
    if (message.author == bot.user ||
        message.channel == message.author.dmChannel||
        !message.content.startsWith(prefix))
        return;

    _message = message
    lastChannel = message.channel
    let command = message.content.toLowerCase().slice(1).split(' ')
    let num = 0;
    if (command.length>1){
    	num = command[1];
    }
    command = command[0];

    console.log('\''+command+'\'');
    console.log('\''+num+'\'');

    if (command==='leave'){
    	if (lastVoiceConnection){
    		lastVoiceConnection.disconnect()
    	}
    }
    else if (command in dic){
        if (playing) message.reply('Calminha aí, ainda nem acabou o anterior :S')
        else playSound(command, num)
    }
    else{
        let msg = '````css\n'
        for (hero in dic)
            msg+=hero+'  1 - '+ dic[hero]+' \n'
        lastChannel.sendMessage(msg+'\n```')
    }
    
})

bot.login("Mjk1NjMyMTQ5MzY3NzUwNjU3.C-VINw._LgpBinEooOxScpiVXcll-e64Eo");
