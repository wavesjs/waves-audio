/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");
var PriorityQueue = require("priority-queue");

class Scheduler {

  constructor() {
    this.__queue = new PriorityQueue();

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
  get time() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called
   * @param {Number} period callback period
   * @param {Number} delay of first callback
   * @return {Object} scheduled object that can be used to call remove and reschedule
   */
  callback(callback, delay = 0) {
    var object = {
      executeNext: function(time, audioTime) {
        callback(time, audioTime);
        return Infinity;
      }
    };

    this.__nextTime = this.__queue.insert(object, this.time + delay);
    this.__reschedule();

    return object;
  }

  /**
   * Add a periodically repeated callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called periodically
   * @param {Number} period callback period
   * @param {Number} delay of first callback
   * @return {Object} scheduled object that can be used to call remove and reschedule
   */
  repeat(callback, period = 1, delay = 0) {
    var object = {
      period: period,
      executeNext: function(time, audioTime) {
        callback(time, audioTime);
        return this.period;
      }
    };

    this.__nextTime = this.__queue.insert(object, this.time + delay);
    this.__reschedule();

    return object;
  }

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   */
  add(engine, delay = 0) {
    if (!engine.advanceTime)
      throw new Error("object does not have a method advanceTime");

    if (engine.timeMaster !== null)
      throw new Error("object already has a time master");

    engine.timeMaster = this;

    this.__nextTime = this.__queue.insert(engine, this.time + delay);
    this.__reschedule();
  }

  /**
   * Remove time engine from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (engine.timeMaster !== this)
      throw new Error("object has not been added to this scheduler");

    engine.timeMaster = null;
    
    this.__nextTime = this.__queue.remove(engine);
    this.__reschedule();
  }

  /**
   * Reschedule a scheduled time engine or callback
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  reset(engine, time) {
    if (engine.timeMaster !== this)
      throw new Error("object has not been added to this scheduler");

    this.__nextTime = this.__queue.move(engine, time);
    this.__reschedule();
  }
}

module.exports = new Scheduler; // export scheduler singleton