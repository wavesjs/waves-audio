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
          var position = this.__loopControl.applyLoopBoundaries();

          this.seek(position);
          this.__loopControl.reschedule(this.__speed);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYXktY29udHJvbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztJQUVNOzs7QUFDSixXQURJLFdBQ0osQ0FBWSxXQUFaLEVBQXlCO3dDQURyQixhQUNxQjs7NkZBRHJCLHlCQUNxQjs7QUFHdkIsVUFBSyxhQUFMLEdBQXFCLFdBQXJCLENBSHVCO0FBSXZCLFVBQUssS0FBTCxHQUFhLENBQUMsUUFBRCxDQUpVO0FBS3ZCLFVBQUssS0FBTCxHQUFhLFFBQWIsQ0FMdUI7O0dBQXpCOzs7Ozs2QkFESTs7Z0NBVVEsTUFBTTtBQUNoQixVQUFJLGNBQWMsS0FBSyxhQUFMLENBREY7QUFFaEIsVUFBSSxRQUFRLFlBQVksS0FBWixDQUZJO0FBR2hCLFVBQUksUUFBUSxLQUFLLEtBQUwsQ0FISTtBQUloQixVQUFJLFFBQVEsS0FBSyxLQUFMLENBSkk7O0FBTWhCLFVBQUksUUFBUSxDQUFSLEVBQVc7QUFDYixvQkFBWSxTQUFaLENBQXNCLElBQXRCLEVBQTRCLEtBQTVCLEVBQW1DLEtBQW5DLEVBQTBDLElBQTFDLEVBRGE7QUFFYixlQUFPLFlBQVksbUJBQVosQ0FBZ0MsS0FBaEMsQ0FBUCxDQUZhO09BQWYsTUFHTyxJQUFJLFFBQVEsQ0FBUixFQUFXO0FBQ3BCLG9CQUFZLFNBQVosQ0FBc0IsSUFBdEIsRUFBNEIsS0FBNUIsRUFBbUMsS0FBbkMsRUFBMEMsSUFBMUMsRUFEb0I7QUFFcEIsZUFBTyxZQUFZLG1CQUFaLENBQWdDLEtBQWhDLENBQVAsQ0FGb0I7T0FBZjs7QUFLUCxhQUFPLFFBQVAsQ0FkZ0I7Ozs7K0JBaUJQLE9BQU87QUFDaEIsVUFBSSxjQUFjLEtBQUssYUFBTCxDQURGO0FBRWhCLFVBQUksUUFBUSxLQUFLLEdBQUwsQ0FBUyxZQUFZLFdBQVosRUFBeUIsWUFBWSxTQUFaLENBQTFDLENBRlk7QUFHaEIsVUFBSSxRQUFRLEtBQUssR0FBTCxDQUFTLFlBQVksV0FBWixFQUF5QixZQUFZLFNBQVosQ0FBMUMsQ0FIWTs7QUFLaEIsV0FBSyxLQUFMLEdBQWEsS0FBYixDQUxnQjtBQU1oQixXQUFLLEtBQUwsR0FBYSxLQUFiLENBTmdCO0FBT2hCLFdBQUssS0FBTCxHQUFhLEtBQWIsQ0FQZ0I7O0FBU2hCLFVBQUksVUFBVSxLQUFWLEVBQ0YsUUFBUSxDQUFSLENBREY7O0FBR0EsVUFBSSxRQUFRLENBQVIsRUFDRixLQUFLLFNBQUwsQ0FBZSxZQUFZLG1CQUFaLENBQWdDLFFBQVEsSUFBUixDQUEvQyxFQURGLEtBRUssSUFBSSxRQUFRLENBQVIsRUFDUCxLQUFLLFNBQUwsQ0FBZSxZQUFZLG1CQUFaLENBQWdDLFFBQVEsSUFBUixDQUEvQyxFQURHLEtBR0gsS0FBSyxTQUFMLENBQWUsUUFBZixFQUhHOzs7O3dDQU1hLFVBQVUsT0FBTztBQUNuQyxVQUFJLFFBQVEsS0FBSyxLQUFMLENBRHVCO0FBRW5DLFVBQUksUUFBUSxLQUFLLEtBQUwsQ0FGdUI7O0FBSW5DLFVBQUksUUFBUSxDQUFSLElBQWEsWUFBWSxLQUFaLEVBQ2YsT0FBTyxRQUFRLENBQUMsV0FBVyxLQUFYLENBQUQsSUFBc0IsUUFBUSxLQUFSLENBQXRCLENBRGpCLEtBRUssSUFBSSxRQUFRLENBQVIsSUFBYSxXQUFXLEtBQVgsRUFDcEIsT0FBTyxRQUFRLENBQUMsUUFBUSxRQUFSLENBQUQsSUFBc0IsUUFBUSxLQUFSLENBQXRCLENBRFo7O0FBR0wsYUFBTyxRQUFQLENBVG1DOzs7U0EvQ2pDOzs7Ozs7SUE2REE7QUFDSixXQURJLGNBQ0osQ0FBWSxXQUFaLEVBQXlCLE1BQXpCLEVBQWlDO3dDQUQ3QixnQkFDNkI7O0FBQy9CLFNBQUssYUFBTCxHQUFxQixXQUFyQixDQUQrQjs7QUFHL0IsV0FBTyxNQUFQLEdBQWdCLElBQWhCLENBSCtCO0FBSS9CLFNBQUssUUFBTCxHQUFnQixNQUFoQixDQUorQjtHQUFqQzs7NkJBREk7OzhCQVFNLE1BQU0sVUFBVSxPQUFPLE1BQU0sV0FBVztBQUNoRCxXQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLElBQXhCLEVBQThCLFFBQTlCLEVBQXdDLEtBQXhDLEVBQStDLElBQS9DLEVBRGdEOzs7OzhCQVl4QztBQUNSLFdBQUssYUFBTCxHQUFxQixJQUFyQixDQURROztBQUdSLFdBQUssUUFBTCxDQUFjLE1BQWQsR0FBdUIsSUFBdkIsQ0FIUTtBQUlSLFdBQUssUUFBTCxHQUFnQixJQUFoQixDQUpROzs7O3dCQVJRO0FBQ2hCLGFBQU8sS0FBSyxhQUFMLENBQW1CLFdBQW5CLENBRFM7Ozs7d0JBSUk7QUFDcEIsYUFBTyxLQUFLLGFBQUwsQ0FBbUIsZUFBbkIsQ0FEYTs7O1NBaEJsQjs7Ozs7O0lBNkJBOzs7QUFDSixXQURJLDZCQUNKLENBQVksV0FBWixFQUF5QixNQUF6QixFQUFpQzt3Q0FEN0IsK0JBQzZCO3dGQUQ3QiwwQ0FFSSxhQUFhLFNBRFk7R0FBakM7O1NBREk7RUFBc0M7Ozs7O0lBT3RDOzs7QUFDSixXQURJLHlCQUNKLENBQVksV0FBWixFQUF5QixNQUF6QixFQUFpQzt3Q0FEN0IsMkJBQzZCOzs4RkFEN0Isc0NBRUksYUFBYSxTQURZOztBQUcvQixXQUFLLGVBQUwsR0FBdUIsSUFBSSwyQkFBSixDQUFnQyxXQUFoQyxFQUE2QyxNQUE3QyxDQUF2QixDQUgrQjs7R0FBakM7OzZCQURJOzs4QkFPTSxNQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVc7QUFDaEQsVUFBSSxVQUFVLFNBQVYsSUFBd0IsUUFBUSxVQUFVLENBQVYsRUFBYztBQUNoRCxZQUFJLFlBQUo7OztBQURnRCxZQUk1QyxRQUFRLFFBQVEsU0FBUixHQUFvQixDQUFwQixFQUF1Qjs7QUFFakMseUJBQWUsS0FBSyxRQUFMLENBQWMsWUFBZCxDQUEyQixJQUEzQixFQUFpQyxRQUFqQyxFQUEyQyxLQUEzQyxDQUFmLENBRmlDO1NBQW5DLE1BR08sSUFBSSxjQUFjLENBQWQsRUFBaUI7O0FBRTFCLHlCQUFlLEtBQUssUUFBTCxDQUFjLFlBQWQsQ0FBMkIsSUFBM0IsRUFBaUMsUUFBakMsRUFBMkMsS0FBM0MsQ0FBZixDQUYwQjtTQUFyQixNQUdBLElBQUksVUFBVSxDQUFWLEVBQWE7O0FBRXRCLHlCQUFlLFFBQWYsQ0FGc0I7O0FBSXRCLGNBQUksS0FBSyxRQUFMLENBQWMsU0FBZCxFQUNGLEtBQUssUUFBTCxDQUFjLFNBQWQsQ0FBd0IsSUFBeEIsRUFBOEIsUUFBOUIsRUFBd0MsQ0FBeEMsRUFERjtTQUpLLE1BTUEsSUFBSSxLQUFLLFFBQUwsQ0FBYyxTQUFkLEVBQXlCOztBQUVsQyxlQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLElBQXhCLEVBQThCLFFBQTlCLEVBQXdDLEtBQXhDLEVBRmtDO1NBQTdCOztBQUtQLGFBQUssZUFBTCxDQUFxQixhQUFyQixDQUFtQyxZQUFuQyxFQXJCZ0Q7T0FBbEQ7Ozs7d0NBeUJrQixRQUE4QjtVQUF0QixpRUFBVyx5QkFBVzs7QUFDaEQsVUFBSSxhQUFhLFNBQWIsRUFBd0I7QUFDMUIsWUFBSSxjQUFjLEtBQUssYUFBTCxDQURRO0FBRTFCLFlBQUksT0FBTyxZQUFZLE1BQVosRUFBUCxDQUZzQjs7QUFJMUIsbUJBQVcsS0FBSyxRQUFMLENBQWMsWUFBZCxDQUEyQixJQUEzQixFQUFpQyxZQUFZLFVBQVosRUFBd0IsWUFBWSxPQUFaLENBQXBFLENBSjBCO09BQTVCOztBQU9BLFdBQUssZUFBTCxDQUFxQixhQUFyQixDQUFtQyxRQUFuQyxFQVJnRDs7Ozs4QkFXeEM7QUFDUixXQUFLLGVBQUwsQ0FBcUIsT0FBckIsR0FEUTtBQUVSLFdBQUssZUFBTCxHQUF1QixJQUF2QixDQUZROztBQUlSLHVEQWhERSxpRUFnREYsQ0FKUTs7O1NBNUNOO0VBQWtDOzs7OztJQXFEbEM7OztBQUNKLFdBREksdUJBQ0osQ0FBWSxXQUFaLEVBQXlCLE1BQXpCLEVBQWlDO3dDQUQ3Qix5QkFDNkI7Ozs7OzhGQUQ3QixvQ0FFSSxhQUFhLFNBRFk7O0FBSS9CLFdBQU8sTUFBUCxHQUFnQixJQUFoQixDQUorQjtBQUsvQixXQUFLLGlCQUFMLEdBQXlCLElBQUksNkJBQUosQ0FBa0MsV0FBbEMsRUFBK0MsTUFBL0MsQ0FBekIsQ0FMK0I7O0dBQWpDOzs2QkFESTs7OEJBU00sTUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXO0FBQ2hELFVBQUksY0FBYyxDQUFkLElBQW1CLFVBQVUsQ0FBVjtBQUNyQixhQUFLLFFBQUwsQ0FBYyxTQUFkLEdBREYsS0FFSyxJQUFJLGNBQWMsQ0FBZCxJQUFtQixVQUFVLENBQVY7QUFDMUIsYUFBSyxRQUFMLENBQWMsU0FBZCxDQUF3QixRQUF4QixFQURHOzs7OzhCQUlHO0FBQ1IsV0FBSyxpQkFBTCxDQUF1QixPQUF2QixHQURRO0FBRVIsdURBbEJFLCtEQWtCRixDQUZROzs7U0FoQk47RUFBZ0M7Ozs7O0lBdUJoQzs7O0FBQ0osV0FESSwyQkFDSixDQUFZLFdBQVosRUFBeUIsTUFBekIsRUFBaUM7d0NBRDdCLDZCQUM2Qjs7OEZBRDdCLHlDQUM2Qjs7QUFHL0IsV0FBSyxhQUFMLEdBQXFCLFdBQXJCLENBSCtCO0FBSS9CLFdBQUssUUFBTCxHQUFnQixNQUFoQixDQUorQjs7QUFNL0IsV0FBSyxjQUFMLEdBQXNCLFFBQXRCLENBTitCO0FBTy9CLGdCQUFZLFdBQVosQ0FBd0IsR0FBeEIsU0FBa0MsUUFBbEMsRUFQK0I7O0dBQWpDOzs2QkFESTs7Z0NBV1EsTUFBTTtBQUNoQixVQUFJLGNBQWMsS0FBSyxhQUFMLENBREY7QUFFaEIsVUFBSSxTQUFTLEtBQUssUUFBTCxDQUZHO0FBR2hCLFVBQUksV0FBVyxLQUFLLGNBQUwsQ0FIQztBQUloQixVQUFJLGVBQWUsT0FBTyxlQUFQLENBQXVCLElBQXZCLEVBQTZCLFFBQTdCLEVBQXVDLFlBQVksT0FBWixDQUF0RCxDQUpZO0FBS2hCLFVBQUksV0FBVyxZQUFZLG1CQUFaLENBQWdDLFlBQWhDLENBQVgsQ0FMWTs7QUFPaEIsYUFBTyxZQUFZLElBQVosRUFBa0I7QUFDdkIsdUJBQWUsT0FBTyxlQUFQLENBQXVCLElBQXZCLEVBQTZCLFFBQTdCLEVBQXVDLFlBQVksT0FBWixDQUF0RCxDQUR1QjtBQUV2QixtQkFBVyxZQUFZLG1CQUFaLENBQWdDLFlBQWhDLENBQVgsQ0FGdUI7T0FBekI7O0FBS0EsV0FBSyxjQUFMLEdBQXNCLFlBQXRCLENBWmdCO0FBYWhCLGFBQU8sUUFBUCxDQWJnQjs7OztvQ0F3QjRCO1VBQWhDLGlFQUFXLEtBQUssY0FBTCxnQkFBcUI7O0FBQzVDLFVBQUksT0FBTyxLQUFLLGFBQUwsQ0FBbUIsbUJBQW5CLENBQXVDLFFBQXZDLENBQVAsQ0FEd0M7QUFFNUMsV0FBSyxjQUFMLEdBQXNCLFFBQXRCLENBRjRDO0FBRzVDLFdBQUssU0FBTCxDQUFlLElBQWYsRUFINEM7Ozs7OEJBTXBDO0FBQ1IsV0FBSyxhQUFMLENBQW1CLFdBQW5CLENBQStCLE1BQS9CLENBQXNDLElBQXRDLEVBRFE7QUFFUixXQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FGUTtBQUdSLFdBQUssUUFBTCxHQUFnQixJQUFoQixDQUhROzs7O3dCQWRRO0FBQ2hCLGFBQU8sS0FBSyxhQUFMLENBQW1CLFdBQW5CLENBRFM7Ozs7d0JBSUk7QUFDcEIsYUFBTyxLQUFLLGFBQUwsQ0FBbUIsZUFBbkIsQ0FEYTs7O1NBL0JsQjs7Ozs7O0lBaURBOzs7QUFDSixXQURJLDZCQUNKLENBQVksV0FBWixFQUF5QixNQUF6QixFQUFpQzt3Q0FEN0IsK0JBQzZCOzs4RkFEN0IsMkNBQzZCOztBQUUvQixXQUFLLGFBQUwsR0FBcUIsV0FBckIsQ0FGK0I7QUFHL0IsV0FBSyxRQUFMLEdBQWdCLE1BQWhCLENBSCtCOztBQUsvQixXQUFLLEdBQUwsQ0FBUyxNQUFULEVBQWlCLFFBQWpCLEVBTCtCO0FBTS9CLGdCQUFZLFdBQVosQ0FBd0IsR0FBeEIsU0FBa0MsUUFBbEMsRUFOK0I7O0dBQWpDOzs2QkFESTs7OEJBa0JNO0FBQ1IsV0FBSyxhQUFMLENBQW1CLFdBQW5CLENBQStCLE1BQS9CLENBQXNDLElBQXRDLEVBRFE7QUFFUixXQUFLLE1BQUwsQ0FBWSxLQUFLLFFBQUwsQ0FBWixDQUZROztBQUlSLFdBQUssYUFBTCxHQUFxQixJQUFyQixDQUpRO0FBS1IsV0FBSyxRQUFMLEdBQWdCLElBQWhCLENBTFE7Ozs7d0JBUlE7QUFDaEIsYUFBTyxLQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FEUzs7Ozt3QkFJSTtBQUNwQixhQUFPLEtBQUssYUFBTCxDQUFtQixlQUFuQixDQURhOzs7U0FkbEI7Ozs7OztJQTRCZTs7O0FBQ25CLFdBRG1CLFdBQ25CLENBQVksTUFBWixFQUFrQztRQUFkLGdFQUFVLGtCQUFJO3dDQURmLGFBQ2U7OzhGQURmLHlCQUNlOztBQUdoQyxXQUFLLFlBQUwsR0FBb0IsUUFBUSxZQUFSLDBCQUFwQixDQUhnQztBQUloQyxXQUFLLFdBQUwsR0FBbUIsNkJBQWEsT0FBSyxZQUFMLENBQWhDLENBSmdDOztBQU1oQyxXQUFLLGdCQUFMLEdBQXdCLElBQXhCLENBTmdDOztBQVFoQyxXQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FSZ0M7QUFTaEMsV0FBSyxXQUFMLEdBQW1CLENBQW5CLENBVGdDO0FBVWhDLFdBQUssU0FBTCxHQUFpQixDQUFqQjs7O0FBVmdDLFVBYWhDLENBQUssTUFBTCxHQUFjLENBQWQsQ0FiZ0M7QUFjaEMsV0FBSyxVQUFMLEdBQWtCLENBQWxCLENBZGdDO0FBZWhDLFdBQUssT0FBTCxHQUFlLENBQWY7OztBQWZnQyxVQWtCaEMsQ0FBSyxjQUFMLEdBQXNCLENBQXRCLENBbEJnQzs7QUFvQmhDLFFBQUksTUFBSixFQUNFLE9BQUssV0FBTCxDQUFpQixNQUFqQixFQURGO2tCQXBCZ0M7R0FBbEM7OzZCQURtQjs7Z0NBeUJQLFFBQVE7QUFDbEIsVUFBSSxPQUFPLE1BQVAsRUFDRixNQUFNLElBQUksS0FBSixDQUFVLDJDQUFWLENBQU4sQ0FERjs7QUFHQSxVQUFJLHFCQUFXLHlCQUFYLENBQXFDLE1BQXJDLENBQUosRUFDRSxLQUFLLGdCQUFMLEdBQXdCLElBQUksNkJBQUosQ0FBa0MsSUFBbEMsRUFBd0MsTUFBeEMsQ0FBeEIsQ0FERixLQUVLLElBQUkscUJBQVcscUJBQVgsQ0FBaUMsTUFBakMsQ0FBSixFQUNILEtBQUssZ0JBQUwsR0FBd0IsSUFBSSx5QkFBSixDQUE4QixJQUE5QixFQUFvQyxNQUFwQyxDQUF4QixDQURHLEtBRUEsSUFBSSxxQkFBVyxtQkFBWCxDQUErQixNQUEvQixDQUFKLEVBQ0gsS0FBSyxnQkFBTCxHQUF3QixJQUFJLHVCQUFKLENBQTRCLElBQTVCLEVBQWtDLE1BQWxDLENBQXhCLENBREcsS0FHSCxNQUFNLElBQUksS0FBSixDQUFVLHdDQUFWLENBQU4sQ0FIRzs7OztvQ0FNUztBQUNkLFdBQUssZ0JBQUwsQ0FBc0IsT0FBdEIsR0FEYztBQUVkLFdBQUssZ0JBQUwsR0FBd0IsSUFBeEIsQ0FGYzs7Ozs7Ozs7Ozs7d0NBVUksVUFBVTtBQUM1QixhQUFPLEtBQUssTUFBTCxHQUFjLENBQUMsV0FBVyxLQUFLLFVBQUwsQ0FBWixHQUErQixLQUFLLE9BQUwsQ0FEeEI7Ozs7Ozs7Ozs7O3dDQVNWLE1BQU07QUFDeEIsYUFBTyxLQUFLLFVBQUwsR0FBa0IsQ0FBQyxPQUFPLEtBQUssTUFBTCxDQUFSLEdBQXVCLEtBQUssT0FBTCxDQUR4Qjs7Ozs2QkFJakI7QUFDUCxVQUFJLE1BQU0sS0FBSyxXQUFMLENBREg7QUFFUCxXQUFLLFVBQUwsSUFBbUIsQ0FBQyxNQUFNLEtBQUssTUFBTCxDQUFQLEdBQXNCLEtBQUssT0FBTCxDQUZsQztBQUdQLFdBQUssTUFBTCxHQUFjLEdBQWQsQ0FITztBQUlQLGFBQU8sR0FBUCxDQUpPOzs7Ozs7Ozs7Ozs7MEJBNEJVO1VBQWYsK0RBQVMsb0JBQU07O0FBQ2pCLFVBQUksT0FBTyxLQUFLLE1BQUwsRUFBUCxDQURhO0FBRWpCLFVBQUksUUFBUSxLQUFLLE9BQUwsQ0FGSzs7QUFJakIsVUFBSSxLQUFLLGdCQUFMLEtBQTBCLElBQTFCLElBQWtDLEtBQUssZ0JBQUwsQ0FBc0IsUUFBdEIsS0FBbUMsTUFBbkMsRUFBMkM7O0FBRS9FLGFBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsS0FBSyxVQUFMLEVBQWlCLENBQXRDLEVBRitFOztBQUkvRSxZQUFJLEtBQUssZ0JBQUwsRUFDRixLQUFLLGFBQUwsR0FERjs7QUFJQSxZQUFJLEtBQUssZ0JBQUwsS0FBMEIsSUFBMUIsSUFBa0MsV0FBVyxJQUFYLEVBQWlCO0FBQ3JELGVBQUssV0FBTCxDQUFpQixNQUFqQixFQURxRDs7QUFHckQsY0FBSSxVQUFVLENBQVYsRUFDRixLQUFLLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLEtBQUssVUFBTCxFQUFpQixLQUF0QyxFQURGO1NBSEY7T0FSRjs7OztzQ0F3Q2dCLFdBQVcsU0FBUztBQUNwQyxXQUFLLFdBQUwsR0FBbUIsU0FBbkIsQ0FEb0M7QUFFcEMsV0FBSyxTQUFMLEdBQWlCLE9BQWpCLENBRm9DOztBQUlwQyxXQUFLLElBQUwsR0FBWSxLQUFLLElBQUwsQ0FKd0I7Ozs7Ozs7OEJBd0I1QixNQUFNLFVBQVUsT0FBcUI7VUFBZCw2REFBTyxxQkFBTzs7QUFDN0MsVUFBSSxZQUFZLEtBQUssT0FBTCxDQUQ2Qjs7QUFHN0MsVUFBSSxVQUFVLFNBQVYsSUFBdUIsSUFBdkIsRUFBNkI7QUFDL0IsWUFBSSxDQUFDLFFBQVEsY0FBYyxDQUFkLENBQVQsSUFBNkIsS0FBSyxhQUFMLEVBQy9CLFdBQVcsS0FBSyxhQUFMLENBQW1CLG1CQUFuQixDQUF1QyxRQUF2QyxFQUFpRCxLQUFqRCxDQUFYLENBREY7O0FBR0EsYUFBSyxNQUFMLEdBQWMsSUFBZCxDQUorQjtBQUsvQixhQUFLLFVBQUwsR0FBa0IsUUFBbEIsQ0FMK0I7QUFNL0IsYUFBSyxPQUFMLEdBQWUsS0FBZixDQU4rQjs7QUFRL0IsWUFBSSxLQUFLLGdCQUFMLEVBQ0YsS0FBSyxnQkFBTCxDQUFzQixTQUF0QixDQUFnQyxJQUFoQyxFQUFzQyxRQUF0QyxFQUFnRCxLQUFoRCxFQUF1RCxJQUF2RCxFQUE2RCxTQUE3RCxFQURGOztBQUdBLFlBQUksS0FBSyxhQUFMLEVBQ0YsS0FBSyxhQUFMLENBQW1CLFVBQW5CLENBQThCLEtBQTlCLEVBREY7T0FYRjs7Ozs7Ozs7OzRCQW1CTTtBQUNOLFVBQUksT0FBTyxLQUFLLE1BQUwsRUFBUCxDQURFO0FBRU4sV0FBSyxTQUFMLENBQWUsSUFBZixFQUFxQixLQUFLLFVBQUwsRUFBaUIsS0FBSyxjQUFMLENBQXRDLENBRk07Ozs7Ozs7Ozs0QkFRQTtBQUNOLFVBQUksT0FBTyxLQUFLLE1BQUwsRUFBUCxDQURFO0FBRU4sV0FBSyxTQUFMLENBQWUsSUFBZixFQUFxQixLQUFLLFVBQUwsRUFBaUIsQ0FBdEMsRUFGTTs7Ozs7Ozs7OzJCQVFEO0FBQ0wsVUFBSSxPQUFPLEtBQUssTUFBTCxFQUFQLENBREM7QUFFTCxXQUFLLFNBQUwsQ0FBZSxJQUFmLEVBQXFCLEtBQUssVUFBTCxFQUFpQixDQUF0QyxFQUZLO0FBR0wsV0FBSyxJQUFMLENBQVUsQ0FBVixFQUhLOzs7Ozs7Ozs7Ozs7Ozs7O3lCQTJDRixVQUFVO0FBQ2IsVUFBSSxhQUFhLEtBQUssVUFBTCxFQUFpQjtBQUNoQyxZQUFJLE9BQU8sS0FBSyxNQUFMLEVBQVAsQ0FENEI7QUFFaEMsYUFBSyxVQUFMLEdBQWtCLFFBQWxCLENBRmdDO0FBR2hDLGFBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsUUFBckIsRUFBK0IsS0FBSyxPQUFMLEVBQWMsSUFBN0MsRUFIZ0M7T0FBbEM7Ozs7d0JBcktnQjtBQUNoQixhQUFPLEtBQUssV0FBTCxDQUFpQixXQUFqQixDQURTOzs7Ozs7Ozs7Ozs7d0JBVUk7QUFDcEIsYUFBTyxLQUFLLFVBQUwsR0FBa0IsQ0FBQyxLQUFLLFdBQUwsQ0FBaUIsV0FBakIsR0FBK0IsS0FBSyxNQUFMLENBQWhDLEdBQStDLEtBQUssT0FBTCxDQURwRDs7OztzQkEwQmIsUUFBUTtBQUNmLFVBQUksVUFBVSxLQUFLLFdBQUwsR0FBbUIsQ0FBQyxRQUFELElBQWEsS0FBSyxTQUFMLEdBQWlCLFFBQWpCLEVBQTJCO0FBQ3ZFLFlBQUksQ0FBQyxLQUFLLGFBQUwsRUFBb0I7QUFDdkIsZUFBSyxhQUFMLEdBQXFCLElBQUksV0FBSixDQUFnQixJQUFoQixDQUFyQixDQUR1QjtBQUV2QixlQUFLLFdBQUwsQ0FBaUIsR0FBakIsQ0FBcUIsS0FBSyxhQUFMLEVBQW9CLFFBQXpDLEVBRnVCO1NBQXpCOztBQUtBLFlBQUksS0FBSyxPQUFMLEtBQWlCLENBQWpCLEVBQW9CO0FBQ3RCLGNBQU0sV0FBVyxLQUFLLGFBQUwsQ0FBbUIsbUJBQW5CLEVBQVgsQ0FEZ0I7O0FBR3RCLGVBQUssSUFBTCxDQUFVLFFBQVYsRUFIc0I7QUFJdEIsZUFBSyxhQUFMLENBQW1CLFVBQW5CLENBQThCLEtBQUssT0FBTCxDQUE5QixDQUpzQjtTQUF4QjtPQU5GLE1BWU8sSUFBSSxLQUFLLGFBQUwsRUFBb0I7QUFDN0IsYUFBSyxXQUFMLENBQWlCLE1BQWpCLENBQXdCLEtBQUssYUFBTCxDQUF4QixDQUQ2QjtBQUU3QixhQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FGNkI7T0FBeEI7O3dCQU1FO0FBQ1QsYUFBUSxDQUFDLENBQUMsS0FBSyxhQUFMLENBREQ7Ozs7c0JBV0csV0FBVztBQUN2QixXQUFLLGlCQUFMLENBQXVCLFNBQXZCLEVBQWtDLEtBQUssU0FBTCxDQUFsQyxDQUR1Qjs7d0JBSVQ7QUFDZCxhQUFPLEtBQUssV0FBTCxDQURPOzs7O3NCQUlKLFNBQVM7QUFDbkIsV0FBSyxpQkFBTCxDQUF1QixLQUFLLFdBQUwsRUFBa0IsT0FBekMsRUFEbUI7O3dCQUlQO0FBQ1osYUFBTyxLQUFLLFNBQUwsQ0FESzs7OztzQkFxREosT0FBTztBQUNmLFVBQUksT0FBTyxLQUFLLE1BQUwsRUFBUCxDQURXOztBQUdmLFVBQUksU0FBUyxDQUFULEVBQVk7QUFDZCxZQUFJLFFBQVEsSUFBUixFQUNGLFFBQVEsSUFBUixDQURGLEtBRUssSUFBSSxRQUFRLEdBQVIsRUFDUCxRQUFRLEdBQVIsQ0FERztPQUhQLE1BS087QUFDTCxZQUFJLFFBQVEsQ0FBQyxHQUFELEVBQ1YsUUFBUSxDQUFDLEdBQUQsQ0FEVixLQUVLLElBQUksUUFBUSxDQUFDLElBQUQsRUFDZixRQUFRLENBQUMsSUFBRCxDQURMO09BUlA7O0FBWUEsV0FBSyxjQUFMLEdBQXNCLEtBQXRCLENBZmU7O0FBaUJmLFVBQUksS0FBSyxPQUFMLEtBQWlCLENBQWpCLEVBQ0YsS0FBSyxTQUFMLENBQWUsSUFBZixFQUFxQixLQUFLLFVBQUwsRUFBaUIsS0FBdEMsRUFERjs7Ozs7Ozs7d0JBUVU7QUFDVixhQUFPLEtBQUssY0FBTCxDQURHOzs7U0F2T08iLCJmaWxlIjoicGxheS1jb250cm9sLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvdGltZS1lbmdpbmUnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlJztcbmltcG9ydCB7IGdldFNjaGVkdWxlciB9IGZyb20gJy4vZmFjdG9yaWVzJztcblxuY2xhc3MgTG9vcENvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5sb3dlciA9IC1JbmZpbml0eTtcbiAgICB0aGlzLnVwcGVyID0gSW5maW5pdHk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgc3BlZWQgPSBwbGF5Q29udHJvbC5zcGVlZDtcbiAgICB2YXIgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIHZhciB1cHBlciA9IHRoaXMudXBwZXI7XG5cbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgbG93ZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHVwcGVyKTtcbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIHVwcGVyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgcmVzY2hlZHVsZShzcGVlZCkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgbG93ZXIgPSBNYXRoLm1pbihwbGF5Q29udHJvbC5fX2xvb3BTdGFydCwgcGxheUNvbnRyb2wuX19sb29wRW5kKTtcbiAgICB2YXIgdXBwZXIgPSBNYXRoLm1heChwbGF5Q29udHJvbC5fX2xvb3BTdGFydCwgcGxheUNvbnRyb2wuX19sb29wRW5kKTtcblxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLmxvd2VyID0gbG93ZXI7XG4gICAgdGhpcy51cHBlciA9IHVwcGVyO1xuXG4gICAgaWYgKGxvd2VyID09PSB1cHBlcilcbiAgICAgIHNwZWVkID0gMDtcblxuICAgIGlmIChzcGVlZCA+IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHVwcGVyIC0gMWUtNikpO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIgKyAxZS02KSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIHZhciB1cHBlciA9IHRoaXMudXBwZXI7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uID49IHVwcGVyKVxuICAgICAgcmV0dXJuIGxvd2VyICsgKHBvc2l0aW9uIC0gbG93ZXIpICUgKHVwcGVyIC0gbG93ZXIpO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA8IGxvd2VyKVxuICAgICAgcmV0dXJuIHVwcGVyIC0gKHVwcGVyIC0gcG9zaXRpb24pICUgKHVwcGVyIC0gbG93ZXIpO1xuXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbGxlZCBiYXNlIGNsYXNzXG5jbGFzcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWspO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuXG4gICAgdGhpcy5fX2VuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBmb3IgZW5naW5lcyBpbXBsZW1lbnRpbmcgdGhlICpzcGVlZC1jb250cm9sbGVkKiBpbnRlcmZhY2VcbmNsYXNzIFBsYXlDb250cm9sbGVkU3BlZWRDb250cm9sbGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciBlbmdpbmVzIGltcGxtZW50aW5nIHRoZSAqdHJhbnNwb3J0ZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRUcmFuc3BvcnRlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBuZXcgUGxheUNvbnRyb2xsZWRTY2hlZHVsZXJIb29rKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uO1xuXG4gICAgICAvLyByZXN5bmMgdHJhbnNwb3J0ZWQgZW5naW5lc1xuICAgICAgaWYgKHNlZWsgfHwgc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAgIC8vIHNlZWsgb3IgcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0YXJ0XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0b3BcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICAgICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpIHtcbiAgICAgICAgLy8gY2hhbmdlIHNwZWVkIHdpdGhvdXQgcmV2ZXJzaW5nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICAgIHZhciB0aW1lID0gcGxheUNvbnRyb2wuX19zeW5jKCk7XG5cbiAgICAgIHBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcGxheUNvbnRyb2wuX19wb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG51bGw7XG5cbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciB0aW1lIGVuZ2luZXMgaW1wbGVtZW50aW5nIHRoZSAqc2NoZWR1bGVkKiBpbnRlcmZhY2VcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICAvLyBzY2hlZHVsaW5nIHF1ZXVlIGJlY29tZXMgbWFzdGVyIG9mIGVuZ2luZVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUgPSBuZXcgUGxheUNvbnRyb2xsZWRTY2hlZHVsaW5nUXVldWUocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAobGFzdFNwZWVkID09PSAwICYmIHNwZWVkICE9PSAwKSAvLyBzdGFydCBvciBzZWVrXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZSgpO1xuICAgIGVsc2UgaWYgKGxhc3RTcGVlZCAhPT0gMCAmJiBzcGVlZCA9PT0gMCkgLy8gc3RvcFxuICAgICAgdGhpcy5fX2VuZ2luZS5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlLmRlc3Ryb3koKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gdHJhbnNsYXRlcyB0cmFuc3BvcnRlZCBlbmdpbmUgYWR2YW5jZVBvc2l0aW9uIGludG8gZ2xvYmFsIHNjaGVkdWxlciB0aW1lc1xuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgZW5naW5lID0gdGhpcy5fX2VuZ2luZTtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG5cbiAgICB3aGlsZSAobmV4dFRpbWUgPD0gdGltZSkge1xuICAgICAgbmV4dFBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgICBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gaW50ZXJuYWwgc2NoZWR1bGluZyBxdWV1ZSB0aGF0IHJldHVybnMgdGhlIGN1cnJlbnQgcG9zaXRpb24gKGFuZCB0aW1lKSBvZiB0aGUgcGxheSBjb250cm9sXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICB0aGlzLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlKHRoaXMuX19lbmdpbmUpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgbWV0YS1jbGFzc1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoZW5naW5lLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCBkZWZhdWx0QXVkaW9Db250ZXh0O1xuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIodGhpcy5hdWRpb0NvbnRleHQpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcblxuICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2xvb3BTdGFydCA9IDA7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSAxO1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZSlcbiAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcbiAgfVxuXG4gIF9fc2V0RW5naW5lKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZChlbmdpbmUpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gcGxheSBjb250cm9sXCIpO1xuICB9XG5cbiAgX19yZXNldEVuZ2luZSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgdGltZSBmb3IgZ2l2ZW4gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHRpbWVcbiAgICovXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICB2YXIgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG5cbiAgc2V0KGVuZ2luZSA9IG51bGwpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCAhPT0gbnVsbCAmJiB0aGlzLl9fcGxheUNvbnRyb2xsZWQuX19lbmdpbmUgIT09IGVuZ2luZSkge1xuXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcmVzZXRFbmdpbmUoKTtcblxuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkID09PSBudWxsICYmIGVuZ2luZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKVxuICAgICAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldCBsb29wKGVuYWJsZSkge1xuICAgIGlmIChlbmFibGUgJiYgdGhpcy5fX2xvb3BTdGFydCA+IC1JbmZpbml0eSAmJiB0aGlzLl9fbG9vcEVuZCA8IEluZmluaXR5KSB7XG4gICAgICBpZiAoIXRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBuZXcgTG9vcENvbnRyb2wodGhpcyk7XG4gICAgICAgIHRoaXMuX19zY2hlZHVsZXIuYWRkKHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5fX2xvb3BDb250cm9sLmFwcGx5TG9vcEJvdW5kYXJpZXMoKTtcblxuICAgICAgICB0aGlzLnNlZWsocG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIHNldCBsb29wRW5kKGxvb3BFbmQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGxvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHBsYXlpbmdcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHRoaXMuX19wbGF5aW5nU3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlIHBsYXlpbmdcbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcGxheWluZ1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgICB0aGlzLnNlZWsoMCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkIHBsYXlpbmcgc3BlZWQgKG5vbi16ZXJvIHNwZWVkIGJldHdlZW4gLTE2IGFuZCAtMS8xNiBvciBiZXR3ZWVuIDEvMTYgYW5kIDE2KVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHJldHVybiBjdXJyZW50IHBsYXlpbmcgc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlpbmdTcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgKGp1bXAgdG8pIHBsYXlpbmcgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuIl19