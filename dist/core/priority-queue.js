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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW9yaXR5LXF1ZXVlLmpzIl0sIm5hbWVzIjpbInN3YXAiLCJhcnIiLCJpMSIsImkyIiwidG1wIiwiaW5kZXhPZiIsImVsIiwibCIsImxlbmd0aCIsImkiLCJfaXNMb3dlck1heEhlYXAiLCJ0aW1lMSIsInRpbWUyIiwiX2lzTG93ZXJNaW5IZWFwIiwiX2lzSGlnaGVyTWF4SGVhcCIsIl9pc0hpZ2hlck1pbkhlYXAiLCJQT1NJVElWRV9JTkZJTklUWSIsIk51bWJlciIsIlByaW9yaXR5UXVldWUiLCJoZWFwTGVuZ3RoIiwiX2N1cnJlbnRMZW5ndGgiLCJfaGVhcCIsIkFycmF5IiwiX3JldmVyc2UiLCJyZXZlcnNlIiwic3RhcnRJbmRleCIsImVudHJ5IiwiaW5kZXgiLCJwYXJlbnRJbmRleCIsIk1hdGgiLCJmbG9vciIsInBhcmVudCIsIl9pc0hpZ2hlciIsInF1ZXVlVGltZSIsImMxaW5kZXgiLCJjMmluZGV4IiwiY2hpbGQxIiwiY2hpbGQyIiwiX2lzTG93ZXIiLCJ0YXJnZXRJbmRleCIsIm1heEluZGV4IiwiX2J1YmJsZURvd24iLCJ0aW1lIiwiYWJzIiwiX2J1YmJsZVVwIiwidW5kZWZpbmVkIiwicmVtb3ZlIiwibGFzdEluZGV4IiwiSW5maW5pdHkiLCJ2YWx1ZSIsImJ1aWxkSGVhcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0EsU0FBU0EsSUFBVCxDQUFjQyxHQUFkLEVBQW1CQyxFQUFuQixFQUF1QkMsRUFBdkIsRUFBMkI7QUFDekIsTUFBTUMsTUFBTUgsSUFBSUMsRUFBSixDQUFaO0FBQ0FELE1BQUlDLEVBQUosSUFBVUQsSUFBSUUsRUFBSixDQUFWO0FBQ0FGLE1BQUlFLEVBQUosSUFBVUMsR0FBVjtBQUNEOztBQUVEO0FBQ0EsU0FBU0MsT0FBVCxDQUFpQkosR0FBakIsRUFBc0JLLEVBQXRCLEVBQTBCO0FBQ3hCLE1BQU1DLElBQUlOLElBQUlPLE1BQWQ7QUFDQTtBQUNBLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVB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O0FBQ0wsZUFBS3dCLFFBQUwsR0FBZ0J6QixlQUFoQjtBQUNBLGVBQUttQixTQUFMLEdBQWlCakIsZ0JBQWpCO0FBQ0Q7O0FBRUQsYUFBS21DLFNBQUw7QUFDRDtBQUNGLEs7d0JBRWE7QUFDWixhQUFPLEtBQUszQixRQUFaO0FBQ0Q7Ozs7O2tCQWdNWUwsYSIsImZpbGUiOiJwcmlvcml0eS1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHdvcmtzIGJ5IHJlZmVyZW5jZVxuZnVuY3Rpb24gc3dhcChhcnIsIGkxLCBpMikge1xuICBjb25zdCB0bXAgPSBhcnJbaTFdO1xuICBhcnJbaTFdID0gYXJyW2kyXTtcbiAgYXJyW2kyXSA9IHRtcDtcbn1cblxuLy8gaHR0cHM6Ly9qc3BlcmYuY29tL2pzLWZvci1sb29wLXZzLWFycmF5LWluZGV4b2YvMzQ2XG5mdW5jdGlvbiBpbmRleE9mKGFyciwgZWwpIHtcbiAgY29uc3QgbCA9IGFyci5sZW5ndGg7XG4gIC8vIGlnbm9yZSBmaXJzdCBlbGVtZW50IGFzIGl0IGNhbid0IGJlIGEgZW50cnlcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldID09PSBlbCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIERlZmluZSBpZiBgdGltZTFgIHNob3VsZCBiZSBsb3dlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0xvd2VyTWF4SGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn07XG5cbmNvbnN0IF9pc0xvd2VyTWluSGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPiB0aW1lMjtcbn07XG5cbi8qKlxuICogRGVmaW5lIGlmIGB0aW1lMWAgc2hvdWxkIGJlIGhpZ2hlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0hpZ2hlck1heEhlYXAgPSBmdW5jdGlvbih0aW1lMSwgdGltZTIpIHtcbiAgcmV0dXJuIHRpbWUxID4gdGltZTI7XG59O1xuXG5jb25zdCBfaXNIaWdoZXJNaW5IZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA8IHRpbWUyO1xufTtcblxuY29uc3QgUE9TSVRJVkVfSU5GSU5JVFkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbi8qKlxuICogUHJpb3JpdHkgcXVldWUgaW1wbGVtZW50aW5nIGEgYmluYXJ5IGhlYXAuXG4gKiBBY3RzIGFzIGEgbWluIGhlYXAgYnkgZGVmYXVsdCwgY2FuIGJlIGR5bmFtaWNhbGx5IGNoYW5nZWQgdG8gYSBtYXggaGVhcFxuICogYnkgc2V0dGluZyBgcmV2ZXJzZWAgdG8gdHJ1ZS5cbiAqXG4gKiBfbm90ZV86IHRoZSBxdWV1ZSBjcmVhdGVzIGFuZCBtYWludGFpbnMgYSBuZXcgcHJvcGVydHkgKGkuZS4gYHF1ZXVlVGltZWApXG4gKiB0byBlYWNoIG9iamVjdCBhZGRlZC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2hlYXBMZW5ndGg9MTAwXSAtIERlZmF1bHQgc2l6ZSBvZiB0aGUgYXJyYXkgdXNlZCB0byBjcmVhdGUgdGhlIGhlYXAuXG4gKi9cbmNsYXNzIFByaW9yaXR5UXVldWUge1xuICBjb25zdHJ1Y3RvcihoZWFwTGVuZ3RoID0gMTAwKSB7XG4gICAgLyoqXG4gICAgICogUG9pbnRlciB0byB0aGUgZmlyc3QgZW1wdHkgaW5kZXggb2YgdGhlIGhlYXAuXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbWVtYmVyb2YgUHJpb3JpdHlRdWV1ZVxuICAgICAqIEBuYW1lIF9jdXJyZW50TGVuZ3RoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gMTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHRoZSBzb3J0ZWQgaW5kZXhlcyBvZiB0aGUgZW50cmllcywgdGhlIGFjdHVhbCBoZWFwLiBJZ25vcmUgdGhlIGluZGV4IDAuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBtZW1iZXJvZiBQcmlvcml0eVF1ZXVlXG4gICAgICogQG5hbWUgX2hlYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2hlYXAgPSBuZXcgQXJyYXkoaGVhcExlbmd0aCArIDEpO1xuXG4gICAgLyoqXG4gICAgICogVHlwZSBvZiB0aGUgcXVldWU6IGBtaW5gIGhlYXAgaWYgYGZhbHNlYCwgYG1heGAgaGVhcCBpZiBgdHJ1ZWBcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbWVtYmVyb2YgUHJpb3JpdHlRdWV1ZVxuICAgICAqIEBuYW1lIF9yZXZlcnNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9yZXZlcnNlID0gbnVsbDtcblxuICAgIC8vIGluaXRpYWxpemUgY29tcGFyZSBmdW5jdGlvbnNcbiAgICB0aGlzLnJldmVyc2UgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaW1lIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TGVuZ3RoID4gMSlcbiAgICAgIHJldHVybiB0aGlzLl9oZWFwWzFdLnF1ZXVlVGltZTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVhcFsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG9yZGVyIG9mIHRoZSBxdWV1ZSAobWF4IGhlYXAgaWYgdHJ1ZSwgbWluIGhlYXAgaWYgZmFsc2UpLFxuICAgKiByZWJ1aWxkIHRoZSBoZWFwIHdpdGggdGhlIGV4aXN0aW5nIGVudHJpZXMuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgc2V0IHJldmVyc2UodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX3JldmVyc2UpIHtcbiAgICAgIHRoaXMuX3JldmVyc2UgPSB2YWx1ZTtcblxuICAgICAgaWYgKHRoaXMuX3JldmVyc2UgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5faXNMb3dlciA9IF9pc0xvd2VyTWF4SGVhcDtcbiAgICAgICAgdGhpcy5faXNIaWdoZXIgPSBfaXNIaWdoZXJNYXhIZWFwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMb3dlciA9IF9pc0xvd2VyTWluSGVhcDtcbiAgICAgICAgdGhpcy5faXNIaWdoZXIgPSBfaXNIaWdoZXJNaW5IZWFwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkSGVhcCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCByZXZlcnNlKCkge1xuICAgIHJldHVybiB0aGlzLl9yZXZlcnNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpeCB0aGUgaGVhcCBieSBtb3ZpbmcgYW4gZW50cnkgdG8gYSBuZXcgdXBwZXIgcG9zaXRpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydEluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSBlbnRyeSB0byBtb3ZlLlxuICAgKi9cbiAgX2J1YmJsZVVwKHN0YXJ0SW5kZXgpIHtcbiAgICBsZXQgZW50cnkgPSB0aGlzLl9oZWFwW3N0YXJ0SW5kZXhdO1xuXG4gICAgbGV0IGluZGV4ID0gc3RhcnRJbmRleDtcbiAgICBsZXQgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgbGV0IHBhcmVudCA9IHRoaXMuX2hlYXBbcGFyZW50SW5kZXhdO1xuXG4gICAgd2hpbGUgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcihlbnRyeS5xdWV1ZVRpbWUsIHBhcmVudC5xdWV1ZVRpbWUpKSB7XG4gICAgICBzd2FwKHRoaXMuX2hlYXAsIGluZGV4LCBwYXJlbnRJbmRleCk7XG5cbiAgICAgIGluZGV4ID0gcGFyZW50SW5kZXg7XG4gICAgICBwYXJlbnRJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyAyKTtcbiAgICAgIHBhcmVudCA9IHRoaXMuX2hlYXBbcGFyZW50SW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaXggdGhlIGhlYXAgYnkgbW92aW5nIGFuIGVudHJ5IHRvIGEgbmV3IGxvd2VyIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnRJbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZW50cnkgdG8gbW92ZS5cbiAgICovXG4gIF9idWJibGVEb3duKHN0YXJ0SW5kZXgpIHtcbiAgICBsZXQgZW50cnkgPSB0aGlzLl9oZWFwW3N0YXJ0SW5kZXhdO1xuXG4gICAgbGV0IGluZGV4ID0gc3RhcnRJbmRleDtcbiAgICBsZXQgYzFpbmRleCA9IGluZGV4ICogMjtcbiAgICBsZXQgYzJpbmRleCA9IGMxaW5kZXggKyAxO1xuICAgIGxldCBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgIGxldCBjaGlsZDIgPSB0aGlzLl9oZWFwW2MyaW5kZXhdO1xuXG4gICAgd2hpbGUgKChjaGlsZDEgJiYgdGhpcy5faXNMb3dlcihlbnRyeS5xdWV1ZVRpbWUsIGNoaWxkMS5xdWV1ZVRpbWUpKcKgfHxcbiAgICAgICAgICAgKGNoaWxkMiAmJiB0aGlzLl9pc0xvd2VyKGVudHJ5LnF1ZXVlVGltZSwgY2hpbGQyLnF1ZXVlVGltZSkpKVxuICAgIHtcbiAgICAgIC8vIHN3YXAgd2l0aCB0aGUgbWluaW11bSBjaGlsZFxuICAgICAgbGV0IHRhcmdldEluZGV4O1xuXG4gICAgICBpZiAoY2hpbGQyKVxuICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuX2lzSGlnaGVyKGNoaWxkMS5xdWV1ZVRpbWUsIGNoaWxkMi5xdWV1ZVRpbWUpID8gYzFpbmRleCA6IGMyaW5kZXg7XG4gICAgICBlbHNlXG4gICAgICAgIHRhcmdldEluZGV4ID0gYzFpbmRleDtcblxuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgdGFyZ2V0SW5kZXgpO1xuXG4gICAgICAvLyB1cGRhdGUgdG8gZmluZCBuZXh0IGNoaWxkcmVuXG4gICAgICBpbmRleCA9IHRhcmdldEluZGV4O1xuICAgICAgYzFpbmRleCA9IGluZGV4ICogMjtcbiAgICAgIGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICAgIGNoaWxkMSA9IHRoaXMuX2hlYXBbYzFpbmRleF07XG4gICAgICBjaGlsZDIgPSB0aGlzLl9oZWFwW2MyaW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgaGVhcCAoZnJvbSBib3R0b20gdXApLlxuICAgKi9cbiAgYnVpbGRIZWFwKCkge1xuICAgIC8vIGZpbmQgdGhlIGluZGV4IG9mIHRoZSBsYXN0IGludGVybmFsIG5vZGVcbiAgICAvLyBAdG9kbyAtIG1ha2Ugc3VyZSB0aGF0J3MgdGhlIHJpZ2h0IHdheSB0byBkby5cbiAgICBsZXQgbWF4SW5kZXggPSBNYXRoLmZsb29yKCh0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMSkgLyAyKTtcblxuICAgIGZvciAobGV0IGkgPSBtYXhJbmRleDsgaSA+IDA7IGktLSlcbiAgICAgIHRoaXMuX2J1YmJsZURvd24oaSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IG9iamVjdCBpbiB0aGUgYmluYXJ5IGhlYXAgYW5kIHNvcnQgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIGluc2VydC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybnMge051bWJlcn0gLSBUaW1lIG9mIHRoZSBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIGluc2VydChlbnRyeSwgdGltZSkge1xuICAgIGlmIChNYXRoLmFicyh0aW1lKSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIGVudHJ5LnF1ZXVlVGltZSA9IHRpbWU7XG4gICAgICAvLyBhZGQgdGhlIG5ldyBlbnRyeSBhdCB0aGUgZW5kIG9mIHRoZSBoZWFwXG4gICAgICB0aGlzLl9oZWFwW3RoaXMuX2N1cnJlbnRMZW5ndGhdID0gZW50cnk7XG4gICAgICAvLyBidWJibGUgaXQgdXBcbiAgICAgIHRoaXMuX2J1YmJsZVVwKHRoaXMuX2N1cnJlbnRMZW5ndGgpO1xuICAgICAgdGhpcy5fY3VycmVudExlbmd0aCArPSAxO1xuXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIGVudHJ5LnF1ZXVlVGltZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmUoZW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYSBnaXZlbiBlbnRyeSB0byBhIG5ldyBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gRW50cnkgdG8gbW92ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFRpbWUgb2YgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBtb3ZlKGVudHJ5LCB0aW1lKSB7XG4gICAgaWYgKE1hdGguYWJzKHRpbWUpICE9PSBQT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBlbnRyeS5xdWV1ZVRpbWUgPSB0aW1lO1xuICAgICAgICAvLyBkZWZpbmUgaWYgdGhlIGVudHJ5IHNob3VsZCBiZSBidWJibGVkIHVwIG9yIGRvd25cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildO1xuXG4gICAgICAgIGlmIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIodGltZSwgcGFyZW50LnF1ZXVlVGltZSkpXG4gICAgICAgICAgdGhpcy5fYnViYmxlVXAoaW5kZXgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgZW50cnkucXVldWVUaW1lID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZShlbnRyeSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGVudHJ5IGZyb20gdGhlIGhlYXAgYW5kIGZpeCB0aGUgaGVhcC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gRW50cnkgdG8gcmVtb3ZlLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGltZSBvZiBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIHJlbW92ZShlbnRyeSkge1xuICAgIC8vIGZpbmQgdGhlIGluZGV4IG9mIHRoZSBlbnRyeVxuICAgIGNvbnN0IGluZGV4ID0gaW5kZXhPZih0aGlzLl9oZWFwLCBlbnRyeSk7XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMTtcblxuICAgICAgLy8gaWYgdGhlIGVudHJ5IGlzIHRoZSBsYXN0IG9uZVxuICAgICAgaWYgKGluZGV4ID09PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaGVhcFxuICAgICAgICB0aGlzLl9oZWFwW2xhc3RJbmRleF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IGxlbmd0aFxuICAgICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gbGFzdEluZGV4O1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzd2FwIHdpdGggdGhlIGxhc3QgZWxlbWVudCBvZiB0aGUgaGVhcFxuICAgICAgICBzd2FwKHRoaXMuX2hlYXAsIGluZGV4LCBsYXN0SW5kZXgpO1xuICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBoZWFwXG4gICAgICAgIHRoaXMuX2hlYXBbbGFzdEluZGV4XSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoaW5kZXggPT09IDEpIHtcbiAgICAgICAgICB0aGlzLl9idWJibGVEb3duKDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGJ1YmJsZSB0aGUgKGV4IGxhc3QpIGVsZW1lbnQgdXAgb3IgZG93biBhY2NvcmRpbmcgdG8gaXRzIG5ldyBjb250ZXh0XG4gICAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLl9oZWFwW2luZGV4XTtcbiAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9oZWFwW01hdGguZmxvb3IoaW5kZXggLyAyKV07XG5cbiAgICAgICAgICBpZiAocGFyZW50ICYmIHRoaXMuX2lzSGlnaGVyKGVudHJ5LnF1ZXVlVGltZSwgcGFyZW50LnF1ZXVlVGltZSkpXG4gICAgICAgICAgICB0aGlzLl9idWJibGVVcChpbmRleCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gbGFzdEluZGV4O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRpbWU7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIHF1ZXVlLlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fY3VycmVudExlbmd0aCA9IDE7XG4gICAgdGhpcy5faGVhcCA9IG5ldyBBcnJheSh0aGlzLl9oZWFwLmxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyBpZiB0aGUgcXVldWUgY29udGFpbnMgdGhlIGdpdmVuIGBlbnRyeWAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIGJlIGNoZWNrZWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGhhcyhlbnRyeSkge1xuICAgIHJldHVybiB0aGlzLl9oZWFwLmluZGV4T2YoZW50cnkpICE9PSAtMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmlvcml0eVF1ZXVlO1xuIl19