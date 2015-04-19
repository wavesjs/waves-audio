"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var AudioTimeEngine = require("../core/audio-time-engine");

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
        var time = this.__sync();

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztBQUUzRCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0FBQzFCLE1BQUcsR0FBRyxLQUFLLFNBQVM7QUFDbEIsV0FBTyxHQUFHLENBQUM7R0FBQSxBQUViLE9BQU8sR0FBRyxDQUFDO0NBQ1o7O0lBRUssWUFBWTtBQUNMLFdBRFAsWUFBWSxHQUNVO1FBQWQsT0FBTyxnQ0FBRyxFQUFFOzswQkFEcEIsWUFBWTs7QUFFZCxxQ0FGRSxZQUFZLDZDQUVSLE9BQU8sQ0FBQyxZQUFZLEVBQUU7O0FBRTVCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTTdDLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRWxELFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOztBQUVqQixRQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztBQUMzQixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2pELFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFdkQsUUFB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QUFHLE1BQU0sQ0FBQzs7QUFFdkIsY0FBSSxJQUFJLENBQUMsT0FBTyxLQUFLLENBQUMsRUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5QztPQUNGOzs7Ozs7V0FNUyxZQUFHO0FBQ1gsZUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO09BQ3RCOztBQWtCRyxRQUFJOzs7Ozs7O1dBWkEsVUFBQyxLQUFLLEVBQUU7QUFDZCxZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRXpCLFlBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pFLFlBQUksQ0FBQyxVQUFVLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDbEU7Ozs7OztXQU1PLFlBQUc7QUFDVCxlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztPQUNuQzs7QUFNRyxrQkFBYzs7Ozs7OztXQUFBLFlBQUc7QUFDbkIsWUFBRyxJQUFJLENBQUMsTUFBTSxFQUNaLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7O0FBRTlCLGVBQU8sQ0FBQyxDQUFDO09BQ1Y7Ozs7U0FwSkcsWUFBWTtHQUFTLGVBQWU7O0FBdUoxQyxNQUFNLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQyIsImZpbGUiOiJlczYvdXRpbHMvc2NoZWR1bGluZy1xdWV1ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIEF1ZGlvVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lXCIpO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbmNsYXNzIFBsYXllckVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIHRoaXMudHJhbnNwb3J0ID0gbnVsbDsgLy8gc2V0IHdoZW4gYWRkZWQgdG8gdHJhbnNwb3J0ZXJcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdE9yRGVmKG9wdGlvbnMuYnVmZmVyLCBudWxsKTtcblxuICAgIC8qKlxuICAgICAqIEZhZGUgdGltZSBmb3IgY2hhaW5pbmcgc2VnbWVudHMgKGUuZy4gaW4gc3RhcnQsIHN0b3AsIGFuZCBzZWVrKVxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmZhZGVUaW1lID0gb3B0T3JEZWYob3B0aW9ucy5mYWRlVGltZSwgMC4wMDUpO1xuXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgIHRoaXMuX19lbnZOb2RlID0gbnVsbDtcblxuICAgIHRoaXMuX19nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICB0aGlzLl9fY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuX19nYWluTm9kZTtcbiAgfVxuXG4gIF9fc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMuX19jeWNsaWMgJiYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBidWZmZXJEdXJhdGlvbikpIHtcbiAgICAgICAgdmFyIHBoYXNlID0gcG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgcG9zaXRpb24gPSAocGhhc2UgLSBNYXRoLmZsb29yKHBoYXNlKSkgKiBidWZmZXJEdXJhdGlvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uID49IDAgJiYgcG9zaXRpb24gPCBidWZmZXJEdXJhdGlvbiAmJiBzcGVlZCA+IDApIHtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuY29ubmVjdCh0aGlzLl9fZ2Fpbk5vZGUpO1xuXG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gc3BlZWQ7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcCA9IHRoaXMuX19jeWNsaWM7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcFN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5sb29wRW5kID0gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RhcnQodGltZSwgcG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmNvbm5lY3QodGhpcy5fX2Vudk5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9faGFsdCh0aW1lKSB7XG4gICAgaWYgKHRoaXMuX19idWZmZXJTb3VyY2UpIHtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHRpbWUpO1xuICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLl9fZW52Tm9kZS5nYWluLnZhbHVlLCB0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5zdG9wKHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcblxuICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZSA9IG51bGw7XG4gICAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKHNlZWsgfHwgbGFzdFNwZWVkICogc3BlZWQgPCAwKSB7XG4gICAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwIHx8IHNlZWspIHtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKHNwZWVkLCB0aW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICogQHBhcmFtIHtCb29sfSBjeWNsaWMgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqL1xuICBzZXQgY3ljbGljKGN5Y2xpYykge1xuICAgIGlmIChjeWNsaWMgIT09IHRoaXMuX19jeWNsaWMpIHtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuY3VycmVudG9zaXRpb247XG5cbiAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgdGhpcy5fX2N5Y2xpYyA9IGN5Y2xpYztcblxuICAgICAgaWYgKHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEByZXR1cm4ge0Jvb2x9IHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKi9cbiAgZ2V0IGN5Y2xpYygpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N5Y2xpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZ2FpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcblxuICAgIHRoaXMuX19nYWluTm9kZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModGltZSk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLnNldFZhbHVlQXRUaW1lKHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlLCB0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgYnVmZmVyIGR1cmF0aW9uXG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYodGhpcy5idWZmZXIpXG4gICAgICByZXR1cm4gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICByZXR1cm4gMDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllckVuZ2luZTsiXX0=