!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Transport=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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
},{}],2:[function(_dereq_,module,exports){
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
    this.__timeMaster = null;

    /**
     * Function provided by time master to get the master time
     * @type {Function}
     */
    this.getMasterTime = function() {
      return 0;
    };

    /**
     * Function provided by the time master to reset the engine's next time
     * @param {Number} time new engine time (immediately if not specified)
     */
    this.resetEngineTime = function(time) {};

    /**
     * Position master to which the time engine is synchronized
     * @type {Object}
     */
    this.__positionMaster = null;

    /**
     * Start position of the engine
     * @type {Object}
     */
    this.__startPosition = 0;

    /**
     * Function provided by position master to get the master position
     * @type {Function}
     */
    this.getMasterPosition = function() {
      return 0;
    };

    /**
     * Function provided by the position master to request resynchronizing the engine's position
     * @param {Number} time new engine time (immediately if not specified)
     */
    this.resyncEnginePosition = function() {};

    /**
     * Output audio node
     * @type {Object}
     */
    this.outputNode = null;
  }Object.defineProperties(TimeEngine.prototype, {timeMaster: {"get": timeMaster$get$0, "set": timeMaster$set$0, "configurable": true, "enumerable": true}, positionMaster: {"get": positionMaster$get$0, "set": positionMaster$set$0, "configurable": true, "enumerable": true}, implementsTimeBased: {"get": implementsTimeBased$get$0, "configurable": true, "enumerable": true}, implementsPositionBased: {"get": implementsPositionBased$get$0, "configurable": true, "enumerable": true}, implementsSpeedBased: {"get": implementsSpeedBased$get$0, "configurable": true, "enumerable": true}});DP$0(TimeEngine, "prototype", {"configurable": false, "enumerable": false, "writable": false});

  function timeMaster$set$0(timeMaster) {
    this.__timeMaster = timeMaster;
  }

  function timeMaster$get$0() {
    return this.__timeMaster;
  }

  function positionMaster$set$0(positionMaster) {
    this.__positionMaster = positionMaster;
  }

  function positionMaster$get$0() {
    return this.__positionMaster;
  }

  /**
   * Synchronize engine to master time ("time-based" interface, optional function)
   * @param {Number} time current master time (based on audio time)
   * @return {Number} first time
   *
   * This optional function is called by the time master and allows the engine to
   * return its first time.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * reset by the time master or it calls resetEngineTime().
   */
  $proto$0.initTime = function(time) {
    return time;
  };

  /**
   * Advance engine time ("time-based" interface)
   * @param {Number} time current master time (based on audio time)
   * @return {Number} next engine time
   *
   * This function is called by the time master to let the engine do its work
   * synchronized to the master's time.
   * If the engine returns Infinity, it is not called again until it is restarted by
   * the time master or it calls resyncEnginePosition() with a valid position.
   */
  // advanceTime(time) {
  //   return time;
  // }

  /**
   * Synchronize engine to master position ("position-based" interface)
   * @param {Number} position current master position to synchronize to
   * @param {Number} time current master time (based on audio time)
   * @param {Number} speed current speed
   * @return {Number} next position (given the playing direction)
   *
   * This function is called by the msater and allows the engine for synchronizing
   * (seeking) to the current master position and to return its next position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the position master or it calls resyncEnginePosition().
   */
  // syncPosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Advance engine position ("position-based" interface)
   * @param {Number} time current master time (based on audio time)
   * @param {Number} position current master position
   * @param {Number} speed current speed
   * @return {Number} next engine position (given the playing direction)
   *
   * This function is called by the position master to let the engine do its work
   * aligned to the master's position.
   * If the engine returns Infinity or -Infinity, it is not called again until it is
   * resynchronized by the position master or it calls resyncEnginePosition().
   */
  // advancePosition(time, position, speed) {
  //   return position;
  // }

  /**
   * Set engine speed ("speed-based" interface)
   * @param {Number} speed current master speed
   *
   * This function is called by the speed master to propagate the master's speed to the engine.
   * The speed can be of any bewteen -16 and 16.
   * With a speed of 0 the engine is halted.
   */
  // set speed(speed) {
  // }

  /**
   * Seek engine to a given position ("speed-based" interface)
   * @param {Number} position position to seek to
   *
   * This function is called by the speed master to propagate position jumps to the engine.
   */
  // seek(speed) {
  // }

  /**
   * Return whether the time engine implements the time-based interface
   **/
  function implementsTimeBased$get$0() {
    return (this.advanceTime && this.advanceTime instanceof Function);
  }

  /**
   * Return whether the time engine implements the position-based interface
   **/
  function implementsPositionBased$get$0() {
    return (
      this.syncPosition && this.syncPosition instanceof Function &&
      this.advancePosition && this.advancePosition instanceof Function
    );
  }

  /**
   * Return whether the time engine implements the speed-based interface
   **/
  function implementsSpeedBased$get$0() {
    return (
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(this), "speed") &&
      this.seek && this.seek instanceof Function
    );
  }

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
},{}],3:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized time-based and position-based scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr *
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};

