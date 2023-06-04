var gameWidth = 1232;
var gameHeight = 928;
var player;
var playerSpeed = 300;
var rightHandPath = [];
var leftHandPath = [];
var polygon;
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

    
    // Create background image
    background = scene.add.image(0, 0, 'background').setOrigin(0);
    background.setDepth(-1);

    // Create foreground image
    foreground = this.add.image(gameWidth / 2, gameHeight / 2, 'foreground').setDepth(0);
    maskGraphics = this.add.graphics();
    // console.log(maskGraphics);

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

        drawPolygon(rightHandPath, getRandomVibrantColor());
        drawPolygon(leftHandPath, getRandomVibrantColor());
    
        // Calculate areas
        let leftHandArea = new Phaser.Geom.Polygon(leftHandPath).calculateArea();
        let rightHandArea = new Phaser.Geom.Polygon(rightHandPath).calculateArea();

        console.log("Right hand path area: " + Math.abs(rightHandArea));
        console.log("Left hand path area: " + Math.abs(leftHandArea));

        let area = new Phaser.Geom.Polygon(perimeter).area;
        console.log('Area of perimeter: ' + Math.abs(area));
        console.log('Assertion check: ' + (Math.abs(rightHandArea) + Math.abs(leftHandArea))+ "=" + area);

        // carves the polygon from the foreground.
        if ( rightHandArea < leftHandArea )
        {
            smallerPath = rightHandPath;
            createMask( rightHandPath, scene, foreground );
        } else {
            smallerPath = leftHandPath;
            createMask( leftHandPath, scene, foreground );
        }


        console.log("smallerPath.length = " + smallerPath.length); // Log the entire array
        console.log(smallerPath); // Log the first element        

        // new code
        // fix the perimeter
        perimeter = updatePerimeter(perimeter, smallerPath);



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

