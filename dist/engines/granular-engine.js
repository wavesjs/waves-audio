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

var _audioTimeEngine = require('../core/audio-time-engine');

var _audioTimeEngine2 = _interopRequireDefault(_audioTimeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

/**
 * @class GranularEngine
 */

var GranularEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(GranularEngine, _AudioTimeEngine);

  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" interface.
   * The grain position (grain onset or center time in the audio buffer) is optionally
   * determined by the engine's currentPosition attribute.
   */

  function GranularEngine() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, GranularEngine);


    /**
     * Audio buffer
     * @type {AudioBuffer}
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(GranularEngine).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute grain period in sec
     * @type {Number}
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0.01);

    /**
     * Grain period relative to absolute duration
     * @type {Number}
     */
    _this.periodRel = optOrDef(options.periodRel, 0);

    /**
     * Amout of random grain period variation relative to grain period
     * @type {Number}
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Grain position (onset time in audio buffer) in sec
     * @type {Number}
     */
    _this.position = optOrDef(options.position, 0);

    /**
     * Amout of random grain position variation in sec
     * @type {Number}
     */
    _this.positionVar = optOrDef(options.positionVar, 0.003);

    /**
     * Absolute grain duration in sec
     * @type {Number}
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0.1); // absolute grain duration

    /**
     * Grain duration relative to grain period (overlap)
     * @type {Number}
     */
    _this.durationRel = optOrDef(options.durationRel, 0);

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0);

    /**
     * Attack time relative to grain duration
     * @type {Number}
     */
    _this.attackRel = optOrDef(options.attackRel, 0.5);

    /**
     * Shape of attack
     * @type {String} 'lin' for linear ramp, 'exp' for exponential
     */
    _this.attackShape = optOrDef(options.attackShape, 'lin');

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0);

    /**
     * Release time relative to grain duration
     * @type {Number}
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0.5);

    /**
     * Shape of release
     * @type {String} 'lin' for linear ramp, 'exp' for exponential
     */
    _this.releaseShape = optOrDef(options.releaseShape, 'lin');

    /**
     * Offset (start/end value) for exponential attack/release
     * @type {Number} offset
     */
    _this.expRampOffset = optOrDef(options.expRampOffset, 0.0001);

    /**
     * Grain resampling in cent
     * @type {Number}
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @type {Number}
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Whether the grain position refers to the center of the grain (or the beginning)
     * @type {Bool}
     */
    _this.centered = optOrDef(options.centered, true);

    /**
     * Whether the audio buffer and grain position are considered as cyclic
     * @type {Bool}
     */
    _this.cyclic = optOrDef(options.cyclic, false);

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @type {Number}
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   * @return {Number} current buffer duration
   */


  (0, _createClass3.default)(GranularEngine, [{
    key: 'advanceTime',


    // TimeEngine method (scheduled interface)
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    /**
     * Trigger a grain
     * @param {Number} time grain synthesis audio time
     * @return {Number} period to next grain
     *
     * This function can be called at any time (whether the engine is scheduled or not)
     * to generate a single grain according to the current grain parameters.
     */

  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var grainTime = time || audioContext.currentTime;
      var grainPeriod = this.periodAbs;
      var grainPosition = this.currentPosition;
      var grainDuration = this.durationAbs;

      if (this.buffer) {
        var resamplingRate = 1.0;

        // calculate resampling
        if (this.resampling !== 0 || this.resamplingVar > 0) {
          var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
          resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
        }

        grainPeriod += this.periodRel * grainDuration;
        grainDuration += this.durationRel * grainPeriod;

        // grain period randon variation
        if (this.periodVar > 0.0) grainPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

        // center grain
        if (this.centered) grainPosition -= 0.5 * grainDuration;

        // randomize grain position
        if (this.positionVar > 0) grainPosition += (2.0 * Math.random() - 1) * this.positionVar;

        var bufferDuration = this.bufferDuration;

        // wrap or clip grain position and duration into buffer duration
        if (grainPosition < 0 || grainPosition >= bufferDuration) {
          if (this.cyclic) {
            var cycles = grainPosition / bufferDuration;
            grainPosition = (cycles - Math.floor(cycles)) * bufferDuration;

            if (grainPosition + grainDuration > this.buffer.duration) grainDuration = this.buffer.duration - grainPosition;
          } else {
            if (grainPosition < 0) {
              grainTime -= grainPosition;
              grainDuration += grainPosition;
              grainPosition = 0;
            }

            if (grainPosition + grainDuration > bufferDuration) grainDuration = bufferDuration - grainPosition;
          }
        }

        // make grain
        if (this.gain > 0 && grainDuration >= 0.001) {
          // make grain envelope
          var envelope = audioContext.createGain();
          var attack = this.attackAbs + this.attackRel * grainDuration;
          var release = this.releaseAbs + this.releaseRel * grainDuration;

          if (attack + release > grainDuration) {
            var factor = grainDuration / (attack + release);
            attack *= factor;
            release *= factor;
          }

          var attackEndTime = grainTime + attack;
          var grainEndTime = grainTime + grainDuration / resamplingRate;
          var releaseStartTime = grainEndTime - release;

          envelope.gain.value = 0;

          if (this.attackShape === 'lin') {
            envelope.gain.setValueAtTime(0.0, grainTime);
            envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);
          } else {
            envelope.gain.setValueAtTime(this.expRampOffset, grainTime);
            envelope.gain.exponentialRampToValueAtTime(this.gain, attackEndTime);
          }

          if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

          if (this.releaseShape === 'lin') {
            envelope.gain.linearRampToValueAtTime(0.0, grainEndTime);
          } else {
            envelope.gain.exponentialRampToValueAtTime(this.expRampOffset, grainEndTime);
          }

          envelope.connect(this.outputNode);

          // make source
          var source = audioContext.createBufferSource();

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;
          source.connect(envelope);

          source.start(grainTime, grainPosition);
          source.stop(grainEndTime);
        }
      }

      return grainPeriod;
    }
  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

        if (this.wrapAroundExtension) bufferDuration -= this.wrapAroundExtension;

        return bufferDuration;
      }

      return 0;
    }

    // TimeEngine attribute

  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return this.position;
    }
  }]);
  return GranularEngine;
}(_audioTimeEngine2.default);

