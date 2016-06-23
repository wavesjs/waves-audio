import AudioTimeEngine from '../core/audio-time-engine';

function optOrDef(opt, def) {
  if(opt !== undefined)
    return opt;

  return def;
}

export default class Metronome extends AudioTimeEngine {
  constructor(options = {}) {
    super(options.audioContext);

    /**
     * Metronome period
     * @type {Number}
     */
    this.__period = optOrDef(options.period, 1);

    /**
     * Metronome click frequency
     * @type {Number}
     */
    this.clickFreq = optOrDef(options.clickFreq, 600);

    /**
     * Metronome click attack time
     * @type {Number}
     */
    this.clickAttack = optOrDef(options.clickAttack, 0.002);

    /**
     * Metronome click release time
     * @type {Number}
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
   * Set period parameter
   * @param {Number} period metronome period
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

  /**
   * Get period parameter
   * @return {Number} value of period parameter
   */
  get period() {
    return this.__period;
  }

  /**
   * Set phase parameter (available only when 'transported')
   * @param {Number} phase metronome phase [0, 1[
   */
  set phase(phase) {
    this.__phase = phase - Math.floor(phase);

    const master = this.master;

    if (master && master.resetEnginePosition !== undefined)
      master.resetEnginePosition(this);
  }

  /**
   * Get phase parameter
   * @return {Number} value of phase parameter
   */
  get phase() {
    return this.__phase;
  }
}
