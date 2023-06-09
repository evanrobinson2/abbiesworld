let gameWidth = 1232;
let gameHeight = 928;
let player;
let updatedPerimeter;
let playerSpeed = 300;
let rightHandPath = [];
let leftHandPath = [];
// Create an empty trail group
let trail;
let smallerPath;
let goons = []
let maxGoons = 4; // the number of goons to play this game
let goonImageTypeCount = 7; // how many goons can be drawn from the 
let goon1Velocity;
let score = 0;
let scene;
let superman = false;
let cursors;
let lineGraphics;
let perimeters;
let maskGraphics;
let additiveScore = 0;
let trailPoints = [];
let priorPath = [];
let circles = []; // Array to store the drawn circles
let debug = false;
let perimeter = [
{ x: 0, y: 0 },
{ x: gameWidth, y: 0 },
{ x: gameWidth, y: gameHeight },
{ x: 0, y: gameHeight }
];

let maskContainer;
let polygonContainer = [];

let numRectangles = 0;
let numPoints = 0;
let uiText;
let recentDirection = null;
let isPaused = false;
let foreground;
let background;
let goonSpeed = 200; // Initial speed of the goons
let goonRotationSpeed = 0.3; // Rotation speed multiplier
let goonSpeedIncrease = 0.001; // Speed increase on bounce
let isSafe = true;

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

let game = new Phaser.Game(config);

function preload() {
    // Preload assets here
    this.load.image('background', 'assets/images/prize1.png');
    this.load.image('player', 'assets/images/player.png');

    for (let i = 1; i <= goonImageTypeCount; i++) {
        this.load.image(`goon${i}`, `assets/images/goons/goon${i}.png`);
    }

    this.load.image('foreground', 'assets/images/prize1_foreground.png');
}

function create() {
    // Create game objects and initialize the game here
    scene = this;

    maskContainer = scene.make.graphics({ x: 0, y: 0, add: false });
    // Create background image
    background = scene.add.image(0, 0, 'background').setOrigin(0);
    background.setDepth(-1);

    if (debug) { this.physics.world.createDebugGraphic(); }
    trail = this.physics.add.staticGroup();

    // Create foreground image
    foreground = this.add.image(gameWidth / 2, gameHeight / 2, 'foreground').setDepth(0);
    maskGraphics = this.add.graphics();
    
    // Create a graphics object for drawing the trail line
    lineGraphics = scene.add.graphics();
    lineGraphics.setDepth(2);

    player = scene.physics.add.sprite(0, 0, 'player');
    player.setScale(0.2);
    player.setDepth(2);
    player.setOrigin(0.5);

    // Create an empty perimeters group
    perimeters = this.physics.add.staticGroup();
    updatePerimeter(perimeter); // Create initial perimeter
    let c1 = this.physics.add.collider(goons, perimeters, goonPerimeterCollisionHandler, null, this);
    let c2 = this.physics.add.collider(goons, trail, handleGoonTrailCollision, null, this);
    let c3 = this.physics.add.collider(trail, perimeters, handlePlayerPerimeterCollision, null, this);


    // Create goons
    let goonImages = ['goon1', 'goon2', 'goon3','goon4', 'goon5', 'goon6','goon7'];  // Add the keys for more goon images here as needed

    for (let i = 0; i < goonImages.length; i++) {
        let goon = scene.physics.add.sprite(gameWidth / 2, 0, goonImages[i]);
        goon.setScale(0.15);
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
    uiText = scene.add.text(10, 10, '', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ffffff',
        wordWrap: { width: gameWidth - 20 }
    });

    // Register spacebar input for pausing/resuming the game
    scene.input.keyboard.on('keydown-SPACE', togglePause);
    cursors.leftShift.on('down', startTurbo, player);
    cursors.leftShift.on('up', stopTurbo, player);
}

