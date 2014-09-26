/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio play control class, provides play control to a single engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;

var TimeEngine = require("../time-engine");
var PriorityQueue = require("../priority-queue");
var scheduler = require("../scheduler");

var PlayControlScheduledCell = (function(super$0){if(!PRS$0)MIXIN$0(PlayControlScheduledCell, super$0);var proto$0={};
  function PlayControlScheduledCell(playControl) {
    super$0.call(this);
    this.__playControl = playControl;
  }if(super$0!==null)SP$0(PlayControlScheduledCell,super$0);PlayControlScheduledCell.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":PlayControlScheduledCell,"configurable":true,"writable":true}});DP$0(PlayControlScheduledCell,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // TimeEngine method scheduled interface)
  proto$0.advanceTime = function(time) {
    var playControl = this.__playControl;
    var position = playControl.__getPositionAtTime(time);
    var nextPosition = playControl.__transportedEngine.advancePosition(time, position, this.__speed);
    return playControl.__getTimeAtPosition(nextPosition);
  };
MIXIN$0(PlayControlScheduledCell.prototype,proto$0);proto$0=void 0;return PlayControlScheduledCell;})(TimeEngine);

var PlayControl = (function(super$0){if(!PRS$0)MIXIN$0(PlayControl, super$0);var proto$0={};
  function PlayControl(engine) {var this$0 = this;
    super$0.call(this);

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

      var getCurrentTime = function()  {
        return this$0.currentTime;
      };

      var getCurrentPosition = function()  {
        return this$0.currentPosition;
      };

      if (TimeEngine.implementsSpeedControlled(engine)) {
        // add time engine with speed-controlled interface
        this.__engine = engine;
        engine.setSpeedControlled(this, getCurrentTime, getCurrentPosition);
      } else if (TimeEngine.implementsTransported(engine)) {
        // add time engine with transported interface
        this.__engine = engine;

        engine.setTransported(this, 0, function()  {var nextPosition = arguments[0];if(nextPosition === void 0)nextPosition = null;
          // resetNextPosition
          if (nextPosition === null) {
            var time = scheduler.currentTime;
            var position = this$0.__getPositionAtTime(time);
            nextPosition = engine.syncPosition(time, position, this$0.__speed);
          }

          this$0.__resetNextPosition(nextPosition);
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
  }if(super$0!==null)SP$0(PlayControl,super$0);PlayControl.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":PlayControl,"configurable":true,"writable":true}, currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}, currentPosition: {"get": $currentPosition_get$0, "configurable":true,"enumerable":true}, speed: {"get": $speed_get$0, "set": $speed_set$0, "configurable":true,"enumerable":true}});DP$0(PlayControl,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  /**
   * Extrapolate transport time for given position
   * @param {Number} position position
   * @return {Number} extrapolated time
   */
  proto$0.__getTimeAtPosition = function(position) {
    return this.__time + (position - this.__position) / this.__speed;
  };

  /**
   * Extrapolate transport position for given time
   * @param {Number} time time
   * @return {Number} extrapolated position
   */
  proto$0.__getPositionAtTime = function(time) {
    return this.__position + (time - this.__time) * this.__speed;
  };

  proto$0.__sync = function() {
    var now = this.currentTime;
    this.__position += (now - this.__time) * this.__speed;
    this.__time = now;
    return now;
  };

  /**
   * Get current master position
   * @return {Number} current transport position
   */
  proto$0.__resetNextPosition = function(nextPosition) {
    if (this.__scheduledCell)
      this.__scheduledCell.resetNextTime(this.__getTimeAtPosition(nextPosition));

    this.__nextPosition = nextPosition;
  };

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master.
   */
  function $currentTime_get$0() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
   *
   * This function will be replaced when the transport is added to a master.
   */
  function $currentPosition_get$0() {
    return this.__position + (scheduler.currentTime - this.__time) * this.__speed;
  }

  // TimeEngine method (speed-controlled interface)
  proto$0.syncSpeed = function(time, position, speed) {var seek = arguments[3];if(seek === void 0)seek = false;
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
  };

  /**
   * Start playing
   */
  proto$0.start = function() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, this.__playingSpeed);
  };

  /**
   * Pause playing
   */
  proto$0.pause = function() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
  };

  /**
   * Stop playing
   */
  proto$0.stop = function() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
    this.seek(0);
  };

  /**
   * Set playing speed
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  function $speed_set$0(speed) {
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
  function $speed_get$0() {
    return this.__playingSpeed;
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  proto$0.seek = function(position) {
    if (position !== this.__position) {
      var time = this.__sync();
      this.__position = position;
      this.syncSpeed(time, position, this.__speed, true);
    }
  };

  /**
   * Remove time engine from the transport
   */
  proto$0.clear = function() {
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
  };
MIXIN$0(PlayControl.prototype,proto$0);proto$0=void 0;return PlayControl;})(TimeEngine);

module.exports = PlayControl;