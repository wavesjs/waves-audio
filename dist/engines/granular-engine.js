"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");

/**
 * @class GranularEngine
 */

var GranularEngine = (function (TimeEngine) {
  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" interface.
   * The grain position (grain onset or center time in the audio buffer) is optionally
   * determined by the engine's currentPosition attribute.
   */

  function GranularEngine(audioContext) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _babelHelpers.classCallCheck(this, GranularEngine);

    _babelHelpers.get(_core.Object.getPrototypeOf(GranularEngine.prototype), "constructor", this).call(this, audioContext);

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = options.buffer || null;

    /**
     * Absolute grain period in sec
     * @type {Number}
     */
    this.periodAbs = options.periodAbs || 0.01;

    /**
     * Grain period relative to absolute duration
     * @type {Number}
     */
    this.periodRel = options.periodRel || 0;

    /**
     * Amout of random grain period variation relative to grain period
     * @type {Number}
     */
    this.periodVar = options.periodVar || 0;

    /**
     * Grain position (onset time in audio buffer) in sec
     * @type {Number}
     */
    this.position = options.position || 0;

    /**
     * Amout of random grain position variation in sec
     * @type {Number}
     */
    this.positionVar = options.positionVar || 0.003;

    /**
     * Absolute grain duration in sec
     * @type {Number}
     */
    this.durationAbs = options.durationAbs || 0.1; // absolute grain duration

    /**
     * Grain duration relative to grain period (overlap)
     * @type {Number}
     */
    this.durationRel = options.durationRel || 0;

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    this.attackAbs = options.attackAbs || 0;

    /**
     * Attack time relative to grain duration
     * @type {Number}
     */
    this.attackRel = options.attackRel || 0.5;

    /**
     * Shape of attack
     * @type {String} 'lin' for linear ramp, 'exp' for exponential
     */
    this.attackShape = options.attackShape || "lin";

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    this.releaseAbs = options.releaseAbs || 0;

    /**
     * Release time relative to grain duration
     * @type {Number}
     */
    this.releaseRel = options.releaseRel || 0.5;

    /**
     * Shape of release
     * @type {String} 'lin' for linear ramp, 'exp' for exponential
     */
    this.releaseShape = options.releaseShape || "lin";

    /**
     * Offset (start/end value) for exponential attack/release
     * @type {Number} offset
     */
    this.expRampOffset = options.expRampOffset || 0.0001;

    /**
     * Grain resampling in cent
     * @type {Number}
     */
    this.resampling = options.resampling || 0;

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    this.resamplingVar = options.resamplingVar || 0;

    /**
     * Whether the grain position refers to the center of the grain (or the beginning)
     * @type {Bool}
     */
    this.centered = options.centered || true;

    /**
     * Whether the audio buffer and grain position are considered as cyclic
     * @type {Bool}
     */
    this.cyclic = options.cyclic || false;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = options.gain || 1;

    this.outputNode = this.__gainNode;
  }

  _babelHelpers.inherits(GranularEngine, TimeEngine);

  _babelHelpers.prototypeProperties(GranularEngine, null, {
    bufferDuration: {
      get: function () {
        var bufferDuration = this.buffer.duration;

        if (this.buffer.wrapAroundExtention) bufferDuration -= this.buffer.wrapAroundExtention;

        return bufferDuration;
      },
      configurable: true
    },
    currentPosition: {

      // TimeEngine attribute

      get: function () {
        return this.position;
      },
      configurable: true
    },
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        return time + this.trigger(time);
      },
      writable: true,
      configurable: true
    },
    playbackLength: {
      get: function () {
        return this.bufferDuration;
      },
      configurable: true
    },
    gain: {

      /**
       * Set gain
       * @param {Number} value linear gain factor
       */

      set: function (value) {
        this.__gainNode.gain.value = value;
      },

      /**
       * Get gain
       * @return {Number} current gain
       */
      get: function () {
        return this.__gainNode.gain.value;
      },
      configurable: true
    },
    trigger: {

      /**
       * Trigger a grain
       * @param {Number} time grain synthesis audio time
       * @return {Number} period to next grain
       *
       * This function can be called at any time (whether the engine is scheduled or not)
       * to generate a single grain according to the current grain parameters.
       */

      value: function trigger(time) {
        var outputNode = arguments[1] === undefined ? this.outputNode : arguments[1];

        var audioContext = this.audioContext;
        var grainTime = time || audioContext.currentTime;
        var grainPeriod = this.periodAbs;
        var grainPosition = this.currentPosition;
        var grainDuration = this.durationAbs;

        if (this.buffer) {
          var resamplingRate = 1;

          // calculate resampling
          if (this.resampling !== 0 || this.resamplingVar > 0) {
            var randomResampling = (Math.random() - 0.5) * 2 * this.resamplingVar;
            resamplingRate = Math.pow(2, (this.resampling + randomResampling) / 1200);
          }

          grainPeriod += this.periodRel * grainDuration;
          grainDuration += this.durationRel * grainPeriod;

          // grain period randon variation
          if (this.periodVar > 0) grainPeriod += 2 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

          // center grain
          if (this.centered) grainPosition -= 0.5 * grainDuration;

          // randomize grain position
          if (this.positionVar > 0) grainPosition += (2 * Math.random() - 1) * this.positionVar;

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
            var envelopeNode = audioContext.createGain();
            var attack = this.attackAbs + this.attackRel * grainDuration;
            var release = this.releaseAbs + this.releaseRel * grainDuration;

            if (attack + release > grainDuration) {
              var factor = grainDuration / (attack + release);
              attack *= factor;
              release *= factor;
            }

            var attackEndTime = grainTime + attack;
            var grainEndTime = grainTime + grainDuration;
            var releaseStartTime = grainEndTime - release;

            if (this.attackShape === "lin") {
              envelopeNode.gain.setValueAtTime(0, grainTime);
              envelopeNode.gain.linearRampToValueAtTime(1, attackEndTime);
            } else {
              envelopeNode.gain.setValueAtTime(this.expRampOffset, grainTime);
              envelopeNode.gain.exponentialRampToValueAtTime(1, attackEndTime);
            }

            if (releaseStartTime > attackEndTime) envelopeNode.gain.setValueAtTime(1, releaseStartTime);

            if (this.releaseShape === "lin") {
              envelopeNode.gain.linearRampToValueAtTime(0, grainEndTime);
            } else {
              envelopeNode.gain.exponentialRampToValueAtTime(this.expRampOffset, grainEndTime);
            }

            envelopeNode.connect(outputNode);

            // make source
            var source = audioContext.createBufferSource();

            source.buffer = this.buffer;
            source.playbackRate.value = resamplingRate;
            source.connect(envelopeNode);

            source.start(grainTime, grainPosition);
            source.stop(grainTime + grainDuration / resamplingRate);
          }
        }

        return grainPeriod;
      },
      writable: true,
      configurable: true
    }
  });

  return GranularEngine;
})(TimeEngine);

