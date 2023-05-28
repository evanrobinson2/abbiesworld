var gameWidth = 1232;
var gameHeight = 923;
var player;
var playerSpeed = 300;

var goon1;
var goon1Velocity;
var goon2;
var prizePic;
var scene;
var cursors;
var lineGraphics;
var trailPoints = [];
var numSegments = 0;
var uiText;
var recentDirection = null;
var isPaused = false;
var background;
var prize;
var goonSpeed = 200; // Initial speed of the goons
var goonRotationSpeed = 0.1; // Rotation speed multiplier
var goonSpeedIncrease = 0.001; // Speed increase on bounce

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
            gravity: { y: 0 },
            debug: false // Set to true for debugging collision boundaries
        }
    }
};

var game = new Phaser.Game(config);

function preload() {
    // Preload assets here
    this.load.image('prize1', 'assets/images/prize1.png');
    this.load.image('prize2', 'assets/images/prize2.png');
    this.load.image('prize3', 'assets/images/prize3.png');
    this.load.image('prize4', 'assets/images/prize4.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('goon1', 'assets/images/goon1.png');
    this.load.image('goon2', 'assets/images/goon2.png');
    this.load.image('starfield', 'assets/images/starfield.png');
}

function create() {
    // Create game objects and initialize the game here
    scene = this;

    // Randomly select a prize image
    var prizeImages = ['prize1', 'prize2', 'prize3', 'prize4'];
    var randomPrizeImage = Phaser.Math.RND.pick(prizeImages);

    // Create background image
    background = scene.add.image(0, 0, 'starfield').setOrigin(0);
                     
    // Create prize image
    prize = scene.add.image(0, 0, randomPrizeImage).setOrigin(0);

    // Set depth for proper layering
    background.setDepth(0);
    prize.setDepth(1);

    // Register 'F' key input for changing the order of the images
    scene.input.keyboard.on('keydown-F', toggleImageOrder);    

    // Create a graphics object for drawing the trail line
    lineGraphics = scene.add.graphics();
    lineGraphics.setDepth(2);
    
    
    player = scene.physics.add.sprite(gameWidth / 2, 0, 'player');
    player.setScale(0.2);
    player.setDepth(2);
    player.setOrigin(0.5);
    
    goon1 = scene.physics.add.sprite(gameWidth / 2, 0, 'goon1');
    goon1.setScale(0.2);
    goon1.setVelocity(200, 150);
    goon1.setBounce(1);
    goon1.setCollideWorldBounds(true);
    goon1.setAngularVelocity(goon1.body.velocity.x * goonRotationSpeed);
    goon1.setDepth(2);

    goon2 = scene.physics.add.sprite(gameWidth / 2, 0, 'goon2');
    goon2.setScale(0.2);
    goon2.setVelocity(Phaser.Math.Between(-goonSpeed, goonSpeed), Phaser.Math.Between(-goonSpeed, goonSpeed));
    goon2.setBounce(1);
    goon2.setCollideWorldBounds(true);
    goon2.setAngularVelocity(goon2.body.velocity.x * goonRotationSpeed);
    goon2.setDepth(2);

    // Enable keyboard input
    cursors = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    // Set world bounds
    scene.physics.world.setBounds(0, 0, gameWidth, gameHeight); // Set custom world bounds

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

    // Handle player movement with extended bounds
    // player.setVelocity(0);

    var halfWidth = player.displayWidth / 2;
    var halfHeight = player.displayHeight / 2;

    // Handle player movement with extended bounds
    if (cursors.up.isDown && player.y > 0 + halfHeight) {
        player.setVelocityY(-1 * playerSpeed);
        player.setVelocityX(0);
    } else if (cursors.down.isDown && player.y < gameHeight - halfHeight) {
        player.setVelocityY(playerSpeed);
        player.setVelocityX(0);
    }

    console.log('(' + halfWidth + ',' + halfHeight + ')');

    if (player.x < -halfWidth) { player.x = 0; player.setVelocityX(0); }
    if (player.x > gameWidth+halfWidth) { player.x = gameWidth; player.setVelocityX(0); }
    if (player.y < -halfHeight) { player.y = 0; player.setVelocityY(0); }
    if (player.y > gameHeight) { player.y = gameHeight; player.setVelocityY(0); }

    if (cursors.left.isDown && player.x > 0 + halfWidth) {
        player.setVelocityX(-1 * playerSpeed);
        player.setVelocityY(0);
    } else if (cursors.right.isDown && player.x < gameWidth - halfWidth) {
        player.setVelocityX(playerSpeed);
        player.setVelocityY(0);
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

    // Update goons' rotation based on velocity
    goon1.setAngularVelocity(goon1.body.velocity.x * goonRotationSpeed);
    goon2.setAngularVelocity(goon2.body.velocity.x * goonRotationSpeed);
}

function writeUI() {
    // Update the UI text here
    uiText.setText('Number of Segments: ' + numSegments + '\r\nPaused: ' + isPaused);
    uiText.setDepth(3);
}

function togglePause() {
    isPaused = !isPaused;

    console.log('isPaused ' + isPaused);

    // TODO - store the player and goon's velocity, then set them to zero, restore them upon reload
    // Reset recent direction when resuming
    if (!isPaused) {
        recentDirection = null;
        pauseVelocity = player.velocity;
        player.rotation = 0;
        player.setVelocityX(0);
        player.setVelocityY(0);
    }
}

function toggleImageOrder() {
    // Get the current depths of the background and prize images
    var backgroundDepth = background.depth;
    var prizeDepth = prize.depth;

    // Set the background depth to the current prize depth
    background.setDepth(prizeDepth);

    // Set the prize depth to the current background depth
    prize.setDepth(backgroundDepth);
}