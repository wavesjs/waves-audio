/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio player engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("../audio-context");
var TimeEngine = require("../time-engine");

var PlayerEngine = (function(super$0){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};MIXIN$0(PlayerEngine, super$0);var $proto$0={};
  function PlayerEngine() {var buffer = arguments[0];if(buffer === void 0)buffer = null;
    this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = buffer;

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     * @type {AudioBuffer}
     */
    this.fadeTime = 0.005;

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;
    this.__cyclic = false;

    this.__bufferSource = null;
    this.__envNode = null;

    this.__playingSpeed = 1;

    this.outputNode = this.__gainNode = audioContext.createGain();
  }PlayerEngine.prototype = Object.create(super$0.prototype, {"constructor": {"value": PlayerEngine, "configurable": true, "writable": true}, cyclic: {"get": cyclic$get$0, "set": cyclic$set$0, "configurable": true, "enumerable": true}, gain: {"get": gain$get$0, "set": gain$set$0, "configurable": true, "enumerable": true} });DP$0(PlayerEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  $proto$0.__start = function(time, position, speed) {
    if (this.buffer) {
      var bufferDuration = this.buffer.duration;

      if (this.buffer.wrapAroundExtension)
        bufferDuration -= this.buffer.wrapAroundExtension;

      if (this.__cyclic && (position < 0 || position >= bufferDuration)) {
        var phase = position / bufferDuration;
        position = (phase - Math.floor(phase)) * bufferDuration;
      }

      if (position >= 0 && position < bufferDuration && speed > 0) {
        this.__envNode = audioContext.createGain();
        this.__envNode.gain.setValueAtTime(0, time);
        this.__envNode.gain.linearRampToValueAtTime(1, time + this.fadeTime);
        this.__envNode.connect(this.__gainNode);

        this.__bufferSource = audioContext.createBufferSource();
        this.__bufferSource.buffer = this.buffer;
        this.__bufferSource.playbackRate.value = speed;
        this.__bufferSource.loop = this.__cyclic;
        this.__bufferSource.loopStart = 0;
        this.__bufferSource.loopEnd = bufferDuration;
        this.__bufferSource.start(time, position);
        this.__bufferSource.connect(this.__envNode);
      }
    }
  };

  $proto$0.__halt = function(time) {
    if (this.__bufferSource) {
      this.__envNode.gain.cancelScheduledValues(time);
      this.__envNode.gain.setValueAtTime(this.__envNode.gain.value, time);
      this.__envNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
      this.__bufferSource.stop(time + this.fadeTime);

      this.__bufferSource = null;
      this.__envNode = null;
    }
  };

  // TimeEngine method (speed-controlled interface)
  $proto$0.syncSpeed = function(time, position, speed) {var seek = arguments[3];if(seek === void 0)seek = false;
    var lastSpeed = this.__speed;

    if (speed !== lastSpeed || seek) {
      if(seek || lastSpeed * speed < 0) {
        this.__halt(time);
        this.__start(time, position, speed);
      } else if (lastSpeed === 0 || seek) {
        this.__start(time, position, speed);
      } else if (speed === 0) {
        this.__halt(time);
      } else if (this.__bufferSource) {
        this.__bufferSource.playbackRate.setValueAtTime(speed, time);
      }

      this.__speed = speed;
    }
  };

  /**
   * Set whether the audio buffer is considered as cyclic
   * @param {Bool} cyclic whether the audio buffer is considered as cyclic
   */
  function cyclic$set$0(cyclic) {
    if (cyclic !== this.__cyclic) {
      var time = this.getSchedulerTime();
      var position = this.getTransportPosition();

      this.__halt(time);
      this.__cyclic = cyclic;

      if (this.__speed !== 0)
        this.__start(time, position, this.__speed);
    }
  }

  /**
   * Get whether the audio buffer is considered as cyclic
   * @return {Bool} whether the audio buffer is considered as cyclic
   */
  function cyclic$get$0() {
    return this.__cyclic;
  }

  /**
   * Set gain
   * @param {Number} value linear gain factor
   */
  function gain$set$0(value) {
    var time = this.__sync();

    this.__gainNode.cancelScheduledValues(time);
    this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
    this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
  }

  /**
   * Get gain
   * @return {Number} current gain
   */
  function gain$get$0() {
    return this.__gainNode.gain.value;
  }
MIXIN$0(PlayerEngine.prototype,$proto$0);$proto$0=void 0;return PlayerEngine;})(TimeEngine);

module.exports = PlayerEngine;