/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio play control class (time-engine master), provides play control to a single engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var TimeEngine = require("../core/time-engine");
var {
  getScheduler
} = require('./factories');

class PlayControlSchedulerHook extends TimeEngine {
  constructor(playControl) {
    super();
    this.__playControl = playControl;
  }

  advanceTime(time) {
    var playControl = this.__playControl;
    var position = playControl.__getPositionAtTime(time);
    var nextPosition = playControl.__engine.advancePosition(time, position, playControl.__speed);

    if (nextPosition !== Infinity)
      return playControl.__getTimeAtPosition(nextPosition);

    return Infinity;
  }
}

class PlayControlLoopControl extends TimeEngine {
  constructor(playControl) {
    super();
    this.__playControl = playControl;
    this.speed = null;
  }

  // TimeEngine method (scheduled interface)
  advanceTime(time) {
    if (this.speed > 0) {
      this.__playControl.syncSpeed(time, this.__playControl.__loopStart, this.speed, true);
      return this.__playControl.__getTimeAtPosition(this.__playControl.__loopEnd);
    } else if (this.speed < 0) {
      this.__playControl.syncSpeed(time, this.__playControl.__loopEnd, this.speed, true);
      return this.__playControl.__getTimeAtPosition(this.__playControl.__loopStart);
    }

    return Infinity;
  }
}

class PlayControl extends TimeEngine {
  constructor(engine) {
    super(engine.audioContext);

    this.scheduler = getScheduler(engine.audioContext);

    this.__engine = null;
    this.__interface = null;
    this.__schedulerHook = null;

    this.__loopControl = null;
    this.__loopStart = 0;
    this.__loopEnd = Infinity;

    // synchronized tie, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;

    // non-zero "user" speed
    this.__playingSpeed = 1;

    if (engine.master)
      throw new Error("object has already been added to a master");

    var speed = this.__speed;

    var getCurrentTime = () => {
      return this.currentTime;
    };

    var getCurrentPosition = () => {
      return this.currentPosition;
    };

    if (engine.implementsSpeedControlled()) {
      // add time engine that implements speed-controlled interface
      this.__engine = engine;
      this.__interface = "speed-controlled";
      engine.setSpeedControlled(this, getCurrentTime, getCurrentPosition);
    } else if (engine.implementsTransported()) {
      // add time engine that implements transported interface
      this.__engine = engine;
      this.__interface = "transported";

      engine.setTransported(this, 0, (nextEnginePosition = null) => {
        // resetNextPosition
        if (nextEnginePosition === null) {
          var time = this.scheduler.currentTime;
          var position = this.__getPositionAtTime(time);
          nextEnginePosition = engine.syncPosition(time, position, this.__speed);
        }

        this.__resetNextPosition(nextEnginePosition);
      }, getCurrentTime, getCurrentPosition);
    } else if (engine.implementsScheduled()) {
      // add time engine that implements scheduled interface
      this.__engine = engine;
      this.__interface = "scheduled";

      this.scheduler.add(engine, Infinity, getCurrentPosition);
    } else {
      throw new Error("object cannot be added to play control");
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
   * Extrapolate playing position for given time
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
   * @return {Number} current playing position
   */
  __resetNextPosition(nextPosition) {
    if (this.__schedulerHook)
      this.__schedulerHook.resetNextTime(this.__getTimeAtPosition(nextPosition));

    this.__nextPosition = nextPosition;
  }

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the play-control is added to a master.
   */
  get currentTime() {
    return this.scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current playing position
   *
   * This function will be replaced when the play-control is added to a master.
   */
  get currentPosition() {
    return this.__position + (this.scheduler.currentTime - this.__time) * this.__speed;
  }

  set loop(enable) {
    if (enable) {
      if (this.__loopStart > -Infinity && this.__loopEnd < Infinity) {
        this.__loopControl = new PlayControlLoopControl(this);
        this.scheduler.add(this.__loopControl, Infinity);
        
        var speed = this.__speed;
        if (speed !== 0)
          this.__rescheduleLoopControl(this.__position, speed);
      }
    } else if (this.__loopControl) {
      this.scheduler.remove(this.__loopControl);
      this.__loopControl = null;
    }
  }

  get loop() {
    return (!!this.__loopControl);
  }

  setLoopBoundaries(start, end) {
    if (end >= start) {
      this.__loopStart = start;
      this.__loopEnd = end;
    } else {
      this.__loopStart = end;
      this.__loopEnd = start;
    }

    this.loop = this.loop;
  }

  set loopStart(startTime) {
    this.setLoopBoundaries(startTime, this.__loopEnd);
  }

  get loopStart() {
    return this.__loopStart;
  }

  set loopEnd(endTime) {
    this.setLoopBoundaries(this.__loopStart, endTime);
  }

  get loopEnd() {
    return this.__loopEnd;
  }

  __applyLoopBoundaries(position, speed, seek) {
    if (this.__loopControl) {
      if (speed > 0 && position >= this.__loopEnd)
        return this.__loopStart + (position - this.__loopStart) % (this.__loopEnd - this.__loopStart);
      else if (speed < 0 && position < this.__loopStart)
        return this.__loopEnd - (this.__loopEnd - position) % (this.__loopEnd - this.__loopStart);
    }

    return position;
  }

  __rescheduleLoopControl(position, speed) {
    if (this.__loopControl) {
      if (speed > 0) {
        this.__loopControl.speed = speed;
        this.scheduler.reset(this.__loopControl, this.__getTimeAtPosition(this.__loopEnd));
      } else if (speed < 0) {
        this.__loopControl.speed = speed;
        this.scheduler.reset(this.__loopControl, this.__getTimeAtPosition(this.__loopStart));
      } else {
        this.scheduler.reset(this.__loopControl, Infinity);
      }
    }
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed, seek = false) {
    var lastSpeed = this.__speed;

    if (speed !== lastSpeed || seek) {
      if (seek || lastSpeed === 0)
        position = this.__applyLoopBoundaries(position, speed);

      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      switch (this.__interface) {
        case "speed-controlled":
          this.__engine.syncSpeed(time, position, speed, seek);
          break;

        case "transported":
          var nextPosition = this.__nextPosition;

          if (seek) {
            nextPosition = this.__engine.syncPosition(time, position, speed);
          } else if (lastSpeed === 0) {
            // start
            nextPosition = this.__engine.syncPosition(time, position, speed);

            // add scheduler hook to scheduler (will be rescheduled to appropriate time below)
            this.__schedulerHook = new PlayControlSchedulerHook(this);
            this.scheduler.add(this.__schedulerHook, Infinity);
          } else if (speed === 0) {
            // stop
            nextPosition = Infinity;

            if (this.__engine.syncSpeed)
              this.__engine.syncSpeed(time, position, 0);

            // remove scheduler hook from scheduler
            this.scheduler.remove(this.__schedulerHook);
            this.__schedulerHook = null;
          } else if (speed * lastSpeed < 0) { // change transport direction
            nextPosition = this.__engine.syncPosition(time, position, speed);
          } else if (this.__engine.syncSpeed) {
            this.__engine.syncSpeed(time, position, speed);
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

      this.__rescheduleLoopControl(position, speed);
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
        speed = -16;
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
   * Set (jump to) playing position
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
    this.__engine.resetInterface();
  }
}

module.exports = PlayControl;