// Global variables
var gameWidth = 1456;
var gameHeight = 816;
var game;
var timer;
var score = 0;
var scoreText;
var balloonGroup;

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
    this.load.image('background', 'assets/images/background.png');
    for (let i = 1; i <= 11; i++) {
      this.load.image(`balloon${i}`, `assets/images/balloon${i}.png`);
      // console.log(`Loading balloon${i} from assets/images/balloon${i}.png`);
    }
  }
  
// Initialize game objects
function create() {
  // Add background
  this.add.image(gameWidth / 2, gameHeight / 2, 'background');

  // Add balloon group
  balloonGroup = this.physics.add.group({
    key: 'balloon1',
    repeat: 10,
    setXY: { x: 0, y: gameHeight+1000, stepX: 150 }
  });

  // Set balloon physics properties
  balloonGroup.children.iterate(function (child, index) {
    // Set balloon sprite key dynamicallyg
    child.setTexture(`balloon${index + 1}`);
    // console.log(`balloon${index + 1}`);
    child.setBounce(Phaser.Math.FloatBetween(0.4, 0.8), Phaser.Math.FloatBetween(0.4, 0.8));
    child.body.collideWorldBounds = true;
    child.body.velocity.x = Phaser.Math.Between(-200, 200);
    child.body.velocity.y = Phaser.Math.Between(100, 300);
    child.body.allowGravity = false;
    child.setScale(0.50);
  });

  // Add score text
  scoreText = this.add.text(16, 16, 'Score: 0', { 
    fontFamily: 'Arial, sans-serif',
    fontSize: '36px',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  });
}


// Update game state
function update() {
  // Pop balloons on click
  this.input.on('pointerdown', function (pointer, gameObject) {
    balloonGroup.children.iterate(function (child) {
      if (child.getBounds().contains(pointer.x, pointer.y)) {
        child.setVelocity(0, -200);
        child.setAcceleration(0, 1000);
        score += 1;
        scoreText.setText('Score: ' + score);
        
      }
    });
  });
}

// Game over function
function gameOver() {
  balloonGroup.children.iterate(function (child) {
    child.body.allowGravity = true;
  });
  this.input.off('pointerdown');
  this.scene.start('GameOver', { score: score });
}

// Initialize Phaser game instance
game = new Phaser.Game(config);
