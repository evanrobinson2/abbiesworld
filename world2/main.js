var gameWidth = 1232;
var gameHeight = 925;

let player;
let goon;
let princess;
let ladybug1;
let ladybug2;
let scene1;
let scene2;
let path;
let currentWaypoint = 0;
let scene;
let restingTween;

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
  this.load.image('background', 'images/background.png');
  this.load.image('player', 'images/player.png');
  this.load.image('goon', 'images/goon.png');
  this.load.image('princess', 'images/princess.png'); 
  this.load.image('ladybug1', 'images/ladybug1.png'); 
  this.load.image('ladybug2', 'images/ladybug2.png'); 
  this.load.image('scene1', 'images/scene1.png'); 
  this.load.image('scene2', 'images/scene2.png'); 
  
}

// Create game objects
function create() {
  scene = this; // Store the scene instance

  // add the background image
  var image = this.add.image(gameWidth / 2, gameHeight / 2, 'background');
  
  // add the gameboard paths
  var filename = 'assets/gameboard.csv';
  path = populatePathFromFile(filename);
  console.log(path);

  // Add player sprite
  player = this.add.image(path[0].x, path[0].y, 'player');
  player.setScale(0.10);
  player.setOrigin(0.5, 1)
  player.setInteractive(); // Enable input interaction on the player
  addBouncingTween(player);

  // Listen for spacebar key press
  this.input.keyboard.on('keydown-SPACE', resumeMovement);

  // Listen for player click
  player.on('pointerdown', resumeMovement);

  // Add goon sprite
  goon = this.add.image(215, 430, 'goon');
  goon.setScale(0.10);
  goon.setOrigin(0.5, 1)
  goon.setInteractive(); // Enable input interaction on the goon
  addBouncingTween(goon);

  // Add princess sprite
  princess = this.add.image(520, 270, 'princess');
  princess.setScale(0.15);
  princess.setOrigin(0.5, 1)
  princess.setInteractive(); // Enable input interaction on the princess
  addBouncingTween(princess);

  // Add ladybug1 sprite
  ladybug1 = this.add.image(1015, 448, 'ladybug1');
  ladybug1.setScale(0.10);
  ladybug1.setOrigin(0.5, 1)
  ladybug1.setInteractive(); // Enable input interaction on ladybug1
  addBouncingTween(ladybug1);

  // Add ladybug2 sprite
  ladybug2 = this.add.image(1156, 444, 'ladybug2');
  ladybug2.setScale(0.12);
  ladybug2.setOrigin(0.5, 1)
  ladybug2.setInteractive(); // Enable input interaction on ladybug2
  addBouncingTween(ladybug2);

  // Add scene1 sprite
  scene1 = this.add.image(100, 100, 'scene1');
  scene1.setScale(1);
  scene1.setOrigin(0,0);
  scene1.setInteractive(); 
  scene1.setVisible(FALSE);

  // Add scene1 sprite
  scene2 = this.add.image(100, 100, 'scene2');
  scene2.setScale(1);
  scene2.setOrigin(0,0);
  scene2.setInteractive();
  scene2.setVisible(false);
  
}

// Function to add bouncing tween effect
function addBouncingTween(sprite) {
  scene.tweens.add({
    targets: sprite,
    y: '-=10',
    duration: 1000,
    ease: 'Cubic.easeInOut',
    yoyo: true,
    repeat: -1,
    yoyoDelay: 50,
    yoyoEase: 'Bounce.easeInOut',
    hold: 1
  });
}

// Update game state
function update() {
  // Calculate the distance between the player and the current waypoint
  var distance = Phaser.Math.Distance.Between(player.x, player.y, path[currentWaypoint].x, path[currentWaypoint].y);

  // Check if the player has reached the current waypoint
  if (distance < 0.05) {
    // Check if the player is resting at the waypoint
    if (restingTween) {
      // Check if the spacebar is pressed or if the player is clicked
      if (Phaser.Input.Keyboard.JustDown(scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)) || scene.input.activePointer.isDown) {
        resumeMovement();
      }
    } else {
      console.log('Resting');
      startResting();
    }
  }

  // Listen for mouse click on the game scene
  this.input.on('pointerdown', function (pointer) {
      var clickedX = pointer.worldX;
      var clickedY = pointer.worldY;

      // Log pixel coordinates to the console
      console.log('x: ' + clickedX + ', y: ' + clickedY);
    });
}

// Move player to the next waypoint
function movePlayerToNextWaypoint() {
  currentWaypoint++;
  if (currentWaypoint >= path.length) {
    currentWaypoint = 0;
  }
  
  console.log('Moving from (' + player.x + "," + player.y + ")");
  console.log('Moving to   (' +  path[currentWaypoint].x + "," +path[currentWaypoint].y + ")");
  
  // Move player to the next waypoint using a tween
  scene.tweens.add({
    targets: player,
    x: path[currentWaypoint].x,
    y: path[currentWaypoint].y,
    duration: 1000,
    onComplete: startResting,
  });
}

// Start resting at the waypoint
function startResting() {
  // Apply bouncing tween effect to the player image
  console.log('Arrived at (' + player.x + ',' + player.y +')');
  restingTween = scene.tweens.add({
    targets: player,
    y: '-=10',
    scale: '+=0.05',
    duration: 750,
    ease: 'Cubic.easeInOut',
    yoyo: true,
    repeat: -1,
    yoyoDelay: 10,
    yoyoEase: 'Sinusoidal.Out',
    hold: 1
  });
}

// Resume movement from the resting state
function resumeMovement() {
  console.log('Resuming Movement');
  // Check if there is a restingTween and it is active
  if (restingTween) {
    restingTween.stop(true, false);
    removeRestingTweenAndResumeMovement();
  }
}

// Function to remove the resting tween and resume movement
function removeRestingTweenAndResumeMovement() {
  // Remove the resting tween
  scene.tweens.remove(restingTween);
  restingTween = null;

  // Resume the movement tween
  scene.tweens.resumeAll();

  // Move player to the next waypoint
  movePlayerToNextWaypoint();
}

function populatePathFromFile(filename) {
    // Load the CSV file (assuming it's in the same directory)
    var xhr = new XMLHttpRequest();
    xhr.open('GET', filename, false);
    xhr.send();
  
    // Parse the CSV data
    var lines = xhr.responseText.split('\n');
    var path = [];
  
    // Extract the x and y values from each line and create objects in the path array
    for (var i = 1; i < lines.length-1; i++) {
      var values = lines[i].split(',');
  
      var x = parseInt(values[0]);
      var y = parseFloat(values[1]);
  
      console.log("x="+x+",y="+y);
      path.push({ x: x, y: y });
    }
  
    return path;
  }
  