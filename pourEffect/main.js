var gameWidth = 1024;
var gameHeight = 1024;

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

function preload() {
  // Preload your assets here
  this.load.image('board', 'images/board.png');
}

function create() {
  // Create your game logic and scene here
  // Create the sub-image group
  subImageGroup = this.add.group();
  
  console.log(subImageGroup);

  // Add the background image
  backgroundImage = this.add.image(gameWidth/2, gameHeight/2, 'board');

  // Add keyboard input for spacebar
  spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Create Graphics object for the grid lines
  gridGraphics = this.add.graphics();

  // Hide the grid initially
  gridGraphics.visible = false;
  backgroundImage.setVisible(true);
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