exports.default = GranularEngine;
//# sourceMappingURL=data:application/json;base64,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QUFwQixHQUE0QixjQUE1QixDQXpDMkM7QUEwQzNDLGlCQUFPLE9BQVAsQ0FBZSxRQUFmLEVBMUMyQzs7QUE0QzNDLGlCQUFPLEtBQVAsQ0FBYSxTQUFiLEVBQXdCLGFBQXhCLEVBNUMyQztBQTZDM0MsaUJBQU8sSUFBUCxDQUFZLFlBQVosRUE3QzJDO1NBQTdDO09BL0NGOztBQWdHQSxhQUFPLFdBQVAsQ0F2R1k7Ozs7d0JBckNPO0FBQ25CLFVBQUksS0FBSyxNQUFMLEVBQWE7QUFDZixZQUFJLGlCQUFpQixLQUFLLE1BQUwsQ0FBWSxRQUFaLENBRE47O0FBR2YsWUFBSSxLQUFLLG1CQUFMLEVBQ0Ysa0JBQWtCLEtBQUssbUJBQUwsQ0FEcEI7O0FBR0EsZUFBTyxjQUFQLENBTmU7T0FBakI7O0FBU0EsYUFBTyxDQUFQLENBVm1COzs7Ozs7O3dCQWNDO0FBQ3BCLFVBQUksU0FBUyxLQUFLLE1BQUwsQ0FETzs7QUFHcEIsVUFBSSxVQUFVLE9BQU8sZUFBUCxLQUEyQixTQUEzQixFQUNaLE9BQU8sT0FBTyxlQUFQLENBRFQ7O0FBR0EsYUFBTyxLQUFLLFFBQUwsQ0FOYTs7O1NBL0pIIiwiZmlsZSI6ImdyYW51bGFyLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZSc7XG5cbmZ1bmN0aW9uIG9wdE9yRGVmKG9wdCwgZGVmKSB7XG4gIGlmIChvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogQGNsYXNzIEdyYW51bGFyRW5naW5lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyYW51bGFyRW5naW5lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge0F1ZGlvQnVmZmVyfSBidWZmZXIgaW5pdGlhbCBhdWRpbyBidWZmZXIgZm9yIGdyYW51bGFyIHN5bnRoZXNpc1xuICAgKlxuICAgKiBUaGUgZW5naW5lIGltcGxlbWVudHMgdGhlIFwic2NoZWR1bGVkXCIgaW50ZXJmYWNlLlxuICAgKiBUaGUgZ3JhaW4gcG9zaXRpb24gKGdyYWluIG9uc2V0IG9yIGNlbnRlciB0aW1lIGluIHRoZSBhdWRpbyBidWZmZXIpIGlzIG9wdGlvbmFsbHlcbiAgICogZGV0ZXJtaW5lZCBieSB0aGUgZW5naW5lJ3MgY3VycmVudFBvc2l0aW9uIGF0dHJpYnV0ZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdE9yRGVmKG9wdGlvbnMuYnVmZmVyLCBudWxsKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIHBlcmlvZCBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kQWJzID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RBYnMsIDAuMDEpO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcGVyaW9kIHJlbGF0aXZlIHRvIGFic29sdXRlIGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwZXJpb2QgdmFyaWF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RWYXIgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBwb3NpdGlvbiAob25zZXQgdGltZSBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb24sIDApO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25WYXIgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uVmFyLCAwLjAwMyk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBkdXJhdGlvbiBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BYnMgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uQWJzLCAwLjEpOyAvLyBhYnNvbHV0ZSBncmFpbiBkdXJhdGlvblxuXG4gICAgLyoqXG4gICAgICogR3JhaW4gZHVyYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kIChvdmVybGFwKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25SZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgYXR0YWNrIHRpbWUgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja0FicyA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1JlbCA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrUmVsLCAwLjUpO1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgYXR0YWNrXG4gICAgICogQHR5cGUge1N0cmluZ30gJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWxcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1NoYXBlID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tTaGFwZSwgJ2xpbicpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgcmVsZWFzZSB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlQWJzID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlUmVsID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlUmVsLCAwLjUpO1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgcmVsZWFzZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9ICdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlU2hhcGUgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VTaGFwZSwgJ2xpbicpO1xuXG4gICAgLyoqXG4gICAgICogT2Zmc2V0IChzdGFydC9lbmQgdmFsdWUpIGZvciBleHBvbmVudGlhbCBhdHRhY2svcmVsZWFzZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9IG9mZnNldFxuICAgICAqL1xuICAgIHRoaXMuZXhwUmFtcE9mZnNldCA9IG9wdE9yRGVmKG9wdGlvbnMuZXhwUmFtcE9mZnNldCwgMC4wMDAxKTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHJlc2FtcGxpbmcgaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmdWYXIgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmdWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTGluZWFyIGdhaW4gZmFjdG9yXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmdhaW4gPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZ3JhaW4gcG9zaXRpb24gcmVmZXJzIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGdyYWluIChvciB0aGUgYmVnaW5uaW5nKVxuICAgICAqIEB0eXBlIHtCb29sfVxuICAgICAqL1xuICAgIHRoaXMuY2VudGVyZWQgPSBvcHRPckRlZihvcHRpb25zLmNlbnRlcmVkLCB0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgZ3JhaW4gcG9zaXRpb24gYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICogQHR5cGUge0Jvb2x9XG4gICAgICovXG4gICAgdGhpcy5jeWNsaWMgPSBvcHRPckRlZihvcHRpb25zLmN5Y2xpYywgZmFsc2UpO1xuXG4gICAgLyoqXG4gICAgICogUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbiA9IG9wdE9yRGVmKG9wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbiwgMCk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvbiAoZXhjbHVkaW5nIHdyYXBBcm91bmRFeHRlbnNpb24pXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBidWZmZXIgZHVyYXRpb25cbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgICAgICBidWZmZXJEdXJhdGlvbiAtPSB0aGlzLndyYXBBcm91bmRFeHRlbnNpb247XG5cbiAgICAgIHJldHVybiBidWZmZXJEdXJhdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgYXR0cmlidXRlXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aW1lID0gTWF0aC5tYXgodGltZSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBncmFpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBncmFpbiBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHBlcmlvZCB0byBuZXh0IGdyYWluXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCBhdCBhbnkgdGltZSAod2hldGhlciB0aGUgZW5naW5lIGlzIHNjaGVkdWxlZCBvciBub3QpXG4gICAqIHRvIGdlbmVyYXRlIGEgc2luZ2xlIGdyYWluIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBncmFpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBncmFpblRpbWUgPSB0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICB2YXIgZ3JhaW5QZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgZ3JhaW5Qb3NpdGlvbiA9IHRoaXMuY3VycmVudFBvc2l0aW9uO1xuICAgIHZhciBncmFpbkR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFicztcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIHJlc2FtcGxpbmdSYXRlID0gMS4wO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzYW1wbGluZ1xuICAgICAgaWYgKHRoaXMucmVzYW1wbGluZyAhPT0gMCB8fCB0aGlzLnJlc2FtcGxpbmdWYXIgPiAwKSB7XG4gICAgICAgIHZhciByYW5kb21SZXNhbXBsaW5nID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMi4wICogdGhpcy5yZXNhbXBsaW5nVmFyO1xuICAgICAgICByZXNhbXBsaW5nUmF0ZSA9IE1hdGgucG93KDIuMCwgKHRoaXMucmVzYW1wbGluZyArIHJhbmRvbVJlc2FtcGxpbmcpIC8gMTIwMC4wKTtcbiAgICAgIH1cblxuICAgICAgZ3JhaW5QZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBncmFpbkR1cmF0aW9uO1xuICAgICAgZ3JhaW5EdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uUmVsICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGdyYWluIHBlcmlvZCByYW5kb24gdmFyaWF0aW9uXG4gICAgICBpZiAodGhpcy5wZXJpb2RWYXIgPiAwLjApXG4gICAgICAgIGdyYWluUGVyaW9kICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucGVyaW9kVmFyICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGNlbnRlciBncmFpblxuICAgICAgaWYgKHRoaXMuY2VudGVyZWQpXG4gICAgICAgIGdyYWluUG9zaXRpb24gLT0gMC41ICogZ3JhaW5EdXJhdGlvbjtcblxuICAgICAgLy8gcmFuZG9taXplIGdyYWluIHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIGdyYWluUG9zaXRpb24gKz0gKDIuMCAqIE1hdGgucmFuZG9tKCkgLSAxKSAqIHRoaXMucG9zaXRpb25WYXI7XG5cbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIC8vIHdyYXAgb3IgY2xpcCBncmFpbiBwb3NpdGlvbiBhbmQgZHVyYXRpb24gaW50byBidWZmZXIgZHVyYXRpb25cbiAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCB8fCBncmFpblBvc2l0aW9uID49IGJ1ZmZlckR1cmF0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgICAgIHZhciBjeWNsZXMgPSBncmFpblBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgZ3JhaW5Qb3NpdGlvbiA9IChjeWNsZXMgLSBNYXRoLmZsb29yKGN5Y2xlcykpICogYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiB0aGlzLmJ1ZmZlci5kdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICBncmFpblRpbWUgLT0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gKz0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uICsgZ3JhaW5EdXJhdGlvbiA+IGJ1ZmZlckR1cmF0aW9uKVxuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiA9IGJ1ZmZlckR1cmF0aW9uIC0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBtYWtlIGdyYWluXG4gICAgICBpZiAodGhpcy5nYWluID4gMCAmJiBncmFpbkR1cmF0aW9uID49IDAuMDAxKSB7XG4gICAgICAgIC8vIG1ha2UgZ3JhaW4gZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdmFyIGF0dGFjayA9IHRoaXMuYXR0YWNrQWJzICsgdGhpcy5hdHRhY2tSZWwgKiBncmFpbkR1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZSA9IHRoaXMucmVsZWFzZUFicyArIHRoaXMucmVsZWFzZVJlbCAqIGdyYWluRHVyYXRpb247XG5cbiAgICAgICAgaWYgKGF0dGFjayArIHJlbGVhc2UgPiBncmFpbkR1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIGZhY3RvciA9IGdyYWluRHVyYXRpb24gLyAoYXR0YWNrICsgcmVsZWFzZSk7XG4gICAgICAgICAgYXR0YWNrICo9IGZhY3RvcjtcbiAgICAgICAgICByZWxlYXNlICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdHRhY2tFbmRUaW1lID0gZ3JhaW5UaW1lICsgYXR0YWNrO1xuICAgICAgICB2YXIgZ3JhaW5FbmRUaW1lID0gZ3JhaW5UaW1lICsgZ3JhaW5EdXJhdGlvbiAvIHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICB2YXIgcmVsZWFzZVN0YXJ0VGltZSA9IGdyYWluRW5kVGltZSAtIHJlbGVhc2U7XG5cbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi52YWx1ZSA9IDA7XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNrU2hhcGUgPT09ICdsaW4nKSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjAsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmdhaW4sIGF0dGFja0VuZFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5leHBSYW1wT2Zmc2V0LCBncmFpblRpbWUpO1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmdhaW4sIGF0dGFja0VuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5nYWluLCByZWxlYXNlU3RhcnRUaW1lKTtcblxuICAgICAgICBpZiAodGhpcy5yZWxlYXNlU2hhcGUgPT09ICdsaW4nKSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIGdyYWluRW5kVGltZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVudmVsb3BlLmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgICAgICAvLyBtYWtlIHNvdXJjZVxuICAgICAgICB2YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChlbnZlbG9wZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KGdyYWluVGltZSwgZ3JhaW5Qb3NpdGlvbik7XG4gICAgICAgIHNvdXJjZS5zdG9wKGdyYWluRW5kVGltZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyYWluUGVyaW9kO1xuICB9XG59XG4iXX0=