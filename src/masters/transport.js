import defaultAudioContext from '../core/audio-context';
import TimeEngine from '../core/time-engine';
import PriorityQueue from '../utils/priority-queue';
import SchedulingQueue from '../utils/scheduling-queue';
import { getScheduler } from './factories';


function addDuplet(firstArray, secondArray, firstElement, secondElement) {
  firstArray.push(firstElement);
  secondArray.push(secondElement);
}

function removeDuplet(firstArray, secondArray, firstElement) {
  var index = firstArray.indexOf(firstElement);

  if (index >= 0) {
    var secondElement = secondArray[index];

    firstArray.splice(index, 1);
    secondArray.splice(index, 1);

    return secondElement;
  }

  return null;
}

// The Transported call is the base class of the adapters between
// different types of engines (i.e. transported, scheduled, play-controlled)
// The adapters are at the same time masters for the engines added to the transport
// and transported TimeEngines inserted into the transport's position-based pritority queue.
class Transported extends TimeEngine {
  constructor(transport, engine, start, duration, offset, stretch = 1) {
    super();
    this.master = transport;

    this.__engine = engine;
    engine.master = this;

    this.__startPosition = start;
    this.__endPosition = !isFinite(duration) ? Infinity : start + duration;
    this.__offsetPosition = start + offset;
    this.__stretchPosition = stretch;
    this.__haltPosition = Infinity; // engine's next halt position when not running (is null when engine hes been started)
    // console.log(this.__startPosition, this.__endPosition, this.__offsetPosition, this.__stretchPosition)
  }

  setBoundaries(start, duration, offset = 0, stretch = 1) {
    this.__startPosition = start;
    this.__endPosition = start + duration;
    this.__offsetPosition = start + offset;
    this.__stretchPosition = stretch;
    this.resetPosition();
  }

  start(time, position, speed) {}
  stop(time, position) {}

  get currentTime() {
    return this.master.currentTime;
  }

  get currentPosition() {
    return this.master.currentPosition - this.__offsetPosition;
  }

  resetPosition(position) {
    if (position !== undefined)
      position += this.__offsetPosition;

    this.master.resetEnginePosition(this, position);
  }

  syncPosition(time, position, speed) {
    if (speed > 0) {
      if (position < this.__startPosition) {

        if (this.__haltPosition === null)
          this.stop(time, position - this.__offsetPosition);

        this.__haltPosition = this.__endPosition;

        return this.__startPosition;
      } else if (position <= this.__endPosition) {
        this.start(time, position - this.__offsetPosition, speed);

        this.__haltPosition = null; // engine is active

        return this.__endPosition;
      }
    } else {
      if (position >= this.__endPosition) {
        if (this.__haltPosition === null)
          this.stop(time, position - this.__offsetPosition);

        this.__haltPosition = this.__startPosition;

        return this.__endPosition;
      } else if (position > this.__startPosition) {
        this.start(time, position - this.__offsetPosition, speed);

        this.__haltPosition = null; // engine is active

        return this.__startPosition;
      }
    }

    if (this.__haltPosition === null)
      this.stop(time, position);

    this.__haltPosition = Infinity;

    return Infinity;
  }

  advancePosition(time, position, speed) {
    var haltPosition = this.__haltPosition;

    if (haltPosition !== null) {
      this.start(time, position - this.__offsetPosition, speed);

      this.__haltPosition = null;

      return haltPosition;
    }

    // stop engine
    if (this.__haltPosition === null)
      this.stop(time, position - this.__offsetPosition);

    this.__haltPosition = Infinity;

    return Infinity;
  }

  syncSpeed(time, position, speed) {
    if (speed === 0)
      this.stop(time, position - this.__offsetPosition);
  }

  destroy() {
    this.master = null;

    this.__engine.master = null;
    this.__engine = null;
  }
}

// TransportedTransported
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position
class TransportedTransported extends Transported {
  constructor(transport, engine, startPosition, endPosition, offsetPosition) {
    super(transport, engine, startPosition, endPosition, offsetPosition);
  }

  syncPosition(time, position, speed) {
    if (speed > 0 && position < this.__endPosition)
      position = Math.max(position, this.__startPosition);
    else if (speed < 0 && position >= this.__startPosition)
      position = Math.min(position, this.__endPosition);

    return this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
  }

  advancePosition(time, position, speed) {
    position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

    if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition)
      return position;

    return Infinity;
  }

  syncSpeed(time, position, speed) {
    if (this.__engine.syncSpeed)
      this.__engine.syncSpeed(time, position, speed);
  }

  resetEnginePosition(engine, position = undefined) {
    if (position !== undefined)
      position += this.__offsetPosition;

    this.resetPosition(position);
  }
}

