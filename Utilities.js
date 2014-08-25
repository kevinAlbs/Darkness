var Utilities = (function(){
	var that = {};
	var explosion_emitter;
	var last_particle_color = "white";

	that.extend = function(o1, o2){
		if(!o2) {
			return o1;
		}
		if (!o1) {
			return null;
		}
		for(p in o1){
			if(o1.hasOwnProperty(p)){
				if(o2.hasOwnProperty(p)){
					o1[p] = o2[p];
				}
			}
		}
		return o1;
	}
	that.init = function() {
		explosion_emitter = game.add.emitter(0,0);
		explosion_emitter.makeParticles("white_particle", 0, 100, false, false);
	}
	that.createExplosion = function(x,y,param){
		var settings = {
			color: "white",
			amount: 10
		};
		that.extend(settings, param);

		if (settings.color != last_particle_color) {
			explosion_emitter.removeAll();
			explosion_emitter.makeParticles(settings.color + "_particle", 0, 100, false, false);
		}

		explosion_emitter.x = x;
		explosion_emitter.y = y;
		explosion_emitter.setXSpeed(-200, 200);
		explosion_emitter.setYSpeed(-200, 200);
		explosion_emitter.explode(500, settings.amount);
	}
	return that;
}());