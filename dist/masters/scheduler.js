'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _schedulingQueue = require('../core/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('wavesjs:audio');

/**
 * The `Scheduler` class implements a master for `TimeEngine` or `AudioTimeEngine`
 * instances that implement the *scheduled* interface such as the `Metronome`
 * `GranularEngine`.
 *
 * A `Scheduler` can also schedule simple callback functions.
 * The class is based on recursive calls to `setTimeOut` and uses the
 * `audioContext.currentTime` as logical passed to the `advanceTime` methods
 * of the scheduled engines or to the scheduled callback functions.
 * It extends the `SchedulingQueue` class that itself includes a `PriorityQueue`
 * to assure the order of the scheduled engines (see `SimpleScheduler` for a
 * simplified scheduler implementation without `PriorityQueue`).
 *
 * To get a unique instance of `Scheduler` as the global scheduler of an
 * application, the `getScheduler` factory function should be used. The
 * function accepts an audio context as optional argument and uses the Waves
 * default audio context (see `audioContext`) as
 * default. The factory creates a single scheduler for each audio context.
 *
 * Example that shows three Metronome engines running in a Scheduler:
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/scheduler.html}
 *
 * @param {Object} [options={}] - default options
 * @param {Number} [options.period=0.025] - period of the scheduler.
 * @param {Number} [options.lookahead=0.1] - lookahead of the scheduler.
 *
 * @see TimeEngine
 * @see AudioTimeEngine
 * @see getScheduler
 * @see SimpleScheduler
 *
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 *
 * scheduler.add(myEngine);
 */

var Scheduler = function (_SchedulingQueue) {
  (0, _inherits3.default)(Scheduler, _SchedulingQueue);

  function Scheduler() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Scheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Scheduler.__proto__ || (0, _getPrototypeOf2.default)(Scheduler)).call(this));

    _this.audioContext = options.audioContext || _audioContext2.default;

    _this.__currentTime = null;
    _this.__nextTime = Infinity;
    _this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     * @name period
     * @memberof Scheduler
     * @instance
     */
    _this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     * @name lookahead
     * @memberof Scheduler
     * @instance
     */
    _this.lookahead = options.lookahead || 0.1;
    return _this;
  }

  // setTimeout scheduling loop


  (0, _createClass3.default)(Scheduler, [{
    key: '__tick',
    value: function __tick() {
      var audioContext = this.audioContext;
      var currentTime = audioContext.currentTime;
      var time = this.__nextTime;

      this.__timeout = null;

      while (time <= currentTime + this.lookahead) {
        this.__currentTime = time;
        time = this.advanceTime(time);
      }

      this.__currentTime = null;
      this.resetTime(time);
    }
  }, {
    key: 'resetTime',
    value: function resetTime() {
      var _this2 = this;

      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.currentTime;

      if (this.master) {
        this.master.reset(this, time);
      } else {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        if (time !== Infinity) {
          if (this.__nextTime === Infinity) log('Scheduler Start');

          var timeOutDelay = Math.max(time - this.lookahead - this.audioContext.currentTime, this.period);

          this.__timeout = setTimeout(function () {
            _this2.__tick();
          }, Math.ceil(timeOutDelay * 1000));
        } else if (this.__nextTime !== Infinity) {
          log('Scheduler Stop');
        }

        this.__nextTime = time;
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
    key: 'currentTime',
    get: function get() {
      if (this.master) return this.master.currentTime;

      return this.__currentTime || this.audioContext.currentTime + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }

    // inherited from scheduling queue
    /**
     * Add a TimeEngine or a simple callback function to the scheduler at an
     * optionally given time. Whether the add method is called with a TimeEngine
     * or a callback function it returns a TimeEngine that can be used as argument
     * of the methods remove and resetEngineTime. A TimeEngine added to a scheduler
     * has to implement the scheduled interface. The callback function added to a
     * scheduler will be called at the given time and with the given time as
     * argument. The callback can return a new scheduling time (i.e. the next
     * time when it will be called) or it can return Infinity to suspend scheduling
     * without removing the function from the scheduler. A function that does
     * not return a value (or returns null or 0) is removed from the scheduler
     * and cannot be used as argument of the methods remove and resetEngineTime
     * anymore.
     *
     * @name add
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine|Function} engine - Engine to add to the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    /**
     * Remove a TimeEngine from the scheduler that has been added to the
     * scheduler using the add method.
     *
     * @name add
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine} engine - Engine to remove from the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    /**
     * Reschedule a scheduled time engine at a given time.
     *
     * @name resetEngineTime
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine} engine - Engine to reschedule
     * @param {Number} time - Schedule time
     */
    /**
     * Remove all scheduled callbacks and engines from the scheduler.
     *
     * @name clear
     * @function
     * @memberof Scheduler
     * @instance
     */

  }]);
  return Scheduler;
}(_schedulingQueue2.default);

exports.default = Scheduler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVkdWxlci5qcyJdLCJuYW1lcyI6WyJsb2ciLCJTY2hlZHVsZXIiLCJvcHRpb25zIiwiYXVkaW9Db250ZXh0IiwiX19jdXJyZW50VGltZSIsIl9fbmV4dFRpbWUiLCJJbmZpbml0eSIsIl9fdGltZW91dCIsInBlcmlvZCIsImxvb2thaGVhZCIsImN1cnJlbnRUaW1lIiwidGltZSIsImFkdmFuY2VUaW1lIiwicmVzZXRUaW1lIiwibWFzdGVyIiwicmVzZXQiLCJjbGVhclRpbWVvdXQiLCJ0aW1lT3V0RGVsYXkiLCJNYXRoIiwibWF4Iiwic2V0VGltZW91dCIsIl9fdGljayIsImNlaWwiLCJjdXJyZW50UG9zaXRpb24iLCJ1bmRlZmluZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxNQUFNLHFCQUFNLGVBQU4sQ0FBWjs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFxQ01DLFM7OztBQUNKLHVCQUEwQjtBQUFBLFFBQWRDLE9BQWMsdUVBQUosRUFBSTtBQUFBOztBQUFBOztBQUd4QixVQUFLQyxZQUFMLEdBQW9CRCxRQUFRQyxZQUFSLDBCQUFwQjs7QUFFQSxVQUFLQyxhQUFMLEdBQXFCLElBQXJCO0FBQ0EsVUFBS0MsVUFBTCxHQUFrQkMsUUFBbEI7QUFDQSxVQUFLQyxTQUFMLEdBQWlCLElBQWpCOztBQUVBOzs7Ozs7O0FBT0EsVUFBS0MsTUFBTCxHQUFjTixRQUFRTSxNQUFSLElBQW1CLEtBQWpDOztBQUVBOzs7Ozs7O0FBT0EsVUFBS0MsU0FBTCxHQUFpQlAsUUFBUU8sU0FBUixJQUFzQixHQUF2QztBQXpCd0I7QUEwQnpCOztBQUVEOzs7Ozs2QkFDUztBQUNQLFVBQU1OLGVBQWUsS0FBS0EsWUFBMUI7QUFDQSxVQUFNTyxjQUFjUCxhQUFhTyxXQUFqQztBQUNBLFVBQUlDLE9BQU8sS0FBS04sVUFBaEI7O0FBRUEsV0FBS0UsU0FBTCxHQUFpQixJQUFqQjs7QUFFQSxhQUFPSSxRQUFRRCxjQUFjLEtBQUtELFNBQWxDLEVBQTZDO0FBQzNDLGFBQUtMLGFBQUwsR0FBcUJPLElBQXJCO0FBQ0FBLGVBQU8sS0FBS0MsV0FBTCxDQUFpQkQsSUFBakIsQ0FBUDtBQUNEOztBQUVELFdBQUtQLGFBQUwsR0FBcUIsSUFBckI7QUFDQSxXQUFLUyxTQUFMLENBQWVGLElBQWY7QUFDRDs7O2dDQUVrQztBQUFBOztBQUFBLFVBQXpCQSxJQUF5Qix1RUFBbEIsS0FBS0QsV0FBYTs7QUFDakMsVUFBSSxLQUFLSSxNQUFULEVBQWlCO0FBQ2YsYUFBS0EsTUFBTCxDQUFZQyxLQUFaLENBQWtCLElBQWxCLEVBQXdCSixJQUF4QjtBQUNELE9BRkQsTUFFTztBQUNMLFlBQUksS0FBS0osU0FBVCxFQUFvQjtBQUNsQlMsdUJBQWEsS0FBS1QsU0FBbEI7QUFDQSxlQUFLQSxTQUFMLEdBQWlCLElBQWpCO0FBQ0Q7O0FBRUQsWUFBSUksU0FBU0wsUUFBYixFQUF1QjtBQUNyQixjQUFJLEtBQUtELFVBQUwsS0FBb0JDLFFBQXhCLEVBQ0VOLElBQUksaUJBQUo7O0FBRUYsY0FBTWlCLGVBQWVDLEtBQUtDLEdBQUwsQ0FBVVIsT0FBTyxLQUFLRixTQUFaLEdBQXdCLEtBQUtOLFlBQUwsQ0FBa0JPLFdBQXBELEVBQWtFLEtBQUtGLE1BQXZFLENBQXJCOztBQUVBLGVBQUtELFNBQUwsR0FBaUJhLFdBQVcsWUFBTTtBQUNoQyxtQkFBS0MsTUFBTDtBQUNELFdBRmdCLEVBRWRILEtBQUtJLElBQUwsQ0FBVUwsZUFBZSxJQUF6QixDQUZjLENBQWpCO0FBR0QsU0FURCxNQVNPLElBQUksS0FBS1osVUFBTCxLQUFvQkMsUUFBeEIsRUFBa0M7QUFDdkNOLGNBQUksZ0JBQUo7QUFDRDs7QUFFRCxhQUFLSyxVQUFMLEdBQWtCTSxJQUFsQjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7Ozs7O3dCQVFrQjtBQUNoQixVQUFJLEtBQUtHLE1BQVQsRUFDRSxPQUFPLEtBQUtBLE1BQUwsQ0FBWUosV0FBbkI7O0FBRUYsYUFBTyxLQUFLTixhQUFMLElBQXNCLEtBQUtELFlBQUwsQ0FBa0JPLFdBQWxCLEdBQWdDLEtBQUtELFNBQWxFO0FBQ0Q7Ozt3QkFFcUI7QUFDcEIsVUFBTUssU0FBUyxLQUFLQSxNQUFwQjs7QUFFQSxVQUFJQSxVQUFVQSxPQUFPUyxlQUFQLEtBQTJCQyxTQUF6QyxFQUNFLE9BQU9WLE9BQU9TLGVBQWQ7O0FBRUYsYUFBT0MsU0FBUDtBQUNEOztBQUVEO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFCQTs7Ozs7Ozs7Ozs7QUFXQTs7Ozs7Ozs7OztBQVVBOzs7Ozs7Ozs7Ozs7O2tCQVdhdkIsUyIsImZpbGUiOiJzY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vY29yZS9zY2hlZHVsaW5nLXF1ZXVlJztcblxuY29uc3QgbG9nID0gZGVidWcoJ3dhdmVzanM6YXVkaW8nKTtcblxuLyoqXG4gKiBUaGUgYFNjaGVkdWxlcmAgY2xhc3MgaW1wbGVtZW50cyBhIG1hc3RlciBmb3IgYFRpbWVFbmdpbmVgIG9yIGBBdWRpb1RpbWVFbmdpbmVgXG4gKiBpbnN0YW5jZXMgdGhhdCBpbXBsZW1lbnQgdGhlICpzY2hlZHVsZWQqIGludGVyZmFjZSBzdWNoIGFzIHRoZSBgTWV0cm9ub21lYFxuICogYEdyYW51bGFyRW5naW5lYC5cbiAqXG4gKiBBIGBTY2hlZHVsZXJgIGNhbiBhbHNvIHNjaGVkdWxlIHNpbXBsZSBjYWxsYmFjayBmdW5jdGlvbnMuXG4gKiBUaGUgY2xhc3MgaXMgYmFzZWQgb24gcmVjdXJzaXZlIGNhbGxzIHRvIGBzZXRUaW1lT3V0YCBhbmQgdXNlcyB0aGVcbiAqIGBhdWRpb0NvbnRleHQuY3VycmVudFRpbWVgIGFzIGxvZ2ljYWwgcGFzc2VkIHRvIHRoZSBgYWR2YW5jZVRpbWVgIG1ldGhvZHNcbiAqIG9mIHRoZSBzY2hlZHVsZWQgZW5naW5lcyBvciB0byB0aGUgc2NoZWR1bGVkIGNhbGxiYWNrIGZ1bmN0aW9ucy5cbiAqIEl0IGV4dGVuZHMgdGhlIGBTY2hlZHVsaW5nUXVldWVgIGNsYXNzIHRoYXQgaXRzZWxmIGluY2x1ZGVzIGEgYFByaW9yaXR5UXVldWVgXG4gKiB0byBhc3N1cmUgdGhlIG9yZGVyIG9mIHRoZSBzY2hlZHVsZWQgZW5naW5lcyAoc2VlIGBTaW1wbGVTY2hlZHVsZXJgIGZvciBhXG4gKiBzaW1wbGlmaWVkIHNjaGVkdWxlciBpbXBsZW1lbnRhdGlvbiB3aXRob3V0IGBQcmlvcml0eVF1ZXVlYCkuXG4gKlxuICogVG8gZ2V0IGEgdW5pcXVlIGluc3RhbmNlIG9mIGBTY2hlZHVsZXJgIGFzIHRoZSBnbG9iYWwgc2NoZWR1bGVyIG9mIGFuXG4gKiBhcHBsaWNhdGlvbiwgdGhlIGBnZXRTY2hlZHVsZXJgIGZhY3RvcnkgZnVuY3Rpb24gc2hvdWxkIGJlIHVzZWQuIFRoZVxuICogZnVuY3Rpb24gYWNjZXB0cyBhbiBhdWRpbyBjb250ZXh0IGFzIG9wdGlvbmFsIGFyZ3VtZW50IGFuZCB1c2VzIHRoZSBXYXZlc1xuICogZGVmYXVsdCBhdWRpbyBjb250ZXh0IChzZWUgYGF1ZGlvQ29udGV4dGApIGFzXG4gKiBkZWZhdWx0LiBUaGUgZmFjdG9yeSBjcmVhdGVzIGEgc2luZ2xlIHNjaGVkdWxlciBmb3IgZWFjaCBhdWRpbyBjb250ZXh0LlxuICpcbiAqIEV4YW1wbGUgdGhhdCBzaG93cyB0aHJlZSBNZXRyb25vbWUgZW5naW5lcyBydW5uaW5nIGluIGEgU2NoZWR1bGVyOlxuICoge0BsaW5rIGh0dHBzOi8vcmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy9zY2hlZHVsZXIuaHRtbH1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gZGVmYXVsdCBvcHRpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kPTAuMDI1XSAtIHBlcmlvZCBvZiB0aGUgc2NoZWR1bGVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmxvb2thaGVhZD0wLjFdIC0gbG9va2FoZWFkIG9mIHRoZSBzY2hlZHVsZXIuXG4gKlxuICogQHNlZSBUaW1lRW5naW5lXG4gKiBAc2VlIEF1ZGlvVGltZUVuZ2luZVxuICogQHNlZSBnZXRTY2hlZHVsZXJcbiAqIEBzZWUgU2ltcGxlU2NoZWR1bGVyXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHNjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuICpcbiAqIHNjaGVkdWxlci5hZGQobXlFbmdpbmUpO1xuICovXG5jbGFzcyBTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCDCoGRlZmF1bHRBdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IEluZmluaXR5O1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciAoc2V0VGltZW91dCkgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RcbiAgICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCDCoDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGxvb2thaGVhZFxuICAgICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IMKgMC4xO1xuICB9XG5cbiAgLy8gc2V0VGltZW91dCBzY2hlZHVsaW5nIGxvb3BcbiAgX190aWNrKCkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIGxldCB0aW1lID0gdGhpcy5fX25leHRUaW1lO1xuXG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgd2hpbGUgKHRpbWUgPD0gY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZCkge1xuICAgICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgIHRpbWUgPSB0aGlzLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpIHtcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0KHRoaXMsIHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgaWYgKHRoaXMuX19uZXh0VGltZSA9PT0gSW5maW5pdHkpXG4gICAgICAgICAgbG9nKCdTY2hlZHVsZXIgU3RhcnQnKTtcblxuICAgICAgICBjb25zdCB0aW1lT3V0RGVsYXkgPSBNYXRoLm1heCgodGltZSAtIHRoaXMubG9va2FoZWFkIC0gdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpLCB0aGlzLnBlcmlvZCk7XG5cbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgICB9LCBNYXRoLmNlaWwodGltZU91dERlbGF5ICogMTAwMCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fbmV4dFRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGxvZygnU2NoZWR1bGVyIFN0b3AnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVyIGN1cnJlbnQgbG9naWNhbCB0aW1lLlxuICAgKlxuICAgKiBAbmFtZSBjdXJyZW50VGltZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcblxuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIGluaGVyaXRlZCBmcm9tIHNjaGVkdWxpbmcgcXVldWVcbiAgLyoqXG4gICAqIEFkZCBhIFRpbWVFbmdpbmUgb3IgYSBzaW1wbGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gdGhlIHNjaGVkdWxlciBhdCBhblxuICAgKiBvcHRpb25hbGx5IGdpdmVuIHRpbWUuIFdoZXRoZXIgdGhlIGFkZCBtZXRob2QgaXMgY2FsbGVkIHdpdGggYSBUaW1lRW5naW5lXG4gICAqIG9yIGEgY2FsbGJhY2sgZnVuY3Rpb24gaXQgcmV0dXJucyBhIFRpbWVFbmdpbmUgdGhhdCBjYW4gYmUgdXNlZCBhcyBhcmd1bWVudFxuICAgKiBvZiB0aGUgbWV0aG9kcyByZW1vdmUgYW5kIHJlc2V0RW5naW5lVGltZS4gQSBUaW1lRW5naW5lIGFkZGVkIHRvIGEgc2NoZWR1bGVyXG4gICAqIGhhcyB0byBpbXBsZW1lbnQgdGhlIHNjaGVkdWxlZCBpbnRlcmZhY2UuIFRoZSBjYWxsYmFjayBmdW5jdGlvbiBhZGRlZCB0byBhXG4gICAqIHNjaGVkdWxlciB3aWxsIGJlIGNhbGxlZCBhdCB0aGUgZ2l2ZW4gdGltZSBhbmQgd2l0aCB0aGUgZ2l2ZW4gdGltZSBhc1xuICAgKiBhcmd1bWVudC4gVGhlIGNhbGxiYWNrIGNhbiByZXR1cm4gYSBuZXcgc2NoZWR1bGluZyB0aW1lIChpLmUuIHRoZSBuZXh0XG4gICAqIHRpbWUgd2hlbiBpdCB3aWxsIGJlIGNhbGxlZCkgb3IgaXQgY2FuIHJldHVybiBJbmZpbml0eSB0byBzdXNwZW5kIHNjaGVkdWxpbmdcbiAgICogd2l0aG91dCByZW1vdmluZyB0aGUgZnVuY3Rpb24gZnJvbSB0aGUgc2NoZWR1bGVyLiBBIGZ1bmN0aW9uIHRoYXQgZG9lc1xuICAgKiBub3QgcmV0dXJuIGEgdmFsdWUgKG9yIHJldHVybnMgbnVsbCBvciAwKSBpcyByZW1vdmVkIGZyb20gdGhlIHNjaGVkdWxlclxuICAgKiBhbmQgY2Fubm90IGJlIHVzZWQgYXMgYXJndW1lbnQgb2YgdGhlIG1ldGhvZHMgcmVtb3ZlIGFuZCByZXNldEVuZ2luZVRpbWVcbiAgICogYW55bW9yZS5cbiAgICpcbiAgICogQG5hbWUgYWRkXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV8RnVuY3Rpb259IGVuZ2luZSAtIEVuZ2luZSB0byBhZGQgdG8gdGhlIHNjaGVkdWxlclxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RpbWU9dGhpcy5jdXJyZW50VGltZV0gLSBTY2hlZHVsZSB0aW1lXG4gICAqL1xuICAvKipcbiAgICogUmVtb3ZlIGEgVGltZUVuZ2luZSBmcm9tIHRoZSBzY2hlZHVsZXIgdGhhdCBoYXMgYmVlbiBhZGRlZCB0byB0aGVcbiAgICogc2NoZWR1bGVyIHVzaW5nIHRoZSBhZGQgbWV0aG9kLlxuICAgKlxuICAgKiBAbmFtZSBhZGRcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7VGltZUVuZ2luZX0gZW5naW5lIC0gRW5naW5lIHRvIHJlbW92ZSBmcm9tIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFt0aW1lPXRoaXMuY3VycmVudFRpbWVdIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgLyoqXG4gICAqIFJlc2NoZWR1bGUgYSBzY2hlZHVsZWQgdGltZSBlbmdpbmUgYXQgYSBnaXZlbiB0aW1lLlxuICAgKlxuICAgKiBAbmFtZSByZXNldEVuZ2luZVRpbWVcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7VGltZUVuZ2luZX0gZW5naW5lIC0gRW5naW5lIHRvIHJlc2NoZWR1bGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBTY2hlZHVsZSB0aW1lXG4gICAqL1xuICAvKipcbiAgICogUmVtb3ZlIGFsbCBzY2hlZHVsZWQgY2FsbGJhY2tzIGFuZCBlbmdpbmVzIGZyb20gdGhlIHNjaGVkdWxlci5cbiAgICpcbiAgICogQG5hbWUgY2xlYXJcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICogQGluc3RhbmNlXG4gICAqL1xuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxlcjtcbiJdfQ==