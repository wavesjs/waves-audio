"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");

var _require = require("./factories");

var getScheduler = _require.getScheduler;

var PlayControlSchedulerHook = (function (TimeEngine) {
  function PlayControlSchedulerHook(playControl) {
    _babelHelpers.classCallCheck(this, PlayControlSchedulerHook);

    _babelHelpers.get(_core.Object.getPrototypeOf(PlayControlSchedulerHook.prototype), "constructor", this).call(this);
    this.__playControl = playControl;
  }

  _babelHelpers.inherits(PlayControlSchedulerHook, TimeEngine);

  _babelHelpers.prototypeProperties(PlayControlSchedulerHook, null, {
    advanceTime: {
      value: function advanceTime(time) {
        var playControl = this.__playControl;
        var position = playControl.__getPositionAtTime(time);
        var nextPosition = playControl.__engine.advancePosition(time, position, playControl.__speed);

        if (nextPosition !== Infinity) {
          return playControl.__getTimeAtPosition(nextPosition);
        }return Infinity;
      },
      writable: true,
      configurable: true
    }
  });

  return PlayControlSchedulerHook;
})(TimeEngine);

var PlayControlLoopControl = (function (TimeEngine) {
  function PlayControlLoopControl(playControl) {
    _babelHelpers.classCallCheck(this, PlayControlLoopControl);

    _babelHelpers.get(_core.Object.getPrototypeOf(PlayControlLoopControl.prototype), "constructor", this).call(this);
    this.__playControl = playControl;
    this.speed = null;
  }

  _babelHelpers.inherits(PlayControlLoopControl, TimeEngine);

  _babelHelpers.prototypeProperties(PlayControlLoopControl, null, {
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        if (this.speed > 0) {
          this.__playControl.syncSpeed(time, this.__playControl.__loopStart, this.speed, true);
          return this.__playControl.__getTimeAtPosition(this.__playControl.__loopEnd);
        } else if (this.speed < 0) {
          this.__playControl.syncSpeed(time, this.__playControl.__loopEnd, this.speed, true);
          return this.__playControl.__getTimeAtPosition(this.__playControl.__loopStart);
        }

        return Infinity;
      },
      writable: true,
      configurable: true
    }
  });

  return PlayControlLoopControl;
})(TimeEngine);

