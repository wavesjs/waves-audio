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

  /**
   * Set speed
   * @param {Number} speed speed (a speed of 0 corrsponds to stop or pause)
   */
  set speed(speed) {
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
  get speed() {
    return this.__speed;
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  seek(position) {
    if (position !== this.__position) {
      this.__sync();

      this.__stop();
      this.__position = position;
      this.__start(this.__speed);
    }
  }

  /**
   * Set whether the audio buffer is considered as cyclic
   * @param {Bool} cyclic whether the audio buffer is considered as cyclic
   */
  set cyclic(cyclic) {
    if (cyclic !== this.__cyclic) {
      this.__sync();

      this.__stop();
      this.__cyclic = cyclic;
      this.__start(this.__speed);
    }
  }

  /**
   * Get whether the audio buffer is considered as cyclic
   * @return {Bool} whether the audio buffer is considered as cyclic
   */
  get cyclic() {
    return this.__cyclic;
  }

  /**
   * Set gain
   * @param {Number} value linear gain factor
   */
  set gain(value) {
    var time = this.__sync();

    this.__gainNode.cancelScheduledValues(time);
    this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
    this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
  }

  /**
   * Get gain
   * @return {Number} current gain
   */
  get gain() {
    return this.__gainNode.gain.value;
  }

  /**
   * Start playing (high level player API)
   * @param {Number} seek start position
   * @param {Number} speed playing speed
   */
  startPlaying(seek = null, speed = null) {
    if (seek)
      this.seek(seek);

    if (speed)
      this.playingSpeed = speed;

    this.speed = this.playingSpeed;
  }

  /**
   * Pause playing (high level player API)
   */
  pausePlaying() {
    this.speed = 0;
  }

  /**
   * Stop playing (high level player API)
   */
  stopPlaying() {
    this.speed = 0;
    this.seek(0);
  }

  /**
   * Set playing speed (high level player API)
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  set playingSpeed(speed) {
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
  get playingSpeed() {
    return this.__playingSpeed;
  }

  connect(target) {
    this.__gainNode.connect(target);
  }

  disconnect(connection) {
    this.__gainNode.disconnect(connection);
  }
}

module.exports = AudioPlayer;