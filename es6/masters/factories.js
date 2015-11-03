// schedulers should be singletons
import defaultAudioContext from '../core/audio-context';
import Scheduler from './scheduler';
import SimpleScheduler from './simple-scheduler';

const schedulerMap = new WeakMap();
const simpleSchedulerMap = new WeakMap();

// scheduler factory
const getScheduler = function(audioContext = defaultAudioContext) {
  let scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new Scheduler({ audioContext: audioContext });
    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

const getSimpleScheduler = function(audioContext = defaultAudioContext) {
  let simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new SimpleScheduler({ audioContext: audioContext });
    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};

export default { getScheduler, getSimpleScheduler };
