!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Transport=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class (time-engine master), provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;

var TimeEngine = _dereq_("time-engine");
var PriorityQueue = _dereq_("priority-queue");
var scheduler = _dereq_("scheduler");

function removeCouple(firstArray, secondArray, firstElement) {
  var index = firstArray.indexOf(firstElement);

  if (index >= 0) {
    var secondElement = secondArray[index];

    firstArray.splice(index, 1);
    secondArray.splice(index, 1);

    return secondElement;
  }

  return null;
}

var Transported = (function(super$0){if(!PRS$0)MIXIN$0(Transported, super$0);var proto$0={};
  function Transported(transport, engine, startPosition, endPosition, offsetPosition) {
    this.__transport = transport;
    this.__engine = engine;
    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.__haltPosition = null;
  }if(super$0!==null)SP$0(Transported,super$0);Transported.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Transported,"configurable":true,"writable":true}});DP$0(Transported,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.setBoundaries = function(startPosition, endPosition) {var offsetPosition = arguments[2];if(offsetPosition === void 0)offsetPosition = startPosition;
    this.__startPosition = startPosition;
    this.__endPosition = endPosition;
    this.__offsetPosition = offsetPosition;
    this.resetNextPosition();
  };

  proto$0.start = function(time, position, speed) {};
  proto$0.stop = function(time, position) {};

  proto$0.syncPosition = function(time, position, speed) {
    if (speed > 0) {
      if (position < this.__startPosition) {
        this.stop(time, position);
        this.__haltPosition = this.__endPosition;
        return this.__startPosition;
      } else if (position <= this.__endPosition) {
        this.start(time, position, speed);
        this.__haltPosition = null;
        return this.__endPosition;
      }
    } else {
      if (position >= this.__endPosition) {
        this.stop(time, position);
        this.__haltPosition = this.__startPosition;
        return this.__endPosition;
      } else if (position > this.__startPosition) {
        this.start(time, position, speed);
        this.__haltPosition = null;
        return this.__startPosition;
      }
    }

    this.__haltPosition = Infinity;

    return Infinity;
  };

  proto$0.advancePosition = function(time, position, speed) {
    var haltPosition = this.__haltPosition;

    if (haltPosition !== null) {
      this.start(time, position - this.__offsetPosition, speed);
      this.__haltPosition = null;
      return haltPosition;
    }

    // stop engine
    this.stop(time, position - this.__offsetPosition);
    this.__haltPosition = Infinity;
    return Infinity;
  };

  proto$0.syncSpeed = function(time, position, speed) {
    if (speed === 0)
      this.stop(time, position - this.__offsetPosition);
  };

  proto$0.destroy = function() {
    this.__transport = null;
    this.__engine = null;
  };
MIXIN$0(Transported.prototype,proto$0);proto$0=void 0;return Transported;})(TimeEngine);

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position
var TransportedTransported = (function(super$0){if(!PRS$0)MIXIN$0(TransportedTransported, super$0);var proto$0={};
  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {var this$0 = this;
    super$0.call(this, transport, engine, startPosition, endPosition, offsetPosition);

    TimeEngine.setTransported(engine, function()  {var nextEnginePosition = arguments[0];if(nextEnginePosition === void 0)nextEnginePosition = null;
      // resetNextPosition
      var time = this$0.currentTime;
      var position = this$0.currentPosition;
      var speed = this$0.__speed;

      if (speed !== 0) {
        if (nextEnginePosition === null)
          nextEnginePosition = this$0.__offsetPosition + engine.syncPosition(time, position - this$0.__offsetPosition, speed);

        var nextPosition = this$0.__transportQueue.move(engine, nextEnginePosition);
        this$0.resetNextPosition(nextPosition);
      }
    }, function()  {
      // getCurrentTime
      return scheduler.currentTime;
    }, function()  {
      // getCurrentPosition
      return this$0.__transport.currentPosition - this$0.__offsetPosition;
    });
  }if(super$0!==null)SP$0(TransportedTransported,super$0);TransportedTransported.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":TransportedTransported,"configurable":true,"writable":true}});DP$0(TransportedTransported,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.syncPosition = function(time, position, speed) {
    if (speed > 0 && position < this.__endPosition)
      position = Math.max(position, this.__startPosition);
    else if (speed < 0 && position >= this.__startPosition)
      position = Math.min(position, this.__endPosition);

    position = this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);

    if (speed > 0 && position < this.__endPosition)
      return Math.max(position, this.__startPosition);
    else if (speed < 0 && position >= this.__startPosition)
      return Math.min(position, this.__endPosition);

    return Infinity;
  };

  proto$0.advancePosition = function(time, position, speed) {
    position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

    if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition)
      return position;

    return Infinity;
  };

  proto$0.syncSpeed = function(time, position, speed) {
    if (this.__engine.syncSpeed)
      this.__engine.syncSpeed(time, position, speed);
  };

  proto$0.destroy = function() {
    TimeEngine.resetInterface(this.__engine);
    super$0.prototype.destroy.call(this);
  };
