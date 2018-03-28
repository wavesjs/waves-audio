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

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('wavesjs:audio');

/**
 *
 *
 *
 * The SimpleScheduler class implements a simplified master for time engines
 * (see TimeEngine or AudioTimeEngine) that implement the scheduled interface
 * such as the Metronome and the GranularEngine. The API and funtionalities of
 * the SimpleScheduler class are identical to the Scheduler class. But, other
 * than the Scheduler, the SimpleScheduler class does not guarantee the order
 * of events (i.e. calls to the advanceTime method of scheduled time engines
 * and to scheduled callback functions) within a scheduling period (see period
 * attribute).
 *
 * To get a unique instance of SimpleScheduler as the global scheduler of an
 * application, the getSimpleScheduler factory function should be used. The
 * function accepts an audio context as optional argument and uses the Waves
 * default audio context (see Audio Context) as default. The factory creates
 * a single (simple) scheduler for each audio context.
 *
 * Example that shows three Metronome engines running in a SimpleScheduler:
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/simple-scheduler.html}
 *
 * @param {Object} [options={}] - default options
 * @param {Number} [options.period=0.025] - period of the scheduler.
 * @param {Number} [options.lookahead=0.1] - lookahead of the scheduler.
 *
 * @see TimeEngine
 * @see AudioTimeEngine
 * @see getSimpleScheduler
 * @see Scheduler
 *
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getSimpleScheduler();
 *
 * scheduler.add(myEngine);
 */

