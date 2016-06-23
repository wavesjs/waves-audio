'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _priorityQueue = require('../utils/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _schedulingQueue = require('../utils/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _factories = require('./factories');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addDuplet(firstArray, secondArray, firstElement, secondElement) {
  firstArray.push(firstElement);
  secondArray.push(secondElement);
}

function removeDuplet(firstArray, secondArray, firstElement) {
  var index = firstArray.indexOf(firstElement);

  if (index >= 0) {
    var secondElement = secondArray[index];

    firstArray.splice(index, 1);
    secondArray.splice(index, 1);

    return secondElement;
  }

  return null;
}

// The Transported call is the base class of the adapters between
// different types of engines (i.e. transported, scheduled, play-controlled)
// The adapters are at the same time masters for the engines added to the transport
// and transported TimeEngines inserted into the transport's position-based pritority queue.

var Transported = function (_TimeEngine) {
  (0, _inherits3.default)(Transported, _TimeEngine);

  function Transported(transport, engine, start, duration, offset) {
    var stretch = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];
    (0, _classCallCheck3.default)(this, Transported);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Transported).call(this));

    _this.master = transport;

    _this.__engine = engine;
    engine.master = _this;

    _this.__startPosition = start;
    _this.__endPosition = !isFinite(duration) ? Infinity : start + duration;
    _this.__offsetPosition = start + offset;
    _this.__stretchPosition = stretch;
    _this.__isRunning = false;
    return _this;
  }

  (0, _createClass3.default)(Transported, [{
    key: 'setBoundaries',
    value: function setBoundaries(start, duration) {
      var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
      var stretch = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

      this.__startPosition = start;
      this.__endPosition = start + duration;
      this.__offsetPosition = start + offset;
      this.__stretchPosition = stretch;
      this.resetPosition();
    }
  }, {
    key: 'start',
    value: function start(time, position, speed) {}
  }, {
    key: 'stop',
    value: function stop(time, position) {}
  }, {
    key: 'resetPosition',
    value: function resetPosition(position) {
      if (position !== undefined) position += this.__offsetPosition;

      this.master.resetEnginePosition(this, position);
    }
  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (speed > 0) {
        if (position < this.__startPosition) {

          if (this.__isRunning) this.stop(time, position - this.__offsetPosition);

          this.__isRunning = false;
          return this.__startPosition;
        } else if (position < this.__endPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__isRunning = true;
          return this.__endPosition;
        }
      } else {
        if (position > this.__endPosition) {
          if (this.__isRunning) // if engine is running
            this.stop(time, position - this.__offsetPosition);

          this.__isRunning = false;
          return this.__endPosition;
        } else if (position > this.__startPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__isRunning = true;
          return this.__startPosition;
        }
      }

      if (this.__isRunning) // if engine is running
        this.stop(time, position);

      this.__isRunning = false;
      return Infinity * speed;
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      if (!this.__isRunning) {
        this.start(time, position - this.__offsetPosition, speed);
        this.__isRunning = true;

        if (speed > 0) return this.__endPosition;

        return this.__startPosition;
      }

      // stop engine
      this.stop(time, position - this.__offsetPosition);

      this.__isRunning = false;
      return Infinity * speed;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (speed === 0) // stop
        this.stop(time, position - this.__offsetPosition);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.master = null;

      this.__engine.master = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.master.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.master.currentPosition - this.__offsetPosition;
    }
  }]);
  return Transported;
}(_timeEngine2.default);

// TransportedTransported
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position


var TransportedTransported = function (_Transported) {
  (0, _inherits3.default)(TransportedTransported, _Transported);

  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedTransported);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportedTransported).call(this, transport, engine, startPosition, endPosition, offsetPosition));
  }

  (0, _createClass3.default)(TransportedTransported, [{
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (speed > 0 && position < this.__endPosition) position = Math.max(position, this.__startPosition);else if (speed < 0 && position >= this.__startPosition) position = Math.min(position, this.__endPosition);

      return this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

      if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition) return position;

      return Infinity * speed;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(engine) {
      var position = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      if (position !== undefined) position += this.__offsetPosition;

      this.resetPosition(position);
    }
  }]);
  return TransportedTransported;
}(Transported);

// TransportedSpeedControlled
// has to start and stop the speed-controlled engines when the transport hits the engine's start and end position


