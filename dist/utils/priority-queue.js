/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert Schnell <Norbert.Schnell@ircam.fr>
 *
 * First rather stupid implementation to be optimized...
 */

"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var PriorityQueue = (function () {
  function PriorityQueue() {
    _classCallCheck(this, PriorityQueue);

    this.__objects = [];
    this.reverse = false;
  }

  _createClass(PriorityQueue, {
    __objectIndex: {

      /**
       *  Get the index of an object in the object list
       */

      value: function __objectIndex(object) {
        for (var i = 0; i < this.__objects.length; i++) {
          if (object === this.__objects[i][0]) {
            return i;
          }
        }
        return -1;
      }
    },
    __removeObject: {

      /**
       * Withdraw an object from the object list
       */

      value: function __removeObject(object) {
        var index = this.__objectIndex(object);

        if (index >= 0) this.__objects.splice(index, 1);

        if (this.__objects.length > 0) {
          return this.__objects[0][1];
        } // return time of first object

        return Infinity;
      }
    },
    __sortObjects: {
      value: function __sortObjects() {
        if (!this.reverse) this.__objects.sort(function (a, b) {
          return a[1] - b[1];
        });else this.__objects.sort(function (a, b) {
          return b[1] - a[1];
        });
      }
    },
    insert: {

      /**
       * Insert an object to the queue
       * (for this primitive version: prevent sorting for each element by calling with "false" as third argument)
       */

      value: function insert(object, time) {
        var sort = arguments[2] === undefined ? true : arguments[2];

        if (time !== Infinity && time != -Infinity) {
          // add new object
          this.__objects.push([object, time]);

          if (sort) this.__sortObjects();

          return this.__objects[0][1]; // return time of first object
        }

        return this.__removeObject(object);
      }
    },
    move: {

      /**
       * Move an object to another time in the queue
       */

      value: function move(object, time) {
        if (time !== Infinity && time != -Infinity) {

          var index = this.__objectIndex(object);

          if (index < 0) this.__objects.push([object, time]); // add new object
          else this.__objects[index][1] = time; // update time of existing object

          this.__sortObjects();

          return this.__objects[0][1]; // return time of first object
        }

        return this.__removeObject(object);
      }
    },
    remove: {

      /**
       * Remove an object from the queue
       */

      value: function remove(object) {
        return this.__removeObject(object);
      }
    },
    clear: {

      /**
       * Clear queue
       */

      value: function clear() {
        this.__objects.length = 0; // clear object list
        return Infinity;
      }
    },
    head: {

      /**
       * Get first object in queue
       */

      get: function () {
        if (this.__objects.length > 0) return this.__objects[0][0];

        return null;
      }
    },
    time: {

      /**
       * Get time of first object in queue
       */

      get: function () {
        if (this.__objects.length > 0) return this.__objects[0][1];

        return Infinity;
      }
    }
  });

  return PriorityQueue;
})();

