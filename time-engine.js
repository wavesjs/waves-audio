!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.TimeEngine=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var TimeEngine = (function(){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var $proto$0={};
  function TimeEngine() {var alignToTransportPosition = arguments[0];if(alignToTransportPosition === void 0)alignToTransportPosition = true;
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
  }DP$0(TimeEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /**
   * Synchronize time engine
   * @param {Number} time synchronization time or transport position
   * @return {Number} delay until next time or Infinity executeNext should not be called
   */
  $proto$0.syncNext = function(time) {
    return Infinity;
  };

  /**
   * Execute next time
   * @param {Number} time scheduler time or transport position
   * @param {Number} audioTime corresponding audio context's currentTime
   * @return {Number} next delay until next time or Infinity to stop execution
   */
  $proto$0.executeNext = function(time, audioTime) {
    return Infinity;
  };

  /**
   * Request time engine resynchronization (called by engine itself)
   */
  $proto$0.resyncEngine = function() {
    if(this.scheduler)
      this.scheduler.resync(this);
  };

  /**
   * Request time engine rescheduling (called by engine itself)
   * @param {Number} time new next scheduler time or transport position
   */
  $proto$0.rescheduleEngine = function(time) {
    if(this.scheduler)
      this.scheduler.reschedule(this, time);
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
},{}]},{},[1])
(1)
});