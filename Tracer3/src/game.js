/* global Phaser */
import { isPointOnPerimeter, 
         reducePoints, 
         clearPolygon, 
         isPointOnPolygonEdge, 
         getClosestPointOnPerimeter} from './utilities.js';
import {getRightHandPath, getLeftHandPath} from './tracerGameLibrary.js';
let trailColor = 0xFFFFFF;
let originalColor = 0xFFFFFF;
let debug = true;
let gameWidth = 1024;
let gameHeight = 1024;
let totalCapturedPercentArea = 0;
let debugUIText;
let player;
let controlButtons = []
let debugGraphic;
let rightHandPath = [];
let leftHandPath = [];
let trail;
let goons = []
let capturedGoons = []; // Declare a separate array to track captured goons globally
let numBackgrounds = 4;
let playerImageTypeCount = 20; // how many goons can be drawn from the 
let goonImageTypeCount = 7; // how many goons can be drawn from the 
let score = 0;
let scene;
let superman = false;
let cursors;
let lineGraphics;
let perimeters;
let trailPoints = [];
let maxStars = 11;

let playerSpeed = 300;
let goonSpeed = 200; // Initial speed of the goons
let playerLives = 4;

let perimeter = [
{ x: 0, y: 0 },
{ x: gameWidth, y: 0 },
{ x: gameWidth, y: gameHeight },
{ x: 0, y: gameHeight }
];

let maskContainer;
let polygonContainer = [];

let numPoints = 0;
let isPaused = false;
let foreground;
let background;

let goonRotationSpeed = 0.3; // Rotation speed multiplier
let isSafe = true;
let upButton;
let downButton;
let leftButton;
let rightButton;

