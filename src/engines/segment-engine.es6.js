/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio sound segment engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var TimeEngine = require("../core/time-engine");

function getCurrentOrPreviousIndex(sortedArray, value, index = 0) {
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

function getCurrentOrNextIndex(sortedArray, value, index = 0) {
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

      while (sortedArray[index + 1] >= value)
        index--;
    }
  }

  return index;
}

/**
 * @class SegmentEngine
 */
class SegmentEngine extends TimeEngine {
  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" and "transported" interfaces.
   * When "scheduled", the engine  generates segments more or less periodically
   * (controlled by the periodAbs, periodRel, and perioVar attributes).
   * When "transported", the engine generates segments at the position of their onset time.
   */
  constructor(audioContext, options = {}) {
    super(audioContext);

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = options.buffer || null;

    /**
     * Absolute segment period in sec
     * @type {Number}
     */
    this.periodAbs = options.periodAbs || 0.1;

    /**
     * Segment period relative to inter-segment distance
     * @type {Number}
     */
    this.periodRel = options.periodRel || 0;

    /**
     * Amout of random segment period variation relative to segment period
     * @type {Number}
     */
    this.periodVar = options.periodVar || 0;

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @type {Number}
     */
    this.positionArray = options.positionArray || [0.0];

    /**
     * Amout of random segment position variation in sec
     * @type {Number}
     */
    this.positionVar = options.positionVar || 0;

    /**
     * Array of segment durations in sec
     * @type {Number}
     */
    this.durationArray = options.durationArray || [0.0];

    /**
     * Absolute segment duration in sec
     * @type {Number}
     */
    this.durationAbs = options.durationAbs || 0;

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @type {Number}
     */
    this.durationRel = options.durationRel || 1;

    /**
     * Array of segment offsets in sec
     * @type {Number}
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
     */
    this.offsetArray = options.offsetArray || [0.0];

    /**
     * Absolute segment offset in sec
     * @type {Number}
     */
    this.offsetAbs = options.offsetAbs || -0.005;

    /**
     * Segment offset relative to segment duration
     * @type {Number}
     */
    this.offsetRel = options.offsetRel || 0;

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @type {Number}
     */
    this.delay = options.delay || 0.005;

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    this.attackAbs = options.attackAbs || 0.005;

    /**
     * Attack time relative to segment duration
     * @type {Number}
     */
    this.attackRel = options.attackRel || 0;

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    this.releaseAbs = options.releaseAbs || 0.005;

    /**
     * Release time relative to segment duration
     * @type {Number}
     */
    this.releaseRel = options.releaseRel || 0;

    /**
     * Segment resampling in cent
     * @type {Number}
     */
    this.resampling = options.resampling || 0;

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    this.resamplingVar = options.resamplingVar || 0;

    /**
     * Index of
     * @type {Number}
     */
    this.segmentIndex = options.segmentIndex || 0;

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @type {Bool}
     */
    this.cyclic = options.cyclic || false;
    this.__cyclicOffset = 0;

    this.__gainNode = audioContext.createGain();
    this.__gainNode.gain.value = options.gain || 1;

    this.outputNode = this.__gainNode;
  }

  get bufferDuration() {
    var bufferDuration = this.buffer.duration;

    if (this.buffer.wrapAroundExtention)
      bufferDuration -= this.buffer.wrapAroundExtention;

    return bufferDuration;
  }

  // TimeEngine method (transported interface)
  advanceTime(time, position, speed) {
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
   * Set gain
   * @param {Number} value linear gain factor
   */
  set gain(value) {
    this.__gainNode.gain.value = value;
  }

  /**
   * Get gain
   * @return {Number} current gain
   */
  get gain() {
    return this.__gainNode.gain.value;
  }

  /**
   * Trigger a segment
   * @param {Number} audioTime segment synthesis audio time
   * @return {Number} period to next segment
   *
   * This function can be called at any time (whether the engine is scheduled/transported or not)
   * to generate a single segment according to the current segment parameters.
   */
  trigger(audioTime) {
    var audioContext = this.audioContext;
    var segmentTime = audioTime || audioContext.currentTime + this.delay;
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
        segmentDuration += segmentPosition;
        segmentPosition = 0;
      }

      if (segmentPosition + segmentDuration > this.buffer.duration)
        segmentDuration = this.buffer.duration - segmentPosition;

      // make segment
      if (this.gain > 0 && segmentDuration > 0) {
        // make segment envelope
        var envelopeNode = audioContext.createGain();
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

        envelopeNode.gain.value = this.gain;

        envelopeNode.gain.setValueAtTime(0.0, segmentTime);
        envelopeNode.gain.linearRampToValueAtTime(this.gain, attackEndTime);

        if (releaseStartTime > attackEndTime)
          envelopeNode.gain.setValueAtTime(this.gain, releaseStartTime);

        envelopeNode.gain.linearRampToValueAtTime(0.0, segmentEndTime);
        envelopeNode.connect(this.__gainNode);

        // make source
        var source = audioContext.createBufferSource();

        source.buffer = this.buffer;
        source.playbackRate.value = resamplingRate;
        source.connect(envelopeNode);
        envelopeNode.connect(this.__gainNode);

        source.start(segmentTime, segmentPosition);
        source.stop(segmentTime + segmentDuration / resamplingRate);
      }
    }

    return segmentPeriod;
  }
}

module.exports = SegmentEngine;