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

var PlayerEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(PlayerEngine, _AudioTimeEngine);

  function PlayerEngine() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, PlayerEngine);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayerEngine).call(this, options.audioContext));

    _this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     * @type {AudioBuffer}
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
      var seek = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

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
     * @param {Bool} cyclic whether the audio buffer is considered as cyclic
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
    }

    /**
     * Get whether the audio buffer is considered as cyclic
     * @return {Bool} whether the audio buffer is considered as cyclic
     */
    ,
    get: function get() {
      return this.__cyclic;
    }

    /**
     * Set gain
     * @param {Number} value linear gain factor
     */

  }, {
    key: 'gain',
    set: function set(value) {
      var time = this.currentTime;
      this.__gainNode.cancelScheduledValues(time);
      this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
      this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
    }

    /**
     * Get gain
     * @return {Number} current gain
     */
    ,
    get: function get() {
      return this.__gainNode.gain.value;
    }

    /**
     * Get buffer duration
     * @return {Number} current buffer duration
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
//# sourceMappingURL=data:application/json;base64,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QUwsQ0FBWSxRQUFaLENBRFQ7O0FBR0EsYUFBTyxDQUFQLENBSm1COzs7U0E5SUYiLCJmaWxlIjoicGxheWVyLWVuZ2luZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZSc7XG5cbmZ1bmN0aW9uIG9wdE9yRGVmKG9wdCwgZGVmKSB7XG4gIGlmKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGxheWVyRW5naW5lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgdGhpcy50cmFuc3BvcnQgPSBudWxsOyAvLyBzZXQgd2hlbiBhZGRlZCB0byB0cmFuc3BvcnRlclxuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogRmFkZSB0aW1lIGZvciBjaGFpbmluZyBzZWdtZW50cyAoZS5nLiBpbiBzdGFydCwgc3RvcCwgYW5kIHNlZWspXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqL1xuICAgIHRoaXMuZmFkZVRpbWUgPSBvcHRPckRlZihvcHRpb25zLmZhZGVUaW1lLCAwLjAwNSk7XG5cbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuXG4gICAgdGhpcy5fX2J1ZmZlclNvdXJjZSA9IG51bGw7XG4gICAgdGhpcy5fX2Vudk5vZGUgPSBudWxsO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIHRoaXMuX19jeWNsaWMgPSBvcHRPckRlZihvcHRpb25zLmN5Y2xpYywgZmFsc2UpO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5fX2N5Y2xpYyAmJiAocG9zaXRpb24gPCAwIHx8IHBvc2l0aW9uID49IGJ1ZmZlckR1cmF0aW9uKSkge1xuICAgICAgICB2YXIgcGhhc2UgPSBwb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICBwb3NpdGlvbiA9IChwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpKSAqIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgfVxuXG4gICAgICBpZiAocG9zaXRpb24gPj0gMCAmJiBwb3NpdGlvbiA8IGJ1ZmZlckR1cmF0aW9uICYmIHNwZWVkID4gMCkge1xuICAgICAgICB0aGlzLl9fZW52Tm9kZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMSwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5jb25uZWN0KHRoaXMuX19nYWluTm9kZSk7XG5cbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBzcGVlZDtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5sb29wID0gdGhpcy5fX2N5Y2xpYztcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5sb29wU3RhcnQgPSAwO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BFbmQgPSBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5zdGFydCh0aW1lLCBwb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UuY29ubmVjdCh0aGlzLl9fZW52Tm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX19oYWx0KHRpbWUpIHtcbiAgICBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuX19lbnZOb2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0b3AodGltZSArIHRoaXMuZmFkZVRpbWUpO1xuXG4gICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICAgIHRoaXMuX19lbnZOb2RlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UpXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWsgPSBmYWxzZSkge1xuICAgIHZhciBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCBzZWVrKSB7XG4gICAgICBpZiAoc2VlayB8fCBsYXN0U3BlZWQgKiBzcGVlZCA8IDApIHtcbiAgICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDAgfHwgc2Vlaykge1xuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19idWZmZXJTb3VyY2UpIHtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUuc2V0VmFsdWVBdFRpbWUoc3BlZWQsIHRpbWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKiBAcGFyYW0ge0Jvb2x9IGN5Y2xpYyB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICovXG4gIHNldCBjeWNsaWMoY3ljbGljKSB7XG4gICAgaWYgKGN5Y2xpYyAhPT0gdGhpcy5fX2N5Y2xpYykge1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jdXJyZW50b3NpdGlvbjtcblxuICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICB0aGlzLl9fY3ljbGljID0gY3ljbGljO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICogQHJldHVybiB7Qm9vbH0gd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqL1xuICBnZXQgY3ljbGljKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3ljbGljO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBnYWluXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBsaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgIHRoaXMuX19nYWluTm9kZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModGltZSk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLnNldFZhbHVlQXRUaW1lKHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlLCB0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgYnVmZmVyIGR1cmF0aW9uXG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYodGhpcy5idWZmZXIpXG4gICAgICByZXR1cm4gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICByZXR1cm4gMDtcbiAgfVxufVxuIl19