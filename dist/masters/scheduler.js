"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var PriorityQueue = require("../utils/priority-queue");
var TimeEngine = require("../core/time-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var Scheduler = (function () {
  function Scheduler(audioContext) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _babelHelpers.classCallCheck(this, Scheduler);

    this.audioContext = audioContext;

    this.__queue = new PriorityQueue();
    this.__engines = [];

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

  _babelHelpers.prototypeProperties(Scheduler, null, {
    __tick: {

      // setTimeout scheduling loop

      value: function __tick() {
        var audioContext = this.audioContext;
        var nextTime = this.__nextTime;

        this.__timeout = null;

        while (nextTime <= audioContext.currentTime + this.lookahead) {
          this.__currentTime = nextTime;

          var engine = this.__queue.head;
          var time = engine.advanceTime(this.__currentTime);

          if (time && time < Infinity) {
            nextTime = this.__queue.move(engine, Math.max(time, this.__currentTime));
          } else {
            nextTime = this.__queue.remove(engine);

            // remove time engine from scheduler if advanceTime returns null/undfined
            if (!time && engine.master === this) engine.resetInterface();
          }
        }

        this.__currentTime = null;
        this.__reschedule(nextTime);
      },
      writable: true,
      configurable: true
    },
    __reschedule: {
      value: function __reschedule(nextTime) {
        var _this = this;

        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        if (nextTime !== Infinity) {
          this.__nextTime = nextTime;

          var timeOutDelay = Math.max(nextTime - this.audioContext.currentTime - this.lookahead, this.period);

          this.__timeout = setTimeout(function () {
            _this.__tick();
          }, timeOutDelay * 1000);
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
    add: {

      /**
       * Add a time engine or a simple callback function to the scheduler
       * @param {Object} engine time engine to be added to the scheduler
       * @param {Number} time scheduling time
       * @param {Function} function to get current position
       * @return handle to the scheduled engine (use for calling further methods)
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
            var nextTime = _this.__queue.move(engine, time);
            _this.__reschedule(nextTime);
          }, function () {
            return _this.currentTime;
          }, getCurrentPosition);
        }

        // schedule engine or callback
        var nextTime = this.__queue.insert(engine, time);
        this.__reschedule(nextTime);

        return engine;
      },
      writable: true,
      configurable: true
    },
    remove: {

      /**
       * Remove a time engine from the scheduler
       * @param {Object} engine time engine or callback to be removed from the scheduler
       */

      value: function remove(engine) {
        var master = engine.master;

        if (master) {
          if (master !== this) throw new Error("object has not been added to this scheduler");

          engine.resetInterface();
          arrayRemove(this.__engines, engine);
        }

        var nextTime = this.__queue.remove(engine);
        this.__reschedule(nextTime);
      },
      writable: true,
      configurable: true
    },
    reset: {

      /**
       * Reschedule a scheduled time engine or callback at a given time
       * @param {Object} engine time engine or callback to be rescheduled
       * @param {Number} time time when to reschedule
       */

      value: function reset(engine, time) {
        var nextTime = this.__queue.move(engine, time);
        this.__reschedule(nextTime);
      },
      writable: true,
      configurable: true
    },
    clear: {

      /**
       * Remove all schdeduled callbacks and engines from the scheduler
       */

      value: function clear() {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        this.__queue.clear();
        this.__engines.length = 0;
      },
      writable: true,
      configurable: true
    }
  });

  return Scheduler;
})();

module.exports = Scheduler;
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQU9BLElBQUksYUFBYSxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3ZELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDOztBQUVoRCxTQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ2pDLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWpDLE1BQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLFNBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7SUFFSyxTQUFTO0FBQ0YsV0FEUCxTQUFTLENBQ0QsWUFBWTtRQUFFLE9BQU8sZ0NBQUcsRUFBRTs7dUNBRGxDLFNBQVM7O0FBRVgsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7O0FBRWpDLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztBQUNuQyxRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Ozs7OztBQU10QixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDOzs7Ozs7QUFNdEMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQztHQUMzQzs7b0NBdEJHLFNBQVM7QUF5QmIsVUFBTTs7OzthQUFBLGtCQUFHO0FBQ1AsWUFBSSxZQUFZLEdBQUcsSUFB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QUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixjQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUN2Qjs7QUFFRCxZQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztPQUMzQjs7Ozs7O1NBNUpHLFNBQVM7OztBQStKZixNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyIsImZpbGUiOiJzcmMvdXRpbHMvcHJpb3JpdHktcXVldWUuZXM2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogd3JpdHRlbiBpbiBFQ01Bc2NyaXB0IDYgKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIHNjaGVkdWxlciBzaW5nbGV0b24gYmFzZWQgb24gYXVkaW8gdGltZSAodGltZS1lbmdpbmUgbWFzdGVyKVxuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFByaW9yaXR5UXVldWUgPSByZXF1aXJlKFwiLi4vdXRpbHMvcHJpb3JpdHktcXVldWVcIik7XG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xuXG5mdW5jdGlvbiBhcnJheVJlbW92ZShhcnJheSwgdmFsdWUpIHtcbiAgdmFyIGluZGV4ID0gYXJyYXkuaW5kZXhPZih2YWx1ZSk7XG5cbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5jbGFzcyBTY2hlZHVsZXIge1xuICBjb25zdHJ1Y3RvcihhdWRpb0NvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gYXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX3F1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fZW5naW5lcyA9IFtdO1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBJbmZpbml0eTtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fMKgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fMKgMC4xO1xuICB9XG5cbiAgLy8gc2V0VGltZW91dCBzY2hlZHVsaW5nIGxvb3BcbiAgX190aWNrKCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLl9fbmV4dFRpbWU7XG5cbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICB3aGlsZSAobmV4dFRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG5leHRUaW1lO1xuXG4gICAgICB2YXIgZW5naW5lID0gdGhpcy5fX3F1ZXVlLmhlYWQ7XG4gICAgICB2YXIgdGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aGlzLl9fY3VycmVudFRpbWUpO1xuXG4gICAgICBpZiAodGltZSAmJiB0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgICAgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUubW92ZShlbmdpbmUsIE1hdGgubWF4KHRpbWUsIHRoaXMuX19jdXJyZW50VGltZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIHRpbWUgZW5naW5lIGZyb20gc2NoZWR1bGVyIGlmIGFkdmFuY2VUaW1lIHJldHVybnMgbnVsbC91bmRmaW5lZFxuICAgICAgICBpZiAoIXRpbWUgJiYgZW5naW5lLm1hc3RlciA9PT0gdGhpcylcbiAgICAgICAgICBlbmdpbmUucmVzZXRJbnRlcmZhY2UoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX19yZXNjaGVkdWxlKG5leHRUaW1lKTtcbiAgfVxuXG4gIF9fcmVzY2hlZHVsZShuZXh0VGltZSkge1xuICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAobmV4dFRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICB0aGlzLl9fbmV4dFRpbWUgPSBuZXh0VGltZTtcblxuICAgICAgdmFyIHRpbWVPdXREZWxheSA9IE1hdGgubWF4KChuZXh0VGltZSAtIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lIC0gdGhpcy5sb29rYWhlYWQpLCB0aGlzLnBlcmlvZCk7XG5cbiAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9LCB0aW1lT3V0RGVsYXkgKiAxMDAwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHNjaGVkdWxlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBzY2hlZHVsZXIgdGltZSBpbmNsdWRpbmcgbG9va2FoZWFkXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIG9yIGEgc2ltcGxlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IGVuZ2luZSB0aW1lIGVuZ2luZSB0byBiZSBhZGRlZCB0byB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHNjaGVkdWxpbmcgdGltZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvbiB0byBnZXQgY3VycmVudCBwb3NpdGlvblxuICAgKiBAcmV0dXJuIGhhbmRsZSB0byB0aGUgc2NoZWR1bGVkIGVuZ2luZSAodXNlIGZvciBjYWxsaW5nIGZ1cnRoZXIgbWV0aG9kcylcbiAgICovXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lLCBnZXRDdXJyZW50UG9zaXRpb24gPSBudWxsKSB7XG4gICAgaWYgKGVuZ2luZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAvLyBjb25zdHJ1Y3QgbWluaW1hbCBzY2hlZHVsZWQgdGltZSBlbmdpbmVcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGVuZ2luZVxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHNjaGVkdWxlclwiKTtcblxuICAgICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgICAvLyByZWdpc3RlciBlbmdpbmVcbiAgICAgIHRoaXMuX19lbmdpbmVzLnB1c2goZW5naW5lKTtcblxuICAgICAgLy8gc2V0IHNjaGVkdWxlZCBpbnRlcmZhY2VcbiAgICAgIGVuZ2luZS5zZXRTY2hlZHVsZWQodGhpcywgKHRpbWUpID0+IHtcbiAgICAgICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLm1vdmUoZW5naW5lLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX3Jlc2NoZWR1bGUobmV4dFRpbWUpO1xuICAgICAgfSwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgIH0sIGdldEN1cnJlbnRQb3NpdGlvbik7XG4gICAgfVxuXG4gICAgLy8gc2NoZWR1bGUgZW5naW5lIG9yIGNhbGxiYWNrXG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLmluc2VydChlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNjaGVkdWxlKG5leHRUaW1lKTtcblxuICAgIHJldHVybiBlbmdpbmU7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgdGltZSBlbmdpbmUgb3IgY2FsbGJhY2sgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBzY2hlZHVsZXJcbiAgICovXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICB2YXIgbWFzdGVyID0gZW5naW5lLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIpIHtcbiAgICAgIGlmIChtYXN0ZXIgIT09IHRoaXMpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICAgIGVuZ2luZS5yZXNldEludGVyZmFjZSgpO1xuICAgICAgYXJyYXlSZW1vdmUodGhpcy5fX2VuZ2luZXMsIGVuZ2luZSk7XG4gICAgfVxuXG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLnJlbW92ZShlbmdpbmUpO1xuICAgIHRoaXMuX19yZXNjaGVkdWxlKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNjaGVkdWxlIGEgc2NoZWR1bGVkIHRpbWUgZW5naW5lIG9yIGNhbGxiYWNrIGF0IGEgZ2l2ZW4gdGltZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZW5naW5lIHRpbWUgZW5naW5lIG9yIGNhbGxiYWNrIHRvIGJlIHJlc2NoZWR1bGVkXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWUgd2hlbiB0byByZXNjaGVkdWxlXG4gICAqL1xuICByZXNldChlbmdpbmUsIHRpbWUpIHtcbiAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUubW92ZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNjaGVkdWxlKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHNjaGRlZHVsZWQgY2FsbGJhY2tzIGFuZCBlbmdpbmVzIGZyb20gdGhlIHNjaGVkdWxlclxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX19xdWV1ZS5jbGVhcigpO1xuICAgIHRoaXMuX19lbmdpbmVzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlZHVsZXI7Il19