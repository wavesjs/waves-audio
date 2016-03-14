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

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

/**
 * @class SchedulingQueue
 */
export default class SchedulingQueue extends TimeEngine {
  constructor() {
    super();

    this.__queue = new PriorityQueue();
    this.__engines = [];
  }

  // TimeEngine 'scheduled' interface
  advanceTime(time) {
    var nextTime = this.__queue.time;

    while (nextTime <= time) {
      var engine = this.__queue.head;
      var nextEngineTime = engine.advanceTime(time);

      if (!nextEngineTime) {
        engine.master = null;
        arrayRemove(this.__engines, engine);
        nextTime = this.__queue.remove(engine);
      } else if (nextEngineTime > time && nextEngineTime < Infinity) {
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

  // add a time engine to the queue and return the engine
  add(engine, time = this.currentTime) {
    engine.master = this;

    // add to engines and queue
    this.__engines.push(engine);
    var nextTime = this.__queue.insert(engine, time);

    // reschedule queue
    this.resetTime(nextTime);
  }

  // remove a time engine from the queue
  remove(engine) {
    engine.master = null;

    // remove from array and queue
    arrayRemove(this.__engines, engine);
    var nextTime = this.__queue.remove(engine);

    // reschedule queue
    this.resetTime(nextTime);
  }

  // reset next engine time
  resetEngineTime(engine, time = this.currentTime) {
    var nextTime = this.__queue.move(engine, time);
    this.resetTime(nextTime);
  }

  // clear queue
  clear() {
    this.__queue.clear();
    this.__engines.length = 0;
    this.resetTime(Infinity);
  }
}
