var gameWidth = 1024;
var gameHeight = 1024;


let puzzlePieces = [];
let previousPointer = null;
const puzzleOptions = ['puzzle1', 'puzzle2', 'puzzle3', 'puzzle4'];
let puzzle;
let randomPuzzle;
let scene;

// Game configuration
var config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// Create a new Phaser game instance
var game = new Phaser.Game(config);

// Preload assets
function preload() {
  this.load.image('background', 'images/Background.png');
}

// Create game objects
function create() {
  scene = this; // Store the scene instance  
  
  // Enable pixelArt mode for crisp visuals
  //this.cameras.main.setPixelArt(true);
  this.cameras.main.pixelArt = true;
  // add the background image
  background = this.add.image(gameWidth / 2, gameHeight / 2, 'background');


  randomPuzzle = Phaser.Utils.Array.GetRandom(puzzleOptions);

  // Load the selected puzzle image
  this.load.image(randomPuzzle, 'images/' + randomPuzzle + '.png');

  // Load the puzzle image as a texture atlas with frames
  scene.load.spritesheet('puzzle', 'images/' + randomPuzzle + '.png', {
    frameWidth: 256, // Width of each puzzle piece
    frameHeight: 256 // Height of each puzzle piece
  });
  
  // Event listener for image load complete
  scene.load.on('complete', onAssetsLoaded, this);

  // Start loading the assets
  scene.load.start();

  // Add spacebar input
  this.input.keyboard.on('keydown-SPACE', onSpacebarPressed, this);
}

// Triggered when all assets are loaded
function onAssetsLoaded() {
  puzzlePieces = sliceImageIntoPuzzlePieces(scene, 4, 4, 'puzzle', 1024, 1024);

  // Add event listeners to each puzzle piece sprite
  puzzlePieces.forEach((piece) => {
    piece.setInteractive();

    piece.on('pointerdown', (pointer, localX, localY, event) => onPiecePointerDown(pointer, localX, localY, event, piece));
  });
}

function sliceImageIntoPuzzlePieces(myScene, columns, rows, imageKey, imageWidth, imageHeight) {
  const pieceWidth = imageWidth / columns; // Width of each puzzle piece
  const pieceHeight = imageHeight / rows; // Height of each puzzle piece

  console.log('Slicing image into chunks of size: (' + pieceWidth + ", " + pieceHeight + ")");

  const puzzlePieces = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * pieceWidth; // Calculate x position
      const y = row * pieceHeight; // Calculate y position

      // Calculate the frame index based on the row and column
      const frameIndex = row * columns + col;

      // Create a puzzle piece sprite
      const piece = myScene.add.sprite(x, y, imageKey, frameIndex);
      piece.setVisible(false);      

      // Add the puzzle piece to the array
      puzzlePieces.push(piece);
    }
  }

  // Call any additional logic or functions related to the puzzle pieces

  // Return the puzzle pieces array
  return puzzlePieces;
}

// Update game state
function update() {
  const graphics = scene.add.graphics();

  // Draw the grid lines
  const gridSize = 256;
  const gridWidth = gameWidth;
  const gridHeight = gameHeight;

  graphics.lineStyle(1, 0x000000); // Black outline

  // Draw vertical grid lines
  for (let x = gridSize; x <= gridWidth; x += gridSize) {
    graphics.lineBetween(x, 0, x, gridHeight);
  }

  // Draw horizontal grid lines
  for (let y = gridSize; y <= gridHeight; y += gridSize) {
    graphics.lineBetween(0, y, gridWidth, y);
  }

  // Annotate the grid lines on the x axis
  const textStyle = { font: '22px Arial', fill: '#FFFFFF' }; // Font style
  for (let x = gridSize; x <= gridWidth; x += gridSize) {
    const label = x / gridSize;
    const text = scene.add.text(x - 13, 20, label.toString(), textStyle);
    text.setOrigin(0.5, 0); // Set text origin to top-center
  }

  // Annotate the grid lines on the y axis
  for (let y = gridSize; y <= gridHeight; y += gridSize) {
    const label = y / gridSize;
    const text = scene.add.text(10, y - 13, label.toString(), textStyle);
    text.setOrigin(0, 0.5); // Set text origin to middle-left
  }

  graphics.generateTexture('grid', gridWidth, gridHeight); // Generate a texture from the graphics object
  graphics.destroy(); // Destroy the graphics object

  // Use the generated grid texture as the background
  const background = scene.add.image(gameWidth / 2, gameHeight / 2, 'grid');
  background.setDepth(1);
}

// Function to handle spacebar press
function onSpacebarPressed() {
  // Hide all puzzle pieces
  puzzlePieces.forEach((piece) => {
    piece.setVisible(false);
  });

  // initiate a new game
  scrambleAndDisplayAllPieces(puzzlePieces);

}