MIXIN$0(TransportedTransported.prototype,proto$0);proto$0=void 0;return TransportedTransported;})(Transported);

// TransportedSpeedControlled has to start and stop the speed-controlled engines
// when the transport hits the engine's start and end position
var TransportedSpeedControlled = (function(super$0){if(!PRS$0)MIXIN$0(TransportedSpeedControlled, super$0);var proto$0={};
  function TransportedSpeedControlled(transport, engine, startPosition, endPosition, offsetPosition) {var this$0 = this;
    super$0.call(this, transport, engine, startPosition, endPosition, offsetPosition);

    TimeEngine.setSpeedControlled(engine, function()  {
      // getCurrentTime
      return scheduler.currentTime;
    }, function()  {
      // getCurrentPosition
      return this$0.__transport.currentPosition - this$0.__offsetPosition;
    });
  }if(super$0!==null)SP$0(TransportedSpeedControlled,super$0);TransportedSpeedControlled.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":TransportedSpeedControlled,"configurable":true,"writable":true}});DP$0(TransportedSpeedControlled,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.start = function(time, position, speed) {
    this.__engine.syncSpeed(time, position, speed);
  };

  proto$0.stop = function(time, position) {
    this.__engine.syncSpeed(time, position, 0);
  };

  proto$0.syncSpeed = function(time, position, speed) {
    if(this.__haltPosition === null)
      this.__engine.syncSpeed(time, position, speed);
  };

  proto$0.destroy = function() {
    this.__engine.syncSpeed(this.__transport.time, this.__transport.position - this.__offsetPosition, 0);
    TimeEngine.resetInterface(this.__engine);
    super$0.prototype.destroy.call(this);
  };
MIXIN$0(TransportedSpeedControlled.prototype,proto$0);proto$0=void 0;return TransportedSpeedControlled;})(Transported);

// TransportedScheduled has to switch on and off the scheduled engines
// when the transport hits the engine's start and end position
var TransportedScheduled = (function(super$0){if(!PRS$0)MIXIN$0(TransportedScheduled, super$0);var proto$0={};
  function TransportedScheduled(transport, engine, startPosition, endPosition, offsetPosition) {var this$0 = this;
    super$0.call(this, transport, engine, startPosition, endPosition, offsetPosition);

    scheduler.add(engine, Infinity, function()  {
      // getCurrentPosition
      return this$0.__transport.currentPosition - this$0.__offsetPosition;
    });
  }if(super$0!==null)SP$0(TransportedScheduled,super$0);TransportedScheduled.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":TransportedScheduled,"configurable":true,"writable":true}});DP$0(TransportedScheduled,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.start = function(time, position, speed) {
    this.__engine.resetNextTime(time);
  };

  proto$0.stop = function(time, position) {
    this.__engine.resetNextTime(Infinity);
  };

  proto$0.destroy = function() {
    scheduler.remove(this.__engine);
    super$0.prototype.destroy.call(this);
  };
MIXIN$0(TransportedScheduled.prototype,proto$0);proto$0=void 0;return TransportedScheduled;})(Transported);

var TransportScheduledCell = (function(super$0){if(!PRS$0)MIXIN$0(TransportScheduledCell, super$0);var proto$0={};
  function TransportScheduledCell(transport) {
    super$0.call(this);
    this.__transport = transport;
  }if(super$0!==null)SP$0(TransportScheduledCell,super$0);TransportScheduledCell.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":TransportScheduledCell,"configurable":true,"writable":true}});DP$0(TransportScheduledCell,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // TimeEngine method (scheduled interface)
  proto$0.advanceTime = function(time) {
    var transport = this.__transport;
    var position = transport.__getPositionAtTime(time);
    var nextPosition = transport.advancePosition(time, position, transport.__speed);

    if (nextPosition !== Infinity)
      return transport.__getTimeAtPosition(nextPosition);

    return Infinity;
  };
MIXIN$0(TransportScheduledCell.prototype,proto$0);proto$0=void 0;return TransportScheduledCell;})(TimeEngine);

/**
 * xxx
 *
 *
 */
