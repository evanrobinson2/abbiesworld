export function updateShipVelocity(ship, keyA, keyD, keyW, keyS, keySpace) {
    if (keyA.isDown) {
      // Rotate the ship counter-clockwise by 15 degrees per update
      ship.rotation -= Phaser.Math.DegToRad(15);
    } else if (keyD.isDown) {
      // Rotate the ship clockwise by 15 degrees per update
      ship.rotation += Phaser.Math.DegToRad(15);
    }
  
    if (keyW.isDown) {
      // Calculate the velocity vector based on the ship's rotation
      const velocityX = Math.cos(ship.rotation - Phaser.Math.DegToRad(25));
      const velocityY = Math.sin(ship.rotation - Phaser.Math.DegToRad(25));
      ship.body.velocity.x += velocityX;
      ship.body.velocity.y += velocityY;
    } else if (keyS.isDown) {
      // Calculate the velocity vector based on the ship's rotation
      const velocityX = Math.cos(ship.rotation - Phaser.Math.DegToRad(25));
      const velocityY = Math.sin(ship.rotation - Phaser.Math.DegToRad(25));
      ship.body.velocity.x -= velocityX;
      ship.body.velocity.y -= velocityY;
    }
  
    if (keySpace.isDown) {
      // Reduce velocity by 5 units per update while spacebar is held down
      ship.body.velocity.x -= 5;
      if (ship.body.velocity.x < 0) ship.body.velocity.x = 0;
      ship.body.velocity.y -= 5;
      if (ship.body.velocity.y < 0) ship.body.velocity.y = 0;
    }
  }
  
export function updateShipRotation(ship, keyQ, keyE) {
    if (keyQ.isDown) {
        ship.rotation -= Phaser.Math.DegToRad(1.5);
    } else if (keyE.isDown) {
        ship.rotation += Phaser.Math.DegToRad(1.5);
    }
}

export function updateShipScale(ship, keyDown, keyUp) {
    if (keyDown.isDown) {
        ship.setScale(ship.scaleX - 0.05, ship.scaleY - 0.05);
    } else if (keyUp.isDown) {
        ship.setScale(ship.scaleX + 0.05, ship.scaleY + 0.05);
    }
}

  