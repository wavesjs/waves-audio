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

var EPSILON = 1e-8;

var LoopControl = function (_TimeEngine) {
  (0, _inherits3.default)(LoopControl, _TimeEngine);

  function LoopControl(playControl) {
    (0, _classCallCheck3.default)(this, LoopControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LoopControl.__proto__ || (0, _getPrototypeOf2.default)(LoopControl)).call(this));

    _this.__playControl = playControl;
    _this.speed = 1;
    _this.lower = -Infinity;
    _this.upper = Infinity;
    return _this;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(LoopControl, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var playControl = this.__playControl;
      var speed = this.speed;
      var lower = this.lower;
      var upper = this.upper;

      if (speed > 0) time += EPSILON;else time -= EPSILON;

      if (speed > 0) {
        playControl.syncSpeed(time, lower, speed, true);
        return playControl.__getTimeAtPosition(upper) - EPSILON;
      } else if (speed < 0) {
        playControl.syncSpeed(time, upper, speed, true);
        return playControl.__getTimeAtPosition(lower) + EPSILON;
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

      if (speed > 0) this.resetTime(playControl.__getTimeAtPosition(upper) - EPSILON);else if (speed < 0) this.resetTime(playControl.__getTimeAtPosition(lower) + EPSILON);else this.resetTime(Infinity);
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
    return (0, _possibleConstructorReturn3.default)(this, (PlayControlledSpeedControlled.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSpeedControlled)).call(this, playControl, engine));
  }

  return PlayControlledSpeedControlled;
}(PlayControlled);

// play control for engines implmenting the *transported* interface


var PlayControlledTransported = function (_PlayControlled2) {
  (0, _inherits3.default)(PlayControlledTransported, _PlayControlled2);

  function PlayControlledTransported(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledTransported);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledTransported.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledTransported)).call(this, playControl, engine));

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
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

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

      (0, _get3.default)(PlayControlledTransported.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledTransported.prototype), 'destroy', this).call(this);
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
    var _this4 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledScheduled.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledScheduled)).call(this, playControl, engine));

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
      (0, _get3.default)(PlayControlledScheduled.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledScheduled;
}(PlayControlled);

// translates transported engine advancePosition into global scheduler times


var PlayControlledSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(PlayControlledSchedulerHook, _TimeEngine2);

  function PlayControlledSchedulerHook(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledSchedulerHook.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSchedulerHook)).call(this));

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
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.__nextPosition;

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

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledSchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSchedulingQueue)).call(this));

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

/**
 * Extends Time Engine to provide playback control of a Time Engine instance.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/play-control.html}
 *
 * @extends TimeEngine
 * @param {TimeEngine} engine - engine to control
 *
 * @example
 * import * as audio from 'waves-audio';
 * const playerEngine = audio.PlayerEngine();
 * const playControl = new audio.PlayControl(playerEngine);
 *
 * playControl.start();
 */


