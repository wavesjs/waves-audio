'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _priorityQueue = require('./priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _timeEngine = require('./time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class SchedulingQueue
 * @extends TimeEngine
 */
/**
 * SchedulingQueue base class
 * http://wavesjs.github.io/audio/#audio-scheduling-queue
 *
 * Norbert.Schnell@ircam.fr
 * Copyright 2014, 2015 IRCAM – Centre Pompidou
 */

var SchedulingQueue = function (_TimeEngine) {
  (0, _inherits3.default)(SchedulingQueue, _TimeEngine);

  function SchedulingQueue() {
    (0, _classCallCheck3.default)(this, SchedulingQueue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(SchedulingQueue)).call(this));

    _this.__queue = new _priorityQueue2.default();
    _this.__engines = new _set2.default();
    return _this;
  }

  // TimeEngine 'scheduled' interface


  (0, _createClass3.default)(SchedulingQueue, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var engine = this.__queue.head;
      var nextEngineTime = engine.advanceTime(time);

      if (!nextEngineTime) {
        engine.master = null;
        this.__engines.delete(engine);
        this.__queue.remove(engine);
      } else {
        this.__queue.move(engine, nextEngineTime);
      }

      return this.__queue.time;
    }

    // TimeEngine master method to be implemented by derived class

  }, {
    key: 'defer',


    // call a function at a given time
    value: function defer(fun) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime(time) {
          fun(time);
        } // make sur that the advanceTime method does not returm anything
      }, time);
    }

    // add a time engine to the scheduler

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

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
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      var nextTime = void 0;

      if (this.__queue.has(engine)) nextTime = this.__queue.move(engine, time);else nextTime = this.__queue.insert(engine, time);

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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.__engines), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var engine = _step.value;

          engine.master = null;
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

      this.__queue.clear();
      this.__engines.clear();
      this.resetTime(Infinity);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return 0;
    }
  }]);
  return SchedulingQueue;
}(_timeEngine2.default);

