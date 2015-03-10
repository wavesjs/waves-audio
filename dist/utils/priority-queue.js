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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQVFNLGFBQWE7QUFFTixXQUZQLGFBQWEsR0FFSDswQkFGVixhQUFhOztBQUdmLFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0dBQ3RCOztlQUxHLGFBQWE7QUFVakIsaUJBQWE7Ozs7OzthQUFBLHVCQUFDLE1BQU0sRUFBRTtBQUNwQixhQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDOUMsY0FBSSxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNuQyxtQkFBTyxDQUFDLENBQUM7V0FDVjtTQUNGO0FBQ0QsZUFBTyxDQUFDLENBQUMsQ0FBQztPQUNYOztBQUtELGtCQUFjOzs7Ozs7YUFBQSx3QkFBQyxNQUFNLEVBQUU7QUFDckIsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdkMsWUFBSSxLQUFLLElBQUksQ0FBQyxFQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFbEMsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDO0FBQzNCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQTs7QUFFOUIsZUFBTyxRQUFRLENBQUM7T0FDakI7O0FBRUQsaUJBQWE7YUFBQSx5QkFBRztBQUNkLFlBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqQyxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCLENBQUMsQ0FBQyxLQUVILElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNqQyxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztPQUNOOztBQU1ELFVBQU07Ozs7Ozs7YUFBQSxnQkFBQyxNQUFNLEVBQUUsSUFBSSxFQUFlO1lBQWIsSUFBSSxnQ0FBRyxJQUFJOztBQUM5QixZQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFOztBQUUxQyxjQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUVwQyxjQUFJLElBQUksRUFDTixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXZCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7O0FBRUQsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDOztBQUtELFFBQUk7Ozs7OzthQUFBLGNBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUNqQixZQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzFDLGNBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXZDLGNBQUksS0FBSyxHQUFHLENBQUMsRUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2VBRXBDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUVsQyxjQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXJCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7O0FBRUQsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDOztBQUtELFVBQU07Ozs7OzthQUFBLGdCQUFDLE1BQU0sRUFBRTtBQUNiLGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNwQzs7QUFLRCxTQUFLOzs7Ozs7YUFBQSxpQkFBRztBQUNOLFlBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUMxQixlQUFPLFFBQVEsQ0FBQztPQUNqQjs7QUFLRyxRQUFJOzs7Ozs7V0FBQSxZQUFHO0FBQ1QsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsZUFBTyxJQUFJLENBQUM7T0FDYjs7QUFLRyxRQUFJOzs7Ozs7V0FBQSxZQUFHO0FBQ1QsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsZUFBTyxRQUFRLENBQUM7T0FDakI7Ozs7U0FwSEcsYUFBYTs7O0FBdUhuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvcHJpb3JpdHktcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gcHJpb3JpdHkgcXVldWUgdXNlZCBieSBzY2hlZHVsZXIgYW5kIHRyYW5zcG9ydHNcbiAqIEBhdXRob3IgTm9yYmVydCBTY2huZWxsIDxOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnI+XG4gKlxuICogRmlyc3QgcmF0aGVyIHN0dXBpZCBpbXBsZW1lbnRhdGlvbiB0byBiZSBvcHRpbWl6ZWQuLi5cbiAqL1xuXG5jbGFzcyBQcmlvcml0eVF1ZXVlIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cyA9IFtdO1xuICAgIHRoaXMucmV2ZXJzZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqICBHZXQgdGhlIGluZGV4IG9mIGFuIG9iamVjdCBpbiB0aGUgb2JqZWN0IGxpc3RcbiAgICovXG4gIF9fb2JqZWN0SW5kZXgob2JqZWN0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9fb2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG9iamVjdCA9PT0gdGhpcy5fX29iamVjdHNbaV1bMF0pIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKiBcbiAgICogV2l0aGRyYXcgYW4gb2JqZWN0IGZyb20gdGhlIG9iamVjdCBsaXN0XG4gICAqL1xuICBfX3JlbW92ZU9iamVjdChvYmplY3QpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgIGlmIChpbmRleCA+PSAwKVxuICAgICAgdGhpcy5fX29iamVjdHMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIGlmICh0aGlzLl9fb2JqZWN0cy5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIF9fc29ydE9iamVjdHMoKSB7XG4gICAgaWYgKCF0aGlzLnJldmVyc2UpXG4gICAgICB0aGlzLl9fb2JqZWN0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGFbMV0gLSBiWzFdO1xuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5fX29iamVjdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBiWzFdIC0gYVsxXTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhbiBvYmplY3QgdG8gdGhlIHF1ZXVlXG4gICAqIChmb3IgdGhpcyBwcmltaXRpdmUgdmVyc2lvbjogcHJldmVudCBzb3J0aW5nIGZvciBlYWNoIGVsZW1lbnQgYnkgY2FsbGluZyB3aXRoIFwiZmFsc2VcIiBhcyB0aGlyZCBhcmd1bWVudClcbiAgICovXG4gIGluc2VydChvYmplY3QsIHRpbWUsIHNvcnQgPSB0cnVlKSB7XG4gICAgaWYgKHRpbWUgIT09IEluZmluaXR5ICYmIHRpbWUgIT0gLUluZmluaXR5KSB7XG4gICAgICAvLyBhZGQgbmV3IG9iamVjdFxuICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7XG5cbiAgICAgIGlmIChzb3J0KVxuICAgICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYW4gb2JqZWN0IHRvIGFub3RoZXIgdGltZSBpbiB0aGUgcXVldWVcbiAgICovXG4gIG1vdmUob2JqZWN0LCB0aW1lKSB7XG4gICAgaWYgKHRpbWUgIT09IEluZmluaXR5ICYmIHRpbWUgIT0gLUluZmluaXR5KSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7IC8vIGFkZCBuZXcgb2JqZWN0XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuX19vYmplY3RzW2luZGV4XVsxXSA9IHRpbWU7IC8vIHVwZGF0ZSB0aW1lIG9mIGV4aXN0aW5nIG9iamVjdFxuXG4gICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYmplY3QgZnJvbSB0aGUgcXVldWVcbiAgICovXG4gIHJlbW92ZShvYmplY3QpIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHF1ZXVlXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cy5sZW5ndGggPSAwOyAvLyBjbGVhciBvYmplY3QgbGlzdFxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZmlyc3Qgb2JqZWN0IGluIHF1ZXVlXG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVswXTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aW1lIG9mIGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuICAgKi9cbiAgZ2V0IHRpbWUoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmlvcml0eVF1ZXVlO1xuIl19