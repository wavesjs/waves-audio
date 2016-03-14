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
      var getCurrentPosition = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      if (!engine.implementsScheduled()) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      // set master and add to array
      engine.master = this;
      this.__engines.add(engine);

      // schedule engine
      this.__scheduleEngine(engine, time);
      this.__resetTick();

      return engine;
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
//# sourceMappingURL=data:application/json;base64,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QUssWUFBTCxDQUFrQixNQUFsQixHQUEyQixDQUEzQixDQVBNOzs7O3dCQTVEVTtBQUNoQixhQUFPLEtBQUssYUFBTCxJQUFzQixLQUFLLFlBQUwsQ0FBa0IsV0FBbEIsR0FBZ0MsS0FBSyxTQUFMLENBRDdDOzs7O3dCQUlJO0FBQ3BCLGFBQU8sU0FBUCxDQURvQjs7O1NBN0dIIiwiZmlsZSI6InNpbXBsZS1zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZVNjaGVkdWxlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3NjaGVkVGltZXMgPSBbXTtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fCAwLjE7XG4gIH1cblxuICBfX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLnB1c2godGltZSk7XG4gIH1cblxuICBfX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzW2luZGV4XSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgICB9XG4gIH1cblxuICBfX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBfX3Jlc2V0VGljaygpIHtcbiAgICBpZiAodGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIXRoaXMuX190aW1lb3V0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2ltcGxlU2NoZWR1bGVyIFN0YXJ0XCIpO1xuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiU2ltcGxlU2NoZWR1bGVyIFN0b3BcIik7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fdGljaygpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCkge1xuICAgICAgdmFyIGVuZ2luZSA9IHRoaXMuX19zY2hlZEVuZ2luZXNbaV07XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zY2hlZFRpbWVzW2ldO1xuXG4gICAgICB3aGlsZSAodGltZSAmJiB0aW1lIDw9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgICB0aW1lID0gZW5naW5lLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAmJiB0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaSsrXSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBlbmdpbmUgZnJvbSBzY2hlZHVsZXJcbiAgICAgICAgaWYgKCF0aW1lKSB7XG4gICAgICAgICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9LCB0aGlzLnBlcmlvZCAqIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKCkgeyBmdW4oKTsgfSwgLy8gbWFrZSBzdXIgdGhhdCB0aGUgYWR2YW5jZVRpbWUgbWV0aG9kIGRvZXMgbm90IHJldHVybSBhbnl0aGluZ1xuICAgIH0sIHRpbWUpO1xuICB9XG5cbiAgLy8gYWRkIGEgdGltZSBlbmdpbmUgdG8gdGhlIHF1ZXVlIGFuZCByZXR1cm4gdGhlIGVuZ2luZVxuICBhZGQoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSwgZ2V0Q3VycmVudFBvc2l0aW9uID0gbnVsbCkge1xuICAgIGlmICghZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIC8vIHNldCBtYXN0ZXIgYW5kIGFkZCB0byBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmVzLmFkZChlbmdpbmUpO1xuXG4gICAgLy8gc2NoZWR1bGUgZW5naW5lXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuXG4gICAgcmV0dXJuIGVuZ2luZTtcbiAgfVxuXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBpZiAoIWVuZ2luZS5tYXN0ZXIgfHwgZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImVuZ2luZSBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICAvLyByZXNldCBtYXN0ZXIgYW5kIHJlbW92ZSBmcm9tIGFycmF5XG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG5cbiAgICAvLyB1bnNjaGVkdWxlIGVuZ2luZVxuICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVUaW1lKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICB0aGlzLl9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIC8vIGNoZWNrIHdoZXRoZXIgYSBnaXZlbiBlbmdpbmUgaXMgc2NoZWR1bGVkXG4gIGhhcyhlbmdpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5fX2VuZ2luZXMuaGFzKGVuZ2luZSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiJdfQ==