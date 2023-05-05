import { updateShipVelocity, updateShipRotation, updateShipScale } from './helpers.js';

const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
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
let ship;
let cursors;
let keyA;
let keyD;
let keyS;
let keyW;
let keySpace;
let keyQ;
let keyE;
let keyDown;
let keyUp;
let cloudGroup;
let particles;

const spriteWidth = 146;
const spriteHeight = 146;
const numFrames = 49;
const numColumns = 7;




function preload() {
  this.load.image('worldmap', 'assets/images/1.png');
  this.load.image('ship', 'assets/images/ship.png');
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
  const worldMap = this.add.image(config.width / 2, config.height / 2, 'worldmap')
    .setOrigin(0.5)
    .setDepth(0);

  ship = this.physics.add.sprite(900, 500, 'ship');
  ship.setScale(0.35);
  ship.setDepth(1);

  cursors = this.input.keyboard.createCursorKeys();
  keyA = this.input.keyboard.addKey('A');
  keyD = this.input.keyboard.addKey('D');
  keyS = this.input.keyboard.addKey('S');
  keyW = this.input.keyboard.addKey('W');
  keySpace = this.input.keyboard.addKey('SPACE');
  keyQ = this.input.keyboard.addKey('Q');
  keyE = this.input.keyboard.addKey('E');
  keyDown = this.input.keyboard.addKey('DOWN');
  keyUp = this.input.keyboard.addKey('UP');

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
  console.log(sprites);
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
  
  particles = this.add.particles(80, -40, 'exhaust', {
    angle: { min: -30, max: 30, random: true},
    speed: { min: 100, max: 250, random: true },
    frequency: 100,
    scale: { start: 0.5, end: 0, random: true },
    blendMode: 'NORMAL',
    active: true,
    frame: frames 
  });
  

  particles.startFollow(ship);

  // // Add the debug text overlay
  // const debugText = this.add.text(10, 10, '', { fontFamily: 'Arial', fontSize: 16, color: '#ffffff' });
  // debugText.setScrollFactor(0); // Set the text to stay in place while scrolling
  
  // // Update the debug text every frame
  // this.events.on('postupdate', () => {
  //   if (particles.emitter) {
  //     debugText.setText(`Ship Position: ${ship.x.toFixed(2)}, ${ship.y.toFixed(2)}\nShip Angle: ${ship.rotation.toFixed(2)}\nParticle Position: ${particles.emitter.x.toFixed(2)}, ${particles.emitter.y.toFixed(2)}\nParticle Angle: ${particles.emitter.angle.toFixed(2)}`);
  //   }
  // });

}

function update() {
  updateShipVelocity(ship, keyA, keyD, keyS, keyW, keySpace);
  updateShipRotation(ship, keyQ, keyE);
  updateShipScale(ship, keyDown, keyUp);

  // const emitterOffset = 80; // Adjust this value to control the emitter position relative to the ship
  const emitterAngleOffset = 180; // Adjust this value to control the emitter angle offset relative to the ship

  // // Update the emitter position and angle based on the ship's position and rotation
  // particles.setPosition(ship.x + emitterOffset * Math.cos(ship.rotation), ship.y + emitterOffset * Math.sin(ship.rotation));
  // particles.setAngle(ship.rotation * Phaser.Math.RAD_TO_DEG + emitterAngleOffset);

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
}


export function createFloatingClouds(scene, cloudImages, totalClouds) {
  const cloudGroup = scene.physics.add.group(); // Create a group to hold the clouds

  // Generate the specified number of clouds
  for (let i = 0; i < totalClouds; i++) {
    const cloudImage = Phaser.Utils.Array.GetRandom(cloudImages); // Get a random cloud image
    const x = Phaser.Math.Between(0, scene.sys.game.config.width); // Random X position
    const y = Phaser.Math.Between(0, scene.sys.game.config.height); // Random Y position
    const scale = Phaser.Math.FloatBetween(0.5, 1.5); // Random scale factor (between 0.5 and 1.5)
    const alpha = Phaser.Math.FloatBetween(0.2, 0.8); // Random transparency (between 0.2 and 0.8)

    const cloud = scene.add.image(x, y, cloudImage)
      .setScale(scale)
      .setAlpha(alpha)
      .setDepth(4); // Set the cloud's depth (above the background image)

    // Add the cloud to the physics group
    cloudGroup.add(cloud);
  }

  return cloudGroup; // Return the cloud group for further manipulation if needed
}
