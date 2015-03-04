"use strict";

var _babelHelpers = require("babel-runtime/helpers")["default"];

var _core = require("babel-runtime/core-js")["default"];

var TimeEngine = require("../core/time-engine");

var Metronome = (function (TimeEngine) {
  function Metronome(audioContext) {
    var options = arguments[1] === undefined ? {} : arguments[1];

    _babelHelpers.classCallCheck(this, Metronome);

    _babelHelpers.get(_core.Object.getPrototypeOf(Metronome.prototype), "constructor", this).call(this, audioContext);

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

  _babelHelpers.inherits(Metronome, TimeEngine);

  _babelHelpers.prototypeProperties(Metronome, null, {
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        this.trigger(time);
        return time + this.period;
      },
      writable: true,
      configurable: true
    },
    syncPosition: {

      // TimeEngine method (transported interface)

      value: function syncPosition(time, position, speed) {
        var nextPosition = (Math.floor(position / this.period) + this.__phase) * this.period;

        if (speed > 0 && nextPosition < position) nextPosition += this.period;else if (speed < 0 && nextPosition > position) nextPosition -= this.period;

        return nextPosition;
      },
      writable: true,
      configurable: true
    },
    advancePosition: {

      // TimeEngine method (transported interface)

      value: function advancePosition(time, position, speed) {
        this.trigger(time);

        if (speed < 0) {
          return position - this.period;
        }return position + this.period;
      },
      writable: true,
      configurable: true
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
      },
      writable: true,
      configurable: true
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
      },
      configurable: true
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
      },
      configurable: true
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy91dGlscy9wcmlvcml0eS1xdWV1ZS5lczYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBT0EsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0lBRTFDLFNBQVMsY0FBUyxVQUFVO0FBQ3JCLFdBRFAsU0FBUyxDQUNELFlBQVk7UUFBRSxPQUFPLGdDQUFHLEVBQUU7O3VDQURsQyxTQUFTOztBQUVYLGtEQUZFLFNBQVMsNkNBRUwsWUFBWSxFQUFFOzs7Ozs7QUFNcEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQzs7Ozs7O0FBTWxDLFFBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsSUFBSSxHQUFHLENBQUM7Ozs7OztBQU0xQyxRQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLElBQUksS0FBSyxDQUFDOzs7Ozs7QUFNaEQsUUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxJQUFJLEtBQUssQ0FBQzs7QUFFbEQsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBRWpCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztHQUNuQzs7eUJBbENHLFNBQVMsRUFBUyxVQUFVOztvQ0FBNUIsU0FBUztBQXFDYixlQUFXOzs7O2FBQUEscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsZUFBTyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztPQUMzQjs7OztBQUdELGdCQUFZOzs7O2FB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VSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO09BQ3BDOzs7Ozs7V0FNTyxZQUFHO0FBQ1QsZUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7T0FDbkM7OztBQWVHLFNBQUs7Ozs7Ozs7V0FUQSxVQUFDLEtBQUssRUFBRTtBQUNmLFlBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekMsWUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7T0FDMUI7Ozs7OztXQU1RLFlBQUc7QUFDVixlQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7T0FDckI7Ozs7O1NBOUhHLFNBQVM7R0FBUyxVQUFVOztBQWlJbEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoic3JjL3V0aWxzL3ByaW9yaXR5LXF1ZXVlLmVzNi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIHdyaXR0ZW4gaW4gRUNNQXNjcmlwdCA2ICovXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgV0FWRSBhdWRpbyBtZXRyb25vbWUgZW5naW5lXG4gKiBAYXV0aG9yIE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mciwgVmljdG9yLlNhaXpAaXJjYW0uZnIsIEthcmltLkJhcmthdGlAaXJjYW0uZnJcbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBUaW1lRW5naW5lID0gcmVxdWlyZShcIi4uL2NvcmUvdGltZS1lbmdpbmVcIik7XG5cbmNsYXNzIE1ldHJvbm9tZSBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihhdWRpb0NvbnRleHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKGF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgcGVyaW9kIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCAxO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGZyZXF1ZW5jeVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja0ZyZXEgPSBvcHRpb25zLmNsaWNrRnJlcSB8fCA2MDA7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgYXR0YWNrIHRpbWVcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tBdHRhY2sgPSBvcHRpb25zLmNsaWNrQXR0YWNrIHx8IDAuMDAyO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIHJlbGVhc2UgdGltZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja1JlbGVhc2UgPSBvcHRpb25zLmNsaWNrUmVsZWFzZSB8fCAwLjA5ODtcblxuICAgIHRoaXMuX19waGFzZSA9IDA7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRpb25zLmdhaW4gfHwgMTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuX19nYWluTm9kZTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy5wZXJpb2Q7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IChNYXRoLmZsb29yKHBvc2l0aW9uIC8gdGhpcy5wZXJpb2QpICsgdGhpcy5fX3BoYXNlKSAqIHRoaXMucGVyaW9kO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBuZXh0UG9zaXRpb24gPCBwb3NpdGlvbilcbiAgICAgIG5leHRQb3NpdGlvbiArPSB0aGlzLnBlcmlvZDtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgbmV4dFBvc2l0aW9uID4gcG9zaXRpb24pXG4gICAgICBuZXh0UG9zaXRpb24gLT0gdGhpcy5wZXJpb2Q7XG5cbiAgICByZXR1cm4gbmV4dFBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcblxuICAgIGlmIChzcGVlZCA8IDApXG4gICAgICByZXR1cm4gcG9zaXRpb24gLSB0aGlzLnBlcmlvZDtcblxuICAgIHJldHVybiBwb3NpdGlvbiArIHRoaXMucGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBjbGlja0F0dGFjayA9IHRoaXMuY2xpY2tBdHRhY2s7XG4gICAgdmFyIGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuICAgIHZhciBwZXJpb2QgPSB0aGlzLnBlcmlvZDtcblxuICAgIGlmIChwZXJpb2QgPCAoY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpKSB7XG4gICAgICB2YXIgc2NhbGUgPSBwZXJpb2QgLyAoY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgICAgY2xpY2tBdHRhY2sgKj0gc2NhbGU7XG4gICAgICBjbGlja1JlbGVhc2UgKj0gc2NhbGU7XG4gICAgfVxuXG4gICAgdGhpcy5fX2Vudk5vZGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19lbnZOb2RlLmdhaW4udmFsdWUgPSAwLjA7XG4gICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEuMCwgdGltZSArIGNsaWNrQXR0YWNrKTtcbiAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoMC4wMDAwMDAxLCB0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgdGhpcy5fX2Vudk5vZGUuY29ubmVjdCh0aGlzLl9fZ2Fpbk5vZGUpO1xuXG4gICAgdGhpcy5fX29zYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgdGhpcy5fX29zYy5mcmVxdWVuY3kudmFsdWUgPSB0aGlzLmNsaWNrRnJlcTtcbiAgICB0aGlzLl9fb3NjLnN0YXJ0KDApO1xuICAgIHRoaXMuX19vc2Muc3RvcCh0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIHRoaXMuX19vc2MuY29ubmVjdCh0aGlzLl9fZW52Tm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBoYXNlIHBhcmFtZXRlclxuICAgKiBAcGFyYW0ge051bWJlcn0gcGhhc2UgbWV0cm9ub21lIHBoYXNlICgwLi4uMSlcbiAgICovXG4gIHNldCBwaGFzZShwaGFzZSkge1xuICAgIHRoaXMuX19waGFzZSA9IHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSk7XG4gICAgdGhpcy5yZXNldE5leHRQb3NpdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwaGFzZSBwYXJhbWV0ZXJcbiAgICogQHJldHVybiB7TnVtYmVyfSB2YWx1ZSBvZiBwaGFzZSBwYXJhbWV0ZXJcbiAgICovXG4gIGdldCBwaGFzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BoYXNlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWV0cm9ub21lOyJdfQ==