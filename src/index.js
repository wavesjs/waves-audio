/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

class TimeEngine {
  constructor() {
    /**
     * Time master to which the time engine is synchronized
     * @type {Object}
     */
    this.__timeMaster = null;

    /**
     * Function provided by time master to get the master time
     * @type {Function}
     */
    this.getMasterTime = function() {
      return 0;
    };

    /**
     * Function provided by the time master to reset the engine's next time
     * @param {Number} time new engine time (immediately if not specified)
     */
    this.resetEngineTime = function(time) {};

    /**
     * Position master to which the time engine is synchronized
     * @type {Object}
     */
    this.__positionMaster = null;

    /**
     * Start position of the engine
     * @type {Object}
     */
    this.__startPosition = 0;

    /**
     * Function provided by position master to get the master position
     * @type {Function}
     */
    this.getMasterPosition = function() {
      return 0;
    };

    /**
     * Function provided by the position master to request resynchronizing the engine's position
     * @param {Number} time new engine time (immediately if not specified)
     */
    this.resyncEnginePosition = function() {};

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }

  set timeMaster(timeMaster) {
    this.__timeMaster = timeMaster;
  }

  get timeMaster() {
    return this.__timeMaster;
  }

  set positionMaster(positionMaster) {
    this.__positionMaster = positionMaster;
  }

  get positionMaster() {
    return this.__positionMaster;
  }

  /**
   * Synchronize engine to master time ("time-based" interface, optional function)
   * @param {Number} time current master time (based on audio time)
   * @return {Number} first time
   *
   * This optional function is called by the time master and allows the engine to
   * return its first time.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * reset by the time master or it calls resetEngineTime().
   */
  initTime(time) {
    return time;
  }

  /**
   * Advance engine time ("time-based" interface)
   * @param {Number} time current master time (based on audio time)
   * @return {Number} next engine time
   *
   * This function is called by the time master to let the engine do its work
   * synchronized to the master's time.
   * If the engine returns Infinity, it is not called again until it is restarted by
   * the time master or it calls resyncEnginePosition() with a valid position.
   */
  // advanceTime(time) {
  //   return time;
  // }

  /**
   * Synchronize engine to master position ("position-based" interface)
   * @param {Number} position current master position to synchronize to
   * @param {Number} time current master time (based on audio time)
   * @param {Number} speed current speed
   * @return {Number} next position (given the playing direction)
   *
   * This function is called by the msater and allows the engine for synchronizing
   * (seeking) to the current master position and to return its next position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the position master or it calls resyncEnginePosition().
   */
  // syncPosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Advance engine position ("position-based" interface)
   * @param {Number} time current master time (based on audio time)
   * @param {Number} position current master position
   * @param {Number} speed current speed
   * @return {Number} next engine position (given the playing direction)
   *
   * This function is called by the position master to let the engine do its work
   * aligned to the master's position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the position master or it calls resyncEnginePosition().
   */
  // advancePosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Set engine speed ("speed-based" interface)
   * @param {Number} speed current master speed
   *
   * This function is called by the speed master to propagate the master's speed to the engine.
   * The speed can be of any bewteen -16 and 16.
   * With a speed of 0 the engine is halted.
   */
  // set speed(speed) {
  // }

  /**
   * Seek engine to a given position ("speed-based" interface)
   * @param {Number} position position to seek to
   *
   * This function is called by the speed master to propagate position jumps to the engine.
   */
  // seek(speed) {
  // }

  /**
   * Return whether the time engine implements the time-based interface
   **/
  get implementsTimeBased() {
    return (this.advanceTime && this.advanceTime instanceof Function);
  }

  /**
   * Return whether the time engine implements the position-based interface
   **/
  get implementsPositionBased() {
    return (
      this.syncPosition && this.syncPosition instanceof Function &&
      this.advancePosition && this.advancePosition instanceof Function
    );
  }

  /**
   * Return whether the time engine implements the speed-based interface
   **/
  get implementsSpeedBased() {
    return (
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), "speed") &&
      this.seek && this.seek instanceof Function
    );
  }

  /**
   * Connect audio node
   * @param {Object} target audio node
   */
  connect(target) {
    this.outputNode.connect(target);
    return this;
  }

  /**
   * Disconnect audio node
   * @param {Number} connection connection to be disconnected
   */
  disconnect(connection) {
    this.outputNode.disconnect(connection);
    return this;
  }
}

module.exports = TimeEngine;