/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE simplified scheduler singleton based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");

class SimpleScheduler {

  constructor() {
    this.__objects = [];
    this.__times = [];

    this.__currentTime = null;
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

  __insertEngine(object, time) {
    this.__objects.push(object);
    this.__times.push(time);
  }

  __moveEngine(object, time) {
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

  __withdrawEngine(object) {
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

  __tick() {
    var i = 0;

    while (i < this.__objects.length) {
      var object = this.__objects[i];
      var time = this.__times[i];

      while (time <= audioContext.currentTime + this.lookahead) {
        var audioTime = Math.max(time, audioContext.currentTime);
        this.__currentTime = time;
        time += Math.max(object.executeNext(time, audioTime), 0);
      }

      if (time !== Infinity)
        this.__times[i++] = time;
      else
        this.__withdrawEngine(object);
    }

    this.__currentTime = null;

    if (this.__objects.length > 0) {
      this.__timeout = setTimeout(() => {
        this.__tick();
      }, this.period * 1000);
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

    this.__insertEngine(object, this.time + delay);
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

    this.__insertEngine(object, this.time + delay);
    this.__reschedule();

    return object;
  }

  /**
   * Add a time engine to the scheduler
   * @param {object} engine time engine to be added to the scheduler
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
    this.__insertEngine(engine, this.time + delay);
    this.__reschedule();
  }

  /**
   * Remove a scheduled time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (engine.scheduler !== this)
      throw new Error("object has not been added to this scheduler");

    engine.scheduler = null;
    this.__withdrawEngine(engine);
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

    var time = this.time;
    var nextTime = time + Math.max(engine.syncNext(time), 0);
    this.__moveEngine(engine, nextTime);
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

    this.__moveEngine(engine, time);
    this.__reschedule();
  }
}

module.exports = new SimpleScheduler; // export scheduler singleton