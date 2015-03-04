"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE simplified scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */

var TimeEngine = require("../core/time-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var SimpleScheduler = (function () {
  function SimpleScheduler(audioContext) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _babelHelpers.classCallCheck(this, SimpleScheduler);

    this.audioContext = audioContext;

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
        return this.__currentTime || this.audioContext.currentTime + this.lookahead;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQU1BLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUVoRCxTQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ2pDLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWpDLE1BQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLFNBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7SUFFSyxlQUFlO0FBQ1IsV0FEUCxlQUFlLENBQ1AsWUFBWTtRQUFFLE9BQU8sZ0NBQUcsRUFBRTs7dUNBRGxDLGVBQWU7O0FBRWpCLFFBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDOztBQUVqQyxRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTXRDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSyxHQUFHLENBQUM7R0FDNUM7O29DQXZCRyxlQUFlO0FBeUJuQixvQkFBZ0I7YUFBQSwwQkFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FB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QyxTQUFTLENBQUMsQ0FBQztBQUM3QixjQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN2Qjs7QUFFRCxZQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDL0IsWUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO09BQzlCOzs7Ozs7U0FwTUcsZUFBZTs7OztBQXdNckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoic3JjL3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBzaW1wbGlmaWVkIHNjaGVkdWxlciBzaW5nbGV0b24gYmFzZWQgb24gYXVkaW8gdGltZSAodGltZS1lbmdpbmUgbWFzdGVyKVxuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cblxudmFyIFRpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS90aW1lLWVuZ2luZVwiKTtcblxuZnVuY3Rpb24gYXJyYXlSZW1vdmUoYXJyYXksIHZhbHVlKSB7XG4gIHZhciBpbmRleCA9IGFycmF5LmluZGV4T2YodmFsdWUpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn1cblxuY2xhc3MgU2ltcGxlU2NoZWR1bGVyIHtcbiAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gW107XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3NjaGVkVGltZXMgPSBbXTtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fCAgMC4xO1xuICB9XG5cbiAgX19zY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnB1c2goZW5naW5lKTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICB9XG5cbiAgX19yZXNjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX19zY2hlZEVuZ2luZXMuaW5kZXhPZihlbmdpbmUpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpbmRleF0gPSB0aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIF9fcmVzZXRUaWNrKCkge1xuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICghdGhpcy5fX3RpbWVvdXQpXG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfX3RpY2soKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGgpIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fc2NoZWRFbmdpbmVzW2ldO1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLl9fc2NoZWRUaW1lc1tpXTtcblxuICAgICAgd2hpbGUgKHRpbWUgJiYgdGltZSA8PSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZCkge1xuICAgICAgICB0aW1lID0gTWF0aC5tYXgodGltZSwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgICAgdGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgJiYgdGltZSA8IEluZmluaXR5KSB7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzW2krK10gPSB0aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKTtcblxuICAgICAgICAvLyByZW1vdmUgZW5naW5lIGZyb20gc2NoZWR1bGVyXG4gICAgICAgIGlmICghdGltZSAmJiBhcnJheVJlbW92ZSh0aGlzLl9fZW5naW5lcywgZW5naW5lKSlcbiAgICAgICAgICBlbmdpbmUucmVzZXRJbnRlcmZhY2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9LCB0aGlzLnBlcmlvZCAqIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgc2NoZWR1bGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHNjaGVkdWxlciB0aW1lIGluY2x1ZGluZyBsb29rYWhlYWRcbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgY2FsbGJhY2sgdG8gdGhlIHNjaGVkdWxlclxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbih0aW1lKSB0byBiZSBjYWxsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgb2YgZmlyc3QgY2FsbGJhY2sgKGRlZmF1bHQgaXMgbm93KVxuICAgKiBAcGFyYW0ge051bWJlcn0gcGVyaW9kIGNhbGxiYWNrIHBlcmlvZCAoZGVmYXVsdCBpcyAwIGZvciBvbmUtc2hvdClcbiAgICogQHJldHVybiB7T2JqZWN0fSBzY2hlZHVsZWQgb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG8gY2FsbCByZW1vdmUgYW5kIHJlc2V0XG4gICAqL1xuICBjYWxsYmFjayhjYWxsYmFja0Z1bmN0aW9uLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIHZhciBlbmdpbmVXcmFwcGVyID0ge1xuICAgICAgYWR2YW5jZVRpbWU6IGNhbGxiYWNrRnVuY3Rpb25cbiAgICB9O1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZVdyYXBwZXIsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcblxuICAgIHJldHVybiBlbmdpbmVXcmFwcGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVuZ2luZSB0aW1lIGVuZ2luZSB0byBiZSBhZGRlZCB0byB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHNjaGVkdWxpbmcgdGltZVxuICAgKi9cbiAgYWRkKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUsIGdldEN1cnJlbnRQb3NpdGlvbiA9IG51bGwpIHtcbiAgICBpZiAoZW5naW5lIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIC8vIGNvbnN0cnVjdCBtaW5pbWFsIHNjaGVkdWxlZCB0aW1lIGVuZ2luZVxuICAgICAgZW5naW5lID0ge1xuICAgICAgICBhZHZhbmNlVGltZTogZW5naW5lXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICAgIC8vIHJlZ2lzdGVyIGVuZ2luZVxuICAgICAgdGhpcy5fX2VuZ2luZXMucHVzaChlbmdpbmUpO1xuXG4gICAgICAvLyBzZXQgc2NoZWR1bGVkIGludGVyZmFjZVxuICAgICAgZW5naW5lLnNldFNjaGVkdWxlZCh0aGlzLCAodGltZSkgPT4ge1xuICAgICAgICB0aGlzLl9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgICAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gICAgICB9LCAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgfSwgZ2V0Q3VycmVudFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG5cbiAgICByZXR1cm4gZW5naW5lO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHNjaGVkdWxlZCB0aW1lIGVuZ2luZSBvciBjYWxsYmFjayBmcm9tIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVuZ2luZSB0aW1lIGVuZ2luZSBvciBjYWxsYmFjayB0byBiZSByZW1vdmVkIGZyb20gdGhlIHNjaGVkdWxlclxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZSkge1xuICAgIHZhciBtYXN0ZXIgPSBlbmdpbmUubWFzdGVyO1xuXG4gICAgaWYgKG1hc3Rlcikge1xuICAgICAgaWYgKG1hc3RlciAhPT0gdGhpcylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgICAgZW5naW5lLnJlc2V0SW50ZXJmYWNlKCk7XG4gICAgICBhcnJheVJlbW92ZSh0aGlzLl9fZW5naW5lcywgZW5naW5lKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNjaGVkdWxlIGEgc2NoZWR1bGVkIHRpbWUgZW5naW5lIG9yIGNhbGxiYWNrXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgdGltZSBlbmdpbmUgb3IgY2FsbGJhY2sgdG8gYmUgcmVzY2hlZHVsZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgdGltZSB3aGVuIHRvIHJlc2NoZWR1bGVcbiAgICovXG4gIHJlc2V0KGVuZ2luZSwgdGltZSkge1xuICAgIHRoaXMuX19yZXNjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID0gMDtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbi8vIGV4cG9ydCBzY2hlZHVsZXIgc2luZ2xldG9uXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZVNjaGVkdWxlcjtcbiJdfQ==