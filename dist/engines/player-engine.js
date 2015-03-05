"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");

var PlayerEngine = (function (TimeEngine) {
  function PlayerEngine(audioContext) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _babelHelpers.classCallCheck(this, PlayerEngine);

    _babelHelpers.get(_core.Object.getPrototypeOf(PlayerEngine.prototype), "constructor", this).call(this, audioContext);

    this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    this.buffer = options.buffer || null;

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     * @type {AudioBuffer}
     */
    this.fadeTime = 0.005;

    this.__time = 0;
    this.__position = 0;
    this.__speed = 0;
    this.__cyclic = false;

    this.__bufferSource = null;
    this.__envNode = null;

    this.__playingSpeed = 1;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = options.gain || 1;

    this.outputNode = this.__gainNode;
  }

  _babelHelpers.inherits(PlayerEngine, TimeEngine);

  _babelHelpers.prototypeProperties(PlayerEngine, null, {
    __start: {
      value: function __start(time, position, speed) {
        var audioContext = this.audioContext;

        if (this.buffer) {
          var bufferDuration = this.buffer.duration;

          if (this.buffer.wrapAroundExtension) bufferDuration -= this.buffer.wrapAroundExtension;

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
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
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
      },
      configurable: true
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
      },
      configurable: true
    }
  });

  return PlayerEngine;
})(TimeEngine);

module.exports = PlayerEngine;
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio player engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFPQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7SUFFMUMsWUFBWSxjQUFTLFVBQVU7QUFDeEIsV0FEUCxZQUFZLENBQ0osWUFBWTtRQUFFLE9BQU8sZ0NBQUcsRUFBRTs7dUNBRGxDLFlBQVk7O0FBRWQsa0RBRkUsWUFBWSw2Q0FFUixZQUFZLEVBQUU7O0FBRXBCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOzs7Ozs7QUFNdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQzs7Ozs7O0FBTXJDLFFBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDOztBQUV0QixRQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQixRQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDOztBQUV4QixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDakQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDOztBQUUvQyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7R0FDbkM7O3lCQWhDRyxZQUFZLEVBQVMsVUFBVTs7b0NBQS9CLFlBQVk7QUFrQ2hCLFdBQU87YUFBQSxpQkFBQyxJQUFJLEVBQUUs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QUFJLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM5QztPQUNGOzs7Ozs7V0FNUyxZQUFHO0FBQ1gsZUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDO09BQ3RCOzs7QUFrQkcsUUFBSTs7Ozs7OztXQVpBLFVBQUMsS0FBSyxFQUFFO0FBQ2QsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUV6QixZQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVDLFlBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNqRSxZQUFJLENBQUMsVUFBVSxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQ2xFOzs7Ozs7V0FNTyxZQUFHO0FBQ1QsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7T0FDbkM7Ozs7O1NBN0lHLFlBQVk7R0FBUyxVQUFVOztBQWdKckMsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogd3JpdHRlbiBpbiBFQ01Bc2NyaXB0IDYgKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIGF1ZGlvIHBsYXllciBlbmdpbmVcbiAqIEBhdXRob3IgTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyLCBWaWN0b3IuU2FpekBpcmNhbS5mciwgS2FyaW0uQmFya2F0aUBpcmNhbS5mclxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFRpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS90aW1lLWVuZ2luZVwiKTtcblxuY2xhc3MgUGxheWVyRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQ29udGV4dCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoYXVkaW9Db250ZXh0KTtcblxuICAgIHRoaXMudHJhbnNwb3J0ID0gbnVsbDsgLy8gc2V0IHdoZW4gYWRkZWQgdG8gdHJhbnNwb3J0ZXJcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdGlvbnMuYnVmZmVyIHx8IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBGYWRlIHRpbWUgZm9yIGNoYWluaW5nIHNlZ21lbnRzIChlLmcuIGluIHN0YXJ0LCBzdG9wLCBhbmQgc2VlaylcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5mYWRlVGltZSA9IDAuMDA1O1xuXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcbiAgICB0aGlzLl9fY3ljbGljID0gZmFsc2U7XG5cbiAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gMTtcblxuICAgIHRoaXMuX19nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdGlvbnMuZ2FpbiB8fCAxO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5idWZmZXIud3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy5idWZmZXIud3JhcEFyb3VuZEV4dGVuc2lvbjtcblxuICAgICAgaWYgKHRoaXMuX19jeWNsaWMgJiYgKHBvc2l0aW9uIDwgMCB8fCBwb3NpdGlvbiA+PSBidWZmZXJEdXJhdGlvbikpIHtcbiAgICAgICAgdmFyIHBoYXNlID0gcG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgcG9zaXRpb24gPSAocGhhc2UgLSBNYXRoLmZsb29yKHBoYXNlKSkgKiBidWZmZXJEdXJhdGlvbjtcbiAgICAgIH1cblxuICAgICAgaWYgKHBvc2l0aW9uID49IDAgJiYgcG9zaXRpb24gPCBidWZmZXJEdXJhdGlvbiAmJiBzcGVlZCA+IDApIHtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuY29ubmVjdCh0aGlzLl9fZ2Fpbk5vZGUpO1xuXG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gc3BlZWQ7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcCA9IHRoaXMuX19jeWNsaWM7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcFN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5sb29wRW5kID0gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RhcnQodGltZSwgcG9zaXRpb24pO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmNvbm5lY3QodGhpcy5fX2Vudk5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9faGFsdCh0aW1lKSB7XG4gICAgaWYgKHRoaXMuX19idWZmZXJTb3VyY2UpIHtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKHRpbWUpO1xuICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLl9fZW52Tm9kZS5nYWluLnZhbHVlLCB0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5zdG9wKHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcblxuICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZSA9IG51bGw7XG4gICAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKHNlZWsgfHwgbGFzdFNwZWVkICogc3BlZWQgPCAwKSB7XG4gICAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwIHx8IHNlZWspIHtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnNldFZhbHVlQXRUaW1lKHNwZWVkLCB0aW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICogQHBhcmFtIHtCb29sfSBjeWNsaWMgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqL1xuICBzZXQgY3ljbGljKGN5Y2xpYykge1xuICAgIGlmIChjeWNsaWMgIT09IHRoaXMuX19jeWNsaWMpIHtcbiAgICAgIHZhciB0aW1lID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuY3VycmVudG9zaXRpb247XG5cbiAgICAgIHRoaXMuX19oYWx0KHRpbWUpO1xuICAgICAgdGhpcy5fX2N5Y2xpYyA9IGN5Y2xpYztcblxuICAgICAgaWYgKHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEByZXR1cm4ge0Jvb2x9IHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKi9cbiAgZ2V0IGN5Y2xpYygpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N5Y2xpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZ2FpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcblxuICAgIHRoaXMuX19nYWluTm9kZS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModGltZSk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLnNldFZhbHVlQXRUaW1lKHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlLCB0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJFbmdpbmU7Il19