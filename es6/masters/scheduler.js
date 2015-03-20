/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var PriorityQueue = require("../utils/priority-queue");
var TimeEngine = require("../core/time-engine");
var defaultAudioContext = require("../core/audio-context");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class Scheduler {
  constructor(options = {}) {
    this.audioContext = options.audioContext || defaultAudioContext;

    this.__queue = new PriorityQueue();
    this.__engines = [];

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = options.lookahead || 0.1;
  }

  // setTimeout scheduling loop
  __tick() {
    var audioContext = this.audioContext;
    var nextTime = this.__nextTime;

    this.__timeout = null;

    while (nextTime <= audioContext.currentTime + this.lookahead) {
      this.__currentTime = nextTime;

      var engine = this.__queue.head;
      var time = engine.advanceTime(this.__currentTime);

      if (time && time < Infinity) {
        nextTime = this.__queue.move(engine, Math.max(time, this.__currentTime));
      } else {
        nextTime = this.__queue.remove(engine);

        // remove time engine from scheduler if advanceTime returns null/undfined
        if (!time && engine.master === this)
          engine.resetInterface();
      }
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

      var timeOutDelay = Math.max((nextTime - this.audioContext.currentTime - this.lookahead), this.period);

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
    return this.__currentTime || this.audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a time engine or a simple callback function to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} time scheduling time
   * @param {Function} function to get current position
   * @return handle to the scheduled engine (use for calling further methods)
   */
  add(engine, time = this.currentTime, getCurrentPosition = null) {
    if (engine instanceof Function) {
      // construct minimal scheduled time engine
      engine = {
        advanceTime: engine
      };
    } else {
      if (!engine.implementsScheduled())
        throw new Error("object cannot be added to scheduler");

      if (engine.master)
        throw new Error("object has already been added to a master");

      // register engine
      this.__engines.push(engine);

      // set scheduled interface
      engine.setScheduled(this, (time) => {
        var nextTime = this.__queue.move(engine, time);
        this.__reschedule(nextTime);
      }, () => {
        return this.currentTime;
      }, getCurrentPosition);
    }

    // schedule engine or callback
    var nextTime = this.__queue.insert(engine, time);
    this.__reschedule(nextTime);

    return engine;
  }

  /**
   * Remove a time engine from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    var master = engine.master;

    if (master) {
      if (master !== this)
        throw new Error("object has not been added to this scheduler");

      engine.resetInterface();
      arrayRemove(this.__engines, engine);
    }

    var nextTime = this.__queue.remove(engine);
    this.__reschedule(nextTime);
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

  /**
   * Remove all schdeduled callbacks and engines from the scheduler
   */
  clear() {
    if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }

    this.__queue.clear();
    this.__engines.length = 0;
  }
}

module.exports = Scheduler;