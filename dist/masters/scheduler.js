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

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _priorityQueue = require('../utils/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _schedulingQueue = require('../utils/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Scheduler = function (_SchedulingQueue) {
  (0, _inherits3.default)(Scheduler, _SchedulingQueue);

  function Scheduler() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Scheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Scheduler).call(this));

    _this.audioContext = options.audioContext || _audioContext2.default;

    _this.__currentTime = null;
    _this.__nextTime = Infinity;
    _this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    _this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    _this.lookahead = options.lookahead || 0.1;
    return _this;
  }

  // setTimeout scheduling loop


  (0, _createClass3.default)(Scheduler, [{
    key: '__tick',
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
  }, {
    key: 'resetTime',
    value: function resetTime() {
      var _this2 = this;

      var time = arguments.length <= 0 || arguments[0] === undefined ? this.currentTime : arguments[0];

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
            _this2.__tick();
          }, timeOutDelay * 1000);
        } else if (this.__nextTime !== Infinity) {
          console.log("Scheduler Stop");
        }

        this.__nextTime = time;
      }
    }
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
  }]);
  return Scheduler;
}(_schedulingQueue2.default);

exports.default = Scheduler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVkdWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7SUFFcUI7OztBQUNuQixXQURtQixTQUNuQixHQUEwQjtRQUFkLGdFQUFVLGtCQUFJO3dDQURQLFdBQ087OzZGQURQLHVCQUNPOztBQUd4QixVQUFLLFlBQUwsR0FBb0IsUUFBUSxZQUFSLDBCQUFwQixDQUh3Qjs7QUFLeEIsVUFBSyxhQUFMLEdBQXFCLElBQXJCLENBTHdCO0FBTXhCLFVBQUssVUFBTCxHQUFrQixRQUFsQixDQU53QjtBQU94QixVQUFLLFNBQUwsR0FBaUIsSUFBakI7Ozs7OztBQVB3QixTQWF4QixDQUFLLE1BQUwsR0FBYyxRQUFRLE1BQVIsSUFBbUIsS0FBbkI7Ozs7OztBQWJVLFNBbUJ4QixDQUFLLFNBQUwsR0FBaUIsUUFBUSxTQUFSLElBQXNCLEdBQXRCLENBbkJPOztHQUExQjs7Ozs7NkJBRG1COzs2QkF3QlY7QUFDUCxVQUFNLGVBQWUsS0FBSyxZQUFMLENBRGQ7QUFFUCxVQUFJLE9BQU8sS0FBSyxVQUFMLENBRko7O0FBSVAsV0FBSyxTQUFMLEdBQWlCLElBQWpCLENBSk87O0FBTVAsYUFBTyxRQUFRLGFBQWEsV0FBYixHQUEyQixLQUFLLFNBQUwsRUFBZ0I7QUFDeEQsYUFBSyxhQUFMLEdBQXFCLElBQXJCLENBRHdEO0FBRXhELGVBQU8sS0FBSyxXQUFMLENBQWlCLElBQWpCLENBQVAsQ0FGd0Q7T0FBMUQ7O0FBS0EsV0FBSyxhQUFMLEdBQXFCLElBQXJCLENBWE87QUFZUCxXQUFLLFNBQUwsQ0FBZSxJQUFmLEVBWk87Ozs7Z0NBZTBCOzs7VUFBekIsNkRBQU8sS0FBSyxXQUFMLGdCQUFrQjs7QUFDakMsVUFBSSxLQUFLLE1BQUwsRUFBYTtBQUNmLGFBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsSUFBbEIsRUFBd0IsSUFBeEIsRUFEZTtPQUFqQixNQUVPO0FBQ0wsWUFBSSxLQUFLLFNBQUwsRUFBZ0I7QUFDbEIsdUJBQWEsS0FBSyxTQUFMLENBQWIsQ0FEa0I7QUFFbEIsZUFBSyxTQUFMLEdBQWlCLElBQWpCLENBRmtCO1NBQXBCOztBQUtBLFlBQUksU0FBUyxRQUFULEVBQW1CO0FBQ3JCLGNBQUksS0FBSyxVQUFMLEtBQW9CLFFBQXBCLEVBQ0YsUUFBUSxHQUFSLENBQVksaUJBQVosRUFERjs7QUFHQSxjQUFNLGVBQWUsS0FBSyxHQUFMLENBQVUsT0FBTyxLQUFLLFNBQUwsR0FBaUIsS0FBSyxZQUFMLENBQWtCLFdBQWxCLEVBQWdDLEtBQUssTUFBTCxDQUFqRixDQUplOztBQU1yQixlQUFLLFNBQUwsR0FBaUIsV0FBVyxZQUFNO0FBQ2hDLG1CQUFLLE1BQUwsR0FEZ0M7V0FBTixFQUV6QixlQUFlLElBQWYsQ0FGSCxDQU5xQjtTQUF2QixNQVNPLElBQUksS0FBSyxVQUFMLEtBQW9CLFFBQXBCLEVBQThCO0FBQ3ZDLGtCQUFRLEdBQVIsQ0FBWSxnQkFBWixFQUR1QztTQUFsQzs7QUFJUCxhQUFLLFVBQUwsR0FBa0IsSUFBbEIsQ0FuQks7T0FGUDs7Ozt3QkF5QmdCO0FBQ2hCLFVBQUksS0FBSyxNQUFMLEVBQ0YsT0FBTyxLQUFLLE1BQUwsQ0FBWSxXQUFaLENBRFQ7O0FBR0EsYUFBTyxLQUFLLGFBQUwsSUFBc0IsS0FBSyxZQUFMLENBQWtCLFdBQWxCLEdBQWdDLEtBQUssU0FBTCxDQUo3Qzs7Ozt3QkFPSTtBQUNwQixVQUFNLFNBQVMsS0FBSyxNQUFMLENBREs7O0FBR3BCLFVBQUksVUFBVSxPQUFPLGVBQVAsS0FBMkIsU0FBM0IsRUFDWixPQUFPLE9BQU8sZUFBUCxDQURUOztBQUdBLGFBQU8sU0FBUCxDQU5vQjs7O1NBeEVIIiwiZmlsZSI6InNjaGVkdWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVkdWxlciBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IMKgZGVmYXVsdEF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgwqAwLjAyNTtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciBsb29rYWhlYWQgdGltZSAoPiBwZXJpb2QpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IMKgMC4xO1xuICB9XG5cbiAgLy8gc2V0VGltZW91dCBzY2hlZHVsaW5nIGxvb3BcbiAgX190aWNrKCkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIGxldCB0aW1lID0gdGhpcy5fX25leHRUaW1lO1xuXG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgd2hpbGUgKHRpbWUgPD0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICB0aW1lID0gdGhpcy5hZHZhbmNlVGltZSh0aW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgcmVzZXRUaW1lKHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKSB7XG4gICAgICB0aGlzLm1hc3Rlci5yZXNldCh0aGlzLCB0aW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGlmICh0aGlzLl9fbmV4dFRpbWUgPT09IEluZmluaXR5KVxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2NoZWR1bGVyIFN0YXJ0XCIpO1xuXG4gICAgICAgIGNvbnN0IHRpbWVPdXREZWxheSA9IE1hdGgubWF4KCh0aW1lIC0gdGhpcy5sb29rYWhlYWQgLSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSksIHRoaXMucGVyaW9kKTtcblxuICAgICAgICB0aGlzLl9fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICAgIH0sIHRpbWVPdXREZWxheSAqIDEwMDApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fbmV4dFRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2NoZWR1bGVyIFN0b3BcIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19uZXh0VGltZSA9IHRpbWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcblxuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuIl19