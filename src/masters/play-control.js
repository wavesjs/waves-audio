import defaultAudioContext from '../core/audio-context';
import SchedulingQueue from '../core/scheduling-queue';
import TimeEngine from '../core/time-engine';
import { getScheduler } from './factories';

const ESPILON = 1e-8;

class LoopControl extends TimeEngine {
  constructor(playControl) {
    super();

    this.__playControl = playControl;
    this.lower = -Infinity;
    this.upper = Infinity;
  }

  // TimeEngine method (scheduled interface)
  advanceTime(time) {
    const playControl = this.__playControl;
    const speed = playControl.speed;
    const lower = this.lower;
    const upper = this.upper;

    if(speed > 0)
      time += ESPILON;
    else
      time -= EPSILON;

    if (speed > 0) {
      playControl.syncSpeed(time, lower, speed, true);
      return playControl.__getTimeAtPosition(upper) - ESPILON;
    } else if (speed < 0) {
      playControl.syncSpeed(time, upper, speed, true);
      return playControl.__getTimeAtPosition(lower) + ESPILON;
    }

    return Infinity;
  }

  reschedule(speed) {
    const playControl = this.__playControl;
    const lower = Math.min(playControl.__loopStart, playControl.__loopEnd);
    const upper = Math.max(playControl.__loopStart, playControl.__loopEnd);

    this.speed = speed;
    this.lower = lower;
    this.upper = upper;

    if (lower === upper)
      speed = 0;

    if (speed > 0)
      this.resetTime(playControl.__getTimeAtPosition(upper) - ESPILON);
    else if (speed < 0)
      this.resetTime(playControl.__getTimeAtPosition(lower) + ESPILON);
    else
      this.resetTime(Infinity);
  }

  applyLoopBoundaries(position, speed) {
    const lower = this.lower;
    const upper = this.upper;

    if (speed > 0 && position >= upper)
      return lower + (position - lower) % (upper - lower);
    else if (speed < 0 && position < lower)
      return upper - (upper - position) % (upper - lower);

    return position;
  }
}

// play controlled base class
class PlayControlled {
  constructor(playControl, engine) {
    this.__playControl = playControl;

    engine.master = this;
    this.__engine = engine;
  }

  syncSpeed(time, position, speed, seek, lastSpeed) {
    this.__engine.syncSpeed(time, position, speed, seek);
  }

  get currentTime() {
    return this.__playControl.currentTime;
  }

  get currentPosition() {
    return this.__playControl.currentPosition;
  }

  destroy() {
    this.__playControl = null;

    this.__engine.master = null;
    this.__engine = null;
  }
}

// play control for engines implementing the *speed-controlled* interface
class PlayControlledSpeedControlled extends PlayControlled {
  constructor(playControl, engine) {
    super(playControl, engine);
  }
}

// play control for engines implmenting the *transported* interface
class PlayControlledTransported extends PlayControlled {
  constructor(playControl, engine) {
    super(playControl, engine);

    this.__schedulerHook = new PlayControlledSchedulerHook(playControl, engine);
  }

  syncSpeed(time, position, speed, seek, lastSpeed) {
    if (speed !== lastSpeed || (seek && speed !== 0)) {
      var nextPosition;

      // resync transported engines
      if (seek || speed * lastSpeed < 0) {
        // seek or reverse direction
        nextPosition = this.__engine.syncPosition(time, position, speed);
      } else if (lastSpeed === 0) {
        // start
        nextPosition = this.__engine.syncPosition(time, position, speed);
      } else if (speed === 0) {
        // stop
        nextPosition = Infinity;

        if (this.__engine.syncSpeed)
          this.__engine.syncSpeed(time, position, 0);
      } else if (this.__engine.syncSpeed) {
        // change speed without reversing direction
        this.__engine.syncSpeed(time, position, speed);
      }

      this.__schedulerHook.resetPosition(nextPosition);
    }
  }

  resetEnginePosition(engine, position = undefined) {
    if (position === undefined) {
      var playControl = this.__playControl;
      var time = playControl.__sync();

      position = this.__engine.syncPosition(time, playControl.__position, playControl.__speed);
    }

    this.__schedulerHook.resetPosition(position);
  }

