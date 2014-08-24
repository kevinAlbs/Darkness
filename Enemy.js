/* Singleton with methods for enemy sprites */

/* initially, pushing back optimizations for group (i.e. sorting by y position) */

var Enemy = (function(){
	var that = {};
	that.addEnemy = function(x,y, enemy_group) {
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
	that.killEnemy = function(enemy) {
		enemy.kill();
		//create explosion
		Utilities.createExplosion(enemy.body.x + enemy.width/2, enemy.body.y + enemy.height/2);
		//show dead enemy
	}

	that.ai = function(enemy, enemy_bullet_group, player) {
		enemy.body.velocity.x *= .9;
		if (Math.abs(player.body.y - enemy.body.y) < 250) {
			if (!enemy.hasOwnProperty("fire_timer")){
				enemy.fire_timer = 1500 + Math.random() * 1000;
			}
			enemy.fire_timer -= 16;
			if(enemy.fire_timer < 0){
				enemy.fire_timer = 1000 + Math.random() * 1000;
				//create new bullet
				var b = enemy_bullet_group.create(enemy.body.x + enemy.width/2, enemy.body.y + enemy.height/2, "enemy_bullet");
				var angle = game.physics.arcade.angleBetween(enemy, player);;
				b.angle = angle * 180 / Math.PI;
				b.body.angle = angle;
				b.body.velocity.x = 200 * Math.cos(angle);
				b.body.velocity.y = 200 * Math.sin(angle);
			}
			
		}
	}
	return that;
}());