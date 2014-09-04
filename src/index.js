/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");
var TimeEngineQueue = require("time-engine-queue");

class Scheduler {

  constructor() {
    this.__engineQueue = new TimeEngineQueue();

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
      this.__nextTime = this.__engineQueue.execute(this.__nextTime, this.__nextTime);
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

    this.__nextTime = this.__engineQueue.insert(object, this.time + delay, false);
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

    this.__nextTime = this.__engineQueue.insert(object, this.time + delay, false);
    this.__reschedule();

    return object;
  }

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   */
  add(engine, delay = 0) {
    if (engine.scheduler !== null)
      throw new Error("object has already been added to a scheduler");

    if (!engine.syncNext)
      throw new Error("object does not have a syncNext method");

    if (!engine.executeNext)
      throw new Error("object does not have a executeNext method");

    engine.scheduler = this;
    this.__nextTime = this.__engineQueue.insert(engine, this.time + delay);
    this.__reschedule();
  }

  /**
   * Remove time engine from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (engine.scheduler !== this)
      throw new Error("object has not been added to this scheduler");

    engine.scheduler = null;
    this.__nextTime = this.__engineQueue.remove(engine);
    this.__reschedule();
  }

  /**
   * Resychronize a scheduled time engine
   * @param {Object} engine time engine to be resynchronized
   */
  resync(engine) {
    if (engine.scheduler !== this)
      throw new Error("object has not been added to this scheduler");

    if (!engine.syncNext)
      throw new Error("object does not have a syncNext method");

    this.__nextTime = this.__engineQueue.move(engine, this.time);
    this.__reschedule();
  }

  /**
   * Reschedule a scheduled time engine or callback
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  reschedule(engine, time) {
    if (engine.scheduler !== this)
      throw new Error("object has not been added to this scheduler");

    this.__nextTime = this.__engineQueue.move(engine, time, false);
    this.__reschedule();
  }
}

module.exports = new Scheduler; // export scheduler singleton