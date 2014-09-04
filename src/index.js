/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

class TimeEngine {
  constructor(alignToTransportPosition = true) {
    /**
     * Scheduler to which the time engine has been added
     * @type {Object}
     */
    this.scheduler = null;

    /**
     * Transport to which the time engine has been added
     * @type {Object}
     */
    this.transport = null;

    /**
     * Whether the times are aligned to the transport position (or scheduled in time) when the engine is added to a transsport
     * @type {Bool}
     */
    this.alignToTransportPosition = alignToTransportPosition; // true: times are aligned to position when executed within transport

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }

  /**
   * Synchronize time engine
   * @param {Number} time synchronization time or transport position
   * @return {Number} delay until next time or Infinity executeNext should not be called
   */
  syncNext(time) {
    return Infinity;
  }

  /**
   * Execute next time
   * @param {Number} time scheduler time or transport position
   * @param {Number} audioTime corresponding audio context's currentTime
   * @return {Number} next delay until next time or Infinity to stop execution
   */
  executeNext(time, audioTime) {
    return Infinity;
  }

  /**
   * Request time engine resynchronization (called by engine itself)
   */
  resyncEngine() {
    if(this.scheduler)
      this.scheduler.resync(this);
  }

  /**
   * Request time engine rescheduling (called by engine itself)
   * @param {Number} time new next scheduler time or transport position
   */
  rescheduleEngine(time) {
    if(this.scheduler)
      this.scheduler.reschedule(this, time);
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