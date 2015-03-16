"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQVFNLGFBQWE7QUFFTixXQUZQLGFBQWEsR0FFSDswQkFGVixhQUFhOztBQUdmLFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0dBQ3RCOztlQUxHLGFBQWE7QUFVakIsaUJBQWE7Ozs7OzthQUFBLHVCQUFDLE1BQU0sRUFBRTtBQUNwQixhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDOUMsY0FBSSxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNuQyxtQkFBTyxDQUFDLENBQUM7V0FDVjtTQUNGO0FBQ0QsZUFBTyxDQUFDLENBQUMsQ0FBQztPQUNYOztBQUtELGtCQUFjOzs7Ozs7YUFBQSx3QkFBQyxNQUFNLEVBQUU7QUFDckIsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdkMsWUFBSSxLQUFLLElBQUksQ0FBQyxFQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFbEMsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDO0FBQzNCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQTs7QUFFOUIsZUFBTyxRQUFRLENBQUM7T0FDakI7O0FBRUQsaUJBQWE7YUFBQSx5QkFBRztBQUNkLFlBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqQyxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCLENBQUMsQ0FBQyxLQUVILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqQyxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztPQUNOOztBQU1ELFVBQU07Ozs7Ozs7YUFBQSxnQkFBQyxNQUFNLEVBQUUsSUFBSSxFQUFlO1lBQWIsSUFBSSxnQ0FBRyxJQUFJOztBQUM5QixZQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFOztBQUUxQyxjQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVwQyxjQUFJLElBQUksRUFDTixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXZCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7O0FBRUQsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDOztBQUtELFFBQUk7Ozs7OzthQUFBLGNBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUNqQixZQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFOztBQUUxQyxjQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV2QyxjQUFJLEtBQUssR0FBRyxDQUFDLEVBQ1gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztlQUVwQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7QUFFbEMsY0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUVyQixpQkFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzdCOztBQUVELGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNwQzs7QUFLRCxVQUFNOzs7Ozs7YUFBQSxnQkFBQyxNQUFNLEVBQUU7QUFDYixlQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDcEM7O0FBS0QsU0FBSzs7Ozs7O2FBQUEsaUJBQUc7QUFDTixZQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDMUIsZUFBTyxRQUFRLENBQUM7T0FDakI7O0FBS0csUUFBSTs7Ozs7O1dBQUEsWUFBRztBQUNULFlBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTlCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBS0csUUFBSTs7Ozs7O1dBQUEsWUFBRztBQUNULFlBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTlCLGVBQU8sUUFBUSxDQUFDO09BQ2pCOzs7O1NBckhHLGFBQWE7OztBQXdIbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogd3JpdHRlbiBpbiBFQ01Bc2NyaXB0IDYgKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIGF1ZGlvIHByaW9yaXR5IHF1ZXVlIHVzZWQgYnkgc2NoZWR1bGVyIGFuZCB0cmFuc3BvcnRzXG4gKiBAYXV0aG9yIE5vcmJlcnQgU2NobmVsbCA8Tm9yYmVydC5TY2huZWxsQGlyY2FtLmZyPlxuICpcbiAqIEZpcnN0IHJhdGhlciBzdHVwaWQgaW1wbGVtZW50YXRpb24gdG8gYmUgb3B0aW1pemVkLi4uXG4gKi9cblxuY2xhc3MgUHJpb3JpdHlRdWV1ZSB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fX29iamVjdHMgPSBbXTtcbiAgICB0aGlzLnJldmVyc2UgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgR2V0IHRoZSBpbmRleCBvZiBhbiBvYmplY3QgaW4gdGhlIG9iamVjdCBsaXN0XG4gICAqL1xuICBfX29iamVjdEluZGV4KG9iamVjdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fX29iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChvYmplY3QgPT09IHRoaXMuX19vYmplY3RzW2ldWzBdKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKiogXG4gICAqIFdpdGhkcmF3IGFuIG9iamVjdCBmcm9tIHRoZSBvYmplY3QgbGlzdFxuICAgKi9cbiAgX19yZW1vdmVPYmplY3Qob2JqZWN0KSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX29iamVjdEluZGV4KG9iamVjdCk7XG5cbiAgICBpZiAoaW5kZXggPj0gMClcbiAgICAgIHRoaXMuX19vYmplY3RzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBfX3NvcnRPYmplY3RzKCkge1xuICAgIGlmICghdGhpcy5yZXZlcnNlKVxuICAgICAgdGhpcy5fX29iamVjdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhWzFdIC0gYlsxXTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19vYmplY3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYlsxXSAtIGFbMV07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYW4gb2JqZWN0IHRvIHRoZSBxdWV1ZVxuICAgKiAoZm9yIHRoaXMgcHJpbWl0aXZlIHZlcnNpb246IHByZXZlbnQgc29ydGluZyBmb3IgZWFjaCBlbGVtZW50IGJ5IGNhbGxpbmcgd2l0aCBcImZhbHNlXCIgYXMgdGhpcmQgYXJndW1lbnQpXG4gICAqL1xuICBpbnNlcnQob2JqZWN0LCB0aW1lLCBzb3J0ID0gdHJ1ZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuICAgICAgLy8gYWRkIG5ldyBvYmplY3RcbiAgICAgIHRoaXMuX19vYmplY3RzLnB1c2goW29iamVjdCwgdGltZV0pO1xuXG4gICAgICBpZiAoc29ydClcbiAgICAgICAgdGhpcy5fX3NvcnRPYmplY3RzKCk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGFuIG9iamVjdCB0byBhbm90aGVyIHRpbWUgaW4gdGhlIHF1ZXVlXG4gICAqL1xuICBtb3ZlKG9iamVjdCwgdGltZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuICAgICAgXG4gICAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7IC8vIGFkZCBuZXcgb2JqZWN0XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuX19vYmplY3RzW2luZGV4XVsxXSA9IHRpbWU7IC8vIHVwZGF0ZSB0aW1lIG9mIGV4aXN0aW5nIG9iamVjdFxuXG4gICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYmplY3QgZnJvbSB0aGUgcXVldWVcbiAgICovXG4gIHJlbW92ZShvYmplY3QpIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHF1ZXVlXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cy5sZW5ndGggPSAwOyAvLyBjbGVhciBvYmplY3QgbGlzdFxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZmlyc3Qgb2JqZWN0IGluIHF1ZXVlXG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVswXTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aW1lIG9mIGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuICAgKi9cbiAgZ2V0IHRpbWUoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmlvcml0eVF1ZXVlO1xuIl19