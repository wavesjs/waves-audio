"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");
var PriorityQueue = require("../utils/priority-queue");

var _require = require("./factories");

var getScheduler = _require.getScheduler;

function removeCouple(firstArray, secondArray, firstElement) {
  var index = firstArray.indexOf(firstElement);

  if (index >= 0) {
    var secondElement = secondArray[index];

    firstArray.splice(index, 1);
    secondArray.splice(index, 1);

    return secondElement;
  }

  return null;
}

var Transported = (function (TimeEngine) {
  function Transported(transport, engine, startPosition, endPosition, offsetPosition) {
    _babelHelpers.classCallCheck(this, Transported);

    this.__transport = transport;
    this.__engine = engine;
    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.__scalePosition = 1;
    this.__haltPosition = Infinity; // engine's next halt position when not running (is null when engine hes been started)
  }

  _babelHelpers.inherits(Transported, TimeEngine);

  _babelHelpers.prototypeProperties(Transported, null, {
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
          _this.resetNextPosition();
        })();
      },
      writable: true,
      configurable: true
    },
    start: {
      value: function start(time, position, speed) {},
      writable: true,
      configurable: true
    },
    stop: {
      value: function stop(time, position) {},
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
    },
    syncSpeed: {
      value: function syncSpeed(time, position, speed) {
        if (speed === 0) this.stop(time, position - this.__offsetPosition);
      },
      writable: true,
      configurable: true
    },
    destroy: {
      value: function destroy() {
        this.__transport = null;
        this.__engine = null;
      },
      writable: true,
      configurable: true
    }
  });

  return Transported;
})(TimeEngine);

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position

var TransportedTransported = (function (Transported) {
  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {
    var _this = this;

    _babelHelpers.classCallCheck(this, TransportedTransported);

    _babelHelpers.get(_core.Object.getPrototypeOf(TransportedTransported.prototype), "constructor", this).call(this, transport, engine, startPosition, endPosition, offsetPosition);

    engine.setTransported(this, function () {
      var nextEnginePosition = arguments[0] === undefined ? null : arguments[0];

      // resetNextPosition
      if (nextEnginePosition !== null) nextEnginePosition += _this.__offsetPosition;

      _this.resetNextPosition(nextEnginePosition);
    }, function () {
      // getCurrentTime
      return _this.__transport.scheduler.currentTime;
    }, function () {
      // get currentPosition
      return _this.__transport.currentPosition - _this.__offsetPosition;
    });
  }

  _babelHelpers.inherits(TransportedTransported, Transported);

  _babelHelpers.prototypeProperties(TransportedTransported, null, {
    syncPosition: {
      value: function syncPosition(time, position, speed) {
        if (speed > 0 && position < this.__endPosition) position = Math.max(position, this.__startPosition);else if (speed < 0 && position >= this.__startPosition) position = Math.min(position, this.__endPosition);

        return this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
      },
      writable: true,
      configurable: true
    },
    advancePosition: {
      value: function advancePosition(time, position, speed) {
        position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

        if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition) {
          return position;
        }return Infinity;
      },
      writable: true,
      configurable: true
    },
    syncSpeed: {
      value: function syncSpeed(time, position, speed) {
        if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, speed);
      },
      writable: true,
      configurable: true
    },
    destroy: {
      value: function destroy() {
        this.__engine.resetInterface();
        _babelHelpers.get(_core.Object.getPrototypeOf(TransportedTransported.prototype), "destroy", this).call(this);
      },
      writable: true,
      configurable: true
    }
  });

  return TransportedTransported;
})(Transported);

// TransportedSpeedControlled has to start and stop the speed-controlled engines
// when the transport hits the engine's start and end position

