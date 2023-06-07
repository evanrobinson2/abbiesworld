// Global variables
var uiWidth = 200;
var gameWidth = 1024;
var gameHeight = 1024;
var game;
var timer;
var playButton;
var gameOverText;
var timerText; // Updated variable name
var myObjGroup;
let objectsToFind;
var numBackgrounds = 4;
var numUIs = 3;
let score;
let keySpace;
let startTime; // Store the initial time
let uiBar;
let uiObjects;
let magnifier;
let hintScaleTween; // Tween object for hint scaling
let remaingCountText;
let foundImages = [] // store the found images generated here that are overlaid ontop of the menu bar's items once found


// Global variables
if (window.gameParams != null) {
  var numObjectsAvailable = window.gameParams.numObjectsToLoad;
  console.log(numObjectsAvailable);
  if (numObjectsAvailable < 15 || numObjectsAvailable > 75 || !numObjectsAvailable ) { numObjectsAvailable = 45; }
} else { numObjectsAvailable = 10; console.log('no params'); }

if (window.gameParams != null) {
  var numObjectsToFind = window.gameParams.numObjectsToFind;
  console.log(numObjectsToFind);
  if (numObjectsToFind < 5 || numObjectsToFind > 5 || !numObjectsToFind ) { numObjectsToFind = 5; }
} else { numObjectsToFind = 5; console.log('no params'); }

numObjectsToFind = 5;
numObjectsShown = 25;
numObjectsAvailable = 25;


