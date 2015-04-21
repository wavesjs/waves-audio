"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _core = require("babel-runtime/core-js")["default"];

var defaultAudioContext = require("../core/audio-context");
var TimeEngine = require("../core/time-engine");
var PriorityQueue = require("../utils/priority-queue");
var SchedulingQueue = require("../utils/scheduling-queue");
var getScheduler = require("./factories").getScheduler;

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

var Transported = (function (_TimeEngine) {
  function Transported(transport, engine, startPosition, endPosition, offsetPosition) {
    _classCallCheck(this, Transported);

    this.master = transport;

    engine.master = this;
    this.__engine = engine;

    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.__scalePosition = 1;
    this.__haltPosition = Infinity; // engine's next halt position when not running (is null when engine hes been started)
  }

  _inherits(Transported, _TimeEngine);

  _createClass(Transported, {
    setBoundaries: {
      value: function setBoundaries(startPosition, endPosition) {
        var _this = this;

        var offsetPosition = arguments[2] === undefined ? startPosition : arguments[2];
        var scalePosition = arguments[3] === undefined ? 1 : arguments[3];
        return (function () {
          _this.__startPosition = startPosition;
          _this.__endPosition = endPosition;
          _this.__offsetPosition = offsetPosition;
          _this.__scalePosition = scalePosition;
          _this.resetPosition();
        })();
      }
    },
    start: {
      value: function start(time, position, speed) {}
    },
    stop: {
      value: function stop(time, position) {}
    },
    currentTime: {
      get: function () {
        return this.master.currentTime;
      }
    },
    currentPosition: {
      get: function () {
        return this.master.currentPosition - this.__offsetPosition;
      }
    },
    resetPosition: {
      value: function resetPosition(position) {
        if (position !== undefined) position += this.__offsetPosition;

        this.master.resetEnginePosition(this, position);
      }
    },
    syncPosition: {
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
    },
    advancePosition: {
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
    },
    syncSpeed: {
      value: function syncSpeed(time, position, speed) {
        if (speed === 0) this.stop(time, position - this.__offsetPosition);
      }
    },
    destroy: {
      value: function destroy() {
        this.master = null;
        this.__engine.master = null;
        this.__engine = null;
      }
    }
  });

  return Transported;
})(TimeEngine);

// TransportedScheduled
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position

var TransportedTransported = (function (_Transported) {
  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {
    _classCallCheck(this, TransportedTransported);

    _get(_core.Object.getPrototypeOf(TransportedTransported.prototype), "constructor", this).call(this, transport, engine, startPosition, endPosition, offsetPosition);
  }

  _inherits(TransportedTransported, _Transported);

  _createClass(TransportedTransported, {
    syncPosition: {
      value: function syncPosition(time, position, speed) {
        if (speed > 0 && position < this.__endPosition) position = Math.max(position, this.__startPosition);else if (speed < 0 && position >= this.__startPosition) position = Math.min(position, this.__endPosition);

        return this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
      }
    },
    advancePosition: {
      value: function advancePosition(time, position, speed) {
        position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

        if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition) {
          return position;
        }return Infinity;
      }
    },
    syncSpeed: {
      value: function syncSpeed(time, position, speed) {
        if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, speed);
      }
    },
    resetEnginePosition: {
      value: function resetEnginePosition(engine) {
        var position = arguments[1] === undefined ? undefined : arguments[1];

        if (position !== undefined) position += this.__offsetPosition;

        this.resetPosition(position);
      }
    }
  });

  return TransportedTransported;
})(Transported);

// TransportedSpeedControlled
// has to start and stop the speed-controlled engines when the transport hits the engine's start and end position

var TransportedSpeedControlled = (function (_Transported2) {
  function TransportedSpeedControlled(transport, engine, startPosition, endPosition, offsetPosition) {
    _classCallCheck(this, TransportedSpeedControlled);

    _get(_core.Object.getPrototypeOf(TransportedSpeedControlled.prototype), "constructor", this).call(this, transport, engine, startPosition, endPosition, offsetPosition);
  }

  _inherits(TransportedSpeedControlled, _Transported2);

  _createClass(TransportedSpeedControlled, {
    start: {
      value: function start(time, position, speed) {
        this.__engine.syncSpeed(time, position, speed, true);
      }
    },
    stop: {
      value: function stop(time, position) {
        this.__engine.syncSpeed(time, position, 0);
      }
    },
    syncSpeed: {
      value: function syncSpeed(time, position, speed) {
        if (this.__haltPosition === null) // engine is active
          this.__engine.syncSpeed(time, position, speed);
      }
    },
    destroy: {
      value: function destroy() {
        this.__engine.syncSpeed(this.master.currentTime, this.master.currentPosition - this.__offsetPosition, 0);
        _get(_core.Object.getPrototypeOf(TransportedSpeedControlled.prototype), "destroy", this).call(this);
      }
    }
  });

  return TransportedSpeedControlled;
})(Transported);

