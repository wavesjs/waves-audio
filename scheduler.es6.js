/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time (time-engine master)
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
    this.__engines = [];

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

  // setTimeout scheduling loop
  __tick() {
    var nextTime = this.__nextTime;

    this.__timeout = null;

    while (nextTime <= audioContext.currentTime + this.lookahead) {
      this.__currentTime = nextTime;

      var nextEngine = this.__queue.head;
      var nextEngineTime = Math.max(nextEngine.advanceTime(this.__currentTime), this.__currentTime);

      nextTime = this.__queue.move(nextEngine, nextEngineTime);
    }

    this.__currentTime = null;

    this.__reschedule(nextTime);
  }

  __reschedule(nextTime) {
    if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }

    if (nextTime !== Infinity) {
      this.__nextTime = nextTime;

      var timeOutDelay = Math.max((nextTime - audioContext.currentTime - this.lookahead), this.period);

      this.__timeout = setTimeout(() => {
        this.__tick();
      }, timeOutDelay * 1000);
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
   * @param {Number} delay of first callback (default is 0)
   * @param {Number} period callback period (default is 0 for one-shot)
   * @return {Object} scheduled object that can be used to call remove and reset
   */
  callback(callbackFunction, delay = 0, period = 0) {
    var engine = {
      period: period || Infinity,
      advanceTime: function(time) {
        callbackFunction(time);
        return time + this.period;
      }
    };

    var nextTime = this.__queue.insert(engine, this.currentTime + delay);
    this.__reschedule(nextTime);

    return engine;
  }

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   * @param {Function} function to get current position
   */
  add(engine, delay = 0, getCurrentPosition = null) {
    if (!engine.interface) {
      if (TimeEngine.implementsScheduled(engine)) {
        this.__engines.push(engine);

        TimeEngine.setScheduled(engine, (time) => {
          var nextTime = this.__queue.move(engine, time);
          this.__reschedule(nextTime);
        }, () => {
          return this.currentTime;
        }, getCurrentPosition);

        var nextTime = this.__queue.insert(engine, this.currentTime + delay);
        this.__reschedule(nextTime);
      } else {
        throw new Error("object cannot be added to scheduler");
      }
    } else {
      throw new Error("object has already been added to a master");
    }

    return engine;
  }

  /**
   * Remove time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (arrayRemove(this.__engines, engine)) {
      TimeEngine.resetInterface(engine);

      var nextTime = this.__queue.remove(engine);
      this.__reschedule(nextTime);
    } else {
      throw new Error("object has not been added to this scheduler");
    }
  }

  /**
   * Reschedule a scheduled time engine or callback at a given time
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  reset(engine, time) {
    var nextTime = this.__queue.move(engine, time);
    this.__reschedule(nextTime);
  }
}

// export scheduler singleton
module.exports = new Scheduler();