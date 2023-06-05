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

  function getClosestPointOnPerimeter(point, perimeter) {
    var closestDistance = Infinity;
    var closestPoint = null;
  
    for (var i = 0; i < perimeter.length; i++) {
      var currentPoint = perimeter[i];
      var nextPoint = perimeter[(i + 1) % perimeter.length];
  
      var closestPointOnSegment = getClosestPointOnLineSegment(point, currentPoint, nextPoint);
      var distance = Phaser.Math.Distance.Between(point.x, point.y, closestPointOnSegment.x, closestPointOnSegment.y);
  
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = closestPointOnSegment;
      }
    }
  
    return closestPoint;
  }
  
  function getClosestPointOnLineSegment(point, lineStart, lineEnd) {
    var lineVector = new Phaser.Math.Vector2(lineEnd.x - lineStart.x, lineEnd.y - lineStart.y);
    var pointVector = new Phaser.Math.Vector2(point.x - lineStart.x, point.y - lineStart.y);
  
    var lineLengthSquared = lineVector.lengthSq();
    var dotProduct = lineVector.x * pointVector.x + lineVector.y * pointVector.y;

    var t = Phaser.Math.Clamp(dotProduct / lineLengthSquared, 0, 1);
  
    var closestPointX = lineStart.x + lineVector.x * t;
    var closestPointY = lineStart.y + lineVector.y * t;
  
    return new Phaser.Math.Vector2(closestPointX, closestPointY);
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
