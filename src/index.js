/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio global event scheduler based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 * @version 5.1.0
 */
'use strict';

var audioContext = require("audio-context");
var EventQueue = require("event-queue");

class Scheduler {

  constructor() {
    this.__eventQueue = new EventQueue();

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    this.period = 0.025;
    this.advance = 0.1; // how far ahead to schedule events (> period)
  }

  // global setTimeout scheduling loop
  __tick() {
    while (this.__nextTime <= audioContext.currentTime + this.advance) {
      this.__currentTime = this.__nextTime;
      this.__nextTime = this.__eventQueue.advance(this.__nextTime, this.__nextTime);
    }

    this.__currentTime = null;

    if (this.__nextTime !== Infinity) {
      this.__timeout = setTimeout(() => {
        this.__tick();
      }, this.period * 1000);
    }
  }

  __reschedule(time) {
    if (this.__nextTime !== Infinity) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  }

  /**
   * Get global scheduler time
   */
  get time() {
    return this.__currentTime || audioContext.currentTime + this.advance;
  }

  /**
   * Add a callback to the global scheduler
   */
  callback(callback, delay = 0) {
    var object = {
      executeEvent: function(time, audioTime) {
        callback(time, audioTime);
        return Infinity;
      }
    };

    this.__nextTime = this.__eventQueue.insert(object, this.time + delay, false);
    this.__reschedule();

    return object;
  }

  /**
   * Add a repeated callback to the global scheduler
   */
  repeat(callback, period = 1, delay = 0) {
    var object = {
      period: period,
      executeEvent: function(time, audioTime) {
        callback(time, audioTime);
        return this.period;
      }
    };

    this.__nextTime = this.__eventQueue.insert(object, this.time + delay, false);
    this.__reschedule();

    return object;
  }

  /**
   * Add event engine to the global scheduler
   */
  add(engine, delay = 0) {
    if (engine.scheduler === null) {
      engine.scheduler = this;
      this.__nextTime = this.__eventQueue.insert(engine, this.time + delay);
      this.__reschedule();
    }
  }

  /**
   * Remove event (engine) from the global scheduler
   */
  remove(engine) {
    if (engine.scheduler === this) {
      engine.scheduler = null;
      this.__nextTime = this.__eventQueue.remove(engine);
      this.__reschedule();
    }
  }

  /**
   * Resychronize event engine
   * (called by event engine)
   */
  resync(engine) {
    if (engine.scheduler === this) {
      this.__nextTime = this.__eventQueue.move(engine, this.time);
      this.__reschedule();
    }
  }

  /**
   * Reschedule event engine
   * (called by event engine)
   */
  reschedule(engine, time) {
    if (engine.scheduler === this) {
      this.__nextTime = this.__eventQueue.move(engine, time, false);
      this.__reschedule();
    }
  }
}

module.exports = new Scheduler; // export global scheduler singleton