var TransportedSpeedControlled = (function (Transported) {
  function TransportedSpeedControlled(transport, engine, startPosition, endPosition, offsetPosition) {
    var _this = this;

    _babelHelpers.classCallCheck(this, TransportedSpeedControlled);

    _babelHelpers.get(_core.Object.getPrototypeOf(TransportedSpeedControlled.prototype), "constructor", this).call(this, transport, engine, startPosition, endPosition, offsetPosition);

    engine.setSpeedControlled(this, function () {
      // getCurrentTime
      return _this.__transport.scheduler.currentTime;
    }, function () {
      // get currentPosition
      return _this.__transport.currentPosition - _this.__offsetPosition;
    });
  }

  _babelHelpers.inherits(TransportedSpeedControlled, Transported);

  _babelHelpers.prototypeProperties(TransportedSpeedControlled, null, {
    start: {
      value: function start(time, position, speed) {
        this.__engine.syncSpeed(time, position, speed, true);
      },
      writable: true,
      configurable: true
    },
    stop: {
      value: function stop(time, position) {
        this.__engine.syncSpeed(time, position, 0);
      },
      writable: true,
      configurable: true
    },
    syncSpeed: {
      value: function syncSpeed(time, position, speed) {
        if (this.__haltPosition === null) // engine is active
          this.__engine.syncSpeed(time, position, speed);
      },
      writable: true,
      configurable: true
    },
    destroy: {
      value: function destroy() {
        this.__engine.syncSpeed(this.__transport.currentTime, this.__transport.currentPosition - this.__offsetPosition, 0);
        this.__engine.resetInterface();
        _babelHelpers.get(_core.Object.getPrototypeOf(TransportedSpeedControlled.prototype), "destroy", this).call(this);
      },
      writable: true,
      configurable: true
    }
  });

  return TransportedSpeedControlled;
})(Transported);

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position

var TransportedScheduled = (function (Transported) {
  function TransportedScheduled(transport, engine, startPosition, endPosition, offsetPosition) {
    var _this = this;

    _babelHelpers.classCallCheck(this, TransportedScheduled);

    _babelHelpers.get(_core.Object.getPrototypeOf(TransportedScheduled.prototype), "constructor", this).call(this, transport, engine, startPosition, endPosition, offsetPosition);

    this.__transport.scheduler.add(engine, Infinity, function () {
      // get currentPosition
      return (_this.__transport.currentPosition - _this.__offsetPosition) * _this.__scalePosition;
    });
  }

  _babelHelpers.inherits(TransportedScheduled, Transported);

  _babelHelpers.prototypeProperties(TransportedScheduled, null, {
    start: {
      value: function start(time, position, speed) {
        this.__engine.resetNextTime(time);
      },
      writable: true,
      configurable: true
    },
    stop: {
      value: function stop(time, position) {
        this.__engine.resetNextTime(Infinity);
      },
      writable: true,
      configurable: true
    },
    destroy: {
      value: function destroy() {
        this.__transport.scheduler.remove(this.__engine);
        _babelHelpers.get(_core.Object.getPrototypeOf(TransportedScheduled.prototype), "destroy", this).call(this);
      },
      writable: true,
      configurable: true
    }
  });

  return TransportedScheduled;
})(Transported);

var TransportSchedulerHook = (function (TimeEngine) {
  function TransportSchedulerHook(transport) {
    _babelHelpers.classCallCheck(this, TransportSchedulerHook);

    _babelHelpers.get(_core.Object.getPrototypeOf(TransportSchedulerHook.prototype), "constructor", this).call(this);
    this.__transport = transport;
  }

  _babelHelpers.inherits(TransportSchedulerHook, TimeEngine);

  _babelHelpers.prototypeProperties(TransportSchedulerHook, null, {
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        var transport = this.__transport;
        var position = transport.__getPositionAtTime(time);
        var nextPosition = transport.advancePosition(time, position, transport.__speed);

        if (nextPosition !== Infinity) {
          return transport.__getTimeAtPosition(nextPosition);
        }return Infinity;
      },
      writable: true,
      configurable: true
    }
  });

  return TransportSchedulerHook;
})(TimeEngine);

/**
 * xxx
 *
 *
 */

