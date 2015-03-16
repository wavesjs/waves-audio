"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var Heap = require("./heap");
/**
 * ES6 Implementation of a minimum binary heap based on :
 * http://interactivepython.org/courselib/static/pythonds/Trees/heap.html
 *
 * The head (or position 1 in the array) should be the object with minimal heap
 * value.
 *
 * @author: Renaud Vincent https://github.com/renaudfv
 **/

var MinHeap = (function (_Heap) {
	function MinHeap() {
		_classCallCheck(this, MinHeap);

		_get(_core.Object.getPrototypeOf(MinHeap.prototype), "constructor", this).call(this);
		// Empty object with minimal value used for swaping on the first insertions
		this.heapList = [{
			object: {},
			heapValue: 0
		}];
	}

	_inherits(MinHeap, _Heap);

	_createClass(MinHeap, {
		__percUp: {

			/**
    * Method used to maintain the min heap property from a certain index. It is
    * used locally from the end of the heap list upon insertion, update and
    * removal. It percolates min values up the binary tree.
    */

			value: function __percUp(i) {
				var ceiledIndex, tmp;

				while (Math.floor(i / 2) > 0) {
					ceiledIndex = Math.floor(i / 2);
					// Is the item at i smaller than the one at ceiled index
					if (this.heapList[i].heapValue < this.heapList[ceiledIndex].heapValue) {
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
    * swaped down the tree if they have a bigger reference value.
    */

			value: function __percDown(i) {
				var refPos, tmp;

				while (i * 2 <= this.currentSize) {
					refPos = this.__childPosition(i);
					// Is the item at i greater than the reference down the tree
					if (this.heapList[i].heapValue > this.heapList[refPos].heapValue) {
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
    * having a -infinity value. The tree is the sorted and the head is removed.
    */

			value: function remove(item) {
				for (var i = 0; i <= this.currentSize; i++) {
					if (item === this.heapList[i].object) {
						this.heapList[i].heapValue = -Infinity;
						this.__percUp(this.currentSize);
						this.deleteHead(); // *** Should the value be returned?
					}
				}

				return Infinity;
			}
		},
		buildHeap: {

			/**
    * Build heap from an object list and structure it with a minimal swap 
    * reference
    */

			value: function buildHeap(list) {
				this.currentSize = list.length;
				this.heapList = [{
					object: {},
					heapValue: 0
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
   * Clear the list with a minimal heapValue swap reference
   */

			value: function empty() {
				this.heapList = [{
					object: {},
					heapValue: 0
				}];
				this.currentSize = 0;
			}
		}
	});

	return MinHeap;
})(Heap);

module.exports = MinHeap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7Ozs7Ozs7O0lBVXZCLE9BQU87QUFFRCxVQUZOLE9BQU8sR0FFRTt3QkFGVCxPQUFPOztBQUdYLG1DQUhJLE9BQU8sNkNBR0g7O0FBRVIsTUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDO0FBQ2hCLFdBQVUsRUFBRTtBQUNaLGNBQWEsQ0FBQztHQUNkLENBQUMsQ0FBQztFQUNIOztXQVRJLE9BQU87O2NBQVAsT0FBTztBQWdCWixVQUFROzs7Ozs7OztVQUFBLGtCQUFDLENBQUMsRUFBRTtBQUNYLFFBQUksV0FBVyxFQUFFLEdBQUcsQ0FBQzs7QUFFckIsV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDN0IsZ0JBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFaEMsU0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUN2RSxTQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNqQyxVQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7TUFDdkI7O0FBRUQsTUFBQyxHQUFHLFdBQVcsQ0FBQztLQUNoQjtJQUNEOztBQU9ELFlBQVU7Ozs7Ozs7O1VBQUEsb0JBQUMsQ0FBQyxFQUFFO0FBQ2IsUUFBSSxNQUFNLEVBQUUsR0FBRyxDQUFDOztBQUVoQixXQUFPLEFBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ25DLFdBQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqQyxTQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ2pFLFNBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN6QyxVQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQztNQUM1Qjs7QUFFRCxNQUFDLEdBQUcsTUFBTSxDQUFDO0tBQ1g7SUFDRDs7QUFNRCxRQUFNOzs7Ozs7O1VBQUEsZ0JBQUMsSUFBSSxFQUFFO0FBQ1osU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0MsU0FBSSxJQUFJLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDckMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFDdkMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDaEMsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO01BQ2xCO0tBQ0Q7O0FBRUQsV0FBTyxRQUFRLENBQUM7SUFDaEI7O0FBTUQsV0FBUzs7Ozs7OztVQUFBLG1CQUFDLElBQUksRUFBRTtBQUNmLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUMvQixRQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7QUFDaEIsYUFBVSxFQUFFO0FBQ1osZ0JBQWEsQ0FBQztLQUNkLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWhCLFFBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDcEIsV0FBTyxDQUFDLEdBQUssQ0FBQyxFQUFFO0FBQ2YsU0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqQixNQUFDLEVBQUUsQ0FBQztLQUNKO0lBQ0Q7O0FBS0QsT0FBSzs7Ozs7O1VBQUEsaUJBQUc7QUFDUCxRQUFJLENBQUMsUUFBUSxHQUFHLENBQUM7QUFDaEIsYUFBVSxFQUFFO0FBQ1osZ0JBQWEsQ0FBQztLQUNkLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCOzs7O1FBaEdJLE9BQU87R0FBUyxJQUFJOztBQW9HMUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIEhlYXAgPSByZXF1aXJlKCcuL2hlYXAnKTtcbi8qKlxuICogRVM2IEltcGxlbWVudGF0aW9uIG9mIGEgbWluaW11bSBiaW5hcnkgaGVhcCBiYXNlZCBvbiA6XG4gKiBodHRwOi8vaW50ZXJhY3RpdmVweXRob24ub3JnL2NvdXJzZWxpYi9zdGF0aWMvcHl0aG9uZHMvVHJlZXMvaGVhcC5odG1sXG4gKlxuICogVGhlIGhlYWQgKG9yIHBvc2l0aW9uIDEgaW4gdGhlIGFycmF5KSBzaG91bGQgYmUgdGhlIG9iamVjdCB3aXRoIG1pbmltYWwgaGVhcFxuICogdmFsdWUuXG4gKlxuICogQGF1dGhvcjogUmVuYXVkIFZpbmNlbnQgaHR0cHM6Ly9naXRodWIuY29tL3JlbmF1ZGZ2XG4gKiovXG5jbGFzcyBNaW5IZWFwIGV4dGVuZHMgSGVhcCB7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblx0XHQvLyBFbXB0eSBvYmplY3Qgd2l0aCBtaW5pbWFsIHZhbHVlIHVzZWQgZm9yIHN3YXBpbmcgb24gdGhlIGZpcnN0IGluc2VydGlvbnNcblx0XHR0aGlzLmhlYXBMaXN0ID0gW3tcblx0XHRcdCdvYmplY3QnOiB7fSxcblx0XHRcdCdoZWFwVmFsdWUnOiAwXG5cdFx0fV07XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHVzZWQgdG8gbWFpbnRhaW4gdGhlIG1pbiBoZWFwIHByb3BlcnR5IGZyb20gYSBjZXJ0YWluIGluZGV4LiBJdCBpc1xuXHQgKiB1c2VkIGxvY2FsbHkgZnJvbSB0aGUgZW5kIG9mIHRoZSBoZWFwIGxpc3QgdXBvbiBpbnNlcnRpb24sIHVwZGF0ZSBhbmRcblx0ICogcmVtb3ZhbC4gSXQgcGVyY29sYXRlcyBtaW4gdmFsdWVzIHVwIHRoZSBiaW5hcnkgdHJlZS5cblx0ICovXG5cdF9fcGVyY1VwKGkpIHtcblx0XHR2YXIgY2VpbGVkSW5kZXgsIHRtcDtcblxuXHRcdHdoaWxlIChNYXRoLmZsb29yKGkgLyAyKSA+IDApIHtcblx0XHRcdGNlaWxlZEluZGV4ID0gTWF0aC5mbG9vcihpIC8gMik7XG5cdFx0XHQvLyBJcyB0aGUgaXRlbSBhdCBpIHNtYWxsZXIgdGhhbiB0aGUgb25lIGF0IGNlaWxlZCBpbmRleFxuXHRcdFx0aWYgKHRoaXMuaGVhcExpc3RbaV0uaGVhcFZhbHVlIDwgwqB0aGlzLmhlYXBMaXN0W2NlaWxlZEluZGV4XS5oZWFwVmFsdWUpIHtcblx0XHRcdFx0dG1wID0gdGhpcy5oZWFwTGlzdFtjZWlsZWRJbmRleF07XG5cdFx0XHRcdHRoaXMuaGVhcExpc3RbY2VpbGVkSW5kZXhdID0gdGhpcy5oZWFwTGlzdFtpXTtcblx0XHRcdFx0dGhpcy5oZWFwTGlzdFtpXSA9IHRtcDtcblx0XHRcdH1cblxuXHRcdFx0aSA9IGNlaWxlZEluZGV4O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdXNlZCB0byBtYWludGFpbiB0aGUgbWluIGhlYXAgcHJvcGVydHkgZnJvbSBhIGNlcnRhaW4gaW5kZXguIEl0IGlzXG5cdCAqIHVzZWQgbG9jYWxseSBmcm9tIHRoZSBzdGFydCBvZiB0aGUgaGVhcCBsaXN0IHVwb24gZGVsZXRpb24uIEl0ZW1zIGFyZSBcblx0ICogc3dhcGVkIGRvd24gdGhlIHRyZWUgaWYgdGhleSBoYXZlIGEgYmlnZ2VyIHJlZmVyZW5jZSB2YWx1ZS5cblx0ICovXG5cdF9fcGVyY0Rvd24oaSkge1xuXHRcdHZhciByZWZQb3MsIHRtcDtcblxuXHRcdHdoaWxlICgoaSAqIDIpIDw9IHRoaXMuY3VycmVudFNpemUpIHtcblx0XHRcdHJlZlBvcyA9IHRoaXMuX19jaGlsZFBvc2l0aW9uKGkpO1xuXHRcdFx0Ly8gSXMgdGhlIGl0ZW0gYXQgaSBncmVhdGVyIHRoYW4gdGhlIHJlZmVyZW5jZSBkb3duIHRoZSB0cmVlXG5cdFx0XHRpZiAodGhpcy5oZWFwTGlzdFtpXS5oZWFwVmFsdWUgPiB0aGlzLmhlYXBMaXN0W3JlZlBvc10uaGVhcFZhbHVlKSB7XG5cdFx0XHRcdHRtcCA9IHRoaXMuaGVhcExpc3RbaV07XG5cdFx0XHRcdHRoaXMuaGVhcExpc3RbaV0gPSB0aGlzLmhlYXBMaXN0W3JlZlBvc107XG5cdFx0XHRcdHRoaXMuaGVhcExpc3RbcmVmUG9zXSA9IHRtcDtcblx0XHRcdH1cblxuXHRcdFx0aSA9IHJlZlBvcztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRmluZHMgdGhlIGl0ZW0gb2JqZWN0IHJlZmVyZW5jZSBpbiB0aGUgaGVhcCBsaXN0IGJyaW5ncyBpdCB1cCB0aGUgdHJlZSBieVxuXHQgKiBoYXZpbmcgYSAtaW5maW5pdHkgdmFsdWUuIFRoZSB0cmVlIGlzIHRoZSBzb3J0ZWQgYW5kIHRoZSBoZWFkIGlzIHJlbW92ZWQuXG5cdCAqL1xuXHRyZW1vdmUoaXRlbSkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDw9IHRoaXMuY3VycmVudFNpemU7IGkrKykge1xuXHRcdFx0aWYgKGl0ZW0gPT09IHRoaXMuaGVhcExpc3RbaV0ub2JqZWN0KSB7XG5cdFx0XHRcdHRoaXMuaGVhcExpc3RbaV0uaGVhcFZhbHVlID0gLUluZmluaXR5O1xuXHRcdFx0XHR0aGlzLl9fcGVyY1VwKHRoaXMuY3VycmVudFNpemUpO1xuXHRcdFx0XHR0aGlzLmRlbGV0ZUhlYWQoKTsgLy8gKioqIFNob3VsZCB0aGUgdmFsdWUgYmUgcmV0dXJuZWQ/XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEluZmluaXR5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkIGhlYXAgZnJvbSBhbiBvYmplY3QgbGlzdCBhbmQgc3RydWN0dXJlIGl0IHdpdGggYSBtaW5pbWFsIHN3YXAgXG5cdCAqIHJlZmVyZW5jZVxuXHQgKi9cblx0YnVpbGRIZWFwKGxpc3QpIHtcblx0XHR0aGlzLmN1cnJlbnRTaXplID0gbGlzdC5sZW5ndGg7XG5cdFx0dGhpcy5oZWFwTGlzdCA9IFt7XG5cdFx0XHQnb2JqZWN0Jzoge30sXG5cdFx0XHQnaGVhcFZhbHVlJzogMFxuXHRcdH1dLmNvbmNhdChsaXN0KTtcblxuXHRcdHZhciBpID0gbGlzdC5sZW5ndGg7XG5cdFx0d2hpbGUgKGnCoCA+IMKgMCkge1xuXHRcdFx0dGhpcy5fX3BlcmNVcChpKTtcblx0XHRcdGktLTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0KiBDbGVhciB0aGUgbGlzdCB3aXRoIGEgbWluaW1hbCBoZWFwVmFsdWUgc3dhcCByZWZlcmVuY2Vcblx0Ki9cblx0ZW1wdHkoKSB7XG5cdFx0dGhpcy5oZWFwTGlzdCA9IFt7XG5cdFx0XHQnb2JqZWN0Jzoge30sXG5cdFx0XHQnaGVhcFZhbHVlJzogMFxuXHRcdH1dO1xuXHRcdHRoaXMuY3VycmVudFNpemUgPSAwO1xuXHR9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNaW5IZWFwOyJdfQ==