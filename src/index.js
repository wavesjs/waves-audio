/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio player engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("audio-context");

class AudioPlayer {

  constructor(buffer = null) {
    this.transport = null; // set when added to transporter

    this.buffer = buffer;
    this.fadeTime = 0.005;

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;
    this.__cyclic = false;

    this.__bufferSource = null;
    this.__envNode = null;

    this.__playingSpeed = 1;

    this.__gainNode = audioContext.createGain();
    this.outputNode = this.__gainNode;
  }

  __sync() {
    if (this.transport) {
      this.__position = this.transport.position;
      this.__time = this.transport.time;
    } else {
      var time = audioContext.currentTime;
      this.__position += (time - this.__time) * this.__speed;
      this.__time = time;
    }

    return this.__time;
  }

  __start(speed) {
    if (this.buffer) {
      var time = this.__time;
      var position = this.__position;

      if (this.__cyclic)
        position %= this.buffer.duration;

      if (position >= 0 && position < this.buffer.duration && speed > 0) {
        this.__envNode = audioContext.createGain();
        this.__envNode.gain.setValueAtTime(0, time);
        this.__envNode.gain.linearRampToValueAtTime(1, time + this.fadeTime);
        this.__envNode.connect(this.__gainNode);

        this.__bufferSource = audioContext.createBufferSource();
        this.__bufferSource.buffer = this.buffer;
        this.__bufferSource.playbackRate.value = speed;
        this.__bufferSource.loop = this.__cyclic;
        this.__bufferSource.start(time, position);
        this.__bufferSource.connect(this.__envNode);
      }
    }
  }

  __stop() {
    if (this.__bufferSource) {
      var time = this.__time;

      this.__envNode.gain.cancelScheduledValues(time);
      this.__envNode.gain.setValueAtTime(this.__envNode.gain.value, time);
      this.__envNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
      this.__bufferSource.stop(time + this.fadeTime);

      this.__bufferSource = null;
      this.__envNode = null;
    }
  }

  set speed(speed) {
    if (speed !== this.__speed) {
      var time = this.__sync();

      if (this.__speed === 0)
        this.__start(speed);
      else if (speed === 0)
        this.__stop();
      else if(this.__speed * speed < 0) {
        this.__stop();
        this.__start(speed);        
      } else if(this.__bufferSource)
        this.__bufferSource.playbackRate.setValueAtTime(speed, time);

      this.__speed = speed;
    }
  }

  get speed() {
    return this.__speed;
  }

  seek(position) {
    if (position !== this.__position) {
      this.__sync();

      this.__stop();
      this.__position = position;
      this.__start(this.__speed);
    }
  }

  set cyclic(cyclic) {
    if (cyclic !== this.__cyclic) {
      this.__sync();

      this.__stop();
      this.__cyclic = cyclic;
      this.__start(this.__speed);
    }
  }

  get cyclic() {
    return this.__cyclic;
  }

  set gain(value) {
    var time = this.__sync();

    this.__gainNode.cancelScheduledValues(time);
    this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
    this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
  }

  get gain() {
    return this.__gainNode.gain.value;
  }

  /**
   * Start playing (high level API)
   */
  startPlaying(seek = null, speed = null) {
    if (seek)
      this.seek(seek);

    if (speed)
      this.playingSpeed = speed;

    this.speed = this.playingSpeed;
  }

  /**
   * Pause playing (high level API)
   */
  pausePlaying() {
    this.speed = 0;
  }

  /**
   * Stop playing (high level API)
   */
  stopPlaying() {
    this.speed = 0;
    this.seek(0);
  }

  /**
   * Set playing speed (high level API)
   */
  set playingSpeed(value) {
    if (value >= 0) {
      if (value < 0.0625)
        value = 0.0625;
      else if (value > 16)
        value = 16;
    } else {
      if (value < -16)
        value = -16
      else if (value > -0.0625)
        value = -0.0625;
    }

    this.__playingSpeed = value;

    if (this.__speed !== 0)
      this.speed = value;
  }

  /**
   * Get playing speed (high level API)
   */
  get playingSpeed() {
    return this.__playingSpeed;
  }

  connect(target) {
    this.__gainNode.connect(target);
  }

  disconnect(output) {
    this.__gainNode.disconnect(output);
  }
}

module.exports = AudioPlayer;