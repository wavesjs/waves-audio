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

var _audioTimeEngine = require('../core/audio-time-engine');

var _audioTimeEngine2 = _interopRequireDefault(_audioTimeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

/**
 * Used with a buffer to serve audio files.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/player-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const playerEngine = audio.PlayerEngine();
 * const playControl = new audio.PlayControl(playerEngine);
 *
 * playControl.start();
 *
 * @param {Object} [options={}] - Default options
 * @param {Number} [options.buffer=1] - Audio buffer
 * @param {Number} [options.fadeTime=600] - Fade time for chaining segments
 * @param {Number} [options.cyclic=false] - Loop mode
 * @param {Number} [options.gain=1] - Gain
 */

var PlayerEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(PlayerEngine, _AudioTimeEngine);

  function PlayerEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, PlayerEngine);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerEngine.__proto__ || (0, _getPrototypeOf2.default)(PlayerEngine)).call(this, options.audioContext));

    _this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     *
     * @type {AudioBuffer}
     * @name buffer
     * @memberof PlayerEngine
     * @instance
     * @default null
     */
    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     *
     * @type {Number}
     * @name fadeTime
     * @memberof PlayerEngine
     * @instance
     * @default 0.005
     */
    _this.fadeTime = optOrDef(options.fadeTime, 0.005);

    _this.__time = 0;
    _this.__position = 0;
    _this.__speed = 0;

    _this.__bufferSource = null;
    _this.__envNode = null;

    _this.__gainNode = _this.audioContext.createGain();
    _this.__gainNode.gain.value = optOrDef(options.gain, 1);

    _this.__cyclic = optOrDef(options.cyclic, false);

    _this.outputNode = _this.__gainNode;
    return _this;
  }

  (0, _createClass3.default)(PlayerEngine, [{
    key: '__start',
    value: function __start(time, position, speed) {
      var audioContext = this.audioContext;

      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

        if (this.__cyclic && (position < 0 || position >= bufferDuration)) {
          var phase = position / bufferDuration;
          position = (phase - Math.floor(phase)) * bufferDuration;
        }

        if (position >= 0 && position < bufferDuration && speed > 0) {
          this.__envNode = audioContext.createGain();
          this.__envNode.gain.setValueAtTime(0, time);
          this.__envNode.gain.linearRampToValueAtTime(1, time + this.fadeTime);
          this.__envNode.connect(this.__gainNode);

          this.__bufferSource = audioContext.createBufferSource();
          this.__bufferSource.buffer = this.buffer;
          this.__bufferSource.playbackRate.value = speed;
          this.__bufferSource.loop = this.__cyclic;
          this.__bufferSource.loopStart = 0;
          this.__bufferSource.loopEnd = bufferDuration;
          this.__bufferSource.start(time, position);
          this.__bufferSource.connect(this.__envNode);
        }
      }
    }
  }, {
    key: '__halt',
    value: function __halt(time) {
      if (this.__bufferSource) {
        this.__envNode.gain.cancelScheduledValues(time);
        this.__envNode.gain.setValueAtTime(this.__envNode.gain.value, time);
        this.__envNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
        this.__bufferSource.stop(time + this.fadeTime);

        this.__bufferSource = null;
        this.__envNode = null;
      }
    }

    // TimeEngine method (speed-controlled interface)

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var lastSpeed = this.__speed;

      if (speed !== lastSpeed || seek) {
        if (seek || lastSpeed * speed < 0) {
          this.__halt(time);
          this.__start(time, position, speed);
        } else if (lastSpeed === 0 || seek) {
          this.__start(time, position, speed);
        } else if (speed === 0) {
          this.__halt(time);
        } else if (this.__bufferSource) {
          this.__bufferSource.playbackRate.setValueAtTime(speed, time);
        }

        this.__speed = speed;
      }
    }

    /**
     * Set whether the audio buffer is considered as cyclic
     * @type {Bool}
     * @name cyclic
     * @memberof PlayerEngine
     * @instance
     */

  }, {
    key: 'cyclic',
    set: function set(cyclic) {
      if (cyclic !== this.__cyclic) {
        var time = this.currentTime;
        var position = this.currentosition;

        this.__halt(time);
        this.__cyclic = cyclic;

        if (this.__speed !== 0) this.__start(time, position, this.__speed);
      }
    },
    get: function get() {
      return this.__cyclic;
    }

    /**
     * Linear gain factor
     * @type {Number}
     * @name gain
     * @memberof PlayerEngine
     * @instance
     */

  }, {
    key: 'gain',
    set: function set(value) {
      var time = this.currentTime;
      this.__gainNode.cancelScheduledValues(time);
      this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
      this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
    },
    get: function get() {
      return this.__gainNode.gain.value;
    }

    /**
     * Get buffer duration
     * @type {Number}
     * @name bufferDuration
     * @memberof PlayerEngine
     * @instance
     * @readonly
     */

  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) return this.buffer.duration;

      return 0;
    }
  }]);
  return PlayerEngine;
}(_audioTimeEngine2.default);

