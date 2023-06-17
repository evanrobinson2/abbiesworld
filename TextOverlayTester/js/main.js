import TextOverlayCoordinator from './TextOverlayCoordinator.js';

// Initialize TextOverlayCoordinator
let textOverlay;
let gameWidth = 1024;
let gameHeight = 1024;

// Configuration object for our Phaser game
let config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    scene: {
        key: 'bootScene',
        create: create,
        update: update
    }
};

// Create a new Phaser Game with our config
let game = new Phaser.Game(config);

// Make game globally accessible
window.game = game;

function create() {
    // Set the background color of the scene to black
    this.cameras.main.setBackgroundColor('#000000');

    // Create a new TextOverlayCoordinator instance
    this.textOverlay = new TextOverlayCoordinator(this);
}

function update(time, delta) {
    // Call the update function of TextOverlayCoordinator every frame
    this.textOverlay.update(time, delta);
}