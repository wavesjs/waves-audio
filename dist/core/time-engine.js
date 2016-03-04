/**
 * @class TimeEngine
 */
"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var TimeEngine = (function () {
  function TimeEngine() {
    _classCallCheck(this, TimeEngine);

    this.master = null;
    this.outputNode = null;
  }

  _createClass(TimeEngine, {
    currentTime: {
      get: function () {
        if (this.master) return this.master.currentTime;

        return undefined;
      }
    },
    currentPosition: {
      get: function () {
        var master = this.master;

        if (master && master.currentPosition !== undefined) return master.currentPosition;

        return undefined;
      }
    },
    implementsScheduled: {

      /**
       * Scheduled interface
       *   - advanceTime(time), called to generate next event at given time, returns next time
       */

      value: function implementsScheduled() {
        return this.advanceTime && this.advanceTime instanceof Function;
      }
    },
    resetTime: {
      value: function resetTime() {
        var time = arguments[0] === undefined ? undefined : arguments[0];

        if (this.master) this.master.resetEngineTime(this, time);
      }
    },
    implementsTransported: {

      /**
       * Transported interface
       *   - syncPosition(time, position, speed), called to reposition TimeEngine, returns next position
       *   - advancePosition(time, position, speed), called to generate next event at given time and position, returns next position
       */

      value: function implementsTransported() {
        return this.syncPosition && this.syncPosition instanceof Function && this.advancePosition && this.advancePosition instanceof Function;
      }
    },
    resetPosition: {
      value: function resetPosition() {
        var position = arguments[0] === undefined ? undefined : arguments[0];

        if (this.master) this.master.resetEnginePosition(this, position);
      }
    },
    implementsSpeedControlled: {

      /**
       * Speed-controlled interface
       *   - syncSpeed(time, position, speed, ), called to
       */

      value: function implementsSpeedControlled() {
        return this.syncSpeed && this.syncSpeed instanceof Function;
      }
    }
  });

  return TimeEngine;
})();

module.exports = TimeEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9jb3JlL3RpbWUtZW5naW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztJQUdxQixVQUFVO0FBQ2xCLFdBRFEsVUFBVSxHQUNmOzBCQURLLFVBQVU7O0FBRTNCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ3hCOztlQUprQixVQUFVO0FBTXpCLGVBQVc7V0FBQSxZQUFHO0FBQ2hCLFlBQUksSUFBSSxDQUFDLE1BQU0sRUFDYixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDOztBQUVqQyxlQUFPLFNBQVMsQ0FBQztPQUNsQjs7QUFFRyxtQkFBZTtXQUFBLFlBQUc7QUFDcEIsWUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFekIsWUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLGVBQWUsS0FBSyxTQUFTLEVBQ2hELE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBQzs7QUFFaEMsZUFBTyxTQUFTLENBQUM7T0FDbEI7O0FBTUQsdUJBQW1COzs7Ozs7O2FBQUEsK0JBQUc7QUFDcEIsZUFBUSxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLFlBQVksUUFBUSxDQUFFO09BQ25FOztBQUVELGFBQVM7YUFBQSxxQkFBbUI7WUFBbEIsSUFBSSxnQ0FBRyxTQUFTOztBQUN4QixZQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO09BQzNDOztBQU9ELHlCQUFxQjs7Ozs7Ozs7YUFBQSxpQ0FBRztBQUN0QixlQUNFLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFlBQVksWUFBWSxRQUFRLElBQzFELElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxDQUFDLGVBQWUsWUFBWSxRQUFRLENBQ2hFO09BQ0g7O0FBRUQsaUJBQWE7YUFBQSx5QkFBdUI7WUFBdEIsUUFBUSxnQ0FBRyxTQUFTOztBQUNoQyxZQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDbkQ7O0FBTUQsNkJBQXlCOzs7Ozs7O2FBQUEscUNBQUc7QUFDMUIsZUFBUSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLFlBQVksUUFBUSxDQUFFO09BQy9EOzs7O1NBMURrQixVQUFVOzs7aUJBQVYsVUFBVSIsImZpbGUiOiJlczYvY29yZS90aW1lLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzIFRpbWVFbmdpbmVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLm91dHB1dE5vZGUgPSBudWxsO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlZCBpbnRlcmZhY2VcbiAgICogICAtIGFkdmFuY2VUaW1lKHRpbWUpLCBjYWxsZWQgdG8gZ2VuZXJhdGUgbmV4dCBldmVudCBhdCBnaXZlbiB0aW1lLCByZXR1cm5zIG5leHQgdGltZVxuICAgKi9cbiAgaW1wbGVtZW50c1NjaGVkdWxlZCgpIHtcbiAgICByZXR1cm4gKHRoaXMuYWR2YW5jZVRpbWUgJiYgdGhpcy5hZHZhbmNlVGltZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxuXG4gIHJlc2V0VGltZSh0aW1lID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydGVkIGludGVyZmFjZVxuICAgKiAgIC0gc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byByZXBvc2l0aW9uIFRpbWVFbmdpbmUsIHJldHVybnMgbmV4dCBwb3NpdGlvblxuICAgKiAgIC0gYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUgYW5kIHBvc2l0aW9uLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICovXG4gIGltcGxlbWVudHNUcmFuc3BvcnRlZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5zeW5jUG9zaXRpb24gJiYgdGhpcy5zeW5jUG9zaXRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbiAmJlxuICAgICAgdGhpcy5hZHZhbmNlUG9zaXRpb24gJiYgdGhpcy5hZHZhbmNlUG9zaXRpb24gaW5zdGFuY2VvZiBGdW5jdGlvblxuICAgICk7XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogU3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2VcbiAgICogICAtIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsICksIGNhbGxlZCB0b1xuICAgKi9cbiAgaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpIHtcbiAgICByZXR1cm4gKHRoaXMuc3luY1NwZWVkICYmIHRoaXMuc3luY1NwZWVkIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG59XG4iXX0=