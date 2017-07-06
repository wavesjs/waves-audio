import debug from 'debug';
import defaultAudioContext from '../core/audio-context';
import SchedulingQueue from '../core/scheduling-queue';

const log = debug('wavesjs:audio');

/**
 * The `Scheduler` class implements a master for `TimeEngine` or `AudioTimeEngine`
 * instances that implement the *scheduled* interface such as the `Metronome`
 * `GranularEngine`.
 *
 * A `Scheduler` can also schedule simple callback functions.
 * The class is based on recursive calls to `setTimeOut` and uses the
 * `audioContext.currentTime` as logical passed to the `advanceTime` methods
 * of the scheduled engines or to the scheduled callback functions.
 * It extends the `SchedulingQueue` class that itself includes a `PriorityQueue`
 * to assure the order of the scheduled engines (see `SimpleScheduler` for a
 * simplified scheduler implementation without `PriorityQueue`).
 *
 * To get a unique instance of `Scheduler` as the global scheduler of an
 * application, the `getScheduler` factory function should be used. The
 * function accepts an audio context as optional argument and uses the Waves
 * default audio context (see `audioContext`) as
 * default. The factory creates a single scheduler for each audio context.
 *
 * Example that shows three Metronome engines running in a Scheduler:
 * {@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/scheduler.html}
 *
 * @param {Object} [options={}] - default options
 * @param {Number} [options.period=0.025] - period of the scheduler.
 * @param {Number} [options.lookahead=0.1] - lookahead of the scheduler.
 *
 * @see TimeEngine
 * @see AudioTimeEngine
 * @see getScheduler
 * @see SimpleScheduler
 *
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 *
 * scheduler.add(myEngine);
 */
class Scheduler extends SchedulingQueue {
  constructor(options = {}) {
    super();

    this.audioContext = options.audioContext ||  defaultAudioContext;

    this.__currentTime = null;
    this.__nextTime = Infinity;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     * @name period
     * @memberof Scheduler
     * @instance
     */
    this.period = options.period ||  0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     * @name lookahead
     * @memberof Scheduler
     * @instance
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

  /**
   * Scheduler current logical time.
   *
   * @name currentTime
   * @type {Number}
   * @memberof Scheduler
   * @instance
   */
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

  // inherited from scheduling queue
  /**
   * Add a TimeEngine or a simple callback function to the scheduler at an
   * optionally given time. Whether the add method is called with a TimeEngine
   * or a callback function it returns a TimeEngine that can be used as argument
   * of the methods remove and resetEngineTime. A TimeEngine added to a scheduler
   * has to implement the scheduled interface. The callback function added to a
   * scheduler will be called at the given time and with the given time as
   * argument. The callback can return a new scheduling time (i.e. the next
   * time when it will be called) or it can return Infinity to suspend scheduling
   * without removing the function from the scheduler. A function that does
   * not return a value (or returns null or 0) is removed from the scheduler
   * and cannot be used as argument of the methods remove and resetEngineTime
   * anymore.
   *
   * @name add
   * @function
   * @memberof Scheduler
   * @instance
   * @param {TimeEngine|Function} engine - Engine to add to the scheduler
   * @param {Number} [time=this.currentTime] - Schedule time
   */
  /**
   * Remove a TimeEngine from the scheduler that has been added to the
   * scheduler using the add method.
   *
   * @name add
   * @function
   * @memberof Scheduler
   * @instance
   * @param {TimeEngine} engine - Engine to remove from the scheduler
   * @param {Number} [time=this.currentTime] - Schedule time
   */
  /**
   * Reschedule a scheduled time engine at a given time.
   *
   * @name resetEngineTime
   * @function
   * @memberof Scheduler
   * @instance
   * @param {TimeEngine} engine - Engine to reschedule
   * @param {Number} time - Schedule time
   */
  /**
   * Remove all scheduled callbacks and engines from the scheduler.
   *
   * @name clear
   * @function
   * @memberof Scheduler
   * @instance
   */

}

export default Scheduler;
