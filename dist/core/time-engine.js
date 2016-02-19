"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

/**
 * @class TimeEngine
 */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7Ozs7Ozs7OztJQUtQLFVBQVU7QUFDSCxXQURQLFVBQVUsR0FDQTswQkFEVixVQUFVOztBQUVaLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ3hCOztlQUpHLFVBQVU7QUFNVixlQUFXO1dBQUEsWUFBRztBQUNoQixZQUFJLElBQUksQ0FBQyxNQUFNLEVBQ2IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQzs7QUFFakMsZUFBTyxTQUFTLENBQUM7T0FDbEI7O0FBRUcsbUJBQWU7V0FBQSxZQUFHO0FBQ3BCLFlBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFlBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxlQUFlLEtBQUssU0FBUyxFQUNoRCxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQUM7O0FBRWhDLGVBQU8sU0FBUyxDQUFDO09BQ2xCOztBQU1ELHVCQUFtQjs7Ozs7OzthQUFBLCtCQUFHO0FBQ3BCLGVBQVEsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxZQUFZLFFBQVEsQ0FBRTtPQUNuRTs7QUFFRCxhQUFTO2FBQUEscUJBQW1CO1lBQWxCLElBQUksZ0NBQUcsU0FBUzs7QUFDeEIsWUFBSSxJQUFJLENBQUMsTUFBTSxFQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztPQUMzQzs7QUFPRCx5QkFBcUI7Ozs7Ozs7O2FBQUEsaUNBQUc7QUFDdEIsZUFDRSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLFlBQVksUUFBUSxJQUMxRCxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxlQUFlLFlBQVksUUFBUSxDQUNoRTtPQUNIOztBQUVELGlCQUFhO2FBQUEseUJBQXVCO1lBQXRCLFFBQVEsZ0NBQUcsU0FBUzs7QUFDaEMsWUFBSSxJQUFJLENBQUMsTUFBTSxFQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO09BQ25EOztBQU1ELDZCQUF5Qjs7Ozs7OzthQUFBLHFDQUFHO0FBQzFCLGVBQVEsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsU0FBUyxZQUFZLFFBQVEsQ0FBRTtPQUMvRDs7OztTQTFERyxVQUFVOzs7QUE2RGhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6ImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBjbGFzcyBUaW1lRW5naW5lXG4gKi9cbmNsYXNzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5vdXRwdXROb2RlID0gbnVsbDtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICB2YXIgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZWQgaW50ZXJmYWNlXG4gICAqICAgLSBhZHZhbmNlVGltZSh0aW1lKSwgY2FsbGVkIHRvIGdlbmVyYXRlIG5leHQgZXZlbnQgYXQgZ2l2ZW4gdGltZSwgcmV0dXJucyBuZXh0IHRpbWVcbiAgICovXG4gIGltcGxlbWVudHNTY2hlZHVsZWQoKSB7XG4gICAgcmV0dXJuICh0aGlzLmFkdmFuY2VUaW1lICYmIHRoaXMuYWR2YW5jZVRpbWUgaW5zdGFuY2VvZiBGdW5jdGlvbik7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnRlZCBpbnRlcmZhY2VcbiAgICogICAtIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gcmVwb3NpdGlvbiBUaW1lRW5naW5lLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICogICAtIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gZ2VuZXJhdGUgbmV4dCBldmVudCBhdCBnaXZlbiB0aW1lIGFuZCBwb3NpdGlvbiwgcmV0dXJucyBuZXh0IHBvc2l0aW9uXG4gICAqL1xuICBpbXBsZW1lbnRzVHJhbnNwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuc3luY1Bvc2l0aW9uICYmIHRoaXMuc3luY1Bvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb24gJiZcbiAgICAgIHRoaXMuYWR2YW5jZVBvc2l0aW9uICYmIHRoaXMuYWR2YW5jZVBvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb25cbiAgICApO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlXG4gICAqICAgLSBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCApLCBjYWxsZWQgdG9cbiAgICovXG4gIGltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSB7XG4gICAgcmV0dXJuICh0aGlzLnN5bmNTcGVlZCAmJiB0aGlzLnN5bmNTcGVlZCBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVFbmdpbmU7Il19