  destroy() {
    this.__schedulerHook.destroy();
    this.__schedulerHook = null;

    super.destroy();
  }
}

// play control for time engines implementing the *scheduled* interface
class PlayControlledScheduled extends PlayControlled {
  constructor(playControl, engine) {
    super(playControl, engine);

    // scheduling queue becomes master of engine
    engine.master = null;
    this.__schedulingQueue = new PlayControlledSchedulingQueue(playControl, engine);
  }

  syncSpeed(time, position, speed, seek, lastSpeed) {
    if (lastSpeed === 0 && speed !== 0) // start or seek
      this.__engine.resetTime();
    else if (lastSpeed !== 0 && speed === 0) // stop
      this.__engine.resetTime(Infinity);
  }

  destroy() {
    this.__schedulingQueue.destroy();
    super.destroy();
  }
}

// translates transported engine advancePosition into global scheduler times
class PlayControlledSchedulerHook extends TimeEngine {
  constructor(playControl, engine) {
    super();

    this.__playControl = playControl;
    this.__engine = engine;

    this.__nextPosition = Infinity;
    playControl.__scheduler.add(this, Infinity);
  }

  advanceTime(time) {
    var playControl = this.__playControl;
    var engine = this.__engine;
    var position = this.__nextPosition;
    var nextPosition = engine.advancePosition(time, position, playControl.__speed);
    var nextTime = playControl.__getTimeAtPosition(nextPosition);

    this.__nextPosition = nextPosition;
    return nextTime;
  }

  get currentTime() {
    return this.__playControl.currentTime;
  }

  get currentPosition() {
    return this.__playControl.currentPosition;
  }

  resetPosition(position = this.__nextPosition) {
    var time = this.__playControl.__getTimeAtPosition(position);
    this.__nextPosition = position;
    this.resetTime(time);
  }

  destroy() {
    this.__playControl.__scheduler.remove(this);
    this.__playControl = null;
    this.__engine = null;
  }
}

// internal scheduling queue that returns the current position (and time) of the play control
class PlayControlledSchedulingQueue extends SchedulingQueue {
  constructor(playControl, engine) {
    super();
    this.__playControl = playControl;
    this.__engine = engine;

    this.add(engine, Infinity);
    playControl.__scheduler.add(this, Infinity);
  }

  get currentTime() {
    return this.__playControl.currentTime;
  }

  get currentPosition() {
    return this.__playControl.currentPosition;
  }

  destroy() {
    this.__playControl.__scheduler.remove(this);
    this.remove(this.__engine);

    this.__playControl = null;
    this.__engine = null;
  }
}

// play control meta-class
export default class PlayControl extends TimeEngine {
  constructor(engine, options = {}) {
    super();

    this.audioContext = options.audioContext || defaultAudioContext;
    this.__scheduler = getScheduler(this.audioContext);

    this.__playControlled = null;

    this.__loopControl = null;
    this.__loopStart = 0;
    this.__loopEnd = 1;

    // synchronized tie, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    // non-zero "user" speed
    this.__playingSpeed = 1;

    if (engine)
      this.__setEngine(engine);
  }

  __setEngine(engine) {
    if (engine.master)
      throw new Error("object has already been added to a master");

    if (TimeEngine.implementsSpeedControlled(engine))
      this.__playControlled = new PlayControlledSpeedControlled(this, engine);
    else if (TimeEngine.implementsTransported(engine))
      this.__playControlled = new PlayControlledTransported(this, engine);
    else if (TimeEngine.implementsScheduled(engine))
      this.__playControlled = new PlayControlledScheduled(this, engine);
    else
      throw new Error("object cannot be added to play control");
  }

  __resetEngine() {
    this.__playControlled.destroy();
    this.__playControlled = null;
  }

  /**
   * Calculate/extrapolate playing time for given position
   * @param {Number} position position
   * @return {Number} extrapolated time
   */
  __getTimeAtPosition(position) {
    return this.__time + (position - this.__position) / this.__speed;
  }

  /**
   * Calculate/extrapolate playing position for given time
   * @param {Number} time time
   * @return {Number} extrapolated position
   */
  __getPositionAtTime(time) {
    return this.__position + (time - this.__time) * this.__speed;
  }

  __sync() {
    var now = this.currentTime;
    this.__position += (now - this.__time) * this.__speed;
    this.__time = now;
    return now;
  }

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the play-control is added to a master.
   */
  get currentTime() {
    return this.__scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current playing position
   *
   * This function will be replaced when the play-control is added to a master.
   */
  get currentPosition() {
    return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
  }


  set(engine = null) {
    var time = this.__sync();
    var speed = this.__speed;

    if (this.__playControlled !== null && this.__playControlled.__engine !== engine) {

      this.syncSpeed(time, this.__position, 0);

      if (this.__playControlled)
        this.__resetEngine();


      if (this.__playControlled === null && engine !== null) {
        this.__setEngine(engine);

        if (speed !== 0)
          this.syncSpeed(time, this.__position, speed);
      }
    }
  }

  set loop(enable) {
    if (enable && this.__loopStart > -Infinity && this.__loopEnd < Infinity) {
      if (!this.__loopControl) {
        this.__loopControl = new LoopControl(this);
        this.__scheduler.add(this.__loopControl, Infinity);
      }

      if (this.__speed !== 0) {
        const position = this.currentPosition;
        const lower = Math.min(this.__loopStart, this.__loopEnd);
        const upper = Math.max(this.__loopStart, this.__loopEnd);

        if (this.__speed > 0 && position > upper)
          this.seek(upper);
        else if (this.__speed < 0 && position < lower)
          this.seek(lower);
        else
          this.__loopControl.reschedule(this.__speed);
      }
    } else if (this.__loopControl) {
      this.__scheduler.remove(this.__loopControl);
      this.__loopControl = null;
    }
  }

  get loop() {
    return (!!this.__loopControl);
  }

  setLoopBoundaries(loopStart, loopEnd) {
    this.__loopStart = loopStart;
    this.__loopEnd = loopEnd;

    this.loop = this.loop;
  }

  set loopStart(loopStart) {
    this.setLoopBoundaries(loopStart, this.__loopEnd);
  }

  get loopStart() {
    return this.__loopStart;
  }

  set loopEnd(loopEnd) {
    this.setLoopBoundaries(this.__loopStart, loopEnd);
  }

  get loopEnd() {
    return this.__loopEnd;
  }

  // TimeEngine method (speed-controlled interface)
  syncSpeed(time, position, speed, seek = false) {
    var lastSpeed = this.__speed;

    if (speed !== lastSpeed || seek) {
      if ((seek || lastSpeed === 0) && this.__loopControl)
        position = this.__loopControl.applyLoopBoundaries(position, speed);

      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      if (this.__playControlled)
        this.__playControlled.syncSpeed(time, position, speed, seek, lastSpeed);

      if (this.__loopControl)
        this.__loopControl.reschedule(speed);
    }
  }

  /**
   * Start playing
   */
  start() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, this.__playingSpeed);
  }

  /**
   * Pause playing
   */
  pause() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
  }

  /**
   * Stop playing
   */
  stop() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
    this.seek(0);
  }

  /**
   * Set playing speed
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  set speed(speed) {
    var time = this.__sync();

    if (speed >= 0) {
      if (speed < 0.01)
        speed = 0.01;
      else if (speed > 100)
        speed = 100;
    } else {
      if (speed < -100)
        speed = -100;
      else if (speed > -0.01)
        speed = -0.01;
    }

    this.__playingSpeed = speed;

    if (this.__speed !== 0)
      this.syncSpeed(time, this.__position, speed);
  }

  /**
   * Get playing speed
   * @return current playing speed
   */
  get speed() {
    return this.__playingSpeed;
  }

  /**
   * Set (jump to) playing position
   * @param {Number} position target position
   */
  seek(position) {
    if (position !== this.__position) {
      var time = this.__sync();
      this.__position = position;
      this.syncSpeed(time, position, this.__speed, true);
    }
  }
}
