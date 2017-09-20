module.exports.getVideoID = (url)=>{
  var ID = '';
  url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  if(url[2] !== undefined) {
    ID = url[2].split(/[^0-9a-z_\-]/i);
    ID = ID[0];
  }
  else {
    ID = null;
  }
    return ID;
}

module.exports.getPlaylistID = (url)=>{
    let listReg = /^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?.*?(?:list)=(.*?)(?:&|$)/
    let match = url.match(listReg)
    
    if (match && match.length>0 &&match[1])
        return match[1]
    else
        return null
}