'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SimpleScheduler = function () {
  function SimpleScheduler() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, SimpleScheduler);

    this.audioContext = options.audioContext || _audioContext2.default;

    this.__engines = new _set2.default();

    this.__schedEngines = [];
    this.__schedTimes = [];

    this.__currentTime = null;
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

  (0, _createClass3.default)(SimpleScheduler, [{
    key: '__scheduleEngine',
    value: function __scheduleEngine(engine, time) {
      this.__schedEngines.push(engine);
      this.__schedTimes.push(time);
    }
  }, {
    key: '__rescheduleEngine',
    value: function __rescheduleEngine(engine, time) {
      var index = this.__schedEngines.indexOf(engine);

      if (index >= 0) {
        if (time !== Infinity) {
          this.__schedTimes[index] = time;
        } else {
          this.__schedEngines.splice(index, 1);
          this.__schedTimes.splice(index, 1);
        }
      } else if (time < Infinity) {
        this.__schedEngines.push(engine);
        this.__schedTimes.push(time);
      }
    }
  }, {
    key: '__unscheduleEngine',
    value: function __unscheduleEngine(engine) {
      var index = this.__schedEngines.indexOf(engine);

      if (index >= 0) {
        this.__schedEngines.splice(index, 1);
        this.__schedTimes.splice(index, 1);
      }
    }
  }, {
    key: '__resetTick',
    value: function __resetTick() {
      if (this.__schedEngines.length > 0) {
        if (!this.__timeout) {
          console.log("SimpleScheduler Start");
          this.__tick();
        }
      } else if (this.__timeout) {
        console.log("SimpleScheduler Stop");
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }
    }
  }, {
    key: '__tick',
    value: function __tick() {
      var _this = this;

      var audioContext = this.audioContext;
      var i = 0;

      while (i < this.__schedEngines.length) {
        var engine = this.__schedEngines[i];
        var time = this.__schedTimes[i];

        while (time && time <= audioContext.currentTime + this.lookahead) {
          time = Math.max(time, audioContext.currentTime);
          this.__currentTime = time;
          time = engine.advanceTime(time);
        }

        if (time && time < Infinity) {
          this.__schedTimes[i++] = time;
        } else {
          this.__unscheduleEngine(engine);

          // remove engine from scheduler
          if (!time) {
            engine.master = null;
            this.__engines.delete(engine);
          }
        }
      }

      this.__currentTime = null;
      this.__timeout = null;

      if (this.__schedEngines.length > 0) {
        this.__timeout = setTimeout(function () {
          _this.__tick();
        }, this.period * 1000);
      }
    }
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

      // set master and add to array
      engine.master = this;
      this.__engines.add(engine);

      // schedule engine
      this.__scheduleEngine(engine, time);
      this.__resetTick();
    }
  }, {
    key: 'remove',
    value: function remove(engine) {
      if (!engine.master || engine.master !== this) throw new Error("engine has not been added to this scheduler");

      // reset master and remove from array
      engine.master = null;
      this.__engines.delete(engine);

      // unschedule engine
      this.__unscheduleEngine(engine);
      this.__resetTick();
    }
  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      this.__rescheduleEngine(engine, time);
      this.__resetTick();
    }

    // check whether a given engine is scheduled

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }
  }, {
    key: 'clear',
    value: function clear() {
      if (this.__timeout) {
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }

      this.__schedEngines.length = 0;
      this.__schedTimes.length = 0;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__currentTime || this.audioContext.currentTime + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return undefined;
    }
  }]);
  return SimpleScheduler;
}();

exports.default = SimpleScheduler;
//# sourceMappingURL=data:application/json;base64,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QWtCLE1BQWxCLEdBQTJCLENBQTNCLENBUE07Ozs7d0JBMURVO0FBQ2hCLGFBQU8sS0FBSyxhQUFMLElBQXNCLEtBQUssWUFBTCxDQUFrQixXQUFsQixHQUFnQyxLQUFLLFNBQUwsQ0FEN0M7Ozs7d0JBSUk7QUFDcEIsYUFBTyxTQUFQLENBRG9COzs7U0E3R0giLCJmaWxlIjoic2ltcGxlLXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2ltcGxlU2NoZWR1bGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCDCoGRlZmF1bHRBdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLl9fZW5naW5lcyA9IG5ldyBTZXQoKTtcblxuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcyA9IFtdO1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCAwLjAyNTtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciBsb29rYWhlYWQgdGltZSAoPiBwZXJpb2QpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IDAuMTtcbiAgfVxuXG4gIF9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgfVxuXG4gIF9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaW5kZXhdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIF9fcmVzZXRUaWNrKCkge1xuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICghdGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTaW1wbGVTY2hlZHVsZXIgU3RhcnRcIik7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY29uc29sZS5sb2coXCJTaW1wbGVTY2hlZHVsZXIgU3RvcFwiKTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX190aWNrKCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgZW5naW5lID0gdGhpcy5fX3NjaGVkRW5naW5lc1tpXTtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5fX3NjaGVkVGltZXNbaV07XG5cbiAgICAgIHdoaWxlICh0aW1lICYmIHRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICAgIHRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICYmIHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpKytdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGVuZ2luZSBmcm9tIHNjaGVkdWxlclxuICAgICAgICBpZiAoIXRpbWUpIHtcbiAgICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH0sIHRoaXMucGVyaW9kICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIGNhbGwgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWVcbiAgZGVmZXIoZnVuLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICghKGZ1biBpbnN0YW5jZW9mIEZ1bmN0aW9uKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgZGVmZXJlZCBieSBzY2hlZHVsZXJcIik7XG5cbiAgICB0aGlzLmFkZCh7XG4gICAgICBhZHZhbmNlVGltZTogZnVuY3Rpb24odGltZSkgeyBmdW4odGltZSk7IH0sIC8vIG1ha2Ugc3VyIHRoYXQgdGhlIGFkdmFuY2VUaW1lIG1ldGhvZCBkb2VzIG5vdCByZXR1cm0gYW55dGhpbmdcbiAgICB9LCB0aW1lKTtcbiAgfVxuXG4gIC8vIGFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBzY2hlZHVsZXJcbiAgYWRkKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIVRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgLy8gc2V0IG1hc3RlciBhbmQgYWRkIHRvIGFycmF5XG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gICAgdGhpcy5fX2VuZ2luZXMuYWRkKGVuZ2luZSk7XG5cbiAgICAvLyBzY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKCFlbmdpbmUubWFzdGVyIHx8IGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJlbmdpbmUgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgLy8gcmVzZXQgbWFzdGVyIGFuZCByZW1vdmUgZnJvbSBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuXG4gICAgLy8gdW5zY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgdGhpcy5fX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICAvLyBjaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZW5naW5lIGlzIHNjaGVkdWxlZFxuICBoYXMoZW5naW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19lbmdpbmVzLmhhcyhlbmdpbmUpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcy5sZW5ndGggPSAwO1xuICB9XG59XG4iXX0=