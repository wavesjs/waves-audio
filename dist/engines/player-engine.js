"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var _interopRequire = require("babel-runtime/helpers/interop-require")["default"];

var AudioTimeEngine = _interopRequire(require("../core/audio-time-engine"));

function optOrDef(opt, def) {
  if (opt !== undefined) {
    return opt;
  }return def;
}

var PlayerEngine = (function (_AudioTimeEngine) {
  function PlayerEngine() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, PlayerEngine);

    _get(_core.Object.getPrototypeOf(PlayerEngine.prototype), "constructor", this).call(this, options.audioContext);

    this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = optOrDef(options.buffer, null);

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     * @type {AudioBuffer}
     */
    this.fadeTime = optOrDef(options.fadeTime, 0.005);

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;

    this.__bufferSource = null;
    this.__envNode = null;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = optOrDef(options.gain, 1);

    this.__cyclic = optOrDef(options.cyclic, false);

    this.outputNode = this.__gainNode;
  }

  _inherits(PlayerEngine, _AudioTimeEngine);

  _createClass(PlayerEngine, {
    __start: {
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
    },
    __halt: {
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
    },
    syncSpeed: {

      // TimeEngine method (speed-controlled interface)

      value: function syncSpeed(time, position, speed) {
        var seek = arguments[3] === undefined ? false : arguments[3];

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
    },
    cyclic: {

      /**
       * Set whether the audio buffer is considered as cyclic
       * @param {Bool} cyclic whether the audio buffer is considered as cyclic
       */

      set: function (cyclic) {
        if (cyclic !== this.__cyclic) {
          var time = this.currentTime;
          var position = this.currentosition;

          this.__halt(time);
          this.__cyclic = cyclic;

          if (this.__speed !== 0) this.__start(time, position, this.__speed);
        }
      },

      /**
       * Get whether the audio buffer is considered as cyclic
       * @return {Bool} whether the audio buffer is considered as cyclic
       */
      get: function () {
        return this.__cyclic;
      }
    },
    gain: {

      /**
       * Set gain
       * @param {Number} value linear gain factor
       */

      set: function (value) {
        var time = this.currentTime;
        this.__gainNode.cancelScheduledValues(time);
        this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
        this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
      },

      /**
       * Get gain
       * @return {Number} current gain
       */
      get: function () {
        return this.__gainNode.gain.value;
      }
    },
    bufferDuration: {

      /**
       * Get buffer duration
       * @return {Number} current buffer duration
       */

      get: function () {
        if (this.buffer) return this.buffer.duration;

        return 0;
      }
    }
  });

  return PlayerEngine;
})(AudioTimeEngine);

module.exports = PlayerEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9lbmdpbmVzL3BsYXllci1lbmdpbmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7SUFBTyxlQUFlLDJCQUFNLDJCQUEyQjs7QUFFdkQsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUMxQixNQUFHLEdBQUcsS0FBSyxTQUFTO0FBQ2xCLFdBQU8sR0FBRyxDQUFDO0dBQUEsQUFFYixPQUFPLEdBQUcsQ0FBQztDQUNaOztJQUVvQixZQUFZO0FBQ3BCLFdBRFEsWUFBWSxHQUNMO1FBQWQsT0FBTyxnQ0FBRyxFQUFFOzswQkFETCxZQUFZOztBQUU3QixxQ0FGaUIsWUFBWSw2Q0FFdkIsT0FBTyxDQUFDLFlBQVksRUFBRTs7QUFFNUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Ozs7OztBQU10QixRQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNN0MsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFbEQsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBRWpCLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUV0QixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDakQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUV2RCxRQUFJLENBQUMsUUFBUSxHQUFHLFFB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dkIsY0FBSSxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsRUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5QztPQUNGOzs7Ozs7V0FNUyxZQUFHO0FBQ1gsZUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO09BQ3RCOztBQWlCRyxRQUFJOzs7Ozs7O1dBWEEsVUFBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO0FBQzVCLFlBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pFLFlBQUksQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDbEU7Ozs7OztXQU1PLFlBQUc7QUFDVCxlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztPQUNuQzs7QUFNRyxrQkFBYzs7Ozs7OztXQUFBLFlBQUc7QUFDbkIsWUFBRyxJQUFJLENBQUMsTUFBTSxFQUNaLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRTlCLGVBQU8sQ0FBQyxDQUFDO09BQ1Y7Ozs7U0FuSmtCLFlBQVk7R0FBUyxlQUFlOztpQkFBcEMsWUFBWSIsImZpbGUiOiJlczYvZW5naW5lcy9wbGF5ZXItZW5naW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLnRyYW5zcG9ydCA9IG51bGw7IC8vIHNldCB3aGVuIGFkZGVkIHRvIHRyYW5zcG9ydGVyXG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBGYWRlIHRpbWUgZm9yIGNoYWluaW5nIHNlZ21lbnRzIChlLmcuIGluIHN0YXJ0LCBzdG9wLCBhbmQgc2VlaylcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5mYWRlVGltZSA9IG9wdE9yRGVmKG9wdGlvbnMuZmFkZVRpbWUsIDAuMDA1KTtcblxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5fX2N5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBfX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLl9fY3ljbGljICYmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pKSB7XG4gICAgICAgIHZhciBwaGFzZSA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHBvc2l0aW9uID0gKHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSkpICogYnVmZmVyRHVyYXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA+PSAwICYmIHBvc2l0aW9uIDwgYnVmZmVyRHVyYXRpb24gJiYgc3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmNvbm5lY3QodGhpcy5fX2dhaW5Ob2RlKTtcblxuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNwZWVkO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3AgPSB0aGlzLl9fY3ljbGljO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IDA7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcEVuZCA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0YXJ0KHRpbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMuX19lbnZOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX2hhbHQodGltZSkge1xuICAgIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5fX2Vudk5vZGUuZ2Fpbi52YWx1ZSwgdGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RvcCh0aW1lICsgdGhpcy5mYWRlVGltZSk7XG5cbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgICAgdGhpcy5fX2Vudk5vZGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmIChzZWVrIHx8IGxhc3RTcGVlZCAqIHNwZWVkIDwgMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCB8fCBzZWVrKSB7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShzcGVlZCwgdGltZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEBwYXJhbSB7Qm9vbH0gY3ljbGljIHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKi9cbiAgc2V0IGN5Y2xpYyhjeWNsaWMpIHtcbiAgICBpZiAoY3ljbGljICE9PSB0aGlzLl9fY3ljbGljKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmN1cnJlbnRvc2l0aW9uO1xuXG4gICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIHRoaXMuX19jeWNsaWMgPSBjeWNsaWM7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgdGhpcy5fX3NwZWVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKiBAcmV0dXJuIHtCb29sfSB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICovXG4gIGdldCBjeWNsaWMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jeWNsaWM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuc2V0VmFsdWVBdFRpbWUodGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYnVmZmVyIGR1cmF0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBidWZmZXIgZHVyYXRpb25cbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZih0aGlzLmJ1ZmZlcilcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgIHJldHVybiAwO1xuICB9XG59XG4iXX0=