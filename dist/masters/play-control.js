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

var _schedulingQueue = require('../core/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _factories = require('./factories');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ESPILON = 1e-8;

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

      if (speed > 0) time += ESPILON;else time -= EPSILON;

      if (speed > 0) {
        playControl.syncSpeed(time, lower, speed, true);
        return playControl.__getTimeAtPosition(upper) - ESPILON;
      } else if (speed < 0) {
        playControl.syncSpeed(time, upper, speed, true);
        return playControl.__getTimeAtPosition(lower) + ESPILON;
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

      if (speed > 0) this.resetTime(playControl.__getTimeAtPosition(upper) - ESPILON);else if (speed < 0) this.resetTime(playControl.__getTimeAtPosition(lower) + ESPILON);else this.resetTime(Infinity);
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

// play controlled base class


var PlayControlled = function () {
  function PlayControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlled);

    this.__playControl = playControl;

    engine.master = this;
    this.__engine = engine;
  }

  (0, _createClass3.default)(PlayControlled, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      this.__engine.syncSpeed(time, position, speed, seek);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__playControl = null;

      this.__engine.master = null;
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

// play control for engines implementing the *speed-controlled* interface


var PlayControlledSpeedControlled = function (_PlayControlled) {
  (0, _inherits3.default)(PlayControlledSpeedControlled, _PlayControlled);

  function PlayControlledSpeedControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSpeedControlled);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledSpeedControlled).call(this, playControl, engine));
  }

  return PlayControlledSpeedControlled;
}(PlayControlled);

// play control for engines implmenting the *transported* interface


var PlayControlledTransported = function (_PlayControlled2) {
  (0, _inherits3.default)(PlayControlledTransported, _PlayControlled2);

  function PlayControlledTransported(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledTransported);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledTransported).call(this, playControl, engine));

    _this3.__schedulerHook = new PlayControlledSchedulerHook(playControl, engine);
    return _this3;
  }

  (0, _createClass3.default)(PlayControlledTransported, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      if (speed !== lastSpeed || seek && speed !== 0) {
        var nextPosition;

        // resync transported engines
        if (seek || speed * lastSpeed < 0) {
          // seek or reverse direction
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (lastSpeed === 0) {
          // start
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (speed === 0) {
          // stop
          nextPosition = Infinity;

          if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, 0);
        } else if (this.__engine.syncSpeed) {
          // change speed without reversing direction
          this.__engine.syncSpeed(time, position, speed);
        }

        this.__schedulerHook.resetPosition(nextPosition);
      }
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

// play control for time engines implementing the *scheduled* interface


var PlayControlledScheduled = function (_PlayControlled3) {
  (0, _inherits3.default)(PlayControlledScheduled, _PlayControlled3);

  function PlayControlledScheduled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledScheduled);


    // scheduling queue becomes master of engine

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledScheduled).call(this, playControl, engine));

    engine.master = null;
    _this4.__schedulingQueue = new PlayControlledSchedulingQueue(playControl, engine);
    return _this4;
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

// translates transported engine advancePosition into global scheduler times


var PlayControlledSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(PlayControlledSchedulerHook, _TimeEngine2);

  function PlayControlledSchedulerHook(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledSchedulerHook).call(this));

    _this5.__playControl = playControl;
    _this5.__engine = engine;

    _this5.__nextPosition = Infinity;
    playControl.__scheduler.add(_this5, Infinity);
    return _this5;
  }

  (0, _createClass3.default)(PlayControlledSchedulerHook, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var playControl = this.__playControl;
      var engine = this.__engine;
      var position = this.__nextPosition;
      var nextPosition = engine.advancePosition(time, position, playControl.__speed);
      var nextTime = playControl.__getTimeAtPosition(nextPosition);

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
  return PlayControlledSchedulerHook;
}(_timeEngine2.default);

// internal scheduling queue that returns the current position (and time) of the play control


var PlayControlledSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(PlayControlledSchedulingQueue, _SchedulingQueue);

  function PlayControlledSchedulingQueue(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledSchedulingQueue).call(this));

    _this6.__playControl = playControl;
    _this6.__engine = engine;

    _this6.add(engine, Infinity);
    playControl.__scheduler.add(_this6, Infinity);
    return _this6;
  }

  (0, _createClass3.default)(PlayControlledSchedulingQueue, [{
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
  return PlayControlledSchedulingQueue;
}(_schedulingQueue2.default);

// play control meta-class


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
    _this7.__loopEnd = 1;

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

      if (_timeEngine2.default.implementsSpeedControlled(engine)) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (_timeEngine2.default.implementsTransported(engine)) this.__playControlled = new PlayControlledTransported(this, engine);else if (_timeEngine2.default.implementsScheduled(engine)) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
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

        if (this.__speed !== 0) {
          var position = this.currentPosition;
          var lower = Math.min(this.__loopStart, this.__loopEnd);
          var upper = Math.max(this.__loopStart, this.__loopEnd);

          if (this.__speed > 0 && position > upper) this.seek(upper);else if (this.__speed < 0 && position < lower) this.seek(lower);else this.__loopControl.reschedule(this.__speed);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYXktY29udHJvbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBLElBQU0sVUFBVSxJQUFWOztJQUVBOzs7QUFDSixXQURJLFdBQ0osQ0FBWSxXQUFaLEVBQXlCO3dDQURyQixhQUNxQjs7NkZBRHJCLHlCQUNxQjs7QUFHdkIsVUFBSyxhQUFMLEdBQXFCLFdBQXJCLENBSHVCO0FBSXZCLFVBQUssS0FBTCxHQUFhLENBQUMsUUFBRCxDQUpVO0FBS3ZCLFVBQUssS0FBTCxHQUFhLFFBQWIsQ0FMdUI7O0dBQXpCOzs7Ozs2QkFESTs7Z0NBVVEsTUFBTTtBQUNoQixVQUFNLGNBQWMsS0FBSyxhQUFMLENBREo7QUFFaEIsVUFBTSxRQUFRLFlBQVksS0FBWixDQUZFO0FBR2hCLFVBQU0sUUFBUSxLQUFLLEtBQUwsQ0FIRTtBQUloQixVQUFNLFFBQVEsS0FBSyxLQUFMLENBSkU7O0FBTWhCLFVBQUcsUUFBUSxDQUFSLEVBQ0QsUUFBUSxPQUFSLENBREYsS0FHRSxRQUFRLE9BQVIsQ0FIRjs7QUFLQSxVQUFJLFFBQVEsQ0FBUixFQUFXO0FBQ2Isb0JBQVksU0FBWixDQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFtQyxLQUFuQyxFQUEwQyxJQUExQyxFQURhO0FBRWIsZUFBTyxZQUFZLG1CQUFaLENBQWdDLEtBQWhDLElBQXlDLE9BQXpDLENBRk07T0FBZixNQUdPLElBQUksUUFBUSxDQUFSLEVBQVc7QUFDcEIsb0JBQVksU0FBWixDQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFtQyxLQUFuQyxFQUEwQyxJQUExQyxFQURvQjtBQUVwQixlQUFPLFlBQVksbUJBQVosQ0FBZ0MsS0FBaEMsSUFBeUMsT0FBekMsQ0FGYTtPQUFmOztBQUtQLGFBQU8sUUFBUCxDQW5CZ0I7Ozs7K0JBc0JQLE9BQU87QUFDaEIsVUFBTSxjQUFjLEtBQUssYUFBTCxDQURKO0FBRWhCLFVBQU0sUUFBUSxLQUFLLEdBQUwsQ0FBUyxZQUFZLFdBQVosRUFBeUIsWUFBWSxTQUFaLENBQTFDLENBRlU7QUFHaEIsVUFBTSxRQUFRLEtBQUssR0FBTCxDQUFTLFlBQVksV0FBWixFQUF5QixZQUFZLFNBQVosQ0FBMUMsQ0FIVTs7QUFLaEIsV0FBSyxLQUFMLEdBQWEsS0FBYixDQUxnQjtBQU1oQixXQUFLLEtBQUwsR0FBYSxLQUFiLENBTmdCO0FBT2hCLFdBQUssS0FBTCxHQUFhLEtBQWIsQ0FQZ0I7O0FBU2hCLFVBQUksVUFBVSxLQUFWLEVBQ0YsUUFBUSxDQUFSLENBREY7O0FBR0EsVUFBSSxRQUFRLENBQVIsRUFDRixLQUFLLFNBQUwsQ0FBZSxZQUFZLG1CQUFaLENBQWdDLEtBQWhDLElBQXlDLE9BQXpDLENBQWYsQ0FERixLQUVLLElBQUksUUFBUSxDQUFSLEVBQ1AsS0FBSyxTQUFMLENBQWUsWUFBWSxtQkFBWixDQUFnQyxLQUFoQyxJQUF5QyxPQUF6QyxDQUFmLENBREcsS0FHSCxLQUFLLFNBQUwsQ0FBZSxRQUFmLEVBSEc7Ozs7d0NBTWEsVUFBVSxPQUFPO0FBQ25DLFVBQU0sUUFBUSxLQUFLLEtBQUwsQ0FEcUI7QUFFbkMsVUFBTSxRQUFRLEtBQUssS0FBTCxDQUZxQjs7QUFJbkMsVUFBSSxRQUFRLENBQVIsSUFBYSxZQUFZLEtBQVosRUFDZixPQUFPLFFBQVEsQ0FBQyxXQUFXLEtBQVgsQ0FBRCxJQUFzQixRQUFRLEtBQVIsQ0FBdEIsQ0FEakIsS0FFSyxJQUFJLFFBQVEsQ0FBUixJQUFhLFdBQVcsS0FBWCxFQUNwQixPQUFPLFFBQVEsQ0FBQyxRQUFRLFFBQVIsQ0FBRCxJQUFzQixRQUFRLEtBQVIsQ0FBdEIsQ0FEWjs7QUFHTCxhQUFPLFFBQVAsQ0FUbUM7OztTQXBEakM7Ozs7OztJQWtFQTtBQUNKLFdBREksY0FDSixDQUFZLFdBQVosRUFBeUIsTUFBekIsRUFBaUM7d0NBRDdCLGdCQUM2Qjs7QUFDL0IsU0FBSyxhQUFMLEdBQXFCLFdBQXJCLENBRCtCOztBQUcvQixXQUFPLE1BQVAsR0FBZ0IsSUFBaEIsQ0FIK0I7QUFJL0IsU0FBSyxRQUFMLEdBQWdCLE1BQWhCLENBSitCO0dBQWpDOzs2QkFESTs7OEJBUU0sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXO0FBQ2hELFdBQUssUUFBTCxDQUFjLFNBQWQsQ0FBd0IsSUFBeEIsRUFBOEIsUUFBOUIsRUFBd0MsS0FBeEMsRUFBK0MsSUFBL0MsRUFEZ0Q7Ozs7OEJBWXhDO0FBQ1IsV0FBSyxhQUFMLEdBQXFCLElBQXJCLENBRFE7O0FBR1IsV0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixJQUF2QixDQUhRO0FBSVIsV0FBSyxRQUFMLEdBQWdCLElBQWhCLENBSlE7Ozs7d0JBUlE7QUFDaEIsYUFBTyxLQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FEUzs7Ozt3QkFJSTtBQUNwQixhQUFPLEtBQUssYUFBTCxDQUFtQixlQUFuQixDQURhOzs7U0FoQmxCOzs7Ozs7SUE2QkE7OztBQUNKLFdBREksNkJBQ0osQ0FBWSxXQUFaLEVBQXlCLE1BQXpCLEVBQWlDO3dDQUQ3QiwrQkFDNkI7d0ZBRDdCLDBDQUVJLGFBQWEsU0FEWTtHQUFqQzs7U0FESTtFQUFzQzs7Ozs7SUFPdEM7OztBQUNKLFdBREkseUJBQ0osQ0FBWSxXQUFaLEVBQXlCLE1BQXpCLEVBQWlDO3dDQUQ3QiwyQkFDNkI7OzhGQUQ3QixzQ0FFSSxhQUFhLFNBRFk7O0FBRy9CLFdBQUssZUFBTCxHQUF1QixJQUFJLDJCQUFKLENBQWdDLFdBQWhDLEVBQTZDLE1BQTdDLENBQXZCLENBSCtCOztHQUFqQzs7NkJBREk7OzhCQU9NLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVztBQUNoRCxVQUFJLFVBQVUsU0FBVixJQUF3QixRQUFRLFVBQVUsQ0FBVixFQUFjO0FBQ2hELFlBQUksWUFBSjs7O0FBRGdELFlBSTVDLFFBQVEsUUFBUSxTQUFSLEdBQW9CLENBQXBCLEVBQXVCOztBQUVqQyx5QkFBZSxLQUFLLFFBQUwsQ0FBYyxZQUFkLENBQTJCLElBQTNCLEVBQWlDLFFBQWpDLEVBQTJDLEtBQTNDLENBQWYsQ0FGaUM7U0FBbkMsTUFHTyxJQUFJLGNBQWMsQ0FBZCxFQUFpQjs7QUFFMUIseUJBQWUsS0FBSyxRQUFMLENBQWMsWUFBZCxDQUEyQixJQUEzQixFQUFpQyxRQUFqQyxFQUEyQyxLQUEzQyxDQUFmLENBRjBCO1NBQXJCLE1BR0EsSUFBSSxVQUFVLENBQVYsRUFBYTs7QUFFdEIseUJBQWUsUUFBZixDQUZzQjs7QUFJdEIsY0FBSSxLQUFLLFFBQUwsQ0FBYyxTQUFkLEVBQ0YsS0FBSyxRQUFMLENBQWMsU0FBZCxDQUF3QixJQUF4QixFQUE4QixRQUE5QixFQUF3QyxDQUF4QyxFQURGO1NBSkssTUFNQSxJQUFJLEtBQUssUUFBTCxDQUFjLFNBQWQsRUFBeUI7O0FBRWxDLGVBQUssUUFBTCxDQUFjLFNBQWQsQ0FBd0IsSUFBeEIsRUFBOEIsUUFBOUIsRUFBd0MsS0FBeEMsRUFGa0M7U0FBN0I7O0FBS1AsYUFBSyxlQUFMLENBQXFCLGFBQXJCLENBQW1DLFlBQW5DLEVBckJnRDtPQUFsRDs7Ozt3Q0F5QmtCLFFBQThCO1VBQXRCLGlFQUFXLHlCQUFXOztBQUNoRCxVQUFJLGFBQWEsU0FBYixFQUF3QjtBQUMxQixZQUFJLGNBQWMsS0FBSyxhQUFMLENBRFE7QUFFMUIsWUFBSSxPQUFPLFlBQVksTUFBWixFQUFQLENBRnNCOztBQUkxQixtQkFBVyxLQUFLLFFBQUwsQ0FBYyxZQUFkLENBQTJCLElBQTNCLEVBQWlDLFlBQVksVUFBWixFQUF3QixZQUFZLE9BQVosQ0FBcEUsQ0FKMEI7T0FBNUI7O0FBT0EsV0FBSyxlQUFMLENBQXFCLGFBQXJCLENBQW1DLFFBQW5DLEVBUmdEOzs7OzhCQVd4QztBQUNSLFdBQUssZUFBTCxDQUFxQixPQUFyQixHQURRO0FBRVIsV0FBSyxlQUFMLEdBQXVCLElBQXZCLENBRlE7O0FBSVIsdURBaERFLGlFQWdERixDQUpROzs7U0E1Q047RUFBa0M7Ozs7O0lBcURsQzs7O0FBQ0osV0FESSx1QkFDSixDQUFZLFdBQVosRUFBeUIsTUFBekIsRUFBaUM7d0NBRDdCLHlCQUM2Qjs7Ozs7OEZBRDdCLG9DQUVJLGFBQWEsU0FEWTs7QUFJL0IsV0FBTyxNQUFQLEdBQWdCLElBQWhCLENBSitCO0FBSy9CLFdBQUssaUJBQUwsR0FBeUIsSUFBSSw2QkFBSixDQUFrQyxXQUFsQyxFQUErQyxNQUEvQyxDQUF6QixDQUwrQjs7R0FBakM7OzZCQURJOzs4QkFTTSxNQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVc7QUFDaEQsVUFBSSxjQUFjLENBQWQsSUFBbUIsVUFBVSxDQUFWO0FBQ3JCLGFBQUssUUFBTCxDQUFjLFNBQWQsR0FERixLQUVLLElBQUksY0FBYyxDQUFkLElBQW1CLFVBQVUsQ0FBVjtBQUMxQixhQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLFFBQXhCLEVBREc7Ozs7OEJBSUc7QUFDUixXQUFLLGlCQUFMLENBQXVCLE9BQXZCLEdBRFE7QUFFUix1REFsQkUsK0RBa0JGLENBRlE7OztTQWhCTjtFQUFnQzs7Ozs7SUF1QmhDOzs7QUFDSixXQURJLDJCQUNKLENBQVksV0FBWixFQUF5QixNQUF6QixFQUFpQzt3Q0FEN0IsNkJBQzZCOzs4RkFEN0IseUNBQzZCOztBQUcvQixXQUFLLGFBQUwsR0FBcUIsV0FBckIsQ0FIK0I7QUFJL0IsV0FBSyxRQUFMLEdBQWdCLE1BQWhCLENBSitCOztBQU0vQixXQUFLLGNBQUwsR0FBc0IsUUFBdEIsQ0FOK0I7QUFPL0IsZ0JBQVksV0FBWixDQUF3QixHQUF4QixTQUFrQyxRQUFsQyxFQVArQjs7R0FBakM7OzZCQURJOztnQ0FXUSxNQUFNO0FBQ2hCLFVBQUksY0FBYyxLQUFLLGFBQUwsQ0FERjtBQUVoQixVQUFJLFNBQVMsS0FBSyxRQUFMLENBRkc7QUFHaEIsVUFBSSxXQUFXLEtBQUssY0FBTCxDQUhDO0FBSWhCLFVBQUksZUFBZSxPQUFPLGVBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsUUFBN0IsRUFBdUMsWUFBWSxPQUFaLENBQXRELENBSlk7QUFLaEIsVUFBSSxXQUFXLFlBQVksbUJBQVosQ0FBZ0MsWUFBaEMsQ0FBWCxDQUxZOztBQU9oQixXQUFLLGNBQUwsR0FBc0IsWUFBdEIsQ0FQZ0I7QUFRaEIsYUFBTyxRQUFQLENBUmdCOzs7O29DQW1CNEI7VUFBaEMsaUVBQVcsS0FBSyxjQUFMLGdCQUFxQjs7QUFDNUMsVUFBSSxPQUFPLEtBQUssYUFBTCxDQUFtQixtQkFBbkIsQ0FBdUMsUUFBdkMsQ0FBUCxDQUR3QztBQUU1QyxXQUFLLGNBQUwsR0FBc0IsUUFBdEIsQ0FGNEM7QUFHNUMsV0FBSyxTQUFMLENBQWUsSUFBZixFQUg0Qzs7Ozs4QkFNcEM7QUFDUixXQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FBK0IsTUFBL0IsQ0FBc0MsSUFBdEMsRUFEUTtBQUVSLFdBQUssYUFBTCxHQUFxQixJQUFyQixDQUZRO0FBR1IsV0FBSyxRQUFMLEdBQWdCLElBQWhCLENBSFE7Ozs7d0JBZFE7QUFDaEIsYUFBTyxLQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FEUzs7Ozt3QkFJSTtBQUNwQixhQUFPLEtBQUssYUFBTCxDQUFtQixlQUFuQixDQURhOzs7U0ExQmxCOzs7Ozs7SUE0Q0E7OztBQUNKLFdBREksNkJBQ0osQ0FBWSxXQUFaLEVBQXlCLE1BQXpCLEVBQWlDO3dDQUQ3QiwrQkFDNkI7OzhGQUQ3QiwyQ0FDNkI7O0FBRS9CLFdBQUssYUFBTCxHQUFxQixXQUFyQixDQUYrQjtBQUcvQixXQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FIK0I7O0FBSy9CLFdBQUssR0FBTCxDQUFTLE1BQVQsRUFBaUIsUUFBakIsRUFMK0I7QUFNL0IsZ0JBQVksV0FBWixDQUF3QixHQUF4QixTQUFrQyxRQUFsQyxFQU4rQjs7R0FBakM7OzZCQURJOzs4QkFrQk07QUFDUixXQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FBK0IsTUFBL0IsQ0FBc0MsSUFBdEMsRUFEUTtBQUVSLFdBQUssTUFBTCxDQUFZLEtBQUssUUFBTCxDQUFaLENBRlE7O0FBSVIsV0FBSyxhQUFMLEdBQXFCLElBQXJCLENBSlE7QUFLUixXQUFLLFFBQUwsR0FBZ0IsSUFBaEIsQ0FMUTs7Ozt3QkFSUTtBQUNoQixhQUFPLEtBQUssYUFBTCxDQUFtQixXQUFuQixDQURTOzs7O3dCQUlJO0FBQ3BCLGFBQU8sS0FBSyxhQUFMLENBQW1CLGVBQW5CLENBRGE7OztTQWRsQjs7Ozs7O0lBNEJlOzs7QUFDbkIsV0FEbUIsV0FDbkIsQ0FBWSxNQUFaLEVBQWtDO1FBQWQsZ0VBQVUsa0JBQUk7d0NBRGYsYUFDZTs7OEZBRGYseUJBQ2U7O0FBR2hDLFdBQUssWUFBTCxHQUFvQixRQUFRLFlBQVIsMEJBQXBCLENBSGdDO0FBSWhDLFdBQUssV0FBTCxHQUFtQiw2QkFBYSxPQUFLLFlBQUwsQ0FBaEMsQ0FKZ0M7O0FBTWhDLFdBQUssZ0JBQUwsR0FBd0IsSUFBeEIsQ0FOZ0M7O0FBUWhDLFdBQUssYUFBTCxHQUFxQixJQUFyQixDQVJnQztBQVNoQyxXQUFLLFdBQUwsR0FBbUIsQ0FBbkIsQ0FUZ0M7QUFVaEMsV0FBSyxTQUFMLEdBQWlCLENBQWpCOzs7QUFWZ0MsVUFhaEMsQ0FBSyxNQUFMLEdBQWMsQ0FBZCxDQWJnQztBQWNoQyxXQUFLLFVBQUwsR0FBa0IsQ0FBbEIsQ0FkZ0M7QUFlaEMsV0FBSyxPQUFMLEdBQWUsQ0FBZjs7O0FBZmdDLFVBa0JoQyxDQUFLLGNBQUwsR0FBc0IsQ0FBdEIsQ0FsQmdDOztBQW9CaEMsUUFBSSxNQUFKLEVBQ0UsT0FBSyxXQUFMLENBQWlCLE1BQWpCLEVBREY7a0JBcEJnQztHQUFsQzs7NkJBRG1COztnQ0F5QlAsUUFBUTtBQUNsQixVQUFJLE9BQU8sTUFBUCxFQUNGLE1BQU0sSUFBSSxLQUFKLENBQVUsMkNBQVYsQ0FBTixDQURGOztBQUdBLFVBQUkscUJBQVcseUJBQVgsQ0FBcUMsTUFBckMsQ0FBSixFQUNFLEtBQUssZ0JBQUwsR0FBd0IsSUFBSSw2QkFBSixDQUFrQyxJQUFsQyxFQUF3QyxNQUF4QyxDQUF4QixDQURGLEtBRUssSUFBSSxxQkFBVyxxQkFBWCxDQUFpQyxNQUFqQyxDQUFKLEVBQ0gsS0FBSyxnQkFBTCxHQUF3QixJQUFJLHlCQUFKLENBQThCLElBQTlCLEVBQW9DLE1BQXBDLENBQXhCLENBREcsS0FFQSxJQUFJLHFCQUFXLG1CQUFYLENBQStCLE1BQS9CLENBQUosRUFDSCxLQUFLLGdCQUFMLEdBQXdCLElBQUksdUJBQUosQ0FBNEIsSUFBNUIsRUFBa0MsTUFBbEMsQ0FBeEIsQ0FERyxLQUdILE1BQU0sSUFBSSxLQUFKLENBQVUsd0NBQVYsQ0FBTixDQUhHOzs7O29DQU1TO0FBQ2QsV0FBSyxnQkFBTCxDQUFzQixPQUF0QixHQURjO0FBRWQsV0FBSyxnQkFBTCxHQUF3QixJQUF4QixDQUZjOzs7Ozs7Ozs7Ozt3Q0FVSSxVQUFVO0FBQzVCLGFBQU8sS0FBSyxNQUFMLEdBQWMsQ0FBQyxXQUFXLEtBQUssVUFBTCxDQUFaLEdBQStCLEtBQUssT0FBTCxDQUR4Qjs7Ozs7Ozs7Ozs7d0NBU1YsTUFBTTtBQUN4QixhQUFPLEtBQUssVUFBTCxHQUFrQixDQUFDLE9BQU8sS0FBSyxNQUFMLENBQVIsR0FBdUIsS0FBSyxPQUFMLENBRHhCOzs7OzZCQUlqQjtBQUNQLFVBQUksTUFBTSxLQUFLLFdBQUwsQ0FESDtBQUVQLFdBQUssVUFBTCxJQUFtQixDQUFDLE1BQU0sS0FBSyxNQUFMLENBQVAsR0FBc0IsS0FBSyxPQUFMLENBRmxDO0FBR1AsV0FBSyxNQUFMLEdBQWMsR0FBZCxDQUhPO0FBSVAsYUFBTyxHQUFQLENBSk87Ozs7Ozs7Ozs7OzswQkE0QlU7VUFBZiwrREFBUyxvQkFBTTs7QUFDakIsVUFBSSxPQUFPLEtBQUssTUFBTCxFQUFQLENBRGE7QUFFakIsVUFBSSxRQUFRLEtBQUssT0FBTCxDQUZLOztBQUlqQixVQUFJLEtBQUssZ0JBQUwsS0FBMEIsSUFBMUIsSUFBa0MsS0FBSyxnQkFBTCxDQUFzQixRQUF0QixLQUFtQyxNQUFuQyxFQUEyQzs7QUFFL0UsYUFBSyxTQUFMLENBQWUsSUFBZixFQUFxQixLQUFLLFVBQUwsRUFBaUIsQ0FBdEMsRUFGK0U7O0FBSS9FLFlBQUksS0FBSyxnQkFBTCxFQUNGLEtBQUssYUFBTCxHQURGOztBQUlBLFlBQUksS0FBSyxnQkFBTCxLQUEwQixJQUExQixJQUFrQyxXQUFXLElBQVgsRUFBaUI7QUFDckQsZUFBSyxXQUFMLENBQWlCLE1BQWpCLEVBRHFEOztBQUdyRCxjQUFJLFVBQVUsQ0FBVixFQUNGLEtBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsS0FBSyxVQUFMLEVBQWlCLEtBQXRDLEVBREY7U0FIRjtPQVJGOzs7O3NDQThDZ0IsV0FBVyxTQUFTO0FBQ3BDLFdBQUssV0FBTCxHQUFtQixTQUFuQixDQURvQztBQUVwQyxXQUFLLFNBQUwsR0FBaUIsT0FBakIsQ0FGb0M7O0FBSXBDLFdBQUssSUFBTCxHQUFZLEtBQUssSUFBTCxDQUp3Qjs7Ozs7Ozs4QkF3QjVCLE1BQU0sVUFBVSxPQUFxQjtVQUFkLDZEQUFPLHFCQUFPOztBQUM3QyxVQUFJLFlBQVksS0FBSyxPQUFMLENBRDZCOztBQUc3QyxVQUFJLFVBQVUsU0FBVixJQUF1QixJQUF2QixFQUE2QjtBQUMvQixZQUFJLENBQUMsUUFBUSxjQUFjLENBQWQsQ0FBVCxJQUE2QixLQUFLLGFBQUwsRUFDL0IsV0FBVyxLQUFLLGFBQUwsQ0FBbUIsbUJBQW5CLENBQXVDLFFBQXZDLEVBQWlELEtBQWpELENBQVgsQ0FERjs7QUFHQSxhQUFLLE1BQUwsR0FBYyxJQUFkLENBSitCO0FBSy9CLGFBQUssVUFBTCxHQUFrQixRQUFsQixDQUwrQjtBQU0vQixhQUFLLE9BQUwsR0FBZSxLQUFmLENBTitCOztBQVEvQixZQUFJLEtBQUssZ0JBQUwsRUFDRixLQUFLLGdCQUFMLENBQXNCLFNBQXRCLENBQWdDLElBQWhDLEVBQXNDLFFBQXRDLEVBQWdELEtBQWhELEVBQXVELElBQXZELEVBQTZELFNBQTdELEVBREY7O0FBR0EsWUFBSSxLQUFLLGFBQUwsRUFDRixLQUFLLGFBQUwsQ0FBbUIsVUFBbkIsQ0FBOEIsS0FBOUIsRUFERjtPQVhGOzs7Ozs7Ozs7NEJBbUJNO0FBQ04sVUFBSSxPQUFPLEtBQUssTUFBTCxFQUFQLENBREU7QUFFTixXQUFLLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLEtBQUssVUFBTCxFQUFpQixLQUFLLGNBQUwsQ0FBdEMsQ0FGTTs7Ozs7Ozs7OzRCQVFBO0FBQ04sVUFBSSxPQUFPLEtBQUssTUFBTCxFQUFQLENBREU7QUFFTixXQUFLLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLEtBQUssVUFBTCxFQUFpQixDQUF0QyxFQUZNOzs7Ozs7Ozs7MkJBUUQ7QUFDTCxVQUFJLE9BQU8sS0FBSyxNQUFMLEVBQVAsQ0FEQztBQUVMLFdBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsS0FBSyxVQUFMLEVBQWlCLENBQXRDLEVBRks7QUFHTCxXQUFLLElBQUwsQ0FBVSxDQUFWLEVBSEs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBMkNGLFVBQVU7QUFDYixVQUFJLGFBQWEsS0FBSyxVQUFMLEVBQWlCO0FBQ2hDLFlBQUksT0FBTyxLQUFLLE1BQUwsRUFBUCxDQUQ0QjtBQUVoQyxhQUFLLFVBQUwsR0FBa0IsUUFBbEIsQ0FGZ0M7QUFHaEMsYUFBSyxTQUFMLENBQWUsSUFBZixFQUFxQixRQUFyQixFQUErQixLQUFLLE9BQUwsRUFBYyxJQUE3QyxFQUhnQztPQUFsQzs7Ozt3QkEzS2dCO0FBQ2hCLGFBQU8sS0FBSyxXQUFMLENBQWlCLFdBQWpCLENBRFM7Ozs7Ozs7Ozs7Ozt3QkFVSTtBQUNwQixhQUFPLEtBQUssVUFBTCxHQUFrQixDQUFDLEtBQUssV0FBTCxDQUFpQixXQUFqQixHQUErQixLQUFLLE1BQUwsQ0FBaEMsR0FBK0MsS0FBSyxPQUFMLENBRHBEOzs7O3NCQTBCYixRQUFRO0FBQ2YsVUFBSSxVQUFVLEtBQUssV0FBTCxHQUFtQixDQUFDLFFBQUQsSUFBYSxLQUFLLFNBQUwsR0FBaUIsUUFBakIsRUFBMkI7QUFDdkUsWUFBSSxDQUFDLEtBQUssYUFBTCxFQUFvQjtBQUN2QixlQUFLLGFBQUwsR0FBcUIsSUFBSSxXQUFKLENBQWdCLElBQWhCLENBQXJCLENBRHVCO0FBRXZCLGVBQUssV0FBTCxDQUFpQixHQUFqQixDQUFxQixLQUFLLGFBQUwsRUFBb0IsUUFBekMsRUFGdUI7U0FBekI7O0FBS0EsWUFBSSxLQUFLLE9BQUwsS0FBaUIsQ0FBakIsRUFBb0I7QUFDdEIsY0FBTSxXQUFXLEtBQUssZUFBTCxDQURLO0FBRXRCLGNBQU0sUUFBUSxLQUFLLEdBQUwsQ0FBUyxLQUFLLFdBQUwsRUFBa0IsS0FBSyxTQUFMLENBQW5DLENBRmdCO0FBR3RCLGNBQU0sUUFBUSxLQUFLLEdBQUwsQ0FBUyxLQUFLLFdBQUwsRUFBa0IsS0FBSyxTQUFMLENBQW5DLENBSGdCOztBQUt0QixjQUFJLEtBQUssT0FBTCxHQUFlLENBQWYsSUFBb0IsV0FBVyxLQUFYLEVBQ3RCLEtBQUssSUFBTCxDQUFVLEtBQVYsRUFERixLQUVLLElBQUksS0FBSyxPQUFMLEdBQWUsQ0FBZixJQUFvQixXQUFXLEtBQVgsRUFDM0IsS0FBSyxJQUFMLENBQVUsS0FBVixFQURHLEtBR0gsS0FBSyxhQUFMLENBQW1CLFVBQW5CLENBQThCLEtBQUssT0FBTCxDQUE5QixDQUhHO1NBUFA7T0FORixNQWtCTyxJQUFJLEtBQUssYUFBTCxFQUFvQjtBQUM3QixhQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBd0IsS0FBSyxhQUFMLENBQXhCLENBRDZCO0FBRTdCLGFBQUssYUFBTCxHQUFxQixJQUFyQixDQUY2QjtPQUF4Qjs7d0JBTUU7QUFDVCxhQUFRLENBQUMsQ0FBQyxLQUFLLGFBQUwsQ0FERDs7OztzQkFXRyxXQUFXO0FBQ3ZCLFdBQUssaUJBQUwsQ0FBdUIsU0FBdkIsRUFBa0MsS0FBSyxTQUFMLENBQWxDLENBRHVCOzt3QkFJVDtBQUNkLGFBQU8sS0FBSyxXQUFMLENBRE87Ozs7c0JBSUosU0FBUztBQUNuQixXQUFLLGlCQUFMLENBQXVCLEtBQUssV0FBTCxFQUFrQixPQUF6QyxFQURtQjs7d0JBSVA7QUFDWixhQUFPLEtBQUssU0FBTCxDQURLOzs7O3NCQXFESixPQUFPO0FBQ2YsVUFBSSxPQUFPLEtBQUssTUFBTCxFQUFQLENBRFc7O0FBR2YsVUFBSSxTQUFTLENBQVQsRUFBWTtBQUNkLFlBQUksUUFBUSxJQUFSLEVBQ0YsUUFBUSxJQUFSLENBREYsS0FFSyxJQUFJLFFBQVEsR0FBUixFQUNQLFFBQVEsR0FBUixDQURHO09BSFAsTUFLTztBQUNMLFlBQUksUUFBUSxDQUFDLEdBQUQsRUFDVixRQUFRLENBQUMsR0FBRCxDQURWLEtBRUssSUFBSSxRQUFRLENBQUMsSUFBRCxFQUNmLFFBQVEsQ0FBQyxJQUFELENBREw7T0FSUDs7QUFZQSxXQUFLLGNBQUwsR0FBc0IsS0FBdEIsQ0FmZTs7QUFpQmYsVUFBSSxLQUFLLE9BQUwsS0FBaUIsQ0FBakIsRUFDRixLQUFLLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLEtBQUssVUFBTCxFQUFpQixLQUF0QyxFQURGOzs7Ozs7Ozt3QkFRVTtBQUNWLGFBQU8sS0FBSyxjQUFMLENBREc7OztTQTdPTyIsImZpbGUiOiJwbGF5LWNvbnRyb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi9jb3JlL3NjaGVkdWxpbmctcXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cbmNvbnN0IEVTUElMT04gPSAxZS04O1xuXG5jbGFzcyBMb29wQ29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLmxvd2VyID0gLUluZmluaXR5O1xuICAgIHRoaXMudXBwZXIgPSBJbmZpbml0eTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgY29uc3QgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgY29uc3Qgc3BlZWQgPSBwbGF5Q29udHJvbC5zcGVlZDtcbiAgICBjb25zdCBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgY29uc3QgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYoc3BlZWQgPiAwKVxuICAgICAgdGltZSArPSBFU1BJTE9OO1xuICAgIGVsc2VcbiAgICAgIHRpbWUgLT0gRVBTSUxPTjtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCBsb3dlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIpIC0gRVNQSUxPTjtcbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIHVwcGVyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlcikgKyBFU1BJTE9OO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHJlc2NoZWR1bGUoc3BlZWQpIHtcbiAgICBjb25zdCBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICBjb25zdCBsb3dlciA9IE1hdGgubWluKHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuICAgIGNvbnN0IHVwcGVyID0gTWF0aC5tYXgocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG5cbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgdGhpcy5sb3dlciA9IGxvd2VyO1xuICAgIHRoaXMudXBwZXIgPSB1cHBlcjtcblxuICAgIGlmIChsb3dlciA9PT0gdXBwZXIpXG4gICAgICBzcGVlZCA9IDA7XG5cbiAgICBpZiAoc3BlZWQgPiAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlcikgLSBFU1BJTE9OKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyKSArIEVTUElMT04pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGFwcGx5TG9vcEJvdW5kYXJpZXMocG9zaXRpb24sIHNwZWVkKSB7XG4gICAgY29uc3QgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIGNvbnN0IHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPj0gdXBwZXIpXG4gICAgICByZXR1cm4gbG93ZXIgKyAocG9zaXRpb24gLSBsb3dlcikgJSAodXBwZXIgLSBsb3dlcik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uIDwgbG93ZXIpXG4gICAgICByZXR1cm4gdXBwZXIgLSAodXBwZXIgLSBwb3NpdGlvbikgJSAodXBwZXIgLSBsb3dlcik7XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sbGVkIGJhc2UgY2xhc3NcbmNsYXNzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2Vlayk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG5cbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciBlbmdpbmVzIGltcGxlbWVudGluZyB0aGUgKnNwZWVkLWNvbnRyb2xsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIGVuZ2luZXMgaW1wbG1lbnRpbmcgdGhlICp0cmFuc3BvcnRlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2socGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCkge1xuICAgICAgICAvLyBjaGFuZ2Ugc3BlZWQgd2l0aG91dCByZXZlcnNpbmcgZGlyZWN0aW9uXG4gICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgICAgdmFyIHRpbWUgPSBwbGF5Q29udHJvbC5fX3N5bmMoKTtcblxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwbGF5Q29udHJvbC5fX3Bvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2suZGVzdHJveSgpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIHRpbWUgZW5naW5lcyBpbXBsZW1lbnRpbmcgdGhlICpzY2hlZHVsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcblxuICAgIC8vIHNjaGVkdWxpbmcgcXVldWUgYmVjb21lcyBtYXN0ZXIgb2YgZW5naW5lXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxpbmdRdWV1ZShwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChsYXN0U3BlZWQgPT09IDAgJiYgc3BlZWQgIT09IDApIC8vIHN0YXJ0IG9yIHNlZWtcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKCk7XG4gICAgZWxzZSBpZiAobGFzdFNwZWVkICE9PSAwICYmIHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUuZGVzdHJveSgpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyB0cmFuc2xhdGVzIHRyYW5zcG9ydGVkIGVuZ2luZSBhZHZhbmNlUG9zaXRpb24gaW50byBnbG9iYWwgc2NoZWR1bGVyIHRpbWVzXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fZW5naW5lO1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIHZhciBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBpbnRlcm5hbCBzY2hlZHVsaW5nIHF1ZXVlIHRoYXQgcmV0dXJucyB0aGUgY3VycmVudCBwb3NpdGlvbiAoYW5kIHRpbWUpIG9mIHRoZSBwbGF5IGNvbnRyb2xcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuYWRkKGVuZ2luZSwgSW5maW5pdHkpO1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBtZXRhLWNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5Q29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihlbmdpbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IGRlZmF1bHRBdWRpb0NvbnRleHQ7XG4gICAgdGhpcy5fX3NjaGVkdWxlciA9IGdldFNjaGVkdWxlcih0aGlzLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuXG4gICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IDE7XG5cbiAgICAvLyBzeW5jaHJvbml6ZWQgdGllLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIC8vIG5vbi16ZXJvIFwidXNlclwiIHNwZWVkXG4gICAgdGhpcy5fX3BsYXlpbmdTcGVlZCA9IDE7XG5cbiAgICBpZiAoZW5naW5lKVxuICAgICAgdGhpcy5fX3NldEVuZ2luZShlbmdpbmUpO1xuICB9XG5cbiAgX19zZXRFbmdpbmUoZW5naW5lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoZW5naW5lKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRUcmFuc3BvcnRlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkU2NoZWR1bGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBwbGF5IGNvbnRyb2xcIik7XG4gIH1cblxuICBfX3Jlc2V0RW5naW5lKCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5kZXN0cm95KCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUvZXh0cmFwb2xhdGUgcGxheWluZyB0aW1lIGZvciBnaXZlbiBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgdGltZVxuICAgKi9cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgcG9zaXRpb24gZm9yIGdpdmVuIHRpbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGV4dHJhcG9sYXRlZCBwb3NpdGlvblxuICAgKi9cbiAgX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jKCkge1xuICAgIHZhciBub3cgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiArPSAobm93IC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICAgIHRoaXMuX190aW1lID0gbm93O1xuICAgIHJldHVybiBub3c7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHRpbWVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHBsYXlpbmcgcG9zaXRpb25cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cblxuICBzZXQoZW5naW5lID0gbnVsbCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB2YXIgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkICE9PSBudWxsICYmIHRoaXMuX19wbGF5Q29udHJvbGxlZC5fX2VuZ2luZSAhPT0gZW5naW5lKSB7XG5cbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19yZXNldEVuZ2luZSgpO1xuXG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQgPT09IG51bGwgJiYgZW5naW5lICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcblxuICAgICAgICBpZiAoc3BlZWQgIT09IDApXG4gICAgICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0IGxvb3AoZW5hYmxlKSB7XG4gICAgaWYgKGVuYWJsZSAmJiB0aGlzLl9fbG9vcFN0YXJ0ID4gLUluZmluaXR5ICYmIHRoaXMuX19sb29wRW5kIDwgSW5maW5pdHkpIHtcbiAgICAgIGlmICghdGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG5ldyBMb29wQ29udHJvbCh0aGlzKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkdWxlci5hZGQodGhpcy5fX2xvb3BDb250cm9sLCBJbmZpbml0eSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBNYXRoLm1pbih0aGlzLl9fbG9vcFN0YXJ0LCB0aGlzLl9fbG9vcEVuZCk7XG4gICAgICAgIGNvbnN0IHVwcGVyID0gTWF0aC5tYXgodGhpcy5fX2xvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9fc3BlZWQgPiAwICYmIHBvc2l0aW9uID4gdXBwZXIpXG4gICAgICAgICAgdGhpcy5zZWVrKHVwcGVyKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fX3NwZWVkIDwgMCAmJiBwb3NpdGlvbiA8IGxvd2VyKVxuICAgICAgICAgIHRoaXMuc2Vlayhsb3dlcik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIHNldCBsb29wRW5kKGxvb3BFbmQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGxvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHBsYXlpbmdcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHRoaXMuX19wbGF5aW5nU3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlIHBsYXlpbmdcbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcGxheWluZ1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgICB0aGlzLnNlZWsoMCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkIHBsYXlpbmcgc3BlZWQgKG5vbi16ZXJvIHNwZWVkIGJldHdlZW4gLTE2IGFuZCAtMS8xNiBvciBiZXR3ZWVuIDEvMTYgYW5kIDE2KVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHJldHVybiBjdXJyZW50IHBsYXlpbmcgc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlpbmdTcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgKGp1bXAgdG8pIHBsYXlpbmcgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuIl19