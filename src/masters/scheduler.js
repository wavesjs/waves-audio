import debug from 'debug';
import defaultAudioContext from '../core/audio-context';
import SchedulingQueue from '../core/scheduling-queue';

const log = debug('wavesjs:audio');

export default class Scheduler extends SchedulingQueue {
  constructor(options = {}) {
    super();

    this.audioContext = options.audioContext ||  defaultAudioContext;

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = options.period ||  0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = options.lookahead ||  0.1;
  }

  // setTimeout scheduling loop
  __tick() {
    const audioContext = this.audioContext;
    const currentTime = audioContext.currentTime;
    let time = this.__nextTime;

    this.__timeout = null;

    while (time <= currentTime + this.lookahead) {
      this.__currentTime = time;
      time = this.advanceTime(time);
    }

    this.__currentTime = null;
    this.resetTime(time);
  }

  resetTime(time = this.currentTime) {
    if (this.master) {
      this.master.reset(this, time);
    } else {
      if (this.__timeout) {
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }

      if (time !== Infinity) {
        if (this.__nextTime === Infinity)
          log('Scheduler Start');

        const timeOutDelay = Math.max((time - this.lookahead - this.audioContext.currentTime), this.period);

        this.__timeout = setTimeout(() => {
          this.__tick();
        }, timeOutDelay * 1000);
      } else if (this.__nextTime !== Infinity) {
        log('Scheduler Stop');
      }

      this.__nextTime = time;
    }
  }

  get currentTime() {
    if (this.master)
      return this.master.currentTime;

    return this.__currentTime || this.audioContext.currentTime + this.lookahead;
  }

  get currentPosition() {
    const master = this.master;

    if (master && master.currentPosition !== undefined)
      return master.currentPosition;

    return undefined;
  }
}
