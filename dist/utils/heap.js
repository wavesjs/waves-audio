"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

/**
 * ES6 Implementation of a binary heap based on :
 * http://interactivepython.org/courselib/static/pythonds/Trees/heap.html
 *
 * The Heap class is an abstraction of the binary heap. It is implemented to
 * give methods related to both min and max heaps.
 *
 * @author: Renaud Vincent https://github.com/renaudfv
 **/

var Heap = (function () {
	function Heap() {
		_classCallCheck(this, Heap);

		this.currentSize = 0;
		this.heapList = [];
	}

	_createClass(Heap, {
		__percUp: {

			// Abstract method which brings elements up the tree from the i index.

			value: function __percUp(i) {}
		},
		__percDown: {

			// Abstract method which brings elements down the tree from the i index.

			value: function __percDown(i) {}
		},
		remove: {

			// Removes an object from the heap, item being refering to the nested object

			value: function remove(item) {}
		},
		buildHeap: {

			// Build the heap from an object list and structure it

			value: function buildHeap(list) {}
		},
		empty: {

			// Clear the list by replacing it with the appropriate swap object

			value: function empty() {}
		},
		__childPosition: {

			/**
    * Static method used to get a specific index down the tree
    * for swap/perc purposes in the perc down method
    */

			value: function __childPosition(i) {
				if (i * 2 + 1 > this.currentSize || this.heapList[i * 2].heapValue < this.heapList[i * 2 + 1].heapValue) {
					return i * 2;
				} else {
					return i * 2 + 1;
				}
			}
		},
		insert: {

			/**
    * Insert a value with an associated object in the heap tree. The perc up
    * method implementation should handle what to do with the heapValue (eg min
    * or max sorting).
    *
    * @params value being the heapValue used for sorting and any object
    */

			value: function insert(value, object) {
				this.heapList.push({
					object: object,
					heapValue: value
				});
				this.currentSize++;
				this.__percUp(this.currentSize);
			}
		},
		update: {

			/**
    * Find the object reference in the heap list and update its heapValue.
    * The tree should the be sorted using perc up to bring the next desired value
    * as the head.
    */

			value: function update(object, value) {
				for (var i = 1; i <= this.currentSize; i++) {
					if (object === this.heapList[i].object) {
						this.heapList[i].heapValue = value;
						this.__percUp(this.currentSize);
					}
				}
			}
		},
		deleteHead: {

			/**
    * Method used to get the head (minimal) of heap list. Puts it at the end of
    * the list and takes it out with pop. Assures that the tree is restored.
    */

			value: function deleteHead() {
				var referenceValue = this.heapList[1]; // pos 0 being used for percolating
				this.heapList[1] = this.heapList[this.currentSize]; // first item is last
				this.currentSize--;
				this.heapList.pop();
				this.__percDown(1); // from first item, restore tree
				return referenceValue;
			}
		},
		headObject: {

			/**
    * Returns object reference of head without removing it.
    */

			value: function headObject() {
				return this.heapList[1].object;
			}
		},
		headValue: {

			/**
    * Returns value reference of head without removing it.
    */

			value: function headValue() {
				return this.heapList[1].heapValue;
			}
		},
		list: {

			/**
    * List accessor
    */

			value: function list() {
				return this.heapList;
			}
		},
		size: {

			/**
    * Current size accessor
    */

			value: function size() {
				return this.currentSize;
			}
		},
		isEmpty: {

			/**
    * Returns whether or not the heap is empty.
    */

			value: function isEmpty() {
				return this.currentSize === 0;
			}
		}
	});

	return Heap;
})();