// TransportedSpeedControlled
// has to start and stop the speed-controlled engines when the transport hits the engine's start and end position
class TransportedSpeedControlled extends Transported {
  constructor(transport, engine, startPosition, endPosition, offsetPosition) {
    super(transport, engine, startPosition, endPosition, offsetPosition);
  }

  start(time, position, speed) {
    this.__engine.syncSpeed(time, position, speed, true);
  }

  stop(time, position) {
    this.__engine.syncSpeed(time, position, 0);
  }

  syncSpeed(time, position, speed) {
    if (this.__haltPosition === null) // engine is active
      this.__engine.syncSpeed(time, position, speed);
  }

  destroy() {
    this.__engine.syncSpeed(this.master.currentTime, this.master.currentPosition - this.__offsetPosition, 0);
    super.destroy();
  }
}

// TransportedScheduled
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position
class TransportedScheduled extends Transported {
  constructor(transport, engine, startPosition, endPosition, offsetPosition) {
    super(transport, engine, startPosition, endPosition, offsetPosition);

    // scheduling queue becomes master of engine
    engine.master = null;
    transport.__schedulingQueue.add(engine, Infinity);
  }

  start(time, position, speed) {
    this.master.__schedulingQueue.resetEngineTime(this.__engine, time);
  }

  stop(time, position) {
    this.master.__schedulingQueue.resetEngineTime(this.__engine, Infinity);
  }

  destroy() {
    this.master.__schedulingQueue.remove(this.__engine);
    super.destroy();
  }
}

// translates advancePosition of *transported* engines into global scheduler times
class TransportSchedulerHook extends TimeEngine {
  constructor(transport) {
    super();

    this.__transport = transport;

    this.__nextPosition = Infinity;
    this.__nextTime = Infinity;
    transport.__scheduler.add(this, Infinity);
  }

  // TimeEngine method (scheduled interface)
  advanceTime(time) {
    var transport = this.__transport;
    var position = this.__nextPosition;
    var speed = transport.__speed;
    var nextPosition = transport.advancePosition(time, position, speed);
    var nextTime = transport.__getTimeAtPosition(nextPosition);

    while (nextTime <= time) {
      nextPosition = transport.advancePosition(nextTime, nextPosition, speed);
      nextTime = transport.__getTimeAtPosition(nextPosition);
    }

    this.__nextPosition = nextPosition;
    this.__nextTime = nextTime;
    return nextTime;
  }

  resetPosition(position = this.__nextPosition) {
    var transport = this.__transport;
    var time = transport.__getTimeAtPosition(position);

    this.__nextPosition = position;
    this.__nextTime = time;
    this.resetTime(time);
  }

  destroy() {
    this.__transport.__scheduler.remove(this);
    this.__transport = null;
  }
}

// internal scheduling queue that returns the current position (and time) of the play control
class TransportSchedulingQueue extends SchedulingQueue {
  constructor(transport) {
    super();

    this.__transport = transport;
    transport.__scheduler.add(this, Infinity);
  }

  get currentTime() {
    return this.__transport.currentTime;
  }

  get currentPosition() {
    return this.__transport.currentPosition;
  }

  destroy() {
    this.__transport.__scheduler.remove(this);
    this.__transport = null;
  }
}

/**
 * Transport class
 */
export default class Transport extends TimeEngine {
  constructor(options = {}) {
    super();

    this.audioContext = options.audioContext || defaultAudioContext;

    this.__engines = [];
    this.__transported = [];

    this.__scheduler = getScheduler(this.audioContext);
    this.__schedulerHook = new TransportSchedulerHook(this);
    this.__transportedQueue = new PriorityQueue();
    this.__schedulingQueue = new TransportSchedulingQueue(this);

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;
  }

