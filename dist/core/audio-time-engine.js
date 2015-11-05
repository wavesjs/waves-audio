'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _timeEngine = require('./time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _audioContext = require('./audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

/**
 * @class AudioTimeEngine
 */

var AudioTimeEngine = (function (_TimeEngine) {
  _inherits(AudioTimeEngine, _TimeEngine);

  function AudioTimeEngine() {
    var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _audioContext2['default'] : arguments[0];

    _classCallCheck(this, AudioTimeEngine);

    _get(Object.getPrototypeOf(AudioTimeEngine.prototype), 'constructor', this).call(this);

    this.audioContext = audioContext;
    this.outputNode = null;
  }

  _createClass(AudioTimeEngine, [{
    key: 'connect',
    value: function connect(target) {
      this.outputNode.connect(target);
      return this;
    }
  }, {
    key: 'disconnect',
    value: function disconnect(connection) {
      this.outputNode.disconnect(connection);
      return this;
    }
  }]);

  return AudioTimeEngine;
})(_timeEngine2['default']);

exports['default'] = AudioTimeEngine;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7MEJBQXVCLGVBQWU7Ozs7NEJBQ04saUJBQWlCOzs7Ozs7OztJQUs1QixlQUFlO1lBQWYsZUFBZTs7QUFDdkIsV0FEUSxlQUFlLEdBQ2M7UUFBcEMsWUFBWTs7MEJBREwsZUFBZTs7QUFFaEMsK0JBRmlCLGVBQWUsNkNBRXhCOztBQUVSLFFBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ3hCOztlQU5rQixlQUFlOztXQVEzQixpQkFBQyxNQUFNLEVBQUU7QUFDZCxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFUyxvQkFBQyxVQUFVLEVBQUU7QUFDckIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkMsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1NBaEJrQixlQUFlOzs7cUJBQWYsZUFBZSIsImZpbGUiOiJlczYvY29yZS9hdWRpby10aW1lLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4vdGltZS1lbmdpbmUnO1xuaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi9hdWRpby1jb250ZXh0JztcblxuLyoqXG4gKiBAY2xhc3MgQXVkaW9UaW1lRW5naW5lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvVGltZUVuZ2luZSBleHRlbmRzIFRpbWVFbmdpbmV7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG4gICAgdGhpcy5vdXRwdXROb2RlID0gbnVsbDtcbiAgfVxuXG4gIGNvbm5lY3QodGFyZ2V0KSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmNvbm5lY3QodGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoY29ubmVjdGlvbikge1xuICAgIHRoaXMub3V0cHV0Tm9kZS5kaXNjb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iXX0=