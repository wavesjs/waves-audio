'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _schedulingQueue = require('../utils/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _factories = require('./factories');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LoopControl = function (_TimeEngine) {
  (0, _inherits3.default)(LoopControl, _TimeEngine);

  function LoopControl(playControl) {
    (0, _classCallCheck3.default)(this, LoopControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LoopControl).call(this));

    _this.__playControl = playControl;
    _this.lower = -Infinity;
    _this.upper = Infinity;
    return _this;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(LoopControl, [{
    key: 'advanceTime',
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
  }, {
    key: 'reschedule',
    value: function reschedule(speed) {
      var playControl = this.__playControl;
      var lower = Math.min(playControl.__loopStart, playControl.__loopEnd);
      var upper = Math.max(playControl.__loopStart, playControl.__loopEnd);

      this.speed = speed;
      this.lower = lower;
      this.upper = upper;

      if (lower === upper) speed = 0;

      if (speed > 0) this.resetTime(playControl.__getTimeAtPosition(upper - 1e-6));else if (speed < 0) this.resetTime(playControl.__getTimeAtPosition(lower + 1e-6));else this.resetTime(Infinity);
    }
  }, {
    key: 'applyLoopBoundaries',
    value: function applyLoopBoundaries(position, speed) {
      var lower = this.lower;
      var upper = this.upper;

      if (speed > 0 && position >= upper) return lower + (position - lower) % (upper - lower);else if (speed < 0 && position < lower) return upper - (upper - position) % (upper - lower);

      return position;
    }
  }]);
  return LoopControl;
}(_timeEngine2.default);

var PlayControlled = function () {
  function PlayControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlled);

    this.__playControl = playControl;
    this.__engine = engine;

    engine.master = this;
  }

  (0, _createClass3.default)(PlayControlled, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      this.__engine.syncSpeed(time, position, speed, seek);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__engine.master = null;

      this.__playControl = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return PlayControlled;
}();

var PlayControlledSpeedControlled = function (_PlayControlled) {
  (0, _inherits3.default)(PlayControlledSpeedControlled, _PlayControlled);

  function PlayControlledSpeedControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSpeedControlled);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledSpeedControlled).call(this, playControl, engine));
  }

  return PlayControlledSpeedControlled;
}(PlayControlled);

var TransportedSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(TransportedSchedulerHook, _TimeEngine2);

  function TransportedSchedulerHook(playControl, engine) {
    (0, _classCallCheck3.default)(this, TransportedSchedulerHook);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportedSchedulerHook).call(this));

    _this3.__playControl = playControl;
    _this3.__engine = engine;

    _this3.__nextPosition = Infinity;
    playControl.__scheduler.add(_this3, Infinity);
    return _this3;
  }

  (0, _createClass3.default)(TransportedSchedulerHook, [{
    key: 'advanceTime',
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
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length <= 0 || arguments[0] === undefined ? this.__nextPosition : arguments[0];

      var time = this.__playControl.__getTimeAtPosition(position);
      this.__nextPosition = position;
      this.resetTime(time);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__playControl.__scheduler.remove(this);

      this.__playControl = null;
      this.__engine = null;
    }
  }]);
  return TransportedSchedulerHook;
}(_timeEngine2.default);

