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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBTUEsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRWhELFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDakMsTUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFakMsTUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO0FBQ2QsU0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkIsV0FBTyxJQUFJLENBQUM7R0FDYjs7QUFFRCxTQUFPLEtBQUssQ0FBQztDQUNkOztJQUVLLGVBQWU7QUFDUixXQURQLGVBQWUsQ0FDUCxZQUFZO1FBQUUsT0FBTyxnQ0FBRyxFQUFFOzt1Q0FEbEMsZUFBZTs7QUFFakIsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7O0FBRWpDLFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDOztBQUVwQixRQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUN6QixRQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Ozs7OztBQU10QixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDOzs7Ozs7QUFNdEMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFLLEdBQUcsQ0FBQztHQUM1Qzs7b0NBdkJHLGVBQWU7QUF5Qm5CLG9CQUFnQjthQUFBLDBCQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDN0IsWUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMs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QVMsQ0FBQyxDQUFDO0FBQzdCLGNBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1NBQ3ZCOztBQUVELFlBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMvQixZQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7T0FDOUI7Ozs7OztTQXBNRyxlQUFlOzs7O0FBd01yQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgc2ltcGxpZmllZCBzY2hlZHVsZXIgc2luZ2xldG9uIGJhc2VkIG9uIGF1ZGlvIHRpbWUgKHRpbWUtZW5naW5lIG1hc3RlcilcbiAqIEBhdXRob3IgTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyLCBWaWN0b3IuU2FpekBpcmNhbS5mciwgS2FyaW0uQmFya2F0aUBpcmNhbS5mclxuICovXG5cbnZhciBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG5cbmZ1bmN0aW9uIGFycmF5UmVtb3ZlKGFycmF5LCB2YWx1ZSkge1xuICB2YXIgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmNsYXNzIFNpbXBsZVNjaGVkdWxlciB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQ29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLl9fZW5naW5lcyA9IFtdO1xuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcyA9IFtdO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzID0gW107XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciAoc2V0VGltZW91dCkgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZCA9IG9wdGlvbnMucGVyaW9kIHx8IDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgIDAuMTtcbiAgfVxuXG4gIF9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgfVxuXG4gIF9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaW5kZXhdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBfX3Jlc2V0VGljaygpIHtcbiAgICBpZiAodGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIXRoaXMuX190aW1lb3V0KVxuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX190aWNrKCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgZW5naW5lID0gdGhpcy5fX3NjaGVkRW5naW5lc1tpXTtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5fX3NjaGVkVGltZXNbaV07XG5cbiAgICAgIHdoaWxlICh0aW1lICYmIHRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICAgIHRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICYmIHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpKytdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGVuZ2luZSBmcm9tIHNjaGVkdWxlclxuICAgICAgICBpZiAoIXRpbWUgJiYgYXJyYXlSZW1vdmUodGhpcy5fX2VuZ2luZXMsIGVuZ2luZSkpXG4gICAgICAgICAgZW5naW5lLnJlc2V0SW50ZXJmYWNlKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgfSwgdGhpcy5wZXJpb2QgKiAxMDAwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNjaGVkdWxlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBzY2hlZHVsZXIgdGltZSBpbmNsdWRpbmcgbG9va2FoZWFkXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIGNhbGxiYWNrIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24odGltZSkgdG8gYmUgY2FsbGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG9mIGZpcnN0IGNhbGxiYWNrIChkZWZhdWx0IGlzIG5vdylcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBlcmlvZCBjYWxsYmFjayBwZXJpb2QgKGRlZmF1bHQgaXMgMCBmb3Igb25lLXNob3QpXG4gICAqIEByZXR1cm4ge09iamVjdH0gc2NoZWR1bGVkIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIGNhbGwgcmVtb3ZlIGFuZCByZXNldFxuICAgKi9cbiAgY2FsbGJhY2soY2FsbGJhY2tGdW5jdGlvbiwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICB2YXIgZW5naW5lV3JhcHBlciA9IHtcbiAgICAgIGFkdmFuY2VUaW1lOiBjYWxsYmFja0Z1bmN0aW9uXG4gICAgfTtcblxuICAgIHRoaXMuX19zY2hlZHVsZUVuZ2luZShlbmdpbmVXcmFwcGVyLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG5cbiAgICByZXR1cm4gZW5naW5lV3JhcHBlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgdGltZSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHNjaGVkdWxlclxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBzY2hlZHVsaW5nIHRpbWVcbiAgICovXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lLCBnZXRDdXJyZW50UG9zaXRpb24gPSBudWxsKSB7XG4gICAgaWYgKGVuZ2luZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAvLyBjb25zdHJ1Y3QgbWluaW1hbCBzY2hlZHVsZWQgdGltZSBlbmdpbmVcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGVuZ2luZVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHNjaGVkdWxlclwiKTtcblxuICAgICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgICAvLyByZWdpc3RlciBlbmdpbmVcbiAgICAgIHRoaXMuX19lbmdpbmVzLnB1c2goZW5naW5lKTtcblxuICAgICAgLy8gc2V0IHNjaGVkdWxlZCBpbnRlcmZhY2VcbiAgICAgIGVuZ2luZS5zZXRTY2hlZHVsZWQodGhpcywgKHRpbWUpID0+IHtcbiAgICAgICAgdGhpcy5fX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgIH0sIGdldEN1cnJlbnRQb3NpdGlvbik7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuXG4gICAgcmV0dXJuIGVuZ2luZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBzY2hlZHVsZWQgdGltZSBlbmdpbmUgb3IgY2FsbGJhY2sgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgdGltZSBlbmdpbmUgb3IgY2FsbGJhY2sgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBzY2hlZHVsZXJcbiAgICovXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICB2YXIgbWFzdGVyID0gZW5naW5lLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIpIHtcbiAgICAgIGlmIChtYXN0ZXIgIT09IHRoaXMpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICAgIGVuZ2luZS5yZXNldEludGVyZmFjZSgpO1xuICAgICAgYXJyYXlSZW1vdmUodGhpcy5fX2VuZ2luZXMsIGVuZ2luZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzY2hlZHVsZSBhIHNjaGVkdWxlZCB0aW1lIGVuZ2luZSBvciBjYWxsYmFja1xuICAgKiBAcGFyYW0ge09iamVjdH0gZW5naW5lIHRpbWUgZW5naW5lIG9yIGNhbGxiYWNrIHRvIGJlIHJlc2NoZWR1bGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWUgd2hlbiB0byByZXNjaGVkdWxlXG4gICAqL1xuICByZXNldChlbmdpbmUsIHRpbWUpIHtcbiAgICB0aGlzLl9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMubGVuZ3RoID0gMDtcbiAgfVxufVxuXG4vLyBleHBvcnQgc2NoZWR1bGVyIHNpbmdsZXRvblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVTY2hlZHVsZXI7XG4iXX0=