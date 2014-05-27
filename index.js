/**
 * @fileoverview WAVE audio library element: a web audio scheduler.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 3.4.0
 */

var nodeUuid = require("node-uuid");

/**
 * Function invocation pattern for object creation.
 * @public
 */

var createScheduler = function createScheduler(optName) {
  'use strict';

  // Ensure global availability of an "audioContext" instance of web audio AudioContext.
  window.audioContext = window.audioContext || new AudioContext() || new webkitAudioContext();

  /**
   * ECMAScript5 property descriptors object.
   */
  var schedulerObject = {

    // Properties with default values
    schedulingPeriod: {
      writable: true,
      value: 0.025 // How frequently to call scheduling function (sec)
    },
    scheduleAheadTime: {
      writable: true,
      value: 0.1 // How far ahead to schedule audio (sec)
    },
    schedulingList: {
      writable: true,
      value: []
    },
    isScheduling: {
      writable: true,
      value: false
    },
    name: {
      writable: true,
      value: "Scheduler"
    },

    // Other properties
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
      value: function(optName) {

        this.name = optName;

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
        var scheduledObject = null;
        var nextEventTime = null;
        var i = null;

        for (i = 0; i < this.schedulingList.length; i++) {
          // For each scheduled object.
          scheduledObject = this.schedulingList[i];

          // While there are events that will need to play before the next interval, 
          // schedule them and advance the time pointer.
          nextEventTime = scheduledObject.getNextTime();
          while (nextEventTime <= this.getCurrentTime() + this.scheduleAheadTime) {
            nextEventTime = scheduledObject.makeEventAndComputeNextTime();
          }
        }
        // Store the setTimeout ID to allow removing.
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
        return audioContext.currentTime;
      }
    },

  }; // End of object definition.


  // Instantiate an object.
  var scheduler = Object.create({}, schedulerObject);
  return scheduler.init(optName);
};


// CommonJS function export
module.exports = createScheduler;