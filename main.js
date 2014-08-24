var CONFIG = {
  GRAVITY : 800,
  HEART_AMT : 20
}
var state_gameplay = (function(){
  var that = {};
  var player, 
      platform_group,
      falling_platform_group,
      moving_platform_group,
      descructable_platform_group,
      enemy_group,
      enemy_bullet_group,
      player_bullet_group;
  var pendulum_heads; //Phaser group
  var pendulum_roots; //Phaser group
  var pendulums = new Phaser.LinkedList();
  var darkness;
  var heart_group;
  var keys, mouse_down, mouse_click = false, click_lock = false;
  var world_height = 10000;

  /* setup for keyboard/mouse input */
  function initInput(){
    keys = game.input.keyboard.createCursorKeys();
    game.input.mouse.mouseDownCallback = onMouseDown;
    game.input.mouse.mouseUpCallback = onMouseUp;
  }

  function onMouseDown(){
    mouse_down = true;
    if(!click_lock){
      click_lock = true;
      mouse_click = true;
    }
  }

  function onMouseUp(){
    click_lock = false;
    mouse_down = false;
  }
  
  that.preload = function(){
    game.load.image("enemy", "enemy.png");
    game.load.image("platform", "platform.png");
    game.load.image("background_tile", "background.png");
    game.load.image("pendulum_head", "pendulum_head.png");
    game.load.image("white_particle", "white_particle.png");
    game.load.image("heart", "heart.png");
    game.load.image("darkness", "darkness.png");
    game.load.spritesheet("player", "player.png", 11, 25);
    game.load.image("enemy_bullet", "enemy_bullet.png");
    game.load.image("player_bullet", "player_bullet.png");
    game.load.image("falling_platform", "falling_platform.png");
    game.load.image("destructable_platform", "destructable_platform.png");
    game.load.json("map_data", "data.json");
    game.stage.setBackgroundColor(0x000000);
  };

  that.create = function(){
    start_time = game.time.time;
    game.world.setBounds(0, 0, 320, world_height);
    game.add.tileSprite(0, 0, 320, world_height, "background_tile");

    initInput();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    Utilities.init();

    //add initial objects
    player = game.add.sprite(200, world_height - 100, "player", 0);
    player.anchor.setTo(.5, .5);
    player.animations.add("standing", [0])
    player.animations.add("walking", [1,2,3,4], 25, false);
    player.health = CONFIG.HEART_AMT * 5;
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.gravity.y = CONFIG.GRAVITY;
    player.body.collideWorldBounds = true;
    game.camera.follow(player);
    
    platform_group = game.add.group();
    platform_group.enableBody = true;

    falling_platform_group = game.add.group();
    falling_platform_group.enableBody = true;

    destructable_platform_group = game.add.group();
    destructable_platform_group.enableBody = true;

    moving_platform_group = game.add.group();
    moving_platform_group.enableBody = true;

    enemy_group = game.add.group();
    enemy_group.enableBody = true;

    enemy_bullet_group = game.add.group();
    enemy_bullet_group.enableBody = true;

    player_bullet_group = game.add.group();
    player_bullet_group.enableBody = true;

    //create ground
    Platform.createPlatform(0, world_height - 100 + 10, 320, 10, platform_group);

    DataImporter.import(game.cache.getJSON("map_data"), {
      platform_group: platform_group,
      moving_platform_group: moving_platform_group,
      destructable_platform_group: destructable_platform_group,
      falling_platform_group: falling_platform_group,
      enemy_group: enemy_group
    }, player);

    darkness = game.add.tileSprite(0, 10000, 320, 460, "darkness");
    game.physics.enable(darkness, Phaser.Physics.ARCADE);
    darkness.body.velocity.y = -10;

    heart_group = game.add.group();
    updatePlayerHealth(0);


    pendulum_heads = game.add.group();
    pendulum_roots = game.add.group();

    /*
    var pendulum_head = game.add.sprite(100, 350, "platform");
    pendulum_head.scale.setTo(5, 1);

    game.physics.enable(pendulum_head, Phaser.Physics.ARCADE);

    

    pendulum_head.body.immoving = true;
    pendulum_heads.add(pendulum_head);

    var pendulum_root = game.add.sprite(100, 120, "platform");
    game.physics.enable(pendulum_root, Phaser.Physics.ARCADE);
    pendulum_roots.add(pendulum_root);


    var p = {
      "root" : pendulum_root,
      "head" : pendulum_head,
      "xdir" : "left",
      "ydir" : "up"
    };
    pendulums.add(p);
    */

  };

  that.render = function(){
    //debug
  };

  that.update = function(){
    if(game.input.keyboard.isDown(Phaser.Keyboard.D)){
      player.play("walking");
      player.scale.setTo(-1, 1);
      if(player.body.velocity.x < 0){
        player.body.velocity.x = 0;
      }
      player.body.velocity.x += 10;
      if(player.body.velocity.x > 185){
        player.body.velocity.x = 185;
      }
    } else if(game.input.keyboard.isDown(Phaser.Keyboard.A)){
      if(player.body.velocity.x > 0){
        player.body.velocity.x = 0;
      }
      player.body.velocity.x -= 10;
      if(player.body.velocity.x < -185){
        player.body.velocity.x = -185;
      }
      player.play("walking");
      player.scale.setTo(1, 1);
    } else {
      player.body.velocity.x *= .90;
      player.play("standing");
    }

    if(mouse_click){
      var bullet = player_bullet_group.getFirstDead();
      if(!bullet){
        bullet = player_bullet_group.create(player.body.x, player.body.y, "player_bullet");
      } else {
        bullet.revive();
      }
      bullet.body.x = player.body.x;
      bullet.body.y = player.body.y;
      var angle = game.physics.arcade.angleToPointer(player);
      bullet.angle = angle * 180 / Math.PI;
      bullet.body.angle = angle;
      bullet.body.velocity.x = 400 * Math.cos(angle);
      bullet.body.velocity.y = 400 * Math.sin(angle);
    }

    game.physics.arcade.collide(enemy_group, platform_group);
    game.physics.arcade.collide(enemy_group, moving_platform_group);
    game.physics.arcade.collide(enemy_group, falling_platform_group);
    game.physics.arcade.collide(enemy_group, destructable_platform_group);
    game.physics.arcade.collide(enemy_group, player, function(p, e){
      updatePlayerHealth(CONFIG.HEART_AMT);
      Enemy.killEnemy(e);
    });
    game.physics.arcade.collide(enemy_bullet_group, player, function(p, b){
      updatePlayerHealth(CONFIG.HEART_AMT/2);
      b.kill();
    });
    game.physics.arcade.collide(player_bullet_group, enemy_group, function(b, e){
      Enemy.damage(e);
      b.kill();
    });
    game.physics.arcade.collide(player, platform_group);
    game.physics.arcade.collide(player, destructable_platform_group);
    game.physics.arcade.collide(destructable_platform_group, player_bullet_group, function(p, b){
      p.health--;
      if(p.health <= 0){
        p.destroy();
      }
      b.kill();
      Utilities.createExplosion(b.body.x, b.body.y);
    });
    game.physics.arcade.collide(player, falling_platform_group, function(pl, plat){
      if(pl.body.touching.down){
        plat.fall_initiated = true;
      }
    });
    Platform.updateFalling(falling_platform_group);

    game.physics.arcade.collide(player, moving_platform_group);
    Platform.updateMoving(moving_platform_group);

    /*
    game.physics.arcade.collide(player, pendulum_heads, function(pl, ph){
      
    });
    pendulums.iterate(function(p){
      var head = p.head;
      var root = p.root;

      var xflip = p.xdir == "left" ? -1 : 1;
      var yflip = p.ydir == "up" ? -1 : 1;
      head.body.acceleration.x = 100 * xflip;
      //head.body.acceleration.y = 100 * yflip;

      if(head.body.velocity.x > 100 && p.xdir == "right") {
        p.xdir = "left";
      } else if (head.body.velocity.x < -100 && p.xdir == "left") {
        p.xdir = "right";
      }
      head.body.acceleration.y = head.body.acceleration.x;
    });
    */

    enemy_group.forEachAlive(function(enemy){
      Enemy.ai(enemy, enemy_bullet_group, player);
    })
    if(game.input.keyboard.isDown(Phaser.Keyboard.W) && player.body.touching.down){
      player.body.velocity.y = -500;
    }
    mouse_click = false;
  };
  
  function updatePlayerHealth(dmg) {
    if (dmg > 0) {
      player.damage(dmg);
      if(!player.alive){
        //restart
      }
    }
    heart_group.removeAll();
    var num_hearts = Math.floor(player.health / CONFIG.HEART_AMT);
    for(var i = 0; i < num_hearts; i++) {
     var heart = heart_group.create(1 + 11 * i, 450, "heart");
     heart.fixedToCamera = true;
    }
    if(player.health % CONFIG.HEART_AMT >= CONFIG.HEART_AMT/2) {
      //show half heart
      var heart = heart_group.create(1 + 11 * num_hearts, 450, "heart");
      heart.crop(new Phaser.Rectangle(0, 0, 5, 10));
      heart.fixedToCamera = true;
    }
  }
  return that;
}());

var game = new Phaser.Game(320, 460, Phaser.AUTO, "game", state_gameplay);