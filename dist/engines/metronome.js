"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");

var Metronome = (function (_TimeEngine) {
  function Metronome() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Metronome);

    _get(_core.Object.getPrototypeOf(Metronome.prototype), "constructor", this).call(this, options.audioContext);

    /**
     * Metronome period in sec
     * @type {Number}
     */
    this.period = options.period || 1;

    /**
     * Metronome click frequency
     * @type {Number}
     */
    this.clickFreq = options.clickFreq || 600;

    /**
     * Metronome click attack time
     * @type {Number}
     */
    this.clickAttack = options.clickAttack || 0.002;

    /**
     * Metronome click release time
     * @type {Number}
     */
    this.clickRelease = options.clickRelease || 0.098;

    this.__phase = 0;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = options.gain || 1;

    this.outputNode = this.__gainNode;
  }

  _inherits(Metronome, _TimeEngine);

  _createClass(Metronome, {
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        this.trigger(time);
        return time + this.period;
      }
    },
    syncPosition: {

      // TimeEngine method (transported interface)

      value: function syncPosition(time, position, speed) {
        var nextPosition = (Math.floor(position / this.period) + this.__phase) * this.period;

        if (speed > 0 && nextPosition < position) nextPosition += this.period;else if (speed < 0 && nextPosition > position) nextPosition -= this.period;

        return nextPosition;
      }
    },
    advancePosition: {

      // TimeEngine method (transported interface)

      value: function advancePosition(time, position, speed) {
        this.trigger(time);

        if (speed < 0) {
          return position - this.period;
        }return position + this.period;
      }
    },
    trigger: {

      /**
       * Trigger metronome click
       * @param {Number} time metronome click synthesis audio time
       */

      value: function trigger(time) {
        var audioContext = this.audioContext;
        var clickAttack = this.clickAttack;
        var clickRelease = this.clickRelease;
        var period = this.period;

        if (period < clickAttack + clickRelease) {
          var scale = period / (clickAttack + clickRelease);
          clickAttack *= scale;
          clickRelease *= scale;
        }

        this.__envNode = audioContext.createGain();
        this.__envNode.gain.value = 0;
        this.__envNode.gain.setValueAtTime(0, time);
        this.__envNode.gain.linearRampToValueAtTime(1, time + clickAttack);
        this.__envNode.gain.exponentialRampToValueAtTime(1e-7, time + clickAttack + clickRelease);
        this.__envNode.gain.setValueAtTime(0, time);
        this.__envNode.connect(this.__gainNode);

        this.__osc = audioContext.createOscillator();
        this.__osc.frequency.value = this.clickFreq;
        this.__osc.start(0);
        this.__osc.stop(time + clickAttack + clickRelease);
        this.__osc.connect(this.__envNode);
      }
    },
    gain: {

      /**
       * Set gain
       * @param {Number} value linear gain factor
       */

      set: function (value) {
        this.__gainNode.gain.value = value;
      },

      /**
       * Get gain
       * @return {Number} current gain
       */
      get: function () {
        return this.__gainNode.gain.value;
      }
    },
    phase: {

      /**
       * Set phase parameter
       * @param {Number} phase metronome phase (0...1)
       */

      set: function (phase) {
        this.__phase = phase - Math.floor(phase);
        this.resetNextPosition();
      },

      /**
       * Get phase parameter
       * @return {Number} value of phase parameter
       */
      get: function () {
        return this.__phase;
      }
    }
  });

  return Metronome;
})(TimeEngine);

