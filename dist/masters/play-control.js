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

        while (nextTime === time) {
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

        var transport = this.__transport;
        var time = transport.__getTimeAtPosition(position);

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
    __syncTransportedPosition: {
      value: function __syncTransportedPosition(time, position, speed) {
        var numTransportedEngines = this.__transported.length;
        var nextPosition = Infinity;

        if (numTransportedEngines > 0) {
          var engine, nextEnginePosition;

          this.__transportedQueue.destroy();
          this.__transportedQueue.reverse = speed < 0;

          for (var i = numTransportedEngines - 1; i > 0; i--) {
            engine = this.__transported[i];
            nextEnginePosition = engine.syncPosition(time, position, speed);
            this.__transportedQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
          }

          engine = this.__transported[0];
          nextEnginePosition = engine.syncPosition(time, position, speed);
          nextPosition = this.__transportedQueue.insert(engine, nextEnginePosition, true); // insert and sort
        }

        return nextPosition;
      }
    },
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

        var nextTime = this.__playControl.__getTimeAtPosition(nextPosition);
        this.__schedulerHook.resetTime(nextTime);

        this.__nextPosition = nextPosition;
      }
    },
    resetEnginePosition: {
      value: function resetEnginePosition(engine, position) {
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
    playControl.scheduler.add(this, Infinity);
  }

  _inherits(ScheduledSchedulingQueue, _SchedulingQueue);

  _createClass(ScheduledSchedulingQueue, {
    currentTime: {
      get: function () {
        this.__playControl.currentTime();
      }
    },
    currentPosition: {
      get: function () {
        this.__playControl.currentPosition();
      }
    },
    destroy: {
      value: function destroy() {
        this.__playControl.scheduler.remove(this);
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
        if (lastSpeed === 0) // start or seek
          this.__engine.resetTime(0);else if (speed === 0) // stop
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
    _classCallCheck(this, PlayControl);

    _get(_core.Object.getPrototypeOf(PlayControl.prototype), "constructor", this).call(this);

    this.__scheduler = getScheduler(engine.audioContext);

    this.__loopControl = null;
    this.__loopStart = 0;
    this.__loopEnd = Infinity;

    // synchronized tie, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    // non-zero "user" speed
    this.__playingSpeed = 1;

    if (engine.master) throw new Error("object has already been added to a master");

    if (engine.implementsSpeedControlled()) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (engine.implementsTransported()) this.__playControlled = new PlayControlledTransported(this, engine);else if (engine.implementsScheduled()) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
  }

  _inherits(PlayControl, _TimeEngine3);

  _createClass(PlayControl, {
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

          this.__playControlled.syncSpeed(time, position, speed, seek, lastSpeed);

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
    },
    clear: {

      /**
       * Remove time engine from the transport
       */

      value: function clear() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, 0);

        this.__playControlled.destroy();
        this.__playControlled = null;
      }
    }
  });

  return PlayControl;
})(TimeEngine);