module.exports = Heap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBU00sSUFBSTtBQUVFLFVBRk4sSUFBSSxHQUVLO3dCQUZULElBQUk7O0FBR1IsTUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDckIsTUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7RUFDbkI7O2NBTEksSUFBSTtBQVFULFVBQVE7Ozs7VUFBQSxrQkFBQyxDQUFDLEVBQUUsRUFBRTs7QUFHZCxZQUFVOzs7O1VBQUEsb0JBQUMsQ0FBQyxFQUFFLEVBQUU7O0FBR2hCLFFBQU07Ozs7VUFBQSxnQkFBQyxJQUFJLEVBQUUsRUFBRTs7QUFHZixXQUFTOzs7O1VBQUEsbUJBQUMsSUFBSSxFQUFFLEVBQUU7O0FBR2xCLE9BQUs7Ozs7VUFBQSxpQkFBRyxFQUFFOztBQU1WLGlCQUFlOzs7Ozs7O1VBQUEseUJBQUMsQ0FBQyxFQUFFO0FBQ2xCLFFBQUksQUFBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQUFBQyxFQUFFO0FBQ3hFLFlBQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNiLE1BQU07QUFDTixZQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pCO0lBQ0Q7O0FBU0QsUUFBTTs7Ozs7Ozs7OztVQUFBLGdCQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7QUFDckIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDbEIsYUFBVSxNQUFNO0FBQ2hCLGdCQUFhLEtBQUs7S0FDbEIsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2hDOztBQU9ELFFBQU07Ozs7Ozs7O1VBQUEsZ0JBQUMsTUFBTSxFQUFFLEtBQUssRUFBRTtBQUNyQixTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQyxTQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUN2QyxVQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDbkMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7TUFDaEM7S0FDRDtJQUNEOztBQU1ELFlBQVU7Ozs7Ozs7VUFBQSxzQkFBRztBQUNaLFFBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEMsUUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNwQixRQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLFdBQU8sY0FBYyxDQUFDO0lBQ3RCOztBQUtELFlBQVU7Ozs7OztVQUFBLHNCQUFHO0FBQ1osV0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMvQjs7QUFLRCxXQUFTOzs7Ozs7VUFBQSxxQkFBRztBQUNYLFdBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDbEM7O0FBS0QsTUFBSTs7Ozs7O1VBQUEsZ0JBQUc7QUFDTixXQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDckI7O0FBS0QsTUFBSTs7Ozs7O1VBQUEsZ0JBQUc7QUFDTixXQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDeEI7O0FBS0QsU0FBTzs7Ozs7O1VBQUEsbUJBQUc7QUFDVCxXQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssQ0FBQyxDQUFDO0lBQzlCOzs7O1FBL0dJLElBQUk7OztBQW1IVixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEVTNiBJbXBsZW1lbnRhdGlvbiBvZiBhIGJpbmFyeSBoZWFwIGJhc2VkIG9uIDpcbiAqIGh0dHA6Ly9pbnRlcmFjdGl2ZXB5dGhvbi5vcmcvY291cnNlbGliL3N0YXRpYy9weXRob25kcy9UcmVlcy9oZWFwLmh0bWxcbiAqXG4gKiBUaGUgSGVhcCBjbGFzcyBpcyBhbiBhYnN0cmFjdGlvbiBvZiB0aGUgYmluYXJ5IGhlYXAuIEl0IGlzIGltcGxlbWVudGVkIHRvXG4gKiBnaXZlIG1ldGhvZHMgcmVsYXRlZCB0byBib3RoIG1pbiBhbmQgbWF4IGhlYXBzLlxuICpcbiAqIEBhdXRob3I6IFJlbmF1ZCBWaW5jZW50IGh0dHBzOi8vZ2l0aHViLmNvbS9yZW5hdWRmdlxuICoqL1xuY2xhc3MgSGVhcCB7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jdXJyZW50U2l6ZSA9IDA7XG5cdFx0dGhpcy5oZWFwTGlzdCA9IFtdO1xuXHR9XG5cblx0Ly8gQWJzdHJhY3QgbWV0aG9kIHdoaWNoIGJyaW5ncyBlbGVtZW50cyB1cCB0aGUgdHJlZSBmcm9tIHRoZSBpIGluZGV4LlxuXHRfX3BlcmNVcChpKSB7fVxuXG5cdC8vIEFic3RyYWN0IG1ldGhvZCB3aGljaCBicmluZ3MgZWxlbWVudHMgZG93biB0aGUgdHJlZSBmcm9tIHRoZSBpIGluZGV4LlxuXHRfX3BlcmNEb3duKGkpIHt9XG5cblx0Ly8gUmVtb3ZlcyBhbiBvYmplY3QgZnJvbSB0aGUgaGVhcCwgaXRlbSBiZWluZyByZWZlcmluZyB0byB0aGUgbmVzdGVkIG9iamVjdFxuXHRyZW1vdmUoaXRlbSkge31cblxuXHQvLyBCdWlsZCB0aGUgaGVhcCBmcm9tIGFuIG9iamVjdCBsaXN0IGFuZCBzdHJ1Y3R1cmUgaXRcblx0YnVpbGRIZWFwKGxpc3QpIHt9XG5cblx0Ly8gQ2xlYXIgdGhlIGxpc3QgYnkgcmVwbGFjaW5nIGl0IHdpdGggdGhlIGFwcHJvcHJpYXRlIHN3YXAgb2JqZWN0XG5cdGVtcHR5KCkge31cblxuXHQvKipcblx0ICogU3RhdGljIG1ldGhvZCB1c2VkIHRvIGdldCBhIHNwZWNpZmljIGluZGV4IGRvd24gdGhlIHRyZWVcblx0ICogZm9yIHN3YXAvcGVyYyBwdXJwb3NlcyBpbiB0aGUgcGVyYyBkb3duIG1ldGhvZFxuXHQgKi9cblx0X19jaGlsZFBvc2l0aW9uKGkpIHtcblx0XHRpZiAoKGkgKiAyICsgMSA+IHRoaXMuY3VycmVudFNpemUpIHx8XG5cdFx0XHQodGhpcy5oZWFwTGlzdFtpICogMl0uaGVhcFZhbHVlIDwgwqB0aGlzLmhlYXBMaXN0W2kgKiAyICsgMV0uaGVhcFZhbHVlKSkge1xuXHRcdFx0cmV0dXJuIGkgKiAyO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gaSAqIDIgKyAxO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBJbnNlcnQgYSB2YWx1ZSB3aXRoIGFuIGFzc29jaWF0ZWQgb2JqZWN0IGluIHRoZSBoZWFwIHRyZWUuIFRoZSBwZXJjIHVwXG5cdCAqIG1ldGhvZCBpbXBsZW1lbnRhdGlvbiBzaG91bGQgaGFuZGxlIHdoYXQgdG8gZG8gd2l0aCB0aGUgaGVhcFZhbHVlIChlZyBtaW5cblx0ICogb3IgbWF4IHNvcnRpbmcpLlxuXHQgKlxuXHQgKiBAcGFyYW1zIHZhbHVlIGJlaW5nIHRoZSBoZWFwVmFsdWUgdXNlZCBmb3Igc29ydGluZyBhbmQgYW55IG9iamVjdFxuXHQgKi9cblx0aW5zZXJ0KHZhbHVlLCBvYmplY3QpIHtcblx0XHR0aGlzLmhlYXBMaXN0LnB1c2goe1xuXHRcdFx0J29iamVjdCc6IG9iamVjdCxcblx0XHRcdCdoZWFwVmFsdWUnOiB2YWx1ZVxuXHRcdH0pO1xuXHRcdHRoaXMuY3VycmVudFNpemUrKztcblx0XHR0aGlzLl9fcGVyY1VwKHRoaXMuY3VycmVudFNpemUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZpbmQgdGhlIG9iamVjdCByZWZlcmVuY2UgaW4gdGhlIGhlYXAgbGlzdCBhbmQgdXBkYXRlIGl0cyBoZWFwVmFsdWUuXG5cdCAqIFRoZSB0cmVlIHNob3VsZCB0aGUgYmUgc29ydGVkIHVzaW5nIHBlcmMgdXAgdG8gYnJpbmcgdGhlIG5leHQgZGVzaXJlZCB2YWx1ZVxuXHQgKiBhcyB0aGUgaGVhZC5cblx0ICovXG5cdHVwZGF0ZShvYmplY3QsIHZhbHVlKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPD0gdGhpcy5jdXJyZW50U2l6ZTsgaSsrKSB7XG5cdFx0XHRpZiAob2JqZWN0ID09PSB0aGlzLmhlYXBMaXN0W2ldLm9iamVjdCkge1xuXHRcdFx0XHR0aGlzLmhlYXBMaXN0W2ldLmhlYXBWYWx1ZSA9IHZhbHVlO1xuXHRcdFx0XHR0aGlzLl9fcGVyY1VwKHRoaXMuY3VycmVudFNpemUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdXNlZCB0byBnZXQgdGhlIGhlYWQgKG1pbmltYWwpIG9mIGhlYXAgbGlzdC4gUHV0cyBpdCBhdCB0aGUgZW5kIG9mXG5cdCAqIHRoZSBsaXN0IGFuZCB0YWtlcyBpdCBvdXQgd2l0aCBwb3AuIEFzc3VyZXMgdGhhdCB0aGUgdHJlZSBpcyByZXN0b3JlZC5cblx0ICovXG5cdGRlbGV0ZUhlYWQoKSB7XG5cdFx0dmFyIHJlZmVyZW5jZVZhbHVlID0gdGhpcy5oZWFwTGlzdFsxXTsgLy8gcG9zIDAgYmVpbmcgdXNlZCBmb3IgcGVyY29sYXRpbmdcblx0XHR0aGlzLmhlYXBMaXN0WzFdID0gdGhpcy5oZWFwTGlzdFt0aGlzLmN1cnJlbnRTaXplXTsgLy8gZmlyc3QgaXRlbSBpcyBsYXN0XG5cdFx0dGhpcy5jdXJyZW50U2l6ZS0tO1xuXHRcdHRoaXMuaGVhcExpc3QucG9wKCk7XG5cdFx0dGhpcy5fX3BlcmNEb3duKDEpOyAvLyBmcm9tIGZpcnN0IGl0ZW0sIHJlc3RvcmUgdHJlZVxuXHRcdHJldHVybiByZWZlcmVuY2VWYWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIG9iamVjdCByZWZlcmVuY2Ugb2YgaGVhZCB3aXRob3V0IHJlbW92aW5nIGl0LlxuXHQgKi9cblx0aGVhZE9iamVjdCgpIHtcblx0XHRyZXR1cm4gdGhpcy5oZWFwTGlzdFsxXS5vYmplY3Q7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB2YWx1ZSByZWZlcmVuY2Ugb2YgaGVhZCB3aXRob3V0IHJlbW92aW5nIGl0LlxuXHQgKi9cblx0aGVhZFZhbHVlKCkge1xuXHRcdHJldHVybiB0aGlzLmhlYXBMaXN0WzFdLmhlYXBWYWx1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMaXN0IGFjY2Vzc29yXG5cdCAqL1xuXHRsaXN0KCkge1xuXHRcdHJldHVybiB0aGlzLmhlYXBMaXN0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEN1cnJlbnQgc2l6ZSBhY2Nlc3NvclxuXHQgKi9cblx0c2l6ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5jdXJyZW50U2l6ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBoZWFwIGlzIGVtcHR5LlxuXHQgKi9cblx0aXNFbXB0eSgpIHtcblx0XHRyZXR1cm4gdGhpcy5jdXJyZW50U2l6ZSA9PT0gMDtcblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGVhcDsiXX0=