var PlayControlledTransported = function (_PlayControlled2) {
  (0, _inherits3.default)(PlayControlledTransported, _PlayControlled2);

  function PlayControlledTransported(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledTransported);

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledTransported).call(this, playControl, engine));

    _this4.__schedulerHook = new TransportedSchedulerHook(playControl, engine);
    return _this4;
  }

  (0, _createClass3.default)(PlayControlledTransported, [{
    key: 'syncSpeed',
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
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(engine) {
      var position = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      if (position === undefined) {
        var playControl = this.__playControl;
        var time = playControl.__sync();

        position = this.__engine.syncPosition(time, playControl.__position, playControl.__speed);
      }

      this.__schedulerHook.resetPosition(position);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__schedulerHook.destroy();
      this.__schedulerHook = null;

      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayControlledTransported.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledTransported;
}(PlayControlled);

var ScheduledSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(ScheduledSchedulingQueue, _SchedulingQueue);

  function ScheduledSchedulingQueue(playControl, engine) {
    (0, _classCallCheck3.default)(this, ScheduledSchedulingQueue);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ScheduledSchedulingQueue).call(this));

    _this5.__playControl = playControl;
    _this5.__engine = engine;

    _this5.add(engine, Infinity);
    playControl.__scheduler.add(_this5, Infinity);
    return _this5;
  }

  (0, _createClass3.default)(ScheduledSchedulingQueue, [{
    key: 'destroy',
    value: function destroy() {
      this.__playControl.__scheduler.remove(this);
      this.remove(this.__engine);

      this.__playControl = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return ScheduledSchedulingQueue;
}(_schedulingQueue2.default);

var PlayControlledScheduled = function (_PlayControlled3) {
  (0, _inherits3.default)(PlayControlledScheduled, _PlayControlled3);

  function PlayControlledScheduled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledScheduled);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledScheduled).call(this, playControl, engine));

    _this6.__schedulingQueue = new ScheduledSchedulingQueue(playControl, engine);
    return _this6;
  }

  (0, _createClass3.default)(PlayControlledScheduled, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      if (lastSpeed === 0 && speed !== 0) // start or seek
        this.__engine.resetTime();else if (lastSpeed !== 0 && speed === 0) // stop
        this.__engine.resetTime(Infinity);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__schedulingQueue.destroy();
      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayControlledScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledScheduled;
}(PlayControlled);

var PlayControl = function (_TimeEngine3) {
  (0, _inherits3.default)(PlayControl, _TimeEngine3);

  function PlayControl(engine) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    (0, _classCallCheck3.default)(this, PlayControl);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControl).call(this));

    _this7.audioContext = options.audioContext || _audioContext2.default;
    _this7.__scheduler = (0, _factories.getScheduler)(_this7.audioContext);

    _this7.__playControlled = null;

    _this7.__loopControl = null;
    _this7.__loopStart = 0;
    _this7.__loopEnd = Infinity;

    // synchronized tie, position, and speed
    _this7.__time = 0;
    _this7.__position = 0;
    _this7.__speed = 0;

    // non-zero "user" speed
    _this7.__playingSpeed = 1;

    if (engine) _this7.__setEngine(engine);
    return _this7;
  }

  (0, _createClass3.default)(PlayControl, [{
    key: '__setEngine',
    value: function __setEngine(engine) {
      if (engine.master) throw new Error("object has already been added to a master");

      if (engine.implementsSpeedControlled()) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (engine.implementsTransported()) this.__playControlled = new PlayControlledTransported(this, engine);else if (engine.implementsScheduled()) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
    }
  }, {
    key: '__resetEngine',
    value: function __resetEngine() {
      this.__playControlled.destroy();
      this.__playControlled = null;
    }

    /**
     * Calculate/extrapolate playing time for given position
     * @param {Number} position position
     * @return {Number} extrapolated time
     */

  }, {
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      return this.__time + (position - this.__position) / this.__speed;
    }

    /**
     * Calculate/extrapolate playing position for given time
     * @param {Number} time time
     * @return {Number} extrapolated position
     */

  }, {
    key: '__getPositionAtTime',
    value: function __getPositionAtTime(time) {
      return this.__position + (time - this.__time) * this.__speed;
    }
  }, {
    key: '__sync',
    value: function __sync() {
      var now = this.currentTime;
      this.__position += (now - this.__time) * this.__speed;
      this.__time = now;
      return now;
    }

    /**
     * Get current master time
     * @return {Number} current time
     *
     * This function will be replaced when the play-control is added to a master.
     */

  }, {
    key: 'set',
    value: function set() {
      var engine = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

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
  }, {
    key: 'setLoopBoundaries',
    value: function setLoopBoundaries(loopStart, loopEnd) {
      this.__loopStart = loopStart;
      this.__loopEnd = loopEnd;

      this.loop = this.loop;
    }
  }, {
    key: 'syncSpeed',


    // TimeEngine method (speed-controlled interface)
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

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

    /**
     * Start playing
     */

  }, {
    key: 'start',
    value: function start() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, this.__playingSpeed);
    }

    /**
     * Pause playing
     */

  }, {
    key: 'pause',
    value: function pause() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
    }

    /**
     * Stop playing
     */

  }, {
    key: 'stop',
    value: function stop() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
      this.seek(0);
    }

    /**
     * Set playing speed
     * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
     */

  }, {
    key: 'seek',


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
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__scheduler.currentTime;
    }

    /**
     * Get current master position
     * @return {Number} current playing position
     *
     * This function will be replaced when the play-control is added to a master.
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }
  }, {
    key: 'loop',
    set: function set(enable) {
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
    get: function get() {
      return !!this.__loopControl;
    }
  }, {
    key: 'loopStart',
    set: function set(loopStart) {
      this.setLoopBoundaries(loopStart, this.__loopEnd);
    },
    get: function get() {
      return this.__loopStart;
    }
  }, {
    key: 'loopEnd',
    set: function set(loopEnd) {
      this.setLoopBoundaries(this.__loopStart, loopEnd);
    },
    get: function get() {
      return this.__loopEnd;
    }
  }, {
    key: 'speed',
    set: function set(speed) {
      var time = this.__sync();

      if (speed >= 0) {
        if (speed < 0.01) speed = 0.01;else if (speed > 100) speed = 100;
      } else {
        if (speed < -100) speed = -100;else if (speed > -0.01) speed = -0.01;
      }

      this.__playingSpeed = speed;

      if (this.__speed !== 0) this.syncSpeed(time, this.__position, speed);
    }

    /**
     * Get playing speed
     * @return current playing speed
     */
    ,
    get: function get() {
      return this.__playingSpeed;
    }
  }]);
  return PlayControl;
}(_timeEngine2.default);