// TransportedScheduled
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position

var TransportedScheduled = (function (_Transported3) {
  function TransportedScheduled(transport, engine, startPosition, endPosition, offsetPosition) {
    _classCallCheck(this, TransportedScheduled);

    _get(_core.Object.getPrototypeOf(TransportedScheduled.prototype), "constructor", this).call(this, transport, engine, startPosition, endPosition, offsetPosition);
    transport.__schedulingQueue.add(engine, Infinity);
  }

  _inherits(TransportedScheduled, _Transported3);

  _createClass(TransportedScheduled, {
    start: {
      value: function start(time, position, speed) {
        this.master.__schedulingQueue.resetEngineTime(this.__engine, time);
      }
    },
    stop: {
      value: function stop(time, position) {
        this.master.__schedulingQueue.resetEngineTime(this.__engine, Infinity);
      }
    },
    destroy: {
      value: function destroy() {
        this.master.__schedulingQueue.remove(this.__engine);
        _get(_core.Object.getPrototypeOf(TransportedScheduled.prototype), "destroy", this).call(this);
      }
    }
  });

  return TransportedScheduled;
})(Transported);

var TransportSchedulerHook = (function (_TimeEngine2) {
  function TransportSchedulerHook(transport) {
    _classCallCheck(this, TransportSchedulerHook);

    _get(_core.Object.getPrototypeOf(TransportSchedulerHook.prototype), "constructor", this).call(this);

    this.__transport = transport;

    this.__nextPosition = Infinity;
    this.__nextTime = Infinity;
    transport.__scheduler.add(this, Infinity);
  }

  _inherits(TransportSchedulerHook, _TimeEngine2);

  _createClass(TransportSchedulerHook, {
    advanceTime: {

      // TimeEngine method (scheduled interface)

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
    },
    resetPosition: {
      value: function resetPosition() {
        var position = arguments[0] === undefined ? this.__nextPosition : arguments[0];

        var transport = this.__transport;
        var time = transport.__getTimeAtPosition(position);

        this.__nextPosition = position;
        this.__nextTime = time;
        this.resetTime(time);
      }
    },
    destroy: {
      value: function destroy() {
        this.__transport.__scheduler.remove(this);
        this.__transport = null;
      }
    }
  });

  return TransportSchedulerHook;
})(TimeEngine);

var TransportSchedulingQueue = (function (_SchedulingQueue) {
  function TransportSchedulingQueue(transport) {
    _classCallCheck(this, TransportSchedulingQueue);

    _get(_core.Object.getPrototypeOf(TransportSchedulingQueue.prototype), "constructor", this).call(this);

    this.__transport = transport;
    transport.__scheduler.add(this, Infinity);
  }

  _inherits(TransportSchedulingQueue, _SchedulingQueue);

  _createClass(TransportSchedulingQueue, {
    currentTime: {
      get: function () {
        return this.__transport.currentTime;
      }
    },
    currentPosition: {
      get: function () {
        return this.__transport.currentPosition;
      }
    },
    destroy: {
      value: function destroy() {
        this.__transport.__scheduler.remove(this);
        this.__transport = null;
      }
    }
  });

  return TransportSchedulingQueue;
})(SchedulingQueue);

/**
 * Transport class
 */