var SimpleScheduler = function () {
  function SimpleScheduler() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
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
     * @name period
     * @memberof Scheduler
     * @instance
     */
    this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     * @name lookahead
     * @memberof Scheduler
     * @instance
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
          log('SimpleScheduler Start');
          this.__tick();
        }
      } else if (this.__timeout) {
        log('SimpleScheduler Stop');
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }
    }
  }, {
    key: '__tick',
    value: function __tick() {
      var _this = this;

      var audioContext = this.audioContext;
      var currentTime = audioContext.currentTime;
      var i = 0;

      while (i < this.__schedEngines.length) {
        var engine = this.__schedEngines[i];
        var time = this.__schedTimes[i];

        while (time && time <= currentTime + this.lookahead) {
          time = Math.max(time, currentTime);
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

    /**
     * Scheduler current logical time.
     *
     * @name currentTime
     * @type {Number}
     * @memberof Scheduler
     * @instance
     */

  }, {
    key: 'defer',


    // call a function at a given time
    /**
     * Defer the execution of a function at a given time.
     *
     * @param {Function} fun - Function to defer
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    value: function defer(fun) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime(time) {
          fun(time);
        } // make sur that the advanceTime method does not returm anything
      }, time);
    }

    /**
     * Add a TimeEngine function to the scheduler at an optionally given time.
     *
     * @param {TimeEngine} engine - Engine to add to the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!_timeEngine2.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      // set master and add to array
      engine.master = this;
      this.__engines.add(engine);

      // schedule engine
      this.__scheduleEngine(engine, time);
      this.__resetTick();
    }

    /**
     * Remove a TimeEngine from the scheduler that has been added to the
     * scheduler using the add method.
     *
     * @param {TimeEngine} engine - Engine to remove from the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */

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

    /**
     * Reschedule a scheduled time engine at a given time.
     *
     * @param {TimeEngine} engine - Engine to reschedule
     * @param {Number} time - Schedule time
     */

  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      this.__rescheduleEngine(engine, time);
      this.__resetTick();
    }

    /**
     * Check whether a given engine is scheduled.
     *
     * @param {TimeEngine} engine - Engine to check
     */

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }

    /**
     * Remove all engines from the scheduler.
     */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNpbXBsZS1zY2hlZHVsZXIuanMiXSwibmFtZXMiOlsibG9nIiwiU2ltcGxlU2NoZWR1bGVyIiwib3B0aW9ucyIsImF1ZGlvQ29udGV4dCIsIl9fZW5naW5lcyIsIl9fc2NoZWRFbmdpbmVzIiwiX19zY2hlZFRpbWVzIiwiX19jdXJyZW50VGltZSIsIl9fdGltZW91dCIsInBlcmlvZCIsImxvb2thaGVhZCIsImVuZ2luZSIsInRpbWUiLCJwdXNoIiwiaW5kZXgiLCJpbmRleE9mIiwiSW5maW5pdHkiLCJzcGxpY2UiLCJsZW5ndGgiLCJfX3RpY2siLCJjbGVhclRpbWVvdXQiLCJjdXJyZW50VGltZSIsImkiLCJNYXRoIiwibWF4IiwiYWR2YW5jZVRpbWUiLCJfX3Vuc2NoZWR1bGVFbmdpbmUiLCJtYXN0ZXIiLCJkZWxldGUiLCJzZXRUaW1lb3V0IiwiZnVuIiwiRnVuY3Rpb24iLCJFcnJvciIsImFkZCIsImltcGxlbWVudHNTY2hlZHVsZWQiLCJfX3NjaGVkdWxlRW5naW5lIiwiX19yZXNldFRpY2siLCJfX3Jlc2NoZWR1bGVFbmdpbmUiLCJoYXMiLCJ1bmRlZmluZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsTUFBTSxxQkFBTSxlQUFOLENBQVo7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBcUNNQyxlO0FBQ0osNkJBQTBCO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUE7O0FBQ3hCLFNBQUtDLFlBQUwsR0FBb0JELFFBQVFDLFlBQVIsMEJBQXBCOztBQUVBLFNBQUtDLFNBQUwsR0FBaUIsbUJBQWpCOztBQUVBLFNBQUtDLGNBQUwsR0FBc0IsRUFBdEI7QUFDQSxTQUFLQyxZQUFMLEdBQW9CLEVBQXBCOztBQUVBLFNBQUtDLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxTQUFLQyxTQUFMLEdBQWlCLElBQWpCOztBQUVBOzs7Ozs7O0FB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QUFPZ0IsTUFBUixJQUFrQmhCLE9BQU9nQixNQUFQLEtBQWtCLElBQXhDLEVBQ0UsTUFBTSxJQUFJSyxLQUFKLENBQVUsNkNBQVYsQ0FBTjs7QUFFRjtBQUNBckIsYUFBT2dCLE1BQVAsR0FBZ0IsSUFBaEI7QUFDQSxXQUFLdkIsU0FBTCxDQUFld0IsTUFBZixDQUFzQmpCLE1BQXRCOztBQUVBO0FBQ0EsV0FBS2Usa0JBQUwsQ0FBd0JmLE1BQXhCO0FBQ0EsV0FBS3lCLFdBQUw7QUFDRDs7QUFFRDs7Ozs7Ozs7O29DQU1nQnpCLE0sRUFBaUM7QUFBQSxVQUF6QkMsSUFBeUIsdUVBQWxCLEtBQUtTLFdBQWE7O0FBQy9DLFdBQUtnQixrQkFBTCxDQUF3QjFCLE1BQXhCLEVBQWdDQyxJQUFoQztBQUNBLFdBQUt3QixXQUFMO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O3dCQUtJekIsTSxFQUFRO0FBQ1YsYUFBTyxLQUFLUCxTQUFMLENBQWVrQyxHQUFmLENBQW1CM0IsTUFBbkIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7NEJBR1E7QUFDTixVQUFJLEtBQUtILFNBQVQsRUFBb0I7QUFDbEJZLHFCQUFhLEtBQUtaLFNBQWxCO0FBQ0EsYUFBS0EsU0FBTCxHQUFpQixJQUFqQjtBQUNEOztBQUVELFdBQUtILGNBQUwsQ0FBb0JhLE1BQXBCLEdBQTZCLENBQTdCO0FBQ0EsV0FBS1osWUFBTCxDQUFrQlksTUFBbEIsR0FBMkIsQ0FBM0I7QUFDRDs7O3dCQWpHaUI7QUFDaEIsYUFBTyxLQUFLWCxhQUFMLElBQXNCLEtBQUtKLFlBQUwsQ0FBa0JrQixXQUFsQixHQUFnQyxLQUFLWCxTQUFsRTtBQUNEOzs7d0JBRXFCO0FBQ3BCLGFBQU82QixTQUFQO0FBQ0Q7Ozs7O2tCQThGWXRDLGUiLCJmaWxlIjoic2ltcGxlLXNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCd3YXZlc2pzOmF1ZGlvJyk7XG5cbi8qKlxuICpcbiAqXG4gKlxuICogVGhlIFNpbXBsZVNjaGVkdWxlciBjbGFzcyBpbXBsZW1lbnRzIGEgc2ltcGxpZmllZCBtYXN0ZXIgZm9yIHRpbWUgZW5naW5lc1xuICogKHNlZSBUaW1lRW5naW5lIG9yIEF1ZGlvVGltZUVuZ2luZSkgdGhhdCBpbXBsZW1lbnQgdGhlIHNjaGVkdWxlZCBpbnRlcmZhY2VcbiAqIHN1Y2ggYXMgdGhlIE1ldHJvbm9tZSBhbmQgdGhlIEdyYW51bGFyRW5naW5lLiBUaGUgQVBJIGFuZCBmdW50aW9uYWxpdGllcyBvZlxuICogdGhlIFNpbXBsZVNjaGVkdWxlciBjbGFzcyBhcmUgaWRlbnRpY2FsIHRvIHRoZSBTY2hlZHVsZXIgY2xhc3MuIEJ1dCwgb3RoZXJcbiAqIHRoYW4gdGhlIFNjaGVkdWxlciwgdGhlIFNpbXBsZVNjaGVkdWxlciBjbGFzcyBkb2VzIG5vdCBndWFyYW50ZWUgdGhlIG9yZGVyXG4gKiBvZiBldmVudHMgKGkuZS4gY2FsbHMgdG8gdGhlIGFkdmFuY2VUaW1lIG1ldGhvZCBvZiBzY2hlZHVsZWQgdGltZSBlbmdpbmVzXG4gKiBhbmQgdG8gc2NoZWR1bGVkIGNhbGxiYWNrIGZ1bmN0aW9ucykgd2l0aGluIGEgc2NoZWR1bGluZyBwZXJpb2QgKHNlZSBwZXJpb2RcbiAqIGF0dHJpYnV0ZSkuXG4gKlxuICogVG8gZ2V0IGEgdW5pcXVlIGluc3RhbmNlIG9mIFNpbXBsZVNjaGVkdWxlciBhcyB0aGUgZ2xvYmFsIHNjaGVkdWxlciBvZiBhblxuICogYXBwbGljYXRpb24sIHRoZSBnZXRTaW1wbGVTY2hlZHVsZXIgZmFjdG9yeSBmdW5jdGlvbiBzaG91bGQgYmUgdXNlZC4gVGhlXG4gKiBmdW5jdGlvbiBhY2NlcHRzIGFuIGF1ZGlvIGNvbnRleHQgYXMgb3B0aW9uYWwgYXJndW1lbnQgYW5kIHVzZXMgdGhlIFdhdmVzXG4gKiBkZWZhdWx0IGF1ZGlvIGNvbnRleHQgKHNlZSBBdWRpbyBDb250ZXh0KSBhcyBkZWZhdWx0LiBUaGUgZmFjdG9yeSBjcmVhdGVzXG4gKiBhIHNpbmdsZSAoc2ltcGxlKSBzY2hlZHVsZXIgZm9yIGVhY2ggYXVkaW8gY29udGV4dC5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgdGhyZWUgTWV0cm9ub21lIGVuZ2luZXMgcnVubmluZyBpbiBhIFNpbXBsZVNjaGVkdWxlcjpcbiAqIHtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvc2ltcGxlLXNjaGVkdWxlci5odG1sfVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBkZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2Q9MC4wMjVdIC0gcGVyaW9kIG9mIHRoZSBzY2hlZHVsZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubG9va2FoZWFkPTAuMV0gLSBsb29rYWhlYWQgb2YgdGhlIHNjaGVkdWxlci5cbiAqXG4gKiBAc2VlIFRpbWVFbmdpbmVcbiAqIEBzZWUgQXVkaW9UaW1lRW5naW5lXG4gKiBAc2VlIGdldFNpbXBsZVNjaGVkdWxlclxuICogQHNlZSBTY2hlZHVsZXJcbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3Qgc2NoZWR1bGVyID0gYXVkaW8uZ2V0U2ltcGxlU2NoZWR1bGVyKCk7XG4gKlxuICogc2NoZWR1bGVyLmFkZChteUVuZ2luZSk7XG4gKi9cbmNsYXNzIFNpbXBsZVNjaGVkdWxlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3NjaGVkVGltZXMgPSBbXTtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBlcmlvZFxuICAgICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZCA9IG9wdGlvbnMucGVyaW9kIHx8IDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGxvb2thaGVhZFxuICAgICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IDAuMTtcbiAgfVxuXG4gIF9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgfVxuXG4gIF9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaW5kZXhdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIF9fcmVzZXRUaWNrKCkge1xuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICghdGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgbG9nKCdTaW1wbGVTY2hlZHVsZXIgU3RhcnQnKTtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICBsb2coJ1NpbXBsZVNjaGVkdWxlciBTdG9wJyk7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fdGljaygpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGN1cnJlbnRUaW1lID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGgpIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fc2NoZWRFbmdpbmVzW2ldO1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLl9fc2NoZWRUaW1lc1tpXTtcblxuICAgICAgd2hpbGUgKHRpbWUgJiYgdGltZSA8PSBjdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCBjdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICAgIHRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICYmIHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpKytdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGVuZ2luZSBmcm9tIHNjaGVkdWxlclxuICAgICAgICBpZiAoIXRpbWUpIHtcbiAgICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH0sIHRoaXMucGVyaW9kICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlciBjdXJyZW50IGxvZ2ljYWwgdGltZS5cbiAgICpcbiAgICogQG5hbWUgY3VycmVudFRpbWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIC8qKlxuICAgKiBEZWZlciB0aGUgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW4gLSBGdW5jdGlvbiB0byBkZWZlclxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RpbWU9dGhpcy5jdXJyZW50VGltZV0gLSBTY2hlZHVsZSB0aW1lXG4gICAqL1xuICBkZWZlcihmdW4sIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCEoZnVuIGluc3RhbmNlb2YgRnVuY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBkZWZlcmVkIGJ5IHNjaGVkdWxlclwiKTtcblxuICAgIHRoaXMuYWRkKHtcbiAgICAgIGFkdmFuY2VUaW1lOiBmdW5jdGlvbih0aW1lKSB7IGZ1bih0aW1lKTsgfSwgLy8gbWFrZSBzdXIgdGhhdCB0aGUgYWR2YW5jZVRpbWUgbWV0aG9kIGRvZXMgbm90IHJldHVybSBhbnl0aGluZ1xuICAgIH0sIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIFRpbWVFbmdpbmUgZnVuY3Rpb24gdG8gdGhlIHNjaGVkdWxlciBhdCBhbiBvcHRpb25hbGx5IGdpdmVuIHRpbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7VGltZUVuZ2luZX0gZW5naW5lIC0gRW5naW5lIHRvIGFkZCB0byB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCFUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIC8vIHNldCBtYXN0ZXIgYW5kIGFkZCB0byBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmVzLmFkZChlbmdpbmUpO1xuXG4gICAgLy8gc2NoZWR1bGUgZW5naW5lXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIFRpbWVFbmdpbmUgZnJvbSB0aGUgc2NoZWR1bGVyIHRoYXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlXG4gICAqIHNjaGVkdWxlciB1c2luZyB0aGUgYWRkIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gcmVtb3ZlIGZyb20gdGhlIHNjaGVkdWxlclxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RpbWU9dGhpcy5jdXJyZW50VGltZV0gLSBTY2hlZHVsZSB0aW1lXG4gICAqL1xuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKCFlbmdpbmUubWFzdGVyIHx8IGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJlbmdpbmUgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgLy8gcmVzZXQgbWFzdGVyIGFuZCByZW1vdmUgZnJvbSBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuXG4gICAgLy8gdW5zY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNjaGVkdWxlIGEgc2NoZWR1bGVkIHRpbWUgZW5naW5lIGF0IGEgZ2l2ZW4gdGltZS5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gcmVzY2hlZHVsZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgdGhpcy5fX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGVuZ2luZSBpcyBzY2hlZHVsZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7VGltZUVuZ2luZX0gZW5naW5lIC0gRW5naW5lIHRvIGNoZWNrXG4gICAqL1xuICBoYXMoZW5naW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19lbmdpbmVzLmhhcyhlbmdpbmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgZW5naW5lcyBmcm9tIHRoZSBzY2hlZHVsZXIuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2ltcGxlU2NoZWR1bGVyO1xuIl19