var gameWidth = 1232;
var gameHeight = 928;
var player;
var playerSpeed = 300;
var rightHandPath = [];
var leftHandPath = [];
let smallerPath;
var goon1;
var goon1Velocity;
var goon2;
var scene;
var cursors;
var lineGraphics;
var maskGraphics;
var trailPoints = [];
var priorPath = [];
let circles = []; // Array to store the drawn circles
var perimeter = [
{ x: 0, y: 0 },
{ x: gameWidth, y: 0 },
{ x: gameWidth, y: gameHeight },
{ x: 0, y: gameHeight }
];

var maskContainer;
var polygonContainer = [];

var numRectangles = 0;
var numPoints = 0;
var uiText;
var recentDirection = null;
var isPaused = false;
var foreground;
var background;
var goonSpeed = 200; // Initial speed of the goons
var goonRotationSpeed = 0.3; // Rotation speed multiplier
var goonSpeedIncrease = 0.001; // Speed increase on bounce
var isSafe = true;

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
    this.load.image('background', 'assets/images/prize1.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('goon1', 'assets/images/goon1.png');
    this.load.image('goon2', 'assets/images/goon2.png');
    this.load.image('foreground', 'assets/images/prize1_foreground.png');
}

function create() {
    // Create game objects and initialize the game here
    scene = this;

    maskContainer = scene.make.graphics({ x: 0, y: 0, add: false });
    // Create background image
    background = scene.add.image(0, 0, 'background').setOrigin(0);
    background.setDepth(-1);

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

    goon1 = scene.physics.add.sprite(gameWidth / 2, 0, 'goon1');
    goon1.setScale(0.2);
    goon1.setVelocity(200, 150);
    goon1.setBounce(1);
    goon1.setCollideWorldBounds(true);
    goon1.setAngularVelocity(goonRotationSpeed);
    goon1.setDepth(2);

    goon2 = scene.physics.add.sprite(gameWidth / 2, 0, 'goon2');
    goon2.setScale(0.2);
    goon2.setVelocity(Phaser.Math.Between(-goonSpeed, goonSpeed), Phaser.Math.Between(-goonSpeed, goonSpeed));
    goon2.setBounce(1);
    goon2.setCollideWorldBounds(true);
    goon2.setAngularVelocity(goonRotationSpeed);
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

    handlePlayerMovement();

    // Check if a new point is added
    var currentPoint = { x: player.x, y: player.y };
    var lastPoint = trailPoints[trailPoints.length - 1];

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
            lineGraphics.lineStyle(2, 0xffffff);
            for (var i = 0; i < trailPoints.length - 1; i++) {
                var p1 = trailPoints[i];
                var p2 = trailPoints[i + 1];
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

    if (isSafe && trailPoints.length > 1)
    {
        trailPoints.push(currentPoint);
        console.log('Returned to Perimeter!');
        rightHandPath = getRightHandPath(reducePoints(trailPoints), perimeter);
        leftHandPath = getLeftHandPath(reducePoints(trailPoints), perimeter);

        // drawPolygon(rightHandPath, getRandomVibrantColor());
        // drawPolygon(leftHandPath, getRandomVibrantColor());
    
        let leftHandArea = Math.abs(new Phaser.Geom.Polygon(leftHandPath).calculateArea());
        let rightHandArea = Math.abs(new Phaser.Geom.Polygon(rightHandPath).calculateArea());
        
        // console.log("Right hand path area: " + rightHandArea);
        // console.log("Left hand path area: " + leftHandArea);
        // console.log("rightHandArea < leftHandArea: " + (rightHandArea < leftHandArea));
        
        // let area = Math.abs(new Phaser.Geom.Polygon(perimeter).area);
        // console.log('Area of perimeter: ' + area);
        // console.log('Assertion check: ' + (rightHandArea + leftHandArea) + "=" + area + " = " + (rightHandArea + leftHandArea == area));
        
        clearPolygon("perimeter");
        // carves the polygon from the foreground.
        if (rightHandArea < leftHandArea) {
            console.log("Selecting RightHandArea for masking.");
            createMask(rightHandPath, maskContainer, scene, foreground);
            // perimeter = leftHandPath;            
        } else {
            console.log("Selecting LeftHandArea for masking.");
            createMask(leftHandPath, maskContainer, scene, foreground);
            // perimeter = rightHandPath;
        }
        drawPolygon("perimeter", perimeter);
        

        // console.log(perimeter);
        
        priorPath = trailPoints;
        trailPoints = []; 
    }

    // Update goons' rotation based on velocity
    goon1.setAngularVelocity(goon1.body.velocity.x * goonRotationSpeed);
    goon2.setAngularVelocity(goon2.body.velocity.x * goonRotationSpeed);  
}

function writeUI() {
    // Update the UI text here
    uiText.setText('Number of Trailpoints: ' + numPoints + '\r\nPaused: ' + isPaused + '\r\nIs Safe: ' + isSafe);
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
    // Handle player movement with extended bounds
    var halfWidth = player.displayWidth / 2;
    var halfHeight = player.displayHeight / 2;

    if (cursors.up.isDown && player.y > 0 + halfHeight) {
        player.setVelocityY(-1 * playerSpeed);
        player.setVelocityX(0);
    } else if (cursors.down.isDown && player.y < gameHeight - halfHeight) {
        player.setVelocityY(playerSpeed);
        player.setVelocityX(0);
    }

    if (player != null && perimeter != null) {
        // Check if the player is on a point not inside the perimeter and not on the perimeter
        var playerPoint = new Phaser.Geom.Point(player.x, player.y);
        var perimeterPolygon = new Phaser.Geom.Polygon(perimeter);

        
        var isOutsidePerimeter = !Phaser.Geom.Polygon.ContainsPoint(perimeterPolygon, playerPoint);
        var isNotOnPerimeter = ! isPointOnPolygonEdge( {x:player.x, y:player.y}, perimeter );
        
        console.log("checking if player is in a valid location");
        
        if (isOutsidePerimeter && isNotOnPerimeter) {
            // Player is on a point outside the perimeter, handle the logic here
            console.log("Player is outside the perimeter!");

            // Find the closest point along the perimeter to the player
            var closestPoint = getClosestPointOnPerimeter(playerPoint, perimeter);

            // Set the player's X and Y coordinates to the closest point
            player.x = closestPoint.x;
            player.y = closestPoint.y;

            player.setVelocityX(0);
            player.setVelocityY(0);
        }
    }

    if (player.x < 0) {
        player.x = 0;
        player.setVelocityX(0);
    }
    if (player.x > gameWidth + halfWidth) {
        player.x = gameWidth;
        player.setVelocityX(0);
    }
    if (player.y < 0) {
        player.y = 0;
        player.setVelocityY(0);
    }
    if (player.y > gameHeight) {
        player.y = gameHeight;
        player.setVelocityY(0);
    }

    if (cursors.left.isDown && player.x > 0 + halfWidth) {
        player.setVelocityX(-1 * playerSpeed);
        player.setVelocityY(0);
    } else if (cursors.right.isDown && player.x < gameWidth - halfWidth) {
        player.setVelocityX(playerSpeed);
        player.setVelocityY(0);
    }
}


function drawPoints(points, diameter = 10, fillColor = 0xff0000, strokeColor = 0x000000, textColor = 0xffffff, gameWidth, gameHeight) {
    const offset = 50; // Define the offset distance

    points.forEach((point, index) => {
        const circle = scene.add.graphics();

        circle.lineStyle(5, strokeColor); // Set black outline
        circle.fillStyle(fillColor); // Set red fill

        circle.strokeCircle(point.x, point.y, diameter); // Draw circle outline at the specified point
        circle.fillCircle(point.x, point.y, diameter); // Draw filled circle at the specified point

        // Check if the point is near the corners, and adjust the position of the text accordingly
        let textX = point.x;
        let textY = point.y;

        if (point.x < offset) {
            textX += offset;
        } else if (point.x > gameWidth - offset) {
            textX -= offset;
        }

        if (point.y < offset) {
            textY += offset;
        } else if (point.y > gameHeight - offset) {
            textY -= offset;
        }

        // Add the index as text
        const text = scene.add.text(textX, textY, index.toString(), { 
            color: '#' + textColor.toString(16).padStart(6, '0'),
            fontSize: '20px', // Set the font size to 20 pixels
            fontWeight: 'bold', // Set the font weight to bold
            stroke: '#000000', // Set the text outline color to black
            strokeThickness: 2 // Set the text outline thickness
        });
        text.setOrigin(0.5, 0.5); // Center the text

        circles.push({ circle, text }); // Add the circle and its text to the array
    });
}

function clearPoints() {
    circles.forEach(({ circle, tween }) => {
      circle.destroy(); // Destroy the graphics object
    });
  
    circles = []; // Clear the array
}
  
function createMask(polygonPoints, container, scene, worldObject) {
    // Add the polygon points to the container graphics object
    container.fillStyle(0xffffff);
    container.beginPath();
    container.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (var i = 1; i < polygonPoints.length; i++) {
        container.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    container.closePath();
    container.fillPath();

    // Create the mask and invert it
    var geometryMask = new Phaser.Display.Masks.GeometryMask(scene, container);
    geometryMask.invertAlpha = true;

    // Apply the mask to the background image
    worldObject.setMask(geometryMask);
}

function drawPolygon(internalName, points, color = "#FF0000", fill = false, ) {
    polygon = scene.add.graphics();

    polygon.lineStyle(5, parseInt(color.slice(1), 16)); // Set stroke color and line width
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
    for (var i = 0; i < polygon.length; i++) {
      var currentVertex = polygon[i];
      var nextVertex = polygon[(i + 1) % polygon.length]; // Next vertex (considering wrap-around for last vertex)
      var edge = new Phaser.Geom.Line(currentVertex.x, currentVertex.y, nextVertex.x, nextVertex.y);
      
      

      if (isPointOnLineSegment(point, currentVertex, nextVertex)) {
        return true;
      }
    }
    
    return false;
  }
  