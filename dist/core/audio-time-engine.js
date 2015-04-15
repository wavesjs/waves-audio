"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("./time-engine");
var defaultAudioContext = require("./audio-context");

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMxQyxJQUFJLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOzs7Ozs7SUFLL0MsZUFBZTtBQUNSLFdBRFAsZUFBZSxHQUM2QjtRQUFwQyxZQUFZLGdDQUFHLG1CQUFtQjs7MEJBRDFDLGVBQWU7O0FBRWpCLHFDQUZFLGVBQWUsNkNBRVQ7O0FBRVIsUUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7QUFDakMsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7R0FDeEI7O1lBTkcsZUFBZTs7ZUFBZixlQUFlO0FBUW5CLFdBQU87YUFBQSxpQkFBQyxNQUFNLEVBQUU7QUFDZCxZQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQyxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELGNBQVU7YUFBQSxvQkFBQyxVQUFVLEVBQUU7QUFDckIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkMsZUFBTyxJQUFJLENBQUM7T0FDYjs7OztTQWhCRyxlQUFlO0dBQVMsVUFBVTs7QUFtQnhDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6ImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuL3RpbWUtZW5naW5lXCIpO1xudmFyIGRlZmF1bHRBdWRpb0NvbnRleHQgPSByZXF1aXJlKFwiLi9hdWRpby1jb250ZXh0XCIpO1xuXG4vKipcbiAqIEBjbGFzcyBBdWRpb1RpbWVFbmdpbmVcbiAqL1xuY2xhc3MgQXVkaW9UaW1lRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZXtcbiAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcbiAgICB0aGlzLm91dHB1dE5vZGUgPSBudWxsO1xuICB9XG5cbiAgY29ubmVjdCh0YXJnZXQpIHtcbiAgICB0aGlzLm91dHB1dE5vZGUuY29ubmVjdCh0YXJnZXQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGlzY29ubmVjdChjb25uZWN0aW9uKSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmRpc2Nvbm5lY3QoY29ubmVjdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb1RpbWVFbmdpbmU7XG4iXX0=