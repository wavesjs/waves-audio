!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Transport=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class (time-engine master), provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){o["__proto__"]=p;return o};var OC$0 = Object.create;

var TimeEngine = _dereq_("time-engine");
var PriorityQueue = _dereq_("priority-queue");
var scheduler = _dereq_("scheduler");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

// ScheduledAdapter has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position
var ScheduledAdapter = (function(){
  function ScheduledAdapter(engine) {
    this.engine = engine;
  }DP$0(ScheduledAdapter,"prototype",{"configurable":false,"enumerable":false,"writable":false});
;return ScheduledAdapter;})();

// ScheduledAdapter has to start and stop the speed-controlled engines
// when the transport hits the engine's start and end position
var SpeedControlledAdapter = (function(){
  function SpeedControlledAdapter(engine) {
    this.engine = engine;
  }DP$0(SpeedControlledAdapter,"prototype",{"configurable":false,"enumerable":false,"writable":false});
;return SpeedControlledAdapter;})();

var TransportScheduledCell = (function(super$0){if(!PRS$0)MIXIN$0(TransportScheduledCell, super$0);var proto$0={};
  function TransportScheduledCell(transport) {
    super$0.call(this);
    this.__transport = transport;
  }if(super$0!==null)SP$0(TransportScheduledCell,super$0);TransportScheduledCell.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":TransportScheduledCell,"configurable":true,"writable":true}});DP$0(TransportScheduledCell,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // TimeEngine method scheduled interface)
  proto$0.advanceTime = function(time) {
    var transport = this.__transport;
    var position = transport.__getPositionAtTime(time);
    var nextPosition = transport.advancePosition(time, position, transport.__speed);
    return transport.__getTimeAtPosition(nextPosition);
  };
MIXIN$0(TransportScheduledCell.prototype,proto$0);proto$0=void 0;return TransportScheduledCell;})(TimeEngine);
/**
 * 
 *
 * 
 */
