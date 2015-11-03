/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert Schnell <Norbert.Schnell@ircam.fr>
 *
 * First rather stupid implementation to be optimized...
 */

export default class PriorityQueue {

  constructor() {
    this.__objects = [];
    this.reverse = false;
  }

  /**
   *  Get the index of an object in the object list
   */
  __objectIndex(object) {
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
  __removeObject(object) {
    var index = this.__objectIndex(object);

    if (index >= 0)
      this.__objects.splice(index, 1);

    if (this.__objects.length > 0)
      return this.__objects[0][1]; // return time of first object

    return Infinity;
  }

  __sortObjects() {
    if (!this.reverse)
      this.__objects.sort(function(a, b) {
        return a[1] - b[1];
      });
    else
      this.__objects.sort(function(a, b) {
        return b[1] - a[1];
      });
  }

  /**
   * Insert an object to the queue
   * (for this primitive version: prevent sorting for each element by calling with "false" as third argument)
   */
  insert(object, time, sort = true) {
    if (time !== Infinity && time != -Infinity) {
      // add new object
      this.__objects.push([object, time]);

      if (sort)
        this.__sortObjects();

      return this.__objects[0][1]; // return time of first object
    }

    return this.__removeObject(object);
  }

  /**
   * Move an object to another time in the queue
   */
  move(object, time) {
    if (time !== Infinity && time != -Infinity) {

      var index = this.__objectIndex(object);

      if (index < 0)
        this.__objects.push([object, time]); // add new object
      else
        this.__objects[index][1] = time; // update time of existing object

      this.__sortObjects();

      return this.__objects[0][1]; // return time of first object
    }

    return this.__removeObject(object);
  }

  /**
   * Remove an object from the queue
   */
  remove(object) {
    return this.__removeObject(object);
  }

  /**
   * Clear queue
   */
  clear() {
    this.__objects.length = 0; // clear object list
    return Infinity;
  }

  /**
   * Get first object in queue
   */
  get head() {
    if (this.__objects.length > 0)
      return this.__objects[0][0];

    return null;
  }

  /**
   * Get time of first object in queue
   */
  get time() {
    if (this.__objects.length > 0)
      return this.__objects[0][1];

    return Infinity;
  }
}
