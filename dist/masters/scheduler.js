"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var defaultAudioContext = _interopRequire(require("../core/audio-context"));

var TimeEngine = _interopRequire(require("../core/time-engine"));

var PriorityQueue = _interopRequire(require("../utils/priority-queue"));

var SchedulingQueue = _interopRequire(require("../utils/scheduling-queue"));

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9tYXN0ZXJzL3NjaGVkdWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFPLG1CQUFtQiwyQkFBTSx1QkFBdUI7O0lBQ2hELFVBQVUsMkJBQU0scUJBQXFCOztJQUNyQyxhQUFhLDJCQUFNLHlCQUF5Qjs7SUFDNUMsZUFBZSwyQkFBTSwyQkFBMkI7O0lBRWxDLFNBQVM7QUFDakIsV0FEUSxTQUFTLEdBQ0Y7UUFBZCxPQUFPLGdDQUFHLEVBQUU7OzBCQURMLFNBQVM7O0FBRTFCLHFDQUZpQixTQUFTLDZDQUVsQjs7QUFFUixRQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLElBQUssbUJBQW1CLENBQUM7O0FBRWpFLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFLLEtBQUssQ0FBQzs7Ozs7O0FBTXZDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSyxHQUFHLENBQUM7R0FDNUM7O1lBckJrQixTQUFTOztlQUFULFNBQVM7QUF3QjVCLFVBQU07Ozs7YUFBQSxrQkFBRztBQUNQLFlBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDdkMsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7QUFFM0IsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7O0FBRXRCLGVBQU8sSUFBSSxJQUFJLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUN4RCxjQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixjQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMvQjs7QUFFRCxZQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3RCOztBQUVELGFBQVM7YUFBQSxxQkFBMEI7OztZQUF6QixJQUFJLGdDQUFHLElBQUksQ0FBQyxXQUFXOztBQUMvQixZQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDZixjQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDL0IsTUFBTTtBQUNMLGNBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQix3QkFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3QixnQkFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7V0FDdkI7O0FBRUQsY0FBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3JCLGdCQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssUUFBUSxFQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRWpDLGdCQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFcEcsZ0JBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFlBQU07QUFDaEMsb0JBQUssTUFBTSxFQUFFLENBQUM7YUFDZixFQUFFLFlBQVksR0FBRyxJQUFJLENBQUMsQ0FBQztXQUN6QixNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxRQUFRLEVBQUU7QUFDdkMsbUJBQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztXQUMvQjs7QUFFRCxjQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztTQUN4QjtPQUNGOztBQUVHLGVBQVc7V0FBQSxZQUFHO0FBQ2hCLFlBQUksSUFBSSxDQUFDLE1BQU0sRUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDOztBQUVqQyxlQUFPLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztPQUM3RTs7QUFFRyxtQkFBZTtXQUFBLFlBQUc7QUFDcEIsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFM0IsWUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQ2hELE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBQzs7QUFFaEMsZUFBTyxTQUFTLENBQUM7T0FDbEI7Ozs7U0EvRWtCLFNBQVM7R0FBUyxlQUFlOztpQkFBakMsU0FBUyIsImZpbGUiOiJlczYvbWFzdGVycy9zY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgUHJpb3JpdHlRdWV1ZSBmcm9tICcuLi91dGlscy9wcmlvcml0eS1xdWV1ZSc7XG5pbXBvcnQgU2NoZWR1bGluZ1F1ZXVlIGZyb20gJy4uL3V0aWxzL3NjaGVkdWxpbmctcXVldWUnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCDCoGRlZmF1bHRBdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IEluZmluaXR5O1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciAoc2V0VGltZW91dCkgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZCA9IG9wdGlvbnMucGVyaW9kIHx8IMKgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fCDCoDAuMTtcbiAgfVxuXG4gIC8vIHNldFRpbWVvdXQgc2NoZWR1bGluZyBsb29wXG4gIF9fdGljaygpIHtcbiAgICBjb25zdCBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICBsZXQgdGltZSA9IHRoaXMuX19uZXh0VGltZTtcblxuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIHdoaWxlICh0aW1lIDw9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgdGltZSA9IHRoaXMuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIHJlc2V0VGltZSh0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICh0aGlzLm1hc3Rlcikge1xuICAgICAgdGhpcy5tYXN0ZXIucmVzZXQodGhpcywgdGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICBpZiAodGhpcy5fX25leHRUaW1lID09PSBJbmZpbml0eSlcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNjaGVkdWxlciBTdGFydFwiKTtcblxuICAgICAgICBjb25zdCB0aW1lT3V0RGVsYXkgPSBNYXRoLm1heCgodGltZSAtIHRoaXMubG9va2FoZWFkIC0gdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpLCB0aGlzLnBlcmlvZCk7XG5cbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgICB9LCB0aW1lT3V0RGVsYXkgKiAxMDAwKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX25leHRUaW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlNjaGVkdWxlciBTdG9wXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG5cbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cbiJdfQ==