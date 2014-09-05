/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

class TimeEngine {
  
  constructor() {
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
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }

  /**
   * Execute engine at next transport position
   * @param {Number} time current scheduler (audio) time
   * @param {Number} position current transport position
   * @param {Bool} whether transport runs backward (current playing direction)
   * @return {Number} next transport position (given the playing direction)
   * 
   * This function is called – more or less regulary – by the scheduler to let the engine do its work
   * synchronized to the scheduler time.
   */
  executeSchedulerTime(time, position, reverse = false) {
    return Infinity;
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
   * Synchronize time engine to transport position
   * @param {Number} time current scheduler (audio) time
   * @param {Number} position transport position to synchronize to
   * @param {Bool} whether transport runs backward (current playing direction)
   * @return {Number} next transport position (given the playing direction)
   *
   * This function allows the engine for synchronizing (seeking) to the current transport position
   * and to return the position of the next transport position of the engine.
   * Engines that return Infinity or -Infinity are not called anymore until they call resyncEngine()
   * with a valid transport position.
   */
  syncTransportPosition(time, position, reverse = false) {
    return Infinity;
  }

  /**
   * Execute engine at next transport position
   * @param {Number} time current scheduler (audio) time
   * @param {Number} position current transport position
   * @param {Bool} whether transport runs backward (current playing direction)
   * @return {Number} next transport position (given the playing direction)
   *
   * This function is called – more or less regulary – by the transport to let the engine do its work
   * aligned to the transport position.
   */
  executeTransportPosition(time, position, reverse = false) {
    return Infinity;
  }

  /**
   * Request time engine to be resynchronized to the current transport position (called by engine itself)
   *
   * This function will result in syncTransportPosition() being called with the current transport position
   * to adjust the engines priority in the transport queue.
   */
  resyncEngine() {
    if(this.transport)
      this.transport.resync(this);
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