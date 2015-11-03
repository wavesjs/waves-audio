// schedulers should be singletons
'use strict';

var _WeakMap = require('babel-runtime/core-js/weak-map')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreAudioContext = require('../core/audio-context');

var _coreAudioContext2 = _interopRequireDefault(_coreAudioContext);

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _simpleScheduler = require('./simple-scheduler');

var _simpleScheduler2 = _interopRequireDefault(_simpleScheduler);

var schedulerMap = new _WeakMap();
var simpleSchedulerMap = new _WeakMap();

// scheduler factory
var getScheduler = function getScheduler() {
  var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _coreAudioContext2['default'] : arguments[0];

  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new _scheduler2['default']({ audioContext: audioContext });
    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

var getSimpleScheduler = function getSimpleScheduler() {
  var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _coreAudioContext2['default'] : arguments[0];

  var simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new _simpleScheduler2['default']({ audioContext: audioContext });
    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};

exports['default'] = { getScheduler: getScheduler, getSimpleScheduler: getSimpleScheduler };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9tYXN0ZXJzL2ZhY3Rvcmllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztnQ0FDZ0MsdUJBQXVCOzs7O3lCQUNqQyxhQUFhOzs7OytCQUNQLG9CQUFvQjs7OztBQUVoRCxJQUFNLFlBQVksR0FBRyxjQUFhLENBQUM7QUFDbkMsSUFBTSxrQkFBa0IsR0FBRyxjQUFhLENBQUM7OztBQUd6QyxJQUFNLFlBQVksR0FBRyxTQUFmLFlBQVksR0FBZ0Q7TUFBcEMsWUFBWTs7QUFDeEMsTUFBSSxTQUFTLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFL0MsTUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNkLGFBQVMsR0FBRywyQkFBYyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQzFELGdCQUFZLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztHQUMzQzs7QUFFRCxTQUFPLFNBQVMsQ0FBQztDQUNsQixDQUFDOztBQUVGLElBQU0sa0JBQWtCLEdBQUcsU0FBckIsa0JBQWtCLEdBQWdEO01BQXBDLFlBQVk7O0FBQzlDLE1BQUksZUFBZSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFM0QsTUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNwQixtQkFBZSxHQUFHLGlDQUFvQixFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLHNCQUFrQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7R0FDdkQ7O0FBRUQsU0FBTyxlQUFlLENBQUM7Q0FDeEIsQ0FBQzs7cUJBRWEsRUFBRSxZQUFZLEVBQVosWUFBWSxFQUFFLGtCQUFrQixFQUFsQixrQkFBa0IsRUFBRSIsImZpbGUiOiJlczYvbWFzdGVycy9mYWN0b3JpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBzY2hlZHVsZXJzIHNob3VsZCBiZSBzaW5nbGV0b25zXG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcic7XG5pbXBvcnQgU2ltcGxlU2NoZWR1bGVyIGZyb20gJy4vc2ltcGxlLXNjaGVkdWxlcic7XG5cbmNvbnN0IHNjaGVkdWxlck1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBzaW1wbGVTY2hlZHVsZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xuXG4vLyBzY2hlZHVsZXIgZmFjdG9yeVxuY29uc3QgZ2V0U2NoZWR1bGVyID0gZnVuY3Rpb24oYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2NoZWR1bGVyID0gc2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2NoZWR1bGVyKSB7XG4gICAgc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih7IGF1ZGlvQ29udGV4dDogYXVkaW9Db250ZXh0IH0pO1xuICAgIHNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNjaGVkdWxlcjtcbn07XG5cbmNvbnN0IGdldFNpbXBsZVNjaGVkdWxlciA9IGZ1bmN0aW9uKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgbGV0IHNpbXBsZVNjaGVkdWxlciA9IHNpbXBsZVNjaGVkdWxlck1hcC5nZXQoYXVkaW9Db250ZXh0KTtcblxuICBpZiAoIXNpbXBsZVNjaGVkdWxlcikge1xuICAgIHNpbXBsZVNjaGVkdWxlciA9IG5ldyBTaW1wbGVTY2hlZHVsZXIoeyBhdWRpb0NvbnRleHQ6IGF1ZGlvQ29udGV4dCB9KTtcbiAgICBzaW1wbGVTY2hlZHVsZXJNYXAuc2V0KGF1ZGlvQ29udGV4dCwgc2ltcGxlU2NoZWR1bGVyKTtcbiAgfVxuXG4gIHJldHVybiBzaW1wbGVTY2hlZHVsZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7IGdldFNjaGVkdWxlciwgZ2V0U2ltcGxlU2NoZWR1bGVyIH07XG4iXX0=