var Transport = (function(super$0){if(!PRS$0)MIXIN$0(Transport, super$0);var proto$0={};var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;var f;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){if(S_MARK$0)S_MARK$0(void 0);return f.call(v);}if(S_MARK$0)S_MARK$0(void 0);if((v+'')==='[object Generator]')return v;}throw new Error(v+' is not iterable')};
  function Transport() {
    super$0.call(this);

    this.__transportedEngines = [];
    this.__speedControlledEngines = [];
    this.__scheduledEngines = [];

    this.__scheduledCell = null;
    this.__transportQueue = new PriorityQueue();

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;
  }if(super$0!==null)SP$0(Transport,super$0);Transport.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Transport,"configurable":true,"writable":true}, currentTime: {"get": currentTime$get$0, "configurable":true,"enumerable":true}, currentPosition: {"get": currentPosition$get$0, "configurable":true,"enumerable":true}, numEngines: {"get": numEngines$get$0, "configurable":true,"enumerable":true}});DP$0(Transport,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.__getPositionAtTime = function(time) {
    return this.__position + (time - this.__time) * this.__speed;
  };

  proto$0.__getTimeAtPosition = function(position) {
    return this.__time + (position - this.__position) / this.__speed;
  };

  proto$0.__resyncTransportedEngines = function(time, position, speed) {
    var numTransportedEngines = this.__transportedEngines.length;
    var nextPosition = Infinity;

    if (numTransportedEngines > 0) {
      var engine, nextEnginePosition;

      this.__transportQueue.clear();
      this.__transportQueue.reverse = (speed < 0);

      for (var i = numTransportedEngines - 1; i > 0; i--) {
        engine = this.__transportedEngines[i];
        nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
        this.__transportQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__transportedEngines[0];
      nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
      nextPosition = this.__transportQueue.insert(engine, nextEnginePosition, true); // insert and sort
    }

    return nextPosition;
  };

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  function currentTime$get$0() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current playing position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  function currentPosition$get$0() {
    return this.__position + (scheduler.currentTime - this.__time) * this.__speed;
  }

  /**
   * Reset next transport position
   * @param {Number} next transport position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  proto$0.resetNextPosition = function(nextPosition) {
    if (this.__scheduledCell)
      this.__scheduledCell.resetNextTime(this.__getTimeAtPosition(nextPosition));      

    this.__nextPosition = nextPosition;
  };

  // TimeEngine method (transported interface)
  proto$0.syncPosition = function(time, position, speed) {var $D$0;var $D$1;var $D$2;var $D$3;
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    $D$3 = (this.__speedControlledEngines);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for (var speedControlledEngine ;$D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"];)
{speedControlledEngine = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);speedControlledEngine.syncSpeed(time, position, speed, true);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;

    return this.__nextPosition = this.__resyncTransportedEngines(time, position, speed);
  };

  // TimeEngine method (transported interface)
  proto$0.advancePosition = function(time, position, speed) {
    var nextEngine = this.__transportQueue.head;
    var nextEnginePosition = nextEngine.transportStartPosition + nextEngine.advancePosition(time, position - nextEngine.transportStartPosition, speed);    
    return this.__nextPosition = this.__transportQueue.move(nextEngine, nextEnginePosition);
  };

  function numEngines$get$0() {
    return this.__transportedEngines.length + this.__speedControlledEngines.length + this.__scheduledEngines.length;
  }

  // TimeEngine method (speed-controlled interface)
  proto$0.syncSpeed = function(time, position, speed) {var $D$4;var $D$5;var $D$6;var $D$7;var seek = arguments[3];if(seek === void 0)seek = false;
    var lastSpeed = this.__speed;

    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    if (speed !== lastSpeed || seek) {
      var nextPosition = this.__nextPosition;
      var scheduledEngine;

      if (seek) {
        nextPosition = this.__resyncTransportedEngines(time, position, speed);
      } else if (lastSpeed === 0) { // start or seek
        // resync transported engines
        nextPosition = this.__resyncTransportedEngines(time, position, speed);

        // add scheduled cell to scheduler (will be rescheduled to appropriate time below)
        this.__scheduledCell = new TransportScheduledCell(this);
        scheduler.add(this.__scheduledCell, Infinity);

        // start scheduled engines
        $D$7 = (this.__scheduledEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (scheduledEngine ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{scheduledEngine = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);scheduledEngine.resetNextTime(0);};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
      } else if (speed === 0) { // stop
        nextPosition = Infinity;

        // remove scheduled cell from scheduler
        scheduler.remove(this.__scheduledCell);
        delete this.__scheduledCell;

        // stop scheduled engines
        $D$7 = (this.__scheduledEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (scheduledEngine ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{scheduledEngine = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);scheduledEngine.resetNextTime(Infinity);};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
      } else if (speed * lastSpeed < 0) { // change transport direction
        nextPosition = this.__resyncTransportedEngines(time, position, speed);
      }

      this.resetNextPosition(nextPosition);

      $D$7 = (this.__speedControlledEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (var speedControlledEngine ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{speedControlledEngine = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);speedControlledEngine.syncSpeed(time, position, speed, seek);};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
    }
  };

  /**
   * Add a time engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   */
  proto$0.add = function(engine) {var startPosition = arguments[1];if(startPosition === void 0)startPosition = 0;var this$0 = this;
    if (!engine.interface) {
      var time = this.currentTime;
      var position = this.currentPosition;
      var speed = this.__speed;

      var getCurrentTime = function()  {
        return scheduler.currentTime;
      };

      var getCurrentPosition = function()  {
        return this$0.currentPosition - startPosition;
      };

      if (TimeEngine.implementsTransported(engine)) {
        // add time engine with transported interface
        this.__transportedEngines.push(engine);

        engine.setTransported(startPosition, function()  {var nextEnginePosition = arguments[0];if(nextEnginePosition === void 0)nextEnginePosition = null;
          // resetNextPosition
          var time = this$0.currentTime;
          var position = this$0.currentPosition;
          var speed = this$0.__speed;

          if (speed !== 0) {
            if (nextEnginePosition === null)
              nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);

            var nextPosition = this$0.__transportQueue.move(engine, nextEnginePosition);
            this$0.resetNextPosition(nextPosition);
          }
        }, getCurrentTime, getCurrentPosition);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
          var nextPosition = this.__transportQueue.insert(engine, nextEnginePosition);

          this.resetNextPosition(nextPosition);
        }
      } else if (TimeEngine.implementsSpeedControlled(engine)) {
        // add time engine with speed-controlled interface
        this.__speedControlledEngines.push(engine);

        engine.setSpeedControlled(getCurrentTime, getCurrentPosition);

        if (speed !== 0)
          engine.syncSpeed(time, position, speed);
      } else if (TimeEngine.implementsScheduled(engine)) {
        // add time engine with scheduled interface
        this.__scheduledEngines.push(engine);

        var delay = (this.__speed !== 0) ? 0 : Infinity;
        scheduler.add(engine, delay, getCurrentPosition);
      } else {
        throw new Error("object cannot be added to transport");
      }
    } else {
      throw new Error("object has already been added to a master");
    }
  };

  /**
   * Remove a time engine from the transport
   * @param {object} engine engine to be removed from the transport
   */
  proto$0.remove = function(engine) {
    var time = this.currentTime;
    var position = this.currentPosition;

    if (TimeEngine.implementsTransported(engine) && arrayRemove(this.__transportedEngines, engine)) {
      // remove engine with transported interface
      var nextPosition = this.__transportQueue.remove(engine);

      if (this.__speed !== 0)
        this.resetNextPosition(nextPosition);

      engine.resetInterface();
    } else if (TimeEngine.implementsSpeedControlled(engine) && arrayRemove(this.__speedControlledEngines, engine)) {
      // remove engine with speed-controlled interface
      engine.syncSpeed(time, position, 0);

      engine.resetInterface();
    } else if (TimeEngine.implementsScheduled(engine) && arrayRemove(this.__scheduledEngines, engine)) {
      // remove engine with scheduled interface
      scheduler.remove(engine);
    } else {
      throw new Error("object has not been added to this transport");
    }
  };

  /**
   * Remove all time engines from the transport
   */
  proto$0.clear = function() {var $D$8;var $D$9;var $D$10;var $D$11;
    var time = this.currentTime;
    var position = this.currentPosition;

    this.syncSpeed(time, position, 0);

    $D$11 = (this.__transportedEngines);$D$8 = GET_ITER$0($D$11);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? $D$11.length : void 0);for (var transportedEngine ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];)
{transportedEngine = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);transportedEngine.resetInterface();};$D$8 = $D$9 = $D$10 = $D$11 = void 0;

    $D$11 = (this.__speedControlledEngines);$D$8 = GET_ITER$0($D$11);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? $D$11.length : void 0);for (var speedControlledEngine ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];)
{speedControlledEngine = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);speedControlledEngine.resetInterface();};$D$8 = $D$9 = $D$10 = $D$11 = void 0;

    $D$11 = (this.__scheduledEngines);$D$8 = GET_ITER$0($D$11);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? $D$11.length : void 0);for (var scheduledEngine ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];)
{scheduledEngine = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);scheduler.remove(scheduledEngine);};$D$8 = $D$9 = $D$10 = $D$11 = void 0;

    this.__transportedEngines.length = 0;
    this.__speedControlledEngines.length = 0;
    this.__scheduledEngines.length = 0;

    this.resetNextPosition(Infinity);
  };

