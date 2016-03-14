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

// scheduler factory
var getScheduler = exports.getScheduler = function getScheduler() {
  var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _audioContext2.default : arguments[0];

  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new _scheduler2.default({ audioContext: audioContext });
    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

var getSimpleScheduler = exports.getSimpleScheduler = function getSimpleScheduler() {
  var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _audioContext2.default : arguments[0];

  var simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new _simpleScheduler2.default({ audioContext: audioContext });
    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZhY3Rvcmllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxlQUFlLHVCQUFmOztBQUNOLElBQU0scUJBQXFCLHVCQUFyQjs7O0FBR0MsSUFBTSxzQ0FBZSxTQUFmLFlBQWUsR0FBNkM7TUFBcEMsMkdBQW9DOztBQUN2RSxNQUFJLFlBQVksYUFBYSxHQUFiLENBQWlCLFlBQWpCLENBQVosQ0FEbUU7O0FBR3ZFLE1BQUksQ0FBQyxTQUFELEVBQVk7QUFDZCxnQkFBWSx3QkFBYyxFQUFFLGNBQWMsWUFBZCxFQUFoQixDQUFaLENBRGM7QUFFZCxpQkFBYSxHQUFiLENBQWlCLFlBQWpCLEVBQStCLFNBQS9CLEVBRmM7R0FBaEI7O0FBS0EsU0FBTyxTQUFQLENBUnVFO0NBQTdDOztBQVdyQixJQUFNLGtEQUFxQixTQUFyQixrQkFBcUIsR0FBNkM7TUFBcEMsMkdBQW9DOztBQUM3RSxNQUFJLGtCQUFrQixtQkFBbUIsR0FBbkIsQ0FBdUIsWUFBdkIsQ0FBbEIsQ0FEeUU7O0FBRzdFLE1BQUksQ0FBQyxlQUFELEVBQWtCO0FBQ3BCLHNCQUFrQiw4QkFBb0IsRUFBRSxjQUFjLFlBQWQsRUFBdEIsQ0FBbEIsQ0FEb0I7QUFFcEIsdUJBQW1CLEdBQW5CLENBQXVCLFlBQXZCLEVBQXFDLGVBQXJDLEVBRm9CO0dBQXRCOztBQUtBLFNBQU8sZUFBUCxDQVI2RTtDQUE3QyIsImZpbGUiOiJmYWN0b3JpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzY2hlZHVsZXJzIHNob3VsZCBiZSBzaW5nbGV0b25zXG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcic7XG5pbXBvcnQgU2ltcGxlU2NoZWR1bGVyIGZyb20gJy4vc2ltcGxlLXNjaGVkdWxlcic7XG5cbmNvbnN0IHNjaGVkdWxlck1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBzaW1wbGVTY2hlZHVsZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xuXG4vLyBzY2hlZHVsZXIgZmFjdG9yeVxuZXhwb3J0IGNvbnN0IGdldFNjaGVkdWxlciA9IGZ1bmN0aW9uKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgbGV0IHNjaGVkdWxlciA9IHNjaGVkdWxlck1hcC5nZXQoYXVkaW9Db250ZXh0KTtcblxuICBpZiAoIXNjaGVkdWxlcikge1xuICAgIHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoeyBhdWRpb0NvbnRleHQ6IGF1ZGlvQ29udGV4dCB9KTtcbiAgICBzY2hlZHVsZXJNYXAuc2V0KGF1ZGlvQ29udGV4dCwgc2NoZWR1bGVyKTtcbiAgfVxuXG4gIHJldHVybiBzY2hlZHVsZXI7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2ltcGxlU2NoZWR1bGVyID0gZnVuY3Rpb24oYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2ltcGxlU2NoZWR1bGVyID0gc2ltcGxlU2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2ltcGxlU2NoZWR1bGVyKSB7XG4gICAgc2ltcGxlU2NoZWR1bGVyID0gbmV3IFNpbXBsZVNjaGVkdWxlcih7IGF1ZGlvQ29udGV4dDogYXVkaW9Db250ZXh0IH0pO1xuICAgIHNpbXBsZVNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzaW1wbGVTY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNpbXBsZVNjaGVkdWxlcjtcbn07XG4iXX0=