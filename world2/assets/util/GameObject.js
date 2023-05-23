class GameObject {
  constructor(key, sprite) {
    this.key = key;
    this.sprite = sprite;
    this.events = {};
  }

  getObject() {
    return {
      key: this.key,
      sprite: this.sprite,
    };
  }

  storeObject(key, sprite) {
    this.key = key;
    this.sprite = sprite;
  }

  registerEvent(eventName, handler) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(handler);
  }

  unregisterEvent(eventName, handler) {
    if (!this.events[eventName]) {
      return; // Event doesn't exist
    }

    const eventHandlers = this.events[eventName];
    const handlerIndex = eventHandlers.indexOf(handler);

    if (handlerIndex !== -1) {
      eventHandlers.splice(handlerIndex, 1);
    }
  }

  checkEvents() {
    for (let eventName in this.events) {
      let handlers = this.events[eventName];

      // Perform event checks or conditions
      if (eventName === 'princessCollision') {
        let distance = Phaser.Math.Distance.Between(player.x, player.y, this.sprite.x, this.sprite.y);
        if (distance < 10) {
          // Trigger all event handlers for the event
          handlers.forEach((handler) => handler());
        }
      }

      // Add more event checks for other events
    }
  }
}
