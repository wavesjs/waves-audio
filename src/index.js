/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized time-based and position-based scheduling of events
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var EventQueue = require("event-queue");
var EventEngine = require("event-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

class Transport extends EventEngine {

  constructor() {
    super();

    this.__timeEvents = new EventQueue();
    this.__timeEngines = [];
    this.__nextEventTime = Infinity;

    this.__positionEvents = new EventQueue();
    this.__positionEngines = [];
    this.__nextEventPosition = Infinity;

    this.__nextTime = Infinity;

    this.__time = Infinity;
    this.__position = 0.0;
    this.__speed = 0.0;

    this.__speedAndSeekListeners = [];

    this.__playingSpeed = 1.0;
  }

  __sync(time) {
    this.__position += (time - this.__time) * this.__speed;
    this.__time = time;
  }

  __reschedule() {
    var nextTime;

    if (this.__nextEventPosition !== Infinity)
      nextTime = Math.min(this.__nextEventTime, this.getTimeAtPosition(this.__nextEventPosition));
    else
      nextTime = this.__nextEventTime;

    if (nextTime !== this.__nextTime) {
      this.__nextTime = nextTime;
      this.rescheduleEngine(nextTime);
    }
  }

  // EventEngine syncEvent
  syncEvent(time) {
    this.__nextEventTime = Infinity;
    this.__nextEventPosition = Infinity;

    this.__time = time;

    if (this.__speed) {
      this.__timeEvents.clear();
      this.__nextEventTime = this.__timeEvents.insertAll(this.__timeEngines, time);

      this.__positionEvents.reverse = (this.__speed < 0);
      this.__positionEvents.clear();
      this.__nextEventPosition = this.__positionEvents.insertAll(this.__positionEngines, this.__position);
    }

    if (this.__nextEventPosition !== Infinity)
      this.__nextTime = Math.min(this.__nextEventTime, this.getTimeAtPosition(this.__nextEventPosition));
    else
      this.__nextTime = this.__nextEventTime;

    return this.__nextTime - time;
  }

  // EventEngine executeEvent
  executeEvent(time, audioTime) {
    this.__sync(time);

    if (this.__nextTime === this.__nextEventTime)
      this.__nextEventTime = this.__timeEvents.advance(time, audioTime);
    else
      this.__nextEventPosition = this.__positionEvents.advance(this.__position, audioTime);

    if (this.__nextEventPosition !== Infinity)
      this.__nextTime = Math.min(this.__nextEventTime, this.getTimeAtPosition(this.__nextEventPosition));
    else
      this.__nextTime = this.__nextEventTime;

    return this.__nextTime - time;
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
   * Extrapolate transport time for given position
   * @param {Number} position position
   * @return {Number} extrapolated time
   */
  getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  /**
   * Get current transport (scheduling) time
   * @return {Number} current transport time
   */
  get time() {
    return this.scheduler.time;
  }

  /**
   * Get current transport position
   * @return {Number} current transport position
   */
  get position() {
    var time = this.scheduler.time;
    return this.getPositionAtTime(time);
  }

  /**
   * Get current transport speed
   * @return {Number} current transport speed
   */
  get speed() {
    return this.__speed;
  }

  /**
   * Get whether transport runs in reverse direction (speed < 0)
   * @return {Bool} whether transport runs in reverse direction
   */
  get reverse() {
    return (this.__speed < 0);
  }

  /**
   * Set transport speed (a speed of 0 corrsponds to stop or pause)
   * @param {Number} speed speed
   */
  set speed(speed) {
    var lastSpeed = this.__speed;

    if (speed !== lastSpeed) {
      this.__sync(this.time);

      this.__speed = speed;

      if (lastSpeed === 0) {
        // start
        this.__timeEvents.clear();
        this.__nextEventTime = this.__timeEvents.insertAll(this.__timeEngines, this.__time);

        this.__positionEvents.reverse = (speed < 0);
        this.__positionEvents.clear();
        this.__nextEventPosition = this.__positionEvents.insertAll(this.__positionEngines, this.__position);
      } else if (speed === 0) {
        // stop/pause
        this.__nextEventTime = Infinity;
        this.__nextEventPosition = Infinity;
      } else if (speed * lastSpeed < 0) {
        // reverse direction
        this.__positionEvents.reverse = (speed < 0);
        this.__positionEvents.clear();
        this.__nextEventPosition = this.__positionEvents.insertAll(this.__positionEngines, this.__position);
      }

      this.__reschedule();

      for (var listener of this.__speedAndSeekListeners)
        listener.speed = speed;
    }
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  seek(position) {
    this.__sync(this.time);

    if (position !== this.__position) {
      this.__position = position;

      if (this.__speed !== 0) {
        this.__positionEvents.clear();
        this.__nextEventPosition = this.__positionEvents.insertAll(this.__positionEngines, this.__position, true);

        this.__reschedule();

        for (var listener of this.__speedAndSeekListeners)
          listener.seek(position);
      }
    }
  }

  /**
   * Add an engine to the transport
   * @param {Object} engine engine to be added to the transport
   *
   * An engine that can be added to the transport is either an EventEngine
   * or an engine that implements a speed attribute and a seek method.
   *
   * The attribute "alignEventsToTransportPosition" of an event engine determines whether
   * the engine's events are scheduled in time or aligned to the transport position.
   */
  add(engine) {
    if (engine.transport || engine.scheduler)
      throw "object has already been added to a transport";

    engine.transport = this;
    engine.scheduler = this;

    this.__sync(this.time);

    if (engine.syncEvent && engine.executeEvent) {
      // add an event engine
      if (engine.alignEventsToTransportPosition) {
        if (this.__speed !== 0)
          this.__nextEventPosition = this.__positionEvents.insert(engine, this.__position);
        this.__positionEngines.push(engine);
      } else {
        if (this.__speed !== 0)
          this.__nextEventTime = this.__timeEvents.insert(engine, this.__time);
        this.__timeEngines.push(engine);
      }

      if (this.__speed !== 0)
        this.__reschedule();
    } else if (Object.getOwnPropertyDescriptor(Object.getPrototypeOf(engine), "speed") && (typeof engine.seek === "function")) {
      // add a non-event engine that has a speed property and/or a seek method
      this.__speedAndSeekListeners.push(engine);
      engine.speed = this.__speed;
    } else {
      throw "cannot add an object to transport that is not an EventEngine nor has a speed attribute and seek method";
    }
  }

  /**
   * Remove an engine from the transport
   */
  remove(engine) {
    if (engine.transport !== this)
      throw "object has not been added to this transport";

    engine.transport = null;
    engine.scheduler = null;

    this.__sync(this.time);

    if (engine.syncEvent && engine.executeEvent) {
      // remove an event engine
      if (engine.alignEventsToTransportPosition) {
        this.__nextEventPosition = this.__positionEvents.remove(engine);
        arrayRemove(this.__positionEngines, engine);
      } else {
        this.__nextEventTime = this.__timeEvents.remove(engine);
        arrayRemove(this.__timeEngines, engine);
      }

      if (this.__speed !== 0)
        this.__reschedule();
    } else if (Object.getOwnPropertyDescriptor(Object.getPrototypeOf(engine), "speed") && (typeof engine.seek === "function")) {
      engine.speed = 0;
      arrayRemove(this.__speedAndSeekListeners, engine);
    }
  }

  /**
   * Resychronize event engine
   * @param {Object} engine event engine to be resynchronized
   */
  resync(engine) {
    if (engine.transport !== this)
      throw "object has not been added to this transport";

    this.__sync(this.time);

    if (this._speed !== 0) {
      if (engine.alignEventsToTransportPosition)
        this.__nextEventPosition = this.__positionEvents.move(engine, this.__position);
      else
        this.__nextEventTime = this.__timeEvents.move(engine, this.__time);

      this.__reschedule();
    }
  }

  /**
   * Reschedule event engine at given time or position
   * @param {Object} engine event engine to be rescheduled
   * @param {Number} time time or position when to reschedule
   */
  reschedule(engine, time) {
    if (engine.transport !== this)
      throw "object has not been added to this transport";

    this.__sync(this.time);

    if (this._speed !== 0) {
      if (engine.alignEventsToTransportPosition)
        this.__nextEventPosition = this.__positionEvents.move(engine, time, false);
      else
        this.__nextEventTime = this.__timeEvents.move(engine, time, false);

      this.__reschedule();
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
}

module.exports = Transport;