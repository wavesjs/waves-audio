/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var TimeEngine = (function(){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var $proto$0={};

  function TimeEngine() {
    /**
     * Time master to which the time engine is synchronized
     * @type {Object}
     */
    this.timeMaster = null;

    /**
     * Position master to which the time engine is synchronized
     * @type {Object}
     */
    this.positionMaster = null;

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }DP$0(TimeEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /**
   * Advance engine time
   * @param {Number} time current master time (based on audio time)
   * @return {Number} next engine time
   *
   * This function is called by the time master to let the engine do its work
   * synchronized to the master's time.
   * If the engine returns Infinity, it is not called again until it is restarted by the master 
   * or it calls resyncEnginePosition() with a valid position.
   */
  $proto$0.advanceTime = function(time) {
    return Infinity;
  };

  /**
   * Reset engine time at master
   * @param {Number} time new engine time, implies current master time if not given
   * 
   * This function is called by the engine itself to rectify its next time.
   */
  $proto$0.resetEngineTime = function(time) {
    if (this.timeMaster)
      this.timeMaster.reset(this, time);
  };

  /**
   * Synchronize engine to master position
   * @param {Number} time current master time (based on audio time)
   * @param {Number} position current master position to synchronize to
   * @param {Bool} whether position runs backward (current playing direction)
   * @return {Number} next position (given the playing direction)
   *
   * This function allows the engine for synchronizing (seeking) to the current master position
   * and to return its next position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is 
   * resynchronized by the master or it calls resyncEnginePosition().
   */
  $proto$0.syncPosition = function(time, position) {var reverse = arguments[2];if(reverse === void 0)reverse = false;
    return Infinity;
  };

  /**
   * Advance engine position
   * @param {Number} time current master time (based on audio time)
   * @param {Number} position current master position
   * @param {Bool} whether position runs backward (current playing direction)
   * @return {Number} next engine position (given the playing direction)
   *
   * This function is called by the position master to let the engine do its work
   * aligned to the master's position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is 
   * resynchronized by the master or it calls resyncEnginePosition().
   */
  $proto$0.advancePosition = function(time, position) {var reverse = arguments[2];if(reverse === void 0)reverse = false;
    return Infinity;
  };

  /**
   * Request the position master to resynchronize the engine's position
   *
   * This function is called by the engine itself and will result in syncTransportPosition() 
   * being called with the current master position.
   */
  $proto$0.resyncEnginePosition = function() {
    if (this.positionMaster)
      this.positionMaster.resync(this);
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