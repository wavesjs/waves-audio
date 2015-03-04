
// schedulers should be singletons
var Scheduler = require('./scheduler');
var SimpleScheduler = require('./simple-scheduler');
var scheduler = null;
var simpleScheduler = null;

// scheduler factory
module.exports.getScheduler = function(audioContext) {
  if (scheduler === null) {
    scheduler = new Scheduler(audioContext, {});
  }

  return scheduler;
};

module.exports.getSimpleScheduler = function(audioContext) {
  if (simpleScheduler === null) {
    simpleScheduler = new SimpleScheduler(audioContext, {});
  }

  return simpleScheduler;
};