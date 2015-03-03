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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBUU0sYUFBYTtBQUVOLFdBRlAsYUFBYTt1Q0FBYixhQUFhOztBQUdmLFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0dBQ3RCOztvQ0FMRyxhQUFhO0FBVWpCLGlCQUFhOzs7Ozs7YUFBQSx1QkFBQyxNQUFNLEVBQUU7QUFDcEIsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlDLGNBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDbkMsbUJBQU8sQ0FBQyxDQUFDO1dBQ1Y7U0FDRjtBQUNELGVBQU8sQ0FBQyxDQUFDLENBQUM7T0FDWDs7OztBQUtELGtCQUFjOzs7Ozs7YUFBQSx3QkFBQyxNQUFNLEVBQUU7QUFDckIsWUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFdkMsWUFBSSxLQUFLLElBQUksQ0FBQyxFQUNaLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFbEMsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDO0FBQzNCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FBQTs7QUFFOUIsZUFBTyxRQUFRLENBQUM7T0FDakI7Ozs7QUFFRCxpQkFBYTthQUFBLHlCQUFHO0FBQ2QsWUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFDLEtBRUgsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDLGlCQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDcEIsQ0FBQyxDQUFDO09BQ047Ozs7QUFNRCxVQUFNOzs7Ozs7O2FBQUEsZ0JBQUMsTUFBTSxFQUFFLElBQUksRUFBZTtZQUFiLElBQUksZ0NBQUcsSUFBSTs7QUFDOUIsWUFBSSxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTs7QUFFMUMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFcEMsY0FBSSxJQUFJLEVBQ04sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDOztBQUV2QixpQkFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzdCOztBQUVELGVBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUNwQzs7OztBQUtELFFBQUk7Ozs7OzthQUFBLGNBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtBQUNqQixZQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQzFDLGNBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXZDLGNBQUksS0FBSyxHQUFHLENBQUMsRUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2VBRXBDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOztBQUVsQyxjQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7O0FBRXJCLGlCQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7O0FBRUQsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDOzs7O0FBS0QsVUFBTTs7Ozs7O2FBQUEsZ0JBQUMsTUFBTSxFQUFFO0FBQ2IsZUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ3BDOzs7O0FBS0QsU0FBSzs7Ozs7O2FBQUEsaUJBQUc7QUFDTixZQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDMUIsZUFBTyxRQUFRLENBQUM7T0FDakI7Ozs7QUFLRyxRQUFJOzs7Ozs7V0FBQSxZQUFHO0FBQ1QsWUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQzNCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUIsZUFBTyxJQUFJLENBQUM7T0FDYjs7O0FBS0csUUFBSTs7Ozs7O1dBQUEsWUFBRztBQUNULFlBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTlCLGVBQU8sUUFBUSxDQUFDO09BQ2pCOzs7OztTQXBIRyxhQUFhOzs7QUF1SG5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6InNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gcHJpb3JpdHkgcXVldWUgdXNlZCBieSBzY2hlZHVsZXIgYW5kIHRyYW5zcG9ydHNcbiAqIEBhdXRob3IgTm9yYmVydCBTY2huZWxsIDxOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnI+XG4gKlxuICogRmlyc3QgcmF0aGVyIHN0dXBpZCBpbXBsZW1lbnRhdGlvbiB0byBiZSBvcHRpbWl6ZWQuLi5cbiAqL1xuXG5jbGFzcyBQcmlvcml0eVF1ZXVlIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cyA9IFtdO1xuICAgIHRoaXMucmV2ZXJzZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqICBHZXQgdGhlIGluZGV4IG9mIGFuIG9iamVjdCBpbiB0aGUgb2JqZWN0IGxpc3RcbiAgICovXG4gIF9fb2JqZWN0SW5kZXgob2JqZWN0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9fb2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG9iamVjdCA9PT0gdGhpcy5fX29iamVjdHNbaV1bMF0pIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKiBcbiAgICogV2l0aGRyYXcgYW4gb2JqZWN0IGZyb20gdGhlIG9iamVjdCBsaXN0XG4gICAqL1xuICBfX3JlbW92ZU9iamVjdChvYmplY3QpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgIGlmIChpbmRleCA+PSAwKVxuICAgICAgdGhpcy5fX29iamVjdHMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIGlmICh0aGlzLl9fb2JqZWN0cy5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIF9fc29ydE9iamVjdHMoKSB7XG4gICAgaWYgKCF0aGlzLnJldmVyc2UpXG4gICAgICB0aGlzLl9fb2JqZWN0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGFbMV0gLSBiWzFdO1xuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5fX29iamVjdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBiWzFdIC0gYVsxXTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhbiBvYmplY3QgdG8gdGhlIHF1ZXVlXG4gICAqIChmb3IgdGhpcyBwcmltaXRpdmUgdmVyc2lvbjogcHJldmVudCBzb3J0aW5nIGZvciBlYWNoIGVsZW1lbnQgYnkgY2FsbGluZyB3aXRoIFwiZmFsc2VcIiBhcyB0aGlyZCBhcmd1bWVudClcbiAgICovXG4gIGluc2VydChvYmplY3QsIHRpbWUsIHNvcnQgPSB0cnVlKSB7XG4gICAgaWYgKHRpbWUgIT09IEluZmluaXR5ICYmIHRpbWUgIT0gLUluZmluaXR5KSB7XG4gICAgICAvLyBhZGQgbmV3IG9iamVjdFxuICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7XG5cbiAgICAgIGlmIChzb3J0KVxuICAgICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYW4gb2JqZWN0IHRvIGFub3RoZXIgdGltZSBpbiB0aGUgcXVldWVcbiAgICovXG4gIG1vdmUob2JqZWN0LCB0aW1lKSB7XG4gICAgaWYgKHRpbWUgIT09IEluZmluaXR5ICYmIHRpbWUgIT0gLUluZmluaXR5KSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7IC8vIGFkZCBuZXcgb2JqZWN0XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuX19vYmplY3RzW2luZGV4XVsxXSA9IHRpbWU7IC8vIHVwZGF0ZSB0aW1lIG9mIGV4aXN0aW5nIG9iamVjdFxuXG4gICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYmplY3QgZnJvbSB0aGUgcXVldWVcbiAgICovXG4gIHJlbW92ZShvYmplY3QpIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHF1ZXVlXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cy5sZW5ndGggPSAwOyAvLyBjbGVhciBvYmplY3QgbGlzdFxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZmlyc3Qgb2JqZWN0IGluIHF1ZXVlXG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVswXTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aW1lIG9mIGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuICAgKi9cbiAgZ2V0IHRpbWUoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmlvcml0eVF1ZXVlO1xuIl19