module.exports = PlayControl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0QsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDaEQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDM0QsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFlBQVksQ0FBQzs7SUFFakQsV0FBVztBQUNKLFdBRFAsV0FBVyxDQUNILFdBQVcsRUFBRTswQkFEckIsV0FBVzs7QUFFYixxQ0FGRSxXQUFXLDZDQUVMOztBQUVSLFFBQUksQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDdkIsUUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7R0FDdkI7O1lBUEcsV0FBVzs7ZUFBWCxXQUFXO0FBVWYsZUFBVzs7OzthQUFBLHFCQUFDLElBQUksRUFBRTtBQUNoQixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3JDLFlBQUksS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7QUFDOUIsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN2QixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztBQUV2QixZQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDYixxQkFBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoRCxpQkFBTyxXQUFXLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDL0MsTUFBTSxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFD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cmljdCc7XG5cbnZhciBkZWZhdWx0QXVkaW9Db250ZXh0ID0gcmVxdWlyZShcIi4uL2NvcmUvYXVkaW8tY29udGV4dFwiKTtcbnZhciBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG52YXIgU2NoZWR1bGluZ1F1ZXVlID0gcmVxdWlyZShcIi4uL3V0aWxzL3NjaGVkdWxpbmctcXVldWVcIik7XG52YXIgZ2V0U2NoZWR1bGVyID0gcmVxdWlyZSgnLi9mYWN0b3JpZXMnKS5nZXRTY2hlZHVsZXI7XG5cbmNsYXNzIExvb3BDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMubG93ZXIgPSAtSW5maW5pdHk7XG4gICAgdGhpcy51cHBlciA9IEluZmluaXR5O1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIHNwZWVkID0gcGxheUNvbnRyb2wuc3BlZWQ7XG4gICAgdmFyIGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICB2YXIgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIGxvd2VyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlcik7XG4gICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCB1cHBlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHJlc2NoZWR1bGUoc3BlZWQpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIGxvd2VyID0gTWF0aC5taW4ocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG4gICAgdmFyIHVwcGVyID0gTWF0aC5tYXgocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG5cbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgdGhpcy5sb3dlciA9IGxvd2VyO1xuICAgIHRoaXMudXBwZXIgPSB1cHBlcjtcblxuICAgIGlmIChsb3dlciA9PT0gdXBwZXIpXG4gICAgICBzcGVlZCA9IDA7XG5cbiAgICBpZiAoc3BlZWQgPiAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlciAtIDFlLTYpKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyICsgMWUtNikpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGFwcGx5TG9vcEJvdW5kYXJpZXMocG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICB2YXIgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA+PSB1cHBlcilcbiAgICAgIHJldHVybiBsb3dlciArIChwb3NpdGlvbiAtIGxvd2VyKSAlICh1cHBlciAtIGxvd2VyKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPCBsb3dlcilcbiAgICAgIHJldHVybiB1cHBlciAtICh1cHBlciAtIHBvc2l0aW9uKSAlICh1cHBlciAtIGxvd2VyKTtcblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWspO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sbGVkU3BlZWRDb250cm9sbGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cbn1cblxuY2xhc3MgVHJhbnNwb3J0ZWRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgZW5naW5lID0gdGhpcy5fX2VuZ2luZTtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG5cbiAgICB3aGlsZSAobmV4dFRpbWUgPT09IHRpbWUpIHtcbiAgICAgIG5leHRQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgICAgbmV4dFRpbWUgPSBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbikge1xuICAgIHZhciB0cmFuc3BvcnQgPSB0aGlzLl9fdHJhbnNwb3J0O1xuICAgIHZhciB0aW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRlZFNjaGVkdWxlckhvb2socGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBudW1UcmFuc3BvcnRlZEVuZ2luZXMgPSB0aGlzLl9fdHJhbnNwb3J0ZWQubGVuZ3RoO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB2YXIgZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb247XG5cbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLnJldmVyc2UgPSAoc3BlZWQgPCAwKTtcblxuICAgICAgZm9yICh2YXIgaSA9IG51bVRyYW5zcG9ydGVkRW5naW5lcyAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkW2ldO1xuICAgICAgICBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbiwgZmFsc2UpOyAvLyBpbnNlcnQgYnV0IGRvbid0IHNvcnRcbiAgICAgIH1cblxuICAgICAgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkWzBdO1xuICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUuaW5zZXJ0KGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uLCB0cnVlKTsgLy8gaW5zZXJ0IGFuZCBzb3J0XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuXG4gICAgaWYgKHNlZWspIHtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgIC8vIHN0YXJ0XG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgIC8vIHN0b3BcbiAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICB9IGVsc2UgaWYgKHNwZWVkICogbGFzdFNwZWVkIDwgMCkge1xuICAgICAgLy8gY2hhbmdlIHRyYW5zcG9ydCBkaXJlY3Rpb25cbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCkge1xuICAgICAgLy8gY2hhbmdlIHNwZWVkXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH1cblxuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRUaW1lKG5leHRUaW1lKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2suZGVzdHJveSgpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5jbGFzcyBTY2hlZHVsZWRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gICAgcGxheUNvbnRyb2wuc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lKCk7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb24oKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLnNjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBTY2hlZHVsZWRTY2hlZHVsaW5nUXVldWUocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAobGFzdFNwZWVkID09PSAwKSAvLyBzdGFydCBvciBzZWVrXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZSgwKTtcbiAgICBlbHNlIGlmIChzcGVlZCA9PT0gMCkgLy8gc3RvcFxuICAgICAgdGhpcy5fX2VuZ2luZS5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlLmRlc3Ryb3koKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIoZW5naW5lLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSAwO1xuICAgIHRoaXMuX19sb29wRW5kID0gSW5maW5pdHk7XG5cbiAgICAvLyBzeW5jaHJvbml6ZWQgdGllLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIC8vIG5vbi16ZXJvIFwidXNlclwiIHNwZWVkXG4gICAgdGhpcy5fX3BsYXlpbmdTcGVlZCA9IDE7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKCkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKCkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRUcmFuc3BvcnRlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHBsYXkgY29udHJvbFwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUvZXh0cmFwb2xhdGUgcGxheWluZyB0aW1lIGZvciBnaXZlbiBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgdGltZVxuICAgKi9cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgcG9zaXRpb24gZm9yIGdpdmVuIHRpbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGV4dHJhcG9sYXRlZCBwb3NpdGlvblxuICAgKi9cbiAgX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jKCkge1xuICAgIHZhciBub3cgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiArPSAobm93IC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICAgIHRoaXMuX190aW1lID0gbm93O1xuICAgIHJldHVybiBub3c7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHRpbWVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHBsYXlpbmcgcG9zaXRpb25cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgc2V0IGxvb3AoZW5hYmxlKSB7XG4gICAgaWYgKGVuYWJsZSAmJiB0aGlzLl9fbG9vcFN0YXJ0ID4gLUluZmluaXR5ICYmIHRoaXMuX19sb29wRW5kIDwgSW5maW5pdHkpIHtcbiAgICAgIGlmICghdGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG5ldyBMb29wQ29udHJvbCh0aGlzKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkdWxlci5hZGQodGhpcy5fX2xvb3BDb250cm9sLCBJbmZpbml0eSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbC5yZXNjaGVkdWxlKHRoaXMuX19zcGVlZCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgIHRoaXMuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMuX19sb29wQ29udHJvbCk7XG4gICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldCBsb29wKCkge1xuICAgIHJldHVybiAoISF0aGlzLl9fbG9vcENvbnRyb2wpO1xuICB9XG5cbiAgc2V0TG9vcEJvdW5kYXJpZXMobG9vcFN0YXJ0LCBsb29wRW5kKSB7XG4gICAgdGhpcy5fX2xvb3BTdGFydCA9IGxvb3BTdGFydDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IGxvb3BFbmQ7XG5cbiAgICB0aGlzLmxvb3AgPSB0aGlzLmxvb3A7XG4gIH1cblxuICBzZXQgbG9vcFN0YXJ0KGxvb3BTdGFydCkge1xuICAgIHRoaXMuc2V0TG9vcEJvdW5kYXJpZXMobG9vcFN0YXJ0LCB0aGlzLl9fbG9vcEVuZCk7XG4gIH1cblxuICBnZXQgbG9vcFN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLl9fbG9vcFN0YXJ0O1xuICB9XG5cbiAgc2V0IGxvb3BFbmQobG9vcEVuZCkge1xuICAgIHRoaXMuc2V0TG9vcEJvdW5kYXJpZXModGhpcy5fX2xvb3BTdGFydCwgbG9vcEVuZCk7XG4gIH1cblxuICBnZXQgbG9vcEVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BFbmQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UpXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWsgPSBmYWxzZSkge1xuICAgIHZhciBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCBzZWVrKSB7XG4gICAgICBpZiAoKHNlZWsgfHwgbGFzdFNwZWVkID09PSAwKSAmJiB0aGlzLl9fbG9vcENvbnRyb2wpXG4gICAgICAgIHBvc2l0aW9uID0gdGhpcy5fX2xvb3BDb250cm9sLmFwcGx5TG9vcEJvdW5kYXJpZXMocG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcblxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCk7XG5cbiAgICAgIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpXG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbC5yZXNjaGVkdWxlKHNwZWVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcGxheWluZ1xuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgdGhpcy5fX3BsYXlpbmdTcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgcGxheWluZ1xuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBwbGF5aW5nXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICAgIHRoaXMuc2VlaygwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGxheWluZyBzcGVlZFxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWQgcGxheWluZyBzcGVlZCAobm9uLXplcm8gc3BlZWQgYmV0d2VlbiAtMTYgYW5kIC0xLzE2IG9yIGJldHdlZW4gMS8xNiBhbmQgMTYpXG4gICAqL1xuICBzZXQgc3BlZWQoc3BlZWQpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG5cbiAgICBpZiAoc3BlZWQgPj0gMCkge1xuICAgICAgaWYgKHNwZWVkIDwgMC4wMSlcbiAgICAgICAgc3BlZWQgPSAwLjAxO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAxMDApXG4gICAgICAgIHNwZWVkID0gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3BlZWQgPCAtMTAwKVxuICAgICAgICBzcGVlZCA9IC0xMDA7XG4gICAgICBlbHNlIGlmIChzcGVlZCA+IC0wLjAxKVxuICAgICAgICBzcGVlZCA9IC0wLjAxO1xuICAgIH1cblxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSBzcGVlZDtcblxuICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGxheWluZyBzcGVlZFxuICAgKiBAcmV0dXJuIGN1cnJlbnQgcGxheWluZyBzcGVlZFxuICAgKi9cbiAgZ2V0IHNwZWVkKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheWluZ1NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCAoanVtcCB0bykgcGxheWluZyBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gdGFyZ2V0IHBvc2l0aW9uXG4gICAqL1xuICBzZWVrKHBvc2l0aW9uKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB0aGlzLl9fcG9zaXRpb24pIHtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCwgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aW1lIGVuZ2luZSBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheUNvbnRyb2w7Il19