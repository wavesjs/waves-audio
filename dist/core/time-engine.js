"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class TimeEngine
 */

var TimeEngine = function () {
  function TimeEngine() {
    (0, _classCallCheck3.default)(this, TimeEngine);

    this.master = null;
    this.outputNode = null;
  }

  (0, _createClass3.default)(TimeEngine, [{
    key: "implementsScheduled",


    /**
     * Scheduled interface
     *   - advanceTime(time), called to generate next event at given time, returns next time
     */
    value: function implementsScheduled() {
      return this.advanceTime && this.advanceTime instanceof Function;
    }
  }, {
    key: "resetTime",
    value: function resetTime() {
      var time = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

      if (this.master) this.master.resetEngineTime(this, time);
    }

    /**
     * Transported interface
     *   - syncPosition(time, position, speed), called to reposition TimeEngine, returns next position
     *   - advancePosition(time, position, speed), called to generate next event at given time and position, returns next position
     */

  }, {
    key: "implementsTransported",
    value: function implementsTransported() {
      return this.syncPosition && this.syncPosition instanceof Function && this.advancePosition && this.advancePosition instanceof Function;
    }
  }, {
    key: "resetPosition",
    value: function resetPosition() {
      var position = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

      if (this.master) this.master.resetEnginePosition(this, position);
    }

    /**
     * Speed-controlled interface
     *   - syncSpeed(time, position, speed, ), called to
     */

  }, {
    key: "implementsSpeedControlled",
    value: function implementsSpeedControlled() {
      return this.syncSpeed && this.syncSpeed instanceof Function;
    }
  }, {
    key: "currentTime",
    get: function get() {
      if (this.master) return this.master.currentTime;

      return undefined;
    }
  }, {
    key: "currentPosition",
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }
  }]);
  return TimeEngine;
}();

exports.default = TimeEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWUtZW5naW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBR3FCO0FBQ25CLFdBRG1CLFVBQ25CLEdBQWM7d0NBREssWUFDTDs7QUFDWixTQUFLLE1BQUwsR0FBYyxJQUFkLENBRFk7QUFFWixTQUFLLFVBQUwsR0FBa0IsSUFBbEIsQ0FGWTtHQUFkOzs2QkFEbUI7Ozs7Ozs7OzBDQTBCRztBQUNwQixhQUFRLEtBQUssV0FBTCxJQUFvQixLQUFLLFdBQUwsWUFBNEIsUUFBNUIsQ0FEUjs7OztnQ0FJTTtVQUFsQiw2REFBTyx5QkFBVzs7QUFDMUIsVUFBSSxLQUFLLE1BQUwsRUFDRixLQUFLLE1BQUwsQ0FBWSxlQUFaLENBQTRCLElBQTVCLEVBQWtDLElBQWxDLEVBREY7Ozs7Ozs7Ozs7OzRDQVNzQjtBQUN0QixhQUNFLEtBQUssWUFBTCxJQUFxQixLQUFLLFlBQUwsWUFBNkIsUUFBN0IsSUFDckIsS0FBSyxlQUFMLElBQXdCLEtBQUssZUFBTCxZQUFnQyxRQUFoQyxDQUhKOzs7O29DQU9ZO1VBQXRCLGlFQUFXLHlCQUFXOztBQUNsQyxVQUFJLEtBQUssTUFBTCxFQUNGLEtBQUssTUFBTCxDQUFZLG1CQUFaLENBQWdDLElBQWhDLEVBQXNDLFFBQXRDLEVBREY7Ozs7Ozs7Ozs7Z0RBUTBCO0FBQzFCLGFBQVEsS0FBSyxTQUFMLElBQWtCLEtBQUssU0FBTCxZQUEwQixRQUExQixDQURBOzs7O3dCQWxEVjtBQUNoQixVQUFJLEtBQUssTUFBTCxFQUNGLE9BQU8sS0FBSyxNQUFMLENBQVksV0FBWixDQURUOztBQUdBLGFBQU8sU0FBUCxDQUpnQjs7Ozt3QkFPSTtBQUNwQixVQUFJLFNBQVMsS0FBSyxNQUFMLENBRE87O0FBR3BCLFVBQUksVUFBVSxPQUFPLGVBQVAsS0FBMkIsU0FBM0IsRUFDWixPQUFPLE9BQU8sZUFBUCxDQURUOztBQUdBLGFBQU8sU0FBUCxDQU5vQjs7O1NBYkgiLCJmaWxlIjoidGltZS1lbmdpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzcyBUaW1lRW5naW5lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5vdXRwdXROb2RlID0gbnVsbDtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICB2YXIgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZWQgaW50ZXJmYWNlXG4gICAqICAgLSBhZHZhbmNlVGltZSh0aW1lKSwgY2FsbGVkIHRvIGdlbmVyYXRlIG5leHQgZXZlbnQgYXQgZ2l2ZW4gdGltZSwgcmV0dXJucyBuZXh0IHRpbWVcbiAgICovXG4gIGltcGxlbWVudHNTY2hlZHVsZWQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmFkdmFuY2VUaW1lICYmIHRoaXMuYWR2YW5jZVRpbWUgaW5zdGFuY2VvZiBGdW5jdGlvbik7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnRlZCBpbnRlcmZhY2VcbiAgICogICAtIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gcmVwb3NpdGlvbiBUaW1lRW5naW5lLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICogICAtIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gZ2VuZXJhdGUgbmV4dCBldmVudCBhdCBnaXZlbiB0aW1lIGFuZCBwb3NpdGlvbiwgcmV0dXJucyBuZXh0IHBvc2l0aW9uXG4gICAqL1xuICBpbXBsZW1lbnRzVHJhbnNwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuc3luY1Bvc2l0aW9uICYmIHRoaXMuc3luY1Bvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb24gJiZcbiAgICAgIHRoaXMuYWR2YW5jZVBvc2l0aW9uICYmIHRoaXMuYWR2YW5jZVBvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb25cbiAgICApO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlXG4gICAqICAgLSBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCApLCBjYWxsZWQgdG9cbiAgICovXG4gIGltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSB7XG4gICAgcmV0dXJuICh0aGlzLnN5bmNTcGVlZCAmJiB0aGlzLnN5bmNTcGVlZCBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxufVxuIl19