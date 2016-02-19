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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7O0FBRWIsSUFBSSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMzRCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNoRCxJQUFJLGVBQWUsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUMzRCxJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsWUFBWSxDQUFDOztJQUVqRCxXQUFXO0FBQ0osV0FEUCxXQUFXLENBQ0gsV0FBVyxFQUFFOzBCQURyQixXQUFXOztBQUViLHFDQUZFLFdBQVcsNkNBRUw7O0FBRVIsUUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7QUFDakMsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUN2QixRQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQztHQUN2Qjs7WUFQRyxXQUFXOztlQUFYLFdBQVc7QUFVZixlQUFXOzs7O2FBQUEscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFlBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDckMsWUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztBQUM5QixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLFlBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRXZCLFlBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNiLHFCQUFXLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2hELGlCQUFPLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQyxNQUFNLElBQUksS0FBSyxHQUFH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QUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXpCLFlBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLGNBQUksS0FBSyxHQUFHLElBQUksRUFDZCxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQ1YsSUFBSSxLQUFLLEdBQUcsR0FBRyxFQUNsQixLQUFLLEdBQUcsR0FBRyxDQUFDO1NBQ2YsTUFBTTtBQUNMLGNBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxFQUNkLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUNWLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxFQUNwQixLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUM7U0FDakI7O0FBRUQsWUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7O0FBRTVCLFlBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDaEQ7Ozs7OztXQU1RLFlBQUc7QUFDVixlQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7T0FDNUI7O0FBTUQsUUFBSTs7Ozs7OzthQUFBLGNBQUMsUUFBUSxFQUFFO0FBQ2IsWUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNoQyxjQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsY0FBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDcEQ7T0FDRjs7OztTQWpQRyxXQUFXO0dBQVMsVUFBVTs7QUFvUHBDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6ImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVmYXVsdEF1ZGlvQ29udGV4dCA9IHJlcXVpcmUoXCIuLi9jb3JlL2F1ZGlvLWNvbnRleHRcIik7XG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xudmFyIFNjaGVkdWxpbmdRdWV1ZSA9IHJlcXVpcmUoXCIuLi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlXCIpO1xudmFyIGdldFNjaGVkdWxlciA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzJykuZ2V0U2NoZWR1bGVyO1xuXG5jbGFzcyBMb29wQ29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLmxvd2VyID0gLUluZmluaXR5O1xuICAgIHRoaXMudXBwZXIgPSBJbmZpbml0eTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBzcGVlZCA9IHBsYXlDb250cm9sLnNwZWVkO1xuICAgIHZhciBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgdmFyIHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCBsb3dlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIpO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgdXBwZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICByZXNjaGVkdWxlKHNwZWVkKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBsb3dlciA9IE1hdGgubWluKHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuICAgIHZhciB1cHBlciA9IE1hdGgubWF4KHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMubG93ZXIgPSBsb3dlcjtcbiAgICB0aGlzLnVwcGVyID0gdXBwZXI7XG5cbiAgICBpZiAobG93ZXIgPT09IHVwcGVyKVxuICAgICAgc3BlZWQgPSAwO1xuXG4gICAgaWYgKHNwZWVkID4gMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIgLSAxZS02KSk7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlciArIDFlLTYpKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBhcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgdmFyIHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPj0gdXBwZXIpXG4gICAgICByZXR1cm4gbG93ZXIgKyAocG9zaXRpb24gLSBsb3dlcikgJSAodXBwZXIgLSBsb3dlcik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uIDwgbG93ZXIpXG4gICAgICByZXR1cm4gdXBwZXIgLSAodXBwZXIgLSBwb3NpdGlvbikgJSAodXBwZXIgLSBsb3dlcik7XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrKTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5tYXN0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG59XG5cbmNsYXNzIFRyYW5zcG9ydGVkU2NoZWR1bGVySG9vayBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgcGxheUNvbnRyb2wuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIGVuZ2luZSA9IHRoaXMuX19lbmdpbmU7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgdmFyIG5leHRUaW1lID0gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgd2hpbGUgKG5leHRUaW1lIDw9IHRpbWUpIHtcbiAgICAgIG5leHRQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgICAgbmV4dFRpbWUgPSBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbikge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3BsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2xsZWRUcmFuc3BvcnRlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBuZXcgVHJhbnNwb3J0ZWRTY2hlZHVsZXJIb29rKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG5cbiAgICBpZiAoc2Vlaykge1xuICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgLy8gc3RhcnRcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgLy8gc3RvcFxuICAgICAgbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICAgIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZClcbiAgICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAvLyBjaGFuZ2UgdHJhbnNwb3J0IGRpcmVjdGlvblxuICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKSB7XG4gICAgICAvLyBjaGFuZ2Ugc3BlZWRcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICAgIHZhciB0aW1lID0gcGxheUNvbnRyb2wuX19zeW5jKCk7XG5cbiAgICAgIHBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcGxheUNvbnRyb2wuX19wb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG51bGw7XG5cbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuY2xhc3MgU2NoZWR1bGVkU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuYWRkKGVuZ2luZSwgSW5maW5pdHkpO1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBTY2hlZHVsZWRTY2hlZHVsaW5nUXVldWUocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAobGFzdFNwZWVkID09PSAwICYmIHNwZWVkICE9PSAwKSAvLyBzdGFydCBvciBzZWVrXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZSgpO1xuICAgIGVsc2UgaWYgKGxhc3RTcGVlZCAhPT0gMCAmJiBzcGVlZCA9PT0gMCkgLy8gc3RvcFxuICAgICAgdGhpcy5fX2VuZ2luZS5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlLmRlc3Ryb3koKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoZW5naW5lLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCBkZWZhdWx0QXVkaW9Db250ZXh0O1xuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIodGhpcy5hdWRpb0NvbnRleHQpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcblxuICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2xvb3BTdGFydCA9IDA7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBJbmZpbml0eTtcblxuICAgIC8vIHN5bmNocm9uaXplZCB0aWUsIHBvc2l0aW9uLCBhbmQgc3BlZWRcbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuXG4gICAgLy8gbm9uLXplcm8gXCJ1c2VyXCIgc3BlZWRcbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gMTtcblxuICAgIGlmIChlbmdpbmUpXG4gICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG4gIH1cblxuICBfX3NldEVuZ2luZShlbmdpbmUpIHtcbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKCkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKCkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRUcmFuc3BvcnRlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHBsYXkgY29udHJvbFwiKTtcbiAgfVxuXG4gIF9fcmVzZXRFbmdpbmUoKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHRpbWUgZm9yIGdpdmVuIHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGV4dHJhcG9sYXRlZCB0aW1lXG4gICAqL1xuICBfX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX190aW1lICsgKHBvc2l0aW9uIC0gdGhpcy5fX3Bvc2l0aW9uKSAvIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUvZXh0cmFwb2xhdGUgcGxheWluZyBwb3NpdGlvbiBmb3IgZ2l2ZW4gdGltZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHBvc2l0aW9uXG4gICAqL1xuICBfX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX3N5bmMoKSB7XG4gICAgdmFyIG5vdyA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uICs9IChub3cgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gICAgdGhpcy5fX3RpbWUgPSBub3c7XG4gICAgcmV0dXJuIG5vdztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgdGltZVxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgcGxheS1jb250cm9sIGlzIGFkZGVkIHRvIGEgbWFzdGVyLlxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgcGxheWluZyBwb3NpdGlvblxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgcGxheS1jb250cm9sIGlzIGFkZGVkIHRvIGEgbWFzdGVyLlxuICAgKi9cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuXG4gIHNldChlbmdpbmUgPSBudWxsKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHZhciBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQgIT09IG51bGwgJiYgdGhpcy5fX3BsYXlDb250cm9sbGVkLl9fZW5naW5lICE9PSBlbmdpbmUpIHtcblxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcblxuICAgICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZClcbiAgICAgICAgdGhpcy5fX3Jlc2V0RW5naW5lKCk7XG5cblxuICAgICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCA9PT0gbnVsbCAmJiBlbmdpbmUgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fX3NldEVuZ2luZShlbmdpbmUpO1xuXG4gICAgICAgIGlmIChzcGVlZCAhPT0gMClcbiAgICAgICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXQgbG9vcChlbmFibGUpIHtcbiAgICBpZiAoZW5hYmxlICYmIHRoaXMuX19sb29wU3RhcnQgPiAtSW5maW5pdHkgJiYgdGhpcy5fX2xvb3BFbmQgPCBJbmZpbml0eSkge1xuICAgICAgaWYgKCF0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbmV3IExvb3BDb250cm9sKHRoaXMpO1xuICAgICAgICB0aGlzLl9fc2NoZWR1bGVyLmFkZCh0aGlzLl9fbG9vcENvbnRyb2wsIEluZmluaXR5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sLnJlc2NoZWR1bGUodGhpcy5fX3NwZWVkKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgdGhpcy5fX3NjaGVkdWxlci5yZW1vdmUodGhpcy5fX2xvb3BDb250cm9sKTtcbiAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGxvb3AoKSB7XG4gICAgcmV0dXJuICghIXRoaXMuX19sb29wQ29udHJvbCk7XG4gIH1cblxuICBzZXRMb29wQm91bmRhcmllcyhsb29wU3RhcnQsIGxvb3BFbmQpIHtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gbG9vcFN0YXJ0O1xuICAgIHRoaXMuX19sb29wRW5kID0gbG9vcEVuZDtcblxuICAgIHRoaXMubG9vcCA9IHRoaXMubG9vcDtcbiAgfVxuXG4gIHNldCBsb29wU3RhcnQobG9vcFN0YXJ0KSB7XG4gICAgdGhpcy5zZXRMb29wQm91bmRhcmllcyhsb29wU3RhcnQsIHRoaXMuX19sb29wRW5kKTtcbiAgfVxuXG4gIGdldCBsb29wU3RhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wU3RhcnQ7XG4gIH1cblxuICBzZXQgbG9vcEVuZChsb29wRW5kKSB7XG4gICAgdGhpcy5zZXRMb29wQm91bmRhcmllcyh0aGlzLl9fbG9vcFN0YXJ0LCBsb29wRW5kKTtcbiAgfVxuXG4gIGdldCBsb29wRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9fbG9vcEVuZDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmICgoc2VlayB8fCBsYXN0U3BlZWQgPT09IDApICYmIHRoaXMuX19sb29wQ29udHJvbClcbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9fbG9vcENvbnRyb2wuYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKTtcblxuICAgICAgaWYgKHRoaXMuX19sb29wQ29udHJvbClcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sLnJlc2NoZWR1bGUoc3BlZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBwbGF5aW5nXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCB0aGlzLl9fcGxheWluZ1NwZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZSBwbGF5aW5nXG4gICAqL1xuICBwYXVzZSgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHBsYXlpbmdcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gICAgdGhpcy5zZWVrKDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwbGF5aW5nIHNwZWVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzcGVlZCBwbGF5aW5nIHNwZWVkIChub24temVybyBzcGVlZCBiZXR3ZWVuIC0xNiBhbmQgLTEvMTYgb3IgYmV0d2VlbiAxLzE2IGFuZCAxNilcbiAgICovXG4gIHNldCBzcGVlZChzcGVlZCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcblxuICAgIGlmIChzcGVlZCA+PSAwKSB7XG4gICAgICBpZiAoc3BlZWQgPCAwLjAxKVxuICAgICAgICBzcGVlZCA9IDAuMDE7XG4gICAgICBlbHNlIGlmIChzcGVlZCA+IDEwMClcbiAgICAgICAgc3BlZWQgPSAxMDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzcGVlZCA8IC0xMDApXG4gICAgICAgIHNwZWVkID0gLTEwMDtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gLTAuMDEpXG4gICAgICAgIHNwZWVkID0gLTAuMDE7XG4gICAgfVxuXG4gICAgdGhpcy5fX3BsYXlpbmdTcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwbGF5aW5nIHNwZWVkXG4gICAqIEByZXR1cm4gY3VycmVudCBwbGF5aW5nIHNwZWVkXG4gICAqL1xuICBnZXQgc3BlZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5aW5nU3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0IChqdW1wIHRvKSBwbGF5aW5nIHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiB0YXJnZXQgcG9zaXRpb25cbiAgICovXG4gIHNlZWsocG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24gIT09IHRoaXMuX19wb3NpdGlvbikge1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgdGhpcy5fX3NwZWVkLCB0cnVlKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5Q29udHJvbDsiXX0=