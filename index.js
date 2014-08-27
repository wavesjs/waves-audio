/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio granular engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("audio-context");
var EventEngine = require("event-engine");

var GranularEngine = (function(super$0){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};MIXIN$0(GranularEngine, super$0);

  function GranularEngine() {var buffer = arguments[0];if(buffer === void 0)buffer = null;
    super$0.call(this, false); // by default events don't sync to transport position

    this.buffer = buffer; // audio buffer
    this.periodAbs = 0.01; // absolute period
    this.periodRel = 0; // period relative to duration
    this.periodVar = 0; // period variation relative to grain period
    this.positionArray = [0.0]; // segment positions
    this.positionVar = 0.003; // position variation in sec
    this.durationArray = [0.0]; // segment durations
    this.durationAbs = 0.1; // absolute grain duration
    this.durationRel = 0; // duration relative to absolute period
    this.offsetArray = [0.0]; // segment offsets
    this.offsetsAbs = 0.1; // absolute offset
    this.offsetsRel = 0; // offset relative to duration
    this.attackAbs = 0; // absolute attack time
    this.attackRel = 0.5; // attack time relative to duration
    this.releaseAbs = 0; // absolute release time
    this.releaseRel = 0.5; // release time relative to duration
    this.resampling = 0; // resampling in cent
    this.resamplingVar = 0; // resampling variation in cent
    this.markerIndex = 0;

    this.callback = null;
    this.__gainNode = audioContext.createGain();

    this.outputNode = this.__gainNode;
  }GranularEngine.prototype = Object.create(super$0.prototype, {"constructor": {"value": GranularEngine, "configurable": true, "writable": true}, gain: {"get": gain$get$0, "set": gain$set$0, "configurable": true, "enumerable": true} });DP$0(GranularEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  // EventEngine syncEvent
  GranularEngine.prototype.syncEvent = function(time) {
    var cycles = -this.__phase;

    if (this.__aligned || this.transport) // is always aligned in transport
      cycles += time / this.period;

    if (this.transport && this.transport.reverse)
      cycles *= -1;

    var delay = (Math.ceil(cycles) - cycles) * this.period;

    return delay;
  }

  // EventEngine executeEvent
  GranularEngine.prototype.executeEvent = function(time, audioTime) {
    return this.trigger(audioTime);
  }

  function gain$set$0(value) {
    this.__gainNode.gain.value = value;
  }

  function gain$get$0() {
    return this.__gainNode.gain.value;
  }

  GranularEngine.prototype.trigger = function(time) {
    var grainTime = time ||  audioContext.currentTime;
    var grainPeriod = this.periodAbs;
    var markerIndex = this.markerIndex;

    if (this.buffer) {
      var grainPosition = 0.0;
      var grainDuration = 0.0;
      var grainOffset = 0.0;
      var resamplingRate = 1.0;

      // calculate resampling
      if (this.resampling !== 0 || this.resamplingVar > 0) {
        var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
        resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
      }

      // calculate inter marker distance
      if (grainDuration === 0 || this.periodRel > 0) {
        var nextPosition = this.positionArray[markerIndex + 1] || this.buffer.duration;
        var nextOffset = this.offsetArray[markerIndex + 1] || 0;
        var interMarker = nextPosition - grainPosition;

        // correct inter marker distance by offsets
        //   offset > 0: the grain's reference position is after the given segment position
        if (grainOffset > 0)
          interMarker -= grainOffset;

        if (nextOffset > 0)
          interMarker += nextOffset;

        if (interMarker < 0)
          interMarker = 0;

        // use inter marker distance instead of segment duration 
        if (grainDuration === 0)
          grainDuration = interMarker;

        // calculate period relative to inter marker distance
        grainPeriod += this.periodRel * interMarker;
      }

      // add relative and absolute grain duration
      grainDuration *= this.durationRel;
      grainDuration += this.durationAbs;

      // add relative and absolute grain offset
      grainOffset *= this.offsetRel;
      grainOffset += this.offsetAbs;

      // apply grain offset
      //   offset > 0: the grain's reference position is after the given segment position
      //   offset < 0: the given segment position is the grains reference position and the duration has to be corrected by the offset
      if (grainOffset < 0) {
        grainDuration -= grainOffset;
        grainPosition += grainOffset;
        grainTime += (grainOffset / resamplingRate);
      } else {
        grainTime -= (grainOffset / resamplingRate);
      }

      // randomize grain position
      if (this.positionVar > 0)
        grainPosition += 2.0 * (Math.random() - 0.5) * this.positionVar;

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

        envelopeNode.gain.value = this.gain;

        envelopeNode.gain.setValueAtTime(0.0, grainTime);
        envelopeNode.gain.linearRampToValueAtTime(this.gain, attackEndTime);

        if (releaseStartTime > attackEndTime)
          envelopeNode.gain.setValueAtTime(this.gain, releaseStartTime);

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
    }

    return grainPeriod;
  }
;return GranularEngine;})(EventEngine);
module.exports = GranularEngine;