var PlayControl = function (_TimeEngine3) {
  (0, _inherits3.default)(PlayControl, _TimeEngine3);

  function PlayControl(engine) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, PlayControl);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (PlayControl.__proto__ || (0, _getPrototypeOf2.default)(PlayControl)).call(this));

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
     *
     * @param {Number} position position
     * @return {Number} extrapolated time
     * @private
     */

  }, {
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      return this.__time + (position - this.__position) / this.__speed;
    }

    /**
     * Calculate/extrapolate playing position for given time
     *
     * @param {Number} time time
     * @return {Number} extrapolated position
     * @private
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
     * Get current master time.
     * This function will be replaced when the play-control is added to a master.
     *
     * @name currentTime
     * @type {Number}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'set',
    value: function set() {
      var engine = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

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

    /**
     * Sets the play control loop behavior.
     *
     * @type {Boolean}
     * @name loop
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'setLoopBoundaries',


    /**
     * Sets loop start and end time.
     *
     * @param {Number} loopStart - loop start value.
     * @param {Number} loopEnd - loop end value.
     */
    value: function setLoopBoundaries(loopStart, loopEnd) {
      this.__loopStart = loopStart;
      this.__loopEnd = loopEnd;

      this.loop = this.loop;
    }

    /**
     * Sets loop start value
     *
     * @type {Number}
     * @name loopStart
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'syncSpeed',


    // TimeEngine method (speed-controlled interface)
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

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
     * Starts playback
     */

  }, {
    key: 'start',
    value: function start() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, this.__playingSpeed);
    }

    /**
     * Pauses playback and stays at the same position.
     */

  }, {
    key: 'pause',
    value: function pause() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
    }

    /**
     * Stops playback and seeks to initial (0) position.
     */

  }, {
    key: 'stop',
    value: function stop() {
      var time = this.__sync();
      this.syncSpeed(time, 0, 0, true);
    }

    /**
     * If speed if provided, sets the playback speed. The speed value should
     * be non-zero between -16 and -1/16 or between 1/16 and 16.
     *
     * @type {Number}
     * @name speed
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'seek',


    /**
     * Set (jump to) playing position.
     *
     * @param {Number} position target position
     */
    value: function seek(position) {
      var time = this.__sync();
      this.__position = position;
      this.syncSpeed(time, position, this.__speed, true);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__scheduler.currentTime;
    }

    /**
     * Get current master position.
     * This function will be replaced when the play-control is added to a master.
     *
     * @name currentPosition
     * @type {Number}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }

    /**
     * Returns if the play control is runnin g.
     *
     * @name running
     * @type {Boolean}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'running',
    get: function get() {
      return !(this.__speed === 0);
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

    /**
     * Sets loop end value
     *
     * @type {Number}
     * @name loopEnd
     * @memberof PlayControl
     * @instance
     */

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

      if (!this.master && this.__speed !== 0) this.syncSpeed(time, this.__position, speed);
    },
    get: function get() {
      return this.__playingSpeed;
    }
  }]);
  return PlayControl;
}(_timeEngine2.default);

