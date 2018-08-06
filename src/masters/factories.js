import defaultAudioContext from '../core/audioContext';
import { Scheduler, SimpleScheduler } from 'waves-masters';

const schedulerMap = new Map();
const simpleSchedulerMap = new Map();

/**
 * Returns a unique instance of `Scheduler`
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/scheduler/index.html}}
 *
 * @global
 * @function
 * @returns {Scheduler}
 * @see Scheduler
 */
export function getScheduler(audioContext = defaultAudioContext) {
  let scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    const getTimeFunction = () => audioContext.currentTime;
    scheduler = new Scheduler(getTimeFunction);

    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

/**
 * Returns a unique instance of `SimpleScheduler`
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/simple-scheduler/index.html}}
 *
 * @global
 * @function
 * @returns {SimpleScheduler}
 * @see SimpleScheduler
 */
export function getSimpleScheduler(audioContext = defaultAudioContext) {
  let simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    const getTimeFunction = () => audioContext.currentTime;
    simpleScheduler = new SimpleScheduler(getTimeFunction);

    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};
