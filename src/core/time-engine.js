/**
 * @class TimeEngine
 */
export default class TimeEngine {
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
  static implementsScheduled(engine) {
    return (engine.advanceTime && engine.advanceTime instanceof Function);
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
  static implementsTransported(engine) {
    return (
      engine.syncPosition && engine.syncPosition instanceof Function &&
      engine.advancePosition && engine.advancePosition instanceof Function
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
  static implementsSpeedControlled(engine) {
    return (engine.syncSpeed && engine.syncSpeed instanceof Function);
  }
}
