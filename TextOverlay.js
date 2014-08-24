/* Shows text overlay */
var TextOverlay = (function(){
	var that = {};

	that.say = function(msg){
		console.log(msg);
		game.paused = true;
	}

	that.init = function(game){

	}
	return that;
}());