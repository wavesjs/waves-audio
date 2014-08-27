/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio metronome engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("audio-context");
var EventEngine = require("event-engine");

class Metronome extends EventEngine {
  constructor(period = 1, frequency = 600, attack = 0.002, release = 0.098) {
    super();

    this.period = period; // in sec
    this.frequency = frequency;
    this.attack = attack;
    this.release = release;

    this.__phase = 0;
    this.__aligned = true;

    this.__gainNode = audioContext.createGain();
    this.outputNode = this.__gainNode;
  }

  // EventEngine syncEvent
  syncEvent(time) {
    var cycles = -this.__phase;

    if (this.__aligned || this.transport) // is always aligned in transport
      cycles += time / this.period;

    if (this.transport && this.transport.reverse)
      cycles *= -1;

    var delay = (Math.ceil(cycles) - cycles) * this.period;

    return delay;
  }

  // EventEngine executeEvent
  executeEvent(time, audioTime) {
    this.trigger(audioTime);
    return this.period;
  }

  trigger(audioTime) {
    var attack = this.attack;
    var release = this.release;
    var period = this.period;

    if (period < this.attack + this.release) {
      var scale = period / (this.attack + this.release);
      attack *= scale;
      release *= scale;
    }

    this.__envNode = audioContext.createGain();
    this.__envNode.gain.value = 0.0;
    this.__envNode.gain.setValueAtTime(0, audioTime);
    this.__envNode.gain.linearRampToValueAtTime(1.0, audioTime + attack);
    this.__envNode.gain.exponentialRampToValueAtTime(0.0000001, audioTime + attack + release);
    this.__envNode.gain.setValueAtTime(0, audioTime);
    this.__envNode.connect(this.__gainNode);

    this.__osc = audioContext.createOscillator();
    this.__osc.frequency.value = this.frequency;
    this.__osc.start(0);
    this.__osc.stop(audioTime + attack + release);
    this.__osc.connect(this.__envNode);
  }

  set gain(value) {
    this.__gainNode.gain.value = value;
  }

  get gain() {
    return this.__gainNode.gain.value;
  }

  set phase(phase) {
    this.__phase = phase;
    this.resyncEngine();
  }

  get phase() {
    return this.__phase;
  }

  set aligned(aligned) {
    this.__aligned = aligned;
    this.resyncEngine();
  }

  get aligned() {
    return this.__aligned;
  }
}

module.exports = Metronome;