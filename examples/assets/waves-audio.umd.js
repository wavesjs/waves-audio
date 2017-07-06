(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var AudioContext = window.AudioContext || window.webkitAudioContext;

/**
 * Expose a unique audio context singleton as the default audio
 * context used by the components of the Waves Audio library and
 * applications using the library.
 *
 * @type AudioContext
 * @name audioContext
 * @constant
 * @global
 * @instance
 *
 * @example
 * import * as audio from 'waves-audio';
 * const audioContext = audio.audioContext;
 */
var audioContext = null;

if (AudioContext) {
  audioContext = new AudioContext();

  if (/(iPhone|iPad)/i.test(navigator.userAgent) && audioContext.sampleRate < 44100) {
    var buffer = audioContext.createBuffer(1, 1, 44100);
    var dummy = audioContext.createBufferSource();
    dummy.buffer = buffer;
    dummy.connect(audioContext.destination);
    dummy.start(0);
    dummy.disconnect();
  }
}

exports.default = audioContext;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _timeEngine = require('./time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _audioContext = require('./audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is the base class for all audio related time engine components. It is
 * used to handle audio related events such as the playback of a media stream.
 * It extends the TimeEngine class by the standard web audio node methods
 * connect and disconnect.
 *
 * [example]{@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/audio-time-engine.html}
 *
 * @extends TimeEngine
 * @example
 * import audio from 'waves-audio';
 *
 * class MyEngine extends audio.AudioTimeEngine {
 *   constructor() {
 *     super();
 *     // ...
 *   }
 * }
 */
var AudioTimeEngine = function (_TimeEngine) {
  (0, _inherits3.default)(AudioTimeEngine, _TimeEngine);

  function AudioTimeEngine() {
    var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;
    (0, _classCallCheck3.default)(this, AudioTimeEngine);

    /**
     * Audio context used by the TimeEngine, default to the global audioContext
     *
     * @name audioContext
     * @type AudioContext
     * @memberof AudioTimeEngine
     * @see audioContext
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (AudioTimeEngine.__proto__ || (0, _getPrototypeOf2.default)(AudioTimeEngine)).call(this));

    _this.audioContext = audioContext;

    /**
     * Output audio node. By default the connect method connects a given node
     * to this output node.
     *
     * @name outputNode
     * @type AudioNode
     * @memberof AudioTimeEngine
     * @default null
     */
    _this.outputNode = null;
    return _this;
  }

  /**
   * Connect to an audio node (e.g. audioContext.destination)
   *
   * @param {AudioNode} target - Target audio node
   */


  (0, _createClass3.default)(AudioTimeEngine, [{
    key: 'connect',
    value: function connect(target) {
      this.outputNode.connect(target);
      return this;
    }

    /**
     * Disconnect from an audio node (e.g. audioContext.destination). If undefined
     * disconnect from all target nodes.
     *
     * @param {AudioNode} target - Target audio node.
     */

  }, {
    key: 'disconnect',
    value: function disconnect(connection) {
      this.outputNode.disconnect(connection);
      return this;
    }
  }]);
  return AudioTimeEngine;
}(_timeEngine2.default);

exports.default = AudioTimeEngine;

},{"./audio-context":1,"./time-engine":5,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// works by reference
function swap(arr, i1, i2) {
  var tmp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = tmp;
}

// https://jsperf.com/js-for-loop-vs-array-indexof/346
function indexOf(arr, el) {
  var l = arr.length;
  // ignore first element as it can't be a entry
  for (var i = 1; i < l; i++) {
    if (arr[i] === el) {
      return i;
    }
  }

  return -1;
}

/**
 * Define if `time1` should be lower in the topography than `time2`.
 * Is dynamically affected to the priority queue according to handle `min` and `max` heap.
 *
 * @private
 * @param {Number} time1
 * @param {Number} time2
 * @return {Boolean}
 */
var _isLowerMaxHeap = function _isLowerMaxHeap(time1, time2) {
  return time1 < time2;
};

var _isLowerMinHeap = function _isLowerMinHeap(time1, time2) {
  return time1 > time2;
};

/**
 * Define if `time1` should be higher in the topography than `time2`.
 * Is dynamically affected to the priority queue according to handle `min` and `max` heap.
 *
 * @private
 * @param {Number} time1
 * @param {Number} time2
 * @return {Boolean}
 */
var _isHigherMaxHeap = function _isHigherMaxHeap(time1, time2) {
  return time1 > time2;
};

var _isHigherMinHeap = function _isHigherMinHeap(time1, time2) {
  return time1 < time2;
};

var POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

/**
 * Priority queue implementing a binary heap.
 * Acts as a min heap by default, can be dynamically changed to a max heap
 * by setting `reverse` to true.
 *
 * _note_: the queue creates and maintains a new property (i.e. `queueTime`)
 * to each object added.
 *
 * @param {Number} [heapLength=100] - Default size of the array used to create the heap.
 */

var PriorityQueue = function () {
  function PriorityQueue() {
    var heapLength = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
    (0, _classCallCheck3.default)(this, PriorityQueue);

    /**
     * Pointer to the first empty index of the heap.
     * @type {Number}
     * @memberof PriorityQueue
     * @name _currentLength
     * @private
     */
    this._currentLength = 1;

    /**
     * Array of the sorted indexes of the entries, the actual heap. Ignore the index 0.
     * @type {Array}
     * @memberof PriorityQueue
     * @name _heap
     * @private
     */
    this._heap = new Array(heapLength + 1);

    /**
     * Type of the queue: `min` heap if `false`, `max` heap if `true`
     * @type {Boolean}
     * @memberof PriorityQueue
     * @name _reverse
     * @private
     */
    this._reverse = null;

    // initialize compare functions
    this.reverse = false;
  }

  /**
   * Time of the first element in the binary heap.
   * @returns {Number}
   */


  (0, _createClass3.default)(PriorityQueue, [{
    key: "_bubbleUp",


    /**
     * Fix the heap by moving an entry to a new upper position.
     *
     * @private
     * @param {Number} startIndex - The index of the entry to move.
     */
    value: function _bubbleUp(startIndex) {
      var entry = this._heap[startIndex];

      var index = startIndex;
      var parentIndex = Math.floor(index / 2);
      var parent = this._heap[parentIndex];

      while (parent && this._isHigher(entry.queueTime, parent.queueTime)) {
        swap(this._heap, index, parentIndex);

        index = parentIndex;
        parentIndex = Math.floor(index / 2);
        parent = this._heap[parentIndex];
      }
    }

    /**
     * Fix the heap by moving an entry to a new lower position.
     *
     * @private
     * @param {Number} startIndex - The index of the entry to move.
     */

  }, {
    key: "_bubbleDown",
    value: function _bubbleDown(startIndex) {
      var entry = this._heap[startIndex];

      var index = startIndex;
      var c1index = index * 2;
      var c2index = c1index + 1;
      var child1 = this._heap[c1index];
      var child2 = this._heap[c2index];

      while (child1 && this._isLower(entry.queueTime, child1.queueTime) || child2 && this._isLower(entry.queueTime, child2.queueTime)) {
        // swap with the minimum child
        var targetIndex = void 0;

        if (child2) targetIndex = this._isHigher(child1.queueTime, child2.queueTime) ? c1index : c2index;else targetIndex = c1index;

        swap(this._heap, index, targetIndex);

        // update to find next children
        index = targetIndex;
        c1index = index * 2;
        c2index = c1index + 1;
        child1 = this._heap[c1index];
        child2 = this._heap[c2index];
      }
    }

    /**
     * Build the heap (from bottom up).
     */

  }, {
    key: "buildHeap",
    value: function buildHeap() {
      // find the index of the last internal node
      // @todo - make sure that's the right way to do.
      var maxIndex = Math.floor((this._currentLength - 1) / 2);

      for (var i = maxIndex; i > 0; i--) {
        this._bubbleDown(i);
      }
    }

    /**
     * Insert a new object in the binary heap and sort it.
     *
     * @param {Object} entry - Entry to insert.
     * @param {Number} time - Time at which the entry should be orderer.
     * @returns {Number} - Time of the first entry in the heap.
     */

  }, {
    key: "insert",
    value: function insert(entry, time) {
      if (Math.abs(time) !== POSITIVE_INFINITY) {
        entry.queueTime = time;
        // add the new entry at the end of the heap
        this._heap[this._currentLength] = entry;
        // bubble it up
        this._bubbleUp(this._currentLength);
        this._currentLength += 1;

        return this.time;
      }

      entry.queueTime = undefined;
      return this.remove(entry);
    }

    /**
     * Move a given entry to a new position.
     *
     * @param {Object} entry - Entry to move.
     * @param {Number} time - Time at which the entry should be orderer.
     * @return {Number} - Time of first entry in the heap.
     */

  }, {
    key: "move",
    value: function move(entry, time) {
      if (Math.abs(time) !== POSITIVE_INFINITY) {
        var index = indexOf(this._heap, entry);

        if (index !== -1) {
          entry.queueTime = time;
          // define if the entry should be bubbled up or down
          var parent = this._heap[Math.floor(index / 2)];

          if (parent && this._isHigher(time, parent.queueTime)) this._bubbleUp(index);else this._bubbleDown(index);
        }

        return this.time;
      }

      entry.queueTime = undefined;
      return this.remove(entry);
    }

    /**
     * Remove an entry from the heap and fix the heap.
     *
     * @param {Object} entry - Entry to remove.
     * @return {Number} - Time of first entry in the heap.
     */

  }, {
    key: "remove",
    value: function remove(entry) {
      // find the index of the entry
      var index = indexOf(this._heap, entry);

      if (index !== -1) {
        var lastIndex = this._currentLength - 1;

        // if the entry is the last one
        if (index === lastIndex) {
          // remove the element from heap
          this._heap[lastIndex] = undefined;
          // update current length
          this._currentLength = lastIndex;

          return this.time;
        } else {
          // swap with the last element of the heap
          swap(this._heap, index, lastIndex);
          // remove the element from heap
          this._heap[lastIndex] = undefined;

          if (index === 1) {
            this._bubbleDown(1);
          } else {
            // bubble the (ex last) element up or down according to its new context
            var _entry = this._heap[index];
            var parent = this._heap[Math.floor(index / 2)];

            if (parent && this._isHigher(_entry.queueTime, parent.queueTime)) this._bubbleUp(index);else this._bubbleDown(index);
          }
        }

        // update current length
        this._currentLength = lastIndex;
      }

      return this.time;
    }

    /**
     * Clear the queue.
     */

  }, {
    key: "clear",
    value: function clear() {
      this._currentLength = 1;
      this._heap = new Array(this._heap.length);
    }

    /**
     * Defines if the queue contains the given `entry`.
     *
     * @param {Object} entry - Entry to be checked
     * @return {Boolean}
     */

  }, {
    key: "has",
    value: function has(entry) {
      return this._heap.indexOf(entry) !== -1;
    }
  }, {
    key: "time",
    get: function get() {
      if (this._currentLength > 1) return this._heap[1].queueTime;

      return Infinity;
    }

    /**
     * First element in the binary heap.
     * @returns {Number}
     * @readonly
     */

  }, {
    key: "head",
    get: function get() {
      return this._heap[1];
    }

    /**
     * Change the order of the queue (max heap if true, min heap if false),
     * rebuild the heap with the existing entries.
     *
     * @type {Boolean}
     */

  }, {
    key: "reverse",
    set: function set(value) {
      if (value !== this._reverse) {
        this._reverse = value;

        if (this._reverse === true) {
          this._isLower = _isLowerMaxHeap;
          this._isHigher = _isHigherMaxHeap;
        } else {
          this._isLower = _isLowerMinHeap;
          this._isHigher = _isHigherMinHeap;
        }

        this.buildHeap();
      }
    },
    get: function get() {
      return this._reverse;
    }
  }]);
  return PriorityQueue;
}();

exports.default = PriorityQueue;

},{"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _priorityQueue = require('./priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _timeEngine = require('./time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class SchedulingQueue
 * @extends TimeEngine
 */
/**
 * SchedulingQueue base class
 * http://wavesjs.github.io/audio/#audio-scheduling-queue
 *
 * Norbert.Schnell@ircam.fr
 * Copyright 2014, 2015 IRCAM – Centre Pompidou
 */

var SchedulingQueue = function (_TimeEngine) {
  (0, _inherits3.default)(SchedulingQueue, _TimeEngine);

  function SchedulingQueue() {
    (0, _classCallCheck3.default)(this, SchedulingQueue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(SchedulingQueue)).call(this));

    _this.__queue = new _priorityQueue2.default();
    _this.__engines = new _set2.default();
    return _this;
  }

  // TimeEngine 'scheduled' interface


  (0, _createClass3.default)(SchedulingQueue, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var engine = this.__queue.head;
      var nextEngineTime = engine.advanceTime(time);

      if (!nextEngineTime) {
        engine.master = null;
        this.__engines.delete(engine);
        this.__queue.remove(engine);
      } else {
        this.__queue.move(engine, nextEngineTime);
      }

      return this.__queue.time;
    }

    // TimeEngine master method to be implemented by derived class

  }, {
    key: 'defer',


    // call a function at a given time
    value: function defer(fun) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime(time) {
          fun(time);
        } // make sur that the advanceTime method does not returm anything
      }, time);
    }

    // add a time engine to the scheduler

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!_timeEngine2.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      engine.master = this;

      // add to engines and queue
      this.__engines.add(engine);
      var nextTime = this.__queue.insert(engine, time);

      // reschedule queue
      this.resetTime(nextTime);
    }

    // remove a time engine from the queue

  }, {
    key: 'remove',
    value: function remove(engine) {
      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      engine.master = null;

      // remove from array and queue
      this.__engines.delete(engine);
      var nextTime = this.__queue.remove(engine);

      // reschedule queue
      this.resetTime(nextTime);
    }

    // reset next engine time

  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      var nextTime = void 0;

      if (this.__queue.has(engine)) nextTime = this.__queue.move(engine, time);else nextTime = this.__queue.insert(engine, time);

      this.resetTime(nextTime);
    }

    // check whether a given engine is scheduled

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }

    // clear queue

  }, {
    key: 'clear',
    value: function clear() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.__engines), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var engine = _step.value;

          engine.master = null;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.__queue.clear();
      this.__engines.clear();
      this.resetTime(Infinity);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return 0;
    }
  }]);
  return SchedulingQueue;
}(_timeEngine2.default);

exports.default = SchedulingQueue;

},{"./priority-queue":3,"./time-engine":5,"babel-runtime/core-js/get-iterator":16,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/core-js/set":22,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base class for time engines
 *
 * A time engine generates more or less regular events and/or plays back a
 * media stream. It implements one or multiple interfaces to be driven by a
 * master (i.e. a Scheduler, a Transport or a PlayControl) in synchronization
 * with other engines. The provided interfaces are scheduled, transported,
 * and play-controlled.
 *
 *
 * #### The `scheduled` interface
 *
 * The scheduled interface allows for synchronizing an engine to a monotonous time
 * as it is provided by the Scheduler master.
 *
 * ###### `advanceTime(time :Number) -> {Number}`
 *
 * The `advanceTime` method has to be implemented by an `TimeEngine` as part of the
 * scheduled interface. The method is called by the master (e.g. the scheduler).
 * It generates an event and to returns the time of the next event (i.e. the next
 * call of advanceTime). The returned time has to be greater than the time
 * received as argument of the method. In case that a TimeEngine has to generate
 * multiple events at the same time, the engine has to implement its own loop
 * while(event.time <= time) and return the time of the next event (if any).
 *
 * ###### `resetTime(time=undefined :Number)`
 *
 * The `resetTime` method is provided by the `TimeEngine` base class. An engine may
 * call this method to reset its next event time (e.g. when a parameter is
 * changed that influences the engine's temporal behavior). When no argument
 * is given, the time is reset to the current master time. When calling the
 * method with Infinity the engine is suspended without being removed from the
 * master.
 *
 *
 * #### The `transported` interface
 *
 * The transported interface allows for synchronizing an engine to a position
 * (i.e. media playback time) that can run forward and backward and jump as it
 * is provided by the Transport master.
 *
 * ###### `syncPosition(time :Number, position :Number, speed :Number) -> {Number}`
 *
 * The `syncPositon` method has to be implemented by a `TimeEngine` as part of the
 * transported interface. The method syncPositon is called whenever the master
 * of a transported engine has to (re-)synchronize the engine's position. This
 * is for example required when the master (re-)starts playback, jumps to an
 * arbitrary position, and when reversing playback direction. The method returns
 * the next position of the engine in the given playback direction
 * (i.e. `speed < 0` or `speed > 0`).
 *
 * ###### `advancePosition(time :Number, position :Number, speed :Number) -> {Number}`
 *
 * The `advancePosition` method has to be implemented by a `TimeEngine` as part
 * of the transported interface. The master calls the advancePositon method when
 * the engine's event position is reached. The method generates an event and
 * returns the next position in the given playback direction (i.e. speed < 0 or
 * speed > 0). The returned position has to be greater (i.e. when speed > 0)
 * or less (i.e. when speed < 0) than the position received as argument of the
 * method.
 *
 * ###### `resetPosition(position=undefined :Number)`
 *
 * The resetPosition method is provided by the TimeEngine base class. An engine
 * may call this method to reset its next event position. When no argument
 * is given, the time is reset to the current master time. When calling the
 * method with Infinity the engine is suspended without being removed from
 * the master.
 *
 *
 * #### The speed-controlled interface
 *
 * The "speed-controlled" interface allows for syncronizing an engine that is
 * neither driven through the scheduled nor the transported interface. The
 * interface allows in particular to synchronize engines that assure their own
 * scheduling (i.e. audio player or an oscillator) to the event-based scheduled
 * and transported engines.
 *
 * ###### `syncSpeed(time :Number, position :Number, speed :Number, seek=false :Boolean)`
 *
 * The syncSpeed method has to be implemented by a TimeEngine as part of the
 * speed-controlled interface. The method is called by the master whenever the
 * playback speed changes or the position jumps arbitarily (i.e. on a seek).
 *
 *
 * <hr />
 *
 * Example that shows a `TimeEngine` running in a `Scheduler` that counts up
 * at a given frequency:
 * {@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/time-engine.html}
 *
 * @example
 * import * as audio from 'waves-audio';
 *
 * class MyEngine extends audio.TimeEngine {
 *   constructor() {
 *     super();
 *     // ...
 *   }
 * }
 *
 */
var TimeEngine = function () {
  function TimeEngine() {
    (0, _classCallCheck3.default)(this, TimeEngine);

    /**
     * The engine's master.
     *
     * @type {Mixed}
     * @name master
     * @memberof TimeEngine
     */
    this.master = null;
  }

  /**
   * The time engine's current (master) time.
   *
   * @type {Number}
   * @memberof TimeEngine
   * @readonly
   */


  (0, _createClass3.default)(TimeEngine, [{
    key: "resetTime",
    value: function resetTime() {
      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (this.master) this.master.resetEngineTime(this, time);
    }

    /**
     * Transported interface
     *   - syncPosition(time, position, speed), called to reposition TimeEngine, returns next position
     *   - advancePosition(time, position, speed), called to generate next event at given time and position, returns next position
     *
     * @static
     * @memberof TimeEngine
     */

  }, {
    key: "resetPosition",
    value: function resetPosition() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (this.master) this.master.resetEnginePosition(this, position);
    }

    /**
     * Speed-controlled interface
     *   - syncSpeed(time, position, speed, ), called to
     *
     * @static
     * @memberof TimeEngine
     */

  }, {
    key: "currentTime",
    get: function get() {
      if (this.master) return this.master.currentTime;

      return undefined;
    }

    /**
     * The time engine's current (master) position.
     *
     * @type {Number}
     * @memberof TimeEngine
     * @readonly
     */

  }, {
    key: "currentPosition",
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }

    /**
     * Scheduled interface
     *   - advanceTime(time), called to generate next event at given time, returns next time
     *
     * @static
     * @memberof TimeEngine
     */

  }], [{
    key: "implementsScheduled",
    value: function implementsScheduled(engine) {
      return engine.advanceTime && engine.advanceTime instanceof Function;
    }
  }, {
    key: "implementsTransported",
    value: function implementsTransported(engine) {
      return engine.syncPosition && engine.syncPosition instanceof Function && engine.advancePosition && engine.advancePosition instanceof Function;
    }
  }, {
    key: "implementsSpeedControlled",
    value: function implementsSpeedControlled(engine) {
      return engine.syncSpeed && engine.syncSpeed instanceof Function;
    }
  }]);
  return TimeEngine;
}();

exports.default = TimeEngine;

},{"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioTimeEngine = require('../core/audio-time-engine');

var _audioTimeEngine2 = _interopRequireDefault(_audioTimeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

/**
 * Granular synthesis TimeEngine implementing the scheduled interface.
 * The grain position (grain onset or center time in the audio buffer) is
 * optionally determined by the engine's currentPosition attribute.
 *
 * Example that shows a `GranularEngine` (with a few parameter controls) driven
 * by a `Scheduler` and a `PlayControl`:
 * {@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/granular-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const granularEngine = new audio.GranularEngine();
 *
 * scheduler.add(granularEngine);
 *
 *
 * @param {Object} options={} - Parameters
 * @param {AudioBuffer} [options.buffer=null] - Audio buffer
 * @param {Number} [options.periodAbs=0.01] - Absolute grain period in sec
 * @param {Number} [options.periodRel=0] - Grain period relative to absolute
 *  duration
 * @param {Number} [options.periodVar=0] - Amout of random grain period
 *  variation relative to grain period
 * @param {Number} [options.periodMin=0.001] - Minimum grain period
 * @param {Number} [options.position=0] - Grain position (onset time in audio
 *  buffer) in sec
 * @param {Number} [options.positionVar=0.003] - Amout of random grain position
 *  variation in sec
 * @param {Number} [options.durationAbs=0.1] - Absolute grain duration in sec
 * @param {Number} [options.durationRel=0] - Grain duration relative to grain
 *  period (overlap)
 * @param {Number} [options.attackAbs=0] - Absolute attack time in sec
 * @param {Number} [options.attackRel=0.5] - Attack time relative to grain duration
 * @param {String} [options.attackShape='lin'] - Shape of attack
 * @param {Number} [options.releaseAbs=0] - Absolute release time in sec
 * @param {Number} [options.releaseRel=0.5] - Release time relative to grain duration
 * @param {Number} [options.releaseShape='lin'] - Shape of release
 * @param {String} [options.expRampOffset=0.0001] - Offset (start/end value)
 *  for exponential attack/release
 * @param {Number} [options.resampling=0] - Grain resampling in cent
 * @param {Number} [options.resamplingVar=0] - Amout of random resampling variation in cent
 * @param {Number} [options.gain=1] - Linear gain factor
 * @param {Boolean} [options.centered=true] - Whether the grain position refers
 *  to the center of the grain (or the beginning)
 * @param {Boolean} [options.cyclic=false] - Whether the audio buffer and grain
 *  position are considered as cyclic
 * @param {Number} [options.wrapAroundExtension=0] - Portion at the end of the
 *  audio buffer that has been copied from the beginning to assure cyclic behavior
 */

var GranularEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(GranularEngine, _AudioTimeEngine);

  function GranularEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, GranularEngine);

    /**
     * Audio buffer
     *
     * @type {AudioBuffer}
     * @name buffer
     * @default null
     * @memberof GranularEngine
     * @instance
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (GranularEngine.__proto__ || (0, _getPrototypeOf2.default)(GranularEngine)).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute grain period in sec
     *
     * @type {Number}
     * @name periodAbs
     * @default 0.01
     * @memberof GranularEngine
     * @instance
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0.01);

    /**
     * Grain period relative to absolute duration
     *
     * @type {Number}
     * @name periodRel
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.periodRel = optOrDef(options.periodRel, 0);

    /**
     * Amout of random grain period variation relative to grain period
     *
     * @type {Number}
     * @name periodVar
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Minimum grain period
     *
     * @type {Number}
     * @name periodMin
     * @default 0.001
     * @memberof GranularEngine
     * @instance
     */
    _this.periodMin = optOrDef(options.periodMin, 0.001);

    /**
     * Grain position (onset time in audio buffer) in sec
     *
     * @type {Number}
     * @name position
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.position = optOrDef(options.position, 0);

    /**
     * Amout of random grain position variation in sec
     *
     * @type {Number}
     * @name positionVar
     * @default 0.003
     * @memberof GranularEngine
     * @instance
     */
    _this.positionVar = optOrDef(options.positionVar, 0.003);

    /**
     * Absolute grain duration in sec
     *
     * @type {Number}
     * @name durationAbs
     * @default 0.1
     * @memberof GranularEngine
     * @instance
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0.1); // absolute grain duration

    /**
     * Grain duration relative to grain period (overlap)
     *
     * @type {Number}
     * @name durationRel
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.durationRel = optOrDef(options.durationRel, 0);

    /**
     * Absolute attack time in sec
     *
     * @type {Number}
     * @name attackAbs
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0);

    /**
     * Attack time relative to grain duration
     *
     * @type {Number}
     * @name attackRel
     * @default 0.5
     * @memberof GranularEngine
     * @instance
     */
    _this.attackRel = optOrDef(options.attackRel, 0.5);

    /**
     * Shape of attack ('lin' for linear ramp, 'exp' for exponential ramp)
     *
     * @type {String}
     * @name attackShape
     * @default 'lin'
     * @memberof GranularEngine
     * @instance
     */
    _this.attackShape = optOrDef(options.attackShape, 'lin');

    /**
     * Absolute release time in sec
     *
     * @type {Number}
     * @name releaseAbs
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0);

    /**
     * Release time relative to grain duration
     *
     * @type {Number}
     * @name releaseRel
     * @default 0.5
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0.5);

    /**
     * Shape of release ('lin' for linear ramp, 'exp' for exponential ramp)
     *
     * @type {String}
     * @name releaseShape
     * @default 'lin'
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseShape = optOrDef(options.releaseShape, 'lin');

    /**
     * Offset (start/end value) for exponential attack/release
     *
     * @type {Number}
     * @name expRampOffset
     * @default 0.0001
     * @memberof GranularEngine
     * @instance
     */
    _this.expRampOffset = optOrDef(options.expRampOffset, 0.0001);

    /**
     * Grain resampling in cent
     *
     * @type {Number}
     * @name resampling
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     *
     * @type {Number}
     * @name resamplingVar
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     *
     * @type {Number}
     * @name gain
     * @default 1
     * @memberof GranularEngine
     * @instance
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Whether the grain position refers to the center of the grain (or the beginning)
     *
     * @type {Boolean}
     * @name centered
     * @default true
     * @memberof GranularEngine
     * @instance
     */
    _this.centered = optOrDef(options.centered, true);

    /**
     * Whether the audio buffer and grain position are considered as cyclic
     *
     * @type {Boolean}
     * @name cyclic
     * @default false
     * @memberof GranularEngine
     * @instance
     */
    _this.cyclic = optOrDef(options.cyclic, false);

    /**
     * Portion at the end of the audio buffer that has been copied from the
     * beginning to assure cyclic behavior
     *
     * @type {Number}
     * @name wrapAroundExtension
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   *
   * @type {Number}
   * @name bufferDuration
   * @memberof GranularEngine
   * @instance
   * @readonly
   */


  (0, _createClass3.default)(GranularEngine, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    /**
     * Trigger a grain. This function can be called at any time (whether the
     * engine is scheduled or not) to generate a single grain according to the
     * current grain parameters.
     *
     * @param {Number} time - grain synthesis audio time
     * @return {Number} - period to next grain
     */

  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var grainTime = time || audioContext.currentTime;
      var grainPeriod = this.periodAbs;
      var grainPosition = this.currentPosition;
      var grainDuration = this.durationAbs;

      if (this.buffer) {
        var resamplingRate = 1.0;

        // calculate resampling
        if (this.resampling !== 0 || this.resamplingVar > 0) {
          var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
          resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
        }

        grainPeriod += this.periodRel * grainDuration;
        grainDuration += this.durationRel * grainPeriod;

        // grain period randon variation
        if (this.periodVar > 0.0) grainPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

        // center grain
        if (this.centered) grainPosition -= 0.5 * grainDuration;

        // randomize grain position
        if (this.positionVar > 0) grainPosition += (2.0 * Math.random() - 1) * this.positionVar;

        var bufferDuration = this.bufferDuration;

        // wrap or clip grain position and duration into buffer duration
        if (grainPosition < 0 || grainPosition >= bufferDuration) {
          if (this.cyclic) {
            var cycles = grainPosition / bufferDuration;
            grainPosition = (cycles - Math.floor(cycles)) * bufferDuration;

            if (grainPosition + grainDuration > this.buffer.duration) grainDuration = this.buffer.duration - grainPosition;
          } else {
            if (grainPosition < 0) {
              grainTime -= grainPosition;
              grainDuration += grainPosition;
              grainPosition = 0;
            }

            if (grainPosition + grainDuration > bufferDuration) grainDuration = bufferDuration - grainPosition;
          }
        }

        // make grain
        if (this.gain > 0 && grainDuration >= 0.001) {
          // make grain envelope
          var envelope = audioContext.createGain();
          var attack = this.attackAbs + this.attackRel * grainDuration;
          var release = this.releaseAbs + this.releaseRel * grainDuration;

          if (attack + release > grainDuration) {
            var factor = grainDuration / (attack + release);
            attack *= factor;
            release *= factor;
          }

          var attackEndTime = grainTime + attack;
          var grainEndTime = grainTime + grainDuration / resamplingRate;
          var releaseStartTime = grainEndTime - release;

          envelope.gain.value = 0;

          if (this.attackShape === 'lin') {
            envelope.gain.setValueAtTime(0.0, grainTime);
            envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);
          } else {
            envelope.gain.setValueAtTime(this.expRampOffset, grainTime);
            envelope.gain.exponentialRampToValueAtTime(this.gain, attackEndTime);
          }

          if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

          if (this.releaseShape === 'lin') {
            envelope.gain.linearRampToValueAtTime(0.0, grainEndTime);
          } else {
            envelope.gain.exponentialRampToValueAtTime(this.expRampOffset, grainEndTime);
          }

          envelope.connect(this.outputNode);

          // make source
          var source = audioContext.createBufferSource();

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;
          source.connect(envelope);

          source.start(grainTime, grainPosition);
          source.stop(grainEndTime);
        }
      }

      return Math.max(this.periodMin, grainPeriod);
    }
  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

        if (this.wrapAroundExtension) bufferDuration -= this.wrapAroundExtension;

        return bufferDuration;
      }

      return 0;
    }

    /**
     * Current position
     *
     * @type {Number}
     * @name currentPosition
     * @memberof GranularEngine
     * @instance
     * @readonly
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return this.position;
    }
  }]);
  return GranularEngine;
}(_audioTimeEngine2.default);

exports.default = GranularEngine;

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioTimeEngine = require('../core/audio-time-engine');

var _audioTimeEngine2 = _interopRequireDefault(_audioTimeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

/**
 * Metronome audio engine. It extends Time Engine as a transported interface.
 * [example]{@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/metronome.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const metronome = new audio.Metronome({period: 0.333});
 *
 * scheduler.add(metronome);
 *
 * @param {Object} [options={}] - Default options
 * @param {Number} [options.period=1] - Metronome period
 * @param {Number} [options.clickFreq=600] - Metronome click frequency
 * @param {Number} [options.clickAttack=0.002] - Metronome click attack time
 * @param {Number} [options.clickRelease=0.098] - Metronome click release time
 * @param {Number} [options.gain=1] - Gain
 */

var Metronome = function (_AudioTimeEngine) {
  (0, _inherits3.default)(Metronome, _AudioTimeEngine);

  function Metronome() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Metronome);

    /**
     * Metronome period
     * @type {Number}
     * @private
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Metronome.__proto__ || (0, _getPrototypeOf2.default)(Metronome)).call(this, options.audioContext));

    _this.__period = optOrDef(options.period, 1);

    /**
     * Metronome click frequency
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickFreq
     * @instance
     */
    _this.clickFreq = optOrDef(options.clickFreq, 600);

    /**
     * Metronome click attack time
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickAttack
     * @instance
     */
    _this.clickAttack = optOrDef(options.clickAttack, 0.002);

    /**
     * Metronome click release time
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickRelease
     * @instance
     */
    _this.clickRelease = optOrDef(options.clickRelease, 0.098);

    _this.__lastTime = 0;
    _this.__phase = 0;

    _this.__gainNode = _this.audioContext.createGain();
    _this.__gainNode.gain.value = optOrDef(options.gain, 1);

    _this.outputNode = _this.__gainNode;
    return _this;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(Metronome, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      this.trigger(time);
      this.__lastTime = time;
      return time + this.__period;
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (this.__period > 0) {
        var nextPosition = (Math.floor(position / this.__period) + this.__phase) * this.__period;

        if (speed > 0 && nextPosition < position) nextPosition += this.__period;else if (speed < 0 && nextPosition > position) nextPosition -= this.__period;

        return nextPosition;
      }

      return Infinity * speed;
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      this.trigger(time);

      if (speed < 0) return position - this.__period;

      return position + this.__period;
    }

    /**
     * Trigger metronome click
     * @param {Number} time metronome click synthesis audio time
     */

  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var clickAttack = this.clickAttack;
      var clickRelease = this.clickRelease;

      var env = audioContext.createGain();
      env.gain.value = 0.0;
      env.gain.setValueAtTime(0, time);
      env.gain.linearRampToValueAtTime(1.0, time + clickAttack);
      env.gain.exponentialRampToValueAtTime(0.0000001, time + clickAttack + clickRelease);
      env.gain.setValueAtTime(0, time);
      env.connect(this.outputNode);

      var osc = audioContext.createOscillator();
      osc.frequency.value = this.clickFreq;
      osc.start(time);
      osc.stop(time + clickAttack + clickRelease);
      osc.connect(env);
    }

    /**
     * linear gain factor
     *
     * @type {Number}
     * @name gain
     * @memberof Metronome
     * @instance
     */

  }, {
    key: 'gain',
    set: function set(value) {
      this.__gainNode.gain.value = value;
    },
    get: function get() {
      return this.__gainNode.gain.value;
    }

    /**
     * metronome period
     *
     * @type {Number}
     * @name period
     * @memberof Metronome
     * @instance
     */

  }, {
    key: 'period',
    set: function set(period) {
      this.__period = period;

      var master = this.master;

      if (master) {
        if (master.resetEngineTime) master.resetEngineTime(this, this.__lastTime + period);else if (master.resetEnginePosition) master.resetEnginePosition(this);
      }
    },
    get: function get() {
      return this.__period;
    }

    /**
     * Set phase parameter (available only when 'transported'), should be
     * between [0, 1[
     *
     * @type {Number}
     * @name phase
     * @memberof Metronome
     * @instance
     */

  }, {
    key: 'phase',
    set: function set(phase) {
      this.__phase = phase - Math.floor(phase);

      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this);
    },
    get: function get() {
      return this.__phase;
    }
  }]);
  return Metronome;
}(_audioTimeEngine2.default);

exports.default = Metronome;

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioTimeEngine = require('../core/audio-time-engine');

var _audioTimeEngine2 = _interopRequireDefault(_audioTimeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

/**
 * Used with a buffer to serve audio files.
 *
 * [example]{@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/player-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const playerEngine = wavesAudio.PlayerEngine();
 * const playControl = new wavesAudio.PlayControl(playerEngine);
 *
 * playControl.start();
 *
 * @param {Object} [options={}] - Default options
 * @param {Number} [options.buffer=1] - Audio buffer
 * @param {Number} [options.fadeTime=600] - Fade time for chaining segments
 * @param {Number} [options.cyclic=false] - Loop mode
 * @param {Number} [options.gain=1] - Gain
 */

var PlayerEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(PlayerEngine, _AudioTimeEngine);

  function PlayerEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, PlayerEngine);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerEngine.__proto__ || (0, _getPrototypeOf2.default)(PlayerEngine)).call(this, options.audioContext));

    _this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     *
     * @type {AudioBuffer}
     * @name buffer
     * @memberof PlayerEngine
     * @instance
     * @default null
     */
    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     *
     * @type {Number}
     * @name fadeTime
     * @memberof PlayerEngine
     * @instance
     * @default 0.005
     */
    _this.fadeTime = optOrDef(options.fadeTime, 0.005);

    _this.__time = 0;
    _this.__position = 0;
    _this.__speed = 0;

    _this.__bufferSource = null;
    _this.__envNode = null;

    _this.__gainNode = _this.audioContext.createGain();
    _this.__gainNode.gain.value = optOrDef(options.gain, 1);

    _this.__cyclic = optOrDef(options.cyclic, false);

    _this.outputNode = _this.__gainNode;
    return _this;
  }

  (0, _createClass3.default)(PlayerEngine, [{
    key: '__start',
    value: function __start(time, position, speed) {
      var audioContext = this.audioContext;

      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

        if (this.__cyclic && (position < 0 || position >= bufferDuration)) {
          var phase = position / bufferDuration;
          position = (phase - Math.floor(phase)) * bufferDuration;
        }

        if (position >= 0 && position < bufferDuration && speed > 0) {
          this.__envNode = audioContext.createGain();
          this.__envNode.gain.setValueAtTime(0, time);
          this.__envNode.gain.linearRampToValueAtTime(1, time + this.fadeTime);
          this.__envNode.connect(this.__gainNode);

          this.__bufferSource = audioContext.createBufferSource();
          this.__bufferSource.buffer = this.buffer;
          this.__bufferSource.playbackRate.value = speed;
          this.__bufferSource.loop = this.__cyclic;
          this.__bufferSource.loopStart = 0;
          this.__bufferSource.loopEnd = bufferDuration;
          this.__bufferSource.start(time, position);
          this.__bufferSource.connect(this.__envNode);
        }
      }
    }
  }, {
    key: '__halt',
    value: function __halt(time) {
      if (this.__bufferSource) {
        this.__envNode.gain.cancelScheduledValues(time);
        this.__envNode.gain.setValueAtTime(this.__envNode.gain.value, time);
        this.__envNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
        this.__bufferSource.stop(time + this.fadeTime);

        this.__bufferSource = null;
        this.__envNode = null;
      }
    }

    // TimeEngine method (speed-controlled interface)

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var lastSpeed = this.__speed;

      if (speed !== lastSpeed || seek) {
        if (seek || lastSpeed * speed < 0) {
          this.__halt(time);
          this.__start(time, position, speed);
        } else if (lastSpeed === 0 || seek) {
          this.__start(time, position, speed);
        } else if (speed === 0) {
          this.__halt(time);
        } else if (this.__bufferSource) {
          this.__bufferSource.playbackRate.setValueAtTime(speed, time);
        }

        this.__speed = speed;
      }
    }

    /**
     * Set whether the audio buffer is considered as cyclic
     * @type {Bool}
     * @name cyclic
     * @memberof PlayerEngine
     * @instance
     */

  }, {
    key: 'cyclic',
    set: function set(cyclic) {
      if (cyclic !== this.__cyclic) {
        var time = this.currentTime;
        var position = this.currentosition;

        this.__halt(time);
        this.__cyclic = cyclic;

        if (this.__speed !== 0) this.__start(time, position, this.__speed);
      }
    },
    get: function get() {
      return this.__cyclic;
    }

    /**
     * Linear gain factor
     * @type {Number}
     * @name gain
     * @memberof PlayerEngine
     * @instance
     */

  }, {
    key: 'gain',
    set: function set(value) {
      var time = this.currentTime;
      this.__gainNode.cancelScheduledValues(time);
      this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
      this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
    },
    get: function get() {
      return this.__gainNode.gain.value;
    }

    /**
     * Get buffer duration
     * @type {Number}
     * @name bufferDuration
     * @memberof PlayerEngine
     * @instance
     * @readonly
     */

  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) return this.buffer.duration;

      return 0;
    }
  }]);
  return PlayerEngine;
}(_audioTimeEngine2.default);

exports.default = PlayerEngine;

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioTimeEngine = require('../core/audio-time-engine');

var _audioTimeEngine2 = _interopRequireDefault(_audioTimeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

function getCurrentOrPreviousIndex(sortedArray, value) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value < firstVal) index = -1;else if (value >= lastVal) index = size - 1;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] > value) {
        index--;
      }while (sortedArray[index + 1] <= value) {
        index++;
      }
    }
  }

  return index;
}

function getCurrentOrNextIndex(sortedArray, value) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value <= firstVal) index = 0;else if (value >= lastVal) index = size;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] < value) {
        index++;
      }while (sortedArray[index - 1] >= value) {
        index--;
      }
    }
  }

  return index;
}

/**
 * Used with a buffer to serve audio files via granular synthesis.
 *
 * The engine implements the "scheduled" and "transported" interfaces.
 * When "scheduled", the engine  generates segments more or less periodically
 * (controlled by the periodAbs, periodRel, and perioVar attributes).
 * When "transported", the engine generates segments at the position of their onset time.
 *
 * Example that shows a `SegmentEngine` with a few parameter controls running in a `Scheduler`.
 * {@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/segment-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const segmentEngine = new audio.SegmentEngine();
 *
 * scheduler.add(segmentEngine);
 *
 * @param {Object} [options={}] - Default options
 * @param {AudioBuffer} [options.buffer=null] - Audio buffer
 * @param {Number} [options.periodAbs=0] - Absolute segment period in sec
 * @param {Number} [options.periodRel=1] - Segment period relative to inter-segment distance
 * @param {Number} [options.periodVar=0] - Amout of random segment period variation relative
 *  to segment period
 * @param {Number} [options.periodMin=0.001] - Minimum segment period
 * @param {Number} [options.positionArray=[0.0]] - Array of segment positions (onset times
 *  in audio buffer) in sec
 * @param {Number} [options.positionVar=0] - Amout of random segment position variation in sec
 * @param {Number} [options.durationArray=[0.0]] - Array of segment durations in sec
 * @param {Number} [options.durationAbs=0] - Absolute segment duration in sec
 * @param {Number} [options.durationRel=1] - Segment duration relative to given segment
 *  duration or inter-segment distance
 * @param {Array} [options.offsetArray=[0.0]] - Array of segment offsets in sec
 * @param {Number} [options.offsetAbs=-0.005] - Absolute segment offset in sec
 * @param {Number} [options.offsetRel=0] - Segment offset relative to segment duration
 * @param {Number} [options.delay=0.005] - Time by which all segments are delayed (especially
 *  to realize segment offsets)
 * @param {Number} [options.attackAbs=0.005] - Absolute attack time in sec
 * @param {Number} [options.attackRel=0] - Attack time relative to segment duration
 * @param {Number} [options.releaseAbs=0.005] - Absolute release time in sec
 * @param {Number} [options.releaseRel=0] - Release time relative to segment duration
 * @param {Number} [options.resampling=0] - Segment resampling in cent
 * @param {Number} [options.resamplingVar=0] - Amout of random resampling variation in cent
 * @param {Number} [options.gain=1] - Linear gain factor
 * @param {Number} [options.segmentIndex=0] - Index of the segment to synthesize (i.e. of
 *  this.positionArray/durationArray/offsetArray)
 * @param {Bool} [options.cyclic=false] - Whether the audio buffer and segment indices are
 *  considered as cyclic
 * @param {Number} [options.wrapAroundExtension=0] - Portion at the end of the audio buffer
 *  that has been copied from the beginning to assure cyclic behavior
 */

var SegmentEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(SegmentEngine, _AudioTimeEngine);

  function SegmentEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, SegmentEngine);

    /**
     * Audio buffer
     * @name buffer
     * @type {AudioBuffer}
     * @default null
     * @memberof SegmentEngine
     * @instance
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (SegmentEngine.__proto__ || (0, _getPrototypeOf2.default)(SegmentEngine)).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute segment period in sec
     * @name periodAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0);

    /**
     * Segment period relative to inter-segment distance
     * @name periodRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodRel = optOrDef(options.periodRel, 1);

    /**
     * Amout of random segment period variation relative to segment period
     * @name periodVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Minimum segment period
     * @name periodMin
     * @type {Number}
     * @default 0.001
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodMin = optOrDef(options.periodMin, 0.001);

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @name positionArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.positionArray = optOrDef(options.positionArray, [0.0]);

    /**
     * Amout of random segment position variation in sec
     * @name positionVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.positionVar = optOrDef(options.positionVar, 0);

    /**
     * Array of segment durations in sec
     * @name durationArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationArray = optOrDef(options.durationArray, [0.0]);

    /**
     * Absolute segment duration in sec
     * @name durationAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0);

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @name durationRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationRel = optOrDef(options.durationRel, 1);

    /**
     * Array of segment offsets in sec
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position
     * and the duration has to be corrected by the offset
     *
     * @name offsetArray
     * @type {Array}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetArray = optOrDef(options.offsetArray, [0.0]);

    /**
     * Absolute segment offset in sec
     * @name offsetAbs
     * @type {Number}
     * @default -0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetAbs = optOrDef(options.offsetAbs, -0.005);

    /**
     * Segment offset relative to segment duration
     * @name offsetRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetRel = optOrDef(options.offsetRel, 0);

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @name delay
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.delay = optOrDef(options.delay, 0.005);

    /**
     * Absolute attack time in sec
     * @name attackAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0.005);

    /**
     * Attack time relative to segment duration
     * @name attackRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.attackRel = optOrDef(options.attackRel, 0);

    /**
     * Absolute release time in sec
     * @name releaseAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0.005);

    /**
     * Release time relative to segment duration
     * @name releaseRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0);

    /**
     * Segment resampling in cent
     * @name resampling
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @name resamplingVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @name gain
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Index of the segment to synthesize (i.e. of this.positionArray/durationArray/offsetArray)
     * @name segmentIndex
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.segmentIndex = optOrDef(options.segmentIndex, 0);

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @name cyclic
     * @type {Bool}
     * @default false
     * @memberof SegmentEngine
     * @instance
     */
    _this.cyclic = optOrDef(options.cyclic, false);
    _this.__cyclicOffset = 0;

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @name wrapAroundExtension
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   *
   * @type {Number}
   * @default 0
   * @memberof SegmentEngine
   * @instance
   */


  (0, _createClass3.default)(SegmentEngine, [{
    key: 'advanceTime',


    // TimeEngine method (transported interface)
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      var index = this.segmentIndex;
      var cyclicOffset = 0;
      var bufferDuration = this.bufferDuration;

      if (this.cyclic) {
        var cycles = position / bufferDuration;

        cyclicOffset = Math.floor(cycles) * bufferDuration;
        position -= cyclicOffset;
      }

      if (speed > 0) {
        index = getCurrentOrNextIndex(this.positionArray, position);

        if (index >= this.positionArray.length) {
          index = 0;
          cyclicOffset += bufferDuration;

          if (!this.cyclic) return Infinity;
        }
      } else if (speed < 0) {
        index = getCurrentOrPreviousIndex(this.positionArray, position);

        if (index < 0) {
          index = this.positionArray.length - 1;
          cyclicOffset -= bufferDuration;

          if (!this.cyclic) return -Infinity;
        }
      } else {
        return Infinity;
      }

      this.segmentIndex = index;
      this.__cyclicOffset = cyclicOffset;

      return cyclicOffset + this.positionArray[index];
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var index = this.segmentIndex;
      var cyclicOffset = this.__cyclicOffset;

      this.trigger(time);

      if (speed > 0) {
        index++;

        if (index >= this.positionArray.length) {
          index = 0;
          cyclicOffset += this.bufferDuration;

          if (!this.cyclic) return Infinity;
        }
      } else {
        index--;

        if (index < 0) {
          index = this.positionArray.length - 1;
          cyclicOffset -= this.bufferDuration;

          if (!this.cyclic) return -Infinity;
        }
      }

      this.segmentIndex = index;
      this.__cyclicOffset = cyclicOffset;

      return cyclicOffset + this.positionArray[index];
    }

    /**
     * Trigger a segment.
     * This function can be called at any time (whether the engine is scheduled/transported or not)
     * to generate a single segment according to the current segment parameters.
     *
     * @param {Number} time segment synthesis audio time
     * @return {Number} period to next segment
     */

  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var segmentTime = (time || audioContext.currentTime) + this.delay;
      var segmentPeriod = this.periodAbs;
      var segmentIndex = this.segmentIndex;

      if (this.buffer) {
        var segmentPosition = 0.0;
        var segmentDuration = 0.0;
        var segmentOffset = 0.0;
        var resamplingRate = 1.0;
        var bufferDuration = this.bufferDuration;

        if (this.cyclic) segmentIndex = segmentIndex % this.positionArray.length;else segmentIndex = Math.max(0, Math.min(segmentIndex, this.positionArray.length - 1));

        if (this.positionArray) segmentPosition = this.positionArray[segmentIndex] || 0;

        if (this.durationArray) segmentDuration = this.durationArray[segmentIndex] || 0;

        if (this.offsetArray) segmentOffset = this.offsetArray[segmentIndex] || 0;

        // calculate resampling
        if (this.resampling !== 0 || this.resamplingVar > 0) {
          var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
          resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
        }

        // calculate inter-segment distance
        if (segmentDuration === 0 || this.periodRel > 0) {
          var nextSegmentIndex = segmentIndex + 1;
          var nextPosition, nextOffset;

          if (nextSegmentIndex === this.positionArray.length) {
            if (this.cyclic) {
              nextPosition = this.positionArray[0] + bufferDuration;
              nextOffset = this.offsetArray[0];
            } else {
              nextPosition = bufferDuration;
              nextOffset = 0;
            }
          } else {
            nextPosition = this.positionArray[nextSegmentIndex];
            nextOffset = this.offsetArray[nextSegmentIndex];
          }

          var interSegmentDistance = nextPosition - segmentPosition;

          // correct inter-segment distance by offsets
          //   offset > 0: the segment's reference position is after the given segment position
          if (segmentOffset > 0) interSegmentDistance -= segmentOffset;

          if (nextOffset > 0) interSegmentDistance += nextOffset;

          if (interSegmentDistance < 0) interSegmentDistance = 0;

          // use inter-segment distance instead of segment duration
          if (segmentDuration === 0) segmentDuration = interSegmentDistance;

          // calculate period relative to inter marker distance
          segmentPeriod += this.periodRel * interSegmentDistance;
        }

        // add relative and absolute segment duration
        segmentDuration *= this.durationRel;
        segmentDuration += this.durationAbs;

        // add relative and absolute segment offset
        segmentOffset *= this.offsetRel;
        segmentOffset += this.offsetAbs;

        // apply segment offset
        //   offset > 0: the segment's reference position is after the given segment position
        //   offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
        if (segmentOffset < 0) {
          segmentDuration -= segmentOffset;
          segmentPosition += segmentOffset;
          segmentTime += segmentOffset / resamplingRate;
        } else {
          segmentTime -= segmentOffset / resamplingRate;
        }

        // randomize segment position
        if (this.positionVar > 0) segmentPosition += 2.0 * (Math.random() - 0.5) * this.positionVar;

        // shorten duration of segments over the edges of the buffer
        if (segmentPosition < 0) {
          //segmentTime -= grainPosition; hm, not sure if we want to do this
          segmentDuration += segmentPosition;
          segmentPosition = 0;
        }

        if (segmentPosition + segmentDuration > this.buffer.duration) segmentDuration = this.buffer.duration - segmentPosition;

        segmentDuration /= resamplingRate;

        // make segment
        if (this.gain > 0 && segmentDuration > 0) {
          // make segment envelope
          var envelope = audioContext.createGain();
          var attack = this.attackAbs + this.attackRel * segmentDuration;
          var release = this.releaseAbs + this.releaseRel * segmentDuration;

          if (attack + release > segmentDuration) {
            var factor = segmentDuration / (attack + release);
            attack *= factor;
            release *= factor;
          }

          var attackEndTime = segmentTime + attack;
          var segmentEndTime = segmentTime + segmentDuration;
          var releaseStartTime = segmentEndTime - release;

          envelope.gain.value = 0;
          envelope.gain.setValueAtTime(0.0, segmentTime);
          envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);

          if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

          envelope.gain.linearRampToValueAtTime(0.0, segmentEndTime);
          envelope.connect(this.outputNode);

          // make source
          var source = audioContext.createBufferSource();

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;
          source.connect(envelope);

          source.start(segmentTime, segmentPosition);
          source.stop(segmentTime + segmentDuration);
        }
      }

      // grain period randon variation
      if (this.periodVar > 0.0) segmentPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

      return Math.max(this.periodMin, segmentPeriod);
    }
  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

        if (this.wrapAroundExtension) bufferDuration -= this.wrapAroundExtension;

        return bufferDuration;
      }

      return 0;
    }
  }]);
  return SegmentEngine;
}(_audioTimeEngine2.default);

exports.default = SegmentEngine;

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioContext = require('./core/audio-context');

Object.defineProperty(exports, 'audioContext', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_audioContext).default;
  }
});

var _timeEngine = require('./core/time-engine');

Object.defineProperty(exports, 'TimeEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_timeEngine).default;
  }
});

var _audioTimeEngine = require('./core/audio-time-engine');

Object.defineProperty(exports, 'AudioTimeEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_audioTimeEngine).default;
  }
});

var _priorityQueue = require('./core/priority-queue');

Object.defineProperty(exports, 'PriorityQueue', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_priorityQueue).default;
  }
});

var _schedulingQueue = require('./core/scheduling-queue');

Object.defineProperty(exports, 'SchedulingQueue', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_schedulingQueue).default;
  }
});

var _granularEngine = require('./engines/granular-engine');

Object.defineProperty(exports, 'GranularEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_granularEngine).default;
  }
});

var _metronome = require('./engines/metronome');

Object.defineProperty(exports, 'Metronome', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_metronome).default;
  }
});

var _playerEngine = require('./engines/player-engine');

Object.defineProperty(exports, 'PlayerEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_playerEngine).default;
  }
});

var _segmentEngine = require('./engines/segment-engine');

Object.defineProperty(exports, 'SegmentEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_segmentEngine).default;
  }
});

var _playControl = require('./masters/play-control');

Object.defineProperty(exports, 'PlayControl', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_playControl).default;
  }
});

var _transport = require('./masters/transport');

Object.defineProperty(exports, 'Transport', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_transport).default;
  }
});

var _scheduler = require('./masters/scheduler');

Object.defineProperty(exports, 'Scheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_scheduler).default;
  }
});

var _simpleScheduler = require('./masters/simple-scheduler');

Object.defineProperty(exports, 'SimpleScheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_simpleScheduler).default;
  }
});

var _factories = require('./masters/factories');

Object.defineProperty(exports, 'getScheduler', {
  enumerable: true,
  get: function get() {
    return _factories.getScheduler;
  }
});
Object.defineProperty(exports, 'getSimpleScheduler', {
  enumerable: true,
  get: function get() {
    return _factories.getSimpleScheduler;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./core/audio-context":1,"./core/audio-time-engine":2,"./core/priority-queue":3,"./core/scheduling-queue":4,"./core/time-engine":5,"./engines/granular-engine":6,"./engines/metronome":7,"./engines/player-engine":8,"./engines/segment-engine":9,"./masters/factories":11,"./masters/play-control":12,"./masters/scheduler":13,"./masters/simple-scheduler":14,"./masters/transport":15}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSimpleScheduler = exports.getScheduler = undefined;

var _weakMap = require('babel-runtime/core-js/weak-map');

var _weakMap2 = _interopRequireDefault(_weakMap);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _simpleScheduler = require('./simple-scheduler');

var _simpleScheduler2 = _interopRequireDefault(_simpleScheduler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schedulerMap = new _weakMap2.default(); // schedulers should be singletons

var simpleSchedulerMap = new _weakMap2.default();

/**
 * Returns a unique instance of `Scheduler`
 *
 * @global
 * @function
 * @returns {Scheduler}
 * @see Scheduler
 */
var getScheduler = exports.getScheduler = function getScheduler() {
  var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;

  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new _scheduler2.default({ audioContext: audioContext });
    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

/**
 * Returns a unique instance of `SimpleScheduler`
 *
 * @global
 * @function
 * @returns {SimpleScheduler}
 * @see SimpleScheduler
 */
var getSimpleScheduler = exports.getSimpleScheduler = function getSimpleScheduler() {
  var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;

  var simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new _simpleScheduler2.default({ audioContext: audioContext });
    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};

},{"../core/audio-context":1,"./scheduler":13,"./simple-scheduler":14,"babel-runtime/core-js/weak-map":25}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _schedulingQueue = require('../core/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _factories = require('./factories');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ESPILON = 1e-8;

var LoopControl = function (_TimeEngine) {
  (0, _inherits3.default)(LoopControl, _TimeEngine);

  function LoopControl(playControl) {
    (0, _classCallCheck3.default)(this, LoopControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LoopControl.__proto__ || (0, _getPrototypeOf2.default)(LoopControl)).call(this));

    _this.__playControl = playControl;
    _this.speed = 1;
    _this.lower = -Infinity;
    _this.upper = Infinity;
    return _this;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(LoopControl, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var playControl = this.__playControl;
      var speed = this.speed;
      var lower = this.lower;
      var upper = this.upper;

      if (speed > 0) time += ESPILON;else time -= EPSILON;

      if (speed > 0) {
        playControl.syncSpeed(time, lower, speed, true);
        return playControl.__getTimeAtPosition(upper) - ESPILON;
      } else if (speed < 0) {
        playControl.syncSpeed(time, upper, speed, true);
        return playControl.__getTimeAtPosition(lower) + ESPILON;
      }

      return Infinity;
    }
  }, {
    key: 'reschedule',
    value: function reschedule(speed) {
      var playControl = this.__playControl;
      var lower = Math.min(playControl.__loopStart, playControl.__loopEnd);
      var upper = Math.max(playControl.__loopStart, playControl.__loopEnd);

      this.speed = speed;
      this.lower = lower;
      this.upper = upper;

      if (lower === upper) speed = 0;

      if (speed > 0) this.resetTime(playControl.__getTimeAtPosition(upper) - ESPILON);else if (speed < 0) this.resetTime(playControl.__getTimeAtPosition(lower) + ESPILON);else this.resetTime(Infinity);
    }
  }, {
    key: 'applyLoopBoundaries',
    value: function applyLoopBoundaries(position, speed) {
      var lower = this.lower;
      var upper = this.upper;

      if (speed > 0 && position >= upper) return lower + (position - lower) % (upper - lower);else if (speed < 0 && position < lower) return upper - (upper - position) % (upper - lower);

      return position;
    }
  }]);
  return LoopControl;
}(_timeEngine2.default);

// play controlled base class


var PlayControlled = function () {
  function PlayControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlled);

    this.__playControl = playControl;

    engine.master = this;
    this.__engine = engine;
  }

  (0, _createClass3.default)(PlayControlled, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      this.__engine.syncSpeed(time, position, speed, seek);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__playControl = null;

      this.__engine.master = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return PlayControlled;
}();

// play control for engines implementing the *speed-controlled* interface


var PlayControlledSpeedControlled = function (_PlayControlled) {
  (0, _inherits3.default)(PlayControlledSpeedControlled, _PlayControlled);

  function PlayControlledSpeedControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSpeedControlled);
    return (0, _possibleConstructorReturn3.default)(this, (PlayControlledSpeedControlled.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSpeedControlled)).call(this, playControl, engine));
  }

  return PlayControlledSpeedControlled;
}(PlayControlled);

// play control for engines implmenting the *transported* interface


var PlayControlledTransported = function (_PlayControlled2) {
  (0, _inherits3.default)(PlayControlledTransported, _PlayControlled2);

  function PlayControlledTransported(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledTransported);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledTransported.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledTransported)).call(this, playControl, engine));

    _this3.__schedulerHook = new PlayControlledSchedulerHook(playControl, engine);
    return _this3;
  }

  (0, _createClass3.default)(PlayControlledTransported, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      if (speed !== lastSpeed || seek && speed !== 0) {
        var nextPosition;

        // resync transported engines
        if (seek || speed * lastSpeed < 0) {
          // seek or reverse direction
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (lastSpeed === 0) {
          // start
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (speed === 0) {
          // stop
          nextPosition = Infinity;

          if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, 0);
        } else if (this.__engine.syncSpeed) {
          // change speed without reversing direction
          this.__engine.syncSpeed(time, position, speed);
        }

        this.__schedulerHook.resetPosition(nextPosition);
      }
    }
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(engine) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      if (position === undefined) {
        var playControl = this.__playControl;
        var time = playControl.__sync();

        position = this.__engine.syncPosition(time, playControl.__position, playControl.__speed);
      }

      this.__schedulerHook.resetPosition(position);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__schedulerHook.destroy();
      this.__schedulerHook = null;

      (0, _get3.default)(PlayControlledTransported.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledTransported.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledTransported;
}(PlayControlled);

// play control for time engines implementing the *scheduled* interface


var PlayControlledScheduled = function (_PlayControlled3) {
  (0, _inherits3.default)(PlayControlledScheduled, _PlayControlled3);

  function PlayControlledScheduled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledScheduled);

    // scheduling queue becomes master of engine
    var _this4 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledScheduled.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledScheduled)).call(this, playControl, engine));

    engine.master = null;
    _this4.__schedulingQueue = new PlayControlledSchedulingQueue(playControl, engine);
    return _this4;
  }

  (0, _createClass3.default)(PlayControlledScheduled, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      if (lastSpeed === 0 && speed !== 0) // start or seek
        this.__engine.resetTime();else if (lastSpeed !== 0 && speed === 0) // stop
        this.__engine.resetTime(Infinity);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__schedulingQueue.destroy();
      (0, _get3.default)(PlayControlledScheduled.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledScheduled;
}(PlayControlled);

// translates transported engine advancePosition into global scheduler times


var PlayControlledSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(PlayControlledSchedulerHook, _TimeEngine2);

  function PlayControlledSchedulerHook(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledSchedulerHook.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSchedulerHook)).call(this));

    _this5.__playControl = playControl;
    _this5.__engine = engine;

    _this5.__nextPosition = Infinity;
    playControl.__scheduler.add(_this5, Infinity);
    return _this5;
  }

  (0, _createClass3.default)(PlayControlledSchedulerHook, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var playControl = this.__playControl;
      var engine = this.__engine;
      var position = this.__nextPosition;
      var nextPosition = engine.advancePosition(time, position, playControl.__speed);
      var nextTime = playControl.__getTimeAtPosition(nextPosition);

      this.__nextPosition = nextPosition;
      return nextTime;
    }
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.__nextPosition;

      var time = this.__playControl.__getTimeAtPosition(position);
      this.__nextPosition = position;
      this.resetTime(time);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__playControl.__scheduler.remove(this);
      this.__playControl = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return PlayControlledSchedulerHook;
}(_timeEngine2.default);

// internal scheduling queue that returns the current position (and time) of the play control


var PlayControlledSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(PlayControlledSchedulingQueue, _SchedulingQueue);

  function PlayControlledSchedulingQueue(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledSchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSchedulingQueue)).call(this));

    _this6.__playControl = playControl;
    _this6.__engine = engine;

    _this6.add(engine, Infinity);
    playControl.__scheduler.add(_this6, Infinity);
    return _this6;
  }

  (0, _createClass3.default)(PlayControlledSchedulingQueue, [{
    key: 'destroy',
    value: function destroy() {
      this.__playControl.__scheduler.remove(this);
      this.remove(this.__engine);

      this.__playControl = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return PlayControlledSchedulingQueue;
}(_schedulingQueue2.default);

/**
 * Extends Time Engine to provide playback control of a Time Engine instance.
 *
 * [example]{@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/play-control.html}
 *
 * @extends TimeEngine
 * @param {TimeEngine} engine - engine to control
 *
 * @example
 * import * as audio from 'waves-audio';
 * const playerEngine = audio.PlayerEngine();
 * const playControl = new audio.PlayControl(playerEngine);
 *
 * playControl.start();
 */


var PlayControl = function (_TimeEngine3) {
  (0, _inherits3.default)(PlayControl, _TimeEngine3);

  function PlayControl(engine) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, PlayControl);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (PlayControl.__proto__ || (0, _getPrototypeOf2.default)(PlayControl)).call(this));

    _this7.audioContext = options.audioContext || _audioContext2.default;
    _this7.__scheduler = (0, _factories.getScheduler)(_this7.audioContext);

    _this7.__playControlled = null;

    _this7.__loopControl = null;
    _this7.__loopStart = 0;
    _this7.__loopEnd = 1;

    // synchronized tie, position, and speed
    _this7.__time = 0;
    _this7.__position = 0;
    _this7.__speed = 0;

    // non-zero "user" speed
    _this7.__playingSpeed = 1;

    if (engine) _this7.__setEngine(engine);
    return _this7;
  }

  (0, _createClass3.default)(PlayControl, [{
    key: '__setEngine',
    value: function __setEngine(engine) {
      if (engine.master) throw new Error("object has already been added to a master");

      if (_timeEngine2.default.implementsSpeedControlled(engine)) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (_timeEngine2.default.implementsTransported(engine)) this.__playControlled = new PlayControlledTransported(this, engine);else if (_timeEngine2.default.implementsScheduled(engine)) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
    }
  }, {
    key: '__resetEngine',
    value: function __resetEngine() {
      this.__playControlled.destroy();
      this.__playControlled = null;
    }

    /**
     * Calculate/extrapolate playing time for given position
     *
     * @param {Number} position position
     * @return {Number} extrapolated time
     * @private
     */

  }, {
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      return this.__time + (position - this.__position) / this.__speed;
    }

    /**
     * Calculate/extrapolate playing position for given time
     *
     * @param {Number} time time
     * @return {Number} extrapolated position
     * @private
     */

  }, {
    key: '__getPositionAtTime',
    value: function __getPositionAtTime(time) {
      return this.__position + (time - this.__time) * this.__speed;
    }
  }, {
    key: '__sync',
    value: function __sync() {
      var now = this.currentTime;
      this.__position += (now - this.__time) * this.__speed;
      this.__time = now;
      return now;
    }

    /**
     * Get current master time.
     * This function will be replaced when the play-control is added to a master.
     *
     * @name currentTime
     * @type {Number}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'set',
    value: function set() {
      var engine = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var time = this.__sync();
      var speed = this.__speed;

      if (this.__playControlled !== null && this.__playControlled.__engine !== engine) {

        this.syncSpeed(time, this.__position, 0);

        if (this.__playControlled) this.__resetEngine();

        if (this.__playControlled === null && engine !== null) {
          this.__setEngine(engine);

          if (speed !== 0) this.syncSpeed(time, this.__position, speed);
        }
      }
    }

    /**
     * Sets the play control loop behavior.
     *
     * @type {Boolean}
     * @name loop
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'setLoopBoundaries',


    /**
     * Sets loop start and end time.
     *
     * @param {Number} loopStart - loop start value.
     * @param {Number} loopEnd - loop end value.
     */
    value: function setLoopBoundaries(loopStart, loopEnd) {
      this.__loopStart = loopStart;
      this.__loopEnd = loopEnd;

      this.loop = this.loop;
    }

    /**
     * Sets loop start value
     *
     * @type {Number}
     * @name loopStart
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'syncSpeed',


    // TimeEngine method (speed-controlled interface)
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var lastSpeed = this.__speed;

      if (speed !== lastSpeed || seek) {
        if ((seek || lastSpeed === 0) && this.__loopControl) position = this.__loopControl.applyLoopBoundaries(position, speed);

        this.__time = time;
        this.__position = position;
        this.__speed = speed;

        if (this.__playControlled) this.__playControlled.syncSpeed(time, position, speed, seek, lastSpeed);

        if (this.__loopControl) this.__loopControl.reschedule(speed);
      }
    }

    /**
     * Starts playback
     */

  }, {
    key: 'start',
    value: function start() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, this.__playingSpeed);
    }

    /**
     * Pauses playback and stays at the same position.
     */

  }, {
    key: 'pause',
    value: function pause() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
    }

    /**
     * Stops playback and seeks to initial (0) position.
     */

  }, {
    key: 'stop',
    value: function stop() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
      this.seek(0);
    }

    /**
     * If speed if provided, sets the playback speed. The speed value should
     * be non-zero between -16 and -1/16 or between 1/16 and 16.
     *
     * @type {Number}
     * @name speed
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'seek',


    /**
     * Set (jump to) playing position.
     *
     * @param {Number} position target position
     */
    value: function seek(position) {
      if (position !== this.__position) {
        var time = this.__sync();
        this.__position = position;
        this.syncSpeed(time, position, this.__speed, true);
      }
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__scheduler.currentTime;
    }

    /**
     * Get current master position.
     * This function will be replaced when the play-control is added to a master.
     *
     * @name currentPosition
     * @type {Number}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }
  }, {
    key: 'loop',
    set: function set(enable) {
      if (enable && this.__loopStart > -Infinity && this.__loopEnd < Infinity) {
        if (!this.__loopControl) {
          this.__loopControl = new LoopControl(this);
          this.__scheduler.add(this.__loopControl, Infinity);
        }

        if (this.__speed !== 0) {
          var position = this.currentPosition;
          var lower = Math.min(this.__loopStart, this.__loopEnd);
          var upper = Math.max(this.__loopStart, this.__loopEnd);

          if (this.__speed > 0 && position > upper) this.seek(upper);else if (this.__speed < 0 && position < lower) this.seek(lower);else this.__loopControl.reschedule(this.__speed);
        }
      } else if (this.__loopControl) {
        this.__scheduler.remove(this.__loopControl);
        this.__loopControl = null;
      }
    },
    get: function get() {
      return !!this.__loopControl;
    }
  }, {
    key: 'loopStart',
    set: function set(loopStart) {
      this.setLoopBoundaries(loopStart, this.__loopEnd);
    },
    get: function get() {
      return this.__loopStart;
    }

    /**
     * Sets loop end value
     *
     * @type {Number}
     * @name loopEnd
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'loopEnd',
    set: function set(loopEnd) {
      this.setLoopBoundaries(this.__loopStart, loopEnd);
    },
    get: function get() {
      return this.__loopEnd;
    }
  }, {
    key: 'speed',
    set: function set(speed) {
      var time = this.__sync();

      if (speed >= 0) {
        if (speed < 0.01) speed = 0.01;else if (speed > 100) speed = 100;
      } else {
        if (speed < -100) speed = -100;else if (speed > -0.01) speed = -0.01;
      }

      this.__playingSpeed = speed;

      if (!this.master && this.__speed !== 0) this.syncSpeed(time, this.__position, speed);
    },
    get: function get() {
      return this.__playingSpeed;
    }
  }]);
  return PlayControl;
}(_timeEngine2.default);

exports.default = PlayControl;

},{"../core/audio-context":1,"../core/scheduling-queue":4,"../core/time-engine":5,"./factories":11,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _schedulingQueue = require('../core/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('wavesjs:audio');

/**
 * The `Scheduler` class implements a master for `TimeEngine` or `AudioTimeEngine`
 * instances that implement the *scheduled* interface such as the `Metronome`
 * `GranularEngine`.
 *
 * A `Scheduler` can also schedule simple callback functions.
 * The class is based on recursive calls to `setTimeOut` and uses the
 * `audioContext.currentTime` as logical passed to the `advanceTime` methods
 * of the scheduled engines or to the scheduled callback functions.
 * It extends the `SchedulingQueue` class that itself includes a `PriorityQueue`
 * to assure the order of the scheduled engines (see `SimpleScheduler` for a
 * simplified scheduler implementation without `PriorityQueue`).
 *
 * To get a unique instance of `Scheduler` as the global scheduler of an
 * application, the `getScheduler` factory function should be used. The
 * function accepts an audio context as optional argument and uses the Waves
 * default audio context (see `audioContext`) as
 * default. The factory creates a single scheduler for each audio context.
 *
 * Example that shows three Metronome engines running in a Scheduler:
 * {@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/scheduler.html}
 *
 * @param {Object} [options={}] - default options
 * @param {Number} [options.period=0.025] - period of the scheduler.
 * @param {Number} [options.lookahead=0.1] - lookahead of the scheduler.
 *
 * @see TimeEngine
 * @see AudioTimeEngine
 * @see getScheduler
 * @see SimpleScheduler
 *
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 *
 * scheduler.add(myEngine);
 */

var Scheduler = function (_SchedulingQueue) {
  (0, _inherits3.default)(Scheduler, _SchedulingQueue);

  function Scheduler() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Scheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Scheduler.__proto__ || (0, _getPrototypeOf2.default)(Scheduler)).call(this));

    _this.audioContext = options.audioContext || _audioContext2.default;

    _this.__currentTime = null;
    _this.__nextTime = Infinity;
    _this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     * @name period
     * @memberof Scheduler
     * @instance
     */
    _this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     * @name lookahead
     * @memberof Scheduler
     * @instance
     */
    _this.lookahead = options.lookahead || 0.1;
    return _this;
  }

  // setTimeout scheduling loop


  (0, _createClass3.default)(Scheduler, [{
    key: '__tick',
    value: function __tick() {
      var audioContext = this.audioContext;
      var currentTime = audioContext.currentTime;
      var time = this.__nextTime;

      this.__timeout = null;

      while (time <= currentTime + this.lookahead) {
        this.__currentTime = time;
        time = this.advanceTime(time);
      }

      this.__currentTime = null;
      this.resetTime(time);
    }
  }, {
    key: 'resetTime',
    value: function resetTime() {
      var _this2 = this;

      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.currentTime;

      if (this.master) {
        this.master.reset(this, time);
      } else {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        if (time !== Infinity) {
          if (this.__nextTime === Infinity) log('Scheduler Start');

          var timeOutDelay = Math.max(time - this.lookahead - this.audioContext.currentTime, this.period);

          this.__timeout = setTimeout(function () {
            _this2.__tick();
          }, timeOutDelay * 1000);
        } else if (this.__nextTime !== Infinity) {
          log('Scheduler Stop');
        }

        this.__nextTime = time;
      }
    }

    /**
     * Scheduler current logical time.
     *
     * @name currentTime
     * @type {Number}
     * @memberof Scheduler
     * @instance
     */

  }, {
    key: 'currentTime',
    get: function get() {
      if (this.master) return this.master.currentTime;

      return this.__currentTime || this.audioContext.currentTime + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }

    // inherited from scheduling queue
    /**
     * Add a TimeEngine or a simple callback function to the scheduler at an
     * optionally given time. Whether the add method is called with a TimeEngine
     * or a callback function it returns a TimeEngine that can be used as argument
     * of the methods remove and resetEngineTime. A TimeEngine added to a scheduler
     * has to implement the scheduled interface. The callback function added to a
     * scheduler will be called at the given time and with the given time as
     * argument. The callback can return a new scheduling time (i.e. the next
     * time when it will be called) or it can return Infinity to suspend scheduling
     * without removing the function from the scheduler. A function that does
     * not return a value (or returns null or 0) is removed from the scheduler
     * and cannot be used as argument of the methods remove and resetEngineTime
     * anymore.
     *
     * @name add
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine|Function} engine - Engine to add to the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    /**
     * Remove a TimeEngine from the scheduler that has been added to the
     * scheduler using the add method.
     *
     * @name add
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine} engine - Engine to remove from the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    /**
     * Reschedule a scheduled time engine at a given time.
     *
     * @name resetEngineTime
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine} engine - Engine to reschedule
     * @param {Number} time - Schedule time
     */
    /**
     * Remove all scheduled callbacks and engines from the scheduler.
     *
     * @name clear
     * @function
     * @memberof Scheduler
     * @instance
     */

  }]);
  return Scheduler;
}(_schedulingQueue2.default);

exports.default = Scheduler;

},{"../core/audio-context":1,"../core/scheduling-queue":4,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30,"debug":133}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('wavesjs:audio');

/**
 *
 *
 *
 * The SimpleScheduler class implements a simplified master for time engines
 * (see TimeEngine or AudioTimeEngine) that implement the scheduled interface
 * such as the Metronome and the GranularEngine. The API and funtionalities of
 * the SimpleScheduler class are identical to the Scheduler class. But, other
 * than the Scheduler, the SimpleScheduler class does not guarantee the order
 * of events (i.e. calls to the advanceTime method of scheduled time engines
 * and to scheduled callback functions) within a scheduling period (see period
 * attribute).
 *
 * To get a unique instance of SimpleScheduler as the global scheduler of an
 * application, the getSimpleScheduler factory function should be used. The
 * function accepts an audio context as optional argument and uses the Waves
 * default audio context (see Audio Context) as default. The factory creates
 * a single (simple) scheduler for each audio context.
 *
 * Example that shows three Metronome engines running in a SimpleScheduler:
 * {@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/simple-scheduler.html}
 *
 * @param {Object} [options={}] - default options
 * @param {Number} [options.period=0.025] - period of the scheduler.
 * @param {Number} [options.lookahead=0.1] - lookahead of the scheduler.
 *
 * @see TimeEngine
 * @see AudioTimeEngine
 * @see getSimpleScheduler
 * @see Scheduler
 *
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getSimpleScheduler();
 *
 * scheduler.add(myEngine);
 */

var SimpleScheduler = function () {
  function SimpleScheduler() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, SimpleScheduler);

    this.audioContext = options.audioContext || _audioContext2.default;

    this.__engines = new _set2.default();

    this.__schedEngines = [];
    this.__schedTimes = [];

    this.__currentTime = null;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     * @name period
     * @memberof Scheduler
     * @instance
     */
    this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     * @name lookahead
     * @memberof Scheduler
     * @instance
     */
    this.lookahead = options.lookahead || 0.1;
  }

  (0, _createClass3.default)(SimpleScheduler, [{
    key: '__scheduleEngine',
    value: function __scheduleEngine(engine, time) {
      this.__schedEngines.push(engine);
      this.__schedTimes.push(time);
    }
  }, {
    key: '__rescheduleEngine',
    value: function __rescheduleEngine(engine, time) {
      var index = this.__schedEngines.indexOf(engine);

      if (index >= 0) {
        if (time !== Infinity) {
          this.__schedTimes[index] = time;
        } else {
          this.__schedEngines.splice(index, 1);
          this.__schedTimes.splice(index, 1);
        }
      } else if (time < Infinity) {
        this.__schedEngines.push(engine);
        this.__schedTimes.push(time);
      }
    }
  }, {
    key: '__unscheduleEngine',
    value: function __unscheduleEngine(engine) {
      var index = this.__schedEngines.indexOf(engine);

      if (index >= 0) {
        this.__schedEngines.splice(index, 1);
        this.__schedTimes.splice(index, 1);
      }
    }
  }, {
    key: '__resetTick',
    value: function __resetTick() {
      if (this.__schedEngines.length > 0) {
        if (!this.__timeout) {
          log('SimpleScheduler Start');
          this.__tick();
        }
      } else if (this.__timeout) {
        log('SimpleScheduler Stop');
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }
    }
  }, {
    key: '__tick',
    value: function __tick() {
      var _this = this;

      var audioContext = this.audioContext;
      var currentTime = audioContext.currentTime;
      var i = 0;

      while (i < this.__schedEngines.length) {
        var engine = this.__schedEngines[i];
        var time = this.__schedTimes[i];

        while (time && time <= currentTime + this.lookahead) {
          time = Math.max(time, currentTime);
          this.__currentTime = time;
          time = engine.advanceTime(time);
        }

        if (time && time < Infinity) {
          this.__schedTimes[i++] = time;
        } else {
          this.__unscheduleEngine(engine);

          // remove engine from scheduler
          if (!time) {
            engine.master = null;
            this.__engines.delete(engine);
          }
        }
      }

      this.__currentTime = null;
      this.__timeout = null;

      if (this.__schedEngines.length > 0) {
        this.__timeout = setTimeout(function () {
          _this.__tick();
        }, this.period * 1000);
      }
    }

    /**
     * Scheduler current logical time.
     *
     * @name currentTime
     * @type {Number}
     * @memberof Scheduler
     * @instance
     */

  }, {
    key: 'defer',


    // call a function at a given time
    /**
     * Defer the execution of a function at a given time.
     *
     * @param {Function} fun - Function to defer
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    value: function defer(fun) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime(time) {
          fun(time);
        } // make sur that the advanceTime method does not returm anything
      }, time);
    }

    /**
     * Add a TimeEngine function to the scheduler at an optionally given time.
     *
     * @param {TimeEngine} engine - Engine to add to the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!_timeEngine2.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      // set master and add to array
      engine.master = this;
      this.__engines.add(engine);

      // schedule engine
      this.__scheduleEngine(engine, time);
      this.__resetTick();
    }

    /**
     * Remove a TimeEngine from the scheduler that has been added to the
     * scheduler using the add method.
     *
     * @param {TimeEngine} engine - Engine to remove from the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */

  }, {
    key: 'remove',
    value: function remove(engine) {
      if (!engine.master || engine.master !== this) throw new Error("engine has not been added to this scheduler");

      // reset master and remove from array
      engine.master = null;
      this.__engines.delete(engine);

      // unschedule engine
      this.__unscheduleEngine(engine);
      this.__resetTick();
    }

    /**
     * Reschedule a scheduled time engine at a given time.
     *
     * @param {TimeEngine} engine - Engine to reschedule
     * @param {Number} time - Schedule time
     */

  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      this.__rescheduleEngine(engine, time);
      this.__resetTick();
    }

    /**
     * Check whether a given engine is scheduled.
     *
     * @param {TimeEngine} engine - Engine to check
     */

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }

    /**
     * Remove all engines from the scheduler.
     */

  }, {
    key: 'clear',
    value: function clear() {
      if (this.__timeout) {
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }

      this.__schedEngines.length = 0;
      this.__schedTimes.length = 0;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__currentTime || this.audioContext.currentTime + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return undefined;
    }
  }]);
  return SimpleScheduler;
}();

exports.default = SimpleScheduler;

},{"../core/audio-context":1,"../core/time-engine":5,"babel-runtime/core-js/set":22,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"debug":133}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _priorityQueue = require('../core/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _schedulingQueue = require('../core/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _factories = require('./factories');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addDuplet(firstArray, secondArray, firstElement, secondElement) {
  firstArray.push(firstElement);
  secondArray.push(secondElement);
}

function removeDuplet(firstArray, secondArray, firstElement) {
  var index = firstArray.indexOf(firstElement);

  if (index >= 0) {
    var secondElement = secondArray[index];

    firstArray.splice(index, 1);
    secondArray.splice(index, 1);

    return secondElement;
  }

  return null;
}

// The Transported call is the base class of the adapters between
// different types of engines (i.e. transported, scheduled, play-controlled)
// The adapters are at the same time masters for the engines added to the transport
// and transported TimeEngines inserted into the transport's position-based pritority queue.

var Transported = function (_TimeEngine) {
  (0, _inherits3.default)(Transported, _TimeEngine);

  function Transported(transport, engine, start, duration, offset) {
    var stretch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    (0, _classCallCheck3.default)(this, Transported);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Transported.__proto__ || (0, _getPrototypeOf2.default)(Transported)).call(this));

    _this.master = transport;

    _this.__engine = engine;
    engine.master = _this;

    _this.__startPosition = start;
    _this.__endPosition = !isFinite(duration) ? Infinity : start + duration;
    _this.__offsetPosition = start + offset;
    _this.__stretchPosition = stretch;
    _this.__isRunning = false;
    return _this;
  }

  (0, _createClass3.default)(Transported, [{
    key: 'setBoundaries',
    value: function setBoundaries(start, duration) {
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var stretch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      this.__startPosition = start;
      this.__endPosition = start + duration;
      this.__offsetPosition = start + offset;
      this.__stretchPosition = stretch;
      this.resetPosition();
    }
  }, {
    key: 'start',
    value: function start(time, position, speed) {}
  }, {
    key: 'stop',
    value: function stop(time, position) {}
  }, {
    key: 'resetPosition',
    value: function resetPosition(position) {
      if (position !== undefined) position += this.__offsetPosition;

      this.master.resetEnginePosition(this, position);
    }
  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (speed > 0) {
        if (position < this.__startPosition) {

          if (this.__isRunning) this.stop(time, position - this.__offsetPosition);

          this.__isRunning = false;
          return this.__startPosition;
        } else if (position < this.__endPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__isRunning = true;
          return this.__endPosition;
        }
      } else {
        if (position > this.__endPosition) {
          if (this.__isRunning) // if engine is running
            this.stop(time, position - this.__offsetPosition);

          this.__isRunning = false;
          return this.__endPosition;
        } else if (position > this.__startPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__isRunning = true;
          return this.__startPosition;
        }
      }

      if (this.__isRunning) // if engine is running
        this.stop(time, position);

      this.__isRunning = false;
      return Infinity * speed;
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      if (!this.__isRunning) {
        this.start(time, position - this.__offsetPosition, speed);
        this.__isRunning = true;

        if (speed > 0) return this.__endPosition;

        return this.__startPosition;
      }

      // stop engine
      this.stop(time, position - this.__offsetPosition);

      this.__isRunning = false;
      return Infinity * speed;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (speed === 0) // stop
        this.stop(time, position - this.__offsetPosition);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.master = null;

      this.__engine.master = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.master.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.master.currentPosition - this.__offsetPosition;
    }
  }]);
  return Transported;
}(_timeEngine2.default);

// TransportedTransported
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position


var TransportedTransported = function (_Transported) {
  (0, _inherits3.default)(TransportedTransported, _Transported);

  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedTransported);
    return (0, _possibleConstructorReturn3.default)(this, (TransportedTransported.__proto__ || (0, _getPrototypeOf2.default)(TransportedTransported)).call(this, transport, engine, startPosition, endPosition, offsetPosition));
  }

  (0, _createClass3.default)(TransportedTransported, [{
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (speed > 0 && position < this.__endPosition) position = Math.max(position, this.__startPosition);else if (speed < 0 && position >= this.__startPosition) position = Math.min(position, this.__endPosition);

      return this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

      if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition) return position;

      return Infinity * speed;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(engine) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      if (position !== undefined) position += this.__offsetPosition;

      this.resetPosition(position);
    }
  }]);
  return TransportedTransported;
}(Transported);

// TransportedSpeedControlled
// has to start and stop the speed-controlled engines when the transport hits the engine's start and end position


var TransportedSpeedControlled = function (_Transported2) {
  (0, _inherits3.default)(TransportedSpeedControlled, _Transported2);

  function TransportedSpeedControlled(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedSpeedControlled);
    return (0, _possibleConstructorReturn3.default)(this, (TransportedSpeedControlled.__proto__ || (0, _getPrototypeOf2.default)(TransportedSpeedControlled)).call(this, transport, engine, startPosition, endPosition, offsetPosition));
  }

  (0, _createClass3.default)(TransportedSpeedControlled, [{
    key: 'start',
    value: function start(time, position, speed) {
      this.__engine.syncSpeed(time, position, speed, true);
    }
  }, {
    key: 'stop',
    value: function stop(time, position) {
      this.__engine.syncSpeed(time, position, 0);
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (this.__isRunning) this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__engine.syncSpeed(this.master.currentTime, this.master.currentPosition - this.__offsetPosition, 0);
      (0, _get3.default)(TransportedSpeedControlled.prototype.__proto__ || (0, _getPrototypeOf2.default)(TransportedSpeedControlled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedSpeedControlled;
}(Transported);

// TransportedScheduled
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position


var TransportedScheduled = function (_Transported3) {
  (0, _inherits3.default)(TransportedScheduled, _Transported3);

  function TransportedScheduled(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedScheduled);

    // scheduling queue becomes master of engine
    var _this4 = (0, _possibleConstructorReturn3.default)(this, (TransportedScheduled.__proto__ || (0, _getPrototypeOf2.default)(TransportedScheduled)).call(this, transport, engine, startPosition, endPosition, offsetPosition));

    engine.master = null;
    transport.__schedulingQueue.add(engine, Infinity);
    return _this4;
  }

  (0, _createClass3.default)(TransportedScheduled, [{
    key: 'start',
    value: function start(time, position, speed) {
      this.master.__schedulingQueue.resetEngineTime(this.__engine, time);
    }
  }, {
    key: 'stop',
    value: function stop(time, position) {
      this.master.__schedulingQueue.resetEngineTime(this.__engine, Infinity);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.master.__schedulingQueue.remove(this.__engine);
      (0, _get3.default)(TransportedScheduled.prototype.__proto__ || (0, _getPrototypeOf2.default)(TransportedScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedScheduled;
}(Transported);

// translates advancePosition of *transported* engines into global scheduler times


var TransportSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(TransportSchedulerHook, _TimeEngine2);

  function TransportSchedulerHook(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (TransportSchedulerHook.__proto__ || (0, _getPrototypeOf2.default)(TransportSchedulerHook)).call(this));

    _this5.__transport = transport;

    _this5.__nextPosition = Infinity;
    _this5.__nextTime = Infinity;
    transport.__scheduler.add(_this5, Infinity);
    return _this5;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(TransportSchedulerHook, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var transport = this.__transport;
      var position = this.__nextPosition;
      var speed = transport.__speed;
      var nextPosition = transport.advancePosition(time, position, speed);
      var nextTime = transport.__getTimeAtPosition(nextPosition);

      this.__nextPosition = nextPosition;
      this.__nextTime = nextTime;

      return nextTime;
    }
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.__nextPosition;

      var transport = this.__transport;
      var time = transport.__getTimeAtPosition(position);

      this.__nextPosition = position;
      this.__nextTime = time;

      this.resetTime(time);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__transport.__scheduler.remove(this);
      this.__transport = null;
    }
  }]);
  return TransportSchedulerHook;
}(_timeEngine2.default);

// internal scheduling queue that returns the current position (and time) of the play control


var TransportSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(TransportSchedulingQueue, _SchedulingQueue);

  function TransportSchedulingQueue(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (TransportSchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(TransportSchedulingQueue)).call(this));

    _this6.__transport = transport;
    transport.__scheduler.add(_this6, Infinity);
    return _this6;
  }

  (0, _createClass3.default)(TransportSchedulingQueue, [{
    key: 'destroy',
    value: function destroy() {
      this.__transport.__scheduler.remove(this);
      this.__transport = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__transport.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__transport.currentPosition;
    }
  }]);
  return TransportSchedulingQueue;
}(_schedulingQueue2.default);

/**
 * Provides synchronized scheduling of Time Engine instances.
 *
 * [example]{@link https://cdn.rawgit.com/wavesjs/waves-audio/master/examples/transport.html}
 *
 * @example
 * import * as audio from 'waves-audio';
 * const transport = audio.Transport();
 * const playControl = new audio.PlayControl(transport);
 * const myEngine = new MyEngine();
 * const yourEngine = new yourEngine();
 *
 * transport.add(myEngine);
 * transport.add(yourEngine);
 *
 * playControl.start();
 */


var Transport = function (_TimeEngine3) {
  (0, _inherits3.default)(Transport, _TimeEngine3);

  function Transport() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Transport);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this));

    _this7.audioContext = options.audioContext || _audioContext2.default;

    _this7.__engines = [];
    _this7.__transported = [];

    _this7.__scheduler = (0, _factories.getScheduler)(_this7.audioContext);
    _this7.__schedulerHook = new TransportSchedulerHook(_this7);
    _this7.__transportedQueue = new _priorityQueue2.default();
    _this7.__schedulingQueue = new TransportSchedulingQueue(_this7);

    // syncronized time, position, and speed
    _this7.__time = 0;
    _this7.__position = 0;
    _this7.__speed = 0;
    return _this7;
  }

  (0, _createClass3.default)(Transport, [{
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      return this.__time + (position - this.__position) / this.__speed;
    }
  }, {
    key: '__getPositionAtTime',
    value: function __getPositionAtTime(time) {
      return this.__position + (time - this.__time) * this.__speed;
    }
  }, {
    key: '__syncTransportedPosition',
    value: function __syncTransportedPosition(time, position, speed) {
      var numTransportedEngines = this.__transported.length;
      var nextPosition = Infinity * speed;

      if (numTransportedEngines > 0) {
        this.__transportedQueue.clear();
        this.__transportedQueue.reverse = speed < 0;

        for (var i = 0; i < numTransportedEngines; i++) {
          var engine = this.__transported[i];
          var nextEnginePosition = engine.syncPosition(time, position, speed);
          this.__transportedQueue.insert(engine, nextEnginePosition);
        }

        nextPosition = this.__transportedQueue.time;
      }

      return nextPosition;
    }
  }, {
    key: '__syncTransportedSpeed',
    value: function __syncTransportedSpeed(time, position, speed) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.__transported), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var transported = _step.value;

          transported.syncSpeed(time, position, speed);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Get current master time. This getter will be replaced when the transport
     * is added to a master (i.e. transport or play-control).
     *
     * @type {Number}
     * @name currentTime
     * @memberof Transport
     * @instance
     * @readonly
     */

  }, {
    key: 'resetPosition',


    /**
     * Reset next transport position
     *
     * @param {Number} next - transport position
     */
    value: function resetPosition(position) {
      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this, position);else this.__schedulerHook.resetPosition(position);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     */

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      return this.__syncTransportedPosition(time, position, speed);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     */

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var engine = this.__transportedQueue.head;
      var nextEnginePosition = engine.advancePosition(time, position, speed);
      return this.__transportedQueue.move(engine, nextEnginePosition);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     * @param {Boolean} [seek=false]
     */

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var lastSpeed = this.__speed;

      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      if (speed !== lastSpeed || seek && speed !== 0) {
        var nextPosition = void 0;

        // resync transported engines
        if (seek || speed * lastSpeed < 0) {
          // seek or reverse direction
          nextPosition = this.__syncTransportedPosition(time, position, speed);
        } else if (lastSpeed === 0) {
          // start
          nextPosition = this.__syncTransportedPosition(time, position, speed);
        } else if (speed === 0) {
          // stop
          nextPosition = Infinity;
          this.__syncTransportedSpeed(time, position, 0);
        } else {
          // change speed without reversing direction
          this.__syncTransportedSpeed(time, position, speed);
        }

        this.resetPosition(nextPosition);
      }
    }

    /**
     * Add a time engine to the transport.
     *
     * @param {Object} engine - engine to be added to the transport
     * @param {Number} position - start position
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var startPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var endPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
      var offsetPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

      var transported = null;

      if (offsetPosition === -Infinity) offsetPosition = 0;

      if (engine.master) throw new Error("object has already been added to a master");

      if (_timeEngine2.default.implementsTransported(engine)) transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);else if (_timeEngine2.default.implementsSpeedControlled(engine)) transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);else if (_timeEngine2.default.implementsScheduled(engine)) transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);else throw new Error("object cannot be added to a transport");

      if (transported) {
        var speed = this.__speed;

        addDuplet(this.__engines, this.__transported, engine, transported);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = transported.syncPosition(this.currentTime, this.currentPosition, speed);
          var nextPosition = this.__transportedQueue.insert(transported, nextEnginePosition);

          this.resetPosition(nextPosition);
        }
      }

      return transported;
    }

    /**
     * Remove a time engine from the transport.
     *
     * @param {object} engineOrTransported - engine or transported to be removed from the transport
     */

  }, {
    key: 'remove',
    value: function remove(engineOrTransported) {
      var engine = engineOrTransported;
      var transported = removeDuplet(this.__engines, this.__transported, engineOrTransported);

      if (!transported) {
        engine = removeDuplet(this.__transported, this.__engines, engineOrTransported);
        transported = engineOrTransported;
      }

      if (engine && transported) {
        var nextPosition = this.__transportedQueue.remove(transported);

        transported.destroy();

        if (this.__speed !== 0) this.resetPosition(nextPosition);
      } else {
        throw new Error("object has not been added to this transport");
      }
    }

    /**
     * Reset position of the given engine.
     *
     * @param {TimeEngine} transported - Engine to reset
     * @param {Number} position - New position
     */

  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(transported) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      var speed = this.__speed;

      if (speed !== 0) {
        if (position === undefined) position = transported.syncPosition(this.currentTime, this.currentPosition, speed);

        var nextPosition = this.__transportedQueue.move(transported, position);
        this.resetPosition(nextPosition);
      }
    }

    /**
     * Remove all time engines from the transport.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.syncSpeed(this.currentTime, this.currentPosition, 0);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this.__transported), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var transported = _step2.value;

          transported.destroy();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__scheduler.currentTime;
    }

    /**
     * Get current master position. This getter will be replaced when the transport
     * is added to a master (i.e. transport or play-control).
     *
     * @type {Number}
     * @name currentPosition
     * @memberof Transport
     * @instance
     * @readonly
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }
  }]);
  return Transport;
}(_timeEngine2.default);

exports.default = Transport;

},{"../core/audio-context":1,"../core/priority-queue":3,"../core/scheduling-queue":4,"../core/time-engine":5,"./factories":11,"babel-runtime/core-js/get-iterator":16,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":32}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":33}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":34}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":35}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":36}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":37}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":38}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":39}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":40}],25:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/weak-map"), __esModule: true };
},{"core-js/library/fn/weak-map":41}],26:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],27:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":18}],28:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("../core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("../core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"../core-js/object/get-own-property-descriptor":19,"../core-js/object/get-prototype-of":20}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":17,"../core-js/object/set-prototype-of":21,"../helpers/typeof":31}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":31}],31:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":23,"../core-js/symbol/iterator":24}],32:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":117,"../modules/es6.string.iterator":126,"../modules/web.dom.iterable":132}],33:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};
},{"../../modules/_core":57,"../../modules/es6.object.create":119}],34:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":57,"../../modules/es6.object.define-property":120}],35:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key){
  return $Object.getOwnPropertyDescriptor(it, key);
};
},{"../../modules/_core":57,"../../modules/es6.object.get-own-property-descriptor":121}],36:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;
},{"../../modules/_core":57,"../../modules/es6.object.get-prototype-of":122}],37:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;
},{"../../modules/_core":57,"../../modules/es6.object.set-prototype-of":123}],38:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
module.exports = require('../modules/_core').Set;
},{"../modules/_core":57,"../modules/es6.object.to-string":124,"../modules/es6.set":125,"../modules/es6.string.iterator":126,"../modules/es7.set.to-json":129,"../modules/web.dom.iterable":132}],39:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":57,"../../modules/es6.object.to-string":124,"../../modules/es6.symbol":127,"../../modules/es7.symbol.async-iterator":130,"../../modules/es7.symbol.observable":131}],40:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');
},{"../../modules/_wks-ext":114,"../../modules/es6.string.iterator":126,"../../modules/web.dom.iterable":132}],41:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/web.dom.iterable');
require('../modules/es6.weak-map');
module.exports = require('../modules/_core').WeakMap;
},{"../modules/_core":57,"../modules/es6.object.to-string":124,"../modules/es6.weak-map":128,"../modules/web.dom.iterable":132}],42:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],43:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],44:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],45:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":75}],46:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":66}],47:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":106,"./_to-iobject":108,"./_to-length":109}],48:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./_ctx')
  , IObject  = require('./_iobject')
  , toObject = require('./_to-object')
  , toLength = require('./_to-length')
  , asc      = require('./_array-species-create');
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./_array-species-create":50,"./_ctx":58,"./_iobject":72,"./_to-length":109,"./_to-object":110}],49:[function(require,module,exports){
var isObject = require('./_is-object')
  , isArray  = require('./_is-array')
  , SPECIES  = require('./_wks')('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"./_is-array":74,"./_is-object":75,"./_wks":115}],50:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"./_array-species-constructor":49}],51:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":52,"./_wks":115}],52:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],53:[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":44,"./_ctx":58,"./_defined":59,"./_descriptors":60,"./_for-of":66,"./_iter-define":78,"./_iter-step":79,"./_meta":83,"./_object-create":85,"./_object-dp":86,"./_redefine-all":98,"./_set-species":101}],54:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof')
  , from    = require('./_array-from-iterable');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"./_array-from-iterable":46,"./_classof":51}],55:[function(require,module,exports){
'use strict';
var redefineAll       = require('./_redefine-all')
  , getWeak           = require('./_meta').getWeak
  , anObject          = require('./_an-object')
  , isObject          = require('./_is-object')
  , anInstance        = require('./_an-instance')
  , forOf             = require('./_for-of')
  , createArrayMethod = require('./_array-methods')
  , $has              = require('./_has')
  , arrayFind         = createArrayMethod(5)
  , arrayFindIndex    = createArrayMethod(6)
  , id                = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function(that){
  return that._l || (that._l = new UncaughtFrozenStore);
};
var UncaughtFrozenStore = function(){
  this.a = [];
};
var findUncaughtFrozen = function(store, key){
  return arrayFind(store.a, function(it){
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function(key){
    var entry = findUncaughtFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findUncaughtFrozen(this, key);
  },
  set: function(key, value){
    var entry = findUncaughtFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = arrayFindIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var data = getWeak(anObject(key), true);
    if(data === true)uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};
},{"./_an-instance":44,"./_an-object":45,"./_array-methods":48,"./_for-of":66,"./_has":68,"./_is-object":75,"./_meta":83,"./_redefine-all":98}],56:[function(require,module,exports){
'use strict';
var global         = require('./_global')
  , $export        = require('./_export')
  , meta           = require('./_meta')
  , fails          = require('./_fails')
  , hide           = require('./_hide')
  , redefineAll    = require('./_redefine-all')
  , forOf          = require('./_for-of')
  , anInstance     = require('./_an-instance')
  , isObject       = require('./_is-object')
  , setToStringTag = require('./_set-to-string-tag')
  , dP             = require('./_object-dp').f
  , each           = require('./_array-methods')(0)
  , DESCRIPTORS    = require('./_descriptors');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function(target, iterable){
      anInstance(target, C, NAME, '_c');
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        anInstance(this, C, KEY);
        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    if('size' in proto)dP(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":44,"./_array-methods":48,"./_descriptors":60,"./_export":64,"./_fails":65,"./_for-of":66,"./_global":67,"./_hide":69,"./_is-object":75,"./_meta":83,"./_object-dp":86,"./_redefine-all":98,"./_set-to-string-tag":102}],57:[function(require,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],58:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":42}],59:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],60:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":65}],61:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":67,"./_is-object":75}],62:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],63:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":91,"./_object-keys":94,"./_object-pie":95}],64:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":57,"./_ctx":58,"./_global":67,"./_hide":69}],65:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],66:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method')
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":45,"./_ctx":58,"./_is-array-iter":73,"./_iter-call":76,"./_to-length":109,"./core.get-iterator-method":116}],67:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],68:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],69:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":60,"./_object-dp":86,"./_property-desc":97}],70:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":67}],71:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":60,"./_dom-create":61,"./_fails":65}],72:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":52}],73:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":80,"./_wks":115}],74:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":52}],75:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],76:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":45}],77:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":69,"./_object-create":85,"./_property-desc":97,"./_set-to-string-tag":102,"./_wks":115}],78:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":64,"./_has":68,"./_hide":69,"./_iter-create":77,"./_iterators":80,"./_library":82,"./_object-gpo":92,"./_redefine":99,"./_set-to-string-tag":102,"./_wks":115}],79:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],80:[function(require,module,exports){
module.exports = {};
},{}],81:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":94,"./_to-iobject":108}],82:[function(require,module,exports){
module.exports = true;
},{}],83:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":65,"./_has":68,"./_is-object":75,"./_object-dp":86,"./_uid":112}],84:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":65,"./_iobject":72,"./_object-gops":91,"./_object-keys":94,"./_object-pie":95,"./_to-object":110}],85:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":45,"./_dom-create":61,"./_enum-bug-keys":62,"./_html":70,"./_object-dps":87,"./_shared-key":103}],86:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":45,"./_descriptors":60,"./_ie8-dom-define":71,"./_to-primitive":111}],87:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":45,"./_descriptors":60,"./_object-dp":86,"./_object-keys":94}],88:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":60,"./_has":68,"./_ie8-dom-define":71,"./_object-pie":95,"./_property-desc":97,"./_to-iobject":108,"./_to-primitive":111}],89:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":90,"./_to-iobject":108}],90:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":62,"./_object-keys-internal":93}],91:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],92:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":68,"./_shared-key":103,"./_to-object":110}],93:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":47,"./_has":68,"./_shared-key":103,"./_to-iobject":108}],94:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":62,"./_object-keys-internal":93}],95:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],96:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":57,"./_export":64,"./_fails":65}],97:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],98:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":69}],99:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":69}],100:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":45,"./_ctx":58,"./_is-object":75,"./_object-gopd":88}],101:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":57,"./_descriptors":60,"./_global":67,"./_object-dp":86,"./_wks":115}],102:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":68,"./_object-dp":86,"./_wks":115}],103:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":104,"./_uid":112}],104:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":67}],105:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":59,"./_to-integer":107}],106:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":107}],107:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],108:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":59,"./_iobject":72}],109:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":107}],110:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":59}],111:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":75}],112:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],113:[function(require,module,exports){
var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"./_core":57,"./_global":67,"./_library":82,"./_object-dp":86,"./_wks-ext":114}],114:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":115}],115:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"./_global":67,"./_shared":104,"./_uid":112}],116:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":51,"./_core":57,"./_iterators":80,"./_wks":115}],117:[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":45,"./_core":57,"./core.get-iterator-method":116}],118:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":43,"./_iter-define":78,"./_iter-step":79,"./_iterators":80,"./_to-iobject":108}],119:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":64,"./_object-create":85}],120:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":60,"./_export":64,"./_object-dp":86}],121:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = require('./_to-iobject')
  , $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./_object-gopd":88,"./_object-sap":96,"./_to-iobject":108}],122:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":92,"./_object-sap":96,"./_to-object":110}],123:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":64,"./_set-proto":100}],124:[function(require,module,exports){

},{}],125:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.2 Set Objects
module.exports = require('./_collection')('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./_collection":56,"./_collection-strong":53}],126:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":78,"./_string-at":105}],127:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , wksExt         = require('./_wks-ext')
  , wksDefine      = require('./_wks-define')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , $keys          = require('./_object-keys')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":45,"./_descriptors":60,"./_enum-keys":63,"./_export":64,"./_fails":65,"./_global":67,"./_has":68,"./_hide":69,"./_is-array":74,"./_keyof":81,"./_library":82,"./_meta":83,"./_object-create":85,"./_object-dp":86,"./_object-gopd":88,"./_object-gopn":90,"./_object-gopn-ext":89,"./_object-gops":91,"./_object-keys":94,"./_object-pie":95,"./_property-desc":97,"./_redefine":99,"./_set-to-string-tag":102,"./_shared":104,"./_to-iobject":108,"./_to-primitive":111,"./_uid":112,"./_wks":115,"./_wks-define":113,"./_wks-ext":114}],128:[function(require,module,exports){
'use strict';
var each         = require('./_array-methods')(0)
  , redefine     = require('./_redefine')
  , meta         = require('./_meta')
  , assign       = require('./_object-assign')
  , weak         = require('./_collection-weak')
  , isObject     = require('./_is-object')
  , getWeak      = meta.getWeak
  , isExtensible = Object.isExtensible
  , uncaughtFrozenStore = weak.ufstore
  , tmp          = {}
  , InternalMap;

var wrapper = function(get){
  return function WeakMap(){
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      var data = getWeak(key);
      if(data === true)return uncaughtFrozenStore(this).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('./_collection')('WeakMap', wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  InternalMap = weak.getConstructor(wrapper);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    redefine(proto, key, function(a, b){
      // store frozen objects on internal weakmap shim
      if(isObject(a) && !isExtensible(a)){
        if(!this._f)this._f = new InternalMap;
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./_array-methods":48,"./_collection":56,"./_collection-weak":55,"./_is-object":75,"./_meta":83,"./_object-assign":84,"./_redefine":99}],129:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Set', {toJSON: require('./_collection-to-json')('Set')});
},{"./_collection-to-json":54,"./_export":64}],130:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":113}],131:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":113}],132:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":67,"./_hide":69,"./_iterators":80,"./_wks":115,"./es6.array.iterator":118}],133:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))

},{"./debug":134,"_process":136}],134:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":135}],135:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],136:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2NvcmUvYXVkaW8tY29udGV4dC5qcyIsImRpc3QvY29yZS9hdWRpby10aW1lLWVuZ2luZS5qcyIsImRpc3QvY29yZS9wcmlvcml0eS1xdWV1ZS5qcyIsImRpc3QvY29yZS9zY2hlZHVsaW5nLXF1ZXVlLmpzIiwiZGlzdC9jb3JlL3RpbWUtZW5naW5lLmpzIiwiZGlzdC9lbmdpbmVzL2dyYW51bGFyLWVuZ2luZS5qcyIsImRpc3QvZW5naW5lcy9tZXRyb25vbWUuanMiLCJkaXN0L2VuZ2luZXMvcGxheWVyLWVuZ2luZS5qcyIsImRpc3QvZW5naW5lcy9zZWdtZW50LWVuZ2luZS5qcyIsImRpc3QvaW5kZXguanMiLCJkaXN0L21hc3RlcnMvZmFjdG9yaWVzLmpzIiwiZGlzdC9tYXN0ZXJzL3BsYXktY29udHJvbC5qcyIsImRpc3QvbWFzdGVycy9zY2hlZHVsZXIuanMiLCJkaXN0L21hc3RlcnMvc2ltcGxlLXNjaGVkdWxlci5qcyIsImRpc3QvbWFzdGVycy90cmFuc3BvcnQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy93ZWFrLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2NyZWF0ZUNsYXNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9nZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2luaGVyaXRzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zZXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2l0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi93ZWFrLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1mcm9tLWl0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktc3BlY2llcy1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi13ZWFrLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2V4cG9ydC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Zvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2h0bWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS1pdGVyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWNhbGwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1zdGVwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2tleW9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19saWJyYXJ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19tZXRhLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdwby5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtcGllLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qtc2FwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19yZWRlZmluZS1hbGwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy1leHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnNldC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LndlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zZXQudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcuc3ltYm9sLmFzeW5jLWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zeW1ib2wub2JzZXJ2YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9kZWJ1Zy5qcyIsIm5vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQ0FBLElBQU0sZUFBZSxPQUFPLFlBQVAsSUFBdUIsT0FBTyxrQkFBbkQ7O0FBRUE7Ozs7Ozs7Ozs7Ozs7OztBQWVBLElBQUksZUFBZSxJQUFuQjs7QUFFQSxJQUFJLFlBQUosRUFBa0I7QUFDaEIsaUJBQWUsSUFBSSxZQUFKLEVBQWY7O0FBRUEsTUFBSSxpQkFBaUIsSUFBakIsQ0FBc0IsVUFBVSxTQUFoQyxLQUE4QyxhQUFhLFVBQWIsR0FBMEIsS0FBNUUsRUFBbUY7QUFDakYsUUFBTSxTQUFTLGFBQWEsWUFBYixDQUEwQixDQUExQixFQUE2QixDQUE3QixFQUFnQyxLQUFoQyxDQUFmO0FBQ0EsUUFBTSxRQUFRLGFBQWEsa0JBQWIsRUFBZDtBQUNBLFVBQU0sTUFBTixHQUFlLE1BQWY7QUFDQSxVQUFNLE9BQU4sQ0FBYyxhQUFhLFdBQTNCO0FBQ0EsVUFBTSxLQUFOLENBQVksQ0FBWjtBQUNBLFVBQU0sVUFBTjtBQUNEO0FBQ0Y7O2tCQUVjLFk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDaENmOzs7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJNLGU7OztBQUNKLDZCQUFnRDtBQUFBLFFBQXBDLFlBQW9DO0FBQUE7O0FBRzlDOzs7Ozs7OztBQUg4Qzs7QUFXOUMsVUFBSyxZQUFMLEdBQW9CLFlBQXBCOztBQUVBOzs7Ozs7Ozs7QUFTQSxVQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUF0QjhDO0FBdUIvQzs7QUFFRDs7Ozs7Ozs7OzRCQUtRLE0sRUFBUTtBQUNkLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixNQUF4QjtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7K0JBTVcsVSxFQUFZO0FBQ3JCLFdBQUssVUFBTCxDQUFnQixVQUFoQixDQUEyQixVQUEzQjtBQUNBLGFBQU8sSUFBUDtBQUNEOzs7OztrQkFHWSxlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEVmO0FBQ0EsU0FBUyxJQUFULENBQWMsR0FBZCxFQUFtQixFQUFuQixFQUF1QixFQUF2QixFQUEyQjtBQUN6QixNQUFNLE1BQU0sSUFBSSxFQUFKLENBQVo7QUFDQSxNQUFJLEVBQUosSUFBVSxJQUFJLEVBQUosQ0FBVjtBQUNBLE1BQUksRUFBSixJQUFVLEdBQVY7QUFDRDs7QUFFRDtBQUNBLFNBQVMsT0FBVCxDQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQjtBQUN4QixNQUFNLElBQUksSUFBSSxNQUFkO0FBQ0E7QUFDQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEI7QUFDMUIsUUFBSSxJQUFJLENBQUosTUFBVyxFQUFmLEVBQW1CO0FBQ2pCLGFBQU8sQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxDQUFDLENBQVI7QUFDRDs7QUFFRDs7Ozs7Ozs7O0FBU0EsSUFBTSxrQkFBa0IsU0FBbEIsZUFBa0IsQ0FBUyxLQUFULEVBQWdCLEtBQWhCLEVBQXVCO0FBQzdDLFNBQU8sUUFBUSxLQUFmO0FBQ0QsQ0FGRDs7QUFJQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixDQUFTLEtBQVQsRUFBZ0IsS0FBaEIsRUFBdUI7QUFDN0MsU0FBTyxRQUFRLEtBQWY7QUFDRCxDQUZEOztBQUlBOzs7Ozs7Ozs7QUFTQSxJQUFNLG1CQUFtQixTQUFuQixnQkFBbUIsQ0FBUyxLQUFULEVBQWdCLEtBQWhCLEVBQXVCO0FBQzlDLFNBQU8sUUFBUSxLQUFmO0FBQ0QsQ0FGRDs7QUFJQSxJQUFNLG1CQUFtQixTQUFuQixnQkFBbUIsQ0FBUyxLQUFULEVBQWdCLEtBQWhCLEVBQXVCO0FBQzlDLFNBQU8sUUFBUSxLQUFmO0FBQ0QsQ0FGRDs7QUFJQSxJQUFNLG9CQUFvQixPQUFPLGlCQUFqQzs7QUFFQTs7Ozs7Ozs7Ozs7SUFVTSxhO0FBQ0osMkJBQThCO0FBQUEsUUFBbEIsVUFBa0IsdUVBQUwsR0FBSztBQUFBOztBQUM1Qjs7Ozs7OztBQU9BLFNBQUssY0FBTCxHQUFzQixDQUF0Qjs7QUFFQTs7Ozs7OztBQU9BLFNBQUssS0FBTCxHQUFhLElBQUksS0FBSixDQUFVLGFBQWEsQ0FBdkIsQ0FBYjs7QUFFQTs7Ozs7OztBQU9BLFNBQUssUUFBTCxHQUFnQixJQUFoQjs7QUFFQTtBQUNBLFNBQUssT0FBTCxHQUFlLEtBQWY7QUFDRDs7QUFFRDs7Ozs7Ozs7OztBQThDQTs7Ozs7OzhCQU1VLFUsRUFBWTtBQUNwQixVQUFJLFFBQVEsS0FBSyxLQUFMLENBQVcsVUFBWCxDQUFaOztBQUVBLFVBQUksUUFBUSxVQUFaO0FBQ0EsVUFBSSxjQUFjLEtBQUssS0FBTCxDQUFXLFFBQVEsQ0FBbkIsQ0FBbEI7QUFDQSxVQUFJLFNBQVMsS0FBSyxLQUFMLENBQVcsV0FBWCxDQUFiOztBQUVBLGFBQU8sVUFBVSxLQUFLLFNBQUwsQ0FBZSxNQUFNLFNBQXJCLEVBQWdDLE9BQU8sU0FBdkMsQ0FBakIsRUFBb0U7QUFDbEUsYUFBSyxLQUFLLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsV0FBeEI7O0FBRUEsZ0JBQVEsV0FBUjtBQUNBLHNCQUFjLEtBQUssS0FBTCxDQUFXLFFBQVEsQ0FBbkIsQ0FBZDtBQUNBLGlCQUFTLEtBQUssS0FBTCxDQUFXLFdBQVgsQ0FBVDtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7OztnQ0FNWSxVLEVBQVk7QUFDdEIsVUFBSSxRQUFRLEtBQUssS0FBTCxDQUFXLFVBQVgsQ0FBWjs7QUFFQSxVQUFJLFFBQVEsVUFBWjtBQUNBLFVBQUksVUFBVSxRQUFRLENBQXRCO0FBQ0EsVUFBSSxVQUFVLFVBQVUsQ0FBeEI7QUFDQSxVQUFJLFNBQVMsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFiO0FBQ0EsVUFBSSxTQUFTLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBYjs7QUFFQSxhQUFRLFVBQVUsS0FBSyxRQUFMLENBQWMsTUFBTSxTQUFwQixFQUErQixPQUFPLFNBQXRDLENBQVgsSUFDQyxVQUFVLEtBQUssUUFBTCxDQUFjLE1BQU0sU0FBcEIsRUFBK0IsT0FBTyxTQUF0QyxDQURsQixFQUVBO0FBQ0U7QUFDQSxZQUFJLG9CQUFKOztBQUVBLFlBQUksTUFBSixFQUNFLGNBQWMsS0FBSyxTQUFMLENBQWUsT0FBTyxTQUF0QixFQUFpQyxPQUFPLFNBQXhDLElBQXFELE9BQXJELEdBQStELE9BQTdFLENBREYsS0FHRSxjQUFjLE9BQWQ7O0FBRUYsYUFBSyxLQUFLLEtBQVYsRUFBaUIsS0FBakIsRUFBd0IsV0FBeEI7O0FBRUE7QUFDQSxnQkFBUSxXQUFSO0FBQ0Esa0JBQVUsUUFBUSxDQUFsQjtBQUNBLGtCQUFVLFVBQVUsQ0FBcEI7QUFDQSxpQkFBUyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQVQ7QUFDQSxpQkFBUyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQVQ7QUFDRDtBQUNGOztBQUVEOzs7Ozs7Z0NBR1k7QUFDVjtBQUNBO0FBQ0EsVUFBSSxXQUFXLEtBQUssS0FBTCxDQUFXLENBQUMsS0FBSyxjQUFMLEdBQXNCLENBQXZCLElBQTRCLENBQXZDLENBQWY7O0FBRUEsV0FBSyxJQUFJLElBQUksUUFBYixFQUF1QixJQUFJLENBQTNCLEVBQThCLEdBQTlCO0FBQ0UsYUFBSyxXQUFMLENBQWlCLENBQWpCO0FBREY7QUFFRDs7QUFFRDs7Ozs7Ozs7OzsyQkFPTyxLLEVBQU8sSSxFQUFNO0FBQ2xCLFVBQUksS0FBSyxHQUFMLENBQVMsSUFBVCxNQUFtQixpQkFBdkIsRUFBMEM7QUFDeEMsY0FBTSxTQUFOLEdBQWtCLElBQWxCO0FBQ0E7QUFDQSxhQUFLLEtBQUwsQ0FBVyxLQUFLLGNBQWhCLElBQWtDLEtBQWxDO0FBQ0E7QUFDQSxhQUFLLFNBQUwsQ0FBZSxLQUFLLGNBQXBCO0FBQ0EsYUFBSyxjQUFMLElBQXVCLENBQXZCOztBQUVBLGVBQU8sS0FBSyxJQUFaO0FBQ0Q7O0FBRUQsWUFBTSxTQUFOLEdBQWtCLFNBQWxCO0FBQ0EsYUFBTyxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozt5QkFPSyxLLEVBQU8sSSxFQUFNO0FBQ2hCLFVBQUksS0FBSyxHQUFMLENBQVMsSUFBVCxNQUFtQixpQkFBdkIsRUFBMEM7QUFDeEMsWUFBTSxRQUFRLFFBQVEsS0FBSyxLQUFiLEVBQW9CLEtBQXBCLENBQWQ7O0FBRUEsWUFBSSxVQUFVLENBQUMsQ0FBZixFQUFrQjtBQUNoQixnQkFBTSxTQUFOLEdBQWtCLElBQWxCO0FBQ0E7QUFDQSxjQUFNLFNBQVMsS0FBSyxLQUFMLENBQVcsS0FBSyxLQUFMLENBQVcsUUFBUSxDQUFuQixDQUFYLENBQWY7O0FBRUEsY0FBSSxVQUFVLEtBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsT0FBTyxTQUE1QixDQUFkLEVBQ0UsS0FBSyxTQUFMLENBQWUsS0FBZixFQURGLEtBR0UsS0FBSyxXQUFMLENBQWlCLEtBQWpCO0FBQ0g7O0FBRUQsZUFBTyxLQUFLLElBQVo7QUFDRDs7QUFFRCxZQUFNLFNBQU4sR0FBa0IsU0FBbEI7QUFDQSxhQUFPLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7MkJBTU8sSyxFQUFPO0FBQ1o7QUFDQSxVQUFNLFFBQVEsUUFBUSxLQUFLLEtBQWIsRUFBb0IsS0FBcEIsQ0FBZDs7QUFFQSxVQUFJLFVBQVUsQ0FBQyxDQUFmLEVBQWtCO0FBQ2hCLFlBQU0sWUFBWSxLQUFLLGNBQUwsR0FBc0IsQ0FBeEM7O0FBRUE7QUFDQSxZQUFJLFVBQVUsU0FBZCxFQUF5QjtBQUN2QjtBQUNBLGVBQUssS0FBTCxDQUFXLFNBQVgsSUFBd0IsU0FBeEI7QUFDQTtBQUNBLGVBQUssY0FBTCxHQUFzQixTQUF0Qjs7QUFFQSxpQkFBTyxLQUFLLElBQVo7QUFDRCxTQVBELE1BT087QUFDTDtBQUNBLGVBQUssS0FBSyxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCLFNBQXhCO0FBQ0E7QUFDQSxlQUFLLEtBQUwsQ0FBVyxTQUFYLElBQXdCLFNBQXhCOztBQUVBLGNBQUksVUFBVSxDQUFkLEVBQWlCO0FBQ2YsaUJBQUssV0FBTCxDQUFpQixDQUFqQjtBQUNELFdBRkQsTUFFTztBQUNMO0FBQ0EsZ0JBQU0sU0FBUSxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWQ7QUFDQSxnQkFBTSxTQUFTLEtBQUssS0FBTCxDQUFXLEtBQUssS0FBTCxDQUFXLFFBQVEsQ0FBbkIsQ0FBWCxDQUFmOztBQUVBLGdCQUFJLFVBQVUsS0FBSyxTQUFMLENBQWUsT0FBTSxTQUFyQixFQUFnQyxPQUFPLFNBQXZDLENBQWQsRUFDRSxLQUFLLFNBQUwsQ0FBZSxLQUFmLEVBREYsS0FHRSxLQUFLLFdBQUwsQ0FBaUIsS0FBakI7QUFDSDtBQUNGOztBQUVEO0FBQ0EsYUFBSyxjQUFMLEdBQXNCLFNBQXRCO0FBQ0Q7O0FBRUQsYUFBTyxLQUFLLElBQVo7QUFDRDs7QUFFRDs7Ozs7OzRCQUdRO0FBQ04sV0FBSyxjQUFMLEdBQXNCLENBQXRCO0FBQ0EsV0FBSyxLQUFMLEdBQWEsSUFBSSxLQUFKLENBQVUsS0FBSyxLQUFMLENBQVcsTUFBckIsQ0FBYjtBQUNEOztBQUVEOzs7Ozs7Ozs7d0JBTUksSyxFQUFPO0FBQ1QsYUFBTyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLEtBQW5CLE1BQThCLENBQUMsQ0FBdEM7QUFDRDs7O3dCQXJPVTtBQUNULFVBQUksS0FBSyxjQUFMLEdBQXNCLENBQTFCLEVBQ0UsT0FBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsU0FBckI7O0FBRUYsYUFBTyxRQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O3dCQUtXO0FBQ1QsYUFBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7O3NCQU1ZLEssRUFBTztBQUNqQixVQUFJLFVBQVUsS0FBSyxRQUFuQixFQUE2QjtBQUMzQixhQUFLLFFBQUwsR0FBZ0IsS0FBaEI7O0FBRUEsWUFBSSxLQUFLLFFBQUwsS0FBa0IsSUFBdEIsRUFBNEI7QUFDMUIsZUFBSyxRQUFMLEdBQWdCLGVBQWhCO0FBQ0EsZUFBSyxTQUFMLEdBQWlCLGdCQUFqQjtBQUNELFNBSEQsTUFHTztBQUNMLGVBQUssUUFBTCxHQUFnQixlQUFoQjtBQUNBLGVBQUssU0FBTCxHQUFpQixnQkFBakI7QUFDRDs7QUFFRCxhQUFLLFNBQUw7QUFDRDtBQUNGLEs7d0JBRWE7QUFDWixhQUFPLEtBQUssUUFBWjtBQUNEOzs7OztrQkFnTVksYTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZVZjs7OztBQUNBOzs7Ozs7QUFFQTs7OztBQVhBOzs7Ozs7OztJQWVNLGU7OztBQUNKLDZCQUFjO0FBQUE7O0FBQUE7O0FBR1osVUFBSyxPQUFMLEdBQWUsNkJBQWY7QUFDQSxVQUFLLFNBQUwsR0FBaUIsbUJBQWpCO0FBSlk7QUFLYjs7QUFFRDs7Ozs7Z0NBQ1ksSSxFQUFNO0FBQ2hCLFVBQU0sU0FBUyxLQUFLLE9BQUwsQ0FBYSxJQUE1QjtBQUNBLFVBQU0saUJBQWlCLE9BQU8sV0FBUCxDQUFtQixJQUFuQixDQUF2Qjs7QUFFQSxVQUFJLENBQUMsY0FBTCxFQUFxQjtBQUNuQixlQUFPLE1BQVAsR0FBZ0IsSUFBaEI7QUFDQSxhQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLE1BQXRCO0FBQ0EsYUFBSyxPQUFMLENBQWEsTUFBYixDQUFvQixNQUFwQjtBQUNELE9BSkQsTUFJTztBQUNMLGFBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFBMEIsY0FBMUI7QUFDRDs7QUFFRCxhQUFPLEtBQUssT0FBTCxDQUFhLElBQXBCO0FBQ0Q7O0FBRUQ7Ozs7OztBQUtBOzBCQUNNLEcsRUFBOEI7QUFBQSxVQUF6QixJQUF5Qix1RUFBbEIsS0FBSyxXQUFhOztBQUNsQyxVQUFJLEVBQUUsZUFBZSxRQUFqQixDQUFKLEVBQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSx1Q0FBVixDQUFOOztBQUVGLFdBQUssR0FBTCxDQUFTO0FBQ1AscUJBQWEscUJBQVMsSUFBVCxFQUFlO0FBQUUsY0FBSSxJQUFKO0FBQVksU0FEbkMsQ0FDcUM7QUFEckMsT0FBVCxFQUVHLElBRkg7QUFHRDs7QUFFRDs7Ozt3QkFDSSxNLEVBQWlDO0FBQUEsVUFBekIsSUFBeUIsdUVBQWxCLEtBQUssV0FBYTs7QUFDbkMsVUFBSSxDQUFDLHFCQUFXLG1CQUFYLENBQStCLE1BQS9CLENBQUwsRUFDRSxNQUFNLElBQUksS0FBSixDQUFVLHFDQUFWLENBQU47O0FBRUYsVUFBSSxPQUFPLE1BQVgsRUFDRSxNQUFNLElBQUksS0FBSixDQUFVLDJDQUFWLENBQU47O0FBRUYsYUFBTyxNQUFQLEdBQWdCLElBQWhCOztBQUVBO0FBQ0EsV0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQixNQUFuQjtBQUNBLFVBQU0sV0FBVyxLQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE1BQXBCLEVBQTRCLElBQTVCLENBQWpCOztBQUVBO0FBQ0EsV0FBSyxTQUFMLENBQWUsUUFBZjtBQUNEOztBQUVEOzs7OzJCQUNPLE0sRUFBUTtBQUNiLFVBQUksT0FBTyxNQUFQLEtBQWtCLElBQXRCLEVBQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSw2Q0FBVixDQUFOOztBQUVGLGFBQU8sTUFBUCxHQUFnQixJQUFoQjs7QUFFQTtBQUNBLFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBdEI7QUFDQSxVQUFNLFdBQVcsS0FBSyxPQUFMLENBQWEsTUFBYixDQUFvQixNQUFwQixDQUFqQjs7QUFFQTtBQUNBLFdBQUssU0FBTCxDQUFlLFFBQWY7QUFDRDs7QUFFRDs7OztvQ0FDZ0IsTSxFQUFpQztBQUFBLFVBQXpCLElBQXlCLHVFQUFsQixLQUFLLFdBQWE7O0FBQy9DLFVBQUksT0FBTyxNQUFQLEtBQWtCLElBQXRCLEVBQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSw2Q0FBVixDQUFOOztBQUVGLFVBQUksaUJBQUo7O0FBRUEsVUFBSSxLQUFLLE9BQUwsQ0FBYSxHQUFiLENBQWlCLE1BQWpCLENBQUosRUFDRSxXQUFXLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFBMEIsSUFBMUIsQ0FBWCxDQURGLEtBR0UsV0FBVyxLQUFLLE9BQUwsQ0FBYSxNQUFiLENBQW9CLE1BQXBCLEVBQTRCLElBQTVCLENBQVg7O0FBRUYsV0FBSyxTQUFMLENBQWUsUUFBZjtBQUNEOztBQUVEOzs7O3dCQUNJLE0sRUFBUTtBQUNWLGFBQU8sS0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQixNQUFuQixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7NEJBQ1E7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDTix3REFBa0IsS0FBSyxTQUF2QjtBQUFBLGNBQVEsTUFBUjs7QUFDRSxpQkFBTyxNQUFQLEdBQWdCLElBQWhCO0FBREY7QUFETTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUlOLFdBQUssT0FBTCxDQUFhLEtBQWI7QUFDQSxXQUFLLFNBQUwsQ0FBZSxLQUFmO0FBQ0EsV0FBSyxTQUFMLENBQWUsUUFBZjtBQUNEOzs7d0JBM0VpQjtBQUNoQixhQUFPLENBQVA7QUFDRDs7Ozs7a0JBNEVZLGU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0SGY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXNHTSxVO0FBQ0osd0JBQWM7QUFBQTs7QUFDWjs7Ozs7OztBQU9BLFNBQUssTUFBTCxHQUFjLElBQWQ7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7Z0NBeUM0QjtBQUFBLFVBQWxCLElBQWtCLHVFQUFYLFNBQVc7O0FBQzFCLFVBQUksS0FBSyxNQUFULEVBQ0UsS0FBSyxNQUFMLENBQVksZUFBWixDQUE0QixJQUE1QixFQUFrQyxJQUFsQztBQUNIOztBQUVEOzs7Ozs7Ozs7OztvQ0Flb0M7QUFBQSxVQUF0QixRQUFzQix1RUFBWCxTQUFXOztBQUNsQyxVQUFJLEtBQUssTUFBVCxFQUNFLEtBQUssTUFBTCxDQUFZLG1CQUFaLENBQWdDLElBQWhDLEVBQXNDLFFBQXRDO0FBQ0g7O0FBRUQ7Ozs7Ozs7Ozs7d0JBM0RrQjtBQUNoQixVQUFJLEtBQUssTUFBVCxFQUNFLE9BQU8sS0FBSyxNQUFMLENBQVksV0FBbkI7O0FBRUYsYUFBTyxTQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7d0JBT3NCO0FBQ3BCLFVBQUksU0FBUyxLQUFLLE1BQWxCOztBQUVBLFVBQUksVUFBVSxPQUFPLGVBQVAsS0FBMkIsU0FBekMsRUFDRSxPQUFPLE9BQU8sZUFBZDs7QUFFRixhQUFPLFNBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozt3Q0FPMkIsTSxFQUFRO0FBQ2pDLGFBQVEsT0FBTyxXQUFQLElBQXNCLE9BQU8sV0FBUCxZQUE4QixRQUE1RDtBQUNEOzs7MENBZTRCLE0sRUFBUTtBQUNuQyxhQUNFLE9BQU8sWUFBUCxJQUF1QixPQUFPLFlBQVAsWUFBK0IsUUFBdEQsSUFDQSxPQUFPLGVBRFAsSUFDMEIsT0FBTyxlQUFQLFlBQWtDLFFBRjlEO0FBSUQ7Ozs4Q0FjZ0MsTSxFQUFRO0FBQ3ZDLGFBQVEsT0FBTyxTQUFQLElBQW9CLE9BQU8sU0FBUCxZQUE0QixRQUF4RDtBQUNEOzs7OztrQkFHWSxVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hNZjs7Ozs7O0FBRUEsU0FBUyxRQUFULENBQWtCLEdBQWxCLEVBQXVCLEdBQXZCLEVBQTRCO0FBQzFCLE1BQUksUUFBUSxTQUFaLEVBQ0UsT0FBTyxHQUFQOztBQUVGLFNBQU8sR0FBUDtBQUNEOztBQUdEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbURNLGM7OztBQUNKLDRCQUEwQjtBQUFBLFFBQWQsT0FBYyx1RUFBSixFQUFJO0FBQUE7O0FBR3hCOzs7Ozs7Ozs7QUFId0Isc0pBQ2xCLFFBQVEsWUFEVTs7QUFZeEIsVUFBSyxNQUFMLEdBQWMsU0FBUyxRQUFRLE1BQWpCLEVBQXlCLElBQXpCLENBQWQ7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssU0FBTCxHQUFpQixTQUFTLFFBQVEsU0FBakIsRUFBNEIsSUFBNUIsQ0FBakI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssU0FBTCxHQUFpQixTQUFTLFFBQVEsU0FBakIsRUFBNEIsQ0FBNUIsQ0FBakI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssU0FBTCxHQUFpQixTQUFTLFFBQVEsU0FBakIsRUFBNEIsQ0FBNUIsQ0FBakI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssU0FBTCxHQUFpQixTQUFTLFFBQVEsU0FBakIsRUFBNEIsS0FBNUIsQ0FBakI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssUUFBTCxHQUFnQixTQUFTLFFBQVEsUUFBakIsRUFBMkIsQ0FBM0IsQ0FBaEI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssV0FBTCxHQUFtQixTQUFTLFFBQVEsV0FBakIsRUFBOEIsS0FBOUIsQ0FBbkI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssV0FBTCxHQUFtQixTQUFTLFFBQVEsV0FBakIsRUFBOEIsR0FBOUIsQ0FBbkIsQ0F6RndCLENBeUYrQjs7QUFFdkQ7Ozs7Ozs7OztBQVNBLFVBQUssV0FBTCxHQUFtQixTQUFTLFFBQVEsV0FBakIsRUFBOEIsQ0FBOUIsQ0FBbkI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssU0FBTCxHQUFpQixTQUFTLFFBQVEsU0FBakIsRUFBNEIsQ0FBNUIsQ0FBakI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssU0FBTCxHQUFpQixTQUFTLFFBQVEsU0FBakIsRUFBNEIsR0FBNUIsQ0FBakI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssV0FBTCxHQUFtQixTQUFTLFFBQVEsV0FBakIsRUFBOEIsS0FBOUIsQ0FBbkI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssVUFBTCxHQUFrQixTQUFTLFFBQVEsVUFBakIsRUFBNkIsQ0FBN0IsQ0FBbEI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssVUFBTCxHQUFrQixTQUFTLFFBQVEsVUFBakIsRUFBNkIsR0FBN0IsQ0FBbEI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssWUFBTCxHQUFvQixTQUFTLFFBQVEsWUFBakIsRUFBK0IsS0FBL0IsQ0FBcEI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssYUFBTCxHQUFxQixTQUFTLFFBQVEsYUFBakIsRUFBZ0MsTUFBaEMsQ0FBckI7O0FBRUE7Ozs7Ozs7OztBQVNBLFVBQUssVUFBTCxHQUFrQixTQUFTLFFBQVEsVUFBakIsRUFBNkIsQ0FBN0IsQ0FBbEI7O0FB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QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTs7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBOztBQ0ZBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTs7QUNGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBOztBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuLyoqXG4gKiBFeHBvc2UgYSB1bmlxdWUgYXVkaW8gY29udGV4dCBzaW5nbGV0b24gYXMgdGhlIGRlZmF1bHQgYXVkaW9cbiAqIGNvbnRleHQgdXNlZCBieSB0aGUgY29tcG9uZW50cyBvZiB0aGUgV2F2ZXMgQXVkaW8gbGlicmFyeSBhbmRcbiAqIGFwcGxpY2F0aW9ucyB1c2luZyB0aGUgbGlicmFyeS5cbiAqXG4gKiBAdHlwZSBBdWRpb0NvbnRleHRcbiAqIEBuYW1lIGF1ZGlvQ29udGV4dFxuICogQGNvbnN0YW50XG4gKiBAZ2xvYmFsXG4gKiBAaW5zdGFuY2VcbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3QgYXVkaW9Db250ZXh0ID0gYXVkaW8uYXVkaW9Db250ZXh0O1xuICovXG5sZXQgYXVkaW9Db250ZXh0ID0gbnVsbDtcblxuaWYgKEF1ZGlvQ29udGV4dCkge1xuICBhdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbiAgaWYgKC8oaVBob25lfGlQYWQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiBhdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSA8IDQ0MTAwKSB7XG4gICAgY29uc3QgYnVmZmVyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlcigxLCAxLCA0NDEwMCk7XG4gICAgY29uc3QgZHVtbXkgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgZHVtbXkuYnVmZmVyID0gYnVmZmVyO1xuICAgIGR1bW15LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICBkdW1teS5zdGFydCgwKTtcbiAgICBkdW1teS5kaXNjb25uZWN0KCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXVkaW9Db250ZXh0O1xuIiwiaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi90aW1lLWVuZ2luZSc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuL2F1ZGlvLWNvbnRleHQnO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIGFsbCBhdWRpbyByZWxhdGVkIHRpbWUgZW5naW5lIGNvbXBvbmVudHMuIEl0IGlzXG4gKiB1c2VkIHRvIGhhbmRsZSBhdWRpbyByZWxhdGVkIGV2ZW50cyBzdWNoIGFzIHRoZSBwbGF5YmFjayBvZiBhIG1lZGlhIHN0cmVhbS5cbiAqIEl0IGV4dGVuZHMgdGhlIFRpbWVFbmdpbmUgY2xhc3MgYnkgdGhlIHN0YW5kYXJkIHdlYiBhdWRpbyBub2RlIG1ldGhvZHNcbiAqIGNvbm5lY3QgYW5kIGRpc2Nvbm5lY3QuXG4gKlxuICogW2V4YW1wbGVde0BsaW5rIGh0dHBzOi8vY2RuLnJhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvYXVkaW8tdGltZS1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqXG4gKiBjbGFzcyBNeUVuZ2luZSBleHRlbmRzIGF1ZGlvLkF1ZGlvVGltZUVuZ2luZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHN1cGVyKCk7XG4gKiAgICAgLy8gLi4uXG4gKiAgIH1cbiAqIH1cbiAqL1xuY2xhc3MgQXVkaW9UaW1lRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gY29udGV4dCB1c2VkIGJ5IHRoZSBUaW1lRW5naW5lLCBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYXVkaW9Db250ZXh0XG4gICAgICpcbiAgICAgKiBAbmFtZSBhdWRpb0NvbnRleHRcbiAgICAgKiBAdHlwZSBBdWRpb0NvbnRleHRcbiAgICAgKiBAbWVtYmVyb2YgQXVkaW9UaW1lRW5naW5lXG4gICAgICogQHNlZSBhdWRpb0NvbnRleHRcbiAgICAgKi9cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcblxuICAgIC8qKlxuICAgICAqIE91dHB1dCBhdWRpbyBub2RlLiBCeSBkZWZhdWx0IHRoZSBjb25uZWN0IG1ldGhvZCBjb25uZWN0cyBhIGdpdmVuIG5vZGVcbiAgICAgKiB0byB0aGlzIG91dHB1dCBub2RlLlxuICAgICAqXG4gICAgICogQG5hbWUgb3V0cHV0Tm9kZVxuICAgICAqIEB0eXBlIEF1ZGlvTm9kZVxuICAgICAqIEBtZW1iZXJvZiBBdWRpb1RpbWVFbmdpbmVcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgdGhpcy5vdXRwdXROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIGFuIGF1ZGlvIG5vZGUgKGUuZy4gYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuICAgKlxuICAgKiBAcGFyYW0ge0F1ZGlvTm9kZX0gdGFyZ2V0IC0gVGFyZ2V0IGF1ZGlvIG5vZGVcbiAgICovXG4gIGNvbm5lY3QodGFyZ2V0KSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmNvbm5lY3QodGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGZyb20gYW4gYXVkaW8gbm9kZSAoZS5nLiBhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pLiBJZiB1bmRlZmluZWRcbiAgICogZGlzY29ubmVjdCBmcm9tIGFsbCB0YXJnZXQgbm9kZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXVkaW9Ob2RlfSB0YXJnZXQgLSBUYXJnZXQgYXVkaW8gbm9kZS5cbiAgICovXG4gIGRpc2Nvbm5lY3QoY29ubmVjdGlvbikge1xuICAgIHRoaXMub3V0cHV0Tm9kZS5kaXNjb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF1ZGlvVGltZUVuZ2luZTtcbiIsIi8vIHdvcmtzIGJ5IHJlZmVyZW5jZVxuZnVuY3Rpb24gc3dhcChhcnIsIGkxLCBpMikge1xuICBjb25zdCB0bXAgPSBhcnJbaTFdO1xuICBhcnJbaTFdID0gYXJyW2kyXTtcbiAgYXJyW2kyXSA9IHRtcDtcbn1cblxuLy8gaHR0cHM6Ly9qc3BlcmYuY29tL2pzLWZvci1sb29wLXZzLWFycmF5LWluZGV4b2YvMzQ2XG5mdW5jdGlvbiBpbmRleE9mKGFyciwgZWwpIHtcbiAgY29uc3QgbCA9IGFyci5sZW5ndGg7XG4gIC8vIGlnbm9yZSBmaXJzdCBlbGVtZW50IGFzIGl0IGNhbid0IGJlIGEgZW50cnlcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldID09PSBlbCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIERlZmluZSBpZiBgdGltZTFgIHNob3VsZCBiZSBsb3dlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0xvd2VyTWF4SGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn07XG5cbmNvbnN0IF9pc0xvd2VyTWluSGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPiB0aW1lMjtcbn07XG5cbi8qKlxuICogRGVmaW5lIGlmIGB0aW1lMWAgc2hvdWxkIGJlIGhpZ2hlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0hpZ2hlck1heEhlYXAgPSBmdW5jdGlvbih0aW1lMSwgdGltZTIpIHtcbiAgcmV0dXJuIHRpbWUxID4gdGltZTI7XG59O1xuXG5jb25zdCBfaXNIaWdoZXJNaW5IZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA8IHRpbWUyO1xufTtcblxuY29uc3QgUE9TSVRJVkVfSU5GSU5JVFkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbi8qKlxuICogUHJpb3JpdHkgcXVldWUgaW1wbGVtZW50aW5nIGEgYmluYXJ5IGhlYXAuXG4gKiBBY3RzIGFzIGEgbWluIGhlYXAgYnkgZGVmYXVsdCwgY2FuIGJlIGR5bmFtaWNhbGx5IGNoYW5nZWQgdG8gYSBtYXggaGVhcFxuICogYnkgc2V0dGluZyBgcmV2ZXJzZWAgdG8gdHJ1ZS5cbiAqXG4gKiBfbm90ZV86IHRoZSBxdWV1ZSBjcmVhdGVzIGFuZCBtYWludGFpbnMgYSBuZXcgcHJvcGVydHkgKGkuZS4gYHF1ZXVlVGltZWApXG4gKiB0byBlYWNoIG9iamVjdCBhZGRlZC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2hlYXBMZW5ndGg9MTAwXSAtIERlZmF1bHQgc2l6ZSBvZiB0aGUgYXJyYXkgdXNlZCB0byBjcmVhdGUgdGhlIGhlYXAuXG4gKi9cbmNsYXNzIFByaW9yaXR5UXVldWUge1xuICBjb25zdHJ1Y3RvcihoZWFwTGVuZ3RoID0gMTAwKSB7XG4gICAgLyoqXG4gICAgICogUG9pbnRlciB0byB0aGUgZmlyc3QgZW1wdHkgaW5kZXggb2YgdGhlIGhlYXAuXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbWVtYmVyb2YgUHJpb3JpdHlRdWV1ZVxuICAgICAqIEBuYW1lIF9jdXJyZW50TGVuZ3RoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gMTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHRoZSBzb3J0ZWQgaW5kZXhlcyBvZiB0aGUgZW50cmllcywgdGhlIGFjdHVhbCBoZWFwLiBJZ25vcmUgdGhlIGluZGV4IDAuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBtZW1iZXJvZiBQcmlvcml0eVF1ZXVlXG4gICAgICogQG5hbWUgX2hlYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2hlYXAgPSBuZXcgQXJyYXkoaGVhcExlbmd0aCArIDEpO1xuXG4gICAgLyoqXG4gICAgICogVHlwZSBvZiB0aGUgcXVldWU6IGBtaW5gIGhlYXAgaWYgYGZhbHNlYCwgYG1heGAgaGVhcCBpZiBgdHJ1ZWBcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbWVtYmVyb2YgUHJpb3JpdHlRdWV1ZVxuICAgICAqIEBuYW1lIF9yZXZlcnNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9yZXZlcnNlID0gbnVsbDtcblxuICAgIC8vIGluaXRpYWxpemUgY29tcGFyZSBmdW5jdGlvbnNcbiAgICB0aGlzLnJldmVyc2UgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaW1lIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TGVuZ3RoID4gMSlcbiAgICAgIHJldHVybiB0aGlzLl9oZWFwWzFdLnF1ZXVlVGltZTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVhcFsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG9yZGVyIG9mIHRoZSBxdWV1ZSAobWF4IGhlYXAgaWYgdHJ1ZSwgbWluIGhlYXAgaWYgZmFsc2UpLFxuICAgKiByZWJ1aWxkIHRoZSBoZWFwIHdpdGggdGhlIGV4aXN0aW5nIGVudHJpZXMuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgc2V0IHJldmVyc2UodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX3JldmVyc2UpIHtcbiAgICAgIHRoaXMuX3JldmVyc2UgPSB2YWx1ZTtcblxuICAgICAgaWYgKHRoaXMuX3JldmVyc2UgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5faXNMb3dlciA9IF9pc0xvd2VyTWF4SGVhcDtcbiAgICAgICAgdGhpcy5faXNIaWdoZXIgPSBfaXNIaWdoZXJNYXhIZWFwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMb3dlciA9IF9pc0xvd2VyTWluSGVhcDtcbiAgICAgICAgdGhpcy5faXNIaWdoZXIgPSBfaXNIaWdoZXJNaW5IZWFwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkSGVhcCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCByZXZlcnNlKCkge1xuICAgIHJldHVybiB0aGlzLl9yZXZlcnNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpeCB0aGUgaGVhcCBieSBtb3ZpbmcgYW4gZW50cnkgdG8gYSBuZXcgdXBwZXIgcG9zaXRpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydEluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSBlbnRyeSB0byBtb3ZlLlxuICAgKi9cbiAgX2J1YmJsZVVwKHN0YXJ0SW5kZXgpIHtcbiAgICBsZXQgZW50cnkgPSB0aGlzLl9oZWFwW3N0YXJ0SW5kZXhdO1xuXG4gICAgbGV0IGluZGV4ID0gc3RhcnRJbmRleDtcbiAgICBsZXQgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgbGV0IHBhcmVudCA9IHRoaXMuX2hlYXBbcGFyZW50SW5kZXhdO1xuXG4gICAgd2hpbGUgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcihlbnRyeS5xdWV1ZVRpbWUsIHBhcmVudC5xdWV1ZVRpbWUpKSB7XG4gICAgICBzd2FwKHRoaXMuX2hlYXAsIGluZGV4LCBwYXJlbnRJbmRleCk7XG5cbiAgICAgIGluZGV4ID0gcGFyZW50SW5kZXg7XG4gICAgICBwYXJlbnRJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyAyKTtcbiAgICAgIHBhcmVudCA9IHRoaXMuX2hlYXBbcGFyZW50SW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaXggdGhlIGhlYXAgYnkgbW92aW5nIGFuIGVudHJ5IHRvIGEgbmV3IGxvd2VyIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnRJbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZW50cnkgdG8gbW92ZS5cbiAgICovXG4gIF9idWJibGVEb3duKHN0YXJ0SW5kZXgpIHtcbiAgICBsZXQgZW50cnkgPSB0aGlzLl9oZWFwW3N0YXJ0SW5kZXhdO1xuXG4gICAgbGV0IGluZGV4ID0gc3RhcnRJbmRleDtcbiAgICBsZXQgYzFpbmRleCA9IGluZGV4ICogMjtcbiAgICBsZXQgYzJpbmRleCA9IGMxaW5kZXggKyAxO1xuICAgIGxldCBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgIGxldCBjaGlsZDIgPSB0aGlzLl9oZWFwW2MyaW5kZXhdO1xuXG4gICAgd2hpbGUgKChjaGlsZDEgJiYgdGhpcy5faXNMb3dlcihlbnRyeS5xdWV1ZVRpbWUsIGNoaWxkMS5xdWV1ZVRpbWUpKcKgfHxcbiAgICAgICAgICAgKGNoaWxkMiAmJiB0aGlzLl9pc0xvd2VyKGVudHJ5LnF1ZXVlVGltZSwgY2hpbGQyLnF1ZXVlVGltZSkpKVxuICAgIHtcbiAgICAgIC8vIHN3YXAgd2l0aCB0aGUgbWluaW11bSBjaGlsZFxuICAgICAgbGV0IHRhcmdldEluZGV4O1xuXG4gICAgICBpZiAoY2hpbGQyKVxuICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuX2lzSGlnaGVyKGNoaWxkMS5xdWV1ZVRpbWUsIGNoaWxkMi5xdWV1ZVRpbWUpID8gYzFpbmRleCA6IGMyaW5kZXg7XG4gICAgICBlbHNlXG4gICAgICAgIHRhcmdldEluZGV4ID0gYzFpbmRleDtcblxuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgdGFyZ2V0SW5kZXgpO1xuXG4gICAgICAvLyB1cGRhdGUgdG8gZmluZCBuZXh0IGNoaWxkcmVuXG4gICAgICBpbmRleCA9IHRhcmdldEluZGV4O1xuICAgICAgYzFpbmRleCA9IGluZGV4ICogMjtcbiAgICAgIGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICAgIGNoaWxkMSA9IHRoaXMuX2hlYXBbYzFpbmRleF07XG4gICAgICBjaGlsZDIgPSB0aGlzLl9oZWFwW2MyaW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgaGVhcCAoZnJvbSBib3R0b20gdXApLlxuICAgKi9cbiAgYnVpbGRIZWFwKCkge1xuICAgIC8vIGZpbmQgdGhlIGluZGV4IG9mIHRoZSBsYXN0IGludGVybmFsIG5vZGVcbiAgICAvLyBAdG9kbyAtIG1ha2Ugc3VyZSB0aGF0J3MgdGhlIHJpZ2h0IHdheSB0byBkby5cbiAgICBsZXQgbWF4SW5kZXggPSBNYXRoLmZsb29yKCh0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMSkgLyAyKTtcblxuICAgIGZvciAobGV0IGkgPSBtYXhJbmRleDsgaSA+IDA7IGktLSlcbiAgICAgIHRoaXMuX2J1YmJsZURvd24oaSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IG9iamVjdCBpbiB0aGUgYmluYXJ5IGhlYXAgYW5kIHNvcnQgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIGluc2VydC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybnMge051bWJlcn0gLSBUaW1lIG9mIHRoZSBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIGluc2VydChlbnRyeSwgdGltZSkge1xuICAgIGlmIChNYXRoLmFicyh0aW1lKSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIGVudHJ5LnF1ZXVlVGltZSA9IHRpbWU7XG4gICAgICAvLyBhZGQgdGhlIG5ldyBlbnRyeSBhdCB0aGUgZW5kIG9mIHRoZSBoZWFwXG4gICAgICB0aGlzLl9oZWFwW3RoaXMuX2N1cnJlbnRMZW5ndGhdID0gZW50cnk7XG4gICAgICAvLyBidWJibGUgaXQgdXBcbiAgICAgIHRoaXMuX2J1YmJsZVVwKHRoaXMuX2N1cnJlbnRMZW5ndGgpO1xuICAgICAgdGhpcy5fY3VycmVudExlbmd0aCArPSAxO1xuXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIGVudHJ5LnF1ZXVlVGltZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmUoZW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYSBnaXZlbiBlbnRyeSB0byBhIG5ldyBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gRW50cnkgdG8gbW92ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFRpbWUgb2YgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBtb3ZlKGVudHJ5LCB0aW1lKSB7XG4gICAgaWYgKE1hdGguYWJzKHRpbWUpICE9PSBQT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBlbnRyeS5xdWV1ZVRpbWUgPSB0aW1lO1xuICAgICAgICAvLyBkZWZpbmUgaWYgdGhlIGVudHJ5IHNob3VsZCBiZSBidWJibGVkIHVwIG9yIGRvd25cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildO1xuXG4gICAgICAgIGlmIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIodGltZSwgcGFyZW50LnF1ZXVlVGltZSkpXG4gICAgICAgICAgdGhpcy5fYnViYmxlVXAoaW5kZXgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgZW50cnkucXVldWVUaW1lID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZShlbnRyeSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGVudHJ5IGZyb20gdGhlIGhlYXAgYW5kIGZpeCB0aGUgaGVhcC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gRW50cnkgdG8gcmVtb3ZlLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGltZSBvZiBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIHJlbW92ZShlbnRyeSkge1xuICAgIC8vIGZpbmQgdGhlIGluZGV4IG9mIHRoZSBlbnRyeVxuICAgIGNvbnN0IGluZGV4ID0gaW5kZXhPZih0aGlzLl9oZWFwLCBlbnRyeSk7XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMTtcblxuICAgICAgLy8gaWYgdGhlIGVudHJ5IGlzIHRoZSBsYXN0IG9uZVxuICAgICAgaWYgKGluZGV4ID09PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaGVhcFxuICAgICAgICB0aGlzLl9oZWFwW2xhc3RJbmRleF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IGxlbmd0aFxuICAgICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gbGFzdEluZGV4O1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzd2FwIHdpdGggdGhlIGxhc3QgZWxlbWVudCBvZiB0aGUgaGVhcFxuICAgICAgICBzd2FwKHRoaXMuX2hlYXAsIGluZGV4LCBsYXN0SW5kZXgpO1xuICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBoZWFwXG4gICAgICAgIHRoaXMuX2hlYXBbbGFzdEluZGV4XSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoaW5kZXggPT09IDEpIHtcbiAgICAgICAgICB0aGlzLl9idWJibGVEb3duKDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGJ1YmJsZSB0aGUgKGV4IGxhc3QpIGVsZW1lbnQgdXAgb3IgZG93biBhY2NvcmRpbmcgdG8gaXRzIG5ldyBjb250ZXh0XG4gICAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLl9oZWFwW2luZGV4XTtcbiAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9oZWFwW01hdGguZmxvb3IoaW5kZXggLyAyKV07XG5cbiAgICAgICAgICBpZiAocGFyZW50ICYmIHRoaXMuX2lzSGlnaGVyKGVudHJ5LnF1ZXVlVGltZSwgcGFyZW50LnF1ZXVlVGltZSkpXG4gICAgICAgICAgICB0aGlzLl9idWJibGVVcChpbmRleCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gbGFzdEluZGV4O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRpbWU7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIHF1ZXVlLlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fY3VycmVudExlbmd0aCA9IDE7XG4gICAgdGhpcy5faGVhcCA9IG5ldyBBcnJheSh0aGlzLl9oZWFwLmxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyBpZiB0aGUgcXVldWUgY29udGFpbnMgdGhlIGdpdmVuIGBlbnRyeWAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIGJlIGNoZWNrZWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGhhcyhlbnRyeSkge1xuICAgIHJldHVybiB0aGlzLl9oZWFwLmluZGV4T2YoZW50cnkpICE9PSAtMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmlvcml0eVF1ZXVlO1xuIiwiLyoqXG4gKiBTY2hlZHVsaW5nUXVldWUgYmFzZSBjbGFzc1xuICogaHR0cDovL3dhdmVzanMuZ2l0aHViLmlvL2F1ZGlvLyNhdWRpby1zY2hlZHVsaW5nLXF1ZXVlXG4gKlxuICogTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyXG4gKiBDb3B5cmlnaHQgMjAxNCwgMjAxNSBJUkNBTSDigJPCoENlbnRyZSBQb21waWRvdVxuICovXG5cbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4vcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi90aW1lLWVuZ2luZSc7XG5cbi8qKlxuICogQGNsYXNzIFNjaGVkdWxpbmdRdWV1ZVxuICogQGV4dGVuZHMgVGltZUVuZ2luZVxuICovXG5jbGFzcyBTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19xdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlKCk7XG4gICAgdGhpcy5fX2VuZ2luZXMgPSBuZXcgU2V0KCk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lICdzY2hlZHVsZWQnIGludGVyZmFjZVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgY29uc3QgZW5naW5lID0gdGhpcy5fX3F1ZXVlLmhlYWQ7XG4gICAgY29uc3QgbmV4dEVuZ2luZVRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG5cbiAgICBpZiAoIW5leHRFbmdpbmVUaW1lKSB7XG4gICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuICAgICAgdGhpcy5fX3F1ZXVlLnJlbW92ZShlbmdpbmUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9fcXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVUaW1lKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3F1ZXVlLnRpbWU7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1hc3RlciBtZXRob2QgdG8gYmUgaW1wbGVtZW50ZWQgYnkgZGVyaXZlZCBjbGFzc1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKHRpbWUpIHsgZnVuKHRpbWUpOyB9LCAvLyBtYWtlIHN1ciB0aGF0IHRoZSBhZHZhbmNlVGltZSBtZXRob2QgZG9lcyBub3QgcmV0dXJtIGFueXRoaW5nXG4gICAgfSwgdGltZSk7XG4gIH1cblxuICAvLyBhZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgc2NoZWR1bGVyXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCFUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuXG4gICAgLy8gYWRkIHRvIGVuZ2luZXMgYW5kIHF1ZXVlXG4gICAgdGhpcy5fX2VuZ2luZXMuYWRkKGVuZ2luZSk7XG4gICAgY29uc3QgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUuaW5zZXJ0KGVuZ2luZSwgdGltZSk7XG5cbiAgICAvLyByZXNjaGVkdWxlIHF1ZXVlXG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gcmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgcXVldWVcbiAgcmVtb3ZlKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuXG4gICAgLy8gcmVtb3ZlIGZyb20gYXJyYXkgYW5kIHF1ZXVlXG4gICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgY29uc3QgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG5cbiAgICAvLyByZXNjaGVkdWxlIHF1ZXVlXG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gcmVzZXQgbmV4dCBlbmdpbmUgdGltZVxuICByZXNldEVuZ2luZVRpbWUoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIGxldCBuZXh0VGltZTtcblxuICAgIGlmICh0aGlzLl9fcXVldWUuaGFzKGVuZ2luZSkpXG4gICAgICBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgdGltZSk7XG4gICAgZWxzZVxuICAgICAgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUuaW5zZXJ0KGVuZ2luZSwgdGltZSk7XG5cbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyBjaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZW5naW5lIGlzIHNjaGVkdWxlZFxuICBoYXMoZW5naW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19lbmdpbmVzLmhhcyhlbmdpbmUpO1xuICB9XG5cbiAgLy8gY2xlYXIgcXVldWVcbiAgY2xlYXIoKSB7XG4gICAgZm9yKGxldCBlbmdpbmUgb2YgdGhpcy5fX2VuZ2luZXMpXG4gICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcblxuICAgIHRoaXMuX19xdWV1ZS5jbGVhcigpO1xuICAgIHRoaXMuX19lbmdpbmVzLmNsZWFyKCk7XG4gICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxpbmdRdWV1ZVxuIiwiLyoqXG4gKiBCYXNlIGNsYXNzIGZvciB0aW1lIGVuZ2luZXNcbiAqXG4gKiBBIHRpbWUgZW5naW5lIGdlbmVyYXRlcyBtb3JlIG9yIGxlc3MgcmVndWxhciBldmVudHMgYW5kL29yIHBsYXlzIGJhY2sgYVxuICogbWVkaWEgc3RyZWFtLiBJdCBpbXBsZW1lbnRzIG9uZSBvciBtdWx0aXBsZSBpbnRlcmZhY2VzIHRvIGJlIGRyaXZlbiBieSBhXG4gKiBtYXN0ZXIgKGkuZS4gYSBTY2hlZHVsZXIsIGEgVHJhbnNwb3J0IG9yIGEgUGxheUNvbnRyb2wpIGluIHN5bmNocm9uaXphdGlvblxuICogd2l0aCBvdGhlciBlbmdpbmVzLiBUaGUgcHJvdmlkZWQgaW50ZXJmYWNlcyBhcmUgc2NoZWR1bGVkLCB0cmFuc3BvcnRlZCxcbiAqIGFuZCBwbGF5LWNvbnRyb2xsZWQuXG4gKlxuICpcbiAqICMjIyMgVGhlIGBzY2hlZHVsZWRgIGludGVyZmFjZVxuICpcbiAqIFRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY2hyb25pemluZyBhbiBlbmdpbmUgdG8gYSBtb25vdG9ub3VzIHRpbWVcbiAqIGFzIGl0IGlzIHByb3ZpZGVkIGJ5IHRoZSBTY2hlZHVsZXIgbWFzdGVyLlxuICpcbiAqICMjIyMjIyBgYWR2YW5jZVRpbWUodGltZSA6TnVtYmVyKSAtPiB7TnVtYmVyfWBcbiAqXG4gKiBUaGUgYGFkdmFuY2VUaW1lYCBtZXRob2QgaGFzIHRvIGJlIGltcGxlbWVudGVkIGJ5IGFuIGBUaW1lRW5naW5lYCBhcyBwYXJ0IG9mIHRoZVxuICogc2NoZWR1bGVkIGludGVyZmFjZS4gVGhlIG1ldGhvZCBpcyBjYWxsZWQgYnkgdGhlIG1hc3RlciAoZS5nLiB0aGUgc2NoZWR1bGVyKS5cbiAqIEl0IGdlbmVyYXRlcyBhbiBldmVudCBhbmQgdG8gcmV0dXJucyB0aGUgdGltZSBvZiB0aGUgbmV4dCBldmVudCAoaS5lLiB0aGUgbmV4dFxuICogY2FsbCBvZiBhZHZhbmNlVGltZSkuIFRoZSByZXR1cm5lZCB0aW1lIGhhcyB0byBiZSBncmVhdGVyIHRoYW4gdGhlIHRpbWVcbiAqIHJlY2VpdmVkIGFzIGFyZ3VtZW50IG9mIHRoZSBtZXRob2QuIEluIGNhc2UgdGhhdCBhIFRpbWVFbmdpbmUgaGFzIHRvIGdlbmVyYXRlXG4gKiBtdWx0aXBsZSBldmVudHMgYXQgdGhlIHNhbWUgdGltZSwgdGhlIGVuZ2luZSBoYXMgdG8gaW1wbGVtZW50IGl0cyBvd24gbG9vcFxuICogd2hpbGUoZXZlbnQudGltZSA8PSB0aW1lKSBhbmQgcmV0dXJuIHRoZSB0aW1lIG9mIHRoZSBuZXh0IGV2ZW50IChpZiBhbnkpLlxuICpcbiAqICMjIyMjIyBgcmVzZXRUaW1lKHRpbWU9dW5kZWZpbmVkIDpOdW1iZXIpYFxuICpcbiAqIFRoZSBgcmVzZXRUaW1lYCBtZXRob2QgaXMgcHJvdmlkZWQgYnkgdGhlIGBUaW1lRW5naW5lYCBiYXNlIGNsYXNzLiBBbiBlbmdpbmUgbWF5XG4gKiBjYWxsIHRoaXMgbWV0aG9kIHRvIHJlc2V0IGl0cyBuZXh0IGV2ZW50IHRpbWUgKGUuZy4gd2hlbiBhIHBhcmFtZXRlciBpc1xuICogY2hhbmdlZCB0aGF0IGluZmx1ZW5jZXMgdGhlIGVuZ2luZSdzIHRlbXBvcmFsIGJlaGF2aW9yKS4gV2hlbiBubyBhcmd1bWVudFxuICogaXMgZ2l2ZW4sIHRoZSB0aW1lIGlzIHJlc2V0IHRvIHRoZSBjdXJyZW50IG1hc3RlciB0aW1lLiBXaGVuIGNhbGxpbmcgdGhlXG4gKiBtZXRob2Qgd2l0aCBJbmZpbml0eSB0aGUgZW5naW5lIGlzIHN1c3BlbmRlZCB3aXRob3V0IGJlaW5nIHJlbW92ZWQgZnJvbSB0aGVcbiAqIG1hc3Rlci5cbiAqXG4gKlxuICogIyMjIyBUaGUgYHRyYW5zcG9ydGVkYCBpbnRlcmZhY2VcbiAqXG4gKiBUaGUgdHJhbnNwb3J0ZWQgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY2hyb25pemluZyBhbiBlbmdpbmUgdG8gYSBwb3NpdGlvblxuICogKGkuZS4gbWVkaWEgcGxheWJhY2sgdGltZSkgdGhhdCBjYW4gcnVuIGZvcndhcmQgYW5kIGJhY2t3YXJkIGFuZCBqdW1wIGFzIGl0XG4gKiBpcyBwcm92aWRlZCBieSB0aGUgVHJhbnNwb3J0IG1hc3Rlci5cbiAqXG4gKiAjIyMjIyMgYHN5bmNQb3NpdGlvbih0aW1lIDpOdW1iZXIsIHBvc2l0aW9uIDpOdW1iZXIsIHNwZWVkIDpOdW1iZXIpIC0+IHtOdW1iZXJ9YFxuICpcbiAqIFRoZSBgc3luY1Bvc2l0b25gIG1ldGhvZCBoYXMgdG8gYmUgaW1wbGVtZW50ZWQgYnkgYSBgVGltZUVuZ2luZWAgYXMgcGFydCBvZiB0aGVcbiAqIHRyYW5zcG9ydGVkIGludGVyZmFjZS4gVGhlIG1ldGhvZCBzeW5jUG9zaXRvbiBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIG1hc3RlclxuICogb2YgYSB0cmFuc3BvcnRlZCBlbmdpbmUgaGFzIHRvIChyZS0pc3luY2hyb25pemUgdGhlIGVuZ2luZSdzIHBvc2l0aW9uLiBUaGlzXG4gKiBpcyBmb3IgZXhhbXBsZSByZXF1aXJlZCB3aGVuIHRoZSBtYXN0ZXIgKHJlLSlzdGFydHMgcGxheWJhY2ssIGp1bXBzIHRvIGFuXG4gKiBhcmJpdHJhcnkgcG9zaXRpb24sIGFuZCB3aGVuIHJldmVyc2luZyBwbGF5YmFjayBkaXJlY3Rpb24uIFRoZSBtZXRob2QgcmV0dXJuc1xuICogdGhlIG5leHQgcG9zaXRpb24gb2YgdGhlIGVuZ2luZSBpbiB0aGUgZ2l2ZW4gcGxheWJhY2sgZGlyZWN0aW9uXG4gKiAoaS5lLiBgc3BlZWQgPCAwYCBvciBgc3BlZWQgPiAwYCkuXG4gKlxuICogIyMjIyMjIGBhZHZhbmNlUG9zaXRpb24odGltZSA6TnVtYmVyLCBwb3NpdGlvbiA6TnVtYmVyLCBzcGVlZCA6TnVtYmVyKSAtPiB7TnVtYmVyfWBcbiAqXG4gKiBUaGUgYGFkdmFuY2VQb3NpdGlvbmAgbWV0aG9kIGhhcyB0byBiZSBpbXBsZW1lbnRlZCBieSBhIGBUaW1lRW5naW5lYCBhcyBwYXJ0XG4gKiBvZiB0aGUgdHJhbnNwb3J0ZWQgaW50ZXJmYWNlLiBUaGUgbWFzdGVyIGNhbGxzIHRoZSBhZHZhbmNlUG9zaXRvbiBtZXRob2Qgd2hlblxuICogdGhlIGVuZ2luZSdzIGV2ZW50IHBvc2l0aW9uIGlzIHJlYWNoZWQuIFRoZSBtZXRob2QgZ2VuZXJhdGVzIGFuIGV2ZW50IGFuZFxuICogcmV0dXJucyB0aGUgbmV4dCBwb3NpdGlvbiBpbiB0aGUgZ2l2ZW4gcGxheWJhY2sgZGlyZWN0aW9uIChpLmUuIHNwZWVkIDwgMCBvclxuICogc3BlZWQgPiAwKS4gVGhlIHJldHVybmVkIHBvc2l0aW9uIGhhcyB0byBiZSBncmVhdGVyIChpLmUuIHdoZW4gc3BlZWQgPiAwKVxuICogb3IgbGVzcyAoaS5lLiB3aGVuIHNwZWVkIDwgMCkgdGhhbiB0aGUgcG9zaXRpb24gcmVjZWl2ZWQgYXMgYXJndW1lbnQgb2YgdGhlXG4gKiBtZXRob2QuXG4gKlxuICogIyMjIyMjIGByZXNldFBvc2l0aW9uKHBvc2l0aW9uPXVuZGVmaW5lZCA6TnVtYmVyKWBcbiAqXG4gKiBUaGUgcmVzZXRQb3NpdGlvbiBtZXRob2QgaXMgcHJvdmlkZWQgYnkgdGhlIFRpbWVFbmdpbmUgYmFzZSBjbGFzcy4gQW4gZW5naW5lXG4gKiBtYXkgY2FsbCB0aGlzIG1ldGhvZCB0byByZXNldCBpdHMgbmV4dCBldmVudCBwb3NpdGlvbi4gV2hlbiBubyBhcmd1bWVudFxuICogaXMgZ2l2ZW4sIHRoZSB0aW1lIGlzIHJlc2V0IHRvIHRoZSBjdXJyZW50IG1hc3RlciB0aW1lLiBXaGVuIGNhbGxpbmcgdGhlXG4gKiBtZXRob2Qgd2l0aCBJbmZpbml0eSB0aGUgZW5naW5lIGlzIHN1c3BlbmRlZCB3aXRob3V0IGJlaW5nIHJlbW92ZWQgZnJvbVxuICogdGhlIG1hc3Rlci5cbiAqXG4gKlxuICogIyMjIyBUaGUgc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2VcbiAqXG4gKiBUaGUgXCJzcGVlZC1jb250cm9sbGVkXCIgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY3Jvbml6aW5nIGFuIGVuZ2luZSB0aGF0IGlzXG4gKiBuZWl0aGVyIGRyaXZlbiB0aHJvdWdoIHRoZSBzY2hlZHVsZWQgbm9yIHRoZSB0cmFuc3BvcnRlZCBpbnRlcmZhY2UuIFRoZVxuICogaW50ZXJmYWNlIGFsbG93cyBpbiBwYXJ0aWN1bGFyIHRvIHN5bmNocm9uaXplIGVuZ2luZXMgdGhhdCBhc3N1cmUgdGhlaXIgb3duXG4gKiBzY2hlZHVsaW5nIChpLmUuIGF1ZGlvIHBsYXllciBvciBhbiBvc2NpbGxhdG9yKSB0byB0aGUgZXZlbnQtYmFzZWQgc2NoZWR1bGVkXG4gKiBhbmQgdHJhbnNwb3J0ZWQgZW5naW5lcy5cbiAqXG4gKiAjIyMjIyMgYHN5bmNTcGVlZCh0aW1lIDpOdW1iZXIsIHBvc2l0aW9uIDpOdW1iZXIsIHNwZWVkIDpOdW1iZXIsIHNlZWs9ZmFsc2UgOkJvb2xlYW4pYFxuICpcbiAqIFRoZSBzeW5jU3BlZWQgbWV0aG9kIGhhcyB0byBiZSBpbXBsZW1lbnRlZCBieSBhIFRpbWVFbmdpbmUgYXMgcGFydCBvZiB0aGVcbiAqIHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlLiBUaGUgbWV0aG9kIGlzIGNhbGxlZCBieSB0aGUgbWFzdGVyIHdoZW5ldmVyIHRoZVxuICogcGxheWJhY2sgc3BlZWQgY2hhbmdlcyBvciB0aGUgcG9zaXRpb24ganVtcHMgYXJiaXRhcmlseSAoaS5lLiBvbiBhIHNlZWspLlxuICpcbiAqXG4gKiA8aHIgLz5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgYSBgVGltZUVuZ2luZWAgcnVubmluZyBpbiBhIGBTY2hlZHVsZXJgIHRoYXQgY291bnRzIHVwXG4gKiBhdCBhIGdpdmVuIGZyZXF1ZW5jeTpcbiAqIHtAbGluayBodHRwczovL2Nkbi5yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL3RpbWUtZW5naW5lLmh0bWx9XG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqXG4gKiBjbGFzcyBNeUVuZ2luZSBleHRlbmRzIGF1ZGlvLlRpbWVFbmdpbmUge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICBzdXBlcigpO1xuICogICAgIC8vIC4uLlxuICogICB9XG4gKiB9XG4gKlxuICovXG5jbGFzcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgLyoqXG4gICAgICogVGhlIGVuZ2luZSdzIG1hc3Rlci5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtNaXhlZH1cbiAgICAgKiBAbmFtZSBtYXN0ZXJcbiAgICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgICAqL1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgdGltZSBlbmdpbmUncyBjdXJyZW50IChtYXN0ZXIpIHRpbWUuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBUaW1lRW5naW5lXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHRpbWUgZW5naW5lJ3MgY3VycmVudCAobWFzdGVyKSBwb3NpdGlvbi5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlZCBpbnRlcmZhY2VcbiAgICogICAtIGFkdmFuY2VUaW1lKHRpbWUpLCBjYWxsZWQgdG8gZ2VuZXJhdGUgbmV4dCBldmVudCBhdCBnaXZlbiB0aW1lLCByZXR1cm5zIG5leHQgdGltZVxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJvZiBUaW1lRW5naW5lXG4gICAqL1xuICBzdGF0aWMgaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpIHtcbiAgICByZXR1cm4gKGVuZ2luZS5hZHZhbmNlVGltZSAmJiBlbmdpbmUuYWR2YW5jZVRpbWUgaW5zdGFuY2VvZiBGdW5jdGlvbik7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnRlZCBpbnRlcmZhY2VcbiAgICogICAtIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gcmVwb3NpdGlvbiBUaW1lRW5naW5lLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICogICAtIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gZ2VuZXJhdGUgbmV4dCBldmVudCBhdCBnaXZlbiB0aW1lIGFuZCBwb3NpdGlvbiwgcmV0dXJucyBuZXh0IHBvc2l0aW9uXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICovXG4gIHN0YXRpYyBpbXBsZW1lbnRzVHJhbnNwb3J0ZWQoZW5naW5lKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGVuZ2luZS5zeW5jUG9zaXRpb24gJiYgZW5naW5lLnN5bmNQb3NpdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uICYmXG4gICAgICBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uICYmIGVuZ2luZS5hZHZhbmNlUG9zaXRpb24gaW5zdGFuY2VvZiBGdW5jdGlvblxuICAgICk7XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogU3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2VcbiAgICogICAtIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsICksIGNhbGxlZCB0b1xuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJvZiBUaW1lRW5naW5lXG4gICAqL1xuICBzdGF0aWMgaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZChlbmdpbmUpIHtcbiAgICByZXR1cm4gKGVuZ2luZS5zeW5jU3BlZWQgJiYgZW5naW5lLnN5bmNTcGVlZCBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUaW1lRW5naW5lO1xuIiwiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYgKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuXG4vKipcbiAqIEdyYW51bGFyIHN5bnRoZXNpcyBUaW1lRW5naW5lIGltcGxlbWVudGluZyB0aGUgc2NoZWR1bGVkIGludGVyZmFjZS5cbiAqIFRoZSBncmFpbiBwb3NpdGlvbiAoZ3JhaW4gb25zZXQgb3IgY2VudGVyIHRpbWUgaW4gdGhlIGF1ZGlvIGJ1ZmZlcikgaXNcbiAqIG9wdGlvbmFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgZW5naW5lJ3MgY3VycmVudFBvc2l0aW9uIGF0dHJpYnV0ZS5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgYSBgR3JhbnVsYXJFbmdpbmVgICh3aXRoIGEgZmV3IHBhcmFtZXRlciBjb250cm9scykgZHJpdmVuXG4gKiBieSBhIGBTY2hlZHVsZXJgIGFuZCBhIGBQbGF5Q29udHJvbGA6XG4gKiB7QGxpbmsgaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy9ncmFudWxhci1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmVcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBzY2hlZHVsZXIgPSBhdWRpby5nZXRTY2hlZHVsZXIoKTtcbiAqIGNvbnN0IGdyYW51bGFyRW5naW5lID0gbmV3IGF1ZGlvLkdyYW51bGFyRW5naW5lKCk7XG4gKlxuICogc2NoZWR1bGVyLmFkZChncmFudWxhckVuZ2luZSk7XG4gKlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zPXt9IC0gUGFyYW1ldGVyc1xuICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gW29wdGlvbnMuYnVmZmVyPW51bGxdIC0gQXVkaW8gYnVmZmVyXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kQWJzPTAuMDFdIC0gQWJzb2x1dGUgZ3JhaW4gcGVyaW9kIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZFJlbD0wXSAtIEdyYWluIHBlcmlvZCByZWxhdGl2ZSB0byBhYnNvbHV0ZVxuICogIGR1cmF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kVmFyPTBdIC0gQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBlcmlvZFxuICogIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2RcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RNaW49MC4wMDFdIC0gTWluaW11bSBncmFpbiBwZXJpb2RcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wb3NpdGlvbj0wXSAtIEdyYWluIHBvc2l0aW9uIChvbnNldCB0aW1lIGluIGF1ZGlvXG4gKiAgYnVmZmVyKSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wb3NpdGlvblZhcj0wLjAwM10gLSBBbW91dCBvZiByYW5kb20gZ3JhaW4gcG9zaXRpb25cbiAqICB2YXJpYXRpb24gaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHVyYXRpb25BYnM9MC4xXSAtIEFic29sdXRlIGdyYWluIGR1cmF0aW9uIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uUmVsPTBdIC0gR3JhaW4gZHVyYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW5cbiAqICBwZXJpb2QgKG92ZXJsYXApXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuYXR0YWNrQWJzPTBdIC0gQWJzb2x1dGUgYXR0YWNrIHRpbWUgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuYXR0YWNrUmVsPTAuNV0gLSBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmF0dGFja1NoYXBlPSdsaW4nXSAtIFNoYXBlIG9mIGF0dGFja1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnJlbGVhc2VBYnM9MF0gLSBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZVJlbD0wLjVdIC0gUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZVNoYXBlPSdsaW4nXSAtIFNoYXBlIG9mIHJlbGVhc2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5leHBSYW1wT2Zmc2V0PTAuMDAwMV0gLSBPZmZzZXQgKHN0YXJ0L2VuZCB2YWx1ZSlcbiAqICBmb3IgZXhwb25lbnRpYWwgYXR0YWNrL3JlbGVhc2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZXNhbXBsaW5nPTBdIC0gR3JhaW4gcmVzYW1wbGluZyBpbiBjZW50XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVzYW1wbGluZ1Zhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZ2Fpbj0xXSAtIExpbmVhciBnYWluIGZhY3RvclxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5jZW50ZXJlZD10cnVlXSAtIFdoZXRoZXIgdGhlIGdyYWluIHBvc2l0aW9uIHJlZmVyc1xuICogIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGdyYWluIChvciB0aGUgYmVnaW5uaW5nKVxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5jeWNsaWM9ZmFsc2VdIC0gV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBncmFpblxuICogIHBvc2l0aW9uIGFyZSBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb249MF0gLSBQb3J0aW9uIGF0IHRoZSBlbmQgb2YgdGhlXG4gKiAgYXVkaW8gYnVmZmVyIHRoYXQgaGFzIGJlZW4gY29waWVkIGZyb20gdGhlIGJlZ2lubmluZyB0byBhc3N1cmUgY3ljbGljIGJlaGF2aW9yXG4gKi9cbmNsYXNzIEdyYW51bGFyRW5naW5lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICpcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICogQG5hbWUgYnVmZmVyXG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgZ3JhaW4gcGVyaW9kIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RBYnNcbiAgICAgKiBAZGVmYXVsdCAwLjAxXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RBYnMgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZEFicywgMC4wMSk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBwZXJpb2QgcmVsYXRpdmUgdG8gYWJzb2x1dGUgZHVyYXRpb25cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kUmVsXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kUmVsID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBlcmlvZFZhclxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFZhciA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIE1pbmltdW0gZ3JhaW4gcGVyaW9kXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBlcmlvZE1pblxuICAgICAqIEBkZWZhdWx0IDAuMDAxXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RNaW4gPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZE1pbiwgMC4wMDEpO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcG9zaXRpb24gKG9uc2V0IHRpbWUgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcG9zaXRpb25cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb24sIDApO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIGdyYWluIHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcG9zaXRpb25WYXJcbiAgICAgKiBAZGVmYXVsdCAwLjAwM1xuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25WYXIgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uVmFyLCAwLjAwMyk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBkdXJhdGlvbiBpbiBzZWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgZHVyYXRpb25BYnNcbiAgICAgKiBAZGVmYXVsdCAwLjFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFicywgMC4xKTsgLy8gYWJzb2x1dGUgZ3JhaW4gZHVyYXRpb25cblxuICAgIC8qKlxuICAgICAqIEdyYWluIGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZCAob3ZlcmxhcClcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgZHVyYXRpb25SZWxcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25SZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgYXR0YWNrIHRpbWUgaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGF0dGFja0Fic1xuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja0FicyA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGF0dGFja1JlbFxuICAgICAqIEBkZWZhdWx0IDAuNVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrUmVsID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tSZWwsIDAuNSk7XG5cbiAgICAvKipcbiAgICAgKiBTaGFwZSBvZiBhdHRhY2sgKCdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsIHJhbXApXG4gICAgICpcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBuYW1lIGF0dGFja1NoYXBlXG4gICAgICogQGRlZmF1bHQgJ2xpbidcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1NoYXBlID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tTaGFwZSwgJ2xpbicpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgcmVsZWFzZSB0aW1lIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSByZWxlYXNlQWJzXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZUFicyA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZUFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcmVsZWFzZVJlbFxuICAgICAqIEBkZWZhdWx0IDAuNVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVJlbCwgMC41KTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIHJlbGVhc2UgKCdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsIHJhbXApXG4gICAgICpcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBuYW1lIHJlbGVhc2VTaGFwZVxuICAgICAqIEBkZWZhdWx0ICdsaW4nXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlU2hhcGUgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VTaGFwZSwgJ2xpbicpO1xuXG4gICAgLyoqXG4gICAgICogT2Zmc2V0IChzdGFydC9lbmQgdmFsdWUpIGZvciBleHBvbmVudGlhbCBhdHRhY2svcmVsZWFzZVxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBleHBSYW1wT2Zmc2V0XG4gICAgICogQGRlZmF1bHQgMC4wMDAxXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5leHBSYW1wT2Zmc2V0ID0gb3B0T3JEZWYob3B0aW9ucy5leHBSYW1wT2Zmc2V0LCAwLjAwMDEpO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcmVzYW1wbGluZyBpbiBjZW50XG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHJlc2FtcGxpbmdcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHJlc2FtcGxpbmdWYXJcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBnYWluXG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZ2FpbiA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBncmFpbiBwb3NpdGlvbiByZWZlcnMgdG8gdGhlIGNlbnRlciBvZiB0aGUgZ3JhaW4gKG9yIHRoZSBiZWdpbm5pbmcpXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbmFtZSBjZW50ZXJlZFxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNlbnRlcmVkID0gb3B0T3JEZWYob3B0aW9ucy5jZW50ZXJlZCwgdHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIGdyYWluIHBvc2l0aW9uIGFyZSBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgICAqXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQG5hbWUgY3ljbGljXG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmN5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG5cbiAgICAvKipcbiAgICAgKiBQb3J0aW9uIGF0IHRoZSBlbmQgb2YgdGhlIGF1ZGlvIGJ1ZmZlciB0aGF0IGhhcyBiZWVuIGNvcGllZCBmcm9tIHRoZVxuICAgICAqIGJlZ2lubmluZyB0byBhc3N1cmUgY3ljbGljIGJlaGF2aW9yXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHdyYXBBcm91bmRFeHRlbnNpb25cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uID0gb3B0T3JEZWYob3B0aW9ucy53cmFwQXJvdW5kRXh0ZW5zaW9uLCAwKTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYnVmZmVyIGR1cmF0aW9uIChleGNsdWRpbmcgd3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgYnVmZmVyRHVyYXRpb25cbiAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgICAgICBidWZmZXJEdXJhdGlvbiAtPSB0aGlzLndyYXBBcm91bmRFeHRlbnNpb247XG5cbiAgICAgIHJldHVybiBidWZmZXJEdXJhdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHBvc2l0aW9uXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGN1cnJlbnRQb3NpdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICB2YXIgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb247XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgZ3JhaW4uIFRoaXMgZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCBhdCBhbnkgdGltZSAod2hldGhlciB0aGVcbiAgICogZW5naW5lIGlzIHNjaGVkdWxlZCBvciBub3QpIHRvIGdlbmVyYXRlIGEgc2luZ2xlIGdyYWluIGFjY29yZGluZyB0byB0aGVcbiAgICogY3VycmVudCBncmFpbiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIGdyYWluIHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBwZXJpb2QgdG8gbmV4dCBncmFpblxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBncmFpblRpbWUgPSB0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICB2YXIgZ3JhaW5QZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgZ3JhaW5Qb3NpdGlvbiA9IHRoaXMuY3VycmVudFBvc2l0aW9uO1xuICAgIHZhciBncmFpbkR1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFicztcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIHJlc2FtcGxpbmdSYXRlID0gMS4wO1xuXG4gICAgICAvLyBjYWxjdWxhdGUgcmVzYW1wbGluZ1xuICAgICAgaWYgKHRoaXMucmVzYW1wbGluZyAhPT0gMCB8fCB0aGlzLnJlc2FtcGxpbmdWYXIgPiAwKSB7XG4gICAgICAgIHZhciByYW5kb21SZXNhbXBsaW5nID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMi4wICogdGhpcy5yZXNhbXBsaW5nVmFyO1xuICAgICAgICByZXNhbXBsaW5nUmF0ZSA9IE1hdGgucG93KDIuMCwgKHRoaXMucmVzYW1wbGluZyArIHJhbmRvbVJlc2FtcGxpbmcpIC8gMTIwMC4wKTtcbiAgICAgIH1cblxuICAgICAgZ3JhaW5QZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBncmFpbkR1cmF0aW9uO1xuICAgICAgZ3JhaW5EdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uUmVsICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGdyYWluIHBlcmlvZCByYW5kb24gdmFyaWF0aW9uXG4gICAgICBpZiAodGhpcy5wZXJpb2RWYXIgPiAwLjApXG4gICAgICAgIGdyYWluUGVyaW9kICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucGVyaW9kVmFyICogZ3JhaW5QZXJpb2Q7XG5cbiAgICAgIC8vIGNlbnRlciBncmFpblxuICAgICAgaWYgKHRoaXMuY2VudGVyZWQpXG4gICAgICAgIGdyYWluUG9zaXRpb24gLT0gMC41ICogZ3JhaW5EdXJhdGlvbjtcblxuICAgICAgLy8gcmFuZG9taXplIGdyYWluIHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIGdyYWluUG9zaXRpb24gKz0gKDIuMCAqIE1hdGgucmFuZG9tKCkgLSAxKSAqIHRoaXMucG9zaXRpb25WYXI7XG5cbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIC8vIHdyYXAgb3IgY2xpcCBncmFpbiBwb3NpdGlvbiBhbmQgZHVyYXRpb24gaW50byBidWZmZXIgZHVyYXRpb25cbiAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCB8fCBncmFpblBvc2l0aW9uID49IGJ1ZmZlckR1cmF0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgICAgIHZhciBjeWNsZXMgPSBncmFpblBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgZ3JhaW5Qb3NpdGlvbiA9IChjeWNsZXMgLSBNYXRoLmZsb29yKGN5Y2xlcykpICogYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiB0aGlzLmJ1ZmZlci5kdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICBncmFpblRpbWUgLT0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gKz0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAwO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uICsgZ3JhaW5EdXJhdGlvbiA+IGJ1ZmZlckR1cmF0aW9uKVxuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiA9IGJ1ZmZlckR1cmF0aW9uIC0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBtYWtlIGdyYWluXG4gICAgICBpZiAodGhpcy5nYWluID4gMCAmJiBncmFpbkR1cmF0aW9uID49IDAuMDAxKSB7XG4gICAgICAgIC8vIG1ha2UgZ3JhaW4gZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdmFyIGF0dGFjayA9IHRoaXMuYXR0YWNrQWJzICsgdGhpcy5hdHRhY2tSZWwgKiBncmFpbkR1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZSA9IHRoaXMucmVsZWFzZUFicyArIHRoaXMucmVsZWFzZVJlbCAqIGdyYWluRHVyYXRpb247XG5cbiAgICAgICAgaWYgKGF0dGFjayArIHJlbGVhc2UgPiBncmFpbkR1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIGZhY3RvciA9IGdyYWluRHVyYXRpb24gLyAoYXR0YWNrICsgcmVsZWFzZSk7XG4gICAgICAgICAgYXR0YWNrICo9IGZhY3RvcjtcbiAgICAgICAgICByZWxlYXNlICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdHRhY2tFbmRUaW1lID0gZ3JhaW5UaW1lICsgYXR0YWNrO1xuICAgICAgICB2YXIgZ3JhaW5FbmRUaW1lID0gZ3JhaW5UaW1lICsgZ3JhaW5EdXJhdGlvbiAvIHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICB2YXIgcmVsZWFzZVN0YXJ0VGltZSA9IGdyYWluRW5kVGltZSAtIHJlbGVhc2U7XG5cbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi52YWx1ZSA9IDA7XG5cbiAgICAgICAgaWYgKHRoaXMuYXR0YWNrU2hhcGUgPT09ICdsaW4nKSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjAsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmdhaW4sIGF0dGFja0VuZFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5leHBSYW1wT2Zmc2V0LCBncmFpblRpbWUpO1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmdhaW4sIGF0dGFja0VuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5nYWluLCByZWxlYXNlU3RhcnRUaW1lKTtcblxuICAgICAgICBpZiAodGhpcy5yZWxlYXNlU2hhcGUgPT09ICdsaW4nKSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIGdyYWluRW5kVGltZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVudmVsb3BlLmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgICAgICAvLyBtYWtlIHNvdXJjZVxuICAgICAgICB2YXIgc291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgc291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJlc2FtcGxpbmdSYXRlO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChlbnZlbG9wZSk7XG5cbiAgICAgICAgc291cmNlLnN0YXJ0KGdyYWluVGltZSwgZ3JhaW5Qb3NpdGlvbik7XG4gICAgICAgIHNvdXJjZS5zdG9wKGdyYWluRW5kVGltZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGgubWF4KHRoaXMucGVyaW9kTWluLCBncmFpblBlcmlvZCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR3JhbnVsYXJFbmdpbmU7XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogTWV0cm9ub21lIGF1ZGlvIGVuZ2luZS4gSXQgZXh0ZW5kcyBUaW1lIEVuZ2luZSBhcyBhIHRyYW5zcG9ydGVkIGludGVyZmFjZS5cbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL2Nkbi5yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL21ldHJvbm9tZS5odG1sfVxuICpcbiAqIEBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZVxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHNjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuICogY29uc3QgbWV0cm9ub21lID0gbmV3IGF1ZGlvLk1ldHJvbm9tZSh7cGVyaW9kOiAwLjMzM30pO1xuICpcbiAqIHNjaGVkdWxlci5hZGQobWV0cm9ub21lKTtcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gRGVmYXVsdCBvcHRpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kPTFdIC0gTWV0cm9ub21lIHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmNsaWNrRnJlcT02MDBdIC0gTWV0cm9ub21lIGNsaWNrIGZyZXF1ZW5jeVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmNsaWNrQXR0YWNrPTAuMDAyXSAtIE1ldHJvbm9tZSBjbGljayBhdHRhY2sgdGltZVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmNsaWNrUmVsZWFzZT0wLjA5OF0gLSBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZ2Fpbj0xXSAtIEdhaW5cbiAqL1xuY2xhc3MgTWV0cm9ub21lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9fcGVyaW9kID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2QsIDEpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGZyZXF1ZW5jeVxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbWVtYmVyb2YgTWV0cm9ub21lXG4gICAgICogQG5hbWUgY2xpY2tGcmVxXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5jbGlja0ZyZXEgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrRnJlcSwgNjAwKTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayBhdHRhY2sgdGltZVxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbWVtYmVyb2YgTWV0cm9ub21lXG4gICAgICogQG5hbWUgY2xpY2tBdHRhY2tcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrQXR0YWNrID0gb3B0T3JEZWYob3B0aW9ucy5jbGlja0F0dGFjaywgMC4wMDIpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIHJlbGVhc2UgdGltZVxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbWVtYmVyb2YgTWV0cm9ub21lXG4gICAgICogQG5hbWUgY2xpY2tSZWxlYXNlXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5jbGlja1JlbGVhc2UgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrUmVsZWFzZSwgMC4wOTgpO1xuXG4gICAgdGhpcy5fX2xhc3RUaW1lID0gMDtcbiAgICB0aGlzLl9fcGhhc2UgPSAwO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuX19nYWluTm9kZTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9fcGVyaW9kID4gMCkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IChNYXRoLmZsb29yKHBvc2l0aW9uIC8gdGhpcy5fX3BlcmlvZCkgKyB0aGlzLl9fcGhhc2UpICogdGhpcy5fX3BlcmlvZDtcblxuICAgICAgaWYgKHNwZWVkID4gMCAmJiBuZXh0UG9zaXRpb24gPCBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uICs9IHRoaXMuX19wZXJpb2Q7XG4gICAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgbmV4dFBvc2l0aW9uID4gcG9zaXRpb24pXG4gICAgICAgIG5leHRQb3NpdGlvbiAtPSB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICByZXR1cm4gbmV4dFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eSAqIHNwZWVkO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcblxuICAgIGlmIChzcGVlZCA8IDApXG4gICAgICByZXR1cm4gcG9zaXRpb24gLSB0aGlzLl9fcGVyaW9kO1xuXG4gICAgcmV0dXJuIHBvc2l0aW9uICsgdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIG1ldHJvbm9tZSBjbGlja1xuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBtZXRyb25vbWUgY2xpY2sgc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICovXG4gIHRyaWdnZXIodGltZSkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIGNvbnN0IGNsaWNrQXR0YWNrID0gdGhpcy5jbGlja0F0dGFjaztcbiAgICBjb25zdCBjbGlja1JlbGVhc2UgPSB0aGlzLmNsaWNrUmVsZWFzZTtcblxuICAgIGNvbnN0IGVudiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgZW52LmdhaW4udmFsdWUgPSAwLjA7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMS4wLCB0aW1lICsgY2xpY2tBdHRhY2spO1xuICAgIGVudi5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoMC4wMDAwMDAxLCB0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgIGVudi5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICBjb25zdCBvc2MgPSBhdWRpb0NvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgIG9zYy5mcmVxdWVuY3kudmFsdWUgPSB0aGlzLmNsaWNrRnJlcTtcbiAgICBvc2Muc3RhcnQodGltZSk7XG4gICAgb3NjLnN0b3AodGltZSArIGNsaWNrQXR0YWNrICsgY2xpY2tSZWxlYXNlKTtcbiAgICBvc2MuY29ubmVjdChlbnYpO1xuICB9XG5cbiAgLyoqXG4gICAqIGxpbmVhciBnYWluIGZhY3RvclxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBnYWluXG4gICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogbWV0cm9ub21lIHBlcmlvZFxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBwZXJpb2RcbiAgICogQG1lbWJlcm9mIE1ldHJvbm9tZVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBwZXJpb2QocGVyaW9kKSB7XG4gICAgdGhpcy5fX3BlcmlvZCA9IHBlcmlvZDtcblxuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3Rlcikge1xuICAgICAgaWYgKG1hc3Rlci5yZXNldEVuZ2luZVRpbWUpXG4gICAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVRpbWUodGhpcywgdGhpcy5fX2xhc3RUaW1lICsgcGVyaW9kKTtcbiAgICAgIGVsc2UgaWYgKG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKVxuICAgICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgICB9XG4gIH1cblxuICBnZXQgcGVyaW9kKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwaGFzZSBwYXJhbWV0ZXIgKGF2YWlsYWJsZSBvbmx5IHdoZW4gJ3RyYW5zcG9ydGVkJyksIHNob3VsZCBiZVxuICAgKiBiZXR3ZWVuIFswLCAxW1xuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBwaGFzZVxuICAgKiBAbWVtYmVyb2YgTWV0cm9ub21lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IHBoYXNlKHBoYXNlKSB7XG4gICAgdGhpcy5fX3BoYXNlID0gcGhhc2UgLSBNYXRoLmZsb29yKHBoYXNlKTtcblxuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcyk7XG4gIH1cblxuICBnZXQgcGhhc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19waGFzZTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXRyb25vbWU7XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogVXNlZCB3aXRoIGEgYnVmZmVyIHRvIHNlcnZlIGF1ZGlvIGZpbGVzLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL2Nkbi5yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL3BsYXllci1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmVcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBwbGF5ZXJFbmdpbmUgPSB3YXZlc0F1ZGlvLlBsYXllckVuZ2luZSgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgd2F2ZXNBdWRpby5QbGF5Q29udHJvbChwbGF5ZXJFbmdpbmUpO1xuICpcbiAqIHBsYXlDb250cm9sLnN0YXJ0KCk7XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSAtIERlZmF1bHQgb3B0aW9uc1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmJ1ZmZlcj0xXSAtIEF1ZGlvIGJ1ZmZlclxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmZhZGVUaW1lPTYwMF0gLSBGYWRlIHRpbWUgZm9yIGNoYWluaW5nIHNlZ21lbnRzXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY3ljbGljPWZhbHNlXSAtIExvb3AgbW9kZVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmdhaW49MV0gLSBHYWluXG4gKi9cbmNsYXNzIFBsYXllckVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIHRoaXMudHJhbnNwb3J0ID0gbnVsbDsgLy8gc2V0IHdoZW4gYWRkZWQgdG8gdHJhbnNwb3J0ZXJcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqIEBuYW1lIGJ1ZmZlclxuICAgICAqIEBtZW1iZXJvZiBQbGF5ZXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBGYWRlIHRpbWUgZm9yIGNoYWluaW5nIHNlZ21lbnRzIChlLmcuIGluIHN0YXJ0LCBzdG9wLCBhbmQgc2VlaylcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgZmFkZVRpbWVcbiAgICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQGRlZmF1bHQgMC4wMDVcbiAgICAgKi9cbiAgICB0aGlzLmZhZGVUaW1lID0gb3B0T3JEZWYob3B0aW9ucy5mYWRlVGltZSwgMC4wMDUpO1xuXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgIHRoaXMuX19lbnZOb2RlID0gbnVsbDtcblxuICAgIHRoaXMuX19nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICB0aGlzLl9fY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuX19nYWluTm9kZTtcbiAgfVxuXG4gIF9fc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMuX19jeWNsaWMgJiYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBidWZmZXJEdXJhdGlvbikpIHtcbiAgICAgICAgdmFyIHBoYXNlID0gcG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgcG9zaXRpb24gPSAocGhhc2UgLSBNYXRoLmZsb29yKHBoYXNlKSkgKiBidWZmZXJEdXJhdGlvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uID49IDAgJiYgcG9zaXRpb24gPCBidWZmZXJEdXJhdGlvbiAmJiBzcGVlZCA+IDApIHtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuY29ubmVjdCh0aGlzLl9fZ2Fpbk5vZGUpO1xuXG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gc3BlZWQ7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcCA9IHRoaXMuX19jeWNsaWM7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcFN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5sb29wRW5kID0gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RhcnQodGltZSwgcG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmNvbm5lY3QodGhpcy5fX2Vudk5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9faGFsdCh0aW1lKSB7XG4gICAgaWYgKHRoaXMuX19idWZmZXJTb3VyY2UpIHtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHRpbWUpO1xuICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLl9fZW52Tm9kZS5nYWluLnZhbHVlLCB0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5zdG9wKHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcblxuICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZSA9IG51bGw7XG4gICAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKHNlZWsgfHwgbGFzdFNwZWVkICogc3BlZWQgPCAwKSB7XG4gICAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwIHx8IHNlZWspIHtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKHNwZWVkLCB0aW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICogQHR5cGUge0Jvb2x9XG4gICAqIEBuYW1lIGN5Y2xpY1xuICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGN5Y2xpYyhjeWNsaWMpIHtcbiAgICBpZiAoY3ljbGljICE9PSB0aGlzLl9fY3ljbGljKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmN1cnJlbnRvc2l0aW9uO1xuXG4gICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIHRoaXMuX19jeWNsaWMgPSBjeWNsaWM7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgdGhpcy5fX3NwZWVkKTtcbiAgICB9XG4gIH1cblxuICBnZXQgY3ljbGljKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3ljbGljO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBnYWluXG4gICAqIEBtZW1iZXJvZiBQbGF5ZXJFbmdpbmVcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHZhciB0aW1lID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5zZXRWYWx1ZUF0VGltZSh0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgdGltZSk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgfVxuXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYnVmZmVyIGR1cmF0aW9uXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGJ1ZmZlckR1cmF0aW9uXG4gICAqIEBtZW1iZXJvZiBQbGF5ZXJFbmdpbmVcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIGlmKHRoaXMuYnVmZmVyKVxuICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyRW5naW5lO1xuIiwiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYgKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudE9yUHJldmlvdXNJbmRleChzb3J0ZWRBcnJheSwgdmFsdWUsIGluZGV4ID0gLTEpIHtcbiAgdmFyIHNpemUgPSBzb3J0ZWRBcnJheS5sZW5ndGg7XG5cbiAgaWYgKHNpemUgPiAwKSB7XG4gICAgdmFyIGZpcnN0VmFsID0gc29ydGVkQXJyYXlbMF07XG4gICAgdmFyIGxhc3RWYWwgPSBzb3J0ZWRBcnJheVtzaXplIC0gMV07XG5cbiAgICBpZiAodmFsdWUgPCBmaXJzdFZhbClcbiAgICAgIGluZGV4ID0gLTE7XG4gICAgZWxzZSBpZiAodmFsdWUgPj0gbGFzdFZhbClcbiAgICAgIGluZGV4ID0gc2l6ZSAtIDE7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHNpemUpXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigoc2l6ZSAtIDEpICogKHZhbHVlIC0gZmlyc3RWYWwpIC8gKGxhc3RWYWwgLSBmaXJzdFZhbCkpO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXhdID4gdmFsdWUpXG4gICAgICAgIGluZGV4LS07XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleCArIDFdIDw9IHZhbHVlKVxuICAgICAgICBpbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudE9yTmV4dEluZGV4KHNvcnRlZEFycmF5LCB2YWx1ZSwgaW5kZXggPSAtMSkge1xuICB2YXIgc2l6ZSA9IHNvcnRlZEFycmF5Lmxlbmd0aDtcblxuICBpZiAoc2l6ZSA+IDApIHtcbiAgICB2YXIgZmlyc3RWYWwgPSBzb3J0ZWRBcnJheVswXTtcbiAgICB2YXIgbGFzdFZhbCA9IHNvcnRlZEFycmF5W3NpemUgLSAxXTtcblxuICAgIGlmICh2YWx1ZSA8PSBmaXJzdFZhbClcbiAgICAgIGluZGV4ID0gMDtcbiAgICBlbHNlIGlmICh2YWx1ZSA+PSBsYXN0VmFsKVxuICAgICAgaW5kZXggPSBzaXplO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSBzaXplKVxuICAgICAgICBpbmRleCA9IE1hdGguZmxvb3IoKHNpemUgLSAxKSAqICh2YWx1ZSAtIGZpcnN0VmFsKSAvIChsYXN0VmFsIC0gZmlyc3RWYWwpKTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4XSA8IHZhbHVlKVxuICAgICAgICBpbmRleCsrO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXggLSAxXSA+PSB2YWx1ZSlcbiAgICAgICAgaW5kZXgtLTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5kZXg7XG59XG5cbi8qKlxuICogVXNlZCB3aXRoIGEgYnVmZmVyIHRvIHNlcnZlIGF1ZGlvIGZpbGVzIHZpYSBncmFudWxhciBzeW50aGVzaXMuXG4gKlxuICogVGhlIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBcInNjaGVkdWxlZFwiIGFuZCBcInRyYW5zcG9ydGVkXCIgaW50ZXJmYWNlcy5cbiAqIFdoZW4gXCJzY2hlZHVsZWRcIiwgdGhlIGVuZ2luZSAgZ2VuZXJhdGVzIHNlZ21lbnRzIG1vcmUgb3IgbGVzc8KgcGVyaW9kaWNhbGx5XG4gKiAoY29udHJvbGxlZCBieSB0aGUgcGVyaW9kQWJzLCBwZXJpb2RSZWwsIGFuZCBwZXJpb1ZhciBhdHRyaWJ1dGVzKS5cbiAqIFdoZW4gXCJ0cmFuc3BvcnRlZFwiLCB0aGUgZW5naW5lIGdlbmVyYXRlcyBzZWdtZW50cyBhdCB0aGUgcG9zaXRpb24gb2YgdGhlaXIgb25zZXQgdGltZS5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgYSBgU2VnbWVudEVuZ2luZWAgd2l0aCBhIGZldyBwYXJhbWV0ZXIgY29udHJvbHMgcnVubmluZyBpbiBhIGBTY2hlZHVsZXJgLlxuICoge0BsaW5rIGh0dHBzOi8vY2RuLnJhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvc2VnbWVudC1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmVcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBzY2hlZHVsZXIgPSBhdWRpby5nZXRTY2hlZHVsZXIoKTtcbiAqIGNvbnN0IHNlZ21lbnRFbmdpbmUgPSBuZXcgYXVkaW8uU2VnbWVudEVuZ2luZSgpO1xuICpcbiAqIHNjaGVkdWxlci5hZGQoc2VnbWVudEVuZ2luZSk7XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSAtIERlZmF1bHQgb3B0aW9uc1xuICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gW29wdGlvbnMuYnVmZmVyPW51bGxdIC0gQXVkaW8gYnVmZmVyXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kQWJzPTBdIC0gQWJzb2x1dGUgc2VnbWVudCBwZXJpb2QgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kUmVsPTFdIC0gU2VnbWVudCBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZFZhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmVcbiAqICB0byBzZWdtZW50IHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZE1pbj0wLjAwMV0gLSBNaW5pbXVtIHNlZ21lbnQgcGVyaW9kXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucG9zaXRpb25BcnJheT1bMC4wXV0gLSBBcnJheSBvZiBzZWdtZW50IHBvc2l0aW9ucyAob25zZXQgdGltZXNcbiAqICBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uVmFyPTBdIC0gQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uQXJyYXk9WzAuMF1dIC0gQXJyYXkgb2Ygc2VnbWVudCBkdXJhdGlvbnMgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHVyYXRpb25BYnM9MF0gLSBBYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uUmVsPTFdIC0gU2VnbWVudCBkdXJhdGlvbiByZWxhdGl2ZSB0byBnaXZlbiBzZWdtZW50XG4gKiAgZHVyYXRpb24gb3IgaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICogQHBhcmFtIHtBcnJheX0gW29wdGlvbnMub2Zmc2V0QXJyYXk9WzAuMF1dIC0gQXJyYXkgb2Ygc2VnbWVudCBvZmZzZXRzIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm9mZnNldEFicz0tMC4wMDVdIC0gQWJzb2x1dGUgc2VnbWVudCBvZmZzZXQgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMub2Zmc2V0UmVsPTBdIC0gU2VnbWVudCBvZmZzZXQgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmRlbGF5PTAuMDA1XSAtIFRpbWUgYnkgd2hpY2ggYWxsIHNlZ21lbnRzIGFyZSBkZWxheWVkIChlc3BlY2lhbGx5XG4gKiAgdG8gcmVhbGl6ZSBzZWdtZW50IG9mZnNldHMpXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuYXR0YWNrQWJzPTAuMDA1XSAtIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmF0dGFja1JlbD0wXSAtIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlQWJzPTAuMDA1XSAtIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlUmVsPTBdIC0gUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZXNhbXBsaW5nPTBdIC0gU2VnbWVudCByZXNhbXBsaW5nIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZXNhbXBsaW5nVmFyPTBdIC0gQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gTGluZWFyIGdhaW4gZmFjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuc2VnbWVudEluZGV4PTBdIC0gSW5kZXggb2YgdGhlIHNlZ21lbnQgdG8gc3ludGhlc2l6ZSAoaS5lLiBvZlxuICogIHRoaXMucG9zaXRpb25BcnJheS9kdXJhdGlvbkFycmF5L29mZnNldEFycmF5KVxuICogQHBhcmFtIHtCb29sfSBbb3B0aW9ucy5jeWNsaWM9ZmFsc2VdIC0gV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBzZWdtZW50IGluZGljZXMgYXJlXG4gKiAgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy53cmFwQXJvdW5kRXh0ZW5zaW9uPTBdIC0gUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXJcbiAqICB0aGF0IGhhcyBiZWVuIGNvcGllZCBmcm9tIHRoZSBiZWdpbm5pbmcgdG8gYXNzdXJlIGN5Y2xpYyBiZWhhdmlvclxuICovXG5jbGFzcyBTZWdtZW50RW5naW5lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQG5hbWUgYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBwZXJpb2QgaW4gc2VjXG4gICAgICogQG5hbWUgcGVyaW9kQWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAbmFtZSBwZXJpb2RSZWxcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kUmVsID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RSZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBzZWdtZW50IHBlcmlvZFxuICAgICAqIEBuYW1lIHBlcmlvZFZhclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RWYXIgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBNaW5pbXVtIHNlZ21lbnQgcGVyaW9kXG4gICAgICogQG5hbWUgcGVyaW9kTWluXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwMVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RNaW4gPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZE1pbiwgMC4wMDEpO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBwb3NpdGlvbnMgKG9uc2V0IHRpbWVzIGluIGF1ZGlvIGJ1ZmZlcikgaW4gc2VjXG4gICAgICogQG5hbWUgcG9zaXRpb25BcnJheVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgWzAuMF1cbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25BcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25BcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICAgICAqIEBuYW1lIHBvc2l0aW9uVmFyXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvblZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IGR1cmF0aW9ucyBpbiBzZWNcbiAgICAgKiBAbmFtZSBkdXJhdGlvbkFycmF5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCBbMC4wXVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFycmF5LCBbMC4wXSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uIGluIHNlY1xuICAgICAqIEBuYW1lIGR1cmF0aW9uQWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdpdmVuIHNlZ21lbnQgZHVyYXRpb24gb3IgaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICAgICAqIEBuYW1lIGR1cmF0aW9uUmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uUmVsID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvblJlbCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IG9mZnNldHMgaW4gc2VjXG4gICAgICpcbiAgICAgKiBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAqIG9mZnNldCA8IDA6IHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uIGlzIHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uXG4gICAgICogYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgKlxuICAgICAqIEBuYW1lIG9mZnNldEFycmF5XG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBkZWZhdWx0IFswLjBdXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldEFycmF5ID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRBcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBvZmZzZXQgaW4gc2VjXG4gICAgICogQG5hbWUgb2Zmc2V0QWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAtMC4wMDVcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0QWJzID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRBYnMsIC0wLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IG9mZnNldCByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQG5hbWUgb2Zmc2V0UmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0UmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFRpbWUgYnkgd2hpY2ggYWxsIHNlZ21lbnRzIGFyZSBkZWxheWVkIChlc3BlY2lhbGx5IHRvIHJlYWxpemUgc2VnbWVudCBvZmZzZXRzKVxuICAgICAqIEBuYW1lIGRlbGF5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwNVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kZWxheSA9IG9wdE9yRGVmKG9wdGlvbnMuZGVsYXksIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEBuYW1lIGF0dGFja0Fic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMC4wMDVcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrQWJzID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tBYnMsIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgKiBAbmFtZSBhdHRhY2tSZWxcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrUmVsID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgcmVsZWFzZSB0aW1lIGluIHNlY1xuICAgICAqIEBuYW1lIHJlbGVhc2VBYnNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VBYnMgPSBvcHRPckRlZihvcHRpb25zLnJlbGVhc2VBYnMsIDAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQG5hbWUgcmVsZWFzZVJlbFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlUmVsID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgcmVzYW1wbGluZyBpbiBjZW50XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1ZhclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgICAqIEBuYW1lIGdhaW5cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDFcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZ2FpbiA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBJbmRleCBvZiB0aGUgc2VnbWVudCB0byBzeW50aGVzaXplIChpLmUuIG9mIHRoaXMucG9zaXRpb25BcnJheS9kdXJhdGlvbkFycmF5L29mZnNldEFycmF5KVxuICAgICAqIEBuYW1lIHNlZ21lbnRJbmRleFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBvcHRPckRlZihvcHRpb25zLnNlZ21lbnRJbmRleCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIHNlZ21lbnQgaW5kaWNlcyBhcmUgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICAgKiBAbmFtZSBjeWNsaWNcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5jeWNsaWMgPSBvcHRPckRlZihvcHRpb25zLmN5Y2xpYywgZmFsc2UpO1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKiBAbmFtZSB3cmFwQXJvdW5kRXh0ZW5zaW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLndyYXBBcm91bmRFeHRlbnNpb24pXG4gICAgICAgIGJ1ZmZlckR1cmF0aW9uIC09IHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbjtcblxuICAgICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnRyaWdnZXIodGltZSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG4gICAgdmFyIGN5Y2xpY09mZnNldCA9IDA7XG4gICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgdmFyIGN5Y2xlcyA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIGN5Y2xpY09mZnNldCA9IE1hdGguZmxvb3IoY3ljbGVzKSAqIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgcG9zaXRpb24gLT0gY3ljbGljT2Zmc2V0O1xuICAgIH1cblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4ID0gZ2V0Q3VycmVudE9yTmV4dEluZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPj0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIGN5Y2xpY09mZnNldCArPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgaW5kZXggPSBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgIGN5Y2xpY09mZnNldCAtPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICB9XG5cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSBjeWNsaWNPZmZzZXQ7XG5cbiAgICByZXR1cm4gY3ljbGljT2Zmc2V0ICsgdGhpcy5wb3NpdGlvbkFycmF5W2luZGV4XTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcbiAgICB2YXIgY3ljbGljT2Zmc2V0ID0gdGhpcy5fX2N5Y2xpY09mZnNldDtcblxuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4Kys7XG5cbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgY3ljbGljT2Zmc2V0ICs9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4LS07XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgY3ljbGljT2Zmc2V0IC09IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gLUluZmluaXR5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IGN5Y2xpY09mZnNldDtcblxuICAgIHJldHVybiBjeWNsaWNPZmZzZXQgKyB0aGlzLnBvc2l0aW9uQXJyYXlbaW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBzZWdtZW50LlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQvdHJhbnNwb3J0ZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBzZWdtZW50IGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzZWdtZW50IHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHNlZ21lbnQgc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBwZXJpb2QgdG8gbmV4dCBzZWdtZW50XG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIHNlZ21lbnRUaW1lID0gKHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSArIHRoaXMuZGVsYXk7XG4gICAgdmFyIHNlZ21lbnRQZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgc2VnbWVudEluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBzZWdtZW50UG9zaXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudER1cmF0aW9uID0gMC4wO1xuICAgICAgdmFyIHNlZ21lbnRPZmZzZXQgPSAwLjA7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5jeWNsaWMpXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCAlIHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGg7XG4gICAgICBlbHNlXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNlZ21lbnRJbmRleCwgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDEpKTtcblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMuZHVyYXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMub2Zmc2V0QXJyYXkpXG4gICAgICAgIHNlZ21lbnRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwIHx8IHRoaXMucGVyaW9kUmVsID4gMCkge1xuICAgICAgICB2YXIgbmV4dFNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24sIG5leHRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG5leHRTZWdtZW50SW5kZXggPT09IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVswXSArIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVtuZXh0U2VnbWVudEluZGV4XTtcbiAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVtuZXh0U2VnbWVudEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbnRlclNlZ21lbnREaXN0YW5jZSA9IG5leHRQb3NpdGlvbiAtIHNlZ21lbnRQb3NpdGlvbjtcblxuICAgICAgICAvLyBjb3JyZWN0IGludGVyLXNlZ21lbnQgZGlzdGFuY2UgYnkgb2Zmc2V0c1xuICAgICAgICAvLyAgIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICAgIGlmIChzZWdtZW50T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSAtPSBzZWdtZW50T2Zmc2V0O1xuXG4gICAgICAgIGlmIChuZXh0T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSArPSBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIGlmIChpbnRlclNlZ21lbnREaXN0YW5jZSA8IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgPSAwO1xuXG4gICAgICAgIC8vIHVzZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlIGluc3RlYWQgb2Ygc2VnbWVudCBkdXJhdGlvblxuICAgICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwKVxuICAgICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IGludGVyU2VnbWVudERpc3RhbmNlO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXIgbWFya2VyIGRpc3RhbmNlXG4gICAgICAgIHNlZ21lbnRQZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBpbnRlclNlZ21lbnREaXN0YW5jZTtcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uXG4gICAgICBzZWdtZW50RHVyYXRpb24gKj0gdGhpcy5kdXJhdGlvblJlbDtcbiAgICAgIHNlZ21lbnREdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgICAvLyBhZGQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHNlZ21lbnQgb2Zmc2V0XG4gICAgICBzZWdtZW50T2Zmc2V0ICo9IHRoaXMub2Zmc2V0UmVsO1xuICAgICAgc2VnbWVudE9mZnNldCArPSB0aGlzLm9mZnNldEFicztcblxuICAgICAgLy8gYXBwbHkgc2VnbWVudCBvZmZzZXRcbiAgICAgIC8vICAgb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgIC8vICAgb2Zmc2V0IDwgMDogdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb24gaXMgdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgIGlmIChzZWdtZW50T2Zmc2V0IDwgMCkge1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gLT0gc2VnbWVudE9mZnNldDtcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uICs9IHNlZ21lbnRPZmZzZXQ7XG4gICAgICAgIHNlZ21lbnRUaW1lICs9IChzZWdtZW50T2Zmc2V0IC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudFRpbWUgLT0gKHNlZ21lbnRPZmZzZXQgLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBzZWdtZW50IHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICAvLyBzaG9ydGVuIGR1cmF0aW9uIG9mIHNlZ21lbnRzIG92ZXIgdGhlIGVkZ2VzIG9mIHRoZSBidWZmZXJcbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gPCAwKSB7XG4gICAgICAgIC8vc2VnbWVudFRpbWUgLT0gZ3JhaW5Qb3NpdGlvbjsgaG0sIG5vdCBzdXJlIGlmIHdlIHdhbnQgdG8gZG8gdGhpc1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gKz0gc2VnbWVudFBvc2l0aW9uO1xuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VnbWVudFBvc2l0aW9uICsgc2VnbWVudER1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gc2VnbWVudFBvc2l0aW9uO1xuXG4gICAgICBzZWdtZW50RHVyYXRpb24gLz0gcmVzYW1wbGluZ1JhdGU7XG5cbiAgICAgIC8vIG1ha2Ugc2VnbWVudFxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgc2VnbWVudER1cmF0aW9uID4gMCkge1xuICAgICAgICAvLyBtYWtlIHNlZ21lbnQgZW52ZWxvcGVcbiAgICAgICAgdmFyIGVudmVsb3BlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdmFyIGF0dGFjayA9IHRoaXMuYXR0YWNrQWJzICsgdGhpcy5hdHRhY2tSZWwgKiBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlID0gdGhpcy5yZWxlYXNlQWJzICsgdGhpcy5yZWxlYXNlUmVsICogc2VnbWVudER1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gc2VnbWVudER1cmF0aW9uKSB7XG4gICAgICAgICAgdmFyIGZhY3RvciA9IHNlZ21lbnREdXJhdGlvbiAvIChhdHRhY2sgKyByZWxlYXNlKTtcbiAgICAgICAgICBhdHRhY2sgKj0gZmFjdG9yO1xuICAgICAgICAgIHJlbGVhc2UgKj0gZmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGFja0VuZFRpbWUgPSBzZWdtZW50VGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIHNlZ21lbnRFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gc2VnbWVudEVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4udmFsdWUgPSAwO1xuICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5nYWluLCByZWxlYXNlU3RhcnRUaW1lKTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudEVuZFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChzZWdtZW50VGltZSwgc2VnbWVudFBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3Aoc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGdyYWluIHBlcmlvZCByYW5kb24gdmFyaWF0aW9uXG4gICAgaWYgKHRoaXMucGVyaW9kVmFyID4gMC4wKVxuICAgICAgc2VnbWVudFBlcmlvZCArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBlcmlvZFZhciAqIGdyYWluUGVyaW9kO1xuXG4gICAgcmV0dXJuIE1hdGgubWF4KHRoaXMucGVyaW9kTWluLCBzZWdtZW50UGVyaW9kKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZWdtZW50RW5naW5lO1xuIiwiLy8gY29yZVxuZXhwb3J0IHsgZGVmYXVsdCBhcyBhdWRpb0NvbnRleHQgfSBmcm9tICcuL2NvcmUvYXVkaW8tY29udGV4dCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFRpbWVFbmdpbmUgfSBmcm9tICcuL2NvcmUvdGltZS1lbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBBdWRpb1RpbWVFbmdpbmUgfSBmcm9tICcuL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQcmlvcml0eVF1ZXVlIH0gZnJvbSAnLi9jb3JlL3ByaW9yaXR5LXF1ZXVlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2NoZWR1bGluZ1F1ZXVlIH0gZnJvbSAnLi9jb3JlL3NjaGVkdWxpbmctcXVldWUnO1xuXG4vLyBlbmdpbmVzXG5leHBvcnQgeyBkZWZhdWx0IGFzIEdyYW51bGFyRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL2dyYW51bGFyLWVuZ2luZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIE1ldHJvbm9tZSB9IGZyb20gJy4vZW5naW5lcy9tZXRyb25vbWUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQbGF5ZXJFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvcGxheWVyLWVuZ2luZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNlZ21lbnRFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvc2VnbWVudC1lbmdpbmUnO1xuXG4vLyBtYXN0ZXJzXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBsYXlDb250cm9sIH0gZnJvbSAnLi9tYXN0ZXJzL3BsYXktY29udHJvbCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFRyYW5zcG9ydCB9IGZyb20gJy4vbWFzdGVycy90cmFuc3BvcnQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTY2hlZHVsZXIgfSBmcm9tICcuL21hc3RlcnMvc2NoZWR1bGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2ltcGxlU2NoZWR1bGVyIH0gZnJvbSAnLi9tYXN0ZXJzL3NpbXBsZS1zY2hlZHVsZXInO1xuXG4vLyBmYWN0b3JpZXNcbmV4cG9ydCB7IGdldFNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9mYWN0b3JpZXMnO1xuZXhwb3J0IHsgZ2V0U2ltcGxlU2NoZWR1bGVyIH0gZnJvbSAnLi9tYXN0ZXJzL2ZhY3Rvcmllcyc7XG4iLCIvLyBzY2hlZHVsZXJzIHNob3VsZCBiZSBzaW5nbGV0b25zXG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcic7XG5pbXBvcnQgU2ltcGxlU2NoZWR1bGVyIGZyb20gJy4vc2ltcGxlLXNjaGVkdWxlcic7XG5cbmNvbnN0IHNjaGVkdWxlck1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBzaW1wbGVTY2hlZHVsZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xuXG4vKipcbiAqIFJldHVybnMgYSB1bmlxdWUgaW5zdGFuY2Ugb2YgYFNjaGVkdWxlcmBcbiAqXG4gKiBAZ2xvYmFsXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtTY2hlZHVsZXJ9XG4gKiBAc2VlIFNjaGVkdWxlclxuICovXG5leHBvcnQgY29uc3QgZ2V0U2NoZWR1bGVyID0gZnVuY3Rpb24oYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2NoZWR1bGVyID0gc2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2NoZWR1bGVyKSB7XG4gICAgc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih7IGF1ZGlvQ29udGV4dDogYXVkaW9Db250ZXh0IH0pO1xuICAgIHNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNjaGVkdWxlcjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHVuaXF1ZSBpbnN0YW5jZSBvZiBgU2ltcGxlU2NoZWR1bGVyYFxuICpcbiAqIEBnbG9iYWxcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge1NpbXBsZVNjaGVkdWxlcn1cbiAqIEBzZWUgU2ltcGxlU2NoZWR1bGVyXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTaW1wbGVTY2hlZHVsZXIgPSBmdW5jdGlvbihhdWRpb0NvbnRleHQgPSBkZWZhdWx0QXVkaW9Db250ZXh0KSB7XG4gIGxldCBzaW1wbGVTY2hlZHVsZXIgPSBzaW1wbGVTY2hlZHVsZXJNYXAuZ2V0KGF1ZGlvQ29udGV4dCk7XG5cbiAgaWYgKCFzaW1wbGVTY2hlZHVsZXIpIHtcbiAgICBzaW1wbGVTY2hlZHVsZXIgPSBuZXcgU2ltcGxlU2NoZWR1bGVyKHsgYXVkaW9Db250ZXh0OiBhdWRpb0NvbnRleHQgfSk7XG4gICAgc2ltcGxlU2NoZWR1bGVyTWFwLnNldChhdWRpb0NvbnRleHQsIHNpbXBsZVNjaGVkdWxlcik7XG4gIH1cblxuICByZXR1cm4gc2ltcGxlU2NoZWR1bGVyO1xufTtcbiIsImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgU2NoZWR1bGluZ1F1ZXVlIGZyb20gJy4uL2NvcmUvc2NoZWR1bGluZy1xdWV1ZSc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCB7IGdldFNjaGVkdWxlciB9IGZyb20gJy4vZmFjdG9yaWVzJztcblxuY29uc3QgRVNQSUxPTiA9IDFlLTg7XG5cbmNsYXNzIExvb3BDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuc3BlZWQgPSAxO1xuICAgIHRoaXMubG93ZXIgPSAtSW5maW5pdHk7XG4gICAgdGhpcy51cHBlciA9IEluZmluaXR5O1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICBjb25zdCBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICBjb25zdCBzcGVlZCA9IHRoaXMuc3BlZWQ7XG4gICAgY29uc3QgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIGNvbnN0IHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDApXG4gICAgICB0aW1lICs9IEVTUElMT047XG4gICAgZWxzZVxuICAgICAgdGltZSAtPSBFUFNJTE9OO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIGxvd2VyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlcikgLSBFU1BJTE9OO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgdXBwZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyKSArIEVTUElMT047XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgcmVzY2hlZHVsZShzcGVlZCkge1xuICAgIGNvbnN0IHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIGNvbnN0IGxvd2VyID0gTWF0aC5taW4ocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG4gICAgY29uc3QgdXBwZXIgPSBNYXRoLm1heChwbGF5Q29udHJvbC5fX2xvb3BTdGFydCwgcGxheUNvbnRyb2wuX19sb29wRW5kKTtcblxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLmxvd2VyID0gbG93ZXI7XG4gICAgdGhpcy51cHBlciA9IHVwcGVyO1xuXG4gICAgaWYgKGxvd2VyID09PSB1cHBlcilcbiAgICAgIHNwZWVkID0gMDtcblxuICAgIGlmIChzcGVlZCA+IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHVwcGVyKSAtIEVTUElMT04pO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIpICsgRVNQSUxPTik7XG4gICAgZWxzZVxuICAgICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBjb25zdCBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgY29uc3QgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA+PSB1cHBlcilcbiAgICAgIHJldHVybiBsb3dlciArIChwb3NpdGlvbiAtIGxvd2VyKSAlICh1cHBlciAtIGxvd2VyKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPCBsb3dlcilcbiAgICAgIHJldHVybiB1cHBlciAtICh1cHBlciAtIHBvc2l0aW9uKSAlICh1cHBlciAtIGxvd2VyKTtcblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2xsZWQgYmFzZSBjbGFzc1xuY2xhc3MgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrKTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcblxuICAgIHRoaXMuX19lbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIGVuZ2luZXMgaW1wbGVtZW50aW5nIHRoZSAqc3BlZWQtY29udHJvbGxlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBmb3IgZW5naW5lcyBpbXBsbWVudGluZyB0aGUgKnRyYW5zcG9ydGVkKiBpbnRlcmZhY2VcbmNsYXNzIFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFBsYXlDb250cm9sbGVkU2NoZWR1bGVySG9vayhwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IChzZWVrICYmIHNwZWVkICE9PSAwKSkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbjtcblxuICAgICAgLy8gcmVzeW5jIHRyYW5zcG9ydGVkIGVuZ2luZXNcbiAgICAgIGlmIChzZWVrIHx8IHNwZWVkICogbGFzdFNwZWVkIDwgMCkge1xuICAgICAgICAvLyBzZWVrIG9yIHJldmVyc2UgZGlyZWN0aW9uXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdGFydFxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdG9wXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgICAgIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZClcbiAgICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKSB7XG4gICAgICAgIC8vIGNoYW5nZSBzcGVlZCB3aXRob3V0IHJldmVyc2luZyBkaXJlY3Rpb25cbiAgICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24oZW5naW5lLCBwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgICB2YXIgdGltZSA9IHBsYXlDb250cm9sLl9fc3luYygpO1xuXG4gICAgICBwb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBsYXlDb250cm9sLl9fcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIH1cblxuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5kZXN0cm95KCk7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBudWxsO1xuXG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBmb3IgdGltZSBlbmdpbmVzIGltcGxlbWVudGluZyB0aGUgKnNjaGVkdWxlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuXG4gICAgLy8gc2NoZWR1bGluZyBxdWV1ZSBiZWNvbWVzIG1hc3RlciBvZiBlbmdpbmVcbiAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFBsYXlDb250cm9sbGVkU2NoZWR1bGluZ1F1ZXVlKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgaWYgKGxhc3RTcGVlZCA9PT0gMCAmJiBzcGVlZCAhPT0gMCkgLy8gc3RhcnQgb3Igc2Vla1xuICAgICAgdGhpcy5fX2VuZ2luZS5yZXNldFRpbWUoKTtcbiAgICBlbHNlIGlmIChsYXN0U3BlZWQgIT09IDAgJiYgc3BlZWQgPT09IDApIC8vIHN0b3BcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZS5kZXN0cm95KCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIHRyYW5zbGF0ZXMgdHJhbnNwb3J0ZWQgZW5naW5lIGFkdmFuY2VQb3NpdGlvbiBpbnRvIGdsb2JhbCBzY2hlZHVsZXIgdGltZXNcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGVySG9vayBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgcGxheUNvbnRyb2wuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIGVuZ2luZSA9IHRoaXMuX19lbmdpbmU7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgdmFyIG5leHRUaW1lID0gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbikge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3BsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIGludGVybmFsIHNjaGVkdWxpbmcgcXVldWUgdGhhdCByZXR1cm5zIHRoZSBjdXJyZW50IHBvc2l0aW9uIChhbmQgdGltZSkgb2YgdGhlIHBsYXkgY29udHJvbFxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gICAgcGxheUNvbnRyb2wuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZSh0aGlzLl9fZW5naW5lKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuXG4vKipcbiAqIEV4dGVuZHMgVGltZSBFbmdpbmUgdG8gcHJvdmlkZSBwbGF5YmFjayBjb250cm9sIG9mIGEgVGltZSBFbmdpbmUgaW5zdGFuY2UuXG4gKlxuICogW2V4YW1wbGVde0BsaW5rIGh0dHBzOi8vY2RuLnJhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvcGxheS1jb250cm9sLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgVGltZUVuZ2luZVxuICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBlbmdpbmUgdG8gY29udHJvbFxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBwbGF5ZXJFbmdpbmUgPSBhdWRpby5QbGF5ZXJFbmdpbmUoKTtcbiAqIGNvbnN0IHBsYXlDb250cm9sID0gbmV3IGF1ZGlvLlBsYXlDb250cm9sKHBsYXllckVuZ2luZSk7XG4gKlxuICogcGxheUNvbnRyb2wuc3RhcnQoKTtcbiAqL1xuY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoZW5naW5lLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCBkZWZhdWx0QXVkaW9Db250ZXh0O1xuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIodGhpcy5hdWRpb0NvbnRleHQpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcblxuICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2xvb3BTdGFydCA9IDA7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSAxO1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZSlcbiAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcbiAgfVxuXG4gIF9fc2V0RW5naW5lKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZChlbmdpbmUpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gcGxheSBjb250cm9sXCIpO1xuICB9XG5cbiAgX19yZXNldEVuZ2luZSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgdGltZSBmb3IgZ2l2ZW4gcG9zaXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHRpbWVcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICB2YXIgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lLlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgcGxheS1jb250cm9sIGlzIGFkZGVkIHRvIGEgbWFzdGVyLlxuICAgKlxuICAgKiBAbmFtZSBjdXJyZW50VGltZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgUGxheUNvbnRyb2xcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciBwb3NpdGlvbi5cbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICpcbiAgICogQG5hbWUgY3VycmVudFBvc2l0aW9uXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIHNldChlbmdpbmUgPSBudWxsKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHZhciBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQgIT09IG51bGwgJiYgdGhpcy5fX3BsYXlDb250cm9sbGVkLl9fZW5naW5lICE9PSBlbmdpbmUpIHtcblxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcblxuICAgICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZClcbiAgICAgICAgdGhpcy5fX3Jlc2V0RW5naW5lKCk7XG5cblxuICAgICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCA9PT0gbnVsbCAmJiBlbmdpbmUgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fX3NldEVuZ2luZShlbmdpbmUpO1xuXG4gICAgICAgIGlmIChzcGVlZCAhPT0gMClcbiAgICAgICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcGxheSBjb250cm9sIGxvb3AgYmVoYXZpb3IuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAbmFtZSBsb29wXG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBsb29wKGVuYWJsZSkge1xuICAgIGlmIChlbmFibGUgJiYgdGhpcy5fX2xvb3BTdGFydCA+IC1JbmZpbml0eSAmJiB0aGlzLl9fbG9vcEVuZCA8IEluZmluaXR5KSB7XG4gICAgICBpZiAoIXRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBuZXcgTG9vcENvbnRyb2wodGhpcyk7XG4gICAgICAgIHRoaXMuX19zY2hlZHVsZXIuYWRkKHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5jdXJyZW50UG9zaXRpb247XG4gICAgICAgIGNvbnN0IGxvd2VyID0gTWF0aC5taW4odGhpcy5fX2xvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICAgICAgICBjb25zdCB1cHBlciA9IE1hdGgubWF4KHRoaXMuX19sb29wU3RhcnQsIHRoaXMuX19sb29wRW5kKTtcblxuICAgICAgICBpZiAodGhpcy5fX3NwZWVkID4gMCAmJiBwb3NpdGlvbiA+IHVwcGVyKVxuICAgICAgICAgIHRoaXMuc2Vlayh1cHBlcik7XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX19zcGVlZCA8IDAgJiYgcG9zaXRpb24gPCBsb3dlcilcbiAgICAgICAgICB0aGlzLnNlZWsobG93ZXIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sLnJlc2NoZWR1bGUodGhpcy5fX3NwZWVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgdGhpcy5fX3NjaGVkdWxlci5yZW1vdmUodGhpcy5fX2xvb3BDb250cm9sKTtcbiAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGxvb3AoKSB7XG4gICAgcmV0dXJuICghIXRoaXMuX19sb29wQ29udHJvbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBsb29wIHN0YXJ0IGFuZCBlbmQgdGltZS5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxvb3BTdGFydCAtIGxvb3Agc3RhcnQgdmFsdWUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsb29wRW5kIC0gbG9vcCBlbmQgdmFsdWUuXG4gICAqL1xuICBzZXRMb29wQm91bmRhcmllcyhsb29wU3RhcnQsIGxvb3BFbmQpIHtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gbG9vcFN0YXJ0O1xuICAgIHRoaXMuX19sb29wRW5kID0gbG9vcEVuZDtcblxuICAgIHRoaXMubG9vcCA9IHRoaXMubG9vcDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGxvb3Agc3RhcnQgdmFsdWVcbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgbG9vcFN0YXJ0XG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBsb29wU3RhcnQobG9vcFN0YXJ0KSB7XG4gICAgdGhpcy5zZXRMb29wQm91bmRhcmllcyhsb29wU3RhcnQsIHRoaXMuX19sb29wRW5kKTtcbiAgfVxuXG4gIGdldCBsb29wU3RhcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wU3RhcnQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBsb29wIGVuZCB2YWx1ZVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBsb29wRW5kXG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBsb29wRW5kKGxvb3BFbmQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGxvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBwbGF5YmFja1xuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgdGhpcy5fX3BsYXlpbmdTcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHBsYXliYWNrIGFuZCBzdGF5cyBhdCB0aGUgc2FtZSBwb3NpdGlvbi5cbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHBsYXliYWNrIGFuZCBzZWVrcyB0byBpbml0aWFsICgwKSBwb3NpdGlvbi5cbiAgICovXG4gIHN0b3AoKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gICAgdGhpcy5zZWVrKDApO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHNwZWVkIGlmIHByb3ZpZGVkLCBzZXRzIHRoZSBwbGF5YmFjayBzcGVlZC4gVGhlIHNwZWVkIHZhbHVlIHNob3VsZFxuICAgKiBiZSBub24temVybyBiZXR3ZWVuIC0xNiBhbmQgLTEvMTYgb3IgYmV0d2VlbiAxLzE2IGFuZCAxNi5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgc3BlZWRcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAoIXRoaXMubWFzdGVyICYmIHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZ2V0IHNwZWVkKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheWluZ1NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCAoanVtcCB0bykgcGxheWluZyBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5Q29udHJvbDtcbiIsImltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi9jb3JlL3NjaGVkdWxpbmctcXVldWUnO1xuXG5jb25zdCBsb2cgPSBkZWJ1Zygnd2F2ZXNqczphdWRpbycpO1xuXG4vKipcbiAqIFRoZSBgU2NoZWR1bGVyYCBjbGFzcyBpbXBsZW1lbnRzIGEgbWFzdGVyIGZvciBgVGltZUVuZ2luZWAgb3IgYEF1ZGlvVGltZUVuZ2luZWBcbiAqIGluc3RhbmNlcyB0aGF0IGltcGxlbWVudCB0aGUgKnNjaGVkdWxlZCogaW50ZXJmYWNlIHN1Y2ggYXMgdGhlIGBNZXRyb25vbWVgXG4gKiBgR3JhbnVsYXJFbmdpbmVgLlxuICpcbiAqIEEgYFNjaGVkdWxlcmAgY2FuIGFsc28gc2NoZWR1bGUgc2ltcGxlIGNhbGxiYWNrIGZ1bmN0aW9ucy5cbiAqIFRoZSBjbGFzcyBpcyBiYXNlZCBvbiByZWN1cnNpdmUgY2FsbHMgdG8gYHNldFRpbWVPdXRgIGFuZCB1c2VzIHRoZVxuICogYGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZWAgYXMgbG9naWNhbCBwYXNzZWQgdG8gdGhlIGBhZHZhbmNlVGltZWAgbWV0aG9kc1xuICogb2YgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIG9yIHRvIHRoZSBzY2hlZHVsZWQgY2FsbGJhY2sgZnVuY3Rpb25zLlxuICogSXQgZXh0ZW5kcyB0aGUgYFNjaGVkdWxpbmdRdWV1ZWAgY2xhc3MgdGhhdCBpdHNlbGYgaW5jbHVkZXMgYSBgUHJpb3JpdHlRdWV1ZWBcbiAqIHRvIGFzc3VyZSB0aGUgb3JkZXIgb2YgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIChzZWUgYFNpbXBsZVNjaGVkdWxlcmAgZm9yIGFcbiAqIHNpbXBsaWZpZWQgc2NoZWR1bGVyIGltcGxlbWVudGF0aW9uIHdpdGhvdXQgYFByaW9yaXR5UXVldWVgKS5cbiAqXG4gKiBUbyBnZXQgYSB1bmlxdWUgaW5zdGFuY2Ugb2YgYFNjaGVkdWxlcmAgYXMgdGhlIGdsb2JhbCBzY2hlZHVsZXIgb2YgYW5cbiAqIGFwcGxpY2F0aW9uLCB0aGUgYGdldFNjaGVkdWxlcmAgZmFjdG9yeSBmdW5jdGlvbiBzaG91bGQgYmUgdXNlZC4gVGhlXG4gKiBmdW5jdGlvbiBhY2NlcHRzIGFuIGF1ZGlvIGNvbnRleHQgYXMgb3B0aW9uYWwgYXJndW1lbnQgYW5kIHVzZXMgdGhlIFdhdmVzXG4gKiBkZWZhdWx0IGF1ZGlvIGNvbnRleHQgKHNlZSBgYXVkaW9Db250ZXh0YCkgYXNcbiAqIGRlZmF1bHQuIFRoZSBmYWN0b3J5IGNyZWF0ZXMgYSBzaW5nbGUgc2NoZWR1bGVyIGZvciBlYWNoIGF1ZGlvIGNvbnRleHQuXG4gKlxuICogRXhhbXBsZSB0aGF0IHNob3dzIHRocmVlIE1ldHJvbm9tZSBlbmdpbmVzIHJ1bm5pbmcgaW4gYSBTY2hlZHVsZXI6XG4gKiB7QGxpbmsgaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy9zY2hlZHVsZXIuaHRtbH1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gZGVmYXVsdCBvcHRpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kPTAuMDI1XSAtIHBlcmlvZCBvZiB0aGUgc2NoZWR1bGVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmxvb2thaGVhZD0wLjFdIC0gbG9va2FoZWFkIG9mIHRoZSBzY2hlZHVsZXIuXG4gKlxuICogQHNlZSBUaW1lRW5naW5lXG4gKiBAc2VlIEF1ZGlvVGltZUVuZ2luZVxuICogQHNlZSBnZXRTY2hlZHVsZXJcbiAqIEBzZWUgU2ltcGxlU2NoZWR1bGVyXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHNjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuICpcbiAqIHNjaGVkdWxlci5hZGQobXlFbmdpbmUpO1xuICovXG5jbGFzcyBTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCDCoGRlZmF1bHRBdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IEluZmluaXR5O1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciAoc2V0VGltZW91dCkgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RcbiAgICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCDCoDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGxvb2thaGVhZFxuICAgICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IMKgMC4xO1xuICB9XG5cbiAgLy8gc2V0VGltZW91dCBzY2hlZHVsaW5nIGxvb3BcbiAgX190aWNrKCkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIGxldCB0aW1lID0gdGhpcy5fX25leHRUaW1lO1xuXG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgd2hpbGUgKHRpbWUgPD0gY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZCkge1xuICAgICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgIHRpbWUgPSB0aGlzLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpIHtcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0KHRoaXMsIHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgaWYgKHRoaXMuX19uZXh0VGltZSA9PT0gSW5maW5pdHkpXG4gICAgICAgICAgbG9nKCdTY2hlZHVsZXIgU3RhcnQnKTtcblxuICAgICAgICBjb25zdCB0aW1lT3V0RGVsYXkgPSBNYXRoLm1heCgodGltZSAtIHRoaXMubG9va2FoZWFkIC0gdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpLCB0aGlzLnBlcmlvZCk7XG5cbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgICB9LCB0aW1lT3V0RGVsYXkgKiAxMDAwKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX25leHRUaW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICBsb2coJ1NjaGVkdWxlciBTdG9wJyk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19uZXh0VGltZSA9IHRpbWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlciBjdXJyZW50IGxvZ2ljYWwgdGltZS5cbiAgICpcbiAgICogQG5hbWUgY3VycmVudFRpbWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG5cbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBpbmhlcml0ZWQgZnJvbSBzY2hlZHVsaW5nIHF1ZXVlXG4gIC8qKlxuICAgKiBBZGQgYSBUaW1lRW5naW5lIG9yIGEgc2ltcGxlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRoZSBzY2hlZHVsZXIgYXQgYW5cbiAgICogb3B0aW9uYWxseSBnaXZlbiB0aW1lLiBXaGV0aGVyIHRoZSBhZGQgbWV0aG9kIGlzIGNhbGxlZCB3aXRoIGEgVGltZUVuZ2luZVxuICAgKiBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIGl0IHJldHVybnMgYSBUaW1lRW5naW5lIHRoYXQgY2FuIGJlIHVzZWQgYXMgYXJndW1lbnRcbiAgICogb2YgdGhlIG1ldGhvZHMgcmVtb3ZlIGFuZCByZXNldEVuZ2luZVRpbWUuIEEgVGltZUVuZ2luZSBhZGRlZCB0byBhIHNjaGVkdWxlclxuICAgKiBoYXMgdG8gaW1wbGVtZW50IHRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gYWRkZWQgdG8gYVxuICAgKiBzY2hlZHVsZXIgd2lsbCBiZSBjYWxsZWQgYXQgdGhlIGdpdmVuIHRpbWUgYW5kIHdpdGggdGhlIGdpdmVuIHRpbWUgYXNcbiAgICogYXJndW1lbnQuIFRoZSBjYWxsYmFjayBjYW4gcmV0dXJuIGEgbmV3IHNjaGVkdWxpbmcgdGltZSAoaS5lLiB0aGUgbmV4dFxuICAgKiB0aW1lIHdoZW4gaXQgd2lsbCBiZSBjYWxsZWQpIG9yIGl0IGNhbiByZXR1cm4gSW5maW5pdHkgdG8gc3VzcGVuZCBzY2hlZHVsaW5nXG4gICAqIHdpdGhvdXQgcmVtb3ZpbmcgdGhlIGZ1bmN0aW9uIGZyb20gdGhlIHNjaGVkdWxlci4gQSBmdW5jdGlvbiB0aGF0IGRvZXNcbiAgICogbm90IHJldHVybiBhIHZhbHVlIChvciByZXR1cm5zIG51bGwgb3IgMCkgaXMgcmVtb3ZlZCBmcm9tIHRoZSBzY2hlZHVsZXJcbiAgICogYW5kIGNhbm5vdCBiZSB1c2VkIGFzIGFyZ3VtZW50IG9mIHRoZSBtZXRob2RzIHJlbW92ZSBhbmQgcmVzZXRFbmdpbmVUaW1lXG4gICAqIGFueW1vcmUuXG4gICAqXG4gICAqIEBuYW1lIGFkZFxuICAgKiBAZnVuY3Rpb25cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfEZ1bmN0aW9ufSBlbmdpbmUgLSBFbmdpbmUgdG8gYWRkIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFt0aW1lPXRoaXMuY3VycmVudFRpbWVdIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgLyoqXG4gICAqIFJlbW92ZSBhIFRpbWVFbmdpbmUgZnJvbSB0aGUgc2NoZWR1bGVyIHRoYXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlXG4gICAqIHNjaGVkdWxlciB1c2luZyB0aGUgYWRkIG1ldGhvZC5cbiAgICpcbiAgICogQG5hbWUgYWRkXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZW1vdmUgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIC8qKlxuICAgKiBSZXNjaGVkdWxlIGEgc2NoZWR1bGVkIHRpbWUgZW5naW5lIGF0IGEgZ2l2ZW4gdGltZS5cbiAgICpcbiAgICogQG5hbWUgcmVzZXRFbmdpbmVUaW1lXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZXNjaGVkdWxlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgc2NoZWR1bGVkIGNhbGxiYWNrcyBhbmQgZW5naW5lcyBmcm9tIHRoZSBzY2hlZHVsZXIuXG4gICAqXG4gICAqIEBuYW1lIGNsZWFyXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cblxufVxuXG5leHBvcnQgZGVmYXVsdCBTY2hlZHVsZXI7XG4iLCJpbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvdGltZS1lbmdpbmUnO1xuXG5jb25zdCBsb2cgPSBkZWJ1Zygnd2F2ZXNqczphdWRpbycpO1xuXG4vKipcbiAqXG4gKlxuICpcbiAqIFRoZSBTaW1wbGVTY2hlZHVsZXIgY2xhc3MgaW1wbGVtZW50cyBhIHNpbXBsaWZpZWQgbWFzdGVyIGZvciB0aW1lIGVuZ2luZXNcbiAqIChzZWUgVGltZUVuZ2luZSBvciBBdWRpb1RpbWVFbmdpbmUpIHRoYXQgaW1wbGVtZW50IHRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlXG4gKiBzdWNoIGFzIHRoZSBNZXRyb25vbWUgYW5kIHRoZSBHcmFudWxhckVuZ2luZS4gVGhlIEFQSSBhbmQgZnVudGlvbmFsaXRpZXMgb2ZcbiAqIHRoZSBTaW1wbGVTY2hlZHVsZXIgY2xhc3MgYXJlIGlkZW50aWNhbCB0byB0aGUgU2NoZWR1bGVyIGNsYXNzLiBCdXQsIG90aGVyXG4gKiB0aGFuIHRoZSBTY2hlZHVsZXIsIHRoZSBTaW1wbGVTY2hlZHVsZXIgY2xhc3MgZG9lcyBub3QgZ3VhcmFudGVlIHRoZSBvcmRlclxuICogb2YgZXZlbnRzIChpLmUuIGNhbGxzIHRvIHRoZSBhZHZhbmNlVGltZSBtZXRob2Qgb2Ygc2NoZWR1bGVkIHRpbWUgZW5naW5lc1xuICogYW5kIHRvIHNjaGVkdWxlZCBjYWxsYmFjayBmdW5jdGlvbnMpIHdpdGhpbiBhIHNjaGVkdWxpbmcgcGVyaW9kIChzZWUgcGVyaW9kXG4gKiBhdHRyaWJ1dGUpLlxuICpcbiAqIFRvIGdldCBhIHVuaXF1ZSBpbnN0YW5jZSBvZiBTaW1wbGVTY2hlZHVsZXIgYXMgdGhlIGdsb2JhbCBzY2hlZHVsZXIgb2YgYW5cbiAqIGFwcGxpY2F0aW9uLCB0aGUgZ2V0U2ltcGxlU2NoZWR1bGVyIGZhY3RvcnkgZnVuY3Rpb24gc2hvdWxkIGJlIHVzZWQuIFRoZVxuICogZnVuY3Rpb24gYWNjZXB0cyBhbiBhdWRpbyBjb250ZXh0IGFzIG9wdGlvbmFsIGFyZ3VtZW50IGFuZCB1c2VzIHRoZSBXYXZlc1xuICogZGVmYXVsdCBhdWRpbyBjb250ZXh0IChzZWUgQXVkaW8gQ29udGV4dCkgYXMgZGVmYXVsdC4gVGhlIGZhY3RvcnkgY3JlYXRlc1xuICogYSBzaW5nbGUgKHNpbXBsZSkgc2NoZWR1bGVyIGZvciBlYWNoIGF1ZGlvIGNvbnRleHQuXG4gKlxuICogRXhhbXBsZSB0aGF0IHNob3dzIHRocmVlIE1ldHJvbm9tZSBlbmdpbmVzIHJ1bm5pbmcgaW4gYSBTaW1wbGVTY2hlZHVsZXI6XG4gKiB7QGxpbmsgaHR0cHM6Ly9jZG4ucmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy9zaW1wbGUtc2NoZWR1bGVyLmh0bWx9XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSAtIGRlZmF1bHQgb3B0aW9uc1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZD0wLjAyNV0gLSBwZXJpb2Qgb2YgdGhlIHNjaGVkdWxlci5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5sb29rYWhlYWQ9MC4xXSAtIGxvb2thaGVhZCBvZiB0aGUgc2NoZWR1bGVyLlxuICpcbiAqIEBzZWUgVGltZUVuZ2luZVxuICogQHNlZSBBdWRpb1RpbWVFbmdpbmVcbiAqIEBzZWUgZ2V0U2ltcGxlU2NoZWR1bGVyXG4gKiBAc2VlIFNjaGVkdWxlclxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBzY2hlZHVsZXIgPSBhdWRpby5nZXRTaW1wbGVTY2hlZHVsZXIoKTtcbiAqXG4gKiBzY2hlZHVsZXIuYWRkKG15RW5naW5lKTtcbiAqL1xuY2xhc3MgU2ltcGxlU2NoZWR1bGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCDCoGRlZmF1bHRBdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLl9fZW5naW5lcyA9IG5ldyBTZXQoKTtcblxuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcyA9IFtdO1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kXG4gICAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgbG9va2FoZWFkXG4gICAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgMC4xO1xuICB9XG5cbiAgX19zY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnB1c2goZW5naW5lKTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICB9XG5cbiAgX19yZXNjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX19zY2hlZEVuZ2luZXMuaW5kZXhPZihlbmdpbmUpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpbmRleF0gPSB0aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGltZSA8IEluZmluaXR5KSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnB1c2goZW5naW5lKTtcbiAgICAgIHRoaXMuX19zY2hlZFRpbWVzLnB1c2godGltZSk7XG4gICAgfVxuICB9XG5cbiAgX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX19zY2hlZEVuZ2luZXMuaW5kZXhPZihlbmdpbmUpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMuX19zY2hlZFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgX19yZXNldFRpY2soKSB7XG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKCF0aGlzLl9fdGltZW91dCkge1xuICAgICAgICBsb2coJ1NpbXBsZVNjaGVkdWxlciBTdGFydCcpO1xuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGxvZygnU2ltcGxlU2NoZWR1bGVyIFN0b3AnKTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX190aWNrKCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgY3VycmVudFRpbWUgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCkge1xuICAgICAgdmFyIGVuZ2luZSA9IHRoaXMuX19zY2hlZEVuZ2luZXNbaV07XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zY2hlZFRpbWVzW2ldO1xuXG4gICAgICB3aGlsZSAodGltZSAmJiB0aW1lIDw9IGN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIGN1cnJlbnRUaW1lKTtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgICAgdGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aW1lKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgJiYgdGltZSA8IEluZmluaXR5KSB7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzW2krK10gPSB0aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKTtcblxuICAgICAgICAvLyByZW1vdmUgZW5naW5lIGZyb20gc2NoZWR1bGVyXG4gICAgICAgIGlmICghdGltZSkge1xuICAgICAgICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgfSwgdGhpcy5wZXJpb2QgKiAxMDAwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVyIGN1cnJlbnQgbG9naWNhbCB0aW1lLlxuICAgKlxuICAgKiBAbmFtZSBjdXJyZW50VGltZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIGNhbGwgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWVcbiAgLyoqXG4gICAqIERlZmVyIHRoZSBleGVjdXRpb24gb2YgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1biAtIEZ1bmN0aW9uIHRvIGRlZmVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKHRpbWUpIHsgZnVuKHRpbWUpOyB9LCAvLyBtYWtlIHN1ciB0aGF0IHRoZSBhZHZhbmNlVGltZSBtZXRob2QgZG9lcyBub3QgcmV0dXJtIGFueXRoaW5nXG4gICAgfSwgdGltZSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgVGltZUVuZ2luZSBmdW5jdGlvbiB0byB0aGUgc2NoZWR1bGVyIGF0IGFuIG9wdGlvbmFsbHkgZ2l2ZW4gdGltZS5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gYWRkIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFt0aW1lPXRoaXMuY3VycmVudFRpbWVdIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgYWRkKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIVRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgLy8gc2V0IG1hc3RlciBhbmQgYWRkIHRvIGFycmF5XG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gICAgdGhpcy5fX2VuZ2luZXMuYWRkKGVuZ2luZSk7XG5cbiAgICAvLyBzY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgVGltZUVuZ2luZSBmcm9tIHRoZSBzY2hlZHVsZXIgdGhhdCBoYXMgYmVlbiBhZGRlZCB0byB0aGVcbiAgICogc2NoZWR1bGVyIHVzaW5nIHRoZSBhZGQgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZW1vdmUgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBpZiAoIWVuZ2luZS5tYXN0ZXIgfHwgZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImVuZ2luZSBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICAvLyByZXNldCBtYXN0ZXIgYW5kIHJlbW92ZSBmcm9tIGFycmF5XG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG5cbiAgICAvLyB1bnNjaGVkdWxlIGVuZ2luZVxuICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2NoZWR1bGUgYSBzY2hlZHVsZWQgdGltZSBlbmdpbmUgYXQgYSBnaXZlbiB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZXNjaGVkdWxlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgcmVzZXRFbmdpbmVUaW1lKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICB0aGlzLl9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZW5naW5lIGlzIHNjaGVkdWxlZC5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gY2hlY2tcbiAgICovXG4gIGhhcyhlbmdpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5fX2VuZ2luZXMuaGFzKGVuZ2luZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBlbmdpbmVzIGZyb20gdGhlIHNjaGVkdWxlci5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMubGVuZ3RoID0gMDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaW1wbGVTY2hlZHVsZXI7XG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vY29yZS9wcmlvcml0eS1xdWV1ZSc7XG5pbXBvcnQgU2NoZWR1bGluZ1F1ZXVlIGZyb20gJy4uL2NvcmUvc2NoZWR1bGluZy1xdWV1ZSc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCB7IGdldFNjaGVkdWxlciB9IGZyb20gJy4vZmFjdG9yaWVzJztcblxuXG5mdW5jdGlvbiBhZGREdXBsZXQoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCwgc2Vjb25kRWxlbWVudCkge1xuICBmaXJzdEFycmF5LnB1c2goZmlyc3RFbGVtZW50KTtcbiAgc2Vjb25kQXJyYXkucHVzaChzZWNvbmRFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHVwbGV0KGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBmaXJzdEVsZW1lbnQpIHtcbiAgY29uc3QgaW5kZXggPSBmaXJzdEFycmF5LmluZGV4T2YoZmlyc3RFbGVtZW50KTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGNvbnN0IHNlY29uZEVsZW1lbnQgPSBzZWNvbmRBcnJheVtpbmRleF07XG5cbiAgICBmaXJzdEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgc2Vjb25kQXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHJldHVybiBzZWNvbmRFbGVtZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFRoZSBUcmFuc3BvcnRlZCBjYWxsIGlzIHRoZSBiYXNlIGNsYXNzIG9mIHRoZSBhZGFwdGVycyBiZXR3ZWVuXG4vLyBkaWZmZXJlbnQgdHlwZXMgb2YgZW5naW5lcyAoaS5lLiB0cmFuc3BvcnRlZCwgc2NoZWR1bGVkLCBwbGF5LWNvbnRyb2xsZWQpXG4vLyBUaGUgYWRhcHRlcnMgYXJlIGF0IHRoZSBzYW1lIHRpbWUgbWFzdGVycyBmb3IgdGhlIGVuZ2luZXMgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuLy8gYW5kIHRyYW5zcG9ydGVkIFRpbWVFbmdpbmVzIGluc2VydGVkIGludG8gdGhlIHRyYW5zcG9ydCdzIHBvc2l0aW9uLWJhc2VkIHByaXRvcml0eSBxdWV1ZS5cbmNsYXNzIFRyYW5zcG9ydGVkIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydCwgZHVyYXRpb24sIG9mZnNldCwgc3RyZXRjaCA9IDEpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWFzdGVyID0gdHJhbnNwb3J0O1xuXG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcblxuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnQ7XG4gICAgdGhpcy5fX2VuZFBvc2l0aW9uID0gIWlzRmluaXRlKGR1cmF0aW9uKSA/IEluZmluaXR5IDogc3RhcnQgKyBkdXJhdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBzdGFydCArIG9mZnNldDtcbiAgICB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uID0gc3RyZXRjaDtcbiAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBzZXRCb3VuZGFyaWVzKHN0YXJ0LCBkdXJhdGlvbiwgb2Zmc2V0ID0gMCwgc3RyZXRjaCA9IDEpIHtcbiAgICB0aGlzLl9fc3RhcnRQb3NpdGlvbiA9IHN0YXJ0O1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9IHN0YXJ0ICsgZHVyYXRpb247XG4gICAgdGhpcy5fX29mZnNldFBvc2l0aW9uID0gc3RhcnQgKyBvZmZzZXQ7XG4gICAgdGhpcy5fX3N0cmV0Y2hQb3NpdGlvbiA9IHN0cmV0Y2g7XG4gICAgdGhpcy5yZXNldFBvc2l0aW9uKCk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHt9XG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHt9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHBvc2l0aW9uICs9IHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcblxuICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGlmIChwb3NpdGlvbiA8IHRoaXMuX19zdGFydFBvc2l0aW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19pc1J1bm5pbmcpXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zaXRpb24gPiB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuX19pc1J1bm5pbmcpIC8vIGlmIGVuZ2luZSBpcyBydW5uaW5nXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID4gdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX19pc1J1bm5pbmcpIC8vIGlmIGVuZ2luZSBpcyBydW5uaW5nXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX2lzUnVubmluZyA9IGZhbHNlO1xuICAgIHJldHVybiBJbmZpbml0eSAqIHNwZWVkO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICghdGhpcy5fX2lzUnVubmluZykge1xuICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgdGhpcy5fX2lzUnVubmluZyA9IHRydWU7XG5cbiAgICAgIGlmIChzcGVlZCA+IDApXG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG5cbiAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvLyBzdG9wIGVuZ2luZVxuICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3RlciA9IG51bGw7XG5cbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZFxuLy8gaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IE1hdGgubWF4KHBvc2l0aW9uLCB0aGlzLl9fc3RhcnRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1pbihwb3NpdGlvbiwgdGhpcy5fX2VuZFBvc2l0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gKyB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHBvc2l0aW9uID0gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24gfHwgc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24oZW5naW5lLCBwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcG9zaXRpb24gKz0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuXG4gICAgdGhpcy5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZFxuLy8gaGFzIHRvIHN0YXJ0IGFuZCBzdG9wIHRoZSBzcGVlZC1jb250cm9sbGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHRydWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2lzUnVubmluZylcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lLCB0aGlzLm1hc3Rlci5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIDApO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNjaGVkdWxlZFxuLy8gaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTY2hlZHVsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcblxuICAgIC8vIHNjaGVkdWxpbmcgcXVldWUgYmVjb21lcyBtYXN0ZXIgb2YgZW5naW5lXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGluZ1F1ZXVlLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlc2V0RW5naW5lVGltZSh0aGlzLl9fZW5naW5lLCB0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIHRyYW5zbGF0ZXMgYWR2YW5jZVBvc2l0aW9uIG9mICp0cmFuc3BvcnRlZCogZW5naW5lcyBpbnRvIGdsb2JhbCBzY2hlZHVsZXIgdGltZXNcbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIGNvbnN0IHRyYW5zcG9ydCA9IHRoaXMuX190cmFuc3BvcnQ7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIGNvbnN0IHNwZWVkID0gdHJhbnNwb3J0Ll9fc3BlZWQ7XG4gICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdHJhbnNwb3J0LmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIGNvbnN0IG5leHRUaW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gbmV4dFRpbWU7XG5cbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbikge1xuICAgIGNvbnN0IHRyYW5zcG9ydCA9IHRoaXMuX190cmFuc3BvcnQ7XG4gICAgY29uc3QgdGltZSA9IHRyYW5zcG9ydC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuXG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX190cmFuc3BvcnQuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnQgPSBudWxsO1xuICB9XG59XG5cbi8vIGludGVybmFsIHNjaGVkdWxpbmcgcXVldWUgdGhhdCByZXR1cm5zIHRoZSBjdXJyZW50IHBvc2l0aW9uIChhbmQgdGltZSkgb2YgdGhlIHBsYXkgY29udHJvbFxuY2xhc3MgVHJhbnNwb3J0U2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm92aWRlcyBzeW5jaHJvbml6ZWQgc2NoZWR1bGluZyBvZiBUaW1lIEVuZ2luZSBpbnN0YW5jZXMuXG4gKlxuICogW2V4YW1wbGVde0BsaW5rIGh0dHBzOi8vY2RuLnJhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvdHJhbnNwb3J0Lmh0bWx9XG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHRyYW5zcG9ydCA9IGF1ZGlvLlRyYW5zcG9ydCgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgYXVkaW8uUGxheUNvbnRyb2wodHJhbnNwb3J0KTtcbiAqIGNvbnN0IG15RW5naW5lID0gbmV3IE15RW5naW5lKCk7XG4gKiBjb25zdCB5b3VyRW5naW5lID0gbmV3IHlvdXJFbmdpbmUoKTtcbiAqXG4gKiB0cmFuc3BvcnQuYWRkKG15RW5naW5lKTtcbiAqIHRyYW5zcG9ydC5hZGQoeW91ckVuZ2luZSk7XG4gKlxuICogcGxheUNvbnRyb2wuc3RhcnQoKTtcbiAqL1xuY2xhc3MgVHJhbnNwb3J0IGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IGRlZmF1bHRBdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLl9fZW5naW5lcyA9IFtdO1xuICAgIHRoaXMuX190cmFuc3BvcnRlZCA9IFtdO1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlciA9IGdldFNjaGVkdWxlcih0aGlzLmF1ZGlvQ29udGV4dCk7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBuZXcgVHJhbnNwb3J0U2NoZWR1bGVySG9vayh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlKCk7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUodGhpcyk7XG5cbiAgICAvLyBzeW5jcm9uaXplZCB0aW1lLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcbiAgfVxuXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBjb25zdCBudW1UcmFuc3BvcnRlZEVuZ2luZXMgPSB0aGlzLl9fdHJhbnNwb3J0ZWQubGVuZ3RoO1xuICAgIGxldCBuZXh0UG9zaXRpb24gPSBJbmZpbml0eSAqIHNwZWVkO1xuXG4gICAgaWYgKG51bVRyYW5zcG9ydGVkRW5naW5lcyA+IDApIHtcbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmNsZWFyKCk7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtVHJhbnNwb3J0ZWRFbmdpbmVzOyBpKyspIHtcbiAgICAgICAgY29uc3QgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkW2ldO1xuICAgICAgICBjb25zdCBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLnRpbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgZm9yIChsZXQgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWUuIFRoaXMgZ2V0dGVyIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgdHJhbnNwb3J0XG4gICAqIGlzIGFkZGVkIHRvIGEgbWFzdGVyIChpLmUuIHRyYW5zcG9ydCBvciBwbGF5LWNvbnRyb2wpLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBjdXJyZW50VGltZVxuICAgKiBAbWVtYmVyb2YgVHJhbnNwb3J0XG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgcG9zaXRpb24uIFRoaXMgZ2V0dGVyIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgdHJhbnNwb3J0XG4gICAqIGlzIGFkZGVkIHRvIGEgbWFzdGVyIChpLmUuIHRyYW5zcG9ydCBvciBwbGF5LWNvbnRyb2wpLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBjdXJyZW50UG9zaXRpb25cbiAgICogQG1lbWJlcm9mIFRyYW5zcG9ydFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBuZXh0IHRyYW5zcG9ydCBwb3NpdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbmV4dCAtIHRyYW5zcG9ydCBwb3NpdGlvblxuICAgKi9cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSB0cmFuc3BvcnRlZCB0aW1lIGVuZ2luZSBpbnRlcmZhY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWRcbiAgICovXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICByZXR1cm4gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2YgdGhlIHRyYW5zcG9ydGVkIHRpbWUgZW5naW5lIGludGVyZmFjZS5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzcGVlZFxuICAgKi9cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmhlYWQ7XG4gICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgdHJhbnNwb3J0ZWQgdGltZSBlbmdpbmUgaW50ZXJmYWNlLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZVxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NlZWs9ZmFsc2VdXG4gICAqL1xuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICBjb25zdCBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIGxldCBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0YXJ0XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdG9wXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hhbmdlIHNwZWVkIHdpdGhvdXQgcmV2ZXJzaW5nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgLSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBzdGFydCBwb3NpdGlvblxuICAgKi9cbiAgYWRkKGVuZ2luZSwgc3RhcnRQb3NpdGlvbiA9IDAsIGVuZFBvc2l0aW9uID0gSW5maW5pdHksIG9mZnNldFBvc2l0aW9uID0gMCkge1xuICAgIGxldCB0cmFuc3BvcnRlZCA9IG51bGw7XG5cbiAgICBpZiAob2Zmc2V0UG9zaXRpb24gPT09IC1JbmZpbml0eSlcbiAgICAgIG9mZnNldFBvc2l0aW9uID0gMDtcblxuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzVHJhbnNwb3J0ZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZChlbmdpbmUpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTY2hlZHVsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gYSB0cmFuc3BvcnRcIik7XG5cbiAgICBpZiAodHJhbnNwb3J0ZWQpIHtcbiAgICAgIGNvbnN0IHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgICBhZGREdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lLCB0cmFuc3BvcnRlZCk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICBjb25zdCBuZXh0RW5naW5lUG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcbiAgICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUuaW5zZXJ0KHRyYW5zcG9ydGVkLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cmFuc3BvcnRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSB0aW1lIGVuZ2luZSBmcm9tIHRoZSB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBlbmdpbmVPclRyYW5zcG9ydGVkIC0gZW5naW5lIG9yIHRyYW5zcG9ydGVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgdHJhbnNwb3J0XG4gICAqL1xuICByZW1vdmUoZW5naW5lT3JUcmFuc3BvcnRlZCkge1xuICAgIGxldCBlbmdpbmUgPSBlbmdpbmVPclRyYW5zcG9ydGVkO1xuICAgIGxldCB0cmFuc3BvcnRlZCA9IHJlbW92ZUR1cGxldCh0aGlzLl9fZW5naW5lcywgdGhpcy5fX3RyYW5zcG9ydGVkLCBlbmdpbmVPclRyYW5zcG9ydGVkKTtcblxuICAgIGlmICghdHJhbnNwb3J0ZWQpIHtcbiAgICAgIGVuZ2luZSA9IHJlbW92ZUR1cGxldCh0aGlzLl9fdHJhbnNwb3J0ZWQsIHRoaXMuX19lbmdpbmVzLCBlbmdpbmVPclRyYW5zcG9ydGVkKTtcbiAgICAgIHRyYW5zcG9ydGVkID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICB9XG5cbiAgICBpZiAoZW5naW5lICYmIHRyYW5zcG9ydGVkKSB7XG4gICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgdHJhbnNwb3J0XCIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBwb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gZW5naW5lLlxuICAgKlxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IHRyYW5zcG9ydGVkIC0gRW5naW5lIHRvIHJlc2V0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiAtIE5ldyBwb3NpdGlvblxuICAgKi9cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbih0cmFuc3BvcnRlZCwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgaWYgKHBvc2l0aW9uID09PSB1bmRlZmluZWQpXG4gICAgICAgIHBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUodHJhbnNwb3J0ZWQsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRpbWUgZW5naW5lcyBmcm9tIHRoZSB0cmFuc3BvcnQuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLmN1cnJlbnRQb3NpdGlvbiwgMCk7XG5cbiAgICBmb3IgKGxldCB0cmFuc3BvcnRlZCBvZiB0aGlzLl9fdHJhbnNwb3J0ZWQpXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNwb3J0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZlwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZlwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9zZXRcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi93ZWFrLW1hcFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIik7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGVmaW5lUHJvcGVydHkpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgKDAsIF9kZWZpbmVQcm9wZXJ0eTIuZGVmYXVsdCkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9nZXQtcHJvdG90eXBlLW9mXCIpO1xuXG52YXIgX2dldFByb3RvdHlwZU9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2dldFByb3RvdHlwZU9mKTtcblxudmFyIF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9ICgwLCBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yMi5kZWZhdWx0KShvYmplY3QsIHByb3BlcnR5KTtcblxuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBhcmVudCA9ICgwLCBfZ2V0UHJvdG90eXBlT2YyLmRlZmF1bHQpKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9zZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpO1xuXG52YXIgX3NldFByb3RvdHlwZU9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NldFByb3RvdHlwZU9mKTtcblxudmFyIF9jcmVhdGUgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9vYmplY3QvY3JlYXRlXCIpO1xuXG52YXIgX2NyZWF0ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGUpO1xuXG52YXIgX3R5cGVvZjIgPSByZXF1aXJlKFwiLi4vaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgKHR5cGVvZiBzdXBlckNsYXNzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShzdXBlckNsYXNzKSkpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gKDAsIF9jcmVhdGUyLmRlZmF1bHQpKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2YyLmRlZmF1bHQgPyAoMCwgX3NldFByb3RvdHlwZU9mMi5kZWZhdWx0KShzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF90eXBlb2YyID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvdHlwZW9mXCIpO1xuXG52YXIgX3R5cGVvZjMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90eXBlb2YyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKCh0eXBlb2YgY2FsbCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiAoMCwgX3R5cGVvZjMuZGVmYXVsdCkoY2FsbCkpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2l0ZXJhdG9yID0gcmVxdWlyZShcIi4uL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yXCIpO1xuXG52YXIgX2l0ZXJhdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2l0ZXJhdG9yKTtcblxudmFyIF9zeW1ib2wgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9zeW1ib2xcIik7XG5cbnZhciBfc3ltYm9sMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3N5bWJvbCk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgX2l0ZXJhdG9yMi5kZWZhdWx0ID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gX3N5bWJvbDIuZGVmYXVsdCAmJiBvYmogIT09IF9zeW1ib2wyLmRlZmF1bHQucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgX3R5cGVvZihfaXRlcmF0b3IyLmRlZmF1bHQpID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKG9iaik7XG59IDogZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICYmIHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBfc3ltYm9sMi5kZWZhdWx0ICYmIG9iaiAhPT0gX3N5bWJvbDIuZGVmYXVsdC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKG9iaik7XG59OyIsInJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3InKTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuY3JlYXRlJyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZShQLCBEKXtcbiAgcmV0dXJuICRPYmplY3QuY3JlYXRlKFAsIEQpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2Mpe1xuICByZXR1cm4gJE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKTtcbn07IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyICRPYmplY3QgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHJldHVybiAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KTtcbn07IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1wcm90b3R5cGUtb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC5nZXRQcm90b3R5cGVPZjsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LnNldFByb3RvdHlwZU9mOyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zZXQnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5TZXQ7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNy5zeW1ib2wuYXN5bmMtaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3LnN5bWJvbC5vYnNlcnZhYmxlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5TeW1ib2w7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fd2tzLWV4dCcpLmYoJ2l0ZXJhdG9yJyk7IiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi53ZWFrLW1hcCcpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL19jb3JlJykuV2Vha01hcDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUsIGZvcmJpZGRlbkZpZWxkKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB8fCAoZm9yYmlkZGVuRmllbGQgIT09IHVuZGVmaW5lZCAmJiBmb3JiaWRkZW5GaWVsZCBpbiBpdCkpe1xuICAgIHRocm93IFR5cGVFcnJvcihuYW1lICsgJzogaW5jb3JyZWN0IGludm9jYXRpb24hJyk7XG4gIH0gcmV0dXJuIGl0O1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgZm9yT2YgPSByZXF1aXJlKCcuL19mb3Itb2YnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyLCBJVEVSQVRPUil7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yT2YoaXRlciwgZmFsc2UsIHJlc3VsdC5wdXNoLCByZXN1bHQsIElURVJBVE9SKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIHRvTGVuZ3RoICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgdG9JbmRleCAgID0gcmVxdWlyZSgnLi9fdG8taW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oSVNfSU5DTFVERVMpe1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGVsLCBmcm9tSW5kZXgpe1xuICAgIHZhciBPICAgICAgPSB0b0lPYmplY3QoJHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxuICAgICAgLCB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjdG9JbmRleCBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pe1xuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwiLy8gMCAtPiBBcnJheSNmb3JFYWNoXG4vLyAxIC0+IEFycmF5I21hcFxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcbi8vIDMgLT4gQXJyYXkjc29tZVxuLy8gNCAtPiBBcnJheSNldmVyeVxuLy8gNSAtPiBBcnJheSNmaW5kXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxudmFyIGN0eCAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBJT2JqZWN0ICA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgYXNjICAgICAgPSByZXF1aXJlKCcuL19hcnJheS1zcGVjaWVzLWNyZWF0ZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUWVBFLCAkY3JlYXRlKXtcbiAgdmFyIElTX01BUCAgICAgICAgPSBUWVBFID09IDFcbiAgICAsIElTX0ZJTFRFUiAgICAgPSBUWVBFID09IDJcbiAgICAsIElTX1NPTUUgICAgICAgPSBUWVBFID09IDNcbiAgICAsIElTX0VWRVJZICAgICAgPSBUWVBFID09IDRcbiAgICAsIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDZcbiAgICAsIE5PX0hPTEVTICAgICAgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWFxuICAgICwgY3JlYXRlICAgICAgICA9ICRjcmVhdGUgfHwgYXNjO1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGNhbGxiYWNrZm4sIHRoYXQpe1xuICAgIHZhciBPICAgICAgPSB0b09iamVjdCgkdGhpcylcbiAgICAgICwgc2VsZiAgID0gSU9iamVjdChPKVxuICAgICAgLCBmICAgICAgPSBjdHgoY2FsbGJhY2tmbiwgdGhhdCwgMylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IDBcbiAgICAgICwgcmVzdWx0ID0gSVNfTUFQID8gY3JlYXRlKCR0aGlzLCBsZW5ndGgpIDogSVNfRklMVEVSID8gY3JlYXRlKCR0aGlzLCAwKSA6IHVuZGVmaW5lZFxuICAgICAgLCB2YWwsIHJlcztcbiAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpe1xuICAgICAgdmFsID0gc2VsZltpbmRleF07XG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xuICAgICAgaWYoVFlQRSl7XG4gICAgICAgIGlmKElTX01BUClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgIC8vIG1hcFxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2goVFlQRSl7XG4gICAgICAgICAgY2FzZSAzOiByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWw7ICAgICAgICAgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcbiAgICAgICAgICBjYXNlIDI6IHJlc3VsdC5wdXNoKHZhbCk7ICAgICAgICAgICAgICAgLy8gZmlsdGVyXG4gICAgICAgIH0gZWxzZSBpZihJU19FVkVSWSlyZXR1cm4gZmFsc2U7ICAgICAgICAgIC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiByZXN1bHQ7XG4gIH07XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgaXNBcnJheSAgPSByZXF1aXJlKCcuL19pcy1hcnJheScpXG4gICwgU1BFQ0lFUyAgPSByZXF1aXJlKCcuL193a3MnKSgnc3BlY2llcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9yaWdpbmFsKXtcbiAgdmFyIEM7XG4gIGlmKGlzQXJyYXkob3JpZ2luYWwpKXtcbiAgICBDID0gb3JpZ2luYWwuY29uc3RydWN0b3I7XG4gICAgLy8gY3Jvc3MtcmVhbG0gZmFsbGJhY2tcbiAgICBpZih0eXBlb2YgQyA9PSAnZnVuY3Rpb24nICYmIChDID09PSBBcnJheSB8fCBpc0FycmF5KEMucHJvdG90eXBlKSkpQyA9IHVuZGVmaW5lZDtcbiAgICBpZihpc09iamVjdChDKSl7XG4gICAgICBDID0gQ1tTUEVDSUVTXTtcbiAgICAgIGlmKEMgPT09IG51bGwpQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQztcbn07IiwiLy8gOS40LjIuMyBBcnJheVNwZWNpZXNDcmVhdGUob3JpZ2luYWxBcnJheSwgbGVuZ3RoKVxudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vX2FycmF5LXNwZWNpZXMtY29uc3RydWN0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcmlnaW5hbCwgbGVuZ3RoKXtcbiAgcmV0dXJuIG5ldyAoc3BlY2llc0NvbnN0cnVjdG9yKG9yaWdpbmFsKSkobGVuZ3RoKTtcbn07IiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpXG4gIC8vIEVTMyB3cm9uZyBoZXJlXG4gICwgQVJHID0gY29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGl0W2tleV07XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTsiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBkUCAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZcbiAgLCBjcmVhdGUgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKVxuICAsIHJlZGVmaW5lQWxsID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUtYWxsJylcbiAgLCBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgYW5JbnN0YW5jZSAgPSByZXF1aXJlKCcuL19hbi1pbnN0YW5jZScpXG4gICwgZGVmaW5lZCAgICAgPSByZXF1aXJlKCcuL19kZWZpbmVkJylcbiAgLCBmb3JPZiAgICAgICA9IHJlcXVpcmUoJy4vX2Zvci1vZicpXG4gICwgJGl0ZXJEZWZpbmUgPSByZXF1aXJlKCcuL19pdGVyLWRlZmluZScpXG4gICwgc3RlcCAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKVxuICAsIHNldFNwZWNpZXMgID0gcmVxdWlyZSgnLi9fc2V0LXNwZWNpZXMnKVxuICAsIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKVxuICAsIGZhc3RLZXkgICAgID0gcmVxdWlyZSgnLi9fbWV0YScpLmZhc3RLZXlcbiAgLCBTSVpFICAgICAgICA9IERFU0NSSVBUT1JTID8gJ19zJyA6ICdzaXplJztcblxudmFyIGdldEVudHJ5ID0gZnVuY3Rpb24odGhhdCwga2V5KXtcbiAgLy8gZmFzdCBjYXNlXG4gIHZhciBpbmRleCA9IGZhc3RLZXkoa2V5KSwgZW50cnk7XG4gIGlmKGluZGV4ICE9PSAnRicpcmV0dXJuIHRoYXQuX2lbaW5kZXhdO1xuICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcbiAgZm9yKGVudHJ5ID0gdGhhdC5fZjsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgaWYoZW50cnkuayA9PSBrZXkpcmV0dXJuIGVudHJ5O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Q29uc3RydWN0b3I6IGZ1bmN0aW9uKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpe1xuICAgIHZhciBDID0gd3JhcHBlcihmdW5jdGlvbih0aGF0LCBpdGVyYWJsZSl7XG4gICAgICBhbkluc3RhbmNlKHRoYXQsIEMsIE5BTUUsICdfaScpO1xuICAgICAgdGhhdC5faSA9IGNyZWF0ZShudWxsKTsgLy8gaW5kZXhcbiAgICAgIHRoYXQuX2YgPSB1bmRlZmluZWQ7ICAgIC8vIGZpcnN0IGVudHJ5XG4gICAgICB0aGF0Ll9sID0gdW5kZWZpbmVkOyAgICAvLyBsYXN0IGVudHJ5XG4gICAgICB0aGF0W1NJWkVdID0gMDsgICAgICAgICAvLyBzaXplXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XG4gICAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0Ll9pLCBlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKGVudHJ5LnApZW50cnkucCA9IGVudHJ5LnAubiA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBkZWxldGUgZGF0YVtlbnRyeS5pXTtcbiAgICAgICAgfVxuICAgICAgICB0aGF0Ll9mID0gdGhhdC5fbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhhdFtTSVpFXSA9IDA7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgICAgICBpZihlbnRyeSl7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXG4gICAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xuICAgICAgICAgIGRlbGV0ZSB0aGF0Ll9pW2VudHJ5LmldO1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XG4gICAgICAgICAgaWYodGhhdC5fZiA9PSBlbnRyeSl0aGF0Ll9mID0gbmV4dDtcbiAgICAgICAgICBpZih0aGF0Ll9sID09IGVudHJ5KXRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICAgICAgYW5JbnN0YW5jZSh0aGlzLCBDLCAnZm9yRWFjaCcpO1xuICAgICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCwgMylcbiAgICAgICAgICAsIGVudHJ5O1xuICAgICAgICB3aGlsZShlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXMuX2Ype1xuICAgICAgICAgIGYoZW50cnkudiwgZW50cnkuaywgdGhpcyk7XG4gICAgICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XG4gICAgICAgIHJldHVybiAhIWdldEVudHJ5KHRoaXMsIGtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYoREVTQ1JJUFRPUlMpZFAoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gZGVmaW5lZCh0aGlzW1NJWkVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQztcbiAgfSxcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpXG4gICAgICAsIHByZXYsIGluZGV4O1xuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxuICAgIGlmKGVudHJ5KXtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQuX2wgPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0Ll9sLCAgICAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmKCF0aGF0Ll9mKXRoYXQuX2YgPSBlbnRyeTtcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XG4gICAgICB0aGF0W1NJWkVdKys7XG4gICAgICAvLyBhZGQgdG8gaW5kZXhcbiAgICAgIGlmKGluZGV4ICE9PSAnRicpdGhhdC5faVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIHNldFN0cm9uZzogZnVuY3Rpb24oQywgTkFNRSwgSVNfTUFQKXtcbiAgICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cbiAgICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXG4gICAgJGl0ZXJEZWZpbmUoQywgTkFNRSwgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICAgICAgdGhpcy5fdCA9IGl0ZXJhdGVkOyAgLy8gdGFyZ2V0XG4gICAgICB0aGlzLl9rID0ga2luZDsgICAgICAvLyBraW5kXG4gICAgICB0aGlzLl9sID0gdW5kZWZpbmVkOyAvLyBwcmV2aW91c1xuICAgIH0sIGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICwga2luZCAgPSB0aGF0Ll9rXG4gICAgICAgICwgZW50cnkgPSB0aGF0Ll9sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XG4gICAgICBpZighdGhhdC5fdCB8fCAhKHRoYXQuX2wgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoYXQuX3QuX2YpKXtcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cbiAgICAgICAgdGhhdC5fdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XG4gICAgICB9XG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xuICAgICAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcblxuICAgIC8vIGFkZCBbQEBzcGVjaWVzXSwgMjMuMS4yLjIsIDIzLjIuMi4yXG4gICAgc2V0U3BlY2llcyhOQU1FKTtcbiAgfVxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKVxuICAsIGZyb20gICAgPSByZXF1aXJlKCcuL19hcnJheS1mcm9tLWl0ZXJhYmxlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUpe1xuICByZXR1cm4gZnVuY3Rpb24gdG9KU09OKCl7XG4gICAgaWYoY2xhc3NvZih0aGlzKSAhPSBOQU1FKXRocm93IFR5cGVFcnJvcihOQU1FICsgXCIjdG9KU09OIGlzbid0IGdlbmVyaWNcIik7XG4gICAgcmV0dXJuIGZyb20odGhpcyk7XG4gIH07XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciByZWRlZmluZUFsbCAgICAgICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpXG4gICwgZ2V0V2VhayAgICAgICAgICAgPSByZXF1aXJlKCcuL19tZXRhJykuZ2V0V2Vha1xuICAsIGFuT2JqZWN0ICAgICAgICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBpc09iamVjdCAgICAgICAgICA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgYW5JbnN0YW5jZSAgICAgICAgPSByZXF1aXJlKCcuL19hbi1pbnN0YW5jZScpXG4gICwgZm9yT2YgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19mb3Itb2YnKVxuICAsIGNyZWF0ZUFycmF5TWV0aG9kID0gcmVxdWlyZSgnLi9fYXJyYXktbWV0aG9kcycpXG4gICwgJGhhcyAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIGFycmF5RmluZCAgICAgICAgID0gY3JlYXRlQXJyYXlNZXRob2QoNSlcbiAgLCBhcnJheUZpbmRJbmRleCAgICA9IGNyZWF0ZUFycmF5TWV0aG9kKDYpXG4gICwgaWQgICAgICAgICAgICAgICAgPSAwO1xuXG4vLyBmYWxsYmFjayBmb3IgdW5jYXVnaHQgZnJvemVuIGtleXNcbnZhciB1bmNhdWdodEZyb3plblN0b3JlID0gZnVuY3Rpb24odGhhdCl7XG4gIHJldHVybiB0aGF0Ll9sIHx8ICh0aGF0Ll9sID0gbmV3IFVuY2F1Z2h0RnJvemVuU3RvcmUpO1xufTtcbnZhciBVbmNhdWdodEZyb3plblN0b3JlID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5hID0gW107XG59O1xudmFyIGZpbmRVbmNhdWdodEZyb3plbiA9IGZ1bmN0aW9uKHN0b3JlLCBrZXkpe1xuICByZXR1cm4gYXJyYXlGaW5kKHN0b3JlLmEsIGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcbiAgfSk7XG59O1xuVW5jYXVnaHRGcm96ZW5TdG9yZS5wcm90b3R5cGUgPSB7XG4gIGdldDogZnVuY3Rpb24oa2V5KXtcbiAgICB2YXIgZW50cnkgPSBmaW5kVW5jYXVnaHRGcm96ZW4odGhpcywga2V5KTtcbiAgICBpZihlbnRyeSlyZXR1cm4gZW50cnlbMV07XG4gIH0sXG4gIGhhczogZnVuY3Rpb24oa2V5KXtcbiAgICByZXR1cm4gISFmaW5kVW5jYXVnaHRGcm96ZW4odGhpcywga2V5KTtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICB2YXIgZW50cnkgPSBmaW5kVW5jYXVnaHRGcm96ZW4odGhpcywga2V5KTtcbiAgICBpZihlbnRyeSllbnRyeVsxXSA9IHZhbHVlO1xuICAgIGVsc2UgdGhpcy5hLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSxcbiAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgdmFyIGluZGV4ID0gYXJyYXlGaW5kSW5kZXgodGhpcy5hLCBmdW5jdGlvbihpdCl7XG4gICAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcbiAgICB9KTtcbiAgICBpZih+aW5kZXgpdGhpcy5hLnNwbGljZShpbmRleCwgMSk7XG4gICAgcmV0dXJuICEhfmluZGV4O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Q29uc3RydWN0b3I6IGZ1bmN0aW9uKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpe1xuICAgIHZhciBDID0gd3JhcHBlcihmdW5jdGlvbih0aGF0LCBpdGVyYWJsZSl7XG4gICAgICBhbkluc3RhbmNlKHRoYXQsIEMsIE5BTUUsICdfaScpO1xuICAgICAgdGhhdC5faSA9IGlkKys7ICAgICAgLy8gY29sbGVjdGlvbiBpZFxuICAgICAgdGhhdC5fbCA9IHVuZGVmaW5lZDsgLy8gbGVhayBzdG9yZSBmb3IgdW5jYXVnaHQgZnJvemVuIG9iamVjdHNcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgfSk7XG4gICAgcmVkZWZpbmVBbGwoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjMuMy4yIFdlYWtNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy40LjMuMyBXZWFrU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgZGF0YSA9IGdldFdlYWsoa2V5KTtcbiAgICAgICAgaWYoZGF0YSA9PT0gdHJ1ZSlyZXR1cm4gdW5jYXVnaHRGcm96ZW5TdG9yZSh0aGlzKVsnZGVsZXRlJ10oa2V5KTtcbiAgICAgICAgcmV0dXJuIGRhdGEgJiYgJGhhcyhkYXRhLCB0aGlzLl9pKSAmJiBkZWxldGUgZGF0YVt0aGlzLl9pXTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4zLjMuNCBXZWFrTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuNC4zLjQgV2Vha1NldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcbiAgICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xuICAgICAgICB2YXIgZGF0YSA9IGdldFdlYWsoa2V5KTtcbiAgICAgICAgaWYoZGF0YSA9PT0gdHJ1ZSlyZXR1cm4gdW5jYXVnaHRGcm96ZW5TdG9yZSh0aGlzKS5oYXMoa2V5KTtcbiAgICAgICAgcmV0dXJuIGRhdGEgJiYgJGhhcyhkYXRhLCB0aGlzLl9pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gQztcbiAgfSxcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcbiAgICB2YXIgZGF0YSA9IGdldFdlYWsoYW5PYmplY3Qoa2V5KSwgdHJ1ZSk7XG4gICAgaWYoZGF0YSA9PT0gdHJ1ZSl1bmNhdWdodEZyb3plblN0b3JlKHRoYXQpLnNldChrZXksIHZhbHVlKTtcbiAgICBlbHNlIGRhdGFbdGhhdC5faV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhhdDtcbiAgfSxcbiAgdWZzdG9yZTogdW5jYXVnaHRGcm96ZW5TdG9yZVxufTsiLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsICAgICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCBtZXRhICAgICAgICAgICA9IHJlcXVpcmUoJy4vX21ldGEnKVxuICAsIGZhaWxzICAgICAgICAgID0gcmVxdWlyZSgnLi9fZmFpbHMnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgcmVkZWZpbmVBbGwgICAgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKVxuICAsIGZvck9mICAgICAgICAgID0gcmVxdWlyZSgnLi9fZm9yLW9mJylcbiAgLCBhbkluc3RhbmNlICAgICA9IHJlcXVpcmUoJy4vX2FuLWluc3RhbmNlJylcbiAgLCBpc09iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgZFAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mXG4gICwgZWFjaCAgICAgICAgICAgPSByZXF1aXJlKCcuL19hcnJheS1tZXRob2RzJykoMClcbiAgLCBERVNDUklQVE9SUyAgICA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSwgd3JhcHBlciwgbWV0aG9kcywgY29tbW9uLCBJU19NQVAsIElTX1dFQUspe1xuICB2YXIgQmFzZSAgPSBnbG9iYWxbTkFNRV1cbiAgICAsIEMgICAgID0gQmFzZVxuICAgICwgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnXG4gICAgLCBwcm90byA9IEMgJiYgQy5wcm90b3R5cGVcbiAgICAsIE8gICAgID0ge307XG4gIGlmKCFERVNDUklQVE9SUyB8fCB0eXBlb2YgQyAhPSAnZnVuY3Rpb24nIHx8ICEoSVNfV0VBSyB8fCBwcm90by5mb3JFYWNoICYmICFmYWlscyhmdW5jdGlvbigpe1xuICAgIG5ldyBDKCkuZW50cmllcygpLm5leHQoKTtcbiAgfSkpKXtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVkZWZpbmVBbGwoQy5wcm90b3R5cGUsIG1ldGhvZHMpO1xuICAgIG1ldGEuTkVFRCA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGFyZ2V0LCBpdGVyYWJsZSl7XG4gICAgICBhbkluc3RhbmNlKHRhcmdldCwgQywgTkFNRSwgJ19jJyk7XG4gICAgICB0YXJnZXQuX2MgPSBuZXcgQmFzZTtcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0YXJnZXRbQURERVJdLCB0YXJnZXQpO1xuICAgIH0pO1xuICAgIGVhY2goJ2FkZCxjbGVhcixkZWxldGUsZm9yRWFjaCxnZXQsaGFzLHNldCxrZXlzLHZhbHVlcyxlbnRyaWVzLHRvSlNPTicuc3BsaXQoJywnKSxmdW5jdGlvbihLRVkpe1xuICAgICAgdmFyIElTX0FEREVSID0gS0VZID09ICdhZGQnIHx8IEtFWSA9PSAnc2V0JztcbiAgICAgIGlmKEtFWSBpbiBwcm90byAmJiAhKElTX1dFQUsgJiYgS0VZID09ICdjbGVhcicpKWhpZGUoQy5wcm90b3R5cGUsIEtFWSwgZnVuY3Rpb24oYSwgYil7XG4gICAgICAgIGFuSW5zdGFuY2UodGhpcywgQywgS0VZKTtcbiAgICAgICAgaWYoIUlTX0FEREVSICYmIElTX1dFQUsgJiYgIWlzT2JqZWN0KGEpKXJldHVybiBLRVkgPT0gJ2dldCcgPyB1bmRlZmluZWQgOiBmYWxzZTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2NbS0VZXShhID09PSAwID8gMCA6IGEsIGIpO1xuICAgICAgICByZXR1cm4gSVNfQURERVIgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYoJ3NpemUnIGluIHByb3RvKWRQKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Muc2l6ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHNldFRvU3RyaW5nVGFnKEMsIE5BTUUpO1xuXG4gIE9bTkFNRV0gPSBDO1xuICAkZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiwgTyk7XG5cbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldFN0cm9uZyhDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTsiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcyLjQuMCd9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpOyIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJylcbiAgLCBnT1BTICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKVxuICAsIHBJRSAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIHJlc3VsdCAgICAgPSBnZXRLZXlzKGl0KVxuICAgICwgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYoZ2V0U3ltYm9scyl7XG4gICAgdmFyIHN5bWJvbHMgPSBnZXRTeW1ib2xzKGl0KVxuICAgICAgLCBpc0VudW0gID0gcElFLmZcbiAgICAgICwgaSAgICAgICA9IDBcbiAgICAgICwga2V5O1xuICAgIHdoaWxlKHN5bWJvbHMubGVuZ3RoID4gaSlpZihpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSlyZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGN0eCAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgaGlkZSAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkZcbiAgICAsIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0LkdcbiAgICAsIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlNcbiAgICAsIElTX1BST1RPICA9IHR5cGUgJiAkZXhwb3J0LlBcbiAgICAsIElTX0JJTkQgICA9IHR5cGUgJiAkZXhwb3J0LkJcbiAgICAsIElTX1dSQVAgICA9IHR5cGUgJiAkZXhwb3J0LldcbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCBleHBQcm90byAgPSBleHBvcnRzW1BST1RPVFlQRV1cbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGtleSwgb3duLCBvdXQ7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbihDKXtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBDKXtcbiAgICAgICAgICBzd2l0Y2goYXJndW1lbnRzLmxlbmd0aCl7XG4gICAgICAgICAgICBjYXNlIDA6IHJldHVybiBuZXcgQztcbiAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIG5ldyBDKGEpO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gbmV3IEMoYSwgYik7XG4gICAgICAgICAgfSByZXR1cm4gbmV3IEMoYSwgYiwgYyk7XG4gICAgICAgIH0gcmV0dXJuIEMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgICBGW1BST1RPVFlQRV0gPSBDW1BST1RPVFlQRV07XG4gICAgICByZXR1cm4gRjtcbiAgICAvLyBtYWtlIHN0YXRpYyB2ZXJzaW9ucyBmb3IgcHJvdG90eXBlIG1ldGhvZHNcbiAgICB9KShvdXQpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLm1ldGhvZHMuJU5BTUUlXG4gICAgaWYoSVNfUFJPVE8pe1xuICAgICAgKGV4cG9ydHMudmlydHVhbCB8fCAoZXhwb3J0cy52aXJ0dWFsID0ge30pKVtrZXldID0gb3V0O1xuICAgICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLnByb3RvdHlwZS4lTkFNRSVcbiAgICAgIGlmKHR5cGUgJiAkZXhwb3J0LlIgJiYgZXhwUHJvdG8gJiYgIWV4cFByb3RvW2tleV0paGlkZShleHBQcm90bywga2V5LCBvdXQpO1xuICAgIH1cbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWAgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07IiwidmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuL19pcy1hcnJheS1pdGVyJylcbiAgLCBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgdG9MZW5ndGggICAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKVxuICAsIEJSRUFLICAgICAgID0ge31cbiAgLCBSRVRVUk4gICAgICA9IHt9O1xudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCwgSVRFUkFUT1Ipe1xuICB2YXIgaXRlckZuID0gSVRFUkFUT1IgPyBmdW5jdGlvbigpeyByZXR1cm4gaXRlcmFibGU7IH0gOiBnZXRJdGVyRm4oaXRlcmFibGUpXG4gICAgLCBmICAgICAgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGxlbmd0aCwgc3RlcCwgaXRlcmF0b3IsIHJlc3VsdDtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYoaXNBcnJheUl0ZXIoaXRlckZuKSlmb3IobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgIHJlc3VsdCA9IGVudHJpZXMgPyBmKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKSA6IGYoaXRlcmFibGVbaW5kZXhdKTtcbiAgICBpZihyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKXJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChpdGVyYWJsZSk7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgKXtcbiAgICByZXN1bHQgPSBjYWxsKGl0ZXJhdG9yLCBmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKTtcbiAgICBpZihyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKXJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5leHBvcnRzLkJSRUFLICA9IEJSRUFLO1xuZXhwb3J0cy5SRVRVUk4gPSBSRVRVUk47IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59OyIsInZhciBkUCAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59OyIsIi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3JcbnZhciBJdGVyYXRvcnMgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCBJVEVSQVRPUiAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b1tJVEVSQVRPUl0gPT09IGl0KTtcbn07IiwiLy8gNy4yLjIgSXNBcnJheShhcmd1bWVudClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5KGFyZyl7XG4gIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2goZSl7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZihyZXQgIT09IHVuZGVmaW5lZClhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNyZWF0ZSAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi9fbGlicmFyeScpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIEl0ZXJhdG9ycyAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY3JlYXRlJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4vX29iamVjdC1ncG8nKVxuICAsIElURVJBVE9SICAgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBCVUdHWSAgICAgICAgICA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKSAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gICwgRkZfSVRFUkFUT1IgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKXtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgaWYoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHICAgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTXG4gICAgLCBWQUxVRVNfQlVHID0gZmFsc2VcbiAgICAsIHByb3RvICAgICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgJG5hdGl2ZSAgICA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgJGRlZmF1bHQgICA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpXG4gICAgLCAkZW50cmllcyAgID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZFxuICAgICwgJGFueU5hdGl2ZSA9IE5BTUUgPT0gJ0FycmF5JyA/IHByb3RvLmVudHJpZXMgfHwgJG5hdGl2ZSA6ICRuYXRpdmVcbiAgICAsIG1ldGhvZHMsIGtleSwgSXRlcmF0b3JQcm90b3R5cGU7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoJGFueU5hdGl2ZSl7XG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZigkYW55TmF0aXZlLmNhbGwobmV3IEJhc2UpKTtcbiAgICBpZihJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSl7XG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAgIC8vIGZpeCBmb3Igc29tZSBvbGQgZW5naW5lc1xuICAgICAgaWYoIUxJQlJBUlkgJiYgIWhhcyhJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZihERUZfVkFMVUVTICYmICRuYXRpdmUgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpe1xuICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCghTElCUkFSWSB8fCBGT1JDRUQpICYmIChCVUdHWSB8fCBWQUxVRVNfQlVHIHx8ICFwcm90b1tJVEVSQVRPUl0pKXtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9IHJldHVyblRoaXM7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6ICBERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICRlbnRyaWVzXG4gICAgfTtcbiAgICBpZihGT1JDRUQpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSlyZWRlZmluZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIChCVUdHWSB8fCBWQUxVRVNfQlVHKSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbiAgcmV0dXJuIG1ldGhvZHM7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9uZSwgdmFsdWUpe1xuICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCJ2YXIgZ2V0S2V5cyAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKVxuICAsIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBlbCl7XG4gIHZhciBPICAgICAgPSB0b0lPYmplY3Qob2JqZWN0KVxuICAgICwga2V5cyAgID0gZ2V0S2V5cyhPKVxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobGVuZ3RoID4gaW5kZXgpaWYoT1trZXkgPSBrZXlzW2luZGV4KytdXSA9PT0gZWwpcmV0dXJuIGtleTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB0cnVlOyIsInZhciBNRVRBICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJylcbiAgLCBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgaGFzICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIHNldERlc2MgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZlxuICAsIGlkICAgICAgID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gaXNFeHRlbnNpYmxlKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7fSkpO1xufSk7XG52YXIgc2V0TWV0YSA9IGZ1bmN0aW9uKGl0KXtcbiAgc2V0RGVzYyhpdCwgTUVUQSwge3ZhbHVlOiB7XG4gICAgaTogJ08nICsgKytpZCwgLy8gb2JqZWN0IElEXG4gICAgdzoge30gICAgICAgICAgLy8gd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfX0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24oaXQsIGNyZWF0ZSl7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZighaGFzKGl0LCBNRVRBKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICBpZighaGFzKGl0LCBNRVRBKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmKCFjcmVhdGUpcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbihpdCl7XG4gIGlmKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSlzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogICAgICBNRVRBLFxuICBORUVEOiAgICAgZmFsc2UsXG4gIGZhc3RLZXk6ICBmYXN0S2V5LFxuICBnZXRXZWFrOiAgZ2V0V2VhayxcbiAgb25GcmVlemU6IG9uRnJlZXplXG59OyIsIid1c2Ugc3RyaWN0Jztcbi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcbnZhciBnZXRLZXlzICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJylcbiAgLCBnT1BTICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJylcbiAgLCBwSUUgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKVxuICAsIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCBJT2JqZWN0ICA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsICRhc3NpZ24gID0gT2JqZWN0LmFzc2lnbjtcblxuLy8gc2hvdWxkIHdvcmsgd2l0aCBzeW1ib2xzIGFuZCBzaG91bGQgaGF2ZSBkZXRlcm1pbmlzdGljIHByb3BlcnR5IG9yZGVyIChWOCBidWcpXG5tb2R1bGUuZXhwb3J0cyA9ICEkYXNzaWduIHx8IHJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgdmFyIEEgPSB7fVxuICAgICwgQiA9IHt9XG4gICAgLCBTID0gU3ltYm9sKClcbiAgICAsIEsgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnO1xuICBBW1NdID0gNztcbiAgSy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbihrKXsgQltrXSA9IGs7IH0pO1xuICByZXR1cm4gJGFzc2lnbih7fSwgQSlbU10gIT0gNyB8fCBPYmplY3Qua2V5cygkYXNzaWduKHt9LCBCKSkuam9pbignJykgIT0gSztcbn0pID8gZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICB2YXIgVCAgICAgPSB0b09iamVjdCh0YXJnZXQpXG4gICAgLCBhTGVuICA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGluZGV4ID0gMVxuICAgICwgZ2V0U3ltYm9scyA9IGdPUFMuZlxuICAgICwgaXNFbnVtICAgICA9IHBJRS5mO1xuICB3aGlsZShhTGVuID4gaW5kZXgpe1xuICAgIHZhciBTICAgICAgPSBJT2JqZWN0KGFyZ3VtZW50c1tpbmRleCsrXSlcbiAgICAgICwga2V5cyAgID0gZ2V0U3ltYm9scyA/IGdldEtleXMoUykuY29uY2F0KGdldFN5bWJvbHMoUykpIDogZ2V0S2V5cyhTKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBqICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShsZW5ndGggPiBqKWlmKGlzRW51bS5jYWxsKFMsIGtleSA9IGtleXNbaisrXSkpVFtrZXldID0gU1trZXldO1xuICB9IHJldHVybiBUO1xufSA6ICRhc3NpZ247IiwiLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG52YXIgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIGRQcyAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpXG4gICwgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJylcbiAgLCBJRV9QUk9UTyAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKVxuICAsIEVtcHR5ICAgICAgID0gZnVuY3Rpb24oKXsgLyogZW1wdHkgKi8gfVxuICAsIFBST1RPVFlQRSAgID0gJ3Byb3RvdHlwZSc7XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24oKXtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJylcbiAgICAsIGkgICAgICA9IGVudW1CdWdLZXlzLmxlbmd0aFxuICAgICwgbHQgICAgID0gJzwnXG4gICAgLCBndCAgICAgPSAnPidcbiAgICAsIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgJ3NjcmlwdCcgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlKGktLSlkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcyl7XG4gIHZhciByZXN1bHQ7XG4gIGlmKE8gIT09IG51bGwpe1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHk7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZFBzKHJlc3VsdCwgUHJvcGVydGllcyk7XG59O1xuIiwidmFyIGFuT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJylcbiAgLCB0b1ByaW1pdGl2ZSAgICA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpXG4gICwgZFAgICAgICAgICAgICAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKXtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgcmV0dXJuIGRQKE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIGlmKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcyl0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTsiLCJ2YXIgZFAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBnZXRLZXlzICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKXtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzICAgPSBnZXRLZXlzKFByb3BlcnRpZXMpXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICwgaSA9IDBcbiAgICAsIFA7XG4gIHdoaWxlKGxlbmd0aCA+IGkpZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgcmV0dXJuIE87XG59OyIsInZhciBwSUUgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKVxuICAsIGNyZWF0ZURlc2MgICAgID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpXG4gICwgdG9JT2JqZWN0ICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCB0b1ByaW1pdGl2ZSAgICA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKVxuICAsIGdPUEQgICAgICAgICAgID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGdPUEQgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCl7XG4gIE8gPSB0b0lPYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICByZXR1cm4gZ09QRChPLCBQKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICBpZihoYXMoTywgUCkpcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTsiLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgZ09QTiAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mXG4gICwgdG9TdHJpbmcgID0ge30udG9TdHJpbmc7XG5cbnZhciB3aW5kb3dOYW1lcyA9IHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcgJiYgd2luZG93ICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG52YXIgZ2V0V2luZG93TmFtZXMgPSBmdW5jdGlvbihpdCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuIiwiLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxudmFyICRrZXlzICAgICAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpXG4gICwgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcblxuZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhPKXtcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xufTsiLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzOyIsIi8vIDE5LjEuMi45IC8gMTUuMi4zLjIgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXG52YXIgaGFzICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIHRvT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCBJRV9QUk9UTyAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKVxuICAsIE9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24oTyl7XG4gIE8gPSB0b09iamVjdChPKTtcbiAgaWYoaGFzKE8sIElFX1BST1RPKSlyZXR1cm4gT1tJRV9QUk9UT107XG4gIGlmKHR5cGVvZiBPLmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgTyBpbnN0YW5jZW9mIE8uY29uc3RydWN0b3Ipe1xuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcbn07IiwidmFyIGhhcyAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgdG9JT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSlcbiAgLCBJRV9QUk9UTyAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBuYW1lcyl7XG4gIHZhciBPICAgICAgPSB0b0lPYmplY3Qob2JqZWN0KVxuICAgICwgaSAgICAgID0gMFxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGtleTtcbiAgZm9yKGtleSBpbiBPKWlmKGtleSAhPSBJRV9QUk9UTyloYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKXtcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59OyIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxudmFyICRrZXlzICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKVxuICAsIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTyl7XG4gIHJldHVybiAka2V5cyhPLCBlbnVtQnVnS2V5cyk7XG59OyIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlOyIsIi8vIG1vc3QgT2JqZWN0IG1ldGhvZHMgYnkgRVM2IHNob3VsZCBhY2NlcHQgcHJpbWl0aXZlc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBmYWlscyAgID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZLCBleGVjKXtcbiAgdmFyIGZuICA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZXhwID0ge307XG4gIGV4cFtLRVldID0gZXhlYyhmbik7XG4gICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogZmFpbHMoZnVuY3Rpb24oKXsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsInZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYywgc2FmZSl7XG4gIGZvcih2YXIga2V5IGluIHNyYyl7XG4gICAgaWYoc2FmZSAmJiB0YXJnZXRba2V5XSl0YXJnZXRba2V5XSA9IHNyY1trZXldO1xuICAgIGVsc2UgaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICB9IHJldHVybiB0YXJnZXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faGlkZScpOyIsIi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uKE8sIHByb3RvKXtcbiAgYW5PYmplY3QoTyk7XG4gIGlmKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpdGhyb3cgVHlwZUVycm9yKHByb3RvICsgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gPyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgZnVuY3Rpb24odGVzdCwgYnVnZ3ksIHNldCl7XG4gICAgICB0cnkge1xuICAgICAgICBzZXQgPSByZXF1aXJlKCcuL19jdHgnKShGdW5jdGlvbi5jYWxsLCByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmYoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgIHNldCh0ZXN0LCBbXSk7XG4gICAgICAgIGJ1Z2d5ID0gISh0ZXN0IGluc3RhbmNlb2YgQXJyYXkpO1xuICAgICAgfSBjYXRjaChlKXsgYnVnZ3kgPSB0cnVlOyB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xuICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgIGlmKGJ1Z2d5KU8uX19wcm90b19fID0gcHJvdG87XG4gICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgcmV0dXJuIE87XG4gICAgICB9O1xuICAgIH0oe30sIGZhbHNlKSA6IHVuZGVmaW5lZCksXG4gIGNoZWNrOiBjaGVja1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgZFAgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKVxuICAsIFNQRUNJRVMgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVkpe1xuICB2YXIgQyA9IHR5cGVvZiBjb3JlW0tFWV0gPT0gJ2Z1bmN0aW9uJyA/IGNvcmVbS0VZXSA6IGdsb2JhbFtLRVldO1xuICBpZihERVNDUklQVE9SUyAmJiBDICYmICFDW1NQRUNJRVNdKWRQLmYoQywgU1BFQ0lFUywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9XG4gIH0pO1xufTsiLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZlxuICAsIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIHRhZywgc3RhdCl7XG4gIGlmKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpZGVmKGl0LCBUQUcsIHtjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWd9KTtcbn07IiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCdrZXlzJylcbiAgLCB1aWQgICAgPSByZXF1aXJlKCcuL191aWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuIHNoYXJlZFtrZXldIHx8IChzaGFyZWRba2V5XSA9IHVpZChrZXkpKTtcbn07IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgZGVmaW5lZCAgID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWF4ICAgICAgID0gTWF0aC5tYXhcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59OyIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTsiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59OyIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBTKXtcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZihTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTsiLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTsiLCJ2YXIgZ2xvYmFsICAgICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgTElCUkFSWSAgICAgICAgPSByZXF1aXJlKCcuL19saWJyYXJ5JylcbiAgLCB3a3NFeHQgICAgICAgICA9IHJlcXVpcmUoJy4vX3drcy1leHQnKVxuICAsIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHZhciAkU3ltYm9sID0gY29yZS5TeW1ib2wgfHwgKGNvcmUuU3ltYm9sID0gTElCUkFSWSA/IHt9IDogZ2xvYmFsLlN5bWJvbCB8fCB7fSk7XG4gIGlmKG5hbWUuY2hhckF0KDApICE9ICdfJyAmJiAhKG5hbWUgaW4gJFN5bWJvbCkpZGVmaW5lUHJvcGVydHkoJFN5bWJvbCwgbmFtZSwge3ZhbHVlOiB3a3NFeHQuZihuYW1lKX0pO1xufTsiLCJleHBvcnRzLmYgPSByZXF1aXJlKCcuL193a3MnKTsiLCJ2YXIgc3RvcmUgICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICAgICAgPSByZXF1aXJlKCcuL191aWQnKVxuICAsIFN5bWJvbCAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2xcbiAgLCBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTtcblxuJGV4cG9ydHMuc3RvcmUgPSBzdG9yZTsiLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fY29yZScpLmdldEl0ZXJhdG9yTWV0aG9kID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCAhPSB1bmRlZmluZWQpcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTsiLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIGdldCAgICAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fY29yZScpLmdldEl0ZXJhdG9yID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaXRlckZuID0gZ2V0KGl0KTtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICByZXR1cm4gYW5PYmplY3QoaXRlckZuLmNhbGwoaXQpKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuL19hZGQtdG8tdW5zY29wYWJsZXMnKVxuICAsIHN0ZXAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKVxuICAsIEl0ZXJhdG9ycyAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICB0aGlzLl90ID0gdG9JT2JqZWN0KGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4gIHRoaXMuX2sgPSBraW5kOyAgICAgICAgICAgICAgICAvLyBraW5kXG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGtpbmQgID0gdGhpcy5fa1xuICAgICwgaW5kZXggPSB0aGlzLl9pKys7XG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcbiAgICB0aGlzLl90ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcbiAgcmV0dXJuIHN0ZXAoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xuXG5hZGRUb1Vuc2NvcGFibGVzKCdrZXlzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCd2YWx1ZXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ2VudHJpZXMnKTsiLCJ2YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4vLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiRleHBvcnQoJGV4cG9ydC5TLCAnT2JqZWN0Jywge2NyZWF0ZTogcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpfSk7IiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpLCAnT2JqZWN0Jywge2RlZmluZVByb3BlcnR5OiByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mfSk7IiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCAgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKS5mO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gICAgcmV0dXJuICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG9JT2JqZWN0KGl0KSwga2V5KTtcbiAgfTtcbn0pOyIsIi8vIDE5LjEuMi45IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIHRvT2JqZWN0ICAgICAgICA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXG4gICwgJGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldFByb3RvdHlwZU9mJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKGl0KXtcbiAgICByZXR1cm4gJGdldFByb3RvdHlwZU9mKHRvT2JqZWN0KGl0KSk7XG4gIH07XG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbiRleHBvcnQoJGV4cG9ydC5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuL19zZXQtcHJvdG8nKS5zZXR9KTsiLCIiLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMiBTZXQgT2JqZWN0c1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uJykoJ1NldCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBTZXQoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywgdmFsdWUgPSB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcpOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkYXQgID0gcmVxdWlyZSgnLi9fc3RyaW5nLWF0JykodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBpbmRleCA9IHRoaXMuX2lcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4ge3ZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWV9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4ge3ZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2V9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyIGdsb2JhbCAgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgREVTQ1JJUFRPUlMgICAgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIE1FVEEgICAgICAgICAgID0gcmVxdWlyZSgnLi9fbWV0YScpLktFWVxuICAsICRmYWlscyAgICAgICAgID0gcmVxdWlyZSgnLi9fZmFpbHMnKVxuICAsIHNoYXJlZCAgICAgICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCB1aWQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpXG4gICwgd2tzICAgICAgICAgICAgPSByZXF1aXJlKCcuL193a3MnKVxuICAsIHdrc0V4dCAgICAgICAgID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpXG4gICwgd2tzRGVmaW5lICAgICAgPSByZXF1aXJlKCcuL193a3MtZGVmaW5lJylcbiAgLCBrZXlPZiAgICAgICAgICA9IHJlcXVpcmUoJy4vX2tleW9mJylcbiAgLCBlbnVtS2V5cyAgICAgICA9IHJlcXVpcmUoJy4vX2VudW0ta2V5cycpXG4gICwgaXNBcnJheSAgICAgICAgPSByZXF1aXJlKCcuL19pcy1hcnJheScpXG4gICwgYW5PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIHRvSU9iamVjdCAgICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGNyZWF0ZURlc2MgICAgID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpXG4gICwgX2NyZWF0ZSAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJylcbiAgLCBnT1BORXh0ICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuLWV4dCcpXG4gICwgJEdPUEQgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpXG4gICwgJERQICAgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsICRrZXlzICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKVxuICAsIGdPUEQgICAgICAgICAgID0gJEdPUEQuZlxuICAsIGRQICAgICAgICAgICAgID0gJERQLmZcbiAgLCBnT1BOICAgICAgICAgICA9IGdPUE5FeHQuZlxuICAsICRTeW1ib2wgICAgICAgID0gZ2xvYmFsLlN5bWJvbFxuICAsICRKU09OICAgICAgICAgID0gZ2xvYmFsLkpTT05cbiAgLCBfc3RyaW5naWZ5ICAgICA9ICRKU09OICYmICRKU09OLnN0cmluZ2lmeVxuICAsIFBST1RPVFlQRSAgICAgID0gJ3Byb3RvdHlwZSdcbiAgLCBISURERU4gICAgICAgICA9IHdrcygnX2hpZGRlbicpXG4gICwgVE9fUFJJTUlUSVZFICAgPSB3a3MoJ3RvUHJpbWl0aXZlJylcbiAgLCBpc0VudW0gICAgICAgICA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlXG4gICwgU3ltYm9sUmVnaXN0cnkgPSBzaGFyZWQoJ3N5bWJvbC1yZWdpc3RyeScpXG4gICwgQWxsU3ltYm9scyAgICAgPSBzaGFyZWQoJ3N5bWJvbHMnKVxuICAsIE9QU3ltYm9scyAgICAgID0gc2hhcmVkKCdvcC1zeW1ib2xzJylcbiAgLCBPYmplY3RQcm90byAgICA9IE9iamVjdFtQUk9UT1RZUEVdXG4gICwgVVNFX05BVElWRSAgICAgPSB0eXBlb2YgJFN5bWJvbCA9PSAnZnVuY3Rpb24nXG4gICwgUU9iamVjdCAgICAgICAgPSBnbG9iYWwuUU9iamVjdDtcbi8vIERvbid0IHVzZSBzZXR0ZXJzIGluIFF0IFNjcmlwdCwgaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzE3M1xudmFyIHNldHRlciA9ICFRT2JqZWN0IHx8ICFRT2JqZWN0W1BST1RPVFlQRV0gfHwgIVFPYmplY3RbUFJPVE9UWVBFXS5maW5kQ2hpbGQ7XG5cbi8vIGZhbGxiYWNrIGZvciBvbGQgQW5kcm9pZCwgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTY4N1xudmFyIHNldFN5bWJvbERlc2MgPSBERVNDUklQVE9SUyAmJiAkZmFpbHMoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIF9jcmVhdGUoZFAoe30sICdhJywge1xuICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIGRQKHRoaXMsICdhJywge3ZhbHVlOiA3fSkuYTsgfVxuICB9KSkuYSAhPSA3O1xufSkgPyBmdW5jdGlvbihpdCwga2V5LCBEKXtcbiAgdmFyIHByb3RvRGVzYyA9IGdPUEQoT2JqZWN0UHJvdG8sIGtleSk7XG4gIGlmKHByb3RvRGVzYylkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmKHByb3RvRGVzYyAmJiBpdCAhPT0gT2JqZWN0UHJvdG8pZFAoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbn0gOiBkUDtcblxudmFyIHdyYXAgPSBmdW5jdGlvbih0YWcpe1xuICB2YXIgc3ltID0gQWxsU3ltYm9sc1t0YWddID0gX2NyZWF0ZSgkU3ltYm9sW1BST1RPVFlQRV0pO1xuICBzeW0uX2sgPSB0YWc7XG4gIHJldHVybiBzeW07XG59O1xuXG52YXIgaXNTeW1ib2wgPSBVU0VfTkFUSVZFICYmIHR5cGVvZiAkU3ltYm9sLml0ZXJhdG9yID09ICdzeW1ib2wnID8gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0IGluc3RhbmNlb2YgJFN5bWJvbDtcbn07XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKXtcbiAgaWYoaXQgPT09IE9iamVjdFByb3RvKSRkZWZpbmVQcm9wZXJ0eShPUFN5bWJvbHMsIGtleSwgRCk7XG4gIGFuT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgYW5PYmplY3QoRCk7XG4gIGlmKGhhcyhBbGxTeW1ib2xzLCBrZXkpKXtcbiAgICBpZighRC5lbnVtZXJhYmxlKXtcbiAgICAgIGlmKCFoYXMoaXQsIEhJRERFTikpZFAoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSlpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSBfY3JlYXRlKEQsIHtlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKX0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApe1xuICBhbk9iamVjdChpdCk7XG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvSU9iamVjdChQKSlcbiAgICAsIGkgICAgPSAwXG4gICAgLCBsID0ga2V5cy5sZW5ndGhcbiAgICAsIGtleTtcbiAgd2hpbGUobCA+IGkpJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCl7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyBfY3JlYXRlKGl0KSA6ICRkZWZpbmVQcm9wZXJ0aWVzKF9jcmVhdGUoaXQpLCBQKTtcbn07XG52YXIgJHByb3BlcnR5SXNFbnVtZXJhYmxlID0gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KXtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgaWYodGhpcyA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldID8gRSA6IHRydWU7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIGl0ICA9IHRvSU9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGlmKGl0ID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSlyZXR1cm47XG4gIHZhciBEID0gZ09QRChpdCwga2V5KTtcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKUQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ09QTih0b0lPYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSl7XG4gICAgaWYoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKXJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCl7XG4gIHZhciBJU19PUCAgPSBpdCA9PT0gT2JqZWN0UHJvdG9cbiAgICAsIG5hbWVzICA9IGdPUE4oSVNfT1AgPyBPUFN5bWJvbHMgOiB0b0lPYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSl7XG4gICAgaWYoaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIChJU19PUCA/IGhhcyhPYmplY3RQcm90bywga2V5KSA6IHRydWUpKXJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYoIVVTRV9OQVRJVkUpe1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCl7XG4gICAgaWYodGhpcyBpbnN0YW5jZW9mICRTeW1ib2wpdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3IhJyk7XG4gICAgdmFyIHRhZyA9IHVpZChhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7XG4gICAgdmFyICRzZXQgPSBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBpZih0aGlzID09PSBPYmplY3RQcm90bykkc2V0LmNhbGwoT1BTeW1ib2xzLCB2YWx1ZSk7XG4gICAgICBpZihoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKXRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xuICAgIH07XG4gICAgaWYoREVTQ1JJUFRPUlMgJiYgc2V0dGVyKXNldFN5bWJvbERlc2MoT2JqZWN0UHJvdG8sIHRhZywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgc2V0OiAkc2V0fSk7XG4gICAgcmV0dXJuIHdyYXAodGFnKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICAgIHJldHVybiB0aGlzLl9rO1xuICB9KTtcblxuICAkR09QRC5mID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgJERQLmYgICA9ICRkZWZpbmVQcm9wZXJ0eTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mID0gZ09QTkV4dC5mID0gJGdldE93blByb3BlcnR5TmFtZXM7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1waWUnKS5mICA9ICRwcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKS5mID0gJGdldE93blByb3BlcnR5U3ltYm9scztcblxuICBpZihERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKXtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxuXG4gIHdrc0V4dC5mID0gZnVuY3Rpb24obmFtZSl7XG4gICAgcmV0dXJuIHdyYXAod2tzKG5hbWUpKTtcbiAgfVxufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7U3ltYm9sOiAkU3ltYm9sfSk7XG5cbmZvcih2YXIgc3ltYm9scyA9IChcbiAgLy8gMTkuNC4yLjIsIDE5LjQuMi4zLCAxOS40LjIuNCwgMTkuNC4yLjYsIDE5LjQuMi44LCAxOS40LjIuOSwgMTkuNC4yLjEwLCAxOS40LjIuMTEsIDE5LjQuMi4xMiwgMTkuNC4yLjEzLCAxOS40LjIuMTRcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBpID0gMDsgc3ltYm9scy5sZW5ndGggPiBpOyApd2tzKHN5bWJvbHNbaSsrXSk7XG5cbmZvcih2YXIgc3ltYm9scyA9ICRrZXlzKHdrcy5zdG9yZSksIGkgPSAwOyBzeW1ib2xzLmxlbmd0aCA+IGk7ICl3a3NEZWZpbmUoc3ltYm9sc1tpKytdKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ1N5bWJvbCcsIHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioa2V5KXtcbiAgICBpZihpc1N5bWJvbChrZXkpKXJldHVybiBrZXlPZihTeW1ib2xSZWdpc3RyeSwga2V5KTtcbiAgICB0aHJvdyBUeXBlRXJyb3Ioa2V5ICsgJyBpcyBub3QgYSBzeW1ib2whJyk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSBmYWxzZTsgfVxufSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiAkY3JlYXRlLFxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICRkZWZpbmVQcm9wZXJ0eSxcbiAgLy8gMTkuMS4yLjMgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiAgZGVmaW5lUHJvcGVydGllczogJGRlZmluZVByb3BlcnRpZXMsXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHNcbn0pO1xuXG4vLyAyNC4zLjIgSlNPTi5zdHJpbmdpZnkodmFsdWUgWywgcmVwbGFjZXIgWywgc3BhY2VdXSlcbiRKU09OICYmICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKCFVU0VfTkFUSVZFIHx8ICRmYWlscyhmdW5jdGlvbigpe1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7YTogU30pICE9ICd7fScgfHwgX3N0cmluZ2lmeShPYmplY3QoUykpICE9ICd7fSc7XG59KSksICdKU09OJywge1xuICBzdHJpbmdpZnk6IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCl7XG4gICAgaWYoaXQgPT09IHVuZGVmaW5lZCB8fCBpc1N5bWJvbChpdCkpcmV0dXJuOyAvLyBJRTggcmV0dXJucyBzdHJpbmcgb24gdW5kZWZpbmVkXG4gICAgdmFyIGFyZ3MgPSBbaXRdXG4gICAgICAsIGkgICAgPSAxXG4gICAgICAsIHJlcGxhY2VyLCAkcmVwbGFjZXI7XG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICByZXBsYWNlciA9IGFyZ3NbMV07XG4gICAgaWYodHlwZW9mIHJlcGxhY2VyID09ICdmdW5jdGlvbicpJHJlcGxhY2VyID0gcmVwbGFjZXI7XG4gICAgaWYoJHJlcGxhY2VyIHx8ICFpc0FycmF5KHJlcGxhY2VyKSlyZXBsYWNlciA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgICAgaWYoJHJlcGxhY2VyKXZhbHVlID0gJHJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWx1ZSk7XG4gICAgICBpZighaXNTeW1ib2wodmFsdWUpKXJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG4gIH1cbn0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGVhY2ggICAgICAgICA9IHJlcXVpcmUoJy4vX2FycmF5LW1ldGhvZHMnKSgwKVxuICAsIHJlZGVmaW5lICAgICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJylcbiAgLCBtZXRhICAgICAgICAgPSByZXF1aXJlKCcuL19tZXRhJylcbiAgLCBhc3NpZ24gICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtYXNzaWduJylcbiAgLCB3ZWFrICAgICAgICAgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXdlYWsnKVxuICAsIGlzT2JqZWN0ICAgICA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgZ2V0V2VhayAgICAgID0gbWV0YS5nZXRXZWFrXG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZVxuICAsIHVuY2F1Z2h0RnJvemVuU3RvcmUgPSB3ZWFrLnVmc3RvcmVcbiAgLCB0bXAgICAgICAgICAgPSB7fVxuICAsIEludGVybmFsTWFwO1xuXG52YXIgd3JhcHBlciA9IGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBXZWFrTWFwKCl7XG4gICAgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7XG4gIH07XG59O1xuXG52YXIgbWV0aG9kcyA9IHtcbiAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICBpZihpc09iamVjdChrZXkpKXtcbiAgICAgIHZhciBkYXRhID0gZ2V0V2VhayhrZXkpO1xuICAgICAgaWYoZGF0YSA9PT0gdHJ1ZSlyZXR1cm4gdW5jYXVnaHRGcm96ZW5TdG9yZSh0aGlzKS5nZXQoa2V5KTtcbiAgICAgIHJldHVybiBkYXRhID8gZGF0YVt0aGlzLl9pXSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0sXG4gIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywga2V5LCB2YWx1ZSk7XG4gIH1cbn07XG5cbi8vIDIzLjMgV2Vha01hcCBPYmplY3RzXG52YXIgJFdlYWtNYXAgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24nKSgnV2Vha01hcCcsIHdyYXBwZXIsIG1ldGhvZHMsIHdlYWssIHRydWUsIHRydWUpO1xuXG4vLyBJRTExIFdlYWtNYXAgZnJvemVuIGtleXMgZml4XG5pZihuZXcgJFdlYWtNYXAoKS5zZXQoKE9iamVjdC5mcmVlemUgfHwgT2JqZWN0KSh0bXApLCA3KS5nZXQodG1wKSAhPSA3KXtcbiAgSW50ZXJuYWxNYXAgPSB3ZWFrLmdldENvbnN0cnVjdG9yKHdyYXBwZXIpO1xuICBhc3NpZ24oSW50ZXJuYWxNYXAucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgbWV0YS5ORUVEID0gdHJ1ZTtcbiAgZWFjaChbJ2RlbGV0ZScsICdoYXMnLCAnZ2V0JywgJ3NldCddLCBmdW5jdGlvbihrZXkpe1xuICAgIHZhciBwcm90byAgPSAkV2Vha01hcC5wcm90b3R5cGVcbiAgICAgICwgbWV0aG9kID0gcHJvdG9ba2V5XTtcbiAgICByZWRlZmluZShwcm90bywga2V5LCBmdW5jdGlvbihhLCBiKXtcbiAgICAgIC8vIHN0b3JlIGZyb3plbiBvYmplY3RzIG9uIGludGVybmFsIHdlYWttYXAgc2hpbVxuICAgICAgaWYoaXNPYmplY3QoYSkgJiYgIWlzRXh0ZW5zaWJsZShhKSl7XG4gICAgICAgIGlmKCF0aGlzLl9mKXRoaXMuX2YgPSBuZXcgSW50ZXJuYWxNYXA7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9mW2tleV0oYSwgYik7XG4gICAgICAgIHJldHVybiBrZXkgPT0gJ3NldCcgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXG4gICAgICB9IHJldHVybiBtZXRob2QuY2FsbCh0aGlzLCBhLCBiKTtcbiAgICB9KTtcbiAgfSk7XG59IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyICRleHBvcnQgID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5SLCAnU2V0Jywge3RvSlNPTjogcmVxdWlyZSgnLi9fY29sbGVjdGlvbi10by1qc29uJykoJ1NldCcpfSk7IiwicmVxdWlyZSgnLi9fd2tzLWRlZmluZScpKCdhc3luY0l0ZXJhdG9yJyk7IiwicmVxdWlyZSgnLi9fd2tzLWRlZmluZScpKCdvYnNlcnZhYmxlJyk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBnbG9iYWwgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBoaWRlICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgSXRlcmF0b3JzICAgICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgVE9fU1RSSU5HX1RBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5mb3IodmFyIGNvbGxlY3Rpb25zID0gWydOb2RlTGlzdCcsICdET01Ub2tlbkxpc3QnLCAnTWVkaWFMaXN0JywgJ1N0eWxlU2hlZXRMaXN0JywgJ0NTU1J1bGVMaXN0J10sIGkgPSAwOyBpIDwgNTsgaSsrKXtcbiAgdmFyIE5BTUUgICAgICAgPSBjb2xsZWN0aW9uc1tpXVxuICAgICwgQ29sbGVjdGlvbiA9IGdsb2JhbFtOQU1FXVxuICAgICwgcHJvdG8gICAgICA9IENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGU7XG4gIGlmKHByb3RvICYmICFwcm90b1tUT19TVFJJTkdfVEFHXSloaWRlKHByb3RvLCBUT19TVFJJTkdfVEFHLCBOQU1FKTtcbiAgSXRlcmF0b3JzW05BTUVdID0gSXRlcmF0b3JzLkFycmF5O1xufSIsIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJ2xpZ2h0c2VhZ3JlZW4nLFxuICAnZm9yZXN0Z3JlZW4nLFxuICAnZ29sZGVucm9kJyxcbiAgJ2RvZGdlcmJsdWUnLFxuICAnZGFya29yY2hpZCcsXG4gICdjcmltc29uJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcbiAgLy8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2VcbiAgLy8gZXhwbGljaXRseVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaXMgd2Via2l0PyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNjQ1OTYwNi8zNzY3NzNcbiAgLy8gZG9jdW1lbnQgaXMgdW5kZWZpbmVkIGluIHJlYWN0LW5hdGl2ZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0LW5hdGl2ZS9wdWxsLzE2MzJcbiAgcmV0dXJuICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLldlYmtpdEFwcGVhcmFuY2UpIHx8XG4gICAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY29uc29sZSAmJiAod2luZG93LmNvbnNvbGUuZmlyZWJ1ZyB8fCAod2luZG93LmNvbnNvbGUuZXhjZXB0aW9uICYmIHdpbmRvdy5jb25zb2xlLnRhYmxlKSkpIHx8XG4gICAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLykgJiYgcGFyc2VJbnQoUmVnRXhwLiQxLCAxMCkgPj0gMzEpIHx8XG4gICAgLy8gZG91YmxlIGNoZWNrIHdlYmtpdCBpbiB1c2VyQWdlbnQganVzdCBpbiBjYXNlIHdlIGFyZSBpbiBhIHdvcmtlclxuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvYXBwbGV3ZWJraXRcXC8oXFxkKykvKSk7XG59XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odikge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuICdbVW5leHBlY3RlZEpTT05QYXJzZUVycm9yXTogJyArIGVyci5tZXNzYWdlO1xuICB9XG59O1xuXG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG4gIHZhciB1c2VDb2xvcnMgPSB0aGlzLnVzZUNvbG9ycztcblxuICBhcmdzWzBdID0gKHVzZUNvbG9ycyA/ICclYycgOiAnJylcbiAgICArIHRoaXMubmFtZXNwYWNlXG4gICAgKyAodXNlQ29sb3JzID8gJyAlYycgOiAnICcpXG4gICAgKyBhcmdzWzBdXG4gICAgKyAodXNlQ29sb3JzID8gJyVjICcgOiAnICcpXG4gICAgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cbiAgaWYgKCF1c2VDb2xvcnMpIHJldHVybjtcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3Muc3BsaWNlKDEsIDAsIGMsICdjb2xvcjogaW5oZXJpdCcpXG5cbiAgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RDID0gMDtcbiAgYXJnc1swXS5yZXBsYWNlKC8lW2EtekEtWiVdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgaWYgKCclJScgPT09IG1hdGNoKSByZXR1cm47XG4gICAgaW5kZXgrKztcbiAgICBpZiAoJyVjJyA9PT0gbWF0Y2gpIHtcbiAgICAgIC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuICAgICAgLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbiAgICAgIGxhc3RDID0gaW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG59XG5cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9hZCgpIHtcbiAgdmFyIHI7XG4gIHRyeSB7XG4gICAgciA9IGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZztcbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8vIElmIGRlYnVnIGlzbid0IHNldCBpbiBMUywgYW5kIHdlJ3JlIGluIEVsZWN0cm9uLCB0cnkgdG8gbG9hZCAkREVCVUdcbiAgaWYgKCFyICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAnZW52JyBpbiBwcm9jZXNzKSB7XG4gICAgciA9IHByb2Nlc3MuZW52LkRFQlVHO1xuICB9XG5cbiAgcmV0dXJuIHI7XG59XG5cbi8qKlxuICogRW5hYmxlIG5hbWVzcGFjZXMgbGlzdGVkIGluIGBsb2NhbFN0b3JhZ2UuZGVidWdgIGluaXRpYWxseS5cbiAqL1xuXG5leHBvcnRzLmVuYWJsZShsb2FkKCkpO1xuXG4vKipcbiAqIExvY2Fsc3RvcmFnZSBhdHRlbXB0cyB0byByZXR1cm4gdGhlIGxvY2Fsc3RvcmFnZS5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNhZmFyaSB0aHJvd3NcbiAqIHdoZW4gYSB1c2VyIGRpc2FibGVzIGNvb2tpZXMvbG9jYWxzdG9yYWdlXG4gKiBhbmQgeW91IGF0dGVtcHQgdG8gYWNjZXNzIGl0LlxuICpcbiAqIEByZXR1cm4ge0xvY2FsU3RvcmFnZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZTtcbiAgfSBjYXRjaCAoZSkge31cbn1cbiIsIlxuLyoqXG4gKiBUaGlzIGlzIHRoZSBjb21tb24gbG9naWMgZm9yIGJvdGggdGhlIE5vZGUuanMgYW5kIHdlYiBicm93c2VyXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVEZWJ1Zy5kZWJ1ZyA9IGNyZWF0ZURlYnVnWydkZWZhdWx0J10gPSBjcmVhdGVEZWJ1ZztcbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZXhwb3J0cy5kaXNhYmxlID0gZGlzYWJsZTtcbmV4cG9ydHMuZW5hYmxlID0gZW5hYmxlO1xuZXhwb3J0cy5lbmFibGVkID0gZW5hYmxlZDtcbmV4cG9ydHMuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuICovXG5cbmV4cG9ydHMubmFtZXMgPSBbXTtcbmV4cG9ydHMuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBNYXAgb2Ygc3BlY2lhbCBcIiVuXCIgaGFuZGxpbmcgZnVuY3Rpb25zLCBmb3IgdGhlIGRlYnVnIFwiZm9ybWF0XCIgYXJndW1lbnQuXG4gKlxuICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXIgb3IgdXBwZXItY2FzZSBsZXR0ZXIsIGkuZS4gXCJuXCIgYW5kIFwiTlwiLlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycyA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzIGxvZyB0aW1lc3RhbXAuXG4gKi9cblxudmFyIHByZXZUaW1lO1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VsZWN0Q29sb3IobmFtZXNwYWNlKSB7XG4gIHZhciBoYXNoID0gMCwgaTtcblxuICBmb3IgKGkgaW4gbmFtZXNwYWNlKSB7XG4gICAgaGFzaCAgPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIG5hbWVzcGFjZS5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gIH1cblxuICByZXR1cm4gZXhwb3J0cy5jb2xvcnNbTWF0aC5hYnMoaGFzaCkgJSBleHBvcnRzLmNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lc3BhY2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1ZyhuYW1lc3BhY2UpIHtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcblxuICAvLyBlbnYtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gbG9naWMgZm9yIGRlYnVnIGluc3RhbmNlc1xuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGV4cG9ydHMuaW5pdCkge1xuICAgIGV4cG9ydHMuaW5pdChkZWJ1Zyk7XG4gIH1cblxuICByZXR1cm4gZGVidWc7XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgZXhwb3J0cy5uYW1lcyA9IFtdO1xuICBleHBvcnRzLnNraXBzID0gW107XG5cbiAgdmFyIHNwbGl0ID0gKHR5cGVvZiBuYW1lc3BhY2VzID09PSAnc3RyaW5nJyA/IG5hbWVzcGFjZXMgOiAnJykuc3BsaXQoL1tcXHMsXSsvKTtcbiAgdmFyIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZhbClcbiAgKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhcbiAgICBzdHJcbiAgKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCc7XG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICB9XG4gIGlmIChtcyA+PSBtKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncyc7XG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpIHx8XG4gICAgcGx1cmFsKG1zLCBoLCAnaG91cicpIHx8XG4gICAgcGx1cmFsKG1zLCBtLCAnbWludXRlJykgfHxcbiAgICBwbHVyYWwobXMsIHMsICdzZWNvbmQnKSB8fFxuICAgIG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lO1xuICB9XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIl19
