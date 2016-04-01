/**
 * SchedulingQueue base class
 * http://wavesjs.github.io/audio/#audio-scheduling-queue
 *
 * Norbert.Schnell@ircam.fr
 * Copyright 2014, 2015 IRCAM – Centre Pompidou
 */

import PriorityQueue from '../utils/priority-queue';
import TimeEngine from '../core/time-engine';
import defaultAudioContext from '../core/audio-context';

/**
 * @class SchedulingQueue
 */
export default class SchedulingQueue extends TimeEngine {
  constructor() {
    super();

    this.__queue = new PriorityQueue();
    this.__engines = new Set();
  }

  // TimeEngine 'scheduled' interface
  advanceTime(time) {
    var nextTime = this.__queue.time;

    while (nextTime <= time) {
      var engine = this.__queue.head;
      var nextEngineTime = engine.advanceTime(time);

      if (!nextEngineTime) {
        engine.master = null;
        this.__engines.delete(engine);
        nextTime = this.__queue.remove(engine);
      } else if (nextEngineTime > time && nextEngineTime <= Infinity) {
        nextTime = this.__queue.move(engine, nextEngineTime);
      } else {
        throw new Error('engine did not advance time');
      }
    }

    return nextTime;
  }

  // TimeEngine master method to be implemented by derived class
  get currentTime() {
    return 0;
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

    engine.master = this;

    // add to engines and queue
    this.__engines.add(engine);
    var nextTime = this.__queue.insert(engine, time);

    // reschedule queue
    this.resetTime(nextTime);
  }

  // remove a time engine from the queue
  remove(engine) {
    if (engine.master !== this)
      throw new Error("object has not been added to this scheduler");

    engine.master = null;

    // remove from array and queue
    this.__engines.delete(engine);
    var nextTime = this.__queue.remove(engine);

    // reschedule queue
    this.resetTime(nextTime);
  }

  // reset next engine time
  resetEngineTime(engine, time = this.currentTime) {
    if (engine.master !== this)
      throw new Error("object has not been added to this scheduler");

    var nextTime = this.__queue.move(engine, time);
    this.resetTime(nextTime);
  }

  // check whether a given engine is scheduled
  has(engine) {
    return this.__engines.has(engine);
  }

  // clear queue
  clear() {
    this.__queue.clear();
    this.__engines.clear;
    this.resetTime(Infinity);
  }
}
