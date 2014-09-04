/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio metronome engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("audio-context");
var TimeEngine = require("time-engine");

var Metronome = (function(super$0){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};MIXIN$0(Metronome, super$0);var $proto$0={};
  function Metronome() {var period = arguments[0];if(period === void 0)period = 1;
    super$0.call(this, true);

    /**
     * Metronome period in sec
     * @type {Number}
     */
    this.period = period;

    /**
     * Metronome click frequency
     * @type {Number}
     */
    this.clickFreq = 600;

    /**
     * Metronome click attack time
     * @type {Number}
     */
    this.clickAttack = 0.002;

    /**
     * Metronome click release time
     * @type {Number}
     */
    this.clickRelease = 0.098;

    this.__phase = 0;
    this.__aligned = true;

    this.outputNode = this.__gainNode = audioContext.createGain();
  }Metronome.prototype = Object.create(super$0.prototype, {"constructor": {"value": Metronome, "configurable": true, "writable": true}, gain: {"get": gain$get$0, "set": gain$set$0, "configurable": true, "enumerable": true}, phase: {"get": phase$get$0, "set": phase$set$0, "configurable": true, "enumerable": true}, aligned: {"get": aligned$get$0, "set": aligned$set$0, "configurable": true, "enumerable": true} });DP$0(Metronome, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  // TimeEngine syncNext
  $proto$0.syncNext = function(time) {
    var cycles = -this.__phase;

    if (this.__aligned || this.transport) // is always aligned in transport
      cycles += time / this.period;

    if (this.transport && this.transport.reverse)
      cycles *= -1;

    var delay = (Math.ceil(cycles) - cycles) * this.period;

    return delay;
  };

  // TimeEngine executeNext
  $proto$0.executeNext = function(time, audioTime) {
    this.trigger(audioTime);
    return this.period;
  };

  /**
   * Trigger metronome click
   * @param {Number} audioTime metronome click synthesis audio time
   */
  $proto$0.trigger = function(audioTime) {
    var clickAttack = this.clickAttack;
    var clickRelease = this.clickRelease;
    var period = this.period;

    if (period < (clickAttack + clickRelease)) {
      var scale = period / (clickAttack + clickRelease);
      clickAttack *= scale;
      clickRelease *= scale;
    }

    this.__envNode = audioContext.createGain();
    this.__envNode.gain.value = 0.0;
    this.__envNode.gain.setValueAtTime(0, audioTime);
    this.__envNode.gain.linearRampToValueAtTime(1.0, audioTime + clickAttack);
    this.__envNode.gain.exponentialRampToValueAtTime(0.0000001, audioTime + clickAttack + clickRelease);
    this.__envNode.gain.setValueAtTime(0, audioTime);
    this.__envNode.connect(this.__gainNode);

    this.__osc = audioContext.createOscillator();
    this.__osc.frequency.value = this.clickFreq;
    this.__osc.start(0);
    this.__osc.stop(audioTime + clickAttack + clickRelease);
    this.__osc.connect(this.__envNode);
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
   * Set metronome phase
   * @param {Number} phase metronome phase (0...1)
   */
  function phase$set$0(phase) {
    this.__phase = phase - Math.floor(phase);
    this.resyncEngine();
  }

  /**
   * Get metronome phase
   * @return {Number} current metronome phase
   */
  function phase$get$0() {
    return this.__phase;
  }

  /**
   * Set whether metronome clicks are aligned to the absolute scheduling time
   * @param {Bool} aligned whether metronome is aligned to absolute time
   *
   * Aligning the metronome to the absolute scheduling time allows for synchronizing the phases of multiple metronomes.
   */
  function aligned$set$0(aligned) {
    this.__aligned = aligned;
    this.resyncEngine();
  }

  /**
   * Get whether metronome clicks are aligned to the absolute scheduling time
   * @return {Bool} whether metronome is aligned to absolute time
   */
  function aligned$get$0() {
    return this.__aligned;
  }
MIXIN$0(Metronome.prototype,$proto$0);$proto$0=void 0;return Metronome;})(TimeEngine);

module.exports = Metronome;