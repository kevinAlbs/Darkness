var DataImporter = (function(){
	var that = {};
	that.import = function(json, groups, player){
		player.x = json.playerX;
		player.y = json.playerY;
		for(var i = 0; i < json.platforms.length; i++){
			var p = json.platforms[i];
			Platform.createPlatform(p.x, p.y, p.width, p.height, groups.platform_group);
		}
		for(var i = 0; i < json.moving_platforms.length; i++){
			var p = json.moving_platforms[i];
			Platform.createMoving(p.x, p.y, p.width, p.height, p.direction, p.radius, groups.moving_platform_group);
		}
		for(var i = 0; i < json.destructable_platforms.length; i++){
			var p = json.destructable_platforms[i];
			Platform.createDestructable(p.x, p.y, p.width, groups.destructable_platform_group);
		}
		for(var i = 0; i < json.falling_platforms.length; i++){
			var p = json.falling_platforms[i];
			Platform.createFalling(p.x, p.y, p.width, groups.falling_platform_group);
		}
		for(var i = 0; i < json.enemies.length; i++){
			var p = json.enemies[i];
			Enemy.createEnemy(p.x, p.y, groups.enemy_group);
		}
	}
	return that;
}());