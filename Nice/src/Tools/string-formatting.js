export default class StringFormatter{
    /**
     * 
     * @param {number} seconds 
     * @param {number} target
     * @returns {string}
     */
    static formatTime(seconds,target=2){
        if (!isNaN(seconds)){
            seconds = Math.round(seconds)
            let buffer = [seconds%60]
			let temp = seconds
			while((temp>=60&&buffer.length<=2)){
    			temp = Math.floor(temp/60)
    			buffer.splice(0,0,temp%60)
			}
			            
			if (temp>=24&&buffer.length>1){
    			buffer[0] = temp%24
    			buffer.splice(0,0,Math.floor(temp/24));
			}
			            
			while(buffer.length<target){
    			buffer.splice(0,0,0)
			}
			            
			return(buffer.reduce((a,n)=>a+(a.length>0?":":"")+(n<10?'0'+n:n),''))
        }
        console.error('isnan: '+seconds)
    }

    static convert_time(duration) {
        var a = duration.match(/\d+/g);
    
        if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
            a = [0, a[0], 0];
        }
    
        if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
            a = [a[0], 0, a[1]];
        }
        if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
            a = [a[0], 0, 0];
        }
    
        duration = 0;
    
        if (a.length == 3) {
            duration = duration + parseInt(a[0]) * 3600;
            duration = duration + parseInt(a[1]) * 60;
            duration = duration + parseInt(a[2]);
        }
    
        if (a.length == 2) {
            duration = duration + parseInt(a[0]) * 60;
            duration = duration + parseInt(a[1]);
        }
    
        if (a.length == 1) {
            duration = duration + parseInt(a[0]);
        }
        return duration
    }

}