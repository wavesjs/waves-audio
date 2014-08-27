/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized time-based and position-based scheduling of events
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 * @version 5.1.0
 */
'use strict';

var EventQueue = require("../event-queue");
var EventEngine = require("../event-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index === 0) {
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
    this.__playSpeed = 1.0;

    this.__speedListeners = [];
    this.__seekListeners = [];

    this.muteOnstill = true;

    return this;
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

  getPositionAtTime(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  /**
   * Get transport time
   */
  get time() {
    return this.scheduler.time; // inherits time from its scheduler
  }

  /**
   * Get transport position
   */
  get position() {
    var time = this.scheduler.time;
    return this.getPositionAtTime(time);
  }

  /**
   * Get transport speed
   */
  get speed() {
    return this.__speed;
  }

  /**
   * Get whether transport runs in reverse direction (backward)
   */
  get reverse() {
    return (this.__speed < 0);
  }

  /**
   * Set transport speed
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

      for (var listener of this.__speedListeners)
        listener.speed = speed;
    }
  }

  /**
   * Set transport position
   */
  seek(position) {
    this.__sync(this.time);

    if (position !== this.__position) {
      this.__position = position;

      if (this.__speed !== 0) {
        this.__positionEvents.clear();
        this.__nextEventPosition = this.__positionEvents.insertAll(this.__positionEngines, this.__position, true);

        this.__reschedule();

        for (var listener of this.__seekListeners)
          listener.seek(position);
      }
    }
  }

  start(seek = null, speed = null) {
    transport.speed = playSpeed;
  }

  stop(seek = null, speed = null) {
    transport.speed = playSpeed;
  }

  /**
   * Add an engine to the transport
   */
  add(engine) {
    if (engine.transport === null) {
      this.__sync(this.time);

      if (engine.syncEvent && engine.executeEvent) {
        // add an event engine

        if (engine.scheduler === null) {
          if (engine.alignToTransportPosition) {
            if (this.__speed !== 0)
              this.__nextEventPosition = this.__positionEvents.insert(engine, this.__position);
            this.__positionEngines.push(engine);
          } else {
            if (this.__speed !== 0)
              this.__nextEventTime = this.__timeEvents.insert(engine, this.__time);
            this.__timeEngines.push(engine);
          }

          engine.scheduler = this;

          if (this.__speed !== 0)
            this.__reschedule();
        }
      } else {
        // add a non-event engine that has a speed property and/or a seek method

        if (engine.speed)
          this.__speedListeners.push(engine);

        if (engine.seek)
          this.__seekListeners.push(engine);
      }

      engine.transport = this;
    }
  }

  /**
   * Remove an engine from the transport
   */
  remove(engine) {
    if (engine.transport === this) {
      this.__sync(this.time);

      if (engine.syncEvent && engine.executeEvent) {
        // remove an event engine

        if (engine.scheduler === this) {
          if (engine.alignToTransportPosition) {
            this.__nextEventPosition = this.__positionEvents.remove(engine);
            arrayRemove(this.__positionEngines, engine);
          } else {
            this.__nextEventTime = this.__timeEvents.remove(engine);
            arrayRemove(this.__timeEngines, engine);
          }

          engine.scheduler = null;

          if (this.__speed !== 0)
            this.__reschedule();
        }
      } else {
        // remove a non-event engine that has a speed property and/or a seek method

        if (engine.speed)
          arrayRemove(this.__speedListeners, engine);

        if (engine.seek)
          arrayRemove(this.__seekListeners, engine);
      }

      engine.transport = null;
    }
  }

  /**
   * Resychronize event engine
   */
  resync(engine) {
    if (engine.scheduler === this && engine.syncEvent && engine.executeEvent) {
      this.__sync(this.time);

      if (this._speed !== 0) {
        if (engine.alignToTransportPosition)
          this.__nextEventPosition = this.__positionEvents.move(engine, this.__position);
        else
          this.__nextEventTime = this.__timeEvents.move(engine, this.__time);

        this.__reschedule();
      }
    }
  }

  /**
   * Reschedule event engine at given time (or position)
   */
  reschedule(engine, time) {
    if (engine.scheduler === this && engine.syncEvent && engine.executeEvent) {
      this.__sync(this.time);

      if (this._speed !== 0) {
        if (engine.alignToTransportPosition)
          this.__nextEventPosition = this.__positionEvents.move(engine, time, false);
        else
          this.__nextEventTime = this.__timeEvents.move(engine, time, false);

        this.__reschedule();
      }
    }
  }
}

module.exports = Transport;