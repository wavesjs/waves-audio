"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var MinHeap = require("./min-heap");
var MaxHeap = require("./max-heap");
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert Schnell <Norbert.Schnell@ircam.fr>
 *
 * First rather stupid implementation to be optimized...
 */

var PriorityQueue = (function () {
	function PriorityQueue() {
		_classCallCheck(this, PriorityQueue);

		this.__heap = new MinHeap();
		this.__reverse = false;
	}

	_createClass(PriorityQueue, {
		insert: {

			/**
    * Insert an object to the queue
    * (for this primitive version: prevent sorting for each element by calling
    * with "false" as third argument)
    */

			value: function insert(object, time) {
				if (time !== Infinity && time !== -Infinity) {
					// add new object
					this.__heap.insert(time, object);

					return this.__heap.headValue(); // return time of first object
				}

				return Infinity; //  **** Make sure its not another time you'd want
			}
		},
		move: {

			/**
    * Move an object to another time in the queue
    */

			value: function move(object, time) {
				if (time !== Infinity && time != -Infinity) {

					if (this.__heap.isEmpty()) this.__heap.insert(time, object); // add new object
					else {
						this.__heap.update(object, time);
					}

					return this.__heap.headValue();
				}

				return this.__heap.remove(object);
			}
		},
		remove: {

			/**
    * Remove an object from the queue
    */

			value: function remove(item) {
				return this.__heap.remove(item);
			}
		},
		clear: {

			/**
    * Clear queue
    */

			value: function clear() {
				this.__heap.empty();
				return Infinity;
			}
		},
		head: {

			/**
    * Get first object in queue
    */

			get: function () {
				if (!this.__heap.isEmpty()) return this.__heap.headObject();

				return null;
			}
		},
		time: {

			/**
    * Get time of first object in queue
    */

			get: function () {
				if (!this.__heap.isEmpty()) return this.__heap.headValue();

				return Infinity;
			}
		},
		reverse: {
			get: function () {
				return this.__reverse;
			},
			set: function (value) {
				if (value !== this.__reverse) {
					var heapList = this.__heap.list();
					heapList.shift(); // remove swap value (first elem in array)

					if (value) this.__heap = new MaxHeap();else this.__heap = new MinHeap();

					this.__heap.buildHeap(heapList);
					this.__reverse = value;
				}
			}
		}
	});

	return PriorityQueue;
})();

