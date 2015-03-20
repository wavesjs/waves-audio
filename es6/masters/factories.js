// schedulers should be singletons
var Scheduler = require('./scheduler');
var SimpleScheduler = require('./simple-scheduler');
var defaultAudioContext = require('../core/audio-context');
var schedulerMap = new WeakMap();

// scheduler factory
module.exports.getScheduler = function(audioContext = defaultAudioContext) {
  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new Scheduler({audioContext: audioContext});
    schedulerMap.set(audioContext, scheduler);
  } else if (scheduler instanceof SimpleScheduler) {
    throw new Error("Scheduler type mismatch for audio context " + audioContext);
  }

  return scheduler;
};

module.exports.getSimpleScheduler = function(audioContext = defaultAudioContext) {
  var simpleScheduler = schedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new SimpleScheduler({audioContext: audioContext});
    schedulerMap.set(audioContext, simpleScheduler);
  } else if (simpleScheduler instanceof Scheduler) {
    throw new Error("Scheduler type mismatch for audio context " + audioContext);
  }

  return simpleScheduler;
};
