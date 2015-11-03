/**
 * @class TimeEngine
 */
"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});

var TimeEngine = (function () {
  function TimeEngine() {
    _classCallCheck(this, TimeEngine);

    this.master = null;
    this.outputNode = null;
  }

  _createClass(TimeEngine, [{
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
})();

exports["default"] = TimeEngine;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9jb3JlL3RpbWUtZW5naW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFHcUIsVUFBVTtBQUNsQixXQURRLFVBQVUsR0FDZjswQkFESyxVQUFVOztBQUUzQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztHQUN4Qjs7ZUFKa0IsVUFBVTs7Ozs7OztXQTBCViwrQkFBRztBQUNwQixhQUFRLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsWUFBWSxRQUFRLENBQUU7S0FDbkU7OztXQUVRLHFCQUFtQjtVQUFsQixJQUFJLHlEQUFHLFNBQVM7O0FBQ3hCLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDM0M7Ozs7Ozs7OztXQU9vQixpQ0FBRztBQUN0QixhQUNFLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksWUFBWSxRQUFRLElBQzFELElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsWUFBWSxRQUFRLENBQ2hFO0tBQ0g7OztXQUVZLHlCQUF1QjtVQUF0QixRQUFRLHlEQUFHLFNBQVM7O0FBQ2hDLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFDYixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNuRDs7Ozs7Ozs7V0FNd0IscUNBQUc7QUFDMUIsYUFBUSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksUUFBUSxDQUFFO0tBQy9EOzs7U0FwRGMsZUFBRztBQUNoQixVQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsYUFBTyxTQUFTLENBQUM7S0FDbEI7OztTQUVrQixlQUFHO0FBQ3BCLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFVBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssU0FBUyxFQUNoRCxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQUM7O0FBRWhDLGFBQU8sU0FBUyxDQUFDO0tBQ2xCOzs7U0FwQmtCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6ImVzNi9jb3JlL3RpbWUtZW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAY2xhc3MgVGltZUVuZ2luZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMub3V0cHV0Tm9kZSA9IG51bGw7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVkIGludGVyZmFjZVxuICAgKiAgIC0gYWR2YW5jZVRpbWUodGltZSksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUsIHJldHVybnMgbmV4dCB0aW1lXG4gICAqL1xuICBpbXBsZW1lbnRzU2NoZWR1bGVkKCkge1xuICAgIHJldHVybiAodGhpcy5hZHZhbmNlVGltZSAmJiB0aGlzLmFkdmFuY2VUaW1lIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG5cbiAgcmVzZXRUaW1lKHRpbWUgPSB1bmRlZmluZWQpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVRpbWUodGhpcywgdGltZSk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNwb3J0ZWQgaW50ZXJmYWNlXG4gICAqICAgLSBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSwgY2FsbGVkIHRvIHJlcG9zaXRpb24gVGltZUVuZ2luZSwgcmV0dXJucyBuZXh0IHBvc2l0aW9uXG4gICAqICAgLSBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSwgY2FsbGVkIHRvIGdlbmVyYXRlIG5leHQgZXZlbnQgYXQgZ2l2ZW4gdGltZSBhbmQgcG9zaXRpb24sIHJldHVybnMgbmV4dCBwb3NpdGlvblxuICAgKi9cbiAgaW1wbGVtZW50c1RyYW5zcG9ydGVkKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLnN5bmNQb3NpdGlvbiAmJiB0aGlzLnN5bmNQb3NpdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uICYmXG4gICAgICB0aGlzLmFkdmFuY2VQb3NpdGlvbiAmJiB0aGlzLmFkdmFuY2VQb3NpdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uXG4gICAgKTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGVlZC1jb250cm9sbGVkIGludGVyZmFjZVxuICAgKiAgIC0gc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgKSwgY2FsbGVkIHRvXG4gICAqL1xuICBpbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKCkge1xuICAgIHJldHVybiAodGhpcy5zeW5jU3BlZWQgJiYgdGhpcy5zeW5jU3BlZWQgaW5zdGFuY2VvZiBGdW5jdGlvbik7XG4gIH1cbn1cbiJdfQ==