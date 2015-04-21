"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var defaultAudioContext = require("../core/audio-context");
var TimeEngine = require("../core/time-engine");
var SchedulingQueue = require("../utils/scheduling-queue");
var getScheduler = require("./factories").getScheduler;

var LoopControl = (function (_TimeEngine) {
  function LoopControl(playControl) {
    _classCallCheck(this, LoopControl);

    _get(_core.Object.getPrototypeOf(LoopControl.prototype), "constructor", this).call(this);

    this.__playControl = playControl;
    this.lower = -Infinity;
    this.upper = Infinity;
  }

  _inherits(LoopControl, _TimeEngine);

  _createClass(LoopControl, {
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        var playControl = this.__playControl;
        var speed = playControl.speed;
        var lower = this.lower;
        var upper = this.upper;

        if (speed > 0) {
          playControl.syncSpeed(time, lower, speed, true);
          return playControl.__getTimeAtPosition(upper);
        } else if (speed < 0) {
          playControl.syncSpeed(time, upper, speed, true);
          return playControl.__getTimeAtPosition(lower);
        }

        return Infinity;
      }
    },
    reschedule: {
      value: function reschedule(speed) {
        var playControl = this.__playControl;
        var lower = Math.min(playControl.__loopStart, playControl.__loopEnd);
        var upper = Math.max(playControl.__loopStart, playControl.__loopEnd);

        this.speed = speed;
        this.lower = lower;
        this.upper = upper;

        if (lower === upper) speed = 0;

        if (speed > 0) this.resetTime(playControl.__getTimeAtPosition(upper - 0.000001));else if (speed < 0) this.resetTime(playControl.__getTimeAtPosition(lower + 0.000001));else this.resetTime(Infinity);
      }
    },
    applyLoopBoundaries: {
      value: function applyLoopBoundaries(position, speed) {
        var lower = this.lower;
        var upper = this.upper;

        if (speed > 0 && position >= upper) {
          return lower + (position - lower) % (upper - lower);
        } else if (speed < 0 && position < lower) {
          return upper - (upper - position) % (upper - lower);
        }return position;
      }
    }
  });

  return LoopControl;
})(TimeEngine);

var PlayControlled = (function () {
  function PlayControlled(playControl, engine) {
    _classCallCheck(this, PlayControlled);

    this.__playControl = playControl;
    this.__engine = engine;

    engine.master = this;
  }

  _createClass(PlayControlled, {
    syncSpeed: {
      value: function syncSpeed(time, position, speed, seek, lastSpeed) {
        this.__engine.syncSpeed(time, position, speed, seek);
      }
    },
    currentTime: {
      get: function () {
        return this.__playControl.currentTime;
      }
    },
    currentPosition: {
      get: function () {
        return this.__playControl.currentPosition;
      }
    },
    destroy: {
      value: function destroy() {
        this.__engine.master = null;

        this.__playControl = null;
        this.__engine = null;
      }
    }
  });

  return PlayControlled;
})();

var PlayControlledSpeedControlled = (function (_PlayControlled) {
  function PlayControlledSpeedControlled(playControl, engine) {
    _classCallCheck(this, PlayControlledSpeedControlled);

    _get(_core.Object.getPrototypeOf(PlayControlledSpeedControlled.prototype), "constructor", this).call(this, playControl, engine);
  }

  _inherits(PlayControlledSpeedControlled, _PlayControlled);

  return PlayControlledSpeedControlled;
})(PlayControlled);

