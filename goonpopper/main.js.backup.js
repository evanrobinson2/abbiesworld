// Global variables
var gameWidth = 1456;
var gameHeight = 816;
var game;
var timer;
var score = 0;
var gameOverText;
var scoreText;
var goonGroup;
var goonPopCount = 0;
var numgoons = 10;
var numBackgrounds = 8;
let goonsMoving = new Array(numgoons).fill(1);

let keySpace;

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
  
// Initialize game objects
function create() {
  // Add background
  // Randomly select a background number between 1 and numBackgrounds
  const randomBackgroundNum = Phaser.Math.Between(1, numBackgrounds);

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
    // Set goon sprite key dynamicallyg
    child.setTexture(`goon${index + 1}`);
    console.log(`goon${index + 1}`);
    child.setBounce(Phaser.Math.FloatBetween(0.4, 0.8), Phaser.Math.FloatBetween(0.4, 0.8));
    child.body.collideWorldBounds = true;
    child.body.velocity.x = Phaser.Math.Between(-200, 200);
    child.body.velocity.y = Phaser.Math.Between(100, 300);
    child.body.allowGravity = false;
    child.setScale(0.50);
  });

  //console.log(goonGroup.countActive(true));
 // Check if all goons are not moving
  if (goonGroup.countActive(true) === 0 && score > 0) {
    console.log('All goons have stopped moving!');
    gameOverText = this.add.text(gameWidth / 2, gameHeight / 2, 'Escape to go back', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    });
    me
    this.input.keyboard.on('keydown-ESC', function () {
    window.location.href = 'index.html';
    });
  }

  // Add score text
  scoreText = this.add.text(16, 16, 'Score: 0', { 
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

}


// Update game state
function update() {
  // Pop goons on click
  var checkGameOver = 0;
  this.input.on('pointerdown', function (pointer, gameObject) {
    goonGroup.children.iterate(function (child, index) {
      if (child.getBounds().contains(pointer.x, pointer.y)) {
        child.setVelocity(0, -200);
        child.setAcceleration(0, 1000);
        score += 1;
        scoreText.setText('Score: ' + score);
        console.log("goonPopCount: " + goonPopCount );
        goonsMoving[index] = 0;
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

// Game over function
function gameOver() {
  goonGroup.children.iterate(function (child) {
    child.body.allowGravity = true;
  });
  this.input.off('pointerdown');
  this.scene.start('GameOver', { score: score });
}

// Initialize Phaser game instance
game = new Phaser.Game(config);
