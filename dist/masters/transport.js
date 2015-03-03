"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");
var PriorityQueue = require("../utils/priority-queue");
var defaultAudioContext = require("../core/audio-context");

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
  function Transport() {
    var options = arguments[0] === undefined ? {} : arguments[0];
    var audioContext = arguments[1] === undefined ? defaultAudioContext : arguments[1];

    _babelHelpers.classCallCheck(this, Transport);

    _babelHelpers.get(_core.Object.getPrototypeOf(Transport.prototype), "constructor", this).call(this, audioContext);

    // future assignment
    // this.scheduler = waves.getScheduler(audioContext);
    // this.scheduler = require("scheduler");
    // test
    this.scheduler = require("./factories").getScheduler(audioContext);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDaEQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDdkQsSUFBSSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQzs7QUFFM0QsU0FBUyxZQUFZLENBQUMsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUU7QUFDM0QsTUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFN0MsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsUUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2QyxjQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QixlQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFN0IsV0FBTyxhQUFhLENBQUM7R0FDdEI7O0FBRUQsU0FBTyxJQUFJLENBQUM7Q0FDYjs7SUFFSyxXQUFXLGNBQVMsVUFBVTtBQUN2QixXQURQLFdBQVcsQ0FDSCxTQUFTLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsY0FBYzt1Q0FEckUsV0FBVzs7QUFFYixRQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUM3QixRQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQztBQUN2QixRQUFJLENBQUMsZUFBZSxHQUFHLGFBQWEsQ0FBQztBQUNyQyxRQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQztBQUNqQyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsY0FBYyxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ3pCLFFB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QWMsRUFBRSxDQUFDO0FBQzdCLHVCQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7V0FDdkI7Ozs7Ozs7Ozs7Ozs7OztPQUNGOzs7Ozs7U0F6UEcsU0FBUztHQUFTLFVBQVU7O0FBNFBsQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyIsImZpbGUiOiJzcmMvdXRpbHMvcHJpb3JpdHktcXVldWUuZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogd3JpdHRlbiBpbiBFQ01Bc2NyaXB0IDYgKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIGF1ZGlvIHRyYW5zcG9ydCBjbGFzcyAodGltZS1lbmdpbmUgbWFzdGVyKSwgcHJvdmlkZXMgc3luY2hyb25pemVkIHNjaGVkdWxpbmcgb2YgdGltZSBlbmdpbmVzXG4gKiBAYXV0aG9yIE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mciwgVmljdG9yLlNhaXpAaXJjYW0uZnIsIEthcmltLkJhcmthdGlAaXJjYW0uZnJcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xudmFyIFByaW9yaXR5UXVldWUgPSByZXF1aXJlKFwiLi4vdXRpbHMvcHJpb3JpdHktcXVldWVcIik7XG52YXIgZGVmYXVsdEF1ZGlvQ29udGV4dCA9IHJlcXVpcmUoXCIuLi9jb3JlL2F1ZGlvLWNvbnRleHRcIik7XG5cbmZ1bmN0aW9uIHJlbW92ZUNvdXBsZShmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZmlyc3RFbGVtZW50KSB7XG4gIHZhciBpbmRleCA9IGZpcnN0QXJyYXkuaW5kZXhPZihmaXJzdEVsZW1lbnQpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgdmFyIHNlY29uZEVsZW1lbnQgPSBzZWNvbmRBcnJheVtpbmRleF07XG5cbiAgICBmaXJzdEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgc2Vjb25kQXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHJldHVybiBzZWNvbmRFbGVtZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmNsYXNzIFRyYW5zcG9ydGVkIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9IGVuZFBvc2l0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IG9mZnNldFBvc2l0aW9uO1xuICAgIHRoaXMuX19zY2FsZVBvc2l0aW9uID0gMTtcbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7IC8vIGVuZ2luZSdzIG5leHQgaGFsdCBwb3NpdGlvbiB3aGVuIG5vdCBydW5uaW5nIChpcyBudWxsIHdoZW4gZW5naW5lIGhlcyBiZWVuIHN0YXJ0ZWQpXG4gIH1cblxuICBzZXRCb3VuZGFyaWVzKHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbiA9IHN0YXJ0UG9zaXRpb24sIHNjYWxlUG9zaXRpb24gPSAxKSB7XG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydFBvc2l0aW9uO1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9IGVuZFBvc2l0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IG9mZnNldFBvc2l0aW9uO1xuICAgIHRoaXMuX19zY2FsZVBvc2l0aW9uID0gc2NhbGVQb3NpdGlvbjtcbiAgICB0aGlzLnJlc2V0TmV4dFBvc2l0aW9uKCk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHt9XG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHt9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGlmIChwb3NpdGlvbiA8IHRoaXMuX19zdGFydFBvc2l0aW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gdGhpcy5fX2VuZFBvc2l0aW9uO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPD0gdGhpcy5fX2VuZFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gbnVsbDsgLy8gZW5naW5lIGlzIGFjdGl2ZVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwb3NpdGlvbiA+PSB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPiB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7IC8vIGVuZ2luZSBpcyBhY3RpdmVcblxuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBoYWx0UG9zaXRpb24gPSB0aGlzLl9faGFsdFBvc2l0aW9uO1xuXG4gICAgaWYgKGhhbHRQb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGhhbHRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvLyBzdG9wIGVuZ2luZVxuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPT09IDApXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNjaGVkdWxlZCBoYXMgdG8gc3dpdGNoIG9uIGFuZCBvZmYgdGhlIHNjaGVkdWxlZCBlbmdpbmVzXG4vLyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgZW5naW5lLnNldFRyYW5zcG9ydGVkKHRoaXMsIChuZXh0RW5naW5lUG9zaXRpb24gPSBudWxsKSA9PiB7XG4gICAgICAvLyByZXNldE5leHRQb3NpdGlvblxuICAgICAgaWYgKG5leHRFbmdpbmVQb3NpdGlvbiAhPT0gbnVsbClcbiAgICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uICs9IHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcblxuICAgICAgdGhpcy5yZXNldE5leHRQb3NpdGlvbihuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgIH0sICgpID0+IHtcbiAgICAgIC8vIGdldEN1cnJlbnRUaW1lXG4gICAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgfSwgKCkgPT4ge1xuICAgICAgLy8gZ2V0IGN1cnJlbnRQb3NpdGlvblxuICAgICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuICAgIH0pO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IE1hdGgubWF4KHBvc2l0aW9uLCB0aGlzLl9fc3RhcnRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1pbihwb3NpdGlvbiwgdGhpcy5fX2VuZFBvc2l0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gKyB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHBvc2l0aW9uID0gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24gfHwgc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZClcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19lbmdpbmUucmVzZXRJbnRlcmZhY2UoKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQgaGFzIHRvIHN0YXJ0IGFuZCBzdG9wIHRoZSBzcGVlZC1jb250cm9sbGVkIGVuZ2luZXNcbi8vIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgZW5naW5lLnNldFNwZWVkQ29udHJvbGxlZCh0aGlzLCAoKSA9PiB7XG4gICAgICAvLyBnZXRDdXJyZW50VGltZVxuICAgICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICAgIH0sICgpID0+IHtcbiAgICAgIC8vIGdldCBjdXJyZW50UG9zaXRpb25cbiAgICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgdHJ1ZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKSAvLyBlbmdpbmUgaXMgYWN0aXZlXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRUaW1lLCB0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgMCk7XG4gICAgdGhpcy5fX2VuZ2luZS5yZXNldEludGVyZmFjZSgpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNjaGVkdWxlZCBoYXMgdG8gc3dpdGNoIG9uIGFuZCBvZmYgdGhlIHNjaGVkdWxlZCBlbmdpbmVzXG4vLyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTY2hlZHVsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQuc2NoZWR1bGVyLmFkZChlbmdpbmUsIEluZmluaXR5LCAoKSA9PiB7XG4gICAgICAvLyBnZXQgY3VycmVudFBvc2l0aW9uXG4gICAgICByZXR1cm4gKHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKSAqIHRoaXMuX19zY2FsZVBvc2l0aW9uO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5yZXNldE5leHRUaW1lKHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge1xuICAgIHRoaXMuX19lbmdpbmUucmVzZXROZXh0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX190cmFuc3BvcnQuc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fZW5naW5lKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuY2xhc3MgVHJhbnNwb3J0U2NoZWR1bGVySG9vayBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciB0cmFuc3BvcnQgPSB0aGlzLl9fdHJhbnNwb3J0O1xuICAgIHZhciBwb3NpdGlvbiA9IHRyYW5zcG9ydC5fX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0cmFuc3BvcnQuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCB0cmFuc3BvcnQuX19zcGVlZCk7XG5cbiAgICBpZiAobmV4dFBvc2l0aW9uICE9PSBJbmZpbml0eSlcbiAgICAgIHJldHVybiB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG59XG5cbi8qKlxuICogeHh4XG4gKlxuICpcbiAqL1xuY2xhc3MgVHJhbnNwb3J0IGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSwgYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICAgIHN1cGVyKGF1ZGlvQ29udGV4dCk7XG5cbiAgICAvLyBmdXR1cmUgYXNzaWdubWVudFxuICAgIC8vIHRoaXMuc2NoZWR1bGVyID0gd2F2ZXMuZ2V0U2NoZWR1bGVyKGF1ZGlvQ29udGV4dCk7XG4gICAgLy8gdGhpcy5zY2hlZHVsZXIgPSByZXF1aXJlKFwic2NoZWR1bGVyXCIpO1xuICAgIC8vIHRlc3RcbiAgICB0aGlzLnNjaGVkdWxlciA9IHJlcXVpcmUoJy4vZmFjdG9yaWVzJykuZ2V0U2NoZWR1bGVyKGF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fZW5naW5lcyA9IFtdO1xuICAgIHRoaXMuX190cmFuc3BvcnRlZCA9IFtdO1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBudWxsO1xuICAgIHRoaXMuX190cmFuc3BvcnRRdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlKCk7XG5cbiAgICAvLyBzeW5jcm9uaXplZCB0aW1lLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgfVxuXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgbnVtVHJhbnNwb3J0ZWRFbmdpbmVzID0gdGhpcy5fX3RyYW5zcG9ydGVkLmxlbmd0aDtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICBpZiAobnVtVHJhbnNwb3J0ZWRFbmdpbmVzID4gMCkge1xuICAgICAgdmFyIGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uO1xuXG4gICAgICB0aGlzLl9fdHJhbnNwb3J0UXVldWUuY2xlYXIoKTtcbiAgICAgIHRoaXMuX190cmFuc3BvcnRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBudW1UcmFuc3BvcnRlZEVuZ2luZXMgLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0UXVldWUuaW5zZXJ0KGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uLCBmYWxzZSk7IC8vIGluc2VydCBidXQgZG9uJ3Qgc29ydFxuICAgICAgfVxuXG4gICAgICBlbmdpbmUgPSB0aGlzLl9fdHJhbnNwb3J0ZWRbMF07XG4gICAgICBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0UXVldWUuaW5zZXJ0KGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uLCB0cnVlKTsgLy8gaW5zZXJ0IGFuZCBzb3J0XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgZm9yICh2YXIgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHRpbWVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydCBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgdHJhbnNwb3J0IHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICByZXNldE5leHRQb3NpdGlvbihuZXh0UG9zaXRpb24pIHtcbiAgICBpZiAodGhpcy5fX3NjaGVkdWxlckhvb2spXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldE5leHRUaW1lKHRoaXMuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgcmV0dXJuIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBuZXh0RW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydFF1ZXVlLmhlYWQ7XG4gICAgdmFyIG5leHRFbmdpbmVQb3NpdGlvbiA9IG5leHRFbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydFF1ZXVlLm1vdmUobmV4dEVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcblxuICAgICAgLy8gcmVzeW5jIHRyYW5zcG9ydGVkIGVuZ2luZXNcbiAgICAgIGlmIChzZWVrIHx8IHNwZWVkICogbGFzdFNwZWVkIDwgMCkge1xuICAgICAgICAvLyBzZWVrIG9yIHJldmVyc2UgZGlyZWN0aW9uXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgLy8gc2NoZWR1bGUgdHJhbnNwb3J0IGl0c2VsZlxuICAgICAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rKHRoaXMpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQodGhpcy5fX3NjaGVkdWxlckhvb2ssIEluZmluaXR5KTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuXG4gICAgICAgIC8vIHVuc2NoZWR1bGUgdHJhbnNwb3J0IGl0c2VsZlxuICAgICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUodGhpcy5fX3NjaGVkdWxlckhvb2spO1xuICAgICAgICBkZWxldGUgdGhpcy5fX3NjaGVkdWxlckhvb2s7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGFuZ2Ugc3BlZWQgd2l0aG91dCByZXZlcnNpbmcgZGlyZWN0aW9uXG4gICAgICAgIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnJlc2V0TmV4dFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVuZ2luZSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gc3RhcnQgcG9zaXRpb25cbiAgICovXG4gIGFkZChlbmdpbmUsIHN0YXJ0UG9zaXRpb24gPSAtSW5maW5pdHksIGVuZFBvc2l0aW9uID0gSW5maW5pdHksIG9mZnNldFBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbikge1xuICAgIHZhciB0cmFuc3BvcnRlZCA9IG51bGw7XG5cbiAgICBpZiAob2Zmc2V0UG9zaXRpb24gPT09IC1JbmZpbml0eSlcbiAgICAgIG9mZnNldFBvc2l0aW9uID0gMDtcblxuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZCgpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoZW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTY2hlZHVsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gYSB0cmFuc3BvcnRcIik7XG5cbiAgICBpZiAodHJhbnNwb3J0ZWQpIHtcbiAgICAgIHZhciBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgICAgdGhpcy5fX2VuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgICAgdGhpcy5fX3RyYW5zcG9ydGVkLnB1c2godHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5zZXRUcmFuc3BvcnRlZCh0aGlzLCAobmV4dEVuZ2luZVBvc2l0aW9uID0gbnVsbCkgPT4ge1xuICAgICAgICAvLyByZXNldE5leHRQb3NpdGlvblxuICAgICAgICB2YXIgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICAgICAgaWYgKG5leHRFbmdpbmVQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgICAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiA9IHRyYW5zcG9ydGVkLnN5bmNQb3NpdGlvbih0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLmN1cnJlbnRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRRdWV1ZS5tb3ZlKHRyYW5zcG9ydGVkLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgICAgICAgIHRoaXMucmVzZXROZXh0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAvLyBnZXRDdXJyZW50VGltZVxuICAgICAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIC8vIGdldCBjdXJyZW50UG9zaXRpb25cbiAgICAgICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICB2YXIgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0UXVldWUuaW5zZXJ0KHRyYW5zcG9ydGVkLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMucmVzZXROZXh0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBlbmdpbmVPclRyYW5zcG9ydGVkIGVuZ2luZSBvciB0cmFuc3BvcnRlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZU9yVHJhbnNwb3J0ZWQpIHtcbiAgICB2YXIgZW5naW5lID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICB2YXIgdHJhbnNwb3J0ZWQgPSByZW1vdmVDb3VwbGUodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG5cbiAgICBpZiAoIXRyYW5zcG9ydGVkKSB7XG4gICAgICBlbmdpbmUgPSByZW1vdmVDb3VwbGUodGhpcy5fX3RyYW5zcG9ydGVkLCB0aGlzLl9fZW5naW5lcywgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG4gICAgICB0cmFuc3BvcnRlZCA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZSAmJiB0cmFuc3BvcnRlZCkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5yZXNldEludGVyZmFjZSgpO1xuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLnJlc2V0TmV4dFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyB0cmFuc3BvcnRcIik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGltZSBlbmdpbmVzIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zeW5jU3BlZWQodGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIDApO1xuXG4gICAgZm9yICh2YXIgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKSB7XG4gICAgICB0cmFuc3BvcnRlZC5yZXNldEludGVyZmFjZSgpO1xuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zcG9ydDsiXX0=