var TransportedSpeedControlled = function (_Transported2) {
  (0, _inherits3.default)(TransportedSpeedControlled, _Transported2);

  function TransportedSpeedControlled(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedSpeedControlled);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportedSpeedControlled).call(this, transport, engine, startPosition, endPosition, offsetPosition));
  }

  (0, _createClass3.default)(TransportedSpeedControlled, [{
    key: 'start',
    value: function start(time, position, speed) {
      this.__engine.syncSpeed(time, position, speed, true);
    }
  }, {
    key: 'stop',
    value: function stop(time, position) {
      this.__engine.syncSpeed(time, position, 0);
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (this.__isRunning) this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__engine.syncSpeed(this.master.currentTime, this.master.currentPosition - this.__offsetPosition, 0);
      (0, _get3.default)((0, _getPrototypeOf2.default)(TransportedSpeedControlled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedSpeedControlled;
}(Transported);

// TransportedScheduled
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position


var TransportedScheduled = function (_Transported3) {
  (0, _inherits3.default)(TransportedScheduled, _Transported3);

  function TransportedScheduled(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedScheduled);


    // scheduling queue becomes master of engine

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportedScheduled).call(this, transport, engine, startPosition, endPosition, offsetPosition));

    engine.master = null;
    transport.__schedulingQueue.add(engine, Infinity);
    return _this4;
  }

  (0, _createClass3.default)(TransportedScheduled, [{
    key: 'start',
    value: function start(time, position, speed) {
      this.master.__schedulingQueue.resetEngineTime(this.__engine, time);
    }
  }, {
    key: 'stop',
    value: function stop(time, position) {
      this.master.__schedulingQueue.resetEngineTime(this.__engine, Infinity);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.master.__schedulingQueue.remove(this.__engine);
      (0, _get3.default)((0, _getPrototypeOf2.default)(TransportedScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedScheduled;
}(Transported);

// translates advancePosition of *transported* engines into global scheduler times


var TransportSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(TransportSchedulerHook, _TimeEngine2);

  function TransportSchedulerHook(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportSchedulerHook).call(this));

    _this5.__transport = transport;

    _this5.__nextPosition = Infinity;
    _this5.__nextTime = Infinity;
    transport.__scheduler.add(_this5, Infinity);
    return _this5;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(TransportSchedulerHook, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var transport = this.__transport;
      var position = this.__nextPosition;
      var speed = transport.__speed;
      var nextPosition = transport.advancePosition(time, position, speed);
      var nextTime = transport.__getTimeAtPosition(nextPosition);

      this.__nextPosition = nextPosition;
      this.__nextTime = nextTime;

      return nextTime;
    }
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length <= 0 || arguments[0] === undefined ? this.__nextPosition : arguments[0];

      var transport = this.__transport;
      var time = transport.__getTimeAtPosition(position);

      this.__nextPosition = position;
      this.__nextTime = time;

      this.resetTime(time);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__transport.__scheduler.remove(this);
      this.__transport = null;
    }
  }]);
  return TransportSchedulerHook;
}(_timeEngine2.default);

// internal scheduling queue that returns the current position (and time) of the play control


var TransportSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(TransportSchedulingQueue, _SchedulingQueue);

  function TransportSchedulingQueue(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportSchedulingQueue).call(this));

    _this6.__transport = transport;
    transport.__scheduler.add(_this6, Infinity);
    return _this6;
  }

  (0, _createClass3.default)(TransportSchedulingQueue, [{
    key: 'destroy',
    value: function destroy() {
      this.__transport.__scheduler.remove(this);
      this.__transport = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__transport.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__transport.currentPosition;
    }
  }]);
  return TransportSchedulingQueue;
}(_schedulingQueue2.default);

/**
 * Transport class
 */