function scrambleAndDisplayAllPieces(puzzlePieces) {
  const randomCoordinates = generateRandomCoordinates(puzzlePieces.length);

  puzzlePieces.forEach((piece, index) => {
    const randomCoordinate = randomCoordinates[index];
    const x = randomCoordinate.x;
    const y = randomCoordinate.y;

    piece.x = x;
    piece.y = y;
    piece.setVisible(true);
  });
}

function generateRandomCoordinates(numCoordinates) {
  const randomCoordinates = [];

  for (let i = 0; i < numCoordinates; i++) {
    const x = Phaser.Math.Between(0, gameWidth);
    const y = Phaser.Math.Between(0, gameHeight);

    randomCoordinates.push({ x, y });
  }

  return randomCoordinates;
}

function onPiecePointerDown(pointer, localX, localY, event, piece) {
  // Calculate the frame position within the overall image
  const frameIndex = piece.frame.name; // Assuming the frame name matches its index
  const frameWidth = piece.frame.width;
  const frameHeight = piece.frame.height;
  const spriteX = piece.x;
  const spriteY = piece.y;

  const frameX = spriteX + (frameIndex % 4) * frameWidth;
  const frameY = spriteY + Math.floor(frameIndex / 4) * frameHeight;

  // Store the initial position of the puzzle piece
  initialPiecePosition = { x: frameX, y: frameY };

  console.log("Piece (" + frameX + ',' + frameY + ')');

  // Bring the puzzle piece to the top of the display hierarchy
  piece.setDepth(1);

  // Calculate the offset between the puzzle piece's position and the mouse position
  pointerOffset = { x: localX - pointer.x, y: localY - pointer.y };

  console.log("Pointer (" + pointer.x + ',' + pointer.y + ')');

  // Register a pointermove event listener to track the movement of the mouse
  piece.on('pointermove', (pointer, event) => {
    onPiecePointerMove(pointer, piece);
  });

  // Register a pointerup event listener to handle when the mouse button is released
  piece.on('pointerup', (pointer, event) => {
    onPiecePointerUp(piece);
  });

  // Register a global pointerup event listener on the window object
  window.addEventListener('pointerup', onGlobalPointerUp);

}

const onPiecePointerUp = (piece) => {
  // Remove the pointermove event listener
  piece.off('pointermove');

  // Remove the pointerup event listener
  piece.off('pointerup');

  // Reset the depth of the puzzle piece to its default value
  // piece.depth = 0;

  previousPointer = null;

  // Calculate the distance between the current top-left position and the expected position
  const frameIndex = piece.frame.name;
  const frameWidth = piece.frame.width;
  const frameHeight = piece.frame.height;

  // const expectedX = Math.floor(frameIndex % 4) * frameWidth;
  // const expectedY = Math.floor(frameIndex / 4) * frameHeight;
  const expectedX = (Math.floor(frameIndex % 4) * frameWidth) + frameWidth / 2;
  const expectedY = (Math.floor(frameIndex / 4) * frameHeight) + frameHeight / 2;



  const distance = Phaser.Math.Distance.Between(piece.x, piece.y, expectedX, expectedY);

  // Define the maximum allowed distance for snapping
  const maxSnapDistance = 100; // Adjust this value as needed

  // Snap the piece into place if it's within the maximum distance
  if (distance <= maxSnapDistance) {
    piece.x = expectedX;
    piece.y = expectedY;

    // Disable further pointer events on the puzzle piece
    piece.disableInteractive();

    console.log("Locked in Place!");
      // Bring all unsnapped pieces to the foreground
    bringUnsnappedPiecesToFront();
  }
};

// Event handler for puzzle piece pointer move
const onPiecePointerMove = (pointer, piece) => {
  // Initialize previousPointer if it's the first iteration
  if (!previousPointer) {
    previousPointer = { x: pointer.x, y: pointer.y };
    return;
  }

  // Calculate the movement of the mouse since the previous frame
  const offsetX = pointer.x - previousPointer.x;
  const offsetY = pointer.y - previousPointer.y;

  // Calculate the new position of the puzzle piece based on the movement of the mouse
  const newX = piece.x + offsetX;
  const newY = piece.y + offsetY;

  // console.log("Piece: (" + piece.x + ", " + piece.y + ")");
  // console.log("previousPointer: (" + previousPointer.x + ", " + previousPointer.y + ")");

  // Update the position of the puzzle piece
  piece.x = newX;
  piece.y = newY;

  // Update the previous pointer position
  previousPointer.x = pointer.x;
  previousPointer.y = pointer.y;
};

// Event handler for global pointer up
function onGlobalPointerUp(event) {
  // Iterate over all puzzle pieces and trigger the pointerup event manually
  puzzlePieces.forEach((piece) => {
    piece.emit('pointerup', event);
  });

  // Remove the global pointerup event listener from the window object
  window.removeEventListener('pointerup', onGlobalPointerUp);
}

// Function to bring all unsnapped pieces to the foreground
function bringUnsnappedPiecesToFront() {
  puzzlePieces.forEach((piece) => {
    if (piece.input.enabled) {
      piece.depth = 1; // Bring unsnapped pieces to the foreground
    }
  });
}