function reducePoints(points) {
    if (points.length < 2) {
      return points; // If there are less than 2 points, there's nothing to reduce.
    }
  
    // Array to store the reduced points
    let reducedPoints = [points[0]];
  
    // Determine initial direction
    let direction;
    if (points[0].x === points[1].x) {
      direction = 'y';
    } else if (points[0].y === points[1].y) {
      direction = 'x';
    }
  
    for (let i = 1; i < points.length - 1; i++) {
      let currentPoint = points[i];
      let nextPoint = points[i + 1];
  
      // Determine the current direction
      let newDirection;
      if (currentPoint.x === nextPoint.x) {
        newDirection = 'y';
      } else if (currentPoint.y === nextPoint.y) {
        newDirection = 'x';
      }
  
      // If there's a change in direction, add the current point to the reducedPoints
      if (newDirection !== direction) {
        reducedPoints.push(currentPoint);
        direction = newDirection;
      }
    }
  
    // Add the last point if it's not already added
    if (!reducedPoints.includes(points[points.length - 1])) {
      reducedPoints.push(points[points.length - 1]);
    }
  
    return reducedPoints;
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

function isPointOnLineSegment(point, lineStart, lineEnd) {
    const d1 = Phaser.Math.Distance.Between(point.x, point.y, lineStart.x, lineStart.y);
    const d2 = Phaser.Math.Distance.Between(point.x, point.y, lineEnd.x, lineEnd.y);
    const lineLength = Phaser.Math.Distance.Between(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
    
    // Use a tolerance because of possible floating-point errors
    const tolerance = 0.01;
    
    return Math.abs(d1 + d2 - lineLength) < tolerance;
}

function isPointOnPerimeter(point, perimeter) {
    for (let i = 0; i < perimeter.length - 1; i++) {
        if (isPointOnLineSegment(point, perimeter[i], perimeter[i + 1])) {
            return true;
        }
    }
    
    // check for the case where the point is on the line segment formed by the last point and the first point
    if (isPointOnLineSegment(point, perimeter[perimeter.length - 1], perimeter[0])) {
        return true;
    }
    
    return false;
}

function calculatePolygonArea(vertices) {
    let total = 0;
    
    // Print each vertex to the console
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      console.log(`Vertex ${i + 1}: x = ${vertex.x}, y = ${vertex.y}`);
    }

    for (let i = 0, l = vertices.length; i < l; i++) {
      let addX = vertices[i].x;
      let addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      let subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      let subY = vertices[i].y;
  
      total += (addX * addY - subX * subY);
    }
    console.log('total = ' + Math.abs(total) / 2);
    return Math.abs(total) / 2;
}

function drawCircles(points, diameter = 10, fillColor = 0xff0000, strokeColor = 0x000000, textColor = 0xffffff, gameWidth, gameHeight) {
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

function clearCircles() {
    circles.forEach(({ circle, tween }) => {
      circle.destroy(); // Destroy the graphics object
    });
  
    circles = []; // Clear the array
}



function destroyPolygon() {
    if (polygon) {
      polygon.destroy(); // Destroy the graphics object
      polygon = null; // Reset the polygon variable
    }
}
  

function getRightHandPath(playerPath, perimeter) {
    let rightHandPath = [];
    let returnIndex, departureIndex;

    // Find indices for departure and return points in the perimeter array
    for (let i = 0; i < perimeter.length; i++) {
        let p1 = perimeter[i];
        let p2 = perimeter[(i + 1) % perimeter.length];
        if (isPointOnLineSegment(playerPath[0], p1, p2)) {
            departureIndex = i;
            console.log(`Departure index identified: ${departureIndex}`);
        }
        if (isPointOnLineSegment(playerPath[playerPath.length - 1], p1, p2)) {
            returnIndex = i;
            console.log(`Return index identified: ${returnIndex}`);
        }
    }

    // Add the return point to the right-hand path
    rightHandPath.push(playerPath[playerPath.length-1]);

    // Traverse the perimeter starting from the return index
    let i = returnIndex;
    while (true) {
        // Get the next point on the perimeter
        let nextPoint = perimeter[(i + 1) % perimeter.length];
        if (isPointOnLineSegment(playerPath[0], perimeter[i], nextPoint)) {
            // If we reached the departure point, start adding the player path in reverse order
            console.log(`Reached departure point, start adding player path in reverse order`);
            for (let j = 0; j < playerPath.length; j++) {
                rightHandPath.push(playerPath[j]);
            }
            break;
        } else {
            // If not, continue with the next point on the perimeter
            console.log(`Adding point to right-hand path: ${JSON.stringify(nextPoint)}`);
            rightHandPath.push(nextPoint);
        }
        i = (i + 1) % perimeter.length;
    }

    return rightHandPath;
}


function getLeftHandPath(playerPath, perimeter) {
    let leftHandPath = [];
    let returnIndex, departureIndex;

    // Find indices for departure and return points in the perimeter array
    for (let i = 0; i < perimeter.length; i++) {
        let p1 = perimeter[i];
        let p2 = perimeter[(i - 1 + perimeter.length) % perimeter.length]; // Moved to the previous point
        if (isPointOnLineSegment(playerPath[0], p1, p2)) {
            departureIndex = i;
            console.log(`Departure index identified: ${departureIndex}`);
        }
        if (isPointOnLineSegment(playerPath[playerPath.length - 1], p1, p2)) {
            returnIndex = i;
            console.log(`Return index identified: ${returnIndex}`);
        }
    }

    // Add the return point to the left-hand path
    leftHandPath.push(playerPath[playerPath.length-1]);

    // Traverse the perimeter starting from the return index
    let i = returnIndex;
    while (true) {
        // Get the previous point on the perimeter
        let prevPoint = perimeter[(i - 1 + perimeter.length) % perimeter.length]; // Moved to the previous point
        if (isPointOnLineSegment(playerPath[0], perimeter[i], prevPoint)) {
            // If we reached the departure point, start adding the player path in the given order
            console.log(`Reached departure point, start adding player path in order`);
            for (let j = 0; j < playerPath.length; j++) {
                leftHandPath.push(playerPath[j]);
            }
            break;
        } else {
            // If not, continue with the previous point on the perimeter
            console.log(`Adding point to left-hand path: ${JSON.stringify(prevPoint)}`);
            leftHandPath.push(prevPoint);
        }
        i = (i - 1 + perimeter.length) % perimeter.length; // Moved to the previous point
    }

    return leftHandPath;
}


function getRandomVibrantColor() {
    var letters = "0123456789ABCDEF";
    var color = "";
  
    // Generate a random color by selecting six random hexadecimal values
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  
    // Check the luminance of the color
    var luminance = calculateLuminance(color);
  
    // If the luminance is too low, generate a new color until a vibrant one is obtained
    while (luminance < 0.3) {
      color = "";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      luminance = calculateLuminance(color);
    }
  
    // Return the generated color
    return "#" + color;
  }
  
  // Function to calculate the luminance of a color
  function calculateLuminance(hex) {
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
  
    // Calculate the relative luminance using the sRGB color space formula
    var luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
    return luminance;
  }
  
function createMask( polygonPoints, scene, worldObject ) {
    // Create the geometry mask using the polygon
    var mask = scene.make.graphics({x: 0, y: 0, add: false});
    mask.fillStyle(0xffffff);
    mask.beginPath();
    mask.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (var i = 1; i < polygonPoints.length; i++) {
        mask.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    mask.closePath();
    mask.fillPath();

    // Create the mask and invert it
    var geometryMask = new Phaser.Display.Masks.GeometryMask(scene, mask);
    geometryMask.invertAlpha = true;

    // Apply the mask to the background image
    worldObject.setMask(geometryMask);
}

function drawPolygon(points, color = "#FF0000", fill = false) {
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

    return polygon;
}

function updatePerimeter(perimeter, smallerPath) {
    let newPerimeter = [];
    let addFromPerimeter = true;

    for (let point of perimeter) {
        if (addFromPerimeter) {
            newPerimeter.push(point);

            if (pointEquals(point, smallerPath[0])) {
                addFromPerimeter = false;
                for (let innerPoint of smallerPath.slice(1)) {
                    newPerimeter.push(innerPoint);
                }
            }
        } else if (pointEquals(point, smallerPath[smallerPath.length - 1])) {
            addFromPerimeter = true;
        }
    }
    return newPerimeter;
}

function pointEquals(pointA, pointB) {
    return pointA.x === pointB.x && pointA.y === pointB.y;
}
