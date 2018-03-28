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

/**
 * Metronome audio engine. It extends Time Engine as a transported interface.
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/metronome.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const metronome = new audio.Metronome({period: 0.333});
 *
 * scheduler.add(metronome);
 *
 * @param {Object} [options={}] - Default options
 * @param {Number} [options.period=1] - Metronome period
 * @param {Number} [options.clickFreq=600] - Metronome click frequency
 * @param {Number} [options.clickAttack=0.002] - Metronome click attack time
 * @param {Number} [options.clickRelease=0.098] - Metronome click release time
 * @param {Number} [options.gain=1] - Gain
 */

var Metronome = function (_AudioTimeEngine) {
  (0, _inherits3.default)(Metronome, _AudioTimeEngine);

  function Metronome() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Metronome);

    /**
     * Metronome period
     * @type {Number}
     * @private
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Metronome.__proto__ || (0, _getPrototypeOf2.default)(Metronome)).call(this, options.audioContext));

    _this.__period = optOrDef(options.period, 1);

    /**
     * Metronome click frequency
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickFreq
     * @instance
     */
    _this.clickFreq = optOrDef(options.clickFreq, 600);

    /**
     * Metronome click attack time
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickAttack
     * @instance
     */
    _this.clickAttack = optOrDef(options.clickAttack, 0.002);

    /**
     * Metronome click release time
     *
     * @type {Number}
     * @memberof Metronome
     * @name clickRelease
     * @instance
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
     * linear gain factor
     *
     * @type {Number}
     * @name gain
     * @memberof Metronome
     * @instance
     */

  }, {
    key: 'gain',
    set: function set(value) {
      this.__gainNode.gain.value = value;
    },
    get: function get() {
      return this.__gainNode.gain.value;
    }

    /**
     * metronome period
     *
     * @type {Number}
     * @name period
     * @memberof Metronome
     * @instance
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
    get: function get() {
      return this.__period;
    }

    /**
     * Set phase parameter (available only when 'transported'), should be
     * between [0, 1[
     *
     * @type {Number}
     * @name phase
     * @memberof Metronome
     * @instance
     */

  }, {
    key: 'phase',
    set: function set(phase) {
      this.__phase = phase - Math.floor(phase);

      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this);
    },
    get: function get() {
      return this.__phase;
    }
  }]);
  return Metronome;
}(_audioTimeEngine2.default);

