!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.AudioPlayer=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio player engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = _dereq_("audio-context");

var AudioPlayer = (function(){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var $proto$0={};

  function AudioPlayer() {var buffer = arguments[0];if(buffer === void 0)buffer = null;
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
  }Object.defineProperties(AudioPlayer.prototype, {speed: {"get": speed$get$0, "set": speed$set$0, "configurable": true, "enumerable": true}, cyclic: {"get": cyclic$get$0, "set": cyclic$set$0, "configurable": true, "enumerable": true}, gain: {"get": gain$get$0, "set": gain$set$0, "configurable": true, "enumerable": true}, playingSpeed: {"get": playingSpeed$get$0, "set": playingSpeed$set$0, "configurable": true, "enumerable": true}});DP$0(AudioPlayer, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  $proto$0.__sync = function() {
    if (this.transport) {
      this.__position = this.transport.position;
      this.__time = this.transport.time;
    } else {
      var time = audioContext.currentTime;
      this.__position += (time - this.__time) * this.__speed;
      this.__time = time;
    }

    return this.__time;
  };

  $proto$0.__start = function(speed) {
    if (this.buffer) {
      var time = this.__time;
      var position = this.__position;
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

  $proto$0.__stop = function() {
    if (this.__bufferSource) {
      var time = this.__time;

      this.__envNode.gain.cancelScheduledValues(time);
      this.__envNode.gain.setValueAtTime(this.__envNode.gain.value, time);
      this.__envNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
      this.__bufferSource.stop(time + this.fadeTime);

      this.__bufferSource = null;
      this.__envNode = null;
    }
  };

  /**
   * Set speed
   * @param {Number} speed speed (a speed of 0 corrsponds to stop or pause)
   */
  function speed$set$0(speed) {
    if (speed !== this.__speed) {
      var time = this.__sync();

      if (this.__speed === 0)
        this.__start(speed);
      else if (speed === 0)
        this.__stop();
      else if (this.__speed * speed < 0) {
        this.__stop();
        this.__start(speed);
      } else if (this.__bufferSource)
        this.__bufferSource.playbackRate.setValueAtTime(speed, time);

      this.__speed = speed;
    }
  }

  /**
   * Get current speed
   * @return {Number} current speed
   */
  function speed$get$0() {
    return this.__speed;
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  $proto$0.seek = function(position) {
    if (position !== this.__position) {
      this.__sync();

      this.__stop();
      this.__position = position;

      if (this.__speed !== 0)
        this.__start(this.__speed);
    }
  };

  /**
   * Set whether the audio buffer is considered as cyclic
   * @param {Bool} cyclic whether the audio buffer is considered as cyclic
   */
  function cyclic$set$0(cyclic) {
    if (cyclic !== this.__cyclic) {
      this.__sync();

      this.__stop();
      this.__cyclic = cyclic;

      if (this.__speed !== 0)
        this.__start(this.__speed);
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

  /**
   * Start playing (high level player API)
   * @param {Number} seek start position
   * @param {Number} speed playing speed
   */
  $proto$0.startPlaying = function() {var seek = arguments[0];if(seek === void 0)seek = null;var speed = arguments[1];if(speed === void 0)speed = null;
    if (seek)
      this.seek(seek);

    if (speed)
      this.playingSpeed = speed;

    this.speed = this.playingSpeed;
  };

  /**
   * Pause playing (high level player API)
   */
  $proto$0.pausePlaying = function() {
    this.speed = 0;
  };

  /**
   * Stop playing (high level player API)
   */
  $proto$0.stopPlaying = function() {
    this.speed = 0;
    this.seek(0);
  };

  /**
   * Set playing speed (high level player API)
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  function playingSpeed$set$0(speed) {
    if (speed >= 0) {
      if (speed < 0.0625)
        speed = 0.0625;
      else if (speed > 16)
        speed = 16;
    } else {
      if (speed < -16)
        speed = -16
      else if (speed > -0.0625)
        speed = -0.0625;
    }

    this.__playingSpeed = speed;

    if (this.__speed !== 0)
      this.speed = speed;
  }

  /**
   * Get playing speed (high level player API)
   * @return current playing speed
   */
  function playingSpeed$get$0() {
    return this.__playingSpeed;
  }

  $proto$0.connect = function(target) {
    this.__gainNode.connect(target);
  };

  $proto$0.disconnect = function(connection) {
    this.__gainNode.disconnect(connection);
  };
MIXIN$0(AudioPlayer.prototype,$proto$0);$proto$0=void 0;return AudioPlayer;})();

module.exports = AudioPlayer;
},{"audio-context":2}],2:[function(_dereq_,module,exports){
/* Generated by es6-transpiler v 0.7.14-2 */
// instantiates an audio context in the global scope if not there already
var context = window.audioContext || new AudioContext() || new webkitAudioContext();
window.audioContext = context;
module.exports = context;
},{}]},{},[1])
(1)
});