var Transport = (function (TimeEngine) {
  function Transport(audioContext) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _babelHelpers.classCallCheck(this, Transport);

    _babelHelpers.get(_core.Object.getPrototypeOf(Transport.prototype), "constructor", this).call(this, audioContext);

    // future assignment
    // this.scheduler = waves.getScheduler(audioContext);
    // this.scheduler = require("scheduler");
    // test
    this.scheduler = getScheduler(this.audioContext);

    this.__engines = [];
    this.__transported = [];

    this.__schedulerHook = null;
    this.__transportQueue = new PriorityQueue();

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;
  }

  _babelHelpers.inherits(Transport, TimeEngine);

  _babelHelpers.prototypeProperties(Transport, null, {
    __getPositionAtTime: {
      value: function __getPositionAtTime(time) {
        return this.__position + (time - this.__time) * this.__speed;
      },
      writable: true,
      configurable: true
    },
    __getTimeAtPosition: {
      value: function __getTimeAtPosition(position) {
        return this.__time + (position - this.__position) / this.__speed;
      },
      writable: true,
      configurable: true
    },
    __syncTransportedPosition: {
      value: function __syncTransportedPosition(time, position, speed) {
        var numTransportedEngines = this.__transported.length;
        var nextPosition = Infinity;

        if (numTransportedEngines > 0) {
          var engine, nextEnginePosition;

          this.__transportQueue.clear();
          this.__transportQueue.reverse = speed < 0;

          for (var i = numTransportedEngines - 1; i > 0; i--) {
            engine = this.__transported[i];
            nextEnginePosition = engine.syncPosition(time, position, speed);
            this.__transportQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
          }

          engine = this.__transported[0];
          nextEnginePosition = engine.syncPosition(time, position, speed);
          nextPosition = this.__transportQueue.insert(engine, nextEnginePosition, true); // insert and sort
        }

        return nextPosition;
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
    },
    currentTime: {

      /**
       * Get current master time
       * @return {Number} current time
       *
       * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
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
       * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
       */

      get: function () {
        return this.__position + (this.scheduler.currentTime - this.__time) * this.__speed;
      },
      configurable: true
    },
    resetNextPosition: {

      /**
       * Reset next transport position
       * @param {Number} next transport position
       *
       * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
       */

      value: function resetNextPosition(nextPosition) {
        if (this.__schedulerHook) this.__schedulerHook.resetNextTime(this.__getTimeAtPosition(nextPosition));

        this.__nextPosition = nextPosition;
      },
      writable: true,
      configurable: true
    },
    syncPosition: {

      // TimeEngine method (transported interface)

      value: function syncPosition(time, position, speed) {
        this.__time = time;
        this.__position = position;
        this.__speed = speed;

        return this.__syncTransportedPosition(time, position, speed);
      },
      writable: true,
      configurable: true
    },
    advancePosition: {

      // TimeEngine method (transported interface)

      value: function advancePosition(time, position, speed) {
        var nextEngine = this.__transportQueue.head;
        var nextEnginePosition = nextEngine.advancePosition(time, position, speed);

        this.__nextPosition = this.__transportQueue.move(nextEngine, nextEnginePosition);

        return this.__nextPosition;
      },
      writable: true,
      configurable: true
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
          var nextPosition = this.__nextPosition;

          // resync transported engines
          if (seek || speed * lastSpeed < 0) {
            // seek or reverse direction
            nextPosition = this.__syncTransportedPosition(time, position, speed);
          } else if (lastSpeed === 0) {
            // start
            nextPosition = this.__syncTransportedPosition(time, position, speed);

            // schedule transport itself
            this.__schedulerHook = new TransportSchedulerHook(this);
            this.scheduler.add(this.__schedulerHook, Infinity);
          } else if (speed === 0) {
            // stop
            nextPosition = Infinity;

            this.__syncTransportedSpeed(time, position, 0);

            // unschedule transport itself
            this.scheduler.remove(this.__schedulerHook);
            delete this.__schedulerHook;
          } else {
            // change speed without reversing direction
            this.__syncTransportedSpeed(time, position, speed);
          }

          this.resetNextPosition(nextPosition);
        }
      },
      writable: true,
      configurable: true
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

            _this.__engines.push(engine);
            _this.__transported.push(transported);

            transported.setTransported(_this, function () {
              var nextEnginePosition = arguments[0] === undefined ? null : arguments[0];

              // resetNextPosition
              var speed = _this.__speed;

              if (speed !== 0) {
                if (nextEnginePosition === null) nextEnginePosition = transported.syncPosition(_this.currentTime, _this.currentPosition, speed);

                var nextPosition = _this.__transportQueue.move(transported, nextEnginePosition);
                _this.resetNextPosition(nextPosition);
              }
            }, function () {
              // getCurrentTime
              return _this.__transport.scheduler.currentTime;
            }, function () {
              // get currentPosition
              return _this.__transport.currentPosition - _this.__offsetPosition;
            });

            if (speed !== 0) {
              // sync and start
              var nextEnginePosition = transported.syncPosition(_this.currentTime, _this.currentPosition, speed);
              var nextPosition = _this.__transportQueue.insert(transported, nextEnginePosition);

              _this.resetNextPosition(nextPosition);
            }
          }

          return transported;
        })();
      },
      writable: true,
      configurable: true
    },
    remove: {

      /**
       * Remove a time engine from the transport
       * @param {object} engineOrTransported engine or transported to be removed from the transport
       */

      value: function remove(engineOrTransported) {
        var engine = engineOrTransported;
        var transported = removeCouple(this.__engines, this.__transported, engineOrTransported);

        if (!transported) {
          engine = removeCouple(this.__transported, this.__engines, engineOrTransported);
          transported = engineOrTransported;
        }

        if (engine && transported) {
          var nextPosition = this.__transportQueue.remove(transported);

          transported.resetInterface();
          transported.destroy();

          if (this.__speed !== 0) this.resetNextPosition(nextPosition);
        } else {
          throw new Error("object has not been added to this transport");
        }
      },
      writable: true,
      configurable: true
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

            transported.resetInterface();
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
      },
      writable: true,
      configurable: true
    }
  });

  return Transport;
})(TimeEngine);

module.exports = Transport;
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class (time-engine master), provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDaEQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7O2VBQ2hDLE9BQU8sQ0FBQyxhQUFhLENBQUM7O0lBQXZDLFlBQVksWUFBWixZQUFZOztBQUVsQixTQUFTLFlBQVksQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRTtBQUMzRCxNQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUU3QyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxRQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXZDLGNBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzVCLGVBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUU3QixXQUFPLGFBQWEsQ0FBQztHQUN0Qjs7QUFFRCxTQUFPLElBQUksQ0FBQztDQUNiOztJQUVLLFdBQVcsY0FBUyxVQUFVO0FBQ3ZCLFdBRFAsV0FBVyxDQUNILFNBQVMsRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxjQUFjO3VDQURyRSxXQUFXOztBQUViLFFBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxlQUFlLEdBQUcsYUFBYSxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxhQUFhLEdBQUcsV0FBVyxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxjQUFjLENBQUM7QUFDdkMsUUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDekIsUUFB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LE9BQU8sRUFBRSxDQUFDO1dBQ3ZCOzs7Ozs7Ozs7Ozs7Ozs7T0FDRjs7Ozs7O1NBelBHLFNBQVM7R0FBUyxVQUFVOztBQTRQbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoic3JjL3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBhdWRpbyB0cmFuc3BvcnQgY2xhc3MgKHRpbWUtZW5naW5lIG1hc3RlciksIHByb3ZpZGVzIHN5bmNocm9uaXplZCBzY2hlZHVsaW5nIG9mIHRpbWUgZW5naW5lc1xuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFRpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS90aW1lLWVuZ2luZVwiKTtcbnZhciBQcmlvcml0eVF1ZXVlID0gcmVxdWlyZShcIi4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlXCIpO1xudmFyIHsgZ2V0U2NoZWR1bGVyIH0gPSByZXF1aXJlKCcuL2ZhY3RvcmllcycpO1xuXG5mdW5jdGlvbiByZW1vdmVDb3VwbGUoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCkge1xuICB2YXIgaW5kZXggPSBmaXJzdEFycmF5LmluZGV4T2YoZmlyc3RFbGVtZW50KTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIHZhciBzZWNvbmRFbGVtZW50ID0gc2Vjb25kQXJyYXlbaW5kZXhdO1xuXG4gICAgZmlyc3RBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHNlY29uZEFycmF5LnNwbGljZShpbmRleCwgMSk7XG5cbiAgICByZXR1cm4gc2Vjb25kRWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5jbGFzcyBUcmFuc3BvcnRlZCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSBlbmRQb3NpdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBvZmZzZXRQb3NpdGlvbjtcbiAgICB0aGlzLl9fc2NhbGVQb3NpdGlvbiA9IDE7XG4gICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IEluZmluaXR5OyAvLyBlbmdpbmUncyBuZXh0IGhhbHQgcG9zaXRpb24gd2hlbiBub3QgcnVubmluZyAoaXMgbnVsbCB3aGVuIGVuZ2luZSBoZXMgYmVlbiBzdGFydGVkKVxuICB9XG5cbiAgc2V0Qm91bmRhcmllcyhzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uLCBzY2FsZVBvc2l0aW9uID0gMSkge1xuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbjtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSBlbmRQb3NpdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBvZmZzZXRQb3NpdGlvbjtcbiAgICB0aGlzLl9fc2NhbGVQb3NpdGlvbiA9IHNjYWxlUG9zaXRpb247XG4gICAgdGhpcy5yZXNldE5leHRQb3NpdGlvbigpO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7fVxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7fVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPCB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuXG4gICAgICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IHRoaXMuX19lbmRQb3NpdGlvbjtcblxuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uIDw9IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7IC8vIGVuZ2luZSBpcyBhY3RpdmVcblxuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zaXRpb24gPj0gdGhpcy5fX2VuZFBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IHRoaXMuX19zdGFydFBvc2l0aW9uO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID4gdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBudWxsOyAvLyBlbmdpbmUgaXMgYWN0aXZlXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaGFsdFBvc2l0aW9uID0gdGhpcy5fX2hhbHRQb3NpdGlvbjtcblxuICAgIGlmIChoYWx0UG9zaXRpb24gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7XG5cbiAgICAgIHJldHVybiBoYWx0UG9zaXRpb247XG4gICAgfVxuXG4gICAgLy8gc3RvcCBlbmdpbmVcbiAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID09PSAwKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWQgaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lc1xuLy8gd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcblxuICAgIGVuZ2luZS5zZXRUcmFuc3BvcnRlZCh0aGlzLCAobmV4dEVuZ2luZVBvc2l0aW9uID0gbnVsbCkgPT4ge1xuICAgICAgLy8gcmVzZXROZXh0UG9zaXRpb25cbiAgICAgIGlmIChuZXh0RW5naW5lUG9zaXRpb24gIT09IG51bGwpXG4gICAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICAgIHRoaXMucmVzZXROZXh0UG9zaXRpb24obmV4dEVuZ2luZVBvc2l0aW9uKTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBnZXRDdXJyZW50VGltZVxuICAgICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICAgIH0sICgpID0+IHtcbiAgICAgIC8vIGdldCBjdXJyZW50UG9zaXRpb25cbiAgICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcbiAgICB9KTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1heChwb3NpdGlvbiwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5taW4ocG9zaXRpb24sIHRoaXMuX19lbmRQb3NpdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBwb3NpdGlvbiA9IHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uIHx8IHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLnJlc2V0SW50ZXJmYWNlKCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkIGhhcyB0byBzdGFydCBhbmQgc3RvcCB0aGUgc3BlZWQtY29udHJvbGxlZCBlbmdpbmVzXG4vLyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcblxuICAgIGVuZ2luZS5zZXRTcGVlZENvbnRyb2xsZWQodGhpcywgKCkgPT4ge1xuICAgICAgLy8gZ2V0Q3VycmVudFRpbWVcbiAgICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0LnNjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgICB9LCAoKSA9PiB7XG4gICAgICAvLyBnZXQgY3VycmVudFBvc2l0aW9uXG4gICAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG4gICAgfSk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHRydWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbCkgLy8gZW5naW5lIGlzIGFjdGl2ZVxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50VGltZSwgdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIDApO1xuICAgIHRoaXMuX19lbmdpbmUucmVzZXRJbnRlcmZhY2UoKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWQgaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lc1xuLy8gd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU2NoZWR1bGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9fdHJhbnNwb3J0LnNjaGVkdWxlci5hZGQoZW5naW5lLCBJbmZpbml0eSwgKCkgPT4ge1xuICAgICAgLy8gZ2V0IGN1cnJlbnRQb3NpdGlvblxuICAgICAgcmV0dXJuICh0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbikgKiB0aGlzLl9fc2NhbGVQb3NpdGlvbjtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUucmVzZXROZXh0VGltZSh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLl9fZW5naW5lLnJlc2V0TmV4dFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0LnNjaGVkdWxlci5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICB2YXIgcG9zaXRpb24gPSB0cmFuc3BvcnQuX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKTtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gdHJhbnNwb3J0LmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgdHJhbnNwb3J0Ll9fc3BlZWQpO1xuXG4gICAgaWYgKG5leHRQb3NpdGlvbiAhPT0gSW5maW5pdHkpXG4gICAgICByZXR1cm4gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxufVxuXG4vKipcbiAqIHh4eFxuICpcbiAqXG4gKi9cbmNsYXNzIFRyYW5zcG9ydCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihhdWRpb0NvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKGF1ZGlvQ29udGV4dCk7XG5cbiAgICAvLyBmdXR1cmUgYXNzaWdubWVudFxuICAgIC8vIHRoaXMuc2NoZWR1bGVyID0gd2F2ZXMuZ2V0U2NoZWR1bGVyKGF1ZGlvQ29udGV4dCk7XG4gICAgLy8gdGhpcy5zY2hlZHVsZXIgPSByZXF1aXJlKFwic2NoZWR1bGVyXCIpO1xuICAgIC8vIHRlc3RcbiAgICB0aGlzLnNjaGVkdWxlciA9IGdldFNjaGVkdWxlcih0aGlzLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fZW5naW5lcyA9IFtdO1xuICAgIHRoaXMuX190cmFuc3BvcnRlZCA9IFtdO1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBudWxsO1xuICAgIHRoaXMuX190cmFuc3BvcnRRdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlKCk7XG5cbiAgICAvLyBzeW5jcm9uaXplZCB0aW1lLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgfVxuXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgbnVtVHJhbnNwb3J0ZWRFbmdpbmVzID0gdGhpcy5fX3RyYW5zcG9ydGVkLmxlbmd0aDtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICBpZiAobnVtVHJhbnNwb3J0ZWRFbmdpbmVzID4gMCkge1xuICAgICAgdmFyIGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uO1xuXG4gICAgICB0aGlzLl9fdHJhbnNwb3J0UXVldWUuY2xlYXIoKTtcbiAgICAgIHRoaXMuX190cmFuc3BvcnRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBudW1UcmFuc3BvcnRlZEVuZ2luZXMgLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0UXVldWUuaW5zZXJ0KGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uLCBmYWxzZSk7IC8vIGluc2VydCBidXQgZG9uJ3Qgc29ydFxuICAgICAgfVxuXG4gICAgICBlbmdpbmUgPSB0aGlzLl9fdHJhbnNwb3J0ZWRbMF07XG4gICAgICBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0UXVldWUuaW5zZXJ0KGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uLCB0cnVlKTsgLy8gaW5zZXJ0IGFuZCBzb3J0XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgZm9yICh2YXIgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHRpbWVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydCBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgdHJhbnNwb3J0IHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICByZXNldE5leHRQb3NpdGlvbihuZXh0UG9zaXRpb24pIHtcbiAgICBpZiAodGhpcy5fX3NjaGVkdWxlckhvb2spXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldE5leHRUaW1lKHRoaXMuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgcmV0dXJuIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBuZXh0RW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydFF1ZXVlLmhlYWQ7XG4gICAgdmFyIG5leHRFbmdpbmVQb3NpdGlvbiA9IG5leHRFbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydFF1ZXVlLm1vdmUobmV4dEVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcblxuICAgICAgLy8gcmVzeW5jIHRyYW5zcG9ydGVkIGVuZ2luZXNcbiAgICAgIGlmIChzZWVrIHx8IHNwZWVkICogbGFzdFNwZWVkIDwgMCkge1xuICAgICAgICAvLyBzZWVrIG9yIHJldmVyc2UgZGlyZWN0aW9uXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgLy8gc2NoZWR1bGUgdHJhbnNwb3J0IGl0c2VsZlxuICAgICAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rKHRoaXMpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQodGhpcy5fX3NjaGVkdWxlckhvb2ssIEluZmluaXR5KTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuXG4gICAgICAgIC8vIHVuc2NoZWR1bGUgdHJhbnNwb3J0IGl0c2VsZlxuICAgICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUodGhpcy5fX3NjaGVkdWxlckhvb2spO1xuICAgICAgICBkZWxldGUgdGhpcy5fX3NjaGVkdWxlckhvb2s7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGFuZ2Ugc3BlZWQgd2l0aG91dCByZXZlcnNpbmcgZGlyZWN0aW9uXG4gICAgICAgIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlc2V0TmV4dFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVuZ2luZSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gc3RhcnQgcG9zaXRpb25cbiAgICovXG4gIGFkZChlbmdpbmUsIHN0YXJ0UG9zaXRpb24gPSAtSW5maW5pdHksIGVuZFBvc2l0aW9uID0gSW5maW5pdHksIG9mZnNldFBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbikge1xuICAgIHZhciB0cmFuc3BvcnRlZCA9IG51bGw7XG5cbiAgICBpZiAob2Zmc2V0UG9zaXRpb24gPT09IC1JbmZpbml0eSlcbiAgICAgIG9mZnNldFBvc2l0aW9uID0gMDtcblxuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZCgpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoZW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTY2hlZHVsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gYSB0cmFuc3BvcnRcIik7XG5cbiAgICBpZiAodHJhbnNwb3J0ZWQpIHtcbiAgICAgIHZhciBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgICAgdGhpcy5fX2VuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgICAgdGhpcy5fX3RyYW5zcG9ydGVkLnB1c2godHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5zZXRUcmFuc3BvcnRlZCh0aGlzLCAobmV4dEVuZ2luZVBvc2l0aW9uID0gbnVsbCkgPT4ge1xuICAgICAgICAvLyByZXNldE5leHRQb3NpdGlvblxuICAgICAgICB2YXIgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICAgICAgaWYgKG5leHRFbmdpbmVQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgICAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiA9IHRyYW5zcG9ydGVkLnN5bmNQb3NpdGlvbih0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLmN1cnJlbnRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRRdWV1ZS5tb3ZlKHRyYW5zcG9ydGVkLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgICAgICAgIHRoaXMucmVzZXROZXh0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAvLyBnZXRDdXJyZW50VGltZVxuICAgICAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIC8vIGdldCBjdXJyZW50UG9zaXRpb25cbiAgICAgICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICB2YXIgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0UXVldWUuaW5zZXJ0KHRyYW5zcG9ydGVkLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMucmVzZXROZXh0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBlbmdpbmVPclRyYW5zcG9ydGVkIGVuZ2luZSBvciB0cmFuc3BvcnRlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZU9yVHJhbnNwb3J0ZWQpIHtcbiAgICB2YXIgZW5naW5lID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICB2YXIgdHJhbnNwb3J0ZWQgPSByZW1vdmVDb3VwbGUodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG5cbiAgICBpZiAoIXRyYW5zcG9ydGVkKSB7XG4gICAgICBlbmdpbmUgPSByZW1vdmVDb3VwbGUodGhpcy5fX3RyYW5zcG9ydGVkLCB0aGlzLl9fZW5naW5lcywgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG4gICAgICB0cmFuc3BvcnRlZCA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZSAmJiB0cmFuc3BvcnRlZCkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5yZXNldEludGVyZmFjZSgpO1xuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLnJlc2V0TmV4dFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyB0cmFuc3BvcnRcIik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGltZSBlbmdpbmVzIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zeW5jU3BlZWQodGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIDApO1xuXG4gICAgZm9yICh2YXIgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKSB7XG4gICAgICB0cmFuc3BvcnRlZC5yZXNldEludGVyZmFjZSgpO1xuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zcG9ydDsiXX0=