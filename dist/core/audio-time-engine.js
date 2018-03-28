'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _timeEngine = require('./time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _audioContext = require('./audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is the base class for all audio related time engine components. It is
 * used to handle audio related events such as the playback of a media stream.
 * It extends the TimeEngine class by the standard web audio node methods
 * connect and disconnect.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/audio-time-engine.html}
 *
 * @extends TimeEngine
 * @example
 * import audio from 'waves-audio';
 *
 * class MyEngine extends audio.AudioTimeEngine {
 *   constructor() {
 *     super();
 *     // ...
 *   }
 * }
 */
var AudioTimeEngine = function (_TimeEngine) {
  (0, _inherits3.default)(AudioTimeEngine, _TimeEngine);

  function AudioTimeEngine() {
    var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;
    (0, _classCallCheck3.default)(this, AudioTimeEngine);

    /**
     * Audio context used by the TimeEngine, default to the global audioContext
     *
     * @name audioContext
     * @type AudioContext
     * @memberof AudioTimeEngine
     * @see audioContext
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (AudioTimeEngine.__proto__ || (0, _getPrototypeOf2.default)(AudioTimeEngine)).call(this));

    _this.audioContext = audioContext;

    /**
     * Output audio node. By default the connect method connects a given node
     * to this output node.
     *
     * @name outputNode
     * @type AudioNode
     * @memberof AudioTimeEngine
     * @default null
     */
    _this.outputNode = null;
    return _this;
  }

  /**
   * Connect to an audio node (e.g. audioContext.destination)
   *
   * @param {AudioNode} target - Target audio node
   */


  (0, _createClass3.default)(AudioTimeEngine, [{
    key: 'connect',
    value: function connect(target) {
      this.outputNode.connect(target);
      return this;
    }

    /**
     * Disconnect from an audio node (e.g. audioContext.destination). If undefined
     * disconnect from all target nodes.
     *
     * @param {AudioNode} target - Target audio node.
     */

  }, {
    key: 'disconnect',
    value: function disconnect(connection) {
      this.outputNode.disconnect(connection);
      return this;
    }
  }]);
  return AudioTimeEngine;
}(_timeEngine2.default);

exports.default = AudioTimeEngine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1ZGlvLXRpbWUtZW5naW5lLmpzIl0sIm5hbWVzIjpbIkF1ZGlvVGltZUVuZ2luZSIsImF1ZGlvQ29udGV4dCIsIm91dHB1dE5vZGUiLCJ0YXJnZXQiLCJjb25uZWN0IiwiY29ubmVjdGlvbiIsImRpc2Nvbm5lY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtQk1BLGU7OztBQUNKLDZCQUFnRDtBQUFBLFFBQXBDQyxZQUFvQztBQUFBOztBQUc5Qzs7Ozs7Ozs7QUFIOEM7O0FBVzlDLFVBQUtBLFlBQUwsR0FBb0JBLFlBQXBCOztBQUVBOzs7Ozs7Ozs7QUFTQSxVQUFLQyxVQUFMLEdBQWtCLElBQWxCO0FBdEI4QztBQXVCL0M7O0FBRUQ7Ozs7Ozs7Ozs0QkFLUUMsTSxFQUFRO0FBQ2QsV0FBS0QsVUFBTCxDQUFnQkUsT0FBaEIsQ0FBd0JELE1BQXhCO0FBQ0EsYUFBTyxJQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzsrQkFNV0UsVSxFQUFZO0FBQ3JCLFdBQUtILFVBQUwsQ0FBZ0JJLFVBQWhCLENBQTJCRCxVQUEzQjtBQUNBLGFBQU8sSUFBUDtBQUNEOzs7OztrQkFHWUwsZSIsImZpbGUiOiJhdWRpby10aW1lLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4vdGltZS1lbmdpbmUnO1xuaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi9hdWRpby1jb250ZXh0JztcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBhbGwgYXVkaW8gcmVsYXRlZCB0aW1lIGVuZ2luZSBjb21wb25lbnRzLiBJdCBpc1xuICogdXNlZCB0byBoYW5kbGUgYXVkaW8gcmVsYXRlZCBldmVudHMgc3VjaCBhcyB0aGUgcGxheWJhY2sgb2YgYSBtZWRpYSBzdHJlYW0uXG4gKiBJdCBleHRlbmRzIHRoZSBUaW1lRW5naW5lIGNsYXNzIGJ5IHRoZSBzdGFuZGFyZCB3ZWIgYXVkaW8gbm9kZSBtZXRob2RzXG4gKiBjb25uZWN0IGFuZCBkaXNjb25uZWN0LlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvYXVkaW8tdGltZS1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqXG4gKiBjbGFzcyBNeUVuZ2luZSBleHRlbmRzIGF1ZGlvLkF1ZGlvVGltZUVuZ2luZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHN1cGVyKCk7XG4gKiAgICAgLy8gLi4uXG4gKiAgIH1cbiAqIH1cbiAqL1xuY2xhc3MgQXVkaW9UaW1lRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gY29udGV4dCB1c2VkIGJ5IHRoZSBUaW1lRW5naW5lLCBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYXVkaW9Db250ZXh0XG4gICAgICpcbiAgICAgKiBAbmFtZSBhdWRpb0NvbnRleHRcbiAgICAgKiBAdHlwZSBBdWRpb0NvbnRleHRcbiAgICAgKiBAbWVtYmVyb2YgQXVkaW9UaW1lRW5naW5lXG4gICAgICogQHNlZSBhdWRpb0NvbnRleHRcbiAgICAgKi9cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcblxuICAgIC8qKlxuICAgICAqIE91dHB1dCBhdWRpbyBub2RlLiBCeSBkZWZhdWx0IHRoZSBjb25uZWN0IG1ldGhvZCBjb25uZWN0cyBhIGdpdmVuIG5vZGVcbiAgICAgKiB0byB0aGlzIG91dHB1dCBub2RlLlxuICAgICAqXG4gICAgICogQG5hbWUgb3V0cHV0Tm9kZVxuICAgICAqIEB0eXBlIEF1ZGlvTm9kZVxuICAgICAqIEBtZW1iZXJvZiBBdWRpb1RpbWVFbmdpbmVcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgdGhpcy5vdXRwdXROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIGFuIGF1ZGlvIG5vZGUgKGUuZy4gYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuICAgKlxuICAgKiBAcGFyYW0ge0F1ZGlvTm9kZX0gdGFyZ2V0IC0gVGFyZ2V0IGF1ZGlvIG5vZGVcbiAgICovXG4gIGNvbm5lY3QodGFyZ2V0KSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmNvbm5lY3QodGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGZyb20gYW4gYXVkaW8gbm9kZSAoZS5nLiBhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pLiBJZiB1bmRlZmluZWRcbiAgICogZGlzY29ubmVjdCBmcm9tIGFsbCB0YXJnZXQgbm9kZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXVkaW9Ob2RlfSB0YXJnZXQgLSBUYXJnZXQgYXVkaW8gbm9kZS5cbiAgICovXG4gIGRpc2Nvbm5lY3QoY29ubmVjdGlvbikge1xuICAgIHRoaXMub3V0cHV0Tm9kZS5kaXNjb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF1ZGlvVGltZUVuZ2luZTtcbiJdfQ==