  __getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  __getPositionAtTime(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  __syncTransportedPosition(time, position, speed) {
    var numTransportedEngines = this.__transported.length;
    var nextPosition = Infinity;

    if (numTransportedEngines > 0) {
      var engine, nextEnginePosition;

      this.__transportedQueue.clear();
      this.__transportedQueue.reverse = (speed < 0);

      for (var i = numTransportedEngines - 1; i > 0; i--) {
        engine = this.__transported[i];
        nextEnginePosition = engine.syncPosition(time, position, speed);
        this.__transportedQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__transported[0];
      nextEnginePosition = engine.syncPosition(time, position, speed);
      nextPosition = this.__transportedQueue.insert(engine, nextEnginePosition, true); // insert and sort
    }

    return nextPosition;
  }

  __syncTransportedSpeed(time, position, speed) {
    for (var transported of this.__transported)
      transported.syncSpeed(time, position, speed);
  }

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
   */
  get currentTime() {
    return this.__scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current playing position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
   */
  get currentPosition() {
    var master = this.master;

    if (master && master.currentPosition !== undefined)
      return master.currentPosition;

    return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
  }

  /**
   * Reset next transport position
   * @param {Number} next transport position
   */
  resetPosition(position) {
    var master = this.master;

    if (master && master.resetEnginePosition !== undefined)
      master.resetEnginePosition(this, position);
    else
      this.__schedulerHook.resetPosition(position);
  }

  // TimeEngine method (transported interface)
  syncPosition(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    return this.__syncTransportedPosition(time, position, speed);
  }

  // TimeEngine method (transported interface)
  advancePosition(time, position, speed) {
    // console.log(time, position, speed);
    var nextPosition = this.__transportedQueue.time;

    while (nextPosition === position) {
      var engine = this.__transportedQueue.head;
      var nextEnginePosition = engine.advancePosition(time, position, speed);

      if (((speed > 0 && nextEnginePosition > position) || (speed < 0 && nextEnginePosition < position)) &&
        (nextEnginePosition < Infinity && nextEnginePosition > -Infinity)) {
        nextPosition = this.__transportedQueue.move(engine, nextEnginePosition);
      } else {
        nextPosition = this.__transportedQueue.remove(engine);
      }
    }

    return nextPosition;
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed, seek = false) {
    var lastSpeed = this.__speed;

    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    if (speed !== lastSpeed || (seek && speed !== 0)) {
      var nextPosition;

      // resync transported engines
      if (seek || speed * lastSpeed < 0) {
        // seek or reverse direction
        nextPosition = this.__syncTransportedPosition(time, position, speed);
      } else if (lastSpeed === 0) {
        // start
        nextPosition = this.__syncTransportedPosition(time, position, speed);
      } else if (speed === 0) {
        // stop
        nextPosition = Infinity;
        this.__syncTransportedSpeed(time, position, 0);
      } else {
        // change speed without reversing direction
        this.__syncTransportedSpeed(time, position, speed);
      }

      this.resetPosition(nextPosition);
    }
  }

  /**
   * Add a time engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   */
  add(engine, startPosition = 0, endPosition = Infinity, offsetPosition = 0) {
    var transported = null;

    if (offsetPosition === -Infinity)
      offsetPosition = 0;

    if (engine.master)
      throw new Error("object has already been added to a master");

    if (TimeEngine.implementsTransported(engine))
      transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);
    else if (TimeEngine.implementsSpeedControlled(engine))
      transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);
    else if (TimeEngine.implementsScheduled(engine))
      transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);
    else
      throw new Error("object cannot be added to a transport");

    if (transported) {
      var speed = this.__speed;

      addDuplet(this.__engines, this.__transported, engine, transported);

      if (speed !== 0) {
        // sync and start
        var nextEnginePosition = transported.syncPosition(this.currentTime, this.currentPosition, speed);
        var nextPosition = this.__transportedQueue.insert(transported, nextEnginePosition);

        this.resetPosition(nextPosition);
      }
    }

    return transported;
  }

  /**
   * Remove a time engine from the transport
   * @param {object} engineOrTransported engine or transported to be removed from the transport
   */
  remove(engineOrTransported) {
    var engine = engineOrTransported;
    var transported = removeDuplet(this.__engines, this.__transported, engineOrTransported);

    if (!transported) {
      engine = removeDuplet(this.__transported, this.__engines, engineOrTransported);
      transported = engineOrTransported;
    }

    if (engine && transported) {
      var nextPosition = this.__transportedQueue.remove(transported);

      transported.destroy();

      if (this.__speed !== 0)
        this.resetPosition(nextPosition);
    } else {
      throw new Error("object has not been added to this transport");
    }
  }

  resetEnginePosition(transported, position = undefined) {
    var speed = this.__speed;

    if (speed !== 0) {
      if (position === undefined)
        position = transported.syncPosition(this.currentTime, this.currentPosition, speed);

      var nextPosition = this.__transportedQueue.move(transported, position);
      this.resetPosition(nextPosition);
    }
  }

  /**
   * Remove all time engines from the transport
   */
  clear() {
    this.syncSpeed(this.currentTime, this.currentPosition, 0);

    for (var transported of this.__transported)
      transported.destroy();
  }
}
