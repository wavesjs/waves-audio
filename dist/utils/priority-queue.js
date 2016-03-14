"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert Schnell <Norbert.Schnell@ircam.fr>
 *
 * First rather stupid implementation to be optimized...
 */

var PriorityQueue = function () {
  function PriorityQueue() {
    (0, _classCallCheck3.default)(this, PriorityQueue);

    this.__objects = [];
    this.reverse = false;
  }

  /**
   *  Get the index of an object in the object list
   */


  (0, _createClass3.default)(PriorityQueue, [{
    key: "__objectIndex",
    value: function __objectIndex(object) {
      for (var i = 0; i < this.__objects.length; i++) {
        if (object === this.__objects[i][0]) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Withdraw an object from the object list
     */

  }, {
    key: "__removeObject",
    value: function __removeObject(object) {
      var index = this.__objectIndex(object);

      if (index >= 0) this.__objects.splice(index, 1);

      if (this.__objects.length > 0) return this.__objects[0][1]; // return time of first object

      return Infinity;
    }
  }, {
    key: "__sortObjects",
    value: function __sortObjects() {
      if (!this.reverse) this.__objects.sort(function (a, b) {
        return a[1] - b[1];
      });else this.__objects.sort(function (a, b) {
        return b[1] - a[1];
      });
    }

    /**
     * Insert an object to the queue
     * (for this primitive version: prevent sorting for each element by calling with "false" as third argument)
     */

  }, {
    key: "insert",
    value: function insert(object, time) {
      var sort = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      if (time !== Infinity && time != -Infinity) {
        // add new object
        this.__objects.push([object, time]);

        if (sort) this.__sortObjects();

        return this.__objects[0][1]; // return time of first object
      }

      return this.__removeObject(object);
    }

    /**
     * Move an object to another time in the queue
     */

  }, {
    key: "move",
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

    /**
     * Remove an object from the queue
     */

  }, {
    key: "remove",
    value: function remove(object) {
      return this.__removeObject(object);
    }

    /**
     * Clear queue
     */

  }, {
    key: "clear",
    value: function clear() {
      this.__objects.length = 0; // clear object list
      return Infinity;
    }

    /**
     * Get first object in queue
     */

  }, {
    key: "head",
    get: function get() {
      if (this.__objects.length > 0) return this.__objects[0][0];

      return null;
    }

    /**
     * Get time of first object in queue
     */

  }, {
    key: "time",
    get: function get() {
      if (this.__objects.length > 0) return this.__objects[0][1];

      return Infinity;
    }
  }]);
  return PriorityQueue;
}();

exports.default = PriorityQueue;
//# sourceMappingURL=data:application/json;base64,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S0FBSyxTQUFMLENBQWUsTUFBZixHQUF3QixDQUF4QixFQUNGLE9BQU8sS0FBSyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFQLENBREY7O0FBR0EsYUFBTyxJQUFQLENBSlM7Ozs7Ozs7Ozt3QkFVQTtBQUNULFVBQUksS0FBSyxTQUFMLENBQWUsTUFBZixHQUF3QixDQUF4QixFQUNGLE9BQU8sS0FBSyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixDQUFQLENBREY7O0FBR0EsYUFBTyxRQUFQLENBSlM7OztTQWhIUSIsImZpbGUiOiJwcmlvcml0eS1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBhdWRpbyBwcmlvcml0eSBxdWV1ZSB1c2VkIGJ5IHNjaGVkdWxlciBhbmQgdHJhbnNwb3J0c1xuICogQGF1dGhvciBOb3JiZXJ0IFNjaG5lbGwgPE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mcj5cbiAqXG4gKiBGaXJzdCByYXRoZXIgc3R1cGlkIGltcGxlbWVudGF0aW9uIHRvIGJlIG9wdGltaXplZC4uLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByaW9yaXR5UXVldWUge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX19vYmplY3RzID0gW107XG4gICAgdGhpcy5yZXZlcnNlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogIEdldCB0aGUgaW5kZXggb2YgYW4gb2JqZWN0IGluIHRoZSBvYmplY3QgbGlzdFxuICAgKi9cbiAgX19vYmplY3RJbmRleChvYmplY3QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX19vYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAob2JqZWN0ID09PSB0aGlzLl9fb2JqZWN0c1tpXVswXSkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpdGhkcmF3IGFuIG9iamVjdCBmcm9tIHRoZSBvYmplY3QgbGlzdFxuICAgKi9cbiAgX19yZW1vdmVPYmplY3Qob2JqZWN0KSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX29iamVjdEluZGV4KG9iamVjdCk7XG5cbiAgICBpZiAoaW5kZXggPj0gMClcbiAgICAgIHRoaXMuX19vYmplY3RzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBfX3NvcnRPYmplY3RzKCkge1xuICAgIGlmICghdGhpcy5yZXZlcnNlKVxuICAgICAgdGhpcy5fX29iamVjdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhWzFdIC0gYlsxXTtcbiAgICAgIH0pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19vYmplY3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYlsxXSAtIGFbMV07XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYW4gb2JqZWN0IHRvIHRoZSBxdWV1ZVxuICAgKiAoZm9yIHRoaXMgcHJpbWl0aXZlIHZlcnNpb246IHByZXZlbnQgc29ydGluZyBmb3IgZWFjaCBlbGVtZW50IGJ5IGNhbGxpbmcgd2l0aCBcImZhbHNlXCIgYXMgdGhpcmQgYXJndW1lbnQpXG4gICAqL1xuICBpbnNlcnQob2JqZWN0LCB0aW1lLCBzb3J0ID0gdHJ1ZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuICAgICAgLy8gYWRkIG5ldyBvYmplY3RcbiAgICAgIHRoaXMuX19vYmplY3RzLnB1c2goW29iamVjdCwgdGltZV0pO1xuXG4gICAgICBpZiAoc29ydClcbiAgICAgICAgdGhpcy5fX3NvcnRPYmplY3RzKCk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGFuIG9iamVjdCB0byBhbm90aGVyIHRpbWUgaW4gdGhlIHF1ZXVlXG4gICAqL1xuICBtb3ZlKG9iamVjdCwgdGltZSkge1xuICAgIGlmICh0aW1lICE9PSBJbmZpbml0eSAmJiB0aW1lICE9IC1JbmZpbml0eSkge1xuXG4gICAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgICAgaWYgKGluZGV4IDwgMClcbiAgICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7IC8vIGFkZCBuZXcgb2JqZWN0XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuX19vYmplY3RzW2luZGV4XVsxXSA9IHRpbWU7IC8vIHVwZGF0ZSB0aW1lIG9mIGV4aXN0aW5nIG9iamVjdFxuXG4gICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBvYmplY3QgZnJvbSB0aGUgcXVldWVcbiAgICovXG4gIHJlbW92ZShvYmplY3QpIHtcbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHF1ZXVlXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cy5sZW5ndGggPSAwOyAvLyBjbGVhciBvYmplY3QgbGlzdFxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZmlyc3Qgb2JqZWN0IGluIHF1ZXVlXG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVswXTtcblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aW1lIG9mIGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuICAgKi9cbiAgZ2V0IHRpbWUoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cbn1cbiJdfQ==