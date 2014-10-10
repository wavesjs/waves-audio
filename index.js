/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE simplified scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = require("audio-context");
var TimeEngine = require("time-engine");

var SimpleScheduler = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};

  function SimpleScheduler() {
    this.__engines = [];
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
  }DPS$0(SimpleScheduler.prototype,{currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}});DP$0(SimpleScheduler,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.__insertEngine = function(engine, time) {
    this.__engines.push(engine);
    this.__times.push(time);
  };

  proto$0.__moveEngine = function(engine, time) {
    var index = this.__engines.indexOf(engine);

    if (index >= 0) {
      if (time !== Infinity) {
        this.__times[index] = time;
      } else {
        this.__engines.splice(index, 1);
        this.__times.splice(index, 1);
      }
    }
  };

  proto$0.__withdrawEngine = function(engine) {
    var index = this.__engines.indexOf(engine);

    if (index >= 0) {
      this.__engines.splice(index, 1);
      this.__times.splice(index, 1);
    }
  };

  proto$0.__reschedule = function() {
    if (this.__engines.length > 0) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  };

  proto$0.__tick = function() {var this$0 = this;
    var i = 0;

    while (i < this.__engines.length) {
      var engine = this.__engines[i];
      var time = this.__times[i];

      while (time <= audioContext.currentTime + this.lookahead) {
        time = Math.max(time, audioContext.currentTime);
        this.__currentTime = time;
        time = engine.advanceTime(time);
      }

      if (time !== Infinity)
        this.__times[i++] = time;
      else
        this.__withdrawEngine(engine);
    }

    this.__currentTime = null;
    this.__timeout = null;

    if (this.__engines.length > 0) {
      this.__timeout = setTimeout(function()  {
        this$0.__tick();
      }, this.period * 1000);
    }
  };

  /**
   * Get scheduler time
   * @return {Number} current scheduler time including lookahead
   */
  function $currentTime_get$0() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a callback to the scheduler
   * @param {Function} callback function(time) to be called
   * @param {Number} delay of first callback (default is 0)
   * @param {Number} period callback period (default is 0 for one-shot)
   * @return {Object} scheduled object that can be used to call remove and reset
   */
  proto$0.callback = function(callbackFunction) {var delay = arguments[1];if(delay === void 0)delay = 0;var period = arguments[2];if(period === void 0)period = 0;
    var engineWrapper = {
      period: period || Infinity,
      advanceTime: function(time) {
        callbackFunction(time);
        return time + this.period;
      }
    };

    this.__insertEngine(engineWrapper, this.currentTime + delay);
    this.__reschedule();

    return engineWrapper;
  };

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   */
  proto$0.add = function(engine) {var delay = arguments[1];if(delay === void 0)delay = 0;var getCurrentPosition = arguments[2];if(getCurrentPosition === void 0)getCurrentPosition = null;var this$0 = this;
    if (!engine.interface) {
      if (TimeEngine.implementsScheduled(engine)) {

        TimeEngine.setScheduled(engine, function(time)  {
          this$0.__nextTime = this$0.__queue.move(engine, time);
          this$0.__reschedule();
        }, function()  {
          return this$0.currentTime;
        }, getCurrentPosition);

        this.__insertEngine(engine, this.currentTime + delay);
        this.__reschedule();

        return engine;
      } else {
        throw new Error("object cannot be added to scheduler");
      }
    } else {
      throw new Error("object has already been added to a master");
    }

    return null;
  };

  /**
   * Remove a scheduled time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  proto$0.remove = function(engine) {
    if (this.__engines.indexOf(engine) >= 0) {
      TimeEngine.resetInterface(engine);
      this.__withdrawEngine(engine);
      this.__reschedule();
    } else {
      throw new Error("object has not been added to this scheduler");
    }
  };

  /**
   * Reschedule a scheduled time engine or callback
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  proto$0.reset = function(engine, time) {
    this.__moveEngine(engine, time);
    this.__reschedule();
  };
MIXIN$0(SimpleScheduler.prototype,proto$0);proto$0=void 0;return SimpleScheduler;})();

module.exports = new SimpleScheduler(); // export scheduler singleton