exports.default = Metronome;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldHJvbm9tZS5qcyJdLCJuYW1lcyI6WyJvcHRPckRlZiIsIm9wdCIsImRlZiIsInVuZGVmaW5lZCIsIk1ldHJvbm9tZSIsIm9wdGlvbnMiLCJhdWRpb0NvbnRleHQiLCJfX3BlcmlvZCIsInBlcmlvZCIsImNsaWNrRnJlcSIsImNsaWNrQXR0YWNrIiwiY2xpY2tSZWxlYXNlIiwiX19sYXN0VGltZSIsIl9fcGhhc2UiLCJfX2dhaW5Ob2RlIiwiY3JlYXRlR2FpbiIsImdhaW4iLCJ2YWx1ZSIsIm91dHB1dE5vZGUiLCJ0aW1lIiwidHJpZ2dlciIsInBvc2l0aW9uIiwic3BlZWQiLCJuZXh0UG9zaXRpb24iLCJNYXRoIiwiZmxvb3IiLCJJbmZpbml0eSIsImVudiIsInNldFZhbHVlQXRUaW1lIiwibGluZWFyUmFtcFRvVmFsdWVBdFRpbWUiLCJleHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lIiwiY29ubmVjdCIsIm9zYyIsImNyZWF0ZU9zY2lsbGF0b3IiLCJmcmVxdWVuY3kiLCJzdGFydCIsInN0b3AiLCJtYXN0ZXIiLCJyZXNldEVuZ2luZVRpbWUiLCJyZXNldEVuZ2luZVBvc2l0aW9uIiwicGhhc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUVBLFNBQVNBLFFBQVQsQ0FBa0JDLEdBQWxCLEVBQXVCQyxHQUF2QixFQUE0QjtBQUMxQixNQUFHRCxRQUFRRSxTQUFYLEVBQ0UsT0FBT0YsR0FBUDs7QUFFRixTQUFPQyxHQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUJNRSxTOzs7QUFDSix1QkFBMEI7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7QUFBQTs7QUFHeEI7Ozs7O0FBSHdCLDRJQUNsQkEsUUFBUUMsWUFEVTs7QUFReEIsVUFBS0MsUUFBTCxHQUFnQlAsU0FBU0ssUUFBUUcsTUFBakIsRUFBeUIsQ0FBekIsQ0FBaEI7O0FBRUE7Ozs7Ozs7O0FBUUEsVUFBS0MsU0FBTCxH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RCxLO3dCQUVVO0FBQ1QsYUFBTyxLQUFLSCxVQUFMLENBQWdCRSxJQUFoQixDQUFxQkMsS0FBNUI7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7c0JBUVdULE0sRUFBUTtBQUNqQixXQUFLRCxRQUFMLEdBQWdCQyxNQUFoQjs7QUFFQSxVQUFNNkIsU0FBUyxLQUFLQSxNQUFwQjs7QUFFQSxVQUFJQSxNQUFKLEVBQVk7QUFDVixZQUFJQSxPQUFPQyxlQUFYLEVBQ0VELE9BQU9DLGVBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsS0FBSzFCLFVBQUwsR0FBa0JKLE1BQS9DLEVBREYsS0FFSyxJQUFJNkIsT0FBT0UsbUJBQVgsRUFDSEYsT0FBT0UsbUJBQVAsQ0FBMkIsSUFBM0I7QUFDSDtBQUNGLEs7d0JBRVk7QUFDWCxhQUFPLEtBQUtoQyxRQUFaO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7OztzQkFTVWlDLEssRUFBTztBQUNmLFdBQUszQixPQUFMLEdBQWUyQixRQUFRaEIsS0FBS0MsS0FBTCxDQUFXZSxLQUFYLENBQXZCOztBQUVBLFVBQU1ILFNBQVMsS0FBS0EsTUFBcEI7O0FBRUEsVUFBSUEsVUFBVUEsT0FBT0UsbUJBQVAsS0FBK0JwQyxTQUE3QyxFQUNFa0MsT0FBT0UsbUJBQVAsQ0FBMkIsSUFBM0I7QUFDSCxLO3dCQUVXO0FBQ1YsYUFBTyxLQUFLMUIsT0FBWjtBQUNEOzs7OztrQkFHWVQsUyIsImZpbGUiOiJtZXRyb25vbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogTWV0cm9ub21lIGF1ZGlvIGVuZ2luZS4gSXQgZXh0ZW5kcyBUaW1lIEVuZ2luZSBhcyBhIHRyYW5zcG9ydGVkIGludGVyZmFjZS5cbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvbWV0cm9ub21lLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3Qgc2NoZWR1bGVyID0gYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG4gKiBjb25zdCBtZXRyb25vbWUgPSBuZXcgYXVkaW8uTWV0cm9ub21lKHtwZXJpb2Q6IDAuMzMzfSk7XG4gKlxuICogc2NoZWR1bGVyLmFkZChtZXRyb25vbWUpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2Q9MV0gLSBNZXRyb25vbWUgcGVyaW9kXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tGcmVxPTYwMF0gLSBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tBdHRhY2s9MC4wMDJdIC0gTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tSZWxlYXNlPTAuMDk4XSAtIE1ldHJvbm9tZSBjbGljayByZWxlYXNlIHRpbWVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gR2FpblxuICovXG5jbGFzcyBNZXRyb25vbWUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX19wZXJpb2QgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja0ZyZXFcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrRnJlcSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tGcmVxLCA2MDApO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja0F0dGFja1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tBdHRhY2sgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrQXR0YWNrLCAwLjAwMik7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja1JlbGVhc2VcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrUmVsZWFzZSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tSZWxlYXNlLCAwLjA5OCk7XG5cbiAgICB0aGlzLl9fbGFzdFRpbWUgPSAwO1xuICAgIHRoaXMuX19waGFzZSA9IDA7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19wZXJpb2QgPiAwKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gKE1hdGguZmxvb3IocG9zaXRpb24gLyB0aGlzLl9fcGVyaW9kKSArIHRoaXMuX19waGFzZSkgKiB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICBpZiAoc3BlZWQgPiAwICYmIG5leHRQb3NpdGlvbiA8IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gKz0gdGhpcy5fX3BlcmlvZDtcbiAgICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBuZXh0UG9zaXRpb24gPiBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uIC09IHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMuX19wZXJpb2Q7XG5cbiAgICByZXR1cm4gcG9zaXRpb24gKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgY2xpY2tBdHRhY2sgPSB0aGlzLmNsaWNrQXR0YWNrO1xuICAgIGNvbnN0IGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuXG4gICAgY29uc3QgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBlbnYuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIHRpbWUgKyBjbGlja0F0dGFjayk7XG4gICAgZW52LmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgIGNvbnN0IG9zYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuY2xpY2tGcmVxO1xuICAgIG9zYy5zdGFydCh0aW1lKTtcbiAgICBvc2Muc3RvcCh0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIG9zYy5jb25uZWN0KGVudik7XG4gIH1cblxuICAvKipcbiAgICogbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGdhaW5cbiAgICogQG1lbWJlcm9mIE1ldHJvbm9tZVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBtZXRyb25vbWUgcGVyaW9kXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHBlcmlvZFxuICAgKiBAbWVtYmVyb2YgTWV0cm9ub21lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IHBlcmlvZChwZXJpb2QpIHtcbiAgICB0aGlzLl9fcGVyaW9kID0gcGVyaW9kO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyKSB7XG4gICAgICBpZiAobWFzdGVyLnJlc2V0RW5naW5lVGltZSlcbiAgICAgICAgbWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aGlzLl9fbGFzdFRpbWUgKyBwZXJpb2QpO1xuICAgICAgZWxzZSBpZiAobWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24pXG4gICAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBwZXJpb2QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBoYXNlIHBhcmFtZXRlciAoYXZhaWxhYmxlIG9ubHkgd2hlbiAndHJhbnNwb3J0ZWQnKSwgc2hvdWxkIGJlXG4gICAqIGJldHdlZW4gWzAsIDFbXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHBoYXNlXG4gICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgcGhhc2UocGhhc2UpIHtcbiAgICB0aGlzLl9fcGhhc2UgPSBwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgfVxuXG4gIGdldCBwaGFzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BoYXNlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1ldHJvbm9tZTtcbiJdfQ==