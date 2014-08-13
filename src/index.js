
/**
 * @fileoverview WAVE audio library element: a web audio scheduler, without time loop.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 4.1.0
 */

'use strict';

var EventQueue = require("../event-queue");

// Make a global instance of the wako.scheduler available
require("../main-scheduler");

class Scheduler {

  constructor(optName) {

    if (!this || this === window)
      throw new SyntaxError("You seem to have forgotten the new operator; Shame on you!");

    this.name = optName || "Scheduler";
    this.isRunning = false;    
    this.eventQueue = null;
    this.nextEventTime = Infinity
    this.schedulablesList = []
    this.parent = null
    // required method, from the parent
    this.runningStatusChangeCallback = null;
    this.eventQueue = new EventQueue();

    return this;
  }

  /**
   * Schedule a schedulable object and add it to the scheduling list.
   * @public
   * @chainable
   */
  add(object) {
    object.scheduler = this;
    var length = this.schedulablesList.push(object);
    var index = length - 1;
    var name = object.name ? object.name : object.schedulingID;
    console.log("add():", this.name, "scheduling element #" + index + ' \"' + name + '\"');
    if (!this.isRunning) {
      // this.resetAll();
    }
    return this;
  }

  /**
   * Unschedule a schedulable object and remove it from the scheduling list.
   * @public
   * @chainable
   */
  remove(object) {
    // Search for the object in the scheduling list.
    var index = this.schedulablesList.indexOf(object);

    if (index < 0) {
      throw new Error("remove(): object not found," + object);
    } else {
      this.schedulablesList.splice(index, 1);
      console.log("Unscheduling element #" + index, object.name ? '\"' + object.name + '\"' : "", object.schedulingID);
      // When the scheduling list is empty, stop scheduling.
      if (this.schedulablesList.length <= 0) {
        this.stop();
      }
    }
    return this;
  }

  /**
   * Start scheduling.
   * @private
   */
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      console.log("Scheduling on", "(" + this.name + ")");
      this.runningStatusChangeCallback(this.isRunning);
    }
  }

  /**
   * Stop scheduling.
   * @private
   */
  stop() {
    this.isRunning = false;
    console.log("Scheduling off (" + this.name + ")");
    this.runningStatusChangeCallback(this.isRunning);
  }

  /**
   * Reset all schedulables objects of this scheduler.
   * @public
   */
  reset() {
    this.eventQueue.flush();
    this.insertAll();
  }

  /**
   * Push all events into the event queue and sort it afterward.
   * @private
   */
  insertAll() {
    var time = null;
    var element = null;
    // console.log("schedulablesList: ", this.schedulablesList);
    for (var i = this.schedulablesList.length - 1; i >= 0; i--) {
      element = this.schedulablesList[i];
      time = element.resetAndReturnNextTime(this.getCurrentTime());
      this.eventQueue.pushEvent(element, time);
    }
    this.eventQueue.sort();
  }

  /**
   * Insert an event into the event queue.
   * @public
   */
  insertEvent(object, time) {
    if (time !== Infinity) {
      this.eventQueue.Insert(object, time);
    }
  }

  /**
   * Get current time from wako.scheduler.
   * @public
   */
  getCurrentTime() {
    return wako.scheduler.getCurrentTime();
  }

  /**
   * Update next scheduling time of a scheduled object.
   * @private
   * @param {Object} object reference
   * @param {Float} new scheduling time of its next event; "Infinity" means "remove from scheduling"
   */
  updateNextTime(object, time) {
    if (time === Infinity) {
      this.eventQueue.remove(object);
      // If the queue is empty, stop scheduling.
      if (this.eventQueue.length <= 0) {
        this.stop();
      }
    } else {
      if (this.eventQueue.indexOf(object) < 0) {
        this.eventQueue.insert(object, time);
      } else {
        this.eventQueue.move(object, time);
      }
      this.start();
    }
  }

  /**
   * Set parent and status change callback.
   * @private
   * @param {Object} parent The parent of a scheduler has to be set.
   * @param {Function} callback This required callback triggers the parent,
   * with a boolean on running status change.
   */
  setParent(object, callback) {
    this.parent = object;
    this.runningStatusChangeCallback = callback;
  }


  /////////////////////////////
  /// Transporting methods ///
  /////////////////////////////

  /**
   * Call the event making method of the first schedulable object,
   * and then update the first event of the queue.
   * @public
   */
  makeNextEvent() {
    var engine = this.eventQueue.getFirstObject();
    this.nextEventTime = engine.makeEventAndReturnNextTime();
    this.eventQueue.moveFirstEvent(engine, this.nextEventTime);
  }

  /**
   * Get next event time by querying it in the event queue.
   * @public
   */
  getNextTime() {
    if (this.schedulablesList.length > 0) {
      this.nextEventTime = this.eventQueue.getFirstValue();
      return this.nextEventTime;
    } else {
      return Infinity;
    }
  }

}

module.exports = Scheduler;