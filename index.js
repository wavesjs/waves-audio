/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio transport class, provides synchronized scheduling of time engines
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr *
 */
'use strict';var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};

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

var Transport = (function(super$0){var SP$0 = Object.setPrototypeOf||function(o,p){o["__proto__"]=p;return o};var OC$0 = Object.create;if(!PRS$0)MIXIN$0(Transport, super$0);var proto$0={};var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;var f;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){if(S_MARK$0)S_MARK$0(void 0);return f.call(v);}if(S_MARK$0)S_MARK$0(void 0);if((v+'')==='[object Generator]')return v;}throw new Error(v+' is not iterable')};
  function Transport() {
    super$0.call(this);

    this.__queue = new PriorityQueue();
    this.__transportedEngines = [];
    this.__speedControlledEngines = [];
    this.__scheduledEngines = [];

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__nextTime = Infinity;
    this.__nextPosition = Infinity;

    this.__playingSpeed = 1;
  }if(super$0!==null)SP$0(Transport,super$0);Transport.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Transport,"configurable":true,"writable":true}, numEngines: {"get": numEngines$get$0, "configurable":true,"enumerable":true}, currentTime: {"get": currentTime$get$0, "configurable":true,"enumerable":true}, currentPosition: {"get": currentPosition$get$0, "configurable":true,"enumerable":true}, speed: {"get": speed$get$0, "set": speed$set$0, "configurable":true,"enumerable":true}});DP$0(Transport,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  proto$0.__sync = function(time) {
    var now = time || this.currentTime;
    this.__position += (now - this.__time) * this.__speed;
    this.__time = now;
    return now;
  };

  proto$0.__resyncTransportedEngines = function() {
    var numTransportedEngines = this.__transportedEngines.length;
    var nextPosition = Infinity;

    if (numTransportedEngines > 0) {
      var time = this.__time;
      var position = this.__position;
      var speed = this.__speed;
      var engine, nextEnginePosition;

      this.__queue.clear();
      this.__queue.reverse = (speed < 0);

      for (var i = numTransportedEngines - 1; i > 0; i--) {
        engine = this.__transportedEngines[i];
        nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
        this.__queue.insert(engine, nextEnginePosition, false); // insert but don't sort
      }

      engine = this.__transportedEngines[0];
      nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, position - engine.transportStartPosition, speed);
      nextPosition = this.__queue.insert(engine, nextEnginePosition, true); // insert and sort
    }

    return nextPosition;
  };

  proto$0.__rescheduleAccordingToPosition = function(nextPosition) {
    var nextTime = this.getTimeAtPosition(nextPosition);

    if (nextTime !== this.__nextTime) {
      if (nextTime === Infinity)
        scheduler.remove(this);
      else if (!this.master)
        scheduler.add(this, nextTime - scheduler.currentTime, "its me!");
      else
        this.resetEngineTime(nextTime);

      this.__nextTime = nextTime
    }

    this.__nextPosition = nextPosition;
  };

  function numEngines$get$0() {
    return this.__transportedEngines.length + this.__speedControlledEngines.length + this.__scheduledEngines.length;
  }

  // TimeEngine method scheduled interface)
  proto$0.advanceTime = function(time) {
    this.__sync(time);

    var nextEngine = this.__queue.head;
    var nextEnginePosition = nextEngine.transportStartPosition + nextEngine.advancePosition(time, this.__position - nextEngine.transportStartPosition, this.__speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);
    var nextTime = this.getTimeAtPosition(nextPosition);
    this.__nextTime = nextTime

    return nextTime;
  };

  // TimeEngine method (transported interface)
  proto$0.syncPosition = function(time, position, speed) {var $D$0;var $D$1;var $D$2;var $D$3;
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    $D$3 = (this.__speedControlledEngines);$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for (var speedControlledEngine ;$D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"];){speedControlledEngine = ($D$2 ? $D$3[$D$0++] : $D$1["value"]);
      speedControlledEngine.syncSpeed(time, position, 0);
      speedControlledEngine.syncSpeed(time, position, speed);
    };$D$0 = $D$1 = $D$2 = $D$3 = void 0;

    var nextPosition = this.__resetAllEngines(time, position);
    this.__nextPosition = nextPosition;

    return nextPosition;
  };

  // TimeEngine method (transported interface)
  proto$0.advancePosition = function(time, position, speed) {
    this.__time = time;
    this.__position = position;
    this.__speed = speed;

    var nextEngine = this.__queue.head;
    var nextEnginePosition = nextEngine.advancePosition(position, time, speed);
    var nextPosition = this.__queue.move(nextEngine, nextEnginePosition);

    this.__nextPosition = nextPosition;

    return nextPosition;
  };

  // TimeEngine method (speed-controlled interface)
  proto$0.syncSpeed = function(time, position, speed) {var $D$4;var $D$5;var $D$6;var $D$7;
    if (this.interface !== "transported") {
      var lastSpeed = this.__speed;

      if (speed !== lastSpeed) {
        this.__speed = speed;

        var nextPosition = this.__nextPosition;
        var scheduledEngine;

        if (lastSpeed === 0) {
          // reset all engines when start or reverse direction
          nextPosition = this.__resyncTransportedEngines();

          // start scheduled engines
          $D$7 = (this.__scheduledEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (scheduledEngine ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{scheduledEngine = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);scheduledEngine.resetEngineTime(0);};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
        } else if (speed === 0) {
          nextPosition = Infinity;

          // stop scheduled engines
          $D$7 = (this.__scheduledEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (scheduledEngine ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{scheduledEngine = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);scheduledEngine.resetEngineTime(Infinity);};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
        } else if (speed * lastSpeed < 0) {
          nextPosition = this.__resyncTransportedEngines();
        }

        this.__rescheduleAccordingToPosition(nextPosition);

        $D$7 = (this.__speedControlledEngines);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for (var speedControlledEngine ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];)
{speedControlledEngine = ($D$6 ? $D$7[$D$4++] : $D$5["value"]);speedControlledEngine.syncSpeed(time, position, speed);};$D$4 = $D$5 = $D$6 = $D$7 = void 0;
      }
    } else {
      throw new Error("no scheduler");
    }
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
   * Get current master time
   * @return {Number} current transport position
   */
  function currentTime$get$0() {
    return scheduler.currentTime;
  }

  /**
   * Get current master position
   * @return {Number} current transport position
   */
  function currentPosition$get$0() {
    return this.getPositionAtTime(this.currentTime);
  }

  /**
   * Start playing (high level player API)
   */
  proto$0.start = function() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, this.__playingSpeed);
  };

  /**
   * Pause playing (high level player API)
   */
  proto$0.pause = function() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
  };

  /**
   * Stop playing (high level player API)
   */
  proto$0.stop = function() {
    var time = this.__sync();
    this.syncSpeed(time, this.__position, 0);
    this.seek(0);
  };

  /**
   * Set playing speed (high level player API)
   * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
   */
  function speed$set$0(speed) {
    var time = this.__sync();

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
      this.syncSpeed(time, this.__position, speed);
  }

  /**
   * Get playing speed (high level player API)
   * @return current playing speed
   */
  function speed$get$0() {
    return this.__playingSpeed;
  }

  /**
   * Set (jump to) transport position
   * @param {Number} position target position
   */
  proto$0.seek = function(position) {var $D$8;var $D$9;var $D$10;var $D$11;
    if (position !== this.__position) {
      var time = this.__sync();
      var speed = this.__speed;

      if (speed !== 0) {
        var nextPosition = this.__resyncTransportedEngines();
        this.__rescheduleAccordingToPosition(nextPosition);

        $D$11 = (this.__speedControlledEngines);$D$8 = GET_ITER$0($D$11);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? $D$11.length : void 0);for (var speedControlledEngine ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];){speedControlledEngine = ($D$10 ? $D$11[$D$8++] : $D$9["value"]);
          speedControlledEngine.syncSpeed(time, this.__position, 0);
          speedControlledEngine.syncSpeed(time, position, speed);
        };$D$8 = $D$9 = $D$10 = $D$11 = void 0;
      }

      this.__position = position;
    }
  };

  /**
   * Add a time engine to the transport
   * @param {Object} engine engine to be added to the transport
   * @param {Number} position start position
   */
  proto$0.add = function(engine) {var startPosition = arguments[1];if(startPosition === void 0)startPosition = 0;var this$0 = this;
    if (!engine.master) {
      var time = this.__sync();
      var speed = this.__speed;

      var getCurrentTime = function()  {
        return this$0.currentTime;
      };

      var getCurrentPosition = function()  {
        return this$0.currentPosition - startPosition;
      };

      if (engine.implementsTransported) {
        // add time engine with transported interface
        this.__transportedEngines.push(engine);

        engine.setTransported(this, startPosition, function()  {
          // resyncEnginePosition
          var time = this$0.__sync();
          var speed = this$0.__speed;
          if (speed !== 0) {
            var nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, this$0.__position - engine.transportStartPosition, speed);
            var nextPosition = this$0.__queue.move(engine, nextEnginePosition);
            this$0.__rescheduleAccordingToPosition(nextPosition);
          }
        }, getCurrentTime, getCurrentPosition);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = engine.transportStartPosition + engine.syncPosition(time, this.__position - engine.transportStartPosition, speed);
          var nextPosition = this.__queue.insert(engine, nextEnginePosition);
          this.__rescheduleAccordingToPosition(nextPosition);
        }
      } else if (engine.implementsSpeedControlled) {
        // add time engine with speed-controlled interface
        this.__speedControlledEngines.push(engine);

        engine.setSpeedControlled(this, getCurrentTime, getCurrentPosition);
        engine.syncSpeed(time, this.__position, speed);
      } else if (engine.implementsScheduled) {
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
    var time = this.__sync();
    
    if (engine.implementsTransported && arrayRemove(this.__transportedEngines, engine)) {
      // remove engine with transported interface
      var nextPosition = this.__queue.remove(engine);

      if (this.__speed !== 0)
        this.__rescheduleAccordingToPosition(nextPosition);

      engine.resetTransported();
    } else if (engine.implementsSpeedControlled && arrayRemove(this.__speedControlledEngines, engine)) {
      // remove engine with speed-controlled interface
      engine.syncSpeed(time, this.__position, 0);

      engine.resetSpeedControlled();
    } else if (engine.implementsScheduled && arrayRemove(this.__scheduledEngines, engine)) {
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
  proto$0.clear = function() {var $D$12;var $D$13;var $D$14;var $D$15;
    var time = this.__sync();

    if (this.interface === "scheduled" || this.interface === "speed-controlled")
      {this.syncSpeed(time, this.__position, 0);}

    $D$15 = (this.__transportedEngines);$D$12 = GET_ITER$0($D$15);$D$14 = $D$12 === 0;$D$13 = ($D$14 ? $D$15.length : void 0);for (var transportedEngine ;$D$14 ? ($D$12 < $D$13) : !($D$13 = $D$12["next"]())["done"];)
{transportedEngine = ($D$14 ? $D$15[$D$12++] : $D$13["value"]);transportedEngine.resetTransported();};$D$12 = $D$13 = $D$14 = $D$15 = void 0;

    $D$15 = (this.__speedControlledEngines);$D$12 = GET_ITER$0($D$15);$D$14 = $D$12 === 0;$D$13 = ($D$14 ? $D$15.length : void 0);for (var speedControlledEngine ;$D$14 ? ($D$12 < $D$13) : !($D$13 = $D$12["next"]())["done"];)
{speedControlledEngine = ($D$14 ? $D$15[$D$12++] : $D$13["value"]);speedControlledEngine.resetSpeedControlled();};$D$12 = $D$13 = $D$14 = $D$15 = void 0;

    $D$15 = (this.__scheduledEngines);$D$12 = GET_ITER$0($D$15);$D$14 = $D$12 === 0;$D$13 = ($D$14 ? $D$15.length : void 0);for (var scheduledEngine ;$D$14 ? ($D$12 < $D$13) : !($D$13 = $D$12["next"]())["done"];)
{scheduledEngine = ($D$14 ? $D$15[$D$12++] : $D$13["value"]);scheduledEngine.resetScheduled();};$D$12 = $D$13 = $D$14 = $D$15 = void 0;

    this.__transportedEngines.length = 0;
    this.__speedControlledEngines.length = 0;
    this.__scheduledEngines.length = 0;

    if (this.interface === "transported")
      this.resyncEnginePosition();
  };

  proto$0.setScheduled = function(scheduler, resetEngineTime, getCurrentTime, getCurrentPosition) {
    // make sure that the transport added itself to the scheduler
    if (getCurrentPosition === "its me!")
      super$0.prototype.setScheduled.call(this, scheduler, resetEngineTime, getCurrentTime, null);
    else
      throw new Error("Transport cannot be added to scheduler");
  };
MIXIN$0(Transport.prototype,proto$0);proto$0=void 0;return Transport;})(TimeEngine);

module.exports = Transport;