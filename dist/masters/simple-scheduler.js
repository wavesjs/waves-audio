'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreAudioContext = require('../core/audio-context');

var _coreAudioContext2 = _interopRequireDefault(_coreAudioContext);

var _coreTimeEngine = require('../core/time-engine');

var _coreTimeEngine2 = _interopRequireDefault(_coreTimeEngine);

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
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SimpleScheduler);

    this.audioContext = options.audioContext || _coreAudioContext2['default'];

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

  _createClass(SimpleScheduler, [{
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
  }, {
    key: 'add',
    value: function add(engineOrFunction) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];
      var getCurrentPosition = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

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
  }, {
    key: 'remove',
    value: function remove(engine) {
      if (!engine.master || engine.master !== this) throw new Error("engine has not been added to this scheduler");

      // reset master and remove from array
      engine.master = null;
      arrayRemove(this.__engines, engine);

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
})();

exports['default'] = SimpleScheduler;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9tYXN0ZXJzL3NpbXBsZS1zY2hlZHVsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2dDQUFnQyx1QkFBdUI7Ozs7OEJBQ2hDLHFCQUFxQjs7OztBQUU1QyxTQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQ2pDLE1BQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWpDLE1BQUksS0FBSyxJQUFJLENBQUMsRUFBRTtBQUNkLFNBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDO0dBQ2I7O0FBRUQsU0FBTyxLQUFLLENBQUM7Q0FDZDs7SUFFb0IsZUFBZTtBQUN2QixXQURRLGVBQWUsR0FDUjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBREwsZUFBZTs7QUFFaEMsUUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxpQ0FBd0IsQ0FBQzs7QUFFakUsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRXBCLFFBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUV2QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUMxQixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7Ozs7O0FBTXRCLFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7Ozs7OztBQU10QyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDO0dBQzNDOztlQXZCa0IsZUFBZTs7V0F5QmxCLDBCQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDN0IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakMsVUFBSSxD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dCI6WyJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5cbmZ1bmN0aW9uIGFycmF5UmVtb3ZlKGFycmF5LCB2YWx1ZSkge1xuICB2YXIgaW5kZXggPSBhcnJheS5pbmRleE9mKHZhbHVlKTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZVNjaGVkdWxlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBbXTtcblxuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcyA9IFtdO1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCAwLjAyNTtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciBsb29rYWhlYWQgdGltZSAoPiBwZXJpb2QpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IDAuMTtcbiAgfVxuXG4gIF9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgfVxuXG4gIF9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaW5kZXhdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIF9fcmVzZXRUaWNrKCkge1xuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICghdGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTaW1wbGVTY2hlZHVsZXIgU3RhcnRcIik7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY29uc29sZS5sb2coXCJTaW1wbGVTY2hlZHVsZXIgU3RvcFwiKTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX190aWNrKCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoKSB7XG4gICAgICB2YXIgZW5naW5lID0gdGhpcy5fX3NjaGVkRW5naW5lc1tpXTtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5fX3NjaGVkVGltZXNbaV07XG5cbiAgICAgIHdoaWxlICh0aW1lICYmIHRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICAgIHRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICYmIHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpKytdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGVuZ2luZSBmcm9tIHNjaGVkdWxlclxuICAgICAgICBpZiAoIXRpbWUpIHtcbiAgICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgICBhcnJheVJlbW92ZSh0aGlzLl9fZW5naW5lcywgZW5naW5lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH0sIHRoaXMucGVyaW9kICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGFkZChlbmdpbmVPckZ1bmN0aW9uLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSwgZ2V0Q3VycmVudFBvc2l0aW9uID0gbnVsbCkge1xuICAgIHZhciBlbmdpbmUgPSBlbmdpbmVPckZ1bmN0aW9uO1xuXG4gICAgaWYgKGVuZ2luZU9yRnVuY3Rpb24gaW5zdGFuY2VvZiBGdW5jdGlvbilcbiAgICAgIGVuZ2luZSA9IHtcbiAgICAgICAgYWR2YW5jZVRpbWU6IGVuZ2luZU9yRnVuY3Rpb25cbiAgICAgIH07XG4gICAgZWxzZSBpZiAoIWVuZ2luZU9yRnVuY3Rpb24uaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG4gICAgZWxzZSBpZiAoZW5naW5lT3JGdW5jdGlvbi5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIC8vIHNldCBtYXN0ZXIgYW5kIGFkZCB0byBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmVzLnB1c2goZW5naW5lKTtcblxuICAgIC8vIHNjaGVkdWxlIGVuZ2luZVxuICAgIHRoaXMuX19zY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcblxuICAgIHJldHVybiBlbmdpbmU7XG4gIH1cblxuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKCFlbmdpbmUubWFzdGVyIHx8IGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJlbmdpbmUgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgLy8gcmVzZXQgbWFzdGVyIGFuZCByZW1vdmUgZnJvbSBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIGFycmF5UmVtb3ZlKHRoaXMuX19lbmdpbmVzLCBlbmdpbmUpO1xuXG4gICAgLy8gdW5zY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgdGhpcy5fX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiJdfQ==