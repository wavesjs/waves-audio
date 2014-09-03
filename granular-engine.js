!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.GranularEngine=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio granular engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = _dereq_("audio-context");
var EventEngine = _dereq_("event-engine");

var GranularEngine = (function(super$0){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};MIXIN$0(GranularEngine, super$0);var $proto$0={};

  function GranularEngine() {var buffer = arguments[0];if(buffer === void 0)buffer = null;
    super$0.call(this, false); // by default events don't sync to transport position

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
    this.cyclic = true;

    this.__phase = 0;
    this.__aligned = true;

    this.outputNode = this.__gainNode = audioContext.createGain();
  }GranularEngine.prototype = Object.create(super$0.prototype, {"constructor": {"value": GranularEngine, "configurable": true, "writable": true}, gain: {"get": gain$get$0, "set": gain$set$0, "configurable": true, "enumerable": true} });DP$0(GranularEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  // EventEngine syncEvent
  $proto$0.syncEvent = function(time) {
    return 0;
  };

  // EventEngine executeEvent
  $proto$0.executeEvent = function(time, audioTime) {
    return this.trigger(audioTime);
  };

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
   * @param {Number} audioTime grain synthesis audio time
   * @return {Number} period to next grain
   *
   * This function can be called at any time (whether the engine is scheduled or not)
   * to generate a single grain according to the current grain parameters.
   */
  $proto$0.trigger = function(audioTime) {
    var grainTime = audioTime || audioContext.currentTime;
    var grainPeriod = this.periodAbs;
    var grainPosition = this.position;
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

      // get transport position
      if (this.transport)
        grainPosition = this.transport.position;

      // center grain
      if (this.centered)
        grainPosition -= 0.5 * grainDuration;

      // randomize grain position
      if (this.positionVar > 0)
        grainPosition += (2.0 * Math.random() - 1) * this.positionVar;

      // shorten duration of grains over the edges of the buffer
      if (grainPosition < 0) {
        grainTime -= grainPosition;
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
MIXIN$0(GranularEngine.prototype,$proto$0);$proto$0=void 0;return GranularEngine;})(EventEngine);

module.exports = GranularEngine;
},{"audio-context":2,"event-engine":3}],2:[function(_dereq_,module,exports){
/* Generated by es6-transpiler v 0.7.14-2 */
// instantiates an audio context in the global scope if not there already
var context = window.audioContext || new AudioContext() || new webkitAudioContext();
window.audioContext = context;
module.exports = context;
},{}],3:[function(_dereq_,module,exports){

/**
 * @fileoverview WAVE audio event engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 * @version 3.0
 */
"use strict";

var EventEngine = (function(){var DP$0 = Object.defineProperty;
  function EventEngine() {var alignToTransportPosition = arguments[0];if(alignToTransportPosition === void 0)alignToTransportPosition = true;
    this.scheduler = null;
    this.transport = null;

    this.alignToTransportPosition = alignToTransportPosition; // true: events are aligned to position when executed within transport

    this.outputNode = null;
  }DP$0(EventEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /**
   * Synchronize event engine
   * @param {float} time synchronization time or transport position
   * @return {float} next event time
   */
  EventEngine.prototype.syncEvent = function(time) {
    return Infinity;
  }

  /**
   * Execute next event
   * @param {float} time the event's scheduler time or transport position
   * @param {float} audioTime the event's corresponding audio context's currentTime
   * @return {float} next event time
   */
  EventEngine.prototype.executeEvent = function(time, audioTime) {
    return Infinity; // return next event time
  }

  /**
   * Request event engine resynchronization (called by engine itself)
   */
  EventEngine.prototype.resyncEngine = function() {
    if(this.scheduler)
      this.scheduler.resync(this);
  }

  /**
   * Request event engine rescheduling (called by engine itself)
   * @param {float} time the event's new scheduler time or transport position
   */
  EventEngine.prototype.rescheduleEngine = function(time) {
    if(this.scheduler)
      this.scheduler.reschedule(this, time);
  }

  EventEngine.prototype.connect = function(target) {
    this.outputNode.connect(target);
    return this;
  }

  EventEngine.prototype.disconnect = function(target) {
    this.outputNode.disconnect(target);
    return this;
  }
;return EventEngine;})();

module.exports = EventEngine;
},{}]},{},[1])
(1)
});