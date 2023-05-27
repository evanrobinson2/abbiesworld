var gameWidth = 800;
var gameHeight = 600;
var player;
var scene;
var cursors;
var lineGraphics;
var trailPoints = [];
var numSegments = 0;
var uiText;
var recentDirection = null;
var isPaused = false;

var config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 } // Set gravity to zero
        }
    }
};

var game = new Phaser.Game(config);

function preload() {
    // Preload assets here
    this.load.image('player', 'assets/images/player.png');
    this.load.image('starfield', 'assets/images/starfield.png');
}

function create() {
    // Create game objects and initialize the game here
    scene = this;
    scene.add.image(0, 0, 'starfield').setOrigin(0);

    // Create a graphics object for drawing the trail line
    lineGraphics = scene.add.graphics();

    player = scene.physics.add.sprite(gameWidth / 2, 0, 'player');
    player.setScale(0.5);

    // Enable keyboard input
    cursors = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Set world bounds
    scene.physics.world.setBoundsCollision(true, true, true, true);

    // Create UI text
    uiText = scene.add.text(10, 10, '', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        wordWrap: { width: gameWidth - 20 }
    });

    console.log(player.rotation);

    // Register spacebar input for pausing/resuming the game
    scene.input.keyboard.on('keydown-SPACE', togglePause);
}


function update() {
    // Update game logic here
    // Update UI text
    writeUI();

    if (isPaused) {
        // Stop player rotation when the game is paused
        // Handle player movement
        player.setVelocity(0);
        return;
    }

    // Rotate player at 0.5 cycles/sec
    var rotationSpeed = 0.5 * Math.PI; // Convert cycles/sec to radians/sec
    player.rotation += rotationSpeed * scene.sys.game.loop.delta / 1000; // Divide by 1000 to convert to seconds

    if (cursors.up.isDown) {
        recentDirection = 'up';
    } else if (cursors.down.isDown) {
        recentDirection = 'down';
    } else if (cursors.left.isDown) {
        recentDirection = 'left';
    } else if (cursors.right.isDown) {
        recentDirection = 'right';
    }

    if (recentDirection === 'up' && player.y > 0) {
        player.setVelocityY(-100);
        player.setVelocityX(0);
    } else if (recentDirection === 'down' && player.y < gameHeight) {
        player.setVelocityY(100);
        player.setVelocityX(0);
    }

    if (recentDirection === 'left' && player.x > 0) {
        player.setVelocityX(-100);
        player.setVelocityY(0);
        player.setFlipX(false); // Prevent flipping
    } else if (recentDirection === 'right' && player.x < gameWidth) {
        player.setVelocityX(100);
        player.setVelocityY(0);
        player.setFlipX(false); // Prevent flipping
    }

    // Check if a new segment is added
    var currentSegment = { x: player.x, y: player.y };
    var lastSegment = trailPoints[trailPoints.length - 1];

    if (!lastSegment || currentSegment.x !== lastSegment.x || currentSegment.y !== lastSegment.y) {
        trailPoints.push(currentSegment);
        numSegments = trailPoints.length - 1;
    }

    // Clear the previous trail line
    lineGraphics.clear();

    // Draw the trail line
    lineGraphics.lineStyle(2, 0xffffff);
    for (var i = 0; i < trailPoints.length - 1; i++) {
        var p1 = trailPoints[i];
        var p2 = trailPoints[i + 1];
        lineGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
    }


}

function writeUI() {
    // Update the UI text here
    uiText.setText('Number of Segments: ' + numSegments + '\r\nPaused: ' + isPaused);
}

function togglePause() {
    isPaused = !isPaused;

    console.log('isPaused ' + isPaused);

    // Reset recent direction when resuming
    if (!isPaused) {
        recentDirection = null;
        pauseVelocity = player.velocity;
        player.rotation = 0;
        player.setVelocityX(0);
        player.setVelocityY(0);
    }
}
