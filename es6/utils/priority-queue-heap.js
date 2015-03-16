var MinHeap = require('./min-heap');
var MaxHeap = require('./max-heap');
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert Schnell <Norbert.Schnell@ircam.fr>
 *
 * First rather stupid implementation to be optimized...
 */

class PriorityQueue {

	constructor() {
		this.__heap = new MinHeap();
		this.__reverse = false;
	}

	/**
	 * Insert an object to the queue
	 * (for this primitive version: prevent sorting for each element by calling
	 * with "false" as third argument)
	 */
	insert(object, time) {
		if (time !== Infinity && time !== -Infinity) {
			// add new object
			this.__heap.insert(time, object);

			return this.__heap.headValue(); // return time of first object
		}

		return Infinity; //  **** Make sure its not another time you'd want
	}

	/**
	 * Move an object to another time in the queue
	 */
	move(object, time) {
		if (time !== Infinity && time != -Infinity) {

			if (this.__heap.isEmpty())
				this.__heap.insert(time, object); // add new object
			else {
				this.__heap.update(object, time);
			}

			return this.__heap.headValue();
		}

		return this.__heap.remove(object);
	}

	/**
	 * Remove an object from the queue
	 */
	remove(item) {
		return this.__heap.remove(item);
	}

	/**
	 * Clear queue
	 */
	clear() {
		this.__heap.empty();
		return Infinity;
	}

	/**
	 * Get first object in queue
	 */
	get head() {
		if (!this.__heap.isEmpty())
			return this.__heap.headObject();

		return null;
	}

	/**
	 * Get time of first object in queue
	 */
	get time() {
		if (!this.__heap.isEmpty())
			return this.__heap.headValue();

		return Infinity;
	}

	get reverse() {
		return this.__reverse;
	}

	set reverse(value) {
		if (value !== this.__reverse) {
			var heapList = this.__heap.list();
			heapList.shift(); // remove swap value (first elem in array)

			if (value)
				this.__heap = new MaxHeap();
			else
				this.__heap = new MinHeap();

			this.__heap.buildHeap(heapList);
			this.__reverse = value;
		}
	}
}

module.exports = PriorityQueue;