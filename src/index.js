/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized time-based and position-based scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr *
 */
'use strict';

var TimeEngine = require("../time-engine");
var PriorityQueue = require("../priority-queue");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class TimeBasedAdapter {
  constructor(engine) {
    this.engine = engine;
  }
}

class SpeedABasedAdapter {
  constructor(engine) {
    this.engine = engine;
  }
}

class Transport extends TimeEngine {
  constructor() {
    super();

    // The transport will be added to the time master when the first
    // engine arrives and removed when the last engine goes so that an
    // an empty transport has no cyclic references and can be garbage collected.
    this.__queue = new PriorityQueue();
    this.__positionEngines = [];
    this.__speedEngines = [];
    this.__timeEngines = [];

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextTime = Infinity;
    this.__nextPosition = Infinity;

    this.__playingSpeed = 1;
  }

  __sync(time) {
    var now = time || this.getMasterTime();
    this.__position += (now - this.__time) * this.__speed;
    this.__time = now;
    return now;
  }

  __reschedule(nextPosition) {
    var nextTime = this.getTimeAtPosition(nextPosition);

    if (nextTime !== this.__nextTime) {
      this.resetEngineTime(nextTime);
      this.__nextTime = nextTime
    }

    this.__nextPosition = nextPosition;
  }

