/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio time engine sequence used by scheduler and transports
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
'use strict';

class TimeEngineQueue {

  constructor() {
    this.__engines = [];
    this.reverse = false;
  }

  /* Get the index of an engine in the engine list */
  __engineIndex(engine) {
    for (var i = 0; i < this.__engines.length; i++) {
      if (engine === this.__engines[i][0]) {
        return i;
      }
    }

    return -1;
  }

  /* Withdraw an engine from the engine list */
  __removeEngine(engine) {
    var index = this.__engineIndex(engine);

    if (index >= 0)
      this.__engines.splice(index, 1);

    if (this.__engines.length > 0)
      return this.__engines[0][1]; // return time of first engine

    return Infinity;
  }

  __syncEngine(engine, time) {
    var nextEngineDelay = Math.max(engine.syncNext(time), 0);
    var nextEngineTime = Infinity;

    if (nextEngineDelay !== Infinity) {
      if (!this.reverse)
        nextEngineTime = time + nextEngineDelay;
      else
        nextEngineTime = time - nextEngineDelay;
    }

    return nextEngineTime;
  }

  __sortEngines() {
    if (!this.reverse)
      this.__engines.sort(function(a, b) {
        return a[1] - b[1];
      });
    else
      this.__engines.sort(function(a, b) {
        return b[1] - a[1];
      });
  }

  /**
   * Insert an engine to the sequence
   */
  insert(engine, time, sync = true) {
    var nextEngineTime = time;

    if (sync)
      nextEngineTime = this.__syncEngine(engine, time);

    if (nextEngineTime !== Infinity) {
      // add new engine
      this.__engines.push([engine, nextEngineTime]);
      this.__sortEngines();
      return this.__engines[0][1]; // return time of first engine
    }

    return this.__removeEngine(engine);
  }

  /**
   * Insert an array of engines to the sequence
   */
  insertAll(arrayOfObjects, time, sync = true) {
    var nextEngineTime = time;

    // sync each engine and add to engine list (if time is not Infinity)
    for (var i = 0; i < arrayOfObjects.length; i++) {
      var engine = arrayOfObjects[i];

      if (sync)
        nextEngineTime = this.__syncEngine(engine, time);

      // add engine to sequence of scheduled engines
      if (nextEngineTime !== Infinity)
        this.__engines.push([engine, nextEngineTime]);
    }

    // sort sequence of scheduled engines
    this.__sortEngines();

    if (this.__engines.length > 0)
      return this.__engines[0][1]; // return time of first engine

    return Infinity;
  }

  /**
   * Move an engine to another time in the sequence
   */
  move(engine, time, sync = true) {
    var nextEngineTime = time;

    if (sync)
      nextEngineTime = this.__syncEngine(engine, time);

    if (nextEngineTime !== Infinity) {
      var index = this.__engineIndex(engine);

      if (index < 0) {
        // add new engine
        this.__engines.push([engine, nextEngineTime]);
        this.__sortEngines();
      } else {
        // update time of existing engine
        this.__engines[index][1] = nextEngineTime;

        // move first engine if it is not first anymore
        if (index === 0 && this.__engines.length > 1) {
          var secondEngineTime = this.__engines[1][1];

          if ((!this.reverse && nextEngineTime > secondEngineTime) || (this.reverse && nextEngineTime <= secondEngineTime))
            this.__sortEngines();
        }
      }

      return this.__engines[0][1]; // return time of first engine
    }

    return this.__removeEngine(engine);
  }

  /**
   * Remove an engine from the sequence
   */
  remove(engine) {
    return this.__removeEngine(engine);
  }

  /**
   * Clear sequence
   */
  clear() {
    this.__engines.length = 0; // clear engine list
    return Infinity;
  }

  /**
   * Execute next engine and return time of next engine
   */
  execute(time, audioTime) {
    // get first engine in sequence
    var engine = this.__engines[0][0];
    var nextEngineDelay = Math.max(engine.executeNext(time, audioTime), 0);

    if (nextEngineDelay !== Infinity) {
      var nextEngineTime;

      if (!this.reverse)
        nextEngineTime = time + nextEngineDelay;
      else
        nextEngineTime = time - nextEngineDelay;

      this.__engines[0][1] = nextEngineTime;

      // move first engine if it is not first anymore
      if (this.__engines.length > 1) {
        var secondTime = this.__engines[1][1];

        if ((!this.reverse && nextEngineTime > secondTime) || (this.reverse && nextEngineTime <= secondTime))
          this.__sortEngines();
      }

      return this.__engines[0][1]; // return time of first engine
    }

    return this.__removeEngine(engine);
  }
}

module.exports = TimeEngineQueue;