var Transport = (function(super$0){if(!PRS$0)MIXIN$0(Transport, super$0);var proto$0={};
  function Transport() {
    super$0.call(this);

    this.__engines = [];
    this.__transported = [];

    this.__scheduledCell = null;
    this.__transportQueue = new PriorityQueue();

    // syncronized time, position, and speed
    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextPosition = Infinity;
  }if(super$0!==null)SP$0(Transport,super$0);Transport.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Transport,"configurable":true,"writable":true}, currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}, currentPosition: {"get": $currentPosition_get$0, "configurable":true,"enumerable":true}});DP$0(Transport,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.__getPositionAtTime = function(time) {
    return this.__position + (time - this.__time) * this.__speed;
  };

  proto$0.__getTimeAtPosition = function(position) {
    return this.__time + (position - this.__position) / this.__speed;
  };

  proto$0.__syncTransportedPosition = function(time, position, speed) {
    var numTransportedEngines = this.__transported.length;
    var nextPosition = Infinity;

    if (numTransportedEngines > 0) {
      var engine, nextEnginePosition;

      this.__transportQueue.clear();
      this.__transportQueue.reverse = (speed < 0);

      for (var i = numTransportedEngines - 1; i > 0; i--) {
        engine = this.__transported[i];
        nextEnginePosition = engine.syncPosition(time, position, speed);
        this.__transportQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__transported[0];
      nextEnginePosition = engine.syncPosition(time, position, speed);
      nextPosition = this.__transportQueue.insert(engine, nextEnginePosition, true); // insert and sort 
    }

    return nextPosition;
  };

  proto$0.__syncTransportedSpeed = function(time, position, speed) {var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;var f;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){if(S_MARK$0)S_MARK$0(void 0);return f.call(v);}if(S_MARK$0)S_MARK$0(void 0);if((v+'')==='[object Generator]')return v;}throw new Error(v+' is not iterable')};var $D$0;var $D$1;var $D$2;var $D$3;
    $D$3 = (this.__transported);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for (var transported ;$D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"];)
{transported = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);transported.syncSpeed(time, position, speed);};$D$0 = $D$1 = $D$2 = $D$3 = void 0;
  };

  /**
   * Get current master time
   * @return {Number} current time
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  function $currentTime_get$0() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current playing position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  function $currentPosition_get$0() {
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
  proto$0.syncPosition = function(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    return this.__syncTransportedPosition(time, position, speed);
  };

  // TimeEngine method (transported interface)
  proto$0.advancePosition = function(time, position, speed) {
    var nextEngine = this.__transportQueue.head;
    var nextEnginePosition = nextEngine.advancePosition(time, position, speed);

    this.__nextPosition = this.__transportQueue.move(nextEngine, nextEnginePosition);

    return this.__nextPosition;
  };

  // TimeEngine method (speed-controlled interface)
  proto$0.syncSpeed = function(time, position, speed) {var seek = arguments[3];if(seek === void 0)seek = false;
    var lastSpeed = this.__speed;

    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    if (speed !== lastSpeed || seek) {
      var nextPosition = this.__nextPosition;
      var scheduledEngine;

      // resync transported engines
      if (seek || speed * lastSpeed < 0) {
        // seek or reverse direction
        nextPosition = this.__syncTransportedPosition(time, position, speed);
      } else if (lastSpeed === 0) {
        // start
        nextPosition = this.__syncTransportedPosition(time, position, speed);

        // schedule transport itself
        this.__scheduledCell = new TransportScheduledCell(this);
        scheduler.add(this.__scheduledCell, Infinity);
      } else if (speed === 0) {
        // stop
        nextPosition = Infinity;

        this.__syncTransportedSpeed(time, position, 0);

        // unschedule transport itself
        scheduler.remove(this.__scheduledCell);
        delete this.__scheduledCell;
      } else {
        // change speed without reversing direction
        this.__syncTransportedSpeed(time, position, speed);
      }

      this.resetNextPosition(nextPosition);
    }
  };

  /**
   * Add a time engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   */
  proto$0.add = function(engine) {var startPosition = arguments[1];if(startPosition === void 0)startPosition = 0;var endPosition = arguments[2];if(endPosition === void 0)endPosition = Infinity;var offsetPosition = arguments[3];if(offsetPosition === void 0)offsetPosition = startPosition;
    var transported = null;

    if (!engine.interface) {
      if (TimeEngine.implementsTransported(engine))
        transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);
      else if (TimeEngine.implementsSpeedControlled(engine))
        transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);
      else if (TimeEngine.implementsScheduled(engine))
        transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);
      else
        throw new Error("object cannot be added to transport");

      if (transported) {
        var speed = this.__speed;

        this.__engines.push(engine);
        this.__transported.push(transported);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = transported.syncPosition(this.currentTime, this.currentPosition, speed);
          var nextPosition = this.__transportQueue.insert(transported, nextEnginePosition);

          this.resetNextPosition(nextPosition);
        }
      }
    } else {
      throw new Error("object has already been added to a master");
    }

    return transported;
  };

  /**
   * Remove a time engine from the transport
   * @param {object} engineOrTransported engine or transported to be removed from the transport
   */
  proto$0.remove = function(engineOrTransported) {
    var engine = engineOrTransported;
    var transported = removeCouple(this.__engines, this.__transported, engineOrTransported);

    if (!transported) {
      engine = removeCouple(this.__transported, this.__engines, engineOrTransported);
      transported = engineOrTransported;
    }

    if (engine && transported) {
      var nextPosition = this.__transportQueue.remove(transported);

      transported.destroy();

      if (this.__speed !== 0)
        this.resetNextPosition(nextPosition);
    } else {
      throw new Error("object has not been added to this transport");
    }
  };

  /**
   * Remove all time engines from the transport
   */
  proto$0.clear = function() {
    var time = this.currentTime;
    var position = this.currentPosition;

    this.syncSpeed(time, position, 0);

    // CLEAR

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
    this.__engines = [];

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
  }DPS$0(Scheduler.prototype,{currentTime: {"get": $currentTime_get$0, "configurable":true,"enumerable":true}});DP$0(Scheduler,"prototype",{"configurable":false,"enumerable":false,"writable":false});

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
  function $currentTime_get$0() {
    return this.__currentTime || audioContext.currentTime + this.lookahead;
  }

  /**
   * Add a callback to the scheduler
   * @param {Function} callback function(time, audioTime) to be called
   * @param {Number} delay of first callback (default is 0)
   * @param {Number} period callback period (default is 0 for one-shot)
   * @return {Object} scheduled object that can be used to call remove and reset
   */
  proto$0.callback = function(callbackFunction) {var delay = arguments[1];if(delay === void 0)delay = 0;var period = arguments[2];if(period === void 0)period = 0;
    var engine = {
      period: period || Infinity,
      advanceTime: function(time) {
        callbackFunction(time);
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
        this.__engines.push(engine);

        TimeEngine.setScheduled(engine, function(time)  {
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

    return engine;
  };

  /**
   * Remove time engine or callback from the scheduler
   * @param {Object} engine time engine or callback to be removed from the scheduler
   */
  proto$0.remove = function(engine) {
    if (arrayRemove(this.__engines, engine)) {
      TimeEngine.resetInterface(engine);

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

module.exports = new Scheduler(); // export scheduler singleton
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
  }

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
  proto$0.resetNextPosition = function() {var position = arguments[0];if(position === void 0)position = null;};

  /**
   * Set engine speed (speed-controlled interface)
   * @param {Number} time current scheduler time (based on audio time)
   * @param {Number} speed current transport speed
   *
   * This function is called by the transport to propagate the transport speed to the engine.
   * The speed can be of any value bewteen -16 and 16.
   * With a speed of 0 the engine is halted.
   */
  // syncSpeed(time, speed) {
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
};

/**
 * Check whether the time engine implements the transported interface
 **/
TimeEngine.implementsTransported = function(engine) {
  return (
    engine.syncPosition && engine.syncPosition instanceof Function &&
    engine.advancePosition && engine.advancePosition instanceof Function
  );
};

/**
 * Check whether the time engine implements the speed-controlled interface
 **/
TimeEngine.implementsSpeedControlled = function(engine) {
  return (engine.syncSpeed && engine.syncSpeed instanceof Function);
};

TimeEngine.setScheduled = function(engine, resetNextTime, getCurrentTime, getCurrentPosition) {
  engine.interface = "scheduled";
  engine.__setGetters(getCurrentTime, getCurrentPosition);
  if (resetNextTime)
    engine.resetNextTime = resetNextTime;
};

TimeEngine.setTransported = function(engine, resetNextPosition, getCurrentTime, getCurrentPosition) {
  engine.interface = "transported";
  engine.__setGetters(getCurrentTime, getCurrentPosition);
  if (resetNextPosition)
    engine.resetNextPosition = resetNextPosition;
};

TimeEngine.setSpeedControlled = function(engine, getCurrentTime, getCurrentPosition) {
  engine.interface = "speed-controlled";
  engine.__setGetters(getCurrentTime, getCurrentPosition);
};

TimeEngine.resetInterface = function(engine) {
  engine.__deleteGetters();
  delete engine.resetNextTime;
  delete engine.resetNextPosition;
  engine.interface = null;
};

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