let config = {
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

// eslint-disable-next-line no-unused-vars
let game = new Phaser.Game(config);

function preload() {
    // Preload assets here
    this.load.image(`upImage`, `assets/images/ui/up.png`);
    this.load.image(`downImage`, `assets/images/ui/down.png`);
    this.load.image(`leftImage`, `assets/images/ui/left.png`);
    this.load.image(`rightImage`, `assets/images/ui/right.png`);

    for (let i = 1; i <= numBackgrounds; i++) {
        this.load.image(`background${i}`, `assets/images/levels/${i}.back.png`);
        this.load.image(`foreground${i}`, `assets/images/levels/${i}.front.png`);
    }   
    
    for (let i = 1; i <= playerImageTypeCount; i++) {
        this.load.image(`player${i}`, `assets/images/players/${i}.png`);
    }    
 
    // Load star images
    for (let i = 1; i <= maxStars; i++) {
        this.load.image(`star${i}`, `assets/images/trail/${i}.png`);
    }
 
    for (let i = 1; i <= goonImageTypeCount; i++) {
        this.load.image(`goon${i}`, `assets/images/goons/goon${i}.png`);
    }
}

// Function to get a random array index
function getRandomIndex(n) {
    return Math.floor(Math.random() * n)+1;
  }
  

function create() {
    // Create game objects and initialize the game here
    scene = this;

    // Get random index for each variable
    let randomBackgroundIndex = getRandomIndex(numBackgrounds);
    let randomPlayerImageIndex = getRandomIndex(playerImageTypeCount);

    maskContainer = scene.make.graphics({ x: 0, y: 0, add: false });
    // Create background image
    background = scene.add.image(0, 0, `background${randomBackgroundIndex}`).setOrigin(0);
    background.setDepth(-1);

    debugGraphic = this.physics.world.createDebugGraphic();
    toggleDebugLines();
    trail = this.physics.add.staticGroup();

    // Create foreground image
    foreground = this.add.image(gameWidth / 2, gameHeight / 2, `foreground${randomBackgroundIndex}`).setDepth(0);
        
    // Create a graphics object for drawing the trail line
    lineGraphics = scene.add.graphics();
    lineGraphics.setDepth(2);
    
    player = scene.physics.add.sprite(0, 0, `player${randomPlayerImageIndex}`);
    player.setScale(0.35);
    player.setDepth(2);
    player.setOrigin(0.5);

    // Enable physics for the player sprite 
    // added 6/17/2023 - not sure if this breaks anything
    scene.physics.world.enable(player);
    
    // console.log(`player: ${player}`);

    // // In the create() method or after the images are loaded
    // const particles = this.add.particles();
    // const emitters = [];

    // // Log the loaded image keys
    // console.log(this.textures.getTextureKeys());
    // console.log('testing');

    // // TODO: There is an error here, I think the star images aren't loading.
    // for (let i = 1; i <= 11; i++) {
    //     const emitter = particles.createEmitter({
    //       frame: `star${i}`,
    //       lifespan: 1000, // Customize lifespan as desired
    //       scale: { start: 0.2, end: 0 }, // Customize scale range as desired
    //       blendMode: 'ADD', // Set the blend mode to add
    //     });
    //     emitters.push(emitter);
    // }

    // // Position the emitter relative to the player sprite
    // emitters.forEach((emitter) => {
    //     emitter.startFollow(player); // Attach the emitter to the player
    //     emitter.start();
    // });

    // Create an empty perimeters group
    perimeters = this.physics.add.staticGroup();
    updatePerimeter(perimeter); // Create initial perimeter
    this.physics.add.collider(goons, perimeters, goonPerimeterCollisionHandler, null, this);
    this.physics.add.collider(goons, trail, handleGoonTrailCollision, null, this);
    this.physics.add.collider(trail, perimeters, handlePlayerPerimeterCollision, null, this);

    // Create goons
    let goonImages = ['goon1', 'goon2', 'goon3','goon4', 'goon5', 'goon6','goon7'];  // Add the keys for more goon images here as needed

    for (let i = 0; i < goonImages.length; i++) {
        let goon = scene.physics.add.sprite(gameWidth / 2, 0, goonImages[i]);
        goon.setScale(0.20);
        goon.setVelocity(Phaser.Math.Between(-goonSpeed, goonSpeed), Phaser.Math.Between(-goonSpeed, goonSpeed));
        goon.setBounce(1);
        goon.setCollideWorldBounds(true);
        goon.setAngularVelocity(goonRotationSpeed);
        goon.setDepth(2);
        goons.push(goon);  // Add the new goon to the goons array
    }
    
    // Enable keyboard input
    cursors = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        leftShift: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    // Set world bounds
    
    scene.physics.world.setBounds(-10, -10, gameWidth + 20, gameHeight + 20); // Increase the world bounds by 10 pixels on each side
    scene.cameras.main.setBounds(0, 0, gameWidth, gameHeight); // Adjust the camera to focus on the playable area

    // Create UI text
    debugUIText = scene.add.text(10, 10, '', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        wordWrap: { width: gameWidth - 20 }
    });

    // Register spacebar input for pausing/resuming the game
    scene.input.keyboard.on('keydown-SPACE', togglePause);
    cursors.leftShift.on('down', startTurbo, player);
    cursors.leftShift.on('up', stopTurbo, player);

    upButton = scene.physics.add.sprite(gameWidth/2, gameHeight/2, 'upImage');
    downButton = scene.physics.add.sprite(gameWidth/2, gameHeight/2, 'downImage');
    leftButton = scene.physics.add.sprite(gameWidth/2, gameHeight/2, 'leftImage');
    rightButton = scene.physics.add.sprite(gameWidth/2, gameHeight/2, 'rightImage')

    let myButtonScale = 0.20;
    upButton.setScale(myButtonScale);
    downButton.setScale(myButtonScale);
    leftButton.setScale(myButtonScale);
    rightButton.setScale(myButtonScale);

    const buttonSize = 50; // Adjust the size as needed
    const buttonPadding = 20; // Adjust the padding between buttons as needed
    const centerX = 850;
    const centerY = 850;
    
    // Calculate the positions of the buttons
    const upButtonX = centerX;
    const upButtonY = centerY - buttonSize - buttonPadding;
    const downButtonX = centerX;
    const downButtonY = centerY + buttonSize + buttonPadding;
    const leftButtonX = centerX - buttonSize - buttonPadding;
    const leftButtonY = centerY;
    const rightButtonX = centerX + buttonSize + buttonPadding;
    const rightButtonY = centerY;
    
    // Set the positions of the buttons
    upButton.setPosition(upButtonX, upButtonY);
    upButton.setDepth(3);
    downButton.setPosition(downButtonX, downButtonY);
    downButton.setDepth(3);
    leftButton.setPosition(leftButtonX, leftButtonY);
    leftButton.setDepth(3);
    rightButton.setPosition(rightButtonX, rightButtonY);
    rightButton.setDepth(3);

    // Add event listeners to the buttons
    upButton.setInteractive();
    downButton.setInteractive();
    leftButton.setInteractive();
    rightButton.setInteractive();

    // Assign the same click handler to all buttons
    upButton.on('pointerdown', handleButtonClick);
    downButton.on('pointerdown', handleButtonClick);
    leftButton.on('pointerdown', handleButtonClick);
    rightButton.on('pointerdown', handleButtonClick);

    // Axed this because it was acting up. Assign the shakeScreen function as the click handler for the button
    // upButton.on('pointerdown', shakeScreen);

    controlButtons.push(upButton);
    controlButtons.push(downButton);
    controlButtons.push(upButton);
    controlButtons.push(upButton);
}

