var gameWidth = 1232;
var gameHeight = 925;

let player;
let playerMoving = false;
let goon;
let princess;
let ladybug1;
let ladybug2;
let scene1;
let scene2;
let path;
let currentWaypoint = 0;
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
  this.load.image('player', 'images/player.png');
  this.load.image('goon', 'images/goon.png');
  this.load.image('princess', 'images/princess.png'); 
  this.load.image('ladybug1', 'images/ladybug1.png'); 
  this.load.image('ladybug2', 'images/ladybug2.png'); 
  this.load.image('scene1', 'images/scene1.png'); 
  this.load.image('scene2', 'images/scene2.png');   
  this.load.image('unicorn', 'images/unicorn.png');
}

// Create game objects
function create() {
  scene = this; // Store the scene instance

  
  // add the gameboard paths
  var filename = 'assets/gameboard.csv';
  path = populatePathFromFile(filename);
  this.input.keyboard.on('keydown-SPACE', movePlayerToNextWaypoint);  // Listen for spacebar key press
  

  //********************************/
  // Add images to the scene
  
  
  // add the background image
  var image = this.add.image(gameWidth / 2, gameHeight / 2, 'background');

  // Add goon sprite
  goon = this.add.image(261, 412, 'goon');
  goon.setScale(0.25);
  goon.setOrigin(0.5, 1)
  goon.setInteractive(); // Enable input interaction on the goon
  goon.setVisible(true);
  goon.radius = 100;

  // Add goon sprite
  goon = this.add.image(709, 512, 'unicorn');
  goon.setScale(0.25);
  goon.setOrigin(0.5, 1)
  goon.setInteractive(); // Enable input interaction on the goon
  goon.setVisible(true);
  

  // Add princess sprite
  princess = this.add.image(520, 270, 'princess');
  princess.setScale(0.25);
  princess.setOrigin(0.5, 1)
  princess.setInteractive(); // Enable input interaction on the princess
  princess.setVisible(true);
  
  // Add ladybug1 sprite
  ladybug1 = this.add.image(1015, 448, 'ladybug1');
  ladybug1.setScale(0.25);
  ladybug1.setOrigin(0.5, 1)
  ladybug1.setInteractive(); // Enable input interaction on ladybug1
  ladybug1.setVisible(true);
  
  // Add ladybug2 sprite
  ladybug2 = this.add.image(1156, 444, 'ladybug2');
  ladybug2.setScale(0.25);
  ladybug2.setOrigin(0.5, 1)
  ladybug2.setInteractive(); // Enable input interaction on ladybug2
  ladybug2.setVisible(true);
  
  // Add scene1 sprite
  scene1 = this.add.image(100, 100, 'scene1');
  scene1.setScale(1);
  scene1.setOrigin(0,0);
  scene1.setInteractive(); 
  scene1.setVisible(false);
  
  // Add scene1 sprite
  scene2 = this.add.image(100, 100, 'scene2');
  scene2.setScale(1);
  scene2.setOrigin(0,0);
  scene2.setInteractive();
  scene2.setVisible(false);
  
  // Add player sprite
  player = this.add.image(path[0].x, path[0].y, 'player');
  player.setScale(0.20);
  player.setOrigin(0.5, 1)
  player.setInteractive(); // Enable input interaction on the player
  player.setVisible(true); 
  //  addBouncingTween(player); 
}


// Update game state
function update() {
  // Listen for mouse click on the game scene
  this.input.on('pointerdown', function (pointer) {
    var clickedX = Math.round(pointer.worldX);
    var clickedY = Math.round(pointer.worldY);

    // Log rounded coordinates to the console
    console.log('x: ' + clickedX + ', y: ' + clickedY);
  });

  

}

// Move player to the next waypoint
function movePlayerToNextWaypoint() {
  if (playerMoving) {
    // Player is already moving, ignore the request
    return;
  }

  console.log("Path length is " + path.length);
  playerMoving = true;

  currentWaypoint++;
  if (currentWaypoint >= path.length) {
    currentWaypoint = 0;
  }

  console.log('Moving to (' + path[currentWaypoint].x + ", " + path[currentWaypoint].y + ")" );

  var targetX = path[currentWaypoint].x;
  var targetY = path[currentWaypoint].y;

  var distance = Phaser.Math.Distance.Between(player.x, player.y, targetX, targetY);
  var velocity = 300; // Adjust the velocity as desired

  var duration = (distance / velocity) * 1000; // Calculate the duration based on velocity

  scene.tweens.add({
    targets: player,
    x: targetX,
    y: targetY,
    duration: duration,
    onComplete: function () {
      playerMoving = false;
      checkPlayerCloseToGoon();
    }
  });
}

function populatePathFromFile(filename) {
  // Load the CSV file (assuming it's in the same directory)
  var xhr = new XMLHttpRequest();
  xhr.open('GET', filename, false);
  xhr.send();

  // Parse the CSV data
  var lines = xhr.responseText.split('\n');
  var path = [];
  console.log("lines " + lines);
  // Extract the x, y, and category values from each line and create objects in the path array
  for (var i = 1; i < lines.length-1; i++) {
    var values = lines[i].split(',');

    var x = parseInt(values[0]);
    var y = parseFloat(values[1]);
    var category = values[2]; // Assuming category is in the third column

    path.push({ x: x, y: y, category: category });
  }
  console.log(path);
  return path;
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

// Function to check if the player comes close to the goon
function checkPlayerCloseToGoon() {
  if (Phaser.Geom.Circle.Contains(goon.zone, player.x, player.y)) {
    // Show scene1 if the player is close to the goon
    scene1.setVisible(true);
    // Add "Play" and "No Thanks" button
    let playButton = scene.add.text(gameWidth / 2, gameHeight / 2, 'Play', { fill: '#0f0' }).setInteractive();
    playButton.on('pointerdown', () => window.location.href = "../goonpopper/index.html"); // Redirect to goonpopper game

    let noThanksButton = scene.add.text(gameWidth / 2, gameHeight / 2 + 50, 'No Thanks', { fill: '#f00' }).setInteractive();
    noThanksButton.on('pointerdown', () => scene1.setVisible(false)); // Hide scene1 when "No Thanks" is clicked
  }
}