function startTurbo(player)
{
    console.log("Shift pressed!");
}
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

    // Rotate player at 0.5 cycles/sec
    let rotationSpeed = 0.5 * Math.PI; // Convert cycles/sec to radians/sec
    player.rotation += rotationSpeed * scene.sys.game.loop.delta / 1000; // Divide by 1000 to convert to seconds

    handlePlayerMovement();

    // Check if a new point is added
    let currentPoint = { x: player.x, y: player.y };
    let lastPoint = trailPoints[trailPoints.length - 1];

    // console.log(currentPoint);
    // console.log(perimeter);
    isSafe = isPointOnPerimeter( currentPoint, perimeter );

    // check if the player is not safe. In which case store their path!
    if (!isSafe) {
        if (!lastPoint || currentPoint.x !== lastPoint.x || currentPoint.y !== lastPoint.y) {
            trailPoints.push(currentPoint);
            numPoints = trailPoints.length - 1;

            // Draw the trail line
            lineGraphics.clear();
            lineGraphics.lineStyle(5, 0xffffff);
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
    // I think this code is being called when we adjust the player's position after having crossed over a perimeter because I think trailPoints is getting erased
    if (isSafe && trailPoints.length > 1)
    {
        trailPoints.push(currentPoint);
        console.log('Returned to Perimeter!');
        rightHandPath = getRightHandPath(reducePoints(trailPoints), perimeter);
        leftHandPath = getLeftHandPath(reducePoints(trailPoints), perimeter);
    
        let leftHandArea = Math.abs(new Phaser.Geom.Polygon(leftHandPath).calculateArea());
        let rightHandArea = Math.abs(new Phaser.Geom.Polygon(rightHandPath).calculateArea());
        
        let scoreAdded;

        clearPolygon("perimeter");
        
        let scaleFactor = 1_000_000 - 1000; // 999,000
        
        // carves the polygon from the foreground.
        if (rightHandArea < leftHandArea) {
            console.log("Selecting RightHandArea for masking.");
            // normalize, apply logarithmic scoring, and scale the result
            additiveScore = 1000 + scaleFactor * Math.log((rightHandArea / (gameWidth * gameHeight)) + 1);
            createMask(rightHandPath, maskContainer, scene, foreground);
            perimeter = leftHandPath; 
            scoreAdded = rightHandArea;    
            
        } else {
            console.log("Selecting LeftHandArea for masking.");
            // normalize, apply logarithmic scoring, and scale the result
            additiveScore = 1000 + scaleFactor * Math.log((leftHandArea / (gameWidth * gameHeight)) + 1);
            createMask(leftHandPath, maskContainer, scene, foreground);
            perimeter = rightHandPath;
            scoreAdded = leftHandArea;
        }

        score+=scoreAdded;
        // drawPolygon("perimeter", perimeter, "#00FF00");

        // Update the perimeter within the game world to enable collision
        updatePerimeter(perimeter);
        // Update the player's trail with the game world to enable collistion
        
        priorPath = trailPoints;
        trailPoints = []; 
    }

    for (let i = goons.length - 1; i >= 0; i--) {
        let goon = goons[i];
        if (goon && goon.body) {
            let polygon = new Phaser.Geom.Polygon(perimeter);
            // if the goon is NOT inside the polygon then kill it
            if (!Phaser.Geom.Polygon.Contains(polygon, goon.x, goon.y)) {
                // Stop goon's movement
                goon.body.setVelocity(0);
    
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
                            //goons.splice(i, 1);  // Remove goon from array // 6.8.2023 this is a bugged line due to the way the rest of the game works. Removing the goon from the array entirely messed with the physics engine and also repeatedly deleted elements                            
                            // score text hovering over goons that die
                            // // Generate a random score for killing the goon
                            // const myScore = Phaser.Math.RoundTo(Phaser.Math.Between(50000, 500000),-4);
                            // // score += myScore;
                            // console.log(myScore);
                            // // Create the floating score text
                            // const text = scene.add.text(goon.x, goon.y, myScore.toString(), {
                            //     fontFamily: 'Arial',
                            //     fontSize: '48px',
                            //     fill: '#00ff00', // Green color
                            //     stroke: '#000000', // Black stroke
                            //     strokeThickness: 5
                            // });
                            // text.setOrigin(0.5, 0.5);

                            // // Animate the floating score text
                            // scene.tweens.add({
                            //     targets: text,
                            //     y: text.y - 100, // Adjust the desired float distance
                            //     alpha: 0,
                            //     duration: 2000, // Adjust the desired duration
                            //     onComplete: function () {
                            //         text.destroy(); // Remove the floating text
                            //     }
                            // });
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
        console.log("Victory Condition Met!");
    
        // Create text objects
        let victoryText = scene.add.text(gameWidth / 2, gameHeight / 2, 'GAME OVER! YOU WIN', 
            { font: 'bold 64px Arial', fill: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 6});
        let scoreText = scene.add.text(gameWidth / 2, gameHeight / 2 + 70, 'YOUR SCORE: ' + Math.round(score), 
            { font: 'bold 48px Arial', fill: '#ffffff', align: 'center', stroke: '#000000', strokeThickness: 6 });
    
        // Center align the text
        victoryText.setOrigin(0.5, 0.5);
        scoreText.setOrigin(0.5, 0.5);
    }
    
    
}

function countGoonsWithBodies(goons) {
    return goons.filter(goon => goon && goon.body).length;
}

function writeUI() {
    // Update the UI text here
    uiText.setText(`Number of Trailpoints: ${numPoints}\r\nPaused: ${isPaused}\r\nIs Safe: ${isSafe}\r\nScore: ${Math.round(score)}\r\nGoon Length: ${goons.length}`);

    uiText.setDepth(3);
}

function togglePause() {
    isPaused = !isPaused;

    // Reset recent direction when resuming
    if (!isPaused) {
        recentDirection = null;
        player.rotation = 0;
        player.setVelocityX(0);
        player.setVelocityY(0);
    }
}

function handlePlayerMovement() {

    // @todo this code seems a bit bu
    // Handle player movement with extended bounds
    let halfWidth = player.displayWidth / 2;
    let halfHeight = player.displayHeight / 2;

    if (cursors.up.isDown && player.y > 0 + halfHeight) {
        player.setVelocityY(-1 * playerSpeed);
        player.setVelocityX(0);
    } else if (cursors.down.isDown && player.y < gameHeight - halfHeight) {
        player.setVelocityY(playerSpeed);
        player.setVelocityX(0);
    }
    if (cursors.left.isDown && player.x > 0 + halfWidth) {
        player.setVelocityX(-1 * playerSpeed);
        player.setVelocityY(0);
    } else if (cursors.right.isDown && player.x < gameWidth - halfWidth) {
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
            console.log("Player is outside the perimeter!");

            // Find the closest point along the perimeter to the player
            let closestPoint = getClosestPointOnPerimeter(playerPoint, perimeter);

            // Set the player's X and Y coordinates to the closest point
            player.x = closestPoint.x;
            player.y = closestPoint.y;

            player.setVelocityX(0);
            player.setVelocityY(0);
        }
    }


    // // if the player leaves the game area, then put them back in
    // // note: this code should be redundant
    // if (player.x < 0) {
    //     player.x = 0;
    //     player.setVelocityX(0);
    // }
    // if (player.x > gameWidth + halfWidth) {
    //     player.x = gameWidth;
    //     player.setVelocityX(0);
    // }
    // if (player.y < 0) {
    //     player.y = 0;
    //     player.setVelocityY(0);
    // }
    // if (player.y > gameHeight) {
    //     player.y = gameHeight;
    //     player.setVelocityY(0);
    // }
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

function drawPolygon(points, internalName = "unset", lineStyle = 5, color = "#FF0000", fill = false, ) {
    polygon = scene.add.graphics();


    if (internalName === "unset") {
        // set internalName to "polygon-{polygonContainer.size}"
        internalName = `polygon-${polygonContainer.length}`;
        console.log("Added " + internalName + " to polygon array");
    }

    polygon.lineStyle(lineStyle, parseInt(color.slice(1), 16)); // Set stroke color and line width
    polygon.fillStyle(color); // Set fill color
    polygon.beginPath();
    polygon.moveTo(points[0].x, points[0].y); // Move to the first point

    for (let i = 1; i < points.length; i++) {
        polygon.lineTo(points[i].x, points[i].y); // Draw lines to subsequent points
    }

    polygon.closePath(); // Close the shape

    polygon.strokePath(); // Draw the outline
    if (fill) { polygon.fillPath() }; // Fill the shape

    polygonContainer.push({name: internalName, polygon: polygon});
}

function clearPolygon(internalName) {
    for (let i = 0; i < polygonContainer.length; i++) {
        if (polygonContainer[i].name === internalName) {
            polygonContainer[i].polygon.clear(); // Clear the polygon
            polygonContainer[i].polygon.destroy();
            polygonContainer.splice(i, 1); // Remove the polygon from the container
            break;
        }
    }
}

function isPointOnPolygonEdge(point, polygon) {
    for (let i = 0; i < polygon.length; i++) {
      let currentVertex = polygon[i];
      let nextVertex = polygon[(i + 1) % polygon.length]; // Next vertex (considering wrap-around for last vertex)
      let edge = new Phaser.Geom.Line(currentVertex.x, currentVertex.y, nextVertex.x, nextVertex.y);
      
      

      if (isPointOnLineSegment(point, currentVertex, nextVertex)) {
        return true;
      }
    }
    
    return false;
  }

function handleGoonTrailCollision(goon, trail) {
    // Handle the collision event here
    if (!superman) {
        console.log('Ouch! That hurt. Plug for future work to cause harm to the player.');
    }
}

function goonPerimeterCollisionHandler(goon, perimeter) {
    // Handle the collision event here
    // console.log('Goon collided with a perimeter!');
}

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