var PlayControl = (function (TimeEngine) {
  function PlayControl(engine) {
    var _this = this;

    _babelHelpers.classCallCheck(this, PlayControl);

    _babelHelpers.get(_core.Object.getPrototypeOf(PlayControl.prototype), "constructor", this).call(this, engine.audioContext);

    // future assignment
    // this.scheduler = waves.getScheduler(engine.audioContext);
    // this.scheduler = require("scheduler");
    // test
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

    if (engine.master) throw new Error("object has already been added to a master");

    var speed = this.__speed;

    var getCurrentTime = function () {
      return _this.currentTime;
    };

    var getCurrentPosition = function () {
      return _this.currentPosition;
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

      engine.setTransported(this, 0, function () {
        var nextEnginePosition = arguments[0] === undefined ? null : arguments[0];

        // resetNextPosition
        if (nextEnginePosition === null) {
          var time = _this.scheduler.currentTime;
          var position = _this.__getPositionAtTime(time);
          nextEnginePosition = engine.syncPosition(time, position, _this.__speed);
        }

        _this.__resetNextPosition(nextEnginePosition);
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

  _babelHelpers.inherits(PlayControl, TimeEngine);

  _babelHelpers.prototypeProperties(PlayControl, null, {
    __getTimeAtPosition: {

      /**
       * Extrapolate transport time for given position
       * @param {Number} position position
       * @return {Number} extrapolated time
       */

      value: function __getTimeAtPosition(position) {
        return this.__time + (position - this.__position) / this.__speed;
      },
      writable: true,
      configurable: true
    },
    __getPositionAtTime: {

      /**
       * Extrapolate playing position for given time
       * @param {Number} time time
       * @return {Number} extrapolated position
       */

      value: function __getPositionAtTime(time) {
        return this.__position + (time - this.__time) * this.__speed;
      },
      writable: true,
      configurable: true
    },
    __sync: {
      value: function __sync() {
        var now = this.currentTime;
        this.__position += (now - this.__time) * this.__speed;
        this.__time = now;
        return now;
      },
      writable: true,
      configurable: true
    },
    __resetNextPosition: {

      /**
       * Get current master position
       * @return {Number} current playing position
       */

      value: function __resetNextPosition(nextPosition) {
        if (this.__schedulerHook) this.__schedulerHook.resetNextTime(this.__getTimeAtPosition(nextPosition));

        this.__nextPosition = nextPosition;
      },
      writable: true,
      configurable: true
    },
    currentTime: {

      /**
       * Get current master time
       * @return {Number} current time
       *
       * This function will be replaced when the play-control is added to a master.
       */

      get: function () {
        return this.scheduler.currentTime;
      },
      configurable: true
    },
    currentPosition: {

      /**
       * Get current master position
       * @return {Number} current playing position
       *
       * This function will be replaced when the play-control is added to a master.
       */

      get: function () {
        return this.__position + (this.scheduler.currentTime - this.__time) * this.__speed;
      },
      configurable: true
    },
    loop: {
      set: function (enable) {
        if (enable) {
          if (this.__loopStart > -Infinity && this.__loopEnd < Infinity) {
            this.__loopControl = new PlayControlLoopControl(this);
            this.scheduler.add(this.__loopControl, Infinity);
          }
        } else if (this.__loopControl) {
          this.scheduler.remove(this.__loopControl);
          this.__loopControl = null;
        }
      },
      get: function () {
        return !!this.__loopControl;
      },
      configurable: true
    },
    setLoopBoundaries: {
      value: function setLoopBoundaries(start, end) {
        if (end >= start) {
          this.__loopStart = start;
          this.__loopEnd = end;
        } else {
          this.__loopStart = end;
          this.__loopEnd = start;
        }

        this.loop = this.loop;
      },
      writable: true,
      configurable: true
    },
    loopStart: {
      set: function (startTime) {
        this.setLoopBoundaries(startTime, this.__loopEnd);
      },
      get: function () {
        return this.__loopStart;
      },
      configurable: true
    },
    loopEnd: {
      set: function (endTime) {
        this.setLoopBoundaries(this.__loopStart, endTime);
      },
      get: function () {
        return this.__loopEnd;
      },
      configurable: true
    },
    __applyLoopBoundaries: {
      value: function __applyLoopBoundaries(position, speed, seek) {
        if (this.__loopControl) {
          if (speed > 0 && position >= this.__loopEnd) {
            return this.__loopStart + (position - this.__loopStart) % (this.__loopEnd - this.__loopStart);
          } else if (speed < 0 && position < this.__loopStart) {
            return this.__loopEnd - (this.__loopEnd - position) % (this.__loopEnd - this.__loopStart);
          }
        }

        return position;
      },
      writable: true,
      configurable: true
    },
    __rescheduleLoopControl: {
      value: function __rescheduleLoopControl(position, speed) {
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
      },
      writable: true,
      configurable: true
    },
    syncSpeed: {

      // TimeEngine method (speed-controlled interface)

      value: function syncSpeed(time, position, speed) {
        var seek = arguments[3] === undefined ? false : arguments[3];

        var lastSpeed = this.__speed;

        if (speed !== lastSpeed || seek) {
          if (seek || lastSpeed === 0) position = this.__applyLoopBoundaries(position, speed);

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

                if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, 0);

                // remove scheduler hook from scheduler
                this.scheduler.remove(this.__schedulerHook);
                this.__schedulerHook = null;
              } else if (speed * lastSpeed < 0) {
                // change transport direction
                nextPosition = this.__engine.syncPosition(time, position, speed);
              } else if (this.__engine.syncSpeed) {
                this.__engine.syncSpeed(time, position, speed);
              }

              this.__resetNextPosition(nextPosition);
              break;

            case "scheduled":
              if (lastSpeed === 0) // start or seek
                this.__scheduledEngine.resetNextTime(0);else if (speed === 0) // stop
                this.__scheduledEngine.resetNextTime(Infinity);
              break;
          }

          this.__rescheduleLoopControl(position, speed);
        }
      },
      writable: true,
      configurable: true
    },
    start: {

      /**
       * Start playing
       */

      value: function start() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, this.__playingSpeed);
      },
      writable: true,
      configurable: true
    },
    pause: {

      /**
       * Pause playing
       */

      value: function pause() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, 0);
      },
      writable: true,
      configurable: true
    },
    stop: {

      /**
       * Stop playing
       */

      value: function stop() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, 0);
        this.seek(0);
      },
      writable: true,
      configurable: true
    },
    speed: {

      /**
       * Set playing speed
       * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
       */

      set: function (speed) {
        var time = this.__sync();

        if (speed >= 0) {
          if (speed < 0.0625) speed = 0.0625;else if (speed > 16) speed = 16;
        } else {
          if (speed < -16) speed = -16;else if (speed > -0.0625) speed = -0.0625;
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
      },
      configurable: true
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
      },
      writable: true,
      configurable: true
    },
    clear: {

      /**
       * Remove time engine from the transport
       */

      value: function clear() {
        var time = this.__sync();
        this.syncSpeed(time, this.__position, 0);
        this.__engine.resetInterface();
      },
      writable: true,
      configurable: true
    }
  });

  return PlayControl;
})(TimeEngine);

module.exports = PlayControl;
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio play control class (time-engine master), provides play control to a single engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFPQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7ZUFDekIsT0FBTyxDQUFDLGFBQWEsQ0FBQzs7SUFBdkMsWUFBWSxZQUFaLFlBQVk7O0lBRVosd0JBQXdCLGNBQVMsVUFBVTtBQUNwQyxXQURQLHdCQUF3QixDQUNoQixXQUFXO3VDQURuQix3QkFBd0I7O0FBRTFCLGtEQUZFLHdCQUF3Qiw2Q0FFbEI7QUFDUixRQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztHQUNsQzs7eUJBSkcsd0JBQXdCLEVBQVMsVUFBVTs7b0NBQTNDLHdCQUF3QjtBQU01QixlQUFXO2FBQUEscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFlBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDckMsWUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JELFlBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU3RixZQUFJLFlBQVksS0FBSyxRQUFRO0FBQzNCLGlCQUFPLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUFBLEFBRXZELE9BQU8sUUFBUSxDQUFDO09BQ2pCOzs7Ozs7U0FmRyx3QkFBd0I7R0FBUyxVQUFVOztJQWtCM0Msc0JBQXNCLGNBQVMsVUFBVTtBQUNsQyxXQURQLHNCQUFzQixDQUNkLFdBQVc7dUNBRG5CLHNCQUFzQjs7QUFFeEIsa0RBRkUsc0JBQXNCLDZDQUVoQjtBQUNSLFFBQUksQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0dBQ25COzt5QkFMRyxzQkFBc0IsRUFBUyxVQUFVOztvQ0FBekMsc0JBQXNCO0FBUTFCLGVBQVc7Ozs7YUFBQSxxQkFBQyxJQUFJLEVBQUU7QUFDaEIsWUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNsQixjQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNyRixpQkFBTyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDN0UsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO0FBQ3pCLGNBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ25GLGlCQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUMvRTs7QUFFRCxlQUFPLFFBQVEsQ0FBQztPQUNqQjs7Ozs7O1NBbEJHLHNCQUFzQjtHQUFTLFVBQVU7O0lBcUJ6QyxXQUFXLGNBQVMsVUFBVTtBQUN2QixXQURQLFdBQVcsQ0FDSCxNQUFNOzs7dUNBRGQsV0FBVzs7QUFFYixrREFGRSxXQUFXLDZDQUVQLE1BQU0sQ0FBQyxZQUFZLEVBQUU7Ozs7OztBQU0zQixRQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRW5ELFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDOztBQUU1QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztBQUNyQixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQzs7O0FBRzFCLFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOztBQUVqQixRQUFJLENBQUMsY0FBYyxHQUFHLFFBQVEsQ0FBQzs7O0FBRy9CLFFBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDOztBQUV4QixRQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDOztBQUUvRCxRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztBQUV6QixRQUFJLGNBQWMsR0FBRyxZQUFNO0FBQ3pCLGFBQU8sTUFBSyxXQUFXLENBQUM7S0FDekIsQ0FBQzs7QUFFRixRQUFJLGtCQUFrQixHQUFHLFlBQU07QUFDN0IsYUFBTyxNQUFLLGVBQWUsQ0FBQztLQUM3QixDQUFDOztBQUVGLFFBQUksTUFBTSxDQUFDLHlCQUF5QixFQUFFLEVBQUU7O0FBRXRDLFVBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUM7QUFDdEMsWUFBTSxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztLQUNyRSxNQUFNLElBQUksTUFBTSxDQUFDLHFCQUFxQixFQUFFLEVBQUU7O0FBRXpDLFVBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDOztBQUVqQyxZQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsWUFBK0I7WUFBOUIsa0JBQWtCLGdDQUFHLElBQUk7OztBQUV2RCxZQUFJLGtCQUFrQixLQUFLLElBQUksRUFBRTtBQUMvQixjQUFJLElBQUksR0FBRyxNQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUM7QUFDdEMsY0FBSSxRQUFRLEdBQUcsTUFBSyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5Qyw0QkFBa0IsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBSyxPQUFPLENBQUMsQ0FBQztTQUN4RTs7QUFFRCxjQUFLLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLENBQUM7T0FDOUMsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztLQUN4QyxNQUFNLElBQUksTUFBTSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7O0FBRXZDLFVBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDOztBQUUvQixVQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7S0FDMUQsTUFBTTtBQUNMLFlBQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztLQUMzRDtHQUNGOzt5QkF0RUcsV0FBVyxFQUFTLFVBQVU7O29DQUE5QixXQUFXO0FBNkVmLHVCQUFtQjs7Ozs7Ozs7YUFBQSw2QkFBQyxRQUFRLEVBQUU7QUFDNUIsZUFBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUEsR0FBSSxJQUFJLENBQUMsT0FBTyxDQUFDO09BQ2xFOzs7O0FBT0QsdUJBQW1COzs7Ozs7OzthQUFBLDZCQUFDLElBQUksRUFBRTtBQUN4QixlQUFPLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7T0FDOUQ7Ozs7QUFFRCxVQUFNO2FBQUEsa0JBQUc7QUFDUCxZQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQzNCLFlBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDdEQsWUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDbEIsZUFBTyxHQUFHLENBQUM7T0FDWjs7OztBQU1ELHVCQUFtQjs7Ozs7OzthQUFBLDZCQUFDLFlBQVksRUFBRTtBQUNoQyxZQUFJLElBQUksQ0FBQyxlQUFlLEVBQ3RCLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDOztBQUU3RSxZQUFJLENBQUMsY0FBYyxHQUFHLFlBQVksQ0FBQztPQUNwQzs7OztBQVFHLGVBQVc7Ozs7Ozs7OztXQUFBLFlBQUc7QUFDaEIsZUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztPQUNuQzs7O0FBUUcsbUJBQWU7Ozs7Ozs7OztXQUFBLFlBQUc7QUFDcEIsZUFBTyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7T0FDcEY7OztBQWNHLFFBQUk7V0FaQSxVQUFDLE1BQU0sRUFBRTtBQUNmLFlBQUksTUFBTSxFQUFFO0FBQ1YsY0FBSSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxFQUFFO0FBQzdELGdCQUFJLENBQUMsYUFBYSxHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsZ0JBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7V0FDbEQ7U0FDRixNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUM3QixjQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDMUMsY0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7U0FDM0I7T0FDRjtXQUVPLFlBQUc7QUFDVCxlQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFO09BQy9COzs7QUFFRCxxQkFBaUI7YUFBQSwyQkFBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO0FBQzVCLFlBQUksR0FBRyxJQUFJLEtBQUssRUFBRTtBQUNoQixjQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUN6QixjQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztTQUN0QixNQUFNO0FBQ0wsY0FBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDdkIsY0FBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7U0FDeEI7O0FBRUQsWUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO09BQ3ZCOzs7O0FBTUcsYUFBUztXQUpBLFVBQUMsU0FBUyxFQUFFO0FBQ3ZCLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO09BQ25EO1dBRVksWUFBRztBQUNkLGVBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztPQUN6Qjs7O0FBTUcsV0FBTztXQUpBLFVBQUMsT0FBTyxFQUFFO0FBQ25CLFlBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQ25EO1dBRVUsWUFBRztBQUNaLGVBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztPQUN2Qjs7O0FBRUQseUJBQXFCO2FBQUEsK0JBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDM0MsWUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0FBQ3RCLGNBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFNBQVM7QUFDekMsbUJBQU8sSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBLElBQUssSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFBLEFBQUMsQ0FBQztpQkFDM0YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVztBQUMvQyxtQkFBTyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUEsSUFBSyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUEsQUFBQyxDQUFDO1dBQUE7U0FDN0Y7O0FBRUQsZUFBTyxRQUFRLENBQUM7T0FDakI7Ozs7QUFFRCwyQkFBdUI7YUFBQSxpQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQ3ZDLFlBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixjQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDYixnQkFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2pDLGdCQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztXQUNwRixNQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNwQixnQkFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2pDLGdCQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztXQUN0RixNQUFNO0FBQ0wsZ0JBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7V0FDcEQ7U0FDRjtPQUNGOzs7O0FBR0QsYUFBUzs7OzthQUFBLG1CQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFnQjtZQUFkLElBQUksZ0NBQUcsS0FBSzs7QUFDM0MsWUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7QUFFN0IsWUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLElBQUksRUFBRTtBQUMvQixjQUFJLElBQUksSUFBSSxTQUFTLEtBQUssQ0FBQyxFQUN6QixRQUFRLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFekQsY0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsY0FBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsY0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7O0FBRXJCLGtCQUFRLElBQUksQ0FBQyxXQUFXO0FBQ3RCLGlCQUFLLGtCQUFrQjtBQUNyQixrQkFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckQsb0JBQU07O0FBQUEsQUFFUixpQkFBSyxhQUFhO0FBQ2hCLGtCQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDOztBQUV2QyxrQkFBSSxJQUFJLEVBQUU7QUFDUiw0QkFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7ZUFDbEUsTUFBTSxJQUFJLFNBQVMsS0FBSyxDQUFDLEVBQUU7O0FBRTFCLDRCQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7O0FBR2pFLG9CQUFJLENBQUMsZUFBZSxHQUFHLElBQUksd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUQsb0JBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7ZUFDcEQsTUFBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7O0FBRXRCLDRCQUFZLEdBQUcsUUFBUSxDQUFDOztBQUV4QixvQkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O0FBRzdDLG9CQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDNUMsb0JBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2VBQzdCLE1BQU0sSUFBSSxLQUFLLEdBQUcsU0FBUyxHQUFHLENBQUMsRUFBRTs7QUFDaEMsNEJBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2VBQ2xFLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTtBQUNsQyxvQkFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztlQUNoRDs7QUFFRCxrQkFBSSxDQUFDLG1CQUFtQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3ZDLG9CQUFNOztBQUFBLEFBRVIsaUJBQUssV0FBVztBQUNkLGtCQUFJLFNBQVMsS0FBSyxDQUFDO0FBQ2pCLG9CQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQ3JDLElBQUksS0FBSyxLQUFLLENBQUM7QUFDbEIsb0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDakQsb0JBQU07QUFBQSxXQUNUOztBQUVELGNBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDL0M7T0FDRjs7OztBQUtELFNBQUs7Ozs7OzthQUFBLGlCQUFHO0FBQ04sWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO09BQzVEOzs7O0FBS0QsU0FBSzs7Ozs7O2FBQUEsaUJBQUc7QUFDTixZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztPQUMxQzs7OztBQUtELFFBQUk7Ozs7OzthQUFBLGdCQUFHO0FBQ0wsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekMsWUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNkOzs7O0FBK0JHLFNBQUs7Ozs7Ozs7V0F6QkEsVUFBQyxLQUFLLEVBQUU7QUFDZixZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXpCLFlBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLGNBQUksS0FBSyxHQUFHLE1BQU0sRUFDaEIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUNaLElBQUksS0FBSyxHQUFHLEVBQUUsRUFDakIsS0FBSyxHQUFHLEVBQUUsQ0FBQztTQUNkLE1BQU07QUFDTCxjQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsRUFDYixLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FDVCxJQUFJLEtBQUssR0FBRyxDQUFDLE1BQU0sRUFDdEIsS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDO1NBQ25COztBQUVELFlBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDOztBQUU1QixZQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxFQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ2hEOzs7Ozs7V0FNUSxZQUFHO0FBQ1YsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDO09BQzVCOzs7QUFNRCxRQUFJOzs7Ozs7O2FBQUEsY0FBQyxRQUFRLEVBQUU7QUFDYixZQUFJLFFBQVEsS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2hDLGNBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN6QixjQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztBQUMzQixjQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNwRDtPQUNGOzs7O0FBS0QsU0FBSzs7Ozs7O2FBQUEsaUJBQUc7QUFDTixZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QyxZQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDO09BQ2hDOzs7Ozs7U0E5VUcsV0FBVztHQUFTLFVBQVU7O0FBaVZwQyxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gcGxheSBjb250cm9sIGNsYXNzICh0aW1lLWVuZ2luZSBtYXN0ZXIpLCBwcm92aWRlcyBwbGF5IGNvbnRyb2wgdG8gYSBzaW5nbGUgZW5naW5lXG4gKiBAYXV0aG9yIE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mciwgVmljdG9yLlNhaXpAaXJjYW0uZnIsIEthcmltLkJhcmthdGlAaXJjYW0uZnJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xudmFyIHsgZ2V0U2NoZWR1bGVyIH0gPSByZXF1aXJlKCcuL2ZhY3RvcmllcycpO1xuXG5jbGFzcyBQbGF5Q29udHJvbFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgcG9zaXRpb24gPSBwbGF5Q29udHJvbC5fX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBwbGF5Q29udHJvbC5fX2VuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuXG4gICAgaWYgKG5leHRQb3NpdGlvbiAhPT0gSW5maW5pdHkpXG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sTG9vcENvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuc3BlZWQgPSBudWxsO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICBpZiAodGhpcy5zcGVlZCA+IDApIHtcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3BsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCB0aGlzLnNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih0aGlzLl9fcGxheUNvbnRyb2wuX19sb29wRW5kKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3BlZWQgPCAwKSB7XG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wbGF5Q29udHJvbC5fX2xvb3BFbmQsIHRoaXMuc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHRoaXMuX19wbGF5Q29udHJvbC5fX2xvb3BTdGFydCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGVuZ2luZSkge1xuICAgIHN1cGVyKGVuZ2luZS5hdWRpb0NvbnRleHQpO1xuXG4gICAgLy8gZnV0dXJlIGFzc2lnbm1lbnRcbiAgICAvLyB0aGlzLnNjaGVkdWxlciA9IHdhdmVzLmdldFNjaGVkdWxlcihlbmdpbmUuYXVkaW9Db250ZXh0KTtcbiAgICAvLyB0aGlzLnNjaGVkdWxlciA9IHJlcXVpcmUoXCJzY2hlZHVsZXJcIik7XG4gICAgLy8gdGVzdFxuICAgIHRoaXMuc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyKGVuZ2luZS5hdWRpb0NvbnRleHQpO1xuXG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gICAgdGhpcy5fX2ludGVyZmFjZSA9IG51bGw7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBudWxsO1xuXG4gICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IEluZmluaXR5O1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIHZhciBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIHZhciBnZXRDdXJyZW50VGltZSA9ICgpID0+IHtcbiAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0Q3VycmVudFBvc2l0aW9uID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFBvc2l0aW9uO1xuICAgIH07XG5cbiAgICBpZiAoZW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSkge1xuICAgICAgLy8gYWRkIHRpbWUgZW5naW5lIHRoYXQgaW1wbGVtZW50cyBzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZVxuICAgICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgICAgIHRoaXMuX19pbnRlcmZhY2UgPSBcInNwZWVkLWNvbnRyb2xsZWRcIjtcbiAgICAgIGVuZ2luZS5zZXRTcGVlZENvbnRyb2xsZWQodGhpcywgZ2V0Q3VycmVudFRpbWUsIGdldEN1cnJlbnRQb3NpdGlvbik7XG4gICAgfSBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKCkpIHtcbiAgICAgIC8vIGFkZCB0aW1lIGVuZ2luZSB0aGF0IGltcGxlbWVudHMgdHJhbnNwb3J0ZWQgaW50ZXJmYWNlXG4gICAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICAgICAgdGhpcy5fX2ludGVyZmFjZSA9IFwidHJhbnNwb3J0ZWRcIjtcblxuICAgICAgZW5naW5lLnNldFRyYW5zcG9ydGVkKHRoaXMsIDAsIChuZXh0RW5naW5lUG9zaXRpb24gPSBudWxsKSA9PiB7XG4gICAgICAgIC8vIHJlc2V0TmV4dFBvc2l0aW9uXG4gICAgICAgIGlmIChuZXh0RW5naW5lUG9zaXRpb24gPT09IG51bGwpIHtcbiAgICAgICAgICB2YXIgdGltZSA9IHRoaXMuc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKTtcbiAgICAgICAgICBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fX3Jlc2V0TmV4dFBvc2l0aW9uKG5leHRFbmdpbmVQb3NpdGlvbik7XG4gICAgICB9LCBnZXRDdXJyZW50VGltZSwgZ2V0Q3VycmVudFBvc2l0aW9uKTtcbiAgICB9IGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpIHtcbiAgICAgIC8vIGFkZCB0aW1lIGVuZ2luZSB0aGF0IGltcGxlbWVudHMgc2NoZWR1bGVkIGludGVyZmFjZVxuICAgICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgICAgIHRoaXMuX19pbnRlcmZhY2UgPSBcInNjaGVkdWxlZFwiO1xuXG4gICAgICB0aGlzLnNjaGVkdWxlci5hZGQoZW5naW5lLCBJbmZpbml0eSwgZ2V0Q3VycmVudFBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBwbGF5IGNvbnRyb2xcIik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4dHJhcG9sYXRlIHRyYW5zcG9ydCB0aW1lIGZvciBnaXZlbiBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgdGltZVxuICAgKi9cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFwb2xhdGUgcGxheWluZyBwb3NpdGlvbiBmb3IgZ2l2ZW4gdGltZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHBvc2l0aW9uXG4gICAqL1xuICBfX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX3N5bmMoKSB7XG4gICAgdmFyIG5vdyA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uICs9IChub3cgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gICAgdGhpcy5fX3RpbWUgPSBub3c7XG4gICAgcmV0dXJuIG5vdztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHBsYXlpbmcgcG9zaXRpb25cbiAgICovXG4gIF9fcmVzZXROZXh0UG9zaXRpb24obmV4dFBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuX19zY2hlZHVsZXJIb29rKVxuICAgICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXROZXh0VGltZSh0aGlzLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKSk7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgcGxheWluZyBwb3NpdGlvblxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgcGxheS1jb250cm9sIGlzIGFkZGVkIHRvIGEgbWFzdGVyLlxuICAgKi9cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuc2NoZWR1bGVyLmN1cnJlbnRUaW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgc2V0IGxvb3AoZW5hYmxlKSB7XG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgaWYgKHRoaXMuX19sb29wU3RhcnQgPiAtSW5maW5pdHkgJiYgdGhpcy5fX2xvb3BFbmQgPCBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBuZXcgUGxheUNvbnRyb2xMb29wQ29udHJvbCh0aGlzKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZXIuYWRkKHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUodGhpcy5fX2xvb3BDb250cm9sKTtcbiAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGxvb3AoKSB7XG4gICAgcmV0dXJuICghIXRoaXMuX19sb29wQ29udHJvbCk7XG4gIH1cblxuICBzZXRMb29wQm91bmRhcmllcyhzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA+PSBzdGFydCkge1xuICAgICAgdGhpcy5fX2xvb3BTdGFydCA9IHN0YXJ0O1xuICAgICAgdGhpcy5fX2xvb3BFbmQgPSBlbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19sb29wU3RhcnQgPSBlbmQ7XG4gICAgICB0aGlzLl9fbG9vcEVuZCA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHRoaXMubG9vcCA9IHRoaXMubG9vcDtcbiAgfVxuXG4gIHNldCBsb29wU3RhcnQoc3RhcnRUaW1lKSB7XG4gICAgdGhpcy5zZXRMb29wQm91bmRhcmllcyhzdGFydFRpbWUsIHRoaXMuX19sb29wRW5kKTtcbiAgfVxuXG4gIGdldCBsb29wU3RhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wU3RhcnQ7XG4gIH1cblxuICBzZXQgbG9vcEVuZChlbmRUaW1lKSB7XG4gICAgdGhpcy5zZXRMb29wQm91bmRhcmllcyh0aGlzLl9fbG9vcFN0YXJ0LCBlbmRUaW1lKTtcbiAgfVxuXG4gIGdldCBsb29wRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9fbG9vcEVuZDtcbiAgfVxuXG4gIF9fYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQsIHNlZWspIHtcbiAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uID49IHRoaXMuX19sb29wRW5kKVxuICAgICAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydCArIChwb3NpdGlvbiAtIHRoaXMuX19sb29wU3RhcnQpICUgKHRoaXMuX19sb29wRW5kIC0gdGhpcy5fX2xvb3BTdGFydCk7XG4gICAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fbG9vcFN0YXJ0KVxuICAgICAgICByZXR1cm4gdGhpcy5fX2xvb3BFbmQgLSAodGhpcy5fX2xvb3BFbmQgLSBwb3NpdGlvbikgJSAodGhpcy5fX2xvb3BFbmQgLSB0aGlzLl9fbG9vcFN0YXJ0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cblxuICBfX3Jlc2NoZWR1bGVMb29wQ29udHJvbChwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbC5zcGVlZCA9IHNwZWVkO1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5yZXNldCh0aGlzLl9fbG9vcENvbnRyb2wsIHRoaXMuX19nZXRUaW1lQXRQb3NpdGlvbih0aGlzLl9fbG9vcEVuZCkpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sLnNwZWVkID0gc3BlZWQ7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVyLnJlc2V0KHRoaXMuX19sb29wQ29udHJvbCwgdGhpcy5fX2dldFRpbWVBdFBvc2l0aW9uKHRoaXMuX19sb29wU3RhcnQpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVyLnJlc2V0KHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmIChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMClcbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9fYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgICBzd2l0Y2ggKHRoaXMuX19pbnRlcmZhY2UpIHtcbiAgICAgICAgY2FzZSBcInNwZWVkLWNvbnRyb2xsZWRcIjpcbiAgICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWspO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJ0cmFuc3BvcnRlZFwiOlxuICAgICAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuXG4gICAgICAgICAgaWYgKHNlZWspIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgICAgIC8vIHN0YXJ0XG4gICAgICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgICAgICAvLyBhZGQgc2NoZWR1bGVyIGhvb2sgdG8gc2NoZWR1bGVyICh3aWxsIGJlIHJlc2NoZWR1bGVkIHRvIGFwcHJvcHJpYXRlIHRpbWUgYmVsb3cpXG4gICAgICAgICAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBQbGF5Q29udHJvbFNjaGVkdWxlckhvb2sodGhpcyk7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQodGhpcy5fX3NjaGVkdWxlckhvb2ssIEluZmluaXR5KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgICAgICAvLyBzdG9wXG4gICAgICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG5cbiAgICAgICAgICAgIC8vIHJlbW92ZSBzY2hlZHVsZXIgaG9vayBmcm9tIHNjaGVkdWxlclxuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucmVtb3ZlKHRoaXMuX19zY2hlZHVsZXJIb29rKTtcbiAgICAgICAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNwZWVkICogbGFzdFNwZWVkIDwgMCkgeyAvLyBjaGFuZ2UgdHJhbnNwb3J0IGRpcmVjdGlvblxuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKSB7XG4gICAgICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX19yZXNldE5leHRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJzY2hlZHVsZWRcIjpcbiAgICAgICAgICBpZiAobGFzdFNwZWVkID09PSAwKSAvLyBzdGFydCBvciBzZWVrXG4gICAgICAgICAgICB0aGlzLl9fc2NoZWR1bGVkRW5naW5lLnJlc2V0TmV4dFRpbWUoMCk7XG4gICAgICAgICAgZWxzZSBpZiAoc3BlZWQgPT09IDApIC8vIHN0b3BcbiAgICAgICAgICAgIHRoaXMuX19zY2hlZHVsZWRFbmdpbmUucmVzZXROZXh0VGltZShJbmZpbml0eSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19yZXNjaGVkdWxlTG9vcENvbnRyb2wocG9zaXRpb24sIHNwZWVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgcGxheWluZ1xuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgdGhpcy5fX3BsYXlpbmdTcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgcGxheWluZ1xuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCBwbGF5aW5nXG4gICAqL1xuICBzdG9wKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICAgIHRoaXMuc2VlaygwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGxheWluZyBzcGVlZFxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWQgcGxheWluZyBzcGVlZCAobm9uLXplcm8gc3BlZWQgYmV0d2VlbiAtMTYgYW5kIC0xLzE2IG9yIGJldHdlZW4gMS8xNiBhbmQgMTYpXG4gICAqL1xuICBzZXQgc3BlZWQoc3BlZWQpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG5cbiAgICBpZiAoc3BlZWQgPj0gMCkge1xuICAgICAgaWYgKHNwZWVkIDwgMC4wNjI1KVxuICAgICAgICBzcGVlZCA9IDAuMDYyNTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTYpXG4gICAgICAgIHNwZWVkID0gMTY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzcGVlZCA8IC0xNilcbiAgICAgICAgc3BlZWQgPSAtMTY7XG4gICAgICBlbHNlIGlmIChzcGVlZCA+IC0wLjA2MjUpXG4gICAgICAgIHNwZWVkID0gLTAuMDYyNTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHJldHVybiBjdXJyZW50IHBsYXlpbmcgc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlpbmdTcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgKGp1bXAgdG8pIHBsYXlpbmcgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgdGltZSBlbmdpbmUgZnJvbSB0aGUgdHJhbnNwb3J0XG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgICB0aGlzLl9fZW5naW5lLnJlc2V0SW50ZXJmYWNlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5Q29udHJvbDsiXX0=