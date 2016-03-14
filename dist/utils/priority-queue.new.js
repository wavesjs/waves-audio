// works by reference
"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;

/**
 * Priority queue implementing a binary heap.
 * Acts as a min heap by default, can be dynamically changed to a max heap by setting `reverse` to true.
 */

var PriorityQueue = (function () {
  /**
   * @param {String} [accessor='time'] - The attribute of the entries that should be used as the priority value. This attribute must be a number.
   * @param {Number} [heapLength=100] - The size of the array used to create the heap.
   */

  function PriorityQueue() {
    var heapLength = arguments.length <= 0 || arguments[0] === undefined ? 100 : arguments[0];

    _classCallCheck(this, PriorityQueue);

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

  _createClass(PriorityQueue, [{
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

      while (parent && this._isHigher(entry.time, parent.time)) {
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

      while (child1 && this._isLower(entry.time, child1.time) || child2 && this._isLower(entry.time, child2.time)) {
        // swap with the minimum child
        var targetIndex = undefined;

        if (child2) targetIndex = this._isHigher(child1.time, child2.time) ? c1index : c2index;else targetIndex = c1index;

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
     *
     */
  }, {
    key: "set",
    value: function set(entries) {
      for (var i = 0, l = entries.length; i < l; i++) {
        this.insert(entries[i]);
      }
    }

    /**
     * Insert a new object in the binary heap, and sort it.
     * @param {Object} entry - The object to sort.
     * @param {Number} time - The time at which the entry should be inserted, if infinite, the entry is removed from from the heap.
     * @returns {Number} - Time of the first entry in the heap.
     */
  }, {
    key: "insert",
    value: function insert(entry) {
      if (entry.time !== POSITIVE_INFINITY && entry.time !== NEGATIVE_INFINITY) {
        // add the new entry at the end of the heap
        this._heap[this._currentLength] = entry;
        // bubble it up
        this._bubbleUp(this._currentLength);
        this._currentLength += 1;

        return this.time;
      }

      return this.remove(entry);
    }

    /**
     * This is broken, assuming bubbling down only is false
     * Remove an entry from the heap and fix the heap.
     * @param {Object} entry - The entry to remove.
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
            var e = this._heap[index];
            var _parent = this._heap[Math.floor(index / 2)];

            if (_parent && this._isHigher(e.time, _parent.time)) this._bubbleUp(index);else this._bubbleDown(index);
          }
        }

        // update current length
        this._currentLength = lastIndex;
      }

      return this.time;
    }

    /**
     * Move an entry to a new position.
     * @param {Object} entry - The entry to move.
     * @return {Number} - Time of first entry in the heap.
     */
  }, {
    key: "move",
    value: function move(entry) {
      var time = entry.time;

      if (time !== POSITIVE_INFINITY && time !== NEGATIVE_INFINITY) {
        var index = indexOf(this._heap, entry);

        if (index !== -1) {
          // define if the entry should be bubbled up or down
          var _parent2 = this._heap[Math.floor(index / 2)];

          if (_parent2 && this._isHigher(time, _parent2.time)) this._bubbleUp(index);else this._bubbleDown(index);
        }

        return this.time;
      }

      return this.remove(entry);
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
    key: "time",
    get: function get() {
      if (this._currentLength > 1) {
        return this._heap[1].time;
      }

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
})();

exports["default"] = PriorityQueue;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5uZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0FBQ3pCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwQixLQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xCLEtBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FDZjs7O0FBR0QsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRTtBQUN4QixNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDOztBQUVyQixPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFCLFFBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtBQUNqQixhQUFPLENBQUMsQ0FBQztLQUNWO0dBQ0Y7O0FBRUQsU0FBTyxDQUFDLENBQUMsQ0FBQztDQUNYOzs7Ozs7Ozs7QUFTRCxJQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQVksS0FBSyxFQUFFLEtBQUssRUFBRTtBQUM3QyxTQUFPLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FDdEIsQ0FBQTs7QUFFRCxJQUFNLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQVksS0FBSyxFQUFFLEtBQUssRUFBRTtBQUM3QyxTQUFPLEtBQUssR0FBRyxLQUFLLENBQUM7Q0FDdEIsQ0FBQTs7Ozs7Ozs7O0FBU0QsSUFBTSxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBWSxLQUFLLEVBQUUsS0FBSyxFQUFFO0FBQzlDLFNBQU8sS0FBSyxHQUFHLEtBQUssQ0FBQztDQUN0QixDQUFBOztBQUVELElBQU0sZ0JBQWdCLEdBQUcsU0FBbkIsZ0JB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VCxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEI7Ozs7Ozs7O1NBTVUsYUFBQyxLQUFLLEVBQUU7QUFDakIsVUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUMzQixZQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsWUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtBQUMxQixjQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQztBQUNoQyxjQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDO1NBQ25DLE1BQU07QUFDTCxjQUFJLENBQUMsUUFBUSxHQUFHLGVBQWUsQ0FBQztBQUNoQyxjQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDO1NBQ25DOztBQUVELFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQjtLQUNGO1NBRVUsZUFBRztBQUNaLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0Qjs7O1NBdEVrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUubmV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gd29ya3MgYnkgcmVmZXJlbmNlXG5mdW5jdGlvbiBzd2FwKGFyciwgaTEsIGkyKSB7XG4gIGNvbnN0IHRtcCA9IGFycltpMV07XG4gIGFycltpMV0gPSBhcnJbaTJdO1xuICBhcnJbaTJdID0gdG1wO1xufVxuXG4vLyBodHRwczovL2pzcGVyZi5jb20vanMtZm9yLWxvb3AtdnMtYXJyYXktaW5kZXhvZi8zNDZcbmZ1bmN0aW9uIGluZGV4T2YoYXJyLCBlbCkge1xuICBjb25zdCBsID0gYXJyLmxlbmd0aDtcbiAgLy8gaWdub3JlIGZpcnN0IGVsZW1lbnQgYXMgaXQgY2FuJ3QgYmUgYSBlbnRyeVxuICBmb3IgKGxldCBpID0gMTsgaSA8IGw7IGkrKykge1xuICAgIGlmIChhcnJbaV0gPT09IGVsKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogRGVmaW5lIGlmIGB0aW1lMWAgc2hvdWxkIGJlIGxvd2VyIGluIHRoZSB0b3BvZ3JhcGh5IHRoYW4gYHRpbWUyYC5cbiAqIElzIGR5bmFtaWNhbGx5IGFmZmVjdGVkIHRvIHRoZSBwcmlvcml0eSBxdWV1ZSBhY2NvcmRpbmcgdG8gaGFuZGxlIGBtaW5gIGFuZCBgbWF4YCBoZWFwLlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0xvd2VyTWF4SGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn1cblxuY29uc3QgX2lzTG93ZXJNaW5IZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA+IHRpbWUyO1xufVxuXG4vKipcbiAqIERlZmluZSBpZiBgdGltZTFgIHNob3VsZCBiZSBoaWdoZXIgaW4gdGhlIHRvcG9ncmFwaHkgdGhhbiBgdGltZTJgLlxuICogSXMgZHluYW1pY2FsbHkgYWZmZWN0ZWQgdG8gdGhlIHByaW9yaXR5IHF1ZXVlIGFjY29yZGluZyB0byBoYW5kbGUgYG1pbmAgYW5kIGBtYXhgIGhlYXAuXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTFcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgX2lzSGlnaGVyTWF4SGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPiB0aW1lMjtcbn1cblxuY29uc3QgX2lzSGlnaGVyTWluSGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn1cblxuY29uc3QgUE9TSVRJVkVfSU5GSU5JVFkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5jb25zdCBORUdBVElWRV9JTkZJTklUWSA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcblxuLyoqXG4gKiBQcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRpbmcgYSBiaW5hcnkgaGVhcC5cbiAqIEFjdHMgYXMgYSBtaW4gaGVhcCBieSBkZWZhdWx0LCBjYW4gYmUgZHluYW1pY2FsbHkgY2hhbmdlZCB0byBhIG1heCBoZWFwIGJ5IHNldHRpbmcgYHJldmVyc2VgIHRvIHRydWUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW9yaXR5UXVldWUge1xuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IFthY2Nlc3Nvcj0ndGltZSddIC0gVGhlIGF0dHJpYnV0ZSBvZiB0aGUgZW50cmllcyB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIHRoZSBwcmlvcml0eSB2YWx1ZS4gVGhpcyBhdHRyaWJ1dGUgbXVzdCBiZSBhIG51bWJlci5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWFwTGVuZ3RoPTEwMF0gLSBUaGUgc2l6ZSBvZiB0aGUgYXJyYXkgdXNlZCB0byBjcmVhdGUgdGhlIGhlYXAuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoZWFwTGVuZ3RoID0gMTAwKSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIGZpcnN0IGVtcHR5IGluZGV4IG9mIHRoZSBoZWFwLlxuICAgICAqL1xuICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSAxO1xuXG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgdGhlIHNvcnRlZCBpbmRleGVzIG9mIHRoZSBlbnRyaWVzLCB0aGUgYWN0dWFsIGhlYXAuIElnbm9yZSB0aGUgaW5kZXggMC5cbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgdGhpcy5faGVhcCA9IG5ldyBBcnJheShoZWFwTGVuZ3RoICsgMSk7XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbmUgdGhlIHR5cGUgb2YgdGhlIHF1ZXVlOiBgbWluYCBoZWFwIGlmIGBmYWxzZWAsIGBtYXhgIGhlYXAgaWYgYHRydWVgXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5fcmV2ZXJzZSA9IG51bGw7XG5cbiAgICAvLyBpbml0aWFsaXplIGNvbXBhcmUgZnVuY3Rpb25zXG4gICAgdGhpcy5yZXZlcnNlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0aW1lIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TGVuZ3RoID4gMSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2hlYXBbMV0udGltZTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZW50cnkgb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIGJpbmFyeSBoZWFwLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cbiAgZ2V0IGhlYWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYXBbMV07XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBvcmRlciBvZiB0aGUgcXVldWUsIHJlYnVpbGQgdGhlIGhlYXAgd2l0aCB0aGUgZXhpc3RpbmcgZW50cmllcy5cbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBzZXQgcmV2ZXJzZSh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fcmV2ZXJzZSkge1xuICAgICAgdGhpcy5fcmV2ZXJzZSA9IHZhbHVlO1xuXG4gICAgICBpZiAodGhpcy5fcmV2ZXJzZSA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLl9pc0xvd2VyID0gX2lzTG93ZXJNYXhIZWFwO1xuICAgICAgICB0aGlzLl9pc0hpZ2hlciA9IF9pc0hpZ2hlck1heEhlYXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9pc0xvd2VyID0gX2lzTG93ZXJNaW5IZWFwO1xuICAgICAgICB0aGlzLl9pc0hpZ2hlciA9IF9pc0hpZ2hlck1pbkhlYXA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGRIZWFwKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHJldmVyc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JldmVyc2U7XG4gIH1cblxuICAvKipcbiAgICogRml4IHRoZSBoZWFwIGJ5IG1vdmluZyBhbiBlbnRyeSB0byBhIG5ldyB1cHBlciBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IHRvIG1vdmUuXG4gICAqL1xuICBfYnViYmxlVXAoc3RhcnRJbmRleCkge1xuICAgIGxldCBlbnRyeSA9IHRoaXMuX2hlYXBbc3RhcnRJbmRleF07XG5cbiAgICBsZXQgaW5kZXggPSBzdGFydEluZGV4O1xuICAgIGxldCBwYXJlbnRJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyAyKTtcbiAgICBsZXQgcGFyZW50ID0gdGhpcy5faGVhcFtwYXJlbnRJbmRleF07XG5cbiAgICB3aGlsZSAocGFyZW50ICYmIHRoaXMuX2lzSGlnaGVyKGVudHJ5LnRpbWUsIHBhcmVudC50aW1lKSkge1xuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgcGFyZW50SW5kZXgpO1xuXG4gICAgICBpbmRleCA9IHBhcmVudEluZGV4O1xuICAgICAgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgICBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRml4IHRoZSBoZWFwIGJ5IG1vdmluZyBhbiBlbnRyeSB0byBhIG5ldyBsb3dlciBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IHRvIG1vdmUuXG4gICAqL1xuICBfYnViYmxlRG93bihzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgbGV0IGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICBsZXQgY2hpbGQxID0gdGhpcy5faGVhcFtjMWluZGV4XTtcbiAgICBsZXQgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcblxuICAgIHdoaWxlICgoY2hpbGQxICYmIHRoaXMuX2lzTG93ZXIoZW50cnkudGltZSwgY2hpbGQxLnRpbWUpKcKgfHxcbiAgICAgICAgICAgKGNoaWxkMiAmJiB0aGlzLl9pc0xvd2VyKGVudHJ5LnRpbWUsIGNoaWxkMi50aW1lKSkpXG4gICAge1xuICAgICAgLy8gc3dhcCB3aXRoIHRoZSBtaW5pbXVtIGNoaWxkXG4gICAgICBsZXQgdGFyZ2V0SW5kZXg7XG5cbiAgICAgIGlmIChjaGlsZDIpXG4gICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5faXNIaWdoZXIoY2hpbGQxLnRpbWUsIGNoaWxkMi50aW1lKSA/IGMxaW5kZXggOiBjMmluZGV4O1xuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXRJbmRleCA9IGMxaW5kZXg7XG5cbiAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIHRhcmdldEluZGV4KTtcblxuICAgICAgLy8gdXBkYXRlIHRvIGZpbmQgbmV4dCBjaGlsZHJlblxuICAgICAgaW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICAgIGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgICBjMmluZGV4ID0gYzFpbmRleCArIDE7XG4gICAgICBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgICAgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIGhlYXAgZnJvbSBib3R0b20gdXAuXG4gICAqL1xuICBidWlsZEhlYXAoKSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGxhc3QgaW50ZXJuYWwgbm9kZVxuICAgIC8vIEB0b2RvIC0gbWFrZSBzdXJlIGl0J3MgdGhlIHJpZ2h0IHdheSB0byBkby5cbiAgICBsZXQgbWF4SW5kZXggPSBNYXRoLmZsb29yKCh0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMSkgLyAyKTtcblxuICAgIGZvciAobGV0IGkgPSBtYXhJbmRleDsgaSA+IDA7IGktLSlcbiAgICAgIHRoaXMuX2J1YmJsZURvd24oaSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIHNldChlbnRyaWVzKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBlbnRyaWVzLmxlbmd0aDsgaSA8IGw7IGkrKylcbiAgICAgIHRoaXMuaW5zZXJ0KGVudHJpZXNbaV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyBvYmplY3QgaW4gdGhlIGJpbmFyeSBoZWFwLCBhbmQgc29ydCBpdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gVGhlIG9iamVjdCB0byBzb3J0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFRoZSB0aW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgaW5zZXJ0ZWQsIGlmIGluZmluaXRlLCB0aGUgZW50cnkgaXMgcmVtb3ZlZCBmcm9tIGZyb20gdGhlIGhlYXAuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IC0gVGltZSBvZiB0aGUgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBpbnNlcnQoZW50cnkpIHtcbiAgICBpZiAoZW50cnkudGltZSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkgJiYgZW50cnkudGltZSAhPT0gTkVHQVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIC8vIGFkZCB0aGUgbmV3IGVudHJ5IGF0IHRoZSBlbmQgb2YgdGhlIGhlYXBcbiAgICAgIHRoaXMuX2hlYXBbdGhpcy5fY3VycmVudExlbmd0aF0gPSBlbnRyeTtcbiAgICAgIC8vIGJ1YmJsZSBpdCB1cFxuICAgICAgdGhpcy5fYnViYmxlVXAodGhpcy5fY3VycmVudExlbmd0aCk7XG4gICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoICs9IDE7XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKGVudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGJyb2tlbiwgYXNzdW1pbmcgYnViYmxpbmcgZG93biBvbmx5IGlzIGZhbHNlXG4gICAqIFJlbW92ZSBhbiBlbnRyeSBmcm9tIHRoZSBoZWFwIGFuZCBmaXggdGhlIGhlYXAuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIFRoZSBlbnRyeSB0byByZW1vdmUuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUaW1lIG9mIGZpcnN0IGVudHJ5IGluIHRoZSBoZWFwLlxuICAgKi9cbiAgcmVtb3ZlKGVudHJ5KSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGVudHJ5XG4gICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuX2N1cnJlbnRMZW5ndGggLSAxO1xuXG4gICAgICAvLyBpZiB0aGUgZW50cnkgaXMgdGhlIGxhc3Qgb25lXG4gICAgICBpZiAoaW5kZXggPT09IGxhc3RJbmRleCkge1xuICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBoZWFwXG4gICAgICAgIHRoaXMuX2hlYXBbbGFzdEluZGV4XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN3YXAgd2l0aCB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBoZWFwXG4gICAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIGxhc3RJbmRleCk7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGhlYXBcbiAgICAgICAgdGhpcy5faGVhcFtsYXN0SW5kZXhdID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gMSkge1xuICAgICAgICAgIHRoaXMuX2J1YmJsZURvd24oMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYnViYmxlIHRoZSAoZXggbGFzdCkgZWxlbWVudCB1cCBvciBkb3duIGFjY29yZGluZyB0byBpdHMgbmV3IGNvbnRleHRcbiAgICAgICAgICBjb25zdCBlID0gdGhpcy5faGVhcFtpbmRleF07XG4gICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildO1xuXG4gICAgICAgICAgaWYgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcihlLnRpbWUsIHBhcmVudC50aW1lKSlcbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZVVwKGluZGV4KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9idWJibGVEb3duKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgY3VycmVudCBsZW5ndGhcbiAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGltZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE1vdmUgYW4gZW50cnkgdG8gYSBuZXcgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIFRoZSBlbnRyeSB0byBtb3ZlLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGltZSBvZiBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIG1vdmUoZW50cnkpIHtcbiAgICBjb25zdCB0aW1lID0gZW50cnkudGltZTtcblxuICAgIGlmICh0aW1lICE9PSBQT1NJVElWRV9JTkZJTklUWSAmJiB0aW1lICE9PSBORUdBVElWRV9JTkZJTklUWSkge1xuICAgICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAvLyBkZWZpbmUgaWYgdGhlIGVudHJ5IHNob3VsZCBiZSBidWJibGVkIHVwIG9yIGRvd25cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildXG5cbiAgICAgICAgaWYgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcih0aW1lLCBwYXJlbnQudGltZSkpXG4gICAgICAgICAgdGhpcy5fYnViYmxlVXAoaW5kZXgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKGVudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgcXVldWUuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gMTtcbiAgICB0aGlzLl9oZWFwID0gbmV3IEFycmF5KHRoaXMuX2hlYXAubGVuZ3RoKTtcbiAgfVxufVxuIl19