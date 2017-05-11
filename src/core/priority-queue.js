// works by reference
function swap(arr, i1, i2) {
  const tmp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = tmp;
}

// https://jsperf.com/js-for-loop-vs-array-indexof/346
function indexOf(arr, el) {
  const l = arr.length;
  // ignore first element as it can't be a entry
  for (let i = 1; i < l; i++) {
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
const _isLowerMaxHeap = function(time1, time2) {
  return time1 < time2;
};

const _isLowerMinHeap = function(time1, time2) {
  return time1 > time2;
};

/**
 * Define if `time1` should be higher in the topography than `time2`.
 * Is dynamically affected to the priority queue according to handle `min` and `max` heap.
 * @param {Number} time1
 * @param {Number} time2
 * @return {Boolean}
 */
const _isHigherMaxHeap = function(time1, time2) {
  return time1 > time2;
};

const _isHigherMinHeap = function(time1, time2) {
  return time1 < time2;
};

const POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

/**
 * Priority queue implementing a binary heap.
 * Acts as a min heap by default, can be dynamically changed to a max heap by setting `reverse` to true.
 */
export default class PriorityQueue {
  /**
   * @param {String} [accessor='time'] - The attribute of the entries that should be used as the priority value. This attribute must be a number.
   * @param {Number} [heapLength=100] - The size of the array used to create the heap.
   */
  constructor(heapLength = 100) {
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
  get time() {
    if (this._currentLength > 1)
      return this._heap[1].queueTime;

    return Infinity;
  }

  /**
   * Returns the entry of the first element in the binary heap.
   * @returns {Number}
   */
  get head() {
    return this._heap[1];
  }

  /**
   * Change the order of the queue, rebuild the heap with the existing entries.
   * @type {Boolean}
   */
  set reverse(value) {
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
  }

  get reverse() {
    return this._reverse;
  }

  /**
   * Fix the heap by moving an entry to a new upper position.
   * @param {Number} startIndex - The index of the entry to move.
   */
  _bubbleUp(startIndex) {
    let entry = this._heap[startIndex];

    let index = startIndex;
    let parentIndex = Math.floor(index / 2);
    let parent = this._heap[parentIndex];

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
  _bubbleDown(startIndex) {
    let entry = this._heap[startIndex];

    let index = startIndex;
    let c1index = index * 2;
    let c2index = c1index + 1;
    let child1 = this._heap[c1index];
    let child2 = this._heap[c2index];

    while ((child1 && this._isLower(entry.queueTime, child1.queueTime)) ||
           (child2 && this._isLower(entry.queueTime, child2.queueTime)))
    {
      // swap with the minimum child
      let targetIndex;

      if (child2)
        targetIndex = this._isHigher(child1.queueTime, child2.queueTime) ? c1index : c2index;
      else
        targetIndex = c1index;

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
  buildHeap() {
    // find the index of the last internal node
    // @todo - make sure that's the right way to do.
    let maxIndex = Math.floor((this._currentLength - 1) / 2);

    for (let i = maxIndex; i > 0; i--)
      this._bubbleDown(i);
  }

  /**
   * Insert a new object in the binary heap, and sort it.
   * @param {Object} entry - Entry to insert.
   * @param {Number} time - Time at which the entry should be orderer.
   * @returns {Number} - Time of the first entry in the heap.
   */
  insert(entry, time) {
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
  move(entry, time) {
    if (Math.abs(time) !== POSITIVE_INFINITY) {
      const index = indexOf(this._heap, entry);

      if (index !== -1) {
        entry.queueTime = time;
        // define if the entry should be bubbled up or down
        const parent = this._heap[Math.floor(index / 2)];

        if (parent && this._isHigher(time, parent.queueTime))
          this._bubbleUp(index);
        else
          this._bubbleDown(index);
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
  remove(entry) {
    // find the index of the entry
    const index = indexOf(this._heap, entry);

    if (index !== -1) {
      const lastIndex = this._currentLength - 1;

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
          const entry = this._heap[index];
          const parent = this._heap[Math.floor(index / 2)];

          if (parent && this._isHigher(entry.queueTime, parent.queueTime))
            this._bubbleUp(index);
          else
            this._bubbleDown(index);
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
  clear() {
    this._currentLength = 1;
    this._heap = new Array(this._heap.length);
  }

  has(entry) {
    return this._heap.indexOf(entry) !== -1;
  }
}
