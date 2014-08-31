!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.scheduler=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio global event scheduler based on audio time
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 * @version 5.1.0
 */
'use strict';

var audioContext = _dereq_("audio-context");
var EventQueue = _dereq_("event-queue");

var SimpleScheduler = (function(){var DP$0 = Object.defineProperty;

  function SimpleScheduler() {
    this.__objects = [];
    this.__times = [];

    this.__currentTime = null;
    this.__timeout = null;

    this.period = 0.025;
    this.advance = 0.1; // how far ahead to schedule events (> period)

    return this;
  }Object.defineProperties(SimpleScheduler.prototype, {time: {"get": time$get$0, "configurable": true, "enumerable": true}});DP$0(SimpleScheduler, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  SimpleScheduler.prototype.__insertEvent = function(object, time) {
    this.__objects.push(object);
    this.__times.push(time);
  }

  SimpleScheduler.prototype.__moveEvent = function(object, time) {
    var index = this.__objects.indexOf(object);

    if (index >= 0) {
      if (time !== Infinity) {
        this.__times[index] = time;
      } else {
        this.__objects.splice(index, 1);
        this.__times.splice(index, 1);
      }
    }
  }

  SimpleScheduler.prototype.__withdrawEvent = function(object) {
    var index = this.__objects.indexOf(object);

    if (index >= 0) {
      this.__objects.splice(index, 1);
      this.__times.splice(index, 1);
    }
  }

  SimpleScheduler.prototype.__reschedule = function() {
    if (this.__objects.length > 0) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  }

  SimpleScheduler.prototype.__tick = function() {var this$0 = this;
    this.__looping = true;

    var i = 0;

    while (i < this.__objects.length) {
      var object = this.__objects[i];
      var time = this.__times[i];

      while (time <= audioContext.currentTime + this.advance) {
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
  }

  /**
   * Get global scheduler time
   */
  function time$get$0() {
    return this.__currentTime || audioContext.currentTime + this.advance;
  }

  /**
   * Add a callback to the global scheduler at given time
   */
  SimpleScheduler.prototype.callback = function(callback) {var delay = arguments[1];if(delay === void 0)delay = 0;
    var object = {
      executeEvent: function(time, audioTime) {
        callback(time, audioTime);
        return Infinity;
      }
    };

    this.__insertEvent(object, this.time + delay);
    this.__reschedule();

    return object;
  }

  /**
   * Add event engine to the global scheduler
   */
  SimpleScheduler.prototype.add = function(engine) {var delay = arguments[1];if(delay === void 0)delay = 0;
    if (engine.syncEvent && engine.executeEvent) {
      if (engine.scheduler === null) {
        this.__nextTime = this.__insertEvent(engine, this.time + delay);
        engine.scheduler = this;
        this.__reschedule();
      }
    }
  }

  /**
   * Remove event (engine) from the global scheduler
   */
  SimpleScheduler.prototype.remove = function(engine) {
    if (engine.scheduler === this) {
      this.__withdrawEvent(engine);
      engine.scheduler = null;
      this.__reschedule();
    }
  }

  /**
   * Resychronize event engine
   * (called by event engine)
   */
  SimpleScheduler.prototype.resync = function(engine) {
    if (engine.scheduler === this) {
      var time = this.time;
      var nextEventTime = time + Math.max(engine.syncEvent(time), 0);
      this.__moveEvent(engine, nextEventTime);
      this.__reschedule();
    }
  }

  /**
   * Reschedule event engine
   * (called by event engine)
   */
  SimpleScheduler.prototype.reschedule = function(engine, time) {
    if (engine.scheduler === this) {
      this.__moveEvent(engine, time);
      this.__reschedule();
    }
  }
;return SimpleScheduler;})();

module.exports = new SimpleScheduler; // export global scheduler singleton
},{"audio-context":2,"event-queue":3}],2:[function(_dereq_,module,exports){
/* Generated by es6-transpiler v 0.7.14-2 */
// instantiates an audio context in the global scope if not there already
var context = window.audioContext || new AudioContext();
window.audioContext = context;
module.exports = context;
},{}],3:[function(_dereq_,module,exports){
/**
 * @fileoverview WAVE audio event queue used by scheduler and transports
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var EventQueue = (function(){var DP$0 = Object.defineProperty;

  function EventQueue() {
    this.__events = [];
    this.reverse = false;
  }DP$0(EventQueue, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  /* Get the index of an object in the event list */
  EventQueue.prototype.__eventIndex = function(object) {
    for (var i = 0; i < this.__events.length; i++) {
      if (object === this.__events[i][0]) {
        return i;
      }
    }

    return -1;
  }

  /* Withdraw an event from the event list */
  EventQueue.prototype.__removeEvent = function(object) {
    var index = this.__eventIndex(object);

    if (index >= 0)
      this.__events.splice(index, 1);

    if (this.__events.length > 0)
      return this.__events[0][1]; // return time of first event

    return Infinity;
  }

  EventQueue.prototype.__syncEvent = function(object, time) {
    var nextEventDelay = Math.max(object.syncEvent(time), 0);
    var nextEventTime = Infinity;

    if (nextEventDelay !== Infinity) {
      if (!this.reverse)
        nextEventTime = time + nextEventDelay;
      else
        nextEventTime = time - nextEventDelay;
    }

    return nextEventTime;
  }

  EventQueue.prototype.__sortEvents = function() {
    if (!this.reverse)
      this.__events.sort(function(a, b) {
        return a[1] - b[1];
      });
    else
      this.__events.sort(function(a, b) {
        return b[1] - a[1];
      });
  }

  /**
   * Insert an event to the queue
   */
  EventQueue.prototype.insert = function(object, time) {var sync = arguments[2];if(sync === void 0)sync = true;
    var nextEventTime = time;

    if (sync)
      nextEventTime = this.__syncEvent(object, time);

    if (nextEventTime !== Infinity) {
      // add new event
      this.__events.push([object, nextEventTime]);
      this.__sortEvents();
      return this.__events[0][1]; // return time of first event
    }

    return this.__removeEvent(object);
  }

  /**
   * Insert an array of events to the queue
   */
  EventQueue.prototype.insertAll = function(arrayOfObjects, time) {var sync = arguments[2];if(sync === void 0)sync = true;
    var nextEventTime = time;

    // sync each event and add to event list (if time is not Infinity)
    for (var i = 0; i < arrayOfObjects.length; i++) {
      var object = arrayOfObjects[i];

      if (sync)
        nextEventTime = this.__syncEvent(object, time);

      // add event to queue of scheduled events
      if (nextEventTime !== Infinity)
        this.__events.push([object, nextEventTime]);
    }

    // sort queue of scheduled events
    this.__sortEvents();

    if (this.__events.length > 0)
      return this.__events[0][1]; // return time of first event

    return Infinity;
  }

  /**
   * Move an event to another time in the queue
   */
  EventQueue.prototype.move = function(object, time) {var sync = arguments[2];if(sync === void 0)sync = true;
    var nextEventTime = time;

    if (sync)
      nextEventTime = this.__syncEvent(object, time);

    if (nextEventTime !== Infinity) {
      var index = this.__eventIndex(object);

      if (index < 0) {
        // add new event
        this.__events.push([object, nextEventTime]);
        this.__sortEvents();
      } else {
        // update time of existing event
        this.__events[index][1] = nextEventTime;

        // move first event if it is not first anymore
        if (index === 0 && this.__events.length > 1) {
          var secondEventTime = this.__events[1][1];

          if ((!this.reverse && nextEventTime > secondEventTime) || (this.reverse && nextEventTime <= secondEventTime))
            this.__sortEvents();
        }
      }

      return this.__events[0][1]; // return time of first event
    }

    return this.__removeEvent(object);
  }

  /**
   * Remove an event from the queue
   */
  EventQueue.prototype.remove = function(object) {
    return this.__removeEvent(object);
  }

  /**
   * Clear queue
   */
  EventQueue.prototype.clear = function() {
    this.__events.length = 0; // clear event list
    return Infinity;
  }

  /**
   * Execute next event and return time of next event
   */
  EventQueue.prototype.advance = function(time, audioTime) {
    // get first object in queue
    var object = this.__events[0][0];
    var nextEventDelay = Math.max(object.executeEvent(time, audioTime), 0);

    if (nextEventDelay !== Infinity) {
      var nextEventTime;

      if (!this.reverse)
        nextEventTime = time + nextEventDelay;
      else
        nextEventTime = time - nextEventDelay;

      this.__events[0][1] = nextEventTime;

      // move first event if it is not first anymore
      if (this.__events.length > 1) {
        var secondTime = this.__events[1][1];

        if ((!this.reverse && nextEventTime > secondTime) || (this.reverse && nextEventTime <= secondTime))
          this.__sortEvents();
      }

      return this.__events[0][1]; // return time of first event
    }

    return this.__removeEvent(object);
  }
;return EventQueue;})();

module.exports = EventQueue;
},{}]},{},[1])
(1)
});