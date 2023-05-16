// Global variables
var gameWidth = 1232;
var gameHeight = 928;
var game;
var timer;
var gameOverText;
var timerText; // Updated variable name
var goonGroup;
var goonPopCount = 0;
var numgoons = 13;
var numBackgrounds = 3;
let goonsMoving = new Array(numgoons).fill(1);
let score; 
let keySpace;
let startTime; // Store the initial time

// Configuration object
var config = {
  type: Phaser.AUTO,
  width: gameWidth,
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
    for (let i = 1; i <= numgoons; i++) {
      this.load.image(`goon${i}`, `assets/images/goon${i}.png`);
    }

    for (let i = 1; i <= numBackgrounds; i++) {
      this.load.image(`background${i}`, `assets/images/b${i}.png`);
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
  
  keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // Add goon group
  goonGroup = this.physics.add.group({
    key: 'goon1',
    repeat: numgoons-1,
    setXY: { x: 0, y: gameHeight+1000, stepX: 150 }
  });

  // Set goon physics properties
  goonGroup.children.iterate(function (child, index) {
    // Set goon sprite key dynamically
    child.setTexture(`goon${index + 1}`);
    console.log(`goon${index + 1}`);
    child.setBounce(Phaser.Math.FloatBetween(0.4, 0.8), Phaser.Math.FloatBetween(0.4, 0.8));
    child.body.collideWorldBounds = true;
    child.body.velocity.x = Phaser.Math.Between(-200, 200);
    child.body.velocity.y = Phaser.Math.Between(100, 300);
    child.body.allowGravity = false;
    child.setScale(0.50);

    // Randomly set spin direction
    var spinDirection = Phaser.Math.RND.sign();
    child.body.angularVelocity = Phaser.Math.Between(100, 300) * spinDirection;
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
  gameOverText = this.add.text(gameWidth/2, gameHeight/2, 'GAME OVER!', { 
    fontFamily: 'Arial, sans-serif',
    fontSize: '36px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  });
  gameOverText.setVisible(false);
  gameOverText.setOrigin(0.5);
  console.log(gameWidth/2 + ", " + gameHeight/2);

}

// Update game state
function update() {
  // Pop goons on click
  updateTimer();
  var checkGameOver = 0;
  this.input.on('pointerdown', function (pointer, gameObject) {
    // Shake the camera for 500 milliseconds with an intensity of 0.05
    this.cameras.main.shake(100, 0.001);
    goonGroup.children.iterate(function (child, index) {
      if (child.getBounds().contains(pointer.x, pointer.y)) {
        child.setVelocity(0, -200);
        child.setAcceleration(0, 1000);
        goonsMoving[index] = 0;
        child.body.angularVelocity = 0;
      }
    });
  });
  
  if (goonsMoving.every(num => num === 0)) {
    gameOverText.setVisible(true);    
  }
  // Check if spacebar is down and redirect to bubble popper game if it is
  if (keySpace.isDown && goonsMoving.every(num => num === 0)) {
      console.log('replacing window');
      window.location.replace("../index.html");
  }
}

// Initialize Phaser game instance
game = new Phaser.Game(config);
