'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreAudioContext = require('../core/audio-context');

var _coreAudioContext2 = _interopRequireDefault(_coreAudioContext);

var _coreTimeEngine = require('../core/time-engine');

var _coreTimeEngine2 = _interopRequireDefault(_coreTimeEngine);

var _utilsPriorityQueue = require('../utils/priority-queue');

var _utilsPriorityQueue2 = _interopRequireDefault(_utilsPriorityQueue);

var _utilsSchedulingQueue = require('../utils/scheduling-queue');

var _utilsSchedulingQueue2 = _interopRequireDefault(_utilsSchedulingQueue);

var Scheduler = (function (_SchedulingQueue) {
  _inherits(Scheduler, _SchedulingQueue);

  function Scheduler() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Scheduler);

    _get(Object.getPrototypeOf(Scheduler.prototype), 'constructor', this).call(this);

    this.audioContext = options.audioContext || _coreAudioContext2['default'];

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = options.lookahead || 0.1;
  }

  // setTimeout scheduling loop

  _createClass(Scheduler, [{
    key: '__tick',
    value: function __tick() {
      var audioContext = this.audioContext;
      var time = this.__nextTime;

      this.__timeout = null;

      while (time <= audioContext.currentTime + this.lookahead) {
        this.__currentTime = time;
        time = this.advanceTime(time);
      }

      this.__currentTime = null;
      this.resetTime(time);
    }
  }, {
    key: 'resetTime',
    value: function resetTime() {
      var _this = this;

      var time = arguments.length <= 0 || arguments[0] === undefined ? this.currentTime : arguments[0];

      if (this.master) {
        this.master.reset(this, time);
      } else {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        if (time !== Infinity) {
          if (this.__nextTime === Infinity) console.log("Scheduler Start");

          var timeOutDelay = Math.max(time - this.lookahead - this.audioContext.currentTime, this.period);

          this.__timeout = setTimeout(function () {
            _this.__tick();
          }, timeOutDelay * 1000);
        } else if (this.__nextTime !== Infinity) {
          console.log("Scheduler Stop");
        }

        this.__nextTime = time;
      }
    }
  }, {
    key: 'add',

    // add a time engine to the queue and return the engine
    value: function add(engineOrFunction) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      var engine;

      if (engineOrFunction instanceof Function) {
        // construct minimal scheduled engine
        engine = {
          advanceTime: engineOrFunction
        };
      } else {
        engine = engineOrFunction;

        if (!engine.implementsScheduled()) throw new Error("object cannot be added to scheduler");

        if (engine.master) throw new Error("object has already been added to a master");
      }

      _get(Object.getPrototypeOf(Scheduler.prototype), 'add', this).call(this, engine, time);
    }
  }, {
    key: 'remove',
    value: function remove(engine) {
      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      _get(Object.getPrototypeOf(Scheduler.prototype), 'remove', this).call(this, engine);
    }
  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      _get(Object.getPrototypeOf(Scheduler.prototype), 'resetEngineTime', this).call(this, engine, time);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      if (this.master) return this.master.currentTime;

      return this.__currentTime || this.audioContext.currentTime + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }
  }]);

  return Scheduler;
})(_utilsSchedulingQueue2['default']);

exports['default'] = Scheduler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9tYXN0ZXJzL3NjaGVkdWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2dDQUFnQyx1QkFBdUI7Ozs7OEJBQ2hDLHFCQUFxQjs7OztrQ0FDbEIseUJBQXlCOzs7O29DQUN2QiwyQkFBMkI7Ozs7SUFHbEMsU0FBUztZQUFULFNBQVM7O0FBQ2pCLFdBRFEsU0FBUyxHQUNGO1FBQWQsT0FBTyx5REFBRyxFQUFFOzswQkFETCxTQUFTOztBQUUxQiwrQkFGaUIsU0FBUyw2Q0FFbEI7O0FBRVIsUUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxpQ0FBd0IsQ0FBQzs7QUFFakUsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Ozs7OztBQU10QixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUssS0FBSyxDQUFDOzs7Ozs7QUFNdkMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFLLEdBQUcsQ0FBQztHQUM1Qzs7OztlQXJCa0IsU0FBUzs7V0F3QnRCLGtCQUFHO0FBQ1AsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNyQyxVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDOztBQUUzQixVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7QUFFdEIsYUFBTyxJQUFJLElBQUksWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ3hELFlBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFlBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQy9COztBQUVELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFVBQUks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QUNoRCxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQUM7O0FBRWhDLGFBQU8sU0FBUyxDQUFDO0tBQ2xCOzs7U0EvRWtCLFNBQVM7OztxQkFBVCxTQUFTIiwiZmlsZSI6ImVzNi9tYXN0ZXJzL3NjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZSc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGVyIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBJbmZpbml0eTtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCDCoDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgwqAwLjE7XG4gIH1cblxuICAvLyBzZXRUaW1lb3V0IHNjaGVkdWxpbmcgbG9vcFxuICBfX3RpY2soKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciB0aW1lID0gdGhpcy5fX25leHRUaW1lO1xuXG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgd2hpbGUgKHRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICB0aW1lID0gdGhpcy5hZHZhbmNlVGltZSh0aW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgcmVzZXRUaW1lKHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKSB7XG4gICAgICB0aGlzLm1hc3Rlci5yZXNldCh0aGlzLCB0aW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGlmICh0aGlzLl9fbmV4dFRpbWUgPT09IEluZmluaXR5KVxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2NoZWR1bGVyIFN0YXJ0XCIpO1xuXG4gICAgICAgIHZhciB0aW1lT3V0RGVsYXkgPSBNYXRoLm1heCgodGltZSAtIHRoaXMubG9va2FoZWFkIC0gdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpLCB0aGlzLnBlcmlvZCk7XG5cbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgICB9LCB0aW1lT3V0RGVsYXkgKiAxMDAwKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX25leHRUaW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNjaGVkdWxlciBTdG9wXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG5cbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gYWRkIGEgdGltZSBlbmdpbmUgdG8gdGhlIHF1ZXVlIGFuZCByZXR1cm4gdGhlIGVuZ2luZVxuICBhZGQoZW5naW5lT3JGdW5jdGlvbiwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICB2YXIgZW5naW5lO1xuXG4gICAgaWYgKGVuZ2luZU9yRnVuY3Rpb24gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgLy8gY29uc3RydWN0IG1pbmltYWwgc2NoZWR1bGVkIGVuZ2luZVxuICAgICAgZW5naW5lID0ge1xuICAgICAgICBhZHZhbmNlVGltZTogZW5naW5lT3JGdW5jdGlvblxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5naW5lID0gZW5naW5lT3JGdW5jdGlvbjtcblxuICAgICAgaWYgKCFlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHNjaGVkdWxlclwiKTtcblxuICAgICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuICAgIH1cblxuICAgIHN1cGVyLmFkZChlbmdpbmUsIHRpbWUpO1xuICB9XG5cbiAgcmVtb3ZlKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIHN1cGVyLnJlbW92ZShlbmdpbmUpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVUaW1lKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICBzdXBlci5yZXNldEVuZ2luZVRpbWUoZW5naW5lLCB0aW1lKTtcbiAgfVxufVxuIl19