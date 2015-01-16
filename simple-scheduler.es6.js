/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE simplified scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");
var TimeEngine = require("time-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class SimpleScheduler {

  constructor() {
    this.__engines = [];

    this.__schedEngines = [];
    this.__schedTimes = [];

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

  __scheduleEngine(engine, time) {
    this.__schedEngines.push(engine);
    this.__schedTimes.push(time);
  }

  __rescheduleEngine(engine, time) {
    var index = this.__schedEngines.indexOf(engine);

    if (index >= 0) {
      if (time !== Infinity) {
        this.__schedTimes[index] = time;
      } else {
        this.__schedEngines.splice(index, 1);
        this.__schedTimes.splice(index, 1);
      }
    }
  }

  __unscheduleEngine(engine) {
    var index = this.__schedEngines.indexOf(engine);

    if (index >= 0) {
      this.__schedEngines.splice(index, 1);
      this.__schedTimes.splice(index, 1);
    }
  }

  __resetTick() {
    if (this.__schedEngines.length > 0) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  }

  __tick() {
    var i = 0;

    while (i < this.__schedEngines.length) {
      var engine = this.__schedEngines[i];
      var time = this.__schedTimes[i];

      while (time && time <= audioContext.currentTime + this.lookahead) {
        time = Math.max(time, audioContext.currentTime);
        this.__currentTime = time;
        time = engine.advanceTime(time);
      }

      if (time && time < Infinity) {
        this.__schedTimes[i++] = time;
      } else {
        this.__unscheduleEngine(engine);

        // remove engine from scheduler
        if (!time && arrayRemove(this.__engines, engine))
          TimeEngine.resetInterface(engine);
      }
    }

    this.__currentTime = null;
    this.__timeout = null;

    if (this.__schedEngines.length > 0) {
      this.__timeout = setTimeout(() => {
        this.__tick();
      }, this.period * 1000);
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
   * @param {Function} callback function(time) to be called
   * @param {Number} time of first callback (default is now)
   * @param {Number} period callback period (default is 0 for one-shot)
   * @return {Object} scheduled object that can be used to call remove and reset
   */
  callback(callbackFunction, time = this.currentTime) {
    var engineWrapper = {
      advanceTime: callbackFunction
    };

    this.__scheduleEngine(engineWrapper, time);
    this.__resetTick();

    return engineWrapper;
  }

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} time scheduling time
   */
  add(engine, time = this.currentTime, getCurrentPosition = null) {
    if (TimeEngine.implementsScheduled(engine)) {
      if (!engine.interface) {

        TimeEngine.setScheduled(engine, (time) => {
          this.__rescheduleEngine(engine, time);
          this.__resetTick();
        }, () => {
          return this.currentTime;
        }, getCurrentPosition);

        this.__engines.push(engine);

        this.__scheduleEngine(engine, time);
        this.__resetTick();

        return engine;
      } else {
        throw new Error("object has already been added to a master");
      }
    } else {
      throw new Error("object cannot be added to scheduler");
    }

    return null;
  }

  /**
   * Remove a scheduled time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (arrayRemove(this.__engines, engine)) {
      if (engine.interface)
        TimeEngine.resetInterface(engine);

      this.__unscheduleEngine(engine);
      this.__resetTick();
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
    this.__rescheduleEngine(engine, time);
    this.__resetTick();
  }

  clear() {
    if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }

    this.__schedEngines.length = 0;
    this.__schedTimes.length = 0;
  }
}

// export scheduler singleton
window.waves = window.waves || {};
module.exports = window.waves.scheduler = window.waves.scheduler || new SimpleScheduler();