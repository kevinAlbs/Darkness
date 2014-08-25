var Platform = (function(){
	var that = {};

	//initializers
	that.createPlatform = function(x, y, width, height, platform_group) {
		var platform = platform_group.create(x, y, "platform");
	    platform.scale.setTo(width/10, height/10);
	    platform.body.immovable = true;
	    return platform;
	};

	/* @param dir - can be 'up', 'left', 'down', 'right' */
	that.createMoving = function(x, y, width, height, dir, radius, moving_platform_group) {
	    var moving = game.add.sprite(x, y, "platform");
	    moving.scale.setTo(width/10, height/10);
	    moving.direction = dir;
	    moving.radius = radius;
	    moving_platform_group.add(moving);
	    moving.body.immovable = true;
	};

	that.createDestructable = function(x, y, width, destructable_platform_group) {
		var destructable = game.add.tileSprite(x, y, width, 10, "destructable_platform");
	    destructable.health = 3;
	    destructable_platform_group.add(destructable);
	    destructable.body.immovable = true;
	};

	that.createFalling = function(x, y, width, falling_platform_group) {
		var falling = game.add.tileSprite(x, y, width, 10, "falling_platform");
	    falling.fall_timer = 400;
	    falling_platform_group.add(falling);
	    falling.body.immovable = true;
	};

	that.updateFalling = function(falling_platform_group){
		falling_platform_group.forEach(function(plat){
	      if(plat.fall_initiated){
	        plat.fall_timer -= 16;
	        if(plat.fall_timer < 0){
	          plat.body.acceleration.y = CONFIG.GRAVITY;
	        }
	      }
	    });
	};

	that.updateMoving  = function(moving_platform_group) {
		moving_platform_group.forEachAlive(function(p){
	      if(p.direction == "up"){
	        p.body.velocity.y -= 2;
	        if(p.body.velocity.y < -1 * p.radius){
	          p.direction = "down";
	        }
	      } else if(p.direction == "down"){
	        p.body.velocity.y += 2;
	        if(p.body.velocity.y > p.radius){
	          p.direction = "up";
	        }
	      } else if(p.direction == "left"){
	        p.body.velocity.x -= 2;
	        if(p.body.velocity.x < -1 * p.radius){
	          p.direction = "right";
	        }
	      } else if(p.direction == "right"){
	        p.body.velocity.x += 2;
	        if(p.body.velocity.x > p.radius){
	          p.direction = "left";
	        }
	      }
	    });
	};

	return that;
}());