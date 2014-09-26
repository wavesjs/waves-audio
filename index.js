/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};var SP$0 = Object.setPrototypeOf||function(o,p){o["__proto__"]=p;return o};var OC$0 = Object.create;

var TimeEngine = require("../time-engine");
var PriorityQueue = require("../priority-queue");
var scheduler = require("../scheduler");

function arrayRemove(array, value) {
  var index = array.indexOf(value);

  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

// ScheduledAdapter has to switch on and off a scheduled engine 
// when the transport hits the engine's start and end position
var ScheduledAdapter = (function(){
  function ScheduledAdapter(engine) {
    this.engine = engine;
  }DP$0(ScheduledAdapter,"prototype",{"configurable":false,"enumerable":false,"writable":false});
;return ScheduledAdapter;})();

// ScheduledAdapter has to start and stop a speed-controlled engine 
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
   * @return {Number} current transport position
   *
   * This function will be replaced when the transport is added to a master (i.e. transport or player).
   */
  function currentPosition$get$0() {
    return this.__position + (scheduler.currentTime - this.__time) * this.__speed;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
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
    if (!engine.master) {
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

        engine.setTransported(this, startPosition, function()  {var nextEnginePosition = arguments[0];if(nextEnginePosition === void 0)nextEnginePosition = null;
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

        engine.setSpeedControlled(this, getCurrentTime, getCurrentPosition);

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

      engine.resetTransported();
    } else if (TimeEngine.implementsSpeedControlled(engine) && arrayRemove(this.__speedControlledEngines, engine)) {
      // remove engine with speed-controlled interface
      engine.syncSpeed(time, position, 0);

      engine.resetSpeedControlled();
    } else if (TimeEngine.implementsScheduled(engine) && arrayRemove(this.__scheduledEngines, engine)) {
      // remove engine with scheduled interface
      scheduler.remove(engine);

      engine.resetScheduled();
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
{transportedEngine = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);transportedEngine.resetTransported();};$D$8 = $D$9 = $D$10 = $D$11 = void 0;

    $D$11 = (this.__speedControlledEngines);$D$8 = GET_ITER$0($D$11);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? $D$11.length : void 0);for (var speedControlledEngine ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];)
{speedControlledEngine = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);speedControlledEngine.resetSpeedControlled();};$D$8 = $D$9 = $D$10 = $D$11 = void 0;

    $D$11 = (this.__scheduledEngines);$D$8 = GET_ITER$0($D$11);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? $D$11.length : void 0);for (var scheduledEngine ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];)
{scheduledEngine = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);scheduledEngine.resetScheduled();};$D$8 = $D$9 = $D$10 = $D$11 = void 0;

    this.__transportedEngines.length = 0;
    this.__speedControlledEngines.length = 0;
    this.__scheduledEngines.length = 0;

    this.resetNextPosition(Infinity);
  };

MIXIN$0(Transport.prototype,proto$0);proto$0=void 0;return Transport;})(TimeEngine);

module.exports = Transport;