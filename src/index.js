/**
 * @fileoverview WAVE audio library element: a web audio granular engine.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 2.1.1
 */

"use strict";

var Scheduled = require("../scheduled");
var Transported = require("../transported");

class ScheduledGranular extends Scheduled {
  reset(time) {
    if (parent.buffer === null)
      return Infinity; // do not schedule

    return time;
  }

  execute(time) {
    return parent.trigger(time) + period;
  }
}

class GranularEngine {

  constructor(buffer = null, name = "unnamed") {
    this.name = name;

    this.buffer = buffer; // audio buffer
    this.periodAbs = 0.01; // absolute period
    this.periodRel = 0.0; // period relative to duration
    this.periodVar = 0.0; // period variation relative to grain period
    this.position = 0.0; // grain position (onset time) in sec
    this.positionVar = 0.003; // grain position variation in sec
    this.durationAbs = 0.1; // absolute grain duration
    this.durationRel = 0.0; // duration relative to absolute period
    this.attackAbs = 0.0; // absolute attack time
    this.attackRel = 0.5; // attack time relative to duration
    this.releaseAbs = 0.0; // absolute release time
    this.releaseRel = 0.5; // release time relative to duration
    this.resampling = 0; // resampling in cent
    this.resamplingVar = 0; // resampling variation in cent
    this.centered = true; // whether grain position refers to teh center of teh grain (or the beginning)

    // private properties
    this.callback = null;
    this.gainNode = audioContext.createGain();

    // interfaces
    this.scheduled = new ScheduledGranular(this);
    this.transported = new Transported(this); // transported but not scheduled
  }

  set gain(value) {
    this.gainNode.gain.value = val;
  }

  get gain() {
    return this.gainNode.gain.value;
  }

  /**
   * Audio node connect method.
   * @public
   * @chainable
   */
  connect(target) {
    this.gainNode.connect(target || audioContext.destination);
    return this;
  }

  /**
   * Audio node disconnect method.
   * @public
   * @chainable
   */
  disconnect(index) {
    this.gainNode.disconnect(index);
    return this;
  }

  trigger(grainTime = audioContext.currentTime) { // TODO: check if smart
    var grainPeriod = this.periodAbs;
    var grainPosition = this.position;
    var grainDuration = this.durationAbs;
    var resamplingRate = 1.0;

    // calculate resampling
    if (this.resampling !== 0 || this.resamplingVar > 0) {
      var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
      resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
    }

    grainPeriod += this.periodRel * grainDuration;
    grainDuration += this.durationRel * grainPeriod;

    // grain period randon variation
    if (this.periodVar > 0.0)
      grainPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

    // add transport position
    grainPosition += this.transported.position;

    if (this.callback) {
      var params = {
        position: grainPosition,
        period: grainPeriod,
        duration: grainDuration
      };

      this.callback(params);

      grainPosition = params.position;
      grainPeriod = params.period;
      grainDuration = params.duration;
    }

    // center grain
    if (this.centered)
      grainPosition -= 0.5 * grainDuration;

    // randomize grain position
    if (this.positionVar > 0)
      grainPosition += (2.0 * Math.random() - 1) * this.positionVar;

    // shorten duration of grains over the edges of the buffer
    if (grainPosition < 0) {
      grainDuration += grainPosition;
      grainPosition = 0;
    }

    if (grainPosition + grainDuration > this.buffer.duration)
      grainDuration = this.buffer.duration - grainPosition;

    // make grain
    if (this.gain > 0 && grainDuration > 0) {
      // make grain envelope
      var envelopeNode = audioContext.createGain();
      var attack = this.attackAbs + this.attackRel * grainDuration;
      var release = this.releaseAbs + this.releaseRel * grainDuration;

      if (attack + release > grainDuration) {
        var factor = grainDuration / (attack + release);
        attack *= factor;
        release *= factor;
      }

      if (grainTime < audioContext.currentTime)
        grainTime = audioContext.currentTime;

      var attackEndTime = grainTime + attack;
      var grainEndTime = grainTime + grainDuration;
      var releaseStartTime = grainEndTime - release;

      envelopeNode.gain.setValueAtTime(0.0, grainTime);
      envelopeNode.gain.linearRampToValueAtTime(1.0, attackEndTime);

      if (releaseStartTime > attackEndTime)
        envelopeNode.gain.setValueAtTime(1.0, releaseStartTime);

      envelopeNode.gain.linearRampToValueAtTime(0.0, grainEndTime);
      envelopeNode.connect(this.gainNode);

      // make source
      var source = audioContext.createBufferSource();

      source.buffer = this.buffer;
      source.playbackRate.value = resamplingRate;
      source.connect(envelopeNode);
      envelopeNode.connect(this.gainNode);

      source.start(grainTime, grainPosition);
      source.stop(grainTime + grainDuration / resamplingRate);
    }

    return grainPeriod;
  }
}
module.exports = GranularEngine;