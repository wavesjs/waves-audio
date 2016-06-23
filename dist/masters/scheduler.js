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

      var time = arguments.length <= 0 || arguments[0] === undefined ? this.currentTime : arguments[0];

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
          }, timeOutDelay * 1000);
        } else if (this.__nextTime !== Infinity) {
          log('Scheduler Stop');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVkdWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxNQUFNLHFCQUFNLGVBQU4sQ0FBTjs7SUFFZTs7O0FBQ25CLFdBRG1CLFNBQ25CLEdBQTBCO1FBQWQsZ0VBQVUsa0JBQUk7d0NBRFAsV0FDTzs7NkZBRFAsdUJBQ087O0FBR3hCLFVBQUssWUFBTCxHQUFvQixRQUFRLFlBQVIsMEJBQXBCLENBSHdCOztBQUt4QixVQUFLLGFBQUwsR0FBcUIsSUFBckIsQ0FMd0I7QUFNeEIsVUFBSyxVQUFMLEdBQWtCLFFBQWxCLENBTndCO0FBT3hCLFVBQUssU0FBTCxHQUFpQixJQUFqQjs7Ozs7O0FBUHdCLFNBYXhCLENBQUssTUFBTCxHQUFjLFFBQVEsTUFBUixJQUFtQixLQUFuQjs7Ozs7O0FBYlUsU0FtQnhCLENBQUssU0FBTCxHQUFpQixRQUFRLFNBQVIsSUFBc0IsR0FBdEIsQ0FuQk87O0dBQTFCOzs7Ozs2QkFEbUI7OzZCQXdCVjtBQUNQLFVBQU0sZUFBZSxLQUFLLFlBQUwsQ0FEZDtBQUVQLFVBQU0sY0FBYyxhQUFhLFdBQWIsQ0FGYjtBQUdQLFVBQUksT0FBTyxLQUFLLFVBQUwsQ0FISjs7QUFLUCxXQUFLLFNBQUwsR0FBaUIsSUFBakIsQ0FMTzs7QUFPUCxhQUFPLFFBQVEsY0FBYyxLQUFLLFNBQUwsRUFBZ0I7QUFDM0MsYUFBSyxhQUFMLEdBQXFCLElBQXJCLENBRDJDO0FBRTNDLGVBQU8sS0FBSyxXQUFMLENBQWlCLElBQWpCLENBQVAsQ0FGMkM7T0FBN0M7O0FBS0EsV0FBSyxhQUFMLEdBQXFCLElBQXJCLENBWk87QUFhUCxXQUFLLFNBQUwsQ0FBZSxJQUFmLEVBYk87Ozs7Z0NBZ0IwQjs7O1VBQXpCLDZEQUFPLEtBQUssV0FBTCxnQkFBa0I7O0FBQ2pDLFVBQUksS0FBSyxNQUFMLEVBQWE7QUFDZixhQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLElBQWxCLEVBQXdCLElBQXhCLEVBRGU7T0FBakIsTUFFTztBQUNMLFlBQUksS0FBSyxTQUFMLEVBQWdCO0FBQ2xCLHVCQUFhLEtBQUssU0FBTCxDQUFiLENBRGtCO0FBRWxCLGVBQUssU0FBTCxHQUFpQixJQUFqQixDQUZrQjtTQUFwQjs7QUFLQSxZQUFJLFNBQVMsUUFBVCxFQUFtQjtBQUNyQixjQUFJLEtBQUssVUFBTCxLQUFvQixRQUFwQixFQUNGLElBQUksaUJBQUosRUFERjs7QUFHQSxjQUFNLGVBQWUsS0FBSyxHQUFMLENBQVUsT0FBTyxLQUFLLFNBQUwsR0FBaUIsS0FBSyxZQUFMLENBQWtCLFdBQWxCLEVBQWdDLEtBQUssTUFBTCxDQUFqRixDQUplOztBQU1yQixlQUFLLFNBQUwsR0FBaUIsV0FBVyxZQUFNO0FBQ2hDLG1CQUFLLE1BQUwsR0FEZ0M7V0FBTixFQUV6QixlQUFlLElBQWYsQ0FGSCxDQU5xQjtTQUF2QixNQVNPLElBQUksS0FBSyxVQUFMLEtBQW9CLFFBQXBCLEVBQThCO0FBQ3ZDLGNBQUksZ0JBQUosRUFEdUM7U0FBbEM7O0FBSVAsYUFBSyxVQUFMLEdBQWtCLElBQWxCLENBbkJLO09BRlA7Ozs7d0JBeUJnQjtBQUNoQixVQUFJLEtBQUssTUFBTCxFQUNGLE9BQU8sS0FBSyxNQUFMLENBQVksV0FBWixDQURUOztBQUdBLGFBQU8sS0FBSyxhQUFMLElBQXNCLEtBQUssWUFBTCxDQUFrQixXQUFsQixHQUFnQyxLQUFLLFNBQUwsQ0FKN0M7Ozs7d0JBT0k7QUFDcEIsVUFBTSxTQUFTLEtBQUssTUFBTCxDQURLOztBQUdwQixVQUFJLFVBQVUsT0FBTyxlQUFQLEtBQTJCLFNBQTNCLEVBQ1osT0FBTyxPQUFPLGVBQVAsQ0FEVDs7QUFHQSxhQUFPLFNBQVAsQ0FOb0I7OztTQXpFSCIsImZpbGUiOiJzY2hlZHVsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vY29yZS9zY2hlZHVsaW5nLXF1ZXVlJztcblxuY29uc3QgbG9nID0gZGVidWcoJ3dhdmVzanM6YXVkaW8nKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGVyIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBJbmZpbml0eTtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCDCoDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgwqAwLjE7XG4gIH1cblxuICAvLyBzZXRUaW1lb3V0IHNjaGVkdWxpbmcgbG9vcFxuICBfX3RpY2soKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgbGV0IHRpbWUgPSB0aGlzLl9fbmV4dFRpbWU7XG5cbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICB3aGlsZSAodGltZSA8PSBjdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgdGltZSA9IHRoaXMuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgfVxuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIHJlc2V0VGltZSh0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICh0aGlzLm1hc3Rlcikge1xuICAgICAgdGhpcy5tYXN0ZXIucmVzZXQodGhpcywgdGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICBpZiAodGhpcy5fX25leHRUaW1lID09PSBJbmZpbml0eSlcbiAgICAgICAgICBsb2coJ1NjaGVkdWxlciBTdGFydCcpO1xuXG4gICAgICAgIGNvbnN0IHRpbWVPdXREZWxheSA9IE1hdGgubWF4KCh0aW1lIC0gdGhpcy5sb29rYWhlYWQgLSB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSksIHRoaXMucGVyaW9kKTtcblxuICAgICAgICB0aGlzLl9fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICAgIH0sIHRpbWVPdXREZWxheSAqIDEwMDApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fbmV4dFRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGxvZygnU2NoZWR1bGVyIFN0b3AnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB9XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iXX0=