module.exports = PriorityQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDOzs7Ozs7Ozs7SUFTOUIsYUFBYTtBQUVQLFVBRk4sYUFBYSxHQUVKO3dCQUZULGFBQWE7O0FBR2pCLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUM1QixNQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztFQUN2Qjs7Y0FMSSxhQUFhO0FBWWxCLFFBQU07Ozs7Ozs7O1VBQUEsZ0JBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUNwQixRQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFOztBQUU1QyxTQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWpDLFlBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztLQUMvQjs7QUFFRCxXQUFPLFFBQVEsQ0FBQztJQUNoQjs7QUFLRCxNQUFJOzs7Ozs7VUFBQSxjQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDbEIsUUFBSSxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTs7QUFFM0MsU0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7VUFDN0I7QUFDSixVQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7TUFDakM7O0FBRUQsWUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQy9COztBQUVELFdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbEM7O0FBS0QsUUFBTTs7Ozs7O1VBQUEsZ0JBQUMsSUFBSSxFQUFFO0FBQ1osV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQzs7QUFLRCxPQUFLOzs7Ozs7VUFBQSxpQkFBRztBQUNQLFFBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEIsV0FBTyxRQUFRLENBQUM7SUFDaEI7O0FBS0csTUFBSTs7Ozs7O1FBQUEsWUFBRztBQUNWLFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7O0FBRWpDLFdBQU8sSUFBSSxDQUFDO0lBQ1o7O0FBS0csTUFBSTs7Ozs7O1FBQUEsWUFBRztBQUNWLFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRWhDLFdBQU8sUUFBUSxDQUFDO0lBQ2hCOztBQU1HLFNBQU87UUFKQSxZQUFHO0FBQ2IsV0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3RCO1FBRVUsVUFBQyxLQUFLLEVBQUU7QUFDbEIsUUFBSSxLQUFLLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUM3QixTQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2xDLGFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFakIsU0FBSSxLQUFLLEVBQ1IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDLEtBRTVCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQzs7QUFFN0IsU0FBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDaEMsU0FBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7S0FDdkI7SUFDRDs7OztRQTdGSSxhQUFhOzs7QUFnR25CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6ImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBNaW5IZWFwID0gcmVxdWlyZSgnLi9taW4taGVhcCcpO1xudmFyIE1heEhlYXAgPSByZXF1aXJlKCcuL21heC1oZWFwJyk7XG4vKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gcHJpb3JpdHkgcXVldWUgdXNlZCBieSBzY2hlZHVsZXIgYW5kIHRyYW5zcG9ydHNcbiAqIEBhdXRob3IgTm9yYmVydCBTY2huZWxsIDxOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnI+XG4gKlxuICogRmlyc3QgcmF0aGVyIHN0dXBpZCBpbXBsZW1lbnRhdGlvbiB0byBiZSBvcHRpbWl6ZWQuLi5cbiAqL1xuXG5jbGFzcyBQcmlvcml0eVF1ZXVlIHtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLl9faGVhcCA9IG5ldyBNaW5IZWFwKCk7XG5cdFx0dGhpcy5fX3JldmVyc2UgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbnNlcnQgYW4gb2JqZWN0IHRvIHRoZSBxdWV1ZVxuXHQgKiAoZm9yIHRoaXMgcHJpbWl0aXZlIHZlcnNpb246IHByZXZlbnQgc29ydGluZyBmb3IgZWFjaCBlbGVtZW50IGJ5IGNhbGxpbmdcblx0ICogd2l0aCBcImZhbHNlXCIgYXMgdGhpcmQgYXJndW1lbnQpXG5cdCAqL1xuXHRpbnNlcnQob2JqZWN0LCB0aW1lKSB7XG5cdFx0aWYgKHRpbWUgIT09IEluZmluaXR5ICYmIHRpbWUgIT09IC1JbmZpbml0eSkge1xuXHRcdFx0Ly8gYWRkIG5ldyBvYmplY3Rcblx0XHRcdHRoaXMuX19oZWFwLmluc2VydCh0aW1lLCBvYmplY3QpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcy5fX2hlYXAuaGVhZFZhbHVlKCk7IC8vIHJldHVybiB0aW1lIG9mIGZpcnN0IG9iamVjdFxuXHRcdH1cblxuXHRcdHJldHVybiBJbmZpbml0eTsgLy8gICoqKiogTWFrZSBzdXJlIGl0cyBub3QgYW5vdGhlciB0aW1lIHlvdSdkIHdhbnRcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3ZlIGFuIG9iamVjdCB0byBhbm90aGVyIHRpbWUgaW4gdGhlIHF1ZXVlXG5cdCAqL1xuXHRtb3ZlKG9iamVjdCwgdGltZSkge1xuXHRcdGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuXG5cdFx0XHRpZiAodGhpcy5fX2hlYXAuaXNFbXB0eSgpKVxuXHRcdFx0XHR0aGlzLl9faGVhcC5pbnNlcnQodGltZSwgb2JqZWN0KTsgLy8gYWRkIG5ldyBvYmplY3Rcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR0aGlzLl9faGVhcC51cGRhdGUob2JqZWN0LCB0aW1lKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHRoaXMuX19oZWFwLmhlYWRWYWx1ZSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9faGVhcC5yZW1vdmUob2JqZWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYW4gb2JqZWN0IGZyb20gdGhlIHF1ZXVlXG5cdCAqL1xuXHRyZW1vdmUoaXRlbSkge1xuXHRcdHJldHVybiB0aGlzLl9faGVhcC5yZW1vdmUoaXRlbSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXIgcXVldWVcblx0ICovXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuX19oZWFwLmVtcHR5KCk7XG5cdFx0cmV0dXJuIEluZmluaXR5O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBmaXJzdCBvYmplY3QgaW4gcXVldWVcblx0ICovXG5cdGdldCBoZWFkKCkge1xuXHRcdGlmICghdGhpcy5fX2hlYXAuaXNFbXB0eSgpKVxuXHRcdFx0cmV0dXJuIHRoaXMuX19oZWFwLmhlYWRPYmplY3QoKTtcblxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aW1lIG9mIGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuXHQgKi9cblx0Z2V0IHRpbWUoKSB7XG5cdFx0aWYgKCF0aGlzLl9faGVhcC5pc0VtcHR5KCkpXG5cdFx0XHRyZXR1cm4gdGhpcy5fX2hlYXAuaGVhZFZhbHVlKCk7XG5cblx0XHRyZXR1cm4gSW5maW5pdHk7XG5cdH1cblxuXHRnZXQgcmV2ZXJzZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fX3JldmVyc2U7XG5cdH1cblxuXHRzZXQgcmV2ZXJzZSh2YWx1ZSkge1xuXHRcdGlmICh2YWx1ZSAhPT0gdGhpcy5fX3JldmVyc2UpIHtcblx0XHRcdHZhciBoZWFwTGlzdCA9IHRoaXMuX19oZWFwLmxpc3QoKTtcblx0XHRcdGhlYXBMaXN0LnNoaWZ0KCk7IC8vIHJlbW92ZSBzd2FwIHZhbHVlIChmaXJzdCBlbGVtIGluIGFycmF5KVxuXG5cdFx0XHRpZiAodmFsdWUpXG5cdFx0XHRcdHRoaXMuX19oZWFwID0gbmV3IE1heEhlYXAoKTtcblx0XHRcdGVsc2Vcblx0XHRcdFx0dGhpcy5fX2hlYXAgPSBuZXcgTWluSGVhcCgpO1xuXG5cdFx0XHR0aGlzLl9faGVhcC5idWlsZEhlYXAoaGVhcExpc3QpO1xuXHRcdFx0dGhpcy5fX3JldmVyc2UgPSB2YWx1ZTtcblx0XHR9XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmlvcml0eVF1ZXVlOyJdfQ==