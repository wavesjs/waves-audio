"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var Heap = require("./heap");
/**
 * ES6 Implementation of a maximum binary heap based on :
 * http://interactivepython.org/courselib/static/pythonds/Trees/heap.html
 *
 * The head (or position 1 in the array) should be the object with maximal heap
 * value.
 *
 * @author: Renaud Vincent https://github.com/renaudfv
 **/

var MaxHeap = (function (_Heap) {
	function MaxHeap() {
		_classCallCheck(this, MaxHeap);

		_get(_core.Object.getPrototypeOf(MaxHeap.prototype), "constructor", this).call(this);
		// Empty object with maximal value used for swaping on the first insertions
		this.heapList = [{
			object: {},
			heapValue: Infinity
		}];
	}

	_inherits(MaxHeap, _Heap);

	_createClass(MaxHeap, {
		__percUp: {

			/**
    * Method used to maintain the max heap property from a certain index. It is
    * used locally from the end of the heap list upon insertion, update and
    * removal. It percolates max values up the binary tree.
    */

			value: function __percUp(i) {
				var ceiledIndex, tmp;

				while (Math.floor(i / 2) > 0) {
					ceiledIndex = Math.floor(i / 2);
					// Is the item at i greater than the one at ceiled index
					if (this.heapList[i].heapValue > this.heapList[ceiledIndex].heapValue) {
						tmp = this.heapList[ceiledIndex];
						this.heapList[ceiledIndex] = this.heapList[i];
						this.heapList[i] = tmp;
					}

					i = ceiledIndex;
				}
			}
		},
		__percDown: {

			/**
    * Method used to maintain the min heap property from a certain index. It is
    * used locally from the start of the heap list upon deletion. Items are 
    * swaped down the tree if they have a smaller reference value.
    */

			value: function __percDown(i) {
				var refPos, tmp;

				while (i * 2 <= this.currentSize) {
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
		},
		remove: {

			/**
    * Finds the item object reference in the heap list brings it up the tree by
    * having an infinity value. The tree is the sorted and the head is removed.
    */

			value: function remove(item) {
				for (var i = 0; i <= this.currentSize; i++) {
					if (item === this.heapList[i].object) {
						this.heapList[i].heapValue = Infinity;
						this.__percUp(this.currentSize);
						this.deleteHead();
					}
				}

				return Infinity;
			}
		},
		buildHeap: {

			/**
    * Build heap from an object list and structure it with a maximal swap 
    * reference
    */

			value: function buildHeap(list) {
				this.currentSize = list.length;
				this.heapList = [{
					object: {},
					heapValue: Infinity
				}].concat(list);

				var i = list.length;
				while (i > 0) {
					this.__percUp(i);
					i--;
				}
			}
		},
		empty: {

			/**
   * Clear the list with a maximal heapValue swap reference
   */

			value: function empty() {
				this.heapList = [{
					object: {},
					heapValue: Infinity
				}];
				this.currentSize = 0;
			}
		}
	});

	return MaxHeap;
})(Heap);

module.exports = MaxHeap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7Ozs7Ozs7O0lBVXZCLE9BQU87QUFFRCxVQUZOLE9BQU8sR0FFRTt3QkFGVCxPQUFPOztBQUdYLG1DQUhJLE9BQU8sNkNBR0g7O0FBRVIsTUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQ2hCLFdBQVUsRUFBRTtBQUNaLGNBQWEsUUFBUTtHQUNyQixDQUFDLENBQUM7RUFDSDs7V0FUSSxPQUFPOztjQUFQLE9BQU87QUFnQlosVUFBUTs7Ozs7Ozs7VUFBQSxrQkFBQyxDQUFDLEVBQUU7QUFDWCxRQUFJLFdBQVcsRUFBRSxHQUFHLENBQUM7O0FBRXJCLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzdCLGdCQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWhDLFNBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDdkUsU0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlDLFVBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO01BQ3ZCOztBQUVELE1BQUMsR0FBRyxXQUFXLENBQUM7S0FDaEI7SUFDRDs7QUFPRCxZQUFVOzs7Ozs7OztVQUFBLG9CQUFDLENBQUMsRUFBRTtBQUNiLFFBQUksTUFBTSxFQUFFLEdBQUcsQ0FBQzs7QUFFaEIsV0FBTyxBQUFDLENBQUMsR0FBRyxDQUFDLElBQUssSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNuQyxXQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakMsU0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNqRSxTQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QixVQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDekMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUM7TUFDNUI7O0FBRUQsTUFBQyxHQUFHLE1BQU0sQ0FBQztLQUNYO0lBQ0Q7O0FBTUQsUUFBTTs7Ozs7OztVQUFBLGdCQUFDLElBQUksRUFBRTtBQUNaLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNDLFNBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ3JDLFVBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUN0QyxVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7TUFDbEI7S0FDRDs7QUFFRCxXQUFPLFFBQVEsQ0FBQztJQUNoQjs7QUFNRCxXQUFTOzs7Ozs7O1VBQUEsbUJBQUMsSUFBSSxFQUFFO0FBQ2YsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQztBQUNoQixhQUFVLEVBQUU7QUFDWixnQkFBYSxRQUFRO0tBQ3JCLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWhCLFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDcEIsV0FBTyxDQUFDLEdBQUssQ0FBQyxFQUFFO0FBQ2YsU0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixNQUFDLEVBQUUsQ0FBQztLQUNKO0lBQ0Q7O0FBS0QsT0FBSzs7Ozs7O1VBQUEsaUJBQUc7QUFDUCxRQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7QUFDaEIsYUFBVSxFQUFFO0FBQ1osZ0JBQWEsUUFBUTtLQUNyQixDQUFDLENBQUM7QUFDSCxRQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztJQUNyQjs7OztRQWhHSSxPQUFPO0dBQVMsSUFBSTs7QUFvRzFCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwiZmlsZSI6ImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBIZWFwID0gcmVxdWlyZSgnLi9oZWFwJyk7XG4vKipcbiAqIEVTNiBJbXBsZW1lbnRhdGlvbiBvZiBhIG1heGltdW0gYmluYXJ5IGhlYXAgYmFzZWQgb24gOlxuICogaHR0cDovL2ludGVyYWN0aXZlcHl0aG9uLm9yZy9jb3Vyc2VsaWIvc3RhdGljL3B5dGhvbmRzL1RyZWVzL2hlYXAuaHRtbFxuICpcbiAqIFRoZSBoZWFkIChvciBwb3NpdGlvbiAxIGluIHRoZSBhcnJheSkgc2hvdWxkIGJlIHRoZSBvYmplY3Qgd2l0aCBtYXhpbWFsIGhlYXBcbiAqIHZhbHVlLlxuICpcbiAqIEBhdXRob3I6IFJlbmF1ZCBWaW5jZW50IGh0dHBzOi8vZ2l0aHViLmNvbS9yZW5hdWRmdlxuICoqL1xuY2xhc3MgTWF4SGVhcCBleHRlbmRzIEhlYXAge1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0Ly8gRW1wdHkgb2JqZWN0IHdpdGggbWF4aW1hbCB2YWx1ZSB1c2VkIGZvciBzd2FwaW5nIG9uIHRoZSBmaXJzdCBpbnNlcnRpb25zXG5cdFx0dGhpcy5oZWFwTGlzdCA9IFt7XG5cdFx0XHQnb2JqZWN0Jzoge30sXG5cdFx0XHQnaGVhcFZhbHVlJzogSW5maW5pdHlcblx0XHR9XTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdXNlZCB0byBtYWludGFpbiB0aGUgbWF4IGhlYXAgcHJvcGVydHkgZnJvbSBhIGNlcnRhaW4gaW5kZXguIEl0IGlzXG5cdCAqIHVzZWQgbG9jYWxseSBmcm9tIHRoZSBlbmQgb2YgdGhlIGhlYXAgbGlzdCB1cG9uIGluc2VydGlvbiwgdXBkYXRlIGFuZFxuXHQgKiByZW1vdmFsLiBJdCBwZXJjb2xhdGVzIG1heCB2YWx1ZXMgdXAgdGhlIGJpbmFyeSB0cmVlLlxuXHQgKi9cblx0X19wZXJjVXAoaSkge1xuXHRcdHZhciBjZWlsZWRJbmRleCwgdG1wO1xuXG5cdFx0d2hpbGUgKE1hdGguZmxvb3IoaSAvIDIpID4gMCkge1xuXHRcdFx0Y2VpbGVkSW5kZXggPSBNYXRoLmZsb29yKGkgLyAyKTtcblx0XHRcdC8vIElzIHRoZSBpdGVtIGF0IGkgZ3JlYXRlciB0aGFuIHRoZSBvbmUgYXQgY2VpbGVkIGluZGV4XG5cdFx0XHRpZiAodGhpcy5oZWFwTGlzdFtpXS5oZWFwVmFsdWUgPiDCoHRoaXMuaGVhcExpc3RbY2VpbGVkSW5kZXhdLmhlYXBWYWx1ZSkge1xuXHRcdFx0XHR0bXAgPSB0aGlzLmhlYXBMaXN0W2NlaWxlZEluZGV4XTtcblx0XHRcdFx0dGhpcy5oZWFwTGlzdFtjZWlsZWRJbmRleF0gPSB0aGlzLmhlYXBMaXN0W2ldO1xuXHRcdFx0XHR0aGlzLmhlYXBMaXN0W2ldID0gdG1wO1xuXHRcdFx0fVxuXG5cdFx0XHRpID0gY2VpbGVkSW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB1c2VkIHRvIG1haW50YWluIHRoZSBtaW4gaGVhcCBwcm9wZXJ0eSBmcm9tIGEgY2VydGFpbiBpbmRleC4gSXQgaXNcblx0ICogdXNlZCBsb2NhbGx5IGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBoZWFwIGxpc3QgdXBvbiBkZWxldGlvbi4gSXRlbXMgYXJlIFxuXHQgKiBzd2FwZWQgZG93biB0aGUgdHJlZSBpZiB0aGV5IGhhdmUgYSBzbWFsbGVyIHJlZmVyZW5jZSB2YWx1ZS5cblx0ICovXG5cdF9fcGVyY0Rvd24oaSkge1xuXHRcdHZhciByZWZQb3MsIHRtcDtcblxuXHRcdHdoaWxlICgoaSAqIDIpIDw9IHRoaXMuY3VycmVudFNpemUpIHtcblx0XHRcdHJlZlBvcyA9IHRoaXMuX19jaGlsZFBvc2l0aW9uKGkpO1xuXHRcdFx0Ly8gSXMgdGhlIGl0ZW0gYXQgaSBzbWFsbGVyIHRoYW4gdGhlIHJlZmVyZW5jZSBkb3duIHRoZSB0cmVlXG5cdFx0XHRpZiAodGhpcy5oZWFwTGlzdFtpXS5oZWFwVmFsdWUgPCB0aGlzLmhlYXBMaXN0W3JlZlBvc10uaGVhcFZhbHVlKSB7XG5cdFx0XHRcdHRtcCA9IHRoaXMuaGVhcExpc3RbaV07XG5cdFx0XHRcdHRoaXMuaGVhcExpc3RbaV0gPSB0aGlzLmhlYXBMaXN0W3JlZlBvc107XG5cdFx0XHRcdHRoaXMuaGVhcExpc3RbcmVmUG9zXSA9IHRtcDtcblx0XHRcdH1cblxuXHRcdFx0aSA9IHJlZlBvcztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgdGhlIGl0ZW0gb2JqZWN0IHJlZmVyZW5jZSBpbiB0aGUgaGVhcCBsaXN0IGJyaW5ncyBpdCB1cCB0aGUgdHJlZSBieVxuXHQgKiBoYXZpbmcgYW4gaW5maW5pdHkgdmFsdWUuIFRoZSB0cmVlIGlzIHRoZSBzb3J0ZWQgYW5kIHRoZSBoZWFkIGlzIHJlbW92ZWQuXG5cdCAqL1xuXHRyZW1vdmUoaXRlbSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNpemU7IGkrKykge1xuXHRcdFx0aWYgKGl0ZW0gPT09IHRoaXMuaGVhcExpc3RbaV0ub2JqZWN0KSB7XG5cdFx0XHRcdHRoaXMuaGVhcExpc3RbaV0uaGVhcFZhbHVlID0gSW5maW5pdHk7XG5cdFx0XHRcdHRoaXMuX19wZXJjVXAodGhpcy5jdXJyZW50U2l6ZSk7XG5cdFx0XHRcdHRoaXMuZGVsZXRlSGVhZCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBJbmZpbml0eTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZCBoZWFwIGZyb20gYW4gb2JqZWN0IGxpc3QgYW5kIHN0cnVjdHVyZSBpdCB3aXRoIGEgbWF4aW1hbCBzd2FwIFxuXHQgKiByZWZlcmVuY2Vcblx0ICovXG5cdGJ1aWxkSGVhcChsaXN0KSB7XG5cdFx0dGhpcy5jdXJyZW50U2l6ZSA9IGxpc3QubGVuZ3RoO1xuXHRcdHRoaXMuaGVhcExpc3QgPSBbe1xuXHRcdFx0J29iamVjdCc6IHt9LFxuXHRcdFx0J2hlYXBWYWx1ZSc6IEluZmluaXR5XG5cdFx0fV0uY29uY2F0KGxpc3QpO1xuXG5cdFx0dmFyIGkgPSBsaXN0Lmxlbmd0aDtcblx0XHR3aGlsZSAoacKgID4gwqAwKSB7XG5cdFx0XHR0aGlzLl9fcGVyY1VwKGkpO1xuXHRcdFx0aS0tO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQqIENsZWFyIHRoZSBsaXN0IHdpdGggYSBtYXhpbWFsIGhlYXBWYWx1ZSBzd2FwIHJlZmVyZW5jZVxuXHQqL1xuXHRlbXB0eSgpIHtcblx0XHR0aGlzLmhlYXBMaXN0ID0gW3tcblx0XHRcdCdvYmplY3QnOiB7fSxcblx0XHRcdCdoZWFwVmFsdWUnOiBJbmZpbml0eSBcblx0XHR9XTtcblx0XHR0aGlzLmN1cnJlbnRTaXplID0gMDtcblx0fVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWF4SGVhcDsiXX0=