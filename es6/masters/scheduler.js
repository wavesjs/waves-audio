'use strict';

var defaultAudioContext = require("../core/audio-context");
var TimeEngine = require("../core/time-engine");
var PriorityQueue = require("../utils/priority-queue");
var SchedulingQueue = require("../utils/scheduling-queue");

class Scheduler extends SchedulingQueue {
  constructor(options = {}) {
    super();

    this.audioContext = options.audioContext ||  defaultAudioContext;

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = options.period ||  0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = options.lookahead ||  0.1;
  }

  // setTimeout scheduling loop
  __tick() {
    var audioContext = this.audioContext;
    var time = this.__nextTime;

    this.__timeout = null;

    while (time <= audioContext.currentTime + this.lookahead) {
      this.__currentTime = time;
      time = this.advanceTime(time);
    }

    this.__currentTime = null;
    this.resetTime(time);
  }

  resetTime(time = this.currentTime) {
    if (this.master) {
      this.master.reset(this, time);
    } else {
      if (this.__timeout) {
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }

      if (time !== Infinity) {
        if (this.__nextTime === Infinity)
          console.log("Scheduler Start");

        var timeOutDelay = Math.max((time - this.audioContext.currentTime - this.lookahead), this.period);

        this.__timeout = setTimeout(() => {
          this.__tick();
        }, timeOutDelay * 1000);
      } else if (this.__nextTime !== Infinity) {
        console.log("Scheduler Stop");
      }

      this.__nextTime = time;
    }
  }

  get currentTime() {
    if (this.master)
      return this.master.currentTime;

    return this.__currentTime || this.audioContext.currentTime + this.lookahead;
  }

  get currentPosition() {
    var master = this.master;

    if (master && master.currentPosition !== undefined)
      return master.currentPosition;

    return undefined;
  }

  // add a time engine to the queue and return the engine
  add(engineOrFunction, time = this.currentTime) {
    var engine;

    if (engineOrFunction instanceof Function) {
      // construct minimal scheduled engine
      engine = {
        advanceTime: engineOrFunction
      };
    } else {
      engine = engineOrFunction;

      if (!engine.implementsScheduled())
        throw new Error("object cannot be added to scheduler");

      if (engine.master)
        throw new Error("object has already been added to a master");
    }

    super.add(engine, time);
  }

  remove(engine) {
    if (engine.master !== this)
      throw new Error("object has not been added to this scheduler");

    super.remove(engine);
  }

  resetEngineTime(engine, time = this.currentTime) {
    if (engine.master !== this)
      throw new Error("object has not been added to this scheduler");

    super.resetEngineTime(engine, time);
  }
}

module.exports = Scheduler;