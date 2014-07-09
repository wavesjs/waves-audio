/**
 * @fileoverview WAVE audio library element: a web audio scheduler, without time loop.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 4.0.2
 */

var createEventQueue = require("../event-queue");

/**
 * Function invocation pattern for object creation.
 * @public
 */

var createScheduler = function createScheduler(optName) {
  'use strict';

  // Ensure global availability of a "wako.scheduler" instance of WAVE's main scheduler.
  require("../main-scheduler-singleton");

  /**
   * ECMAScript5 property descriptors object.
   */
  var schedulerObject = {

    // Properties with default values
    isRunning: {
      writable: true,
      enumerable: true,
      value: false
    },
    name: {
      writable: true,
      value: "Scheduler"
    },
    eventQueue: {
      writable: true,
      value: createEventQueue()
    },
    nextEventTime: {
      writable: true,
      value: Infinity
    },
    schedulablesList: {
      writable: true,
      value: []
    },
    parent: {
      writable: true,
      value: null
    },
    runningStatusChangeCallback: { // required method, from the parent
      writable: true,
      value: null
    },

    /**
     * Mandatory initialization method.
     * @public
     * @chainable
     */
    init: {
      enumerable: true,
      value: function(optName) {
        if (optName) {
          this.name = optName;
        }
        return this;
      }
    },

    /**
     * Schedule a schedulable object and add it to the scheduling list.
     * @public
     * @chainable
     */
    add: {
      enumerable: true,
      value: function(object) {
        if (object && object.isSchedulable) {
          object.setScheduler(this);
          var length = this.schedulablesList.push(object);
          var index = length - 1;
          var name = object.name ? object.name : object.schedulingID;
          console.log("add():", this.name, "scheduling element #" + index + ' \"' + name + '\"');
          if (!this.isRunning) {
            // this.resetAll();
          }
          return this; // for chainability
        } else {
          throw new Error("add(): object must be schedulable");
        }
      }
    },

    /**
     * Unschedule a schedulable object and remove it from the scheduling list.
     * @public
     * @chainable
     */
    remove: {
      enumerable: true,
      value: function(object) {
        if (object) {
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
          return this; // for chainability
        } else {
          throw new Error("remove(): no object");
        }
      }
    },

    /**
     * Start scheduling.
     * @private
     */
    start: {
      enumerable: false,
      value: function() {
        if (!this.isRunning) {
          this.isRunning = true;
          console.log("Scheduling on", "(" + this.name + ")");
          this.runningStatusChangeCallback(this.isRunning);
        }
      }
    },

    /**
     * Stop scheduling.
     * @private
     */
    stop: {
      enumerable: false,
      value: function() {
        this.isRunning = false;
        console.log("Scheduling off (" + this.name + ")");
        this.runningStatusChangeCallback(this.isRunning);
      }
    },

    /**
     * Reset all schedulables objects of this scheduler.
     * @public
     */
    reset: {
      enumerable: false,
      value: function() {
        this.eventQueue.flush();
        this.insertAll();
      }
    },

    /**
     * Push all events into the event queue and sort it afterward.
     * @private
     */
    insertAll: {
      enumerable: false,
      value: function() {
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
    },

    /**
     * Insert an event into the event queue.
     * @public
     */
    insertEvent: {
      enumerable: true,
      value: function(object, time) {
        if (time !== Infinity) {
          this.eventQueue.Insert(object, time);
        }
      }
    },

    /**
     * Get current time from wako.scheduler.
     * @public
     */
    getCurrentTime: {
      enumerable: true,
      value: function() {
        return wako.scheduler.getCurrentTime();
      }
    },

    /**
     * Update next scheduling time of a scheduled object.
     * @private
     * @param {Object} object reference
     * @param {Float} new scheduling time of its next event; "Infinity" means "remove from scheduling"
     */
    updateNextTime: {
      enumerable: false,
      value: function(object, time) {
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
    },

    /**
     * Set parent and status change callback.
     * @private
     * @param {Object} parent The parent of a scheduler has to be set.
     * @param {Function} callback This required callback triggers the parent,
     * with a boolean on running status change.
     */
    setParent: {
      enumerable: false,
      value: function(object, callback) {
        this.parent = object;
        this.runningStatusChangeCallback = callback;
      }
    },


    /////////////////////////////
    /// Transporting methods ///
    /////////////////////////////

    /**
     * Call the event making method of the first schedulable object,
     * and then update the first event of the queue.
     * @public
     */
    makeNextEvent: {
      enumerable: true,
      value: function() {
        var engine = this.eventQueue.getFirstObject();
        this.nextEventTime = engine.makeEventAndComputeNextTime();
        this.eventQueue.moveFirstEvent(engine, this.nextEventTime);
      }
    },

    /**
     * Get next event time by querying it in the event queue.
     * @public
     */
    getNextTime: {
      enumerable: true,
      // console.log("getNextTime", this.name, this.nextEventTime);
      value: function() {
        if (this.schedulablesList.length > 0) {
          this.nextEventTime = this.eventQueue.getFirstValue();
          return this.nextEventTime;
        } else {
          return Infinity;
        }
      }
    },


  }; // End of object definition.


  // Instantiate an object.
  var instance = Object.create({}, schedulerObject);
  return instance.init(optName);
};


// CommonJS function export
module.exports = createScheduler;