// eslint-disable-next-line no-unused-vars
function startTurbo(player)
{
    console.log("Shift pressed!");
}
// eslint-disable-next-line no-unused-vars
function stopTurbo(player)
{
    console.log("Shift released!");
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

    handlePlayerMovement();

    let currentPoint = { x: player.x, y: player.y };
    let lastPoint = trailPoints[trailPoints.length - 1];

    isSafe = isPointOnPerimeter( currentPoint, perimeter );

    // check if the player is not safe. In which case store their path and draw it.
    if (!isSafe) {
        if (!lastPoint || currentPoint.x !== lastPoint.x || currentPoint.y !== lastPoint.y) {
            trailPoints.push(currentPoint);
            numPoints = trailPoints.length - 1;

            // Draw the trail line
            lineGraphics.clear();
            lineGraphics.lineStyle(3, trailColor);
            for (let i = 0; i < trailPoints.length - 1; i++) {
                let p1 = trailPoints[i];
                let p2 = trailPoints[i + 1];
                lineGraphics.lineBetween(p1.x, p1.y, p2.x, p2.y);
            }
        }
    }
    else
    {
        lineGraphics.clear();
    }

    if (isSafe && trailPoints.length == 0) { 
        trailPoints[0] = (currentPoint); 
    } else if (isSafe && trailPoints.length == 1) { 
        trailPoints[0]  = currentPoint; 
    }

    // a return to the perimeter
    if (isSafe && trailPoints.length > 1)
    {
        trailPoints.push(currentPoint);
        rightHandPath = getRightHandPath(reducePoints(trailPoints), perimeter);
        leftHandPath = getLeftHandPath(reducePoints(trailPoints), perimeter);
    
        let leftHandArea = Math.abs(new Phaser.Geom.Polygon(leftHandPath).calculateArea());
        let rightHandArea = Math.abs(new Phaser.Geom.Polygon(rightHandPath).calculateArea());
        
        let scoreAdded;

        clearPolygon(polygonContainer, "perimeter");
                
        // carves the polygon from the foreground.
        if (rightHandArea < leftHandArea) {
            //console.log("Selecting RightHandArea for masking.");
            writeAreaUI(rightHandArea);           
            totalCapturedPercentArea += 100 * rightHandArea / (gameHeight * gameWidth);            
            createMask(rightHandPath, maskContainer, scene, foreground);
            perimeter = leftHandPath; 
            scoreAdded = rightHandArea;                
        } else {
            //console.log("Selecting LeftHandArea for masking.");
            // normalize, apply logarithmic scoring, and scale the result
            writeAreaUI(leftHandArea);
            totalCapturedPercentArea += 100 * leftHandArea / (gameHeight * gameWidth);
            createMask(leftHandPath, maskContainer, scene, foreground);
            perimeter = rightHandPath;
            scoreAdded = leftHandArea;
        }

        score+=scoreAdded;
        
        updatePerimeter(perimeter); // Update the perimeter within the game world to enable collision        
        trailPoints = []; // Update the player's trail with the game world to enable collistion
    }

    // Inside the update function
    for (let i = goons.length - 1; i >= 0; i--) {
        let goon = goons[i];
        if (goon && goon.body && !capturedGoons.includes(goon)) {
            let polygon = new Phaser.Geom.Polygon(perimeter);
            // if the goon is NOT inside the polygon then kill it
            if (!Phaser.Geom.Polygon.Contains(polygon, goon.x, goon.y)) {
                // Stop goon's movement
                goon.body.setVelocity(0);
        
                // console.log("Capturing a goon!");
                // Generate a random score for killing the goon
                const myScore = Phaser.Math.RoundTo(Phaser.Math.Between(50000, 250000),-4);
                score += myScore;
                
                // Create the floating score text
                const text = scene.add.text(goon.x, goon.y, myScore.toString(), {
                    fontFamily: 'Arial',
                    fontSize: '48px',
                    fill: '#00ff00', // Green color
                    stroke: '#000000', // Black stroke
                    strokeThickness: 5
                });
                text.setOrigin(0.5, 0.5);

                // Animate the floating score text
                scene.tweens.add({
                    targets: text,
                    y: text.y - 100, // Adjust the desired float distance
                    alpha: 0,
                    duration: 4000, // Adjust the desired duration
                    onComplete: function () {
                        text.destroy(); // Remove the floating text
                    }
                });

                capturedGoons.push(goon);
                // Start the capture animation
                scene.tweens.add({
                    targets: goon,
                    scaleX: 2, // Grow
                    scaleY: 2,
                    duration: 500, // Duration of growth
                    yoyo: true, // Shrink back
                    ease: 'Power1', // Easing function
                    onUpdate: function () { // Shake
                        goon.x += Phaser.Math.Between(-1, 1); // Randomly adjust goon's x position
                        goon.y += Phaser.Math.Between(-1, 1); // Randomly adjust goon's y position
                    },
                    onComplete: function () { // Spin away and destroy
                        scene.tweens.add({
                            targets: goon,
                            rotation: Phaser.Math.DegToRad(360), // Spin
                            scaleX: 0, // Shrink
                            scaleY: 0,
                            duration: 1500, // Duration of spin/shrink
                            onComplete: function () {
                                goon.destroy();  // Remove goon from scene
                                // goons.splice(i, 1);  // Remove goon from array // 6.8.2023 this is a bugged line due to the way the rest of the game works. Removing the goon from the array entirely messed with the physics engine and also repeatedly deleted element's score text hovering over goons that die
                            }
                        });
                    }
                });
                }
            }
        }

    updateTrail(reducePoints(trailPoints));
    // Update goons' rotation based on velocity
    for (let i = 0; i < goons.length; i++) {
        let goon = goons[i];
        if (goon && goon.body) {
            goon.setAngularVelocity(goon.body.velocity.x * goonRotationSpeed);
        }
    }    
    
    if (goons.filter(goon => goon && goon.body).length === 0) {
        // console.log("Victory Condition Met!");
    
        // Create text objects
        let victoryText = scene.add.text(gameWidth / 2, gameHeight / 2 -120, 'GAME OVER!\r\nYOU WIN', 
            { font: 'bold 64px Arial', fill: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 6});
        let scoreText = scene.add.text(gameWidth / 2, gameHeight / 2, 'YOUR SCORE: ' + Math.round(score).toLocaleString(), 
            { font: 'bold 48px Arial', fill: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 6 });
    
        // Center align the text
        victoryText.setOrigin(0.5, 0.5);
        scoreText.setOrigin(0.5, 0.5);
    }    
}