MIXIN$0(Transport.prototype,proto$0);proto$0=void 0;return Transport;})(TimeEngine);

module.exports = Transport;
},{"priority-queue":2,"scheduler":3,"time-engine":8}],2:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 *
 * First rather stupid implementation to be optimized...
 */
'use strict';

var PriorityQueue = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};

  function PriorityQueue() {
    this.__objects = [];
    this.reverse = false;
  }DPS$0(PriorityQueue.prototype,{head: {"get": head$get$0, "configurable":true,"enumerable":true}});DP$0(PriorityQueue,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  /* Get the index of an object in the object list */
  proto$0.__objectIndex = function(object) {
    for (var i = 0; i < this.__objects.length; i++) {
      if (object === this.__objects[i][0]) {
        return i;
      }
    }

    return -1;
  };

  /* Withdraw an object from the object list */
  proto$0.__removeObject = function(object) {
    var index = this.__objectIndex(object);

    if (index >= 0)
      this.__objects.splice(index, 1);

    if (this.__objects.length > 0)
      return this.__objects[0][1]; // return time of first object

    return Infinity;
  };

  proto$0.__sortObjects = function() {
    if (!this.reverse)
      this.__objects.sort(function(a, b) {
        return a[1] - b[1];
      });
    else
      this.__objects.sort(function(a, b) {
        return b[1] - a[1];
      });
  };

  /**
   * Insert an object to the queue
   * (for this primitive version: prevent sorting for each element by calling with "false" as third argument)
   */
  proto$0.insert = function(object, time) {var sort = arguments[2];if(sort === void 0)sort = true;
    if (time !== Infinity && time != -Infinity) {
      // add new object
      this.__objects.push([object, time]);

      if (sort)
        this.__sortObjects();

      return this.__objects[0][1]; // return time of first object
    }

    return this.__removeObject(object);
  };

  /**
   * Move an object to another time in the queue
   */
  proto$0.move = function(object, time) {
    if (time !== Infinity && time != -Infinity) {
      var index = this.__objectIndex(object);

      if (index < 0)
        this.__objects.push([object, time]); // add new object
      else
        this.__objects[index][1] = time; // update time of existing object

      this.__sortObjects();

      return this.__objects[0][1]; // return time of first object
    }

    return this.__removeObject(object);
  };

  /**
   * Remove an object from the queue
   */
  proto$0.remove = function(object) {
    return this.__removeObject(object);
  };

  /**
   * Clear queue
   */
  proto$0.clear = function() {
    this.__objects.length = 0; // clear object list
    return Infinity;
  };

  /**
   * Get first object in queue
   */
  function head$get$0() {
    return this.__objects[0][0];
  }
MIXIN$0(PriorityQueue.prototype,proto$0);proto$0=void 0;return PriorityQueue;})();