exports.default = PlayControl;
//# sourceMappingURL=data:application/json;base64,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QW9CO0FBQzdCLGFBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixLQUFLLGFBQUwsQ0FBeEIsQ0FENkI7QUFFN0IsYUFBSyxhQUFMLEdBQXFCLElBQXJCLENBRjZCO09BQXhCOzt3QkFNRTtBQUNULGFBQVEsQ0FBQyxDQUFDLEtBQUssYUFBTCxDQUREOzs7O3NCQVdHLFdBQVc7QUFDdkIsV0FBSyxpQkFBTCxDQUF1QixTQUF2QixFQUFrQyxLQUFLLFNBQUwsQ0FBbEMsQ0FEdUI7O3dCQUlUO0FBQ2QsYUFBTyxLQUFLLFdBQUwsQ0FETzs7OztzQkFJSixTQUFTO0FBQ25CLFdBQUssaUJBQUwsQ0FBdUIsS0FBSyxXQUFMLEVBQWtCLE9BQXpDLEVBRG1COzt3QkFJUDtBQUNaLGFBQU8sS0FBSyxTQUFMLENBREs7Ozs7c0JBcURKLE9BQU87QUFDZixVQUFJLE9BQU8sS0FBSyxNQUFMLEVBQVAsQ0FEVzs7QUFHZixVQUFJLFNBQVMsQ0FBVCxFQUFZO0FBQ2QsWUFBSSxRQUFRLElBQVIsRUFDRixRQUFRLElBQVIsQ0FERixLQUVLLElBQUksUUFBUSxHQUFSLEVBQ1AsUUFBUSxHQUFSLENBREc7T0FIUCxNQUtPO0FBQ0wsWUFBSSxRQUFRLENBQUMsR0FBRCxFQUNWLFFBQVEsQ0FBQyxHQUFELENBRFYsS0FFSyxJQUFJLFFBQVEsQ0FBQyxJQUFELEVBQ2YsUUFBUSxDQUFDLElBQUQsQ0FETDtPQVJQOztBQVlBLFdBQUssY0FBTCxHQUFzQixLQUF0QixDQWZlOztBQWlCZixVQUFJLEtBQUssT0FBTCxLQUFpQixDQUFqQixFQUNGLEtBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsS0FBSyxVQUFMLEVBQWlCLEtBQXRDLEVBREY7Ozs7Ozs7O3dCQVFVO0FBQ1YsYUFBTyxLQUFLLGNBQUwsQ0FERzs7O1NBbk9PIiwiZmlsZSI6InBsYXktY29udHJvbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZSc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cbmNsYXNzIExvb3BDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMubG93ZXIgPSAtSW5maW5pdHk7XG4gICAgdGhpcy51cHBlciA9IEluZmluaXR5O1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIHNwZWVkID0gcGxheUNvbnRyb2wuc3BlZWQ7XG4gICAgdmFyIGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICB2YXIgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIGxvd2VyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlcik7XG4gICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCB1cHBlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHJlc2NoZWR1bGUoc3BlZWQpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIGxvd2VyID0gTWF0aC5taW4ocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG4gICAgdmFyIHVwcGVyID0gTWF0aC5tYXgocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG5cbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgdGhpcy5sb3dlciA9IGxvd2VyO1xuICAgIHRoaXMudXBwZXIgPSB1cHBlcjtcblxuICAgIGlmIChsb3dlciA9PT0gdXBwZXIpXG4gICAgICBzcGVlZCA9IDA7XG5cbiAgICBpZiAoc3BlZWQgPiAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlciAtIDFlLTYpKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyICsgMWUtNikpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGFwcGx5TG9vcEJvdW5kYXJpZXMocG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICB2YXIgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA+PSB1cHBlcilcbiAgICAgIHJldHVybiBsb3dlciArIChwb3NpdGlvbiAtIGxvd2VyKSAlICh1cHBlciAtIGxvd2VyKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPCBsb3dlcilcbiAgICAgIHJldHVybiB1cHBlciAtICh1cHBlciAtIHBvc2l0aW9uKSAlICh1cHBlciAtIGxvd2VyKTtcblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWspO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbmNsYXNzIFBsYXlDb250cm9sbGVkU3BlZWRDb250cm9sbGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cbn1cblxuY2xhc3MgVHJhbnNwb3J0ZWRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgZW5naW5lID0gdGhpcy5fX2VuZ2luZTtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG5cbiAgICB3aGlsZSAobmV4dFRpbWUgPD0gdGltZSkge1xuICAgICAgbmV4dFBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgICBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRlZFNjaGVkdWxlckhvb2socGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcblxuICAgIGlmIChzZWVrKSB7XG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAvLyBzdGFydFxuICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAvLyBzdG9wXG4gICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gICAgfSBlbHNlIGlmIChzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgIC8vIGNoYW5nZSB0cmFuc3BvcnQgZGlyZWN0aW9uXG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpIHtcbiAgICAgIC8vIGNoYW5nZSBzcGVlZFxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgICAgdmFyIHRpbWUgPSBwbGF5Q29udHJvbC5fX3N5bmMoKTtcblxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwbGF5Q29udHJvbC5fX3Bvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2suZGVzdHJveSgpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5jbGFzcyBTY2hlZHVsZWRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gICAgcGxheUNvbnRyb2wuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZSh0aGlzLl9fZW5naW5lKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFNjaGVkdWxlZFNjaGVkdWxpbmdRdWV1ZShwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChsYXN0U3BlZWQgPT09IDAgJiYgc3BlZWQgIT09IDApIC8vIHN0YXJ0IG9yIHNlZWtcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKCk7XG4gICAgZWxzZSBpZiAobGFzdFNwZWVkICE9PSAwICYmIHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUuZGVzdHJveSgpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5Q29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihlbmdpbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IGRlZmF1bHRBdWRpb0NvbnRleHQ7XG4gICAgdGhpcy5fX3NjaGVkdWxlciA9IGdldFNjaGVkdWxlcih0aGlzLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuXG4gICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IEluZmluaXR5O1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZSlcbiAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcbiAgfVxuXG4gIF9fc2V0RW5naW5lKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzVHJhbnNwb3J0ZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZSBpZiAoZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gcGxheSBjb250cm9sXCIpO1xuICB9XG5cbiAgX19yZXNldEVuZ2luZSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgdGltZSBmb3IgZ2l2ZW4gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHRpbWVcbiAgICovXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICB2YXIgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG5cbiAgc2V0KGVuZ2luZSA9IG51bGwpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCAhPT0gbnVsbCAmJiB0aGlzLl9fcGxheUNvbnRyb2xsZWQuX19lbmdpbmUgIT09IGVuZ2luZSkge1xuXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcmVzZXRFbmdpbmUoKTtcblxuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkID09PSBudWxsICYmIGVuZ2luZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKVxuICAgICAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldCBsb29wKGVuYWJsZSkge1xuICAgIGlmIChlbmFibGUgJiYgdGhpcy5fX2xvb3BTdGFydCA+IC1JbmZpbml0eSAmJiB0aGlzLl9fbG9vcEVuZCA8IEluZmluaXR5KSB7XG4gICAgICBpZiAoIXRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBuZXcgTG9vcENvbnRyb2wodGhpcyk7XG4gICAgICAgIHRoaXMuX19zY2hlZHVsZXIuYWRkKHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIHNldCBsb29wRW5kKGxvb3BFbmQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGxvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHBsYXlpbmdcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHRoaXMuX19wbGF5aW5nU3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlIHBsYXlpbmdcbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcGxheWluZ1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgICB0aGlzLnNlZWsoMCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkIHBsYXlpbmcgc3BlZWQgKG5vbi16ZXJvIHNwZWVkIGJldHdlZW4gLTE2IGFuZCAtMS8xNiBvciBiZXR3ZWVuIDEvMTYgYW5kIDE2KVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHJldHVybiBjdXJyZW50IHBsYXlpbmcgc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlpbmdTcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgKGp1bXAgdG8pIHBsYXlpbmcgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuIl19