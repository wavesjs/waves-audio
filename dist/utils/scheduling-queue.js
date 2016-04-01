'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

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

var _priorityQueue = require('../utils/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class SchedulingQueue
 */

var SchedulingQueue = function (_TimeEngine) {
  (0, _inherits3.default)(SchedulingQueue, _TimeEngine);

  function SchedulingQueue() {
    (0, _classCallCheck3.default)(this, SchedulingQueue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SchedulingQueue).call(this));

    _this.__queue = new _priorityQueue2.default();
    _this.__engines = new _set2.default();
    return _this;
  }

  // TimeEngine 'scheduled' interface


  (0, _createClass3.default)(SchedulingQueue, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var nextTime = this.__queue.time;

      while (nextTime <= time) {
        var engine = this.__queue.head;
        var nextEngineTime = engine.advanceTime(time);

        if (!nextEngineTime) {
          engine.master = null;
          this.__engines.delete(engine);
          nextTime = this.__queue.remove(engine);
        } else if (nextEngineTime > time && nextEngineTime <= Infinity) {
          nextTime = this.__queue.move(engine, nextEngineTime);
        } else {
          throw new Error('engine did not advance time');
        }
      }

      return nextTime;
    }

    // TimeEngine master method to be implemented by derived class

  }, {
    key: 'defer',


    // call a function at a given time
    value: function defer(fun) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime(time) {
          fun(time);
        } }, // make sur that the advanceTime method does not returm anything
      time);
    }

    // add a time engine to the scheduler

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!_timeEngine2.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      engine.master = this;

      // add to engines and queue
      this.__engines.add(engine);
      var nextTime = this.__queue.insert(engine, time);

      // reschedule queue
      this.resetTime(nextTime);
    }

    // remove a time engine from the queue

  }, {
    key: 'remove',
    value: function remove(engine) {
      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      engine.master = null;

      // remove from array and queue
      this.__engines.delete(engine);
      var nextTime = this.__queue.remove(engine);

      // reschedule queue
      this.resetTime(nextTime);
    }

    // reset next engine time

  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      var nextTime = this.__queue.move(engine, time);
      this.resetTime(nextTime);
    }

    // check whether a given engine is scheduled

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }

    // clear queue

  }, {
    key: 'clear',
    value: function clear() {
      this.__queue.clear();
      this.__engines.clear;
      this.resetTime(Infinity);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return 0;
    }
  }]);
  return SchedulingQueue;
}(_timeEngine2.default); /**
                          * SchedulingQueue base class
                          * http://wavesjs.github.io/audio/#audio-scheduling-queue
                          *
                          * Norbert.Schnell@ircam.fr
                          * Copyright 2014, 2015 IRCAM – Centre Pompidou
                          */

exports.default = SchedulingQueue;
//# sourceMappingURL=data:application/json;base64,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SSxXQUFXLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFBMEIsSUFBMUIsQ0FBWCxDQUoyQztBQUsvQyxXQUFLLFNBQUwsQ0FBZSxRQUFmLEVBTCtDOzs7Ozs7O3dCQVM3QyxRQUFRO0FBQ1YsYUFBTyxLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLE1BQW5CLENBQVAsQ0FEVTs7Ozs7Ozs0QkFLSjtBQUNOLFdBQUssT0FBTCxDQUFhLEtBQWIsR0FETTtBQUVOLFdBQUssU0FBTCxDQUFlLEtBQWYsQ0FGTTtBQUdOLFdBQUssU0FBTCxDQUFlLFFBQWYsRUFITTs7Ozt3QkE5RFU7QUFDaEIsYUFBTyxDQUFQLENBRGdCOzs7U0EvQkMiLCJmaWxlIjoic2NoZWR1bGluZy1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogU2NoZWR1bGluZ1F1ZXVlIGJhc2UgY2xhc3NcbiAqIGh0dHA6Ly93YXZlc2pzLmdpdGh1Yi5pby9hdWRpby8jYXVkaW8tc2NoZWR1bGluZy1xdWV1ZVxuICpcbiAqIE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mclxuICogQ29weXJpZ2h0IDIwMTQsIDIwMTUgSVJDQU0g4oCTwqBDZW50cmUgUG9tcGlkb3VcbiAqL1xuXG5pbXBvcnQgUHJpb3JpdHlRdWV1ZSBmcm9tICcuLi91dGlscy9wcmlvcml0eS1xdWV1ZSc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5cbi8qKlxuICogQGNsYXNzIFNjaGVkdWxpbmdRdWV1ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19xdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlKCk7XG4gICAgdGhpcy5fX2VuZ2luZXMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lICdzY2hlZHVsZWQnIGludGVyZmFjZVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLnRpbWU7XG5cbiAgICB3aGlsZSAobmV4dFRpbWUgPD0gdGltZSkge1xuICAgICAgdmFyIGVuZ2luZSA9IHRoaXMuX19xdWV1ZS5oZWFkO1xuICAgICAgdmFyIG5leHRFbmdpbmVUaW1lID0gZW5naW5lLmFkdmFuY2VUaW1lKHRpbWUpO1xuXG4gICAgICBpZiAoIW5leHRFbmdpbmVUaW1lKSB7XG4gICAgICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICAgICAgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG4gICAgICB9IGVsc2UgaWYgKG5leHRFbmdpbmVUaW1lID4gdGltZSAmJiBuZXh0RW5naW5lVGltZSA8PSBJbmZpbml0eSkge1xuICAgICAgICBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVRpbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlbmdpbmUgZGlkIG5vdCBhZHZhbmNlIHRpbWUnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1hc3RlciBtZXRob2QgdG8gYmUgaW1wbGVtZW50ZWQgYnkgZGVyaXZlZCBjbGFzc1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKHRpbWUpIHsgZnVuKHRpbWUpOyB9LCAvLyBtYWtlIHN1ciB0aGF0IHRoZSBhZHZhbmNlVGltZSBtZXRob2QgZG9lcyBub3QgcmV0dXJtIGFueXRoaW5nXG4gICAgfSwgdGltZSk7XG4gIH1cblxuICAvLyBhZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgc2NoZWR1bGVyXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCFUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuXG4gICAgLy8gYWRkIHRvIGVuZ2luZXMgYW5kIHF1ZXVlXG4gICAgdGhpcy5fX2VuZ2luZXMuYWRkKGVuZ2luZSk7XG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLmluc2VydChlbmdpbmUsIHRpbWUpO1xuXG4gICAgLy8gcmVzY2hlZHVsZSBxdWV1ZVxuICAgIHRoaXMucmVzZXRUaW1lKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8vIHJlbW92ZSBhIHRpbWUgZW5naW5lIGZyb20gdGhlIHF1ZXVlXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBpZiAoZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcblxuICAgIC8vIHJlbW92ZSBmcm9tIGFycmF5IGFuZCBxdWV1ZVxuICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5yZW1vdmUoZW5naW5lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZXNldCBuZXh0IGVuZ2luZSB0aW1lXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLm1vdmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyBjaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZW5naW5lIGlzIHNjaGVkdWxlZFxuICBoYXMoZW5naW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19lbmdpbmVzLmhhcyhlbmdpbmUpO1xuICB9XG5cbiAgLy8gY2xlYXIgcXVldWVcbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fX3F1ZXVlLmNsZWFyKCk7XG4gICAgdGhpcy5fX2VuZ2luZXMuY2xlYXI7XG4gICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG59XG4iXX0=