module.exports = PriorityQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQVFxQixhQUFhO0FBRXJCLFdBRlEsYUFBYSxHQUVsQjswQkFGSyxhQUFhOztBQUc5QixRQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztHQUN0Qjs7ZUFMa0IsYUFBYTtBQVVoQyxpQkFBYTs7Ozs7O2FBQUEsdUJBQUMsTUFBTSxFQUFFO0FBQ3BCLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5QyxjQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQ25DLG1CQUFPLENBQUMsQ0FBQztXQUNWO1NBQ0Y7QUFDRCxlQUFPLENBQUMsQ0FBQyxDQUFDO09BQ1g7O0FBS0Qsa0JBQWM7Ozs7OzthQUFBLHdCQUFDLE1BQU0sRUFBRTtBQUNyQixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV2QyxZQUFJLEtBQUssSUFBSSxDQUFDLEVBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVsQyxZQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7QUFDM0IsaUJBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFBOztBQUU5QixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7QUFFRCxpQkFBYTthQUFBLHlCQUFHO0FBQ2QsWUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFDLEtBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFDO09BQ047O0FBTUQsVUFBTTs7Ozs7OzthQUFBLGdCQUFDLE1BQU0sRUFBRSxJQUFJLEVBQWU7WUFBYixJQUFJLGdDQUFHLElBQUk7O0FBQzlCLFlBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7O0FBRTFDLGNBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBRXBDLGNBQUksSUFBSSxFQUNOLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFdkIsaUJBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3Qjs7QUFFRCxlQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDcEM7O0FBS0QsUUFBSTs7Ozs7O2FBQUEsY0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ2pCLFlBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7O0FBRTFDLGNBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXZDLGNBQUksS0FBSyxHQUFHLENBQUMsRUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2VBRXBDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUVsQyxjQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXJCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7O0FBRUQsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDOztBQUtELFVBQU07Ozs7OzthQUFBLGdCQUFDLE1BQU0sRUFBRTtBQUNiLGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNwQzs7QUFLRCxTQUFLOzs7Ozs7YUFBQSxpQkFBRztBQUNOLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMxQixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7QUFLRyxRQUFJOzs7Ozs7V0FBQSxZQUFHO0FBQ1QsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFLRyxRQUFJOzs7Ozs7V0FBQSxZQUFHO0FBQ1QsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsZUFBTyxRQUFRLENBQUM7T0FDakI7Ozs7U0FySGtCLGFBQWE7OztpQkFBYixhQUFhIiwiZmlsZSI6ImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBhdWRpbyBwcmlvcml0eSBxdWV1ZSB1c2VkIGJ5IHNjaGVkdWxlciBhbmQgdHJhbnNwb3J0c1xuICogQGF1dGhvciBOb3JiZXJ0IFNjaG5lbGwgPE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mcj5cbiAqXG4gKiBGaXJzdCByYXRoZXIgc3R1cGlkIGltcGxlbWVudGF0aW9uIHRvIGJlIG9wdGltaXplZC4uLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW9yaXR5UXVldWUge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX19vYmplY3RzID0gW107XG4gICAgdGhpcy5yZXZlcnNlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogIEdldCB0aGUgaW5kZXggb2YgYW4gb2JqZWN0IGluIHRoZSBvYmplY3QgbGlzdFxuICAgKi9cbiAgX19vYmplY3RJbmRleChvYmplY3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX19vYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAob2JqZWN0ID09PSB0aGlzLl9fb2JqZWN0c1tpXVswXSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpdGhkcmF3IGFuIG9iamVjdCBmcm9tIHRoZSBvYmplY3QgbGlzdFxuICAgKi9cbiAgX19yZW1vdmVPYmplY3Qob2JqZWN0KSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX29iamVjdEluZGV4KG9iamVjdCk7XG5cbiAgICBpZiAoaW5kZXggPj0gMClcbiAgICAgIHRoaXMuX19vYmplY3RzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBfX3NvcnRPYmplY3RzKCkge1xuICAgIGlmICghdGhpcy5yZXZlcnNlKVxuICAgICAgdGhpcy5fX29iamVjdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhWzFdIC0gYlsxXTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19vYmplY3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYlsxXSAtIGFbMV07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYW4gb2JqZWN0IHRvIHRoZSBxdWV1ZVxuICAgKiAoZm9yIHRoaXMgcHJpbWl0aXZlIHZlcnNpb246IHByZXZlbnQgc29ydGluZyBmb3IgZWFjaCBlbGVtZW50IGJ5IGNhbGxpbmcgd2l0aCBcImZhbHNlXCIgYXMgdGhpcmQgYXJndW1lbnQpXG4gICAqL1xuICBpbnNlcnQob2JqZWN0LCB0aW1lLCBzb3J0ID0gdHJ1ZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuICAgICAgLy8gYWRkIG5ldyBvYmplY3RcbiAgICAgIHRoaXMuX19vYmplY3RzLnB1c2goW29iamVjdCwgdGltZV0pO1xuXG4gICAgICBpZiAoc29ydClcbiAgICAgICAgdGhpcy5fX3NvcnRPYmplY3RzKCk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGFuIG9iamVjdCB0byBhbm90aGVyIHRpbWUgaW4gdGhlIHF1ZXVlXG4gICAqL1xuICBtb3ZlKG9iamVjdCwgdGltZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuXG4gICAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7IC8vIGFkZCBuZXcgb2JqZWN0XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuX19vYmplY3RzW2luZGV4XVsxXSA9IHRpbWU7IC8vIHVwZGF0ZSB0aW1lIG9mIGV4aXN0aW5nIG9iamVjdFxuXG4gICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYmplY3QgZnJvbSB0aGUgcXVldWVcbiAgICovXG4gIHJlbW92ZShvYmplY3QpIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHF1ZXVlXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cy5sZW5ndGggPSAwOyAvLyBjbGVhciBvYmplY3QgbGlzdFxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZmlyc3Qgb2JqZWN0IGluIHF1ZXVlXG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVswXTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aW1lIG9mIGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuICAgKi9cbiAgZ2V0IHRpbWUoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn1cbiJdfQ==