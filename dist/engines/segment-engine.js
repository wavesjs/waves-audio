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
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

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
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value <= firstVal) index = 0;else if (value >= lastVal) index = size;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] < value) {
        index++;
      }while (sortedArray[index - 1] >= value) {
        index--;
      }
    }
  }

  return index;
}

/**
 * Used with a buffer to serve audio files via granular synthesis.
 *
 * The engine implements the "scheduled" and "transported" interfaces.
 * When "scheduled", the engine  generates segments more or less periodically
 * (controlled by the periodAbs, periodRel, and perioVar attributes).
 * When "transported", the engine generates segments at the position of their onset time.
 *
 * Example that shows a `SegmentEngine` with a few parameter controls running in a `Scheduler`.
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/segment-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const segmentEngine = new audio.SegmentEngine();
 *
 * scheduler.add(segmentEngine);
 *
 * @param {Object} [options={}] - Default options
 * @param {AudioBuffer} [options.buffer=null] - Audio buffer
 * @param {Number} [options.periodAbs=0] - Absolute segment period in sec
 * @param {Number} [options.periodRel=1] - Segment period relative to inter-segment distance
 * @param {Number} [options.periodVar=0] - Amout of random segment period variation relative
 *  to segment period
 * @param {Number} [options.periodMin=0.001] - Minimum segment period
 * @param {Number} [options.positionArray=[0.0]] - Array of segment positions (onset times
 *  in audio buffer) in sec
 * @param {Number} [options.positionVar=0] - Amout of random segment position variation in sec
 * @param {Number} [options.durationArray=[0.0]] - Array of segment durations in sec
 * @param {Number} [options.durationAbs=0] - Absolute segment duration in sec
 * @param {Number} [options.durationRel=1] - Segment duration relative to given segment
 *  duration or inter-segment distance
 * @param {Array} [options.offsetArray=[0.0]] - Array of segment offsets in sec
 * @param {Number} [options.offsetAbs=-0.005] - Absolute segment offset in sec
 * @param {Number} [options.offsetRel=0] - Segment offset relative to segment duration
 * @param {Number} [options.delay=0.005] - Time by which all segments are delayed (especially
 *  to realize segment offsets)
 * @param {Number} [options.attackAbs=0.005] - Absolute attack time in sec
 * @param {Number} [options.attackRel=0] - Attack time relative to segment duration
 * @param {Number} [options.releaseAbs=0.005] - Absolute release time in sec
 * @param {Number} [options.releaseRel=0] - Release time relative to segment duration
 * @param {Number} [options.resampling=0] - Segment resampling in cent
 * @param {Number} [options.resamplingVar=0] - Amout of random resampling variation in cent
 * @param {Number} [options.gain=1] - Linear gain factor
 * @param {Number} [options.abortTime=0.005] - fade-out time when aborted
 * @param {Number} [options.segmentIndex=0] - Index of the segment to synthesize (i.e. of
 *  this.positionArray/durationArray/offsetArray)
 * @param {Bool} [options.cyclic=false] - Whether the audio buffer and segment indices are
 *  considered as cyclic
 * @param {Number} [options.wrapAroundExtension=0] - Portion at the end of the audio buffer
 *  that has been copied from the beginning to assure cyclic behavior
 */

var SegmentEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(SegmentEngine, _AudioTimeEngine);

  function SegmentEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, SegmentEngine);

    /**
     * Audio buffer
     * @name buffer
     * @type {AudioBuffer}
     * @default null
     * @memberof SegmentEngine
     * @instance
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (SegmentEngine.__proto__ || (0, _getPrototypeOf2.default)(SegmentEngine)).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute segment period in sec
     * @name periodAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0);

    /**
     * Segment period relative to inter-segment distance
     * @name periodRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodRel = optOrDef(options.periodRel, 1);

    /**
     * Amout of random segment period variation relative to segment period
     * @name periodVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Minimum segment period
     * @name periodMin
     * @type {Number}
     * @default 0.001
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodMin = optOrDef(options.periodMin, 0.001);

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @name positionArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.positionArray = optOrDef(options.positionArray, [0.0]);

    /**
     * Amout of random segment position variation in sec
     * @name positionVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.positionVar = optOrDef(options.positionVar, 0);

    /**
     * Array of segment durations in sec
     * @name durationArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationArray = optOrDef(options.durationArray, [0.0]);

    /**
     * Absolute segment duration in sec
     * @name durationAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0);

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @name durationRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationRel = optOrDef(options.durationRel, 1);

    /**
     * Array of segment offsets in sec
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position
     * and the duration has to be corrected by the offset
     *
     * @name offsetArray
     * @type {Array}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetArray = optOrDef(options.offsetArray, [0.0]);

    /**
     * Absolute segment offset in sec
     * @name offsetAbs
     * @type {Number}
     * @default -0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetAbs = optOrDef(options.offsetAbs, -0.005);

    /**
     * Segment offset relative to segment duration
     * @name offsetRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetRel = optOrDef(options.offsetRel, 0);

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @name delay
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.delay = optOrDef(options.delay, 0.005);

    /**
     * Absolute attack time in sec
     * @name attackAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0.005);

    /**
     * Attack time relative to segment duration
     * @name attackRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.attackRel = optOrDef(options.attackRel, 0);

    /**
     * Absolute release time in sec
     * @name releaseAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0.005);

    /**
     * Release time relative to segment duration
     * @name releaseRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0);

    /**
     * Segment resampling in cent
     * @name resampling
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @name resamplingVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @name gain
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Index of the segment to synthesize (i.e. of this.positionArray/durationArray/offsetArray)
     * @name segmentIndex
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.segmentIndex = optOrDef(options.segmentIndex, 0);

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @name cyclic
     * @type {Bool}
     * @default false
     * @memberof SegmentEngine
     * @instance
     */
    _this.cyclic = optOrDef(options.cyclic, false);
    _this.__cyclicOffset = 0;

    /**
     * Whether the last segment is aborted when triggering the next
     * @name monophonic
     * @type {Number}
     * @default false
     * @memberof SegmentEngine
     * @instance
     */
    _this.monophonic = optOrDef(options.monophonic, false);
    _this.__currentSrc = null;
    _this.__currentEnv = null;
    _this.__releaseStartTime = 0;
    _this.__currentGain = 0;
    _this.__currentEndTime = 0;

    /**
     * Fade-out time (when aborted)
     * @name abortTime
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.abortTime = optOrDef(options.abortTime, 0.005);

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @name wrapAroundExtension
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
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
   * @default 0
   * @memberof SegmentEngine
   * @instance
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
     * Trigger a segment.
     * This function can be called at any time (whether the engine is scheduled/transported or not)
     * to generate a single segment according to the current segment parameters.
     *
     * @param {Number} time segment synthesis audio time
     * @return {Number} period to next segment
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
          var nextSegmentIndex = segmentIndex + 1;
          var nextPosition, nextOffset;

          if (nextSegmentIndex === this.positionArray.length) {
            if (this.cyclic) {
              nextPosition = this.positionArray[0] + bufferDuration;
              nextOffset = this.offsetArray[0];
            } else {
              nextPosition = bufferDuration;
              nextOffset = 0;
            }
          } else {
            nextPosition = this.positionArray[nextSegmentIndex];
            nextOffset = this.offsetArray[nextSegmentIndex];
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
          //segmentTime -= grainPosition; hm, not sure if we want to do this
          segmentDuration += segmentPosition;
          segmentPosition = 0;
        }

        if (segmentPosition + segmentDuration > this.buffer.duration) segmentDuration = this.buffer.duration - segmentPosition;

        segmentDuration /= resamplingRate;

        if (this.monophonic) this.abort(segmentTime);

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

          this.__currentEnv = envelope;

          // make source
          var source = audioContext.createBufferSource();

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;
          source.connect(envelope);

          source.start(segmentTime, segmentPosition);
          source.stop(segmentTime + segmentDuration);

          this.__currentSrc = source;
          this.__releaseStartTime = releaseStartTime;
          this.__currentGain = this.gain;
          this.__currentEndTime = segmentEndTime;
        }
      }

      // grain period randon variation
      if (this.periodVar > 0.0) segmentPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

      return Math.max(this.periodMin, segmentPeriod);
    }

    /**
     * Abort the current segment at given time, fade out duration
     *
     * @param {Number} time - abort time
     */

  }, {
    key: 'abort',
    value: function abort(time) {
      var audioContext = this.audioContext;
      var endTime = this.__currentEndTime;
      var abortTime = time || audioContext.currentTime;

      if (abortTime < endTime) {
        var segmentEndTime = Math.min(abortTime + this.abortTime, endTime);
        var envelope = this.__currentEnv;
        var currentGainValue = this.__currentGain;

        if (abortTime > this.__releaseStartTime) {
          var releaseStart = this.__releaseStartTime;
          currentGainValue *= (abortTime - releaseStart) / (endTime - releaseStart);
        }

        envelope.gain.cancelScheduledValues(abortTime);
        envelope.gain.setValueAtTime(currentGainValue, abortTime);
        envelope.gain.linearRampToValueAtTime(0, segmentEndTime);

        this.__currentSrc = null;
        this.__currentEnv = null;
        this.__releaseStartTime = 0;
        this.__currentGain = 0;
        this.__currentEndTime = 0;
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlZ21lbnQtZW5naW5lLmpzIl0sIm5hbWVzIjpbIm9wdE9yRGVmIiwib3B0IiwiZGVmIiwidW5kZWZpbmVkIiwiZ2V0Q3VycmVudE9yUHJldmlvdXNJbmRleCIsInNvcnRlZEFycmF5IiwidmFsdWUiLCJpbmRleCIsInNpemUiLCJsZW5ndGgiLCJmaXJzdFZhbCIsImxhc3RWYWwiLCJNYXRoIiwiZmxvb3IiLCJnZXRDdXJyZW50T3JOZXh0SW5kZXgiLCJTZWdtZW50RW5naW5lIiwib3B0aW9ucyIsImF1ZGlvQ29udGV4dCIsImJ1ZmZlciIsInBlcmlvZEFicyIsInBlcmlvZFJlbCIsInBlcmlvZFZhciIsInBlcmlvZE1pbiIsInBvc2l0aW9uQXJyYXkiLCJwb3NpdGlvblZhciIsImR1cmF0aW9uQXJyYXkiLCJkdXJhdGlvbkFicyIsImR1cmF0aW9uUmVsIiwib2Zmc2V0QXJyYXkiLCJvZmZzZXRBYnMiLCJvZmZzZXRSZWwiLCJkZWxheSIsImF0dGFja0FicyIsImF0dGFja1JlbCIsInJlbGVhc2VBYnMiLCJyZWxlYXNlUmVsIiwicmVzYW1wbGluZyIsInJlc2FtcGxpbmdWYXIiLCJnYWluIiwic2VnbWVudEluZGV4IiwiY3ljbGljIiwiX19jeWNsaWNPZmZzZXQiLCJtb25vcGhvbmljIiwiX19jdXJyZW50U3JjIiwiX19jdXJyZW50RW52IiwiX19yZWxlYXNlU3RhcnRUaW1lIiwiX19jdXJyZW50R2FpbiIsIl9fY3VycmVudEVuZFRpbWUiLCJhYm9ydFRpbWUiLCJ3cmFwQXJvdW5kRXh0ZW5zaW9uIiwib3V0cHV0Tm9kZSIsImNyZWF0ZUdhaW4iLCJ0aW1lIiwibWF4IiwiY3VycmVudFRpbWUiLCJ0cmlnZ2VyIiwicG9zaXRpb24iLCJzcGVlZCIsImN5Y2xpY09mZnNldCIsImJ1ZmZlckR1cmF0aW9uIiwiY3ljbGVzIiwiSW5maW5pdHkiLCJzZWdtZW50VGltZSIsInNlZ21lbnRQZXJpb2QiLCJzZWdtZW50UG9zaXRpb24iLCJzZWdtZW50RHVyYXRpb24iLCJzZWdtZW50T2Zmc2V0IiwicmVzYW1wbGluZ1JhdGUiLCJtaW4iLCJyYW5kb21SZXNhbXBsaW5nIiwicmFuZG9tIiwicG93IiwibmV4dFNlZ21lbnRJbmRleCIsIm5leHRQb3NpdGlvbiIsIm5leHRPZmZzZXQiLCJpbnRlclNlZ21lbnREaXN0YW5jZSIsImR1cmF0aW9uIiwiYWJvcnQiLCJlbnZlbG9wZSIsImF0dGFjayIsInJlbGVhc2UiLCJmYWN0b3IiLCJhdHRhY2tFbmRUaW1lIiwic2VnbWVudEVuZFRpbWUiLCJyZWxlYXNlU3RhcnRUaW1lIiwic2V0VmFsdWVBdFRpbWUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImNvbm5lY3QiLCJzb3VyY2UiLCJjcmVhdGVCdWZmZXJTb3VyY2UiLCJwbGF5YmFja1JhdGUiLCJzdGFydCIsInN0b3AiLCJncmFpblBlcmlvZCIsImVuZFRpbWUiLCJjdXJyZW50R2FpblZhbHVlIiwicmVsZWFzZVN0YXJ0IiwiY2FuY2VsU2NoZWR1bGVkVmFsdWVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFFQSxTQUFTQSxRQUFULENBQWtCQyxHQUFsQixFQUF1QkMsR0FBdkIsRUFBNEI7QUFDMUIsTUFBSUQsUUFBUUUsU0FBWixFQUNFLE9BQU9GLEdBQVA7O0FBRUYsU0FBT0MsR0FBUDtBQUNEOztBQUVELFNBQVNFLHlCQUFULENBQW1DQyxXQUFuQyxFQUFnREMsS0FBaEQsRUFBbUU7QUFBQSxNQUFaQyxLQUFZLHVFQUFKLENBQUMsQ0FBRzs7QUFDakUsTUFBSUMsT0FBT0gsWUFBWUksTUFBdkI7O0FBRUEsTUFBSUQsT0FBTyxDQUFYLEVBQWM7QUFDWixRQUFJRSxXQUFXTCxZQUFZLENBQVosQ0FBZjtBQUNBLFFBQUlNLFVBQVVOLFlBQVlHLE9BQU8sQ0FBbkIsQ0FBZDs7QUFFQSxRQUFJRixRQUFRSSxRQUFaLEVBQ0VILFFBQVEsQ0FBQyxDQUFULENBREYsS0FFSyxJQUFJRCxTQUFTSyxPQUFiLEVBQ0hKLFFBQVFD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RCw4QkFBb0IsQ0FBQy9DLFlBQVlnRCxZQUFiLEtBQThCRixVQUFVRSxZQUF4QyxDQUFwQjtBQUNEOztBQUVEbEIsaUJBQVN4QyxJQUFULENBQWMyRCxxQkFBZCxDQUFvQ2pELFNBQXBDO0FBQ0E4QixpQkFBU3hDLElBQVQsQ0FBYytDLGNBQWQsQ0FBNkJVLGdCQUE3QixFQUErQy9DLFNBQS9DO0FBQ0E4QixpQkFBU3hDLElBQVQsQ0FBY2dELHVCQUFkLENBQXNDLENBQXRDLEVBQXlDSCxjQUF6Qzs7QUFFQSxhQUFLeEMsWUFBTCxHQUFvQixJQUFwQjtBQUNBLGFBQUtDLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxhQUFLQyxrQkFBTCxHQUEwQixDQUExQjtBQUNBLGFBQUtDLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxhQUFLQyxnQkFBTCxHQUF3QixDQUF4QjtBQUNEO0FBQ0Y7Ozt3QkExU29CO0FBQ25CLFVBQUksS0FBSzdCLE1BQVQsRUFBaUI7QUFDZixZQUFJeUMsaUJBQWlCLEtBQUt6QyxNQUFMLENBQVkwRCxRQUFqQzs7QUFFQSxZQUFJLEtBQUszQixtQkFBVCxFQUNFVSxrQkFBa0IsS0FBS1YsbUJBQXZCOztBQUVGLGVBQU9VLGNBQVA7QUFDRDs7QUFFRCxhQUFPLENBQVA7QUFDRDs7Ozs7a0JBa1NZNUMsYSIsImZpbGUiOiJzZWdtZW50LWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZSc7XG5cbmZ1bmN0aW9uIG9wdE9yRGVmKG9wdCwgZGVmKSB7XG4gIGlmIChvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRPclByZXZpb3VzSW5kZXgoc29ydGVkQXJyYXksIHZhbHVlLCBpbmRleCA9IC0xKSB7XG4gIHZhciBzaXplID0gc29ydGVkQXJyYXkubGVuZ3RoO1xuXG4gIGlmIChzaXplID4gMCkge1xuICAgIHZhciBmaXJzdFZhbCA9IHNvcnRlZEFycmF5WzBdO1xuICAgIHZhciBsYXN0VmFsID0gc29ydGVkQXJyYXlbc2l6ZSAtIDFdO1xuXG4gICAgaWYgKHZhbHVlIDwgZmlyc3RWYWwpXG4gICAgICBpbmRleCA9IC0xO1xuICAgIGVsc2UgaWYgKHZhbHVlID49IGxhc3RWYWwpXG4gICAgICBpbmRleCA9IHNpemUgLSAxO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKVxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKHNpemUgLSAxKSAqICh2YWx1ZSAtIGZpcnN0VmFsKSAvIChsYXN0VmFsIC0gZmlyc3RWYWwpKTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4XSA+IHZhbHVlKVxuICAgICAgICBpbmRleC0tO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXggKyAxXSA8PSB2YWx1ZSlcbiAgICAgICAgaW5kZXgrKztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRPck5leHRJbmRleChzb3J0ZWRBcnJheSwgdmFsdWUsIGluZGV4ID0gLTEpIHtcbiAgdmFyIHNpemUgPSBzb3J0ZWRBcnJheS5sZW5ndGg7XG5cbiAgaWYgKHNpemUgPiAwKSB7XG4gICAgdmFyIGZpcnN0VmFsID0gc29ydGVkQXJyYXlbMF07XG4gICAgdmFyIGxhc3RWYWwgPSBzb3J0ZWRBcnJheVtzaXplIC0gMV07XG5cbiAgICBpZiAodmFsdWUgPD0gZmlyc3RWYWwpXG4gICAgICBpbmRleCA9IDA7XG4gICAgZWxzZSBpZiAodmFsdWUgPj0gbGFzdFZhbClcbiAgICAgIGluZGV4ID0gc2l6ZTtcbiAgICBlbHNlIHtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gc2l6ZSlcbiAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKChzaXplIC0gMSkgKiAodmFsdWUgLSBmaXJzdFZhbCkgLyAobGFzdFZhbCAtIGZpcnN0VmFsKSk7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleF0gPCB2YWx1ZSlcbiAgICAgICAgaW5kZXgrKztcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4IC0gMV0gPj0gdmFsdWUpXG4gICAgICAgIGluZGV4LS07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluZGV4O1xufVxuXG4vKipcbiAqIFVzZWQgd2l0aCBhIGJ1ZmZlciB0byBzZXJ2ZSBhdWRpbyBmaWxlcyB2aWEgZ3JhbnVsYXIgc3ludGhlc2lzLlxuICpcbiAqIFRoZSBlbmdpbmUgaW1wbGVtZW50cyB0aGUgXCJzY2hlZHVsZWRcIiBhbmQgXCJ0cmFuc3BvcnRlZFwiIGludGVyZmFjZXMuXG4gKiBXaGVuIFwic2NoZWR1bGVkXCIsIHRoZSBlbmdpbmUgIGdlbmVyYXRlcyBzZWdtZW50cyBtb3JlIG9yIGxlc3PCoHBlcmlvZGljYWxseVxuICogKGNvbnRyb2xsZWQgYnkgdGhlIHBlcmlvZEFicywgcGVyaW9kUmVsLCBhbmQgcGVyaW9WYXIgYXR0cmlidXRlcykuXG4gKiBXaGVuIFwidHJhbnNwb3J0ZWRcIiwgdGhlIGVuZ2luZSBnZW5lcmF0ZXMgc2VnbWVudHMgYXQgdGhlIHBvc2l0aW9uIG9mIHRoZWlyIG9uc2V0IHRpbWUuXG4gKlxuICogRXhhbXBsZSB0aGF0IHNob3dzIGEgYFNlZ21lbnRFbmdpbmVgIHdpdGggYSBmZXcgcGFyYW1ldGVyIGNvbnRyb2xzIHJ1bm5pbmcgaW4gYSBgU2NoZWR1bGVyYC5cbiAqIHtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvc2VnbWVudC1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmVcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBzY2hlZHVsZXIgPSBhdWRpby5nZXRTY2hlZHVsZXIoKTtcbiAqIGNvbnN0IHNlZ21lbnRFbmdpbmUgPSBuZXcgYXVkaW8uU2VnbWVudEVuZ2luZSgpO1xuICpcbiAqIHNjaGVkdWxlci5hZGQoc2VnbWVudEVuZ2luZSk7XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSAtIERlZmF1bHQgb3B0aW9uc1xuICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gW29wdGlvbnMuYnVmZmVyPW51bGxdIC0gQXVkaW8gYnVmZmVyXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kQWJzPTBdIC0gQWJzb2x1dGUgc2VnbWVudCBwZXJpb2QgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kUmVsPTFdIC0gU2VnbWVudCBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZFZhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmVcbiAqICB0byBzZWdtZW50IHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZE1pbj0wLjAwMV0gLSBNaW5pbXVtIHNlZ21lbnQgcGVyaW9kXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucG9zaXRpb25BcnJheT1bMC4wXV0gLSBBcnJheSBvZiBzZWdtZW50IHBvc2l0aW9ucyAob25zZXQgdGltZXNcbiAqICBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uVmFyPTBdIC0gQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uQXJyYXk9WzAuMF1dIC0gQXJyYXkgb2Ygc2VnbWVudCBkdXJhdGlvbnMgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHVyYXRpb25BYnM9MF0gLSBBYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uUmVsPTFdIC0gU2VnbWVudCBkdXJhdGlvbiByZWxhdGl2ZSB0byBnaXZlbiBzZWdtZW50XG4gKiAgZHVyYXRpb24gb3IgaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICogQHBhcmFtIHtBcnJheX0gW29wdGlvbnMub2Zmc2V0QXJyYXk9WzAuMF1dIC0gQXJyYXkgb2Ygc2VnbWVudCBvZmZzZXRzIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm9mZnNldEFicz0tMC4wMDVdIC0gQWJzb2x1dGUgc2VnbWVudCBvZmZzZXQgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMub2Zmc2V0UmVsPTBdIC0gU2VnbWVudCBvZmZzZXQgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmRlbGF5PTAuMDA1XSAtIFRpbWUgYnkgd2hpY2ggYWxsIHNlZ21lbnRzIGFyZSBkZWxheWVkIChlc3BlY2lhbGx5XG4gKiAgdG8gcmVhbGl6ZSBzZWdtZW50IG9mZnNldHMpXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuYXR0YWNrQWJzPTAuMDA1XSAtIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmF0dGFja1JlbD0wXSAtIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlQWJzPTAuMDA1XSAtIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlUmVsPTBdIC0gUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZXNhbXBsaW5nPTBdIC0gU2VnbWVudCByZXNhbXBsaW5nIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZXNhbXBsaW5nVmFyPTBdIC0gQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gTGluZWFyIGdhaW4gZmFjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuYWJvcnRUaW1lPTAuMDA1XSAtIGZhZGUtb3V0IHRpbWUgd2hlbiBhYm9ydGVkXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuc2VnbWVudEluZGV4PTBdIC0gSW5kZXggb2YgdGhlIHNlZ21lbnQgdG8gc3ludGhlc2l6ZSAoaS5lLiBvZlxuICogIHRoaXMucG9zaXRpb25BcnJheS9kdXJhdGlvbkFycmF5L29mZnNldEFycmF5KVxuICogQHBhcmFtIHtCb29sfSBbb3B0aW9ucy5jeWNsaWM9ZmFsc2VdIC0gV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBzZWdtZW50IGluZGljZXMgYXJlXG4gKiAgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy53cmFwQXJvdW5kRXh0ZW5zaW9uPTBdIC0gUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXJcbiAqICB0aGF0IGhhcyBiZWVuIGNvcGllZCBmcm9tIHRoZSBiZWdpbm5pbmcgdG8gYXNzdXJlIGN5Y2xpYyBiZWhhdmlvclxuICovXG5jbGFzcyBTZWdtZW50RW5naW5lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQG5hbWUgYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBwZXJpb2QgaW4gc2VjXG4gICAgICogQG5hbWUgcGVyaW9kQWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAbmFtZSBwZXJpb2RSZWxcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kUmVsID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RSZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBzZWdtZW50IHBlcmlvZFxuICAgICAqIEBuYW1lIHBlcmlvZFZhclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RWYXIgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIHNlZ21lbnQgcGVyaW9kXG4gICAgICogQG5hbWUgcGVyaW9kTWluXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwMVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RNaW4gPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZE1pbiwgMC4wMDEpO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBwb3NpdGlvbnMgKG9uc2V0IHRpbWVzIGluIGF1ZGlvIGJ1ZmZlcikgaW4gc2VjXG4gICAgICogQG5hbWUgcG9zaXRpb25BcnJheVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgWzAuMF1cbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25BcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25BcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICAgICAqIEBuYW1lIHBvc2l0aW9uVmFyXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvblZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IGR1cmF0aW9ucyBpbiBzZWNcbiAgICAgKiBAbmFtZSBkdXJhdGlvbkFycmF5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBbMC4wXVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFycmF5LCBbMC4wXSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uIGluIHNlY1xuICAgICAqIEBuYW1lIGR1cmF0aW9uQWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdpdmVuIHNlZ21lbnQgZHVyYXRpb24gb3IgaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICAgICAqIEBuYW1lIGR1cmF0aW9uUmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uUmVsID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvblJlbCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IG9mZnNldHMgaW4gc2VjXG4gICAgICpcbiAgICAgKiBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAqIG9mZnNldCA8IDA6IHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uIGlzIHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uXG4gICAgICogYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgKlxuICAgICAqIEBuYW1lIG9mZnNldEFycmF5XG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IFswLjBdXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldEFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRBcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBvZmZzZXQgaW4gc2VjXG4gICAgICogQG5hbWUgb2Zmc2V0QWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAtMC4wMDVcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0QWJzID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRBYnMsIC0wLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IG9mZnNldCByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQG5hbWUgb2Zmc2V0UmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0UmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFRpbWUgYnkgd2hpY2ggYWxsIHNlZ21lbnRzIGFyZSBkZWxheWVkIChlc3BlY2lhbGx5IHRvIHJlYWxpemUgc2VnbWVudCBvZmZzZXRzKVxuICAgICAqIEBuYW1lIGRlbGF5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwNVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kZWxheSA9IG9wdE9yRGVmKG9wdGlvbnMuZGVsYXksIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEBuYW1lIGF0dGFja0Fic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMC4wMDVcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrQWJzID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tBYnMsIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgKiBAbmFtZSBhdHRhY2tSZWxcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrUmVsID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgcmVsZWFzZSB0aW1lIGluIHNlY1xuICAgICAqIEBuYW1lIHJlbGVhc2VBYnNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VBYnMgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VBYnMsIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQG5hbWUgcmVsZWFzZVJlbFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlUmVsID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgcmVzYW1wbGluZyBpbiBjZW50XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1ZhclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgICAqIEBuYW1lIGdhaW5cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZ2FpbiA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBJbmRleCBvZiB0aGUgc2VnbWVudCB0byBzeW50aGVzaXplIChpLmUuIG9mIHRoaXMucG9zaXRpb25BcnJheS9kdXJhdGlvbkFycmF5L29mZnNldEFycmF5KVxuICAgICAqIEBuYW1lIHNlZ21lbnRJbmRleFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBvcHRPckRlZihvcHRpb25zLnNlZ21lbnRJbmRleCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIHNlZ21lbnQgaW5kaWNlcyBhcmUgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICAgKiBAbmFtZSBjeWNsaWNcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5jeWNsaWMgPSBvcHRPckRlZihvcHRpb25zLmN5Y2xpYywgZmFsc2UpO1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgbGFzdCBzZWdtZW50IGlzIGFib3J0ZWQgd2hlbiB0cmlnZ2VyaW5nIHRoZSBuZXh0XG4gICAgICogQG5hbWUgbW9ub3Bob25pY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMubW9ub3Bob25pYyA9IG9wdE9yRGVmKG9wdGlvbnMubW9ub3Bob25pYywgZmFsc2UpO1xuICAgIHRoaXMuX19jdXJyZW50U3JjID0gbnVsbDtcbiAgICB0aGlzLl9fY3VycmVudEVudiA9IG51bGw7XG4gICAgdGhpcy5fX3JlbGVhc2VTdGFydFRpbWUgPSAwO1xuICAgIHRoaXMuX19jdXJyZW50R2FpbiA9IDA7XG4gICAgdGhpcy5fX2N1cnJlbnRFbmRUaW1lID0gMDtcblxuICAgIC8qKlxuICAgICAqIEZhZGUtb3V0IHRpbWUgKHdoZW4gYWJvcnRlZClcbiAgICAgKiBAbmFtZSBhYm9ydFRpbWVcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmFib3J0VGltZSA9IG9wdE9yRGVmKG9wdGlvbnMuYWJvcnRUaW1lLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBQb3J0aW9uIGF0IHRoZSBlbmQgb2YgdGhlIGF1ZGlvIGJ1ZmZlciB0aGF0IGhhcyBiZWVuIGNvcGllZCBmcm9tIHRoZSBiZWdpbm5pbmcgdG8gYXNzdXJlIGN5Y2xpYyBiZWhhdmlvclxuICAgICAqIEBuYW1lIHdyYXBBcm91bmRFeHRlbnNpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbiA9IG9wdE9yRGVmKG9wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbiwgMCk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvbiAoZXhjbHVkaW5nIHdyYXBBcm91bmRFeHRlbnNpb24pXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBkZWZhdWx0IDBcbiAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uO1xuXG4gICAgICByZXR1cm4gYnVmZmVyRHVyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcbiAgICB2YXIgY3ljbGljT2Zmc2V0ID0gMDtcbiAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICB2YXIgY3ljbGVzID0gcG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgY3ljbGljT2Zmc2V0ID0gTWF0aC5mbG9vcihjeWNsZXMpICogYnVmZmVyRHVyYXRpb247XG4gICAgICBwb3NpdGlvbiAtPSBjeWNsaWNPZmZzZXQ7XG4gICAgfVxuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaW5kZXggPSBnZXRDdXJyZW50T3JOZXh0SW5kZXgodGhpcy5wb3NpdGlvbkFycmF5LCBwb3NpdGlvbik7XG5cbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgY3ljbGljT2Zmc2V0ICs9IGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBpbmRleCA9IGdldEN1cnJlbnRPclByZXZpb3VzSW5kZXgodGhpcy5wb3NpdGlvbkFycmF5LCBwb3NpdGlvbik7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgY3ljbGljT2Zmc2V0IC09IGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIC1JbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgIH1cblxuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IGN5Y2xpY09mZnNldDtcblxuICAgIHJldHVybiBjeWNsaWNPZmZzZXQgKyB0aGlzLnBvc2l0aW9uQXJyYXlbaW5kZXhdO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc2VnbWVudEluZGV4O1xuICAgIHZhciBjeWNsaWNPZmZzZXQgPSB0aGlzLl9fY3ljbGljT2Zmc2V0O1xuXG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaW5kZXgrKztcblxuICAgICAgaWYgKGluZGV4ID49IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBjeWNsaWNPZmZzZXQgKz0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZXgtLTtcblxuICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCA9IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBjeWNsaWNPZmZzZXQgLT0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gY3ljbGljT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGN5Y2xpY09mZnNldCArIHRoaXMucG9zaXRpb25BcnJheVtpbmRleF07XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBhIHNlZ21lbnQuXG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCBhdCBhbnkgdGltZSAod2hldGhlciB0aGUgZW5naW5lIGlzIHNjaGVkdWxlZC90cmFuc3BvcnRlZCBvciBub3QpXG4gICAqIHRvIGdlbmVyYXRlIGEgc2luZ2xlIHNlZ21lbnQgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHNlZ21lbnQgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgc2VnbWVudCBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHBlcmlvZCB0byBuZXh0IHNlZ21lbnRcbiAgICovXG4gIHRyaWdnZXIodGltZSkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgc2VnbWVudFRpbWUgPSAodGltZSB8fCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpICsgdGhpcy5kZWxheTtcbiAgICB2YXIgc2VnbWVudFBlcmlvZCA9IHRoaXMucGVyaW9kQWJzO1xuICAgIHZhciBzZWdtZW50SW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIHNlZ21lbnRQb3NpdGlvbiA9IDAuMDtcbiAgICAgIHZhciBzZWdtZW50RHVyYXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudE9mZnNldCA9IDAuMDtcbiAgICAgIHZhciByZXNhbXBsaW5nUmF0ZSA9IDEuMDtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLmN5Y2xpYylcbiAgICAgICAgc2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4ICUgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aDtcbiAgICAgIGVsc2VcbiAgICAgICAgc2VnbWVudEluZGV4ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oc2VnbWVudEluZGV4LCB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMSkpO1xuXG4gICAgICBpZiAodGhpcy5wb3NpdGlvbkFycmF5KVxuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSB0aGlzLnBvc2l0aW9uQXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICBpZiAodGhpcy5kdXJhdGlvbkFycmF5KVxuICAgICAgICBzZWdtZW50RHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uQXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICBpZiAodGhpcy5vZmZzZXRBcnJheSlcbiAgICAgICAgc2VnbWVudE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbc2VnbWVudEluZGV4XSB8fCAwO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzYW1wbGluZ1xuICAgICAgaWYgKHRoaXMucmVzYW1wbGluZyAhPT0gMCB8fCB0aGlzLnJlc2FtcGxpbmdWYXIgPiAwKSB7XG4gICAgICAgIHZhciByYW5kb21SZXNhbXBsaW5nID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMi4wICogdGhpcy5yZXNhbXBsaW5nVmFyO1xuICAgICAgICByZXNhbXBsaW5nUmF0ZSA9IE1hdGgucG93KDIuMCwgKHRoaXMucmVzYW1wbGluZyArIHJhbmRvbVJlc2FtcGxpbmcpIC8gMTIwMC4wKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2FsY3VsYXRlIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgIGlmIChzZWdtZW50RHVyYXRpb24gPT09IDAgfHwgdGhpcy5wZXJpb2RSZWwgPiAwKSB7XG4gICAgICAgIHZhciBuZXh0U2VnbWVudEluZGV4ID0gc2VnbWVudEluZGV4ICsgMTtcbiAgICAgICAgdmFyIG5leHRQb3NpdGlvbiwgbmV4dE9mZnNldDtcblxuICAgICAgICBpZiAobmV4dFNlZ21lbnRJbmRleCA9PT0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5WzBdICsgYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgICBuZXh0T2Zmc2V0ID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W25leHRTZWdtZW50SW5kZXhdO1xuICAgICAgICAgIG5leHRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W25leHRTZWdtZW50SW5kZXhdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGludGVyU2VnbWVudERpc3RhbmNlID0gbmV4dFBvc2l0aW9uIC0gc2VnbWVudFBvc2l0aW9uO1xuXG4gICAgICAgIC8vIGNvcnJlY3QgaW50ZXItc2VnbWVudCBkaXN0YW5jZSBieSBvZmZzZXRzXG4gICAgICAgIC8vICAgb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgICAgaWYgKHNlZ21lbnRPZmZzZXQgPiAwKVxuICAgICAgICAgIGludGVyU2VnbWVudERpc3RhbmNlIC09IHNlZ21lbnRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG5leHRPZmZzZXQgPiAwKVxuICAgICAgICAgIGludGVyU2VnbWVudERpc3RhbmNlICs9IG5leHRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKGludGVyU2VnbWVudERpc3RhbmNlIDwgMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSA9IDA7XG5cbiAgICAgICAgLy8gdXNlIGludGVyLXNlZ21lbnQgZGlzdGFuY2UgaW5zdGVhZCBvZiBzZWdtZW50IGR1cmF0aW9uXG4gICAgICAgIGlmIChzZWdtZW50RHVyYXRpb24gPT09IDApXG4gICAgICAgICAgc2VnbWVudER1cmF0aW9uID0gaW50ZXJTZWdtZW50RGlzdGFuY2U7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHBlcmlvZCByZWxhdGl2ZSB0byBpbnRlciBtYXJrZXIgZGlzdGFuY2VcbiAgICAgICAgc2VnbWVudFBlcmlvZCArPSB0aGlzLnBlcmlvZFJlbCAqIGludGVyU2VnbWVudERpc3RhbmNlO1xuICAgICAgfVxuXG4gICAgICAvLyBhZGQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgIHNlZ21lbnREdXJhdGlvbiAqPSB0aGlzLmR1cmF0aW9uUmVsO1xuICAgICAgc2VnbWVudER1cmF0aW9uICs9IHRoaXMuZHVyYXRpb25BYnM7XG5cbiAgICAgIC8vIGFkZCByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgc2VnbWVudCBvZmZzZXRcbiAgICAgIHNlZ21lbnRPZmZzZXQgKj0gdGhpcy5vZmZzZXRSZWw7XG4gICAgICBzZWdtZW50T2Zmc2V0ICs9IHRoaXMub2Zmc2V0QWJzO1xuXG4gICAgICAvLyBhcHBseSBzZWdtZW50IG9mZnNldFxuICAgICAgLy8gICBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAgLy8gICBvZmZzZXQgPCAwOiB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvbiBpcyB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBhbmQgdGhlIGR1cmF0aW9uIGhhcyB0byBiZSBjb3JyZWN0ZWQgYnkgdGhlIG9mZnNldFxuICAgICAgaWYgKHNlZ21lbnRPZmZzZXQgPCAwKSB7XG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiAtPSBzZWdtZW50T2Zmc2V0O1xuICAgICAgICBzZWdtZW50UG9zaXRpb24gKz0gc2VnbWVudE9mZnNldDtcbiAgICAgICAgc2VnbWVudFRpbWUgKz0gKHNlZ21lbnRPZmZzZXQgLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWdtZW50VGltZSAtPSAoc2VnbWVudE9mZnNldCAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmFuZG9taXplIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uVmFyID4gMClcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucG9zaXRpb25WYXI7XG5cbiAgICAgIC8vIHNob3J0ZW4gZHVyYXRpb24gb2Ygc2VnbWVudHMgb3ZlciB0aGUgZWRnZXMgb2YgdGhlIGJ1ZmZlclxuICAgICAgaWYgKHNlZ21lbnRQb3NpdGlvbiA8IDApIHtcbiAgICAgICAgLy9zZWdtZW50VGltZSAtPSBncmFpblBvc2l0aW9uOyBobSwgbm90IHN1cmUgaWYgd2Ugd2FudCB0byBkbyB0aGlzXG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiArPSBzZWdtZW50UG9zaXRpb247XG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gKyBzZWdtZW50RHVyYXRpb24gPiB0aGlzLmJ1ZmZlci5kdXJhdGlvbilcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb24gLSBzZWdtZW50UG9zaXRpb247XG5cbiAgICAgIHNlZ21lbnREdXJhdGlvbiAvPSByZXNhbXBsaW5nUmF0ZTtcblxuICAgICAgaWYgKHRoaXMubW9ub3Bob25pYylcbiAgICAgICAgdGhpcy5hYm9ydChzZWdtZW50VGltZSk7XG5cbiAgICAgIC8vIG1ha2Ugc2VnbWVudFxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgc2VnbWVudER1cmF0aW9uID4gMCkge1xuICAgICAgICAvLyBtYWtlIHNlZ21lbnQgZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdmFyIGF0dGFjayA9IHRoaXMuYXR0YWNrQWJzICsgdGhpcy5hdHRhY2tSZWwgKiBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlID0gdGhpcy5yZWxlYXNlQWJzICsgdGhpcy5yZWxlYXNlUmVsICogc2VnbWVudER1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gc2VnbWVudER1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIGZhY3RvciA9IHNlZ21lbnREdXJhdGlvbiAvIChhdHRhY2sgKyByZWxlYXNlKTtcbiAgICAgICAgICBhdHRhY2sgKj0gZmFjdG9yO1xuICAgICAgICAgIHJlbGVhc2UgKj0gZmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGFja0VuZFRpbWUgPSBzZWdtZW50VGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIHNlZ21lbnRFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gc2VnbWVudEVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4udmFsdWUgPSAwO1xuICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5nYWluLCByZWxlYXNlU3RhcnRUaW1lKTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudEVuZFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbnYgPSBlbnZlbG9wZTtcblxuICAgICAgICAvLyBtYWtlIHNvdXJjZVxuICAgICAgICB2YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChlbnZlbG9wZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KHNlZ21lbnRUaW1lLCBzZWdtZW50UG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChzZWdtZW50VGltZSArIHNlZ21lbnREdXJhdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2N1cnJlbnRTcmMgPSBzb3VyY2U7XG4gICAgICAgIHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lID0gcmVsZWFzZVN0YXJ0VGltZTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRHYWluID0gdGhpcy5nYWluO1xuICAgICAgICB0aGlzLl9fY3VycmVudEVuZFRpbWUgPSBzZWdtZW50RW5kVGltZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBncmFpbiBwZXJpb2QgcmFuZG9uIHZhcmlhdGlvblxuICAgIGlmICh0aGlzLnBlcmlvZFZhciA+IDAuMClcbiAgICAgIHNlZ21lbnRQZXJpb2QgKz0gMi4wICogKE1hdGgucmFuZG9tKCkgLSAwLjUpICogdGhpcy5wZXJpb2RWYXIgKiBncmFpblBlcmlvZDtcblxuICAgIHJldHVybiBNYXRoLm1heCh0aGlzLnBlcmlvZE1pbiwgc2VnbWVudFBlcmlvZCk7XG4gIH1cblxuICAvKipcbiAgICogQWJvcnQgdGhlIGN1cnJlbnQgc2VnbWVudCBhdCBnaXZlbiB0aW1lLCBmYWRlIG91dCBkdXJhdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIGFib3J0IHRpbWVcbiAgICovXG4gIGFib3J0KHRpbWUpIHtcbiAgICBjb25zdCBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICBjb25zdCBlbmRUaW1lID0gdGhpcy5fX2N1cnJlbnRFbmRUaW1lO1xuICAgIGNvbnN0IGFib3J0VGltZSA9IHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gICAgaWYgKGFib3J0VGltZSA8IGVuZFRpbWUpIHtcbiAgICAgIGNvbnN0IHNlZ21lbnRFbmRUaW1lID0gTWF0aC5taW4oYWJvcnRUaW1lICsgdGhpcy5hYm9ydFRpbWUsIGVuZFRpbWUpO1xuICAgICAgY29uc3QgZW52ZWxvcGUgPSB0aGlzLl9fY3VycmVudEVudjtcbiAgICAgIGxldCBjdXJyZW50R2FpblZhbHVlID0gdGhpcy5fX2N1cnJlbnRHYWluO1xuXG4gICAgICBpZiAoYWJvcnRUaW1lID4gdGhpcy5fX3JlbGVhc2VTdGFydFRpbWUpIHtcbiAgICAgICAgY29uc3QgcmVsZWFzZVN0YXJ0ID0gdGhpcy5fX3JlbGVhc2VTdGFydFRpbWU7XG4gICAgICAgIGN1cnJlbnRHYWluVmFsdWUgKj0gKGFib3J0VGltZSAtIHJlbGVhc2VTdGFydCkgLyAoZW5kVGltZSAtIHJlbGVhc2VTdGFydCk7XG4gICAgICB9XG5cbiAgICAgIGVudmVsb3BlLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGFib3J0VGltZSk7XG4gICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKGN1cnJlbnRHYWluVmFsdWUsIGFib3J0VGltZSk7XG4gICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHNlZ21lbnRFbmRUaW1lKTtcblxuICAgICAgdGhpcy5fX2N1cnJlbnRTcmMgPSBudWxsO1xuICAgICAgdGhpcy5fX2N1cnJlbnRFbnYgPSBudWxsO1xuICAgICAgdGhpcy5fX3JlbGVhc2VTdGFydFRpbWUgPSAwO1xuICAgICAgdGhpcy5fX2N1cnJlbnRHYWluID0gMDtcbiAgICAgIHRoaXMuX19jdXJyZW50RW5kVGltZSA9IDA7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlZ21lbnRFbmdpbmU7XG4iXX0=