var TransportedSchedulerHook = (function (_TimeEngine2) {
  function TransportedSchedulerHook(playControl, engine) {
    _classCallCheck(this, TransportedSchedulerHook);

    _get(_core.Object.getPrototypeOf(TransportedSchedulerHook.prototype), "constructor", this).call(this);

    this.__playControl = playControl;
    this.__engine = engine;

    this.__nextPosition = Infinity;
    playControl.__scheduler.add(this, Infinity);
  }

  _inherits(TransportedSchedulerHook, _TimeEngine2);

  _createClass(TransportedSchedulerHook, {
    advanceTime: {
      value: function advanceTime(time) {
        var playControl = this.__playControl;
        var engine = this.__engine;
        var position = this.__nextPosition;
        var nextPosition = engine.advancePosition(time, position, playControl.__speed);
        var nextTime = playControl.__getTimeAtPosition(nextPosition);

        while (nextTime <= time) {
          nextPosition = engine.advancePosition(time, position, playControl.__speed);
          nextTime = playControl.__getTimeAtPosition(nextPosition);
        }

        this.__nextPosition = nextPosition;
        return nextTime;
      }
    },
    resetPosition: {
      value: function resetPosition() {
        var position = arguments[0] === undefined ? this.__nextPosition : arguments[0];

        var time = this.__playControl.__getTimeAtPosition(position);
        this.__nextPosition = position;
        this.resetTime(time);
      }
    },
    destroy: {
      value: function destroy() {
        this.__playControl.__scheduler.remove(this);

        this.__playControl = null;
        this.__engine = null;
      }
    }
  });

  return TransportedSchedulerHook;
})(TimeEngine);

var PlayControlledTransported = (function (_PlayControlled2) {
  function PlayControlledTransported(playControl, engine) {
    _classCallCheck(this, PlayControlledTransported);

    _get(_core.Object.getPrototypeOf(PlayControlledTransported.prototype), "constructor", this).call(this, playControl, engine);

    this.__schedulerHook = new TransportedSchedulerHook(playControl, engine);
  }

  _inherits(PlayControlledTransported, _PlayControlled2);

  _createClass(PlayControlledTransported, {
    syncSpeed: {
      value: function syncSpeed(time, position, speed, seek, lastSpeed) {
        var nextPosition = this.__nextPosition;

        if (seek) {
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (lastSpeed === 0) {
          // start
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (speed === 0) {
          // stop
          nextPosition = Infinity;

          if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, 0);
        } else if (speed * lastSpeed < 0) {
          // change transport direction
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (this.__engine.syncSpeed) {
          // change speed
          this.__engine.syncSpeed(time, position, speed);
        }

        this.__schedulerHook.resetPosition(nextPosition);
      }
    },
    resetEnginePosition: {
      value: function resetEnginePosition(engine) {
        var position = arguments[1] === undefined ? undefined : arguments[1];

        if (position === undefined) {
          var playControl = this.__playControl;
          var time = playControl.__sync();

          position = this.__engine.syncPosition(time, playControl.__position, playControl.__speed);
        }

        this.__schedulerHook.resetPosition(position);
      }
    },
    destroy: {
      value: function destroy() {
        this.__schedulerHook.destroy();
        this.__schedulerHook = null;

        _get(_core.Object.getPrototypeOf(PlayControlledTransported.prototype), "destroy", this).call(this);
      }
    }
  });

  return PlayControlledTransported;
})(PlayControlled);

var ScheduledSchedulingQueue = (function (_SchedulingQueue) {
  function ScheduledSchedulingQueue(playControl, engine) {
    _classCallCheck(this, ScheduledSchedulingQueue);

    _get(_core.Object.getPrototypeOf(ScheduledSchedulingQueue.prototype), "constructor", this).call(this);
    this.__playControl = playControl;
    this.__engine = engine;

    this.add(engine, Infinity);
    playControl.__scheduler.add(this, Infinity);
  }

  _inherits(ScheduledSchedulingQueue, _SchedulingQueue);

  _createClass(ScheduledSchedulingQueue, {
    currentTime: {
      get: function () {
        return this.__playControl.currentTime;
      }
    },
    currentPosition: {
      get: function () {
        return this.__playControl.currentPosition;
      }
    },
    destroy: {
      value: function destroy() {
        this.__playControl.__scheduler.remove(this);
        this.remove(this.__engine);

        this.__playControl = null;
        this.__engine = null;
      }
    }
  });

  return ScheduledSchedulingQueue;
})(SchedulingQueue);

var PlayControlledScheduled = (function (_PlayControlled3) {
  function PlayControlledScheduled(playControl, engine) {
    _classCallCheck(this, PlayControlledScheduled);

    _get(_core.Object.getPrototypeOf(PlayControlledScheduled.prototype), "constructor", this).call(this, playControl, engine);
    this.__schedulingQueue = new ScheduledSchedulingQueue(playControl, engine);
  }

  _inherits(PlayControlledScheduled, _PlayControlled3);

  _createClass(PlayControlledScheduled, {
    syncSpeed: {
      value: function syncSpeed(time, position, speed, seek, lastSpeed) {
        if (lastSpeed === 0 && speed !== 0) // start or seek
          this.__engine.resetTime();else if (lastSpeed !== 0 && speed === 0) // stop
          this.__engine.resetTime(Infinity);
      }
    },
    destroy: {
      value: function destroy() {
        this.__schedulingQueue.destroy();
        _get(_core.Object.getPrototypeOf(PlayControlledScheduled.prototype), "destroy", this).call(this);
      }
    }
  });

  return PlayControlledScheduled;
})(PlayControlled);

var PlayControl = (function (_TimeEngine3) {
  function PlayControl(engine) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, PlayControl);

    _get(_core.Object.getPrototypeOf(PlayControl.prototype), "constructor", this).call(this);

    this.audioContext = options.audioContext || defaultAudioContext;
    this.__scheduler = getScheduler(this.audioContext);

    this.__playControlled = null;

    this.__loopControl = null;
    this.__loopStart = 0;
    this.__loopEnd = Infinity;

    // synchronized tie, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    // non-zero "user" speed
    this.__playingSpeed = 1;

    if (engine) this.__setEngine(engine);
  }

  _inherits(PlayControl, _TimeEngine3);

  _createClass(PlayControl, {
    __setEngine: {
      value: function __setEngine(engine) {
        if (engine.master) throw new Error("object has already been added to a master");

        if (engine.implementsSpeedControlled()) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (engine.implementsTransported()) this.__playControlled = new PlayControlledTransported(this, engine);else if (engine.implementsScheduled()) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
      }
    },
    __resetEngine: {
      value: function __resetEngine() {
        this.__playControlled.destroy();
        this.__playControlled = null;
      }
    },
    __getTimeAtPosition: {

      /**
       * Calculate/extrapolate playing time for given position
       * @param {Number} position position
       * @return {Number} extrapolated time
       */

      value: function __getTimeAtPosition(position) {
        return this.__time + (position - this.__position) / this.__speed;
      }
    },
    __getPositionAtTime: {

      /**
       * Calculate/extrapolate playing position for given time
       * @param {Number} time time
       * @return {Number} extrapolated position
       */

      value: function __getPositionAtTime(time) {
        return this.__position + (time - this.__time) * this.__speed;
      }
    },
    __sync: {
      value: function __sync() {
        var now = this.currentTime;
        this.__position += (now - this.__time) * this.__speed;
        this.__time = now;
        return now;
      }
    },
    currentTime: {

      /**
       * Get current master time
       * @return {Number} current time
       *
       * This function will be replaced when the play-control is added to a master.
       */

      get: function () {
        return this.__scheduler.currentTime;
      }
    },
    currentPosition: {

      /**
       * Get current master position
       * @return {Number} current playing position
       *
       * This function will be replaced when the play-control is added to a master.
       */

      get: function () {
        return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
      }
    },
    set: {
      value: function set() {
        var engine = arguments[0] === undefined ? null : arguments[0];

        var time = this.__sync();
        var speed = this.__speed;

        if (this.__playControlled !== null && this.__playControlled.__engine !== engine) {

          this.syncSpeed(time, this.__position, 0);

          if (this.__playControlled) this.__resetEngine();

          if (this.__playControlled === null && engine !== null) {
            this.__setEngine(engine);

            if (speed !== 0) this.syncSpeed(time, this.__position, speed);
          }
        }
      }
    },
    loop: {
      set: function (enable) {
        if (enable && this.__loopStart > -Infinity && this.__loopEnd < Infinity) {
          if (!this.__loopControl) {
            this.__loopControl = new LoopControl(this);
            this.__scheduler.add(this.__loopControl, Infinity);
          }

          if (this.__speed !== 0) this.__loopControl.reschedule(this.__speed);
        } else if (this.__loopControl) {
          this.__scheduler.remove(this.__loopControl);
          this.__loopControl = null;
        }
      },
      get: function () {
        return !!this.__loopControl;
      }
    },
    setLoopBoundaries: {
      value: function setLoopBoundaries(loopStart, loopEnd) {
        this.__loopStart = loopStart;
        this.__loopEnd = loopEnd;

        this.loop = this.loop;
      }
    },
    loopStart: {
      set: function (loopStart) {
        this.setLoopBoundaries(loopStart, this.__loopEnd);
      },
      get: function () {
        return this.__loopStart;
      }
    },
    loopEnd: {
      set: function (loopEnd) {
        this.setLoopBoundaries(this.__loopStart, loopEnd);
      },
      get: function () {
        return this.__loopEnd;
      }
    },
    syncSpeed: {

      // TimeEngine method (speed-controlled interface)

      value: function syncSpeed(time, position, speed) {
        var seek = arguments[3] === undefined ? false : arguments[3];

        var lastSpeed = this.__speed;

        if (speed !== lastSpeed || seek) {
          if ((seek || lastSpeed === 0) && this.__loopControl) position = this.__loopControl.applyLoopBoundaries(position, speed);

          this.__time = time;
          this.__position = position;
          this.__speed = speed;

          if (this.__playControlled) this.__playControlled.syncSpeed(time, position, speed, seek, lastSpeed);

          if (this.__loopControl) this.__loopControl.reschedule(speed);
        }
      }
    },
    start: {

      /**
       * Start playing
       */

      value: function start() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, this.__playingSpeed);
      }
    },
    pause: {

      /**
       * Pause playing
       */

      value: function pause() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, 0);
      }
    },
    stop: {

      /**
       * Stop playing
       */

      value: function stop() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, 0);
        this.seek(0);
      }
    },
    speed: {

      /**
       * Set playing speed
       * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
       */

      set: function (speed) {
        var time = this.__sync();

        if (speed >= 0) {
          if (speed < 0.01) speed = 0.01;else if (speed > 100) speed = 100;
        } else {
          if (speed < -100) speed = -100;else if (speed > -0.01) speed = -0.01;
        }

        this.__playingSpeed = speed;

        if (this.__speed !== 0) this.syncSpeed(time, this.__position, speed);
      },

      /**
       * Get playing speed
       * @return current playing speed
       */
      get: function () {
        return this.__playingSpeed;
      }
    },
    seek: {

      /**
       * Set (jump to) playing position
       * @param {Number} position target position
       */

      value: function seek(position) {
        if (position !== this.__position) {
          var time = this.__sync();
          this.__position = position;
          this.syncSpeed(time, position, this.__speed, true);
        }
      }
    }
  });

  return PlayControl;
})(TimeEngine);

module.exports = PlayControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0QsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDaEQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDM0QsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFlBQVksQ0FBQzs7SUFFakQsV0FBVztBQUNKLFdBRFAsV0FBVyxDQUNILFdBQVcsRUFBRTswQkFEckIsV0FBVzs7QUFFYixxQ0FGRSxXQUFXLDZDQUVMOztBQUVSLFFBQUksQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDdkIsUUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7R0FDdkI7O1lBUEcsV0FBVzs7ZUFBWCxXQUFXO0FBVWYsZUFBVzs7OzthQUFBLHFCQUFDLElBQUksRUFBRTtBQUNoQixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3JDLFlBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7QUFDOUIsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2QixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUV2QixZQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDYixxQkFBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoRCxpQkFBTyxXQUFXLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0MsTUFBTSxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFD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SUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUV6QixZQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxjQUFJLEtBQUssR0FBRyxJQUFJLEVBQ2QsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUNWLElBQUksS0FBSyxHQUFHLEdBQUcsRUFDbEIsS0FBSyxHQUFHLEdBQUcsQ0FBQztTQUNmLE1BQU07QUFDTCxjQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsRUFDZCxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FDVixJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksRUFDcEIsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDO1NBQ2pCOztBQUVELFlBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDOztBQUU1QixZQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ2hEOzs7Ozs7V0FNUSxZQUFHO0FBQ1YsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDO09BQzVCOztBQU1ELFFBQUk7Ozs7Ozs7YUFBQSxjQUFDLFFBQVEsRUFBRTtBQUNiLFlBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDaEMsY0FBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLGNBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0FBQzNCLGNBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3BEO09BQ0Y7Ozs7U0FqUEcsV0FBVztHQUFTLFVBQVU7O0FBb1BwQyxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvc2NoZWR1bGluZy1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmF1bHRBdWRpb0NvbnRleHQgPSByZXF1aXJlKFwiLi4vY29yZS9hdWRpby1jb250ZXh0XCIpO1xudmFyIFRpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS90aW1lLWVuZ2luZVwiKTtcbnZhciBTY2hlZHVsaW5nUXVldWUgPSByZXF1aXJlKFwiLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZVwiKTtcbnZhciBnZXRTY2hlZHVsZXIgPSByZXF1aXJlKCcuL2ZhY3RvcmllcycpLmdldFNjaGVkdWxlcjtcblxuY2xhc3MgTG9vcENvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5sb3dlciA9IC1JbmZpbml0eTtcbiAgICB0aGlzLnVwcGVyID0gSW5maW5pdHk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgc3BlZWQgPSBwbGF5Q29udHJvbC5zcGVlZDtcbiAgICB2YXIgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIHZhciB1cHBlciA9IHRoaXMudXBwZXI7XG5cbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgbG93ZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHVwcGVyKTtcbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIHVwcGVyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgcmVzY2hlZHVsZShzcGVlZCkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgbG93ZXIgPSBNYXRoLm1pbihwbGF5Q29udHJvbC5fX2xvb3BTdGFydCwgcGxheUNvbnRyb2wuX19sb29wRW5kKTtcbiAgICB2YXIgdXBwZXIgPSBNYXRoLm1heChwbGF5Q29udHJvbC5fX2xvb3BTdGFydCwgcGxheUNvbnRyb2wuX19sb29wRW5kKTtcblxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLmxvd2VyID0gbG93ZXI7XG4gICAgdGhpcy51cHBlciA9IHVwcGVyO1xuXG4gICAgaWYgKGxvd2VyID09PSB1cHBlcilcbiAgICAgIHNwZWVkID0gMDtcblxuICAgIGlmIChzcGVlZCA+IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHVwcGVyIC0gMWUtNikpO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIgKyAxZS02KSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIHZhciB1cHBlciA9IHRoaXMudXBwZXI7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uID49IHVwcGVyKVxuICAgICAgcmV0dXJuIGxvd2VyICsgKHBvc2l0aW9uIC0gbG93ZXIpICUgKHVwcGVyIC0gbG93ZXIpO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA8IGxvd2VyKVxuICAgICAgcmV0dXJuIHVwcGVyIC0gKHVwcGVyIC0gcG9zaXRpb24pICUgKHVwcGVyIC0gbG93ZXIpO1xuXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2Vlayk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19lbmdpbmUubWFzdGVyID0gbnVsbDtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxufVxuXG5jbGFzcyBUcmFuc3BvcnRlZFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fZW5naW5lO1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIHZhciBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHdoaWxlIChuZXh0VGltZSA8PSB0aW1lKSB7XG4gICAgICBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICAgIG5leHRUaW1lID0gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFRyYW5zcG9ydGVkU2NoZWR1bGVySG9vayhwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuXG4gICAgaWYgKHNlZWspIHtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgIC8vIHN0YXJ0XG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgIC8vIHN0b3BcbiAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICB9IGVsc2UgaWYgKHNwZWVkICogbGFzdFNwZWVkIDwgMCkge1xuICAgICAgLy8gY2hhbmdlIHRyYW5zcG9ydCBkaXJlY3Rpb25cbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCkge1xuICAgICAgLy8gY2hhbmdlIHNwZWVkXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH1cblxuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24oZW5naW5lLCBwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgICB2YXIgdGltZSA9IHBsYXlDb250cm9sLl9fc3luYygpO1xuXG4gICAgICBwb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBsYXlDb250cm9sLl9fcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIH1cblxuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5kZXN0cm95KCk7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBudWxsO1xuXG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbmNsYXNzIFNjaGVkdWxlZFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICB0aGlzLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlKHRoaXMuX19lbmdpbmUpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUgPSBuZXcgU2NoZWR1bGVkU2NoZWR1bGluZ1F1ZXVlKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgaWYgKGxhc3RTcGVlZCA9PT0gMCAmJiBzcGVlZCAhPT0gMCkgLy8gc3RhcnQgb3Igc2Vla1xuICAgICAgdGhpcy5fX2VuZ2luZS5yZXNldFRpbWUoKTtcbiAgICBlbHNlIGlmIChsYXN0U3BlZWQgIT09IDAgJiYgc3BlZWQgPT09IDApIC8vIHN0b3BcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZS5kZXN0cm95KCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGVuZ2luZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgZGVmYXVsdEF1ZGlvQ29udGV4dDtcbiAgICB0aGlzLl9fc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyKHRoaXMuYXVkaW9Db250ZXh0KTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG5cbiAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSAwO1xuICAgIHRoaXMuX19sb29wRW5kID0gSW5maW5pdHk7XG5cbiAgICAvLyBzeW5jaHJvbml6ZWQgdGllLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIC8vIG5vbi16ZXJvIFwidXNlclwiIHNwZWVkXG4gICAgdGhpcy5fX3BsYXlpbmdTcGVlZCA9IDE7XG5cbiAgICBpZiAoZW5naW5lKVxuICAgICAgdGhpcy5fX3NldEVuZ2luZShlbmdpbmUpO1xuICB9XG5cbiAgX19zZXRFbmdpbmUoZW5naW5lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGlmIChlbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZSBpZiAoZW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZCgpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkU2NoZWR1bGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBwbGF5IGNvbnRyb2xcIik7XG4gIH1cblxuICBfX3Jlc2V0RW5naW5lKCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5kZXN0cm95KCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUvZXh0cmFwb2xhdGUgcGxheWluZyB0aW1lIGZvciBnaXZlbiBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgdGltZVxuICAgKi9cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgcG9zaXRpb24gZm9yIGdpdmVuIHRpbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGV4dHJhcG9sYXRlZCBwb3NpdGlvblxuICAgKi9cbiAgX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jKCkge1xuICAgIHZhciBub3cgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiArPSAobm93IC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICAgIHRoaXMuX190aW1lID0gbm93O1xuICAgIHJldHVybiBub3c7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHRpbWVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHBsYXlpbmcgcG9zaXRpb25cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cblxuICBzZXQoZW5naW5lID0gbnVsbCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB2YXIgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkICE9PSBudWxsICYmIHRoaXMuX19wbGF5Q29udHJvbGxlZC5fX2VuZ2luZSAhPT0gZW5naW5lKSB7XG5cbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19yZXNldEVuZ2luZSgpO1xuXG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQgPT09IG51bGwgJiYgZW5naW5lICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcblxuICAgICAgICBpZiAoc3BlZWQgIT09IDApXG4gICAgICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0IGxvb3AoZW5hYmxlKSB7XG4gICAgaWYgKGVuYWJsZSAmJiB0aGlzLl9fbG9vcFN0YXJ0ID4gLUluZmluaXR5ICYmIHRoaXMuX19sb29wRW5kIDwgSW5maW5pdHkpIHtcbiAgICAgIGlmICghdGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG5ldyBMb29wQ29udHJvbCh0aGlzKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkdWxlci5hZGQodGhpcy5fX2xvb3BDb250cm9sLCBJbmZpbml0eSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbC5yZXNjaGVkdWxlKHRoaXMuX19zcGVlZCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgIHRoaXMuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMuX19sb29wQ29udHJvbCk7XG4gICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldCBsb29wKCkge1xuICAgIHJldHVybiAoISF0aGlzLl9fbG9vcENvbnRyb2wpO1xuICB9XG5cbiAgc2V0TG9vcEJvdW5kYXJpZXMobG9vcFN0YXJ0LCBsb29wRW5kKSB7XG4gICAgdGhpcy5fX2xvb3BTdGFydCA9IGxvb3BTdGFydDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IGxvb3BFbmQ7XG5cbiAgICB0aGlzLmxvb3AgPSB0aGlzLmxvb3A7XG4gIH1cblxuICBzZXQgbG9vcFN0YXJ0KGxvb3BTdGFydCkge1xuICAgIHRoaXMuc2V0TG9vcEJvdW5kYXJpZXMobG9vcFN0YXJ0LCB0aGlzLl9fbG9vcEVuZCk7XG4gIH1cblxuICBnZXQgbG9vcFN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLl9fbG9vcFN0YXJ0O1xuICB9XG5cbiAgc2V0IGxvb3BFbmQobG9vcEVuZCkge1xuICAgIHRoaXMuc2V0TG9vcEJvdW5kYXJpZXModGhpcy5fX2xvb3BTdGFydCwgbG9vcEVuZCk7XG4gIH1cblxuICBnZXQgbG9vcEVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BFbmQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UpXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWsgPSBmYWxzZSkge1xuICAgIHZhciBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCBzZWVrKSB7XG4gICAgICBpZiAoKHNlZWsgfHwgbGFzdFNwZWVkID09PSAwKSAmJiB0aGlzLl9fbG9vcENvbnRyb2wpXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fX2xvb3BDb250cm9sLmFwcGx5TG9vcEJvdW5kYXJpZXMocG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcblxuICAgICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZClcbiAgICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCk7XG5cbiAgICAgIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpXG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbC5yZXNjaGVkdWxlKHNwZWVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcGxheWluZ1xuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgdGhpcy5fX3BsYXlpbmdTcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgcGxheWluZ1xuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBwbGF5aW5nXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICAgIHRoaXMuc2VlaygwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGxheWluZyBzcGVlZFxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWQgcGxheWluZyBzcGVlZCAobm9uLXplcm8gc3BlZWQgYmV0d2VlbiAtMTYgYW5kIC0xLzE2IG9yIGJldHdlZW4gMS8xNiBhbmQgMTYpXG4gICAqL1xuICBzZXQgc3BlZWQoc3BlZWQpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG5cbiAgICBpZiAoc3BlZWQgPj0gMCkge1xuICAgICAgaWYgKHNwZWVkIDwgMC4wMSlcbiAgICAgICAgc3BlZWQgPSAwLjAxO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAxMDApXG4gICAgICAgIHNwZWVkID0gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3BlZWQgPCAtMTAwKVxuICAgICAgICBzcGVlZCA9IC0xMDA7XG4gICAgICBlbHNlIGlmIChzcGVlZCA+IC0wLjAxKVxuICAgICAgICBzcGVlZCA9IC0wLjAxO1xuICAgIH1cblxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSBzcGVlZDtcblxuICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGxheWluZyBzcGVlZFxuICAgKiBAcmV0dXJuIGN1cnJlbnQgcGxheWluZyBzcGVlZFxuICAgKi9cbiAgZ2V0IHNwZWVkKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheWluZ1NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCAoanVtcCB0bykgcGxheWluZyBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gdGFyZ2V0IHBvc2l0aW9uXG4gICAqL1xuICBzZWVrKHBvc2l0aW9uKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB0aGlzLl9fcG9zaXRpb24pIHtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCwgdHJ1ZSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheUNvbnRyb2w7Il19