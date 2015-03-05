"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert Schnell <Norbert.Schnell@ircam.fr>
 *
 * First rather stupid implementation to be optimized...
 */

var PriorityQueue = (function () {
  function PriorityQueue() {
    _babelHelpers.classCallCheck(this, PriorityQueue);

    this.__objects = [];
    this.reverse = false;
  }

  _babelHelpers.prototypeProperties(PriorityQueue, null, {
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
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
    },
    __sortObjects: {
      value: function __sortObjects() {
        if (!this.reverse) this.__objects.sort(function (a, b) {
          return a[1] - b[1];
        });else this.__objects.sort(function (a, b) {
          return b[1] - a[1];
        });
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
    },
    remove: {

      /**
       * Remove an object from the queue
       */

      value: function remove(object) {
        return this.__removeObject(object);
      },
      writable: true,
      configurable: true
    },
    clear: {

      /**
       * Clear queue
       */

      value: function clear() {
        this.__objects.length = 0; // clear object list
        return Infinity;
      },
      writable: true,
      configurable: true
    },
    head: {

      /**
       * Get first object in queue
       */

      get: function () {
        if (this.__objects.length > 0) return this.__objects[0][0];

        return null;
      },
      configurable: true
    },
    time: {

      /**
       * Get time of first object in queue
       */

      get: function () {
        if (this.__objects.length > 0) return this.__objects[0][1];

        return Infinity;
      },
      configurable: true
    }
  });

  return PriorityQueue;
})();

