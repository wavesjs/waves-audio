"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var AudioTimeEngine = require("../core/audio-time-engine");

function optOrDef(opt, def) {
  if (opt !== undefined) {
    return opt;
  }return def;
}

function getCurrentOrPreviousIndex(sortedArray, value) {
  var index = arguments[2] === undefined ? 0 : arguments[2];

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value < firstVal) index = -1;else if (value >= lastVal) index = size - 1;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] > value) index--;

      while (sortedArray[index + 1] <= value) index++;
    }
  }

  return index;
}

function getCurrentOrNextIndex(sortedArray, value) {
  var index = arguments[2] === undefined ? 0 : arguments[2];

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value <= firstVal) index = 0;else if (value >= lastVal) index = size;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] < value) index++;

      while (sortedArray[index + 1] >= value) index--;
    }
  }

  return index;
}

/**
 * @class SegmentEngine
 */

var SegmentEngine = (function (_AudioTimeEngine) {
  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" and "transported" interfaces.
   * When "scheduled", the engine  generates segments more or less periodically
   * (controlled by the periodAbs, periodRel, and perioVar attributes).
   * When "transported", the engine generates segments at the position of their onset time.
   */

  function SegmentEngine() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, SegmentEngine);

    _get(_core.Object.getPrototypeOf(SegmentEngine.prototype), "constructor", this).call(this, options.audioContext);

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute segment period in sec
     * @type {Number}
     */
    this.periodAbs = optOrDef(options.periodAbs, 0);

    /**
     * Segment period relative to inter-segment distance
     * @type {Number}
     */
    this.periodRel = optOrDef(options.periodRel, 1);

    /**
     * Amout of random segment period variation relative to segment period
     * @type {Number}
     */
    this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @type {Number}
     */
    this.positionArray = optOrDef(options.positionArray, [0]);

    /**
     * Amout of random segment position variation in sec
     * @type {Number}
     */
    this.positionVar = optOrDef(options.positionVar, 0);

    /**
     * Array of segment durations in sec
     * @type {Number}
     */
    this.durationArray = optOrDef(options.durationArray, [0]);

    /**
     * Absolute segment duration in sec
     * @type {Number}
     */
    this.durationAbs = optOrDef(options.durationAbs, 0);

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @type {Number}
     */
    this.durationRel = optOrDef(options.durationRel, 1);

    /**
     * Array of segment offsets in sec
     * @type {Number}
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
     */
    this.offsetArray = optOrDef(options.offsetArray, [0]);

    /**
     * Absolute segment offset in sec
     * @type {Number}
     */
    this.offsetAbs = optOrDef(options.offsetAbs, -0.005);

    /**
     * Segment offset relative to segment duration
     * @type {Number}
     */
    this.offsetRel = optOrDef(options.offsetRel, 0);

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @type {Number}
     */
    this.delay = optOrDef(options.delay, 0.005);

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    this.attackAbs = optOrDef(options.attackAbs, 0.005);

    /**
     * Attack time relative to segment duration
     * @type {Number}
     */
    this.attackRel = optOrDef(options.attackRel, 0);

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    this.releaseAbs = optOrDef(options.releaseAbs, 0.005);

    /**
     * Release time relative to segment duration
     * @type {Number}
     */
    this.releaseRel = optOrDef(options.releaseRel, 0);

    /**
     * Segment resampling in cent
     * @type {Number}
     */
    this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @type {Number}
     */
    this.gain = optOrDef(options.gain, 1);

    /**
     * Index of the segment to synthesize (i.e. of this.positionArray/durationArray/offsetArray)
     * @type {Number}
     */
    this.segmentIndex = optOrDef(options.segmentIndex, 0);

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @type {Bool}
     */
    this.cyclic = optOrDef(options.cyclic, false);
    this.__cyclicOffset = 0;

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @type {Number}
     */
    this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    this.outputNode = this.audioContext.createGain();
  }

  _inherits(SegmentEngine, _AudioTimeEngine);

  _createClass(SegmentEngine, {
    bufferDuration: {

      /**
       * Get buffer duration (excluding wrapAroundExtension)
       * @return {Number} current buffer duration
       */

      get: function () {
        if (this.buffer) {
          var bufferDuration = this.buffer.duration;

          if (this.wrapAroundExtension) bufferDuration -= this.wrapAroundExtension;

          return bufferDuration;
        }

        return 0;
      }
    },
    advanceTime: {

      // TimeEngine method (transported interface)

      value: function advanceTime(time) {
        time = Math.max(time, this.audioContext.currentTime);
        return time + this.trigger(time);
      }
    },
    syncPosition: {

      // TimeEngine method (transported interface)

      value: function syncPosition(time, position, speed) {
        var index = this.segmentIndex;
        var cyclicOffset = 0;
        var bufferDuration = this.bufferDuration;

        if (this.cyclic) {
          var cycles = position / bufferDuration;

          cyclicOffset = Math.floor(cycles) * bufferDuration;
          position -= cyclicOffset;
        }

        if (speed > 0) {
          index = getCurrentOrNextIndex(this.positionArray, position);

          if (index >= this.positionArray.length) {
            index = 0;
            cyclicOffset += bufferDuration;

            if (!this.cyclic) {
              return Infinity;
            }
          }
        } else if (speed < 0) {
          index = getCurrentOrPreviousIndex(this.positionArray, position);

          if (index < 0) {
            index = this.positionArray.length - 1;
            cyclicOffset -= bufferDuration;

            if (!this.cyclic) {
              return -Infinity;
            }
          }
        } else {
          return Infinity;
        }

        this.segmentIndex = index;
        this.__cyclicOffset = cyclicOffset;

        return cyclicOffset + this.positionArray[index];
      }
    },
    advancePosition: {

      // TimeEngine method (transported interface)

      value: function advancePosition(time, position, speed) {
        var index = this.segmentIndex;
        var cyclicOffset = this.__cyclicOffset;

        this.trigger(time);

        if (speed > 0) {
          index++;

          if (index >= this.positionArray.length) {
            index = 0;
            cyclicOffset += this.bufferDuration;

            if (!this.cyclic) {
              return Infinity;
            }
          }
        } else {
          index--;

          if (index < 0) {
            index = this.positionArray.length - 1;
            cyclicOffset -= this.bufferDuration;

            if (!this.cyclic) {
              return -Infinity;
            }
          }
        }

        this.segmentIndex = index;
        this.__cyclicOffset = cyclicOffset;

        return cyclicOffset + this.positionArray[index];
      }
    },
    trigger: {

      /**
       * Trigger a segment
       * @param {Number} time segment synthesis audio time
       * @return {Number} period to next segment
       *
       * This function can be called at any time (whether the engine is scheduled/transported or not)
       * to generate a single segment according to the current segment parameters.
       */

      value: function trigger(time) {
        var audioContext = this.audioContext;
        var segmentTime = (time || audioContext.currentTime) + this.delay;
        var segmentPeriod = this.periodAbs;
        var segmentIndex = this.segmentIndex;

        if (this.buffer) {
          var segmentPosition = 0;
          var segmentDuration = 0;
          var segmentOffset = 0;
          var resamplingRate = 1;
          var bufferDuration = this.bufferDuration;

          if (this.cyclic) segmentIndex = segmentIndex % this.positionArray.length;else segmentIndex = Math.max(0, Math.min(segmentIndex, this.positionArray.length - 1));

          if (this.positionArray) segmentPosition = this.positionArray[segmentIndex] || 0;

          if (this.durationArray) segmentDuration = this.durationArray[segmentIndex] || 0;

          if (this.offsetArray) segmentOffset = this.offsetArray[segmentIndex] || 0;

          // calculate resampling
          if (this.resampling !== 0 || this.resamplingVar > 0) {
            var randomResampling = (Math.random() - 0.5) * 2 * this.resamplingVar;
            resamplingRate = Math.pow(2, (this.resampling + randomResampling) / 1200);
          }

          // calculate inter-segment distance
          if (segmentDuration === 0 || this.periodRel > 0) {
            var nextSegementIndex = segmentIndex + 1;
            var nextPosition, nextOffset;

            if (nextSegementIndex === this.positionArray.length) {
              if (this.cyclic) {
                nextPosition = this.positionArray[0] + bufferDuration;
                nextOffset = this.offsetArray[0];
              } else {
                nextPosition = bufferDuration;
                nextOffset = 0;
              }
            } else {
              nextPosition = this.positionArray[nextSegementIndex];
              nextOffset = this.offsetArray[nextSegementIndex];
            }

            var interSegmentDistance = nextPosition - segmentPosition;

            // correct inter-segment distance by offsets
            //   offset > 0: the segment's reference position is after the given segment position
            if (segmentOffset > 0) interSegmentDistance -= segmentOffset;

            if (nextOffset > 0) interSegmentDistance += nextOffset;

            if (interSegmentDistance < 0) interSegmentDistance = 0;

            // use inter-segment distance instead of segment duration
            if (segmentDuration === 0) segmentDuration = interSegmentDistance;

            // calculate period relative to inter marker distance
            segmentPeriod += this.periodRel * interSegmentDistance;
          }

          // add relative and absolute segment duration
          segmentDuration *= this.durationRel;
          segmentDuration += this.durationAbs;

          // add relative and absolute segment offset
          segmentOffset *= this.offsetRel;
          segmentOffset += this.offsetAbs;

          // apply segment offset
          //   offset > 0: the segment's reference position is after the given segment position
          //   offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
          if (segmentOffset < 0) {
            segmentDuration -= segmentOffset;
            segmentPosition += segmentOffset;
            segmentTime += segmentOffset / resamplingRate;
          } else {
            segmentTime -= segmentOffset / resamplingRate;
          }

          // randomize segment position
          if (this.positionVar > 0) segmentPosition += 2 * (Math.random() - 0.5) * this.positionVar;

          // shorten duration of segments over the edges of the buffer
          if (segmentPosition < 0) {
            segmentDuration += segmentPosition;
            segmentPosition = 0;
          }

          if (segmentPosition + segmentDuration > this.buffer.duration) segmentDuration = this.buffer.duration - segmentPosition;

          // make segment
          if (this.gain > 0 && segmentDuration > 0) {
            // make segment envelope
            var envelope = audioContext.createGain();
            var attack = this.attackAbs + this.attackRel * segmentDuration;
            var release = this.releaseAbs + this.releaseRel * segmentDuration;

            if (attack + release > segmentDuration) {
              var factor = segmentDuration / (attack + release);
              attack *= factor;
              release *= factor;
            }

            var attackEndTime = segmentTime + attack;
            var segmentEndTime = segmentTime + segmentDuration;
            var releaseStartTime = segmentEndTime - release;

            envelope.gain.setValueAtTime(0, segmentTime);
            envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);

            if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

            envelope.gain.linearRampToValueAtTime(0, segmentEndTime);
            envelope.connect(this.outputNode);

            // make source
            var source = audioContext.createBufferSource();

            source.buffer = this.buffer;
            source.playbackRate.value = resamplingRate;
            source.connect(envelope);

            source.start(segmentTime, segmentPosition);
            source.stop(segmentTime + segmentDuration / resamplingRate);
          }
        }

        return segmentPeriod;
      }
    }
  });

  return SegmentEngine;
})(AudioTimeEngine);