exports.default = PlayControl;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYXktY29udHJvbC5qcyJdLCJuYW1lcyI6WyJFUFNJTE9OIiwiTG9vcENvbnRyb2wiLCJwbGF5Q29udHJvbCIsIl9fcGxheUNvbnRyb2wiLCJzcGVlZCIsImxvd2VyIiwiSW5maW5pdHkiLCJ1cHBlciIsInRpbWUiLCJzeW5jU3BlZWQiLCJfX2dldFRpbWVBdFBvc2l0aW9uIiwiTWF0aCIsIm1pbiIsIl9fbG9vcFN0YXJ0IiwiX19sb29wRW5kIiwibWF4IiwicmVzZXRUaW1lIiwicG9zaXRpb24iLCJQbGF5Q29udHJvbGxlZCIsImVuZ2luZSIsIm1hc3RlciIsIl9fZW5naW5lIiwic2VlayIsImxhc3RTcGVlZCIsImN1cnJlbnRUaW1lIiwiY3VycmVudFBvc2l0aW9uIiwiUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQiLCJQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIiwiX19zY2hlZHVsZXJIb29rIiwiUGxheUNvbnRyb2xsZWRTY2hlZHVsZXJIb29rIiwibmV4dFBvc2l0aW9uIiwic3luY1Bvc2l0aW9uIiwicmVzZXRQb3NpdGlvbiIsInVuZGVmaW5lZCIsIl9fc3luYyIsIl9fcG9zaXRpb24iLCJfX3NwZWVkIiwiZGVzdHJveSIsIlBsYXlDb250cm9sbGVkU2NoZWR1bGVkIiwiX19zY2hlZHVsaW5nUXVldWUiLCJQbGF5Q29udHJvbGxlZFNjaGVkdWxpbmdRdWV1ZSIsIl9fbmV4dFBvc2l0aW9uIiwiX19zY2hlZHVsZXIiLCJhZGQiLCJhZHZhbmNlUG9zaXRpb24iLCJuZXh0VGltZSIsInJlbW92ZSIsIlBsYXlDb250cm9sIiwib3B0aW9ucyIsImF1ZGlvQ29udGV4dCIsIl9fcGxheUNvbnRyb2xsZWQiLCJfX2xvb3BDb250cm9sIiwiX190aW1lIiwiX19wbGF5aW5nU3BlZWQiLCJfX3NldEVuZ2luZSIsIkVycm9yIiwiaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCIsImltcGxlbWVudHNUcmFuc3BvcnRlZCIsImltcGxlbWVudHNTY2hlZHVsZWQiLCJub3ciLCJfX3Jlc2V0RW5naW5lIiwibG9vcFN0YXJ0IiwibG9vcEVuZCIsImxvb3AiLCJhcHBseUxvb3BCb3VuZGFyaWVzIiwicmVzY2hlZHVsZSIsImVuYWJsZSIsInNldExvb3BCb3VuZGFyaWVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUVBLElBQU1BLFVBQVUsSUFBaEI7O0lBRU1DLFc7OztBQUNKLHVCQUFZQyxXQUFaLEVBQXlCO0FBQUE7O0FBQUE7O0FBR3ZCLFVBQUtDLGFBQUwsR0FBcUJELFdBQXJCO0FBQ0EsVUFBS0UsS0FBTCxHQUFhLENBQWI7QUFDQSxVQUFLQyxLQUFMLEdBQWEsQ0FBQ0MsUUFBZDtBQUNBLFVBQUtDLEtBQUwsR0FBYUQsUUFBYjtBQU51QjtBQU94Qjs7QUFFRDs7Ozs7Z0NBQ1lFLEksRUFBTTtBQUNoQixVQUFNTixjQUFjLEtBQUtDLGFBQXpCO0FBQ0EsVUFBTUMsUUFBUSxLQUFLQSxLQUFuQjtBQUNBLFVBQU1DLFFBQVEsS0FBS0EsS0FBbkI7QUFDQSxVQUFNRSxRQUFRLEtBQUtBLEtBQW5COztBQUVBLFVBQUlILFFBQVEsQ0FBWixFQUNFSSxRQUFRUixPQUFSLENBREYsS0FHRVEsUUFBUVIsT0FBUjs7QUFFRixVQUFJSSxRQUFRLENBQVosRUFBZTtBQUNiRixvQkFBWU8sU0FBWixDQUFzQkQsSUFBdEIsRUFBNEJILEtBQTVCLEVBQW1DRCxLQUFuQyxFQUEwQyxJQUExQztBQUNBLGVBQU9GLFlBQVlRLG1CQUFaLENBQWdDSCxLQUFoQyxJQUF5Q1AsT0FBaEQ7QUFDRCxPQUhELE1BR08sSUFBSUksUUFBUSxDQUFaLEVBQWU7QUFDcEJGLG9CQUFZTyxTQUFaLENBQXNCRCxJQUF0QixFQUE0QkQsS0FBNUIsRUFBbUNILEtBQW5DLEVBQTBDLElBQTFDO0FBQ0EsZUFBT0YsWUFBWVEsbUJBQVosQ0FBZ0NMLEtBQWhDLElBQXlDTCxPQUFoRDtBQUNEOztBQUVELGFB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LFdBQVo7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7c0JBUVlpRCxPLEVBQVM7QUFDbkIsV0FBS0ssaUJBQUwsQ0FBdUIsS0FBS3RELFdBQTVCLEVBQXlDaUQsT0FBekM7QUFDRCxLO3dCQUVhO0FBQ1osYUFBTyxLQUFLaEQsU0FBWjtBQUNEOzs7c0JBdURTVixLLEVBQU87QUFDZixVQUFNSSxPQUFPLEtBQUswQixNQUFMLEVBQWI7O0FBRUEsVUFBSTlCLFNBQVMsQ0FBYixFQUFnQjtBQUNkLFlBQUlBLFFBQVEsSUFBWixFQUNFQSxRQUFRLElBQVIsQ0FERixLQUVLLElBQUlBLFFBQVEsR0FBWixFQUNIQSxRQUFRLEdBQVI7QUFDSCxPQUxELE1BS087QUFDTCxZQUFJQSxRQUFRLENBQUMsR0FBYixFQUNFQSxRQUFRLENBQUMsR0FBVCxDQURGLEtBRUssSUFBSUEsUUFBUSxDQUFDLElBQWIsRUFDSEEsUUFBUSxDQUFDLElBQVQ7QUFDSDs7QUFFRCxXQUFLaUQsY0FBTCxHQUFzQmpELEtBQXRCOztBQUVBLFVBQUksQ0FBQyxLQUFLZ0IsTUFBTixJQUFnQixLQUFLZ0IsT0FBTCxLQUFpQixDQUFyQyxFQUNFLEtBQUszQixTQUFMLENBQWVELElBQWYsRUFBcUIsS0FBSzJCLFVBQTFCLEVBQXNDL0IsS0FBdEM7QUFDSCxLO3dCQUVXO0FBQ1YsYUFBTyxLQUFLaUQsY0FBWjtBQUNEOzs7OztrQkFjWU4sVyIsImZpbGUiOiJwbGF5LWNvbnRyb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi9jb3JlL3NjaGVkdWxpbmctcXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cbmNvbnN0IEVQU0lMT04gPSAxZS04O1xuXG5jbGFzcyBMb29wQ29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLnNwZWVkID0gMTtcbiAgICB0aGlzLmxvd2VyID0gLUluZmluaXR5O1xuICAgIHRoaXMudXBwZXIgPSBJbmZpbml0eTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgY29uc3QgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgY29uc3Qgc3BlZWQgPSB0aGlzLnNwZWVkO1xuICAgIGNvbnN0IGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICBjb25zdCB1cHBlciA9IHRoaXMudXBwZXI7XG5cbiAgICBpZiAoc3BlZWQgPiAwKVxuICAgICAgdGltZSArPSBFUFNJTE9OO1xuICAgIGVsc2VcbiAgICAgIHRpbWUgLT0gRVBTSUxPTjtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCBsb3dlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIpIC0gRVBTSUxPTjtcbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIHVwcGVyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlcikgKyBFUFNJTE9OO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHJlc2NoZWR1bGUoc3BlZWQpIHtcbiAgICBjb25zdCBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICBjb25zdCBsb3dlciA9IE1hdGgubWluKHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuICAgIGNvbnN0IHVwcGVyID0gTWF0aC5tYXgocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG5cbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgdGhpcy5sb3dlciA9IGxvd2VyO1xuICAgIHRoaXMudXBwZXIgPSB1cHBlcjtcblxuICAgIGlmIChsb3dlciA9PT0gdXBwZXIpXG4gICAgICBzcGVlZCA9IDA7XG5cbiAgICBpZiAoc3BlZWQgPiAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlcikgLSBFUFNJTE9OKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyKSArIEVQU0lMT04pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGFwcGx5TG9vcEJvdW5kYXJpZXMocG9zaXRpb24sIHNwZWVkKSB7XG4gICAgY29uc3QgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIGNvbnN0IHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPj0gdXBwZXIpXG4gICAgICByZXR1cm4gbG93ZXIgKyAocG9zaXRpb24gLSBsb3dlcikgJSAodXBwZXIgLSBsb3dlcik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uIDwgbG93ZXIpXG4gICAgICByZXR1cm4gdXBwZXIgLSAodXBwZXIgLSBwb3NpdGlvbikgJSAodXBwZXIgLSBsb3dlcik7XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sbGVkIGJhc2UgY2xhc3NcbmNsYXNzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2Vlayk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG5cbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciBlbmdpbmVzIGltcGxlbWVudGluZyB0aGUgKnNwZWVkLWNvbnRyb2xsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIGVuZ2luZXMgaW1wbG1lbnRpbmcgdGhlICp0cmFuc3BvcnRlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2socGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCkge1xuICAgICAgICAvLyBjaGFuZ2Ugc3BlZWQgd2l0aG91dCByZXZlcnNpbmcgZGlyZWN0aW9uXG4gICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgICAgdmFyIHRpbWUgPSBwbGF5Q29udHJvbC5fX3N5bmMoKTtcblxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwbGF5Q29udHJvbC5fX3Bvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2suZGVzdHJveSgpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIHRpbWUgZW5naW5lcyBpbXBsZW1lbnRpbmcgdGhlICpzY2hlZHVsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcblxuICAgIC8vIHNjaGVkdWxpbmcgcXVldWUgYmVjb21lcyBtYXN0ZXIgb2YgZW5naW5lXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxpbmdRdWV1ZShwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChsYXN0U3BlZWQgPT09IDAgJiYgc3BlZWQgIT09IDApIC8vIHN0YXJ0IG9yIHNlZWtcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKCk7XG4gICAgZWxzZSBpZiAobGFzdFNwZWVkICE9PSAwICYmIHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUuZGVzdHJveSgpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyB0cmFuc2xhdGVzIHRyYW5zcG9ydGVkIGVuZ2luZSBhZHZhbmNlUG9zaXRpb24gaW50byBnbG9iYWwgc2NoZWR1bGVyIHRpbWVzXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fZW5naW5lO1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIHZhciBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBpbnRlcm5hbCBzY2hlZHVsaW5nIHF1ZXVlIHRoYXQgcmV0dXJucyB0aGUgY3VycmVudCBwb3NpdGlvbiAoYW5kIHRpbWUpIG9mIHRoZSBwbGF5IGNvbnRyb2xcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuYWRkKGVuZ2luZSwgSW5maW5pdHkpO1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cblxuLyoqXG4gKiBFeHRlbmRzIFRpbWUgRW5naW5lIHRvIHByb3ZpZGUgcGxheWJhY2sgY29udHJvbCBvZiBhIFRpbWUgRW5naW5lIGluc3RhbmNlLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvcGxheS1jb250cm9sLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgVGltZUVuZ2luZVxuICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBlbmdpbmUgdG8gY29udHJvbFxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBwbGF5ZXJFbmdpbmUgPSBhdWRpby5QbGF5ZXJFbmdpbmUoKTtcbiAqIGNvbnN0IHBsYXlDb250cm9sID0gbmV3IGF1ZGlvLlBsYXlDb250cm9sKHBsYXllckVuZ2luZSk7XG4gKlxuICogcGxheUNvbnRyb2wuc3RhcnQoKTtcbiAqL1xuY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoZW5naW5lLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCBkZWZhdWx0QXVkaW9Db250ZXh0O1xuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIodGhpcy5hdWRpb0NvbnRleHQpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcblxuICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2xvb3BTdGFydCA9IDA7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSAxO1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZSlcbiAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcbiAgfVxuXG4gIF9fc2V0RW5naW5lKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZChlbmdpbmUpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gcGxheSBjb250cm9sXCIpO1xuICB9XG5cbiAgX19yZXNldEVuZ2luZSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgdGltZSBmb3IgZ2l2ZW4gcG9zaXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHRpbWVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICBjb25zdCBub3cgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiArPSAobm93IC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICAgIHRoaXMuX190aW1lID0gbm93O1xuICAgIHJldHVybiBub3c7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWUuXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqXG4gICAqIEBuYW1lIGN1cnJlbnRUaW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uLlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgcGxheS1jb250cm9sIGlzIGFkZGVkIHRvIGEgbWFzdGVyLlxuICAgKlxuICAgKiBAbmFtZSBjdXJyZW50UG9zaXRpb25cbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIHBsYXkgY29udHJvbCBpcyBydW5uaW4gZy5cbiAgICpcbiAgICogQG5hbWUgcnVubmluZ1xuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBydW5uaW5nKCkge1xuICAgIHJldHVybiAhKHRoaXMuX19zcGVlZCA9PT0gMCk7XG4gIH1cblxuICBzZXQoZW5naW5lID0gbnVsbCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIGNvbnN0IHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCAhPT0gbnVsbCAmJiB0aGlzLl9fcGxheUNvbnRyb2xsZWQuX19lbmdpbmUgIT09IGVuZ2luZSkge1xuXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcmVzZXRFbmdpbmUoKTtcblxuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkID09PSBudWxsICYmIGVuZ2luZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKVxuICAgICAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwbGF5IGNvbnRyb2wgbG9vcCBiZWhhdmlvci5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBuYW1lIGxvb3BcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGxvb3AoZW5hYmxlKSB7XG4gICAgaWYgKGVuYWJsZSAmJiB0aGlzLl9fbG9vcFN0YXJ0ID4gLUluZmluaXR5ICYmIHRoaXMuX19sb29wRW5kIDwgSW5maW5pdHkpIHtcbiAgICAgIGlmICghdGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG5ldyBMb29wQ29udHJvbCh0aGlzKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkdWxlci5hZGQodGhpcy5fX2xvb3BDb250cm9sLCBJbmZpbml0eSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBNYXRoLm1pbih0aGlzLl9fbG9vcFN0YXJ0LCB0aGlzLl9fbG9vcEVuZCk7XG4gICAgICAgIGNvbnN0IHVwcGVyID0gTWF0aC5tYXgodGhpcy5fX2xvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9fc3BlZWQgPiAwICYmIHBvc2l0aW9uID4gdXBwZXIpXG4gICAgICAgICAgdGhpcy5zZWVrKHVwcGVyKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fX3NwZWVkIDwgMCAmJiBwb3NpdGlvbiA8IGxvd2VyKVxuICAgICAgICAgIHRoaXMuc2Vlayhsb3dlcik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGxvb3Agc3RhcnQgYW5kIGVuZCB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbG9vcFN0YXJ0IC0gbG9vcCBzdGFydCB2YWx1ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxvb3BFbmQgLSBsb29wIGVuZCB2YWx1ZS5cbiAgICovXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbG9vcCBzdGFydCB2YWx1ZVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBsb29wU3RhcnRcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGxvb3AgZW5kIHZhbHVlXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGxvb3BFbmRcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGxvb3BFbmQobG9vcEVuZCkge1xuICAgIHRoaXMuc2V0TG9vcEJvdW5kYXJpZXModGhpcy5fX2xvb3BTdGFydCwgbG9vcEVuZCk7XG4gIH1cblxuICBnZXQgbG9vcEVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BFbmQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UpXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWsgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmICgoc2VlayB8fCBsYXN0U3BlZWQgPT09IDApICYmIHRoaXMuX19sb29wQ29udHJvbClcbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9fbG9vcENvbnRyb2wuYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKTtcblxuICAgICAgaWYgKHRoaXMuX19sb29wQ29udHJvbClcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sLnJlc2NoZWR1bGUoc3BlZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgcGxheWJhY2tcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgdGhpcy5fX3BsYXlpbmdTcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHBsYXliYWNrIGFuZCBzdGF5cyBhdCB0aGUgc2FtZSBwb3NpdGlvbi5cbiAgICovXG4gIHBhdXNlKCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgcGxheWJhY2sgYW5kIHNlZWtzIHRvIGluaXRpYWwgKDApIHBvc2l0aW9uLlxuICAgKi9cbiAgc3RvcCgpIHtcbiAgICBjb25zdCB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCAwLCAwLCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBzcGVlZCBpZiBwcm92aWRlZCwgc2V0cyB0aGUgcGxheWJhY2sgc3BlZWQuIFRoZSBzcGVlZCB2YWx1ZSBzaG91bGRcbiAgICogYmUgbm9uLXplcm8gYmV0d2VlbiAtMTYgYW5kIC0xLzE2IG9yIGJldHdlZW4gMS8xNiBhbmQgMTYuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHNwZWVkXG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBzcGVlZChzcGVlZCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAoIXRoaXMubWFzdGVyICYmIHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZ2V0IHNwZWVkKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheWluZ1NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCAoanVtcCB0bykgcGxheWluZyBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlDb250cm9sO1xuIl19