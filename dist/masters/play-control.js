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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O2VBQ3pCLE9BQU8sQ0FBQyxhQUFhLENBQUM7O0lBQXZDLFlBQVksWUFBWixZQUFZOztJQUVaLHdCQUF3QixjQUFTLFVBQVU7QUFDcEMsV0FEUCx3QkFBd0IsQ0FDaEIsV0FBVzt1Q0FEbkIsd0JBQXdCOztBQUUxQixrREFGRSx3QkFBd0IsNkNBRWxCO0FBQ1IsUUFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUM7R0FDbEM7O3lCQUpHLHdCQUF3QixFQUFTLFVBQVU7O29DQUEzQyx3QkFBd0I7QUFNNUIsZUFBVzthQUFBLHFCQUFDLElBQUksRUFBRTtBQUNoQixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0FBQ3JDLFlBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRCxZQUFJLFlBQVksR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFN0YsWUFBSSxZQUFZLEtBQUssUUFBUTtBQUMzQixpQkFBTyxXQUFXLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7U0FBQSxBQUV2RCxPQUFPLFFBQVEsQ0FBQztPQUNqQjs7Ozs7O1NBZkcsd0JBQXdCO0dBQVMsVUFBVTs7SUFrQjNDLHNCQUFzQixjQUFTLFVBQVU7QUFDbEMsV0FEUCxzQkFBc0IsQ0FDZCxXQUFXO3VDQURuQixzQkFBc0I7O0FBRXhCLGtEQUZFLHNCQUFzQiw2Q0FFaEI7QUFDUixRQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztBQUNqQyxRQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztHQUNuQjs7eUJBTEcsc0JB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SUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztPQUNoRDs7Ozs7O1dBTVEsWUFBRztBQUNWLGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztPQUM1Qjs7O0FBTUQsUUFBSTs7Ozs7OzthQUFBLGNBQUMsUUFBUSxFQUFFO0FBQ2IsWUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNoQyxjQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDekIsY0FBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDcEQ7T0FDRjs7OztBQUtELFNBQUs7Ozs7OzthQUFBLGlCQUFHO0FBQ04sWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDekMsWUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztPQUNoQzs7Ozs7O1NBOVVHLFdBQVc7R0FBUyxVQUFVOztBQWlWcEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMiLCJmaWxlIjoic3JjL3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBhdWRpbyBwbGF5IGNvbnRyb2wgY2xhc3MgKHRpbWUtZW5naW5lIG1hc3RlciksIHByb3ZpZGVzIHBsYXkgY29udHJvbCB0byBhIHNpbmdsZSBlbmdpbmVcbiAqIEBhdXRob3IgTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyLCBWaWN0b3IuU2FpekBpcmNhbS5mciwgS2FyaW0uQmFya2F0aUBpcmNhbS5mclxuICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG52YXIgeyBnZXRTY2hlZHVsZXIgfSA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzJyk7XG5cbmNsYXNzIFBsYXlDb250cm9sU2NoZWR1bGVySG9vayBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBwb3NpdGlvbiA9IHBsYXlDb250cm9sLl9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSk7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IHBsYXlDb250cm9sLl9fZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG5cbiAgICBpZiAobmV4dFBvc2l0aW9uICE9PSBJbmZpbml0eSlcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2xMb29wQ29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5zcGVlZCA9IG51bGw7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIGlmICh0aGlzLnNwZWVkID4gMCkge1xuICAgICAgdGhpcy5fX3BsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHRoaXMuc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHRoaXMuX19wbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5zcGVlZCA8IDApIHtcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3BsYXlDb250cm9sLl9fbG9vcEVuZCwgdGhpcy5zcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odGhpcy5fX3BsYXlDb250cm9sLl9fbG9vcFN0YXJ0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoZW5naW5lKSB7XG4gICAgc3VwZXIoZW5naW5lLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvLyBmdXR1cmUgYXNzaWdubWVudFxuICAgIC8vIHRoaXMuc2NoZWR1bGVyID0gd2F2ZXMuZ2V0U2NoZWR1bGVyKGVuZ2luZS5hdWRpb0NvbnRleHQpO1xuICAgIC8vIHRoaXMuc2NoZWR1bGVyID0gcmVxdWlyZShcInNjaGVkdWxlclwiKTtcbiAgICAvLyB0ZXN0XG4gICAgdGhpcy5zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIoZW5naW5lLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgICB0aGlzLl9faW50ZXJmYWNlID0gbnVsbDtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG51bGw7XG5cbiAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSAwO1xuICAgIHRoaXMuX19sb29wRW5kID0gSW5maW5pdHk7XG5cbiAgICAvLyBzeW5jaHJvbml6ZWQgdGllLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIC8vIG5vbi16ZXJvIFwidXNlclwiIHNwZWVkXG4gICAgdGhpcy5fX3BsYXlpbmdTcGVlZCA9IDE7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdmFyIGdldEN1cnJlbnRUaW1lID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFRpbWU7XG4gICAgfTtcblxuICAgIHZhciBnZXRDdXJyZW50UG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5jdXJyZW50UG9zaXRpb247XG4gICAgfTtcblxuICAgIGlmIChlbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpKSB7XG4gICAgICAvLyBhZGQgdGltZSBlbmdpbmUgdGhhdCBpbXBsZW1lbnRzIHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlXG4gICAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICAgICAgdGhpcy5fX2ludGVyZmFjZSA9IFwic3BlZWQtY29udHJvbGxlZFwiO1xuICAgICAgZW5naW5lLnNldFNwZWVkQ29udHJvbGxlZCh0aGlzLCBnZXRDdXJyZW50VGltZSwgZ2V0Q3VycmVudFBvc2l0aW9uKTtcbiAgICB9IGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzVHJhbnNwb3J0ZWQoKSkge1xuICAgICAgLy8gYWRkIHRpbWUgZW5naW5lIHRoYXQgaW1wbGVtZW50cyB0cmFuc3BvcnRlZCBpbnRlcmZhY2VcbiAgICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG4gICAgICB0aGlzLl9faW50ZXJmYWNlID0gXCJ0cmFuc3BvcnRlZFwiO1xuXG4gICAgICBlbmdpbmUuc2V0VHJhbnNwb3J0ZWQodGhpcywgMCwgKG5leHRFbmdpbmVQb3NpdGlvbiA9IG51bGwpID0+IHtcbiAgICAgICAgLy8gcmVzZXROZXh0UG9zaXRpb25cbiAgICAgICAgaWYgKG5leHRFbmdpbmVQb3NpdGlvbiA9PT0gbnVsbCkge1xuICAgICAgICAgIHZhciB0aW1lID0gdGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5fX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpO1xuICAgICAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9fcmVzZXROZXh0UG9zaXRpb24obmV4dEVuZ2luZVBvc2l0aW9uKTtcbiAgICAgIH0sIGdldEN1cnJlbnRUaW1lLCBnZXRDdXJyZW50UG9zaXRpb24pO1xuICAgIH0gZWxzZSBpZiAoZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSkge1xuICAgICAgLy8gYWRkIHRpbWUgZW5naW5lIHRoYXQgaW1wbGVtZW50cyBzY2hlZHVsZWQgaW50ZXJmYWNlXG4gICAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICAgICAgdGhpcy5fX2ludGVyZmFjZSA9IFwic2NoZWR1bGVkXCI7XG5cbiAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZChlbmdpbmUsIEluZmluaXR5LCBnZXRDdXJyZW50UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHBsYXkgY29udHJvbFwiKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXh0cmFwb2xhdGUgdHJhbnNwb3J0IHRpbWUgZm9yIGdpdmVuIHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGV4dHJhcG9sYXRlZCB0aW1lXG4gICAqL1xuICBfX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX190aW1lICsgKHBvc2l0aW9uIC0gdGhpcy5fX3Bvc2l0aW9uKSAvIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICB2YXIgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgcGxheWluZyBwb3NpdGlvblxuICAgKi9cbiAgX19yZXNldE5leHRQb3NpdGlvbihuZXh0UG9zaXRpb24pIHtcbiAgICBpZiAodGhpcy5fX3NjaGVkdWxlckhvb2spXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldE5leHRUaW1lKHRoaXMuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHRpbWVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBzZXQgbG9vcChlbmFibGUpIHtcbiAgICBpZiAoZW5hYmxlKSB7XG4gICAgICBpZiAodGhpcy5fX2xvb3BTdGFydCA+IC1JbmZpbml0eSAmJiB0aGlzLl9fbG9vcEVuZCA8IEluZmluaXR5KSB7XG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG5ldyBQbGF5Q29udHJvbExvb3BDb250cm9sKHRoaXMpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQodGhpcy5fX2xvb3BDb250cm9sLCBJbmZpbml0eSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIHNldExvb3BCb3VuZGFyaWVzKHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kID49IHN0YXJ0KSB7XG4gICAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gc3RhcnQ7XG4gICAgICB0aGlzLl9fbG9vcEVuZCA9IGVuZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX2xvb3BTdGFydCA9IGVuZDtcbiAgICAgIHRoaXMuX19sb29wRW5kID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgc2V0IGxvb3BTdGFydChzdGFydFRpbWUpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHN0YXJ0VGltZSwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIHNldCBsb29wRW5kKGVuZFRpbWUpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGVuZFRpbWUpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgX19hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCwgc2Vlaykge1xuICAgIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPj0gdGhpcy5fX2xvb3BFbmQpXG4gICAgICAgIHJldHVybiB0aGlzLl9fbG9vcFN0YXJ0ICsgKHBvc2l0aW9uIC0gdGhpcy5fX2xvb3BTdGFydCkgJSAodGhpcy5fX2xvb3BFbmQgLSB0aGlzLl9fbG9vcFN0YXJ0KTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA8IHRoaXMuX19sb29wU3RhcnQpXG4gICAgICAgIHJldHVybiB0aGlzLl9fbG9vcEVuZCAtICh0aGlzLl9fbG9vcEVuZCAtIHBvc2l0aW9uKSAlICh0aGlzLl9fbG9vcEVuZCAtIHRoaXMuX19sb29wU3RhcnQpO1xuICAgIH1cblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxuXG4gIF9fcmVzY2hlZHVsZUxvb3BDb250cm9sKHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sLnNwZWVkID0gc3BlZWQ7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVyLnJlc2V0KHRoaXMuX19sb29wQ29udHJvbCwgdGhpcy5fX2dldFRpbWVBdFBvc2l0aW9uKHRoaXMuX19sb29wRW5kKSk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wuc3BlZWQgPSBzcGVlZDtcbiAgICAgICAgdGhpcy5zY2hlZHVsZXIucmVzZXQodGhpcy5fX2xvb3BDb250cm9sLCB0aGlzLl9fZ2V0VGltZUF0UG9zaXRpb24odGhpcy5fX2xvb3BTdGFydCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZXIucmVzZXQodGhpcy5fX2xvb3BDb250cm9sLCBJbmZpbml0eSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKHNlZWsgfHwgbGFzdFNwZWVkID09PSAwKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIHN3aXRjaCAodGhpcy5fX2ludGVyZmFjZSkge1xuICAgICAgICBjYXNlIFwic3BlZWQtY29udHJvbGxlZFwiOlxuICAgICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2Vlayk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcInRyYW5zcG9ydGVkXCI6XG4gICAgICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG5cbiAgICAgICAgICBpZiAoc2Vlaykge1xuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgICAgIC8vIGFkZCBzY2hlZHVsZXIgaG9vayB0byBzY2hlZHVsZXIgKHdpbGwgYmUgcmVzY2hlZHVsZWQgdG8gYXBwcm9wcmlhdGUgdGltZSBiZWxvdylcbiAgICAgICAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFBsYXlDb250cm9sU2NoZWR1bGVySG9vayh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZCh0aGlzLl9fc2NoZWR1bGVySG9vaywgSW5maW5pdHkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgICAgIC8vIHN0b3BcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICAgICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIHNjaGVkdWxlciBob29rIGZyb20gc2NoZWR1bGVyXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUodGhpcy5fX3NjaGVkdWxlckhvb2spO1xuICAgICAgICAgICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBudWxsO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7IC8vIGNoYW5nZSB0cmFuc3BvcnQgZGlyZWN0aW9uXG4gICAgICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fX3Jlc2V0TmV4dFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcInNjaGVkdWxlZFwiOlxuICAgICAgICAgIGlmIChsYXN0U3BlZWQgPT09IDApIC8vIHN0YXJ0IG9yIHNlZWtcbiAgICAgICAgICAgIHRoaXMuX19zY2hlZHVsZWRFbmdpbmUucmVzZXROZXh0VGltZSgwKTtcbiAgICAgICAgICBlbHNlIGlmIChzcGVlZCA9PT0gMCkgLy8gc3RvcFxuICAgICAgICAgICAgdGhpcy5fX3NjaGVkdWxlZEVuZ2luZS5yZXNldE5leHRUaW1lKEluZmluaXR5KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX3Jlc2NoZWR1bGVMb29wQ29udHJvbChwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBwbGF5aW5nXG4gICAqL1xuICBzdGFydCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCB0aGlzLl9fcGxheWluZ1NwZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZSBwbGF5aW5nXG4gICAqL1xuICBwYXVzZSgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIHBsYXlpbmdcbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gICAgdGhpcy5zZWVrKDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwbGF5aW5nIHNwZWVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzcGVlZCBwbGF5aW5nIHNwZWVkIChub24temVybyBzcGVlZCBiZXR3ZWVuIC0xNiBhbmQgLTEvMTYgb3IgYmV0d2VlbiAxLzE2IGFuZCAxNilcbiAgICovXG4gIHNldCBzcGVlZChzcGVlZCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcblxuICAgIGlmIChzcGVlZCA+PSAwKSB7XG4gICAgICBpZiAoc3BlZWQgPCAwLjA2MjUpXG4gICAgICAgIHNwZWVkID0gMC4wNjI1O1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAxNilcbiAgICAgICAgc3BlZWQgPSAxNjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTE2KVxuICAgICAgICBzcGVlZCA9IC0xNjtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gLTAuMDYyNSlcbiAgICAgICAgc3BlZWQgPSAtMC4wNjI1O1xuICAgIH1cblxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSBzcGVlZDtcblxuICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGxheWluZyBzcGVlZFxuICAgKiBAcmV0dXJuIGN1cnJlbnQgcGxheWluZyBzcGVlZFxuICAgKi9cbiAgZ2V0IHNwZWVkKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheWluZ1NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCAoanVtcCB0bykgcGxheWluZyBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gdGFyZ2V0IHBvc2l0aW9uXG4gICAqL1xuICBzZWVrKHBvc2l0aW9uKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB0aGlzLl9fcG9zaXRpb24pIHtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCwgdHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSB0aW1lIGVuZ2luZSBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICAgIHRoaXMuX19lbmdpbmUucmVzZXRJbnRlcmZhY2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXlDb250cm9sOyJdfQ==