module.exports = PriorityQueue;
},{}],3:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE scheduler singleton based on audio time (time-engine master)
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

var audioContext = _dereq_("audio-context");
var PriorityQueue = _dereq_("priority-queue");
var TimeEngine = _dereq_("time-engine");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var Scheduler = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};
  function Scheduler() {
    this.__queue = new PriorityQueue();
    this.__scheduledEngines = [];

    this.__currentTime = null;
    this.__nextTime = Infinity;
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
  }DPS$0(Scheduler.prototype,{currentTime: {"get": currentTime$get$0, "configurable":true,"enumerable":true}});DP$0(Scheduler,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // global setTimeout scheduling loop
  proto$0.__tick = function() {var this$0 = this;
    while (this.__nextTime <= audioContext.currentTime + this.lookahead) {
      this.__currentTime = this.__nextTime;

      var nextEngine = this.__queue.head;
      var nextEngineTime = Math.max(nextEngine.advanceTime(this.__currentTime), this.__currentTime);

      this.__nextTime = this.__queue.move(nextEngine, nextEngineTime);
    }

    this.__currentTime = null;
    this.__timeout = null;

    if (this.__nextTime !== Infinity) {
      this.__timeout = setTimeout(function()  {
        this$0.__tick();
      }, this.period * 1000);
    }
  };

  proto$0.__reschedule = function(time) {
    if (this.__nextTime !== Infinity) {
      if (!this.__timeout)
        this.__tick();
    } else if (this.__timeout) {
      clearTimeout(this.__timeout);
      this.__timeout = null;
    }
  };

  /**
   * Get scheduler time
   * @return {Number} current scheduler time including lookahead
   */
  function currentTime$get$0() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called
   * @param {Number} delay of first callback (default is 0)
   * @param {Number} period callback period (default is 0 for one-shot)
   * @return {Object} scheduled object that can be used to call remove and reset
   */
  proto$0.callback = function(callback) {var delay = arguments[1];if(delay === void 0)delay = 0;var period = arguments[2];if(period === void 0)period = 0;
    var engine = {
      period: period || Infinity,
      advanceTime: function(time) {
        callback(time);
        return time + this.period;
      }
    };

    this.__nextTime = this.__queue.insert(engine, this.currentTime + delay);
    this.__reschedule();

    return engine;
  };

  /**
   * Add a time engine to the scheduler
   * @param {Object} engine time engine to be added to the scheduler
   * @param {Number} delay scheduling delay time
   * @param {Function} function to get current position
   */
  proto$0.add = function(engine) {var delay = arguments[1];if(delay === void 0)delay = 0;var getCurrentPosition = arguments[2];if(getCurrentPosition === void 0)getCurrentPosition = null;var this$0 = this;
    if (!engine.interface) {
      if (TimeEngine.implementsScheduled(engine)) {
        this.__scheduledEngines.push(engine);

        engine.setScheduled(function(time)  {
          this$0.__nextTime = this$0.__queue.move(engine, time);
          this$0.__reschedule();
        }, function()  {
          return this$0.currentTime;
        }, getCurrentPosition);

        this.__nextTime = this.__queue.insert(engine, this.currentTime + delay);
        this.__reschedule();
      } else {
        throw new Error("object cannot be added to scheduler");
      }
    } else {
      throw new Error("object has already been added to a master");
    }
  };

  /**
   * Remove time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  proto$0.remove = function(engine) {
    if (arrayRemove(this.__scheduledEngines, engine)) {
      engine.resetInterface();

      this.__nextTime = this.__queue.remove(engine);
      this.__reschedule();
    } else {
      throw new Error("object has not been added to this scheduler");
    }
  };

  /**
   * Reschedule a scheduled time engine or callback at a given time
   * @param {Object} engine time engine or callback to be rescheduled
   * @param {Number} time time when to reschedule
   */
  proto$0.reset = function(engine, time) {
    this.__nextTime = this.__queue.move(engine, time);
    this.__reschedule();
  };
MIXIN$0(Scheduler.prototype,proto$0);proto$0=void 0;return Scheduler;})();