exports.default = PlayerEngine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYXllci1lbmdpbmUuanMiXSwibmFtZXMiOlsib3B0T3JEZWYiLCJvcHQiLCJkZWYiLCJ1bmRlZmluZWQiLCJQbGF5ZXJFbmdpbmUiLCJvcHRpb25zIiwiYXVkaW9Db250ZXh0IiwidHJhbnNwb3J0IiwiYnVmZmVyIiwiZmFkZVRpbWUiLCJfX3RpbWUiLCJfX3Bvc2l0aW9uIiwiX19zcGVlZCIsIl9fYnVmZmVyU291cmNlIiwiX19lbnZOb2RlIiwiX19nYWluTm9kZSIsImNyZWF0ZUdhaW4iLCJnYWluIiwidmFsdWUiLCJfX2N5Y2xpYyIsImN5Y2xpYyIsIm91dHB1dE5vZGUiLCJ0aW1lIiwicG9zaXRpb24iLCJzcGVlZCIsImJ1ZmZlckR1cmF0aW9uIiwiZHVyYXRpb24iLCJwaGFzZSIsIk1hdGgiLCJmbG9vciIsInNldFZhbHVlQXRUaW1lIiwibGluZWFyUmFtcFRvVmFsdWVBdFRpbWUiLCJjb25uZWN0IiwiY3JlYXRlQnVmZmVyU291cmNlIiwicGxheWJhY2tSYXRlIiwibG9vcCIsImxvb3BTdGFydCIsImxvb3BFbmQiLCJzdGFydCIsImNhbmNlbFNjaGVkdWxlZFZhbHVlcyIsInN0b3AiLCJzZWVrIiwibGFzdFNwZWVkIiwiX19oYWx0IiwiX19zdGFydCIsImN1cnJlbnRUaW1lIiwiY3VycmVudG9zaXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUVBLFNBQVNBLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCQyxHQUF2QixFQUE0QjtBQUMxQixNQUFHRCxRQUFRRSxTQUFYLEVBQ0UsT0FBT0YsR0FBUDs7QUFFRixTQUFPQyxHQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJNRSxZOzs7QUFDSiwwQkFBMEI7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7QUFBQTs7QUFBQSxrSkFDbEJBLFFBQVFDLFlBRFU7O0FBR3hCLFVBQUtDLFNBQUwsR0FBaUIsSUFBakIsQ0FId0IsQ0FH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Z0JDLE1BQWhCOztBQUVBLFlBQUksS0FBS1IsT0FBTCxLQUFpQixDQUFyQixFQUNFLEtBQUtnQyxPQUFMLENBQWF0QixJQUFiLEVBQW1CQyxRQUFuQixFQUE2QixLQUFLWCxPQUFsQztBQUNIO0FBQ0YsSzt3QkFFWTtBQUNYLGFBQU8sS0FBS08sUUFBWjtBQUNEOztBQUVEOzs7Ozs7Ozs7O3NCQU9TRCxLLEVBQU87QUFDZCxVQUFJSSxPQUFPLEtBQUt1QixXQUFoQjtBQUNBLFdBQUs5QixVQUFMLENBQWdCd0IscUJBQWhCLENBQXNDakIsSUFBdEM7QUFDQSxXQUFLUCxVQUFMLENBQWdCZSxjQUFoQixDQUErQixLQUFLZixVQUFMLENBQWdCRSxJQUFoQixDQUFxQkMsS0FBcEQsRUFBMkRJLElBQTNEO0FBQ0EsV0FBS1AsVUFBTCxDQUFnQmdCLHVCQUFoQixDQUF3QyxDQUF4QyxFQUEyQ1QsT0FBTyxLQUFLYixRQUF2RDtBQUNELEs7d0JBRVU7QUFDVCxhQUFPLEtBQUtNLFVBQUwsQ0FBZ0JFLElBQWhCLENBQXFCQyxLQUE1QjtBQUNEOztBQUVEOzs7Ozs7Ozs7Ozt3QkFRcUI7QUFDbkIsVUFBRyxLQUFLVixNQUFSLEVBQ0UsT0FBTyxLQUFLQSxNQUFMLENBQVlrQixRQUFuQjs7QUFFRixhQUFPLENBQVA7QUFDRDs7Ozs7a0JBR1l0QixZIiwiZmlsZSI6InBsYXllci1lbmdpbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogVXNlZCB3aXRoIGEgYnVmZmVyIHRvIHNlcnZlIGF1ZGlvIGZpbGVzLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvcGxheWVyLWVuZ2luZS5odG1sfVxuICpcbiAqIEBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZVxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHBsYXllckVuZ2luZSA9IGF1ZGlvLlBsYXllckVuZ2luZSgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgYXVkaW8uUGxheUNvbnRyb2wocGxheWVyRW5naW5lKTtcbiAqXG4gKiBwbGF5Q29udHJvbC5zdGFydCgpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5idWZmZXI9MV0gLSBBdWRpbyBidWZmZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5mYWRlVGltZT02MDBdIC0gRmFkZSB0aW1lIGZvciBjaGFpbmluZyBzZWdtZW50c1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmN5Y2xpYz1mYWxzZV0gLSBMb29wIG1vZGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gR2FpblxuICovXG5jbGFzcyBQbGF5ZXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLnRyYW5zcG9ydCA9IG51bGw7IC8vIHNldCB3aGVuIGFkZGVkIHRvIHRyYW5zcG9ydGVyXG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKlxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKiBAbmFtZSBidWZmZXJcbiAgICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogRmFkZSB0aW1lIGZvciBjaGFpbmluZyBzZWdtZW50cyAoZS5nLiBpbiBzdGFydCwgc3RvcCwgYW5kIHNlZWspXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGZhZGVUaW1lXG4gICAgICogQG1lbWJlcm9mIFBsYXllckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICovXG4gICAgdGhpcy5mYWRlVGltZSA9IG9wdE9yRGVmKG9wdGlvbnMuZmFkZVRpbWUsIDAuMDA1KTtcblxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5fX2N5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBfX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLl9fY3ljbGljICYmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pKSB7XG4gICAgICAgIHZhciBwaGFzZSA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHBvc2l0aW9uID0gKHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSkpICogYnVmZmVyRHVyYXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA+PSAwICYmIHBvc2l0aW9uIDwgYnVmZmVyRHVyYXRpb24gJiYgc3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmNvbm5lY3QodGhpcy5fX2dhaW5Ob2RlKTtcblxuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNwZWVkO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3AgPSB0aGlzLl9fY3ljbGljO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IDA7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcEVuZCA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0YXJ0KHRpbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMuX19lbnZOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX2hhbHQodGltZSkge1xuICAgIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5fX2Vudk5vZGUuZ2Fpbi52YWx1ZSwgdGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RvcCh0aW1lICsgdGhpcy5mYWRlVGltZSk7XG5cbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgICAgdGhpcy5fX2Vudk5vZGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmIChzZWVrIHx8IGxhc3RTcGVlZCAqIHNwZWVkIDwgMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCB8fCBzZWVrKSB7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShzcGVlZCwgdGltZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEB0eXBlIHtCb29sfVxuICAgKiBAbmFtZSBjeWNsaWNcbiAgICogQG1lbWJlcm9mIFBsYXllckVuZ2luZVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBjeWNsaWMoY3ljbGljKSB7XG4gICAgaWYgKGN5Y2xpYyAhPT0gdGhpcy5fX2N5Y2xpYykge1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jdXJyZW50b3NpdGlvbjtcblxuICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICB0aGlzLl9fY3ljbGljID0gY3ljbGljO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN5Y2xpYygpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N5Y2xpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgZ2FpblxuICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuc2V0VmFsdWVBdFRpbWUodGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gIH1cblxuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvblxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBidWZmZXJEdXJhdGlvblxuICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZih0aGlzLmJ1ZmZlcilcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgIHJldHVybiAwO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckVuZ2luZTtcbiJdfQ==