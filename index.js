/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = require("../audio-context");

var TimeEngine = (function(){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var $proto$0={};
  function TimeEngine() {
    /**
     * Master (scheduler, transport, player) to which the time engine is synchronized
     * @type {Object}
     */
    this.master = null;

    /**
     * Interface used by teh current master
     * @type {String}
     */
    this.interface = null;

    /**
     * Transport start position of the engine (handled by )
     * @type {Object}
     */
    this.transportStartPosition = 0;

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }Object.defineProperties(TimeEngine.prototype, {implementsScheduled: {"get": implementsScheduled$get$0, "configurable": true, "enumerable": true}, implementsTransported: {"get": implementsTransported$get$0, "configurable": true, "enumerable": true}, implementsSpeedControlled: {"get": implementsSpeedControlled$get$0, "configurable": true, "enumerable": true}, currentTime: {"get": currentTime$get$0, "configurable": true, "enumerable": true}, currentPosition: {"get": currentPosition$get$0, "configurable": true, "enumerable": true}});DP$0(TimeEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /**
   * Check whether the time engine implements the scheduled interface
   **/
  function implementsScheduled$get$0() {
    return (this.advanceTime && this.advanceTime instanceof Function);
  }

  /**
   * Check whether the time engine implements the transported interface
   **/
  function implementsTransported$get$0() {
    return (
      this.syncPosition && this.syncPosition instanceof Function &&
      this.advancePosition && this.advancePosition instanceof Function
    );
  }

  /**
   * Check whether the time engine implements the speed-controlled interface
   **/
  function implementsSpeedControlled$get$0() {
    return (this.syncSpeed && this.syncSpeed instanceof Function);
  }

  /**
   * Get the time engine's current master time
   * @type {Function}
   *
   * This function provided by the master.
   */
  function currentTime$get$0() {
    return audioContext.currentTime;
  }

  /**
   * Get the time engine's current master position
   * @type {Function}
   *
   * This function provided by the master.
   */
  function currentPosition$get$0() {
    return 0;
  };

  /**
   * Advance engine time (scheduled interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @return {Number} next engine time
   *
   * This function is called by the scheduler to let the engine do its work
   * synchronized to the scheduler time.
   * If the engine returns Infinity, it is not called again until it is restarted by
   * the scheduler or it calls resyncEnginePosition() with a valid position.
   */
  // advanceTime(time) {
  //   return time;
  // }

  /**
   * Function provided by the scheduler to reset the engine's next time
   * @param {Number} time new engine time (immediately if not specified)
   */
  $proto$0.resetEngineTime = function(time) {};

  /**
   * Synchronize engine to transport position (transported interface)
   * @param {Number} position current transport position to synchronize to
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} speed current speed
   * @return {Number} next position (given the playing direction)
   *
   * This function is called by the msater and allows the engine for synchronizing
   * (seeking) to the current transport position and to return its next position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the transport or it calls resyncEnginePosition().
   */
  // syncPosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Advance engine position (transported interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} position current transport position
   * @param {Number} speed current speed
   * @return {Number} next engine position (given the playing direction)
   *
   * This function is called by the transport to let the engine do its work
   * aligned to the transport's position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the transport or it calls resyncEnginePosition().
   */
  // advancePosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Function provided by the transport to request resynchronizing the engine's position
   * @param {Number} time new engine time (immediately if not specified)
   */
  $proto$0.resyncEnginePosition = function() {};;

  /**
   * Set engine speed (speed-controlled interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} position current transport position
   * @param {Number} speed current transport speed
   *
   * This function is called by the transport to propagate the transport speed to the engine.
   * The speed can be of any bewteen -16 and 16.
   * With a speed of 0 the engine is halted.
   */
  // syncSpeed(time, position, speed) {
  // }

  $proto$0.__setGetters = function(getCurrentTime, getCurrentPosition) {
    if (getCurrentTime) {
      Object.defineProperty(this, 'currentTime', {
        configurable: true,
        get: getCurrentTime,
        set: function(time) {}
      });
    }

    if (getCurrentPosition) {
      Object.defineProperty(this, 'currentPosition', {
        configurable: true,
        get: getCurrentPosition,
        set: function(position) {}
      });
    }
  };

  $proto$0.__deleteGetters = function() {
    delete this.currentTime;
    delete this.currentPosition;
  };

  $proto$0.setScheduled = function(scheduler, resetEngineTime, getCurrentTime, getCurrentPosition) {
    this.master = scheduler;
    this.interface = "scheduled";

    this.__setGetters(getCurrentTime, getCurrentPosition);

    if (resetEngineTime)
      this.resetEngineTime = resetEngineTime;
  };

  $proto$0.resetScheduled = function() {
    this.__deleteGetters();

    delete this.resetEngineTime;

    this.master = null;
    this.interface = null;
  };

  $proto$0.setTransported = function(transport, startPosition, resyncEnginePosition, getCurrentTime, getCurrentPosition) {
    this.master = transport;
    this.interface = "transported";

    this.transportStartPosition = startPosition;

    this.__setGetters(getCurrentTime, getCurrentPosition);

    if (resyncEnginePosition)
      this.resyncEnginePosition = resyncEnginePosition;
  };

  $proto$0.resetTransported = function() {
    this.__deleteGetters();

    delete this.resyncEnginePosition;

    this.transportStartPosition = 0;
    this.master = null;
    this.interface = null;
  };

  $proto$0.setSpeedControlled = function(master, getCurrentTime, getCurrentPosition) {
    this.master = master;
    this.interface = "speed-controlled";

    this.__setGetters(getCurrentTime, getCurrentPosition);
  };

  $proto$0.resetSpeedControlled = function() {
    this.__deleteGetters();

    this.master = null;
    this.interface = null;
  };

  /**
   * Remove engine from current master
   */
  $proto$0.removeFromMaster = function() {
    if (this.master)
      this.master.remove(this);
  };

  /**
   * Connect audio node
   * @param {Object} target audio node
   */
  $proto$0.connect = function(target) {
    this.outputNode.connect(target);
    return this;
  };

  /**
   * Disconnect audio node
   * @param {Number} connection connection to be disconnected
   */
  $proto$0.disconnect = function(connection) {
    this.outputNode.disconnect(connection);
    return this;
  };
MIXIN$0(TimeEngine.prototype,$proto$0);$proto$0=void 0;return TimeEngine;})();

module.exports = TimeEngine;