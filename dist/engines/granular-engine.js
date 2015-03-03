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

  function GranularEngine() {
    var options = arguments[0] === undefined ? {} : arguments[0];
    var audioContext = arguments[1] === undefined ? null : arguments[1];

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

    this.__gainNode = _babelHelpers.get(_core.Object.getPrototypeOf(GranularEngine.prototype), "audioContext", this).createGain();
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

        var audioContext = _babelHelpers.get(_core.Object.getPrototypeOf(GranularEngine.prototype), "audioContext", this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Ozs7OztJQUsxQyxjQUFjLGNBQVMsVUFBVTs7Ozs7Ozs7OztBQVMxQixXQVRQLGNBQWM7UUFTTixPQUFPLGdDQUFHLEVBQUU7UUFBRSxZQUFZLGdDQUFHLElBQUk7O3VDQVR6QyxjQUFjOztBQVVoQixrREFWRSxjQUFjLDZDQVVWLFlBQVksRUFBRTs7Ozs7O0FBTXBCLFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7Ozs7OztBQU1yQyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDOzs7Ozs7QUFNM0MsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTXhDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU14QyxRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNdEMsUUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTWhELFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUM7Ozs7OztBQU05QyxRQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNNUMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTXhDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUM7Ozs7OztBQU0xQyxRQUFJ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QUFPLFdBQVcsQ0FBQztPQUNwQjs7Ozs7O1NBelJHLGNBQWM7R0FBUyxVQUFVOztBQTRSdkMsTUFBTSxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMiLCJmaWxlIjoic3JjL3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBhdWRpbyBncmFudWxhciBzeW50aGVzaXMgZW5naW5lXG4gKiBAYXV0aG9yIE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mciwgVmljdG9yLlNhaXpAaXJjYW0uZnIsIEthcmltLkJhcmthdGlAaXJjYW0uZnJcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG5cbi8qKlxuICogQGNsYXNzIEdyYW51bGFyRW5naW5lXG4gKi9cbmNsYXNzIEdyYW51bGFyRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gYnVmZmVyIGluaXRpYWwgYXVkaW8gYnVmZmVyIGZvciBncmFudWxhciBzeW50aGVzaXNcbiAgICpcbiAgICogVGhlIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBcInNjaGVkdWxlZFwiIGludGVyZmFjZS5cbiAgICogVGhlIGdyYWluIHBvc2l0aW9uIChncmFpbiBvbnNldCBvciBjZW50ZXIgdGltZSBpbiB0aGUgYXVkaW8gYnVmZmVyKSBpcyBvcHRpb25hbGx5XG4gICAqIGRldGVybWluZWQgYnkgdGhlIGVuZ2luZSdzIGN1cnJlbnRQb3NpdGlvbiBhdHRyaWJ1dGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30sIGF1ZGlvQ29udGV4dCA9IG51bGwpIHtcbiAgICBzdXBlcihhdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0aW9ucy5idWZmZXIgfHwgbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIHBlcmlvZCBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kQWJzID0gb3B0aW9ucy5wZXJpb2RBYnMgfHwgMC4wMTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBlcmlvZCByZWxhdGl2ZSB0byBhYnNvbHV0ZSBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RSZWwgPSBvcHRpb25zLnBlcmlvZFJlbCB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFZhciA9IG9wdGlvbnMucGVyaW9kVmFyIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBwb3NpdGlvbiAob25zZXQgdGltZSBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb24gfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwb3NpdGlvbiB2YXJpYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0aW9ucy5wb3NpdGlvblZhciB8fCAwLjAwMztcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIGR1cmF0aW9uIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFicyA9IG9wdGlvbnMuZHVyYXRpb25BYnMgfHwgMC4xOyAvLyBhYnNvbHV0ZSBncmFpbiBkdXJhdGlvblxuXG4gICAgLyoqXG4gICAgICogR3JhaW4gZHVyYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kIChvdmVybGFwKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdGlvbnMuZHVyYXRpb25SZWwgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tBYnMgPSBvcHRpb25zLmF0dGFja0FicyB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNrIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrUmVsID0gb3B0aW9ucy5hdHRhY2tSZWwgfHwgMC41O1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgYXR0YWNrXG4gICAgICogQHR5cGUge1N0cmluZ30gJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWxcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1NoYXBlID0gb3B0aW9ucy5hdHRhY2tTaGFwZSB8fCAnbGluJztcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZUFicyA9IG9wdGlvbnMucmVsZWFzZUFicyB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VSZWwgPSBvcHRpb25zLnJlbGVhc2VSZWwgfHwgMC41O1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgcmVsZWFzZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9ICdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlU2hhcGUgPSBvcHRpb25zLnJlbGVhc2VTaGFwZSB8fCAnbGluJztcblxuICAgIC8qKlxuICAgICAqIE9mZnNldCAoc3RhcnQvZW5kIHZhbHVlKSBmb3IgZXhwb25lbnRpYWwgYXR0YWNrL3JlbGVhc2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfSBvZmZzZXRcbiAgICAgKi9cbiAgICB0aGlzLmV4cFJhbXBPZmZzZXQgPSBvcHRpb25zLmV4cFJhbXBPZmZzZXQgfHwgMC4wMDAxO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcmVzYW1wbGluZyBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmcgPSBvcHRpb25zLnJlc2FtcGxpbmcgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmdWYXIgPSBvcHRpb25zLnJlc2FtcGxpbmdWYXIgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGdyYWluIHBvc2l0aW9uIHJlZmVycyB0byB0aGUgY2VudGVyIG9mIHRoZSBncmFpbiAob3IgdGhlIGJlZ2lubmluZylcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKi9cbiAgICB0aGlzLmNlbnRlcmVkID0gb3B0aW9ucy5jZW50ZXJlZCB8fCB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBncmFpbiBwb3NpdGlvbiBhcmUgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKi9cbiAgICB0aGlzLmN5Y2xpYyA9IG9wdGlvbnMuY3ljbGljIHx8IGZhbHNlO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gc3VwZXIuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdGlvbnMuZ2FpbiB8fCAxO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyLndyYXBBcm91bmRFeHRlbnRpb24pXG4gICAgICBidWZmZXJEdXJhdGlvbiAtPSB0aGlzLmJ1ZmZlci53cmFwQXJvdW5kRXh0ZW50aW9uO1xuXG4gICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBhdHRyaWJ1dGVcbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnRyaWdnZXIodGltZSk7XG4gIH1cblxuICBnZXQgcGxheWJhY2tMZW5ndGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyRHVyYXRpb247XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIGdyYWluXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIGdyYWluIHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gcGVyaW9kIHRvIG5leHQgZ3JhaW5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGF0IGFueSB0aW1lICh3aGV0aGVyIHRoZSBlbmdpbmUgaXMgc2NoZWR1bGVkIG9yIG5vdClcbiAgICogdG8gZ2VuZXJhdGUgYSBzaW5nbGUgZ3JhaW4gYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGdyYWluIHBhcmFtZXRlcnMuXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUsIG91dHB1dE5vZGUgPSB0aGlzLm91dHB1dE5vZGUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gc3VwZXIuYXVkaW9Db250ZXh0O1xuICAgIHZhciBncmFpblRpbWUgPSB0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICB2YXIgZ3JhaW5QZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgZ3JhaW5Qb3NpdGlvbiA9IHRoaXMuY3VycmVudFBvc2l0aW9uO1xuICAgIHZhciBncmFpbkR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFicztcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIHJlc2FtcGxpbmdSYXRlID0gMS4wO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzYW1wbGluZ1xuICAgICAgaWYgKHRoaXMucmVzYW1wbGluZyAhPT0gMCB8fCB0aGlzLnJlc2FtcGxpbmdWYXIgPiAwKSB7XG4gICAgICAgIHZhciByYW5kb21SZXNhbXBsaW5nID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMi4wICogdGhpcy5yZXNhbXBsaW5nVmFyO1xuICAgICAgICByZXNhbXBsaW5nUmF0ZSA9IE1hdGgucG93KDIuMCwgKHRoaXMucmVzYW1wbGluZyArIHJhbmRvbVJlc2FtcGxpbmcpIC8gMTIwMC4wKTtcbiAgICAgIH1cblxuICAgICAgZ3JhaW5QZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBncmFpbkR1cmF0aW9uO1xuICAgICAgZ3JhaW5EdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uUmVsICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGdyYWluIHBlcmlvZCByYW5kb24gdmFyaWF0aW9uXG4gICAgICBpZiAodGhpcy5wZXJpb2RWYXIgPiAwLjApXG4gICAgICAgIGdyYWluUGVyaW9kICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucGVyaW9kVmFyICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGNlbnRlciBncmFpblxuICAgICAgaWYgKHRoaXMuY2VudGVyZWQpXG4gICAgICAgIGdyYWluUG9zaXRpb24gLT0gMC41ICogZ3JhaW5EdXJhdGlvbjtcblxuICAgICAgLy8gcmFuZG9taXplIGdyYWluIHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIGdyYWluUG9zaXRpb24gKz0gKDIuMCAqIE1hdGgucmFuZG9tKCkgLSAxKSAqIHRoaXMucG9zaXRpb25WYXI7XG5cbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIC8vIHdyYXAgb3IgY2xpcCBncmFpbiBwb3NpdGlvbiBhbmQgZHVyYXRpb24gaW50byBidWZmZXIgZHVyYXRpb25cbiAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCB8fCBncmFpblBvc2l0aW9uID49IGJ1ZmZlckR1cmF0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgICAgIHZhciBjeWNsZXMgPSBncmFpblBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgZ3JhaW5Qb3NpdGlvbiA9IChjeWNsZXMgLSBNYXRoLmZsb29yKGN5Y2xlcykpICogYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiB0aGlzLmJ1ZmZlci5kdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICBncmFpblRpbWUgLT0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gKz0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uICsgZ3JhaW5EdXJhdGlvbiA+IGJ1ZmZlckR1cmF0aW9uKVxuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiA9IGJ1ZmZlckR1cmF0aW9uIC0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBtYWtlIGdyYWluXG4gICAgICBpZiAodGhpcy5nYWluID4gMCAmJiBncmFpbkR1cmF0aW9uID49IDAuMDAxKSB7XG4gICAgICAgIC8vIG1ha2UgZ3JhaW4gZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlTm9kZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2UgPSB0aGlzLnJlbGVhc2VBYnMgKyB0aGlzLnJlbGVhc2VSZWwgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gZ3JhaW5EdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBncmFpbkR1cmF0aW9uIC8gKGF0dGFjayArIHJlbGVhc2UpO1xuICAgICAgICAgIGF0dGFjayAqPSBmYWN0b3I7XG4gICAgICAgICAgcmVsZWFzZSAqPSBmYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXR0YWNrRW5kVGltZSA9IGdyYWluVGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIGdyYWluRW5kVGltZSA9IGdyYWluVGltZSArIGdyYWluRHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gZ3JhaW5FbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2tTaGFwZSA9PT0gJ2xpbicpIHtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjAsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMS4wLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIGF0dGFja0VuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDEuMCwgcmVsZWFzZVN0YXJ0VGltZSk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVsZWFzZVNoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVudmVsb3BlTm9kZS5jb25uZWN0KG91dHB1dE5vZGUpO1xuXG4gICAgICAgIC8vIG1ha2Ugc291cmNlXG4gICAgICAgIHZhciBzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gcmVzYW1wbGluZ1JhdGU7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KGVudmVsb3BlTm9kZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KGdyYWluVGltZSwgZ3JhaW5Qb3NpdGlvbik7XG4gICAgICAgIHNvdXJjZS5zdG9wKGdyYWluVGltZSArIGdyYWluRHVyYXRpb24gLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyYWluUGVyaW9kO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR3JhbnVsYXJFbmdpbmU7Il19