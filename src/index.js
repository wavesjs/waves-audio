/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio metronome engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("../audio-context");
var TimeEngine = require("../time-engine");

class Metronome extends TimeEngine {
  constructor(period = 1) {
    super();

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

    this.outputNode = this.__gainNode = audioContext.createGain();
  }

  // TimeEngine method (scheduled interface)
  advanceTime(time) {
    this.trigger(time);
    return time + this.period;
  }

  // TimeEngine method (transported interface)
  syncPosition(time, position, speed) {
    var nextPosition = (Math.floor(position / this.period) + this.__phase) * this.period;

    if (speed > 0 && nextPosition < position)
      nextPosition += this.period;
    else if (speed < 0 && nextPosition > position)
      nextPosition -= this.period;

    return nextPosition;
  }

  // TimeEngine method (transported interface)
  advancePosition(time, position, speed) {
    this.trigger(time);

    if (speed < 0)
      return position - this.period;

    return position + this.period;
  }

  /**
   * Trigger metronome click
   * @param {Number} time metronome click synthesis audio time
   */
  trigger(time) {
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
    this.__envNode.gain.setValueAtTime(0, time);
    this.__envNode.gain.linearRampToValueAtTime(1.0, time + clickAttack);
    this.__envNode.gain.exponentialRampToValueAtTime(0.0000001, time + clickAttack + clickRelease);
    this.__envNode.gain.setValueAtTime(0, time);
    this.__envNode.connect(this.__gainNode);

    this.__osc = audioContext.createOscillator();
    this.__osc.frequency.value = this.clickFreq;
    this.__osc.start(0);
    this.__osc.stop(time + clickAttack + clickRelease);
    this.__osc.connect(this.__envNode);
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
   * Set phase parameter
   * @param {Number} phase metronome phase (0...1)
   */
  set phase(phase) {
    this.__phase = phase - Math.floor(phase);
    this.resyncEnginePosition();
  }

  /**
   * Get phase parameter
   * @return {Number} value of phase parameter
   */
  get phase() {
    return this.__phase;
  }
}

module.exports = Metronome;