function writeUI() {
    // Update the UI text here
    if (debug) {
        debugUIText.setText(`Number of Trailpoints: ${numPoints}\r\nPaused: ${isPaused}\r\nIs Safe: ${isSafe}\r\nScore: ${Math.round(score).toLocaleString()}\r\nGoon Length: ${goons.length}\r\nTotal Area: ${totalCapturedPercentArea.toFixed(2)}%\r\nPlayer Lives: ${playerLives}`);
        debugUIText.setDepth(3);
    }

    //textOverlay.clear();
    //textOverlay.addText(gamewidth-100,50,`Lives: ${lives}`);
}


function writeAreaUI  (area ) {
    let percentCaptured = 100 * area / (gameWidth*gameHeight);

    let capturedString;
    capturedString = "Captured " + percentCaptured.toFixed(2) + "%";
    // console.log(`Area carved! ${percentCaptured}%`);

    // Create the floating score text
    const text = scene.add.text(player.x, player.y, capturedString, {
        fontFamily: 'Arial',
        fontSize: '48px',
        fill: '#00ff00', // Green color
        stroke: '#000000', // Black stroke
        strokeThickness: 5
    });
    text.setOrigin(0.5, 0.5);

    // Animate the floating score text
    scene.tweens.add({
        targets: text,
        y: text.y - 100, // Adjust the desired float distance
        alpha: 0,
        duration: 4000, // Adjust the desired duration
        onComplete: function () {
            text.destroy(); // Remove the floating text
        }
    });   
}

