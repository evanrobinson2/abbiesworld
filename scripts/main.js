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
let mrfrog;
const MAX_SPEED = 1000;  
let cursors;
let keyA;
let keyD;
let keyS;
let keyW;
let cloudGroup;
let particles;

const spriteWidth = 1024/9;
const spriteHeight = 1024/8;
const numFrames = 9*8;
const numColumns = 9;




function preload() {
  this.load.image('worldmap', 'assets/images/abbiesworld.png');
  this.load.image('player', 'assets/images/abbie.png');
  this.load.image('mrfrog', 'assets/images/mrfrog.png');
  this.load.image('cloud1', 'assets/images/cloud1.png');
  this.load.image('cloud2', 'assets/images/cloud2.png');
  this.load.image('cloud3', 'assets/images/cloud3.png');
  this.load.image('cloud4', 'assets/images/cloud4.png');

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

  player = this.physics.add.sprite(900 , 900, 'player');
  player.setScale(0.35);
  player.setDepth(1);
  player.setAngle(0); // Set initial rotation to -30 degrees (clockwise)

  mrfrog = this.physics.add.sprite(1000 , 200, 'mrfrog');
  mrfrog.setScale(0.10);
  mrfrog.setDepth(1);
  mrfrog.setAngle(0); // Set initial rotation to -30 degrees (clockwise)


  cursors = this.input.keyboard.createCursorKeys();
  keyA = this.input.keyboard.addKey('A');
  keyD = this.input.keyboard.addKey('D');
  keyS = this.input.keyboard.addKey('S');
  keyW = this.input.keyboard.addKey('W');
  
  const cloudImages = ['cloud1', 'cloud2', 'cloud3', 'cloud4']; // Replace with your cloud image names
  const totalClouds = 8; // Adjust the number of clouds as desired

  cloudGroup = createFloatingClouds(this, cloudImages, totalClouds);

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
  console.log(particles.type);
}

function update() {
  const speed = 100; // Set the speed of the player
  const maxVelocity = 100; // Set the maximum velocity of the player
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
  
  // Normalize the velocity vector to ensure the player moves at a constant speed
  const velocityMagnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
  if (velocityMagnitude > 0) {
    velocityX /= velocityMagnitude;
    velocityY /= velocityMagnitude;
  }
  
  // Set the player's velocity to the calculated value
  player.setVelocityX(velocityX * maxVelocity);
  player.setVelocityY(velocityY * maxVelocity);
  
  // Limit the maximum velocity of the player
  const currentVelocity = player.body.velocity;
  const currentSpeed = currentVelocity.length();
  if (currentSpeed > maxVelocity) {
    player.setVelocity(currentVelocity.scale(maxVelocity / currentSpeed));
  }
  
  // Apply drag to the player
  player.setVelocityX(player.body.velocity.x * drag);
  player.setVelocityY(player.body.velocity.y * drag);

  const emitterOffset = 80; // Adjust this value to control the emitter position relative to the player
  const emitterAngleOffset = 180; // Adjust this value to control the emitter angle offset relative to the player

  // Iterate through each cloud in the cloud group
  cloudGroup.getChildren().forEach(cloud => {
  // Apply gentle horizontal movement
  cloud.x += Math.sin(cloud.y / 100) * 0.5; // Adjust the 0.5 value to control the horizontal movement speed

  // Wrap the clouds when they go off-screen
  if (cloud.x > config.width + cloud.displayWidth) {
    cloud.x = -cloud.displayWidth;
  } else if (cloud.x < -cloud.displayWidth) {
    cloud.x = config.width + cloud.displayWidth;
  }
});

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

}


export function createFloatingClouds(scene, cloudImages, totalClouds) {
  const cloudGroup = scene.physics.add.group(); // Create a group to hold the clouds

  // Generate the specified number of clouds
  for (let i = 0; i < totalClouds; i++) {
    const cloudImage = Phaser.Utils.Array.GetRandom(cloudImages); // Get a random cloud image
    const x = Phaser.Math.Between(0, scene.sys.game.config.width); // Random X position
    const y = Phaser.Math.Between(0, scene.sys.game.config.height); // Random Y position
    const scale = Phaser.Math.FloatBetween(0.5, 1.5); // Random scale factor (between 0.5 and 1.5)
    const alpha = Phaser.Math.FloatBetween(0.1, 0.6); // Random transparency (between 0.2 and 0.8)

    const cloud = scene.add.image(x, y, cloudImage)
      .setScale(scale)
      .setAlpha(alpha)
      .setDepth(4); // Set the cloud's depth (above the background image)

    // Add the cloud to the physics group
    cloudGroup.add(cloud);
  }

  return cloudGroup; // Return the cloud group for further manipulation if needed
}
