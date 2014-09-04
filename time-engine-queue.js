!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.TimeEngineQueue=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine sequence used by scheduler and transports
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var TimeEngineQueue = (function(){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var $proto$0={};

  function TimeEngineQueue() {
    this.__engines = [];
    this.reverse = false;
  }DP$0(TimeEngineQueue, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /* Get the index of an engine in the engine list */
  $proto$0.__engineIndex = function(engine) {
    for (var i = 0; i < this.__engines.length; i++) {
      if (engine === this.__engines[i][0]) {
        return i;
      }
    }

    return -1;
  };

  /* Withdraw an engine from the engine list */
  $proto$0.__removeEngine = function(engine) {
    var index = this.__engineIndex(engine);

    if (index >= 0)
      this.__engines.splice(index, 1);

    if (this.__engines.length > 0)
      return this.__engines[0][1]; // return time of first engine

    return Infinity;
  };

  $proto$0.__syncEngine = function(engine, time) {
    var nextEngineDelay = Math.max(engine.syncNext(time), 0);
    var nextEngineTime = Infinity;

    if (nextEngineDelay !== Infinity) {
      if (!this.reverse)
        nextEngineTime = time + nextEngineDelay;
      else
        nextEngineTime = time - nextEngineDelay;
    }

    return nextEngineTime;
  };

  $proto$0.__sortEngines = function() {
    if (!this.reverse)
      this.__engines.sort(function(a, b) {
        return a[1] - b[1];
      });
    else
      this.__engines.sort(function(a, b) {
        return b[1] - a[1];
      });
  };

  /**
   * Insert an engine to the sequence
   */
  $proto$0.insert = function(engine, time) {var sync = arguments[2];if(sync === void 0)sync = true;
    var nextEngineTime = time;

    if (sync)
      nextEngineTime = this.__syncEngine(engine, time);

    if (nextEngineTime !== Infinity) {
      // add new engine
      this.__engines.push([engine, nextEngineTime]);
      this.__sortEngines();
      return this.__engines[0][1]; // return time of first engine
    }

    return this.__removeEngine(engine);
  };

  /**
   * Insert an array of engines to the sequence
   */
  $proto$0.insertAll = function(arrayOfEngines, time) {var sync = arguments[2];if(sync === void 0)sync = true;
    var nextEngineTime = time;

    // sync each engine and add to engine list (if time is not Infinity)
    for (var i = 0; i < arrayOfEngines.length; i++) {
      var engine = arrayOfEngines[i];

      if (sync)
        nextEngineTime = this.__syncEngine(engine, time);

      // add engine to sequence of scheduled engines
      if (nextEngineTime !== Infinity)
        this.__engines.push([engine, nextEngineTime]);
    }

    // sort sequence of scheduled engines
    this.__sortEngines();

    if (this.__engines.length > 0)
      return this.__engines[0][1]; // return time of first engine

    return Infinity;
  };

  /**
   * Move an engine to another time in the sequence
   */
  $proto$0.move = function(engine, time) {var sync = arguments[2];if(sync === void 0)sync = true;
    var nextEngineTime = time;

    if (sync)
      nextEngineTime = this.__syncEngine(engine, time);

    if (nextEngineTime !== Infinity) {
      var index = this.__engineIndex(engine);

      if (index < 0) {
        // add new engine
        this.__engines.push([engine, nextEngineTime]);
        this.__sortEngines();
      } else {
        // update time of existing engine
        this.__engines[index][1] = nextEngineTime;

        // move first engine if it is not first anymore
        if (index === 0 && this.__engines.length > 1) {
          var secondEngineTime = this.__engines[1][1];

          if ((!this.reverse && nextEngineTime > secondEngineTime) || (this.reverse && nextEngineTime <= secondEngineTime))
            this.__sortEngines();
        }
      }

      return this.__engines[0][1]; // return time of first engine
    }

    return this.__removeEngine(engine);
  };

  /**
   * Remove an engine from the sequence
   */
  $proto$0.remove = function(engine) {
    return this.__removeEngine(engine);
  };

  /**
   * Clear sequence
   */
  $proto$0.clear = function() {
    this.__engines.length = 0; // clear engine list
    return Infinity;
  };

  /**
   * Execute next engine and return time of next engine
   */
  $proto$0.execute = function(time, audioTime) {
    // get first engine in sequence
    var engine = this.__engines[0][0];
    var nextEngineDelay = Math.max(engine.executeNext(time, audioTime), 0);

    if (nextEngineDelay !== Infinity) {
      var nextEngineTime;

      if (!this.reverse)
        nextEngineTime = time + nextEngineDelay;
      else
        nextEngineTime = time - nextEngineDelay;

      this.__engines[0][1] = nextEngineTime;

      // move first engine if it is not first anymore
      if (this.__engines.length > 1) {
        var secondTime = this.__engines[1][1];

        if ((!this.reverse && nextEngineTime > secondTime) || (this.reverse && nextEngineTime <= secondTime))
          this.__sortEngines();
      }

      return this.__engines[0][1]; // return time of first engine
    }

    return this.__removeEngine(engine);
  };
MIXIN$0(TimeEngineQueue.prototype,$proto$0);$proto$0=void 0;return TimeEngineQueue;})();

module.exports = TimeEngineQueue;
},{}]},{},[1])
(1)
});