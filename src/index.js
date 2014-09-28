/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE simplified scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");
var TimeEngine = require("time-engine");

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
        time += Math.max(object.advanceTime(time, audioTime), 0);
      }

      if (time !== Infinity)
        this.__times[i++] = time;
      else
        this.__withdrawEngine(object);
    }

    this.__currentTime = null;
    this.__timeout = null;

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
  callback(callback, delay = 0, period = 0) {
    var engine = {
      period: period || Infinity,
      advanceTime: function(time) {
        callback(time);
        return time + this.period;
      }
    };

    this.__insertEngine(engine, this.currentTime + delay);
    this.__reschedule();

    return engine;
  }

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   */
  add(engine, delay = 0, getCurrentPosition = null) {
    if (!engine.interface) {
      if (TimeEngine.implementsScheduled(engine)) {

        engine.setScheduled((time) => {
          this.__nextTime = this.__queue.move(engine, time);
          this.__reschedule();
        }, () => {
          return this.currentTime;
        }, getCurrentPosition);

        this.__insertEngine(engine, this.currentTime + delay);
        this.__reschedule();
      } else {
        throw new Error("object cannot be added to scheduler");
      }
    } else {
      throw new Error("object has already been added to a master");
    }
  }

  /**
   * Remove a scheduled time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  remove(engine) {
    if (this.__objects.indexOf(engine) >= 0) {
      engine.resetInterface();
      this.__withdrawEngine(engine);
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
    this.__moveEngine(engine, time);
    this.__reschedule();
  }
}

module.exports = new SimpleScheduler; // export scheduler singleton