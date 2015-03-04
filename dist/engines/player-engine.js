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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0lBRTFDLFlBQVksY0FBUyxVQUFVO0FBQ3hCLFdBRFAsWUFBWSxDQUNKLFlBQVk7UUFBRSxPQUFPLGdDQUFHLEVBQUU7O3VDQURsQyxZQUFZOztBQUVkLGtEQUZFLFlBQVksNkNBRVIsWUFBWSxFQUFFOztBQUVwQixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs7Ozs7O0FBTXRCLFFBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7Ozs7OztBQU1yQyxRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUV0QixRQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQzs7QUFFeEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2pELFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQzs7QUFFL0MsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0dBQ25DOzt5QkFoQ0csWUFBWSxFQUFTLFVBQVU7O29DQUEvQixZQUFZO0FBa0NoQixXQUFPO2FBQUEsaUJBQUMsSUFBSSxF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QUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDOUM7T0FDRjs7Ozs7O1dBTVMsWUFBRztBQUNYLGVBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztPQUN0Qjs7O0FBa0JHLFFBQUk7Ozs7Ozs7V0FaQSxVQUFDLEtBQUssRUFBRTtBQUNkLFlBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7QUFFekIsWUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxZQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDakUsWUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUNsRTs7Ozs7O1dBTU8sWUFBRztBQUNULGVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO09BQ25DOzs7OztTQTdJRyxZQUFZO0dBQVMsVUFBVTs7QUFnSnJDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6InNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gcGxheWVyIGVuZ2luZVxuICogQGF1dGhvciBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIFZpY3Rvci5TYWl6QGlyY2FtLmZyLCBLYXJpbS5CYXJrYXRpQGlyY2FtLmZyXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgVGltZUVuZ2luZSA9IHJlcXVpcmUoXCIuLi9jb3JlL3RpbWUtZW5naW5lXCIpO1xuXG5jbGFzcyBQbGF5ZXJFbmdpbmUgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0LCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihhdWRpb0NvbnRleHQpO1xuXG4gICAgdGhpcy50cmFuc3BvcnQgPSBudWxsOyAvLyBzZXQgd2hlbiBhZGRlZCB0byB0cmFuc3BvcnRlclxuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0aW9ucy5idWZmZXIgfHwgbnVsbDtcblxuICAgIC8qKlxuICAgICAqIEZhZGUgdGltZSBmb3IgY2hhaW5pbmcgc2VnbWVudHMgKGUuZy4gaW4gc3RhcnQsIHN0b3AsIGFuZCBzZWVrKVxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKi9cbiAgICB0aGlzLmZhZGVUaW1lID0gMC4wMDU7XG5cbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuICAgIHRoaXMuX19jeWNsaWMgPSBmYWxzZTtcblxuICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgIHRoaXMuX19lbnZOb2RlID0gbnVsbDtcblxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gb3B0aW9ucy5nYWluIHx8IDE7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBfX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLmJ1ZmZlci53cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgICAgICBidWZmZXJEdXJhdGlvbiAtPSB0aGlzLmJ1ZmZlci53cmFwQXJvdW5kRXh0ZW5zaW9uO1xuXG4gICAgICBpZiAodGhpcy5fX2N5Y2xpYyAmJiAocG9zaXRpb24gPCAwIHx8IHBvc2l0aW9uID49IGJ1ZmZlckR1cmF0aW9uKSkge1xuICAgICAgICB2YXIgcGhhc2UgPSBwb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICBwb3NpdGlvbiA9IChwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpKSAqIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgfVxuXG4gICAgICBpZiAocG9zaXRpb24gPj0gMCAmJiBwb3NpdGlvbiA8IGJ1ZmZlckR1cmF0aW9uICYmIHNwZWVkID4gMCkge1xuICAgICAgICB0aGlzLl9fZW52Tm9kZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMSwgdGltZSArIHRoaXMuZmFkZVRpbWUpO1xuICAgICAgICB0aGlzLl9fZW52Tm9kZS5jb25uZWN0KHRoaXMuX19nYWluTm9kZSk7XG5cbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5idWZmZXIgPSB0aGlzLmJ1ZmZlcjtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBzcGVlZDtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5sb29wID0gdGhpcy5fX2N5Y2xpYztcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5sb29wU3RhcnQgPSAwO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BFbmQgPSBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5zdGFydCh0aW1lLCBwb3NpdGlvbik7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UuY29ubmVjdCh0aGlzLl9fZW52Tm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX19oYWx0KHRpbWUpIHtcbiAgICBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuX19lbnZOb2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0b3AodGltZSArIHRoaXMuZmFkZVRpbWUpO1xuXG4gICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICAgIHRoaXMuX19lbnZOb2RlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UpXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWsgPSBmYWxzZSkge1xuICAgIHZhciBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCBzZWVrKSB7XG4gICAgICBpZiAoc2VlayB8fCBsYXN0U3BlZWQgKiBzcGVlZCA8IDApIHtcbiAgICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDAgfHwgc2Vlaykge1xuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19idWZmZXJTb3VyY2UpIHtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUuc2V0VmFsdWVBdFRpbWUoc3BlZWQsIHRpbWUpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKiBAcGFyYW0ge0Jvb2x9IGN5Y2xpYyB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICovXG4gIHNldCBjeWNsaWMoY3ljbGljKSB7XG4gICAgaWYgKGN5Y2xpYyAhPT0gdGhpcy5fX2N5Y2xpYykge1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jdXJyZW50b3NpdGlvbjtcblxuICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICB0aGlzLl9fY3ljbGljID0gY3ljbGljO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICogQHJldHVybiB7Qm9vbH0gd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqL1xuICBnZXQgY3ljbGljKCkge1xuICAgIHJldHVybiB0aGlzLl9fY3ljbGljO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBnYWluXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBsaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuc2V0VmFsdWVBdFRpbWUodGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllckVuZ2luZTsiXX0=