var TimeEngine = _dereq_("../time-engine");
var PriorityQueue = _dereq_("../priority-queue");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

var TimeBasedAdapter = (function(){
  function TimeBasedAdapter(engine) {
    this.engine = engine;
  }DP$0(TimeBasedAdapter,"prototype",{"configurable":false,"enumerable":false,"writable":false});
;return TimeBasedAdapter;})();

var SpeedABasedAdapter = (function(){
  function SpeedABasedAdapter(engine) {
    this.engine = engine;
  }DP$0(SpeedABasedAdapter,"prototype",{"configurable":false,"enumerable":false,"writable":false});
;return SpeedABasedAdapter;})();

var Transport = (function(super$0){var SP$0 = Object.setPrototypeOf||function(o,p){o["__proto__"]=p;return o};var OC$0 = Object.create;if(!PRS$0)MIXIN$0(Transport, super$0);var proto$0={};var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;var f;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){if(S_MARK$0)S_MARK$0(void 0);return f.call(v);}if(S_MARK$0)S_MARK$0(void 0);if((v+'')==='[object Generator]')return v;}throw new Error(v+' is not iterable')};
  function Transport() {
    super$0.call(this);

    // The transport will be added to the time master when the first
    // engine arrives and removed when the last engine goes so that an
    // an empty transport has no cyclic references and can be garbage collected.
    this.__queue = new PriorityQueue();
    this.__positionEngines = [];
    this.__speedEngines = [];
    this.__timeEngines = [];

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextTime = Infinity;
    this.__nextPosition = Infinity;

    this.__playingSpeed = 1;
  }if(super$0!==null)SP$0(Transport,super$0);Transport.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Transport,"configurable":true,"writable":true}, numEngines: {"get": numEngines$get$0, "configurable":true,"enumerable":true}, time: {"get": time$get$0, "configurable":true,"enumerable":true}, position: {"get": position$get$0, "configurable":true,"enumerable":true}, speed: {"get": speed$get$0, "set": speed$set$0, "configurable":true,"enumerable":true}, playingSpeed: {"get": playingSpeed$get$0, "set": playingSpeed$set$0, "configurable":true,"enumerable":true}, timeMaster: {"get": timeMaster$get$0, "set": timeMaster$set$0, "configurable":true,"enumerable":true}});DP$0(Transport,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.__sync = function(time) {
    var now = time || this.getMasterTime();
    this.__position += (now - this.__time) * this.__speed;
    this.__time = now;
    return now;
  };

  proto$0.__reschedule = function(nextPosition) {
    var nextTime = this.getTimeAtPosition(nextPosition);

    if (nextTime !== this.__nextTime) {
      this.resetEngineTime(nextTime);
      this.__nextTime = nextTime
    }

    this.__nextPosition = nextPosition;
  };

  proto$0.__resyncPositionEngines = function() {
    var numPositionEngines = this.__positionEngines.length;
    var nextPosition = Infinity;

    if (numPositionEngines > 0) {
      var time = this.__time;
      var position = this.__position;
      var speed = this.__speed;
      var engine, nextEnginePosition;

      this.__queue.clear();
      this.__queue.reverse = (speed < 0);

      for (var i = numPositionEngines - 1; i > 0; i--) {
        engine = this.__positionEngines[i];
        nextEnginePosition = engine.__startPosition + engine.syncPosition(time, position - engine.__startPosition, speed);
        this.__queue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__positionEngines[0];
      nextEnginePosition = engine.__startPosition + engine.syncPosition(time, position - engine.__startPosition, speed);
      nextPosition = this.__queue.insert(engine, nextEnginePosition, true); // insert and sort
    }

    return nextPosition;
  };

  function numEngines$get$0() {
    return this.__positionEngines.length + this.__speedEngines.length + this.__timeEngines.length;
  }

  // TimeEngine method (time-based interface)
  proto$0.initTime = function(time) {
    return Infinity; // don't run before started (no start before added to time master)
  };

  // TimeEngine method time-based interface)
  proto$0.advanceTime = function(time) {
    this.__sync(time);

    var nextEngine = this.__queue.head;
    var startPosition = nextEngine.__startPosition;
    var nextEnginePosition = startPosition + nextEngine.advancePosition(time, this.__position - startPosition, this.__speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);
    var nextTime = this.getTimeAtPosition(nextPosition);
    this.__nextTime = nextTime

    return nextTime;
  };

  // TimeEngine method (position-based interface)
  proto$0.syncPosition = function(position, time, speed) {var $D$0;var $D$1;var $D$2;var $D$3;
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    $D$3 = (this.__speedEngines);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for (var listener ;$D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"];)
{listener = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);listener.seek(position);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;

    var nextPosition = this.__resetAllEngines(time, position);
    this.__nextPosition = nextPosition;

    return nextPosition;
  };

  // TimeEngine method (position-based interface)
  proto$0.advancePosition = function(position, time, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    var nextEngine = this.__queue.head;
    var nextEnginePosition = nextEngine.advancePosition(position, time, speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);

    this.__nextPosition = nextPosition;

    return nextPosition;
  };

  /**
   * Extrapolate transport time for given position
   * @param {Number} position position
   * @return {Number} extrapolated time
   */
  proto$0.getTimeAtPosition = function(position) {
    return this.__time + (position - this.__position) / this.__speed;
  };

  /**
   * Extrapolate transport position for given time
   * @param {Number} time time
   * @return {Number} extrapolated position
   */
  proto$0.getPositionAtTime = function(time) {
    return this.__position + (time - this.__time) * this.__speed;
  };

  /**
   * Get current transport (scheduling) time
   * @return {Number} current transport time
   */
  function time$get$0() {
    return this.getMasterTime();
  }

  /**
   * Get current transport position
   * @return {Number} current transport position
   */
  function position$get$0() {
    if (this.__positionMaster)
      return this.getMasterPosition();

    return this.getPositionAtTime(this.getMasterTime());
  }

 // TimeEngine method (speed-based interface)
  function speed$set$0(speed) {var $D$4;var $D$5;var $D$6;var $D$7;
    if (this.timeMaster) {
      var lastSpeed = this.__speed;

      if (speed !== lastSpeed) {
        this.__sync();
        this.__speed = speed;

        var nextPosition = this.__nextPosition;

        if (lastSpeed === 0 || speed * lastSpeed < 0) {
          // reset all engines when start or reverse direction
          nextPosition = this.__resyncPositionEngines();
        } else if (speed === 0) {
          nextPosition = Infinity;

          // stop time-based engines
          $D$7 = (this.__timeEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (var timeEngine ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{timeEngine = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);this.resetTime(timeEngine, Infinity);};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
        }

        this.__reschedule(nextPosition);

        $D$7 = (this.__speedEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (var listener ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{listener = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);listener.speed = speed;};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
      }
    } else {
      throw new Error("no time master");
    }
  }

  /**
   * Get current transport speed
   * @return {Number} current transport speed
   */
  function speed$get$0() {
    return this.__speed;
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  proto$0.seek = function(position) {var $D$8;var $D$9;var $D$10;var $D$11;
    if (position !== this.__position) {
      this.__sync();
      this.__position = position;

      var speed = this.__speed;

      if (speed !== 0) {
        var nextPosition = this.__resyncPositionEngines();
        this.__reschedule(nextPosition);

        $D$11 = (this.__speedEngines);$D$8 = GET_ITER$0($D$11);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? $D$11.length : void 0);for (var listener ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];)
{listener = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);listener.seek(position);};$D$8 = $D$9 = $D$10 = $D$11 = void 0;
      }
    }
  };

  /**
   * Start playing (high level player API)
   * @param {Number} seek start position
   * @param {Number} speed playing speed
   */
  proto$0.startPlaying = function() {var seek = arguments[0];if(seek === void 0)seek = null;var speed = arguments[1];if(speed === void 0)speed = null;
    if (seek)
      this.seek(seek);

    if (speed)
      this.playingSpeed = speed;

    this.speed = this.playingSpeed;
  };

  /**
   * Pause playing (high level player API)
   */
  proto$0.pausePlaying = function() {
    this.speed = 0;
  };

  /**
   * Stop playing (high level player API)
   */
  proto$0.stopPlaying = function() {
    this.speed = 0;
    this.seek(0);
  };

  /* TODO: The following methods should go into a mixin that extends any class 
   * with a speed attribute and a seek method into a player.
   */

  /**
   * Set playing speed (high level player API)
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  function playingSpeed$set$0(speed) {
    if (speed >= 0) {
      if (speed < 0.0625)
        speed = 0.0625;
      else if (speed > 16)
        speed = 16;
    } else {
      if (speed < -16)
        speed = -16
      else if (speed > -0.0625)
        speed = -0.0625;
    }

    this.__playingSpeed = speed;

    if (this.__speed !== 0)
      this.speed = speed;
  }

  /**
   * Get playing speed (high level player API)
   * @return current playing speed
   */
  function playingSpeed$get$0() {
    return this.__playingSpeed;
  }

  /**
   * Add an engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   *
   * An engine that can be added to the transport is either an TimeEngine
   * or an engine that implements a speed attribute (that halts with speed = 0).
   *
   * The attribute "alignToTransportPosition" of an time engine determines whether
   * the engine is scheduled in time or aligned to the transport position.
   */
  proto$0.add = function(engine) {var startPosition = arguments[1];if(startPosition === void 0)startPosition = 0;var this$0 = this;
    if (!engine.positionMaster && !engine.timeMaster) {
      var time = this.__sync();
      var speed = this.__speed;

      engine.positionMaster = this;

      // add time engine with position interface
      if (engine.implementsPositionBased) {
        this.__positionEngines.push(engine);

        engine.__startPosition = startPosition;

        engine.resyncEnginePosition = function()  {
          var time = this$0.__sync();
          var position = this$0.__position;
          var speed = this$0.__speed;

          if (speed !== 0) {
            var nextEnginePosition = engine.__startPosition + engine.syncPosition(time, position - engine.__startPosition, speed);
            var nextPosition = this$0.__queue.move(engine, nextEnginePosition);
            this$0.__reschedule(nextPosition);
          }
        };

        engine.getMasterPosition = function()  {
          return this$0.position - engine.__startPosition;
        };

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = engine.__startPosition + engine.syncPosition(time, this.__position - engine.__startPosition, speed);
          var nextPosition = this.__queue.insert(engine, nextEnginePosition);
          this.__reschedule(nextPosition);
        }
      } else if (engine.implementsSpeedBased) {
        // add time engine with speed attribute
        this.__speedEngines.push(engine);
        engine.speed = speed;
      } else if (engine.implementsTimeBased) {
        // add time engine with time interface
        this.__timeEngines.push(engine);

        if (this.timeMaster)
          this.timeMaster.add(engine, Infinity);
      } else {
        throw new Error("object cannot be added to transport");
      }
    } else {
      throw new Error("object already has a master");
    }
  };

  /**
   * Remove an engine from the transport
   * @param {object} engine engine to be removed from the transport
   */
  proto$0.remove = function(engine) {
    if (engine.positionMaster === this) {
      var time = this.__sync();

      engine.positionMaster = null;

      if (engine.implementsPositionBased) {
        var nextPosition = this.__queue.remove(engine);

        if (this.__speed !== 0)
          this.__reschedule(nextPosition);

        arrayRemove(this.__positionEngines, engine);
      } else if (engine.implementsSpeedBased) {
        // remove engine with speed control
        engine.speed = 0;
        arrayRemove(this.__speedEngines, engine);
      } else if (engine.implementsTimeBased) {
        if (this.timeMaster)
          this.timeMaster.remove(engine);

        arrayRemove(this.__timeEngines, engine);
      }
    } else {
      throw new Error("object has not been added to this transport");
    }
  };

  function timeMaster$set$0(timeMaster) {var $D$12;var $D$13;var $D$14;var $D$15;
    var timeEngine;

    if (timeMaster) {
      // add all time driven engines to time master
      $D$15 = (this.__timeEngines);$D$12 = GET_ITER$0($D$15);$D$14 = $D$12 === 0;$D$13 = ($D$14 ? $D$15.length : void 0);for (timeEngine ;$D$14 ? ($D$12 < $D$13) : !($D$13 = $D$12["next"]())["done"];)
{timeEngine = ($D$14 ? $D$15[$D$12++] : $D$13["value"]);timeMaster.add(timeEngine, Infinity);};$D$12 = $D$13 = $D$14 = $D$15 = void 0;
    } else {
      // remove all time driven engines from time master
      $D$15 = (this.__timeEngines);$D$12 = GET_ITER$0($D$15);$D$14 = $D$12 === 0;$D$13 = ($D$14 ? $D$15.length : void 0);for (timeEngine ;$D$14 ? ($D$12 < $D$13) : !($D$13 = $D$12["next"]())["done"];)
{timeEngine = ($D$14 ? $D$15[$D$12++] : $D$13["value"]);this.__timeMaster.remove(timeEngine);};$D$12 = $D$13 = $D$14 = $D$15 = void 0;
    }

    this.__timeMaster = timeMaster;
  }

  function timeMaster$get$0() {
    return this.__timeMaster;
  }
MIXIN$0(Transport.prototype,proto$0);proto$0=void 0;return Transport;})(TimeEngine);

module.exports = Transport;
},{"../priority-queue":1,"../time-engine":2}]},{},[3])
(3)
});