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

var Metronome = (function (_AudioTimeEngine) {
  function Metronome() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Metronome);

    _get(_core.Object.getPrototypeOf(Metronome.prototype), "constructor", this).call(this, options.audioContext);

    /**
     * Metronome period
     * @type {Number}
     */
    this.__period = optOrDef(options.period, 1);

    /**
     * Metronome click frequency
     * @type {Number}
     */
    this.clickFreq = optOrDef(options.clickFreq, 600);

    /**
     * Metronome click attack time
     * @type {Number}
     */
    this.clickAttack = optOrDef(options.clickAttack, 0.002);

    /**
     * Metronome click release time
     * @type {Number}
     */
    this.clickRelease = optOrDef(options.clickRelease, 0.098);

    this.__lastTime = 0;
    this.__phase = 0;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = optOrDef(options.gain, 1);

    this.outputNode = this.__gainNode;
  }

  _inherits(Metronome, _AudioTimeEngine);

  _createClass(Metronome, {
    advanceTime: {

      // TimeEngine method (scheduled interface)

      value: function advanceTime(time) {
        this.trigger(time);
        this.__lastTime = time;
        return time + this.__period;
      }
    },
    syncPosition: {

      // TimeEngine method (transported interface)

      value: function syncPosition(time, position, speed) {
        if (this.__period > 0) {
          var nextPosition = (Math.floor(position / this.__period) + this.__phase) * this.__period;

          if (speed > 0 && nextPosition < position) nextPosition += this.__period;else if (speed < 0 && nextPosition > position) nextPosition -= this.__period;

          return nextPosition;
        }

        return Infinity;
      }
    },
    advancePosition: {

      // TimeEngine method (transported interface)

      value: function advancePosition(time, position, speed) {
        this.trigger(time);

        if (speed < 0) {
          return position - this.__period;
        }return position + this.__period;
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

        var env = audioContext.createGain();
        env.gain.value = 0;
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(1, time + clickAttack);
        env.gain.exponentialRampToValueAtTime(1e-7, time + clickAttack + clickRelease);
        env.gain.setValueAtTime(0, time);
        env.connect(this.outputNode);

        var osc = audioContext.createOscillator();
        osc.frequency.value = this.clickFreq;
        osc.start(time);
        osc.stop(time + clickAttack + clickRelease);
        osc.connect(env);
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
    period: {

      /**
       * Set period parameter
       * @param {Number} period metronome period
       */

      set: function (period) {
        this.__period = period;

        var master = this.master;

        if (master) {
          if (master.resetEngineTime) master.resetEngineTime(this, this.__lastTime + period);else if (master.resetEnginePosition) master.resetEnginePosition(this);
        }
      },

      /**
       * Get period parameter
       * @return {Number} value of period parameter
       */
      get: function () {
        return this.__period;
      }
    },
    phase: {

      /**
       * Set phase parameter (available only when 'transported')
       * @param {Number} phase metronome phase [0, 1[
       */

      set: function (phase) {
        this.__phase = phase - Math.floor(phase);

        var master = this.master;

        if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this);
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
})(AudioTimeEngine);

module.exports = Metronome;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9lbmdpbmVzL21ldHJvbm9tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztJQUFPLGVBQWUsMkJBQU0sMkJBQTJCOztBQUV2RCxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO0FBQzFCLE1BQUcsR0FBRyxLQUFLLFNBQVM7QUFDbEIsV0FBTyxHQUFHLENBQUM7R0FBQSxBQUViLE9BQU8sR0FBRyxDQUFDO0NBQ1o7O0lBRW9CLFNBQVM7QUFDakIsV0FEUSxTQUFTLEdBQ0Y7UUFBZCxPQUFPLGdDQUFHLEVBQUU7OzBCQURMLFNBQVM7O0FBRTFCLHFDQUZpQixTQUFTLDZDQUVwQixPQUFPLENBQUMsWUFBWSxFQUFFOzs7Ozs7QUFNNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7O0FBTTVDLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7OztBQU1sRCxRQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDOzs7Ozs7QUFNeEQsUUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFMUQsUUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7O0FBRWpCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNqRCxRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRXZELFFBQUksQ0FBQyxVQUFVLEdBQUcs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QUNwQzs7Ozs7O1dBTU8sWUFBRztBQUNULGVBQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO09BQ25DOztBQXVCRyxVQUFNOzs7Ozs7O1dBakJBLFVBQUMsTUFBTSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDOztBQUV2QixZQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDOztBQUUzQixZQUFJLE1BQU0sRUFBRTtBQUNWLGNBQUksTUFBTSxDQUFDLGVBQWUsRUFDeEIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUNwRCxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsRUFDakMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDO09BQ0Y7Ozs7OztXQU1TLFlBQUc7QUFDWCxlQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7T0FDdEI7O0FBbUJHLFNBQUs7Ozs7Ozs7V0FiQSxVQUFDLEtBQUssRUFBRTtBQUNmLFlBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXpDLFlBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRTNCLFlBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQ3BELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUNwQzs7Ozs7O1dBTVEsWUFBRztBQUNWLGVBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztPQUNyQjs7OztTQTFKa0IsU0FBUztHQUFTLGVBQWU7O2lCQUFqQyxTQUFTIiwiZmlsZSI6ImVzNi9lbmdpbmVzL21ldHJvbm9tZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZSc7XG5cbmZ1bmN0aW9uIG9wdE9yRGVmKG9wdCwgZGVmKSB7XG4gIGlmKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWV0cm9ub21lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5fX3BlcmlvZCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kLCAxKTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayBmcmVxdWVuY3lcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tGcmVxID0gb3B0T3JEZWYob3B0aW9ucy5jbGlja0ZyZXEsIDYwMCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgYXR0YWNrIHRpbWVcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tBdHRhY2sgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrQXR0YWNrLCAwLjAwMik7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrUmVsZWFzZSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tSZWxlYXNlLCAwLjA5OCk7XG5cbiAgICB0aGlzLl9fbGFzdFRpbWUgPSAwO1xuICAgIHRoaXMuX19waGFzZSA9IDA7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19wZXJpb2QgPiAwKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gKE1hdGguZmxvb3IocG9zaXRpb24gLyB0aGlzLl9fcGVyaW9kKSArIHRoaXMuX19waGFzZSkgKiB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICBpZiAoc3BlZWQgPiAwICYmIG5leHRQb3NpdGlvbiA8IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gKz0gdGhpcy5fX3BlcmlvZDtcbiAgICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBuZXh0UG9zaXRpb24gPiBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uIC09IHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcblxuICAgIGlmIChzcGVlZCA8IDApXG4gICAgICByZXR1cm4gcG9zaXRpb24gLSB0aGlzLl9fcGVyaW9kO1xuXG4gICAgcmV0dXJuIHBvc2l0aW9uICsgdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIG1ldHJvbm9tZSBjbGlja1xuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBtZXRyb25vbWUgY2xpY2sgc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICovXG4gIHRyaWdnZXIodGltZSkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIGNvbnN0IGNsaWNrQXR0YWNrID0gdGhpcy5jbGlja0F0dGFjaztcbiAgICBjb25zdCBjbGlja1JlbGVhc2UgPSB0aGlzLmNsaWNrUmVsZWFzZTtcblxuICAgIGNvbnN0IGVudiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgZW52LmdhaW4udmFsdWUgPSAwLjA7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMS4wLCB0aW1lICsgY2xpY2tBdHRhY2spO1xuICAgIGVudi5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoMC4wMDAwMDAxLCB0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgIGVudi5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICBjb25zdCBvc2MgPSBhdWRpb0NvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgIG9zYy5mcmVxdWVuY3kudmFsdWUgPSB0aGlzLmNsaWNrRnJlcTtcbiAgICBvc2Muc3RhcnQodGltZSk7XG4gICAgb3NjLnN0b3AodGltZSArIGNsaWNrQXR0YWNrICsgY2xpY2tSZWxlYXNlKTtcbiAgICBvc2MuY29ubmVjdChlbnYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBnYWluXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBsaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2FpblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgZ2FpblxuICAgKi9cbiAgZ2V0IGdhaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwZXJpb2QgcGFyYW1ldGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwZXJpb2QgbWV0cm9ub21lIHBlcmlvZFxuICAgKi9cbiAgc2V0IHBlcmlvZChwZXJpb2QpIHtcbiAgICB0aGlzLl9fcGVyaW9kID0gcGVyaW9kO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyKSB7XG4gICAgICBpZiAobWFzdGVyLnJlc2V0RW5naW5lVGltZSlcbiAgICAgICAgbWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aGlzLl9fbGFzdFRpbWUgKyBwZXJpb2QpO1xuICAgICAgZWxzZSBpZiAobWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24pXG4gICAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGVyaW9kIHBhcmFtZXRlclxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHZhbHVlIG9mIHBlcmlvZCBwYXJhbWV0ZXJcbiAgICovXG4gIGdldCBwZXJpb2QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBoYXNlIHBhcmFtZXRlciAoYXZhaWxhYmxlIG9ubHkgd2hlbiAndHJhbnNwb3J0ZWQnKVxuICAgKiBAcGFyYW0ge051bWJlcn0gcGhhc2UgbWV0cm9ub21lIHBoYXNlIFswLCAxW1xuICAgKi9cbiAgc2V0IHBoYXNlKHBoYXNlKSB7XG4gICAgdGhpcy5fX3BoYXNlID0gcGhhc2UgLSBNYXRoLmZsb29yKHBoYXNlKTtcblxuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBoYXNlIHBhcmFtZXRlclxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHZhbHVlIG9mIHBoYXNlIHBhcmFtZXRlclxuICAgKi9cbiAgZ2V0IHBoYXNlKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGhhc2U7XG4gIH1cbn1cbiJdfQ==