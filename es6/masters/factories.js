'use strict';

// schedulers should be singletons
var defaultAudioContext = require('../core/audio-context');
var Scheduler = require('./scheduler');
var SimpleScheduler = require('./simple-scheduler');
var schedulerMap = new WeakMap();
var simpleSchedulerMap = new WeakMap();

// scheduler factory
module.exports.getScheduler = function(audioContext = defaultAudioContext) {
  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new Scheduler({audioContext: audioContext});
    schedulerMap.set(audioContext, scheduler);
  }
  
  return scheduler;
};

module.exports.getSimpleScheduler = function(audioContext = defaultAudioContext) {
  var simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new SimpleScheduler({audioContext: audioContext});
    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};
