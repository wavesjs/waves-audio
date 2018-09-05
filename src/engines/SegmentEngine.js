import AudioTimeEngine from '../core/AudioTimeEngine';

function optOrDef(opt, def) {
  if (opt !== undefined)
    return opt;

  return def;
}

function getCurrentOrPreviousIndex(sortedArray, value, index = -1) {
  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value < firstVal)
      index = -1;
    else if (value >= lastVal)
      index = size - 1;
    else {
      if (index < 0 || index >= size)
        index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] > value)
        index--;

      while (sortedArray[index + 1] <= value)
        index++;
    }
  }

  return index;
}

function getCurrentOrNextIndex(sortedArray, value, index = -1) {
  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value <= firstVal)
      index = 0;
    else if (value >= lastVal)
      index = size;
    else {
      if (index < 0 || index >= size)
        index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] < value)
        index++;

      while (sortedArray[index - 1] >= value)
        index--;
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
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/segment-engine/index.html}
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
class SegmentEngine extends AudioTimeEngine {
  constructor(options = {}) {
    super(options.audioContext);

    /**
     * Audio buffer
     * @name buffer
     * @type {AudioBuffer}
     * @default null
     * @memberof SegmentEngine
     * @instance
     */
    this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute segment period in sec
     * @name periodAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.periodAbs = optOrDef(options.periodAbs, 0);

    /**
     * Segment period relative to inter-segment distance
     * @name periodRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    this.periodRel = optOrDef(options.periodRel, 1);

    /**
     * Amout of random segment period variation relative to segment period
     * @name periodVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Minimum segment period
     * @name periodMin
     * @type {Number}
     * @default 0.001
     * @memberof SegmentEngine
     * @instance
     */
    this.periodMin = optOrDef(options.periodMin, 0.001);

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @name positionArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    this.positionArray = optOrDef(options.positionArray, [0.0]);

    /**
     * Amout of random segment position variation in sec
     * @name positionVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.positionVar = optOrDef(options.positionVar, 0);

    /**
     * Array of segment durations in sec
     * @name durationArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    this.durationArray = optOrDef(options.durationArray, [0.0]);

    /**
     * Absolute segment duration in sec
     * @name durationAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.durationAbs = optOrDef(options.durationAbs, 0);

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @name durationRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    this.durationRel = optOrDef(options.durationRel, 1);

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
    this.offsetArray = optOrDef(options.offsetArray, [0.0]);

    /**
     * Absolute segment offset in sec
     * @name offsetAbs
     * @type {Number}
     * @default -0.005
     * @memberof SegmentEngine
     * @instance
     */
    this.offsetAbs = optOrDef(options.offsetAbs, -0.005);

    /**
     * Segment offset relative to segment duration
     * @name offsetRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.offsetRel = optOrDef(options.offsetRel, 0);

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @name delay
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    this.delay = optOrDef(options.delay, 0.005);

    /**
     * Absolute attack time in sec
     * @name attackAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    this.attackAbs = optOrDef(options.attackAbs, 0.005);

    /**
     * Attack time relative to segment duration
     * @name attackRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.attackRel = optOrDef(options.attackRel, 0);

    /**
     * Absolute release time in sec
     * @name releaseAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    this.releaseAbs = optOrDef(options.releaseAbs, 0.005);

    /**
     * Release time relative to segment duration
     * @name releaseRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.releaseRel = optOrDef(options.releaseRel, 0);

    /**
     * Segment resampling in cent
     * @name resampling
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @name resamplingVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @name gain
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    this.gain = optOrDef(options.gain, 1);

    /**
     * Index of the segment to synthesize (i.e. of this.positionArray/durationArray/offsetArray)
     * @name segmentIndex
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.segmentIndex = optOrDef(options.segmentIndex, 0);

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @name cyclic
     * @type {Bool}
     * @default false
     * @memberof SegmentEngine
     * @instance
     */
    this.cyclic = optOrDef(options.cyclic, false);
    this.__cyclicOffset = 0;

    /**
     * Whether the last segment is aborted when triggering the next
     * @name monophonic
     * @type {Number}
     * @default false
     * @memberof SegmentEngine
     * @instance
     */
    this.monophonic = optOrDef(options.monophonic, false);
    this.__currentSrc = null;
    this.__currentEnv = null;
    this.__releaseStartTime = 0;
    this.__currentGain = 0;
    this.__currentEndTime = 0;

    /**
     * Fade-out time (when aborted)
     * @name abortTime
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    this.abortTime = optOrDef(options.abortTime, 0.005);

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @name wrapAroundExtension
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    this.outputNode = this.audioContext.createGain();
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   *
   * @type {Number}
   * @default 0
   * @memberof SegmentEngine
   * @instance
   */
  get bufferDuration() {
    if (this.buffer) {
      var bufferDuration = this.buffer.duration;

      if (this.wrapAroundExtension)
        bufferDuration -= this.wrapAroundExtension;

      return bufferDuration;
    }

    return 0;
  }

  // TimeEngine method (transported interface)
  advanceTime(time) {
    time = Math.max(time, this.audioContext.currentTime);
    return time + this.trigger(time);
  }

  // TimeEngine method (transported interface)
  syncPosition(time, position, speed) {
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

        if (!this.cyclic)
          return Infinity;
      }
    } else if (speed < 0) {
      index = getCurrentOrPreviousIndex(this.positionArray, position);

      if (index < 0) {
        index = this.positionArray.length - 1;
        cyclicOffset -= bufferDuration;

        if (!this.cyclic)
          return -Infinity;
      }
    } else {
      return Infinity;
    }