var Transport = function (_TimeEngine3) {
  (0, _inherits3.default)(Transport, _TimeEngine3);

  function Transport() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Transport);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Transport).call(this));

    _this7.audioContext = options.audioContext || _audioContext2.default;

    _this7.__engines = [];
    _this7.__transported = [];

    _this7.__scheduler = (0, _factories.getScheduler)(_this7.audioContext);
    _this7.__schedulerHook = new TransportSchedulerHook(_this7);
    _this7.__transportedQueue = new _priorityQueue2.default();
    _this7.__schedulingQueue = new TransportSchedulingQueue(_this7);

    // syncronized time, position, and speed
    _this7.__time = 0;
    _this7.__position = 0;
    _this7.__speed = 0;
    return _this7;
  }

  (0, _createClass3.default)(Transport, [{
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      return this.__time + (position - this.__position) / this.__speed;
    }
  }, {
    key: '__getPositionAtTime',
    value: function __getPositionAtTime(time) {
      return this.__position + (time - this.__time) * this.__speed;
    }
  }, {
    key: '__syncTransportedPosition',
    value: function __syncTransportedPosition(time, position, speed) {
      var numTransportedEngines = this.__transported.length;
      var nextPosition = Infinity * speed;

      if (numTransportedEngines > 0) {
        this.__transportedQueue.clear();
        this.__transportedQueue.reverse = speed < 0;

        for (var i = 0; i < numTransportedEngines; i++) {
          var engine = this.__transported[i];
          var nextEnginePosition = engine.syncPosition(time, position, speed);
          this.__transportedQueue.insert(engine, nextEnginePosition);
        }

        nextPosition = this.__transportedQueue.time;
      }

      return nextPosition;
    }
  }, {
    key: '__syncTransportedSpeed',
    value: function __syncTransportedSpeed(time, position, speed) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.__transported), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var transported = _step.value;

          transported.syncSpeed(time, position, speed);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Get current master time
     * @return {Number} current time
     *
     * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
     */

  }, {
    key: 'resetPosition',


    /**
     * Reset next transport position
     * @param {Number} next transport position
     */
    value: function resetPosition(position) {
      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this, position);else this.__schedulerHook.resetPosition(position);
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      return this.__syncTransportedPosition(time, position, speed);
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var engine = this.__transportedQueue.head;
      var nextEnginePosition = engine.advancePosition(time, position, speed);
      return this.__transportedQueue.move(engine, nextEnginePosition);
    }

    // TimeEngine method (speed-controlled interface)

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      var lastSpeed = this.__speed;

      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      if (speed !== lastSpeed || seek && speed !== 0) {
        var nextPosition = void 0;

        // resync transported engines
        if (seek || speed * lastSpeed < 0) {
          // seek or reverse direction
          nextPosition = this.__syncTransportedPosition(time, position, speed);
        } else if (lastSpeed === 0) {
          // start
          nextPosition = this.__syncTransportedPosition(time, position, speed);
        } else if (speed === 0) {
          // stop
          nextPosition = Infinity;
          this.__syncTransportedSpeed(time, position, 0);
        } else {
          // change speed without reversing direction
          this.__syncTransportedSpeed(time, position, speed);
        }

        this.resetPosition(nextPosition);
      }
    }

    /**
     * Add a time engine to the transport
     * @param {Object} engine engine to be added to the transport
     * @param {Number} position start position
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var startPosition = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
      var endPosition = arguments.length <= 2 || arguments[2] === undefined ? Infinity : arguments[2];
      var offsetPosition = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

      var transported = null;

      if (offsetPosition === -Infinity) offsetPosition = 0;

      if (engine.master) throw new Error("object has already been added to a master");

      if (_timeEngine2.default.implementsTransported(engine)) transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);else if (_timeEngine2.default.implementsSpeedControlled(engine)) transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);else if (_timeEngine2.default.implementsScheduled(engine)) transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);else throw new Error("object cannot be added to a transport");

      if (transported) {
        var speed = this.__speed;

        addDuplet(this.__engines, this.__transported, engine, transported);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = transported.syncPosition(this.currentTime, this.currentPosition, speed);
          var nextPosition = this.__transportedQueue.insert(transported, nextEnginePosition);

          this.resetPosition(nextPosition);
        }
      }

      return transported;
    }

    /**
     * Remove a time engine from the transport
     * @param {object} engineOrTransported engine or transported to be removed from the transport
     */

  }, {
    key: 'remove',
    value: function remove(engineOrTransported) {
      var engine = engineOrTransported;
      var transported = removeDuplet(this.__engines, this.__transported, engineOrTransported);

      if (!transported) {
        engine = removeDuplet(this.__transported, this.__engines, engineOrTransported);
        transported = engineOrTransported;
      }

      if (engine && transported) {
        var nextPosition = this.__transportedQueue.remove(transported);

        transported.destroy();

        if (this.__speed !== 0) this.resetPosition(nextPosition);
      } else {
        throw new Error("object has not been added to this transport");
      }
    }
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(transported) {
      var position = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      var speed = this.__speed;

      if (speed !== 0) {
        if (position === undefined) position = transported.syncPosition(this.currentTime, this.currentPosition, speed);

        var nextPosition = this.__transportedQueue.move(transported, position);
        this.resetPosition(nextPosition);
      }
    }

    /**
     * Remove all time engines from the transport
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.syncSpeed(this.currentTime, this.currentPosition, 0);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this.__transported), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var transported = _step2.value;

          transported.destroy();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
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
     * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }
  }]);
  return Transport;
}(_timeEngine2.default);

exports.default = Transport;
//# sourceMappingURL=data:application/json;base64,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QSxZQUFNLGVBQWUsS0FBSyxrQkFBTCxDQUF3QixJQUF4QixDQUE2QixXQUE3QixFQUEwQyxRQUExQyxDQUFmLENBSlM7QUFLZixhQUFLLGFBQUwsQ0FBbUIsWUFBbkIsRUFMZTtPQUFqQjs7Ozs7Ozs7OzRCQVlNO0FBQ04sV0FBSyxTQUFMLENBQWUsS0FBSyxXQUFMLEVBQWtCLEtBQUssZUFBTCxFQUFzQixDQUF2RCxFQURNOzs7Ozs7O0FBR04seURBQXdCLEtBQUssYUFBTCxTQUF4QjtjQUFTOztBQUNQLHNCQUFZLE9BQVo7U0FERjs7Ozs7Ozs7Ozs7Ozs7T0FITTs7Ozt3QkEvSlU7QUFDaEIsYUFBTyxLQUFLLFdBQUwsQ0FBaUIsV0FBakIsQ0FEUzs7Ozs7Ozs7Ozs7O3dCQVVJO0FBQ3BCLFVBQU0sU0FBUyxLQUFLLE1BQUwsQ0FESzs7QUFHcEIsVUFBSSxVQUFVLE9BQU8sZUFBUCxLQUEyQixTQUEzQixFQUNaLE9BQU8sT0FBTyxlQUFQLENBRFQ7O0FBR0EsYUFBTyxLQUFLLFVBQUwsR0FBa0IsQ0FBQyxLQUFLLFdBQUwsQ0FBaUIsV0FBakIsR0FBK0IsS0FBSyxNQUFMLENBQWhDLEdBQStDLEtBQUssT0FBTCxDQU5wRDs7O1NBckVIIiwiZmlsZSI6InRyYW5zcG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZSc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cblxuZnVuY3Rpb24gYWRkRHVwbGV0KGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBmaXJzdEVsZW1lbnQsIHNlY29uZEVsZW1lbnQpIHtcbiAgZmlyc3RBcnJheS5wdXNoKGZpcnN0RWxlbWVudCk7XG4gIHNlY29uZEFycmF5LnB1c2goc2Vjb25kRWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUR1cGxldChmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZmlyc3RFbGVtZW50KSB7XG4gIGNvbnN0IGluZGV4ID0gZmlyc3RBcnJheS5pbmRleE9mKGZpcnN0RWxlbWVudCk7XG5cbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICBjb25zdCBzZWNvbmRFbGVtZW50ID0gc2Vjb25kQXJyYXlbaW5kZXhdO1xuXG4gICAgZmlyc3RBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHNlY29uZEFycmF5LnNwbGljZShpbmRleCwgMSk7XG5cbiAgICByZXR1cm4gc2Vjb25kRWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBUaGUgVHJhbnNwb3J0ZWQgY2FsbCBpcyB0aGUgYmFzZSBjbGFzcyBvZiB0aGUgYWRhcHRlcnMgYmV0d2VlblxuLy8gZGlmZmVyZW50IHR5cGVzIG9mIGVuZ2luZXMgKGkuZS4gdHJhbnNwb3J0ZWQsIHNjaGVkdWxlZCwgcGxheS1jb250cm9sbGVkKVxuLy8gVGhlIGFkYXB0ZXJzIGFyZSBhdCB0aGUgc2FtZSB0aW1lIG1hc3RlcnMgZm9yIHRoZSBlbmdpbmVzIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRcbi8vIGFuZCB0cmFuc3BvcnRlZCBUaW1lRW5naW5lcyBpbnNlcnRlZCBpbnRvIHRoZSB0cmFuc3BvcnQncyBwb3NpdGlvbi1iYXNlZCBwcml0b3JpdHkgcXVldWUuXG5jbGFzcyBUcmFuc3BvcnRlZCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnQsIGR1cmF0aW9uLCBvZmZzZXQsIHN0cmV0Y2ggPSAxKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm1hc3RlciA9IHRyYW5zcG9ydDtcblxuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG5cbiAgICB0aGlzLl9fc3RhcnRQb3NpdGlvbiA9IHN0YXJ0O1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9ICFpc0Zpbml0ZShkdXJhdGlvbikgPyBJbmZpbml0eSA6IHN0YXJ0ICsgZHVyYXRpb247XG4gICAgdGhpcy5fX29mZnNldFBvc2l0aW9uID0gc3RhcnQgKyBvZmZzZXQ7XG4gICAgdGhpcy5fX3N0cmV0Y2hQb3NpdGlvbiA9IHN0cmV0Y2g7XG4gICAgdGhpcy5fX2lzUnVubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgc2V0Qm91bmRhcmllcyhzdGFydCwgZHVyYXRpb24sIG9mZnNldCA9IDAsIHN0cmV0Y2ggPSAxKSB7XG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydDtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSBzdGFydCArIGR1cmF0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IHN0YXJ0ICsgb2Zmc2V0O1xuICAgIHRoaXMuX19zdHJldGNoUG9zaXRpb24gPSBzdHJldGNoO1xuICAgIHRoaXMucmVzZXRQb3NpdGlvbigpO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7fVxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7fVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPCB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuXG4gICAgICAgIGlmICh0aGlzLl9faXNSdW5uaW5nKVxuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2lzUnVubmluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgICB0aGlzLl9faXNSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBvc2l0aW9uID4gdGhpcy5fX2VuZFBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLl9faXNSdW5uaW5nKSAvLyBpZiBlbmdpbmUgaXMgcnVubmluZ1xuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2lzUnVubmluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA+IHRoaXMuX19zdGFydFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgICB0aGlzLl9faXNSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9faXNSdW5uaW5nKSAvLyBpZiBlbmdpbmUgaXMgcnVubmluZ1xuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gSW5maW5pdHkgKiBzcGVlZDtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoIXRoaXMuX19pc1J1bm5pbmcpIHtcbiAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSB0cnVlO1xuXG4gICAgICBpZiAoc3BlZWQgPiAwKVxuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuXG4gICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgfVxuXG4gICAgLy8gc3RvcCBlbmdpbmVcbiAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX2lzUnVubmluZyA9IGZhbHNlO1xuICAgIHJldHVybiBJbmZpbml0eSAqIHNwZWVkO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA9PT0gMCkgLy8gc3RvcFxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5tYXN0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fX2VuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1heChwb3NpdGlvbiwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5taW4ocG9zaXRpb24sIHRoaXMuX19lbmRQb3NpdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBwb3NpdGlvbiA9IHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uIHx8IHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcblxuICAgIHJldHVybiBJbmZpbml0eSAqIHNwZWVkO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZClcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHBvc2l0aW9uICs9IHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcblxuICAgIHRoaXMucmVzZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWRcbi8vIGhhcyB0byBzdGFydCBhbmQgc3RvcCB0aGUgc3BlZWQtY29udHJvbGxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCB0cnVlKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19pc1J1bm5pbmcpXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aGlzLm1hc3Rlci5jdXJyZW50VGltZSwgdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCAwKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU2NoZWR1bGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG5cbiAgICAvLyBzY2hlZHVsaW5nIHF1ZXVlIGJlY29tZXMgbWFzdGVyIG9mIGVuZ2luZVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxpbmdRdWV1ZS5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgdGltZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVzZXRFbmdpbmVUaW1lKHRoaXMuX19lbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVtb3ZlKHRoaXMuX19lbmdpbmUpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyB0cmFuc2xhdGVzIGFkdmFuY2VQb3NpdGlvbiBvZiAqdHJhbnNwb3J0ZWQqIGVuZ2luZXMgaW50byBnbG9iYWwgc2NoZWR1bGVyIHRpbWVzXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHRoaXMuX19uZXh0VGltZSA9IEluZmluaXR5O1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICBjb25zdCB0cmFuc3BvcnQgPSB0aGlzLl9fdHJhbnNwb3J0O1xuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcbiAgICBjb25zdCBzcGVlZCA9IHRyYW5zcG9ydC5fX3NwZWVkO1xuICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IHRyYW5zcG9ydC5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICBjb25zdCBuZXh0VGltZSA9IHRyYW5zcG9ydC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IG5leHRUaW1lO1xuXG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICBjb25zdCB0cmFuc3BvcnQgPSB0aGlzLl9fdHJhbnNwb3J0O1xuICAgIGNvbnN0IHRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbik7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcblxuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vLyBpbnRlcm5hbCBzY2hlZHVsaW5nIHF1ZXVlIHRoYXQgcmV0dXJucyB0aGUgY3VycmVudCBwb3NpdGlvbiAoYW5kIHRpbWUpIG9mIHRoZSBwbGF5IGNvbnRyb2xcbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX190cmFuc3BvcnQuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnQgPSBudWxsO1xuICB9XG59XG5cbi8qKlxuICogVHJhbnNwb3J0IGNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zcG9ydCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ZWQgPSBbXTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIodGhpcy5hdWRpb0NvbnRleHQpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxlckhvb2sodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUgPSBuZXcgVHJhbnNwb3J0U2NoZWR1bGluZ1F1ZXVlKHRoaXMpO1xuXG4gICAgLy8gc3luY3Jvbml6ZWQgdGltZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG4gIH1cblxuICBfX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX190aW1lICsgKHBvc2l0aW9uIC0gdGhpcy5fX3Bvc2l0aW9uKSAvIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgY29uc3QgbnVtVHJhbnNwb3J0ZWRFbmdpbmVzID0gdGhpcy5fX3RyYW5zcG9ydGVkLmxlbmd0aDtcbiAgICBsZXQgbmV4dFBvc2l0aW9uID0gSW5maW5pdHkgKiBzcGVlZDtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5jbGVhcigpO1xuICAgICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUucmV2ZXJzZSA9IChzcGVlZCA8IDApO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVRyYW5zcG9ydGVkRW5naW5lczsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgICAgfVxuXG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS50aW1lO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGZvciAobGV0IHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBuZXh0IHRyYW5zcG9ydCBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICByZXR1cm4gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgY29uc3QgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUuaGVhZDtcbiAgICBjb25zdCBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICBjb25zdCBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIGxldCBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0YXJ0XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdG9wXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hhbmdlIHNwZWVkIHdpdGhvdXQgcmV2ZXJzaW5nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVuZ2luZSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gc3RhcnQgcG9zaXRpb25cbiAgICovXG4gIGFkZChlbmdpbmUsIHN0YXJ0UG9zaXRpb24gPSAwLCBlbmRQb3NpdGlvbiA9IEluZmluaXR5LCBvZmZzZXRQb3NpdGlvbiA9IDApIHtcbiAgICBsZXQgdHJhbnNwb3J0ZWQgPSBudWxsO1xuXG4gICAgaWYgKG9mZnNldFBvc2l0aW9uID09PSAtSW5maW5pdHkpXG4gICAgICBvZmZzZXRQb3NpdGlvbiA9IDA7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU2NoZWR1bGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIGEgdHJhbnNwb3J0XCIpO1xuXG4gICAgaWYgKHRyYW5zcG9ydGVkKSB7XG4gICAgICBjb25zdCBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgICAgYWRkRHVwbGV0KHRoaXMuX19lbmdpbmVzLCB0aGlzLl9fdHJhbnNwb3J0ZWQsIGVuZ2luZSwgdHJhbnNwb3J0ZWQpO1xuXG4gICAgICBpZiAoc3BlZWQgIT09IDApIHtcbiAgICAgICAgLy8gc3luYyBhbmQgc3RhcnRcbiAgICAgICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydCh0cmFuc3BvcnRlZCwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBlbmdpbmVPclRyYW5zcG9ydGVkIGVuZ2luZSBvciB0cmFuc3BvcnRlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZU9yVHJhbnNwb3J0ZWQpIHtcbiAgICBsZXQgZW5naW5lID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICBsZXQgdHJhbnNwb3J0ZWQgPSByZW1vdmVEdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG5cbiAgICBpZiAoIXRyYW5zcG9ydGVkKSB7XG4gICAgICBlbmdpbmUgPSByZW1vdmVEdXBsZXQodGhpcy5fX3RyYW5zcG9ydGVkLCB0aGlzLl9fZW5naW5lcywgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG4gICAgICB0cmFuc3BvcnRlZCA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZSAmJiB0cmFuc3BvcnRlZCkge1xuICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUucmVtb3ZlKHRyYW5zcG9ydGVkKTtcblxuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHRyYW5zcG9ydFwiKTtcbiAgICB9XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKHRyYW5zcG9ydGVkLCBwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZClcbiAgICAgICAgcG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUubW92ZSh0cmFuc3BvcnRlZCwgcG9zaXRpb24pO1xuICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGltZSBlbmdpbmVzIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zeW5jU3BlZWQodGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIDApO1xuXG4gICAgZm9yIChsZXQgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=