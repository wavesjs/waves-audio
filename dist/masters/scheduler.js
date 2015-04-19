"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var defaultAudioContext = require("../core/audio-context");
var TimeEngine = require("../core/time-engine");
var PriorityQueue = require("../utils/priority-queue");
var SchedulingQueue = require("../utils/scheduling-queue");

var Scheduler = (function (_SchedulingQueue) {
  function Scheduler() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Scheduler);

    _get(_core.Object.getPrototypeOf(Scheduler.prototype), "constructor", this).call(this);

    this.audioContext = options.audioContext || defaultAudioContext;

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

  _inherits(Scheduler, _SchedulingQueue);

  _createClass(Scheduler, {
    __tick: {

      // setTimeout scheduling loop

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
    },
    resetTime: {
      value: function resetTime() {
        var _this = this;

        var time = arguments[0] === undefined ? this.currentTime : arguments[0];

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
    },
    currentTime: {
      get: function () {
        if (this.master) return this.master.currentTime;

        return this.__currentTime || this.audioContext.currentTime + this.lookahead;
      }
    },
    currentPosition: {
      get: function () {
        var master = this.master;

        if (master && master.currentPosition !== undefined) return master.currentPosition;

        return undefined;
      }
    },
    add: {

      // add a time engine to the queue and return the engine

      value: function add(engineOrFunction) {
        var time = arguments[1] === undefined ? this.currentTime : arguments[1];

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

        _get(_core.Object.getPrototypeOf(Scheduler.prototype), "add", this).call(this, engine, time);
      }
    },
    remove: {
      value: function remove(engine) {
        if (engine.master !== this) throw new Error("object has not been added to this scheduler");

        _get(_core.Object.getPrototypeOf(Scheduler.prototype), "remove", this).call(this, engine);
      }
    },
    resetEngineTime: {
      value: function resetEngineTime(engine) {
        var time = arguments[1] === undefined ? this.currentTime : arguments[1];

        if (engine.master !== this) throw new Error("object has not been added to this scheduler");

        _get(_core.Object.getPrototypeOf(Scheduler.prototype), "resetEngineTime", this).call(this, engine, time);
      }
    }
  });

  return Scheduler;
})(SchedulingQueue);

module.exports = Scheduler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksbUJBQW1CLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0QsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDaEQsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUM7QUFDdkQsSUFBSSxlQUFlLEdBQUcsT0FBTyxDQUFDLDJCQUEyQixDQUFDLENBQUM7O0lBRXJELFNBQVM7QUFDRixXQURQLFNBQVMsR0FDYTtRQUFkLE9BQU8sZ0NBQUcsRUFBRTs7MEJBRHBCLFNBQVM7O0FBRVgscUNBRkUsU0FBUyw2Q0FFSDs7QUFFUixRQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLElBQUssbUJBQW1CLENBQUM7O0FBRWpFLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFLLEtBQUssQ0FBQzs7Ozs7O0FBTXZDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSyxHQUFHLENBQUM7R0FDNUM7O1lBckJHLFNBQVM7O2VBQVQsU0FBUztBQXdCYixVQUFNOzs7O2FBQUEsa0JBQUc7QUFDUCxZQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3JDLFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7O0FBRTNCLFlBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUV0QixlQUFPLElBQUksSUFBSSxZQUFZLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFD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LENBQUMsQ0FBQzs7QUFFakUseUNBM0dFLFNBQVMsd0NBMkdFLE1BQU0sRUFBRTtPQUN0Qjs7QUFFRCxtQkFBZTthQUFBLHlCQUFDLE1BQU0sRUFBMkI7WUFBekIsSUFBSSxnQ0FBRyxJQUFJLENBQUMsV0FBVzs7QUFDN0MsWUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLElBQUksRUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDOztBQUVqRSx5Q0FsSEUsU0FBUyxpREFrSFcsTUFBTSxFQUFFLElBQUksRUFBRTtPQUNyQzs7OztTQW5IRyxTQUFTO0dBQVMsZUFBZTs7QUFzSHZDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6ImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVmYXVsdEF1ZGlvQ29udGV4dCA9IHJlcXVpcmUoXCIuLi9jb3JlL2F1ZGlvLWNvbnRleHRcIik7XG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xudmFyIFByaW9yaXR5UXVldWUgPSByZXF1aXJlKFwiLi4vdXRpbHMvcHJpb3JpdHktcXVldWVcIik7XG52YXIgU2NoZWR1bGluZ1F1ZXVlID0gcmVxdWlyZShcIi4uL3V0aWxzL3NjaGVkdWxpbmctcXVldWVcIik7XG5cbmNsYXNzIFNjaGVkdWxlciBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IMKgZGVmYXVsdEF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgwqAwLjAyNTtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciBsb29rYWhlYWQgdGltZSAoPiBwZXJpb2QpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IMKgMC4xO1xuICB9XG5cbiAgLy8gc2V0VGltZW91dCBzY2hlZHVsaW5nIGxvb3BcbiAgX190aWNrKCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19uZXh0VGltZTtcblxuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIHdoaWxlICh0aW1lIDw9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgdGltZSA9IHRoaXMuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIHJlc2V0VGltZSh0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICh0aGlzLm1hc3Rlcikge1xuICAgICAgdGhpcy5tYXN0ZXIucmVzZXQodGhpcywgdGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICBpZiAodGhpcy5fX25leHRUaW1lID09PSBJbmZpbml0eSlcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNjaGVkdWxlciBTdGFydFwiKTtcblxuICAgICAgICB2YXIgdGltZU91dERlbGF5ID0gTWF0aC5tYXgoKHRpbWUgLSB0aGlzLmxvb2thaGVhZCAtIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSwgdGhpcy5wZXJpb2QpO1xuXG4gICAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgICAgfSwgdGltZU91dERlbGF5ICogMTAwMCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19uZXh0VGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTY2hlZHVsZXIgU3RvcFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB9XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICB2YXIgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIGFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBxdWV1ZSBhbmQgcmV0dXJuIHRoZSBlbmdpbmVcbiAgYWRkKGVuZ2luZU9yRnVuY3Rpb24sIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgdmFyIGVuZ2luZTtcblxuICAgIGlmIChlbmdpbmVPckZ1bmN0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIC8vIGNvbnN0cnVjdCBtaW5pbWFsIHNjaGVkdWxlZCBlbmdpbmVcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGVuZ2luZU9yRnVuY3Rpb25cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGVuZ2luZSA9IGVuZ2luZU9yRnVuY3Rpb247XG5cbiAgICAgIGlmICghZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG5cbiAgICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcbiAgICB9XG5cbiAgICBzdXBlci5hZGQoZW5naW5lLCB0aW1lKTtcbiAgfVxuXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBpZiAoZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICBzdXBlci5yZW1vdmUoZW5naW5lKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgc3VwZXIucmVzZXRFbmdpbmVUaW1lKGVuZ2luZSwgdGltZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTY2hlZHVsZXI7Il19