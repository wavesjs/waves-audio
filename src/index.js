/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr *
 */
'use strict';

var TimeEngine = require("../time-engine");
var PriorityQueue = require("../priority-queue");
var scheduler = require("../scheduler");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

// ScheduledAdapter has to switch on and off a scheduled engine 
// when the transport hits the engine's start and end position
class ScheduledAdapter {
  constructor(engine) {
    this.engine = engine;
  }
}

// ScheduledAdapter has to start and stop a speed-controlled engine 
// when the transport hits the engine's start and end position
class SpeedControlledAdapter {
  constructor(engine) {
    this.engine = engine;
  }
}

class Transport extends TimeEngine {
  constructor() {
    super();

    this.__queue = new PriorityQueue();
    this.__transportedEngines = [];
    this.__speedControlledEngines = [];
    this.__scheduledEngines = [];

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextTime = Infinity;
    this.__nextPosition = Infinity;

    this.__playingSpeed = 1;
  }

  __sync(time) {
    var now = time || this.currentTime;
    this.__position += (now - this.__time) * this.__speed;
    this.__time = now;
    return now;
  }

  __resyncTransportedEngines() {
    var numTransportedEngines = this.__transportedEngines.length;
    var nextPosition = Infinity;

    if (numTransportedEngines > 0) {
      var time = this.__time;
      var position = this.__position;
      var speed = this.__speed;
      var engine, nextEnginePosition;

      this.__queue.clear();
      this.__queue.reverse = (speed < 0);

      for (var i = numTransportedEngines - 1; i > 0; i--) {
        engine = this.__transportedEngines[i];
        nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
        this.__queue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__transportedEngines[0];
      nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
      nextPosition = this.__queue.insert(engine, nextEnginePosition, true); // insert and sort
    }

    return nextPosition;
  }

  __rescheduleAccordingToPosition(nextPosition) {
    var nextTime = this.getTimeAtPosition(nextPosition);

    if (nextTime !== this.__nextTime) {
      if (nextTime === Infinity)
        scheduler.remove(this);
      else if (!this.master)
        scheduler.add(this, nextTime - scheduler.currentTime, "its me!");
      else
        this.resetEngineTime(nextTime);

      this.__nextTime = nextTime
    }

    this.__nextPosition = nextPosition;
  }

  get numEngines() {
    return this.__transportedEngines.length + this.__speedControlledEngines.length + this.__scheduledEngines.length;
  }

  // TimeEngine method scheduled interface)
  advanceTime(time) {
    this.__sync(time);

    var nextEngine = this.__queue.head;
    var nextEnginePosition = nextEngine.transportStartPosition + nextEngine.advancePosition(time, this.__position - nextEngine.transportStartPosition, this.__speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);
    var nextTime = this.getTimeAtPosition(nextPosition);
    this.__nextTime = nextTime

    return nextTime;
  }

  // TimeEngine method (transported interface)
  syncPosition(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    for (var speedControlledEngine of this.__speedControlledEngines) {
      speedControlledEngine.syncSpeed(time, position, 0);
      speedControlledEngine.syncSpeed(time, position, speed);
    }

    var nextPosition = this.__resetAllEngines(time, position);
    this.__nextPosition = nextPosition;

    return nextPosition;
  }

  // TimeEngine method (transported interface)
  advancePosition(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    var nextEngine = this.__queue.head;
    var nextEnginePosition = nextEngine.advancePosition(position, time, speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);

    this.__nextPosition = nextPosition;

    return nextPosition;
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed) {
    if (this.interface !== "transported") {
      var lastSpeed = this.__speed;

      if (speed !== lastSpeed) {
        this.__speed = speed;

        var nextPosition = this.__nextPosition;
        var scheduledEngine;

        if (lastSpeed === 0) {
          // reset all engines when start or reverse direction
          nextPosition = this.__resyncTransportedEngines();

          // start scheduled engines
          for (scheduledEngine of this.__scheduledEngines)
            scheduledEngine.resetEngineTime(0);
        } else if (speed === 0) {
          nextPosition = Infinity;

          // stop scheduled engines
          for (scheduledEngine of this.__scheduledEngines)
            scheduledEngine.resetEngineTime(Infinity);
        } else if (speed * lastSpeed < 0) {
          nextPosition = this.__resyncTransportedEngines();
        }

        this.__rescheduleAccordingToPosition(nextPosition);

        for (var speedControlledEngine of this.__speedControlledEngines)
          speedControlledEngine.syncSpeed(time, position, speed);
      }
    } else {
      throw new Error("no scheduler");
    }
  }

  /**
   * Extrapolate transport time for given position
   * @param {Number} position position
   * @return {Number} extrapolated time
   */
  getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  /**
   * Extrapolate transport position for given time
   * @param {Number} time time
   * @return {Number} extrapolated position
   */
  getPositionAtTime(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  /**
   * Get current master time
   * @return {Number} current transport position
   */
  get currentTime() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
   */
  get currentPosition() {
    return this.getPositionAtTime(this.currentTime);
  }

  /**
   * Start playing (high level player API)
   */
  start() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, this.__playingSpeed);
  }

