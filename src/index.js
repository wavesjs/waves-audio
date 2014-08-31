/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio global event scheduler based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 * @version 5.1.0
 */
'use strict';

var audioContext = require("audio-context");
var EventQueue = require("event-queue");

class SimpleScheduler {

  constructor() {
    this.__objects = [];
    this.__times = [];

    this.__eventTime = null;
    this.__timeout = null;

    this.period = 0.025;
    this.advance = 0.1; // how far ahead to schedule events (> period)

    return this;
  }

  /* Insert an event to the queue */
  __insertEvent(object, time) {
    this.__objects.push(object);
    this.__times.push(time);
  }

  /* move an event */
  __moveEvent(object, time) {
    var index = this.__objects.indexOf(object);

    if (index >= 0) {
      if (time !== Infinity) {
        this.__times[index] = time;
      } else {
        this.__objects.splice(index, 1);
        this.__times.splice(index, 1);
      }
    }
  }

  /* Withdraw an event from the event list */
  __removeEvent(object) {
    var index = this.__objects.indexOf(object);

    if (index >= 0) {
      this.__objects.splice(index, 1);
      this.__times.splice(index, 1);
    }
  }

  __reschedule() {
    if (this.__objects.length > 0) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  }

  // global setTimeout scheduling loop
  __tick() {
    this.__looping = true;

    for (var i = 0; i < this.__objects.length; i++) {
      var object = this.__objects[i];
      var time = this.__times[i];

      while (time <= audioContext.currentTime + this.advance) {
        this.__eventTime = time;

        var audioTime = Math.max(time, audioContext.currentTime);
        var nextEventDelay = Math.max(object.executeEvent(time, audioTime), 0);

        if (nextEventDelay !== Infinity) {
          if (!this.reverse)
            time += nextEventDelay;
          else
            time -= nextEventDelay;

          this.__times[i] = time;
        } else {
          this.__removeEvent(object);
          i--;
        }
      }
    }

    this.__eventTime = null;

    if (this.__objects.length > 0) {
      this.__timeout = setTimeout(() => {
        this.__tick();
      }, this.period * 1000);
    }
  }

  /**
   * Get global scheduler time
   */
  get time() {
    return this.__eventTime || audioContext.currentTime + this.advance;
  }

  /**
   * Add a callback to the global scheduler at given time
   */
  callback(callback, delay = 0) {
    var object = {
      executeEvent: function(time, audioTime) {
        callback(time, audioTime);
        return Infinity;
      }
    };

    this.__insertEvent(object, this.time + delay);
    this.__reschedule();

    return object;
  }

  /**
   * Add event engine to the global scheduler
   */
  add(engine, delay = 0) {
    if (engine.syncEvent && engine.executeEvent) {
      if (engine.scheduler === null) {
        this.__nextTime = this.__insertEvent(engine, this.time + delay);

        engine.scheduler = this;

        this.__reschedule();
      }
    }
  }

  /**
   * Remove event (engine) from the global scheduler
   */
  remove(engine) {
    if (engine.scheduler === this) {
      this.__removeEvent(engine);

      engine.scheduler = null;

      this.__reschedule();
    }
  }

  /**
   * Resychronize event engine
   * (called by event engine)
   */
  resync(engine) {
    if (engine.scheduler === this) {
      var time = this.time;
      var nextEventTime = time + Math.max(engine.syncEvent(time), 0);

      this.__moveEvent(engine, nextEventTime);
      this.__reschedule();
    }
  }

  /**
   * Reschedule event engine
   * (called by event engine)
   */
  reschedule(engine, time) {
    if (engine.scheduler === this) {
      this.__moveEvent(engine, time);
      this.__reschedule();
    }
  }
}

module.exports = new SimpleScheduler; // export global scheduler singleton