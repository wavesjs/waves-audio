/**
 * @fileoverview WAVE audio library element: a web audio granular engine.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 2.1.0
 */
"use strict";

var Scheduled = require("../scheduler/scheduled");
//var Transported = require("../transporter/transported");

class ScheduledMetronome extends Scheduled {
  reset(time) {
    return time;
  }

  execute(time) {
    return this.parent.trigger(time);
  }
}

class Metronome {
  constructor(name = "metronome") {
    this.name = name;

    this.period = 1; // in sec
    this.attack = 0.002;
    this.release = 0.098;

    this.__gainNode = audioContext.createGain();

    this.__envNode = audioContext.createGain();
    this.__envNode.gain.value = 0.0;
    this.__envNode.connect(this.__gainNode);

    this.__osc = audioContext.createOscillator();
    this.__osc.frequency.value = 600;
    this.__osc.start(0);
    this.__osc.connect(this.__envNode);

    this.scheduled = new ScheduledMetronome(this);
  }

  trigger(time) {
    var attack = this.attack;
    var release = this.release;
    var period = this.period;

    if (period < this.attack + this.release) {
      var scale = period / (this.attack + this.release);
      attack *= scale;
      release *= scale;
    }

    this.__envNode.gain.setValueAtTime(0.0, time);
    this.__envNode.gain.linearRampToValueAtTime(1.0, time + attack);
    this.__envNode.gain.exponentialRampToValueAtTime(0.0000001, time + attack + release);

    return time + period;
  }

  set gain(value) {
    this.__gainNode.gain.value = value;
  }

  get gain() {
    return this.__gainNode.gain.value;
  }

  set frequency(value) {
    this.__osc.frequency.value = value;
  }

  get frequency() {
    return this.__osc.frequency.value;
  }

  connect(target) {
    this.__gainNode.connect(target);
    return this;
  }

  disconnect(output) {
    this.__gainNode.disconnect(output);
    return this;
  }
}

module.exports = Metronome;