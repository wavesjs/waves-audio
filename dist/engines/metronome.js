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

var Metronome = function (_AudioTimeEngine) {
  (0, _inherits3.default)(Metronome, _AudioTimeEngine);

  function Metronome() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Metronome);


    /**
     * Metronome period
     * @type {Number}
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Metronome).call(this, options.audioContext));

    _this.__period = optOrDef(options.period, 1);

    /**
     * Metronome click frequency
     * @type {Number}
     */
    _this.clickFreq = optOrDef(options.clickFreq, 600);

    /**
     * Metronome click attack time
     * @type {Number}
     */
    _this.clickAttack = optOrDef(options.clickAttack, 0.002);

    /**
     * Metronome click release time
     * @type {Number}
     */
    _this.clickRelease = optOrDef(options.clickRelease, 0.098);

    _this.__lastTime = 0;
    _this.__phase = 0;

    _this.__gainNode = _this.audioContext.createGain();
    _this.__gainNode.gain.value = optOrDef(options.gain, 1);

    _this.outputNode = _this.__gainNode;
    return _this;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(Metronome, [{
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
    }

    /**
     * Get period parameter
     * @return {Number} value of period parameter
     */
    ,
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
    }

    /**
     * Get phase parameter
     * @return {Number} value of phase parameter
     */
    ,
    get: function get() {
      return this.__phase;
    }
  }]);
  return Metronome;
}(_audioTimeEngine2.default);

exports.default = Metronome;
//# sourceMappingURL=data:application/json;base64,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LEVBQ1osT0FBTyxtQkFBUCxDQUEyQixJQUEzQixFQURGOzs7Ozs7Ozt3QkFRVTtBQUNWLGFBQU8sS0FBSyxPQUFMLENBREc7OztTQXhKTyIsImZpbGUiOiJtZXRyb25vbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ldHJvbm9tZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuX19wZXJpb2QgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrRnJlcSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tGcmVxLCA2MDApO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrQXR0YWNrID0gb3B0T3JEZWYob3B0aW9ucy5jbGlja0F0dGFjaywgMC4wMDIpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIHJlbGVhc2UgdGltZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja1JlbGVhc2UgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrUmVsZWFzZSwgMC4wOTgpO1xuXG4gICAgdGhpcy5fX2xhc3RUaW1lID0gMDtcbiAgICB0aGlzLl9fcGhhc2UgPSAwO1xuXG4gICAgdGhpcy5fX2dhaW5Ob2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIHRoaXMub3V0cHV0Tm9kZSA9IHRoaXMuX19nYWluTm9kZTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICAgIHRoaXMuX19sYXN0VGltZSA9IHRpbWU7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9fcGVyaW9kID4gMCkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IChNYXRoLmZsb29yKHBvc2l0aW9uIC8gdGhpcy5fX3BlcmlvZCkgKyB0aGlzLl9fcGhhc2UpICogdGhpcy5fX3BlcmlvZDtcblxuICAgICAgaWYgKHNwZWVkID4gMCAmJiBuZXh0UG9zaXRpb24gPCBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uICs9IHRoaXMuX19wZXJpb2Q7XG4gICAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgbmV4dFBvc2l0aW9uID4gcG9zaXRpb24pXG4gICAgICAgIG5leHRQb3NpdGlvbiAtPSB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICByZXR1cm4gbmV4dFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG5cbiAgICBpZiAoc3BlZWQgPCAwKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uIC0gdGhpcy5fX3BlcmlvZDtcblxuICAgIHJldHVybiBwb3NpdGlvbiArIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogVHJpZ2dlciBtZXRyb25vbWUgY2xpY2tcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgbWV0cm9ub21lIGNsaWNrIHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICBjb25zdCBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICBjb25zdCBjbGlja0F0dGFjayA9IHRoaXMuY2xpY2tBdHRhY2s7XG4gICAgY29uc3QgY2xpY2tSZWxlYXNlID0gdGhpcy5jbGlja1JlbGVhc2U7XG5cbiAgICBjb25zdCBlbnYgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIGVudi5nYWluLnZhbHVlID0gMC4wO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEuMCwgdGltZSArIGNsaWNrQXR0YWNrKTtcbiAgICBlbnYuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKDAuMDAwMDAwMSwgdGltZSArIGNsaWNrQXR0YWNrICsgY2xpY2tSZWxlYXNlKTtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuY29ubmVjdCh0aGlzLm91dHB1dE5vZGUpO1xuXG4gICAgY29uc3Qgb3NjID0gYXVkaW9Db250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICBvc2MuZnJlcXVlbmN5LnZhbHVlID0gdGhpcy5jbGlja0ZyZXE7XG4gICAgb3NjLnN0YXJ0KHRpbWUpO1xuICAgIG9zYy5zdG9wKHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgb3NjLmNvbm5lY3QoZW52KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgZ2FpblxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWUgbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqL1xuICBzZXQgZ2Fpbih2YWx1ZSkge1xuICAgIHRoaXMuX19nYWluTm9kZS5nYWluLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGVyaW9kIHBhcmFtZXRlclxuICAgKiBAcGFyYW0ge051bWJlcn0gcGVyaW9kIG1ldHJvbm9tZSBwZXJpb2RcbiAgICovXG4gIHNldCBwZXJpb2QocGVyaW9kKSB7XG4gICAgdGhpcy5fX3BlcmlvZCA9IHBlcmlvZDtcblxuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3Rlcikge1xuICAgICAgaWYgKG1hc3Rlci5yZXNldEVuZ2luZVRpbWUpXG4gICAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVRpbWUodGhpcywgdGhpcy5fX2xhc3RUaW1lICsgcGVyaW9kKTtcbiAgICAgIGVsc2UgaWYgKG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKVxuICAgICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBlcmlvZCBwYXJhbWV0ZXJcbiAgICogQHJldHVybiB7TnVtYmVyfSB2YWx1ZSBvZiBwZXJpb2QgcGFyYW1ldGVyXG4gICAqL1xuICBnZXQgcGVyaW9kKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCBwaGFzZSBwYXJhbWV0ZXIgKGF2YWlsYWJsZSBvbmx5IHdoZW4gJ3RyYW5zcG9ydGVkJylcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBoYXNlIG1ldHJvbm9tZSBwaGFzZSBbMCwgMVtcbiAgICovXG4gIHNldCBwaGFzZShwaGFzZSkge1xuICAgIHRoaXMuX19waGFzZSA9IHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSk7XG5cbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwaGFzZSBwYXJhbWV0ZXJcbiAgICogQHJldHVybiB7TnVtYmVyfSB2YWx1ZSBvZiBwaGFzZSBwYXJhbWV0ZXJcbiAgICovXG4gIGdldCBwaGFzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BoYXNlO1xuICB9XG59XG4iXX0=