var Transport = (function (_TimeEngine3) {
  function Transport() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Transport);

    _get(_core.Object.getPrototypeOf(Transport.prototype), "constructor", this).call(this);

    this.audioContext = options.audioContext || defaultAudioContext;

    this.__engines = [];
    this.__transported = [];

    this.__scheduler = getScheduler(this.audioContext);
    this.__schedulerHook = new TransportSchedulerHook(this);
    this.__transportedQueue = new PriorityQueue();
    this.__schedulingQueue = new TransportSchedulingQueue(this);

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;
  }

  _inherits(Transport, _TimeEngine3);

  _createClass(Transport, {
    __getTimeAtPosition: {
      value: function __getTimeAtPosition(position) {
        return this.__time + (position - this.__position) / this.__speed;
      }
    },
    __getPositionAtTime: {
      value: function __getPositionAtTime(time) {
        return this.__position + (time - this.__time) * this.__speed;
      }
    },
    __syncTransportedPosition: {
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
    },
    __syncTransportedSpeed: {
      value: function __syncTransportedSpeed(time, position, speed) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _core.$for.getIterator(this.__transported), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var transported = _step.value;

            transported.syncSpeed(time, position, speed);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    },
    currentTime: {

      /**
       * Get current master time
       * @return {Number} current time
       *
       * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
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
       * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
       */

      get: function () {
        var master = this.master;

        if (master && master.currentPosition !== undefined) return master.currentPosition;

        return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
      }
    },
    resetPosition: {

      /**
       * Reset next transport position
       * @param {Number} next transport position
       */

      value: function resetPosition(position) {
        var master = this.master;

        if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this, position);else this.__schedulerHook.resetPosition(position);
      }
    },
    syncPosition: {

      // TimeEngine method (transported interface)

      value: function syncPosition(time, position, speed) {
        this.__time = time;
        this.__position = position;
        this.__speed = speed;

        return this.__syncTransportedPosition(time, position, speed);
      }
    },
    advancePosition: {

      // TimeEngine method (transported interface)

      value: function advancePosition(time, position, speed) {
        var nextPosition = this.__transportedQueue.time;

        while (nextPosition === position) {
          var engine = this.__transportedQueue.head;
          var nextEnginePosition = engine.advancePosition(time, position, speed);

          if ((speed > 0 && nextEnginePosition > position || speed < 0 && nextEnginePosition < position) && (nextEnginePosition < Infinity && nextEnginePosition > -Infinity)) {
            nextPosition = this.__transportedQueue.move(engine, nextEnginePosition);
          } else {
            nextPosition = this.__transportedQueue.remove(engine);
          }
        }

        return nextPosition;
      }
    },
    syncSpeed: {

      // TimeEngine method (speed-controlled interface)

      value: function syncSpeed(time, position, speed) {
        var seek = arguments[3] === undefined ? false : arguments[3];

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
    },
    add: {

      /**
       * Add a time engine to the transport
       * @param {Object} engine engine to be added to the transport
       * @param {Number} position start position
       */

      value: function add(engine) {
        var _this = this;

        var startPosition = arguments[1] === undefined ? -Infinity : arguments[1];
        var endPosition = arguments[2] === undefined ? Infinity : arguments[2];
        var offsetPosition = arguments[3] === undefined ? startPosition : arguments[3];
        return (function () {
          var transported = null;

          if (offsetPosition === -Infinity) offsetPosition = 0;

          if (engine.master) throw new Error("object has already been added to a master");

          if (engine.implementsTransported()) transported = new TransportedTransported(_this, engine, startPosition, endPosition, offsetPosition);else if (engine.implementsSpeedControlled()) transported = new TransportedSpeedControlled(_this, engine, startPosition, endPosition, offsetPosition);else if (engine.implementsScheduled()) transported = new TransportedScheduled(_this, engine, startPosition, endPosition, offsetPosition);else throw new Error("object cannot be added to a transport");

          if (transported) {
            var speed = _this.__speed;

            addDuplet(_this.__engines, _this.__transported, engine, transported);

            if (speed !== 0) {
              // sync and start
              var nextEnginePosition = transported.syncPosition(_this.currentTime, _this.currentPosition, speed);
              var nextPosition = _this.__transportedQueue.insert(transported, nextEnginePosition);

              _this.resetPosition(nextPosition);
            }
          }

          return transported;
        })();
      }
    },
    remove: {

      /**
       * Remove a time engine from the transport
       * @param {object} engineOrTransported engine or transported to be removed from the transport
       */

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
    },
    resetEnginePosition: {
      value: function resetEnginePosition(transported) {
        var position = arguments[1] === undefined ? undefined : arguments[1];

        var speed = this.__speed;

        if (speed !== 0) {
          if (position === undefined) position = transported.syncPosition(this.currentTime, this.currentPosition, speed);

          var nextPosition = this.__transportedQueue.move(transported, position);
          this.resetPosition(nextPosition);
        }
      }
    },
    clear: {

      /**
       * Remove all time engines from the transport
       */

      value: function clear() {
        this.syncSpeed(this.currentTime, this.currentPosition, 0);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _core.$for.getIterator(this.__transported), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var transported = _step.value;

            transported.destroy();
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }
  });

  return Transport;
})(TimeEngine);

