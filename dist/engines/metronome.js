'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _coreAudioTimeEngine = require('../core/audio-time-engine');

var _coreAudioTimeEngine2 = _interopRequireDefault(_coreAudioTimeEngine);

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

var Metronome = (function (_AudioTimeEngine) {
  _inherits(Metronome, _AudioTimeEngine);

  function Metronome() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Metronome);

    _get(Object.getPrototypeOf(Metronome.prototype), 'constructor', this).call(this, options.audioContext);

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

  // TimeEngine method (scheduled interface)

  _createClass(Metronome, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      this.trigger(time);
      this.__lastTime = time;
      return time + this.__period;
    }

    // TimeEngine method (transported interface)
  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (this.__period > 0) {
        var nextPosition = (Math.floor(position / this.__period) + this.__phase) * this.__period;

        if (speed > 0 && nextPosition < position) nextPosition += this.__period;else if (speed < 0 && nextPosition > position) nextPosition -= this.__period;

        return nextPosition;
      }

      return Infinity;
    }

    // TimeEngine method (transported interface)
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      this.trigger(time);

      if (speed < 0) return position - this.__period;

      return position + this.__period;
    }

    /**
     * Trigger metronome click
     * @param {Number} time metronome click synthesis audio time
     */
  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var clickAttack = this.clickAttack;
      var clickRelease = this.clickRelease;

      var env = audioContext.createGain();
      env.gain.value = 0.0;
      env.gain.setValueAtTime(0, time);
      env.gain.linearRampToValueAtTime(1.0, time + clickAttack);
      env.gain.exponentialRampToValueAtTime(0.0000001, time + clickAttack + clickRelease);
      env.gain.setValueAtTime(0, time);
      env.connect(this.outputNode);

      var osc = audioContext.createOscillator();
      osc.frequency.value = this.clickFreq;
      osc.start(time);
      osc.stop(time + clickAttack + clickRelease);
      osc.connect(env);
    }

    /**
     * Set gain
     * @param {Number} value linear gain factor
     */
  }, {
    key: 'gain',
    set: function set(value) {
      this.__gainNode.gain.value = value;
    },

    /**
     * Get gain
     * @return {Number} current gain
     */
    get: function get() {
      return this.__gainNode.gain.value;
    }

    /**
     * Set period parameter
     * @param {Number} period metronome period
     */
  }, {
    key: 'period',
    set: function set(period) {
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
    get: function get() {
      return this.__period;
    }

    /**
     * Set phase parameter (available only when 'transported')
     * @param {Number} phase metronome phase [0, 1[
     */
  }, {
    key: 'phase',
    set: function set(phase) {
      this.__phase = phase - Math.floor(phase);

      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this);
    },

    /**
     * Get phase parameter
     * @return {Number} value of phase parameter
     */
    get: function get() {
      return this.__phase;
    }
  }]);

  return Metronome;
})(_coreAudioTimeEngine2['default']);

