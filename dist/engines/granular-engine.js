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
 * Granular synthesis TimeEngine implementing the scheduled interface.
 * The grain position (grain onset or center time in the audio buffer) is
 * optionally determined by the engine's currentPosition attribute.
 *
 * Example that shows a `GranularEngine` (with a few parameter controls) driven
 * by a `Scheduler` and a `PlayControl`:
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/granular-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const granularEngine = new audio.GranularEngine();
 *
 * scheduler.add(granularEngine);
 *
 *
 * @param {Object} options={} - Parameters
 * @param {AudioBuffer} [options.buffer=null] - Audio buffer
 * @param {Number} [options.periodAbs=0.01] - Absolute grain period in sec
 * @param {Number} [options.periodRel=0] - Grain period relative to absolute
 *  duration
 * @param {Number} [options.periodVar=0] - Amout of random grain period
 *  variation relative to grain period
 * @param {Number} [options.periodMin=0.001] - Minimum grain period
 * @param {Number} [options.position=0] - Grain position (onset time in audio
 *  buffer) in sec
 * @param {Number} [options.positionVar=0.003] - Amout of random grain position
 *  variation in sec
 * @param {Number} [options.durationAbs=0.1] - Absolute grain duration in sec
 * @param {Number} [options.durationRel=0] - Grain duration relative to grain
 *  period (overlap)
 * @param {Number} [options.attackAbs=0] - Absolute attack time in sec
 * @param {Number} [options.attackRel=0.5] - Attack time relative to grain duration
 * @param {String} [options.attackShape='lin'] - Shape of attack
 * @param {Number} [options.releaseAbs=0] - Absolute release time in sec
 * @param {Number} [options.releaseRel=0.5] - Release time relative to grain duration
 * @param {Number} [options.releaseShape='lin'] - Shape of release
 * @param {String} [options.expRampOffset=0.0001] - Offset (start/end value)
 *  for exponential attack/release
 * @param {Number} [options.resampling=0] - Grain resampling in cent
 * @param {Number} [options.resamplingVar=0] - Amout of random resampling variation in cent
 * @param {Number} [options.gain=1] - Linear gain factor
 * @param {Boolean} [options.centered=true] - Whether the grain position refers
 *  to the center of the grain (or the beginning)
 * @param {Boolean} [options.cyclic=false] - Whether the audio buffer and grain
 *  position are considered as cyclic
 * @param {Number} [options.wrapAroundExtension=0] - Portion at the end of the
 *  audio buffer that has been copied from the beginning to assure cyclic behavior
 */

var GranularEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(GranularEngine, _AudioTimeEngine);

  function GranularEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, GranularEngine);

    /**
     * Audio buffer
     *
     * @type {AudioBuffer}
     * @name buffer
     * @default null
     * @memberof GranularEngine
     * @instance
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (GranularEngine.__proto__ || (0, _getPrototypeOf2.default)(GranularEngine)).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute grain period in sec
     *
     * @type {Number}
     * @name periodAbs
     * @default 0.01
     * @memberof GranularEngine
     * @instance
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0.01);

    /**
     * Grain period relative to absolute duration
     *
     * @type {Number}
     * @name periodRel
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.periodRel = optOrDef(options.periodRel, 0);

    /**
     * Amout of random grain period variation relative to grain period
     *
     * @type {Number}
     * @name periodVar
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Minimum grain period
     *
     * @type {Number}
     * @name periodMin
     * @default 0.001
     * @memberof GranularEngine
     * @instance
     */
    _this.periodMin = optOrDef(options.periodMin, 0.001);

    /**
     * Grain position (onset time in audio buffer) in sec
     *
     * @type {Number}
     * @name position
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.position = optOrDef(options.position, 0);

    /**
     * Amout of random grain position variation in sec
     *
     * @type {Number}
     * @name positionVar
     * @default 0.003
     * @memberof GranularEngine
     * @instance
     */
    _this.positionVar = optOrDef(options.positionVar, 0.003);

    /**
     * Absolute grain duration in sec
     *
     * @type {Number}
     * @name durationAbs
     * @default 0.1
     * @memberof GranularEngine
     * @instance
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0.1); // absolute grain duration

    /**
     * Grain duration relative to grain period (overlap)
     *
     * @type {Number}
     * @name durationRel
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.durationRel = optOrDef(options.durationRel, 0);

    /**
     * Absolute attack time in sec
     *
     * @type {Number}
     * @name attackAbs
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0);

    /**
     * Attack time relative to grain duration
     *
     * @type {Number}
     * @name attackRel
     * @default 0.5
     * @memberof GranularEngine
     * @instance
     */
    _this.attackRel = optOrDef(options.attackRel, 0.5);

    /**
     * Shape of attack ('lin' for linear ramp, 'exp' for exponential ramp)
     *
     * @type {String}
     * @name attackShape
     * @default 'lin'
     * @memberof GranularEngine
     * @instance
     */
    _this.attackShape = optOrDef(options.attackShape, 'lin');

    /**
     * Absolute release time in sec
     *
     * @type {Number}
     * @name releaseAbs
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0);

    /**
     * Release time relative to grain duration
     *
     * @type {Number}
     * @name releaseRel
     * @default 0.5
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0.5);

    /**
     * Shape of release ('lin' for linear ramp, 'exp' for exponential ramp)
     *
     * @type {String}
     * @name releaseShape
     * @default 'lin'
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseShape = optOrDef(options.releaseShape, 'lin');

    /**
     * Offset (start/end value) for exponential attack/release
     *
     * @type {Number}
     * @name expRampOffset
     * @default 0.0001
     * @memberof GranularEngine
     * @instance
     */
    _this.expRampOffset = optOrDef(options.expRampOffset, 0.0001);

    /**
     * Grain resampling in cent
     *
     * @type {Number}
     * @name resampling
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     *
     * @type {Number}
     * @name resamplingVar
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     *
     * @type {Number}
     * @name gain
     * @default 1
     * @memberof GranularEngine
     * @instance
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Whether the grain position refers to the center of the grain (or the beginning)
     *
     * @type {Boolean}
     * @name centered
     * @default true
     * @memberof GranularEngine
     * @instance
     */
    _this.centered = optOrDef(options.centered, true);

    /**
     * Whether the audio buffer and grain position are considered as cyclic
     *
     * @type {Boolean}
     * @name cyclic
     * @default false
     * @memberof GranularEngine
     * @instance
     */
    _this.cyclic = optOrDef(options.cyclic, false);

    /**
     * Portion at the end of the audio buffer that has been copied from the
     * beginning to assure cyclic behavior
     *
     * @type {Number}
     * @name wrapAroundExtension
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   *
   * @type {Number}
   * @name bufferDuration
   * @memberof GranularEngine
   * @instance
   * @readonly
   */


  (0, _createClass3.default)(GranularEngine, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    /**
     * Trigger a grain. This function can be called at any time (whether the
     * engine is scheduled or not) to generate a single grain according to the
     * current grain parameters.
     *
     * @param {Number} time - grain synthesis audio time
     * @return {Number} - period to next grain
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

      return Math.max(this.periodMin, grainPeriod);
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

    /**
     * Current position
     *
     * @type {Number}
     * @name currentPosition
     * @memberof GranularEngine
     * @instance
     * @readonly
     */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdyYW51bGFyLWVuZ2luZS5qcyJdLCJuYW1lcyI6WyJvcHRPckRlZiIsIm9wdCIsImRlZiIsInVuZGVmaW5lZCIsIkdyYW51bGFyRW5naW5lIiwib3B0aW9ucyIsImF1ZGlvQ29udGV4dCIsImJ1ZmZlciIsInBlcmlvZEFicyIsInBlcmlvZFJlbCIsInBlcmlvZFZhciIsInBlcmlvZE1pbiIsInBvc2l0aW9uIiwicG9zaXRpb25WYXIiLCJkdXJhdGlvbkFicyIsImR1cmF0aW9uUmVsIiwiYXR0YWNrQWJzIiwiYXR0YWNrUmVsIiwiYXR0YWNrU2hhcGUiLCJyZWxlYXNlQWJzIiwicmVsZWFzZVJlbCIsInJlbGVhc2VTaGFwZSIsImV4cFJhbXBPZmZzZXQiLCJyZXNhbXBsaW5nIiwicmVzYW1wbGluZ1ZhciIsImdhaW4iLCJjZW50ZXJlZCIsImN5Y2xpYyIsIndyYXBBcm91bmRFeHRlbnNpb24iLCJvdXRwdXROb2RlIiwiY3JlYXRlR2FpbiIsInRpbWUiLCJNYXRoIiwibWF4IiwiY3VycmVudFRpbWUiLCJ0cmlnZ2VyIiwiZ3JhaW5UaW1lIiwiZ3JhaW5QZXJpb2QiLCJncmFpblBvc2l0aW9uIiwiY3VycmVudFBvc2l0aW9uIiwiZ3JhaW5EdXJhdGlvbiIsInJlc2FtcGxpbmdSYXRlIiwicmFuZG9tUmVzYW1wbGluZyIsInJhbmRvbSIsInBvdyIsImJ1ZmZlckR1cmF0aW9uIiwiY3ljbGVzIiwiZmxvb3IiLCJkdXJhdGlvbiIsImVudmVsb3BlIiwiYXR0YWNrIiwicmVsZWFzZSIsImZhY3RvciIsImF0dGFja0VuZFRpbWUiLCJncmFpbkVuZFRpbWUiLCJyZWxlYXNlU3RhcnRUaW1lIiwidmFsdWUiLCJzZXRWYWx1ZUF0VGltZSIsImxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIiwiZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSIsImNvbm5lY3QiLCJzb3VyY2UiLCJjcmVhdGVCdWZmZXJTb3VyY2UiLCJwbGF5YmFja1JhdGUiLCJzdGFydCIsInN0b3AiLCJt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QXNDLEdBQXRDLEVBQTJDSixZQUEzQztBQUNELFdBRkQsTUFFTztBQUNMTCxxQkFBU3hCLElBQVQsQ0FBY2tDLDRCQUFkLENBQTJDLEtBQUtyQyxhQUFoRCxFQUErRGdDLFlBQS9EO0FBQ0Q7O0FBRURMLG1CQUFTVyxPQUFULENBQWlCLEtBQUsvQixVQUF0Qjs7QUFFQTtBQUNBLGNBQUlnQyxTQUFTdkQsYUFBYXdELGtCQUFiLEVBQWI7O0FBRUFELGlCQUFPdEQsTUFBUCxHQUFnQixLQUFLQSxNQUFyQjtBQUNBc0QsaUJBQU9FLFlBQVAsQ0FBb0JQLEtBQXBCLEdBQTRCZixjQUE1QjtBQUNBb0IsaUJBQU9ELE9BQVAsQ0FBZVgsUUFBZjs7QUFFQVksaUJBQU9HLEtBQVAsQ0FBYTVCLFNBQWIsRUFBd0JFLGFBQXhCO0FBQ0F1QixpQkFBT0ksSUFBUCxDQUFZWCxZQUFaO0FBQ0Q7QUFDRjs7QUFFRCxhQUFPdEIsS0FBS0MsR0FBTCxDQUFTLEtBQUt0QixTQUFkLEVBQXlCMEIsV0FBekIsQ0FBUDtBQUNEOzs7d0JBcEpvQjtBQUNuQixVQUFJLEtBQUs5QixNQUFULEVBQWlCO0FBQ2YsWUFBSXNDLGlCQUFpQixLQUFLdEMsTUFBTCxDQUFZeUMsUUFBakM7O0FBRUEsWUFBSSxLQUFLcEIsbUJBQVQsRUFDRWlCLGtCQUFrQixLQUFLakIsbUJBQXZCOztBQUVGLGVBQU9pQixjQUFQO0FBQ0Q7O0FBRUQsYUFBTyxDQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozt3QkFTc0I7QUFDcEIsVUFBSXFCLFNBQVMsS0FBS0EsTUFBbEI7O0FBRUEsVUFBSUEsVUFBVUEsT0FBTzNCLGVBQVAsS0FBMkJwQyxTQUF6QyxFQUNFLE9BQU8rRCxPQUFPM0IsZUFBZDs7QUFFRixhQUFPLEtBQUszQixRQUFaO0FBQ0Q7Ozs7O2tCQTBIWVIsYyIsImZpbGUiOiJncmFudWxhci1lbmdpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZiAob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5cbi8qKlxuICogR3JhbnVsYXIgc3ludGhlc2lzIFRpbWVFbmdpbmUgaW1wbGVtZW50aW5nIHRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlLlxuICogVGhlIGdyYWluIHBvc2l0aW9uIChncmFpbiBvbnNldCBvciBjZW50ZXIgdGltZSBpbiB0aGUgYXVkaW8gYnVmZmVyKSBpc1xuICogb3B0aW9uYWxseSBkZXRlcm1pbmVkIGJ5IHRoZSBlbmdpbmUncyBjdXJyZW50UG9zaXRpb24gYXR0cmlidXRlLlxuICpcbiAqIEV4YW1wbGUgdGhhdCBzaG93cyBhIGBHcmFudWxhckVuZ2luZWAgKHdpdGggYSBmZXcgcGFyYW1ldGVyIGNvbnRyb2xzKSBkcml2ZW5cbiAqIGJ5IGEgYFNjaGVkdWxlcmAgYW5kIGEgYFBsYXlDb250cm9sYDpcbiAqIHtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvZ3JhbnVsYXItZW5naW5lLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3Qgc2NoZWR1bGVyID0gYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG4gKiBjb25zdCBncmFudWxhckVuZ2luZSA9IG5ldyBhdWRpby5HcmFudWxhckVuZ2luZSgpO1xuICpcbiAqIHNjaGVkdWxlci5hZGQoZ3JhbnVsYXJFbmdpbmUpO1xuICpcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucz17fSAtIFBhcmFtZXRlcnNcbiAqIEBwYXJhbSB7QXVkaW9CdWZmZXJ9IFtvcHRpb25zLmJ1ZmZlcj1udWxsXSAtIEF1ZGlvIGJ1ZmZlclxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZEFicz0wLjAxXSAtIEFic29sdXRlIGdyYWluIHBlcmlvZCBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RSZWw9MF0gLSBHcmFpbiBwZXJpb2QgcmVsYXRpdmUgdG8gYWJzb2x1dGVcbiAqICBkdXJhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZFZhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwZXJpb2RcbiAqICB2YXJpYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kTWluPTAuMDAxXSAtIE1pbmltdW0gZ3JhaW4gcGVyaW9kXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucG9zaXRpb249MF0gLSBHcmFpbiBwb3NpdGlvbiAob25zZXQgdGltZSBpbiBhdWRpb1xuICogIGJ1ZmZlcikgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucG9zaXRpb25WYXI9MC4wMDNdIC0gQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBvc2l0aW9uXG4gKiAgdmFyaWF0aW9uIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uQWJzPTAuMV0gLSBBYnNvbHV0ZSBncmFpbiBkdXJhdGlvbiBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvblJlbD0wXSAtIEdyYWluIGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdyYWluXG4gKiAgcGVyaW9kIChvdmVybGFwKVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmF0dGFja0Ficz0wXSAtIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmF0dGFja1JlbD0wLjVdIC0gQXR0YWNrIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5hdHRhY2tTaGFwZT0nbGluJ10gLSBTaGFwZSBvZiBhdHRhY2tcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlQWJzPTBdIC0gQWJzb2x1dGUgcmVsZWFzZSB0aW1lIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnJlbGVhc2VSZWw9MC41XSAtIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnJlbGVhc2VTaGFwZT0nbGluJ10gLSBTaGFwZSBvZiByZWxlYXNlXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZXhwUmFtcE9mZnNldD0wLjAwMDFdIC0gT2Zmc2V0IChzdGFydC9lbmQgdmFsdWUpXG4gKiAgZm9yIGV4cG9uZW50aWFsIGF0dGFjay9yZWxlYXNlXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVzYW1wbGluZz0wXSAtIEdyYWluIHJlc2FtcGxpbmcgaW4gY2VudFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnJlc2FtcGxpbmdWYXI9MF0gLSBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmdhaW49MV0gLSBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY2VudGVyZWQ9dHJ1ZV0gLSBXaGV0aGVyIHRoZSBncmFpbiBwb3NpdGlvbiByZWZlcnNcbiAqICB0byB0aGUgY2VudGVyIG9mIHRoZSBncmFpbiAob3IgdGhlIGJlZ2lubmluZylcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY3ljbGljPWZhbHNlXSAtIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgZ3JhaW5cbiAqICBwb3NpdGlvbiBhcmUgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy53cmFwQXJvdW5kRXh0ZW5zaW9uPTBdIC0gUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZVxuICogIGF1ZGlvIGJ1ZmZlciB0aGF0IGhhcyBiZWVuIGNvcGllZCBmcm9tIHRoZSBiZWdpbm5pbmcgdG8gYXNzdXJlIGN5Y2xpYyBiZWhhdmlvclxuICovXG5jbGFzcyBHcmFudWxhckVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqIEBuYW1lIGJ1ZmZlclxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdE9yRGVmKG9wdGlvbnMuYnVmZmVyLCBudWxsKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIHBlcmlvZCBpbiBzZWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kQWJzXG4gICAgICogQGRlZmF1bHQgMC4wMVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kQWJzID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RBYnMsIDAuMDEpO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcGVyaW9kIHJlbGF0aXZlIHRvIGFic29sdXRlIGR1cmF0aW9uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBlcmlvZFJlbFxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwZXJpb2QgdmFyaWF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZFxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RWYXJcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RWYXIgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIGdyYWluIHBlcmlvZFxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RNaW5cbiAgICAgKiBAZGVmYXVsdCAwLjAwMVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kTWluID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RNaW4sIDAuMDAxKTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBvc2l0aW9uIChvbnNldCB0aW1lIGluIGF1ZGlvIGJ1ZmZlcikgaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBvc2l0aW9uXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb24gPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwb3NpdGlvbiB2YXJpYXRpb24gaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBvc2l0aW9uVmFyXG4gICAgICogQGRlZmF1bHQgMC4wMDNcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvblZhciwgMC4wMDMpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgZ3JhaW4gZHVyYXRpb24gaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGR1cmF0aW9uQWJzXG4gICAgICogQGRlZmF1bHQgMC4xXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFicyA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BYnMsIDAuMSk7IC8vIGFic29sdXRlIGdyYWluIGR1cmF0aW9uXG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBkdXJhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2QgKG92ZXJsYXApXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGR1cmF0aW9uUmVsXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25SZWwgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBhdHRhY2tBYnNcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tBYnMgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja0FicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBhdHRhY2tSZWxcbiAgICAgKiBAZGVmYXVsdCAwLjVcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1JlbCA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrUmVsLCAwLjUpO1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgYXR0YWNrICgnbGluJyBmb3IgbGluZWFyIHJhbXAsICdleHAnIGZvciBleHBvbmVudGlhbCByYW1wKVxuICAgICAqXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAbmFtZSBhdHRhY2tTaGFwZVxuICAgICAqIEBkZWZhdWx0ICdsaW4nXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tTaGFwZSA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrU2hhcGUsICdsaW4nKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcmVsZWFzZUFic1xuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VBYnMgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VBYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHJlbGVhc2VSZWxcbiAgICAgKiBAZGVmYXVsdCAwLjVcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VSZWwgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VSZWwsIDAuNSk7XG5cbiAgICAvKipcbiAgICAgKiBTaGFwZSBvZiByZWxlYXNlICgnbGluJyBmb3IgbGluZWFyIHJhbXAsICdleHAnIGZvciBleHBvbmVudGlhbCByYW1wKVxuICAgICAqXG4gICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgKiBAbmFtZSByZWxlYXNlU2hhcGVcbiAgICAgKiBAZGVmYXVsdCAnbGluJ1xuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVNoYXBlID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlU2hhcGUsICdsaW4nKTtcblxuICAgIC8qKlxuICAgICAqIE9mZnNldCAoc3RhcnQvZW5kIHZhbHVlKSBmb3IgZXhwb25lbnRpYWwgYXR0YWNrL3JlbGVhc2VcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgZXhwUmFtcE9mZnNldFxuICAgICAqIEBkZWZhdWx0IDAuMDAwMVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZXhwUmFtcE9mZnNldCA9IG9wdE9yRGVmKG9wdGlvbnMuZXhwUmFtcE9mZnNldCwgMC4wMDAxKTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHJlc2FtcGxpbmcgaW4gY2VudFxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSByZXNhbXBsaW5nXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSByZXNhbXBsaW5nVmFyXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZ1ZhciA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZ1ZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgZ2FpblxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmdhaW4gPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZ3JhaW4gcG9zaXRpb24gcmVmZXJzIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGdyYWluIChvciB0aGUgYmVnaW5uaW5nKVxuICAgICAqXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQG5hbWUgY2VudGVyZWRcbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5jZW50ZXJlZCA9IG9wdE9yRGVmKG9wdGlvbnMuY2VudGVyZWQsIHRydWUpO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBncmFpbiBwb3NpdGlvbiBhcmUgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBuYW1lIGN5Y2xpY1xuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5jeWNsaWMgPSBvcHRPckRlZihvcHRpb25zLmN5Y2xpYywgZmFsc2UpO1xuXG4gICAgLyoqXG4gICAgICogUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGVcbiAgICAgKiBiZWdpbm5pbmcgdG8gYXNzdXJlIGN5Y2xpYyBiZWhhdmlvclxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSB3cmFwQXJvdW5kRXh0ZW5zaW9uXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbiA9IG9wdE9yRGVmKG9wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbiwgMCk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvbiAoZXhjbHVkaW5nIHdyYXBBcm91bmRFeHRlbnNpb24pXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGJ1ZmZlckR1cmF0aW9uXG4gICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uO1xuXG4gICAgICByZXR1cm4gYnVmZmVyRHVyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogQ3VycmVudCBwb3NpdGlvblxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBjdXJyZW50UG9zaXRpb25cbiAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnRyaWdnZXIodGltZSk7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIGdyYWluLiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlXG4gICAqIGVuZ2luZSBpcyBzY2hlZHVsZWQgb3Igbm90KSB0byBnZW5lcmF0ZSBhIHNpbmdsZSBncmFpbiBhY2NvcmRpbmcgdG8gdGhlXG4gICAqIGN1cnJlbnQgZ3JhaW4gcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBncmFpbiBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gcGVyaW9kIHRvIG5leHQgZ3JhaW5cbiAgICovXG4gIHRyaWdnZXIodGltZSkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgZ3JhaW5UaW1lID0gdGltZSB8fCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgdmFyIGdyYWluUGVyaW9kID0gdGhpcy5wZXJpb2RBYnM7XG4gICAgdmFyIGdyYWluUG9zaXRpb24gPSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgICB2YXIgZ3JhaW5EdXJhdGlvbiA9IHRoaXMuZHVyYXRpb25BYnM7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciByZXNhbXBsaW5nUmF0ZSA9IDEuMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIGdyYWluUGVyaW9kICs9IHRoaXMucGVyaW9kUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgIGdyYWluRHVyYXRpb24gKz0gdGhpcy5kdXJhdGlvblJlbCAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBncmFpbiBwZXJpb2QgcmFuZG9uIHZhcmlhdGlvblxuICAgICAgaWYgKHRoaXMucGVyaW9kVmFyID4gMC4wKVxuICAgICAgICBncmFpblBlcmlvZCArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBlcmlvZFZhciAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBjZW50ZXIgZ3JhaW5cbiAgICAgIGlmICh0aGlzLmNlbnRlcmVkKVxuICAgICAgICBncmFpblBvc2l0aW9uIC09IDAuNSAqIGdyYWluRHVyYXRpb247XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBncmFpbiBwb3NpdGlvblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25WYXIgPiAwKVxuICAgICAgICBncmFpblBvc2l0aW9uICs9ICgyLjAgKiBNYXRoLnJhbmRvbSgpIC0gMSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAvLyB3cmFwIG9yIGNsaXAgZ3JhaW4gcG9zaXRpb24gYW5kIGR1cmF0aW9uIGludG8gYnVmZmVyIGR1cmF0aW9uXG4gICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiA8IDAgfHwgZ3JhaW5Qb3NpdGlvbiA+PSBidWZmZXJEdXJhdGlvbikge1xuICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICB2YXIgY3ljbGVzID0gZ3JhaW5Qb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAoY3ljbGVzIC0gTWF0aC5mbG9vcihjeWNsZXMpKSAqIGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gKyBncmFpbkR1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb24gLSBncmFpblBvc2l0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgZ3JhaW5UaW1lIC09IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uICs9IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpblBvc2l0aW9uID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiBidWZmZXJEdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSBidWZmZXJEdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbWFrZSBncmFpblxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgZ3JhaW5EdXJhdGlvbiA+PSAwLjAwMSkge1xuICAgICAgICAvLyBtYWtlIGdyYWluIGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2UgPSB0aGlzLnJlbGVhc2VBYnMgKyB0aGlzLnJlbGVhc2VSZWwgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gZ3JhaW5EdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBncmFpbkR1cmF0aW9uIC8gKGF0dGFjayArIHJlbGVhc2UpO1xuICAgICAgICAgIGF0dGFjayAqPSBmYWN0b3I7XG4gICAgICAgICAgcmVsZWFzZSAqPSBmYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXR0YWNrRW5kVGltZSA9IGdyYWluVGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIGdyYWluRW5kVGltZSA9IGdyYWluVGltZSArIGdyYWluRHVyYXRpb24gLyByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgdmFyIHJlbGVhc2VTdGFydFRpbWUgPSBncmFpbkVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4udmFsdWUgPSAwO1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFja1NoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBncmFpblRpbWUpO1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5UaW1lKTtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWxlYXNlU3RhcnRUaW1lID4gYXR0YWNrRW5kVGltZSlcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgcmVsZWFzZVN0YXJ0VGltZSk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVsZWFzZVNoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBncmFpbkVuZFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBlbnZlbG9wZS5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChncmFpblRpbWUsIGdyYWluUG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChncmFpbkVuZFRpbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBNYXRoLm1heCh0aGlzLnBlcmlvZE1pbiwgZ3JhaW5QZXJpb2QpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyYW51bGFyRW5naW5lO1xuIl19