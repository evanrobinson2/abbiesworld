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

function preload() {
  this.load.image('worldmap', 'assets/images/1.png');
  this.load.image('ship', 'assets/images/ship.png');
}

function create() {
  const worldMap = this.add.image(config.width / 2, config.height / 2, 'worldmap')
    .setOrigin(0.5)
    .setDepth(0);

  ship = this.physics.add.sprite(900, 500, 'ship');
  ship.setScale(0.35);

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
}

function update() {
  updateShipVelocity(ship, keyA, keyD, keyW, keyS, keySpace);
  updateShipRotation(ship, keyQ, keyE);
  updateShipScale(ship, keyDown, keyUp);
}