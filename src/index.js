/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");
var PriorityQueue = require("priority-queue");
var TimeEngine = require("time-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class Scheduler {
  constructor() {
    this.__queue = new PriorityQueue();
    this.__scheduledEngines = [];

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = 0.1;
  }

  // global setTimeout scheduling loop
  __tick() {
    while (this.__nextTime <= audioContext.currentTime + this.lookahead) {
      this.__currentTime = this.__nextTime;

      var nextEngine = this.__queue.head;
      var nextEngineTime = Math.max(nextEngine.advanceTime(this.__currentTime), this.__currentTime);

      this.__nextTime = this.__queue.move(nextEngine, nextEngineTime);
    }

    this.__currentTime = null;
    this.__timeout = null;

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
   * Get scheduler time
   * @return {Number} current scheduler time including lookahead
   */
  get currentTime() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called
   * @param {Number} period callback period (default is 0 for one-shot)
   * @param {Number} delay of first callback (default is 0)
   * @return {Object} scheduled object that can be used to call remove and reset
   */
  callback(callback, period = 0, delay = 0) {
    var engine = {
      period: period || Infinity,
      advanceTime: function(time) {
        callback(time);
        return time + this.period;
      }
    };

    this.__nextTime = this.__queue.insert(engine, this.currentTime + delay);
    this.__reschedule();

    return engine;
  }

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   * @param {Function} function to get current position
   */
  add(engine, delay = 0, getCurrentPosition = null) {
    if (!engine.master) {
      if (TimeEngine.implementsScheduled(engine)) {
        this.__scheduledEngines.push(engine);

        engine.setScheduled(this, (time) => {
          this.__nextTime = this.__queue.move(engine, time);
          this.__reschedule();
        }, () => {
          return this.currentTime;
        }, getCurrentPosition);

        this.__nextTime = this.__queue.insert(engine, this.currentTime + delay);
        this.__reschedule();
      } else {
        throw new Error("object cannot be added to scheduler");
      }
    } else {
      throw new Error("object has already been added to a master");
    }
  }

  /**
   * Remove time engine from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (arrayRemove(this.__scheduledEngines, engine)) {
      engine.resetScheduled();

      this.__nextTime = this.__queue.remove(engine);
      this.__reschedule();
    } else {
      throw new Error("object has not been added to this scheduler");
    }
  }

  /**
   * Reschedule a scheduled time engine or callback
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  reset(engine, time) {
    if (engine.master === this) {
      this.__nextTime = this.__queue.move(engine, time);
      this.__reschedule();
    } else {
      throw new Error("object has not been added to this scheduler");
    }
  }
}

module.exports = new Scheduler; // export scheduler singleton