const config = {
    type: Phaser.AUTO,
    width:  1232,
    height: 928,
    parent: 'gameContainer',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: {
      preload: preload,
      create: create,
      update: update,
    },
  };
  

  const game = new Phaser.Game(config);
  let player;
  let backButton;
  let mrbunny;
  const MAX_SPEED = 1000;  
  let cursors;
  let keyA;
  let keyD;
  let keyS;
  let keyW;
  let keyShift;
  let keySpace;
  let cloudGroup;
  let particles;
  let newGameText;
  let backButtonText;
  
  const spriteWidth = 1024/9;
  const spriteHeight = 1024/8;
  const numFrames = 9*8;
  const numColumns = 9;
  
  
  
  
  function preload() {
    this.load.image('backButton', 'assets/images/back2.png');
    this.load.image('worldmap', 'assets/images/cupcakeforest.png');
    this.load.image('player', 'assets/images/abbie.png'); 
    this.load.image('mrbunny', 'assets/images/exclamation.png');   
    this.load.spritesheet('exhaust', 'assets/images/exhaust.png', {
      frameWidth: spriteWidth,
      frameHeight: spriteHeight,
      startFrame: 0,
      endFrame: numFrames - 1,
      margin: 0,
      spacing: 0
    });
  }
  
  function create() {
    const worldMap = this.add.image(0, 0, 'worldmap')
    .setOrigin(0)
    .setDepth(0)
    .setDisplaySize(config.width, config.height); // scale the image to fit the viewport
  
    this.cameras.main.setZoom(1.0);
  
    player = this.physics.add.sprite(900 , 100, 'player');
    player.setScale(0.35);
    player.setDepth(1);
    player.setAngle(0); // Set initial rotation to -30 degrees (clockwise)
  
    backButton = this.physics.add.sprite(1100 , 800, 'backButton');
    backButton.setScale(0.35);
    backButton.setDepth(2);
    backButton.setAngle(-90); // Set initial rotation to -30 degrees (clockwise)

    mrbunny = this.physics.add.sprite(380 , 100, 'mrbunny');
    mrbunny.setScale(0.05);
    mrbunny.setDepth(2);
    mrbunny.setAngle(0); // Set initial rotation to -30 degrees (clockwise)

    newGameText = this.add.text(config.width / 2, config.height / 2, "", {
      fontSize: "32px",
      fill: "#000",
      stroke: "#fff",
      strokeThickness: 6,
      fontStyle: "bold",
      fontFamily: "Arial",
    });
    newGameText.setOrigin(0.5); 


    backButtonText = this.add.text(config.width / 2, config.height / 2, "", {
      fontSize: "32px",
      fill: "#000",
      stroke: "#fff",
      strokeThickness: 6,
      fontStyle: "bold",
      fontFamily: "Arial",
    });
    backButtonText.setOrigin(0.5);  


    cursors = this.input.keyboard.createCursorKeys();
    keyA = this.input.keyboard.addKey('A');
    keyD = this.input.keyboard.addKey('D');
    keyS = this.input.keyboard.addKey('S');
    keyW = this.input.keyboard.addKey('W');
    keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
    // set up the heart animation
    const sprites = this.anims.generateFrameNames('exhaust', {
      start: 0,
      end: numFrames - 1,
      zeroPad: 0,
      prefix: '',
      suffix: ''
    });
  
    // Create sprites using the frames
    sprites.forEach((sprite, index) => {
      const x = (index % numColumns) * spriteWidth;
      const y = Math.floor(index / numColumns) * spriteHeight;
  
      const exhaustSprite = this.add.sprite(x, y, 'exhaust', sprite.frame);    
      exhaustSprite.setVisible(false);
    });  
    
    const frames = [];
  
    // Populate the frames array using a loop
    for (let i = 0; i < 49; i++) {
      frames.push(i);
    }
    
    particles = this.add.particles(0, 0, 'exhaust', {
      angle: { min: 0, max: 360, random: true},
      speed: { min: 100, max: 250, random: true },
      frequency: 100,
      scale: { start: 1, end: 0.25, random: true },
      blendMode: 'NORMAL',
      active: true,
      frame: frames 
    });

    particles.startFollow(player);
  }
  
  function update() {
    const speed = 100; // Set the speed of the player
    const maxVelocity = 100; // Set the maximum velocity of the player
    const maxVelocityShift = maxVelocity * 2; // Set the maximum velocity of the player when shift is down
    const drag = 0.98; // Set the drag of the player (higher value means faster deceleration)
    
    // Calculate the player's velocity based on the pressed keys
    let velocityX = 0;
    let velocityY = 0;
    if (keyW.isDown) {
      velocityY = -speed;
    }
    if (keyS.isDown) {
      velocityY = speed;
    }
    if (keyA.isDown) {
      velocityX = -speed;
    }
    if (keyD.isDown) {
      velocityX = speed;
    }
  
    // Check if shift key is down and use the appropriate max velocity
    const currentMaxVelocity = keyShift.isDown ? maxVelocityShift : maxVelocity;
    
    // Normalize the velocity vector to ensure the player moves at a constant speed
    const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (velocityMagnitude > 0) {
      velocityX /= velocityMagnitude;
      velocityY /= velocityMagnitude;
    }
    
    // Set the player's velocity to the calculated value
    player.setVelocityX(velocityX * currentMaxVelocity);
    player.setVelocityY(velocityY * currentMaxVelocity);
    
    // Apply drag to the player
    player.setVelocityX(player.body.velocity.x * drag);
    player.setVelocityY(player.body.velocity.y * drag);
  
    // Limit the maximum velocity of the player
    const currentVelocity = player.body.velocity;
    const currentSpeed = currentVelocity.length();
    if (currentSpeed > currentMaxVelocity) {
      player.setVelocity(currentVelocity.scale(currentMaxVelocity / currentSpeed));
    }
  
    const emitterOffset = 80; // Adjust this value to control the emitter position relative to the player
    const emitterAngleOffset = 180; // Adjust this value to control the emitter angle offset relative to the player
  
    // Wrap the player when it goes off-screen  
    if (player.x > config.width) {
      player.x = 0;
    } else if (player.x < 0) {
      player.x = config.width;
    }
    
    if (player.y > config.height) {
      player.y = 0;
    } else if (player.y < 0) {
      player.y = config.height;
    }    

  // Check if player is close to back and display text
  const distanceToBackButton = Phaser.Math.Distance.Between(player.x, player.y, backButton.x, backButton.y);
  
  if (distanceToBackButton < 100) {
    backButtonText.setText("Press Space to go to Back Home!");
    backButtonText.setVisible(true);

    // Check if spacebar is down and redirect to bubble popper game if it is
    if (keySpace.isDown) {
      window.location.replace("../index.html");
    }
  } else {
    backButtonText.setVisible(false);
  }
  // Check if player is close to mrfrog and display "Mini-Game Available!" if the player is within 100 pixels of Mr. Frog
  const distanceToBack = Phaser.Math.Distance.Between(player.x, player.y, mrbunny.x, mrbunny.y);
  if (distanceToBack < 100) {
    newGameText.setText("Press Space to go to New Minigame!");
    newGameText.setVisible(true);

    // Check if spacebar is down and redirect to bubble popper game if it is
    if (keySpace.isDown) {
      window.location.replace("../index.html");
    }
  } else {
    newGameText.setVisible(false);
  }
}
    