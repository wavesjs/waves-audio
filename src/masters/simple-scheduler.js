import debug from 'debug';
import defaultAudioContext from '../core/audio-context';
import TimeEngine from '../core/time-engine';

const log = debug('wavesjs:audio');

export default class SimpleScheduler {
  constructor(options = {}) {
    this.audioContext = options.audioContext ||  defaultAudioContext;

    this.__engines = new Set();

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
    } else if (time < Infinity) {
      this.__schedEngines.push(engine);
      this.__schedTimes.push(time);
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
        log('SimpleScheduler Start');
        this.__tick();
      }
    } else if (this.__timeout) {
      log('SimpleScheduler Stop');
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  }

  __tick() {
    var audioContext = this.audioContext;
    var currentTime = audioContext.currentTime;
    var i = 0;

    while (i < this.__schedEngines.length) {
      var engine = this.__schedEngines[i];
      var time = this.__schedTimes[i];

      while (time && time <= currentTime + this.lookahead) {
        time = Math.max(time, currentTime);
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
          this.__engines.delete(engine);
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

  // call a function at a given time
  defer(fun, time = this.currentTime) {
    if (!(fun instanceof Function))
      throw new Error("object cannot be defered by scheduler");

    this.add({
      advanceTime: function(time) { fun(time); }, // make sur that the advanceTime method does not returm anything
    }, time);
  }

  // add a time engine to the scheduler
  add(engine, time = this.currentTime) {
    if (!TimeEngine.implementsScheduled(engine))
      throw new Error("object cannot be added to scheduler");

    if (engine.master)
      throw new Error("object has already been added to a master");

    // set master and add to array
    engine.master = this;
    this.__engines.add(engine);

    // schedule engine
    this.__scheduleEngine(engine, time);
    this.__resetTick();
  }

  remove(engine) {
    if (!engine.master || engine.master !== this)
      throw new Error("engine has not been added to this scheduler");

    // reset master and remove from array
    engine.master = null;
    this.__engines.delete(engine);

    // unschedule engine
    this.__unscheduleEngine(engine);
    this.__resetTick();
  }

  resetEngineTime(engine, time = this.currentTime) {
    this.__rescheduleEngine(engine, time);
    this.__resetTick();
  }

  // check whether a given engine is scheduled
  has(engine) {
    return this.__engines.has(engine);
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
