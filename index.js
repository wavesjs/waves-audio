/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class (time-engine master), provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;

var TimeEngine = require("time-engine");
var PriorityQueue = require("priority-queue");
var scheduler = require("scheduler");

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
    this.__haltPosition = Infinity; // haltPosition === null: engine is active
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
        this.__haltPosition = null; // engine is active
        return this.__endPosition;
      }
    } else {
      if (position >= this.__endPosition) {
        this.stop(time, position);
        this.__haltPosition = this.__startPosition;
        return this.__endPosition;
      } else if (position > this.__startPosition) {
        this.start(time, position, speed);
        this.__haltPosition = null; // engine is active
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
    if(this.__haltPosition === null) // engine is active
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
  proto$0.add = function(engine) {var startPosition = arguments[1];if(startPosition === void 0)startPosition = -Infinity;var endPosition = arguments[2];if(endPosition === void 0)endPosition = Infinity;var offsetPosition = arguments[3];if(offsetPosition === void 0)offsetPosition = startPosition;
    var transported = null;

    if(offsetPosition === -Infinity)
      offsetPosition = 0;

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