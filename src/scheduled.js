
"use strict";

class Scheduled {

  constructor(parent) {
    this.parent = parent;
    // written by scheduler only others read
    this.scheduler = null;
  }

  // to be implemented by instance
  reset(time) {
    return Infinity;
  }

  // to be implemented by instance
  execute(time) {
    return Infinity;
  }

  reschedule(time) {
    this.scheduler.reschedule(this, time);
  }

  get time() {
    return this.scheduler.time;
  }
}

module.exports = Scheduled;