// Global variables
var uiWidth = 200;
var gameWidth = 1232;
var gameHeight = 928;
var game;
var timer;
var playButton;
var gameOverText;
var timerText; // Updated variable name
var myObjGroup;
var numObjectsAvailable = 5;
var objectsToFind = 5;
let numObjectsInGame = new Array(objectsToFind).fill(1);
var numBackgrounds = 4;
var numUIs = 3;
let score; 
let keySpace;
let startTime; // Store the initial time
let uiBar;


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

// Load assets
function preload() {
    for (let i = 1; i <= numObjectsAvailable; i++) {
      this.load.image(`myObject${i}`, `assets/images/objects/${i}.png`);
    }

    for (let i = 1; i <= numBackgrounds; i++) {
      this.load.image(`background${i}`, `assets/images/backgrounds/background${i}.png`);
    }    
    
    for (let i = 1; i <= numUIs; i++) {
      this.load.image(`ui${i}`, `assets/images/ui/ui${i}.png`);
    }        

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
  if (! gameOverText.visible ) { timerText.setText('Time: ' + formatTime(elapsedSeconds)); }
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
  uiBar = this.add.image(gameWidth, gameHeight / 2, `ui${randomUINum}`);
  
  // Define the desired target width and height in pixels
  var targetUIWidthInPixels = 200;
 
  // Calculate the scale factor based on the target size and the original size of the image
  var scaleByWidth = targetUIWidthInPixels / uiBar.width;
 
  // Choose the smaller scale factor to ensure the image fits within the target size
  var scaleFactor = Math.min(scaleByWidth);
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
  var checkGameOver = 0;
  
  this.input.on('pointerdown', function (pointer, gameObject) {
    myObjGroup.children.iterate(function (child, index) {
      if (child.getBounds().contains(pointer.x, pointer.y) && numObjectsInGame[index] === 1) {
        numObjectsInGame[index] = 0;
        objectsToFind --;
        child.setVisible(false);
        console.log('Still have ' + objectsToFind + ' objects to find');
      }
    });
  });
  
  if (objectsToFind == 0) {
    gameOverText.setVisible(true);
  }

  if (keySpace.isDown && objectsToFind == 0) {
    console.log('replacing window');
    window.location.replace('../index.html');
  }
}

// Initialize Phaser game instance
game = new Phaser.Game(config);
