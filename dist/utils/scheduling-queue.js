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
        advanceTime: function advanceTime() {
          fun();
        } }, // make sur that the advanceTime method does not returm anything
      time);
    }

    // add a time engine to the queue and return the engine

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!engine.implementsScheduled()) throw new Error("object cannot be added to scheduler");

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
//# sourceMappingURL=data:application/json;base64,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LE1BQWxCLEVBQTBCLElBQTFCLENBQVgsQ0FKMkM7QUFLL0MsV0FBSyxTQUFMLENBQWUsUUFBZixFQUwrQzs7Ozs7Ozt3QkFTN0MsUUFBUTtBQUNWLGFBQU8sS0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQixNQUFuQixDQUFQLENBRFU7Ozs7Ozs7NEJBS0o7QUFDTixXQUFLLE9BQUwsQ0FBYSxLQUFiLEdBRE07QUFFTixXQUFLLFNBQUwsQ0FBZSxLQUFmLENBRk07QUFHTixXQUFLLFNBQUwsQ0FBZSxRQUFmLEVBSE07Ozs7d0JBOURVO0FBQ2hCLGFBQU8sQ0FBUCxDQURnQjs7O1NBL0JDIiwiZmlsZSI6InNjaGVkdWxpbmctcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFNjaGVkdWxpbmdRdWV1ZSBiYXNlIGNsYXNzXG4gKiBodHRwOi8vd2F2ZXNqcy5naXRodWIuaW8vYXVkaW8vI2F1ZGlvLXNjaGVkdWxpbmctcXVldWVcbiAqXG4gKiBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnJcbiAqIENvcHlyaWdodCAyMDE0LCAyMDE1IElSQ0FNIOKAk8KgQ2VudHJlIFBvbXBpZG91XG4gKi9cblxuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuXG4vKipcbiAqIEBjbGFzcyBTY2hlZHVsaW5nUXVldWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19lbmdpbmVzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSAnc2NoZWR1bGVkJyBpbnRlcmZhY2VcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS50aW1lO1xuXG4gICAgd2hpbGUgKG5leHRUaW1lIDw9IHRpbWUpIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fcXVldWUuaGVhZDtcbiAgICAgIHZhciBuZXh0RW5naW5lVGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aW1lKTtcblxuICAgICAgaWYgKCFuZXh0RW5naW5lVGltZSkge1xuICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICAgIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLnJlbW92ZShlbmdpbmUpO1xuICAgICAgfSBlbHNlIGlmIChuZXh0RW5naW5lVGltZSA+IHRpbWUgJiYgbmV4dEVuZ2luZVRpbWUgPD0gSW5maW5pdHkpIHtcbiAgICAgICAgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZW5naW5lIGRpZCBub3QgYWR2YW5jZSB0aW1lJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtYXN0ZXIgbWV0aG9kIHRvIGJlIGltcGxlbWVudGVkIGJ5IGRlcml2ZWQgY2xhc3NcbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gY2FsbCBhIGZ1bmN0aW9uIGF0IGEgZ2l2ZW4gdGltZVxuICBkZWZlcihmdW4sIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCEoZnVuIGluc3RhbmNlb2YgRnVuY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBkZWZlcmVkIGJ5IHNjaGVkdWxlclwiKTtcblxuICAgIHRoaXMuYWRkKHtcbiAgICAgIGFkdmFuY2VUaW1lOiBmdW5jdGlvbigpIHsgZnVuKCk7IH0sIC8vIG1ha2Ugc3VyIHRoYXQgdGhlIGFkdmFuY2VUaW1lIG1ldGhvZCBkb2VzIG5vdCByZXR1cm0gYW55dGhpbmdcbiAgICB9LCB0aW1lKTtcbiAgfVxuXG4gIC8vIGFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBxdWV1ZSBhbmQgcmV0dXJuIHRoZSBlbmdpbmVcbiAgYWRkKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIWVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHNjaGVkdWxlclwiKTtcblxuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcblxuICAgIC8vIGFkZCB0byBlbmdpbmVzIGFuZCBxdWV1ZVxuICAgIHRoaXMuX19lbmdpbmVzLmFkZChlbmdpbmUpO1xuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5pbnNlcnQoZW5naW5lLCB0aW1lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZW1vdmUgYSB0aW1lIGVuZ2luZSBmcm9tIHRoZSBxdWV1ZVxuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG5cbiAgICAvLyByZW1vdmUgZnJvbSBhcnJheSBhbmQgcXVldWVcbiAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG5cbiAgICAvLyByZXNjaGVkdWxlIHF1ZXVlXG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gcmVzZXQgbmV4dCBlbmdpbmUgdGltZVxuICByZXNldEVuZ2luZVRpbWUoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gY2hlY2sgd2hldGhlciBhIGdpdmVuIGVuZ2luZSBpcyBzY2hlZHVsZWRcbiAgaGFzKGVuZ2luZSkge1xuICAgIHJldHVybiB0aGlzLl9fZW5naW5lcy5oYXMoZW5naW5lKTtcbiAgfVxuXG4gIC8vIGNsZWFyIHF1ZXVlXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX19xdWV1ZS5jbGVhcigpO1xuICAgIHRoaXMuX19lbmdpbmVzLmNsZWFyO1xuICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxufVxuIl19