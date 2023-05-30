var gameWidth = 1232;
var gameHeight = 928;

// Phaser game configuration
var config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    scene: {
        create: create,
        preload: preload
    }
};

// Create the game with the configuration
var game = new Phaser.Game(config);

function preload () {
    this.load.image('background', 'images/background.png');
    this.load.image('prize', 'images/prize.png');
}

function create() {

    
    // Load an image to use as the background
    var prize = this.add.image(gameWidth/2, gameHeight/2, 'prize');
    var bg = this.add.image(gameWidth/2, gameHeight/2, 'background');

    // Define the polygon points
    var polygonPoints = [
        new Phaser.Geom.Point(50, 50),
        new Phaser.Geom.Point(600, 50),
        new Phaser.Geom.Point(600, 550),
        new Phaser.Geom.Point(50, 550)
    ];

    // Create the polygon
    var polygon = new Phaser.Geom.Polygon(polygonPoints);

    // Create the geometry mask using the polygon
    var mask = this.make.graphics({x: 0, y: 0, add: false});
    mask.fillStyle(0xffffff);
    mask.beginPath();
    mask.moveTo(polygonPoints[0].x, polygonPoints[0].y);
    for (var i = 1; i < polygonPoints.length; i++) {
        mask.lineTo(polygonPoints[i].x, polygonPoints[i].y);
    }
    mask.closePath();
    mask.fillPath();

    // Create the mask and invert it
    var geometryMask = new Phaser.Display.Masks.GeometryMask(this, mask);
    geometryMask.invertAlpha = true;

    // Apply the mask to the background image
    bg.setMask(geometryMask);
}
