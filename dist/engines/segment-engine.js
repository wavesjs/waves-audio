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

function getCurrentOrPreviousIndex(sortedArray, value) {
  var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value < firstVal) index = -1;else if (value >= lastVal) index = size - 1;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] > value) {
        index--;
      }while (sortedArray[index + 1] <= value) {
        index++;
      }
    }
  }

  return index;
}

function getCurrentOrNextIndex(sortedArray, value) {
  var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value <= firstVal) index = 0;else if (value >= lastVal) index = size;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] < value) {
        index++;
      }while (sortedArray[index + 1] >= value) {
        index--;
      }
    }
  }

  return index;
}

/**
 * @class SegmentEngine
 */

var SegmentEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(SegmentEngine, _AudioTimeEngine);

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
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, SegmentEngine);


    /**
     * Audio buffer
     * @type {AudioBuffer}
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SegmentEngine).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute segment period in sec
     * @type {Number}
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0);

    /**
     * Segment period relative to inter-segment distance
     * @type {Number}
     */
    _this.periodRel = optOrDef(options.periodRel, 1);

    /**
     * Amout of random segment period variation relative to segment period
     * @type {Number}
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @type {Number}
     */
    _this.positionArray = optOrDef(options.positionArray, [0.0]);

    /**
     * Amout of random segment position variation in sec
     * @type {Number}
     */
    _this.positionVar = optOrDef(options.positionVar, 0);

    /**
     * Array of segment durations in sec
     * @type {Number}
     */
    _this.durationArray = optOrDef(options.durationArray, [0.0]);

    /**
     * Absolute segment duration in sec
     * @type {Number}
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0);

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @type {Number}
     */
    _this.durationRel = optOrDef(options.durationRel, 1);

    /**
     * Array of segment offsets in sec
     * @type {Number}
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
     */
    _this.offsetArray = optOrDef(options.offsetArray, [0.0]);

    /**
     * Absolute segment offset in sec
     * @type {Number}
     */
    _this.offsetAbs = optOrDef(options.offsetAbs, -0.005);

    /**
     * Segment offset relative to segment duration
     * @type {Number}
     */
    _this.offsetRel = optOrDef(options.offsetRel, 0);

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @type {Number}
     */
    _this.delay = optOrDef(options.delay, 0.005);

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0.005);

    /**
     * Attack time relative to segment duration
     * @type {Number}
     */
    _this.attackRel = optOrDef(options.attackRel, 0);

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0.005);

    /**
     * Release time relative to segment duration
     * @type {Number}
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0);

    /**
     * Segment resampling in cent
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
     * Index of the segment to synthesize (i.e. of this.positionArray/durationArray/offsetArray)
     * @type {Number}
     */
    _this.segmentIndex = optOrDef(options.segmentIndex, 0);

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @type {Bool}
     */
    _this.cyclic = optOrDef(options.cyclic, false);
    _this.__cyclicOffset = 0;

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


  (0, _createClass3.default)(SegmentEngine, [{
    key: 'advanceTime',


    // TimeEngine method (transported interface)
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'syncPosition',
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

          if (!this.cyclic) return Infinity;
        }
      } else if (speed < 0) {
        index = getCurrentOrPreviousIndex(this.positionArray, position);

        if (index < 0) {
          index = this.positionArray.length - 1;
          cyclicOffset -= bufferDuration;

          if (!this.cyclic) return -Infinity;
        }
      } else {
        return Infinity;
      }

      this.segmentIndex = index;
      this.__cyclicOffset = cyclicOffset;

      return cyclicOffset + this.positionArray[index];
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var index = this.segmentIndex;
      var cyclicOffset = this.__cyclicOffset;

      this.trigger(time);

      if (speed > 0) {
        index++;

        if (index >= this.positionArray.length) {
          index = 0;
          cyclicOffset += this.bufferDuration;

          if (!this.cyclic) return Infinity;
        }
      } else {
        index--;

        if (index < 0) {
          index = this.positionArray.length - 1;
          cyclicOffset -= this.bufferDuration;

          if (!this.cyclic) return -Infinity;
        }
      }

      this.segmentIndex = index;
      this.__cyclicOffset = cyclicOffset;

      return cyclicOffset + this.positionArray[index];
    }

    /**
     * Trigger a segment
     * @param {Number} time segment synthesis audio time
     * @return {Number} period to next segment
     *
     * This function can be called at any time (whether the engine is scheduled/transported or not)
     * to generate a single segment according to the current segment parameters.
     */

  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var segmentTime = (time || audioContext.currentTime) + this.delay;
      var segmentPeriod = this.periodAbs;
      var segmentIndex = this.segmentIndex;

      if (this.buffer) {
        var segmentPosition = 0.0;
        var segmentDuration = 0.0;
        var segmentOffset = 0.0;
        var resamplingRate = 1.0;
        var bufferDuration = this.bufferDuration;

        if (this.cyclic) segmentIndex = segmentIndex % this.positionArray.length;else segmentIndex = Math.max(0, Math.min(segmentIndex, this.positionArray.length - 1));

        if (this.positionArray) segmentPosition = this.positionArray[segmentIndex] || 0;

        if (this.durationArray) segmentDuration = this.durationArray[segmentIndex] || 0;

        if (this.offsetArray) segmentOffset = this.offsetArray[segmentIndex] || 0;

        // calculate resampling
        if (this.resampling !== 0 || this.resamplingVar > 0) {
          var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
          resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
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
        if (this.positionVar > 0) segmentPosition += 2.0 * (Math.random() - 0.5) * this.positionVar;

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

          envelope.gain.setValueAtTime(0.0, segmentTime);
          envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);

          if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

          envelope.gain.linearRampToValueAtTime(0.0, segmentEndTime);
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
  }]);
  return SegmentEngine;
}(_audioTimeEngine2.default);

exports.default = SegmentEngine;
//# sourceMappingURL=data:application/json;base64,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QixDQWpDd0M7U0FBMUM7T0FuR0Y7O0FBd0lBLGFBQU8sYUFBUCxDQTlJWTs7Ozt3QkF6R087QUFDbkIsVUFBSSxLQUFLLE1BQUwsRUFBYTtBQUNmLFlBQUksaUJBQWlCLEtBQUssTUFBTCxDQUFZLFFBQVosQ0FETjs7QUFHZixZQUFJLEtBQUssbUJBQUwsRUFDRixrQkFBa0IsS0FBSyxtQkFBTCxDQURwQjs7QUFHQSxlQUFPLGNBQVAsQ0FOZTtPQUFqQjs7QUFTQSxhQUFPLENBQVAsQ0FWbUI7OztTQWxLRiIsImZpbGUiOiJzZWdtZW50LWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZSc7XG5cbmZ1bmN0aW9uIG9wdE9yRGVmKG9wdCwgZGVmKSB7XG4gIGlmKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudE9yUHJldmlvdXNJbmRleChzb3J0ZWRBcnJheSwgdmFsdWUsIGluZGV4ID0gMCkge1xuICB2YXIgc2l6ZSA9IHNvcnRlZEFycmF5Lmxlbmd0aDtcblxuICBpZiAoc2l6ZSA+IDApIHtcbiAgICB2YXIgZmlyc3RWYWwgPSBzb3J0ZWRBcnJheVswXTtcbiAgICB2YXIgbGFzdFZhbCA9IHNvcnRlZEFycmF5W3NpemUgLSAxXTtcblxuICAgIGlmICh2YWx1ZSA8IGZpcnN0VmFsKVxuICAgICAgaW5kZXggPSAtMTtcbiAgICBlbHNlIGlmICh2YWx1ZSA+PSBsYXN0VmFsKVxuICAgICAgaW5kZXggPSBzaXplIC0gMTtcbiAgICBlbHNlIHtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gc2l6ZSlcbiAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKChzaXplIC0gMSkgKiAodmFsdWUgLSBmaXJzdFZhbCkgLyAobGFzdFZhbCAtIGZpcnN0VmFsKSk7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleF0gPiB2YWx1ZSlcbiAgICAgICAgaW5kZXgtLTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4ICsgMV0gPD0gdmFsdWUpXG4gICAgICAgIGluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50T3JOZXh0SW5kZXgoc29ydGVkQXJyYXksIHZhbHVlLCBpbmRleCA9IDApIHtcbiAgdmFyIHNpemUgPSBzb3J0ZWRBcnJheS5sZW5ndGg7XG5cbiAgaWYgKHNpemUgPiAwKSB7XG4gICAgdmFyIGZpcnN0VmFsID0gc29ydGVkQXJyYXlbMF07XG4gICAgdmFyIGxhc3RWYWwgPSBzb3J0ZWRBcnJheVtzaXplIC0gMV07XG5cbiAgICBpZiAodmFsdWUgPD0gZmlyc3RWYWwpXG4gICAgICBpbmRleCA9IDA7XG4gICAgZWxzZSBpZiAodmFsdWUgPj0gbGFzdFZhbClcbiAgICAgIGluZGV4ID0gc2l6ZTtcbiAgICBlbHNlIHtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gc2l6ZSlcbiAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKChzaXplIC0gMSkgKiAodmFsdWUgLSBmaXJzdFZhbCkgLyAobGFzdFZhbCAtIGZpcnN0VmFsKSk7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleF0gPCB2YWx1ZSlcbiAgICAgICAgaW5kZXgrKztcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4ICsgMV0gPj0gdmFsdWUpXG4gICAgICAgIGluZGV4LS07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluZGV4O1xufVxuXG4vKipcbiAqIEBjbGFzcyBTZWdtZW50RW5naW5lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlZ21lbnRFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICAvKipcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7QXVkaW9CdWZmZXJ9IGJ1ZmZlciBpbml0aWFsIGF1ZGlvIGJ1ZmZlciBmb3IgZ3JhbnVsYXIgc3ludGhlc2lzXG4gICAqXG4gICAqIFRoZSBlbmdpbmUgaW1wbGVtZW50cyB0aGUgXCJzY2hlZHVsZWRcIiBhbmQgXCJ0cmFuc3BvcnRlZFwiIGludGVyZmFjZXMuXG4gICAqIFdoZW4gXCJzY2hlZHVsZWRcIiwgdGhlIGVuZ2luZSAgZ2VuZXJhdGVzIHNlZ21lbnRzIG1vcmUgb3IgbGVzc8KgcGVyaW9kaWNhbGx5XG4gICAqIChjb250cm9sbGVkIGJ5IHRoZSBwZXJpb2RBYnMsIHBlcmlvZFJlbCwgYW5kIHBlcmlvVmFyIGF0dHJpYnV0ZXMpLlxuICAgKiBXaGVuIFwidHJhbnNwb3J0ZWRcIiwgdGhlIGVuZ2luZSBnZW5lcmF0ZXMgc2VnbWVudHMgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZWlyIG9uc2V0IHRpbWUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBzZWdtZW50IHBlcmlvZCBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kQWJzID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RBYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RSZWwgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFJlbCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gc2VnbWVudCBwZXJpb2QgdmFyaWF0aW9uIHJlbGF0aXZlIHRvIHNlZ21lbnQgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFZhciA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHNlZ21lbnQgcG9zaXRpb25zIChvbnNldCB0aW1lcyBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvbkFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvbkFycmF5LCBbMC4wXSk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gc2VnbWVudCBwb3NpdGlvbiB2YXJpYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvblZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IGR1cmF0aW9ucyBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBkdXJhdGlvbiBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BYnMgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgZHVyYXRpb24gcmVsYXRpdmUgdG8gZ2l2ZW4gc2VnbWVudCBkdXJhdGlvbiBvciBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uUmVsID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvblJlbCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IG9mZnNldHMgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKlxuICAgICAqIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICogb2Zmc2V0IDwgMDogdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb24gaXMgdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldEFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRBcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBvZmZzZXQgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldEFicyA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0QWJzLCAtMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBvZmZzZXQgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRSZWwgPSBvcHRPckRlZihvcHRpb25zLm9mZnNldFJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBUaW1lIGJ5IHdoaWNoIGFsbCBzZWdtZW50cyBhcmUgZGVsYXllZCAoZXNwZWNpYWxseSB0byByZWFsaXplIHNlZ21lbnQgb2Zmc2V0cylcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZGVsYXkgPSBvcHRPckRlZihvcHRpb25zLmRlbGF5LCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrQWJzID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tBYnMsIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrUmVsID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgcmVsZWFzZSB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlQWJzID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlQWJzLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlUmVsID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgcmVzYW1wbGluZyBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmcgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmcsIDApO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZ1ZhciA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZ1ZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZ2FpbiA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBJbmRleCBvZiB0aGUgc2VnbWVudCB0byBzeW50aGVzaXplIChpLmUuIG9mIHRoaXMucG9zaXRpb25BcnJheS9kdXJhdGlvbkFycmF5L29mZnNldEFycmF5KVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBvcHRPckRlZihvcHRpb25zLnNlZ21lbnRJbmRleCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIHNlZ21lbnQgaW5kaWNlcyBhcmUgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKi9cbiAgICB0aGlzLmN5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBQb3J0aW9uIGF0IHRoZSBlbmQgb2YgdGhlIGF1ZGlvIGJ1ZmZlciB0aGF0IGhhcyBiZWVuIGNvcGllZCBmcm9tIHRoZSBiZWdpbm5pbmcgdG8gYXNzdXJlIGN5Y2xpYyBiZWhhdmlvclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uID0gb3B0T3JEZWYob3B0aW9ucy53cmFwQXJvdW5kRXh0ZW5zaW9uLCAwKTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYnVmZmVyIGR1cmF0aW9uIChleGNsdWRpbmcgd3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGJ1ZmZlciBkdXJhdGlvblxuICAgKi9cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLndyYXBBcm91bmRFeHRlbnNpb24pXG4gICAgICAgIGJ1ZmZlckR1cmF0aW9uIC09IHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbjtcblxuICAgICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnRyaWdnZXIodGltZSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG4gICAgdmFyIGN5Y2xpY09mZnNldCA9IDA7XG4gICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgdmFyIGN5Y2xlcyA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIGN5Y2xpY09mZnNldCA9IE1hdGguZmxvb3IoY3ljbGVzKSAqIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgcG9zaXRpb24gLT0gY3ljbGljT2Zmc2V0O1xuICAgIH1cblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4ID0gZ2V0Q3VycmVudE9yTmV4dEluZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPj0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIGN5Y2xpY09mZnNldCArPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgaW5kZXggPSBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgIGN5Y2xpY09mZnNldCAtPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICB9XG5cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSBjeWNsaWNPZmZzZXQ7XG5cbiAgICByZXR1cm4gY3ljbGljT2Zmc2V0ICsgdGhpcy5wb3NpdGlvbkFycmF5W2luZGV4XTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcbiAgICB2YXIgY3ljbGljT2Zmc2V0ID0gdGhpcy5fX2N5Y2xpY09mZnNldDtcblxuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4Kys7XG5cbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgY3ljbGljT2Zmc2V0ICs9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4LS07XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgY3ljbGljT2Zmc2V0IC09IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gLUluZmluaXR5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IGN5Y2xpY09mZnNldDtcblxuICAgIHJldHVybiBjeWNsaWNPZmZzZXQgKyB0aGlzLnBvc2l0aW9uQXJyYXlbaW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBzZWdtZW50XG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHNlZ21lbnQgc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBwZXJpb2QgdG8gbmV4dCBzZWdtZW50XG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCBhdCBhbnkgdGltZSAod2hldGhlciB0aGUgZW5naW5lIGlzIHNjaGVkdWxlZC90cmFuc3BvcnRlZCBvciBub3QpXG4gICAqIHRvIGdlbmVyYXRlIGEgc2luZ2xlIHNlZ21lbnQgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHNlZ21lbnQgcGFyYW1ldGVycy5cbiAgICovXG4gIHRyaWdnZXIodGltZSkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgc2VnbWVudFRpbWUgPSAodGltZSB8fCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpICsgdGhpcy5kZWxheTtcbiAgICB2YXIgc2VnbWVudFBlcmlvZCA9IHRoaXMucGVyaW9kQWJzO1xuICAgIHZhciBzZWdtZW50SW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIHNlZ21lbnRQb3NpdGlvbiA9IDAuMDtcbiAgICAgIHZhciBzZWdtZW50RHVyYXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudE9mZnNldCA9IDAuMDtcbiAgICAgIHZhciByZXNhbXBsaW5nUmF0ZSA9IDEuMDtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLmN5Y2xpYylcbiAgICAgICAgc2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4ICUgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aDtcbiAgICAgIGVsc2VcbiAgICAgICAgc2VnbWVudEluZGV4ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2VnbWVudEluZGV4LCB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMSkpO1xuXG4gICAgICBpZiAodGhpcy5wb3NpdGlvbkFycmF5KVxuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uQXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICBpZiAodGhpcy5kdXJhdGlvbkFycmF5KVxuICAgICAgICBzZWdtZW50RHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uQXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICBpZiAodGhpcy5vZmZzZXRBcnJheSlcbiAgICAgICAgc2VnbWVudE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzYW1wbGluZ1xuICAgICAgaWYgKHRoaXMucmVzYW1wbGluZyAhPT0gMCB8fCB0aGlzLnJlc2FtcGxpbmdWYXIgPiAwKSB7XG4gICAgICAgIHZhciByYW5kb21SZXNhbXBsaW5nID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMi4wICogdGhpcy5yZXNhbXBsaW5nVmFyO1xuICAgICAgICByZXNhbXBsaW5nUmF0ZSA9IE1hdGgucG93KDIuMCwgKHRoaXMucmVzYW1wbGluZyArIHJhbmRvbVJlc2FtcGxpbmcpIC8gMTIwMC4wKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FsY3VsYXRlIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgIGlmIChzZWdtZW50RHVyYXRpb24gPT09IDAgfHwgdGhpcy5wZXJpb2RSZWwgPiAwKSB7XG4gICAgICAgIHZhciBuZXh0U2VnZW1lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24sIG5leHRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG5leHRTZWdlbWVudEluZGV4ID09PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uQXJyYXlbMF0gKyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgICAgIG5leHRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5WzBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXh0UG9zaXRpb24gPSBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgICAgIG5leHRPZmZzZXQgPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uQXJyYXlbbmV4dFNlZ2VtZW50SW5kZXhdO1xuICAgICAgICAgIG5leHRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W25leHRTZWdlbWVudEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbnRlclNlZ21lbnREaXN0YW5jZSA9IG5leHRQb3NpdGlvbiAtIHNlZ21lbnRQb3NpdGlvbjtcblxuICAgICAgICAvLyBjb3JyZWN0IGludGVyLXNlZ21lbnQgZGlzdGFuY2UgYnkgb2Zmc2V0c1xuICAgICAgICAvLyAgIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICAgIGlmIChzZWdtZW50T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSAtPSBzZWdtZW50T2Zmc2V0O1xuXG4gICAgICAgIGlmIChuZXh0T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSArPSBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIGlmIChpbnRlclNlZ21lbnREaXN0YW5jZSA8IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgPSAwO1xuXG4gICAgICAgIC8vIHVzZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlIGluc3RlYWQgb2Ygc2VnbWVudCBkdXJhdGlvblxuICAgICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwKVxuICAgICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IGludGVyU2VnbWVudERpc3RhbmNlO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXIgbWFya2VyIGRpc3RhbmNlXG4gICAgICAgIHNlZ21lbnRQZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBpbnRlclNlZ21lbnREaXN0YW5jZTtcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uXG4gICAgICBzZWdtZW50RHVyYXRpb24gKj0gdGhpcy5kdXJhdGlvblJlbDtcbiAgICAgIHNlZ21lbnREdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgICAvLyBhZGQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHNlZ21lbnQgb2Zmc2V0XG4gICAgICBzZWdtZW50T2Zmc2V0ICo9IHRoaXMub2Zmc2V0UmVsO1xuICAgICAgc2VnbWVudE9mZnNldCArPSB0aGlzLm9mZnNldEFicztcblxuICAgICAgLy8gYXBwbHkgc2VnbWVudCBvZmZzZXRcbiAgICAgIC8vICAgb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgIC8vICAgb2Zmc2V0IDwgMDogdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb24gaXMgdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgIGlmIChzZWdtZW50T2Zmc2V0IDwgMCkge1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gLT0gc2VnbWVudE9mZnNldDtcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uICs9IHNlZ21lbnRPZmZzZXQ7XG4gICAgICAgIHNlZ21lbnRUaW1lICs9IChzZWdtZW50T2Zmc2V0IC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudFRpbWUgLT0gKHNlZ21lbnRPZmZzZXQgLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBzZWdtZW50IHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICAvLyBzaG9ydGVuIGR1cmF0aW9uIG9mIHNlZ21lbnRzIG92ZXIgdGhlIGVkZ2VzIG9mIHRoZSBidWZmZXJcbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gPCAwKSB7XG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiArPSBzZWdtZW50UG9zaXRpb247XG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gKyBzZWdtZW50RHVyYXRpb24gPiB0aGlzLmJ1ZmZlci5kdXJhdGlvbilcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb24gLSBzZWdtZW50UG9zaXRpb247XG5cbiAgICAgIC8vIG1ha2Ugc2VnbWVudFxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgc2VnbWVudER1cmF0aW9uID4gMCkge1xuICAgICAgICAvLyBtYWtlIHNlZ21lbnQgZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdmFyIGF0dGFjayA9IHRoaXMuYXR0YWNrQWJzICsgdGhpcy5hdHRhY2tSZWwgKiBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlID0gdGhpcy5yZWxlYXNlQWJzICsgdGhpcy5yZWxlYXNlUmVsICogc2VnbWVudER1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gc2VnbWVudER1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIGZhY3RvciA9IHNlZ21lbnREdXJhdGlvbiAvIChhdHRhY2sgKyByZWxlYXNlKTtcbiAgICAgICAgICBhdHRhY2sgKj0gZmFjdG9yO1xuICAgICAgICAgIHJlbGVhc2UgKj0gZmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGFja0VuZFRpbWUgPSBzZWdtZW50VGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIHNlZ21lbnRFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gc2VnbWVudEVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBzZWdtZW50VGltZSk7XG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcblxuICAgICAgICBpZiAocmVsZWFzZVN0YXJ0VGltZSA+IGF0dGFja0VuZFRpbWUpXG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmdhaW4sIHJlbGVhc2VTdGFydFRpbWUpO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBzZWdtZW50RW5kVGltZSk7XG4gICAgICAgIGVudmVsb3BlLmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgICAgICAvLyBtYWtlIHNvdXJjZVxuICAgICAgICB2YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChlbnZlbG9wZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KHNlZ21lbnRUaW1lLCBzZWdtZW50UG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChzZWdtZW50VGltZSArIHNlZ21lbnREdXJhdGlvbiAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VnbWVudFBlcmlvZDtcbiAgfVxufVxuIl19