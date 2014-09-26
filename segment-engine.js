!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.SegmentEngine=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio granular engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = _dereq_("audio-context");
var TimeEngine = _dereq_("time-engine");

var SegmentEngine = (function(super$0){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};MIXIN$0(SegmentEngine, super$0);var $proto$0={};

  function SegmentEngine() {var buffer = arguments[0];if(buffer === void 0)buffer = null;
    super$0.call(this, false); // by default segments don't sync to transport position

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
  }SegmentEngine.prototype = Object.create(super$0.prototype, {"constructor": {"value": SegmentEngine, "configurable": true, "writable": true}, gain: {"get": gain$get$0, "set": gain$set$0, "configurable": true, "enumerable": true} });DP$0(SegmentEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  // TimeEngine method (transported interface)
  $proto$0.syncPosition = function(time, position, speed) {
    return Infinity;
  };

  // TimeEngine method (transported interface)
  $proto$0.advancePosition = function(time, position, speed) {
    return Infinity;
  };

  // TimeEngine method (transported interface)
  $proto$0.advanceTime = function(time, position, speed) {
    return time + this.trigger(time);
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
   * Trigger a segment
   * @param {Number} audioTime segment synthesis audio time
   * @return {Number} period to next segment
   *
   * This function can be called at any time (whether the engine is scheduled or not)
   * to generate a single segment according to the current segment parameters.
   */
  $proto$0.trigger = function(audioTime) {
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
  };
MIXIN$0(SegmentEngine.prototype,$proto$0);$proto$0=void 0;return SegmentEngine;})(TimeEngine);

module.exports = SegmentEngine;
},{"audio-context":2,"time-engine":3}],2:[function(_dereq_,module,exports){
/* Generated by es6-transpiler v 0.7.14-2 */
// instantiates an audio context in the global scope if not there already
var context = window.audioContext || new AudioContext() || new webkitAudioContext();
window.audioContext = context;
module.exports = context;
},{}],3:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var TimeEngine = (function(){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var $proto$0={};

  function TimeEngine() {
    /**
     * Time master to which the time engine is synchronized
     * @type {Object}
     */
    this.timeMaster = null;

    /**
     * Position master to which the time engine is synchronized
     * @type {Object}
     */
    this.positionMaster = null;

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }DP$0(TimeEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /**
   * Advance engine time
   * @param {Number} time current master time (based on audio time)
   * @return {Number} next engine time
   *
   * This function is called by the time master to let the engine do its work
   * synchronized to the master's time.
   * If the engine returns Infinity, it is not called again until it is restarted by the master 
   * or it calls resyncEnginePosition() with a valid position.
   */
  $proto$0.advanceTime = function(time) {
    return Infinity;
  };

  /**
   * Reset engine time at master
   * @param {Number} time new engine time, implies current master time if not given
   * 
   * This function is called by the engine itself to rectify its next time.
   */
  $proto$0.resetEngineTime = function(time) {
    if (this.timeMaster)
      this.timeMaster.reset(this, time);
  };

  /**
   * Synchronize engine to master position
   * @param {Number} time current master time (based on audio time)
   * @param {Number} position current master position to synchronize to
   * @param {Bool} whether position runs backward (current playing direction)
   * @return {Number} next position (given the playing direction)
   *
   * This function allows the engine for synchronizing (seeking) to the current master position
   * and to return its next position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is 
   * resynchronized by the master or it calls resyncEnginePosition().
   */
  $proto$0.syncPosition = function(time, position) {var reverse = arguments[2];if(reverse === void 0)reverse = false;
    return Infinity;
  };

  /**
   * Advance engine position
   * @param {Number} time current master time (based on audio time)
   * @param {Number} position current master position
   * @param {Bool} whether position runs backward (current playing direction)
   * @return {Number} next engine position (given the playing direction)
   *
   * This function is called by the position master to let the engine do its work
   * aligned to the master's position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is 
   * resynchronized by the master or it calls resyncEnginePosition().
   */
  $proto$0.advancePosition = function(time, position) {var reverse = arguments[2];if(reverse === void 0)reverse = false;
    return Infinity;
  };

  /**
   * Request the position master to resynchronize the engine's position
   *
   * This function is called by the engine itself and will result in syncTransportPosition() 
   * being called with the current master position.
   */
  $proto$0.resyncEnginePosition = function() {
    if (this.positionMaster)
      this.positionMaster.resync(this);
  };

  /**
   * Connect audio node
   * @param {Object} target audio node
   */
  $proto$0.connect = function(target) {
    this.outputNode.connect(target);
    return this;
  };

  /**
   * Disconnect audio node
   * @param {Number} connection connection to be disconnected
   */
  $proto$0.disconnect = function(connection) {
    this.outputNode.disconnect(connection);
    return this;
  };
MIXIN$0(TimeEngine.prototype,$proto$0);$proto$0=void 0;return TimeEngine;})();

module.exports = TimeEngine;
},{}]},{},[1])
(1)
});