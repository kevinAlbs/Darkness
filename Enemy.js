/* Singleton with methods for enemy sprites */

/* initially, pushing back optimizations for group (i.e. sorting by y position) */

var Enemy = (function(){
	var that = {};
	that.createEnemy = function(x,y, enemy_group) {
		//todo: add pooling
		var enemy = enemy_group.create(x,y,"enemy");
		enemy.anchor.setTo(.5, .5);
		enemy.health = 2;
		enemy.body.collideWorldBounds = true;
		enemy.body.gravity.y = CONFIG.GRAVITY;
	}
	that.damage = function(enemy) {
		if(enemy.health <= 1){
			that.killEnemy(enemy);
		} else {
			enemy.damage(1);
		}
	}

	that.fireBullet = function(x, y, enemy_bullet_group, params){
    	var defaults = {
    		angle: null,
    		target: null,
    		speed: 220,
    		angle_variance: 0
    	}
    	var settings = Utilities.extend(defaults, params);
    	//create bullet at head
    	if(settings.target !== null){
    		settings.angle = Math.PI + game.physics.arcade.angleToXY(settings.target, x, y);
    	}
    	var b = enemy_bullet_group.getFirstDead();
    	if(b == null) {
    		b = enemy_bullet_group.create(x, y, "enemy_bullet");
    	} else {
    		b.revive();
    	}
    	b.body.x = x;
    	b.body.y = y; 
    	var angle = settings.angle + Math.random() * (settings.angle_variance -  settings.angle_variance/2);
		b.angle = angle * 180 / Math.PI;
		b.body.angle = angle;
		b.body.velocity.x = settings.speed * Math.cos(angle);
		b.body.velocity.y = settings.speed * Math.sin(angle);
		b.outOfBoundsKill = true;
		game.sound.play("shoot");
    }

	that.killEnemy = function(enemy) {
		//create explosion
		Utilities.createExplosion(enemy.body.x + enemy.width/2, enemy.body.y + enemy.height/2);
		enemy.destroy();
		//show dead enemy
	}

	that.ai = function(enemy, enemy_bullet_group, player) {
		if(player.x > enemy.x + 10) {
			enemy.scale.setTo(1, 1);
		} else if (player.x < enemy.x - 10) {
			enemy.scale.setTo(-1, 1);
		}
		enemy.body.velocity.x *= .9;
		if (Math.abs(player.body.y - enemy.body.y) < 250) {
			if (!enemy.hasOwnProperty("fire_timer")){
				enemy.fire_timer = 1500 + Math.random() * 1000;
			}
			enemy.fire_timer -= 16;
			if(enemy.fire_timer < 0){
				enemy.fire_timer = 1000 + Math.random() * 1000;
				that.fireBullet(enemy.body.x + enemy.width/2, enemy.body.y + enemy.height/3, enemy_bullet_group, {target: player, speed: 200})
			}
			
		}
	}
	return that;
}());