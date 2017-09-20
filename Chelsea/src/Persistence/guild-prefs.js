export default class GuildData{

    /**
     * @typedef Playlist
     * @property {string} name
     * @property {User} addedBy 
     * @property {PlaylistItem[]} playlist
     * 
     * 
     * @typedef PlaylistItem
     * @property {string} videoTitle
     * @property {string} videoID
     * @property {number} videoLength
     * @property {string} addedBy
     * /
     * 
     * 
     * @typedef GuildBody
     * @type {Object}
	 * @property {string} id
	 * @property {string} name
	 * @property {PlaylistItem[]} playlist
	 * @property {PlaylistItem[]} playlist_src
	 * @property {Playlist[]} saved_playlists
	 * @property {number} volume
	 * @property {boolean} shuffle
	 * @property {number} loop
	 * @property {number} actualIndex
	 * @property {string} prefix 
     * /
     * 
     * 
     * 
     * @param {GuildBody} body 
     */
    constructor(body){
        this.id = body.id
		this.name = body.name
		this.playlist = body.playlist
		this.playlist_src = body.playlist_src
        this.saved_playlists = body.saved_playlists
        this.volume = body.volume
		this.shuffle = body.shuffle
		this.loop = body.loop
        this.actualIndex = body.actualIndex
        this.prefix = body.prefix        
    }
}