module.exports = Transport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0QsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDaEQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDdkQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDM0QsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFlBQVksQ0FBQzs7QUFFdkQsU0FBUyxTQUFTLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFO0FBQ3ZFLFlBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDOUIsYUFBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztDQUNqQzs7QUFFRCxTQUFTLFlBQVksQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRTtBQUMzRCxNQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUU3QyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxRQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXZDLGNBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVCLGVBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUU3QixXQUFPLGFBQWEsQ0FBQztHQUN0Qjs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOzs7Ozs7O0lBTUssV0FBVztBQUNKLFdBRFAsV0FBVyxDQUNILFNBQVMsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFdB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QU8sQ0FBQzs7QUFFekIsWUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsY0FBSSxRQUFRLEtBQUssU0FBUyxFQUN4QixRQUFRLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRXJGLGNBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZFLGNBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDbEM7T0FDRjs7QUFLRCxTQUFLOzs7Ozs7YUFBQSxpQkFBRztBQUNOLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0FBRTFELHNEQUF3QixJQUFJLENBQUMsYUFBYTtnQkFBakMsV0FBVzs7QUFDbEIsdUJBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztXQUFBOzs7Ozs7Ozs7Ozs7Ozs7T0FDekI7Ozs7U0EvT0csU0FBUztHQUFTLFVBQVU7O0FBa1BsQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvc2NoZWR1bGluZy1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmF1bHRBdWRpb0NvbnRleHQgPSByZXF1aXJlKFwiLi4vY29yZS9hdWRpby1jb250ZXh0XCIpO1xudmFyIFRpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS90aW1lLWVuZ2luZVwiKTtcbnZhciBQcmlvcml0eVF1ZXVlID0gcmVxdWlyZShcIi4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlXCIpO1xudmFyIFNjaGVkdWxpbmdRdWV1ZSA9IHJlcXVpcmUoXCIuLi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlXCIpO1xudmFyIGdldFNjaGVkdWxlciA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzJykuZ2V0U2NoZWR1bGVyO1xuXG5mdW5jdGlvbiBhZGREdXBsZXQoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCwgc2Vjb25kRWxlbWVudCkge1xuICBmaXJzdEFycmF5LnB1c2goZmlyc3RFbGVtZW50KTtcbiAgc2Vjb25kQXJyYXkucHVzaChzZWNvbmRFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHVwbGV0KGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBmaXJzdEVsZW1lbnQpIHtcbiAgdmFyIGluZGV4ID0gZmlyc3RBcnJheS5pbmRleE9mKGZpcnN0RWxlbWVudCk7XG5cbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICB2YXIgc2Vjb25kRWxlbWVudCA9IHNlY29uZEFycmF5W2luZGV4XTtcblxuICAgIGZpcnN0QXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBzZWNvbmRBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgcmV0dXJuIHNlY29uZEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gVGhlIFRyYW5zcG9ydGVkIGNhbGwgaXMgdGhlIGJhc2UgY2xhc3Mgb2YgdGhlIGFkYXB0ZXJzIGJldHdlZW4gXG4vLyBkaWZmZXJlbnQgdHlwZXMgb2YgZW5naW5lcyAoaS5lLiB0cmFuc3BvcnRlZCwgc2NoZWR1bGVkLCBwbGF5LWNvbnRyb2xsZWQpXG4vLyBUaGUgYWRhcHRlcnMgYXJlIGF0IHRoZSBzYW1lIHRpbWUgbWFzdGVycyBmb3IgdGhlIGVuZ2luZXMgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydCBcbi8vIGFuZCB0cmFuc3BvcnRlZCBUaW1lRW5naW5lcyBpbnNlcnRlZCBpbnRvIHRoZSB0cmFuc3BvcnQncyBwb3NpdGlvbi1iYXNlZCBwcml0b3JpdHkgcXVldWUuXG5jbGFzcyBUcmFuc3BvcnRlZCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgdGhpcy5tYXN0ZXIgPSB0cmFuc3BvcnQ7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9IGVuZFBvc2l0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IG9mZnNldFBvc2l0aW9uO1xuICAgIHRoaXMuX19zY2FsZVBvc2l0aW9uID0gMTtcbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7IC8vIGVuZ2luZSdzIG5leHQgaGFsdCBwb3NpdGlvbiB3aGVuIG5vdCBydW5uaW5nIChpcyBudWxsIHdoZW4gZW5naW5lIGhlcyBiZWVuIHN0YXJ0ZWQpXG4gIH1cblxuICBzZXRCb3VuZGFyaWVzKHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb24sIHNjYWxlUG9zaXRpb24gPSAxKSB7XG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9IGVuZFBvc2l0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IG9mZnNldFBvc2l0aW9uO1xuICAgIHRoaXMuX19zY2FsZVBvc2l0aW9uID0gc2NhbGVQb3NpdGlvbjtcbiAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge31cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge31cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcG9zaXRpb24gKz0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuXG4gICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gIH1cblxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaWYgKHBvc2l0aW9uIDwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcblxuICAgICAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSB0aGlzLl9fZW5kUG9zaXRpb247XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA8PSB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBudWxsOyAvLyBlbmdpbmUgaXMgYWN0aXZlXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBvc2l0aW9uID49IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcblxuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA+IHRoaXMuX19zdGFydFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gbnVsbDsgLy8gZW5naW5lIGlzIGFjdGl2ZVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGhhbHRQb3NpdGlvbiA9IHRoaXMuX19oYWx0UG9zaXRpb247XG5cbiAgICBpZiAoaGFsdFBvc2l0aW9uICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBudWxsO1xuXG4gICAgICByZXR1cm4gaGFsdFBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vIHN0b3AgZW5naW5lXG4gICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA9PT0gMClcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWQgXG4vLyBoYXMgdG8gc3dpdGNoIG9uIGFuZCBvZmYgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5tYXgocG9zaXRpb24sIHRoaXMuX19zdGFydFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPj0gdGhpcy5fX3N0YXJ0UG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IE1hdGgubWluKHBvc2l0aW9uLCB0aGlzLl9fZW5kUG9zaXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgcG9zaXRpb24gPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gKyB0aGlzLl9fZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbiB8fCBzcGVlZCA8IDAgJiYgcG9zaXRpb24gPj0gdGhpcy5fX3N0YXJ0UG9zaXRpb24pXG4gICAgICByZXR1cm4gcG9zaXRpb247XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24oZW5naW5lLCBwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcG9zaXRpb24gKz0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuXG4gICAgdGhpcy5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZCBcbi8vIGhhcyB0byBzdGFydCBhbmQgc3RvcCB0aGUgc3BlZWQtY29udHJvbGxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCB0cnVlKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpIC8vIGVuZ2luZSBpcyBhY3RpdmVcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lLCB0aGlzLm1hc3Rlci5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIDApO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNjaGVkdWxlZCBcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU2NoZWR1bGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGluZ1F1ZXVlLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlc2V0RW5naW5lVGltZSh0aGlzLl9fZW5naW5lLCB0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciB0cmFuc3BvcnQgPSB0aGlzLl9fdHJhbnNwb3J0O1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIHNwZWVkID0gdHJhbnNwb3J0Ll9fc3BlZWQ7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IHRyYW5zcG9ydC5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgd2hpbGUgKG5leHRUaW1lIDw9IHRpbWUpIHtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRyYW5zcG9ydC5hZHZhbmNlUG9zaXRpb24obmV4dFRpbWUsIG5leHRQb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gbmV4dFRpbWU7XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICB2YXIgdGltZSA9IHRyYW5zcG9ydC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFRyYW5zcG9ydCBjbGFzc1xuICovXG5jbGFzcyBUcmFuc3BvcnQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgZGVmYXVsdEF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkID0gW107XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyKHRoaXMuYXVkaW9Db250ZXh0KTtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxpbmdRdWV1ZSh0aGlzKTtcblxuICAgIC8vIHN5bmNyb25pemVkIHRpbWUsIHBvc2l0aW9uLCBhbmQgc3BlZWRcbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuICB9XG5cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBudW1UcmFuc3BvcnRlZEVuZ2luZXMgPSB0aGlzLl9fdHJhbnNwb3J0ZWQubGVuZ3RoO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB2YXIgZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb247XG5cbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmNsZWFyKCk7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBudW1UcmFuc3BvcnRlZEVuZ2luZXMgLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24sIGZhbHNlKTsgLy8gaW5zZXJ0IGJ1dCBkb24ndCBzb3J0XG4gICAgICB9XG5cbiAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFswXTtcbiAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbiwgdHJ1ZSk7IC8vIGluc2VydCBhbmQgc29ydFxuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgdHJhbnNwb3J0IHBvc2l0aW9uXG4gICAqL1xuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcblxuICAgIHJldHVybiB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUudGltZTtcblxuICAgIHdoaWxlIChuZXh0UG9zaXRpb24gPT09IHBvc2l0aW9uKSB7XG4gICAgICB2YXIgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUuaGVhZDtcbiAgICAgIHZhciBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIGlmICgoKHNwZWVkID4gMCAmJiBuZXh0RW5naW5lUG9zaXRpb24gPiBwb3NpdGlvbikgfHwgKHNwZWVkIDwgMCAmJiBuZXh0RW5naW5lUG9zaXRpb24gPCBwb3NpdGlvbikpICYmXG4gICAgICAgIChuZXh0RW5naW5lUG9zaXRpb24gPCBJbmZpbml0eSAmJiBuZXh0RW5naW5lUG9zaXRpb24gPiAtSW5maW5pdHkpKSB7XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUucmVtb3ZlKGVuZ2luZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IChzZWVrICYmIHNwZWVkICE9PSAwKSkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbjtcblxuICAgICAgLy8gcmVzeW5jIHRyYW5zcG9ydGVkIGVuZ2luZXNcbiAgICAgIGlmIChzZWVrIHx8IHNwZWVkICogbGFzdFNwZWVkIDwgMCkge1xuICAgICAgICAvLyBzZWVrIG9yIHJldmVyc2UgZGlyZWN0aW9uXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0b3BcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGFuZ2Ugc3BlZWQgd2l0aG91dCByZXZlcnNpbmcgZGlyZWN0aW9uXG4gICAgICAgIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgdGltZSBlbmdpbmUgdG8gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge09iamVjdH0gZW5naW5lIGVuZ2luZSB0byBiZSBhZGRlZCB0byB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiBzdGFydCBwb3NpdGlvblxuICAgKi9cbiAgYWRkKGVuZ2luZSwgc3RhcnRQb3NpdGlvbiA9IC1JbmZpbml0eSwgZW5kUG9zaXRpb24gPSBJbmZpbml0eSwgb2Zmc2V0UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uKSB7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gbnVsbDtcblxuICAgIGlmIChvZmZzZXRQb3NpdGlvbiA9PT0gLUluZmluaXR5KVxuICAgICAgb2Zmc2V0UG9zaXRpb24gPSAwO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGlmIChlbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKCkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBhIHRyYW5zcG9ydFwiKTtcblxuICAgIGlmICh0cmFuc3BvcnRlZCkge1xuICAgICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgICBhZGREdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lLCB0cmFuc3BvcnRlZCk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICB2YXIgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQodHJhbnNwb3J0ZWQsIG5leHRFbmdpbmVQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zcG9ydGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHRpbWUgZW5naW5lIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge29iamVjdH0gZW5naW5lT3JUcmFuc3BvcnRlZCBlbmdpbmUgb3IgdHJhbnNwb3J0ZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIHJlbW92ZShlbmdpbmVPclRyYW5zcG9ydGVkKSB7XG4gICAgdmFyIGVuZ2luZSA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gcmVtb3ZlRHVwbGV0KHRoaXMuX19lbmdpbmVzLCB0aGlzLl9fdHJhbnNwb3J0ZWQsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuXG4gICAgaWYgKCF0cmFuc3BvcnRlZCkge1xuICAgICAgZW5naW5lID0gcmVtb3ZlRHVwbGV0KHRoaXMuX190cmFuc3BvcnRlZCwgdGhpcy5fX2VuZ2luZXMsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuICAgICAgdHJhbnNwb3J0ZWQgPSBlbmdpbmVPclRyYW5zcG9ydGVkO1xuICAgIH1cblxuICAgIGlmIChlbmdpbmUgJiYgdHJhbnNwb3J0ZWQpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgdHJhbnNwb3J0XCIpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24odHJhbnNwb3J0ZWQsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZClcbiAgICAgICAgcG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUodHJhbnNwb3J0ZWQsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRpbWUgZW5naW5lcyBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuc3luY1NwZWVkKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCAwKTtcblxuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLmRlc3Ryb3koKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zcG9ydDsiXX0=