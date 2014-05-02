/**
 * @fileoverview WAVE audio library element: a web audio scheduler.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 3.2.0
 */


/**
 * Function invocation pattern for object creation.
 * @public
 */

var createScheduler = function createScheduler(audioContext) {
  'use strict';

  /**
   * ECMAScript5 property descriptors object.
   */
  var schedulerObject = {

    // Properties with default values
    schedulingPeriod: { // How frequently to call scheduling function (sec)
      writable: true,
      value: 0.025
    },
    scheduleAheadTime: { // How far ahead to schedule audio (sec)
      writable: true,
      value: 0.1
    },
    schedulingList: {
      writable: true,
      value: []
    },
    isScheduling: {
      writable: true,
      value: false
    },

    // Other properties
    context: {
      writable: true
    },
    timerID: {
      writable: true
    },

    /**
     * Mandatory initialization method.
     * @public
     * @chainable
     */
    init: {
      enumerable: true,
      value: function(audioContext) {

        this.context = audioContext;

        return this; // for chainability
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
        if (object) {
          object.schedulingID = nodeUuid.v4();
          var length = this.schedulingList.push(object);
          var index = length - 1;
          var optName = object.name ? '\"' + object.name + '\"' : "";
          console.log("Scheduling element #" + index, optName, object.schedulingID);
          if (!this.isScheduling) {
            this.isScheduling = true;
            console.log("Scheduling on");
            this.run();
          }
          return this; // for chainability
        } else {
          throw "Schedulable object error";
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
          var index = this.schedulingList.indexOf(object);

          if (index < 0) {
            throw "Object not found: cannot unschedule " + object;
          } else {
            this.schedulingList.splice(index, 1);
            console.log("Unscheduling element #" + index, object.name ? '\"' + object.name + '\"' : "", object.schedulingID);
            // Remove the current setTimeout if scheduling list if empty.
            if (this.schedulingList.length <= 0) {
              clearTimeout(this.timerID);
              this.isScheduling = false;
              console.log("Scheduling off");
            }
          }
          return this; // for chainability
        } else {
          throw "Schedulable object error";
        }
      }
    },

    /**
     * Coarse-grained scheduling of audio events.
     * @private
     */
    run: {
      enumerable: false,
      value: function() {
        var that = this;
        var schedulable = null;
        var length = this.schedulingList.length;
        var i;
        for (i = 0; i < length; i++) {
          schedulable = this.schedulingList[i];
          // console.log("schedulable.nextEventTime <= this.getCurrentTime() + this.scheduleAheadTime : ", schedulable.nextEventTime, this.getCurrentTime(), this.scheduleAheadTime);

          // While there are events that will need to play before the next interval, 
          // schedule them and advance the time pointer.

          // Alternative implementation.
          // var nextEventTime = schedulable.getNextEventTime();
          // while (nextEventTime <= this.getCurrentTime() + this.scheduleAheadTime) {
          //   nextEventTime = schedulable.makeNextEvent();
          // }

          while (schedulable.getNextEventTime() <= this.getCurrentTime() + this.scheduleAheadTime) {
            // if (schedulable.isEnabled) {
            schedulable.makeNextEvent();
            schedulable.computeNextEventTime();
            // } else {
            // schedulable.setNextEventTime(undefined); // ensure a false value to stop the scheduling loop
            // }
          }
        }
        // Store the setTimeout ID to remove it later.
        this.timerID = setTimeout(function() {
          that.run();
        }, that.schedulingPeriod * 1000);
      }
    },

    /**
     * Get scheduling period.
     * @public
     */
    getSchedulingPeriod: {
      enumerable: true,
      value: function() {
        return this.schedulingPeriod;
      }
    },

    /**
     * Get current time from the Web Audio context.
     * @public
     */
    getCurrentTime: {
      enumerable: true,
      value: function() {
        return this.context.currentTime;
      }
    },

  }; // End of object definition.


  // Instantiate an object.
  var scheduler = Object.create({}, schedulerObject);
  return scheduler.init(audioContext);
};


// CommonJS function export
module.exports = createScheduler;