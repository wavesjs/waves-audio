'use strict';

/**
 * @class TimeEngine
 */
class TimeEngine {
  constructor() {
    this.master = null;
    this.outputNode = null;
  }

  get currentTime() {
    if (this.master)
      return this.master.currentTime;

    return undefined;
  }

  get currentPosition() {
    var master = this.master;

    if (master && master.currentPosition !== undefined)
      return master.currentPosition;

    return undefined;
  }

  /**
   * Scheduled interface
   *   - advanceTime(time), called to generate next event at given time, returns next time
   */
  implementsScheduled() {
    return (this.advanceTime && this.advanceTime instanceof Function);
  }

  resetTime(time = undefined) {
    if (this.master)
      this.master.resetEngineTime(this, time);
  }

  /**
   * Transported interface
   *   - syncPosition(time, position, speed), called to reposition TimeEngine, returns next position
   *   - advancePosition(time, position, speed), called to generate next event at given time and position, returns next position
   */
  implementsTransported() {
    return (
      this.syncPosition && this.syncPosition instanceof Function &&
      this.advancePosition && this.advancePosition instanceof Function
    );
  }

  resetPosition(position = undefined) {
    if (this.master)
      this.master.resetEnginePosition(this, position);
  }

  /**
   * Speed-controlled interface
   *   - syncSpeed(time, position, speed, ), called to
   */
  implementsSpeedControlled() {
    return (this.syncSpeed && this.syncSpeed instanceof Function);
  }
}

module.exports = TimeEngine;