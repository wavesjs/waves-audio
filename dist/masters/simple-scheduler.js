"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var defaultAudioContext = require("../core/audio-context");
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
  function SimpleScheduler() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SimpleScheduler);

    this.audioContext = options.audioContext || defaultAudioContext;

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

  _createClass(SimpleScheduler, {
    __scheduleEngine: {
      value: function __scheduleEngine(engine, time) {
        this.__schedEngines.push(engine);
        this.__schedTimes.push(time);
      }
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
        } else if (time < Infinity) {
          this.__schedEngines.push(engine);
          this.__schedTimes.push(time);
        }
      }
    },
    __unscheduleEngine: {
      value: function __unscheduleEngine(engine) {
        var index = this.__schedEngines.indexOf(engine);

        if (index >= 0) {
          this.__schedEngines.splice(index, 1);
          this.__schedTimes.splice(index, 1);
        }
      }
    },
    __resetTick: {
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
            if (!time) {
              engine.master = null;
              arrayRemove(this.__engines, engine);
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
    },
    currentTime: {
      get: function () {
        return this.__currentTime || this.audioContext.currentTime + this.lookahead;
      }
    },
    currentPosition: {
      get: function () {
        return undefined;
      }
    },
    add: {
      value: function add(engineOrFunction) {
        var time = arguments[1] === undefined ? this.currentTime : arguments[1];
        var getCurrentPosition = arguments[2] === undefined ? null : arguments[2];

        var engine = engineOrFunction;

        if (engineOrFunction instanceof Function) engine = {
          advanceTime: engineOrFunction
        };else if (!engineOrFunction.implementsScheduled()) throw new Error("object cannot be added to scheduler");else if (engineOrFunction.master) throw new Error("object has already been added to a master");

        // set master and add to array
        engine.master = this;
        this.__engines.push(engine);

        // schedule engine
        this.__scheduleEngine(engine, time);
        this.__resetTick();

        return engine;
      }
    },
    remove: {
      value: function remove(engine) {
        if (!engine.master || engine.master !== this) throw new Error("engine has not been added to this scheduler");

        // reset master and remove from array
        engine.master = null;
        arrayRemove(this.__engines, engine);

        // unschedule engine
        this.__unscheduleEngine(engine);
        this.__resetTick();
      }
    },
    resetEngineTime: {
      value: function resetEngineTime(engine) {
        var time = arguments[1] === undefined ? this.currentTime : arguments[1];

        this.__rescheduleEngine(engine, time);
        this.__resetTick();
      }
    },
    clear: {
      value: function clear() {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        this.__schedEngines.length = 0;
        this.__schedTimes.length = 0;
      }
    }
  });

  return SimpleScheduler;
})();

// export scheduler singleton
module.exports = SimpleScheduler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7O0FBRWIsSUFBSSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUMzRCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7QUFFaEQsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRTtBQUNqQyxNQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVqQyxNQUFJLEtBQUssSUFBSSxDQUFDLEVBQUU7QUFDZCxTQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QixXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELFNBQU8sS0FBSyxDQUFDO0NBQ2Q7O0lBRUssZUFBZTtBQUNSLFdBRFAsZUFBZSxHQUNPO1FBQWQsT0FBTyxnQ0FBRyxFQUFFOzswQkFEcEIsZUFBZTs7QUFFakIsUUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFLLG1CQUFtQixDQUFDOztBQUVqRSxRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7QUFDekIsUUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7O0FBRXZCLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTXRDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUM7R0FDM0M7O2VBdkJHLGVBQWU7QUF5Qm5CLG9CQUFnQjthQUFBLDBCQUFD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O1NBQ3ZCOztBQUVELFlBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMvQixZQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7T0FDOUI7Ozs7U0FsS0csZUFBZTs7OztBQXNLckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3NjaGVkdWxpbmctcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBkZWZhdWx0QXVkaW9Db250ZXh0ID0gcmVxdWlyZShcIi4uL2NvcmUvYXVkaW8tY29udGV4dFwiKTtcbnZhciBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG5cbmZ1bmN0aW9uIGFycmF5UmVtb3ZlKGFycmF5LCB2YWx1ZSkge1xuICB2YXIgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmNsYXNzIFNpbXBsZVNjaGVkdWxlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBbXTtcblxuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcyA9IFtdO1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCAwLjAyNTtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciBsb29rYWhlYWQgdGltZSAoPiBwZXJpb2QpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IDAuMTtcbiAgfVxuXG4gIF9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgfVxuXG4gIF9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaW5kZXhdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIF9fcmVzZXRUaWNrKCkge1xuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICghdGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTaW1wbGVTY2hlZHVsZXIgU3RhcnRcIik7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY29uc29sZS5sb2coXCJTaW1wbGVTY2hlZHVsZXIgU3RvcFwiKTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX190aWNrKCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgZW5naW5lID0gdGhpcy5fX3NjaGVkRW5naW5lc1tpXTtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5fX3NjaGVkVGltZXNbaV07XG5cbiAgICAgIHdoaWxlICh0aW1lICYmIHRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICAgIHRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICYmIHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpKytdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGVuZ2luZSBmcm9tIHNjaGVkdWxlclxuICAgICAgICBpZiAoIXRpbWUpIHtcbiAgICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgICBhcnJheVJlbW92ZSh0aGlzLl9fZW5naW5lcywgZW5naW5lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH0sIHRoaXMucGVyaW9kICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGFkZChlbmdpbmVPckZ1bmN0aW9uLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSwgZ2V0Q3VycmVudFBvc2l0aW9uID0gbnVsbCkge1xuICAgIHZhciBlbmdpbmUgPSBlbmdpbmVPckZ1bmN0aW9uO1xuXG4gICAgaWYgKGVuZ2luZU9yRnVuY3Rpb24gaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGVuZ2luZU9yRnVuY3Rpb25cbiAgICAgIH07XG4gICAgZWxzZSBpZiAoIWVuZ2luZU9yRnVuY3Rpb24uaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG4gICAgZWxzZSBpZiAoZW5naW5lT3JGdW5jdGlvbi5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIC8vIHNldCBtYXN0ZXIgYW5kIGFkZCB0byBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmVzLnB1c2goZW5naW5lKTtcblxuICAgIC8vIHNjaGVkdWxlIGVuZ2luZVxuICAgIHRoaXMuX19zY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcblxuICAgIHJldHVybiBlbmdpbmU7XG4gIH1cblxuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKCFlbmdpbmUubWFzdGVyIHx8IGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJlbmdpbmUgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgLy8gcmVzZXQgbWFzdGVyIGFuZCByZW1vdmUgZnJvbSBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIGFycmF5UmVtb3ZlKHRoaXMuX19lbmdpbmVzLCBlbmdpbmUpO1xuXG4gICAgLy8gdW5zY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgdGhpcy5fX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuLy8gZXhwb3J0IHNjaGVkdWxlciBzaW5nbGV0b25cbm1vZHVsZS5leHBvcnRzID0gU2ltcGxlU2NoZWR1bGVyOyJdfQ==