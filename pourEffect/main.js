var gameWidth = 1024;
var gameHeight = 1024;

const chunkWidth = 102.4;
const chunkHeight = 102.4;

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let spacebar;
let gridGraphics;
let showGrid = false;
let backgroundImage;
let currentImage;
let subImageGroup;

function preload() {
  // Preload your assets here
  this.load.image('board', 'images/board.png');
}

function create() {
  // Create your game logic and scene here
  // Create the sub-image group
  subImageGroup = this.add.group();
  
  // Split the image into chunks and store the sub-images in the group
  splitImageIntoChunks.call(this, 'board', chunkWidth, chunkHeight, subImageGroup);

  this.add.image(gameWidth/2, gameHeight/2, 'board');
  console.log(subImageGroup);

  // Add the background image
  backgroundImage = 

  // Add keyboard input for spacebar
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Create Graphics object for the grid lines
  gridGraphics = this.add.graphics();

  // Hide the grid initially
  gridGraphics.visible = false;
  backgroundImage.setVisible(false);
}

function update() {
  // Check if spacebar is pressed
  if (Phaser.Input.Keyboard.JustDown(spacebar)) {
    // Toggle the grid visibility
    showGrid = !showGrid;
    gridGraphics.visible = showGrid;

    // Load a random image chunk into the center of the screen
    const randomIndex = Phaser.Math.Between(0, subImageGroup.getChildren().length - 1);
    const randomChunk = subImageGroup.getChildren()[randomIndex];
    randomChunk.setVisible(true);
    randomChunk.setPosition(gameWidth/2,gameHeight/2);
    currentImage = randomChunk;
    // backgroundImage.setVisible(false);
  }

  // Update the grid if it's visible
  if (showGrid) {
    drawGrid();
    
    gridGraphics.setDepth(0); // Bring gridGraphics to the front
    gridGraphics.strokePath(); // Draw the grid lines
  }
}


function drawGrid() {
  // Clear the previous grid lines
  gridGraphics.clear();

  // Set line style for the grid
  gridGraphics.lineStyle(2, 0xFFFFFF, 0.5); // line thickness, color, and alpha

  // Draw vertical lines
  for (let x = chunkWidth; x < gameWidth; x += chunkWidth) {
    gridGraphics.moveTo(x, 0);
    gridGraphics.lineTo(x, gameHeight);
  }

  // Draw horizontal lines
  for (let y = chunkHeight; y < gameHeight; y += chunkHeight) {
    gridGraphics.moveTo(0, y);
    gridGraphics.lineTo(gameWidth, y);
  }
}

function splitImageIntoChunks(key, chunkWidth, chunkHeight, group) {
  const texture = this.textures.get(key);
  const imageWidth = texture.source[0].width;
  const imageHeight = texture.source[0].height;

  const numChunksX = Math.ceil(imageWidth / chunkWidth);
  const numChunksY = Math.ceil(imageHeight / chunkHeight);

  const offsetX = -(gameWidth / 2) + (chunkWidth / 2);
  const offsetY = -(gameHeight / 2) + (chunkHeight / 2);

  for (let y = 0; y < numChunksY; y++) {
    for (let x = 0; x < numChunksX; x++) {
      const chunkX = x * chunkWidth;
      const chunkY = y * chunkHeight;
      const frame = texture.add(chunkX, chunkY, chunkWidth, chunkHeight);
      const subImage = this.add.image(offsetX + chunkX, offsetY + chunkY, key, frame);
      group.add(subImage);
    }
  }

  group.setOrigin(0.5);
  group.setVisible(false);
}

