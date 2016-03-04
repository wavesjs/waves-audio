"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var TimeEngine = _interopRequire(require("./time-engine"));

var defaultAudioContext = _interopRequire(require("./audio-context"));

/**
 * @class AudioTimeEngine
 */

var AudioTimeEngine = (function (_TimeEngine) {
  function AudioTimeEngine() {
    var audioContext = arguments[0] === undefined ? defaultAudioContext : arguments[0];

    _classCallCheck(this, AudioTimeEngine);

    _get(_core.Object.getPrototypeOf(AudioTimeEngine.prototype), "constructor", this).call(this);

    this.audioContext = audioContext;
    this.outputNode = null;
  }

  _inherits(AudioTimeEngine, _TimeEngine);

  _createClass(AudioTimeEngine, {
    connect: {
      value: function connect(target) {
        this.outputNode.connect(target);
        return this;
      }
    },
    disconnect: {
      value: function disconnect(connection) {
        this.outputNode.disconnect(connection);
        return this;
      }
    }
  });

  return AudioTimeEngine;
})(TimeEngine);

module.exports = AudioTimeEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0lBQU8sVUFBVSwyQkFBTSxlQUFlOztJQUMvQixtQkFBbUIsMkJBQU0saUJBQWlCOzs7Ozs7SUFLNUIsZUFBZTtBQUN2QixXQURRLGVBQWUsR0FDYztRQUFwQyxZQUFZLGdDQUFHLG1CQUFtQjs7MEJBRDNCLGVBQWU7O0FBRWhDLHFDQUZpQixlQUFlLDZDQUV4Qjs7QUFFUixRQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUNqQyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztHQUN4Qjs7WUFOa0IsZUFBZTs7ZUFBZixlQUFlO0FBUWxDLFdBQU87YUFBQSxpQkFBQyxNQUFNLEVBQUU7QUFDZCxZQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELGNBQVU7YUFBQSxvQkFBQyxVQUFVLEVBQUU7QUFDckIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkMsZUFBTyxJQUFJLENBQUM7T0FDYjs7OztTQWhCa0IsZUFBZTtHQUFTLFVBQVU7O2lCQUFsQyxlQUFlIiwiZmlsZSI6ImVzNi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi90aW1lLWVuZ2luZSc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuL2F1ZGlvLWNvbnRleHQnO1xuXG4vKipcbiAqIEBjbGFzcyBBdWRpb1RpbWVFbmdpbmVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9UaW1lRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZXtcbiAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcbiAgICB0aGlzLm91dHB1dE5vZGUgPSBudWxsO1xuICB9XG5cbiAgY29ubmVjdCh0YXJnZXQpIHtcbiAgICB0aGlzLm91dHB1dE5vZGUuY29ubmVjdCh0YXJnZXQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGlzY29ubmVjdChjb25uZWN0aW9uKSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmRpc2Nvbm5lY3QoY29ubmVjdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiJdfQ==