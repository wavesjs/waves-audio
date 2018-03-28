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
 * Base class for time engines
 *
 * A time engine generates more or less regular events and/or plays back a
 * media stream. It implements one or multiple interfaces to be driven by a
 * master (i.e. a Scheduler, a Transport or a PlayControl) in synchronization
 * with other engines. The provided interfaces are scheduled, transported,
 * and play-controlled.
 *
 *
 * #### The `scheduled` interface
 *
 * The scheduled interface allows for synchronizing an engine to a monotonous time
 * as it is provided by the Scheduler master.
 *
 * ###### `advanceTime(time :Number) -> {Number}`
 *
 * The `advanceTime` method has to be implemented by an `TimeEngine` as part of the
 * scheduled interface. The method is called by the master (e.g. the scheduler).
 * It generates an event and to returns the time of the next event (i.e. the next
 * call of advanceTime). The returned time has to be greater than the time
 * received as argument of the method. In case that a TimeEngine has to generate
 * multiple events at the same time, the engine has to implement its own loop
 * while(event.time <= time) and return the time of the next event (if any).
 *
 * ###### `resetTime(time=undefined :Number)`
 *
 * The `resetTime` method is provided by the `TimeEngine` base class. An engine may
 * call this method to reset its next event time (e.g. when a parameter is
 * changed that influences the engine's temporal behavior). When no argument
 * is given, the time is reset to the current master time. When calling the
 * method with Infinity the engine is suspended without being removed from the
 * master.
 *
 *
 * #### The `transported` interface
 *
 * The transported interface allows for synchronizing an engine to a position
 * (i.e. media playback time) that can run forward and backward and jump as it
 * is provided by the Transport master.
 *
 * ###### `syncPosition(time :Number, position :Number, speed :Number) -> {Number}`
 *
 * The `syncPositon` method has to be implemented by a `TimeEngine` as part of the
 * transported interface. The method syncPositon is called whenever the master
 * of a transported engine has to (re-)synchronize the engine's position. This
 * is for example required when the master (re-)starts playback, jumps to an
 * arbitrary position, and when reversing playback direction. The method returns
 * the next position of the engine in the given playback direction
 * (i.e. `speed < 0` or `speed > 0`).
 *
 * ###### `advancePosition(time :Number, position :Number, speed :Number) -> {Number}`
 *
 * The `advancePosition` method has to be implemented by a `TimeEngine` as part
 * of the transported interface. The master calls the advancePositon method when
 * the engine's event position is reached. The method generates an event and
 * returns the next position in the given playback direction (i.e. speed < 0 or
 * speed > 0). The returned position has to be greater (i.e. when speed > 0)
 * or less (i.e. when speed < 0) than the position received as argument of the
 * method.
 *
 * ###### `resetPosition(position=undefined :Number)`
 *
 * The resetPosition method is provided by the TimeEngine base class. An engine
 * may call this method to reset its next event position. When no argument
 * is given, the time is reset to the current master time. When calling the
 * method with Infinity the engine is suspended without being removed from
 * the master.
 *
 *
 * #### The speed-controlled interface
 *
 * The "speed-controlled" interface allows for syncronizing an engine that is
 * neither driven through the scheduled nor the transported interface. The
 * interface allows in particular to synchronize engines that assure their own
 * scheduling (i.e. audio player or an oscillator) to the event-based scheduled
 * and transported engines.
 *
 * ###### `syncSpeed(time :Number, position :Number, speed :Number, seek=false :Boolean)`
 *
 * The syncSpeed method has to be implemented by a TimeEngine as part of the
 * speed-controlled interface. The method is called by the master whenever the
 * playback speed changes or the position jumps arbitarily (i.e. on a seek).
 *
 *
 * <hr />
 *
 * Example that shows a `TimeEngine` running in a `Scheduler` that counts up
 * at a given frequency:
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/time-engine.html}
 *
 * @example
 * import * as audio from 'waves-audio';
 *
 * class MyEngine extends audio.TimeEngine {
 *   constructor() {
 *     super();
 *     // ...
 *   }
 * }
 *
 */
var TimeEngine = function () {
  function TimeEngine() {
    (0, _classCallCheck3.default)(this, TimeEngine);

    /**
     * The engine's master.
     *
     * @type {Mixed}
     * @name master
     * @memberof TimeEngine
     */
    this.master = null;
  }

  /**
   * The time engine's current (master) time.
   *
   * @type {Number}
   * @memberof TimeEngine
   * @readonly
   */


  (0, _createClass3.default)(TimeEngine, [{
    key: "resetTime",
    value: function resetTime() {
      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (this.master) this.master.resetEngineTime(this, time);
    }

    /**
     * Transported interface
     *   - syncPosition(time, position, speed), called to reposition TimeEngine, returns next position
     *   - advancePosition(time, position, speed), called to generate next event at given time and position, returns next position
     *
     * @static
     * @memberof TimeEngine
     */

  }, {
    key: "resetPosition",
    value: function resetPosition() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (this.master) this.master.resetEnginePosition(this, position);
    }

    /**
     * Speed-controlled interface
     *   - syncSpeed(time, position, speed, ), called to
     *
     * @static
     * @memberof TimeEngine
     */

  }, {
    key: "currentTime",
    get: function get() {
      if (this.master) return this.master.currentTime;

      return undefined;
    }

    /**
     * The time engine's current (master) position.
     *
     * @type {Number}
     * @memberof TimeEngine
     * @readonly
     */

  }, {
    key: "currentPosition",
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }

    /**
     * Scheduled interface
     *   - advanceTime(time), called to generate next event at given time, returns next time
     *
     * @static
     * @memberof TimeEngine
     */

  }], [{
    key: "implementsScheduled",
    value: function implementsScheduled(engine) {
      return engine.advanceTime && engine.advanceTime instanceof Function;
    }
  }, {
    key: "implementsTransported",
    value: function implementsTransported(engine) {
      return engine.syncPosition && engine.syncPosition instanceof Function && engine.advancePosition && engine.advancePosition instanceof Function;
    }
  }, {
    key: "implementsSpeedControlled",
    value: function implementsSpeedControlled(engine) {
      return engine.syncSpeed && engine.syncSpeed instanceof Function;
    }
  }]);
  return TimeEngine;
}();

