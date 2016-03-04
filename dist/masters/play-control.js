"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var defaultAudioContext = _interopRequire(require("../core/audio-context"));

var TimeEngine = _interopRequire(require("../core/time-engine"));

var SchedulingQueue = _interopRequire(require("../utils/scheduling-queue"));

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9tYXN0ZXJzL3BsYXktY29udHJvbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFPLG1CQUFtQiwyQkFBTSx1QkFBdUI7O0lBQ2hELFVBQVUsMkJBQU0scUJBQXFCOztJQUNyQyxlQUFlLDJCQUFNLDJCQUEyQjs7SUFDOUMsWUFBWSxXQUFRLGFBQWEsRUFBakMsWUFBWTs7SUFFZixXQUFXO0FBQ0osV0FEUCxXQUFXLENBQ0gsV0FBVyxFQUFFOzBCQURyQixXQUFXOztBQUViLHFDQUZFLFdBQVcsNkNBRUw7O0FBRVIsUUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7QUFDakMsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUN2QixRQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztHQUN2Qjs7WUFQRyxXQUFXOztlQUFYLFdBQVc7QUFVZixlQUFXOzs7O2FBQUEscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFlBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDckMsWUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztBQUM5QixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLFlBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRXZCLFlBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNiLHFCQUFXLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hELGlCQUFPLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQyxNQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNwQixxQkFBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoRCxpQkFBTyxXQUFXLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0M7O0FBRUQsZUFBTyxRQUFRLENBQUM7T0FDakI7O0FBRUQsY0FBVTthQUFBLG9CQUFDLEtBQUssRUFBRTtBQUNoQixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3JDLFlBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckUsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFckUsWUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsWUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsWUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7O0FBRW5CLFlBQUksS0FBSyxLQUFLLEtBQUssRUFDakIsS0FBSyxHQUFHLENBQUMsQ0FBQzs7QUFFWixZQUFJLEtBQUssR0FBRyxDQUFDLEVBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsS0FBSyxHQUFHLFFBQUksQ0FBQyxDQUFDLENBQUMsS0FDM0QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEdBQUcsUUFBSSxDQUFDLENBQUMsQ0FBQyxLQUU5RCxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzVCOztBQUVELHVCQUFtQjthQUFBLDZCQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUU7QUFDbkMsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2QixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUV2QixZQUFJLEtBQUssR0FBRyxDQUFDLElBQUksUUFBUSxJQUFJLEtBQUs7QUFDaEMsaUJBQU8sS0FBSyxHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQSxJQUFLLEtBQUssR0FBRyxLQUFLLENBQUEsQUFBQyxDQUFDO2VBQ2pELElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxRQUFRLEdBQUcsS0FBSztBQUNwQyxpQkFBTyxLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFBLElBQUssS0FBSyxHQUFHLEtBQUssQ0FBQSxBQUFDLENBQUM7U0FBQSxBQUV0RCxPQUFPLFFBQVEsQ0FBQztPQUNqQjs7OztTQXpERyxXQUFXO0dBQVMsVUFBVTs7SUE0RDlCLGNBQWM7QUFDUCxXQURQLGNBQWMsQ0FDTixXQUFXLEVBQUUsTUFBTSxFQUFFOzBCQUQ3QixjQUFjOztBQUVoQixRQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztBQUNqQyxRQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQzs7QUFFdkIsVUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7R0FDdEI7O2VBTkcsY0FBYztBQVFsQixhQUFTO2FBQUEsbUJBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtBQUNoRCxZQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztPQUN0RDs7QUFFRyxlQUFXO1dBQUEsWUFBRztBQUNoQixlQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO09BQ3ZDOztBQUVHLG1CQUFlO1dBQUEsWUFBRztBQUNwQixlQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO09BQzNDOztBQUVELFdBQU87YUFBQSxtQkFBRztBQUNSLFlBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7QUFFNUIsWUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7T0FDdEI7Ozs7U0F6QkcsY0FBYzs7O0lBNEJkLDZCQUE2QjtBQUN0QixXQURQLDZCQUE2QixDQUNyQixXQUFXLEVBQUUsTUFBTSxFQUFFOzBCQUQ3Qiw2QkFBNkI7O0FBRS9CLHFDQUZFLDZCQUE2Qiw2Q0FFekIsV0FBVyxFQUFFLE1BQU0sRUFBRTtHQUM1Qjs7WUFIRyw2QkFBNkI7O1NBQTdCLDZCQUE2QjtHQUFTLGNBQWM7O0lBTXBELHdCQUF3QjtBQUNqQixXQURQLHdCQUF3QixDQUNoQixXQUFXLEVBQUUsTUFBTSxFQUFFOzBCQUQ3Qix3QkFBd0I7O0FBRTFCLHFDQUZFLHdCQUF3Qiw2Q0FFbEI7O0FBRVIsUUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7QUFDakMsUUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO0FBQy9CLGVBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztHQUM3Qzs7WUFURyx3QkFBd0I7O2VBQXhCLHdCQUF3QjtBQVc1QixlQUFXO2FBQUEscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFlBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDckMsWUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQixZQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQ25DLFlBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDL0UsWUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUU3RCxlQUFPLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDdkIsc0JBQVksR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNFLGtCQUFRLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzFEOztBQUVELFlBQUksQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDO0FBQ25DLGVBQU8sUUFBUSxDQUFDO09BQ2pCOztBQUVELGlCQUFhO2FBQUEseUJBQWlDO1lBQWhDLFFBQVEsZ0NBQUcsSUFBSSxDQUFDLGNBQWM7O0FBQzFDLFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDNUQsWUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFDL0IsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN0Qjs7QUFFRCxXQUFPO2FBQUEsbUJBQUc7QUFDUixZQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTVDLFlBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFlBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO09BQ3RCOzs7O1NBdENHLHdCQUF3QjtHQUFTLFVBQVU7O0lBeUMzQyx5QkFBeUI7QUFDbEIsV0FEUCx5QkFBeUIsQ0FDakIsV0FBVyxFQUFFLE1BQU0sRUFBRTswQkFEN0IseUJBQXlCOztBQUUzQixxQ0FGRSx5QkFBeUIsNkNBRXJCLFdBQVcsRUFBRSxNQUFNLEVBQUU7O0FBRTNCLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7R0FDMUU7O1lBTEcseUJBQXlCOztlQUF6Qix5QkFBeUI7QUFPN0IsYUFBUzthQUFBLG1CQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7QUFDaEQsWUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQzs7QUFFdkMsWUFBSSxJQUFJLEVBQUU7QUFDUixzQkFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbEUsTUFBTSxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7O0FBRTFCLHNCQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNsRSxNQUFNLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTs7QUFFdEIsc0JBQVksR0FBRyxRQUFRLENBQUM7O0FBRXhCLGNBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQ3pCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDOUMsTUFBTSxJQUFJLEtBQUssR0FBRyxTQUFTLEdBQUcsQ0FBQyxFQUFFOztBQUVoQyxzQkFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDbEUsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFOztBQUVsQyxjQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ2hEOztBQUVELFlBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ2xEOztBQUVELHVCQUFtQjthQUFBLDZCQUFDLE1BQU0sRUFBd0I7WUFBdEIsUUFBUSxnQ0FBRyxTQUFTOztBQUM5QyxZQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDMUIsY0FBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUNyQyxjQUFJLElBQUksR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRWhDLGtCQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFGOztBQUVELFlBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzlDOztBQUVELFdBQU87YUFBQSxtQkFBRztBQUNSLFlBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDL0IsWUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7O0FBRTVCLHlDQS9DRSx5QkFBeUIseUNBK0NYO09BQ2pCOzs7O1NBaERHLHlCQUF5QjtHQUFTLGNBQWM7O0lBbURoRCx3QkFBd0I7QUFDakIsV0FEUCx3QkFBd0IsQ0FDaEIsV0FBVyxFQUFFLE1BQU0sRUFBRTswQkFEN0Isd0JBQXdCOztBQUUxQixxQ0FGRSx3QkFBd0IsNkNBRWxCO0FBQ1IsUUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7QUFDakMsUUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNCLGVBQVcsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztHQUM3Qzs7WUFSRyx3QkFBd0I7O2VBQXhCLHdCQUF3QjtBQVV4QixlQUFXO1dBQUEsWUFBRztBQUNoQixlQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDO09BQ3ZDOztBQUVHLG1CQUFlO1dBQUEsWUFBRztBQUNwQixlQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO09BQzNDOztBQUVELFdBQU87YUFBQSxtQkFBRztBQUNSLFlBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFM0IsWUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7T0FDdEI7Ozs7U0F4Qkcsd0JBQXdCO0dBQVMsZUFBZTs7SUEyQmhELHVCQUF1QjtBQUNoQixXQURQLHVCQUF1QixDQUNmLFdBQVcsRUFBRSxNQUFNLEVBQUU7MEJBRDdCLHVCQUF1Qjs7QUFFekIscUNBRkUsdUJBQXVCLDZDQUVuQixXQUFXLEVBQUUsTUFBTSxFQUFFO0FBQzNCLFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztHQUM1RTs7WUFKRyx1QkFBdUI7O2VBQXZCLHVCQUF1QjtBQU0zQixhQUFTO2FBQUEsbUJBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtBQUNoRCxZQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUM7QUFDaEMsY0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUN2QixJQUFJLFNBQVMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUM7QUFDckMsY0FBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDckM7O0FBRUQsV0FBTzthQUFBLG1CQUFHO0FBQ1IsWUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLHlDQWZFLHVCQUF1Qix5Q0FlVDtPQUNqQjs7OztTQWhCRyx1QkFBdUI7R0FBUyxjQUFjOztJQW1CL0IsV0FBVztBQUNuQixXQURRLFdBQVcsQ0FDbEIsTUFBTSxFQUFnQjtRQUFkLE9BQU8sZ0NBQUcsRUFBRTs7MEJBRGIsV0FBVzs7QUFFNUIscUNBRmlCLFdBQVcsNkNBRXBCOztBQUVSLFFBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksSUFBSSxtQkFBbUIsQ0FBQztBQUNoRSxRQUFJLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRW5ELFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7O0FBRTdCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDOzs7QUFHMUIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7OztBQUdqQixRQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQzs7QUFFeEIsUUFBSSxNQUFNLEVBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1Qjs7WUF2QmtCLFdBQVc7O2VBQVgsV0FBVztBQXlCOUIsZUFBVzthQUFBLHFCQUFDLE1BQU0sRUFBRTtBQUNsQixZQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDOztBQUUvRCxZQUFJLE1BQU0sQ0FBQyx5QkFBeUIsRUFBRSxFQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsS0FDckUsSUFBSSxNQUFNLENBQUMscUJBQXFCLEVBQUUsRUFDckMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUkseUJBQXlCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQ2pFLElBQUksTUFBTSxDQUFDLG1CQUFtQixFQUFFLEVBQ25DLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHVCQUF1QixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUVsRSxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7T0FDN0Q7O0FBRUQsaUJBQWE7YUFBQSx5QkFBRztBQUNkLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNoQyxZQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO09BQzlCOztBQU9ELHVCQUFtQjs7Ozs7Ozs7YUFBQSw2QkFBQyxRQUFRLEVBQUU7QUFDNUIsZUFBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUEsR0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDO09BQ2xFOztBQU9ELHVCQUFtQjs7Ozs7Ozs7YUFBQSw2QkFBQyxJQUFJLEVBQUU7QUFDeEIsZUFBTyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUEsR0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDO09BQzlEOztBQUVELFVBQU07YUFBQSxrQkFBRztBQUNQLFlBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDM0IsWUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN0RCxZQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztBQUNsQixlQUFPLEdBQUcsQ0FBQztPQUNaOztBQVFHLGVBQVc7Ozs7Ozs7OztXQUFBLFlBQUc7QUFDaEIsZUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztPQUNyQzs7QUFRRyxtQkFBZTs7Ozs7Ozs7O1dBQUEsWUFBRztBQUNwQixlQUFPLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFBLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQztPQUN0Rjs7QUFHRCxPQUFHO2FBQUEsZUFBZ0I7WUFBZixNQUFNLGdDQUFHLElBQUk7O0FBQ2YsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLFlBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7O0FBRXpCLFlBQUksSUFBSSxDQUFDLGdCQUFnQixLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxLQUFLLE1BQU0sRUFBRTs7QUFFL0UsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFekMsY0FBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQ3ZCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFHdkIsY0FBSSxJQUFJLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7QUFDckQsZ0JBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXpCLGdCQUFJLEtBQUssS0FBSyxDQUFDLEVBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztXQUNoRDtTQUNGO09BQ0Y7O0FBaUJHLFFBQUk7V0FmQSxVQUFDLE1BQU0sRUFBRTtBQUNmLFlBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLEVBQUU7QUFDdkUsY0FBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7QUFDdkIsZ0JBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsZ0JBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7V0FDcEQ7O0FBRUQsY0FBSSxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsRUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQy9DLE1BQU0sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQzdCLGNBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1QyxjQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztTQUMzQjtPQUNGO1dBRU8sWUFBRztBQUNULGVBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUU7T0FDL0I7O0FBRUQscUJBQWlCO2FBQUEsMkJBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRTtBQUNwQyxZQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUM3QixZQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQzs7QUFFekIsWUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQ3ZCOztBQU1HLGFBQVM7V0FKQSxVQUFDLFNBQVMsRUFBRTtBQUN2QixZQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNuRDtXQUVZLFlBQUc7QUFDZCxlQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7T0FDekI7O0FBTUcsV0FBTztXQUpBLFVBQUMsT0FBTyxFQUFFO0FBQ25CLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ25EO1dBRVUsWUFBRztBQUNaLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztPQUN2Qjs7QUFHRCxhQUFTOzs7O2FBQUEsbUJBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQWdCO1lBQWQsSUFBSSxnQ0FBRyxLQUFLOztBQUMzQyxZQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztBQUU3QixZQUFJLEtBQUssS0FBSyxTQUFTLElBQUksSUFBSSxFQUFFO0FBQy9CLGNBQUksQ0FBQyxJQUFJLElBQUksU0FBUyxLQUFLLENBQUMsQ0FBQSxJQUFLLElBQUksQ0FBQyxhQUFhLEVBQ2pELFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFckUsY0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsY0FBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsY0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7O0FBRXJCLGNBQUksSUFBSSxDQUFDLGdCQUFnQixFQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQzs7QUFFMUUsY0FBSSxJQUFJLENBQUMsYUFBYSxFQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN4QztPQUNGOztBQUtELFNBQUs7Ozs7OzthQUFBLGlCQUFHO0FBQ04sWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQzVEOztBQUtELFNBQUs7Ozs7OzthQUFBLGlCQUFHO0FBQ04sWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDMUM7O0FBS0QsUUFBSTs7Ozs7O2FBQUEsZ0JBQUc7QUFDTCxZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QyxZQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ2Q7O0FBK0JHLFNBQUs7Ozs7Ozs7V0F6QkEsVUFBQyxLQUFLLEVBQUU7QUFDZixZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXpCLFlBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLGNBQUksS0FBSyxHQUFHLElBQUksRUFDZCxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQ1YsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUNsQixLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQ2YsTUFBTTtBQUNMLGNBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxFQUNkLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUNWLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxFQUNwQixLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDakI7O0FBRUQsWUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7O0FBRTVCLFlBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDaEQ7Ozs7OztXQU1RLFlBQUc7QUFDVixlQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7T0FDNUI7O0FBTUQsUUFBSTs7Ozs7OzthQUFBLGNBQUMsUUFBUSxFQUFFO0FBQ2IsWUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNoQyxjQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsY0FBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDcEQ7T0FDRjs7OztTQWpQa0IsV0FBVztHQUFTLFVBQVU7O2lCQUE5QixXQUFXIiwiZmlsZSI6ImVzNi9tYXN0ZXJzL3BsYXktY29udHJvbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZSc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cbmNsYXNzIExvb3BDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMubG93ZXIgPSAtSW5maW5pdHk7XG4gICAgdGhpcy51cHBlciA9IEluZmluaXR5O1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIHNwZWVkID0gcGxheUNvbnRyb2wuc3BlZWQ7XG4gICAgdmFyIGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICB2YXIgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIGxvd2VyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlcik7XG4gICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCB1cHBlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHJlc2NoZWR1bGUoc3BlZWQpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIGxvd2VyID0gTWF0aC5taW4ocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG4gICAgdmFyIHVwcGVyID0gTWF0aC5tYXgocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG5cbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgdGhpcy5sb3dlciA9IGxvd2VyO1xuICAgIHRoaXMudXBwZXIgPSB1cHBlcjtcblxuICAgIGlmIChsb3dlciA9PT0gdXBwZXIpXG4gICAgICBzcGVlZCA9IDA7XG5cbiAgICBpZiAoc3BlZWQgPiAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlciAtIDFlLTYpKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyICsgMWUtNikpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGFwcGx5TG9vcEJvdW5kYXJpZXMocG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICB2YXIgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA+PSB1cHBlcilcbiAgICAgIHJldHVybiBsb3dlciArIChwb3NpdGlvbiAtIGxvd2VyKSAlICh1cHBlciAtIGxvd2VyKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPCBsb3dlcilcbiAgICAgIHJldHVybiB1cHBlciAtICh1cHBlciAtIHBvc2l0aW9uKSAlICh1cHBlciAtIGxvd2VyKTtcblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWspO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sbGVkU3BlZWRDb250cm9sbGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cbn1cblxuY2xhc3MgVHJhbnNwb3J0ZWRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgZW5naW5lID0gdGhpcy5fX2VuZ2luZTtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG5cbiAgICB3aGlsZSAobmV4dFRpbWUgPD0gdGltZSkge1xuICAgICAgbmV4dFBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgICBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRlZFNjaGVkdWxlckhvb2socGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcblxuICAgIGlmIChzZWVrKSB7XG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAvLyBzdGFydFxuICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAvLyBzdG9wXG4gICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gICAgfSBlbHNlIGlmIChzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgIC8vIGNoYW5nZSB0cmFuc3BvcnQgZGlyZWN0aW9uXG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpIHtcbiAgICAgIC8vIGNoYW5nZSBzcGVlZFxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgICAgdmFyIHRpbWUgPSBwbGF5Q29udHJvbC5fX3N5bmMoKTtcblxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwbGF5Q29udHJvbC5fX3Bvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2suZGVzdHJveSgpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5jbGFzcyBTY2hlZHVsZWRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gICAgcGxheUNvbnRyb2wuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZSh0aGlzLl9fZW5naW5lKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFNjaGVkdWxlZFNjaGVkdWxpbmdRdWV1ZShwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChsYXN0U3BlZWQgPT09IDAgJiYgc3BlZWQgIT09IDApIC8vIHN0YXJ0IG9yIHNlZWtcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKCk7XG4gICAgZWxzZSBpZiAobGFzdFNwZWVkICE9PSAwICYmIHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUuZGVzdHJveSgpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5Q29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihlbmdpbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IGRlZmF1bHRBdWRpb0NvbnRleHQ7XG4gICAgdGhpcy5fX3NjaGVkdWxlciA9IGdldFNjaGVkdWxlcih0aGlzLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuXG4gICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IEluZmluaXR5O1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZSlcbiAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcbiAgfVxuXG4gIF9fc2V0RW5naW5lKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzVHJhbnNwb3J0ZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZSBpZiAoZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gcGxheSBjb250cm9sXCIpO1xuICB9XG5cbiAgX19yZXNldEVuZ2luZSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgdGltZSBmb3IgZ2l2ZW4gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHRpbWVcbiAgICovXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICB2YXIgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG5cbiAgc2V0KGVuZ2luZSA9IG51bGwpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCAhPT0gbnVsbCAmJiB0aGlzLl9fcGxheUNvbnRyb2xsZWQuX19lbmdpbmUgIT09IGVuZ2luZSkge1xuXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcmVzZXRFbmdpbmUoKTtcblxuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkID09PSBudWxsICYmIGVuZ2luZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKVxuICAgICAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldCBsb29wKGVuYWJsZSkge1xuICAgIGlmIChlbmFibGUgJiYgdGhpcy5fX2xvb3BTdGFydCA+IC1JbmZpbml0eSAmJiB0aGlzLl9fbG9vcEVuZCA8IEluZmluaXR5KSB7XG4gICAgICBpZiAoIXRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBuZXcgTG9vcENvbnRyb2wodGhpcyk7XG4gICAgICAgIHRoaXMuX19zY2hlZHVsZXIuYWRkKHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIHNldCBsb29wRW5kKGxvb3BFbmQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGxvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHBsYXlpbmdcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHRoaXMuX19wbGF5aW5nU3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlIHBsYXlpbmdcbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcGxheWluZ1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgICB0aGlzLnNlZWsoMCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkIHBsYXlpbmcgc3BlZWQgKG5vbi16ZXJvIHNwZWVkIGJldHdlZW4gLTE2IGFuZCAtMS8xNiBvciBiZXR3ZWVuIDEvMTYgYW5kIDE2KVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHJldHVybiBjdXJyZW50IHBsYXlpbmcgc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlpbmdTcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgKGp1bXAgdG8pIHBsYXlpbmcgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuIl19