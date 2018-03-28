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

var _priorityQueue = require('../core/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _schedulingQueue = require('../core/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

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
    var stretch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    (0, _classCallCheck3.default)(this, Transported);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Transported.__proto__ || (0, _getPrototypeOf2.default)(Transported)).call(this));

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
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var stretch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

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
    return (0, _possibleConstructorReturn3.default)(this, (TransportedTransported.__proto__ || (0, _getPrototypeOf2.default)(TransportedTransported)).call(this, transport, engine, startPosition, endPosition, offsetPosition));
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
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

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
    return (0, _possibleConstructorReturn3.default)(this, (TransportedSpeedControlled.__proto__ || (0, _getPrototypeOf2.default)(TransportedSpeedControlled)).call(this, transport, engine, startPosition, endPosition, offsetPosition));
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
      (0, _get3.default)(TransportedSpeedControlled.prototype.__proto__ || (0, _getPrototypeOf2.default)(TransportedSpeedControlled.prototype), 'destroy', this).call(this);
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
    var _this4 = (0, _possibleConstructorReturn3.default)(this, (TransportedScheduled.__proto__ || (0, _getPrototypeOf2.default)(TransportedScheduled)).call(this, transport, engine, startPosition, endPosition, offsetPosition));

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
      (0, _get3.default)(TransportedScheduled.prototype.__proto__ || (0, _getPrototypeOf2.default)(TransportedScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedScheduled;
}(Transported);

// translates advancePosition of *transported* engines into global scheduler times


var TransportSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(TransportSchedulerHook, _TimeEngine2);

  function TransportSchedulerHook(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (TransportSchedulerHook.__proto__ || (0, _getPrototypeOf2.default)(TransportSchedulerHook)).call(this));

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
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.__nextPosition;

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

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (TransportSchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(TransportSchedulingQueue)).call(this));

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
 * Provides synchronized scheduling of Time Engine instances.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/transport.html}
 *
 * @example
 * import * as audio from 'waves-audio';
 * const transport = audio.Transport();
 * const playControl = new audio.PlayControl(transport);
 * const myEngine = new MyEngine();
 * const yourEngine = new yourEngine();
 *
 * transport.add(myEngine);
 * transport.add(yourEngine);
 *
 * playControl.start();
 */


var Transport = function (_TimeEngine3) {
  (0, _inherits3.default)(Transport, _TimeEngine3);

  function Transport() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Transport);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this));

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
     * Get current master time. This getter will be replaced when the transport
     * is added to a master (i.e. transport or play-control).
     *
     * @type {Number}
     * @name currentTime
     * @memberof Transport
     * @instance
     * @readonly
     */

  }, {
    key: 'resetPosition',


    /**
     * Reset next transport position
     *
     * @param {Number} next - transport position
     */
    value: function resetPosition(position) {
      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this, position);else this.__schedulerHook.resetPosition(position);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     */

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      return this.__syncTransportedPosition(time, position, speed);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     */

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var engine = this.__transportedQueue.head;
      var nextEnginePosition = engine.advancePosition(time, position, speed);
      return this.__transportedQueue.move(engine, nextEnginePosition);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     * @param {Boolean} [seek=false]
     */

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

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
     * Add a time engine to the transport.
     *
     * @param {Object} engine - engine to be added to the transport
     * @param {Number} position - start position
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var startPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var endPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
      var offsetPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

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
     * Remove a time engine from the transport.
     *
     * @param {object} engineOrTransported - engine or transported to be removed from the transport
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

    /**
     * Reset position of the given engine.
     *
     * @param {TimeEngine} transported - Engine to reset
     * @param {Number} position - New position
     */

  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(transported) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      var speed = this.__speed;

      if (speed !== 0) {
        if (position === undefined) position = transported.syncPosition(this.currentTime, this.currentPosition, speed);

        var nextPosition = this.__transportedQueue.move(transported, position);
        this.resetPosition(nextPosition);
      }
    }

    /**
     * Remove all time engines from the transport.
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
     * Get current master position. This getter will be replaced when the transport
     * is added to a master (i.e. transport or play-control).
     *
     * @type {Number}
     * @name currentPosition
     * @memberof Transport
     * @instance
     * @readonly
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYW5zcG9ydC5qcyJdLCJuYW1lcyI6WyJhZGREdXBsZXQiLCJmaXJzdEFycmF5Iiwic2Vjb25kQXJyYXkiLCJmaXJzdEVsZW1lbnQiLCJzZWNvbmRFbGVtZW50IiwicHVzaCIsInJlbW92ZUR1cGxldCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsIlRyYW5zcG9ydGVkIiwidHJhbnNwb3J0IiwiZW5naW5lIiwic3RhcnQiLCJkdXJhdGlvbiIsIm9mZnNldCIsInN0cmV0Y2giLCJtYXN0ZXIiLCJfX2VuZ2luZSIsIl9fc3RhcnRQb3NpdGlvbiIsIl9fZW5kUG9zaXRpb24iLCJpc0Zpbml0ZSIsIkluZmluaXR5IiwiX19vZmZzZXRQb3NpdGlvbiIsIl9fc3RyZXRjaFBvc2l0aW9uIiwiX19pc1J1bm5pbmciLCJyZXNldFBvc2l0aW9uIiwidGltZSIsInBvc2l0aW9uIiwic3BlZWQiLCJ1bmRlZmluZWQiLCJyZXNldEVuZ2luZVBvc2l0aW9uIiwic3RvcCIsImN1cnJlbnRUaW1lIiwiY3VycmVudFBvc2l0aW9uIiwiVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCIsInN0YXJ0UG9zaXRpb24iLCJlbmRQb3NpdGlvbiIsIm9mZnNldFBvc2l0aW9uIiwiTWF0aCIsIm1heCIsIm1pbiIsInN5bmNQb3NpdGlvbiIsImFkdmFuY2VQb3NpdGlvbiIsInN5bmNTcGVlZCIsIlRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkIiwiVHJhbnNwb3J0ZWRTY2hlZHVsZWQiLCJfX3NjaGVkdWxpbmdRdWV1ZSIsImFkZCIsInJlc2V0RW5naW5lVGltZSIsInJlbW92ZSIsIlRyYW5zcG9ydFNjaGVkdWxlckhvb2siLCJfX3RyYW5zcG9ydCIsIl9fbmV4dFBvc2l0aW9uIiwiX19uZXh0VGltZSIsIl9fc2NoZWR1bGVyIiwiX19zcGVlZCIsIm5leHRQb3NpdGlvbiIsIm5leHRUaW1lIiwiX19nZXRUaW1lQXRQb3NpdGlvbiIsInJlc2V0VGltZSIsIlRyYW5zcG9ydFNjaGVkdWxpbmdRdWV1ZSIsIlRyYW5zcG9ydCIsIm9wdGlvbnMiLCJhdWRpb0NvbnRleHQiLCJfX2VuZ2luZXMiLCJfX3RyYW5zcG9ydGVkIiwiX19zY2hlZHVsZXJIb29rIiwiX190cmFuc3BvcnRlZFF1ZXVlIiwiX190aW1lIiwiX19wb3NpdGlvbiIsIm51bVRyYW5zcG9ydGVkRW5naW5lcyIsImxlbmd0aCIsImNsZWFyIiwicmV2ZXJzZSIsImkiLCJuZXh0RW5naW5lUG9zaXRpb24iLCJpbnNlcnQiLCJ0cmFuc3BvcnRlZCIsIl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24iLCJoZWFkIiwibW92ZSIsInNlZWsiLCJsYXN0U3BlZWQiLCJfX3N5bmNUcmFuc3BvcnRlZFNwZWVkIiwiRXJyb3IiLCJpbXBsZW1lbnRzVHJhbnNwb3J0ZWQiLCJpbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkIiwiaW1wbGVtZW50c1NjaGVkdWxlZCIsImVuZ2luZU9yVHJhbnNwb3J0ZWQiLCJkZXN0cm95Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUdBLFNBQVNBLFNBQVQsQ0FBbUJDLFVBQW5CLEVBQStCQyxXQUEvQixFQUE0Q0MsWUFBNUMsRUFBMERDLGFBQTFELEVBQXlFO0FBQ3ZFSCxhQUFXSSxJQUFYLENBQWdCRixZQUFoQjtBQUNBRCxjQUFZRyxJQUFaLENBQWlCRCxhQUFqQjtBQUNEOztBQUVELFNBQVNFLFlBQVQsQ0FBc0JMLFVBQXRCLEVBQWtDQyxXQUFsQyxFQUErQ0MsWUFBL0MsRUFBNkQ7QUFDM0QsTUFBTUksUUFBUU4sV0FBV08sT0FBWCxDQUFtQkwsWUFBbkIsQ0FBZDs7QUFFQSxNQUFJSSxTQUFTLENBQWIsRUFBZ0I7QUFDZCxRQUFNSCxnQkFBZ0JGLFlBQVlLLEtBQVosQ0FBdEI7O0FBRUFOLGVBQVdRLE1BQVgsQ0FBa0JGLEtBQWxCLEVBQXlCLENBQXpCO0FBQ0FMLGdCQUFZTyxNQUFaLENBQW1CRixL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SCxXQUE3QixFQUEwQ2xELFFBQTFDLENBQXJCO0FBQ0EsYUFBS0YsYUFBTCxDQUFtQitCLFlBQW5CO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7OzRCQUdRO0FBQ04sV0FBS2IsU0FBTCxDQUFlLEtBQUtYLFdBQXBCLEVBQWlDLEtBQUtDLGVBQXRDLEVBQXVELENBQXZEOztBQURNO0FBQUE7QUFBQTs7QUFBQTtBQUdOLHlEQUF3QixLQUFLZ0MsYUFBN0I7QUFBQSxjQUFTWSxXQUFUOztBQUNFQSxzQkFBWVksT0FBWjtBQURGO0FBSE07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtQOzs7d0JBcE1pQjtBQUNoQixhQUFPLEtBQUtuQyxXQUFMLENBQWlCdEIsV0FBeEI7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7Ozt3QkFVc0I7QUFDcEIsVUFBTWhCLFNBQVMsS0FBS0EsTUFBcEI7O0FBRUEsVUFBSUEsVUFBVUEsT0FBT2lCLGVBQVAsS0FBMkJKLFNBQXpDLEVBQ0UsT0FBT2IsT0FBT2lCLGVBQWQ7O0FBRUYsYUFBTyxLQUFLb0MsVUFBTCxHQUFrQixDQUFDLEtBQUtmLFdBQUwsQ0FBaUJ0QixXQUFqQixHQUErQixLQUFLb0MsTUFBckMsSUFBK0MsS0FBS2IsT0FBN0U7QUFDRDs7Ozs7a0JBa0xZTSxTIiwiZmlsZSI6InRyYW5zcG9ydC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgUHJpb3JpdHlRdWV1ZSBmcm9tICcuLi9jb3JlL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vY29yZS9zY2hlZHVsaW5nLXF1ZXVlJztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvdGltZS1lbmdpbmUnO1xuaW1wb3J0IHsgZ2V0U2NoZWR1bGVyIH0gZnJvbSAnLi9mYWN0b3JpZXMnO1xuXG5cbmZ1bmN0aW9uIGFkZER1cGxldChmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZmlyc3RFbGVtZW50LCBzZWNvbmRFbGVtZW50KSB7XG4gIGZpcnN0QXJyYXkucHVzaChmaXJzdEVsZW1lbnQpO1xuICBzZWNvbmRBcnJheS5wdXNoKHNlY29uZEVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsZXQoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCkge1xuICBjb25zdCBpbmRleCA9IGZpcnN0QXJyYXkuaW5kZXhPZihmaXJzdEVsZW1lbnQpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgY29uc3Qgc2Vjb25kRWxlbWVudCA9IHNlY29uZEFycmF5W2luZGV4XTtcblxuICAgIGZpcnN0QXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBzZWNvbmRBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgcmV0dXJuIHNlY29uZEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gVGhlIFRyYW5zcG9ydGVkIGNhbGwgaXMgdGhlIGJhc2UgY2xhc3Mgb2YgdGhlIGFkYXB0ZXJzIGJldHdlZW5cbi8vIGRpZmZlcmVudCB0eXBlcyBvZiBlbmdpbmVzIChpLmUuIHRyYW5zcG9ydGVkLCBzY2hlZHVsZWQsIHBsYXktY29udHJvbGxlZClcbi8vIFRoZSBhZGFwdGVycyBhcmUgYXQgdGhlIHNhbWUgdGltZSBtYXN0ZXJzIGZvciB0aGUgZW5naW5lcyBhZGRlZCB0byB0aGUgdHJhbnNwb3J0XG4vLyBhbmQgdHJhbnNwb3J0ZWQgVGltZUVuZ2luZXMgaW5zZXJ0ZWQgaW50byB0aGUgdHJhbnNwb3J0J3MgcG9zaXRpb24tYmFzZWQgcHJpdG9yaXR5IHF1ZXVlLlxuY2xhc3MgVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0LCBkdXJhdGlvbiwgb2Zmc2V0LCBzdHJldGNoID0gMSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tYXN0ZXIgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuXG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydDtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSAhaXNGaW5pdGUoZHVyYXRpb24pID8gSW5maW5pdHkgOiBzdGFydCArIGR1cmF0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IHN0YXJ0ICsgb2Zmc2V0O1xuICAgIHRoaXMuX19zdHJldGNoUG9zaXRpb24gPSBzdHJldGNoO1xuICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgfVxuXG4gIHNldEJvdW5kYXJpZXMoc3RhcnQsIGR1cmF0aW9uLCBvZmZzZXQgPSAwLCBzdHJldGNoID0gMSkge1xuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnQ7XG4gICAgdGhpcy5fX2VuZFBvc2l0aW9uID0gc3RhcnQgKyBkdXJhdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBzdGFydCArIG9mZnNldDtcbiAgICB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uID0gc3RyZXRjaDtcbiAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge31cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge31cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcG9zaXRpb24gKz0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuXG4gICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gIH1cblxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaWYgKHBvc2l0aW9uIDwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcblxuICAgICAgICBpZiAodGhpcy5fX2lzUnVubmluZylcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2lzUnVubmluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwb3NpdGlvbiA+IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICBpZiAodGhpcy5fX2lzUnVubmluZykgLy8gaWYgZW5naW5lIGlzIHJ1bm5pbmdcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPiB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2lzUnVubmluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fX2lzUnVubmluZykgLy8gaWYgZW5naW5lIGlzIHJ1bm5pbmdcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKCF0aGlzLl9faXNSdW5uaW5nKSB7XG4gICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB0aGlzLl9faXNSdW5uaW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKHNwZWVkID4gMClcbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcblxuICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vIHN0b3AgZW5naW5lXG4gICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gSW5maW5pdHkgKiBzcGVlZDtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPT09IDApIC8vIHN0b3BcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcblxuICAgIHRoaXMuX19lbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkXG4vLyBoYXMgdG8gc3dpdGNoIG9uIGFuZCBvZmYgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5tYXgocG9zaXRpb24sIHRoaXMuX19zdGFydFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPj0gdGhpcy5fX3N0YXJ0UG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IE1hdGgubWluKHBvc2l0aW9uLCB0aGlzLl9fZW5kUG9zaXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgcG9zaXRpb24gPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gKyB0aGlzLl9fZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbiB8fCBzcGVlZCA8IDAgJiYgcG9zaXRpb24gPj0gdGhpcy5fX3N0YXJ0UG9zaXRpb24pXG4gICAgICByZXR1cm4gcG9zaXRpb247XG5cbiAgICByZXR1cm4gSW5maW5pdHkgKiBzcGVlZDtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkXG4vLyBoYXMgdG8gc3RhcnQgYW5kIHN0b3AgdGhlIHNwZWVkLWNvbnRyb2xsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgdHJ1ZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9faXNSdW5uaW5nKVxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGhpcy5tYXN0ZXIuY3VycmVudFRpbWUsIHRoaXMubWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgMCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU2NoZWR1bGVkXG4vLyBoYXMgdG8gc3dpdGNoIG9uIGFuZCBvZmYgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFNjaGVkdWxlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgLy8gc2NoZWR1bGluZyBxdWV1ZSBiZWNvbWVzIG1hc3RlciBvZiBlbmdpbmVcbiAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsaW5nUXVldWUuYWRkKGVuZ2luZSwgSW5maW5pdHkpO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVzZXRFbmdpbmVUaW1lKHRoaXMuX19lbmdpbmUsIHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlc2V0RW5naW5lVGltZSh0aGlzLl9fZW5naW5lLCBJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlbW92ZSh0aGlzLl9fZW5naW5lKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gdHJhbnNsYXRlcyBhZHZhbmNlUG9zaXRpb24gb2YgKnRyYW5zcG9ydGVkKiBlbmdpbmVzIGludG8gZ2xvYmFsIHNjaGVkdWxlciB0aW1lc1xuY2xhc3MgVHJhbnNwb3J0U2NoZWR1bGVySG9vayBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBJbmZpbml0eTtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgY29uc3QgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgY29uc3Qgc3BlZWQgPSB0cmFuc3BvcnQuX19zcGVlZDtcbiAgICBjb25zdCBuZXh0UG9zaXRpb24gPSB0cmFuc3BvcnQuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgY29uc3QgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBuZXh0VGltZTtcblxuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgY29uc3QgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICBjb25zdCB0aW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IHRpbWU7XG5cbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IG51bGw7XG4gIH1cbn1cblxuLy8gaW50ZXJuYWwgc2NoZWR1bGluZyBxdWV1ZSB0aGF0IHJldHVybnMgdGhlIGN1cnJlbnQgcG9zaXRpb24gKGFuZCB0aW1lKSBvZiB0aGUgcGxheSBjb250cm9sXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVzIHN5bmNocm9uaXplZCBzY2hlZHVsaW5nIG9mIFRpbWUgRW5naW5lIGluc3RhbmNlcy5cbiAqXG4gKiBbZXhhbXBsZV17QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL3RyYW5zcG9ydC5odG1sfVxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCB0cmFuc3BvcnQgPSBhdWRpby5UcmFuc3BvcnQoKTtcbiAqIGNvbnN0IHBsYXlDb250cm9sID0gbmV3IGF1ZGlvLlBsYXlDb250cm9sKHRyYW5zcG9ydCk7XG4gKiBjb25zdCBteUVuZ2luZSA9IG5ldyBNeUVuZ2luZSgpO1xuICogY29uc3QgeW91ckVuZ2luZSA9IG5ldyB5b3VyRW5naW5lKCk7XG4gKlxuICogdHJhbnNwb3J0LmFkZChteUVuZ2luZSk7XG4gKiB0cmFuc3BvcnQuYWRkKHlvdXJFbmdpbmUpO1xuICpcbiAqIHBsYXlDb250cm9sLnN0YXJ0KCk7XG4gKi9cbmNsYXNzIFRyYW5zcG9ydCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ZWQgPSBbXTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIodGhpcy5hdWRpb0NvbnRleHQpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxlckhvb2sodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUgPSBuZXcgVHJhbnNwb3J0U2NoZWR1bGluZ1F1ZXVlKHRoaXMpO1xuXG4gICAgLy8gc3luY3Jvbml6ZWQgdGltZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG4gIH1cblxuICBfX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX190aW1lICsgKHBvc2l0aW9uIC0gdGhpcy5fX3Bvc2l0aW9uKSAvIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgY29uc3QgbnVtVHJhbnNwb3J0ZWRFbmdpbmVzID0gdGhpcy5fX3RyYW5zcG9ydGVkLmxlbmd0aDtcbiAgICBsZXQgbmV4dFBvc2l0aW9uID0gSW5maW5pdHkgKiBzcGVlZDtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5jbGVhcigpO1xuICAgICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUucmV2ZXJzZSA9IChzcGVlZCA8IDApO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVRyYW5zcG9ydGVkRW5naW5lczsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgICAgfVxuXG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS50aW1lO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGZvciAobGV0IHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lLiBUaGlzIGdldHRlciB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydFxuICAgKiBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgY3VycmVudFRpbWVcbiAgICogQG1lbWJlcm9mIFRyYW5zcG9ydFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uLiBUaGlzIGdldHRlciB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydFxuICAgKiBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgY3VycmVudFBvc2l0aW9uXG4gICAqIEBtZW1iZXJvZiBUcmFuc3BvcnRcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgLSB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgdHJhbnNwb3J0ZWQgdGltZSBlbmdpbmUgaW50ZXJmYWNlLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZVxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkXG4gICAqL1xuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgcmV0dXJuIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSB0cmFuc3BvcnRlZCB0aW1lIGVuZ2luZSBpbnRlcmZhY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWRcbiAgICovXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5oZWFkO1xuICAgIGNvbnN0IG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2YgdGhlIHRyYW5zcG9ydGVkIHRpbWUgZW5naW5lIGludGVyZmFjZS5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzcGVlZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtzZWVrPWZhbHNlXVxuICAgKi9cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgY29uc3QgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICBsZXQgbmV4dFBvc2l0aW9uO1xuXG4gICAgICAvLyByZXN5bmMgdHJhbnNwb3J0ZWQgZW5naW5lc1xuICAgICAgaWYgKHNlZWsgfHwgc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAgIC8vIHNlZWsgb3IgcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdGFydFxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoYW5nZSBzcGVlZCB3aXRob3V0IHJldmVyc2luZyBkaXJlY3Rpb25cbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW5naW5lIC0gZW5naW5lIHRvIGJlIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIC0gc3RhcnQgcG9zaXRpb25cbiAgICovXG4gIGFkZChlbmdpbmUsIHN0YXJ0UG9zaXRpb24gPSAwLCBlbmRQb3NpdGlvbiA9IEluZmluaXR5LCBvZmZzZXRQb3NpdGlvbiA9IDApIHtcbiAgICBsZXQgdHJhbnNwb3J0ZWQgPSBudWxsO1xuXG4gICAgaWYgKG9mZnNldFBvc2l0aW9uID09PSAtSW5maW5pdHkpXG4gICAgICBvZmZzZXRQb3NpdGlvbiA9IDA7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU2NoZWR1bGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIGEgdHJhbnNwb3J0XCIpO1xuXG4gICAgaWYgKHRyYW5zcG9ydGVkKSB7XG4gICAgICBjb25zdCBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgICAgYWRkRHVwbGV0KHRoaXMuX19lbmdpbmVzLCB0aGlzLl9fdHJhbnNwb3J0ZWQsIGVuZ2luZSwgdHJhbnNwb3J0ZWQpO1xuXG4gICAgICBpZiAoc3BlZWQgIT09IDApIHtcbiAgICAgICAgLy8gc3luYyBhbmQgc3RhcnRcbiAgICAgICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydCh0cmFuc3BvcnRlZCwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZW5naW5lT3JUcmFuc3BvcnRlZCAtIGVuZ2luZSBvciB0cmFuc3BvcnRlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZU9yVHJhbnNwb3J0ZWQpIHtcbiAgICBsZXQgZW5naW5lID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICBsZXQgdHJhbnNwb3J0ZWQgPSByZW1vdmVEdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG5cbiAgICBpZiAoIXRyYW5zcG9ydGVkKSB7XG4gICAgICBlbmdpbmUgPSByZW1vdmVEdXBsZXQodGhpcy5fX3RyYW5zcG9ydGVkLCB0aGlzLl9fZW5naW5lcywgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG4gICAgICB0cmFuc3BvcnRlZCA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZSAmJiB0cmFuc3BvcnRlZCkge1xuICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUucmVtb3ZlKHRyYW5zcG9ydGVkKTtcblxuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHRyYW5zcG9ydFwiKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgcG9zaXRpb24gb2YgdGhlIGdpdmVuIGVuZ2luZS5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSB0cmFuc3BvcnRlZCAtIEVuZ2luZSB0byByZXNldFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBOZXcgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0RW5naW5lUG9zaXRpb24odHJhbnNwb3J0ZWQsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IDApIHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBwb3NpdGlvbiA9IHRyYW5zcG9ydGVkLnN5bmNQb3NpdGlvbih0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLmN1cnJlbnRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5tb3ZlKHRyYW5zcG9ydGVkLCBwb3NpdGlvbik7XG4gICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0aW1lIGVuZ2luZXMgZnJvbSB0aGUgdHJhbnNwb3J0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zeW5jU3BlZWQodGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIDApO1xuXG4gICAgZm9yIChsZXQgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYW5zcG9ydDtcbiJdfQ==