module.exports = Metronome;
/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio metronome engine
 * @author Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFPQSxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQzs7SUFFMUMsU0FBUztBQUNGLFdBRFAsU0FBUyxHQUNhO1FBQWQsT0FBTyxnQ0FBRyxFQUFFOzswQkFEcEIsU0FBUzs7QUFFWCxxQ0FGRSxTQUFTLDZDQUVMLE9BQU8sQ0FBQyxZQUFZLEVBQUU7Ozs7OztBQU01QixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDOzs7Ozs7QUFNbEMsUUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQzs7Ozs7O0FBTTFDLFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7Ozs7OztBQU1oRCxRQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDOztBQUVsRCxRQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs7QUFFakIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2pELFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQzs7QUFFL0MsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO0dBQ25DOztZQWxDRyxTQUFTOztlQUFULFNBQVM7QUFxQ2IsZUFBVzs7OzthQUFBLHFCQUFDLElBQUksRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25CLGVBQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7T0FDM0I7O0FBR0QsZ0JBQVk7Ozs7YUFBQSxzQkFBQyxJQUFJLEVBQUUs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RyxLQUFLLENBQUM7T0FDcEM7Ozs7OztXQU1PLFlBQUc7QUFDVCxlQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztPQUNuQzs7QUFlRyxTQUFLOzs7Ozs7O1dBVEEsVUFBQyxLQUFLLEVBQUU7QUFDZixZQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3pDLFlBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO09BQzFCOzs7Ozs7V0FNUSxZQUFHO0FBQ1YsZUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO09BQ3JCOzs7O1NBOUhHLFNBQVM7R0FBUyxVQUFVOztBQWlJbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogd3JpdHRlbiBpbiBFQ01Bc2NyaXB0IDYgKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIGF1ZGlvIG1ldHJvbm9tZSBlbmdpbmVcbiAqIEBhdXRob3IgTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyLCBWaWN0b3IuU2FpekBpcmNhbS5mciwgS2FyaW0uQmFya2F0aUBpcmNhbS5mclxuICovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIFRpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS90aW1lLWVuZ2luZVwiKTtcblxuY2xhc3MgTWV0cm9ub21lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBwZXJpb2QgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZCA9IG9wdGlvbnMucGVyaW9kIHx8IDE7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrRnJlcSA9IG9wdGlvbnMuY2xpY2tGcmVxIHx8IDYwMDtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayBhdHRhY2sgdGltZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja0F0dGFjayA9IG9wdGlvbnMuY2xpY2tBdHRhY2sgfHwgMC4wMDI7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrUmVsZWFzZSA9IG9wdGlvbnMuY2xpY2tSZWxlYXNlIHx8IDAuMDk4O1xuXG4gICAgdGhpcy5fX3BoYXNlID0gMDtcblxuICAgIHRoaXMuX19nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdGlvbnMuZ2FpbiB8fCAxO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnBlcmlvZDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gKE1hdGguZmxvb3IocG9zaXRpb24gLyB0aGlzLnBlcmlvZCkgKyB0aGlzLl9fcGhhc2UpICogdGhpcy5wZXJpb2Q7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIG5leHRQb3NpdGlvbiA8IHBvc2l0aW9uKVxuICAgICAgbmV4dFBvc2l0aW9uICs9IHRoaXMucGVyaW9kO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBuZXh0UG9zaXRpb24gPiBwb3NpdGlvbilcbiAgICAgIG5leHRQb3NpdGlvbiAtPSB0aGlzLnBlcmlvZDtcblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMucGVyaW9kO1xuXG4gICAgcmV0dXJuIHBvc2l0aW9uICsgdGhpcy5wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBtZXRyb25vbWUgY2xpY2tcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgbWV0cm9ub21lIGNsaWNrIHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGNsaWNrQXR0YWNrID0gdGhpcy5jbGlja0F0dGFjaztcbiAgICB2YXIgY2xpY2tSZWxlYXNlID0gdGhpcy5jbGlja1JlbGVhc2U7XG4gICAgdmFyIHBlcmlvZCA9IHRoaXMucGVyaW9kO1xuXG4gICAgaWYgKHBlcmlvZCA8IChjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSkpIHtcbiAgICAgIHZhciBzY2FsZSA9IHBlcmlvZCAvIChjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgICBjbGlja0F0dGFjayAqPSBzY2FsZTtcbiAgICAgIGNsaWNrUmVsZWFzZSAqPSBzY2FsZTtcbiAgICB9XG5cbiAgICB0aGlzLl9fZW52Tm9kZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICB0aGlzLl9fZW52Tm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgIHRoaXMuX19lbnZOb2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMS4wLCB0aW1lICsgY2xpY2tBdHRhY2spO1xuICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICB0aGlzLl9fZW52Tm9kZS5jb25uZWN0KHRoaXMuX19nYWluTm9kZSk7XG5cbiAgICB0aGlzLl9fb3NjID0gYXVkaW9Db250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICB0aGlzLl9fb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuY2xpY2tGcmVxO1xuICAgIHRoaXMuX19vc2Muc3RhcnQoMCk7XG4gICAgdGhpcy5fX29zYy5zdG9wKHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgdGhpcy5fX29zYy5jb25uZWN0KHRoaXMuX19lbnZOb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZ2FpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGhhc2UgcGFyYW1ldGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwaGFzZSBtZXRyb25vbWUgcGhhc2UgKDAuLi4xKVxuICAgKi9cbiAgc2V0IHBoYXNlKHBoYXNlKSB7XG4gICAgdGhpcy5fX3BoYXNlID0gcGhhc2UgLSBNYXRoLmZsb29yKHBoYXNlKTtcbiAgICB0aGlzLnJlc2V0TmV4dFBvc2l0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBoYXNlIHBhcmFtZXRlclxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHZhbHVlIG9mIHBoYXNlIHBhcmFtZXRlclxuICAgKi9cbiAgZ2V0IHBoYXNlKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGhhc2U7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZXRyb25vbWU7Il19