// Function to handle button clicks
function handleButtonClick() {
    // Get the clicked button
    const clickedButton = this;
    
    let halfWidth = player.displayWidth / 2;
    let halfHeight = player.displayHeight / 2;
    
    // Handle the specific button's functionality
    if (clickedButton === upButton) {
      // Handle up button click
      // console.log("Up button clicked!");
      if( player.y > 0 + halfHeight && player.body.velocity.y <= 0) {
        player.setVelocityY(-1 * playerSpeed);
        player.setVelocityX(0);
      }
    } else if (clickedButton === downButton) {
      // Handle down button click
      // console.log("Down button clicked!");
      if (player.y < gameHeight - halfHeight && player.body.velocity.y >= 0) {
        player.setVelocityY(playerSpeed);
        player.setVelocityX(0);
      }
    } else if (clickedButton === leftButton) {
      // Handle left button click
      // console.log("Left button clicked!");
      if (player.x > 0 + halfWidth && player.body.velocity.x <= 0) {
        player.setVelocityX(-1 * playerSpeed);
        player.setVelocityY(0);
      }
    } else if (clickedButton === rightButton) {
      // Handle right button click
      // console.log("Right button clicked!");
      if (player.x < gameWidth - halfWidth && player.body.velocity.x >= 0) {
        player.setVelocityX(playerSpeed);
        player.setVelocityY(0);
      }
    }
  }


function togglePause() {
    isPaused = !isPaused;

    // Reset recent direction when resuming
    if (!isPaused) {
        player.rotation = 0;
        player.setVelocityX(0);
        player.setVelocityY(0);
    }
}

function handlePlayerMovement() {
    let halfWidth = player.displayWidth / 2;
    let halfHeight = player.displayHeight / 2;
    
    if (cursors.up.isDown && player.y > 0 + halfHeight && player.body.velocity.y <= 0) {
        player.setVelocityY(-1 * playerSpeed);
        player.setVelocityX(0);
    } else if (cursors.down.isDown && player.y < gameHeight - halfHeight && player.body.velocity.y >= 0) {
        player.setVelocityY(playerSpeed);
        player.setVelocityX(0);
    }
    if (cursors.left.isDown && player.x > 0 + halfWidth && player.body.velocity.x <= 0) {
        player.setVelocityX(-1 * playerSpeed);
        player.setVelocityY(0);
    } else if (cursors.right.isDown && player.x < gameWidth - halfWidth && player.body.velocity.x >= 0) {
        player.setVelocityX(playerSpeed);
        player.setVelocityY(0);
    }
    
    // this code may not be needed anymore.
    if (player != null && perimeter != null) {
        // Check if the player is on a point not inside the perimeter and not on the perimeter
        let playerPoint = new Phaser.Geom.Point(player.x, player.y);
        let perimeterPolygon = new Phaser.Geom.Polygon(perimeter);
        
        let isOutsidePerimeter = !Phaser.Geom.Polygon.ContainsPoint(perimeterPolygon, playerPoint);
        let isNotOnPerimeter = ! isPointOnPolygonEdge( {x:player.x, y:player.y}, perimeter );
        
        //console.log("checking if player is in a valid location");
        
        if (isOutsidePerimeter && isNotOnPerimeter) {
            // Player is on a point outside the perimeter, handle the logic here
            // console.log("Player is outside the perimeter!");

            // Find the closest point along the perimeter to the player
            let closestPoint = getClosestPointOnPerimeter(playerPoint, perimeter);

            // Set the player's X and Y coordinates to the closest point
            player.x = closestPoint.x;
            player.y = closestPoint.y;

            player.setVelocityX(0);
            player.setVelocityY(0);
        }
    }
}

