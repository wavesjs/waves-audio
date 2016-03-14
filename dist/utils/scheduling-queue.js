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
        } else if (nextEngineTime > time && nextEngineTime < Infinity) {
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
//# sourceMappingURL=data:application/json;base64,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LE1BQWxCLEVBQTBCLElBQTFCLENBQVgsQ0FKMkM7QUFLL0MsV0FBSyxTQUFMLENBQWUsUUFBZixFQUwrQzs7Ozs7Ozt3QkFTN0MsUUFBUTtBQUNWLGFBQU8sS0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQixNQUFuQixDQUFQLENBRFU7Ozs7Ozs7NEJBS0o7QUFDTixXQUFLLE9BQUwsQ0FBYSxLQUFiLEdBRE07QUFFTixXQUFLLFNBQUwsQ0FBZSxLQUFmLENBRk07QUFHTixXQUFLLFNBQUwsQ0FBZSxRQUFmLEVBSE07Ozs7d0JBOURVO0FBQ2hCLGFBQU8sQ0FBUCxDQURnQjs7O1NBL0JDIiwiZmlsZSI6InNjaGVkdWxpbmctcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFNjaGVkdWxpbmdRdWV1ZSBiYXNlIGNsYXNzXG4gKiBodHRwOi8vd2F2ZXNqcy5naXRodWIuaW8vYXVkaW8vI2F1ZGlvLXNjaGVkdWxpbmctcXVldWVcbiAqXG4gKiBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnJcbiAqIENvcHlyaWdodCAyMDE0LCAyMDE1IElSQ0FNIOKAk8KgQ2VudHJlIFBvbXBpZG91XG4gKi9cblxuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuXG4vKipcbiAqIEBjbGFzcyBTY2hlZHVsaW5nUXVldWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19lbmdpbmVzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSAnc2NoZWR1bGVkJyBpbnRlcmZhY2VcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS50aW1lO1xuXG4gICAgd2hpbGUgKG5leHRUaW1lIDw9IHRpbWUpIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fcXVldWUuaGVhZDtcbiAgICAgIHZhciBuZXh0RW5naW5lVGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aW1lKTtcblxuICAgICAgaWYgKCFuZXh0RW5naW5lVGltZSkge1xuICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICAgIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLnJlbW92ZShlbmdpbmUpO1xuICAgICAgfSBlbHNlIGlmIChuZXh0RW5naW5lVGltZSA+IHRpbWUgJiYgbmV4dEVuZ2luZVRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgICBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVRpbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdlbmdpbmUgZGlkIG5vdCBhZHZhbmNlIHRpbWUnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1hc3RlciBtZXRob2QgdG8gYmUgaW1wbGVtZW50ZWQgYnkgZGVyaXZlZCBjbGFzc1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKCkgeyBmdW4oKTsgfSwgLy8gbWFrZSBzdXIgdGhhdCB0aGUgYWR2YW5jZVRpbWUgbWV0aG9kIGRvZXMgbm90IHJldHVybSBhbnl0aGluZ1xuICAgIH0sIHRpbWUpO1xuICB9XG5cbiAgLy8gYWRkIGEgdGltZSBlbmdpbmUgdG8gdGhlIHF1ZXVlIGFuZCByZXR1cm4gdGhlIGVuZ2luZVxuICBhZGQoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICghZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuXG4gICAgLy8gYWRkIHRvIGVuZ2luZXMgYW5kIHF1ZXVlXG4gICAgdGhpcy5fX2VuZ2luZXMuYWRkKGVuZ2luZSk7XG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLmluc2VydChlbmdpbmUsIHRpbWUpO1xuXG4gICAgLy8gcmVzY2hlZHVsZSBxdWV1ZVxuICAgIHRoaXMucmVzZXRUaW1lKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8vIHJlbW92ZSBhIHRpbWUgZW5naW5lIGZyb20gdGhlIHF1ZXVlXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBpZiAoZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcblxuICAgIC8vIHJlbW92ZSBmcm9tIGFycmF5IGFuZCBxdWV1ZVxuICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5yZW1vdmUoZW5naW5lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZXNldCBuZXh0IGVuZ2luZSB0aW1lXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLm1vdmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyBjaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZW5naW5lIGlzIHNjaGVkdWxlZFxuICBoYXMoZW5naW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19lbmdpbmVzLmhhcyhlbmdpbmUpO1xuICB9XG5cbiAgLy8gY2xlYXIgcXVldWVcbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fX3F1ZXVlLmNsZWFyKCk7XG4gICAgdGhpcy5fX2VuZ2luZXMuY2xlYXI7XG4gICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG59XG4iXX0=