    this.segmentIndex = index;
    this.__cyclicOffset = cyclicOffset;

    return cyclicOffset + this.positionArray[index];
  }

  // TimeEngine method (transported interface)
  advancePosition(time, position, speed) {
    var index = this.segmentIndex;
    var cyclicOffset = this.__cyclicOffset;

    this.trigger(time);

    if (speed > 0) {
      index++;

      if (index >= this.positionArray.length) {
        index = 0;
        cyclicOffset += this.bufferDuration;

        if (!this.cyclic)
          return Infinity;
      }
    } else {
      index--;

      if (index < 0) {
        index = this.positionArray.length - 1;
        cyclicOffset -= this.bufferDuration;

        if (!this.cyclic)
          return -Infinity;
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
  trigger(time) {
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

      if (this.cyclic)
        segmentIndex = segmentIndex % this.positionArray.length;
      else
        segmentIndex = Math.max(0, Math.min(segmentIndex, this.positionArray.length - 1));

      if (this.positionArray)
        segmentPosition = this.positionArray[segmentIndex] || 0;

      if (this.durationArray)
        segmentDuration = this.durationArray[segmentIndex] || 0;

      if (this.offsetArray)
        segmentOffset = this.offsetArray[segmentIndex] || 0;

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
        if (segmentOffset > 0)
          interSegmentDistance -= segmentOffset;

        if (nextOffset > 0)
          interSegmentDistance += nextOffset;

        if (interSegmentDistance < 0)
          interSegmentDistance = 0;

        // use inter-segment distance instead of segment duration
        if (segmentDuration === 0)
          segmentDuration = interSegmentDistance;

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
        segmentTime += (segmentOffset / resamplingRate);
      } else {
        segmentTime -= (segmentOffset / resamplingRate);
      }

      // randomize segment position
      if (this.positionVar > 0)
        segmentPosition += 2.0 * (Math.random() - 0.5) * this.positionVar;

      // shorten duration of segments over the edges of the buffer
      if (segmentPosition < 0) {
        //segmentTime -= grainPosition; hm, not sure if we want to do this
        segmentDuration += segmentPosition;
        segmentPosition = 0;
      }

      if (segmentPosition + segmentDuration > this.buffer.duration)
        segmentDuration = this.buffer.duration - segmentPosition;

      segmentDuration /= resamplingRate;

      if (this.monophonic)
        this.abort(segmentTime);

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

        if (releaseStartTime > attackEndTime)
          envelope.gain.setValueAtTime(this.gain, releaseStartTime);

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

    // segment period randon variation
    if (this.periodVar > 0.0)
      segmentPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * segmentPeriod;

    return Math.max(this.periodMin, segmentPeriod);
  }

  /**
   * Abort the current segment at given time, fade out duration
   *
   * @param {Number} time - abort time
   */
  abort(time) {
    const audioContext = this.audioContext;
    const endTime = this.__currentEndTime;
    const abortTime = time || audioContext.currentTime;

    if (abortTime < endTime) {
      const segmentEndTime = Math.min(abortTime + this.abortTime, endTime);
      const envelope = this.__currentEnv;
      let currentGainValue = this.__currentGain;

      if (abortTime > this.__releaseStartTime) {
        const releaseStart = this.__releaseStartTime;
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
}

export default SegmentEngine;
