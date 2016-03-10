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
var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;

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
        var targetIndex = void 0;

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
            var parent = this._heap[Math.floor(index / 2)];

            if (parent && this._isHigher(e.time, parent.time)) this._bubbleUp(index);else this._bubbleDown(index);
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
          var parent = this._heap[Math.floor(index / 2)];

          if (parent && this._isHigher(time, parent.time)) this._bubbleUp(index);else this._bubbleDown(index);
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
}();

exports.default = PriorityQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW9yaXR5LXF1ZXVlLm5ldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLFNBQVMsSUFBVCxDQUFjLEdBQWQsRUFBbUIsRUFBbkIsRUFBdUIsRUFBdkIsRUFBMkI7QUFDekIsTUFBTSxNQUFNLElBQUksRUFBSixDQUFOLENBRG1CO0FBRXpCLE1BQUksRUFBSixJQUFVLElBQUksRUFBSixDQUFWLENBRnlCO0FBR3pCLE1BQUksRUFBSixJQUFVLEdBQVYsQ0FIeUI7Q0FBM0I7OztBQU9BLFNBQVMsT0FBVCxDQUFpQixHQUFqQixFQUFzQixFQUF0QixFQUEwQjtBQUN4QixNQUFNLElBQUksSUFBSSxNQUFKOztBQURjLE9BR25CLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxDQUFKLEVBQU8sR0FBdkIsRUFBNEI7QUFDMUIsUUFBSSxJQUFJLENBQUosTUFBVyxFQUFYLEVBQWU7QUFDakIsYUFBTyxDQUFQLENBRGlCO0tBQW5CO0dBREY7O0FBTUEsU0FBTyxDQUFDLENBQUQsQ0FUaUI7Q0FBMUI7Ozs7Ozs7OztBQW1CQSxJQUFNLGtCQUFrQixTQUFsQixlQUFrQixDQUFTLEtBQVQsRUFBZ0IsS0FBaEIsRUFBdUI7QUFDN0MsU0FBTyxRQUFRLEtBQVIsQ0FEc0M7Q0FBdkI7O0FBSXhCLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLENBQVMsS0FBVCxFQUFnQixLQUFoQixFQUF1QjtBQUM3QyxTQUFPLFFBQVEsS0FBUixDQURzQztDQUF2Qjs7Ozs7Ozs7O0FBV3hCLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixDQUFTLEtBQVQsRUFBZ0IsS0FBaEIsRUFBdUI7QUFDOUMsU0FBTyxRQUFRLEtBQVIsQ0FEdUM7Q0FBdkI7O0FBSXpCLElBQU0sbUJBQW1CLFNBQW5CLGdCQUFtQixDQUFTLEtBQVQsRUFBZ0IsS0FBaEIsRUFBdUI7QUFDOUMsU0FBTyxRQUFRLEtBQVIsQ0FEdUM7Q0FBdkI7O0FBSXpCLElBQU0sb0JBQW9CLE9BQU8saUJBQVA7QUFDMUIsSUFBTSxvQkFBb0IsT0FBTyxpQkFBUDs7Ozs7OztJQU1MOzs7Ozs7QUFLbkIsV0FMbUIsYUFLbkIsR0FBOEI7UUFBbEIsbUVBQWEsbUJBQUs7d0NBTFgsZUFLVzs7Ozs7O0FBSzVCLFNBQUssY0FBTCxHQUFzQixDQUF0Qjs7Ozs7O0FBTDRCLFFBVzVCLENBQUssS0FBTCxHQUFhLElBQUksS0FBSixDQUFVLGFBQWEsQ0FBYixDQUF2Qjs7Ozs7O0FBWDRCLFFBaUI1QixDQUFLLFFBQUwsR0FBZ0IsSUFBaEI7OztBQWpCNEIsUUFvQjVCLENBQUssT0FBTCxHQUFlLEtBQWYsQ0FwQjRCO0dBQTlCOzs7Ozs7Ozs2QkFMbUI7Ozs7Ozs7OzhCQTRFVCxZQUFZO0FBQ3BCLFVBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxVQUFYLENBQVIsQ0FEZ0I7O0FBR3BCLFVBQUksUUFBUSxVQUFSLENBSGdCO0FBSXBCLFVBQUksY0FBYyxLQUFLLEtBQUwsQ0FBVyxRQUFRLENBQVIsQ0FBekIsQ0FKZ0I7QUFLcEIsVUFBSSxTQUFTLEtBQUssS0FBTCxDQUFXLFdBQVgsQ0FBVCxDQUxnQjs7QUFPcEIsYUFBTyxVQUFVLEtBQUssU0FBTCxDQUFlLE1BQU0sSUFBTixFQUFZLE9BQU8sSUFBUCxDQUFyQyxFQUFtRDtBQUN4RCxhQUFLLEtBQUssS0FBTCxFQUFZLEtBQWpCLEVBQXdCLFdBQXhCLEVBRHdEOztBQUd4RCxnQkFBUSxXQUFSLENBSHdEO0FBSXhELHNCQUFjLEtBQUssS0FBTCxDQUFXLFFBQVEsQ0FBUixDQUF6QixDQUp3RDtBQUt4RCxpQkFBUyxLQUFLLEtBQUwsQ0FBVyxXQUFYLENBQVQsQ0FMd0Q7T0FBMUQ7Ozs7Ozs7Ozs7Z0NBYVUsWUFBWTtBQUN0QixVQUFJLFFBQVEsS0FBSyxLQUFMLENBQVcsVUFBWCxDQUFSLENBRGtCOztBQUd0QixVQUFJLFFBQVEsVUFBUixDQUhrQjtBQUl0QixVQUFJLFVBQVUsUUFBUSxDQUFSLENBSlE7QUFLdEIsVUFBSSxVQUFVLFVBQVUsQ0FBVixDQUxRO0FBTXRCLFVBQUksU0FBUyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQVQsQ0FOa0I7QUFPdEIsVUFBSSxTQUFTLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBVCxDQVBrQjs7QUFTdEIsYUFBTyxNQUFDLElBQVUsS0FBSyxRQUFMLENBQWMsTUFBTSxJQUFOLEVBQVksT0FBTyxJQUFQLENBQXBDLElBQ0EsVUFBVSxLQUFLLFFBQUwsQ0FBYyxNQUFNLElBQU4sRUFBWSxPQUFPLElBQVAsQ0FBcEMsRUFDUjs7QUFFRSxZQUFJLG9CQUFKLENBRkY7O0FBSUUsWUFBSSxNQUFKLEVBQ0UsY0FBYyxLQUFLLFNBQUwsQ0FBZSxPQUFPLElBQVAsRUFBYSxPQUFPLElBQVAsQ0FBNUIsR0FBMkMsT0FBM0MsR0FBcUQsT0FBckQsQ0FEaEIsS0FHRSxjQUFjLE9BQWQsQ0FIRjs7QUFLQSxhQUFLLEtBQUssS0FBTCxFQUFZLEtBQWpCLEVBQXdCLFdBQXhCOzs7QUFURixhQVlFLEdBQVEsV0FBUixDQVpGO0FBYUUsa0JBQVUsUUFBUSxDQUFSLENBYlo7QUFjRSxrQkFBVSxVQUFVLENBQVYsQ0FkWjtBQWVFLGlCQUFTLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBVCxDQWZGO0FBZ0JFLGlCQUFTLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBVCxDQWhCRjtPQUZBOzs7Ozs7Ozs7Z0NBeUJVOzs7QUFHVixVQUFJLFdBQVcsS0FBSyxLQUFMLENBQVcsQ0FBQyxLQUFLLGNBQUwsR0FBc0IsQ0FBdEIsQ0FBRCxHQUE0QixDQUE1QixDQUF0QixDQUhNOztBQUtWLFdBQUssSUFBSSxJQUFJLFFBQUosRUFBYyxJQUFJLENBQUosRUFBTyxHQUE5QjtBQUNFLGFBQUssV0FBTCxDQUFpQixDQUFqQjtPQURGOzs7Ozs7Ozs7d0JBT0UsU0FBUztBQUNYLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFFBQVEsTUFBUixFQUFnQixJQUFJLENBQUosRUFBTyxHQUEzQztBQUNFLGFBQUssTUFBTCxDQUFZLFFBQVEsQ0FBUixDQUFaO09BREY7Ozs7Ozs7Ozs7OzsyQkFVSyxPQUFPO0FBQ1osVUFBSSxNQUFNLElBQU4sS0FBZSxpQkFBZixJQUFvQyxNQUFNLElBQU4sS0FBZSxpQkFBZixFQUFrQzs7QUFFeEUsYUFBSyxLQUFMLENBQVcsS0FBSyxjQUFMLENBQVgsR0FBa0MsS0FBbEM7O0FBRndFLFlBSXhFLENBQUssU0FBTCxDQUFlLEtBQUssY0FBTCxDQUFmLENBSndFO0FBS3hFLGFBQUssY0FBTCxJQUF1QixDQUF2QixDQUx3RTs7QUFPeEUsZUFBTyxLQUFLLElBQUwsQ0FQaUU7T0FBMUU7O0FBVUEsYUFBTyxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQVAsQ0FYWTs7Ozs7Ozs7Ozs7OzJCQW9CUCxPQUFPOztBQUVaLFVBQU0sUUFBUSxRQUFRLEtBQUssS0FBTCxFQUFZLEtBQXBCLENBQVIsQ0FGTTs7QUFJWixVQUFJLFVBQVUsQ0FBQyxDQUFELEVBQUk7QUFDaEIsWUFBTSxZQUFZLEtBQUssY0FBTCxHQUFzQixDQUF0Qjs7O0FBREYsWUFJWixVQUFVLFNBQVYsRUFBcUI7O0FBRXZCLGVBQUssS0FBTCxDQUFXLFNBQVgsSUFBd0IsU0FBeEI7O0FBRnVCLGNBSXZCLENBQUssY0FBTCxHQUFzQixTQUF0QixDQUp1Qjs7QUFNdkIsaUJBQU8sS0FBSyxJQUFMLENBTmdCO1NBQXpCLE1BT087O0FBRUwsZUFBSyxLQUFLLEtBQUwsRUFBWSxLQUFqQixFQUF3QixTQUF4Qjs7QUFGSyxjQUlMLENBQUssS0FBTCxDQUFXLFNBQVgsSUFBd0IsU0FBeEIsQ0FKSzs7QUFNTCxjQUFJLFVBQVUsQ0FBVixFQUFhO0FBQ2YsaUJBQUssV0FBTCxDQUFpQixDQUFqQixFQURlO1dBQWpCLE1BRU87O0FBRUwsZ0JBQU0sSUFBSSxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQUosQ0FGRDtBQUdMLGdCQUFNLFNBQVMsS0FBSyxLQUFMLENBQVcsS0FBSyxLQUFMLENBQVcsUUFBUSxDQUFSLENBQXRCLENBQVQsQ0FIRDs7QUFLTCxnQkFBSSxVQUFVLEtBQUssU0FBTCxDQUFlLEVBQUUsSUFBRixFQUFRLE9BQU8sSUFBUCxDQUFqQyxFQUNGLEtBQUssU0FBTCxDQUFlLEtBQWYsRUFERixLQUdFLEtBQUssV0FBTCxDQUFpQixLQUFqQixFQUhGO1dBUEY7U0FiRjs7O0FBSmdCLFlBZ0NoQixDQUFLLGNBQUwsR0FBc0IsU0FBdEIsQ0FoQ2dCO09BQWxCOztBQW1DQSxhQUFPLEtBQUssSUFBTCxDQXZDSzs7Ozs7Ozs7Ozs7eUJBZ0RULE9BQU87QUFDVixVQUFNLE9BQU8sTUFBTSxJQUFOLENBREg7O0FBR1YsVUFBSSxTQUFTLGlCQUFULElBQThCLFNBQVMsaUJBQVQsRUFBNEI7QUFDNUQsWUFBTSxRQUFRLFFBQVEsS0FBSyxLQUFMLEVBQVksS0FBcEIsQ0FBUixDQURzRDs7QUFHNUQsWUFBSSxVQUFVLENBQUMsQ0FBRCxFQUFJOztBQUVoQixjQUFNLFNBQVMsS0FBSyxLQUFMLENBQVcsS0FBSyxLQUFMLENBQVcsUUFBUSxDQUFSLENBQXRCLENBQVQsQ0FGVTs7QUFJaEIsY0FBSSxVQUFVLEtBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsT0FBTyxJQUFQLENBQS9CLEVBQ0YsS0FBSyxTQUFMLENBQWUsS0FBZixFQURGLEtBR0UsS0FBSyxXQUFMLENBQWlCLEtBQWpCLEVBSEY7U0FKRjs7QUFVQSxlQUFPLEtBQUssSUFBTCxDQWJxRDtPQUE5RDs7QUFnQkEsYUFBTyxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQVAsQ0FuQlU7Ozs7Ozs7Ozs0QkF5Qko7QUFDTixXQUFLLGNBQUwsR0FBc0IsQ0FBdEIsQ0FETTtBQUVOLFdBQUssS0FBTCxHQUFhLElBQUksS0FBSixDQUFVLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBdkIsQ0FGTTs7Ozt3QkF0Tkc7QUFDVCxVQUFJLEtBQUssY0FBTCxHQUFzQixDQUF0QixFQUF5QjtBQUMzQixlQUFPLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxJQUFkLENBRG9CO09BQTdCOztBQUlBLGFBQU8sUUFBUCxDQUxTOzs7Ozs7Ozs7O3dCQVlBO0FBQ1QsYUFBTyxLQUFLLEtBQUwsQ0FBVyxDQUFYLENBQVAsQ0FEUzs7Ozs7Ozs7OztzQkFRQyxPQUFPO0FBQ2pCLFVBQUksVUFBVSxLQUFLLFFBQUwsRUFBZTtBQUMzQixhQUFLLFFBQUwsR0FBZ0IsS0FBaEIsQ0FEMkI7O0FBRzNCLFlBQUksS0FBSyxRQUFMLEtBQWtCLElBQWxCLEVBQXdCO0FBQzFCLGVBQUssUUFBTCxHQUFnQixlQUFoQixDQUQwQjtBQUUxQixlQUFLLFNBQUwsR0FBaUIsZ0JBQWpCLENBRjBCO1NBQTVCLE1BR087QUFDTCxlQUFLLFFBQUwsR0FBZ0IsZUFBaEIsQ0FESztBQUVMLGVBQUssU0FBTCxHQUFpQixnQkFBakIsQ0FGSztTQUhQOztBQVFBLGFBQUssU0FBTCxHQVgyQjtPQUE3Qjs7d0JBZVk7QUFDWixhQUFPLEtBQUssUUFBTCxDQURLOzs7U0FwRUsiLCJmaWxlIjoicHJpb3JpdHktcXVldWUubmV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gd29ya3MgYnkgcmVmZXJlbmNlXG5mdW5jdGlvbiBzd2FwKGFyciwgaTEsIGkyKSB7XG4gIGNvbnN0IHRtcCA9IGFycltpMV07XG4gIGFycltpMV0gPSBhcnJbaTJdO1xuICBhcnJbaTJdID0gdG1wO1xufVxuXG4vLyBodHRwczovL2pzcGVyZi5jb20vanMtZm9yLWxvb3AtdnMtYXJyYXktaW5kZXhvZi8zNDZcbmZ1bmN0aW9uIGluZGV4T2YoYXJyLCBlbCkge1xuICBjb25zdCBsID0gYXJyLmxlbmd0aDtcbiAgLy8gaWdub3JlIGZpcnN0IGVsZW1lbnQgYXMgaXQgY2FuJ3QgYmUgYSBlbnRyeVxuICBmb3IgKGxldCBpID0gMTsgaSA8IGw7IGkrKykge1xuICAgIGlmIChhcnJbaV0gPT09IGVsKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogRGVmaW5lIGlmIGB0aW1lMWAgc2hvdWxkIGJlIGxvd2VyIGluIHRoZSB0b3BvZ3JhcGh5IHRoYW4gYHRpbWUyYC5cbiAqIElzIGR5bmFtaWNhbGx5IGFmZmVjdGVkIHRvIHRoZSBwcmlvcml0eSBxdWV1ZSBhY2NvcmRpbmcgdG8gaGFuZGxlIGBtaW5gIGFuZCBgbWF4YCBoZWFwLlxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0xvd2VyTWF4SGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn1cblxuY29uc3QgX2lzTG93ZXJNaW5IZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA+IHRpbWUyO1xufVxuXG4vKipcbiAqIERlZmluZSBpZiBgdGltZTFgIHNob3VsZCBiZSBoaWdoZXIgaW4gdGhlIHRvcG9ncmFwaHkgdGhhbiBgdGltZTJgLlxuICogSXMgZHluYW1pY2FsbHkgYWZmZWN0ZWQgdG8gdGhlIHByaW9yaXR5IHF1ZXVlIGFjY29yZGluZyB0byBoYW5kbGUgYG1pbmAgYW5kIGBtYXhgIGhlYXAuXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTFcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuY29uc3QgX2lzSGlnaGVyTWF4SGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPiB0aW1lMjtcbn1cblxuY29uc3QgX2lzSGlnaGVyTWluSGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn1cblxuY29uc3QgUE9TSVRJVkVfSU5GSU5JVFkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5jb25zdCBORUdBVElWRV9JTkZJTklUWSA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcblxuLyoqXG4gKiBQcmlvcml0eSBxdWV1ZSBpbXBsZW1lbnRpbmcgYSBiaW5hcnkgaGVhcC5cbiAqIEFjdHMgYXMgYSBtaW4gaGVhcCBieSBkZWZhdWx0LCBjYW4gYmUgZHluYW1pY2FsbHkgY2hhbmdlZCB0byBhIG1heCBoZWFwIGJ5IHNldHRpbmcgYHJldmVyc2VgIHRvIHRydWUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW9yaXR5UXVldWUge1xuICAvKipcbiAgICogQHBhcmFtIHtTdHJpbmd9IFthY2Nlc3Nvcj0ndGltZSddIC0gVGhlIGF0dHJpYnV0ZSBvZiB0aGUgZW50cmllcyB0aGF0IHNob3VsZCBiZSB1c2VkIGFzIHRoZSBwcmlvcml0eSB2YWx1ZS4gVGhpcyBhdHRyaWJ1dGUgbXVzdCBiZSBhIG51bWJlci5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtoZWFwTGVuZ3RoPTEwMF0gLSBUaGUgc2l6ZSBvZiB0aGUgYXJyYXkgdXNlZCB0byBjcmVhdGUgdGhlIGhlYXAuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoZWFwTGVuZ3RoID0gMTAwKSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBBIHBvaW50ZXIgdG8gdGhlIGZpcnN0IGVtcHR5IGluZGV4IG9mIHRoZSBoZWFwLlxuICAgICAqL1xuICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSAxO1xuXG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgdGhlIHNvcnRlZCBpbmRleGVzIG9mIHRoZSBlbnRyaWVzLCB0aGUgYWN0dWFsIGhlYXAuIElnbm9yZSB0aGUgaW5kZXggMC5cbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgdGhpcy5faGVhcCA9IG5ldyBBcnJheShoZWFwTGVuZ3RoICsgMSk7XG5cbiAgICAvKipcbiAgICAgKiBEZWZpbmUgdGhlIHR5cGUgb2YgdGhlIHF1ZXVlOiBgbWluYCBoZWFwIGlmIGBmYWxzZWAsIGBtYXhgIGhlYXAgaWYgYHRydWVgXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICovXG4gICAgdGhpcy5fcmV2ZXJzZSA9IG51bGw7XG5cbiAgICAvLyBpbml0aWFsaXplIGNvbXBhcmUgZnVuY3Rpb25zXG4gICAgdGhpcy5yZXZlcnNlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0aW1lIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TGVuZ3RoID4gMSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2hlYXBbMV0udGltZTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZW50cnkgb2YgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIGJpbmFyeSBoZWFwLlxuICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgKi9cbiAgZ2V0IGhlYWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYXBbMV07XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBvcmRlciBvZiB0aGUgcXVldWUsIHJlYnVpbGQgdGhlIGhlYXAgd2l0aCB0aGUgZXhpc3RpbmcgZW50cmllcy5cbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBzZXQgcmV2ZXJzZSh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fcmV2ZXJzZSkge1xuICAgICAgdGhpcy5fcmV2ZXJzZSA9IHZhbHVlO1xuXG4gICAgICBpZiAodGhpcy5fcmV2ZXJzZSA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLl9pc0xvd2VyID0gX2lzTG93ZXJNYXhIZWFwO1xuICAgICAgICB0aGlzLl9pc0hpZ2hlciA9IF9pc0hpZ2hlck1heEhlYXA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9pc0xvd2VyID0gX2lzTG93ZXJNaW5IZWFwO1xuICAgICAgICB0aGlzLl9pc0hpZ2hlciA9IF9pc0hpZ2hlck1pbkhlYXA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGRIZWFwKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHJldmVyc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JldmVyc2U7XG4gIH1cblxuICAvKipcbiAgICogRml4IHRoZSBoZWFwIGJ5IG1vdmluZyBhbiBlbnRyeSB0byBhIG5ldyB1cHBlciBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IHRvIG1vdmUuXG4gICAqL1xuICBfYnViYmxlVXAoc3RhcnRJbmRleCkge1xuICAgIGxldCBlbnRyeSA9IHRoaXMuX2hlYXBbc3RhcnRJbmRleF07XG5cbiAgICBsZXQgaW5kZXggPSBzdGFydEluZGV4O1xuICAgIGxldCBwYXJlbnRJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyAyKTtcbiAgICBsZXQgcGFyZW50ID0gdGhpcy5faGVhcFtwYXJlbnRJbmRleF07XG5cbiAgICB3aGlsZSAocGFyZW50ICYmIHRoaXMuX2lzSGlnaGVyKGVudHJ5LnRpbWUsIHBhcmVudC50aW1lKSkge1xuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgcGFyZW50SW5kZXgpO1xuXG4gICAgICBpbmRleCA9IHBhcmVudEluZGV4O1xuICAgICAgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgICBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRml4IHRoZSBoZWFwIGJ5IG1vdmluZyBhbiBlbnRyeSB0byBhIG5ldyBsb3dlciBwb3NpdGlvbi5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IHRvIG1vdmUuXG4gICAqL1xuICBfYnViYmxlRG93bihzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgbGV0IGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICBsZXQgY2hpbGQxID0gdGhpcy5faGVhcFtjMWluZGV4XTtcbiAgICBsZXQgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcblxuICAgIHdoaWxlICgoY2hpbGQxICYmIHRoaXMuX2lzTG93ZXIoZW50cnkudGltZSwgY2hpbGQxLnRpbWUpKcKgfHxcbiAgICAgICAgICAgKGNoaWxkMiAmJiB0aGlzLl9pc0xvd2VyKGVudHJ5LnRpbWUsIGNoaWxkMi50aW1lKSkpXG4gICAge1xuICAgICAgLy8gc3dhcCB3aXRoIHRoZSBtaW5pbXVtIGNoaWxkXG4gICAgICBsZXQgdGFyZ2V0SW5kZXg7XG5cbiAgICAgIGlmIChjaGlsZDIpXG4gICAgICAgIHRhcmdldEluZGV4ID0gdGhpcy5faXNIaWdoZXIoY2hpbGQxLnRpbWUsIGNoaWxkMi50aW1lKSA/IGMxaW5kZXggOiBjMmluZGV4O1xuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXRJbmRleCA9IGMxaW5kZXg7XG5cbiAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIHRhcmdldEluZGV4KTtcblxuICAgICAgLy8gdXBkYXRlIHRvIGZpbmQgbmV4dCBjaGlsZHJlblxuICAgICAgaW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICAgIGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgICBjMmluZGV4ID0gYzFpbmRleCArIDE7XG4gICAgICBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgICAgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIGhlYXAgZnJvbSBib3R0b20gdXAuXG4gICAqL1xuICBidWlsZEhlYXAoKSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGxhc3QgaW50ZXJuYWwgbm9kZVxuICAgIC8vIEB0b2RvIC0gbWFrZSBzdXJlIGl0J3MgdGhlIHJpZ2h0IHdheSB0byBkby5cbiAgICBsZXQgbWF4SW5kZXggPSBNYXRoLmZsb29yKCh0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMSkgLyAyKTtcblxuICAgIGZvciAobGV0IGkgPSBtYXhJbmRleDsgaSA+IDA7IGktLSlcbiAgICAgIHRoaXMuX2J1YmJsZURvd24oaSk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIHNldChlbnRyaWVzKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSBlbnRyaWVzLmxlbmd0aDsgaSA8IGw7IGkrKylcbiAgICAgIHRoaXMuaW5zZXJ0KGVudHJpZXNbaV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyBvYmplY3QgaW4gdGhlIGJpbmFyeSBoZWFwLCBhbmQgc29ydCBpdC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gVGhlIG9iamVjdCB0byBzb3J0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFRoZSB0aW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgaW5zZXJ0ZWQsIGlmIGluZmluaXRlLCB0aGUgZW50cnkgaXMgcmVtb3ZlZCBmcm9tIGZyb20gdGhlIGhlYXAuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IC0gVGltZSBvZiB0aGUgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBpbnNlcnQoZW50cnkpIHtcbiAgICBpZiAoZW50cnkudGltZSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkgJiYgZW50cnkudGltZSAhPT0gTkVHQVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIC8vIGFkZCB0aGUgbmV3IGVudHJ5IGF0IHRoZSBlbmQgb2YgdGhlIGhlYXBcbiAgICAgIHRoaXMuX2hlYXBbdGhpcy5fY3VycmVudExlbmd0aF0gPSBlbnRyeTtcbiAgICAgIC8vIGJ1YmJsZSBpdCB1cFxuICAgICAgdGhpcy5fYnViYmxlVXAodGhpcy5fY3VycmVudExlbmd0aCk7XG4gICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoICs9IDE7XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKGVudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGJyb2tlbiwgYXNzdW1pbmcgYnViYmxpbmcgZG93biBvbmx5IGlzIGZhbHNlXG4gICAqIFJlbW92ZSBhbiBlbnRyeSBmcm9tIHRoZSBoZWFwIGFuZCBmaXggdGhlIGhlYXAuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIFRoZSBlbnRyeSB0byByZW1vdmUuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUaW1lIG9mIGZpcnN0IGVudHJ5IGluIHRoZSBoZWFwLlxuICAgKi9cbiAgcmVtb3ZlKGVudHJ5KSB7XG4gICAgLy8gZmluZCB0aGUgaW5kZXggb2YgdGhlIGVudHJ5XG4gICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGNvbnN0IGxhc3RJbmRleCA9IHRoaXMuX2N1cnJlbnRMZW5ndGggLSAxO1xuXG4gICAgICAvLyBpZiB0aGUgZW50cnkgaXMgdGhlIGxhc3Qgb25lXG4gICAgICBpZiAoaW5kZXggPT09IGxhc3RJbmRleCkge1xuICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBoZWFwXG4gICAgICAgIHRoaXMuX2hlYXBbbGFzdEluZGV4XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN3YXAgd2l0aCB0aGUgbGFzdCBlbGVtZW50IG9mIHRoZSBoZWFwXG4gICAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIGxhc3RJbmRleCk7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGhlYXBcbiAgICAgICAgdGhpcy5faGVhcFtsYXN0SW5kZXhdID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChpbmRleCA9PT0gMSkge1xuICAgICAgICAgIHRoaXMuX2J1YmJsZURvd24oMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYnViYmxlIHRoZSAoZXggbGFzdCkgZWxlbWVudCB1cCBvciBkb3duIGFjY29yZGluZyB0byBpdHMgbmV3IGNvbnRleHRcbiAgICAgICAgICBjb25zdCBlID0gdGhpcy5faGVhcFtpbmRleF07XG4gICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildO1xuXG4gICAgICAgICAgaWYgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcihlLnRpbWUsIHBhcmVudC50aW1lKSlcbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZVVwKGluZGV4KTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLl9idWJibGVEb3duKGluZGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgY3VycmVudCBsZW5ndGhcbiAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSBsYXN0SW5kZXg7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGltZTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIE1vdmUgYW4gZW50cnkgdG8gYSBuZXcgcG9zaXRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIFRoZSBlbnRyeSB0byBtb3ZlLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGltZSBvZiBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIG1vdmUoZW50cnkpIHtcbiAgICBjb25zdCB0aW1lID0gZW50cnkudGltZTtcblxuICAgIGlmICh0aW1lICE9PSBQT1NJVElWRV9JTkZJTklUWSAmJiB0aW1lICE9PSBORUdBVElWRV9JTkZJTklUWSkge1xuICAgICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAvLyBkZWZpbmUgaWYgdGhlIGVudHJ5IHNob3VsZCBiZSBidWJibGVkIHVwIG9yIGRvd25cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildXG5cbiAgICAgICAgaWYgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcih0aW1lLCBwYXJlbnQudGltZSkpXG4gICAgICAgICAgdGhpcy5fYnViYmxlVXAoaW5kZXgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKGVudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgcXVldWUuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gMTtcbiAgICB0aGlzLl9oZWFwID0gbmV3IEFycmF5KHRoaXMuX2hlYXAubGVuZ3RoKTtcbiAgfVxufVxuIl19