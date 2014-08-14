/**
 * @fileoverview WAVE audio library element: a web audio scheduler, without time loop.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 4.1.0
 */

'use strict';

var EventQueue = require("../event-queue");

class Scheduler {

  constructor(parent) {
    this.__objects = []
    this.__parent = parent;
    this.__eventQueue = new EventQueue();
  }

  /**
   * Schedule a schedulable object and add it to the scheduling list.
   * @public
   */
  add(object) {
    var firstTime = this.__eventQueue.getFirstTime();

    // assign scheduler to schedulable object
    object.scheduler = this;

    // add to list of schedulable objects
    this.__objects.push(object);

    // reset object and get next scheduling time
    var time = object.reset(this.__parent.currentTime); // TODO: fix me to leave me

    // add event to queue of scheduled events
    this.__eventQueue.insert(object, time);

    var nextTime = this.__eventQueue.getFirstTime();

    if (nextTime !== firstTime)
      this.__parent.reschedule(nextTime);
  }

  /**
   * Unschedule a schedulable object and remove it from the scheduling list.
   */
  remove(object) {
    var index = this.__objects.indexOf(object);
    var firstTime = this.__eventQueue.getFirstTime();

    if (index >= 0) {
      // remove from object list
      this.__objects.splice(index, 1);

      // remove event from queue of scheduled events
      this.__eventQueue.remove(object);

    // reset schedulable object
      object.scheduler = null;

      var nextTime = this.__eventQueue.getFirstTime();

      if (nextTime !== firstTime)
        this.__parent.reschedule(nextTime);
    }
  }

  /**
   * Update next scheduling time of a scheduled object.
   * @param {Object} object reference
   * @param {Float} new scheduling time of its next event; "Infinity" means "remove from scheduling"
   */
  reschedule(object, time) {
    var firstTime = this.__eventQueue.getFirstTime();

    if (time === Infinity) {
      this.__eventQueue.remove(object);

      if (this.__eventQueue.empty) {
        this.__parent.reschedule(time);
      }
    } else {
      var wasEmpty = this.__eventQueue.empty;

      this.__eventQueue.insert(object, time);

      var nextTime = this.__eventQueue.getFirstTime();

      if (nextTime !== firstTime)
        this.__parent.reschedule(nextTime);
    }
  }

  /***********************************************************************
   *
   *  Functions called by parent
   *
   */

  /**
   * Reset all schedulables objects of this scheduler and return first time.
   */
  reset() {
    this.__eventQueue.clear();

    var object, time;

    for (var i = this.__objects.length - 1; i > 0; i--) {
      object = this.__objects[i];
      time = object.reset(this.time);
      this.__eventQueue.insert(object, time, false); // don't sort
    }

    object = this.__objects[0];
    time = object.reset(this.time);
    this.__eventQueue.insert(object, time, true); // now sort

    return this.__eventQueue.getFirstTime();
  }

  /**
   * Call the event making method of the first schedulable object,
   * and then update the first event of the queue.
   * @public
   */
  execute() {
    var object = this.__eventQueue.getFirstObject();
    var time = this.__eventQueue.getFirstTime();
    var nextTime = object.execute(time);

    this.__eventQueue.insert(object, nextTime);

    return this.__eventQueue.getFirstTime();
  }
}

module.exports = Scheduler;