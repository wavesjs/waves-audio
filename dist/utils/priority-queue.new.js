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
      // @todo - make sure it's the right way to do.
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
        // console.log(index);

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
     * Move the first entry (e.g. `this.head`) to a new position.
     * @param {Object} entry - Entry to move.
     * @param {Number} time - Time at which the entry should be orderer.
     * @return {Number} - Time of first entry in the heap.
     */

  }, {
    key: "moveFirst",
    value: function moveFirst(time) {
      var entry = this.head;

      if (Math.abs(time) !== POSITIVE_INFINITY) {
        entry.queueTime = time;
        this._bubbleDown(1);

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
//# sourceMappingURL=data:application/json;base64,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RE07QUFFTixXQUFLLEtBQUwsR0FBYSxJQUFJLEtBQUosQ0FBVSxLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQXZCLENBRk07Ozs7d0JBS0osT0FBTztBQUNULGFBQU8sS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixLQUFuQixNQUE4QixDQUFDLENBQUQsQ0FENUI7Ozs7d0JBek9BO0FBQ1QsVUFBSSxLQUFLLGNBQUwsR0FBc0IsQ0FBdEIsRUFDRixPQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxTQUFkLENBRFQ7O0FBR0EsYUFBTyxRQUFQLENBSlM7Ozs7Ozs7Ozs7d0JBV0E7QUFDVCxhQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsQ0FBUCxDQURTOzs7Ozs7Ozs7O3NCQVFDLE9BQU87QUFDakIsVUFBSSxVQUFVLEtBQUssUUFBTCxFQUFlO0FBQzNCLGFBQUssUUFBTCxHQUFnQixLQUFoQixDQUQyQjs7QUFHM0IsWUFBSSxLQUFLLFFBQUwsS0FBa0IsSUFBbEIsRUFBd0I7QUFDMUIsZUFBSyxRQUFMLEdBQWdCLGVBQWhCLENBRDBCO0FBRTFCLGVBQUssU0FBTCxHQUFpQixnQkFBakIsQ0FGMEI7U0FBNUIsTUFHTztBQUNMLGVBQUssUUFBTCxHQUFnQixlQUFoQixDQURLO0FBRUwsZUFBSyxTQUFMLEdBQWlCLGdCQUFqQixDQUZLO1NBSFA7O0FBUUEsYUFBSyxTQUFMLEdBWDJCO09BQTdCOzt3QkFlWTtBQUNaLGFBQU8sS0FBSyxRQUFMLENBREs7OztTQW5FSyIsImZpbGUiOiJwcmlvcml0eS1xdWV1ZS5uZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB3b3JrcyBieSByZWZlcmVuY2VcbmZ1bmN0aW9uIHN3YXAoYXJyLCBpMSwgaTIpIHtcbiAgY29uc3QgdG1wID0gYXJyW2kxXTtcbiAgYXJyW2kxXSA9IGFycltpMl07XG4gIGFycltpMl0gPSB0bXA7XG59XG5cbi8vIGh0dHBzOi8vanNwZXJmLmNvbS9qcy1mb3ItbG9vcC12cy1hcnJheS1pbmRleG9mLzM0NlxuZnVuY3Rpb24gaW5kZXhPZihhcnIsIGVsKSB7XG4gIGNvbnN0IGwgPSBhcnIubGVuZ3RoO1xuICAvLyBpZ25vcmUgZmlyc3QgZWxlbWVudCBhcyBpdCBjYW4ndCBiZSBhIGVudHJ5XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA9PT0gZWwpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgaWYgYHRpbWUxYCBzaG91bGQgYmUgbG93ZXIgaW4gdGhlIHRvcG9ncmFwaHkgdGhhbiBgdGltZTJgLlxuICogSXMgZHluYW1pY2FsbHkgYWZmZWN0ZWQgdG8gdGhlIHByaW9yaXR5IHF1ZXVlIGFjY29yZGluZyB0byBoYW5kbGUgYG1pbmAgYW5kIGBtYXhgIGhlYXAuXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTFcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgX2lzTG93ZXJNYXhIZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA8IHRpbWUyO1xufVxuXG5jb25zdCBfaXNMb3dlck1pbkhlYXAgPSBmdW5jdGlvbih0aW1lMSwgdGltZTIpIHtcbiAgcmV0dXJuIHRpbWUxID4gdGltZTI7XG59XG5cbi8qKlxuICogRGVmaW5lIGlmIGB0aW1lMWAgc2hvdWxkIGJlIGhpZ2hlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCBfaXNIaWdoZXJNYXhIZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA+IHRpbWUyO1xufVxuXG5jb25zdCBfaXNIaWdoZXJNaW5IZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA8IHRpbWUyO1xufVxuXG5jb25zdCBQT1NJVElWRV9JTkZJTklUWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuLyoqXG4gKiBQcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRpbmcgYSBiaW5hcnkgaGVhcC5cbiAqIEFjdHMgYXMgYSBtaW4gaGVhcCBieSBkZWZhdWx0LCBjYW4gYmUgZHluYW1pY2FsbHkgY2hhbmdlZCB0byBhIG1heCBoZWFwIGJ5IHNldHRpbmcgYHJldmVyc2VgIHRvIHRydWUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW9yaXR5UXVldWUge1xuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IFthY2Nlc3Nvcj0ndGltZSddIC0gVGhlIGF0dHJpYnV0ZSBvZiB0aGUgZW50cmllcyB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIHRoZSBwcmlvcml0eSB2YWx1ZS4gVGhpcyBhdHRyaWJ1dGUgbXVzdCBiZSBhIG51bWJlci5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWFwTGVuZ3RoPTEwMF0gLSBUaGUgc2l6ZSBvZiB0aGUgYXJyYXkgdXNlZCB0byBjcmVhdGUgdGhlIGhlYXAuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoZWFwTGVuZ3RoID0gMTAwKSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIGZpcnN0IGVtcHR5IGluZGV4IG9mIHRoZSBoZWFwLlxuICAgICAqL1xuICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSAxO1xuXG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgdGhlIHNvcnRlZCBpbmRleGVzIG9mIHRoZSBlbnRyaWVzLCB0aGUgYWN0dWFsIGhlYXAuIElnbm9yZSB0aGUgaW5kZXggMC5cbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgdGhpcy5faGVhcCA9IG5ldyBBcnJheShoZWFwTGVuZ3RoICsgMSk7XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbmUgdGhlIHR5cGUgb2YgdGhlIHF1ZXVlOiBgbWluYCBoZWFwIGlmIGBmYWxzZWAsIGBtYXhgIGhlYXAgaWYgYHRydWVgXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5fcmV2ZXJzZSA9IG51bGw7XG5cbiAgICAvLyBpbml0aWFsaXplIGNvbXBhcmUgZnVuY3Rpb25zXG4gICAgdGhpcy5yZXZlcnNlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0aW1lIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TGVuZ3RoID4gMSlcbiAgICAgIHJldHVybiB0aGlzLl9oZWFwWzFdLnF1ZXVlVGltZTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlbnRyeSBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYmluYXJ5IGhlYXAuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVhcFsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG9yZGVyIG9mIHRoZSBxdWV1ZSwgcmVidWlsZCB0aGUgaGVhcCB3aXRoIHRoZSBleGlzdGluZyBlbnRyaWVzLlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIHNldCByZXZlcnNlKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9yZXZlcnNlKSB7XG4gICAgICB0aGlzLl9yZXZlcnNlID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLl9yZXZlcnNlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuX2lzTG93ZXIgPSBfaXNMb3dlck1heEhlYXA7XG4gICAgICAgIHRoaXMuX2lzSGlnaGVyID0gX2lzSGlnaGVyTWF4SGVhcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2lzTG93ZXIgPSBfaXNMb3dlck1pbkhlYXA7XG4gICAgICAgIHRoaXMuX2lzSGlnaGVyID0gX2lzSGlnaGVyTWluSGVhcDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZEhlYXAoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgcmV2ZXJzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmV2ZXJzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXggdGhlIGhlYXAgYnkgbW92aW5nIGFuIGVudHJ5IHRvIGEgbmV3IHVwcGVyIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnRJbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZW50cnkgdG8gbW92ZS5cbiAgICovXG4gIF9idWJibGVVcChzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IHBhcmVudEluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDIpO1xuICAgIGxldCBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcblxuICAgIHdoaWxlIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIoZW50cnkucXVldWVUaW1lLCBwYXJlbnQucXVldWVUaW1lKSkge1xuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgcGFyZW50SW5kZXgpO1xuXG4gICAgICBpbmRleCA9IHBhcmVudEluZGV4O1xuICAgICAgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgICBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRml4IHRoZSBoZWFwIGJ5IG1vdmluZyBhbiBlbnRyeSB0byBhIG5ldyBsb3dlciBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IHRvIG1vdmUuXG4gICAqL1xuICBfYnViYmxlRG93bihzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgbGV0IGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICBsZXQgY2hpbGQxID0gdGhpcy5faGVhcFtjMWluZGV4XTtcbiAgICBsZXQgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcblxuICAgIHdoaWxlICgoY2hpbGQxICYmIHRoaXMuX2lzTG93ZXIoZW50cnkucXVldWVUaW1lLCBjaGlsZDEucXVldWVUaW1lKSnCoHx8XG4gICAgICAgICAgIChjaGlsZDIgJiYgdGhpcy5faXNMb3dlcihlbnRyeS5xdWV1ZVRpbWUsIGNoaWxkMi5xdWV1ZVRpbWUpKSlcbiAgICB7XG4gICAgICAvLyBzd2FwIHdpdGggdGhlIG1pbmltdW0gY2hpbGRcbiAgICAgIGxldCB0YXJnZXRJbmRleDtcblxuICAgICAgaWYgKGNoaWxkMilcbiAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLl9pc0hpZ2hlcihjaGlsZDEucXVldWVUaW1lLCBjaGlsZDIucXVldWVUaW1lKSA/IGMxaW5kZXggOiBjMmluZGV4O1xuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXRJbmRleCA9IGMxaW5kZXg7XG5cbiAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIHRhcmdldEluZGV4KTtcblxuICAgICAgLy8gdXBkYXRlIHRvIGZpbmQgbmV4dCBjaGlsZHJlblxuICAgICAgaW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICAgIGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgICBjMmluZGV4ID0gYzFpbmRleCArIDE7XG4gICAgICBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgICAgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIGhlYXAgZnJvbSBib3R0b20gdXAuXG4gICAqL1xuICBidWlsZEhlYXAoKSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGxhc3QgaW50ZXJuYWwgbm9kZVxuICAgIC8vIEB0b2RvIC0gbWFrZSBzdXJlIGl0J3MgdGhlIHJpZ2h0IHdheSB0byBkby5cbiAgICBsZXQgbWF4SW5kZXggPSBNYXRoLmZsb29yKCh0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMSkgLyAyKTtcblxuICAgIGZvciAobGV0IGkgPSBtYXhJbmRleDsgaSA+IDA7IGktLSlcbiAgICAgIHRoaXMuX2J1YmJsZURvd24oaSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IG9iamVjdCBpbiB0aGUgYmluYXJ5IGhlYXAsIGFuZCBzb3J0IGl0LlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW50cnkgLSBFbnRyeSB0byBpbnNlcnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gVGltZSBhdCB3aGljaCB0aGUgZW50cnkgc2hvdWxkIGJlIG9yZGVyZXIuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IC0gVGltZSBvZiB0aGUgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBpbnNlcnQoZW50cnksIHRpbWUpIHtcbiAgICBpZiAoTWF0aC5hYnModGltZSkgIT09IFBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICBlbnRyeS5xdWV1ZVRpbWUgPSB0aW1lO1xuICAgICAgLy8gYWRkIHRoZSBuZXcgZW50cnkgYXQgdGhlIGVuZCBvZiB0aGUgaGVhcFxuICAgICAgdGhpcy5faGVhcFt0aGlzLl9jdXJyZW50TGVuZ3RoXSA9IGVudHJ5O1xuICAgICAgLy8gYnViYmxlIGl0IHVwXG4gICAgICB0aGlzLl9idWJibGVVcCh0aGlzLl9jdXJyZW50TGVuZ3RoKTtcbiAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggKz0gMTtcblxuICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICB9XG5cbiAgICBlbnRyeS5xdWV1ZVRpbWUgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKGVudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGFuIGVudHJ5IHRvIGEgbmV3IHBvc2l0aW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW50cnkgLSBFbnRyeSB0byBtb3ZlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFRpbWUgYXQgd2hpY2ggdGhlIGVudHJ5IHNob3VsZCBiZSBvcmRlcmVyLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGltZSBvZiBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIG1vdmUoZW50cnksIHRpbWUpIHtcbiAgICBpZiAoTWF0aC5hYnModGltZSkgIT09IFBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICBjb25zdCBpbmRleCA9IGluZGV4T2YodGhpcy5faGVhcCwgZW50cnkpO1xuICAgICAgLy8gY29uc29sZS5sb2coaW5kZXgpO1xuXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIGVudHJ5LnF1ZXVlVGltZSA9IHRpbWU7XG4gICAgICAgIC8vIGRlZmluZSBpZiB0aGUgZW50cnkgc2hvdWxkIGJlIGJ1YmJsZWQgdXAgb3IgZG93blxuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9oZWFwW01hdGguZmxvb3IoaW5kZXggLyAyKV1cblxuICAgICAgICBpZiAocGFyZW50ICYmIHRoaXMuX2lzSGlnaGVyKHRpbWUsIHBhcmVudC5xdWV1ZVRpbWUpKVxuICAgICAgICAgIHRoaXMuX2J1YmJsZVVwKGluZGV4KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRoaXMuX2J1YmJsZURvd24oaW5kZXgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIGVudHJ5LnF1ZXVlVGltZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmUoZW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIGZpcnN0IGVudHJ5IChlLmcuIGB0aGlzLmhlYWRgKSB0byBhIG5ldyBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gRW50cnkgdG8gbW92ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFRpbWUgb2YgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBtb3ZlRmlyc3QodGltZSkge1xuICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5oZWFkO1xuXG4gICAgaWYgKE1hdGguYWJzKHRpbWUpICE9PSBQT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgZW50cnkucXVldWVUaW1lID0gdGltZTtcbiAgICAgIHRoaXMuX2J1YmJsZURvd24oMSk7XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgZW50cnkucXVldWVUaW1lID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZShlbnRyeSk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBicm9rZW4sIGFzc3VtaW5nIGJ1YmJsaW5nIGRvd24gb25seSBpcyBmYWxzZVxuICAgKiBSZW1vdmUgYW4gZW50cnkgZnJvbSB0aGUgaGVhcCBhbmQgZml4IHRoZSBoZWFwLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW50cnkgLSBFbnRyeSB0byByZW1vdmUuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUaW1lIG9mIGZpcnN0IGVudHJ5IGluIHRoZSBoZWFwLlxuICAgKi9cbiAgcmVtb3ZlKGVudHJ5KSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGVudHJ5XG4gICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuX2N1cnJlbnRMZW5ndGggLSAxO1xuXG4gICAgICAvLyBpZiB0aGUgZW50cnkgaXMgdGhlIGxhc3Qgb25lXG4gICAgICBpZiAoaW5kZXggPT09IGxhc3RJbmRleCkge1xuICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBoZWFwXG4gICAgICAgIHRoaXMuX2hlYXBbbGFzdEluZGV4XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN3YXAgd2l0aCB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBoZWFwXG4gICAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIGxhc3RJbmRleCk7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGhlYXBcbiAgICAgICAgdGhpcy5faGVhcFtsYXN0SW5kZXhdID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gMSkge1xuICAgICAgICAgIHRoaXMuX2J1YmJsZURvd24oMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYnViYmxlIHRoZSAoZXggbGFzdCkgZWxlbWVudCB1cCBvciBkb3duIGFjY29yZGluZyB0byBpdHMgbmV3IGNvbnRleHRcbiAgICAgICAgICBjb25zdCBlbnRyeSA9IHRoaXMuX2hlYXBbaW5kZXhdO1xuICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2hlYXBbTWF0aC5mbG9vcihpbmRleCAvIDIpXTtcblxuICAgICAgICAgIGlmIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIoZW50cnkucXVldWVUaW1lLCBwYXJlbnQucXVldWVUaW1lKSlcbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZVVwKGluZGV4KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9idWJibGVEb3duKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgY3VycmVudCBsZW5ndGhcbiAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgcXVldWUuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gMTtcbiAgICB0aGlzLl9oZWFwID0gbmV3IEFycmF5KHRoaXMuX2hlYXAubGVuZ3RoKTtcbiAgfVxuXG4gIGhhcyhlbnRyeSkge1xuICAgIHJldHVybiB0aGlzLl9oZWFwLmluZGV4T2YoZW50cnkpICE9PSAtMTtcbiAgfVxufVxuIl19