module.exports = PriorityQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFRTSxhQUFhO0FBRU4sV0FGUCxhQUFhO3VDQUFiLGFBQWE7O0FBR2YsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7R0FDdEI7O29DQUxHLGFBQWE7QUFVakIsaUJBQWE7Ozs7OzthQUFBLHVCQUFDLE1BQU0sRUFBRTtBQUNwQixhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDOUMsY0FBSSxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNuQyxtQkFBTyxDQUFDLENBQUM7V0FDVjtTQUNGO0FBQ0QsZUFBTyxDQUFDLENBQUMsQ0FBQztPQUNYOzs7O0FBS0Qsa0JBQWM7Ozs7OzthQUFBLHdCQUFDLE1BQU0sRUFBRTtBQUNyQixZQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV2QyxZQUFJLEtBQUssSUFBSSxDQUFDLEVBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVsQyxZQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUM7QUFDM0IsaUJBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFBOztBQUU5QixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7OztBQUVELGlCQUFhO2FBQUEseUJBQUc7QUFDZCxZQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakMsaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQixDQUFDLENBQUMsS0FFSCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDakMsaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQixDQUFDLENBQUM7T0FDTjs7OztBQU1ELFVBQU07Ozs7Ozs7YUFBQSxnQkFBQyxNQUFNLEVBQUUsSUFBSSxFQUFlO1lBQWIsSUFBSSxnQ0FBRyxJQUFJOztBQUM5QixZQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFOztBQUUxQyxjQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVwQyxjQUFJLElBQUksRUFDTixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXZCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7O0FBRUQsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDOzs7O0FBS0QsUUFBSTs7Ozs7O2FBQUEsY0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ2pCLFlBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDMUMsY0FBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdkMsY0FBSSxLQUFLLEdBQUcsQ0FBQyxFQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7ZUFFcEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7O0FBRWxDLGNBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7QUFFckIsaUJBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM3Qjs7QUFFRCxlQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDcEM7Ozs7QUFLRCxVQUFNOzs7Ozs7YUFBQSxnQkFBQyxNQUFNLEVBQUU7QUFDYixlQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDcEM7Ozs7QUFLRCxTQUFLOzs7Ozs7YUFBQSxpQkFBRztBQUNOLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMxQixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7OztBQUtHLFFBQUk7Ozs7OztXQUFBLFlBQUc7QUFDVCxZQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDM0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUU5QixlQUFPLElBQUksQ0FBQztPQUNiOzs7QUFLRyxRQUFJOzs7Ozs7V0FBQSxZQUFHO0FBQ1QsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsZUFBTyxRQUFRLENBQUM7T0FDakI7Ozs7O1NBcEhHLGFBQWE7OztBQXVIbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogd3JpdHRlbiBpbiBFQ01Bc2NyaXB0IDYgKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIGF1ZGlvIHByaW9yaXR5IHF1ZXVlIHVzZWQgYnkgc2NoZWR1bGVyIGFuZCB0cmFuc3BvcnRzXG4gKiBAYXV0aG9yIE5vcmJlcnQgU2NobmVsbCA8Tm9yYmVydC5TY2huZWxsQGlyY2FtLmZyPlxuICpcbiAqIEZpcnN0IHJhdGhlciBzdHVwaWQgaW1wbGVtZW50YXRpb24gdG8gYmUgb3B0aW1pemVkLi4uXG4gKi9cblxuY2xhc3MgUHJpb3JpdHlRdWV1ZSB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fX29iamVjdHMgPSBbXTtcbiAgICB0aGlzLnJldmVyc2UgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgR2V0IHRoZSBpbmRleCBvZiBhbiBvYmplY3QgaW4gdGhlIG9iamVjdCBsaXN0XG4gICAqL1xuICBfX29iamVjdEluZGV4KG9iamVjdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fX29iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChvYmplY3QgPT09IHRoaXMuX19vYmplY3RzW2ldWzBdKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKiogXG4gICAqIFdpdGhkcmF3IGFuIG9iamVjdCBmcm9tIHRoZSBvYmplY3QgbGlzdFxuICAgKi9cbiAgX19yZW1vdmVPYmplY3Qob2JqZWN0KSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX29iamVjdEluZGV4KG9iamVjdCk7XG5cbiAgICBpZiAoaW5kZXggPj0gMClcbiAgICAgIHRoaXMuX19vYmplY3RzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBfX3NvcnRPYmplY3RzKCkge1xuICAgIGlmICghdGhpcy5yZXZlcnNlKVxuICAgICAgdGhpcy5fX29iamVjdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhWzFdIC0gYlsxXTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19vYmplY3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYlsxXSAtIGFbMV07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYW4gb2JqZWN0IHRvIHRoZSBxdWV1ZVxuICAgKiAoZm9yIHRoaXMgcHJpbWl0aXZlIHZlcnNpb246IHByZXZlbnQgc29ydGluZyBmb3IgZWFjaCBlbGVtZW50IGJ5IGNhbGxpbmcgd2l0aCBcImZhbHNlXCIgYXMgdGhpcmQgYXJndW1lbnQpXG4gICAqL1xuICBpbnNlcnQob2JqZWN0LCB0aW1lLCBzb3J0ID0gdHJ1ZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuICAgICAgLy8gYWRkIG5ldyBvYmplY3RcbiAgICAgIHRoaXMuX19vYmplY3RzLnB1c2goW29iamVjdCwgdGltZV0pO1xuXG4gICAgICBpZiAoc29ydClcbiAgICAgICAgdGhpcy5fX3NvcnRPYmplY3RzKCk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGFuIG9iamVjdCB0byBhbm90aGVyIHRpbWUgaW4gdGhlIHF1ZXVlXG4gICAqL1xuICBtb3ZlKG9iamVjdCwgdGltZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy5fX29iamVjdEluZGV4KG9iamVjdCk7XG5cbiAgICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgIHRoaXMuX19vYmplY3RzLnB1c2goW29iamVjdCwgdGltZV0pOyAvLyBhZGQgbmV3IG9iamVjdFxuICAgICAgZWxzZVxuICAgICAgICB0aGlzLl9fb2JqZWN0c1tpbmRleF1bMV0gPSB0aW1lOyAvLyB1cGRhdGUgdGltZSBvZiBleGlzdGluZyBvYmplY3RcblxuICAgICAgdGhpcy5fX3NvcnRPYmplY3RzKCk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gb2JqZWN0IGZyb20gdGhlIHF1ZXVlXG4gICAqL1xuICByZW1vdmUob2JqZWN0KSB7XG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBxdWV1ZVxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fX29iamVjdHMubGVuZ3RoID0gMDsgLy8gY2xlYXIgb2JqZWN0IGxpc3RcbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuICAgKi9cbiAgZ2V0IGhlYWQoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMF07XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGltZSBvZiBmaXJzdCBvYmplY3QgaW4gcXVldWVcbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9fb2JqZWN0cy5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJpb3JpdHlRdWV1ZTtcbiJdfQ==