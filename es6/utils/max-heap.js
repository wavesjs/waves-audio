var Heap = require('./heap');
/**
 * ES6 Implementation of a maximum binary heap based on :
 * http://interactivepython.org/courselib/static/pythonds/Trees/heap.html
 *
 * The head (or position 1 in the array) should be the object with maximal heap
 * value.
 *
 * @author: Renaud Vincent https://github.com/renaudfv
 **/
class MaxHeap extends Heap {

	constructor() {
		super();
		// Empty object with maximal value used for swaping on the first insertions
		this.heapList = [{
			'object': {},
			'heapValue': Infinity
		}];
	}

	/**
	 * Method used to maintain the max heap property from a certain index. It is
	 * used locally from the end of the heap list upon insertion, update and
	 * removal. It percolates max values up the binary tree.
	 */
	__percUp(i) {
		var ceiledIndex, tmp;

		while (Math.floor(i / 2) > 0) {
			ceiledIndex = Math.floor(i / 2);
			// Is the item at i greater than the one at ceiled index
			if (this.heapList[i].heapValue >  this.heapList[ceiledIndex].heapValue) {
				tmp = this.heapList[ceiledIndex];
				this.heapList[ceiledIndex] = this.heapList[i];
				this.heapList[i] = tmp;
			}

			i = ceiledIndex;
		}
	}

	/**
	 * Method used to maintain the min heap property from a certain index. It is
	 * used locally from the start of the heap list upon deletion. Items are 
	 * swaped down the tree if they have a smaller reference value.
	 */
	__percDown(i) {
		var refPos, tmp;

		while ((i * 2) <= this.currentSize) {
			refPos = this.__childPosition(i);
			// Is the item at i smaller than the reference down the tree
			if (this.heapList[i].heapValue < this.heapList[refPos].heapValue) {
				tmp = this.heapList[i];
				this.heapList[i] = this.heapList[refPos];
				this.heapList[refPos] = tmp;
			}

			i = refPos;
		}
	}

	/**
	 * Finds the item object reference in the heap list brings it up the tree by
	 * having an infinity value. The tree is the sorted and the head is removed.
	 */
	remove(item) {
		for (var i = 0; i <= this.currentSize; i++) {
			if (item === this.heapList[i].object) {
				this.heapList[i].heapValue = Infinity;
				this.__percUp(this.currentSize);
				this.deleteHead();
			}
		}

		return Infinity;
	}

	/**
	 * Build heap from an object list and structure it with a maximal swap 
	 * reference
	 */
	buildHeap(list) {
		this.currentSize = list.length;
		this.heapList = [{
			'object': {},
			'heapValue': Infinity
		}].concat(list);

		var i = list.length;
		while (i  >  0) {
			this.__percUp(i);
			i--;
		}
	}

	/**
	* Clear the list with a maximal heapValue swap reference
	*/
	empty() {
		this.heapList = [{
			'object': {},
			'heapValue': Infinity 
		}];
		this.currentSize = 0;
	}

}

module.exports = MaxHeap;