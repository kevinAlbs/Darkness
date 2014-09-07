var Player = (function(){
	var that = {};
	that.createPlayer = function(x, y, player_group, ai){
		var player = game.add.sprite(x, y, "player", 0);
	    player.anchor.setTo(.5, .5);
	    player.animations.add("standing", [0])
	    player.animations.add("walking", [1,2,3,4], 25, false);
	    player.animations.add("death", [6, 7, 8], 10, false);
	    player.health = CONFIG.HEART_AMT * 3;
	    player.gun_timer = 0;
	    game.physics.enable(player, Phaser.Physics.ARCADE);
	    player.body.gravity.y = CONFIG.GRAVITY;
	    player.body.collideWorldBounds = true;
	    if(player_group){
	    	player_group.add(player);
	    }
	    if(ai){
	    	player.gun_timer = 300 + Math.random() * 500;
	    	player.isAI = true;
	    	player.move_timer = 3000 + Math.random() * 2000;
	    }
	    return player;
	}
	that.fireBullet = function(player, player_bullet_group, target){
		if(player.gun_timer <= 0){
			var bullet = player_bullet_group.getFirstDead();
	        if(!bullet){
	          bullet = player_bullet_group.create(0, 0, "player_bullet");
	        } else {
	          bullet.revive();
	        }
	        bullet.body.x = player.x;
	        bullet.body.y = player.y - player.height/4;
	        bullet.outOfBoundsKill = true;
	        var angle;
	        if(target == null) {
	        	angle = game.physics.arcade.angleToPointer(player);
	        } else {
	        	angle = game.physics.arcade.angleBetween(player, target);
	        }
	        bullet.angle = angle * 180 / Math.PI;
	        bullet.body.angle = angle;
	        bullet.body.velocity.x = 400 * Math.cos(angle);
	        bullet.body.velocity.y = 400 * Math.sin(angle);
	        player.gun_timer = 150;
	        if(player.isAI){
	        	player.gun_timer = 500;
	        }
	        game.sound.play("shoot");
		} else {
			player.gun_timer -= 16;
		}
	}
	that.AIMoveTo = function(x, player){
		var diff = x - player.x;
		if(diff == 0){
			return;
		}
		var flip = diff/Math.abs(diff);
		player.body.velocity.x = 100 * flip;
		player.scale.setTo(-1 * flip, 1);
		player.target_x = x;
	}
	that.AIUpdate = function(player){
		if(Math.abs(player.target_x - player.x) < 10){
			player.body.velocity.x *= .9;
			player.play("standing");
		} else {
			that.AIMoveTo(player.target_x, player);
			player.play("walking");
		}

		player.move_timer -= 16;
		if(player.move_timer < 0){
			if(Math.random() < .05){
				player.body.velocity.y = -400;
			}
			that.AIMoveTo(10 + Math.random() * 300, player);
			player.move_timer = 3000 + Math.random() * 4000;
		}
	}

	that.update = function(player){
		player.gun_locked = false;
	}
	return that;
}());