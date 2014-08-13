/**
 * @fileoverview WAVE audio library element: a web audio granular engine.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 2.1.0
 */
"use strict";

class Metronome {
  constructor(name = "unnamed") {
    this.period = 1 // in sec
    this.attack = 0.002;
    this.release = 0.098;

    this.__gainNode = audioContext.createGain();

    this.__envNode = audioContext.createGain();
    this.__envNode.connect(this.__gainNode);

    this.__osc = audioContext.createOscillator();
    this.__osc.frequency.value = 600;
    this.__osc.start(0);
    this.__osc.connect(this.__envNode);
  }

  trigger(time) {
    var attack = this.attack;
    var release = this.release;

    if (period < this.attack + this.release) {
      var scale = period / (this.attack + this.release);
      attack *= scale;
      release *= scale;
    }

  this.__envNode.gain.setValueAtTime(0.0, time);
  this.__envNode.gain.linearRampToValueAtTime(1.0, time + attack);
  this.__envNode.gain.exponentialRampToValueAtTime(0.0000001, time + attack + release);
}

resetAndReturnNextTime(time) {
  this.__nextEventTime = time;
  return time;
}

makeEventAndReturnNextTime() {
  this.trigger(this.__nextEventTime);
  this.__nextEventTime = this.__nextEventTime + this.period;
  return this.__nextEventTime;
}

set gain(value) {
  this.__gainNode.gain.value = value;
  //console.log(gain);
}

get gain() {
  return this.__gainNode.gain.value;
}

set frequency(value) {
  this.__osc.frequency.value = value;
  //console.log(gain);
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