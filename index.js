/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized time-based and position-based scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr *
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};

var TimeEngine = require("../time-engine");
var PriorityQueue = require("../priority-queue");

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