module.exports = GranularEngine;
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio granular synthesis engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Ozs7OztJQUsxQyxjQUFjLGNBQVMsVUFBVTs7Ozs7Ozs7OztBQVMxQixXQVRQLGNBQWMsQ0FTTixZQUFZO1FBQUMsT0FBTyxnQ0FBRyxFQUFFOzt1Q0FUakMsY0FBYzs7QUFVaEIsa0RBVkUsY0FBYyw2Q0FVVixZQUFZLEVBQUU7Ozs7OztBQU1wQixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDOzs7Ozs7QUFNckMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQzs7Ozs7O0FBTTNDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU14QyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNeEMsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTXRDLFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7Ozs7OztBQU1oRCxRQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDOzs7Ozs7QUFNOUMsUUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTTVDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU14QyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDOzs7Ozs7QUFNMUMsUUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTWhELFFBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU0xQyxRQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDOzs7Ozs7QUFNNUMsUUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTWxELFFBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsSUFBSSxNQUFNLENBQUM7Ozs7OztBQU1yRCxRQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNMUMsUUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTWhELFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7Ozs7OztBQU16QyxRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDOztBQUV0QyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDakQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDOztBQUUvQyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7R0FDbkM7O3lCQWxJRyxjQUFjLEVBQVMsVUFBVTs7b0NBQWpDLGNBQWM7QUFvSWQsa0JBQWM7V0FBQSxZQUFHO0FBQ25CLFlBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDOztBQUUxQyxZQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQ2pDLGNBQWMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDOztBQUVwRCxlQUFPLGNBQWMsQ0FBQztPQUN2Qjs7O0FBR0csbUJBQWU7Ozs7V0FBQSxZQUFHO0FBQ3BCLGVBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztPQUN0Qjs7O0FBR0QsZUFBVzs7OzthQUFBLHFCQUFDLElBQUksRUFBRTtBQUNoQixlQUFPLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2xDOzs7O0FBRUcsa0JBQWM7V0FBQSxZQUFHO0FBQ25CLGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztPQUM1Qjs7O0FBY0csUUFBSTs7Ozs7OztXQVJBLFVBQUMsS0FBSyxFQUFFO0FBQ2QsWUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztPQUNwQzs7Ozs7O1dBTU8sWUFBRztBQUNULGVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO09BQ25DOzs7QUFVRCxXQUFPOzs7Ozs7Ozs7OzthQUFBLGlCQUFDLElBQUksRUFBZ0M7WUFBOUIsVUFBVSxnQ0FBRyxJQUFJLENBQUMsVUFBVTs7QUFDeEMsWUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztBQUNyQyxZQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksWUFBWSxDQUFDLFdBQVcsQ0FBQztBQUNqRCxZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ2pDLFlBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7QUFDekMsWUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzs7QUFFckMsWUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2YsY0FBSSxjQUFjLEdBQUcsQ0FBRyxDQUFDOzs7QUFHekIsY0FBSSxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRTtBQUNuRCxnQkFBSSxnQkFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUEsR0FBSSxDQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUN4RSwwQkFBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQSxHQUFJLElBQU0sQ0FBQyxDQUFDO1dBQy9FOztBQUVELHFCQUFXLElBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUM7QUFDOUMsdUJBQWEsSUFBSSxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs7O0FBR2hELGNBQUksSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFHLEVBQ3RCLFdBQVcsSUFBSSxDQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQSxBQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7OztBQUc1RSxjQUFJLElBQUksQ0FBQyxRQUFRLEVBQ2YsYUFBYSxJQUFJLEdBQUcsR0FBRyxhQUFhLENBQUM7OztBQUd2QyxjQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUN0QixhQUFhLElBQUksQ0FBQyxDQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQSxHQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7O0FBRWhFLGNBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7OztBQUd6QyxjQUFJLGFBQWEsR0FBRyxDQUFDLElBQUksYUFBYSxJQUFJLGNBQWMsRUFBRTtBQUN4RCxnQkFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2Ysa0JBQUksTUFBTSxHQUFHLGFBQWEsR0FBRyxjQUFjLENBQUM7QUFDNUMsMkJBQWEsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBLEdBQUksY0FBYyxDQUFDOztBQUUvRCxrQkFBSSxhQUFhLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUN0RCxhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsYUFBYSxDQUFDO2FBQ3hELE1BQU07QUFDTCxrQkFBSSxhQUFhLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLHlCQUFTLElBQUksYUFBYSxDQUFDO0FBQzNCLDZCQUFhLElBQUksYUFBYSxDQUFDO0FBQy9CLDZCQUFhLEdBQUcsQ0FBQyxDQUFDO2VBQ25COztBQUVELGtCQUFJLGFBQWEsR0FBRyxhQUFhLEdBQUcsY0FBYyxFQUNoRCxhQUFhLEdBQUcsY0FBYyxHQUFHLGFBQWEsQ0FBQzthQUNsRDtXQUNGOzs7QUFHRCxjQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLGFBQWEsSUFBSSxLQUFLLEVBQUU7O0FBRTNDLGdCQUFJLFlBQVksR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDN0MsZ0JBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUM7QUFDN0QsZ0JBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7O0FBRWhFLGdCQUFJLE1BQU0sR0FBRyxPQUFPLEdBQUcsYUFBYSxFQUFFO0FBQ3BDLGtCQUFJLE1BQU0sR0FBRyxhQUFhLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQSxBQUFDLENBQUM7QUFDaEQsb0JBQU0sSUFBSSxNQUFNLENBQUM7QUFDakIscUJBQU8sSUFBSSxNQUFNLENBQUM7YUFDbkI7O0FBRUQsZ0JBQUksYUFBYSxHQUFHLFNBQVMsR0FBRyxNQUFNLENBQUM7QUFDdkMsZ0JBQUksWUFBWSxHQUFHLFNBQVMsR0FBRyxhQUFhLENBQUM7QUFDN0MsZ0JBQUksZ0JBQWdCLEdBQUcsWUFBWSxHQUFHLE9BQU8sQ0FBQzs7QUFFOUMsZ0JBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLEVBQUU7QUFDOUIsMEJBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNqRCwwQkFBWSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7YUFDL0QsTUFBTTtBQUNMLDBCQUFZLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ2hFLDBCQUFZLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQzthQUNwRTs7QUFFRCxnQkFBSSxnQkFBZ0IsR0FBRyxhQUFhLEVBQ2xDLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOztBQUUxRCxnQkFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLEtBQUssRUFBRTtBQUMvQiwwQkFBWSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDOUQsTUFBTTtBQUNMLDBCQUFZLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDbEY7O0FBRUQsd0JBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7OztBQUdqQyxnQkFBSSxNQUFNLEdBQUcsWUFBWSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O0FBRS9DLGtCQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDNUIsa0JBQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQztBQUMzQyxrQkFBTSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFN0Isa0JBQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLGtCQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxhQUFhLEdBQUcsY0FBYyxDQUFDLENBQUM7V0FDekQ7U0FDRjs7QUFFRCxlQUFPLFdBQVcsQ0FBQztPQUNwQjs7Ozs7O1NBelJHLGNBQWM7R0FBUyxVQUFVOztBQTRSdkMsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoic3JjL3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBhdWRpbyBncmFudWxhciBzeW50aGVzaXMgZW5naW5lXG4gKiBAYXV0aG9yIE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mciwgVmljdG9yLlNhaXpAaXJjYW0uZnIsIEthcmltLkJhcmthdGlAaXJjYW0uZnJcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG5cbi8qKlxuICogQGNsYXNzIEdyYW51bGFyRW5naW5lXG4gKi9cbmNsYXNzIEdyYW51bGFyRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gYnVmZmVyIGluaXRpYWwgYXVkaW8gYnVmZmVyIGZvciBncmFudWxhciBzeW50aGVzaXNcbiAgICpcbiAgICogVGhlIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBcInNjaGVkdWxlZFwiIGludGVyZmFjZS5cbiAgICogVGhlIGdyYWluIHBvc2l0aW9uIChncmFpbiBvbnNldCBvciBjZW50ZXIgdGltZSBpbiB0aGUgYXVkaW8gYnVmZmVyKSBpcyBvcHRpb25hbGx5XG4gICAqIGRldGVybWluZWQgYnkgdGhlIGVuZ2luZSdzIGN1cnJlbnRQb3NpdGlvbiBhdHRyaWJ1dGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhdWRpb0NvbnRleHQsb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdGlvbnMuYnVmZmVyIHx8IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBwZXJpb2QgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdGlvbnMucGVyaW9kQWJzIHx8IDAuMDE7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBwZXJpb2QgcmVsYXRpdmUgdG8gYWJzb2x1dGUgZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kUmVsID0gb3B0aW9ucy5wZXJpb2RSZWwgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwZXJpb2QgdmFyaWF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RWYXIgPSBvcHRpb25zLnBlcmlvZFZhciB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcG9zaXRpb24gKG9uc2V0IHRpbWUgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb24gPSBvcHRpb25zLnBvc2l0aW9uIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvblZhciA9IG9wdGlvbnMucG9zaXRpb25WYXIgfHwgMC4wMDM7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBkdXJhdGlvbiBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BYnMgPSBvcHRpb25zLmR1cmF0aW9uQWJzIHx8IDAuMTsgLy8gYWJzb2x1dGUgZ3JhaW4gZHVyYXRpb25cblxuICAgIC8qKlxuICAgICAqIEdyYWluIGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZCAob3ZlcmxhcClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25SZWwgPSBvcHRpb25zLmR1cmF0aW9uUmVsIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrQWJzID0gb3B0aW9ucy5hdHRhY2tBYnMgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1JlbCA9IG9wdGlvbnMuYXR0YWNrUmVsIHx8IDAuNTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIGF0dGFja1xuICAgICAqIEB0eXBlIHtTdHJpbmd9ICdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsXG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tTaGFwZSA9IG9wdGlvbnMuYXR0YWNrU2hhcGUgfHwgJ2xpbic7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VBYnMgPSBvcHRpb25zLnJlbGVhc2VBYnMgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlUmVsID0gb3B0aW9ucy5yZWxlYXNlUmVsIHx8IDAuNTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIHJlbGVhc2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfSAnbGluJyBmb3IgbGluZWFyIHJhbXAsICdleHAnIGZvciBleHBvbmVudGlhbFxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVNoYXBlID0gb3B0aW9ucy5yZWxlYXNlU2hhcGUgfHwgJ2xpbic7XG5cbiAgICAvKipcbiAgICAgKiBPZmZzZXQgKHN0YXJ0L2VuZCB2YWx1ZSkgZm9yIGV4cG9uZW50aWFsIGF0dGFjay9yZWxlYXNlXG4gICAgICogQHR5cGUge051bWJlcn0gb2Zmc2V0XG4gICAgICovXG4gICAgdGhpcy5leHBSYW1wT2Zmc2V0ID0gb3B0aW9ucy5leHBSYW1wT2Zmc2V0IHx8IDAuMDAwMTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHJlc2FtcGxpbmcgaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nID0gb3B0aW9ucy5yZXNhbXBsaW5nIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0aW9ucy5yZXNhbXBsaW5nVmFyIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBncmFpbiBwb3NpdGlvbiByZWZlcnMgdG8gdGhlIGNlbnRlciBvZiB0aGUgZ3JhaW4gKG9yIHRoZSBiZWdpbm5pbmcpXG4gICAgICogQHR5cGUge0Jvb2x9XG4gICAgICovXG4gICAgdGhpcy5jZW50ZXJlZCA9IG9wdGlvbnMuY2VudGVyZWQgfHwgdHJ1ZTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgZ3JhaW4gcG9zaXRpb24gYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICogQHR5cGUge0Jvb2x9XG4gICAgICovXG4gICAgdGhpcy5jeWNsaWMgPSBvcHRpb25zLmN5Y2xpYyB8fCBmYWxzZTtcblxuICAgIHRoaXMuX19nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdGlvbnMuZ2FpbiB8fCAxO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyLndyYXBBcm91bmRFeHRlbnRpb24pXG4gICAgICBidWZmZXJEdXJhdGlvbiAtPSB0aGlzLmJ1ZmZlci53cmFwQXJvdW5kRXh0ZW50aW9uO1xuXG4gICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBhdHRyaWJ1dGVcbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnRyaWdnZXIodGltZSk7XG4gIH1cblxuICBnZXQgcGxheWJhY2tMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyRHVyYXRpb247XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIGdyYWluXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIGdyYWluIHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gcGVyaW9kIHRvIG5leHQgZ3JhaW5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGF0IGFueSB0aW1lICh3aGV0aGVyIHRoZSBlbmdpbmUgaXMgc2NoZWR1bGVkIG9yIG5vdClcbiAgICogdG8gZ2VuZXJhdGUgYSBzaW5nbGUgZ3JhaW4gYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGdyYWluIHBhcmFtZXRlcnMuXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUsIG91dHB1dE5vZGUgPSB0aGlzLm91dHB1dE5vZGUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGdyYWluVGltZSA9IHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIHZhciBncmFpblBlcmlvZCA9IHRoaXMucGVyaW9kQWJzO1xuICAgIHZhciBncmFpblBvc2l0aW9uID0gdGhpcy5jdXJyZW50UG9zaXRpb247XG4gICAgdmFyIGdyYWluRHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSByZXNhbXBsaW5nXG4gICAgICBpZiAodGhpcy5yZXNhbXBsaW5nICE9PSAwIHx8IHRoaXMucmVzYW1wbGluZ1ZhciA+IDApIHtcbiAgICAgICAgdmFyIHJhbmRvbVJlc2FtcGxpbmcgPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAyLjAgKiB0aGlzLnJlc2FtcGxpbmdWYXI7XG4gICAgICAgIHJlc2FtcGxpbmdSYXRlID0gTWF0aC5wb3coMi4wLCAodGhpcy5yZXNhbXBsaW5nICsgcmFuZG9tUmVzYW1wbGluZykgLyAxMjAwLjApO1xuICAgICAgfVxuXG4gICAgICBncmFpblBlcmlvZCArPSB0aGlzLnBlcmlvZFJlbCAqIGdyYWluRHVyYXRpb247XG4gICAgICBncmFpbkR1cmF0aW9uICs9IHRoaXMuZHVyYXRpb25SZWwgKiBncmFpblBlcmlvZDtcblxuICAgICAgLy8gZ3JhaW4gcGVyaW9kIHJhbmRvbiB2YXJpYXRpb25cbiAgICAgIGlmICh0aGlzLnBlcmlvZFZhciA+IDAuMClcbiAgICAgICAgZ3JhaW5QZXJpb2QgKz0gMi4wICogKE1hdGgucmFuZG9tKCkgLSAwLjUpICogdGhpcy5wZXJpb2RWYXIgKiBncmFpblBlcmlvZDtcblxuICAgICAgLy8gY2VudGVyIGdyYWluXG4gICAgICBpZiAodGhpcy5jZW50ZXJlZClcbiAgICAgICAgZ3JhaW5Qb3NpdGlvbiAtPSAwLjUgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAvLyByYW5kb21pemUgZ3JhaW4gcG9zaXRpb25cbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uVmFyID4gMClcbiAgICAgICAgZ3JhaW5Qb3NpdGlvbiArPSAoMi4wICogTWF0aC5yYW5kb20oKSAtIDEpICogdGhpcy5wb3NpdGlvblZhcjtcblxuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgLy8gd3JhcCBvciBjbGlwIGdyYWluIHBvc2l0aW9uIGFuZCBkdXJhdGlvbiBpbnRvIGJ1ZmZlciBkdXJhdGlvblxuICAgICAgaWYgKGdyYWluUG9zaXRpb24gPCAwIHx8IGdyYWluUG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICAgICAgdmFyIGN5Y2xlcyA9IGdyYWluUG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgICBncmFpblBvc2l0aW9uID0gKGN5Y2xlcyAtIE1hdGguZmxvb3IoY3ljbGVzKSkgKiBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uICsgZ3JhaW5EdXJhdGlvbiA+IHRoaXMuYnVmZmVyLmR1cmF0aW9uKVxuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgIGdyYWluVGltZSAtPSBncmFpblBvc2l0aW9uO1xuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiArPSBncmFpblBvc2l0aW9uO1xuICAgICAgICAgICAgZ3JhaW5Qb3NpdGlvbiA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gKyBncmFpbkR1cmF0aW9uID4gYnVmZmVyRHVyYXRpb24pXG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uID0gYnVmZmVyRHVyYXRpb24gLSBncmFpblBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1ha2UgZ3JhaW5cbiAgICAgIGlmICh0aGlzLmdhaW4gPiAwICYmIGdyYWluRHVyYXRpb24gPj0gMC4wMDEpIHtcbiAgICAgICAgLy8gbWFrZSBncmFpbiBlbnZlbG9wZVxuICAgICAgICB2YXIgZW52ZWxvcGVOb2RlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdmFyIGF0dGFjayA9IHRoaXMuYXR0YWNrQWJzICsgdGhpcy5hdHRhY2tSZWwgKiBncmFpbkR1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZSA9IHRoaXMucmVsZWFzZUFicyArIHRoaXMucmVsZWFzZVJlbCAqIGdyYWluRHVyYXRpb247XG5cbiAgICAgICAgaWYgKGF0dGFjayArIHJlbGVhc2UgPiBncmFpbkR1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIGZhY3RvciA9IGdyYWluRHVyYXRpb24gLyAoYXR0YWNrICsgcmVsZWFzZSk7XG4gICAgICAgICAgYXR0YWNrICo9IGZhY3RvcjtcbiAgICAgICAgICByZWxlYXNlICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdHRhY2tFbmRUaW1lID0gZ3JhaW5UaW1lICsgYXR0YWNrO1xuICAgICAgICB2YXIgZ3JhaW5FbmRUaW1lID0gZ3JhaW5UaW1lICsgZ3JhaW5EdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2VTdGFydFRpbWUgPSBncmFpbkVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFja1NoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuMCwgZ3JhaW5UaW1lKTtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIGF0dGFja0VuZFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5UaW1lKTtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKDEuMCwgYXR0YWNrRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVsZWFzZVN0YXJ0VGltZSA+IGF0dGFja0VuZFRpbWUpXG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMS4wLCByZWxlYXNlU3RhcnRUaW1lKTtcblxuICAgICAgICBpZiAodGhpcy5yZWxlYXNlU2hhcGUgPT09ICdsaW4nKSB7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBncmFpbkVuZFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5leHBSYW1wT2Zmc2V0LCBncmFpbkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZW52ZWxvcGVOb2RlLmNvbm5lY3Qob3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGVOb2RlKTtcblxuICAgICAgICBzb3VyY2Uuc3RhcnQoZ3JhaW5UaW1lLCBncmFpblBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3AoZ3JhaW5UaW1lICsgZ3JhaW5EdXJhdGlvbiAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZ3JhaW5QZXJpb2Q7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHcmFudWxhckVuZ2luZTsiXX0=