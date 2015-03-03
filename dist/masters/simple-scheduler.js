"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE simplified scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */

var TimeEngine = require("../core/time-engine");
var defaultAudioContext = require("../core/audio-context");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var SimpleScheduler = (function () {
  function SimpleScheduler() {
    var options = arguments[0] === undefined ? {} : arguments[0];
    var audioContext = arguments[1] === undefined ? defaultAudioContext : arguments[1];

    _babelHelpers.classCallCheck(this, SimpleScheduler);

    this.__audioContext = audioContext;

    this.__engines = [];

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

  _babelHelpers.prototypeProperties(SimpleScheduler, null, {
    __scheduleEngine: {
      value: function __scheduleEngine(engine, time) {
        this.__schedEngines.push(engine);
        this.__schedTimes.push(time);
      },
      writable: true,
      configurable: true
    },
    __rescheduleEngine: {
      value: function __rescheduleEngine(engine, time) {
        var index = this.__schedEngines.indexOf(engine);

        if (index >= 0) {
          if (time !== Infinity) {
            this.__schedTimes[index] = time;
          } else {
            this.__schedEngines.splice(index, 1);
            this.__schedTimes.splice(index, 1);
          }
        }
      },
      writable: true,
      configurable: true
    },
    __unscheduleEngine: {
      value: function __unscheduleEngine(engine) {
        var index = this.__schedEngines.indexOf(engine);

        if (index >= 0) {
          this.__schedEngines.splice(index, 1);
          this.__schedTimes.splice(index, 1);
        }
      },
      writable: true,
      configurable: true
    },
    __resetTick: {
      value: function __resetTick() {
        if (this.__schedEngines.length > 0) {
          if (!this.__timeout) this.__tick();
        } else if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }
      },
      writable: true,
      configurable: true
    },
    __tick: {
      value: function __tick() {
        var _this = this;

        var audioContext = this.__audioContext;
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
            if (!time && arrayRemove(this.__engines, engine)) engine.resetInterface();
          }
        }

        this.__currentTime = null;
        this.__timeout = null;

        if (this.__schedEngines.length > 0) {
          this.__timeout = setTimeout(function () {
            _this.__tick();
          }, this.period * 1000);
        }
      },
      writable: true,
      configurable: true
    },
    currentTime: {

      /**
       * Get scheduler time
       * @return {Number} current scheduler time including lookahead
       */

      get: function () {
        return this.__currentTime || this.__audioContext.currentTime + this.lookahead;
      },
      configurable: true
    },
    callback: {

      /**
       * Add a callback to the scheduler
       * @param {Function} callback function(time) to be called
       * @param {Number} time of first callback (default is now)
       * @param {Number} period callback period (default is 0 for one-shot)
       * @return {Object} scheduled object that can be used to call remove and reset
       */

      value: function callback(callbackFunction) {
        var time = arguments[1] === undefined ? this.currentTime : arguments[1];

        var engineWrapper = {
          advanceTime: callbackFunction
        };

        this.__scheduleEngine(engineWrapper, time);
        this.__resetTick();

        return engineWrapper;
      },
      writable: true,
      configurable: true
    },
    add: {

      /**
       * Add a time engine to the scheduler
       * @param {Object} engine time engine to be added to the scheduler
       * @param {Number} time scheduling time
       */

      value: function add(engine) {
        var _this = this;

        var time = arguments[1] === undefined ? this.currentTime : arguments[1];
        var getCurrentPosition = arguments[2] === undefined ? null : arguments[2];

        if (engine instanceof Function) {
          // construct minimal scheduled time engine
          engine = {
            advanceTime: engine
          };
        } else {
          if (!engine.implementsScheduled()) throw new Error("object cannot be added to scheduler");

          if (engine.master) throw new Error("object has already been added to a master");

          // register engine
          this.__engines.push(engine);

          // set scheduled interface
          engine.setScheduled(this, function (time) {
            _this.__rescheduleEngine(engine, time);
            _this.__resetTick();
          }, function () {
            return _this.currentTime;
          }, getCurrentPosition);
        }

        this.__scheduleEngine(engine, time);
        this.__resetTick();

        return engine;
      },
      writable: true,
      configurable: true
    },
    remove: {

      /**
       * Remove a scheduled time engine or callback from the scheduler
       * @param {Object} engine time engine or callback to be removed from the scheduler
       */

      value: function remove(engine) {
        var master = engine.master;

        if (master) {
          if (master !== this) throw new Error("object has not been added to this scheduler");

          engine.resetInterface();
          arrayRemove(this.__engines, engine);
        }

        this.__unscheduleEngine(engine);
        this.__resetTick();
      },
      writable: true,
      configurable: true
    },
    reset: {

      /**
       * Reschedule a scheduled time engine or callback
       * @param {Object} engine time engine or callback to be rescheduled
       * @param {Number} time time when to reschedule
       */

      value: function reset(engine, time) {
        this.__rescheduleEngine(engine, time);
        this.__resetTick();
      },
      writable: true,
      configurable: true
    },
    clear: {
      value: function clear() {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        this.__schedEngines.length = 0;
        this.__schedTimes.length = 0;
      },
      writable: true,
      configurable: true
    }
  });

  return SimpleScheduler;
})();

// export scheduler singleton
module.exports = SimpleScheduler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQU1BLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2hELElBQUksbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7O0FBRTNELFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDakMsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFakMsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsU0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLEtBQUssQ0FBQztDQUNkOztJQUVLLGVBQWU7QUFDUixXQURQLGVBQWU7UUFDUCxPQUFPLGdDQUFHLEVBQUU7UUFBRSxZQUFZLGdDQUFHLG1CQUFtQjs7dUNBRHhELGVBQWU7O0FBRWpCLFFBQUksQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDOztBQUVuQyxRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTXRDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSyxHQUFHLENBQUM7R0FDNUM7O29DQXZCRyxlQUFlO0FBeUJuQixvQkFBZ0I7YUFBQSwwQkFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLFlBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlCOzs7O0FBRUQsc0JBQWtCO2FBQUEsNEJBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUMvQixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFaEQsWUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsY0FBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3JCLGdCQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztXQUNqQyxNQUFNO0FBQ0wsZ0JBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQyxnQkFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1dBQ3BDO1NBQ0Y7T0FDRjs7OztBQUVELHNCQUFrQjthQUFBLDRCQUFDLE1BQU0sRUFBRTtBQUN6QixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFaEQsWUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsY0FBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLGNBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNwQztPQUNGOzs7O0FBRUQsZUFBVzthQUFBLHVCQUFHO0FBQ1osWUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDbEMsY0FBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ2pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNqQixNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN6QixzQkFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixjQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN2QjtPQUNGOzs7O0FBRUQsVUFBTTthQUFBLGtCQUFHOzs7QUFDUCxZQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQ3ZDLFlBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFVixlQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRTtBQUNyQyxjQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLGNBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWhDLGlCQUFPLElBQUksSUFBSSxJQUFJLElBQUksWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ2hFLGdCQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2hELGdCQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixnQkFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7V0FDakM7O0FBRUQsY0FBSSxJQUFJLElBQUksSUFBSSxHQUFHLFFBQVEsRUFBRTtBQUMzQixnQkFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztXQUMvQixNQUFNO0FBQ0wsZ0JBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR2hDLGdCQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUM5QyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7V0FDM0I7U0FDRjs7QUFFRCxZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7QUFFdEIsWUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDbEMsY0FBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsWUFBTTtBQUNoQyxrQkFBSyxNQUFNLEVBQUUsQ0FBQztXQUNmLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztTQUN4QjtPQUNGOzs7O0FBTUcsZUFBVzs7Ozs7OztXQUFBLFlBQUc7QUFDaEIsZUFBTyxJQUFJLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7T0FDL0U7OztBQVNELFlBQVE7Ozs7Ozs7Ozs7YUFBQSxrQkFBQyxnQkFBZ0IsRUFBMkI7WUFBekIsSUFBSSxnQ0FBRyxJQUFJLENBQUMsV0FBVzs7QUFDaEQsWUFBSSxhQUFhLEdBQUc7QUFDbEIscUJBQVcsRUFBRSxnQkFBZ0I7U0FDOUIsQ0FBQzs7QUFFRixZQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNDLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFbkIsZUFBTyxhQUFhLENBQUM7T0FDdEI7Ozs7QUFPRCxPQUFHOzs7Ozs7OzthQUFBLGFBQUMsTUFBTSxFQUFzRDs7O1lBQXBELElBQUksZ0NBQUcsSUFBSSxDQUFDLFdBQVc7WUFBRSxrQkFBa0IsZ0NBQUcsSUFBSTs7QUFDNUQsWUFBSSxNQUFNLFlBQVksUUFBUSxFQUFFOztBQUU5QixnQkFBTSxHQUFHO0FBQ1AsdUJBQVcsRUFBRSxNQUFNO1dBQ3BCLENBQUM7U0FDSCxNQUFNO0FBQ0wsY0FBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxFQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7O0FBRXpELGNBQUksTUFBTSxDQUFDLE1BQU0sRUFDZixNQUFNLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUM7OztBQUcvRCxjQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBRzVCLGdCQUFNLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFDLElBQUksRUFBSztBQUNsQyxrQkFBSyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDdEMsa0JBQUssV0FBVyxFQUFFLENBQUM7V0FDcEIsRUFBRSxZQUFNO0FBQ1AsbUJBQU8sTUFBSyxXQUFXLENBQUM7V0FDekIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3hCOztBQUVELFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEMsWUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVuQixlQUFPLE1BQU0sQ0FBQztPQUNmOzs7O0FBTUQsVUFBTTs7Ozs7OzthQUFBLGdCQUFDLE1BQU0sRUFBRTtBQUNiLFlBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRTNCLFlBQUksTUFBTSxFQUFFO0FBQ1YsY0FBSSxNQUFNLEtBQUssSUFBSSxFQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7O0FBRWpFLGdCQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDeEIscUJBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3JDOztBQUVELFlBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxZQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDcEI7Ozs7QUFPRCxTQUFLOzs7Ozs7OzthQUFBLGVBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUNsQixZQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RDLFlBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUNwQjs7OztBQUVELFNBQUs7YUFBQSxpQkFBRztBQUNOLFlBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQixzQkFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixjQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN2Qjs7QUFFRCxZQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDL0IsWUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO09BQzlCOzs7Ozs7U0FwTUcsZUFBZTs7OztBQXdNckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoic3JjL3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBzaW1wbGlmaWVkIHNjaGVkdWxlciBzaW5nbGV0b24gYmFzZWQgb24gYXVkaW8gdGltZSAodGltZS1lbmdpbmUgbWFzdGVyKVxuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cblxudmFyIFRpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS90aW1lLWVuZ2luZVwiKTtcbnZhciBkZWZhdWx0QXVkaW9Db250ZXh0ID0gcmVxdWlyZShcIi4uL2NvcmUvYXVkaW8tY29udGV4dFwiKTtcblxuZnVuY3Rpb24gYXJyYXlSZW1vdmUoYXJyYXksIHZhbHVlKSB7XG4gIHZhciBpbmRleCA9IGFycmF5LmluZGV4T2YodmFsdWUpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuY2xhc3MgU2ltcGxlU2NoZWR1bGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9LCBhdWRpb0NvbnRleHQgPSBkZWZhdWx0QXVkaW9Db250ZXh0KSB7XG4gICAgdGhpcy5fX2F1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gW107XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3NjaGVkVGltZXMgPSBbXTtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fCAgMC4xO1xuICB9XG5cbiAgX19zY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnB1c2goZW5naW5lKTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICB9XG5cbiAgX19yZXNjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX19zY2hlZEVuZ2luZXMuaW5kZXhPZihlbmdpbmUpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpbmRleF0gPSB0aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIF9fcmVzZXRUaWNrKCkge1xuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICghdGhpcy5fX3RpbWVvdXQpXG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfX3RpY2soKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuX19hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCkge1xuICAgICAgdmFyIGVuZ2luZSA9IHRoaXMuX19zY2hlZEVuZ2luZXNbaV07XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zY2hlZFRpbWVzW2ldO1xuXG4gICAgICB3aGlsZSAodGltZSAmJiB0aW1lIDw9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgICB0aW1lID0gZW5naW5lLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAmJiB0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaSsrXSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBlbmdpbmUgZnJvbSBzY2hlZHVsZXJcbiAgICAgICAgaWYgKCF0aW1lICYmIGFycmF5UmVtb3ZlKHRoaXMuX19lbmdpbmVzLCBlbmdpbmUpKVxuICAgICAgICAgIGVuZ2luZS5yZXNldEludGVyZmFjZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH0sIHRoaXMucGVyaW9kICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBzY2hlZHVsZXIgdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgc2NoZWR1bGVyIHRpbWUgaW5jbHVkaW5nIGxvb2thaGVhZFxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5fX2F1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGNhbGxiYWNrIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24odGltZSkgdG8gYmUgY2FsbGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG9mIGZpcnN0IGNhbGxiYWNrIChkZWZhdWx0IGlzIG5vdylcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBlcmlvZCBjYWxsYmFjayBwZXJpb2QgKGRlZmF1bHQgaXMgMCBmb3Igb25lLXNob3QpXG4gICAqIEByZXR1cm4ge09iamVjdH0gc2NoZWR1bGVkIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNhbGwgcmVtb3ZlIGFuZCByZXNldFxuICAgKi9cbiAgY2FsbGJhY2soY2FsbGJhY2tGdW5jdGlvbiwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICB2YXIgZW5naW5lV3JhcHBlciA9IHtcbiAgICAgIGFkdmFuY2VUaW1lOiBjYWxsYmFja0Z1bmN0aW9uXG4gICAgfTtcblxuICAgIHRoaXMuX19zY2hlZHVsZUVuZ2luZShlbmdpbmVXcmFwcGVyLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG5cbiAgICByZXR1cm4gZW5naW5lV3JhcHBlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgdGltZSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHNjaGVkdWxlclxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBzY2hlZHVsaW5nIHRpbWVcbiAgICovXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lLCBnZXRDdXJyZW50UG9zaXRpb24gPSBudWxsKSB7XG4gICAgaWYgKGVuZ2luZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAvLyBjb25zdHJ1Y3QgbWluaW1hbCBzY2hlZHVsZWQgdGltZSBlbmdpbmVcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGVuZ2luZVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHNjaGVkdWxlclwiKTtcblxuICAgICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgICAvLyByZWdpc3RlciBlbmdpbmVcbiAgICAgIHRoaXMuX19lbmdpbmVzLnB1c2goZW5naW5lKTtcblxuICAgICAgLy8gc2V0IHNjaGVkdWxlZCBpbnRlcmZhY2VcbiAgICAgIGVuZ2luZS5zZXRTY2hlZHVsZWQodGhpcywgKHRpbWUpID0+IHtcbiAgICAgICAgdGhpcy5fX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgIH0sIGdldEN1cnJlbnRQb3NpdGlvbik7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuXG4gICAgcmV0dXJuIGVuZ2luZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBzY2hlZHVsZWQgdGltZSBlbmdpbmUgb3IgY2FsbGJhY2sgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgdGltZSBlbmdpbmUgb3IgY2FsbGJhY2sgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBzY2hlZHVsZXJcbiAgICovXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICB2YXIgbWFzdGVyID0gZW5naW5lLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIpIHtcbiAgICAgIGlmIChtYXN0ZXIgIT09IHRoaXMpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICAgIGVuZ2luZS5yZXNldEludGVyZmFjZSgpO1xuICAgICAgYXJyYXlSZW1vdmUodGhpcy5fX2VuZ2luZXMsIGVuZ2luZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzY2hlZHVsZSBhIHNjaGVkdWxlZCB0aW1lIGVuZ2luZSBvciBjYWxsYmFja1xuICAgKiBAcGFyYW0ge09iamVjdH0gZW5naW5lIHRpbWUgZW5naW5lIG9yIGNhbGxiYWNrIHRvIGJlIHJlc2NoZWR1bGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWUgd2hlbiB0byByZXNjaGVkdWxlXG4gICAqL1xuICByZXNldChlbmdpbmUsIHRpbWUpIHtcbiAgICB0aGlzLl9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMubGVuZ3RoID0gMDtcbiAgfVxufVxuXG4vLyBleHBvcnQgc2NoZWR1bGVyIHNpbmdsZXRvblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVTY2hlZHVsZXI7XG4iXX0=