exports.default = SchedulingQueue;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVkdWxpbmctcXVldWUuanMiXSwibmFtZXMiOlsiU2NoZWR1bGluZ1F1ZXVlIiwiX19xdWV1ZSIsIl9fZW5naW5lcyIsInRpbWUiLCJlbmdpbmUiLCJoZWFkIiwibmV4dEVuZ2luZVRpbWUiLCJhZHZhbmNlVGltZSIsIm1hc3RlciIsImRlbGV0ZSIsInJlbW92ZSIsIm1vdmUiLCJmdW4iLCJjdXJyZW50VGltZSIsIkZ1bmN0aW9uIiwiRXJyb3IiLCJhZGQiLCJpbXBsZW1lbnRzU2NoZWR1bGVkIiwibmV4dFRpbWUiLCJpbnNlcnQiLCJyZXNldFRpbWUiLCJoYXMiLCJjbGVhciIsIkluZmluaXR5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUUE7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7QUFYQTs7Ozs7Ozs7SUFlTUEsZTs7O0FBQ0osNkJBQWM7QUFBQTs7QUFBQTs7QUFHWixVQUFLQyxPQUFMLEdBQWUsNkJBQWY7QUFDQSxVQUFLQyxTQUFMLEdBQWlCLG1CQUFqQjtBQUpZO0FBS2I7O0FBRUQ7Ozs7O2dDQUNZQyxJLEVBQU07QUFDaEIsVUFBTUMsU0FBUyxLQUFLSCxPQUFMLENBQWFJLElBQTVCO0FBQ0EsVUFBTUMsaUJBQWlCRixPQUFPRyxXQUFQLENBQW1CSixJQUFuQixDQUF2Qjs7QUFFQSxVQUFJLENBQUNHLGNBQUwsRUFBcUI7QUFDbkJGLGVBQU9JLE1BQVAsR0FBZ0IsSUFBaEI7QUFDQSxhQUFLTixTQUFMLENBQWVPLE1BQWYsQ0FBc0JMLE1BQXRCO0FBQ0EsYUFBS0gsT0FBTCxDQUFhUyxNQUFiLENBQW9CTixNQUFwQjtBQUNELE9BSkQsTUFJTztBQUNMLGFBQUtILE9BQUwsQ0FBYVUsSUFBYixDQUFrQlAsTUFBbEIsRUFBMEJFLGNBQTFCO0FBQ0Q7O0FBRUQsYUFBTyxLQUFLTCxPQUFMLENBQWFFLElBQXBCO0FBQ0Q7O0FBRUQ7Ozs7OztBQUtBOzBCQUNNUyxHLEVBQThCO0FBQUEsVUFBekJULElBQXlCLHVFQUFsQixLQUFLVSxXQUFhOztBQUNsQyxVQUFJLEVBQUVELGVBQWVFLFFBQWpCLENBQUosRUFDRSxNQUFNLElBQUlDLEtBQUosQ0FBVSx1Q0FBVixDQUFOOztBQUVGLFdBQUtDLEdBQUwsQ0FBUztBQUNQVCxxQkFBYSxxQkFBU0osSUFBVCxFQUFlO0FBQUVTLGNBQUlULElBQUo7QUFBWSxTQURuQyxDQUNxQztBQURyQyxPQUFULEVBRUdBLElBRkg7QUFHRDs7QUFFRDs7Ozt3QkFDSUMsTSxFQUFpQztBQUFBLFVBQXpCRCxJQUF5Qix1RUFBbEIsS0FBS1UsV0FBYTs7QUFDbkMsVUFBSSxDQUFDLHFCQUFXSSxtQkFBWCxDQUErQmIsTUFBL0IsQ0FBTCxFQUNFLE1BQU0sSUFBSVcsS0FBSixDQUFVLHFDQUFWLENBQU47O0FBRUYsVUFBSVgsT0FBT0ksTUFBWCxFQUNFLE1BQU0sSUFBSU8sS0FBSixDQUFVLDJDQUFWLENBQU47O0FBRUZYLGFBQU9JLE1BQVAsR0FBZ0IsSUFBaEI7O0FBRUE7QUFDQSxXQUFLTixTQUFMLENBQWVjLEdBQWYsQ0FBbUJaLE1BQW5CO0FBQ0EsVUFBTWMsV0FBVyxLQUFLakIsT0FBTCxDQUFha0IsTUFBYixDQUFvQmYsTUFBcEIsRUFBNEJELElBQTVCLENBQWpCOztBQUVBO0FBQ0EsV0FBS2lCLFNBQUwsQ0FBZUYsUUFBZjtBQUNEOztBQUVEOzs7OzJCQUNPZCxNLEVBQVE7QUFDYixVQUFJQSxPQUFPSSxNQUFQLEtBQWtCLElBQXRCLEVBQ0UsTUFBTSxJQUFJTyxLQUFKLENBQVUsNkNBQVYsQ0FBTjs7QUFFRlgsYUFBT0ksTUFBUCxHQUFnQixJQUFoQjs7QUFFQTtBQUNBLFdBQUtOLFNBQUwsQ0FBZU8sTUFBZixDQUFzQkwsTUFBdEI7QUFDQSxVQUFNYyxXQUFXLEtBQUtqQixPQUFMLENBQWFTLE1BQWIsQ0FBb0JOLE1BQXBCLENBQWpCOztBQUVBO0FBQ0EsV0FBS2dCLFNBQUwsQ0FBZUYsUUFBZjtBQUNEOztBQUVEOzs7O29DQUNnQmQsTSxFQUFpQztBQUFBLFVBQXpCRCxJQUF5Qix1RUFBbEIsS0FBS1UsV0FBYTs7QUFDL0MsVUFBSVQsT0FBT0ksTUFBUCxLQUFrQixJQUF0QixFQUNFLE1BQU0sSUFBSU8sS0FBSixDQUFVLDZDQUFWLENBQU47O0FBRUYsVUFBSUcsaUJBQUo7O0FBRUEsVUFBSSxLQUFLakIsT0FBTCxDQUFhb0IsR0FBYixDQUFpQmpCLE1BQWpCLENBQUosRUFDRWMsV0FBVyxLQUFLakIsT0FBTCxDQUFhVSxJQUFiLENBQWtCUCxNQUFsQixFQUEwQkQsSUFBMUIsQ0FBWCxDQURGLEtBR0VlLFdBQVcsS0FBS2pCLE9BQUwsQ0FBYWtCLE1BQWIsQ0FBb0JmLE1BQXBCLEVBQTRCRCxJQUE1QixDQUFYOztBQUVGLFdBQUtpQixTQUFMLENBQWVGLFFBQWY7QUFDRDs7QUFFRDs7Ozt3QkFDSWQsTSxFQUFRO0FBQ1YsYUFBTyxLQUFLRixTQUFMLENBQWVtQixHQUFmLENBQW1CakIsTUFBbkIsQ0FBUDtBQUNEOztBQUVEOzs7OzRCQUNRO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ04sd0RBQWtCLEtBQUtGLFNBQXZCO0FBQUEsY0FBUUUsTUFBUjs7QUFDRUEsaUJBQU9JLE1BQVAsR0FBZ0IsSUFBaEI7QUFERjtBQURNO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBSU4sV0FBS1AsT0FBTCxDQUFhcUIsS0FBYjtBQUNBLFdBQUtwQixTQUFMLENBQWVvQixLQUFmO0FBQ0EsV0FBS0YsU0FBTCxDQUFlRyxRQUFmO0FBQ0Q7Ozt3QkEzRWlCO0FBQ2hCLGFBQU8sQ0FBUDtBQUNEOzs7OztrQkE0RVl2QixlIiwiZmlsZSI6InNjaGVkdWxpbmctcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFNjaGVkdWxpbmdRdWV1ZSBiYXNlIGNsYXNzXG4gKiBodHRwOi8vd2F2ZXNqcy5naXRodWIuaW8vYXVkaW8vI2F1ZGlvLXNjaGVkdWxpbmctcXVldWVcbiAqXG4gKiBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnJcbiAqIENvcHlyaWdodCAyMDE0LCAyMDE1IElSQ0FNIOKAk8KgQ2VudHJlIFBvbXBpZG91XG4gKi9cblxuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi9wcmlvcml0eS1xdWV1ZSc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuL3RpbWUtZW5naW5lJztcblxuLyoqXG4gKiBAY2xhc3MgU2NoZWR1bGluZ1F1ZXVlXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKi9cbmNsYXNzIFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3F1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fZW5naW5lcyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgJ3NjaGVkdWxlZCcgaW50ZXJmYWNlXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9fcXVldWUuaGVhZDtcbiAgICBjb25zdCBuZXh0RW5naW5lVGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aW1lKTtcblxuICAgIGlmICghbmV4dEVuZ2luZVRpbWUpIHtcbiAgICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVRpbWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fcXVldWUudGltZTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWFzdGVyIG1ldGhvZCB0byBiZSBpbXBsZW1lbnRlZCBieSBkZXJpdmVkIGNsYXNzXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIGNhbGwgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWVcbiAgZGVmZXIoZnVuLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICghKGZ1biBpbnN0YW5jZW9mIEZ1bmN0aW9uKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgZGVmZXJlZCBieSBzY2hlZHVsZXJcIik7XG5cbiAgICB0aGlzLmFkZCh7XG4gICAgICBhZHZhbmNlVGltZTogZnVuY3Rpb24odGltZSkgeyBmdW4odGltZSk7IH0sIC8vIG1ha2Ugc3VyIHRoYXQgdGhlIGFkdmFuY2VUaW1lIG1ldGhvZCBkb2VzIG5vdCByZXR1cm0gYW55dGhpbmdcbiAgICB9LCB0aW1lKTtcbiAgfVxuXG4gIC8vIGFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBzY2hlZHVsZXJcbiAgYWRkKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIVRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG5cbiAgICAvLyBhZGQgdG8gZW5naW5lcyBhbmQgcXVldWVcbiAgICB0aGlzLl9fZW5naW5lcy5hZGQoZW5naW5lKTtcbiAgICBjb25zdCBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5pbnNlcnQoZW5naW5lLCB0aW1lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZW1vdmUgYSB0aW1lIGVuZ2luZSBmcm9tIHRoZSBxdWV1ZVxuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG5cbiAgICAvLyByZW1vdmUgZnJvbSBhcnJheSBhbmQgcXVldWVcbiAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICBjb25zdCBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5yZW1vdmUoZW5naW5lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZXNldCBuZXh0IGVuZ2luZSB0aW1lXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgbGV0IG5leHRUaW1lO1xuXG4gICAgaWYgKHRoaXMuX19xdWV1ZS5oYXMoZW5naW5lKSlcbiAgICAgIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLm1vdmUoZW5naW5lLCB0aW1lKTtcbiAgICBlbHNlXG4gICAgICBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5pbnNlcnQoZW5naW5lLCB0aW1lKTtcblxuICAgIHRoaXMucmVzZXRUaW1lKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8vIGNoZWNrIHdoZXRoZXIgYSBnaXZlbiBlbmdpbmUgaXMgc2NoZWR1bGVkXG4gIGhhcyhlbmdpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5fX2VuZ2luZXMuaGFzKGVuZ2luZSk7XG4gIH1cblxuICAvLyBjbGVhciBxdWV1ZVxuICBjbGVhcigpIHtcbiAgICBmb3IobGV0IGVuZ2luZSBvZiB0aGlzLl9fZW5naW5lcylcbiAgICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fX3F1ZXVlLmNsZWFyKCk7XG4gICAgdGhpcy5fX2VuZ2luZXMuY2xlYXIoKTtcbiAgICB0aGlzLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NoZWR1bGluZ1F1ZXVlXG4iXX0=