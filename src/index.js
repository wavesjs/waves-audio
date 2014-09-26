/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var TimeEngine = require("time-engine");
var PriorityQueue = require("priority-queue");
var scheduler = require("scheduler");

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

class TransportScheduledCell extends TimeEngine {
  constructor(transport) {
    super();
    this.__transport = transport;
  }

  // TimeEngine method scheduled interface)
  advanceTime(time) {
    var transport = this.__transport;
    var position = transport.__getPositionAtTime(time);
    var nextPosition = transport.advancePosition(time, position, transport.__speed);
    return transport.__getTimeAtPosition(nextPosition);
  }
}

class Transport extends TimeEngine {
  constructor() {
    super();

    this.__transportedEngines = [];
    this.__speedControlledEngines = [];
    this.__scheduledEngines = [];

    this.__scheduledCell = null;
    this.__transportQueue = new PriorityQueue();

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;
  }

  __getPositionAtTime(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  __getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  __resyncTransportedEngines(time, position, speed) {
    var numTransportedEngines = this.__transportedEngines.length;
    var nextPosition = Infinity;

    if (numTransportedEngines > 0) {
      var engine, nextEnginePosition;

      this.__transportQueue.clear();
      this.__transportQueue.reverse = (speed < 0);

      for (var i = numTransportedEngines - 1; i > 0; i--) {
        engine = this.__transportedEngines[i];
        nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
        this.__transportQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__transportedEngines[0];
      nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
      nextPosition = this.__transportQueue.insert(engine, nextEnginePosition, true); // insert and sort
    }

    return nextPosition;
  }

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  get currentTime() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  get currentPosition() {
    return this.__position + (scheduler.currentTime - this.__time) * this.__speed;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  resetNextPosition(nextPosition) {
    if (this.__scheduledCell)
      this.__scheduledCell.resetNextTime(this.__getTimeAtPosition(nextPosition));      

    this.__nextPosition = nextPosition;
  }

  // TimeEngine method (transported interface)
  syncPosition(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    for (var speedControlledEngine of this.__speedControlledEngines)
      speedControlledEngine.syncSpeed(time, position, speed, true);

    return this.__nextPosition = this.__resyncTransportedEngines(time, position, speed);
  }

  // TimeEngine method (transported interface)
  advancePosition(time, position, speed) {
    var nextEngine = this.__transportQueue.head;
    var nextEnginePosition = nextEngine.transportStartPosition + nextEngine.advancePosition(time, position - nextEngine.transportStartPosition, speed);    
    return this.__nextPosition = this.__transportQueue.move(nextEngine, nextEnginePosition);
  }

  get numEngines() {
    return this.__transportedEngines.length + this.__speedControlledEngines.length + this.__scheduledEngines.length;
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed, seek = false) {
    var lastSpeed = this.__speed;

    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    if (speed !== lastSpeed || seek) {
      var nextPosition = this.__nextPosition;
      var scheduledEngine;

      if (seek) {
        nextPosition = this.__resyncTransportedEngines(time, position, speed);
      } else if (lastSpeed === 0) { // start or seek
        // resync transported engines
        nextPosition = this.__resyncTransportedEngines(time, position, speed);

        // add scheduled cell to scheduler (will be rescheduled to appropriate time below)
        this.__scheduledCell = new TransportScheduledCell(this);
        scheduler.add(this.__scheduledCell, Infinity);

        // start scheduled engines
        for (scheduledEngine of this.__scheduledEngines)
          scheduledEngine.resetNextTime(0);
      } else if (speed === 0) { // stop
        nextPosition = Infinity;

        // remove scheduled cell from scheduler
        scheduler.remove(this.__scheduledCell);
        delete this.__scheduledCell;

        // stop scheduled engines
        for (scheduledEngine of this.__scheduledEngines)
          scheduledEngine.resetNextTime(Infinity);
      } else if (speed * lastSpeed < 0) { // change transport direction
        nextPosition = this.__resyncTransportedEngines(time, position, speed);
      }

      this.resetNextPosition(nextPosition);

      for (var speedControlledEngine of this.__speedControlledEngines)
        speedControlledEngine.syncSpeed(time, position, speed, seek);
    }
  }

  /**
   * Add a time engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   */
  add(engine, startPosition = 0) {
    if (!engine.master) {
      var time = this.currentTime;
      var position = this.currentPosition;
      var speed = this.__speed;

      var getCurrentTime = () => {
        return scheduler.currentTime;
      };

      var getCurrentPosition = () => {
        return this.currentPosition - startPosition;
      };

      if (TimeEngine.implementsTransported(engine)) {
        // add time engine with transported interface
        this.__transportedEngines.push(engine);

        engine.setTransported(this, startPosition, (nextEnginePosition = null) => {
          // resetNextPosition
          var time = this.currentTime;
          var position = this.currentPosition;
          var speed = this.__speed;

          if (speed !== 0) {
            if (nextEnginePosition === null)
              nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);

            var nextPosition = this.__transportQueue.move(engine, nextEnginePosition);
            this.resetNextPosition(nextPosition);
          }
        }, getCurrentTime, getCurrentPosition);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
          var nextPosition = this.__transportQueue.insert(engine, nextEnginePosition);

          this.resetNextPosition(nextPosition);
        }
      } else if (TimeEngine.implementsSpeedControlled(engine)) {
        // add time engine with speed-controlled interface
        this.__speedControlledEngines.push(engine);

        engine.setSpeedControlled(this, getCurrentTime, getCurrentPosition);

        if (speed !== 0)
          engine.syncSpeed(time, position, speed);
      } else if (TimeEngine.implementsScheduled(engine)) {
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
    var time = this.currentTime;
    var position = this.currentPosition;

    if (TimeEngine.implementsTransported(engine) && arrayRemove(this.__transportedEngines, engine)) {
      // remove engine with transported interface
      var nextPosition = this.__transportQueue.remove(engine);

      if (this.__speed !== 0)
        this.resetNextPosition(nextPosition);

      engine.resetTransported();
    } else if (TimeEngine.implementsSpeedControlled(engine) && arrayRemove(this.__speedControlledEngines, engine)) {
      // remove engine with speed-controlled interface
      engine.syncSpeed(time, position, 0);

      engine.resetSpeedControlled();
    } else if (TimeEngine.implementsScheduled(engine) && arrayRemove(this.__scheduledEngines, engine)) {
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
    var time = this.currentTime;
    var position = this.currentPosition;

    this.syncSpeed(time, position, 0);

    for (var transportedEngine of this.__transportedEngines)
      transportedEngine.resetTransported();

    for (var speedControlledEngine of this.__speedControlledEngines)
      speedControlledEngine.resetSpeedControlled();

    for (var scheduledEngine of this.__scheduledEngines)
      scheduledEngine.resetScheduled();

    this.__transportedEngines.length = 0;
    this.__speedControlledEngines.length = 0;
    this.__scheduledEngines.length = 0;

    this.resetNextPosition(Infinity);
  }

}

module.exports = Transport;