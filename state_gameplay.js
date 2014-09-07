
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
  var final_platform;
  var pendulums = new Phaser.LinkedList();
  var darkness;
  var heart_group;
  var keys, mouse_down, mouse_click = false, click_lock = false;
  var world_height = 10000;
  var checkpoint = null;
  var checkpoint_reached = false;
  var ascended = false;
  var first_run = false;
  var in_menu = true;

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
    game.load.image("enemy", "res/img/enemy.png");
    game.load.image("platform", "res/img/platform.png");
    game.load.image("background_tile", "res/img/background.png");
    game.load.image("white_particle", "res/img/white_particle.png");
    game.load.image("black_particle", "res/img/black_particle.png");
    game.load.image("heart", "res/img/heart.png");
    game.load.image("darkness", "res/img/darkness.png");
    game.load.spritesheet("player", "res/img/player.png", 11, 25);
    game.load.image("enemy_bullet", "res/img/enemy_bullet.png");
    game.load.image("player_bullet", "res/img/player_bullet.png");
    game.load.image("falling_platform", "res/img/falling_platform.png");
    game.load.image("destructable_platform", "res/img/destructable_platform.png");
    game.load.image("flag", "res/img/flag.png");
    game.load.json("map_data", "res/data/map.json");
    game.load.audio("jump", "res/snd/jump.wav");
    game.load.audio("shoot", "res/snd/shoot.wav");
    game.load.audio("hurt", "res/snd/hurt.wav");
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
    player.animations.add("death", [6, 7, 8], 10, false);
    player.health = CONFIG.HEART_AMT * 3;
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
    final_platform = Platform.createPlatform(0, 1307, 50, 10, platform_group);
    console.log(final_platform);

    DataImporter.import(game.cache.getJSON("map_data"), {
      platform_group: platform_group,
      moving_platform_group: moving_platform_group,
      destructable_platform_group: destructable_platform_group,
      falling_platform_group: falling_platform_group,
      enemy_group: enemy_group
    }, player);



    darkness = game.add.tileSprite(0, 10000, 320, 1000, "darkness");
    game.physics.enable(darkness, Phaser.Physics.ARCADE);
    darkness.body.velocity.y = -20;
    darkness.body.acceleration.y = -1;
    darkness.body.immovable = true;

    if(checkpoint_reached) {
      player.x = checkpoint.x;
      player.y = checkpoint.y - 7;
      darkness.y = checkpoint.y + 460;
      darkness.body.velocity.y = -40;
      darkness.body.acceleration.y = -2;
    }

    heart_group = game.add.group();
    updatePlayerHealth(0);
    if(in_menu){
      game.paused = true;
    }
  };

  that.render = function(){
    //debug
  };

  //called when menu done
  that.menuInit = function(){
    first_run = true;
    game.paused = false;
    in_menu = false;
  }

  that.update = function(){
    if(first_run){
     TextOverlay.showFt(true);
     TextOverlay.say([
        [
          {
            "name" : CONFIG.NAME,
            "message": "I've been trapped in this darkness."
          },
          {
            "name" : CONFIG.NAME,
            "message": "This might be my only escape."
          },
          {
            "name" : CONFIG.NAME,
            "message": "I need to reach the top before I'm submerged"
          }
        ]
      ]);
      first_run = false;
    }
    if(ascended){
      return;
    }
    TextOverlay.updateFt(Math.floor((player.y - 1295) * (1000 / 9500)));

    if(darkness.body.velocity.y < -80){
      darkness.body.velocity.y = -80;
      darkness.body.acceleration.y = 0;
    }
    if(player.alive){
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

      if(game.input.keyboard.isDown(Phaser.Keyboard.R)) {
        console.log("Released");
        updatePlayerHealth(CONFIG.HEART_AMT * 5);
      }


      if(mouse_click){

        var bullet = player_bullet_group.getFirstDead();
        if(!bullet){
          bullet = player_bullet_group.create(0, 0, "player_bullet");
        } else {
          bullet.revive();
        }
        bullet.outOfBoundsKill = true;
        //bullet.lifespan = 2000;
        bullet.body.x = player.x;
        bullet.body.y = player.y - player.height/4;
        var angle = game.physics.arcade.angleToPointer(player);
        bullet.angle = angle * 180 / Math.PI;
        bullet.body.angle = angle;
        bullet.body.velocity.x = 400 * Math.cos(angle);
        bullet.body.velocity.y = 400 * Math.sin(angle);
        game.sound.play("shoot");
      }
    }

    game.physics.arcade.collide(player, final_platform, function(){
      ascended = true;
      //game.paused = true;
      Screen.transition(function(){
        console.log("here");
        game.state.add("boss", state_boss, true);
        game.state.start("boss", true);
      });
    });


    game.physics.arcade.collide(enemy_group, platform_group);
    game.physics.arcade.collide(enemy_group, moving_platform_group);
    game.physics.arcade.collide(enemy_group, falling_platform_group);
    game.physics.arcade.collide(enemy_group, destructable_platform_group);
    game.physics.arcade.overlap(enemy_group, player, function(p, e){
      updatePlayerHealth(CONFIG.HEART_AMT, 2000);
      game.sound.play("hurt");
      Enemy.killEnemy(e);
    });
    game.physics.arcade.overlap(enemy_bullet_group, player, function(p, b){
      updatePlayerHealth(CONFIG.HEART_AMT/2, 2000);
      Utilities.createExplosion(b.body.x, b.body.y);
      game.sound.play("hurt");
      b.kill();
    });
    game.physics.arcade.overlap(player_bullet_group, enemy_group, function(b, e){
      Enemy.damage(e);
      b.kill();
    });
    game.physics.arcade.collide(player, platform_group);
    game.physics.arcade.collide(player, darkness, function(p, d){
      updatePlayerHealth(CONFIG.HEART_AMT * 5, 3000);
    });
    game.physics.arcade.collide(player, destructable_platform_group);

    var to_be_destroyed = [];
    game.physics.arcade.collide(destructable_platform_group, player_bullet_group, function(p, b){
      p.health--;
      if(p.health <= 0){
        to_be_destroyed.push(p);
      }
      Utilities.createExplosion(b.body.x, b.body.y);
      b.kill();
    });

    for(var i = 0; i < to_be_destroyed.length; i++){
      to_be_destroyed[i].destroy();
    }
    game.physics.arcade.collide(player, falling_platform_group, function(pl, plat){
      if(pl.body.touching.down){
        plat.fall_initiated = true;
      }
    });
    Platform.updateFalling(falling_platform_group);

    game.physics.arcade.collide(player, moving_platform_group);
    Platform.updateMoving(moving_platform_group);

    enemy_group.forEachAlive(function(enemy){
      Enemy.ai(enemy, enemy_bullet_group, player);
    });


    if (checkpoint != null && Math.abs(player.y - checkpoint.y) <= 15){
      checkpoint_reached = true;
    }

    if(game.input.keyboard.isDown(Phaser.Keyboard.W) && player.body.touching.down){
      game.sound.play("jump", .5);
      player.body.velocity.y = -500;
    }
    mouse_click = false;
  };
  
  function updatePlayerHealth(dmg, time_to_transition) {
    if (dmg > 0) {
      player.damage(dmg);      
      if(!player.alive){
        //restart
        window.setTimeout(
          function(){
           Screen.transition(function(){
            game.state.restart();
           })
          },
          time_to_transition
        );
        Utilities.createExplosion(player.x, player.y, {color: "black", amount: 30});
        
        //show death
        //player.animations.play("death", 10, false, true);
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

  that.setCheckpoint = function(x, y){
    checkpoint = game.add.sprite(x,y,"flag");
  }
  return that;
}());
