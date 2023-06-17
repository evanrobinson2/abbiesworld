class TextOverlayCoordinator {
  constructor(scene, defaultDepth = 3) {
    this.scene = scene;
    this.overlays = [];
    this.defaultDepth = defaultDepth;
    this.currentStyle = {}; // Store the current style
    this.currentFont = ""; // Store the current font
  }

  // Set the current text style
  setStyle(style) {
    this.currentStyle = style;
  }

  // Remove a specific text style property
  removeStyle(property) {
    delete this.currentStyle[property];
  }

  // Set the current font
  setFont(font) {
    this.currentFont = font;
  }

  // This function adds a new overlay to the scene with the current style and font settings
  addText(x, y, text, lifetime = -1, name = "") {
    const textObject = this.scene.add.text(x, y, text, {
      ...this.currentStyle,
      fontFamily: this.currentFont
    });
    textObject.setDepth(this.defaultDepth);

    if (name === "") {
      name = this.overlays.length;
    }

    const overlay = {
      textObject: textObject,
      creationTime: this.scene.time.now,
      lifetime: lifetime,
      name: name
    };

    this.overlays.push(overlay);
    return textObject;
  }
    
  addTypewriterText(x, y, text, style = {}, speed = 50, lifetime = -1, name = "") {
      const textObject = this.scene.add.text(x, y, "", style);
      textObject.setDepth(this.defaultDepth);
  
      if (name === "") {
        name = this.overlays.length;
      }
  
      const overlay = {
        textObject: textObject,
        creationTime: this.scene.time.now,
        lifetime: lifetime,
        name: name
      };
  
      this.overlays.push(overlay);
  
      const letters = text.split('');
      let currentIndex = 0;
  
      const typingAnimation = this.scene.time.addEvent({
        delay: speed,
        callback: () => {
          if (currentIndex < letters.length) {
            const newText = text.substring(0, currentIndex + 1);
            textObject.setText(newText);
            currentIndex++;
          } else {
            typingAnimation.destroy(); // Stop the animation when all letters are displayed
          }
        },
        callbackScope: this,
        loop: true
      });
  
      return textObject;
  }

  // This function updates the overlays, removing those that have exceeded their lifetime
  update() {
        const currentTime = this.scene.time.now;

        this.overlays = this.overlays.filter(overlay => {
            if (overlay.lifetime >= 0 && currentTime - overlay.creationTime > overlay.lifetime) {
                overlay.textObject.destroy();
                return false;
            }

            return true;
        });
  }

  // This function removes all overlays
  clear() {
        for (const overlay of this.overlays) {
            overlay.textObject.destroy();
        }

        this.overlays = [];
  }
}

export default TextOverlayCoordinator;