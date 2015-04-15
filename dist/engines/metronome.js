"use strict";

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _get = require("babel-runtime/helpers/get")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _core = require("babel-runtime/core-js")["default"];

var AudioTimeEngine = require("../core/audio-time-engine");

var Metronome = (function (_AudioTimeEngine) {
  function Metronome() {
    var options = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Metronome);

    _get(_core.Object.getPrototypeOf(Metronome.prototype), "constructor", this).call(this, options.audioContext);

    /**
     * Metronome period
     * @type {Number}
     */
    this.__period = options.period || 1;

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

    this.__lastTime = 0;
    this.__phase = 0;

    this.__gainNode = this.audioContext.createGain();
    this.__gainNode.gain.value = options.gain || 1;

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
          if (master.resetEngineTime) master.resetEngineTime(this, this.__lastTime + period);else if (master.resetEnginePosition) this.resetEnginePosition(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUVBLElBQUksZUFBZSxHQUFHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztJQUVyRCxTQUFTO0FBQ0YsV0FEUCxTQUFTLEdBQ2E7UUFBZCxPQUFPLGdDQUFHLEVBQUU7OzBCQURwQixTQUFTOztBQUVYLHFDQUZFLFNBQVMsNkNBRUwsT0FBTyxDQUFDLFlBQVksRUFBRTs7Ozs7O0FBTTVCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7Ozs7OztBQU1wQyxRQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksR0FBRyxDQUFDOzs7Ozs7QUFNMUMsUUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQzs7Ozs7O0FBTWhELFFBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksSUFBSSxLQUFLLENBQUM7O0FBRWxELFFBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOztBQUVqQixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDakQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDOztBQUUvQyxRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7R0FDbkM7O1lBbkNHLFNBQVM7O2VBQVQsU0FBUztBQXNDYixlQUFXOzs7O2FBQUEscUJBQUMsSUFBSSxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsWUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsZUFB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LElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFlBQUksTUFBTSxFQUFFO0FBQ1YsY0FBSSxNQUFNLENBQUMsZUFBZSxFQUN4QixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEtBQ3BELElBQUksTUFBTSxDQUFDLG1CQUFtQixFQUNqQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEM7T0FDRjs7Ozs7O1dBTVMsWUFBRztBQUNYLGVBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztPQUN0Qjs7QUFtQkcsU0FBSzs7Ozs7OztXQWJBLFVBQUMsS0FBSyxFQUFFO0FBQ2YsWUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFekMsWUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7QUFFekIsWUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLG1CQUFtQixLQUFLLFNBQVMsRUFDcEQsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3BDOzs7Ozs7V0FNUSxZQUFHO0FBQ1YsZUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO09BQ3JCOzs7O1NBMUpHLFNBQVM7R0FBUyxlQUFlOztBQTZKdkMsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiZXM2L3V0aWxzL3NjaGVkdWxpbmctcXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbnZhciBBdWRpb1RpbWVFbmdpbmUgPSByZXF1aXJlKFwiLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZVwiKTtcblxuY2xhc3MgTWV0cm9ub21lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5fX3BlcmlvZCA9IG9wdGlvbnMucGVyaW9kIHx8IDE7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrRnJlcSA9IG9wdGlvbnMuY2xpY2tGcmVxIHx8IDYwMDtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayBhdHRhY2sgdGltZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja0F0dGFjayA9IG9wdGlvbnMuY2xpY2tBdHRhY2sgfHwgMC4wMDI7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrUmVsZWFzZSA9IG9wdGlvbnMuY2xpY2tSZWxlYXNlIHx8IDAuMDk4O1xuXG4gICAgdGhpcy5fX2xhc3RUaW1lID0gMDtcbiAgICB0aGlzLl9fcGhhc2UgPSAwO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gb3B0aW9ucy5nYWluIHx8IDE7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX3BlcmlvZCA+IDApIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb24gPSAoTWF0aC5mbG9vcihwb3NpdGlvbiAvIHRoaXMuX19wZXJpb2QpICsgdGhpcy5fX3BoYXNlKSAqIHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIGlmIChzcGVlZCA+IDAgJiYgbmV4dFBvc2l0aW9uIDwgcG9zaXRpb24pXG4gICAgICAgIG5leHRQb3NpdGlvbiArPSB0aGlzLl9fcGVyaW9kO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIG5leHRQb3NpdGlvbiA+IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gLT0gdGhpcy5fX3BlcmlvZDtcblxuICAgICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMuX19wZXJpb2Q7XG5cbiAgICByZXR1cm4gcG9zaXRpb24gKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgdmFyIGF1ZGlvQ29udGV4dCA9IHRoaXMuYXVkaW9Db250ZXh0O1xuICAgIHZhciBjbGlja0F0dGFjayA9IHRoaXMuY2xpY2tBdHRhY2s7XG4gICAgdmFyIGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuXG4gICAgdmFyIGVudiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgZW52LmdhaW4udmFsdWUgPSAwLjA7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMS4wLCB0aW1lICsgY2xpY2tBdHRhY2spO1xuICAgIGVudi5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUoMC4wMDAwMDAxLCB0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgIGVudi5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICB2YXIgb3NjID0gYXVkaW9Db250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICBvc2MuZnJlcXVlbmN5LnZhbHVlID0gdGhpcy5jbGlja0ZyZXE7XG4gICAgb3NjLnN0YXJ0KHRpbWUpO1xuICAgIG9zYy5zdG9wKHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgb3NjLmNvbm5lY3QoZW52KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZ2FpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGVyaW9kIHBhcmFtZXRlclxuICAgKiBAcGFyYW0ge051bWJlcn0gcGVyaW9kIG1ldHJvbm9tZSBwZXJpb2RcbiAgICovXG4gIHNldCBwZXJpb2QocGVyaW9kKSB7XG4gICAgdGhpcy5fX3BlcmlvZCA9IHBlcmlvZDtcblxuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIpIHtcbiAgICAgIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKVxuICAgICAgICBtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRoaXMuX19sYXN0VGltZSArIHBlcmlvZCk7XG4gICAgICBlbHNlIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbilcbiAgICAgICAgdGhpcy5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGVyaW9kIHBhcmFtZXRlclxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IHZhbHVlIG9mIHBlcmlvZCBwYXJhbWV0ZXJcbiAgICovXG4gIGdldCBwZXJpb2QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBoYXNlIHBhcmFtZXRlciAoYXZhaWxhYmxlIG9ubHkgd2hlbiAndHJhbnNwb3J0ZWQnKVxuICAgKiBAcGFyYW0ge051bWJlcn0gcGhhc2UgbWV0cm9ub21lIHBoYXNlIFswLCAxW1xuICAgKi9cbiAgc2V0IHBoYXNlKHBoYXNlKSB7XG4gICAgdGhpcy5fX3BoYXNlID0gcGhhc2UgLSBNYXRoLmZsb29yKHBoYXNlKTtcblxuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwaGFzZSBwYXJhbWV0ZXJcbiAgICogQHJldHVybiB7TnVtYmVyfSB2YWx1ZSBvZiBwaGFzZSBwYXJhbWV0ZXJcbiAgICovXG4gIGdldCBwaGFzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BoYXNlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWV0cm9ub21lOyJdfQ==