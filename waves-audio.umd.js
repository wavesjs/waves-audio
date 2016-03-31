(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.wavesAudio = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// exposes a single instance
var audioContext = null;

var AudioContext = window.AudioContext || window.webkitAudioContext;

if (AudioContext) {
  audioContext = new AudioContext();

  if (/(iPhone|iPad)/i.test(navigator.userAgent) && audioContext.sampleRate < 44100) {
    var buffer = audioContext.createBuffer(1, 1, 44100);
    var dummy = audioContext.createBufferSource();
    dummy.buffer = buffer;
    dummy.connect(audioContext.destination);
    dummy.start(0);
    dummy.disconnect();
  }
}

exports.default = audioContext;

},{}],2:[function(require,module,exports){
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

var _timeEngine = require('./time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _audioContext = require('./audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class AudioTimeEngine
 */

var AudioTimeEngine = function (_TimeEngine) {
  (0, _inherits3.default)(AudioTimeEngine, _TimeEngine);

  function AudioTimeEngine() {
    var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _audioContext2.default : arguments[0];
    (0, _classCallCheck3.default)(this, AudioTimeEngine);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AudioTimeEngine).call(this));

    _this.audioContext = audioContext;
    _this.outputNode = null;
    return _this;
  }

  (0, _createClass3.default)(AudioTimeEngine, [{
    key: 'connect',
    value: function connect(target) {
      this.outputNode.connect(target);
      return this;
    }
  }, {
    key: 'disconnect',
    value: function disconnect(connection) {
      this.outputNode.disconnect(connection);
      return this;
    }
  }]);
  return AudioTimeEngine;
}(_timeEngine2.default);

exports.default = AudioTimeEngine;

},{"./audio-context":1,"./time-engine":3,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],3:[function(require,module,exports){
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
 * @class TimeEngine
 */

var TimeEngine = function () {
  function TimeEngine() {
    (0, _classCallCheck3.default)(this, TimeEngine);

    this.master = null;
    this.outputNode = null;
  }

  (0, _createClass3.default)(TimeEngine, [{
    key: "implementsScheduled",


    /**
     * Scheduled interface
     *   - advanceTime(time), called to generate next event at given time, returns next time
     */
    value: function implementsScheduled() {
      return this.advanceTime && this.advanceTime instanceof Function;
    }
  }, {
    key: "resetTime",
    value: function resetTime() {
      var time = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

      if (this.master) this.master.resetEngineTime(this, time);
    }

    /**
     * Transported interface
     *   - syncPosition(time, position, speed), called to reposition TimeEngine, returns next position
     *   - advancePosition(time, position, speed), called to generate next event at given time and position, returns next position
     */

  }, {
    key: "implementsTransported",
    value: function implementsTransported() {
      return this.syncPosition && this.syncPosition instanceof Function && this.advancePosition && this.advancePosition instanceof Function;
    }
  }, {
    key: "resetPosition",
    value: function resetPosition() {
      var position = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

      if (this.master) this.master.resetEnginePosition(this, position);
    }

    /**
     * Speed-controlled interface
     *   - syncSpeed(time, position, speed, ), called to
     */

  }, {
    key: "implementsSpeedControlled",
    value: function implementsSpeedControlled() {
      return this.syncSpeed && this.syncSpeed instanceof Function;
    }
  }, {
    key: "currentTime",
    get: function get() {
      if (this.master) return this.master.currentTime;

      return undefined;
    }
  }, {
    key: "currentPosition",
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }
  }]);
  return TimeEngine;
}();

exports.default = TimeEngine;

},{"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27}],4:[function(require,module,exports){
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
 * @class GranularEngine
 */

var GranularEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(GranularEngine, _AudioTimeEngine);

  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" interface.
   * The grain position (grain onset or center time in the audio buffer) is optionally
   * determined by the engine's currentPosition attribute.
   */

  function GranularEngine() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, GranularEngine);


    /**
     * Audio buffer
     * @type {AudioBuffer}
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(GranularEngine).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute grain period in sec
     * @type {Number}
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0.01);

    /**
     * Grain period relative to absolute duration
     * @type {Number}
     */
    _this.periodRel = optOrDef(options.periodRel, 0);

    /**
     * Amout of random grain period variation relative to grain period
     * @type {Number}
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Grain position (onset time in audio buffer) in sec
     * @type {Number}
     */
    _this.position = optOrDef(options.position, 0);

    /**
     * Amout of random grain position variation in sec
     * @type {Number}
     */
    _this.positionVar = optOrDef(options.positionVar, 0.003);

    /**
     * Absolute grain duration in sec
     * @type {Number}
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0.1); // absolute grain duration

    /**
     * Grain duration relative to grain period (overlap)
     * @type {Number}
     */
    _this.durationRel = optOrDef(options.durationRel, 0);

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0);

    /**
     * Attack time relative to grain duration
     * @type {Number}
     */
    _this.attackRel = optOrDef(options.attackRel, 0.5);

    /**
     * Shape of attack
     * @type {String} 'lin' for linear ramp, 'exp' for exponential
     */
    _this.attackShape = optOrDef(options.attackShape, 'lin');

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0);

    /**
     * Release time relative to grain duration
     * @type {Number}
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0.5);

    /**
     * Shape of release
     * @type {String} 'lin' for linear ramp, 'exp' for exponential
     */
    _this.releaseShape = optOrDef(options.releaseShape, 'lin');

    /**
     * Offset (start/end value) for exponential attack/release
     * @type {Number} offset
     */
    _this.expRampOffset = optOrDef(options.expRampOffset, 0.0001);

    /**
     * Grain resampling in cent
     * @type {Number}
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @type {Number}
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Whether the grain position refers to the center of the grain (or the beginning)
     * @type {Bool}
     */
    _this.centered = optOrDef(options.centered, true);

    /**
     * Whether the audio buffer and grain position are considered as cyclic
     * @type {Bool}
     */
    _this.cyclic = optOrDef(options.cyclic, false);

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @type {Number}
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   * @return {Number} current buffer duration
   */


  (0, _createClass3.default)(GranularEngine, [{
    key: 'advanceTime',


    // TimeEngine method (scheduled interface)
    value: function advanceTime(time) {
      time = Math.max(time, this.audioContext.currentTime);
      return time + this.trigger(time);
    }

    /**
     * Trigger a grain
     * @param {Number} time grain synthesis audio time
     * @return {Number} period to next grain
     *
     * This function can be called at any time (whether the engine is scheduled or not)
     * to generate a single grain according to the current grain parameters.
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

      return grainPeriod;
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

    // TimeEngine attribute

  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return this.position;
    }
  }]);
  return GranularEngine;
}(_audioTimeEngine2.default);

exports.default = GranularEngine;

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],5:[function(require,module,exports){
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

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],6:[function(require,module,exports){
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

var PlayerEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(PlayerEngine, _AudioTimeEngine);

  function PlayerEngine() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, PlayerEngine);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayerEngine).call(this, options.audioContext));

    _this.transport = null; // set when added to transporter

    /**
     * Audio buffer
     * @type {AudioBuffer}
     */
    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Fade time for chaining segments (e.g. in start, stop, and seek)
     * @type {AudioBuffer}
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
      var seek = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

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
     * @param {Bool} cyclic whether the audio buffer is considered as cyclic
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
    }

    /**
     * Get whether the audio buffer is considered as cyclic
     * @return {Bool} whether the audio buffer is considered as cyclic
     */
    ,
    get: function get() {
      return this.__cyclic;
    }

    /**
     * Set gain
     * @param {Number} value linear gain factor
     */

  }, {
    key: 'gain',
    set: function set(value) {
      var time = this.currentTime;
      this.__gainNode.cancelScheduledValues(time);
      this.__gainNode.setValueAtTime(this.__gainNode.gain.value, time);
      this.__gainNode.linearRampToValueAtTime(0, time + this.fadeTime);
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
     * Get buffer duration
     * @return {Number} current buffer duration
     */

  }, {
    key: 'bufferDuration',
    get: function get() {
      if (this.buffer) return this.buffer.duration;

      return 0;
    }
  }]);
  return PlayerEngine;
}(_audioTimeEngine2.default);

exports.default = PlayerEngine;

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],7:[function(require,module,exports){
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

function getCurrentOrPreviousIndex(sortedArray, value) {
  var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

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
  var index = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  var size = sortedArray.length;

  if (size > 0) {
    var firstVal = sortedArray[0];
    var lastVal = sortedArray[size - 1];

    if (value <= firstVal) index = 0;else if (value >= lastVal) index = size;else {
      if (index < 0 || index >= size) index = Math.floor((size - 1) * (value - firstVal) / (lastVal - firstVal));

      while (sortedArray[index] < value) {
        index++;
      }while (sortedArray[index + 1] >= value) {
        index--;
      }
    }
  }

  return index;
}

/**
 * @class SegmentEngine
 */

var SegmentEngine = function (_AudioTimeEngine) {
  (0, _inherits3.default)(SegmentEngine, _AudioTimeEngine);

  /**
   * @constructor
   * @param {AudioBuffer} buffer initial audio buffer for granular synthesis
   *
   * The engine implements the "scheduled" and "transported" interfaces.
   * When "scheduled", the engine  generates segments more or less periodically
   * (controlled by the periodAbs, periodRel, and perioVar attributes).
   * When "transported", the engine generates segments at the position of their onset time.
   */

  function SegmentEngine() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, SegmentEngine);


    /**
     * Audio buffer
     * @type {AudioBuffer}
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SegmentEngine).call(this, options.audioContext));

    _this.buffer = optOrDef(options.buffer, null);

    /**
     * Absolute segment period in sec
     * @type {Number}
     */
    _this.periodAbs = optOrDef(options.periodAbs, 0);

    /**
     * Segment period relative to inter-segment distance
     * @type {Number}
     */
    _this.periodRel = optOrDef(options.periodRel, 1);

    /**
     * Amout of random segment period variation relative to segment period
     * @type {Number}
     */
    _this.periodVar = optOrDef(options.periodVar, 0);

    /**
     * Array of segment positions (onset times in audio buffer) in sec
     * @type {Number}
     */
    _this.positionArray = optOrDef(options.positionArray, [0.0]);

    /**
     * Amout of random segment position variation in sec
     * @type {Number}
     */
    _this.positionVar = optOrDef(options.positionVar, 0);

    /**
     * Array of segment durations in sec
     * @type {Number}
     */
    _this.durationArray = optOrDef(options.durationArray, [0.0]);

    /**
     * Absolute segment duration in sec
     * @type {Number}
     */
    _this.durationAbs = optOrDef(options.durationAbs, 0);

    /**
     * Segment duration relative to given segment duration or inter-segment distance
     * @type {Number}
     */
    _this.durationRel = optOrDef(options.durationRel, 1);

    /**
     * Array of segment offsets in sec
     * @type {Number}
     *
     * offset > 0: the segment's reference position is after the given segment position
     * offset < 0: the given segment position is the segment's reference position and the duration has to be corrected by the offset
     */
    _this.offsetArray = optOrDef(options.offsetArray, [0.0]);

    /**
     * Absolute segment offset in sec
     * @type {Number}
     */
    _this.offsetAbs = optOrDef(options.offsetAbs, -0.005);

    /**
     * Segment offset relative to segment duration
     * @type {Number}
     */
    _this.offsetRel = optOrDef(options.offsetRel, 0);

    /**
     * Time by which all segments are delayed (especially to realize segment offsets)
     * @type {Number}
     */
    _this.delay = optOrDef(options.delay, 0.005);

    /**
     * Absolute attack time in sec
     * @type {Number}
     */
    _this.attackAbs = optOrDef(options.attackAbs, 0.005);

    /**
     * Attack time relative to segment duration
     * @type {Number}
     */
    _this.attackRel = optOrDef(options.attackRel, 0);

    /**
     * Absolute release time in sec
     * @type {Number}
     */
    _this.releaseAbs = optOrDef(options.releaseAbs, 0.005);

    /**
     * Release time relative to segment duration
     * @type {Number}
     */
    _this.releaseRel = optOrDef(options.releaseRel, 0);

    /**
     * Segment resampling in cent
     * @type {Number}
     */
    _this.resampling = optOrDef(options.resampling, 0);

    /**
     * Amout of random resampling variation in cent
     * @type {Number}
     */
    _this.resamplingVar = optOrDef(options.resamplingVar, 0);

    /**
     * Linear gain factor
     * @type {Number}
     */
    _this.gain = optOrDef(options.gain, 1);

    /**
     * Index of the segment to synthesize (i.e. of this.positionArray/durationArray/offsetArray)
     * @type {Number}
     */
    _this.segmentIndex = optOrDef(options.segmentIndex, 0);

    /**
     * Whether the audio buffer and segment indices are considered as cyclic
     * @type {Bool}
     */
    _this.cyclic = optOrDef(options.cyclic, false);
    _this.__cyclicOffset = 0;

    /**
     * Portion at the end of the audio buffer that has been copied from the beginning to assure cyclic behavior
     * @type {Number}
     */
    _this.wrapAroundExtension = optOrDef(options.wrapAroundExtension, 0);

    _this.outputNode = _this.audioContext.createGain();
    return _this;
  }

  /**
   * Get buffer duration (excluding wrapAroundExtension)
   * @return {Number} current buffer duration
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
     * Trigger a segment
     * @param {Number} time segment synthesis audio time
     * @return {Number} period to next segment
     *
     * This function can be called at any time (whether the engine is scheduled/transported or not)
     * to generate a single segment according to the current segment parameters.
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
          var nextSegementIndex = segmentIndex + 1;
          var nextPosition, nextOffset;

          if (nextSegementIndex === this.positionArray.length) {
            if (this.cyclic) {
              nextPosition = this.positionArray[0] + bufferDuration;
              nextOffset = this.offsetArray[0];
            } else {
              nextPosition = bufferDuration;
              nextOffset = 0;
            }
          } else {
            nextPosition = this.positionArray[nextSegementIndex];
            nextOffset = this.offsetArray[nextSegementIndex];
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
          segmentDuration += segmentPosition;
          segmentPosition = 0;
        }

        if (segmentPosition + segmentDuration > this.buffer.duration) segmentDuration = this.buffer.duration - segmentPosition;

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

          envelope.gain.setValueAtTime(0.0, segmentTime);
          envelope.gain.linearRampToValueAtTime(this.gain, attackEndTime);

          if (releaseStartTime > attackEndTime) envelope.gain.setValueAtTime(this.gain, releaseStartTime);

          envelope.gain.linearRampToValueAtTime(0.0, segmentEndTime);
          envelope.connect(this.outputNode);

          // make source
          var source = audioContext.createBufferSource();

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;
          source.connect(envelope);

          source.start(segmentTime, segmentPosition);
          source.stop(segmentTime + segmentDuration / resamplingRate);
        }
      }

      return segmentPeriod;
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
}(_audioTimeEngine2.default);

exports.default = SegmentEngine;

},{"../core/audio-time-engine":2,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioContext = require('./core/audio-context');

Object.defineProperty(exports, 'audioContext', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_audioContext).default;
  }
});

var _timeEngine = require('./core/time-engine');

Object.defineProperty(exports, 'TimeEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_timeEngine).default;
  }
});

var _audioTimeEngine = require('./core/audio-time-engine');

Object.defineProperty(exports, 'AudioTimeEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_audioTimeEngine).default;
  }
});

var _granularEngine = require('./engines/granular-engine');

Object.defineProperty(exports, 'GranularEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_granularEngine).default;
  }
});

var _metronome = require('./engines/metronome');

Object.defineProperty(exports, 'Metronome', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_metronome).default;
  }
});

var _playerEngine = require('./engines/player-engine');

Object.defineProperty(exports, 'PlayerEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_playerEngine).default;
  }
});

var _segmentEngine = require('./engines/segment-engine');

Object.defineProperty(exports, 'SegmentEngine', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_segmentEngine).default;
  }
});

var _playControl = require('./masters/play-control');

Object.defineProperty(exports, 'PlayControl', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_playControl).default;
  }
});

var _transport = require('./masters/transport');

Object.defineProperty(exports, 'Transport', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_transport).default;
  }
});

var _scheduler = require('./masters/scheduler');

Object.defineProperty(exports, 'Scheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_scheduler).default;
  }
});

var _simpleScheduler = require('./masters/simple-scheduler');

Object.defineProperty(exports, 'SimpleScheduler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_simpleScheduler).default;
  }
});

var _priorityQueue = require('./utils/priority-queue');

Object.defineProperty(exports, 'PriorityQueue', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_priorityQueue).default;
  }
});

var _schedulingQueue = require('./utils/scheduling-queue');

Object.defineProperty(exports, 'SchedulingQueue', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_schedulingQueue).default;
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

},{"./core/audio-context":1,"./core/audio-time-engine":2,"./core/time-engine":3,"./engines/granular-engine":4,"./engines/metronome":5,"./engines/player-engine":6,"./engines/segment-engine":7,"./masters/factories":9,"./masters/play-control":10,"./masters/scheduler":11,"./masters/simple-scheduler":12,"./masters/transport":13,"./utils/priority-queue":14,"./utils/scheduling-queue":15}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSimpleScheduler = exports.getScheduler = undefined;

var _weakMap = require('babel-runtime/core-js/weak-map');

var _weakMap2 = _interopRequireDefault(_weakMap);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _simpleScheduler = require('./simple-scheduler');

var _simpleScheduler2 = _interopRequireDefault(_simpleScheduler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schedulerMap = new _weakMap2.default(); // schedulers should be singletons

var simpleSchedulerMap = new _weakMap2.default();

// scheduler factory
var getScheduler = exports.getScheduler = function getScheduler() {
  var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _audioContext2.default : arguments[0];

  var scheduler = schedulerMap.get(audioContext);

  if (!scheduler) {
    scheduler = new _scheduler2.default({ audioContext: audioContext });
    schedulerMap.set(audioContext, scheduler);
  }

  return scheduler;
};

var getSimpleScheduler = exports.getSimpleScheduler = function getSimpleScheduler() {
  var audioContext = arguments.length <= 0 || arguments[0] === undefined ? _audioContext2.default : arguments[0];

  var simpleScheduler = simpleSchedulerMap.get(audioContext);

  if (!simpleScheduler) {
    simpleScheduler = new _simpleScheduler2.default({ audioContext: audioContext });
    simpleSchedulerMap.set(audioContext, simpleScheduler);
  }

  return simpleScheduler;
};

},{"../core/audio-context":1,"./scheduler":11,"./simple-scheduler":12,"babel-runtime/core-js/weak-map":25}],10:[function(require,module,exports){
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

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _schedulingQueue = require('../utils/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _factories = require('./factories');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LoopControl = function (_TimeEngine) {
  (0, _inherits3.default)(LoopControl, _TimeEngine);

  function LoopControl(playControl) {
    (0, _classCallCheck3.default)(this, LoopControl);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LoopControl).call(this));

    _this.__playControl = playControl;
    _this.lower = -Infinity;
    _this.upper = Infinity;
    return _this;
  }

  // TimeEngine method (scheduled interface)


  (0, _createClass3.default)(LoopControl, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var playControl = this.__playControl;
      var speed = playControl.speed;
      var lower = this.lower;
      var upper = this.upper;

      if (speed > 0) {
        playControl.syncSpeed(time, lower, speed, true);
        return playControl.__getTimeAtPosition(upper);
      } else if (speed < 0) {
        playControl.syncSpeed(time, upper, speed, true);
        return playControl.__getTimeAtPosition(lower);
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

      if (speed > 0) this.resetTime(playControl.__getTimeAtPosition(upper - 1e-6));else if (speed < 0) this.resetTime(playControl.__getTimeAtPosition(lower + 1e-6));else this.resetTime(Infinity);
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
}(_timeEngine2.default);

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
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledSpeedControlled).call(this, playControl, engine));
  }

  return PlayControlledSpeedControlled;
}(PlayControlled);

// play control for engines implmenting the *transported* interface


var PlayControlledTransported = function (_PlayControlled2) {
  (0, _inherits3.default)(PlayControlledTransported, _PlayControlled2);

  function PlayControlledTransported(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledTransported);

    var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledTransported).call(this, playControl, engine));

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
      var position = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

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

      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayControlledTransported.prototype), 'destroy', this).call(this);
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

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledScheduled).call(this, playControl, engine));

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
      (0, _get3.default)((0, _getPrototypeOf2.default)(PlayControlledScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return PlayControlledScheduled;
}(PlayControlled);

// translates transported engine advancePosition into global scheduler times


var PlayControlledSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(PlayControlledSchedulerHook, _TimeEngine2);

  function PlayControlledSchedulerHook(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledSchedulerHook).call(this));

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

      while (nextTime <= time) {
        nextPosition = engine.advancePosition(time, position, playControl.__speed);
        nextTime = playControl.__getTimeAtPosition(nextPosition);
      }

      this.__nextPosition = nextPosition;
      return nextTime;
    }
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length <= 0 || arguments[0] === undefined ? this.__nextPosition : arguments[0];

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
}(_timeEngine2.default);

// internal scheduling queue that returns the current position (and time) of the play control


var PlayControlledSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(PlayControlledSchedulingQueue, _SchedulingQueue);

  function PlayControlledSchedulingQueue(playControl, engine) {
    (0, _classCallCheck3.default)(this, PlayControlledSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControlledSchedulingQueue).call(this));

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
}(_schedulingQueue2.default);

// play control meta-class


var PlayControl = function (_TimeEngine3) {
  (0, _inherits3.default)(PlayControl, _TimeEngine3);

  function PlayControl(engine) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    (0, _classCallCheck3.default)(this, PlayControl);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(PlayControl).call(this));

    _this7.audioContext = options.audioContext || _audioContext2.default;
    _this7.__scheduler = (0, _factories.getScheduler)(_this7.audioContext);

    _this7.__playControlled = null;

    _this7.__loopControl = null;
    _this7.__loopStart = 0;
    _this7.__loopEnd = Infinity;

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

      if (engine.implementsSpeedControlled()) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (engine.implementsTransported()) this.__playControlled = new PlayControlledTransported(this, engine);else if (engine.implementsScheduled()) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
    }
  }, {
    key: '__resetEngine',
    value: function __resetEngine() {
      this.__playControlled.destroy();
      this.__playControlled = null;
    }

    /**
     * Calculate/extrapolate playing time for given position
     * @param {Number} position position
     * @return {Number} extrapolated time
     */

  }, {
    key: '__getTimeAtPosition',
    value: function __getTimeAtPosition(position) {
      return this.__time + (position - this.__position) / this.__speed;
    }

    /**
     * Calculate/extrapolate playing position for given time
     * @param {Number} time time
     * @return {Number} extrapolated position
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
     * Get current master time
     * @return {Number} current time
     *
     * This function will be replaced when the play-control is added to a master.
     */

  }, {
    key: 'set',
    value: function set() {
      var engine = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

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
  }, {
    key: 'setLoopBoundaries',
    value: function setLoopBoundaries(loopStart, loopEnd) {
      this.__loopStart = loopStart;
      this.__loopEnd = loopEnd;

      this.loop = this.loop;
    }
  }, {
    key: 'syncSpeed',


    // TimeEngine method (speed-controlled interface)
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

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
     * Start playing
     */

  }, {
    key: 'start',
    value: function start() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, this.__playingSpeed);
    }

    /**
     * Pause playing
     */

  }, {
    key: 'pause',
    value: function pause() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
    }

    /**
     * Stop playing
     */

  }, {
    key: 'stop',
    value: function stop() {
      var time = this.__sync();
      this.syncSpeed(time, this.__position, 0);
      this.seek(0);
    }

    /**
     * Set playing speed
     * @param {Number} speed playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)
     */

  }, {
    key: 'seek',


    /**
     * Set (jump to) playing position
     * @param {Number} position target position
     */
    value: function seek(position) {
      if (position !== this.__position) {
        var time = this.__sync();
        this.__position = position;
        this.syncSpeed(time, position, this.__speed, true);
      }
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return this.__scheduler.currentTime;
    }

    /**
     * Get current master position
     * @return {Number} current playing position
     *
     * This function will be replaced when the play-control is added to a master.
     */

  }, {
    key: 'currentPosition',
    get: function get() {
      return this.__position + (this.__scheduler.currentTime - this.__time) * this.__speed;
    }
  }, {
    key: 'loop',
    set: function set(enable) {
      if (enable && this.__loopStart > -Infinity && this.__loopEnd < Infinity) {
        if (!this.__loopControl) {
          this.__loopControl = new LoopControl(this);
          this.__scheduler.add(this.__loopControl, Infinity);
        }

        if (this.__speed !== 0) this.__loopControl.reschedule(this.__speed);
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

      if (this.__speed !== 0) this.syncSpeed(time, this.__position, speed);
    }

    /**
     * Get playing speed
     * @return current playing speed
     */
    ,
    get: function get() {
      return this.__playingSpeed;
    }
  }]);
  return PlayControl;
}(_timeEngine2.default);

exports.default = PlayControl;

},{"../core/audio-context":1,"../core/time-engine":3,"../utils/scheduling-queue":15,"./factories":9,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],11:[function(require,module,exports){
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

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _priorityQueue = require('../utils/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _schedulingQueue = require('../utils/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Scheduler = function (_SchedulingQueue) {
  (0, _inherits3.default)(Scheduler, _SchedulingQueue);

  function Scheduler() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Scheduler);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Scheduler).call(this));

    _this.audioContext = options.audioContext || _audioContext2.default;

    _this.__currentTime = null;
    _this.__nextTime = Infinity;
    _this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    _this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
     */
    _this.lookahead = options.lookahead || 0.1;
    return _this;
  }

  // setTimeout scheduling loop


  (0, _createClass3.default)(Scheduler, [{
    key: '__tick',
    value: function __tick() {
      var audioContext = this.audioContext;
      var time = this.__nextTime;

      this.__timeout = null;

      while (time <= audioContext.currentTime + this.lookahead) {
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

      var time = arguments.length <= 0 || arguments[0] === undefined ? this.currentTime : arguments[0];

      if (this.master) {
        this.master.reset(this, time);
      } else {
        if (this.__timeout) {
          clearTimeout(this.__timeout);
          this.__timeout = null;
        }

        if (time !== Infinity) {
          if (this.__nextTime === Infinity) console.log("Scheduler Start");

          var timeOutDelay = Math.max(time - this.lookahead - this.audioContext.currentTime, this.period);

          this.__timeout = setTimeout(function () {
            _this2.__tick();
          }, timeOutDelay * 1000);
        } else if (this.__nextTime !== Infinity) {
          console.log("Scheduler Stop");
        }

        this.__nextTime = time;
      }
    }
  }, {
    key: 'currentTime',
    get: function get() {
      if (this.master) return this.master.currentTime;

      return this.__currentTime || this.audioContext.currentTime + this.lookahead;
    }
  }, {
    key: 'currentPosition',
    get: function get() {
      var master = this.master;

      if (master && master.currentPosition !== undefined) return master.currentPosition;

      return undefined;
    }
  }]);
  return Scheduler;
}(_schedulingQueue2.default);