module.exports = new Scheduler; // export scheduler singleton
},{"audio-context":4,"priority-queue":5,"time-engine":6}],4:[function(_dereq_,module,exports){
/* Generated by es6-transpiler v 0.7.14-2 */
// instantiates an audio context in the global scope if not there already
var context = window.audioContext || new AudioContext() || new webkitAudioContext();
window.audioContext = context;
module.exports = context;
},{}],5:[function(_dereq_,module,exports){
module.exports=_dereq_(2)
},{}],6:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine base class
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
"use strict";

var audioContext = _dereq_("audio-context");

/**
 * @class TimeEngine
 * @classdesc Base class for time engines
 *
 * Time engines are components that generate more or less regular audio events and/or playback a media stream.
 * They implement one or multiple imterfaces to be synchronized by a master such as a scheduler, a transport or a play-control.
 * The provided interfaces are "scheduled", "transported", and "play-controlled".
 * 
 * In the "scheduled" interface the engine implements a method "advanceTime" that is called by the master (usually teh scheduler) 
 * and returns the delay until the next call of "advanceTime". The master provides the engien with a function "resetNextTime" 
 * to reschedule the next call to another time.
 *
 * In the "transported" interface the master (usually a transport) first calls the method "syncPosition" that returns the position
 * of the first event generated by the engine regarding the playing direction (sign of the speed argument). Events are generated 
 * through the method "advancePosition" that returns the position of the next event generated through "advancePosition".
 *
 * In the "speed-controlled" interface the engine is controlled by the method "syncSpeed".
 *
 * For all interfaces the engine is provided with the attribute getters "currentTime" and "currentPosition" (for the case that the master 
 * does not implement these attributte getters, the base class provides default implementations).
 */