  __resyncPositionEngines() {
    var numPositionEngines = this.__positionEngines.length;
    var nextPosition = Infinity;

    if (numPositionEngines > 0) {
      var time = this.__time;
      var position = this.__position;
      var speed = this.__speed;
      var engine, nextEnginePosition;

      this.__queue.clear();
      this.__queue.reverse = (speed < 0);

      for (var i = numPositionEngines - 1; i > 0; i--) {
        engine = this.__positionEngines[i];
        nextEnginePosition = engine.__startPosition + engine.syncPosition(time, position - engine.__startPosition, speed);
        this.__queue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__positionEngines[0];
      nextEnginePosition = engine.__startPosition + engine.syncPosition(time, position - engine.__startPosition, speed);
      nextPosition = this.__queue.insert(engine, nextEnginePosition, true); // insert and sort
    }

    return nextPosition;
  }

  get numEngines() {
    return this.__positionEngines.length + this.__speedEngines.length + this.__timeEngines.length;
  }

  // TimeEngine method (time-based interface)
  initTime(time) {
    return Infinity; // don't run before started (no start before added to time master)
  }

  // TimeEngine method time-based interface)
  advanceTime(time) {
    this.__sync(time);

    var nextEngine = this.__queue.head;
    var startPosition = nextEngine.__startPosition;
    var nextEnginePosition = startPosition + nextEngine.advancePosition(time, this.__position - startPosition, this.__speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);
    var nextTime = this.getTimeAtPosition(nextPosition);
    this.__nextTime = nextTime

    return nextTime;
  }

  // TimeEngine method (position-based interface)
  syncPosition(position, time, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    for (var listener of this.__speedEngines)
      listener.seek(position);

    var nextPosition = this.__resetAllEngines(time, position);
    this.__nextPosition = nextPosition;

    return nextPosition;
  }

  // TimeEngine method (position-based interface)
  advancePosition(position, time, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    var nextEngine = this.__queue.head;
    var nextEnginePosition = nextEngine.advancePosition(position, time, speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);

    this.__nextPosition = nextPosition;

    return nextPosition;
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
   * Get current transport (scheduling) time
   * @return {Number} current transport time
   */
  get time() {
    return this.getMasterTime();
  }

  /**
   * Get current transport position
   * @return {Number} current transport position
   */
  get position() {
    if (this.__positionMaster)
      return this.getMasterPosition();

    return this.getPositionAtTime(this.getMasterTime());
  }

 // TimeEngine method (speed-based interface)
  set speed(speed) {
    if (this.timeMaster) {
      var lastSpeed = this.__speed;

      if (speed !== lastSpeed) {
        this.__sync();
        this.__speed = speed;

        var nextPosition = this.__nextPosition;

        if (lastSpeed === 0 || speed * lastSpeed < 0) {
          // reset all engines when start or reverse direction
          nextPosition = this.__resyncPositionEngines();
        } else if (speed === 0) {
          nextPosition = Infinity;

          // stop time-based engines
          for (var timeEngine of this.__timeEngines)
            this.resetTime(timeEngine, Infinity);
        }

        this.__reschedule(nextPosition);

        for (var listener of this.__speedEngines)
          listener.speed = speed;
      }
    } else {
      throw new Error("no time master");
    }
  }

  /**
   * Get current transport speed
   * @return {Number} current transport speed
   */
  get speed() {
    return this.__speed;
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  seek(position) {
    if (position !== this.__position) {
      this.__sync();
      this.__position = position;

      var speed = this.__speed;

      if (speed !== 0) {
        var nextPosition = this.__resyncPositionEngines();
        this.__reschedule(nextPosition);

        for (var listener of this.__speedEngines)
          listener.seek(position);
      }
    }
  }

  /**
   * Start playing (high level player API)
   * @param {Number} seek start position
   * @param {Number} speed playing speed
   */
  startPlaying(seek = null, speed = null) {
    if (seek)
      this.seek(seek);

    if (speed)
      this.playingSpeed = speed;

    this.speed = this.playingSpeed;
  }

  /**
   * Pause playing (high level player API)
   */
  pausePlaying() {
    this.speed = 0;
  }

  /**
   * Stop playing (high level player API)
   */
  stopPlaying() {
    this.speed = 0;
    this.seek(0);
  }

  /* TODO: The following methods should go into a mixin that extends any class 
   * with a speed attribute and a seek method into a player.
   */

  /**
   * Set playing speed (high level player API)
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  set playingSpeed(speed) {
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
      this.speed = speed;
  }

  /**
   * Get playing speed (high level player API)
   * @return current playing speed
   */
  get playingSpeed() {
    return this.__playingSpeed;
  }

  /**
   * Add an engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   *
   * An engine that can be added to the transport is either an TimeEngine
   * or an engine that implements a speed attribute (that halts with speed = 0).
   *
   * The attribute "alignToTransportPosition" of an time engine determines whether
   * the engine is scheduled in time or aligned to the transport position.
   */
  add(engine, startPosition = 0) {
    if (!engine.positionMaster && !engine.timeMaster) {
      var time = this.__sync();
      var speed = this.__speed;

      engine.positionMaster = this;

      // add time engine with position interface
      if (engine.implementsPositionBased) {
        this.__positionEngines.push(engine);

        engine.__startPosition = startPosition;

        engine.resyncEnginePosition = () => {
          var time = this.__sync();
          var position = this.__position;
          var speed = this.__speed;

          if (speed !== 0) {
            var nextEnginePosition = engine.__startPosition + engine.syncPosition(time, position - engine.__startPosition, speed);
            var nextPosition = this.__queue.move(engine, nextEnginePosition);
            this.__reschedule(nextPosition);
          }
        };

        engine.getMasterPosition = () => {
          return this.position - engine.__startPosition;
        };

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = engine.__startPosition + engine.syncPosition(time, this.__position - engine.__startPosition, speed);
          var nextPosition = this.__queue.insert(engine, nextEnginePosition);
          this.__reschedule(nextPosition);
        }
      } else if (engine.implementsSpeedBased) {
        // add time engine with speed attribute
        this.__speedEngines.push(engine);
        engine.speed = speed;
      } else if (engine.implementsTimeBased) {
        // add time engine with time interface
        this.__timeEngines.push(engine);

        if (this.timeMaster)
          this.timeMaster.add(engine, Infinity);
      } else {
        throw new Error("object cannot be added to transport");
      }
    } else {
      throw new Error("object already has a master");
    }
  }

  /**
   * Remove an engine from the transport
   * @param {object} engine engine to be removed from the transport
   */
  remove(engine) {
    if (engine.positionMaster === this) {
      var time = this.__sync();

      engine.positionMaster = null;

      if (engine.implementsPositionBased) {
        var nextPosition = this.__queue.remove(engine);

        if (this.__speed !== 0)
          this.__reschedule(nextPosition);

        arrayRemove(this.__positionEngines, engine);
      } else if (engine.implementsSpeedBased) {
        // remove engine with speed control
        engine.speed = 0;
        arrayRemove(this.__speedEngines, engine);
      } else if (engine.implementsTimeBased) {
        if (this.timeMaster)
          this.timeMaster.remove(engine);

        arrayRemove(this.__timeEngines, engine);
      }
    } else {
      throw new Error("object has not been added to this transport");
    }
  }

  set timeMaster(timeMaster) {
    var timeEngine;

    if (timeMaster) {
      // add all time driven engines to time master
      for (timeEngine of this.__timeEngines)
        timeMaster.add(timeEngine, Infinity);
    } else {
      // remove all time driven engines from time master
      for (timeEngine of this.__timeEngines)
        this.__timeMaster.remove(timeEngine);
    }

    this.__timeMaster = timeMaster;
  }

  get timeMaster() {
    return this.__timeMaster;
  }
}

module.exports = Transport;