exports['default'] = Metronome;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImVzNi9lbmdpbmVzL21ldHJvbm9tZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O21DQUE0QiwyQkFBMkI7Ozs7QUFFdkQsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUMxQixNQUFHLEdBQUcsS0FBSyxTQUFTLEVBQ2xCLE9BQU8sR0FBRyxDQUFDOztBQUViLFNBQU8sR0FBRyxDQUFDO0NBQ1o7O0lBRW9CLFNBQVM7WUFBVCxTQUFTOztBQUNqQixXQURRLFNBQVMsR0FDRjtRQUFkLE9BQU8seURBQUcsRUFBRTs7MEJBREwsU0FBUzs7QUFFMUIsK0JBRmlCLFNBQVMsNkNBRXBCLE9BQU8sQ0FBQyxZQUFZLEVBQUU7Ozs7OztBQU01QixRQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7Ozs7QUFNNUMsUUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQzs7Ozs7O0FBTWxELFFBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7Ozs7OztBQU14RCxRQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUUxRCxRQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztBQUNwQixRQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQzs7QUFFakIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2pELFFBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFdkQsUUFBSSxDQUFDLFVBQVUsR0FB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QUM7S0FDbkM7Ozs7Ozs7O1NBTVMsYUFBQyxNQUFNLEVBQUU7QUFDakIsVUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7O0FBRXZCLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFVBQUksTUFBTSxFQUFFO0FBQ1YsWUFBSSxNQUFNLENBQUMsZUFBZSxFQUN4QixNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLEtBQ3BELElBQUksTUFBTSxDQUFDLG1CQUFtQixFQUNqQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDcEM7S0FDRjs7Ozs7O1NBTVMsZUFBRztBQUNYLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztLQUN0Qjs7Ozs7Ozs7U0FNUSxhQUFDLEtBQUssRUFBRTtBQUNmLFVBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXpDLFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFVBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsS0FBSyxTQUFTLEVBQ3BELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwQzs7Ozs7O1NBTVEsZUFBRztBQUNWLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUNyQjs7O1NBMUprQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiJlczYvZW5naW5lcy9tZXRyb25vbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ldHJvbm9tZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuX19wZXJpb2QgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrRnJlcSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tGcmVxLCA2MDApO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrQXR0YWNrID0gb3B0T3JEZWYob3B0aW9ucy5jbGlja0F0dGFjaywgMC4wMDIpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIHJlbGVhc2UgdGltZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja1JlbGVhc2UgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrUmVsZWFzZSwgMC4wOTgpO1xuXG4gICAgdGhpcy5fX2xhc3RUaW1lID0gMDtcbiAgICB0aGlzLl9fcGhhc2UgPSAwO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuX19nYWluTm9kZTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9fcGVyaW9kID4gMCkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IChNYXRoLmZsb29yKHBvc2l0aW9uIC8gdGhpcy5fX3BlcmlvZCkgKyB0aGlzLl9fcGhhc2UpICogdGhpcy5fX3BlcmlvZDtcblxuICAgICAgaWYgKHNwZWVkID4gMCAmJiBuZXh0UG9zaXRpb24gPCBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uICs9IHRoaXMuX19wZXJpb2Q7XG4gICAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgbmV4dFBvc2l0aW9uID4gcG9zaXRpb24pXG4gICAgICAgIG5leHRQb3NpdGlvbiAtPSB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICByZXR1cm4gbmV4dFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG5cbiAgICBpZiAoc3BlZWQgPCAwKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uIC0gdGhpcy5fX3BlcmlvZDtcblxuICAgIHJldHVybiBwb3NpdGlvbiArIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBtZXRyb25vbWUgY2xpY2tcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgbWV0cm9ub21lIGNsaWNrIHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGNsaWNrQXR0YWNrID0gdGhpcy5jbGlja0F0dGFjaztcbiAgICB2YXIgY2xpY2tSZWxlYXNlID0gdGhpcy5jbGlja1JlbGVhc2U7XG5cbiAgICB2YXIgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBlbnYuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIHRpbWUgKyBjbGlja0F0dGFjayk7XG4gICAgZW52LmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgIHZhciBvc2MgPSBhdWRpb0NvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgIG9zYy5mcmVxdWVuY3kudmFsdWUgPSB0aGlzLmNsaWNrRnJlcTtcbiAgICBvc2Muc3RhcnQodGltZSk7XG4gICAgb3NjLnN0b3AodGltZSArIGNsaWNrQXR0YWNrICsgY2xpY2tSZWxlYXNlKTtcbiAgICBvc2MuY29ubmVjdChlbnYpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBnYWluXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZSBsaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgZ2FpblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgZ2FpblxuICAgKi9cbiAgZ2V0IGdhaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwZXJpb2QgcGFyYW1ldGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwZXJpb2QgbWV0cm9ub21lIHBlcmlvZFxuICAgKi9cbiAgc2V0IHBlcmlvZChwZXJpb2QpIHtcbiAgICB0aGlzLl9fcGVyaW9kID0gcGVyaW9kO1xuXG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3Rlcikge1xuICAgICAgaWYgKG1hc3Rlci5yZXNldEVuZ2luZVRpbWUpXG4gICAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVRpbWUodGhpcywgdGhpcy5fX2xhc3RUaW1lICsgcGVyaW9kKTtcbiAgICAgIGVsc2UgaWYgKG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKVxuICAgICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBlcmlvZCBwYXJhbWV0ZXJcbiAgICogQHJldHVybiB7TnVtYmVyfSB2YWx1ZSBvZiBwZXJpb2QgcGFyYW1ldGVyXG4gICAqL1xuICBnZXQgcGVyaW9kKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwaGFzZSBwYXJhbWV0ZXIgKGF2YWlsYWJsZSBvbmx5IHdoZW4gJ3RyYW5zcG9ydGVkJylcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBoYXNlIG1ldHJvbm9tZSBwaGFzZSBbMCwgMVtcbiAgICovXG4gIHNldCBwaGFzZShwaGFzZSkge1xuICAgIHRoaXMuX19waGFzZSA9IHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSk7XG5cbiAgICB2YXIgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGhhc2UgcGFyYW1ldGVyXG4gICAqIEByZXR1cm4ge051bWJlcn0gdmFsdWUgb2YgcGhhc2UgcGFyYW1ldGVyXG4gICAqL1xuICBnZXQgcGhhc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19waGFzZTtcbiAgfVxufVxuIl19