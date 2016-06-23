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

      return Infinity * speed;
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
//# sourceMappingURL=data:application/json;base64,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U0FBL0IsRUFDWixPQUFPLG1CQUFQLENBQTJCLElBQTNCLEVBREY7Ozs7Ozs7O3dCQVFVO0FBQ1YsYUFBTyxLQUFLLE9BQUwsQ0FERzs7O1NBeEpPIiwiZmlsZSI6Im1ldHJvbm9tZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9hdWRpby10aW1lLWVuZ2luZSc7XG5cbmZ1bmN0aW9uIG9wdE9yRGVmKG9wdCwgZGVmKSB7XG4gIGlmKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWV0cm9ub21lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5fX3BlcmlvZCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kLCAxKTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayBmcmVxdWVuY3lcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tGcmVxID0gb3B0T3JEZWYob3B0aW9ucy5jbGlja0ZyZXEsIDYwMCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgYXR0YWNrIHRpbWVcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tBdHRhY2sgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrQXR0YWNrLCAwLjAwMik7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrUmVsZWFzZSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tSZWxlYXNlLCAwLjA5OCk7XG5cbiAgICB0aGlzLl9fbGFzdFRpbWUgPSAwO1xuICAgIHRoaXMuX19waGFzZSA9IDA7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19wZXJpb2QgPiAwKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gKE1hdGguZmxvb3IocG9zaXRpb24gLyB0aGlzLl9fcGVyaW9kKSArIHRoaXMuX19waGFzZSkgKiB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICBpZiAoc3BlZWQgPiAwICYmIG5leHRQb3NpdGlvbiA8IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gKz0gdGhpcy5fX3BlcmlvZDtcbiAgICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBuZXh0UG9zaXRpb24gPiBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uIC09IHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMuX19wZXJpb2Q7XG5cbiAgICByZXR1cm4gcG9zaXRpb24gKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgY2xpY2tBdHRhY2sgPSB0aGlzLmNsaWNrQXR0YWNrO1xuICAgIGNvbnN0IGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuXG4gICAgY29uc3QgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBlbnYuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIHRpbWUgKyBjbGlja0F0dGFjayk7XG4gICAgZW52LmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgIGNvbnN0IG9zYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuY2xpY2tGcmVxO1xuICAgIG9zYy5zdGFydCh0aW1lKTtcbiAgICBvc2Muc3RvcCh0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIG9zYy5jb25uZWN0KGVudik7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBlcmlvZCBwYXJhbWV0ZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBlcmlvZCBtZXRyb25vbWUgcGVyaW9kXG4gICAqL1xuICBzZXQgcGVyaW9kKHBlcmlvZCkge1xuICAgIHRoaXMuX19wZXJpb2QgPSBwZXJpb2Q7XG5cbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIpIHtcbiAgICAgIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKVxuICAgICAgICBtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRoaXMuX19sYXN0VGltZSArIHBlcmlvZCk7XG4gICAgICBlbHNlIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbilcbiAgICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwZXJpb2QgcGFyYW1ldGVyXG4gICAqIEByZXR1cm4ge051bWJlcn0gdmFsdWUgb2YgcGVyaW9kIHBhcmFtZXRlclxuICAgKi9cbiAgZ2V0IHBlcmlvZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGhhc2UgcGFyYW1ldGVyIChhdmFpbGFibGUgb25seSB3aGVuICd0cmFuc3BvcnRlZCcpXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwaGFzZSBtZXRyb25vbWUgcGhhc2UgWzAsIDFbXG4gICAqL1xuICBzZXQgcGhhc2UocGhhc2UpIHtcbiAgICB0aGlzLl9fcGhhc2UgPSBwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGhhc2UgcGFyYW1ldGVyXG4gICAqIEByZXR1cm4ge051bWJlcn0gdmFsdWUgb2YgcGhhc2UgcGFyYW1ldGVyXG4gICAqL1xuICBnZXQgcGhhc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19waGFzZTtcbiAgfVxufVxuIl19