function createMask(polygonPoints, container, scene, worldObject) {
    // Add the polygon points to the container graphics object
    container.fillStyle(0xffffff);
    container.beginPath();
    container.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (let i = 1; i < polygonPoints.length; i++) {
        container.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    container.closePath();
    container.fillPath();

    // Create the mask and invert it
    let geometryMask = new Phaser.Display.Masks.GeometryMask(scene, container);
    geometryMask.invertAlpha = true;

    // Apply the mask to the background image
    worldObject.setMask(geometryMask);
}


// eslint-disable-next-line no-unused-vars
function handleGoonTrailCollision(goon, trail) {

    trailColor = 0xFF0000;
    // After 2 seconds, revert back to the original color
    setTimeout(() => {
        trailColor = originalColor;
    }, 200);

    // Handle the collision event here
    if (!superman) {
        // console.log('Ouch! That hurt. Plug for future work to cause harm to the player.');
        shakeScreen();
        playerLives--;
    }
}

// eslint-disable-next-line no-unused-vars
function goonPerimeterCollisionHandler(goon, perimeter) {
    // Handle the collision event here
    // console.log('Goon collided with a perimeter!');
}

// eslint-disable-next-line no-unused-vars
function handlePlayerPerimeterCollision(player, perimeter) {
    // console.log('Player collided with a wall!');
}

function updatePerimeter(perimeterPoints) {
    // Clear out old perimeters
    perimeters.clear(true, true);

    // Generate new perimeters
    for (let i = 0; i < perimeterPoints.length; i++) {
        let start = perimeterPoints[i];
        let end = i < perimeterPoints.length - 1 ? perimeterPoints[i + 1] : perimeterPoints[0];

        let centerX = (start.x + end.x) / 2;
        let centerY = (start.y + end.y) / 2;

        let width = Math.abs(start.x - end.x);
        let height = Math.abs(start.y - end.y);

        // To prevent zero width/height, set a minimum value for the width and height
        width = Math.max(1, width);
        height = Math.max(1, height);

        let wall = scene.physics.add.staticImage(centerX, centerY, null);
        wall.body.setOffset(-width / 2, -height / 2);
        wall.body.setSize(width, height);           
        wall.displayWidth = width;
        wall.displayHeight = height;
        perimeters.add(wall);
    }
}

// This is where you update the player's trail
function updateTrail() {
    // Clear out old trail
    trail.clear(true, true);

    // Generate new trail
    for (let i = 0; i < trailPoints.length - 1; i++) {
        let start = trailPoints[i];
        let end = trailPoints[i + 1];

        let centerX = (start.x + end.x) / 2;
        let centerY = (start.y + end.y) / 2;

        let width = Math.abs(start.x - end.x);
        let height = Math.abs(start.y - end.y);

        // To prevent zero width/height, set a minimum value for the width and height
        width = Math.max(1, width);
        height = Math.max(1, height);

        let wall = scene.physics.add.staticImage(centerX, centerY, null);
        wall.displayWidth = width;
        wall.displayHeight = height;
        trail.add(wall);
    }
}

// Toggle the visibility of the debug graphic
function toggleDebugLines() {
    debugGraphic.visible = !debugGraphic.visible;
  }

// Function to shake the screen  
function shakeScreen() {
    let camera = scene.cameras.main;
    // console.log('Shaking screen! with Camera = ' + camera);
    camera.shake(100, 0.005);
}