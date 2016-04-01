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
    _this.__haltPosition = Infinity; // engine's next halt position when not running (is null when engine hes been started)
    // console.log(this.__startPosition, this.__endPosition, this.__offsetPosition, this.__stretchPosition)
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

          if (this.__haltPosition === null) this.stop(time, position - this.__offsetPosition);

          this.__haltPosition = this.__endPosition;

          return this.__startPosition;
        } else if (position <= this.__endPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__haltPosition = null; // engine is active

          return this.__endPosition;
        }
      } else {
        if (position >= this.__endPosition) {
          if (this.__haltPosition === null) this.stop(time, position - this.__offsetPosition);

          this.__haltPosition = this.__startPosition;

          return this.__endPosition;
        } else if (position > this.__startPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__haltPosition = null; // engine is active

          return this.__startPosition;
        }
      }

      if (this.__haltPosition === null) this.stop(time, position);

      this.__haltPosition = Infinity;

      return Infinity;
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var haltPosition = this.__haltPosition;

      if (haltPosition !== null) {
        this.start(time, position - this.__offsetPosition, speed);

        this.__haltPosition = null;

        return haltPosition;
      }

      // stop engine
      if (this.__haltPosition === null) this.stop(time, position - this.__offsetPosition);

      this.__haltPosition = Infinity;

      return Infinity;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (speed === 0) this.stop(time, position - this.__offsetPosition);
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

      return Infinity;
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
      if (this.__haltPosition === null) // engine is active
        this.__engine.syncSpeed(time, position, speed);
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

      while (nextTime <= time) {
        nextPosition = transport.advancePosition(nextTime, nextPosition, speed);
        nextTime = transport.__getTimeAtPosition(nextPosition);
      }

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
      var nextPosition = Infinity;

      if (numTransportedEngines > 0) {
        var engine, nextEnginePosition;

        this.__transportedQueue.clear();
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
      // console.log(time, position, speed);
      var nextPosition = this.__transportedQueue.time;

      while (nextPosition === position) {
        var engine = this.__transportedQueue.head;
        var nextEnginePosition = engine.advancePosition(time, position, speed);

        if ((speed > 0 && nextEnginePosition > position || speed < 0 && nextEnginePosition < position) && nextEnginePosition < Infinity && nextEnginePosition > -Infinity) {
          nextPosition = this.__transportedQueue.move(engine, nextEnginePosition);
        } else {
          nextPosition = this.__transportedQueue.remove(engine);
        }
      }

      return nextPosition;
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
        var nextPosition;

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
//# sourceMappingURL=data:application/json;base64,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eURBQXdCLEtBQUssYUFBTCxTQUF4QjtjQUFTOztBQUNQLHNCQUFZLE9BQVo7U0FERjs7Ozs7Ozs7Ozs7Ozs7T0FITTs7Ozt3QkE1S1U7QUFDaEIsYUFBTyxLQUFLLFdBQUwsQ0FBaUIsV0FBakIsQ0FEUzs7Ozs7Ozs7Ozs7O3dCQVVJO0FBQ3BCLFVBQUksU0FBUyxLQUFLLE1BQUwsQ0FETzs7QUFHcEIsVUFBSSxVQUFVLE9BQU8sZUFBUCxLQUEyQixTQUEzQixFQUNaLE9BQU8sT0FBTyxlQUFQLENBRFQ7O0FBR0EsYUFBTyxLQUFLLFVBQUwsR0FBa0IsQ0FBQyxLQUFLLFdBQUwsQ0FBaUIsV0FBakIsR0FBK0IsS0FBSyxNQUFMLENBQWhDLEdBQStDLEtBQUssT0FBTCxDQU5wRDs7O1NBekVIIiwiZmlsZSI6InRyYW5zcG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZSc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cblxuZnVuY3Rpb24gYWRkRHVwbGV0KGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBmaXJzdEVsZW1lbnQsIHNlY29uZEVsZW1lbnQpIHtcbiAgZmlyc3RBcnJheS5wdXNoKGZpcnN0RWxlbWVudCk7XG4gIHNlY29uZEFycmF5LnB1c2goc2Vjb25kRWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUR1cGxldChmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZmlyc3RFbGVtZW50KSB7XG4gIHZhciBpbmRleCA9IGZpcnN0QXJyYXkuaW5kZXhPZihmaXJzdEVsZW1lbnQpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgdmFyIHNlY29uZEVsZW1lbnQgPSBzZWNvbmRBcnJheVtpbmRleF07XG5cbiAgICBmaXJzdEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgc2Vjb25kQXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHJldHVybiBzZWNvbmRFbGVtZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFRoZSBUcmFuc3BvcnRlZCBjYWxsIGlzIHRoZSBiYXNlIGNsYXNzIG9mIHRoZSBhZGFwdGVycyBiZXR3ZWVuXG4vLyBkaWZmZXJlbnQgdHlwZXMgb2YgZW5naW5lcyAoaS5lLiB0cmFuc3BvcnRlZCwgc2NoZWR1bGVkLCBwbGF5LWNvbnRyb2xsZWQpXG4vLyBUaGUgYWRhcHRlcnMgYXJlIGF0IHRoZSBzYW1lIHRpbWUgbWFzdGVycyBmb3IgdGhlIGVuZ2luZXMgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuLy8gYW5kIHRyYW5zcG9ydGVkIFRpbWVFbmdpbmVzIGluc2VydGVkIGludG8gdGhlIHRyYW5zcG9ydCdzIHBvc2l0aW9uLWJhc2VkIHByaXRvcml0eSBxdWV1ZS5cbmNsYXNzIFRyYW5zcG9ydGVkIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydCwgZHVyYXRpb24sIG9mZnNldCwgc3RyZXRjaCA9IDEpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWFzdGVyID0gdHJhbnNwb3J0O1xuXG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcblxuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnQ7XG4gICAgdGhpcy5fX2VuZFBvc2l0aW9uID0gIWlzRmluaXRlKGR1cmF0aW9uKSA/IEluZmluaXR5IDogc3RhcnQgKyBkdXJhdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBzdGFydCArIG9mZnNldDtcbiAgICB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uID0gc3RyZXRjaDtcbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7IC8vIGVuZ2luZSdzIG5leHQgaGFsdCBwb3NpdGlvbiB3aGVuIG5vdCBydW5uaW5nIChpcyBudWxsIHdoZW4gZW5naW5lIGhlcyBiZWVuIHN0YXJ0ZWQpXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5fX3N0YXJ0UG9zaXRpb24sIHRoaXMuX19lbmRQb3NpdGlvbiwgdGhpcy5fX29mZnNldFBvc2l0aW9uLCB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uKVxuICB9XG5cbiAgc2V0Qm91bmRhcmllcyhzdGFydCwgZHVyYXRpb24sIG9mZnNldCA9IDAsIHN0cmV0Y2ggPSAxKSB7XG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydDtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSBzdGFydCArIGR1cmF0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IHN0YXJ0ICsgb2Zmc2V0O1xuICAgIHRoaXMuX19zdHJldGNoUG9zaXRpb24gPSBzdHJldGNoO1xuICAgIHRoaXMucmVzZXRQb3NpdGlvbigpO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7fVxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7fVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPCB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuXG4gICAgICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IHRoaXMuX19lbmRQb3NpdGlvbjtcblxuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uIDw9IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7IC8vIGVuZ2luZSBpcyBhY3RpdmVcblxuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zaXRpb24gPj0gdGhpcy5fX2VuZFBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IHRoaXMuX19zdGFydFBvc2l0aW9uO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID4gdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBudWxsOyAvLyBlbmdpbmUgaXMgYWN0aXZlXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaGFsdFBvc2l0aW9uID0gdGhpcy5fX2hhbHRQb3NpdGlvbjtcblxuICAgIGlmIChoYWx0UG9zaXRpb24gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7XG5cbiAgICAgIHJldHVybiBoYWx0UG9zaXRpb247XG4gICAgfVxuXG4gICAgLy8gc3RvcCBlbmdpbmVcbiAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID09PSAwKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5tYXN0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fX2VuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1heChwb3NpdGlvbiwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5taW4ocG9zaXRpb24sIHRoaXMuX19lbmRQb3NpdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBwb3NpdGlvbiA9IHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uIHx8IHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkXG4vLyBoYXMgdG8gc3RhcnQgYW5kIHN0b3AgdGhlIHNwZWVkLWNvbnRyb2xsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgdHJ1ZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKSAvLyBlbmdpbmUgaXMgYWN0aXZlXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aGlzLm1hc3Rlci5jdXJyZW50VGltZSwgdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCAwKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU2NoZWR1bGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG5cbiAgICAvLyBzY2hlZHVsaW5nIHF1ZXVlIGJlY29tZXMgbWFzdGVyIG9mIGVuZ2luZVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxpbmdRdWV1ZS5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgdGltZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVzZXRFbmdpbmVUaW1lKHRoaXMuX19lbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVtb3ZlKHRoaXMuX19lbmdpbmUpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyB0cmFuc2xhdGVzIGFkdmFuY2VQb3NpdGlvbiBvZiAqdHJhbnNwb3J0ZWQqIGVuZ2luZXMgaW50byBnbG9iYWwgc2NoZWR1bGVyIHRpbWVzXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHRoaXMuX19uZXh0VGltZSA9IEluZmluaXR5O1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIHZhciBzcGVlZCA9IHRyYW5zcG9ydC5fX3NwZWVkO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0cmFuc3BvcnQuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgdmFyIG5leHRUaW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHdoaWxlIChuZXh0VGltZSA8PSB0aW1lKSB7XG4gICAgICBuZXh0UG9zaXRpb24gPSB0cmFuc3BvcnQuYWR2YW5jZVBvc2l0aW9uKG5leHRUaW1lLCBuZXh0UG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIG5leHRUaW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IG5leHRUaW1lO1xuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgdmFyIHRyYW5zcG9ydCA9IHRoaXMuX190cmFuc3BvcnQ7XG4gICAgdmFyIHRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbik7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IG51bGw7XG4gIH1cbn1cblxuLy8gaW50ZXJuYWwgc2NoZWR1bGluZyBxdWV1ZSB0aGF0IHJldHVybnMgdGhlIGN1cnJlbnQgcG9zaXRpb24gKGFuZCB0aW1lKSBvZiB0aGUgcGxheSBjb250cm9sXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFRyYW5zcG9ydCBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc3BvcnQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgZGVmYXVsdEF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkID0gW107XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyKHRoaXMuYXVkaW9Db250ZXh0KTtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxpbmdRdWV1ZSh0aGlzKTtcblxuICAgIC8vIHN5bmNyb25pemVkIHRpbWUsIHBvc2l0aW9uLCBhbmQgc3BlZWRcbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuICB9XG5cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBudW1UcmFuc3BvcnRlZEVuZ2luZXMgPSB0aGlzLl9fdHJhbnNwb3J0ZWQubGVuZ3RoO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB2YXIgZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb247XG5cbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmNsZWFyKCk7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBudW1UcmFuc3BvcnRlZEVuZ2luZXMgLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24sIGZhbHNlKTsgLy8gaW5zZXJ0IGJ1dCBkb24ndCBzb3J0XG4gICAgICB9XG5cbiAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFswXTtcbiAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbiwgdHJ1ZSk7IC8vIGluc2VydCBhbmQgc29ydFxuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgdHJhbnNwb3J0IHBvc2l0aW9uXG4gICAqL1xuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcblxuICAgIHJldHVybiB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS50aW1lO1xuXG4gICAgd2hpbGUgKG5leHRQb3NpdGlvbiA9PT0gcG9zaXRpb24pIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5oZWFkO1xuICAgICAgdmFyIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgaWYgKCgoc3BlZWQgPiAwICYmIG5leHRFbmdpbmVQb3NpdGlvbiA+IHBvc2l0aW9uKSB8fCAoc3BlZWQgPCAwICYmIG5leHRFbmdpbmVQb3NpdGlvbiA8IHBvc2l0aW9uKSkgJiZcbiAgICAgICAgKG5leHRFbmdpbmVQb3NpdGlvbiA8IEluZmluaXR5ICYmIG5leHRFbmdpbmVQb3NpdGlvbiA+IC1JbmZpbml0eSkpIHtcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUoZW5naW5lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uO1xuXG4gICAgICAvLyByZXN5bmMgdHJhbnNwb3J0ZWQgZW5naW5lc1xuICAgICAgaWYgKHNlZWsgfHwgc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAgIC8vIHNlZWsgb3IgcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdGFydFxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoYW5nZSBzcGVlZCB3aXRob3V0IHJldmVyc2luZyBkaXJlY3Rpb25cbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgZW5naW5lIHRvIGJlIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHN0YXJ0IHBvc2l0aW9uXG4gICAqL1xuICBhZGQoZW5naW5lLCBzdGFydFBvc2l0aW9uID0gMCwgZW5kUG9zaXRpb24gPSBJbmZpbml0eSwgb2Zmc2V0UG9zaXRpb24gPSAwKSB7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gbnVsbDtcblxuICAgIGlmIChvZmZzZXRQb3NpdGlvbiA9PT0gLUluZmluaXR5KVxuICAgICAgb2Zmc2V0UG9zaXRpb24gPSAwO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZChlbmdpbmUpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKGVuZ2luZSkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBhIHRyYW5zcG9ydFwiKTtcblxuICAgIGlmICh0cmFuc3BvcnRlZCkge1xuICAgICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgICBhZGREdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lLCB0cmFuc3BvcnRlZCk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICB2YXIgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQodHJhbnNwb3J0ZWQsIG5leHRFbmdpbmVQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zcG9ydGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHRpbWUgZW5naW5lIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge29iamVjdH0gZW5naW5lT3JUcmFuc3BvcnRlZCBlbmdpbmUgb3IgdHJhbnNwb3J0ZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIHJlbW92ZShlbmdpbmVPclRyYW5zcG9ydGVkKSB7XG4gICAgdmFyIGVuZ2luZSA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gcmVtb3ZlRHVwbGV0KHRoaXMuX19lbmdpbmVzLCB0aGlzLl9fdHJhbnNwb3J0ZWQsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuXG4gICAgaWYgKCF0cmFuc3BvcnRlZCkge1xuICAgICAgZW5naW5lID0gcmVtb3ZlRHVwbGV0KHRoaXMuX190cmFuc3BvcnRlZCwgdGhpcy5fX2VuZ2luZXMsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuICAgICAgdHJhbnNwb3J0ZWQgPSBlbmdpbmVPclRyYW5zcG9ydGVkO1xuICAgIH1cblxuICAgIGlmIChlbmdpbmUgJiYgdHJhbnNwb3J0ZWQpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgdHJhbnNwb3J0XCIpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24odHJhbnNwb3J0ZWQsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZClcbiAgICAgICAgcG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUodHJhbnNwb3J0ZWQsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRpbWUgZW5naW5lcyBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuc3luY1NwZWVkKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCAwKTtcblxuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19