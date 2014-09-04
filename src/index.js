/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio granular engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("audio-context");
var EventEngine = require("event-engine");

class SegmentEngine extends EventEngine {

  constructor(buffer = null) {
    super(false); // by default events don't sync to transport position

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = buffer;

    /**
     * Absolute segment period in sec
     * @type {Number}
     */
    this.periodAbs = 0.1;

    /**
     * Segment period relative to inter-segment distance
     * @type {Number}
     */
    this.periodRel = 0;

    /**
     * Amout of random segment period variation relative to segment period
     * @type {Number}
     */
    this.periodVar = 0;

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @type {Number}
     */
    this.positionArray = [0.0];

    /**
     * Amout of random segment position variation in sec
     * @type {Number}
     */
    this.positionVar = 0;

    /**
     * Array of segment durations in sec
     * @type {Number}
     */
    this.durationArray = [0.0];

    /**
     * Absolute segment duration in sec
     * @type {Number}
     */
    this.durationAbs = 0;

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @type {Number}
     */
    this.durationRel = 1;

    /**
     * Array of segment offsets in sec
     * @type {Number}
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
     */
    this.offsetArray = [0.0];

    /**
     * Absolute segment offset in sec
     * @type {Number}
     */
    this.offsetAbs = -0.005;

    /**
     * Segment offset relative to segment duration
     * @type {Number}
     */
    this.offsetRel = 0;

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @type {Number}
     */
    this.delay = 0.005;

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    this.attackAbs = 0.005;

    /**
     * Attack time relative to segment duration
     * @type {Number}
     */
    this.attackRel = 0;

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    this.releaseAbs = 0.005;

    /**
     * Release time relative to segment duration
     * @type {Number}
     */
    this.releaseRel = 0;

    /**
     * Segment resampling in cent
     * @type {Number}
     */
    this.resampling = 0;

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    this.resamplingVar = 0;

    /**
     * Index of
     * @type {Number}
     */
    this.segmentIndex = 0;

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @type {Bool}
     */
    this.cyclic = false;

    this.outputNode = this.__gainNode = audioContext.createGain();
  }

  // EventEngine syncEvent
  syncEvent(time) {
    var delay = 0;

    if (this.__aligned || this.transport) { // is always aligned in transport
      var cycles = time / this.period;

      if (this.transport && this.transport.reverse)
        cycles *= -1;

      delay = (Math.ceil(cycles) - cycles) * this.period;
    }

    return delay;
  }

  // EventEngine executeEvent
  executeEvent(time, audioTime) {
    return this.trigger(audioTime);
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
   * This function can be called at any time (whether the engine is scheduled or not)
   * to generate a single segment according to the current segment parameters.
   */
  trigger(audioTime) {
    var segmentTime = audioTime || audioContext.currentTime + this.delay;
    var segmentPeriod = this.periodAbs;
    var segmentIndex = this.segmentIndex;

    if (this.buffer) {
      var segmentPosition = 0.0;
      var segmentDuration = 0.0;
      var segmentOffset = 0.0;
      var resamplingRate = 1.0;
      var bufferDuration = this.buffer.duration;

      if (this.buffer.wrapAroundExtension)
        bufferDuration -= this.buffer.wrapAroundExtension;

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