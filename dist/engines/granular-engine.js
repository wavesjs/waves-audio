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

  function GranularEngine(audioContext) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, GranularEngine);

    _get(_core.Object.getPrototypeOf(GranularEngine.prototype), "constructor", this).call(this, audioContext);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7Ozs7O0lBSzFDLGNBQWM7Ozs7Ozs7Ozs7QUFTUCxXQVRQLGNBQWMsQ0FTTixZQUFZLEVBQWU7UUFBZCxPQUFPLGdDQUFHLEVBQUU7OzBCQVRqQyxjQUFjOztBQVVoQixxQ0FWRSxjQUFjLDZDQVVWLFlBQVksRUFBRTs7Ozs7O0FBTXBCLFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7Ozs7OztBQU1yQyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDOzs7Ozs7QUFNM0MsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTXhDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7Ozs7OztBQU14QyxRQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNdEMsUUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTWhELFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUM7Ozs7OztBQU05QyxRQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNNUMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTXhDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUM7Ozs7OztBQU0xQyxRQUFJLENBQUMsV0FBVyxHQUFH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QUFTLFVBQVU7O0FBNFJ2QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gZ3JhbnVsYXIgc3ludGhlc2lzIGVuZ2luZVxuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xuXG4vKipcbiAqIEBjbGFzcyBHcmFudWxhckVuZ2luZVxuICovXG5jbGFzcyBHcmFudWxhckVuZ2luZSBleHRlbmRzIFRpbWVFbmdpbmUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7QXVkaW9CdWZmZXJ9IGJ1ZmZlciBpbml0aWFsIGF1ZGlvIGJ1ZmZlciBmb3IgZ3JhbnVsYXIgc3ludGhlc2lzXG4gICAqXG4gICAqIFRoZSBlbmdpbmUgaW1wbGVtZW50cyB0aGUgXCJzY2hlZHVsZWRcIiBpbnRlcmZhY2UuXG4gICAqIFRoZSBncmFpbiBwb3NpdGlvbiAoZ3JhaW4gb25zZXQgb3IgY2VudGVyIHRpbWUgaW4gdGhlIGF1ZGlvIGJ1ZmZlcikgaXMgb3B0aW9uYWxseVxuICAgKiBkZXRlcm1pbmVkIGJ5IHRoZSBlbmdpbmUncyBjdXJyZW50UG9zaXRpb24gYXR0cmlidXRlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0LG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKGF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRpb25zLmJ1ZmZlciB8fCBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgZ3JhaW4gcGVyaW9kIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RBYnMgPSBvcHRpb25zLnBlcmlvZEFicyB8fCAwLjAxO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcGVyaW9kIHJlbGF0aXZlIHRvIGFic29sdXRlIGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFJlbCA9IG9wdGlvbnMucGVyaW9kUmVsIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0aW9ucy5wZXJpb2RWYXIgfHwgMDtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBvc2l0aW9uIChvbnNldCB0aW1lIGluIGF1ZGlvIGJ1ZmZlcikgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uID0gb3B0aW9ucy5wb3NpdGlvbiB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25WYXIgPSBvcHRpb25zLnBvc2l0aW9uVmFyIHx8IDAuMDAzO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgZ3JhaW4gZHVyYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0aW9ucy5kdXJhdGlvbkFicyB8fCAwLjE7IC8vIGFic29sdXRlIGdyYWluIGR1cmF0aW9uXG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBkdXJhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2QgKG92ZXJsYXApXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uUmVsID0gb3B0aW9ucy5kdXJhdGlvblJlbCB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgYXR0YWNrIHRpbWUgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja0FicyA9IG9wdGlvbnMuYXR0YWNrQWJzIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tSZWwgPSBvcHRpb25zLmF0dGFja1JlbCB8fCAwLjU7XG5cbiAgICAvKipcbiAgICAgKiBTaGFwZSBvZiBhdHRhY2tcbiAgICAgKiBAdHlwZSB7U3RyaW5nfSAnbGluJyBmb3IgbGluZWFyIHJhbXAsICdleHAnIGZvciBleHBvbmVudGlhbFxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrU2hhcGUgPSBvcHRpb25zLmF0dGFja1NoYXBlIHx8ICdsaW4nO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgcmVsZWFzZSB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlQWJzID0gb3B0aW9ucy5yZWxlYXNlQWJzIHx8IDA7XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdGlvbnMucmVsZWFzZVJlbCB8fCAwLjU7XG5cbiAgICAvKipcbiAgICAgKiBTaGFwZSBvZiByZWxlYXNlXG4gICAgICogQHR5cGUge1N0cmluZ30gJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWxcbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VTaGFwZSA9IG9wdGlvbnMucmVsZWFzZVNoYXBlIHx8ICdsaW4nO1xuXG4gICAgLyoqXG4gICAgICogT2Zmc2V0IChzdGFydC9lbmQgdmFsdWUpIGZvciBleHBvbmVudGlhbCBhdHRhY2svcmVsZWFzZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9IG9mZnNldFxuICAgICAqL1xuICAgIHRoaXMuZXhwUmFtcE9mZnNldCA9IG9wdGlvbnMuZXhwUmFtcE9mZnNldCB8fCAwLjAwMDE7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiByZXNhbXBsaW5nIGluIGNlbnRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdGlvbnMucmVzYW1wbGluZyB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZ1ZhciA9IG9wdGlvbnMucmVzYW1wbGluZ1ZhciB8fCAwO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgZ3JhaW4gcG9zaXRpb24gcmVmZXJzIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGdyYWluIChvciB0aGUgYmVnaW5uaW5nKVxuICAgICAqIEB0eXBlIHtCb29sfVxuICAgICAqL1xuICAgIHRoaXMuY2VudGVyZWQgPSBvcHRpb25zLmNlbnRlcmVkIHx8IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIGdyYWluIHBvc2l0aW9uIGFyZSBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgICAqIEB0eXBlIHtCb29sfVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0aW9ucy5jeWNsaWMgfHwgZmFsc2U7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRpb25zLmdhaW4gfHwgMTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuX19nYWluTm9kZTtcbiAgfVxuXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgIGlmICh0aGlzLmJ1ZmZlci53cmFwQXJvdW5kRXh0ZW50aW9uKVxuICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy5idWZmZXIud3JhcEFyb3VuZEV4dGVudGlvbjtcblxuICAgIHJldHVybiBidWZmZXJEdXJhdGlvbjtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgYXR0cmlidXRlXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb247XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHJldHVybiB0aW1lICsgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICB9XG5cbiAgZ2V0IHBsYXliYWNrTGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBnYWluXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBsaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2FpblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgZ2FpblxuICAgKi9cbiAgZ2V0IGdhaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBncmFpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBncmFpbiBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHBlcmlvZCB0byBuZXh0IGdyYWluXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCBhdCBhbnkgdGltZSAod2hldGhlciB0aGUgZW5naW5lIGlzIHNjaGVkdWxlZCBvciBub3QpXG4gICAqIHRvIGdlbmVyYXRlIGEgc2luZ2xlIGdyYWluIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBncmFpbiBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgdHJpZ2dlcih0aW1lLCBvdXRwdXROb2RlID0gdGhpcy5vdXRwdXROb2RlKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBncmFpblRpbWUgPSB0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICB2YXIgZ3JhaW5QZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgZ3JhaW5Qb3NpdGlvbiA9IHRoaXMuY3VycmVudFBvc2l0aW9uO1xuICAgIHZhciBncmFpbkR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFicztcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIHJlc2FtcGxpbmdSYXRlID0gMS4wO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzYW1wbGluZ1xuICAgICAgaWYgKHRoaXMucmVzYW1wbGluZyAhPT0gMCB8fCB0aGlzLnJlc2FtcGxpbmdWYXIgPiAwKSB7XG4gICAgICAgIHZhciByYW5kb21SZXNhbXBsaW5nID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMi4wICogdGhpcy5yZXNhbXBsaW5nVmFyO1xuICAgICAgICByZXNhbXBsaW5nUmF0ZSA9IE1hdGgucG93KDIuMCwgKHRoaXMucmVzYW1wbGluZyArIHJhbmRvbVJlc2FtcGxpbmcpIC8gMTIwMC4wKTtcbiAgICAgIH1cblxuICAgICAgZ3JhaW5QZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBncmFpbkR1cmF0aW9uO1xuICAgICAgZ3JhaW5EdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uUmVsICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGdyYWluIHBlcmlvZCByYW5kb24gdmFyaWF0aW9uXG4gICAgICBpZiAodGhpcy5wZXJpb2RWYXIgPiAwLjApXG4gICAgICAgIGdyYWluUGVyaW9kICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucGVyaW9kVmFyICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGNlbnRlciBncmFpblxuICAgICAgaWYgKHRoaXMuY2VudGVyZWQpXG4gICAgICAgIGdyYWluUG9zaXRpb24gLT0gMC41ICogZ3JhaW5EdXJhdGlvbjtcblxuICAgICAgLy8gcmFuZG9taXplIGdyYWluIHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIGdyYWluUG9zaXRpb24gKz0gKDIuMCAqIE1hdGgucmFuZG9tKCkgLSAxKSAqIHRoaXMucG9zaXRpb25WYXI7XG5cbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIC8vIHdyYXAgb3IgY2xpcCBncmFpbiBwb3NpdGlvbiBhbmQgZHVyYXRpb24gaW50byBidWZmZXIgZHVyYXRpb25cbiAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCB8fCBncmFpblBvc2l0aW9uID49IGJ1ZmZlckR1cmF0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgICAgIHZhciBjeWNsZXMgPSBncmFpblBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgZ3JhaW5Qb3NpdGlvbiA9IChjeWNsZXMgLSBNYXRoLmZsb29yKGN5Y2xlcykpICogYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiB0aGlzLmJ1ZmZlci5kdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICBncmFpblRpbWUgLT0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gKz0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uICsgZ3JhaW5EdXJhdGlvbiA+IGJ1ZmZlckR1cmF0aW9uKVxuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiA9IGJ1ZmZlckR1cmF0aW9uIC0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBtYWtlIGdyYWluXG4gICAgICBpZiAodGhpcy5nYWluID4gMCAmJiBncmFpbkR1cmF0aW9uID49IDAuMDAxKSB7XG4gICAgICAgIC8vIG1ha2UgZ3JhaW4gZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlTm9kZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2UgPSB0aGlzLnJlbGVhc2VBYnMgKyB0aGlzLnJlbGVhc2VSZWwgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gZ3JhaW5EdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBncmFpbkR1cmF0aW9uIC8gKGF0dGFjayArIHJlbGVhc2UpO1xuICAgICAgICAgIGF0dGFjayAqPSBmYWN0b3I7XG4gICAgICAgICAgcmVsZWFzZSAqPSBmYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXR0YWNrRW5kVGltZSA9IGdyYWluVGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIGdyYWluRW5kVGltZSA9IGdyYWluVGltZSArIGdyYWluRHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gZ3JhaW5FbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2tTaGFwZSA9PT0gJ2xpbicpIHtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjAsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMS4wLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGVOb2RlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIGF0dGFja0VuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDEuMCwgcmVsZWFzZVN0YXJ0VGltZSk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVsZWFzZVNoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlTm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZU5vZGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVudmVsb3BlTm9kZS5jb25uZWN0KG91dHB1dE5vZGUpO1xuXG4gICAgICAgIC8vIG1ha2Ugc291cmNlXG4gICAgICAgIHZhciBzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gcmVzYW1wbGluZ1JhdGU7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KGVudmVsb3BlTm9kZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KGdyYWluVGltZSwgZ3JhaW5Qb3NpdGlvbik7XG4gICAgICAgIHNvdXJjZS5zdG9wKGdyYWluVGltZSArIGdyYWluRHVyYXRpb24gLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyYWluUGVyaW9kO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR3JhbnVsYXJFbmdpbmU7Il19