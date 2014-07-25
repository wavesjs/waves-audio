!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.createScheduler=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * @fileoverview WAVE audio library element: a web audio scheduler, without time loop.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 4.0.2
 */

var createEventQueue = _dereq_("event-queue");

/**
 * Function invocation pattern for object creation.
 * @public
 */

var createScheduler = function createScheduler(optName) {
  'use strict';

  // Ensure global availability of a "wako.scheduler" instance of WAVE's main scheduler.
  //require("../main-scheduler-singleton");

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
        this.nextEventTime = engine.makeEventAndReturnNextTime();
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
},{"event-queue":2}],2:[function(_dereq_,module,exports){
/**
 * @fileoverview WAVE audio library element: an event queue manager.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 0.3.2
 * @description An event is made of an object (such as an engine) and a value (such as a time or a position).
 */


/**
 * Function invocation pattern for object creation.
 * @public
 */
var createEventQueue = function createEventQueue() {
  'use strict';

  /**
   * ECMAScript5 property descriptors object.
   */
  var eventQueueObject = {

    // Attributes
    eventList: {
      writable: true,
      value: []
    },
    name: {
      writable: true,
      value: "EventQueue"
    },
    length: {
      enumerable: true,
      get: function() {
        return this.eventList.length;
      }
    },
    isBackward: {
      writable: true,
      value: false
    },

    /**
     * Mandatory initialization method.
     * @public
     * @chainable
     */
    init: {
      enumerable: false,
      value: function() {
        return this;
      }
    },

    /**
     * Insert an event (an ordered pair [object, value]) into eventList.
     * @public
     * @param {Object} object reference
     * @param {Float} value for scheduling or sequencing, ie either time or position value
     */
    insert: {
      enumerable: true,
      value: function(object, value) {
        this.pushEvent(object, value);
        this.sort();
      }
    },

    /**
     * Push an event (an ordered pair [object, value]) into eventList without sorting.
     * @public
     * @param {Object} object reference
     * @param {Float} value for scheduling or sequencing, ie either time or position value
     */
    pushEvent: {
      enumerable: true,
      value: function(object, value) {
        this.eventList.push([object, value]);
      }
    },

    /**
     * Remove an event from the event list.
     * @public
     * @chainable
     * @param {Object} object of the event to remove (1 to 1 hypothesis)
     */
    remove: {
      enumerable: true,
      value: function(object) {
        if (object) {
          // Search for the index of the object in the list (not the full event pair).
          var index = this.indexOf(object);
          if (index < 0) {
            throw new Error("remove(): no object");
          } else {
            this.eventList.splice(index, 1);
          }
          return this; // for chainability
        } else {
          throw new ReferenceError("remove(): no object");
        }
      }
    },

    /**
     * Move an event (an ordered pair [object, value]) into the event list.
     * @public
     * @param {Object} object reference
     * @param {Float} value for scheduling or sequencing, i.e. either time or position value
     * @todo Optimize algorithm: at least, test if moving is necessary?
     */
    move: {
      enumerable: true,
      value: function(object, value) {
        this.remove(object);
        this.insert(object, value);
      }
    },

    /**
     * Move the first event of the event list only if needed.
     * @public
     * @param {Object} object reference
     * @param {Float} value for scheduling or sequencing, ie either time or position value
     */
    moveFirstEvent: {
      enumerable: true,
      value: function(object, value) {
        if (this.isBackward) {
          if (value > this.getValueOfIndex(1)) {
            this.eventList[0][1] = value;
          } else {
            this.eventList.shift();
            this.insert(object, value);
          }
        } else {
          if (value <= this.getValueOfIndex(1)) {
            this.eventList[0][1] = value;
          } else {
            this.eventList.shift();
            this.insert(object, value);
          }
        }
      }
    },

    /**
     * Get first event from the event list.
     * @public
     */
    getFirstEvent: {
      enumerable: true,
      value: function() {
        return this.eventList[0];
      }
    },

    /**
     * Get object of first event from the event list.
     * @public
     */
    getFirstObject: {
      enumerable: true,
      value: function() {
        return this.eventList[0][0];
      }
    },

    /**
     * Get value of first event from the event list (either time or position).
     * @public
     */
    getFirstValue: {
      enumerable: true,
      value: function() {
        return this.eventList[0][1];
      }
    },

    /**
     * Get value of the specified event from the event list (either time or position).
     * @public
     */
    getValueOfIndex: {
      enumerable: true,
      value: function(index) {
        if (this.eventList[index]) {
          return this.eventList[index][1];
        } else {
          return Infinity;
        }
      }
    },

    /**
     * Flush the event list.
     * @public
     */
    flush: {
      enumerable: true,
      value: function() {
        this.eventList = [];
      }
    },

    /**
     * Sort the whole event list.
     * @public
     */
    sort: {
      enumerable: false,
      value: function() {
        if (this.isBackward) {
          this.eventList.sort(this.reverseCompare);
        } else {
          this.eventList.sort(this.compare);
        }
      }
    },

    /**
     * Compare two events based on their value only.
     * @private
     * @param {Event} a
     * @param {Event} b
     */
    compare: {
      enumerable: false,
      value: function(a, b) {
        return a[1] - b[1];
      }
    },

    /**
     * Compare two events based on their value only, in reverse order.
     * @private
     * @param {Event} a
     * @param {Event} b
     */
    reverseCompare: {
      enumerable: false,
      value: function(a, b) {
        return b[1] - a[1];
      }
    },

    /**
     * Get the index of an object in the event list.
     * @private
     */
    indexOf: {
      enumerable: false,
      value: function(object) {
        var i = null;
        for (i = 0; i < this.eventList.length; i++) {
          if (object === this.eventList[i][0]) {
            return i;
          }
        }
        return -1;
      }
    },

  }; // End of property object definition.


  // Instantiate an object and initialize it.
  var eventQueueInstance = Object.create({}, eventQueueObject);
  return eventQueueInstance.init();

};


// CommonJS function export
module.exports = createEventQueue;

},{}]},{},[1])
(1)
});