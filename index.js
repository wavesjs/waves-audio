/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio event scheduler singleton based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");

var SimpleScheduler = (function(){var DP$0 = Object.defineProperty;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,Object.getOwnPropertyDescriptor(s,p));}}return t};var $proto$0={};

  function SimpleScheduler() {
    this.__objects = [];
    this.__times = [];

    this.__currentTime = null;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    this.lookahead = 0.1;
  }Object.defineProperties(SimpleScheduler.prototype, {time: {"get": time$get$0, "configurable": true, "enumerable": true}});DP$0(SimpleScheduler, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  $proto$0.__insertEvent = function(object, time) {
    this.__objects.push(object);
    this.__times.push(time);
  };

  $proto$0.__moveEvent = function(object, time) {
    var index = this.__objects.indexOf(object);

    if (index >= 0) {
      if (time !== Infinity) {
        this.__times[index] = time;
      } else {
        this.__objects.splice(index, 1);
        this.__times.splice(index, 1);
      }
    }
  };

  $proto$0.__withdrawEvent = function(object) {
    var index = this.__objects.indexOf(object);

    if (index >= 0) {
      this.__objects.splice(index, 1);
      this.__times.splice(index, 1);
    }
  };

  $proto$0.__reschedule = function() {
    if (this.__objects.length > 0) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  };

  $proto$0.__tick = function() {var this$0 = this;
    var i = 0;

    while (i < this.__objects.length) {
      var object = this.__objects[i];
      var time = this.__times[i];

      while (time <= audioContext.currentTime + this.lookahead) {
        var audioTime = Math.max(time, audioContext.currentTime);
        this.__currentTime = time;
        time += Math.max(object.executeEvent(time, audioTime), 0);
      }

      if (time !== Infinity)
        this.__times[i++] = time;
      else
        this.__withdrawEvent(object);
    }

    this.__currentTime = null;

    if (this.__objects.length > 0) {
      this.__timeout = setTimeout(function()  {
        this$0.__tick();
      }, this.period * 1000);
    }
  };

  /**
   * Get scheduler time
   * @return {Number} current scheduler time including lookahead
   */
  function time$get$0() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called
   * @param {Number} period callback period
   * @param {Number} delay of first callback
   * @return {Object} scheduled object that can be used to call remove and reschedule
   */
  $proto$0.callback = function(callback) {var delay = arguments[1];if(delay === void 0)delay = 0;
    var object = {
      executeEvent: function(time, audioTime) {
        callback(time, audioTime);
        return Infinity;
      }
    };

    this.__insertEvent(object, this.time + delay);
    this.__reschedule();

    return object;
  };

  /**
   * Add a periodically repeated callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called periodically
   * @param {Number} period callback period
   * @param {Number} delay of first callback
   * @return {Object} scheduled object that can be used to call remove and reschedule
   */
  $proto$0.repeat = function(callback) {var period = arguments[1];if(period === void 0)period = 1;var delay = arguments[2];if(delay === void 0)delay = 0;
    var object = {
      period: period,
      executeEvent: function(time, audioTime) {
        callback(time, audioTime);
        return this.period;
      }
    };

    this.__insertEvent(object, this.time + delay);
    this.__reschedule();

    return object;
  };

  /**
   * Add an event engine to the scheduler
   * @param {object} engine event engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   */
  $proto$0.add = function(engine) {var delay = arguments[1];if(delay === void 0)delay = 0;
    if (engine.scheduler !== null)
      throw "object has already been added to a scheduler";

    if (!engine.syncEvent)
      throw "object does not have a syncEvent method";

    if (!engine.executeEvent)
      throw "object does not have a executeEvent method";

    engine.scheduler = this;
    this.__insertEvent(engine, this.time + delay);
    this.__reschedule();
  };

  /**
   * Remove a scheduled event engine or callback from the scheduler
   * @param {Object} engine event engine or callback to be removed from the scheduler
   */
  $proto$0.remove = function(engine) {
    if (engine.scheduler !== this)
      throw "object has not been added to this scheduler";

    engine.scheduler = null;
    this.__withdrawEvent(engine);
    this.__reschedule();
  };

  /**
   * Resychronize a scheduled event engine
   * @param {Object} engine event engine to be resynchronized
   */
  $proto$0.resync = function(engine) {
    if (engine.scheduler !== this)
      throw "object has not been added to this scheduler";

    if (!engine.syncEvent)
      throw "object does not have a syncEvent method";

    var time = this.time;
    var nextEventTime = time + Math.max(engine.syncEvent(time), 0);
    this.__moveEvent(engine, nextEventTime);
    this.__reschedule();
  };

  /**
   * Reschedule a scheduled event engine or callback
   * @param {Object} engine event engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  $proto$0.reschedule = function(engine, time) {
    if (engine.scheduler !== this)
      throw "object has not been added to this scheduler";

    this.__moveEvent(engine, time);
    this.__reschedule();
  };
MIXIN$0(SimpleScheduler.prototype,$proto$0);$proto$0=void 0;return SimpleScheduler;})();

module.exports = new SimpleScheduler; // export scheduler singleton