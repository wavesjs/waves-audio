"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");

/**
 * @class GranularEngine
 */

var GranularEngine = (function (_TimeEngine) {
  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" interface.
   * The grain position (grain onset or center time in the audio buffer) is optionally
   * determined by the engine's currentPosition attribute.
   */

  function GranularEngine() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, GranularEngine);

    _get(_core.Object.getPrototypeOf(GranularEngine.prototype), "constructor", this).call(this, options.audioContext);

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

  _inherits(GranularEngine, _TimeEngine);

  _createClass(GranularEngine, {
    bufferDuration: {
      get: function () {
        var bufferDuration = this.buffer.duration;

        if (this.buffer.wrapAroundExtention) bufferDuration -= this.buffer.wrapAroundExtention;

        return bufferDuration;
      }
    },
    currentPosition: {

      // TimeEngine attribute

      get: function () {
        return this.position;
      }
    },
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        return time + this.trigger(time);
      }
    },
    playbackLength: {
      get: function () {
        return this.bufferDuration;
      }
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
      }
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
      }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7Ozs7O0lBSzFDLGNBQWM7Ozs7Ozs7Ozs7QUFTUCxXQVRQLGNBQWMsR0FTUTtRQUFkLE9BQU8sZ0NBQUcsRUFBRTs7MEJBVHBCLGNBQWM7O0FBVWhCLHFDQVZFLGNBQWMsNkNBVVYsT0FBTyxDQUFDLFlBQVksRUFBRTs7Ozs7O0FBTTVCLFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7Ozs7OztBQU1yQyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDOzs7Ozs7QUFNM0MsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTXhDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU14QyxRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNdEMsUUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTWhELFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUM7Ozs7OztBQU05QyxRQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNNUMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTXhDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUM7Ozs7OztBQU0xQyxRQUFJLENBQUMsV0FBVyxHQUFH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QUFTLFVBQVU7O0FBNFJ2QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gZ3JhbnVsYXIgc3ludGhlc2lzIGVuZ2luZVxuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xuXG4vKipcbiAqIEBjbGFzcyBHcmFudWxhckVuZ2luZVxuICovXG5jbGFzcyBHcmFudWxhckVuZ2luZSBleHRlbmRzIFRpbWVFbmdpbmUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7QXVkaW9CdWZmZXJ9IGJ1ZmZlciBpbml0aWFsIGF1ZGlvIGJ1ZmZlciBmb3IgZ3JhbnVsYXIgc3ludGhlc2lzXG4gICAqXG4gICAqIFRoZSBlbmdpbmUgaW1wbGVtZW50cyB0aGUgXCJzY2hlZHVsZWRcIiBpbnRlcmZhY2UuXG4gICAqIFRoZSBncmFpbiBwb3NpdGlvbiAoZ3JhaW4gb25zZXQgb3IgY2VudGVyIHRpbWUgaW4gdGhlIGF1ZGlvIGJ1ZmZlcikgaXMgb3B0aW9uYWxseVxuICAgKiBkZXRlcm1pbmVkIGJ5IHRoZSBlbmdpbmUncyBjdXJyZW50UG9zaXRpb24gYXR0cmlidXRlLlxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0aW9ucy5idWZmZXIgfHwgbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIHBlcmlvZCBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kQWJzID0gb3B0aW9ucy5wZXJpb2RBYnMgfHwgMC4wMTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBlcmlvZCByZWxhdGl2ZSB0byBhYnNvbHV0ZSBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RSZWwgPSBvcHRpb25zLnBlcmlvZFJlbCB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFZhciA9IG9wdGlvbnMucGVyaW9kVmFyIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBwb3NpdGlvbiAob25zZXQgdGltZSBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb24gfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwb3NpdGlvbiB2YXJpYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0aW9ucy5wb3NpdGlvblZhciB8fCAwLjAwMztcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIGR1cmF0aW9uIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFicyA9IG9wdGlvbnMuZHVyYXRpb25BYnMgfHwgMC4xOyAvLyBhYnNvbHV0ZSBncmFpbiBkdXJhdGlvblxuXG4gICAgLyoqXG4gICAgICogR3JhaW4gZHVyYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kIChvdmVybGFwKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdGlvbnMuZHVyYXRpb25SZWwgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tBYnMgPSBvcHRpb25zLmF0dGFja0FicyB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNrIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrUmVsID0gb3B0aW9ucy5hdHRhY2tSZWwgfHwgMC41O1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgYXR0YWNrXG4gICAgICogQHR5cGUge1N0cmluZ30gJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWxcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1NoYXBlID0gb3B0aW9ucy5hdHRhY2tTaGFwZSB8fCAnbGluJztcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZUFicyA9IG9wdGlvbnMucmVsZWFzZUFicyB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VSZWwgPSBvcHRpb25zLnJlbGVhc2VSZWwgfHwgMC41O1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgcmVsZWFzZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9ICdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlU2hhcGUgPSBvcHRpb25zLnJlbGVhc2VTaGFwZSB8fCAnbGluJztcblxuICAgIC8qKlxuICAgICAqIE9mZnNldCAoc3RhcnQvZW5kIHZhbHVlKSBmb3IgZXhwb25lbnRpYWwgYXR0YWNrL3JlbGVhc2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfSBvZmZzZXRcbiAgICAgKi9cbiAgICB0aGlzLmV4cFJhbXBPZmZzZXQgPSBvcHRpb25zLmV4cFJhbXBPZmZzZXQgfHwgMC4wMDAxO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcmVzYW1wbGluZyBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmcgPSBvcHRpb25zLnJlc2FtcGxpbmcgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmdWYXIgPSBvcHRpb25zLnJlc2FtcGxpbmdWYXIgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGdyYWluIHBvc2l0aW9uIHJlZmVycyB0byB0aGUgY2VudGVyIG9mIHRoZSBncmFpbiAob3IgdGhlIGJlZ2lubmluZylcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKi9cbiAgICB0aGlzLmNlbnRlcmVkID0gb3B0aW9ucy5jZW50ZXJlZCB8fCB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBncmFpbiBwb3NpdGlvbiBhcmUgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKi9cbiAgICB0aGlzLmN5Y2xpYyA9IG9wdGlvbnMuY3ljbGljIHx8IGZhbHNlO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gb3B0aW9ucy5nYWluIHx8IDE7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICBpZiAodGhpcy5idWZmZXIud3JhcEFyb3VuZEV4dGVudGlvbilcbiAgICAgIGJ1ZmZlckR1cmF0aW9uIC09IHRoaXMuYnVmZmVyLndyYXBBcm91bmRFeHRlbnRpb247XG5cbiAgICByZXR1cm4gYnVmZmVyRHVyYXRpb247XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIGF0dHJpYnV0ZVxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGltZSArIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgfVxuXG4gIGdldCBwbGF5YmFja0xlbmd0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5idWZmZXJEdXJhdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZ2FpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgZ3JhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgZ3JhaW4gc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBwZXJpb2QgdG8gbmV4dCBncmFpblxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBncmFpbiBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgZ3JhaW4gcGFyYW1ldGVycy5cbiAgICovXG4gIHRyaWdnZXIodGltZSwgb3V0cHV0Tm9kZSA9IHRoaXMub3V0cHV0Tm9kZSkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgZ3JhaW5UaW1lID0gdGltZSB8fCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgdmFyIGdyYWluUGVyaW9kID0gdGhpcy5wZXJpb2RBYnM7XG4gICAgdmFyIGdyYWluUG9zaXRpb24gPSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgICB2YXIgZ3JhaW5EdXJhdGlvbiA9IHRoaXMuZHVyYXRpb25BYnM7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciByZXNhbXBsaW5nUmF0ZSA9IDEuMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIGdyYWluUGVyaW9kICs9IHRoaXMucGVyaW9kUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgIGdyYWluRHVyYXRpb24gKz0gdGhpcy5kdXJhdGlvblJlbCAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBncmFpbiBwZXJpb2QgcmFuZG9uIHZhcmlhdGlvblxuICAgICAgaWYgKHRoaXMucGVyaW9kVmFyID4gMC4wKVxuICAgICAgICBncmFpblBlcmlvZCArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBlcmlvZFZhciAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBjZW50ZXIgZ3JhaW5cbiAgICAgIGlmICh0aGlzLmNlbnRlcmVkKVxuICAgICAgICBncmFpblBvc2l0aW9uIC09IDAuNSAqIGdyYWluRHVyYXRpb247XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBncmFpbiBwb3NpdGlvblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25WYXIgPiAwKVxuICAgICAgICBncmFpblBvc2l0aW9uICs9ICgyLjAgKiBNYXRoLnJhbmRvbSgpIC0gMSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAvLyB3cmFwIG9yIGNsaXAgZ3JhaW4gcG9zaXRpb24gYW5kIGR1cmF0aW9uIGludG8gYnVmZmVyIGR1cmF0aW9uXG4gICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiA8IDAgfHwgZ3JhaW5Qb3NpdGlvbiA+PSBidWZmZXJEdXJhdGlvbikge1xuICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICB2YXIgY3ljbGVzID0gZ3JhaW5Qb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAoY3ljbGVzIC0gTWF0aC5mbG9vcihjeWNsZXMpKSAqIGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gKyBncmFpbkR1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb24gLSBncmFpblBvc2l0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgZ3JhaW5UaW1lIC09IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uICs9IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpblBvc2l0aW9uID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiBidWZmZXJEdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSBidWZmZXJEdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbWFrZSBncmFpblxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgZ3JhaW5EdXJhdGlvbiA+PSAwLjAwMSkge1xuICAgICAgICAvLyBtYWtlIGdyYWluIGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZU5vZGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB2YXIgYXR0YWNrID0gdGhpcy5hdHRhY2tBYnMgKyB0aGlzLmF0dGFja1JlbCAqIGdyYWluRHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlID0gdGhpcy5yZWxlYXNlQWJzICsgdGhpcy5yZWxlYXNlUmVsICogZ3JhaW5EdXJhdGlvbjtcblxuICAgICAgICBpZiAoYXR0YWNrICsgcmVsZWFzZSA+IGdyYWluRHVyYXRpb24pIHtcbiAgICAgICAgICB2YXIgZmFjdG9yID0gZ3JhaW5EdXJhdGlvbiAvIChhdHRhY2sgKyByZWxlYXNlKTtcbiAgICAgICAgICBhdHRhY2sgKj0gZmFjdG9yO1xuICAgICAgICAgIHJlbGVhc2UgKj0gZmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGFja0VuZFRpbWUgPSBncmFpblRpbWUgKyBhdHRhY2s7XG4gICAgICAgIHZhciBncmFpbkVuZFRpbWUgPSBncmFpblRpbWUgKyBncmFpbkR1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZVN0YXJ0VGltZSA9IGdyYWluRW5kVGltZSAtIHJlbGVhc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNrU2hhcGUgPT09ICdsaW4nKSB7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBncmFpblRpbWUpO1xuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEuMCwgYXR0YWNrRW5kVGltZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5leHBSYW1wT2Zmc2V0LCBncmFpblRpbWUpO1xuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoMS4wLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWxlYXNlU3RhcnRUaW1lID4gYXR0YWNrRW5kVGltZSlcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgxLjAsIHJlbGVhc2VTdGFydFRpbWUpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbGVhc2VTaGFwZSA9PT0gJ2xpbicpIHtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIGdyYWluRW5kVGltZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBlbnZlbG9wZU5vZGUuY29ubmVjdChvdXRwdXROb2RlKTtcblxuICAgICAgICAvLyBtYWtlIHNvdXJjZVxuICAgICAgICB2YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChlbnZlbG9wZU5vZGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChncmFpblRpbWUsIGdyYWluUG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChncmFpblRpbWUgKyBncmFpbkR1cmF0aW9uIC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBncmFpblBlcmlvZDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdyYW51bGFyRW5naW5lOyJdfQ==