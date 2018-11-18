import AudioTimeEngine from '../core/AudioTimeEngine';

function optOrDef(opt, def) {
  if(opt !== undefined)
    return opt;

  return def;
}

/**
 * Used with a buffer to serve audio files.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/player-engine/index.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const playerEngine = audio.PlayerEngine();
 * const playControl = new audio.PlayControl(playerEngine);
 *
 * playControl.start();
 *
 * @param {Object} [options={}] - Default options
 * @param {Number} [options.buffer=1] - Audio buffer
 * @param {Number} [options.fadeTime=0.005] - Fade time for chaining segments
 * @param {Number} [options.cyclic=false] - Loop mode
 * @param {Number} [options.gain=1] - Gain
 */
class PlayerEngine extends AudioTimeEngine {
  constructor(options = {}) {
    super(options.audioContext);

    this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     *
     * @type {AudioBuffer}
     * @name buffer
     * @memberof PlayerEngine
     * @instance
     * @default null
     */
    this.buffer = optOrDef(options.buffer, null);

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     *
     * @type {Number}
     * @name fadeTime
     * @memberof PlayerEngine
     * @instance
     * @default 0.005
     */
    this.fadeTime = optOrDef(options.fadeTime, 0.005);

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__bufferSource = null;
    this.__envNode = null;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = optOrDef(options.gain, 1);

    this.__cyclic = optOrDef(options.cyclic, false);

    this.outputNode = this.__gainNode;
  }

  __start(time, position, speed) {
    var audioContext = this.audioContext;

    if (this.buffer) {
      var bufferDuration = this.buffer.duration;

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
  }

  __halt(time) {
    if (this.__bufferSource) {
      this.__envNode.gain.cancelScheduledValues(time);
      this.__envNode.gain.setValueAtTime(this.__envNode.gain.value, time);
      this.__envNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
      this.__bufferSource.stop(time + this.fadeTime);

      this.__bufferSource = null;
      this.__envNode = null;
    }
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed, seek = false) {
    var lastSpeed = this.__speed;

    if (speed !== lastSpeed || seek) {
      if (seek || lastSpeed * speed < 0) {
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
  }

  /**
   * Set whether the audio buffer is considered as cyclic
   * @type {Bool}
   * @name cyclic
   * @memberof PlayerEngine
   * @instance
   */
  set cyclic(cyclic) {
    if (cyclic !== this.__cyclic) {
      var time = this.currentTime;
      var position = this.currentosition;

      this.__halt(time);
      this.__cyclic = cyclic;

      if (this.__speed !== 0)
        this.__start(time, position, this.__speed);
    }
  }

  get cyclic() {
    return this.__cyclic;
  }

  /**
   * Linear gain factor
   * @type {Number}
   * @name gain
   * @memberof PlayerEngine
   * @instance
   */
  set gain(value) {
    var time = this.currentTime;
    this.__gainNode.gain.cancelScheduledValues(time);
    this.__gainNode.gain.setValueAtTime(this.__gainNode.gain.value, time);
    this.__gainNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
  }

  get gain() {
    return this.__gainNode.gain.value;
  }

  /**
   * Get buffer duration
   * @type {Number}
   * @name bufferDuration
   * @memberof PlayerEngine
   * @instance
   * @readonly
   */
  get bufferDuration() {
    if(this.buffer)
      return this.buffer.duration;

    return 0;
  }
}

export default PlayerEngine;