exports.default = Scheduler;

},{"../core/audio-context":1,"../core/time-engine":3,"../utils/priority-queue":14,"../utils/scheduling-queue":15,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],12:[function(require,module,exports){
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

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SimpleScheduler = function () {
  function SimpleScheduler() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, SimpleScheduler);

    this.audioContext = options.audioContext || _audioContext2.default;

    this.__engines = new _set2.default();

    this.__schedEngines = [];
    this.__schedTimes = [];

    this.__currentTime = null;
    this.__timeout = null;

    /**
     * scheduler (setTimeout) period
     * @type {Number}
     */
    this.period = options.period || 0.025;

    /**
     * scheduler lookahead time (> period)
     * @type {Number}
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
          console.log("SimpleScheduler Start");
          this.__tick();
        }
      } else if (this.__timeout) {
        console.log("SimpleScheduler Stop");
        clearTimeout(this.__timeout);
        this.__timeout = null;
      }
    }
  }, {
    key: '__tick',
    value: function __tick() {
      var _this = this;

      var audioContext = this.audioContext;
      var i = 0;

      while (i < this.__schedEngines.length) {
        var engine = this.__schedEngines[i];
        var time = this.__schedTimes[i];

        while (time && time <= audioContext.currentTime + this.lookahead) {
          time = Math.max(time, audioContext.currentTime);
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
  }, {
    key: 'defer',


    // call a function at a given time
    value: function defer(fun) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime() {
          fun();
        } }, // make sur that the advanceTime method does not returm anything
      time);
    }

    // add a time engine to the queue and return the engine

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];
      var getCurrentPosition = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      if (!engine.implementsScheduled()) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      // set master and add to array
      engine.master = this;
      this.__engines.add(engine);

      // schedule engine
      this.__scheduleEngine(engine, time);
      this.__resetTick();

      return engine;
    }
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
  }, {
    key: 'resetEngineTime',
    value: function resetEngineTime(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      this.__rescheduleEngine(engine, time);
      this.__resetTick();
    }

    // check whether a given engine is scheduled

  }, {
    key: 'has',
    value: function has(engine) {
      return this.__engines.has(engine);
    }
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
      return this.__currentTime || this.audioContext.currentTime + this.lookahead;
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

},{"../core/audio-context":1,"../core/time-engine":3,"babel-runtime/core-js/set":22,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27}],13:[function(require,module,exports){
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

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _priorityQueue = require('../utils/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _schedulingQueue = require('../utils/scheduling-queue');

var _schedulingQueue2 = _interopRequireDefault(_schedulingQueue);

var _factories = require('./factories');

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
    var stretch = arguments.length <= 5 || arguments[5] === undefined ? 1 : arguments[5];
    (0, _classCallCheck3.default)(this, Transported);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Transported).call(this));

    _this.master = transport;

    _this.__engine = engine;
    engine.master = _this;

    _this.__startPosition = start;
    _this.__endPosition = !isFinite(duration) ? Infinity : start + duration;
    _this.__offsetPosition = start + offset;
    _this.__stretchPosition = stretch;
    _this.__haltPosition = Infinity; // engine's next halt position when not running (is null when engine hes been started)
    // console.log(this.__startPosition, this.__endPosition, this.__offsetPosition, this.__stretchPosition)
    return _this;
  }

  (0, _createClass3.default)(Transported, [{
    key: 'setBoundaries',
    value: function setBoundaries(start, duration) {
      var offset = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
      var stretch = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

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

          if (this.__haltPosition === null) this.stop(time, position - this.__offsetPosition);

          this.__haltPosition = this.__endPosition;

          return this.__startPosition;
        } else if (position <= this.__endPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__haltPosition = null; // engine is active

          return this.__endPosition;
        }
      } else {
        if (position >= this.__endPosition) {
          if (this.__haltPosition === null) this.stop(time, position - this.__offsetPosition);

          this.__haltPosition = this.__startPosition;

          return this.__endPosition;
        } else if (position > this.__startPosition) {
          this.start(time, position - this.__offsetPosition, speed);

          this.__haltPosition = null; // engine is active

          return this.__startPosition;
        }
      }

      if (this.__haltPosition === null) this.stop(time, position);

      this.__haltPosition = Infinity;

      return Infinity;
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      var haltPosition = this.__haltPosition;

      if (haltPosition !== null) {
        this.start(time, position - this.__offsetPosition, speed);

        this.__haltPosition = null;

        return haltPosition;
      }

      // stop engine
      if (this.__haltPosition === null) this.stop(time, position - this.__offsetPosition);

      this.__haltPosition = Infinity;

      return Infinity;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (speed === 0) this.stop(time, position - this.__offsetPosition);
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
}(_timeEngine2.default);

// TransportedTransported
// has to switch on and off the scheduled engines when the transport hits the engine's start and end position


var TransportedTransported = function (_Transported) {
  (0, _inherits3.default)(TransportedTransported, _Transported);

  function TransportedTransported(transport, engine, startPosition, endPosition, offsetPosition) {
    (0, _classCallCheck3.default)(this, TransportedTransported);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportedTransported).call(this, transport, engine, startPosition, endPosition, offsetPosition));
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

      return Infinity;
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      if (this.__engine.syncSpeed) this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(engine) {
      var position = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

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
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportedSpeedControlled).call(this, transport, engine, startPosition, endPosition, offsetPosition));
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
      if (this.__haltPosition === null) // engine is active
        this.__engine.syncSpeed(time, position, speed);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.__engine.syncSpeed(this.master.currentTime, this.master.currentPosition - this.__offsetPosition, 0);
      (0, _get3.default)((0, _getPrototypeOf2.default)(TransportedSpeedControlled.prototype), 'destroy', this).call(this);
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

    var _this4 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportedScheduled).call(this, transport, engine, startPosition, endPosition, offsetPosition));

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
      (0, _get3.default)((0, _getPrototypeOf2.default)(TransportedScheduled.prototype), 'destroy', this).call(this);
    }
  }]);
  return TransportedScheduled;
}(Transported);

// translates advancePosition of *transported* engines into global scheduler times


var TransportSchedulerHook = function (_TimeEngine2) {
  (0, _inherits3.default)(TransportSchedulerHook, _TimeEngine2);

  function TransportSchedulerHook(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulerHook);

    var _this5 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportSchedulerHook).call(this));

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

      while (nextTime <= time) {
        nextPosition = transport.advancePosition(nextTime, nextPosition, speed);
        nextTime = transport.__getTimeAtPosition(nextPosition);
      }

      this.__nextPosition = nextPosition;
      this.__nextTime = nextTime;
      return nextTime;
    }
  }, {
    key: 'resetPosition',
    value: function resetPosition() {
      var position = arguments.length <= 0 || arguments[0] === undefined ? this.__nextPosition : arguments[0];

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
}(_timeEngine2.default);

// internal scheduling queue that returns the current position (and time) of the play control


var TransportSchedulingQueue = function (_SchedulingQueue) {
  (0, _inherits3.default)(TransportSchedulingQueue, _SchedulingQueue);

  function TransportSchedulingQueue(transport) {
    (0, _classCallCheck3.default)(this, TransportSchedulingQueue);

    var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(TransportSchedulingQueue).call(this));

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
}(_schedulingQueue2.default);

/**
 * Transport class
 */


var Transport = function (_TimeEngine3) {
  (0, _inherits3.default)(Transport, _TimeEngine3);

  function Transport() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, Transport);

    var _this7 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Transport).call(this));

    _this7.audioContext = options.audioContext || _audioContext2.default;

    _this7.__engines = [];
    _this7.__transported = [];

    _this7.__scheduler = (0, _factories.getScheduler)(_this7.audioContext);
    _this7.__schedulerHook = new TransportSchedulerHook(_this7);
    _this7.__transportedQueue = new _priorityQueue2.default();
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
      return this.__time + (position - this.__position) / this.__speed;
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
      var nextPosition = Infinity;

      if (numTransportedEngines > 0) {
        var engine, nextEnginePosition;

        this.__transportedQueue.clear();
        this.__transportedQueue.reverse = speed < 0;

        for (var i = numTransportedEngines - 1; i > 0; i--) {
          engine = this.__transported[i];
          nextEnginePosition = engine.syncPosition(time, position, speed);
          this.__transportedQueue.insert(engine, nextEnginePosition, false); // insert but don't sort
        }

        engine = this.__transported[0];
        nextEnginePosition = engine.syncPosition(time, position, speed);
        nextPosition = this.__transportedQueue.insert(engine, nextEnginePosition, true); // insert and sort
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
     * Get current master time
     * @return {Number} current time
     *
     * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
     */

  }, {
    key: 'resetPosition',


    /**
     * Reset next transport position
     * @param {Number} next transport position
     */
    value: function resetPosition(position) {
      var master = this.master;

      if (master && master.resetEnginePosition !== undefined) master.resetEnginePosition(this, position);else this.__schedulerHook.resetPosition(position);
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'syncPosition',
    value: function syncPosition(time, position, speed) {
      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      return this.__syncTransportedPosition(time, position, speed);
    }

    // TimeEngine method (transported interface)

  }, {
    key: 'advancePosition',
    value: function advancePosition(time, position, speed) {
      // console.log(time, position, speed);
      var nextPosition = this.__transportedQueue.time;

      while (nextPosition === position) {
        var engine = this.__transportedQueue.head;
        var nextEnginePosition = engine.advancePosition(time, position, speed);

        if ((speed > 0 && nextEnginePosition > position || speed < 0 && nextEnginePosition < position) && nextEnginePosition < Infinity && nextEnginePosition > -Infinity) {
          nextPosition = this.__transportedQueue.move(engine, nextEnginePosition);
        } else {
          nextPosition = this.__transportedQueue.remove(engine);
        }
      }

      return nextPosition;
    }

    // TimeEngine method (speed-controlled interface)

  }, {
    key: 'syncSpeed',
    value: function syncSpeed(time, position, speed) {
      var seek = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      var lastSpeed = this.__speed;

      this.__time = time;
      this.__position = position;
      this.__speed = speed;

      if (speed !== lastSpeed || seek && speed !== 0) {
        var nextPosition;

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
     * Add a time engine to the transport
     * @param {Object} engine engine to be added to the transport
     * @param {Number} position start position
     */

  }, {
    key: 'add',
    value: function add(engine) {
      var startPosition = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
      var endPosition = arguments.length <= 2 || arguments[2] === undefined ? Infinity : arguments[2];
      var offsetPosition = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

      var transported = null;

      if (offsetPosition === -Infinity) offsetPosition = 0;

      if (engine.master) throw new Error("object has already been added to a master");

      if (engine.implementsTransported()) transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);else if (engine.implementsSpeedControlled()) transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);else if (engine.implementsScheduled()) transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);else throw new Error("object cannot be added to a transport");

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
     * Remove a time engine from the transport
     * @param {object} engineOrTransported engine or transported to be removed from the transport
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
  }, {
    key: 'resetEnginePosition',
    value: function resetEnginePosition(transported) {
      var position = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      var speed = this.__speed;

      if (speed !== 0) {
        if (position === undefined) position = transported.syncPosition(this.currentTime, this.currentPosition, speed);

        var nextPosition = this.__transportedQueue.move(transported, position);
        this.resetPosition(nextPosition);
      }
    }

    /**
     * Remove all time engines from the transport
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
     * Get current master position
     * @return {Number} current playing position
     *
     * This function will be replaced when the transport is added to a master (i.e. transport or play-control).
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
}(_timeEngine2.default);

exports.default = Transport;

},{"../core/audio-context":1,"../core/time-engine":3,"../utils/priority-queue":14,"../utils/scheduling-queue":15,"./factories":9,"babel-runtime/core-js/get-iterator":16,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/get":28,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* written in ECMAscript 6 */
/**
 * @fileoverview WAVE audio priority queue used by scheduler and transports
 * @author Norbert Schnell <Norbert.Schnell@ircam.fr>
 *
 * First rather stupid implementation to be optimized...
 */

var PriorityQueue = function () {
  function PriorityQueue() {
    (0, _classCallCheck3.default)(this, PriorityQueue);

    this.__objects = [];
    this.reverse = false;
  }

  /**
   *  Get the index of an object in the object list
   */


  (0, _createClass3.default)(PriorityQueue, [{
    key: "__objectIndex",
    value: function __objectIndex(object) {
      for (var i = 0; i < this.__objects.length; i++) {
        if (object === this.__objects[i][0]) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Withdraw an object from the object list
     */

  }, {
    key: "__removeObject",
    value: function __removeObject(object) {
      var index = this.__objectIndex(object);

      if (index >= 0) this.__objects.splice(index, 1);

      if (this.__objects.length > 0) return this.__objects[0][1]; // return time of first object

      return Infinity;
    }
  }, {
    key: "__sortObjects",
    value: function __sortObjects() {
      if (!this.reverse) this.__objects.sort(function (a, b) {
        return a[1] - b[1];
      });else this.__objects.sort(function (a, b) {
        return b[1] - a[1];
      });
    }

    /**
     * Insert an object to the queue
     * (for this primitive version: prevent sorting for each element by calling with "false" as third argument)
     */

  }, {
    key: "insert",
    value: function insert(object, time) {
      var sort = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

      if (time !== Infinity && time != -Infinity) {
        // add new object
        this.__objects.push([object, time]);

        if (sort) this.__sortObjects();

        return this.__objects[0][1]; // return time of first object
      }

      return this.__removeObject(object);
    }

    /**
     * Move an object to another time in the queue
     */

  }, {
    key: "move",
    value: function move(object, time) {
      if (time !== Infinity && time != -Infinity) {

        var index = this.__objectIndex(object);

        if (index < 0) this.__objects.push([object, time]); // add new object
        else this.__objects[index][1] = time; // update time of existing object

        this.__sortObjects();

        return this.__objects[0][1]; // return time of first object
      }

      return this.__removeObject(object);
    }

    /**
     * Remove an object from the queue
     */

  }, {
    key: "remove",
    value: function remove(object) {
      return this.__removeObject(object);
    }

    /**
     * Clear queue
     */

  }, {
    key: "clear",
    value: function clear() {
      this.__objects.length = 0; // clear object list
      return Infinity;
    }

    /**
     * Get first object in queue
     */

  }, {
    key: "head",
    get: function get() {
      if (this.__objects.length > 0) return this.__objects[0][0];

      return null;
    }

    /**
     * Get time of first object in queue
     */

  }, {
    key: "time",
    get: function get() {
      if (this.__objects.length > 0) return this.__objects[0][1];

      return Infinity;
    }
  }]);
  return PriorityQueue;
}();

exports.default = PriorityQueue;

},{"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _priorityQueue = require('../utils/priority-queue');

var _priorityQueue2 = _interopRequireDefault(_priorityQueue);

var _timeEngine = require('../core/time-engine');

var _timeEngine2 = _interopRequireDefault(_timeEngine);

var _audioContext = require('../core/audio-context');

var _audioContext2 = _interopRequireDefault(_audioContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @class SchedulingQueue
 */

var SchedulingQueue = function (_TimeEngine) {
  (0, _inherits3.default)(SchedulingQueue, _TimeEngine);

  function SchedulingQueue() {
    (0, _classCallCheck3.default)(this, SchedulingQueue);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SchedulingQueue).call(this));

    _this.__queue = new _priorityQueue2.default();
    _this.__engines = new _set2.default();
    return _this;
  }

  // TimeEngine 'scheduled' interface


  (0, _createClass3.default)(SchedulingQueue, [{
    key: 'advanceTime',
    value: function advanceTime(time) {
      var nextTime = this.__queue.time;

      while (nextTime <= time) {
        var engine = this.__queue.head;
        var nextEngineTime = engine.advanceTime(time);

        if (!nextEngineTime) {
          engine.master = null;
          this.__engines.delete(engine);
          nextTime = this.__queue.remove(engine);
        } else if (nextEngineTime > time && nextEngineTime <= Infinity) {
          nextTime = this.__queue.move(engine, nextEngineTime);
        } else {
          throw new Error('engine did not advance time');
        }
      }

      return nextTime;
    }

    // TimeEngine master method to be implemented by derived class

  }, {
    key: 'defer',


    // call a function at a given time
    value: function defer(fun) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!(fun instanceof Function)) throw new Error("object cannot be defered by scheduler");

      this.add({
        advanceTime: function advanceTime() {
          fun();
        } }, // make sur that the advanceTime method does not returm anything
      time);
    }

    // add a time engine to the queue and return the engine

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!engine.implementsScheduled()) throw new Error("object cannot be added to scheduler");

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
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (engine.master !== this) throw new Error("object has not been added to this scheduler");

      var nextTime = this.__queue.move(engine, time);
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
      this.__queue.clear();
      this.__engines.clear;
      this.resetTime(Infinity);
    }
  }, {
    key: 'currentTime',
    get: function get() {
      return 0;
    }
  }]);
  return SchedulingQueue;
}(_timeEngine2.default); /**
                          * SchedulingQueue base class
                          * http://wavesjs.github.io/audio/#audio-scheduling-queue
                          *
                          * Norbert.Schnell@ircam.fr
                          * Copyright 2014, 2015 IRCAM – Centre Pompidou
                          */

exports.default = SchedulingQueue;

},{"../core/audio-context":1,"../core/time-engine":3,"../utils/priority-queue":14,"babel-runtime/core-js/object/get-prototype-of":20,"babel-runtime/core-js/set":22,"babel-runtime/helpers/classCallCheck":26,"babel-runtime/helpers/createClass":27,"babel-runtime/helpers/inherits":29,"babel-runtime/helpers/possibleConstructorReturn":30}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":32}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":33}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":34}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":35}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":36}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":37}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":38}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":39}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":40}],25:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/weak-map"), __esModule: true };
},{"core-js/library/fn/weak-map":41}],26:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],27:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("babel-runtime/core-js/object/define-property");

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
},{"babel-runtime/core-js/object/define-property":18}],28:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

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
},{"babel-runtime/core-js/object/get-own-property-descriptor":19,"babel-runtime/core-js/object/get-prototype-of":20}],29:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("babel-runtime/helpers/typeof");

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
},{"babel-runtime/core-js/object/create":17,"babel-runtime/core-js/object/set-prototype-of":21,"babel-runtime/helpers/typeof":31}],30:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"babel-runtime/helpers/typeof":31}],31:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"babel-runtime/core-js/symbol":23,"babel-runtime/core-js/symbol/iterator":24}],32:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":114,"../modules/es6.string.iterator":123,"../modules/web.dom.iterable":127}],33:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};
},{"../../modules/_core":56,"../../modules/es6.object.create":116}],34:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":56,"../../modules/es6.object.define-property":117}],35:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key){
  return $Object.getOwnPropertyDescriptor(it, key);
};
},{"../../modules/_core":56,"../../modules/es6.object.get-own-property-descriptor":118}],36:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;
},{"../../modules/_core":56,"../../modules/es6.object.get-prototype-of":119}],37:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;
},{"../../modules/_core":56,"../../modules/es6.object.set-prototype-of":120}],38:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
module.exports = require('../modules/_core').Set;
},{"../modules/_core":56,"../modules/es6.object.to-string":121,"../modules/es6.set":122,"../modules/es6.string.iterator":123,"../modules/es7.set.to-json":126,"../modules/web.dom.iterable":127}],39:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":56,"../../modules/es6.object.to-string":121,"../../modules/es6.symbol":124}],40:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks')('iterator');
},{"../../modules/_wks":112,"../../modules/es6.string.iterator":123,"../../modules/web.dom.iterable":127}],41:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/web.dom.iterable');
require('../modules/es6.weak-map');
module.exports = require('../modules/_core').WeakMap;
},{"../modules/_core":56,"../modules/es6.object.to-string":121,"../modules/es6.weak-map":125,"../modules/web.dom.iterable":127}],42:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],43:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],44:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],45:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":74}],46:[function(require,module,exports){
var forOf = require('./_for-of');

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"./_for-of":65}],47:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":105,"./_to-iobject":107,"./_to-length":108}],48:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = require('./_ctx')
  , IObject  = require('./_iobject')
  , toObject = require('./_to-object')
  , toLength = require('./_to-length')
  , asc      = require('./_array-species-create');
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./_array-species-create":49,"./_ctx":57,"./_iobject":71,"./_to-length":108,"./_to-object":109}],49:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var isObject = require('./_is-object')
  , isArray  = require('./_is-array')
  , SPECIES  = require('./_wks')('species');
module.exports = function(original, length){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return new (C === undefined ? Array : C)(length);
};
},{"./_is-array":73,"./_is-object":74,"./_wks":112}],50:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":51,"./_wks":112}],51:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],52:[function(require,module,exports){
'use strict';
var dP          = require('./_object-dp').f
  , create      = require('./_object-create')
  , hide        = require('./_hide')
  , redefineAll = require('./_redefine-all')
  , ctx         = require('./_ctx')
  , anInstance  = require('./_an-instance')
  , defined     = require('./_defined')
  , forOf       = require('./_for-of')
  , $iterDefine = require('./_iter-define')
  , step        = require('./_iter-step')
  , setSpecies  = require('./_set-species')
  , DESCRIPTORS = require('./_descriptors')
  , fastKey     = require('./_meta').fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
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
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./_an-instance":44,"./_ctx":57,"./_defined":58,"./_descriptors":59,"./_for-of":65,"./_hide":68,"./_iter-define":77,"./_iter-step":78,"./_meta":82,"./_object-create":84,"./_object-dp":85,"./_redefine-all":97,"./_set-species":100}],53:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = require('./_classof')
  , from    = require('./_array-from-iterable');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"./_array-from-iterable":46,"./_classof":50}],54:[function(require,module,exports){
'use strict';
var redefineAll       = require('./_redefine-all')
  , getWeak           = require('./_meta').getWeak
  , anObject          = require('./_an-object')
  , isObject          = require('./_is-object')
  , anInstance        = require('./_an-instance')
  , forOf             = require('./_for-of')
  , createArrayMethod = require('./_array-methods')
  , $has              = require('./_has')
  , arrayFind         = createArrayMethod(5)
  , arrayFindIndex    = createArrayMethod(6)
  , id                = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function(that){
  return that._l || (that._l = new UncaughtFrozenStore);
};
var UncaughtFrozenStore = function(){
  this.a = [];
};
var findUncaughtFrozen = function(store, key){
  return arrayFind(store.a, function(it){
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function(key){
    var entry = findUncaughtFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findUncaughtFrozen(this, key);
  },
  set: function(key, value){
    var entry = findUncaughtFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = arrayFindIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var data = getWeak(anObject(key), true);
    if(data === true)uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};
},{"./_an-instance":44,"./_an-object":45,"./_array-methods":48,"./_for-of":65,"./_has":67,"./_is-object":74,"./_meta":82,"./_redefine-all":97}],55:[function(require,module,exports){
'use strict';
var global         = require('./_global')
  , $export        = require('./_export')
  , meta           = require('./_meta')
  , fails          = require('./_fails')
  , hide           = require('./_hide')
  , redefineAll    = require('./_redefine-all')
  , forOf          = require('./_for-of')
  , anInstance     = require('./_an-instance')
  , isObject       = require('./_is-object')
  , setToStringTag = require('./_set-to-string-tag')
  , dP             = require('./_object-dp').f
  , each           = require('./_array-methods')(0)
  , DESCRIPTORS    = require('./_descriptors');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    C = wrapper(function(target, iterable){
      anInstance(target, C, NAME, '_c');
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        anInstance(this, C, KEY);
        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    if('size' in proto)dP(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./_an-instance":44,"./_array-methods":48,"./_descriptors":59,"./_export":63,"./_fails":64,"./_for-of":65,"./_global":66,"./_hide":68,"./_is-object":74,"./_meta":82,"./_object-dp":85,"./_redefine-all":97,"./_set-to-string-tag":101}],56:[function(require,module,exports){
var core = module.exports = {version: '2.1.5'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],57:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":42}],58:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],59:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":64}],60:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":66,"./_is-object":74}],61:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],62:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":90,"./_object-keys":93,"./_object-pie":94}],63:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
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
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
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
},{"./_core":56,"./_ctx":57,"./_global":66,"./_hide":68}],64:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],65:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./_an-object":45,"./_ctx":57,"./_is-array-iter":72,"./_iter-call":75,"./_to-length":108,"./core.get-iterator-method":113}],66:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],67:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],68:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":59,"./_object-dp":85,"./_property-desc":96}],69:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":66}],70:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":59,"./_dom-create":60,"./_fails":64}],71:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":51}],72:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":79,"./_wks":112}],73:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":51}],74:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],75:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":45}],76:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":68,"./_object-create":84,"./_property-desc":96,"./_set-to-string-tag":101,"./_wks":112}],77:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":63,"./_has":67,"./_hide":68,"./_iter-create":76,"./_iterators":79,"./_library":81,"./_object-gpo":91,"./_redefine":98,"./_set-to-string-tag":101,"./_wks":112}],78:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],79:[function(require,module,exports){
module.exports = {};
},{}],80:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":93,"./_to-iobject":107}],81:[function(require,module,exports){
module.exports = true;
},{}],82:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":64,"./_has":67,"./_is-object":74,"./_object-dp":85,"./_uid":111}],83:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":64,"./_iobject":71,"./_object-gops":90,"./_object-keys":93,"./_object-pie":94,"./_to-object":109}],84:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};
},{"./_an-object":45,"./_dom-create":60,"./_enum-bug-keys":61,"./_html":69,"./_object-dps":86,"./_shared-key":102}],85:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":45,"./_descriptors":59,"./_ie8-dom-define":70,"./_to-primitive":110}],86:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":45,"./_descriptors":59,"./_object-dp":85,"./_object-keys":93}],87:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":59,"./_has":67,"./_ie8-dom-define":70,"./_object-pie":94,"./_property-desc":96,"./_to-iobject":107,"./_to-primitive":110}],88:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN.f(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};
},{"./_object-gopn":89,"./_to-iobject":107}],89:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":61,"./_object-keys-internal":92}],90:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],91:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":67,"./_shared-key":102,"./_to-object":109}],92:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":47,"./_has":67,"./_shared-key":102,"./_to-iobject":107}],93:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":61,"./_object-keys-internal":92}],94:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],95:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":56,"./_export":63,"./_fails":64}],96:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],97:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":68}],98:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":68}],99:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":45,"./_ctx":57,"./_is-object":74,"./_object-gopd":87}],100:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":56,"./_descriptors":59,"./_global":66,"./_object-dp":85,"./_wks":112}],101:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":67,"./_object-dp":85,"./_wks":112}],102:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":103,"./_uid":111}],103:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":66}],104:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":58,"./_to-integer":106}],105:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":106}],106:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],107:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":58,"./_iobject":71}],108:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":106}],109:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":58}],110:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":74}],111:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],112:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';
module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};
},{"./_global":66,"./_shared":103,"./_uid":111}],113:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":50,"./_core":56,"./_iterators":79,"./_wks":112}],114:[function(require,module,exports){
var anObject = require('./_an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./_an-object":45,"./_core":56,"./core.get-iterator-method":113}],115:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":43,"./_iter-define":77,"./_iter-step":78,"./_iterators":79,"./_to-iobject":107}],116:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":63,"./_object-create":84}],117:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":59,"./_export":63,"./_object-dp":85}],118:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = require('./_to-iobject')
  , $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./_object-gopd":87,"./_object-sap":95,"./_to-iobject":107}],119:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":91,"./_object-sap":95,"./_to-object":109}],120:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":63,"./_set-proto":99}],121:[function(require,module,exports){

},{}],122:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');

