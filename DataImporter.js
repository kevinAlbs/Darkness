var DataImporter = (function(){
	var that = {};
	that.import = function(json, platform_group){
		for(var i = 0; i < json.platforms.length; i++){
			var p = json.platforms[i];
			var ps = game.add.sprite(p.x, p.y, "platform");
			ps.scale.setTo(p.width/10, 1);
			platform_group.add(ps);
			ps.body.immovable = true;
		}
	}
	return that;
}());