module.exports = SegmentEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztBQUUzRCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0FBQzFCLE1BQUcsR0FBRyxLQUFLLFNBQVM7QUFDbEIsV0FBTyxHQUFHLENBQUM7R0FBQSxBQUViLE9BQU8sR0FBRyxDQUFDO0NBQ1o7O0FBRUQsU0FBUyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFhO01BQVgsS0FBSyxnQ0FBRyxDQUFDOztBQUM5RCxNQUFJLElBQUksR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDOztBQUU5QixNQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDWixRQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsUUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFcEMsUUFBSSxLQUFLLEdBQUcsUUFBUSxFQUNsQixLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FDUixJQUFJLEtBQUssSUFBSSxPQUFPLEVBQ3ZCLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQ2Q7QUFDSCxVQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksRUFDNUIsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFBLElBQUssS0FBSyxHQUFHLFFBQVEsQ0FBQSxBQUFDLElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQSxBQUFDLENBQUMsQ0FBQzs7QUFFN0UsYUFBTyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxFQUMvQixLQUFLLEVBQUUsQ0FBQzs7QUFFVixhQUFPLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFD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YUFBYSxDQUFDO09BQ3RCOzs7O1NBMVpHLGFBQWE7R0FBUyxlQUFlOztBQTZaM0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3NjaGVkdWxpbmctcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBBdWRpb1RpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZVwiKTtcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHNvcnRlZEFycmF5LCB2YWx1ZSwgaW5kZXggPSAwKSB7XG4gIHZhciBzaXplID0gc29ydGVkQXJyYXkubGVuZ3RoO1xuXG4gIGlmIChzaXplID4gMCkge1xuICAgIHZhciBmaXJzdFZhbCA9IHNvcnRlZEFycmF5WzBdO1xuICAgIHZhciBsYXN0VmFsID0gc29ydGVkQXJyYXlbc2l6ZSAtIDFdO1xuXG4gICAgaWYgKHZhbHVlIDwgZmlyc3RWYWwpXG4gICAgICBpbmRleCA9IC0xO1xuICAgIGVsc2UgaWYgKHZhbHVlID49IGxhc3RWYWwpXG4gICAgICBpbmRleCA9IHNpemUgLSAxO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKVxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKHNpemUgLSAxKSAqICh2YWx1ZSAtIGZpcnN0VmFsKSAvIChsYXN0VmFsIC0gZmlyc3RWYWwpKTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4XSA+IHZhbHVlKVxuICAgICAgICBpbmRleC0tO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXggKyAxXSA8PSB2YWx1ZSlcbiAgICAgICAgaW5kZXgrKztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRPck5leHRJbmRleChzb3J0ZWRBcnJheSwgdmFsdWUsIGluZGV4ID0gMCkge1xuICB2YXIgc2l6ZSA9IHNvcnRlZEFycmF5Lmxlbmd0aDtcblxuICBpZiAoc2l6ZSA+IDApIHtcbiAgICB2YXIgZmlyc3RWYWwgPSBzb3J0ZWRBcnJheVswXTtcbiAgICB2YXIgbGFzdFZhbCA9IHNvcnRlZEFycmF5W3NpemUgLSAxXTtcblxuICAgIGlmICh2YWx1ZSA8PSBmaXJzdFZhbClcbiAgICAgIGluZGV4ID0gMDtcbiAgICBlbHNlIGlmICh2YWx1ZSA+PSBsYXN0VmFsKVxuICAgICAgaW5kZXggPSBzaXplO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKVxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKHNpemUgLSAxKSAqICh2YWx1ZSAtIGZpcnN0VmFsKSAvIChsYXN0VmFsIC0gZmlyc3RWYWwpKTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4XSA8IHZhbHVlKVxuICAgICAgICBpbmRleCsrO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXggKyAxXSA+PSB2YWx1ZSlcbiAgICAgICAgaW5kZXgtLTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59XG5cbi8qKlxuICogQGNsYXNzIFNlZ21lbnRFbmdpbmVcbiAqL1xuY2xhc3MgU2VnbWVudEVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gYnVmZmVyIGluaXRpYWwgYXVkaW8gYnVmZmVyIGZvciBncmFudWxhciBzeW50aGVzaXNcbiAgICpcbiAgICogVGhlIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBcInNjaGVkdWxlZFwiIGFuZCBcInRyYW5zcG9ydGVkXCIgaW50ZXJmYWNlcy5cbiAgICogV2hlbiBcInNjaGVkdWxlZFwiLCB0aGUgZW5naW5lICBnZW5lcmF0ZXMgc2VnbWVudHMgbW9yZSBvciBsZXNzwqBwZXJpb2RpY2FsbHlcbiAgICogKGNvbnRyb2xsZWQgYnkgdGhlIHBlcmlvZEFicywgcGVyaW9kUmVsLCBhbmQgcGVyaW9WYXIgYXR0cmlidXRlcykuXG4gICAqIFdoZW4gXCJ0cmFuc3BvcnRlZFwiLCB0aGUgZW5naW5lIGdlbmVyYXRlcyBzZWdtZW50cyBhdCB0aGUgcG9zaXRpb24gb2YgdGhlaXIgb25zZXQgdGltZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdE9yRGVmKG9wdGlvbnMuYnVmZmVyLCBudWxsKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgcGVyaW9kIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RBYnMgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZEFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHBlcmlvZCByZWxhdGl2ZSB0byBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kUmVsLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmUgdG8gc2VnbWVudCBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBwb3NpdGlvbnMgKG9uc2V0IHRpbWVzIGluIGF1ZGlvIGJ1ZmZlcikgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uQXJyYXkgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uQXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25WYXIgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHNlZ21lbnQgZHVyYXRpb25zIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFycmF5LCBbMC4wXSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFicyA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBkdXJhdGlvbiByZWxhdGl2ZSB0byBnaXZlbiBzZWdtZW50IGR1cmF0aW9uIG9yIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25SZWwgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uUmVsLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHNlZ21lbnQgb2Zmc2V0cyBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqXG4gICAgICogb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgKiBvZmZzZXQgPCAwOiB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvbiBpcyB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBhbmQgdGhlIGR1cmF0aW9uIGhhcyB0byBiZSBjb3JyZWN0ZWQgYnkgdGhlIG9mZnNldFxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0QXJyYXkgPSBvcHRPckRlZihvcHRpb25zLm9mZnNldEFycmF5LCBbMC4wXSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBzZWdtZW50IG9mZnNldCBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0QWJzID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRBYnMsIC0wLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IG9mZnNldCByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0UmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFRpbWUgYnkgd2hpY2ggYWxsIHNlZ21lbnRzIGFyZSBkZWxheWVkIChlc3BlY2lhbGx5IHRvIHJlYWxpemUgc2VnbWVudCBvZmZzZXRzKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kZWxheSA9IG9wdE9yRGVmKG9wdGlvbnMuZGVsYXksIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tBYnMgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja0FicywgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNrIHRpbWUgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tSZWwgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1JlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VBYnMgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VBYnMsIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VSZWwgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCByZXNhbXBsaW5nIGluIGNlbnRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5nYWluID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEluZGV4IG9mIHRoZSBzZWdtZW50IHRvIHN5bnRoZXNpemUgKGkuZS4gb2YgdGhpcy5wb3NpdGlvbkFycmF5L2R1cmF0aW9uQXJyYXkvb2Zmc2V0QXJyYXkpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IG9wdE9yRGVmKG9wdGlvbnMuc2VnbWVudEluZGV4LCAwKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgc2VnbWVudCBpbmRpY2VzIGFyZSBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgICAqIEB0eXBlIHtCb29sfVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gMDtcblxuICAgIC8qKlxuICAgICAqIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyIHRoYXQgaGFzIGJlZW4gY29waWVkIGZyb20gdGhlIGJlZ2lubmluZyB0byBhc3N1cmUgY3ljbGljIGJlaGF2aW9yXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgYnVmZmVyIGR1cmF0aW9uXG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uO1xuXG4gICAgICByZXR1cm4gYnVmZmVyRHVyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcbiAgICB2YXIgY3ljbGljT2Zmc2V0ID0gMDtcbiAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICB2YXIgY3ljbGVzID0gcG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgY3ljbGljT2Zmc2V0ID0gTWF0aC5mbG9vcihjeWNsZXMpICogYnVmZmVyRHVyYXRpb247XG4gICAgICBwb3NpdGlvbiAtPSBjeWNsaWNPZmZzZXQ7XG4gICAgfVxuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaW5kZXggPSBnZXRDdXJyZW50T3JOZXh0SW5kZXgodGhpcy5wb3NpdGlvbkFycmF5LCBwb3NpdGlvbik7XG5cbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgY3ljbGljT2Zmc2V0ICs9IGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBpbmRleCA9IGdldEN1cnJlbnRPclByZXZpb3VzSW5kZXgodGhpcy5wb3NpdGlvbkFycmF5LCBwb3NpdGlvbik7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgY3ljbGljT2Zmc2V0IC09IGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIC1JbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgIH1cblxuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IGN5Y2xpY09mZnNldDtcblxuICAgIHJldHVybiBjeWNsaWNPZmZzZXQgKyB0aGlzLnBvc2l0aW9uQXJyYXlbaW5kZXhdO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc2VnbWVudEluZGV4O1xuICAgIHZhciBjeWNsaWNPZmZzZXQgPSB0aGlzLl9fY3ljbGljT2Zmc2V0O1xuXG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaW5kZXgrKztcblxuICAgICAgaWYgKGluZGV4ID49IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBjeWNsaWNPZmZzZXQgKz0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZXgtLTtcblxuICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCA9IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBjeWNsaWNPZmZzZXQgLT0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gY3ljbGljT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGN5Y2xpY09mZnNldCArIHRoaXMucG9zaXRpb25BcnJheVtpbmRleF07XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIHNlZ21lbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgc2VnbWVudCBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHBlcmlvZCB0byBuZXh0IHNlZ21lbnRcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGF0IGFueSB0aW1lICh3aGV0aGVyIHRoZSBlbmdpbmUgaXMgc2NoZWR1bGVkL3RyYW5zcG9ydGVkIG9yIG5vdClcbiAgICogdG8gZ2VuZXJhdGUgYSBzaW5nbGUgc2VnbWVudCBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgc2VnbWVudCBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBzZWdtZW50VGltZSA9ICh0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSkgKyB0aGlzLmRlbGF5O1xuICAgIHZhciBzZWdtZW50UGVyaW9kID0gdGhpcy5wZXJpb2RBYnM7XG4gICAgdmFyIHNlZ21lbnRJbmRleCA9IHRoaXMuc2VnbWVudEluZGV4O1xuIFxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIHNlZ21lbnRQb3NpdGlvbiA9IDAuMDtcbiAgICAgIHZhciBzZWdtZW50RHVyYXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudE9mZnNldCA9IDAuMDtcbiAgICAgIHZhciByZXNhbXBsaW5nUmF0ZSA9IDEuMDtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLmN5Y2xpYylcbiAgICAgICAgc2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4ICUgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aDtcbiAgICAgIGVsc2VcbiAgICAgICAgc2VnbWVudEluZGV4ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2VnbWVudEluZGV4LCB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMSkpO1xuXG4gICAgICBpZiAodGhpcy5wb3NpdGlvbkFycmF5KVxuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uQXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICBpZiAodGhpcy5kdXJhdGlvbkFycmF5KVxuICAgICAgICBzZWdtZW50RHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uQXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICBpZiAodGhpcy5vZmZzZXRBcnJheSlcbiAgICAgICAgc2VnbWVudE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzYW1wbGluZ1xuICAgICAgaWYgKHRoaXMucmVzYW1wbGluZyAhPT0gMCB8fCB0aGlzLnJlc2FtcGxpbmdWYXIgPiAwKSB7XG4gICAgICAgIHZhciByYW5kb21SZXNhbXBsaW5nID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMi4wICogdGhpcy5yZXNhbXBsaW5nVmFyO1xuICAgICAgICByZXNhbXBsaW5nUmF0ZSA9IE1hdGgucG93KDIuMCwgKHRoaXMucmVzYW1wbGluZyArIHJhbmRvbVJlc2FtcGxpbmcpIC8gMTIwMC4wKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FsY3VsYXRlIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgIGlmIChzZWdtZW50RHVyYXRpb24gPT09IDAgfHwgdGhpcy5wZXJpb2RSZWwgPiAwKSB7XG4gICAgICAgIHZhciBuZXh0U2VnZW1lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24sIG5leHRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG5leHRTZWdlbWVudEluZGV4ID09PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uQXJyYXlbMF0gKyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgICAgIG5leHRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5WzBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXh0UG9zaXRpb24gPSBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgICAgIG5leHRPZmZzZXQgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uQXJyYXlbbmV4dFNlZ2VtZW50SW5kZXhdO1xuICAgICAgICAgIG5leHRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W25leHRTZWdlbWVudEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbnRlclNlZ21lbnREaXN0YW5jZSA9IG5leHRQb3NpdGlvbiAtIHNlZ21lbnRQb3NpdGlvbjtcblxuICAgICAgICAvLyBjb3JyZWN0IGludGVyLXNlZ21lbnQgZGlzdGFuY2UgYnkgb2Zmc2V0c1xuICAgICAgICAvLyAgIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICAgIGlmIChzZWdtZW50T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSAtPSBzZWdtZW50T2Zmc2V0O1xuXG4gICAgICAgIGlmIChuZXh0T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSArPSBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIGlmIChpbnRlclNlZ21lbnREaXN0YW5jZSA8IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgPSAwO1xuXG4gICAgICAgIC8vIHVzZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlIGluc3RlYWQgb2Ygc2VnbWVudCBkdXJhdGlvblxuICAgICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwKVxuICAgICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IGludGVyU2VnbWVudERpc3RhbmNlO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXIgbWFya2VyIGRpc3RhbmNlXG4gICAgICAgIHNlZ21lbnRQZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBpbnRlclNlZ21lbnREaXN0YW5jZTtcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uXG4gICAgICBzZWdtZW50RHVyYXRpb24gKj0gdGhpcy5kdXJhdGlvblJlbDtcbiAgICAgIHNlZ21lbnREdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgICAvLyBhZGQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHNlZ21lbnQgb2Zmc2V0XG4gICAgICBzZWdtZW50T2Zmc2V0ICo9IHRoaXMub2Zmc2V0UmVsO1xuICAgICAgc2VnbWVudE9mZnNldCArPSB0aGlzLm9mZnNldEFicztcblxuICAgICAgLy8gYXBwbHkgc2VnbWVudCBvZmZzZXRcbiAgICAgIC8vICAgb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgIC8vICAgb2Zmc2V0IDwgMDogdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb24gaXMgdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgIGlmIChzZWdtZW50T2Zmc2V0IDwgMCkge1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gLT0gc2VnbWVudE9mZnNldDtcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uICs9IHNlZ21lbnRPZmZzZXQ7XG4gICAgICAgIHNlZ21lbnRUaW1lICs9IChzZWdtZW50T2Zmc2V0IC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudFRpbWUgLT0gKHNlZ21lbnRPZmZzZXQgLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBzZWdtZW50IHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICAvLyBzaG9ydGVuIGR1cmF0aW9uIG9mIHNlZ21lbnRzIG92ZXIgdGhlIGVkZ2VzIG9mIHRoZSBidWZmZXJcbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gPCAwKSB7XG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiArPSBzZWdtZW50UG9zaXRpb247XG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gKyBzZWdtZW50RHVyYXRpb24gPiB0aGlzLmJ1ZmZlci5kdXJhdGlvbilcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb24gLSBzZWdtZW50UG9zaXRpb247XG5cbiAgICAgIC8vIG1ha2Ugc2VnbWVudFxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgc2VnbWVudER1cmF0aW9uID4gMCkge1xuICAgICAgICAvLyBtYWtlIHNlZ21lbnQgZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdmFyIGF0dGFjayA9IHRoaXMuYXR0YWNrQWJzICsgdGhpcy5hdHRhY2tSZWwgKiBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlID0gdGhpcy5yZWxlYXNlQWJzICsgdGhpcy5yZWxlYXNlUmVsICogc2VnbWVudER1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gc2VnbWVudER1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIGZhY3RvciA9IHNlZ21lbnREdXJhdGlvbiAvIChhdHRhY2sgKyByZWxlYXNlKTtcbiAgICAgICAgICBhdHRhY2sgKj0gZmFjdG9yO1xuICAgICAgICAgIHJlbGVhc2UgKj0gZmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGFja0VuZFRpbWUgPSBzZWdtZW50VGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIHNlZ21lbnRFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gc2VnbWVudEVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBzZWdtZW50VGltZSk7XG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcblxuICAgICAgICBpZiAocmVsZWFzZVN0YXJ0VGltZSA+IGF0dGFja0VuZFRpbWUpXG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmdhaW4sIHJlbGVhc2VTdGFydFRpbWUpO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBzZWdtZW50RW5kVGltZSk7XG4gICAgICAgIGVudmVsb3BlLmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgICAgICAvLyBtYWtlIHNvdXJjZVxuICAgICAgICB2YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChlbnZlbG9wZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KHNlZ21lbnRUaW1lLCBzZWdtZW50UG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChzZWdtZW50VGltZSArIHNlZ21lbnREdXJhdGlvbiAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VnbWVudFBlcmlvZDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlZ21lbnRFbmdpbmU7Il19