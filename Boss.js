var Boss = (function(){
	var that = {};
	var state = "defense";//or offense
	var defense_timer = 10000;
	var defense_move_timer = 2000;
	var defense_small_attack_timer = 750;
	var defense_mid_attack_timer = 1000;
	var defense_large_attack_timer = 5000;
	var explosion_timer = 500;
	var health = 1000;
	var health_sprite;
	var toX, toY;
	var boss_head,
      boss_tail,
      boss_body;

    function updateParts() {
    	boss_head.x = boss_body.x + 110 + boss_head.width/2;
    	boss_head.y = boss_body.y - 25 + boss_head.height/2;
    	boss_tail.x = boss_body.x + 131;
    	boss_tail.y = boss_body.y + 250;
    };

    function updateHealth(){
    	health_sprite.scale.setTo(health * (310/1000) / 2, 5);
    }
    that.atLeastHalf = function(){
    	if(health < 500){
    		health = 500;
    	}
    }
    that.getHealth = function(){
    	return health;
    }
    that.getHead = function(){
    	//lol
    	return boss_head;
    }
    that.isDead = function(){
    	return health <= 0;
    }
    that.damage = function() {
    	health--;
    }
    that.outOfScreen = function(){
    	return boss_body.y > 400;
    }

	that.update = function(enemy_bullet_group, player_group) {
		if(!that.isDead()){
			//strategy
			if(state == "defense") {
				if(defense_move_timer < 0){
		          toX = -110 + Math.random() * 240;
		          toY = Math.random() * 102;
		          defense_move_timer = 2000;
		        }
		        if(defense_small_attack_timer < 0){
		        	Enemy.fireBullet(boss_head.x, boss_head.y, enemy_bullet_group, {angle: Math.PI * 1/2});
		        	defense_small_attack_timer = 750;
		        }
		        if(defense_mid_attack_timer < 0){
		        	var target = player_group.getRandom();
		        	Enemy.fireBullet(boss_head.x, boss_head.y, enemy_bullet_group, {target: target, angle_delta: -.1});
		        	Enemy.fireBullet(boss_head.x, boss_head.y, enemy_bullet_group, {target: target, angle_delta: 0});
		        	Enemy.fireBullet(boss_head.x, boss_head.y, enemy_bullet_group, {target: target, angle_delta: .1});
		        	defense_mid_attack_timer = 1000;
		        }
		        if(defense_large_attack_timer < 0){
		        	for(var i = 30; i < 150; i += 10){
		        		Enemy.fireBullet(boss_head.x, boss_head.y, enemy_bullet_group, {angle: i * (Math.PI/180)})
		        	}
		        	defense_large_attack_timer = 5000;
		        }
		        defense_move_timer -= 16;
		        defense_small_attack_timer -= 16;
		        defense_mid_attack_timer -= 16;
		        defense_large_attack_timer -= 16;
			}
			defense_timer -= 16;
			var scale = .04 + Math.random() * .02;
			boss_body.x += (toX - boss_body.x) * scale;
			boss_body.y += (toY - boss_body.y) * scale;
		} else {
			boss_body.body.velocity.x = 0;
			boss_body.body.velocity.y = 15;
			if(explosion_timer <= 0){
				//show explosion
				Utilities.createExplosion(boss_body.x + Math.random() * boss_body.width, boss_body.y + Math.random() * boss_body.height, {amount: 20, color: "black"});
				explosion_timer = 250 + Math.random() * 100;
			}
			explosion_timer -= 16;
		}

		
		updateParts();
		updateHealth();
	};

	that.init = function() {
		toX = 10;
		toY = 50;
		boss_body = game.add.sprite(toX, toY, "boss_body");
    	boss_head = game.add.sprite(0, 0, "boss_head");
    	boss_head.anchor.setTo(.5, .5);

    	boss_tail = game.add.sprite(0, 0, "boss_tail");
    	health_sprite = game.add.sprite(5, 3, "white_particle");
    	updateHealth();
    	game.physics.enable(boss_body, Phaser.Physics.ARCADE);
    	game.physics.enable(boss_head, Phaser.Physics.ARCADE);
    	game.physics.enable(boss_tail, Phaser.Physics.ARCADE);
    	boss_head.body.immovable = true;
    	updateParts()
	};

	return that;
}());