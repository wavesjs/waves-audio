'use strict';

var defaultAudioContext = require("../core/audio-context");
var TimeEngine = require("../core/time-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class SimpleScheduler {
  constructor(options = {}) {
    this.audioContext = options.audioContext ||  defaultAudioContext;

    this.__engines = [];

    this.__schedEngines = [];
    this.__schedTimes = [];

    this.__currentTime = null;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = options.lookahead || 0.1;
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
      if (!this.__timeout) {
        console.log("SimpleScheduler Start");
        this.__tick();
      }
    } else if (this.__timeout) {
      console.log("SimpleScheduler Stop");
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  }

  __tick() {
    var audioContext = this.audioContext;
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
        if (!time) {
          engine.master = null;
          arrayRemove(this.__engines, engine);
        }
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

  get currentTime() {
    return this.__currentTime || this.audioContext.currentTime + this.lookahead;
  }

  get currentPosition() {
    return undefined;
  }

  add(engineOrFunction, time = this.currentTime, getCurrentPosition = null) {
    var engine = engineOrFunction;

    if (engineOrFunction instanceof Function)
      engine = {
        advanceTime: engineOrFunction
      };
    else if (!engineOrFunction.implementsScheduled())
      throw new Error("object cannot be added to scheduler");
    else if (engineOrFunction.master)
      throw new Error("object has already been added to a master");

    // set master and add to array
    engine.master = this;
    this.__engines.push(engine);

    // schedule engine
    this.__scheduleEngine(engine, time);
    this.__resetTick();

    return engine;
  }

  remove(engine) {
    if (!engine.master || engine.master !== this)
      throw new Error("engine has not been added to this scheduler");

    // reset master and remove from array
    engine.master = null;
    arrayRemove(this.__engines, engine);

    // unschedule engine
    this.__unscheduleEngine(engine);
    this.__resetTick();
  }

  resetEngineTime(engine, time = this.currentTime) {
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
module.exports = SimpleScheduler;