// Configuration object
var config = {
  type: Phaser.AUTO,
  width: gameWidth + uiWidth,
  height: gameHeight,
  backgroundColor: '#f0f0f0',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// Initialize Phaser game instance
game = new Phaser.Game(config);
let scene;

// Load assets
function preload() {
  scene = this;
  for (let i = 0; i <= numObjectsAvailable; i++) {
    this.load.image(`myObject${i}`, `assets/images/objects/${i}.png`);
  }

  for (let i = 1; i <= numBackgrounds; i++) {
    this.load.image(`background${i}`, `assets/images/backgrounds/background${i}.png`);
  }

  for (let i = 1; i <= numUIs; i++) {
    this.load.image(`ui${i}`, `assets/images/ui/ui${i}.png`);
  }

  this.load.image('foundImage', `assets/images/ui/foundImage.png`);
  objectsToFind = generateRandomIndices(numObjectsAvailable, numObjectsToFind);
}

// Format time as seconds with milliseconds
function formatTime(seconds) {
  var min = Math.floor(seconds / 60);
  var sec = Math.floor(seconds % 60);
  var ms = Math.floor((seconds % 1) * 1000);
  return min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0') + '.' + ms.toString().padStart(3, '0');
}

// Update timer display
function updateTimer() {
  var elapsedSeconds = (Date.now() - startTime) / 1000; // Calculate the elapsed time in seconds
  if (!gameOverText.visible) {
    timerText.setText('Time: ' + formatTime(elapsedSeconds));
  }
}

// Initialize game objects
function create() {
  // Randomly select a background number between 1 and numBackgrounds
  const randomBackgroundNum = Phaser.Math.Between(1, numBackgrounds);
  startTime = Date.now();
  // Initialize timer
  timer = this.time.addEvent({
    delay: 1, // Increment every millisecond
    callback: updateTimer,
    callbackScope: this,
    loop: true
  });

  // Add the image based on the selected background number
  this.add.image(gameWidth / 2, gameHeight / 2, `background${randomBackgroundNum}`);

  // Add the image based on the selected UI number
  const randomUINum = Phaser.Math.Between(1, numUIs);
  uiBar = this.add.image(gameWidth + uiWidth / 2, gameHeight / 2, `ui${randomUINum}`);
  var targetUIWidth = 200; // Define the desired target width and height
  var scaleByWidth = targetUIWidth / uiBar.width; // Calculate the scale factor based on the target size and the original size of the image
  var scaleFactor = Math.min(scaleByWidth); // Choose the smaller scale factor to ensure the image fits within the target size
  console.log(scaleFactor);
  // Scale the image using the calculated scale factor
  uiBar.setScale(scaleFactor);

  keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Add group
  myObjGroup = this.physics.add.group();

  // Randomly position the objects around the room
  for (let i = 0; i < numObjectsAvailable; i++) {
    const randomX = Phaser.Math.Between(0, gameWidth);
    const randomY = Phaser.Math.Between(0, gameHeight);

    const object = myObjGroup.create(randomX, randomY, `myObject${i + 1}`);
    object.setBounce(Phaser.Math.FloatBetween(0.4, 0.8), Phaser.Math.FloatBetween(0.4, 0.8));
    object.body.collideWorldBounds = true;
    object.body.allowGravity = false;
    object.setScale(0.5);   
  }

  // Lay out the targeted objects within the UI bar
  let currentY = 220; // Starting Y position

  const self = this;

  for (let i = 0; i < numObjectsToFind; i++) {
    uiObjects = this.physics.add.group();
    const object = uiObjects.create(gameWidth + uiWidth / 2, currentY, `myObject${objectsToFind[i]}`);
    // console.log('Added ' + `myObject${objectsToFind[i]}`);
    object.body.allowGravity = false;
    object.setScale(calculateScaleFactor(object, 150));

    
  // Add click event listener to UI object
  object.setInteractive().on('pointerdown', function (pointer) {
    // Check if the corresponding  object in myObjGroup is visible
    const targetObject = myObjGroup.getChildren()[objectsToFind[i] - 1];
    if (targetObject && targetObject.visible) {
      // Execute hint scaling animation
      if (hintScaleTween && hintScaleTween.isPlaying()) {
        hintScaleTween.stop();
      }
      hintScaleTween = scene.tweens.add({
        targets: targetObject,
        scaleX: '+=0.5',
        scaleY: '+=0.5',
        ease: 'Linear',
        duration: 500,
        yoyo: true
      });
    }
  });

    // Update the currentY for the next iteration
    currentY += 150; // Set the desired vertical spacing between objects
  }

  // add remainingCountTxt
  remaingCountText = this.add.text(gameWidth, 80, '  LEFT: 5', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '33px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  });

  // Add magnifier text
  magnifier = this.add.text(gameWidth, 35, 'FIND THESE', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '33px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  });

  // Add timer text
  timerText = this.add.text(16, 16, 'Time: 0.000 s', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '36px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  });

  // Add score text
  gameOverText = this.add.text(gameWidth / 2, gameHeight / 2, 'GAME OVER!', {
    fontFamily: 'Arial, sans-serif',
    fontSize: '36px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  });
  gameOverText.setVisible(false);
  gameOverText.setOrigin(0.5);
}

// Update game state
function update() {
  updateTimer();

  // Flag variable to track if the code block should execute
  let isMouseDown = false;

  this.input.on('pointerdown', function (pointer, gameObject) {
    // Set the flag to true when the mouse button is pressed
    isMouseDown = true;
  });

  this.input.on('pointerup', function (pointer, gameObject) {
    // Set the flag to false when the mouse button is released
    isMouseDown = false;
  });

  myObjGroup.children.iterate(function (child, index) {
    child.setInteractive();

    // child.on('pointerdown', function (pointer) {
    //   if (objectsToFind.includes(index + 1) && !isMouseDown) {
    //     objectsToFind[objectsToFind.indexOf(index + 1)] = -1;
    //     numObjectsToFind--;
    //     child.setVisible(false);
    //     remaingCountText.setText(`LEFT: ` + numObjectsToFind ); 
    //   }
    // });

    child.on('pointerdown', function (pointer) {
      if (objectsToFind.includes(index + 1) && !isMouseDown) {
        objectsToFind[objectsToFind.indexOf(index + 1)] = -1;
        numObjectsToFind--;
    
        // Create a tween animation to shrink and spin the object
        scene.tweens.add({
          targets: child,
          scaleX: 0,
          scaleY: 0,
          rotation: 6.28, // 6.28 radians is equivalent to 360 degrees
          duration: 2500, // Duration of the animation in milliseconds
          ease: 'Power1',
          onComplete: function () {
            child.setVisible(false);
          }
        });
    
        remaingCountText.setText(`LEFT: ${numObjectsToFind}`);
        // Flash the entire gameboard
        const originalBackgroundColor = scene.cameras.main.backgroundColor;
        
        scene.cameras.main.flash(500, 255, 255, 255, 0.5, () => {
        // Reset the background color after the flash effect completes
        scene.cameras.main.setBackgroundColor(originalBackgroundColor);
 });

      }
    });



  });


  

  
  if (numObjectsToFind == 0) {
    gameOverText.setVisible(true);
  }

  if (keySpace.isDown && numObjectsToFind == 0) {
    console.log('replacing window');
    window.location.replace('../index.html');
  }
}



function generateRandomIndices(numObjectsAvailable, numObjectsToFind) {
  if (numObjectsToFind > numObjectsAvailable) {
    throw new Error('Number of objects to find cannot exceed the total number of available objects.');
  }

  const indices = new Set();

  while (indices.size < numObjectsToFind) {
    const randomIndex = 1 + Math.floor(Math.random() * numObjectsAvailable); // Add 1 to the random index
    indices.add(randomIndex);
  }

  return Array.from(indices);
}

function calculateScaleFactor(image, targetLongestSide) {
  const originalWidth = image.width;
  const originalHeight = image.height;

  let scaleFactor;

  if (originalWidth > originalHeight) {
    scaleFactor = targetLongestSide / originalWidth;
  } else {
    scaleFactor = targetLongestSide / originalHeight;
  }

  return scaleFactor;
}