var TimeEngine = (function(){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var DPS$0 = Object.defineProperties;var proto$0={};

  /**
   * @constructor
   */
  function TimeEngine() {

    /**
     * Interface currently used
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
  }DPS$0(TimeEngine.prototype,{currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}, currentPosition: {"get": $currentPosition_get$0, "configurable":true,"enumerable":true}});DP$0(TimeEngine,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  /**
   * Get the time engine's current master time
   * @type {Function}
   *
   * This function provided by the master.
   */
  function $currentTime_get$0() {
    return audioContext.currentTime;
  }

  /**
   * Get the time engine's current master position
   * @type {Function}
   *
   * This function provided by the master.
   */
  function $currentPosition_get$0() {
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
   * the scheduler or it calls resetNextPosition with a valid position.
   */
  // advanceTime(time) {
  //   return time;
  // }

  /**
   * Function provided by the scheduler to reset the engine's next time
   * @param {Number} time new engine time (immediately if not specified)
   */
  proto$0.resetNextTime = function() {var time = arguments[0];if(time === void 0)time = null;};

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
   * resynchronized by the transport or it calls resetNextPosition.
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
   * resynchronized by the transport or it calls resetNextPosition.
   */
  // advancePosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Function provided by the transport to reset the next position or to request resynchronizing the engine's position
   * @param {Number} position new engine position (will call syncPosition with the current position if not specified)
   */
  proto$0.resetNextPosition = function() {var position = arguments[0];if(position === void 0)position = null;};;

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

  proto$0.__setGetters = function(getCurrentTime, getCurrentPosition) {
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

  proto$0.__deleteGetters = function() {
    delete this.currentTime;
    delete this.currentPosition;
  };

  proto$0.setScheduled = function(resetNextTime, getCurrentTime, getCurrentPosition) {
    this.interface = "scheduled";
    this.__setGetters(getCurrentTime, getCurrentPosition);
    if (resetNextTime)
      this.resetNextTime = resetNextTime;
  };

  proto$0.setTransported = function(startPosition, resetNextPosition, getCurrentTime, getCurrentPosition) {
    this.interface = "transported";
    this.transportStartPosition = startPosition;
    this.__setGetters(getCurrentTime, getCurrentPosition);
    if (resetNextPosition)
      this.resetNextPosition = resetNextPosition;
  };

  proto$0.setSpeedControlled = function(getCurrentTime, getCurrentPosition) {
    this.interface = "speed-controlled";
    this.__setGetters(getCurrentTime, getCurrentPosition);
  };

  proto$0.resetInterface = function() {
    this.__deleteGetters();
    delete this.resetNextTime;
    delete this.resetNextPosition;
    this.transportStartPosition = 0;
    this.interface = null;
  };

  /**
   * Connect audio node
   * @param {Object} target audio node
   */
  proto$0.connect = function(target) {
    this.outputNode.connect(target);
    return this;
  };

  /**
   * Disconnect audio node
   * @param {Number} connection connection to be disconnected
   */
  proto$0.disconnect = function(connection) {
    this.outputNode.disconnect(connection);
    return this;
  };
MIXIN$0(TimeEngine.prototype,proto$0);proto$0=void 0;return TimeEngine;})();

/**
 * Check whether the time engine implements the scheduled interface
 **/
TimeEngine.implementsScheduled = function(engine) {
  return (engine.advanceTime && engine.advanceTime instanceof Function);
}

/**
 * Check whether the time engine implements the transported interface
 **/
TimeEngine.implementsTransported = function(engine) {
  return (
    engine.syncPosition && engine.syncPosition instanceof Function &&
    engine.advancePosition && engine.advancePosition instanceof Function
  );
}

/**
 * Check whether the time engine implements the speed-controlled interface
 **/
TimeEngine.implementsSpeedControlled = function(engine) {
  return (engine.syncSpeed && engine.syncSpeed instanceof Function);
}

module.exports = TimeEngine;
},{"audio-context":7}],7:[function(_dereq_,module,exports){
module.exports=_dereq_(4)
},{}],8:[function(_dereq_,module,exports){
module.exports=_dereq_(6)
},{"audio-context":9}],9:[function(_dereq_,module,exports){
module.exports=_dereq_(4)
},{}]},{},[1])
(1)
});