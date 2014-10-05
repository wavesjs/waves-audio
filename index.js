/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio granular synthesis engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("audio-context");
var TimeEngine = require("time-engine");

/**
 * @class GranularEngine
 */
var GranularEngine = (function(super$0){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};MIXIN$0(GranularEngine, super$0);var $proto$0={};
  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" interface.
   * The grain position (grain onset or center time in the audio buffer) is optionally 
   * determined by the engine's currentPosition attribute.
   */
  function GranularEngine() {var buffer = arguments[0];if(buffer === void 0)buffer = null;
    super$0.call(this);

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = buffer;

    /**
     * Absolute grain period in sec
     * @type {Number}
     */
    this.periodAbs = 0.01;

    /**
     * Grain period relative to absolute duration
     * @type {Number}
     */
    this.periodRel = 0;

    /**
     * Amout of random grain period variation relative to grain period
     * @type {Number}
     */
    this.periodVar = 0;

    /**
     * Grain position (onset time in audio buffer) in sec
     * @type {Number}
     */
    this.position = 0;

    /**
     * Amout of random grain position variation in sec
     * @type {Number}
     */
    this.positionVar = 0.003;

    /**
     * Absolute grain duration in sec
     * @type {Number}
     */
    this.durationAbs = 0.1; // absolute grain duration

    /**
     * Grain duration relative to grain period (overlap)
     * @type {Number}
     */
    this.durationRel = 0;

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    this.attackAbs = 0;

    /**
     * Attack time relative to grain duration
     * @type {Number}
     */
    this.attackRel = 0.5;

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    this.releaseAbs = 0;

    /**
     * Release time relative to grain duration
     * @type {Number}
     */
    this.releaseRel = 0.5;

    /**
     * Grain resampling in cent
     * @type {Number}
     */
    this.resampling = 0;

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    this.resamplingVar = 0;

    /**
     * Whether the grain position refers to the center of the grain (or the beginning)
     * @type {Bool}
     */
    this.centered = true;

    /**
     * Whether the audio buffer and grain position are considered as cyclic
     * @type {Bool}
     */
    this.cyclic = false;

    this.outputNode = this.__gainNode = audioContext.createGain();
  }GranularEngine.prototype = Object.create(super$0.prototype, {"constructor": {"value": GranularEngine, "configurable": true, "writable": true}, bufferDuration: {"get": bufferDuration$get$0, "configurable": true, "enumerable": true}, playbackLength: {"get": playbackLength$get$0, "configurable": true, "enumerable": true}, gain: {"get": gain$get$0, "set": gain$set$0, "configurable": true, "enumerable": true} });DP$0(GranularEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  function bufferDuration$get$0() {
    var bufferDuration = this.buffer.duration;

    if (this.buffer.wrapAroundExtention)
      bufferDuration -= this.buffer.wrapAroundExtention;

    return bufferDuration
  }

  // TimeEngine method (scheduled interface)
  $proto$0.advanceTime = function(time) {
    return time + this.trigger(time);
  };

  function playbackLength$get$0() {
    return this.bufferDuration;
  }

  /**
   * Set gain
   * @param {Number} value linear gain factor
   */
  function gain$set$0(value) {
    this.__gainNode.gain.value = value;
  }

  /**
   * Get gain
   * @return {Number} current gain
   */
  function gain$get$0() {
    return this.__gainNode.gain.value;
  }

  /**
   * Trigger a grain
   * @param {Number} time grain synthesis audio time
   * @return {Number} period to next grain
   *
   * This function can be called at any time (whether the engine is scheduled or not)
   * to generate a single grain according to the current grain parameters.
   */
  $proto$0.trigger = function(time) {
    var grainTime = time || audioContext.currentTime;
    var grainPeriod = this.periodAbs;
    var grainPosition = this.position + this.currentPosition;
    var grainDuration = this.durationAbs;

    if (this.buffer) {
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

      // center grain
      if (this.centered)
        grainPosition -= 0.5 * grainDuration;

      // randomize grain position
      if (this.positionVar > 0)
        grainPosition += (2.0 * Math.random() - 1) * this.positionVar;

      var bufferDuration = this.bufferDuration;

      // wrap or clip grain position and duration into buffer duration
      if (grainPosition < 0 || grainPosition >= bufferDuration) {
        if (this.cyclic) {
          var cycles = grainPosition / bufferDuration;
          grainPosition = (cycles - Math.floor(cycles)) * bufferDuration;

          if (grainPosition + grainDuration > this.buffer.duration)
            grainDuration = this.buffer.duration - grainPosition;
        } else {
          if (grainPosition < 0) {
            grainTime -= grainPosition;
            grainDuration += grainPosition;
            grainPosition = 0;
          }

          if (grainPosition + grainDuration > bufferDuration)
            grainDuration = bufferDuration - grainPosition;
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

        envelopeNode.gain.setValueAtTime(0.0, grainTime);
        envelopeNode.gain.linearRampToValueAtTime(1.0, attackEndTime);

        if (releaseStartTime > attackEndTime)
          envelopeNode.gain.setValueAtTime(1.0, releaseStartTime);

        envelopeNode.gain.linearRampToValueAtTime(0.0, grainEndTime);
        envelopeNode.connect(this.__gainNode);

        // make source
        var source = audioContext.createBufferSource();

        source.buffer = this.buffer;
        source.playbackRate.value = resamplingRate;
        source.connect(envelopeNode);
        envelopeNode.connect(this.__gainNode);

        source.start(grainTime, grainPosition);
        source.stop(grainTime + grainDuration / resamplingRate);
      }
    }

    return grainPeriod;
  };
MIXIN$0(GranularEngine.prototype,$proto$0);$proto$0=void 0;return GranularEngine;})(TimeEngine);

module.exports = GranularEngine;