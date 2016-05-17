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

          envelope.gain.value = 0;
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
//# sourceMappingURL=data:application/json;base64,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QztBQWtDeEMsaUJBQU8sSUFBUCxDQUFZLGNBQWMsa0JBQWtCLGNBQWxCLENBQTFCLENBbEN3QztTQUExQztPQW5HRjs7QUF5SUEsYUFBTyxhQUFQLENBL0lZOzs7O3dCQXpHTztBQUNuQixVQUFJLEtBQUssTUFBTCxFQUFhO0FBQ2YsWUFBSSxpQkFBaUIsS0FBSyxNQUFMLENBQVksUUFBWixDQUROOztBQUdmLFlBQUksS0FBSyxtQkFBTCxFQUNGLGtCQUFrQixLQUFLLG1CQUFMLENBRHBCOztBQUdBLGVBQU8sY0FBUCxDQU5lO09BQWpCOztBQVNBLGFBQU8sQ0FBUCxDQVZtQjs7O1NBbEtGIiwiZmlsZSI6InNlZ21lbnQtZW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHNvcnRlZEFycmF5LCB2YWx1ZSwgaW5kZXggPSAwKSB7XG4gIHZhciBzaXplID0gc29ydGVkQXJyYXkubGVuZ3RoO1xuXG4gIGlmIChzaXplID4gMCkge1xuICAgIHZhciBmaXJzdFZhbCA9IHNvcnRlZEFycmF5WzBdO1xuICAgIHZhciBsYXN0VmFsID0gc29ydGVkQXJyYXlbc2l6ZSAtIDFdO1xuXG4gICAgaWYgKHZhbHVlIDwgZmlyc3RWYWwpXG4gICAgICBpbmRleCA9IC0xO1xuICAgIGVsc2UgaWYgKHZhbHVlID49IGxhc3RWYWwpXG4gICAgICBpbmRleCA9IHNpemUgLSAxO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKVxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKHNpemUgLSAxKSAqICh2YWx1ZSAtIGZpcnN0VmFsKSAvIChsYXN0VmFsIC0gZmlyc3RWYWwpKTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4XSA+IHZhbHVlKVxuICAgICAgICBpbmRleC0tO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXggKyAxXSA8PSB2YWx1ZSlcbiAgICAgICAgaW5kZXgrKztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRPck5leHRJbmRleChzb3J0ZWRBcnJheSwgdmFsdWUsIGluZGV4ID0gMCkge1xuICB2YXIgc2l6ZSA9IHNvcnRlZEFycmF5Lmxlbmd0aDtcblxuICBpZiAoc2l6ZSA+IDApIHtcbiAgICB2YXIgZmlyc3RWYWwgPSBzb3J0ZWRBcnJheVswXTtcbiAgICB2YXIgbGFzdFZhbCA9IHNvcnRlZEFycmF5W3NpemUgLSAxXTtcblxuICAgIGlmICh2YWx1ZSA8PSBmaXJzdFZhbClcbiAgICAgIGluZGV4ID0gMDtcbiAgICBlbHNlIGlmICh2YWx1ZSA+PSBsYXN0VmFsKVxuICAgICAgaW5kZXggPSBzaXplO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKVxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKHNpemUgLSAxKSAqICh2YWx1ZSAtIGZpcnN0VmFsKSAvIChsYXN0VmFsIC0gZmlyc3RWYWwpKTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4XSA8IHZhbHVlKVxuICAgICAgICBpbmRleCsrO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXggKyAxXSA+PSB2YWx1ZSlcbiAgICAgICAgaW5kZXgtLTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59XG5cbi8qKlxuICogQGNsYXNzIFNlZ21lbnRFbmdpbmVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VnbWVudEVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gYnVmZmVyIGluaXRpYWwgYXVkaW8gYnVmZmVyIGZvciBncmFudWxhciBzeW50aGVzaXNcbiAgICpcbiAgICogVGhlIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBcInNjaGVkdWxlZFwiIGFuZCBcInRyYW5zcG9ydGVkXCIgaW50ZXJmYWNlcy5cbiAgICogV2hlbiBcInNjaGVkdWxlZFwiLCB0aGUgZW5naW5lICBnZW5lcmF0ZXMgc2VnbWVudHMgbW9yZSBvciBsZXNzwqBwZXJpb2RpY2FsbHlcbiAgICogKGNvbnRyb2xsZWQgYnkgdGhlIHBlcmlvZEFicywgcGVyaW9kUmVsLCBhbmQgcGVyaW9WYXIgYXR0cmlidXRlcykuXG4gICAqIFdoZW4gXCJ0cmFuc3BvcnRlZFwiLCB0aGUgZW5naW5lIGdlbmVyYXRlcyBzZWdtZW50cyBhdCB0aGUgcG9zaXRpb24gb2YgdGhlaXIgb25zZXQgdGltZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdE9yRGVmKG9wdGlvbnMuYnVmZmVyLCBudWxsKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgcGVyaW9kIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RBYnMgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZEFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHBlcmlvZCByZWxhdGl2ZSB0byBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kUmVsLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmUgdG8gc2VnbWVudCBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBwb3NpdGlvbnMgKG9uc2V0IHRpbWVzIGluIGF1ZGlvIGJ1ZmZlcikgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uQXJyYXkgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uQXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25WYXIgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHNlZ21lbnQgZHVyYXRpb25zIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFycmF5LCBbMC4wXSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFicyA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBkdXJhdGlvbiByZWxhdGl2ZSB0byBnaXZlbiBzZWdtZW50IGR1cmF0aW9uIG9yIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25SZWwgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uUmVsLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHNlZ21lbnQgb2Zmc2V0cyBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqXG4gICAgICogb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgKiBvZmZzZXQgPCAwOiB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvbiBpcyB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBhbmQgdGhlIGR1cmF0aW9uIGhhcyB0byBiZSBjb3JyZWN0ZWQgYnkgdGhlIG9mZnNldFxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0QXJyYXkgPSBvcHRPckRlZihvcHRpb25zLm9mZnNldEFycmF5LCBbMC4wXSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBzZWdtZW50IG9mZnNldCBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0QWJzID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRBYnMsIC0wLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IG9mZnNldCByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0UmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFRpbWUgYnkgd2hpY2ggYWxsIHNlZ21lbnRzIGFyZSBkZWxheWVkIChlc3BlY2lhbGx5IHRvIHJlYWxpemUgc2VnbWVudCBvZmZzZXRzKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kZWxheSA9IG9wdE9yRGVmKG9wdGlvbnMuZGVsYXksIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tBYnMgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja0FicywgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNrIHRpbWUgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tSZWwgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1JlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VBYnMgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VBYnMsIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VSZWwgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCByZXNhbXBsaW5nIGluIGNlbnRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5nYWluID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEluZGV4IG9mIHRoZSBzZWdtZW50IHRvIHN5bnRoZXNpemUgKGkuZS4gb2YgdGhpcy5wb3NpdGlvbkFycmF5L2R1cmF0aW9uQXJyYXkvb2Zmc2V0QXJyYXkpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IG9wdE9yRGVmKG9wdGlvbnMuc2VnbWVudEluZGV4LCAwKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgc2VnbWVudCBpbmRpY2VzIGFyZSBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgICAqIEB0eXBlIHtCb29sfVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gMDtcblxuICAgIC8qKlxuICAgICAqIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyIHRoYXQgaGFzIGJlZW4gY29waWVkIGZyb20gdGhlIGJlZ2lubmluZyB0byBhc3N1cmUgY3ljbGljIGJlaGF2aW9yXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgYnVmZmVyIGR1cmF0aW9uXG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uO1xuXG4gICAgICByZXR1cm4gYnVmZmVyRHVyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcbiAgICB2YXIgY3ljbGljT2Zmc2V0ID0gMDtcbiAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICB2YXIgY3ljbGVzID0gcG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgY3ljbGljT2Zmc2V0ID0gTWF0aC5mbG9vcihjeWNsZXMpICogYnVmZmVyRHVyYXRpb247XG4gICAgICBwb3NpdGlvbiAtPSBjeWNsaWNPZmZzZXQ7XG4gICAgfVxuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaW5kZXggPSBnZXRDdXJyZW50T3JOZXh0SW5kZXgodGhpcy5wb3NpdGlvbkFycmF5LCBwb3NpdGlvbik7XG5cbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgY3ljbGljT2Zmc2V0ICs9IGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBpbmRleCA9IGdldEN1cnJlbnRPclByZXZpb3VzSW5kZXgodGhpcy5wb3NpdGlvbkFycmF5LCBwb3NpdGlvbik7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgY3ljbGljT2Zmc2V0IC09IGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIC1JbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgIH1cblxuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IGN5Y2xpY09mZnNldDtcblxuICAgIHJldHVybiBjeWNsaWNPZmZzZXQgKyB0aGlzLnBvc2l0aW9uQXJyYXlbaW5kZXhdO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc2VnbWVudEluZGV4O1xuICAgIHZhciBjeWNsaWNPZmZzZXQgPSB0aGlzLl9fY3ljbGljT2Zmc2V0O1xuXG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaW5kZXgrKztcblxuICAgICAgaWYgKGluZGV4ID49IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBjeWNsaWNPZmZzZXQgKz0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZXgtLTtcblxuICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCA9IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBjeWNsaWNPZmZzZXQgLT0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gY3ljbGljT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGN5Y2xpY09mZnNldCArIHRoaXMucG9zaXRpb25BcnJheVtpbmRleF07XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIHNlZ21lbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgc2VnbWVudCBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHBlcmlvZCB0byBuZXh0IHNlZ21lbnRcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGF0IGFueSB0aW1lICh3aGV0aGVyIHRoZSBlbmdpbmUgaXMgc2NoZWR1bGVkL3RyYW5zcG9ydGVkIG9yIG5vdClcbiAgICogdG8gZ2VuZXJhdGUgYSBzaW5nbGUgc2VnbWVudCBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgc2VnbWVudCBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBzZWdtZW50VGltZSA9ICh0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSkgKyB0aGlzLmRlbGF5O1xuICAgIHZhciBzZWdtZW50UGVyaW9kID0gdGhpcy5wZXJpb2RBYnM7XG4gICAgdmFyIHNlZ21lbnRJbmRleCA9IHRoaXMuc2VnbWVudEluZGV4O1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgc2VnbWVudFBvc2l0aW9uID0gMC4wO1xuICAgICAgdmFyIHNlZ21lbnREdXJhdGlvbiA9IDAuMDtcbiAgICAgIHZhciBzZWdtZW50T2Zmc2V0ID0gMC4wO1xuICAgICAgdmFyIHJlc2FtcGxpbmdSYXRlID0gMS4wO1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMuY3ljbGljKVxuICAgICAgICBzZWdtZW50SW5kZXggPSBzZWdtZW50SW5kZXggJSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoO1xuICAgICAgZWxzZVxuICAgICAgICBzZWdtZW50SW5kZXggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihzZWdtZW50SW5kZXgsIHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGggLSAxKSk7XG5cbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uQXJyYXkpXG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVtzZWdtZW50SW5kZXhdIHx8IDA7XG5cbiAgICAgIGlmICh0aGlzLmR1cmF0aW9uQXJyYXkpXG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IHRoaXMuZHVyYXRpb25BcnJheVtzZWdtZW50SW5kZXhdIHx8IDA7XG5cbiAgICAgIGlmICh0aGlzLm9mZnNldEFycmF5KVxuICAgICAgICBzZWdtZW50T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVtzZWdtZW50SW5kZXhdIHx8IDA7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSByZXNhbXBsaW5nXG4gICAgICBpZiAodGhpcy5yZXNhbXBsaW5nICE9PSAwIHx8IHRoaXMucmVzYW1wbGluZ1ZhciA+IDApIHtcbiAgICAgICAgdmFyIHJhbmRvbVJlc2FtcGxpbmcgPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAyLjAgKiB0aGlzLnJlc2FtcGxpbmdWYXI7XG4gICAgICAgIHJlc2FtcGxpbmdSYXRlID0gTWF0aC5wb3coMi4wLCAodGhpcy5yZXNhbXBsaW5nICsgcmFuZG9tUmVzYW1wbGluZykgLyAxMjAwLjApO1xuICAgICAgfVxuXG4gICAgICAvLyBjYWxjdWxhdGUgaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICAgICAgaWYgKHNlZ21lbnREdXJhdGlvbiA9PT0gMCB8fCB0aGlzLnBlcmlvZFJlbCA+IDApIHtcbiAgICAgICAgdmFyIG5leHRTZWdlbWVudEluZGV4ID0gc2VnbWVudEluZGV4ICsgMTtcbiAgICAgICAgdmFyIG5leHRQb3NpdGlvbiwgbmV4dE9mZnNldDtcblxuICAgICAgICBpZiAobmV4dFNlZ2VtZW50SW5kZXggPT09IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVswXSArIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVtuZXh0U2VnZW1lbnRJbmRleF07XG4gICAgICAgICAgbmV4dE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbbmV4dFNlZ2VtZW50SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGludGVyU2VnbWVudERpc3RhbmNlID0gbmV4dFBvc2l0aW9uIC0gc2VnbWVudFBvc2l0aW9uO1xuXG4gICAgICAgIC8vIGNvcnJlY3QgaW50ZXItc2VnbWVudCBkaXN0YW5jZSBieSBvZmZzZXRzXG4gICAgICAgIC8vICAgb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgICAgaWYgKHNlZ21lbnRPZmZzZXQgPiAwKVxuICAgICAgICAgIGludGVyU2VnbWVudERpc3RhbmNlIC09IHNlZ21lbnRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG5leHRPZmZzZXQgPiAwKVxuICAgICAgICAgIGludGVyU2VnbWVudERpc3RhbmNlICs9IG5leHRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKGludGVyU2VnbWVudERpc3RhbmNlIDwgMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSA9IDA7XG5cbiAgICAgICAgLy8gdXNlIGludGVyLXNlZ21lbnQgZGlzdGFuY2UgaW5zdGVhZCBvZiBzZWdtZW50IGR1cmF0aW9uXG4gICAgICAgIGlmIChzZWdtZW50RHVyYXRpb24gPT09IDApXG4gICAgICAgICAgc2VnbWVudER1cmF0aW9uID0gaW50ZXJTZWdtZW50RGlzdGFuY2U7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHBlcmlvZCByZWxhdGl2ZSB0byBpbnRlciBtYXJrZXIgZGlzdGFuY2VcbiAgICAgICAgc2VnbWVudFBlcmlvZCArPSB0aGlzLnBlcmlvZFJlbCAqIGludGVyU2VnbWVudERpc3RhbmNlO1xuICAgICAgfVxuXG4gICAgICAvLyBhZGQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgIHNlZ21lbnREdXJhdGlvbiAqPSB0aGlzLmR1cmF0aW9uUmVsO1xuICAgICAgc2VnbWVudER1cmF0aW9uICs9IHRoaXMuZHVyYXRpb25BYnM7XG5cbiAgICAgIC8vIGFkZCByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgc2VnbWVudCBvZmZzZXRcbiAgICAgIHNlZ21lbnRPZmZzZXQgKj0gdGhpcy5vZmZzZXRSZWw7XG4gICAgICBzZWdtZW50T2Zmc2V0ICs9IHRoaXMub2Zmc2V0QWJzO1xuXG4gICAgICAvLyBhcHBseSBzZWdtZW50IG9mZnNldFxuICAgICAgLy8gICBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAgLy8gICBvZmZzZXQgPCAwOiB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvbiBpcyB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBhbmQgdGhlIGR1cmF0aW9uIGhhcyB0byBiZSBjb3JyZWN0ZWQgYnkgdGhlIG9mZnNldFxuICAgICAgaWYgKHNlZ21lbnRPZmZzZXQgPCAwKSB7XG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiAtPSBzZWdtZW50T2Zmc2V0O1xuICAgICAgICBzZWdtZW50UG9zaXRpb24gKz0gc2VnbWVudE9mZnNldDtcbiAgICAgICAgc2VnbWVudFRpbWUgKz0gKHNlZ21lbnRPZmZzZXQgLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWdtZW50VGltZSAtPSAoc2VnbWVudE9mZnNldCAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmFuZG9taXplIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uVmFyID4gMClcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucG9zaXRpb25WYXI7XG5cbiAgICAgIC8vIHNob3J0ZW4gZHVyYXRpb24gb2Ygc2VnbWVudHMgb3ZlciB0aGUgZWRnZXMgb2YgdGhlIGJ1ZmZlclxuICAgICAgaWYgKHNlZ21lbnRQb3NpdGlvbiA8IDApIHtcbiAgICAgICAgc2VnbWVudER1cmF0aW9uICs9IHNlZ21lbnRQb3NpdGlvbjtcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlZ21lbnRQb3NpdGlvbiArIHNlZ21lbnREdXJhdGlvbiA+IHRoaXMuYnVmZmVyLmR1cmF0aW9uKVxuICAgICAgICBzZWdtZW50RHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbiAtIHNlZ21lbnRQb3NpdGlvbjtcblxuICAgICAgLy8gbWFrZSBzZWdtZW50XG4gICAgICBpZiAodGhpcy5nYWluID4gMCAmJiBzZWdtZW50RHVyYXRpb24gPiAwKSB7XG4gICAgICAgIC8vIG1ha2Ugc2VnbWVudCBlbnZlbG9wZVxuICAgICAgICB2YXIgZW52ZWxvcGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB2YXIgYXR0YWNrID0gdGhpcy5hdHRhY2tBYnMgKyB0aGlzLmF0dGFja1JlbCAqIHNlZ21lbnREdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2UgPSB0aGlzLnJlbGVhc2VBYnMgKyB0aGlzLnJlbGVhc2VSZWwgKiBzZWdtZW50RHVyYXRpb247XG5cbiAgICAgICAgaWYgKGF0dGFjayArIHJlbGVhc2UgPiBzZWdtZW50RHVyYXRpb24pIHtcbiAgICAgICAgICB2YXIgZmFjdG9yID0gc2VnbWVudER1cmF0aW9uIC8gKGF0dGFjayArIHJlbGVhc2UpO1xuICAgICAgICAgIGF0dGFjayAqPSBmYWN0b3I7XG4gICAgICAgICAgcmVsZWFzZSAqPSBmYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXR0YWNrRW5kVGltZSA9IHNlZ21lbnRUaW1lICsgYXR0YWNrO1xuICAgICAgICB2YXIgc2VnbWVudEVuZFRpbWUgPSBzZWdtZW50VGltZSArIHNlZ21lbnREdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2VTdGFydFRpbWUgPSBzZWdtZW50RW5kVGltZSAtIHJlbGVhc2U7XG5cbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBzZWdtZW50VGltZSk7XG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcblxuICAgICAgICBpZiAocmVsZWFzZVN0YXJ0VGltZSA+IGF0dGFja0VuZFRpbWUpXG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmdhaW4sIHJlbGVhc2VTdGFydFRpbWUpO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBzZWdtZW50RW5kVGltZSk7XG4gICAgICAgIGVudmVsb3BlLmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgICAgICAvLyBtYWtlIHNvdXJjZVxuICAgICAgICB2YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChlbnZlbG9wZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KHNlZ21lbnRUaW1lLCBzZWdtZW50UG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChzZWdtZW50VGltZSArIHNlZ21lbnREdXJhdGlvbiAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VnbWVudFBlcmlvZDtcbiAgfVxufVxuIl19