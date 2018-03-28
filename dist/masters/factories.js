'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSimpleScheduler = exports.getScheduler = undefined;

var _weakMap = require('babel-runtime/core-js/weak-map');

var _weakMap2 = _interopRequireDefault(_weakMap);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _simpleScheduler = require('./simple-scheduler');

var _simpleScheduler2 = _interopRequireDefault(_simpleScheduler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schedulerMap = new _weakMap2.default(); // schedulers should be singletons

var simpleSchedulerMap = new _weakMap2.default();

/**
 * Returns a unique instance of `Scheduler`
 *
 * @global
 * @function
 * @returns {Scheduler}
 * @see Scheduler
 */
var getScheduler = exports.getScheduler = function getScheduler() {
  var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;

  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new _scheduler2.default({ audioContext: audioContext });
    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

/**
 * Returns a unique instance of `SimpleScheduler`
 *
 * @global
 * @function
 * @returns {SimpleScheduler}
 * @see SimpleScheduler
 */
var getSimpleScheduler = exports.getSimpleScheduler = function getSimpleScheduler() {
  var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;

  var simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new _simpleScheduler2.default({ audioContext: audioContext });
    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZhY3Rvcmllcy5qcyJdLCJuYW1lcyI6WyJzY2hlZHVsZXJNYXAiLCJzaW1wbGVTY2hlZHVsZXJNYXAiLCJnZXRTY2hlZHVsZXIiLCJhdWRpb0NvbnRleHQiLCJzY2hlZHVsZXIiLCJnZXQiLCJzZXQiLCJnZXRTaW1wbGVTY2hlZHVsZXIiLCJzaW1wbGVTY2hlZHVsZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxlQUFlLHVCQUFyQixDLENBTEE7O0FBTUEsSUFBTUMscUJBQXFCLHVCQUEzQjs7QUFFQTs7Ozs7Ozs7QUFRTyxJQUFNQyxzQ0FBZSxTQUFmQSxZQUFlLEdBQTZDO0FBQUEsTUFBcENDLFlBQW9DOztBQUN2RSxNQUFJQyxZQUFZSixhQUFhSyxHQUFiLENBQWlCRixZQUFqQixDQUFoQjs7QUFFQSxNQUFJLENBQUNDLFNBQUwsRUFBZ0I7QUFDZEEsZ0JBQVksd0JBQWMsRUFBRUQsY0FBY0EsWUFBaEIsRUFBZCxDQUFaO0FBQ0FILGlCQUFhTSxHQUFiLENBQWlCSCxZQUFqQixFQUErQkMsU0FBL0I7QUFDRDs7QUFFRCxTQUFPQSxTQUFQO0FBQ0QsQ0FUTTs7QUFXUDs7Ozs7Ozs7QUFRTyxJQUFNRyxrREFBcUIsU0FBckJBLGtCQUFxQixHQUE2QztBQUFBLE1BQXBDSixZQUFvQzs7QUFDN0UsTUFBSUssa0JBQWtCUCxtQkFBbUJJLEdBQW5CLENBQXVCRixZQUF2QixDQUF0Qjs7QUFFQSxNQUFJLENBQUNLLGVBQUwsRUFBc0I7QUFDcEJBLHNCQUFrQiw4QkFBb0IsRUFBRUwsY0FBY0EsWUFBaEIsRUFBcEIsQ0FBbEI7QUFDQUYsdUJBQW1CSyxHQUFuQixDQUF1QkgsWUFBdkIsRUFBcUNLLGVBQXJDO0FBQ0Q7O0FBRUQsU0FBT0EsZUFBUDtBQUNELENBVE0iLCJmaWxlIjoiZmFjdG9yaWVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gc2NoZWR1bGVycyBzaG91bGQgYmUgc2luZ2xldG9uc1xuaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInO1xuaW1wb3J0IFNpbXBsZVNjaGVkdWxlciBmcm9tICcuL3NpbXBsZS1zY2hlZHVsZXInO1xuXG5jb25zdCBzY2hlZHVsZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3Qgc2ltcGxlU2NoZWR1bGVyTWFwID0gbmV3IFdlYWtNYXAoKTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgdW5pcXVlIGluc3RhbmNlIG9mIGBTY2hlZHVsZXJgXG4gKlxuICogQGdsb2JhbFxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7U2NoZWR1bGVyfVxuICogQHNlZSBTY2hlZHVsZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNjaGVkdWxlciA9IGZ1bmN0aW9uKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgbGV0IHNjaGVkdWxlciA9IHNjaGVkdWxlck1hcC5nZXQoYXVkaW9Db250ZXh0KTtcblxuICBpZiAoIXNjaGVkdWxlcikge1xuICAgIHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoeyBhdWRpb0NvbnRleHQ6IGF1ZGlvQ29udGV4dCB9KTtcbiAgICBzY2hlZHVsZXJNYXAuc2V0KGF1ZGlvQ29udGV4dCwgc2NoZWR1bGVyKTtcbiAgfVxuXG4gIHJldHVybiBzY2hlZHVsZXI7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSB1bmlxdWUgaW5zdGFuY2Ugb2YgYFNpbXBsZVNjaGVkdWxlcmBcbiAqXG4gKiBAZ2xvYmFsXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtTaW1wbGVTY2hlZHVsZXJ9XG4gKiBAc2VlIFNpbXBsZVNjaGVkdWxlclxuICovXG5leHBvcnQgY29uc3QgZ2V0U2ltcGxlU2NoZWR1bGVyID0gZnVuY3Rpb24oYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2ltcGxlU2NoZWR1bGVyID0gc2ltcGxlU2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2ltcGxlU2NoZWR1bGVyKSB7XG4gICAgc2ltcGxlU2NoZWR1bGVyID0gbmV3IFNpbXBsZVNjaGVkdWxlcih7IGF1ZGlvQ29udGV4dDogYXVkaW9Db250ZXh0IH0pO1xuICAgIHNpbXBsZVNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzaW1wbGVTY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNpbXBsZVNjaGVkdWxlcjtcbn07XG4iXX0=