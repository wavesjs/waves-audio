/**
 * ES6 Implementation of a binary heap based on :
 * http://interactivepython.org/courselib/static/pythonds/Trees/heap.html
 *
 * The Heap class is an abstraction of the binary heap. It is implemented to
 * give methods related to both min and max heaps.
 *
 * @author: Renaud Vincent https://github.com/renaudfv
 **/
class Heap {

	constructor() {
		this.currentSize = 0;
		this.heapList = [];
	}

	// Abstract method which brings elements up the tree from the i index.
	__percUp(i) {}

	// Abstract method which brings elements down the tree from the i index.
	__percDown(i) {}

	// Removes an object from the heap, item being refering to the nested object
	remove(item) {}

	// Build the heap from an object list and structure it
	buildHeap(list) {}

	// Clear the list by replacing it with the appropriate swap object
	empty() {}

	/**
	 * Static method used to get a specific index down the tree
	 * for swap/perc purposes in the perc down method
	 */
	__childPosition(i) {
		if ((i * 2 + 1 > this.currentSize) ||
			(this.heapList[i * 2].heapValue <  this.heapList[i * 2 + 1].heapValue)) {
			return i * 2;
		} else {
			return i * 2 + 1;
		}
	}

	/**
	 * Insert a value with an associated object in the heap tree. The perc up
	 * method implementation should handle what to do with the heapValue (eg min
	 * or max sorting).
	 *
	 * @params value being the heapValue used for sorting and any object
	 */
	insert(value, object) {
		this.heapList.push({
			'object': object,
			'heapValue': value
		});
		this.currentSize++;
		this.__percUp(this.currentSize);
	}

	/**
	 * Find the object reference in the heap list and update its heapValue.
	 * The tree should the be sorted using perc up to bring the next desired value
	 * as the head.
	 */
	update(object, value) {
		for (var i = 1; i <= this.currentSize; i++) {
			if (object === this.heapList[i].object) {
				this.heapList[i].heapValue = value;
				this.__percUp(this.currentSize);
			}
		}
	}

	/**
	 * Method used to get the head (minimal) of heap list. Puts it at the end of
	 * the list and takes it out with pop. Assures that the tree is restored.
	 */
	deleteHead() {
		var referenceValue = this.heapList[1]; // pos 0 being used for percolating
		this.heapList[1] = this.heapList[this.currentSize]; // first item is last
		this.currentSize--;
		this.heapList.pop();
		this.__percDown(1); // from first item, restore tree
		return referenceValue;
	}

	/**
	 * Returns object reference of head without removing it.
	 */
	headObject() {
		return this.heapList[1].object;
	}

	/**
	 * Returns value reference of head without removing it.
	 */
	headValue() {
		return this.heapList[1].heapValue;
	}

	/**
	 * List accessor
	 */
	list() {
		return this.heapList;
	}

	/**
	 * Current size accessor
	 */
	size() {
		return this.currentSize;
	}

	/**
	 * Returns whether or not the heap is empty.
	 */
	isEmpty() {
		return this.currentSize === 0;
	}

}

module.exports = Heap;