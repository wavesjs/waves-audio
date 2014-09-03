/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio event scheduler singleton based on audio time
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
   * Add a periodically repeated callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called periodically
   * @param {Number} period callback period
   * @param {Number} delay of first callback
   * @return {Object} scheduled object that can be used to call remove and reschedule
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
   * Add an event engine to the scheduler
   * @param {Object} engine event engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   */
  add(engine, delay = 0) {
    if (engine.scheduler !== null)
      throw "object has already been added to a scheduler";

    if (!engine.syncEvent)
      throw "object does not have a syncEvent method";

    if (!engine.executeEvent)
      throw "object does not have a executeEvent method";

    engine.scheduler = this;
    this.__nextTime = this.__eventQueue.insert(engine, this.time + delay);
    this.__reschedule();
  }

  /**
   * Remove event engine from the scheduler
   * @param {Object} engine event engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (engine.scheduler !== this)
      throw "object has not been added to this scheduler";

    engine.scheduler = null;
    this.__nextTime = this.__eventQueue.remove(engine);
    this.__reschedule();
  }

  /**
   * Resychronize a scheduled event engine
   * @param {Object} engine event engine to be resynchronized
   */
  resync(engine) {
    if (engine.scheduler !== this)
      throw "object has not been added to this scheduler";

    if (!engine.syncEvent)
      throw "object does not have a syncEvent method";

    this.__nextTime = this.__eventQueue.move(engine, this.time);
    this.__reschedule();
  }

  /**
   * Reschedule a scheduled event engine or callback
   * @param {Object} engine event engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  reschedule(engine, time) {
    if (engine.scheduler !== this)
      throw "object has not been added to this scheduler";

    this.__nextTime = this.__eventQueue.move(engine, time, false);
    this.__reschedule();
  }
}

module.exports = new Scheduler; // export scheduler singleton