exports.default = TimeEngine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWUtZW5naW5lLmpzIl0sIm5hbWVzIjpbIlRpbWVFbmdpbmUiLCJtYXN0ZXIiLCJ0aW1lIiwidW5kZWZpbmVkIiwicmVzZXRFbmdpbmVUaW1lIiwicG9zaXRpb24iLCJyZXNldEVuZ2luZVBvc2l0aW9uIiwiY3VycmVudFRpbWUiLCJjdXJyZW50UG9zaXRpb24iLCJlbmdpbmUiLCJhZHZhbmNlVGltZSIsIkZ1bmN0aW9uIiwic3luY1Bvc2l0aW9uIiwiYWR2YW5jZVBvc2l0aW9uIiwic3luY1NwZWVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXNHTUEsVTtBQUNKLHdCQUFjO0FBQUE7O0FBQ1o7Ozs7Ozs7QUFPQSxTQUFLQyxNQUFMLEdBQWMsSUFBZDtBQUNEOztBQUVEOzs7Ozs7Ozs7OztnQ0F5QzRCO0FBQUEsVUFBbEJDLElBQWtCLHVFQUFYQyxTQUFXOztBQUMxQixVQUFJLEtBQUtGLE1BQVQsRUFDRSxLQUFLQSxNQUFMLENBQVlHLGVBQVosQ0FBNEIsSUFBNUIsRUFBa0NGLElBQWxDO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7O29DQWVvQztBQUFBLFVBQXRCRyxRQUFzQix1RUFBWEYsU0FBVzs7QUFDbEMsVUFBSSxLQUFLRixNQUFULEVBQ0UsS0FBS0EsTUFBTCxDQUFZSyxtQkFBWixDQUFnQyxJQUFoQyxFQUFzQ0QsUUFBdEM7QUFDSDs7QUFFRDs7Ozs7Ozs7Ozt3QkEzRGtCO0FBQ2hCLFVBQUksS0FBS0osTUFBVCxFQUNFLE9BQU8sS0FBS0EsTUFBTCxDQUFZTSxXQUFuQjs7QUFFRixhQUFPSixTQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7d0JBT3NCO0FBQ3BCLFVBQUlGLFNBQVMsS0FBS0EsTUFBbEI7O0FBRUEsVUFBSUEsVUFBVUEsT0FBT08sZUFBUCxLQUEyQkwsU0FBekMsRUFDRSxPQUFPRixPQUFPTyxlQUFkOztBQUVGLGFBQU9MLFNBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozt3Q0FPMkJNLE0sRUFBUTtBQUNqQyxhQUFRQSxPQUFPQyxXQUFQLElBQXNCRCxPQUFPQyxXQUFQLFlBQThCQyxRQUE1RDtBQUNEOzs7MENBZTRCRixNLEVBQVE7QUFDbkMsYUFDRUEsT0FBT0csWUFBUCxJQUF1QkgsT0FBT0csWUFBUCxZQUErQkQsUUFBdEQsSUFDQUYsT0FBT0ksZUFEUCxJQUMwQkosT0FBT0ksZUFBUCxZQUFrQ0YsUUFGOUQ7QUFJRDs7OzhDQWNnQ0YsTSxFQUFRO0FBQ3ZDLGFBQVFBLE9BQU9LLFNBQVAsSUFBb0JMLE9BQU9LLFNBQVAsWUFBNEJILFFBQXhEO0FBQ0Q7Ozs7O2tCQUdZWCxVIiwiZmlsZSI6InRpbWUtZW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBCYXNlIGNsYXNzIGZvciB0aW1lIGVuZ2luZXNcbiAqXG4gKiBBIHRpbWUgZW5naW5lIGdlbmVyYXRlcyBtb3JlIG9yIGxlc3MgcmVndWxhciBldmVudHMgYW5kL29yIHBsYXlzIGJhY2sgYVxuICogbWVkaWEgc3RyZWFtLiBJdCBpbXBsZW1lbnRzIG9uZSBvciBtdWx0aXBsZSBpbnRlcmZhY2VzIHRvIGJlIGRyaXZlbiBieSBhXG4gKiBtYXN0ZXIgKGkuZS4gYSBTY2hlZHVsZXIsIGEgVHJhbnNwb3J0IG9yIGEgUGxheUNvbnRyb2wpIGluIHN5bmNocm9uaXphdGlvblxuICogd2l0aCBvdGhlciBlbmdpbmVzLiBUaGUgcHJvdmlkZWQgaW50ZXJmYWNlcyBhcmUgc2NoZWR1bGVkLCB0cmFuc3BvcnRlZCxcbiAqIGFuZCBwbGF5LWNvbnRyb2xsZWQuXG4gKlxuICpcbiAqICMjIyMgVGhlIGBzY2hlZHVsZWRgIGludGVyZmFjZVxuICpcbiAqIFRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY2hyb25pemluZyBhbiBlbmdpbmUgdG8gYSBtb25vdG9ub3VzIHRpbWVcbiAqIGFzIGl0IGlzIHByb3ZpZGVkIGJ5IHRoZSBTY2hlZHVsZXIgbWFzdGVyLlxuICpcbiAqICMjIyMjIyBgYWR2YW5jZVRpbWUodGltZSA6TnVtYmVyKSAtPiB7TnVtYmVyfWBcbiAqXG4gKiBUaGUgYGFkdmFuY2VUaW1lYCBtZXRob2QgaGFzIHRvIGJlIGltcGxlbWVudGVkIGJ5IGFuIGBUaW1lRW5naW5lYCBhcyBwYXJ0IG9mIHRoZVxuICogc2NoZWR1bGVkIGludGVyZmFjZS4gVGhlIG1ldGhvZCBpcyBjYWxsZWQgYnkgdGhlIG1hc3RlciAoZS5nLiB0aGUgc2NoZWR1bGVyKS5cbiAqIEl0IGdlbmVyYXRlcyBhbiBldmVudCBhbmQgdG8gcmV0dXJucyB0aGUgdGltZSBvZiB0aGUgbmV4dCBldmVudCAoaS5lLiB0aGUgbmV4dFxuICogY2FsbCBvZiBhZHZhbmNlVGltZSkuIFRoZSByZXR1cm5lZCB0aW1lIGhhcyB0byBiZSBncmVhdGVyIHRoYW4gdGhlIHRpbWVcbiAqIHJlY2VpdmVkIGFzIGFyZ3VtZW50IG9mIHRoZSBtZXRob2QuIEluIGNhc2UgdGhhdCBhIFRpbWVFbmdpbmUgaGFzIHRvIGdlbmVyYXRlXG4gKiBtdWx0aXBsZSBldmVudHMgYXQgdGhlIHNhbWUgdGltZSwgdGhlIGVuZ2luZSBoYXMgdG8gaW1wbGVtZW50IGl0cyBvd24gbG9vcFxuICogd2hpbGUoZXZlbnQudGltZSA8PSB0aW1lKSBhbmQgcmV0dXJuIHRoZSB0aW1lIG9mIHRoZSBuZXh0IGV2ZW50IChpZiBhbnkpLlxuICpcbiAqICMjIyMjIyBgcmVzZXRUaW1lKHRpbWU9dW5kZWZpbmVkIDpOdW1iZXIpYFxuICpcbiAqIFRoZSBgcmVzZXRUaW1lYCBtZXRob2QgaXMgcHJvdmlkZWQgYnkgdGhlIGBUaW1lRW5naW5lYCBiYXNlIGNsYXNzLiBBbiBlbmdpbmUgbWF5XG4gKiBjYWxsIHRoaXMgbWV0aG9kIHRvIHJlc2V0IGl0cyBuZXh0IGV2ZW50IHRpbWUgKGUuZy4gd2hlbiBhIHBhcmFtZXRlciBpc1xuICogY2hhbmdlZCB0aGF0IGluZmx1ZW5jZXMgdGhlIGVuZ2luZSdzIHRlbXBvcmFsIGJlaGF2aW9yKS4gV2hlbiBubyBhcmd1bWVudFxuICogaXMgZ2l2ZW4sIHRoZSB0aW1lIGlzIHJlc2V0IHRvIHRoZSBjdXJyZW50IG1hc3RlciB0aW1lLiBXaGVuIGNhbGxpbmcgdGhlXG4gKiBtZXRob2Qgd2l0aCBJbmZpbml0eSB0aGUgZW5naW5lIGlzIHN1c3BlbmRlZCB3aXRob3V0IGJlaW5nIHJlbW92ZWQgZnJvbSB0aGVcbiAqIG1hc3Rlci5cbiAqXG4gKlxuICogIyMjIyBUaGUgYHRyYW5zcG9ydGVkYCBpbnRlcmZhY2VcbiAqXG4gKiBUaGUgdHJhbnNwb3J0ZWQgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY2hyb25pemluZyBhbiBlbmdpbmUgdG8gYSBwb3NpdGlvblxuICogKGkuZS4gbWVkaWEgcGxheWJhY2sgdGltZSkgdGhhdCBjYW4gcnVuIGZvcndhcmQgYW5kIGJhY2t3YXJkIGFuZCBqdW1wIGFzIGl0XG4gKiBpcyBwcm92aWRlZCBieSB0aGUgVHJhbnNwb3J0IG1hc3Rlci5cbiAqXG4gKiAjIyMjIyMgYHN5bmNQb3NpdGlvbih0aW1lIDpOdW1iZXIsIHBvc2l0aW9uIDpOdW1iZXIsIHNwZWVkIDpOdW1iZXIpIC0+IHtOdW1iZXJ9YFxuICpcbiAqIFRoZSBgc3luY1Bvc2l0b25gIG1ldGhvZCBoYXMgdG8gYmUgaW1wbGVtZW50ZWQgYnkgYSBgVGltZUVuZ2luZWAgYXMgcGFydCBvZiB0aGVcbiAqIHRyYW5zcG9ydGVkIGludGVyZmFjZS4gVGhlIG1ldGhvZCBzeW5jUG9zaXRvbiBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIG1hc3RlclxuICogb2YgYSB0cmFuc3BvcnRlZCBlbmdpbmUgaGFzIHRvIChyZS0pc3luY2hyb25pemUgdGhlIGVuZ2luZSdzIHBvc2l0aW9uLiBUaGlzXG4gKiBpcyBmb3IgZXhhbXBsZSByZXF1aXJlZCB3aGVuIHRoZSBtYXN0ZXIgKHJlLSlzdGFydHMgcGxheWJhY2ssIGp1bXBzIHRvIGFuXG4gKiBhcmJpdHJhcnkgcG9zaXRpb24sIGFuZCB3aGVuIHJldmVyc2luZyBwbGF5YmFjayBkaXJlY3Rpb24uIFRoZSBtZXRob2QgcmV0dXJuc1xuICogdGhlIG5leHQgcG9zaXRpb24gb2YgdGhlIGVuZ2luZSBpbiB0aGUgZ2l2ZW4gcGxheWJhY2sgZGlyZWN0aW9uXG4gKiAoaS5lLiBgc3BlZWQgPCAwYCBvciBgc3BlZWQgPiAwYCkuXG4gKlxuICogIyMjIyMjIGBhZHZhbmNlUG9zaXRpb24odGltZSA6TnVtYmVyLCBwb3NpdGlvbiA6TnVtYmVyLCBzcGVlZCA6TnVtYmVyKSAtPiB7TnVtYmVyfWBcbiAqXG4gKiBUaGUgYGFkdmFuY2VQb3NpdGlvbmAgbWV0aG9kIGhhcyB0byBiZSBpbXBsZW1lbnRlZCBieSBhIGBUaW1lRW5naW5lYCBhcyBwYXJ0XG4gKiBvZiB0aGUgdHJhbnNwb3J0ZWQgaW50ZXJmYWNlLiBUaGUgbWFzdGVyIGNhbGxzIHRoZSBhZHZhbmNlUG9zaXRvbiBtZXRob2Qgd2hlblxuICogdGhlIGVuZ2luZSdzIGV2ZW50IHBvc2l0aW9uIGlzIHJlYWNoZWQuIFRoZSBtZXRob2QgZ2VuZXJhdGVzIGFuIGV2ZW50IGFuZFxuICogcmV0dXJucyB0aGUgbmV4dCBwb3NpdGlvbiBpbiB0aGUgZ2l2ZW4gcGxheWJhY2sgZGlyZWN0aW9uIChpLmUuIHNwZWVkIDwgMCBvclxuICogc3BlZWQgPiAwKS4gVGhlIHJldHVybmVkIHBvc2l0aW9uIGhhcyB0byBiZSBncmVhdGVyIChpLmUuIHdoZW4gc3BlZWQgPiAwKVxuICogb3IgbGVzcyAoaS5lLiB3aGVuIHNwZWVkIDwgMCkgdGhhbiB0aGUgcG9zaXRpb24gcmVjZWl2ZWQgYXMgYXJndW1lbnQgb2YgdGhlXG4gKiBtZXRob2QuXG4gKlxuICogIyMjIyMjIGByZXNldFBvc2l0aW9uKHBvc2l0aW9uPXVuZGVmaW5lZCA6TnVtYmVyKWBcbiAqXG4gKiBUaGUgcmVzZXRQb3NpdGlvbiBtZXRob2QgaXMgcHJvdmlkZWQgYnkgdGhlIFRpbWVFbmdpbmUgYmFzZSBjbGFzcy4gQW4gZW5naW5lXG4gKiBtYXkgY2FsbCB0aGlzIG1ldGhvZCB0byByZXNldCBpdHMgbmV4dCBldmVudCBwb3NpdGlvbi4gV2hlbiBubyBhcmd1bWVudFxuICogaXMgZ2l2ZW4sIHRoZSB0aW1lIGlzIHJlc2V0IHRvIHRoZSBjdXJyZW50IG1hc3RlciB0aW1lLiBXaGVuIGNhbGxpbmcgdGhlXG4gKiBtZXRob2Qgd2l0aCBJbmZpbml0eSB0aGUgZW5naW5lIGlzIHN1c3BlbmRlZCB3aXRob3V0IGJlaW5nIHJlbW92ZWQgZnJvbVxuICogdGhlIG1hc3Rlci5cbiAqXG4gKlxuICogIyMjIyBUaGUgc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2VcbiAqXG4gKiBUaGUgXCJzcGVlZC1jb250cm9sbGVkXCIgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY3Jvbml6aW5nIGFuIGVuZ2luZSB0aGF0IGlzXG4gKiBuZWl0aGVyIGRyaXZlbiB0aHJvdWdoIHRoZSBzY2hlZHVsZWQgbm9yIHRoZSB0cmFuc3BvcnRlZCBpbnRlcmZhY2UuIFRoZVxuICogaW50ZXJmYWNlIGFsbG93cyBpbiBwYXJ0aWN1bGFyIHRvIHN5bmNocm9uaXplIGVuZ2luZXMgdGhhdCBhc3N1cmUgdGhlaXIgb3duXG4gKiBzY2hlZHVsaW5nIChpLmUuIGF1ZGlvIHBsYXllciBvciBhbiBvc2NpbGxhdG9yKSB0byB0aGUgZXZlbnQtYmFzZWQgc2NoZWR1bGVkXG4gKiBhbmQgdHJhbnNwb3J0ZWQgZW5naW5lcy5cbiAqXG4gKiAjIyMjIyMgYHN5bmNTcGVlZCh0aW1lIDpOdW1iZXIsIHBvc2l0aW9uIDpOdW1iZXIsIHNwZWVkIDpOdW1iZXIsIHNlZWs9ZmFsc2UgOkJvb2xlYW4pYFxuICpcbiAqIFRoZSBzeW5jU3BlZWQgbWV0aG9kIGhhcyB0byBiZSBpbXBsZW1lbnRlZCBieSBhIFRpbWVFbmdpbmUgYXMgcGFydCBvZiB0aGVcbiAqIHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlLiBUaGUgbWV0aG9kIGlzIGNhbGxlZCBieSB0aGUgbWFzdGVyIHdoZW5ldmVyIHRoZVxuICogcGxheWJhY2sgc3BlZWQgY2hhbmdlcyBvciB0aGUgcG9zaXRpb24ganVtcHMgYXJiaXRhcmlseSAoaS5lLiBvbiBhIHNlZWspLlxuICpcbiAqXG4gKiA8aHIgLz5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgYSBgVGltZUVuZ2luZWAgcnVubmluZyBpbiBhIGBTY2hlZHVsZXJgIHRoYXQgY291bnRzIHVwXG4gKiBhdCBhIGdpdmVuIGZyZXF1ZW5jeTpcbiAqIHtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvdGltZS1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICpcbiAqIGNsYXNzIE15RW5naW5lIGV4dGVuZHMgYXVkaW8uVGltZUVuZ2luZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHN1cGVyKCk7XG4gKiAgICAgLy8gLi4uXG4gKiAgIH1cbiAqIH1cbiAqXG4gKi9cbmNsYXNzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgZW5naW5lJ3MgbWFzdGVyLlxuICAgICAqXG4gICAgICogQHR5cGUge01peGVkfVxuICAgICAqIEBuYW1lIG1hc3RlclxuICAgICAqIEBtZW1iZXJvZiBUaW1lRW5naW5lXG4gICAgICovXG4gICAgdGhpcy5tYXN0ZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0aW1lIGVuZ2luZSdzIGN1cnJlbnQgKG1hc3RlcikgdGltZS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgdGltZSBlbmdpbmUncyBjdXJyZW50IChtYXN0ZXIpIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVkIGludGVyZmFjZVxuICAgKiAgIC0gYWR2YW5jZVRpbWUodGltZSksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUsIHJldHVybnMgbmV4dCB0aW1lXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICovXG4gIHN0YXRpYyBpbXBsZW1lbnRzU2NoZWR1bGVkKGVuZ2luZSkge1xuICAgIHJldHVybiAoZW5naW5lLmFkdmFuY2VUaW1lICYmIGVuZ2luZS5hZHZhbmNlVGltZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxuXG4gIHJlc2V0VGltZSh0aW1lID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydGVkIGludGVyZmFjZVxuICAgKiAgIC0gc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byByZXBvc2l0aW9uIFRpbWVFbmdpbmUsIHJldHVybnMgbmV4dCBwb3NpdGlvblxuICAgKiAgIC0gYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUgYW5kIHBvc2l0aW9uLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgKi9cbiAgc3RhdGljIGltcGxlbWVudHNUcmFuc3BvcnRlZChlbmdpbmUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZW5naW5lLnN5bmNQb3NpdGlvbiAmJiBlbmdpbmUuc3luY1Bvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb24gJiZcbiAgICAgIGVuZ2luZS5hZHZhbmNlUG9zaXRpb24gJiYgZW5naW5lLmFkdmFuY2VQb3NpdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uXG4gICAgKTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGVlZC1jb250cm9sbGVkIGludGVyZmFjZVxuICAgKiAgIC0gc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgKSwgY2FsbGVkIHRvXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICovXG4gIHN0YXRpYyBpbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkge1xuICAgIHJldHVybiAoZW5naW5lLnN5bmNTcGVlZCAmJiBlbmdpbmUuc3luY1NwZWVkIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpbWVFbmdpbmU7XG4iXX0=