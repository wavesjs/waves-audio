import AudioTimeEngine from '../core/AudioTimeEngine';

function optOrDef(opt, def) {
  if(opt !== undefined)
    return opt;

  return def;
}

/**
 * Metronome audio engine. It extends Time Engine as a transported interface.
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/metronome/index.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const metronome = new audio.Metronome({period: 0.333});
 *
 * scheduler.add(metronome);
 *
 * @param {Object} [options={}] - Default options
 * @param {Number} [options.period=1] - Metronome period
 * @param {Number} [options.clickFreq=600] - Metronome click frequency
 * @param {Number} [options.clickAttack=0.002] - Metronome click attack time
 * @param {Number} [options.clickRelease=0.098] - Metronome click release time
 * @param {Number} [options.gain=1] - Gain
 */
class Metronome extends AudioTimeEngine {
  constructor(options = {}) {
    super(options.audioContext);

    /**
     * Metronome period
     * @type {Number}
     * @private
     */
    this.__period = optOrDef(options.period, 1);

    /**
     * Metronome click frequency
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickFreq
     * @instance
     */
    this.clickFreq = optOrDef(options.clickFreq, 600);

    /**
     * Metronome click attack time
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickAttack
     * @instance
     */
    this.clickAttack = optOrDef(options.clickAttack, 0.002);

    /**
     * Metronome click release time
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickRelease
     * @instance
     */
    this.clickRelease = optOrDef(options.clickRelease, 0.098);

    this.__lastTime = 0;
    this.__phase = 0;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = optOrDef(options.gain, 1);

    this.outputNode = this.__gainNode;
  }

  // TimeEngine method (scheduled interface)
  advanceTime(time) {
    this.trigger(time);
    this.__lastTime = time;
    return time + this.__period;
  }

  // TimeEngine method (transported interface)
  syncPosition(time, position, speed) {
    if (this.__period > 0) {
      var nextPosition = (Math.floor(position / this.__period) + this.__phase) * this.__period;

      if (speed > 0 && nextPosition < position)
        nextPosition += this.__period;
      else if (speed < 0 && nextPosition > position)
        nextPosition -= this.__period;

      return nextPosition;
    }

    return Infinity * speed;
  }

  // TimeEngine method (transported interface)
  advancePosition(time, position, speed) {
    this.trigger(time);

    if (speed < 0)
      return position - this.__period;

    return position + this.__period;
  }

  /**
   * Trigger metronome click
   * @param {Number} time metronome click synthesis audio time
   */
  trigger(time) {
    const audioContext = this.audioContext;
    const clickAttack = this.clickAttack;
    const clickRelease = this.clickRelease;

    const env = audioContext.createGain();
    env.gain.value = 0.0;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(1.0, time + clickAttack);
    env.gain.exponentialRampToValueAtTime(0.0000001, time + clickAttack + clickRelease);
    env.gain.setValueAtTime(0, time);
    env.connect(this.outputNode);

    const osc = audioContext.createOscillator();
    osc.frequency.value = this.clickFreq;
    osc.start(time);
    osc.stop(time + clickAttack + clickRelease);
    osc.connect(env);
  }

  /**
   * linear gain factor
   *
   * @type {Number}
   * @name gain
   * @memberof Metronome
   * @instance
   */
  set gain(value) {
    this.__gainNode.gain.value = value;
  }

  get gain() {
    return this.__gainNode.gain.value;
  }

  /**
   * metronome period
   *
   * @type {Number}
   * @name period
   * @memberof Metronome
   * @instance
   */
  set period(period) {
    this.__period = period;

    const master = this.master;

    if (master) {
      if (master.resetEngineTime)
        master.resetEngineTime(this, this.__lastTime + period);
      else if (master.resetEnginePosition)
        master.resetEnginePosition(this);
    }
  }

  get period() {
    return this.__period;
  }

  /**
   * Set phase parameter (available only when 'transported'), should be
   * between [0, 1[
   *
   * @type {Number}
   * @name phase
   * @memberof Metronome
   * @instance
   */
  set phase(phase) {
    this.__phase = phase - Math.floor(phase);

    const master = this.master;

    if (master && master.resetEnginePosition !== undefined)
      master.resetEnginePosition(this);
  }

  get phase() {
    return this.__phase;
  }
}

export default Metronome;
