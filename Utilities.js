var Utilities = (function(){
	var that = {};
	var explosion_emitter;

	that.init = function() {
		explosion_emitter = game.add.emitter(0,0);
		explosion_emitter.makeParticles("white_particle", 0, 100, false, false);
	}
	that.createExplosion = function(x, y){
		explosion_emitter.x = x;
		explosion_emitter.y = y;
		explosion_emitter.explode(500, 10);
	}
	return that;
}());