(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

var _wavesMasters = require('waves-masters');

var _audioContext = require('./audioContext');

var _audioContext2 = _interopRequireDefault(_audioContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This is the base class for all audio related time engine components. It is
 * used to handle audio related events such as the playback of a media stream.
 * It extends the TimeEngine class by the standard web audio node methods
 * connect and disconnect.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/audio-time-engine.html}
 *
 * @extends TimeEngine
 * @example
 * import audio from 'waves-audio';
 *
 * class MyEngine extends audio.AudioTimeEngine {
 *   constructor() {
 *     super();
 *     // ...
 *   }
 * }
 */
var AudioTimeEngine = function (_TimeEngine) {
  (0, _inherits3.default)(AudioTimeEngine, _TimeEngine);

  function AudioTimeEngine() {
    var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;
    (0, _classCallCheck3.default)(this, AudioTimeEngine);

    /**
     * Audio context used by the TimeEngine, default to the global audioContext
     *
     * @name audioContext
     * @type AudioContext
     * @memberof AudioTimeEngine
     * @see audioContext
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (AudioTimeEngine.__proto__ || (0, _getPrototypeOf2.default)(AudioTimeEngine)).call(this));

    _this.audioContext = audioContext;

    /**
     * Output audio node. By default the connect method connects a given node
     * to this output node.
     *
     * @name outputNode
     * @type AudioNode
     * @memberof AudioTimeEngine
     * @default null
     */
    _this.outputNode = null;
    return _this;
  }

  /**
   * Connect to an audio node (e.g. audioContext.destination)
   *
   * @param {AudioNode} target - Target audio node
   */


  (0, _createClass3.default)(AudioTimeEngine, [{
    key: 'connect',
    value: function connect(target) {
      this.outputNode.connect(target);
      return this;
    }

    /**
     * Disconnect from an audio node (e.g. audioContext.destination). If undefined
     * disconnect from all target nodes.
     *
     * @param {AudioNode} target - Target audio node.
     */

  }, {
    key: 'disconnect',
    value: function disconnect(connection) {
      this.outputNode.disconnect(connection);
      return this;
    }
  }]);
  return AudioTimeEngine;
}(_wavesMasters.TimeEngine);

exports.default = AudioTimeEngine;

},{"./audioContext":2,"babel-runtime/core-js/object/get-prototype-of":38,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/createClass":43,"babel-runtime/helpers/inherits":44,"babel-runtime/helpers/possibleConstructorReturn":45,"waves-masters":147}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var AudioContext = window.AudioContext || window.webkitAudioContext;

/**
 * Expose a unique audio context singleton as the default audio
 * context used by the components of the Waves Audio library and
 * applications using the library.
 *
 * @type AudioContext
 * @name audioContext
 * @constant
 * @global
 * @instance
 *
 * @example
 * import * as audio from 'waves-audio';
 * const audioContext = audio.audioContext;
 */
var audioContext = null;

if (AudioContext) audioContext = new AudioContext();

exports.default = audioContext;

},{}],3:[function(require,module,exports){
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

var _AudioTimeEngine2 = require('../core/AudioTimeEngine');

var _AudioTimeEngine3 = _interopRequireDefault(_AudioTimeEngine2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

/**
 * Granular synthesis TimeEngine implementing the scheduled interface.
 * The grain position (grain onset or center time in the audio buffer) is
 * optionally determined by the engine's currentPosition attribute.
 *
 * Example that shows a `GranularEngine` (with a few parameter controls) driven
 * by a `Scheduler` and a `PlayControl`:
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/granular-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const granularEngine = new audio.GranularEngine();
 *
 * scheduler.add(granularEngine);
 *
 *
 * @param {Object} options={} - Parameters
 * @param {AudioBuffer} [options.buffer=null] - Audio buffer
 * @param {Number} [options.periodAbs=0.01] - Absolute grain period in sec
 * @param {Number} [options.periodRel=0] - Grain period relative to absolute
 *  duration
 * @param {Number} [options.periodVar=0] - Amout of random grain period
 *  variation relative to grain period
 * @param {Number} [options.periodMin=0.001] - Minimum grain period
 * @param {Number} [options.position=0] - Grain position (onset time in audio
 *  buffer) in sec
 * @param {Number} [options.positionVar=0.003] - Amout of random grain position
 *  variation in sec
 * @param {Number} [options.durationAbs=0.1] - Absolute grain duration in sec
 * @param {Number} [options.durationRel=0] - Grain duration relative to grain
 *  period (overlap)
 * @param {Number} [options.attackAbs=0] - Absolute attack time in sec
 * @param {Number} [options.attackRel=0.5] - Attack time relative to grain duration
 * @param {String} [options.attackShape='lin'] - Shape of attack
 * @param {Number} [options.releaseAbs=0] - Absolute release time in sec
 * @param {Number} [options.releaseRel=0.5] - Release time relative to grain duration
 * @param {Number} [options.releaseShape='lin'] - Shape of release
 * @param {String} [options.expRampOffset=0.0001] - Offset (start/end value)
 *  for exponential attack/release
 * @param {Number} [options.resampling=0] - Grain resampling in cent
 * @param {Number} [options.resamplingVar=0] - Amout of random resampling variation in cent
 * @param {Number} [options.gain=1] - Linear gain factor
 * @param {Boolean} [options.centered=true] - Whether the grain position refers
 *  to the center of the grain (or the beginning)
 * @param {Boolean} [options.cyclic=false] - Whether the audio buffer and grain
 *  position are considered as cyclic
 * @param {Number} [options.wrapAroundExtension=0] - Portion at the end of the
 *  audio buffer that has been copied from the beginning to assure cyclic behavior
 */

var GranularEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(GranularEngine, _AudioTimeEngine);

  function GranularEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, GranularEngine);

    /**
     * Audio buffer
     *
     * @type {AudioBuffer}
     * @name buffer
     * @default null
     * @memberof GranularEngine
     * @instance
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (GranularEngine.__proto__ || (0, _getPrototypeOf2.default)(GranularEngine)).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute grain period in sec
     *
     * @type {Number}
     * @name periodAbs
     * @default 0.01
     * @memberof GranularEngine
     * @instance
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0.01);

    /**
     * Grain period relative to absolute duration
     *
     * @type {Number}
     * @name periodRel
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.periodRel = optOrDef(options.periodRel, 0);

    /**
     * Amout of random grain period variation relative to grain period
     *
     * @type {Number}
     * @name periodVar
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Minimum grain period
     *
     * @type {Number}
     * @name periodMin
     * @default 0.001
     * @memberof GranularEngine
     * @instance
     */
    _this.periodMin = optOrDef(options.periodMin, 0.001);

    /**
     * Grain position (onset time in audio buffer) in sec
     *
     * @type {Number}
     * @name position
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.position = optOrDef(options.position, 0);

    /**
     * Amout of random grain position variation in sec
     *
     * @type {Number}
     * @name positionVar
     * @default 0.003
     * @memberof GranularEngine
     * @instance
     */
    _this.positionVar = optOrDef(options.positionVar, 0.003);

    /**
     * Absolute grain duration in sec
     *
     * @type {Number}
     * @name durationAbs
     * @default 0.1
     * @memberof GranularEngine
     * @instance
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0.1); // absolute grain duration

    /**
     * Grain duration relative to grain period (overlap)
     *
     * @type {Number}
     * @name durationRel
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.durationRel = optOrDef(options.durationRel, 0);

    /**
     * Absolute attack time in sec
     *
     * @type {Number}
     * @name attackAbs
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0);

    /**
     * Attack time relative to grain duration
     *
     * @type {Number}
     * @name attackRel
     * @default 0.5
     * @memberof GranularEngine
     * @instance
     */
    _this.attackRel = optOrDef(options.attackRel, 0.5);

    /**
     * Shape of attack ('lin' for linear ramp, 'exp' for exponential ramp)
     *
     * @type {String}
     * @name attackShape
     * @default 'lin'
     * @memberof GranularEngine
     * @instance
     */
    _this.attackShape = optOrDef(options.attackShape, 'lin');

    /**
     * Absolute release time in sec
     *
     * @type {Number}
     * @name releaseAbs
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0);

    /**
     * Release time relative to grain duration
     *
     * @type {Number}
     * @name releaseRel
     * @default 0.5
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0.5);

    /**
     * Shape of release ('lin' for linear ramp, 'exp' for exponential ramp)
     *
     * @type {String}
     * @name releaseShape
     * @default 'lin'
     * @memberof GranularEngine
     * @instance
     */
    _this.releaseShape = optOrDef(options.releaseShape, 'lin');

    /**
     * Offset (start/end value) for exponential attack/release
     *
     * @type {Number}
     * @name expRampOffset
     * @default 0.0001
     * @memberof GranularEngine
     * @instance
     */
    _this.expRampOffset = optOrDef(options.expRampOffset, 0.0001);

    /**
     * Grain resampling in cent
     *
     * @type {Number}
     * @name resampling
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     *
     * @type {Number}
     * @name resamplingVar
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     *
     * @type {Number}
     * @name gain
     * @default 1
     * @memberof GranularEngine
     * @instance
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Whether the grain position refers to the center of the grain (or the beginning)
     *
     * @type {Boolean}
     * @name centered
     * @default true
     * @memberof GranularEngine
     * @instance
     */
    _this.centered = optOrDef(options.centered, true);

    /**
     * Whether the audio buffer and grain position are considered as cyclic
     *
     * @type {Boolean}
     * @name cyclic
     * @default false
     * @memberof GranularEngine
     * @instance
     */
    _this.cyclic = optOrDef(options.cyclic, false);

    /**
     * Portion at the end of the audio buffer that has been copied from the
     * beginning to assure cyclic behavior
     *
     * @type {Number}
     * @name wrapAroundExtension
     * @default 0
     * @memberof GranularEngine
     * @instance
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   *
   * @type {Number}
   * @name bufferDuration
   * @memberof GranularEngine
   * @instance
   * @readonly
   */


  (0, _createClass3.default)(GranularEngine, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    /**
     * Trigger a grain. This function can be called at any time (whether the
     * engine is scheduled or not) to generate a single grain according to the
     * current grain parameters.
     *
     * @param {Number} time - grain synthesis audio time
     * @return {Number} - period to next grain
     */

  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var grainTime = time || audioContext.currentTime;
      var grainPeriod = this.periodAbs;
      var grainPosition = this.currentPosition;
      var grainDuration = this.durationAbs;

      if (this.buffer) {
        var resamplingRate = 1.0;

        // calculate resampling
        if (this.resampling !== 0 || this.resamplingVar > 0) {
          var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
          resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
        }

        grainPeriod += this.periodRel * grainDuration;
        grainDuration += this.durationRel * grainPeriod;

        // grain period randon variation
        if (this.periodVar > 0.0) grainPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

        // center grain
        if (this.centered) grainPosition -= 0.5 * grainDuration;

        // randomize grain position
        if (this.positionVar > 0) grainPosition += (2.0 * Math.random() - 1) * this.positionVar;

        var bufferDuration = this.bufferDuration;

        // wrap or clip grain position and duration into buffer duration
        if (grainPosition < 0 || grainPosition >= bufferDuration) {
          if (this.cyclic) {
            var cycles = grainPosition / bufferDuration;
            grainPosition = (cycles - Math.floor(cycles)) * bufferDuration;

            if (grainPosition + grainDuration > this.buffer.duration) grainDuration = this.buffer.duration - grainPosition;
          } else {
            if (grainPosition < 0) {
              grainTime -= grainPosition;
              grainDuration += grainPosition;
              grainPosition = 0;
            }

            if (grainPosition + grainDuration > bufferDuration) grainDuration = bufferDuration - grainPosition;
          }
        }

        // make grain
        if (this.gain > 0 && grainDuration >= 0.001) {
          // make grain envelope
          var envelope = audioContext.createGain();
          var attack = this.attackAbs + this.attackRel * grainDuration;
          var release = this.releaseAbs + this.releaseRel * grainDuration;

          if (attack + release > grainDuration) {
            var factor = grainDuration / (attack + release);
            attack *= factor;
            release *= factor;
          }

          var attackEndTime = grainTime + attack;
          var grainEndTime = grainTime + grainDuration / resamplingRate;
          var releaseStartTime = grainEndTime - release;

          envelope.gain.value = 0;

          if (this.attackShape === 'lin') {
            envelope.gain.setValueAtTime(0.0, grainTime);
            envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);
          } else {
            envelope.gain.setValueAtTime(this.expRampOffset, grainTime);
            envelope.gain.exponentialRampToValueAtTime(this.gain, attackEndTime);
          }

          if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

          if (this.releaseShape === 'lin') {
            envelope.gain.linearRampToValueAtTime(0.0, grainEndTime);
          } else {
            envelope.gain.exponentialRampToValueAtTime(this.expRampOffset, grainEndTime);
          }

          envelope.connect(this.outputNode);

          // make source
          var source = audioContext.createBufferSource();

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;
          source.connect(envelope);

          source.start(grainTime, grainPosition);
          source.stop(grainEndTime);
        }
      }

      return Math.max(this.periodMin, grainPeriod);
    }
  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

        if (this.wrapAroundExtension) bufferDuration -= this.wrapAroundExtension;

        return bufferDuration;
      }

      return 0;
    }

    /**
     * Current position
     *
     * @type {Number}
     * @name currentPosition
     * @memberof GranularEngine
     * @instance
     * @readonly
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return this.position;
    }
  }]);
  return GranularEngine;
}(_AudioTimeEngine3.default);

exports.default = GranularEngine;

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":38,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/createClass":43,"babel-runtime/helpers/inherits":44,"babel-runtime/helpers/possibleConstructorReturn":45}],4:[function(require,module,exports){
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

var _AudioTimeEngine2 = require('../core/AudioTimeEngine');

var _AudioTimeEngine3 = _interopRequireDefault(_AudioTimeEngine2);

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
}(_AudioTimeEngine3.default);

exports.default = Metronome;

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":38,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/createClass":43,"babel-runtime/helpers/inherits":44,"babel-runtime/helpers/possibleConstructorReturn":45}],5:[function(require,module,exports){
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

var _AudioTimeEngine2 = require('../core/AudioTimeEngine');

var _AudioTimeEngine3 = _interopRequireDefault(_AudioTimeEngine2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

/**
 * Used with a buffer to serve audio files.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/player-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const playerEngine = audio.PlayerEngine();
 * const playControl = new audio.PlayControl(playerEngine);
 *
 * playControl.start();
 *
 * @param {Object} [options={}] - Default options
 * @param {Number} [options.buffer=1] - Audio buffer
 * @param {Number} [options.fadeTime=600] - Fade time for chaining segments
 * @param {Number} [options.cyclic=false] - Loop mode
 * @param {Number} [options.gain=1] - Gain
 */

var PlayerEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(PlayerEngine, _AudioTimeEngine);

  function PlayerEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, PlayerEngine);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerEngine.__proto__ || (0, _getPrototypeOf2.default)(PlayerEngine)).call(this, options.audioContext));

    _this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     *
     * @type {AudioBuffer}
     * @name buffer
     * @memberof PlayerEngine
     * @instance
     * @default null
     */
    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     *
     * @type {Number}
     * @name fadeTime
     * @memberof PlayerEngine
     * @instance
     * @default 0.005
     */
    _this.fadeTime = optOrDef(options.fadeTime, 0.005);

    _this.__time = 0;
    _this.__position = 0;
    _this.__speed = 0;

    _this.__bufferSource = null;
    _this.__envNode = null;

    _this.__gainNode = _this.audioContext.createGain();
    _this.__gainNode.gain.value = optOrDef(options.gain, 1);

    _this.__cyclic = optOrDef(options.cyclic, false);

    _this.outputNode = _this.__gainNode;
    return _this;
  }

  (0, _createClass3.default)(PlayerEngine, [{
    key: '__start',
    value: function __start(time, position, speed) {
      var audioContext = this.audioContext;

      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

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
    }
  }, {
    key: '__halt',
    value: function __halt(time) {
      if (this.__bufferSource) {
        this.__envNode.gain.cancelScheduledValues(time);
        this.__envNode.gain.setValueAtTime(this.__envNode.gain.value, time);
        this.__envNode.gain.linearRampToValueAtTime(0, time + this.fadeTime);
        this.__bufferSource.stop(time + this.fadeTime);

        this.__bufferSource = null;
        this.__envNode = null;
      }
    }

    // TimeEngine method (speed-controlled interface)

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

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
    }

    /**
     * Set whether the audio buffer is considered as cyclic
     * @type {Bool}
     * @name cyclic
     * @memberof PlayerEngine
     * @instance
     */

  }, {
    key: 'cyclic',
    set: function set(cyclic) {
      if (cyclic !== this.__cyclic) {
        var time = this.currentTime;
        var position = this.currentosition;

        this.__halt(time);
        this.__cyclic = cyclic;

        if (this.__speed !== 0) this.__start(time, position, this.__speed);
      }
    },
    get: function get() {
      return this.__cyclic;
    }

    /**
     * Linear gain factor
     * @type {Number}
     * @name gain
     * @memberof PlayerEngine
     * @instance
     */

  }, {
    key: 'gain',
    set: function set(value) {
      var time = this.currentTime;
      this.__gainNode.cancelScheduledValues(time);
      this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
      this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
    },
    get: function get() {
      return this.__gainNode.gain.value;
    }

    /**
     * Get buffer duration
     * @type {Number}
     * @name bufferDuration
     * @memberof PlayerEngine
     * @instance
     * @readonly
     */

  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) return this.buffer.duration;

      return 0;
    }
  }]);
  return PlayerEngine;
}(_AudioTimeEngine3.default);

exports.default = PlayerEngine;

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":38,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/createClass":43,"babel-runtime/helpers/inherits":44,"babel-runtime/helpers/possibleConstructorReturn":45}],6:[function(require,module,exports){
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

var _AudioTimeEngine2 = require('../core/AudioTimeEngine');

var _AudioTimeEngine3 = _interopRequireDefault(_AudioTimeEngine2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function optOrDef(opt, def) {
  if (opt !== undefined) return opt;

  return def;
}

function getCurrentOrPreviousIndex(sortedArray, value) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value < firstVal) index = -1;else if (value >= lastVal) index = size - 1;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] > value) {
        index--;
      }while (sortedArray[index + 1] <= value) {
        index++;
      }
    }
  }

  return index;
}

function getCurrentOrNextIndex(sortedArray, value) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value <= firstVal) index = 0;else if (value >= lastVal) index = size;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] < value) {
        index++;
      }while (sortedArray[index - 1] >= value) {
        index--;
      }
    }
  }

  return index;
}

/**
 * Used with a buffer to serve audio files via granular synthesis.
 *
 * The engine implements the "scheduled" and "transported" interfaces.
 * When "scheduled", the engine  generates segments more or less periodically
 * (controlled by the periodAbs, periodRel, and perioVar attributes).
 * When "transported", the engine generates segments at the position of their onset time.
 *
 * Example that shows a `SegmentEngine` with a few parameter controls running in a `Scheduler`.
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/segment-engine.html}
 *
 * @extends AudioTimeEngine
 * @example
 * import * as audio from 'waves-audio';
 * const scheduler = audio.getScheduler();
 * const segmentEngine = new audio.SegmentEngine();
 *
 * scheduler.add(segmentEngine);
 *
 * @param {Object} [options={}] - Default options
 * @param {AudioBuffer} [options.buffer=null] - Audio buffer
 * @param {Number} [options.periodAbs=0] - Absolute segment period in sec
 * @param {Number} [options.periodRel=1] - Segment period relative to inter-segment distance
 * @param {Number} [options.periodVar=0] - Amout of random segment period variation relative
 *  to segment period
 * @param {Number} [options.periodMin=0.001] - Minimum segment period
 * @param {Number} [options.positionArray=[0.0]] - Array of segment positions (onset times
 *  in audio buffer) in sec
 * @param {Number} [options.positionVar=0] - Amout of random segment position variation in sec
 * @param {Number} [options.durationArray=[0.0]] - Array of segment durations in sec
 * @param {Number} [options.durationAbs=0] - Absolute segment duration in sec
 * @param {Number} [options.durationRel=1] - Segment duration relative to given segment
 *  duration or inter-segment distance
 * @param {Array} [options.offsetArray=[0.0]] - Array of segment offsets in sec
 * @param {Number} [options.offsetAbs=-0.005] - Absolute segment offset in sec
 * @param {Number} [options.offsetRel=0] - Segment offset relative to segment duration
 * @param {Number} [options.delay=0.005] - Time by which all segments are delayed (especially
 *  to realize segment offsets)
 * @param {Number} [options.attackAbs=0.005] - Absolute attack time in sec
 * @param {Number} [options.attackRel=0] - Attack time relative to segment duration
 * @param {Number} [options.releaseAbs=0.005] - Absolute release time in sec
 * @param {Number} [options.releaseRel=0] - Release time relative to segment duration
 * @param {Number} [options.resampling=0] - Segment resampling in cent
 * @param {Number} [options.resamplingVar=0] - Amout of random resampling variation in cent
 * @param {Number} [options.gain=1] - Linear gain factor
 * @param {Number} [options.abortTime=0.005] - fade-out time when aborted
 * @param {Number} [options.segmentIndex=0] - Index of the segment to synthesize (i.e. of
 *  this.positionArray/durationArray/offsetArray)
 * @param {Bool} [options.cyclic=false] - Whether the audio buffer and segment indices are
 *  considered as cyclic
 * @param {Number} [options.wrapAroundExtension=0] - Portion at the end of the audio buffer
 *  that has been copied from the beginning to assure cyclic behavior
 */

var SegmentEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(SegmentEngine, _AudioTimeEngine);

  function SegmentEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, SegmentEngine);

    /**
     * Audio buffer
     * @name buffer
     * @type {AudioBuffer}
     * @default null
     * @memberof SegmentEngine
     * @instance
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (SegmentEngine.__proto__ || (0, _getPrototypeOf2.default)(SegmentEngine)).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute segment period in sec
     * @name periodAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0);

    /**
     * Segment period relative to inter-segment distance
     * @name periodRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodRel = optOrDef(options.periodRel, 1);

    /**
     * Amout of random segment period variation relative to segment period
     * @name periodVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Minimum segment period
     * @name periodMin
     * @type {Number}
     * @default 0.001
     * @memberof SegmentEngine
     * @instance
     */
    _this.periodMin = optOrDef(options.periodMin, 0.001);

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @name positionArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.positionArray = optOrDef(options.positionArray, [0.0]);

    /**
     * Amout of random segment position variation in sec
     * @name positionVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.positionVar = optOrDef(options.positionVar, 0);

    /**
     * Array of segment durations in sec
     * @name durationArray
     * @type {Number}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationArray = optOrDef(options.durationArray, [0.0]);

    /**
     * Absolute segment duration in sec
     * @name durationAbs
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0);

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @name durationRel
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.durationRel = optOrDef(options.durationRel, 1);

    /**
     * Array of segment offsets in sec
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position
     * and the duration has to be corrected by the offset
     *
     * @name offsetArray
     * @type {Array}
     * @default [0.0]
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetArray = optOrDef(options.offsetArray, [0.0]);

    /**
     * Absolute segment offset in sec
     * @name offsetAbs
     * @type {Number}
     * @default -0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetAbs = optOrDef(options.offsetAbs, -0.005);

    /**
     * Segment offset relative to segment duration
     * @name offsetRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.offsetRel = optOrDef(options.offsetRel, 0);

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @name delay
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.delay = optOrDef(options.delay, 0.005);

    /**
     * Absolute attack time in sec
     * @name attackAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0.005);

    /**
     * Attack time relative to segment duration
     * @name attackRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.attackRel = optOrDef(options.attackRel, 0);

    /**
     * Absolute release time in sec
     * @name releaseAbs
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0.005);

    /**
     * Release time relative to segment duration
     * @name releaseRel
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0);

    /**
     * Segment resampling in cent
     * @name resampling
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @name resamplingVar
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @name gain
     * @type {Number}
     * @default 1
     * @memberof SegmentEngine
     * @instance
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Index of the segment to synthesize (i.e. of this.positionArray/durationArray/offsetArray)
     * @name segmentIndex
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.segmentIndex = optOrDef(options.segmentIndex, 0);

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @name cyclic
     * @type {Bool}
     * @default false
     * @memberof SegmentEngine
     * @instance
     */
    _this.cyclic = optOrDef(options.cyclic, false);
    _this.__cyclicOffset = 0;

    /**
     * Whether the last segment is aborted when triggering the next
     * @name monophonic
     * @type {Number}
     * @default false
     * @memberof SegmentEngine
     * @instance
     */
    _this.monophonic = optOrDef(options.monophonic, false);
    _this.__currentSrc = null;
    _this.__currentEnv = null;
    _this.__releaseStartTime = 0;
    _this.__currentGain = 0;
    _this.__currentEndTime = 0;

    /**
     * Fade-out time (when aborted)
     * @name abortTime
     * @type {Number}
     * @default 0.005
     * @memberof SegmentEngine
     * @instance
     */
    _this.abortTime = optOrDef(options.abortTime, 0.005);

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @name wrapAroundExtension
     * @type {Number}
     * @default 0
     * @memberof SegmentEngine
     * @instance
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   *
   * @type {Number}
   * @default 0
   * @memberof SegmentEngine
   * @instance
   */


  (0, _createClass3.default)(SegmentEngine, [{
    key: 'advanceTime',


    // TimeEngine method (transported interface)
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      var index = this.segmentIndex;
      var cyclicOffset = 0;
      var bufferDuration = this.bufferDuration;

      if (this.cyclic) {
        var cycles = position / bufferDuration;

        cyclicOffset = Math.floor(cycles) * bufferDuration;
        position -= cyclicOffset;
      }

      if (speed > 0) {
        index = getCurrentOrNextIndex(this.positionArray, position);

        if (index >= this.positionArray.length) {
          index = 0;
          cyclicOffset += bufferDuration;

          if (!this.cyclic) return Infinity;
        }
      } else if (speed < 0) {
        index = getCurrentOrPreviousIndex(this.positionArray, position);

        if (index < 0) {
          index = this.positionArray.length - 1;
          cyclicOffset -= bufferDuration;

          if (!this.cyclic) return -Infinity;
        }
      } else {
        return Infinity;
      }

      this.segmentIndex = index;
      this.__cyclicOffset = cyclicOffset;

      return cyclicOffset + this.positionArray[index];
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var index = this.segmentIndex;
      var cyclicOffset = this.__cyclicOffset;

      this.trigger(time);

      if (speed > 0) {
        index++;

        if (index >= this.positionArray.length) {
          index = 0;
          cyclicOffset += this.bufferDuration;

          if (!this.cyclic) return Infinity;
        }
      } else {
        index--;

        if (index < 0) {
          index = this.positionArray.length - 1;
          cyclicOffset -= this.bufferDuration;

          if (!this.cyclic) return -Infinity;
        }
      }

      this.segmentIndex = index;
      this.__cyclicOffset = cyclicOffset;

      return cyclicOffset + this.positionArray[index];
    }

    /**
     * Trigger a segment.
     * This function can be called at any time (whether the engine is scheduled/transported or not)
     * to generate a single segment according to the current segment parameters.
     *
     * @param {Number} time segment synthesis audio time
     * @return {Number} period to next segment
     */

  }, {
    key: 'trigger',
    value: function trigger(time) {
      var audioContext = this.audioContext;
      var segmentTime = (time || audioContext.currentTime) + this.delay;
      var segmentPeriod = this.periodAbs;
      var segmentIndex = this.segmentIndex;

      if (this.buffer) {
        var segmentPosition = 0.0;
        var segmentDuration = 0.0;
        var segmentOffset = 0.0;
        var resamplingRate = 1.0;
        var bufferDuration = this.bufferDuration;

        if (this.cyclic) segmentIndex = segmentIndex % this.positionArray.length;else segmentIndex = Math.max(0, Math.min(segmentIndex, this.positionArray.length - 1));

        if (this.positionArray) segmentPosition = this.positionArray[segmentIndex] || 0;

        if (this.durationArray) segmentDuration = this.durationArray[segmentIndex] || 0;

        if (this.offsetArray) segmentOffset = this.offsetArray[segmentIndex] || 0;

        // calculate resampling
        if (this.resampling !== 0 || this.resamplingVar > 0) {
          var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVar;
          resamplingRate = Math.pow(2.0, (this.resampling + randomResampling) / 1200.0);
        }

        // calculate inter-segment distance
        if (segmentDuration === 0 || this.periodRel > 0) {
          var nextSegmentIndex = segmentIndex + 1;
          var nextPosition, nextOffset;

          if (nextSegmentIndex === this.positionArray.length) {
            if (this.cyclic) {
              nextPosition = this.positionArray[0] + bufferDuration;
              nextOffset = this.offsetArray[0];
            } else {
              nextPosition = bufferDuration;
              nextOffset = 0;
            }
          } else {
            nextPosition = this.positionArray[nextSegmentIndex];
            nextOffset = this.offsetArray[nextSegmentIndex];
          }

          var interSegmentDistance = nextPosition - segmentPosition;

          // correct inter-segment distance by offsets
          //   offset > 0: the segment's reference position is after the given segment position
          if (segmentOffset > 0) interSegmentDistance -= segmentOffset;

          if (nextOffset > 0) interSegmentDistance += nextOffset;

          if (interSegmentDistance < 0) interSegmentDistance = 0;

          // use inter-segment distance instead of segment duration
          if (segmentDuration === 0) segmentDuration = interSegmentDistance;

          // calculate period relative to inter marker distance
          segmentPeriod += this.periodRel * interSegmentDistance;
        }

        // add relative and absolute segment duration
        segmentDuration *= this.durationRel;
        segmentDuration += this.durationAbs;

        // add relative and absolute segment offset
        segmentOffset *= this.offsetRel;
        segmentOffset += this.offsetAbs;

        // apply segment offset
        //   offset > 0: the segment's reference position is after the given segment position
        //   offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
        if (segmentOffset < 0) {
          segmentDuration -= segmentOffset;
          segmentPosition += segmentOffset;
          segmentTime += segmentOffset / resamplingRate;
        } else {
          segmentTime -= segmentOffset / resamplingRate;
        }

        // randomize segment position
        if (this.positionVar > 0) segmentPosition += 2.0 * (Math.random() - 0.5) * this.positionVar;

        // shorten duration of segments over the edges of the buffer
        if (segmentPosition < 0) {
          //segmentTime -= grainPosition; hm, not sure if we want to do this
          segmentDuration += segmentPosition;
          segmentPosition = 0;
        }

        if (segmentPosition + segmentDuration > this.buffer.duration) segmentDuration = this.buffer.duration - segmentPosition;

        segmentDuration /= resamplingRate;

        if (this.monophonic) this.abort(segmentTime);

        // make segment
        if (this.gain > 0 && segmentDuration > 0) {
          // make segment envelope
          var envelope = audioContext.createGain();
          var attack = this.attackAbs + this.attackRel * segmentDuration;
          var release = this.releaseAbs + this.releaseRel * segmentDuration;

          if (attack + release > segmentDuration) {
            var factor = segmentDuration / (attack + release);
            attack *= factor;
            release *= factor;
          }

          var attackEndTime = segmentTime + attack;
          var segmentEndTime = segmentTime + segmentDuration;
          var releaseStartTime = segmentEndTime - release;

          envelope.gain.value = 0;
          envelope.gain.setValueAtTime(0.0, segmentTime);
          envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);

          if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

          envelope.gain.linearRampToValueAtTime(0.0, segmentEndTime);
          envelope.connect(this.outputNode);

          this.__currentEnv = envelope;

          // make source
          var source = audioContext.createBufferSource();

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;
          source.connect(envelope);

          source.start(segmentTime, segmentPosition);
          source.stop(segmentTime + segmentDuration);

          this.__currentSrc = source;
          this.__releaseStartTime = releaseStartTime;
          this.__currentGain = this.gain;
          this.__currentEndTime = segmentEndTime;
        }
      }

      // grain period randon variation
      if (this.periodVar > 0.0) segmentPeriod += 2.0 * (Math.random() - 0.5) * this.periodVar * grainPeriod;

      return Math.max(this.periodMin, segmentPeriod);
    }

    /**
     * Abort the current segment at given time, fade out duration
     *
     * @param {Number} time - abort time
     */

  }, {
    key: 'abort',
    value: function abort(time) {
      var audioContext = this.audioContext;
      var endTime = this.__currentEndTime;
      var abortTime = time || audioContext.currentTime;

      if (abortTime < endTime) {
        var segmentEndTime = Math.min(abortTime + this.abortTime, endTime);
        var envelope = this.__currentEnv;
        var currentGainValue = this.__currentGain;

        if (abortTime > this.__releaseStartTime) {
          var releaseStart = this.__releaseStartTime;
          currentGainValue *= (abortTime - releaseStart) / (endTime - releaseStart);
        }

        envelope.gain.cancelScheduledValues(abortTime);
        envelope.gain.setValueAtTime(currentGainValue, abortTime);
        envelope.gain.linearRampToValueAtTime(0, segmentEndTime);

        this.__currentSrc = null;
        this.__currentEnv = null;
        this.__releaseStartTime = 0;
        this.__currentGain = 0;
        this.__currentEndTime = 0;
      }
    }
  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) {
        var bufferDuration = this.buffer.duration;

        if (this.wrapAroundExtension) bufferDuration -= this.wrapAroundExtension;

        return bufferDuration;
      }

      return 0;
    }
  }]);
  return SegmentEngine;
}(_AudioTimeEngine3.default);

exports.default = SegmentEngine;

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":38,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/createClass":43,"babel-runtime/helpers/inherits":44,"babel-runtime/helpers/possibleConstructorReturn":45}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioContext = require('./core/audioContext');

Object.defineProperty(exports, 'audioContext', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_audioContext).default;
  }
});

var _AudioTimeEngine = require('./core/AudioTimeEngine');

Object.defineProperty(exports, 'AudioTimeEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_AudioTimeEngine).default;
  }
});

var _wavesMasters = require('waves-masters');

Object.defineProperty(exports, 'TimeEngine', {
  enumerable: true,
  get: function get() {
    return _wavesMasters.TimeEngine;
  }
});
Object.defineProperty(exports, 'PriorityQueue', {
  enumerable: true,
  get: function get() {
    return _wavesMasters.PriorityQueue;
  }
});
Object.defineProperty(exports, 'SchedulingQueue', {
  enumerable: true,
  get: function get() {
    return _wavesMasters.SchedulingQueue;
  }
});

var _GranularEngine = require('./engines/GranularEngine');

Object.defineProperty(exports, 'GranularEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_GranularEngine).default;
  }
});

var _Metronome = require('./engines/Metronome');

Object.defineProperty(exports, 'Metronome', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Metronome).default;
  }
});

var _PlayerEngine = require('./engines/PlayerEngine');

Object.defineProperty(exports, 'PlayerEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_PlayerEngine).default;
  }
});

var _SegmentEngine = require('./engines/SegmentEngine');

Object.defineProperty(exports, 'SegmentEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SegmentEngine).default;
  }
});

var _PlayControl = require('./masters/PlayControl');

Object.defineProperty(exports, 'PlayControl', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_PlayControl).default;
  }
});

var _Transport = require('./masters/Transport');

Object.defineProperty(exports, 'Transport', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Transport).default;
  }
});

var _factories = require('./masters/factories');

Object.defineProperty(exports, 'getScheduler', {
  enumerable: true,
  get: function get() {
    return _factories.getScheduler;
  }
});
Object.defineProperty(exports, 'getSimpleScheduler', {
  enumerable: true,
  get: function get() {
    return _factories.getSimpleScheduler;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./core/AudioTimeEngine":1,"./core/audioContext":2,"./engines/GranularEngine":3,"./engines/Metronome":4,"./engines/PlayerEngine":5,"./engines/SegmentEngine":6,"./masters/PlayControl":8,"./masters/Transport":9,"./masters/factories":10,"waves-masters":147}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioContext = require('../core/audioContext');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _factories = require('./factories');

var _wavesMasters = require('waves-masters');

var masters = _interopRequireWildcard(_wavesMasters);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Extends Time Engine to provide playback control of a Time Engine instance.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/play-control.html}
 *
 * @extends TimeEngine
 * @param {TimeEngine} engine - engine to control
 *
 * @example
 * import * as audio from 'waves-audio';
 * const playerEngine = audio.PlayerEngine();
 * const playControl = new audio.PlayControl(playerEngine);
 *
 * playControl.start();
 */
var PlayControl = function (_masters$PlayControl) {
  (0, _inherits3.default)(PlayControl, _masters$PlayControl);

  function PlayControl(engine) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, PlayControl);

    var audioContext = options.audioContext || _audioContext2.default;
    var scheduler = (0, _factories.getScheduler)(audioContext);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayControl.__proto__ || (0, _getPrototypeOf2.default)(PlayControl)).call(this, scheduler, engine, options));

    _this.audioContext = audioContext;
    return _this;
  }

  return PlayControl;
}(masters.PlayControl);

exports.default = PlayControl;

},{"../core/audioContext":2,"./factories":10,"babel-runtime/core-js/object/get-prototype-of":38,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/inherits":44,"babel-runtime/helpers/possibleConstructorReturn":45,"waves-masters":147}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _audioContext = require('../core/audioContext');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _factories = require('./factories');

var _wavesMasters = require('waves-masters');

var masters = _interopRequireWildcard(_wavesMasters);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Provides synchronized scheduling of Time Engine instances.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/transport.html}
 *
 * @example
 * import * as audio from 'waves-audio';
 * const transport = new audio.Transport();
 * const playControl = new audio.PlayControl(transport);
 * const myEngine = new MyEngine();
 * const yourEngine = new yourEngine();
 *
 * transport.add(myEngine);
 * transport.add(yourEngine);
 *
 * playControl.start();
 */
var Transport = function (_masters$Transport) {
  (0, _inherits3.default)(Transport, _masters$Transport);

  function Transport() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, Transport);

    var audioContext = options.audioContext || _audioContext2.default;
    var scheduler = (0, _factories.getScheduler)(audioContext);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this, scheduler, options));

    _this.audioContext = audioContext;
    return _this;
  }

  return Transport;
}(masters.Transport);

exports.default = Transport;

},{"../core/audioContext":2,"./factories":10,"babel-runtime/core-js/object/get-prototype-of":38,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/inherits":44,"babel-runtime/helpers/possibleConstructorReturn":45,"waves-masters":147}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.getScheduler = getScheduler;
exports.getSimpleScheduler = getSimpleScheduler;

var _audioContext = require('../core/audioContext');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _wavesMasters = require('waves-masters');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schedulerMap = new _map2.default();
var simpleSchedulerMap = new _map2.default();

/**
 * Returns a unique instance of `Scheduler`
 *
 * @global
 * @function
 * @returns {Scheduler}
 * @see Scheduler
 */
function getScheduler() {
  var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;

  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    var getTimeFunction = function getTimeFunction() {
      return audioContext.currentTime;
    };
    scheduler = new _wavesMasters.Scheduler(getTimeFunction);

    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

/**
 * Returns a unique instance of `SimpleScheduler`
 *
 * @global
 * @function
 * @returns {SimpleScheduler}
 * @see SimpleScheduler
 */
function getSimpleScheduler() {
  var audioContext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _audioContext2.default;

  var simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    var getTimeFunction = function getTimeFunction() {
      return audioContext.currentTime;
    };
    simpleScheduler = new _wavesMasters.SimpleScheduler(getTimeFunction);

    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};

},{"../core/audioContext":2,"babel-runtime/core-js/map":35,"waves-masters":147}],11:[function(require,module,exports){
'use strict';

var _wavesAudio = require('waves-audio');

var audio = _interopRequireWildcard(_wavesAudio);

var _basicControllers = require('@ircam/basic-controllers');

var controllers = _interopRequireWildcard(_basicControllers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

controllers.setTheme('dark');

var audioContext = audio.audioContext;
var scheduler = audio.getSimpleScheduler();
var container = '.controllers';

function createMetro(index) {
  var tempo = 30 + index * 30;

  // create metronome engine
  var metro = new audio.Metronome();
  metro.period = 60 / tempo;
  metro.gain = 0.3;
  metro.clickFreq = index * 666;
  metro.connect(audioContext.destination);

  // create GUI elements (enable/disable metronome)
  new controllers.Toggle({
    label: 'Metronome ' + index,
    default: false,
    container: container,
    callback: function callback(flag) {
      if (flag) scheduler.add(metro);else scheduler.remove(metro);
    }
  });

  var tempoSlider = new controllers.Slider({
    label: 'Tempo',
    min: 30,
    max: 240,
    step: 1,
    default: tempo,
    unit: 'bpm',
    container: container,
    callback: function callback(value) {
      return metro.period = 60 / value;
    }
  });

  return metro;
}

// create three metronome engines
var engines = [];
engines.push(createMetro(1));
engines.push(createMetro(2));
engines.push(createMetro(3));

new controllers.TriggerButtons({
  label: '&nbsp;',
  options: ['Sync'],
  container: container,
  callback: function callback(value) {
    return engines.forEach(function (engine) {
      return engine.resetTime();
    });
  }
});

},{"@ircam/basic-controllers":24,"waves-audio":7}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** @module basic-controller */

var typeCounters = {};

/**
 * Base class to create new controllers.
 *
 * @param {String} type - String describing the type of the controller.
 * @param {Object} defaults - Default parameters of the controller.
 * @param {Object} config - User defined configuration options.
 */

var BaseComponent = function () {
  function BaseComponent(type, defaults) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, BaseComponent);

    this.type = type;
    this.params = Object.assign({}, defaults, config);

    // handle id
    if (!typeCounters[type]) typeCounters[type] = 0;

    if (!this.params.id) {
      this.id = type + "-" + typeCounters[type];
      typeCounters[type] += 1;
    } else {
      this.id = this.params.id;
    }

    this._listeners = new Set();
    this._groupListeners = new Set();

    // register callback if given
    if (this.params.callback) this.addListener(this.params.callback);
  }

  /**
   * Add a listener to the controller.
   *
   * @param {Function} callback - Function to be applied when the controller
   *  state change.
   */


  _createClass(BaseComponent, [{
    key: "addListener",
    value: function addListener(callback) {
      this._listeners.add(callback);
    }

    /**
     * Called when a listener is added from a containing group.
     * @private
     */

  }, {
    key: "_addGroupListener",
    value: function _addGroupListener(id, callId, callback) {
      if (!callId) this.addListener(callback);else {
        this._groupListeners.add({ callId: callId, callback: callback });
      }
    }

    /**
     * Remove a listener from the controller.
     *
     * @param {Function} callback - Function to remove from the listeners.
     * @private
     * @todo - reexpose when `container` can override this method...
     */
    // removeListener(callback) {
    //   this._listeners.remove(callback);
    // }

    /** @private */

  }, {
    key: "executeListeners",
    value: function executeListeners() {
      for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
        values[_key] = arguments[_key];
      }

      this._listeners.forEach(function (callback) {
        return callback.apply(undefined, values);
      });

      this._groupListeners.forEach(function (payload) {
        var callback = payload.callback,
            callId = payload.callId;

        callback.apply(undefined, [callId].concat(values));
      });
    }
  }]);

  return BaseComponent;
}();

exports.default = BaseComponent;

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioContext = window.AudioContext || window.webkitAudioContext;

/** @module basic-controllers */

var defaults = {
  label: 'Drag and drop audio files',
  labelProcess: 'process...',
  audioContext: null,
  container: null,
  callback: null
};

/**
 * Drag and drop zone for audio files returning `AudioBuffer`s and/or JSON
 * descriptor data.
 *
 * @param {Object} config - Override default parameters.
 * @param {String} [config.label='Drag and drop audio files'] - Label of the
 *  controller.
 * @param {String} [config.labelProcess='process...'] - Label of the controller
 *  while audio files are decoded.
 * @param {AudioContext} [config.audioContext=null] - Optionnal audio context
 *  to use in order to decode audio files.
 * @param {String|Element|basic-controller~Group} [config.container=null] -
 *  Container of the controller.
 * @param {Function} [config.callback=null] - Callback to be executed when the
 *  value changes.
 *
 * @example
 * import * as controllers from 'basic-controllers';
 *
 * const dragAndDrop = new controllers.DragAndDrop({
 *   container: '#container',
 *   callback: (results) => console.log(results),
 * });
 */

var DragAndDrop = function (_display) {
  _inherits(DragAndDrop, _display);

  function DragAndDrop(options) {
    _classCallCheck(this, DragAndDrop);

    var _this = _possibleConstructorReturn(this, (DragAndDrop.__proto__ || Object.getPrototypeOf(DragAndDrop)).call(this, 'drag-and-drop', defaults, options));

    _this._value = null;

    if (!_this.params.audioContext) _this.params.audioContext = new AudioContext();

    _get(DragAndDrop.prototype.__proto__ || Object.getPrototypeOf(DragAndDrop.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * Get the last results
   * @type {Object<String, AudioBuffer|JSON>}
   * @readonly
   */


  _createClass(DragAndDrop, [{
    key: 'render',
    value: function render() {
      var label = this.params.label;

      var content = '\n      <div class="drop-zone">\n        <p class="label">' + label + '</p>\n      </div>\n    ';

      this.$el = _get(DragAndDrop.prototype.__proto__ || Object.getPrototypeOf(DragAndDrop.prototype), 'render', this).call(this);
      this.$el.innerHTML = content;
      this.$dropZone = this.$el.querySelector('.drop-zone');
      this.$label = this.$el.querySelector('.label');

      this._bindEvents();

      return this.$el;
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this.$dropZone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();

        _this2.$dropZone.classList.add('drag');
        e.dataTransfer.dropEffect = 'copy';
      }, false);

      this.$dropZone.addEventListener('dragleave', function (e) {
        e.preventDefault();
        e.stopPropagation();

        _this2.$dropZone.classList.remove('drag');
      }, false);

      this.$dropZone.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var files = Array.from(e.dataTransfer.files);
        var audioFiles = files.filter(function (file) {
          if (/^audio/.test(file.type)) {
            file.shortType = 'audio';
            return true;
          } else if (/json$/.test(file.type)) {
            file.shortType = 'json';
            return true;
          }

          return false;
        });

        var results = {};
        var counter = 0;

        _this2.$label.textContent = _this2.params.labelProcess;

        var testEnd = function testEnd() {
          counter += 1;

          if (counter === audioFiles.length) {
            _this2._value = results;
            _this2.executeListeners(results);

            _this2.$dropZone.classList.remove('drag');
            _this2.$label.textContent = _this2.params.label;
          }
        };

        files.forEach(function (file, index) {
          var reader = new FileReader();

          reader.onload = function (e) {
            if (file.shortType === 'json') {
              results[file.name] = JSON.parse(e.target.result);
              testEnd();
            } else if (file.shortType === 'audio') {
              _this2.params.audioContext.decodeAudioData(e.target.result).then(function (audioBuffer) {
                results[file.name] = audioBuffer;
                testEnd();
              }).catch(function (err) {
                results[file.name] = null;
                testEnd();
              });
            }
          };

          if (file.shortType === 'json') reader.readAsText(file);else if (file.shortType === 'audio') reader.readAsArrayBuffer(file);
        });
      }, false);
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    }
  }]);

  return DragAndDrop;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = DragAndDrop;

},{"../mixins/display":26,"./BaseComponent":12}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display = require('../mixins/display');

var _display2 = _interopRequireDefault(_display);

var _container2 = require('../mixins/container');

var _container3 = _interopRequireDefault(_container2);

var _elements = require('../utils/elements');

var elements = _interopRequireWildcard(_elements);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  legend: '&nbsp;',
  default: 'opened',
  container: null
};

/**
 * Group of controllers.
 *
 * @param {Object} config - Override default parameters.
 * @param {String} config.label - Label of the group.
 * @param {'opened'|'closed'} [config.default='opened'] - Default state of the
 *  group.
 * @param {String|Element|basic-controller~Group} [config.container=null] -
 *  Container of the controller.
 *
 * @example
 * import * as controllers from 'basic-controllers';
 *
 * // create a group
 * const group = new controllers.Group({
 *   label: 'Group',
 *   default: 'opened',
 *   container: '#container'
 * });
 *
 * // insert controllers in the group
 * const groupSlider = new controllers.Slider({
 *   label: 'Group Slider',
 *   min: 20,
 *   max: 1000,
 *   step: 1,
 *   default: 200,
 *   unit: 'Hz',
 *   size: 'large',
 *   container: group,
 *   callback: (value) => console.log(value),
 * });
 *
 * const groupText = new controllers.Text({
 *   label: 'Group Text',
 *   default: 'text input',
 *   readonly: false,
 *   container: group,
 *   callback: (value) => console.log(value),
 * });
 */

var Group = function (_container) {
  _inherits(Group, _container);

  function Group(config) {
    _classCallCheck(this, Group);

    var _this = _possibleConstructorReturn(this, (Group.__proto__ || Object.getPrototypeOf(Group)).call(this, 'group', defaults, config));

    _this._states = ['opened', 'closed'];

    if (_this._states.indexOf(_this.params.default) === -1) throw new Error('Invalid state "' + value + '"');

    _this._state = _this.params.default;

    _get(Group.prototype.__proto__ || Object.getPrototypeOf(Group.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * State of the group (`'opened'` or `'closed'`).
   * @type {String}
   */


  _createClass(Group, [{
    key: 'render',


    /** @private */
    value: function render() {
      var content = '\n      <div class="group-header">\n        ' + elements.smallArrowRight + '\n        ' + elements.smallArrowBottom + '\n        <span class="label">' + this.params.label + '</span>\n      </div>\n      <div class="group-content"></div>\n    ';

      this.$el = _get(Group.prototype.__proto__ || Object.getPrototypeOf(Group.prototype), 'render', this).call(this);
      this.$el.innerHTML = content;
      this.$el.classList.add(this._state);

      this.$header = this.$el.querySelector('.group-header');
      this.$container = this.$el.querySelector('.group-content');

      this._bindEvents();

      return this.$el;
    }

    /** @private */

  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this.$header.addEventListener('click', function () {
        var state = _this2._state === 'closed' ? 'opened' : 'closed';
        _this2.state = state;
      });
    }
  }, {
    key: 'value',
    get: function get() {
      return this.state;
    },
    set: function set(state) {
      this.state = state;
    }

    /**
     * Alias for `value`.
     * @type {String}
     */

  }, {
    key: 'state',
    get: function get() {
      return this._state;
    },
    set: function set(value) {
      if (this._states.indexOf(value) === -1) throw new Error('Invalid state "' + value + '"');

      this.$el.classList.remove(this._state);
      this.$el.classList.add(value);

      this._state = value;
    }
  }]);

  return Group;
}((0, _container3.default)((0, _display2.default)(_BaseComponent2.default)));

exports.default = Group;

},{"../mixins/container":25,"../mixins/display":26,"../utils/elements":27,"./BaseComponent":12}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

var _elements = require('../utils/elements');

var elements = _interopRequireWildcard(_elements);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&nbsp;',
  min: 0,
  max: 1,
  step: 0.01,
  default: 0,
  container: null,
  callback: null
};

/**
 * Number Box controller
 *
 * @param {Object} config - Override default parameters.
 * @param {String} config.label - Label of the controller.
 * @param {Number} [config.min=0] - Minimum value.
 * @param {Number} [config.max=1] - Maximum value.
 * @param {Number} [config.step=0.01] - Step between consecutive values.
 * @param {Number} [config.default=0] - Default value.
 * @param {String|Element|basic-controller~Group} [config.container=null] -
 *  Container of the controller.
 * @param {Function} [config.callback=null] - Callback to be executed when the
 *  value changes.
 *
 * @example
 * import * as controllers from 'basic-controllers';
 *
 * const numberBox = new controllers.NumberBox({
 *   label: 'My Number Box',
 *   min: 0,
 *   max: 10,
 *   step: 0.1,
 *   default: 5,
 *   container: '#container',
 *   callback: (value) => console.log(value),
 * });
 */

var NumberBox = function (_display) {
  _inherits(NumberBox, _display);

  // legend, min = 0, max = 1, step = 0.01, defaultValue = 0, $container = null, callback = null
  function NumberBox(config) {
    _classCallCheck(this, NumberBox);

    var _this = _possibleConstructorReturn(this, (NumberBox.__proto__ || Object.getPrototypeOf(NumberBox)).call(this, 'number-box', defaults, config));

    _this._value = _this.params.default;
    _this._isIntStep = _this.params.step % 1 === 0;

    _get(NumberBox.prototype.__proto__ || Object.getPrototypeOf(NumberBox.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * Current value of the controller.
   *
   * @type {Number}
   */


  _createClass(NumberBox, [{
    key: 'render',


    /** @private */
    value: function render() {
      var _params = this.params,
          label = _params.label,
          min = _params.min,
          max = _params.max,
          step = _params.step;

      var content = '\n      <span class="label">' + label + '</span>\n      <div class="inner-wrapper">\n        ' + elements.arrowLeft + '\n        <input class="number" type="number" min="' + min + '" max="' + max + '" step="' + step + '" value="' + this._value + '" />\n        ' + elements.arrowRight + '\n      </div>\n    ';

      this.$el = _get(NumberBox.prototype.__proto__ || Object.getPrototypeOf(NumberBox.prototype), 'render', this).call(this);
      this.$el.classList.add('align-small');
      this.$el.innerHTML = content;

      this.$prev = this.$el.querySelector('.arrow-left');
      this.$next = this.$el.querySelector('.arrow-right');
      this.$number = this.$el.querySelector('input[type="number"]');

      this._bindEvents();

      return this.$el;
    }

    /** @private */

  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this.$prev.addEventListener('click', function (e) {
        var step = _this2.params.step;
        var decimals = step.toString().split('.')[1];
        var exp = decimals ? decimals.length : 0;
        var mult = Math.pow(10, exp);

        var intValue = Math.floor(_this2._value * mult + 0.5);
        var intStep = Math.floor(step * mult + 0.5);
        var value = (intValue - intStep) / mult;

        _this2._propagate(value);
      }, false);

      this.$next.addEventListener('click', function (e) {
        var step = _this2.params.step;
        var decimals = step.toString().split('.')[1];
        var exp = decimals ? decimals.length : 0;
        var mult = Math.pow(10, exp);

        var intValue = Math.floor(_this2._value * mult + 0.5);
        var intStep = Math.floor(step * mult + 0.5);
        var value = (intValue + intStep) / mult;

        _this2._propagate(value);
      }, false);

      this.$number.addEventListener('change', function (e) {
        var value = _this2.$number.value;
        value = _this2._isIntStep ? parseInt(value, 10) : parseFloat(value);
        value = Math.min(_this2.params.max, Math.max(_this2.params.min, value));

        _this2._propagate(value);
      }, false);
    }

    /** @private */

  }, {
    key: '_propagate',
    value: function _propagate(value) {
      if (value === this._value) {
        return;
      }

      this._value = value;
      this.$number.value = value;

      this.executeListeners(this._value);
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      // use $number element min, max and step system
      this.$number.value = value;
      value = this.$number.value;
      value = this._isIntStep ? parseInt(value, 10) : parseFloat(value);
      this._value = value;
    }
  }]);

  return NumberBox;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = NumberBox;

},{"../mixins/display":26,"../utils/elements":27,"./BaseComponent":12}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

var _elements = require('../utils/elements');

var elements = _interopRequireWildcard(_elements);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&nbsp;',
  options: null,
  default: null,
  container: null,
  callback: null
};

/**
 * List of buttons with state.
 *
 * @param {Object} config - Override default parameters.
 * @param {String} config.label - Label of the controller.
 * @param {Array} [config.options=null] - Values of the drop down list.
 * @param {Number} [config.default=null] - Default value.
 * @param {String|Element|basic-controller~Group} [config.container=null] -
 *  Container of the controller.
 * @param {Function} [config.callback=null] - Callback to be executed when the
 *  value changes.
 *
 * @example
 * import * as controllers from 'basic-controllers';
 *
 * const selectButtons = new controllers.SelectButtons({
 *   label: 'SelectButtons',
 *   options: ['standby', 'run', 'end'],
 *   default: 'run',
 *   container: '#container',
 *   callback: (value, index) => console.log(value, index),
 * });
 */

var SelectButtons = function (_display) {
  _inherits(SelectButtons, _display);

  function SelectButtons(config) {
    _classCallCheck(this, SelectButtons);

    var _this = _possibleConstructorReturn(this, (SelectButtons.__proto__ || Object.getPrototypeOf(SelectButtons)).call(this, 'select-buttons', defaults, config));

    if (!Array.isArray(_this.params.options)) throw new Error('TriggerButton: Invalid option "options"');

    _this._value = _this.params.default;

    var options = _this.params.options;
    var index = options.indexOf(_this._value);
    _this._index = index === -1 ? 0 : index;
    _this._maxIndex = options.length - 1;

    _get(SelectButtons.prototype.__proto__ || Object.getPrototypeOf(SelectButtons.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * Current value.
   * @type {String}
   */


  _createClass(SelectButtons, [{
    key: 'render',


    /** @private */
    value: function render() {
      var _params = this.params,
          options = _params.options,
          label = _params.label;

      var content = '\n      <span class="label">' + label + '</span>\n      <div class="inner-wrapper">\n        ' + elements.arrowLeft + '\n        ' + options.map(function (option, index) {
        return '\n            <button class="btn" data-index="' + index + '" data-value="' + option + '">\n              ' + option + '\n            </button>';
      }).join('') + '\n        ' + elements.arrowRight + '\n      </div>\n    ';

      this.$el = _get(SelectButtons.prototype.__proto__ || Object.getPrototypeOf(SelectButtons.prototype), 'render', this).call(this, this.type);
      this.$el.innerHTML = content;

      this.$prev = this.$el.querySelector('.arrow-left');
      this.$next = this.$el.querySelector('.arrow-right');
      this.$btns = Array.from(this.$el.querySelectorAll('.btn'));

      this._highlightBtn(this._index);
      this._bindEvents();

      return this.$el;
    }

    /** @private */

  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this.$prev.addEventListener('click', function () {
        var index = _this2._index - 1;
        _this2._propagate(index);
      });

      this.$next.addEventListener('click', function () {
        var index = _this2._index + 1;
        _this2._propagate(index);
      });

      this.$btns.forEach(function ($btn, index) {
        $btn.addEventListener('click', function (e) {
          e.preventDefault();
          _this2._propagate(index);
        });
      });
    }

    /** @private */

  }, {
    key: '_propagate',
    value: function _propagate(index) {
      if (index < 0 || index > this._maxIndex) return;

      this._index = index;
      this._value = this.params.options[index];
      this._highlightBtn(this._index);

      this.executeListeners(this._value, this._index);
    }

    /** @private */

  }, {
    key: '_highlightBtn',
    value: function _highlightBtn(activeIndex) {
      this.$btns.forEach(function ($btn, index) {
        $btn.classList.remove('active');

        if (activeIndex === index) {
          $btn.classList.add('active');
        }
      });
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      var index = this.params.options.indexOf(value);

      if (index !== -1) this.index = index;
    }

    /**
     * Current option index.
     * @type {Number}
     */

  }, {
    key: 'index',
    get: function get() {
      this._index;
    },
    set: function set(index) {
      if (index < 0 || index > this._maxIndex) return;

      this._value = this.params.options[index];
      this._index = index;
      this._highlightBtn(this._index);
    }
  }]);

  return SelectButtons;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = SelectButtons;

},{"../mixins/display":26,"../utils/elements":27,"./BaseComponent":12}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

var _elements = require('../utils/elements');

var elements = _interopRequireWildcard(_elements);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&nbsp;',
  options: null,
  default: null,
  container: null,
  callback: null

  /**
   * Drop-down list controller.
   *
   * @param {Object} config - Override default parameters.
   * @param {String} config.label - Label of the controller.
   * @param {Array} [config.options=null] - Values of the drop down list.
   * @param {Number} [config.default=null] - Default value.
   * @param {String|Element|basic-controller~Group} [config.container=null] -
   *  Container of the controller.
   * @param {Function} [config.callback=null] - Callback to be executed when the
   *  value changes.
   *
   * @example
   * import * as controllers from 'basic-controllers';
   *
   * const selectList = new controllers.SelectList({
   *   label: 'SelectList',
   *   options: ['standby', 'run', 'end'],
   *   default: 'run',
   *   container: '#container',
   *   callback: (value, index) => console.log(value, index),
   * });
   */
};
var SelectList = function (_display) {
  _inherits(SelectList, _display);

  function SelectList(config) {
    _classCallCheck(this, SelectList);

    var _this = _possibleConstructorReturn(this, (SelectList.__proto__ || Object.getPrototypeOf(SelectList)).call(this, 'select-list', defaults, config));

    if (!Array.isArray(_this.params.options)) throw new Error('TriggerButton: Invalid option "options"');

    _this._value = _this.params.default;

    var options = _this.params.options;
    var index = options.indexOf(_this._value);
    _this._index = index === -1 ? 0 : index;
    _this._maxIndex = options.length - 1;

    _get(SelectList.prototype.__proto__ || Object.getPrototypeOf(SelectList.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * Current value.
   * @type {String}
   */


  _createClass(SelectList, [{
    key: 'render',


    /** @private */
    value: function render() {
      var _params = this.params,
          label = _params.label,
          options = _params.options;

      var content = '\n      <span class="label">' + label + '</span>\n      <div class="inner-wrapper">\n        ' + elements.arrowLeft + '\n        <select>\n        ' + options.map(function (option, index) {
        return '<option value="' + option + '">' + option + '</option>';
      }).join('') + '\n        <select>\n        ' + elements.arrowRight + '\n      </div>\n    ';

      this.$el = _get(SelectList.prototype.__proto__ || Object.getPrototypeOf(SelectList.prototype), 'render', this).call(this, this.type);
      this.$el.classList.add('align-small');
      this.$el.innerHTML = content;

      this.$prev = this.$el.querySelector('.arrow-left');
      this.$next = this.$el.querySelector('.arrow-right');
      this.$select = this.$el.querySelector('select');
      // set to default value
      this.$select.value = options[this._index];
      this._bindEvents();

      return this.$el;
    }

    /** @private */

  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this.$prev.addEventListener('click', function () {
        var index = _this2._index - 1;
        _this2._propagate(index);
      }, false);

      this.$next.addEventListener('click', function () {
        var index = _this2._index + 1;
        _this2._propagate(index);
      }, false);

      this.$select.addEventListener('change', function () {
        var value = _this2.$select.value;
        var index = _this2.params.options.indexOf(value);
        _this2._propagate(index);
      });
    }

    /** @private */

  }, {
    key: '_propagate',
    value: function _propagate(index) {
      if (index < 0 || index > this._maxIndex) return;

      var value = this.params.options[index];
      this._index = index;
      this._value = value;
      this.$select.value = value;

      this.executeListeners(this._value, this._index);
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      this.$select.value = value;
      this._value = value;
      this._index = this.params.options.indexOf(value);
    }

    /**
     * Current option index.
     * @type {Number}
     */

  }, {
    key: 'index',
    get: function get() {
      return this._index;
    },
    set: function set(index) {
      if (index < 0 || index > this._maxIndex) return;
      this.value = this.params.options[index];
    }
  }]);

  return SelectList;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = SelectList;

},{"../mixins/display":26,"../utils/elements":27,"./BaseComponent":12}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

var _guiComponents = require('@ircam/gui-components');

var guiComponents = _interopRequireWildcard(_guiComponents);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&nbsp;',
  min: 0,
  max: 1,
  step: 0.01,
  default: 0,
  unit: '',
  size: 'medium',
  container: null,
  callback: null

  /**
   * Slider controller.
   *
   * @param {Object} config - Override default parameters.
   * @param {String} config.label - Label of the controller.
   * @param {Number} [config.min=0] - Minimum value.
   * @param {Number} [config.max=1] - Maximum value.
   * @param {Number} [config.step=0.01] - Step between consecutive values.
   * @param {Number} [config.default=0] - Default value.
   * @param {String} [config.unit=''] - Unit of the value.
   * @param {'small'|'medium'|'large'} [config.size='medium'] - Size of the
   *  slider.
   * @param {String|Element|basic-controller~Group} [config.container=null] -
   *  Container of the controller.
   * @param {Function} [config.callback=null] - Callback to be executed when the
   *  value changes.
   *
   * @example
   * import * as controllers from 'basic-controllers';
   *
   * const slider = new controllers.Slider({
   *   label: 'My Slider',
   *   min: 20,
   *   max: 1000,
   *   step: 1,
   *   default: 537,
   *   unit: 'Hz',
   *   size: 'large',
   *   container: '#container',
   *   callback: (value) => console.log(value),
   * });
   */
};
var Slider = function (_display) {
  _inherits(Slider, _display);

  function Slider(config) {
    _classCallCheck(this, Slider);

    var _this = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, 'slider', defaults, config));

    _this._value = _this.params.default;
    _this._onSliderChange = _this._onSliderChange.bind(_this);

    _get(Slider.prototype.__proto__ || Object.getPrototypeOf(Slider.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * Current value.
   * @type {Number}
   */


  _createClass(Slider, [{
    key: 'render',


    /** @private */
    value: function render() {
      var _params = this.params,
          label = _params.label,
          min = _params.min,
          max = _params.max,
          step = _params.step,
          unit = _params.unit,
          size = _params.size;

      var content = '\n      <span class="label">' + label + '</span>\n      <div class="inner-wrapper">\n        <div class="range"></div>\n        <div class="number-wrapper">\n          <input type="number" class="number" min="' + min + '" max="' + max + '" step="' + step + '" value="' + this._value + '" />\n          <span class="unit">' + unit + '</span>\n        </div>\n      </div>';

      this.$el = _get(Slider.prototype.__proto__ || Object.getPrototypeOf(Slider.prototype), 'render', this).call(this, this.type);
      this.$el.innerHTML = content;
      this.$el.classList.add('slider-' + size);

      this.$range = this.$el.querySelector('.range');
      this.$number = this.$el.querySelector('input[type="number"]');

      this.slider = new guiComponents.Slider({
        container: this.$range,
        callback: this._onSliderChange,
        min: min,
        max: max,
        step: step,
        default: this._value,
        foregroundColor: '#ababab'
      });

      this._bindEvents();

      return this.$el;
    }

    /** @private */

  }, {
    key: 'resize',
    value: function resize() {
      _get(Slider.prototype.__proto__ || Object.getPrototypeOf(Slider.prototype), 'resize', this).call(this);

      var _$range$getBoundingCl = this.$range.getBoundingClientRect(),
          width = _$range$getBoundingCl.width,
          height = _$range$getBoundingCl.height;

      this.slider.resize(width, height);
    }

    /** @private */

  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this.$number.addEventListener('change', function () {
        var value = parseFloat(_this2.$number.value);
        // the slider propagates the value
        _this2.slider.value = value;
        _this2._value = value;

        _this2.executeListeners(_this2._value);
      }, false);
    }

    /** @private */

  }, {
    key: '_onSliderChange',
    value: function _onSliderChange(value) {
      this.$number.value = value;
      this._value = value;

      this.executeListeners(this._value);
    }
  }, {
    key: 'value',
    set: function set(value) {
      this._value = value;

      if (this.$number && this.$range) {
        this.$number.value = this.value;
        this.slider.value = this.value;
      }
    },
    get: function get() {
      return this._value;
    }
  }]);

  return Slider;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = Slider;

},{"../mixins/display":26,"./BaseComponent":12,"@ircam/gui-components":33}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&nbsp;',
  default: '',
  readonly: false,
  container: null,
  callback: null

  /**
   * Text controller.
   *
   * @param {Object} config - Override default parameters.
   * @param {String} config.label - Label of the controller.
   * @param {Array} [config.default=''] - Default value of the controller.
   * @param {Array} [config.readonly=false] - Define if the controller is readonly.
   * @param {String|Element|basic-controller~Group} [config.container=null] -
   *  Container of the controller.
   * @param {Function} [config.callback=null] - Callback to be executed when the
   *  value changes.
   *
   * @example
   * import * as controllers from 'basic-contollers';
   *
   * const text = new controllers.Text({
   *   label: 'My Text',
   *   default: 'default value',
   *   readonly: false,
   *   container: '#container',
   *   callback: (value) => console.log(value),
   * });
   */
};
var Text = function (_display) {
  _inherits(Text, _display);

  function Text(config) {
    _classCallCheck(this, Text);

    var _this = _possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, 'text', defaults, config));

    _this._value = _this.params.default;
    _this.initialize();
    return _this;
  }

  /**
   * Current value.
   * @type {String}
   */


  _createClass(Text, [{
    key: 'render',


    /** @private */
    value: function render() {
      var readonly = this.params.readonly ? 'readonly' : '';
      var content = '\n      <span class="label">' + this.params.label + '</span>\n      <div class="inner-wrapper">\n        <input class="text" type="text" value="' + this._value + '" ' + readonly + ' />\n      </div>\n    ';

      this.$el = _get(Text.prototype.__proto__ || Object.getPrototypeOf(Text.prototype), 'render', this).call(this);
      this.$el.innerHTML = content;
      this.$input = this.$el.querySelector('.text');

      this.bindEvents();
      return this.$el;
    }

    /** @private */

  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      var _this2 = this;

      this.$input.addEventListener('keyup', function () {
        _this2._value = _this2.$input.value;
        _this2.executeListeners(_this2._value);
      }, false);
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      this.$input.value = value;
      this._value = value;
    }
  }]);

  return Text;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = Text;

},{"../mixins/display":26,"./BaseComponent":12}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&nbsp;',
  container: null
};

/**
 * Title.
 *
 * @param {Object} config - Override default parameters.
 * @param {String} config.label - Label of the controller.
 * @param {String|Element|basic-controller~Group} [config.container=null] -
 *  Container of the controller.
 *
 * @example
 * import * as controller from 'basic-controllers';
 *
 * const title = new controllers.Title({
 *   label: 'My Title',
 *   container: '#container'
 * });
 */

var Title = function (_display) {
  _inherits(Title, _display);

  function Title(config) {
    _classCallCheck(this, Title);

    var _this = _possibleConstructorReturn(this, (Title.__proto__ || Object.getPrototypeOf(Title)).call(this, 'title', defaults, config));

    _get(Title.prototype.__proto__ || Object.getPrototypeOf(Title.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /** @private */


  _createClass(Title, [{
    key: 'render',
    value: function render() {
      var content = '<span class="label">' + this.params.label + '</span>';

      this.$el = _get(Title.prototype.__proto__ || Object.getPrototypeOf(Title.prototype), 'render', this).call(this);
      this.$el.innerHTML = content;

      return this.$el;
    }
  }]);

  return Title;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = Title;

},{"../mixins/display":26,"./BaseComponent":12}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

var _elements = require('../utils/elements');

var elements = _interopRequireWildcard(_elements);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&bnsp;',
  active: false,
  container: null,
  callback: null
};

/**
 * On/Off controller.
 *
 * @param {Object} config - Override default parameters.
 * @param {String} config.label - Label of the controller.
 * @param {Array} [config.active=false] - Default state of the toggle.
 * @param {String|Element|basic-controller~Group} [config.container=null] -
 *  Container of the controller.
 * @param {Function} [config.callback=null] - Callback to be executed when the
 *  value changes.
 *
 * @example
 * import * as controllers from 'basic-controllers';
 *
 * const toggle = new controllers.Toggle({
 *   label: 'My Toggle',
 *   active: false,
 *   container: '#container',
 *   callback: (active) => console.log(active),
 * });
 */

var Toggle = function (_display) {
  _inherits(Toggle, _display);

  function Toggle(config) {
    _classCallCheck(this, Toggle);

    var _this = _possibleConstructorReturn(this, (Toggle.__proto__ || Object.getPrototypeOf(Toggle)).call(this, 'toggle', defaults, config));

    _this._active = _this.params.active;

    _get(Toggle.prototype.__proto__ || Object.getPrototypeOf(Toggle.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * Value of the toggle
   * @type {Boolean}
   */


  _createClass(Toggle, [{
    key: '_updateBtn',


    /** @private */
    value: function _updateBtn() {
      var method = this.active ? 'add' : 'remove';
      this.$toggle.classList[method]('active');
    }

    /** @private */

  }, {
    key: 'render',
    value: function render() {
      var content = '\n      <span class="label">' + this.params.label + '</span>\n      <div class="inner-wrapper">\n        ' + elements.toggle + '\n      </div>';

      this.$el = _get(Toggle.prototype.__proto__ || Object.getPrototypeOf(Toggle.prototype), 'render', this).call(this);
      this.$el.classList.add('align-small');
      this.$el.innerHTML = content;

      this.$toggle = this.$el.querySelector('.toggle-element');
      // initialize state
      this.active = this._active;
      this.bindEvents();

      return this.$el;
    }

    /** @private */

  }, {
    key: 'bindEvents',
    value: function bindEvents() {
      var _this2 = this;

      this.$toggle.addEventListener('click', function (e) {
        e.preventDefault();

        _this2.active = !_this2.active;
        _this2.executeListeners(_this2._active);
      });
    }
  }, {
    key: 'value',
    set: function set(bool) {
      this.active = bool;
    },
    get: function get() {
      return this._active;
    }

    /**
     * Alias for `value`.
     * @type {Boolean}
     */

  }, {
    key: 'active',
    set: function set(bool) {
      this._active = bool;
      this._updateBtn();
    },
    get: function get() {
      return this._active;
    }
  }]);

  return Toggle;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = Toggle;

},{"../mixins/display":26,"../utils/elements":27,"./BaseComponent":12}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _BaseComponent = require('./BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _display2 = require('../mixins/display');

var _display3 = _interopRequireDefault(_display2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

var defaults = {
  label: '&nbsp;',
  options: null,
  container: null,
  callback: null
};

/**
 * List of buttons without state.
 *
 * @param {Object} config - Override default parameters.
 * @param {String} config.label - Label of the controller.
 * @param {Array} [config.options=null] - Options for each button.
 * @param {String|Element|basic-controller~Group} [config.container=null] -
 *  Container of the controller.
 * @param {Function} [config.callback=null] - Callback to be executed when the
 *  value changes.
 *
 * @example
 * import * as controllers from 'basic-controllers';
 *
 * const triggerButtons = new controllers.TriggerButtons({
 *   label: 'My Trigger Buttons',
 *   options: ['value 1', 'value 2', 'value 3'],
 *   container: '#container',
 *   callback: (value, index) => console.log(value, index),
 * });
 */

var TriggerButtons = function (_display) {
  _inherits(TriggerButtons, _display);

  function TriggerButtons(config) {
    _classCallCheck(this, TriggerButtons);

    var _this = _possibleConstructorReturn(this, (TriggerButtons.__proto__ || Object.getPrototypeOf(TriggerButtons)).call(this, 'trigger-buttons', defaults, config));

    if (!Array.isArray(_this.params.options)) throw new Error('TriggerButton: Invalid option "options"');

    _this._index = null;
    _this._value = null;

    _get(TriggerButtons.prototype.__proto__ || Object.getPrototypeOf(TriggerButtons.prototype), 'initialize', _this).call(_this);
    return _this;
  }

  /**
   * Last triggered button value.
   *
   * @readonly
   * @type {String}
   */


  _createClass(TriggerButtons, [{
    key: 'render',


    /** @private */
    value: function render() {
      var _params = this.params,
          label = _params.label,
          options = _params.options;


      var content = '\n      <span class="label">' + label + '</span>\n      <div class="inner-wrapper">\n        ' + options.map(function (option, index) {
        return '<a href="#" class="btn">' + option + '</a>';
      }).join('') + '\n      </div>';

      this.$el = _get(TriggerButtons.prototype.__proto__ || Object.getPrototypeOf(TriggerButtons.prototype), 'render', this).call(this);
      this.$el.innerHTML = content;

      this.$buttons = Array.from(this.$el.querySelectorAll('.btn'));
      this._bindEvents();

      return this.$el;
    }

    /** @private */

  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this2 = this;

      this.$buttons.forEach(function ($btn, index) {
        var value = _this2.params.options[index];

        $btn.addEventListener('click', function (e) {
          e.preventDefault();

          _this2._value = value;
          _this2._index = index;

          _this2.executeListeners(value, index);
        });
      });
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    }

    /**
     * Last triggered button index.
     *
     * @readonly
     * @type {String}
     */

  }, {
    key: 'index',
    get: function get() {
      return this._index;
    }
  }]);

  return TriggerButtons;
}((0, _display3.default)(_BaseComponent2.default));

exports.default = TriggerButtons;

},{"../mixins/display":26,"./BaseComponent":12}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BaseComponent = require('./components/BaseComponent');

var _BaseComponent2 = _interopRequireDefault(_BaseComponent);

var _Group = require('./components/Group');

var _Group2 = _interopRequireDefault(_Group);

var _NumberBox = require('./components/NumberBox');

var _NumberBox2 = _interopRequireDefault(_NumberBox);

var _SelectButtons = require('./components/SelectButtons');

var _SelectButtons2 = _interopRequireDefault(_SelectButtons);

var _SelectList = require('./components/SelectList');

var _SelectList2 = _interopRequireDefault(_SelectList);

var _Slider = require('./components/Slider');

var _Slider2 = _interopRequireDefault(_Slider);

var _Text = require('./components/Text');

var _Text2 = _interopRequireDefault(_Text);

var _Title = require('./components/Title');

var _Title2 = _interopRequireDefault(_Title);

var _Toggle = require('./components/Toggle');

var _Toggle2 = _interopRequireDefault(_Toggle);

var _TriggerButtons = require('./components/TriggerButtons');

var _TriggerButtons2 = _interopRequireDefault(_TriggerButtons);

var _container2 = require('./mixins/container');

var _container3 = _interopRequireDefault(_container2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// map type names to constructors
var typeCtorMap = {
  'group': _Group2.default,
  'number-box': _NumberBox2.default,
  'select-buttons': _SelectButtons2.default,
  'select-list': _SelectList2.default,
  'slider': _Slider2.default,
  'text': _Text2.default,
  'title': _Title2.default,
  'toggle': _Toggle2.default,
  'trigger-buttons': _TriggerButtons2.default
};

var defaults = {
  container: 'body'
};

var Control = function (_container) {
  _inherits(Control, _container);

  function Control(config) {
    _classCallCheck(this, Control);

    var _this = _possibleConstructorReturn(this, (Control.__proto__ || Object.getPrototypeOf(Control)).call(this, 'control', defaults, config));

    var $container = _this.params.container;

    if (typeof $container === 'string') $container = document.querySelector($container);

    _this.$container = $container;
    return _this;
  }

  return Control;
}((0, _container3.default)(_BaseComponent2.default));

/** @module basic-controllers */

/**
 * Create a whole control surface from a json definition.
 *
 * @param {String|Element} container - Container of the controls.
 * @param {Object} - Definitions for the controls.
 * @return {Object} - A `Control` instance that behaves like a group without graphic.
 * @static
 *
 * @example
 * import * as controllers from 'basic-controllers';
 *
 * const definitions = [
 *   {
 *     id: 'my-slider',
 *     type: 'slider',
 *     label: 'My Slider',
 *     size: 'large',
 *     min: 0,
 *     max: 1000,
 *     step: 1,
 *     default: 253,
 *   }, {
 *     id: 'my-group',
 *     type: 'group',
 *     label: 'Group',
 *     default: 'opened',
 *     elements: [
 *       {
 *         id: 'my-number',
 *         type: 'number-box',
 *         default: 0.4,
 *         min: -1,
 *         max: 1,
 *         step: 0.01,
 *       }
 *     ],
 *   }
 * ];
 *
 * const controls = controllers.create('#container', definitions);
 *
 * // add a listener on all the component inside `my-group`
 * controls.addListener('my-group', (id, value) => console.log(id, value));
 *
 * // retrieve the instance of `my-number`
 * const myNumber = controls.getComponent('my-group/my-number');
 */


function create(container, definitions) {

  function _parse(container, definitions) {
    definitions.forEach(function (def, index) {
      var type = def.type;
      var ctor = typeCtorMap[type];
      var config = Object.assign({}, def);

      //
      config.container = container;
      delete config.type;

      var component = new ctor(config);

      if (type === 'group') _parse(component, config.elements);
    });
  };

  var _root = new Control({ container: container });
  _parse(_root, definitions);

  return _root;
}

exports.default = create;

},{"./components/BaseComponent":12,"./components/Group":14,"./components/NumberBox":15,"./components/SelectButtons":16,"./components/SelectList":17,"./components/Slider":18,"./components/Text":19,"./components/Title":20,"./components/Toggle":21,"./components/TriggerButtons":22,"./mixins/container":25}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTheme = exports.create = exports.TriggerButtons = exports.Toggle = exports.Title = exports.Text = exports.Slider = exports.SelectList = exports.SelectButtons = exports.NumberBox = exports.DragAndDrop = exports.Group = exports.BaseComponent = exports.styles = undefined;

var _Group = require('./components/Group');

Object.defineProperty(exports, 'Group', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Group).default;
  }
});

var _DragAndDrop = require('./components/DragAndDrop');

Object.defineProperty(exports, 'DragAndDrop', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_DragAndDrop).default;
  }
});

var _NumberBox = require('./components/NumberBox');

Object.defineProperty(exports, 'NumberBox', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_NumberBox).default;
  }
});

var _SelectButtons = require('./components/SelectButtons');

Object.defineProperty(exports, 'SelectButtons', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SelectButtons).default;
  }
});

var _SelectList = require('./components/SelectList');

Object.defineProperty(exports, 'SelectList', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SelectList).default;
  }
});

var _Slider = require('./components/Slider');

Object.defineProperty(exports, 'Slider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Slider).default;
  }
});

var _Text = require('./components/Text');

Object.defineProperty(exports, 'Text', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Text).default;
  }
});

var _Title = require('./components/Title');

Object.defineProperty(exports, 'Title', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Title).default;
  }
});

var _Toggle = require('./components/Toggle');

Object.defineProperty(exports, 'Toggle', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Toggle).default;
  }
});

var _TriggerButtons = require('./components/TriggerButtons');

Object.defineProperty(exports, 'TriggerButtons', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TriggerButtons).default;
  }
});

var _factory = require('./factory');

Object.defineProperty(exports, 'create', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_factory).default;
  }
});

var _display = require('./mixins/display');

Object.defineProperty(exports, 'setTheme', {
  enumerable: true,
  get: function get() {
    return _display.setTheme;
  }
});
exports.disableStyles = disableStyles;

var _styles2 = require('./utils/styles');

var _styles = _interopRequireWildcard(_styles2);

var _BaseComponent2 = require('./components/BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = exports.styles = _styles;

/** @module basic-controllers */

// expose for plugins
var BaseComponent = exports.BaseComponent = _BaseComponent3.default;

// components


/**
 * Disable default styling (expect a broken ui)
 */
function disableStyles() {
  _styles.disable();
};

},{"./components/BaseComponent":12,"./components/DragAndDrop":13,"./components/Group":14,"./components/NumberBox":15,"./components/SelectButtons":16,"./components/SelectList":17,"./components/Slider":18,"./components/Text":19,"./components/Title":20,"./components/Toggle":21,"./components/TriggerButtons":22,"./factory":23,"./mixins/display":26,"./utils/styles":29}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var separator = '/';

function getHead(path) {
  return path.split(separator)[0];
}

function getTail(path) {
  var parts = path.split(separator);
  parts.shift();
  return parts.join(separator);
}

var container = function container(superclass) {
  return function (_superclass) {
    _inherits(_class, _superclass);

    function _class() {
      var _ref;

      _classCallCheck(this, _class);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));

      _this.elements = new Set();

      // sure of that ?
      delete _this._listeners;
      delete _this._groupListeners;
      return _this;
    }

    /**
     * Return one of the group children according to its `id`, `null` otherwise.
     * @private
     */


    _createClass(_class, [{
      key: '_getHead',
      value: function _getHead(id) {}
    }, {
      key: '_getTail',
      value: function _getTail(id) {}

      /**
       * Return a child of the group recursively according to the given `id`,
       * `null` otherwise.
       * @private
       */

    }, {
      key: 'getComponent',
      value: function getComponent(id) {
        var head = getHead(id);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.elements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var component = _step.value;

            if (head === component.id) {
              if (head === id) return component;else if (component.type = 'group') return component.getComponent(getTail(id));else throw new Error('Undefined component ' + id);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        throw new Error('Undefined component ' + id);
      }

      /**
       * Add Listener on each components of the group.
       *
       * @param {String} id - Path to component id.
       * @param {Function} callback - Function to execute.
       */

    }, {
      key: 'addListener',
      value: function addListener(id, callback) {
        if (arguments.length === 1) {
          callback = id;
          this._addGroupListener('', '', callback);
        } else {
          this._addGroupListener(id, '', callback);
        }
      }

      /** @private */

    }, {
      key: '_addGroupListener',
      value: function _addGroupListener(id, callId, callback) {
        if (id) {
          var componentId = getHead(id);
          var component = this.getComponent(componentId);

          if (component) {
            id = getTail(id);
            component._addGroupListener(id, callId, callback);
          } else {
            throw new Error('Undefined component ' + this.rootId + '/' + componentId);
          }
        } else {
          this.elements.forEach(function (component) {
            var _callId = callId; // create a new branche
            _callId += callId === '' ? component.id : separator + component.id;
            component._addGroupListener(id, _callId, callback);
          });
        }
      }
    }]);

    return _class;
  }(superclass);
};

exports.default = container;

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.setTheme = setTheme;

var _styles = require('../utils/styles');

var styles = _interopRequireWildcard(_styles);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/** @module basic-controllers */

// default theme
var theme = 'light';
// set of the instanciated controllers
var controllers = new Set();

/**
 * Change the theme of the controllers, currently 3 themes are available:
 *  - `'light'` (default)
 *  - `'grey'`
 *  - `'dark'`
 *
 * @param {String} theme - Name of the theme.
 */
function setTheme(value) {
  controllers.forEach(function (controller) {
    return controller.$el.classList.remove(theme);
  });
  theme = value;
  controllers.forEach(function (controller) {
    return controller.$el.classList.add(theme);
  });
}

/**
 * display mixin - components with DOM
 * @private
 */
var display = function display(superclass) {
  return function (_superclass) {
    _inherits(_class, _superclass);

    function _class() {
      var _ref;

      _classCallCheck(this, _class);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // insert styles when the first controller is created
      var _this = _possibleConstructorReturn(this, (_ref = _class.__proto__ || Object.getPrototypeOf(_class)).call.apply(_ref, [this].concat(args)));

      if (controllers.size === 0) styles.insertStyleSheet();

      _this.resize = _this.resize.bind(_this);

      controllers.add(_this);
      return _this;
    }

    _createClass(_class, [{
      key: 'initialize',
      value: function initialize() {
        var _this2 = this;

        var $container = this.params.container;

        if ($container) {
          // css selector
          if (typeof $container === 'string') {
            $container = document.querySelector($container);
            // group
          } else if ($container.$container) {
            // this.group = $container;
            $container.elements.add(this);
            $container = $container.$container;
          }

          $container.appendChild(this.render());
          setTimeout(function () {
            return _this2.resize();
          }, 0);
        }
      }

      /** @private */

    }, {
      key: 'render',
      value: function render() {
        this.$el = document.createElement('div');
        this.$el.classList.add(styles.ns, theme, this.type);

        window.removeEventListener('resize', this.resize);
        window.addEventListener('resize', this.resize);

        return this.$el;
      }

      /** @private */

    }, {
      key: 'resize',
      value: function resize() {
        if (this.$el) {
          var boundingRect = this.$el.getBoundingClientRect();
          var width = boundingRect.width;
          var method = width > 600 ? 'remove' : 'add';

          this.$el.classList[method]('small');
        }
      }
    }]);

    return _class;
  }(superclass);
};

exports.default = display;

},{"../utils/styles":29}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var toggle = exports.toggle = "\n  <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"toggle-element\" version=\"1.1\" viewBox=\"0 0 50 50\" preserveAspectRatio=\"none\">\n      <g class=\"x\">\n        <line x1=\"8\" y1=\"8\" x2=\"42\" y2=\"42\" stroke=\"white\" />\n        <line x1=\"8\" y1=\"42\" x2=\"42\" y2=\"8\" stroke=\"white\" />\n      </g>\n  </svg>\n";

var arrowRight = exports.arrowRight = "\n  <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"arrow-right\" version=\"1.1\" viewBox=\"0 0 50 50\" preserveAspectRatio=\"none\">\n    <line x1=\"10\" y1=\"10\" x2=\"40\" y2=\"25\" />\n    <line x1=\"10\" y1=\"40\" x2=\"40\" y2=\"25\" />\n  </svg>\n";

var arrowLeft = exports.arrowLeft = "\n  <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"arrow-left\" version=\"1.1\" viewBox=\"0 0 50 50\" preserveAspectRatio=\"none\">\n    <line x1=\"40\" y1=\"10\" x2=\"10\" y2=\"25\" />\n    <line x1=\"40\" y1=\"40\" x2=\"10\" y2=\"25\" />\n  </svg>\n";

var smallArrowRight = exports.smallArrowRight = "\n  <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"small-arrow-right\" viewBox=\"0 0 50 50\">\n    <path d=\"M 20 15 L 35 25 L 20 35 Z\" />\n  </svg>\n";

var smallArrowBottom = exports.smallArrowBottom = "\n  <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"small-arrow-bottom\" viewBox=\"0 0 50 50\">\n    <path d=\"M 15 17 L 35 17 L 25 32 Z\" />\n  </svg>\n";

},{}],28:[function(require,module,exports){
module.exports = " .basic-controllers { } .basic-controllers { width: 100%; max-width: 800px; height: 34px; padding: 3px; margin: 4px 0; background-color: #efefef; border: 1px solid #aaaaaa; box-sizing: border-box; border-radius: 2px; display: block; color: #464646; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; } .basic-controllers .label { font: italic normal 1.2em Quicksand, arial, sans-serif; line-height: 26px; overflow: hidden; text-align: right; padding: 0 8px 0 0; display: block; box-sizing: border-box; width: 24%; float: left; white-space: nowrap; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none; } .basic-controllers .inner-wrapper { display: -webkit-inline-flex; display: inline-flex; -webkit-flex-wrap: no-wrap; flex-wrap: no-wrap; width: 76%; float: left; } .basic-controllers.small { height: 48px; } .basic-controllers.small:not(.align-small) { height: auto; } .basic-controllers.small:not(.align-small) .label { width: 100%; float: none; text-align: left; line-height: 40px; } .basic-controllers.small:not(.align-small) .inner-wrapper { width: 100%; float: none; } .basic-controllers.small.align-small .label { display: block; margin-right: 20px; text-align: left; line-height: 40px; } .basic-controllers.small.align-small .inner-wrapper { display: inline-block; width: auto; } .basic-controllers .arrow-right, .basic-controllers .arrow-left { border-radius: 2px; width: 14px; height: 26px; cursor: pointer; background-color: #464646; } .basic-controllers .arrow-right line, .basic-controllers .arrow-left line { stroke-width: 3px; stroke: #ffffff; } .basic-controllers .arrow-right:hover, .basic-controllers .arrow-left:hover { background-color: #686868; } .basic-controllers .arrow-right:active, .basic-controllers .arrow-left:active { background-color: #909090; } .basic-controllers .small-arrow-right, .basic-controllers .small-arrow-bottom { width: 26px; height: 26px; cursor: pointer; } .basic-controllers .small-arrow-right path, .basic-controllers .small-arrow-bottom path { fill: #909090; } .basic-controllers .small-arrow-right:hover path, .basic-controllers .small-arrow-bottom:hover path { fill: #686868; } .basic-controllers .toggle-element { width: 26px; height: 26px; border-radius: 2px; background-color: #464646; cursor: pointer; } .basic-controllers .toggle-element:hover { background-color: #686868; } .basic-controllers .toggle-element line { stroke-width: 3px; } .basic-controllers .toggle-element .x { display: none; } .basic-controllers .toggle-element.active .x { display: block; } .basic-controllers .btn { display: block; text-align: center; font: normal normal 12px arial; text-decoration: none; height: 26px; line-height: 26px; background-color: #464646; border: none; color: #ffffff; margin: 0 4px 0 0; padding: 0; box-sizing: border-box; border-radius: 2px; cursor: pointer; -webkit-flex-grow: 1; flex-grow: 1; } .basic-controllers .btn:last-child { margin: 0; } .basic-controllers .btn:hover { background-color: #686868; } .basic-controllers .btn:active, .basic-controllers .btn.active { background-color: #909090; } .basic-controllers .btn:focus { outline: none; } .basic-controllers .number { height: 26px; display: inline-block; position: relative; font: normal normal 1.2em Quicksand, arial, sans-serif; vertical-align: top; border: none; background: none; color: #464646; padding: 0 4px; margin: 0; background-color: #f9f9f9; border-radius: 2px; box-sizing: border-box; } .basic-controllers .number:focus { outline: none; } .basic-controllers select { height: 26px; line-height: 26px; background-color: #f9f9f9; border-radius: 2px; border: none; vertical-align: top; padding: 0; margin: 0; } .basic-controllers select:focus { outline: none; } .basic-controllers input[type=text] { width: 100%; height: 26px; line-height: 26px; border: 0; padding: 0 4px; background-color: #f9f9f9; border-radius: 2px; color: #565656; } .basic-controllers.small .arrow-right, .basic-controllers.small .arrow-left { width: 24px; height: 40px; } .basic-controllers.small .toggle-element { width: 40px; height: 40px; } .basic-controllers.small .btn { height: 40px; line-height: 40px; } .basic-controllers.small .number { height: 40px; } .basic-controllers.small select { height: 40px; line-height: 40px; } .basic-controllers.small input[type=text] { height: 40px; line-height: 40px; } .basic-controllers.title { border: none !important; margin-bottom: 0; margin-top: 8px; padding-top: 8px; padding-bottom: 0; background-color: transparent !important; height: 25px; } .basic-controllers.title .label { font: normal bold 1.3em Quicksand, arial, sans-serif; height: 100%; overflow: hidden; text-align: left; padding: 0; width: 100%; box-sizing: border-box; -webkit-flex-grow: 1; flex-grow: 1; } .basic-controllers.group { height: auto; background-color: white; } .basic-controllers.group .group-header .label { font: normal bold 1.3em Quicksand, arial, sans-serif; height: 26px; line-height: 26px; overflow: hidden; text-align: left; padding: 0 0 0 36px; width: 100%; box-sizing: border-box; -webkit-flex-grow: 1; flex-grow: 1; float: none; cursor: pointer; } .basic-controllers.group .group-header .small-arrow-right { width: 26px; height: 26px; position: absolute; } .basic-controllers.group .group-header .small-arrow-bottom { width: 26px; height: 26px; position: absolute; } .basic-controllers.group .group-content { overflow: hidden; } .basic-controllers.group .group-content > div { margin: 4px auto; } .basic-controllers.group .group-content > div:last-child { margin-bottom: 0; } .basic-controllers.group.opened .group-header .small-arrow-right { display: none; } .basic-controllers.group.opened .group-header .small-arrow-bottom { display: block; } .basic-controllers.group.opened .group-content { display: block; } .basic-controllers.group.closed .group-header .small-arrow-right { display: block; } .basic-controllers.group.closed .group-header .small-arrow-bottom { display: none; } .basic-controllers.group.closed .group-content { display: none; } .basic-controllers.slider .range { height: 26px; display: inline-block; margin: 0; -webkit-flex-grow: 4; flex-grow: 4; position: relative; } .basic-controllers.slider .range canvas { position: absolute; top: 0; left: 0; } .basic-controllers.slider .number-wrapper { display: inline; height: 26px; text-align: right; -webkit-flex-grow: 3; flex-grow: 3; } .basic-controllers.slider .number-wrapper .number { left: 5px; width: 54px; text-align: right; } .basic-controllers.slider .number-wrapper .unit { font: italic normal 1em Quicksand, arial, sans-serif; line-height: 26px; height: 26px; width: 30px; display: inline-block; position: relative; padding-left: 5px; padding-right: 5px; color: #565656; } .basic-controllers.slider .number-wrapper .unit sup { line-height: 7px; } .basic-controllers.slider.slider-large .range { -webkit-flex-grow: 50; flex-grow: 50; } .basic-controllers.slider.slider-large .number-wrapper { -webkit-flex-grow: 1; flex-grow: 1; } .basic-controllers.slider.slider-small .range { -webkit-flex-grow: 2; flex-grow: 2; } .basic-controllers.slider.slider-small .number-wrapper { -webkit-flex-grow: 4; flex-grow: 4; } .basic-controllers.small.slider .range { height: 40px; } .basic-controllers.small.slider .number-wrapper { height: 40px; } .basic-controllers.small.slider .number-wrapper .unit { line-height: 40px; height: 40px; } .basic-controllers.number-box .number { width: 120px; margin: 0 10px; vertical-align: top; } .basic-controllers.select-list select { margin: 0 10px; width: 120px; font: normal normal 1.2em Quicksand, arial, sans-serif; color: #464646; } .basic-controllers.select-buttons .btn:first-of-type { margin-left: 4px; } .basic-controllers.text input[type=text] { font: normal normal 1.2em Quicksand, arial, sans-serif; color: #464646; } .basic-controllers.drag-and-drop { width: 100%; text-align: center; font-weight: bold; height: 100px; } .basic-controllers.drag-and-drop .drop-zone { border: 1px dotted #c4c4c4; border-radius: 2px; transition: background 200ms; height: 90px; } .basic-controllers.drag-and-drop .drop-zone.drag { background-color: #c4c4c4; } .basic-controllers.drag-and-drop .label { display: block; width: 100%; height: 90px; line-height: 90px; margin: 0; padding: 0; text-align: center; } .basic-controllers.drag-and-drop.process .label { display: none; } .basic-controllers.small.drag-and-drop { height: 120px; } .basic-controllers.small.drag-and-drop .drop-zone { height: 110px; } .basic-controllers.small.drag-and-drop .label { display: block; width: 100%; height: 110px; line-height: 110px; margin: 0; padding: 0; text-align: center; } .basic-controllers.grey { background-color: #363636; border: 1px solid #585858; color: rgba(255, 255, 255, 0.95); } .basic-controllers.grey .toggle-element { background-color: #efefef; } .basic-controllers.grey .toggle-element line { stroke: #363636; } .basic-controllers.grey .toggle-element:hover { background-color: #cdcdcd; } .basic-controllers.grey .arrow-right, .basic-controllers.grey .arrow-left { background-color: #efefef; } .basic-controllers.grey .arrow-right line, .basic-controllers.grey .arrow-left line { stroke: #363636; } .basic-controllers.grey .arrow-right:hover, .basic-controllers.grey .arrow-left:hover { background-color: #cdcdcd; } .basic-controllers.grey .arrow-right:active, .basic-controllers.grey .arrow-left:active { background-color: #ababab; } .basic-controllers.grey .small-arrow-right path, .basic-controllers.grey .small-arrow-bottom path { fill: #ababab; } .basic-controllers.grey .small-arrow-right:hover path, .basic-controllers.grey .small-arrow-bottom:hover path { fill: #cdcdcd; } .basic-controllers.grey .number, .basic-controllers.grey select, .basic-controllers.grey input[type=text] { color: rgba(255, 255, 255, 0.95); background-color: #454545; } .basic-controllers.grey .btn { background-color: #efefef; color: #363636; } .basic-controllers.grey .btn:hover { background-color: #cdcdcd; } .basic-controllers.grey .btn:active, .basic-controllers.grey .btn.active { background-color: #ababab; } .basic-controllers.grey.slider .inner-wrapper .number-wrapper .unit { color: #bcbcbc; } .basic-controllers.grey.group { background-color: #505050; } .basic-controllers.grey.drag-and-drop .drop-zone { border: 1px dotted #727272; } .basic-controllers.grey.drag-and-drop .drop-zone.drag { background-color: #727272; } .basic-controllers.dark { background-color: #242424; border: 1px solid #282828; color: #ffffff; } .basic-controllers.dark .toggle-element { background-color: #464646; } .basic-controllers.dark .toggle-element line { stroke: #ffffff; } .basic-controllers.dark .toggle-element:hover { background-color: #686868; } .basic-controllers.dark .arrow-right, .basic-controllers.dark .arrow-left { background-color: #464646; } .basic-controllers.dark .arrow-right line, .basic-controllers.dark .arrow-left line { stroke: #ffffff; } .basic-controllers.dark .arrow-right:hover, .basic-controllers.dark .arrow-left:hover { background-color: #686868; } .basic-controllers.dark .arrow-right:active, .basic-controllers.dark .arrow-left:active { background-color: #909090; } .basic-controllers.dark .small-arrow-right path, .basic-controllers.dark .small-arrow-bottom path { fill: #909090; } .basic-controllers.dark .small-arrow-right:hover path, .basic-controllers.dark .small-arrow-bottom:hover path { fill: #686868; } .basic-controllers.dark .number, .basic-controllers.dark select, .basic-controllers.dark input[type=text] { color: #ffffff; background-color: #333333; } .basic-controllers.dark .btn { background-color: #464646; color: #ffffff; } .basic-controllers.dark .btn:hover { background-color: #686868; } .basic-controllers.dark .btn:active, .basic-controllers.dark .btn.active { background-color: #909090; } .basic-controllers.dark.slider .inner-wrapper .number-wrapper .unit { color: #cdcdcd; } .basic-controllers.dark.group { background-color: #3e3e3e; } .basic-controllers.dark.drag-and-drop .drop-zone { border: 1px dotted #424242; } .basic-controllers.dark.drag-and-drop .drop-zone.drag { background-color: #424242; } ";
},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ns = undefined;
exports.disable = disable;
exports.insertStyleSheet = insertStyleSheet;

var _package = require('../../package.json');

var _stylesDeclarations = require('./styles-declarations.js');

var _stylesDeclarations2 = _interopRequireDefault(_stylesDeclarations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ns = exports.ns = _package.name.replace('@ircam/', '');

var nsClass = '.' + ns;
var _disabled = false;

function disable() {
  _disabled = true;
}

function insertStyleSheet() {
  if (_disabled) return;

  var $css = document.createElement('style');
  $css.setAttribute('data-namespace', ns);
  $css.type = 'text/css';

  if ($css.styleSheet) $css.styleSheet.cssText = _stylesDeclarations2.default;else $css.appendChild(document.createTextNode(_stylesDeclarations2.default));

  // insert before link or styles if exists
  var $link = document.head.querySelector('link');
  var $style = document.head.querySelector('style');

  if ($link) document.head.insertBefore($css, $link);else if ($style) document.head.insertBefore($css, $style);else document.head.appendChild($css);
}

},{"../../package.json":30,"./styles-declarations.js":28}],30:[function(require,module,exports){
module.exports={
  "_from": "@ircam/basic-controllers",
  "_id": "@ircam/basic-controllers@1.0.4",
  "_inBundle": false,
  "_integrity": "sha512-3cSAtxfpXtg1a3hvyVJN5gNmfqwf5mSbxuxq2g9I6/roUswtxOgGwYwWV18UJFWR75Mqot5SSVvbLdPPgv1noA==",
  "_location": "/@ircam/basic-controllers",
  "_phantomChildren": {},
  "_requested": {
    "type": "tag",
    "registry": true,
    "raw": "@ircam/basic-controllers",
    "name": "@ircam/basic-controllers",
    "escapedName": "@ircam%2fbasic-controllers",
    "scope": "@ircam",
    "rawSpec": "",
    "saveSpec": null,
    "fetchSpec": "latest"
  },
  "_requiredBy": [
    "#USER",
    "/"
  ],
  "_resolved": "https://registry.npmjs.org/@ircam/basic-controllers/-/basic-controllers-1.0.4.tgz",
  "_shasum": "2e2152c618bae946126b8ebf41baeb95cb3c40f8",
  "_spec": "@ircam/basic-controllers",
  "_where": "/Users/matuszewski/dev/js/wavesjs/lib/waves-audio/examples/simple-scheduler",
  "bugs": {
    "url": "https://github.com/ircam-jstools/basic-controllers/issues"
  },
  "bundleDependencies": false,
  "dependencies": {
    "@ircam/gui-components": "^1.0.3"
  },
  "deprecated": false,
  "description": "Set of simple controllers for rapid prototyping",
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-plugin-transform-es2015-modules-commonjs": "^6.26.0",
    "babel-preset-env": "^1.6.1",
    "browserify": "^14.5.0",
    "chalk": "^2.3.0",
    "fs-extra": "^4.0.3",
    "jsdoc-to-markdown": "^3.0.0",
    "klaw": "^2.1.1",
    "node-sass": "^4.7.2",
    "np": "^2.18.2",
    "tape": "^4.8.0",
    "uglify-js": "^3.2.2",
    "watch": "^1.0.2"
  },
  "homepage": "https://github.com/ircam-jstools/basic-controllers#readme",
  "license": "BSD-3-Clause",
  "main": "dist/index.js",
  "name": "@ircam/basic-controllers",
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ircam-jstools/basic-controllers.git"
  },
  "scripts": {
    "bundle": "node ./bin/runner --bundle",
    "deploy": "np --yolo",
    "doc": "jsdoc2md -t tmpl/README.hbs src/**/*.js > README.md",
    "prewatch": "npm run transpile",
    "transpile": "node ./bin/runner --transpile",
    "version": "npm run transpile && npm run doc && git add README.md",
    "watch": "node ./bin/runner --watch"
  },
  "standalone": "basicControllers",
  "version": "1.0.4"
}

},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Breakpoint = function () {
  function Breakpoint(options) {
    _classCallCheck(this, Breakpoint);

    var defaults = {
      callback: function callback(value) {},
      width: 300,
      height: 150,
      container: 'body',
      default: [],
      radius: 4
    };

    this.params = Object.assign({}, defaults, options);

    this._values = {
      norm: [],
      logical: [],
      displayed: []
    };

    this._createElement();

    // initialize
    this._resizeElement();

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._onResize = this._onResize.bind(this);

    this._onResize();
    this._bindEvents();

    window.addEventListener('resize', this._onResize);
  }

  _createClass(Breakpoint, [{
    key: '_createElement',


    /** @note - same as Slider */
    value: function _createElement() {
      var container = this.params.container;

      this.$canvas = document.createElement('canvas');
      this.ctx = this.$canvas.getContext('2d');

      if (container instanceof Element) this.$container = container;else this.$container = document.querySelector(container);

      this.$container.appendChild(this.$canvas);
    }

    /** @note - same as Slider */

  }, {
    key: '_resizeElement',
    value: function _resizeElement() {
      var _params = this.params,
          width = _params.width,
          height = _params.height;

      // logical and pixel size of the canvas

      this._pixelRatio = function (ctx) {
        var dPR = window.devicePixelRatio || 1;
        var bPR = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

        return dPR / bPR;
      }(this.ctx);

      this._canvasWidth = width * this._pixelRatio;
      this._canvasHeight = height * this._pixelRatio;

      this.ctx.canvas.width = this._canvasWidth;
      this.ctx.canvas.height = this._canvasHeight;
      this.ctx.canvas.style.width = width + 'px';
      this.ctx.canvas.style.height = height + 'px';
    }
  }, {
    key: 'resize',
    value: function resize(width, height) {}

    // update this.dots.displayed according to new width and height


    /** @note - same as Slider */

  }, {
    key: '_onResize',
    value: function _onResize() {
      this._boundingClientRect = this.$canvas.getBoundingClientRect();
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      this.$canvas.addEventListener('mousedown', this._onMouseDown);
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(e) {
      var pageX = e.pageX;
      var pageY = e.pageY;
      var x = pageX - this._boundingClientRect.left;
      var y = pageY - this._boundingClientRect.top;

      if (this._testHit(x, y)) {
        // bind mousemove and mouseup
        console.log('hit');
      } else {
        // create a new point
        console.log('create dot');
        this._createDot(x, y);
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove() {}
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp() {}

    // test if given x, y (in pixels) match some already displayed values

  }, {
    key: '_testHit',
    value: function _testHit(x, y) {
      var displayedValues = this._values.displayed;
      var radius = this.params.radius;

      for (var i = 0; i < displayedValues.length; i++) {
        var dot = displayedValues[i];
        var dx = dot[0] - x;
        var dy = dot[1] - y;
        var mag = Math.sqrt(dx * dx + dy * dy);

        if (mag <= radius) return true;
      }

      return false;
    }
  }, {
    key: '_createDot',
    value: function _createDot(x, y) {
      var normX = x / this.params.width;
      var normY = y / this.p$arams.height;
    }
  }, {
    key: 'values',
    get: function get() {},
    set: function set(values) {}
  }]);

  return Breakpoint;
}();

exports.default = Breakpoint;

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getScale(domain, range) {
  var slope = (range[1] - range[0]) / (domain[1] - domain[0]);
  var intercept = range[0] - slope * domain[0];

  function scale(val) {
    return slope * val + intercept;
  }

  scale.invert = function (val) {
    return (val - intercept) / slope;
  };

  return scale;
}

function getClipper(min, max, step) {
  return function (val) {
    var clippedValue = Math.round(val / step) * step;
    var fixed = Math.max(Math.log10(1 / step), 0);
    var fixedValue = clippedValue.toFixed(fixed); // fix floating point errors
    return Math.min(max, Math.max(min, parseFloat(fixedValue)));
  };
}

/**
 * @module gui-components
 */

/**
 * Versatile canvas based slider.
 *
 * @param {Object} options - Override default parameters.
 * @param {'jump'|'proportionnal'|'handle'} [options.mode='jump'] - Mode of the slider:
 *  - in 'jump' mode, the value is changed on 'touchstart' or 'mousedown', and
 *    on move.
 *  - in 'proportionnal' mode, the value is updated relatively to move.
 *  - in 'handle' mode, the slider can be grabbed only around its value.
 * @param {Function} [options.callback] - Callback to be executed when the value
 *  of the slider changes.
 * @param {Number} [options.width=200] - Width of the slider.
 * @param {Number} [options.height=30] - Height of the slider.
 * @param {Number} [options.min=0] - Minimum value.
 * @param {Number} [options.max=1] - Maximum value.
 * @param {Number} [options.step=0.01] - Step between each consecutive values.
 * @param {Number} [options.default=0] - Default value.
 * @param {String|Element} [options.container='body'] - CSS Selector or DOM
 *  element in which inserting the slider.
 * @param {String} [options.backgroundColor='#464646'] - Background color of the
 *  slider.
 * @param {String} [options.foregroundColor='steelblue'] - Foreground color of
 *  the slider.
 * @param {'horizontal'|'vertical'} [options.orientation='horizontal'] -
 *  Orientation of the slider.
 * @param {Array} [options.markers=[]] - List of values where markers should
 *  be displayed on the slider.
 * @param {Boolean} [options.showHandle=true] - In 'handle' mode, define if the
 *  draggable should be show or not.
 * @param {Number} [options.handleSize=20] - Size of the draggable zone.
 * @param {String} [options.handleColor='rgba(255, 255, 255, 0.7)'] - Color of the
 *  draggable zone (when `showHandle` is `true`).
 *
 * @example
 * import { Slider} from 'gui-components';
 *
 * const slider = new Slider({
 *   mode: 'jump',
 *   container: '#container',
 *   default: 0.6,
 *   markers: [0.5],
 *   callback: (value) => console.log(value),
 * });
 */

var Slider = function () {
  function Slider(options) {
    _classCallCheck(this, Slider);

    var defaults = {
      mode: 'jump',
      callback: function callback(value) {},
      width: 200,
      height: 30,
      min: 0,
      max: 1,
      step: 0.01,
      default: 0,
      container: 'body',
      backgroundColor: '#464646',
      foregroundColor: 'steelblue',
      orientation: 'horizontal',
      markers: [],

      // handle specific options
      showHandle: true,
      handleSize: 20,
      handleColor: 'rgba(255, 255, 255, 0.7)'
    };

    this.params = Object.assign({}, defaults, options);
    this._listeners = [];
    this._boundingClientRect = null;
    this._touchId = null;
    this._value = null;
    this._canvasWidth = null;
    this._canvasHeight = null;
    // for proportionnal mode
    this._currentMousePosition = { x: null, y: null };
    this._currentSliderPosition = null;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    this._onResize = this._onResize.bind(this);

    this._createElement();

    // initialize
    this._resizeElement();
    this._setScales();
    this._bindEvents();
    this._onResize();
    this._updateValue(this.params.default, true, true);

    window.addEventListener('resize', this._onResize);
  }

  /**
   * Current value of the slider.
   *
   * @type {Number}
   */


  _createClass(Slider, [{
    key: 'reset',


    /**
     * Reset the slider to its default value.
     */
    value: function reset() {
      this._updateValue(this.params.default);
    }

    /**
     * Resize the slider.
     *
     * @param {Number} width - New width of the slider.
     * @param {Number} height - New height of the slider.
     */

  }, {
    key: 'resize',
    value: function resize(width, height) {
      this.params.width = width;
      this.params.height = height;

      this._resizeElement();
      this._setScales();
      this._onResize();
      this._updateValue(this._value, true, true);
    }
  }, {
    key: '_updateValue',
    value: function _updateValue(value) {
      var _this = this;

      var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var forceRender = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var callback = this.params.callback;

      var clippedValue = this.clipper(value);

      // resize render but don't trigger callback
      if (clippedValue === this._value && forceRender === true) requestAnimationFrame(function () {
        return _this._render(clippedValue);
      });

      // trigger callback
      if (clippedValue !== this._value) {
        this._value = clippedValue;

        if (!silent) callback(clippedValue);

        requestAnimationFrame(function () {
          return _this._render(clippedValue);
        });
      }
    }
  }, {
    key: '_createElement',
    value: function _createElement() {
      var container = this.params.container;

      this.$canvas = document.createElement('canvas');
      this.ctx = this.$canvas.getContext('2d');

      if (container instanceof Element) this.$container = container;else this.$container = document.querySelector(container);

      this.$container.appendChild(this.$canvas);
    }
  }, {
    key: '_resizeElement',
    value: function _resizeElement() {
      var _params = this.params,
          width = _params.width,
          height = _params.height;

      // logical and pixel size of the canvas

      this._pixelRatio = function (ctx) {
        var dPR = window.devicePixelRatio || 1;
        var bPR = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

        return dPR / bPR;
      }(this.ctx);

      this._canvasWidth = width * this._pixelRatio;
      this._canvasHeight = height * this._pixelRatio;

      this.ctx.canvas.width = this._canvasWidth;
      this.ctx.canvas.height = this._canvasHeight;
      this.ctx.canvas.style.width = width + 'px';
      this.ctx.canvas.style.height = height + 'px';
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      this._boundingClientRect = this.$canvas.getBoundingClientRect();
    }
  }, {
    key: '_setScales',
    value: function _setScales() {
      var _params2 = this.params,
          orientation = _params2.orientation,
          width = _params2.width,
          height = _params2.height,
          min = _params2.min,
          max = _params2.max,
          step = _params2.step;
      // define transfert functions

      var screenSize = orientation === 'horizontal' ? width : height;

      var canvasSize = orientation === 'horizontal' ? this._canvasWidth : this._canvasHeight;

      var domain = orientation === 'horizontal' ? [min, max] : [max, min];
      var screenRange = [0, screenSize];
      var canvasRange = [0, canvasSize];

      this.screenScale = getScale(domain, screenRange);
      this.canvasScale = getScale(domain, canvasRange);
      this.clipper = getClipper(min, max, step);
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      this.$canvas.addEventListener('mousedown', this._onMouseDown);
      this.$canvas.addEventListener('touchstart', this._onTouchStart);
    }
  }, {
    key: '_onStart',
    value: function _onStart(x, y) {
      var started = null;

      switch (this.params.mode) {
        case 'jump':
          this._updatePosition(x, y);
          started = true;
          break;
        case 'proportionnal':
          this._currentMousePosition.x = x;
          this._currentMousePosition.y = y;
          started = true;
          break;
        case 'handle':
          var orientation = this.params.orientation;
          var position = this.screenScale(this._value);
          var compare = orientation === 'horizontal' ? x : y;
          var delta = this.params.handleSize / 2;

          if (compare < position + delta && compare > position - delta) {
            this._currentMousePosition.x = x;
            this._currentMousePosition.y = y;
            started = true;
          } else {
            started = false;
          }
          break;
      }

      return started;
    }
  }, {
    key: '_onMove',
    value: function _onMove(x, y) {
      switch (this.params.mode) {
        case 'jump':
          break;
        case 'proportionnal':
        case 'handle':
          var deltaX = x - this._currentMousePosition.x;
          var deltaY = y - this._currentMousePosition.y;
          this._currentMousePosition.x = x;
          this._currentMousePosition.y = y;

          x = this.screenScale(this._value) + deltaX;
          y = this.screenScale(this._value) + deltaY;
          break;
      }

      this._updatePosition(x, y);
    }
  }, {
    key: '_onEnd',
    value: function _onEnd() {
      switch (this.params.mode) {
        case 'jump':
          break;
        case 'proportionnal':
        case 'handle':
          this._currentMousePosition.x = null;
          this._currentMousePosition.y = null;
          break;
      }
    }

    // mouse events

  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(e) {
      var pageX = e.pageX;
      var pageY = e.pageY;
      var x = pageX - this._boundingClientRect.left;
      var y = pageY - this._boundingClientRect.top;

      if (this._onStart(x, y) === true) {
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(e) {
      e.preventDefault(); // prevent text selection

      var pageX = e.pageX;
      var pageY = e.pageY;
      var x = pageX - this._boundingClientRect.left;;
      var y = pageY - this._boundingClientRect.top;;

      this._onMove(x, y);
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp(e) {
      this._onEnd();

      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseup', this._onMouseUp);
    }

    // touch events

  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(e) {
      if (this._touchId !== null) return;

      var touch = e.touches[0];
      this._touchId = touch.identifier;

      var pageX = touch.pageX;
      var pageY = touch.pageY;
      var x = pageX - this._boundingClientRect.left;
      var y = pageY - this._boundingClientRect.top;

      if (this._onStart(x, y) === true) {
        window.addEventListener('touchmove', this._onTouchMove);
        window.addEventListener('touchend', this._onTouchEnd);
        window.addEventListener('touchcancel', this._onTouchEnd);
      }
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(e) {
      var _this2 = this;

      e.preventDefault(); // prevent text selection

      var touches = Array.from(e.touches);
      var touch = touches.filter(function (t) {
        return t.identifier === _this2._touchId;
      })[0];

      if (touch) {
        var pageX = touch.pageX;
        var pageY = touch.pageY;
        var x = pageX - this._boundingClientRect.left;
        var y = pageY - this._boundingClientRect.top;

        this._onMove(x, y);
      }
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(e) {
      var _this3 = this;

      var touches = Array.from(e.touches);
      var touch = touches.filter(function (t) {
        return t.identifier === _this3._touchId;
      })[0];

      if (touch === undefined) {
        this._onEnd();
        this._touchId = null;

        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('touchend', this._onTouchEnd);
        window.removeEventListener('touchcancel', this._onTouchEnd);
      }
    }
  }, {
    key: '_updatePosition',
    value: function _updatePosition(x, y) {
      var _params3 = this.params,
          orientation = _params3.orientation,
          height = _params3.height;

      var position = orientation === 'horizontal' ? x : y;
      var value = this.screenScale.invert(position);

      this._updateValue(value, false, true);
    }
  }, {
    key: '_render',
    value: function _render(clippedValue) {
      var _params4 = this.params,
          backgroundColor = _params4.backgroundColor,
          foregroundColor = _params4.foregroundColor,
          orientation = _params4.orientation;

      var canvasPosition = Math.round(this.canvasScale(clippedValue));
      var width = this._canvasWidth;
      var height = this._canvasHeight;
      var ctx = this.ctx;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // foreground
      ctx.fillStyle = foregroundColor;

      if (orientation === 'horizontal') ctx.fillRect(0, 0, canvasPosition, height);else ctx.fillRect(0, canvasPosition, width, height);

      // markers
      var markers = this.params.markers;

      for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        var position = this.canvasScale(marker);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();

        if (orientation === 'horizontal') {
          ctx.moveTo(position - 0.5, 1);
          ctx.lineTo(position - 0.5, height - 1);
        } else {
          ctx.moveTo(1, height - position + 0.5);
          ctx.lineTo(width - 1, height - position + 0.5);
        }

        ctx.closePath();
        ctx.stroke();
      }

      // handle mode
      if (this.params.mode === 'handle' && this.params.showHandle) {
        var delta = this.params.handleSize * this._pixelRatio / 2;
        var start = canvasPosition - delta;
        var end = canvasPosition + delta;

        ctx.globalAlpha = 1;
        ctx.fillStyle = this.params.handleColor;

        if (orientation === 'horizontal') {
          ctx.fillRect(start, 0, end - start, height);
        } else {
          ctx.fillRect(0, start, width, end - start);
        }
      }

      ctx.restore();
    }
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    },
    set: function set(val) {
      // don't trigger the callback when value is set from outside
      this._updateValue(val, true, false);
    }
  }]);

  return Slider;
}();

exports.default = Slider;

},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Slider = require('./Slider');

Object.defineProperty(exports, 'Slider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Slider).default;
  }
});

var _Breakpoint = require('./Breakpoint');

Object.defineProperty(exports, 'Breakpoint', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Breakpoint).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./Breakpoint":31,"./Slider":32}],34:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],35:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":47}],36:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":48}],37:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":49}],38:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":50}],39:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":51}],40:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":52}],41:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":53}],42:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],43:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"../core-js/object/define-property":37}],44:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":36,"../core-js/object/set-prototype-of":39,"../helpers/typeof":46}],45:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":46}],46:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("../core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":40,"../core-js/symbol/iterator":41}],47:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
require('../modules/es7.map.of');
require('../modules/es7.map.from');
module.exports = require('../modules/_core').Map;

},{"../modules/_core":68,"../modules/es6.map":130,"../modules/es6.object.to-string":135,"../modules/es6.string.iterator":136,"../modules/es7.map.from":138,"../modules/es7.map.of":139,"../modules/es7.map.to-json":140,"../modules/web.dom.iterable":143}],48:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":68,"../../modules/es6.object.create":131}],49:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":68,"../../modules/es6.object.define-property":132}],50:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":68,"../../modules/es6.object.get-prototype-of":133}],51:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":68,"../../modules/es6.object.set-prototype-of":134}],52:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":68,"../../modules/es6.object.to-string":135,"../../modules/es6.symbol":137,"../../modules/es7.symbol.async-iterator":141,"../../modules/es7.symbol.observable":142}],53:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":126,"../../modules/es6.string.iterator":136,"../../modules/web.dom.iterable":143}],54:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],55:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],56:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],57:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":86}],58:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":77}],59:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":117,"./_to-iobject":119,"./_to-length":120}],60:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":62,"./_ctx":69,"./_iobject":83,"./_to-length":120,"./_to-object":121}],61:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":85,"./_is-object":86,"./_wks":127}],62:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":61}],63:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":64,"./_wks":127}],64:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],65:[function(require,module,exports){
'use strict';
var dP = require('./_object-dp').f;
var create = require('./_object-create');
var redefineAll = require('./_redefine-all');
var ctx = require('./_ctx');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var $iterDefine = require('./_iter-define');
var step = require('./_iter-step');
var setSpecies = require('./_set-species');
var DESCRIPTORS = require('./_descriptors');
var fastKey = require('./_meta').fastKey;
var validate = require('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

},{"./_an-instance":56,"./_ctx":69,"./_descriptors":71,"./_for-of":77,"./_iter-define":89,"./_iter-step":90,"./_meta":93,"./_object-create":94,"./_object-dp":95,"./_redefine-all":107,"./_set-species":112,"./_validate-collection":124}],66:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof');
var from = require('./_array-from-iterable');
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};

},{"./_array-from-iterable":58,"./_classof":63}],67:[function(require,module,exports){
'use strict';
var global = require('./_global');
var $export = require('./_export');
var meta = require('./_meta');
var fails = require('./_fails');
var hide = require('./_hide');
var redefineAll = require('./_redefine-all');
var forOf = require('./_for-of');
var anInstance = require('./_an-instance');
var isObject = require('./_is-object');
var setToStringTag = require('./_set-to-string-tag');
var dP = require('./_object-dp').f;
var each = require('./_array-methods')(0);
var DESCRIPTORS = require('./_descriptors');

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function (target, iterable) {
      anInstance(target, C, NAME, '_c');
      target._c = new Base();
      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
        anInstance(this, C, KEY);
        if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    IS_WEAK || dP(C.prototype, 'size', {
      get: function () {
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

},{"./_an-instance":56,"./_array-methods":60,"./_descriptors":71,"./_export":75,"./_fails":76,"./_for-of":77,"./_global":78,"./_hide":80,"./_is-object":86,"./_meta":93,"./_object-dp":95,"./_redefine-all":107,"./_set-to-string-tag":113}],68:[function(require,module,exports){
var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],69:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":54}],70:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],71:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":76}],72:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":78,"./_is-object":86}],73:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],74:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":100,"./_object-keys":103,"./_object-pie":104}],75:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var IS_WRAP = type & $export.W;
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE];
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
  var key, own, out;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if (own && has(exports, key)) continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function (C) {
      var F = function (a, b, c) {
        if (this instanceof C) {
          switch (arguments.length) {
            case 0: return new C();
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if (IS_PROTO) {
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":68,"./_ctx":69,"./_global":78,"./_has":79,"./_hide":80}],76:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],77:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":57,"./_ctx":69,"./_is-array-iter":84,"./_iter-call":87,"./_to-length":120,"./core.get-iterator-method":128}],78:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],79:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],80:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":71,"./_object-dp":95,"./_property-desc":106}],81:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":78}],82:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":71,"./_dom-create":72,"./_fails":76}],83:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":64}],84:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":91,"./_wks":127}],85:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":64}],86:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],87:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":57}],88:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":80,"./_object-create":94,"./_property-desc":106,"./_set-to-string-tag":113,"./_wks":127}],89:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":75,"./_hide":80,"./_iter-create":88,"./_iterators":91,"./_library":92,"./_object-gpo":101,"./_redefine":108,"./_set-to-string-tag":113,"./_wks":127}],90:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],91:[function(require,module,exports){
module.exports = {};

},{}],92:[function(require,module,exports){
module.exports = true;

},{}],93:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":76,"./_has":79,"./_is-object":86,"./_object-dp":95,"./_uid":123}],94:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":57,"./_dom-create":72,"./_enum-bug-keys":73,"./_html":81,"./_object-dps":96,"./_shared-key":114}],95:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":57,"./_descriptors":71,"./_ie8-dom-define":82,"./_to-primitive":122}],96:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":57,"./_descriptors":71,"./_object-dp":95,"./_object-keys":103}],97:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":71,"./_has":79,"./_ie8-dom-define":82,"./_object-pie":104,"./_property-desc":106,"./_to-iobject":119,"./_to-primitive":122}],98:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":99,"./_to-iobject":119}],99:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":73,"./_object-keys-internal":102}],100:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],101:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":79,"./_shared-key":114,"./_to-object":121}],102:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":59,"./_has":79,"./_shared-key":114,"./_to-iobject":119}],103:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":73,"./_object-keys-internal":102}],104:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],105:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":68,"./_export":75,"./_fails":76}],106:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],107:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":80}],108:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":80}],109:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');
var aFunction = require('./_a-function');
var ctx = require('./_ctx');
var forOf = require('./_for-of');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { from: function from(source /* , mapFn, thisArg */) {
    var mapFn = arguments[1];
    var mapping, A, n, cb;
    aFunction(this);
    mapping = mapFn !== undefined;
    if (mapping) aFunction(mapFn);
    if (source == undefined) return new this();
    A = [];
    if (mapping) {
      n = 0;
      cb = ctx(mapFn, arguments[2], 2);
      forOf(source, false, function (nextItem) {
        A.push(cb(nextItem, n++));
      });
    } else {
      forOf(source, false, A.push, A);
    }
    return new this(A);
  } });
};

},{"./_a-function":54,"./_ctx":69,"./_export":75,"./_for-of":77}],110:[function(require,module,exports){
'use strict';
// https://tc39.github.io/proposal-setmap-offrom/
var $export = require('./_export');

module.exports = function (COLLECTION) {
  $export($export.S, COLLECTION, { of: function of() {
    var length = arguments.length;
    var A = new Array(length);
    while (length--) A[length] = arguments[length];
    return new this(A);
  } });
};

},{"./_export":75}],111:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":57,"./_ctx":69,"./_is-object":86,"./_object-gopd":97}],112:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_core":68,"./_descriptors":71,"./_global":78,"./_object-dp":95,"./_wks":127}],113:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":79,"./_object-dp":95,"./_wks":127}],114:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":115,"./_uid":123}],115:[function(require,module,exports){
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: require('./_library') ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});

},{"./_core":68,"./_global":78,"./_library":92}],116:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":70,"./_to-integer":118}],117:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":118}],118:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],119:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":70,"./_iobject":83}],120:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":118}],121:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":70}],122:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":86}],123:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],124:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":86}],125:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":68,"./_global":78,"./_library":92,"./_object-dp":95,"./_wks-ext":126}],126:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":127}],127:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":78,"./_shared":115,"./_uid":123}],128:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":63,"./_core":68,"./_iterators":91,"./_wks":127}],129:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":55,"./_iter-define":89,"./_iter-step":90,"./_iterators":91,"./_to-iobject":119}],130:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var MAP = 'Map';

// 23.1 Map Objects
module.exports = require('./_collection')(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);

},{"./_collection":67,"./_collection-strong":65,"./_validate-collection":124}],131:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":75,"./_object-create":94}],132:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":71,"./_export":75,"./_object-dp":95}],133:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":101,"./_object-sap":105,"./_to-object":121}],134:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":75,"./_set-proto":111}],135:[function(require,module,exports){

},{}],136:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

},{"./_iter-define":89,"./_string-at":116}],137:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    if (!isArray(replacer)) replacer = function (key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":57,"./_descriptors":71,"./_enum-keys":74,"./_export":75,"./_fails":76,"./_global":78,"./_has":79,"./_hide":80,"./_is-array":85,"./_is-object":86,"./_library":92,"./_meta":93,"./_object-create":94,"./_object-dp":95,"./_object-gopd":97,"./_object-gopn":99,"./_object-gopn-ext":98,"./_object-gops":100,"./_object-keys":103,"./_object-pie":104,"./_property-desc":106,"./_redefine":108,"./_set-to-string-tag":113,"./_shared":115,"./_to-iobject":119,"./_to-primitive":122,"./_uid":123,"./_wks":127,"./_wks-define":125,"./_wks-ext":126}],138:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
require('./_set-collection-from')('Map');

},{"./_set-collection-from":109}],139:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
require('./_set-collection-of')('Map');

},{"./_set-collection-of":110}],140:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });

},{"./_collection-to-json":66,"./_export":75}],141:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":125}],142:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":125}],143:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');

var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
  'TextTrackList,TouchList').split(',');

for (var i = 0; i < DOMIterables.length; i++) {
  var NAME = DOMIterables[i];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}

},{"./_global":78,"./_hide":80,"./_iterators":91,"./_wks":127,"./es6.array.iterator":129}],144:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// works by reference
function swap(arr, i1, i2) {
  var tmp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = tmp;
}

// https://jsperf.com/js-for-loop-vs-array-indexof/346
function indexOf(arr, el) {
  var l = arr.length;
  // ignore first element as it can't be a entry
  for (var i = 1; i < l; i++) {
    if (arr[i] === el) {
      return i;
    }
  }

  return -1;
}

/**
 * Define if `time1` should be lower in the topography than `time2`.
 * Is dynamically affected to the priority queue according to handle `min` and `max` heap.
 *
 * @private
 * @param {Number} time1
 * @param {Number} time2
 * @return {Boolean}
 */
var _isLowerMaxHeap = function _isLowerMaxHeap(time1, time2) {
  return time1 < time2;
};

var _isLowerMinHeap = function _isLowerMinHeap(time1, time2) {
  return time1 > time2;
};

/**
 * Define if `time1` should be higher in the topography than `time2`.
 * Is dynamically affected to the priority queue according to handle `min` and `max` heap.
 *
 * @private
 * @param {Number} time1
 * @param {Number} time2
 * @return {Boolean}
 */
var _isHigherMaxHeap = function _isHigherMaxHeap(time1, time2) {
  return time1 > time2;
};

var _isHigherMinHeap = function _isHigherMinHeap(time1, time2) {
  return time1 < time2;
};

var POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

/**
 * Priority queue implementing a binary heap.
 * Acts as a min heap by default, can be dynamically changed to a max heap
 * by setting `reverse` to true.
 *
 * _note_: the queue creates and maintains a new property (i.e. `queueTime`)
 * to each object added.
 *
 * @param {Number} [heapLength=100] - Default size of the array used to create the heap.
 */

var PriorityQueue = function () {
  function PriorityQueue() {
    var heapLength = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
    (0, _classCallCheck3.default)(this, PriorityQueue);

    /**
     * Pointer to the first empty index of the heap.
     * @type {Number}
     * @memberof PriorityQueue
     * @name _currentLength
     * @private
     */
    this._currentLength = 1;

    /**
     * Array of the sorted indexes of the entries, the actual heap. Ignore the index 0.
     * @type {Array}
     * @memberof PriorityQueue
     * @name _heap
     * @private
     */
    this._heap = new Array(heapLength + 1);

    /**
     * Type of the queue: `min` heap if `false`, `max` heap if `true`
     * @type {Boolean}
     * @memberof PriorityQueue
     * @name _reverse
     * @private
     */
    this._reverse = null;

    // initialize compare functions
    this.reverse = false;
  }

  /**
   * Time of the first element in the binary heap.
   * @returns {Number}
   */


  (0, _createClass3.default)(PriorityQueue, [{
    key: "_bubbleUp",


    /**
     * Fix the heap by moving an entry to a new upper position.
     *
     * @private
     * @param {Number} startIndex - The index of the entry to move.
     */
    value: function _bubbleUp(startIndex) {
      var entry = this._heap[startIndex];

      var index = startIndex;
      var parentIndex = Math.floor(index / 2);
      var parent = this._heap[parentIndex];

      while (parent && this._isHigher(entry.queueTime, parent.queueTime)) {
        swap(this._heap, index, parentIndex);

        index = parentIndex;
        parentIndex = Math.floor(index / 2);
        parent = this._heap[parentIndex];
      }
    }

    /**
     * Fix the heap by moving an entry to a new lower position.
     *
     * @private
     * @param {Number} startIndex - The index of the entry to move.
     */

  }, {
    key: "_bubbleDown",
    value: function _bubbleDown(startIndex) {
      var entry = this._heap[startIndex];

      var index = startIndex;
      var c1index = index * 2;
      var c2index = c1index + 1;
      var child1 = this._heap[c1index];
      var child2 = this._heap[c2index];

      while (child1 && this._isLower(entry.queueTime, child1.queueTime) || child2 && this._isLower(entry.queueTime, child2.queueTime)) {
        // swap with the minimum child
        var targetIndex = void 0;

        if (child2) targetIndex = this._isHigher(child1.queueTime, child2.queueTime) ? c1index : c2index;else targetIndex = c1index;

        swap(this._heap, index, targetIndex);

        // update to find next children
        index = targetIndex;
        c1index = index * 2;
        c2index = c1index + 1;
        child1 = this._heap[c1index];
        child2 = this._heap[c2index];
      }
    }

    /**
     * Build the heap (from bottom up).
     */

  }, {
    key: "buildHeap",
    value: function buildHeap() {
      // find the index of the last internal node
      // @todo - make sure that's the right way to do.
      var maxIndex = Math.floor((this._currentLength - 1) / 2);

      for (var i = maxIndex; i > 0; i--) {
        this._bubbleDown(i);
      }
    }

    /**
     * Insert a new object in the binary heap and sort it.
     *
     * @param {Object} entry - Entry to insert.
     * @param {Number} time - Time at which the entry should be orderer.
     * @returns {Number} - Time of the first entry in the heap.
     */

  }, {
    key: "insert",
    value: function insert(entry, time) {
      if (Math.abs(time) !== POSITIVE_INFINITY) {
        entry.queueTime = time;
        // add the new entry at the end of the heap
        this._heap[this._currentLength] = entry;
        // bubble it up
        this._bubbleUp(this._currentLength);
        this._currentLength += 1;

        return this.time;
      }

      entry.queueTime = undefined;
      return this.remove(entry);
    }

    /**
     * Move a given entry to a new position.
     *
     * @param {Object} entry - Entry to move.
     * @param {Number} time - Time at which the entry should be orderer.
     * @return {Number} - Time of first entry in the heap.
     */

  }, {
    key: "move",
    value: function move(entry, time) {
      if (Math.abs(time) !== POSITIVE_INFINITY) {
        var index = indexOf(this._heap, entry);

        if (index !== -1) {
          entry.queueTime = time;
          // define if the entry should be bubbled up or down
          var parent = this._heap[Math.floor(index / 2)];

          if (parent && this._isHigher(time, parent.queueTime)) this._bubbleUp(index);else this._bubbleDown(index);
        }

        return this.time;
      }

      entry.queueTime = undefined;
      return this.remove(entry);
    }

    /**
     * Remove an entry from the heap and fix the heap.
     *
     * @param {Object} entry - Entry to remove.
     * @return {Number} - Time of first entry in the heap.
     */

  }, {
    key: "remove",
    value: function remove(entry) {
      // find the index of the entry
      var index = indexOf(this._heap, entry);

      if (index !== -1) {
        var lastIndex = this._currentLength - 1;

        // if the entry is the last one
        if (index === lastIndex) {
          // remove the element from heap
          this._heap[lastIndex] = undefined;
          // update current length
          this._currentLength = lastIndex;

          return this.time;
        } else {
          // swap with the last element of the heap
          swap(this._heap, index, lastIndex);
          // remove the element from heap
          this._heap[lastIndex] = undefined;

          if (index === 1) {
            this._bubbleDown(1);
          } else {
            // bubble the (ex last) element up or down according to its new context
            var _entry = this._heap[index];
            var parent = this._heap[Math.floor(index / 2)];

            if (parent && this._isHigher(_entry.queueTime, parent.queueTime)) this._bubbleUp(index);else this._bubbleDown(index);
          }
        }

        // update current length
        this._currentLength = lastIndex;
      }

      return this.time;
    }

    /**
     * Clear the queue.
     */

  }, {
    key: "clear",
    value: function clear() {
      this._currentLength = 1;
      this._heap = new Array(this._heap.length);
    }

    /**
     * Defines if the queue contains the given `entry`.
     *
     * @param {Object} entry - Entry to be checked
     * @return {Boolean}
     */

  }, {
    key: "has",
    value: function has(entry) {
      return this._heap.indexOf(entry) !== -1;
    }
  }, {
    key: "time",
    get: function get() {
      if (this._currentLength > 1) return this._heap[1].queueTime;

      return Infinity;
    }

    /**
     * First element in the binary heap.
     * @returns {Number}
     * @readonly
     */

  }, {
    key: "head",
    get: function get() {
      return this._heap[1];
    }

    /**
     * Change the order of the queue (max heap if true, min heap if false),
     * rebuild the heap with the existing entries.
     *
     * @type {Boolean}
     */

  }, {
    key: "reverse",
    set: function set(value) {
      if (value !== this._reverse) {
        this._reverse = value;

        if (this._reverse === true) {
          this._isLower = _isLowerMaxHeap;
          this._isHigher = _isHigherMaxHeap;
        } else {
          this._isLower = _isLowerMinHeap;
          this._isHigher = _isHigherMinHeap;
        }

        this.buildHeap();
      }
    },
    get: function get() {
      return this._reverse;
    }
  }]);
  return PriorityQueue;
}();

exports.default = PriorityQueue;

},{"babel-runtime/helpers/classCallCheck":161,"babel-runtime/helpers/createClass":162}],145:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

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

var _PriorityQueue = require('./PriorityQueue');

var _PriorityQueue2 = _interopRequireDefault(_PriorityQueue);

var _TimeEngine2 = require('./TimeEngine');

var _TimeEngine3 = _interopRequireDefault(_TimeEngine2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class SchedulingQueue
 * @extends TimeEngine
 */
/**
 * SchedulingQueue base class
 * http://wavesjs.github.io/audio/#audio-scheduling-queue
 *
 * Norbert.Schnell@ircam.fr
 * Copyright 2014, 2015 IRCAM – Centre Pompidou
 */

var SchedulingQueue = function (_TimeEngine) {
  (0, _inherits3.default)(SchedulingQueue, _TimeEngine);

  function SchedulingQueue() {
    (0, _classCallCheck3.default)(this, SchedulingQueue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(SchedulingQueue)).call(this));

    _this.__queue = new _PriorityQueue2.default();
    _this.__engines = new _set2.default();
    return _this;
  }

  // TimeEngine 'scheduled' interface


  (0, _createClass3.default)(SchedulingQueue, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var engine = this.__queue.head;
      var nextEngineTime = engine.advanceTime(time);

      if (!nextEngineTime) {
        engine.master = null;
        this.__engines.delete(engine);
        this.__queue.remove(engine);
      } else {
        this.__queue.move(engine, nextEngineTime);
      }

      return this.__queue.time;
    }

    // TimeEngine master method to be implemented by derived class

  }, {
    key: 'defer',


    // call a function at a given time
    value: function defer(fun) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime(time) {
          fun(time);
        } // make sure that the advanceTime method does not returm anything
      }, time);
    }

    // add a time engine to the scheduler

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!_TimeEngine3.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      engine.master = this;

      // add to engines and queue
      this.__engines.add(engine);
      var nextTime = this.__queue.insert(engine, time);

      // reschedule queue
      this.resetTime(nextTime);
    }

    // remove a time engine from the queue

  }, {
    key: 'remove',
    value: function remove(engine) {
      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      engine.master = null;

      // remove from array and queue
      this.__engines.delete(engine);
      var nextTime = this.__queue.remove(engine);

      // reschedule queue
      this.resetTime(nextTime);
    }

    // reset next engine time

  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      var nextTime = void 0;

      if (this.__queue.has(engine)) nextTime = this.__queue.move(engine, time);else nextTime = this.__queue.insert(engine, time);

      this.resetTime(nextTime);
    }

    // check whether a given engine is scheduled

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }

    // clear queue

  }, {
    key: 'clear',
    value: function clear() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.__engines), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var engine = _step.value;

          engine.master = null;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this.__queue.clear();
      this.__engines.clear();
      this.resetTime(Infinity);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return 0;
    }
  }]);
  return SchedulingQueue;
}(_TimeEngine3.default);

exports.default = SchedulingQueue;

},{"./PriorityQueue":144,"./TimeEngine":146,"babel-runtime/core-js/get-iterator":152,"babel-runtime/core-js/object/get-prototype-of":156,"babel-runtime/core-js/set":158,"babel-runtime/helpers/classCallCheck":161,"babel-runtime/helpers/createClass":162,"babel-runtime/helpers/inherits":164,"babel-runtime/helpers/possibleConstructorReturn":165}],146:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base class for time engines
 *
 * A time engine generates more or less regular events and/or plays back a
 * media stream. It implements one or multiple interfaces to be driven by a
 * master (i.e. a Scheduler, a Transport or a PlayControl) in synchronization
 * with other engines. The provided interfaces are scheduled, transported,
 * and play-controlled.
 *
 *
 * #### The `scheduled` interface
 *
 * The scheduled interface allows for synchronizing an engine to a monotonous time
 * as it is provided by the Scheduler master.
 *
 * ###### `advanceTime(time :Number) -> {Number}`
 *
 * The `advanceTime` method has to be implemented by an `TimeEngine` as part of the
 * scheduled interface. The method is called by the master (e.g. the scheduler).
 * It generates an event and to returns the time of the next event (i.e. the next
 * call of advanceTime). The returned time has to be greater than the time
 * received as argument of the method. In case that a TimeEngine has to generate
 * multiple events at the same time, the engine has to implement its own loop
 * while(event.time <= time) and return the time of the next event (if any).
 *
 * ###### `resetTime(time=undefined :Number)`
 *
 * The `resetTime` method is provided by the `TimeEngine` base class. An engine may
 * call this method to reset its next event time (e.g. when a parameter is
 * changed that influences the engine's temporal behavior). When no argument
 * is given, the time is reset to the current master time. When calling the
 * method with Infinity the engine is suspended without being removed from the
 * master.
 *
 *
 * #### The `transported` interface
 *
 * The transported interface allows for synchronizing an engine to a position
 * (i.e. media playback time) that can run forward and backward and jump as it
 * is provided by the Transport master.
 *
 * ###### `syncPosition(time :Number, position :Number, speed :Number) -> {Number}`
 *
 * The `syncPositon` method has to be implemented by a `TimeEngine` as part of the
 * transported interface. The method syncPositon is called whenever the master
 * of a transported engine has to (re-)synchronize the engine's position. This
 * is for example required when the master (re-)starts playback, jumps to an
 * arbitrary position, and when reversing playback direction. The method returns
 * the next position of the engine in the given playback direction
 * (i.e. `speed < 0` or `speed > 0`).
 *
 * ###### `advancePosition(time :Number, position :Number, speed :Number) -> {Number}`
 *
 * The `advancePosition` method has to be implemented by a `TimeEngine` as part
 * of the transported interface. The master calls the advancePositon method when
 * the engine's event position is reached. The method generates an event and
 * returns the next position in the given playback direction (i.e. speed < 0 or
 * speed > 0). The returned position has to be greater (i.e. when speed > 0)
 * or less (i.e. when speed < 0) than the position received as argument of the
 * method.
 *
 * ###### `resetPosition(position=undefined :Number)`
 *
 * The resetPosition method is provided by the TimeEngine base class. An engine
 * may call this method to reset its next event position. When no argument
 * is given, the time is reset to the current master time. When calling the
 * method with Infinity the engine is suspended without being removed from
 * the master.
 *
 *
 * #### The speed-controlled interface
 *
 * The "speed-controlled" interface allows for syncronizing an engine that is
 * neither driven through the scheduled nor the transported interface. The
 * interface allows in particular to synchronize engines that assure their own
 * scheduling (i.e. audio player or an oscillator) to the event-based scheduled
 * and transported engines.
 *
 * ###### `syncSpeed(time :Number, position :Number, speed :Number, seek=false :Boolean)`
 *
 * The syncSpeed method has to be implemented by a TimeEngine as part of the
 * speed-controlled interface. The method is called by the master whenever the
 * playback speed changes or the position jumps arbitarily (i.e. on a seek).
 *
 *
 * <hr />
 *
 * Example that shows a `TimeEngine` running in a `Scheduler` that counts up
 * at a given frequency:
 * {@link https://rawgit.com/wavesjs/waves-audio/master/examples/time-engine.html}
 *
 * @example
 * import * as audio from 'waves-audio';
 *
 * class MyEngine extends audio.TimeEngine {
 *   constructor() {
 *     super();
 *     // ...
 *   }
 * }
 *
 */
var TimeEngine = function () {
  function TimeEngine() {
    (0, _classCallCheck3.default)(this, TimeEngine);

    /**
     * The engine's master.
     *
     * @type {Mixed}
     * @name master
     * @memberof TimeEngine
     */
    this.master = null;
  }

  /**
   * The time engine's current (master) time.
   *
   * @type {Number}
   * @memberof TimeEngine
   * @readonly
   */


  (0, _createClass3.default)(TimeEngine, [{
    key: "resetTime",
    value: function resetTime() {
      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (this.master) this.master.resetEngineTime(this, time);
    }

    /**
     * Transported interface
     *   - syncPosition(time, position, speed), called to reposition TimeEngine, returns next position
     *   - advancePosition(time, position, speed), called to generate next event at given time and position, returns next position
     *
     * @static
     * @memberof TimeEngine
     */

  }, {
    key: "resetPosition",
    value: function resetPosition() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

      if (this.master) this.master.resetEnginePosition(this, position);
    }

    /**
     * Speed-controlled interface
     *   - syncSpeed(time, position, speed, ), called to
     *
     * @static
     * @memberof TimeEngine
     */

  }, {
    key: "currentTime",
    get: function get() {
      if (this.master) return this.master.currentTime;

      return undefined;
    }

    /**
     * The time engine's current (master) position.
     *
     * @type {Number}
     * @memberof TimeEngine
     * @readonly
     */

  }, {
    key: "currentPosition",
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }

    /**
     * Scheduled interface
     *   - advanceTime(time), called to generate next event at given time, returns next time
     *
     * @static
     * @memberof TimeEngine
     */

  }], [{
    key: "implementsScheduled",
    value: function implementsScheduled(engine) {
      return engine.advanceTime && engine.advanceTime instanceof Function;
    }
  }, {
    key: "implementsTransported",
    value: function implementsTransported(engine) {
      return engine.syncPosition && engine.syncPosition instanceof Function && engine.advancePosition && engine.advancePosition instanceof Function;
    }
  }, {
    key: "implementsSpeedControlled",
    value: function implementsSpeedControlled(engine) {
      return engine.syncSpeed && engine.syncSpeed instanceof Function;
    }
  }]);
  return TimeEngine;
}();

exports.default = TimeEngine;

},{"babel-runtime/helpers/classCallCheck":161,"babel-runtime/helpers/createClass":162}],147:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _TimeEngine = require('./core/TimeEngine');

Object.defineProperty(exports, 'TimeEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_TimeEngine).default;
  }
});

var _PriorityQueue = require('./core/PriorityQueue');

Object.defineProperty(exports, 'PriorityQueue', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_PriorityQueue).default;
  }
});

var _SchedulingQueue = require('./core/SchedulingQueue');

Object.defineProperty(exports, 'SchedulingQueue', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SchedulingQueue).default;
  }
});

var _PlayControl = require('./masters/PlayControl');

Object.defineProperty(exports, 'PlayControl', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_PlayControl).default;
  }
});

var _Transport = require('./masters/Transport');

Object.defineProperty(exports, 'Transport', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Transport).default;
  }
});

var _Scheduler = require('./masters/Scheduler');

Object.defineProperty(exports, 'Scheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Scheduler).default;
  }
});

var _SimpleScheduler = require('./masters/SimpleScheduler');

Object.defineProperty(exports, 'SimpleScheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_SimpleScheduler).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./core/PriorityQueue":144,"./core/SchedulingQueue":145,"./core/TimeEngine":146,"./masters/PlayControl":148,"./masters/Scheduler":149,"./masters/SimpleScheduler":150,"./masters/Transport":151}],148:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

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

var _SchedulingQueue2 = require('../core/SchedulingQueue');

var _SchedulingQueue3 = _interopRequireDefault(_SchedulingQueue2);

var _TimeEngine4 = require('../core/TimeEngine');

var _TimeEngine5 = _interopRequireDefault(_TimeEngine4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EPSILON = 1e-8;

var LoopControl = function (_TimeEngine) {
  (0, _inherits3.default)(LoopControl, _TimeEngine);

  function LoopControl(playControl) {
    (0, _classCallCheck3.default)(this, LoopControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LoopControl.__proto__ || (0, _getPrototypeOf2.default)(LoopControl)).call(this));

    _this.__playControl = playControl;
    _this.speed = 1;
    _this.lower = -Infinity;
    _this.upper = Infinity;
    return _this;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(LoopControl, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var playControl = this.__playControl;
      var speed = this.speed;
      var lower = this.lower;
      var upper = this.upper;

      if (speed > 0) time += EPSILON;else time -= EPSILON;

      if (speed > 0) {
        playControl.syncSpeed(time, lower, speed, true);
        return playControl.__getTimeAtPosition(upper) - EPSILON;
      } else if (speed < 0) {
        playControl.syncSpeed(time, upper, speed, true);
        return playControl.__getTimeAtPosition(lower) + EPSILON;
      }

      return Infinity;
    }
  }, {
    key: 'reschedule',
    value: function reschedule(speed) {
      var playControl = this.__playControl;
      var lower = Math.min(playControl.__loopStart, playControl.__loopEnd);
      var upper = Math.max(playControl.__loopStart, playControl.__loopEnd);

      this.speed = speed;
      this.lower = lower;
      this.upper = upper;

      if (lower === upper) speed = 0;

      if (speed > 0) this.resetTime(playControl.__getTimeAtPosition(upper) - EPSILON);else if (speed < 0) this.resetTime(playControl.__getTimeAtPosition(lower) + EPSILON);else this.resetTime(Infinity);
    }
  }, {
    key: 'applyLoopBoundaries',
    value: function applyLoopBoundaries(position, speed) {
      var lower = this.lower;
      var upper = this.upper;

      if (speed > 0 && position >= upper) return lower + (position - lower) % (upper - lower);else if (speed < 0 && position < lower) return upper - (upper - position) % (upper - lower);

      return position;
    }
  }]);
  return LoopControl;
}(_TimeEngine5.default);

// play controlled base class


var PlayControlled = function () {
  function PlayControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlled);

    this.__playControl = playControl;

    engine.master = this;
    this.__engine = engine;
  }

  (0, _createClass3.default)(PlayControlled, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      this.__engine.syncSpeed(time, position, speed, seek);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__playControl = null;

      this.__engine.master = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return PlayControlled;
}();

// play control for engines implementing the *speed-controlled* interface


var PlayControlledSpeedControlled = function (_PlayControlled) {
  (0, _inherits3.default)(PlayControlledSpeedControlled, _PlayControlled);

  function PlayControlledSpeedControlled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSpeedControlled);
    return (0, _possibleConstructorReturn3.default)(this, (PlayControlledSpeedControlled.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSpeedControlled)).call(this, playControl, engine));
  }

  return PlayControlledSpeedControlled;
}(PlayControlled);

// play control for engines implmenting the *transported* interface


var PlayControlledTransported = function (_PlayControlled2) {
  (0, _inherits3.default)(PlayControlledTransported, _PlayControlled2);

  function PlayControlledTransported(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledTransported);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledTransported.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledTransported)).call(this, playControl, engine));

    _this3.__schedulerHook = new PlayControlledSchedulerHook(playControl, engine);
    return _this3;
  }

  (0, _createClass3.default)(PlayControlledTransported, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      if (speed !== lastSpeed || seek && speed !== 0) {
        var nextPosition;

        // resync transported engines
        if (seek || speed * lastSpeed < 0) {
          // seek or reverse direction
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (lastSpeed === 0) {
          // start
          nextPosition = this.__engine.syncPosition(time, position, speed);
        } else if (speed === 0) {
          // stop
          nextPosition = Infinity;

          if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, 0);
        } else if (this.__engine.syncSpeed) {
          // change speed without reversing direction
          this.__engine.syncSpeed(time, position, speed);
        }

        this.__schedulerHook.resetPosition(nextPosition);
      }
    }
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(engine) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      if (position === undefined) {
        var playControl = this.__playControl;
        var time = playControl.__sync();

        position = this.__engine.syncPosition(time, playControl.__position, playControl.__speed);
      }

      this.__schedulerHook.resetPosition(position);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__schedulerHook.destroy();
      this.__schedulerHook = null;

      (0, _get3.default)(PlayControlledTransported.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledTransported.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledTransported;
}(PlayControlled);

// play control for time engines implementing the *scheduled* interface


var PlayControlledScheduled = function (_PlayControlled3) {
  (0, _inherits3.default)(PlayControlledScheduled, _PlayControlled3);

  function PlayControlledScheduled(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledScheduled);

    // scheduling queue becomes master of engine
    var _this4 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledScheduled.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledScheduled)).call(this, playControl, engine));

    engine.master = null;
    _this4.__schedulingQueue = new PlayControlledSchedulingQueue(playControl, engine);
    return _this4;
  }

  (0, _createClass3.default)(PlayControlledScheduled, [{
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed, seek, lastSpeed) {
      if (lastSpeed === 0 && speed !== 0) // start or seek
        this.__engine.resetTime();else if (lastSpeed !== 0 && speed === 0) // stop
        this.__engine.resetTime(Infinity);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__schedulingQueue.destroy();
      (0, _get3.default)(PlayControlledScheduled.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledScheduled;
}(PlayControlled);

// translates transported engine advancePosition into global scheduler times


var PlayControlledSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(PlayControlledSchedulerHook, _TimeEngine2);

  function PlayControlledSchedulerHook(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledSchedulerHook.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSchedulerHook)).call(this));

    _this5.__playControl = playControl;
    _this5.__engine = engine;

    _this5.__nextPosition = Infinity;
    playControl.__scheduler.add(_this5, Infinity);
    return _this5;
  }

  (0, _createClass3.default)(PlayControlledSchedulerHook, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var playControl = this.__playControl;
      var engine = this.__engine;
      var position = this.__nextPosition;
      var nextPosition = engine.advancePosition(time, position, playControl.__speed);
      var nextTime = playControl.__getTimeAtPosition(nextPosition);

      this.__nextPosition = nextPosition;
      return nextTime;
    }
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.__nextPosition;

      var time = this.__playControl.__getTimeAtPosition(position);
      this.__nextPosition = position;
      this.resetTime(time);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__playControl.__scheduler.remove(this);
      this.__playControl = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return PlayControlledSchedulerHook;
}(_TimeEngine5.default);

// internal scheduling queue that returns the current position (and time) of the play control


var PlayControlledSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(PlayControlledSchedulingQueue, _SchedulingQueue);

  function PlayControlledSchedulingQueue(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (PlayControlledSchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(PlayControlledSchedulingQueue)).call(this));

    _this6.__playControl = playControl;
    _this6.__engine = engine;

    _this6.add(engine, Infinity);
    playControl.__scheduler.add(_this6, Infinity);
    return _this6;
  }

  (0, _createClass3.default)(PlayControlledSchedulingQueue, [{
    key: 'destroy',
    value: function destroy() {
      this.__playControl.__scheduler.remove(this);
      this.remove(this.__engine);

      this.__playControl = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__playControl.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__playControl.currentPosition;
    }
  }]);
  return PlayControlledSchedulingQueue;
}(_SchedulingQueue3.default);

/**
 * Extends Time Engine to provide playback control of a Time Engine instance.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/play-control.html}
 *
 * @extends TimeEngine
 * @param {TimeEngine} engine - engine to control
 *
 * @example
 * import * as masters from 'waves-masters';
 *
 * const getTimeFunction = () => {
 *   const now = process.hrtime();
 *   return now[0] + now[1] * 1e-9;
 * }
 * const scheduler = new masters.Scheduler(getTimeFunction);
 * const playerEngine = new MyTimeEngine();
 * const playControl = new masters.PlayControl(scheduler, playerEngine);
 *
 * playControl.start();
 */


var PlayControl = function (_TimeEngine3) {
  (0, _inherits3.default)(PlayControl, _TimeEngine3);

  function PlayControl(scheduler, engine) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck3.default)(this, PlayControl);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (PlayControl.__proto__ || (0, _getPrototypeOf2.default)(PlayControl)).call(this));

    _this7.__scheduler = scheduler;

    _this7.__playControlled = null;
    _this7.__loopControl = null;
    _this7.__loopStart = 0;
    _this7.__loopEnd = 1;

    // synchronized tie, position, and speed
    _this7.__time = 0;
    _this7.__position = 0;
    _this7.__speed = 0;

    // non-zero "user" speed
    _this7.__playingSpeed = 1;

    if (engine) _this7.__setEngine(engine);
    return _this7;
  }

  (0, _createClass3.default)(PlayControl, [{
    key: '__setEngine',
    value: function __setEngine(engine) {
      if (engine.master) throw new Error("object has already been added to a master");

      if (_TimeEngine5.default.implementsSpeedControlled(engine)) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (_TimeEngine5.default.implementsTransported(engine)) this.__playControlled = new PlayControlledTransported(this, engine);else if (_TimeEngine5.default.implementsScheduled(engine)) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
    }
  }, {
    key: '__resetEngine',
    value: function __resetEngine() {
      this.__playControlled.destroy();
      this.__playControlled = null;
    }

    /**
     * Calculate/extrapolate playing time for given position
     *
     * @param {Number} position position
     * @return {Number} extrapolated time
     * @private
     */

  }, {
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      return this.__time + (position - this.__position) / this.__speed;
    }

    /**
     * Calculate/extrapolate playing position for given time
     *
     * @param {Number} time time
     * @return {Number} extrapolated position
     * @private
     */

  }, {
    key: '__getPositionAtTime',
    value: function __getPositionAtTime(time) {
      return this.__position + (time - this.__time) * this.__speed;
    }
  }, {
    key: '__sync',
    value: function __sync() {
      var now = this.currentTime;
      this.__position += (now - this.__time) * this.__speed;
      this.__time = now;

      return now;
    }

    /**
     * Get current master time.
     * This function will be replaced when the play-control is added to a master.
     *
     * @name currentTime
     * @type {Number}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'set',
    value: function set() {
      var engine = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var time = this.__sync();
      var speed = this.__speed;

      if (this.__playControlled !== null && this.__playControlled.__engine !== engine) {

        this.syncSpeed(time, this.__position, 0);

        if (this.__playControlled) this.__resetEngine();

        if (this.__playControlled === null && engine !== null) {
          this.__setEngine(engine);

          if (speed !== 0) this.syncSpeed(time, this.__position, speed);
        }
      }
    }

    /**
     * Sets the play control loop behavior.
     *
     * @type {Boolean}
     * @name loop
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'setLoopBoundaries',


    /**
     * Sets loop start and end time.
     *
     * @param {Number} loopStart - loop start value.
     * @param {Number} loopEnd - loop end value.
     */
    value: function setLoopBoundaries(loopStart, loopEnd) {
      this.__loopStart = loopStart;
      this.__loopEnd = loopEnd;

      this.loop = this.loop;
    }

    /**
     * Sets loop start value
     *
     * @type {Number}
     * @name loopStart
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'syncSpeed',


    // TimeEngine method (speed-controlled interface)
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var lastSpeed = this.__speed;

      if (speed !== lastSpeed || seek) {
        if ((seek || lastSpeed === 0) && this.__loopControl) position = this.__loopControl.applyLoopBoundaries(position, speed);

        this.__time = time;
        this.__position = position;
        this.__speed = speed;

        if (this.__playControlled) this.__playControlled.syncSpeed(time, position, speed, seek, lastSpeed);

        if (this.__loopControl) this.__loopControl.reschedule(speed);
      }
    }

    /**
     * Starts playback
     */

  }, {
    key: 'start',
    value: function start() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, this.__playingSpeed);
    }

    /**
     * Pauses playback and stays at the same position.
     */

  }, {
    key: 'pause',
    value: function pause() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
    }

    /**
     * Stops playback and seeks to initial (0) position.
     */

  }, {
    key: 'stop',
    value: function stop() {
      var time = this.__sync();
      this.syncSpeed(time, 0, 0, true);
    }

    /**
     * If speed if provided, sets the playback speed. The speed value should
     * be non-zero between -16 and -1/16 or between 1/16 and 16.
     *
     * @type {Number}
     * @name speed
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'seek',


    /**
     * Set (jump to) playing position.
     *
     * @param {Number} position target position
     */
    value: function seek(position) {
      var time = this.__sync();
      this.__position = position;
      this.syncSpeed(time, position, this.__speed, true);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__scheduler.currentTime;
    }

    /**
     * Get current master position.
     * This function will be replaced when the play-control is added to a master.
     *
     * @name currentPosition
     * @type {Number}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }

    /**
     * Returns if the play control is running.
     *
     * @name running
     * @type {Boolean}
     * @memberof PlayControl
     * @instance
     * @readonly
     */

  }, {
    key: 'running',
    get: function get() {
      return !(this.__speed === 0);
    }
  }, {
    key: 'loop',
    set: function set(enable) {
      if (enable && this.__loopStart > -Infinity && this.__loopEnd < Infinity) {
        if (!this.__loopControl) {
          this.__loopControl = new LoopControl(this);
          this.__scheduler.add(this.__loopControl, Infinity);
        }

        if (this.__speed !== 0) {
          var position = this.currentPosition;
          var lower = Math.min(this.__loopStart, this.__loopEnd);
          var upper = Math.max(this.__loopStart, this.__loopEnd);

          if (this.__speed > 0 && position > upper) this.seek(upper);else if (this.__speed < 0 && position < lower) this.seek(lower);else this.__loopControl.reschedule(this.__speed);
        }
      } else if (this.__loopControl) {
        this.__scheduler.remove(this.__loopControl);
        this.__loopControl = null;
      }
    },
    get: function get() {
      return !!this.__loopControl;
    }
  }, {
    key: 'loopStart',
    set: function set(loopStart) {
      this.setLoopBoundaries(loopStart, this.__loopEnd);
    },
    get: function get() {
      return this.__loopStart;
    }

    /**
     * Sets loop end value
     *
     * @type {Number}
     * @name loopEnd
     * @memberof PlayControl
     * @instance
     */

  }, {
    key: 'loopEnd',
    set: function set(loopEnd) {
      this.setLoopBoundaries(this.__loopStart, loopEnd);
    },
    get: function get() {
      return this.__loopEnd;
    }
  }, {
    key: 'speed',
    set: function set(speed) {
      var time = this.__sync();

      if (speed >= 0) {
        if (speed < 0.01) speed = 0.01;else if (speed > 100) speed = 100;
      } else {
        if (speed < -100) speed = -100;else if (speed > -0.01) speed = -0.01;
      }

      this.__playingSpeed = speed;

      if (!this.master && this.__speed !== 0) this.syncSpeed(time, this.__position, speed);
    },
    get: function get() {
      return this.__playingSpeed;
    }
  }]);
  return PlayControl;
}(_TimeEngine5.default);

exports.default = PlayControl;

},{"../core/SchedulingQueue":145,"../core/TimeEngine":146,"babel-runtime/core-js/object/get-prototype-of":156,"babel-runtime/helpers/classCallCheck":161,"babel-runtime/helpers/createClass":162,"babel-runtime/helpers/get":163,"babel-runtime/helpers/inherits":164,"babel-runtime/helpers/possibleConstructorReturn":165}],149:[function(require,module,exports){
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

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _SchedulingQueue2 = require('../core/SchedulingQueue');

var _SchedulingQueue3 = _interopRequireDefault(_SchedulingQueue2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('wavesjs:masters');

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

/**
 * The `Scheduler` class implements a master for `TimeEngine` instances
 * that implement the *scheduled* interface (such as the `Metronome` and
 * `GranularEngine`).
 *
 * A `Scheduler` can also schedule simple callback functions.
 * The class is based on recursive calls to `setTimeout` and uses the time
 * returned by the `getTimeFunction` passed as first argument as a logical time
 * passed to the `advanceTime` methods of the scheduled engines or to the
 * scheduled callback functions.
 * It extends the `SchedulingQueue` class that itself includes a `PriorityQueue`
 * to assure the order of the scheduled engines (see `SimpleScheduler` for a
 * simplified scheduler implementation without `PriorityQueue`).
 *
 * {@link https://rawgit.com/wavesjs/waves-masters/master/examples/scheduler}
 *
 * @param {Function} getTimeFunction - Function that must return a time in second.
 * @param {Object} [options={}] - default options.
 * @param {Number} [options.period=0.025] - period of the scheduler.
 * @param {Number} [options.lookahead=0.1] - lookahead of the scheduler.
 *
 * @see TimeEngine
 * @see SimpleScheduler
 *
 * @example
 * import * as masters from 'waves-masters';
 *
 * const getTimeFunction = () => preformance.now() / 1000;
 * const scheduler = new masters.Scheduler(getTimeFunction);
 *
 * scheduler.add(myEngine);
 */

var Scheduler = function (_SchedulingQueue) {
  (0, _inherits3.default)(Scheduler, _SchedulingQueue);

  function Scheduler(getTimeFunction) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Scheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Scheduler.__proto__ || (0, _getPrototypeOf2.default)(Scheduler)).call(this));

    if (!isFunction(getTimeFunction)) throw new Error('Invalid argument `getTimeFunction`');

    _this.getTimeFunction = getTimeFunction;

    _this.__currentTime = null;
    _this.__nextTime = Infinity;
    _this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     * @name period
     * @memberof Scheduler
     * @instance
     */
    _this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     * @name lookahead
     * @memberof Scheduler
     * @instance
     */
    _this.lookahead = options.lookahead || 0.1;
    return _this;
  }

  // setTimeout scheduling loop


  (0, _createClass3.default)(Scheduler, [{
    key: '__tick',
    value: function __tick() {
      var currentTime = this.getTimeFunction();
      var time = this.__nextTime;

      this.__timeout = null;

      while (time <= currentTime + this.lookahead) {
        this.__currentTime = time;
        time = this.advanceTime(time);
      }

      this.__currentTime = null;
      this.resetTime(time);
    }
  }, {
    key: 'resetTime',
    value: function resetTime() {
      var _this2 = this;

      var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.currentTime;

      if (this.master) {
        this.master.reset(this, time);
      } else {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        if (time !== Infinity) {
          if (this.__nextTime === Infinity) log('Scheduler Start');

          var timeOutDelay = Math.max(time - this.lookahead - this.getTimeFunction(), this.period);

          this.__timeout = setTimeout(function () {
            _this2.__tick();
          }, Math.ceil(timeOutDelay * 1000));
        } else if (this.__nextTime !== Infinity) {
          log('Scheduler Stop');
        }

        this.__nextTime = time;
      }
    }

    /**
     * Scheduler current logical time.
     *
     * @name currentTime
     * @type {Number}
     * @memberof Scheduler
     * @instance
     */

  }, {
    key: 'currentTime',
    get: function get() {
      if (this.master) return this.master.currentTime;

      return this.__currentTime || this.getTimeFunction() + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }

    // inherited from scheduling queue
    /**
     * Add a TimeEngine or a simple callback function to the scheduler at an
     * optionally given time. Whether the add method is called with a TimeEngine
     * or a callback function it returns a TimeEngine that can be used as argument
     * of the methods remove and resetEngineTime. A TimeEngine added to a scheduler
     * has to implement the scheduled interface. The callback function added to a
     * scheduler will be called at the given time and with the given time as
     * argument. The callback can return a new scheduling time (i.e. the next
     * time when it will be called) or it can return Infinity to suspend scheduling
     * without removing the function from the scheduler. A function that does
     * not return a value (or returns null or 0) is removed from the scheduler
     * and cannot be used as argument of the methods remove and resetEngineTime
     * anymore.
     *
     * @name add
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine|Function} engine - Engine to add to the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    /**
     * Remove a TimeEngine from the scheduler that has been added to the
     * scheduler using the add method.
     *
     * @name add
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine} engine - Engine to remove from the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    /**
     * Reschedule a scheduled time engine at a given time.
     *
     * @name resetEngineTime
     * @function
     * @memberof Scheduler
     * @instance
     * @param {TimeEngine} engine - Engine to reschedule
     * @param {Number} time - Schedule time
     */
    /**
     * Remove all scheduled callbacks and engines from the scheduler.
     *
     * @name clear
     * @function
     * @memberof Scheduler
     * @instance
     */

  }]);
  return Scheduler;
}(_SchedulingQueue3.default);

exports.default = Scheduler;

},{"../core/SchedulingQueue":145,"babel-runtime/core-js/object/get-prototype-of":156,"babel-runtime/helpers/classCallCheck":161,"babel-runtime/helpers/createClass":162,"babel-runtime/helpers/inherits":164,"babel-runtime/helpers/possibleConstructorReturn":165,"debug":268}],150:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _TimeEngine = require('../core/TimeEngine');

var _TimeEngine2 = _interopRequireDefault(_TimeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _debug2.default)('wavesjs:masters');

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

/**
 *
 *
 *
 * The SimpleScheduler class implements a simplified master for time engines
 * (see TimeEngine) that implement the scheduled interface
 * such as the Metronome and the GranularEngine. The API and funtionalities of
 * the SimpleScheduler class are identical to the Scheduler class. But, other
 * than the Scheduler, the SimpleScheduler class does not guarantee the order
 * of events (i.e. calls to the advanceTime method of scheduled time engines
 * and to scheduled callback functions) within a scheduling period (see period
 * attribute).
 *
 * {@link https://rawgit.com/wavesjs/waves-masters/master/examples/scheduler}
 *
 * @param {Function} getTimeFunction - Function that must return a time in second.
 * @param {Object} [options={}] - default options
 * @param {Number} [options.period=0.025] - period of the scheduler.
 * @param {Number} [options.lookahead=0.1] - lookahead of the scheduler.
 *
 * @see TimeEngine
 * @see Scheduler
 *
 * @example
 * @example
 * import * as masters from 'waves-masters';
 *
 * const getTimeFunction = () => preformance.now() / 1000;
 * const scheduler = new masters.SimpleScheduler(getTimeFunction);
 *
 * scheduler.add(myEngine);
 */

var SimpleScheduler = function () {
  function SimpleScheduler(getTimeFunction) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, SimpleScheduler);

    if (!isFunction(getTimeFunction)) throw new Error('Invalid argument `getTimeFunction`');

    this.getTimeFunction = getTimeFunction;

    this.__engines = new _set2.default();

    this.__schedEngines = [];
    this.__schedTimes = [];

    this.__currentTime = null;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     * @name period
     * @memberof Scheduler
     * @instance
     */
    this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     * @name lookahead
     * @memberof Scheduler
     * @instance
     */
    this.lookahead = options.lookahead || 0.1;
  }

  (0, _createClass3.default)(SimpleScheduler, [{
    key: '__scheduleEngine',
    value: function __scheduleEngine(engine, time) {
      this.__schedEngines.push(engine);
      this.__schedTimes.push(time);
    }
  }, {
    key: '__rescheduleEngine',
    value: function __rescheduleEngine(engine, time) {
      var index = this.__schedEngines.indexOf(engine);

      if (index >= 0) {
        if (time !== Infinity) {
          this.__schedTimes[index] = time;
        } else {
          this.__schedEngines.splice(index, 1);
          this.__schedTimes.splice(index, 1);
        }
      } else if (time < Infinity) {
        this.__schedEngines.push(engine);
        this.__schedTimes.push(time);
      }
    }
  }, {
    key: '__unscheduleEngine',
    value: function __unscheduleEngine(engine) {
      var index = this.__schedEngines.indexOf(engine);

      if (index >= 0) {
        this.__schedEngines.splice(index, 1);
        this.__schedTimes.splice(index, 1);
      }
    }
  }, {
    key: '__resetTick',
    value: function __resetTick() {
      if (this.__schedEngines.length > 0) {
        if (!this.__timeout) {
          log('SimpleScheduler Start');
          this.__tick();
        }
      } else if (this.__timeout) {
        log('SimpleScheduler Stop');
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }
    }
  }, {
    key: '__tick',
    value: function __tick() {
      var _this = this;

      var currentTime = this.getTimeFunction();
      var i = 0;

      while (i < this.__schedEngines.length) {
        var engine = this.__schedEngines[i];
        var time = this.__schedTimes[i];

        while (time && time <= currentTime + this.lookahead) {
          time = Math.max(time, currentTime);
          this.__currentTime = time;
          time = engine.advanceTime(time);
        }

        if (time && time < Infinity) {
          this.__schedTimes[i++] = time;
        } else {
          this.__unscheduleEngine(engine);

          // remove engine from scheduler
          if (!time) {
            engine.master = null;
            this.__engines.delete(engine);
          }
        }
      }

      this.__currentTime = null;
      this.__timeout = null;

      if (this.__schedEngines.length > 0) {
        this.__timeout = setTimeout(function () {
          _this.__tick();
        }, this.period * 1000);
      }
    }

    /**
     * Scheduler current logical time.
     *
     * @name currentTime
     * @type {Number}
     * @memberof Scheduler
     * @instance
     */

  }, {
    key: 'defer',


    // call a function at a given time
    /**
     * Defer the execution of a function at a given time.
     *
     * @param {Function} fun - Function to defer
     * @param {Number} [time=this.currentTime] - Schedule time
     */
    value: function defer(fun) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime(time) {
          fun(time);
        } // make sur that the advanceTime method does not returm anything
      }, time);
    }

    /**
     * Add a TimeEngine function to the scheduler at an optionally given time.
     *
     * @param {TimeEngine} engine - Engine to add to the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      if (!_TimeEngine2.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      // set master and add to array
      engine.master = this;
      this.__engines.add(engine);

      // schedule engine
      this.__scheduleEngine(engine, time);
      this.__resetTick();
    }

    /**
     * Remove a TimeEngine from the scheduler that has been added to the
     * scheduler using the add method.
     *
     * @param {TimeEngine} engine - Engine to remove from the scheduler
     * @param {Number} [time=this.currentTime] - Schedule time
     */

  }, {
    key: 'remove',
    value: function remove(engine) {
      if (!engine.master || engine.master !== this) throw new Error("engine has not been added to this scheduler");

      // reset master and remove from array
      engine.master = null;
      this.__engines.delete(engine);

      // unschedule engine
      this.__unscheduleEngine(engine);
      this.__resetTick();
    }

    /**
     * Reschedule a scheduled time engine at a given time.
     *
     * @param {TimeEngine} engine - Engine to reschedule
     * @param {Number} time - Schedule time
     */

  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.currentTime;

      this.__rescheduleEngine(engine, time);
      this.__resetTick();
    }

    /**
     * Check whether a given engine is scheduled.
     *
     * @param {TimeEngine} engine - Engine to check
     */

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }

    /**
     * Remove all engines from the scheduler.
     */

  }, {
    key: 'clear',
    value: function clear() {
      if (this.__timeout) {
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }

      this.__schedEngines.length = 0;
      this.__schedTimes.length = 0;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__currentTime || this.getTimeFunction() + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return undefined;
    }
  }]);
  return SimpleScheduler;
}();

exports.default = SimpleScheduler;

},{"../core/TimeEngine":146,"babel-runtime/core-js/set":158,"babel-runtime/helpers/classCallCheck":161,"babel-runtime/helpers/createClass":162,"debug":268}],151:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

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

var _PriorityQueue = require('../core/PriorityQueue');

var _PriorityQueue2 = _interopRequireDefault(_PriorityQueue);

var _SchedulingQueue2 = require('../core/SchedulingQueue');

var _SchedulingQueue3 = _interopRequireDefault(_SchedulingQueue2);

var _TimeEngine4 = require('../core/TimeEngine');

var _TimeEngine5 = _interopRequireDefault(_TimeEngine4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addDuplet(firstArray, secondArray, firstElement, secondElement) {
  firstArray.push(firstElement);
  secondArray.push(secondElement);
}

function removeDuplet(firstArray, secondArray, firstElement) {
  var index = firstArray.indexOf(firstElement);

  if (index >= 0) {
    var secondElement = secondArray[index];

    firstArray.splice(index, 1);
    secondArray.splice(index, 1);

    return secondElement;
  }

  return null;
}

// The Transported call is the base class of the adapters between
// different types of engines (i.e. transported, scheduled, play-controlled)
// The adapters are at the same time masters for the engines added to the transport
// and transported TimeEngines inserted into the transport's position-based pritority queue.

var Transported = function (_TimeEngine) {
  (0, _inherits3.default)(Transported, _TimeEngine);

  function Transported(transport, engine, start, duration, offset) {
    var stretch = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;
    (0, _classCallCheck3.default)(this, Transported);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Transported.__proto__ || (0, _getPrototypeOf2.default)(Transported)).call(this));

    _this.master = transport;

    _this.__engine = engine;
    engine.master = _this;

    _this.__startPosition = start;
    _this.__endPosition = !isFinite(duration) ? Infinity : start + duration;
    _this.__offsetPosition = start + offset;
    _this.__stretchPosition = stretch;
    _this.__isRunning = false;
    return _this;
  }

  (0, _createClass3.default)(Transported, [{
    key: 'setBoundaries',
    value: function setBoundaries(start, duration) {
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var stretch = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

      this.__startPosition = start;
      this.__endPosition = start + duration;
      this.__offsetPosition = start + offset;
      this.__stretchPosition = stretch;
      this.resetPosition();
    }
  }, {
    key: 'start',
    value: function start(time, position, speed) {}
  }, {
    key: 'stop',
    value: function stop(time, position) {}
  }, {
    key: 'resetPosition',
    value: function resetPosition(position) {
      if (position !== undefined) position += this.__offsetPosition;

      this.master.resetEnginePosition(this, position);
    }
  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (speed > 0) {
        if (position < this.__startPosition) {

          if (this.__isRunning) this.stop(time, position - this.__offsetPosition);

          this.__isRunning = false;
          return this.__startPosition;
        } else if (position < this.__endPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__isRunning = true;
          return this.__endPosition;
        }
      } else {
        if (position > this.__endPosition) {
          if (this.__isRunning) // if engine is running
            this.stop(time, position - this.__offsetPosition);

          this.__isRunning = false;
          return this.__endPosition;
        } else if (position > this.__startPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__isRunning = true;
          return this.__startPosition;
        }
      }

      if (this.__isRunning) // if engine is running
        this.stop(time, position);

      this.__isRunning = false;
      return Infinity * speed;
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      if (!this.__isRunning) {
        this.start(time, position - this.__offsetPosition, speed);
        this.__isRunning = true;

        if (speed > 0) return this.__endPosition;

        return this.__startPosition;
      }

      // stop engine
      this.stop(time, position - this.__offsetPosition);

      this.__isRunning = false;
      return Infinity * speed;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (speed === 0) // stop
        this.stop(time, position - this.__offsetPosition);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.master = null;

      this.__engine.master = null;
      this.__engine = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.master.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.master.currentPosition - this.__offsetPosition;
    }
  }]);
  return Transported;
}(_TimeEngine5.default);

// TransportedTransported
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position


var TransportedTransported = function (_Transported) {
  (0, _inherits3.default)(TransportedTransported, _Transported);

  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedTransported);
    return (0, _possibleConstructorReturn3.default)(this, (TransportedTransported.__proto__ || (0, _getPrototypeOf2.default)(TransportedTransported)).call(this, transport, engine, startPosition, endPosition, offsetPosition));
  }

  (0, _createClass3.default)(TransportedTransported, [{
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      if (speed > 0 && position < this.__endPosition) position = Math.max(position, this.__startPosition);else if (speed < 0 && position >= this.__startPosition) position = Math.min(position, this.__endPosition);

      return this.__offsetPosition + this.__engine.syncPosition(time, position - this.__offsetPosition, speed);
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      position = this.__offsetPosition + this.__engine.advancePosition(time, position - this.__offsetPosition, speed);

      if (speed > 0 && position < this.__endPosition || speed < 0 && position >= this.__startPosition) return position;

      return Infinity * speed;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(engine) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      if (position !== undefined) position += this.__offsetPosition;

      this.resetPosition(position);
    }
  }]);
  return TransportedTransported;
}(Transported);

// TransportedSpeedControlled
// has to start and stop the speed-controlled engines when the transport hits the engine's start and end position


var TransportedSpeedControlled = function (_Transported2) {
  (0, _inherits3.default)(TransportedSpeedControlled, _Transported2);

  function TransportedSpeedControlled(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedSpeedControlled);
    return (0, _possibleConstructorReturn3.default)(this, (TransportedSpeedControlled.__proto__ || (0, _getPrototypeOf2.default)(TransportedSpeedControlled)).call(this, transport, engine, startPosition, endPosition, offsetPosition));
  }

  (0, _createClass3.default)(TransportedSpeedControlled, [{
    key: 'start',
    value: function start(time, position, speed) {
      this.__engine.syncSpeed(time, position, speed, true);
    }
  }, {
    key: 'stop',
    value: function stop(time, position) {
      this.__engine.syncSpeed(time, position, 0);
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (this.__isRunning) this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__engine.syncSpeed(this.master.currentTime, this.master.currentPosition - this.__offsetPosition, 0);
      (0, _get3.default)(TransportedSpeedControlled.prototype.__proto__ || (0, _getPrototypeOf2.default)(TransportedSpeedControlled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedSpeedControlled;
}(Transported);

// TransportedScheduled
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position


var TransportedScheduled = function (_Transported3) {
  (0, _inherits3.default)(TransportedScheduled, _Transported3);

  function TransportedScheduled(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedScheduled);

    // scheduling queue becomes master of engine
    var _this4 = (0, _possibleConstructorReturn3.default)(this, (TransportedScheduled.__proto__ || (0, _getPrototypeOf2.default)(TransportedScheduled)).call(this, transport, engine, startPosition, endPosition, offsetPosition));

    engine.master = null;
    transport.__schedulingQueue.add(engine, Infinity);
    return _this4;
  }

  (0, _createClass3.default)(TransportedScheduled, [{
    key: 'start',
    value: function start(time, position, speed) {
      this.master.__schedulingQueue.resetEngineTime(this.__engine, time);
    }
  }, {
    key: 'stop',
    value: function stop(time, position) {
      this.master.__schedulingQueue.resetEngineTime(this.__engine, Infinity);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.master.__schedulingQueue.remove(this.__engine);
      (0, _get3.default)(TransportedScheduled.prototype.__proto__ || (0, _getPrototypeOf2.default)(TransportedScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedScheduled;
}(Transported);

// translates advancePosition of *transported* engines into global scheduler times


var TransportSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(TransportSchedulerHook, _TimeEngine2);

  function TransportSchedulerHook(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (TransportSchedulerHook.__proto__ || (0, _getPrototypeOf2.default)(TransportSchedulerHook)).call(this));

    _this5.__transport = transport;

    _this5.__nextPosition = Infinity;
    _this5.__nextTime = Infinity;
    transport.__scheduler.add(_this5, Infinity);
    return _this5;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(TransportSchedulerHook, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var transport = this.__transport;
      var position = this.__nextPosition;
      var speed = transport.__speed;
      var nextPosition = transport.advancePosition(time, position, speed);
      var nextTime = transport.__getTimeAtPosition(nextPosition);

      this.__nextPosition = nextPosition;
      this.__nextTime = nextTime;

      return nextTime;
    }
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.__nextPosition;

      var transport = this.__transport;
      var time = transport.__getTimeAtPosition(position);

      this.__nextPosition = position;
      this.__nextTime = time;

      this.resetTime(time);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__transport.__scheduler.remove(this);
      this.__transport = null;
    }
  }]);
  return TransportSchedulerHook;
}(_TimeEngine5.default);

// internal scheduling queue that returns the current position (and time) of the play control


var TransportSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(TransportSchedulingQueue, _SchedulingQueue);

  function TransportSchedulingQueue(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (TransportSchedulingQueue.__proto__ || (0, _getPrototypeOf2.default)(TransportSchedulingQueue)).call(this));

    _this6.__transport = transport;
    transport.__scheduler.add(_this6, Infinity);
    return _this6;
  }

  (0, _createClass3.default)(TransportSchedulingQueue, [{
    key: 'destroy',
    value: function destroy() {
      this.__transport.__scheduler.remove(this);
      this.__transport = null;
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__transport.currentTime;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__transport.currentPosition;
    }
  }]);
  return TransportSchedulingQueue;
}(_SchedulingQueue3.default);

/**
 * Provides position-based scheduling of TimeEngine instances.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-masters/master/examples/transport}
 *
 * @example
 * import * as masters from 'waves-masters';
 *
 * const getTimeFunction = () => {
 *   const now = process.hrtime();
 *   return now[0] + now[1] * 1e-9;
 * }
 * const scheduler = new masters.Scheduler(getTimeFunction);
 * const transport = new masters.Transport(scheduler);
 * const playControl = new masters.PlayControl(scheduler, transport);
 * const myEngine = new MyEngine();
 * const yourEngine = new yourEngine();
 *
 * transport.add(myEngine);
 * transport.add(yourEngine);
 *
 * playControl.start();
 */


var Transport = function (_TimeEngine3) {
  (0, _inherits3.default)(Transport, _TimeEngine3);

  function Transport(scheduler) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Transport);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (Transport.__proto__ || (0, _getPrototypeOf2.default)(Transport)).call(this));

    if (!scheduler) throw new Error('Invalid argument `scheduler`, should be an instance of `Scheduler`');

    _this7.__engines = [];
    _this7.__transported = [];

    _this7.__scheduler = scheduler;
    _this7.__schedulerHook = new TransportSchedulerHook(_this7);
    _this7.__transportedQueue = new _PriorityQueue2.default();
    _this7.__schedulingQueue = new TransportSchedulingQueue(_this7);

    // syncronized time, position, and speed
    _this7.__time = 0;
    _this7.__position = 0;
    _this7.__speed = 0;
    return _this7;
  }

  (0, _createClass3.default)(Transport, [{
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      if (this.__speed === 0) return +Infinity;else return this.__time + (position - this.__position) / this.__speed;
    }
  }, {
    key: '__getPositionAtTime',
    value: function __getPositionAtTime(time) {
      return this.__position + (time - this.__time) * this.__speed;
    }
  }, {
    key: '__syncTransportedPosition',
    value: function __syncTransportedPosition(time, position, speed) {
      var numTransportedEngines = this.__transported.length;
      var nextPosition = Infinity * speed;

      if (numTransportedEngines > 0) {
        this.__transportedQueue.clear();
        this.__transportedQueue.reverse = speed < 0;

        for (var i = 0; i < numTransportedEngines; i++) {
          var engine = this.__transported[i];
          var nextEnginePosition = engine.syncPosition(time, position, speed);
          this.__transportedQueue.insert(engine, nextEnginePosition);
        }

        nextPosition = this.__transportedQueue.time;
      }

      return nextPosition;
    }
  }, {
    key: '__syncTransportedSpeed',
    value: function __syncTransportedSpeed(time, position, speed) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.__transported), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var transported = _step.value;

          transported.syncSpeed(time, position, speed);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * Get current master time. This getter will be replaced when the transport
     * is added to a master (i.e. transport or play-control).
     *
     * @type {Number}
     * @name currentTime
     * @memberof Transport
     * @instance
     * @readonly
     */

  }, {
    key: 'resetPosition',


    /**
     * Reset next transport position
     *
     * @param {Number} next - transport position
     */
    value: function resetPosition(position) {
      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this, position);else this.__schedulerHook.resetPosition(position);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     */

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      return this.__syncTransportedPosition(time, position, speed);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     */

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var engine = this.__transportedQueue.head;
      var nextEnginePosition = engine.advancePosition(time, position, speed);
      return this.__transportedQueue.move(engine, nextEnginePosition);
    }

    /**
     * Implementation of the transported time engine interface.
     *
     * @param {Number} time
     * @param {Number} position
     * @param {Number} speed
     * @param {Boolean} [seek=false]
     */

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var lastSpeed = this.__speed;

      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      if (speed !== lastSpeed || seek && speed !== 0) {
        var nextPosition = void 0;

        // resync transported engines
        if (seek || speed * lastSpeed < 0) {
          // seek or reverse direction
          nextPosition = this.__syncTransportedPosition(time, position, speed);
        } else if (lastSpeed === 0) {
          // start
          nextPosition = this.__syncTransportedPosition(time, position, speed);
        } else if (speed === 0) {
          // stop
          nextPosition = Infinity;
          this.__syncTransportedSpeed(time, position, 0);
        } else {
          // change speed without reversing direction
          this.__syncTransportedSpeed(time, position, speed);
        }

        this.resetPosition(nextPosition);
      }
    }

    /**
     * Add a time engine to the transport.
     *
     * @param {Object} engine - engine to be added to the transport
     * @param {Number} position - start position
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var startPosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var endPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
      var offsetPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

      var transported = null;

      if (offsetPosition === -Infinity) offsetPosition = 0;

      if (engine.master) throw new Error("object has already been added to a master");

      if (_TimeEngine5.default.implementsTransported(engine)) transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);else if (_TimeEngine5.default.implementsSpeedControlled(engine)) transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);else if (_TimeEngine5.default.implementsScheduled(engine)) transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);else throw new Error("object cannot be added to a transport");

      if (transported) {
        var speed = this.__speed;

        addDuplet(this.__engines, this.__transported, engine, transported);

        if (speed !== 0) {
          // sync and start
          var nextEnginePosition = transported.syncPosition(this.currentTime, this.currentPosition, speed);
          var nextPosition = this.__transportedQueue.insert(transported, nextEnginePosition);

          this.resetPosition(nextPosition);
        }
      }

      return transported;
    }

    /**
     * Remove a time engine from the transport.
     *
     * @param {object} engineOrTransported - engine or transported to be removed from the transport
     */

  }, {
    key: 'remove',
    value: function remove(engineOrTransported) {
      var engine = engineOrTransported;
      var transported = removeDuplet(this.__engines, this.__transported, engineOrTransported);

      if (!transported) {
        engine = removeDuplet(this.__transported, this.__engines, engineOrTransported);
        transported = engineOrTransported;
      }

      if (engine && transported) {
        var nextPosition = this.__transportedQueue.remove(transported);

        transported.destroy();

        if (this.__speed !== 0) this.resetPosition(nextPosition);
      } else {
        throw new Error("object has not been added to this transport");
      }
    }

    /**
     * Reset position of the given engine.
     *
     * @param {TimeEngine} transported - Engine to reset
     * @param {Number} position - New position
     */

  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(transported) {
      var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

      var speed = this.__speed;

      if (speed !== 0) {
        if (position === undefined) position = transported.syncPosition(this.currentTime, this.currentPosition, speed);

        var nextPosition = this.__transportedQueue.move(transported, position);
        this.resetPosition(nextPosition);
      }
    }

    /**
     * Remove all time engines from the transport.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this.syncSpeed(this.currentTime, this.currentPosition, 0);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this.__transported), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var transported = _step2.value;

          transported.destroy();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__scheduler.currentTime;
    }

    /**
     * Get current master position. This getter will be replaced when the transport
     * is added to a master (i.e. transport or play-control).
     *
     * @type {Number}
     * @name currentPosition
     * @memberof Transport
     * @instance
     * @readonly
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }
  }]);
  return Transport;
}(_TimeEngine5.default);

exports.default = Transport;

},{"../core/PriorityQueue":144,"../core/SchedulingQueue":145,"../core/TimeEngine":146,"babel-runtime/core-js/get-iterator":152,"babel-runtime/core-js/object/get-prototype-of":156,"babel-runtime/helpers/classCallCheck":161,"babel-runtime/helpers/createClass":162,"babel-runtime/helpers/get":163,"babel-runtime/helpers/inherits":164,"babel-runtime/helpers/possibleConstructorReturn":165}],152:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":167}],153:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"core-js/library/fn/object/create":168,"dup":36}],154:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"core-js/library/fn/object/define-property":169,"dup":37}],155:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":170}],156:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"core-js/library/fn/object/get-prototype-of":171,"dup":38}],157:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"core-js/library/fn/object/set-prototype-of":172,"dup":39}],158:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":173}],159:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"core-js/library/fn/symbol":174,"dup":40}],160:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"core-js/library/fn/symbol/iterator":175,"dup":41}],161:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],162:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"../core-js/object/define-property":154,"dup":43}],163:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("../core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("../core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"../core-js/object/get-own-property-descriptor":155,"../core-js/object/get-prototype-of":156}],164:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"../core-js/object/create":153,"../core-js/object/set-prototype-of":157,"../helpers/typeof":166,"dup":44}],165:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"../helpers/typeof":166,"dup":45}],166:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"../core-js/symbol":159,"../core-js/symbol/iterator":160,"dup":46}],167:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');

},{"../modules/core.get-iterator":251,"../modules/es6.string.iterator":260,"../modules/web.dom.iterable":267}],168:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"../../modules/_core":190,"../../modules/es6.object.create":253,"dup":48}],169:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../../modules/_core":190,"../../modules/es6.object.define-property":254,"dup":49}],170:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};

},{"../../modules/_core":190,"../../modules/es6.object.get-own-property-descriptor":255}],171:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"../../modules/_core":190,"../../modules/es6.object.get-prototype-of":256,"dup":50}],172:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"../../modules/_core":190,"../../modules/es6.object.set-prototype-of":257,"dup":51}],173:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
require('../modules/es7.set.of');
require('../modules/es7.set.from');
module.exports = require('../modules/_core').Set;

},{"../modules/_core":190,"../modules/es6.object.to-string":258,"../modules/es6.set":259,"../modules/es6.string.iterator":260,"../modules/es7.set.from":262,"../modules/es7.set.of":263,"../modules/es7.set.to-json":264,"../modules/web.dom.iterable":267}],174:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"../../modules/_core":190,"../../modules/es6.object.to-string":258,"../../modules/es6.symbol":261,"../../modules/es7.symbol.async-iterator":265,"../../modules/es7.symbol.observable":266,"dup":52}],175:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"../../modules/_wks-ext":248,"../../modules/es6.string.iterator":260,"../../modules/web.dom.iterable":267,"dup":53}],176:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"dup":54}],177:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],178:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"dup":56}],179:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"./_is-object":208,"dup":57}],180:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"./_for-of":199,"dup":58}],181:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"./_to-absolute-index":239,"./_to-iobject":241,"./_to-length":242,"dup":59}],182:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"./_array-species-create":184,"./_ctx":191,"./_iobject":205,"./_to-length":242,"./_to-object":243,"dup":60}],183:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"./_is-array":207,"./_is-object":208,"./_wks":249,"dup":61}],184:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"./_array-species-constructor":183,"dup":62}],185:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"./_cof":186,"./_wks":249,"dup":63}],186:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"dup":64}],187:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"./_an-instance":178,"./_ctx":191,"./_descriptors":193,"./_for-of":199,"./_iter-define":211,"./_iter-step":212,"./_meta":215,"./_object-create":216,"./_object-dp":217,"./_redefine-all":229,"./_set-species":234,"./_validate-collection":246,"dup":65}],188:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"./_array-from-iterable":180,"./_classof":185,"dup":66}],189:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"./_an-instance":178,"./_array-methods":182,"./_descriptors":193,"./_export":197,"./_fails":198,"./_for-of":199,"./_global":200,"./_hide":202,"./_is-object":208,"./_meta":215,"./_object-dp":217,"./_redefine-all":229,"./_set-to-string-tag":235,"dup":67}],190:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"dup":68}],191:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"./_a-function":176,"dup":69}],192:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"dup":70}],193:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"./_fails":198,"dup":71}],194:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"./_global":200,"./_is-object":208,"dup":72}],195:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"dup":73}],196:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"./_object-gops":222,"./_object-keys":225,"./_object-pie":226,"dup":74}],197:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"./_core":190,"./_ctx":191,"./_global":200,"./_has":201,"./_hide":202,"dup":75}],198:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"dup":76}],199:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"./_an-object":179,"./_ctx":191,"./_is-array-iter":206,"./_iter-call":209,"./_to-length":242,"./core.get-iterator-method":250,"dup":77}],200:[function(require,module,exports){
arguments[4][78][0].apply(exports,arguments)
},{"dup":78}],201:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"dup":79}],202:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"./_descriptors":193,"./_object-dp":217,"./_property-desc":228,"dup":80}],203:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"./_global":200,"dup":81}],204:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./_descriptors":193,"./_dom-create":194,"./_fails":198,"dup":82}],205:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"./_cof":186,"dup":83}],206:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"./_iterators":213,"./_wks":249,"dup":84}],207:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"./_cof":186,"dup":85}],208:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"dup":86}],209:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"./_an-object":179,"dup":87}],210:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"./_hide":202,"./_object-create":216,"./_property-desc":228,"./_set-to-string-tag":235,"./_wks":249,"dup":88}],211:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"./_export":197,"./_hide":202,"./_iter-create":210,"./_iterators":213,"./_library":214,"./_object-gpo":223,"./_redefine":230,"./_set-to-string-tag":235,"./_wks":249,"dup":89}],212:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90}],213:[function(require,module,exports){
arguments[4][91][0].apply(exports,arguments)
},{"dup":91}],214:[function(require,module,exports){
arguments[4][92][0].apply(exports,arguments)
},{"dup":92}],215:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./_fails":198,"./_has":201,"./_is-object":208,"./_object-dp":217,"./_uid":245,"dup":93}],216:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"./_an-object":179,"./_dom-create":194,"./_enum-bug-keys":195,"./_html":203,"./_object-dps":218,"./_shared-key":236,"dup":94}],217:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"./_an-object":179,"./_descriptors":193,"./_ie8-dom-define":204,"./_to-primitive":244,"dup":95}],218:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"./_an-object":179,"./_descriptors":193,"./_object-dp":217,"./_object-keys":225,"dup":96}],219:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"./_descriptors":193,"./_has":201,"./_ie8-dom-define":204,"./_object-pie":226,"./_property-desc":228,"./_to-iobject":241,"./_to-primitive":244,"dup":97}],220:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"./_object-gopn":221,"./_to-iobject":241,"dup":98}],221:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"./_enum-bug-keys":195,"./_object-keys-internal":224,"dup":99}],222:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"dup":100}],223:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"./_has":201,"./_shared-key":236,"./_to-object":243,"dup":101}],224:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"./_array-includes":181,"./_has":201,"./_shared-key":236,"./_to-iobject":241,"dup":102}],225:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"./_enum-bug-keys":195,"./_object-keys-internal":224,"dup":103}],226:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"dup":104}],227:[function(require,module,exports){
arguments[4][105][0].apply(exports,arguments)
},{"./_core":190,"./_export":197,"./_fails":198,"dup":105}],228:[function(require,module,exports){
arguments[4][106][0].apply(exports,arguments)
},{"dup":106}],229:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"./_hide":202,"dup":107}],230:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"./_hide":202,"dup":108}],231:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"./_a-function":176,"./_ctx":191,"./_export":197,"./_for-of":199,"dup":109}],232:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"./_export":197,"dup":110}],233:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"./_an-object":179,"./_ctx":191,"./_is-object":208,"./_object-gopd":219,"dup":111}],234:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"./_core":190,"./_descriptors":193,"./_global":200,"./_object-dp":217,"./_wks":249,"dup":112}],235:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"./_has":201,"./_object-dp":217,"./_wks":249,"dup":113}],236:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"./_shared":237,"./_uid":245,"dup":114}],237:[function(require,module,exports){
arguments[4][115][0].apply(exports,arguments)
},{"./_core":190,"./_global":200,"./_library":214,"dup":115}],238:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"./_defined":192,"./_to-integer":240,"dup":116}],239:[function(require,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"./_to-integer":240,"dup":117}],240:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"dup":118}],241:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"./_defined":192,"./_iobject":205,"dup":119}],242:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"./_to-integer":240,"dup":120}],243:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"./_defined":192,"dup":121}],244:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"./_is-object":208,"dup":122}],245:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"dup":123}],246:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"./_is-object":208,"dup":124}],247:[function(require,module,exports){
arguments[4][125][0].apply(exports,arguments)
},{"./_core":190,"./_global":200,"./_library":214,"./_object-dp":217,"./_wks-ext":248,"dup":125}],248:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"./_wks":249,"dup":126}],249:[function(require,module,exports){
arguments[4][127][0].apply(exports,arguments)
},{"./_global":200,"./_shared":237,"./_uid":245,"dup":127}],250:[function(require,module,exports){
arguments[4][128][0].apply(exports,arguments)
},{"./_classof":185,"./_core":190,"./_iterators":213,"./_wks":249,"dup":128}],251:[function(require,module,exports){
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};

},{"./_an-object":179,"./_core":190,"./core.get-iterator-method":250}],252:[function(require,module,exports){
arguments[4][129][0].apply(exports,arguments)
},{"./_add-to-unscopables":177,"./_iter-define":211,"./_iter-step":212,"./_iterators":213,"./_to-iobject":241,"dup":129}],253:[function(require,module,exports){
arguments[4][131][0].apply(exports,arguments)
},{"./_export":197,"./_object-create":216,"dup":131}],254:[function(require,module,exports){
arguments[4][132][0].apply(exports,arguments)
},{"./_descriptors":193,"./_export":197,"./_object-dp":217,"dup":132}],255:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":219,"./_object-sap":227,"./_to-iobject":241}],256:[function(require,module,exports){
arguments[4][133][0].apply(exports,arguments)
},{"./_object-gpo":223,"./_object-sap":227,"./_to-object":243,"dup":133}],257:[function(require,module,exports){
arguments[4][134][0].apply(exports,arguments)
},{"./_export":197,"./_set-proto":233,"dup":134}],258:[function(require,module,exports){
arguments[4][135][0].apply(exports,arguments)
},{"dup":135}],259:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var SET = 'Set';

// 23.2 Set Objects
module.exports = require('./_collection')(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);

},{"./_collection":189,"./_collection-strong":187,"./_validate-collection":246}],260:[function(require,module,exports){
arguments[4][136][0].apply(exports,arguments)
},{"./_iter-define":211,"./_string-at":238,"dup":136}],261:[function(require,module,exports){
arguments[4][137][0].apply(exports,arguments)
},{"./_an-object":179,"./_descriptors":193,"./_enum-keys":196,"./_export":197,"./_fails":198,"./_global":200,"./_has":201,"./_hide":202,"./_is-array":207,"./_is-object":208,"./_library":214,"./_meta":215,"./_object-create":216,"./_object-dp":217,"./_object-gopd":219,"./_object-gopn":221,"./_object-gopn-ext":220,"./_object-gops":222,"./_object-keys":225,"./_object-pie":226,"./_property-desc":228,"./_redefine":230,"./_set-to-string-tag":235,"./_shared":237,"./_to-iobject":241,"./_to-primitive":244,"./_uid":245,"./_wks":249,"./_wks-define":247,"./_wks-ext":248,"dup":137}],262:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
require('./_set-collection-from')('Set');

},{"./_set-collection-from":231}],263:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
require('./_set-collection-of')('Set');

},{"./_set-collection-of":232}],264:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });

},{"./_collection-to-json":188,"./_export":197}],265:[function(require,module,exports){
arguments[4][141][0].apply(exports,arguments)
},{"./_wks-define":247,"dup":141}],266:[function(require,module,exports){
arguments[4][142][0].apply(exports,arguments)
},{"./_wks-define":247,"dup":142}],267:[function(require,module,exports){
arguments[4][143][0].apply(exports,arguments)
},{"./_global":200,"./_hide":202,"./_iterators":213,"./_wks":249,"./es6.array.iterator":252,"dup":143}],268:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))

},{"./debug":269,"_process":34}],269:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":270}],270:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}]},{},[11])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9kaXN0L2NvcmUvQXVkaW9UaW1lRW5naW5lLmpzIiwiLi4vLi4vZGlzdC9jb3JlL2F1ZGlvQ29udGV4dC5qcyIsIi4uLy4uL2Rpc3QvZW5naW5lcy9HcmFudWxhckVuZ2luZS5qcyIsIi4uLy4uL2Rpc3QvZW5naW5lcy9NZXRyb25vbWUuanMiLCIuLi8uLi9kaXN0L2VuZ2luZXMvUGxheWVyRW5naW5lLmpzIiwiLi4vLi4vZGlzdC9lbmdpbmVzL1NlZ21lbnRFbmdpbmUuanMiLCIuLi8uLi9kaXN0L2luZGV4LmpzIiwiLi4vLi4vZGlzdC9tYXN0ZXJzL1BsYXlDb250cm9sLmpzIiwiLi4vLi4vZGlzdC9tYXN0ZXJzL1RyYW5zcG9ydC5qcyIsIi4uLy4uL2Rpc3QvbWFzdGVycy9mYWN0b3JpZXMuanMiLCJkaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2NvbXBvbmVudHMvQmFzZUNvbXBvbmVudC5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL0RyYWdBbmREcm9wLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2NvbXBvbmVudHMvR3JvdXAuanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvY29tcG9uZW50cy9OdW1iZXJCb3guanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvY29tcG9uZW50cy9TZWxlY3RCdXR0b25zLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2NvbXBvbmVudHMvU2VsZWN0TGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1NsaWRlci5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1RleHQuanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvY29tcG9uZW50cy9UaXRsZS5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1RvZ2dsZS5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1RyaWdnZXJCdXR0b25zLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2ZhY3RvcnkuanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvbWl4aW5zL2NvbnRhaW5lci5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9taXhpbnMvZGlzcGxheS5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC91dGlscy9lbGVtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC91dGlscy9zdHlsZXMtZGVjbGFyYXRpb25zLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L3V0aWxzL3N0eWxlcy5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvcGFja2FnZS5qc29uIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9ndWktY29tcG9uZW50cy9kaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvbWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY3JlYXRlQ2xhc3MuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2luaGVyaXRzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL21hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1wcm90b3R5cGUtb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1pbnN0YW5jZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1mcm9tLWl0ZXJhYmxlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktbWV0aG9kcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktc3BlY2llcy1jb25zdHJ1Y3Rvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYXJyYXktc3BlY2llcy1jcmVhdGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NsYXNzb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi1zdHJvbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvbGxlY3Rpb24tdG8tanNvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY3R4LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kZWZpbmVkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kZXNjcmlwdG9ycy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZG9tLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZW51bS1rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19leHBvcnQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2ZhaWxzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19mb3Itb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2dsb2JhbC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGFzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oaWRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19odG1sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pZTgtZG9tLWRlZmluZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtYXJyYXktaXRlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtYXJyYXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jYWxsLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1kZWZpbmUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItc3RlcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlcmF0b3JzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19saWJyYXJ5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19tZXRhLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtY3JlYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHAuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcHMuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wbi1leHQuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdwby5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1rZXlzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtcGllLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qtc2FwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19yZWRlZmluZS1hbGwuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtY29sbGVjdGlvbi1mcm9tLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtY29sbGVjdGlvbi1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXByb3RvLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtc3BlY2llcy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXRvLXN0cmluZy10YWcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC1rZXkuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc3RyaW5nLWF0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1hYnNvbHV0ZS1pbmRleC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW50ZWdlci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tbGVuZ3RoLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1vYmplY3QuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdWlkLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL192YWxpZGF0ZS1jb2xsZWN0aW9uLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MtZGVmaW5lLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MtZXh0LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL193a3MuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYubWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuY3JlYXRlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZGVmaW5lLXByb3BlcnR5LmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3ltYm9sLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAuZnJvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcubWFwLm9mLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcuc3ltYm9sLmFzeW5jLWl0ZXJhdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zeW1ib2wub2JzZXJ2YWJsZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9kaXN0L2NvcmUvUHJpb3JpdHlRdWV1ZS5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvZGlzdC9jb3JlL1NjaGVkdWxpbmdRdWV1ZS5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvZGlzdC9jb3JlL1RpbWVFbmdpbmUuanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL2Rpc3QvaW5kZXguanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL2Rpc3QvbWFzdGVycy9QbGF5Q29udHJvbC5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvZGlzdC9tYXN0ZXJzL1NjaGVkdWxlci5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvZGlzdC9tYXN0ZXJzL1NpbXBsZVNjaGVkdWxlci5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvZGlzdC9tYXN0ZXJzL1RyYW5zcG9ydC5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9nZXQtaXRlcmF0b3IuanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zZXQuanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvZ2V0LmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvci5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3NldC5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc2V0LmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnNldC5mcm9tLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnNldC5vZi5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zZXQudG8tanNvbi5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvbXMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBOztBQUNBOzs7Ozs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW1CTSxlOzs7QUFDSiw2QkFBZ0Q7QUFBQSxRQUFwQyxZQUFvQyx1RUFBckIsc0JBQXFCO0FBQUE7O0FBRzlDOzs7Ozs7OztBQUg4Qzs7QUFXOUMsVUFBSyxZQUFMLEdBQW9CLFlBQXBCOztBQUVBOzs7Ozs7Ozs7QUFTQSxVQUFLLFVBQUwsR0FBa0IsSUFBbEI7QUF0QjhDO0FBdUIvQzs7QUFFRDs7Ozs7Ozs7OzRCQUtRLE0sRUFBUTtBQUNkLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixNQUF4QjtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7K0JBTVcsVSxFQUFZO0FBQ3JCLFdBQUssVUFBTCxDQUFnQixVQUFoQixDQUEyQixVQUEzQjtBQUNBLGFBQU8sSUFBUDtBQUNEOzs7RUE3QzJCLHdCOztrQkFnRGYsZTs7Ozs7Ozs7QUN0RWYsSUFBTSxlQUFlLE9BQU8sWUFBUCxJQUF1QixPQUFPLGtCQUFuRDs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsSUFBSSxlQUFlLElBQW5COztBQUVBLElBQUksWUFBSixFQUNFLGVBQWUsSUFBSSxZQUFKLEVBQWY7O2tCQUVhLFk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdEJmOzs7Ozs7QUFFQSxTQUFTLFFBQVQsQ0FBa0IsR0FBbEIsRUFBdUIsR0FBdkIsRUFBNEI7QUFDMUIsTUFBSSxRQUFRLFNBQVosRUFDRSxPQUFPLEdBQVA7O0FBRUYsU0FBTyxHQUFQO0FB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2RBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFRpbWVFbmdpbmUgfSBmcm9tICd3YXZlcy1tYXN0ZXJzJztcbmltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4vYXVkaW9Db250ZXh0JztcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBhbGwgYXVkaW8gcmVsYXRlZCB0aW1lIGVuZ2luZSBjb21wb25lbnRzLiBJdCBpc1xuICogdXNlZCB0byBoYW5kbGUgYXVkaW8gcmVsYXRlZCBldmVudHMgc3VjaCBhcyB0aGUgcGxheWJhY2sgb2YgYSBtZWRpYSBzdHJlYW0uXG4gKiBJdCBleHRlbmRzIHRoZSBUaW1lRW5naW5lIGNsYXNzIGJ5IHRoZSBzdGFuZGFyZCB3ZWIgYXVkaW8gbm9kZSBtZXRob2RzXG4gKiBjb25uZWN0IGFuZCBkaXNjb25uZWN0LlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvYXVkaW8tdGltZS1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqXG4gKiBjbGFzcyBNeUVuZ2luZSBleHRlbmRzIGF1ZGlvLkF1ZGlvVGltZUVuZ2luZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHN1cGVyKCk7XG4gKiAgICAgLy8gLi4uXG4gKiAgIH1cbiAqIH1cbiAqL1xuY2xhc3MgQXVkaW9UaW1lRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gY29udGV4dCB1c2VkIGJ5IHRoZSBUaW1lRW5naW5lLCBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYXVkaW9Db250ZXh0XG4gICAgICpcbiAgICAgKiBAbmFtZSBhdWRpb0NvbnRleHRcbiAgICAgKiBAdHlwZSBBdWRpb0NvbnRleHRcbiAgICAgKiBAbWVtYmVyb2YgQXVkaW9UaW1lRW5naW5lXG4gICAgICogQHNlZSBhdWRpb0NvbnRleHRcbiAgICAgKi9cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcblxuICAgIC8qKlxuICAgICAqIE91dHB1dCBhdWRpbyBub2RlLiBCeSBkZWZhdWx0IHRoZSBjb25uZWN0IG1ldGhvZCBjb25uZWN0cyBhIGdpdmVuIG5vZGVcbiAgICAgKiB0byB0aGlzIG91dHB1dCBub2RlLlxuICAgICAqXG4gICAgICogQG5hbWUgb3V0cHV0Tm9kZVxuICAgICAqIEB0eXBlIEF1ZGlvTm9kZVxuICAgICAqIEBtZW1iZXJvZiBBdWRpb1RpbWVFbmdpbmVcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgdGhpcy5vdXRwdXROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIGFuIGF1ZGlvIG5vZGUgKGUuZy4gYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuICAgKlxuICAgKiBAcGFyYW0ge0F1ZGlvTm9kZX0gdGFyZ2V0IC0gVGFyZ2V0IGF1ZGlvIG5vZGVcbiAgICovXG4gIGNvbm5lY3QodGFyZ2V0KSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmNvbm5lY3QodGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGZyb20gYW4gYXVkaW8gbm9kZSAoZS5nLiBhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pLiBJZiB1bmRlZmluZWRcbiAgICogZGlzY29ubmVjdCBmcm9tIGFsbCB0YXJnZXQgbm9kZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXVkaW9Ob2RlfSB0YXJnZXQgLSBUYXJnZXQgYXVkaW8gbm9kZS5cbiAgICovXG4gIGRpc2Nvbm5lY3QoY29ubmVjdGlvbikge1xuICAgIHRoaXMub3V0cHV0Tm9kZS5kaXNjb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF1ZGlvVGltZUVuZ2luZTtcbiIsImNvbnN0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuLyoqXG4gKiBFeHBvc2UgYSB1bmlxdWUgYXVkaW8gY29udGV4dCBzaW5nbGV0b24gYXMgdGhlIGRlZmF1bHQgYXVkaW9cbiAqIGNvbnRleHQgdXNlZCBieSB0aGUgY29tcG9uZW50cyBvZiB0aGUgV2F2ZXMgQXVkaW8gbGlicmFyeSBhbmRcbiAqIGFwcGxpY2F0aW9ucyB1c2luZyB0aGUgbGlicmFyeS5cbiAqXG4gKiBAdHlwZSBBdWRpb0NvbnRleHRcbiAqIEBuYW1lIGF1ZGlvQ29udGV4dFxuICogQGNvbnN0YW50XG4gKiBAZ2xvYmFsXG4gKiBAaW5zdGFuY2VcbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3QgYXVkaW9Db250ZXh0ID0gYXVkaW8uYXVkaW9Db250ZXh0O1xuICovXG5sZXQgYXVkaW9Db250ZXh0ID0gbnVsbDtcblxuaWYgKEF1ZGlvQ29udGV4dClcbiAgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5leHBvcnQgZGVmYXVsdCBhdWRpb0NvbnRleHQ7XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvQXVkaW9UaW1lRW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYgKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuXG4vKipcbiAqIEdyYW51bGFyIHN5bnRoZXNpcyBUaW1lRW5naW5lIGltcGxlbWVudGluZyB0aGUgc2NoZWR1bGVkIGludGVyZmFjZS5cbiAqIFRoZSBncmFpbiBwb3NpdGlvbiAoZ3JhaW4gb25zZXQgb3IgY2VudGVyIHRpbWUgaW4gdGhlIGF1ZGlvIGJ1ZmZlcikgaXNcbiAqIG9wdGlvbmFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgZW5naW5lJ3MgY3VycmVudFBvc2l0aW9uIGF0dHJpYnV0ZS5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgYSBgR3JhbnVsYXJFbmdpbmVgICh3aXRoIGEgZmV3IHBhcmFtZXRlciBjb250cm9scykgZHJpdmVuXG4gKiBieSBhIGBTY2hlZHVsZXJgIGFuZCBhIGBQbGF5Q29udHJvbGA6XG4gKiB7QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL2dyYW51bGFyLWVuZ2luZS5odG1sfVxuICpcbiAqIEBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZVxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHNjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuICogY29uc3QgZ3JhbnVsYXJFbmdpbmUgPSBuZXcgYXVkaW8uR3JhbnVsYXJFbmdpbmUoKTtcbiAqXG4gKiBzY2hlZHVsZXIuYWRkKGdyYW51bGFyRW5naW5lKTtcbiAqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnM9e30gLSBQYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge0F1ZGlvQnVmZmVyfSBbb3B0aW9ucy5idWZmZXI9bnVsbF0gLSBBdWRpbyBidWZmZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RBYnM9MC4wMV0gLSBBYnNvbHV0ZSBncmFpbiBwZXJpb2QgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kUmVsPTBdIC0gR3JhaW4gcGVyaW9kIHJlbGF0aXZlIHRvIGFic29sdXRlXG4gKiAgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RWYXI9MF0gLSBBbW91dCBvZiByYW5kb20gZ3JhaW4gcGVyaW9kXG4gKiAgdmFyaWF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZE1pbj0wLjAwMV0gLSBNaW5pbXVtIGdyYWluIHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uPTBdIC0gR3JhaW4gcG9zaXRpb24gKG9uc2V0IHRpbWUgaW4gYXVkaW9cbiAqICBidWZmZXIpIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uVmFyPTAuMDAzXSAtIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwb3NpdGlvblxuICogIHZhcmlhdGlvbiBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvbkFicz0wLjFdIC0gQWJzb2x1dGUgZ3JhaW4gZHVyYXRpb24gaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHVyYXRpb25SZWw9MF0gLSBHcmFpbiBkdXJhdGlvbiByZWxhdGl2ZSB0byBncmFpblxuICogIHBlcmlvZCAob3ZlcmxhcClcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5hdHRhY2tBYnM9MF0gLSBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5hdHRhY2tSZWw9MC41XSAtIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuYXR0YWNrU2hhcGU9J2xpbiddIC0gU2hhcGUgb2YgYXR0YWNrXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZUFicz0wXSAtIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlUmVsPTAuNV0gLSBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlU2hhcGU9J2xpbiddIC0gU2hhcGUgb2YgcmVsZWFzZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmV4cFJhbXBPZmZzZXQ9MC4wMDAxXSAtIE9mZnNldCAoc3RhcnQvZW5kIHZhbHVlKVxuICogIGZvciBleHBvbmVudGlhbCBhdHRhY2svcmVsZWFzZVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnJlc2FtcGxpbmc9MF0gLSBHcmFpbiByZXNhbXBsaW5nIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZXNhbXBsaW5nVmFyPTBdIC0gQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gTGluZWFyIGdhaW4gZmFjdG9yXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmNlbnRlcmVkPXRydWVdIC0gV2hldGhlciB0aGUgZ3JhaW4gcG9zaXRpb24gcmVmZXJzXG4gKiAgdG8gdGhlIGNlbnRlciBvZiB0aGUgZ3JhaW4gKG9yIHRoZSBiZWdpbm5pbmcpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmN5Y2xpYz1mYWxzZV0gLSBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIGdyYWluXG4gKiAgcG9zaXRpb24gYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbj0wXSAtIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGVcbiAqICBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAqL1xuY2xhc3MgR3JhbnVsYXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKlxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKiBAbmFtZSBidWZmZXJcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBwZXJpb2QgaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBlcmlvZEFic1xuICAgICAqIEBkZWZhdWx0IDAuMDFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwLjAxKTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBlcmlvZCByZWxhdGl2ZSB0byBhYnNvbHV0ZSBkdXJhdGlvblxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RSZWxcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RSZWwgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2RcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kVmFyXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBncmFpbiBwZXJpb2RcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kTWluXG4gICAgICogQGRlZmF1bHQgMC4wMDFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZE1pbiA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kTWluLCAwLjAwMSk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBwb3NpdGlvbiAob25zZXQgdGltZSBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwb3NpdGlvblxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvbiwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwb3NpdGlvblZhclxuICAgICAqIEBkZWZhdWx0IDAuMDAzXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvblZhciA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25WYXIsIDAuMDAzKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIGR1cmF0aW9uIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBkdXJhdGlvbkFic1xuICAgICAqIEBkZWZhdWx0IDAuMVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BYnMgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uQWJzLCAwLjEpOyAvLyBhYnNvbHV0ZSBncmFpbiBkdXJhdGlvblxuXG4gICAgLyoqXG4gICAgICogR3JhaW4gZHVyYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kIChvdmVybGFwKVxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBkdXJhdGlvblJlbFxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uUmVsID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvblJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgYXR0YWNrQWJzXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrQWJzID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tBYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNrIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgYXR0YWNrUmVsXG4gICAgICogQGRlZmF1bHQgMC41XG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tSZWwgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1JlbCwgMC41KTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIGF0dGFjayAoJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWwgcmFtcClcbiAgICAgKlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgYXR0YWNrU2hhcGVcbiAgICAgKiBAZGVmYXVsdCAnbGluJ1xuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrU2hhcGUgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1NoYXBlLCAnbGluJyk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHJlbGVhc2VBYnNcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlQWJzID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSByZWxlYXNlUmVsXG4gICAgICogQGRlZmF1bHQgMC41XG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlUmVsID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlUmVsLCAwLjUpO1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgcmVsZWFzZSAoJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWwgcmFtcClcbiAgICAgKlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgcmVsZWFzZVNoYXBlXG4gICAgICogQGRlZmF1bHQgJ2xpbidcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VTaGFwZSA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVNoYXBlLCAnbGluJyk7XG5cbiAgICAvKipcbiAgICAgKiBPZmZzZXQgKHN0YXJ0L2VuZCB2YWx1ZSkgZm9yIGV4cG9uZW50aWFsIGF0dGFjay9yZWxlYXNlXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGV4cFJhbXBPZmZzZXRcbiAgICAgKiBAZGVmYXVsdCAwLjAwMDFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmV4cFJhbXBPZmZzZXQgPSBvcHRPckRlZihvcHRpb25zLmV4cFJhbXBPZmZzZXQsIDAuMDAwMSk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiByZXNhbXBsaW5nIGluIGNlbnRcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1xuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmcgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmcsIDApO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1ZhclxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmdWYXIgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmdWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTGluZWFyIGdhaW4gZmFjdG9yXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGdhaW5cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5nYWluID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGdyYWluIHBvc2l0aW9uIHJlZmVycyB0byB0aGUgY2VudGVyIG9mIHRoZSBncmFpbiAob3IgdGhlIGJlZ2lubmluZylcbiAgICAgKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBuYW1lIGNlbnRlcmVkXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY2VudGVyZWQgPSBvcHRPckRlZihvcHRpb25zLmNlbnRlcmVkLCB0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgZ3JhaW4gcG9zaXRpb24gYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbmFtZSBjeWNsaWNcbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcblxuICAgIC8qKlxuICAgICAqIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyIHRoYXQgaGFzIGJlZW4gY29waWVkIGZyb20gdGhlXG4gICAgICogYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgd3JhcEFyb3VuZEV4dGVuc2lvblxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBidWZmZXJEdXJhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLndyYXBBcm91bmRFeHRlbnNpb24pXG4gICAgICAgIGJ1ZmZlckR1cmF0aW9uIC09IHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbjtcblxuICAgICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgcG9zaXRpb25cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgY3VycmVudFBvc2l0aW9uXG4gICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aW1lID0gTWF0aC5tYXgodGltZSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBncmFpbi4gVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGF0IGFueSB0aW1lICh3aGV0aGVyIHRoZVxuICAgKiBlbmdpbmUgaXMgc2NoZWR1bGVkIG9yIG5vdCkgdG8gZ2VuZXJhdGUgYSBzaW5nbGUgZ3JhaW4gYWNjb3JkaW5nIHRvIHRoZVxuICAgKiBjdXJyZW50IGdyYWluIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gZ3JhaW4gc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIHBlcmlvZCB0byBuZXh0IGdyYWluXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGdyYWluVGltZSA9IHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIHZhciBncmFpblBlcmlvZCA9IHRoaXMucGVyaW9kQWJzO1xuICAgIHZhciBncmFpblBvc2l0aW9uID0gdGhpcy5jdXJyZW50UG9zaXRpb247XG4gICAgdmFyIGdyYWluRHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSByZXNhbXBsaW5nXG4gICAgICBpZiAodGhpcy5yZXNhbXBsaW5nICE9PSAwIHx8IHRoaXMucmVzYW1wbGluZ1ZhciA+IDApIHtcbiAgICAgICAgdmFyIHJhbmRvbVJlc2FtcGxpbmcgPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAyLjAgKiB0aGlzLnJlc2FtcGxpbmdWYXI7XG4gICAgICAgIHJlc2FtcGxpbmdSYXRlID0gTWF0aC5wb3coMi4wLCAodGhpcy5yZXNhbXBsaW5nICsgcmFuZG9tUmVzYW1wbGluZykgLyAxMjAwLjApO1xuICAgICAgfVxuXG4gICAgICBncmFpblBlcmlvZCArPSB0aGlzLnBlcmlvZFJlbCAqIGdyYWluRHVyYXRpb247XG4gICAgICBncmFpbkR1cmF0aW9uICs9IHRoaXMuZHVyYXRpb25SZWwgKiBncmFpblBlcmlvZDtcblxuICAgICAgLy8gZ3JhaW4gcGVyaW9kIHJhbmRvbiB2YXJpYXRpb25cbiAgICAgIGlmICh0aGlzLnBlcmlvZFZhciA+IDAuMClcbiAgICAgICAgZ3JhaW5QZXJpb2QgKz0gMi4wICogKE1hdGgucmFuZG9tKCkgLSAwLjUpICogdGhpcy5wZXJpb2RWYXIgKiBncmFpblBlcmlvZDtcblxuICAgICAgLy8gY2VudGVyIGdyYWluXG4gICAgICBpZiAodGhpcy5jZW50ZXJlZClcbiAgICAgICAgZ3JhaW5Qb3NpdGlvbiAtPSAwLjUgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAvLyByYW5kb21pemUgZ3JhaW4gcG9zaXRpb25cbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uVmFyID4gMClcbiAgICAgICAgZ3JhaW5Qb3NpdGlvbiArPSAoMi4wICogTWF0aC5yYW5kb20oKSAtIDEpICogdGhpcy5wb3NpdGlvblZhcjtcblxuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgLy8gd3JhcCBvciBjbGlwIGdyYWluIHBvc2l0aW9uIGFuZCBkdXJhdGlvbiBpbnRvIGJ1ZmZlciBkdXJhdGlvblxuICAgICAgaWYgKGdyYWluUG9zaXRpb24gPCAwIHx8IGdyYWluUG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICAgICAgdmFyIGN5Y2xlcyA9IGdyYWluUG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgICBncmFpblBvc2l0aW9uID0gKGN5Y2xlcyAtIE1hdGguZmxvb3IoY3ljbGVzKSkgKiBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uICsgZ3JhaW5EdXJhdGlvbiA+IHRoaXMuYnVmZmVyLmR1cmF0aW9uKVxuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgIGdyYWluVGltZSAtPSBncmFpblBvc2l0aW9uO1xuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiArPSBncmFpblBvc2l0aW9uO1xuICAgICAgICAgICAgZ3JhaW5Qb3NpdGlvbiA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gKyBncmFpbkR1cmF0aW9uID4gYnVmZmVyRHVyYXRpb24pXG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uID0gYnVmZmVyRHVyYXRpb24gLSBncmFpblBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1ha2UgZ3JhaW5cbiAgICAgIGlmICh0aGlzLmdhaW4gPiAwICYmIGdyYWluRHVyYXRpb24gPj0gMC4wMDEpIHtcbiAgICAgICAgLy8gbWFrZSBncmFpbiBlbnZlbG9wZVxuICAgICAgICB2YXIgZW52ZWxvcGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB2YXIgYXR0YWNrID0gdGhpcy5hdHRhY2tBYnMgKyB0aGlzLmF0dGFja1JlbCAqIGdyYWluRHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlID0gdGhpcy5yZWxlYXNlQWJzICsgdGhpcy5yZWxlYXNlUmVsICogZ3JhaW5EdXJhdGlvbjtcblxuICAgICAgICBpZiAoYXR0YWNrICsgcmVsZWFzZSA+IGdyYWluRHVyYXRpb24pIHtcbiAgICAgICAgICB2YXIgZmFjdG9yID0gZ3JhaW5EdXJhdGlvbiAvIChhdHRhY2sgKyByZWxlYXNlKTtcbiAgICAgICAgICBhdHRhY2sgKj0gZmFjdG9yO1xuICAgICAgICAgIHJlbGVhc2UgKj0gZmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGFja0VuZFRpbWUgPSBncmFpblRpbWUgKyBhdHRhY2s7XG4gICAgICAgIHZhciBncmFpbkVuZFRpbWUgPSBncmFpblRpbWUgKyBncmFpbkR1cmF0aW9uIC8gcmVzYW1wbGluZ1JhdGU7XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gZ3JhaW5FbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLnZhbHVlID0gMDtcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2tTaGFwZSA9PT0gJ2xpbicpIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuMCwgZ3JhaW5UaW1lKTtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVsZWFzZVN0YXJ0VGltZSA+IGF0dGFja0VuZFRpbWUpXG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmdhaW4sIHJlbGVhc2VTdGFydFRpbWUpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbGVhc2VTaGFwZSA9PT0gJ2xpbicpIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5leHBSYW1wT2Zmc2V0LCBncmFpbkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZW52ZWxvcGUuY29ubmVjdCh0aGlzLm91dHB1dE5vZGUpO1xuXG4gICAgICAgIC8vIG1ha2Ugc291cmNlXG4gICAgICAgIHZhciBzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gcmVzYW1wbGluZ1JhdGU7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KGVudmVsb3BlKTtcblxuICAgICAgICBzb3VyY2Uuc3RhcnQoZ3JhaW5UaW1lLCBncmFpblBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3AoZ3JhaW5FbmRUaW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5wZXJpb2RNaW4sIGdyYWluUGVyaW9kKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFudWxhckVuZ2luZTtcbiIsImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9BdWRpb1RpbWVFbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogTWV0cm9ub21lIGF1ZGlvIGVuZ2luZS4gSXQgZXh0ZW5kcyBUaW1lIEVuZ2luZSBhcyBhIHRyYW5zcG9ydGVkIGludGVyZmFjZS5cbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvbWV0cm9ub21lLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3Qgc2NoZWR1bGVyID0gYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG4gKiBjb25zdCBtZXRyb25vbWUgPSBuZXcgYXVkaW8uTWV0cm9ub21lKHtwZXJpb2Q6IDAuMzMzfSk7XG4gKlxuICogc2NoZWR1bGVyLmFkZChtZXRyb25vbWUpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2Q9MV0gLSBNZXRyb25vbWUgcGVyaW9kXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tGcmVxPTYwMF0gLSBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tBdHRhY2s9MC4wMDJdIC0gTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tSZWxlYXNlPTAuMDk4XSAtIE1ldHJvbm9tZSBjbGljayByZWxlYXNlIHRpbWVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gR2FpblxuICovXG5jbGFzcyBNZXRyb25vbWUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX19wZXJpb2QgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja0ZyZXFcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrRnJlcSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tGcmVxLCA2MDApO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja0F0dGFja1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tBdHRhY2sgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrQXR0YWNrLCAwLjAwMik7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja1JlbGVhc2VcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrUmVsZWFzZSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tSZWxlYXNlLCAwLjA5OCk7XG5cbiAgICB0aGlzLl9fbGFzdFRpbWUgPSAwO1xuICAgIHRoaXMuX19waGFzZSA9IDA7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19wZXJpb2QgPiAwKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gKE1hdGguZmxvb3IocG9zaXRpb24gLyB0aGlzLl9fcGVyaW9kKSArIHRoaXMuX19waGFzZSkgKiB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICBpZiAoc3BlZWQgPiAwICYmIG5leHRQb3NpdGlvbiA8IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gKz0gdGhpcy5fX3BlcmlvZDtcbiAgICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBuZXh0UG9zaXRpb24gPiBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uIC09IHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMuX19wZXJpb2Q7XG5cbiAgICByZXR1cm4gcG9zaXRpb24gKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgY2xpY2tBdHRhY2sgPSB0aGlzLmNsaWNrQXR0YWNrO1xuICAgIGNvbnN0IGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuXG4gICAgY29uc3QgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBlbnYuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIHRpbWUgKyBjbGlja0F0dGFjayk7XG4gICAgZW52LmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgIGNvbnN0IG9zYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuY2xpY2tGcmVxO1xuICAgIG9zYy5zdGFydCh0aW1lKTtcbiAgICBvc2Muc3RvcCh0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIG9zYy5jb25uZWN0KGVudik7XG4gIH1cblxuICAvKipcbiAgICogbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGdhaW5cbiAgICogQG1lbWJlcm9mIE1ldHJvbm9tZVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBtZXRyb25vbWUgcGVyaW9kXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHBlcmlvZFxuICAgKiBAbWVtYmVyb2YgTWV0cm9ub21lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IHBlcmlvZChwZXJpb2QpIHtcbiAgICB0aGlzLl9fcGVyaW9kID0gcGVyaW9kO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyKSB7XG4gICAgICBpZiAobWFzdGVyLnJlc2V0RW5naW5lVGltZSlcbiAgICAgICAgbWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aGlzLl9fbGFzdFRpbWUgKyBwZXJpb2QpO1xuICAgICAgZWxzZSBpZiAobWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24pXG4gICAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBwZXJpb2QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBoYXNlIHBhcmFtZXRlciAoYXZhaWxhYmxlIG9ubHkgd2hlbiAndHJhbnNwb3J0ZWQnKSwgc2hvdWxkIGJlXG4gICAqIGJldHdlZW4gWzAsIDFbXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHBoYXNlXG4gICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgcGhhc2UocGhhc2UpIHtcbiAgICB0aGlzLl9fcGhhc2UgPSBwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgfVxuXG4gIGdldCBwaGFzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BoYXNlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1ldHJvbm9tZTtcbiIsImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9BdWRpb1RpbWVFbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogVXNlZCB3aXRoIGEgYnVmZmVyIHRvIHNlcnZlIGF1ZGlvIGZpbGVzLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvcGxheWVyLWVuZ2luZS5odG1sfVxuICpcbiAqIEBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZVxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHBsYXllckVuZ2luZSA9IGF1ZGlvLlBsYXllckVuZ2luZSgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgYXVkaW8uUGxheUNvbnRyb2wocGxheWVyRW5naW5lKTtcbiAqXG4gKiBwbGF5Q29udHJvbC5zdGFydCgpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5idWZmZXI9MV0gLSBBdWRpbyBidWZmZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5mYWRlVGltZT02MDBdIC0gRmFkZSB0aW1lIGZvciBjaGFpbmluZyBzZWdtZW50c1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmN5Y2xpYz1mYWxzZV0gLSBMb29wIG1vZGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gR2FpblxuICovXG5jbGFzcyBQbGF5ZXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLnRyYW5zcG9ydCA9IG51bGw7IC8vIHNldCB3aGVuIGFkZGVkIHRvIHRyYW5zcG9ydGVyXG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKlxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKiBAbmFtZSBidWZmZXJcbiAgICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogRmFkZSB0aW1lIGZvciBjaGFpbmluZyBzZWdtZW50cyAoZS5nLiBpbiBzdGFydCwgc3RvcCwgYW5kIHNlZWspXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGZhZGVUaW1lXG4gICAgICogQG1lbWJlcm9mIFBsYXllckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICovXG4gICAgdGhpcy5mYWRlVGltZSA9IG9wdE9yRGVmKG9wdGlvbnMuZmFkZVRpbWUsIDAuMDA1KTtcblxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5fX2N5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBfX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLl9fY3ljbGljICYmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pKSB7XG4gICAgICAgIHZhciBwaGFzZSA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHBvc2l0aW9uID0gKHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSkpICogYnVmZmVyRHVyYXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA+PSAwICYmIHBvc2l0aW9uIDwgYnVmZmVyRHVyYXRpb24gJiYgc3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmNvbm5lY3QodGhpcy5fX2dhaW5Ob2RlKTtcblxuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNwZWVkO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3AgPSB0aGlzLl9fY3ljbGljO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IDA7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcEVuZCA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0YXJ0KHRpbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMuX19lbnZOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX2hhbHQodGltZSkge1xuICAgIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5fX2Vudk5vZGUuZ2Fpbi52YWx1ZSwgdGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RvcCh0aW1lICsgdGhpcy5mYWRlVGltZSk7XG5cbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgICAgdGhpcy5fX2Vudk5vZGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmIChzZWVrIHx8IGxhc3RTcGVlZCAqIHNwZWVkIDwgMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCB8fCBzZWVrKSB7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShzcGVlZCwgdGltZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEB0eXBlIHtCb29sfVxuICAgKiBAbmFtZSBjeWNsaWNcbiAgICogQG1lbWJlcm9mIFBsYXllckVuZ2luZVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBjeWNsaWMoY3ljbGljKSB7XG4gICAgaWYgKGN5Y2xpYyAhPT0gdGhpcy5fX2N5Y2xpYykge1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jdXJyZW50b3NpdGlvbjtcblxuICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICB0aGlzLl9fY3ljbGljID0gY3ljbGljO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN5Y2xpYygpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N5Y2xpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgZ2FpblxuICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuc2V0VmFsdWVBdFRpbWUodGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gIH1cblxuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvblxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBidWZmZXJEdXJhdGlvblxuICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZih0aGlzLmJ1ZmZlcilcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgIHJldHVybiAwO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckVuZ2luZTtcbiIsImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9BdWRpb1RpbWVFbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZiAob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHNvcnRlZEFycmF5LCB2YWx1ZSwgaW5kZXggPSAtMSkge1xuICB2YXIgc2l6ZSA9IHNvcnRlZEFycmF5Lmxlbmd0aDtcblxuICBpZiAoc2l6ZSA+IDApIHtcbiAgICB2YXIgZmlyc3RWYWwgPSBzb3J0ZWRBcnJheVswXTtcbiAgICB2YXIgbGFzdFZhbCA9IHNvcnRlZEFycmF5W3NpemUgLSAxXTtcblxuICAgIGlmICh2YWx1ZSA8IGZpcnN0VmFsKVxuICAgICAgaW5kZXggPSAtMTtcbiAgICBlbHNlIGlmICh2YWx1ZSA+PSBsYXN0VmFsKVxuICAgICAgaW5kZXggPSBzaXplIC0gMTtcbiAgICBlbHNlIHtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gc2l6ZSlcbiAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKChzaXplIC0gMSkgKiAodmFsdWUgLSBmaXJzdFZhbCkgLyAobGFzdFZhbCAtIGZpcnN0VmFsKSk7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleF0gPiB2YWx1ZSlcbiAgICAgICAgaW5kZXgtLTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4ICsgMV0gPD0gdmFsdWUpXG4gICAgICAgIGluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50T3JOZXh0SW5kZXgoc29ydGVkQXJyYXksIHZhbHVlLCBpbmRleCA9IC0xKSB7XG4gIHZhciBzaXplID0gc29ydGVkQXJyYXkubGVuZ3RoO1xuXG4gIGlmIChzaXplID4gMCkge1xuICAgIHZhciBmaXJzdFZhbCA9IHNvcnRlZEFycmF5WzBdO1xuICAgIHZhciBsYXN0VmFsID0gc29ydGVkQXJyYXlbc2l6ZSAtIDFdO1xuXG4gICAgaWYgKHZhbHVlIDw9IGZpcnN0VmFsKVxuICAgICAgaW5kZXggPSAwO1xuICAgIGVsc2UgaWYgKHZhbHVlID49IGxhc3RWYWwpXG4gICAgICBpbmRleCA9IHNpemU7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHNpemUpXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigoc2l6ZSAtIDEpICogKHZhbHVlIC0gZmlyc3RWYWwpIC8gKGxhc3RWYWwgLSBmaXJzdFZhbCkpO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXhdIDwgdmFsdWUpXG4gICAgICAgIGluZGV4Kys7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleCAtIDFdID49IHZhbHVlKVxuICAgICAgICBpbmRleC0tO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn1cblxuLyoqXG4gKiBVc2VkIHdpdGggYSBidWZmZXIgdG8gc2VydmUgYXVkaW8gZmlsZXMgdmlhIGdyYW51bGFyIHN5bnRoZXNpcy5cbiAqXG4gKiBUaGUgZW5naW5lIGltcGxlbWVudHMgdGhlIFwic2NoZWR1bGVkXCIgYW5kIFwidHJhbnNwb3J0ZWRcIiBpbnRlcmZhY2VzLlxuICogV2hlbiBcInNjaGVkdWxlZFwiLCB0aGUgZW5naW5lICBnZW5lcmF0ZXMgc2VnbWVudHMgbW9yZSBvciBsZXNzwqBwZXJpb2RpY2FsbHlcbiAqIChjb250cm9sbGVkIGJ5IHRoZSBwZXJpb2RBYnMsIHBlcmlvZFJlbCwgYW5kIHBlcmlvVmFyIGF0dHJpYnV0ZXMpLlxuICogV2hlbiBcInRyYW5zcG9ydGVkXCIsIHRoZSBlbmdpbmUgZ2VuZXJhdGVzIHNlZ21lbnRzIGF0IHRoZSBwb3NpdGlvbiBvZiB0aGVpciBvbnNldCB0aW1lLlxuICpcbiAqIEV4YW1wbGUgdGhhdCBzaG93cyBhIGBTZWdtZW50RW5naW5lYCB3aXRoIGEgZmV3IHBhcmFtZXRlciBjb250cm9scyBydW5uaW5nIGluIGEgYFNjaGVkdWxlcmAuXG4gKiB7QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL3NlZ21lbnQtZW5naW5lLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3Qgc2NoZWR1bGVyID0gYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG4gKiBjb25zdCBzZWdtZW50RW5naW5lID0gbmV3IGF1ZGlvLlNlZ21lbnRFbmdpbmUoKTtcbiAqXG4gKiBzY2hlZHVsZXIuYWRkKHNlZ21lbnRFbmdpbmUpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7QXVkaW9CdWZmZXJ9IFtvcHRpb25zLmJ1ZmZlcj1udWxsXSAtIEF1ZGlvIGJ1ZmZlclxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZEFicz0wXSAtIEFic29sdXRlIHNlZ21lbnQgcGVyaW9kIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZFJlbD0xXSAtIFNlZ21lbnQgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RWYXI9MF0gLSBBbW91dCBvZiByYW5kb20gc2VnbWVudCBwZXJpb2QgdmFyaWF0aW9uIHJlbGF0aXZlXG4gKiAgdG8gc2VnbWVudCBwZXJpb2RcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RNaW49MC4wMDFdIC0gTWluaW11bSBzZWdtZW50IHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uQXJyYXk9WzAuMF1dIC0gQXJyYXkgb2Ygc2VnbWVudCBwb3NpdGlvbnMgKG9uc2V0IHRpbWVzXG4gKiAgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wb3NpdGlvblZhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvbkFycmF5PVswLjBdXSAtIEFycmF5IG9mIHNlZ21lbnQgZHVyYXRpb25zIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uQWJzPTBdIC0gQWJzb2x1dGUgc2VnbWVudCBkdXJhdGlvbiBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvblJlbD0xXSAtIFNlZ21lbnQgZHVyYXRpb24gcmVsYXRpdmUgdG8gZ2l2ZW4gc2VnbWVudFxuICogIGR1cmF0aW9uIG9yIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb25zLm9mZnNldEFycmF5PVswLjBdXSAtIEFycmF5IG9mIHNlZ21lbnQgb2Zmc2V0cyBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5vZmZzZXRBYnM9LTAuMDA1XSAtIEFic29sdXRlIHNlZ21lbnQgb2Zmc2V0IGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm9mZnNldFJlbD0wXSAtIFNlZ21lbnQgb2Zmc2V0IHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kZWxheT0wLjAwNV0gLSBUaW1lIGJ5IHdoaWNoIGFsbCBzZWdtZW50cyBhcmUgZGVsYXllZCAoZXNwZWNpYWxseVxuICogIHRvIHJlYWxpemUgc2VnbWVudCBvZmZzZXRzKVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmF0dGFja0Ficz0wLjAwNV0gLSBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5hdHRhY2tSZWw9MF0gLSBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZUFicz0wLjAwNV0gLSBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZVJlbD0wXSAtIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVzYW1wbGluZz0wXSAtIFNlZ21lbnQgcmVzYW1wbGluZyBpbiBjZW50XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVzYW1wbGluZ1Zhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZ2Fpbj0xXSAtIExpbmVhciBnYWluIGZhY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmFib3J0VGltZT0wLjAwNV0gLSBmYWRlLW91dCB0aW1lIHdoZW4gYWJvcnRlZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnNlZ21lbnRJbmRleD0wXSAtIEluZGV4IG9mIHRoZSBzZWdtZW50IHRvIHN5bnRoZXNpemUgKGkuZS4gb2ZcbiAqICB0aGlzLnBvc2l0aW9uQXJyYXkvZHVyYXRpb25BcnJheS9vZmZzZXRBcnJheSlcbiAqIEBwYXJhbSB7Qm9vbH0gW29wdGlvbnMuY3ljbGljPWZhbHNlXSAtIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgc2VnbWVudCBpbmRpY2VzIGFyZVxuICogIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbj0wXSAtIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyXG4gKiAgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAqL1xuY2xhc3MgU2VnbWVudEVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEBuYW1lIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdE9yRGVmKG9wdGlvbnMuYnVmZmVyLCBudWxsKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgcGVyaW9kIGluIHNlY1xuICAgICAqIEBuYW1lIHBlcmlvZEFic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RBYnMgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZEFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHBlcmlvZCByZWxhdGl2ZSB0byBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICogQG5hbWUgcGVyaW9kUmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kUmVsLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmUgdG8gc2VnbWVudCBwZXJpb2RcbiAgICAgKiBAbmFtZSBwZXJpb2RWYXJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBzZWdtZW50IHBlcmlvZFxuICAgICAqIEBuYW1lIHBlcmlvZE1pblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMC4wMDFcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kTWluID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RNaW4sIDAuMDAxKTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHNlZ21lbnQgcG9zaXRpb25zIChvbnNldCB0aW1lcyBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqIEBuYW1lIHBvc2l0aW9uQXJyYXlcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IFswLjBdXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uQXJyYXkgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uQXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAgICAgKiBAbmFtZSBwb3NpdGlvblZhclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvblZhciA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25WYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBkdXJhdGlvbnMgaW4gc2VjXG4gICAgICogQG5hbWUgZHVyYXRpb25BcnJheVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgWzAuMF1cbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBkdXJhdGlvbiBpbiBzZWNcbiAgICAgKiBAbmFtZSBkdXJhdGlvbkFic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFicyA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBkdXJhdGlvbiByZWxhdGl2ZSB0byBnaXZlbiBzZWdtZW50IGR1cmF0aW9uIG9yIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAbmFtZSBkdXJhdGlvblJlbFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25SZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBvZmZzZXRzIGluIHNlY1xuICAgICAqXG4gICAgICogb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgKiBvZmZzZXQgPCAwOiB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvbiBpcyB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvblxuICAgICAqIGFuZCB0aGUgZHVyYXRpb24gaGFzIHRvIGJlIGNvcnJlY3RlZCBieSB0aGUgb2Zmc2V0XG4gICAgICpcbiAgICAgKiBAbmFtZSBvZmZzZXRBcnJheVxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBbMC4wXVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRBcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0QXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgb2Zmc2V0IGluIHNlY1xuICAgICAqIEBuYW1lIG9mZnNldEFic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgLTAuMDA1XG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldEFicyA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0QWJzLCAtMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBvZmZzZXQgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEBuYW1lIG9mZnNldFJlbFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRSZWwgPSBvcHRPckRlZihvcHRpb25zLm9mZnNldFJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBUaW1lIGJ5IHdoaWNoIGFsbCBzZWdtZW50cyBhcmUgZGVsYXllZCAoZXNwZWNpYWxseSB0byByZWFsaXplIHNlZ21lbnQgb2Zmc2V0cylcbiAgICAgKiBAbmFtZSBkZWxheVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMC4wMDVcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZGVsYXkgPSBvcHRPckRlZihvcHRpb25zLmRlbGF5LCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAgICAgKiBAbmFtZSBhdHRhY2tBYnNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja0FicyA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrQWJzLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQG5hbWUgYXR0YWNrUmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1JlbCA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAbmFtZSByZWxlYXNlQWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwNVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlQWJzID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlQWJzLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEBuYW1lIHJlbGVhc2VSZWxcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHJlc2FtcGxpbmcgaW4gY2VudFxuICAgICAqIEBuYW1lIHJlc2FtcGxpbmdcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqIEBuYW1lIHJlc2FtcGxpbmdWYXJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZ1ZhciA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZ1ZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICAgKiBAbmFtZSBnYWluXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmdhaW4gPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgLyoqXG4gICAgICogSW5kZXggb2YgdGhlIHNlZ21lbnQgdG8gc3ludGhlc2l6ZSAoaS5lLiBvZiB0aGlzLnBvc2l0aW9uQXJyYXkvZHVyYXRpb25BcnJheS9vZmZzZXRBcnJheSlcbiAgICAgKiBAbmFtZSBzZWdtZW50SW5kZXhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gb3B0T3JEZWYob3B0aW9ucy5zZWdtZW50SW5kZXgsIDApO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBzZWdtZW50IGluZGljZXMgYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICogQG5hbWUgY3ljbGljXG4gICAgICogQHR5cGUge0Jvb2x9XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gMDtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGxhc3Qgc2VnbWVudCBpcyBhYm9ydGVkIHdoZW4gdHJpZ2dlcmluZyB0aGUgbmV4dFxuICAgICAqIEBuYW1lIG1vbm9waG9uaWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm1vbm9waG9uaWMgPSBvcHRPckRlZihvcHRpb25zLm1vbm9waG9uaWMsIGZhbHNlKTtcbiAgICB0aGlzLl9fY3VycmVudFNyYyA9IG51bGw7XG4gICAgdGhpcy5fX2N1cnJlbnRFbnYgPSBudWxsO1xuICAgIHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lID0gMDtcbiAgICB0aGlzLl9fY3VycmVudEdhaW4gPSAwO1xuICAgIHRoaXMuX19jdXJyZW50RW5kVGltZSA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBGYWRlLW91dCB0aW1lICh3aGVuIGFib3J0ZWQpXG4gICAgICogQG5hbWUgYWJvcnRUaW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwNVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5hYm9ydFRpbWUgPSBvcHRPckRlZihvcHRpb25zLmFib3J0VGltZSwgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKiBAbmFtZSB3cmFwQXJvdW5kRXh0ZW5zaW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLndyYXBBcm91bmRFeHRlbnNpb24pXG4gICAgICAgIGJ1ZmZlckR1cmF0aW9uIC09IHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbjtcblxuICAgICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnRyaWdnZXIodGltZSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG4gICAgdmFyIGN5Y2xpY09mZnNldCA9IDA7XG4gICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgdmFyIGN5Y2xlcyA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIGN5Y2xpY09mZnNldCA9IE1hdGguZmxvb3IoY3ljbGVzKSAqIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgcG9zaXRpb24gLT0gY3ljbGljT2Zmc2V0O1xuICAgIH1cblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4ID0gZ2V0Q3VycmVudE9yTmV4dEluZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPj0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIGN5Y2xpY09mZnNldCArPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgaW5kZXggPSBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgIGN5Y2xpY09mZnNldCAtPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICB9XG5cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSBjeWNsaWNPZmZzZXQ7XG5cbiAgICByZXR1cm4gY3ljbGljT2Zmc2V0ICsgdGhpcy5wb3NpdGlvbkFycmF5W2luZGV4XTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcbiAgICB2YXIgY3ljbGljT2Zmc2V0ID0gdGhpcy5fX2N5Y2xpY09mZnNldDtcblxuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4Kys7XG5cbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgY3ljbGljT2Zmc2V0ICs9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4LS07XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgY3ljbGljT2Zmc2V0IC09IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gLUluZmluaXR5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IGN5Y2xpY09mZnNldDtcblxuICAgIHJldHVybiBjeWNsaWNPZmZzZXQgKyB0aGlzLnBvc2l0aW9uQXJyYXlbaW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBzZWdtZW50LlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQvdHJhbnNwb3J0ZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBzZWdtZW50IGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzZWdtZW50IHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHNlZ21lbnQgc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBwZXJpb2QgdG8gbmV4dCBzZWdtZW50XG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIHNlZ21lbnRUaW1lID0gKHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSArIHRoaXMuZGVsYXk7XG4gICAgdmFyIHNlZ21lbnRQZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgc2VnbWVudEluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBzZWdtZW50UG9zaXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudER1cmF0aW9uID0gMC4wO1xuICAgICAgdmFyIHNlZ21lbnRPZmZzZXQgPSAwLjA7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5jeWNsaWMpXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCAlIHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGg7XG4gICAgICBlbHNlXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNlZ21lbnRJbmRleCwgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDEpKTtcblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMuZHVyYXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMub2Zmc2V0QXJyYXkpXG4gICAgICAgIHNlZ21lbnRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwIHx8IHRoaXMucGVyaW9kUmVsID4gMCkge1xuICAgICAgICB2YXIgbmV4dFNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24sIG5leHRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG5leHRTZWdtZW50SW5kZXggPT09IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVswXSArIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVtuZXh0U2VnbWVudEluZGV4XTtcbiAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVtuZXh0U2VnbWVudEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbnRlclNlZ21lbnREaXN0YW5jZSA9IG5leHRQb3NpdGlvbiAtIHNlZ21lbnRQb3NpdGlvbjtcblxuICAgICAgICAvLyBjb3JyZWN0IGludGVyLXNlZ21lbnQgZGlzdGFuY2UgYnkgb2Zmc2V0c1xuICAgICAgICAvLyAgIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICAgIGlmIChzZWdtZW50T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSAtPSBzZWdtZW50T2Zmc2V0O1xuXG4gICAgICAgIGlmIChuZXh0T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSArPSBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIGlmIChpbnRlclNlZ21lbnREaXN0YW5jZSA8IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgPSAwO1xuXG4gICAgICAgIC8vIHVzZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlIGluc3RlYWQgb2Ygc2VnbWVudCBkdXJhdGlvblxuICAgICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwKVxuICAgICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IGludGVyU2VnbWVudERpc3RhbmNlO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXIgbWFya2VyIGRpc3RhbmNlXG4gICAgICAgIHNlZ21lbnRQZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBpbnRlclNlZ21lbnREaXN0YW5jZTtcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uXG4gICAgICBzZWdtZW50RHVyYXRpb24gKj0gdGhpcy5kdXJhdGlvblJlbDtcbiAgICAgIHNlZ21lbnREdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgICAvLyBhZGQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHNlZ21lbnQgb2Zmc2V0XG4gICAgICBzZWdtZW50T2Zmc2V0ICo9IHRoaXMub2Zmc2V0UmVsO1xuICAgICAgc2VnbWVudE9mZnNldCArPSB0aGlzLm9mZnNldEFicztcblxuICAgICAgLy8gYXBwbHkgc2VnbWVudCBvZmZzZXRcbiAgICAgIC8vICAgb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgIC8vICAgb2Zmc2V0IDwgMDogdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb24gaXMgdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgIGlmIChzZWdtZW50T2Zmc2V0IDwgMCkge1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gLT0gc2VnbWVudE9mZnNldDtcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uICs9IHNlZ21lbnRPZmZzZXQ7XG4gICAgICAgIHNlZ21lbnRUaW1lICs9IChzZWdtZW50T2Zmc2V0IC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudFRpbWUgLT0gKHNlZ21lbnRPZmZzZXQgLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBzZWdtZW50IHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICAvLyBzaG9ydGVuIGR1cmF0aW9uIG9mIHNlZ21lbnRzIG92ZXIgdGhlIGVkZ2VzIG9mIHRoZSBidWZmZXJcbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gPCAwKSB7XG4gICAgICAgIC8vc2VnbWVudFRpbWUgLT0gZ3JhaW5Qb3NpdGlvbjsgaG0sIG5vdCBzdXJlIGlmIHdlIHdhbnQgdG8gZG8gdGhpc1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gKz0gc2VnbWVudFBvc2l0aW9uO1xuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VnbWVudFBvc2l0aW9uICsgc2VnbWVudER1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gc2VnbWVudFBvc2l0aW9uO1xuXG4gICAgICBzZWdtZW50RHVyYXRpb24gLz0gcmVzYW1wbGluZ1JhdGU7XG5cbiAgICAgIGlmICh0aGlzLm1vbm9waG9uaWMpXG4gICAgICAgIHRoaXMuYWJvcnQoc2VnbWVudFRpbWUpO1xuXG4gICAgICAvLyBtYWtlIHNlZ21lbnRcbiAgICAgIGlmICh0aGlzLmdhaW4gPiAwICYmIHNlZ21lbnREdXJhdGlvbiA+IDApIHtcbiAgICAgICAgLy8gbWFrZSBzZWdtZW50IGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZSA9IHRoaXMucmVsZWFzZUFicyArIHRoaXMucmVsZWFzZVJlbCAqIHNlZ21lbnREdXJhdGlvbjtcblxuICAgICAgICBpZiAoYXR0YWNrICsgcmVsZWFzZSA+IHNlZ21lbnREdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBzZWdtZW50RHVyYXRpb24gLyAoYXR0YWNrICsgcmVsZWFzZSk7XG4gICAgICAgICAgYXR0YWNrICo9IGZhY3RvcjtcbiAgICAgICAgICByZWxlYXNlICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdHRhY2tFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBhdHRhY2s7XG4gICAgICAgIHZhciBzZWdtZW50RW5kVGltZSA9IHNlZ21lbnRUaW1lICsgc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZVN0YXJ0VGltZSA9IHNlZ21lbnRFbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLnZhbHVlID0gMDtcbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjAsIHNlZ21lbnRUaW1lKTtcbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmdhaW4sIGF0dGFja0VuZFRpbWUpO1xuXG4gICAgICAgIGlmIChyZWxlYXNlU3RhcnRUaW1lID4gYXR0YWNrRW5kVGltZSlcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgcmVsZWFzZVN0YXJ0VGltZSk7XG5cbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIHNlZ21lbnRFbmRUaW1lKTtcbiAgICAgICAgZW52ZWxvcGUuY29ubmVjdCh0aGlzLm91dHB1dE5vZGUpO1xuXG4gICAgICAgIHRoaXMuX19jdXJyZW50RW52ID0gZW52ZWxvcGU7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChzZWdtZW50VGltZSwgc2VnbWVudFBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3Aoc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19jdXJyZW50U3JjID0gc291cmNlO1xuICAgICAgICB0aGlzLl9fcmVsZWFzZVN0YXJ0VGltZSA9IHJlbGVhc2VTdGFydFRpbWU7XG4gICAgICAgIHRoaXMuX19jdXJyZW50R2FpbiA9IHRoaXMuZ2FpbjtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbmRUaW1lID0gc2VnbWVudEVuZFRpbWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZ3JhaW4gcGVyaW9kIHJhbmRvbiB2YXJpYXRpb25cbiAgICBpZiAodGhpcy5wZXJpb2RWYXIgPiAwLjApXG4gICAgICBzZWdtZW50UGVyaW9kICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucGVyaW9kVmFyICogZ3JhaW5QZXJpb2Q7XG5cbiAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5wZXJpb2RNaW4sIHNlZ21lbnRQZXJpb2QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFib3J0IHRoZSBjdXJyZW50IHNlZ21lbnQgYXQgZ2l2ZW4gdGltZSwgZmFkZSBvdXQgZHVyYXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBhYm9ydCB0aW1lXG4gICAqL1xuICBhYm9ydCh0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgZW5kVGltZSA9IHRoaXMuX19jdXJyZW50RW5kVGltZTtcbiAgICBjb25zdCBhYm9ydFRpbWUgPSB0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcblxuICAgIGlmIChhYm9ydFRpbWUgPCBlbmRUaW1lKSB7XG4gICAgICBjb25zdCBzZWdtZW50RW5kVGltZSA9IE1hdGgubWluKGFib3J0VGltZSArIHRoaXMuYWJvcnRUaW1lLCBlbmRUaW1lKTtcbiAgICAgIGNvbnN0IGVudmVsb3BlID0gdGhpcy5fX2N1cnJlbnRFbnY7XG4gICAgICBsZXQgY3VycmVudEdhaW5WYWx1ZSA9IHRoaXMuX19jdXJyZW50R2FpbjtcblxuICAgICAgaWYgKGFib3J0VGltZSA+IHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lKSB7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VTdGFydCA9IHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lO1xuICAgICAgICBjdXJyZW50R2FpblZhbHVlICo9IChhYm9ydFRpbWUgLSByZWxlYXNlU3RhcnQpIC8gKGVuZFRpbWUgLSByZWxlYXNlU3RhcnQpO1xuICAgICAgfVxuXG4gICAgICBlbnZlbG9wZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhYm9ydFRpbWUpO1xuICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShjdXJyZW50R2FpblZhbHVlLCBhYm9ydFRpbWUpO1xuICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBzZWdtZW50RW5kVGltZSk7XG5cbiAgICAgIHRoaXMuX19jdXJyZW50U3JjID0gbnVsbDtcbiAgICAgIHRoaXMuX19jdXJyZW50RW52ID0gbnVsbDtcbiAgICAgIHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lID0gMDtcbiAgICAgIHRoaXMuX19jdXJyZW50R2FpbiA9IDA7XG4gICAgICB0aGlzLl9fY3VycmVudEVuZFRpbWUgPSAwO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZWdtZW50RW5naW5lO1xuIiwiLy8gaW1wb3J0IHsgVGltZUVuZ2luZSwgUHJpb3JpdHlRdWV1ZSwgU2NoZWR1bGluZ1F1ZXVlIH0gZnJvbSAnd2F2ZXMtbWFzdGVycyc7XG4vLyBjb3JlXG5leHBvcnQgeyBkZWZhdWx0IGFzIGF1ZGlvQ29udGV4dCB9IGZyb20gJy4vY29yZS9hdWRpb0NvbnRleHQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBBdWRpb1RpbWVFbmdpbmUgfSBmcm9tICcuL2NvcmUvQXVkaW9UaW1lRW5naW5lJztcbmV4cG9ydCB7IFRpbWVFbmdpbmUsIFByaW9yaXR5UXVldWUsIFNjaGVkdWxpbmdRdWV1ZSB9IGZyb20gJ3dhdmVzLW1hc3RlcnMnO1xuLy8gZXhwb3J0IFByaW9yaXR5UXVldWU7XG4vLyBleHBvcnQgU2NoZWR1bGluZ1F1ZXVlO1xuXG4vLyBlbmdpbmVzXG5leHBvcnQgeyBkZWZhdWx0IGFzIEdyYW51bGFyRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL0dyYW51bGFyRW5naW5lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWV0cm9ub21lIH0gZnJvbSAnLi9lbmdpbmVzL01ldHJvbm9tZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFBsYXllckVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9QbGF5ZXJFbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWdtZW50RW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL1NlZ21lbnRFbmdpbmUnO1xuXG4vLyBtYXN0ZXJzXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBsYXlDb250cm9sIH0gZnJvbSAnLi9tYXN0ZXJzL1BsYXlDb250cm9sJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVHJhbnNwb3J0IH0gZnJvbSAnLi9tYXN0ZXJzL1RyYW5zcG9ydCc7XG5cbi8vIGZhY3Rvcmllc1xuZXhwb3J0IHsgZ2V0U2NoZWR1bGVyLCBnZXRTaW1wbGVTY2hlZHVsZXIgfSBmcm9tICcuL21hc3RlcnMvZmFjdG9yaWVzJztcblxuXG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvQ29udGV4dCc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5pbXBvcnQgKiBhcyBtYXN0ZXJzIGZyb20gJ3dhdmVzLW1hc3RlcnMnO1xuXG4vKipcbiAqIEV4dGVuZHMgVGltZSBFbmdpbmUgdG8gcHJvdmlkZSBwbGF5YmFjayBjb250cm9sIG9mIGEgVGltZSBFbmdpbmUgaW5zdGFuY2UuXG4gKlxuICogW2V4YW1wbGVde0BsaW5rIGh0dHBzOi8vcmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy9wbGF5LWNvbnRyb2wuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIGVuZ2luZSB0byBjb250cm9sXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHBsYXllckVuZ2luZSA9IGF1ZGlvLlBsYXllckVuZ2luZSgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgYXVkaW8uUGxheUNvbnRyb2wocGxheWVyRW5naW5lKTtcbiAqXG4gKiBwbGF5Q29udHJvbC5zdGFydCgpO1xuICovXG5jbGFzcyBQbGF5Q29udHJvbCBleHRlbmRzIG1hc3RlcnMuUGxheUNvbnRyb2wge1xuICBjb25zdHJ1Y3RvcihlbmdpbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8wqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuICAgIGNvbnN0IHNjaGVkdWxlciA9IGdldFNjaGVkdWxlcihhdWRpb0NvbnRleHQpO1xuXG4gICAgc3VwZXIoc2NoZWR1bGVyLCBlbmdpbmUsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheUNvbnRyb2w7XG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvQ29udGV4dCc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5pbXBvcnQgKiBhcyBtYXN0ZXJzIGZyb20gJ3dhdmVzLW1hc3RlcnMnO1xuXG4vKipcbiAqIFByb3ZpZGVzIHN5bmNocm9uaXplZCBzY2hlZHVsaW5nIG9mIFRpbWUgRW5naW5lIGluc3RhbmNlcy5cbiAqXG4gKiBbZXhhbXBsZV17QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL3RyYW5zcG9ydC5odG1sfVxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCB0cmFuc3BvcnQgPSBuZXcgYXVkaW8uVHJhbnNwb3J0KCk7XG4gKiBjb25zdCBwbGF5Q29udHJvbCA9IG5ldyBhdWRpby5QbGF5Q29udHJvbCh0cmFuc3BvcnQpO1xuICogY29uc3QgbXlFbmdpbmUgPSBuZXcgTXlFbmdpbmUoKTtcbiAqIGNvbnN0IHlvdXJFbmdpbmUgPSBuZXcgeW91ckVuZ2luZSgpO1xuICpcbiAqIHRyYW5zcG9ydC5hZGQobXlFbmdpbmUpO1xuICogdHJhbnNwb3J0LmFkZCh5b3VyRW5naW5lKTtcbiAqXG4gKiBwbGF5Q29udHJvbC5zdGFydCgpO1xuICovXG5jbGFzcyBUcmFuc3BvcnQgZXh0ZW5kcyBtYXN0ZXJzLlRyYW5zcG9ydCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8wqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuICAgIGNvbnN0IHNjaGVkdWxlciA9IGdldFNjaGVkdWxlcihhdWRpb0NvbnRleHQpO1xuICAgIHN1cGVyKHNjaGVkdWxlciwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFuc3BvcnQ7XG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvQ29udGV4dCc7XG5pbXBvcnQgeyBTY2hlZHVsZXIsIFNpbXBsZVNjaGVkdWxlciB9IGZyb20gJ3dhdmVzLW1hc3RlcnMnO1xuXG5jb25zdCBzY2hlZHVsZXJNYXAgPSBuZXcgTWFwKCk7XG5jb25zdCBzaW1wbGVTY2hlZHVsZXJNYXAgPSBuZXcgTWFwKCk7XG5cbi8qKlxuICogUmV0dXJucyBhIHVuaXF1ZSBpbnN0YW5jZSBvZiBgU2NoZWR1bGVyYFxuICpcbiAqIEBnbG9iYWxcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge1NjaGVkdWxlcn1cbiAqIEBzZWUgU2NoZWR1bGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2hlZHVsZXIoYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2NoZWR1bGVyID0gc2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2NoZWR1bGVyKSB7XG4gICAgY29uc3QgZ2V0VGltZUZ1bmN0aW9uID0gKCkgPT4gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoZ2V0VGltZUZ1bmN0aW9uKTtcblxuICAgIHNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNjaGVkdWxlcjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHVuaXF1ZSBpbnN0YW5jZSBvZiBgU2ltcGxlU2NoZWR1bGVyYFxuICpcbiAqIEBnbG9iYWxcbiAqIEBmdW5jdGlvblxuICogQHJldHVybnMge1NpbXBsZVNjaGVkdWxlcn1cbiAqIEBzZWUgU2ltcGxlU2NoZWR1bGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTaW1wbGVTY2hlZHVsZXIoYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2ltcGxlU2NoZWR1bGVyID0gc2ltcGxlU2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2ltcGxlU2NoZWR1bGVyKSB7XG4gICAgY29uc3QgZ2V0VGltZUZ1bmN0aW9uID0gKCkgPT4gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIHNpbXBsZVNjaGVkdWxlciA9IG5ldyBTaW1wbGVTY2hlZHVsZXIoZ2V0VGltZUZ1bmN0aW9uKTtcblxuICAgIHNpbXBsZVNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzaW1wbGVTY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNpbXBsZVNjaGVkdWxlcjtcbn07XG4iLCJpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG5pbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdAaXJjYW0vYmFzaWMtY29udHJvbGxlcnMnO1xuXG5jb250cm9sbGVycy5zZXRUaGVtZSgnZGFyaycpO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBhdWRpby5hdWRpb0NvbnRleHQ7XG5jb25zdCBzY2hlZHVsZXIgPSBhdWRpby5nZXRTaW1wbGVTY2hlZHVsZXIoKTtcbmNvbnN0IGNvbnRhaW5lciA9ICcuY29udHJvbGxlcnMnO1xuXG5mdW5jdGlvbiBjcmVhdGVNZXRybyhpbmRleCkge1xuICBjb25zdCB0ZW1wbyA9IDMwICsgaW5kZXggKiAzMDtcblxuICAvLyBjcmVhdGUgbWV0cm9ub21lIGVuZ2luZVxuICBjb25zdCBtZXRybyA9IG5ldyBhdWRpby5NZXRyb25vbWUoKTtcbiAgbWV0cm8ucGVyaW9kID0gNjAgLyB0ZW1wbztcbiAgbWV0cm8uZ2FpbiA9IDAuMztcbiAgbWV0cm8uY2xpY2tGcmVxID0gaW5kZXggKiA2NjY7XG4gIG1ldHJvLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcblxuICAvLyBjcmVhdGUgR1VJIGVsZW1lbnRzIChlbmFibGUvZGlzYWJsZSBtZXRyb25vbWUpXG4gIG5ldyBjb250cm9sbGVycy5Ub2dnbGUoe1xuICAgIGxhYmVsOiBgTWV0cm9ub21lICR7aW5kZXh9YCxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICBjYWxsYmFjazogZmxhZyA9PiB7XG4gICAgICBpZiAoZmxhZylcbiAgICAgICAgc2NoZWR1bGVyLmFkZChtZXRybyk7XG4gICAgICBlbHNlXG4gICAgICAgIHNjaGVkdWxlci5yZW1vdmUobWV0cm8pO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgdGVtcG9TbGlkZXIgPSBuZXcgY29udHJvbGxlcnMuU2xpZGVyKHtcbiAgICBsYWJlbDogJ1RlbXBvJyxcbiAgICBtaW46IDMwLFxuICAgIG1heDogMjQwLFxuICAgIHN0ZXA6IDEsXG4gICAgZGVmYXVsdDogdGVtcG8sXG4gICAgdW5pdDogJ2JwbScsXG4gICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgY2FsbGJhY2s6IHZhbHVlID0+IG1ldHJvLnBlcmlvZCA9IDYwIC8gdmFsdWUsXG4gIH0pO1xuXG4gIHJldHVybiBtZXRybztcbn1cblxuLy8gY3JlYXRlIHRocmVlIG1ldHJvbm9tZSBlbmdpbmVzXG5jb25zdCBlbmdpbmVzID0gW107XG5lbmdpbmVzLnB1c2goY3JlYXRlTWV0cm8oMSkpO1xuZW5naW5lcy5wdXNoKGNyZWF0ZU1ldHJvKDIpKTtcbmVuZ2luZXMucHVzaChjcmVhdGVNZXRybygzKSk7XG5cbm5ldyBjb250cm9sbGVycy5UcmlnZ2VyQnV0dG9ucyh7XG4gIGxhYmVsOiAnJm5ic3A7JyxcbiAgb3B0aW9uczogWydTeW5jJ10sXG4gIGNvbnRhaW5lcjogY29udGFpbmVyLFxuICBjYWxsYmFjazogdmFsdWUgPT4gZW5naW5lcy5mb3JFYWNoKGVuZ2luZSA9PiBlbmdpbmUucmVzZXRUaW1lKCkpLFxufSk7XG4iLCIvKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVyICovXG5cbmNvbnN0IHR5cGVDb3VudGVycyA9IHt9O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgdG8gY3JlYXRlIG5ldyBjb250cm9sbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIFN0cmluZyBkZXNjcmliaW5nIHRoZSB0eXBlIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRzIC0gRGVmYXVsdCBwYXJhbWV0ZXJzIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFVzZXIgZGVmaW5lZCBjb25maWd1cmF0aW9uIG9wdGlvbnMuXG4gKi9cbmNsYXNzIEJhc2VDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcih0eXBlLCBkZWZhdWx0cywgY29uZmlnID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICAvLyBoYW5kbGUgaWRcbiAgICBpZiAoIXR5cGVDb3VudGVyc1t0eXBlXSlcbiAgICAgIHR5cGVDb3VudGVyc1t0eXBlXSA9IDA7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmlkKSB7XG4gICAgICB0aGlzLmlkID0gYCR7dHlwZX0tJHt0eXBlQ291bnRlcnNbdHlwZV19YDtcbiAgICAgIHR5cGVDb3VudGVyc1t0eXBlXSArPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlkID0gdGhpcy5wYXJhbXMuaWQ7XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2dyb3VwTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gcmVnaXN0ZXIgY2FsbGJhY2sgaWYgZ2l2ZW5cbiAgICBpZiAodGhpcy5wYXJhbXMuY2FsbGJhY2spXG4gICAgICB0aGlzLmFkZExpc3RlbmVyKHRoaXMucGFyYW1zLmNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0byB0aGUgY29udHJvbGxlci5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBiZSBhcHBsaWVkIHdoZW4gdGhlIGNvbnRyb2xsZXJcbiAgICogIHN0YXRlIGNoYW5nZS5cbiAgICovXG4gIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBsaXN0ZW5lciBpcyBhZGRlZCBmcm9tIGEgY29udGFpbmluZyBncm91cC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRHcm91cExpc3RlbmVyKGlkLCBjYWxsSWQsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFjYWxsSWQpXG4gICAgICB0aGlzLmFkZExpc3RlbmVyKGNhbGxiYWNrKTtcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2dyb3VwTGlzdGVuZXJzLmFkZCh7IGNhbGxJZCwgY2FsbGJhY2sgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIGNvbnRyb2xsZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gcmVtb3ZlIGZyb20gdGhlIGxpc3RlbmVycy5cbiAgICogQHByaXZhdGVcbiAgICogQHRvZG8gLSByZWV4cG9zZSB3aGVuIGBjb250YWluZXJgIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZC4uLlxuICAgKi9cbiAgLy8gcmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgLy8gICB0aGlzLl9saXN0ZW5lcnMucmVtb3ZlKGNhbGxiYWNrKTtcbiAgLy8gfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBleGVjdXRlTGlzdGVuZXJzKC4uLnZhbHVlcykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2soLi4udmFsdWVzKSk7XG5cbiAgICB0aGlzLl9ncm91cExpc3RlbmVycy5mb3JFYWNoKChwYXlsb2FkKSA9PiB7XG4gICAgICBjb25zdCB7IGNhbGxiYWNrLCBjYWxsSWQgfSA9IHBheWxvYWQ7XG4gICAgICBjYWxsYmFjayhjYWxsSWQsIC4uLnZhbHVlcyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZUNvbXBvbmVudDtcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vQmFzZUNvbXBvbmVudCc7XG5pbXBvcnQgZGlzcGxheSBmcm9tICcuLi9taXhpbnMvZGlzcGxheSc7XG5cbmNvbnN0IEF1ZGlvQ29udGV4dCA9ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICdEcmFnIGFuZCBkcm9wIGF1ZGlvIGZpbGVzJyxcbiAgbGFiZWxQcm9jZXNzOiAncHJvY2Vzcy4uLicsXG4gIGF1ZGlvQ29udGV4dDogbnVsbCxcbiAgY29udGFpbmVyOiBudWxsLFxuICBjYWxsYmFjazogbnVsbCxcbn07XG5cbi8qKlxuICogRHJhZyBhbmQgZHJvcCB6b25lIGZvciBhdWRpbyBmaWxlcyByZXR1cm5pbmcgYEF1ZGlvQnVmZmVyYHMgYW5kL29yIEpTT05cbiAqIGRlc2NyaXB0b3IgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IFtjb25maWcubGFiZWw9J0RyYWcgYW5kIGRyb3AgYXVkaW8gZmlsZXMnXSAtIExhYmVsIG9mIHRoZVxuICogIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gW2NvbmZpZy5sYWJlbFByb2Nlc3M9J3Byb2Nlc3MuLi4nXSAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyXG4gKiAgd2hpbGUgYXVkaW8gZmlsZXMgYXJlIGRlY29kZWQuXG4gKiBAcGFyYW0ge0F1ZGlvQ29udGV4dH0gW2NvbmZpZy5hdWRpb0NvbnRleHQ9bnVsbF0gLSBPcHRpb25uYWwgYXVkaW8gY29udGV4dFxuICogIHRvIHVzZSBpbiBvcmRlciB0byBkZWNvZGUgYXVkaW8gZmlsZXMuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29uZmlnLmNhbGxiYWNrPW51bGxdIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGVcbiAqICB2YWx1ZSBjaGFuZ2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdiYXNpYy1jb250cm9sbGVycyc7XG4gKlxuICogY29uc3QgZHJhZ0FuZERyb3AgPSBuZXcgY29udHJvbGxlcnMuRHJhZ0FuZERyb3Aoe1xuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6IChyZXN1bHRzKSA9PiBjb25zb2xlLmxvZyhyZXN1bHRzKSxcbiAqIH0pO1xuICovXG5jbGFzcyBEcmFnQW5kRHJvcCBleHRlbmRzIGRpc3BsYXkoQmFzZUNvbXBvbmVudCkge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoJ2RyYWctYW5kLWRyb3AnLCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmF1ZGlvQ29udGV4dClcbiAgICAgIHRoaXMucGFyYW1zLmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxhc3QgcmVzdWx0c1xuICAgKiBAdHlwZSB7T2JqZWN0PFN0cmluZywgQXVkaW9CdWZmZXJ8SlNPTj59XG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGxhYmVsIH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImRyb3Atem9uZVwiPlxuICAgICAgICA8cCBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3A+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGRyb3Bab25lID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmRyb3Atem9uZScpO1xuICAgIHRoaXMuJGxhYmVsID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmxhYmVsJyk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLiRkcm9wWm9uZS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB0aGlzLiRkcm9wWm9uZS5jbGFzc0xpc3QuYWRkKCdkcmFnJyk7XG4gICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHRoaXMuJGRyb3Bab25lLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB0aGlzLiRkcm9wWm9uZS5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnJyk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kZHJvcFpvbmUuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBjb25zdCBmaWxlcyA9IEFycmF5LmZyb20oZS5kYXRhVHJhbnNmZXIuZmlsZXMpO1xuICAgICAgY29uc3QgYXVkaW9GaWxlcyA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgICAgICBpZiAoL15hdWRpby8udGVzdChmaWxlLnR5cGUpKSB7XG4gICAgICAgICAgZmlsZS5zaG9ydFR5cGUgPSAnYXVkaW8nO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKC9qc29uJC8udGVzdChmaWxlLnR5cGUpKSB7XG4gICAgICAgICAgZmlsZS5zaG9ydFR5cGUgPSAnanNvbic7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0cyA9IHt9O1xuICAgICAgbGV0IGNvdW50ZXIgPSAwO1xuXG4gICAgICB0aGlzLiRsYWJlbC50ZXh0Q29udGVudCA9IHRoaXMucGFyYW1zLmxhYmVsUHJvY2VzcztcblxuICAgICAgY29uc3QgdGVzdEVuZCA9ICgpID0+IHtcbiAgICAgICAgY291bnRlciArPSAxO1xuXG4gICAgICAgIGlmIChjb3VudGVyID09PSBhdWRpb0ZpbGVzLmxlbmd0aCnCoHtcbiAgICAgICAgICB0aGlzLl92YWx1ZSA9IHJlc3VsdHNcbiAgICAgICAgICB0aGlzLmV4ZWN1dGVMaXN0ZW5lcnMocmVzdWx0cyk7XG5cbiAgICAgICAgICB0aGlzLiRkcm9wWm9uZS5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnJyk7XG4gICAgICAgICAgdGhpcy4kbGFiZWwudGV4dENvbnRlbnQgPSB0aGlzLnBhcmFtcy5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmaWxlcy5mb3JFYWNoKChmaWxlLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICByZXN1bHRzW2ZpbGUubmFtZV0gPSBKU09OLnBhcnNlKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgICAgICAgICB0ZXN0RW5kKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgdGhpcy5wYXJhbXMuYXVkaW9Db250ZXh0XG4gICAgICAgICAgICAgIC5kZWNvZGVBdWRpb0RhdGEoZS50YXJnZXQucmVzdWx0KVxuICAgICAgICAgICAgICAudGhlbigoYXVkaW9CdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2ZpbGUubmFtZV0gPSBhdWRpb0J1ZmZlcjtcbiAgICAgICAgICAgICAgICB0ZXN0RW5kKCk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tmaWxlLm5hbWVdID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0ZXN0RW5kKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2pzb24nKVxuICAgICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xuICAgICAgICBlbHNlIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2F1ZGlvJylcbiAgICAgICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZSk7XG4gICAgICB9KTtcbiAgICB9LCBmYWxzZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRHJhZ0FuZERyb3A7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuaW1wb3J0IGNvbnRhaW5lciBmcm9tICcuLi9taXhpbnMvY29udGFpbmVyJztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxlZ2VuZDogJyZuYnNwOycsXG4gIGRlZmF1bHQ6ICdvcGVuZWQnLFxuICBjb250YWluZXI6IG51bGwsXG59O1xuXG4vKipcbiAqIEdyb3VwIG9mIGNvbnRyb2xsZXJzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGdyb3VwLlxuICogQHBhcmFtIHsnb3BlbmVkJ3wnY2xvc2VkJ30gW2NvbmZpZy5kZWZhdWx0PSdvcGVuZWQnXSAtIERlZmF1bHQgc3RhdGUgb2YgdGhlXG4gKiAgZ3JvdXAuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiAvLyBjcmVhdGUgYSBncm91cFxuICogY29uc3QgZ3JvdXAgPSBuZXcgY29udHJvbGxlcnMuR3JvdXAoe1xuICogICBsYWJlbDogJ0dyb3VwJyxcbiAqICAgZGVmYXVsdDogJ29wZW5lZCcsXG4gKiAgIGNvbnRhaW5lcjogJyNjb250YWluZXInXG4gKiB9KTtcbiAqXG4gKiAvLyBpbnNlcnQgY29udHJvbGxlcnMgaW4gdGhlIGdyb3VwXG4gKiBjb25zdCBncm91cFNsaWRlciA9IG5ldyBjb250cm9sbGVycy5TbGlkZXIoe1xuICogICBsYWJlbDogJ0dyb3VwIFNsaWRlcicsXG4gKiAgIG1pbjogMjAsXG4gKiAgIG1heDogMTAwMCxcbiAqICAgc3RlcDogMSxcbiAqICAgZGVmYXVsdDogMjAwLFxuICogICB1bml0OiAnSHonLFxuICogICBzaXplOiAnbGFyZ2UnLFxuICogICBjb250YWluZXI6IGdyb3VwLFxuICogICBjYWxsYmFjazogKHZhbHVlKSA9PiBjb25zb2xlLmxvZyh2YWx1ZSksXG4gKiB9KTtcbiAqXG4gKiBjb25zdCBncm91cFRleHQgPSBuZXcgY29udHJvbGxlcnMuVGV4dCh7XG4gKiAgIGxhYmVsOiAnR3JvdXAgVGV4dCcsXG4gKiAgIGRlZmF1bHQ6ICd0ZXh0IGlucHV0JyxcbiAqICAgcmVhZG9ubHk6IGZhbHNlLFxuICogICBjb250YWluZXI6IGdyb3VwLFxuICogICBjYWxsYmFjazogKHZhbHVlKSA9PiBjb25zb2xlLmxvZyh2YWx1ZSksXG4gKiB9KTtcbiAqL1xuY2xhc3MgR3JvdXAgZXh0ZW5kcyBjb250YWluZXIoZGlzcGxheShCYXNlQ29tcG9uZW50KSkge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcignZ3JvdXAnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIHRoaXMuX3N0YXRlcyA9IFsnb3BlbmVkJywgJ2Nsb3NlZCddO1xuXG4gICAgaWYgKHRoaXMuX3N0YXRlcy5pbmRleE9mKHRoaXMucGFyYW1zLmRlZmF1bHQpID09PSAtMSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzdGF0ZSBcIiR7dmFsdWV9XCJgKTtcblxuICAgIHRoaXMuX3N0YXRlID0gdGhpcy5wYXJhbXMuZGVmYXVsdDtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0ZSBvZiB0aGUgZ3JvdXAgKGAnb3BlbmVkJ2Agb3IgYCdjbG9zZWQnYCkuXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICBzZXQgdmFsdWUoc3RhdGUpIHtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgZm9yIGB2YWx1ZWAuXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgc3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2V0IHN0YXRlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3N0YXRlcy5pbmRleE9mKHZhbHVlKSA9PT0gLTEpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc3RhdGUgXCIke3ZhbHVlfVwiYCk7XG5cbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX3N0YXRlKTtcbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKHZhbHVlKTtcblxuICAgIHRoaXMuX3N0YXRlID0gdmFsdWU7XG4gIH1cblxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICR7ZWxlbWVudHMuc21hbGxBcnJvd1JpZ2h0fVxuICAgICAgICAke2VsZW1lbnRzLnNtYWxsQXJyb3dCb3R0b219XG4gICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj4ke3RoaXMucGFyYW1zLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWNvbnRlbnRcIj48L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQodGhpcy5fc3RhdGUpO1xuXG4gICAgdGhpcy4kaGVhZGVyID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdyb3VwLWhlYWRlcicpO1xuICAgIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5ncm91cC1jb250ZW50Jyk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2JpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9zdGF0ZSA9PT0gJ2Nsb3NlZCcgPyAnb3BlbmVkJyA6ICdjbG9zZWQnO1xuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyb3VwO1xuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBkaXNwbGF5IGZyb20gJy4uL21peGlucy9kaXNwbGF5JztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxhYmVsOiAnJm5ic3A7JyxcbiAgbWluOiAwLFxuICBtYXg6IDEsXG4gIHN0ZXA6IDAuMDEsXG4gIGRlZmF1bHQ6IDAsXG4gIGNvbnRhaW5lcjogbnVsbCxcbiAgY2FsbGJhY2s6IG51bGwsXG59O1xuXG4vKipcbiAqIE51bWJlciBCb3ggY29udHJvbGxlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW2NvbmZpZy5taW49MF0gLSBNaW5pbXVtIHZhbHVlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcubWF4PTFdIC0gTWF4aW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbY29uZmlnLnN0ZXA9MC4wMV0gLSBTdGVwIGJldHdlZW4gY29uc2VjdXRpdmUgdmFsdWVzLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcuZGVmYXVsdD0wXSAtIERlZmF1bHQgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29uZmlnLmNhbGxiYWNrPW51bGxdIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGVcbiAqICB2YWx1ZSBjaGFuZ2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdiYXNpYy1jb250cm9sbGVycyc7XG4gKlxuICogY29uc3QgbnVtYmVyQm94ID0gbmV3IGNvbnRyb2xsZXJzLk51bWJlckJveCh7XG4gKiAgIGxhYmVsOiAnTXkgTnVtYmVyIEJveCcsXG4gKiAgIG1pbjogMCxcbiAqICAgbWF4OiAxMCxcbiAqICAgc3RlcDogMC4xLFxuICogICBkZWZhdWx0OiA1LFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6ICh2YWx1ZSkgPT4gY29uc29sZS5sb2codmFsdWUpLFxuICogfSk7XG4gKi9cbmNsYXNzIE51bWJlckJveCBleHRlbmRzIGRpc3BsYXkoQmFzZUNvbXBvbmVudCkge1xuICAvLyBsZWdlbmQsIG1pbiA9IDAsIG1heCA9IDEsIHN0ZXAgPSAwLjAxLCBkZWZhdWx0VmFsdWUgPSAwLCAkY29udGFpbmVyID0gbnVsbCwgY2FsbGJhY2sgPSBudWxsXG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCdudW1iZXItYm94JywgZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLl92YWx1ZSA9IHRoaXMucGFyYW1zLmRlZmF1bHQ7XG4gICAgdGhpcy5faXNJbnRTdGVwID0gKHRoaXMucGFyYW1zLnN0ZXAgJSAxID09PSAwKTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlIG9mIHRoZSBjb250cm9sbGVyLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgIC8vIHVzZSAkbnVtYmVyIGVsZW1lbnQgbWluLCBtYXggYW5kIHN0ZXAgc3lzdGVtXG4gICAgdGhpcy4kbnVtYmVyLnZhbHVlID0gdmFsdWU7XG4gICAgdmFsdWUgPSB0aGlzLiRudW1iZXIudmFsdWU7XG4gICAgdmFsdWUgPSB0aGlzLl9pc0ludFN0ZXAgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgbWluLCBtYXgsIHN0ZXAgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgXG4gICAgICA8c3BhbiBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiaW5uZXItd3JhcHBlclwiPlxuICAgICAgICAke2VsZW1lbnRzLmFycm93TGVmdH1cbiAgICAgICAgPGlucHV0IGNsYXNzPVwibnVtYmVyXCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIiR7bWlufVwiIG1heD1cIiR7bWF4fVwiIHN0ZXA9XCIke3N0ZXB9XCIgdmFsdWU9XCIke3RoaXMuX3ZhbHVlfVwiIC8+XG4gICAgICAgICR7ZWxlbWVudHMuYXJyb3dSaWdodH1cbiAgICAgIDwvZGl2PlxuICAgIGA7XG5cbiAgICB0aGlzLiRlbCA9IHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQoJ2FsaWduLXNtYWxsJyk7XG4gICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gY29udGVudDtcblxuICAgIHRoaXMuJHByZXYgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuYXJyb3ctbGVmdCcpO1xuICAgIHRoaXMuJG5leHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuYXJyb3ctcmlnaHQnKTtcbiAgICB0aGlzLiRudW1iZXIgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwibnVtYmVyXCJdJyk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2JpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kcHJldi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBzdGVwID0gdGhpcy5wYXJhbXMuc3RlcDtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gc3RlcC50b1N0cmluZygpLnNwbGl0KCcuJylbMV07XG4gICAgICBjb25zdCBleHAgPSBkZWNpbWFscyA/IGRlY2ltYWxzLmxlbmd0aCA6IDA7XG4gICAgICBjb25zdCBtdWx0ID0gTWF0aC5wb3coMTAsIGV4cCk7XG5cbiAgICAgIGNvbnN0IGludFZhbHVlID0gTWF0aC5mbG9vcih0aGlzLl92YWx1ZSAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgaW50U3RlcCA9IE1hdGguZmxvb3Ioc3RlcCAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgdmFsdWUgPSAoaW50VmFsdWUgLSBpbnRTdGVwKSAvIG11bHQ7XG5cbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZSh2YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kbmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBzdGVwID0gdGhpcy5wYXJhbXMuc3RlcDtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gc3RlcC50b1N0cmluZygpLnNwbGl0KCcuJylbMV07XG4gICAgICBjb25zdCBleHAgPSBkZWNpbWFscyA/IGRlY2ltYWxzLmxlbmd0aCA6IDA7XG4gICAgICBjb25zdCBtdWx0ID0gTWF0aC5wb3coMTAsIGV4cCk7XG5cbiAgICAgIGNvbnN0IGludFZhbHVlID0gTWF0aC5mbG9vcih0aGlzLl92YWx1ZSAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgaW50U3RlcCA9IE1hdGguZmxvb3Ioc3RlcCAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgdmFsdWUgPSAoaW50VmFsdWUgKyBpbnRTdGVwKSAvIG11bHQ7XG5cbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZSh2YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kbnVtYmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLiRudW1iZXIudmFsdWU7XG4gICAgICB2YWx1ZSA9IHRoaXMuX2lzSW50U3RlcCA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgIHZhbHVlID0gTWF0aC5taW4odGhpcy5wYXJhbXMubWF4LCBNYXRoLm1heCh0aGlzLnBhcmFtcy5taW4sIHZhbHVlKSk7XG5cbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZSh2YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9wcm9wYWdhdGUodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHRoaXMuX3ZhbHVlKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLiRudW1iZXIudmFsdWUgPSB2YWx1ZTtcblxuICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyQm94O1xuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBkaXNwbGF5IGZyb20gJy4uL21peGlucy9kaXNwbGF5JztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxhYmVsOiAnJm5ic3A7JyxcbiAgb3B0aW9uczogbnVsbCxcbiAgZGVmYXVsdDogbnVsbCxcbiAgY29udGFpbmVyOiBudWxsLFxuICBjYWxsYmFjazogbnVsbCxcbn07XG5cbi8qKlxuICogTGlzdCBvZiBidXR0b25zIHdpdGggc3RhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIE92ZXJyaWRlIGRlZmF1bHQgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjb25maWcubGFiZWwgLSBMYWJlbCBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7QXJyYXl9IFtjb25maWcub3B0aW9ucz1udWxsXSAtIFZhbHVlcyBvZiB0aGUgZHJvcCBkb3duIGxpc3QuXG4gKiBAcGFyYW0ge051bWJlcn0gW2NvbmZpZy5kZWZhdWx0PW51bGxdIC0gRGVmYXVsdCB2YWx1ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCBzZWxlY3RCdXR0b25zID0gbmV3IGNvbnRyb2xsZXJzLlNlbGVjdEJ1dHRvbnMoe1xuICogICBsYWJlbDogJ1NlbGVjdEJ1dHRvbnMnLFxuICogICBvcHRpb25zOiBbJ3N0YW5kYnknLCAncnVuJywgJ2VuZCddLFxuICogICBkZWZhdWx0OiAncnVuJyxcbiAqICAgY29udGFpbmVyOiAnI2NvbnRhaW5lcicsXG4gKiAgIGNhbGxiYWNrOiAodmFsdWUsIGluZGV4KSA9PiBjb25zb2xlLmxvZyh2YWx1ZSwgaW5kZXgpLFxuICogfSk7XG4gKi9cbmNsYXNzIFNlbGVjdEJ1dHRvbnMgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3NlbGVjdC1idXR0b25zJywgZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5wYXJhbXMub3B0aW9ucykpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyaWdnZXJCdXR0b246IEludmFsaWQgb3B0aW9uIFwib3B0aW9uc1wiJyk7XG5cbiAgICB0aGlzLl92YWx1ZSA9IHRoaXMucGFyYW1zLmRlZmF1bHQ7XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5wYXJhbXMub3B0aW9ucztcbiAgICBjb25zdCBpbmRleCA9IG9wdGlvbnMuaW5kZXhPZih0aGlzLl92YWx1ZSk7XG4gICAgdGhpcy5faW5kZXggPSBpbmRleCA9PT0gLTEgP8KgMCA6IGluZGV4O1xuICAgIHRoaXMuX21heEluZGV4ID0gb3B0aW9ucy5sZW5ndGggLSAxO1xuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgdmFsdWUuXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnBhcmFtcy5vcHRpb25zLmluZGV4T2YodmFsdWUpO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IG9wdGlvbiBpbmRleC5cbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCBpbmRleCgpIHtcbiAgICB0aGlzLl9pbmRleDtcbiAgfVxuXG4gIHNldCBpbmRleChpbmRleCkge1xuICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiB0aGlzLl9tYXhJbmRleCkgcmV0dXJuO1xuXG4gICAgdGhpcy5fdmFsdWUgPSB0aGlzLnBhcmFtcy5vcHRpb25zW2luZGV4XTtcbiAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX2hpZ2hsaWdodEJ0bih0aGlzLl9pbmRleCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgb3B0aW9ucywgbGFiZWwgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgXG4gICAgICA8c3BhbiBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiaW5uZXItd3JhcHBlclwiPlxuICAgICAgICAke2VsZW1lbnRzLmFycm93TGVmdH1cbiAgICAgICAgJHtvcHRpb25zLm1hcCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuXCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCIgZGF0YS12YWx1ZT1cIiR7b3B0aW9ufVwiPlxuICAgICAgICAgICAgICAke29wdGlvbn1cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAke2VsZW1lbnRzLmFycm93UmlnaHR9XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIodGhpcy50eXBlKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgdGhpcy4kcHJldiA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1sZWZ0Jyk7XG4gICAgdGhpcy4kbmV4dCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1yaWdodCcpO1xuICAgIHRoaXMuJGJ0bnMgPSBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5idG4nKSk7XG5cbiAgICB0aGlzLl9oaWdobGlnaHRCdG4odGhpcy5faW5kZXgpO1xuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcblxuICAgIHJldHVybiB0aGlzLiRlbDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLiRwcmV2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9pbmRleCAtIDE7XG4gICAgICB0aGlzLl9wcm9wYWdhdGUoaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kbmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5faW5kZXggKyAxO1xuICAgICAgdGhpcy5fcHJvcGFnYXRlKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHRoaXMuJGJ0bnMuZm9yRWFjaCgoJGJ0biwgaW5kZXgpID0+IHtcbiAgICAgICRidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuX3Byb3BhZ2F0ZShpbmRleCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfcHJvcGFnYXRlKGluZGV4KSB7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMuX21heEluZGV4KSByZXR1cm47XG5cbiAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5wYXJhbXMub3B0aW9uc1tpbmRleF07XG4gICAgdGhpcy5faGlnaGxpZ2h0QnRuKHRoaXMuX2luZGV4KTtcblxuICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSwgdGhpcy5faW5kZXgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9oaWdobGlnaHRCdG4oYWN0aXZlSW5kZXgpIHtcbiAgICB0aGlzLiRidG5zLmZvckVhY2goKCRidG4sIGluZGV4KSA9PiB7XG4gICAgICAkYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXG4gICAgICBpZiAoYWN0aXZlSW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICRidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VsZWN0QnV0dG9ucztcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vQmFzZUNvbXBvbmVudCc7XG5pbXBvcnQgZGlzcGxheSBmcm9tICcuLi9taXhpbnMvZGlzcGxheSc7XG5pbXBvcnQgKiBhcyBlbGVtZW50cyBmcm9tICcuLi91dGlscy9lbGVtZW50cyc7XG5cbi8qKiBAbW9kdWxlIGJhc2ljLWNvbnRyb2xsZXJzICovXG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBsYWJlbDogJyZuYnNwOycsXG4gIG9wdGlvbnM6IG51bGwsXG4gIGRlZmF1bHQ6IG51bGwsXG4gIGNvbnRhaW5lcjogbnVsbCxcbiAgY2FsbGJhY2s6IG51bGwsXG59XG5cbi8qKlxuICogRHJvcC1kb3duIGxpc3QgY29udHJvbGxlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbmZpZy5sYWJlbCAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtBcnJheX0gW2NvbmZpZy5vcHRpb25zPW51bGxdIC0gVmFsdWVzIG9mIHRoZSBkcm9wIGRvd24gbGlzdC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbY29uZmlnLmRlZmF1bHQ9bnVsbF0gLSBEZWZhdWx0IHZhbHVlLlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxiYXNpYy1jb250cm9sbGVyfkdyb3VwfSBbY29uZmlnLmNvbnRhaW5lcj1udWxsXSAtXG4gKiAgQ29udGFpbmVyIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NvbmZpZy5jYWxsYmFjaz1udWxsXSAtIENhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlXG4gKiAgdmFsdWUgY2hhbmdlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgY29udHJvbGxlcnMgZnJvbSAnYmFzaWMtY29udHJvbGxlcnMnO1xuICpcbiAqIGNvbnN0IHNlbGVjdExpc3QgPSBuZXcgY29udHJvbGxlcnMuU2VsZWN0TGlzdCh7XG4gKiAgIGxhYmVsOiAnU2VsZWN0TGlzdCcsXG4gKiAgIG9wdGlvbnM6IFsnc3RhbmRieScsICdydW4nLCAnZW5kJ10sXG4gKiAgIGRlZmF1bHQ6ICdydW4nLFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6ICh2YWx1ZSwgaW5kZXgpID0+IGNvbnNvbGUubG9nKHZhbHVlLCBpbmRleCksXG4gKiB9KTtcbiAqL1xuY2xhc3MgU2VsZWN0TGlzdCBleHRlbmRzIGRpc3BsYXkoQmFzZUNvbXBvbmVudCkge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcignc2VsZWN0LWxpc3QnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnBhcmFtcy5vcHRpb25zKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJpZ2dlckJ1dHRvbjogSW52YWxpZCBvcHRpb24gXCJvcHRpb25zXCInKTtcblxuICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5wYXJhbXMuZGVmYXVsdDtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnBhcmFtcy5vcHRpb25zO1xuICAgIGNvbnN0IGluZGV4ID0gb3B0aW9ucy5pbmRleE9mKHRoaXMuX3ZhbHVlKTtcbiAgICB0aGlzLl9pbmRleCA9IGluZGV4ID09PSAtMSA/wqAwIDogaW5kZXg7XG4gICAgdGhpcy5fbWF4SW5kZXggPSBvcHRpb25zLmxlbmd0aCAtIDE7XG5cbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3VycmVudCB2YWx1ZS5cbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICBzZXQgdmFsdWUodmFsdWUpIHtcbiAgICB0aGlzLiRzZWxlY3QudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX2luZGV4ID0gdGhpcy5wYXJhbXMub3B0aW9ucy5pbmRleE9mKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IG9wdGlvbiBpbmRleC5cbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCBpbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5kZXg7XG4gIH1cblxuICBzZXQgaW5kZXgoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5fbWF4SW5kZXgpIHJldHVybjtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5wYXJhbXMub3B0aW9uc1tpbmRleF07XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgbGFiZWwsIG9wdGlvbnPCoH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPiR7bGFiZWx9PC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cImlubmVyLXdyYXBwZXJcIj5cbiAgICAgICAgJHtlbGVtZW50cy5hcnJvd0xlZnR9XG4gICAgICAgIDxzZWxlY3Q+XG4gICAgICAgICR7b3B0aW9ucy5tYXAoKG9wdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICByZXR1cm4gYDxvcHRpb24gdmFsdWU9XCIke29wdGlvbn1cIj4ke29wdGlvbn08L29wdGlvbj5gO1xuICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgPHNlbGVjdD5cbiAgICAgICAgJHtlbGVtZW50cy5hcnJvd1JpZ2h0fVxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICAgIHRoaXMuJGVsID0gc3VwZXIucmVuZGVyKHRoaXMudHlwZSk7XG4gICAgdGhpcy4kZWwuY2xhc3NMaXN0LmFkZCgnYWxpZ24tc21hbGwnKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgdGhpcy4kcHJldiA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1sZWZ0Jyk7XG4gICAgdGhpcy4kbmV4dCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1yaWdodCcpO1xuICAgIHRoaXMuJHNlbGVjdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdCcpO1xuICAgIC8vIHNldCB0byBkZWZhdWx0IHZhbHVlXG4gICAgdGhpcy4kc2VsZWN0LnZhbHVlID0gb3B0aW9uc1t0aGlzLl9pbmRleF07XG4gICAgdGhpcy5fYmluZEV2ZW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXMuJGVsO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9iaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJHByZXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2luZGV4IC0gMTtcbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZShpbmRleCk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kbmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5faW5kZXggKyAxO1xuICAgICAgdGhpcy5fcHJvcGFnYXRlKGluZGV4KTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLiRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLiRzZWxlY3QudmFsdWU7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMucGFyYW1zLm9wdGlvbnMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICB0aGlzLl9wcm9wYWdhdGUoaW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9wcm9wYWdhdGUoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPCAwIHx8wqBpbmRleCA+IHRoaXMuX21heEluZGV4KSByZXR1cm47XG5cbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGFyYW1zLm9wdGlvbnNbaW5kZXhdO1xuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLiRzZWxlY3QudmFsdWUgPSB2YWx1ZTtcblxuICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSwgdGhpcy5faW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGVjdExpc3Q7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuaW1wb3J0ICogYXMgZ3VpQ29tcG9uZW50cyBmcm9tICdAaXJjYW0vZ3VpLWNvbXBvbmVudHMnO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBtaW46IDAsXG4gIG1heDogMSxcbiAgc3RlcDogMC4wMSxcbiAgZGVmYXVsdDogMCxcbiAgdW5pdDogJycsXG4gIHNpemU6ICdtZWRpdW0nLFxuICBjb250YWluZXI6IG51bGwsXG4gIGNhbGxiYWNrOiBudWxsLFxufVxuXG4vKipcbiAqIFNsaWRlciBjb250cm9sbGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW2NvbmZpZy5taW49MF0gLSBNaW5pbXVtIHZhbHVlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcubWF4PTFdIC0gTWF4aW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbY29uZmlnLnN0ZXA9MC4wMV0gLSBTdGVwIGJldHdlZW4gY29uc2VjdXRpdmUgdmFsdWVzLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcuZGVmYXVsdD0wXSAtIERlZmF1bHQgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gW2NvbmZpZy51bml0PScnXSAtIFVuaXQgb2YgdGhlIHZhbHVlLlxuICogQHBhcmFtIHsnc21hbGwnfCdtZWRpdW0nfCdsYXJnZSd9IFtjb25maWcuc2l6ZT0nbWVkaXVtJ10gLSBTaXplIG9mIHRoZVxuICogIHNsaWRlci5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCBzbGlkZXIgPSBuZXcgY29udHJvbGxlcnMuU2xpZGVyKHtcbiAqICAgbGFiZWw6ICdNeSBTbGlkZXInLFxuICogICBtaW46IDIwLFxuICogICBtYXg6IDEwMDAsXG4gKiAgIHN0ZXA6IDEsXG4gKiAgIGRlZmF1bHQ6IDUzNyxcbiAqICAgdW5pdDogJ0h6JyxcbiAqICAgc2l6ZTogJ2xhcmdlJyxcbiAqICAgY29udGFpbmVyOiAnI2NvbnRhaW5lcicsXG4gKiAgIGNhbGxiYWNrOiAodmFsdWUpID0+IGNvbnNvbGUubG9nKHZhbHVlKSxcbiAqIH0pO1xuICovXG5jbGFzcyBTbGlkZXIgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3NsaWRlcicsIGRlZmF1bHRzLCBjb25maWcpO1xuXG4gICAgdGhpcy5fdmFsdWUgPSB0aGlzLnBhcmFtcy5kZWZhdWx0O1xuICAgIHRoaXMuX29uU2xpZGVyQ2hhbmdlID0gdGhpcy5fb25TbGlkZXJDaGFuZ2UuYmluZCh0aGlzKTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlLlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLiRudW1iZXIgJiYgdGhpcy4kcmFuZ2UpIHtcbiAgICAgIHRoaXMuJG51bWJlci52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICB0aGlzLnNsaWRlci52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgbWluLCBtYXgsIHN0ZXAsIHVuaXQsIHNpemUgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgXG4gICAgICA8c3BhbiBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiaW5uZXItd3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmFuZ2VcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm51bWJlci13cmFwcGVyXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cIm51bWJlclwiIG1pbj1cIiR7bWlufVwiIG1heD1cIiR7bWF4fVwiIHN0ZXA9XCIke3N0ZXB9XCIgdmFsdWU9XCIke3RoaXMuX3ZhbHVlfVwiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1bml0XCI+JHt1bml0fTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5gO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIodGhpcy50eXBlKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQoYHNsaWRlci0ke3NpemV9YCk7XG5cbiAgICB0aGlzLiRyYW5nZSA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5yYW5nZScpO1xuICAgIHRoaXMuJG51bWJlciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0W3R5cGU9XCJudW1iZXJcIl1gKTtcblxuICAgIHRoaXMuc2xpZGVyID0gbmV3IGd1aUNvbXBvbmVudHMuU2xpZGVyKHtcbiAgICAgIGNvbnRhaW5lcjogdGhpcy4kcmFuZ2UsXG4gICAgICBjYWxsYmFjazogdGhpcy5fb25TbGlkZXJDaGFuZ2UsXG4gICAgICBtaW46IG1pbixcbiAgICAgIG1heDogbWF4LFxuICAgICAgc3RlcDogc3RlcCxcbiAgICAgIGRlZmF1bHQ6IHRoaXMuX3ZhbHVlLFxuICAgICAgZm9yZWdyb3VuZENvbG9yOiAnI2FiYWJhYicsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVzaXplKCkge1xuICAgIHN1cGVyLnJlc2l6ZSgpO1xuXG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0wqB9ID0gdGhpcy4kcmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5zbGlkZXIucmVzaXplKHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9iaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJG51bWJlci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQodGhpcy4kbnVtYmVyLnZhbHVlKTtcbiAgICAgIC8vIHRoZSBzbGlkZXIgcHJvcGFnYXRlcyB0aGUgdmFsdWVcbiAgICAgIHRoaXMuc2xpZGVyLnZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuXG4gICAgICB0aGlzLmV4ZWN1dGVMaXN0ZW5lcnModGhpcy5fdmFsdWUpO1xuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfb25TbGlkZXJDaGFuZ2UodmFsdWUpIHtcbiAgICB0aGlzLiRudW1iZXIudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuXG4gICAgdGhpcy5leGVjdXRlTGlzdGVuZXJzKHRoaXMuX3ZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTbGlkZXI7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBkZWZhdWx0OiAnJyxcbiAgcmVhZG9ubHk6IGZhbHNlLFxuICBjb250YWluZXI6IG51bGwsXG4gIGNhbGxiYWNrOiBudWxsLFxufVxuXG4vKipcbiAqIFRleHQgY29udHJvbGxlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbmZpZy5sYWJlbCAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtBcnJheX0gW2NvbmZpZy5kZWZhdWx0PScnXSAtIERlZmF1bHQgdmFsdWUgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0FycmF5fSBbY29uZmlnLnJlYWRvbmx5PWZhbHNlXSAtIERlZmluZSBpZiB0aGUgY29udHJvbGxlciBpcyByZWFkb25seS5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRvbGxlcnMnO1xuICpcbiAqIGNvbnN0IHRleHQgPSBuZXcgY29udHJvbGxlcnMuVGV4dCh7XG4gKiAgIGxhYmVsOiAnTXkgVGV4dCcsXG4gKiAgIGRlZmF1bHQ6ICdkZWZhdWx0IHZhbHVlJyxcbiAqICAgcmVhZG9ubHk6IGZhbHNlLFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6ICh2YWx1ZSkgPT4gY29uc29sZS5sb2codmFsdWUpLFxuICogfSk7XG4gKi9cbmNsYXNzIFRleHQgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3RleHQnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5wYXJhbXMuZGVmYXVsdDtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlLlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgIHRoaXMuJGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcmVhZG9ubHkgPSB0aGlzLnBhcmFtcy5yZWFkb25seSA/ICdyZWFkb25seScgOiAnJztcbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPiR7dGhpcy5wYXJhbXMubGFiZWx9PC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cImlubmVyLXdyYXBwZXJcIj5cbiAgICAgICAgPGlucHV0IGNsYXNzPVwidGV4dFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3RoaXMuX3ZhbHVlfVwiICR7cmVhZG9ubHl9IC8+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLnRleHQnKTtcblxuICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgIHJldHVybiB0aGlzLiRlbDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBiaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKCkgPT4ge1xuICAgICAgdGhpcy5fdmFsdWUgPSB0aGlzLiRpbnB1dC52YWx1ZTtcbiAgICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHQ7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBjb250YWluZXI6IG51bGwsXG59O1xuXG4vKipcbiAqIFRpdGxlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXIgZnJvbSAnYmFzaWMtY29udHJvbGxlcnMnO1xuICpcbiAqIGNvbnN0IHRpdGxlID0gbmV3IGNvbnRyb2xsZXJzLlRpdGxlKHtcbiAqICAgbGFiZWw6ICdNeSBUaXRsZScsXG4gKiAgIGNvbnRhaW5lcjogJyNjb250YWluZXInXG4gKiB9KTtcbiAqL1xuY2xhc3MgVGl0bGUgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3RpdGxlJywgZGVmYXVsdHMsIGNvbmZpZyk7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb250ZW50ID0gYDxzcGFuIGNsYXNzPVwibGFiZWxcIj4ke3RoaXMucGFyYW1zLmxhYmVsfTwvc3Bhbj5gO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgcmV0dXJuIHRoaXMuJGVsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpdGxlO1xuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBkaXNwbGF5IGZyb20gJy4uL21peGlucy9kaXNwbGF5JztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxhYmVsOiAnJmJuc3A7JyxcbiAgYWN0aXZlOiBmYWxzZSxcbiAgY29udGFpbmVyOiBudWxsLFxuICBjYWxsYmFjazogbnVsbCxcbn07XG5cbi8qKlxuICogT24vT2ZmIGNvbnRyb2xsZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIE92ZXJyaWRlIGRlZmF1bHQgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjb25maWcubGFiZWwgLSBMYWJlbCBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7QXJyYXl9IFtjb25maWcuYWN0aXZlPWZhbHNlXSAtIERlZmF1bHQgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCB0b2dnbGUgPSBuZXcgY29udHJvbGxlcnMuVG9nZ2xlKHtcbiAqICAgbGFiZWw6ICdNeSBUb2dnbGUnLFxuICogICBhY3RpdmU6IGZhbHNlLFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6IChhY3RpdmUpID0+IGNvbnNvbGUubG9nKGFjdGl2ZSksXG4gKiB9KTtcbiAqL1xuY2xhc3MgVG9nZ2xlIGV4dGVuZHMgZGlzcGxheShCYXNlQ29tcG9uZW50KSB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCd0b2dnbGUnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIHRoaXMuX2FjdGl2ZSA9IHRoaXMucGFyYW1zLmFjdGl2ZTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgdG9nZ2xlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgc2V0IHZhbHVlKGJvb2wpIHtcbiAgICB0aGlzLmFjdGl2ZSA9IGJvb2w7XG4gIH1cblxuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgYHZhbHVlYC5cbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBzZXQgYWN0aXZlKGJvb2wpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSBib29sO1xuICAgIHRoaXMuX3VwZGF0ZUJ0bigpO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF91cGRhdGVCdG4oKSB7XG4gICAgdmFyIG1ldGhvZCA9IHRoaXMuYWN0aXZlID8gJ2FkZCcgOiAncmVtb3ZlJztcbiAgICB0aGlzLiR0b2dnbGUuY2xhc3NMaXN0W21ldGhvZF0oJ2FjdGl2ZScpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgY29udGVudCA9IGBcbiAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj4ke3RoaXMucGFyYW1zLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpbm5lci13cmFwcGVyXCI+XG4gICAgICAgICR7ZWxlbWVudHMudG9nZ2xlfVxuICAgICAgPC9kaXY+YDtcblxuICAgIHRoaXMuJGVsID0gc3VwZXIucmVuZGVyKCk7XG4gICAgdGhpcy4kZWwuY2xhc3NMaXN0LmFkZCgnYWxpZ24tc21hbGwnKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgdGhpcy4kdG9nZ2xlID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLnRvZ2dsZS1lbGVtZW50Jyk7XG4gICAgLy8gaW5pdGlhbGl6ZSBzdGF0ZVxuICAgIHRoaXMuYWN0aXZlID0gdGhpcy5fYWN0aXZlO1xuICAgIHRoaXMuYmluZEV2ZW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXMuJGVsO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGJpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kdG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5hY3RpdmUgPSAhdGhpcy5hY3RpdmU7XG4gICAgICB0aGlzLmV4ZWN1dGVMaXN0ZW5lcnModGhpcy5fYWN0aXZlKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBvcHRpb25zOiBudWxsLFxuICBjb250YWluZXI6IG51bGwsXG4gIGNhbGxiYWNrOiBudWxsLFxufTtcblxuLyoqXG4gKiBMaXN0IG9mIGJ1dHRvbnMgd2l0aG91dCBzdGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbmZpZy5sYWJlbCAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtBcnJheX0gW2NvbmZpZy5vcHRpb25zPW51bGxdIC0gT3B0aW9ucyBmb3IgZWFjaCBidXR0b24uXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29uZmlnLmNhbGxiYWNrPW51bGxdIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGVcbiAqICB2YWx1ZSBjaGFuZ2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdiYXNpYy1jb250cm9sbGVycyc7XG4gKlxuICogY29uc3QgdHJpZ2dlckJ1dHRvbnMgPSBuZXcgY29udHJvbGxlcnMuVHJpZ2dlckJ1dHRvbnMoe1xuICogICBsYWJlbDogJ015IFRyaWdnZXIgQnV0dG9ucycsXG4gKiAgIG9wdGlvbnM6IFsndmFsdWUgMScsICd2YWx1ZSAyJywgJ3ZhbHVlIDMnXSxcbiAqICAgY29udGFpbmVyOiAnI2NvbnRhaW5lcicsXG4gKiAgIGNhbGxiYWNrOiAodmFsdWUsIGluZGV4KSA9PiBjb25zb2xlLmxvZyh2YWx1ZSwgaW5kZXgpLFxuICogfSk7XG4gKi9cbmNsYXNzIFRyaWdnZXJCdXR0b25zIGV4dGVuZHMgZGlzcGxheShCYXNlQ29tcG9uZW50KSB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCd0cmlnZ2VyLWJ1dHRvbnMnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnBhcmFtcy5vcHRpb25zKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJpZ2dlckJ1dHRvbjogSW52YWxpZCBvcHRpb24gXCJvcHRpb25zXCInKTtcblxuICAgIHRoaXMuX2luZGV4ID0gbnVsbDtcbiAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG5cbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogTGFzdCB0cmlnZ2VyZWQgYnV0dG9uIHZhbHVlLlxuICAgKlxuICAgKiBAcmVhZG9ubHlcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCB2YWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG5cbiAgLyoqXG4gICAqIExhc3QgdHJpZ2dlcmVkIGJ1dHRvbiBpbmRleC5cbiAgICpcbiAgICogQHJlYWRvbmx5XG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgaW5kZXgoKSB7IHJldHVybiB0aGlzLl9pbmRleDsgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgb3B0aW9ucyB9ID0gdGhpcy5wYXJhbXM7XG5cbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPiR7bGFiZWx9PC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cImlubmVyLXdyYXBwZXJcIj5cbiAgICAgICAgJHtvcHRpb25zLm1hcCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgIHJldHVybiBgPGEgaHJlZj1cIiNcIiBjbGFzcz1cImJ0blwiPiR7b3B0aW9ufTwvYT5gO1xuICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgIDwvZGl2PmA7XG5cbiAgICB0aGlzLiRlbCA9IHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuJGVsLmlubmVySFRNTCA9IGNvbnRlbnQ7XG5cbiAgICB0aGlzLiRidXR0b25zID0gQXJyYXkuZnJvbSh0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuYnRuJykpO1xuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcblxuICAgIHJldHVybiB0aGlzLiRlbDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLiRidXR0b25zLmZvckVhY2goKCRidG4sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGFyYW1zLm9wdGlvbnNbaW5kZXhdO1xuXG4gICAgICAkYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlTGlzdGVuZXJzKHZhbHVlLCBpbmRleCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmlnZ2VyQnV0dG9ucztcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50cy9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBHcm91cCBmcm9tICcuL2NvbXBvbmVudHMvR3JvdXAnO1xuaW1wb3J0IE51bWJlckJveCBmcm9tICcuL2NvbXBvbmVudHMvTnVtYmVyQm94JztcbmltcG9ydCBTZWxlY3RCdXR0b25zIGZyb20gJy4vY29tcG9uZW50cy9TZWxlY3RCdXR0b25zJztcbmltcG9ydCBTZWxlY3RMaXN0IGZyb20gJy4vY29tcG9uZW50cy9TZWxlY3RMaXN0JztcbmltcG9ydCBTbGlkZXIgZnJvbSAnLi9jb21wb25lbnRzL1NsaWRlcic7XG5pbXBvcnQgVGV4dCBmcm9tICcuL2NvbXBvbmVudHMvVGV4dCc7XG5pbXBvcnQgVGl0bGUgZnJvbSAnLi9jb21wb25lbnRzL1RpdGxlJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnLi9jb21wb25lbnRzL1RvZ2dsZSc7XG5pbXBvcnQgVHJpZ2dlckJ1dHRvbnMgZnJvbSAnLi9jb21wb25lbnRzL1RyaWdnZXJCdXR0b25zJztcblxuaW1wb3J0IGNvbnRhaW5lciBmcm9tICcuL21peGlucy9jb250YWluZXInO1xuXG4vLyBtYXAgdHlwZSBuYW1lcyB0byBjb25zdHJ1Y3RvcnNcbmNvbnN0IHR5cGVDdG9yTWFwID0ge1xuICAnZ3JvdXAnOiBHcm91cCxcbiAgJ251bWJlci1ib3gnOiBOdW1iZXJCb3gsXG4gICdzZWxlY3QtYnV0dG9ucyc6IFNlbGVjdEJ1dHRvbnMsXG4gICdzZWxlY3QtbGlzdCc6IFNlbGVjdExpc3QsXG4gICdzbGlkZXInOiBTbGlkZXIsXG4gICd0ZXh0JzogVGV4dCxcbiAgJ3RpdGxlJzogVGl0bGUsXG4gICd0b2dnbGUnOiBUb2dnbGUsXG4gICd0cmlnZ2VyLWJ1dHRvbnMnOiBUcmlnZ2VyQnV0dG9ucyxcbn07XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBjb250YWluZXI6ICdib2R5Jyxcbn07XG5cbmNsYXNzIENvbnRyb2wgZXh0ZW5kcyBjb250YWluZXIoQmFzZUNvbXBvbmVudCkge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcignY29udHJvbCcsIGRlZmF1bHRzLCBjb25maWcpO1xuXG4gICAgbGV0ICRjb250YWluZXIgPSB0aGlzLnBhcmFtcy5jb250YWluZXI7XG5cbiAgICBpZiAodHlwZW9mICRjb250YWluZXIgPT09ICdzdHJpbmcnKVxuICAgICAgJGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJGNvbnRhaW5lcik7XG5cbiAgICB0aGlzLiRjb250YWluZXIgPSAkY29udGFpbmVyO1xuICB9XG59XG5cbi8qKiBAbW9kdWxlIGJhc2ljLWNvbnRyb2xsZXJzICovXG5cbi8qKlxuICogQ3JlYXRlIGEgd2hvbGUgY29udHJvbCBzdXJmYWNlIGZyb20gYSBqc29uIGRlZmluaXRpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gY29udGFpbmVyIC0gQ29udGFpbmVyIG9mIHRoZSBjb250cm9scy5cbiAqIEBwYXJhbSB7T2JqZWN0fSAtIERlZmluaXRpb25zIGZvciB0aGUgY29udHJvbHMuXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gQSBgQ29udHJvbGAgaW5zdGFuY2UgdGhhdCBiZWhhdmVzIGxpa2UgYSBncm91cCB3aXRob3V0IGdyYXBoaWMuXG4gKiBAc3RhdGljXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCBkZWZpbml0aW9ucyA9IFtcbiAqICAge1xuICogICAgIGlkOiAnbXktc2xpZGVyJyxcbiAqICAgICB0eXBlOiAnc2xpZGVyJyxcbiAqICAgICBsYWJlbDogJ015IFNsaWRlcicsXG4gKiAgICAgc2l6ZTogJ2xhcmdlJyxcbiAqICAgICBtaW46IDAsXG4gKiAgICAgbWF4OiAxMDAwLFxuICogICAgIHN0ZXA6IDEsXG4gKiAgICAgZGVmYXVsdDogMjUzLFxuICogICB9LCB7XG4gKiAgICAgaWQ6ICdteS1ncm91cCcsXG4gKiAgICAgdHlwZTogJ2dyb3VwJyxcbiAqICAgICBsYWJlbDogJ0dyb3VwJyxcbiAqICAgICBkZWZhdWx0OiAnb3BlbmVkJyxcbiAqICAgICBlbGVtZW50czogW1xuICogICAgICAge1xuICogICAgICAgICBpZDogJ215LW51bWJlcicsXG4gKiAgICAgICAgIHR5cGU6ICdudW1iZXItYm94JyxcbiAqICAgICAgICAgZGVmYXVsdDogMC40LFxuICogICAgICAgICBtaW46IC0xLFxuICogICAgICAgICBtYXg6IDEsXG4gKiAgICAgICAgIHN0ZXA6IDAuMDEsXG4gKiAgICAgICB9XG4gKiAgICAgXSxcbiAqICAgfVxuICogXTtcbiAqXG4gKiBjb25zdCBjb250cm9scyA9IGNvbnRyb2xsZXJzLmNyZWF0ZSgnI2NvbnRhaW5lcicsIGRlZmluaXRpb25zKTtcbiAqXG4gKiAvLyBhZGQgYSBsaXN0ZW5lciBvbiBhbGwgdGhlIGNvbXBvbmVudCBpbnNpZGUgYG15LWdyb3VwYFxuICogY29udHJvbHMuYWRkTGlzdGVuZXIoJ215LWdyb3VwJywgKGlkLCB2YWx1ZSkgPT4gY29uc29sZS5sb2coaWQsIHZhbHVlKSk7XG4gKlxuICogLy8gcmV0cmlldmUgdGhlIGluc3RhbmNlIG9mIGBteS1udW1iZXJgXG4gKiBjb25zdCBteU51bWJlciA9IGNvbnRyb2xzLmdldENvbXBvbmVudCgnbXktZ3JvdXAvbXktbnVtYmVyJyk7XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZShjb250YWluZXIsIGRlZmluaXRpb25zKSB7XG5cbiAgZnVuY3Rpb24gX3BhcnNlKGNvbnRhaW5lciwgZGVmaW5pdGlvbnMpIHtcbiAgICBkZWZpbml0aW9ucy5mb3JFYWNoKChkZWYsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gZGVmLnR5cGU7XG4gICAgICBjb25zdCBjdG9yID0gdHlwZUN0b3JNYXBbdHlwZV07XG4gICAgICBjb25zdCBjb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBkZWYpO1xuXG4gICAgICAvL1xuICAgICAgY29uZmlnLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgIGRlbGV0ZSBjb25maWcudHlwZTtcblxuICAgICAgY29uc3QgY29tcG9uZW50ID0gbmV3IGN0b3IoY29uZmlnKTtcblxuICAgICAgaWYgKHR5cGUgPT09ICdncm91cCcpXG4gICAgICAgIF9wYXJzZShjb21wb25lbnQsIGNvbmZpZy5lbGVtZW50cyk7XG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgX3Jvb3QgPSBuZXcgQ29udHJvbCh7IGNvbnRhaW5lcjogY29udGFpbmVyIH0pO1xuICBfcGFyc2UoX3Jvb3QsIGRlZmluaXRpb25zKTtcblxuICByZXR1cm4gX3Jvb3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZTtcbiIsImltcG9ydCAqIGFzIF9zdHlsZXMgZnJvbSAnLi91dGlscy9zdHlsZXMnO1xuZXhwb3J0IGNvbnN0IHN0eWxlcyA9IF9zdHlsZXM7XG5cbi8qKiBAbW9kdWxlIGJhc2ljLWNvbnRyb2xsZXJzICovXG5cbi8vIGV4cG9zZSBmb3IgcGx1Z2luc1xuaW1wb3J0IF9CYXNlQ29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50cy9CYXNlQ29tcG9uZW50JztcbmV4cG9ydCBjb25zdCBCYXNlQ29tcG9uZW50ID0gX0Jhc2VDb21wb25lbnQ7XG5cbi8vIGNvbXBvbmVudHNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgR3JvdXAgfSBmcm9tICcuL2NvbXBvbmVudHMvR3JvdXAnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBEcmFnQW5kRHJvcCB9IGZyb20gJy4vY29tcG9uZW50cy9EcmFnQW5kRHJvcCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIE51bWJlckJveCB9IGZyb20gJy4vY29tcG9uZW50cy9OdW1iZXJCb3gnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWxlY3RCdXR0b25zIH0gZnJvbSAnLi9jb21wb25lbnRzL1NlbGVjdEJ1dHRvbnMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWxlY3RMaXN0IH0gZnJvbSAnLi9jb21wb25lbnRzL1NlbGVjdExpc3QnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTbGlkZXIgfSBmcm9tICcuL2NvbXBvbmVudHMvU2xpZGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGV4dCB9IGZyb20gJy4vY29tcG9uZW50cy9UZXh0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGl0bGUgfSBmcm9tICcuL2NvbXBvbmVudHMvVGl0bGUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUb2dnbGUgfSBmcm9tICcuL2NvbXBvbmVudHMvVG9nZ2xlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVHJpZ2dlckJ1dHRvbnMgfSBmcm9tICcuL2NvbXBvbmVudHMvVHJpZ2dlckJ1dHRvbnMnO1xuXG4vLyBmYWN0b3J5XG5leHBvcnQgeyBkZWZhdWx0IGFzIGNyZWF0ZSB9IGZyb20gJy4vZmFjdG9yeSc7XG4vLyBkaXNwbGF5XG5leHBvcnQgeyBzZXRUaGVtZSAgfSBmcm9tICcuL21peGlucy9kaXNwbGF5JztcblxuLyoqXG4gKiBEaXNhYmxlIGRlZmF1bHQgc3R5bGluZyAoZXhwZWN0IGEgYnJva2VuIHVpKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVN0eWxlcygpIHtcbiAgX3N0eWxlcy5kaXNhYmxlKCk7XG59O1xuIiwiXG5jb25zdCBzZXBhcmF0b3IgPSAnLyc7XG5cbmZ1bmN0aW9uIGdldEhlYWQocGF0aCkge1xuICByZXR1cm4gcGF0aC5zcGxpdChzZXBhcmF0b3IpWzBdO1xufVxuXG5mdW5jdGlvbiBnZXRUYWlsKHBhdGgpIHtcbiAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KHNlcGFyYXRvcik7XG4gIHBhcnRzLnNoaWZ0KCk7XG4gIHJldHVybiBwYXJ0cy5qb2luKHNlcGFyYXRvcik7XG59XG5cbmNvbnN0IGNvbnRhaW5lciA9IChzdXBlcmNsYXNzKSA9PiBjbGFzcyBleHRlbmRzIHN1cGVyY2xhc3Mge1xuICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gc3VyZSBvZiB0aGF0ID9cbiAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzO1xuICAgIGRlbGV0ZSB0aGlzLl9ncm91cExpc3RlbmVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gb25lIG9mIHRoZSBncm91cCBjaGlsZHJlbiBhY2NvcmRpbmcgdG8gaXRzIGBpZGAsIGBudWxsYCBvdGhlcndpc2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0SGVhZChpZCkge1xuXG4gIH1cblxuICBfZ2V0VGFpbChpZCkge1xuXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgY2hpbGQgb2YgdGhlIGdyb3VwIHJlY3Vyc2l2ZWx5IGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gYGlkYCxcbiAgICogYG51bGxgIG90aGVyd2lzZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldENvbXBvbmVudChpZCkge1xuICAgIGNvbnN0IGhlYWQgPSBnZXRIZWFkKGlkKTtcblxuICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiB0aGlzLmVsZW1lbnRzKSB7XG4gICAgICBpZiAoaGVhZCA9PT0gY29tcG9uZW50LmlkKSB7XG4gICAgICAgIGlmIChoZWFkID09PSBpZClcbiAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgICAgICBlbHNlIGlmIChjb21wb25lbnQudHlwZSA9ICdncm91cCcpXG4gICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5nZXRDb21wb25lbnQoZ2V0VGFpbChpZCkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgY29tcG9uZW50ICR7aWR9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgY29tcG9uZW50ICR7aWR9YCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIExpc3RlbmVyIG9uIGVhY2ggY29tcG9uZW50cyBvZiB0aGUgZ3JvdXAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFBhdGggdG8gY29tcG9uZW50IGlkLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUuXG4gICAqL1xuICBhZGRMaXN0ZW5lcihpZCwgY2FsbGJhY2spIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY2FsbGJhY2sgPSBpZDtcbiAgICAgIHRoaXMuX2FkZEdyb3VwTGlzdGVuZXIoJycsICcnLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FkZEdyb3VwTGlzdGVuZXIoaWQsICcnLCBjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9hZGRHcm91cExpc3RlbmVyKGlkLCBjYWxsSWQsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGlkKSB7XG4gICAgICBjb25zdCBjb21wb25lbnRJZCA9IGdldEhlYWQoaWQpO1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5nZXRDb21wb25lbnQoY29tcG9uZW50SWQpO1xuXG4gICAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICAgIGlkID0gZ2V0VGFpbChpZCk7XG4gICAgICAgIGNvbXBvbmVudC5fYWRkR3JvdXBMaXN0ZW5lcihpZCwgY2FsbElkLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCBjb21wb25lbnQgJHt0aGlzLnJvb3RJZH0vJHtjb21wb25lbnRJZH1gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgICAgbGV0IF9jYWxsSWQgPSBjYWxsSWQ7IC8vIGNyZWF0ZSBhIG5ldyBicmFuY2hlXG4gICAgICAgIF9jYWxsSWQgKz0gKGNhbGxJZCA9PT0gJycpID8gY29tcG9uZW50LmlkIDogc2VwYXJhdG9yICsgY29tcG9uZW50LmlkO1xuICAgICAgICBjb21wb25lbnQuX2FkZEdyb3VwTGlzdGVuZXIoaWQsIF9jYWxsSWQsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb250YWluZXI7XG4iLCJpbXBvcnQgKiBhcyBzdHlsZXMgZnJvbSAnLi4vdXRpbHMvc3R5bGVzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuLy8gZGVmYXVsdCB0aGVtZVxubGV0IHRoZW1lID0gJ2xpZ2h0Jztcbi8vIHNldCBvZiB0aGUgaW5zdGFuY2lhdGVkIGNvbnRyb2xsZXJzXG5jb25zdCBjb250cm9sbGVycyA9IG5ldyBTZXQoKTtcblxuXG4vKipcbiAqIENoYW5nZSB0aGUgdGhlbWUgb2YgdGhlIGNvbnRyb2xsZXJzLCBjdXJyZW50bHkgMyB0aGVtZXMgYXJlIGF2YWlsYWJsZTpcbiAqICAtIGAnbGlnaHQnYCAoZGVmYXVsdClcbiAqICAtIGAnZ3JleSdgXG4gKiAgLSBgJ2RhcmsnYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0aGVtZSAtIE5hbWUgb2YgdGhlIHRoZW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VGhlbWUodmFsdWUpIHtcbiAgY29udHJvbGxlcnMuZm9yRWFjaCgoY29udHJvbGxlcikgPT4gY29udHJvbGxlci4kZWwuY2xhc3NMaXN0LnJlbW92ZSh0aGVtZSkpO1xuICB0aGVtZSA9IHZhbHVlO1xuICBjb250cm9sbGVycy5mb3JFYWNoKChjb250cm9sbGVyKSA9PiBjb250cm9sbGVyLiRlbC5jbGFzc0xpc3QuYWRkKHRoZW1lKSk7XG59XG5cbi8qKlxuICogZGlzcGxheSBtaXhpbiAtIGNvbXBvbmVudHMgd2l0aCBET01cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGRpc3BsYXkgPSAoc3VwZXJjbGFzcykgPT4gY2xhc3MgZXh0ZW5kcyBzdXBlcmNsYXNzIHtcbiAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpO1xuXG4gICAgLy8gaW5zZXJ0IHN0eWxlcyB3aGVuIHRoZSBmaXJzdCBjb250cm9sbGVyIGlzIGNyZWF0ZWRcbiAgICBpZiAoY29udHJvbGxlcnMuc2l6ZSA9PT0gMClcbiAgICAgIHN0eWxlcy5pbnNlcnRTdHlsZVNoZWV0KCk7XG5cbiAgICB0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcyk7XG5cbiAgICBjb250cm9sbGVycy5hZGQodGhpcyk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGxldCAkY29udGFpbmVyID0gdGhpcy5wYXJhbXMuY29udGFpbmVyO1xuXG4gICAgaWYgKCRjb250YWluZXIpIHtcbiAgICAgIC8vIGNzcyBzZWxlY3RvclxuICAgICAgaWYgKHR5cGVvZiAkY29udGFpbmVyID09PSAnc3RyaW5nJykge1xuICAgICAgICAkY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigkY29udGFpbmVyKTtcbiAgICAgIC8vIGdyb3VwXG4gICAgICB9IGVsc2UgaWYgKCRjb250YWluZXIuJGNvbnRhaW5lcikge1xuICAgICAgICAvLyB0aGlzLmdyb3VwID0gJGNvbnRhaW5lcjtcbiAgICAgICAgJGNvbnRhaW5lci5lbGVtZW50cy5hZGQodGhpcyk7XG4gICAgICAgICRjb250YWluZXIgPSAkY29udGFpbmVyLiRjb250YWluZXI7XG4gICAgICB9XG5cbiAgICAgICRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXIoKSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVzaXplKCksIDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgdGhpcy4kZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKHN0eWxlcy5ucywgdGhlbWUsIHRoaXMudHlwZSk7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZSk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVzaXplKCkge1xuICAgIGlmICh0aGlzLiRlbCkge1xuICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gdGhpcy4kZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBjb25zdCB3aWR0aCA9IGJvdW5kaW5nUmVjdC53aWR0aDtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHdpZHRoID4gNjAwID8gJ3JlbW92ZScgOiAnYWRkJztcblxuICAgICAgdGhpcy4kZWwuY2xhc3NMaXN0W21ldGhvZF0oJ3NtYWxsJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpc3BsYXk7XG4iLCJcbmV4cG9ydCBjb25zdCB0b2dnbGUgPSBgXG4gIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGNsYXNzPVwidG9nZ2xlLWVsZW1lbnRcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCA1MCA1MFwiIHByZXNlcnZlQXNwZWN0UmF0aW89XCJub25lXCI+XG4gICAgICA8ZyBjbGFzcz1cInhcIj5cbiAgICAgICAgPGxpbmUgeDE9XCI4XCIgeTE9XCI4XCIgeDI9XCI0MlwiIHkyPVwiNDJcIiBzdHJva2U9XCJ3aGl0ZVwiIC8+XG4gICAgICAgIDxsaW5lIHgxPVwiOFwiIHkxPVwiNDJcIiB4Mj1cIjQyXCIgeTI9XCI4XCIgc3Ryb2tlPVwid2hpdGVcIiAvPlxuICAgICAgPC9nPlxuICA8L3N2Zz5cbmA7XG5cbmV4cG9ydCBjb25zdCBhcnJvd1JpZ2h0ID0gYFxuICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzcz1cImFycm93LXJpZ2h0XCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgNTAgNTBcIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwibm9uZVwiPlxuICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjEwXCIgeDI9XCI0MFwiIHkyPVwiMjVcIiAvPlxuICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjQwXCIgeDI9XCI0MFwiIHkyPVwiMjVcIiAvPlxuICA8L3N2Zz5cbmA7XG5cbmV4cG9ydCBjb25zdCBhcnJvd0xlZnQgPSBgXG4gIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGNsYXNzPVwiYXJyb3ctbGVmdFwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDUwIDUwXCIgcHJlc2VydmVBc3BlY3RSYXRpbz1cIm5vbmVcIj5cbiAgICA8bGluZSB4MT1cIjQwXCIgeTE9XCIxMFwiIHgyPVwiMTBcIiB5Mj1cIjI1XCIgLz5cbiAgICA8bGluZSB4MT1cIjQwXCIgeTE9XCI0MFwiIHgyPVwiMTBcIiB5Mj1cIjI1XCIgLz5cbiAgPC9zdmc+XG5gO1xuXG5leHBvcnQgY29uc3Qgc21hbGxBcnJvd1JpZ2h0ID0gYFxuICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzcz1cInNtYWxsLWFycm93LXJpZ2h0XCIgdmlld0JveD1cIjAgMCA1MCA1MFwiPlxuICAgIDxwYXRoIGQ9XCJNIDIwIDE1IEwgMzUgMjUgTCAyMCAzNSBaXCIgLz5cbiAgPC9zdmc+XG5gO1xuXG5leHBvcnQgY29uc3Qgc21hbGxBcnJvd0JvdHRvbSA9IGBcbiAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3M9XCJzbWFsbC1hcnJvdy1ib3R0b21cIiB2aWV3Qm94PVwiMCAwIDUwIDUwXCI+XG4gICAgPHBhdGggZD1cIk0gMTUgMTcgTCAzNSAxNyBMIDI1IDMyIFpcIiAvPlxuICA8L3N2Zz5cbmA7XG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiIC5iYXNpYy1jb250cm9sbGVycyB7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIHsgd2lkdGg6IDEwMCU7IG1heC13aWR0aDogODAwcHg7IGhlaWdodDogMzRweDsgcGFkZGluZzogM3B4OyBtYXJnaW46IDRweCAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZWZlZmVmOyBib3JkZXI6IDFweCBzb2xpZCAjYWFhYWFhOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyBib3JkZXItcmFkaXVzOiAycHg7IGRpc3BsYXk6IGJsb2NrOyBjb2xvcjogIzQ2NDY0NjsgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lOyAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lOyAta2h0bWwtdXNlci1zZWxlY3Q6IG5vbmU7IC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7IC1tcy11c2VyLXNlbGVjdDogbm9uZTsgdXNlci1zZWxlY3Q6IG5vbmU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5sYWJlbCB7IGZvbnQ6IGl0YWxpYyBub3JtYWwgMS4yZW0gUXVpY2tzYW5kLCBhcmlhbCwgc2Fucy1zZXJpZjsgbGluZS1oZWlnaHQ6IDI2cHg7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtYWxpZ246IHJpZ2h0OyBwYWRkaW5nOiAwIDhweCAwIDA7IGRpc3BsYXk6IGJsb2NrOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyB3aWR0aDogMjQlOyBmbG9hdDogbGVmdDsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTsgLW1vei11c2VyLXNlbGVjdDogbm9uZTsgLW1zLXVzZXItc2VsZWN0OiBub25lOyAtby11c2VyLXNlbGVjdDogbm9uZTsgdXNlci1zZWxlY3Q6IG5vbmU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5pbm5lci13cmFwcGVyIHsgZGlzcGxheTogLXdlYmtpdC1pbmxpbmUtZmxleDsgZGlzcGxheTogaW5saW5lLWZsZXg7IC13ZWJraXQtZmxleC13cmFwOiBuby13cmFwOyBmbGV4LXdyYXA6IG5vLXdyYXA7IHdpZHRoOiA3NiU7IGZsb2F0OiBsZWZ0OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCB7IGhlaWdodDogNDhweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGw6bm90KC5hbGlnbi1zbWFsbCkgeyBoZWlnaHQ6IGF1dG87IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsOm5vdCguYWxpZ24tc21hbGwpIC5sYWJlbCB7IHdpZHRoOiAxMDAlOyBmbG9hdDogbm9uZTsgdGV4dC1hbGlnbjogbGVmdDsgbGluZS1oZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsOm5vdCguYWxpZ24tc21hbGwpIC5pbm5lci13cmFwcGVyIHsgd2lkdGg6IDEwMCU7IGZsb2F0OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbC5hbGlnbi1zbWFsbCAubGFiZWwgeyBkaXNwbGF5OiBibG9jazsgbWFyZ2luLXJpZ2h0OiAyMHB4OyB0ZXh0LWFsaWduOiBsZWZ0OyBsaW5lLWhlaWdodDogNDBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGwuYWxpZ24tc21hbGwgLmlubmVyLXdyYXBwZXIgeyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHdpZHRoOiBhdXRvOyB9IC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctbGVmdCB7IGJvcmRlci1yYWRpdXM6IDJweDsgd2lkdGg6IDE0cHg7IGhlaWdodDogMjZweDsgY3Vyc29yOiBwb2ludGVyOyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyB9IC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctcmlnaHQgbGluZSwgLmJhc2ljLWNvbnRyb2xsZXJzIC5hcnJvdy1sZWZ0IGxpbmUgeyBzdHJva2Utd2lkdGg6IDNweDsgc3Ryb2tlOiAjZmZmZmZmOyB9IC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctcmlnaHQ6aG92ZXIsIC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctbGVmdDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICM2ODY4Njg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5hcnJvdy1yaWdodDphY3RpdmUsIC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctbGVmdDphY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycyAuc21hbGwtYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycyAuc21hbGwtYXJyb3ctYm90dG9tIHsgd2lkdGg6IDI2cHg7IGhlaWdodDogMjZweDsgY3Vyc29yOiBwb2ludGVyOyB9IC5iYXNpYy1jb250cm9sbGVycyAuc21hbGwtYXJyb3ctcmlnaHQgcGF0aCwgLmJhc2ljLWNvbnRyb2xsZXJzIC5zbWFsbC1hcnJvdy1ib3R0b20gcGF0aCB7IGZpbGw6ICM5MDkwOTA7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5zbWFsbC1hcnJvdy1yaWdodDpob3ZlciBwYXRoLCAuYmFzaWMtY29udHJvbGxlcnMgLnNtYWxsLWFycm93LWJvdHRvbTpob3ZlciBwYXRoIHsgZmlsbDogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMgLnRvZ2dsZS1lbGVtZW50IHsgd2lkdGg6IDI2cHg7IGhlaWdodDogMjZweDsgYm9yZGVyLXJhZGl1czogMnB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyBjdXJzb3I6IHBvaW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICM2ODY4Njg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudCBsaW5lIHsgc3Ryb2tlLXdpZHRoOiAzcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudCAueCB7IGRpc3BsYXk6IG5vbmU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudC5hY3RpdmUgLnggeyBkaXNwbGF5OiBibG9jazsgfSAuYmFzaWMtY29udHJvbGxlcnMgLmJ0biB7IGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQ6IG5vcm1hbCBub3JtYWwgMTJweCBhcmlhbDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBoZWlnaHQ6IDI2cHg7IGxpbmUtaGVpZ2h0OiAyNnB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjZmZmZmZmOyBtYXJnaW46IDAgNHB4IDAgMDsgcGFkZGluZzogMDsgYm94LXNpemluZzogYm9yZGVyLWJveDsgYm9yZGVyLXJhZGl1czogMnB4OyBjdXJzb3I6IHBvaW50ZXI7IC13ZWJraXQtZmxleC1ncm93OiAxOyBmbGV4LWdyb3c6IDE7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5idG46bGFzdC1jaGlsZCB7IG1hcmdpbjogMDsgfSAuYmFzaWMtY29udHJvbGxlcnMgLmJ0bjpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICM2ODY4Njg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5idG46YWN0aXZlLCAuYmFzaWMtY29udHJvbGxlcnMgLmJ0bi5hY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycyAuYnRuOmZvY3VzIHsgb3V0bGluZTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMgLm51bWJlciB7IGhlaWdodDogMjZweDsgZGlzcGxheTogaW5saW5lLWJsb2NrOyBwb3NpdGlvbjogcmVsYXRpdmU7IGZvbnQ6IG5vcm1hbCBub3JtYWwgMS4yZW0gUXVpY2tzYW5kLCBhcmlhbCwgc2Fucy1zZXJpZjsgdmVydGljYWwtYWxpZ246IHRvcDsgYm9yZGVyOiBub25lOyBiYWNrZ3JvdW5kOiBub25lOyBjb2xvcjogIzQ2NDY0NjsgcGFkZGluZzogMCA0cHg7IG1hcmdpbjogMDsgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjlmOTsgYm9yZGVyLXJhZGl1czogMnB4OyBib3gtc2l6aW5nOiBib3JkZXItYm94OyB9IC5iYXNpYy1jb250cm9sbGVycyAubnVtYmVyOmZvY3VzIHsgb3V0bGluZTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMgc2VsZWN0IHsgaGVpZ2h0OiAyNnB4OyBsaW5lLWhlaWdodDogMjZweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjlmOTsgYm9yZGVyLXJhZGl1czogMnB4OyBib3JkZXI6IG5vbmU7IHZlcnRpY2FsLWFsaWduOiB0b3A7IHBhZGRpbmc6IDA7IG1hcmdpbjogMDsgfSAuYmFzaWMtY29udHJvbGxlcnMgc2VsZWN0OmZvY3VzIHsgb3V0bGluZTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMgaW5wdXRbdHlwZT10ZXh0XSB7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDI2cHg7IGxpbmUtaGVpZ2h0OiAyNnB4OyBib3JkZXI6IDA7IHBhZGRpbmc6IDAgNHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmOWY5OyBib3JkZXItcmFkaXVzOiAycHg7IGNvbG9yOiAjNTY1NjU2OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCAuYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCAuYXJyb3ctbGVmdCB7IHdpZHRoOiAyNHB4OyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsIC50b2dnbGUtZWxlbWVudCB7IHdpZHRoOiA0MHB4OyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsIC5idG4geyBoZWlnaHQ6IDQwcHg7IGxpbmUtaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCAubnVtYmVyIHsgaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCBzZWxlY3QgeyBoZWlnaHQ6IDQwcHg7IGxpbmUtaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCBpbnB1dFt0eXBlPXRleHRdIHsgaGVpZ2h0OiA0MHB4OyBsaW5lLWhlaWdodDogNDBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMudGl0bGUgeyBib3JkZXI6IG5vbmUgIWltcG9ydGFudDsgbWFyZ2luLWJvdHRvbTogMDsgbWFyZ2luLXRvcDogOHB4OyBwYWRkaW5nLXRvcDogOHB4OyBwYWRkaW5nLWJvdHRvbTogMDsgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQgIWltcG9ydGFudDsgaGVpZ2h0OiAyNXB4OyB9IC5iYXNpYy1jb250cm9sbGVycy50aXRsZSAubGFiZWwgeyBmb250OiBub3JtYWwgYm9sZCAxLjNlbSBRdWlja3NhbmQsIGFyaWFsLCBzYW5zLXNlcmlmOyBoZWlnaHQ6IDEwMCU7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtYWxpZ246IGxlZnQ7IHBhZGRpbmc6IDA7IHdpZHRoOiAxMDAlOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyAtd2Via2l0LWZsZXgtZ3JvdzogMTsgZmxleC1ncm93OiAxOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cCB7IGhlaWdodDogYXV0bzsgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwIC5ncm91cC1oZWFkZXIgLmxhYmVsIHsgZm9udDogbm9ybWFsIGJvbGQgMS4zZW0gUXVpY2tzYW5kLCBhcmlhbCwgc2Fucy1zZXJpZjsgaGVpZ2h0OiAyNnB4OyBsaW5lLWhlaWdodDogMjZweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1hbGlnbjogbGVmdDsgcGFkZGluZzogMCAwIDAgMzZweDsgd2lkdGg6IDEwMCU7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC13ZWJraXQtZmxleC1ncm93OiAxOyBmbGV4LWdyb3c6IDE7IGZsb2F0OiBub25lOyBjdXJzb3I6IHBvaW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LXJpZ2h0IHsgd2lkdGg6IDI2cHg7IGhlaWdodDogMjZweDsgcG9zaXRpb246IGFic29sdXRlOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cCAuZ3JvdXAtaGVhZGVyIC5zbWFsbC1hcnJvdy1ib3R0b20geyB3aWR0aDogMjZweDsgaGVpZ2h0OiAyNnB4OyBwb3NpdGlvbjogYWJzb2x1dGU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwIC5ncm91cC1jb250ZW50IHsgb3ZlcmZsb3c6IGhpZGRlbjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAgLmdyb3VwLWNvbnRlbnQgPiBkaXYgeyBtYXJnaW46IDRweCBhdXRvOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cCAuZ3JvdXAtY29udGVudCA+IGRpdjpsYXN0LWNoaWxkIHsgbWFyZ2luLWJvdHRvbTogMDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAub3BlbmVkIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LXJpZ2h0IHsgZGlzcGxheTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAub3BlbmVkIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LWJvdHRvbSB7IGRpc3BsYXk6IGJsb2NrOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cC5vcGVuZWQgLmdyb3VwLWNvbnRlbnQgeyBkaXNwbGF5OiBibG9jazsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAuY2xvc2VkIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LXJpZ2h0IHsgZGlzcGxheTogYmxvY2s7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwLmNsb3NlZCAuZ3JvdXAtaGVhZGVyIC5zbWFsbC1hcnJvdy1ib3R0b20geyBkaXNwbGF5OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cC5jbG9zZWQgLmdyb3VwLWNvbnRlbnQgeyBkaXNwbGF5OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLnJhbmdlIHsgaGVpZ2h0OiAyNnB4OyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IG1hcmdpbjogMDsgLXdlYmtpdC1mbGV4LWdyb3c6IDQ7IGZsZXgtZ3JvdzogNDsgcG9zaXRpb246IHJlbGF0aXZlOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLnJhbmdlIGNhbnZhcyB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAwOyBsZWZ0OiAwOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLm51bWJlci13cmFwcGVyIHsgZGlzcGxheTogaW5saW5lOyBoZWlnaHQ6IDI2cHg7IHRleHQtYWxpZ246IHJpZ2h0OyAtd2Via2l0LWZsZXgtZ3JvdzogMzsgZmxleC1ncm93OiAzOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLm51bWJlci13cmFwcGVyIC5udW1iZXIgeyBsZWZ0OiA1cHg7IHdpZHRoOiA1NHB4OyB0ZXh0LWFsaWduOiByaWdodDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc2xpZGVyIC5udW1iZXItd3JhcHBlciAudW5pdCB7IGZvbnQ6IGl0YWxpYyBub3JtYWwgMWVtIFF1aWNrc2FuZCwgYXJpYWwsIHNhbnMtc2VyaWY7IGxpbmUtaGVpZ2h0OiAyNnB4OyBoZWlnaHQ6IDI2cHg7IHdpZHRoOiAzMHB4OyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHBvc2l0aW9uOiByZWxhdGl2ZTsgcGFkZGluZy1sZWZ0OiA1cHg7IHBhZGRpbmctcmlnaHQ6IDVweDsgY29sb3I6ICM1NjU2NTY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNsaWRlciAubnVtYmVyLXdyYXBwZXIgLnVuaXQgc3VwIHsgbGluZS1oZWlnaHQ6IDdweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc2xpZGVyLnNsaWRlci1sYXJnZSAucmFuZ2UgeyAtd2Via2l0LWZsZXgtZ3JvdzogNTA7IGZsZXgtZ3JvdzogNTA7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNsaWRlci5zbGlkZXItbGFyZ2UgLm51bWJlci13cmFwcGVyIHsgLXdlYmtpdC1mbGV4LWdyb3c6IDE7IGZsZXgtZ3JvdzogMTsgfSAuYmFzaWMtY29udHJvbGxlcnMuc2xpZGVyLnNsaWRlci1zbWFsbCAucmFuZ2UgeyAtd2Via2l0LWZsZXgtZ3JvdzogMjsgZmxleC1ncm93OiAyOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIuc2xpZGVyLXNtYWxsIC5udW1iZXItd3JhcHBlciB7IC13ZWJraXQtZmxleC1ncm93OiA0OyBmbGV4LWdyb3c6IDQ7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsLnNsaWRlciAucmFuZ2UgeyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsLnNsaWRlciAubnVtYmVyLXdyYXBwZXIgeyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsLnNsaWRlciAubnVtYmVyLXdyYXBwZXIgLnVuaXQgeyBsaW5lLWhlaWdodDogNDBweDsgaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5udW1iZXItYm94IC5udW1iZXIgeyB3aWR0aDogMTIwcHg7IG1hcmdpbjogMCAxMHB4OyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyB9IC5iYXNpYy1jb250cm9sbGVycy5zZWxlY3QtbGlzdCBzZWxlY3QgeyBtYXJnaW46IDAgMTBweDsgd2lkdGg6IDEyMHB4OyBmb250OiBub3JtYWwgbm9ybWFsIDEuMmVtIFF1aWNrc2FuZCwgYXJpYWwsIHNhbnMtc2VyaWY7IGNvbG9yOiAjNDY0NjQ2OyB9IC5iYXNpYy1jb250cm9sbGVycy5zZWxlY3QtYnV0dG9ucyAuYnRuOmZpcnN0LW9mLXR5cGUgeyBtYXJnaW4tbGVmdDogNHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy50ZXh0IGlucHV0W3R5cGU9dGV4dF0geyBmb250OiBub3JtYWwgbm9ybWFsIDEuMmVtIFF1aWNrc2FuZCwgYXJpYWwsIHNhbnMtc2VyaWY7IGNvbG9yOiAjNDY0NjQ2OyB9IC5iYXNpYy1jb250cm9sbGVycy5kcmFnLWFuZC1kcm9wIHsgd2lkdGg6IDEwMCU7IHRleHQtYWxpZ246IGNlbnRlcjsgZm9udC13ZWlnaHQ6IGJvbGQ7IGhlaWdodDogMTAwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRyYWctYW5kLWRyb3AgLmRyb3Atem9uZSB7IGJvcmRlcjogMXB4IGRvdHRlZCAjYzRjNGM0OyBib3JkZXItcmFkaXVzOiAycHg7IHRyYW5zaXRpb246IGJhY2tncm91bmQgMjAwbXM7IGhlaWdodDogOTBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lLmRyYWcgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjYzRjNGM0OyB9IC5iYXNpYy1jb250cm9sbGVycy5kcmFnLWFuZC1kcm9wIC5sYWJlbCB7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiA5MHB4OyBsaW5lLWhlaWdodDogOTBweDsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwOyB0ZXh0LWFsaWduOiBjZW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRyYWctYW5kLWRyb3AucHJvY2VzcyAubGFiZWwgeyBkaXNwbGF5OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbC5kcmFnLWFuZC1kcm9wIHsgaGVpZ2h0OiAxMjBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGwuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lIHsgaGVpZ2h0OiAxMTBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGwuZHJhZy1hbmQtZHJvcCAubGFiZWwgeyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTEwcHg7IGxpbmUtaGVpZ2h0OiAxMTBweDsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwOyB0ZXh0LWFsaWduOiBjZW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzYzNjM2OyBib3JkZXI6IDFweCBzb2xpZCAjNTg1ODU4OyBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAudG9nZ2xlLWVsZW1lbnQgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZWZlZmVmOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC50b2dnbGUtZWxlbWVudCBsaW5lIHsgc3Ryb2tlOiAjMzYzNjM2OyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC50b2dnbGUtZWxlbWVudDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICNjZGNkY2Q7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0LCAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuYXJyb3ctbGVmdCB7IGJhY2tncm91bmQtY29sb3I6ICNlZmVmZWY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0IGxpbmUsIC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC5hcnJvdy1sZWZ0IGxpbmUgeyBzdHJva2U6ICMzNjM2MzY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0OmhvdmVyLCAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuYXJyb3ctbGVmdDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICNjZGNkY2Q7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0OmFjdGl2ZSwgLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LWxlZnQ6YWN0aXZlIHsgYmFja2dyb3VuZC1jb2xvcjogI2FiYWJhYjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuc21hbGwtYXJyb3ctcmlnaHQgcGF0aCwgLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLnNtYWxsLWFycm93LWJvdHRvbSBwYXRoIHsgZmlsbDogI2FiYWJhYjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuc21hbGwtYXJyb3ctcmlnaHQ6aG92ZXIgcGF0aCwgLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLnNtYWxsLWFycm93LWJvdHRvbTpob3ZlciBwYXRoIHsgZmlsbDogI2NkY2RjZDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAubnVtYmVyLCAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSBzZWxlY3QsIC5iYXNpYy1jb250cm9sbGVycy5ncmV5IGlucHV0W3R5cGU9dGV4dF0geyBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTsgYmFja2dyb3VuZC1jb2xvcjogIzQ1NDU0NTsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuYnRuIHsgYmFja2dyb3VuZC1jb2xvcjogI2VmZWZlZjsgY29sb3I6ICMzNjM2MzY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmJ0bjpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICNjZGNkY2Q7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmJ0bjphY3RpdmUsIC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC5idG4uYWN0aXZlIHsgYmFja2dyb3VuZC1jb2xvcjogI2FiYWJhYjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleS5zbGlkZXIgLmlubmVyLXdyYXBwZXIgLm51bWJlci13cmFwcGVyIC51bml0IHsgY29sb3I6ICNiY2JjYmM7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkuZ3JvdXAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjNTA1MDUwOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5LmRyYWctYW5kLWRyb3AgLmRyb3Atem9uZSB7IGJvcmRlcjogMXB4IGRvdHRlZCAjNzI3MjcyOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5LmRyYWctYW5kLWRyb3AgLmRyb3Atem9uZS5kcmFnIHsgYmFja2dyb3VuZC1jb2xvcjogIzcyNzI3MjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayB7IGJhY2tncm91bmQtY29sb3I6ICMyNDI0MjQ7IGJvcmRlcjogMXB4IHNvbGlkICMyODI4Mjg7IGNvbG9yOiAjZmZmZmZmOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC50b2dnbGUtZWxlbWVudCB7IGJhY2tncm91bmQtY29sb3I6ICM0NjQ2NDY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLnRvZ2dsZS1lbGVtZW50IGxpbmUgeyBzdHJva2U6ICNmZmZmZmY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLnRvZ2dsZS1lbGVtZW50OmhvdmVyIHsgYmFja2dyb3VuZC1jb2xvcjogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5hcnJvdy1sZWZ0IHsgYmFja2dyb3VuZC1jb2xvcjogIzQ2NDY0NjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQgbGluZSwgLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLmFycm93LWxlZnQgbGluZSB7IHN0cm9rZTogI2ZmZmZmZjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQ6aG92ZXIsIC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5hcnJvdy1sZWZ0OmhvdmVyIHsgYmFja2dyb3VuZC1jb2xvcjogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQ6YWN0aXZlLCAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctbGVmdDphY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5zbWFsbC1hcnJvdy1yaWdodCBwYXRoLCAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuc21hbGwtYXJyb3ctYm90dG9tIHBhdGggeyBmaWxsOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5zbWFsbC1hcnJvdy1yaWdodDpob3ZlciBwYXRoLCAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuc21hbGwtYXJyb3ctYm90dG9tOmhvdmVyIHBhdGggeyBmaWxsOiAjNjg2ODY4OyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5udW1iZXIsIC5iYXNpYy1jb250cm9sbGVycy5kYXJrIHNlbGVjdCwgLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgaW5wdXRbdHlwZT10ZXh0XSB7IGNvbG9yOiAjZmZmZmZmOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzMzMzOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5idG4geyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyBjb2xvcjogI2ZmZmZmZjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYnRuOmhvdmVyIHsgYmFja2dyb3VuZC1jb2xvcjogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYnRuOmFjdGl2ZSwgLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLmJ0bi5hY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrLnNsaWRlciAuaW5uZXItd3JhcHBlciAubnVtYmVyLXdyYXBwZXIgLnVuaXQgeyBjb2xvcjogI2NkY2RjZDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyay5ncm91cCB7IGJhY2tncm91bmQtY29sb3I6ICMzZTNlM2U7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lIHsgYm9yZGVyOiAxcHggZG90dGVkICM0MjQyNDI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lLmRyYWcgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDI0MjQyOyB9IFwiOyIsImltcG9ydCB7IG5hbWUgfSBmcm9tICcuLi8uLi9wYWNrYWdlLmpzb24nO1xuaW1wb3J0IHN0eWxlcyBmcm9tICcuL3N0eWxlcy1kZWNsYXJhdGlvbnMuanMnO1xuXG5leHBvcnQgY29uc3QgbnMgPSBuYW1lLnJlcGxhY2UoJ0BpcmNhbS8nLCAnJyk7XG5cbmNvbnN0IG5zQ2xhc3MgPSBgLiR7bnN9YDtcbmxldCBfZGlzYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gIF9kaXNhYmxlZCA9IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRTdHlsZVNoZWV0KCkge1xuICBpZiAoX2Rpc2FibGVkKSByZXR1cm47XG5cbiAgY29uc3QgJGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICRjc3Muc2V0QXR0cmlidXRlKCdkYXRhLW5hbWVzcGFjZScsIG5zKTtcbiAgJGNzcy50eXBlID0gJ3RleHQvY3NzJztcblxuICBpZiAoJGNzcy5zdHlsZVNoZWV0KVxuICAgICRjc3Muc3R5bGVTaGVldC5jc3NUZXh0ID0gc3R5bGVzO1xuICBlbHNlXG4gICAgJGNzcy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHlsZXMpKTtcblxuICAvLyBpbnNlcnQgYmVmb3JlIGxpbmsgb3Igc3R5bGVzIGlmIGV4aXN0c1xuICBjb25zdCAkbGluayA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcignbGluaycpO1xuICBjb25zdCAkc3R5bGUgPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ3N0eWxlJyk7XG5cbiAgaWYgKCRsaW5rKVxuICAgIGRvY3VtZW50LmhlYWQuaW5zZXJ0QmVmb3JlKCRjc3MsICRsaW5rKTtcbiAgZWxzZSBpZiAoJHN0eWxlKVxuICAgIGRvY3VtZW50LmhlYWQuaW5zZXJ0QmVmb3JlKCRjc3MsICRzdHlsZSk7XG4gIGVsc2VcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKCRjc3MpO1xufVxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiX2Zyb21cIjogXCJAaXJjYW0vYmFzaWMtY29udHJvbGxlcnNcIixcbiAgXCJfaWRcIjogXCJAaXJjYW0vYmFzaWMtY29udHJvbGxlcnNAMS4wLjRcIixcbiAgXCJfaW5CdW5kbGVcIjogZmFsc2UsXG4gIFwiX2ludGVncml0eVwiOiBcInNoYTUxMi0zY1NBdHhmcFh0ZzFhM2h2eVZKTjVnTm1mcXdmNW1TYnh1eHEyZzlJNi9yb1Vzd3R4T2dHd1l3V1YxOFVKRldSNzVNcW90NVNTVnZiTGRQUGd2MW5vQT09XCIsXG4gIFwiX2xvY2F0aW9uXCI6IFwiL0BpcmNhbS9iYXNpYy1jb250cm9sbGVyc1wiLFxuICBcIl9waGFudG9tQ2hpbGRyZW5cIjoge30sXG4gIFwiX3JlcXVlc3RlZFwiOiB7XG4gICAgXCJ0eXBlXCI6IFwidGFnXCIsXG4gICAgXCJyZWdpc3RyeVwiOiB0cnVlLFxuICAgIFwicmF3XCI6IFwiQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzXCIsXG4gICAgXCJuYW1lXCI6IFwiQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzXCIsXG4gICAgXCJlc2NhcGVkTmFtZVwiOiBcIkBpcmNhbSUyZmJhc2ljLWNvbnRyb2xsZXJzXCIsXG4gICAgXCJzY29wZVwiOiBcIkBpcmNhbVwiLFxuICAgIFwicmF3U3BlY1wiOiBcIlwiLFxuICAgIFwic2F2ZVNwZWNcIjogbnVsbCxcbiAgICBcImZldGNoU3BlY1wiOiBcImxhdGVzdFwiXG4gIH0sXG4gIFwiX3JlcXVpcmVkQnlcIjogW1xuICAgIFwiI1VTRVJcIixcbiAgICBcIi9cIlxuICBdLFxuICBcIl9yZXNvbHZlZFwiOiBcImh0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy8tL2Jhc2ljLWNvbnRyb2xsZXJzLTEuMC40LnRnelwiLFxuICBcIl9zaGFzdW1cIjogXCIyZTIxNTJjNjE4YmFlOTQ2MTI2YjhlYmY0MWJhZWI5NWNiM2M0MGY4XCIsXG4gIFwiX3NwZWNcIjogXCJAaXJjYW0vYmFzaWMtY29udHJvbGxlcnNcIixcbiAgXCJfd2hlcmVcIjogXCIvVXNlcnMvbWF0dXN6ZXdza2kvZGV2L2pzL3dhdmVzanMvbGliL3dhdmVzLWF1ZGlvL2V4YW1wbGVzL3NpbXBsZS1zY2hlZHVsZXJcIixcbiAgXCJidWdzXCI6IHtcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9pcmNhbS1qc3Rvb2xzL2Jhc2ljLWNvbnRyb2xsZXJzL2lzc3Vlc1wiXG4gIH0sXG4gIFwiYnVuZGxlRGVwZW5kZW5jaWVzXCI6IGZhbHNlLFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAaXJjYW0vZ3VpLWNvbXBvbmVudHNcIjogXCJeMS4wLjNcIlxuICB9LFxuICBcImRlcHJlY2F0ZWRcIjogZmFsc2UsXG4gIFwiZGVzY3JpcHRpb25cIjogXCJTZXQgb2Ygc2ltcGxlIGNvbnRyb2xsZXJzIGZvciByYXBpZCBwcm90b3R5cGluZ1wiLFxuICBcImRldkRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJiYWJlbC1jb3JlXCI6IFwiXjYuMjYuMFwiLFxuICAgIFwiYmFiZWwtcGx1Z2luLXRyYW5zZm9ybS1lczIwMTUtbW9kdWxlcy1jb21tb25qc1wiOiBcIl42LjI2LjBcIixcbiAgICBcImJhYmVsLXByZXNldC1lbnZcIjogXCJeMS42LjFcIixcbiAgICBcImJyb3dzZXJpZnlcIjogXCJeMTQuNS4wXCIsXG4gICAgXCJjaGFsa1wiOiBcIl4yLjMuMFwiLFxuICAgIFwiZnMtZXh0cmFcIjogXCJeNC4wLjNcIixcbiAgICBcImpzZG9jLXRvLW1hcmtkb3duXCI6IFwiXjMuMC4wXCIsXG4gICAgXCJrbGF3XCI6IFwiXjIuMS4xXCIsXG4gICAgXCJub2RlLXNhc3NcIjogXCJeNC43LjJcIixcbiAgICBcIm5wXCI6IFwiXjIuMTguMlwiLFxuICAgIFwidGFwZVwiOiBcIl40LjguMFwiLFxuICAgIFwidWdsaWZ5LWpzXCI6IFwiXjMuMi4yXCIsXG4gICAgXCJ3YXRjaFwiOiBcIl4xLjAuMlwiXG4gIH0sXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL2dpdGh1Yi5jb20vaXJjYW0tanN0b29scy9iYXNpYy1jb250cm9sbGVycyNyZWFkbWVcIixcbiAgXCJsaWNlbnNlXCI6IFwiQlNELTMtQ2xhdXNlXCIsXG4gIFwibWFpblwiOiBcImRpc3QvaW5kZXguanNcIixcbiAgXCJuYW1lXCI6IFwiQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzXCIsXG4gIFwicHVibGlzaENvbmZpZ1wiOiB7XG4gICAgXCJhY2Nlc3NcIjogXCJwdWJsaWNcIlxuICB9LFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiZ2l0K2h0dHBzOi8vZ2l0aHViLmNvbS9pcmNhbS1qc3Rvb2xzL2Jhc2ljLWNvbnRyb2xsZXJzLmdpdFwiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJidW5kbGVcIjogXCJub2RlIC4vYmluL3J1bm5lciAtLWJ1bmRsZVwiLFxuICAgIFwiZGVwbG95XCI6IFwibnAgLS15b2xvXCIsXG4gICAgXCJkb2NcIjogXCJqc2RvYzJtZCAtdCB0bXBsL1JFQURNRS5oYnMgc3JjLyoqLyouanMgPiBSRUFETUUubWRcIixcbiAgICBcInByZXdhdGNoXCI6IFwibnBtIHJ1biB0cmFuc3BpbGVcIixcbiAgICBcInRyYW5zcGlsZVwiOiBcIm5vZGUgLi9iaW4vcnVubmVyIC0tdHJhbnNwaWxlXCIsXG4gICAgXCJ2ZXJzaW9uXCI6IFwibnBtIHJ1biB0cmFuc3BpbGUgJiYgbnBtIHJ1biBkb2MgJiYgZ2l0IGFkZCBSRUFETUUubWRcIixcbiAgICBcIndhdGNoXCI6IFwibm9kZSAuL2Jpbi9ydW5uZXIgLS13YXRjaFwiXG4gIH0sXG4gIFwic3RhbmRhbG9uZVwiOiBcImJhc2ljQ29udHJvbGxlcnNcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMS4wLjRcIlxufVxuIiwiLyoqXG4gKiBAbW9kdWxlIGd1aS1jb21wb25lbnRzXG4gKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2xpZGVyIH0gZnJvbSAnLi9TbGlkZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBCcmVha3BvaW50IH0gZnJvbSAnLi9CcmVha3BvaW50JztcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vbWFwXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZlwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZlwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9zeW1ib2xcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2l0ZXJhdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2RlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcIi4uL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWZpbmVQcm9wZXJ0eSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAoMCwgX2RlZmluZVByb3BlcnR5Mi5kZWZhdWx0KSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX3NldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4uL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfc2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9jcmVhdGVcIik7XG5cbnZhciBfY3JlYXRlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZSk7XG5cbnZhciBfdHlwZW9mMiA9IHJlcXVpcmUoXCIuLi9oZWxwZXJzL3R5cGVvZlwiKTtcblxudmFyIF90eXBlb2YzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdHlwZW9mMik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgXCIgKyAodHlwZW9mIHN1cGVyQ2xhc3MgPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogKDAsIF90eXBlb2YzLmRlZmF1bHQpKHN1cGVyQ2xhc3MpKSk7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSAoMCwgX2NyZWF0ZTIuZGVmYXVsdCkoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZjIuZGVmYXVsdCA/ICgwLCBfc2V0UHJvdG90eXBlT2YyLmRlZmF1bHQpKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX3R5cGVvZjIgPSByZXF1aXJlKFwiLi4vaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAoKHR5cGVvZiBjYWxsID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShjYWxsKSkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfaXRlcmF0b3IgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9zeW1ib2wvaXRlcmF0b3JcIik7XG5cbnZhciBfaXRlcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXRlcmF0b3IpO1xuXG52YXIgX3N5bWJvbCA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL3N5bWJvbFwiKTtcblxudmFyIF9zeW1ib2wyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3ltYm9sKTtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBfaXRlcmF0b3IyLmRlZmF1bHQgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBfc3ltYm9sMi5kZWZhdWx0ICYmIG9iaiAhPT0gX3N5bWJvbDIuZGVmYXVsdC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBfdHlwZW9mKF9pdGVyYXRvcjIuZGVmYXVsdCkgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn0gOiBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IF9zeW1ib2wyLmRlZmF1bHQgJiYgb2JqICE9PSBfc3ltYm9sMi5kZWZhdWx0LnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn07IiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3Lm1hcC5vZicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcubWFwLmZyb20nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLk1hcDtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUnKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpIHtcbiAgcmV0dXJuICRPYmplY3QuY3JlYXRlKFAsIEQpO1xufTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHknKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYykge1xuICByZXR1cm4gJE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKTtcbn07XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC5zZXRQcm90b3R5cGVPZjtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN5bWJvbCcpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczcuc3ltYm9sLmFzeW5jLWl0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNy5zeW1ib2wub2JzZXJ2YWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuU3ltYm9sO1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fd2tzLWV4dCcpLmYoJ2l0ZXJhdG9yJyk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSwgZm9yYmlkZGVuRmllbGQpIHtcbiAgaWYgKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikgfHwgKGZvcmJpZGRlbkZpZWxkICE9PSB1bmRlZmluZWQgJiYgZm9yYmlkZGVuRmllbGQgaW4gaXQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKG5hbWUgKyAnOiBpbmNvcnJlY3QgaW52b2NhdGlvbiEnKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGZvck9mID0gcmVxdWlyZSgnLi9fZm9yLW9mJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXIsIElURVJBVE9SKSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yT2YoaXRlciwgZmFsc2UsIHJlc3VsdC5wdXNoLCByZXN1bHQsIElURVJBVE9SKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4vX3RvLWFic29sdXRlLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykge1xuICAgICAgaWYgKE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcbiIsIi8vIDAgLT4gQXJyYXkjZm9yRWFjaFxuLy8gMSAtPiBBcnJheSNtYXBcbi8vIDIgLT4gQXJyYXkjZmlsdGVyXG4vLyAzIC0+IEFycmF5I3NvbWVcbi8vIDQgLT4gQXJyYXkjZXZlcnlcbi8vIDUgLT4gQXJyYXkjZmluZFxuLy8gNiAtPiBBcnJheSNmaW5kSW5kZXhcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciBhc2MgPSByZXF1aXJlKCcuL19hcnJheS1zcGVjaWVzLWNyZWF0ZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVFlQRSwgJGNyZWF0ZSkge1xuICB2YXIgSVNfTUFQID0gVFlQRSA9PSAxO1xuICB2YXIgSVNfRklMVEVSID0gVFlQRSA9PSAyO1xuICB2YXIgSVNfU09NRSA9IFRZUEUgPT0gMztcbiAgdmFyIElTX0VWRVJZID0gVFlQRSA9PSA0O1xuICB2YXIgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNjtcbiAgdmFyIE5PX0hPTEVTID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVg7XG4gIHZhciBjcmVhdGUgPSAkY3JlYXRlIHx8IGFzYztcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgY2FsbGJhY2tmbiwgdGhhdCkge1xuICAgIHZhciBPID0gdG9PYmplY3QoJHRoaXMpO1xuICAgIHZhciBzZWxmID0gSU9iamVjdChPKTtcbiAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHJlc3VsdCA9IElTX01BUCA/IGNyZWF0ZSgkdGhpcywgbGVuZ3RoKSA6IElTX0ZJTFRFUiA/IGNyZWF0ZSgkdGhpcywgMCkgOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbCwgcmVzO1xuICAgIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZikge1xuICAgICAgdmFsID0gc2VsZltpbmRleF07XG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xuICAgICAgaWYgKFRZUEUpIHtcbiAgICAgICAgaWYgKElTX01BUCkgcmVzdWx0W2luZGV4XSA9IHJlczsgICAvLyBtYXBcbiAgICAgICAgZWxzZSBpZiAocmVzKSBzd2l0Y2ggKFRZUEUpIHtcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAvLyBzb21lXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgIC8vIGZpbmRJbmRleFxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgIC8vIGZpbHRlclxuICAgICAgICB9IGVsc2UgaWYgKElTX0VWRVJZKSByZXR1cm4gZmFsc2U7IC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiByZXN1bHQ7XG4gIH07XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9yaWdpbmFsKSB7XG4gIHZhciBDO1xuICBpZiAoaXNBcnJheShvcmlnaW5hbCkpIHtcbiAgICBDID0gb3JpZ2luYWwuY29uc3RydWN0b3I7XG4gICAgLy8gY3Jvc3MtcmVhbG0gZmFsbGJhY2tcbiAgICBpZiAodHlwZW9mIEMgPT0gJ2Z1bmN0aW9uJyAmJiAoQyA9PT0gQXJyYXkgfHwgaXNBcnJheShDLnByb3RvdHlwZSkpKSBDID0gdW5kZWZpbmVkO1xuICAgIGlmIChpc09iamVjdChDKSkge1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZiAoQyA9PT0gbnVsbCkgQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQztcbn07XG4iLCIvLyA5LjQuMi4zIEFycmF5U3BlY2llc0NyZWF0ZShvcmlnaW5hbEFycmF5LCBsZW5ndGgpXG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9fYXJyYXktc3BlY2llcy1jb25zdHJ1Y3RvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcmlnaW5hbCwgbGVuZ3RoKSB7XG4gIHJldHVybiBuZXcgKHNwZWNpZXNDb25zdHJ1Y3RvcihvcmlnaW5hbCkpKGxlbmd0aCk7XG59O1xuIiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcbi8vIEVTMyB3cm9uZyBoZXJlXG52YXIgQVJHID0gY29mKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59O1xuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xudmFyICRpdGVyRGVmaW5lID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKTtcbnZhciBzdGVwID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJyk7XG52YXIgc2V0U3BlY2llcyA9IHJlcXVpcmUoJy4vX3NldC1zcGVjaWVzJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyIGZhc3RLZXkgPSByZXF1aXJlKCcuL19tZXRhJykuZmFzdEtleTtcbnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vX3ZhbGlkYXRlLWNvbGxlY3Rpb24nKTtcbnZhciBTSVpFID0gREVTQ1JJUFRPUlMgPyAnX3MnIDogJ3NpemUnO1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbiAodGhhdCwga2V5KSB7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSk7XG4gIHZhciBlbnRyeTtcbiAgaWYgKGluZGV4ICE9PSAnRicpIHJldHVybiB0aGF0Ll9pW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvciAoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKSB7XG4gICAgaWYgKGVudHJ5LmsgPT0ga2V5KSByZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpIHtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24gKHRoYXQsIGl0ZXJhYmxlKSB7XG4gICAgICBhbkluc3RhbmNlKHRoYXQsIEMsIE5BTUUsICdfaScpO1xuICAgICAgdGhhdC5fdCA9IE5BTUU7ICAgICAgICAgLy8gY29sbGVjdGlvbiB0eXBlXG4gICAgICB0aGF0Ll9pID0gY3JlYXRlKG51bGwpOyAvLyBpbmRleFxuICAgICAgdGhhdC5fZiA9IHVuZGVmaW5lZDsgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgIC8vIGxhc3QgZW50cnlcbiAgICAgIHRoYXRbU0laRV0gPSAwOyAgICAgICAgIC8vIHNpemVcbiAgICAgIGlmIChpdGVyYWJsZSAhPSB1bmRlZmluZWQpIGZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgICAgZm9yICh2YXIgdGhhdCA9IHZhbGlkYXRlKHRoaXMsIE5BTUUpLCBkYXRhID0gdGhhdC5faSwgZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKSB7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYgKGVudHJ5LnApIGVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5fZiA9IHRoYXQuX2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoYXRbU0laRV0gPSAwO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy4zIE1hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB2YWxpZGF0ZSh0aGlzLCBOQU1FKTtcbiAgICAgICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcbiAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uO1xuICAgICAgICAgIHZhciBwcmV2ID0gZW50cnkucDtcbiAgICAgICAgICBkZWxldGUgdGhhdC5faVtlbnRyeS5pXTtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZiAocHJldikgcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZiAobmV4dCkgbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZiAodGhhdC5fZiA9PSBlbnRyeSkgdGhhdC5fZiA9IG5leHQ7XG4gICAgICAgICAgaWYgKHRoYXQuX2wgPT0gZW50cnkpIHRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qICwgdGhhdCA9IHVuZGVmaW5lZCAqLykge1xuICAgICAgICB2YWxpZGF0ZSh0aGlzLCBOQU1FKTtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpO1xuICAgICAgICB2YXIgZW50cnk7XG4gICAgICAgIHdoaWxlIChlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXMuX2YpIHtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlIChlbnRyeSAmJiBlbnRyeS5yKSBlbnRyeSA9IGVudHJ5LnA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh2YWxpZGF0ZSh0aGlzLCBOQU1FKSwga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoREVTQ1JJUFRPUlMpIGRQKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGUodGhpcywgTkFNRSlbU0laRV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24gKHRoYXQsIGtleSwgdmFsdWUpIHtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgIHZhciBwcmV2LCBpbmRleDtcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcbiAgICBpZiAoZW50cnkpIHtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQuX2wgPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0Ll9sLCAgICAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmICghdGhhdC5fZikgdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYgKHByZXYpIHByZXYubiA9IGVudHJ5O1xuICAgICAgdGhhdFtTSVpFXSsrO1xuICAgICAgLy8gYWRkIHRvIGluZGV4XG4gICAgICBpZiAoaW5kZXggIT09ICdGJykgdGhhdC5faVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIHNldFN0cm9uZzogZnVuY3Rpb24gKEMsIE5BTUUsIElTX01BUCkge1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbiAoaXRlcmF0ZWQsIGtpbmQpIHtcbiAgICAgIHRoaXMuX3QgPSB2YWxpZGF0ZShpdGVyYXRlZCwgTkFNRSk7IC8vIHRhcmdldFxuICAgICAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgICAgICAgLy8ga2luZFxuICAgICAgdGhpcy5fbCA9IHVuZGVmaW5lZDsgICAgICAgICAgICAgICAgLy8gcHJldmlvdXNcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB2YXIga2luZCA9IHRoYXQuX2s7XG4gICAgICB2YXIgZW50cnkgPSB0aGF0Ll9sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZSAoZW50cnkgJiYgZW50cnkucikgZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmICghdGhhdC5fdCB8fCAhKHRoYXQuX2wgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoYXQuX3QuX2YpKSB7XG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXG4gICAgICAgIHRoYXQuX3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBzdGVwKDEpO1xuICAgICAgfVxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxuICAgICAgaWYgKGtpbmQgPT0gJ2tleXMnKSByZXR1cm4gc3RlcCgwLCBlbnRyeS5rKTtcbiAgICAgIGlmIChraW5kID09ICd2YWx1ZXMnKSByZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59O1xuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgZnJvbSA9IHJlcXVpcmUoJy4vX2FycmF5LWZyb20taXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5BTUUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICBpZiAoY2xhc3NvZih0aGlzKSAhPSBOQU1FKSB0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHJldHVybiBmcm9tKHRoaXMpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgbWV0YSA9IHJlcXVpcmUoJy4vX21ldGEnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciByZWRlZmluZUFsbCA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpO1xudmFyIGZvck9mID0gcmVxdWlyZSgnLi9fZm9yLW9mJyk7XG52YXIgYW5JbnN0YW5jZSA9IHJlcXVpcmUoJy4vX2FuLWluc3RhbmNlJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGVhY2ggPSByZXF1aXJlKCcuL19hcnJheS1tZXRob2RzJykoMCk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOQU1FLCB3cmFwcGVyLCBtZXRob2RzLCBjb21tb24sIElTX01BUCwgSVNfV0VBSykge1xuICB2YXIgQmFzZSA9IGdsb2JhbFtOQU1FXTtcbiAgdmFyIEMgPSBCYXNlO1xuICB2YXIgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnO1xuICB2YXIgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlO1xuICB2YXIgTyA9IHt9O1xuICBpZiAoIURFU0NSSVBUT1JTIHx8IHR5cGVvZiBDICE9ICdmdW5jdGlvbicgfHwgIShJU19XRUFLIHx8IHByb3RvLmZvckVhY2ggJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgICBuZXcgQygpLmVudHJpZXMoKS5uZXh0KCk7XG4gIH0pKSkge1xuICAgIC8vIGNyZWF0ZSBjb2xsZWN0aW9uIGNvbnN0cnVjdG9yXG4gICAgQyA9IGNvbW1vbi5nZXRDb25zdHJ1Y3Rvcih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwgbWV0aG9kcyk7XG4gICAgbWV0YS5ORUVEID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbiAodGFyZ2V0LCBpdGVyYWJsZSkge1xuICAgICAgYW5JbnN0YW5jZSh0YXJnZXQsIEMsIE5BTUUsICdfYycpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2UoKTtcbiAgICAgIGlmIChpdGVyYWJsZSAhPSB1bmRlZmluZWQpIGZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRhcmdldFtBRERFUl0sIHRhcmdldCk7XG4gICAgfSk7XG4gICAgZWFjaCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMsdG9KU09OJy5zcGxpdCgnLCcpLCBmdW5jdGlvbiAoS0VZKSB7XG4gICAgICB2YXIgSVNfQURERVIgPSBLRVkgPT0gJ2FkZCcgfHwgS0VZID09ICdzZXQnO1xuICAgICAgaWYgKEtFWSBpbiBwcm90byAmJiAhKElTX1dFQUsgJiYgS0VZID09ICdjbGVhcicpKSBoaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIGFuSW5zdGFuY2UodGhpcywgQywgS0VZKTtcbiAgICAgICAgaWYgKCFJU19BRERFUiAmJiBJU19XRUFLICYmICFpc09iamVjdChhKSkgcmV0dXJuIEtFWSA9PSAnZ2V0JyA/IHVuZGVmaW5lZCA6IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBJU19BRERFUiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBJU19XRUFLIHx8IGRQKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYy5zaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GLCBPKTtcblxuICBpZiAoIUlTX1dFQUspIGNvbW1vbi5zZXRTdHJvbmcoQywgTkFNRSwgSVNfTUFQKTtcblxuICByZXR1cm4gQztcbn07XG4iLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0geyB2ZXJzaW9uOiAnMi41LjcnIH07XG5pZiAodHlwZW9mIF9fZSA9PSAnbnVtYmVyJykgX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZlxuIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIHRoYXQsIGxlbmd0aCkge1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZiAodGhhdCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZm47XG4gIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuIiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbi8vIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnIGluIG9sZCBJRVxudmFyIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG4iLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IChcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcbikuc3BsaXQoJywnKTtcbiIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XG52YXIgZ09QUyA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJyk7XG52YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIHJlc3VsdCA9IGdldEtleXMoaXQpO1xuICB2YXIgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYgKGdldFN5bWJvbHMpIHtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpO1xuICAgIHZhciBpc0VudW0gPSBwSUUuZjtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGtleTtcbiAgICB3aGlsZSAoc3ltYm9scy5sZW5ndGggPiBpKSBpZiAoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgY29yZSA9IHJlcXVpcmUoJy4vX2NvcmUnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uICh0eXBlLCBuYW1lLCBzb3VyY2UpIHtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkY7XG4gIHZhciBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HO1xuICB2YXIgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuUztcbiAgdmFyIElTX1BST1RPID0gdHlwZSAmICRleHBvcnQuUDtcbiAgdmFyIElTX0JJTkQgPSB0eXBlICYgJGV4cG9ydC5CO1xuICB2YXIgSVNfV1JBUCA9IHR5cGUgJiAkZXhwb3J0Llc7XG4gIHZhciBleHBvcnRzID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIHZhciBleHBQcm90byA9IGV4cG9ydHNbUFJPVE9UWVBFXTtcbiAgdmFyIHRhcmdldCA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV07XG4gIHZhciBrZXksIG93biwgb3V0O1xuICBpZiAoSVNfR0xPQkFMKSBzb3VyY2UgPSBuYW1lO1xuICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIGlmIChvd24gJiYgaGFzKGV4cG9ydHMsIGtleSkpIGNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBleHBvcnRzW2tleV0gPSBJU19HTE9CQUwgJiYgdHlwZW9mIHRhcmdldFtrZXldICE9ICdmdW5jdGlvbicgPyBzb3VyY2Vba2V5XVxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgOiBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbClcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIDogSVNfV1JBUCAmJiB0YXJnZXRba2V5XSA9PSBvdXQgPyAoZnVuY3Rpb24gKEMpIHtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBDKSB7XG4gICAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjYXNlIDA6IHJldHVybiBuZXcgQygpO1xuICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gbmV3IEMoYSk7XG4gICAgICAgICAgICBjYXNlIDI6IHJldHVybiBuZXcgQyhhLCBiKTtcbiAgICAgICAgICB9IHJldHVybiBuZXcgQyhhLCBiLCBjKTtcbiAgICAgICAgfSByZXR1cm4gQy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICAgIEZbUFJPVE9UWVBFXSA9IENbUFJPVE9UWVBFXTtcbiAgICAgIHJldHVybiBGO1xuICAgIC8vIG1ha2Ugc3RhdGljIHZlcnNpb25zIGZvciBwcm90b3R5cGUgbWV0aG9kc1xuICAgIH0pKG91dCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHBvcnQgcHJvdG8gbWV0aG9kcyB0byBjb3JlLiVDT05TVFJVQ1RPUiUubWV0aG9kcy4lTkFNRSVcbiAgICBpZiAoSVNfUFJPVE8pIHtcbiAgICAgIChleHBvcnRzLnZpcnR1YWwgfHwgKGV4cG9ydHMudmlydHVhbCA9IHt9KSlba2V5XSA9IG91dDtcbiAgICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5wcm90b3R5cGUuJU5BTUUlXG4gICAgICBpZiAodHlwZSAmICRleHBvcnQuUiAmJiBleHBQcm90byAmJiAhZXhwUHJvdG9ba2V5XSkgaGlkZShleHBQcm90bywga2V5LCBvdXQpO1xuICAgIH1cbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbiIsInZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBjYWxsID0gcmVxdWlyZSgnLi9faXRlci1jYWxsJyk7XG52YXIgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuL19pcy1hcnJheS1pdGVyJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIGdldEl0ZXJGbiA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG52YXIgQlJFQUsgPSB7fTtcbnZhciBSRVRVUk4gPSB7fTtcbnZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0LCBJVEVSQVRPUikge1xuICB2YXIgaXRlckZuID0gSVRFUkFUT1IgPyBmdW5jdGlvbiAoKSB7IHJldHVybiBpdGVyYWJsZTsgfSA6IGdldEl0ZXJGbihpdGVyYWJsZSk7XG4gIHZhciBmID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpO1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGVuZ3RoLCBzdGVwLCBpdGVyYXRvciwgcmVzdWx0O1xuICBpZiAodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKSB0aHJvdyBUeXBlRXJyb3IoaXRlcmFibGUgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgLy8gZmFzdCBjYXNlIGZvciBhcnJheXMgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yXG4gIGlmIChpc0FycmF5SXRlcihpdGVyRm4pKSBmb3IgKGxlbmd0aCA9IHRvTGVuZ3RoKGl0ZXJhYmxlLmxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKSB7XG4gICAgcmVzdWx0ID0gZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICAgIGlmIChyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKSByZXR1cm4gcmVzdWx0O1xuICB9IGVsc2UgZm9yIChpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOykge1xuICAgIHJlc3VsdCA9IGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpO1xuICAgIGlmIChyZXN1bHQgPT09IEJSRUFLIHx8IHJlc3VsdCA9PT0gUkVUVVJOKSByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuZXhwb3J0cy5CUkVBSyA9IEJSRUFLO1xuZXhwb3J0cy5SRVRVUk4gPSBSRVRVUk47XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZiAodHlwZW9mIF9fZyA9PSAnbnVtYmVyJykgX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwidmFyIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG4iLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59O1xuIiwiLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyIElURVJBVE9SID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyk7XG52YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b1tJVEVSQVRPUl0gPT09IGl0KTtcbn07XG4iLCIvLyA3LjIuMiBJc0FycmF5KGFyZ3VtZW50KVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuIiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhbk9iamVjdCh2YWx1ZSlbMF0sIHZhbHVlWzFdKSA6IGZuKHZhbHVlKTtcbiAgLy8gNy40LjYgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgY29tcGxldGlvbilcbiAgfSBjYXRjaCAoZSkge1xuICAgIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gICAgaWYgKHJldCAhPT0gdW5kZWZpbmVkKSBhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpO1xudmFyIGRlc2NyaXB0b3IgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG5cbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuL19oaWRlJykoSXRlcmF0b3JQcm90b3R5cGUsIHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpIHtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7IG5leHQ6IGRlc2NyaXB0b3IoMSwgbmV4dCkgfSk7XG4gIHNldFRvU3RyaW5nVGFnKENvbnN0cnVjdG9yLCBOQU1FICsgJyBJdGVyYXRvcicpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBMSUJSQVJZID0gcmVxdWlyZSgnLi9fbGlicmFyeScpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbnZhciAkaXRlckNyZWF0ZSA9IHJlcXVpcmUoJy4vX2l0ZXItY3JlYXRlJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpO1xudmFyIElURVJBVE9SID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyk7XG52YXIgQlVHR1kgPSAhKFtdLmtleXMgJiYgJ25leHQnIGluIFtdLmtleXMoKSk7IC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbnZhciBGRl9JVEVSQVRPUiA9ICdAQGl0ZXJhdG9yJztcbnZhciBLRVlTID0gJ2tleXMnO1xudmFyIFZBTFVFUyA9ICd2YWx1ZXMnO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFRCkge1xuICAkaXRlckNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbiAoa2luZCkge1xuICAgIGlmICghQlVHR1kgJiYga2luZCBpbiBwcm90bykgcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gIH07XG4gIHZhciBUQUcgPSBOQU1FICsgJyBJdGVyYXRvcic7XG4gIHZhciBERUZfVkFMVUVTID0gREVGQVVMVCA9PSBWQUxVRVM7XG4gIHZhciBWQUxVRVNfQlVHID0gZmFsc2U7XG4gIHZhciBwcm90byA9IEJhc2UucHJvdG90eXBlO1xuICB2YXIgJG5hdGl2ZSA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXTtcbiAgdmFyICRkZWZhdWx0ID0gJG5hdGl2ZSB8fCBnZXRNZXRob2QoREVGQVVMVCk7XG4gIHZhciAkZW50cmllcyA9IERFRkFVTFQgPyAhREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKCdlbnRyaWVzJykgOiB1bmRlZmluZWQ7XG4gIHZhciAkYW55TmF0aXZlID0gTkFNRSA9PSAnQXJyYXknID8gcHJvdG8uZW50cmllcyB8fCAkbmF0aXZlIDogJG5hdGl2ZTtcbiAgdmFyIG1ldGhvZHMsIGtleSwgSXRlcmF0b3JQcm90b3R5cGU7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYgKCRhbnlOYXRpdmUpIHtcbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvdHlwZU9mKCRhbnlOYXRpdmUuY2FsbChuZXcgQmFzZSgpKSk7XG4gICAgaWYgKEl0ZXJhdG9yUHJvdG90eXBlICE9PSBPYmplY3QucHJvdG90eXBlICYmIEl0ZXJhdG9yUHJvdG90eXBlLm5leHQpIHtcbiAgICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICAgIHNldFRvU3RyaW5nVGFnKEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgICAgLy8gZml4IGZvciBzb21lIG9sZCBlbmdpbmVzXG4gICAgICBpZiAoIUxJQlJBUlkgJiYgdHlwZW9mIEl0ZXJhdG9yUHJvdG90eXBlW0lURVJBVE9SXSAhPSAnZnVuY3Rpb24nKSBoaWRlKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgfVxuICB9XG4gIC8vIGZpeCBBcnJheSN7dmFsdWVzLCBAQGl0ZXJhdG9yfS5uYW1lIGluIFY4IC8gRkZcbiAgaWYgKERFRl9WQUxVRVMgJiYgJG5hdGl2ZSAmJiAkbmF0aXZlLm5hbWUgIT09IFZBTFVFUykge1xuICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCkgeyByZXR1cm4gJG5hdGl2ZS5jYWxsKHRoaXMpOyB9O1xuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZiAoKCFMSUJSQVJZIHx8IEZPUkNFRCkgJiYgKEJVR0dZIHx8IFZBTFVFU19CVUcgfHwgIXByb3RvW0lURVJBVE9SXSkpIHtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddID0gcmV0dXJuVGhpcztcbiAgaWYgKERFRkFVTFQpIHtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiBERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6IElTX1NFVCA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKEtFWVMpLFxuICAgICAgZW50cmllczogJGVudHJpZXNcbiAgICB9O1xuICAgIGlmIChGT1JDRUQpIGZvciAoa2V5IGluIG1ldGhvZHMpIHtcbiAgICAgIGlmICghKGtleSBpbiBwcm90bykpIHJlZGVmaW5lKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XG4gICAgfSBlbHNlICRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5GICogKEJVR0dZIHx8IFZBTFVFU19CVUcpLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxuICByZXR1cm4gbWV0aG9kcztcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkb25lLCB2YWx1ZSkge1xuICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZSB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG4iLCJ2YXIgTUVUQSA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBzZXREZXNjID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBpZCA9IDA7XG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24gKGl0KSB7XG4gIHNldERlc2MoaXQsIE1FVEEsIHsgdmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IH0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gb2JqZWN0IElEXG4gIH0gcmV0dXJuIGl0W01FVEFdLmk7XG59O1xudmFyIGdldFdlYWsgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuIHRydWU7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSkgc2V0TWV0YShpdCk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgbWV0YSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBLRVk6IE1FVEEsXG4gIE5FRUQ6IGZhbHNlLFxuICBmYXN0S2V5OiBmYXN0S2V5LFxuICBnZXRXZWFrOiBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07XG4iLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGRQcyA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcbnZhciBJRV9QUk9UTyA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcbnZhciBFbXB0eSA9IGZ1bmN0aW9uICgpIHsgLyogZW1wdHkgKi8gfTtcbnZhciBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpO1xuICB2YXIgaSA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgdmFyIGx0ID0gJzwnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBpZnJhbWVEb2N1bWVudDtcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArICdzY3JpcHQnICsgZ3QgKyAnZG9jdW1lbnQuRj1PYmplY3QnICsgbHQgKyAnL3NjcmlwdCcgKyBndCk7XG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xuICB3aGlsZSAoaS0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcykge1xuICB2YXIgcmVzdWx0O1xuICBpZiAoTyAhPT0gbnVsbCkge1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKTtcbnZhciBkUCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuIiwidmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIHZhciBrZXlzID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKTtcbiAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHZhciBQO1xuICB3aGlsZSAobGVuZ3RoID4gaSkgZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcbiAgcmV0dXJuIE87XG59O1xuIiwidmFyIHBJRSA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciBnT1BEID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGdPUEQgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCkge1xuICBPID0gdG9JT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gZ09QRChPLCBQKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmIChoYXMoTywgUCkpIHJldHVybiBjcmVhdGVEZXNjKCFwSUUuZi5jYWxsKE8sIFApLCBPW1BdKTtcbn07XG4iLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGdPUE4gPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmY7XG52YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uIChpdCkge1xuICB0cnkge1xuICAgIHJldHVybiBnT1BOKGl0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICByZXR1cm4gd2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScgPyBnZXRXaW5kb3dOYW1lcyhpdCkgOiBnT1BOKHRvSU9iamVjdChpdCkpO1xufTtcbiIsIi8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbnZhciAka2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcblxuZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhPKSB7XG4gIHJldHVybiAka2V5cyhPLCBoaWRkZW5LZXlzKTtcbn07XG4iLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuIiwiLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gKE8pIHtcbiAgTyA9IHRvT2JqZWN0KE8pO1xuICBpZiAoaGFzKE8sIElFX1BST1RPKSkgcmV0dXJuIE9bSUVfUFJPVE9dO1xuICBpZiAodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcikge1xuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcbn07XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIGFycmF5SW5kZXhPZiA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykoZmFsc2UpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSBpZiAoa2V5ICE9IElFX1BST1RPKSBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG4iLCJleHBvcnRzLmYgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiIsIi8vIG1vc3QgT2JqZWN0IG1ldGhvZHMgYnkgRVM2IHNob3VsZCBhY2NlcHQgcHJpbWl0aXZlc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSwgZXhlYykge1xuICB2YXIgZm4gPSAoY29yZS5PYmplY3QgfHwge30pW0tFWV0gfHwgT2JqZWN0W0tFWV07XG4gIHZhciBleHAgPSB7fTtcbiAgZXhwW0tFWV0gPSBleGVjKGZuKTtcbiAgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiBmYWlscyhmdW5jdGlvbiAoKSB7IGZuKDEpOyB9KSwgJ09iamVjdCcsIGV4cCk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGU6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlOiB2YWx1ZVxuICB9O1xufTtcbiIsInZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzcmMsIHNhZmUpIHtcbiAgZm9yICh2YXIga2V5IGluIHNyYykge1xuICAgIGlmIChzYWZlICYmIHRhcmdldFtrZXldKSB0YXJnZXRba2V5XSA9IHNyY1trZXldO1xuICAgIGVsc2UgaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICB9IHJldHVybiB0YXJnZXQ7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19oaWRlJyk7XG4iLCIndXNlIHN0cmljdCc7XG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL3Byb3Bvc2FsLXNldG1hcC1vZmZyb20vXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDT0xMRUNUSU9OKSB7XG4gICRleHBvcnQoJGV4cG9ydC5TLCBDT0xMRUNUSU9OLCB7IGZyb206IGZ1bmN0aW9uIGZyb20oc291cmNlIC8qICwgbWFwRm4sIHRoaXNBcmcgKi8pIHtcbiAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIG1hcHBpbmcsIEEsIG4sIGNiO1xuICAgIGFGdW5jdGlvbih0aGlzKTtcbiAgICBtYXBwaW5nID0gbWFwRm4gIT09IHVuZGVmaW5lZDtcbiAgICBpZiAobWFwcGluZykgYUZ1bmN0aW9uKG1hcEZuKTtcbiAgICBpZiAoc291cmNlID09IHVuZGVmaW5lZCkgcmV0dXJuIG5ldyB0aGlzKCk7XG4gICAgQSA9IFtdO1xuICAgIGlmIChtYXBwaW5nKSB7XG4gICAgICBuID0gMDtcbiAgICAgIGNiID0gY3R4KG1hcEZuLCBhcmd1bWVudHNbMl0sIDIpO1xuICAgICAgZm9yT2Yoc291cmNlLCBmYWxzZSwgZnVuY3Rpb24gKG5leHRJdGVtKSB7XG4gICAgICAgIEEucHVzaChjYihuZXh0SXRlbSwgbisrKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yT2Yoc291cmNlLCBmYWxzZSwgQS5wdXNoLCBBKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyB0aGlzKEEpO1xuICB9IH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS9cbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKENPTExFQ1RJT04pIHtcbiAgJGV4cG9ydCgkZXhwb3J0LlMsIENPTExFQ1RJT04sIHsgb2Y6IGZ1bmN0aW9uIG9mKCkge1xuICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHZhciBBID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSBBW2xlbmd0aF0gPSBhcmd1bWVudHNbbGVuZ3RoXTtcbiAgICByZXR1cm4gbmV3IHRoaXMoQSk7XG4gIH0gfSk7XG59O1xuIiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChPLCBwcm90bykge1xuICBhbk9iamVjdChPKTtcbiAgaWYgKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpIHRocm93IFR5cGVFcnJvcihwcm90byArIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGZ1bmN0aW9uICh0ZXN0LCBidWdneSwgc2V0KSB7XG4gICAgICB0cnkge1xuICAgICAgICBzZXQgPSByZXF1aXJlKCcuL19jdHgnKShGdW5jdGlvbi5jYWxsLCByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmYoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgIHNldCh0ZXN0LCBbXSk7XG4gICAgICAgIGJ1Z2d5ID0gISh0ZXN0IGluc3RhbmNlb2YgQXJyYXkpO1xuICAgICAgfSBjYXRjaCAoZSkgeyBidWdneSA9IHRydWU7IH1cbiAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90bykge1xuICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgIGlmIChidWdneSkgTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xuICAgICAgICByZXR1cm4gTztcbiAgICAgIH07XG4gICAgfSh7fSwgZmFsc2UpIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSkge1xuICB2YXIgQyA9IHR5cGVvZiBjb3JlW0tFWV0gPT0gJ2Z1bmN0aW9uJyA/IGNvcmVbS0VZXSA6IGdsb2JhbFtLRVldO1xuICBpZiAoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSkgZFAuZihDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG4iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIHRhZywgc3RhdCkge1xuICBpZiAoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkgZGVmKGl0LCBUQUcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnIH0pO1xufTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE4IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVE9fU1RSSU5HKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGhhdCwgcG9zKSB7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSk7XG4gICAgdmFyIGkgPSB0b0ludGVnZXIocG9zKTtcbiAgICB2YXIgbCA9IHMubGVuZ3RoO1xuICAgIHZhciBhLCBiO1xuICAgIGlmIChpIDwgMCB8fCBpID49IGwpIHJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07XG4iLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcbiIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG4iLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcbiIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuIiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFMpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBUWVBFKSB7XG4gIGlmICghaXNPYmplY3QoaXQpIHx8IGl0Ll90ICE9PSBUWVBFKSB0aHJvdyBUeXBlRXJyb3IoJ0luY29tcGF0aWJsZSByZWNlaXZlciwgJyArIFRZUEUgKyAnIHJlcXVpcmVkIScpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgTElCUkFSWSA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKTtcbnZhciB3a3NFeHQgPSByZXF1aXJlKCcuL193a3MtZXh0Jyk7XG52YXIgZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICB2YXIgJFN5bWJvbCA9IGNvcmUuU3ltYm9sIHx8IChjb3JlLlN5bWJvbCA9IExJQlJBUlkgPyB7fSA6IGdsb2JhbC5TeW1ib2wgfHwge30pO1xuICBpZiAobmFtZS5jaGFyQXQoMCkgIT0gJ18nICYmICEobmFtZSBpbiAkU3ltYm9sKSkgZGVmaW5lUHJvcGVydHkoJFN5bWJvbCwgbmFtZSwgeyB2YWx1ZTogd2tzRXh0LmYobmFtZSkgfSk7XG59O1xuIiwiZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fd2tzJyk7XG4iLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi9fdWlkJyk7XG52YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sO1xudmFyIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5cbnZhciAkZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG5cbiRleHBvcnRzLnN0b3JlID0gc3RvcmU7XG4iLCJ2YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKTtcbnZhciBJVEVSQVRPUiA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ICE9IHVuZGVmaW5lZCkgcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhZGRUb1Vuc2NvcGFibGVzID0gcmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJyk7XG52YXIgc3RlcCA9IHJlcXVpcmUoJy4vX2l0ZXItc3RlcCcpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcblxuLy8gMjIuMS4zLjQgQXJyYXkucHJvdG90eXBlLmVudHJpZXMoKVxuLy8gMjIuMS4zLjEzIEFycmF5LnByb3RvdHlwZS5rZXlzKClcbi8vIDIyLjEuMy4yOSBBcnJheS5wcm90b3R5cGUudmFsdWVzKClcbi8vIDIyLjEuMy4zMCBBcnJheS5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbiAoaXRlcmF0ZWQsIGtpbmQpIHtcbiAgdGhpcy5fdCA9IHRvSU9iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICB0aGlzLl9rID0ga2luZDsgICAgICAgICAgICAgICAgLy8ga2luZFxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbiAoKSB7XG4gIHZhciBPID0gdGhpcy5fdDtcbiAgdmFyIGtpbmQgPSB0aGlzLl9rO1xuICB2YXIgaW5kZXggPSB0aGlzLl9pKys7XG4gIGlmICghTyB8fCBpbmRleCA+PSBPLmxlbmd0aCkge1xuICAgIHRoaXMuX3QgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYgKGtpbmQgPT0gJ2tleXMnKSByZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmIChraW5kID09ICd2YWx1ZXMnKSByZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuYWRkVG9VbnNjb3BhYmxlcygna2V5cycpO1xuYWRkVG9VbnNjb3BhYmxlcygndmFsdWVzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCdlbnRyaWVzJyk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbi1zdHJvbmcnKTtcbnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vX3ZhbGlkYXRlLWNvbGxlY3Rpb24nKTtcbnZhciBNQVAgPSAnTWFwJztcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uJykoTUFQLCBmdW5jdGlvbiAoZ2V0KSB7XG4gIHJldHVybiBmdW5jdGlvbiBNYXAoKSB7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpOyB9O1xufSwge1xuICAvLyAyMy4xLjMuNiBNYXAucHJvdG90eXBlLmdldChrZXkpXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgIHZhciBlbnRyeSA9IHN0cm9uZy5nZXRFbnRyeSh2YWxpZGF0ZSh0aGlzLCBNQVApLCBrZXkpO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xuICB9LFxuICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodmFsaWRhdGUodGhpcywgTUFQKSwga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpO1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7IGNyZWF0ZTogcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpIH0pO1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpLCAnT2JqZWN0JywgeyBkZWZpbmVQcm9wZXJ0eTogcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZiB9KTtcbiIsIi8vIDE5LjEuMi45IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgJGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldFByb3RvdHlwZU9mJywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpIHtcbiAgICByZXR1cm4gJGdldFByb3RvdHlwZU9mKHRvT2JqZWN0KGl0KSk7XG4gIH07XG59KTtcbiIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7IHNldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuL19zZXQtcHJvdG8nKS5zZXQgfSk7XG4iLCIiLCIndXNlIHN0cmljdCc7XG52YXIgJGF0ID0gcmVxdWlyZSgnLi9fc3RyaW5nLWF0JykodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24gKGl0ZXJhdGVkKSB7XG4gIHRoaXMuX3QgPSBTdHJpbmcoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uICgpIHtcbiAgdmFyIE8gPSB0aGlzLl90O1xuICB2YXIgaW5kZXggPSB0aGlzLl9pO1xuICB2YXIgcG9pbnQ7XG4gIGlmIChpbmRleCA+PSBPLmxlbmd0aCkgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4geyB2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlIH07XG59KTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBNRVRBID0gcmVxdWlyZSgnLi9fbWV0YScpLktFWTtcbnZhciAkZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpO1xudmFyIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuL191aWQnKTtcbnZhciB3a3MgPSByZXF1aXJlKCcuL193a3MnKTtcbnZhciB3a3NFeHQgPSByZXF1aXJlKCcuL193a3MtZXh0Jyk7XG52YXIgd2tzRGVmaW5lID0gcmVxdWlyZSgnLi9fd2tzLWRlZmluZScpO1xudmFyIGVudW1LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1rZXlzJyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKTtcbnZhciBnT1BORXh0ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4tZXh0Jyk7XG52YXIgJEdPUEQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpO1xudmFyICREUCA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpO1xudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BEID0gJEdPUEQuZjtcbnZhciBkUCA9ICREUC5mO1xudmFyIGdPUE4gPSBnT1BORXh0LmY7XG52YXIgJFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XG52YXIgJEpTT04gPSBnbG9iYWwuSlNPTjtcbnZhciBfc3RyaW5naWZ5ID0gJEpTT04gJiYgJEpTT04uc3RyaW5naWZ5O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEhJRERFTiA9IHdrcygnX2hpZGRlbicpO1xudmFyIFRPX1BSSU1JVElWRSA9IHdrcygndG9QcmltaXRpdmUnKTtcbnZhciBpc0VudW0gPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5Jyk7XG52YXIgQWxsU3ltYm9scyA9IHNoYXJlZCgnc3ltYm9scycpO1xudmFyIE9QU3ltYm9scyA9IHNoYXJlZCgnb3Atc3ltYm9scycpO1xudmFyIE9iamVjdFByb3RvID0gT2JqZWN0W1BST1RPVFlQRV07XG52YXIgVVNFX05BVElWRSA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbic7XG52YXIgUU9iamVjdCA9IGdsb2JhbC5RT2JqZWN0O1xuLy8gRG9uJ3QgdXNlIHNldHRlcnMgaW4gUXQgU2NyaXB0LCBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMTczXG52YXIgc2V0dGVyID0gIVFPYmplY3QgfHwgIVFPYmplY3RbUFJPVE9UWVBFXSB8fCAhUU9iamVjdFtQUk9UT1RZUEVdLmZpbmRDaGlsZDtcblxuLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9Njg3XG52YXIgc2V0U3ltYm9sRGVzYyA9IERFU0NSSVBUT1JTICYmICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRQKHRoaXMsICdhJywgeyB2YWx1ZTogNyB9KS5hOyB9XG4gIH0pKS5hICE9IDc7XG59KSA/IGZ1bmN0aW9uIChpdCwga2V5LCBEKSB7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZiAocHJvdG9EZXNjKSBkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmIChwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKSBkUChPYmplY3RQcm90bywga2V5LCBwcm90b0Rlc2MpO1xufSA6IGRQO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uICh0YWcpIHtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbFtQUk9UT1RZUEVdKTtcbiAgc3ltLl9rID0gdGFnO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gVVNFX05BVElWRSAmJiB0eXBlb2YgJFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJyA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgaW5zdGFuY2VvZiAkU3ltYm9sO1xufTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpIHtcbiAgaWYgKGl0ID09PSBPYmplY3RQcm90bykgJGRlZmluZVByb3BlcnR5KE9QU3ltYm9scywga2V5LCBEKTtcbiAgYW5PYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBhbk9iamVjdChEKTtcbiAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkpKSB7XG4gICAgaWYgKCFELmVudW1lcmFibGUpIHtcbiAgICAgIGlmICghaGFzKGl0LCBISURERU4pKSBkUChpdCwgSElEREVOLCBjcmVhdGVEZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkgaXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gX2NyZWF0ZShELCB7IGVudW1lcmFibGU6IGNyZWF0ZURlc2MoMCwgZmFsc2UpIH0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApIHtcbiAgYW5PYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b0lPYmplY3QoUCkpO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsID0ga2V5cy5sZW5ndGg7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsID4gaSkgJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCkge1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gX2NyZWF0ZShpdCkgOiAkZGVmaW5lUHJvcGVydGllcyhfY3JlYXRlKGl0KSwgUCk7XG59O1xudmFyICRwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSkge1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgaXQgPSB0b0lPYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICFoYXMoT1BTeW1ib2xzLCBrZXkpKSByZXR1cm47XG4gIHZhciBEID0gZ09QRChpdCwga2V5KTtcbiAgaWYgKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSkgRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCkge1xuICB2YXIgbmFtZXMgPSBnT1BOKHRvSU9iamVjdChpdCkpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBpID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIHtcbiAgICBpZiAoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKSByZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpIHtcbiAgdmFyIElTX09QID0gaXQgPT09IE9iamVjdFByb3RvO1xuICB2YXIgbmFtZXMgPSBnT1BOKElTX09QID8gT1BTeW1ib2xzIDogdG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmIChoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgKElTX09QID8gaGFzKE9iamVjdFByb3RvLCBrZXkpIDogdHJ1ZSkpIHJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKSB7XG4gICAgaWYgKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKSB0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvciEnKTtcbiAgICB2YXIgdGFnID0gdWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgICB2YXIgJHNldCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMgPT09IE9iamVjdFByb3RvKSAkc2V0LmNhbGwoT1BTeW1ib2xzLCB2YWx1ZSk7XG4gICAgICBpZiAoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSkgdGhpc1tISURERU5dW3RhZ10gPSBmYWxzZTtcbiAgICAgIHNldFN5bWJvbERlc2ModGhpcywgdGFnLCBjcmVhdGVEZXNjKDEsIHZhbHVlKSk7XG4gICAgfTtcbiAgICBpZiAoREVTQ1JJUFRPUlMgJiYgc2V0dGVyKSBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCBzZXQ6ICRzZXQgfSk7XG4gICAgcmV0dXJuIHdyYXAodGFnKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5faztcbiAgfSk7XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mID0gJGRlZmluZVByb3BlcnR5O1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmYgPSBnT1BORXh0LmYgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpLmYgPSAkcHJvcGVydHlJc0VudW1lcmFibGU7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJykuZiA9ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYgKERFU0NSSVBUT1JTICYmICFyZXF1aXJlKCcuL19saWJyYXJ5JykpIHtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxuXG4gIHdrc0V4dC5mID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICByZXR1cm4gd3JhcCh3a3MobmFtZSkpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFN5bWJvbDogJFN5bWJvbCB9KTtcblxuZm9yICh2YXIgZXM2U3ltYm9scyA9IChcbiAgLy8gMTkuNC4yLjIsIDE5LjQuMi4zLCAxOS40LjIuNCwgMTkuNC4yLjYsIDE5LjQuMi44LCAxOS40LjIuOSwgMTkuNC4yLjEwLCAxOS40LjIuMTEsIDE5LjQuMi4xMiwgMTkuNC4yLjEzLCAxOS40LjIuMTRcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBqID0gMDsgZXM2U3ltYm9scy5sZW5ndGggPiBqOyl3a3MoZXM2U3ltYm9sc1tqKytdKTtcblxuZm9yICh2YXIgd2VsbEtub3duU3ltYm9scyA9ICRrZXlzKHdrcy5zdG9yZSksIGsgPSAwOyB3ZWxsS25vd25TeW1ib2xzLmxlbmd0aCA+IGs7KSB3a3NEZWZpbmUod2VsbEtub3duU3ltYm9sc1trKytdKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ1N5bWJvbCcsIHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihzeW0pIHtcbiAgICBpZiAoIWlzU3ltYm9sKHN5bSkpIHRocm93IFR5cGVFcnJvcihzeW0gKyAnIGlzIG5vdCBhIHN5bWJvbCEnKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gU3ltYm9sUmVnaXN0cnkpIGlmIChTeW1ib2xSZWdpc3RyeVtrZXldID09PSBzeW0pIHJldHVybiBrZXk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uICgpIHsgc2V0dGVyID0gZmFsc2U7IH1cbn0pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAkZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMjQuMy4yIEpTT04uc3RyaW5naWZ5KHZhbHVlIFssIHJlcGxhY2VyIFssIHNwYWNlXV0pXG4kSlNPTiAmJiAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCAkZmFpbHMoZnVuY3Rpb24gKCkge1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7IGE6IFMgfSkgIT0gJ3t9JyB8fCBfc3RyaW5naWZ5KE9iamVjdChTKSkgIT0gJ3t9Jztcbn0pKSwgJ0pTT04nLCB7XG4gIHN0cmluZ2lmeTogZnVuY3Rpb24gc3RyaW5naWZ5KGl0KSB7XG4gICAgdmFyIGFyZ3MgPSBbaXRdO1xuICAgIHZhciBpID0gMTtcbiAgICB2YXIgcmVwbGFjZXIsICRyZXBsYWNlcjtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgJHJlcGxhY2VyID0gcmVwbGFjZXIgPSBhcmdzWzFdO1xuICAgIGlmICghaXNPYmplY3QocmVwbGFjZXIpICYmIGl0ID09PSB1bmRlZmluZWQgfHwgaXNTeW1ib2woaXQpKSByZXR1cm47IC8vIElFOCByZXR1cm5zIHN0cmluZyBvbiB1bmRlZmluZWRcbiAgICBpZiAoIWlzQXJyYXkocmVwbGFjZXIpKSByZXBsYWNlciA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mICRyZXBsYWNlciA9PSAnZnVuY3Rpb24nKSB2YWx1ZSA9ICRyZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgICAgaWYgKCFpc1N5bWJvbCh2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICAgIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG4gIH1cbn0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7XG4iLCIvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL3Byb3Bvc2FsLXNldG1hcC1vZmZyb20vI3NlYy1tYXAuZnJvbVxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tZnJvbScpKCdNYXAnKTtcbiIsIi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS8jc2VjLW1hcC5vZlxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tb2YnKSgnTWFwJyk7XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuUiwgJ01hcCcsIHsgdG9KU09OOiByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXRvLWpzb24nKSgnTWFwJykgfSk7XG4iLCJyZXF1aXJlKCcuL193a3MtZGVmaW5lJykoJ2FzeW5jSXRlcmF0b3InKTtcbiIsInJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKSgnb2JzZXJ2YWJsZScpO1xuIiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyIFRPX1NUUklOR19UQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxudmFyIERPTUl0ZXJhYmxlcyA9ICgnQ1NTUnVsZUxpc3QsQ1NTU3R5bGVEZWNsYXJhdGlvbixDU1NWYWx1ZUxpc3QsQ2xpZW50UmVjdExpc3QsRE9NUmVjdExpc3QsRE9NU3RyaW5nTGlzdCwnICtcbiAgJ0RPTVRva2VuTGlzdCxEYXRhVHJhbnNmZXJJdGVtTGlzdCxGaWxlTGlzdCxIVE1MQWxsQ29sbGVjdGlvbixIVE1MQ29sbGVjdGlvbixIVE1MRm9ybUVsZW1lbnQsSFRNTFNlbGVjdEVsZW1lbnQsJyArXG4gICdNZWRpYUxpc3QsTWltZVR5cGVBcnJheSxOYW1lZE5vZGVNYXAsTm9kZUxpc3QsUGFpbnRSZXF1ZXN0TGlzdCxQbHVnaW4sUGx1Z2luQXJyYXksU1ZHTGVuZ3RoTGlzdCxTVkdOdW1iZXJMaXN0LCcgK1xuICAnU1ZHUGF0aFNlZ0xpc3QsU1ZHUG9pbnRMaXN0LFNWR1N0cmluZ0xpc3QsU1ZHVHJhbnNmb3JtTGlzdCxTb3VyY2VCdWZmZXJMaXN0LFN0eWxlU2hlZXRMaXN0LFRleHRUcmFja0N1ZUxpc3QsJyArXG4gICdUZXh0VHJhY2tMaXN0LFRvdWNoTGlzdCcpLnNwbGl0KCcsJyk7XG5cbmZvciAodmFyIGkgPSAwOyBpIDwgRE9NSXRlcmFibGVzLmxlbmd0aDsgaSsrKSB7XG4gIHZhciBOQU1FID0gRE9NSXRlcmFibGVzW2ldO1xuICB2YXIgQ29sbGVjdGlvbiA9IGdsb2JhbFtOQU1FXTtcbiAgdmFyIHByb3RvID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgaWYgKHByb3RvICYmICFwcm90b1tUT19TVFJJTkdfVEFHXSkgaGlkZShwcm90bywgVE9fU1RSSU5HX1RBRywgTkFNRSk7XG4gIEl0ZXJhdG9yc1tOQU1FXSA9IEl0ZXJhdG9ycy5BcnJheTtcbn1cbiIsIi8vIHdvcmtzIGJ5IHJlZmVyZW5jZVxuZnVuY3Rpb24gc3dhcChhcnIsIGkxLCBpMikge1xuICBjb25zdCB0bXAgPSBhcnJbaTFdO1xuICBhcnJbaTFdID0gYXJyW2kyXTtcbiAgYXJyW2kyXSA9IHRtcDtcbn1cblxuLy8gaHR0cHM6Ly9qc3BlcmYuY29tL2pzLWZvci1sb29wLXZzLWFycmF5LWluZGV4b2YvMzQ2XG5mdW5jdGlvbiBpbmRleE9mKGFyciwgZWwpIHtcbiAgY29uc3QgbCA9IGFyci5sZW5ndGg7XG4gIC8vIGlnbm9yZSBmaXJzdCBlbGVtZW50IGFzIGl0IGNhbid0IGJlIGEgZW50cnlcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoYXJyW2ldID09PSBlbCkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIERlZmluZSBpZiBgdGltZTFgIHNob3VsZCBiZSBsb3dlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0xvd2VyTWF4SGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn07XG5cbmNvbnN0IF9pc0xvd2VyTWluSGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPiB0aW1lMjtcbn07XG5cbi8qKlxuICogRGVmaW5lIGlmIGB0aW1lMWAgc2hvdWxkIGJlIGhpZ2hlciBpbiB0aGUgdG9wb2dyYXBoeSB0aGFuIGB0aW1lMmAuXG4gKiBJcyBkeW5hbWljYWxseSBhZmZlY3RlZCB0byB0aGUgcHJpb3JpdHkgcXVldWUgYWNjb3JkaW5nIHRvIGhhbmRsZSBgbWluYCBhbmQgYG1heGAgaGVhcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUxXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZTJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cbmNvbnN0IF9pc0hpZ2hlck1heEhlYXAgPSBmdW5jdGlvbih0aW1lMSwgdGltZTIpIHtcbiAgcmV0dXJuIHRpbWUxID4gdGltZTI7XG59O1xuXG5jb25zdCBfaXNIaWdoZXJNaW5IZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA8IHRpbWUyO1xufTtcblxuY29uc3QgUE9TSVRJVkVfSU5GSU5JVFkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG5cbi8qKlxuICogUHJpb3JpdHkgcXVldWUgaW1wbGVtZW50aW5nIGEgYmluYXJ5IGhlYXAuXG4gKiBBY3RzIGFzIGEgbWluIGhlYXAgYnkgZGVmYXVsdCwgY2FuIGJlIGR5bmFtaWNhbGx5IGNoYW5nZWQgdG8gYSBtYXggaGVhcFxuICogYnkgc2V0dGluZyBgcmV2ZXJzZWAgdG8gdHJ1ZS5cbiAqXG4gKiBfbm90ZV86IHRoZSBxdWV1ZSBjcmVhdGVzIGFuZCBtYWludGFpbnMgYSBuZXcgcHJvcGVydHkgKGkuZS4gYHF1ZXVlVGltZWApXG4gKiB0byBlYWNoIG9iamVjdCBhZGRlZC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gW2hlYXBMZW5ndGg9MTAwXSAtIERlZmF1bHQgc2l6ZSBvZiB0aGUgYXJyYXkgdXNlZCB0byBjcmVhdGUgdGhlIGhlYXAuXG4gKi9cbmNsYXNzIFByaW9yaXR5UXVldWUge1xuICBjb25zdHJ1Y3RvcihoZWFwTGVuZ3RoID0gMTAwKSB7XG4gICAgLyoqXG4gICAgICogUG9pbnRlciB0byB0aGUgZmlyc3QgZW1wdHkgaW5kZXggb2YgdGhlIGhlYXAuXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbWVtYmVyb2YgUHJpb3JpdHlRdWV1ZVxuICAgICAqIEBuYW1lIF9jdXJyZW50TGVuZ3RoXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gMTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHRoZSBzb3J0ZWQgaW5kZXhlcyBvZiB0aGUgZW50cmllcywgdGhlIGFjdHVhbCBoZWFwLiBJZ25vcmUgdGhlIGluZGV4IDAuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqIEBtZW1iZXJvZiBQcmlvcml0eVF1ZXVlXG4gICAgICogQG5hbWUgX2hlYXBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX2hlYXAgPSBuZXcgQXJyYXkoaGVhcExlbmd0aCArIDEpO1xuXG4gICAgLyoqXG4gICAgICogVHlwZSBvZiB0aGUgcXVldWU6IGBtaW5gIGhlYXAgaWYgYGZhbHNlYCwgYG1heGAgaGVhcCBpZiBgdHJ1ZWBcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbWVtYmVyb2YgUHJpb3JpdHlRdWV1ZVxuICAgICAqIEBuYW1lIF9yZXZlcnNlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9yZXZlcnNlID0gbnVsbDtcblxuICAgIC8vIGluaXRpYWxpemUgY29tcGFyZSBmdW5jdGlvbnNcbiAgICB0aGlzLnJldmVyc2UgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaW1lIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9jdXJyZW50TGVuZ3RoID4gMSlcbiAgICAgIHJldHVybiB0aGlzLl9oZWFwWzFdLnF1ZXVlVGltZTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXJzdCBlbGVtZW50IGluIHRoZSBiaW5hcnkgaGVhcC5cbiAgICogQHJldHVybnMge051bWJlcn1cbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgaGVhZCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVhcFsxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIG9yZGVyIG9mIHRoZSBxdWV1ZSAobWF4IGhlYXAgaWYgdHJ1ZSwgbWluIGhlYXAgaWYgZmFsc2UpLFxuICAgKiByZWJ1aWxkIHRoZSBoZWFwIHdpdGggdGhlIGV4aXN0aW5nIGVudHJpZXMuXG4gICAqXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgc2V0IHJldmVyc2UodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgIT09IHRoaXMuX3JldmVyc2UpIHtcbiAgICAgIHRoaXMuX3JldmVyc2UgPSB2YWx1ZTtcblxuICAgICAgaWYgKHRoaXMuX3JldmVyc2UgPT09IHRydWUpIHtcbiAgICAgICAgdGhpcy5faXNMb3dlciA9IF9pc0xvd2VyTWF4SGVhcDtcbiAgICAgICAgdGhpcy5faXNIaWdoZXIgPSBfaXNIaWdoZXJNYXhIZWFwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faXNMb3dlciA9IF9pc0xvd2VyTWluSGVhcDtcbiAgICAgICAgdGhpcy5faXNIaWdoZXIgPSBfaXNIaWdoZXJNaW5IZWFwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkSGVhcCgpO1xuICAgIH1cbiAgfVxuXG4gIGdldCByZXZlcnNlKCkge1xuICAgIHJldHVybiB0aGlzLl9yZXZlcnNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpeCB0aGUgaGVhcCBieSBtb3ZpbmcgYW4gZW50cnkgdG8gYSBuZXcgdXBwZXIgcG9zaXRpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzdGFydEluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSBlbnRyeSB0byBtb3ZlLlxuICAgKi9cbiAgX2J1YmJsZVVwKHN0YXJ0SW5kZXgpIHtcbiAgICBsZXQgZW50cnkgPSB0aGlzLl9oZWFwW3N0YXJ0SW5kZXhdO1xuXG4gICAgbGV0IGluZGV4ID0gc3RhcnRJbmRleDtcbiAgICBsZXQgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgbGV0IHBhcmVudCA9IHRoaXMuX2hlYXBbcGFyZW50SW5kZXhdO1xuXG4gICAgd2hpbGUgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcihlbnRyeS5xdWV1ZVRpbWUsIHBhcmVudC5xdWV1ZVRpbWUpKSB7XG4gICAgICBzd2FwKHRoaXMuX2hlYXAsIGluZGV4LCBwYXJlbnRJbmRleCk7XG5cbiAgICAgIGluZGV4ID0gcGFyZW50SW5kZXg7XG4gICAgICBwYXJlbnRJbmRleCA9IE1hdGguZmxvb3IoaW5kZXggLyAyKTtcbiAgICAgIHBhcmVudCA9IHRoaXMuX2hlYXBbcGFyZW50SW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaXggdGhlIGhlYXAgYnkgbW92aW5nIGFuIGVudHJ5IHRvIGEgbmV3IGxvd2VyIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnRJbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZW50cnkgdG8gbW92ZS5cbiAgICovXG4gIF9idWJibGVEb3duKHN0YXJ0SW5kZXgpIHtcbiAgICBsZXQgZW50cnkgPSB0aGlzLl9oZWFwW3N0YXJ0SW5kZXhdO1xuXG4gICAgbGV0IGluZGV4ID0gc3RhcnRJbmRleDtcbiAgICBsZXQgYzFpbmRleCA9IGluZGV4ICogMjtcbiAgICBsZXQgYzJpbmRleCA9IGMxaW5kZXggKyAxO1xuICAgIGxldCBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgIGxldCBjaGlsZDIgPSB0aGlzLl9oZWFwW2MyaW5kZXhdO1xuXG4gICAgd2hpbGUgKChjaGlsZDEgJiYgdGhpcy5faXNMb3dlcihlbnRyeS5xdWV1ZVRpbWUsIGNoaWxkMS5xdWV1ZVRpbWUpKcKgfHxcbiAgICAgICAgICAgKGNoaWxkMiAmJiB0aGlzLl9pc0xvd2VyKGVudHJ5LnF1ZXVlVGltZSwgY2hpbGQyLnF1ZXVlVGltZSkpKVxuICAgIHtcbiAgICAgIC8vIHN3YXAgd2l0aCB0aGUgbWluaW11bSBjaGlsZFxuICAgICAgbGV0IHRhcmdldEluZGV4O1xuXG4gICAgICBpZiAoY2hpbGQyKVxuICAgICAgICB0YXJnZXRJbmRleCA9IHRoaXMuX2lzSGlnaGVyKGNoaWxkMS5xdWV1ZVRpbWUsIGNoaWxkMi5xdWV1ZVRpbWUpID8gYzFpbmRleCA6IGMyaW5kZXg7XG4gICAgICBlbHNlXG4gICAgICAgIHRhcmdldEluZGV4ID0gYzFpbmRleDtcblxuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgdGFyZ2V0SW5kZXgpO1xuXG4gICAgICAvLyB1cGRhdGUgdG8gZmluZCBuZXh0IGNoaWxkcmVuXG4gICAgICBpbmRleCA9IHRhcmdldEluZGV4O1xuICAgICAgYzFpbmRleCA9IGluZGV4ICogMjtcbiAgICAgIGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICAgIGNoaWxkMSA9IHRoaXMuX2hlYXBbYzFpbmRleF07XG4gICAgICBjaGlsZDIgPSB0aGlzLl9oZWFwW2MyaW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZCB0aGUgaGVhcCAoZnJvbSBib3R0b20gdXApLlxuICAgKi9cbiAgYnVpbGRIZWFwKCkge1xuICAgIC8vIGZpbmQgdGhlIGluZGV4IG9mIHRoZSBsYXN0IGludGVybmFsIG5vZGVcbiAgICAvLyBAdG9kbyAtIG1ha2Ugc3VyZSB0aGF0J3MgdGhlIHJpZ2h0IHdheSB0byBkby5cbiAgICBsZXQgbWF4SW5kZXggPSBNYXRoLmZsb29yKCh0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMSkgLyAyKTtcblxuICAgIGZvciAobGV0IGkgPSBtYXhJbmRleDsgaSA+IDA7IGktLSlcbiAgICAgIHRoaXMuX2J1YmJsZURvd24oaSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGEgbmV3IG9iamVjdCBpbiB0aGUgYmluYXJ5IGhlYXAgYW5kIHNvcnQgaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIGluc2VydC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybnMge051bWJlcn0gLSBUaW1lIG9mIHRoZSBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIGluc2VydChlbnRyeSwgdGltZSkge1xuICAgIGlmIChNYXRoLmFicyh0aW1lKSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIGVudHJ5LnF1ZXVlVGltZSA9IHRpbWU7XG4gICAgICAvLyBhZGQgdGhlIG5ldyBlbnRyeSBhdCB0aGUgZW5kIG9mIHRoZSBoZWFwXG4gICAgICB0aGlzLl9oZWFwW3RoaXMuX2N1cnJlbnRMZW5ndGhdID0gZW50cnk7XG4gICAgICAvLyBidWJibGUgaXQgdXBcbiAgICAgIHRoaXMuX2J1YmJsZVVwKHRoaXMuX2N1cnJlbnRMZW5ndGgpO1xuICAgICAgdGhpcy5fY3VycmVudExlbmd0aCArPSAxO1xuXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIGVudHJ5LnF1ZXVlVGltZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmUoZW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYSBnaXZlbiBlbnRyeSB0byBhIG5ldyBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gRW50cnkgdG8gbW92ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBUaW1lIGF0IHdoaWNoIHRoZSBlbnRyeSBzaG91bGQgYmUgb3JkZXJlci5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFRpbWUgb2YgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBtb3ZlKGVudHJ5LCB0aW1lKSB7XG4gICAgaWYgKE1hdGguYWJzKHRpbWUpICE9PSBQT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgY29uc3QgaW5kZXggPSBpbmRleE9mKHRoaXMuX2hlYXAsIGVudHJ5KTtcblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBlbnRyeS5xdWV1ZVRpbWUgPSB0aW1lO1xuICAgICAgICAvLyBkZWZpbmUgaWYgdGhlIGVudHJ5IHNob3VsZCBiZSBidWJibGVkIHVwIG9yIGRvd25cbiAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildO1xuXG4gICAgICAgIGlmIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIodGltZSwgcGFyZW50LnF1ZXVlVGltZSkpXG4gICAgICAgICAgdGhpcy5fYnViYmxlVXAoaW5kZXgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgfVxuXG4gICAgZW50cnkucXVldWVUaW1lID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiB0aGlzLnJlbW92ZShlbnRyeSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIGVudHJ5IGZyb20gdGhlIGhlYXAgYW5kIGZpeCB0aGUgaGVhcC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IC0gRW50cnkgdG8gcmVtb3ZlLlxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gVGltZSBvZiBmaXJzdCBlbnRyeSBpbiB0aGUgaGVhcC5cbiAgICovXG4gIHJlbW92ZShlbnRyeSkge1xuICAgIC8vIGZpbmQgdGhlIGluZGV4IG9mIHRoZSBlbnRyeVxuICAgIGNvbnN0IGluZGV4ID0gaW5kZXhPZih0aGlzLl9oZWFwLCBlbnRyeSk7XG5cbiAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICBjb25zdCBsYXN0SW5kZXggPSB0aGlzLl9jdXJyZW50TGVuZ3RoIC0gMTtcblxuICAgICAgLy8gaWYgdGhlIGVudHJ5IGlzIHRoZSBsYXN0IG9uZVxuICAgICAgaWYgKGluZGV4ID09PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaGVhcFxuICAgICAgICB0aGlzLl9oZWFwW2xhc3RJbmRleF0gPSB1bmRlZmluZWQ7XG4gICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IGxlbmd0aFxuICAgICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gbGFzdEluZGV4O1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzd2FwIHdpdGggdGhlIGxhc3QgZWxlbWVudCBvZiB0aGUgaGVhcFxuICAgICAgICBzd2FwKHRoaXMuX2hlYXAsIGluZGV4LCBsYXN0SW5kZXgpO1xuICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQgZnJvbSBoZWFwXG4gICAgICAgIHRoaXMuX2hlYXBbbGFzdEluZGV4XSA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoaW5kZXggPT09IDEpIHtcbiAgICAgICAgICB0aGlzLl9idWJibGVEb3duKDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGJ1YmJsZSB0aGUgKGV4IGxhc3QpIGVsZW1lbnQgdXAgb3IgZG93biBhY2NvcmRpbmcgdG8gaXRzIG5ldyBjb250ZXh0XG4gICAgICAgICAgY29uc3QgZW50cnkgPSB0aGlzLl9oZWFwW2luZGV4XTtcbiAgICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLl9oZWFwW01hdGguZmxvb3IoaW5kZXggLyAyKV07XG5cbiAgICAgICAgICBpZiAocGFyZW50ICYmIHRoaXMuX2lzSGlnaGVyKGVudHJ5LnF1ZXVlVGltZSwgcGFyZW50LnF1ZXVlVGltZSkpXG4gICAgICAgICAgICB0aGlzLl9idWJibGVVcChpbmRleCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5fYnViYmxlRG93bihpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgbGVuZ3RoXG4gICAgICB0aGlzLl9jdXJyZW50TGVuZ3RoID0gbGFzdEluZGV4O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRpbWU7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgdGhlIHF1ZXVlLlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fY3VycmVudExlbmd0aCA9IDE7XG4gICAgdGhpcy5faGVhcCA9IG5ldyBBcnJheSh0aGlzLl9oZWFwLmxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogRGVmaW5lcyBpZiB0aGUgcXVldWUgY29udGFpbnMgdGhlIGdpdmVuIGBlbnRyeWAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIGJlIGNoZWNrZWRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIGhhcyhlbnRyeSkge1xuICAgIHJldHVybiB0aGlzLl9oZWFwLmluZGV4T2YoZW50cnkpICE9PSAtMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmlvcml0eVF1ZXVlO1xuIiwiLyoqXG4gKiBTY2hlZHVsaW5nUXVldWUgYmFzZSBjbGFzc1xuICogaHR0cDovL3dhdmVzanMuZ2l0aHViLmlvL2F1ZGlvLyNhdWRpby1zY2hlZHVsaW5nLXF1ZXVlXG4gKlxuICogTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyXG4gKiBDb3B5cmlnaHQgMjAxNCwgMjAxNSBJUkNBTSDigJPCoENlbnRyZSBQb21waWRvdVxuICovXG5cbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4vUHJpb3JpdHlRdWV1ZSc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuL1RpbWVFbmdpbmUnO1xuXG4vKipcbiAqIEBjbGFzcyBTY2hlZHVsaW5nUXVldWVcbiAqIEBleHRlbmRzIFRpbWVFbmdpbmVcbiAqL1xuY2xhc3MgU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19lbmdpbmVzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSAnc2NoZWR1bGVkJyBpbnRlcmZhY2VcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX19xdWV1ZS5oZWFkO1xuICAgIGNvbnN0IG5leHRFbmdpbmVUaW1lID0gZW5naW5lLmFkdmFuY2VUaW1lKHRpbWUpO1xuXG4gICAgaWYgKCFuZXh0RW5naW5lVGltZSkge1xuICAgICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICAgIHRoaXMuX19xdWV1ZS5yZW1vdmUoZW5naW5lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fX3F1ZXVlLm1vdmUoZW5naW5lLCBuZXh0RW5naW5lVGltZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19xdWV1ZS50aW1lO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtYXN0ZXIgbWV0aG9kIHRvIGJlIGltcGxlbWVudGVkIGJ5IGRlcml2ZWQgY2xhc3NcbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gY2FsbCBhIGZ1bmN0aW9uIGF0IGEgZ2l2ZW4gdGltZVxuICBkZWZlcihmdW4sIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCEoZnVuIGluc3RhbmNlb2YgRnVuY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBkZWZlcmVkIGJ5IHNjaGVkdWxlclwiKTtcblxuICAgIHRoaXMuYWRkKHtcbiAgICAgIGFkdmFuY2VUaW1lOiBmdW5jdGlvbih0aW1lKSB7IGZ1bih0aW1lKTsgfSwgLy8gbWFrZSBzdXJlIHRoYXQgdGhlIGFkdmFuY2VUaW1lIG1ldGhvZCBkb2VzIG5vdCByZXR1cm0gYW55dGhpbmdcbiAgICB9LCB0aW1lKTtcbiAgfVxuXG4gIC8vIGFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSBzY2hlZHVsZXJcbiAgYWRkKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIVRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG5cbiAgICAvLyBhZGQgdG8gZW5naW5lcyBhbmQgcXVldWVcbiAgICB0aGlzLl9fZW5naW5lcy5hZGQoZW5naW5lKTtcbiAgICBjb25zdCBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5pbnNlcnQoZW5naW5lLCB0aW1lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZW1vdmUgYSB0aW1lIGVuZ2luZSBmcm9tIHRoZSBxdWV1ZVxuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG5cbiAgICAvLyByZW1vdmUgZnJvbSBhcnJheSBhbmQgcXVldWVcbiAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICBjb25zdCBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5yZW1vdmUoZW5naW5lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZXNldCBuZXh0IGVuZ2luZSB0aW1lXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgbGV0IG5leHRUaW1lO1xuXG4gICAgaWYgKHRoaXMuX19xdWV1ZS5oYXMoZW5naW5lKSlcbiAgICAgIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLm1vdmUoZW5naW5lLCB0aW1lKTtcbiAgICBlbHNlXG4gICAgICBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5pbnNlcnQoZW5naW5lLCB0aW1lKTtcblxuICAgIHRoaXMucmVzZXRUaW1lKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8vIGNoZWNrIHdoZXRoZXIgYSBnaXZlbiBlbmdpbmUgaXMgc2NoZWR1bGVkXG4gIGhhcyhlbmdpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5fX2VuZ2luZXMuaGFzKGVuZ2luZSk7XG4gIH1cblxuICAvLyBjbGVhciBxdWV1ZVxuICBjbGVhcigpIHtcbiAgICBmb3IobGV0IGVuZ2luZSBvZiB0aGlzLl9fZW5naW5lcylcbiAgICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fX3F1ZXVlLmNsZWFyKCk7XG4gICAgdGhpcy5fX2VuZ2luZXMuY2xlYXIoKTtcbiAgICB0aGlzLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NoZWR1bGluZ1F1ZXVlXG4iLCIvKipcbiAqIEJhc2UgY2xhc3MgZm9yIHRpbWUgZW5naW5lc1xuICpcbiAqIEEgdGltZSBlbmdpbmUgZ2VuZXJhdGVzIG1vcmUgb3IgbGVzcyByZWd1bGFyIGV2ZW50cyBhbmQvb3IgcGxheXMgYmFjayBhXG4gKiBtZWRpYSBzdHJlYW0uIEl0IGltcGxlbWVudHMgb25lIG9yIG11bHRpcGxlIGludGVyZmFjZXMgdG8gYmUgZHJpdmVuIGJ5IGFcbiAqIG1hc3RlciAoaS5lLiBhIFNjaGVkdWxlciwgYSBUcmFuc3BvcnQgb3IgYSBQbGF5Q29udHJvbCkgaW4gc3luY2hyb25pemF0aW9uXG4gKiB3aXRoIG90aGVyIGVuZ2luZXMuIFRoZSBwcm92aWRlZCBpbnRlcmZhY2VzIGFyZSBzY2hlZHVsZWQsIHRyYW5zcG9ydGVkLFxuICogYW5kIHBsYXktY29udHJvbGxlZC5cbiAqXG4gKlxuICogIyMjIyBUaGUgYHNjaGVkdWxlZGAgaW50ZXJmYWNlXG4gKlxuICogVGhlIHNjaGVkdWxlZCBpbnRlcmZhY2UgYWxsb3dzIGZvciBzeW5jaHJvbml6aW5nIGFuIGVuZ2luZSB0byBhIG1vbm90b25vdXMgdGltZVxuICogYXMgaXQgaXMgcHJvdmlkZWQgYnkgdGhlIFNjaGVkdWxlciBtYXN0ZXIuXG4gKlxuICogIyMjIyMjIGBhZHZhbmNlVGltZSh0aW1lIDpOdW1iZXIpIC0+IHtOdW1iZXJ9YFxuICpcbiAqIFRoZSBgYWR2YW5jZVRpbWVgIG1ldGhvZCBoYXMgdG8gYmUgaW1wbGVtZW50ZWQgYnkgYW4gYFRpbWVFbmdpbmVgIGFzIHBhcnQgb2YgdGhlXG4gKiBzY2hlZHVsZWQgaW50ZXJmYWNlLiBUaGUgbWV0aG9kIGlzIGNhbGxlZCBieSB0aGUgbWFzdGVyIChlLmcuIHRoZSBzY2hlZHVsZXIpLlxuICogSXQgZ2VuZXJhdGVzIGFuIGV2ZW50IGFuZCB0byByZXR1cm5zIHRoZSB0aW1lIG9mIHRoZSBuZXh0IGV2ZW50IChpLmUuIHRoZSBuZXh0XG4gKiBjYWxsIG9mIGFkdmFuY2VUaW1lKS4gVGhlIHJldHVybmVkIHRpbWUgaGFzIHRvIGJlIGdyZWF0ZXIgdGhhbiB0aGUgdGltZVxuICogcmVjZWl2ZWQgYXMgYXJndW1lbnQgb2YgdGhlIG1ldGhvZC4gSW4gY2FzZSB0aGF0IGEgVGltZUVuZ2luZSBoYXMgdG8gZ2VuZXJhdGVcbiAqIG11bHRpcGxlIGV2ZW50cyBhdCB0aGUgc2FtZSB0aW1lLCB0aGUgZW5naW5lIGhhcyB0byBpbXBsZW1lbnQgaXRzIG93biBsb29wXG4gKiB3aGlsZShldmVudC50aW1lIDw9IHRpbWUpIGFuZCByZXR1cm4gdGhlIHRpbWUgb2YgdGhlIG5leHQgZXZlbnQgKGlmIGFueSkuXG4gKlxuICogIyMjIyMjIGByZXNldFRpbWUodGltZT11bmRlZmluZWQgOk51bWJlcilgXG4gKlxuICogVGhlIGByZXNldFRpbWVgIG1ldGhvZCBpcyBwcm92aWRlZCBieSB0aGUgYFRpbWVFbmdpbmVgIGJhc2UgY2xhc3MuIEFuIGVuZ2luZSBtYXlcbiAqIGNhbGwgdGhpcyBtZXRob2QgdG8gcmVzZXQgaXRzIG5leHQgZXZlbnQgdGltZSAoZS5nLiB3aGVuIGEgcGFyYW1ldGVyIGlzXG4gKiBjaGFuZ2VkIHRoYXQgaW5mbHVlbmNlcyB0aGUgZW5naW5lJ3MgdGVtcG9yYWwgYmVoYXZpb3IpLiBXaGVuIG5vIGFyZ3VtZW50XG4gKiBpcyBnaXZlbiwgdGhlIHRpbWUgaXMgcmVzZXQgdG8gdGhlIGN1cnJlbnQgbWFzdGVyIHRpbWUuIFdoZW4gY2FsbGluZyB0aGVcbiAqIG1ldGhvZCB3aXRoIEluZmluaXR5IHRoZSBlbmdpbmUgaXMgc3VzcGVuZGVkIHdpdGhvdXQgYmVpbmcgcmVtb3ZlZCBmcm9tIHRoZVxuICogbWFzdGVyLlxuICpcbiAqXG4gKiAjIyMjIFRoZSBgdHJhbnNwb3J0ZWRgIGludGVyZmFjZVxuICpcbiAqIFRoZSB0cmFuc3BvcnRlZCBpbnRlcmZhY2UgYWxsb3dzIGZvciBzeW5jaHJvbml6aW5nIGFuIGVuZ2luZSB0byBhIHBvc2l0aW9uXG4gKiAoaS5lLiBtZWRpYSBwbGF5YmFjayB0aW1lKSB0aGF0IGNhbiBydW4gZm9yd2FyZCBhbmQgYmFja3dhcmQgYW5kIGp1bXAgYXMgaXRcbiAqIGlzIHByb3ZpZGVkIGJ5IHRoZSBUcmFuc3BvcnQgbWFzdGVyLlxuICpcbiAqICMjIyMjIyBgc3luY1Bvc2l0aW9uKHRpbWUgOk51bWJlciwgcG9zaXRpb24gOk51bWJlciwgc3BlZWQgOk51bWJlcikgLT4ge051bWJlcn1gXG4gKlxuICogVGhlIGBzeW5jUG9zaXRvbmAgbWV0aG9kIGhhcyB0byBiZSBpbXBsZW1lbnRlZCBieSBhIGBUaW1lRW5naW5lYCBhcyBwYXJ0IG9mIHRoZVxuICogdHJhbnNwb3J0ZWQgaW50ZXJmYWNlLiBUaGUgbWV0aG9kIHN5bmNQb3NpdG9uIGlzIGNhbGxlZCB3aGVuZXZlciB0aGUgbWFzdGVyXG4gKiBvZiBhIHRyYW5zcG9ydGVkIGVuZ2luZSBoYXMgdG8gKHJlLSlzeW5jaHJvbml6ZSB0aGUgZW5naW5lJ3MgcG9zaXRpb24uIFRoaXNcbiAqIGlzIGZvciBleGFtcGxlIHJlcXVpcmVkIHdoZW4gdGhlIG1hc3RlciAocmUtKXN0YXJ0cyBwbGF5YmFjaywganVtcHMgdG8gYW5cbiAqIGFyYml0cmFyeSBwb3NpdGlvbiwgYW5kIHdoZW4gcmV2ZXJzaW5nIHBsYXliYWNrIGRpcmVjdGlvbi4gVGhlIG1ldGhvZCByZXR1cm5zXG4gKiB0aGUgbmV4dCBwb3NpdGlvbiBvZiB0aGUgZW5naW5lIGluIHRoZSBnaXZlbiBwbGF5YmFjayBkaXJlY3Rpb25cbiAqIChpLmUuIGBzcGVlZCA8IDBgIG9yIGBzcGVlZCA+IDBgKS5cbiAqXG4gKiAjIyMjIyMgYGFkdmFuY2VQb3NpdGlvbih0aW1lIDpOdW1iZXIsIHBvc2l0aW9uIDpOdW1iZXIsIHNwZWVkIDpOdW1iZXIpIC0+IHtOdW1iZXJ9YFxuICpcbiAqIFRoZSBgYWR2YW5jZVBvc2l0aW9uYCBtZXRob2QgaGFzIHRvIGJlIGltcGxlbWVudGVkIGJ5IGEgYFRpbWVFbmdpbmVgIGFzIHBhcnRcbiAqIG9mIHRoZSB0cmFuc3BvcnRlZCBpbnRlcmZhY2UuIFRoZSBtYXN0ZXIgY2FsbHMgdGhlIGFkdmFuY2VQb3NpdG9uIG1ldGhvZCB3aGVuXG4gKiB0aGUgZW5naW5lJ3MgZXZlbnQgcG9zaXRpb24gaXMgcmVhY2hlZC4gVGhlIG1ldGhvZCBnZW5lcmF0ZXMgYW4gZXZlbnQgYW5kXG4gKiByZXR1cm5zIHRoZSBuZXh0IHBvc2l0aW9uIGluIHRoZSBnaXZlbiBwbGF5YmFjayBkaXJlY3Rpb24gKGkuZS4gc3BlZWQgPCAwIG9yXG4gKiBzcGVlZCA+IDApLiBUaGUgcmV0dXJuZWQgcG9zaXRpb24gaGFzIHRvIGJlIGdyZWF0ZXIgKGkuZS4gd2hlbiBzcGVlZCA+IDApXG4gKiBvciBsZXNzIChpLmUuIHdoZW4gc3BlZWQgPCAwKSB0aGFuIHRoZSBwb3NpdGlvbiByZWNlaXZlZCBhcyBhcmd1bWVudCBvZiB0aGVcbiAqIG1ldGhvZC5cbiAqXG4gKiAjIyMjIyMgYHJlc2V0UG9zaXRpb24ocG9zaXRpb249dW5kZWZpbmVkIDpOdW1iZXIpYFxuICpcbiAqIFRoZSByZXNldFBvc2l0aW9uIG1ldGhvZCBpcyBwcm92aWRlZCBieSB0aGUgVGltZUVuZ2luZSBiYXNlIGNsYXNzLiBBbiBlbmdpbmVcbiAqIG1heSBjYWxsIHRoaXMgbWV0aG9kIHRvIHJlc2V0IGl0cyBuZXh0IGV2ZW50IHBvc2l0aW9uLiBXaGVuIG5vIGFyZ3VtZW50XG4gKiBpcyBnaXZlbiwgdGhlIHRpbWUgaXMgcmVzZXQgdG8gdGhlIGN1cnJlbnQgbWFzdGVyIHRpbWUuIFdoZW4gY2FsbGluZyB0aGVcbiAqIG1ldGhvZCB3aXRoIEluZmluaXR5IHRoZSBlbmdpbmUgaXMgc3VzcGVuZGVkIHdpdGhvdXQgYmVpbmcgcmVtb3ZlZCBmcm9tXG4gKiB0aGUgbWFzdGVyLlxuICpcbiAqXG4gKiAjIyMjIFRoZSBzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZVxuICpcbiAqIFRoZSBcInNwZWVkLWNvbnRyb2xsZWRcIiBpbnRlcmZhY2UgYWxsb3dzIGZvciBzeW5jcm9uaXppbmcgYW4gZW5naW5lIHRoYXQgaXNcbiAqIG5laXRoZXIgZHJpdmVuIHRocm91Z2ggdGhlIHNjaGVkdWxlZCBub3IgdGhlIHRyYW5zcG9ydGVkIGludGVyZmFjZS4gVGhlXG4gKiBpbnRlcmZhY2UgYWxsb3dzIGluIHBhcnRpY3VsYXIgdG8gc3luY2hyb25pemUgZW5naW5lcyB0aGF0IGFzc3VyZSB0aGVpciBvd25cbiAqIHNjaGVkdWxpbmcgKGkuZS4gYXVkaW8gcGxheWVyIG9yIGFuIG9zY2lsbGF0b3IpIHRvIHRoZSBldmVudC1iYXNlZCBzY2hlZHVsZWRcbiAqIGFuZCB0cmFuc3BvcnRlZCBlbmdpbmVzLlxuICpcbiAqICMjIyMjIyBgc3luY1NwZWVkKHRpbWUgOk51bWJlciwgcG9zaXRpb24gOk51bWJlciwgc3BlZWQgOk51bWJlciwgc2Vlaz1mYWxzZSA6Qm9vbGVhbilgXG4gKlxuICogVGhlIHN5bmNTcGVlZCBtZXRob2QgaGFzIHRvIGJlIGltcGxlbWVudGVkIGJ5IGEgVGltZUVuZ2luZSBhcyBwYXJ0IG9mIHRoZVxuICogc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UuIFRoZSBtZXRob2QgaXMgY2FsbGVkIGJ5IHRoZSBtYXN0ZXIgd2hlbmV2ZXIgdGhlXG4gKiBwbGF5YmFjayBzcGVlZCBjaGFuZ2VzIG9yIHRoZSBwb3NpdGlvbiBqdW1wcyBhcmJpdGFyaWx5IChpLmUuIG9uIGEgc2VlaykuXG4gKlxuICpcbiAqIDxociAvPlxuICpcbiAqIEV4YW1wbGUgdGhhdCBzaG93cyBhIGBUaW1lRW5naW5lYCBydW5uaW5nIGluIGEgYFNjaGVkdWxlcmAgdGhhdCBjb3VudHMgdXBcbiAqIGF0IGEgZ2l2ZW4gZnJlcXVlbmN5OlxuICoge0BsaW5rIGh0dHBzOi8vcmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy90aW1lLWVuZ2luZS5odG1sfVxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKlxuICogY2xhc3MgTXlFbmdpbmUgZXh0ZW5kcyBhdWRpby5UaW1lRW5naW5lIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgc3VwZXIoKTtcbiAqICAgICAvLyAuLi5cbiAqICAgfVxuICogfVxuICpcbiAqL1xuY2xhc3MgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKlxuICAgICAqIFRoZSBlbmdpbmUncyBtYXN0ZXIuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TWl4ZWR9XG4gICAgICogQG5hbWUgbWFzdGVyXG4gICAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICAgKi9cbiAgICB0aGlzLm1hc3RlciA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHRpbWUgZW5naW5lJ3MgY3VycmVudCAobWFzdGVyKSB0aW1lLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0aW1lIGVuZ2luZSdzIGN1cnJlbnQgKG1hc3RlcikgcG9zaXRpb24uXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBUaW1lRW5naW5lXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICB2YXIgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5jdXJyZW50UG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZWQgaW50ZXJmYWNlXG4gICAqICAgLSBhZHZhbmNlVGltZSh0aW1lKSwgY2FsbGVkIHRvIGdlbmVyYXRlIG5leHQgZXZlbnQgYXQgZ2l2ZW4gdGltZSwgcmV0dXJucyBuZXh0IHRpbWVcbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgKi9cbiAgc3RhdGljIGltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSB7XG4gICAgcmV0dXJuIChlbmdpbmUuYWR2YW5jZVRpbWUgJiYgZW5naW5lLmFkdmFuY2VUaW1lIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG5cbiAgcmVzZXRUaW1lKHRpbWUgPSB1bmRlZmluZWQpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVRpbWUodGhpcywgdGltZSk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNwb3J0ZWQgaW50ZXJmYWNlXG4gICAqICAgLSBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSwgY2FsbGVkIHRvIHJlcG9zaXRpb24gVGltZUVuZ2luZSwgcmV0dXJucyBuZXh0IHBvc2l0aW9uXG4gICAqICAgLSBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSwgY2FsbGVkIHRvIGdlbmVyYXRlIG5leHQgZXZlbnQgYXQgZ2l2ZW4gdGltZSBhbmQgcG9zaXRpb24sIHJldHVybnMgbmV4dCBwb3NpdGlvblxuICAgKlxuICAgKiBAc3RhdGljXG4gICAqIEBtZW1iZXJvZiBUaW1lRW5naW5lXG4gICAqL1xuICBzdGF0aWMgaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkge1xuICAgIHJldHVybiAoXG4gICAgICBlbmdpbmUuc3luY1Bvc2l0aW9uICYmIGVuZ2luZS5zeW5jUG9zaXRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbiAmJlxuICAgICAgZW5naW5lLmFkdmFuY2VQb3NpdGlvbiAmJiBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb25cbiAgICApO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlXG4gICAqICAgLSBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCApLCBjYWxsZWQgdG9cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgKi9cbiAgc3RhdGljIGltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoZW5naW5lKSB7XG4gICAgcmV0dXJuIChlbmdpbmUuc3luY1NwZWVkICYmIGVuZ2luZS5zeW5jU3BlZWQgaW5zdGFuY2VvZiBGdW5jdGlvbik7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGltZUVuZ2luZTtcbiIsIi8vIGNvcmVcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGltZUVuZ2luZSB9IGZyb20gJy4vY29yZS9UaW1lRW5naW5lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUHJpb3JpdHlRdWV1ZSB9IGZyb20gJy4vY29yZS9Qcmlvcml0eVF1ZXVlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2NoZWR1bGluZ1F1ZXVlIH0gZnJvbSAnLi9jb3JlL1NjaGVkdWxpbmdRdWV1ZSc7XG5cbi8vIG1hc3RlcnNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxheUNvbnRyb2wgfSBmcm9tICcuL21hc3RlcnMvUGxheUNvbnRyb2wnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUcmFuc3BvcnQgfSBmcm9tICcuL21hc3RlcnMvVHJhbnNwb3J0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2NoZWR1bGVyIH0gZnJvbSAnLi9tYXN0ZXJzL1NjaGVkdWxlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNpbXBsZVNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9TaW1wbGVTY2hlZHVsZXInO1xuIiwiaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi9jb3JlL1NjaGVkdWxpbmdRdWV1ZSc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL1RpbWVFbmdpbmUnO1xuXG5jb25zdCBFUFNJTE9OID0gMWUtODtcblxuY2xhc3MgTG9vcENvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5zcGVlZCA9IDE7XG4gICAgdGhpcy5sb3dlciA9IC1JbmZpbml0eTtcbiAgICB0aGlzLnVwcGVyID0gSW5maW5pdHk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIGNvbnN0IHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIGNvbnN0IHNwZWVkID0gdGhpcy5zcGVlZDtcbiAgICBjb25zdCBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgY29uc3QgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMClcbiAgICAgIHRpbWUgKz0gRVBTSUxPTjtcbiAgICBlbHNlXG4gICAgICB0aW1lIC09IEVQU0lMT047XG5cbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgbG93ZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHVwcGVyKSAtIEVQU0lMT047XG4gICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCB1cHBlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIpICsgRVBTSUxPTjtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICByZXNjaGVkdWxlKHNwZWVkKSB7XG4gICAgY29uc3QgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgY29uc3QgbG93ZXIgPSBNYXRoLm1pbihwbGF5Q29udHJvbC5fX2xvb3BTdGFydCwgcGxheUNvbnRyb2wuX19sb29wRW5kKTtcbiAgICBjb25zdCB1cHBlciA9IE1hdGgubWF4KHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMubG93ZXIgPSBsb3dlcjtcbiAgICB0aGlzLnVwcGVyID0gdXBwZXI7XG5cbiAgICBpZiAobG93ZXIgPT09IHVwcGVyKVxuICAgICAgc3BlZWQgPSAwO1xuXG4gICAgaWYgKHNwZWVkID4gMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIpIC0gRVBTSUxPTik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlcikgKyBFUFNJTE9OKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBhcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGNvbnN0IGxvd2VyID0gdGhpcy5sb3dlcjtcbiAgICBjb25zdCB1cHBlciA9IHRoaXMudXBwZXI7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uID49IHVwcGVyKVxuICAgICAgcmV0dXJuIGxvd2VyICsgKHBvc2l0aW9uIC0gbG93ZXIpICUgKHVwcGVyIC0gbG93ZXIpO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA8IGxvd2VyKVxuICAgICAgcmV0dXJuIHVwcGVyIC0gKHVwcGVyIC0gcG9zaXRpb24pICUgKHVwcGVyIC0gbG93ZXIpO1xuXG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbGxlZCBiYXNlIGNsYXNzXG5jbGFzcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWspO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuXG4gICAgdGhpcy5fX2VuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBmb3IgZW5naW5lcyBpbXBsZW1lbnRpbmcgdGhlICpzcGVlZC1jb250cm9sbGVkKiBpbnRlcmZhY2VcbmNsYXNzIFBsYXlDb250cm9sbGVkU3BlZWRDb250cm9sbGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciBlbmdpbmVzIGltcGxtZW50aW5nIHRoZSAqdHJhbnNwb3J0ZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRUcmFuc3BvcnRlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBuZXcgUGxheUNvbnRyb2xsZWRTY2hlZHVsZXJIb29rKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uO1xuXG4gICAgICAvLyByZXN5bmMgdHJhbnNwb3J0ZWQgZW5naW5lc1xuICAgICAgaWYgKHNlZWsgfHwgc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAgIC8vIHNlZWsgb3IgcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0YXJ0XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0b3BcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICAgICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpIHtcbiAgICAgICAgLy8gY2hhbmdlIHNwZWVkIHdpdGhvdXQgcmV2ZXJzaW5nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICAgIHZhciB0aW1lID0gcGxheUNvbnRyb2wuX19zeW5jKCk7XG5cbiAgICAgIHBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcGxheUNvbnRyb2wuX19wb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG51bGw7XG5cbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciB0aW1lIGVuZ2luZXMgaW1wbGVtZW50aW5nIHRoZSAqc2NoZWR1bGVkKiBpbnRlcmZhY2VcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICAvLyBzY2hlZHVsaW5nIHF1ZXVlIGJlY29tZXMgbWFzdGVyIG9mIGVuZ2luZVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUgPSBuZXcgUGxheUNvbnRyb2xsZWRTY2hlZHVsaW5nUXVldWUocGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAobGFzdFNwZWVkID09PSAwICYmIHNwZWVkICE9PSAwKSAvLyBzdGFydCBvciBzZWVrXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZSgpO1xuICAgIGVsc2UgaWYgKGxhc3RTcGVlZCAhPT0gMCAmJiBzcGVlZCA9PT0gMCkgLy8gc3RvcFxuICAgICAgdGhpcy5fX2VuZ2luZS5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlLmRlc3Ryb3koKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gdHJhbnNsYXRlcyB0cmFuc3BvcnRlZCBlbmdpbmUgYWR2YW5jZVBvc2l0aW9uIGludG8gZ2xvYmFsIHNjaGVkdWxlciB0aW1lc1xuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICB2YXIgZW5naW5lID0gdGhpcy5fX2VuZ2luZTtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gaW50ZXJuYWwgc2NoZWR1bGluZyBxdWV1ZSB0aGF0IHJldHVybnMgdGhlIGN1cnJlbnQgcG9zaXRpb24gKGFuZCB0aW1lKSBvZiB0aGUgcGxheSBjb250cm9sXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICB0aGlzLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgICBwbGF5Q29udHJvbC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlKHRoaXMuX19lbmdpbmUpO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIEV4dGVuZHMgVGltZSBFbmdpbmUgdG8gcHJvdmlkZSBwbGF5YmFjayBjb250cm9sIG9mIGEgVGltZSBFbmdpbmUgaW5zdGFuY2UuXG4gKlxuICogW2V4YW1wbGVde0BsaW5rIGh0dHBzOi8vcmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy9wbGF5LWNvbnRyb2wuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIGVuZ2luZSB0byBjb250cm9sXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIG1hc3RlcnMgZnJvbSAnd2F2ZXMtbWFzdGVycyc7XG4gKlxuICogY29uc3QgZ2V0VGltZUZ1bmN0aW9uID0gKCkgPT4ge1xuICogICBjb25zdCBub3cgPSBwcm9jZXNzLmhydGltZSgpO1xuICogICByZXR1cm4gbm93WzBdICsgbm93WzFdICogMWUtOTtcbiAqIH1cbiAqIGNvbnN0IHNjaGVkdWxlciA9IG5ldyBtYXN0ZXJzLlNjaGVkdWxlcihnZXRUaW1lRnVuY3Rpb24pO1xuICogY29uc3QgcGxheWVyRW5naW5lID0gbmV3IE15VGltZUVuZ2luZSgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgbWFzdGVycy5QbGF5Q29udHJvbChzY2hlZHVsZXIsIHBsYXllckVuZ2luZSk7XG4gKlxuICogcGxheUNvbnRyb2wuc3RhcnQoKTtcbiAqL1xuY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Ioc2NoZWR1bGVyLCBlbmdpbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuXG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSAwO1xuICAgIHRoaXMuX19sb29wRW5kID0gMTtcblxuICAgIC8vIHN5bmNocm9uaXplZCB0aWUsIHBvc2l0aW9uLCBhbmQgc3BlZWRcbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuXG4gICAgLy8gbm9uLXplcm8gXCJ1c2VyXCIgc3BlZWRcbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gMTtcblxuICAgIGlmIChlbmdpbmUpXG4gICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG4gIH1cblxuICBfX3NldEVuZ2luZShlbmdpbmUpIHtcbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZChlbmdpbmUpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZSBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzVHJhbnNwb3J0ZWQoZW5naW5lKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZSBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKGVuZ2luZSkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHBsYXkgY29udHJvbFwiKTtcbiAgfVxuXG4gIF9fcmVzZXRFbmdpbmUoKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHRpbWUgZm9yIGdpdmVuIHBvc2l0aW9uXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGV4dHJhcG9sYXRlZCB0aW1lXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX190aW1lICsgKHBvc2l0aW9uIC0gdGhpcy5fX3Bvc2l0aW9uKSAvIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUvZXh0cmFwb2xhdGUgcGxheWluZyBwb3NpdGlvbiBmb3IgZ2l2ZW4gdGltZVxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHBvc2l0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX3N5bmMoKSB7XG4gICAgY29uc3Qgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcblxuICAgIHJldHVybiBub3c7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWUuXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqXG4gICAqIEBuYW1lIGN1cnJlbnRUaW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uLlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgcGxheS1jb250cm9sIGlzIGFkZGVkIHRvIGEgbWFzdGVyLlxuICAgKlxuICAgKiBAbmFtZSBjdXJyZW50UG9zaXRpb25cbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIHBsYXkgY29udHJvbCBpcyBydW5uaW5nLlxuICAgKlxuICAgKiBAbmFtZSBydW5uaW5nXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKiBAbWVtYmVyb2YgUGxheUNvbnRyb2xcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IHJ1bm5pbmcoKSB7XG4gICAgcmV0dXJuICEodGhpcy5fX3NwZWVkID09PSAwKTtcbiAgfVxuXG4gIHNldChlbmdpbmUgPSBudWxsKSB7XG4gICAgY29uc3QgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgY29uc3Qgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkICE9PSBudWxsICYmIHRoaXMuX19wbGF5Q29udHJvbGxlZC5fX2VuZ2luZSAhPT0gZW5naW5lKSB7XG5cbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19yZXNldEVuZ2luZSgpO1xuXG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQgPT09IG51bGwgJiYgZW5naW5lICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcblxuICAgICAgICBpZiAoc3BlZWQgIT09IDApXG4gICAgICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBsYXkgY29udHJvbCBsb29wIGJlaGF2aW9yLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQG5hbWUgbG9vcFxuICAgKiBAbWVtYmVyb2YgUGxheUNvbnRyb2xcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgbG9vcChlbmFibGUpIHtcbiAgICBpZiAoZW5hYmxlICYmIHRoaXMuX19sb29wU3RhcnQgPiAtSW5maW5pdHkgJiYgdGhpcy5fX2xvb3BFbmQgPCBJbmZpbml0eSkge1xuICAgICAgaWYgKCF0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbmV3IExvb3BDb250cm9sKHRoaXMpO1xuICAgICAgICB0aGlzLl9fc2NoZWR1bGVyLmFkZCh0aGlzLl9fbG9vcENvbnRyb2wsIEluZmluaXR5KTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX19zcGVlZCAhPT0gMCkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuY3VycmVudFBvc2l0aW9uO1xuICAgICAgICBjb25zdCBsb3dlciA9IE1hdGgubWluKHRoaXMuX19sb29wU3RhcnQsIHRoaXMuX19sb29wRW5kKTtcbiAgICAgICAgY29uc3QgdXBwZXIgPSBNYXRoLm1heCh0aGlzLl9fbG9vcFN0YXJ0LCB0aGlzLl9fbG9vcEVuZCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX19zcGVlZCA+IDAgJiYgcG9zaXRpb24gPiB1cHBlcilcbiAgICAgICAgICB0aGlzLnNlZWsodXBwZXIpO1xuICAgICAgICBlbHNlIGlmICh0aGlzLl9fc3BlZWQgPCAwICYmIHBvc2l0aW9uIDwgbG93ZXIpXG4gICAgICAgICAgdGhpcy5zZWVrKGxvd2VyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRoaXMuX19sb29wQ29udHJvbC5yZXNjaGVkdWxlKHRoaXMuX19zcGVlZCk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9fbG9vcENvbnRyb2wpIHtcbiAgICAgIHRoaXMuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMuX19sb29wQ29udHJvbCk7XG4gICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGdldCBsb29wKCkge1xuICAgIHJldHVybiAoISF0aGlzLl9fbG9vcENvbnRyb2wpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbG9vcCBzdGFydCBhbmQgZW5kIHRpbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsb29wU3RhcnQgLSBsb29wIHN0YXJ0IHZhbHVlLlxuICAgKiBAcGFyYW0ge051bWJlcn0gbG9vcEVuZCAtIGxvb3AgZW5kIHZhbHVlLlxuICAgKi9cbiAgc2V0TG9vcEJvdW5kYXJpZXMobG9vcFN0YXJ0LCBsb29wRW5kKSB7XG4gICAgdGhpcy5fX2xvb3BTdGFydCA9IGxvb3BTdGFydDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IGxvb3BFbmQ7XG5cbiAgICB0aGlzLmxvb3AgPSB0aGlzLmxvb3A7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBsb29wIHN0YXJ0IHZhbHVlXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGxvb3BTdGFydFxuICAgKiBAbWVtYmVyb2YgUGxheUNvbnRyb2xcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgbG9vcFN0YXJ0KGxvb3BTdGFydCkge1xuICAgIHRoaXMuc2V0TG9vcEJvdW5kYXJpZXMobG9vcFN0YXJ0LCB0aGlzLl9fbG9vcEVuZCk7XG4gIH1cblxuICBnZXQgbG9vcFN0YXJ0KCkge1xuICAgIHJldHVybiB0aGlzLl9fbG9vcFN0YXJ0O1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbG9vcCBlbmQgdmFsdWVcbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgbG9vcEVuZFxuICAgKiBAbWVtYmVyb2YgUGxheUNvbnRyb2xcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgbG9vcEVuZChsb29wRW5kKSB7XG4gICAgdGhpcy5zZXRMb29wQm91bmRhcmllcyh0aGlzLl9fbG9vcFN0YXJ0LCBsb29wRW5kKTtcbiAgfVxuXG4gIGdldCBsb29wRW5kKCkge1xuICAgIHJldHVybiB0aGlzLl9fbG9vcEVuZDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgY29uc3QgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBwbGF5YmFja1xuICAgKi9cbiAgc3RhcnQoKSB7XG4gICAgY29uc3QgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCB0aGlzLl9fcGxheWluZ1NwZWVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXVzZXMgcGxheWJhY2sgYW5kIHN0YXlzIGF0IHRoZSBzYW1lIHBvc2l0aW9uLlxuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgY29uc3QgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyBwbGF5YmFjayBhbmQgc2Vla3MgdG8gaW5pdGlhbCAoMCkgcG9zaXRpb24uXG4gICAqL1xuICBzdG9wKCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIDAsIDAsIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHNwZWVkIGlmIHByb3ZpZGVkLCBzZXRzIHRoZSBwbGF5YmFjayBzcGVlZC4gVGhlIHNwZWVkIHZhbHVlIHNob3VsZFxuICAgKiBiZSBub24temVybyBiZXR3ZWVuIC0xNiBhbmQgLTEvMTYgb3IgYmV0d2VlbiAxLzE2IGFuZCAxNi5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgc3BlZWRcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgY29uc3QgdGltZSA9IHRoaXMuX19zeW5jKCk7XG5cbiAgICBpZiAoc3BlZWQgPj0gMCkge1xuICAgICAgaWYgKHNwZWVkIDwgMC4wMSlcbiAgICAgICAgc3BlZWQgPSAwLjAxO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAxMDApXG4gICAgICAgIHNwZWVkID0gMTAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc3BlZWQgPCAtMTAwKVxuICAgICAgICBzcGVlZCA9IC0xMDA7XG4gICAgICBlbHNlIGlmIChzcGVlZCA+IC0wLjAxKVxuICAgICAgICBzcGVlZCA9IC0wLjAxO1xuICAgIH1cblxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSBzcGVlZDtcblxuICAgIGlmICghdGhpcy5tYXN0ZXIgJiYgdGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBnZXQgc3BlZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5aW5nU3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0IChqdW1wIHRvKSBwbGF5aW5nIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gdGFyZ2V0IHBvc2l0aW9uXG4gICAqL1xuICBzZWVrKHBvc2l0aW9uKSB7XG4gICAgY29uc3QgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCwgdHJ1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheUNvbnRyb2w7XG4iLCJpbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi9jb3JlL1NjaGVkdWxpbmdRdWV1ZSc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCd3YXZlc2pzOm1hc3RlcnMnKTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jdGlvblRvQ2hlY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uVG9DaGVjayAmJiB7fS50b1N0cmluZy5jYWxsKGZ1bmN0aW9uVG9DaGVjaykgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICogVGhlIGBTY2hlZHVsZXJgIGNsYXNzIGltcGxlbWVudHMgYSBtYXN0ZXIgZm9yIGBUaW1lRW5naW5lYCBpbnN0YW5jZXNcbiAqIHRoYXQgaW1wbGVtZW50IHRoZSAqc2NoZWR1bGVkKiBpbnRlcmZhY2UgKHN1Y2ggYXMgdGhlIGBNZXRyb25vbWVgIGFuZFxuICogYEdyYW51bGFyRW5naW5lYCkuXG4gKlxuICogQSBgU2NoZWR1bGVyYCBjYW4gYWxzbyBzY2hlZHVsZSBzaW1wbGUgY2FsbGJhY2sgZnVuY3Rpb25zLlxuICogVGhlIGNsYXNzIGlzIGJhc2VkIG9uIHJlY3Vyc2l2ZSBjYWxscyB0byBgc2V0VGltZW91dGAgYW5kIHVzZXMgdGhlIHRpbWVcbiAqIHJldHVybmVkIGJ5IHRoZSBgZ2V0VGltZUZ1bmN0aW9uYCBwYXNzZWQgYXMgZmlyc3QgYXJndW1lbnQgYXMgYSBsb2dpY2FsIHRpbWVcbiAqIHBhc3NlZCB0byB0aGUgYGFkdmFuY2VUaW1lYCBtZXRob2RzIG9mIHRoZSBzY2hlZHVsZWQgZW5naW5lcyBvciB0byB0aGVcbiAqIHNjaGVkdWxlZCBjYWxsYmFjayBmdW5jdGlvbnMuXG4gKiBJdCBleHRlbmRzIHRoZSBgU2NoZWR1bGluZ1F1ZXVlYCBjbGFzcyB0aGF0IGl0c2VsZiBpbmNsdWRlcyBhIGBQcmlvcml0eVF1ZXVlYFxuICogdG8gYXNzdXJlIHRoZSBvcmRlciBvZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgKHNlZSBgU2ltcGxlU2NoZWR1bGVyYCBmb3IgYVxuICogc2ltcGxpZmllZCBzY2hlZHVsZXIgaW1wbGVtZW50YXRpb24gd2l0aG91dCBgUHJpb3JpdHlRdWV1ZWApLlxuICpcbiAqIHtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1tYXN0ZXJzL21hc3Rlci9leGFtcGxlcy9zY2hlZHVsZXJ9XG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZ2V0VGltZUZ1bmN0aW9uIC0gRnVuY3Rpb24gdGhhdCBtdXN0IHJldHVybiBhIHRpbWUgaW4gc2Vjb25kLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSAtIGRlZmF1bHQgb3B0aW9ucy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2Q9MC4wMjVdIC0gcGVyaW9kIG9mIHRoZSBzY2hlZHVsZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubG9va2FoZWFkPTAuMV0gLSBsb29rYWhlYWQgb2YgdGhlIHNjaGVkdWxlci5cbiAqXG4gKiBAc2VlIFRpbWVFbmdpbmVcbiAqIEBzZWUgU2ltcGxlU2NoZWR1bGVyXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIG1hc3RlcnMgZnJvbSAnd2F2ZXMtbWFzdGVycyc7XG4gKlxuICogY29uc3QgZ2V0VGltZUZ1bmN0aW9uID0gKCkgPT4gcHJlZm9ybWFuY2Uubm93KCkgLyAxMDAwO1xuICogY29uc3Qgc2NoZWR1bGVyID0gbmV3IG1hc3RlcnMuU2NoZWR1bGVyKGdldFRpbWVGdW5jdGlvbik7XG4gKlxuICogc2NoZWR1bGVyLmFkZChteUVuZ2luZSk7XG4gKi9cbmNsYXNzIFNjaGVkdWxlciBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKGdldFRpbWVGdW5jdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghaXNGdW5jdGlvbihnZXRUaW1lRnVuY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50IGBnZXRUaW1lRnVuY3Rpb25gJyk7XG5cbiAgICB0aGlzLmdldFRpbWVGdW5jdGlvbiA9IGdldFRpbWVGdW5jdGlvbjtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBlcmlvZFxuICAgICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZCA9IG9wdGlvbnMucGVyaW9kIHx8IMKgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgbG9va2FoZWFkXG4gICAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgwqAwLjE7XG4gIH1cblxuICAvLyBzZXRUaW1lb3V0IHNjaGVkdWxpbmcgbG9vcFxuICBfX3RpY2soKSB7XG4gICAgY29uc3QgY3VycmVudFRpbWUgPSB0aGlzLmdldFRpbWVGdW5jdGlvbigpO1xuICAgIGxldCB0aW1lID0gdGhpcy5fX25leHRUaW1lO1xuXG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgd2hpbGUgKHRpbWUgPD0gY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZCkge1xuICAgICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgIHRpbWUgPSB0aGlzLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpIHtcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0KHRoaXMsIHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgaWYgKHRoaXMuX19uZXh0VGltZSA9PT0gSW5maW5pdHkpXG4gICAgICAgICAgbG9nKCdTY2hlZHVsZXIgU3RhcnQnKTtcblxuICAgICAgICBjb25zdCB0aW1lT3V0RGVsYXkgPSBNYXRoLm1heCgodGltZSAtIHRoaXMubG9va2FoZWFkIC0gdGhpcy5nZXRUaW1lRnVuY3Rpb24oKSksIHRoaXMucGVyaW9kKTtcblxuICAgICAgICB0aGlzLl9fdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICAgIH0sIE1hdGguY2VpbCh0aW1lT3V0RGVsYXkgKiAxMDAwKSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19uZXh0VGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgbG9nKCdTY2hlZHVsZXIgU3RvcCcpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXIgY3VycmVudCBsb2dpY2FsIHRpbWUuXG4gICAqXG4gICAqIEBuYW1lIGN1cnJlbnRUaW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmdldFRpbWVGdW5jdGlvbigpICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBpbmhlcml0ZWQgZnJvbSBzY2hlZHVsaW5nIHF1ZXVlXG4gIC8qKlxuICAgKiBBZGQgYSBUaW1lRW5naW5lIG9yIGEgc2ltcGxlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHRoZSBzY2hlZHVsZXIgYXQgYW5cbiAgICogb3B0aW9uYWxseSBnaXZlbiB0aW1lLiBXaGV0aGVyIHRoZSBhZGQgbWV0aG9kIGlzIGNhbGxlZCB3aXRoIGEgVGltZUVuZ2luZVxuICAgKiBvciBhIGNhbGxiYWNrIGZ1bmN0aW9uIGl0IHJldHVybnMgYSBUaW1lRW5naW5lIHRoYXQgY2FuIGJlIHVzZWQgYXMgYXJndW1lbnRcbiAgICogb2YgdGhlIG1ldGhvZHMgcmVtb3ZlIGFuZCByZXNldEVuZ2luZVRpbWUuIEEgVGltZUVuZ2luZSBhZGRlZCB0byBhIHNjaGVkdWxlclxuICAgKiBoYXMgdG8gaW1wbGVtZW50IHRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlLiBUaGUgY2FsbGJhY2sgZnVuY3Rpb24gYWRkZWQgdG8gYVxuICAgKiBzY2hlZHVsZXIgd2lsbCBiZSBjYWxsZWQgYXQgdGhlIGdpdmVuIHRpbWUgYW5kIHdpdGggdGhlIGdpdmVuIHRpbWUgYXNcbiAgICogYXJndW1lbnQuIFRoZSBjYWxsYmFjayBjYW4gcmV0dXJuIGEgbmV3IHNjaGVkdWxpbmcgdGltZSAoaS5lLiB0aGUgbmV4dFxuICAgKiB0aW1lIHdoZW4gaXQgd2lsbCBiZSBjYWxsZWQpIG9yIGl0IGNhbiByZXR1cm4gSW5maW5pdHkgdG8gc3VzcGVuZCBzY2hlZHVsaW5nXG4gICAqIHdpdGhvdXQgcmVtb3ZpbmcgdGhlIGZ1bmN0aW9uIGZyb20gdGhlIHNjaGVkdWxlci4gQSBmdW5jdGlvbiB0aGF0IGRvZXNcbiAgICogbm90IHJldHVybiBhIHZhbHVlIChvciByZXR1cm5zIG51bGwgb3IgMCkgaXMgcmVtb3ZlZCBmcm9tIHRoZSBzY2hlZHVsZXJcbiAgICogYW5kIGNhbm5vdCBiZSB1c2VkIGFzIGFyZ3VtZW50IG9mIHRoZSBtZXRob2RzIHJlbW92ZSBhbmQgcmVzZXRFbmdpbmVUaW1lXG4gICAqIGFueW1vcmUuXG4gICAqXG4gICAqIEBuYW1lIGFkZFxuICAgKiBAZnVuY3Rpb25cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfEZ1bmN0aW9ufSBlbmdpbmUgLSBFbmdpbmUgdG8gYWRkIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFt0aW1lPXRoaXMuY3VycmVudFRpbWVdIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgLyoqXG4gICAqIFJlbW92ZSBhIFRpbWVFbmdpbmUgZnJvbSB0aGUgc2NoZWR1bGVyIHRoYXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlXG4gICAqIHNjaGVkdWxlciB1c2luZyB0aGUgYWRkIG1ldGhvZC5cbiAgICpcbiAgICogQG5hbWUgYWRkXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZW1vdmUgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIC8qKlxuICAgKiBSZXNjaGVkdWxlIGEgc2NoZWR1bGVkIHRpbWUgZW5naW5lIGF0IGEgZ2l2ZW4gdGltZS5cbiAgICpcbiAgICogQG5hbWUgcmVzZXRFbmdpbmVUaW1lXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZXNjaGVkdWxlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgc2NoZWR1bGVkIGNhbGxiYWNrcyBhbmQgZW5naW5lcyBmcm9tIHRoZSBzY2hlZHVsZXIuXG4gICAqXG4gICAqIEBuYW1lIGNsZWFyXG4gICAqIEBmdW5jdGlvblxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2NoZWR1bGVyO1xuIiwiaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvVGltZUVuZ2luZSc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCd3YXZlc2pzOm1hc3RlcnMnKTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jdGlvblRvQ2hlY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uVG9DaGVjayAmJiB7fS50b1N0cmluZy5jYWxsKGZ1bmN0aW9uVG9DaGVjaykgPT09ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG59XG5cbi8qKlxuICpcbiAqXG4gKlxuICogVGhlIFNpbXBsZVNjaGVkdWxlciBjbGFzcyBpbXBsZW1lbnRzIGEgc2ltcGxpZmllZCBtYXN0ZXIgZm9yIHRpbWUgZW5naW5lc1xuICogKHNlZSBUaW1lRW5naW5lKSB0aGF0IGltcGxlbWVudCB0aGUgc2NoZWR1bGVkIGludGVyZmFjZVxuICogc3VjaCBhcyB0aGUgTWV0cm9ub21lIGFuZCB0aGUgR3JhbnVsYXJFbmdpbmUuIFRoZSBBUEkgYW5kIGZ1bnRpb25hbGl0aWVzIG9mXG4gKiB0aGUgU2ltcGxlU2NoZWR1bGVyIGNsYXNzIGFyZSBpZGVudGljYWwgdG8gdGhlIFNjaGVkdWxlciBjbGFzcy4gQnV0LCBvdGhlclxuICogdGhhbiB0aGUgU2NoZWR1bGVyLCB0aGUgU2ltcGxlU2NoZWR1bGVyIGNsYXNzIGRvZXMgbm90IGd1YXJhbnRlZSB0aGUgb3JkZXJcbiAqIG9mIGV2ZW50cyAoaS5lLiBjYWxscyB0byB0aGUgYWR2YW5jZVRpbWUgbWV0aG9kIG9mIHNjaGVkdWxlZCB0aW1lIGVuZ2luZXNcbiAqIGFuZCB0byBzY2hlZHVsZWQgY2FsbGJhY2sgZnVuY3Rpb25zKSB3aXRoaW4gYSBzY2hlZHVsaW5nIHBlcmlvZCAoc2VlIHBlcmlvZFxuICogYXR0cmlidXRlKS5cbiAqXG4gKiB7QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtbWFzdGVycy9tYXN0ZXIvZXhhbXBsZXMvc2NoZWR1bGVyfVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVGdW5jdGlvbiAtIEZ1bmN0aW9uIHRoYXQgbXVzdCByZXR1cm4gYSB0aW1lIGluIHNlY29uZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBkZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2Q9MC4wMjVdIC0gcGVyaW9kIG9mIHRoZSBzY2hlZHVsZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubG9va2FoZWFkPTAuMV0gLSBsb29rYWhlYWQgb2YgdGhlIHNjaGVkdWxlci5cbiAqXG4gKiBAc2VlIFRpbWVFbmdpbmVcbiAqIEBzZWUgU2NoZWR1bGVyXG4gKlxuICogQGV4YW1wbGVcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBtYXN0ZXJzIGZyb20gJ3dhdmVzLW1hc3RlcnMnO1xuICpcbiAqIGNvbnN0IGdldFRpbWVGdW5jdGlvbiA9ICgpID0+IHByZWZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAqIGNvbnN0IHNjaGVkdWxlciA9IG5ldyBtYXN0ZXJzLlNpbXBsZVNjaGVkdWxlcihnZXRUaW1lRnVuY3Rpb24pO1xuICpcbiAqIHNjaGVkdWxlci5hZGQobXlFbmdpbmUpO1xuICovXG5jbGFzcyBTaW1wbGVTY2hlZHVsZXIge1xuICBjb25zdHJ1Y3RvcihnZXRUaW1lRnVuY3Rpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIGlmICghaXNGdW5jdGlvbihnZXRUaW1lRnVuY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50IGBnZXRUaW1lRnVuY3Rpb25gJyk7XG5cbiAgICB0aGlzLmdldFRpbWVGdW5jdGlvbiA9IGdldFRpbWVGdW5jdGlvbjtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gbmV3IFNldCgpO1xuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcyA9IFtdO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzID0gW107XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciAoc2V0VGltZW91dCkgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RcbiAgICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCAwLjAyNTtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciBsb29rYWhlYWQgdGltZSAoPiBwZXJpb2QpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBsb29rYWhlYWRcbiAgICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fCAwLjE7XG4gIH1cblxuICBfX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLnB1c2godGltZSk7XG4gIH1cblxuICBfX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaW5kZXhdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5wdXNoKGVuZ2luZSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIF9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX19zY2hlZEVuZ2luZXMuaW5kZXhPZihlbmdpbmUpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMuX19zY2hlZFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgX19yZXNldFRpY2soKSB7XG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgaWYgKCF0aGlzLl9fdGltZW91dCkge1xuICAgICAgICBsb2coJ1NpbXBsZVNjaGVkdWxlciBTdGFydCcpO1xuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGxvZygnU2ltcGxlU2NoZWR1bGVyIFN0b3AnKTtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX190aWNrKCkge1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gdGhpcy5nZXRUaW1lRnVuY3Rpb24oKTtcbiAgICBsZXQgaSA9IDA7XG5cbiAgICB3aGlsZSAoaSA8IHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9fc2NoZWRFbmdpbmVzW2ldO1xuICAgICAgbGV0IHRpbWUgPSB0aGlzLl9fc2NoZWRUaW1lc1tpXTtcblxuICAgICAgd2hpbGUgKHRpbWUgJiYgdGltZSA8PSBjdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCBjdXJyZW50VGltZSk7XG4gICAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICAgIHRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aW1lICYmIHRpbWUgPCBJbmZpbml0eSkge1xuICAgICAgICB0aGlzLl9fc2NoZWRUaW1lc1tpKytdID0gdGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGVuZ2luZSBmcm9tIHNjaGVkdWxlclxuICAgICAgICBpZiAoIXRpbWUpIHtcbiAgICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuX19zY2hlZEVuZ2luZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH0sIHRoaXMucGVyaW9kICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlciBjdXJyZW50IGxvZ2ljYWwgdGltZS5cbiAgICpcbiAgICogQG5hbWUgY3VycmVudFRpbWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuZ2V0VGltZUZ1bmN0aW9uKCkgKyB0aGlzLmxvb2thaGVhZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8vIGNhbGwgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWVcbiAgLyoqXG4gICAqIERlZmVyIHRoZSBleGVjdXRpb24gb2YgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1biAtIEZ1bmN0aW9uIHRvIGRlZmVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKHRpbWUpIHsgZnVuKHRpbWUpOyB9LCAvLyBtYWtlIHN1ciB0aGF0IHRoZSBhZHZhbmNlVGltZSBtZXRob2QgZG9lcyBub3QgcmV0dXJtIGFueXRoaW5nXG4gICAgfSwgdGltZSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgVGltZUVuZ2luZSBmdW5jdGlvbiB0byB0aGUgc2NoZWR1bGVyIGF0IGFuIG9wdGlvbmFsbHkgZ2l2ZW4gdGltZS5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gYWRkIHRvIHRoZSBzY2hlZHVsZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFt0aW1lPXRoaXMuY3VycmVudFRpbWVdIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgYWRkKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIVRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgLy8gc2V0IG1hc3RlciBhbmQgYWRkIHRvIGFycmF5XG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gICAgdGhpcy5fX2VuZ2luZXMuYWRkKGVuZ2luZSk7XG5cbiAgICAvLyBzY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgVGltZUVuZ2luZSBmcm9tIHRoZSBzY2hlZHVsZXIgdGhhdCBoYXMgYmVlbiBhZGRlZCB0byB0aGVcbiAgICogc2NoZWR1bGVyIHVzaW5nIHRoZSBhZGQgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZW1vdmUgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBpZiAoIWVuZ2luZS5tYXN0ZXIgfHwgZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImVuZ2luZSBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICAvLyByZXNldCBtYXN0ZXIgYW5kIHJlbW92ZSBmcm9tIGFycmF5XG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG5cbiAgICAvLyB1bnNjaGVkdWxlIGVuZ2luZVxuICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2NoZWR1bGUgYSBzY2hlZHVsZWQgdGltZSBlbmdpbmUgYXQgYSBnaXZlbiB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IGVuZ2luZSAtIEVuZ2luZSB0byByZXNjaGVkdWxlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gU2NoZWR1bGUgdGltZVxuICAgKi9cbiAgcmVzZXRFbmdpbmVUaW1lKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICB0aGlzLl9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZW5naW5lIGlzIHNjaGVkdWxlZC5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gY2hlY2tcbiAgICovXG4gIGhhcyhlbmdpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5fX2VuZ2luZXMuaGFzKGVuZ2luZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBlbmdpbmVzIGZyb20gdGhlIHNjaGVkdWxlci5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMubGVuZ3RoID0gMDtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaW1wbGVTY2hlZHVsZXI7XG4iLCJpbXBvcnQgUHJpb3JpdHlRdWV1ZSBmcm9tICcuLi9jb3JlL1ByaW9yaXR5UXVldWUnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi9jb3JlL1NjaGVkdWxpbmdRdWV1ZSc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL1RpbWVFbmdpbmUnO1xuXG5cbmZ1bmN0aW9uIGFkZER1cGxldChmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZmlyc3RFbGVtZW50LCBzZWNvbmRFbGVtZW50KSB7XG4gIGZpcnN0QXJyYXkucHVzaChmaXJzdEVsZW1lbnQpO1xuICBzZWNvbmRBcnJheS5wdXNoKHNlY29uZEVsZW1lbnQpO1xufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsZXQoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCkge1xuICBjb25zdCBpbmRleCA9IGZpcnN0QXJyYXkuaW5kZXhPZihmaXJzdEVsZW1lbnQpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgY29uc3Qgc2Vjb25kRWxlbWVudCA9IHNlY29uZEFycmF5W2luZGV4XTtcblxuICAgIGZpcnN0QXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBzZWNvbmRBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgcmV0dXJuIHNlY29uZEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gVGhlIFRyYW5zcG9ydGVkIGNhbGwgaXMgdGhlIGJhc2UgY2xhc3Mgb2YgdGhlIGFkYXB0ZXJzIGJldHdlZW5cbi8vIGRpZmZlcmVudCB0eXBlcyBvZiBlbmdpbmVzIChpLmUuIHRyYW5zcG9ydGVkLCBzY2hlZHVsZWQsIHBsYXktY29udHJvbGxlZClcbi8vIFRoZSBhZGFwdGVycyBhcmUgYXQgdGhlIHNhbWUgdGltZSBtYXN0ZXJzIGZvciB0aGUgZW5naW5lcyBhZGRlZCB0byB0aGUgdHJhbnNwb3J0XG4vLyBhbmQgdHJhbnNwb3J0ZWQgVGltZUVuZ2luZXMgaW5zZXJ0ZWQgaW50byB0aGUgdHJhbnNwb3J0J3MgcG9zaXRpb24tYmFzZWQgcHJpdG9yaXR5IHF1ZXVlLlxuY2xhc3MgVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0LCBkdXJhdGlvbiwgb2Zmc2V0LCBzdHJldGNoID0gMSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tYXN0ZXIgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuXG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydDtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSAhaXNGaW5pdGUoZHVyYXRpb24pID8gSW5maW5pdHkgOiBzdGFydCArIGR1cmF0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IHN0YXJ0ICsgb2Zmc2V0O1xuICAgIHRoaXMuX19zdHJldGNoUG9zaXRpb24gPSBzdHJldGNoO1xuICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgfVxuXG4gIHNldEJvdW5kYXJpZXMoc3RhcnQsIGR1cmF0aW9uLCBvZmZzZXQgPSAwLCBzdHJldGNoID0gMSkge1xuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnQ7XG4gICAgdGhpcy5fX2VuZFBvc2l0aW9uID0gc3RhcnQgKyBkdXJhdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBzdGFydCArIG9mZnNldDtcbiAgICB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uID0gc3RyZXRjaDtcbiAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge31cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge31cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcG9zaXRpb24gKz0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuXG4gICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gIH1cblxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgaWYgKHBvc2l0aW9uIDwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcblxuICAgICAgICBpZiAodGhpcy5fX2lzUnVubmluZylcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfSBlbHNlIGlmIChwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2lzUnVubmluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwb3NpdGlvbiA+IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICBpZiAodGhpcy5fX2lzUnVubmluZykgLy8gaWYgZW5naW5lIGlzIHJ1bm5pbmdcbiAgICAgICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPiB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2lzUnVubmluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fX2lzUnVubmluZykgLy8gaWYgZW5naW5lIGlzIHJ1bm5pbmdcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKCF0aGlzLl9faXNSdW5uaW5nKSB7XG4gICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB0aGlzLl9faXNSdW5uaW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKHNwZWVkID4gMClcbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcblxuICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgIH1cblxuICAgIC8vIHN0b3AgZW5naW5lXG4gICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICByZXR1cm4gSW5maW5pdHkgKiBzcGVlZDtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPT09IDApIC8vIHN0b3BcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcblxuICAgIHRoaXMuX19lbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkXG4vLyBoYXMgdG8gc3dpdGNoIG9uIGFuZCBvZmYgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5tYXgocG9zaXRpb24sIHRoaXMuX19zdGFydFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPj0gdGhpcy5fX3N0YXJ0UG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IE1hdGgubWluKHBvc2l0aW9uLCB0aGlzLl9fZW5kUG9zaXRpb24pO1xuXG4gICAgcmV0dXJuIHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgcG9zaXRpb24gPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gKyB0aGlzLl9fZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA8IHRoaXMuX19lbmRQb3NpdGlvbiB8fCBzcGVlZCA8IDAgJiYgcG9zaXRpb24gPj0gdGhpcy5fX3N0YXJ0UG9zaXRpb24pXG4gICAgICByZXR1cm4gcG9zaXRpb247XG5cbiAgICByZXR1cm4gSW5maW5pdHkgKiBzcGVlZDtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkXG4vLyBoYXMgdG8gc3RhcnQgYW5kIHN0b3AgdGhlIHNwZWVkLWNvbnRyb2xsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgdHJ1ZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9faXNSdW5uaW5nKVxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGhpcy5tYXN0ZXIuY3VycmVudFRpbWUsIHRoaXMubWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgMCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU2NoZWR1bGVkXG4vLyBoYXMgdG8gc3dpdGNoIG9uIGFuZCBvZmYgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFNjaGVkdWxlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuXG4gICAgLy8gc2NoZWR1bGluZyBxdWV1ZSBiZWNvbWVzIG1hc3RlciBvZiBlbmdpbmVcbiAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsaW5nUXVldWUuYWRkKGVuZ2luZSwgSW5maW5pdHkpO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVzZXRFbmdpbmVUaW1lKHRoaXMuX19lbmdpbmUsIHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlc2V0RW5naW5lVGltZSh0aGlzLl9fZW5naW5lLCBJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlbW92ZSh0aGlzLl9fZW5naW5lKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gdHJhbnNsYXRlcyBhZHZhbmNlUG9zaXRpb24gb2YgKnRyYW5zcG9ydGVkKiBlbmdpbmVzIGludG8gZ2xvYmFsIHNjaGVkdWxlciB0aW1lc1xuY2xhc3MgVHJhbnNwb3J0U2NoZWR1bGVySG9vayBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBJbmZpbml0eTtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgY29uc3QgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgY29uc3Qgc3BlZWQgPSB0cmFuc3BvcnQuX19zcGVlZDtcbiAgICBjb25zdCBuZXh0UG9zaXRpb24gPSB0cmFuc3BvcnQuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgY29uc3QgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBuZXh0VGltZTtcblxuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgY29uc3QgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICBjb25zdCB0aW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IHRpbWU7XG5cbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IG51bGw7XG4gIH1cbn1cblxuLy8gaW50ZXJuYWwgc2NoZWR1bGluZyBxdWV1ZSB0aGF0IHJldHVybnMgdGhlIGN1cnJlbnQgcG9zaXRpb24gKGFuZCB0aW1lKSBvZiB0aGUgcGxheSBjb250cm9sXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFByb3ZpZGVzIHBvc2l0aW9uLWJhc2VkIHNjaGVkdWxpbmcgb2YgVGltZUVuZ2luZSBpbnN0YW5jZXMuXG4gKlxuICogW2V4YW1wbGVde0BsaW5rIGh0dHBzOi8vcmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLW1hc3RlcnMvbWFzdGVyL2V4YW1wbGVzL3RyYW5zcG9ydH1cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgbWFzdGVycyBmcm9tICd3YXZlcy1tYXN0ZXJzJztcbiAqXG4gKiBjb25zdCBnZXRUaW1lRnVuY3Rpb24gPSAoKSA9PiB7XG4gKiAgIGNvbnN0IG5vdyA9IHByb2Nlc3MuaHJ0aW1lKCk7XG4gKiAgIHJldHVybiBub3dbMF0gKyBub3dbMV0gKiAxZS05O1xuICogfVxuICogY29uc3Qgc2NoZWR1bGVyID0gbmV3IG1hc3RlcnMuU2NoZWR1bGVyKGdldFRpbWVGdW5jdGlvbik7XG4gKiBjb25zdCB0cmFuc3BvcnQgPSBuZXcgbWFzdGVycy5UcmFuc3BvcnQoc2NoZWR1bGVyKTtcbiAqIGNvbnN0IHBsYXlDb250cm9sID0gbmV3IG1hc3RlcnMuUGxheUNvbnRyb2woc2NoZWR1bGVyLCB0cmFuc3BvcnQpO1xuICogY29uc3QgbXlFbmdpbmUgPSBuZXcgTXlFbmdpbmUoKTtcbiAqIGNvbnN0IHlvdXJFbmdpbmUgPSBuZXcgeW91ckVuZ2luZSgpO1xuICpcbiAqIHRyYW5zcG9ydC5hZGQobXlFbmdpbmUpO1xuICogdHJhbnNwb3J0LmFkZCh5b3VyRW5naW5lKTtcbiAqXG4gKiBwbGF5Q29udHJvbC5zdGFydCgpO1xuICovXG5jbGFzcyBUcmFuc3BvcnQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Ioc2NoZWR1bGVyLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKCFzY2hlZHVsZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgYXJndW1lbnQgYHNjaGVkdWxlcmAsIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBgU2NoZWR1bGVyYCcpO1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ZWQgPSBbXTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBzY2hlZHVsZXI7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBuZXcgVHJhbnNwb3J0U2NoZWR1bGVySG9vayh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZSA9IG5ldyBQcmlvcml0eVF1ZXVlKCk7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUodGhpcyk7XG5cbiAgICAvLyBzeW5jcm9uaXplZCB0aW1lLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcbiAgfVxuXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICBpZiAodGhpcy5fX3NwZWVkID09PSAwKVxuICAgICAgcmV0dXJuICtJbmZpbml0eTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBjb25zdCBudW1UcmFuc3BvcnRlZEVuZ2luZXMgPSB0aGlzLl9fdHJhbnNwb3J0ZWQubGVuZ3RoO1xuICAgIGxldCBuZXh0UG9zaXRpb24gPSBJbmZpbml0eSAqIHNwZWVkO1xuXG4gICAgaWYgKG51bVRyYW5zcG9ydGVkRW5naW5lcyA+IDApIHtcbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmNsZWFyKCk7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtVHJhbnNwb3J0ZWRFbmdpbmVzOyBpKyspIHtcbiAgICAgICAgY29uc3QgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkW2ldO1xuICAgICAgICBjb25zdCBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbik7XG4gICAgICB9XG5cbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLnRpbWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgZm9yIChsZXQgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWUuIFRoaXMgZ2V0dGVyIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgdHJhbnNwb3J0XG4gICAqIGlzIGFkZGVkIHRvIGEgbWFzdGVyIChpLmUuIHRyYW5zcG9ydCBvciBwbGF5LWNvbnRyb2wpLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBjdXJyZW50VGltZVxuICAgKiBAbWVtYmVyb2YgVHJhbnNwb3J0XG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgcG9zaXRpb24uIFRoaXMgZ2V0dGVyIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgdHJhbnNwb3J0XG4gICAqIGlzIGFkZGVkIHRvIGEgbWFzdGVyIChpLmUuIHRyYW5zcG9ydCBvciBwbGF5LWNvbnRyb2wpLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBjdXJyZW50UG9zaXRpb25cbiAgICogQG1lbWJlcm9mIFRyYW5zcG9ydFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBuZXh0IHRyYW5zcG9ydCBwb3NpdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbmV4dCAtIHRyYW5zcG9ydCBwb3NpdGlvblxuICAgKi9cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIGNvbnN0IG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSB0cmFuc3BvcnRlZCB0aW1lIGVuZ2luZSBpbnRlcmZhY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWRcbiAgICovXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICByZXR1cm4gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2YgdGhlIHRyYW5zcG9ydGVkIHRpbWUgZW5naW5lIGludGVyZmFjZS5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzcGVlZFxuICAgKi9cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmhlYWQ7XG4gICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgdHJhbnNwb3J0ZWQgdGltZSBlbmdpbmUgaW50ZXJmYWNlLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZVxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NlZWs9ZmFsc2VdXG4gICAqL1xuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICBjb25zdCBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIGxldCBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0YXJ0XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdG9wXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hhbmdlIHNwZWVkIHdpdGhvdXQgcmV2ZXJzaW5nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgLSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBzdGFydCBwb3NpdGlvblxuICAgKi9cbiAgYWRkKGVuZ2luZSwgc3RhcnRQb3NpdGlvbiA9IDAsIGVuZFBvc2l0aW9uID0gSW5maW5pdHksIG9mZnNldFBvc2l0aW9uID0gMCkge1xuICAgIGxldCB0cmFuc3BvcnRlZCA9IG51bGw7XG5cbiAgICBpZiAob2Zmc2V0UG9zaXRpb24gPT09IC1JbmZpbml0eSlcbiAgICAgIG9mZnNldFBvc2l0aW9uID0gMDtcblxuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzVHJhbnNwb3J0ZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZChlbmdpbmUpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTY2hlZHVsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gYSB0cmFuc3BvcnRcIik7XG5cbiAgICBpZiAodHJhbnNwb3J0ZWQpIHtcbiAgICAgIGNvbnN0IHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgICBhZGREdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lLCB0cmFuc3BvcnRlZCk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICBjb25zdCBuZXh0RW5naW5lUG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcbiAgICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUuaW5zZXJ0KHRyYW5zcG9ydGVkLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cmFuc3BvcnRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYSB0aW1lIGVuZ2luZSBmcm9tIHRoZSB0cmFuc3BvcnQuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBlbmdpbmVPclRyYW5zcG9ydGVkIC0gZW5naW5lIG9yIHRyYW5zcG9ydGVkIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGUgdHJhbnNwb3J0XG4gICAqL1xuICByZW1vdmUoZW5naW5lT3JUcmFuc3BvcnRlZCkge1xuICAgIGxldCBlbmdpbmUgPSBlbmdpbmVPclRyYW5zcG9ydGVkO1xuICAgIGxldCB0cmFuc3BvcnRlZCA9IHJlbW92ZUR1cGxldCh0aGlzLl9fZW5naW5lcywgdGhpcy5fX3RyYW5zcG9ydGVkLCBlbmdpbmVPclRyYW5zcG9ydGVkKTtcblxuICAgIGlmICghdHJhbnNwb3J0ZWQpIHtcbiAgICAgIGVuZ2luZSA9IHJlbW92ZUR1cGxldCh0aGlzLl9fdHJhbnNwb3J0ZWQsIHRoaXMuX19lbmdpbmVzLCBlbmdpbmVPclRyYW5zcG9ydGVkKTtcbiAgICAgIHRyYW5zcG9ydGVkID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICB9XG5cbiAgICBpZiAoZW5naW5lICYmIHRyYW5zcG9ydGVkKSB7XG4gICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgdHJhbnNwb3J0XCIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBwb3NpdGlvbiBvZiB0aGUgZ2l2ZW4gZW5naW5lLlxuICAgKlxuICAgKiBAcGFyYW0ge1RpbWVFbmdpbmV9IHRyYW5zcG9ydGVkIC0gRW5naW5lIHRvIHJlc2V0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvbiAtIE5ldyBwb3NpdGlvblxuICAgKi9cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbih0cmFuc3BvcnRlZCwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgaWYgKHBvc2l0aW9uID09PSB1bmRlZmluZWQpXG4gICAgICAgIHBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUodHJhbnNwb3J0ZWQsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRpbWUgZW5naW5lcyBmcm9tIHRoZSB0cmFuc3BvcnQuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLmN1cnJlbnRQb3NpdGlvbiwgMCk7XG5cbiAgICBmb3IgKGxldCB0cmFuc3BvcnRlZCBvZiB0aGlzLl9fdHJhbnNwb3J0ZWQpXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNwb3J0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3NldFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4uL2NvcmUtanMvb2JqZWN0L2dldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfZ2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIik7XG5cbnZhciBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2dldE93blByb3BlcnR5RGVzY3JpcHRvcik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIGdldChvYmplY3QsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4gIHZhciBkZXNjID0gKDAsIF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IyLmRlZmF1bHQpKG9iamVjdCwgcHJvcGVydHkpO1xuXG4gIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgcGFyZW50ID0gKDAsIF9nZXRQcm90b3R5cGVPZjIuZGVmYXVsdCkob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59OyIsInJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3InKTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgcmV0dXJuICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpO1xufTtcbiIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zZXQnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNy5zZXQub2YnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnNldC5mcm9tJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5TZXQ7XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBnZXQgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb3JlJykuZ2V0SXRlcmF0b3IgPSBmdW5jdGlvbiAoaXQpIHtcbiAgdmFyIGl0ZXJGbiA9IGdldChpdCk7XG4gIGlmICh0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICByZXR1cm4gYW5PYmplY3QoaXRlckZuLmNhbGwoaXQpKTtcbn07XG4iLCIvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmY7XG5cbnJlcXVpcmUoJy4vX29iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpIHtcbiAgICByZXR1cm4gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0b0lPYmplY3QoaXQpLCBrZXkpO1xuICB9O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbi1zdHJvbmcnKTtcbnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vX3ZhbGlkYXRlLWNvbGxlY3Rpb24nKTtcbnZhciBTRVQgPSAnU2V0JztcblxuLy8gMjMuMiBTZXQgT2JqZWN0c1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uJykoU0VULCBmdW5jdGlvbiAoZ2V0KSB7XG4gIHJldHVybiBmdW5jdGlvbiBTZXQoKSB7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpOyB9O1xufSwge1xuICAvLyAyMy4yLjMuMSBTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcbiAgYWRkOiBmdW5jdGlvbiBhZGQodmFsdWUpIHtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih2YWxpZGF0ZSh0aGlzLCBTRVQpLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZyk7XG4iLCIvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL3Byb3Bvc2FsLXNldG1hcC1vZmZyb20vI3NlYy1zZXQuZnJvbVxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tZnJvbScpKCdTZXQnKTtcbiIsIi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS8jc2VjLXNldC5vZlxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tb2YnKSgnU2V0Jyk7XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuUiwgJ1NldCcsIHsgdG9KU09OOiByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXRvLWpzb24nKSgnU2V0JykgfSk7XG4iLCIvKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcbmV4cG9ydHMuc3RvcmFnZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWVcbiAgICAgICAgICAgICAgICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWUuc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgPyBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICAgICAgICAgICAgICAgICAgOiBsb2NhbHN0b3JhZ2UoKTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxuZXhwb3J0cy5jb2xvcnMgPSBbXG4gICdsaWdodHNlYWdyZWVuJyxcbiAgJ2ZvcmVzdGdyZWVuJyxcbiAgJ2dvbGRlbnJvZCcsXG4gICdkb2RnZXJibHVlJyxcbiAgJ2RhcmtvcmNoaWQnLFxuICAnY3JpbXNvbidcbl07XG5cbi8qKlxuICogQ3VycmVudGx5IG9ubHkgV2ViS2l0LWJhc2VkIFdlYiBJbnNwZWN0b3JzLCBGaXJlZm94ID49IHYzMSxcbiAqIGFuZCB0aGUgRmlyZWJ1ZyBleHRlbnNpb24gKGFueSBGaXJlZm94IHZlcnNpb24pIGFyZSBrbm93blxuICogdG8gc3VwcG9ydCBcIiVjXCIgQ1NTIGN1c3RvbWl6YXRpb25zLlxuICpcbiAqIFRPRE86IGFkZCBhIGBsb2NhbFN0b3JhZ2VgIHZhcmlhYmxlIHRvIGV4cGxpY2l0bHkgZW5hYmxlL2Rpc2FibGUgY29sb3JzXG4gKi9cblxuZnVuY3Rpb24gdXNlQ29sb3JzKCkge1xuICAvLyBOQjogSW4gYW4gRWxlY3Ryb24gcHJlbG9hZCBzY3JpcHQsIGRvY3VtZW50IHdpbGwgYmUgZGVmaW5lZCBidXQgbm90IGZ1bGx5XG4gIC8vIGluaXRpYWxpemVkLiBTaW5jZSB3ZSBrbm93IHdlJ3JlIGluIENocm9tZSwgd2UnbGwganVzdCBkZXRlY3QgdGhpcyBjYXNlXG4gIC8vIGV4cGxpY2l0bHlcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wcm9jZXNzICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5XZWJraXRBcHBlYXJhbmNlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLmZpcmVidWcgfHwgKHdpbmRvdy5jb25zb2xlLmV4Y2VwdGlvbiAmJiB3aW5kb3cuY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHZhciByO1xuICB0cnkge1xuICAgIHIgPSBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICghciAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHIgPSBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxuXG4gIHJldHVybiByO1xufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Z1snZGVmYXVsdCddID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyIG9yIHVwcGVyLWNhc2UgbGV0dGVyLCBpLmUuIFwiblwiIGFuZCBcIk5cIi5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91cyBsb2cgdGltZXN0YW1wLlxuICovXG5cbnZhciBwcmV2VGltZTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdENvbG9yKG5hbWVzcGFjZSkge1xuICB2YXIgaGFzaCA9IDAsIGk7XG5cbiAgZm9yIChpIGluIG5hbWVzcGFjZSkge1xuICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBuYW1lc3BhY2UuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuY29sb3JzW01hdGguYWJzKGhhc2gpICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRGVidWcobmFtZXNwYWNlKSB7XG5cbiAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgLy8gZGlzYWJsZWQ/XG4gICAgaWYgKCFkZWJ1Zy5lbmFibGVkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IGRlYnVnO1xuXG4gICAgLy8gc2V0IGBkaWZmYCB0aW1lc3RhbXBcbiAgICB2YXIgY3VyciA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7XG4gICAgc2VsZi5kaWZmID0gbXM7XG4gICAgc2VsZi5wcmV2ID0gcHJldlRpbWU7XG4gICAgc2VsZi5jdXJyID0gY3VycjtcbiAgICBwcmV2VGltZSA9IGN1cnI7XG5cbiAgICAvLyB0dXJuIHRoZSBgYXJndW1lbnRzYCBpbnRvIGEgcHJvcGVyIEFycmF5XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVPXG4gICAgICBhcmdzLnVuc2hpZnQoJyVPJyk7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EtekEtWiVdKS9nLCBmdW5jdGlvbihtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAvLyBpZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG4gICAgICBpZiAobWF0Y2ggPT09ICclJScpIHJldHVybiBtYXRjaDtcbiAgICAgIGluZGV4Kys7XG4gICAgICB2YXIgZm9ybWF0dGVyID0gZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcikge1xuICAgICAgICB2YXIgdmFsID0gYXJnc1tpbmRleF07XG4gICAgICAgIG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuICAgICAgICAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG4gICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcblxuICAgIC8vIGFwcGx5IGVudi1zcGVjaWZpYyBmb3JtYXR0aW5nIChjb2xvcnMsIGV0Yy4pXG4gICAgZXhwb3J0cy5mb3JtYXRBcmdzLmNhbGwoc2VsZiwgYXJncyk7XG5cbiAgICB2YXIgbG9nRm4gPSBkZWJ1Zy5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbiAgICBsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuXG4gIGRlYnVnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgZGVidWcuZW5hYmxlZCA9IGV4cG9ydHMuZW5hYmxlZChuYW1lc3BhY2UpO1xuICBkZWJ1Zy51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO1xuICBkZWJ1Zy5jb2xvciA9IHNlbGVjdENvbG9yKG5hbWVzcGFjZSk7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIGV4cG9ydHMubmFtZXMgPSBbXTtcbiAgZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4gIHZhciBzcGxpdCA9ICh0eXBlb2YgbmFtZXNwYWNlcyA9PT0gJ3N0cmluZycgPyBuYW1lc3BhY2VzIDogJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICghc3BsaXRbaV0pIGNvbnRpbnVlOyAvLyBpZ25vcmUgZW1wdHkgc3RyaW5nc1xuICAgIG5hbWVzcGFjZXMgPSBzcGxpdFtpXS5yZXBsYWNlKC9cXCovZywgJy4qPycpO1xuICAgIGlmIChuYW1lc3BhY2VzWzBdID09PSAnLScpIHtcbiAgICAgIGV4cG9ydHMuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gIGV4cG9ydHMuZW5hYmxlKCcnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZWQobmFtZSkge1xuICB2YXIgaSwgbGVuO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuIiwiLyoqXG4gKiBIZWxwZXJzLlxuICovXG5cbnZhciBzID0gMTAwMDtcbnZhciBtID0gcyAqIDYwO1xudmFyIGggPSBtICogNjA7XG52YXIgZCA9IGggKiAyNDtcbnZhciB5ID0gZCAqIDM2NS4yNTtcblxuLyoqXG4gKiBQYXJzZSBvciBmb3JtYXQgdGhlIGdpdmVuIGB2YWxgLlxuICpcbiAqIE9wdGlvbnM6XG4gKlxuICogIC0gYGxvbmdgIHZlcmJvc2UgZm9ybWF0dGluZyBbZmFsc2VdXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSB2YWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiB2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIG51bWJlclxuICogQHJldHVybiB7U3RyaW5nfE51bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbDtcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnICYmIHZhbC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHBhcnNlKHZhbCk7XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5sb25nID8gZm10TG9uZyh2YWwpIDogZm10U2hvcnQodmFsKTtcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ3ZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgdmFsaWQgbnVtYmVyLiB2YWw9JyArXG4gICAgICBKU09OLnN0cmluZ2lmeSh2YWwpXG4gICk7XG59O1xuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgc3RyID0gU3RyaW5nKHN0cik7XG4gIGlmIChzdHIubGVuZ3RoID4gMTAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBtYXRjaCA9IC9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoXG4gICAgc3RyXG4gICk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAneWVhcnMnOlxuICAgIGNhc2UgJ3llYXInOlxuICAgIGNhc2UgJ3lycyc6XG4gICAgY2FzZSAneXInOlxuICAgIGNhc2UgJ3knOlxuICAgICAgcmV0dXJuIG4gKiB5O1xuICAgIGNhc2UgJ2RheXMnOlxuICAgIGNhc2UgJ2RheSc6XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gbiAqIGQ7XG4gICAgY2FzZSAnaG91cnMnOlxuICAgIGNhc2UgJ2hvdXInOlxuICAgIGNhc2UgJ2hycyc6XG4gICAgY2FzZSAnaHInOlxuICAgIGNhc2UgJ2gnOlxuICAgICAgcmV0dXJuIG4gKiBoO1xuICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgY2FzZSAnbWlucyc6XG4gICAgY2FzZSAnbWluJzpcbiAgICBjYXNlICdtJzpcbiAgICAgIHJldHVybiBuICogbTtcbiAgICBjYXNlICdzZWNvbmRzJzpcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ3NlY3MnOlxuICAgIGNhc2UgJ3NlYyc6XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gbiAqIHM7XG4gICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICBjYXNlICdtaWxsaXNlY29uZCc6XG4gICAgY2FzZSAnbXNlY3MnOlxuICAgIGNhc2UgJ21zZWMnOlxuICAgIGNhc2UgJ21zJzpcbiAgICAgIHJldHVybiBuO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgaWYgKG1zID49IGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICB9XG4gIGlmIChtcyA+PSBoKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgfVxuICBpZiAobXMgPj0gbSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7XG4gIH1cbiAgaWYgKG1zID49IHMpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICB9XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gIHJldHVybiBwbHVyYWwobXMsIGQsICdkYXknKSB8fFxuICAgIHBsdXJhbChtcywgaCwgJ2hvdXInKSB8fFxuICAgIHBsdXJhbChtcywgbSwgJ21pbnV0ZScpIHx8XG4gICAgcGx1cmFsKG1zLCBzLCAnc2Vjb25kJykgfHxcbiAgICBtcyArICcgbXMnO1xufVxuXG4vKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovXG5cbmZ1bmN0aW9uIHBsdXJhbChtcywgbiwgbmFtZSkge1xuICBpZiAobXMgPCBuKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChtcyA8IG4gKiAxLjUpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihtcyAvIG4pICsgJyAnICsgbmFtZTtcbiAgfVxuICByZXR1cm4gTWF0aC5jZWlsKG1zIC8gbikgKyAnICcgKyBuYW1lICsgJ3MnO1xufVxuIl19
