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

},{"./audioContext":2,"babel-runtime/core-js/object/get-prototype-of":153,"babel-runtime/helpers/classCallCheck":157,"babel-runtime/helpers/createClass":158,"babel-runtime/helpers/inherits":159,"babel-runtime/helpers/possibleConstructorReturn":160,"waves-masters":262}],2:[function(require,module,exports){
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

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":153,"babel-runtime/helpers/classCallCheck":157,"babel-runtime/helpers/createClass":158,"babel-runtime/helpers/inherits":159,"babel-runtime/helpers/possibleConstructorReturn":160}],4:[function(require,module,exports){
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

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":153,"babel-runtime/helpers/classCallCheck":157,"babel-runtime/helpers/createClass":158,"babel-runtime/helpers/inherits":159,"babel-runtime/helpers/possibleConstructorReturn":160}],5:[function(require,module,exports){
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

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":153,"babel-runtime/helpers/classCallCheck":157,"babel-runtime/helpers/createClass":158,"babel-runtime/helpers/inherits":159,"babel-runtime/helpers/possibleConstructorReturn":160}],6:[function(require,module,exports){
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

},{"../core/AudioTimeEngine":1,"babel-runtime/core-js/object/get-prototype-of":153,"babel-runtime/helpers/classCallCheck":157,"babel-runtime/helpers/createClass":158,"babel-runtime/helpers/inherits":159,"babel-runtime/helpers/possibleConstructorReturn":160}],7:[function(require,module,exports){
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

},{"./core/AudioTimeEngine":1,"./core/audioContext":2,"./engines/GranularEngine":3,"./engines/Metronome":4,"./engines/PlayerEngine":5,"./engines/SegmentEngine":6,"./masters/PlayControl":8,"./masters/Transport":9,"./masters/factories":10}],8:[function(require,module,exports){
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

},{"../core/audioContext":2,"./factories":10,"babel-runtime/core-js/object/get-prototype-of":153,"babel-runtime/helpers/classCallCheck":157,"babel-runtime/helpers/inherits":159,"babel-runtime/helpers/possibleConstructorReturn":160,"waves-masters":262}],9:[function(require,module,exports){
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

},{"../core/audioContext":2,"./factories":10,"babel-runtime/core-js/object/get-prototype-of":153,"babel-runtime/helpers/classCallCheck":157,"babel-runtime/helpers/inherits":159,"babel-runtime/helpers/possibleConstructorReturn":160,"waves-masters":262}],10:[function(require,module,exports){
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

},{"../core/audioContext":2,"babel-runtime/core-js/map":150,"waves-masters":262}],11:[function(require,module,exports){
'use strict';

var _wavesAudio = require('waves-audio');

var audio = _interopRequireWildcard(_wavesAudio);

var _wavesLoaders = require('waves-loaders');

var loaders = _interopRequireWildcard(_wavesLoaders);

var _basicControllers = require('@ircam/basic-controllers');

var controllers = _interopRequireWildcard(_basicControllers);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

controllers.setTheme('dark');
var audioContext = audio.audioContext;
var container = '.controllers';

// get scheduler and create scheduled metronome
var scheduler = audio.getScheduler();
var scheduledMetronome = new audio.Metronome();
scheduledMetronome.period = 60 / 90;
scheduledMetronome.clickFreq = 666;
scheduledMetronome.connect(audioContext.destination);

// create transport with play control and transported metronome
var transportedMetronome = new audio.Metronome();
transportedMetronome.period = 60 / 90;
transportedMetronome.clickFreq = 500;
transportedMetronome.connect(audioContext.destination);
var playControl = new audio.PlayControl(transportedMetronome);

// create GUI elements
new controllers.Title({
  label: 'Metronome in Scheduler',
  container: container
});

new controllers.Toggle({
  label: 'Enable',
  default: false,
  container: container,
  callback: function callback(value) {
    if (value) scheduler.add(scheduledMetronome);else scheduler.remove(scheduledMetronome);
  }
});

new controllers.Slider({
  label: 'Tempo',
  min: 30,
  max: 240,
  step: 1,
  default: 90,
  unit: 'bpm',
  size: 'large',
  container: container,
  callback: function callback(value) {
    scheduledMetronome.period = 60 / value;
  }
});

new controllers.Title({
  label: 'Metronome with Play Control',
  container: container
});

new controllers.Toggle({
  label: 'Play',
  default: false,
  container: container,
  callback: function callback(value) {
    if (value) playControl.start();else playControl.stop();
  }
});

var speedSlider = new controllers.Slider({
  label: 'Speed',
  min: 0,
  max: 2,
  step: 0.01,
  default: 1,
  size: 'large',
  container: container,
  callback: function callback(value) {
    playControl.speed = value;
    speedSlider.value = playControl.speed;
  }
});

new controllers.Slider({
  label: 'Tempo',
  min: 30,
  max: 240,
  step: 1,
  default: 90,
  unit: 'bpm',
  size: 'large',
  container: container,
  callback: function callback(value) {
    transportedMetronome.period = 60 / value;
  }
});

new controllers.Slider({
  label: 'Phase',
  min: 0,
  max: 1,
  step: 0.01,
  default: 0,
  size: 'large',
  container: container,
  callback: function callback(value) {
    transportedMetronome.phase = value;
  }
});

},{"@ircam/basic-controllers":24,"waves-audio":7,"waves-loaders":147}],12:[function(require,module,exports){
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
  "_where": "/Users/matuszewski/dev/js/wavesjs/lib/waves-audio/examples/metronome",
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
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":48}],35:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":49}],36:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":50}],37:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":51}],38:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":52}],39:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":53}],40:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":54}],41:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":55}],42:[function(require,module,exports){
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
},{"../core-js/object/define-property":35}],44:[function(require,module,exports){
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
},{"../core-js/object/get-own-property-descriptor":36,"../core-js/object/get-prototype-of":37}],45:[function(require,module,exports){
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
},{"../core-js/object/create":34,"../core-js/object/set-prototype-of":38,"../helpers/typeof":47}],46:[function(require,module,exports){
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
},{"../helpers/typeof":47}],47:[function(require,module,exports){
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
},{"../core-js/symbol":40,"../core-js/symbol/iterator":41}],48:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
  return $Object.create(P, D);
};

},{"../../modules/_core":63,"../../modules/es6.object.create":131}],49:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
  return $Object.defineProperty(it, key, desc);
};

},{"../../modules/_core":63,"../../modules/es6.object.define-property":132}],50:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key) {
  return $Object.getOwnPropertyDescriptor(it, key);
};

},{"../../modules/_core":63,"../../modules/es6.object.get-own-property-descriptor":133}],51:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;

},{"../../modules/_core":63,"../../modules/es6.object.get-prototype-of":134}],52:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;

},{"../../modules/_core":63,"../../modules/es6.object.set-prototype-of":135}],53:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
require('../modules/es7.promise.finally');
require('../modules/es7.promise.try');
module.exports = require('../modules/_core').Promise;

},{"../modules/_core":63,"../modules/es6.object.to-string":136,"../modules/es6.promise":137,"../modules/es6.string.iterator":138,"../modules/es7.promise.finally":140,"../modules/es7.promise.try":141,"../modules/web.dom.iterable":144}],54:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;

},{"../../modules/_core":63,"../../modules/es6.object.to-string":136,"../../modules/es6.symbol":139,"../../modules/es7.symbol.async-iterator":142,"../../modules/es7.symbol.observable":143}],55:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');

},{"../../modules/_wks-ext":127,"../../modules/es6.string.iterator":138,"../../modules/web.dom.iterable":144}],56:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],57:[function(require,module,exports){
module.exports = function () { /* empty */ };

},{}],58:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],59:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":82}],60:[function(require,module,exports){
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

},{"./_to-absolute-index":118,"./_to-iobject":120,"./_to-length":121}],61:[function(require,module,exports){
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

},{"./_cof":62,"./_wks":128}],62:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],63:[function(require,module,exports){
var core = module.exports = { version: '2.5.7' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],64:[function(require,module,exports){
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

},{"./_a-function":56}],65:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],66:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":71}],67:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":73,"./_is-object":82}],68:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],69:[function(require,module,exports){
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

},{"./_object-gops":99,"./_object-keys":102,"./_object-pie":103}],70:[function(require,module,exports){
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

},{"./_core":63,"./_ctx":64,"./_global":73,"./_has":74,"./_hide":75}],71:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],72:[function(require,module,exports){
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

},{"./_an-object":59,"./_ctx":64,"./_is-array-iter":80,"./_iter-call":83,"./_to-length":121,"./core.get-iterator-method":129}],73:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],74:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],75:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":66,"./_object-dp":94,"./_property-desc":107}],76:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":73}],77:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":66,"./_dom-create":67,"./_fails":71}],78:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],79:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":62}],80:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":88,"./_wks":128}],81:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":62}],82:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],83:[function(require,module,exports){
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

},{"./_an-object":59}],84:[function(require,module,exports){
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

},{"./_hide":75,"./_object-create":93,"./_property-desc":107,"./_set-to-string-tag":112,"./_wks":128}],85:[function(require,module,exports){
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

},{"./_export":70,"./_hide":75,"./_iter-create":84,"./_iterators":88,"./_library":89,"./_object-gpo":100,"./_redefine":109,"./_set-to-string-tag":112,"./_wks":128}],86:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":128}],87:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],88:[function(require,module,exports){
module.exports = {};

},{}],89:[function(require,module,exports){
module.exports = true;

},{}],90:[function(require,module,exports){
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

},{"./_fails":71,"./_has":74,"./_is-object":82,"./_object-dp":94,"./_uid":124}],91:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":62,"./_global":73,"./_task":117}],92:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":56}],93:[function(require,module,exports){
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

},{"./_an-object":59,"./_dom-create":67,"./_enum-bug-keys":68,"./_html":76,"./_object-dps":95,"./_shared-key":113}],94:[function(require,module,exports){
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

},{"./_an-object":59,"./_descriptors":66,"./_ie8-dom-define":77,"./_to-primitive":123}],95:[function(require,module,exports){
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

},{"./_an-object":59,"./_descriptors":66,"./_object-dp":94,"./_object-keys":102}],96:[function(require,module,exports){
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

},{"./_descriptors":66,"./_has":74,"./_ie8-dom-define":77,"./_object-pie":103,"./_property-desc":107,"./_to-iobject":120,"./_to-primitive":123}],97:[function(require,module,exports){
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

},{"./_object-gopn":98,"./_to-iobject":120}],98:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":68,"./_object-keys-internal":101}],99:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],100:[function(require,module,exports){
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

},{"./_has":74,"./_shared-key":113,"./_to-object":122}],101:[function(require,module,exports){
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

},{"./_array-includes":60,"./_has":74,"./_shared-key":113,"./_to-iobject":120}],102:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":68,"./_object-keys-internal":101}],103:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],104:[function(require,module,exports){
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

},{"./_core":63,"./_export":70,"./_fails":71}],105:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],106:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":59,"./_is-object":82,"./_new-promise-capability":92}],107:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],108:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
  for (var key in src) {
    if (safe && target[key]) target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};

},{"./_hide":75}],109:[function(require,module,exports){
module.exports = require('./_hide');

},{"./_hide":75}],110:[function(require,module,exports){
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

},{"./_an-object":59,"./_ctx":64,"./_is-object":82,"./_object-gopd":96}],111:[function(require,module,exports){
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

},{"./_core":63,"./_descriptors":66,"./_global":73,"./_object-dp":94,"./_wks":128}],112:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":74,"./_object-dp":94,"./_wks":128}],113:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":114,"./_uid":124}],114:[function(require,module,exports){
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

},{"./_core":63,"./_global":73,"./_library":89}],115:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":56,"./_an-object":59,"./_wks":128}],116:[function(require,module,exports){
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

},{"./_defined":65,"./_to-integer":119}],117:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":62,"./_ctx":64,"./_dom-create":67,"./_global":73,"./_html":76,"./_invoke":78}],118:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":119}],119:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],120:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":65,"./_iobject":79}],121:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":119}],122:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":65}],123:[function(require,module,exports){
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

},{"./_is-object":82}],124:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],125:[function(require,module,exports){
var global = require('./_global');
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';

},{"./_global":73}],126:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":63,"./_global":73,"./_library":89,"./_object-dp":94,"./_wks-ext":127}],127:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":128}],128:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":73,"./_shared":114,"./_uid":124}],129:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":61,"./_core":63,"./_iterators":88,"./_wks":128}],130:[function(require,module,exports){
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

},{"./_add-to-unscopables":57,"./_iter-define":85,"./_iter-step":87,"./_iterators":88,"./_to-iobject":120}],131:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', { create: require('./_object-create') });

},{"./_export":70,"./_object-create":93}],132:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });

},{"./_descriptors":66,"./_export":70,"./_object-dp":94}],133:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":96,"./_object-sap":104,"./_to-iobject":120}],134:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":100,"./_object-sap":104,"./_to-object":122}],135:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":70,"./_set-proto":110}],136:[function(require,module,exports){

},{}],137:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var userAgent = require('./_user-agent');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":56,"./_an-instance":58,"./_classof":61,"./_core":63,"./_ctx":64,"./_export":70,"./_for-of":72,"./_global":73,"./_is-object":82,"./_iter-detect":86,"./_library":89,"./_microtask":91,"./_new-promise-capability":92,"./_perform":105,"./_promise-resolve":106,"./_redefine-all":108,"./_set-species":111,"./_set-to-string-tag":112,"./_species-constructor":115,"./_task":117,"./_user-agent":125,"./_wks":128}],138:[function(require,module,exports){
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

},{"./_iter-define":85,"./_string-at":116}],139:[function(require,module,exports){
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

},{"./_an-object":59,"./_descriptors":66,"./_enum-keys":69,"./_export":70,"./_fails":71,"./_global":73,"./_has":74,"./_hide":75,"./_is-array":81,"./_is-object":82,"./_library":89,"./_meta":90,"./_object-create":93,"./_object-dp":94,"./_object-gopd":96,"./_object-gopn":98,"./_object-gopn-ext":97,"./_object-gops":99,"./_object-keys":102,"./_object-pie":103,"./_property-desc":107,"./_redefine":109,"./_set-to-string-tag":112,"./_shared":114,"./_to-iobject":120,"./_to-primitive":123,"./_uid":124,"./_wks":128,"./_wks-define":126,"./_wks-ext":127}],140:[function(require,module,exports){
// https://github.com/tc39/proposal-promise-finally
'use strict';
var $export = require('./_export');
var core = require('./_core');
var global = require('./_global');
var speciesConstructor = require('./_species-constructor');
var promiseResolve = require('./_promise-resolve');

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });

},{"./_core":63,"./_export":70,"./_global":73,"./_promise-resolve":106,"./_species-constructor":115}],141:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-promise-try
var $export = require('./_export');
var newPromiseCapability = require('./_new-promise-capability');
var perform = require('./_perform');

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });

},{"./_export":70,"./_new-promise-capability":92,"./_perform":105}],142:[function(require,module,exports){
require('./_wks-define')('asyncIterator');

},{"./_wks-define":126}],143:[function(require,module,exports){
require('./_wks-define')('observable');

},{"./_wks-define":126}],144:[function(require,module,exports){
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

},{"./_global":73,"./_hide":75,"./_iterators":88,"./_wks":128,"./es6.array.iterator":130}],145:[function(require,module,exports){
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

},{}],146:[function(require,module,exports){
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

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _promise2 = require('babel-runtime/core-js/promise');

var _promise3 = _interopRequireDefault(_promise2);

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AudioContext = window.AudioContext || window.webkitAudioContext;

if (!AudioContext) throw new Error('WebAudio API not supported');

var audioContext = new AudioContext();

var silentBuffer = new Uint32Array([0x46464952, 0x00000038, 0x45564157, 0x20746d66, 0x00000010, 0x00010001, 0x0000ac44, 0x00015888, 0x00100002, 0x61746164, 0x00000014, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000]).buffer;

var noop = function noop() {};

// @todo - review to allow to use external audioContext
var _decodeAudioData = audioContext.decodeAudioData;
var promise = audioContext.decodeAudioData(silentBuffer, noop, noop);
// implement non promised base decode audio data
if (!promise) {
  _decodeAudioData = function decodeAudioData(arraybuffer) {
    return new _promise3.default(function (resolve, reject) {
      audioContext.decodeAudioData(arraybuffer, function (buffer) {
        resolve(buffer);
      }, function (err) {
        reject(new Error('Unable to decode audio data'));
      });
    });
  };
}

/**
 * AudioBufferLoader
 * Promise based implementation of XMLHttpRequest Level 2 for GET method and
 * decode audio data for arraybuffer.
 */

var AudioBufferLoader = function (_Loader) {
  (0, _inherits3.default)(AudioBufferLoader, _Loader);

  /**
   * Set the responseType to 'arraybuffer' and initialize options.
   * @param {string} [responseType="arraybuffer"]
   */
  function AudioBufferLoader() {
    var responseType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'arraybuffer';
    (0, _classCallCheck3.default)(this, AudioBufferLoader);

    var _this = (0, _possibleConstructorReturn3.default)(this, (AudioBufferLoader.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferLoader)).call(this, responseType));

    _this.options = { wrapAroundExtension: 0 };
    _this.responseType = responseType;
    _this.audioContext = audioContext;

    _this.decodeAudioData = _this.decodeAudioData.bind(_this);
    return _this;
  }

  /**
   * Allow to set the audio context that should be used in order to decode
   * the file and create the AudioBuffer.
   * @param {AudioContext} audioContext
   */


  (0, _createClass3.default)(AudioBufferLoader, [{
    key: 'setAudioContext',
    value: function setAudioContext(audioContext) {
      this.audioContext = audioContext;
    }

    /**
     * Method for promise audio file loading and decoding.
     * @param {(string|string[])} fileURLs - The URL(s) of the audio files to load.
     *  Accepts a URL pointing to the file location or an array of URLs.
     * @param {{wrapAroundExtension: number}} [options] - Object with a
     *  wrapAroundExtension key which set the length, in seconds to be copied from
     *  the begining at the end of the returned AudioBuffer
     * @returns {Promise}
     */

  }, {
    key: 'load',
    value: function load(fileURLs) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      this.options = options;
      this.options.wrapAroundExtension = this.options.wrapAroundExtension || 0;

      return (0, _get3.default)(AudioBufferLoader.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferLoader.prototype), 'load', this).call(this, fileURLs);
    }

    /**
     * Load a single audio file, decode it in an AudioBuffer, return a Promise
     * @private
     * @param {string} fileURL - The URL of the audio file location to load.
     * @returns {Promise}
     */

  }, {
    key: 'loadOne',
    value: function loadOne(fileURL) {
      return (0, _get3.default)(AudioBufferLoader.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferLoader.prototype), 'loadOne', this).call(this, fileURL).then(this.decodeAudioData).catch(function (err) {
        throw err;
      });
    }

    /**
     * Load all audio files at once in a single array, decode them in an array of
     * AudioBuffers, and return a Promise.
     * @private
     * @param {string[]} fileURLs - The URLs array of the audio files to load.
     * @returns {Promise}
     */

  }, {
    key: 'loadAll',
    value: function loadAll(fileURLs) {
      var _this2 = this;

      return (0, _get3.default)(AudioBufferLoader.prototype.__proto__ || (0, _getPrototypeOf2.default)(AudioBufferLoader.prototype), 'loadAll', this).call(this, fileURLs).then(function (arraybuffers) {
        var promises = arraybuffers.map(function (arraybuffer) {
          return _this2.decodeAudioData(arraybuffer);
        });

        return _promise3.default.all(promises);
      }).catch(function (err) {
        throw err;
      });
    }

    /**
     * Decode Audio Data, return a Promise
     * @private
     * @param {arraybuffer} - The arraybuffer of the loaded audio file to be decoded.
     * @returns {Promise}
     */

  }, {
    key: 'decodeAudioData',
    value: function decodeAudioData(arraybuffer) {
      var _this3 = this;

      if (arraybuffer instanceof ArrayBuffer) {
        var _promise = _decodeAudioData.call(audioContext, arraybuffer);

        _promise.then(function (buffer) {
          if (_this3.options.wrapAroundExtension !== 0) buffer = _this3.__wrapAround(buffer);

          return _promise3.default.resolve(buffer);
        }).catch(function (err) {
          throw new Error('Unable to decode audio data');
        });

        return _promise;
      } else {
        return _promise3.default.resolve(arraybuffer);
      }
    }

    /**
     * WrapAround, copy the begining input buffer to the end of an output buffer
     * @private
     * @param {arraybuffer} inBuffer {arraybuffer} - The input buffer
     * @returns {arraybuffer} - The processed buffer (with frame copied from the begining to the end)
     */

  }, {
    key: '__wrapAround',
    value: function __wrapAround(inBuffer) {
      var numberOfChannels = inBuffer.numberOfChannels,
          sampleRate = inBuffer.sampleRate,
          length = inBuffer.length;

      var outLength = length + this.options.wrapAroundExtension * sampleRate;
      var outBuffer = this.audioContext.createBuffer(numberOfChannels, outLength, sampleRate);

      for (var channel = 0; channel < numberOfChannels; channel++) {
        var channelData = inBuffer.getChannelData(channel);
        var outData = outBuffer.getChannelData(channel);
        var inLength = inBuffer.length;

        for (var i = 0; i < outLength; i++) {
          if (i < inLength) outData[i] = channelData[i];else outData[i] = channelData[i - inLength];
        }
      }

      return outBuffer;
    }
  }]);
  return AudioBufferLoader;
}(_loader2.default);

exports.default = AudioBufferLoader;

},{"./loader":148,"babel-runtime/core-js/object/get-prototype-of":37,"babel-runtime/core-js/promise":39,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/createClass":43,"babel-runtime/helpers/get":44,"babel-runtime/helpers/inherits":45,"babel-runtime/helpers/possibleConstructorReturn":46}],147:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _loader = require('./loader');

Object.defineProperty(exports, 'Loader', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_loader).default;
  }
});

var _audioBufferLoader = require('./audio-buffer-loader');

Object.defineProperty(exports, 'AudioBufferLoader', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_audioBufferLoader).default;
  }
});

var _superLoader = require('./super-loader');

Object.defineProperty(exports, 'SuperLoader', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_superLoader).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./audio-buffer-loader":146,"./loader":148,"./super-loader":149}],148:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Promise based implementation of XMLHttpRequest Level 2 for GET method.
 */
var Loader = function () {
  /**
   * @constructs
   * @param {string} [responseType=""] - responseType's value, "text" (equal to ""), "arraybuffer", "blob", "document" or "json"
   */
  function Loader() {
    var responseType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
    (0, _classCallCheck3.default)(this, Loader);

    /**
     * @type {string}
     * @private
     */
    this.responseType = responseType;

    /**
     * @type {function}
     * @private
     */
    this.progressCb = undefined;
  }

  /**
   * Method for a promise based file loading.
   * Internally switch between loadOne and loadAll.
   * @public
   * @param {(string|string[])} fileURLs - The URL(s) of the files to load. Accepts a URL pointing to the file location or an array of URLs.
   * @returns {Promise}
   */


  (0, _createClass3.default)(Loader, [{
    key: 'load',
    value: function load(fileURLs) {
      if (fileURLs === undefined) throw new Error('Invalid fileURLs parameter: load method needs at least a url to load');

      if (Array.isArray(fileURLs)) return this.loadAll(fileURLs);else return this.loadOne(fileURLs);
    }

    /**
     * Load a single file
     * @private
     * @param {string} fileURL - The URL of the file to load.
     * @returns {Promise}
     */

  }, {
    key: 'loadOne',
    value: function loadOne(fileURL) {
      return this.fileLoadingRequest(fileURL);
    }

    /**
     * Load all files at once in a single array and return a Promise
     * @private
     * @param {string[]} fileURLs - The URLs array of the files to load.
     * @returns {Promise}
     */

  }, {
    key: 'loadAll',
    value: function loadAll(fileURLs) {
      var _this = this;

      var promises = fileURLs.map(function (fileURL, index) {
        return _this.fileLoadingRequest(fileURL, index);
      });

      return _promise2.default.all(promises);
    }

    /**
     * Load a file asynchronously, return a Promise.
     * @private
     * @param {string} url - The URL of the file to load
     * @param {string} [index] - The index of the file in the array of files to load
     * @returns {Promise}
     */

  }, {
    key: 'fileLoadingRequest',
    value: function fileLoadingRequest(url, index) {
      var _this2 = this;

      var promise = new _promise2.default(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.index = index;

        if (_this2.responseType) {
          request.responseType = _this2.responseType;
        } else {
          var suffix = '.json';
          if (url.indexOf(suffix, _this2.length - suffix.length) !== -1) {
            request.responseType = 'json';
          } else {
            request.responseType = 'arraybuffer';
          }
        }

        request.addEventListener('load', function () {
          // Test request.status value, as 404 will also get there
          // Test request.status === 0 for cordova internal ajax calls
          if (request.status === 200 || request.status === 304 || request.status === 0) {
            // Hack for iOS 7, to remove as soon as possible
            if (this.responseType === 'json' && typeof request.response === 'string') request.response = JSON.parse(request.response);

            resolve(request.response);
          } else {
            reject(new Error(request.statusText));
          }
        });

        request.addEventListener('progress', function (evt) {
          if (_this2.progressCallback) {
            var event = {
              value: evt.loaded / evt.total,
              loaded: evt.loaded,
              total: evt.total
            };

            if (index !== undefined) event.index = index;

            _this2.progressCallback(event);
          }
        });
        // Manage network errors
        request.addEventListener('error', function () {
          reject(new Error('Network Error'));
        });

        request.send();
      });

      return promise;
    }

    /**
     * Alternative API to set the progress callback.
     * @type {function} callback - The callback that handles the response.
     */

  }, {
    key: 'onProgress',
    value: function onProgress(callback) {
      this.progressCb = callback;
    }

    /**
     * Get the callback function to get the progress of file loading process.
     * This is only for the file loading progress as decodeAudioData doesn't
     * expose a decode progress value.
     * @type {function}
     */

  }, {
    key: 'progressCallback',
    get: function get() {
      return this.progressCb;
    }

    /**
     * Set the callback function to get the progress of file loading process.
     * This is only for the file loading progress as decodeAudioData doesn't
     * expose a decode progress value.
     * @type {function} callback - The callback that handles the response.
     */
    ,
    set: function set(callback) {
      this.progressCb = callback;
    }
  }]);
  return Loader;
}();

exports.default = Loader;

},{"babel-runtime/core-js/promise":39,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/createClass":43}],149:[function(require,module,exports){
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

var _audioBufferLoader = require('./audio-buffer-loader');

var _audioBufferLoader2 = _interopRequireDefault(_audioBufferLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * SuperLoader
 * Helper to load multiple type of files, and get them in their useful type, json for json files, AudioBuffer for audio files.
 */
var SuperLoader = function (_AudioBufferLoader) {
  (0, _inherits3.default)(SuperLoader, _AudioBufferLoader);

  /**
   * Use composition to setup appropriate file loaders
   */
  function SuperLoader() {
    (0, _classCallCheck3.default)(this, SuperLoader);
    return (0, _possibleConstructorReturn3.default)(this, (SuperLoader.__proto__ || (0, _getPrototypeOf2.default)(SuperLoader)).call(this, null));
    // bypass AudioBufferLoader constructor. This is bad but it works.
  }

  return SuperLoader;
}(_audioBufferLoader2.default);

exports.default = SuperLoader;

},{"./audio-buffer-loader":146,"babel-runtime/core-js/object/get-prototype-of":37,"babel-runtime/helpers/classCallCheck":42,"babel-runtime/helpers/inherits":45,"babel-runtime/helpers/possibleConstructorReturn":46}],150:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":162}],151:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"core-js/library/fn/object/create":163,"dup":34}],152:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"core-js/library/fn/object/define-property":164,"dup":35}],153:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"core-js/library/fn/object/get-prototype-of":165,"dup":37}],154:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"core-js/library/fn/object/set-prototype-of":166,"dup":38}],155:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"core-js/library/fn/symbol":167,"dup":40}],156:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"core-js/library/fn/symbol/iterator":168,"dup":41}],157:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],158:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"../core-js/object/define-property":152,"dup":43}],159:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"../core-js/object/create":151,"../core-js/object/set-prototype-of":154,"../helpers/typeof":161,"dup":45}],160:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"../helpers/typeof":161,"dup":46}],161:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"../core-js/symbol":155,"../core-js/symbol/iterator":156,"dup":47}],162:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
require('../modules/es7.map.of');
require('../modules/es7.map.from');
module.exports = require('../modules/_core').Map;

},{"../modules/_core":183,"../modules/es6.map":245,"../modules/es6.object.to-string":250,"../modules/es6.string.iterator":251,"../modules/es7.map.from":253,"../modules/es7.map.of":254,"../modules/es7.map.to-json":255,"../modules/web.dom.iterable":258}],163:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"../../modules/_core":183,"../../modules/es6.object.create":246,"dup":48}],164:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../../modules/_core":183,"../../modules/es6.object.define-property":247,"dup":49}],165:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"../../modules/_core":183,"../../modules/es6.object.get-prototype-of":248,"dup":51}],166:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"../../modules/_core":183,"../../modules/es6.object.set-prototype-of":249,"dup":52}],167:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"../../modules/_core":183,"../../modules/es6.object.to-string":250,"../../modules/es6.symbol":252,"../../modules/es7.symbol.async-iterator":256,"../../modules/es7.symbol.observable":257,"dup":54}],168:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"../../modules/_wks-ext":241,"../../modules/es6.string.iterator":251,"../../modules/web.dom.iterable":258,"dup":55}],169:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"dup":56}],170:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"dup":57}],171:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"dup":58}],172:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"./_is-object":201,"dup":59}],173:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function (iter, ITERATOR) {
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":192}],174:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"./_to-absolute-index":232,"./_to-iobject":234,"./_to-length":235,"dup":60}],175:[function(require,module,exports){
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

},{"./_array-species-create":177,"./_ctx":184,"./_iobject":198,"./_to-length":235,"./_to-object":236}],176:[function(require,module,exports){
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

},{"./_is-array":200,"./_is-object":201,"./_wks":242}],177:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":176}],178:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"./_cof":179,"./_wks":242,"dup":61}],179:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"dup":62}],180:[function(require,module,exports){
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

},{"./_an-instance":171,"./_ctx":184,"./_descriptors":186,"./_for-of":192,"./_iter-define":204,"./_iter-step":205,"./_meta":208,"./_object-create":209,"./_object-dp":210,"./_redefine-all":222,"./_set-species":227,"./_validate-collection":239}],181:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof');
var from = require('./_array-from-iterable');
module.exports = function (NAME) {
  return function toJSON() {
    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};

},{"./_array-from-iterable":173,"./_classof":178}],182:[function(require,module,exports){
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

},{"./_an-instance":171,"./_array-methods":175,"./_descriptors":186,"./_export":190,"./_fails":191,"./_for-of":192,"./_global":193,"./_hide":195,"./_is-object":201,"./_meta":208,"./_object-dp":210,"./_redefine-all":222,"./_set-to-string-tag":228}],183:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"dup":63}],184:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"./_a-function":169,"dup":64}],185:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"dup":65}],186:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"./_fails":191,"dup":66}],187:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"./_global":193,"./_is-object":201,"dup":67}],188:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"dup":68}],189:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"./_object-gops":215,"./_object-keys":218,"./_object-pie":219,"dup":69}],190:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"./_core":183,"./_ctx":184,"./_global":193,"./_has":194,"./_hide":195,"dup":70}],191:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"dup":71}],192:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"./_an-object":172,"./_ctx":184,"./_is-array-iter":199,"./_iter-call":202,"./_to-length":235,"./core.get-iterator-method":243,"dup":72}],193:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"dup":73}],194:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"dup":74}],195:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"./_descriptors":186,"./_object-dp":210,"./_property-desc":221,"dup":75}],196:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"./_global":193,"dup":76}],197:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"./_descriptors":186,"./_dom-create":187,"./_fails":191,"dup":77}],198:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"./_cof":179,"dup":79}],199:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"./_iterators":206,"./_wks":242,"dup":80}],200:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"./_cof":179,"dup":81}],201:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"dup":82}],202:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"./_an-object":172,"dup":83}],203:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"./_hide":195,"./_object-create":209,"./_property-desc":221,"./_set-to-string-tag":228,"./_wks":242,"dup":84}],204:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"./_export":190,"./_hide":195,"./_iter-create":203,"./_iterators":206,"./_library":207,"./_object-gpo":216,"./_redefine":223,"./_set-to-string-tag":228,"./_wks":242,"dup":85}],205:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"dup":87}],206:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"dup":88}],207:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"dup":89}],208:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"./_fails":191,"./_has":194,"./_is-object":201,"./_object-dp":210,"./_uid":238,"dup":90}],209:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./_an-object":172,"./_dom-create":187,"./_enum-bug-keys":188,"./_html":196,"./_object-dps":211,"./_shared-key":229,"dup":93}],210:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"./_an-object":172,"./_descriptors":186,"./_ie8-dom-define":197,"./_to-primitive":237,"dup":94}],211:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"./_an-object":172,"./_descriptors":186,"./_object-dp":210,"./_object-keys":218,"dup":95}],212:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"./_descriptors":186,"./_has":194,"./_ie8-dom-define":197,"./_object-pie":219,"./_property-desc":221,"./_to-iobject":234,"./_to-primitive":237,"dup":96}],213:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"./_object-gopn":214,"./_to-iobject":234,"dup":97}],214:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"./_enum-bug-keys":188,"./_object-keys-internal":217,"dup":98}],215:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99}],216:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"./_has":194,"./_shared-key":229,"./_to-object":236,"dup":100}],217:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"./_array-includes":174,"./_has":194,"./_shared-key":229,"./_to-iobject":234,"dup":101}],218:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"./_enum-bug-keys":188,"./_object-keys-internal":217,"dup":102}],219:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"dup":103}],220:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"./_core":183,"./_export":190,"./_fails":191,"dup":104}],221:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"dup":107}],222:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"./_hide":195,"dup":108}],223:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"./_hide":195,"dup":109}],224:[function(require,module,exports){
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

},{"./_a-function":169,"./_ctx":184,"./_export":190,"./_for-of":192}],225:[function(require,module,exports){
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

},{"./_export":190}],226:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"./_an-object":172,"./_ctx":184,"./_is-object":201,"./_object-gopd":212,"dup":110}],227:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"./_core":183,"./_descriptors":186,"./_global":193,"./_object-dp":210,"./_wks":242,"dup":111}],228:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"./_has":194,"./_object-dp":210,"./_wks":242,"dup":112}],229:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"./_shared":230,"./_uid":238,"dup":113}],230:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"./_core":183,"./_global":193,"./_library":207,"dup":114}],231:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"./_defined":185,"./_to-integer":233,"dup":116}],232:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"./_to-integer":233,"dup":118}],233:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"dup":119}],234:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"./_defined":185,"./_iobject":198,"dup":120}],235:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"./_to-integer":233,"dup":121}],236:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"./_defined":185,"dup":122}],237:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"./_is-object":201,"dup":123}],238:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"dup":124}],239:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":201}],240:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"./_core":183,"./_global":193,"./_library":207,"./_object-dp":210,"./_wks-ext":241,"dup":126}],241:[function(require,module,exports){
arguments[4][127][0].apply(exports,arguments)
},{"./_wks":242,"dup":127}],242:[function(require,module,exports){
arguments[4][128][0].apply(exports,arguments)
},{"./_global":193,"./_shared":230,"./_uid":238,"dup":128}],243:[function(require,module,exports){
arguments[4][129][0].apply(exports,arguments)
},{"./_classof":178,"./_core":183,"./_iterators":206,"./_wks":242,"dup":129}],244:[function(require,module,exports){
arguments[4][130][0].apply(exports,arguments)
},{"./_add-to-unscopables":170,"./_iter-define":204,"./_iter-step":205,"./_iterators":206,"./_to-iobject":234,"dup":130}],245:[function(require,module,exports){
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

},{"./_collection":182,"./_collection-strong":180,"./_validate-collection":239}],246:[function(require,module,exports){
arguments[4][131][0].apply(exports,arguments)
},{"./_export":190,"./_object-create":209,"dup":131}],247:[function(require,module,exports){
arguments[4][132][0].apply(exports,arguments)
},{"./_descriptors":186,"./_export":190,"./_object-dp":210,"dup":132}],248:[function(require,module,exports){
arguments[4][134][0].apply(exports,arguments)
},{"./_object-gpo":216,"./_object-sap":220,"./_to-object":236,"dup":134}],249:[function(require,module,exports){
arguments[4][135][0].apply(exports,arguments)
},{"./_export":190,"./_set-proto":226,"dup":135}],250:[function(require,module,exports){
arguments[4][136][0].apply(exports,arguments)
},{"dup":136}],251:[function(require,module,exports){
arguments[4][138][0].apply(exports,arguments)
},{"./_iter-define":204,"./_string-at":231,"dup":138}],252:[function(require,module,exports){
arguments[4][139][0].apply(exports,arguments)
},{"./_an-object":172,"./_descriptors":186,"./_enum-keys":189,"./_export":190,"./_fails":191,"./_global":193,"./_has":194,"./_hide":195,"./_is-array":200,"./_is-object":201,"./_library":207,"./_meta":208,"./_object-create":209,"./_object-dp":210,"./_object-gopd":212,"./_object-gopn":214,"./_object-gopn-ext":213,"./_object-gops":215,"./_object-keys":218,"./_object-pie":219,"./_property-desc":221,"./_redefine":223,"./_set-to-string-tag":228,"./_shared":230,"./_to-iobject":234,"./_to-primitive":237,"./_uid":238,"./_wks":242,"./_wks-define":240,"./_wks-ext":241,"dup":139}],253:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
require('./_set-collection-from')('Map');

},{"./_set-collection-from":224}],254:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
require('./_set-collection-of')('Map');

},{"./_set-collection-of":225}],255:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });

},{"./_collection-to-json":181,"./_export":190}],256:[function(require,module,exports){
arguments[4][142][0].apply(exports,arguments)
},{"./_wks-define":240,"dup":142}],257:[function(require,module,exports){
arguments[4][143][0].apply(exports,arguments)
},{"./_wks-define":240,"dup":143}],258:[function(require,module,exports){
arguments[4][144][0].apply(exports,arguments)
},{"./_global":193,"./_hide":195,"./_iterators":206,"./_wks":242,"./es6.array.iterator":244,"dup":144}],259:[function(require,module,exports){
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

},{"babel-runtime/helpers/classCallCheck":276,"babel-runtime/helpers/createClass":277}],260:[function(require,module,exports){
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

},{"./PriorityQueue":259,"./TimeEngine":261,"babel-runtime/core-js/get-iterator":267,"babel-runtime/core-js/object/get-prototype-of":271,"babel-runtime/core-js/set":273,"babel-runtime/helpers/classCallCheck":276,"babel-runtime/helpers/createClass":277,"babel-runtime/helpers/inherits":279,"babel-runtime/helpers/possibleConstructorReturn":280}],261:[function(require,module,exports){
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

},{"babel-runtime/helpers/classCallCheck":276,"babel-runtime/helpers/createClass":277}],262:[function(require,module,exports){
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

},{"./core/PriorityQueue":259,"./core/SchedulingQueue":260,"./core/TimeEngine":261,"./masters/PlayControl":263,"./masters/Scheduler":264,"./masters/SimpleScheduler":265,"./masters/Transport":266}],263:[function(require,module,exports){
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

},{"../core/SchedulingQueue":260,"../core/TimeEngine":261,"babel-runtime/core-js/object/get-prototype-of":271,"babel-runtime/helpers/classCallCheck":276,"babel-runtime/helpers/createClass":277,"babel-runtime/helpers/get":278,"babel-runtime/helpers/inherits":279,"babel-runtime/helpers/possibleConstructorReturn":280}],264:[function(require,module,exports){
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

},{"../core/SchedulingQueue":260,"babel-runtime/core-js/object/get-prototype-of":271,"babel-runtime/helpers/classCallCheck":276,"babel-runtime/helpers/createClass":277,"babel-runtime/helpers/inherits":279,"babel-runtime/helpers/possibleConstructorReturn":280,"debug":383}],265:[function(require,module,exports){
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

},{"../core/TimeEngine":261,"babel-runtime/core-js/set":273,"babel-runtime/helpers/classCallCheck":276,"babel-runtime/helpers/createClass":277,"debug":383}],266:[function(require,module,exports){
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

},{"../core/PriorityQueue":259,"../core/SchedulingQueue":260,"../core/TimeEngine":261,"babel-runtime/core-js/get-iterator":267,"babel-runtime/core-js/object/get-prototype-of":271,"babel-runtime/helpers/classCallCheck":276,"babel-runtime/helpers/createClass":277,"babel-runtime/helpers/get":278,"babel-runtime/helpers/inherits":279,"babel-runtime/helpers/possibleConstructorReturn":280}],267:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":282}],268:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"core-js/library/fn/object/create":283,"dup":34}],269:[function(require,module,exports){
arguments[4][35][0].apply(exports,arguments)
},{"core-js/library/fn/object/define-property":284,"dup":35}],270:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"core-js/library/fn/object/get-own-property-descriptor":285,"dup":36}],271:[function(require,module,exports){
arguments[4][37][0].apply(exports,arguments)
},{"core-js/library/fn/object/get-prototype-of":286,"dup":37}],272:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"core-js/library/fn/object/set-prototype-of":287,"dup":38}],273:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":288}],274:[function(require,module,exports){
arguments[4][40][0].apply(exports,arguments)
},{"core-js/library/fn/symbol":289,"dup":40}],275:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"core-js/library/fn/symbol/iterator":290,"dup":41}],276:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],277:[function(require,module,exports){
arguments[4][43][0].apply(exports,arguments)
},{"../core-js/object/define-property":269,"dup":43}],278:[function(require,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"../core-js/object/get-own-property-descriptor":270,"../core-js/object/get-prototype-of":271,"dup":44}],279:[function(require,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"../core-js/object/create":268,"../core-js/object/set-prototype-of":272,"../helpers/typeof":281,"dup":45}],280:[function(require,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"../helpers/typeof":281,"dup":46}],281:[function(require,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"../core-js/symbol":274,"../core-js/symbol/iterator":275,"dup":47}],282:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');

},{"../modules/core.get-iterator":366,"../modules/es6.string.iterator":375,"../modules/web.dom.iterable":382}],283:[function(require,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"../../modules/_core":305,"../../modules/es6.object.create":368,"dup":48}],284:[function(require,module,exports){
arguments[4][49][0].apply(exports,arguments)
},{"../../modules/_core":305,"../../modules/es6.object.define-property":369,"dup":49}],285:[function(require,module,exports){
arguments[4][50][0].apply(exports,arguments)
},{"../../modules/_core":305,"../../modules/es6.object.get-own-property-descriptor":370,"dup":50}],286:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"../../modules/_core":305,"../../modules/es6.object.get-prototype-of":371,"dup":51}],287:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"../../modules/_core":305,"../../modules/es6.object.set-prototype-of":372,"dup":52}],288:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
require('../modules/es7.set.of');
require('../modules/es7.set.from');
module.exports = require('../modules/_core').Set;

},{"../modules/_core":305,"../modules/es6.object.to-string":373,"../modules/es6.set":374,"../modules/es6.string.iterator":375,"../modules/es7.set.from":377,"../modules/es7.set.of":378,"../modules/es7.set.to-json":379,"../modules/web.dom.iterable":382}],289:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"../../modules/_core":305,"../../modules/es6.object.to-string":373,"../../modules/es6.symbol":376,"../../modules/es7.symbol.async-iterator":380,"../../modules/es7.symbol.observable":381,"dup":54}],290:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"../../modules/_wks-ext":363,"../../modules/es6.string.iterator":375,"../../modules/web.dom.iterable":382,"dup":55}],291:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"dup":56}],292:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"dup":57}],293:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"dup":58}],294:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"./_is-object":323,"dup":59}],295:[function(require,module,exports){
arguments[4][173][0].apply(exports,arguments)
},{"./_for-of":314,"dup":173}],296:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"./_to-absolute-index":354,"./_to-iobject":356,"./_to-length":357,"dup":60}],297:[function(require,module,exports){
arguments[4][175][0].apply(exports,arguments)
},{"./_array-species-create":299,"./_ctx":306,"./_iobject":320,"./_to-length":357,"./_to-object":358,"dup":175}],298:[function(require,module,exports){
arguments[4][176][0].apply(exports,arguments)
},{"./_is-array":322,"./_is-object":323,"./_wks":364,"dup":176}],299:[function(require,module,exports){
arguments[4][177][0].apply(exports,arguments)
},{"./_array-species-constructor":298,"dup":177}],300:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"./_cof":301,"./_wks":364,"dup":61}],301:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"dup":62}],302:[function(require,module,exports){
arguments[4][180][0].apply(exports,arguments)
},{"./_an-instance":293,"./_ctx":306,"./_descriptors":308,"./_for-of":314,"./_iter-define":326,"./_iter-step":327,"./_meta":330,"./_object-create":331,"./_object-dp":332,"./_redefine-all":344,"./_set-species":349,"./_validate-collection":361,"dup":180}],303:[function(require,module,exports){
arguments[4][181][0].apply(exports,arguments)
},{"./_array-from-iterable":295,"./_classof":300,"dup":181}],304:[function(require,module,exports){
arguments[4][182][0].apply(exports,arguments)
},{"./_an-instance":293,"./_array-methods":297,"./_descriptors":308,"./_export":312,"./_fails":313,"./_for-of":314,"./_global":315,"./_hide":317,"./_is-object":323,"./_meta":330,"./_object-dp":332,"./_redefine-all":344,"./_set-to-string-tag":350,"dup":182}],305:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"dup":63}],306:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"./_a-function":291,"dup":64}],307:[function(require,module,exports){
arguments[4][65][0].apply(exports,arguments)
},{"dup":65}],308:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"./_fails":313,"dup":66}],309:[function(require,module,exports){
arguments[4][67][0].apply(exports,arguments)
},{"./_global":315,"./_is-object":323,"dup":67}],310:[function(require,module,exports){
arguments[4][68][0].apply(exports,arguments)
},{"dup":68}],311:[function(require,module,exports){
arguments[4][69][0].apply(exports,arguments)
},{"./_object-gops":337,"./_object-keys":340,"./_object-pie":341,"dup":69}],312:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"./_core":305,"./_ctx":306,"./_global":315,"./_has":316,"./_hide":317,"dup":70}],313:[function(require,module,exports){
arguments[4][71][0].apply(exports,arguments)
},{"dup":71}],314:[function(require,module,exports){
arguments[4][72][0].apply(exports,arguments)
},{"./_an-object":294,"./_ctx":306,"./_is-array-iter":321,"./_iter-call":324,"./_to-length":357,"./core.get-iterator-method":365,"dup":72}],315:[function(require,module,exports){
arguments[4][73][0].apply(exports,arguments)
},{"dup":73}],316:[function(require,module,exports){
arguments[4][74][0].apply(exports,arguments)
},{"dup":74}],317:[function(require,module,exports){
arguments[4][75][0].apply(exports,arguments)
},{"./_descriptors":308,"./_object-dp":332,"./_property-desc":343,"dup":75}],318:[function(require,module,exports){
arguments[4][76][0].apply(exports,arguments)
},{"./_global":315,"dup":76}],319:[function(require,module,exports){
arguments[4][77][0].apply(exports,arguments)
},{"./_descriptors":308,"./_dom-create":309,"./_fails":313,"dup":77}],320:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"./_cof":301,"dup":79}],321:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"./_iterators":328,"./_wks":364,"dup":80}],322:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"./_cof":301,"dup":81}],323:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"dup":82}],324:[function(require,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"./_an-object":294,"dup":83}],325:[function(require,module,exports){
arguments[4][84][0].apply(exports,arguments)
},{"./_hide":317,"./_object-create":331,"./_property-desc":343,"./_set-to-string-tag":350,"./_wks":364,"dup":84}],326:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"./_export":312,"./_hide":317,"./_iter-create":325,"./_iterators":328,"./_library":329,"./_object-gpo":338,"./_redefine":345,"./_set-to-string-tag":350,"./_wks":364,"dup":85}],327:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"dup":87}],328:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"dup":88}],329:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"dup":89}],330:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"./_fails":313,"./_has":316,"./_is-object":323,"./_object-dp":332,"./_uid":360,"dup":90}],331:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./_an-object":294,"./_dom-create":309,"./_enum-bug-keys":310,"./_html":318,"./_object-dps":333,"./_shared-key":351,"dup":93}],332:[function(require,module,exports){
arguments[4][94][0].apply(exports,arguments)
},{"./_an-object":294,"./_descriptors":308,"./_ie8-dom-define":319,"./_to-primitive":359,"dup":94}],333:[function(require,module,exports){
arguments[4][95][0].apply(exports,arguments)
},{"./_an-object":294,"./_descriptors":308,"./_object-dp":332,"./_object-keys":340,"dup":95}],334:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"./_descriptors":308,"./_has":316,"./_ie8-dom-define":319,"./_object-pie":341,"./_property-desc":343,"./_to-iobject":356,"./_to-primitive":359,"dup":96}],335:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"./_object-gopn":336,"./_to-iobject":356,"dup":97}],336:[function(require,module,exports){
arguments[4][98][0].apply(exports,arguments)
},{"./_enum-bug-keys":310,"./_object-keys-internal":339,"dup":98}],337:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99}],338:[function(require,module,exports){
arguments[4][100][0].apply(exports,arguments)
},{"./_has":316,"./_shared-key":351,"./_to-object":358,"dup":100}],339:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"./_array-includes":296,"./_has":316,"./_shared-key":351,"./_to-iobject":356,"dup":101}],340:[function(require,module,exports){
arguments[4][102][0].apply(exports,arguments)
},{"./_enum-bug-keys":310,"./_object-keys-internal":339,"dup":102}],341:[function(require,module,exports){
arguments[4][103][0].apply(exports,arguments)
},{"dup":103}],342:[function(require,module,exports){
arguments[4][104][0].apply(exports,arguments)
},{"./_core":305,"./_export":312,"./_fails":313,"dup":104}],343:[function(require,module,exports){
arguments[4][107][0].apply(exports,arguments)
},{"dup":107}],344:[function(require,module,exports){
arguments[4][108][0].apply(exports,arguments)
},{"./_hide":317,"dup":108}],345:[function(require,module,exports){
arguments[4][109][0].apply(exports,arguments)
},{"./_hide":317,"dup":109}],346:[function(require,module,exports){
arguments[4][224][0].apply(exports,arguments)
},{"./_a-function":291,"./_ctx":306,"./_export":312,"./_for-of":314,"dup":224}],347:[function(require,module,exports){
arguments[4][225][0].apply(exports,arguments)
},{"./_export":312,"dup":225}],348:[function(require,module,exports){
arguments[4][110][0].apply(exports,arguments)
},{"./_an-object":294,"./_ctx":306,"./_is-object":323,"./_object-gopd":334,"dup":110}],349:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"./_core":305,"./_descriptors":308,"./_global":315,"./_object-dp":332,"./_wks":364,"dup":111}],350:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"./_has":316,"./_object-dp":332,"./_wks":364,"dup":112}],351:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"./_shared":352,"./_uid":360,"dup":113}],352:[function(require,module,exports){
arguments[4][114][0].apply(exports,arguments)
},{"./_core":305,"./_global":315,"./_library":329,"dup":114}],353:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"./_defined":307,"./_to-integer":355,"dup":116}],354:[function(require,module,exports){
arguments[4][118][0].apply(exports,arguments)
},{"./_to-integer":355,"dup":118}],355:[function(require,module,exports){
arguments[4][119][0].apply(exports,arguments)
},{"dup":119}],356:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"./_defined":307,"./_iobject":320,"dup":120}],357:[function(require,module,exports){
arguments[4][121][0].apply(exports,arguments)
},{"./_to-integer":355,"dup":121}],358:[function(require,module,exports){
arguments[4][122][0].apply(exports,arguments)
},{"./_defined":307,"dup":122}],359:[function(require,module,exports){
arguments[4][123][0].apply(exports,arguments)
},{"./_is-object":323,"dup":123}],360:[function(require,module,exports){
arguments[4][124][0].apply(exports,arguments)
},{"dup":124}],361:[function(require,module,exports){
arguments[4][239][0].apply(exports,arguments)
},{"./_is-object":323,"dup":239}],362:[function(require,module,exports){
arguments[4][126][0].apply(exports,arguments)
},{"./_core":305,"./_global":315,"./_library":329,"./_object-dp":332,"./_wks-ext":363,"dup":126}],363:[function(require,module,exports){
arguments[4][127][0].apply(exports,arguments)
},{"./_wks":364,"dup":127}],364:[function(require,module,exports){
arguments[4][128][0].apply(exports,arguments)
},{"./_global":315,"./_shared":352,"./_uid":360,"dup":128}],365:[function(require,module,exports){
arguments[4][129][0].apply(exports,arguments)
},{"./_classof":300,"./_core":305,"./_iterators":328,"./_wks":364,"dup":129}],366:[function(require,module,exports){
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function (it) {
  var iterFn = get(it);
  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};

},{"./_an-object":294,"./_core":305,"./core.get-iterator-method":365}],367:[function(require,module,exports){
arguments[4][130][0].apply(exports,arguments)
},{"./_add-to-unscopables":292,"./_iter-define":326,"./_iter-step":327,"./_iterators":328,"./_to-iobject":356,"dup":130}],368:[function(require,module,exports){
arguments[4][131][0].apply(exports,arguments)
},{"./_export":312,"./_object-create":331,"dup":131}],369:[function(require,module,exports){
arguments[4][132][0].apply(exports,arguments)
},{"./_descriptors":308,"./_export":312,"./_object-dp":332,"dup":132}],370:[function(require,module,exports){
arguments[4][133][0].apply(exports,arguments)
},{"./_object-gopd":334,"./_object-sap":342,"./_to-iobject":356,"dup":133}],371:[function(require,module,exports){
arguments[4][134][0].apply(exports,arguments)
},{"./_object-gpo":338,"./_object-sap":342,"./_to-object":358,"dup":134}],372:[function(require,module,exports){
arguments[4][135][0].apply(exports,arguments)
},{"./_export":312,"./_set-proto":348,"dup":135}],373:[function(require,module,exports){
arguments[4][136][0].apply(exports,arguments)
},{"dup":136}],374:[function(require,module,exports){
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

},{"./_collection":304,"./_collection-strong":302,"./_validate-collection":361}],375:[function(require,module,exports){
arguments[4][138][0].apply(exports,arguments)
},{"./_iter-define":326,"./_string-at":353,"dup":138}],376:[function(require,module,exports){
arguments[4][139][0].apply(exports,arguments)
},{"./_an-object":294,"./_descriptors":308,"./_enum-keys":311,"./_export":312,"./_fails":313,"./_global":315,"./_has":316,"./_hide":317,"./_is-array":322,"./_is-object":323,"./_library":329,"./_meta":330,"./_object-create":331,"./_object-dp":332,"./_object-gopd":334,"./_object-gopn":336,"./_object-gopn-ext":335,"./_object-gops":337,"./_object-keys":340,"./_object-pie":341,"./_property-desc":343,"./_redefine":345,"./_set-to-string-tag":350,"./_shared":352,"./_to-iobject":356,"./_to-primitive":359,"./_uid":360,"./_wks":364,"./_wks-define":362,"./_wks-ext":363,"dup":139}],377:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
require('./_set-collection-from')('Set');

},{"./_set-collection-from":346}],378:[function(require,module,exports){
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
require('./_set-collection-of')('Set');

},{"./_set-collection-of":347}],379:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export = require('./_export');

$export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });

},{"./_collection-to-json":303,"./_export":312}],380:[function(require,module,exports){
arguments[4][142][0].apply(exports,arguments)
},{"./_wks-define":362,"dup":142}],381:[function(require,module,exports){
arguments[4][143][0].apply(exports,arguments)
},{"./_wks-define":362,"dup":143}],382:[function(require,module,exports){
arguments[4][144][0].apply(exports,arguments)
},{"./_global":315,"./_hide":317,"./_iterators":328,"./_wks":364,"./es6.array.iterator":367,"dup":144}],383:[function(require,module,exports){
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

},{"./debug":384,"_process":145}],384:[function(require,module,exports){

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

},{"ms":385}],385:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9kaXN0L2NvcmUvQXVkaW9UaW1lRW5naW5lLmpzIiwiLi4vLi4vZGlzdC9jb3JlL2F1ZGlvQ29udGV4dC5qcyIsIi4uLy4uL2Rpc3QvZW5naW5lcy9HcmFudWxhckVuZ2luZS5qcyIsIi4uLy4uL2Rpc3QvZW5naW5lcy9NZXRyb25vbWUuanMiLCIuLi8uLi9kaXN0L2VuZ2luZXMvUGxheWVyRW5naW5lLmpzIiwiLi4vLi4vZGlzdC9lbmdpbmVzL1NlZ21lbnRFbmdpbmUuanMiLCIuLi8uLi9kaXN0L2luZGV4LmpzIiwiLi4vLi4vZGlzdC9tYXN0ZXJzL1BsYXlDb250cm9sLmpzIiwiLi4vLi4vZGlzdC9tYXN0ZXJzL1RyYW5zcG9ydC5qcyIsIi4uLy4uL2Rpc3QvbWFzdGVycy9mYWN0b3JpZXMuanMiLCJkaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2NvbXBvbmVudHMvQmFzZUNvbXBvbmVudC5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL0RyYWdBbmREcm9wLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2NvbXBvbmVudHMvR3JvdXAuanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvY29tcG9uZW50cy9OdW1iZXJCb3guanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvY29tcG9uZW50cy9TZWxlY3RCdXR0b25zLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2NvbXBvbmVudHMvU2VsZWN0TGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1NsaWRlci5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1RleHQuanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvY29tcG9uZW50cy9UaXRsZS5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1RvZ2dsZS5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9jb21wb25lbnRzL1RyaWdnZXJCdXR0b25zLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L2ZhY3RvcnkuanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzL2Rpc3QvbWl4aW5zL2NvbnRhaW5lci5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC9taXhpbnMvZGlzcGxheS5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC91dGlscy9lbGVtZW50cy5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvZGlzdC91dGlscy9zdHlsZXMtZGVjbGFyYXRpb25zLmpzIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy9kaXN0L3V0aWxzL3N0eWxlcy5qcyIsIm5vZGVfbW9kdWxlcy9AaXJjYW0vYmFzaWMtY29udHJvbGxlcnMvcGFja2FnZS5qc29uIiwibm9kZV9tb2R1bGVzL0BpcmNhbS9ndWktY29tcG9uZW50cy9kaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY3JlYXRlQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaW5kZXguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYS1mdW5jdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYWRkLXRvLXVuc2NvcGFibGVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1pbnN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jdHguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19kb20tY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWJ1Zy1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2V4cG9ydC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZmFpbHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Zvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZ2xvYmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hpZGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2h0bWwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pbnZva2UuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLWRldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1zdGVwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2xpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21ldGEuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21pY3JvdGFzay5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fbmV3LXByb21pc2UtY2FwYWJpbGl0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZHBzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wZC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcG4tZXh0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ29wbi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcHMuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1ncG8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1rZXlzLWludGVybmFsLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXNhcC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcGVyZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcHJvbWlzZS1yZXNvbHZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19wcm9wZXJ0eS1kZXNjLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19yZWRlZmluZS1hbGwuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLWtleS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2hhcmVkLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zdHJpbmctYXQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Rhc2suanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWFic29sdXRlLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pbnRlZ2VyLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tcHJpbWl0aXZlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3VzZXItYWdlbnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy1leHQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3drcy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5wcm9taXNlLmZpbmFsbHkuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnByb21pc2UudHJ5LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zeW1ib2wuYXN5bmMtaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnN5bWJvbC5vYnNlcnZhYmxlLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxvYWRlcnMvZGlzdC9hdWRpby1idWZmZXItbG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxvYWRlcnMvZGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sb2FkZXJzL2Rpc3QvbG9hZGVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxvYWRlcnMvZGlzdC9zdXBlci1sb2FkZXIuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL21hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vbWFwLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1mcm9tLWl0ZXJhYmxlLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1tZXRob2RzLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi1zdHJvbmcuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvbGxlY3Rpb24tdG8tanNvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LWNvbGxlY3Rpb24tZnJvbS5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LWNvbGxlY3Rpb24tb2YuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3ZhbGlkYXRlLWNvbGxlY3Rpb24uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm1hcC5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcubWFwLmZyb20uanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3Lm1hcC5vZi5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcubWFwLnRvLWpzb24uanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL2Rpc3QvY29yZS9Qcmlvcml0eVF1ZXVlLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9kaXN0L2NvcmUvU2NoZWR1bGluZ1F1ZXVlLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9kaXN0L2NvcmUvVGltZUVuZ2luZS5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvZGlzdC9pbmRleC5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvZGlzdC9tYXN0ZXJzL1BsYXlDb250cm9sLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9kaXN0L21hc3RlcnMvU2NoZWR1bGVyLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9kaXN0L21hc3RlcnMvU2ltcGxlU2NoZWR1bGVyLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9kaXN0L21hc3RlcnMvVHJhbnNwb3J0LmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL2dldC1pdGVyYXRvci5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zZXQuanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3NldC5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLmpzIiwiLi4vLi4vLi4vd2F2ZXMtbWFzdGVycy9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnNldC5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zZXQuZnJvbS5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNy5zZXQub2YuanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczcuc2V0LnRvLWpzb24uanMiLCIuLi8uLi8uLi93YXZlcy1tYXN0ZXJzL25vZGVfbW9kdWxlcy9kZWJ1Zy9zcmMvYnJvd3Nlci5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9kZWJ1Zy5qcyIsIi4uLy4uLy4uL3dhdmVzLW1hc3RlcnMvbm9kZV9tb2R1bGVzL21zL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNBQTs7QUFDQTs7Ozs7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtQk0sZTs7O0FBQ0osNkJBQWdEO0FBQUEsUUFBcEMsWUFBb0MsdUVBQXJCLHNCQUFxQjtBQUFBOztBQUc5Qzs7Ozs7Ozs7QUFIOEM7O0FBVzlDLFVBQUssWUFBTCxHQUFvQixZQUFwQjs7QUFFQTs7Ozs7Ozs7O0FBU0EsVUFBSyxVQUFMLEdBQWtCLElBQWxCO0FBdEI4QztBQXVCL0M7O0FBRUQ7Ozs7Ozs7Ozs0QkFLUSxNLEVBQVE7QUFDZCxXQUFLLFVBQUwsQ0FBZ0IsT0FBaEIsQ0FBd0IsTUFBeEI7QUFDQSxhQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7OytCQU1XLFUsRUFBWTtBQUNyQixXQUFLLFVBQUwsQ0FBZ0IsVUFBaEIsQ0FBMkIsVUFBM0I7QUFDQSxhQUFPLElB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDekxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImltcG9ydCB7IFRpbWVFbmdpbmUgfSBmcm9tICd3YXZlcy1tYXN0ZXJzJztcbmltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4vYXVkaW9Db250ZXh0JztcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBhbGwgYXVkaW8gcmVsYXRlZCB0aW1lIGVuZ2luZSBjb21wb25lbnRzLiBJdCBpc1xuICogdXNlZCB0byBoYW5kbGUgYXVkaW8gcmVsYXRlZCBldmVudHMgc3VjaCBhcyB0aGUgcGxheWJhY2sgb2YgYSBtZWRpYSBzdHJlYW0uXG4gKiBJdCBleHRlbmRzIHRoZSBUaW1lRW5naW5lIGNsYXNzIGJ5IHRoZSBzdGFuZGFyZCB3ZWIgYXVkaW8gbm9kZSBtZXRob2RzXG4gKiBjb25uZWN0IGFuZCBkaXNjb25uZWN0LlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvYXVkaW8tdGltZS1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqXG4gKiBjbGFzcyBNeUVuZ2luZSBleHRlbmRzIGF1ZGlvLkF1ZGlvVGltZUVuZ2luZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHN1cGVyKCk7XG4gKiAgICAgLy8gLi4uXG4gKiAgIH1cbiAqIH1cbiAqL1xuY2xhc3MgQXVkaW9UaW1lRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gY29udGV4dCB1c2VkIGJ5IHRoZSBUaW1lRW5naW5lLCBkZWZhdWx0IHRvIHRoZSBnbG9iYWwgYXVkaW9Db250ZXh0XG4gICAgICpcbiAgICAgKiBAbmFtZSBhdWRpb0NvbnRleHRcbiAgICAgKiBAdHlwZSBBdWRpb0NvbnRleHRcbiAgICAgKiBAbWVtYmVyb2YgQXVkaW9UaW1lRW5naW5lXG4gICAgICogQHNlZSBhdWRpb0NvbnRleHRcbiAgICAgKi9cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcblxuICAgIC8qKlxuICAgICAqIE91dHB1dCBhdWRpbyBub2RlLiBCeSBkZWZhdWx0IHRoZSBjb25uZWN0IG1ldGhvZCBjb25uZWN0cyBhIGdpdmVuIG5vZGVcbiAgICAgKiB0byB0aGlzIG91dHB1dCBub2RlLlxuICAgICAqXG4gICAgICogQG5hbWUgb3V0cHV0Tm9kZVxuICAgICAqIEB0eXBlIEF1ZGlvTm9kZVxuICAgICAqIEBtZW1iZXJvZiBBdWRpb1RpbWVFbmdpbmVcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgdGhpcy5vdXRwdXROb2RlID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb25uZWN0IHRvIGFuIGF1ZGlvIG5vZGUgKGUuZy4gYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKVxuICAgKlxuICAgKiBAcGFyYW0ge0F1ZGlvTm9kZX0gdGFyZ2V0IC0gVGFyZ2V0IGF1ZGlvIG5vZGVcbiAgICovXG4gIGNvbm5lY3QodGFyZ2V0KSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmNvbm5lY3QodGFyZ2V0KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0IGZyb20gYW4gYXVkaW8gbm9kZSAoZS5nLiBhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pLiBJZiB1bmRlZmluZWRcbiAgICogZGlzY29ubmVjdCBmcm9tIGFsbCB0YXJnZXQgbm9kZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QXVkaW9Ob2RlfSB0YXJnZXQgLSBUYXJnZXQgYXVkaW8gbm9kZS5cbiAgICovXG4gIGRpc2Nvbm5lY3QoY29ubmVjdGlvbikge1xuICAgIHRoaXMub3V0cHV0Tm9kZS5kaXNjb25uZWN0KGNvbm5lY3Rpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEF1ZGlvVGltZUVuZ2luZTtcbiIsImNvbnN0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dDtcblxuLyoqXG4gKiBFeHBvc2UgYSB1bmlxdWUgYXVkaW8gY29udGV4dCBzaW5nbGV0b24gYXMgdGhlIGRlZmF1bHQgYXVkaW9cbiAqIGNvbnRleHQgdXNlZCBieSB0aGUgY29tcG9uZW50cyBvZiB0aGUgV2F2ZXMgQXVkaW8gbGlicmFyeSBhbmRcbiAqIGFwcGxpY2F0aW9ucyB1c2luZyB0aGUgbGlicmFyeS5cbiAqXG4gKiBAdHlwZSBBdWRpb0NvbnRleHRcbiAqIEBuYW1lIGF1ZGlvQ29udGV4dFxuICogQGNvbnN0YW50XG4gKiBAZ2xvYmFsXG4gKiBAaW5zdGFuY2VcbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3QgYXVkaW9Db250ZXh0ID0gYXVkaW8uYXVkaW9Db250ZXh0O1xuICovXG5sZXQgYXVkaW9Db250ZXh0ID0gbnVsbDtcblxuaWYgKEF1ZGlvQ29udGV4dClcbiAgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5leHBvcnQgZGVmYXVsdCBhdWRpb0NvbnRleHQ7XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvQXVkaW9UaW1lRW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYgKG9wdCAhPT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBvcHQ7XG5cbiAgcmV0dXJuIGRlZjtcbn1cblxuXG4vKipcbiAqIEdyYW51bGFyIHN5bnRoZXNpcyBUaW1lRW5naW5lIGltcGxlbWVudGluZyB0aGUgc2NoZWR1bGVkIGludGVyZmFjZS5cbiAqIFRoZSBncmFpbiBwb3NpdGlvbiAoZ3JhaW4gb25zZXQgb3IgY2VudGVyIHRpbWUgaW4gdGhlIGF1ZGlvIGJ1ZmZlcikgaXNcbiAqIG9wdGlvbmFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgZW5naW5lJ3MgY3VycmVudFBvc2l0aW9uIGF0dHJpYnV0ZS5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgYSBgR3JhbnVsYXJFbmdpbmVgICh3aXRoIGEgZmV3IHBhcmFtZXRlciBjb250cm9scykgZHJpdmVuXG4gKiBieSBhIGBTY2hlZHVsZXJgIGFuZCBhIGBQbGF5Q29udHJvbGA6XG4gKiB7QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL2dyYW51bGFyLWVuZ2luZS5odG1sfVxuICpcbiAqIEBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZVxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHNjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuICogY29uc3QgZ3JhbnVsYXJFbmdpbmUgPSBuZXcgYXVkaW8uR3JhbnVsYXJFbmdpbmUoKTtcbiAqXG4gKiBzY2hlZHVsZXIuYWRkKGdyYW51bGFyRW5naW5lKTtcbiAqXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnM9e30gLSBQYXJhbWV0ZXJzXG4gKiBAcGFyYW0ge0F1ZGlvQnVmZmVyfSBbb3B0aW9ucy5idWZmZXI9bnVsbF0gLSBBdWRpbyBidWZmZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RBYnM9MC4wMV0gLSBBYnNvbHV0ZSBncmFpbiBwZXJpb2QgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kUmVsPTBdIC0gR3JhaW4gcGVyaW9kIHJlbGF0aXZlIHRvIGFic29sdXRlXG4gKiAgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RWYXI9MF0gLSBBbW91dCBvZiByYW5kb20gZ3JhaW4gcGVyaW9kXG4gKiAgdmFyaWF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZE1pbj0wLjAwMV0gLSBNaW5pbXVtIGdyYWluIHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uPTBdIC0gR3JhaW4gcG9zaXRpb24gKG9uc2V0IHRpbWUgaW4gYXVkaW9cbiAqICBidWZmZXIpIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uVmFyPTAuMDAzXSAtIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwb3NpdGlvblxuICogIHZhcmlhdGlvbiBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvbkFicz0wLjFdIC0gQWJzb2x1dGUgZ3JhaW4gZHVyYXRpb24gaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZHVyYXRpb25SZWw9MF0gLSBHcmFpbiBkdXJhdGlvbiByZWxhdGl2ZSB0byBncmFpblxuICogIHBlcmlvZCAob3ZlcmxhcClcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5hdHRhY2tBYnM9MF0gLSBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5hdHRhY2tSZWw9MC41XSAtIEF0dGFjayB0aW1lIHJlbGF0aXZlIHRvIGdyYWluIGR1cmF0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuYXR0YWNrU2hhcGU9J2xpbiddIC0gU2hhcGUgb2YgYXR0YWNrXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZUFicz0wXSAtIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlUmVsPTAuNV0gLSBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZWxlYXNlU2hhcGU9J2xpbiddIC0gU2hhcGUgb2YgcmVsZWFzZVxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmV4cFJhbXBPZmZzZXQ9MC4wMDAxXSAtIE9mZnNldCAoc3RhcnQvZW5kIHZhbHVlKVxuICogIGZvciBleHBvbmVudGlhbCBhdHRhY2svcmVsZWFzZVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnJlc2FtcGxpbmc9MF0gLSBHcmFpbiByZXNhbXBsaW5nIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5yZXNhbXBsaW5nVmFyPTBdIC0gQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gTGluZWFyIGdhaW4gZmFjdG9yXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmNlbnRlcmVkPXRydWVdIC0gV2hldGhlciB0aGUgZ3JhaW4gcG9zaXRpb24gcmVmZXJzXG4gKiAgdG8gdGhlIGNlbnRlciBvZiB0aGUgZ3JhaW4gKG9yIHRoZSBiZWdpbm5pbmcpXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmN5Y2xpYz1mYWxzZV0gLSBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIGdyYWluXG4gKiAgcG9zaXRpb24gYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbj0wXSAtIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGVcbiAqICBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAqL1xuY2xhc3MgR3JhbnVsYXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKlxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKiBAbmFtZSBidWZmZXJcbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBwZXJpb2QgaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHBlcmlvZEFic1xuICAgICAqIEBkZWZhdWx0IDAuMDFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwLjAxKTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBlcmlvZCByZWxhdGl2ZSB0byBhYnNvbHV0ZSBkdXJhdGlvblxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RSZWxcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RSZWwgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2RcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kVmFyXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBncmFpbiBwZXJpb2RcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kTWluXG4gICAgICogQGRlZmF1bHQgMC4wMDFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZE1pbiA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kTWluLCAwLjAwMSk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiBwb3NpdGlvbiAob25zZXQgdGltZSBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwb3NpdGlvblxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvbiwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwb3NpdGlvblZhclxuICAgICAqIEBkZWZhdWx0IDAuMDAzXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvblZhciA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25WYXIsIDAuMDAzKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGdyYWluIGR1cmF0aW9uIGluIHNlY1xuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBkdXJhdGlvbkFic1xuICAgICAqIEBkZWZhdWx0IDAuMVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BYnMgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uQWJzLCAwLjEpOyAvLyBhYnNvbHV0ZSBncmFpbiBkdXJhdGlvblxuXG4gICAgLyoqXG4gICAgICogR3JhaW4gZHVyYXRpb24gcmVsYXRpdmUgdG8gZ3JhaW4gcGVyaW9kIChvdmVybGFwKVxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBkdXJhdGlvblJlbFxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uUmVsID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvblJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgYXR0YWNrQWJzXG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrQWJzID0gb3B0T3JEZWYob3B0aW9ucy5hdHRhY2tBYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNrIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgYXR0YWNrUmVsXG4gICAgICogQGRlZmF1bHQgMC41XG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tSZWwgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1JlbCwgMC41KTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIGF0dGFjayAoJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWwgcmFtcClcbiAgICAgKlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgYXR0YWNrU2hhcGVcbiAgICAgKiBAZGVmYXVsdCAnbGluJ1xuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuYXR0YWNrU2hhcGUgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1NoYXBlLCAnbGluJyk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIHJlbGVhc2VBYnNcbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlQWJzID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSByZWxlYXNlUmVsXG4gICAgICogQGRlZmF1bHQgMC41XG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlUmVsID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlUmVsLCAwLjUpO1xuXG4gICAgLyoqXG4gICAgICogU2hhcGUgb2YgcmVsZWFzZSAoJ2xpbicgZm9yIGxpbmVhciByYW1wLCAnZXhwJyBmb3IgZXhwb25lbnRpYWwgcmFtcClcbiAgICAgKlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQG5hbWUgcmVsZWFzZVNoYXBlXG4gICAgICogQGRlZmF1bHQgJ2xpbidcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlbGVhc2VTaGFwZSA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVNoYXBlLCAnbGluJyk7XG5cbiAgICAvKipcbiAgICAgKiBPZmZzZXQgKHN0YXJ0L2VuZCB2YWx1ZSkgZm9yIGV4cG9uZW50aWFsIGF0dGFjay9yZWxlYXNlXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGV4cFJhbXBPZmZzZXRcbiAgICAgKiBAZGVmYXVsdCAwLjAwMDFcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmV4cFJhbXBPZmZzZXQgPSBvcHRPckRlZihvcHRpb25zLmV4cFJhbXBPZmZzZXQsIDAuMDAwMSk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiByZXNhbXBsaW5nIGluIGNlbnRcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1xuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmcgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmcsIDApO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHJlc2FtcGxpbmcgdmFyaWF0aW9uIGluIGNlbnRcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcmVzYW1wbGluZ1ZhclxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmdWYXIgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmdWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTGluZWFyIGdhaW4gZmFjdG9yXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGdhaW5cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIEdyYW51bGFyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5nYWluID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGdyYWluIHBvc2l0aW9uIHJlZmVycyB0byB0aGUgY2VudGVyIG9mIHRoZSBncmFpbiAob3IgdGhlIGJlZ2lubmluZylcbiAgICAgKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBuYW1lIGNlbnRlcmVkXG4gICAgICogQGRlZmF1bHQgdHJ1ZVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY2VudGVyZWQgPSBvcHRPckRlZihvcHRpb25zLmNlbnRlcmVkLCB0cnVlKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgZ3JhaW4gcG9zaXRpb24gYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICpcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAbmFtZSBjeWNsaWNcbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcblxuICAgIC8qKlxuICAgICAqIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyIHRoYXQgaGFzIGJlZW4gY29waWVkIGZyb20gdGhlXG4gICAgICogYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgd3JhcEFyb3VuZEV4dGVuc2lvblxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBidWZmZXJEdXJhdGlvblxuICAgKiBAbWVtYmVyb2YgR3JhbnVsYXJFbmdpbmVcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLndyYXBBcm91bmRFeHRlbnNpb24pXG4gICAgICAgIGJ1ZmZlckR1cmF0aW9uIC09IHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbjtcblxuICAgICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgcG9zaXRpb25cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgY3VycmVudFBvc2l0aW9uXG4gICAqIEBtZW1iZXJvZiBHcmFudWxhckVuZ2luZVxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aW1lID0gTWF0aC5tYXgodGltZSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBncmFpbi4gVGhpcyBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIGF0IGFueSB0aW1lICh3aGV0aGVyIHRoZVxuICAgKiBlbmdpbmUgaXMgc2NoZWR1bGVkIG9yIG5vdCkgdG8gZ2VuZXJhdGUgYSBzaW5nbGUgZ3JhaW4gYWNjb3JkaW5nIHRvIHRoZVxuICAgKiBjdXJyZW50IGdyYWluIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gZ3JhaW4gc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIHBlcmlvZCB0byBuZXh0IGdyYWluXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGdyYWluVGltZSA9IHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIHZhciBncmFpblBlcmlvZCA9IHRoaXMucGVyaW9kQWJzO1xuICAgIHZhciBncmFpblBvc2l0aW9uID0gdGhpcy5jdXJyZW50UG9zaXRpb247XG4gICAgdmFyIGdyYWluRHVyYXRpb24gPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSByZXNhbXBsaW5nXG4gICAgICBpZiAodGhpcy5yZXNhbXBsaW5nICE9PSAwIHx8IHRoaXMucmVzYW1wbGluZ1ZhciA+IDApIHtcbiAgICAgICAgdmFyIHJhbmRvbVJlc2FtcGxpbmcgPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAyLjAgKiB0aGlzLnJlc2FtcGxpbmdWYXI7XG4gICAgICAgIHJlc2FtcGxpbmdSYXRlID0gTWF0aC5wb3coMi4wLCAodGhpcy5yZXNhbXBsaW5nICsgcmFuZG9tUmVzYW1wbGluZykgLyAxMjAwLjApO1xuICAgICAgfVxuXG4gICAgICBncmFpblBlcmlvZCArPSB0aGlzLnBlcmlvZFJlbCAqIGdyYWluRHVyYXRpb247XG4gICAgICBncmFpbkR1cmF0aW9uICs9IHRoaXMuZHVyYXRpb25SZWwgKiBncmFpblBlcmlvZDtcblxuICAgICAgLy8gZ3JhaW4gcGVyaW9kIHJhbmRvbiB2YXJpYXRpb25cbiAgICAgIGlmICh0aGlzLnBlcmlvZFZhciA+IDAuMClcbiAgICAgICAgZ3JhaW5QZXJpb2QgKz0gMi4wICogKE1hdGgucmFuZG9tKCkgLSAwLjUpICogdGhpcy5wZXJpb2RWYXIgKiBncmFpblBlcmlvZDtcblxuICAgICAgLy8gY2VudGVyIGdyYWluXG4gICAgICBpZiAodGhpcy5jZW50ZXJlZClcbiAgICAgICAgZ3JhaW5Qb3NpdGlvbiAtPSAwLjUgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAvLyByYW5kb21pemUgZ3JhaW4gcG9zaXRpb25cbiAgICAgIGlmICh0aGlzLnBvc2l0aW9uVmFyID4gMClcbiAgICAgICAgZ3JhaW5Qb3NpdGlvbiArPSAoMi4wICogTWF0aC5yYW5kb20oKSAtIDEpICogdGhpcy5wb3NpdGlvblZhcjtcblxuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgICAgLy8gd3JhcCBvciBjbGlwIGdyYWluIHBvc2l0aW9uIGFuZCBkdXJhdGlvbiBpbnRvIGJ1ZmZlciBkdXJhdGlvblxuICAgICAgaWYgKGdyYWluUG9zaXRpb24gPCAwIHx8IGdyYWluUG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuY3ljbGljKSB7XG4gICAgICAgICAgdmFyIGN5Y2xlcyA9IGdyYWluUG9zaXRpb24gLyBidWZmZXJEdXJhdGlvbjtcbiAgICAgICAgICBncmFpblBvc2l0aW9uID0gKGN5Y2xlcyAtIE1hdGguZmxvb3IoY3ljbGVzKSkgKiBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uICsgZ3JhaW5EdXJhdGlvbiA+IHRoaXMuYnVmZmVyLmR1cmF0aW9uKVxuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gZ3JhaW5Qb3NpdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgIGdyYWluVGltZSAtPSBncmFpblBvc2l0aW9uO1xuICAgICAgICAgICAgZ3JhaW5EdXJhdGlvbiArPSBncmFpblBvc2l0aW9uO1xuICAgICAgICAgICAgZ3JhaW5Qb3NpdGlvbiA9IDA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gKyBncmFpbkR1cmF0aW9uID4gYnVmZmVyRHVyYXRpb24pXG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uID0gYnVmZmVyRHVyYXRpb24gLSBncmFpblBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1ha2UgZ3JhaW5cbiAgICAgIGlmICh0aGlzLmdhaW4gPiAwICYmIGdyYWluRHVyYXRpb24gPj0gMC4wMDEpIHtcbiAgICAgICAgLy8gbWFrZSBncmFpbiBlbnZlbG9wZVxuICAgICAgICB2YXIgZW52ZWxvcGUgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB2YXIgYXR0YWNrID0gdGhpcy5hdHRhY2tBYnMgKyB0aGlzLmF0dGFja1JlbCAqIGdyYWluRHVyYXRpb247XG4gICAgICAgIHZhciByZWxlYXNlID0gdGhpcy5yZWxlYXNlQWJzICsgdGhpcy5yZWxlYXNlUmVsICogZ3JhaW5EdXJhdGlvbjtcblxuICAgICAgICBpZiAoYXR0YWNrICsgcmVsZWFzZSA+IGdyYWluRHVyYXRpb24pIHtcbiAgICAgICAgICB2YXIgZmFjdG9yID0gZ3JhaW5EdXJhdGlvbiAvIChhdHRhY2sgKyByZWxlYXNlKTtcbiAgICAgICAgICBhdHRhY2sgKj0gZmFjdG9yO1xuICAgICAgICAgIHJlbGVhc2UgKj0gZmFjdG9yO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGFja0VuZFRpbWUgPSBncmFpblRpbWUgKyBhdHRhY2s7XG4gICAgICAgIHZhciBncmFpbkVuZFRpbWUgPSBncmFpblRpbWUgKyBncmFpbkR1cmF0aW9uIC8gcmVzYW1wbGluZ1JhdGU7XG4gICAgICAgIHZhciByZWxlYXNlU3RhcnRUaW1lID0gZ3JhaW5FbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLnZhbHVlID0gMDtcblxuICAgICAgICBpZiAodGhpcy5hdHRhY2tTaGFwZSA9PT0gJ2xpbicpIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuMCwgZ3JhaW5UaW1lKTtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluVGltZSk7XG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5leHBvbmVudGlhbFJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVsZWFzZVN0YXJ0VGltZSA+IGF0dGFja0VuZFRpbWUpXG4gICAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh0aGlzLmdhaW4sIHJlbGVhc2VTdGFydFRpbWUpO1xuXG4gICAgICAgIGlmICh0aGlzLnJlbGVhc2VTaGFwZSA9PT0gJ2xpbicpIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgZ3JhaW5FbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5leHBSYW1wT2Zmc2V0LCBncmFpbkVuZFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZW52ZWxvcGUuY29ubmVjdCh0aGlzLm91dHB1dE5vZGUpO1xuXG4gICAgICAgIC8vIG1ha2Ugc291cmNlXG4gICAgICAgIHZhciBzb3VyY2UgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICBzb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gcmVzYW1wbGluZ1JhdGU7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KGVudmVsb3BlKTtcblxuICAgICAgICBzb3VyY2Uuc3RhcnQoZ3JhaW5UaW1lLCBncmFpblBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3AoZ3JhaW5FbmRUaW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5wZXJpb2RNaW4sIGdyYWluUGVyaW9kKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHcmFudWxhckVuZ2luZTtcbiIsImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9BdWRpb1RpbWVFbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogTWV0cm9ub21lIGF1ZGlvIGVuZ2luZS4gSXQgZXh0ZW5kcyBUaW1lIEVuZ2luZSBhcyBhIHRyYW5zcG9ydGVkIGludGVyZmFjZS5cbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvbWV0cm9ub21lLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3Qgc2NoZWR1bGVyID0gYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG4gKiBjb25zdCBtZXRyb25vbWUgPSBuZXcgYXVkaW8uTWV0cm9ub21lKHtwZXJpb2Q6IDAuMzMzfSk7XG4gKlxuICogc2NoZWR1bGVyLmFkZChtZXRyb25vbWUpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2Q9MV0gLSBNZXRyb25vbWUgcGVyaW9kXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tGcmVxPTYwMF0gLSBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tBdHRhY2s9MC4wMDJdIC0gTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuY2xpY2tSZWxlYXNlPTAuMDk4XSAtIE1ldHJvbm9tZSBjbGljayByZWxlYXNlIHRpbWVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gR2FpblxuICovXG5jbGFzcyBNZXRyb25vbWUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuX19wZXJpb2QgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgZnJlcXVlbmN5XG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja0ZyZXFcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrRnJlcSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tGcmVxLCA2MDApO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGF0dGFjayB0aW1lXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja0F0dGFja1xuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tBdHRhY2sgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrQXR0YWNrLCAwLjAwMik7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgY2xpY2sgcmVsZWFzZSB0aW1lXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICAgKiBAbmFtZSBjbGlja1JlbGVhc2VcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmNsaWNrUmVsZWFzZSA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tSZWxlYXNlLCAwLjA5OCk7XG5cbiAgICB0aGlzLl9fbGFzdFRpbWUgPSAwO1xuICAgIHRoaXMuX19waGFzZSA9IDA7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5fX2dhaW5Ob2RlO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG4gICAgdGhpcy5fX2xhc3RUaW1lID0gdGltZTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19wZXJpb2QgPiAwKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gKE1hdGguZmxvb3IocG9zaXRpb24gLyB0aGlzLl9fcGVyaW9kKSArIHRoaXMuX19waGFzZSkgKiB0aGlzLl9fcGVyaW9kO1xuXG4gICAgICBpZiAoc3BlZWQgPiAwICYmIG5leHRQb3NpdGlvbiA8IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gKz0gdGhpcy5fX3BlcmlvZDtcbiAgICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBuZXh0UG9zaXRpb24gPiBwb3NpdGlvbilcbiAgICAgICAgbmV4dFBvc2l0aW9uIC09IHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMuX19wZXJpb2Q7XG5cbiAgICByZXR1cm4gcG9zaXRpb24gKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgY2xpY2tBdHRhY2sgPSB0aGlzLmNsaWNrQXR0YWNrO1xuICAgIGNvbnN0IGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuXG4gICAgY29uc3QgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBlbnYuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIHRpbWUgKyBjbGlja0F0dGFjayk7XG4gICAgZW52LmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgIGNvbnN0IG9zYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuY2xpY2tGcmVxO1xuICAgIG9zYy5zdGFydCh0aW1lKTtcbiAgICBvc2Muc3RvcCh0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIG9zYy5jb25uZWN0KGVudik7XG4gIH1cblxuICAvKipcbiAgICogbGluZWFyIGdhaW4gZmFjdG9yXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGdhaW5cbiAgICogQG1lbWJlcm9mIE1ldHJvbm9tZVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBnYWluKHZhbHVlKSB7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBtZXRyb25vbWUgcGVyaW9kXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHBlcmlvZFxuICAgKiBAbWVtYmVyb2YgTWV0cm9ub21lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IHBlcmlvZChwZXJpb2QpIHtcbiAgICB0aGlzLl9fcGVyaW9kID0gcGVyaW9kO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyKSB7XG4gICAgICBpZiAobWFzdGVyLnJlc2V0RW5naW5lVGltZSlcbiAgICAgICAgbWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aGlzLl9fbGFzdFRpbWUgKyBwZXJpb2QpO1xuICAgICAgZWxzZSBpZiAobWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24pXG4gICAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldCBwZXJpb2QoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wZXJpb2Q7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBoYXNlIHBhcmFtZXRlciAoYXZhaWxhYmxlIG9ubHkgd2hlbiAndHJhbnNwb3J0ZWQnKSwgc2hvdWxkIGJlXG4gICAqIGJldHdlZW4gWzAsIDFbXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHBoYXNlXG4gICAqIEBtZW1iZXJvZiBNZXRyb25vbWVcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZXQgcGhhc2UocGhhc2UpIHtcbiAgICB0aGlzLl9fcGhhc2UgPSBwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgfVxuXG4gIGdldCBwaGFzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BoYXNlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1ldHJvbm9tZTtcbiIsImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9BdWRpb1RpbWVFbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbi8qKlxuICogVXNlZCB3aXRoIGEgYnVmZmVyIHRvIHNlcnZlIGF1ZGlvIGZpbGVzLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvcGxheWVyLWVuZ2luZS5odG1sfVxuICpcbiAqIEBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZVxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGF1ZGlvIGZyb20gJ3dhdmVzLWF1ZGlvJztcbiAqIGNvbnN0IHBsYXllckVuZ2luZSA9IGF1ZGlvLlBsYXllckVuZ2luZSgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgYXVkaW8uUGxheUNvbnRyb2wocGxheWVyRW5naW5lKTtcbiAqXG4gKiBwbGF5Q29udHJvbC5zdGFydCgpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5idWZmZXI9MV0gLSBBdWRpbyBidWZmZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5mYWRlVGltZT02MDBdIC0gRmFkZSB0aW1lIGZvciBjaGFpbmluZyBzZWdtZW50c1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmN5Y2xpYz1mYWxzZV0gLSBMb29wIG1vZGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5nYWluPTFdIC0gR2FpblxuICovXG5jbGFzcyBQbGF5ZXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLnRyYW5zcG9ydCA9IG51bGw7IC8vIHNldCB3aGVuIGFkZGVkIHRvIHRyYW5zcG9ydGVyXG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKlxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKiBAbmFtZSBidWZmZXJcbiAgICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogRmFkZSB0aW1lIGZvciBjaGFpbmluZyBzZWdtZW50cyAoZS5nLiBpbiBzdGFydCwgc3RvcCwgYW5kIHNlZWspXG4gICAgICpcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGZhZGVUaW1lXG4gICAgICogQG1lbWJlcm9mIFBsYXllckVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICovXG4gICAgdGhpcy5mYWRlVGltZSA9IG9wdE9yRGVmKG9wdGlvbnMuZmFkZVRpbWUsIDAuMDA1KTtcblxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5fX2N5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBfX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLl9fY3ljbGljICYmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pKSB7XG4gICAgICAgIHZhciBwaGFzZSA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHBvc2l0aW9uID0gKHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSkpICogYnVmZmVyRHVyYXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA+PSAwICYmIHBvc2l0aW9uIDwgYnVmZmVyRHVyYXRpb24gJiYgc3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmNvbm5lY3QodGhpcy5fX2dhaW5Ob2RlKTtcblxuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNwZWVkO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3AgPSB0aGlzLl9fY3ljbGljO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IDA7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcEVuZCA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0YXJ0KHRpbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMuX19lbnZOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX2hhbHQodGltZSkge1xuICAgIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5fX2Vudk5vZGUuZ2Fpbi52YWx1ZSwgdGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RvcCh0aW1lICsgdGhpcy5mYWRlVGltZSk7XG5cbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgICAgdGhpcy5fX2Vudk5vZGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmIChzZWVrIHx8IGxhc3RTcGVlZCAqIHNwZWVkIDwgMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCB8fCBzZWVrKSB7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShzcGVlZCwgdGltZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEB0eXBlIHtCb29sfVxuICAgKiBAbmFtZSBjeWNsaWNcbiAgICogQG1lbWJlcm9mIFBsYXllckVuZ2luZVxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBjeWNsaWMoY3ljbGljKSB7XG4gICAgaWYgKGN5Y2xpYyAhPT0gdGhpcy5fX2N5Y2xpYykge1xuICAgICAgdmFyIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5jdXJyZW50b3NpdGlvbjtcblxuICAgICAgdGhpcy5fX2hhbHQodGltZSk7XG4gICAgICB0aGlzLl9fY3ljbGljID0gY3ljbGljO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fc3RhcnQodGltZSwgcG9zaXRpb24sIHRoaXMuX19zcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0IGN5Y2xpYygpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N5Y2xpYztcbiAgfVxuXG4gIC8qKlxuICAgKiBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgZ2FpblxuICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuc2V0VmFsdWVBdFRpbWUodGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gIH1cblxuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvblxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBidWZmZXJEdXJhdGlvblxuICAgKiBAbWVtYmVyb2YgUGxheWVyRW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZih0aGlzLmJ1ZmZlcilcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgIHJldHVybiAwO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXllckVuZ2luZTtcbiIsImltcG9ydCBBdWRpb1RpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9BdWRpb1RpbWVFbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZiAob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHNvcnRlZEFycmF5LCB2YWx1ZSwgaW5kZXggPSAtMSkge1xuICB2YXIgc2l6ZSA9IHNvcnRlZEFycmF5Lmxlbmd0aDtcblxuICBpZiAoc2l6ZSA+IDApIHtcbiAgICB2YXIgZmlyc3RWYWwgPSBzb3J0ZWRBcnJheVswXTtcbiAgICB2YXIgbGFzdFZhbCA9IHNvcnRlZEFycmF5W3NpemUgLSAxXTtcblxuICAgIGlmICh2YWx1ZSA8IGZpcnN0VmFsKVxuICAgICAgaW5kZXggPSAtMTtcbiAgICBlbHNlIGlmICh2YWx1ZSA+PSBsYXN0VmFsKVxuICAgICAgaW5kZXggPSBzaXplIC0gMTtcbiAgICBlbHNlIHtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gc2l6ZSlcbiAgICAgICAgaW5kZXggPSBNYXRoLmZsb29yKChzaXplIC0gMSkgKiAodmFsdWUgLSBmaXJzdFZhbCkgLyAobGFzdFZhbCAtIGZpcnN0VmFsKSk7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleF0gPiB2YWx1ZSlcbiAgICAgICAgaW5kZXgtLTtcblxuICAgICAgd2hpbGUgKHNvcnRlZEFycmF5W2luZGV4ICsgMV0gPD0gdmFsdWUpXG4gICAgICAgIGluZGV4Kys7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50T3JOZXh0SW5kZXgoc29ydGVkQXJyYXksIHZhbHVlLCBpbmRleCA9IC0xKSB7XG4gIHZhciBzaXplID0gc29ydGVkQXJyYXkubGVuZ3RoO1xuXG4gIGlmIChzaXplID4gMCkge1xuICAgIHZhciBmaXJzdFZhbCA9IHNvcnRlZEFycmF5WzBdO1xuICAgIHZhciBsYXN0VmFsID0gc29ydGVkQXJyYXlbc2l6ZSAtIDFdO1xuXG4gICAgaWYgKHZhbHVlIDw9IGZpcnN0VmFsKVxuICAgICAgaW5kZXggPSAwO1xuICAgIGVsc2UgaWYgKHZhbHVlID49IGxhc3RWYWwpXG4gICAgICBpbmRleCA9IHNpemU7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHNpemUpXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigoc2l6ZSAtIDEpICogKHZhbHVlIC0gZmlyc3RWYWwpIC8gKGxhc3RWYWwgLSBmaXJzdFZhbCkpO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXhdIDwgdmFsdWUpXG4gICAgICAgIGluZGV4Kys7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleCAtIDFdID49IHZhbHVlKVxuICAgICAgICBpbmRleC0tO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn1cblxuLyoqXG4gKiBVc2VkIHdpdGggYSBidWZmZXIgdG8gc2VydmUgYXVkaW8gZmlsZXMgdmlhIGdyYW51bGFyIHN5bnRoZXNpcy5cbiAqXG4gKiBUaGUgZW5naW5lIGltcGxlbWVudHMgdGhlIFwic2NoZWR1bGVkXCIgYW5kIFwidHJhbnNwb3J0ZWRcIiBpbnRlcmZhY2VzLlxuICogV2hlbiBcInNjaGVkdWxlZFwiLCB0aGUgZW5naW5lICBnZW5lcmF0ZXMgc2VnbWVudHMgbW9yZSBvciBsZXNzwqBwZXJpb2RpY2FsbHlcbiAqIChjb250cm9sbGVkIGJ5IHRoZSBwZXJpb2RBYnMsIHBlcmlvZFJlbCwgYW5kIHBlcmlvVmFyIGF0dHJpYnV0ZXMpLlxuICogV2hlbiBcInRyYW5zcG9ydGVkXCIsIHRoZSBlbmdpbmUgZ2VuZXJhdGVzIHNlZ21lbnRzIGF0IHRoZSBwb3NpdGlvbiBvZiB0aGVpciBvbnNldCB0aW1lLlxuICpcbiAqIEV4YW1wbGUgdGhhdCBzaG93cyBhIGBTZWdtZW50RW5naW5lYCB3aXRoIGEgZmV3IHBhcmFtZXRlciBjb250cm9scyBydW5uaW5nIGluIGEgYFNjaGVkdWxlcmAuXG4gKiB7QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtYXVkaW8vbWFzdGVyL2V4YW1wbGVzL3NlZ21lbnQtZW5naW5lLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3Qgc2NoZWR1bGVyID0gYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG4gKiBjb25zdCBzZWdtZW50RW5naW5lID0gbmV3IGF1ZGlvLlNlZ21lbnRFbmdpbmUoKTtcbiAqXG4gKiBzY2hlZHVsZXIuYWRkKHNlZ21lbnRFbmdpbmUpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBEZWZhdWx0IG9wdGlvbnNcbiAqIEBwYXJhbSB7QXVkaW9CdWZmZXJ9IFtvcHRpb25zLmJ1ZmZlcj1udWxsXSAtIEF1ZGlvIGJ1ZmZlclxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZEFicz0wXSAtIEFic29sdXRlIHNlZ21lbnQgcGVyaW9kIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBlcmlvZFJlbD0xXSAtIFNlZ21lbnQgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RWYXI9MF0gLSBBbW91dCBvZiByYW5kb20gc2VnbWVudCBwZXJpb2QgdmFyaWF0aW9uIHJlbGF0aXZlXG4gKiAgdG8gc2VnbWVudCBwZXJpb2RcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wZXJpb2RNaW49MC4wMDFdIC0gTWluaW11bSBzZWdtZW50IHBlcmlvZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBvc2l0aW9uQXJyYXk9WzAuMF1dIC0gQXJyYXkgb2Ygc2VnbWVudCBwb3NpdGlvbnMgKG9uc2V0IHRpbWVzXG4gKiAgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wb3NpdGlvblZhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvbkFycmF5PVswLjBdXSAtIEFycmF5IG9mIHNlZ21lbnQgZHVyYXRpb25zIGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmR1cmF0aW9uQWJzPTBdIC0gQWJzb2x1dGUgc2VnbWVudCBkdXJhdGlvbiBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kdXJhdGlvblJlbD0xXSAtIFNlZ21lbnQgZHVyYXRpb24gcmVsYXRpdmUgdG8gZ2l2ZW4gc2VnbWVudFxuICogIGR1cmF0aW9uIG9yIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb25zLm9mZnNldEFycmF5PVswLjBdXSAtIEFycmF5IG9mIHNlZ21lbnQgb2Zmc2V0cyBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5vZmZzZXRBYnM9LTAuMDA1XSAtIEFic29sdXRlIHNlZ21lbnQgb2Zmc2V0IGluIHNlY1xuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm9mZnNldFJlbD0wXSAtIFNlZ21lbnQgb2Zmc2V0IHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kZWxheT0wLjAwNV0gLSBUaW1lIGJ5IHdoaWNoIGFsbCBzZWdtZW50cyBhcmUgZGVsYXllZCAoZXNwZWNpYWxseVxuICogIHRvIHJlYWxpemUgc2VnbWVudCBvZmZzZXRzKVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmF0dGFja0Ficz0wLjAwNV0gLSBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5hdHRhY2tSZWw9MF0gLSBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZUFicz0wLjAwNV0gLSBBYnNvbHV0ZSByZWxlYXNlIHRpbWUgaW4gc2VjXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVsZWFzZVJlbD0wXSAtIFJlbGVhc2UgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVzYW1wbGluZz0wXSAtIFNlZ21lbnQgcmVzYW1wbGluZyBpbiBjZW50XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucmVzYW1wbGluZ1Zhcj0wXSAtIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZ2Fpbj0xXSAtIExpbmVhciBnYWluIGZhY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmFib3J0VGltZT0wLjAwNV0gLSBmYWRlLW91dCB0aW1lIHdoZW4gYWJvcnRlZFxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnNlZ21lbnRJbmRleD0wXSAtIEluZGV4IG9mIHRoZSBzZWdtZW50IHRvIHN5bnRoZXNpemUgKGkuZS4gb2ZcbiAqICB0aGlzLnBvc2l0aW9uQXJyYXkvZHVyYXRpb25BcnJheS9vZmZzZXRBcnJheSlcbiAqIEBwYXJhbSB7Qm9vbH0gW29wdGlvbnMuY3ljbGljPWZhbHNlXSAtIFdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBhbmQgc2VnbWVudCBpbmRpY2VzIGFyZVxuICogIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbj0wXSAtIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyXG4gKiAgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAqL1xuY2xhc3MgU2VnbWVudEVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKG9wdGlvbnMuYXVkaW9Db250ZXh0KTtcblxuICAgIC8qKlxuICAgICAqIEF1ZGlvIGJ1ZmZlclxuICAgICAqIEBuYW1lIGJ1ZmZlclxuICAgICAqIEB0eXBlIHtBdWRpb0J1ZmZlcn1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmJ1ZmZlciA9IG9wdE9yRGVmKG9wdGlvbnMuYnVmZmVyLCBudWxsKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgcGVyaW9kIGluIHNlY1xuICAgICAqIEBuYW1lIHBlcmlvZEFic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RBYnMgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZEFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHBlcmlvZCByZWxhdGl2ZSB0byBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICogQG5hbWUgcGVyaW9kUmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZFJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kUmVsLCAxKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBlcmlvZCB2YXJpYXRpb24gcmVsYXRpdmUgdG8gc2VnbWVudCBwZXJpb2RcbiAgICAgKiBAbmFtZSBwZXJpb2RWYXJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTWluaW11bSBzZWdtZW50IHBlcmlvZFxuICAgICAqIEBuYW1lIHBlcmlvZE1pblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMC4wMDFcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kTWluID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RNaW4sIDAuMDAxKTtcblxuICAgIC8qKlxuICAgICAqIEFycmF5IG9mIHNlZ21lbnQgcG9zaXRpb25zIChvbnNldCB0aW1lcyBpbiBhdWRpbyBidWZmZXIpIGluIHNlY1xuICAgICAqIEBuYW1lIHBvc2l0aW9uQXJyYXlcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IFswLjBdXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uQXJyYXkgPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uQXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBzZWdtZW50IHBvc2l0aW9uIHZhcmlhdGlvbiBpbiBzZWNcbiAgICAgKiBAbmFtZSBwb3NpdGlvblZhclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvblZhciA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25WYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBkdXJhdGlvbnMgaW4gc2VjXG4gICAgICogQG5hbWUgZHVyYXRpb25BcnJheVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgWzAuMF1cbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25BcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBkdXJhdGlvbiBpbiBzZWNcbiAgICAgKiBAbmFtZSBkdXJhdGlvbkFic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvbkFicyA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25BYnMsIDApO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBkdXJhdGlvbiByZWxhdGl2ZSB0byBnaXZlbiBzZWdtZW50IGR1cmF0aW9uIG9yIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAbmFtZSBkdXJhdGlvblJlbFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25SZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBvZmZzZXRzIGluIHNlY1xuICAgICAqXG4gICAgICogb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgKiBvZmZzZXQgPCAwOiB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvbiBpcyB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvblxuICAgICAqIGFuZCB0aGUgZHVyYXRpb24gaGFzIHRvIGJlIGNvcnJlY3RlZCBieSB0aGUgb2Zmc2V0XG4gICAgICpcbiAgICAgKiBAbmFtZSBvZmZzZXRBcnJheVxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAZGVmYXVsdCBbMC4wXVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRBcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0QXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgb2Zmc2V0IGluIHNlY1xuICAgICAqIEBuYW1lIG9mZnNldEFic1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgLTAuMDA1XG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm9mZnNldEFicyA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0QWJzLCAtMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogU2VnbWVudCBvZmZzZXQgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEBuYW1lIG9mZnNldFJlbFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMFxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRSZWwgPSBvcHRPckRlZihvcHRpb25zLm9mZnNldFJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBUaW1lIGJ5IHdoaWNoIGFsbCBzZWdtZW50cyBhcmUgZGVsYXllZCAoZXNwZWNpYWxseSB0byByZWFsaXplIHNlZ21lbnQgb2Zmc2V0cylcbiAgICAgKiBAbmFtZSBkZWxheVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQGRlZmF1bHQgMC4wMDVcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuZGVsYXkgPSBvcHRPckRlZihvcHRpb25zLmRlbGF5LCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBhdHRhY2sgdGltZSBpbiBzZWNcbiAgICAgKiBAbmFtZSBhdHRhY2tBYnNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDAuMDA1XG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja0FicyA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrQWJzLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQG5hbWUgYXR0YWNrUmVsXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1JlbCA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAbmFtZSByZWxlYXNlQWJzXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwNVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5yZWxlYXNlQWJzID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlQWJzLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gc2VnbWVudCBkdXJhdGlvblxuICAgICAqIEBuYW1lIHJlbGVhc2VSZWxcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHJlc2FtcGxpbmcgaW4gY2VudFxuICAgICAqIEBuYW1lIHJlc2FtcGxpbmdcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqIEBuYW1lIHJlc2FtcGxpbmdWYXJcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZ1ZhciA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZ1ZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBMaW5lYXIgZ2FpbiBmYWN0b3JcbiAgICAgKiBAbmFtZSBnYWluXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAxXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmdhaW4gPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgLyoqXG4gICAgICogSW5kZXggb2YgdGhlIHNlZ21lbnQgdG8gc3ludGhlc2l6ZSAoaS5lLiBvZiB0aGlzLnBvc2l0aW9uQXJyYXkvZHVyYXRpb25BcnJheS9vZmZzZXRBcnJheSlcbiAgICAgKiBAbmFtZSBzZWdtZW50SW5kZXhcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IDBcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gb3B0T3JEZWYob3B0aW9ucy5zZWdtZW50SW5kZXgsIDApO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBzZWdtZW50IGluZGljZXMgYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICogQG5hbWUgY3ljbGljXG4gICAgICogQHR5cGUge0Jvb2x9XG4gICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgKiBAbWVtYmVyb2YgU2VnbWVudEVuZ2luZVxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gMDtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGxhc3Qgc2VnbWVudCBpcyBhYm9ydGVkIHdoZW4gdHJpZ2dlcmluZyB0aGUgbmV4dFxuICAgICAqIEBuYW1lIG1vbm9waG9uaWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLm1vbm9waG9uaWMgPSBvcHRPckRlZihvcHRpb25zLm1vbm9waG9uaWMsIGZhbHNlKTtcbiAgICB0aGlzLl9fY3VycmVudFNyYyA9IG51bGw7XG4gICAgdGhpcy5fX2N1cnJlbnRFbnYgPSBudWxsO1xuICAgIHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lID0gMDtcbiAgICB0aGlzLl9fY3VycmVudEdhaW4gPSAwO1xuICAgIHRoaXMuX19jdXJyZW50RW5kVGltZSA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBGYWRlLW91dCB0aW1lICh3aGVuIGFib3J0ZWQpXG4gICAgICogQG5hbWUgYWJvcnRUaW1lXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwLjAwNVxuICAgICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5hYm9ydFRpbWUgPSBvcHRPckRlZihvcHRpb25zLmFib3J0VGltZSwgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKiBAbmFtZSB3cmFwQXJvdW5kRXh0ZW5zaW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAZGVmYXVsdCAwXG4gICAgICogQG1lbWJlcm9mIFNlZ21lbnRFbmdpbmVcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqIEBtZW1iZXJvZiBTZWdtZW50RW5naW5lXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZ2V0IGJ1ZmZlckR1cmF0aW9uKCkge1xuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLndyYXBBcm91bmRFeHRlbnNpb24pXG4gICAgICAgIGJ1ZmZlckR1cmF0aW9uIC09IHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbjtcblxuICAgICAgcmV0dXJuIGJ1ZmZlckR1cmF0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgcmV0dXJuIHRpbWUgKyB0aGlzLnRyaWdnZXIodGltZSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG4gICAgdmFyIGN5Y2xpY09mZnNldCA9IDA7XG4gICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXJEdXJhdGlvbjtcblxuICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgdmFyIGN5Y2xlcyA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgIGN5Y2xpY09mZnNldCA9IE1hdGguZmxvb3IoY3ljbGVzKSAqIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgcG9zaXRpb24gLT0gY3ljbGljT2Zmc2V0O1xuICAgIH1cblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4ID0gZ2V0Q3VycmVudE9yTmV4dEluZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPj0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIGN5Y2xpY09mZnNldCArPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNwZWVkIDwgMCkge1xuICAgICAgaW5kZXggPSBnZXRDdXJyZW50T3JQcmV2aW91c0luZGV4KHRoaXMucG9zaXRpb25BcnJheSwgcG9zaXRpb24pO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgIGN5Y2xpY09mZnNldCAtPSBidWZmZXJEdXJhdGlvbjtcblxuICAgICAgICBpZiAoIXRoaXMuY3ljbGljKVxuICAgICAgICAgIHJldHVybiAtSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICB9XG5cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSBjeWNsaWNPZmZzZXQ7XG5cbiAgICByZXR1cm4gY3ljbGljT2Zmc2V0ICsgdGhpcy5wb3NpdGlvbkFycmF5W2luZGV4XTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnNlZ21lbnRJbmRleDtcbiAgICB2YXIgY3ljbGljT2Zmc2V0ID0gdGhpcy5fX2N5Y2xpY09mZnNldDtcblxuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGluZGV4Kys7XG5cbiAgICAgIGlmIChpbmRleCA+PSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgY3ljbGljT2Zmc2V0ICs9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4LS07XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnBvc2l0aW9uQXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgY3ljbGljT2Zmc2V0IC09IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gLUluZmluaXR5O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fX2N5Y2xpY09mZnNldCA9IGN5Y2xpY09mZnNldDtcblxuICAgIHJldHVybiBjeWNsaWNPZmZzZXQgKyB0aGlzLnBvc2l0aW9uQXJyYXlbaW5kZXhdO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBzZWdtZW50LlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQvdHJhbnNwb3J0ZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBzZWdtZW50IGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzZWdtZW50IHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHNlZ21lbnQgc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBwZXJpb2QgdG8gbmV4dCBzZWdtZW50XG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIHNlZ21lbnRUaW1lID0gKHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSArIHRoaXMuZGVsYXk7XG4gICAgdmFyIHNlZ21lbnRQZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgc2VnbWVudEluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBzZWdtZW50UG9zaXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudER1cmF0aW9uID0gMC4wO1xuICAgICAgdmFyIHNlZ21lbnRPZmZzZXQgPSAwLjA7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5jeWNsaWMpXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCAlIHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGg7XG4gICAgICBlbHNlXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNlZ21lbnRJbmRleCwgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDEpKTtcblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMuZHVyYXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMub2Zmc2V0QXJyYXkpXG4gICAgICAgIHNlZ21lbnRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwIHx8IHRoaXMucGVyaW9kUmVsID4gMCkge1xuICAgICAgICB2YXIgbmV4dFNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCArIDE7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24sIG5leHRPZmZzZXQ7XG5cbiAgICAgICAgaWYgKG5leHRTZWdtZW50SW5kZXggPT09IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVswXSArIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IHRoaXMub2Zmc2V0QXJyYXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5leHRQb3NpdGlvbiA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgICAgbmV4dE9mZnNldCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMucG9zaXRpb25BcnJheVtuZXh0U2VnbWVudEluZGV4XTtcbiAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVtuZXh0U2VnbWVudEluZGV4XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbnRlclNlZ21lbnREaXN0YW5jZSA9IG5leHRQb3NpdGlvbiAtIHNlZ21lbnRQb3NpdGlvbjtcblxuICAgICAgICAvLyBjb3JyZWN0IGludGVyLXNlZ21lbnQgZGlzdGFuY2UgYnkgb2Zmc2V0c1xuICAgICAgICAvLyAgIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICAgIGlmIChzZWdtZW50T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSAtPSBzZWdtZW50T2Zmc2V0O1xuXG4gICAgICAgIGlmIChuZXh0T2Zmc2V0ID4gMClcbiAgICAgICAgICBpbnRlclNlZ21lbnREaXN0YW5jZSArPSBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIGlmIChpbnRlclNlZ21lbnREaXN0YW5jZSA8IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgPSAwO1xuXG4gICAgICAgIC8vIHVzZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlIGluc3RlYWQgb2Ygc2VnbWVudCBkdXJhdGlvblxuICAgICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwKVxuICAgICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IGludGVyU2VnbWVudERpc3RhbmNlO1xuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSBwZXJpb2QgcmVsYXRpdmUgdG8gaW50ZXIgbWFya2VyIGRpc3RhbmNlXG4gICAgICAgIHNlZ21lbnRQZXJpb2QgKz0gdGhpcy5wZXJpb2RSZWwgKiBpbnRlclNlZ21lbnREaXN0YW5jZTtcbiAgICAgIH1cblxuICAgICAgLy8gYWRkIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBzZWdtZW50IGR1cmF0aW9uXG4gICAgICBzZWdtZW50RHVyYXRpb24gKj0gdGhpcy5kdXJhdGlvblJlbDtcbiAgICAgIHNlZ21lbnREdXJhdGlvbiArPSB0aGlzLmR1cmF0aW9uQWJzO1xuXG4gICAgICAvLyBhZGQgcmVsYXRpdmUgYW5kIGFic29sdXRlIHNlZ21lbnQgb2Zmc2V0XG4gICAgICBzZWdtZW50T2Zmc2V0ICo9IHRoaXMub2Zmc2V0UmVsO1xuICAgICAgc2VnbWVudE9mZnNldCArPSB0aGlzLm9mZnNldEFicztcblxuICAgICAgLy8gYXBwbHkgc2VnbWVudCBvZmZzZXRcbiAgICAgIC8vICAgb2Zmc2V0ID4gMDogdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gaXMgYWZ0ZXIgdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb25cbiAgICAgIC8vICAgb2Zmc2V0IDwgMDogdGhlIGdpdmVuIHNlZ21lbnQgcG9zaXRpb24gaXMgdGhlIHNlZ21lbnQncyByZWZlcmVuY2UgcG9zaXRpb24gYW5kIHRoZSBkdXJhdGlvbiBoYXMgdG8gYmUgY29ycmVjdGVkIGJ5IHRoZSBvZmZzZXRcbiAgICAgIGlmIChzZWdtZW50T2Zmc2V0IDwgMCkge1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gLT0gc2VnbWVudE9mZnNldDtcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uICs9IHNlZ21lbnRPZmZzZXQ7XG4gICAgICAgIHNlZ21lbnRUaW1lICs9IChzZWdtZW50T2Zmc2V0IC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudFRpbWUgLT0gKHNlZ21lbnRPZmZzZXQgLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBzZWdtZW50IHBvc2l0aW9uXG4gICAgICBpZiAodGhpcy5wb3NpdGlvblZhciA+IDApXG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICAvLyBzaG9ydGVuIGR1cmF0aW9uIG9mIHNlZ21lbnRzIG92ZXIgdGhlIGVkZ2VzIG9mIHRoZSBidWZmZXJcbiAgICAgIGlmIChzZWdtZW50UG9zaXRpb24gPCAwKSB7XG4gICAgICAgIC8vc2VnbWVudFRpbWUgLT0gZ3JhaW5Qb3NpdGlvbjsgaG0sIG5vdCBzdXJlIGlmIHdlIHdhbnQgdG8gZG8gdGhpc1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gKz0gc2VnbWVudFBvc2l0aW9uO1xuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VnbWVudFBvc2l0aW9uICsgc2VnbWVudER1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gc2VnbWVudFBvc2l0aW9uO1xuXG4gICAgICBzZWdtZW50RHVyYXRpb24gLz0gcmVzYW1wbGluZ1JhdGU7XG5cbiAgICAgIGlmICh0aGlzLm1vbm9waG9uaWMpXG4gICAgICAgIHRoaXMuYWJvcnQoc2VnbWVudFRpbWUpO1xuXG4gICAgICAvLyBtYWtlIHNlZ21lbnRcbiAgICAgIGlmICh0aGlzLmdhaW4gPiAwICYmIHNlZ21lbnREdXJhdGlvbiA+IDApIHtcbiAgICAgICAgLy8gbWFrZSBzZWdtZW50IGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZSA9IHRoaXMucmVsZWFzZUFicyArIHRoaXMucmVsZWFzZVJlbCAqIHNlZ21lbnREdXJhdGlvbjtcblxuICAgICAgICBpZiAoYXR0YWNrICsgcmVsZWFzZSA+IHNlZ21lbnREdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBzZWdtZW50RHVyYXRpb24gLyAoYXR0YWNrICsgcmVsZWFzZSk7XG4gICAgICAgICAgYXR0YWNrICo9IGZhY3RvcjtcbiAgICAgICAgICByZWxlYXNlICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdHRhY2tFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBhdHRhY2s7XG4gICAgICAgIHZhciBzZWdtZW50RW5kVGltZSA9IHNlZ21lbnRUaW1lICsgc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZVN0YXJ0VGltZSA9IHNlZ21lbnRFbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLnZhbHVlID0gMDtcbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjAsIHNlZ21lbnRUaW1lKTtcbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmdhaW4sIGF0dGFja0VuZFRpbWUpO1xuXG4gICAgICAgIGlmIChyZWxlYXNlU3RhcnRUaW1lID4gYXR0YWNrRW5kVGltZSlcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgcmVsZWFzZVN0YXJ0VGltZSk7XG5cbiAgICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLjAsIHNlZ21lbnRFbmRUaW1lKTtcbiAgICAgICAgZW52ZWxvcGUuY29ubmVjdCh0aGlzLm91dHB1dE5vZGUpO1xuXG4gICAgICAgIHRoaXMuX19jdXJyZW50RW52ID0gZW52ZWxvcGU7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChzZWdtZW50VGltZSwgc2VnbWVudFBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3Aoc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb24pO1xuXG4gICAgICAgIHRoaXMuX19jdXJyZW50U3JjID0gc291cmNlO1xuICAgICAgICB0aGlzLl9fcmVsZWFzZVN0YXJ0VGltZSA9IHJlbGVhc2VTdGFydFRpbWU7XG4gICAgICAgIHRoaXMuX19jdXJyZW50R2FpbiA9IHRoaXMuZ2FpbjtcbiAgICAgICAgdGhpcy5fX2N1cnJlbnRFbmRUaW1lID0gc2VnbWVudEVuZFRpbWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gZ3JhaW4gcGVyaW9kIHJhbmRvbiB2YXJpYXRpb25cbiAgICBpZiAodGhpcy5wZXJpb2RWYXIgPiAwLjApXG4gICAgICBzZWdtZW50UGVyaW9kICs9IDIuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIHRoaXMucGVyaW9kVmFyICogZ3JhaW5QZXJpb2Q7XG5cbiAgICByZXR1cm4gTWF0aC5tYXgodGhpcy5wZXJpb2RNaW4sIHNlZ21lbnRQZXJpb2QpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFib3J0IHRoZSBjdXJyZW50IHNlZ21lbnQgYXQgZ2l2ZW4gdGltZSwgZmFkZSBvdXQgZHVyYXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgLSBhYm9ydCB0aW1lXG4gICAqL1xuICBhYm9ydCh0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgZW5kVGltZSA9IHRoaXMuX19jdXJyZW50RW5kVGltZTtcbiAgICBjb25zdCBhYm9ydFRpbWUgPSB0aW1lIHx8IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcblxuICAgIGlmIChhYm9ydFRpbWUgPCBlbmRUaW1lKSB7XG4gICAgICBjb25zdCBzZWdtZW50RW5kVGltZSA9IE1hdGgubWluKGFib3J0VGltZSArIHRoaXMuYWJvcnRUaW1lLCBlbmRUaW1lKTtcbiAgICAgIGNvbnN0IGVudmVsb3BlID0gdGhpcy5fX2N1cnJlbnRFbnY7XG4gICAgICBsZXQgY3VycmVudEdhaW5WYWx1ZSA9IHRoaXMuX19jdXJyZW50R2FpbjtcblxuICAgICAgaWYgKGFib3J0VGltZSA+IHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lKSB7XG4gICAgICAgIGNvbnN0IHJlbGVhc2VTdGFydCA9IHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lO1xuICAgICAgICBjdXJyZW50R2FpblZhbHVlICo9IChhYm9ydFRpbWUgLSByZWxlYXNlU3RhcnQpIC8gKGVuZFRpbWUgLSByZWxlYXNlU3RhcnQpO1xuICAgICAgfVxuXG4gICAgICBlbnZlbG9wZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhYm9ydFRpbWUpO1xuICAgICAgZW52ZWxvcGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShjdXJyZW50R2FpblZhbHVlLCBhYm9ydFRpbWUpO1xuICAgICAgZW52ZWxvcGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBzZWdtZW50RW5kVGltZSk7XG5cbiAgICAgIHRoaXMuX19jdXJyZW50U3JjID0gbnVsbDtcbiAgICAgIHRoaXMuX19jdXJyZW50RW52ID0gbnVsbDtcbiAgICAgIHRoaXMuX19yZWxlYXNlU3RhcnRUaW1lID0gMDtcbiAgICAgIHRoaXMuX19jdXJyZW50R2FpbiA9IDA7XG4gICAgICB0aGlzLl9fY3VycmVudEVuZFRpbWUgPSAwO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTZWdtZW50RW5naW5lO1xuIiwiLy8gY29yZVxuZXhwb3J0IHsgZGVmYXVsdCBhcyBhdWRpb0NvbnRleHQgfSBmcm9tICcuL2NvcmUvYXVkaW9Db250ZXh0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXVkaW9UaW1lRW5naW5lIH0gZnJvbSAnLi9jb3JlL0F1ZGlvVGltZUVuZ2luZSc7XG5cbi8vIGVuZ2luZXNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgR3JhbnVsYXJFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvR3JhbnVsYXJFbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNZXRyb25vbWUgfSBmcm9tICcuL2VuZ2luZXMvTWV0cm9ub21lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxheWVyRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL1BsYXllckVuZ2luZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNlZ21lbnRFbmdpbmUgfSBmcm9tICcuL2VuZ2luZXMvU2VnbWVudEVuZ2luZSc7XG5cbi8vIG1hc3RlcnNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxheUNvbnRyb2wgfSBmcm9tICcuL21hc3RlcnMvUGxheUNvbnRyb2wnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUcmFuc3BvcnQgfSBmcm9tICcuL21hc3RlcnMvVHJhbnNwb3J0JztcblxuLy8gZmFjdG9yaWVzXG5leHBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL21hc3RlcnMvZmFjdG9yaWVzJztcbmV4cG9ydCB7IGdldFNpbXBsZVNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9mYWN0b3JpZXMnO1xuIiwiaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpb0NvbnRleHQnO1xuaW1wb3J0IHsgZ2V0U2NoZWR1bGVyIH0gZnJvbSAnLi9mYWN0b3JpZXMnO1xuaW1wb3J0ICogYXMgbWFzdGVycyBmcm9tICd3YXZlcy1tYXN0ZXJzJztcblxuLyoqXG4gKiBFeHRlbmRzIFRpbWUgRW5naW5lIHRvIHByb3ZpZGUgcGxheWJhY2sgY29udHJvbCBvZiBhIFRpbWUgRW5naW5lIGluc3RhbmNlLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvcGxheS1jb250cm9sLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgVGltZUVuZ2luZVxuICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBlbmdpbmUgdG8gY29udHJvbFxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBhdWRpbyBmcm9tICd3YXZlcy1hdWRpbyc7XG4gKiBjb25zdCBwbGF5ZXJFbmdpbmUgPSBhdWRpby5QbGF5ZXJFbmdpbmUoKTtcbiAqIGNvbnN0IHBsYXlDb250cm9sID0gbmV3IGF1ZGlvLlBsYXlDb250cm9sKHBsYXllckVuZ2luZSk7XG4gKlxuICogcGxheUNvbnRyb2wuc3RhcnQoKTtcbiAqL1xuY2xhc3MgUGxheUNvbnRyb2wgZXh0ZW5kcyBtYXN0ZXJzLlBsYXlDb250cm9sIHtcbiAgY29uc3RydWN0b3IoZW5naW5lLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBhdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fMKgZGVmYXVsdEF1ZGlvQ29udGV4dDtcbiAgICBjb25zdCBzY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIoYXVkaW9Db250ZXh0KTtcblxuICAgIHN1cGVyKHNjaGVkdWxlciwgZW5naW5lLCBvcHRpb25zKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gYXVkaW9Db250ZXh0O1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlDb250cm9sO1xuIiwiaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpb0NvbnRleHQnO1xuaW1wb3J0IHsgZ2V0U2NoZWR1bGVyIH0gZnJvbSAnLi9mYWN0b3JpZXMnO1xuaW1wb3J0ICogYXMgbWFzdGVycyBmcm9tICd3YXZlcy1tYXN0ZXJzJztcblxuLyoqXG4gKiBQcm92aWRlcyBzeW5jaHJvbml6ZWQgc2NoZWR1bGluZyBvZiBUaW1lIEVuZ2luZSBpbnN0YW5jZXMuXG4gKlxuICogW2V4YW1wbGVde0BsaW5rIGh0dHBzOi8vcmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLWF1ZGlvL21hc3Rlci9leGFtcGxlcy90cmFuc3BvcnQuaHRtbH1cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICogY29uc3QgdHJhbnNwb3J0ID0gbmV3IGF1ZGlvLlRyYW5zcG9ydCgpO1xuICogY29uc3QgcGxheUNvbnRyb2wgPSBuZXcgYXVkaW8uUGxheUNvbnRyb2wodHJhbnNwb3J0KTtcbiAqIGNvbnN0IG15RW5naW5lID0gbmV3IE15RW5naW5lKCk7XG4gKiBjb25zdCB5b3VyRW5naW5lID0gbmV3IHlvdXJFbmdpbmUoKTtcbiAqXG4gKiB0cmFuc3BvcnQuYWRkKG15RW5naW5lKTtcbiAqIHRyYW5zcG9ydC5hZGQoeW91ckVuZ2luZSk7XG4gKlxuICogcGxheUNvbnRyb2wuc3RhcnQoKTtcbiAqL1xuY2xhc3MgVHJhbnNwb3J0IGV4dGVuZHMgbWFzdGVycy5UcmFuc3BvcnQge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBhdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fMKgZGVmYXVsdEF1ZGlvQ29udGV4dDtcbiAgICBjb25zdCBzY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIoYXVkaW9Db250ZXh0KTtcbiAgICBzdXBlcihzY2hlZHVsZXIsIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVHJhbnNwb3J0O1xuIiwiaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpb0NvbnRleHQnO1xuaW1wb3J0IHsgU2NoZWR1bGVyLCBTaW1wbGVTY2hlZHVsZXIgfSBmcm9tICd3YXZlcy1tYXN0ZXJzJztcblxuY29uc3Qgc2NoZWR1bGVyTWFwID0gbmV3IE1hcCgpO1xuY29uc3Qgc2ltcGxlU2NoZWR1bGVyTWFwID0gbmV3IE1hcCgpO1xuXG4vKipcbiAqIFJldHVybnMgYSB1bmlxdWUgaW5zdGFuY2Ugb2YgYFNjaGVkdWxlcmBcbiAqXG4gKiBAZ2xvYmFsXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtTY2hlZHVsZXJ9XG4gKiBAc2VlIFNjaGVkdWxlclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NoZWR1bGVyKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgbGV0IHNjaGVkdWxlciA9IHNjaGVkdWxlck1hcC5nZXQoYXVkaW9Db250ZXh0KTtcblxuICBpZiAoIXNjaGVkdWxlcikge1xuICAgIGNvbnN0IGdldFRpbWVGdW5jdGlvbiA9ICgpID0+IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICBzY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKGdldFRpbWVGdW5jdGlvbik7XG5cbiAgICBzY2hlZHVsZXJNYXAuc2V0KGF1ZGlvQ29udGV4dCwgc2NoZWR1bGVyKTtcbiAgfVxuXG4gIHJldHVybiBzY2hlZHVsZXI7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSB1bmlxdWUgaW5zdGFuY2Ugb2YgYFNpbXBsZVNjaGVkdWxlcmBcbiAqXG4gKiBAZ2xvYmFsXG4gKiBAZnVuY3Rpb25cbiAqIEByZXR1cm5zIHtTaW1wbGVTY2hlZHVsZXJ9XG4gKiBAc2VlIFNpbXBsZVNjaGVkdWxlclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2ltcGxlU2NoZWR1bGVyKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgbGV0IHNpbXBsZVNjaGVkdWxlciA9IHNpbXBsZVNjaGVkdWxlck1hcC5nZXQoYXVkaW9Db250ZXh0KTtcblxuICBpZiAoIXNpbXBsZVNjaGVkdWxlcikge1xuICAgIGNvbnN0IGdldFRpbWVGdW5jdGlvbiA9ICgpID0+IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICBzaW1wbGVTY2hlZHVsZXIgPSBuZXcgU2ltcGxlU2NoZWR1bGVyKGdldFRpbWVGdW5jdGlvbik7XG5cbiAgICBzaW1wbGVTY2hlZHVsZXJNYXAuc2V0KGF1ZGlvQ29udGV4dCwgc2ltcGxlU2NoZWR1bGVyKTtcbiAgfVxuXG4gIHJldHVybiBzaW1wbGVTY2hlZHVsZXI7XG59O1xuIiwiaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuaW1wb3J0ICogYXMgbG9hZGVycyBmcm9tICd3YXZlcy1sb2FkZXJzJztcbmltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ0BpcmNhbS9iYXNpYy1jb250cm9sbGVycyc7XG5cbmNvbnRyb2xsZXJzLnNldFRoZW1lKCdkYXJrJyk7XG5jb25zdCBhdWRpb0NvbnRleHQgPSBhdWRpby5hdWRpb0NvbnRleHQ7XG5jb25zdCBjb250YWluZXIgPSAnLmNvbnRyb2xsZXJzJztcblxuLy8gZ2V0IHNjaGVkdWxlciBhbmQgY3JlYXRlIHNjaGVkdWxlZCBtZXRyb25vbWVcbmNvbnN0IHNjaGVkdWxlciA9IGF1ZGlvLmdldFNjaGVkdWxlcigpO1xuY29uc3Qgc2NoZWR1bGVkTWV0cm9ub21lID0gbmV3IGF1ZGlvLk1ldHJvbm9tZSgpO1xuc2NoZWR1bGVkTWV0cm9ub21lLnBlcmlvZCA9IDYwIC8gOTA7XG5zY2hlZHVsZWRNZXRyb25vbWUuY2xpY2tGcmVxID0gNjY2O1xuc2NoZWR1bGVkTWV0cm9ub21lLmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcblxuLy8gY3JlYXRlIHRyYW5zcG9ydCB3aXRoIHBsYXkgY29udHJvbCBhbmQgdHJhbnNwb3J0ZWQgbWV0cm9ub21lXG5jb25zdCB0cmFuc3BvcnRlZE1ldHJvbm9tZSA9IG5ldyBhdWRpby5NZXRyb25vbWUoKTtcbnRyYW5zcG9ydGVkTWV0cm9ub21lLnBlcmlvZCA9IDYwIC8gOTA7XG50cmFuc3BvcnRlZE1ldHJvbm9tZS5jbGlja0ZyZXEgPSA1MDA7XG50cmFuc3BvcnRlZE1ldHJvbm9tZS5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG5jb25zdCBwbGF5Q29udHJvbCA9IG5ldyBhdWRpby5QbGF5Q29udHJvbCh0cmFuc3BvcnRlZE1ldHJvbm9tZSk7XG5cbi8vIGNyZWF0ZSBHVUkgZWxlbWVudHNcbm5ldyBjb250cm9sbGVycy5UaXRsZSh7XG4gIGxhYmVsOiAnTWV0cm9ub21lIGluIFNjaGVkdWxlcicsXG4gIGNvbnRhaW5lcjogY29udGFpbmVyLFxufSk7XG5cbm5ldyBjb250cm9sbGVycy5Ub2dnbGUoe1xuICBsYWJlbDogJ0VuYWJsZScsXG4gIGRlZmF1bHQ6IGZhbHNlLFxuICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgY2FsbGJhY2s6IHZhbHVlID0+IHtcbiAgICBpZiAodmFsdWUpXG4gICAgICBzY2hlZHVsZXIuYWRkKHNjaGVkdWxlZE1ldHJvbm9tZSk7XG4gICAgZWxzZVxuICAgICAgc2NoZWR1bGVyLnJlbW92ZShzY2hlZHVsZWRNZXRyb25vbWUpO1xuICB9XG59KTtcblxubmV3IGNvbnRyb2xsZXJzLlNsaWRlcih7XG4gIGxhYmVsOiAnVGVtcG8nLFxuICBtaW46IDMwLFxuICBtYXg6IDI0MCxcbiAgc3RlcDogMSxcbiAgZGVmYXVsdDogOTAsXG4gIHVuaXQ6ICdicG0nLFxuICBzaXplOiAnbGFyZ2UnLFxuICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgY2FsbGJhY2s6IHZhbHVlID0+IHtcbiAgICBzY2hlZHVsZWRNZXRyb25vbWUucGVyaW9kID0gNjAgLyB2YWx1ZTtcbiAgfVxufSk7XG5cbm5ldyBjb250cm9sbGVycy5UaXRsZSh7XG4gIGxhYmVsOiAnTWV0cm9ub21lIHdpdGggUGxheSBDb250cm9sJyxcbiAgY29udGFpbmVyOiBjb250YWluZXIsXG59KTtcblxubmV3IGNvbnRyb2xsZXJzLlRvZ2dsZSh7XG4gIGxhYmVsOiAnUGxheScsXG4gIGRlZmF1bHQ6IGZhbHNlLFxuICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgY2FsbGJhY2s6IHZhbHVlID0+IHtcbiAgICBpZiAodmFsdWUpXG4gICAgICBwbGF5Q29udHJvbC5zdGFydCgpO1xuICAgIGVsc2VcbiAgICAgIHBsYXlDb250cm9sLnN0b3AoKTtcbiAgfVxufSk7XG5cbmNvbnN0IHNwZWVkU2xpZGVyID0gbmV3IGNvbnRyb2xsZXJzLlNsaWRlcih7XG4gIGxhYmVsOiAnU3BlZWQnLFxuICBtaW46IDAsXG4gIG1heDogMixcbiAgc3RlcDogMC4wMSxcbiAgZGVmYXVsdDogMSxcbiAgc2l6ZTogJ2xhcmdlJyxcbiAgY29udGFpbmVyOiBjb250YWluZXIsXG4gIGNhbGxiYWNrOiB2YWx1ZSA9PiB7XG4gICAgcGxheUNvbnRyb2wuc3BlZWQgPSB2YWx1ZTtcbiAgICBzcGVlZFNsaWRlci52YWx1ZSA9IHBsYXlDb250cm9sLnNwZWVkO1xuICB9XG59KTtcblxubmV3IGNvbnRyb2xsZXJzLlNsaWRlcih7XG4gIGxhYmVsOiAnVGVtcG8nLFxuICBtaW46IDMwLFxuICBtYXg6IDI0MCxcbiAgc3RlcDogMSxcbiAgZGVmYXVsdDogOTAsXG4gIHVuaXQ6ICdicG0nLFxuICBzaXplOiAnbGFyZ2UnLFxuICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgY2FsbGJhY2s6IHZhbHVlID0+IHtcbiAgICB0cmFuc3BvcnRlZE1ldHJvbm9tZS5wZXJpb2QgPSA2MCAvIHZhbHVlO1xuICB9XG59KTtcblxubmV3IGNvbnRyb2xsZXJzLlNsaWRlcih7XG4gIGxhYmVsOiAnUGhhc2UnLFxuICBtaW46IDAsXG4gIG1heDogMSxcbiAgc3RlcDogMC4wMSxcbiAgZGVmYXVsdDogMCxcbiAgc2l6ZTogJ2xhcmdlJyxcbiAgY29udGFpbmVyOiBjb250YWluZXIsXG4gIGNhbGxiYWNrOiB2YWx1ZSA9PiB7XG4gICAgdHJhbnNwb3J0ZWRNZXRyb25vbWUucGhhc2UgPSB2YWx1ZTtcbiAgfVxufSk7XG4iLCIvKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVyICovXG5cbmNvbnN0IHR5cGVDb3VudGVycyA9IHt9O1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgdG8gY3JlYXRlIG5ldyBjb250cm9sbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIFN0cmluZyBkZXNjcmliaW5nIHRoZSB0eXBlIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRzIC0gRGVmYXVsdCBwYXJhbWV0ZXJzIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIFVzZXIgZGVmaW5lZCBjb25maWd1cmF0aW9uIG9wdGlvbnMuXG4gKi9cbmNsYXNzIEJhc2VDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcih0eXBlLCBkZWZhdWx0cywgY29uZmlnID0ge30pIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICAvLyBoYW5kbGUgaWRcbiAgICBpZiAoIXR5cGVDb3VudGVyc1t0eXBlXSlcbiAgICAgIHR5cGVDb3VudGVyc1t0eXBlXSA9IDA7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmlkKSB7XG4gICAgICB0aGlzLmlkID0gYCR7dHlwZX0tJHt0eXBlQ291bnRlcnNbdHlwZV19YDtcbiAgICAgIHR5cGVDb3VudGVyc1t0eXBlXSArPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmlkID0gdGhpcy5wYXJhbXMuaWQ7XG4gICAgfVxuXG4gICAgdGhpcy5fbGlzdGVuZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2dyb3VwTGlzdGVuZXJzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gcmVnaXN0ZXIgY2FsbGJhY2sgaWYgZ2l2ZW5cbiAgICBpZiAodGhpcy5wYXJhbXMuY2FsbGJhY2spXG4gICAgICB0aGlzLmFkZExpc3RlbmVyKHRoaXMucGFyYW1zLmNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBsaXN0ZW5lciB0byB0aGUgY29udHJvbGxlci5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBiZSBhcHBsaWVkIHdoZW4gdGhlIGNvbnRyb2xsZXJcbiAgICogIHN0YXRlIGNoYW5nZS5cbiAgICovXG4gIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fbGlzdGVuZXJzLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBsaXN0ZW5lciBpcyBhZGRlZCBmcm9tIGEgY29udGFpbmluZyBncm91cC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRHcm91cExpc3RlbmVyKGlkLCBjYWxsSWQsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFjYWxsSWQpXG4gICAgICB0aGlzLmFkZExpc3RlbmVyKGNhbGxiYWNrKTtcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuX2dyb3VwTGlzdGVuZXJzLmFkZCh7IGNhbGxJZCwgY2FsbGJhY2sgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIGxpc3RlbmVyIGZyb20gdGhlIGNvbnRyb2xsZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gcmVtb3ZlIGZyb20gdGhlIGxpc3RlbmVycy5cbiAgICogQHByaXZhdGVcbiAgICogQHRvZG8gLSByZWV4cG9zZSB3aGVuIGBjb250YWluZXJgIGNhbiBvdmVycmlkZSB0aGlzIG1ldGhvZC4uLlxuICAgKi9cbiAgLy8gcmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgLy8gICB0aGlzLl9saXN0ZW5lcnMucmVtb3ZlKGNhbGxiYWNrKTtcbiAgLy8gfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBleGVjdXRlTGlzdGVuZXJzKC4uLnZhbHVlcykge1xuICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2soLi4udmFsdWVzKSk7XG5cbiAgICB0aGlzLl9ncm91cExpc3RlbmVycy5mb3JFYWNoKChwYXlsb2FkKSA9PiB7XG4gICAgICBjb25zdCB7IGNhbGxiYWNrLCBjYWxsSWQgfSA9IHBheWxvYWQ7XG4gICAgICBjYWxsYmFjayhjYWxsSWQsIC4uLnZhbHVlcyk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZUNvbXBvbmVudDtcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vQmFzZUNvbXBvbmVudCc7XG5pbXBvcnQgZGlzcGxheSBmcm9tICcuLi9taXhpbnMvZGlzcGxheSc7XG5cbmNvbnN0IEF1ZGlvQ29udGV4dCA9ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICdEcmFnIGFuZCBkcm9wIGF1ZGlvIGZpbGVzJyxcbiAgbGFiZWxQcm9jZXNzOiAncHJvY2Vzcy4uLicsXG4gIGF1ZGlvQ29udGV4dDogbnVsbCxcbiAgY29udGFpbmVyOiBudWxsLFxuICBjYWxsYmFjazogbnVsbCxcbn07XG5cbi8qKlxuICogRHJhZyBhbmQgZHJvcCB6b25lIGZvciBhdWRpbyBmaWxlcyByZXR1cm5pbmcgYEF1ZGlvQnVmZmVyYHMgYW5kL29yIEpTT05cbiAqIGRlc2NyaXB0b3IgZGF0YS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IFtjb25maWcubGFiZWw9J0RyYWcgYW5kIGRyb3AgYXVkaW8gZmlsZXMnXSAtIExhYmVsIG9mIHRoZVxuICogIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gW2NvbmZpZy5sYWJlbFByb2Nlc3M9J3Byb2Nlc3MuLi4nXSAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyXG4gKiAgd2hpbGUgYXVkaW8gZmlsZXMgYXJlIGRlY29kZWQuXG4gKiBAcGFyYW0ge0F1ZGlvQ29udGV4dH0gW2NvbmZpZy5hdWRpb0NvbnRleHQ9bnVsbF0gLSBPcHRpb25uYWwgYXVkaW8gY29udGV4dFxuICogIHRvIHVzZSBpbiBvcmRlciB0byBkZWNvZGUgYXVkaW8gZmlsZXMuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29uZmlnLmNhbGxiYWNrPW51bGxdIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGVcbiAqICB2YWx1ZSBjaGFuZ2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdiYXNpYy1jb250cm9sbGVycyc7XG4gKlxuICogY29uc3QgZHJhZ0FuZERyb3AgPSBuZXcgY29udHJvbGxlcnMuRHJhZ0FuZERyb3Aoe1xuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6IChyZXN1bHRzKSA9PiBjb25zb2xlLmxvZyhyZXN1bHRzKSxcbiAqIH0pO1xuICovXG5jbGFzcyBEcmFnQW5kRHJvcCBleHRlbmRzIGRpc3BsYXkoQmFzZUNvbXBvbmVudCkge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoJ2RyYWctYW5kLWRyb3AnLCBkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmF1ZGlvQ29udGV4dClcbiAgICAgIHRoaXMucGFyYW1zLmF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxhc3QgcmVzdWx0c1xuICAgKiBAdHlwZSB7T2JqZWN0PFN0cmluZywgQXVkaW9CdWZmZXJ8SlNPTj59XG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGxhYmVsIH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPGRpdiBjbGFzcz1cImRyb3Atem9uZVwiPlxuICAgICAgICA8cCBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3A+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGRyb3Bab25lID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmRyb3Atem9uZScpO1xuICAgIHRoaXMuJGxhYmVsID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmxhYmVsJyk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLiRkcm9wWm9uZS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB0aGlzLiRkcm9wWm9uZS5jbGFzc0xpc3QuYWRkKCdkcmFnJyk7XG4gICAgICBlLmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gJ2NvcHknO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHRoaXMuJGRyb3Bab25lLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB0aGlzLiRkcm9wWm9uZS5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnJyk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kZHJvcFpvbmUuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICBjb25zdCBmaWxlcyA9IEFycmF5LmZyb20oZS5kYXRhVHJhbnNmZXIuZmlsZXMpO1xuICAgICAgY29uc3QgYXVkaW9GaWxlcyA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgICAgICBpZiAoL15hdWRpby8udGVzdChmaWxlLnR5cGUpKSB7XG4gICAgICAgICAgZmlsZS5zaG9ydFR5cGUgPSAnYXVkaW8nO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKC9qc29uJC8udGVzdChmaWxlLnR5cGUpKSB7XG4gICAgICAgICAgZmlsZS5zaG9ydFR5cGUgPSAnanNvbic7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcmVzdWx0cyA9IHt9O1xuICAgICAgbGV0IGNvdW50ZXIgPSAwO1xuXG4gICAgICB0aGlzLiRsYWJlbC50ZXh0Q29udGVudCA9IHRoaXMucGFyYW1zLmxhYmVsUHJvY2VzcztcblxuICAgICAgY29uc3QgdGVzdEVuZCA9ICgpID0+IHtcbiAgICAgICAgY291bnRlciArPSAxO1xuXG4gICAgICAgIGlmIChjb3VudGVyID09PSBhdWRpb0ZpbGVzLmxlbmd0aCnCoHtcbiAgICAgICAgICB0aGlzLl92YWx1ZSA9IHJlc3VsdHNcbiAgICAgICAgICB0aGlzLmV4ZWN1dGVMaXN0ZW5lcnMocmVzdWx0cyk7XG5cbiAgICAgICAgICB0aGlzLiRkcm9wWm9uZS5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnJyk7XG4gICAgICAgICAgdGhpcy4kbGFiZWwudGV4dENvbnRlbnQgPSB0aGlzLnBhcmFtcy5sYWJlbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmaWxlcy5mb3JFYWNoKChmaWxlLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZSkgPT4ge1xuICAgICAgICAgIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2pzb24nKSB7XG4gICAgICAgICAgICByZXN1bHRzW2ZpbGUubmFtZV0gPSBKU09OLnBhcnNlKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgICAgICAgICB0ZXN0RW5kKCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgICAgdGhpcy5wYXJhbXMuYXVkaW9Db250ZXh0XG4gICAgICAgICAgICAgIC5kZWNvZGVBdWRpb0RhdGEoZS50YXJnZXQucmVzdWx0KVxuICAgICAgICAgICAgICAudGhlbigoYXVkaW9CdWZmZXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2ZpbGUubmFtZV0gPSBhdWRpb0J1ZmZlcjtcbiAgICAgICAgICAgICAgICB0ZXN0RW5kKCk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tmaWxlLm5hbWVdID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0ZXN0RW5kKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2pzb24nKVxuICAgICAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xuICAgICAgICBlbHNlIGlmIChmaWxlLnNob3J0VHlwZSA9PT0gJ2F1ZGlvJylcbiAgICAgICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZSk7XG4gICAgICB9KTtcbiAgICB9LCBmYWxzZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRHJhZ0FuZERyb3A7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuaW1wb3J0IGNvbnRhaW5lciBmcm9tICcuLi9taXhpbnMvY29udGFpbmVyJztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxlZ2VuZDogJyZuYnNwOycsXG4gIGRlZmF1bHQ6ICdvcGVuZWQnLFxuICBjb250YWluZXI6IG51bGwsXG59O1xuXG4vKipcbiAqIEdyb3VwIG9mIGNvbnRyb2xsZXJzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGdyb3VwLlxuICogQHBhcmFtIHsnb3BlbmVkJ3wnY2xvc2VkJ30gW2NvbmZpZy5kZWZhdWx0PSdvcGVuZWQnXSAtIERlZmF1bHQgc3RhdGUgb2YgdGhlXG4gKiAgZ3JvdXAuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiAvLyBjcmVhdGUgYSBncm91cFxuICogY29uc3QgZ3JvdXAgPSBuZXcgY29udHJvbGxlcnMuR3JvdXAoe1xuICogICBsYWJlbDogJ0dyb3VwJyxcbiAqICAgZGVmYXVsdDogJ29wZW5lZCcsXG4gKiAgIGNvbnRhaW5lcjogJyNjb250YWluZXInXG4gKiB9KTtcbiAqXG4gKiAvLyBpbnNlcnQgY29udHJvbGxlcnMgaW4gdGhlIGdyb3VwXG4gKiBjb25zdCBncm91cFNsaWRlciA9IG5ldyBjb250cm9sbGVycy5TbGlkZXIoe1xuICogICBsYWJlbDogJ0dyb3VwIFNsaWRlcicsXG4gKiAgIG1pbjogMjAsXG4gKiAgIG1heDogMTAwMCxcbiAqICAgc3RlcDogMSxcbiAqICAgZGVmYXVsdDogMjAwLFxuICogICB1bml0OiAnSHonLFxuICogICBzaXplOiAnbGFyZ2UnLFxuICogICBjb250YWluZXI6IGdyb3VwLFxuICogICBjYWxsYmFjazogKHZhbHVlKSA9PiBjb25zb2xlLmxvZyh2YWx1ZSksXG4gKiB9KTtcbiAqXG4gKiBjb25zdCBncm91cFRleHQgPSBuZXcgY29udHJvbGxlcnMuVGV4dCh7XG4gKiAgIGxhYmVsOiAnR3JvdXAgVGV4dCcsXG4gKiAgIGRlZmF1bHQ6ICd0ZXh0IGlucHV0JyxcbiAqICAgcmVhZG9ubHk6IGZhbHNlLFxuICogICBjb250YWluZXI6IGdyb3VwLFxuICogICBjYWxsYmFjazogKHZhbHVlKSA9PiBjb25zb2xlLmxvZyh2YWx1ZSksXG4gKiB9KTtcbiAqL1xuY2xhc3MgR3JvdXAgZXh0ZW5kcyBjb250YWluZXIoZGlzcGxheShCYXNlQ29tcG9uZW50KSkge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcignZ3JvdXAnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIHRoaXMuX3N0YXRlcyA9IFsnb3BlbmVkJywgJ2Nsb3NlZCddO1xuXG4gICAgaWYgKHRoaXMuX3N0YXRlcy5pbmRleE9mKHRoaXMucGFyYW1zLmRlZmF1bHQpID09PSAtMSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzdGF0ZSBcIiR7dmFsdWV9XCJgKTtcblxuICAgIHRoaXMuX3N0YXRlID0gdGhpcy5wYXJhbXMuZGVmYXVsdDtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0ZSBvZiB0aGUgZ3JvdXAgKGAnb3BlbmVkJ2Agb3IgYCdjbG9zZWQnYCkuXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGU7XG4gIH1cblxuICBzZXQgdmFsdWUoc3RhdGUpIHtcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgZm9yIGB2YWx1ZWAuXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgc3RhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICB9XG5cbiAgc2V0IHN0YXRlKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuX3N0YXRlcy5pbmRleE9mKHZhbHVlKSA9PT0gLTEpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgc3RhdGUgXCIke3ZhbHVlfVwiYCk7XG5cbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX3N0YXRlKTtcbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKHZhbHVlKTtcblxuICAgIHRoaXMuX3N0YXRlID0gdmFsdWU7XG4gIH1cblxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgbGV0IGNvbnRlbnQgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZ3JvdXAtaGVhZGVyXCI+XG4gICAgICAgICR7ZWxlbWVudHMuc21hbGxBcnJvd1JpZ2h0fVxuICAgICAgICAke2VsZW1lbnRzLnNtYWxsQXJyb3dCb3R0b219XG4gICAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj4ke3RoaXMucGFyYW1zLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImdyb3VwLWNvbnRlbnRcIj48L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQodGhpcy5fc3RhdGUpO1xuXG4gICAgdGhpcy4kaGVhZGVyID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdyb3VwLWhlYWRlcicpO1xuICAgIHRoaXMuJGNvbnRhaW5lciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5ncm91cC1jb250ZW50Jyk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2JpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kaGVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgY29uc3Qgc3RhdGUgPSB0aGlzLl9zdGF0ZSA9PT0gJ2Nsb3NlZCcgPyAnb3BlbmVkJyA6ICdjbG9zZWQnO1xuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdyb3VwO1xuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBkaXNwbGF5IGZyb20gJy4uL21peGlucy9kaXNwbGF5JztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxhYmVsOiAnJm5ic3A7JyxcbiAgbWluOiAwLFxuICBtYXg6IDEsXG4gIHN0ZXA6IDAuMDEsXG4gIGRlZmF1bHQ6IDAsXG4gIGNvbnRhaW5lcjogbnVsbCxcbiAgY2FsbGJhY2s6IG51bGwsXG59O1xuXG4vKipcbiAqIE51bWJlciBCb3ggY29udHJvbGxlclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW2NvbmZpZy5taW49MF0gLSBNaW5pbXVtIHZhbHVlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcubWF4PTFdIC0gTWF4aW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbY29uZmlnLnN0ZXA9MC4wMV0gLSBTdGVwIGJldHdlZW4gY29uc2VjdXRpdmUgdmFsdWVzLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcuZGVmYXVsdD0wXSAtIERlZmF1bHQgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29uZmlnLmNhbGxiYWNrPW51bGxdIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGVcbiAqICB2YWx1ZSBjaGFuZ2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdiYXNpYy1jb250cm9sbGVycyc7XG4gKlxuICogY29uc3QgbnVtYmVyQm94ID0gbmV3IGNvbnRyb2xsZXJzLk51bWJlckJveCh7XG4gKiAgIGxhYmVsOiAnTXkgTnVtYmVyIEJveCcsXG4gKiAgIG1pbjogMCxcbiAqICAgbWF4OiAxMCxcbiAqICAgc3RlcDogMC4xLFxuICogICBkZWZhdWx0OiA1LFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6ICh2YWx1ZSkgPT4gY29uc29sZS5sb2codmFsdWUpLFxuICogfSk7XG4gKi9cbmNsYXNzIE51bWJlckJveCBleHRlbmRzIGRpc3BsYXkoQmFzZUNvbXBvbmVudCkge1xuICAvLyBsZWdlbmQsIG1pbiA9IDAsIG1heCA9IDEsIHN0ZXAgPSAwLjAxLCBkZWZhdWx0VmFsdWUgPSAwLCAkY29udGFpbmVyID0gbnVsbCwgY2FsbGJhY2sgPSBudWxsXG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCdudW1iZXItYm94JywgZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICB0aGlzLl92YWx1ZSA9IHRoaXMucGFyYW1zLmRlZmF1bHQ7XG4gICAgdGhpcy5faXNJbnRTdGVwID0gKHRoaXMucGFyYW1zLnN0ZXAgJSAxID09PSAwKTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlIG9mIHRoZSBjb250cm9sbGVyLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgIC8vIHVzZSAkbnVtYmVyIGVsZW1lbnQgbWluLCBtYXggYW5kIHN0ZXAgc3lzdGVtXG4gICAgdGhpcy4kbnVtYmVyLnZhbHVlID0gdmFsdWU7XG4gICAgdmFsdWUgPSB0aGlzLiRudW1iZXIudmFsdWU7XG4gICAgdmFsdWUgPSB0aGlzLl9pc0ludFN0ZXAgPyBwYXJzZUludCh2YWx1ZSwgMTApIDogcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgbWluLCBtYXgsIHN0ZXAgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgXG4gICAgICA8c3BhbiBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiaW5uZXItd3JhcHBlclwiPlxuICAgICAgICAke2VsZW1lbnRzLmFycm93TGVmdH1cbiAgICAgICAgPGlucHV0IGNsYXNzPVwibnVtYmVyXCIgdHlwZT1cIm51bWJlclwiIG1pbj1cIiR7bWlufVwiIG1heD1cIiR7bWF4fVwiIHN0ZXA9XCIke3N0ZXB9XCIgdmFsdWU9XCIke3RoaXMuX3ZhbHVlfVwiIC8+XG4gICAgICAgICR7ZWxlbWVudHMuYXJyb3dSaWdodH1cbiAgICAgIDwvZGl2PlxuICAgIGA7XG5cbiAgICB0aGlzLiRlbCA9IHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQoJ2FsaWduLXNtYWxsJyk7XG4gICAgdGhpcy4kZWwuaW5uZXJIVE1MID0gY29udGVudDtcblxuICAgIHRoaXMuJHByZXYgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuYXJyb3ctbGVmdCcpO1xuICAgIHRoaXMuJG5leHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuYXJyb3ctcmlnaHQnKTtcbiAgICB0aGlzLiRudW1iZXIgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPVwibnVtYmVyXCJdJyk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2JpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kcHJldi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBzdGVwID0gdGhpcy5wYXJhbXMuc3RlcDtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gc3RlcC50b1N0cmluZygpLnNwbGl0KCcuJylbMV07XG4gICAgICBjb25zdCBleHAgPSBkZWNpbWFscyA/IGRlY2ltYWxzLmxlbmd0aCA6IDA7XG4gICAgICBjb25zdCBtdWx0ID0gTWF0aC5wb3coMTAsIGV4cCk7XG5cbiAgICAgIGNvbnN0IGludFZhbHVlID0gTWF0aC5mbG9vcih0aGlzLl92YWx1ZSAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgaW50U3RlcCA9IE1hdGguZmxvb3Ioc3RlcCAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgdmFsdWUgPSAoaW50VmFsdWUgLSBpbnRTdGVwKSAvIG11bHQ7XG5cbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZSh2YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kbmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBzdGVwID0gdGhpcy5wYXJhbXMuc3RlcDtcbiAgICAgIGNvbnN0IGRlY2ltYWxzID0gc3RlcC50b1N0cmluZygpLnNwbGl0KCcuJylbMV07XG4gICAgICBjb25zdCBleHAgPSBkZWNpbWFscyA/IGRlY2ltYWxzLmxlbmd0aCA6IDA7XG4gICAgICBjb25zdCBtdWx0ID0gTWF0aC5wb3coMTAsIGV4cCk7XG5cbiAgICAgIGNvbnN0IGludFZhbHVlID0gTWF0aC5mbG9vcih0aGlzLl92YWx1ZSAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgaW50U3RlcCA9IE1hdGguZmxvb3Ioc3RlcCAqIG11bHQgKyAwLjUpO1xuICAgICAgY29uc3QgdmFsdWUgPSAoaW50VmFsdWUgKyBpbnRTdGVwKSAvIG11bHQ7XG5cbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZSh2YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kbnVtYmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICBsZXQgdmFsdWUgPSB0aGlzLiRudW1iZXIudmFsdWU7XG4gICAgICB2YWx1ZSA9IHRoaXMuX2lzSW50U3RlcCA/IHBhcnNlSW50KHZhbHVlLCAxMCkgOiBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgIHZhbHVlID0gTWF0aC5taW4odGhpcy5wYXJhbXMubWF4LCBNYXRoLm1heCh0aGlzLnBhcmFtcy5taW4sIHZhbHVlKSk7XG5cbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZSh2YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9wcm9wYWdhdGUodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHRoaXMuX3ZhbHVlKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLiRudW1iZXIudmFsdWUgPSB2YWx1ZTtcblxuICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyQm94O1xuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBkaXNwbGF5IGZyb20gJy4uL21peGlucy9kaXNwbGF5JztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxhYmVsOiAnJm5ic3A7JyxcbiAgb3B0aW9uczogbnVsbCxcbiAgZGVmYXVsdDogbnVsbCxcbiAgY29udGFpbmVyOiBudWxsLFxuICBjYWxsYmFjazogbnVsbCxcbn07XG5cbi8qKlxuICogTGlzdCBvZiBidXR0b25zIHdpdGggc3RhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIE92ZXJyaWRlIGRlZmF1bHQgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjb25maWcubGFiZWwgLSBMYWJlbCBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7QXJyYXl9IFtjb25maWcub3B0aW9ucz1udWxsXSAtIFZhbHVlcyBvZiB0aGUgZHJvcCBkb3duIGxpc3QuXG4gKiBAcGFyYW0ge051bWJlcn0gW2NvbmZpZy5kZWZhdWx0PW51bGxdIC0gRGVmYXVsdCB2YWx1ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCBzZWxlY3RCdXR0b25zID0gbmV3IGNvbnRyb2xsZXJzLlNlbGVjdEJ1dHRvbnMoe1xuICogICBsYWJlbDogJ1NlbGVjdEJ1dHRvbnMnLFxuICogICBvcHRpb25zOiBbJ3N0YW5kYnknLCAncnVuJywgJ2VuZCddLFxuICogICBkZWZhdWx0OiAncnVuJyxcbiAqICAgY29udGFpbmVyOiAnI2NvbnRhaW5lcicsXG4gKiAgIGNhbGxiYWNrOiAodmFsdWUsIGluZGV4KSA9PiBjb25zb2xlLmxvZyh2YWx1ZSwgaW5kZXgpLFxuICogfSk7XG4gKi9cbmNsYXNzIFNlbGVjdEJ1dHRvbnMgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3NlbGVjdC1idXR0b25zJywgZGVmYXVsdHMsIGNvbmZpZyk7XG5cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5wYXJhbXMub3B0aW9ucykpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyaWdnZXJCdXR0b246IEludmFsaWQgb3B0aW9uIFwib3B0aW9uc1wiJyk7XG5cbiAgICB0aGlzLl92YWx1ZSA9IHRoaXMucGFyYW1zLmRlZmF1bHQ7XG5cbiAgICBjb25zdCBvcHRpb25zID0gdGhpcy5wYXJhbXMub3B0aW9ucztcbiAgICBjb25zdCBpbmRleCA9IG9wdGlvbnMuaW5kZXhPZih0aGlzLl92YWx1ZSk7XG4gICAgdGhpcy5faW5kZXggPSBpbmRleCA9PT0gLTEgP8KgMCA6IGluZGV4O1xuICAgIHRoaXMuX21heEluZGV4ID0gb3B0aW9ucy5sZW5ndGggLSAxO1xuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgdmFsdWUuXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnBhcmFtcy5vcHRpb25zLmluZGV4T2YodmFsdWUpO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IG9wdGlvbiBpbmRleC5cbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCBpbmRleCgpIHtcbiAgICB0aGlzLl9pbmRleDtcbiAgfVxuXG4gIHNldCBpbmRleChpbmRleCkge1xuICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPiB0aGlzLl9tYXhJbmRleCkgcmV0dXJuO1xuXG4gICAgdGhpcy5fdmFsdWUgPSB0aGlzLnBhcmFtcy5vcHRpb25zW2luZGV4XTtcbiAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX2hpZ2hsaWdodEJ0bih0aGlzLl9pbmRleCk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgb3B0aW9ucywgbGFiZWwgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgXG4gICAgICA8c3BhbiBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiaW5uZXItd3JhcHBlclwiPlxuICAgICAgICAke2VsZW1lbnRzLmFycm93TGVmdH1cbiAgICAgICAgJHtvcHRpb25zLm1hcCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuXCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCIgZGF0YS12YWx1ZT1cIiR7b3B0aW9ufVwiPlxuICAgICAgICAgICAgICAke29wdGlvbn1cbiAgICAgICAgICAgIDwvYnV0dG9uPmA7XG4gICAgICAgIH0pLmpvaW4oJycpfVxuICAgICAgICAke2VsZW1lbnRzLmFycm93UmlnaHR9XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIodGhpcy50eXBlKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgdGhpcy4kcHJldiA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1sZWZ0Jyk7XG4gICAgdGhpcy4kbmV4dCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1yaWdodCcpO1xuICAgIHRoaXMuJGJ0bnMgPSBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5idG4nKSk7XG5cbiAgICB0aGlzLl9oaWdobGlnaHRCdG4odGhpcy5faW5kZXgpO1xuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcblxuICAgIHJldHVybiB0aGlzLiRlbDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLiRwcmV2LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9pbmRleCAtIDE7XG4gICAgICB0aGlzLl9wcm9wYWdhdGUoaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kbmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5faW5kZXggKyAxO1xuICAgICAgdGhpcy5fcHJvcGFnYXRlKGluZGV4KTtcbiAgICB9KTtcblxuICAgIHRoaXMuJGJ0bnMuZm9yRWFjaCgoJGJ0biwgaW5kZXgpID0+IHtcbiAgICAgICRidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuX3Byb3BhZ2F0ZShpbmRleCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfcHJvcGFnYXRlKGluZGV4KSB7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+IHRoaXMuX21heEluZGV4KSByZXR1cm47XG5cbiAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5wYXJhbXMub3B0aW9uc1tpbmRleF07XG4gICAgdGhpcy5faGlnaGxpZ2h0QnRuKHRoaXMuX2luZGV4KTtcblxuICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSwgdGhpcy5faW5kZXgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9oaWdobGlnaHRCdG4oYWN0aXZlSW5kZXgpIHtcbiAgICB0aGlzLiRidG5zLmZvckVhY2goKCRidG4sIGluZGV4KSA9PiB7XG4gICAgICAkYnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXG4gICAgICBpZiAoYWN0aXZlSW5kZXggPT09IGluZGV4KSB7XG4gICAgICAgICRidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VsZWN0QnV0dG9ucztcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vQmFzZUNvbXBvbmVudCc7XG5pbXBvcnQgZGlzcGxheSBmcm9tICcuLi9taXhpbnMvZGlzcGxheSc7XG5pbXBvcnQgKiBhcyBlbGVtZW50cyBmcm9tICcuLi91dGlscy9lbGVtZW50cyc7XG5cbi8qKiBAbW9kdWxlIGJhc2ljLWNvbnRyb2xsZXJzICovXG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBsYWJlbDogJyZuYnNwOycsXG4gIG9wdGlvbnM6IG51bGwsXG4gIGRlZmF1bHQ6IG51bGwsXG4gIGNvbnRhaW5lcjogbnVsbCxcbiAgY2FsbGJhY2s6IG51bGwsXG59XG5cbi8qKlxuICogRHJvcC1kb3duIGxpc3QgY29udHJvbGxlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbmZpZy5sYWJlbCAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtBcnJheX0gW2NvbmZpZy5vcHRpb25zPW51bGxdIC0gVmFsdWVzIG9mIHRoZSBkcm9wIGRvd24gbGlzdC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbY29uZmlnLmRlZmF1bHQ9bnVsbF0gLSBEZWZhdWx0IHZhbHVlLlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudHxiYXNpYy1jb250cm9sbGVyfkdyb3VwfSBbY29uZmlnLmNvbnRhaW5lcj1udWxsXSAtXG4gKiAgQ29udGFpbmVyIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NvbmZpZy5jYWxsYmFjaz1udWxsXSAtIENhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlXG4gKiAgdmFsdWUgY2hhbmdlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgY29udHJvbGxlcnMgZnJvbSAnYmFzaWMtY29udHJvbGxlcnMnO1xuICpcbiAqIGNvbnN0IHNlbGVjdExpc3QgPSBuZXcgY29udHJvbGxlcnMuU2VsZWN0TGlzdCh7XG4gKiAgIGxhYmVsOiAnU2VsZWN0TGlzdCcsXG4gKiAgIG9wdGlvbnM6IFsnc3RhbmRieScsICdydW4nLCAnZW5kJ10sXG4gKiAgIGRlZmF1bHQ6ICdydW4nLFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6ICh2YWx1ZSwgaW5kZXgpID0+IGNvbnNvbGUubG9nKHZhbHVlLCBpbmRleCksXG4gKiB9KTtcbiAqL1xuY2xhc3MgU2VsZWN0TGlzdCBleHRlbmRzIGRpc3BsYXkoQmFzZUNvbXBvbmVudCkge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcignc2VsZWN0LWxpc3QnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnBhcmFtcy5vcHRpb25zKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJpZ2dlckJ1dHRvbjogSW52YWxpZCBvcHRpb24gXCJvcHRpb25zXCInKTtcblxuICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5wYXJhbXMuZGVmYXVsdDtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSB0aGlzLnBhcmFtcy5vcHRpb25zO1xuICAgIGNvbnN0IGluZGV4ID0gb3B0aW9ucy5pbmRleE9mKHRoaXMuX3ZhbHVlKTtcbiAgICB0aGlzLl9pbmRleCA9IGluZGV4ID09PSAtMSA/wqAwIDogaW5kZXg7XG4gICAgdGhpcy5fbWF4SW5kZXggPSBvcHRpb25zLmxlbmd0aCAtIDE7XG5cbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3VycmVudCB2YWx1ZS5cbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICBzZXQgdmFsdWUodmFsdWUpIHtcbiAgICB0aGlzLiRzZWxlY3QudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuX2luZGV4ID0gdGhpcy5wYXJhbXMub3B0aW9ucy5pbmRleE9mKHZhbHVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IG9wdGlvbiBpbmRleC5cbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCBpbmRleCgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5kZXg7XG4gIH1cblxuICBzZXQgaW5kZXgoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5fbWF4SW5kZXgpIHJldHVybjtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5wYXJhbXMub3B0aW9uc1tpbmRleF07XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgbGFiZWwsIG9wdGlvbnPCoH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPiR7bGFiZWx9PC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cImlubmVyLXdyYXBwZXJcIj5cbiAgICAgICAgJHtlbGVtZW50cy5hcnJvd0xlZnR9XG4gICAgICAgIDxzZWxlY3Q+XG4gICAgICAgICR7b3B0aW9ucy5tYXAoKG9wdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICByZXR1cm4gYDxvcHRpb24gdmFsdWU9XCIke29wdGlvbn1cIj4ke29wdGlvbn08L29wdGlvbj5gO1xuICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgICAgPHNlbGVjdD5cbiAgICAgICAgJHtlbGVtZW50cy5hcnJvd1JpZ2h0fVxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICAgIHRoaXMuJGVsID0gc3VwZXIucmVuZGVyKHRoaXMudHlwZSk7XG4gICAgdGhpcy4kZWwuY2xhc3NMaXN0LmFkZCgnYWxpZ24tc21hbGwnKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgdGhpcy4kcHJldiA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1sZWZ0Jyk7XG4gICAgdGhpcy4kbmV4dCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5hcnJvdy1yaWdodCcpO1xuICAgIHRoaXMuJHNlbGVjdCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdCcpO1xuICAgIC8vIHNldCB0byBkZWZhdWx0IHZhbHVlXG4gICAgdGhpcy4kc2VsZWN0LnZhbHVlID0gb3B0aW9uc1t0aGlzLl9pbmRleF07XG4gICAgdGhpcy5fYmluZEV2ZW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXMuJGVsO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9iaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJHByZXYuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2luZGV4IC0gMTtcbiAgICAgIHRoaXMuX3Byb3BhZ2F0ZShpbmRleCk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdGhpcy4kbmV4dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5faW5kZXggKyAxO1xuICAgICAgdGhpcy5fcHJvcGFnYXRlKGluZGV4KTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLiRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLiRzZWxlY3QudmFsdWU7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMucGFyYW1zLm9wdGlvbnMuaW5kZXhPZih2YWx1ZSk7XG4gICAgICB0aGlzLl9wcm9wYWdhdGUoaW5kZXgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9wcm9wYWdhdGUoaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPCAwIHx8wqBpbmRleCA+IHRoaXMuX21heEluZGV4KSByZXR1cm47XG5cbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGFyYW1zLm9wdGlvbnNbaW5kZXhdO1xuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLiRzZWxlY3QudmFsdWUgPSB2YWx1ZTtcblxuICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSwgdGhpcy5faW5kZXgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGVjdExpc3Q7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuaW1wb3J0ICogYXMgZ3VpQ29tcG9uZW50cyBmcm9tICdAaXJjYW0vZ3VpLWNvbXBvbmVudHMnO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBtaW46IDAsXG4gIG1heDogMSxcbiAgc3RlcDogMC4wMSxcbiAgZGVmYXVsdDogMCxcbiAgdW5pdDogJycsXG4gIHNpemU6ICdtZWRpdW0nLFxuICBjb250YWluZXI6IG51bGwsXG4gIGNhbGxiYWNrOiBudWxsLFxufVxuXG4vKipcbiAqIFNsaWRlciBjb250cm9sbGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW2NvbmZpZy5taW49MF0gLSBNaW5pbXVtIHZhbHVlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcubWF4PTFdIC0gTWF4aW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbY29uZmlnLnN0ZXA9MC4wMV0gLSBTdGVwIGJldHdlZW4gY29uc2VjdXRpdmUgdmFsdWVzLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtjb25maWcuZGVmYXVsdD0wXSAtIERlZmF1bHQgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ30gW2NvbmZpZy51bml0PScnXSAtIFVuaXQgb2YgdGhlIHZhbHVlLlxuICogQHBhcmFtIHsnc21hbGwnfCdtZWRpdW0nfCdsYXJnZSd9IFtjb25maWcuc2l6ZT0nbWVkaXVtJ10gLSBTaXplIG9mIHRoZVxuICogIHNsaWRlci5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCBzbGlkZXIgPSBuZXcgY29udHJvbGxlcnMuU2xpZGVyKHtcbiAqICAgbGFiZWw6ICdNeSBTbGlkZXInLFxuICogICBtaW46IDIwLFxuICogICBtYXg6IDEwMDAsXG4gKiAgIHN0ZXA6IDEsXG4gKiAgIGRlZmF1bHQ6IDUzNyxcbiAqICAgdW5pdDogJ0h6JyxcbiAqICAgc2l6ZTogJ2xhcmdlJyxcbiAqICAgY29udGFpbmVyOiAnI2NvbnRhaW5lcicsXG4gKiAgIGNhbGxiYWNrOiAodmFsdWUpID0+IGNvbnNvbGUubG9nKHZhbHVlKSxcbiAqIH0pO1xuICovXG5jbGFzcyBTbGlkZXIgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3NsaWRlcicsIGRlZmF1bHRzLCBjb25maWcpO1xuXG4gICAgdGhpcy5fdmFsdWUgPSB0aGlzLnBhcmFtcy5kZWZhdWx0O1xuICAgIHRoaXMuX29uU2xpZGVyQ2hhbmdlID0gdGhpcy5fb25TbGlkZXJDaGFuZ2UuYmluZCh0aGlzKTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlLlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKi9cbiAgc2V0IHZhbHVlKHZhbHVlKSB7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcblxuICAgIGlmICh0aGlzLiRudW1iZXIgJiYgdGhpcy4kcmFuZ2UpIHtcbiAgICAgIHRoaXMuJG51bWJlci52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgICB0aGlzLnNsaWRlci52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuICB9XG5cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgbWluLCBtYXgsIHN0ZXAsIHVuaXQsIHNpemUgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBgXG4gICAgICA8c3BhbiBjbGFzcz1cImxhYmVsXCI+JHtsYWJlbH08L3NwYW4+XG4gICAgICA8ZGl2IGNsYXNzPVwiaW5uZXItd3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicmFuZ2VcIj48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzcz1cIm51bWJlci13cmFwcGVyXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiBjbGFzcz1cIm51bWJlclwiIG1pbj1cIiR7bWlufVwiIG1heD1cIiR7bWF4fVwiIHN0ZXA9XCIke3N0ZXB9XCIgdmFsdWU9XCIke3RoaXMuX3ZhbHVlfVwiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJ1bml0XCI+JHt1bml0fTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5gO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIodGhpcy50eXBlKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQoYHNsaWRlci0ke3NpemV9YCk7XG5cbiAgICB0aGlzLiRyYW5nZSA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5yYW5nZScpO1xuICAgIHRoaXMuJG51bWJlciA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoYGlucHV0W3R5cGU9XCJudW1iZXJcIl1gKTtcblxuICAgIHRoaXMuc2xpZGVyID0gbmV3IGd1aUNvbXBvbmVudHMuU2xpZGVyKHtcbiAgICAgIGNvbnRhaW5lcjogdGhpcy4kcmFuZ2UsXG4gICAgICBjYWxsYmFjazogdGhpcy5fb25TbGlkZXJDaGFuZ2UsXG4gICAgICBtaW46IG1pbixcbiAgICAgIG1heDogbWF4LFxuICAgICAgc3RlcDogc3RlcCxcbiAgICAgIGRlZmF1bHQ6IHRoaXMuX3ZhbHVlLFxuICAgICAgZm9yZWdyb3VuZENvbG9yOiAnI2FiYWJhYicsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVzaXplKCkge1xuICAgIHN1cGVyLnJlc2l6ZSgpO1xuXG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0wqB9ID0gdGhpcy4kcmFuZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5zbGlkZXIucmVzaXplKHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9iaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJG51bWJlci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQodGhpcy4kbnVtYmVyLnZhbHVlKTtcbiAgICAgIC8vIHRoZSBzbGlkZXIgcHJvcGFnYXRlcyB0aGUgdmFsdWVcbiAgICAgIHRoaXMuc2xpZGVyLnZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuXG4gICAgICB0aGlzLmV4ZWN1dGVMaXN0ZW5lcnModGhpcy5fdmFsdWUpO1xuICAgIH0sIGZhbHNlKTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfb25TbGlkZXJDaGFuZ2UodmFsdWUpIHtcbiAgICB0aGlzLiRudW1iZXIudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuXG4gICAgdGhpcy5leGVjdXRlTGlzdGVuZXJzKHRoaXMuX3ZhbHVlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTbGlkZXI7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBkZWZhdWx0OiAnJyxcbiAgcmVhZG9ubHk6IGZhbHNlLFxuICBjb250YWluZXI6IG51bGwsXG4gIGNhbGxiYWNrOiBudWxsLFxufVxuXG4vKipcbiAqIFRleHQgY29udHJvbGxlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbmZpZy5sYWJlbCAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtBcnJheX0gW2NvbmZpZy5kZWZhdWx0PScnXSAtIERlZmF1bHQgdmFsdWUgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0FycmF5fSBbY29uZmlnLnJlYWRvbmx5PWZhbHNlXSAtIERlZmluZSBpZiB0aGUgY29udHJvbGxlciBpcyByZWFkb25seS5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRvbGxlcnMnO1xuICpcbiAqIGNvbnN0IHRleHQgPSBuZXcgY29udHJvbGxlcnMuVGV4dCh7XG4gKiAgIGxhYmVsOiAnTXkgVGV4dCcsXG4gKiAgIGRlZmF1bHQ6ICdkZWZhdWx0IHZhbHVlJyxcbiAqICAgcmVhZG9ubHk6IGZhbHNlLFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6ICh2YWx1ZSkgPT4gY29uc29sZS5sb2codmFsdWUpLFxuICogfSk7XG4gKi9cbmNsYXNzIFRleHQgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3RleHQnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIHRoaXMuX3ZhbHVlID0gdGhpcy5wYXJhbXMuZGVmYXVsdDtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlLlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgZ2V0IHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgfVxuXG4gIHNldCB2YWx1ZSh2YWx1ZSkge1xuICAgIHRoaXMuJGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgcmVhZG9ubHkgPSB0aGlzLnBhcmFtcy5yZWFkb25seSA/ICdyZWFkb25seScgOiAnJztcbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPiR7dGhpcy5wYXJhbXMubGFiZWx9PC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cImlubmVyLXdyYXBwZXJcIj5cbiAgICAgICAgPGlucHV0IGNsYXNzPVwidGV4dFwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCIke3RoaXMuX3ZhbHVlfVwiICR7cmVhZG9ubHl9IC8+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIHRoaXMuJGlucHV0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLnRleHQnKTtcblxuICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgIHJldHVybiB0aGlzLiRlbDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBiaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKCkgPT4ge1xuICAgICAgdGhpcy5fdmFsdWUgPSB0aGlzLiRpbnB1dC52YWx1ZTtcbiAgICAgIHRoaXMuZXhlY3V0ZUxpc3RlbmVycyh0aGlzLl92YWx1ZSk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHQ7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBjb250YWluZXI6IG51bGwsXG59O1xuXG4vKipcbiAqIFRpdGxlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29uZmlnLmxhYmVsIC0gTGFiZWwgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXIgZnJvbSAnYmFzaWMtY29udHJvbGxlcnMnO1xuICpcbiAqIGNvbnN0IHRpdGxlID0gbmV3IGNvbnRyb2xsZXJzLlRpdGxlKHtcbiAqICAgbGFiZWw6ICdNeSBUaXRsZScsXG4gKiAgIGNvbnRhaW5lcjogJyNjb250YWluZXInXG4gKiB9KTtcbiAqL1xuY2xhc3MgVGl0bGUgZXh0ZW5kcyBkaXNwbGF5KEJhc2VDb21wb25lbnQpIHtcbiAgY29uc3RydWN0b3IoY29uZmlnKSB7XG4gICAgc3VwZXIoJ3RpdGxlJywgZGVmYXVsdHMsIGNvbmZpZyk7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBjb250ZW50ID0gYDxzcGFuIGNsYXNzPVwibGFiZWxcIj4ke3RoaXMucGFyYW1zLmxhYmVsfTwvc3Bhbj5gO1xuXG4gICAgdGhpcy4kZWwgPSBzdXBlci5yZW5kZXIoKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgcmV0dXJuIHRoaXMuJGVsO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpdGxlO1xuIiwiaW1wb3J0IEJhc2VDb21wb25lbnQgZnJvbSAnLi9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBkaXNwbGF5IGZyb20gJy4uL21peGlucy9kaXNwbGF5JztcbmltcG9ydCAqIGFzIGVsZW1lbnRzIGZyb20gJy4uL3V0aWxzL2VsZW1lbnRzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGxhYmVsOiAnJmJuc3A7JyxcbiAgYWN0aXZlOiBmYWxzZSxcbiAgY29udGFpbmVyOiBudWxsLFxuICBjYWxsYmFjazogbnVsbCxcbn07XG5cbi8qKlxuICogT24vT2ZmIGNvbnRyb2xsZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIE92ZXJyaWRlIGRlZmF1bHQgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBjb25maWcubGFiZWwgLSBMYWJlbCBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7QXJyYXl9IFtjb25maWcuYWN0aXZlPWZhbHNlXSAtIERlZmF1bHQgc3RhdGUgb2YgdGhlIHRvZ2dsZS5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR8YmFzaWMtY29udHJvbGxlcn5Hcm91cH0gW2NvbmZpZy5jb250YWluZXI9bnVsbF0gLVxuICogIENvbnRhaW5lciBvZiB0aGUgY29udHJvbGxlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjb25maWcuY2FsbGJhY2s9bnVsbF0gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZVxuICogIHZhbHVlIGNoYW5nZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCB0b2dnbGUgPSBuZXcgY29udHJvbGxlcnMuVG9nZ2xlKHtcbiAqICAgbGFiZWw6ICdNeSBUb2dnbGUnLFxuICogICBhY3RpdmU6IGZhbHNlLFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgY2FsbGJhY2s6IChhY3RpdmUpID0+IGNvbnNvbGUubG9nKGFjdGl2ZSksXG4gKiB9KTtcbiAqL1xuY2xhc3MgVG9nZ2xlIGV4dGVuZHMgZGlzcGxheShCYXNlQ29tcG9uZW50KSB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCd0b2dnbGUnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIHRoaXMuX2FjdGl2ZSA9IHRoaXMucGFyYW1zLmFjdGl2ZTtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWx1ZSBvZiB0aGUgdG9nZ2xlXG4gICAqIEB0eXBlIHtCb29sZWFufVxuICAgKi9cbiAgc2V0IHZhbHVlKGJvb2wpIHtcbiAgICB0aGlzLmFjdGl2ZSA9IGJvb2w7XG4gIH1cblxuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBmb3IgYHZhbHVlYC5cbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBzZXQgYWN0aXZlKGJvb2wpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSBib29sO1xuICAgIHRoaXMuX3VwZGF0ZUJ0bigpO1xuICB9XG5cbiAgZ2V0IGFjdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF91cGRhdGVCdG4oKSB7XG4gICAgdmFyIG1ldGhvZCA9IHRoaXMuYWN0aXZlID8gJ2FkZCcgOiAncmVtb3ZlJztcbiAgICB0aGlzLiR0b2dnbGUuY2xhc3NMaXN0W21ldGhvZF0oJ2FjdGl2ZScpO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgY29udGVudCA9IGBcbiAgICAgIDxzcGFuIGNsYXNzPVwibGFiZWxcIj4ke3RoaXMucGFyYW1zLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDxkaXYgY2xhc3M9XCJpbm5lci13cmFwcGVyXCI+XG4gICAgICAgICR7ZWxlbWVudHMudG9nZ2xlfVxuICAgICAgPC9kaXY+YDtcblxuICAgIHRoaXMuJGVsID0gc3VwZXIucmVuZGVyKCk7XG4gICAgdGhpcy4kZWwuY2xhc3NMaXN0LmFkZCgnYWxpZ24tc21hbGwnKTtcbiAgICB0aGlzLiRlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuXG4gICAgdGhpcy4kdG9nZ2xlID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLnRvZ2dsZS1lbGVtZW50Jyk7XG4gICAgLy8gaW5pdGlhbGl6ZSBzdGF0ZVxuICAgIHRoaXMuYWN0aXZlID0gdGhpcy5fYWN0aXZlO1xuICAgIHRoaXMuYmluZEV2ZW50cygpO1xuXG4gICAgcmV0dXJuIHRoaXMuJGVsO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIGJpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kdG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgdGhpcy5hY3RpdmUgPSAhdGhpcy5hY3RpdmU7XG4gICAgICB0aGlzLmV4ZWN1dGVMaXN0ZW5lcnModGhpcy5fYWN0aXZlKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUb2dnbGU7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuaW1wb3J0IGRpc3BsYXkgZnJvbSAnLi4vbWl4aW5zL2Rpc3BsYXknO1xuXG4vKiogQG1vZHVsZSBiYXNpYy1jb250cm9sbGVycyAqL1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgbGFiZWw6ICcmbmJzcDsnLFxuICBvcHRpb25zOiBudWxsLFxuICBjb250YWluZXI6IG51bGwsXG4gIGNhbGxiYWNrOiBudWxsLFxufTtcblxuLyoqXG4gKiBMaXN0IG9mIGJ1dHRvbnMgd2l0aG91dCBzdGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHtTdHJpbmd9IGNvbmZpZy5sYWJlbCAtIExhYmVsIG9mIHRoZSBjb250cm9sbGVyLlxuICogQHBhcmFtIHtBcnJheX0gW2NvbmZpZy5vcHRpb25zPW51bGxdIC0gT3B0aW9ucyBmb3IgZWFjaCBidXR0b24uXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fGJhc2ljLWNvbnRyb2xsZXJ+R3JvdXB9IFtjb25maWcuY29udGFpbmVyPW51bGxdIC1cbiAqICBDb250YWluZXIgb2YgdGhlIGNvbnRyb2xsZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY29uZmlnLmNhbGxiYWNrPW51bGxdIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGVcbiAqICB2YWx1ZSBjaGFuZ2VzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBjb250cm9sbGVycyBmcm9tICdiYXNpYy1jb250cm9sbGVycyc7XG4gKlxuICogY29uc3QgdHJpZ2dlckJ1dHRvbnMgPSBuZXcgY29udHJvbGxlcnMuVHJpZ2dlckJ1dHRvbnMoe1xuICogICBsYWJlbDogJ015IFRyaWdnZXIgQnV0dG9ucycsXG4gKiAgIG9wdGlvbnM6IFsndmFsdWUgMScsICd2YWx1ZSAyJywgJ3ZhbHVlIDMnXSxcbiAqICAgY29udGFpbmVyOiAnI2NvbnRhaW5lcicsXG4gKiAgIGNhbGxiYWNrOiAodmFsdWUsIGluZGV4KSA9PiBjb25zb2xlLmxvZyh2YWx1ZSwgaW5kZXgpLFxuICogfSk7XG4gKi9cbmNsYXNzIFRyaWdnZXJCdXR0b25zIGV4dGVuZHMgZGlzcGxheShCYXNlQ29tcG9uZW50KSB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZykge1xuICAgIHN1cGVyKCd0cmlnZ2VyLWJ1dHRvbnMnLCBkZWZhdWx0cywgY29uZmlnKTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheSh0aGlzLnBhcmFtcy5vcHRpb25zKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignVHJpZ2dlckJ1dHRvbjogSW52YWxpZCBvcHRpb24gXCJvcHRpb25zXCInKTtcblxuICAgIHRoaXMuX2luZGV4ID0gbnVsbDtcbiAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG5cbiAgICBzdXBlci5pbml0aWFsaXplKCk7XG4gIH1cblxuICAvKipcbiAgICogTGFzdCB0cmlnZ2VyZWQgYnV0dG9uIHZhbHVlLlxuICAgKlxuICAgKiBAcmVhZG9ubHlcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCB2YWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG5cbiAgLyoqXG4gICAqIExhc3QgdHJpZ2dlcmVkIGJ1dHRvbiBpbmRleC5cbiAgICpcbiAgICogQHJlYWRvbmx5XG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgaW5kZXgoKSB7IHJldHVybiB0aGlzLl9pbmRleDsgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBsYWJlbCwgb3B0aW9ucyB9ID0gdGhpcy5wYXJhbXM7XG5cbiAgICBjb25zdCBjb250ZW50ID0gYFxuICAgICAgPHNwYW4gY2xhc3M9XCJsYWJlbFwiPiR7bGFiZWx9PC9zcGFuPlxuICAgICAgPGRpdiBjbGFzcz1cImlubmVyLXdyYXBwZXJcIj5cbiAgICAgICAgJHtvcHRpb25zLm1hcCgob3B0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgICAgIHJldHVybiBgPGEgaHJlZj1cIiNcIiBjbGFzcz1cImJ0blwiPiR7b3B0aW9ufTwvYT5gO1xuICAgICAgICB9KS5qb2luKCcnKX1cbiAgICAgIDwvZGl2PmA7XG5cbiAgICB0aGlzLiRlbCA9IHN1cGVyLnJlbmRlcigpO1xuICAgIHRoaXMuJGVsLmlubmVySFRNTCA9IGNvbnRlbnQ7XG5cbiAgICB0aGlzLiRidXR0b25zID0gQXJyYXkuZnJvbSh0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuYnRuJykpO1xuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcblxuICAgIHJldHVybiB0aGlzLiRlbDtcbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLiRidXR0b25zLmZvckVhY2goKCRidG4sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGFyYW1zLm9wdGlvbnNbaW5kZXhdO1xuXG4gICAgICAkYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgdGhpcy5leGVjdXRlTGlzdGVuZXJzKHZhbHVlLCBpbmRleCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmlnZ2VyQnV0dG9ucztcbiIsImltcG9ydCBCYXNlQ29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50cy9CYXNlQ29tcG9uZW50JztcbmltcG9ydCBHcm91cCBmcm9tICcuL2NvbXBvbmVudHMvR3JvdXAnO1xuaW1wb3J0IE51bWJlckJveCBmcm9tICcuL2NvbXBvbmVudHMvTnVtYmVyQm94JztcbmltcG9ydCBTZWxlY3RCdXR0b25zIGZyb20gJy4vY29tcG9uZW50cy9TZWxlY3RCdXR0b25zJztcbmltcG9ydCBTZWxlY3RMaXN0IGZyb20gJy4vY29tcG9uZW50cy9TZWxlY3RMaXN0JztcbmltcG9ydCBTbGlkZXIgZnJvbSAnLi9jb21wb25lbnRzL1NsaWRlcic7XG5pbXBvcnQgVGV4dCBmcm9tICcuL2NvbXBvbmVudHMvVGV4dCc7XG5pbXBvcnQgVGl0bGUgZnJvbSAnLi9jb21wb25lbnRzL1RpdGxlJztcbmltcG9ydCBUb2dnbGUgZnJvbSAnLi9jb21wb25lbnRzL1RvZ2dsZSc7XG5pbXBvcnQgVHJpZ2dlckJ1dHRvbnMgZnJvbSAnLi9jb21wb25lbnRzL1RyaWdnZXJCdXR0b25zJztcblxuaW1wb3J0IGNvbnRhaW5lciBmcm9tICcuL21peGlucy9jb250YWluZXInO1xuXG4vLyBtYXAgdHlwZSBuYW1lcyB0byBjb25zdHJ1Y3RvcnNcbmNvbnN0IHR5cGVDdG9yTWFwID0ge1xuICAnZ3JvdXAnOiBHcm91cCxcbiAgJ251bWJlci1ib3gnOiBOdW1iZXJCb3gsXG4gICdzZWxlY3QtYnV0dG9ucyc6IFNlbGVjdEJ1dHRvbnMsXG4gICdzZWxlY3QtbGlzdCc6IFNlbGVjdExpc3QsXG4gICdzbGlkZXInOiBTbGlkZXIsXG4gICd0ZXh0JzogVGV4dCxcbiAgJ3RpdGxlJzogVGl0bGUsXG4gICd0b2dnbGUnOiBUb2dnbGUsXG4gICd0cmlnZ2VyLWJ1dHRvbnMnOiBUcmlnZ2VyQnV0dG9ucyxcbn07XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBjb250YWluZXI6ICdib2R5Jyxcbn07XG5cbmNsYXNzIENvbnRyb2wgZXh0ZW5kcyBjb250YWluZXIoQmFzZUNvbXBvbmVudCkge1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICBzdXBlcignY29udHJvbCcsIGRlZmF1bHRzLCBjb25maWcpO1xuXG4gICAgbGV0ICRjb250YWluZXIgPSB0aGlzLnBhcmFtcy5jb250YWluZXI7XG5cbiAgICBpZiAodHlwZW9mICRjb250YWluZXIgPT09ICdzdHJpbmcnKVxuICAgICAgJGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJGNvbnRhaW5lcik7XG5cbiAgICB0aGlzLiRjb250YWluZXIgPSAkY29udGFpbmVyO1xuICB9XG59XG5cbi8qKiBAbW9kdWxlIGJhc2ljLWNvbnRyb2xsZXJzICovXG5cbi8qKlxuICogQ3JlYXRlIGEgd2hvbGUgY29udHJvbCBzdXJmYWNlIGZyb20gYSBqc29uIGRlZmluaXRpb24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gY29udGFpbmVyIC0gQ29udGFpbmVyIG9mIHRoZSBjb250cm9scy5cbiAqIEBwYXJhbSB7T2JqZWN0fSAtIERlZmluaXRpb25zIGZvciB0aGUgY29udHJvbHMuXG4gKiBAcmV0dXJuIHtPYmplY3R9IC0gQSBgQ29udHJvbGAgaW5zdGFuY2UgdGhhdCBiZWhhdmVzIGxpa2UgYSBncm91cCB3aXRob3V0IGdyYXBoaWMuXG4gKiBAc3RhdGljXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIGNvbnRyb2xsZXJzIGZyb20gJ2Jhc2ljLWNvbnRyb2xsZXJzJztcbiAqXG4gKiBjb25zdCBkZWZpbml0aW9ucyA9IFtcbiAqICAge1xuICogICAgIGlkOiAnbXktc2xpZGVyJyxcbiAqICAgICB0eXBlOiAnc2xpZGVyJyxcbiAqICAgICBsYWJlbDogJ015IFNsaWRlcicsXG4gKiAgICAgc2l6ZTogJ2xhcmdlJyxcbiAqICAgICBtaW46IDAsXG4gKiAgICAgbWF4OiAxMDAwLFxuICogICAgIHN0ZXA6IDEsXG4gKiAgICAgZGVmYXVsdDogMjUzLFxuICogICB9LCB7XG4gKiAgICAgaWQ6ICdteS1ncm91cCcsXG4gKiAgICAgdHlwZTogJ2dyb3VwJyxcbiAqICAgICBsYWJlbDogJ0dyb3VwJyxcbiAqICAgICBkZWZhdWx0OiAnb3BlbmVkJyxcbiAqICAgICBlbGVtZW50czogW1xuICogICAgICAge1xuICogICAgICAgICBpZDogJ215LW51bWJlcicsXG4gKiAgICAgICAgIHR5cGU6ICdudW1iZXItYm94JyxcbiAqICAgICAgICAgZGVmYXVsdDogMC40LFxuICogICAgICAgICBtaW46IC0xLFxuICogICAgICAgICBtYXg6IDEsXG4gKiAgICAgICAgIHN0ZXA6IDAuMDEsXG4gKiAgICAgICB9XG4gKiAgICAgXSxcbiAqICAgfVxuICogXTtcbiAqXG4gKiBjb25zdCBjb250cm9scyA9IGNvbnRyb2xsZXJzLmNyZWF0ZSgnI2NvbnRhaW5lcicsIGRlZmluaXRpb25zKTtcbiAqXG4gKiAvLyBhZGQgYSBsaXN0ZW5lciBvbiBhbGwgdGhlIGNvbXBvbmVudCBpbnNpZGUgYG15LWdyb3VwYFxuICogY29udHJvbHMuYWRkTGlzdGVuZXIoJ215LWdyb3VwJywgKGlkLCB2YWx1ZSkgPT4gY29uc29sZS5sb2coaWQsIHZhbHVlKSk7XG4gKlxuICogLy8gcmV0cmlldmUgdGhlIGluc3RhbmNlIG9mIGBteS1udW1iZXJgXG4gKiBjb25zdCBteU51bWJlciA9IGNvbnRyb2xzLmdldENvbXBvbmVudCgnbXktZ3JvdXAvbXktbnVtYmVyJyk7XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZShjb250YWluZXIsIGRlZmluaXRpb25zKSB7XG5cbiAgZnVuY3Rpb24gX3BhcnNlKGNvbnRhaW5lciwgZGVmaW5pdGlvbnMpIHtcbiAgICBkZWZpbml0aW9ucy5mb3JFYWNoKChkZWYsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCB0eXBlID0gZGVmLnR5cGU7XG4gICAgICBjb25zdCBjdG9yID0gdHlwZUN0b3JNYXBbdHlwZV07XG4gICAgICBjb25zdCBjb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCBkZWYpO1xuXG4gICAgICAvL1xuICAgICAgY29uZmlnLmNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICAgIGRlbGV0ZSBjb25maWcudHlwZTtcblxuICAgICAgY29uc3QgY29tcG9uZW50ID0gbmV3IGN0b3IoY29uZmlnKTtcblxuICAgICAgaWYgKHR5cGUgPT09ICdncm91cCcpXG4gICAgICAgIF9wYXJzZShjb21wb25lbnQsIGNvbmZpZy5lbGVtZW50cyk7XG4gICAgfSk7XG4gIH07XG5cbiAgY29uc3QgX3Jvb3QgPSBuZXcgQ29udHJvbCh7IGNvbnRhaW5lcjogY29udGFpbmVyIH0pO1xuICBfcGFyc2UoX3Jvb3QsIGRlZmluaXRpb25zKTtcblxuICByZXR1cm4gX3Jvb3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZTtcbiIsImltcG9ydCAqIGFzIF9zdHlsZXMgZnJvbSAnLi91dGlscy9zdHlsZXMnO1xuZXhwb3J0IGNvbnN0IHN0eWxlcyA9IF9zdHlsZXM7XG5cbi8qKiBAbW9kdWxlIGJhc2ljLWNvbnRyb2xsZXJzICovXG5cbi8vIGV4cG9zZSBmb3IgcGx1Z2luc1xuaW1wb3J0IF9CYXNlQ29tcG9uZW50IGZyb20gJy4vY29tcG9uZW50cy9CYXNlQ29tcG9uZW50JztcbmV4cG9ydCBjb25zdCBCYXNlQ29tcG9uZW50ID0gX0Jhc2VDb21wb25lbnQ7XG5cbi8vIGNvbXBvbmVudHNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgR3JvdXAgfSBmcm9tICcuL2NvbXBvbmVudHMvR3JvdXAnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBEcmFnQW5kRHJvcCB9IGZyb20gJy4vY29tcG9uZW50cy9EcmFnQW5kRHJvcCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIE51bWJlckJveCB9IGZyb20gJy4vY29tcG9uZW50cy9OdW1iZXJCb3gnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWxlY3RCdXR0b25zIH0gZnJvbSAnLi9jb21wb25lbnRzL1NlbGVjdEJ1dHRvbnMnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWxlY3RMaXN0IH0gZnJvbSAnLi9jb21wb25lbnRzL1NlbGVjdExpc3QnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTbGlkZXIgfSBmcm9tICcuL2NvbXBvbmVudHMvU2xpZGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGV4dCB9IGZyb20gJy4vY29tcG9uZW50cy9UZXh0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGl0bGUgfSBmcm9tICcuL2NvbXBvbmVudHMvVGl0bGUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUb2dnbGUgfSBmcm9tICcuL2NvbXBvbmVudHMvVG9nZ2xlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVHJpZ2dlckJ1dHRvbnMgfSBmcm9tICcuL2NvbXBvbmVudHMvVHJpZ2dlckJ1dHRvbnMnO1xuXG4vLyBmYWN0b3J5XG5leHBvcnQgeyBkZWZhdWx0IGFzIGNyZWF0ZSB9IGZyb20gJy4vZmFjdG9yeSc7XG4vLyBkaXNwbGF5XG5leHBvcnQgeyBzZXRUaGVtZSAgfSBmcm9tICcuL21peGlucy9kaXNwbGF5JztcblxuLyoqXG4gKiBEaXNhYmxlIGRlZmF1bHQgc3R5bGluZyAoZXhwZWN0IGEgYnJva2VuIHVpKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzYWJsZVN0eWxlcygpIHtcbiAgX3N0eWxlcy5kaXNhYmxlKCk7XG59O1xuIiwiXG5jb25zdCBzZXBhcmF0b3IgPSAnLyc7XG5cbmZ1bmN0aW9uIGdldEhlYWQocGF0aCkge1xuICByZXR1cm4gcGF0aC5zcGxpdChzZXBhcmF0b3IpWzBdO1xufVxuXG5mdW5jdGlvbiBnZXRUYWlsKHBhdGgpIHtcbiAgY29uc3QgcGFydHMgPSBwYXRoLnNwbGl0KHNlcGFyYXRvcik7XG4gIHBhcnRzLnNoaWZ0KCk7XG4gIHJldHVybiBwYXJ0cy5qb2luKHNlcGFyYXRvcik7XG59XG5cbmNvbnN0IGNvbnRhaW5lciA9IChzdXBlcmNsYXNzKSA9PiBjbGFzcyBleHRlbmRzIHN1cGVyY2xhc3Mge1xuICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncyk7XG5cbiAgICB0aGlzLmVsZW1lbnRzID0gbmV3IFNldCgpO1xuXG4gICAgLy8gc3VyZSBvZiB0aGF0ID9cbiAgICBkZWxldGUgdGhpcy5fbGlzdGVuZXJzO1xuICAgIGRlbGV0ZSB0aGlzLl9ncm91cExpc3RlbmVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gb25lIG9mIHRoZSBncm91cCBjaGlsZHJlbiBhY2NvcmRpbmcgdG8gaXRzIGBpZGAsIGBudWxsYCBvdGhlcndpc2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0SGVhZChpZCkge1xuXG4gIH1cblxuICBfZ2V0VGFpbChpZCkge1xuXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgY2hpbGQgb2YgdGhlIGdyb3VwIHJlY3Vyc2l2ZWx5IGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gYGlkYCxcbiAgICogYG51bGxgIG90aGVyd2lzZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGdldENvbXBvbmVudChpZCkge1xuICAgIGNvbnN0IGhlYWQgPSBnZXRIZWFkKGlkKTtcblxuICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiB0aGlzLmVsZW1lbnRzKSB7XG4gICAgICBpZiAoaGVhZCA9PT0gY29tcG9uZW50LmlkKSB7XG4gICAgICAgIGlmIChoZWFkID09PSBpZClcbiAgICAgICAgICByZXR1cm4gY29tcG9uZW50O1xuICAgICAgICBlbHNlIGlmIChjb21wb25lbnQudHlwZSA9ICdncm91cCcpXG4gICAgICAgICAgcmV0dXJuIGNvbXBvbmVudC5nZXRDb21wb25lbnQoZ2V0VGFpbChpZCkpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgY29tcG9uZW50ICR7aWR9YCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmRlZmluZWQgY29tcG9uZW50ICR7aWR9YCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIExpc3RlbmVyIG9uIGVhY2ggY29tcG9uZW50cyBvZiB0aGUgZ3JvdXAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCAtIFBhdGggdG8gY29tcG9uZW50IGlkLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUuXG4gICAqL1xuICBhZGRMaXN0ZW5lcihpZCwgY2FsbGJhY2spIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgY2FsbGJhY2sgPSBpZDtcbiAgICAgIHRoaXMuX2FkZEdyb3VwTGlzdGVuZXIoJycsICcnLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FkZEdyb3VwTGlzdGVuZXIoaWQsICcnLCBjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9hZGRHcm91cExpc3RlbmVyKGlkLCBjYWxsSWQsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGlkKSB7XG4gICAgICBjb25zdCBjb21wb25lbnRJZCA9IGdldEhlYWQoaWQpO1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5nZXRDb21wb25lbnQoY29tcG9uZW50SWQpO1xuXG4gICAgICBpZiAoY29tcG9uZW50KSB7XG4gICAgICAgIGlkID0gZ2V0VGFpbChpZCk7XG4gICAgICAgIGNvbXBvbmVudC5fYWRkR3JvdXBMaXN0ZW5lcihpZCwgY2FsbElkLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZGVmaW5lZCBjb21wb25lbnQgJHt0aGlzLnJvb3RJZH0vJHtjb21wb25lbnRJZH1gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgICAgbGV0IF9jYWxsSWQgPSBjYWxsSWQ7IC8vIGNyZWF0ZSBhIG5ldyBicmFuY2hlXG4gICAgICAgIF9jYWxsSWQgKz0gKGNhbGxJZCA9PT0gJycpID8gY29tcG9uZW50LmlkIDogc2VwYXJhdG9yICsgY29tcG9uZW50LmlkO1xuICAgICAgICBjb21wb25lbnQuX2FkZEdyb3VwTGlzdGVuZXIoaWQsIF9jYWxsSWQsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjb250YWluZXI7XG4iLCJpbXBvcnQgKiBhcyBzdHlsZXMgZnJvbSAnLi4vdXRpbHMvc3R5bGVzJztcblxuLyoqIEBtb2R1bGUgYmFzaWMtY29udHJvbGxlcnMgKi9cblxuLy8gZGVmYXVsdCB0aGVtZVxubGV0IHRoZW1lID0gJ2xpZ2h0Jztcbi8vIHNldCBvZiB0aGUgaW5zdGFuY2lhdGVkIGNvbnRyb2xsZXJzXG5jb25zdCBjb250cm9sbGVycyA9IG5ldyBTZXQoKTtcblxuXG4vKipcbiAqIENoYW5nZSB0aGUgdGhlbWUgb2YgdGhlIGNvbnRyb2xsZXJzLCBjdXJyZW50bHkgMyB0aGVtZXMgYXJlIGF2YWlsYWJsZTpcbiAqICAtIGAnbGlnaHQnYCAoZGVmYXVsdClcbiAqICAtIGAnZ3JleSdgXG4gKiAgLSBgJ2RhcmsnYFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0aGVtZSAtIE5hbWUgb2YgdGhlIHRoZW1lLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VGhlbWUodmFsdWUpIHtcbiAgY29udHJvbGxlcnMuZm9yRWFjaCgoY29udHJvbGxlcikgPT4gY29udHJvbGxlci4kZWwuY2xhc3NMaXN0LnJlbW92ZSh0aGVtZSkpO1xuICB0aGVtZSA9IHZhbHVlO1xuICBjb250cm9sbGVycy5mb3JFYWNoKChjb250cm9sbGVyKSA9PiBjb250cm9sbGVyLiRlbC5jbGFzc0xpc3QuYWRkKHRoZW1lKSk7XG59XG5cbi8qKlxuICogZGlzcGxheSBtaXhpbiAtIGNvbXBvbmVudHMgd2l0aCBET01cbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGRpc3BsYXkgPSAoc3VwZXJjbGFzcykgPT4gY2xhc3MgZXh0ZW5kcyBzdXBlcmNsYXNzIHtcbiAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgIHN1cGVyKC4uLmFyZ3MpO1xuXG4gICAgLy8gaW5zZXJ0IHN0eWxlcyB3aGVuIHRoZSBmaXJzdCBjb250cm9sbGVyIGlzIGNyZWF0ZWRcbiAgICBpZiAoY29udHJvbGxlcnMuc2l6ZSA9PT0gMClcbiAgICAgIHN0eWxlcy5pbnNlcnRTdHlsZVNoZWV0KCk7XG5cbiAgICB0aGlzLnJlc2l6ZSA9IHRoaXMucmVzaXplLmJpbmQodGhpcyk7XG5cbiAgICBjb250cm9sbGVycy5hZGQodGhpcyk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGxldCAkY29udGFpbmVyID0gdGhpcy5wYXJhbXMuY29udGFpbmVyO1xuXG4gICAgaWYgKCRjb250YWluZXIpIHtcbiAgICAgIC8vIGNzcyBzZWxlY3RvclxuICAgICAgaWYgKHR5cGVvZiAkY29udGFpbmVyID09PSAnc3RyaW5nJykge1xuICAgICAgICAkY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcigkY29udGFpbmVyKTtcbiAgICAgIC8vIGdyb3VwXG4gICAgICB9IGVsc2UgaWYgKCRjb250YWluZXIuJGNvbnRhaW5lcikge1xuICAgICAgICAvLyB0aGlzLmdyb3VwID0gJGNvbnRhaW5lcjtcbiAgICAgICAgJGNvbnRhaW5lci5lbGVtZW50cy5hZGQodGhpcyk7XG4gICAgICAgICRjb250YWluZXIgPSAkY29udGFpbmVyLiRjb250YWluZXI7XG4gICAgICB9XG5cbiAgICAgICRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXIoKSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMucmVzaXplKCksIDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICByZW5kZXIoKSB7XG4gICAgdGhpcy4kZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKHN0eWxlcy5ucywgdGhlbWUsIHRoaXMudHlwZSk7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5yZXNpemUpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLnJlc2l6ZSk7XG5cbiAgICByZXR1cm4gdGhpcy4kZWw7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgcmVzaXplKCkge1xuICAgIGlmICh0aGlzLiRlbCkge1xuICAgICAgY29uc3QgYm91bmRpbmdSZWN0ID0gdGhpcy4kZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICBjb25zdCB3aWR0aCA9IGJvdW5kaW5nUmVjdC53aWR0aDtcbiAgICAgIGNvbnN0IG1ldGhvZCA9IHdpZHRoID4gNjAwID8gJ3JlbW92ZScgOiAnYWRkJztcblxuICAgICAgdGhpcy4kZWwuY2xhc3NMaXN0W21ldGhvZF0oJ3NtYWxsJyk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpc3BsYXk7XG4iLCJcbmV4cG9ydCBjb25zdCB0b2dnbGUgPSBgXG4gIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGNsYXNzPVwidG9nZ2xlLWVsZW1lbnRcIiB2ZXJzaW9uPVwiMS4xXCIgdmlld0JveD1cIjAgMCA1MCA1MFwiIHByZXNlcnZlQXNwZWN0UmF0aW89XCJub25lXCI+XG4gICAgICA8ZyBjbGFzcz1cInhcIj5cbiAgICAgICAgPGxpbmUgeDE9XCI4XCIgeTE9XCI4XCIgeDI9XCI0MlwiIHkyPVwiNDJcIiBzdHJva2U9XCJ3aGl0ZVwiIC8+XG4gICAgICAgIDxsaW5lIHgxPVwiOFwiIHkxPVwiNDJcIiB4Mj1cIjQyXCIgeTI9XCI4XCIgc3Ryb2tlPVwid2hpdGVcIiAvPlxuICAgICAgPC9nPlxuICA8L3N2Zz5cbmA7XG5cbmV4cG9ydCBjb25zdCBhcnJvd1JpZ2h0ID0gYFxuICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzcz1cImFycm93LXJpZ2h0XCIgdmVyc2lvbj1cIjEuMVwiIHZpZXdCb3g9XCIwIDAgNTAgNTBcIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwibm9uZVwiPlxuICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjEwXCIgeDI9XCI0MFwiIHkyPVwiMjVcIiAvPlxuICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjQwXCIgeDI9XCI0MFwiIHkyPVwiMjVcIiAvPlxuICA8L3N2Zz5cbmA7XG5cbmV4cG9ydCBjb25zdCBhcnJvd0xlZnQgPSBgXG4gIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGNsYXNzPVwiYXJyb3ctbGVmdFwiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PVwiMCAwIDUwIDUwXCIgcHJlc2VydmVBc3BlY3RSYXRpbz1cIm5vbmVcIj5cbiAgICA8bGluZSB4MT1cIjQwXCIgeTE9XCIxMFwiIHgyPVwiMTBcIiB5Mj1cIjI1XCIgLz5cbiAgICA8bGluZSB4MT1cIjQwXCIgeTE9XCI0MFwiIHgyPVwiMTBcIiB5Mj1cIjI1XCIgLz5cbiAgPC9zdmc+XG5gO1xuXG5leHBvcnQgY29uc3Qgc21hbGxBcnJvd1JpZ2h0ID0gYFxuICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiBjbGFzcz1cInNtYWxsLWFycm93LXJpZ2h0XCIgdmlld0JveD1cIjAgMCA1MCA1MFwiPlxuICAgIDxwYXRoIGQ9XCJNIDIwIDE1IEwgMzUgMjUgTCAyMCAzNSBaXCIgLz5cbiAgPC9zdmc+XG5gO1xuXG5leHBvcnQgY29uc3Qgc21hbGxBcnJvd0JvdHRvbSA9IGBcbiAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgY2xhc3M9XCJzbWFsbC1hcnJvdy1ib3R0b21cIiB2aWV3Qm94PVwiMCAwIDUwIDUwXCI+XG4gICAgPHBhdGggZD1cIk0gMTUgMTcgTCAzNSAxNyBMIDI1IDMyIFpcIiAvPlxuICA8L3N2Zz5cbmA7XG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiIC5iYXNpYy1jb250cm9sbGVycyB7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIHsgd2lkdGg6IDEwMCU7IG1heC13aWR0aDogODAwcHg7IGhlaWdodDogMzRweDsgcGFkZGluZzogM3B4OyBtYXJnaW46IDRweCAwOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZWZlZmVmOyBib3JkZXI6IDFweCBzb2xpZCAjYWFhYWFhOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyBib3JkZXItcmFkaXVzOiAycHg7IGRpc3BsYXk6IGJsb2NrOyBjb2xvcjogIzQ2NDY0NjsgLXdlYmtpdC10b3VjaC1jYWxsb3V0OiBub25lOyAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lOyAta2h0bWwtdXNlci1zZWxlY3Q6IG5vbmU7IC1tb3otdXNlci1zZWxlY3Q6IG5vbmU7IC1tcy11c2VyLXNlbGVjdDogbm9uZTsgdXNlci1zZWxlY3Q6IG5vbmU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5sYWJlbCB7IGZvbnQ6IGl0YWxpYyBub3JtYWwgMS4yZW0gUXVpY2tzYW5kLCBhcmlhbCwgc2Fucy1zZXJpZjsgbGluZS1oZWlnaHQ6IDI2cHg7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtYWxpZ246IHJpZ2h0OyBwYWRkaW5nOiAwIDhweCAwIDA7IGRpc3BsYXk6IGJsb2NrOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyB3aWR0aDogMjQlOyBmbG9hdDogbGVmdDsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTsgLW1vei11c2VyLXNlbGVjdDogbm9uZTsgLW1zLXVzZXItc2VsZWN0OiBub25lOyAtby11c2VyLXNlbGVjdDogbm9uZTsgdXNlci1zZWxlY3Q6IG5vbmU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5pbm5lci13cmFwcGVyIHsgZGlzcGxheTogLXdlYmtpdC1pbmxpbmUtZmxleDsgZGlzcGxheTogaW5saW5lLWZsZXg7IC13ZWJraXQtZmxleC13cmFwOiBuby13cmFwOyBmbGV4LXdyYXA6IG5vLXdyYXA7IHdpZHRoOiA3NiU7IGZsb2F0OiBsZWZ0OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCB7IGhlaWdodDogNDhweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGw6bm90KC5hbGlnbi1zbWFsbCkgeyBoZWlnaHQ6IGF1dG87IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsOm5vdCguYWxpZ24tc21hbGwpIC5sYWJlbCB7IHdpZHRoOiAxMDAlOyBmbG9hdDogbm9uZTsgdGV4dC1hbGlnbjogbGVmdDsgbGluZS1oZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsOm5vdCguYWxpZ24tc21hbGwpIC5pbm5lci13cmFwcGVyIHsgd2lkdGg6IDEwMCU7IGZsb2F0OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbC5hbGlnbi1zbWFsbCAubGFiZWwgeyBkaXNwbGF5OiBibG9jazsgbWFyZ2luLXJpZ2h0OiAyMHB4OyB0ZXh0LWFsaWduOiBsZWZ0OyBsaW5lLWhlaWdodDogNDBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGwuYWxpZ24tc21hbGwgLmlubmVyLXdyYXBwZXIgeyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHdpZHRoOiBhdXRvOyB9IC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctbGVmdCB7IGJvcmRlci1yYWRpdXM6IDJweDsgd2lkdGg6IDE0cHg7IGhlaWdodDogMjZweDsgY3Vyc29yOiBwb2ludGVyOyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyB9IC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctcmlnaHQgbGluZSwgLmJhc2ljLWNvbnRyb2xsZXJzIC5hcnJvdy1sZWZ0IGxpbmUgeyBzdHJva2Utd2lkdGg6IDNweDsgc3Ryb2tlOiAjZmZmZmZmOyB9IC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctcmlnaHQ6aG92ZXIsIC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctbGVmdDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICM2ODY4Njg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5hcnJvdy1yaWdodDphY3RpdmUsIC5iYXNpYy1jb250cm9sbGVycyAuYXJyb3ctbGVmdDphY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycyAuc21hbGwtYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycyAuc21hbGwtYXJyb3ctYm90dG9tIHsgd2lkdGg6IDI2cHg7IGhlaWdodDogMjZweDsgY3Vyc29yOiBwb2ludGVyOyB9IC5iYXNpYy1jb250cm9sbGVycyAuc21hbGwtYXJyb3ctcmlnaHQgcGF0aCwgLmJhc2ljLWNvbnRyb2xsZXJzIC5zbWFsbC1hcnJvdy1ib3R0b20gcGF0aCB7IGZpbGw6ICM5MDkwOTA7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5zbWFsbC1hcnJvdy1yaWdodDpob3ZlciBwYXRoLCAuYmFzaWMtY29udHJvbGxlcnMgLnNtYWxsLWFycm93LWJvdHRvbTpob3ZlciBwYXRoIHsgZmlsbDogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMgLnRvZ2dsZS1lbGVtZW50IHsgd2lkdGg6IDI2cHg7IGhlaWdodDogMjZweDsgYm9yZGVyLXJhZGl1czogMnB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyBjdXJzb3I6IHBvaW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICM2ODY4Njg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudCBsaW5lIHsgc3Ryb2tlLXdpZHRoOiAzcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudCAueCB7IGRpc3BsYXk6IG5vbmU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC50b2dnbGUtZWxlbWVudC5hY3RpdmUgLnggeyBkaXNwbGF5OiBibG9jazsgfSAuYmFzaWMtY29udHJvbGxlcnMgLmJ0biB7IGRpc3BsYXk6IGJsb2NrOyB0ZXh0LWFsaWduOiBjZW50ZXI7IGZvbnQ6IG5vcm1hbCBub3JtYWwgMTJweCBhcmlhbDsgdGV4dC1kZWNvcmF0aW9uOiBub25lOyBoZWlnaHQ6IDI2cHg7IGxpbmUtaGVpZ2h0OiAyNnB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyBib3JkZXI6IG5vbmU7IGNvbG9yOiAjZmZmZmZmOyBtYXJnaW46IDAgNHB4IDAgMDsgcGFkZGluZzogMDsgYm94LXNpemluZzogYm9yZGVyLWJveDsgYm9yZGVyLXJhZGl1czogMnB4OyBjdXJzb3I6IHBvaW50ZXI7IC13ZWJraXQtZmxleC1ncm93OiAxOyBmbGV4LWdyb3c6IDE7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5idG46bGFzdC1jaGlsZCB7IG1hcmdpbjogMDsgfSAuYmFzaWMtY29udHJvbGxlcnMgLmJ0bjpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICM2ODY4Njg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzIC5idG46YWN0aXZlLCAuYmFzaWMtY29udHJvbGxlcnMgLmJ0bi5hY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycyAuYnRuOmZvY3VzIHsgb3V0bGluZTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMgLm51bWJlciB7IGhlaWdodDogMjZweDsgZGlzcGxheTogaW5saW5lLWJsb2NrOyBwb3NpdGlvbjogcmVsYXRpdmU7IGZvbnQ6IG5vcm1hbCBub3JtYWwgMS4yZW0gUXVpY2tzYW5kLCBhcmlhbCwgc2Fucy1zZXJpZjsgdmVydGljYWwtYWxpZ246IHRvcDsgYm9yZGVyOiBub25lOyBiYWNrZ3JvdW5kOiBub25lOyBjb2xvcjogIzQ2NDY0NjsgcGFkZGluZzogMCA0cHg7IG1hcmdpbjogMDsgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjlmOTsgYm9yZGVyLXJhZGl1czogMnB4OyBib3gtc2l6aW5nOiBib3JkZXItYm94OyB9IC5iYXNpYy1jb250cm9sbGVycyAubnVtYmVyOmZvY3VzIHsgb3V0bGluZTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMgc2VsZWN0IHsgaGVpZ2h0OiAyNnB4OyBsaW5lLWhlaWdodDogMjZweDsgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjlmOTsgYm9yZGVyLXJhZGl1czogMnB4OyBib3JkZXI6IG5vbmU7IHZlcnRpY2FsLWFsaWduOiB0b3A7IHBhZGRpbmc6IDA7IG1hcmdpbjogMDsgfSAuYmFzaWMtY29udHJvbGxlcnMgc2VsZWN0OmZvY3VzIHsgb3V0bGluZTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMgaW5wdXRbdHlwZT10ZXh0XSB7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDI2cHg7IGxpbmUtaGVpZ2h0OiAyNnB4OyBib3JkZXI6IDA7IHBhZGRpbmc6IDAgNHB4OyBiYWNrZ3JvdW5kLWNvbG9yOiAjZjlmOWY5OyBib3JkZXItcmFkaXVzOiAycHg7IGNvbG9yOiAjNTY1NjU2OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCAuYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCAuYXJyb3ctbGVmdCB7IHdpZHRoOiAyNHB4OyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsIC50b2dnbGUtZWxlbWVudCB7IHdpZHRoOiA0MHB4OyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsIC5idG4geyBoZWlnaHQ6IDQwcHg7IGxpbmUtaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCAubnVtYmVyIHsgaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCBzZWxlY3QgeyBoZWlnaHQ6IDQwcHg7IGxpbmUtaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbCBpbnB1dFt0eXBlPXRleHRdIHsgaGVpZ2h0OiA0MHB4OyBsaW5lLWhlaWdodDogNDBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMudGl0bGUgeyBib3JkZXI6IG5vbmUgIWltcG9ydGFudDsgbWFyZ2luLWJvdHRvbTogMDsgbWFyZ2luLXRvcDogOHB4OyBwYWRkaW5nLXRvcDogOHB4OyBwYWRkaW5nLWJvdHRvbTogMDsgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQgIWltcG9ydGFudDsgaGVpZ2h0OiAyNXB4OyB9IC5iYXNpYy1jb250cm9sbGVycy50aXRsZSAubGFiZWwgeyBmb250OiBub3JtYWwgYm9sZCAxLjNlbSBRdWlja3NhbmQsIGFyaWFsLCBzYW5zLXNlcmlmOyBoZWlnaHQ6IDEwMCU7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtYWxpZ246IGxlZnQ7IHBhZGRpbmc6IDA7IHdpZHRoOiAxMDAlOyBib3gtc2l6aW5nOiBib3JkZXItYm94OyAtd2Via2l0LWZsZXgtZ3JvdzogMTsgZmxleC1ncm93OiAxOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cCB7IGhlaWdodDogYXV0bzsgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwIC5ncm91cC1oZWFkZXIgLmxhYmVsIHsgZm9udDogbm9ybWFsIGJvbGQgMS4zZW0gUXVpY2tzYW5kLCBhcmlhbCwgc2Fucy1zZXJpZjsgaGVpZ2h0OiAyNnB4OyBsaW5lLWhlaWdodDogMjZweDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1hbGlnbjogbGVmdDsgcGFkZGluZzogMCAwIDAgMzZweDsgd2lkdGg6IDEwMCU7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IC13ZWJraXQtZmxleC1ncm93OiAxOyBmbGV4LWdyb3c6IDE7IGZsb2F0OiBub25lOyBjdXJzb3I6IHBvaW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LXJpZ2h0IHsgd2lkdGg6IDI2cHg7IGhlaWdodDogMjZweDsgcG9zaXRpb246IGFic29sdXRlOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cCAuZ3JvdXAtaGVhZGVyIC5zbWFsbC1hcnJvdy1ib3R0b20geyB3aWR0aDogMjZweDsgaGVpZ2h0OiAyNnB4OyBwb3NpdGlvbjogYWJzb2x1dGU7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwIC5ncm91cC1jb250ZW50IHsgb3ZlcmZsb3c6IGhpZGRlbjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAgLmdyb3VwLWNvbnRlbnQgPiBkaXYgeyBtYXJnaW46IDRweCBhdXRvOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cCAuZ3JvdXAtY29udGVudCA+IGRpdjpsYXN0LWNoaWxkIHsgbWFyZ2luLWJvdHRvbTogMDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAub3BlbmVkIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LXJpZ2h0IHsgZGlzcGxheTogbm9uZTsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAub3BlbmVkIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LWJvdHRvbSB7IGRpc3BsYXk6IGJsb2NrOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cC5vcGVuZWQgLmdyb3VwLWNvbnRlbnQgeyBkaXNwbGF5OiBibG9jazsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JvdXAuY2xvc2VkIC5ncm91cC1oZWFkZXIgLnNtYWxsLWFycm93LXJpZ2h0IHsgZGlzcGxheTogYmxvY2s7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyb3VwLmNsb3NlZCAuZ3JvdXAtaGVhZGVyIC5zbWFsbC1hcnJvdy1ib3R0b20geyBkaXNwbGF5OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncm91cC5jbG9zZWQgLmdyb3VwLWNvbnRlbnQgeyBkaXNwbGF5OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLnJhbmdlIHsgaGVpZ2h0OiAyNnB4OyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IG1hcmdpbjogMDsgLXdlYmtpdC1mbGV4LWdyb3c6IDQ7IGZsZXgtZ3JvdzogNDsgcG9zaXRpb246IHJlbGF0aXZlOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLnJhbmdlIGNhbnZhcyB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAwOyBsZWZ0OiAwOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLm51bWJlci13cmFwcGVyIHsgZGlzcGxheTogaW5saW5lOyBoZWlnaHQ6IDI2cHg7IHRleHQtYWxpZ246IHJpZ2h0OyAtd2Via2l0LWZsZXgtZ3JvdzogMzsgZmxleC1ncm93OiAzOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIgLm51bWJlci13cmFwcGVyIC5udW1iZXIgeyBsZWZ0OiA1cHg7IHdpZHRoOiA1NHB4OyB0ZXh0LWFsaWduOiByaWdodDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc2xpZGVyIC5udW1iZXItd3JhcHBlciAudW5pdCB7IGZvbnQ6IGl0YWxpYyBub3JtYWwgMWVtIFF1aWNrc2FuZCwgYXJpYWwsIHNhbnMtc2VyaWY7IGxpbmUtaGVpZ2h0OiAyNnB4OyBoZWlnaHQ6IDI2cHg7IHdpZHRoOiAzMHB4OyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IHBvc2l0aW9uOiByZWxhdGl2ZTsgcGFkZGluZy1sZWZ0OiA1cHg7IHBhZGRpbmctcmlnaHQ6IDVweDsgY29sb3I6ICM1NjU2NTY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNsaWRlciAubnVtYmVyLXdyYXBwZXIgLnVuaXQgc3VwIHsgbGluZS1oZWlnaHQ6IDdweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc2xpZGVyLnNsaWRlci1sYXJnZSAucmFuZ2UgeyAtd2Via2l0LWZsZXgtZ3JvdzogNTA7IGZsZXgtZ3JvdzogNTA7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNsaWRlci5zbGlkZXItbGFyZ2UgLm51bWJlci13cmFwcGVyIHsgLXdlYmtpdC1mbGV4LWdyb3c6IDE7IGZsZXgtZ3JvdzogMTsgfSAuYmFzaWMtY29udHJvbGxlcnMuc2xpZGVyLnNsaWRlci1zbWFsbCAucmFuZ2UgeyAtd2Via2l0LWZsZXgtZ3JvdzogMjsgZmxleC1ncm93OiAyOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbGlkZXIuc2xpZGVyLXNtYWxsIC5udW1iZXItd3JhcHBlciB7IC13ZWJraXQtZmxleC1ncm93OiA0OyBmbGV4LWdyb3c6IDQ7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsLnNsaWRlciAucmFuZ2UgeyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsLnNsaWRlciAubnVtYmVyLXdyYXBwZXIgeyBoZWlnaHQ6IDQwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLnNtYWxsLnNsaWRlciAubnVtYmVyLXdyYXBwZXIgLnVuaXQgeyBsaW5lLWhlaWdodDogNDBweDsgaGVpZ2h0OiA0MHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy5udW1iZXItYm94IC5udW1iZXIgeyB3aWR0aDogMTIwcHg7IG1hcmdpbjogMCAxMHB4OyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyB9IC5iYXNpYy1jb250cm9sbGVycy5zZWxlY3QtbGlzdCBzZWxlY3QgeyBtYXJnaW46IDAgMTBweDsgd2lkdGg6IDEyMHB4OyBmb250OiBub3JtYWwgbm9ybWFsIDEuMmVtIFF1aWNrc2FuZCwgYXJpYWwsIHNhbnMtc2VyaWY7IGNvbG9yOiAjNDY0NjQ2OyB9IC5iYXNpYy1jb250cm9sbGVycy5zZWxlY3QtYnV0dG9ucyAuYnRuOmZpcnN0LW9mLXR5cGUgeyBtYXJnaW4tbGVmdDogNHB4OyB9IC5iYXNpYy1jb250cm9sbGVycy50ZXh0IGlucHV0W3R5cGU9dGV4dF0geyBmb250OiBub3JtYWwgbm9ybWFsIDEuMmVtIFF1aWNrc2FuZCwgYXJpYWwsIHNhbnMtc2VyaWY7IGNvbG9yOiAjNDY0NjQ2OyB9IC5iYXNpYy1jb250cm9sbGVycy5kcmFnLWFuZC1kcm9wIHsgd2lkdGg6IDEwMCU7IHRleHQtYWxpZ246IGNlbnRlcjsgZm9udC13ZWlnaHQ6IGJvbGQ7IGhlaWdodDogMTAwcHg7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRyYWctYW5kLWRyb3AgLmRyb3Atem9uZSB7IGJvcmRlcjogMXB4IGRvdHRlZCAjYzRjNGM0OyBib3JkZXItcmFkaXVzOiAycHg7IHRyYW5zaXRpb246IGJhY2tncm91bmQgMjAwbXM7IGhlaWdodDogOTBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lLmRyYWcgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjYzRjNGM0OyB9IC5iYXNpYy1jb250cm9sbGVycy5kcmFnLWFuZC1kcm9wIC5sYWJlbCB7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiA5MHB4OyBsaW5lLWhlaWdodDogOTBweDsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwOyB0ZXh0LWFsaWduOiBjZW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRyYWctYW5kLWRyb3AucHJvY2VzcyAubGFiZWwgeyBkaXNwbGF5OiBub25lOyB9IC5iYXNpYy1jb250cm9sbGVycy5zbWFsbC5kcmFnLWFuZC1kcm9wIHsgaGVpZ2h0OiAxMjBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGwuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lIHsgaGVpZ2h0OiAxMTBweDsgfSAuYmFzaWMtY29udHJvbGxlcnMuc21hbGwuZHJhZy1hbmQtZHJvcCAubGFiZWwgeyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTEwcHg7IGxpbmUtaGVpZ2h0OiAxMTBweDsgbWFyZ2luOiAwOyBwYWRkaW5nOiAwOyB0ZXh0LWFsaWduOiBjZW50ZXI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzYzNjM2OyBib3JkZXI6IDFweCBzb2xpZCAjNTg1ODU4OyBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAudG9nZ2xlLWVsZW1lbnQgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjZWZlZmVmOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC50b2dnbGUtZWxlbWVudCBsaW5lIHsgc3Ryb2tlOiAjMzYzNjM2OyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC50b2dnbGUtZWxlbWVudDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICNjZGNkY2Q7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0LCAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuYXJyb3ctbGVmdCB7IGJhY2tncm91bmQtY29sb3I6ICNlZmVmZWY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0IGxpbmUsIC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC5hcnJvdy1sZWZ0IGxpbmUgeyBzdHJva2U6ICMzNjM2MzY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0OmhvdmVyLCAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuYXJyb3ctbGVmdDpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICNjZGNkY2Q7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LXJpZ2h0OmFjdGl2ZSwgLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmFycm93LWxlZnQ6YWN0aXZlIHsgYmFja2dyb3VuZC1jb2xvcjogI2FiYWJhYjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuc21hbGwtYXJyb3ctcmlnaHQgcGF0aCwgLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLnNtYWxsLWFycm93LWJvdHRvbSBwYXRoIHsgZmlsbDogI2FiYWJhYjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuc21hbGwtYXJyb3ctcmlnaHQ6aG92ZXIgcGF0aCwgLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLnNtYWxsLWFycm93LWJvdHRvbTpob3ZlciBwYXRoIHsgZmlsbDogI2NkY2RjZDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAubnVtYmVyLCAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSBzZWxlY3QsIC5iYXNpYy1jb250cm9sbGVycy5ncmV5IGlucHV0W3R5cGU9dGV4dF0geyBjb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjk1KTsgYmFja2dyb3VuZC1jb2xvcjogIzQ1NDU0NTsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleSAuYnRuIHsgYmFja2dyb3VuZC1jb2xvcjogI2VmZWZlZjsgY29sb3I6ICMzNjM2MzY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmJ0bjpob3ZlciB7IGJhY2tncm91bmQtY29sb3I6ICNjZGNkY2Q7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkgLmJ0bjphY3RpdmUsIC5iYXNpYy1jb250cm9sbGVycy5ncmV5IC5idG4uYWN0aXZlIHsgYmFja2dyb3VuZC1jb2xvcjogI2FiYWJhYjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZ3JleS5zbGlkZXIgLmlubmVyLXdyYXBwZXIgLm51bWJlci13cmFwcGVyIC51bml0IHsgY29sb3I6ICNiY2JjYmM7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmdyZXkuZ3JvdXAgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjNTA1MDUwOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5LmRyYWctYW5kLWRyb3AgLmRyb3Atem9uZSB7IGJvcmRlcjogMXB4IGRvdHRlZCAjNzI3MjcyOyB9IC5iYXNpYy1jb250cm9sbGVycy5ncmV5LmRyYWctYW5kLWRyb3AgLmRyb3Atem9uZS5kcmFnIHsgYmFja2dyb3VuZC1jb2xvcjogIzcyNzI3MjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayB7IGJhY2tncm91bmQtY29sb3I6ICMyNDI0MjQ7IGJvcmRlcjogMXB4IHNvbGlkICMyODI4Mjg7IGNvbG9yOiAjZmZmZmZmOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC50b2dnbGUtZWxlbWVudCB7IGJhY2tncm91bmQtY29sb3I6ICM0NjQ2NDY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLnRvZ2dsZS1lbGVtZW50IGxpbmUgeyBzdHJva2U6ICNmZmZmZmY7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLnRvZ2dsZS1lbGVtZW50OmhvdmVyIHsgYmFja2dyb3VuZC1jb2xvcjogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQsIC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5hcnJvdy1sZWZ0IHsgYmFja2dyb3VuZC1jb2xvcjogIzQ2NDY0NjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQgbGluZSwgLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLmFycm93LWxlZnQgbGluZSB7IHN0cm9rZTogI2ZmZmZmZjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQ6aG92ZXIsIC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5hcnJvdy1sZWZ0OmhvdmVyIHsgYmFja2dyb3VuZC1jb2xvcjogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctcmlnaHQ6YWN0aXZlLCAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYXJyb3ctbGVmdDphY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5zbWFsbC1hcnJvdy1yaWdodCBwYXRoLCAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuc21hbGwtYXJyb3ctYm90dG9tIHBhdGggeyBmaWxsOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5zbWFsbC1hcnJvdy1yaWdodDpob3ZlciBwYXRoLCAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuc21hbGwtYXJyb3ctYm90dG9tOmhvdmVyIHBhdGggeyBmaWxsOiAjNjg2ODY4OyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5udW1iZXIsIC5iYXNpYy1jb250cm9sbGVycy5kYXJrIHNlbGVjdCwgLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgaW5wdXRbdHlwZT10ZXh0XSB7IGNvbG9yOiAjZmZmZmZmOyBiYWNrZ3JvdW5kLWNvbG9yOiAjMzMzMzMzOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrIC5idG4geyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDY0NjQ2OyBjb2xvcjogI2ZmZmZmZjsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYnRuOmhvdmVyIHsgYmFja2dyb3VuZC1jb2xvcjogIzY4Njg2ODsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyayAuYnRuOmFjdGl2ZSwgLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsgLmJ0bi5hY3RpdmUgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjOTA5MDkwOyB9IC5iYXNpYy1jb250cm9sbGVycy5kYXJrLnNsaWRlciAuaW5uZXItd3JhcHBlciAubnVtYmVyLXdyYXBwZXIgLnVuaXQgeyBjb2xvcjogI2NkY2RjZDsgfSAuYmFzaWMtY29udHJvbGxlcnMuZGFyay5ncm91cCB7IGJhY2tncm91bmQtY29sb3I6ICMzZTNlM2U7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lIHsgYm9yZGVyOiAxcHggZG90dGVkICM0MjQyNDI7IH0gLmJhc2ljLWNvbnRyb2xsZXJzLmRhcmsuZHJhZy1hbmQtZHJvcCAuZHJvcC16b25lLmRyYWcgeyBiYWNrZ3JvdW5kLWNvbG9yOiAjNDI0MjQyOyB9IFwiOyIsImltcG9ydCB7IG5hbWUgfSBmcm9tICcuLi8uLi9wYWNrYWdlLmpzb24nO1xuaW1wb3J0IHN0eWxlcyBmcm9tICcuL3N0eWxlcy1kZWNsYXJhdGlvbnMuanMnO1xuXG5leHBvcnQgY29uc3QgbnMgPSBuYW1lLnJlcGxhY2UoJ0BpcmNhbS8nLCAnJyk7XG5cbmNvbnN0IG5zQ2xhc3MgPSBgLiR7bnN9YDtcbmxldCBfZGlzYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gIF9kaXNhYmxlZCA9IHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRTdHlsZVNoZWV0KCkge1xuICBpZiAoX2Rpc2FibGVkKSByZXR1cm47XG5cbiAgY29uc3QgJGNzcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICRjc3Muc2V0QXR0cmlidXRlKCdkYXRhLW5hbWVzcGFjZScsIG5zKTtcbiAgJGNzcy50eXBlID0gJ3RleHQvY3NzJztcblxuICBpZiAoJGNzcy5zdHlsZVNoZWV0KVxuICAgICRjc3Muc3R5bGVTaGVldC5jc3NUZXh0ID0gc3R5bGVzO1xuICBlbHNlXG4gICAgJGNzcy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHlsZXMpKTtcblxuICAvLyBpbnNlcnQgYmVmb3JlIGxpbmsgb3Igc3R5bGVzIGlmIGV4aXN0c1xuICBjb25zdCAkbGluayA9IGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3RvcignbGluaycpO1xuICBjb25zdCAkc3R5bGUgPSBkb2N1bWVudC5oZWFkLnF1ZXJ5U2VsZWN0b3IoJ3N0eWxlJyk7XG5cbiAgaWYgKCRsaW5rKVxuICAgIGRvY3VtZW50LmhlYWQuaW5zZXJ0QmVmb3JlKCRjc3MsICRsaW5rKTtcbiAgZWxzZSBpZiAoJHN0eWxlKVxuICAgIGRvY3VtZW50LmhlYWQuaW5zZXJ0QmVmb3JlKCRjc3MsICRzdHlsZSk7XG4gIGVsc2VcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKCRjc3MpO1xufVxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiX2Zyb21cIjogXCJAaXJjYW0vYmFzaWMtY29udHJvbGxlcnNcIixcbiAgXCJfaWRcIjogXCJAaXJjYW0vYmFzaWMtY29udHJvbGxlcnNAMS4wLjRcIixcbiAgXCJfaW5CdW5kbGVcIjogZmFsc2UsXG4gIFwiX2ludGVncml0eVwiOiBcInNoYTUxMi0zY1NBdHhmcFh0ZzFhM2h2eVZKTjVnTm1mcXdmNW1TYnh1eHEyZzlJNi9yb1Vzd3R4T2dHd1l3V1YxOFVKRldSNzVNcW90NVNTVnZiTGRQUGd2MW5vQT09XCIsXG4gIFwiX2xvY2F0aW9uXCI6IFwiL0BpcmNhbS9iYXNpYy1jb250cm9sbGVyc1wiLFxuICBcIl9waGFudG9tQ2hpbGRyZW5cIjoge30sXG4gIFwiX3JlcXVlc3RlZFwiOiB7XG4gICAgXCJ0eXBlXCI6IFwidGFnXCIsXG4gICAgXCJyZWdpc3RyeVwiOiB0cnVlLFxuICAgIFwicmF3XCI6IFwiQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzXCIsXG4gICAgXCJuYW1lXCI6IFwiQGlyY2FtL2Jhc2ljLWNvbnRyb2xsZXJzXCIsXG4gICAgXCJlc2NhcGVkTmFtZVwiOiBcIkBpcmNhbSUyZmJhc2ljLWNvbnRyb2xsZXJzXCIsXG4gICAgXCJzY29wZVwiOiBcIkBpcmNhbVwiLFxuICAgIFwicmF3U3BlY1wiOiBcIlwiLFxuICAgIFwic2F2ZVNwZWNcIjogbnVsbCxcbiAgICBcImZldGNoU3BlY1wiOiBcImxhdGVzdFwiXG4gIH0sXG4gIFwiX3JlcXVpcmVkQnlcIjogW1xuICAgIFwiI1VTRVJcIixcbiAgICBcIi9cIlxuICBdLFxuICBcIl9yZXNvbHZlZFwiOiBcImh0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnL0BpcmNhbS9iYXNpYy1jb250cm9sbGVycy8tL2Jhc2ljLWNvbnRyb2xsZXJzLTEuMC40LnRnelwiLFxuICBcIl9zaGFzdW1cIjogXCIyZTIxNTJjNjE4YmFlOTQ2MTI2YjhlYmY0MWJhZWI5NWNiM2M0MGY4XCIsXG4gIFwiX3NwZWNcIjogXCJAaXJjYW0vYmFzaWMtY29udHJvbGxlcnNcIixcbiAgXCJfd2hlcmVcIjogXCIvVXNlcnMvbWF0dXN6ZXdza2kvZGV2L2pzL3dhdmVzanMvbGliL3dhdmVzLWF1ZGlvL2V4YW1wbGVzL21ldHJvbm9tZVwiLFxuICBcImJ1Z3NcIjoge1xuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL2lyY2FtLWpzdG9vbHMvYmFzaWMtY29udHJvbGxlcnMvaXNzdWVzXCJcbiAgfSxcbiAgXCJidW5kbGVEZXBlbmRlbmNpZXNcIjogZmFsc2UsXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBpcmNhbS9ndWktY29tcG9uZW50c1wiOiBcIl4xLjAuM1wiXG4gIH0sXG4gIFwiZGVwcmVjYXRlZFwiOiBmYWxzZSxcbiAgXCJkZXNjcmlwdGlvblwiOiBcIlNldCBvZiBzaW1wbGUgY29udHJvbGxlcnMgZm9yIHJhcGlkIHByb3RvdHlwaW5nXCIsXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcImJhYmVsLWNvcmVcIjogXCJeNi4yNi4wXCIsXG4gICAgXCJiYWJlbC1wbHVnaW4tdHJhbnNmb3JtLWVzMjAxNS1tb2R1bGVzLWNvbW1vbmpzXCI6IFwiXjYuMjYuMFwiLFxuICAgIFwiYmFiZWwtcHJlc2V0LWVudlwiOiBcIl4xLjYuMVwiLFxuICAgIFwiYnJvd3NlcmlmeVwiOiBcIl4xNC41LjBcIixcbiAgICBcImNoYWxrXCI6IFwiXjIuMy4wXCIsXG4gICAgXCJmcy1leHRyYVwiOiBcIl40LjAuM1wiLFxuICAgIFwianNkb2MtdG8tbWFya2Rvd25cIjogXCJeMy4wLjBcIixcbiAgICBcImtsYXdcIjogXCJeMi4xLjFcIixcbiAgICBcIm5vZGUtc2Fzc1wiOiBcIl40LjcuMlwiLFxuICAgIFwibnBcIjogXCJeMi4xOC4yXCIsXG4gICAgXCJ0YXBlXCI6IFwiXjQuOC4wXCIsXG4gICAgXCJ1Z2xpZnktanNcIjogXCJeMy4yLjJcIixcbiAgICBcIndhdGNoXCI6IFwiXjEuMC4yXCJcbiAgfSxcbiAgXCJob21lcGFnZVwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9pcmNhbS1qc3Rvb2xzL2Jhc2ljLWNvbnRyb2xsZXJzI3JlYWRtZVwiLFxuICBcImxpY2Vuc2VcIjogXCJCU0QtMy1DbGF1c2VcIixcbiAgXCJtYWluXCI6IFwiZGlzdC9pbmRleC5qc1wiLFxuICBcIm5hbWVcIjogXCJAaXJjYW0vYmFzaWMtY29udHJvbGxlcnNcIixcbiAgXCJwdWJsaXNoQ29uZmlnXCI6IHtcbiAgICBcImFjY2Vzc1wiOiBcInB1YmxpY1wiXG4gIH0sXG4gIFwicmVwb3NpdG9yeVwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXG4gICAgXCJ1cmxcIjogXCJnaXQraHR0cHM6Ly9naXRodWIuY29tL2lyY2FtLWpzdG9vbHMvYmFzaWMtY29udHJvbGxlcnMuZ2l0XCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImJ1bmRsZVwiOiBcIm5vZGUgLi9iaW4vcnVubmVyIC0tYnVuZGxlXCIsXG4gICAgXCJkZXBsb3lcIjogXCJucCAtLXlvbG9cIixcbiAgICBcImRvY1wiOiBcImpzZG9jMm1kIC10IHRtcGwvUkVBRE1FLmhicyBzcmMvKiovKi5qcyA+IFJFQURNRS5tZFwiLFxuICAgIFwicHJld2F0Y2hcIjogXCJucG0gcnVuIHRyYW5zcGlsZVwiLFxuICAgIFwidHJhbnNwaWxlXCI6IFwibm9kZSAuL2Jpbi9ydW5uZXIgLS10cmFuc3BpbGVcIixcbiAgICBcInZlcnNpb25cIjogXCJucG0gcnVuIHRyYW5zcGlsZSAmJiBucG0gcnVuIGRvYyAmJiBnaXQgYWRkIFJFQURNRS5tZFwiLFxuICAgIFwid2F0Y2hcIjogXCJub2RlIC4vYmluL3J1bm5lciAtLXdhdGNoXCJcbiAgfSxcbiAgXCJzdGFuZGFsb25lXCI6IFwiYmFzaWNDb250cm9sbGVyc1wiLFxuICBcInZlcnNpb25cIjogXCIxLjAuNFwiXG59XG4iLCIvKipcbiAqIEBtb2R1bGUgZ3VpLWNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTbGlkZXIgfSBmcm9tICcuL1NsaWRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEJyZWFrcG9pbnQgfSBmcm9tICcuL0JyZWFrcG9pbnQnO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtcHJvdG90eXBlLW9mXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3Byb21pc2VcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIik7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGVmaW5lUHJvcGVydHkpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgKDAsIF9kZWZpbmVQcm9wZXJ0eTIuZGVmYXVsdCkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9nZXQtcHJvdG90eXBlLW9mXCIpO1xuXG52YXIgX2dldFByb3RvdHlwZU9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2dldFByb3RvdHlwZU9mKTtcblxudmFyIF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9ICgwLCBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yMi5kZWZhdWx0KShvYmplY3QsIHByb3BlcnR5KTtcblxuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBhcmVudCA9ICgwLCBfZ2V0UHJvdG90eXBlT2YyLmRlZmF1bHQpKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9zZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuLi9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpO1xuXG52YXIgX3NldFByb3RvdHlwZU9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NldFByb3RvdHlwZU9mKTtcblxudmFyIF9jcmVhdGUgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9vYmplY3QvY3JlYXRlXCIpO1xuXG52YXIgX2NyZWF0ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGUpO1xuXG52YXIgX3R5cGVvZjIgPSByZXF1aXJlKFwiLi4vaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgKHR5cGVvZiBzdXBlckNsYXNzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShzdXBlckNsYXNzKSkpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gKDAsIF9jcmVhdGUyLmRlZmF1bHQpKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2YyLmRlZmF1bHQgPyAoMCwgX3NldFByb3RvdHlwZU9mMi5kZWZhdWx0KShzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF90eXBlb2YyID0gcmVxdWlyZShcIi4uL2hlbHBlcnMvdHlwZW9mXCIpO1xuXG52YXIgX3R5cGVvZjMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90eXBlb2YyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKCh0eXBlb2YgY2FsbCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiAoMCwgX3R5cGVvZjMuZGVmYXVsdCkoY2FsbCkpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2l0ZXJhdG9yID0gcmVxdWlyZShcIi4uL2NvcmUtanMvc3ltYm9sL2l0ZXJhdG9yXCIpO1xuXG52YXIgX2l0ZXJhdG9yMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2l0ZXJhdG9yKTtcblxudmFyIF9zeW1ib2wgPSByZXF1aXJlKFwiLi4vY29yZS1qcy9zeW1ib2xcIik7XG5cbnZhciBfc3ltYm9sMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3N5bWJvbCk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgX2l0ZXJhdG9yMi5kZWZhdWx0ID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gX3N5bWJvbDIuZGVmYXVsdCAmJiBvYmogIT09IF9zeW1ib2wyLmRlZmF1bHQucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgX3R5cGVvZihfaXRlcmF0b3IyLmRlZmF1bHQpID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKG9iaik7XG59IDogZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqICYmIHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBfc3ltYm9sMi5kZWZhdWx0ICYmIG9iaiAhPT0gX3N5bWJvbDIuZGVmYXVsdC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKG9iaik7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUnKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpIHtcbiAgcmV0dXJuICRPYmplY3QuY3JlYXRlKFAsIEQpO1xufTtcbiIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHknKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYykge1xuICByZXR1cm4gJE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKTtcbn07XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KSB7XG4gIHJldHVybiAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KTtcbn07XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC5zZXRQcm90b3R5cGVPZjtcbiIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNy5wcm9taXNlLmZpbmFsbHknKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnByb21pc2UudHJ5Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5Qcm9taXNlO1xuIiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNy5zeW1ib2wuYXN5bmMtaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM3LnN5bWJvbC5vYnNlcnZhYmxlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5TeW1ib2w7XG4iLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL193a3MtZXh0JykuZignaXRlcmF0b3InKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIENvbnN0cnVjdG9yLCBuYW1lLCBmb3JiaWRkZW5GaWVsZCkge1xuICBpZiAoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB8fCAoZm9yYmlkZGVuRmllbGQgIT09IHVuZGVmaW5lZCAmJiBmb3JiaWRkZW5GaWVsZCBpbiBpdCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IobmFtZSArICc6IGluY29ycmVjdCBpbnZvY2F0aW9uIScpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpKSB0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07XG4iLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4vX3RvLWFic29sdXRlLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0lPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTykge1xuICAgICAgaWYgKE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcbiIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG52YXIgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG4vLyBFUzMgd3JvbmcgaGVyZVxudmFyIEFSRyA9IGNvZihmdW5jdGlvbiAoKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTtcbiIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcbiIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7IHZlcnNpb246ICcyLjUuNycgfTtcbmlmICh0eXBlb2YgX19lID09ICdudW1iZXInKSBfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmXG4iLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbiAoYSkge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKC8qIC4uLmFyZ3MgKi8pIHtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07XG4iLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcbiIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gKFxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xuKS5zcGxpdCgnLCcpO1xuIiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcbnZhciBnT1BTID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKTtcbnZhciBwSUUgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgcmVzdWx0ID0gZ2V0S2V5cyhpdCk7XG4gIHZhciBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZiAoZ2V0U3ltYm9scykge1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdCk7XG4gICAgdmFyIGlzRW51bSA9IHBJRS5mO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIga2V5O1xuICAgIHdoaWxlIChzeW1ib2xzLmxlbmd0aCA+IGkpIGlmIChpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSkgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24gKHR5cGUsIG5hbWUsIHNvdXJjZSkge1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRjtcbiAgdmFyIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0Lkc7XG4gIHZhciBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TO1xuICB2YXIgSVNfUFJPVE8gPSB0eXBlICYgJGV4cG9ydC5QO1xuICB2YXIgSVNfQklORCA9IHR5cGUgJiAkZXhwb3J0LkI7XG4gIHZhciBJU19XUkFQID0gdHlwZSAmICRleHBvcnQuVztcbiAgdmFyIGV4cG9ydHMgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KTtcbiAgdmFyIGV4cFByb3RvID0gZXhwb3J0c1tQUk9UT1RZUEVdO1xuICB2YXIgdGFyZ2V0ID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXTtcbiAgdmFyIGtleSwgb3duLCBvdXQ7XG4gIGlmIChJU19HTE9CQUwpIHNvdXJjZSA9IG5hbWU7XG4gIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgaWYgKG93biAmJiBoYXMoZXhwb3J0cywga2V5KSkgY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbiAoQykge1xuICAgICAgdmFyIEYgPSBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIEMpIHtcbiAgICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIG5ldyBDKCk7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBuZXcgQyhhKTtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIG5ldyBDKGEsIGIpO1xuICAgICAgICAgIH0gcmV0dXJuIG5ldyBDKGEsIGIsIGMpO1xuICAgICAgICB9IHJldHVybiBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5tZXRob2RzLiVOQU1FJVxuICAgIGlmIChJU19QUk9UTykge1xuICAgICAgKGV4cG9ydHMudmlydHVhbCB8fCAoZXhwb3J0cy52aXJ0dWFsID0ge30pKVtrZXldID0gb3V0O1xuICAgICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLnByb3RvdHlwZS4lTkFNRSVcbiAgICAgIGlmICh0eXBlICYgJGV4cG9ydC5SICYmIGV4cFByb3RvICYmICFleHBQcm90b1trZXldKSBoaWRlKGV4cFByb3RvLCBrZXksIG91dCk7XG4gICAgfVxuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59O1xuIiwidmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGNhbGwgPSByZXF1aXJlKCcuL19pdGVyLWNhbGwnKTtcbnZhciBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJyk7XG52YXIgZ2V0SXRlckZuID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbnZhciBCUkVBSyA9IHt9O1xudmFyIFJFVFVSTiA9IHt9O1xudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQsIElURVJBVE9SKSB7XG4gIHZhciBpdGVyRm4gPSBJVEVSQVRPUiA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGl0ZXJhYmxlOyB9IDogZ2V0SXRlckZuKGl0ZXJhYmxlKTtcbiAgdmFyIGYgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSk7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yLCByZXN1bHQ7XG4gIGlmICh0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpIHRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYgKGlzQXJyYXlJdGVyKGl0ZXJGbikpIGZvciAobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIHtcbiAgICByZXN1bHQgPSBlbnRyaWVzID8gZihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSkgOiBmKGl0ZXJhYmxlW2luZGV4XSk7XG4gICAgaWYgKHJlc3VsdCA9PT0gQlJFQUsgfHwgcmVzdWx0ID09PSBSRVRVUk4pIHJldHVybiByZXN1bHQ7XG4gIH0gZWxzZSBmb3IgKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7KSB7XG4gICAgcmVzdWx0ID0gY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gICAgaWYgKHJlc3VsdCA9PT0gQlJFQUsgfHwgcmVzdWx0ID09PSBSRVRVUk4pIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG5leHBvcnRzLkJSRUFLID0gQlJFQUs7XG5leHBvcnRzLlJFVFVSTiA9IFJFVFVSTjtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGZcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy1mdW5jXG4gIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmICh0eXBlb2YgX19nID09ICdudW1iZXInKSBfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWZcbiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG4iLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudDtcbm1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSAmJiAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkocmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdkaXYnKSwgJ2EnLCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gNzsgfSB9KS5hICE9IDc7XG59KTtcbiIsIi8vIGZhc3QgYXBwbHksIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZm4sIGFyZ3MsIHRoYXQpIHtcbiAgdmFyIHVuID0gdGhhdCA9PT0gdW5kZWZpbmVkO1xuICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gIH0gcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xufTtcbiIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07XG4iLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTtcbiIsIi8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG4iLCIvLyBjYWxsIHNvbWV0aGluZyBvbiBpdGVyYXRvciBzdGVwIHdpdGggc2FmZSBjbG9zaW5nIG9uIGVycm9yXG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoIChlKSB7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZiAocmV0ICE9PSB1bmRlZmluZWQpIGFuT2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgZGVzY3JpcHRvciA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2hpZGUnKShJdGVyYXRvclByb3RvdHlwZSwgcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCkge1xuICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBjcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUsIHsgbmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KSB9KTtcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIHJlZGVmaW5lID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKTtcbnZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xudmFyIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xudmFyICRpdGVyQ3JlYXRlID0gcmVxdWlyZSgnLi9faXRlci1jcmVhdGUnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBCVUdHWSA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKTsgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxudmFyIEZGX0lURVJBVE9SID0gJ0BAaXRlcmF0b3InO1xudmFyIEtFWVMgPSAna2V5cyc7XG52YXIgVkFMVUVTID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKSB7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uIChraW5kKSB7XG4gICAgaWYgKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKSByZXR1cm4gcHJvdG9ba2luZF07XG4gICAgc3dpdGNoIChraW5kKSB7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCkgeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgICAgY2FzZSBWQUxVRVM6IHJldHVybiBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpIHsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyA9IE5BTUUgKyAnIEl0ZXJhdG9yJztcbiAgdmFyIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFUztcbiAgdmFyIFZBTFVFU19CVUcgPSBmYWxzZTtcbiAgdmFyIHByb3RvID0gQmFzZS5wcm90b3R5cGU7XG4gIHZhciAkbmF0aXZlID0gcHJvdG9bSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdO1xuICB2YXIgJGRlZmF1bHQgPSAkbmF0aXZlIHx8IGdldE1ldGhvZChERUZBVUxUKTtcbiAgdmFyICRlbnRyaWVzID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZDtcbiAgdmFyICRhbnlOYXRpdmUgPSBOQU1FID09ICdBcnJheScgPyBwcm90by5lbnRyaWVzIHx8ICRuYXRpdmUgOiAkbmF0aXZlO1xuICB2YXIgbWV0aG9kcywga2V5LCBJdGVyYXRvclByb3RvdHlwZTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZiAoJGFueU5hdGl2ZSkge1xuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoJGFueU5hdGl2ZS5jYWxsKG5ldyBCYXNlKCkpKTtcbiAgICBpZiAoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUgJiYgSXRlcmF0b3JQcm90b3R5cGUubmV4dCkge1xuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgICAvLyBmaXggZm9yIHNvbWUgb2xkIGVuZ2luZXNcbiAgICAgIGlmICghTElCUkFSWSAmJiB0eXBlb2YgSXRlcmF0b3JQcm90b3R5cGVbSVRFUkFUT1JdICE9ICdmdW5jdGlvbicpIGhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZiAoREVGX1ZBTFVFUyAmJiAkbmF0aXZlICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKSB7XG4gICAgVkFMVUVTX0JVRyA9IHRydWU7XG4gICAgJGRlZmF1bHQgPSBmdW5jdGlvbiB2YWx1ZXMoKSB7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmICgoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSkge1xuICAgIGhpZGUocHJvdG8sIElURVJBVE9SLCAkZGVmYXVsdCk7XG4gIH1cbiAgLy8gUGx1ZyBmb3IgbGlicmFyeVxuICBJdGVyYXRvcnNbTkFNRV0gPSAkZGVmYXVsdDtcbiAgSXRlcmF0b3JzW1RBR10gPSByZXR1cm5UaGlzO1xuICBpZiAoREVGQVVMVCkge1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6IERFRl9WQUxVRVMgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChWQUxVRVMpLFxuICAgICAga2V5czogSVNfU0VUID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAkZW50cmllc1xuICAgIH07XG4gICAgaWYgKEZPUkNFRCkgZm9yIChrZXkgaW4gbWV0aG9kcykge1xuICAgICAgaWYgKCEoa2V5IGluIHByb3RvKSkgcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTtcbiIsInZhciBJVEVSQVRPUiA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpO1xudmFyIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uICgpIHsgU0FGRV9DTE9TSU5HID0gdHJ1ZTsgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcbiAgQXJyYXkuZnJvbShyaXRlciwgZnVuY3Rpb24gKCkgeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjLCBza2lwQ2xvc2luZykge1xuICBpZiAoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpIHJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gWzddO1xuICAgIHZhciBpdGVyID0gYXJyW0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHsgZG9uZTogc2FmZSA9IHRydWUgfTsgfTtcbiAgICBhcnJbSVRFUkFUT1JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChkb25lLCB2YWx1ZSkge1xuICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZSB9O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7XG4iLCJ2YXIgTUVUQSA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBzZXREZXNjID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBpZCA9IDA7XG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24gKGl0KSB7XG4gIHNldERlc2MoaXQsIE1FVEEsIHsgdmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IH0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24gKGl0LCBjcmVhdGUpIHtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZiAoIWlzT2JqZWN0KGl0KSkgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYgKCFoYXMoaXQsIE1FVEEpKSB7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZiAoIWlzRXh0ZW5zaWJsZShpdCkpIHJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gb2JqZWN0IElEXG4gIH0gcmV0dXJuIGl0W01FVEFdLmk7XG59O1xudmFyIGdldFdlYWsgPSBmdW5jdGlvbiAoaXQsIGNyZWF0ZSkge1xuICBpZiAoIWhhcyhpdCwgTUVUQSkpIHtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmICghaXNFeHRlbnNpYmxlKGl0KSkgcmV0dXJuIHRydWU7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSkgc2V0TWV0YShpdCk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgbWV0YSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBLRVk6IE1FVEEsXG4gIE5FRUQ6IGZhbHNlLFxuICBmYXN0S2V5OiBmYXN0S2V5LFxuICBnZXRXZWFrOiBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgbWFjcm90YXNrID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldDtcbnZhciBPYnNlcnZlciA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciBQcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XG52YXIgaXNOb2RlID0gcmVxdWlyZSgnLi9fY29mJykocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGhlYWQsIGxhc3QsIG5vdGlmeTtcblxuICB2YXIgZmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudCwgZm47XG4gICAgaWYgKGlzTm9kZSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKSBwYXJlbnQuZXhpdCgpO1xuICAgIHdoaWxlIChoZWFkKSB7XG4gICAgICBmbiA9IGhlYWQuZm47XG4gICAgICBoZWFkID0gaGVhZC5uZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm4oKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGhlYWQpIG5vdGlmeSgpO1xuICAgICAgICBlbHNlIGxhc3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBsYXN0ID0gdW5kZWZpbmVkO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5lbnRlcigpO1xuICB9O1xuXG4gIC8vIE5vZGUuanNcbiAgaWYgKGlzTm9kZSkge1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIC8vIGJyb3dzZXJzIHdpdGggTXV0YXRpb25PYnNlcnZlciwgZXhjZXB0IGlPUyBTYWZhcmkgLSBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMzM5XG4gIH0gZWxzZSBpZiAoT2JzZXJ2ZXIgJiYgIShnbG9iYWwubmF2aWdhdG9yICYmIGdsb2JhbC5uYXZpZ2F0b3Iuc3RhbmRhbG9uZSkpIHtcbiAgICB2YXIgdG9nZ2xlID0gdHJ1ZTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBuZXcgT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgIG5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIG5vZGUuZGF0YSA9IHRvZ2dsZSA9ICF0b2dnbGU7XG4gICAgfTtcbiAgLy8gZW52aXJvbm1lbnRzIHdpdGggbWF5YmUgbm9uLWNvbXBsZXRlbHkgY29ycmVjdCwgYnV0IGV4aXN0ZW50IFByb21pc2VcbiAgfSBlbHNlIGlmIChQcm9taXNlICYmIFByb21pc2UucmVzb2x2ZSkge1xuICAgIC8vIFByb21pc2UucmVzb2x2ZSB3aXRob3V0IGFuIGFyZ3VtZW50IHRocm93cyBhbiBlcnJvciBpbiBMRyBXZWJPUyAyXG4gICAgdmFyIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBwcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH07XG4gIC8vIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLSBtYWNyb3Rhc2sgYmFzZWQgb246XG4gIC8vIC0gc2V0SW1tZWRpYXRlXG4gIC8vIC0gTWVzc2FnZUNoYW5uZWxcbiAgLy8gLSB3aW5kb3cucG9zdE1lc3NhZ1xuICAvLyAtIG9ucmVhZHlzdGF0ZWNoYW5nZVxuICAvLyAtIHNldFRpbWVvdXRcbiAgfSBlbHNlIHtcbiAgICBub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgICBtYWNyb3Rhc2suY2FsbChnbG9iYWwsIGZsdXNoKTtcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChmbikge1xuICAgIHZhciB0YXNrID0geyBmbjogZm4sIG5leHQ6IHVuZGVmaW5lZCB9O1xuICAgIGlmIChsYXN0KSBsYXN0Lm5leHQgPSB0YXNrO1xuICAgIGlmICghaGVhZCkge1xuICAgICAgaGVhZCA9IHRhc2s7XG4gICAgICBub3RpZnkoKTtcbiAgICB9IGxhc3QgPSB0YXNrO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIDI1LjQuMS41IE5ld1Byb21pc2VDYXBhYmlsaXR5KEMpXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xuXG5mdW5jdGlvbiBQcm9taXNlQ2FwYWJpbGl0eShDKSB7XG4gIHZhciByZXNvbHZlLCByZWplY3Q7XG4gIHRoaXMucHJvbWlzZSA9IG5ldyBDKGZ1bmN0aW9uICgkJHJlc29sdmUsICQkcmVqZWN0KSB7XG4gICAgaWYgKHJlc29sdmUgIT09IHVuZGVmaW5lZCB8fCByZWplY3QgIT09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKCdCYWQgUHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIHJlc29sdmUgPSAkJHJlc29sdmU7XG4gICAgcmVqZWN0ID0gJCRyZWplY3Q7XG4gIH0pO1xuICB0aGlzLnJlc29sdmUgPSBhRnVuY3Rpb24ocmVzb2x2ZSk7XG4gIHRoaXMucmVqZWN0ID0gYUZ1bmN0aW9uKHJlamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiAoQykge1xuICByZXR1cm4gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpO1xufTtcbiIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgZFBzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xudmFyIElFX1BST1RPID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJyk7XG4gIHZhciBpID0gZW51bUJ1Z0tleXMubGVuZ3RoO1xuICB2YXIgbHQgPSAnPCc7XG4gIHZhciBndCA9ICc+JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKGx0ICsgJ3NjcmlwdCcgKyBndCArICdkb2N1bWVudC5GPU9iamVjdCcgKyBsdCArICcvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlIChpLS0pIGRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xufTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpO1xudmFyIGRQID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZSkgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBnZXRLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIFA7XG4gIHdoaWxlIChsZW5ndGggPiBpKSBkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgcElFID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xudmFyIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi9faGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpO1xudmFyIGdPUEQgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZ09QRCA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKSB7XG4gIE8gPSB0b0lPYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBnT1BEKE8sIFApO1xuICB9IGNhdGNoIChlKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKGhhcyhPLCBQKSkgcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgZ09QTiA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZjtcbnZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuIiwiLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxudmFyICRrZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCIvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiAoTykge1xuICBPID0gdG9PYmplY3QoTyk7XG4gIGlmIChoYXMoTywgSUVfUFJPVE8pKSByZXR1cm4gT1tJRV9QUk9UT107XG4gIGlmICh0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKSB7XG4gICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSk7XG52YXIgSUVfUFJPVE8gPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0lPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pIGlmIChrZXkgIT0gSUVfUFJPVE8pIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuIiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuL19mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoS0VZLCBleGVjKSB7XG4gIHZhciBmbiA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXTtcbiAgdmFyIGV4cCA9IHt9O1xuICBleHBbS0VZXSA9IGV4ZWMoZm4pO1xuICAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIGZhaWxzKGZ1bmN0aW9uICgpIHsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChleGVjKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHsgZTogZmFsc2UsIHY6IGV4ZWMoKSB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIHsgZTogdHJ1ZSwgdjogZSB9O1xuICB9XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IHJlcXVpcmUoJy4vX25ldy1wcm9taXNlLWNhcGFiaWxpdHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQywgeCkge1xuICBhbk9iamVjdChDKTtcbiAgaWYgKGlzT2JqZWN0KHgpICYmIHguY29uc3RydWN0b3IgPT09IEMpIHJldHVybiB4O1xuICB2YXIgcHJvbWlzZUNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eS5mKEMpO1xuICB2YXIgcmVzb2x2ZSA9IHByb21pc2VDYXBhYmlsaXR5LnJlc29sdmU7XG4gIHJlc29sdmUoeCk7XG4gIHJldHVybiBwcm9taXNlQ2FwYWJpbGl0eS5wcm9taXNlO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGJpdG1hcCwgdmFsdWUpIHtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZTogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZTogdmFsdWVcbiAgfTtcbn07XG4iLCJ2YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRhcmdldCwgc3JjLCBzYWZlKSB7XG4gIGZvciAodmFyIGtleSBpbiBzcmMpIHtcbiAgICBpZiAoc2FmZSAmJiB0YXJnZXRba2V5XSkgdGFyZ2V0W2tleV0gPSBzcmNba2V5XTtcbiAgICBlbHNlIGhpZGUodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcbiAgfSByZXR1cm4gdGFyZ2V0O1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faGlkZScpO1xuIiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uIChPLCBwcm90bykge1xuICBhbk9iamVjdChPKTtcbiAgaWYgKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpIHRocm93IFR5cGVFcnJvcihwcm90byArIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGZ1bmN0aW9uICh0ZXN0LCBidWdneSwgc2V0KSB7XG4gICAgICB0cnkge1xuICAgICAgICBzZXQgPSByZXF1aXJlKCcuL19jdHgnKShGdW5jdGlvbi5jYWxsLCByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmYoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgIHNldCh0ZXN0LCBbXSk7XG4gICAgICAgIGJ1Z2d5ID0gISh0ZXN0IGluc3RhbmNlb2YgQXJyYXkpO1xuICAgICAgfSBjYXRjaCAoZSkgeyBidWdneSA9IHRydWU7IH1cbiAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90bykge1xuICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgIGlmIChidWdneSkgTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xuICAgICAgICByZXR1cm4gTztcbiAgICAgIH07XG4gICAgfSh7fSwgZmFsc2UpIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKTtcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKEtFWSkge1xuICB2YXIgQyA9IHR5cGVvZiBjb3JlW0tFWV0gPT0gJ2Z1bmN0aW9uJyA/IGNvcmVbS0VZXSA6IGdsb2JhbFtLRVldO1xuICBpZiAoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSkgZFAuZihDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07XG4iLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBoYXMgPSByZXF1aXJlKCcuL19oYXMnKTtcbnZhciBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIHRhZywgc3RhdCkge1xuICBpZiAoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkgZGVmKGl0LCBUQUcsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnIH0pO1xufTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwidmFyIGNvcmUgPSByZXF1aXJlKCcuL19jb3JlJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0gdmFsdWUgIT09IHVuZGVmaW5lZCA/IHZhbHVlIDoge30pO1xufSkoJ3ZlcnNpb25zJywgW10pLnB1c2goe1xuICB2ZXJzaW9uOiBjb3JlLnZlcnNpb24sXG4gIG1vZGU6IHJlcXVpcmUoJy4vX2xpYnJhcnknKSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE4IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG4iLCIvLyA3LjMuMjAgU3BlY2llc0NvbnN0cnVjdG9yKE8sIGRlZmF1bHRDb25zdHJ1Y3RvcilcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBTUEVDSUVTID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE8sIEQpIHtcbiAgdmFyIEMgPSBhbk9iamVjdChPKS5jb25zdHJ1Y3RvcjtcbiAgdmFyIFM7XG4gIHJldHVybiBDID09PSB1bmRlZmluZWQgfHwgKFMgPSBhbk9iamVjdChDKVtTUEVDSUVTXSkgPT0gdW5kZWZpbmVkID8gRCA6IGFGdW5jdGlvbihTKTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpO1xudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVE9fU1RSSU5HKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGhhdCwgcG9zKSB7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSk7XG4gICAgdmFyIGkgPSB0b0ludGVnZXIocG9zKTtcbiAgICB2YXIgbCA9IHMubGVuZ3RoO1xuICAgIHZhciBhLCBiO1xuICAgIGlmIChpIDwgMCB8fCBpID49IGwpIHJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59O1xuIiwidmFyIGN0eCA9IHJlcXVpcmUoJy4vX2N0eCcpO1xudmFyIGludm9rZSA9IHJlcXVpcmUoJy4vX2ludm9rZScpO1xudmFyIGh0bWwgPSByZXF1aXJlKCcuL19odG1sJyk7XG52YXIgY2VsID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciBzZXRUYXNrID0gZ2xvYmFsLnNldEltbWVkaWF0ZTtcbnZhciBjbGVhclRhc2sgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGU7XG52YXIgTWVzc2FnZUNoYW5uZWwgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWw7XG52YXIgRGlzcGF0Y2ggPSBnbG9iYWwuRGlzcGF0Y2g7XG52YXIgY291bnRlciA9IDA7XG52YXIgcXVldWUgPSB7fTtcbnZhciBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJztcbnZhciBkZWZlciwgY2hhbm5lbCwgcG9ydDtcbnZhciBydW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBpZCA9ICt0aGlzO1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gIGlmIChxdWV1ZS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59O1xudmFyIGxpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xufTtcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcbmlmICghc2V0VGFzayB8fCAhY2xlYXJUYXNrKSB7XG4gIHNldFRhc2sgPSBmdW5jdGlvbiBzZXRJbW1lZGlhdGUoZm4pIHtcbiAgICB2YXIgYXJncyA9IFtdO1xuICAgIHZhciBpID0gMTtcbiAgICB3aGlsZSAoYXJndW1lbnRzLmxlbmd0aCA+IGkpIGFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gICAgcXVldWVbKytjb3VudGVyXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICAgICAgaW52b2tlKHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xuICAgIH07XG4gICAgZGVmZXIoY291bnRlcik7XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH07XG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGlkKSB7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbiAgLy8gTm9kZS5qcyAwLjgtXG4gIGlmIChyZXF1aXJlKCcuL19jb2YnKShwcm9jZXNzKSA9PSAncHJvY2VzcycpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjdHgocnVuLCBpZCwgMSkpO1xuICAgIH07XG4gIC8vIFNwaGVyZSAoSlMgZ2FtZSBlbmdpbmUpIERpc3BhdGNoIEFQSVxuICB9IGVsc2UgaWYgKERpc3BhdGNoICYmIERpc3BhdGNoLm5vdykge1xuICAgIGRlZmVyID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBEaXNwYXRjaC5ub3coY3R4KHJ1biwgaWQsIDEpKTtcbiAgICB9O1xuICAvLyBCcm93c2VycyB3aXRoIE1lc3NhZ2VDaGFubmVsLCBpbmNsdWRlcyBXZWJXb3JrZXJzXG4gIH0gZWxzZSBpZiAoTWVzc2FnZUNoYW5uZWwpIHtcbiAgICBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgcG9ydCA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0ZW5lcjtcbiAgICBkZWZlciA9IGN0eChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBwb3N0TWVzc2FnZSwgc2tpcCBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzICdvYmplY3QnXG4gIH0gZWxzZSBpZiAoZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIgJiYgdHlwZW9mIHBvc3RNZXNzYWdlID09ICdmdW5jdGlvbicgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGdsb2JhbC5wb3N0TWVzc2FnZShpZCArICcnLCAnKicpO1xuICAgIH07XG4gICAgZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAvLyBJRTgtXG4gIH0gZWxzZSBpZiAoT05SRUFEWVNUQVRFQ0hBTkdFIGluIGNlbCgnc2NyaXB0JykpIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjZWwoJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICBydW4uY2FsbChpZCk7XG4gICAgICB9O1xuICAgIH07XG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXG4gIH0gZWxzZSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBzZXRUYXNrLFxuICBjbGVhcjogY2xlYXJUYXNrXG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKTtcbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07XG4iLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTtcbiIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0Jyk7XG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07XG4iLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJyk7XG52YXIgbWluID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcbiIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59O1xuIiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIFMpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIGlkID0gMDtcbnZhciBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJyk7XG52YXIgbmF2aWdhdG9yID0gZ2xvYmFsLm5hdmlnYXRvcjtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJztcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIExJQlJBUlkgPSByZXF1aXJlKCcuL19saWJyYXJ5Jyk7XG52YXIgd2tzRXh0ID0gcmVxdWlyZSgnLi9fd2tzLWV4dCcpO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgdmFyICRTeW1ib2wgPSBjb3JlLlN5bWJvbCB8fCAoY29yZS5TeW1ib2wgPSBMSUJSQVJZID8ge30gOiBnbG9iYWwuU3ltYm9sIHx8IHt9KTtcbiAgaWYgKG5hbWUuY2hhckF0KDApICE9ICdfJyAmJiAhKG5hbWUgaW4gJFN5bWJvbCkpIGRlZmluZVByb3BlcnR5KCRTeW1ib2wsIG5hbWUsIHsgdmFsdWU6IHdrc0V4dC5mKG5hbWUpIH0pO1xufTtcbiIsImV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX3drcycpO1xuIiwidmFyIHN0b3JlID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbDtcbnZhciBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xuXG52YXIgJGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuXG4kZXhwb3J0cy5zdG9yZSA9IHN0b3JlO1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgSVRFUkFUT1IgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fY29yZScpLmdldEl0ZXJhdG9yTWV0aG9kID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCAhPSB1bmRlZmluZWQpIHJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgYWRkVG9VbnNjb3BhYmxlcyA9IHJlcXVpcmUoJy4vX2FkZC10by11bnNjb3BhYmxlcycpO1xudmFyIHN0ZXAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKTtcbnZhciBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24gKGl0ZXJhdGVkLCBraW5kKSB7XG4gIHRoaXMuX3QgPSB0b0lPYmplY3QoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbiAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgIC8vIGtpbmRcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgTyA9IHRoaXMuX3Q7XG4gIHZhciBraW5kID0gdGhpcy5faztcbiAgdmFyIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZiAoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpIHtcbiAgICB0aGlzLl90ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmIChraW5kID09ICdrZXlzJykgcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZiAoa2luZCA9PSAndmFsdWVzJykgcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbmFkZFRvVW5zY29wYWJsZXMoJ2tleXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ3ZhbHVlcycpO1xuYWRkVG9VbnNjb3BhYmxlcygnZW50cmllcycpO1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7IGNyZWF0ZTogcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpIH0pO1xuIiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbi8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpLCAnT2JqZWN0JywgeyBkZWZpbmVQcm9wZXJ0eTogcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZiB9KTtcbiIsIi8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG52YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJykuZjtcblxucmVxdWlyZSgnLi9fb2JqZWN0LXNhcCcpKCdnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3InLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSkge1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTtcbiIsIi8vIDE5LjEuMi45IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgJGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldFByb3RvdHlwZU9mJywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpIHtcbiAgICByZXR1cm4gJGdldFByb3RvdHlwZU9mKHRvT2JqZWN0KGl0KSk7XG4gIH07XG59KTtcbiIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7IHNldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuL19zZXQtcHJvdG8nKS5zZXQgfSk7XG4iLCIiLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vX3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciB0YXNrID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldDtcbnZhciBtaWNyb3Rhc2sgPSByZXF1aXJlKCcuL19taWNyb3Rhc2snKSgpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5TW9kdWxlID0gcmVxdWlyZSgnLi9fbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuL19wZXJmb3JtJyk7XG52YXIgdXNlckFnZW50ID0gcmVxdWlyZSgnLi9fdXNlci1hZ2VudCcpO1xudmFyIHByb21pc2VSZXNvbHZlID0gcmVxdWlyZSgnLi9fcHJvbWlzZS1yZXNvbHZlJyk7XG52YXIgUFJPTUlTRSA9ICdQcm9taXNlJztcbnZhciBUeXBlRXJyb3IgPSBnbG9iYWwuVHlwZUVycm9yO1xudmFyIHByb2Nlc3MgPSBnbG9iYWwucHJvY2VzcztcbnZhciB2ZXJzaW9ucyA9IHByb2Nlc3MgJiYgcHJvY2Vzcy52ZXJzaW9ucztcbnZhciB2OCA9IHZlcnNpb25zICYmIHZlcnNpb25zLnY4IHx8ICcnO1xudmFyICRQcm9taXNlID0gZ2xvYmFsW1BST01JU0VdO1xudmFyIGlzTm9kZSA9IGNsYXNzb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnO1xudmFyIGVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xudmFyIEludGVybmFsLCBuZXdHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHksIE93blByb21pc2VDYXBhYmlsaXR5LCBXcmFwcGVyO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZjtcblxudmFyIFVTRV9OQVRJVkUgPSAhIWZ1bmN0aW9uICgpIHtcbiAgdHJ5IHtcbiAgICAvLyBjb3JyZWN0IHN1YmNsYXNzaW5nIHdpdGggQEBzcGVjaWVzIHN1cHBvcnRcbiAgICB2YXIgcHJvbWlzZSA9ICRQcm9taXNlLnJlc29sdmUoMSk7XG4gICAgdmFyIEZha2VQcm9taXNlID0gKHByb21pc2UuY29uc3RydWN0b3IgPSB7fSlbcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKV0gPSBmdW5jdGlvbiAoZXhlYykge1xuICAgICAgZXhlYyhlbXB0eSwgZW1wdHkpO1xuICAgIH07XG4gICAgLy8gdW5oYW5kbGVkIHJlamVjdGlvbnMgdHJhY2tpbmcgc3VwcG9ydCwgTm9kZUpTIFByb21pc2Ugd2l0aG91dCBpdCBmYWlscyBAQHNwZWNpZXMgdGVzdFxuICAgIHJldHVybiAoaXNOb2RlIHx8IHR5cGVvZiBQcm9taXNlUmVqZWN0aW9uRXZlbnQgPT0gJ2Z1bmN0aW9uJylcbiAgICAgICYmIHByb21pc2UudGhlbihlbXB0eSkgaW5zdGFuY2VvZiBGYWtlUHJvbWlzZVxuICAgICAgLy8gdjggNi42IChOb2RlIDEwIGFuZCBDaHJvbWUgNjYpIGhhdmUgYSBidWcgd2l0aCByZXNvbHZpbmcgY3VzdG9tIHRoZW5hYmxlc1xuICAgICAgLy8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL2Nocm9taXVtL2lzc3Vlcy9kZXRhaWw/aWQ9ODMwNTY1XG4gICAgICAvLyB3ZSBjYW4ndCBkZXRlY3QgaXQgc3luY2hyb25vdXNseSwgc28ganVzdCBjaGVjayB2ZXJzaW9uc1xuICAgICAgJiYgdjguaW5kZXhPZignNi42JykgIT09IDBcbiAgICAgICYmIHVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUvNjYnKSA9PT0gLTE7XG4gIH0gY2F0Y2ggKGUpIHsgLyogZW1wdHkgKi8gfVxufSgpO1xuXG4vLyBoZWxwZXJzXG52YXIgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgdGhlbjtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiB0eXBlb2YgKHRoZW4gPSBpdC50aGVuKSA9PSAnZnVuY3Rpb24nID8gdGhlbiA6IGZhbHNlO1xufTtcbnZhciBub3RpZnkgPSBmdW5jdGlvbiAocHJvbWlzZSwgaXNSZWplY3QpIHtcbiAgaWYgKHByb21pc2UuX24pIHJldHVybjtcbiAgcHJvbWlzZS5fbiA9IHRydWU7XG4gIHZhciBjaGFpbiA9IHByb21pc2UuX2M7XG4gIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdjtcbiAgICB2YXIgb2sgPSBwcm9taXNlLl9zID09IDE7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBydW4gPSBmdW5jdGlvbiAocmVhY3Rpb24pIHtcbiAgICAgIHZhciBoYW5kbGVyID0gb2sgPyByZWFjdGlvbi5vayA6IHJlYWN0aW9uLmZhaWw7XG4gICAgICB2YXIgcmVzb2x2ZSA9IHJlYWN0aW9uLnJlc29sdmU7XG4gICAgICB2YXIgcmVqZWN0ID0gcmVhY3Rpb24ucmVqZWN0O1xuICAgICAgdmFyIGRvbWFpbiA9IHJlYWN0aW9uLmRvbWFpbjtcbiAgICAgIHZhciByZXN1bHQsIHRoZW4sIGV4aXRlZDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChoYW5kbGVyKSB7XG4gICAgICAgICAgaWYgKCFvaykge1xuICAgICAgICAgICAgaWYgKHByb21pc2UuX2ggPT0gMikgb25IYW5kbGVVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgICAgICAgICBwcm9taXNlLl9oID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGhhbmRsZXIgPT09IHRydWUpIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRvbWFpbikgZG9tYWluLmVudGVyKCk7XG4gICAgICAgICAgICByZXN1bHQgPSBoYW5kbGVyKHZhbHVlKTsgLy8gbWF5IHRocm93XG4gICAgICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgICAgIGV4aXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXN1bHQgPT09IHJlYWN0aW9uLnByb21pc2UpIHtcbiAgICAgICAgICAgIHJlamVjdChUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGVuID0gaXNUaGVuYWJsZShyZXN1bHQpKSB7XG4gICAgICAgICAgICB0aGVuLmNhbGwocmVzdWx0LCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0gZWxzZSByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSByZWplY3QodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZG9tYWluICYmICFleGl0ZWQpIGRvbWFpbi5leGl0KCk7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHdoaWxlIChjaGFpbi5sZW5ndGggPiBpKSBydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXG4gICAgcHJvbWlzZS5fYyA9IFtdO1xuICAgIHByb21pc2UuX24gPSBmYWxzZTtcbiAgICBpZiAoaXNSZWplY3QgJiYgIXByb21pc2UuX2gpIG9uVW5oYW5kbGVkKHByb21pc2UpO1xuICB9KTtcbn07XG52YXIgb25VbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSkge1xuICB0YXNrLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdjtcbiAgICB2YXIgdW5oYW5kbGVkID0gaXNVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgdmFyIHJlc3VsdCwgaGFuZGxlciwgY29uc29sZTtcbiAgICBpZiAodW5oYW5kbGVkKSB7XG4gICAgICByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGlzTm9kZSkge1xuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPSBnbG9iYWwub251bmhhbmRsZWRyZWplY3Rpb24pIHtcbiAgICAgICAgICBoYW5kbGVyKHsgcHJvbWlzZTogcHJvbWlzZSwgcmVhc29uOiB2YWx1ZSB9KTtcbiAgICAgICAgfSBlbHNlIGlmICgoY29uc29sZSA9IGdsb2JhbC5jb25zb2xlKSAmJiBjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIEJyb3dzZXJzIHNob3VsZCBub3QgdHJpZ2dlciBgcmVqZWN0aW9uSGFuZGxlZGAgZXZlbnQgaWYgaXQgd2FzIGhhbmRsZWQgaGVyZSwgTm9kZUpTIC0gc2hvdWxkXG4gICAgICBwcm9taXNlLl9oID0gaXNOb2RlIHx8IGlzVW5oYW5kbGVkKHByb21pc2UpID8gMiA6IDE7XG4gICAgfSBwcm9taXNlLl9hID0gdW5kZWZpbmVkO1xuICAgIGlmICh1bmhhbmRsZWQgJiYgcmVzdWx0LmUpIHRocm93IHJlc3VsdC52O1xuICB9KTtcbn07XG52YXIgaXNVbmhhbmRsZWQgPSBmdW5jdGlvbiAocHJvbWlzZSkge1xuICByZXR1cm4gcHJvbWlzZS5faCAhPT0gMSAmJiAocHJvbWlzZS5fYSB8fCBwcm9taXNlLl9jKS5sZW5ndGggPT09IDA7XG59O1xudmFyIG9uSGFuZGxlVW5oYW5kbGVkID0gZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24gKCkge1xuICAgIHZhciBoYW5kbGVyO1xuICAgIGlmIChpc05vZGUpIHtcbiAgICAgIHByb2Nlc3MuZW1pdCgncmVqZWN0aW9uSGFuZGxlZCcsIHByb21pc2UpO1xuICAgIH0gZWxzZSBpZiAoaGFuZGxlciA9IGdsb2JhbC5vbnJlamVjdGlvbmhhbmRsZWQpIHtcbiAgICAgIGhhbmRsZXIoeyBwcm9taXNlOiBwcm9taXNlLCByZWFzb246IHByb21pc2UuX3YgfSk7XG4gICAgfVxuICB9KTtcbn07XG52YXIgJHJlamVjdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgcHJvbWlzZSA9IHRoaXM7XG4gIGlmIChwcm9taXNlLl9kKSByZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgcHJvbWlzZS5fdiA9IHZhbHVlO1xuICBwcm9taXNlLl9zID0gMjtcbiAgaWYgKCFwcm9taXNlLl9hKSBwcm9taXNlLl9hID0gcHJvbWlzZS5fYy5zbGljZSgpO1xuICBub3RpZnkocHJvbWlzZSwgdHJ1ZSk7XG59O1xudmFyICRyZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBwcm9taXNlID0gdGhpcztcbiAgdmFyIHRoZW47XG4gIGlmIChwcm9taXNlLl9kKSByZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgdHJ5IHtcbiAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHRocm93IFR5cGVFcnJvcihcIlByb21pc2UgY2FuJ3QgYmUgcmVzb2x2ZWQgaXRzZWxmXCIpO1xuICAgIGlmICh0aGVuID0gaXNUaGVuYWJsZSh2YWx1ZSkpIHtcbiAgICAgIG1pY3JvdGFzayhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3cmFwcGVyID0geyBfdzogcHJvbWlzZSwgX2Q6IGZhbHNlIH07IC8vIHdyYXBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eCgkcmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eCgkcmVqZWN0LCB3cmFwcGVyLCAxKSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAkcmVqZWN0LmNhbGwod3JhcHBlciwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlLl92ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zID0gMTtcbiAgICAgIG5vdGlmeShwcm9taXNlLCBmYWxzZSk7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgJHJlamVjdC5jYWxsKHsgX3c6IHByb21pc2UsIF9kOiBmYWxzZSB9LCBlKTsgLy8gd3JhcFxuICB9XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBwb2x5ZmlsbFxuaWYgKCFVU0VfTkFUSVZFKSB7XG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXG4gICRQcm9taXNlID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIGFuSW5zdGFuY2UodGhpcywgJFByb21pc2UsIFBST01JU0UsICdfaCcpO1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgSW50ZXJuYWwuY2FsbCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCB0aGlzLCAxKSwgY3R4KCRyZWplY3QsIHRoaXMsIDEpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICRyZWplY3QuY2FsbCh0aGlzLCBlcnIpO1xuICAgIH1cbiAgfTtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG4gIEludGVybmFsID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcikge1xuICAgIHRoaXMuX2MgPSBbXTsgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXG4gICAgdGhpcy5fYSA9IHVuZGVmaW5lZDsgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xuICAgIHRoaXMuX3MgPSAwOyAgICAgICAgICAgICAgLy8gPC0gc3RhdGVcbiAgICB0aGlzLl9kID0gZmFsc2U7ICAgICAgICAgIC8vIDwtIGRvbmVcbiAgICB0aGlzLl92ID0gdW5kZWZpbmVkOyAgICAgIC8vIDwtIHZhbHVlXG4gICAgdGhpcy5faCA9IDA7ICAgICAgICAgICAgICAvLyA8LSByZWplY3Rpb24gc3RhdGUsIDAgLSBkZWZhdWx0LCAxIC0gaGFuZGxlZCwgMiAtIHVuaGFuZGxlZFxuICAgIHRoaXMuX24gPSBmYWxzZTsgICAgICAgICAgLy8gPC0gbm90aWZ5XG4gIH07XG4gIEludGVybmFsLnByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpKCRQcm9taXNlLnByb3RvdHlwZSwge1xuICAgIC8vIDI1LjQuNS4zIFByb21pc2UucHJvdG90eXBlLnRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpXG4gICAgdGhlbjogZnVuY3Rpb24gdGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgdmFyIHJlYWN0aW9uID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoc3BlY2llc0NvbnN0cnVjdG9yKHRoaXMsICRQcm9taXNlKSk7XG4gICAgICByZWFjdGlvbi5vayA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PSAnZnVuY3Rpb24nID8gb25GdWxmaWxsZWQgOiB0cnVlO1xuICAgICAgcmVhY3Rpb24uZmFpbCA9IHR5cGVvZiBvblJlamVjdGVkID09ICdmdW5jdGlvbicgJiYgb25SZWplY3RlZDtcbiAgICAgIHJlYWN0aW9uLmRvbWFpbiA9IGlzTm9kZSA/IHByb2Nlc3MuZG9tYWluIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fYy5wdXNoKHJlYWN0aW9uKTtcbiAgICAgIGlmICh0aGlzLl9hKSB0aGlzLl9hLnB1c2gocmVhY3Rpb24pO1xuICAgICAgaWYgKHRoaXMuX3MpIG5vdGlmeSh0aGlzLCBmYWxzZSk7XG4gICAgICByZXR1cm4gcmVhY3Rpb24ucHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xuICBPd25Qcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJvbWlzZSA9IG5ldyBJbnRlcm5hbCgpO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gICAgdGhpcy5yZXNvbHZlID0gY3R4KCRyZXNvbHZlLCBwcm9taXNlLCAxKTtcbiAgICB0aGlzLnJlamVjdCA9IGN0eCgkcmVqZWN0LCBwcm9taXNlLCAxKTtcbiAgfTtcbiAgbmV3UHJvbWlzZUNhcGFiaWxpdHlNb2R1bGUuZiA9IG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gZnVuY3Rpb24gKEMpIHtcbiAgICByZXR1cm4gQyA9PT0gJFByb21pc2UgfHwgQyA9PT0gV3JhcHBlclxuICAgICAgPyBuZXcgT3duUHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICAgIDogbmV3R2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7IFByb21pc2U6ICRQcm9taXNlIH0pO1xucmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKSgkUHJvbWlzZSwgUFJPTUlTRSk7XG5yZXF1aXJlKCcuL19zZXQtc3BlY2llcycpKFBST01JU0UpO1xuV3JhcHBlciA9IHJlcXVpcmUoJy4vX2NvcmUnKVtQUk9NSVNFXTtcblxuLy8gc3RhdGljc1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKSB7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKTtcbiAgICB2YXIgJCRyZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAkJHJlamVjdChyKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKExJQlJBUlkgfHwgIVVTRV9OQVRJVkUpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHgpIHtcbiAgICByZXR1cm4gcHJvbWlzZVJlc29sdmUoTElCUkFSWSAmJiB0aGlzID09PSBXcmFwcGVyID8gJFByb21pc2UgOiB0aGlzLCB4KTtcbiAgfVxufSk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICEoVVNFX05BVElWRSAmJiByZXF1aXJlKCcuL19pdGVyLWRldGVjdCcpKGZ1bmN0aW9uIChpdGVyKSB7XG4gICRQcm9taXNlLmFsbChpdGVyKVsnY2F0Y2gnXShlbXB0eSk7XG59KSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjEgUHJvbWlzZS5hbGwoaXRlcmFibGUpXG4gIGFsbDogZnVuY3Rpb24gYWxsKGl0ZXJhYmxlKSB7XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQyk7XG4gICAgdmFyIHJlc29sdmUgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgdmFyIHJlamVjdCA9IGNhcGFiaWxpdHkucmVqZWN0O1xuICAgIHZhciByZXN1bHQgPSBwZXJmb3JtKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICB2YXIgcmVtYWluaW5nID0gMTtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24gKHByb21pc2UpIHtcbiAgICAgICAgdmFyICRpbmRleCA9IGluZGV4Kys7XG4gICAgICAgIHZhciBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICBpZiAoYWxyZWFkeUNhbGxlZCkgcmV0dXJuO1xuICAgICAgICAgIGFscmVhZHlDYWxsZWQgPSB0cnVlO1xuICAgICAgICAgIHZhbHVlc1skaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdC5lKSByZWplY3QocmVzdWx0LnYpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH0sXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSkge1xuICAgIHZhciBDID0gdGhpcztcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KEMpO1xuICAgIHZhciByZWplY3QgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgcmVzdWx0ID0gcGVyZm9ybShmdW5jdGlvbiAoKSB7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uIChwcm9taXNlKSB7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGNhcGFiaWxpdHkucmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQuZSkgcmVqZWN0KHJlc3VsdC52KTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkYXQgPSByZXF1aXJlKCcuL19zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbiAoaXRlcmF0ZWQpIHtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24gKCkge1xuICB2YXIgTyA9IHRoaXMuX3Q7XG4gIHZhciBpbmRleCA9IHRoaXMuX2k7XG4gIHZhciBwb2ludDtcbiAgaWYgKGluZGV4ID49IE8ubGVuZ3RoKSByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7IHZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2UgfTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpO1xudmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKTtcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuL19yZWRlZmluZScpO1xudmFyIE1FVEEgPSByZXF1aXJlKCcuL19tZXRhJykuS0VZO1xudmFyICRmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJyk7XG52YXIgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4vX3VpZCcpO1xudmFyIHdrcyA9IHJlcXVpcmUoJy4vX3drcycpO1xudmFyIHdrc0V4dCA9IHJlcXVpcmUoJy4vX3drcy1leHQnKTtcbnZhciB3a3NEZWZpbmUgPSByZXF1aXJlKCcuL193a3MtZGVmaW5lJyk7XG52YXIgZW51bUtleXMgPSByZXF1aXJlKCcuL19lbnVtLWtleXMnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi9faXMtYXJyYXknKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJyk7XG52YXIgY3JlYXRlRGVzYyA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcbnZhciBfY3JlYXRlID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpO1xudmFyIGdPUE5FeHQgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbi1leHQnKTtcbnZhciAkR09QRCA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJyk7XG52YXIgJERQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJyk7XG52YXIgJGtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xudmFyIGdPUEQgPSAkR09QRC5mO1xudmFyIGRQID0gJERQLmY7XG52YXIgZ09QTiA9IGdPUE5FeHQuZjtcbnZhciAkU3ltYm9sID0gZ2xvYmFsLlN5bWJvbDtcbnZhciAkSlNPTiA9IGdsb2JhbC5KU09OO1xudmFyIF9zdHJpbmdpZnkgPSAkSlNPTiAmJiAkSlNPTi5zdHJpbmdpZnk7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgSElEREVOID0gd2tzKCdfaGlkZGVuJyk7XG52YXIgVE9fUFJJTUlUSVZFID0gd2tzKCd0b1ByaW1pdGl2ZScpO1xudmFyIGlzRW51bSA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xudmFyIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKTtcbnZhciBBbGxTeW1ib2xzID0gc2hhcmVkKCdzeW1ib2xzJyk7XG52YXIgT1BTeW1ib2xzID0gc2hhcmVkKCdvcC1zeW1ib2xzJyk7XG52YXIgT2JqZWN0UHJvdG8gPSBPYmplY3RbUFJPVE9UWVBFXTtcbnZhciBVU0VfTkFUSVZFID0gdHlwZW9mICRTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcbnZhciBRT2JqZWN0ID0gZ2xvYmFsLlFPYmplY3Q7XG4vLyBEb24ndCB1c2Ugc2V0dGVycyBpbiBRdCBTY3JpcHQsIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8xNzNcbnZhciBzZXR0ZXIgPSAhUU9iamVjdCB8fCAhUU9iamVjdFtQUk9UT1RZUEVdIHx8ICFRT2JqZWN0W1BST1RPVFlQRV0uZmluZENoaWxkO1xuXG4vLyBmYWxsYmFjayBmb3Igb2xkIEFuZHJvaWQsIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD02ODdcbnZhciBzZXRTeW1ib2xEZXNjID0gREVTQ1JJUFRPUlMgJiYgJGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIF9jcmVhdGUoZFAoe30sICdhJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZFAodGhpcywgJ2EnLCB7IHZhbHVlOiA3IH0pLmE7IH1cbiAgfSkpLmEgIT0gNztcbn0pID8gZnVuY3Rpb24gKGl0LCBrZXksIEQpIHtcbiAgdmFyIHByb3RvRGVzYyA9IGdPUEQoT2JqZWN0UHJvdG8sIGtleSk7XG4gIGlmIChwcm90b0Rlc2MpIGRlbGV0ZSBPYmplY3RQcm90b1trZXldO1xuICBkUChpdCwga2V5LCBEKTtcbiAgaWYgKHByb3RvRGVzYyAmJiBpdCAhPT0gT2JqZWN0UHJvdG8pIGRQKE9iamVjdFByb3RvLCBrZXksIHByb3RvRGVzYyk7XG59IDogZFA7XG5cbnZhciB3cmFwID0gZnVuY3Rpb24gKHRhZykge1xuICB2YXIgc3ltID0gQWxsU3ltYm9sc1t0YWddID0gX2NyZWF0ZSgkU3ltYm9sW1BST1RPVFlQRV0pO1xuICBzeW0uX2sgPSB0YWc7XG4gIHJldHVybiBzeW07XG59O1xuXG52YXIgaXNTeW1ib2wgPSBVU0VfTkFUSVZFICYmIHR5cGVvZiAkU3ltYm9sLml0ZXJhdG9yID09ICdzeW1ib2wnID8gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCc7XG59IDogZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCBpbnN0YW5jZW9mICRTeW1ib2w7XG59O1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCkge1xuICBpZiAoaXQgPT09IE9iamVjdFByb3RvKSAkZGVmaW5lUHJvcGVydHkoT1BTeW1ib2xzLCBrZXksIEQpO1xuICBhbk9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEQpO1xuICBpZiAoaGFzKEFsbFN5bWJvbHMsIGtleSkpIHtcbiAgICBpZiAoIUQuZW51bWVyYWJsZSkge1xuICAgICAgaWYgKCFoYXMoaXQsIEhJRERFTikpIGRQKGl0LCBISURERU4sIGNyZWF0ZURlc2MoMSwge30pKTtcbiAgICAgIGl0W0hJRERFTl1ba2V5XSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSBpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSBfY3JlYXRlKEQsIHsgZW51bWVyYWJsZTogY3JlYXRlRGVzYygwLCBmYWxzZSkgfSk7XG4gICAgfSByZXR1cm4gc2V0U3ltYm9sRGVzYyhpdCwga2V5LCBEKTtcbiAgfSByZXR1cm4gZFAoaXQsIGtleSwgRCk7XG59O1xudmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCkge1xuICBhbk9iamVjdChpdCk7XG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvSU9iamVjdChQKSk7XG4gIHZhciBpID0gMDtcbiAgdmFyIGwgPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKGwgPiBpKSAkZGVmaW5lUHJvcGVydHkoaXQsIGtleSA9IGtleXNbaSsrXSwgUFtrZXldKTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciAkY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGl0LCBQKSB7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyBfY3JlYXRlKGl0KSA6ICRkZWZpbmVQcm9wZXJ0aWVzKF9jcmVhdGUoaXQpLCBQKTtcbn07XG52YXIgJHByb3BlcnR5SXNFbnVtZXJhYmxlID0gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KSB7XG4gIHZhciBFID0gaXNFbnVtLmNhbGwodGhpcywga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKSk7XG4gIGlmICh0aGlzID09PSBPYmplY3RQcm90byAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhaGFzKE9QU3ltYm9scywga2V5KSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldID8gRSA6IHRydWU7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSkge1xuICBpdCA9IHRvSU9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGlmIChpdCA9PT0gT2JqZWN0UHJvdG8gJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIWhhcyhPUFN5bWJvbHMsIGtleSkpIHJldHVybjtcbiAgdmFyIEQgPSBnT1BEKGl0LCBrZXkpO1xuICBpZiAoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKSBELmVudW1lcmFibGUgPSB0cnVlO1xuICByZXR1cm4gRDtcbn07XG52YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KSB7XG4gIHZhciBuYW1lcyA9IGdPUE4odG9JT2JqZWN0KGl0KSk7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGkgPSAwO1xuICB2YXIga2V5O1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkge1xuICAgIGlmICghaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4gJiYga2V5ICE9IE1FVEEpIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCkge1xuICB2YXIgSVNfT1AgPSBpdCA9PT0gT2JqZWN0UHJvdG87XG4gIHZhciBuYW1lcyA9IGdPUE4oSVNfT1AgPyBPUFN5bWJvbHMgOiB0b0lPYmplY3QoaXQpKTtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIgaSA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSB7XG4gICAgaWYgKGhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiAoSVNfT1AgPyBoYXMoT2JqZWN0UHJvdG8sIGtleSkgOiB0cnVlKSkgcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTtcblxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXG5pZiAoIVVTRV9OQVRJVkUpIHtcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCgpIHtcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mICRTeW1ib2wpIHRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yIScpO1xuICAgIHZhciB0YWcgPSB1aWQoYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpO1xuICAgIHZhciAkc2V0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodGhpcyA9PT0gT2JqZWN0UHJvdG8pICRzZXQuY2FsbChPUFN5bWJvbHMsIHZhbHVlKTtcbiAgICAgIGlmIChoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKSB0aGlzW0hJRERFTl1bdGFnXSA9IGZhbHNlO1xuICAgICAgc2V0U3ltYm9sRGVzYyh0aGlzLCB0YWcsIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbiAgICB9O1xuICAgIGlmIChERVNDUklQVE9SUyAmJiBzZXR0ZXIpIHNldFN5bWJvbERlc2MoT2JqZWN0UHJvdG8sIHRhZywgeyBjb25maWd1cmFibGU6IHRydWUsIHNldDogJHNldCB9KTtcbiAgICByZXR1cm4gd3JhcCh0YWcpO1xuICB9O1xuICByZWRlZmluZSgkU3ltYm9sW1BST1RPVFlQRV0sICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9rO1xuICB9KTtcblxuICAkR09QRC5mID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgJERQLmYgPSAkZGVmaW5lUHJvcGVydHk7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZiA9IGdPUE5FeHQuZiA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICByZXF1aXJlKCcuL19vYmplY3QtcGllJykuZiA9ICRwcm9wZXJ0eUlzRW51bWVyYWJsZTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKS5mID0gJGdldE93blByb3BlcnR5U3ltYm9scztcblxuICBpZiAoREVTQ1JJUFRPUlMgJiYgIXJlcXVpcmUoJy4vX2xpYnJhcnknKSkge1xuICAgIHJlZGVmaW5lKE9iamVjdFByb3RvLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCAkcHJvcGVydHlJc0VudW1lcmFibGUsIHRydWUpO1xuICB9XG5cbiAgd2tzRXh0LmYgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHJldHVybiB3cmFwKHdrcyhuYW1lKSk7XG4gIH07XG59XG5cbiRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsIHsgU3ltYm9sOiAkU3ltYm9sIH0pO1xuXG5mb3IgKHZhciBlczZTeW1ib2xzID0gKFxuICAvLyAxOS40LjIuMiwgMTkuNC4yLjMsIDE5LjQuMi40LCAxOS40LjIuNiwgMTkuNC4yLjgsIDE5LjQuMi45LCAxOS40LjIuMTAsIDE5LjQuMi4xMSwgMTkuNC4yLjEyLCAxOS40LjIuMTMsIDE5LjQuMi4xNFxuICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLHNwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXG4pLnNwbGl0KCcsJyksIGogPSAwOyBlczZTeW1ib2xzLmxlbmd0aCA+IGo7KXdrcyhlczZTeW1ib2xzW2orK10pO1xuXG5mb3IgKHZhciB3ZWxsS25vd25TeW1ib2xzID0gJGtleXMod2tzLnN0b3JlKSwgayA9IDA7IHdlbGxLbm93blN5bWJvbHMubGVuZ3RoID4gazspIHdrc0RlZmluZSh3ZWxsS25vd25TeW1ib2xzW2srK10pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnU3ltYm9sJywge1xuICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcbiAgJ2Zvcic6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cbiAgICAgIDogU3ltYm9sUmVnaXN0cnlba2V5XSA9ICRTeW1ib2woa2V5KTtcbiAgfSxcbiAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXG4gIGtleUZvcjogZnVuY3Rpb24ga2V5Rm9yKHN5bSkge1xuICAgIGlmICghaXNTeW1ib2woc3ltKSkgdGhyb3cgVHlwZUVycm9yKHN5bSArICcgaXMgbm90IGEgc3ltYm9sIScpO1xuICAgIGZvciAodmFyIGtleSBpbiBTeW1ib2xSZWdpc3RyeSkgaWYgKFN5bWJvbFJlZ2lzdHJ5W2tleV0gPT09IHN5bSkgcmV0dXJuIGtleTtcbiAgfSxcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbiAoKSB7IHNldHRlciA9IHRydWU7IH0sXG4gIHVzZVNpbXBsZTogZnVuY3Rpb24gKCkgeyBzZXR0ZXIgPSBmYWxzZTsgfVxufSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiAkY3JlYXRlLFxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICRkZWZpbmVQcm9wZXJ0eSxcbiAgLy8gMTkuMS4yLjMgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiAgZGVmaW5lUHJvcGVydGllczogJGRlZmluZVByb3BlcnRpZXMsXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHNcbn0pO1xuXG4vLyAyNC4zLjIgSlNPTi5zdHJpbmdpZnkodmFsdWUgWywgcmVwbGFjZXIgWywgc3BhY2VdXSlcbiRKU09OICYmICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKCFVU0VfTkFUSVZFIHx8ICRmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHZhciBTID0gJFN5bWJvbCgpO1xuICAvLyBNUyBFZGdlIGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyB7fVxuICAvLyBXZWJLaXQgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIG51bGxcbiAgLy8gVjggdGhyb3dzIG9uIGJveGVkIHN5bWJvbHNcbiAgcmV0dXJuIF9zdHJpbmdpZnkoW1NdKSAhPSAnW251bGxdJyB8fCBfc3RyaW5naWZ5KHsgYTogUyB9KSAhPSAne30nIHx8IF9zdHJpbmdpZnkoT2JqZWN0KFMpKSAhPSAne30nO1xufSkpLCAnSlNPTicsIHtcbiAgc3RyaW5naWZ5OiBmdW5jdGlvbiBzdHJpbmdpZnkoaXQpIHtcbiAgICB2YXIgYXJncyA9IFtpdF07XG4gICAgdmFyIGkgPSAxO1xuICAgIHZhciByZXBsYWNlciwgJHJlcGxhY2VyO1xuICAgIHdoaWxlIChhcmd1bWVudHMubGVuZ3RoID4gaSkgYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICAkcmVwbGFjZXIgPSByZXBsYWNlciA9IGFyZ3NbMV07XG4gICAgaWYgKCFpc09iamVjdChyZXBsYWNlcikgJiYgaXQgPT09IHVuZGVmaW5lZCB8fCBpc1N5bWJvbChpdCkpIHJldHVybjsgLy8gSUU4IHJldHVybnMgc3RyaW5nIG9uIHVuZGVmaW5lZFxuICAgIGlmICghaXNBcnJheShyZXBsYWNlcikpIHJlcGxhY2VyID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2YgJHJlcGxhY2VyID09ICdmdW5jdGlvbicpIHZhbHVlID0gJHJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWx1ZSk7XG4gICAgICBpZiAoIWlzU3ltYm9sKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gICAgYXJnc1sxXSA9IHJlcGxhY2VyO1xuICAgIHJldHVybiBfc3RyaW5naWZ5LmFwcGx5KCRKU09OLCBhcmdzKTtcbiAgfVxufSk7XG5cbi8vIDE5LjQuMy40IFN5bWJvbC5wcm90b3R5cGVbQEB0b1ByaW1pdGl2ZV0oaGludClcbiRTeW1ib2xbUFJPVE9UWVBFXVtUT19QUklNSVRJVkVdIHx8IHJlcXVpcmUoJy4vX2hpZGUnKSgkU3ltYm9sW1BST1RPVFlQRV0sIFRPX1BSSU1JVElWRSwgJFN5bWJvbFtQUk9UT1RZUEVdLnZhbHVlT2YpO1xuLy8gMTkuNC4zLjUgU3ltYm9sLnByb3RvdHlwZVtAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoJFN5bWJvbCwgJ1N5bWJvbCcpO1xuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoTWF0aCwgJ01hdGgnLCB0cnVlKTtcbi8vIDI0LjMuMyBKU09OW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhnbG9iYWwuSlNPTiwgJ0pTT04nLCB0cnVlKTtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLXByb21pc2UtZmluYWxseVxuJ3VzZSBzdHJpY3QnO1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbnZhciBjb3JlID0gcmVxdWlyZSgnLi9fY29yZScpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vX3NwZWNpZXMtY29uc3RydWN0b3InKTtcbnZhciBwcm9taXNlUmVzb2x2ZSA9IHJlcXVpcmUoJy4vX3Byb21pc2UtcmVzb2x2ZScpO1xuXG4kZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuUiwgJ1Byb21pc2UnLCB7ICdmaW5hbGx5JzogZnVuY3Rpb24gKG9uRmluYWxseSkge1xuICB2YXIgQyA9IHNwZWNpZXNDb25zdHJ1Y3Rvcih0aGlzLCBjb3JlLlByb21pc2UgfHwgZ2xvYmFsLlByb21pc2UpO1xuICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiBvbkZpbmFsbHkgPT0gJ2Z1bmN0aW9uJztcbiAgcmV0dXJuIHRoaXMudGhlbihcbiAgICBpc0Z1bmN0aW9uID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBwcm9taXNlUmVzb2x2ZShDLCBvbkZpbmFsbHkoKSkudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiB4OyB9KTtcbiAgICB9IDogb25GaW5hbGx5LFxuICAgIGlzRnVuY3Rpb24gPyBmdW5jdGlvbiAoZSkge1xuICAgICAgcmV0dXJuIHByb21pc2VSZXNvbHZlKEMsIG9uRmluYWxseSgpKS50aGVuKGZ1bmN0aW9uICgpIHsgdGhyb3cgZTsgfSk7XG4gICAgfSA6IG9uRmluYWxseVxuICApO1xufSB9KTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLXByb21pc2UtdHJ5XG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIG5ld1Byb21pc2VDYXBhYmlsaXR5ID0gcmVxdWlyZSgnLi9fbmV3LXByb21pc2UtY2FwYWJpbGl0eScpO1xudmFyIHBlcmZvcm0gPSByZXF1aXJlKCcuL19wZXJmb3JtJyk7XG5cbiRleHBvcnQoJGV4cG9ydC5TLCAnUHJvbWlzZScsIHsgJ3RyeSc6IGZ1bmN0aW9uIChjYWxsYmFja2ZuKSB7XG4gIHZhciBwcm9taXNlQ2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5LmYodGhpcyk7XG4gIHZhciByZXN1bHQgPSBwZXJmb3JtKGNhbGxiYWNrZm4pO1xuICAocmVzdWx0LmUgPyBwcm9taXNlQ2FwYWJpbGl0eS5yZWplY3QgOiBwcm9taXNlQ2FwYWJpbGl0eS5yZXNvbHZlKShyZXN1bHQudik7XG4gIHJldHVybiBwcm9taXNlQ2FwYWJpbGl0eS5wcm9taXNlO1xufSB9KTtcbiIsInJlcXVpcmUoJy4vX3drcy1kZWZpbmUnKSgnYXN5bmNJdGVyYXRvcicpO1xuIiwicmVxdWlyZSgnLi9fd2tzLWRlZmluZScpKCdvYnNlcnZhYmxlJyk7XG4iLCJyZXF1aXJlKCcuL2VzNi5hcnJheS5pdGVyYXRvcicpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpO1xudmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG52YXIgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG52YXIgVE9fU1RSSU5HX1RBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG52YXIgRE9NSXRlcmFibGVzID0gKCdDU1NSdWxlTGlzdCxDU1NTdHlsZURlY2xhcmF0aW9uLENTU1ZhbHVlTGlzdCxDbGllbnRSZWN0TGlzdCxET01SZWN0TGlzdCxET01TdHJpbmdMaXN0LCcgK1xuICAnRE9NVG9rZW5MaXN0LERhdGFUcmFuc2Zlckl0ZW1MaXN0LEZpbGVMaXN0LEhUTUxBbGxDb2xsZWN0aW9uLEhUTUxDb2xsZWN0aW9uLEhUTUxGb3JtRWxlbWVudCxIVE1MU2VsZWN0RWxlbWVudCwnICtcbiAgJ01lZGlhTGlzdCxNaW1lVHlwZUFycmF5LE5hbWVkTm9kZU1hcCxOb2RlTGlzdCxQYWludFJlcXVlc3RMaXN0LFBsdWdpbixQbHVnaW5BcnJheSxTVkdMZW5ndGhMaXN0LFNWR051bWJlckxpc3QsJyArXG4gICdTVkdQYXRoU2VnTGlzdCxTVkdQb2ludExpc3QsU1ZHU3RyaW5nTGlzdCxTVkdUcmFuc2Zvcm1MaXN0LFNvdXJjZUJ1ZmZlckxpc3QsU3R5bGVTaGVldExpc3QsVGV4dFRyYWNrQ3VlTGlzdCwnICtcbiAgJ1RleHRUcmFja0xpc3QsVG91Y2hMaXN0Jykuc3BsaXQoJywnKTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCBET01JdGVyYWJsZXMubGVuZ3RoOyBpKyspIHtcbiAgdmFyIE5BTUUgPSBET01JdGVyYWJsZXNbaV07XG4gIHZhciBDb2xsZWN0aW9uID0gZ2xvYmFsW05BTUVdO1xuICB2YXIgcHJvdG8gPSBDb2xsZWN0aW9uICYmIENvbGxlY3Rpb24ucHJvdG90eXBlO1xuICBpZiAocHJvdG8gJiYgIXByb3RvW1RPX1NUUklOR19UQUddKSBoaWRlKHByb3RvLCBUT19TVFJJTkdfVEFHLCBOQU1FKTtcbiAgSXRlcmF0b3JzW05BTUVdID0gSXRlcmF0b3JzLkFycmF5O1xufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImltcG9ydCBMb2FkZXIgZnJvbSAnLi9sb2FkZXInO1xuXG5jb25zdCBBdWRpb0NvbnRleHQgPSAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KTtcblxuaWYgKCFBdWRpb0NvbnRleHQpXG4gIHRocm93IG5ldyBFcnJvcignV2ViQXVkaW8gQVBJIG5vdCBzdXBwb3J0ZWQnKTtcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5jb25zdCBzaWxlbnRCdWZmZXIgPSBuZXcgVWludDMyQXJyYXkoW1xuICAweDQ2NDY0OTUyLCAweDAwMDAwMDM4LCAweDQ1NTY0MTU3LCAweDIwNzQ2ZDY2LFxuICAweDAwMDAwMDEwLCAweDAwMDEwMDAxLCAweDAwMDBhYzQ0LCAweDAwMDE1ODg4LFxuICAweDAwMTAwMDAyLCAweDYxNzQ2MTY0LCAweDAwMDAwMDE0LCAweDAwMDAwMDAwLFxuICAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLFxuICAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLFxuICAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLFxuICAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLCAweDAwMDAwMDAwLFxuXSkuYnVmZmVyO1xuXG5jb25zdCBub29wID0gKCkgPT4ge307XG5cbi8vIEB0b2RvIC0gcmV2aWV3IHRvIGFsbG93IHRvIHVzZSBleHRlcm5hbCBhdWRpb0NvbnRleHRcbmxldCBkZWNvZGVBdWRpb0RhdGEgPSBhdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhO1xuY29uc3QgcHJvbWlzZSA9IGF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoc2lsZW50QnVmZmVyLCBub29wLCBub29wKTtcbi8vIGltcGxlbWVudCBub24gcHJvbWlzZWQgYmFzZSBkZWNvZGUgYXVkaW8gZGF0YVxuaWYgKCFwcm9taXNlKSB7XG4gIGRlY29kZUF1ZGlvRGF0YSA9IGZ1bmN0aW9uKGFycmF5YnVmZmVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgYXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YShhcnJheWJ1ZmZlciwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICByZXNvbHZlKGJ1ZmZlcik7XG4gICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1VuYWJsZSB0byBkZWNvZGUgYXVkaW8gZGF0YScpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cblxuLyoqXG4gKiBBdWRpb0J1ZmZlckxvYWRlclxuICogUHJvbWlzZSBiYXNlZCBpbXBsZW1lbnRhdGlvbiBvZiBYTUxIdHRwUmVxdWVzdCBMZXZlbCAyIGZvciBHRVQgbWV0aG9kIGFuZFxuICogZGVjb2RlIGF1ZGlvIGRhdGEgZm9yIGFycmF5YnVmZmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdWRpb0J1ZmZlckxvYWRlciBleHRlbmRzIExvYWRlciB7XG4gIC8qKlxuICAgKiBTZXQgdGhlIHJlc3BvbnNlVHlwZSB0byAnYXJyYXlidWZmZXInIGFuZCBpbml0aWFsaXplIG9wdGlvbnMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIl1cbiAgICovXG4gIGNvbnN0cnVjdG9yKHJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicpIHtcbiAgICBzdXBlcihyZXNwb25zZVR5cGUpO1xuXG4gICAgdGhpcy5vcHRpb25zID0geyB3cmFwQXJvdW5kRXh0ZW5zaW9uOiAwIH07XG4gICAgdGhpcy5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGU7XG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG5cbiAgICB0aGlzLmRlY29kZUF1ZGlvRGF0YSA9IHRoaXMuZGVjb2RlQXVkaW9EYXRhLmJpbmQodGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3cgdG8gc2V0IHRoZSBhdWRpbyBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIHVzZWQgaW4gb3JkZXIgdG8gZGVjb2RlXG4gICAqIHRoZSBmaWxlIGFuZCBjcmVhdGUgdGhlIEF1ZGlvQnVmZmVyLlxuICAgKiBAcGFyYW0ge0F1ZGlvQ29udGV4dH0gYXVkaW9Db250ZXh0XG4gICAqL1xuICBzZXRBdWRpb0NvbnRleHQoYXVkaW9Db250ZXh0KSB7XG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIGZvciBwcm9taXNlIGF1ZGlvIGZpbGUgbG9hZGluZyBhbmQgZGVjb2RpbmcuXG4gICAqIEBwYXJhbSB7KHN0cmluZ3xzdHJpbmdbXSl9IGZpbGVVUkxzIC0gVGhlIFVSTChzKSBvZiB0aGUgYXVkaW8gZmlsZXMgdG8gbG9hZC5cbiAgICogIEFjY2VwdHMgYSBVUkwgcG9pbnRpbmcgdG8gdGhlIGZpbGUgbG9jYXRpb24gb3IgYW4gYXJyYXkgb2YgVVJMcy5cbiAgICogQHBhcmFtIHt7d3JhcEFyb3VuZEV4dGVuc2lvbjogbnVtYmVyfX0gW29wdGlvbnNdIC0gT2JqZWN0IHdpdGggYVxuICAgKiAgd3JhcEFyb3VuZEV4dGVuc2lvbiBrZXkgd2hpY2ggc2V0IHRoZSBsZW5ndGgsIGluIHNlY29uZHMgdG8gYmUgY29waWVkIGZyb21cbiAgICogIHRoZSBiZWdpbmluZyBhdCB0aGUgZW5kIG9mIHRoZSByZXR1cm5lZCBBdWRpb0J1ZmZlclxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIGxvYWQoZmlsZVVSTHMsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5vcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24gPSB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbiB8fCAwO1xuXG4gICAgcmV0dXJuIHN1cGVyLmxvYWQoZmlsZVVSTHMpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBzaW5nbGUgYXVkaW8gZmlsZSwgZGVjb2RlIGl0IGluIGFuIEF1ZGlvQnVmZmVyLCByZXR1cm4gYSBQcm9taXNlXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlVVJMIC0gVGhlIFVSTCBvZiB0aGUgYXVkaW8gZmlsZSBsb2NhdGlvbiB0byBsb2FkLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIGxvYWRPbmUoZmlsZVVSTCkge1xuICAgIHJldHVybiBzdXBlci5sb2FkT25lKGZpbGVVUkwpXG4gICAgICAudGhlbih0aGlzLmRlY29kZUF1ZGlvRGF0YSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHRocm93IGVycjsgfSk7XG4gIH1cblxuICAvKipcbiAgICogTG9hZCBhbGwgYXVkaW8gZmlsZXMgYXQgb25jZSBpbiBhIHNpbmdsZSBhcnJheSwgZGVjb2RlIHRoZW0gaW4gYW4gYXJyYXkgb2ZcbiAgICogQXVkaW9CdWZmZXJzLCBhbmQgcmV0dXJuIGEgUHJvbWlzZS5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gZmlsZVVSTHMgLSBUaGUgVVJMcyBhcnJheSBvZiB0aGUgYXVkaW8gZmlsZXMgdG8gbG9hZC5cbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqL1xuICBsb2FkQWxsKGZpbGVVUkxzKSB7XG4gICAgcmV0dXJuIHN1cGVyLmxvYWRBbGwoZmlsZVVSTHMpXG4gICAgICAudGhlbigoYXJyYXlidWZmZXJzKSA9PiB7XG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gYXJyYXlidWZmZXJzLm1hcCgoYXJyYXlidWZmZXIpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVBdWRpb0RhdGEoYXJyYXlidWZmZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7IHRocm93IGVycjsgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlIEF1ZGlvIERhdGEsIHJldHVybiBhIFByb21pc2VcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHthcnJheWJ1ZmZlcn0gLSBUaGUgYXJyYXlidWZmZXIgb2YgdGhlIGxvYWRlZCBhdWRpbyBmaWxlIHRvIGJlIGRlY29kZWQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgZGVjb2RlQXVkaW9EYXRhKGFycmF5YnVmZmVyKSB7XG4gICAgaWYgKGFycmF5YnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIGNvbnN0IHByb21pc2UgPSBkZWNvZGVBdWRpb0RhdGEuY2FsbChhdWRpb0NvbnRleHQsIGFycmF5YnVmZmVyKVxuXG4gICAgICBwcm9taXNlXG4gICAgICAgIC50aGVuKChidWZmZXIpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24gIT09IDApXG4gICAgICAgICAgICBidWZmZXIgPSB0aGlzLl9fd3JhcEFyb3VuZChidWZmZXIpO1xuXG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShidWZmZXIpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycikgPT4geyB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBkZWNvZGUgYXVkaW8gZGF0YScpIH0pO1xuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhcnJheWJ1ZmZlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdyYXBBcm91bmQsIGNvcHkgdGhlIGJlZ2luaW5nIGlucHV0IGJ1ZmZlciB0byB0aGUgZW5kIG9mIGFuIG91dHB1dCBidWZmZXJcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHthcnJheWJ1ZmZlcn0gaW5CdWZmZXIge2FycmF5YnVmZmVyfSAtIFRoZSBpbnB1dCBidWZmZXJcbiAgICogQHJldHVybnMge2FycmF5YnVmZmVyfSAtIFRoZSBwcm9jZXNzZWQgYnVmZmVyICh3aXRoIGZyYW1lIGNvcGllZCBmcm9tIHRoZSBiZWdpbmluZyB0byB0aGUgZW5kKVxuICAgKi9cbiAgX193cmFwQXJvdW5kKGluQnVmZmVyKSB7XG4gICAgY29uc3QgeyBudW1iZXJPZkNoYW5uZWxzLCBzYW1wbGVSYXRlLCBsZW5ndGggfSA9IGluQnVmZmVyO1xuICAgIGNvbnN0IG91dExlbmd0aCA9IGxlbmd0aCArIHRoaXMub3B0aW9ucy53cmFwQXJvdW5kRXh0ZW5zaW9uICogc2FtcGxlUmF0ZTtcbiAgICBjb25zdCBvdXRCdWZmZXIgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIobnVtYmVyT2ZDaGFubmVscywgb3V0TGVuZ3RoLCBzYW1wbGVSYXRlKTtcblxuICAgIGZvciAobGV0IGNoYW5uZWwgPSAwOyBjaGFubmVsIDwgbnVtYmVyT2ZDaGFubmVsczsgY2hhbm5lbCsrKSB7XG4gICAgICBjb25zdCBjaGFubmVsRGF0YSA9IGluQnVmZmVyLmdldENoYW5uZWxEYXRhKGNoYW5uZWwpO1xuICAgICAgY29uc3Qgb3V0RGF0YSA9IG91dEJ1ZmZlci5nZXRDaGFubmVsRGF0YShjaGFubmVsKTtcbiAgICAgIGNvbnN0IGluTGVuZ3RoID0gaW5CdWZmZXIubGVuZ3RoO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpIDwgaW5MZW5ndGgpXG4gICAgICAgICAgb3V0RGF0YVtpXSA9IGNoYW5uZWxEYXRhW2ldO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgb3V0RGF0YVtpXSA9IGNoYW5uZWxEYXRhW2kgLSBpbkxlbmd0aF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dEJ1ZmZlcjtcbiAgfVxufVxuIiwiLyoqXG4gKiBAZmlsZSBMb2FkZXJzOiBBdWRpb0J1ZmZlciBsb2FkZXIgYW5kIHV0aWxpdGllc1xuICogQGF1dGhvciBTYW11ZWwgR29sZHN6bWlkdFxuICogQHZlcnNpb24gMC4xLjFcbiAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBMb2FkZXIgfSBmcm9tICcuL2xvYWRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEF1ZGlvQnVmZmVyTG9hZGVyIH0gZnJvbSAnLi9hdWRpby1idWZmZXItbG9hZGVyJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3VwZXJMb2FkZXIgfSBmcm9tICcuL3N1cGVyLWxvYWRlcic7XG4iLCIvKipcbiAqIFByb21pc2UgYmFzZWQgaW1wbGVtZW50YXRpb24gb2YgWE1MSHR0cFJlcXVlc3QgTGV2ZWwgMiBmb3IgR0VUIG1ldGhvZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9hZGVyIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVzcG9uc2VUeXBlPVwiXCJdIC0gcmVzcG9uc2VUeXBlJ3MgdmFsdWUsIFwidGV4dFwiIChlcXVhbCB0byBcIlwiKSwgXCJhcnJheWJ1ZmZlclwiLCBcImJsb2JcIiwgXCJkb2N1bWVudFwiIG9yIFwianNvblwiXG4gICAqL1xuICBjb25zdHJ1Y3RvcihyZXNwb25zZVR5cGUgPSB1bmRlZmluZWQpIHtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGU7XG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7ZnVuY3Rpb259XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLnByb2dyZXNzQ2IgPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIGZvciBhIHByb21pc2UgYmFzZWQgZmlsZSBsb2FkaW5nLlxuICAgKiBJbnRlcm5hbGx5IHN3aXRjaCBiZXR3ZWVuIGxvYWRPbmUgYW5kIGxvYWRBbGwuXG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHsoc3RyaW5nfHN0cmluZ1tdKX0gZmlsZVVSTHMgLSBUaGUgVVJMKHMpIG9mIHRoZSBmaWxlcyB0byBsb2FkLiBBY2NlcHRzIGEgVVJMIHBvaW50aW5nIHRvIHRoZSBmaWxlIGxvY2F0aW9uIG9yIGFuIGFycmF5IG9mIFVSTHMuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgbG9hZChmaWxlVVJMcykge1xuICAgIGlmIChmaWxlVVJMcyA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhyb3cgKG5ldyBFcnJvcignSW52YWxpZCBmaWxlVVJMcyBwYXJhbWV0ZXI6IGxvYWQgbWV0aG9kIG5lZWRzIGF0IGxlYXN0IGEgdXJsIHRvIGxvYWQnKSk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShmaWxlVVJMcykpXG4gICAgICByZXR1cm4gdGhpcy5sb2FkQWxsKGZpbGVVUkxzKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdGhpcy5sb2FkT25lKGZpbGVVUkxzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgc2luZ2xlIGZpbGVcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVVUkwgLSBUaGUgVVJMIG9mIHRoZSBmaWxlIHRvIGxvYWQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgKi9cbiAgbG9hZE9uZShmaWxlVVJMKSB7XG4gICAgcmV0dXJuIHRoaXMuZmlsZUxvYWRpbmdSZXF1ZXN0KGZpbGVVUkwpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYWxsIGZpbGVzIGF0IG9uY2UgaW4gYSBzaW5nbGUgYXJyYXkgYW5kIHJldHVybiBhIFByb21pc2VcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gZmlsZVVSTHMgLSBUaGUgVVJMcyBhcnJheSBvZiB0aGUgZmlsZXMgdG8gbG9hZC5cbiAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAqL1xuICBsb2FkQWxsKGZpbGVVUkxzKSB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBmaWxlVVJMcy5tYXAoKGZpbGVVUkwsIGluZGV4KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5maWxlTG9hZGluZ1JlcXVlc3QoZmlsZVVSTCwgaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkIGEgZmlsZSBhc3luY2hyb25vdXNseSwgcmV0dXJuIGEgUHJvbWlzZS5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAtIFRoZSBVUkwgb2YgdGhlIGZpbGUgdG8gbG9hZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2luZGV4XSAtIFRoZSBpbmRleCBvZiB0aGUgZmlsZSBpbiB0aGUgYXJyYXkgb2YgZmlsZXMgdG8gbG9hZFxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIGZpbGVMb2FkaW5nUmVxdWVzdCh1cmwsIGluZGV4KSB7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgIHJlcXVlc3QuaW5kZXggPSBpbmRleDtcblxuICAgICAgaWYgKHRoaXMucmVzcG9uc2VUeXBlKSB7XG4gICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gdGhpcy5yZXNwb25zZVR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc3VmZml4ID0gJy5qc29uJztcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKHN1ZmZpeCwgdGhpcy5sZW5ndGggLSBzdWZmaXgubGVuZ3RoKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFRlc3QgcmVxdWVzdC5zdGF0dXMgdmFsdWUsIGFzIDQwNCB3aWxsIGFsc28gZ2V0IHRoZXJlXG4gICAgICAgIC8vIFRlc3QgcmVxdWVzdC5zdGF0dXMgPT09IDAgZm9yIGNvcmRvdmEgaW50ZXJuYWwgYWpheCBjYWxsc1xuICAgICAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDIwMCB8fCByZXF1ZXN0LnN0YXR1cyA9PT0gMzA0IHx8wqByZXF1ZXN0LnN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgIC8vIEhhY2sgZm9yIGlPUyA3LCB0byByZW1vdmUgYXMgc29vbiBhcyBwb3NzaWJsZVxuICAgICAgICAgIGlmICh0aGlzLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nICYmIHR5cGVvZihyZXF1ZXN0LnJlc3BvbnNlKSA9PT0gJ3N0cmluZycpXG4gICAgICAgICAgICByZXF1ZXN0LnJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlKTtcblxuICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXF1ZXN0LnN0YXR1c1RleHQpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCAoZXZ0KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb2dyZXNzQ2FsbGJhY2spIHtcbiAgICAgICAgICBjb25zdCBldmVudCA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsLFxuICAgICAgICAgICAgbG9hZGVkOiBldnQubG9hZGVkLFxuICAgICAgICAgICAgdG90YWw6IGV2dC50b3RhbFxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIGV2ZW50LmluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICB0aGlzLnByb2dyZXNzQ2FsbGJhY2soZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIE1hbmFnZSBuZXR3b3JrIGVycm9yc1xuICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IEVycm9yKCdOZXR3b3JrIEVycm9yJykpO1xuICAgICAgfSk7XG5cbiAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogQWx0ZXJuYXRpdmUgQVBJIHRvIHNldCB0aGUgcHJvZ3Jlc3MgY2FsbGJhY2suXG4gICAqIEB0eXBlIHtmdW5jdGlvbn0gY2FsbGJhY2sgLSBUaGUgY2FsbGJhY2sgdGhhdCBoYW5kbGVzIHRoZSByZXNwb25zZS5cbiAgICovXG4gIG9uUHJvZ3Jlc3MoY2FsbGJhY2spIHtcbiAgICB0aGlzLnByb2dyZXNzQ2IgPSBjYWxsYmFjaztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGdldCB0aGUgcHJvZ3Jlc3Mgb2YgZmlsZSBsb2FkaW5nIHByb2Nlc3MuXG4gICAqIFRoaXMgaXMgb25seSBmb3IgdGhlIGZpbGUgbG9hZGluZyBwcm9ncmVzcyBhcyBkZWNvZGVBdWRpb0RhdGEgZG9lc24ndFxuICAgKiBleHBvc2UgYSBkZWNvZGUgcHJvZ3Jlc3MgdmFsdWUuXG4gICAqIEB0eXBlIHtmdW5jdGlvbn1cbiAgICovXG4gIGdldCBwcm9ncmVzc0NhbGxiYWNrKCkge1xuICAgIHJldHVybiB0aGlzLnByb2dyZXNzQ2I7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBjYWxsYmFjayBmdW5jdGlvbiB0byBnZXQgdGhlIHByb2dyZXNzIG9mIGZpbGUgbG9hZGluZyBwcm9jZXNzLlxuICAgKiBUaGlzIGlzIG9ubHkgZm9yIHRoZSBmaWxlIGxvYWRpbmcgcHJvZ3Jlc3MgYXMgZGVjb2RlQXVkaW9EYXRhIGRvZXNuJ3RcbiAgICogZXhwb3NlIGEgZGVjb2RlIHByb2dyZXNzIHZhbHVlLlxuICAgKiBAdHlwZSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIHRoYXQgaGFuZGxlcyB0aGUgcmVzcG9uc2UuXG4gICAqL1xuICBzZXQgcHJvZ3Jlc3NDYWxsYmFjayhjYWxsYmFjaykge1xuICAgIHRoaXMucHJvZ3Jlc3NDYiA9IGNhbGxiYWNrO1xuICB9XG59XG4iLCJpbXBvcnQgQXVkaW9CdWZmZXJMb2FkZXIgZnJvbSAnLi9hdWRpby1idWZmZXItbG9hZGVyJztcblxuXG4vKipcbiAqIFN1cGVyTG9hZGVyXG4gKiBIZWxwZXIgdG8gbG9hZCBtdWx0aXBsZSB0eXBlIG9mIGZpbGVzLCBhbmQgZ2V0IHRoZW0gaW4gdGhlaXIgdXNlZnVsIHR5cGUsIGpzb24gZm9yIGpzb24gZmlsZXMsIEF1ZGlvQnVmZmVyIGZvciBhdWRpbyBmaWxlcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3VwZXJMb2FkZXIgZXh0ZW5kcyBBdWRpb0J1ZmZlckxvYWRlciB7XG4gIC8qKlxuICAgKiBVc2UgY29tcG9zaXRpb24gdG8gc2V0dXAgYXBwcm9wcmlhdGUgZmlsZSBsb2FkZXJzXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihudWxsKTtcbiAgICAvLyBieXBhc3MgQXVkaW9CdWZmZXJMb2FkZXIgY29uc3RydWN0b3IuIFRoaXMgaXMgYmFkIGJ1dCBpdCB3b3Jrcy5cbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL21hcFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5tYXAnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3Lm1hcC50by1qc29uJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNy5tYXAub2YnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3Lm1hcC5mcm9tJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5NYXA7XG4iLCJ2YXIgZm9yT2YgPSByZXF1aXJlKCcuL19mb3Itb2YnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlciwgSVRFUkFUT1IpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3JPZihpdGVyLCBmYWxzZSwgcmVzdWx0LnB1c2gsIHJlc3VsdCwgSVRFUkFUT1IpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8vIDAgLT4gQXJyYXkjZm9yRWFjaFxuLy8gMSAtPiBBcnJheSNtYXBcbi8vIDIgLT4gQXJyYXkjZmlsdGVyXG4vLyAzIC0+IEFycmF5I3NvbWVcbi8vIDQgLT4gQXJyYXkjZXZlcnlcbi8vIDUgLT4gQXJyYXkjZmluZFxuLy8gNiAtPiBBcnJheSNmaW5kSW5kZXhcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKTtcbnZhciBhc2MgPSByZXF1aXJlKCcuL19hcnJheS1zcGVjaWVzLWNyZWF0ZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoVFlQRSwgJGNyZWF0ZSkge1xuICB2YXIgSVNfTUFQID0gVFlQRSA9PSAxO1xuICB2YXIgSVNfRklMVEVSID0gVFlQRSA9PSAyO1xuICB2YXIgSVNfU09NRSA9IFRZUEUgPT0gMztcbiAgdmFyIElTX0VWRVJZID0gVFlQRSA9PSA0O1xuICB2YXIgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNjtcbiAgdmFyIE5PX0hPTEVTID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVg7XG4gIHZhciBjcmVhdGUgPSAkY3JlYXRlIHx8IGFzYztcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgY2FsbGJhY2tmbiwgdGhhdCkge1xuICAgIHZhciBPID0gdG9PYmplY3QoJHRoaXMpO1xuICAgIHZhciBzZWxmID0gSU9iamVjdChPKTtcbiAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHJlc3VsdCA9IElTX01BUCA/IGNyZWF0ZSgkdGhpcywgbGVuZ3RoKSA6IElTX0ZJTFRFUiA/IGNyZWF0ZSgkdGhpcywgMCkgOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbCwgcmVzO1xuICAgIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSBpZiAoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZikge1xuICAgICAgdmFsID0gc2VsZltpbmRleF07XG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xuICAgICAgaWYgKFRZUEUpIHtcbiAgICAgICAgaWYgKElTX01BUCkgcmVzdWx0W2luZGV4XSA9IHJlczsgICAvLyBtYXBcbiAgICAgICAgZWxzZSBpZiAocmVzKSBzd2l0Y2ggKFRZUEUpIHtcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAvLyBzb21lXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgIC8vIGZpbmRJbmRleFxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgIC8vIGZpbHRlclxuICAgICAgICB9IGVsc2UgaWYgKElTX0VWRVJZKSByZXR1cm4gZmFsc2U7IC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiByZXN1bHQ7XG4gIH07XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vX2lzLWFycmF5Jyk7XG52YXIgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9yaWdpbmFsKSB7XG4gIHZhciBDO1xuICBpZiAoaXNBcnJheShvcmlnaW5hbCkpIHtcbiAgICBDID0gb3JpZ2luYWwuY29uc3RydWN0b3I7XG4gICAgLy8gY3Jvc3MtcmVhbG0gZmFsbGJhY2tcbiAgICBpZiAodHlwZW9mIEMgPT0gJ2Z1bmN0aW9uJyAmJiAoQyA9PT0gQXJyYXkgfHwgaXNBcnJheShDLnByb3RvdHlwZSkpKSBDID0gdW5kZWZpbmVkO1xuICAgIGlmIChpc09iamVjdChDKSkge1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZiAoQyA9PT0gbnVsbCkgQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQztcbn07XG4iLCIvLyA5LjQuMi4zIEFycmF5U3BlY2llc0NyZWF0ZShvcmlnaW5hbEFycmF5LCBsZW5ndGgpXG52YXIgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9fYXJyYXktc3BlY2llcy1jb25zdHJ1Y3RvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcmlnaW5hbCwgbGVuZ3RoKSB7XG4gIHJldHVybiBuZXcgKHNwZWNpZXNDb25zdHJ1Y3RvcihvcmlnaW5hbCkpKGxlbmd0aCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGRQID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZjtcbnZhciBjcmVhdGUgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyk7XG52YXIgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBhbkluc3RhbmNlID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xudmFyICRpdGVyRGVmaW5lID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKTtcbnZhciBzdGVwID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJyk7XG52YXIgc2V0U3BlY2llcyA9IHJlcXVpcmUoJy4vX3NldC1zcGVjaWVzJyk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xudmFyIGZhc3RLZXkgPSByZXF1aXJlKCcuL19tZXRhJykuZmFzdEtleTtcbnZhciB2YWxpZGF0ZSA9IHJlcXVpcmUoJy4vX3ZhbGlkYXRlLWNvbGxlY3Rpb24nKTtcbnZhciBTSVpFID0gREVTQ1JJUFRPUlMgPyAnX3MnIDogJ3NpemUnO1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbiAodGhhdCwga2V5KSB7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSk7XG4gIHZhciBlbnRyeTtcbiAgaWYgKGluZGV4ICE9PSAnRicpIHJldHVybiB0aGF0Ll9pW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvciAoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKSB7XG4gICAgaWYgKGVudHJ5LmsgPT0ga2V5KSByZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24gKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpIHtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24gKHRoYXQsIGl0ZXJhYmxlKSB7XG4gICAgICBhbkluc3RhbmNlKHRoYXQsIEMsIE5BTUUsICdfaScpO1xuICAgICAgdGhhdC5fdCA9IE5BTUU7ICAgICAgICAgLy8gY29sbGVjdGlvbiB0eXBlXG4gICAgICB0aGF0Ll9pID0gY3JlYXRlKG51bGwpOyAvLyBpbmRleFxuICAgICAgdGhhdC5fZiA9IHVuZGVmaW5lZDsgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgIC8vIGxhc3QgZW50cnlcbiAgICAgIHRoYXRbU0laRV0gPSAwOyAgICAgICAgIC8vIHNpemVcbiAgICAgIGlmIChpdGVyYWJsZSAhPSB1bmRlZmluZWQpIGZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgICAgZm9yICh2YXIgdGhhdCA9IHZhbGlkYXRlKHRoaXMsIE5BTUUpLCBkYXRhID0gdGhhdC5faSwgZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKSB7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYgKGVudHJ5LnApIGVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5fZiA9IHRoYXQuX2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoYXRbU0laRV0gPSAwO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy4zIE1hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHRoYXQgPSB2YWxpZGF0ZSh0aGlzLCBOQU1FKTtcbiAgICAgICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcbiAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uO1xuICAgICAgICAgIHZhciBwcmV2ID0gZW50cnkucDtcbiAgICAgICAgICBkZWxldGUgdGhhdC5faVtlbnRyeS5pXTtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZiAocHJldikgcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZiAobmV4dCkgbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZiAodGhhdC5fZiA9PSBlbnRyeSkgdGhhdC5fZiA9IG5leHQ7XG4gICAgICAgICAgaWYgKHRoYXQuX2wgPT0gZW50cnkpIHRoYXQuX2wgPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qICwgdGhhdCA9IHVuZGVmaW5lZCAqLykge1xuICAgICAgICB2YWxpZGF0ZSh0aGlzLCBOQU1FKTtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpO1xuICAgICAgICB2YXIgZW50cnk7XG4gICAgICAgIHdoaWxlIChlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoaXMuX2YpIHtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlIChlbnRyeSAmJiBlbnRyeS5yKSBlbnRyeSA9IGVudHJ5LnA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSkge1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh2YWxpZGF0ZSh0aGlzLCBOQU1FKSwga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoREVTQ1JJUFRPUlMpIGRQKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdmFsaWRhdGUodGhpcywgTkFNRSlbU0laRV07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24gKHRoYXQsIGtleSwgdmFsdWUpIHtcbiAgICB2YXIgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgIHZhciBwcmV2LCBpbmRleDtcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcbiAgICBpZiAoZW50cnkpIHtcbiAgICAgIGVudHJ5LnYgPSB2YWx1ZTtcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoYXQuX2wgPSBlbnRyeSA9IHtcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XG4gICAgICAgIGs6IGtleSwgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBrZXlcbiAgICAgICAgdjogdmFsdWUsICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICAgIHA6IHByZXYgPSB0aGF0Ll9sLCAgICAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxuICAgICAgICBuOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgLy8gPC0gbmV4dCBlbnRyeVxuICAgICAgICByOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gcmVtb3ZlZFxuICAgICAgfTtcbiAgICAgIGlmICghdGhhdC5fZikgdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYgKHByZXYpIHByZXYubiA9IGVudHJ5O1xuICAgICAgdGhhdFtTSVpFXSsrO1xuICAgICAgLy8gYWRkIHRvIGluZGV4XG4gICAgICBpZiAoaW5kZXggIT09ICdGJykgdGhhdC5faVtpbmRleF0gPSBlbnRyeTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBnZXRFbnRyeTogZ2V0RW50cnksXG4gIHNldFN0cm9uZzogZnVuY3Rpb24gKEMsIE5BTUUsIElTX01BUCkge1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbiAoaXRlcmF0ZWQsIGtpbmQpIHtcbiAgICAgIHRoaXMuX3QgPSB2YWxpZGF0ZShpdGVyYXRlZCwgTkFNRSk7IC8vIHRhcmdldFxuICAgICAgdGhpcy5fayA9IGtpbmQ7ICAgICAgICAgICAgICAgICAgICAgLy8ga2luZFxuICAgICAgdGhpcy5fbCA9IHVuZGVmaW5lZDsgICAgICAgICAgICAgICAgLy8gcHJldmlvdXNcbiAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB2YXIga2luZCA9IHRoYXQuX2s7XG4gICAgICB2YXIgZW50cnkgPSB0aGF0Ll9sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZSAoZW50cnkgJiYgZW50cnkucikgZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmICghdGhhdC5fdCB8fCAhKHRoYXQuX2wgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IHRoYXQuX3QuX2YpKSB7XG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXG4gICAgICAgIHRoYXQuX3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBzdGVwKDEpO1xuICAgICAgfVxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxuICAgICAgaWYgKGtpbmQgPT0gJ2tleXMnKSByZXR1cm4gc3RlcCgwLCBlbnRyeS5rKTtcbiAgICAgIGlmIChraW5kID09ICd2YWx1ZXMnKSByZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59O1xuIiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJyk7XG52YXIgZnJvbSA9IHJlcXVpcmUoJy4vX2FycmF5LWZyb20taXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5BTUUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpIHtcbiAgICBpZiAoY2xhc3NvZih0aGlzKSAhPSBOQU1FKSB0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHJldHVybiBmcm9tKHRoaXMpO1xuICB9O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKTtcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG52YXIgbWV0YSA9IHJlcXVpcmUoJy4vX21ldGEnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG52YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbnZhciByZWRlZmluZUFsbCA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpO1xudmFyIGZvck9mID0gcmVxdWlyZSgnLi9fZm9yLW9mJyk7XG52YXIgYW5JbnN0YW5jZSA9IHJlcXVpcmUoJy4vX2FuLWluc3RhbmNlJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbnZhciBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJyk7XG52YXIgZFAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mO1xudmFyIGVhY2ggPSByZXF1aXJlKCcuL19hcnJheS1tZXRob2RzJykoMCk7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOQU1FLCB3cmFwcGVyLCBtZXRob2RzLCBjb21tb24sIElTX01BUCwgSVNfV0VBSykge1xuICB2YXIgQmFzZSA9IGdsb2JhbFtOQU1FXTtcbiAgdmFyIEMgPSBCYXNlO1xuICB2YXIgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnO1xuICB2YXIgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlO1xuICB2YXIgTyA9IHt9O1xuICBpZiAoIURFU0NSSVBUT1JTIHx8IHR5cGVvZiBDICE9ICdmdW5jdGlvbicgfHwgIShJU19XRUFLIHx8IHByb3RvLmZvckVhY2ggJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgICBuZXcgQygpLmVudHJpZXMoKS5uZXh0KCk7XG4gIH0pKSkge1xuICAgIC8vIGNyZWF0ZSBjb2xsZWN0aW9uIGNvbnN0cnVjdG9yXG4gICAgQyA9IGNvbW1vbi5nZXRDb25zdHJ1Y3Rvcih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwgbWV0aG9kcyk7XG4gICAgbWV0YS5ORUVEID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbiAodGFyZ2V0LCBpdGVyYWJsZSkge1xuICAgICAgYW5JbnN0YW5jZSh0YXJnZXQsIEMsIE5BTUUsICdfYycpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2UoKTtcbiAgICAgIGlmIChpdGVyYWJsZSAhPSB1bmRlZmluZWQpIGZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRhcmdldFtBRERFUl0sIHRhcmdldCk7XG4gICAgfSk7XG4gICAgZWFjaCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMsdG9KU09OJy5zcGxpdCgnLCcpLCBmdW5jdGlvbiAoS0VZKSB7XG4gICAgICB2YXIgSVNfQURERVIgPSBLRVkgPT0gJ2FkZCcgfHwgS0VZID09ICdzZXQnO1xuICAgICAgaWYgKEtFWSBpbiBwcm90byAmJiAhKElTX1dFQUsgJiYgS0VZID09ICdjbGVhcicpKSBoaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgIGFuSW5zdGFuY2UodGhpcywgQywgS0VZKTtcbiAgICAgICAgaWYgKCFJU19BRERFUiAmJiBJU19XRUFLICYmICFpc09iamVjdChhKSkgcmV0dXJuIEtFWSA9PSAnZ2V0JyA/IHVuZGVmaW5lZCA6IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBJU19BRERFUiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBJU19XRUFLIHx8IGRQKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYy5zaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GLCBPKTtcblxuICBpZiAoIUlTX1dFQUspIGNvbW1vbi5zZXRTdHJvbmcoQywgTkFNRSwgSVNfTUFQKTtcblxuICByZXR1cm4gQztcbn07XG4iLCIndXNlIHN0cmljdCc7XG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL3Byb3Bvc2FsLXNldG1hcC1vZmZyb20vXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbnZhciBjdHggPSByZXF1aXJlKCcuL19jdHgnKTtcbnZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDT0xMRUNUSU9OKSB7XG4gICRleHBvcnQoJGV4cG9ydC5TLCBDT0xMRUNUSU9OLCB7IGZyb206IGZ1bmN0aW9uIGZyb20oc291cmNlIC8qICwgbWFwRm4sIHRoaXNBcmcgKi8pIHtcbiAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIG1hcHBpbmcsIEEsIG4sIGNiO1xuICAgIGFGdW5jdGlvbih0aGlzKTtcbiAgICBtYXBwaW5nID0gbWFwRm4gIT09IHVuZGVmaW5lZDtcbiAgICBpZiAobWFwcGluZykgYUZ1bmN0aW9uKG1hcEZuKTtcbiAgICBpZiAoc291cmNlID09IHVuZGVmaW5lZCkgcmV0dXJuIG5ldyB0aGlzKCk7XG4gICAgQSA9IFtdO1xuICAgIGlmIChtYXBwaW5nKSB7XG4gICAgICBuID0gMDtcbiAgICAgIGNiID0gY3R4KG1hcEZuLCBhcmd1bWVudHNbMl0sIDIpO1xuICAgICAgZm9yT2Yoc291cmNlLCBmYWxzZSwgZnVuY3Rpb24gKG5leHRJdGVtKSB7XG4gICAgICAgIEEucHVzaChjYihuZXh0SXRlbSwgbisrKSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yT2Yoc291cmNlLCBmYWxzZSwgQS5wdXNoLCBBKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyB0aGlzKEEpO1xuICB9IH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS9cbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKENPTExFQ1RJT04pIHtcbiAgJGV4cG9ydCgkZXhwb3J0LlMsIENPTExFQ1RJT04sIHsgb2Y6IGZ1bmN0aW9uIG9mKCkge1xuICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHZhciBBID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSBBW2xlbmd0aF0gPSBhcmd1bWVudHNbbGVuZ3RoXTtcbiAgICByZXR1cm4gbmV3IHRoaXMoQSk7XG4gIH0gfSk7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCwgVFlQRSkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSB8fCBpdC5fdCAhPT0gVFlQRSkgdGhyb3cgVHlwZUVycm9yKCdJbmNvbXBhdGlibGUgcmVjZWl2ZXIsICcgKyBUWVBFICsgJyByZXF1aXJlZCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXN0cm9uZycpO1xudmFyIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9fdmFsaWRhdGUtY29sbGVjdGlvbicpO1xudmFyIE1BUCA9ICdNYXAnO1xuXG4vLyAyMy4xIE1hcCBPYmplY3RzXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24nKShNQVAsIGZ1bmN0aW9uIChnZXQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIE1hcCgpIHsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KSB7XG4gICAgdmFyIGVudHJ5ID0gc3Ryb25nLmdldEVudHJ5KHZhbGlkYXRlKHRoaXMsIE1BUCksIGtleSk7XG4gICAgcmV0dXJuIGVudHJ5ICYmIGVudHJ5LnY7XG4gIH0sXG4gIC8vIDIzLjEuMy45IE1hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXG4gIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih2YWxpZGF0ZSh0aGlzLCBNQVApLCBrZXkgPT09IDAgPyAwIDoga2V5LCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZywgdHJ1ZSk7XG4iLCIvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL3Byb3Bvc2FsLXNldG1hcC1vZmZyb20vI3NlYy1tYXAuZnJvbVxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tZnJvbScpKCdNYXAnKTtcbiIsIi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS8jc2VjLW1hcC5vZlxucmVxdWlyZSgnLi9fc2V0LWNvbGxlY3Rpb24tb2YnKSgnTWFwJyk7XG4iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuUiwgJ01hcCcsIHsgdG9KU09OOiByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXRvLWpzb24nKSgnTWFwJykgfSk7XG4iLCIvLyB3b3JrcyBieSByZWZlcmVuY2VcbmZ1bmN0aW9uIHN3YXAoYXJyLCBpMSwgaTIpIHtcbiAgY29uc3QgdG1wID0gYXJyW2kxXTtcbiAgYXJyW2kxXSA9IGFycltpMl07XG4gIGFycltpMl0gPSB0bXA7XG59XG5cbi8vIGh0dHBzOi8vanNwZXJmLmNvbS9qcy1mb3ItbG9vcC12cy1hcnJheS1pbmRleG9mLzM0NlxuZnVuY3Rpb24gaW5kZXhPZihhcnIsIGVsKSB7XG4gIGNvbnN0IGwgPSBhcnIubGVuZ3RoO1xuICAvLyBpZ25vcmUgZmlyc3QgZWxlbWVudCBhcyBpdCBjYW4ndCBiZSBhIGVudHJ5XG4gIGZvciAobGV0IGkgPSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKGFycltpXSA9PT0gZWwpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgaWYgYHRpbWUxYCBzaG91bGQgYmUgbG93ZXIgaW4gdGhlIHRvcG9ncmFwaHkgdGhhbiBgdGltZTJgLlxuICogSXMgZHluYW1pY2FsbHkgYWZmZWN0ZWQgdG8gdGhlIHByaW9yaXR5IHF1ZXVlIGFjY29yZGluZyB0byBoYW5kbGUgYG1pbmAgYW5kIGBtYXhgIGhlYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCBfaXNMb3dlck1heEhlYXAgPSBmdW5jdGlvbih0aW1lMSwgdGltZTIpIHtcbiAgcmV0dXJuIHRpbWUxIDwgdGltZTI7XG59O1xuXG5jb25zdCBfaXNMb3dlck1pbkhlYXAgPSBmdW5jdGlvbih0aW1lMSwgdGltZTIpIHtcbiAgcmV0dXJuIHRpbWUxID4gdGltZTI7XG59O1xuXG4vKipcbiAqIERlZmluZSBpZiBgdGltZTFgIHNob3VsZCBiZSBoaWdoZXIgaW4gdGhlIHRvcG9ncmFwaHkgdGhhbiBgdGltZTJgLlxuICogSXMgZHluYW1pY2FsbHkgYWZmZWN0ZWQgdG8gdGhlIHByaW9yaXR5IHF1ZXVlIGFjY29yZGluZyB0byBoYW5kbGUgYG1pbmAgYW5kIGBtYXhgIGhlYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lMVxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUyXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCBfaXNIaWdoZXJNYXhIZWFwID0gZnVuY3Rpb24odGltZTEsIHRpbWUyKSB7XG4gIHJldHVybiB0aW1lMSA+IHRpbWUyO1xufTtcblxuY29uc3QgX2lzSGlnaGVyTWluSGVhcCA9IGZ1bmN0aW9uKHRpbWUxLCB0aW1lMikge1xuICByZXR1cm4gdGltZTEgPCB0aW1lMjtcbn07XG5cbmNvbnN0IFBPU0lUSVZFX0lORklOSVRZID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4vKipcbiAqIFByaW9yaXR5IHF1ZXVlIGltcGxlbWVudGluZyBhIGJpbmFyeSBoZWFwLlxuICogQWN0cyBhcyBhIG1pbiBoZWFwIGJ5IGRlZmF1bHQsIGNhbiBiZSBkeW5hbWljYWxseSBjaGFuZ2VkIHRvIGEgbWF4IGhlYXBcbiAqIGJ5IHNldHRpbmcgYHJldmVyc2VgIHRvIHRydWUuXG4gKlxuICogX25vdGVfOiB0aGUgcXVldWUgY3JlYXRlcyBhbmQgbWFpbnRhaW5zIGEgbmV3IHByb3BlcnR5IChpLmUuIGBxdWV1ZVRpbWVgKVxuICogdG8gZWFjaCBvYmplY3QgYWRkZWQuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFtoZWFwTGVuZ3RoPTEwMF0gLSBEZWZhdWx0IHNpemUgb2YgdGhlIGFycmF5IHVzZWQgdG8gY3JlYXRlIHRoZSBoZWFwLlxuICovXG5jbGFzcyBQcmlvcml0eVF1ZXVlIHtcbiAgY29uc3RydWN0b3IoaGVhcExlbmd0aCA9IDEwMCkge1xuICAgIC8qKlxuICAgICAqIFBvaW50ZXIgdG8gdGhlIGZpcnN0IGVtcHR5IGluZGV4IG9mIHRoZSBoZWFwLlxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG1lbWJlcm9mIFByaW9yaXR5UXVldWVcbiAgICAgKiBAbmFtZSBfY3VycmVudExlbmd0aFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fY3VycmVudExlbmd0aCA9IDE7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiB0aGUgc29ydGVkIGluZGV4ZXMgb2YgdGhlIGVudHJpZXMsIHRoZSBhY3R1YWwgaGVhcC4gSWdub3JlIHRoZSBpbmRleCAwLlxuICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgKiBAbWVtYmVyb2YgUHJpb3JpdHlRdWV1ZVxuICAgICAqIEBuYW1lIF9oZWFwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLl9oZWFwID0gbmV3IEFycmF5KGhlYXBMZW5ndGggKyAxKTtcblxuICAgIC8qKlxuICAgICAqIFR5cGUgb2YgdGhlIHF1ZXVlOiBgbWluYCBoZWFwIGlmIGBmYWxzZWAsIGBtYXhgIGhlYXAgaWYgYHRydWVgXG4gICAgICogQHR5cGUge0Jvb2xlYW59XG4gICAgICogQG1lbWJlcm9mIFByaW9yaXR5UXVldWVcbiAgICAgKiBAbmFtZSBfcmV2ZXJzZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5fcmV2ZXJzZSA9IG51bGw7XG5cbiAgICAvLyBpbml0aWFsaXplIGNvbXBhcmUgZnVuY3Rpb25zXG4gICAgdGhpcy5yZXZlcnNlID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVGltZSBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgYmluYXJ5IGhlYXAuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqL1xuICBnZXQgdGltZSgpIHtcbiAgICBpZiAodGhpcy5fY3VycmVudExlbmd0aCA+IDEpXG4gICAgICByZXR1cm4gdGhpcy5faGVhcFsxXS5xdWV1ZVRpbWU7XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvKipcbiAgICogRmlyc3QgZWxlbWVudCBpbiB0aGUgYmluYXJ5IGhlYXAuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9XG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGhlYWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYXBbMV07XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlIHRoZSBvcmRlciBvZiB0aGUgcXVldWUgKG1heCBoZWFwIGlmIHRydWUsIG1pbiBoZWFwIGlmIGZhbHNlKSxcbiAgICogcmVidWlsZCB0aGUgaGVhcCB3aXRoIHRoZSBleGlzdGluZyBlbnRyaWVzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIHNldCByZXZlcnNlKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9yZXZlcnNlKSB7XG4gICAgICB0aGlzLl9yZXZlcnNlID0gdmFsdWU7XG5cbiAgICAgIGlmICh0aGlzLl9yZXZlcnNlID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuX2lzTG93ZXIgPSBfaXNMb3dlck1heEhlYXA7XG4gICAgICAgIHRoaXMuX2lzSGlnaGVyID0gX2lzSGlnaGVyTWF4SGVhcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2lzTG93ZXIgPSBfaXNMb3dlck1pbkhlYXA7XG4gICAgICAgIHRoaXMuX2lzSGlnaGVyID0gX2lzSGlnaGVyTWluSGVhcDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZEhlYXAoKTtcbiAgICB9XG4gIH1cblxuICBnZXQgcmV2ZXJzZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fcmV2ZXJzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaXggdGhlIGhlYXAgYnkgbW92aW5nIGFuIGVudHJ5IHRvIGEgbmV3IHVwcGVyIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnRJbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgZW50cnkgdG8gbW92ZS5cbiAgICovXG4gIF9idWJibGVVcChzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IHBhcmVudEluZGV4ID0gTWF0aC5mbG9vcihpbmRleCAvIDIpO1xuICAgIGxldCBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcblxuICAgIHdoaWxlIChwYXJlbnQgJiYgdGhpcy5faXNIaWdoZXIoZW50cnkucXVldWVUaW1lLCBwYXJlbnQucXVldWVUaW1lKSkge1xuICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgcGFyZW50SW5kZXgpO1xuXG4gICAgICBpbmRleCA9IHBhcmVudEluZGV4O1xuICAgICAgcGFyZW50SW5kZXggPSBNYXRoLmZsb29yKGluZGV4IC8gMik7XG4gICAgICBwYXJlbnQgPSB0aGlzLl9oZWFwW3BhcmVudEluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRml4IHRoZSBoZWFwIGJ5IG1vdmluZyBhbiBlbnRyeSB0byBhIG5ldyBsb3dlciBwb3NpdGlvbi5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0SW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGVudHJ5IHRvIG1vdmUuXG4gICAqL1xuICBfYnViYmxlRG93bihzdGFydEluZGV4KSB7XG4gICAgbGV0IGVudHJ5ID0gdGhpcy5faGVhcFtzdGFydEluZGV4XTtcblxuICAgIGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7XG4gICAgbGV0IGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgbGV0IGMyaW5kZXggPSBjMWluZGV4ICsgMTtcbiAgICBsZXQgY2hpbGQxID0gdGhpcy5faGVhcFtjMWluZGV4XTtcbiAgICBsZXQgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcblxuICAgIHdoaWxlICgoY2hpbGQxICYmIHRoaXMuX2lzTG93ZXIoZW50cnkucXVldWVUaW1lLCBjaGlsZDEucXVldWVUaW1lKSnCoHx8XG4gICAgICAgICAgIChjaGlsZDIgJiYgdGhpcy5faXNMb3dlcihlbnRyeS5xdWV1ZVRpbWUsIGNoaWxkMi5xdWV1ZVRpbWUpKSlcbiAgICB7XG4gICAgICAvLyBzd2FwIHdpdGggdGhlIG1pbmltdW0gY2hpbGRcbiAgICAgIGxldCB0YXJnZXRJbmRleDtcblxuICAgICAgaWYgKGNoaWxkMilcbiAgICAgICAgdGFyZ2V0SW5kZXggPSB0aGlzLl9pc0hpZ2hlcihjaGlsZDEucXVldWVUaW1lLCBjaGlsZDIucXVldWVUaW1lKSA/IGMxaW5kZXggOiBjMmluZGV4O1xuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXRJbmRleCA9IGMxaW5kZXg7XG5cbiAgICAgIHN3YXAodGhpcy5faGVhcCwgaW5kZXgsIHRhcmdldEluZGV4KTtcblxuICAgICAgLy8gdXBkYXRlIHRvIGZpbmQgbmV4dCBjaGlsZHJlblxuICAgICAgaW5kZXggPSB0YXJnZXRJbmRleDtcbiAgICAgIGMxaW5kZXggPSBpbmRleCAqIDI7XG4gICAgICBjMmluZGV4ID0gYzFpbmRleCArIDE7XG4gICAgICBjaGlsZDEgPSB0aGlzLl9oZWFwW2MxaW5kZXhdO1xuICAgICAgY2hpbGQyID0gdGhpcy5faGVhcFtjMmluZGV4XTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGQgdGhlIGhlYXAgKGZyb20gYm90dG9tIHVwKS5cbiAgICovXG4gIGJ1aWxkSGVhcCgpIHtcbiAgICAvLyBmaW5kIHRoZSBpbmRleCBvZiB0aGUgbGFzdCBpbnRlcm5hbCBub2RlXG4gICAgLy8gQHRvZG8gLSBtYWtlIHN1cmUgdGhhdCdzIHRoZSByaWdodCB3YXkgdG8gZG8uXG4gICAgbGV0IG1heEluZGV4ID0gTWF0aC5mbG9vcigodGhpcy5fY3VycmVudExlbmd0aCAtIDEpIC8gMik7XG5cbiAgICBmb3IgKGxldCBpID0gbWF4SW5kZXg7IGkgPiAwOyBpLS0pXG4gICAgICB0aGlzLl9idWJibGVEb3duKGkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhIG5ldyBvYmplY3QgaW4gdGhlIGJpbmFyeSBoZWFwIGFuZCBzb3J0IGl0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW50cnkgLSBFbnRyeSB0byBpbnNlcnQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gVGltZSBhdCB3aGljaCB0aGUgZW50cnkgc2hvdWxkIGJlIG9yZGVyZXIuXG4gICAqIEByZXR1cm5zIHtOdW1iZXJ9IC0gVGltZSBvZiB0aGUgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICBpbnNlcnQoZW50cnksIHRpbWUpIHtcbiAgICBpZiAoTWF0aC5hYnModGltZSkgIT09IFBPU0lUSVZFX0lORklOSVRZKSB7XG4gICAgICBlbnRyeS5xdWV1ZVRpbWUgPSB0aW1lO1xuICAgICAgLy8gYWRkIHRoZSBuZXcgZW50cnkgYXQgdGhlIGVuZCBvZiB0aGUgaGVhcFxuICAgICAgdGhpcy5faGVhcFt0aGlzLl9jdXJyZW50TGVuZ3RoXSA9IGVudHJ5O1xuICAgICAgLy8gYnViYmxlIGl0IHVwXG4gICAgICB0aGlzLl9idWJibGVVcCh0aGlzLl9jdXJyZW50TGVuZ3RoKTtcbiAgICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggKz0gMTtcblxuICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICB9XG5cbiAgICBlbnRyeS5xdWV1ZVRpbWUgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKGVudHJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIGEgZ2l2ZW4gZW50cnkgdG8gYSBuZXcgcG9zaXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIG1vdmUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIC0gVGltZSBhdCB3aGljaCB0aGUgZW50cnkgc2hvdWxkIGJlIG9yZGVyZXIuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBUaW1lIG9mIGZpcnN0IGVudHJ5IGluIHRoZSBoZWFwLlxuICAgKi9cbiAgbW92ZShlbnRyeSwgdGltZSkge1xuICAgIGlmIChNYXRoLmFicyh0aW1lKSAhPT0gUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gaW5kZXhPZih0aGlzLl9oZWFwLCBlbnRyeSk7XG5cbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgZW50cnkucXVldWVUaW1lID0gdGltZTtcbiAgICAgICAgLy8gZGVmaW5lIGlmIHRoZSBlbnRyeSBzaG91bGQgYmUgYnViYmxlZCB1cCBvciBkb3duXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuX2hlYXBbTWF0aC5mbG9vcihpbmRleCAvIDIpXTtcblxuICAgICAgICBpZiAocGFyZW50ICYmIHRoaXMuX2lzSGlnaGVyKHRpbWUsIHBhcmVudC5xdWV1ZVRpbWUpKVxuICAgICAgICAgIHRoaXMuX2J1YmJsZVVwKGluZGV4KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRoaXMuX2J1YmJsZURvd24oaW5kZXgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgIH1cblxuICAgIGVudHJ5LnF1ZXVlVGltZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmUoZW50cnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBlbnRyeSBmcm9tIHRoZSBoZWFwIGFuZCBmaXggdGhlIGhlYXAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbnRyeSAtIEVudHJ5IHRvIHJlbW92ZS5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFRpbWUgb2YgZmlyc3QgZW50cnkgaW4gdGhlIGhlYXAuXG4gICAqL1xuICByZW1vdmUoZW50cnkpIHtcbiAgICAvLyBmaW5kIHRoZSBpbmRleCBvZiB0aGUgZW50cnlcbiAgICBjb25zdCBpbmRleCA9IGluZGV4T2YodGhpcy5faGVhcCwgZW50cnkpO1xuXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgY29uc3QgbGFzdEluZGV4ID0gdGhpcy5fY3VycmVudExlbmd0aCAtIDE7XG5cbiAgICAgIC8vIGlmIHRoZSBlbnRyeSBpcyB0aGUgbGFzdCBvbmVcbiAgICAgIGlmIChpbmRleCA9PT0gbGFzdEluZGV4KSB7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIGhlYXBcbiAgICAgICAgdGhpcy5faGVhcFtsYXN0SW5kZXhdID0gdW5kZWZpbmVkO1xuICAgICAgICAvLyB1cGRhdGUgY3VycmVudCBsZW5ndGhcbiAgICAgICAgdGhpcy5fY3VycmVudExlbmd0aCA9IGxhc3RJbmRleDtcblxuICAgICAgICByZXR1cm4gdGhpcy50aW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc3dhcCB3aXRoIHRoZSBsYXN0IGVsZW1lbnQgb2YgdGhlIGhlYXBcbiAgICAgICAgc3dhcCh0aGlzLl9oZWFwLCBpbmRleCwgbGFzdEluZGV4KTtcbiAgICAgICAgLy8gcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gaGVhcFxuICAgICAgICB0aGlzLl9oZWFwW2xhc3RJbmRleF0gPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgaWYgKGluZGV4ID09PSAxKSB7XG4gICAgICAgICAgdGhpcy5fYnViYmxlRG93bigxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBidWJibGUgdGhlIChleCBsYXN0KSBlbGVtZW50IHVwIG9yIGRvd24gYWNjb3JkaW5nIHRvIGl0cyBuZXcgY29udGV4dFxuICAgICAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5faGVhcFtpbmRleF07XG4gICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5faGVhcFtNYXRoLmZsb29yKGluZGV4IC8gMildO1xuXG4gICAgICAgICAgaWYgKHBhcmVudCAmJiB0aGlzLl9pc0hpZ2hlcihlbnRyeS5xdWV1ZVRpbWUsIHBhcmVudC5xdWV1ZVRpbWUpKVxuICAgICAgICAgICAgdGhpcy5fYnViYmxlVXAoaW5kZXgpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuX2J1YmJsZURvd24oaW5kZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IGxlbmd0aFxuICAgICAgdGhpcy5fY3VycmVudExlbmd0aCA9IGxhc3RJbmRleDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50aW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFyIHRoZSBxdWV1ZS5cbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX2N1cnJlbnRMZW5ndGggPSAxO1xuICAgIHRoaXMuX2hlYXAgPSBuZXcgQXJyYXkodGhpcy5faGVhcC5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmluZXMgaWYgdGhlIHF1ZXVlIGNvbnRhaW5zIHRoZSBnaXZlbiBgZW50cnlgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW50cnkgLSBFbnRyeSB0byBiZSBjaGVja2VkXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBoYXMoZW50cnkpIHtcbiAgICByZXR1cm4gdGhpcy5faGVhcC5pbmRleE9mKGVudHJ5KSAhPT0gLTE7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUHJpb3JpdHlRdWV1ZTtcbiIsIi8qKlxuICogU2NoZWR1bGluZ1F1ZXVlIGJhc2UgY2xhc3NcbiAqIGh0dHA6Ly93YXZlc2pzLmdpdGh1Yi5pby9hdWRpby8jYXVkaW8tc2NoZWR1bGluZy1xdWV1ZVxuICpcbiAqIE5vcmJlcnQuU2NobmVsbEBpcmNhbS5mclxuICogQ29weXJpZ2h0IDIwMTQsIDIwMTUgSVJDQU0g4oCTwqBDZW50cmUgUG9tcGlkb3VcbiAqL1xuXG5pbXBvcnQgUHJpb3JpdHlRdWV1ZSBmcm9tICcuL1ByaW9yaXR5UXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi9UaW1lRW5naW5lJztcblxuLyoqXG4gKiBAY2xhc3MgU2NoZWR1bGluZ1F1ZXVlXG4gKiBAZXh0ZW5kcyBUaW1lRW5naW5lXG4gKi9cbmNsYXNzIFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3F1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fZW5naW5lcyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgJ3NjaGVkdWxlZCcgaW50ZXJmYWNlXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9fcXVldWUuaGVhZDtcbiAgICBjb25zdCBuZXh0RW5naW5lVGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aW1lKTtcblxuICAgIGlmICghbmV4dEVuZ2luZVRpbWUpIHtcbiAgICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVRpbWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fcXVldWUudGltZTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWFzdGVyIG1ldGhvZCB0byBiZSBpbXBsZW1lbnRlZCBieSBkZXJpdmVkIGNsYXNzXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIGNhbGwgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWVcbiAgZGVmZXIoZnVuLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICghKGZ1biBpbnN0YW5jZW9mIEZ1bmN0aW9uKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgZGVmZXJlZCBieSBzY2hlZHVsZXJcIik7XG5cbiAgICB0aGlzLmFkZCh7XG4gICAgICBhZHZhbmNlVGltZTogZnVuY3Rpb24odGltZSkgeyBmdW4odGltZSk7IH0sIC8vIG1ha2Ugc3VyZSB0aGF0IHRoZSBhZHZhbmNlVGltZSBtZXRob2QgZG9lcyBub3QgcmV0dXJtIGFueXRoaW5nXG4gICAgfSwgdGltZSk7XG4gIH1cblxuICAvLyBhZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgc2NoZWR1bGVyXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCFUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuXG4gICAgLy8gYWRkIHRvIGVuZ2luZXMgYW5kIHF1ZXVlXG4gICAgdGhpcy5fX2VuZ2luZXMuYWRkKGVuZ2luZSk7XG4gICAgY29uc3QgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUuaW5zZXJ0KGVuZ2luZSwgdGltZSk7XG5cbiAgICAvLyByZXNjaGVkdWxlIHF1ZXVlXG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gcmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgcXVldWVcbiAgcmVtb3ZlKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuXG4gICAgLy8gcmVtb3ZlIGZyb20gYXJyYXkgYW5kIHF1ZXVlXG4gICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgY29uc3QgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG5cbiAgICAvLyByZXNjaGVkdWxlIHF1ZXVlXG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gcmVzZXQgbmV4dCBlbmdpbmUgdGltZVxuICByZXNldEVuZ2luZVRpbWUoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIGxldCBuZXh0VGltZTtcblxuICAgIGlmICh0aGlzLl9fcXVldWUuaGFzKGVuZ2luZSkpXG4gICAgICBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgdGltZSk7XG4gICAgZWxzZVxuICAgICAgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUuaW5zZXJ0KGVuZ2luZSwgdGltZSk7XG5cbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyBjaGVjayB3aGV0aGVyIGEgZ2l2ZW4gZW5naW5lIGlzIHNjaGVkdWxlZFxuICBoYXMoZW5naW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19lbmdpbmVzLmhhcyhlbmdpbmUpO1xuICB9XG5cbiAgLy8gY2xlYXIgcXVldWVcbiAgY2xlYXIoKSB7XG4gICAgZm9yKGxldCBlbmdpbmUgb2YgdGhpcy5fX2VuZ2luZXMpXG4gICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcblxuICAgIHRoaXMuX19xdWV1ZS5jbGVhcigpO1xuICAgIHRoaXMuX19lbmdpbmVzLmNsZWFyKCk7XG4gICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxpbmdRdWV1ZVxuIiwiLyoqXG4gKiBCYXNlIGNsYXNzIGZvciB0aW1lIGVuZ2luZXNcbiAqXG4gKiBBIHRpbWUgZW5naW5lIGdlbmVyYXRlcyBtb3JlIG9yIGxlc3MgcmVndWxhciBldmVudHMgYW5kL29yIHBsYXlzIGJhY2sgYVxuICogbWVkaWEgc3RyZWFtLiBJdCBpbXBsZW1lbnRzIG9uZSBvciBtdWx0aXBsZSBpbnRlcmZhY2VzIHRvIGJlIGRyaXZlbiBieSBhXG4gKiBtYXN0ZXIgKGkuZS4gYSBTY2hlZHVsZXIsIGEgVHJhbnNwb3J0IG9yIGEgUGxheUNvbnRyb2wpIGluIHN5bmNocm9uaXphdGlvblxuICogd2l0aCBvdGhlciBlbmdpbmVzLiBUaGUgcHJvdmlkZWQgaW50ZXJmYWNlcyBhcmUgc2NoZWR1bGVkLCB0cmFuc3BvcnRlZCxcbiAqIGFuZCBwbGF5LWNvbnRyb2xsZWQuXG4gKlxuICpcbiAqICMjIyMgVGhlIGBzY2hlZHVsZWRgIGludGVyZmFjZVxuICpcbiAqIFRoZSBzY2hlZHVsZWQgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY2hyb25pemluZyBhbiBlbmdpbmUgdG8gYSBtb25vdG9ub3VzIHRpbWVcbiAqIGFzIGl0IGlzIHByb3ZpZGVkIGJ5IHRoZSBTY2hlZHVsZXIgbWFzdGVyLlxuICpcbiAqICMjIyMjIyBgYWR2YW5jZVRpbWUodGltZSA6TnVtYmVyKSAtPiB7TnVtYmVyfWBcbiAqXG4gKiBUaGUgYGFkdmFuY2VUaW1lYCBtZXRob2QgaGFzIHRvIGJlIGltcGxlbWVudGVkIGJ5IGFuIGBUaW1lRW5naW5lYCBhcyBwYXJ0IG9mIHRoZVxuICogc2NoZWR1bGVkIGludGVyZmFjZS4gVGhlIG1ldGhvZCBpcyBjYWxsZWQgYnkgdGhlIG1hc3RlciAoZS5nLiB0aGUgc2NoZWR1bGVyKS5cbiAqIEl0IGdlbmVyYXRlcyBhbiBldmVudCBhbmQgdG8gcmV0dXJucyB0aGUgdGltZSBvZiB0aGUgbmV4dCBldmVudCAoaS5lLiB0aGUgbmV4dFxuICogY2FsbCBvZiBhZHZhbmNlVGltZSkuIFRoZSByZXR1cm5lZCB0aW1lIGhhcyB0byBiZSBncmVhdGVyIHRoYW4gdGhlIHRpbWVcbiAqIHJlY2VpdmVkIGFzIGFyZ3VtZW50IG9mIHRoZSBtZXRob2QuIEluIGNhc2UgdGhhdCBhIFRpbWVFbmdpbmUgaGFzIHRvIGdlbmVyYXRlXG4gKiBtdWx0aXBsZSBldmVudHMgYXQgdGhlIHNhbWUgdGltZSwgdGhlIGVuZ2luZSBoYXMgdG8gaW1wbGVtZW50IGl0cyBvd24gbG9vcFxuICogd2hpbGUoZXZlbnQudGltZSA8PSB0aW1lKSBhbmQgcmV0dXJuIHRoZSB0aW1lIG9mIHRoZSBuZXh0IGV2ZW50IChpZiBhbnkpLlxuICpcbiAqICMjIyMjIyBgcmVzZXRUaW1lKHRpbWU9dW5kZWZpbmVkIDpOdW1iZXIpYFxuICpcbiAqIFRoZSBgcmVzZXRUaW1lYCBtZXRob2QgaXMgcHJvdmlkZWQgYnkgdGhlIGBUaW1lRW5naW5lYCBiYXNlIGNsYXNzLiBBbiBlbmdpbmUgbWF5XG4gKiBjYWxsIHRoaXMgbWV0aG9kIHRvIHJlc2V0IGl0cyBuZXh0IGV2ZW50IHRpbWUgKGUuZy4gd2hlbiBhIHBhcmFtZXRlciBpc1xuICogY2hhbmdlZCB0aGF0IGluZmx1ZW5jZXMgdGhlIGVuZ2luZSdzIHRlbXBvcmFsIGJlaGF2aW9yKS4gV2hlbiBubyBhcmd1bWVudFxuICogaXMgZ2l2ZW4sIHRoZSB0aW1lIGlzIHJlc2V0IHRvIHRoZSBjdXJyZW50IG1hc3RlciB0aW1lLiBXaGVuIGNhbGxpbmcgdGhlXG4gKiBtZXRob2Qgd2l0aCBJbmZpbml0eSB0aGUgZW5naW5lIGlzIHN1c3BlbmRlZCB3aXRob3V0IGJlaW5nIHJlbW92ZWQgZnJvbSB0aGVcbiAqIG1hc3Rlci5cbiAqXG4gKlxuICogIyMjIyBUaGUgYHRyYW5zcG9ydGVkYCBpbnRlcmZhY2VcbiAqXG4gKiBUaGUgdHJhbnNwb3J0ZWQgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY2hyb25pemluZyBhbiBlbmdpbmUgdG8gYSBwb3NpdGlvblxuICogKGkuZS4gbWVkaWEgcGxheWJhY2sgdGltZSkgdGhhdCBjYW4gcnVuIGZvcndhcmQgYW5kIGJhY2t3YXJkIGFuZCBqdW1wIGFzIGl0XG4gKiBpcyBwcm92aWRlZCBieSB0aGUgVHJhbnNwb3J0IG1hc3Rlci5cbiAqXG4gKiAjIyMjIyMgYHN5bmNQb3NpdGlvbih0aW1lIDpOdW1iZXIsIHBvc2l0aW9uIDpOdW1iZXIsIHNwZWVkIDpOdW1iZXIpIC0+IHtOdW1iZXJ9YFxuICpcbiAqIFRoZSBgc3luY1Bvc2l0b25gIG1ldGhvZCBoYXMgdG8gYmUgaW1wbGVtZW50ZWQgYnkgYSBgVGltZUVuZ2luZWAgYXMgcGFydCBvZiB0aGVcbiAqIHRyYW5zcG9ydGVkIGludGVyZmFjZS4gVGhlIG1ldGhvZCBzeW5jUG9zaXRvbiBpcyBjYWxsZWQgd2hlbmV2ZXIgdGhlIG1hc3RlclxuICogb2YgYSB0cmFuc3BvcnRlZCBlbmdpbmUgaGFzIHRvIChyZS0pc3luY2hyb25pemUgdGhlIGVuZ2luZSdzIHBvc2l0aW9uLiBUaGlzXG4gKiBpcyBmb3IgZXhhbXBsZSByZXF1aXJlZCB3aGVuIHRoZSBtYXN0ZXIgKHJlLSlzdGFydHMgcGxheWJhY2ssIGp1bXBzIHRvIGFuXG4gKiBhcmJpdHJhcnkgcG9zaXRpb24sIGFuZCB3aGVuIHJldmVyc2luZyBwbGF5YmFjayBkaXJlY3Rpb24uIFRoZSBtZXRob2QgcmV0dXJuc1xuICogdGhlIG5leHQgcG9zaXRpb24gb2YgdGhlIGVuZ2luZSBpbiB0aGUgZ2l2ZW4gcGxheWJhY2sgZGlyZWN0aW9uXG4gKiAoaS5lLiBgc3BlZWQgPCAwYCBvciBgc3BlZWQgPiAwYCkuXG4gKlxuICogIyMjIyMjIGBhZHZhbmNlUG9zaXRpb24odGltZSA6TnVtYmVyLCBwb3NpdGlvbiA6TnVtYmVyLCBzcGVlZCA6TnVtYmVyKSAtPiB7TnVtYmVyfWBcbiAqXG4gKiBUaGUgYGFkdmFuY2VQb3NpdGlvbmAgbWV0aG9kIGhhcyB0byBiZSBpbXBsZW1lbnRlZCBieSBhIGBUaW1lRW5naW5lYCBhcyBwYXJ0XG4gKiBvZiB0aGUgdHJhbnNwb3J0ZWQgaW50ZXJmYWNlLiBUaGUgbWFzdGVyIGNhbGxzIHRoZSBhZHZhbmNlUG9zaXRvbiBtZXRob2Qgd2hlblxuICogdGhlIGVuZ2luZSdzIGV2ZW50IHBvc2l0aW9uIGlzIHJlYWNoZWQuIFRoZSBtZXRob2QgZ2VuZXJhdGVzIGFuIGV2ZW50IGFuZFxuICogcmV0dXJucyB0aGUgbmV4dCBwb3NpdGlvbiBpbiB0aGUgZ2l2ZW4gcGxheWJhY2sgZGlyZWN0aW9uIChpLmUuIHNwZWVkIDwgMCBvclxuICogc3BlZWQgPiAwKS4gVGhlIHJldHVybmVkIHBvc2l0aW9uIGhhcyB0byBiZSBncmVhdGVyIChpLmUuIHdoZW4gc3BlZWQgPiAwKVxuICogb3IgbGVzcyAoaS5lLiB3aGVuIHNwZWVkIDwgMCkgdGhhbiB0aGUgcG9zaXRpb24gcmVjZWl2ZWQgYXMgYXJndW1lbnQgb2YgdGhlXG4gKiBtZXRob2QuXG4gKlxuICogIyMjIyMjIGByZXNldFBvc2l0aW9uKHBvc2l0aW9uPXVuZGVmaW5lZCA6TnVtYmVyKWBcbiAqXG4gKiBUaGUgcmVzZXRQb3NpdGlvbiBtZXRob2QgaXMgcHJvdmlkZWQgYnkgdGhlIFRpbWVFbmdpbmUgYmFzZSBjbGFzcy4gQW4gZW5naW5lXG4gKiBtYXkgY2FsbCB0aGlzIG1ldGhvZCB0byByZXNldCBpdHMgbmV4dCBldmVudCBwb3NpdGlvbi4gV2hlbiBubyBhcmd1bWVudFxuICogaXMgZ2l2ZW4sIHRoZSB0aW1lIGlzIHJlc2V0IHRvIHRoZSBjdXJyZW50IG1hc3RlciB0aW1lLiBXaGVuIGNhbGxpbmcgdGhlXG4gKiBtZXRob2Qgd2l0aCBJbmZpbml0eSB0aGUgZW5naW5lIGlzIHN1c3BlbmRlZCB3aXRob3V0IGJlaW5nIHJlbW92ZWQgZnJvbVxuICogdGhlIG1hc3Rlci5cbiAqXG4gKlxuICogIyMjIyBUaGUgc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2VcbiAqXG4gKiBUaGUgXCJzcGVlZC1jb250cm9sbGVkXCIgaW50ZXJmYWNlIGFsbG93cyBmb3Igc3luY3Jvbml6aW5nIGFuIGVuZ2luZSB0aGF0IGlzXG4gKiBuZWl0aGVyIGRyaXZlbiB0aHJvdWdoIHRoZSBzY2hlZHVsZWQgbm9yIHRoZSB0cmFuc3BvcnRlZCBpbnRlcmZhY2UuIFRoZVxuICogaW50ZXJmYWNlIGFsbG93cyBpbiBwYXJ0aWN1bGFyIHRvIHN5bmNocm9uaXplIGVuZ2luZXMgdGhhdCBhc3N1cmUgdGhlaXIgb3duXG4gKiBzY2hlZHVsaW5nIChpLmUuIGF1ZGlvIHBsYXllciBvciBhbiBvc2NpbGxhdG9yKSB0byB0aGUgZXZlbnQtYmFzZWQgc2NoZWR1bGVkXG4gKiBhbmQgdHJhbnNwb3J0ZWQgZW5naW5lcy5cbiAqXG4gKiAjIyMjIyMgYHN5bmNTcGVlZCh0aW1lIDpOdW1iZXIsIHBvc2l0aW9uIDpOdW1iZXIsIHNwZWVkIDpOdW1iZXIsIHNlZWs9ZmFsc2UgOkJvb2xlYW4pYFxuICpcbiAqIFRoZSBzeW5jU3BlZWQgbWV0aG9kIGhhcyB0byBiZSBpbXBsZW1lbnRlZCBieSBhIFRpbWVFbmdpbmUgYXMgcGFydCBvZiB0aGVcbiAqIHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlLiBUaGUgbWV0aG9kIGlzIGNhbGxlZCBieSB0aGUgbWFzdGVyIHdoZW5ldmVyIHRoZVxuICogcGxheWJhY2sgc3BlZWQgY2hhbmdlcyBvciB0aGUgcG9zaXRpb24ganVtcHMgYXJiaXRhcmlseSAoaS5lLiBvbiBhIHNlZWspLlxuICpcbiAqXG4gKiA8aHIgLz5cbiAqXG4gKiBFeGFtcGxlIHRoYXQgc2hvd3MgYSBgVGltZUVuZ2luZWAgcnVubmluZyBpbiBhIGBTY2hlZHVsZXJgIHRoYXQgY291bnRzIHVwXG4gKiBhdCBhIGdpdmVuIGZyZXF1ZW5jeTpcbiAqIHtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvdGltZS1lbmdpbmUuaHRtbH1cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgYXVkaW8gZnJvbSAnd2F2ZXMtYXVkaW8nO1xuICpcbiAqIGNsYXNzIE15RW5naW5lIGV4dGVuZHMgYXVkaW8uVGltZUVuZ2luZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHN1cGVyKCk7XG4gKiAgICAgLy8gLi4uXG4gKiAgIH1cbiAqIH1cbiAqXG4gKi9cbmNsYXNzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgZW5naW5lJ3MgbWFzdGVyLlxuICAgICAqXG4gICAgICogQHR5cGUge01peGVkfVxuICAgICAqIEBuYW1lIG1hc3RlclxuICAgICAqIEBtZW1iZXJvZiBUaW1lRW5naW5lXG4gICAgICovXG4gICAgdGhpcy5tYXN0ZXIgPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSB0aW1lIGVuZ2luZSdzIGN1cnJlbnQgKG1hc3RlcikgdGltZS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgdGltZSBlbmdpbmUncyBjdXJyZW50IChtYXN0ZXIpIHBvc2l0aW9uLlxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVkIGludGVyZmFjZVxuICAgKiAgIC0gYWR2YW5jZVRpbWUodGltZSksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUsIHJldHVybnMgbmV4dCB0aW1lXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICovXG4gIHN0YXRpYyBpbXBsZW1lbnRzU2NoZWR1bGVkKGVuZ2luZSkge1xuICAgIHJldHVybiAoZW5naW5lLmFkdmFuY2VUaW1lICYmIGVuZ2luZS5hZHZhbmNlVGltZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxuXG4gIHJlc2V0VGltZSh0aW1lID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydGVkIGludGVyZmFjZVxuICAgKiAgIC0gc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byByZXBvc2l0aW9uIFRpbWVFbmdpbmUsIHJldHVybnMgbmV4dCBwb3NpdGlvblxuICAgKiAgIC0gYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUgYW5kIHBvc2l0aW9uLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICpcbiAgICogQHN0YXRpY1xuICAgKiBAbWVtYmVyb2YgVGltZUVuZ2luZVxuICAgKi9cbiAgc3RhdGljIGltcGxlbWVudHNUcmFuc3BvcnRlZChlbmdpbmUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZW5naW5lLnN5bmNQb3NpdGlvbiAmJiBlbmdpbmUuc3luY1Bvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb24gJiZcbiAgICAgIGVuZ2luZS5hZHZhbmNlUG9zaXRpb24gJiYgZW5naW5lLmFkdmFuY2VQb3NpdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uXG4gICAgKTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpXG4gICAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGVlZC1jb250cm9sbGVkIGludGVyZmFjZVxuICAgKiAgIC0gc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgKSwgY2FsbGVkIHRvXG4gICAqXG4gICAqIEBzdGF0aWNcbiAgICogQG1lbWJlcm9mIFRpbWVFbmdpbmVcbiAgICovXG4gIHN0YXRpYyBpbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkge1xuICAgIHJldHVybiAoZW5naW5lLnN5bmNTcGVlZCAmJiBlbmdpbmUuc3luY1NwZWVkIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRpbWVFbmdpbmU7XG4iLCIvLyBjb3JlXG5leHBvcnQgeyBkZWZhdWx0IGFzIFRpbWVFbmdpbmUgfSBmcm9tICcuL2NvcmUvVGltZUVuZ2luZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFByaW9yaXR5UXVldWUgfSBmcm9tICcuL2NvcmUvUHJpb3JpdHlRdWV1ZSc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjaGVkdWxpbmdRdWV1ZSB9IGZyb20gJy4vY29yZS9TY2hlZHVsaW5nUXVldWUnO1xuXG4vLyBtYXN0ZXJzXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBsYXlDb250cm9sIH0gZnJvbSAnLi9tYXN0ZXJzL1BsYXlDb250cm9sJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVHJhbnNwb3J0IH0gZnJvbSAnLi9tYXN0ZXJzL1RyYW5zcG9ydCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9TY2hlZHVsZXInO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTaW1wbGVTY2hlZHVsZXIgfSBmcm9tICcuL21hc3RlcnMvU2ltcGxlU2NoZWR1bGVyJztcbiIsImltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vY29yZS9TY2hlZHVsaW5nUXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9UaW1lRW5naW5lJztcblxuY29uc3QgRVBTSUxPTiA9IDFlLTg7XG5cbmNsYXNzIExvb3BDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuc3BlZWQgPSAxO1xuICAgIHRoaXMubG93ZXIgPSAtSW5maW5pdHk7XG4gICAgdGhpcy51cHBlciA9IEluZmluaXR5O1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICBjb25zdCBwbGF5Q29udHJvbCA9IHRoaXMuX19wbGF5Q29udHJvbDtcbiAgICBjb25zdCBzcGVlZCA9IHRoaXMuc3BlZWQ7XG4gICAgY29uc3QgbG93ZXIgPSB0aGlzLmxvd2VyO1xuICAgIGNvbnN0IHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDApXG4gICAgICB0aW1lICs9IEVQU0lMT047XG4gICAgZWxzZVxuICAgICAgdGltZSAtPSBFUFNJTE9OO1xuXG4gICAgaWYgKHNwZWVkID4gMCkge1xuICAgICAgcGxheUNvbnRyb2wuc3luY1NwZWVkKHRpbWUsIGxvd2VyLCBzcGVlZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbih1cHBlcikgLSBFUFNJTE9OO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgdXBwZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyKSArIEVQU0lMT047XG4gICAgfVxuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgcmVzY2hlZHVsZShzcGVlZCkge1xuICAgIGNvbnN0IHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIGNvbnN0IGxvd2VyID0gTWF0aC5taW4ocGxheUNvbnRyb2wuX19sb29wU3RhcnQsIHBsYXlDb250cm9sLl9fbG9vcEVuZCk7XG4gICAgY29uc3QgdXBwZXIgPSBNYXRoLm1heChwbGF5Q29udHJvbC5fX2xvb3BTdGFydCwgcGxheUNvbnRyb2wuX19sb29wRW5kKTtcblxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLmxvd2VyID0gbG93ZXI7XG4gICAgdGhpcy51cHBlciA9IHVwcGVyO1xuXG4gICAgaWYgKGxvd2VyID09PSB1cHBlcilcbiAgICAgIHNwZWVkID0gMDtcblxuICAgIGlmIChzcGVlZCA+IDApXG4gICAgICB0aGlzLnJlc2V0VGltZShwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHVwcGVyKSAtIEVQU0lMT04pO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obG93ZXIpICsgRVBTSUxPTik7XG4gICAgZWxzZVxuICAgICAgdGhpcy5yZXNldFRpbWUoSW5maW5pdHkpO1xuICB9XG5cbiAgYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBjb25zdCBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgY29uc3QgdXBwZXIgPSB0aGlzLnVwcGVyO1xuXG4gICAgaWYgKHNwZWVkID4gMCAmJiBwb3NpdGlvbiA+PSB1cHBlcilcbiAgICAgIHJldHVybiBsb3dlciArIChwb3NpdGlvbiAtIGxvd2VyKSAlICh1cHBlciAtIGxvd2VyKTtcbiAgICBlbHNlIGlmIChzcGVlZCA8IDAgJiYgcG9zaXRpb24gPCBsb3dlcilcbiAgICAgIHJldHVybiB1cHBlciAtICh1cHBlciAtIHBvc2l0aW9uKSAlICh1cHBlciAtIGxvd2VyKTtcblxuICAgIHJldHVybiBwb3NpdGlvbjtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2xsZWQgYmFzZSBjbGFzc1xuY2xhc3MgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrKTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcblxuICAgIHRoaXMuX19lbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIGVuZ2luZXMgaW1wbGVtZW50aW5nIHRoZSAqc3BlZWQtY29udHJvbGxlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBmb3IgZW5naW5lcyBpbXBsbWVudGluZyB0aGUgKnRyYW5zcG9ydGVkKiBpbnRlcmZhY2VcbmNsYXNzIFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFBsYXlDb250cm9sbGVkU2NoZWR1bGVySG9vayhwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IChzZWVrICYmIHNwZWVkICE9PSAwKSkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbjtcblxuICAgICAgLy8gcmVzeW5jIHRyYW5zcG9ydGVkIGVuZ2luZXNcbiAgICAgIGlmIChzZWVrIHx8IHNwZWVkICogbGFzdFNwZWVkIDwgMCkge1xuICAgICAgICAvLyBzZWVrIG9yIHJldmVyc2UgZGlyZWN0aW9uXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdGFydFxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdG9wXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgICAgIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZClcbiAgICAgICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKSB7XG4gICAgICAgIC8vIGNoYW5nZSBzcGVlZCB3aXRob3V0IHJldmVyc2luZyBkaXJlY3Rpb25cbiAgICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24oZW5naW5lLCBwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgICB2YXIgdGltZSA9IHBsYXlDb250cm9sLl9fc3luYygpO1xuXG4gICAgICBwb3NpdGlvbiA9IHRoaXMuX19lbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBsYXlDb250cm9sLl9fcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIH1cblxuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5kZXN0cm95KCk7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2sgPSBudWxsO1xuXG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBmb3IgdGltZSBlbmdpbmVzIGltcGxlbWVudGluZyB0aGUgKnNjaGVkdWxlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCBleHRlbmRzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuXG4gICAgLy8gc2NoZWR1bGluZyBxdWV1ZSBiZWNvbWVzIG1hc3RlciBvZiBlbmdpbmVcbiAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFBsYXlDb250cm9sbGVkU2NoZWR1bGluZ1F1ZXVlKHBsYXlDb250cm9sLCBlbmdpbmUpO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKSB7XG4gICAgaWYgKGxhc3RTcGVlZCA9PT0gMCAmJiBzcGVlZCAhPT0gMCkgLy8gc3RhcnQgb3Igc2Vla1xuICAgICAgdGhpcy5fX2VuZ2luZS5yZXNldFRpbWUoKTtcbiAgICBlbHNlIGlmIChsYXN0U3BlZWQgIT09IDAgJiYgc3BlZWQgPT09IDApIC8vIHN0b3BcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZS5kZXN0cm95KCk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIHRyYW5zbGF0ZXMgdHJhbnNwb3J0ZWQgZW5naW5lIGFkdmFuY2VQb3NpdGlvbiBpbnRvIGdsb2JhbCBzY2hlZHVsZXIgdGltZXNcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGVySG9vayBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuICAgIHRoaXMuX19lbmdpbmUgPSBlbmdpbmU7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgcGxheUNvbnRyb2wuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgcGxheUNvbnRyb2wgPSB0aGlzLl9fcGxheUNvbnRyb2w7XG4gICAgdmFyIGVuZ2luZSA9IHRoaXMuX19lbmdpbmU7XG4gICAgdmFyIHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbjtcbiAgICB2YXIgbmV4dFBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgcGxheUNvbnRyb2wuX19zcGVlZCk7XG4gICAgdmFyIG5leHRUaW1lID0gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IG5leHRQb3NpdGlvbjtcbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbikge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3BsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pO1xuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIGludGVybmFsIHNjaGVkdWxpbmcgcXVldWUgdGhhdCByZXR1cm5zIHRoZSBjdXJyZW50IHBvc2l0aW9uIChhbmQgdGltZSkgb2YgdGhlIHBsYXkgY29udHJvbFxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gICAgcGxheUNvbnRyb2wuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlDb250cm9sLmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZSh0aGlzLl9fZW5naW5lKTtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHRlbmRzIFRpbWUgRW5naW5lIHRvIHByb3ZpZGUgcGxheWJhY2sgY29udHJvbCBvZiBhIFRpbWUgRW5naW5lIGluc3RhbmNlLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1hdWRpby9tYXN0ZXIvZXhhbXBsZXMvcGxheS1jb250cm9sLmh0bWx9XG4gKlxuICogQGV4dGVuZHMgVGltZUVuZ2luZVxuICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBlbmdpbmUgdG8gY29udHJvbFxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBtYXN0ZXJzIGZyb20gJ3dhdmVzLW1hc3RlcnMnO1xuICpcbiAqIGNvbnN0IGdldFRpbWVGdW5jdGlvbiA9ICgpID0+IHtcbiAqICAgY29uc3Qgbm93ID0gcHJvY2Vzcy5ocnRpbWUoKTtcbiAqICAgcmV0dXJuIG5vd1swXSArIG5vd1sxXSAqIDFlLTk7XG4gKiB9XG4gKiBjb25zdCBzY2hlZHVsZXIgPSBuZXcgbWFzdGVycy5TY2hlZHVsZXIoZ2V0VGltZUZ1bmN0aW9uKTtcbiAqIGNvbnN0IHBsYXllckVuZ2luZSA9IG5ldyBNeVRpbWVFbmdpbmUoKTtcbiAqIGNvbnN0IHBsYXlDb250cm9sID0gbmV3IG1hc3RlcnMuUGxheUNvbnRyb2woc2NoZWR1bGVyLCBwbGF5ZXJFbmdpbmUpO1xuICpcbiAqIHBsYXlDb250cm9sLnN0YXJ0KCk7XG4gKi9cbmNsYXNzIFBsYXlDb250cm9sIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHNjaGVkdWxlciwgZW5naW5lLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3NjaGVkdWxlciA9IHNjaGVkdWxlcjtcblxuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IDE7XG5cbiAgICAvLyBzeW5jaHJvbml6ZWQgdGllLCBwb3NpdGlvbiwgYW5kIHNwZWVkXG4gICAgdGhpcy5fX3RpbWUgPSAwO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IDA7XG4gICAgdGhpcy5fX3NwZWVkID0gMDtcblxuICAgIC8vIG5vbi16ZXJvIFwidXNlclwiIHNwZWVkXG4gICAgdGhpcy5fX3BsYXlpbmdTcGVlZCA9IDE7XG5cbiAgICBpZiAoZW5naW5lKVxuICAgICAgdGhpcy5fX3NldEVuZ2luZShlbmdpbmUpO1xuICB9XG5cbiAgX19zZXRFbmdpbmUoZW5naW5lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoZW5naW5lKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRUcmFuc3BvcnRlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkU2NoZWR1bGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBwbGF5IGNvbnRyb2xcIik7XG4gIH1cblxuICBfX3Jlc2V0RW5naW5lKCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5kZXN0cm95KCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUvZXh0cmFwb2xhdGUgcGxheWluZyB0aW1lIGZvciBnaXZlbiBwb3NpdGlvblxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgdGltZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgcG9zaXRpb24gZm9yIGdpdmVuIHRpbWVcbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgdGltZVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGV4dHJhcG9sYXRlZCBwb3NpdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX19nZXRQb3NpdGlvbkF0VGltZSh0aW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wb3NpdGlvbiArICh0aW1lIC0gdGhpcy5fX3RpbWUpICogdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgX19zeW5jKCkge1xuICAgIGNvbnN0IG5vdyA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uICs9IChub3cgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gICAgdGhpcy5fX3RpbWUgPSBub3c7XG5cbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lLlxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgcmVwbGFjZWQgd2hlbiB0aGUgcGxheS1jb250cm9sIGlzIGFkZGVkIHRvIGEgbWFzdGVyLlxuICAgKlxuICAgKiBAbmFtZSBjdXJyZW50VGltZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgUGxheUNvbnRyb2xcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fc2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciBwb3NpdGlvbi5cbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHBsYXktY29udHJvbCBpcyBhZGRlZCB0byBhIG1hc3Rlci5cbiAgICpcbiAgICogQG5hbWUgY3VycmVudFBvc2l0aW9uXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIHRoZSBwbGF5IGNvbnRyb2wgaXMgcnVubmluZy5cbiAgICpcbiAgICogQG5hbWUgcnVubmluZ1xuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIGdldCBydW5uaW5nKCkge1xuICAgIHJldHVybiAhKHRoaXMuX19zcGVlZCA9PT0gMCk7XG4gIH1cblxuICBzZXQoZW5naW5lID0gbnVsbCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIGNvbnN0IHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCAhPT0gbnVsbCAmJiB0aGlzLl9fcGxheUNvbnRyb2xsZWQuX19lbmdpbmUgIT09IGVuZ2luZSkge1xuXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcmVzZXRFbmdpbmUoKTtcblxuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkID09PSBudWxsICYmIGVuZ2luZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKVxuICAgICAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwbGF5IGNvbnRyb2wgbG9vcCBiZWhhdmlvci5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqIEBuYW1lIGxvb3BcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGxvb3AoZW5hYmxlKSB7XG4gICAgaWYgKGVuYWJsZSAmJiB0aGlzLl9fbG9vcFN0YXJ0ID4gLUluZmluaXR5ICYmIHRoaXMuX19sb29wRW5kIDwgSW5maW5pdHkpIHtcbiAgICAgIGlmICghdGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICAgIHRoaXMuX19sb29wQ29udHJvbCA9IG5ldyBMb29wQ29udHJvbCh0aGlzKTtcbiAgICAgICAgdGhpcy5fX3NjaGVkdWxlci5hZGQodGhpcy5fX2xvb3BDb250cm9sLCBJbmZpbml0eSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgICAgICAgY29uc3QgbG93ZXIgPSBNYXRoLm1pbih0aGlzLl9fbG9vcFN0YXJ0LCB0aGlzLl9fbG9vcEVuZCk7XG4gICAgICAgIGNvbnN0IHVwcGVyID0gTWF0aC5tYXgodGhpcy5fX2xvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9fc3BlZWQgPiAwICYmIHBvc2l0aW9uID4gdXBwZXIpXG4gICAgICAgICAgdGhpcy5zZWVrKHVwcGVyKTtcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fX3NwZWVkIDwgMCAmJiBwb3NpdGlvbiA8IGxvd2VyKVxuICAgICAgICAgIHRoaXMuc2Vlayhsb3dlcik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGxvb3Agc3RhcnQgYW5kIGVuZCB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbG9vcFN0YXJ0IC0gbG9vcCBzdGFydCB2YWx1ZS5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxvb3BFbmQgLSBsb29wIGVuZCB2YWx1ZS5cbiAgICovXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgbG9vcCBzdGFydCB2YWx1ZVxuICAgKlxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbmFtZSBsb29wU3RhcnRcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGxvb3AgZW5kIHZhbHVlXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIGxvb3BFbmRcbiAgICogQG1lbWJlcm9mIFBsYXlDb250cm9sXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2V0IGxvb3BFbmQobG9vcEVuZCkge1xuICAgIHRoaXMuc2V0TG9vcEJvdW5kYXJpZXModGhpcy5fX2xvb3BTdGFydCwgbG9vcEVuZCk7XG4gIH1cblxuICBnZXQgbG9vcEVuZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BFbmQ7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UpXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWsgPSBmYWxzZSkge1xuICAgIGNvbnN0IGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmICgoc2VlayB8fCBsYXN0U3BlZWQgPT09IDApICYmIHRoaXMuX19sb29wQ29udHJvbClcbiAgICAgICAgcG9zaXRpb24gPSB0aGlzLl9fbG9vcENvbnRyb2wuYXBwbHlMb29wQm91bmRhcmllcyhwb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlaywgbGFzdFNwZWVkKTtcblxuICAgICAgaWYgKHRoaXMuX19sb29wQ29udHJvbClcbiAgICAgICAgdGhpcy5fX2xvb3BDb250cm9sLnJlc2NoZWR1bGUoc3BlZWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgcGxheWJhY2tcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgdGhpcy5fX3BsYXlpbmdTcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2VzIHBsYXliYWNrIGFuZCBzdGF5cyBhdCB0aGUgc2FtZSBwb3NpdGlvbi5cbiAgICovXG4gIHBhdXNlKCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgMCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgcGxheWJhY2sgYW5kIHNlZWtzIHRvIGluaXRpYWwgKDApIHBvc2l0aW9uLlxuICAgKi9cbiAgc3RvcCgpIHtcbiAgICBjb25zdCB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCAwLCAwLCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBzcGVlZCBpZiBwcm92aWRlZCwgc2V0cyB0aGUgcGxheWJhY2sgc3BlZWQuIFRoZSBzcGVlZCB2YWx1ZSBzaG91bGRcbiAgICogYmUgbm9uLXplcm8gYmV0d2VlbiAtMTYgYW5kIC0xLzE2IG9yIGJldHdlZW4gMS8xNiBhbmQgMTYuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBuYW1lIHNwZWVkXG4gICAqIEBtZW1iZXJvZiBQbGF5Q29udHJvbFxuICAgKiBAaW5zdGFuY2VcbiAgICovXG4gIHNldCBzcGVlZChzcGVlZCkge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAoIXRoaXMubWFzdGVyICYmIHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZ2V0IHNwZWVkKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheWluZ1NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCAoanVtcCB0bykgcGxheWluZyBwb3NpdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl9fc3luYygpO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlDb250cm9sO1xuIiwiaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vY29yZS9TY2hlZHVsaW5nUXVldWUnO1xuXG5jb25zdCBsb2cgPSBkZWJ1Zygnd2F2ZXNqczptYXN0ZXJzJyk7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuY3Rpb25Ub0NoZWNrKSB7XG4gIHJldHVybiBmdW5jdGlvblRvQ2hlY2sgJiYge30udG9TdHJpbmcuY2FsbChmdW5jdGlvblRvQ2hlY2spID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqIFRoZSBgU2NoZWR1bGVyYCBjbGFzcyBpbXBsZW1lbnRzIGEgbWFzdGVyIGZvciBgVGltZUVuZ2luZWAgaW5zdGFuY2VzXG4gKiB0aGF0IGltcGxlbWVudCB0aGUgKnNjaGVkdWxlZCogaW50ZXJmYWNlIChzdWNoIGFzIHRoZSBgTWV0cm9ub21lYCBhbmRcbiAqIGBHcmFudWxhckVuZ2luZWApLlxuICpcbiAqIEEgYFNjaGVkdWxlcmAgY2FuIGFsc28gc2NoZWR1bGUgc2ltcGxlIGNhbGxiYWNrIGZ1bmN0aW9ucy5cbiAqIFRoZSBjbGFzcyBpcyBiYXNlZCBvbiByZWN1cnNpdmUgY2FsbHMgdG8gYHNldFRpbWVvdXRgIGFuZCB1c2VzIHRoZSB0aW1lXG4gKiByZXR1cm5lZCBieSB0aGUgYGdldFRpbWVGdW5jdGlvbmAgcGFzc2VkIGFzIGZpcnN0IGFyZ3VtZW50IGFzIGEgbG9naWNhbCB0aW1lXG4gKiBwYXNzZWQgdG8gdGhlIGBhZHZhbmNlVGltZWAgbWV0aG9kcyBvZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgb3IgdG8gdGhlXG4gKiBzY2hlZHVsZWQgY2FsbGJhY2sgZnVuY3Rpb25zLlxuICogSXQgZXh0ZW5kcyB0aGUgYFNjaGVkdWxpbmdRdWV1ZWAgY2xhc3MgdGhhdCBpdHNlbGYgaW5jbHVkZXMgYSBgUHJpb3JpdHlRdWV1ZWBcbiAqIHRvIGFzc3VyZSB0aGUgb3JkZXIgb2YgdGhlIHNjaGVkdWxlZCBlbmdpbmVzIChzZWUgYFNpbXBsZVNjaGVkdWxlcmAgZm9yIGFcbiAqIHNpbXBsaWZpZWQgc2NoZWR1bGVyIGltcGxlbWVudGF0aW9uIHdpdGhvdXQgYFByaW9yaXR5UXVldWVgKS5cbiAqXG4gKiB7QGxpbmsgaHR0cHM6Ly9yYXdnaXQuY29tL3dhdmVzanMvd2F2ZXMtbWFzdGVycy9tYXN0ZXIvZXhhbXBsZXMvc2NoZWR1bGVyfVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldFRpbWVGdW5jdGlvbiAtIEZ1bmN0aW9uIHRoYXQgbXVzdCByZXR1cm4gYSB0aW1lIGluIHNlY29uZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gLSBkZWZhdWx0IG9wdGlvbnMuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kPTAuMDI1XSAtIHBlcmlvZCBvZiB0aGUgc2NoZWR1bGVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmxvb2thaGVhZD0wLjFdIC0gbG9va2FoZWFkIG9mIHRoZSBzY2hlZHVsZXIuXG4gKlxuICogQHNlZSBUaW1lRW5naW5lXG4gKiBAc2VlIFNpbXBsZVNjaGVkdWxlclxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgKiBhcyBtYXN0ZXJzIGZyb20gJ3dhdmVzLW1hc3RlcnMnO1xuICpcbiAqIGNvbnN0IGdldFRpbWVGdW5jdGlvbiA9ICgpID0+IHByZWZvcm1hbmNlLm5vdygpIC8gMTAwMDtcbiAqIGNvbnN0IHNjaGVkdWxlciA9IG5ldyBtYXN0ZXJzLlNjaGVkdWxlcihnZXRUaW1lRnVuY3Rpb24pO1xuICpcbiAqIHNjaGVkdWxlci5hZGQobXlFbmdpbmUpO1xuICovXG5jbGFzcyBTY2hlZHVsZXIgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3RvcihnZXRUaW1lRnVuY3Rpb24sIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAoIWlzRnVuY3Rpb24oZ2V0VGltZUZ1bmN0aW9uKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudCBgZ2V0VGltZUZ1bmN0aW9uYCcpO1xuXG4gICAgdGhpcy5nZXRUaW1lRnVuY3Rpb24gPSBnZXRUaW1lRnVuY3Rpb247XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IEluZmluaXR5O1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIHNjaGVkdWxlciAoc2V0VGltZW91dCkgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKiBAbmFtZSBwZXJpb2RcbiAgICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAgICogQGluc3RhbmNlXG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCDCoDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqIEBuYW1lIGxvb2thaGVhZFxuICAgICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICAgKiBAaW5zdGFuY2VcbiAgICAgKi9cbiAgICB0aGlzLmxvb2thaGVhZCA9IG9wdGlvbnMubG9va2FoZWFkIHx8IMKgMC4xO1xuICB9XG5cbiAgLy8gc2V0VGltZW91dCBzY2hlZHVsaW5nIGxvb3BcbiAgX190aWNrKCkge1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gdGhpcy5nZXRUaW1lRnVuY3Rpb24oKTtcbiAgICBsZXQgdGltZSA9IHRoaXMuX19uZXh0VGltZTtcblxuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIHdoaWxlICh0aW1lIDw9IGN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQpIHtcbiAgICAgIHRoaXMuX19jdXJyZW50VGltZSA9IHRpbWU7XG4gICAgICB0aW1lID0gdGhpcy5hZHZhbmNlVGltZSh0aW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgcmVzZXRUaW1lKHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKSB7XG4gICAgICB0aGlzLm1hc3Rlci5yZXNldCh0aGlzLCB0aW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGlmICh0aGlzLl9fbmV4dFRpbWUgPT09IEluZmluaXR5KVxuICAgICAgICAgIGxvZygnU2NoZWR1bGVyIFN0YXJ0Jyk7XG5cbiAgICAgICAgY29uc3QgdGltZU91dERlbGF5ID0gTWF0aC5tYXgoKHRpbWUgLSB0aGlzLmxvb2thaGVhZCAtIHRoaXMuZ2V0VGltZUZ1bmN0aW9uKCkpLCB0aGlzLnBlcmlvZCk7XG5cbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgICB9LCBNYXRoLmNlaWwodGltZU91dERlbGF5ICogMTAwMCkpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fbmV4dFRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIGxvZygnU2NoZWR1bGVyIFN0b3AnKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVyIGN1cnJlbnQgbG9naWNhbCB0aW1lLlxuICAgKlxuICAgKiBAbmFtZSBjdXJyZW50VGltZVxuICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgU2NoZWR1bGVyXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcblxuICAgIHJldHVybiB0aGlzLl9fY3VycmVudFRpbWUgfHwgdGhpcy5nZXRUaW1lRnVuY3Rpb24oKSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLy8gaW5oZXJpdGVkIGZyb20gc2NoZWR1bGluZyBxdWV1ZVxuICAvKipcbiAgICogQWRkIGEgVGltZUVuZ2luZSBvciBhIHNpbXBsZSBjYWxsYmFjayBmdW5jdGlvbiB0byB0aGUgc2NoZWR1bGVyIGF0IGFuXG4gICAqIG9wdGlvbmFsbHkgZ2l2ZW4gdGltZS4gV2hldGhlciB0aGUgYWRkIG1ldGhvZCBpcyBjYWxsZWQgd2l0aCBhIFRpbWVFbmdpbmVcbiAgICogb3IgYSBjYWxsYmFjayBmdW5jdGlvbiBpdCByZXR1cm5zIGEgVGltZUVuZ2luZSB0aGF0IGNhbiBiZSB1c2VkIGFzIGFyZ3VtZW50XG4gICAqIG9mIHRoZSBtZXRob2RzIHJlbW92ZSBhbmQgcmVzZXRFbmdpbmVUaW1lLiBBIFRpbWVFbmdpbmUgYWRkZWQgdG8gYSBzY2hlZHVsZXJcbiAgICogaGFzIHRvIGltcGxlbWVudCB0aGUgc2NoZWR1bGVkIGludGVyZmFjZS4gVGhlIGNhbGxiYWNrIGZ1bmN0aW9uIGFkZGVkIHRvIGFcbiAgICogc2NoZWR1bGVyIHdpbGwgYmUgY2FsbGVkIGF0IHRoZSBnaXZlbiB0aW1lIGFuZCB3aXRoIHRoZSBnaXZlbiB0aW1lIGFzXG4gICAqIGFyZ3VtZW50LiBUaGUgY2FsbGJhY2sgY2FuIHJldHVybiBhIG5ldyBzY2hlZHVsaW5nIHRpbWUgKGkuZS4gdGhlIG5leHRcbiAgICogdGltZSB3aGVuIGl0IHdpbGwgYmUgY2FsbGVkKSBvciBpdCBjYW4gcmV0dXJuIEluZmluaXR5IHRvIHN1c3BlbmQgc2NoZWR1bGluZ1xuICAgKiB3aXRob3V0IHJlbW92aW5nIHRoZSBmdW5jdGlvbiBmcm9tIHRoZSBzY2hlZHVsZXIuIEEgZnVuY3Rpb24gdGhhdCBkb2VzXG4gICAqIG5vdCByZXR1cm4gYSB2YWx1ZSAob3IgcmV0dXJucyBudWxsIG9yIDApIGlzIHJlbW92ZWQgZnJvbSB0aGUgc2NoZWR1bGVyXG4gICAqIGFuZCBjYW5ub3QgYmUgdXNlZCBhcyBhcmd1bWVudCBvZiB0aGUgbWV0aG9kcyByZW1vdmUgYW5kIHJlc2V0RW5naW5lVGltZVxuICAgKiBhbnltb3JlLlxuICAgKlxuICAgKiBAbmFtZSBhZGRcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7VGltZUVuZ2luZXxGdW5jdGlvbn0gZW5naW5lIC0gRW5naW5lIHRvIGFkZCB0byB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIC8qKlxuICAgKiBSZW1vdmUgYSBUaW1lRW5naW5lIGZyb20gdGhlIHNjaGVkdWxlciB0aGF0IGhhcyBiZWVuIGFkZGVkIHRvIHRoZVxuICAgKiBzY2hlZHVsZXIgdXNpbmcgdGhlIGFkZCBtZXRob2QuXG4gICAqXG4gICAqIEBuYW1lIGFkZFxuICAgKiBAZnVuY3Rpb25cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gcmVtb3ZlIGZyb20gdGhlIHNjaGVkdWxlclxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RpbWU9dGhpcy5jdXJyZW50VGltZV0gLSBTY2hlZHVsZSB0aW1lXG4gICAqL1xuICAvKipcbiAgICogUmVzY2hlZHVsZSBhIHNjaGVkdWxlZCB0aW1lIGVuZ2luZSBhdCBhIGdpdmVuIHRpbWUuXG4gICAqXG4gICAqIEBuYW1lIHJlc2V0RW5naW5lVGltZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gcmVzY2hlZHVsZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHNjaGVkdWxlZCBjYWxsYmFja3MgYW5kIGVuZ2luZXMgZnJvbSB0aGUgc2NoZWR1bGVyLlxuICAgKlxuICAgKiBAbmFtZSBjbGVhclxuICAgKiBAZnVuY3Rpb25cbiAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgKiBAaW5zdGFuY2VcbiAgICovXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNjaGVkdWxlcjtcbiIsImltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL1RpbWVFbmdpbmUnO1xuXG5jb25zdCBsb2cgPSBkZWJ1Zygnd2F2ZXNqczptYXN0ZXJzJyk7XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oZnVuY3Rpb25Ub0NoZWNrKSB7XG4gIHJldHVybiBmdW5jdGlvblRvQ2hlY2sgJiYge30udG9TdHJpbmcuY2FsbChmdW5jdGlvblRvQ2hlY2spID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufVxuXG4vKipcbiAqXG4gKlxuICpcbiAqIFRoZSBTaW1wbGVTY2hlZHVsZXIgY2xhc3MgaW1wbGVtZW50cyBhIHNpbXBsaWZpZWQgbWFzdGVyIGZvciB0aW1lIGVuZ2luZXNcbiAqIChzZWUgVGltZUVuZ2luZSkgdGhhdCBpbXBsZW1lbnQgdGhlIHNjaGVkdWxlZCBpbnRlcmZhY2VcbiAqIHN1Y2ggYXMgdGhlIE1ldHJvbm9tZSBhbmQgdGhlIEdyYW51bGFyRW5naW5lLiBUaGUgQVBJIGFuZCBmdW50aW9uYWxpdGllcyBvZlxuICogdGhlIFNpbXBsZVNjaGVkdWxlciBjbGFzcyBhcmUgaWRlbnRpY2FsIHRvIHRoZSBTY2hlZHVsZXIgY2xhc3MuIEJ1dCwgb3RoZXJcbiAqIHRoYW4gdGhlIFNjaGVkdWxlciwgdGhlIFNpbXBsZVNjaGVkdWxlciBjbGFzcyBkb2VzIG5vdCBndWFyYW50ZWUgdGhlIG9yZGVyXG4gKiBvZiBldmVudHMgKGkuZS4gY2FsbHMgdG8gdGhlIGFkdmFuY2VUaW1lIG1ldGhvZCBvZiBzY2hlZHVsZWQgdGltZSBlbmdpbmVzXG4gKiBhbmQgdG8gc2NoZWR1bGVkIGNhbGxiYWNrIGZ1bmN0aW9ucykgd2l0aGluIGEgc2NoZWR1bGluZyBwZXJpb2QgKHNlZSBwZXJpb2RcbiAqIGF0dHJpYnV0ZSkuXG4gKlxuICoge0BsaW5rIGh0dHBzOi8vcmF3Z2l0LmNvbS93YXZlc2pzL3dhdmVzLW1hc3RlcnMvbWFzdGVyL2V4YW1wbGVzL3NjaGVkdWxlcn1cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXRUaW1lRnVuY3Rpb24gLSBGdW5jdGlvbiB0aGF0IG11c3QgcmV0dXJuIGEgdGltZSBpbiBzZWNvbmQuXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIC0gZGVmYXVsdCBvcHRpb25zXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMucGVyaW9kPTAuMDI1XSAtIHBlcmlvZCBvZiB0aGUgc2NoZWR1bGVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmxvb2thaGVhZD0wLjFdIC0gbG9va2FoZWFkIG9mIHRoZSBzY2hlZHVsZXIuXG4gKlxuICogQHNlZSBUaW1lRW5naW5lXG4gKiBAc2VlIFNjaGVkdWxlclxuICpcbiAqIEBleGFtcGxlXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0ICogYXMgbWFzdGVycyBmcm9tICd3YXZlcy1tYXN0ZXJzJztcbiAqXG4gKiBjb25zdCBnZXRUaW1lRnVuY3Rpb24gPSAoKSA9PiBwcmVmb3JtYW5jZS5ub3coKSAvIDEwMDA7XG4gKiBjb25zdCBzY2hlZHVsZXIgPSBuZXcgbWFzdGVycy5TaW1wbGVTY2hlZHVsZXIoZ2V0VGltZUZ1bmN0aW9uKTtcbiAqXG4gKiBzY2hlZHVsZXIuYWRkKG15RW5naW5lKTtcbiAqL1xuY2xhc3MgU2ltcGxlU2NoZWR1bGVyIHtcbiAgY29uc3RydWN0b3IoZ2V0VGltZUZ1bmN0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24oZ2V0VGltZUZ1bmN0aW9uKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudCBgZ2V0VGltZUZ1bmN0aW9uYCcpO1xuXG4gICAgdGhpcy5nZXRUaW1lRnVuY3Rpb24gPSBnZXRUaW1lRnVuY3Rpb247XG5cbiAgICB0aGlzLl9fZW5naW5lcyA9IG5ldyBTZXQoKTtcblxuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcyA9IFtdO1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgcGVyaW9kXG4gICAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICogQG5hbWUgbG9va2FoZWFkXG4gICAgICogQG1lbWJlcm9mIFNjaGVkdWxlclxuICAgICAqIEBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgMC4xO1xuICB9XG5cbiAgX19zY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpIHtcbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnB1c2goZW5naW5lKTtcbiAgICB0aGlzLl9fc2NoZWRUaW1lcy5wdXNoKHRpbWUpO1xuICB9XG5cbiAgX19yZXNjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzW2luZGV4XSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgICB9XG4gIH1cblxuICBfX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLl9fc2NoZWRFbmdpbmVzLmluZGV4T2YoZW5naW5lKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9fc2NoZWRUaW1lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIF9fcmVzZXRUaWNrKCkge1xuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmICghdGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgbG9nKCdTaW1wbGVTY2hlZHVsZXIgU3RhcnQnKTtcbiAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX190aW1lb3V0KSB7XG4gICAgICBsb2coJ1NpbXBsZVNjaGVkdWxlciBTdG9wJyk7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fdGljaygpIHtcbiAgICBjb25zdCBjdXJyZW50VGltZSA9IHRoaXMuZ2V0VGltZUZ1bmN0aW9uKCk7XG4gICAgbGV0IGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgZW5naW5lID0gdGhpcy5fX3NjaGVkRW5naW5lc1tpXTtcbiAgICAgIGxldCB0aW1lID0gdGhpcy5fX3NjaGVkVGltZXNbaV07XG5cbiAgICAgIHdoaWxlICh0aW1lICYmIHRpbWUgPD0gY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZCkge1xuICAgICAgICB0aW1lID0gTWF0aC5tYXgodGltZSwgY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgICB0aW1lID0gZW5naW5lLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAmJiB0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaSsrXSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBlbmdpbmUgZnJvbSBzY2hlZHVsZXJcbiAgICAgICAgaWYgKCF0aW1lKSB7XG4gICAgICAgICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9LCB0aGlzLnBlcmlvZCAqIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY2hlZHVsZXIgY3VycmVudCBsb2dpY2FsIHRpbWUuXG4gICAqXG4gICAqIEBuYW1lIGN1cnJlbnRUaW1lXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBTY2hlZHVsZXJcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmdldFRpbWVGdW5jdGlvbigpICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIC8qKlxuICAgKiBEZWZlciB0aGUgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW4gLSBGdW5jdGlvbiB0byBkZWZlclxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RpbWU9dGhpcy5jdXJyZW50VGltZV0gLSBTY2hlZHVsZSB0aW1lXG4gICAqL1xuICBkZWZlcihmdW4sIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCEoZnVuIGluc3RhbmNlb2YgRnVuY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBkZWZlcmVkIGJ5IHNjaGVkdWxlclwiKTtcblxuICAgIHRoaXMuYWRkKHtcbiAgICAgIGFkdmFuY2VUaW1lOiBmdW5jdGlvbih0aW1lKSB7IGZ1bih0aW1lKTsgfSwgLy8gbWFrZSBzdXIgdGhhdCB0aGUgYWR2YW5jZVRpbWUgbWV0aG9kIGRvZXMgbm90IHJldHVybSBhbnl0aGluZ1xuICAgIH0sIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIFRpbWVFbmdpbmUgZnVuY3Rpb24gdG8gdGhlIHNjaGVkdWxlciBhdCBhbiBvcHRpb25hbGx5IGdpdmVuIHRpbWUuXG4gICAqXG4gICAqIEBwYXJhbSB7VGltZUVuZ2luZX0gZW5naW5lIC0gRW5naW5lIHRvIGFkZCB0byB0aGUgc2NoZWR1bGVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbdGltZT10aGlzLmN1cnJlbnRUaW1lXSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCFUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIC8vIHNldCBtYXN0ZXIgYW5kIGFkZCB0byBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmVzLmFkZChlbmdpbmUpO1xuXG4gICAgLy8gc2NoZWR1bGUgZW5naW5lXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIFRpbWVFbmdpbmUgZnJvbSB0aGUgc2NoZWR1bGVyIHRoYXQgaGFzIGJlZW4gYWRkZWQgdG8gdGhlXG4gICAqIHNjaGVkdWxlciB1c2luZyB0aGUgYWRkIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gcmVtb3ZlIGZyb20gdGhlIHNjaGVkdWxlclxuICAgKiBAcGFyYW0ge051bWJlcn0gW3RpbWU9dGhpcy5jdXJyZW50VGltZV0gLSBTY2hlZHVsZSB0aW1lXG4gICAqL1xuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKCFlbmdpbmUubWFzdGVyIHx8IGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJlbmdpbmUgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgLy8gcmVzZXQgbWFzdGVyIGFuZCByZW1vdmUgZnJvbSBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuXG4gICAgLy8gdW5zY2hlZHVsZSBlbmdpbmVcbiAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNjaGVkdWxlIGEgc2NoZWR1bGVkIHRpbWUgZW5naW5lIGF0IGEgZ2l2ZW4gdGltZS5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSBlbmdpbmUgLSBFbmdpbmUgdG8gcmVzY2hlZHVsZVxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSAtIFNjaGVkdWxlIHRpbWVcbiAgICovXG4gIHJlc2V0RW5naW5lVGltZShlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgdGhpcy5fX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGVuZ2luZSBpcyBzY2hlZHVsZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7VGltZUVuZ2luZX0gZW5naW5lIC0gRW5naW5lIHRvIGNoZWNrXG4gICAqL1xuICBoYXMoZW5naW5lKSB7XG4gICAgcmV0dXJuIHRoaXMuX19lbmdpbmVzLmhhcyhlbmdpbmUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgZW5naW5lcyBmcm9tIHRoZSBzY2hlZHVsZXIuXG4gICAqL1xuICBjbGVhcigpIHtcbiAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2ltcGxlU2NoZWR1bGVyO1xuIiwiaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vY29yZS9Qcmlvcml0eVF1ZXVlJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vY29yZS9TY2hlZHVsaW5nUXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS9UaW1lRW5naW5lJztcblxuXG5mdW5jdGlvbiBhZGREdXBsZXQoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCwgc2Vjb25kRWxlbWVudCkge1xuICBmaXJzdEFycmF5LnB1c2goZmlyc3RFbGVtZW50KTtcbiAgc2Vjb25kQXJyYXkucHVzaChzZWNvbmRFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHVwbGV0KGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBmaXJzdEVsZW1lbnQpIHtcbiAgY29uc3QgaW5kZXggPSBmaXJzdEFycmF5LmluZGV4T2YoZmlyc3RFbGVtZW50KTtcblxuICBpZiAoaW5kZXggPj0gMCkge1xuICAgIGNvbnN0IHNlY29uZEVsZW1lbnQgPSBzZWNvbmRBcnJheVtpbmRleF07XG5cbiAgICBmaXJzdEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgc2Vjb25kQXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHJldHVybiBzZWNvbmRFbGVtZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFRoZSBUcmFuc3BvcnRlZCBjYWxsIGlzIHRoZSBiYXNlIGNsYXNzIG9mIHRoZSBhZGFwdGVycyBiZXR3ZWVuXG4vLyBkaWZmZXJlbnQgdHlwZXMgb2YgZW5naW5lcyAoaS5lLiB0cmFuc3BvcnRlZCwgc2NoZWR1bGVkLCBwbGF5LWNvbnRyb2xsZWQpXG4vLyBUaGUgYWRhcHRlcnMgYXJlIGF0IHRoZSBzYW1lIHRpbWUgbWFzdGVycyBmb3IgdGhlIGVuZ2luZXMgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuLy8gYW5kIHRyYW5zcG9ydGVkIFRpbWVFbmdpbmVzIGluc2VydGVkIGludG8gdGhlIHRyYW5zcG9ydCdzIHBvc2l0aW9uLWJhc2VkIHByaXRvcml0eSBxdWV1ZS5cbmNsYXNzIFRyYW5zcG9ydGVkIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydCwgZHVyYXRpb24sIG9mZnNldCwgc3RyZXRjaCA9IDEpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWFzdGVyID0gdHJhbnNwb3J0O1xuXG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcblxuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnQ7XG4gICAgdGhpcy5fX2VuZFBvc2l0aW9uID0gIWlzRmluaXRlKGR1cmF0aW9uKSA/IEluZmluaXR5IDogc3RhcnQgKyBkdXJhdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBzdGFydCArIG9mZnNldDtcbiAgICB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uID0gc3RyZXRjaDtcbiAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBzZXRCb3VuZGFyaWVzKHN0YXJ0LCBkdXJhdGlvbiwgb2Zmc2V0ID0gMCwgc3RyZXRjaCA9IDEpIHtcbiAgICB0aGlzLl9fc3RhcnRQb3NpdGlvbiA9IHN0YXJ0O1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9IHN0YXJ0ICsgZHVyYXRpb247XG4gICAgdGhpcy5fX29mZnNldFBvc2l0aW9uID0gc3RhcnQgKyBvZmZzZXQ7XG4gICAgdGhpcy5fX3N0cmV0Y2hQb3NpdGlvbiA9IHN0cmV0Y2g7XG4gICAgdGhpcy5yZXNldFBvc2l0aW9uKCk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHt9XG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHt9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHBvc2l0aW9uICs9IHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcblxuICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGlmIChwb3NpdGlvbiA8IHRoaXMuX19zdGFydFBvc2l0aW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19pc1J1bm5pbmcpXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zaXRpb24gPiB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuX19pc1J1bm5pbmcpIC8vIGlmIGVuZ2luZSBpcyBydW5uaW5nXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID4gdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX19pc1J1bm5pbmcpIC8vIGlmIGVuZ2luZSBpcyBydW5uaW5nXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX2lzUnVubmluZyA9IGZhbHNlO1xuICAgIHJldHVybiBJbmZpbml0eSAqIHNwZWVkO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICghdGhpcy5fX2lzUnVubmluZykge1xuICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgdGhpcy5fX2lzUnVubmluZyA9IHRydWU7XG5cbiAgICAgIGlmIChzcGVlZCA+IDApXG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG5cbiAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvLyBzdG9wIGVuZ2luZVxuICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3RlciA9IG51bGw7XG5cbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZFxuLy8gaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IE1hdGgubWF4KHBvc2l0aW9uLCB0aGlzLl9fc3RhcnRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1pbihwb3NpdGlvbiwgdGhpcy5fX2VuZFBvc2l0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gKyB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHBvc2l0aW9uID0gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24gfHwgc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIEluZmluaXR5ICogc3BlZWQ7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKVxuICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24oZW5naW5lLCBwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcG9zaXRpb24gKz0gdGhpcy5fX29mZnNldFBvc2l0aW9uO1xuXG4gICAgdGhpcy5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZFxuLy8gaGFzIHRvIHN0YXJ0IGFuZCBzdG9wIHRoZSBzcGVlZC1jb250cm9sbGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHRydWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBwb3NpdGlvbikge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2lzUnVubmluZylcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lLCB0aGlzLm1hc3Rlci5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIDApO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNjaGVkdWxlZFxuLy8gaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTY2hlZHVsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcblxuICAgIC8vIHNjaGVkdWxpbmcgcXVldWUgYmVjb21lcyBtYXN0ZXIgb2YgZW5naW5lXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGluZ1F1ZXVlLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlc2V0RW5naW5lVGltZSh0aGlzLl9fZW5naW5lLCB0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIHRyYW5zbGF0ZXMgYWR2YW5jZVBvc2l0aW9uIG9mICp0cmFuc3BvcnRlZCogZW5naW5lcyBpbnRvIGdsb2JhbCBzY2hlZHVsZXIgdGltZXNcbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIGNvbnN0IHRyYW5zcG9ydCA9IHRoaXMuX190cmFuc3BvcnQ7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIGNvbnN0IHNwZWVkID0gdHJhbnNwb3J0Ll9fc3BlZWQ7XG4gICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdHJhbnNwb3J0LmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIGNvbnN0IG5leHRUaW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gbmV4dFRpbWU7XG5cbiAgICByZXR1cm4gbmV4dFRpbWU7XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdGhpcy5fX25leHRQb3NpdGlvbikge1xuICAgIGNvbnN0IHRyYW5zcG9ydCA9IHRoaXMuX190cmFuc3BvcnQ7XG4gICAgY29uc3QgdGltZSA9IHRyYW5zcG9ydC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuXG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX190cmFuc3BvcnQuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnQgPSBudWxsO1xuICB9XG59XG5cbi8vIGludGVybmFsIHNjaGVkdWxpbmcgcXVldWUgdGhhdCByZXR1cm5zIHRoZSBjdXJyZW50IHBvc2l0aW9uIChhbmQgdGltZSkgb2YgdGhlIHBsYXkgY29udHJvbFxuY2xhc3MgVHJhbnNwb3J0U2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRQb3NpdGlvbjtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm92aWRlcyBwb3NpdGlvbi1iYXNlZCBzY2hlZHVsaW5nIG9mIFRpbWVFbmdpbmUgaW5zdGFuY2VzLlxuICpcbiAqIFtleGFtcGxlXXtAbGluayBodHRwczovL3Jhd2dpdC5jb20vd2F2ZXNqcy93YXZlcy1tYXN0ZXJzL21hc3Rlci9leGFtcGxlcy90cmFuc3BvcnR9XG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCAqIGFzIG1hc3RlcnMgZnJvbSAnd2F2ZXMtbWFzdGVycyc7XG4gKlxuICogY29uc3QgZ2V0VGltZUZ1bmN0aW9uID0gKCkgPT4ge1xuICogICBjb25zdCBub3cgPSBwcm9jZXNzLmhydGltZSgpO1xuICogICByZXR1cm4gbm93WzBdICsgbm93WzFdICogMWUtOTtcbiAqIH1cbiAqIGNvbnN0IHNjaGVkdWxlciA9IG5ldyBtYXN0ZXJzLlNjaGVkdWxlcihnZXRUaW1lRnVuY3Rpb24pO1xuICogY29uc3QgdHJhbnNwb3J0ID0gbmV3IG1hc3RlcnMuVHJhbnNwb3J0KHNjaGVkdWxlcik7XG4gKiBjb25zdCBwbGF5Q29udHJvbCA9IG5ldyBtYXN0ZXJzLlBsYXlDb250cm9sKHNjaGVkdWxlciwgdHJhbnNwb3J0KTtcbiAqIGNvbnN0IG15RW5naW5lID0gbmV3IE15RW5naW5lKCk7XG4gKiBjb25zdCB5b3VyRW5naW5lID0gbmV3IHlvdXJFbmdpbmUoKTtcbiAqXG4gKiB0cmFuc3BvcnQuYWRkKG15RW5naW5lKTtcbiAqIHRyYW5zcG9ydC5hZGQoeW91ckVuZ2luZSk7XG4gKlxuICogcGxheUNvbnRyb2wuc3RhcnQoKTtcbiAqL1xuY2xhc3MgVHJhbnNwb3J0IGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHNjaGVkdWxlciwgb3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGlmICghc2NoZWR1bGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50IGBzY2hlZHVsZXJgLCBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgYFNjaGVkdWxlcmAnKTtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkID0gW107XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVyID0gc2NoZWR1bGVyO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxlckhvb2sodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUgPSBuZXcgVHJhbnNwb3J0U2NoZWR1bGluZ1F1ZXVlKHRoaXMpO1xuXG4gICAgLy8gc3luY3Jvbml6ZWQgdGltZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG4gIH1cblxuICBfX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuX19zcGVlZCA9PT0gMClcbiAgICAgIHJldHVybiArSW5maW5pdHk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHRoaXMuX190aW1lICsgKHBvc2l0aW9uIC0gdGhpcy5fX3Bvc2l0aW9uKSAvIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgY29uc3QgbnVtVHJhbnNwb3J0ZWRFbmdpbmVzID0gdGhpcy5fX3RyYW5zcG9ydGVkLmxlbmd0aDtcbiAgICBsZXQgbmV4dFBvc2l0aW9uID0gSW5maW5pdHkgKiBzcGVlZDtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5jbGVhcigpO1xuICAgICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUucmV2ZXJzZSA9IChzcGVlZCA8IDApO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVRyYW5zcG9ydGVkRW5naW5lczsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24pO1xuICAgICAgfVxuXG4gICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS50aW1lO1xuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGZvciAobGV0IHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lLiBUaGlzIGdldHRlciB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydFxuICAgKiBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgY3VycmVudFRpbWVcbiAgICogQG1lbWJlcm9mIFRyYW5zcG9ydFxuICAgKiBAaW5zdGFuY2VcbiAgICogQHJlYWRvbmx5XG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uLiBUaGlzIGdldHRlciB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydFxuICAgKiBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICogQG5hbWUgY3VycmVudFBvc2l0aW9uXG4gICAqIEBtZW1iZXJvZiBUcmFuc3BvcnRcbiAgICogQGluc3RhbmNlXG4gICAqIEByZWFkb25seVxuICAgKi9cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgLSB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgdHJhbnNwb3J0ZWQgdGltZSBlbmdpbmUgaW50ZXJmYWNlLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZVxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkXG4gICAqL1xuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgcmV0dXJuIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudGF0aW9uIG9mIHRoZSB0cmFuc3BvcnRlZCB0aW1lIGVuZ2luZSBpbnRlcmZhY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gc3BlZWRcbiAgICovXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBjb25zdCBlbmdpbmUgPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5oZWFkO1xuICAgIGNvbnN0IG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSW1wbGVtZW50YXRpb24gb2YgdGhlIHRyYW5zcG9ydGVkIHRpbWUgZW5naW5lIGludGVyZmFjZS5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzcGVlZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtzZWVrPWZhbHNlXVxuICAgKi9cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgY29uc3QgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICBsZXQgbmV4dFBvc2l0aW9uO1xuXG4gICAgICAvLyByZXN5bmMgdHJhbnNwb3J0ZWQgZW5naW5lc1xuICAgICAgaWYgKHNlZWsgfHwgc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAgIC8vIHNlZWsgb3IgcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdGFydFxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoYW5nZSBzcGVlZCB3aXRob3V0IHJldmVyc2luZyBkaXJlY3Rpb25cbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZW5naW5lIC0gZW5naW5lIHRvIGJlIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIC0gc3RhcnQgcG9zaXRpb25cbiAgICovXG4gIGFkZChlbmdpbmUsIHN0YXJ0UG9zaXRpb24gPSAwLCBlbmRQb3NpdGlvbiA9IEluZmluaXR5LCBvZmZzZXRQb3NpdGlvbiA9IDApIHtcbiAgICBsZXQgdHJhbnNwb3J0ZWQgPSBudWxsO1xuXG4gICAgaWYgKG9mZnNldFBvc2l0aW9uID09PSAtSW5maW5pdHkpXG4gICAgICBvZmZzZXRQb3NpdGlvbiA9IDA7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU2NoZWR1bGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIGEgdHJhbnNwb3J0XCIpO1xuXG4gICAgaWYgKHRyYW5zcG9ydGVkKSB7XG4gICAgICBjb25zdCBzcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgICAgYWRkRHVwbGV0KHRoaXMuX19lbmdpbmVzLCB0aGlzLl9fdHJhbnNwb3J0ZWQsIGVuZ2luZSwgdHJhbnNwb3J0ZWQpO1xuXG4gICAgICBpZiAoc3BlZWQgIT09IDApIHtcbiAgICAgICAgLy8gc3luYyBhbmQgc3RhcnRcbiAgICAgICAgY29uc3QgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIGNvbnN0IG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydCh0cmFuc3BvcnRlZCwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgdHJhbnNwb3J0LlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gZW5naW5lT3JUcmFuc3BvcnRlZCAtIGVuZ2luZSBvciB0cmFuc3BvcnRlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZU9yVHJhbnNwb3J0ZWQpIHtcbiAgICBsZXQgZW5naW5lID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICBsZXQgdHJhbnNwb3J0ZWQgPSByZW1vdmVEdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG5cbiAgICBpZiAoIXRyYW5zcG9ydGVkKSB7XG4gICAgICBlbmdpbmUgPSByZW1vdmVEdXBsZXQodGhpcy5fX3RyYW5zcG9ydGVkLCB0aGlzLl9fZW5naW5lcywgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG4gICAgICB0cmFuc3BvcnRlZCA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZSAmJiB0cmFuc3BvcnRlZCkge1xuICAgICAgY29uc3QgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUucmVtb3ZlKHRyYW5zcG9ydGVkKTtcblxuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHRyYW5zcG9ydFwiKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgcG9zaXRpb24gb2YgdGhlIGdpdmVuIGVuZ2luZS5cbiAgICpcbiAgICogQHBhcmFtIHtUaW1lRW5naW5lfSB0cmFuc3BvcnRlZCAtIEVuZ2luZSB0byByZXNldFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gLSBOZXcgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0RW5naW5lUG9zaXRpb24odHJhbnNwb3J0ZWQsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IDApIHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBwb3NpdGlvbiA9IHRyYW5zcG9ydGVkLnN5bmNQb3NpdGlvbih0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLmN1cnJlbnRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICBjb25zdCBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5tb3ZlKHRyYW5zcG9ydGVkLCBwb3NpdGlvbik7XG4gICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCB0aW1lIGVuZ2luZXMgZnJvbSB0aGUgdHJhbnNwb3J0LlxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zeW5jU3BlZWQodGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIDApO1xuXG4gICAgZm9yIChsZXQgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRyYW5zcG9ydDtcbiIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc2V0XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwicmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvcicpO1xuIiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnNldCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcuc2V0LnRvLWpzb24nKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnNldC5vZicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcuc2V0LmZyb20nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlNldDtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGdldCA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvcmUnKS5nZXRJdGVyYXRvciA9IGZ1bmN0aW9uIChpdCkge1xuICB2YXIgaXRlckZuID0gZ2V0KGl0KTtcbiAgaWYgKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJykgdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIHJldHVybiBhbk9iamVjdChpdGVyRm4uY2FsbChpdCkpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXN0cm9uZycpO1xudmFyIHZhbGlkYXRlID0gcmVxdWlyZSgnLi9fdmFsaWRhdGUtY29sbGVjdGlvbicpO1xudmFyIFNFVCA9ICdTZXQnO1xuXG4vLyAyMy4yIFNldCBPYmplY3RzXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24nKShTRVQsIGZ1bmN0aW9uIChnZXQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIFNldCgpIHsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSkge1xuICAgIHJldHVybiBzdHJvbmcuZGVmKHZhbGlkYXRlKHRoaXMsIFNFVCksIHZhbHVlID0gdmFsdWUgPT09IDAgPyAwIDogdmFsdWUsIHZhbHVlKTtcbiAgfVxufSwgc3Ryb25nKTtcbiIsIi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vcHJvcG9zYWwtc2V0bWFwLW9mZnJvbS8jc2VjLXNldC5mcm9tXG5yZXF1aXJlKCcuL19zZXQtY29sbGVjdGlvbi1mcm9tJykoJ1NldCcpO1xuIiwiLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9wcm9wb3NhbC1zZXRtYXAtb2Zmcm9tLyNzZWMtc2V0Lm9mXG5yZXF1aXJlKCcuL19zZXQtY29sbGVjdGlvbi1vZicpKCdTZXQnKTtcbiIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5SLCAnU2V0JywgeyB0b0pTT046IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24tdG8tanNvbicpKCdTZXQnKSB9KTtcbiIsIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJ2xpZ2h0c2VhZ3JlZW4nLFxuICAnZm9yZXN0Z3JlZW4nLFxuICAnZ29sZGVucm9kJyxcbiAgJ2RvZGdlcmJsdWUnLFxuICAnZGFya29yY2hpZCcsXG4gICdjcmltc29uJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcbiAgLy8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2VcbiAgLy8gZXhwbGljaXRseVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaXMgd2Via2l0PyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNjQ1OTYwNi8zNzY3NzNcbiAgLy8gZG9jdW1lbnQgaXMgdW5kZWZpbmVkIGluIHJlYWN0LW5hdGl2ZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0LW5hdGl2ZS9wdWxsLzE2MzJcbiAgcmV0dXJuICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLldlYmtpdEFwcGVhcmFuY2UpIHx8XG4gICAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuY29uc29sZSAmJiAod2luZG93LmNvbnNvbGUuZmlyZWJ1ZyB8fCAod2luZG93LmNvbnNvbGUuZXhjZXB0aW9uICYmIHdpbmRvdy5jb25zb2xlLnRhYmxlKSkpIHx8XG4gICAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLykgJiYgcGFyc2VJbnQoUmVnRXhwLiQxLCAxMCkgPj0gMzEpIHx8XG4gICAgLy8gZG91YmxlIGNoZWNrIHdlYmtpdCBpbiB1c2VyQWdlbnQganVzdCBpbiBjYXNlIHdlIGFyZSBpbiBhIHdvcmtlclxuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvYXBwbGV3ZWJraXRcXC8oXFxkKykvKSk7XG59XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odikge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuICdbVW5leHBlY3RlZEpTT05QYXJzZUVycm9yXTogJyArIGVyci5tZXNzYWdlO1xuICB9XG59O1xuXG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG4gIHZhciB1c2VDb2xvcnMgPSB0aGlzLnVzZUNvbG9ycztcblxuICBhcmdzWzBdID0gKHVzZUNvbG9ycyA/ICclYycgOiAnJylcbiAgICArIHRoaXMubmFtZXNwYWNlXG4gICAgKyAodXNlQ29sb3JzID8gJyAlYycgOiAnICcpXG4gICAgKyBhcmdzWzBdXG4gICAgKyAodXNlQ29sb3JzID8gJyVjICcgOiAnICcpXG4gICAgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cbiAgaWYgKCF1c2VDb2xvcnMpIHJldHVybjtcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3Muc3BsaWNlKDEsIDAsIGMsICdjb2xvcjogaW5oZXJpdCcpXG5cbiAgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RDID0gMDtcbiAgYXJnc1swXS5yZXBsYWNlKC8lW2EtekEtWiVdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgaWYgKCclJScgPT09IG1hdGNoKSByZXR1cm47XG4gICAgaW5kZXgrKztcbiAgICBpZiAoJyVjJyA9PT0gbWF0Y2gpIHtcbiAgICAgIC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuICAgICAgLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbiAgICAgIGxhc3RDID0gaW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG59XG5cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9hZCgpIHtcbiAgdmFyIHI7XG4gIHRyeSB7XG4gICAgciA9IGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZztcbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8vIElmIGRlYnVnIGlzbid0IHNldCBpbiBMUywgYW5kIHdlJ3JlIGluIEVsZWN0cm9uLCB0cnkgdG8gbG9hZCAkREVCVUdcbiAgaWYgKCFyICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAnZW52JyBpbiBwcm9jZXNzKSB7XG4gICAgciA9IHByb2Nlc3MuZW52LkRFQlVHO1xuICB9XG5cbiAgcmV0dXJuIHI7XG59XG5cbi8qKlxuICogRW5hYmxlIG5hbWVzcGFjZXMgbGlzdGVkIGluIGBsb2NhbFN0b3JhZ2UuZGVidWdgIGluaXRpYWxseS5cbiAqL1xuXG5leHBvcnRzLmVuYWJsZShsb2FkKCkpO1xuXG4vKipcbiAqIExvY2Fsc3RvcmFnZSBhdHRlbXB0cyB0byByZXR1cm4gdGhlIGxvY2Fsc3RvcmFnZS5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNhZmFyaSB0aHJvd3NcbiAqIHdoZW4gYSB1c2VyIGRpc2FibGVzIGNvb2tpZXMvbG9jYWxzdG9yYWdlXG4gKiBhbmQgeW91IGF0dGVtcHQgdG8gYWNjZXNzIGl0LlxuICpcbiAqIEByZXR1cm4ge0xvY2FsU3RvcmFnZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZTtcbiAgfSBjYXRjaCAoZSkge31cbn1cbiIsIlxuLyoqXG4gKiBUaGlzIGlzIHRoZSBjb21tb24gbG9naWMgZm9yIGJvdGggdGhlIE5vZGUuanMgYW5kIHdlYiBicm93c2VyXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVEZWJ1Zy5kZWJ1ZyA9IGNyZWF0ZURlYnVnWydkZWZhdWx0J10gPSBjcmVhdGVEZWJ1ZztcbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZXhwb3J0cy5kaXNhYmxlID0gZGlzYWJsZTtcbmV4cG9ydHMuZW5hYmxlID0gZW5hYmxlO1xuZXhwb3J0cy5lbmFibGVkID0gZW5hYmxlZDtcbmV4cG9ydHMuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuICovXG5cbmV4cG9ydHMubmFtZXMgPSBbXTtcbmV4cG9ydHMuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBNYXAgb2Ygc3BlY2lhbCBcIiVuXCIgaGFuZGxpbmcgZnVuY3Rpb25zLCBmb3IgdGhlIGRlYnVnIFwiZm9ybWF0XCIgYXJndW1lbnQuXG4gKlxuICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXIgb3IgdXBwZXItY2FzZSBsZXR0ZXIsIGkuZS4gXCJuXCIgYW5kIFwiTlwiLlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycyA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzIGxvZyB0aW1lc3RhbXAuXG4gKi9cblxudmFyIHByZXZUaW1lO1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VsZWN0Q29sb3IobmFtZXNwYWNlKSB7XG4gIHZhciBoYXNoID0gMCwgaTtcblxuICBmb3IgKGkgaW4gbmFtZXNwYWNlKSB7XG4gICAgaGFzaCAgPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIG5hbWVzcGFjZS5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gIH1cblxuICByZXR1cm4gZXhwb3J0cy5jb2xvcnNbTWF0aC5hYnMoaGFzaCkgJSBleHBvcnRzLmNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lc3BhY2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1ZyhuYW1lc3BhY2UpIHtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcblxuICAvLyBlbnYtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gbG9naWMgZm9yIGRlYnVnIGluc3RhbmNlc1xuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGV4cG9ydHMuaW5pdCkge1xuICAgIGV4cG9ydHMuaW5pdChkZWJ1Zyk7XG4gIH1cblxuICByZXR1cm4gZGVidWc7XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgZXhwb3J0cy5uYW1lcyA9IFtdO1xuICBleHBvcnRzLnNraXBzID0gW107XG5cbiAgdmFyIHNwbGl0ID0gKHR5cGVvZiBuYW1lc3BhY2VzID09PSAnc3RyaW5nJyA/IG5hbWVzcGFjZXMgOiAnJykuc3BsaXQoL1tcXHMsXSsvKTtcbiAgdmFyIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwO1xudmFyIG0gPSBzICogNjA7XG52YXIgaCA9IG0gKiA2MDtcbnZhciBkID0gaCAqIDI0O1xudmFyIHkgPSBkICogMzY1LjI1O1xuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgPyBmbXRMb25nKHZhbCkgOiBmbXRTaG9ydCh2YWwpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICtcbiAgICAgIEpTT04uc3RyaW5naWZ5KHZhbClcbiAgKTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhcbiAgICBzdHJcbiAgKTtcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHk7XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZDtcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGg7XG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtO1xuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogcztcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG47XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCc7XG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnO1xuICB9XG4gIGlmIChtcyA+PSBtKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJztcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncyc7XG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJztcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpIHx8XG4gICAgcGx1cmFsKG1zLCBoLCAnaG91cicpIHx8XG4gICAgcGx1cmFsKG1zLCBtLCAnbWludXRlJykgfHxcbiAgICBwbHVyYWwobXMsIHMsICdzZWNvbmQnKSB8fFxuICAgIG1zICsgJyBtcyc7XG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lO1xuICB9XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7XG59XG4iXX0=