// 23.2 Set Objects
module.exports = require('./_collection')('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./_collection":55,"./_collection-strong":52}],123:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":77,"./_string-at":104}],124:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , core           = require('./_core')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , setter         = false
  , HIDDEN         = wks('_hidden')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , ObjectProto    = Object.prototype
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol.prototype);
  sym._k = tag;
  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    }
  });
  return sym;
};

var isSymbol = function(it){
  return typeof it == 'symbol';
};

var $defineProperty = function defineProperty(it, key, D){
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  var D = gOPD(it = toIObject(it), key = toPrimitive(key, true));
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
};
var $stringify = function stringify(it){
  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
  var args = [it]
    , i    = 1
    , replacer, $replacer;
  while(arguments.length > i)args.push(arguments[i++]);
  replacer = args[1];
  if(typeof replacer == 'function')$replacer = replacer;
  if($replacer || !isArray(replacer))replacer = function(key, value){
    if($replacer)value = $replacer.call(this, key, value);
    if(!isSymbol(value))return value;
  };
  args[1] = replacer;
  return _stringify.apply($JSON, args);
};
var BUGGY_JSON = $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
});

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
  };
  redefine($Symbol.prototype, 'toString', function toString(){
    return this._k;
  });

  isSymbol = function(it){
    return it instanceof $Symbol;
  };

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
for(var symbols = (
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; ){
  var key     = symbols[i++]
    , Wrapper = core.Symbol
    , sym     = wks(key);
  if(!(key in Wrapper))dP(Wrapper, key, {value: USE_NATIVE ? sym : wrap(sym)});
};

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
if(!QObject || !QObject.prototype || !QObject.prototype.findChild)setter = true;

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
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
$JSON && $export($export.S + $export.F * (!USE_NATIVE || BUGGY_JSON), 'JSON', {stringify: $stringify});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":45,"./_core":56,"./_descriptors":59,"./_enum-keys":62,"./_export":63,"./_fails":64,"./_global":66,"./_has":67,"./_is-array":73,"./_keyof":80,"./_library":81,"./_meta":82,"./_object-create":84,"./_object-dp":85,"./_object-gopd":87,"./_object-gopn":89,"./_object-gopn-ext":88,"./_object-gops":90,"./_object-pie":94,"./_property-desc":96,"./_redefine":98,"./_set-to-string-tag":101,"./_shared":103,"./_to-iobject":107,"./_to-primitive":110,"./_uid":111,"./_wks":112}],125:[function(require,module,exports){
'use strict';
var each         = require('./_array-methods')(0)
  , redefine     = require('./_redefine')
  , meta         = require('./_meta')
  , assign       = require('./_object-assign')
  , weak         = require('./_collection-weak')
  , isObject     = require('./_is-object')
  , has          = require('./_has')
  , getWeak      = meta.getWeak
  , isExtensible = Object.isExtensible
  , uncaughtFrozenStore = weak.ufstore
  , tmp          = {}
  , InternalMap;

var wrapper = function(get){
  return function WeakMap(){
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      var data = getWeak(key);
      if(data === true)return uncaughtFrozenStore(this).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('./_collection')('WeakMap', wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  InternalMap = weak.getConstructor(wrapper);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    redefine(proto, key, function(a, b){
      // store frozen objects on internal weakmap shim
      if(isObject(a) && !isExtensible(a)){
        if(!this._f)this._f = new InternalMap;
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./_array-methods":48,"./_collection":55,"./_collection-weak":54,"./_has":67,"./_is-object":74,"./_meta":82,"./_object-assign":83,"./_redefine":98}],126:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./_export');

$export($export.P + $export.R, 'Set', {toJSON: require('./_collection-to-json')('Set')});
},{"./_collection-to-json":53,"./_export":63}],127:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":66,"./_hide":68,"./_iterators":79,"./_wks":112,"./es6.array.iterator":115}]},{},[8])(8)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2NvcmUvYXVkaW8tY29udGV4dC5qcyIsImRpc3QvY29yZS9hdWRpby10aW1lLWVuZ2luZS5qcyIsImRpc3QvY29yZS90aW1lLWVuZ2luZS5qcyIsImRpc3QvZW5naW5lcy9ncmFudWxhci1lbmdpbmUuanMiLCJkaXN0L2VuZ2luZXMvbWV0cm9ub21lLmpzIiwiZGlzdC9lbmdpbmVzL3BsYXllci1lbmdpbmUuanMiLCJkaXN0L2VuZ2luZXMvc2VnbWVudC1lbmdpbmUuanMiLCJkaXN0L2luZGV4LmpzIiwiZGlzdC9tYXN0ZXJzL2ZhY3Rvcmllcy5qcyIsImRpc3QvbWFzdGVycy9wbGF5LWNvbnRyb2wuanMiLCJkaXN0L21hc3RlcnMvc2NoZWR1bGVyLmpzIiwiZGlzdC9tYXN0ZXJzL3NpbXBsZS1zY2hlZHVsZXIuanMiLCJkaXN0L21hc3RlcnMvdHJhbnNwb3J0LmpzIiwiZGlzdC91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyIsImRpc3QvdXRpbHMvc2NoZWR1bGluZy1xdWV1ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3NldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2wvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3dlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY3JlYXRlQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3NldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3dlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FuLWluc3RhbmNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FycmF5LWZyb20taXRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1tZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi10by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb2xsZWN0aW9uLXdlYWsuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvbGxlY3Rpb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2N0eC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZGVmaW5lZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2VudW0tYnVnLWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2VudW0ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZm9yLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hhcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGlkZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faHRtbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lvYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLXN0ZXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXJhdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fa2V5b2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2xpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21ldGEuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLWV4dC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ3BvLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1waWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1zYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLWFsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1wcm90by5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXNwZWNpZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQta2V5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3N0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW5kZXguanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWludGVnZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWlvYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1wcmltaXRpdmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fd2tzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYud2Vhay1tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnNldC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNDQSxJQUFJLGVBQWUsSUFBZjs7QUFFSixJQUFJLGVBQWUsT0FBTyxZQUFQLElBQXVCLE9BQU8sa0JBQVA7O0FBRTFDLElBQUcsWUFBSCxFQUFpQjtBQUNmLGlCQUFlLElBQUksWUFBSixFQUFmLENBRGU7O0FBR2YsTUFBSSxpQkFBaUIsSUFBakIsQ0FBc0IsVUFBVSxTQUFWLENBQXRCLElBQThDLGFBQWEsVUFBYixHQUEwQixLQUExQixFQUFpQztBQUNqRixRQUFJLFNBQVMsYUFBYSxZQUFiLENBQTBCLENBQTFCLEVBQTZCLENBQTdCLEVBQWdDLEtBQWhDLENBQVQsQ0FENkU7QUFFakYsUUFBSSxRQUFRLGFBQWEsa0JBQWIsRUFBUixDQUY2RTtBQUdqRixVQUFNLE1BQU4sR0FBZSxNQUFmLENBSGlGO0FBSWpGLFVBQU0sT0FBTixDQUFjLGFBQWEsV0FBYixDQUFkLENBSmlGO0FBS2pGLFVBQU0sS0FBTixDQUFZLENBQVosRUFMaUY7QUFNakYsVUFBTSxVQUFOLEdBTmlGO0dBQW5GO0NBSEY7O2tCQWFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xCZjs7OztBQUNBOzs7Ozs7Ozs7O0lBS3FCOzs7QUFDbkIsV0FEbUIsZUFDbkIsR0FBZ0Q7UUFBcEMsMkdB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QTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBOztBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7O0FDRkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIGV4cG9zZXMgYSBzaW5nbGUgaW5zdGFuY2VcbnZhciBhdWRpb0NvbnRleHQgPSBudWxsO1xuXG52YXIgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0O1xuXG5pZihBdWRpb0NvbnRleHQpIHtcbiAgYXVkaW9Db250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG4gIGlmICgvKGlQaG9uZXxpUGFkKS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgYXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgPCA0NDEwMCkge1xuICAgIHZhciBidWZmZXIgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKDEsIDEsIDQ0MTAwKTtcbiAgICB2YXIgZHVtbXkgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgZHVtbXkuYnVmZmVyID0gYnVmZmVyO1xuICAgIGR1bW15LmNvbm5lY3QoYXVkaW9Db250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICBkdW1teS5zdGFydCgwKTtcbiAgICBkdW1teS5kaXNjb25uZWN0KCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgYXVkaW9Db250ZXh0O1xuIiwiaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi90aW1lLWVuZ2luZSc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuL2F1ZGlvLWNvbnRleHQnO1xuXG4vKipcbiAqIEBjbGFzcyBBdWRpb1RpbWVFbmdpbmVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9UaW1lRW5naW5lIGV4dGVuZHMgVGltZUVuZ2luZXtcbiAgY29uc3RydWN0b3IoYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IGF1ZGlvQ29udGV4dDtcbiAgICB0aGlzLm91dHB1dE5vZGUgPSBudWxsO1xuICB9XG5cbiAgY29ubmVjdCh0YXJnZXQpIHtcbiAgICB0aGlzLm91dHB1dE5vZGUuY29ubmVjdCh0YXJnZXQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGlzY29ubmVjdChjb25uZWN0aW9uKSB7XG4gICAgdGhpcy5vdXRwdXROb2RlLmRpc2Nvbm5lY3QoY29ubmVjdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiIsIi8qKlxuICogQGNsYXNzIFRpbWVFbmdpbmVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLm91dHB1dE5vZGUgPSBudWxsO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlZCBpbnRlcmZhY2VcbiAgICogICAtIGFkdmFuY2VUaW1lKHRpbWUpLCBjYWxsZWQgdG8gZ2VuZXJhdGUgbmV4dCBldmVudCBhdCBnaXZlbiB0aW1lLCByZXR1cm5zIG5leHQgdGltZVxuICAgKi9cbiAgaW1wbGVtZW50c1NjaGVkdWxlZCgpIHtcbiAgICByZXR1cm4gKHRoaXMuYWR2YW5jZVRpbWUgJiYgdGhpcy5hZHZhbmNlVGltZSBpbnN0YW5jZW9mIEZ1bmN0aW9uKTtcbiAgfVxuXG4gIHJlc2V0VGltZSh0aW1lID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRpbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zcG9ydGVkIGludGVyZmFjZVxuICAgKiAgIC0gc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byByZXBvc2l0aW9uIFRpbWVFbmdpbmUsIHJldHVybnMgbmV4dCBwb3NpdGlvblxuICAgKiAgIC0gYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUgYW5kIHBvc2l0aW9uLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICovXG4gIGltcGxlbWVudHNUcmFuc3BvcnRlZCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5zeW5jUG9zaXRpb24gJiYgdGhpcy5zeW5jUG9zaXRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbiAmJlxuICAgICAgdGhpcy5hZHZhbmNlUG9zaXRpb24gJiYgdGhpcy5hZHZhbmNlUG9zaXRpb24gaW5zdGFuY2VvZiBGdW5jdGlvblxuICAgICk7XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgdGhpcy5tYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogU3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2VcbiAgICogICAtIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsICksIGNhbGxlZCB0b1xuICAgKi9cbiAgaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpIHtcbiAgICByZXR1cm4gKHRoaXMuc3luY1NwZWVkICYmIHRoaXMuc3luY1NwZWVkIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG59XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZiAob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG4vKipcbiAqIEBjbGFzcyBHcmFudWxhckVuZ2luZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFudWxhckVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gYnVmZmVyIGluaXRpYWwgYXVkaW8gYnVmZmVyIGZvciBncmFudWxhciBzeW50aGVzaXNcbiAgICpcbiAgICogVGhlIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBcInNjaGVkdWxlZFwiIGludGVyZmFjZS5cbiAgICogVGhlIGdyYWluIHBvc2l0aW9uIChncmFpbiBvbnNldCBvciBjZW50ZXIgdGltZSBpbiB0aGUgYXVkaW8gYnVmZmVyKSBpcyBvcHRpb25hbGx5XG4gICAqIGRldGVybWluZWQgYnkgdGhlIGVuZ2luZSdzIGN1cnJlbnRQb3NpdGlvbiBhdHRyaWJ1dGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBwZXJpb2QgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwLjAxKTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBlcmlvZCByZWxhdGl2ZSB0byBhYnNvbHV0ZSBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RSZWwgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcG9zaXRpb24gKG9uc2V0IHRpbWUgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb24gPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwb3NpdGlvbiB2YXJpYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvblZhciwgMC4wMDMpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgZ3JhaW4gZHVyYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFicywgMC4xKTsgLy8gYWJzb2x1dGUgZ3JhaW4gZHVyYXRpb25cblxuICAgIC8qKlxuICAgICAqIEdyYWluIGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZCAob3ZlcmxhcClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25SZWwgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tBYnMgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja0FicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tSZWwgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1JlbCwgMC41KTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIGF0dGFja1xuICAgICAqIEB0eXBlIHtTdHJpbmd9ICdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsXG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tTaGFwZSA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrU2hhcGUsICdsaW4nKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZUFicyA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZUFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVJlbCwgMC41KTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIHJlbGVhc2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfSAnbGluJyBmb3IgbGluZWFyIHJhbXAsICdleHAnIGZvciBleHBvbmVudGlhbFxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVNoYXBlID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlU2hhcGUsICdsaW4nKTtcblxuICAgIC8qKlxuICAgICAqIE9mZnNldCAoc3RhcnQvZW5kIHZhbHVlKSBmb3IgZXhwb25lbnRpYWwgYXR0YWNrL3JlbGVhc2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfSBvZmZzZXRcbiAgICAgKi9cbiAgICB0aGlzLmV4cFJhbXBPZmZzZXQgPSBvcHRPckRlZihvcHRpb25zLmV4cFJhbXBPZmZzZXQsIDAuMDAwMSk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiByZXNhbXBsaW5nIGluIGNlbnRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5nYWluID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGdyYWluIHBvc2l0aW9uIHJlZmVycyB0byB0aGUgY2VudGVyIG9mIHRoZSBncmFpbiAob3IgdGhlIGJlZ2lubmluZylcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKi9cbiAgICB0aGlzLmNlbnRlcmVkID0gb3B0T3JEZWYob3B0aW9ucy5jZW50ZXJlZCwgdHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIGdyYWluIHBvc2l0aW9uIGFyZSBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgICAqIEB0eXBlIHtCb29sfVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcblxuICAgIC8qKlxuICAgICAqIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyIHRoYXQgaGFzIGJlZW4gY29waWVkIGZyb20gdGhlIGJlZ2lubmluZyB0byBhc3N1cmUgY3ljbGljIGJlaGF2aW9yXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgYnVmZmVyIGR1cmF0aW9uXG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uO1xuXG4gICAgICByZXR1cm4gYnVmZmVyRHVyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIGF0dHJpYnV0ZVxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgZ3JhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgZ3JhaW4gc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBwZXJpb2QgdG8gbmV4dCBncmFpblxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBncmFpbiBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgZ3JhaW4gcGFyYW1ldGVycy5cbiAgICovXG4gIHRyaWdnZXIodGltZSkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgZ3JhaW5UaW1lID0gdGltZSB8fCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgdmFyIGdyYWluUGVyaW9kID0gdGhpcy5wZXJpb2RBYnM7XG4gICAgdmFyIGdyYWluUG9zaXRpb24gPSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgICB2YXIgZ3JhaW5EdXJhdGlvbiA9IHRoaXMuZHVyYXRpb25BYnM7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciByZXNhbXBsaW5nUmF0ZSA9IDEuMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIGdyYWluUGVyaW9kICs9IHRoaXMucGVyaW9kUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgIGdyYWluRHVyYXRpb24gKz0gdGhpcy5kdXJhdGlvblJlbCAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBncmFpbiBwZXJpb2QgcmFuZG9uIHZhcmlhdGlvblxuICAgICAgaWYgKHRoaXMucGVyaW9kVmFyID4gMC4wKVxuICAgICAgICBncmFpblBlcmlvZCArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBlcmlvZFZhciAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBjZW50ZXIgZ3JhaW5cbiAgICAgIGlmICh0aGlzLmNlbnRlcmVkKVxuICAgICAgICBncmFpblBvc2l0aW9uIC09IDAuNSAqIGdyYWluRHVyYXRpb247XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBncmFpbiBwb3NpdGlvblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25WYXIgPiAwKVxuICAgICAgICBncmFpblBvc2l0aW9uICs9ICgyLjAgKiBNYXRoLnJhbmRvbSgpIC0gMSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAvLyB3cmFwIG9yIGNsaXAgZ3JhaW4gcG9zaXRpb24gYW5kIGR1cmF0aW9uIGludG8gYnVmZmVyIGR1cmF0aW9uXG4gICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiA8IDAgfHwgZ3JhaW5Qb3NpdGlvbiA+PSBidWZmZXJEdXJhdGlvbikge1xuICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICB2YXIgY3ljbGVzID0gZ3JhaW5Qb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAoY3ljbGVzIC0gTWF0aC5mbG9vcihjeWNsZXMpKSAqIGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gKyBncmFpbkR1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb24gLSBncmFpblBvc2l0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgZ3JhaW5UaW1lIC09IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uICs9IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpblBvc2l0aW9uID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiBidWZmZXJEdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSBidWZmZXJEdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbWFrZSBncmFpblxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgZ3JhaW5EdXJhdGlvbiA+PSAwLjAwMSkge1xuICAgICAgICAvLyBtYWtlIGdyYWluIGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2UgPSB0aGlzLnJlbGVhc2VBYnMgKyB0aGlzLnJlbGVhc2VSZWwgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gZ3JhaW5EdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBncmFpbkR1cmF0aW9uIC8gKGF0dGFjayArIHJlbGVhc2UpO1xuICAgICAgICAgIGF0dGFjayAqPSBmYWN0b3I7XG4gICAgICAgICAgcmVsZWFzZSAqPSBmYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXR0YWNrRW5kVGltZSA9IGdyYWluVGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIGdyYWluRW5kVGltZSA9IGdyYWluVGltZSArIGdyYWluRHVyYXRpb24gLyByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgdmFyIHJlbGVhc2VTdGFydFRpbWUgPSBncmFpbkVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4udmFsdWUgPSAwO1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFja1NoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBncmFpblRpbWUpO1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5UaW1lKTtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWxlYXNlU3RhcnRUaW1lID4gYXR0YWNrRW5kVGltZSlcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgcmVsZWFzZVN0YXJ0VGltZSk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVsZWFzZVNoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBncmFpbkVuZFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBlbnZlbG9wZS5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChncmFpblRpbWUsIGdyYWluUG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChncmFpbkVuZFRpbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBncmFpblBlcmlvZDtcbiAgfVxufVxuIiwiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXRyb25vbWUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLl9fcGVyaW9kID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2QsIDEpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGZyZXF1ZW5jeVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja0ZyZXEgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrRnJlcSwgNjAwKTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayBhdHRhY2sgdGltZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja0F0dGFjayA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tBdHRhY2ssIDAuMDAyKTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayByZWxlYXNlIHRpbWVcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tSZWxlYXNlID0gb3B0T3JEZWYob3B0aW9ucy5jbGlja1JlbGVhc2UsIDAuMDk4KTtcblxuICAgIHRoaXMuX19sYXN0VGltZSA9IDA7XG4gICAgdGhpcy5fX3BoYXNlID0gMDtcblxuICAgIHRoaXMuX19nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX3BlcmlvZCA+IDApIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb24gPSAoTWF0aC5mbG9vcihwb3NpdGlvbiAvIHRoaXMuX19wZXJpb2QpICsgdGhpcy5fX3BoYXNlKSAqIHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIGlmIChzcGVlZCA+IDAgJiYgbmV4dFBvc2l0aW9uIDwgcG9zaXRpb24pXG4gICAgICAgIG5leHRQb3NpdGlvbiArPSB0aGlzLl9fcGVyaW9kO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIG5leHRQb3NpdGlvbiA+IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gLT0gdGhpcy5fX3BlcmlvZDtcblxuICAgICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMuX19wZXJpb2Q7XG5cbiAgICByZXR1cm4gcG9zaXRpb24gKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgY2xpY2tBdHRhY2sgPSB0aGlzLmNsaWNrQXR0YWNrO1xuICAgIGNvbnN0IGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuXG4gICAgY29uc3QgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBlbnYuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIHRpbWUgKyBjbGlja0F0dGFjayk7XG4gICAgZW52LmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgIGNvbnN0IG9zYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuY2xpY2tGcmVxO1xuICAgIG9zYy5zdGFydCh0aW1lKTtcbiAgICBvc2Muc3RvcCh0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIG9zYy5jb25uZWN0KGVudik7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBlcmlvZCBwYXJhbWV0ZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBlcmlvZCBtZXRyb25vbWUgcGVyaW9kXG4gICAqL1xuICBzZXQgcGVyaW9kKHBlcmlvZCkge1xuICAgIHRoaXMuX19wZXJpb2QgPSBwZXJpb2Q7XG5cbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIpIHtcbiAgICAgIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKVxuICAgICAgICBtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRoaXMuX19sYXN0VGltZSArIHBlcmlvZCk7XG4gICAgICBlbHNlIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbilcbiAgICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwZXJpb2QgcGFyYW1ldGVyXG4gICAqIEByZXR1cm4ge051bWJlcn0gdmFsdWUgb2YgcGVyaW9kIHBhcmFtZXRlclxuICAgKi9cbiAgZ2V0IHBlcmlvZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGhhc2UgcGFyYW1ldGVyIChhdmFpbGFibGUgb25seSB3aGVuICd0cmFuc3BvcnRlZCcpXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwaGFzZSBtZXRyb25vbWUgcGhhc2UgWzAsIDFbXG4gICAqL1xuICBzZXQgcGhhc2UocGhhc2UpIHtcbiAgICB0aGlzLl9fcGhhc2UgPSBwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGhhc2UgcGFyYW1ldGVyXG4gICAqIEByZXR1cm4ge051bWJlcn0gdmFsdWUgb2YgcGhhc2UgcGFyYW1ldGVyXG4gICAqL1xuICBnZXQgcGhhc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19waGFzZTtcbiAgfVxufVxuIiwiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLnRyYW5zcG9ydCA9IG51bGw7IC8vIHNldCB3aGVuIGFkZGVkIHRvIHRyYW5zcG9ydGVyXG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBGYWRlIHRpbWUgZm9yIGNoYWluaW5nIHNlZ21lbnRzIChlLmcuIGluIHN0YXJ0LCBzdG9wLCBhbmQgc2VlaylcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5mYWRlVGltZSA9IG9wdE9yRGVmKG9wdGlvbnMuZmFkZVRpbWUsIDAuMDA1KTtcblxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5fX2N5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBfX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLl9fY3ljbGljICYmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pKSB7XG4gICAgICAgIHZhciBwaGFzZSA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHBvc2l0aW9uID0gKHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSkpICogYnVmZmVyRHVyYXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA+PSAwICYmIHBvc2l0aW9uIDwgYnVmZmVyRHVyYXRpb24gJiYgc3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmNvbm5lY3QodGhpcy5fX2dhaW5Ob2RlKTtcblxuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNwZWVkO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3AgPSB0aGlzLl9fY3ljbGljO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IDA7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcEVuZCA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0YXJ0KHRpbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMuX19lbnZOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX2hhbHQodGltZSkge1xuICAgIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5fX2Vudk5vZGUuZ2Fpbi52YWx1ZSwgdGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RvcCh0aW1lICsgdGhpcy5mYWRlVGltZSk7XG5cbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgICAgdGhpcy5fX2Vudk5vZGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmIChzZWVrIHx8IGxhc3RTcGVlZCAqIHNwZWVkIDwgMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCB8fCBzZWVrKSB7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShzcGVlZCwgdGltZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEBwYXJhbSB7Qm9vbH0gY3ljbGljIHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKi9cbiAgc2V0IGN5Y2xpYyhjeWNsaWMpIHtcbiAgICBpZiAoY3ljbGljICE9PSB0aGlzLl9fY3ljbGljKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmN1cnJlbnRvc2l0aW9uO1xuXG4gICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIHRoaXMuX19jeWNsaWMgPSBjeWNsaWM7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgdGhpcy5fX3NwZWVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKiBAcmV0dXJuIHtCb29sfSB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICovXG4gIGdldCBjeWNsaWMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jeWNsaWM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuc2V0VmFsdWVBdFRpbWUodGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYnVmZmVyIGR1cmF0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBidWZmZXIgZHVyYXRpb25cbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZih0aGlzLmJ1ZmZlcilcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgIHJldHVybiAwO1xuICB9XG59XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRPclByZXZpb3VzSW5kZXgoc29ydGVkQXJyYXksIHZhbHVlLCBpbmRleCA9IDApIHtcbiAgdmFyIHNpemUgPSBzb3J0ZWRBcnJheS5sZW5ndGg7XG5cbiAgaWYgKHNpemUgPiAwKSB7XG4gICAgdmFyIGZpcnN0VmFsID0gc29ydGVkQXJyYXlbMF07XG4gICAgdmFyIGxhc3RWYWwgPSBzb3J0ZWRBcnJheVtzaXplIC0gMV07XG5cbiAgICBpZiAodmFsdWUgPCBmaXJzdFZhbClcbiAgICAgIGluZGV4ID0gLTE7XG4gICAgZWxzZSBpZiAodmFsdWUgPj0gbGFzdFZhbClcbiAgICAgIGluZGV4ID0gc2l6ZSAtIDE7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHNpemUpXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigoc2l6ZSAtIDEpICogKHZhbHVlIC0gZmlyc3RWYWwpIC8gKGxhc3RWYWwgLSBmaXJzdFZhbCkpO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXhdID4gdmFsdWUpXG4gICAgICAgIGluZGV4LS07XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleCArIDFdIDw9IHZhbHVlKVxuICAgICAgICBpbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudE9yTmV4dEluZGV4KHNvcnRlZEFycmF5LCB2YWx1ZSwgaW5kZXggPSAwKSB7XG4gIHZhciBzaXplID0gc29ydGVkQXJyYXkubGVuZ3RoO1xuXG4gIGlmIChzaXplID4gMCkge1xuICAgIHZhciBmaXJzdFZhbCA9IHNvcnRlZEFycmF5WzBdO1xuICAgIHZhciBsYXN0VmFsID0gc29ydGVkQXJyYXlbc2l6ZSAtIDFdO1xuXG4gICAgaWYgKHZhbHVlIDw9IGZpcnN0VmFsKVxuICAgICAgaW5kZXggPSAwO1xuICAgIGVsc2UgaWYgKHZhbHVlID49IGxhc3RWYWwpXG4gICAgICBpbmRleCA9IHNpemU7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHNpemUpXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigoc2l6ZSAtIDEpICogKHZhbHVlIC0gZmlyc3RWYWwpIC8gKGxhc3RWYWwgLSBmaXJzdFZhbCkpO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXhdIDwgdmFsdWUpXG4gICAgICAgIGluZGV4Kys7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleCArIDFdID49IHZhbHVlKVxuICAgICAgICBpbmRleC0tO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn1cblxuLyoqXG4gKiBAY2xhc3MgU2VnbWVudEVuZ2luZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWdtZW50RW5naW5lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge0F1ZGlvQnVmZmVyfSBidWZmZXIgaW5pdGlhbCBhdWRpbyBidWZmZXIgZm9yIGdyYW51bGFyIHN5bnRoZXNpc1xuICAgKlxuICAgKiBUaGUgZW5naW5lIGltcGxlbWVudHMgdGhlIFwic2NoZWR1bGVkXCIgYW5kIFwidHJhbnNwb3J0ZWRcIiBpbnRlcmZhY2VzLlxuICAgKiBXaGVuIFwic2NoZWR1bGVkXCIsIHRoZSBlbmdpbmUgIGdlbmVyYXRlcyBzZWdtZW50cyBtb3JlIG9yIGxlc3PCoHBlcmlvZGljYWxseVxuICAgKiAoY29udHJvbGxlZCBieSB0aGUgcGVyaW9kQWJzLCBwZXJpb2RSZWwsIGFuZCBwZXJpb1ZhciBhdHRyaWJ1dGVzKS5cbiAgICogV2hlbiBcInRyYW5zcG9ydGVkXCIsIHRoZSBlbmdpbmUgZ2VuZXJhdGVzIHNlZ21lbnRzIGF0IHRoZSBwb3NpdGlvbiBvZiB0aGVpciBvbnNldCB0aW1lLlxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBwZXJpb2QgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kUmVsID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RSZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBzZWdtZW50IHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RWYXIgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IHBvc2l0aW9ucyAob25zZXQgdGltZXMgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25BcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25BcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvblZhciA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25WYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBkdXJhdGlvbnMgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQXJyYXkgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uQXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgZHVyYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdpdmVuIHNlZ21lbnQgZHVyYXRpb24gb3IgaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25SZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBvZmZzZXRzIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICpcbiAgICAgKiBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAqIG9mZnNldCA8IDA6IHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uIGlzIHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGFuZCB0aGUgZHVyYXRpb24gaGFzIHRvIGJlIGNvcnJlY3RlZCBieSB0aGUgb2Zmc2V0XG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRBcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0QXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgb2Zmc2V0IGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRBYnMgPSBvcHRPckRlZihvcHRpb25zLm9mZnNldEFicywgLTAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgb2Zmc2V0IHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0UmVsID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogVGltZSBieSB3aGljaCBhbGwgc2VnbWVudHMgYXJlIGRlbGF5ZWQgKGVzcGVjaWFsbHkgdG8gcmVhbGl6ZSBzZWdtZW50IG9mZnNldHMpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmRlbGF5ID0gb3B0T3JEZWYob3B0aW9ucy5kZWxheSwgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgYXR0YWNrIHRpbWUgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja0FicyA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrQWJzLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1JlbCA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZUFicyA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZUFicywgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHJlc2FtcGxpbmcgaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmdWYXIgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmdWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTGluZWFyIGdhaW4gZmFjdG9yXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmdhaW4gPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgLyoqXG4gICAgICogSW5kZXggb2YgdGhlIHNlZ21lbnQgdG8gc3ludGhlc2l6ZSAoaS5lLiBvZiB0aGlzLnBvc2l0aW9uQXJyYXkvZHVyYXRpb25BcnJheS9vZmZzZXRBcnJheSlcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gb3B0T3JEZWYob3B0aW9ucy5zZWdtZW50SW5kZXgsIDApO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBzZWdtZW50IGluZGljZXMgYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICogQHR5cGUge0Jvb2x9XG4gICAgICovXG4gICAgdGhpcy5jeWNsaWMgPSBvcHRPckRlZihvcHRpb25zLmN5Y2xpYywgZmFsc2UpO1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbiA9IG9wdE9yRGVmKG9wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbiwgMCk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvbiAoZXhjbHVkaW5nIHdyYXBBcm91bmRFeHRlbnNpb24pXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBidWZmZXIgZHVyYXRpb25cbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgICAgICBidWZmZXJEdXJhdGlvbiAtPSB0aGlzLndyYXBBcm91bmRFeHRlbnNpb247XG5cbiAgICAgIHJldHVybiBidWZmZXJEdXJhdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aW1lID0gTWF0aC5tYXgodGltZSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc2VnbWVudEluZGV4O1xuICAgIHZhciBjeWNsaWNPZmZzZXQgPSAwO1xuICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgIHZhciBjeWNsZXMgPSBwb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICBjeWNsaWNPZmZzZXQgPSBNYXRoLmZsb29yKGN5Y2xlcykgKiBidWZmZXJEdXJhdGlvbjtcbiAgICAgIHBvc2l0aW9uIC09IGN5Y2xpY09mZnNldDtcbiAgICB9XG5cbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpbmRleCA9IGdldEN1cnJlbnRPck5leHRJbmRleCh0aGlzLnBvc2l0aW9uQXJyYXksIHBvc2l0aW9uKTtcblxuICAgICAgaWYgKGluZGV4ID49IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBjeWNsaWNPZmZzZXQgKz0gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgIGluZGV4ID0gZ2V0Q3VycmVudE9yUHJldmlvdXNJbmRleCh0aGlzLnBvc2l0aW9uQXJyYXksIHBvc2l0aW9uKTtcblxuICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCA9IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBjeWNsaWNPZmZzZXQgLT0gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gLUluZmluaXR5O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgfVxuXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gY3ljbGljT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGN5Y2xpY09mZnNldCArIHRoaXMucG9zaXRpb25BcnJheVtpbmRleF07XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG4gICAgdmFyIGN5Y2xpY09mZnNldCA9IHRoaXMuX19jeWNsaWNPZmZzZXQ7XG5cbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG5cbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpbmRleCsrO1xuXG4gICAgICBpZiAoaW5kZXggPj0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIGN5Y2xpY09mZnNldCArPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleC0tO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgIGN5Y2xpY09mZnNldCAtPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIC1JbmZpbml0eTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSBjeWNsaWNPZmZzZXQ7XG5cbiAgICByZXR1cm4gY3ljbGljT2Zmc2V0ICsgdGhpcy5wb3NpdGlvbkFycmF5W2luZGV4XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgc2VnbWVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBzZWdtZW50IHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gcGVyaW9kIHRvIG5leHQgc2VnbWVudFxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQvdHJhbnNwb3J0ZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBzZWdtZW50IGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzZWdtZW50IHBhcmFtZXRlcnMuXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIHNlZ21lbnRUaW1lID0gKHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSArIHRoaXMuZGVsYXk7XG4gICAgdmFyIHNlZ21lbnRQZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgc2VnbWVudEluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBzZWdtZW50UG9zaXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudER1cmF0aW9uID0gMC4wO1xuICAgICAgdmFyIHNlZ21lbnRPZmZzZXQgPSAwLjA7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5jeWNsaWMpXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCAlIHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGg7XG4gICAgICBlbHNlXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNlZ21lbnRJbmRleCwgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDEpKTtcblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMuZHVyYXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMub2Zmc2V0QXJyYXkpXG4gICAgICAgIHNlZ21lbnRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwIHx8IHRoaXMucGVyaW9kUmVsID4gMCkge1xuICAgICAgICB2YXIgbmV4dFNlZ2VtZW50SW5kZXggPSBzZWdtZW50SW5kZXggKyAxO1xuICAgICAgICB2YXIgbmV4dFBvc2l0aW9uLCBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIGlmIChuZXh0U2VnZW1lbnRJbmRleCA9PT0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5WzBdICsgYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgICBuZXh0T2Zmc2V0ID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W25leHRTZWdlbWVudEluZGV4XTtcbiAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVtuZXh0U2VnZW1lbnRJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW50ZXJTZWdtZW50RGlzdGFuY2UgPSBuZXh0UG9zaXRpb24gLSBzZWdtZW50UG9zaXRpb247XG5cbiAgICAgICAgLy8gY29ycmVjdCBpbnRlci1zZWdtZW50IGRpc3RhbmNlIGJ5IG9mZnNldHNcbiAgICAgICAgLy8gICBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAgICBpZiAoc2VnbWVudE9mZnNldCA+IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgLT0gc2VnbWVudE9mZnNldDtcblxuICAgICAgICBpZiAobmV4dE9mZnNldCA+IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgKz0gbmV4dE9mZnNldDtcblxuICAgICAgICBpZiAoaW50ZXJTZWdtZW50RGlzdGFuY2UgPCAwKVxuICAgICAgICAgIGludGVyU2VnbWVudERpc3RhbmNlID0gMDtcblxuICAgICAgICAvLyB1c2UgaW50ZXItc2VnbWVudCBkaXN0YW5jZSBpbnN0ZWFkIG9mIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgICAgaWYgKHNlZ21lbnREdXJhdGlvbiA9PT0gMClcbiAgICAgICAgICBzZWdtZW50RHVyYXRpb24gPSBpbnRlclNlZ21lbnREaXN0YW5jZTtcblxuICAgICAgICAvLyBjYWxjdWxhdGUgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyIG1hcmtlciBkaXN0YW5jZVxuICAgICAgICBzZWdtZW50UGVyaW9kICs9IHRoaXMucGVyaW9kUmVsICogaW50ZXJTZWdtZW50RGlzdGFuY2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgc2VnbWVudCBkdXJhdGlvblxuICAgICAgc2VnbWVudER1cmF0aW9uICo9IHRoaXMuZHVyYXRpb25SZWw7XG4gICAgICBzZWdtZW50RHVyYXRpb24gKz0gdGhpcy5kdXJhdGlvbkFicztcblxuICAgICAgLy8gYWRkIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBzZWdtZW50IG9mZnNldFxuICAgICAgc2VnbWVudE9mZnNldCAqPSB0aGlzLm9mZnNldFJlbDtcbiAgICAgIHNlZ21lbnRPZmZzZXQgKz0gdGhpcy5vZmZzZXRBYnM7XG5cbiAgICAgIC8vIGFwcGx5IHNlZ21lbnQgb2Zmc2V0XG4gICAgICAvLyAgIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICAvLyAgIG9mZnNldCA8IDA6IHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uIGlzIHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGFuZCB0aGUgZHVyYXRpb24gaGFzIHRvIGJlIGNvcnJlY3RlZCBieSB0aGUgb2Zmc2V0XG4gICAgICBpZiAoc2VnbWVudE9mZnNldCA8IDApIHtcbiAgICAgICAgc2VnbWVudER1cmF0aW9uIC09IHNlZ21lbnRPZmZzZXQ7XG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiArPSBzZWdtZW50T2Zmc2V0O1xuICAgICAgICBzZWdtZW50VGltZSArPSAoc2VnbWVudE9mZnNldCAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlZ21lbnRUaW1lIC09IChzZWdtZW50T2Zmc2V0IC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfVxuXG4gICAgICAvLyByYW5kb21pemUgc2VnbWVudCBwb3NpdGlvblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25WYXIgPiAwKVxuICAgICAgICBzZWdtZW50UG9zaXRpb24gKz0gMi4wICogKE1hdGgucmFuZG9tKCkgLSAwLjUpICogdGhpcy5wb3NpdGlvblZhcjtcblxuICAgICAgLy8gc2hvcnRlbiBkdXJhdGlvbiBvZiBzZWdtZW50cyBvdmVyIHRoZSBlZGdlcyBvZiB0aGUgYnVmZmVyXG4gICAgICBpZiAoc2VnbWVudFBvc2l0aW9uIDwgMCkge1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gKz0gc2VnbWVudFBvc2l0aW9uO1xuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VnbWVudFBvc2l0aW9uICsgc2VnbWVudER1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gc2VnbWVudFBvc2l0aW9uO1xuXG4gICAgICAvLyBtYWtlIHNlZ21lbnRcbiAgICAgIGlmICh0aGlzLmdhaW4gPiAwICYmIHNlZ21lbnREdXJhdGlvbiA+IDApIHtcbiAgICAgICAgLy8gbWFrZSBzZWdtZW50IGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZSA9IHRoaXMucmVsZWFzZUFicyArIHRoaXMucmVsZWFzZVJlbCAqIHNlZ21lbnREdXJhdGlvbjtcblxuICAgICAgICBpZiAoYXR0YWNrICsgcmVsZWFzZSA+IHNlZ21lbnREdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBzZWdtZW50RHVyYXRpb24gLyAoYXR0YWNrICsgcmVsZWFzZSk7XG4gICAgICAgICAgYXR0YWNrICo9IGZhY3RvcjtcbiAgICAgICAgICByZWxlYXNlICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdHRhY2tFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBhdHRhY2s7XG4gICAgICAgIHZhciBzZWdtZW50RW5kVGltZSA9IHNlZ21lbnRUaW1lICsgc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZVN0YXJ0VGltZSA9IHNlZ21lbnRFbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5nYWluLCByZWxlYXNlU3RhcnRUaW1lKTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudEVuZFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChzZWdtZW50VGltZSwgc2VnbWVudFBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3Aoc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb24gLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlZ21lbnRQZXJpb2Q7XG4gIH1cbn1cbiIsIi8vIGNvcmVcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYXVkaW9Db250ZXh0IH0gZnJvbSAnLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUaW1lRW5naW5lIH0gZnJvbSAnLi9jb3JlL3RpbWUtZW5naW5lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXVkaW9UaW1lRW5naW5lIH0gZnJvbSAnLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuLy8gZW5naW5lc1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBHcmFudWxhckVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9ncmFudWxhci1lbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNZXRyb25vbWUgfSBmcm9tICcuL2VuZ2luZXMvbWV0cm9ub21lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxheWVyRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3BsYXllci1lbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWdtZW50RW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3NlZ21lbnQtZW5naW5lJztcblxuLy8gbWFzdGVyc1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQbGF5Q29udHJvbCB9IGZyb20gJy4vbWFzdGVycy9wbGF5LWNvbnRyb2wnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUcmFuc3BvcnQgfSBmcm9tICcuL21hc3RlcnMvdHJhbnNwb3J0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2NoZWR1bGVyIH0gZnJvbSAnLi9tYXN0ZXJzL3NjaGVkdWxlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNpbXBsZVNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9zaW1wbGUtc2NoZWR1bGVyJztcblxuLy8gdXRpbHNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUHJpb3JpdHlRdWV1ZSB9IGZyb20gJy4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTY2hlZHVsaW5nUXVldWUgfSBmcm9tICcuL3V0aWxzL3NjaGVkdWxpbmctcXVldWUnO1xuXG4vLyBmYWN0b3JpZXNcbmV4cG9ydCB7IGdldFNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9mYWN0b3JpZXMnO1xuZXhwb3J0IHsgZ2V0U2ltcGxlU2NoZWR1bGVyIH0gZnJvbSAnLi9tYXN0ZXJzL2ZhY3Rvcmllcyc7XG4iLCIvLyBzY2hlZHVsZXJzIHNob3VsZCBiZSBzaW5nbGV0b25zXG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcic7XG5pbXBvcnQgU2ltcGxlU2NoZWR1bGVyIGZyb20gJy4vc2ltcGxlLXNjaGVkdWxlcic7XG5cbmNvbnN0IHNjaGVkdWxlck1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBzaW1wbGVTY2hlZHVsZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xuXG4vLyBzY2hlZHVsZXIgZmFjdG9yeVxuZXhwb3J0IGNvbnN0IGdldFNjaGVkdWxlciA9IGZ1bmN0aW9uKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgbGV0IHNjaGVkdWxlciA9IHNjaGVkdWxlck1hcC5nZXQoYXVkaW9Db250ZXh0KTtcblxuICBpZiAoIXNjaGVkdWxlcikge1xuICAgIHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoeyBhdWRpb0NvbnRleHQ6IGF1ZGlvQ29udGV4dCB9KTtcbiAgICBzY2hlZHVsZXJNYXAuc2V0KGF1ZGlvQ29udGV4dCwgc2NoZWR1bGVyKTtcbiAgfVxuXG4gIHJldHVybiBzY2hlZHVsZXI7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2ltcGxlU2NoZWR1bGVyID0gZnVuY3Rpb24oYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2ltcGxlU2NoZWR1bGVyID0gc2ltcGxlU2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2ltcGxlU2NoZWR1bGVyKSB7XG4gICAgc2ltcGxlU2NoZWR1bGVyID0gbmV3IFNpbXBsZVNjaGVkdWxlcih7IGF1ZGlvQ29udGV4dDogYXVkaW9Db250ZXh0IH0pO1xuICAgIHNpbXBsZVNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzaW1wbGVTY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNpbXBsZVNjaGVkdWxlcjtcbn07XG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgU2NoZWR1bGluZ1F1ZXVlIGZyb20gJy4uL3V0aWxzL3NjaGVkdWxpbmctcXVldWUnO1xuaW1wb3J0IHsgZ2V0U2NoZWR1bGVyIH0gZnJvbSAnLi9mYWN0b3JpZXMnO1xuXG5jbGFzcyBMb29wQ29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLmxvd2VyID0gLUluZmluaXR5O1xuICAgIHRoaXMudXBwZXIgPSBJbmZpbml0eTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBzcGVlZCA9IHBsYXlDb250cm9sLnNwZWVkO1xuICAgIHZhciBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgdmFyIHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCBsb3dlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIpO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgdXBwZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICByZXNjaGVkdWxlKHNwZWVkKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBsb3dlciA9IE1hdGgubWluKHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuICAgIHZhciB1cHBlciA9IE1hdGgubWF4KHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMubG93ZXIgPSBsb3dlcjtcbiAgICB0aGlzLnVwcGVyID0gdXBwZXI7XG5cbiAgICBpZiAobG93ZXIgPT09IHVwcGVyKVxuICAgICAgc3BlZWQgPSAwO1xuXG4gICAgaWYgKHNwZWVkID4gMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIgLSAxZS02KSk7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlciArIDFlLTYpKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBhcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgdmFyIHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPj0gdXBwZXIpXG4gICAgICByZXR1cm4gbG93ZXIgKyAocG9zaXRpb24gLSBsb3dlcikgJSAodXBwZXIgLSBsb3dlcik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uIDwgbG93ZXIpXG4gICAgICByZXR1cm4gdXBwZXIgLSAodXBwZXIgLSBwb3NpdGlvbikgJSAodXBwZXIgLSBsb3dlcik7XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sbGVkIGJhc2UgY2xhc3NcbmNsYXNzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2Vlayk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG5cbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciBlbmdpbmVzIGltcGxlbWVudGluZyB0aGUgKnNwZWVkLWNvbnRyb2xsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIGVuZ2luZXMgaW1wbG1lbnRpbmcgdGhlICp0cmFuc3BvcnRlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2socGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCkge1xuICAgICAgICAvLyBjaGFuZ2Ugc3BlZWQgd2l0aG91dCByZXZlcnNpbmcgZGlyZWN0aW9uXG4gICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgICAgdmFyIHRpbWUgPSBwbGF5Q29udHJvbC5fX3N5bmMoKTtcblxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwbGF5Q29udHJvbC5fX3Bvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2suZGVzdHJveSgpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIHRpbWUgZW5naW5lcyBpbXBsZW1lbnRpbmcgdGhlICpzY2hlZHVsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcblxuICAgIC8vIHNjaGVkdWxpbmcgcXVldWUgYmVjb21lcyBtYXN0ZXIgb2YgZW5naW5lXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxpbmdRdWV1ZShwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChsYXN0U3BlZWQgPT09IDAgJiYgc3BlZWQgIT09IDApIC8vIHN0YXJ0IG9yIHNlZWtcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKCk7XG4gICAgZWxzZSBpZiAobGFzdFNwZWVkICE9PSAwICYmIHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUuZGVzdHJveSgpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyB0cmFuc2xhdGVzIHRyYW5zcG9ydGVkIGVuZ2luZSBhZHZhbmNlUG9zaXRpb24gaW50byBnbG9iYWwgc2NoZWR1bGVyIHRpbWVzXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fZW5naW5lO1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIHZhciBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHdoaWxlIChuZXh0VGltZSA8PSB0aW1lKSB7XG4gICAgICBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICAgIG5leHRUaW1lID0gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBpbnRlcm5hbCBzY2hlZHVsaW5nIHF1ZXVlIHRoYXQgcmV0dXJucyB0aGUgY3VycmVudCBwb3NpdGlvbiAoYW5kIHRpbWUpIG9mIHRoZSBwbGF5IGNvbnRyb2xcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuYWRkKGVuZ2luZSwgSW5maW5pdHkpO1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBtZXRhLWNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5Q29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihlbmdpbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IGRlZmF1bHRBdWRpb0NvbnRleHQ7XG4gICAgdGhpcy5fX3NjaGVkdWxlciA9IGdldFNjaGVkdWxlcih0aGlzLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuXG4gICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IEluZmluaXR5O1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZSlcbiAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcbiAgfVxuXG4gIF9fc2V0RW5naW5lKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNwZWVkQ29udHJvbGxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzVHJhbnNwb3J0ZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSk7XG4gICAgZWxzZSBpZiAoZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gcGxheSBjb250cm9sXCIpO1xuICB9XG5cbiAgX19yZXNldEVuZ2luZSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgdGltZSBmb3IgZ2l2ZW4gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHRpbWVcbiAgICovXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICB2YXIgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG5cbiAgc2V0KGVuZ2luZSA9IG51bGwpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCAhPT0gbnVsbCAmJiB0aGlzLl9fcGxheUNvbnRyb2xsZWQuX19lbmdpbmUgIT09IGVuZ2luZSkge1xuXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcmVzZXRFbmdpbmUoKTtcblxuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkID09PSBudWxsICYmIGVuZ2luZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKVxuICAgICAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldCBsb29wKGVuYWJsZSkge1xuICAgIGlmIChlbmFibGUgJiYgdGhpcy5fX2xvb3BTdGFydCA+IC1JbmZpbml0eSAmJiB0aGlzLl9fbG9vcEVuZCA8IEluZmluaXR5KSB7XG4gICAgICBpZiAoIXRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBuZXcgTG9vcENvbnRyb2wodGhpcyk7XG4gICAgICAgIHRoaXMuX19zY2hlZHVsZXIuYWRkKHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIHNldCBsb29wRW5kKGxvb3BFbmQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGxvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHBsYXlpbmdcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHRoaXMuX19wbGF5aW5nU3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlIHBsYXlpbmdcbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcGxheWluZ1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgICB0aGlzLnNlZWsoMCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkIHBsYXlpbmcgc3BlZWQgKG5vbi16ZXJvIHNwZWVkIGJldHdlZW4gLTE2IGFuZCAtMS8xNiBvciBiZXR3ZWVuIDEvMTYgYW5kIDE2KVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHJldHVybiBjdXJyZW50IHBsYXlpbmcgc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlpbmdTcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgKGp1bXAgdG8pIHBsYXlpbmcgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvdGltZS1lbmdpbmUnO1xuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGVyIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBJbmZpbml0eTtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCDCoDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgwqAwLjE7XG4gIH1cblxuICAvLyBzZXRUaW1lb3V0IHNjaGVkdWxpbmcgbG9vcFxuICBfX3RpY2soKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgbGV0IHRpbWUgPSB0aGlzLl9fbmV4dFRpbWU7XG5cbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICB3aGlsZSAodGltZSA8PSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZCkge1xuICAgICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgIHRpbWUgPSB0aGlzLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpIHtcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0KHRoaXMsIHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgaWYgKHRoaXMuX19uZXh0VGltZSA9PT0gSW5maW5pdHkpXG4gICAgICAgICAgY29uc29sZS5sb2coXCJTY2hlZHVsZXIgU3RhcnRcIik7XG5cbiAgICAgICAgY29uc3QgdGltZU91dERlbGF5ID0gTWF0aC5tYXgoKHRpbWUgLSB0aGlzLmxvb2thaGVhZCAtIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSwgdGhpcy5wZXJpb2QpO1xuXG4gICAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgICAgfSwgdGltZU91dERlbGF5ICogMTAwMCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19uZXh0VGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTY2hlZHVsZXIgU3RvcFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB9XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZVNjaGVkdWxlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3NjaGVkVGltZXMgPSBbXTtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fCAwLjE7XG4gIH1cblxuICBfX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLnB1c2godGltZSk7XG4gIH1cblxuICBfX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzW2luZGV4XSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgICB9XG4gIH1cblxuICBfX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBfX3Jlc2V0VGljaygpIHtcbiAgICBpZiAodGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIXRoaXMuX190aW1lb3V0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2ltcGxlU2NoZWR1bGVyIFN0YXJ0XCIpO1xuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiU2ltcGxlU2NoZWR1bGVyIFN0b3BcIik7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fdGljaygpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCkge1xuICAgICAgdmFyIGVuZ2luZSA9IHRoaXMuX19zY2hlZEVuZ2luZXNbaV07XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zY2hlZFRpbWVzW2ldO1xuXG4gICAgICB3aGlsZSAodGltZSAmJiB0aW1lIDw9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgICB0aW1lID0gZW5naW5lLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAmJiB0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaSsrXSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBlbmdpbmUgZnJvbSBzY2hlZHVsZXJcbiAgICAgICAgaWYgKCF0aW1lKSB7XG4gICAgICAgICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9LCB0aGlzLnBlcmlvZCAqIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKCkgeyBmdW4oKTsgfSwgLy8gbWFrZSBzdXIgdGhhdCB0aGUgYWR2YW5jZVRpbWUgbWV0aG9kIGRvZXMgbm90IHJldHVybSBhbnl0aGluZ1xuICAgIH0sIHRpbWUpO1xuICB9XG5cbiAgLy8gYWRkIGEgdGltZSBlbmdpbmUgdG8gdGhlIHF1ZXVlIGFuZCByZXR1cm4gdGhlIGVuZ2luZVxuICBhZGQoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSwgZ2V0Q3VycmVudFBvc2l0aW9uID0gbnVsbCkge1xuICAgIGlmICghZW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIC8vIHNldCBtYXN0ZXIgYW5kIGFkZCB0byBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmVzLmFkZChlbmdpbmUpO1xuXG4gICAgLy8gc2NoZWR1bGUgZW5naW5lXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuXG4gICAgcmV0dXJuIGVuZ2luZTtcbiAgfVxuXG4gIHJlbW92ZShlbmdpbmUpIHtcbiAgICBpZiAoIWVuZ2luZS5tYXN0ZXIgfHwgZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImVuZ2luZSBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICAvLyByZXNldCBtYXN0ZXIgYW5kIHJlbW92ZSBmcm9tIGFycmF5XG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG5cbiAgICAvLyB1bnNjaGVkdWxlIGVuZ2luZVxuICAgIHRoaXMuX191bnNjaGVkdWxlRW5naW5lKGVuZ2luZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVUaW1lKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICB0aGlzLl9fcmVzY2hlZHVsZUVuZ2luZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMuX19yZXNldFRpY2soKTtcbiAgfVxuXG4gIC8vIGNoZWNrIHdoZXRoZXIgYSBnaXZlbiBlbmdpbmUgaXMgc2NoZWR1bGVkXG4gIGhhcyhlbmdpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5fX2VuZ2luZXMuaGFzKGVuZ2luZSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9fdGltZW91dCk7XG4gICAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPSAwO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiIsImltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4uL2NvcmUvYXVkaW8tY29udGV4dCc7XG5pbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL3RpbWUtZW5naW5lJztcbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCBTY2hlZHVsaW5nUXVldWUgZnJvbSAnLi4vdXRpbHMvc2NoZWR1bGluZy1xdWV1ZSc7XG5pbXBvcnQgeyBnZXRTY2hlZHVsZXIgfSBmcm9tICcuL2ZhY3Rvcmllcyc7XG5cblxuZnVuY3Rpb24gYWRkRHVwbGV0KGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBmaXJzdEVsZW1lbnQsIHNlY29uZEVsZW1lbnQpIHtcbiAgZmlyc3RBcnJheS5wdXNoKGZpcnN0RWxlbWVudCk7XG4gIHNlY29uZEFycmF5LnB1c2goc2Vjb25kRWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUR1cGxldChmaXJzdEFycmF5LCBzZWNvbmRBcnJheSwgZmlyc3RFbGVtZW50KSB7XG4gIHZhciBpbmRleCA9IGZpcnN0QXJyYXkuaW5kZXhPZihmaXJzdEVsZW1lbnQpO1xuXG4gIGlmIChpbmRleCA+PSAwKSB7XG4gICAgdmFyIHNlY29uZEVsZW1lbnQgPSBzZWNvbmRBcnJheVtpbmRleF07XG5cbiAgICBmaXJzdEFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgc2Vjb25kQXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHJldHVybiBzZWNvbmRFbGVtZW50O1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8vIFRoZSBUcmFuc3BvcnRlZCBjYWxsIGlzIHRoZSBiYXNlIGNsYXNzIG9mIHRoZSBhZGFwdGVycyBiZXR3ZWVuXG4vLyBkaWZmZXJlbnQgdHlwZXMgb2YgZW5naW5lcyAoaS5lLiB0cmFuc3BvcnRlZCwgc2NoZWR1bGVkLCBwbGF5LWNvbnRyb2xsZWQpXG4vLyBUaGUgYWRhcHRlcnMgYXJlIGF0IHRoZSBzYW1lIHRpbWUgbWFzdGVycyBmb3IgdGhlIGVuZ2luZXMgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuLy8gYW5kIHRyYW5zcG9ydGVkIFRpbWVFbmdpbmVzIGluc2VydGVkIGludG8gdGhlIHRyYW5zcG9ydCdzIHBvc2l0aW9uLWJhc2VkIHByaXRvcml0eSBxdWV1ZS5cbmNsYXNzIFRyYW5zcG9ydGVkIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydCwgZHVyYXRpb24sIG9mZnNldCwgc3RyZXRjaCA9IDEpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubWFzdGVyID0gdHJhbnNwb3J0O1xuXG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcblxuICAgIHRoaXMuX19zdGFydFBvc2l0aW9uID0gc3RhcnQ7XG4gICAgdGhpcy5fX2VuZFBvc2l0aW9uID0gIWlzRmluaXRlKGR1cmF0aW9uKSA/IEluZmluaXR5IDogc3RhcnQgKyBkdXJhdGlvbjtcbiAgICB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gPSBzdGFydCArIG9mZnNldDtcbiAgICB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uID0gc3RyZXRjaDtcbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7IC8vIGVuZ2luZSdzIG5leHQgaGFsdCBwb3NpdGlvbiB3aGVuIG5vdCBydW5uaW5nIChpcyBudWxsIHdoZW4gZW5naW5lIGhlcyBiZWVuIHN0YXJ0ZWQpXG4gICAgLy8gY29uc29sZS5sb2codGhpcy5fX3N0YXJ0UG9zaXRpb24sIHRoaXMuX19lbmRQb3NpdGlvbiwgdGhpcy5fX29mZnNldFBvc2l0aW9uLCB0aGlzLl9fc3RyZXRjaFBvc2l0aW9uKVxuICB9XG5cbiAgc2V0Qm91bmRhcmllcyhzdGFydCwgZHVyYXRpb24sIG9mZnNldCA9IDAsIHN0cmV0Y2ggPSAxKSB7XG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydDtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSBzdGFydCArIGR1cmF0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IHN0YXJ0ICsgb2Zmc2V0O1xuICAgIHRoaXMuX19zdHJldGNoUG9zaXRpb24gPSBzdHJldGNoO1xuICAgIHRoaXMucmVzZXRQb3NpdGlvbigpO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7fVxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7fVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXN0ZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG4gIH1cblxuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLm1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uKHRoaXMsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPCB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuXG4gICAgICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IHRoaXMuX19lbmRQb3NpdGlvbjtcblxuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uIDw9IHRoaXMuX19lbmRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7IC8vIGVuZ2luZSBpcyBhY3RpdmVcblxuICAgICAgICByZXR1cm4gdGhpcy5fX2VuZFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocG9zaXRpb24gPj0gdGhpcy5fX2VuZFBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IHRoaXMuX19zdGFydFBvc2l0aW9uO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID4gdGhpcy5fX3N0YXJ0UG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBudWxsOyAvLyBlbmdpbmUgaXMgYWN0aXZlXG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19zdGFydFBvc2l0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB2YXIgaGFsdFBvc2l0aW9uID0gdGhpcy5fX2hhbHRQb3NpdGlvbjtcblxuICAgIGlmIChoYWx0UG9zaXRpb24gIT09IG51bGwpIHtcbiAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7XG5cbiAgICAgIHJldHVybiBoYWx0UG9zaXRpb247XG4gICAgfVxuXG4gICAgLy8gc3RvcCBlbmdpbmVcbiAgICBpZiAodGhpcy5fX2hhbHRQb3NpdGlvbiA9PT0gbnVsbClcbiAgICAgIHRoaXMuc3RvcCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbik7XG5cbiAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gSW5maW5pdHk7XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHNwZWVkID09PSAwKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5tYXN0ZXIgPSBudWxsO1xuXG4gICAgdGhpcy5fX2VuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1heChwb3NpdGlvbiwgdGhpcy5fX3N0YXJ0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHBvc2l0aW9uID0gTWF0aC5taW4ocG9zaXRpb24sIHRoaXMuX19lbmRQb3NpdGlvbik7XG5cbiAgICByZXR1cm4gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBwb3NpdGlvbiA9IHRoaXMuX19vZmZzZXRQb3NpdGlvbiArIHRoaXMuX19lbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICBpZiAoc3BlZWQgPiAwICYmIHBvc2l0aW9uIDwgdGhpcy5fX2VuZFBvc2l0aW9uIHx8IHNwZWVkIDwgMCAmJiBwb3NpdGlvbiA+PSB0aGlzLl9fc3RhcnRQb3NpdGlvbilcbiAgICAgIHJldHVybiBwb3NpdGlvbjtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbihlbmdpbmUsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBwb3NpdGlvbiArPSB0aGlzLl9fb2Zmc2V0UG9zaXRpb247XG5cbiAgICB0aGlzLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG59XG5cbi8vIFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkXG4vLyBoYXMgdG8gc3RhcnQgYW5kIHN0b3AgdGhlIHNwZWVkLWNvbnRyb2xsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgdHJ1ZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKSAvLyBlbmdpbmUgaXMgYWN0aXZlXG4gICAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aGlzLm1hc3Rlci5jdXJyZW50VGltZSwgdGhpcy5tYXN0ZXIuY3VycmVudFBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCAwKTtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTY2hlZHVsZWRcbi8vIGhhcyB0byBzd2l0Y2ggb24gYW5kIG9mZiB0aGUgc2NoZWR1bGVkIGVuZ2luZXMgd2hlbiB0aGUgdHJhbnNwb3J0IGhpdHMgdGhlIGVuZ2luZSdzIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25cbmNsYXNzIFRyYW5zcG9ydGVkU2NoZWR1bGVkIGV4dGVuZHMgVHJhbnNwb3J0ZWQge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKSB7XG4gICAgc3VwZXIodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG5cbiAgICAvLyBzY2hlZHVsaW5nIHF1ZXVlIGJlY29tZXMgbWFzdGVyIG9mIGVuZ2luZVxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxpbmdRdWV1ZS5hZGQoZW5naW5lLCBJbmZpbml0eSk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgdGltZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIHBvc2l0aW9uKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVzZXRFbmdpbmVUaW1lKHRoaXMuX19lbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5tYXN0ZXIuX19zY2hlZHVsaW5nUXVldWUucmVtb3ZlKHRoaXMuX19lbmdpbmUpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyB0cmFuc2xhdGVzIGFkdmFuY2VQb3NpdGlvbiBvZiAqdHJhbnNwb3J0ZWQqIGVuZ2luZXMgaW50byBnbG9iYWwgc2NoZWR1bGVyIHRpbWVzXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHRoaXMuX19uZXh0VGltZSA9IEluZmluaXR5O1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNjaGVkdWxlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uO1xuICAgIHZhciBzcGVlZCA9IHRyYW5zcG9ydC5fX3NwZWVkO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0cmFuc3BvcnQuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgdmFyIG5leHRUaW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHdoaWxlIChuZXh0VGltZSA8PSB0aW1lKSB7XG4gICAgICBuZXh0UG9zaXRpb24gPSB0cmFuc3BvcnQuYWR2YW5jZVBvc2l0aW9uKG5leHRUaW1lLCBuZXh0UG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIG5leHRUaW1lID0gdHJhbnNwb3J0Ll9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gbmV4dFBvc2l0aW9uO1xuICAgIHRoaXMuX19uZXh0VGltZSA9IG5leHRUaW1lO1xuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24gPSB0aGlzLl9fbmV4dFBvc2l0aW9uKSB7XG4gICAgdmFyIHRyYW5zcG9ydCA9IHRoaXMuX190cmFuc3BvcnQ7XG4gICAgdmFyIHRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbik7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB0aGlzLnJlc2V0VGltZSh0aW1lKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3RyYW5zcG9ydC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IG51bGw7XG4gIH1cbn1cblxuLy8gaW50ZXJuYWwgc2NoZWR1bGluZyBxdWV1ZSB0aGF0IHJldHVybnMgdGhlIGN1cnJlbnQgcG9zaXRpb24gKGFuZCB0aW1lKSBvZiB0aGUgcGxheSBjb250cm9sXG5jbGFzcyBUcmFuc3BvcnRTY2hlZHVsaW5nUXVldWUgZXh0ZW5kcyBTY2hlZHVsaW5nUXVldWUge1xuICBjb25zdHJ1Y3Rvcih0cmFuc3BvcnQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3RyYW5zcG9ydCA9IHRyYW5zcG9ydDtcbiAgICB0cmFuc3BvcnQuX19zY2hlZHVsZXIuYWRkKHRoaXMsIEluZmluaXR5KTtcbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX190cmFuc3BvcnQuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFRyYW5zcG9ydCBjbGFzc1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmFuc3BvcnQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgZGVmYXVsdEF1ZGlvQ29udGV4dDtcblxuICAgIHRoaXMuX19lbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkID0gW107XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyKHRoaXMuYXVkaW9Db250ZXh0KTtcbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBUcmFuc3BvcnRTY2hlZHVsZXJIb29rKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fc2NoZWR1bGluZ1F1ZXVlID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxpbmdRdWV1ZSh0aGlzKTtcblxuICAgIC8vIHN5bmNyb25pemVkIHRpbWUsIHBvc2l0aW9uLCBhbmQgc3BlZWRcbiAgICB0aGlzLl9fdGltZSA9IDA7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gMDtcbiAgICB0aGlzLl9fc3BlZWQgPSAwO1xuICB9XG5cbiAgX19nZXRUaW1lQXRQb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLl9fdGltZSArIChwb3NpdGlvbiAtIHRoaXMuX19wb3NpdGlvbikgLyB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX2dldFBvc2l0aW9uQXRUaW1lKHRpbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBudW1UcmFuc3BvcnRlZEVuZ2luZXMgPSB0aGlzLl9fdHJhbnNwb3J0ZWQubGVuZ3RoO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIGlmIChudW1UcmFuc3BvcnRlZEVuZ2luZXMgPiAwKSB7XG4gICAgICB2YXIgZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb247XG5cbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmNsZWFyKCk7XG4gICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZXZlcnNlID0gKHNwZWVkIDwgMCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBudW1UcmFuc3BvcnRlZEVuZ2luZXMgLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFtpXTtcbiAgICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgICB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQoZW5naW5lLCBuZXh0RW5naW5lUG9zaXRpb24sIGZhbHNlKTsgLy8gaW5zZXJ0IGJ1dCBkb24ndCBzb3J0XG4gICAgICB9XG5cbiAgICAgIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFswXTtcbiAgICAgIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbiwgdHJ1ZSk7IC8vIGluc2VydCBhbmQgc29ydFxuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICBfX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgYWRkZWQgdG8gYSBtYXN0ZXIgKGkuZS4gdHJhbnNwb3J0IG9yIHBsYXktY29udHJvbCkuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5fX3Bvc2l0aW9uICsgKHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWUgLSB0aGlzLl9fdGltZSkgKiB0aGlzLl9fc3BlZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG5leHQgdHJhbnNwb3J0IHBvc2l0aW9uXG4gICAqL1xuICByZXNldFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24ocG9zaXRpb24pO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fc3BlZWQgPSBzcGVlZDtcblxuICAgIHJldHVybiB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICAvLyBjb25zb2xlLmxvZyh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS50aW1lO1xuXG4gICAgd2hpbGUgKG5leHRQb3NpdGlvbiA9PT0gcG9zaXRpb24pIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5oZWFkO1xuICAgICAgdmFyIG5leHRFbmdpbmVQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgaWYgKCgoc3BlZWQgPiAwICYmIG5leHRFbmdpbmVQb3NpdGlvbiA+IHBvc2l0aW9uKSB8fCAoc3BlZWQgPCAwICYmIG5leHRFbmdpbmVQb3NpdGlvbiA8IHBvc2l0aW9uKSkgJiZcbiAgICAgICAgKG5leHRFbmdpbmVQb3NpdGlvbiA8IEluZmluaXR5ICYmIG5leHRFbmdpbmVQb3NpdGlvbiA+IC1JbmZpbml0eSkpIHtcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUoZW5naW5lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dFBvc2l0aW9uO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgKHNlZWsgJiYgc3BlZWQgIT09IDApKSB7XG4gICAgICB2YXIgbmV4dFBvc2l0aW9uO1xuXG4gICAgICAvLyByZXN5bmMgdHJhbnNwb3J0ZWQgZW5naW5lc1xuICAgICAgaWYgKHNlZWsgfHwgc3BlZWQgKiBsYXN0U3BlZWQgPCAwKSB7XG4gICAgICAgIC8vIHNlZWsgb3IgcmV2ZXJzZSBkaXJlY3Rpb25cbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdGFydFxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNoYW5nZSBzcGVlZCB3aXRob3V0IHJldmVyc2luZyBkaXJlY3Rpb25cbiAgICAgICAgdGhpcy5fX3N5bmNUcmFuc3BvcnRlZFNwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbmdpbmUgZW5naW5lIHRvIGJlIGFkZGVkIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHN0YXJ0IHBvc2l0aW9uXG4gICAqL1xuICBhZGQoZW5naW5lLCBzdGFydFBvc2l0aW9uID0gMCwgZW5kUG9zaXRpb24gPSBJbmZpbml0eSwgb2Zmc2V0UG9zaXRpb24gPSAwKSB7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gbnVsbDtcblxuICAgIGlmIChvZmZzZXRQb3NpdGlvbiA9PT0gLUluZmluaXR5KVxuICAgICAgb2Zmc2V0UG9zaXRpb24gPSAwO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIGlmIChlbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKCkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChlbmdpbmUuaW1wbGVtZW50c1NwZWVkQ29udHJvbGxlZCgpKVxuICAgICAgdHJhbnNwb3J0ZWQgPSBuZXcgVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICAgIGVsc2UgaWYgKGVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKCkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbik7XG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBhIHRyYW5zcG9ydFwiKTtcblxuICAgIGlmICh0cmFuc3BvcnRlZCkge1xuICAgICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgICBhZGREdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lLCB0cmFuc3BvcnRlZCk7XG5cbiAgICAgIGlmIChzcGVlZCAhPT0gMCkge1xuICAgICAgICAvLyBzeW5jIGFuZCBzdGFydFxuICAgICAgICB2YXIgbmV4dEVuZ2luZVBvc2l0aW9uID0gdHJhbnNwb3J0ZWQuc3luY1Bvc2l0aW9uKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5pbnNlcnQodHJhbnNwb3J0ZWQsIG5leHRFbmdpbmVQb3NpdGlvbik7XG5cbiAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyYW5zcG9ydGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhIHRpbWUgZW5naW5lIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge29iamVjdH0gZW5naW5lT3JUcmFuc3BvcnRlZCBlbmdpbmUgb3IgdHJhbnNwb3J0ZWQgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIHJlbW92ZShlbmdpbmVPclRyYW5zcG9ydGVkKSB7XG4gICAgdmFyIGVuZ2luZSA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgdmFyIHRyYW5zcG9ydGVkID0gcmVtb3ZlRHVwbGV0KHRoaXMuX19lbmdpbmVzLCB0aGlzLl9fdHJhbnNwb3J0ZWQsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuXG4gICAgaWYgKCF0cmFuc3BvcnRlZCkge1xuICAgICAgZW5naW5lID0gcmVtb3ZlRHVwbGV0KHRoaXMuX190cmFuc3BvcnRlZCwgdGhpcy5fX2VuZ2luZXMsIGVuZ2luZU9yVHJhbnNwb3J0ZWQpO1xuICAgICAgdHJhbnNwb3J0ZWQgPSBlbmdpbmVPclRyYW5zcG9ydGVkO1xuICAgIH1cblxuICAgIGlmIChlbmdpbmUgJiYgdHJhbnNwb3J0ZWQpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5yZW1vdmUodHJhbnNwb3J0ZWQpO1xuXG4gICAgICB0cmFuc3BvcnRlZC5kZXN0cm95KCk7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgdHJhbnNwb3J0XCIpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0RW5naW5lUG9zaXRpb24odHJhbnNwb3J0ZWQsIHBvc2l0aW9uID0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZClcbiAgICAgICAgcG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLm1vdmUodHJhbnNwb3J0ZWQsIHBvc2l0aW9uKTtcbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYWxsIHRpbWUgZW5naW5lcyBmcm9tIHRoZSB0cmFuc3BvcnRcbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuc3luY1NwZWVkKHRoaXMuY3VycmVudFRpbWUsIHRoaXMuY3VycmVudFBvc2l0aW9uLCAwKTtcblxuICAgIGZvciAodmFyIHRyYW5zcG9ydGVkIG9mIHRoaXMuX190cmFuc3BvcnRlZClcbiAgICAgIHRyYW5zcG9ydGVkLmRlc3Ryb3koKTtcbiAgfVxufVxuIiwiLyogd3JpdHRlbiBpbiBFQ01Bc2NyaXB0IDYgKi9cbi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIGF1ZGlvIHByaW9yaXR5IHF1ZXVlIHVzZWQgYnkgc2NoZWR1bGVyIGFuZCB0cmFuc3BvcnRzXG4gKiBAYXV0aG9yIE5vcmJlcnQgU2NobmVsbCA8Tm9yYmVydC5TY2huZWxsQGlyY2FtLmZyPlxuICpcbiAqIEZpcnN0IHJhdGhlciBzdHVwaWQgaW1wbGVtZW50YXRpb24gdG8gYmUgb3B0aW1pemVkLi4uXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJpb3JpdHlRdWV1ZSB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fX29iamVjdHMgPSBbXTtcbiAgICB0aGlzLnJldmVyc2UgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiAgR2V0IHRoZSBpbmRleCBvZiBhbiBvYmplY3QgaW4gdGhlIG9iamVjdCBsaXN0XG4gICAqL1xuICBfX29iamVjdEluZGV4KG9iamVjdCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fX29iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChvYmplY3QgPT09IHRoaXMuX19vYmplY3RzW2ldWzBdKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICAvKipcbiAgICogV2l0aGRyYXcgYW4gb2JqZWN0IGZyb20gdGhlIG9iamVjdCBsaXN0XG4gICAqL1xuICBfX3JlbW92ZU9iamVjdChvYmplY3QpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9fb2JqZWN0SW5kZXgob2JqZWN0KTtcblxuICAgIGlmIChpbmRleCA+PSAwKVxuICAgICAgdGhpcy5fX29iamVjdHMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIGlmICh0aGlzLl9fb2JqZWN0cy5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIF9fc29ydE9iamVjdHMoKSB7XG4gICAgaWYgKCF0aGlzLnJldmVyc2UpXG4gICAgICB0aGlzLl9fb2JqZWN0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGFbMV0gLSBiWzFdO1xuICAgICAgfSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5fX29iamVjdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBiWzFdIC0gYVsxXTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCBhbiBvYmplY3QgdG8gdGhlIHF1ZXVlXG4gICAqIChmb3IgdGhpcyBwcmltaXRpdmUgdmVyc2lvbjogcHJldmVudCBzb3J0aW5nIGZvciBlYWNoIGVsZW1lbnQgYnkgY2FsbGluZyB3aXRoIFwiZmFsc2VcIiBhcyB0aGlyZCBhcmd1bWVudClcbiAgICovXG4gIGluc2VydChvYmplY3QsIHRpbWUsIHNvcnQgPSB0cnVlKSB7XG4gICAgaWYgKHRpbWUgIT09IEluZmluaXR5ICYmIHRpbWUgIT0gLUluZmluaXR5KSB7XG4gICAgICAvLyBhZGQgbmV3IG9iamVjdFxuICAgICAgdGhpcy5fX29iamVjdHMucHVzaChbb2JqZWN0LCB0aW1lXSk7XG5cbiAgICAgIGlmIChzb3J0KVxuICAgICAgICB0aGlzLl9fc29ydE9iamVjdHMoKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdOyAvLyByZXR1cm4gdGltZSBvZiBmaXJzdCBvYmplY3RcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fX3JlbW92ZU9iamVjdChvYmplY3QpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgYW4gb2JqZWN0IHRvIGFub3RoZXIgdGltZSBpbiB0aGUgcXVldWVcbiAgICovXG4gIG1vdmUob2JqZWN0LCB0aW1lKSB7XG4gICAgaWYgKHRpbWUgIT09IEluZmluaXR5ICYmIHRpbWUgIT0gLUluZmluaXR5KSB7XG5cbiAgICAgIHZhciBpbmRleCA9IHRoaXMuX19vYmplY3RJbmRleChvYmplY3QpO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICB0aGlzLl9fb2JqZWN0cy5wdXNoKFtvYmplY3QsIHRpbWVdKTsgLy8gYWRkIG5ldyBvYmplY3RcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5fX29iamVjdHNbaW5kZXhdWzFdID0gdGltZTsgLy8gdXBkYXRlIHRpbWUgb2YgZXhpc3Rpbmcgb2JqZWN0XG5cbiAgICAgIHRoaXMuX19zb3J0T2JqZWN0cygpO1xuXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07IC8vIHJldHVybiB0aW1lIG9mIGZpcnN0IG9iamVjdFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fcmVtb3ZlT2JqZWN0KG9iamVjdCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIG9iamVjdCBmcm9tIHRoZSBxdWV1ZVxuICAgKi9cbiAgcmVtb3ZlKG9iamVjdCkge1xuICAgIHJldHVybiB0aGlzLl9fcmVtb3ZlT2JqZWN0KG9iamVjdCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXIgcXVldWVcbiAgICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX19vYmplY3RzLmxlbmd0aCA9IDA7IC8vIGNsZWFyIG9iamVjdCBsaXN0XG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBmaXJzdCBvYmplY3QgaW4gcXVldWVcbiAgICovXG4gIGdldCBoZWFkKCkge1xuICAgIGlmICh0aGlzLl9fb2JqZWN0cy5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzBdO1xuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRpbWUgb2YgZmlyc3Qgb2JqZWN0IGluIHF1ZXVlXG4gICAqL1xuICBnZXQgdGltZSgpIHtcbiAgICBpZiAodGhpcy5fX29iamVjdHMubGVuZ3RoID4gMClcbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxufVxuIiwiLyoqXG4gKiBTY2hlZHVsaW5nUXVldWUgYmFzZSBjbGFzc1xuICogaHR0cDovL3dhdmVzanMuZ2l0aHViLmlvL2F1ZGlvLyNhdWRpby1zY2hlZHVsaW5nLXF1ZXVlXG4gKlxuICogTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyXG4gKiBDb3B5cmlnaHQgMjAxNCwgMjAxNSBJUkNBTSDigJPCoENlbnRyZSBQb21waWRvdVxuICovXG5cbmltcG9ydCBQcmlvcml0eVF1ZXVlIGZyb20gJy4uL3V0aWxzL3ByaW9yaXR5LXF1ZXVlJztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvdGltZS1lbmdpbmUnO1xuaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcblxuLyoqXG4gKiBAY2xhc3MgU2NoZWR1bGluZ1F1ZXVlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fX3F1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUoKTtcbiAgICB0aGlzLl9fZW5naW5lcyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgJ3NjaGVkdWxlZCcgaW50ZXJmYWNlXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUudGltZTtcblxuICAgIHdoaWxlIChuZXh0VGltZSA8PSB0aW1lKSB7XG4gICAgICB2YXIgZW5naW5lID0gdGhpcy5fX3F1ZXVlLmhlYWQ7XG4gICAgICB2YXIgbmV4dEVuZ2luZVRpbWUgPSBlbmdpbmUuYWR2YW5jZVRpbWUodGltZSk7XG5cbiAgICAgIGlmICghbmV4dEVuZ2luZVRpbWUpIHtcbiAgICAgICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgICAgIHRoaXMuX19lbmdpbmVzLmRlbGV0ZShlbmdpbmUpO1xuICAgICAgICBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5yZW1vdmUoZW5naW5lKTtcbiAgICAgIH0gZWxzZSBpZiAobmV4dEVuZ2luZVRpbWUgPiB0aW1lICYmIG5leHRFbmdpbmVUaW1lIDw9IEluZmluaXR5KSB7XG4gICAgICAgIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLm1vdmUoZW5naW5lLCBuZXh0RW5naW5lVGltZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2VuZ2luZSBkaWQgbm90IGFkdmFuY2UgdGltZScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXh0VGltZTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWFzdGVyIG1ldGhvZCB0byBiZSBpbXBsZW1lbnRlZCBieSBkZXJpdmVkIGNsYXNzXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIGNhbGwgYSBmdW5jdGlvbiBhdCBhIGdpdmVuIHRpbWVcbiAgZGVmZXIoZnVuLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICghKGZ1biBpbnN0YW5jZW9mIEZ1bmN0aW9uKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgZGVmZXJlZCBieSBzY2hlZHVsZXJcIik7XG5cbiAgICB0aGlzLmFkZCh7XG4gICAgICBhZHZhbmNlVGltZTogZnVuY3Rpb24oKSB7IGZ1bigpOyB9LCAvLyBtYWtlIHN1ciB0aGF0IHRoZSBhZHZhbmNlVGltZSBtZXRob2QgZG9lcyBub3QgcmV0dXJtIGFueXRoaW5nXG4gICAgfSwgdGltZSk7XG4gIH1cblxuICAvLyBhZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgcXVldWUgYW5kIHJldHVybiB0aGUgZW5naW5lXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCFlbmdpbmUuaW1wbGVtZW50c1NjaGVkdWxlZCgpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBhZGRlZCB0byBzY2hlZHVsZXJcIik7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG5cbiAgICAvLyBhZGQgdG8gZW5naW5lcyBhbmQgcXVldWVcbiAgICB0aGlzLl9fZW5naW5lcy5hZGQoZW5naW5lKTtcbiAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUuaW5zZXJ0KGVuZ2luZSwgdGltZSk7XG5cbiAgICAvLyByZXNjaGVkdWxlIHF1ZXVlXG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gcmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgcXVldWVcbiAgcmVtb3ZlKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIGVuZ2luZS5tYXN0ZXIgPSBudWxsO1xuXG4gICAgLy8gcmVtb3ZlIGZyb20gYXJyYXkgYW5kIHF1ZXVlXG4gICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgdmFyIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLnJlbW92ZShlbmdpbmUpO1xuXG4gICAgLy8gcmVzY2hlZHVsZSBxdWV1ZVxuICAgIHRoaXMucmVzZXRUaW1lKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8vIHJlc2V0IG5leHQgZW5naW5lIHRpbWVcbiAgcmVzZXRFbmdpbmVUaW1lKGVuZ2luZSwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoZW5naW5lLm1hc3RlciAhPT0gdGhpcylcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyBzY2hlZHVsZXJcIik7XG5cbiAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUubW92ZShlbmdpbmUsIHRpbWUpO1xuICAgIHRoaXMucmVzZXRUaW1lKG5leHRUaW1lKTtcbiAgfVxuXG4gIC8vIGNoZWNrIHdoZXRoZXIgYSBnaXZlbiBlbmdpbmUgaXMgc2NoZWR1bGVkXG4gIGhhcyhlbmdpbmUpIHtcbiAgICByZXR1cm4gdGhpcy5fX2VuZ2luZXMuaGFzKGVuZ2luZSk7XG4gIH1cblxuICAvLyBjbGVhciBxdWV1ZVxuICBjbGVhcigpIHtcbiAgICB0aGlzLl9fcXVldWUuY2xlYXIoKTtcbiAgICB0aGlzLl9fZW5naW5lcy5jbGVhcjtcbiAgICB0aGlzLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9nZXQtaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1wcm90b3R5cGUtb2ZcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc2V0XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vd2Vhay1tYXBcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIik7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGVmaW5lUHJvcGVydHkpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgKDAsIF9kZWZpbmVQcm9wZXJ0eTIuZGVmYXVsdCkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfZ2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKTtcblxudmFyIF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgdmFyIGRlc2MgPSAoMCwgX2dldE93blByb3BlcnR5RGVzY3JpcHRvcjIuZGVmYXVsdCkob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSAoMCwgX2dldFByb3RvdHlwZU9mMi5kZWZhdWx0KShvYmplY3QpO1xuXG4gICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gIH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpO1xuXG52YXIgX3NldFByb3RvdHlwZU9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NldFByb3RvdHlwZU9mKTtcblxudmFyIF9jcmVhdGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9jcmVhdGVcIik7XG5cbnZhciBfY3JlYXRlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZSk7XG5cbnZhciBfdHlwZW9mMiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpO1xuXG52YXIgX3R5cGVvZjMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90eXBlb2YyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArICh0eXBlb2Ygc3VwZXJDbGFzcyA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiAoMCwgX3R5cGVvZjMuZGVmYXVsdCkoc3VwZXJDbGFzcykpKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9ICgwLCBfY3JlYXRlMi5kZWZhdWx0KShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mMi5kZWZhdWx0ID8gKDAsIF9zZXRQcm90b3R5cGVPZjIuZGVmYXVsdCkoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfdHlwZW9mMiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpO1xuXG52YXIgX3R5cGVvZjMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90eXBlb2YyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKCh0eXBlb2YgY2FsbCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiAoMCwgX3R5cGVvZjMuZGVmYXVsdCkoY2FsbCkpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2l0ZXJhdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2wvaXRlcmF0b3JcIik7XG5cbnZhciBfaXRlcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXRlcmF0b3IpO1xuXG52YXIgX3N5bWJvbCA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sXCIpO1xuXG52YXIgX3N5bWJvbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zeW1ib2wpO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIF9pdGVyYXRvcjIuZGVmYXVsdCA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IF9zeW1ib2wyLmRlZmF1bHQgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBfdHlwZW9mKF9pdGVyYXRvcjIuZGVmYXVsdCkgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn0gOiBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IF9zeW1ib2wyLmRlZmF1bHQgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKG9iaik7XG59OyIsInJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3InKTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuY3JlYXRlJyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZShQLCBEKXtcbiAgcmV0dXJuICRPYmplY3QuY3JlYXRlKFAsIEQpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2Mpe1xuICByZXR1cm4gJE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKTtcbn07IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyICRPYmplY3QgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHJldHVybiAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KTtcbn07IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1wcm90b3R5cGUtb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC5nZXRQcm90b3R5cGVPZjsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LnNldFByb3RvdHlwZU9mOyIsInJlcXVpcmUoJy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zZXQnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5TZXQ7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5TeW1ib2w7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fd2tzJykoJ2l0ZXJhdG9yJyk7IiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi53ZWFrLW1hcCcpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL19jb3JlJykuV2Vha01hcDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUsIGZvcmJpZGRlbkZpZWxkKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB8fCAoZm9yYmlkZGVuRmllbGQgIT09IHVuZGVmaW5lZCAmJiBmb3JiaWRkZW5GaWVsZCBpbiBpdCkpe1xuICAgIHRocm93IFR5cGVFcnJvcihuYW1lICsgJzogaW5jb3JyZWN0IGludm9jYXRpb24hJyk7XG4gIH0gcmV0dXJuIGl0O1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgZm9yT2YgPSByZXF1aXJlKCcuL19mb3Itb2YnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyLCBJVEVSQVRPUil7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yT2YoaXRlciwgZmFsc2UsIHJlc3VsdC5wdXNoLCByZXN1bHQsIElURVJBVE9SKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIHRvTGVuZ3RoICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgdG9JbmRleCAgID0gcmVxdWlyZSgnLi9fdG8taW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oSVNfSU5DTFVERVMpe1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGVsLCBmcm9tSW5kZXgpe1xuICAgIHZhciBPICAgICAgPSB0b0lPYmplY3QoJHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxuICAgICAgLCB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjdG9JbmRleCBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pe1xuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59OyIsIi8vIDAgLT4gQXJyYXkjZm9yRWFjaFxuLy8gMSAtPiBBcnJheSNtYXBcbi8vIDIgLT4gQXJyYXkjZmlsdGVyXG4vLyAzIC0+IEFycmF5I3NvbWVcbi8vIDQgLT4gQXJyYXkjZXZlcnlcbi8vIDUgLT4gQXJyYXkjZmluZFxuLy8gNiAtPiBBcnJheSNmaW5kSW5kZXhcbnZhciBjdHggICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgSU9iamVjdCAgPSByZXF1aXJlKCcuL19pb2JqZWN0JylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXG4gICwgdG9MZW5ndGggPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIGFzYyAgICAgID0gcmVxdWlyZSgnLi9fYXJyYXktc3BlY2llcy1jcmVhdGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVFlQRSwgJGNyZWF0ZSl7XG4gIHZhciBJU19NQVAgICAgICAgID0gVFlQRSA9PSAxXG4gICAgLCBJU19GSUxURVIgICAgID0gVFlQRSA9PSAyXG4gICAgLCBJU19TT01FICAgICAgID0gVFlQRSA9PSAzXG4gICAgLCBJU19FVkVSWSAgICAgID0gVFlQRSA9PSA0XG4gICAgLCBJU19GSU5EX0lOREVYID0gVFlQRSA9PSA2XG4gICAgLCBOT19IT0xFUyAgICAgID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVhcbiAgICAsIGNyZWF0ZSAgICAgICAgPSAkY3JlYXRlIHx8IGFzYztcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0KXtcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QoJHRoaXMpXG4gICAgICAsIHNlbGYgICA9IElPYmplY3QoTylcbiAgICAgICwgZiAgICAgID0gY3R4KGNhbGxiYWNrZm4sIHRoYXQsIDMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSAwXG4gICAgICAsIHJlc3VsdCA9IElTX01BUCA/IGNyZWF0ZSgkdGhpcywgbGVuZ3RoKSA6IElTX0ZJTFRFUiA/IGNyZWF0ZSgkdGhpcywgMCkgOiB1bmRlZmluZWRcbiAgICAgICwgdmFsLCByZXM7XG4gICAgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihOT19IT0xFUyB8fCBpbmRleCBpbiBzZWxmKXtcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xuICAgICAgcmVzID0gZih2YWwsIGluZGV4LCBPKTtcbiAgICAgIGlmKFRZUEUpe1xuICAgICAgICBpZihJU19NQVApcmVzdWx0W2luZGV4XSA9IHJlczsgICAgICAgICAgICAvLyBtYXBcbiAgICAgICAgZWxzZSBpZihyZXMpc3dpdGNoKFRZUEUpe1xuICAgICAgICAgIGNhc2UgMzogcmV0dXJuIHRydWU7ICAgICAgICAgICAgICAgICAgICAvLyBzb21lXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcbiAgICAgICAgICBjYXNlIDY6IHJldHVybiBpbmRleDsgICAgICAgICAgICAgICAgICAgLy8gZmluZEluZGV4XG4gICAgICAgICAgY2FzZSAyOiByZXN1bHQucHVzaCh2YWwpOyAgICAgICAgICAgICAgIC8vIGZpbHRlclxuICAgICAgICB9IGVsc2UgaWYoSVNfRVZFUlkpcmV0dXJuIGZhbHNlOyAgICAgICAgICAvLyBldmVyeVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogcmVzdWx0O1xuICB9O1xufTsiLCIvLyA5LjQuMi4zIEFycmF5U3BlY2llc0NyZWF0ZShvcmlnaW5hbEFycmF5LCBsZW5ndGgpXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGlzQXJyYXkgID0gcmVxdWlyZSgnLi9faXMtYXJyYXknKVxuICAsIFNQRUNJRVMgID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3JpZ2luYWwsIGxlbmd0aCl7XG4gIHZhciBDO1xuICBpZihpc0FycmF5KG9yaWdpbmFsKSl7XG4gICAgQyA9IG9yaWdpbmFsLmNvbnN0cnVjdG9yO1xuICAgIC8vIGNyb3NzLXJlYWxtIGZhbGxiYWNrXG4gICAgaWYodHlwZW9mIEMgPT0gJ2Z1bmN0aW9uJyAmJiAoQyA9PT0gQXJyYXkgfHwgaXNBcnJheShDLnByb3RvdHlwZSkpKUMgPSB1bmRlZmluZWQ7XG4gICAgaWYoaXNPYmplY3QoQykpe1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZihDID09PSBudWxsKUMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9IHJldHVybiBuZXcgKEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQykobGVuZ3RoKTtcbn07IiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpXG4gIC8vIEVTMyB3cm9uZyBoZXJlXG4gICwgQVJHID0gY29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGl0W2tleV07XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTsiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBkUCAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZcbiAgLCBjcmVhdGUgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKVxuICAsIGhpZGUgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgcmVkZWZpbmVBbGwgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKVxuICAsIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBhbkluc3RhbmNlICA9IHJlcXVpcmUoJy4vX2FuLWluc3RhbmNlJylcbiAgLCBkZWZpbmVkICAgICA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKVxuICAsIGZvck9mICAgICAgID0gcmVxdWlyZSgnLi9fZm9yLW9mJylcbiAgLCAkaXRlckRlZmluZSA9IHJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJylcbiAgLCBzdGVwICAgICAgICA9IHJlcXVpcmUoJy4vX2l0ZXItc3RlcCcpXG4gICwgc2V0U3BlY2llcyAgPSByZXF1aXJlKCcuL19zZXQtc3BlY2llcycpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpXG4gICwgZmFzdEtleSAgICAgPSByZXF1aXJlKCcuL19tZXRhJykuZmFzdEtleVxuICAsIFNJWkUgICAgICAgID0gREVTQ1JJUFRPUlMgPyAnX3MnIDogJ3NpemUnO1xuXG52YXIgZ2V0RW50cnkgPSBmdW5jdGlvbih0aGF0LCBrZXkpe1xuICAvLyBmYXN0IGNhc2VcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcbiAgaWYoaW5kZXggIT09ICdGJylyZXR1cm4gdGhhdC5faVtpbmRleF07XG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxuICBmb3IoZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIGFuSW5zdGFuY2UodGhhdCwgQywgTkFNRSwgJ19pJyk7XG4gICAgICB0aGF0Ll9pID0gY3JlYXRlKG51bGwpOyAvLyBpbmRleFxuICAgICAgdGhhdC5fZiA9IHVuZGVmaW5lZDsgICAgLy8gZmlyc3QgZW50cnlcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7ICAgIC8vIGxhc3QgZW50cnlcbiAgICAgIHRoYXRbU0laRV0gPSAwOyAgICAgICAgIC8vIHNpemVcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgfSk7XG4gICAgcmVkZWZpbmVBbGwoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKXtcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXQuX2ksIGVudHJ5ID0gdGhhdC5fZjsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGRlbGV0ZSBkYXRhW2VudHJ5LmldO1xuICAgICAgICB9XG4gICAgICAgIHRoYXQuX2YgPSB0aGF0Ll9sID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGF0W1NJWkVdID0gMDtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XG4gICAgICAgIGlmKGVudHJ5KXtcbiAgICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XG4gICAgICAgICAgZGVsZXRlIHRoYXQuX2lbZW50cnkuaV07XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYocHJldilwcmV2Lm4gPSBuZXh0O1xuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcbiAgICAgICAgICBpZih0aGF0Ll9mID09IGVudHJ5KXRoYXQuX2YgPSBuZXh0O1xuICAgICAgICAgIGlmKHRoYXQuX2wgPT0gZW50cnkpdGhhdC5fbCA9IHByZXY7XG4gICAgICAgICAgdGhhdFtTSVpFXS0tO1xuICAgICAgICB9IHJldHVybiAhIWVudHJ5O1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgICAgICBhbkluc3RhbmNlKHRoaXMsIEMsICdmb3JFYWNoJyk7XG4gICAgICAgIHZhciBmID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkLCAzKVxuICAgICAgICAgICwgZW50cnk7XG4gICAgICAgIHdoaWxlKGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhpcy5fZil7XG4gICAgICAgICAgZihlbnRyeS52LCBlbnRyeS5rLCB0aGlzKTtcbiAgICAgICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy43IE1hcC5wcm90b3R5cGUuaGFzKGtleSlcbiAgICAgIC8vIDIzLjIuMy43IFNldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcbiAgICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZihERVNDUklQVE9SUylkUChDLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBkZWZpbmVkKHRoaXNbU0laRV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcbiAgICAgICwgcHJldiwgaW5kZXg7XG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XG4gICAgaWYoZW50cnkpe1xuICAgICAgZW50cnkudiA9IHZhbHVlO1xuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdC5fbCA9IGVudHJ5ID0ge1xuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxuICAgICAgICB2OiB2YWx1ZSwgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgICAgcDogcHJldiA9IHRoYXQuX2wsICAgICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XG4gICAgICAgIHI6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSByZW1vdmVkXG4gICAgICB9O1xuICAgICAgaWYoIXRoYXQuX2YpdGhhdC5fZiA9IGVudHJ5O1xuICAgICAgaWYocHJldilwcmV2Lm4gPSBlbnRyeTtcbiAgICAgIHRoYXRbU0laRV0rKztcbiAgICAgIC8vIGFkZCB0byBpbmRleFxuICAgICAgaWYoaW5kZXggIT09ICdGJyl0aGF0Ll9pW2luZGV4XSA9IGVudHJ5O1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcbiAgc2V0U3Ryb25nOiBmdW5jdGlvbihDLCBOQU1FLCBJU19NQVApe1xuICAgIC8vIGFkZCAua2V5cywgLnZhbHVlcywgLmVudHJpZXMsIFtAQGl0ZXJhdG9yXVxuICAgIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgICAkaXRlckRlZmluZShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICAgICB0aGlzLl90ID0gaXRlcmF0ZWQ7ICAvLyB0YXJnZXRcbiAgICAgIHRoaXMuX2sgPSBraW5kOyAgICAgIC8vIGtpbmRcbiAgICAgIHRoaXMuX2wgPSB1bmRlZmluZWQ7IC8vIHByZXZpb3VzXG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgLCBraW5kICA9IHRoYXQuX2tcbiAgICAgICAgLCBlbnRyeSA9IHRoYXQuX2w7XG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmKCF0aGF0Ll90IHx8ICEodGhhdC5fbCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhhdC5fdC5fZikpe1xuICAgICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxuICAgICAgICB0aGF0Ll90ID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gc3RlcCgxKTtcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcbiAgICAgIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgZW50cnkuayk7XG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xuICAgICAgcmV0dXJuIHN0ZXAoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTtcbiAgICB9LCBJU19NQVAgPyAnZW50cmllcycgOiAndmFsdWVzJyAsICFJU19NQVAsIHRydWUpO1xuXG4gICAgLy8gYWRkIFtAQHNwZWNpZXNdLCAyMy4xLjIuMiwgMjMuMi4yLjJcbiAgICBzZXRTcGVjaWVzKE5BTUUpO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpXG4gICwgZnJvbSAgICA9IHJlcXVpcmUoJy4vX2FycmF5LWZyb20taXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSl7XG4gIHJldHVybiBmdW5jdGlvbiB0b0pTT04oKXtcbiAgICBpZihjbGFzc29mKHRoaXMpICE9IE5BTUUpdGhyb3cgVHlwZUVycm9yKE5BTUUgKyBcIiN0b0pTT04gaXNuJ3QgZ2VuZXJpY1wiKTtcbiAgICByZXR1cm4gZnJvbSh0aGlzKTtcbiAgfTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlZGVmaW5lQWxsICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUtYWxsJylcbiAgLCBnZXRXZWFrICAgICAgICAgICA9IHJlcXVpcmUoJy4vX21ldGEnKS5nZXRXZWFrXG4gICwgYW5PYmplY3QgICAgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIGlzT2JqZWN0ICAgICAgICAgID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBhbkluc3RhbmNlICAgICAgICA9IHJlcXVpcmUoJy4vX2FuLWluc3RhbmNlJylcbiAgLCBmb3JPZiAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2Zvci1vZicpXG4gICwgY3JlYXRlQXJyYXlNZXRob2QgPSByZXF1aXJlKCcuL19hcnJheS1tZXRob2RzJylcbiAgLCAkaGFzICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgYXJyYXlGaW5kICAgICAgICAgPSBjcmVhdGVBcnJheU1ldGhvZCg1KVxuICAsIGFycmF5RmluZEluZGV4ICAgID0gY3JlYXRlQXJyYXlNZXRob2QoNilcbiAgLCBpZCAgICAgICAgICAgICAgICA9IDA7XG5cbi8vIGZhbGxiYWNrIGZvciB1bmNhdWdodCBmcm96ZW4ga2V5c1xudmFyIHVuY2F1Z2h0RnJvemVuU3RvcmUgPSBmdW5jdGlvbih0aGF0KXtcbiAgcmV0dXJuIHRoYXQuX2wgfHwgKHRoYXQuX2wgPSBuZXcgVW5jYXVnaHRGcm96ZW5TdG9yZSk7XG59O1xudmFyIFVuY2F1Z2h0RnJvemVuU3RvcmUgPSBmdW5jdGlvbigpe1xuICB0aGlzLmEgPSBbXTtcbn07XG52YXIgZmluZFVuY2F1Z2h0RnJvemVuID0gZnVuY3Rpb24oc3RvcmUsIGtleSl7XG4gIHJldHVybiBhcnJheUZpbmQoc3RvcmUuYSwgZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdFswXSA9PT0ga2V5O1xuICB9KTtcbn07XG5VbmNhdWdodEZyb3plblN0b3JlLnByb3RvdHlwZSA9IHtcbiAgZ2V0OiBmdW5jdGlvbihrZXkpe1xuICAgIHZhciBlbnRyeSA9IGZpbmRVbmNhdWdodEZyb3plbih0aGlzLCBrZXkpO1xuICAgIGlmKGVudHJ5KXJldHVybiBlbnRyeVsxXTtcbiAgfSxcbiAgaGFzOiBmdW5jdGlvbihrZXkpe1xuICAgIHJldHVybiAhIWZpbmRVbmNhdWdodEZyb3plbih0aGlzLCBrZXkpO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGZpbmRVbmNhdWdodEZyb3plbih0aGlzLCBrZXkpO1xuICAgIGlmKGVudHJ5KWVudHJ5WzFdID0gdmFsdWU7XG4gICAgZWxzZSB0aGlzLmEucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9LFxuICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICB2YXIgaW5kZXggPSBhcnJheUZpbmRJbmRleCh0aGlzLmEsIGZ1bmN0aW9uKGl0KXtcbiAgICAgIHJldHVybiBpdFswXSA9PT0ga2V5O1xuICAgIH0pO1xuICAgIGlmKH5pbmRleCl0aGlzLmEuc3BsaWNlKGluZGV4LCAxKTtcbiAgICByZXR1cm4gISF+aW5kZXg7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIGFuSW5zdGFuY2UodGhhdCwgQywgTkFNRSwgJ19pJyk7XG4gICAgICB0aGF0Ll9pID0gaWQrKzsgICAgICAvLyBjb2xsZWN0aW9uIGlkXG4gICAgICB0aGF0Ll9sID0gdW5kZWZpbmVkOyAvLyBsZWFrIHN0b3JlIGZvciB1bmNhdWdodCBmcm96ZW4gb2JqZWN0c1xuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMy4zLjIgV2Vha01hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjQuMy4zIFdlYWtTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBkYXRhID0gZ2V0V2VhayhrZXkpO1xuICAgICAgICBpZihkYXRhID09PSB0cnVlKXJldHVybiB1bmNhdWdodEZyb3plblN0b3JlKHRoaXMpWydkZWxldGUnXShrZXkpO1xuICAgICAgICByZXR1cm4gZGF0YSAmJiAkaGFzKGRhdGEsIHRoaXMuX2kpICYmIGRlbGV0ZSBkYXRhW3RoaXMuX2ldO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjMuMy40IFdlYWtNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy40LjMuNCBXZWFrU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XG4gICAgICAgIHZhciBkYXRhID0gZ2V0V2VhayhrZXkpO1xuICAgICAgICBpZihkYXRhID09PSB0cnVlKXJldHVybiB1bmNhdWdodEZyb3plblN0b3JlKHRoaXMpLmhhcyhrZXkpO1xuICAgICAgICByZXR1cm4gZGF0YSAmJiAkaGFzKGRhdGEsIHRoaXMuX2kpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIHZhciBkYXRhID0gZ2V0V2Vhayhhbk9iamVjdChrZXkpLCB0cnVlKTtcbiAgICBpZihkYXRhID09PSB0cnVlKXVuY2F1Z2h0RnJvemVuU3RvcmUodGhhdCkuc2V0KGtleSwgdmFsdWUpO1xuICAgIGVsc2UgZGF0YVt0aGF0Ll9pXSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGF0O1xuICB9LFxuICB1ZnN0b3JlOiB1bmNhdWdodEZyb3plblN0b3JlXG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBnbG9iYWwgICAgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIG1ldGEgICAgICAgICAgID0gcmVxdWlyZSgnLi9fbWV0YScpXG4gICwgZmFpbHMgICAgICAgICAgPSByZXF1aXJlKCcuL19mYWlscycpXG4gICwgaGlkZSAgICAgICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCByZWRlZmluZUFsbCAgICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpXG4gICwgZm9yT2YgICAgICAgICAgPSByZXF1aXJlKCcuL19mb3Itb2YnKVxuICAsIGFuSW5zdGFuY2UgICAgID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKVxuICAsIGlzT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBkUCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZcbiAgLCBlYWNoICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2FycmF5LW1ldGhvZHMnKSgwKVxuICAsIERFU0NSSVBUT1JTICAgID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FLCB3cmFwcGVyLCBtZXRob2RzLCBjb21tb24sIElTX01BUCwgSVNfV0VBSyl7XG4gIHZhciBCYXNlICA9IGdsb2JhbFtOQU1FXVxuICAgICwgQyAgICAgPSBCYXNlXG4gICAgLCBBRERFUiA9IElTX01BUCA/ICdzZXQnIDogJ2FkZCdcbiAgICAsIHByb3RvID0gQyAmJiBDLnByb3RvdHlwZVxuICAgICwgTyAgICAgPSB7fTtcbiAgaWYoIURFU0NSSVBUT1JTIHx8IHR5cGVvZiBDICE9ICdmdW5jdGlvbicgfHwgIShJU19XRUFLIHx8IHByb3RvLmZvckVhY2ggJiYgIWZhaWxzKGZ1bmN0aW9uKCl7XG4gICAgbmV3IEMoKS5lbnRyaWVzKCkubmV4dCgpO1xuICB9KSkpe1xuICAgIC8vIGNyZWF0ZSBjb2xsZWN0aW9uIGNvbnN0cnVjdG9yXG4gICAgQyA9IGNvbW1vbi5nZXRDb25zdHJ1Y3Rvcih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwgbWV0aG9kcyk7XG4gICAgbWV0YS5ORUVEID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBDID0gd3JhcHBlcihmdW5jdGlvbih0YXJnZXQsIGl0ZXJhYmxlKXtcbiAgICAgIGFuSW5zdGFuY2UodGFyZ2V0LCBDLCBOQU1FLCAnX2MnKTtcbiAgICAgIHRhcmdldC5fYyA9IG5ldyBCYXNlO1xuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRhcmdldFtBRERFUl0sIHRhcmdldCk7XG4gICAgfSk7XG4gICAgZWFjaCgnYWRkLGNsZWFyLGRlbGV0ZSxmb3JFYWNoLGdldCxoYXMsc2V0LGtleXMsdmFsdWVzLGVudHJpZXMsdG9KU09OJy5zcGxpdCgnLCcpLGZ1bmN0aW9uKEtFWSl7XG4gICAgICB2YXIgSVNfQURERVIgPSBLRVkgPT0gJ2FkZCcgfHwgS0VZID09ICdzZXQnO1xuICAgICAgaWYoS0VZIGluIHByb3RvICYmICEoSVNfV0VBSyAmJiBLRVkgPT0gJ2NsZWFyJykpaGlkZShDLnByb3RvdHlwZSwgS0VZLCBmdW5jdGlvbihhLCBiKXtcbiAgICAgICAgYW5JbnN0YW5jZSh0aGlzLCBDLCBLRVkpO1xuICAgICAgICBpZighSVNfQURERVIgJiYgSVNfV0VBSyAmJiAhaXNPYmplY3QoYSkpcmV0dXJuIEtFWSA9PSAnZ2V0JyA/IHVuZGVmaW5lZCA6IGZhbHNlO1xuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcy5fY1tLRVldKGEgPT09IDAgPyAwIDogYSwgYik7XG4gICAgICAgIHJldHVybiBJU19BRERFUiA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpZignc2l6ZScgaW4gcHJvdG8pZFAoQy5wcm90b3R5cGUsICdzaXplJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5fYy5zaXplO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0VG9TdHJpbmdUYWcoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GLCBPKTtcblxuICBpZighSVNfV0VBSyljb21tb24uc2V0U3Ryb25nKEMsIE5BTUUsIElTX01BUCk7XG5cbiAgcmV0dXJuIEM7XG59OyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzIuMS41J307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhRnVuY3Rpb24oZm4pO1xuICBpZih0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59OyIsIi8vIDcuMi4xIFJlcXVpcmVPYmplY3RDb2VyY2libGUoYXJndW1lbnQpXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnRcbiAgLy8gaW4gb2xkIElFIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnXG4gICwgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07IiwiLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xyXG5tb2R1bGUuZXhwb3J0cyA9IChcclxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xyXG4pLnNwbGl0KCcsJyk7IiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKVxuICAsIGdPUFMgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpXG4gICwgcElFICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgcmVzdWx0ICAgICA9IGdldEtleXMoaXQpXG4gICAgLCBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZihnZXRTeW1ib2xzKXtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpXG4gICAgICAsIGlzRW51bSAgPSBwSUUuZlxuICAgICAgLCBpICAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUoc3ltYm9scy5sZW5ndGggPiBpKWlmKGlzRW51bS5jYWxsKGl0LCBrZXkgPSBzeW1ib2xzW2krK10pKXJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgY29yZSAgICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBoaWRlICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgSVNfV1JBUCAgID0gdHlwZSAmICRleHBvcnQuV1xuICAgICwgZXhwb3J0cyAgID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSlcbiAgICAsIGV4cFByb3RvICA9IGV4cG9ydHNbUFJPVE9UWVBFXVxuICAgICwgdGFyZ2V0ICAgID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXVxuICAgICwga2V5LCBvd24sIG91dDtcbiAgaWYoSVNfR0xPQkFMKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIGlmKG93biAmJiBrZXkgaW4gZXhwb3J0cyljb250aW51ZTtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IG93biA/IHRhcmdldFtrZXldIDogc291cmNlW2tleV07XG4gICAgLy8gcHJldmVudCBnbG9iYWwgcG9sbHV0aW9uIGZvciBuYW1lc3BhY2VzXG4gICAgZXhwb3J0c1trZXldID0gSVNfR0xPQkFMICYmIHR5cGVvZiB0YXJnZXRba2V5XSAhPSAnZnVuY3Rpb24nID8gc291cmNlW2tleV1cbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIDogSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpXG4gICAgLy8gd3JhcCBnbG9iYWwgY29uc3RydWN0b3JzIGZvciBwcmV2ZW50IGNoYW5nZSB0aGVtIGluIGxpYnJhcnlcbiAgICA6IElTX1dSQVAgJiYgdGFyZ2V0W2tleV0gPT0gb3V0ID8gKGZ1bmN0aW9uKEMpe1xuICAgICAgdmFyIEYgPSBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEMpe1xuICAgICAgICAgIHN3aXRjaChhcmd1bWVudHMubGVuZ3RoKXtcbiAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIG5ldyBDO1xuICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gbmV3IEMoYSk7XG4gICAgICAgICAgICBjYXNlIDI6IHJldHVybiBuZXcgQyhhLCBiKTtcbiAgICAgICAgICB9IHJldHVybiBuZXcgQyhhLCBiLCBjKTtcbiAgICAgICAgfSByZXR1cm4gQy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICAgIEZbUFJPVE9UWVBFXSA9IENbUFJPVE9UWVBFXTtcbiAgICAgIHJldHVybiBGO1xuICAgIC8vIG1ha2Ugc3RhdGljIHZlcnNpb25zIGZvciBwcm90b3R5cGUgbWV0aG9kc1xuICAgIH0pKG91dCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHBvcnQgcHJvdG8gbWV0aG9kcyB0byBjb3JlLiVDT05TVFJVQ1RPUiUubWV0aG9kcy4lTkFNRSVcbiAgICBpZihJU19QUk9UTyl7XG4gICAgICAoZXhwb3J0cy52aXJ0dWFsIHx8IChleHBvcnRzLnZpcnR1YWwgPSB7fSkpW2tleV0gPSBvdXQ7XG4gICAgICAvLyBleHBvcnQgcHJvdG8gbWV0aG9kcyB0byBjb3JlLiVDT05TVFJVQ1RPUiUucHJvdG90eXBlLiVOQU1FJVxuICAgICAgaWYodHlwZSAmICRleHBvcnQuUiAmJiBleHBQcm90byAmJiAhZXhwUHJvdG9ba2V5XSloaWRlKGV4cFByb3RvLCBrZXksIG91dCk7XG4gICAgfVxuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YCBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTsiLCJ2YXIgY3R4ICAgICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKVxuICAsIGFuT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQsIElURVJBVE9SKXtcbiAgdmFyIGl0ZXJGbiA9IElURVJBVE9SID8gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXJhYmxlOyB9IDogZ2V0SXRlckZuKGl0ZXJhYmxlKVxuICAgICwgZiAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yO1xuICBpZih0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ZXJhYmxlICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIC8vIGZhc3QgY2FzZSBmb3IgYXJyYXlzIHdpdGggZGVmYXVsdCBpdGVyYXRvclxuICBpZihpc0FycmF5SXRlcihpdGVyRm4pKWZvcihsZW5ndGggPSB0b0xlbmd0aChpdGVyYWJsZS5sZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICB9IGVsc2UgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7ICl7XG4gICAgY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gIH1cbn07IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59OyIsInZhciBkUCAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XHJcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xyXG59KTsiLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCAhPT0gdW5kZWZpbmVkICYmIChJdGVyYXRvcnMuQXJyYXkgPT09IGl0IHx8IEFycmF5UHJvdG9bSVRFUkFUT1JdID09PSBpdCk7XG59OyIsIi8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpe1xuICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5Jztcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59OyIsIi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoKGUpe1xuICAgIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gICAgaWYocmV0ICE9PSB1bmRlZmluZWQpYW5PYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBjcmVhdGUgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKVxuICAsIGRlc2NyaXB0b3IgICAgID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2hpZGUnKShJdGVyYXRvclByb3RvdHlwZSwgcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCl7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwge25leHQ6IGRlc2NyaXB0b3IoMSwgbmV4dCl9KTtcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBMSUJSQVJZICAgICAgICA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCByZWRlZmluZSAgICAgICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJylcbiAgLCBoaWRlICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBJdGVyYXRvcnMgICAgICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgJGl0ZXJDcmVhdGUgICAgPSByZXF1aXJlKCcuL19pdGVyLWNyZWF0ZScpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJylcbiAgLCBJVEVSQVRPUiAgICAgICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgQlVHR1kgICAgICAgICAgPSAhKFtdLmtleXMgJiYgJ25leHQnIGluIFtdLmtleXMoKSkgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxuICAsIEZGX0lURVJBVE9SICAgID0gJ0BAaXRlcmF0b3InXG4gICwgS0VZUyAgICAgICAgICAgPSAna2V5cydcbiAgLCBWQUxVRVMgICAgICAgICA9ICd2YWx1ZXMnO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFRCl7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uKGtpbmQpe1xuICAgIGlmKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKXJldHVybiBwcm90b1traW5kXTtcbiAgICBzd2l0Y2goa2luZCl7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyAgICAgICAgPSBOQU1FICsgJyBJdGVyYXRvcidcbiAgICAsIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFU1xuICAgICwgVkFMVUVTX0JVRyA9IGZhbHNlXG4gICAgLCBwcm90byAgICAgID0gQmFzZS5wcm90b3R5cGVcbiAgICAsICRuYXRpdmUgICAgPSBwcm90b1tJVEVSQVRPUl0gfHwgcHJvdG9bRkZfSVRFUkFUT1JdIHx8IERFRkFVTFQgJiYgcHJvdG9bREVGQVVMVF1cbiAgICAsICRkZWZhdWx0ICAgPSAkbmF0aXZlIHx8IGdldE1ldGhvZChERUZBVUxUKVxuICAgICwgJGVudHJpZXMgICA9IERFRkFVTFQgPyAhREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKCdlbnRyaWVzJykgOiB1bmRlZmluZWRcbiAgICAsICRhbnlOYXRpdmUgPSBOQU1FID09ICdBcnJheScgPyBwcm90by5lbnRyaWVzIHx8ICRuYXRpdmUgOiAkbmF0aXZlXG4gICAgLCBtZXRob2RzLCBrZXksIEl0ZXJhdG9yUHJvdG90eXBlO1xuICAvLyBGaXggbmF0aXZlXG4gIGlmKCRhbnlOYXRpdmUpe1xuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoJGFueU5hdGl2ZS5jYWxsKG5ldyBCYXNlKSk7XG4gICAgaWYoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUpe1xuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgICAvLyBmaXggZm9yIHNvbWUgb2xkIGVuZ2luZXNcbiAgICAgIGlmKCFMSUJSQVJZICYmICFoYXMoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SKSloaWRlKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgfVxuICB9XG4gIC8vIGZpeCBBcnJheSN7dmFsdWVzLCBAQGl0ZXJhdG9yfS5uYW1lIGluIFY4IC8gRkZcbiAgaWYoREVGX1ZBTFVFUyAmJiAkbmF0aXZlICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKXtcbiAgICBWQUxVRVNfQlVHID0gdHJ1ZTtcbiAgICAkZGVmYXVsdCA9IGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gJG5hdGl2ZS5jYWxsKHRoaXMpOyB9O1xuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZigoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSl7XG4gICAgaGlkZShwcm90bywgSVRFUkFUT1IsICRkZWZhdWx0KTtcbiAgfVxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9ICRkZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSByZXR1cm5UaGlzO1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiAgREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKFZBTFVFUyksXG4gICAgICBrZXlzOiAgICBJU19TRVQgICAgID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAkZW50cmllc1xuICAgIH07XG4gICAgaWYoRk9SQ0VEKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRvbmUsIHZhbHVlKXtcbiAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge307IiwidmFyIGdldEtleXMgICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJylcbiAgLCB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgZWwpe1xuICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KG9iamVjdClcbiAgICAsIGtleXMgICA9IGdldEtleXMoTylcbiAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKGxlbmd0aCA+IGluZGV4KWlmKE9ba2V5ID0ga2V5c1tpbmRleCsrXV0gPT09IGVsKXJldHVybiBrZXk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gdHJ1ZTsiLCJ2YXIgTUVUQSAgICAgPSByZXF1aXJlKCcuL191aWQnKSgnbWV0YScpXG4gICwgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGhhcyAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBzZXREZXNjICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZcbiAgLCBpZCAgICAgICA9IDA7XG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZSB8fCBmdW5jdGlvbigpe1xuICByZXR1cm4gdHJ1ZTtcbn07XG52YXIgRlJFRVpFID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGlzRXh0ZW5zaWJsZShPYmplY3QucHJldmVudEV4dGVuc2lvbnMoe30pKTtcbn0pO1xudmFyIHNldE1ldGEgPSBmdW5jdGlvbihpdCl7XG4gIHNldERlc2MoaXQsIE1FVEEsIHt2YWx1ZToge1xuICAgIGk6ICdPJyArICsraWQsIC8vIG9iamVjdCBJRFxuICAgIHc6IHt9ICAgICAgICAgIC8vIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH19KTtcbn07XG52YXIgZmFzdEtleSA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYoIWhhcyhpdCwgTUVUQSkpe1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYoIWlzRXh0ZW5zaWJsZShpdCkpcmV0dXJuICdGJztcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gb2JqZWN0IElEXG4gIH0gcmV0dXJuIGl0W01FVEFdLmk7XG59O1xudmFyIGdldFdlYWsgPSBmdW5jdGlvbihpdCwgY3JlYXRlKXtcbiAgaWYoIWhhcyhpdCwgTUVUQSkpe1xuICAgIC8vIGNhbid0IHNldCBtZXRhZGF0YSB0byB1bmNhdWdodCBmcm96ZW4gb2JqZWN0XG4gICAgaWYoIWlzRXh0ZW5zaWJsZShpdCkpcmV0dXJuIHRydWU7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZighY3JlYXRlKXJldHVybiBmYWxzZTtcbiAgICAvLyBhZGQgbWlzc2luZyBtZXRhZGF0YVxuICAgIHNldE1ldGEoaXQpO1xuICAvLyByZXR1cm4gaGFzaCB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9IHJldHVybiBpdFtNRVRBXS53O1xufTtcbi8vIGFkZCBtZXRhZGF0YSBvbiBmcmVlemUtZmFtaWx5IG1ldGhvZHMgY2FsbGluZ1xudmFyIG9uRnJlZXplID0gZnVuY3Rpb24oaXQpe1xuICBpZihGUkVFWkUgJiYgbWV0YS5ORUVEICYmIGlzRXh0ZW5zaWJsZShpdCkgJiYgIWhhcyhpdCwgTUVUQSkpc2V0TWV0YShpdCk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgbWV0YSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBLRVk6ICAgICAgTUVUQSxcbiAgTkVFRDogICAgIGZhbHNlLFxuICBmYXN0S2V5OiAgZmFzdEtleSxcbiAgZ2V0V2VhazogIGdldFdlYWssXG4gIG9uRnJlZXplOiBvbkZyZWV6ZVxufTsiLCIndXNlIHN0cmljdCc7XG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG52YXIgZ2V0S2V5cyAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpXG4gICwgZ09QUyAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpXG4gICwgcElFICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXG4gICwgSU9iamVjdCAgPSByZXF1aXJlKCcuL19pb2JqZWN0JylcbiAgLCAkYXNzaWduICA9IE9iamVjdC5hc3NpZ247XG5cbi8vIHNob3VsZCB3b3JrIHdpdGggc3ltYm9scyBhbmQgc2hvdWxkIGhhdmUgZGV0ZXJtaW5pc3RpYyBwcm9wZXJ0eSBvcmRlciAoVjggYnVnKVxubW9kdWxlLmV4cG9ydHMgPSAhJGFzc2lnbiB8fCByZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHZhciBBID0ge31cbiAgICAsIEIgPSB7fVxuICAgICwgUyA9IFN5bWJvbCgpXG4gICAgLCBLID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0JztcbiAgQVtTXSA9IDc7XG4gIEsuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24oayl7IEJba10gPSBrOyB9KTtcbiAgcmV0dXJuICRhc3NpZ24oe30sIEEpW1NdICE9IDcgfHwgT2JqZWN0LmtleXMoJGFzc2lnbih7fSwgQikpLmpvaW4oJycpICE9IEs7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgdmFyIFQgICAgID0gdG9PYmplY3QodGFyZ2V0KVxuICAgICwgYUxlbiAgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBpbmRleCA9IDFcbiAgICAsIGdldFN5bWJvbHMgPSBnT1BTLmZcbiAgICAsIGlzRW51bSAgICAgPSBwSUUuZjtcbiAgd2hpbGUoYUxlbiA+IGluZGV4KXtcbiAgICB2YXIgUyAgICAgID0gSU9iamVjdChhcmd1bWVudHNbaW5kZXgrK10pXG4gICAgICAsIGtleXMgICA9IGdldFN5bWJvbHMgPyBnZXRLZXlzKFMpLmNvbmNhdChnZXRTeW1ib2xzKFMpKSA6IGdldEtleXMoUylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaiAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUobGVuZ3RoID4gailpZihpc0VudW0uY2FsbChTLCBrZXkgPSBrZXlzW2orK10pKVRba2V5XSA9IFNba2V5XTtcbiAgfSByZXR1cm4gVDtcbn0gOiAkYXNzaWduOyIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxyXG52YXIgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxyXG4gICwgZFBzICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHBzJylcclxuICAsIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpXHJcbiAgLCBJRV9QUk9UTyAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKVxyXG4gICwgRW1wdHkgICAgICAgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9XHJcbiAgLCBQUk9UT1RZUEUgICA9ICdwcm90b3R5cGUnO1xyXG5cclxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxyXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uKCl7XHJcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcclxuICB2YXIgaWZyYW1lID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdpZnJhbWUnKVxyXG4gICAgLCBpICAgICAgPSBlbnVtQnVnS2V5cy5sZW5ndGhcclxuICAgICwgZ3QgICAgID0gJz4nXHJcbiAgICAsIGlmcmFtZURvY3VtZW50O1xyXG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcclxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xyXG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcclxuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xyXG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcclxuICBpZnJhbWVEb2N1bWVudC53cml0ZSgnPHNjcmlwdD5kb2N1bWVudC5GPU9iamVjdDwvc2NyaXB0JyArIGd0KTtcclxuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xyXG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xyXG4gIHdoaWxlKGktLSlkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcclxuICByZXR1cm4gY3JlYXRlRGljdCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKXtcclxuICB2YXIgcmVzdWx0O1xyXG4gIGlmKE8gIT09IG51bGwpe1xyXG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xyXG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5O1xyXG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XHJcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXHJcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcclxuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xyXG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcclxufTsiLCJ2YXIgYW5PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKVxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcbiAgLCBkUCAgICAgICAgICAgICA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpe1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmKCd2YWx1ZScgaW4gQXR0cmlidXRlcylPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59OyIsInZhciBkUCAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXHJcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXHJcbiAgLCBnZXRLZXlzICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcyl7XHJcbiAgYW5PYmplY3QoTyk7XHJcbiAgdmFyIGtleXMgICA9IGdldEtleXMoUHJvcGVydGllcylcclxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICwgaSA9IDBcclxuICAgICwgUDtcclxuICB3aGlsZShsZW5ndGggPiBpKWRQLmYoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XHJcbiAgcmV0dXJuIE87XHJcbn07IiwidmFyIHBJRSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpXHJcbiAgLCBjcmVhdGVEZXNjICAgICA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKVxyXG4gICwgdG9JT2JqZWN0ICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcclxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcclxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcclxuICAsIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKVxyXG4gICwgZ09QRCAgICAgICAgICAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG5cclxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGdPUEQgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCl7XHJcbiAgTyA9IHRvSU9iamVjdChPKTtcclxuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XHJcbiAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcclxuICAgIHJldHVybiBnT1BEKE8sIFApO1xyXG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICBpZihoYXMoTywgUCkpcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xyXG59OyIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCBnT1BOICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmZcbiAgLCB0b1N0cmluZyAgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uKGl0KXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ09QTi5mKGl0KTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuZiA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICByZXR1cm4gd2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScgPyBnZXRXaW5kb3dOYW1lcyhpdCkgOiBnT1BOKHRvSU9iamVjdChpdCkpO1xufTsiLCIvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXHJcbnZhciAka2V5cyAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKVxyXG4gICwgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcclxuXHJcbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTyl7XHJcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xyXG59OyIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7IiwiLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcclxudmFyIGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcclxuICAsIHRvT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcclxuICAsIElFX1BST1RPICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpXHJcbiAgLCBPYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbihPKXtcclxuICBPID0gdG9PYmplY3QoTyk7XHJcbiAgaWYoaGFzKE8sIElFX1BST1RPKSlyZXR1cm4gT1tJRV9QUk9UT107XHJcbiAgaWYodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcil7XHJcbiAgICByZXR1cm4gTy5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XHJcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcclxufTsiLCJ2YXIgaGFzICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcclxuICAsIHRvSU9iamVjdCAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxyXG4gICwgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSlcclxuICAsIElFX1BST1RPICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBuYW1lcyl7XHJcbiAgdmFyIE8gICAgICA9IHRvSU9iamVjdChvYmplY3QpXHJcbiAgICAsIGkgICAgICA9IDBcclxuICAgICwgcmVzdWx0ID0gW11cclxuICAgICwga2V5O1xyXG4gIGZvcihrZXkgaW4gTylpZihrZXkgIT0gSUVfUFJPVE8paGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcclxuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXHJcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpe1xyXG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufTsiLCIvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcclxudmFyICRrZXlzICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKVxyXG4gICwgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTyl7XHJcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcclxufTsiLCJleHBvcnRzLmYgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTsiLCIvLyBtb3N0IE9iamVjdCBtZXRob2RzIGJ5IEVTNiBzaG91bGQgYWNjZXB0IHByaW1pdGl2ZXNcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCBjb3JlICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgZmFpbHMgICA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEtFWSwgZXhlYyl7XG4gIHZhciBmbiAgPSAoY29yZS5PYmplY3QgfHwge30pW0tFWV0gfHwgT2JqZWN0W0tFWV1cbiAgICAsIGV4cCA9IHt9O1xuICBleHBbS0VZXSA9IGV4ZWMoZm4pO1xuICAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIGZhaWxzKGZ1bmN0aW9uKCl7IGZuKDEpOyB9KSwgJ09iamVjdCcsIGV4cCk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufTsiLCJ2YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBzcmMsIHNhZmUpe1xuICBmb3IodmFyIGtleSBpbiBzcmMpe1xuICAgIGlmKHNhZmUgJiYgdGFyZ2V0W2tleV0pdGFyZ2V0W2tleV0gPSBzcmNba2V5XTtcbiAgICBlbHNlIGhpZGUodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcbiAgfSByZXR1cm4gdGFyZ2V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2hpZGUnKTsiLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgY2hlY2sgPSBmdW5jdGlvbihPLCBwcm90byl7XG4gIGFuT2JqZWN0KE8pO1xuICBpZighaXNPYmplY3QocHJvdG8pICYmIHByb3RvICE9PSBudWxsKXRocm93IFR5cGVFcnJvcihwcm90byArIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGZ1bmN0aW9uKHRlc3QsIGJ1Z2d5LCBzZXQpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi9fY3R4JykoRnVuY3Rpb24uY2FsbCwgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKS5mKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQsIDIpO1xuICAgICAgICBzZXQodGVzdCwgW10pO1xuICAgICAgICBidWdneSA9ICEodGVzdCBpbnN0YW5jZW9mIEFycmF5KTtcbiAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKE8sIHByb3RvKXtcbiAgICAgICAgY2hlY2soTywgcHJvdG8pO1xuICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICBlbHNlIHNldChPLCBwcm90byk7XG4gICAgICAgIHJldHVybiBPO1xuICAgICAgfTtcbiAgICB9KHt9LCBmYWxzZSkgOiB1bmRlZmluZWQpLFxuICBjaGVjazogY2hlY2tcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGRQICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJylcbiAgLCBTUEVDSUVTICAgICA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSB0eXBlb2YgY29yZVtLRVldID09ICdmdW5jdGlvbicgPyBjb3JlW0tFWV0gOiBnbG9iYWxbS0VZXTtcbiAgaWYoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSlkUC5mKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07IiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZcbiAgLCBoYXMgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xuICBpZihpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKWRlZihpdCwgVEFHLCB7Y29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnfSk7XG59OyIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpXHJcbiAgLCB1aWQgICAgPSByZXF1aXJlKCcuL191aWQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xyXG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XHJcbn07IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgZGVmaW5lZCAgID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWF4ICAgICAgID0gTWF0aC5tYXhcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59OyIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTsiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59OyIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBTKXtcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZihTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTsiLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTsiLCJ2YXIgc3RvcmUgICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICAgICAgPSByZXF1aXJlKCcuL191aWQnKVxuICAsIFN5bWJvbCAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2xcbiAgLCBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07IiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgIT0gdW5kZWZpbmVkKXJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07IiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBnZXQgICAgICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvcmUnKS5nZXRJdGVyYXRvciA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGl0ZXJGbiA9IGdldChpdCk7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgcmV0dXJuIGFuT2JqZWN0KGl0ZXJGbi5jYWxsKGl0KSk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBhZGRUb1Vuc2NvcGFibGVzID0gcmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJylcbiAgLCBJdGVyYXRvcnMgICAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCB0b0lPYmplY3QgICAgICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgdGhpcy5fdCA9IHRvSU9iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICB0aGlzLl9rID0ga2luZDsgICAgICAgICAgICAgICAgLy8ga2luZFxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBraW5kICA9IHRoaXMuX2tcbiAgICAsIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XG4gICAgdGhpcy5fdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3RlcCgxKTtcbiAgfVxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcbiAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuYWRkVG9VbnNjb3BhYmxlcygna2V5cycpO1xuYWRkVG9VbnNjb3BhYmxlcygndmFsdWVzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCdlbnRyaWVzJyk7IiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKVxyXG4vLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcclxuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7Y3JlYXRlOiByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyl9KTsiLCJ2YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xyXG4vLyAxOS4xLjIuNCAvIDE1LjIuMy42IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxyXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpLCAnT2JqZWN0Jywge2RlZmluZVByb3BlcnR5OiByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mfSk7IiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCAgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKS5mO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gICAgcmV0dXJuICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG9JT2JqZWN0KGl0KSwga2V5KTtcbiAgfTtcbn0pOyIsIi8vIDE5LjEuMi45IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIHRvT2JqZWN0ICAgICAgICA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXG4gICwgJGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldFByb3RvdHlwZU9mJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKGl0KXtcbiAgICByZXR1cm4gJGdldFByb3RvdHlwZU9mKHRvT2JqZWN0KGl0KSk7XG4gIH07XG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbiRleHBvcnQoJGV4cG9ydC5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuL19zZXQtcHJvdG8nKS5zZXR9KTsiLCIiLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMiBTZXQgT2JqZWN0c1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uJykoJ1NldCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBTZXQoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7IH07XG59LCB7XG4gIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxuICBhZGQ6IGZ1bmN0aW9uIGFkZCh2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywgdmFsdWUgPSB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcpOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkYXQgID0gcmVxdWlyZSgnLi9fc3RyaW5nLWF0JykodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBpbmRleCA9IHRoaXMuX2lcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4ge3ZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWV9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4ge3ZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2V9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyIGdsb2JhbCAgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBERVNDUklQVE9SUyAgICA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgcmVkZWZpbmUgICAgICAgPSByZXF1aXJlKCcuL19yZWRlZmluZScpXG4gICwgTUVUQSAgICAgICAgICAgPSByZXF1aXJlKCcuL19tZXRhJykuS0VZXG4gICwgJGZhaWxzICAgICAgICAgPSByZXF1aXJlKCcuL19mYWlscycpXG4gICwgc2hhcmVkICAgICAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIHVpZCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJylcbiAgLCB3a3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3drcycpXG4gICwga2V5T2YgICAgICAgICAgPSByZXF1aXJlKCcuL19rZXlvZicpXG4gICwgZW51bUtleXMgICAgICAgPSByZXF1aXJlKCcuL19lbnVtLWtleXMnKVxuICAsIGlzQXJyYXkgICAgICAgID0gcmVxdWlyZSgnLi9faXMtYXJyYXknKVxuICAsIGFuT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCB0b0lPYmplY3QgICAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcbiAgLCBjcmVhdGVEZXNjICAgICA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKVxuICAsIF9jcmVhdGUgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgZ09QTkV4dCAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbi1leHQnKVxuICAsICRHT1BEICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKVxuICAsICREUCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBnT1BEICAgICAgICAgICA9ICRHT1BELmZcbiAgLCBkUCAgICAgICAgICAgICA9ICREUC5mXG4gICwgZ09QTiAgICAgICAgICAgPSBnT1BORXh0LmZcbiAgLCAkU3ltYm9sICAgICAgICA9IGdsb2JhbC5TeW1ib2xcbiAgLCAkSlNPTiAgICAgICAgICA9IGdsb2JhbC5KU09OXG4gICwgX3N0cmluZ2lmeSAgICAgPSAkSlNPTiAmJiAkSlNPTi5zdHJpbmdpZnlcbiAgLCBzZXR0ZXIgICAgICAgICA9IGZhbHNlXG4gICwgSElEREVOICAgICAgICAgPSB3a3MoJ19oaWRkZW4nKVxuICAsIGlzRW51bSAgICAgICAgID0ge30ucHJvcGVydHlJc0VudW1lcmFibGVcbiAgLCBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5JylcbiAgLCBBbGxTeW1ib2xzICAgICA9IHNoYXJlZCgnc3ltYm9scycpXG4gICwgT2JqZWN0UHJvdG8gICAgPSBPYmplY3QucHJvdG90eXBlXG4gICwgVVNFX05BVElWRSAgICAgPSB0eXBlb2YgJFN5bWJvbCA9PSAnZnVuY3Rpb24nXG4gICwgUU9iamVjdCAgICAgICAgPSBnbG9iYWwuUU9iamVjdDtcblxuLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9Njg3XG52YXIgc2V0U3ltYm9sRGVzYyA9IERFU0NSSVBUT1JTICYmICRmYWlscyhmdW5jdGlvbigpe1xuICByZXR1cm4gX2NyZWF0ZShkUCh7fSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gZFAodGhpcywgJ2EnLCB7dmFsdWU6IDd9KS5hOyB9XG4gIH0pKS5hICE9IDc7XG59KSA/IGZ1bmN0aW9uKGl0LCBrZXksIEQpe1xuICB2YXIgcHJvdG9EZXNjID0gZ09QRChPYmplY3RQcm90bywga2V5KTtcbiAgaWYocHJvdG9EZXNjKWRlbGV0ZSBPYmplY3RQcm90b1trZXldO1xuICBkUChpdCwga2V5LCBEKTtcbiAgaWYocHJvdG9EZXNjICYmIGl0ICE9PSBPYmplY3RQcm90bylkUChPYmplY3RQcm90bywga2V5LCBwcm90b0Rlc2MpO1xufSA6IGRQO1xuXG52YXIgd3JhcCA9IGZ1bmN0aW9uKHRhZyl7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSBfY3JlYXRlKCRTeW1ib2wucHJvdG90eXBlKTtcbiAgc3ltLl9rID0gdGFnO1xuICBERVNDUklQVE9SUyAmJiBzZXR0ZXIgJiYgc2V0U3ltYm9sRGVzYyhPYmplY3RQcm90bywgdGFnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgaWYoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSl0aGlzW0hJRERFTl1bdGFnXSA9IGZhbHNlO1xuICAgICAgc2V0U3ltYm9sRGVzYyh0aGlzLCB0YWcsIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufTtcblxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpe1xuICBhbk9iamVjdChpdCk7XG4gIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEQpO1xuICBpZihoYXMoQWxsU3ltYm9scywga2V5KSl7XG4gICAgaWYoIUQuZW51bWVyYWJsZSl7XG4gICAgICBpZighaGFzKGl0LCBISURERU4pKWRQKGl0LCBISURERU4sIGNyZWF0ZURlc2MoMSwge30pKTtcbiAgICAgIGl0W0hJRERFTl1ba2V5XSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0paXRbSElEREVOXVtrZXldID0gZmFsc2U7XG4gICAgICBEID0gX2NyZWF0ZShELCB7ZW51bWVyYWJsZTogY3JlYXRlRGVzYygwLCBmYWxzZSl9KTtcbiAgICB9IHJldHVybiBzZXRTeW1ib2xEZXNjKGl0LCBrZXksIEQpO1xuICB9IHJldHVybiBkUChpdCwga2V5LCBEKTtcbn07XG52YXIgJGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKXtcbiAgYW5PYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b0lPYmplY3QoUCkpXG4gICAgLCBpICAgID0gMFxuICAgICwgbCA9IGtleXMubGVuZ3RoXG4gICAgLCBrZXk7XG4gIHdoaWxlKGwgPiBpKSRkZWZpbmVQcm9wZXJ0eShpdCwga2V5ID0ga2V5c1tpKytdLCBQW2tleV0pO1xuICByZXR1cm4gaXQ7XG59O1xudmFyICRjcmVhdGUgPSBmdW5jdGlvbiBjcmVhdGUoaXQsIFApe1xuICByZXR1cm4gUCA9PT0gdW5kZWZpbmVkID8gX2NyZWF0ZShpdCkgOiAkZGVmaW5lUHJvcGVydGllcyhfY3JlYXRlKGl0KSwgUCk7XG59O1xudmFyICRwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKGtleSl7XG4gIHZhciBFID0gaXNFbnVtLmNhbGwodGhpcywga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKSk7XG4gIHJldHVybiBFIHx8ICFoYXModGhpcywga2V5KSB8fCAhaGFzKEFsbFN5bWJvbHMsIGtleSkgfHwgaGFzKHRoaXMsIEhJRERFTikgJiYgdGhpc1tISURERU5dW2tleV0gPyBFIDogdHJ1ZTtcbn07XG52YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgdmFyIEQgPSBnT1BEKGl0ID0gdG9JT2JqZWN0KGl0KSwga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKSk7XG4gIGlmKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSlELmVudW1lcmFibGUgPSB0cnVlO1xuICByZXR1cm4gRDtcbn07XG52YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgdmFyIG5hbWVzICA9IGdPUE4odG9JT2JqZWN0KGl0KSlcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOICYmIGtleSAhPSBNRVRBKXJlc3VsdC5wdXNoKGtleSk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ09QTih0b0lPYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkpcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJHN0cmluZ2lmeSA9IGZ1bmN0aW9uIHN0cmluZ2lmeShpdCl7XG4gIGlmKGl0ID09PSB1bmRlZmluZWQgfHwgaXNTeW1ib2woaXQpKXJldHVybjsgLy8gSUU4IHJldHVybnMgc3RyaW5nIG9uIHVuZGVmaW5lZFxuICB2YXIgYXJncyA9IFtpdF1cbiAgICAsIGkgICAgPSAxXG4gICAgLCByZXBsYWNlciwgJHJlcGxhY2VyO1xuICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICByZXBsYWNlciA9IGFyZ3NbMV07XG4gIGlmKHR5cGVvZiByZXBsYWNlciA9PSAnZnVuY3Rpb24nKSRyZXBsYWNlciA9IHJlcGxhY2VyO1xuICBpZigkcmVwbGFjZXIgfHwgIWlzQXJyYXkocmVwbGFjZXIpKXJlcGxhY2VyID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgaWYoJHJlcGxhY2VyKXZhbHVlID0gJHJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWx1ZSk7XG4gICAgaWYoIWlzU3ltYm9sKHZhbHVlKSlyZXR1cm4gdmFsdWU7XG4gIH07XG4gIGFyZ3NbMV0gPSByZXBsYWNlcjtcbiAgcmV0dXJuIF9zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3MpO1xufTtcbnZhciBCVUdHWV9KU09OID0gJGZhaWxzKGZ1bmN0aW9uKCl7XG4gIHZhciBTID0gJFN5bWJvbCgpO1xuICAvLyBNUyBFZGdlIGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyB7fVxuICAvLyBXZWJLaXQgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIG51bGxcbiAgLy8gVjggdGhyb3dzIG9uIGJveGVkIHN5bWJvbHNcbiAgcmV0dXJuIF9zdHJpbmdpZnkoW1NdKSAhPSAnW251bGxdJyB8fCBfc3RyaW5naWZ5KHthOiBTfSkgIT0gJ3t9JyB8fCBfc3RyaW5naWZ5KE9iamVjdChTKSkgIT0gJ3t9Jztcbn0pO1xuXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcbmlmKCFVU0VfTkFUSVZFKXtcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCgpe1xuICAgIGlmKGlzU3ltYm9sKHRoaXMpKXRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG4gICAgcmV0dXJuIHdyYXAodWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKSk7XG4gIH07XG4gIHJlZGVmaW5lKCRTeW1ib2wucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICAgIHJldHVybiB0aGlzLl9rO1xuICB9KTtcblxuICBpc1N5bWJvbCA9IGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gaXQgaW5zdGFuY2VvZiAkU3ltYm9sO1xuICB9O1xuXG4gICRHT1BELmYgPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICAkRFAuZiAgID0gJGRlZmluZVByb3BlcnR5O1xuICByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmYgPSBnT1BORXh0LmYgPSAkZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpLmYgID0gJHByb3BlcnR5SXNFbnVtZXJhYmxlXG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJykuZiA9ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYoREVTQ1JJUFRPUlMgJiYgIXJlcXVpcmUoJy4vX2xpYnJhcnknKSl7XG4gICAgcmVkZWZpbmUoT2JqZWN0UHJvdG8sICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICRwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG4gIH1cbn1cblxuJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwge1N5bWJvbDogJFN5bWJvbH0pO1xuXG4vLyAxOS40LjIuMiBTeW1ib2wuaGFzSW5zdGFuY2Vcbi8vIDE5LjQuMi4zIFN5bWJvbC5pc0NvbmNhdFNwcmVhZGFibGVcbi8vIDE5LjQuMi40IFN5bWJvbC5pdGVyYXRvclxuLy8gMTkuNC4yLjYgU3ltYm9sLm1hdGNoXG4vLyAxOS40LjIuOCBTeW1ib2wucmVwbGFjZVxuLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxuLy8gMTkuNC4yLjEwIFN5bWJvbC5zcGVjaWVzXG4vLyAxOS40LjIuMTEgU3ltYm9sLnNwbGl0XG4vLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXG4vLyAxOS40LjIuMTMgU3ltYm9sLnRvU3RyaW5nVGFnXG4vLyAxOS40LjIuMTQgU3ltYm9sLnVuc2NvcGFibGVzXG5mb3IodmFyIHN5bWJvbHMgPSAoXG4gICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsc3BlY2llcyxzcGxpdCx0b1ByaW1pdGl2ZSx0b1N0cmluZ1RhZyx1bnNjb3BhYmxlcydcbikuc3BsaXQoJywnKSwgaSA9IDA7IHN5bWJvbHMubGVuZ3RoID4gaTsgKXtcbiAgdmFyIGtleSAgICAgPSBzeW1ib2xzW2krK11cbiAgICAsIFdyYXBwZXIgPSBjb3JlLlN5bWJvbFxuICAgICwgc3ltICAgICA9IHdrcyhrZXkpO1xuICBpZighKGtleSBpbiBXcmFwcGVyKSlkUChXcmFwcGVyLCBrZXksIHt2YWx1ZTogVVNFX05BVElWRSA/IHN5bSA6IHdyYXAoc3ltKX0pO1xufTtcblxuLy8gRG9uJ3QgdXNlIHNldHRlcnMgaW4gUXQgU2NyaXB0LCBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvMTczXG5pZighUU9iamVjdCB8fCAhUU9iamVjdC5wcm90b3R5cGUgfHwgIVFPYmplY3QucHJvdG90eXBlLmZpbmRDaGlsZClzZXR0ZXIgPSB0cnVlO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnU3ltYm9sJywge1xuICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcbiAgJ2Zvcic6IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihrZXkpe1xuICAgIHJldHVybiBrZXlPZihTeW1ib2xSZWdpc3RyeSwga2V5KTtcbiAgfSxcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7IHNldHRlciA9IGZhbHNlOyB9XG59KTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICRjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogJGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIDI0LjMuMiBKU09OLnN0cmluZ2lmeSh2YWx1ZSBbLCByZXBsYWNlciBbLCBzcGFjZV1dKVxuJEpTT04gJiYgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAoIVVTRV9OQVRJVkUgfHwgQlVHR1lfSlNPTiksICdKU09OJywge3N0cmluZ2lmeTogJHN0cmluZ2lmeX0pO1xuXG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZygkU3ltYm9sLCAnU3ltYm9sJyk7XG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBlYWNoICAgICAgICAgPSByZXF1aXJlKCcuL19hcnJheS1tZXRob2RzJykoMClcbiAgLCByZWRlZmluZSAgICAgPSByZXF1aXJlKCcuL19yZWRlZmluZScpXG4gICwgbWV0YSAgICAgICAgID0gcmVxdWlyZSgnLi9fbWV0YScpXG4gICwgYXNzaWduICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWFzc2lnbicpXG4gICwgd2VhayAgICAgICAgID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbi13ZWFrJylcbiAgLCBpc09iamVjdCAgICAgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGhhcyAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgZ2V0V2VhayAgICAgID0gbWV0YS5nZXRXZWFrXG4gICwgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZVxuICAsIHVuY2F1Z2h0RnJvemVuU3RvcmUgPSB3ZWFrLnVmc3RvcmVcbiAgLCB0bXAgICAgICAgICAgPSB7fVxuICAsIEludGVybmFsTWFwO1xuXG52YXIgd3JhcHBlciA9IGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBXZWFrTWFwKCl7XG4gICAgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHMubGVuZ3RoID4gMCA/IGFyZ3VtZW50c1swXSA6IHVuZGVmaW5lZCk7XG4gIH07XG59O1xuXG52YXIgbWV0aG9kcyA9IHtcbiAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICBpZihpc09iamVjdChrZXkpKXtcbiAgICAgIHZhciBkYXRhID0gZ2V0V2VhayhrZXkpO1xuICAgICAgaWYoZGF0YSA9PT0gdHJ1ZSlyZXR1cm4gdW5jYXVnaHRGcm96ZW5TdG9yZSh0aGlzKS5nZXQoa2V5KTtcbiAgICAgIHJldHVybiBkYXRhID8gZGF0YVt0aGlzLl9pXSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0sXG4gIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywga2V5LCB2YWx1ZSk7XG4gIH1cbn07XG5cbi8vIDIzLjMgV2Vha01hcCBPYmplY3RzXG52YXIgJFdlYWtNYXAgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24nKSgnV2Vha01hcCcsIHdyYXBwZXIsIG1ldGhvZHMsIHdlYWssIHRydWUsIHRydWUpO1xuXG4vLyBJRTExIFdlYWtNYXAgZnJvemVuIGtleXMgZml4XG5pZihuZXcgJFdlYWtNYXAoKS5zZXQoKE9iamVjdC5mcmVlemUgfHwgT2JqZWN0KSh0bXApLCA3KS5nZXQodG1wKSAhPSA3KXtcbiAgSW50ZXJuYWxNYXAgPSB3ZWFrLmdldENvbnN0cnVjdG9yKHdyYXBwZXIpO1xuICBhc3NpZ24oSW50ZXJuYWxNYXAucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgbWV0YS5ORUVEID0gdHJ1ZTtcbiAgZWFjaChbJ2RlbGV0ZScsICdoYXMnLCAnZ2V0JywgJ3NldCddLCBmdW5jdGlvbihrZXkpe1xuICAgIHZhciBwcm90byAgPSAkV2Vha01hcC5wcm90b3R5cGVcbiAgICAgICwgbWV0aG9kID0gcHJvdG9ba2V5XTtcbiAgICByZWRlZmluZShwcm90bywga2V5LCBmdW5jdGlvbihhLCBiKXtcbiAgICAgIC8vIHN0b3JlIGZyb3plbiBvYmplY3RzIG9uIGludGVybmFsIHdlYWttYXAgc2hpbVxuICAgICAgaWYoaXNPYmplY3QoYSkgJiYgIWlzRXh0ZW5zaWJsZShhKSl7XG4gICAgICAgIGlmKCF0aGlzLl9mKXRoaXMuX2YgPSBuZXcgSW50ZXJuYWxNYXA7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9mW2tleV0oYSwgYik7XG4gICAgICAgIHJldHVybiBrZXkgPT0gJ3NldCcgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXG4gICAgICB9IHJldHVybiBtZXRob2QuY2FsbCh0aGlzLCBhLCBiKTtcbiAgICB9KTtcbiAgfSk7XG59IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyICRleHBvcnQgID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5QICsgJGV4cG9ydC5SLCAnU2V0Jywge3RvSlNPTjogcmVxdWlyZSgnLi9fY29sbGVjdGlvbi10by1qc29uJykoJ1NldCcpfSk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBnbG9iYWwgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBoaWRlICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgSXRlcmF0b3JzICAgICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgVE9fU1RSSU5HX1RBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5mb3IodmFyIGNvbGxlY3Rpb25zID0gWydOb2RlTGlzdCcsICdET01Ub2tlbkxpc3QnLCAnTWVkaWFMaXN0JywgJ1N0eWxlU2hlZXRMaXN0JywgJ0NTU1J1bGVMaXN0J10sIGkgPSAwOyBpIDwgNTsgaSsrKXtcbiAgdmFyIE5BTUUgICAgICAgPSBjb2xsZWN0aW9uc1tpXVxuICAgICwgQ29sbGVjdGlvbiA9IGdsb2JhbFtOQU1FXVxuICAgICwgcHJvdG8gICAgICA9IENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGU7XG4gIGlmKHByb3RvICYmICFwcm90b1tUT19TVFJJTkdfVEFHXSloaWRlKHByb3RvLCBUT19TVFJJTkdfVEFHLCBOQU1FKTtcbiAgSXRlcmF0b3JzW05BTUVdID0gSXRlcmF0b3JzLkFycmF5O1xufSJdfQ==
