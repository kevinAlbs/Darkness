var state_boss = (function(){
  var that = {};
  var player, 
      platform_group,
      moving_platform_group,
      enemy_bullet_group,
      player_bullet_group,
      player_group;
  var heart_group;
  var keys, mouse_down, mouse_click = false, click_lock = false;
  var world_height = 460;


  var first_death_occured = false;

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
    game.load.image("platform", "res/img/platform.png");
    game.load.image("background_tile", "res/img/background.png");
    game.load.image("white_particle", "res/img/white_particle.png");
    game.load.image("black_particle", "res/img/black_particle.png");
    game.load.image("heart", "res/img/heart.png");
    game.load.spritesheet("player", "res/img/player.png", 11, 25);
    game.load.image("enemy_bullet", "res/img/enemy_bullet.png");
    game.load.image("player_bullet", "res/img/player_bullet.png");
    game.load.image("boss_body", "res/img/boss_body.png");
    game.load.image("boss_head", "res/img/boss_head.png");
    game.load.image("boss_tail", "res/img/boss_tail.png");
    game.stage.setBackgroundColor(0x000000);
  };

  that.create = function(){
    start_time = game.time.time;
    game.world.setBounds(0, 0, 320, world_height);
    game.add.tileSprite(0, 0, 320, world_height, "background_tile");

    initInput();
    game.physics.startSystem(Phaser.Physics.ARCADE);

    Boss.init();

    Utilities.init();
    TextOverlay.init();
    TextOverlay.showFt(false);
    
    platform_group = game.add.group();
    platform_group.enableBody = true;

    Platform.createPlatform(10, 350, 20, 10, platform_group);
    Platform.createPlatform(290, 350, 20, 10, platform_group);

    player_group = game.add.group();
    player_group.enableBody = true;

     //add initial objects
    player = Player.createPlayer(100, world_height - 30, player_group);
    game.camera.follow(player);


    enemy_group = game.add.group();
    enemy_group.enableBody = true;

    enemy_bullet_group = game.add.group();
    enemy_bullet_group.enableBody = true;

    player_bullet_group = game.add.group();
    player_bullet_group.enableBody = true;

    //create ground
    Platform.createPlatform(0, world_height - 10, 320, 10, platform_group);

    heart_group = game.add.group();
    updatePlayerHealth(0);

    if(first_death_occured){
      //create 10 other players
      for(var i = 0; i < 10; i++){
        var friend = Player.createPlayer(10, world_height - 20, player_group, true);
        Player.AIMoveTo(20 + i*20, friend);
      }
      player.health = CONFIG.HEART_AMT * 30;
      updatePlayerHealth(0);
    } else {
      //show intro text
      TextOverlay.say([
        [
          {
            "name" : "hemlighet",
            "message": "Mmm, I see you have escaped the dungeon. But you shall not continue from here. You will rot in obscurity for the remainder of your life."
          },
          {
            "name" : CONFIG.NAME,
            "message": "..."
          }
        ],
        [
          {
            "name" : "hemlighet",
            "message": "Speechless? Perhaps you're reconsidering leaving this world?"
          },
          {
            "name" : CONFIG.NAME,
            "message": "No, I've made my decision..."
          },
          {
            "name" : "hemlighet",
            "message": "No matter. You cannot defeat me."
          },
          {
            "name" : "hemlighet",
            "message": "I am the weakness within you"
          },
          {
            "name" : "hemlighet",
            "message": "The despair"
          },
          {
            "name" : "hemlighet",
            "message": "The hopelessness"
          },
          {
            "name" : "hemlighet",
            "message": "You cannot deny your fate"
          }
        ]
      ]);
    }

  };

  that.render = function(){
    //debug
  };

  that.update = function(){
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

      if(game.input.keyboard.isDown(Phaser.Keyboard.R) && first_death_occured) {
        console.log("Released");
        updatePlayerHealth(CONFIG.HEART_AMT * 5);
      }

      Boss.update(enemy_bullet_group, player_group);

      if(mouse_down){
        Player.fireBullet(player, player_bullet_group);
      }
    }

    game.physics.arcade.collide(enemy_bullet_group, player, function(p, b){
      updatePlayerHealth(CONFIG.HEART_AMT/2, 2000);
      b.kill();
    });
    game.physics.arcade.collide(player_bullet_group, Boss.getHead(), function(bul, b){
      Boss.damage();
      b.kill();
    });
    game.physics.arcade.collide(player_group, platform_group);

    player_group.forEach(function(p){
      if(p.isAI){
        Player.AIUpdate(p);
        if(!Boss.isDead()){
          Player.fireBullet(p, player_bullet_group, Boss.getHead());
        }
      }
    })

    if(game.input.keyboard.isDown(Phaser.Keyboard.W) && player.body.touching.down){
      player.body.velocity.y = -500;
    }

    if(Boss.isDead() && Boss.outOfScreen()){
      game.paused = true;
      Screen.endGame();
    }
    mouse_click = false;
  };
  
  function updatePlayerHealth(dmg, time_to_transition) {
    if(player.health <= dmg){
      if(!first_death_occured && !Boss.isDead()){
        //show the friendshit
        for(var i = 0; i < 10; i++){
          var friend = Player.createPlayer(10, world_height - 20, player_group, true);
          Player.AIMoveTo(20 + i*20, friend);
        }
        var chosen_friend = CONFIG.FRIENDS[0];
        var others = "";
        for(var i = 1; i < CONFIG.FRIENDS.length; i++){
          if(i == CONFIG.FRIENDS.length - 1 && CONFIG.FRIENDS.length > 2){
            others += ", and ";
          } else if(i > 1){
            others += ", " 
          }
          others += CONFIG.FRIENDS[i]

        }
        TextOverlay.say([
              [
                {
                  "name" : chosen_friend,
                  "message" : CONFIG.NAME + "! wait!"
                },
                {
                  "name" : chosen_friend,
                  "message" : "We've come to help you!"
                },
                {
                  "name" : chosen_friend,
                  "message" : "We've all been here before, battling with darkness"
                },
                {
                  "name" : chosen_friend,
                  "message" : "But you don't have to do it alone"
                },
                {
                  "name" : chosen_friend,
                  "message" : "All of us, " + others
                },
                {
                  "name" : chosen_friend,
                  "message" : "We've been in your exact position. Playing this same game."
                },
                {
                  "name" : chosen_friend,
                  "message" : "Alone you cannot defeat this darkness"
                },
                {
                  "name" : chosen_friend,
                  "message" : "But together we can"
                },
                {
                  "name" : CONFIG.NAME,
                  "message" : "... I didn't expect anyone to help me"
                },
                {
                  "name" : CONFIG.NAME,
                  "message" : "But I could really use some"
                },
                {
                  "name" : chosen_friend,
                  "message" : "Then let's do this!"
                },
              ]
            ], {}, function(){
              Boss.atLeastHalf();
              player.health = CONFIG.HEART_AMT * 30;
              updatePlayerHealth(0);
            });
        
        first_death_occured = true;
      } else {
        player.damage(dmg);
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
      }
    } else {
      player.damage(dmg);
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