  /**
   * Pause playing (high level player API)
   */
  pause() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
  }

  /**
   * Stop playing (high level player API)
   */
  stop() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
    this.seek(0);
  }

  /**
   * Set playing speed (high level player API)
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  set speed(speed) {
    var time = this.__sync();

    if (speed >= 0) {
      if (speed < 0.0625)
        speed = 0.0625;
      else if (speed > 16)
        speed = 16;
    } else {
      if (speed < -16)
        speed = -16
      else if (speed > -0.0625)
        speed = -0.0625;
    }

    this.__playingSpeed = speed;

    if (this.__speed !== 0)
      this.syncSpeed(time, this.__position, speed);
  }

  /**
   * Get playing speed (high level player API)
   * @return current playing speed
   */
  get speed() {
    return this.__playingSpeed;
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  seek(position) {
    if (position !== this.__position) {
      var time = this.__sync();
      var speed = this.__speed;

      if (speed !== 0) {
        var nextPosition = this.__resyncTransportedEngines();
        this.__rescheduleAccordingToPosition(nextPosition);

        for (var speedControlledEngine of this.__speedControlledEngines) {
          speedControlledEngine.syncSpeed(time, this.__position, 0);
          speedControlledEngine.syncSpeed(time, position, speed);
        }
      }

      this.__position = position;
    }
  }

  /**
   * Add a time engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   */
  add(engine, startPosition = 0) {
    if (!engine.master) {
      var time = this.__sync();
      var speed = this.__speed;

      var getCurrentTime = () => {
        return this.currentTime;
      };

      var getCurrentPosition = () => {
        return this.currentPosition - startPosition;
      };

      if (engine.implementsTransported) {
        // add time engine with transported interface
        this.__transportedEngines.push(engine);

        engine.setTransported(this, startPosition, () => {
          // resyncEnginePosition
          var time = this.__sync();
          var speed = this.__speed;
          if (speed !== 0) {
            var nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, this.__position - engine.transportStartPosition, speed);
            var nextPosition = this.__queue.move(engine, nextEnginePosition);
            this.__rescheduleAccordingToPosition(nextPosition);
          }
        }, getCurrentTime, getCurrentPosition);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, this.__position - engine.transportStartPosition, speed);
          var nextPosition = this.__queue.insert(engine, nextEnginePosition);
          this.__rescheduleAccordingToPosition(nextPosition);
        }
      } else if (engine.implementsSpeedControlled) {
        // add time engine with speed-controlled interface
        this.__speedControlledEngines.push(engine);

        engine.setSpeedControlled(this, getCurrentTime, getCurrentPosition);
        engine.syncSpeed(time, this.__position, speed);
      } else if (engine.implementsScheduled) {
        // add time engine with scheduled interface
        this.__scheduledEngines.push(engine);

        var delay = (this.__speed !== 0) ? 0 : Infinity;
        scheduler.add(engine, delay, getCurrentPosition);
      } else {
        throw new Error("object cannot be added to transport");
      }
    } else {
      throw new Error("object has already been added to a master");
    }
  }

  /**
   * Remove a time engine from the transport
   * @param {object} engine engine to be removed from the transport
   */
  remove(engine) {
    var time = this.__sync();
    
    if (engine.implementsTransported && arrayRemove(this.__transportedEngines, engine)) {
      // remove engine with transported interface
      var nextPosition = this.__queue.remove(engine);

      if (this.__speed !== 0)
        this.__rescheduleAccordingToPosition(nextPosition);

      engine.resetTransported();
    } else if (engine.implementsSpeedControlled && arrayRemove(this.__speedControlledEngines, engine)) {
      // remove engine with speed-controlled interface
      engine.syncSpeed(time, this.__position, 0);

      engine.resetSpeedControlled();
    } else if (engine.implementsScheduled && arrayRemove(this.__scheduledEngines, engine)) {
      // remove engine with scheduled interface
      scheduler.remove(engine);

      engine.resetScheduled();
    } else {
      throw new Error("object has not been added to this transport");
    }
  }

  /**
   * Remove all time engines from the transport
   */
  clear() {
    var time = this.__sync();

    if (this.interface === "scheduled" || this.interface === "speed-controlled")
      this.syncSpeed(time, this.__position, 0);

    for (var transportedEngine of this.__transportedEngines)
      transportedEngine.resetTransported();

    for (var speedControlledEngine of this.__speedControlledEngines)
      speedControlledEngine.resetSpeedControlled();

    for (var scheduledEngine of this.__scheduledEngines)
      scheduledEngine.resetScheduled();

    this.__transportedEngines.length = 0;
    this.__speedControlledEngines.length = 0;
    this.__scheduledEngines.length = 0;

    if (this.interface === "transported")
      this.resyncEnginePosition();
  }

  setScheduled(scheduler, resetEngineTime, getCurrentTime, getCurrentPosition) {
    // make sure that the transport added itself to the scheduler
    if (getCurrentPosition === "its me!")
      super.setScheduled(scheduler, resetEngineTime, getCurrentTime, null);
    else
      throw new Error("Transport cannot be added to scheduler");
  }
}

module.exports = Transport;