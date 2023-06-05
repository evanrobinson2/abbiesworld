// note there's a bug in this, if the departure and return are on the same line then the smaller path is always returned
// @TODO: fix this so that if the departure and return points are on the same segment, we select the closer of the next perimeter point or the departure point
//        but only return the departure point if it's in between the player's point and the perimeter
function getRightHandPath(playerPath, perimeter) {
    let rightHandPath = [];
    let returnIndex, departureIndex;

    // Find indices for departure and return points in the perimeter array
    for (let i = 0; i < perimeter.length; i++) {
        let p1 = perimeter[i];
        let p2 = perimeter[(i + 1) % perimeter.length];
        if (isPointOnLineSegment(playerPath[0], p1, p2)) {
            departureIndex = i;
            // console.log(`Departure index identified: ${departureIndex}`);
        }
        if (isPointOnLineSegment(playerPath[playerPath.length - 1], p1, p2)) {
            returnIndex = i;
            // console.log(`Return index identified: ${returnIndex}`);
        }
    }
    
    // Add the return point to the right-hand path
    rightHandPath.push(playerPath[playerPath.length-1]);

    // Traverse the perimeter starting from the return index
    let i = returnIndex;
    

    // handle the special case where the departure and return points are on the same line and the next point along the right hand
    // path is actually the departure point
    if (isPointOnLineSegment(playerPath[0], playerPath[playerPath.length-1], perimeter[(i + 1) % perimeter.length])) {
        console.log("We hit the special case for right hand path calculation.");
        for (let j = 0; j < playerPath.length; j++) {
            rightHandPath.push(playerPath[j]);
        }
        return rightHandPath;
    }

    let firstIteration = true; // added in case the starting and ending point are on the same line and the ending point is to the LEFT of the starting point. This is because the code below doesn't account properly for this case and because it's handled explicitly above
    while (true) {
        // Get the next point on the perimeter
        let nextPoint = perimeter[(i + 1) % perimeter.length];
        console.log("firstIteration = " + firstIteration);
        if (isPointOnLineSegment(playerPath[0], perimeter[i], nextPoint) && !firstIteration) {
            // If we reached the departure point, start adding the player path in order
            console.log("Departure Point Reached at i = " + i)
            for (let j = 0; j < playerPath.length; j++) {
                rightHandPath.push(playerPath[j]);
            }
            break;
        } else {
            // If not, continue with the next point on the perimeter
            // console.log(`Adding point to right-hand path: ${JSON.stringify(nextPoint)}`);
            rightHandPath.push(nextPoint);
            console.log('Pushing perimeter point i = ' + i + "(" + nextPoint.x + ", " + nextPoint.y + ")");
        }
        i = (i + 1) % perimeter.length;
        firstIteration = false;
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
            // console.log(`Departure index identified: ${departureIndex}`);
        }
        if (isPointOnLineSegment(playerPath[playerPath.length - 1], p1, p2)) {
            returnIndex = i;
            // console.log(`Return index identified: ${returnIndex}`);
        }
    }

    // Add the return point to the left-hand path
    leftHandPath.push(playerPath[playerPath.length-1]);

    // Traverse the perimeter starting from the return index
    let i = returnIndex;

    // handle the special case where the departure and return points are on the same line and the next point along the right hand
    // path is actually the departure point
    console.log("i = " + i)
    console.log(playerPath[playerPath.length-1]);
    console.log(perimeter[i]);

    if (isPointOnLineSegment(playerPath[0], playerPath[playerPath.length-1], perimeter[(i - 1 + perimeter.length) % perimeter.length])) {
        console.log("We hit the special case for left hand path calculation.");
        for (let j = 0; j < playerPath.length; j++) {
            leftHandPath.push(playerPath[j]);
        }
        return leftHandPath;
    }

    let firstIteration = true;
    while (true) {
        // Get the previous point on the perimeter
        let prevPoint = perimeter[(i - 1 + perimeter.length) % perimeter.length]; // Moved to the previous point
        if (isPointOnLineSegment(playerPath[0], perimeter[i], prevPoint) && !firstIteration) {
            // If we reached the departure point, start adding the player path in the given order
            // console.log(`Reached departure point, start adding player path in order`);
            for (let j = 0; j < playerPath.length; j++) {
                leftHandPath.push(playerPath[j]);
            }
            break;
        } else {
            // If not, continue with the previous point on the perimeter
            // console.log(`Adding point to left-hand path: ${JSON.stringify(prevPoint)}`);
            leftHandPath.push(prevPoint);
        }
        i = (i - 1 + perimeter.length) % perimeter.length; // Moved to the previous point
        firstIteration = false;
    }

    return leftHandPath;
}
