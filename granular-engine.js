!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.GranularEngine=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio granular synthesis engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = _dereq_("audio-context");
var TimeEngine = _dereq_("time-engine");

/**
 * @class GranularEngine
 * @param {AudioBuffer} buffer audio buffer initial for granular synthesis
 */
var GranularEngine = (function(super$0){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};MIXIN$0(GranularEngine, super$0);var $proto$0={};
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

    this.__phase = 0;
    this.__aligned = true;

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
          var phase = grainPosition / bufferDuration;
          grainPosition = (phase - Math.floor(phase)) * bufferDuration;

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

var audioContext = _dereq_("audio-context");

/**
 * @class TimeEngine
 * @classdesc Base class for time engines
 *
 * Time engines are components that generate more or less regular audio events and/or playback a media stream.
 * They implement one or multiple imterfaces to be synchronized by a master such as a scheduler, a transport or a play-control.
 * The provided interfaces are "scheduled", "transported", and "play-controlled".
 * 
 * In the "scheduled" interface the engine implements a method "advanceTime" that is called by the master (usually teh scheduler) 
 * and returns the delay until the next call of "advanceTime". The master provides the engien with a function "resetNextTime" 
 * to reschedule the next call to another time.
 *
 * In the "transported" interface the master (usually a transport) first calls the method "syncPosition" that returns the position
 * of the first event generated by the engine regarding the playing direction (sign of the speed argument). Events are generated 
 * through the method "advancePosition" that returns the position of the next event generated through "advancePosition".
 *
 * In the "speed-controlled" interface the engine is controlled by the method "syncSpeed".
 *
 * For all interfaces the engine is provided with the attribute getters "currentTime" and "currentPosition" (for the case that the master 
 * does not implement these attributte getters, the base class provides default implementations).
 */
var TimeEngine = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};

  /**
   * @constructor
   */
  function TimeEngine() {

    /**
     * Interface currently used
     * @type {String}
     */
    this.interface = null;

    /**
     * Transport start position of the engine (handled by )
     * @type {Object}
     */
    this.transportStartPosition = 0;

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }DPS$0(TimeEngine.prototype,{currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}, currentPosition: {"get": $currentPosition_get$0, "configurable":true,"enumerable":true}});DP$0(TimeEngine,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  /**
   * Get the time engine's current master time
   * @type {Function}
   *
   * This function provided by the master.
   */
  function $currentTime_get$0() {
    return audioContext.currentTime;
  }

  /**
   * Get the time engine's current master position
   * @type {Function}
   *
   * This function provided by the master.
   */
  function $currentPosition_get$0() {
    return 0;
  };

  /**
   * Advance engine time (scheduled interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @return {Number} next engine time
   *
   * This function is called by the scheduler to let the engine do its work
   * synchronized to the scheduler time.
   * If the engine returns Infinity, it is not called again until it is restarted by
   * the scheduler or it calls resetNextPosition with a valid position.
   */
  // advanceTime(time) {
  //   return time;
  // }

  /**
   * Function provided by the scheduler to reset the engine's next time
   * @param {Number} time new engine time (immediately if not specified)
   */
  proto$0.resetNextTime = function() {var time = arguments[0];if(time === void 0)time = null;};

  /**
   * Synchronize engine to transport position (transported interface)
   * @param {Number} position current transport position to synchronize to
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} speed current speed
   * @return {Number} next position (given the playing direction)
   *
   * This function is called by the msater and allows the engine for synchronizing
   * (seeking) to the current transport position and to return its next position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the transport or it calls resetNextPosition.
   */
  // syncPosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Advance engine position (transported interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} position current transport position
   * @param {Number} speed current speed
   * @return {Number} next engine position (given the playing direction)
   *
   * This function is called by the transport to let the engine do its work
   * aligned to the transport's position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the transport or it calls resetNextPosition.
   */
  // advancePosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Function provided by the transport to reset the next position or to request resynchronizing the engine's position
   * @param {Number} position new engine position (will call syncPosition with the current position if not specified)
   */
  proto$0.resetNextPosition = function() {var position = arguments[0];if(position === void 0)position = null;};;

  /**
   * Set engine speed (speed-controlled interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} position current transport position
   * @param {Number} speed current transport speed
   *
   * This function is called by the transport to propagate the transport speed to the engine.
   * The speed can be of any bewteen -16 and 16.
   * With a speed of 0 the engine is halted.
   */
  // syncSpeed(time, position, speed) {
  // }

  proto$0.__setGetters = function(getCurrentTime, getCurrentPosition) {
    if (getCurrentTime) {
      Object.defineProperty(this, 'currentTime', {
        configurable: true,
        get: getCurrentTime,
        set: function(time) {}
      });
    }

    if (getCurrentPosition) {
      Object.defineProperty(this, 'currentPosition', {
        configurable: true,
        get: getCurrentPosition,
        set: function(position) {}
      });
    }
  };

  proto$0.__deleteGetters = function() {
    delete this.currentTime;
    delete this.currentPosition;
  };

  proto$0.setScheduled = function(resetNextTime, getCurrentTime, getCurrentPosition) {
    this.interface = "scheduled";
    this.__setGetters(getCurrentTime, getCurrentPosition);
    if (resetNextTime)
      this.resetNextTime = resetNextTime;
  };

  proto$0.setTransported = function(startPosition, resetNextPosition, getCurrentTime, getCurrentPosition) {
    this.interface = "transported";
    this.transportStartPosition = startPosition;
    this.__setGetters(getCurrentTime, getCurrentPosition);
    if (resetNextPosition)
      this.resetNextPosition = resetNextPosition;
  };

  proto$0.setSpeedControlled = function(getCurrentTime, getCurrentPosition) {
    this.interface = "speed-controlled";
    this.__setGetters(getCurrentTime, getCurrentPosition);
  };

  proto$0.resetInterface = function() {
    this.__deleteGetters();
    delete this.resetNextTime;
    delete this.resetNextPosition;
    this.transportStartPosition = 0;
    this.interface = null;
  };

  /**
   * Connect audio node
   * @param {Object} target audio node
   */
  proto$0.connect = function(target) {
    this.outputNode.connect(target);
    return this;
  };

  /**
   * Disconnect audio node
   * @param {Number} connection connection to be disconnected
   */
  proto$0.disconnect = function(connection) {
    this.outputNode.disconnect(connection);
    return this;
  };
MIXIN$0(TimeEngine.prototype,proto$0);proto$0=void 0;return TimeEngine;})();

/**
 * Check whether the time engine implements the scheduled interface
 **/
TimeEngine.implementsScheduled = function(engine) {
  return (engine.advanceTime && engine.advanceTime instanceof Function);
}

/**
 * Check whether the time engine implements the transported interface
 **/
TimeEngine.implementsTransported = function(engine) {
  return (
    engine.syncPosition && engine.syncPosition instanceof Function &&
    engine.advancePosition && engine.advancePosition instanceof Function
  );
}

/**
 * Check whether the time engine implements the speed-controlled interface
 **/
TimeEngine.implementsSpeedControlled = function(engine) {
  return (engine.syncSpeed && engine.syncSpeed instanceof Function);
}

module.exports = TimeEngine;
},{"audio-context":4}],4:[function(_dereq_,module,exports){
module.exports=_dereq_(2)
},{}]},{},[1])
(1)
});