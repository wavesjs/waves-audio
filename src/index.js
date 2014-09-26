/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio play control class, provides play control to a single engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var TimeEngine = require("time-engine");
var PriorityQueue = require("priority-queue");
var scheduler = require("scheduler");

class PlayControlScheduledCell extends TimeEngine {
  constructor(playControl) {
    super();
    this.__playControl = playControl;
  }

  // TimeEngine method scheduled interface)
  advanceTime(time) {
    var playControl = this.__playControl;
    var position = playControl.__getPositionAtTime(time);
    var nextPosition = playControl.__transportedEngine.advancePosition(time, position, this.__speed);
    return playControl.__getTimeAtPosition(nextPosition);
  }
}

class PlayControl extends TimeEngine {
  constructor(engine) {
    super();

    this.__engine = null;
    this.__scheduledCell = null;

    // synchronized tie, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;

    // non-zero "user" speed
    this.__playingSpeed = 1;

    if (!engine.master) {
      var speed = this.__speed;

      var getCurrentTime = () => {
        return this.currentTime;
      };

      var getCurrentPosition = () => {
        return this.currentPosition;
      };

      if (TimeEngine.implementsSpeedControlled(engine)) {
        // add time engine with speed-controlled interface
        this.__engine = engine;
        engine.setSpeedControlled(this, getCurrentTime, getCurrentPosition);
      } else if (TimeEngine.implementsTransported(engine)) {
        // add time engine with transported interface
        this.__engine = engine;

        engine.setTransported(this, 0, (nextPosition = null) => {
          // resetNextPosition
          if (nextPosition === null) {
            var time = scheduler.currentTime;
            var position = this.__getPositionAtTime(time);
            nextPosition = engine.syncPosition(time, position, this.__speed);
          }

          this.__resetNextPosition(nextPosition);
        }, getCurrentTime, getCurrentPosition);
      } else if (TimeEngine.implementsScheduled(engine)) {
        // add time engine with scheduled interface
        this.__scheduledEngine = engine;
        scheduler.add(engine, Infinity, getCurrentPosition);
      } else {
        throw new Error("object cannot be added to play control");
      }
    } else {
      throw new Error("object has already been added to a master");
    }
  }

  /**
   * Extrapolate transport time for given position
   * @param {Number} position position
   * @return {Number} extrapolated time
   */
  __getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  /**
   * Extrapolate transport position for given time
   * @param {Number} time time
   * @return {Number} extrapolated position
   */
  __getPositionAtTime(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  __sync() {
    var now = this.currentTime;
    this.__position += (now - this.__time) * this.__speed;
    this.__time = now;
    return now;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
   */
  __resetNextPosition(nextPosition) {
    if (this.__scheduledCell)
      this.__scheduledCell.resetNextTime(this.__getTimeAtPosition(nextPosition));

    this.__nextPosition = nextPosition;
  }

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master.
   */
  get currentTime() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
   *
   * This function will be replaced when the transport is added to a master.
   */
  get currentPosition() {
    return this.__position + (scheduler.currentTime - this.__time) * this.__speed;
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed, seek = false) {
    var lastSpeed = this.__speed;

    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    if (speed !== lastSpeed || seek) {
      switch (this.__engine.interface) {
        case "speed-controlled":
          this.__engine.syncSpeed(time, position, speed, seek);
          break;

        case "transported":
          var nextPosition = this.__nextPosition;

          if (seek) {
            nextPosition = this.__transportedEngine.syncPosition(this.__time, this.__position, speed);
          } else if (lastSpeed === 0) { // start or seek
            nextPosition = this.__transportedEngine.syncPosition(this.__time, this.__position, speed);

            // add scheduled cell to scheduler (will be rescheduled to appropriate time below)
            this.__scheduledCell = new PlayControlScheduledCell(this);
            scheduler.add(this.__scheduledCell, Infinity);
          } else if (speed === 0) { // stop
            nextPosition = Infinity;

            // remove scheduled cell from scheduler            
            scheduler.remove(this.__scheduledCell);
            this.__scheduledCell = null;
          } else if (speed * lastSpeed < 0) { // change transport direction
            nextPosition = this.__transportedEngine.syncPosition(time, position, speed);
          }

          this.__resetNextPosition(nextPosition);
          break;

        case "scheduled":
          if (lastSpeed === 0) // start or seek
            this.__scheduledEngine.resetNextTime(0);
          else if (speed === 0) // stop
            this.__scheduledEngine.resetNextTime(Infinity);
          break;
      }
    }
  }

  /**
   * Start playing
   */
  start() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, this.__playingSpeed);
  }

  /**
   * Pause playing
   */
  pause() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
  }

  /**
   * Stop playing
   */
  stop() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
    this.seek(0);
  }

  /**
   * Set playing speed
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
   * Get playing speed
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
      this.__position = position;
      this.syncSpeed(time, position, this.__speed, true);
    }
  }

  /**
   * Remove time engine from the transport
   */
  clear() {
    var time = this.__sync();

    this.syncSpeed(time, this.__position, 0);

    switch (this.__engine.interface) {
      case "speed-controlled":
        this.__engine.resetSpeedControlled();
        break;

      case "transported":
        this.__engine.resetTransported();
        break;

      case "scheduled":
        this.__engine.resetScheduled();
        break;
    }
  }
}

module.exports = PlayControl;