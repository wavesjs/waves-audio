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
 * Acts as a min heap by default, can be dynamically changed to a max heap by setting `reverse` to true.
 */

var PriorityQueue = function () {
  /**
   * @param {String} [accessor='time'] - The attribute of the entries that should be used as the priority value. This attribute must be a number.
   * @param {Number} [heapLength=100] - The size of the array used to create the heap.
   */

  function PriorityQueue() {
    var heapLength = arguments.length <= 0 || arguments[0] === undefined ? 100 : arguments[0];
    (0, _classCallCheck3.default)(this, PriorityQueue);

    /**
     * @type {Number}
     * A pointer to the first empty index of the heap.
     */
    this._currentLength = 1;

    /**
     * An array of the sorted indexes of the entries, the actual heap. Ignore the index 0.
     * @type {Array}
     */
    this._heap = new Array(heapLength + 1);

    /**
     * Define the type of the queue: `min` heap if `false`, `max` heap if `true`
     * @type {Boolean}
     */
    this._reverse = null;

    // initialize compare functions
    this.reverse = false;
  }

  /**
   * Return the time of the first element in the binary heap.
   * @returns {Number}
   */


  (0, _createClass3.default)(PriorityQueue, [{
    key: "_bubbleUp",


    /**
     * Fix the heap by moving an entry to a new upper position.
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
     * Build the heap from bottom up.
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
     * Insert a new object in the binary heap, and sort it.
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
     * Move an entry to a new position.
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
     * This is broken, assuming bubbling down only is false
     * Remove an entry from the heap and fix the heap.
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
     * Returns the entry of the first element in the binary heap.
     * @returns {Number}
     */

  }, {
    key: "head",
    get: function get() {
      return this._heap[1];
    }

    /**
     * Change the order of the queue, rebuild the heap with the existing entries.
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
//# sourceMappingURL=data:application/json;base64,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TyxLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQVAsQ0FEUzs7Ozs7Ozs7OztzQkFRQyxPQUFPO0FBQ2pCLFVBQUksVUFBVSxLQUFLLFFBQUwsRUFBZTtBQUMzQixhQUFLLFFBQUwsR0FBZ0IsS0FBaEIsQ0FEMkI7O0FBRzNCLFlBQUksS0FBSyxRQUFMLEtBQWtCLElBQWxCLEVBQXdCO0FBQzFCLGVBQUssUUFBTCxHQUFnQixlQUFoQixDQUQwQjtBQUUxQixlQUFLLFNBQUwsR0FBaUIsZ0JBQWpCLENBRjBCO1NBQTVCLE1BR087QUFDTCxlQUFLLFFBQUwsR0FBZ0IsZUFBaEIsQ0FESztBQUVMLGVBQUssU0FBTCxHQUFpQixnQkFBakIsQ0FGSztTQUhQOztBQVFBLGFBQUssU0FBTCxHQVgyQjtPQUE3Qjs7d0JBZVk7QUFDWixhQUFPLEtBQUssUUFBTCxDQURLOzs7U0FuRUsiLCJmaWxlIjoicHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB3b3JrcyBieSByZWZlcmVuY2VcbmZ1bmN0aW9uIHN3YXAoYXJyLCBpMSwgaTIpIHtcbiAgY29uc3QgdG1wID0gYXJyW2kxXTtcbiAgYXJyW2kxXSA9IGFycltpMl07XG4gIGFycltpMl0gPSB0bXA7XG59XG5cbi8vIGh0dHBzOi8vanNwZXJmLmNvbS9qcy1mb3ItbG9vcC12cy1hcnJheS1pbmRleG9mLzM0NlxuZnVuY3Rpb24gaW5kZXhPZihhcnIsIGVsKSB7XG4gIGNvbnN0IGwgPSBhcnIubGVuZ3RoO1xuICAvLyBpZ25vcmUgZmlyc3QgZWxlbWVudCBhcyBpdCBjYW4ndCBiZSBhIGVudHJ5XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA9PT0gZWwpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgaWYgYHRpbWUxYCBzaG91bGQgYmUgbG93ZXIgaW4gdGhlIHRvcG9ncmFwaHkgdGhhbiBgdGltZTJgLlxuICogSXMgZHluYW1pY2FsbHkgYWZmZWN0ZWQgdG8gdGhlIHByaW9yaXR5IHF1ZXVlIGFjY29yZGluZyB0byBoYW5kbGUgYG1pbmAgYW5kIGBtYXhgIGhlYXAuXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTFcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgX2lzTG93ZXJNYXhIZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA8IHRpbWUyO1xufVxuXG5jb25zdCBfaXNMb3dlck1pbkhlYXAgPSBmdW5jdGlvbih0aW1lMSwgdGltZTIpIHtcbiAgcmV0dXJuIHRpbWUxID4gdGltZTI7XG59XG5cbi8qKlxuICogRGVmaW5lIGlmIGB0aW1lMWAgc2hvdWxkIGJlIGhpZ2hlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCBfaXNIaWdoZXJNYXhIZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA+IHRpbWUyO1xufVxuXG5jb25zdCBfaXNIaWdoZXJNaW5IZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA8IHRpbWUyO1xufVxuXG5jb25zdCBQT1NJVElWRV9JTkZJTklUWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuLyoqXG4gKiBQcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRpbmcgYSBiaW5hcnkgaGVhcC5cbiAqIEFjdHMgYXMgYSBtaW4gaGVhcCBieSBkZWZhdWx0LCBjYW4gYmUgZHluYW1pY2FsbHkgY2hhbmdlZCB0byBhIG1heCBoZWFwIGJ5IHNldHRpbmcgYHJldmVyc2VgIHRvIHRydWUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW9yaXR5UXVldWUge1xuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IFthY2Nlc3Nvcj0ndGltZSddIC0gVGhlIGF0dHJpYnV0ZSBvZiB0aGUgZW50cmllcyB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIHRoZSBwcmlvcml0eSB2YWx1ZS4gVGhpcyBhdHRyaWJ1dGUgbXVzdCBiZSBhIG51bWJlci5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWFwTGVuZ3RoPTEwMF0gLSBUaGUgc2l6ZSBvZiB0aGUgYXJyYXkgdXNlZCB0byBjcmVhdGUgdGhlIGhlYXAuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoZWFwTGVuZ3RoID0gMTAwKSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIGZpcnN0IGVtcHR5IGluZGV4IG9mIHRoZSBoZWFwLlxuICAgICAqL1xuICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSAxO1xuXG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgdGhlIHNvcnRlZCBpbmRleGVzIG9mIHRoZSBlbnRyaWVzLCB0aGUgYWN0dWFsIGhlYXAuIElnbm9yZSB0aGUgaW5kZXggMC5cbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgdGhpcy5faGVhcCA9IG5ldyBBcnJheShoZWFwTGVuZ3RoICsgMSk7XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbmUgdGhlIHR5cGUgb2YgdGhlIHF1ZXVlOiBgbWluYCBoZWFwIGlmIGBmYWxzZWAsIGBtYXhgIGhlYXAgaWYgYHRydWVgXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5fcmV2ZXJzZSA9IG51bGw7XG5cbiAgICAvLyBpbml0aWFsaXplIGNvbXBhcmUgZnVuY3Rpb25zXG4gICAgdGhpcy5yZXZlcnNlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0aW1lIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TGVuZ3RoID4gMSlcbiAgICAgIHJldHVybiB0aGlzLl9oZWFwWzFdLnF1ZXVlVGltZTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlbnRyeSBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYmluYXJ5IGhlYXAuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVhcFsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG9yZGVyIG9mIHRoZSBxdWV1ZSwgcmVidWlsZCB0aGUgaGVhcCB3aXRoIHRoZSBleGlzdGluZyBlbnRyaWVzLlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIHNldCByZXZlcnNlKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9yZXZlcnNlKSB7XG4gICAgICB0aGlzLl9yZXZlcnNlID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLl9yZXZlcnNlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuX2lzTG93ZXIgPSBfaXNMb3dlck1heEhlYXA7XG4gICAgICAgIHRoaXMuX2lzSGlnaGVyID0gX2lzSGlnaGVyTWF4SGVhcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2lzTG93ZXIgPSBfaXNMb3dlck1pbkhlYXA7XG4gICAgICAgIHRoaXMuX2lzSGlnaGVyID0gX2lzSGlnaGVyTWluSGVhcDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZEhlYXAoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgcmV2ZXJzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmV2ZXJzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXggdGhlIGhlYXAgYnkgbW92aW5nIGFuIGVudHJ5IHRvIGEgbmV3IHVwcGVyIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnRJbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZW50cnkgdG8gbW92ZS5cbiAgICovXG4gIF9idWJibGVVcChzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IHBhcmVudEluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDIpO1xuICAgIGxldCBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcblxuICAgIHdoaWxlIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIoZW50cnkucXVldWVUaW1lLCBwYXJlbnQucXVldWVUaW1lKSkge1xuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgcGFyZW50SW5kZXgpO1xuXG4gICAgICBpbmRleCA9IHBhcmVudEluZGV4O1xuICAgICAgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgICBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRml4IHRoZSBoZWFwIGJ5IG1vdmluZyBhbiBlbnRyeSB0byBhIG5ldyBsb3dlciBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IHRvIG1vdmUuXG4gICAqL1xuICBfYnViYmxlRG93bihzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgbGV0IGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICBsZXQgY2hpbGQxID0gdGhpcy5faGVhcFtjMWluZGV4XTtcbiAgICBsZXQgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcblxuICAgIHdoaWxlICgoY2hpbGQxICYmIHRoaXMuX2lzTG93ZXIoZW50cnkucXVldWVUaW1lLCBjaGlsZDEucXVldWVUaW1lKSnCoHx8XG4gICAgICAgICAgIChjaGlsZDIgJiYgdGhpcy5faXNMb3dlcihlbnRyeS5xdWV1ZVRpbWUsIGNoaWxkMi5xdWV1ZVRpbWUpKSlcbiAgICB7XG4gICAgICAvLyBzd2FwIHdpdGggdGhlIG1pbmltdW0gY2hpbGRcbiAgICAgIGxldCB0YXJnZXRJbmRleDtcblxuICAgICAgaWYgKGNoaWxkMilcbiAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLl9pc0hpZ2hlcihjaGlsZDEucXVldWVUaW1lLCBjaGlsZDIucXVldWVUaW1lKSA/IGMxaW5kZXggOiBjMmluZGV4O1xuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXRJbmRleCA9IGMxaW5kZXg7XG5cbiAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIHRhcmdldEluZGV4KTtcblxuICAgICAgLy8gdXBkYXRlIHRvIGZpbmQgbmV4dCBjaGlsZHJlblxuICAgICAgaW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICAgIGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgICBjMmluZGV4ID0gYzFpbmRleCArIDE7XG4gICAgICBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgICAgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIGhlYXAgZnJvbSBib3R0b20gdXAuXG4gICAqL1xuICBidWlsZEhlYXAoKSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGxhc3QgaW50ZXJuYWwgbm9kZVxuICAgIC8vIEB0b2RvIC0gbWFrZSBzdXJlIHRoYXQncyB0aGUgcmlnaHQgd2F5IHRvIGRvLlxuICAgIGxldCBtYXhJbmRleCA9IE1hdGguZmxvb3IoKHRoaXMuX2N1cnJlbnRMZW5ndGggLSAxKSAvIDIpO1xuXG4gICAgZm9yIChsZXQgaSA9IG1heEluZGV4OyBpID4gMDsgaS0tKVxuICAgICAgdGhpcy5fYnViYmxlRG93bihpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBuZXcgb2JqZWN0IGluIHRoZSBiaW5hcnkgaGVhcCwgYW5kIHNvcnQgaXQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIGluc2VydC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybnMge051bWJlcn0gLSBUaW1lIG9mIHRoZSBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIGluc2VydChlbnRyeSwgdGltZSkge1xuICAgIGlmIChNYXRoLmFicyh0aW1lKSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIGVudHJ5LnF1ZXVlVGltZSA9IHRpbWU7XG4gICAgICAvLyBhZGQgdGhlIG5ldyBlbnRyeSBhdCB0aGUgZW5kIG9mIHRoZSBoZWFwXG4gICAgICB0aGlzLl9oZWFwW3RoaXMuX2N1cnJlbnRMZW5ndGhdID0gZW50cnk7XG4gICAgICAvLyBidWJibGUgaXQgdXBcbiAgICAgIHRoaXMuX2J1YmJsZVVwKHRoaXMuX2N1cnJlbnRMZW5ndGgpO1xuICAgICAgdGhpcy5fY3VycmVudExlbmd0aCArPSAxO1xuXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIGVudHJ5LnF1ZXVlVGltZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmUoZW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYW4gZW50cnkgdG8gYSBuZXcgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIG1vdmUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gVGltZSBhdCB3aGljaCB0aGUgZW50cnkgc2hvdWxkIGJlIG9yZGVyZXIuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUaW1lIG9mIGZpcnN0IGVudHJ5IGluIHRoZSBoZWFwLlxuICAgKi9cbiAgbW92ZShlbnRyeSwgdGltZSkge1xuICAgIGlmIChNYXRoLmFicyh0aW1lKSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gaW5kZXhPZih0aGlzLl9oZWFwLCBlbnRyeSk7XG5cbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgZW50cnkucXVldWVUaW1lID0gdGltZTtcbiAgICAgICAgLy8gZGVmaW5lIGlmIHRoZSBlbnRyeSBzaG91bGQgYmUgYnViYmxlZCB1cCBvciBkb3duXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2hlYXBbTWF0aC5mbG9vcihpbmRleCAvIDIpXVxuXG4gICAgICAgIGlmIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIodGltZSwgcGFyZW50LnF1ZXVlVGltZSkpXG4gICAgICAgICAgdGhpcy5fYnViYmxlVXAoaW5kZXgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgZW50cnkucXVldWVUaW1lID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZShlbnRyeSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBicm9rZW4sIGFzc3VtaW5nIGJ1YmJsaW5nIGRvd24gb25seSBpcyBmYWxzZVxuICAgKiBSZW1vdmUgYW4gZW50cnkgZnJvbSB0aGUgaGVhcCBhbmQgZml4IHRoZSBoZWFwLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW50cnkgLSBFbnRyeSB0byByZW1vdmUuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUaW1lIG9mIGZpcnN0IGVudHJ5IGluIHRoZSBoZWFwLlxuICAgKi9cbiAgcmVtb3ZlKGVudHJ5KSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGVudHJ5XG4gICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuX2N1cnJlbnRMZW5ndGggLSAxO1xuXG4gICAgICAvLyBpZiB0aGUgZW50cnkgaXMgdGhlIGxhc3Qgb25lXG4gICAgICBpZiAoaW5kZXggPT09IGxhc3RJbmRleCkge1xuICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBoZWFwXG4gICAgICAgIHRoaXMuX2hlYXBbbGFzdEluZGV4XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN3YXAgd2l0aCB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBoZWFwXG4gICAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIGxhc3RJbmRleCk7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGhlYXBcbiAgICAgICAgdGhpcy5faGVhcFtsYXN0SW5kZXhdID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gMSkge1xuICAgICAgICAgIHRoaXMuX2J1YmJsZURvd24oMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYnViYmxlIHRoZSAoZXggbGFzdCkgZWxlbWVudCB1cCBvciBkb3duIGFjY29yZGluZyB0byBpdHMgbmV3IGNvbnRleHRcbiAgICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuX2hlYXBbaW5kZXhdO1xuICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2hlYXBbTWF0aC5mbG9vcihpbmRleCAvIDIpXTtcblxuICAgICAgICAgIGlmIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIoZW50cnkucXVldWVUaW1lLCBwYXJlbnQucXVldWVUaW1lKSlcbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZVVwKGluZGV4KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9idWJibGVEb3duKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgY3VycmVudCBsZW5ndGhcbiAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgcXVldWUuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gMTtcbiAgICB0aGlzLl9oZWFwID0gbmV3IEFycmF5KHRoaXMuX2hlYXAubGVuZ3RoKTtcbiAgfVxuXG4gIGhhcyhlbnRyeSkge1xuICAgIHJldHVybiB0aGlzLl9oZWFwLmluZGV4T2YoZW50cnkpICE9PSAtMTtcbiAgfVxufVxuIl19