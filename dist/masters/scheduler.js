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
    }
  });

  return Scheduler;
})(SchedulingQueue);

module.exports = Scheduler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7O0FBRWIsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUM3RCxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNsRCxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUN6RCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQzs7SUFFdkQsU0FBUztBQUNGLFdBRFAsU0FBUyxHQUNhO1FBQWQsT0FBTyxnQ0FBRyxFQUFFOzswQkFEcEIsU0FBUzs7QUFFWCxxQ0FGRSxTQUFTLDZDQUVIOztBQUVSLFFBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksSUFBSyxtQkFBbUIsQ0FBQzs7QUFFakUsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDM0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Ozs7OztBQU10QixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUssS0FBSyxDQUFDOzs7Ozs7QUFNdkMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFLLEdBQUcsQ0FBQztHQUM1Qzs7WUFyQkcsU0FBUzs7ZUFBVCxTQUFTO0FBd0JiLFVBQU07Ozs7YUFBQSxrQkFBRztBQUNQLFlBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDdkMsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7QUFFM0IsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7O0FBRXRCLGVBQU8sSUFBSSxJQUFJLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN4RCxjQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixjQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMvQjs7QUFFRCxZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3RCOztBQUVELGFBQVM7YUFBQSxxQkFBMEI7OztZQUF6QixJQUFJLGdDQUFHLElBQUksQ0FBQyxXQUFXOztBQUMvQixZQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixjQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDL0IsTUFBTTtBQUNMLGNBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQix3QkFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixnQkFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7V0FDdkI7O0FBRUQsY0FBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3JCLGdCQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssUUFBUSxFQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRWpDLGdCQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFcEcsZ0JBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDaEMsb0JBQUssTUFBTSxFQUFFLENBQUM7YUFDZixFQUFFLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQztXQUN6QixNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUU7QUFDdkMsbUJBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztXQUMvQjs7QUFFRCxjQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN4QjtPQUNGOztBQUVHLGVBQVc7V0FBQSxZQUFHO0FBQ2hCLFlBQUksSUFBSSxDQUFDLE1BQU0sRUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDOztBQUVqQyxlQUFPLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztPQUM3RTs7QUFFRyxtQkFBZTtXQUFBLFlBQUc7QUFDcEIsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFM0IsWUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQ2hELE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBQzs7QUFFaEMsZUFBTyxTQUFTLENBQUM7T0FDbEI7Ozs7U0EvRUcsU0FBUztHQUFTLGVBQWU7O0FBa0Z2QyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvc2NoZWR1bGluZy1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZGVmYXVsdEF1ZGlvQ29udGV4dCA9IHJlcXVpcmUoXCIuLi9jb3JlL2F1ZGlvLWNvbnRleHRcIik7XG5jb25zdCBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG5jb25zdCBQcmlvcml0eVF1ZXVlID0gcmVxdWlyZShcIi4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlXCIpO1xuY29uc3QgU2NoZWR1bGluZ1F1ZXVlID0gcmVxdWlyZShcIi4uL3V0aWxzL3NjaGVkdWxpbmctcXVldWVcIik7XG5cbmNsYXNzIFNjaGVkdWxlciBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IMKgZGVmYXVsdEF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgwqAwLjAyNTtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciBsb29rYWhlYWQgdGltZSAoPiBwZXJpb2QpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IMKgMC4xO1xuICB9XG5cbiAgLy8gc2V0VGltZW91dCBzY2hlZHVsaW5nIGxvb3BcbiAgX190aWNrKCkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIGxldCB0aW1lID0gdGhpcy5fX25leHRUaW1lO1xuXG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgd2hpbGUgKHRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICB0aW1lID0gdGhpcy5hZHZhbmNlVGltZSh0aW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgcmVzZXRUaW1lKHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKSB7XG4gICAgICB0aGlzLm1hc3Rlci5yZXNldCh0aGlzLCB0aW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGlmICh0aGlzLl9fbmV4dFRpbWUgPT09IEluZmluaXR5KVxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2NoZWR1bGVyIFN0YXJ0XCIpO1xuXG4gICAgICAgIGNvbnN0IHRpbWVPdXREZWxheSA9IE1hdGgubWF4KCh0aW1lIC0gdGhpcy5sb29rYWhlYWQgLSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSksIHRoaXMucGVyaW9kKTtcblxuICAgICAgICB0aGlzLl9fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICAgIH0sIHRpbWVPdXREZWxheSAqIDEwMDApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fbmV4dFRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2NoZWR1bGVyIFN0b3BcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19uZXh0VGltZSA9IHRpbWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcblxuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjaGVkdWxlcjtcbiJdfQ==