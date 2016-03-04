"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var defaultAudioContext = _interopRequire(require("../core/audio-context"));

var TimeEngine = _interopRequire(require("../core/time-engine"));

var PriorityQueue = _interopRequire(require("../utils/priority-queue"));

var SchedulingQueue = _interopRequire(require("../utils/scheduling-queue"));

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
  function Transported(transport, engine, start, duration, offset) {
    var stretch = arguments[5] === undefined ? 1 : arguments[5];

    _classCallCheck(this, Transported);

    _get(_core.Object.getPrototypeOf(Transported.prototype), "constructor", this).call(this);
    this.master = transport;

    engine.master = this;
    this.__engine = engine;

    this.__startPosition = start;
    this.__endPosition = !isFinite(duration) ? Infinity : start + duration;
    this.__offsetPosition = start + offset;
    this.__stretchPosition = stretch;
    this.__haltPosition = Infinity; // engine's next halt position when not running (is null when engine hes been started)
    // console.log(this.__startPosition, this.__endPosition, this.__offsetPosition, this.__stretchPosition)
  }

  _inherits(Transported, _TimeEngine);

  _createClass(Transported, {
    setBoundaries: {
      value: function setBoundaries(start, duration) {
        var offset = arguments[2] === undefined ? 0 : arguments[2];
        var stretch = arguments[3] === undefined ? 1 : arguments[3];

        this.__startPosition = start;
        this.__endPosition = start + duration;
        this.__offsetPosition = start + offset;
        this.__stretchPosition = stretch;
        this.resetPosition();
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
        // console.log(time, position, speed);
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
        var startPosition = arguments[1] === undefined ? 0 : arguments[1];
        var endPosition = arguments[2] === undefined ? Infinity : arguments[2];
        var offsetPosition = arguments[3] === undefined ? 0 : arguments[3];

        var transported = null;

        if (offsetPosition === -Infinity) offsetPosition = 0;

        if (engine.master) throw new Error("object has already been added to a master");

        if (engine.implementsTransported()) transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);else if (engine.implementsSpeedControlled()) transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);else if (engine.implementsScheduled()) transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);else throw new Error("object cannot be added to a transport");

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9tYXN0ZXJzL3RyYW5zcG9ydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFPLG1CQUFtQiwyQkFBTSx1QkFBdUI7O0lBQ2hELFVBQVUsMkJBQU0scUJBQXFCOztJQUNyQyxhQUFhLDJCQUFNLHlCQUF5Qjs7SUFDNUMsZUFBZSwyQkFBTSwyQkFBMkI7O0lBQzlDLFlBQVksV0FBUSxhQUFhLEVBQWpDLFlBQVk7O0FBR3JCLFNBQVMsU0FBUyxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRTtBQUN2RSxZQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlCLGFBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7Q0FDakM7O0FBRUQsU0FBUyxZQUFZLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUU7QUFDM0QsTUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFN0MsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsUUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2QyxjQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QixlQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFN0IsV0FBTyxhQUFhLENBQUM7R0FDdEI7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7Ozs7OztJQU1LLFdBQVc7QUFDSixXQURQLFdBQVcsQ0FDSCxTQUFTLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFlO1FBQWIsT0FBTyxnQ0FBRyxDQUFDOzswQkFEL0QsV0FBVzs7QUFFYixxQ0FGRSxXQUFXLDZDQUVMO0FBQ1IsUUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7O0FBRXhCLFVB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QkFBbUI7YUFBQSw2QkFBQyxXQUFXLEVBQXdCO1lBQXRCLFFBQVEsZ0NBQUcsU0FBUzs7QUFDbkQsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7QUFFekIsWUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsY0FBSSxRQUFRLEtBQUssU0FBUyxFQUN4QixRQUFRLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRXJGLGNBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZFLGNBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDbEM7T0FDRjs7QUFLRCxTQUFLOzs7Ozs7YUFBQSxpQkFBRztBQUNOLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O0FBRTFELHNEQUF3QixJQUFJLENBQUMsYUFBYTtnQkFBakMsV0FBVzs7QUFDbEIsdUJBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztXQUFBOzs7Ozs7Ozs7Ozs7Ozs7T0FDekI7Ozs7U0FoUGtCLFNBQVM7R0FBUyxVQUFVOztpQkFBNUIsU0FBUyIsImZpbGUiOiJlczYvbWFzdGVycy90cmFuc3BvcnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgUHJpb3JpdHlRdWV1ZSBmcm9tICcuLi91dGlscy9wcmlvcml0eS1xdWV1ZSc7XG5pbXBvcnQgU2NoZWR1bGluZ1F1ZXVlIGZyb20gJy4uL3V0aWxzL3NjaGVkdWxpbmctcXVldWUnO1xuaW1wb3J0IHsgZ2V0U2NoZWR1bGVyIH0gZnJvbSAnLi9mYWN0b3JpZXMnO1xuXG5cbmZ1bmN0aW9uIGFkZER1cGxldChmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZmlyc3RFbGVtZW50LCBzZWNvbmRFbGVtZW50KSB7XG4gIGZpcnN0QXJyYXkucHVzaChmaXJzdEVsZW1lbnQpO1xuICBzZWNvbmRBcnJheS5wdXNoKHNlY29uZEVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsZXQoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCkge1xuICB2YXIgaW5kZXggPSBmaXJzdEFycmF5LmluZGV4T2YoZmlyc3RFbGVtZW50KTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIHZhciBzZWNvbmRFbGVtZW50ID0gc2Vjb25kQXJyYXlbaW5kZXhdO1xuXG4gICAgZmlyc3RBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHNlY29uZEFycmF5LnNwbGljZShpbmRleCwgMSk7XG5cbiAgICByZXR1cm4gc2Vjb25kRWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG4vLyBUaGUgVHJhbnNwb3J0ZWQgY2FsbCBpcyB0aGUgYmFzZSBjbGFzcyBvZiB0aGUgYWRhcHRlcnMgYmV0d2VlblxuLy8gZGlmZmVyZW50IHR5cGVzIG9mIGVuZ2luZXMgKGkuZS4gdHJhbnNwb3J0ZWQsIHNjaGVkdWxlZCwgcGxheS1jb250cm9sbGVkKVxuLy8gVGhlIGFkYXB0ZXJzIGFyZSBhdCB0aGUgc2FtZSB0aW1lIG1hc3RlcnMgZm9yIHRoZSBlbmdpbmVzIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRcbi8vIGFuZCB0cmFuc3BvcnRlZCBUaW1lRW5naW5lcyBpbnNlcnRlZCBpbnRvIHRoZSB0cmFuc3BvcnQncyBwb3NpdGlvbi1iYXNlZCBwcml0b3JpdHkgcXVldWUuXG5jbGFzcyBUcmFuc3BvcnRlZCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnQsIGR1cmF0aW9uLCBvZmZzZXQsIHN0cmV0Y2ggPSAxKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm1hc3RlciA9IHRyYW5zcG9ydDtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICB0aGlzLl9fc3RhcnRQb3NpdGlvbiA9IHN0YXJ0O1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9ICFpc0Zpbml0ZShkdXJhdGlvbikgPyBJbmZpbml0eSA6IHN0YXJ0ICsgZHVyYXRpb247XG4gICAgdGhpcy5fX29mZnNldFBvc2l0aW9uID0gc3RhcnQgKyBvZmZzZXQ7XG4gICAgdGhpcy5fX3N0cmV0Y2hQb3NpdGlvbiA9IHN0cmV0Y2g7XG4gICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IEluZmluaXR5OyAvLyBlbmdpbmUncyBuZXh0IGhhbHQgcG9zaXRpb24gd2hlbiBub3QgcnVubmluZyAoaXMgbnVsbCB3aGVuIGVuZ2luZSBoZXMgYmVlbiBzdGFydGVkKVxuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuX19zdGFydFBvc2l0aW9uLCB0aGlzLl9fZW5kUG9zaXRpb24sIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgdGhpcy5fX3N0cmV0Y2hQb3NpdGlvbilcbiAgfVxuXG4gIHNldEJvdW5kYXJpZXMoc3RhcnQsIGR1cmF0aW9uLCBvZmZzZXQgPSAwLCBzdHJldGNoID0gMSkge1xuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnQ7XG4gICAgdGhpcy5fX2VuZFBvc2l0aW9uID0gc3RhcnQgKyBkdXJhdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBzdGFydCArIG9mZnNldDtcbiAgICB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uID0gc3RyZXRjaDtcbiAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge31cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge31cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcG9zaXRpb24gKz0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuXG4gICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gIH1cblxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaWYgKHBvc2l0aW9uIDwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcblxuICAgICAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSB0aGlzLl9fZW5kUG9zaXRpb247XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA8PSB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBudWxsOyAvLyBlbmdpbmUgaXMgYWN0aXZlXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBvc2l0aW9uID49IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcblxuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA+IHRoaXMuX19zdGFydFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gbnVsbDsgLy8gZW5naW5lIGlzIGFjdGl2ZVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGhhbHRQb3NpdGlvbiA9IHRoaXMuX19oYWx0UG9zaXRpb247XG5cbiAgICBpZiAoaGFsdFBvc2l0aW9uICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBudWxsO1xuXG4gICAgICByZXR1cm4gaGFsdFBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vIHN0b3AgZW5naW5lXG4gICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA9PT0gMClcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1heChwb3NpdGlvbiwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5taW4ocG9zaXRpb24sIHRoaXMuX19lbmRQb3NpdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBwb3NpdGlvbiA9IHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uIHx8IHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkXG4vLyBoYXMgdG8gc3RhcnQgYW5kIHN0b3AgdGhlIHNwZWVkLWNvbnRyb2xsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgdHJ1ZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKSAvLyBlbmdpbmUgaXMgYWN0aXZlXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aGlzLm1hc3Rlci5jdXJyZW50VGltZSwgdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCAwKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU2NoZWR1bGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGluZ1F1ZXVlLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlc2V0RW5naW5lVGltZSh0aGlzLl9fZW5naW5lLCB0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciB0cmFuc3BvcnQgPSB0aGlzLl9fdHJhbnNwb3J0O1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIHNwZWVkID0gdHJhbnNwb3J0Ll9fc3BlZWQ7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IHRyYW5zcG9ydC5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgd2hpbGUgKG5leHRUaW1lIDw9IHRpbWUpIHtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRyYW5zcG9ydC5hZHZhbmNlUG9zaXRpb24obmV4dFRpbWUsIG5leHRQb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gbmV4dFRpbWU7XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICB2YXIgdGltZSA9IHRyYW5zcG9ydC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFRyYW5zcG9ydCBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc3BvcnQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgZGVmYXVsdEF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkID0gW107XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyKHRoaXMuYXVkaW9Db250ZXh0KTtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxpbmdRdWV1ZSh0aGlzKTtcblxuICAgIC8vIHN5bmNyb25pemVkIHRpbWUsIHBvc2l0aW9uLCBhbmQgc3BlZWRcbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuICB9XG5cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBudW1UcmFuc3BvcnRlZEVuZ2luZXMgPSB0aGlzLl9fdHJhbnNwb3J0ZWQubGVuZ3RoO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB2YXIgZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb247XG5cbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmNsZWFyKCk7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBudW1UcmFuc3BvcnRlZEVuZ2luZXMgLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24sIGZhbHNlKTsgLy8gaW5zZXJ0IGJ1dCBkb24ndCBzb3J0XG4gICAgICB9XG5cbiAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFswXTtcbiAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbiwgdHJ1ZSk7IC8vIGluc2VydCBhbmQgc29ydFxuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgdHJhbnNwb3J0IHBvc2l0aW9uXG4gICAqL1xuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcblxuICAgIHJldHVybiB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS50aW1lO1xuXG4gICAgd2hpbGUgKG5leHRQb3NpdGlvbiA9PT0gcG9zaXRpb24pIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5oZWFkO1xuICAgICAgdmFyIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgaWYgKCgoc3BlZWQgPiAwICYmIG5leHRFbmdpbmVQb3NpdGlvbiA+IHBvc2l0aW9uKSB8fCAoc3BlZWQgPCAwICYmIG5leHRFbmdpbmVQb3NpdGlvbiA8IHBvc2l0aW9uKSkgJiZcbiAgICAgICAgKG5leHRFbmdpbmVQb3NpdGlvbiA8IEluZmluaXR5ICYmIG5leHRFbmdpbmVQb3NpdGlvbiA+IC1JbmZpbml0eSkpIHtcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUoZW5naW5lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uO1xuXG4gICAgICAvLyByZXN5bmMgdHJhbnNwb3J0ZWQgZW5naW5lc1xuICAgICAgaWYgKHNlZWsgfHwgc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAgIC8vIHNlZWsgb3IgcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdGFydFxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoYW5nZSBzcGVlZCB3aXRob3V0IHJldmVyc2luZyBkaXJlY3Rpb25cbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgZW5naW5lIHRvIGJlIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHN0YXJ0IHBvc2l0aW9uXG4gICAqL1xuICBhZGQoZW5naW5lLCBzdGFydFBvc2l0aW9uID0gMCwgZW5kUG9zaXRpb24gPSBJbmZpbml0eSwgb2Zmc2V0UG9zaXRpb24gPSAwKSB7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gbnVsbDtcblxuICAgIGlmIChvZmZzZXRQb3NpdGlvbiA9PT0gLUluZmluaXR5KVxuICAgICAgb2Zmc2V0UG9zaXRpb24gPSAwO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGlmIChlbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKCkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBhIHRyYW5zcG9ydFwiKTtcblxuICAgIGlmICh0cmFuc3BvcnRlZCkge1xuICAgICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgICBhZGREdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lLCB0cmFuc3BvcnRlZCk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICB2YXIgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQodHJhbnNwb3J0ZWQsIG5leHRFbmdpbmVQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zcG9ydGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHRpbWUgZW5naW5lIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge29iamVjdH0gZW5naW5lT3JUcmFuc3BvcnRlZCBlbmdpbmUgb3IgdHJhbnNwb3J0ZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIHJlbW92ZShlbmdpbmVPclRyYW5zcG9ydGVkKSB7XG4gICAgdmFyIGVuZ2luZSA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gcmVtb3ZlRHVwbGV0KHRoaXMuX19lbmdpbmVzLCB0aGlzLl9fdHJhbnNwb3J0ZWQsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuXG4gICAgaWYgKCF0cmFuc3BvcnRlZCkge1xuICAgICAgZW5naW5lID0gcmVtb3ZlRHVwbGV0KHRoaXMuX190cmFuc3BvcnRlZCwgdGhpcy5fX2VuZ2luZXMsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuICAgICAgdHJhbnNwb3J0ZWQgPSBlbmdpbmVPclRyYW5zcG9ydGVkO1xuICAgIH1cblxuICAgIGlmIChlbmdpbmUgJiYgdHJhbnNwb3J0ZWQpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgdHJhbnNwb3J0XCIpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24odHJhbnNwb3J0ZWQsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZClcbiAgICAgICAgcG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUodHJhbnNwb3J0ZWQsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRpbWUgZW5naW5lcyBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuc3luY1NwZWVkKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCAwKTtcblxuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19