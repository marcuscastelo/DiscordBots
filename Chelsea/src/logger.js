import Settings from '../settings.json'


function getTime(){return new Date().toTimeString().substr(0,8)}
function write(param,color,error = false){
    console.log(`${getTime()}  \x1b[32m${Settings.bot_name}\x1b[0m | ${color} (${param.verbose}) ${error?'\x1b[31m':color}${param.message}\x1b[0m`)
}

export default class Logger{
    /**
    * 
    * @param {string} message 
    * @param {boolean} error 
    */

    static log(message,verbose=1,error=false){
        if (Settings.verbose<verbose) return;
        let param = {verbose:verbose,message:message}
        switch(verbose)
        {
            case 0:
                write(param,"\x1b[34m",error)
                break;
            case 1:
                write(param,"\x1b[33m",error)
                break;
            case 2:
                write(param,"\x1b[36m",error)
                break;
            default:
                write(param,"\x1b[37m",error)
                break;
        }
    }
    static warn(message,verbose = 1){
        write({verbose:verbose,message:message},"\x1b[47m\x1b[35m")
    }
    static error(message, verbose = 1){
        write({verbose:verbose,message:message},"\x1b[43m\x1b[31m")
    }
}