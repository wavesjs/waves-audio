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

    /**
     * Scheduled interface
     *   - advanceTime(time), called to generate next event at given time, returns next time
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

      if (_timeEngine2.default.implementsSpeedControlled(engine)) this.__playControlled = new PlayControlledSpeedControlled(this, engine);else if (_timeEngine2.default.implementsTransported(engine)) this.__playControlled = new PlayControlledTransported(this, engine);else if (_timeEngine2.default.implementsScheduled(engine)) this.__playControlled = new PlayControlledScheduled(this, engine);else throw new Error("object cannot be added to play control");
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
        advanceTime: function advanceTime(time) {
          fun(time);
        } }, // make sur that the advanceTime method does not returm anything
      time);
    }

    // add a time engine to the scheduler

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!_timeEngine2.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

      if (engine.master) throw new Error("object has already been added to a master");

      // set master and add to array
      engine.master = this;
      this.__engines.add(engine);

      // schedule engine
      this.__scheduleEngine(engine, time);
      this.__resetTick();
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

      if (_timeEngine2.default.implementsTransported(engine)) transported = new TransportedTransported(this, engine, startPosition, endPosition, offsetPosition);else if (_timeEngine2.default.implementsSpeedControlled(engine)) transported = new TransportedSpeedControlled(this, engine, startPosition, endPosition, offsetPosition);else if (_timeEngine2.default.implementsScheduled(engine)) transported = new TransportedScheduled(this, engine, startPosition, endPosition, offsetPosition);else throw new Error("object cannot be added to a transport");

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
        advanceTime: function advanceTime(time) {
          fun(time);
        } }, // make sur that the advanceTime method does not returm anything
      time);
    }

    // add a time engine to the scheduler

  }, {
    key: 'add',
    value: function add(engine) {
      var time = arguments.length <= 1 || arguments[1] === undefined ? this.currentTime : arguments[1];

      if (!_timeEngine2.default.implementsScheduled(engine)) throw new Error("object cannot be added to scheduler");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkaXN0L2NvcmUvYXVkaW8tY29udGV4dC5qcyIsImRpc3QvY29yZS9hdWRpby10aW1lLWVuZ2luZS5qcyIsImRpc3QvY29yZS90aW1lLWVuZ2luZS5qcyIsImRpc3QvZW5naW5lcy9ncmFudWxhci1lbmdpbmUuanMiLCJkaXN0L2VuZ2luZXMvbWV0cm9ub21lLmpzIiwiZGlzdC9lbmdpbmVzL3BsYXllci1lbmdpbmUuanMiLCJkaXN0L2VuZ2luZXMvc2VnbWVudC1lbmdpbmUuanMiLCJkaXN0L2luZGV4LmpzIiwiZGlzdC9tYXN0ZXJzL2ZhY3Rvcmllcy5qcyIsImRpc3QvbWFzdGVycy9wbGF5LWNvbnRyb2wuanMiLCJkaXN0L21hc3RlcnMvc2NoZWR1bGVyLmpzIiwiZGlzdC9tYXN0ZXJzL3NpbXBsZS1zY2hlZHVsZXIuanMiLCJkaXN0L21hc3RlcnMvdHJhbnNwb3J0LmpzIiwiZGlzdC91dGlscy9wcmlvcml0eS1xdWV1ZS5qcyIsImRpc3QvdXRpbHMvc2NoZWR1bGluZy1xdWV1ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvZ2V0LWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3NldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2wvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3dlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvY3JlYXRlQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vZ2V0LWl0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3NldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3dlYWstbWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FuLWluc3RhbmNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hbi1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FycmF5LWZyb20taXRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1tZXRob2RzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY2xhc3NvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb2xsZWN0aW9uLXN0cm9uZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29sbGVjdGlvbi10by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jb2xsZWN0aW9uLXdlYWsuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvbGxlY3Rpb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NvcmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2N0eC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZGVmaW5lZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2VudW0tYnVnLWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2VudW0ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZm9yLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19nbG9iYWwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2hhcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGlkZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faHRtbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faWU4LWRvbS1kZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lvYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY2FsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyLXN0ZXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXJhdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fa2V5b2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2xpYnJhcnkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21ldGEuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLWV4dC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcG4uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtZ3BvLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1waWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1zYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLWFsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1wcm90by5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fc2V0LXNwZWNpZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC10by1zdHJpbmctdGFnLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQta2V5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3N0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW5kZXguanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWludGVnZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWlvYmplY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWxlbmd0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1wcmltaXRpdmUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fd2tzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc2V0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYud2Vhay1tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM3LnNldC50by1qc29uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNDQSxJQUFJLGVBQWUsSUFBZjs7QUFFSixJQUFJLGVBQWUsT0FBTyxZQUFQLElBQXVCLE9BQU8sa0JBQVA7O0FBRTFDLElBQUcsWUFBSCxFQUFpQjtBQUNmLGlCQUFlLElBQUksWUFBSixFQUFmLENBRGU7O0FBR2YsTUFBSSxpQkFBaUIsSUFBakIsQ0FBc0IsVUFBVSxTQUFWLENBQXRCLElBQThDLGFBQWEsVUFBYixHQUEwQixLQUExQixFQUFpQztBQUNqRixRQUFJLFNBQVMsYUFBYSxZQUFiLENBQTBCLENBQTFCLEVBQTZCLENBQTdCLEVBQWdDLEtBQWhDLENBQVQsQ0FENkU7QUFFakYsUUFBSSxRQUFRLGFBQWEsa0JBQWIsRUFBUixDQUY2RTtBQUdqRixVQUFNLE1BQU4sR0FBZSxNQUFmLENBSGlGO0FBSWpGLFVBQU0sT0FBTixDQUFjLGFBQWEsV0FBYixDQUFkLENBSmlGO0FBS2pGLFVBQU0sS0FBTixDQUFZLENBQVosRUFMaUY7QUFNakYsVUFBTSxVQUFOLEdBTmlGO0dBQW5GO0NBSEY7O2tCQWFlOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2xCZjs7OztBQUNBOzs7Ozs7Ozs7O0lBS3FCOzs7QUFDbkIsV0FEbUIsZUFDbkIsR0FBZ0Q7UUFBcEMsMkdB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7O0FDQUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTs7QUNGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTs7QUNGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gZXhwb3NlcyBhIHNpbmdsZSBpbnN0YW5jZVxudmFyIGF1ZGlvQ29udGV4dCA9IG51bGw7XG5cbnZhciBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQ7XG5cbmlmKEF1ZGlvQ29udGV4dCkge1xuICBhdWRpb0NvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbiAgaWYgKC8oaVBob25lfGlQYWQpL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiBhdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSA8IDQ0MTAwKSB7XG4gICAgdmFyIGJ1ZmZlciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoMSwgMSwgNDQxMDApO1xuICAgIHZhciBkdW1teSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICBkdW1teS5idWZmZXIgPSBidWZmZXI7XG4gICAgZHVtbXkuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIGR1bW15LnN0YXJ0KDApO1xuICAgIGR1bW15LmRpc2Nvbm5lY3QoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhdWRpb0NvbnRleHQ7XG4iLCJpbXBvcnQgVGltZUVuZ2luZSBmcm9tICcuL3RpbWUtZW5naW5lJztcbmltcG9ydCBkZWZhdWx0QXVkaW9Db250ZXh0IGZyb20gJy4vYXVkaW8tY29udGV4dCc7XG5cbi8qKlxuICogQGNsYXNzIEF1ZGlvVGltZUVuZ2luZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdWRpb1RpbWVFbmdpbmUgZXh0ZW5kcyBUaW1lRW5naW5le1xuICBjb25zdHJ1Y3RvcihhdWRpb0NvbnRleHQgPSBkZWZhdWx0QXVkaW9Db250ZXh0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gYXVkaW9Db250ZXh0O1xuICAgIHRoaXMub3V0cHV0Tm9kZSA9IG51bGw7XG4gIH1cblxuICBjb25uZWN0KHRhcmdldCkge1xuICAgIHRoaXMub3V0cHV0Tm9kZS5jb25uZWN0KHRhcmdldCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkaXNjb25uZWN0KGNvbm5lY3Rpb24pIHtcbiAgICB0aGlzLm91dHB1dE5vZGUuZGlzY29ubmVjdChjb25uZWN0aW9uKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiLyoqXG4gKiBAY2xhc3MgVGltZUVuZ2luZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tYXN0ZXIgPSBudWxsO1xuICAgIHRoaXMub3V0cHV0Tm9kZSA9IG51bGw7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2NoZWR1bGVkIGludGVyZmFjZVxuICAgKiAgIC0gYWR2YW5jZVRpbWUodGltZSksIGNhbGxlZCB0byBnZW5lcmF0ZSBuZXh0IGV2ZW50IGF0IGdpdmVuIHRpbWUsIHJldHVybnMgbmV4dCB0aW1lXG4gICAqL1xuICBzdGF0aWMgaW1wbGVtZW50c1NjaGVkdWxlZChlbmdpbmUpIHtcbiAgICByZXR1cm4gKGVuZ2luZS5hZHZhbmNlVGltZSAmJiBlbmdpbmUuYWR2YW5jZVRpbWUgaW5zdGFuY2VvZiBGdW5jdGlvbik7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lVGltZSh0aGlzLCB0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc3BvcnRlZCBpbnRlcmZhY2VcbiAgICogICAtIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gcmVwb3NpdGlvbiBUaW1lRW5naW5lLCByZXR1cm5zIG5leHQgcG9zaXRpb25cbiAgICogICAtIGFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpLCBjYWxsZWQgdG8gZ2VuZXJhdGUgbmV4dCBldmVudCBhdCBnaXZlbiB0aW1lIGFuZCBwb3NpdGlvbiwgcmV0dXJucyBuZXh0IHBvc2l0aW9uXG4gICAqL1xuICBzdGF0aWMgaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkge1xuICAgIHJldHVybiAoXG4gICAgICBlbmdpbmUuc3luY1Bvc2l0aW9uICYmIGVuZ2luZS5zeW5jUG9zaXRpb24gaW5zdGFuY2VvZiBGdW5jdGlvbiAmJlxuICAgICAgZW5naW5lLmFkdmFuY2VQb3NpdGlvbiAmJiBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb25cbiAgICApO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIGlmICh0aGlzLm1hc3RlcilcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlXG4gICAqICAgLSBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCApLCBjYWxsZWQgdG9cbiAgICovXG4gIHN0YXRpYyBpbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkge1xuICAgIHJldHVybiAoZW5naW5lLnN5bmNTcGVlZCAmJiBlbmdpbmUuc3luY1NwZWVkIGluc3RhbmNlb2YgRnVuY3Rpb24pO1xuICB9XG59XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZiAob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG4vKipcbiAqIEBjbGFzcyBHcmFudWxhckVuZ2luZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmFudWxhckVuZ2luZSBleHRlbmRzIEF1ZGlvVGltZUVuZ2luZSB7XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtBdWRpb0J1ZmZlcn0gYnVmZmVyIGluaXRpYWwgYXVkaW8gYnVmZmVyIGZvciBncmFudWxhciBzeW50aGVzaXNcbiAgICpcbiAgICogVGhlIGVuZ2luZSBpbXBsZW1lbnRzIHRoZSBcInNjaGVkdWxlZFwiIGludGVyZmFjZS5cbiAgICogVGhlIGdyYWluIHBvc2l0aW9uIChncmFpbiBvbnNldCBvciBjZW50ZXIgdGltZSBpbiB0aGUgYXVkaW8gYnVmZmVyKSBpcyBvcHRpb25hbGx5XG4gICAqIGRldGVybWluZWQgYnkgdGhlIGVuZ2luZSdzIGN1cnJlbnRQb3NpdGlvbiBhdHRyaWJ1dGUuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBBYnNvbHV0ZSBncmFpbiBwZXJpb2QgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwLjAxKTtcblxuICAgIC8qKlxuICAgICAqIEdyYWluIHBlcmlvZCByZWxhdGl2ZSB0byBhYnNvbHV0ZSBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RSZWwgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gZ3JhaW4gcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBncmFpbiBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogR3JhaW4gcG9zaXRpb24gKG9uc2V0IHRpbWUgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb24gPSBvcHRPckRlZihvcHRpb25zLnBvc2l0aW9uLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSBncmFpbiBwb3NpdGlvbiB2YXJpYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBvc2l0aW9uVmFyID0gb3B0T3JEZWYob3B0aW9ucy5wb3NpdGlvblZhciwgMC4wMDMpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgZ3JhaW4gZHVyYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFicywgMC4xKTsgLy8gYWJzb2x1dGUgZ3JhaW4gZHVyYXRpb25cblxuICAgIC8qKlxuICAgICAqIEdyYWluIGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdyYWluIHBlcmlvZCAob3ZlcmxhcClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuZHVyYXRpb25SZWwgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIGF0dGFjayB0aW1lIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tBYnMgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja0FicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBncmFpbiBkdXJhdGlvblxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tSZWwgPSBvcHRPckRlZihvcHRpb25zLmF0dGFja1JlbCwgMC41KTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIGF0dGFja1xuICAgICAqIEB0eXBlIHtTdHJpbmd9ICdsaW4nIGZvciBsaW5lYXIgcmFtcCwgJ2V4cCcgZm9yIGV4cG9uZW50aWFsXG4gICAgICovXG4gICAgdGhpcy5hdHRhY2tTaGFwZSA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrU2hhcGUsICdsaW4nKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZUFicyA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZUFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBSZWxlYXNlIHRpbWUgcmVsYXRpdmUgdG8gZ3JhaW4gZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVJlbCwgMC41KTtcblxuICAgIC8qKlxuICAgICAqIFNoYXBlIG9mIHJlbGVhc2VcbiAgICAgKiBAdHlwZSB7U3RyaW5nfSAnbGluJyBmb3IgbGluZWFyIHJhbXAsICdleHAnIGZvciBleHBvbmVudGlhbFxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVNoYXBlID0gb3B0T3JEZWYob3B0aW9ucy5yZWxlYXNlU2hhcGUsICdsaW4nKTtcblxuICAgIC8qKlxuICAgICAqIE9mZnNldCAoc3RhcnQvZW5kIHZhbHVlKSBmb3IgZXhwb25lbnRpYWwgYXR0YWNrL3JlbGVhc2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfSBvZmZzZXRcbiAgICAgKi9cbiAgICB0aGlzLmV4cFJhbXBPZmZzZXQgPSBvcHRPckRlZihvcHRpb25zLmV4cFJhbXBPZmZzZXQsIDAuMDAwMSk7XG5cbiAgICAvKipcbiAgICAgKiBHcmFpbiByZXNhbXBsaW5nIGluIGNlbnRcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVzYW1wbGluZyA9IG9wdE9yRGVmKG9wdGlvbnMucmVzYW1wbGluZywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBbW91dCBvZiByYW5kb20gcmVzYW1wbGluZyB2YXJpYXRpb24gaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nVmFyID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nVmFyLCAwKTtcblxuICAgIC8qKlxuICAgICAqIExpbmVhciBnYWluIGZhY3RvclxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5nYWluID0gb3B0T3JEZWYob3B0aW9ucy5nYWluLCAxKTtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdGhlIGdyYWluIHBvc2l0aW9uIHJlZmVycyB0byB0aGUgY2VudGVyIG9mIHRoZSBncmFpbiAob3IgdGhlIGJlZ2lubmluZylcbiAgICAgKiBAdHlwZSB7Qm9vbH1cbiAgICAgKi9cbiAgICB0aGlzLmNlbnRlcmVkID0gb3B0T3JEZWYob3B0aW9ucy5jZW50ZXJlZCwgdHJ1ZSk7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgYW5kIGdyYWluIHBvc2l0aW9uIGFyZSBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgICAqIEB0eXBlIHtCb29sfVxuICAgICAqL1xuICAgIHRoaXMuY3ljbGljID0gb3B0T3JEZWYob3B0aW9ucy5jeWNsaWMsIGZhbHNlKTtcblxuICAgIC8qKlxuICAgICAqIFBvcnRpb24gYXQgdGhlIGVuZCBvZiB0aGUgYXVkaW8gYnVmZmVyIHRoYXQgaGFzIGJlZW4gY29waWVkIGZyb20gdGhlIGJlZ2lubmluZyB0byBhc3N1cmUgY3ljbGljIGJlaGF2aW9yXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLndyYXBBcm91bmRFeHRlbnNpb24gPSBvcHRPckRlZihvcHRpb25zLndyYXBBcm91bmRFeHRlbnNpb24sIDApO1xuXG4gICAgdGhpcy5vdXRwdXROb2RlID0gdGhpcy5hdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBidWZmZXIgZHVyYXRpb24gKGV4Y2x1ZGluZyB3cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGN1cnJlbnQgYnVmZmVyIGR1cmF0aW9uXG4gICAqL1xuICBnZXQgYnVmZmVyRHVyYXRpb24oKSB7XG4gICAgaWYgKHRoaXMuYnVmZmVyKSB7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgICAgaWYgKHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbilcbiAgICAgICAgYnVmZmVyRHVyYXRpb24gLT0gdGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uO1xuXG4gICAgICByZXR1cm4gYnVmZmVyRHVyYXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIGF0dHJpYnV0ZVxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHZhciBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbjtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdGltZSA9IE1hdGgubWF4KHRpbWUsIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICByZXR1cm4gdGltZSArIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgZ3JhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHRpbWUgZ3JhaW4gc3ludGhlc2lzIGF1ZGlvIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBwZXJpb2QgdG8gbmV4dCBncmFpblxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBncmFpbiBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgZ3JhaW4gcGFyYW1ldGVycy5cbiAgICovXG4gIHRyaWdnZXIodGltZSkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcbiAgICB2YXIgZ3JhaW5UaW1lID0gdGltZSB8fCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgdmFyIGdyYWluUGVyaW9kID0gdGhpcy5wZXJpb2RBYnM7XG4gICAgdmFyIGdyYWluUG9zaXRpb24gPSB0aGlzLmN1cnJlbnRQb3NpdGlvbjtcbiAgICB2YXIgZ3JhaW5EdXJhdGlvbiA9IHRoaXMuZHVyYXRpb25BYnM7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciByZXNhbXBsaW5nUmF0ZSA9IDEuMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIGdyYWluUGVyaW9kICs9IHRoaXMucGVyaW9kUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgIGdyYWluRHVyYXRpb24gKz0gdGhpcy5kdXJhdGlvblJlbCAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBncmFpbiBwZXJpb2QgcmFuZG9uIHZhcmlhdGlvblxuICAgICAgaWYgKHRoaXMucGVyaW9kVmFyID4gMC4wKVxuICAgICAgICBncmFpblBlcmlvZCArPSAyLjAgKiAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiB0aGlzLnBlcmlvZFZhciAqIGdyYWluUGVyaW9kO1xuXG4gICAgICAvLyBjZW50ZXIgZ3JhaW5cbiAgICAgIGlmICh0aGlzLmNlbnRlcmVkKVxuICAgICAgICBncmFpblBvc2l0aW9uIC09IDAuNSAqIGdyYWluRHVyYXRpb247XG5cbiAgICAgIC8vIHJhbmRvbWl6ZSBncmFpbiBwb3NpdGlvblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25WYXIgPiAwKVxuICAgICAgICBncmFpblBvc2l0aW9uICs9ICgyLjAgKiBNYXRoLnJhbmRvbSgpIC0gMSkgKiB0aGlzLnBvc2l0aW9uVmFyO1xuXG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAvLyB3cmFwIG9yIGNsaXAgZ3JhaW4gcG9zaXRpb24gYW5kIGR1cmF0aW9uIGludG8gYnVmZmVyIGR1cmF0aW9uXG4gICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiA8IDAgfHwgZ3JhaW5Qb3NpdGlvbiA+PSBidWZmZXJEdXJhdGlvbikge1xuICAgICAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgICAgICB2YXIgY3ljbGVzID0gZ3JhaW5Qb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICAgIGdyYWluUG9zaXRpb24gPSAoY3ljbGVzIC0gTWF0aC5mbG9vcihjeWNsZXMpKSAqIGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgICAgaWYgKGdyYWluUG9zaXRpb24gKyBncmFpbkR1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb24gLSBncmFpblBvc2l0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChncmFpblBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgZ3JhaW5UaW1lIC09IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpbkR1cmF0aW9uICs9IGdyYWluUG9zaXRpb247XG4gICAgICAgICAgICBncmFpblBvc2l0aW9uID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZ3JhaW5Qb3NpdGlvbiArIGdyYWluRHVyYXRpb24gPiBidWZmZXJEdXJhdGlvbilcbiAgICAgICAgICAgIGdyYWluRHVyYXRpb24gPSBidWZmZXJEdXJhdGlvbiAtIGdyYWluUG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gbWFrZSBncmFpblxuICAgICAgaWYgKHRoaXMuZ2FpbiA+IDAgJiYgZ3JhaW5EdXJhdGlvbiA+PSAwLjAwMSkge1xuICAgICAgICAvLyBtYWtlIGdyYWluIGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogZ3JhaW5EdXJhdGlvbjtcbiAgICAgICAgdmFyIHJlbGVhc2UgPSB0aGlzLnJlbGVhc2VBYnMgKyB0aGlzLnJlbGVhc2VSZWwgKiBncmFpbkR1cmF0aW9uO1xuXG4gICAgICAgIGlmIChhdHRhY2sgKyByZWxlYXNlID4gZ3JhaW5EdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBncmFpbkR1cmF0aW9uIC8gKGF0dGFjayArIHJlbGVhc2UpO1xuICAgICAgICAgIGF0dGFjayAqPSBmYWN0b3I7XG4gICAgICAgICAgcmVsZWFzZSAqPSBmYWN0b3I7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXR0YWNrRW5kVGltZSA9IGdyYWluVGltZSArIGF0dGFjaztcbiAgICAgICAgdmFyIGdyYWluRW5kVGltZSA9IGdyYWluVGltZSArIGdyYWluRHVyYXRpb24gLyByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgdmFyIHJlbGVhc2VTdGFydFRpbWUgPSBncmFpbkVuZFRpbWUgLSByZWxlYXNlO1xuXG4gICAgICAgIGVudmVsb3BlLmdhaW4udmFsdWUgPSAwO1xuXG4gICAgICAgIGlmICh0aGlzLmF0dGFja1NoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUoMC4wLCBncmFpblRpbWUpO1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZXhwUmFtcE9mZnNldCwgZ3JhaW5UaW1lKTtcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLmV4cG9uZW50aWFsUmFtcFRvVmFsdWVBdFRpbWUodGhpcy5nYWluLCBhdHRhY2tFbmRUaW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWxlYXNlU3RhcnRUaW1lID4gYXR0YWNrRW5kVGltZSlcbiAgICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgcmVsZWFzZVN0YXJ0VGltZSk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVsZWFzZVNoYXBlID09PSAnbGluJykge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMC4wLCBncmFpbkVuZFRpbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudmVsb3BlLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSh0aGlzLmV4cFJhbXBPZmZzZXQsIGdyYWluRW5kVGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBlbnZlbG9wZS5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChncmFpblRpbWUsIGdyYWluUG9zaXRpb24pO1xuICAgICAgICBzb3VyY2Uuc3RvcChncmFpbkVuZFRpbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBncmFpblBlcmlvZDtcbiAgfVxufVxuIiwiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXRyb25vbWUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICAvKipcbiAgICAgKiBNZXRyb25vbWUgcGVyaW9kXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLl9fcGVyaW9kID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2QsIDEpO1xuXG4gICAgLyoqXG4gICAgICogTWV0cm9ub21lIGNsaWNrIGZyZXF1ZW5jeVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja0ZyZXEgPSBvcHRPckRlZihvcHRpb25zLmNsaWNrRnJlcSwgNjAwKTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayBhdHRhY2sgdGltZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5jbGlja0F0dGFjayA9IG9wdE9yRGVmKG9wdGlvbnMuY2xpY2tBdHRhY2ssIDAuMDAyKTtcblxuICAgIC8qKlxuICAgICAqIE1ldHJvbm9tZSBjbGljayByZWxlYXNlIHRpbWVcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuY2xpY2tSZWxlYXNlID0gb3B0T3JEZWYob3B0aW9ucy5jbGlja1JlbGVhc2UsIDAuMDk4KTtcblxuICAgIHRoaXMuX19sYXN0VGltZSA9IDA7XG4gICAgdGhpcy5fX3BoYXNlID0gMDtcblxuICAgIHRoaXMuX19nYWluTm9kZSA9IHRoaXMuYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IG9wdE9yRGVmKG9wdGlvbnMuZ2FpbiwgMSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHRoaXMudHJpZ2dlcih0aW1lKTtcbiAgICB0aGlzLl9fbGFzdFRpbWUgPSB0aW1lO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIHN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAodGhpcy5fX3BlcmlvZCA+IDApIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb24gPSAoTWF0aC5mbG9vcihwb3NpdGlvbiAvIHRoaXMuX19wZXJpb2QpICsgdGhpcy5fX3BoYXNlKSAqIHRoaXMuX19wZXJpb2Q7XG5cbiAgICAgIGlmIChzcGVlZCA+IDAgJiYgbmV4dFBvc2l0aW9uIDwgcG9zaXRpb24pXG4gICAgICAgIG5leHRQb3NpdGlvbiArPSB0aGlzLl9fcGVyaW9kO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIG5leHRQb3NpdGlvbiA+IHBvc2l0aW9uKVxuICAgICAgICBuZXh0UG9zaXRpb24gLT0gdGhpcy5fX3BlcmlvZDtcblxuICAgICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy50cmlnZ2VyKHRpbWUpO1xuXG4gICAgaWYgKHNwZWVkIDwgMClcbiAgICAgIHJldHVybiBwb3NpdGlvbiAtIHRoaXMuX19wZXJpb2Q7XG5cbiAgICByZXR1cm4gcG9zaXRpb24gKyB0aGlzLl9fcGVyaW9kO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgbWV0cm9ub21lIGNsaWNrXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIG1ldHJvbm9tZSBjbGljayBzeW50aGVzaXMgYXVkaW8gdGltZVxuICAgKi9cbiAgdHJpZ2dlcih0aW1lKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgY29uc3QgY2xpY2tBdHRhY2sgPSB0aGlzLmNsaWNrQXR0YWNrO1xuICAgIGNvbnN0IGNsaWNrUmVsZWFzZSA9IHRoaXMuY2xpY2tSZWxlYXNlO1xuXG4gICAgY29uc3QgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBlbnYuZ2Fpbi52YWx1ZSA9IDAuMDtcbiAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLjAsIHRpbWUgKyBjbGlja0F0dGFjayk7XG4gICAgZW52LmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMDAwMDEsIHRpbWUgKyBjbGlja0F0dGFjayArIGNsaWNrUmVsZWFzZSk7XG4gICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgdGltZSk7XG4gICAgZW52LmNvbm5lY3QodGhpcy5vdXRwdXROb2RlKTtcblxuICAgIGNvbnN0IG9zYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgb3NjLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMuY2xpY2tGcmVxO1xuICAgIG9zYy5zdGFydCh0aW1lKTtcbiAgICBvc2Muc3RvcCh0aW1lICsgY2xpY2tBdHRhY2sgKyBjbGlja1JlbGVhc2UpO1xuICAgIG9zYy5jb25uZWN0KGVudik7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBnYWluXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBnYWluXG4gICAqL1xuICBnZXQgZ2FpbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBlcmlvZCBwYXJhbWV0ZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBlcmlvZCBtZXRyb25vbWUgcGVyaW9kXG4gICAqL1xuICBzZXQgcGVyaW9kKHBlcmlvZCkge1xuICAgIHRoaXMuX19wZXJpb2QgPSBwZXJpb2Q7XG5cbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIpIHtcbiAgICAgIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKVxuICAgICAgICBtYXN0ZXIucmVzZXRFbmdpbmVUaW1lKHRoaXMsIHRoaXMuX19sYXN0VGltZSArIHBlcmlvZCk7XG4gICAgICBlbHNlIGlmIChtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbilcbiAgICAgICAgbWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBwZXJpb2QgcGFyYW1ldGVyXG4gICAqIEByZXR1cm4ge051bWJlcn0gdmFsdWUgb2YgcGVyaW9kIHBhcmFtZXRlclxuICAgKi9cbiAgZ2V0IHBlcmlvZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BlcmlvZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcGhhc2UgcGFyYW1ldGVyIChhdmFpbGFibGUgb25seSB3aGVuICd0cmFuc3BvcnRlZCcpXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBwaGFzZSBtZXRyb25vbWUgcGhhc2UgWzAsIDFbXG4gICAqL1xuICBzZXQgcGhhc2UocGhhc2UpIHtcbiAgICB0aGlzLl9fcGhhc2UgPSBwaGFzZSAtIE1hdGguZmxvb3IocGhhc2UpO1xuXG4gICAgY29uc3QgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgcGhhc2UgcGFyYW1ldGVyXG4gICAqIEByZXR1cm4ge051bWJlcn0gdmFsdWUgb2YgcGhhc2UgcGFyYW1ldGVyXG4gICAqL1xuICBnZXQgcGhhc2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19waGFzZTtcbiAgfVxufVxuIiwiaW1wb3J0IEF1ZGlvVGltZUVuZ2luZSBmcm9tICcuLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuZnVuY3Rpb24gb3B0T3JEZWYob3B0LCBkZWYpIHtcbiAgaWYob3B0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIG9wdDtcblxuICByZXR1cm4gZGVmO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFbmdpbmUgZXh0ZW5kcyBBdWRpb1RpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcihvcHRpb25zLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLnRyYW5zcG9ydCA9IG51bGw7IC8vIHNldCB3aGVuIGFkZGVkIHRvIHRyYW5zcG9ydGVyXG5cbiAgICAvKipcbiAgICAgKiBBdWRpbyBidWZmZXJcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5idWZmZXIgPSBvcHRPckRlZihvcHRpb25zLmJ1ZmZlciwgbnVsbCk7XG5cbiAgICAvKipcbiAgICAgKiBGYWRlIHRpbWUgZm9yIGNoYWluaW5nIHNlZ21lbnRzIChlLmcuIGluIHN0YXJ0LCBzdG9wLCBhbmQgc2VlaylcbiAgICAgKiBAdHlwZSB7QXVkaW9CdWZmZXJ9XG4gICAgICovXG4gICAgdGhpcy5mYWRlVGltZSA9IG9wdE9yRGVmKG9wdGlvbnMuZmFkZVRpbWUsIDAuMDA1KTtcblxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gbnVsbDtcbiAgICB0aGlzLl9fZW52Tm9kZSA9IG51bGw7XG5cbiAgICB0aGlzLl9fZ2Fpbk5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUgPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgdGhpcy5fX2N5Y2xpYyA9IG9wdE9yRGVmKG9wdGlvbnMuY3ljbGljLCBmYWxzZSk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLl9fZ2Fpbk5vZGU7XG4gIH1cblxuICBfX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBhdWRpb0NvbnRleHQgPSB0aGlzLmF1ZGlvQ29udGV4dDtcblxuICAgIGlmICh0aGlzLmJ1ZmZlcikge1xuICAgICAgdmFyIGJ1ZmZlckR1cmF0aW9uID0gdGhpcy5idWZmZXIuZHVyYXRpb247XG5cbiAgICAgIGlmICh0aGlzLl9fY3ljbGljICYmIChwb3NpdGlvbiA8IDAgfHwgcG9zaXRpb24gPj0gYnVmZmVyRHVyYXRpb24pKSB7XG4gICAgICAgIHZhciBwaGFzZSA9IHBvc2l0aW9uIC8gYnVmZmVyRHVyYXRpb247XG4gICAgICAgIHBvc2l0aW9uID0gKHBoYXNlIC0gTWF0aC5mbG9vcihwaGFzZSkpICogYnVmZmVyRHVyYXRpb247XG4gICAgICB9XG5cbiAgICAgIGlmIChwb3NpdGlvbiA+PSAwICYmIHBvc2l0aW9uIDwgYnVmZmVyRHVyYXRpb24gJiYgc3BlZWQgPiAwKSB7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCB0aW1lKTtcbiAgICAgICAgdGhpcy5fX2Vudk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gICAgICAgIHRoaXMuX19lbnZOb2RlLmNvbm5lY3QodGhpcy5fX2dhaW5Ob2RlKTtcblxuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRoaXMuYnVmZmVyO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNwZWVkO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3AgPSB0aGlzLl9fY3ljbGljO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IDA7XG4gICAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UubG9vcEVuZCA9IGJ1ZmZlckR1cmF0aW9uO1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnN0YXJ0KHRpbWUsIHBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5fX2J1ZmZlclNvdXJjZS5jb25uZWN0KHRoaXMuX19lbnZOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfX2hhbHQodGltZSkge1xuICAgIGlmICh0aGlzLl9fYnVmZmVyU291cmNlKSB7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICAgIHRoaXMuX19lbnZOb2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5fX2Vudk5vZGUuZ2Fpbi52YWx1ZSwgdGltZSk7XG4gICAgICB0aGlzLl9fZW52Tm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIHRpbWUgKyB0aGlzLmZhZGVUaW1lKTtcbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2Uuc3RvcCh0aW1lICsgdGhpcy5mYWRlVGltZSk7XG5cbiAgICAgIHRoaXMuX19idWZmZXJTb3VyY2UgPSBudWxsO1xuICAgICAgdGhpcy5fX2Vudk5vZGUgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzcGVlZC1jb250cm9sbGVkIGludGVyZmFjZSlcbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2VlayA9IGZhbHNlKSB7XG4gICAgdmFyIGxhc3RTcGVlZCA9IHRoaXMuX19zcGVlZDtcblxuICAgIGlmIChzcGVlZCAhPT0gbGFzdFNwZWVkIHx8IHNlZWspIHtcbiAgICAgIGlmIChzZWVrIHx8IGxhc3RTcGVlZCAqIHNwZWVkIDwgMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgICAgdGhpcy5fX3N0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RTcGVlZCA9PT0gMCB8fCBzZWVrKSB7XG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fX2J1ZmZlclNvdXJjZSkge1xuICAgICAgICB0aGlzLl9fYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS5zZXRWYWx1ZUF0VGltZShzcGVlZCwgdGltZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgd2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGlzIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAqIEBwYXJhbSB7Qm9vbH0gY3ljbGljIHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKi9cbiAgc2V0IGN5Y2xpYyhjeWNsaWMpIHtcbiAgICBpZiAoY3ljbGljICE9PSB0aGlzLl9fY3ljbGljKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLmN1cnJlbnRvc2l0aW9uO1xuXG4gICAgICB0aGlzLl9faGFsdCh0aW1lKTtcbiAgICAgIHRoaXMuX19jeWNsaWMgPSBjeWNsaWM7XG5cbiAgICAgIGlmICh0aGlzLl9fc3BlZWQgIT09IDApXG4gICAgICAgIHRoaXMuX19zdGFydCh0aW1lLCBwb3NpdGlvbiwgdGhpcy5fX3NwZWVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHdoZXRoZXIgdGhlIGF1ZGlvIGJ1ZmZlciBpcyBjb25zaWRlcmVkIGFzIGN5Y2xpY1xuICAgKiBAcmV0dXJuIHtCb29sfSB3aGV0aGVyIHRoZSBhdWRpbyBidWZmZXIgaXMgY29uc2lkZXJlZCBhcyBjeWNsaWNcbiAgICovXG4gIGdldCBjeWNsaWMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jeWNsaWM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGdhaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlIGxpbmVhciBnYWluIGZhY3RvclxuICAgKi9cbiAgc2V0IGdhaW4odmFsdWUpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuY3VycmVudFRpbWU7XG4gICAgdGhpcy5fX2dhaW5Ob2RlLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aW1lKTtcbiAgICB0aGlzLl9fZ2Fpbk5vZGUuc2V0VmFsdWVBdFRpbWUodGhpcy5fX2dhaW5Ob2RlLmdhaW4udmFsdWUsIHRpbWUpO1xuICAgIHRoaXMuX19nYWluTm9kZS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCB0aW1lICsgdGhpcy5mYWRlVGltZSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGdhaW5cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IGdhaW5cbiAgICovXG4gIGdldCBnYWluKCkge1xuICAgIHJldHVybiB0aGlzLl9fZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYnVmZmVyIGR1cmF0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBidWZmZXIgZHVyYXRpb25cbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZih0aGlzLmJ1ZmZlcilcbiAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5kdXJhdGlvbjtcblxuICAgIHJldHVybiAwO1xuICB9XG59XG4iLCJpbXBvcnQgQXVkaW9UaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvYXVkaW8tdGltZS1lbmdpbmUnO1xuXG5mdW5jdGlvbiBvcHRPckRlZihvcHQsIGRlZikge1xuICBpZihvcHQgIT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gb3B0O1xuXG4gIHJldHVybiBkZWY7XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRPclByZXZpb3VzSW5kZXgoc29ydGVkQXJyYXksIHZhbHVlLCBpbmRleCA9IDApIHtcbiAgdmFyIHNpemUgPSBzb3J0ZWRBcnJheS5sZW5ndGg7XG5cbiAgaWYgKHNpemUgPiAwKSB7XG4gICAgdmFyIGZpcnN0VmFsID0gc29ydGVkQXJyYXlbMF07XG4gICAgdmFyIGxhc3RWYWwgPSBzb3J0ZWRBcnJheVtzaXplIC0gMV07XG5cbiAgICBpZiAodmFsdWUgPCBmaXJzdFZhbClcbiAgICAgIGluZGV4ID0gLTE7XG4gICAgZWxzZSBpZiAodmFsdWUgPj0gbGFzdFZhbClcbiAgICAgIGluZGV4ID0gc2l6ZSAtIDE7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHNpemUpXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigoc2l6ZSAtIDEpICogKHZhbHVlIC0gZmlyc3RWYWwpIC8gKGxhc3RWYWwgLSBmaXJzdFZhbCkpO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXhdID4gdmFsdWUpXG4gICAgICAgIGluZGV4LS07XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleCArIDFdIDw9IHZhbHVlKVxuICAgICAgICBpbmRleCsrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudE9yTmV4dEluZGV4KHNvcnRlZEFycmF5LCB2YWx1ZSwgaW5kZXggPSAwKSB7XG4gIHZhciBzaXplID0gc29ydGVkQXJyYXkubGVuZ3RoO1xuXG4gIGlmIChzaXplID4gMCkge1xuICAgIHZhciBmaXJzdFZhbCA9IHNvcnRlZEFycmF5WzBdO1xuICAgIHZhciBsYXN0VmFsID0gc29ydGVkQXJyYXlbc2l6ZSAtIDFdO1xuXG4gICAgaWYgKHZhbHVlIDw9IGZpcnN0VmFsKVxuICAgICAgaW5kZXggPSAwO1xuICAgIGVsc2UgaWYgKHZhbHVlID49IGxhc3RWYWwpXG4gICAgICBpbmRleCA9IHNpemU7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHNpemUpXG4gICAgICAgIGluZGV4ID0gTWF0aC5mbG9vcigoc2l6ZSAtIDEpICogKHZhbHVlIC0gZmlyc3RWYWwpIC8gKGxhc3RWYWwgLSBmaXJzdFZhbCkpO1xuXG4gICAgICB3aGlsZSAoc29ydGVkQXJyYXlbaW5kZXhdIDwgdmFsdWUpXG4gICAgICAgIGluZGV4Kys7XG5cbiAgICAgIHdoaWxlIChzb3J0ZWRBcnJheVtpbmRleCArIDFdID49IHZhbHVlKVxuICAgICAgICBpbmRleC0tO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn1cblxuLyoqXG4gKiBAY2xhc3MgU2VnbWVudEVuZ2luZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWdtZW50RW5naW5lIGV4dGVuZHMgQXVkaW9UaW1lRW5naW5lIHtcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge0F1ZGlvQnVmZmVyfSBidWZmZXIgaW5pdGlhbCBhdWRpbyBidWZmZXIgZm9yIGdyYW51bGFyIHN5bnRoZXNpc1xuICAgKlxuICAgKiBUaGUgZW5naW5lIGltcGxlbWVudHMgdGhlIFwic2NoZWR1bGVkXCIgYW5kIFwidHJhbnNwb3J0ZWRcIiBpbnRlcmZhY2VzLlxuICAgKiBXaGVuIFwic2NoZWR1bGVkXCIsIHRoZSBlbmdpbmUgIGdlbmVyYXRlcyBzZWdtZW50cyBtb3JlIG9yIGxlc3PCoHBlcmlvZGljYWxseVxuICAgKiAoY29udHJvbGxlZCBieSB0aGUgcGVyaW9kQWJzLCBwZXJpb2RSZWwsIGFuZCBwZXJpb1ZhciBhdHRyaWJ1dGVzKS5cbiAgICogV2hlbiBcInRyYW5zcG9ydGVkXCIsIHRoZSBlbmdpbmUgZ2VuZXJhdGVzIHNlZ21lbnRzIGF0IHRoZSBwb3NpdGlvbiBvZiB0aGVpciBvbnNldCB0aW1lLlxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIob3B0aW9ucy5hdWRpb0NvbnRleHQpO1xuXG4gICAgLyoqXG4gICAgICogQXVkaW8gYnVmZmVyXG4gICAgICogQHR5cGUge0F1ZGlvQnVmZmVyfVxuICAgICAqL1xuICAgIHRoaXMuYnVmZmVyID0gb3B0T3JEZWYob3B0aW9ucy5idWZmZXIsIG51bGwpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgc2VnbWVudCBwZXJpb2QgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnBlcmlvZEFicyA9IG9wdE9yRGVmKG9wdGlvbnMucGVyaW9kQWJzLCAwKTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyLXNlZ21lbnQgZGlzdGFuY2VcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kUmVsID0gb3B0T3JEZWYob3B0aW9ucy5wZXJpb2RSZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcGVyaW9kIHZhcmlhdGlvbiByZWxhdGl2ZSB0byBzZWdtZW50IHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2RWYXIgPSBvcHRPckRlZihvcHRpb25zLnBlcmlvZFZhciwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBBcnJheSBvZiBzZWdtZW50IHBvc2l0aW9ucyAob25zZXQgdGltZXMgaW4gYXVkaW8gYnVmZmVyKSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucG9zaXRpb25BcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25BcnJheSwgWzAuMF0pO1xuXG4gICAgLyoqXG4gICAgICogQW1vdXQgb2YgcmFuZG9tIHNlZ21lbnQgcG9zaXRpb24gdmFyaWF0aW9uIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wb3NpdGlvblZhciA9IG9wdE9yRGVmKG9wdGlvbnMucG9zaXRpb25WYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBkdXJhdGlvbnMgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQXJyYXkgPSBvcHRPckRlZihvcHRpb25zLmR1cmF0aW9uQXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgZHVyYXRpb24gaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmR1cmF0aW9uQWJzID0gb3B0T3JEZWYob3B0aW9ucy5kdXJhdGlvbkFicywgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IGR1cmF0aW9uIHJlbGF0aXZlIHRvIGdpdmVuIHNlZ21lbnQgZHVyYXRpb24gb3IgaW50ZXItc2VnbWVudCBkaXN0YW5jZVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5kdXJhdGlvblJlbCA9IG9wdE9yRGVmKG9wdGlvbnMuZHVyYXRpb25SZWwsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2Ygc2VnbWVudCBvZmZzZXRzIGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICpcbiAgICAgKiBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAqIG9mZnNldCA8IDA6IHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uIGlzIHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGFuZCB0aGUgZHVyYXRpb24gaGFzIHRvIGJlIGNvcnJlY3RlZCBieSB0aGUgb2Zmc2V0XG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRBcnJheSA9IG9wdE9yRGVmKG9wdGlvbnMub2Zmc2V0QXJyYXksIFswLjBdKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHNlZ21lbnQgb2Zmc2V0IGluIHNlY1xuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5vZmZzZXRBYnMgPSBvcHRPckRlZihvcHRpb25zLm9mZnNldEFicywgLTAuMDA1KTtcblxuICAgIC8qKlxuICAgICAqIFNlZ21lbnQgb2Zmc2V0IHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMub2Zmc2V0UmVsID0gb3B0T3JEZWYob3B0aW9ucy5vZmZzZXRSZWwsIDApO1xuXG4gICAgLyoqXG4gICAgICogVGltZSBieSB3aGljaCBhbGwgc2VnbWVudHMgYXJlIGRlbGF5ZWQgKGVzcGVjaWFsbHkgdG8gcmVhbGl6ZSBzZWdtZW50IG9mZnNldHMpXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmRlbGF5ID0gb3B0T3JEZWYob3B0aW9ucy5kZWxheSwgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogQWJzb2x1dGUgYXR0YWNrIHRpbWUgaW4gc2VjXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja0FicyA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrQWJzLCAwLjAwNSk7XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2sgdGltZSByZWxhdGl2ZSB0byBzZWdtZW50IGR1cmF0aW9uXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmF0dGFja1JlbCA9IG9wdE9yRGVmKG9wdGlvbnMuYXR0YWNrUmVsLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFic29sdXRlIHJlbGVhc2UgdGltZSBpbiBzZWNcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZUFicyA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZUFicywgMC4wMDUpO1xuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZSB0aW1lIHJlbGF0aXZlIHRvIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucmVsZWFzZVJlbCA9IG9wdE9yRGVmKG9wdGlvbnMucmVsZWFzZVJlbCwgMCk7XG5cbiAgICAvKipcbiAgICAgKiBTZWdtZW50IHJlc2FtcGxpbmcgaW4gY2VudFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5yZXNhbXBsaW5nID0gb3B0T3JEZWYob3B0aW9ucy5yZXNhbXBsaW5nLCAwKTtcblxuICAgIC8qKlxuICAgICAqIEFtb3V0IG9mIHJhbmRvbSByZXNhbXBsaW5nIHZhcmlhdGlvbiBpbiBjZW50XG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLnJlc2FtcGxpbmdWYXIgPSBvcHRPckRlZihvcHRpb25zLnJlc2FtcGxpbmdWYXIsIDApO1xuXG4gICAgLyoqXG4gICAgICogTGluZWFyIGdhaW4gZmFjdG9yXG4gICAgICogQHR5cGUge051bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmdhaW4gPSBvcHRPckRlZihvcHRpb25zLmdhaW4sIDEpO1xuXG4gICAgLyoqXG4gICAgICogSW5kZXggb2YgdGhlIHNlZ21lbnQgdG8gc3ludGhlc2l6ZSAoaS5lLiBvZiB0aGlzLnBvc2l0aW9uQXJyYXkvZHVyYXRpb25BcnJheS9vZmZzZXRBcnJheSlcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMuc2VnbWVudEluZGV4ID0gb3B0T3JEZWYob3B0aW9ucy5zZWdtZW50SW5kZXgsIDApO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGUgYXVkaW8gYnVmZmVyIGFuZCBzZWdtZW50IGluZGljZXMgYXJlIGNvbnNpZGVyZWQgYXMgY3ljbGljXG4gICAgICogQHR5cGUge0Jvb2x9XG4gICAgICovXG4gICAgdGhpcy5jeWNsaWMgPSBvcHRPckRlZihvcHRpb25zLmN5Y2xpYywgZmFsc2UpO1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogUG9ydGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBhdWRpbyBidWZmZXIgdGhhdCBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgYmVnaW5uaW5nIHRvIGFzc3VyZSBjeWNsaWMgYmVoYXZpb3JcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMud3JhcEFyb3VuZEV4dGVuc2lvbiA9IG9wdE9yRGVmKG9wdGlvbnMud3JhcEFyb3VuZEV4dGVuc2lvbiwgMCk7XG5cbiAgICB0aGlzLm91dHB1dE5vZGUgPSB0aGlzLmF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGJ1ZmZlciBkdXJhdGlvbiAoZXhjbHVkaW5nIHdyYXBBcm91bmRFeHRlbnNpb24pXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBidWZmZXIgZHVyYXRpb25cbiAgICovXG4gIGdldCBidWZmZXJEdXJhdGlvbigpIHtcbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy53cmFwQXJvdW5kRXh0ZW5zaW9uKVxuICAgICAgICBidWZmZXJEdXJhdGlvbiAtPSB0aGlzLndyYXBBcm91bmRFeHRlbnNpb247XG5cbiAgICAgIHJldHVybiBidWZmZXJEdXJhdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kICh0cmFuc3BvcnRlZCBpbnRlcmZhY2UpXG4gIGFkdmFuY2VUaW1lKHRpbWUpIHtcbiAgICB0aW1lID0gTWF0aC5tYXgodGltZSwgdGhpcy5hdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgIHJldHVybiB0aW1lICsgdGhpcy50cmlnZ2VyKHRpbWUpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc2VnbWVudEluZGV4O1xuICAgIHZhciBjeWNsaWNPZmZzZXQgPSAwO1xuICAgIHZhciBidWZmZXJEdXJhdGlvbiA9IHRoaXMuYnVmZmVyRHVyYXRpb247XG5cbiAgICBpZiAodGhpcy5jeWNsaWMpIHtcbiAgICAgIHZhciBjeWNsZXMgPSBwb3NpdGlvbiAvIGJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICBjeWNsaWNPZmZzZXQgPSBNYXRoLmZsb29yKGN5Y2xlcykgKiBidWZmZXJEdXJhdGlvbjtcbiAgICAgIHBvc2l0aW9uIC09IGN5Y2xpY09mZnNldDtcbiAgICB9XG5cbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpbmRleCA9IGdldEN1cnJlbnRPck5leHRJbmRleCh0aGlzLnBvc2l0aW9uQXJyYXksIHBvc2l0aW9uKTtcblxuICAgICAgaWYgKGluZGV4ID49IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICBjeWNsaWNPZmZzZXQgKz0gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgIGluZGV4ID0gZ2V0Q3VycmVudE9yUHJldmlvdXNJbmRleCh0aGlzLnBvc2l0aW9uQXJyYXksIHBvc2l0aW9uKTtcblxuICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICBpbmRleCA9IHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBjeWNsaWNPZmZzZXQgLT0gYnVmZmVyRHVyYXRpb247XG5cbiAgICAgICAgaWYgKCF0aGlzLmN5Y2xpYylcbiAgICAgICAgICByZXR1cm4gLUluZmluaXR5O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gSW5maW5pdHk7XG4gICAgfVxuXG4gICAgdGhpcy5zZWdtZW50SW5kZXggPSBpbmRleDtcbiAgICB0aGlzLl9fY3ljbGljT2Zmc2V0ID0gY3ljbGljT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGN5Y2xpY09mZnNldCArIHRoaXMucG9zaXRpb25BcnJheVtpbmRleF07XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG4gICAgdmFyIGN5Y2xpY09mZnNldCA9IHRoaXMuX19jeWNsaWNPZmZzZXQ7XG5cbiAgICB0aGlzLnRyaWdnZXIodGltZSk7XG5cbiAgICBpZiAoc3BlZWQgPiAwKSB7XG4gICAgICBpbmRleCsrO1xuXG4gICAgICBpZiAoaW5kZXggPj0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgIGN5Y2xpY09mZnNldCArPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpbmRleC0tO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIGluZGV4ID0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDE7XG4gICAgICAgIGN5Y2xpY09mZnNldCAtPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICAgIGlmICghdGhpcy5jeWNsaWMpXG4gICAgICAgICAgcmV0dXJuIC1JbmZpbml0eTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IGluZGV4O1xuICAgIHRoaXMuX19jeWNsaWNPZmZzZXQgPSBjeWNsaWNPZmZzZXQ7XG5cbiAgICByZXR1cm4gY3ljbGljT2Zmc2V0ICsgdGhpcy5wb3NpdGlvbkFycmF5W2luZGV4XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGEgc2VnbWVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gdGltZSBzZWdtZW50IHN5bnRoZXNpcyBhdWRpbyB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gcGVyaW9kIHRvIG5leHQgc2VnbWVudFxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgYXQgYW55IHRpbWUgKHdoZXRoZXIgdGhlIGVuZ2luZSBpcyBzY2hlZHVsZWQvdHJhbnNwb3J0ZWQgb3Igbm90KVxuICAgKiB0byBnZW5lcmF0ZSBhIHNpbmdsZSBzZWdtZW50IGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzZWdtZW50IHBhcmFtZXRlcnMuXG4gICAqL1xuICB0cmlnZ2VyKHRpbWUpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIHNlZ21lbnRUaW1lID0gKHRpbWUgfHwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSArIHRoaXMuZGVsYXk7XG4gICAgdmFyIHNlZ21lbnRQZXJpb2QgPSB0aGlzLnBlcmlvZEFicztcbiAgICB2YXIgc2VnbWVudEluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG5cbiAgICBpZiAodGhpcy5idWZmZXIpIHtcbiAgICAgIHZhciBzZWdtZW50UG9zaXRpb24gPSAwLjA7XG4gICAgICB2YXIgc2VnbWVudER1cmF0aW9uID0gMC4wO1xuICAgICAgdmFyIHNlZ21lbnRPZmZzZXQgPSAwLjA7XG4gICAgICB2YXIgcmVzYW1wbGluZ1JhdGUgPSAxLjA7XG4gICAgICB2YXIgYnVmZmVyRHVyYXRpb24gPSB0aGlzLmJ1ZmZlckR1cmF0aW9uO1xuXG4gICAgICBpZiAodGhpcy5jeWNsaWMpXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IHNlZ21lbnRJbmRleCAlIHRoaXMucG9zaXRpb25BcnJheS5sZW5ndGg7XG4gICAgICBlbHNlXG4gICAgICAgIHNlZ21lbnRJbmRleCA9IE1hdGgubWF4KDAsIE1hdGgubWluKHNlZ21lbnRJbmRleCwgdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCAtIDEpKTtcblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMuZHVyYXRpb25BcnJheSlcbiAgICAgICAgc2VnbWVudER1cmF0aW9uID0gdGhpcy5kdXJhdGlvbkFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgaWYgKHRoaXMub2Zmc2V0QXJyYXkpXG4gICAgICAgIHNlZ21lbnRPZmZzZXQgPSB0aGlzLm9mZnNldEFycmF5W3NlZ21lbnRJbmRleF0gfHwgMDtcblxuICAgICAgLy8gY2FsY3VsYXRlIHJlc2FtcGxpbmdcbiAgICAgIGlmICh0aGlzLnJlc2FtcGxpbmcgIT09IDAgfHwgdGhpcy5yZXNhbXBsaW5nVmFyID4gMCkge1xuICAgICAgICB2YXIgcmFuZG9tUmVzYW1wbGluZyA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIuMCAqIHRoaXMucmVzYW1wbGluZ1ZhcjtcbiAgICAgICAgcmVzYW1wbGluZ1JhdGUgPSBNYXRoLnBvdygyLjAsICh0aGlzLnJlc2FtcGxpbmcgKyByYW5kb21SZXNhbXBsaW5nKSAvIDEyMDAuMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNhbGN1bGF0ZSBpbnRlci1zZWdtZW50IGRpc3RhbmNlXG4gICAgICBpZiAoc2VnbWVudER1cmF0aW9uID09PSAwIHx8IHRoaXMucGVyaW9kUmVsID4gMCkge1xuICAgICAgICB2YXIgbmV4dFNlZ2VtZW50SW5kZXggPSBzZWdtZW50SW5kZXggKyAxO1xuICAgICAgICB2YXIgbmV4dFBvc2l0aW9uLCBuZXh0T2Zmc2V0O1xuXG4gICAgICAgIGlmIChuZXh0U2VnZW1lbnRJbmRleCA9PT0gdGhpcy5wb3NpdGlvbkFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIGlmICh0aGlzLmN5Y2xpYykge1xuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5WzBdICsgYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV4dFBvc2l0aW9uID0gYnVmZmVyRHVyYXRpb247XG4gICAgICAgICAgICBuZXh0T2Zmc2V0ID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5wb3NpdGlvbkFycmF5W25leHRTZWdlbWVudEluZGV4XTtcbiAgICAgICAgICBuZXh0T2Zmc2V0ID0gdGhpcy5vZmZzZXRBcnJheVtuZXh0U2VnZW1lbnRJbmRleF07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW50ZXJTZWdtZW50RGlzdGFuY2UgPSBuZXh0UG9zaXRpb24gLSBzZWdtZW50UG9zaXRpb247XG5cbiAgICAgICAgLy8gY29ycmVjdCBpbnRlci1zZWdtZW50IGRpc3RhbmNlIGJ5IG9mZnNldHNcbiAgICAgICAgLy8gICBvZmZzZXQgPiAwOiB0aGUgc2VnbWVudCdzIHJlZmVyZW5jZSBwb3NpdGlvbiBpcyBhZnRlciB0aGUgZ2l2ZW4gc2VnbWVudCBwb3NpdGlvblxuICAgICAgICBpZiAoc2VnbWVudE9mZnNldCA+IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgLT0gc2VnbWVudE9mZnNldDtcblxuICAgICAgICBpZiAobmV4dE9mZnNldCA+IDApXG4gICAgICAgICAgaW50ZXJTZWdtZW50RGlzdGFuY2UgKz0gbmV4dE9mZnNldDtcblxuICAgICAgICBpZiAoaW50ZXJTZWdtZW50RGlzdGFuY2UgPCAwKVxuICAgICAgICAgIGludGVyU2VnbWVudERpc3RhbmNlID0gMDtcblxuICAgICAgICAvLyB1c2UgaW50ZXItc2VnbWVudCBkaXN0YW5jZSBpbnN0ZWFkIG9mIHNlZ21lbnQgZHVyYXRpb25cbiAgICAgICAgaWYgKHNlZ21lbnREdXJhdGlvbiA9PT0gMClcbiAgICAgICAgICBzZWdtZW50RHVyYXRpb24gPSBpbnRlclNlZ21lbnREaXN0YW5jZTtcblxuICAgICAgICAvLyBjYWxjdWxhdGUgcGVyaW9kIHJlbGF0aXZlIHRvIGludGVyIG1hcmtlciBkaXN0YW5jZVxuICAgICAgICBzZWdtZW50UGVyaW9kICs9IHRoaXMucGVyaW9kUmVsICogaW50ZXJTZWdtZW50RGlzdGFuY2U7XG4gICAgICB9XG5cbiAgICAgIC8vIGFkZCByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgc2VnbWVudCBkdXJhdGlvblxuICAgICAgc2VnbWVudER1cmF0aW9uICo9IHRoaXMuZHVyYXRpb25SZWw7XG4gICAgICBzZWdtZW50RHVyYXRpb24gKz0gdGhpcy5kdXJhdGlvbkFicztcblxuICAgICAgLy8gYWRkIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBzZWdtZW50IG9mZnNldFxuICAgICAgc2VnbWVudE9mZnNldCAqPSB0aGlzLm9mZnNldFJlbDtcbiAgICAgIHNlZ21lbnRPZmZzZXQgKz0gdGhpcy5vZmZzZXRBYnM7XG5cbiAgICAgIC8vIGFwcGx5IHNlZ21lbnQgb2Zmc2V0XG4gICAgICAvLyAgIG9mZnNldCA+IDA6IHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGlzIGFmdGVyIHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uXG4gICAgICAvLyAgIG9mZnNldCA8IDA6IHRoZSBnaXZlbiBzZWdtZW50IHBvc2l0aW9uIGlzIHRoZSBzZWdtZW50J3MgcmVmZXJlbmNlIHBvc2l0aW9uIGFuZCB0aGUgZHVyYXRpb24gaGFzIHRvIGJlIGNvcnJlY3RlZCBieSB0aGUgb2Zmc2V0XG4gICAgICBpZiAoc2VnbWVudE9mZnNldCA8IDApIHtcbiAgICAgICAgc2VnbWVudER1cmF0aW9uIC09IHNlZ21lbnRPZmZzZXQ7XG4gICAgICAgIHNlZ21lbnRQb3NpdGlvbiArPSBzZWdtZW50T2Zmc2V0O1xuICAgICAgICBzZWdtZW50VGltZSArPSAoc2VnbWVudE9mZnNldCAvIHJlc2FtcGxpbmdSYXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlZ21lbnRUaW1lIC09IChzZWdtZW50T2Zmc2V0IC8gcmVzYW1wbGluZ1JhdGUpO1xuICAgICAgfVxuXG4gICAgICAvLyByYW5kb21pemUgc2VnbWVudCBwb3NpdGlvblxuICAgICAgaWYgKHRoaXMucG9zaXRpb25WYXIgPiAwKVxuICAgICAgICBzZWdtZW50UG9zaXRpb24gKz0gMi4wICogKE1hdGgucmFuZG9tKCkgLSAwLjUpICogdGhpcy5wb3NpdGlvblZhcjtcblxuICAgICAgLy8gc2hvcnRlbiBkdXJhdGlvbiBvZiBzZWdtZW50cyBvdmVyIHRoZSBlZGdlcyBvZiB0aGUgYnVmZmVyXG4gICAgICBpZiAoc2VnbWVudFBvc2l0aW9uIDwgMCkge1xuICAgICAgICBzZWdtZW50RHVyYXRpb24gKz0gc2VnbWVudFBvc2l0aW9uO1xuICAgICAgICBzZWdtZW50UG9zaXRpb24gPSAwO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VnbWVudFBvc2l0aW9uICsgc2VnbWVudER1cmF0aW9uID4gdGhpcy5idWZmZXIuZHVyYXRpb24pXG4gICAgICAgIHNlZ21lbnREdXJhdGlvbiA9IHRoaXMuYnVmZmVyLmR1cmF0aW9uIC0gc2VnbWVudFBvc2l0aW9uO1xuXG4gICAgICAvLyBtYWtlIHNlZ21lbnRcbiAgICAgIGlmICh0aGlzLmdhaW4gPiAwICYmIHNlZ21lbnREdXJhdGlvbiA+IDApIHtcbiAgICAgICAgLy8gbWFrZSBzZWdtZW50IGVudmVsb3BlXG4gICAgICAgIHZhciBlbnZlbG9wZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHZhciBhdHRhY2sgPSB0aGlzLmF0dGFja0FicyArIHRoaXMuYXR0YWNrUmVsICogc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZSA9IHRoaXMucmVsZWFzZUFicyArIHRoaXMucmVsZWFzZVJlbCAqIHNlZ21lbnREdXJhdGlvbjtcblxuICAgICAgICBpZiAoYXR0YWNrICsgcmVsZWFzZSA+IHNlZ21lbnREdXJhdGlvbikge1xuICAgICAgICAgIHZhciBmYWN0b3IgPSBzZWdtZW50RHVyYXRpb24gLyAoYXR0YWNrICsgcmVsZWFzZSk7XG4gICAgICAgICAgYXR0YWNrICo9IGZhY3RvcjtcbiAgICAgICAgICByZWxlYXNlICo9IGZhY3RvcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhdHRhY2tFbmRUaW1lID0gc2VnbWVudFRpbWUgKyBhdHRhY2s7XG4gICAgICAgIHZhciBzZWdtZW50RW5kVGltZSA9IHNlZ21lbnRUaW1lICsgc2VnbWVudER1cmF0aW9uO1xuICAgICAgICB2YXIgcmVsZWFzZVN0YXJ0VGltZSA9IHNlZ21lbnRFbmRUaW1lIC0gcmVsZWFzZTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLnNldFZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRoaXMuZ2FpbiwgYXR0YWNrRW5kVGltZSk7XG5cbiAgICAgICAgaWYgKHJlbGVhc2VTdGFydFRpbWUgPiBhdHRhY2tFbmRUaW1lKVxuICAgICAgICAgIGVudmVsb3BlLmdhaW4uc2V0VmFsdWVBdFRpbWUodGhpcy5nYWluLCByZWxlYXNlU3RhcnRUaW1lKTtcblxuICAgICAgICBlbnZlbG9wZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAuMCwgc2VnbWVudEVuZFRpbWUpO1xuICAgICAgICBlbnZlbG9wZS5jb25uZWN0KHRoaXMub3V0cHV0Tm9kZSk7XG5cbiAgICAgICAgLy8gbWFrZSBzb3VyY2VcbiAgICAgICAgdmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgICAgICBzb3VyY2UuYnVmZmVyID0gdGhpcy5idWZmZXI7XG4gICAgICAgIHNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSByZXNhbXBsaW5nUmF0ZTtcbiAgICAgICAgc291cmNlLmNvbm5lY3QoZW52ZWxvcGUpO1xuXG4gICAgICAgIHNvdXJjZS5zdGFydChzZWdtZW50VGltZSwgc2VnbWVudFBvc2l0aW9uKTtcbiAgICAgICAgc291cmNlLnN0b3Aoc2VnbWVudFRpbWUgKyBzZWdtZW50RHVyYXRpb24gLyByZXNhbXBsaW5nUmF0ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlZ21lbnRQZXJpb2Q7XG4gIH1cbn1cbiIsIi8vIGNvcmVcbmV4cG9ydCB7IGRlZmF1bHQgYXMgYXVkaW9Db250ZXh0IH0gZnJvbSAnLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUaW1lRW5naW5lIH0gZnJvbSAnLi9jb3JlL3RpbWUtZW5naW5lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXVkaW9UaW1lRW5naW5lIH0gZnJvbSAnLi9jb3JlL2F1ZGlvLXRpbWUtZW5naW5lJztcblxuLy8gZW5naW5lc1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBHcmFudWxhckVuZ2luZSB9IGZyb20gJy4vZW5naW5lcy9ncmFudWxhci1lbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNZXRyb25vbWUgfSBmcm9tICcuL2VuZ2luZXMvbWV0cm9ub21lJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGxheWVyRW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3BsYXllci1lbmdpbmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTZWdtZW50RW5naW5lIH0gZnJvbSAnLi9lbmdpbmVzL3NlZ21lbnQtZW5naW5lJztcblxuLy8gbWFzdGVyc1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBQbGF5Q29udHJvbCB9IGZyb20gJy4vbWFzdGVycy9wbGF5LWNvbnRyb2wnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBUcmFuc3BvcnQgfSBmcm9tICcuL21hc3RlcnMvdHJhbnNwb3J0JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2NoZWR1bGVyIH0gZnJvbSAnLi9tYXN0ZXJzL3NjaGVkdWxlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIFNpbXBsZVNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9zaW1wbGUtc2NoZWR1bGVyJztcblxuLy8gdXRpbHNcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUHJpb3JpdHlRdWV1ZSB9IGZyb20gJy4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTY2hlZHVsaW5nUXVldWUgfSBmcm9tICcuL3V0aWxzL3NjaGVkdWxpbmctcXVldWUnO1xuXG4vLyBmYWN0b3JpZXNcbmV4cG9ydCB7IGdldFNjaGVkdWxlciB9IGZyb20gJy4vbWFzdGVycy9mYWN0b3JpZXMnO1xuZXhwb3J0IHsgZ2V0U2ltcGxlU2NoZWR1bGVyIH0gZnJvbSAnLi9tYXN0ZXJzL2ZhY3Rvcmllcyc7XG4iLCIvLyBzY2hlZHVsZXJzIHNob3VsZCBiZSBzaW5nbGV0b25zXG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcic7XG5pbXBvcnQgU2ltcGxlU2NoZWR1bGVyIGZyb20gJy4vc2ltcGxlLXNjaGVkdWxlcic7XG5cbmNvbnN0IHNjaGVkdWxlck1hcCA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBzaW1wbGVTY2hlZHVsZXJNYXAgPSBuZXcgV2Vha01hcCgpO1xuXG4vLyBzY2hlZHVsZXIgZmFjdG9yeVxuZXhwb3J0IGNvbnN0IGdldFNjaGVkdWxlciA9IGZ1bmN0aW9uKGF1ZGlvQ29udGV4dCA9IGRlZmF1bHRBdWRpb0NvbnRleHQpIHtcbiAgbGV0IHNjaGVkdWxlciA9IHNjaGVkdWxlck1hcC5nZXQoYXVkaW9Db250ZXh0KTtcblxuICBpZiAoIXNjaGVkdWxlcikge1xuICAgIHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoeyBhdWRpb0NvbnRleHQ6IGF1ZGlvQ29udGV4dCB9KTtcbiAgICBzY2hlZHVsZXJNYXAuc2V0KGF1ZGlvQ29udGV4dCwgc2NoZWR1bGVyKTtcbiAgfVxuXG4gIHJldHVybiBzY2hlZHVsZXI7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2ltcGxlU2NoZWR1bGVyID0gZnVuY3Rpb24oYXVkaW9Db250ZXh0ID0gZGVmYXVsdEF1ZGlvQ29udGV4dCkge1xuICBsZXQgc2ltcGxlU2NoZWR1bGVyID0gc2ltcGxlU2NoZWR1bGVyTWFwLmdldChhdWRpb0NvbnRleHQpO1xuXG4gIGlmICghc2ltcGxlU2NoZWR1bGVyKSB7XG4gICAgc2ltcGxlU2NoZWR1bGVyID0gbmV3IFNpbXBsZVNjaGVkdWxlcih7IGF1ZGlvQ29udGV4dDogYXVkaW9Db250ZXh0IH0pO1xuICAgIHNpbXBsZVNjaGVkdWxlck1hcC5zZXQoYXVkaW9Db250ZXh0LCBzaW1wbGVTY2hlZHVsZXIpO1xuICB9XG5cbiAgcmV0dXJuIHNpbXBsZVNjaGVkdWxlcjtcbn07XG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgU2NoZWR1bGluZ1F1ZXVlIGZyb20gJy4uL3V0aWxzL3NjaGVkdWxpbmctcXVldWUnO1xuaW1wb3J0IHsgZ2V0U2NoZWR1bGVyIH0gZnJvbSAnLi9mYWN0b3JpZXMnO1xuXG5jbGFzcyBMb29wQ29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLmxvd2VyID0gLUluZmluaXR5O1xuICAgIHRoaXMudXBwZXIgPSBJbmZpbml0eTtcbiAgfVxuXG4gIC8vIFRpbWVFbmdpbmUgbWV0aG9kIChzY2hlZHVsZWQgaW50ZXJmYWNlKVxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBzcGVlZCA9IHBsYXlDb250cm9sLnNwZWVkO1xuICAgIHZhciBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgdmFyIHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIHBsYXlDb250cm9sLnN5bmNTcGVlZCh0aW1lLCBsb3dlciwgc3BlZWQsIHRydWUpO1xuICAgICAgcmV0dXJuIHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIpO1xuICAgIH0gZWxzZSBpZiAoc3BlZWQgPCAwKSB7XG4gICAgICBwbGF5Q29udHJvbC5zeW5jU3BlZWQodGltZSwgdXBwZXIsIHNwZWVkLCB0cnVlKTtcbiAgICAgIHJldHVybiBwbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKGxvd2VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICByZXNjaGVkdWxlKHNwZWVkKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBsb3dlciA9IE1hdGgubWluKHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuICAgIHZhciB1cHBlciA9IE1hdGgubWF4KHBsYXlDb250cm9sLl9fbG9vcFN0YXJ0LCBwbGF5Q29udHJvbC5fX2xvb3BFbmQpO1xuXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMubG93ZXIgPSBsb3dlcjtcbiAgICB0aGlzLnVwcGVyID0gdXBwZXI7XG5cbiAgICBpZiAobG93ZXIgPT09IHVwcGVyKVxuICAgICAgc3BlZWQgPSAwO1xuXG4gICAgaWYgKHNwZWVkID4gMClcbiAgICAgIHRoaXMucmVzZXRUaW1lKHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24odXBwZXIgLSAxZS02KSk7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwKVxuICAgICAgdGhpcy5yZXNldFRpbWUocGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihsb3dlciArIDFlLTYpKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBhcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBsb3dlciA9IHRoaXMubG93ZXI7XG4gICAgdmFyIHVwcGVyID0gdGhpcy51cHBlcjtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPj0gdXBwZXIpXG4gICAgICByZXR1cm4gbG93ZXIgKyAocG9zaXRpb24gLSBsb3dlcikgJSAodXBwZXIgLSBsb3dlcik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uIDwgbG93ZXIpXG4gICAgICByZXR1cm4gdXBwZXIgLSAodXBwZXIgLSBwb3NpdGlvbikgJSAodXBwZXIgLSBsb3dlcik7XG5cbiAgICByZXR1cm4gcG9zaXRpb247XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sbGVkIGJhc2UgY2xhc3NcbmNsYXNzIFBsYXlDb250cm9sbGVkIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IHBsYXlDb250cm9sO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IHRoaXM7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCwgc2Vlayk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbCA9IG51bGw7XG5cbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gcGxheSBjb250cm9sIGZvciBlbmdpbmVzIGltcGxlbWVudGluZyB0aGUgKnNwZWVkLWNvbnRyb2xsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIGVuZ2luZXMgaW1wbG1lbnRpbmcgdGhlICp0cmFuc3BvcnRlZCogaW50ZXJmYWNlXG5jbGFzcyBQbGF5Q29udHJvbGxlZFRyYW5zcG9ydGVkIGV4dGVuZHMgUGxheUNvbnRyb2xsZWQge1xuICBjb25zdHJ1Y3RvcihwbGF5Q29udHJvbCwgZW5naW5lKSB7XG4gICAgc3VwZXIocGxheUNvbnRyb2wsIGVuZ2luZSk7XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vayA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2socGxheUNvbnRyb2wsIGVuZ2luZSk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChsYXN0U3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RhcnRcbiAgICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX2VuZ2luZS5zeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IDApIHtcbiAgICAgICAgLy8gc3RvcFxuICAgICAgICBuZXh0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgICAgICBpZiAodGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQpXG4gICAgICAgICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCkge1xuICAgICAgICAvLyBjaGFuZ2Ugc3BlZWQgd2l0aG91dCByZXZlcnNpbmcgZGlyZWN0aW9uXG4gICAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX19zY2hlZHVsZXJIb29rLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgICAgdmFyIHRpbWUgPSBwbGF5Q29udHJvbC5fX3N5bmMoKTtcblxuICAgICAgcG9zaXRpb24gPSB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwbGF5Q29udHJvbC5fX3Bvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWR1bGVySG9vay5yZXNldFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fX3NjaGVkdWxlckhvb2suZGVzdHJveSgpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbnVsbDtcblxuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBwbGF5IGNvbnRyb2wgZm9yIHRpbWUgZW5naW5lcyBpbXBsZW1lbnRpbmcgdGhlICpzY2hlZHVsZWQqIGludGVyZmFjZVxuY2xhc3MgUGxheUNvbnRyb2xsZWRTY2hlZHVsZWQgZXh0ZW5kcyBQbGF5Q29udHJvbGxlZCB7XG4gIGNvbnN0cnVjdG9yKHBsYXlDb250cm9sLCBlbmdpbmUpIHtcbiAgICBzdXBlcihwbGF5Q29udHJvbCwgZW5naW5lKTtcblxuICAgIC8vIHNjaGVkdWxpbmcgcXVldWUgYmVjb21lcyBtYXN0ZXIgb2YgZW5naW5lXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX3NjaGVkdWxpbmdRdWV1ZSA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxpbmdRdWV1ZShwbGF5Q29udHJvbCwgZW5naW5lKTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWssIGxhc3RTcGVlZCkge1xuICAgIGlmIChsYXN0U3BlZWQgPT09IDAgJiYgc3BlZWQgIT09IDApIC8vIHN0YXJ0IG9yIHNlZWtcbiAgICAgIHRoaXMuX19lbmdpbmUucmVzZXRUaW1lKCk7XG4gICAgZWxzZSBpZiAobGFzdFNwZWVkICE9PSAwICYmIHNwZWVkID09PSAwKSAvLyBzdG9wXG4gICAgICB0aGlzLl9fZW5naW5lLnJlc2V0VGltZShJbmZpbml0eSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUuZGVzdHJveSgpO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyB0cmFuc2xhdGVzIHRyYW5zcG9ydGVkIGVuZ2luZSBhZHZhbmNlUG9zaXRpb24gaW50byBnbG9iYWwgc2NoZWR1bGVyIHRpbWVzXG5jbGFzcyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBwbGF5Q29udHJvbDtcbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuXG4gICAgdGhpcy5fX25leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBhZHZhbmNlVGltZSh0aW1lKSB7XG4gICAgdmFyIHBsYXlDb250cm9sID0gdGhpcy5fX3BsYXlDb250cm9sO1xuICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fZW5naW5lO1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IGVuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHBsYXlDb250cm9sLl9fc3BlZWQpO1xuICAgIHZhciBuZXh0VGltZSA9IHBsYXlDb250cm9sLl9fZ2V0VGltZUF0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcblxuICAgIHdoaWxlIChuZXh0VGltZSA8PSB0aW1lKSB7XG4gICAgICBuZXh0UG9zaXRpb24gPSBlbmdpbmUuYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBwbGF5Q29udHJvbC5fX3NwZWVkKTtcbiAgICAgIG5leHRUaW1lID0gcGxheUNvbnRyb2wuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFRpbWU7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcGxheUNvbnRyb2wuY3VycmVudFBvc2l0aW9uO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19wbGF5Q29udHJvbC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lID0gbnVsbDtcbiAgfVxufVxuXG4vLyBpbnRlcm5hbCBzY2hlZHVsaW5nIHF1ZXVlIHRoYXQgcmV0dXJucyB0aGUgY3VycmVudCBwb3NpdGlvbiAoYW5kIHRpbWUpIG9mIHRoZSBwbGF5IGNvbnRyb2xcbmNsYXNzIFBsYXlDb250cm9sbGVkU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3IocGxheUNvbnRyb2wsIGVuZ2luZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fX3BsYXlDb250cm9sID0gcGxheUNvbnRyb2w7XG4gICAgdGhpcy5fX2VuZ2luZSA9IGVuZ2luZTtcblxuICAgIHRoaXMuYWRkKGVuZ2luZSwgSW5maW5pdHkpO1xuICAgIHBsYXlDb250cm9sLl9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19wbGF5Q29udHJvbC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19wbGF5Q29udHJvbC5fX3NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gICAgdGhpcy5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2wgPSBudWxsO1xuICAgIHRoaXMuX19lbmdpbmUgPSBudWxsO1xuICB9XG59XG5cbi8vIHBsYXkgY29udHJvbCBtZXRhLWNsYXNzXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5Q29udHJvbCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihlbmdpbmUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmF1ZGlvQ29udGV4dCA9IG9wdGlvbnMuYXVkaW9Db250ZXh0IHx8IGRlZmF1bHRBdWRpb0NvbnRleHQ7XG4gICAgdGhpcy5fX3NjaGVkdWxlciA9IGdldFNjaGVkdWxlcih0aGlzLmF1ZGlvQ29udGV4dCk7XG5cbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBudWxsO1xuXG4gICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB0aGlzLl9fbG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLl9fbG9vcEVuZCA9IEluZmluaXR5O1xuXG4gICAgLy8gc3luY2hyb25pemVkIHRpZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG5cbiAgICAvLyBub24temVybyBcInVzZXJcIiBzcGVlZFxuICAgIHRoaXMuX19wbGF5aW5nU3BlZWQgPSAxO1xuXG4gICAgaWYgKGVuZ2luZSlcbiAgICAgIHRoaXMuX19zZXRFbmdpbmUoZW5naW5lKTtcbiAgfVxuXG4gIF9fc2V0RW5naW5lKGVuZ2luZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBpZiAoVGltZUVuZ2luZS5pbXBsZW1lbnRzU3BlZWRDb250cm9sbGVkKGVuZ2luZSkpXG4gICAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQgPSBuZXcgUGxheUNvbnRyb2xsZWRTcGVlZENvbnRyb2xsZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNUcmFuc3BvcnRlZChlbmdpbmUpKVxuICAgICAgdGhpcy5fX3BsYXlDb250cm9sbGVkID0gbmV3IFBsYXlDb250cm9sbGVkVHJhbnNwb3J0ZWQodGhpcywgZW5naW5lKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG5ldyBQbGF5Q29udHJvbGxlZFNjaGVkdWxlZCh0aGlzLCBlbmdpbmUpO1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gcGxheSBjb250cm9sXCIpO1xuICB9XG5cbiAgX19yZXNldEVuZ2luZSgpIHtcbiAgICB0aGlzLl9fcGxheUNvbnRyb2xsZWQuZGVzdHJveSgpO1xuICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZCA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlL2V4dHJhcG9sYXRlIHBsYXlpbmcgdGltZSBmb3IgZ2l2ZW4gcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gZXh0cmFwb2xhdGVkIHRpbWVcbiAgICovXG4gIF9fZ2V0VGltZUF0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWUgKyAocG9zaXRpb24gLSB0aGlzLl9fcG9zaXRpb24pIC8gdGhpcy5fX3NwZWVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZS9leHRyYXBvbGF0ZSBwbGF5aW5nIHBvc2l0aW9uIGZvciBnaXZlbiB0aW1lXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBleHRyYXBvbGF0ZWQgcG9zaXRpb25cbiAgICovXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luYygpIHtcbiAgICB2YXIgbm93ID0gdGhpcy5jdXJyZW50VGltZTtcbiAgICB0aGlzLl9fcG9zaXRpb24gKz0gKG5vdyAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgICB0aGlzLl9fdGltZSA9IG5vdztcbiAgICByZXR1cm4gbm93O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjdXJyZW50IG1hc3RlciB0aW1lXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCB0aW1lXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19zY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gY3VycmVudCBwbGF5aW5nIHBvc2l0aW9uXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSByZXBsYWNlZCB3aGVuIHRoZSBwbGF5LWNvbnRyb2wgaXMgYWRkZWQgdG8gYSBtYXN0ZXIuXG4gICAqL1xuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG5cbiAgc2V0KGVuZ2luZSA9IG51bGwpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdmFyIHNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHRoaXMuX19wbGF5Q29udHJvbGxlZCAhPT0gbnVsbCAmJiB0aGlzLl9fcGxheUNvbnRyb2xsZWQuX19lbmdpbmUgIT09IGVuZ2luZSkge1xuXG4gICAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkKVxuICAgICAgICB0aGlzLl9fcmVzZXRFbmdpbmUoKTtcblxuXG4gICAgICBpZiAodGhpcy5fX3BsYXlDb250cm9sbGVkID09PSBudWxsICYmIGVuZ2luZSAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9fc2V0RW5naW5lKGVuZ2luZSk7XG5cbiAgICAgICAgaWYgKHNwZWVkICE9PSAwKVxuICAgICAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHRoaXMuX19wb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldCBsb29wKGVuYWJsZSkge1xuICAgIGlmIChlbmFibGUgJiYgdGhpcy5fX2xvb3BTdGFydCA+IC1JbmZpbml0eSAmJiB0aGlzLl9fbG9vcEVuZCA8IEluZmluaXR5KSB7XG4gICAgICBpZiAoIXRoaXMuX19sb29wQ29udHJvbCkge1xuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wgPSBuZXcgTG9vcENvbnRyb2wodGhpcyk7XG4gICAgICAgIHRoaXMuX19zY2hlZHVsZXIuYWRkKHRoaXMuX19sb29wQ29udHJvbCwgSW5maW5pdHkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZSh0aGlzLl9fc3BlZWQpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fX2xvb3BDb250cm9sKSB7XG4gICAgICB0aGlzLl9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzLl9fbG9vcENvbnRyb2wpO1xuICAgICAgdGhpcy5fX2xvb3BDb250cm9sID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXQgbG9vcCgpIHtcbiAgICByZXR1cm4gKCEhdGhpcy5fX2xvb3BDb250cm9sKTtcbiAgfVxuXG4gIHNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgbG9vcEVuZCkge1xuICAgIHRoaXMuX19sb29wU3RhcnQgPSBsb29wU3RhcnQ7XG4gICAgdGhpcy5fX2xvb3BFbmQgPSBsb29wRW5kO1xuXG4gICAgdGhpcy5sb29wID0gdGhpcy5sb29wO1xuICB9XG5cbiAgc2V0IGxvb3BTdGFydChsb29wU3RhcnQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKGxvb3BTdGFydCwgdGhpcy5fX2xvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BTdGFydCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2xvb3BTdGFydDtcbiAgfVxuXG4gIHNldCBsb29wRW5kKGxvb3BFbmQpIHtcbiAgICB0aGlzLnNldExvb3BCb3VuZGFyaWVzKHRoaXMuX19sb29wU3RhcnQsIGxvb3BFbmQpO1xuICB9XG5cbiAgZ2V0IGxvb3BFbmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX19sb29wRW5kO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHNwZWVkLWNvbnRyb2xsZWQgaW50ZXJmYWNlKVxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrID0gZmFsc2UpIHtcbiAgICB2YXIgbGFzdFNwZWVkID0gdGhpcy5fX3NwZWVkO1xuXG4gICAgaWYgKHNwZWVkICE9PSBsYXN0U3BlZWQgfHwgc2Vlaykge1xuICAgICAgaWYgKChzZWVrIHx8IGxhc3RTcGVlZCA9PT0gMCkgJiYgdGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX19sb29wQ29udHJvbC5hcHBseUxvb3BCb3VuZGFyaWVzKHBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgIHRoaXMuX190aW1lID0gdGltZTtcbiAgICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICAgIGlmICh0aGlzLl9fcGxheUNvbnRyb2xsZWQpXG4gICAgICAgIHRoaXMuX19wbGF5Q29udHJvbGxlZC5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCBzZWVrLCBsYXN0U3BlZWQpO1xuXG4gICAgICBpZiAodGhpcy5fX2xvb3BDb250cm9sKVxuICAgICAgICB0aGlzLl9fbG9vcENvbnRyb2wucmVzY2hlZHVsZShzcGVlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHBsYXlpbmdcbiAgICovXG4gIHN0YXJ0KCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIHRoaXMuX19wbGF5aW5nU3BlZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhdXNlIHBsYXlpbmdcbiAgICovXG4gIHBhdXNlKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy5fX3N5bmMoKTtcbiAgICB0aGlzLnN5bmNTcGVlZCh0aW1lLCB0aGlzLl9fcG9zaXRpb24sIDApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgcGxheWluZ1xuICAgKi9cbiAgc3RvcCgpIHtcbiAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCAwKTtcbiAgICB0aGlzLnNlZWsoMCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNwZWVkIHBsYXlpbmcgc3BlZWQgKG5vbi16ZXJvIHNwZWVkIGJldHdlZW4gLTE2IGFuZCAtMS8xNiBvciBiZXR3ZWVuIDEvMTYgYW5kIDE2KVxuICAgKi9cbiAgc2V0IHNwZWVkKHNwZWVkKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLl9fc3luYygpO1xuXG4gICAgaWYgKHNwZWVkID49IDApIHtcbiAgICAgIGlmIChzcGVlZCA8IDAuMDEpXG4gICAgICAgIHNwZWVkID0gMC4wMTtcbiAgICAgIGVsc2UgaWYgKHNwZWVkID4gMTAwKVxuICAgICAgICBzcGVlZCA9IDEwMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHNwZWVkIDwgLTEwMClcbiAgICAgICAgc3BlZWQgPSAtMTAwO1xuICAgICAgZWxzZSBpZiAoc3BlZWQgPiAtMC4wMSlcbiAgICAgICAgc3BlZWQgPSAtMC4wMTtcbiAgICB9XG5cbiAgICB0aGlzLl9fcGxheWluZ1NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAodGhpcy5fX3NwZWVkICE9PSAwKVxuICAgICAgdGhpcy5zeW5jU3BlZWQodGltZSwgdGhpcy5fX3Bvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHBsYXlpbmcgc3BlZWRcbiAgICogQHJldHVybiBjdXJyZW50IHBsYXlpbmcgc3BlZWRcbiAgICovXG4gIGdldCBzcGVlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3BsYXlpbmdTcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgKGp1bXAgdG8pIHBsYXlpbmcgcG9zaXRpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHBvc2l0aW9uIHRhcmdldCBwb3NpdGlvblxuICAgKi9cbiAgc2Vlayhwb3NpdGlvbikge1xuICAgIGlmIChwb3NpdGlvbiAhPT0gdGhpcy5fX3Bvc2l0aW9uKSB7XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zeW5jKCk7XG4gICAgICB0aGlzLl9fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCB0aGlzLl9fc3BlZWQsIHRydWUpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvdGltZS1lbmdpbmUnO1xuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGVyIGV4dGVuZHMgU2NoZWR1bGluZ1F1ZXVlIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSBJbmZpbml0eTtcbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgKHNldFRpbWVvdXQpIHBlcmlvZFxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5wZXJpb2QgPSBvcHRpb25zLnBlcmlvZCB8fCDCoDAuMDI1O1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIGxvb2thaGVhZCB0aW1lICg+IHBlcmlvZClcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMubG9va2FoZWFkID0gb3B0aW9ucy5sb29rYWhlYWQgfHwgwqAwLjE7XG4gIH1cblxuICAvLyBzZXRUaW1lb3V0IHNjaGVkdWxpbmcgbG9vcFxuICBfX3RpY2soKSB7XG4gICAgY29uc3QgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgbGV0IHRpbWUgPSB0aGlzLl9fbmV4dFRpbWU7XG5cbiAgICB0aGlzLl9fdGltZW91dCA9IG51bGw7XG5cbiAgICB3aGlsZSAodGltZSA8PSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUgKyB0aGlzLmxvb2thaGVhZCkge1xuICAgICAgdGhpcy5fX2N1cnJlbnRUaW1lID0gdGltZTtcbiAgICAgIHRpbWUgPSB0aGlzLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgIH1cblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5yZXNldFRpbWUodGltZSk7XG4gIH1cblxuICByZXNldFRpbWUodGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAodGhpcy5tYXN0ZXIpIHtcbiAgICAgIHRoaXMubWFzdGVyLnJlc2V0KHRoaXMsIHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgaWYgKHRoaXMuX19uZXh0VGltZSA9PT0gSW5maW5pdHkpXG4gICAgICAgICAgY29uc29sZS5sb2coXCJTY2hlZHVsZXIgU3RhcnRcIik7XG5cbiAgICAgICAgY29uc3QgdGltZU91dERlbGF5ID0gTWF0aC5tYXgoKHRpbWUgLSB0aGlzLmxvb2thaGVhZCAtIHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSwgdGhpcy5wZXJpb2QpO1xuXG4gICAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fX3RpY2soKTtcbiAgICAgICAgfSwgdGltZU91dERlbGF5ICogMTAwMCk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuX19uZXh0VGltZSAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJTY2hlZHVsZXIgU3RvcFwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fX25leHRUaW1lID0gdGltZTtcbiAgICB9XG4gIH1cblxuICBnZXQgY3VycmVudFRpbWUoKSB7XG4gICAgaWYgKHRoaXMubWFzdGVyKVxuICAgICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lO1xuXG4gICAgcmV0dXJuIHRoaXMuX19jdXJyZW50VGltZSB8fCB0aGlzLmF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICBjb25zdCBtYXN0ZXIgPSB0aGlzLm1hc3RlcjtcblxuICAgIGlmIChtYXN0ZXIgJiYgbWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIG1hc3Rlci5jdXJyZW50UG9zaXRpb247XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbXBsZVNjaGVkdWxlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuYXVkaW9Db250ZXh0ID0gb3B0aW9ucy5hdWRpb0NvbnRleHQgfHwgwqBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzID0gW107XG4gICAgdGhpcy5fX3NjaGVkVGltZXMgPSBbXTtcblxuICAgIHRoaXMuX19jdXJyZW50VGltZSA9IG51bGw7XG4gICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogc2NoZWR1bGVyIChzZXRUaW1lb3V0KSBwZXJpb2RcbiAgICAgKiBAdHlwZSB7TnVtYmVyfVxuICAgICAqL1xuICAgIHRoaXMucGVyaW9kID0gb3B0aW9ucy5wZXJpb2QgfHwgMC4wMjU7XG5cbiAgICAvKipcbiAgICAgKiBzY2hlZHVsZXIgbG9va2FoZWFkIHRpbWUgKD4gcGVyaW9kKVxuICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb29rYWhlYWQgPSBvcHRpb25zLmxvb2thaGVhZCB8fCAwLjE7XG4gIH1cblxuICBfX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSkge1xuICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgIHRoaXMuX19zY2hlZFRpbWVzLnB1c2godGltZSk7XG4gIH1cblxuICBfX3Jlc2NoZWR1bGVFbmdpbmUoZW5naW5lLCB0aW1lKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgaWYgKHRpbWUgIT09IEluZmluaXR5KSB7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzW2luZGV4XSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHRoaXMuX19zY2hlZFRpbWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgIHRoaXMuX19zY2hlZEVuZ2luZXMucHVzaChlbmdpbmUpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMucHVzaCh0aW1lKTtcbiAgICB9XG4gIH1cblxuICBfX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fX3NjaGVkRW5naW5lcy5pbmRleE9mKGVuZ2luZSk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdGhpcy5fX3NjaGVkRW5naW5lcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5fX3NjaGVkVGltZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICBfX3Jlc2V0VGljaygpIHtcbiAgICBpZiAodGhpcy5fX3NjaGVkRW5naW5lcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoIXRoaXMuX190aW1lb3V0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiU2ltcGxlU2NoZWR1bGVyIFN0YXJ0XCIpO1xuICAgICAgICB0aGlzLl9fdGljaygpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fX3RpbWVvdXQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiU2ltcGxlU2NoZWR1bGVyIFN0b3BcIik7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fX3RpbWVvdXQpO1xuICAgICAgdGhpcy5fX3RpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9fdGljaygpIHtcbiAgICB2YXIgYXVkaW9Db250ZXh0ID0gdGhpcy5hdWRpb0NvbnRleHQ7XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCkge1xuICAgICAgdmFyIGVuZ2luZSA9IHRoaXMuX19zY2hlZEVuZ2luZXNbaV07XG4gICAgICB2YXIgdGltZSA9IHRoaXMuX19zY2hlZFRpbWVzW2ldO1xuXG4gICAgICB3aGlsZSAodGltZSAmJiB0aW1lIDw9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSArIHRoaXMubG9va2FoZWFkKSB7XG4gICAgICAgIHRpbWUgPSBNYXRoLm1heCh0aW1lLCBhdWRpb0NvbnRleHQuY3VycmVudFRpbWUpO1xuICAgICAgICB0aGlzLl9fY3VycmVudFRpbWUgPSB0aW1lO1xuICAgICAgICB0aW1lID0gZW5naW5lLmFkdmFuY2VUaW1lKHRpbWUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGltZSAmJiB0aW1lIDwgSW5maW5pdHkpIHtcbiAgICAgICAgdGhpcy5fX3NjaGVkVGltZXNbaSsrXSA9IHRpbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9fdW5zY2hlZHVsZUVuZ2luZShlbmdpbmUpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBlbmdpbmUgZnJvbSBzY2hlZHVsZXJcbiAgICAgICAgaWYgKCF0aW1lKSB7XG4gICAgICAgICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9fY3VycmVudFRpbWUgPSBudWxsO1xuICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcblxuICAgIGlmICh0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuX190aWNrKCk7XG4gICAgICB9LCB0aGlzLnBlcmlvZCAqIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2N1cnJlbnRUaW1lIHx8IHRoaXMuYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lICsgdGhpcy5sb29rYWhlYWQ7XG4gIH1cblxuICBnZXQgY3VycmVudFBvc2l0aW9uKCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvLyBjYWxsIGEgZnVuY3Rpb24gYXQgYSBnaXZlbiB0aW1lXG4gIGRlZmVyKGZ1biwgdGltZSA9IHRoaXMuY3VycmVudFRpbWUpIHtcbiAgICBpZiAoIShmdW4gaW5zdGFuY2VvZiBGdW5jdGlvbikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGRlZmVyZWQgYnkgc2NoZWR1bGVyXCIpO1xuXG4gICAgdGhpcy5hZGQoe1xuICAgICAgYWR2YW5jZVRpbWU6IGZ1bmN0aW9uKHRpbWUpIHsgZnVuKHRpbWUpOyB9LCAvLyBtYWtlIHN1ciB0aGF0IHRoZSBhZHZhbmNlVGltZSBtZXRob2QgZG9lcyBub3QgcmV0dXJtIGFueXRoaW5nXG4gICAgfSwgdGltZSk7XG4gIH1cblxuICAvLyBhZGQgYSB0aW1lIGVuZ2luZSB0byB0aGUgc2NoZWR1bGVyXG4gIGFkZChlbmdpbmUsIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCFUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBjYW5ub3QgYmUgYWRkZWQgdG8gc2NoZWR1bGVyXCIpO1xuXG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBhZGRlZCB0byBhIG1hc3RlclwiKTtcblxuICAgIC8vIHNldCBtYXN0ZXIgYW5kIGFkZCB0byBhcnJheVxuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuICAgIHRoaXMuX19lbmdpbmVzLmFkZChlbmdpbmUpO1xuXG4gICAgLy8gc2NoZWR1bGUgZW5naW5lXG4gICAgdGhpcy5fX3NjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgcmVtb3ZlKGVuZ2luZSkge1xuICAgIGlmICghZW5naW5lLm1hc3RlciB8fCBlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZW5naW5lIGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIC8vIHJlc2V0IG1hc3RlciBhbmQgcmVtb3ZlIGZyb20gYXJyYXlcbiAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcblxuICAgIC8vIHVuc2NoZWR1bGUgZW5naW5lXG4gICAgdGhpcy5fX3Vuc2NoZWR1bGVFbmdpbmUoZW5naW5lKTtcbiAgICB0aGlzLl9fcmVzZXRUaWNrKCk7XG4gIH1cblxuICByZXNldEVuZ2luZVRpbWUoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIHRoaXMuX19yZXNjaGVkdWxlRW5naW5lKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5fX3Jlc2V0VGljaygpO1xuICB9XG5cbiAgLy8gY2hlY2sgd2hldGhlciBhIGdpdmVuIGVuZ2luZSBpcyBzY2hlZHVsZWRcbiAgaGFzKGVuZ2luZSkge1xuICAgIHJldHVybiB0aGlzLl9fZW5naW5lcy5oYXMoZW5naW5lKTtcbiAgfVxuXG4gIGNsZWFyKCkge1xuICAgIGlmICh0aGlzLl9fdGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX190aW1lb3V0KTtcbiAgICAgIHRoaXMuX190aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLl9fc2NoZWRFbmdpbmVzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fX3NjaGVkVGltZXMubGVuZ3RoID0gMDtcbiAgfVxufVxuIiwiaW1wb3J0IGRlZmF1bHRBdWRpb0NvbnRleHQgZnJvbSAnLi4vY29yZS9hdWRpby1jb250ZXh0JztcbmltcG9ydCBUaW1lRW5naW5lIGZyb20gJy4uL2NvcmUvdGltZS1lbmdpbmUnO1xuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IFNjaGVkdWxpbmdRdWV1ZSBmcm9tICcuLi91dGlscy9zY2hlZHVsaW5nLXF1ZXVlJztcbmltcG9ydCB7IGdldFNjaGVkdWxlciB9IGZyb20gJy4vZmFjdG9yaWVzJztcblxuXG5mdW5jdGlvbiBhZGREdXBsZXQoZmlyc3RBcnJheSwgc2Vjb25kQXJyYXksIGZpcnN0RWxlbWVudCwgc2Vjb25kRWxlbWVudCkge1xuICBmaXJzdEFycmF5LnB1c2goZmlyc3RFbGVtZW50KTtcbiAgc2Vjb25kQXJyYXkucHVzaChzZWNvbmRFbGVtZW50KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHVwbGV0KGZpcnN0QXJyYXksIHNlY29uZEFycmF5LCBmaXJzdEVsZW1lbnQpIHtcbiAgdmFyIGluZGV4ID0gZmlyc3RBcnJheS5pbmRleE9mKGZpcnN0RWxlbWVudCk7XG5cbiAgaWYgKGluZGV4ID49IDApIHtcbiAgICB2YXIgc2Vjb25kRWxlbWVudCA9IHNlY29uZEFycmF5W2luZGV4XTtcblxuICAgIGZpcnN0QXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICBzZWNvbmRBcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgcmV0dXJuIHNlY29uZEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuLy8gVGhlIFRyYW5zcG9ydGVkIGNhbGwgaXMgdGhlIGJhc2UgY2xhc3Mgb2YgdGhlIGFkYXB0ZXJzIGJldHdlZW5cbi8vIGRpZmZlcmVudCB0eXBlcyBvZiBlbmdpbmVzIChpLmUuIHRyYW5zcG9ydGVkLCBzY2hlZHVsZWQsIHBsYXktY29udHJvbGxlZClcbi8vIFRoZSBhZGFwdGVycyBhcmUgYXQgdGhlIHNhbWUgdGltZSBtYXN0ZXJzIGZvciB0aGUgZW5naW5lcyBhZGRlZCB0byB0aGUgdHJhbnNwb3J0XG4vLyBhbmQgdHJhbnNwb3J0ZWQgVGltZUVuZ2luZXMgaW5zZXJ0ZWQgaW50byB0aGUgdHJhbnNwb3J0J3MgcG9zaXRpb24tYmFzZWQgcHJpdG9yaXR5IHF1ZXVlLlxuY2xhc3MgVHJhbnNwb3J0ZWQgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0LCBkdXJhdGlvbiwgb2Zmc2V0LCBzdHJldGNoID0gMSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5tYXN0ZXIgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fZW5naW5lID0gZW5naW5lO1xuICAgIGVuZ2luZS5tYXN0ZXIgPSB0aGlzO1xuXG4gICAgdGhpcy5fX3N0YXJ0UG9zaXRpb24gPSBzdGFydDtcbiAgICB0aGlzLl9fZW5kUG9zaXRpb24gPSAhaXNGaW5pdGUoZHVyYXRpb24pID8gSW5maW5pdHkgOiBzdGFydCArIGR1cmF0aW9uO1xuICAgIHRoaXMuX19vZmZzZXRQb3NpdGlvbiA9IHN0YXJ0ICsgb2Zmc2V0O1xuICAgIHRoaXMuX19zdHJldGNoUG9zaXRpb24gPSBzdHJldGNoO1xuICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBJbmZpbml0eTsgLy8gZW5naW5lJ3MgbmV4dCBoYWx0IHBvc2l0aW9uIHdoZW4gbm90IHJ1bm5pbmcgKGlzIG51bGwgd2hlbiBlbmdpbmUgaGVzIGJlZW4gc3RhcnRlZClcbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLl9fc3RhcnRQb3NpdGlvbiwgdGhpcy5fX2VuZFBvc2l0aW9uLCB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHRoaXMuX19zdHJldGNoUG9zaXRpb24pXG4gIH1cblxuICBzZXRCb3VuZGFyaWVzKHN0YXJ0LCBkdXJhdGlvbiwgb2Zmc2V0ID0gMCwgc3RyZXRjaCA9IDEpIHtcbiAgICB0aGlzLl9fc3RhcnRQb3NpdGlvbiA9IHN0YXJ0O1xuICAgIHRoaXMuX19lbmRQb3NpdGlvbiA9IHN0YXJ0ICsgZHVyYXRpb247XG4gICAgdGhpcy5fX29mZnNldFBvc2l0aW9uID0gc3RhcnQgKyBvZmZzZXQ7XG4gICAgdGhpcy5fX3N0cmV0Y2hQb3NpdGlvbiA9IHN0cmV0Y2g7XG4gICAgdGhpcy5yZXNldFBvc2l0aW9uKCk7XG4gIH1cblxuICBzdGFydCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHt9XG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHt9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLm1hc3Rlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWFzdGVyLmN1cnJlbnRQb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcbiAgfVxuXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHBvc2l0aW9uICs9IHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcblxuICAgIHRoaXMubWFzdGVyLnJlc2V0RW5naW5lUG9zaXRpb24odGhpcywgcG9zaXRpb24pO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDApIHtcbiAgICAgIGlmIChwb3NpdGlvbiA8IHRoaXMuX19zdGFydFBvc2l0aW9uKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gdGhpcy5fX2VuZFBvc2l0aW9uO1xuXG4gICAgICAgIHJldHVybiB0aGlzLl9fc3RhcnRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPD0gdGhpcy5fX2VuZFBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gbnVsbDsgLy8gZW5naW5lIGlzIGFjdGl2ZVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9fZW5kUG9zaXRpb247XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwb3NpdGlvbiA+PSB0aGlzLl9fZW5kUG9zaXRpb24pIHtcbiAgICAgICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX19lbmRQb3NpdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPiB0aGlzLl9fc3RhcnRQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0KHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uLCBzcGVlZCk7XG5cbiAgICAgICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IG51bGw7IC8vIGVuZ2luZSBpcyBhY3RpdmVcblxuICAgICAgICByZXR1cm4gdGhpcy5fX3N0YXJ0UG9zaXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24pO1xuXG4gICAgdGhpcy5fX2hhbHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHZhciBoYWx0UG9zaXRpb24gPSB0aGlzLl9faGFsdFBvc2l0aW9uO1xuXG4gICAgaWYgKGhhbHRQb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGFydCh0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICB0aGlzLl9faGFsdFBvc2l0aW9uID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGhhbHRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICAvLyBzdG9wIGVuZ2luZVxuICAgIGlmICh0aGlzLl9faGFsdFBvc2l0aW9uID09PSBudWxsKVxuICAgICAgdGhpcy5zdG9wKHRpbWUsIHBvc2l0aW9uIC0gdGhpcy5fX29mZnNldFBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19oYWx0UG9zaXRpb24gPSBJbmZpbml0eTtcblxuICAgIHJldHVybiBJbmZpbml0eTtcbiAgfVxuXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQpIHtcbiAgICBpZiAoc3BlZWQgPT09IDApXG4gICAgICB0aGlzLnN0b3AodGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3RlciA9IG51bGw7XG5cbiAgICB0aGlzLl9fZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdGhpcy5fX2VuZ2luZSA9IG51bGw7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZFxuLy8gaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRUcmFuc3BvcnRlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24pXG4gICAgICBwb3NpdGlvbiA9IE1hdGgubWF4KHBvc2l0aW9uLCB0aGlzLl9fc3RhcnRQb3NpdGlvbik7XG4gICAgZWxzZSBpZiAoc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcG9zaXRpb24gPSBNYXRoLm1pbihwb3NpdGlvbiwgdGhpcy5fX2VuZFBvc2l0aW9uKTtcblxuICAgIHJldHVybiB0aGlzLl9fb2Zmc2V0UG9zaXRpb24gKyB0aGlzLl9fZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiAtIHRoaXMuX19vZmZzZXRQb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHBvc2l0aW9uID0gdGhpcy5fX29mZnNldFBvc2l0aW9uICsgdGhpcy5fX2VuZ2luZS5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIHNwZWVkKTtcblxuICAgIGlmIChzcGVlZCA+IDAgJiYgcG9zaXRpb24gPCB0aGlzLl9fZW5kUG9zaXRpb24gfHwgc3BlZWQgPCAwICYmIHBvc2l0aW9uID49IHRoaXMuX19zdGFydFBvc2l0aW9uKVxuICAgICAgcmV0dXJuIHBvc2l0aW9uO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIGlmICh0aGlzLl9fZW5naW5lLnN5bmNTcGVlZClcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICByZXNldEVuZ2luZVBvc2l0aW9uKGVuZ2luZSwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICBpZiAocG9zaXRpb24gIT09IHVuZGVmaW5lZClcbiAgICAgIHBvc2l0aW9uICs9IHRoaXMuX19vZmZzZXRQb3NpdGlvbjtcblxuICAgIHRoaXMucmVzZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gIH1cbn1cblxuLy8gVHJhbnNwb3J0ZWRTcGVlZENvbnRyb2xsZWRcbi8vIGhhcyB0byBzdGFydCBhbmQgc3RvcCB0aGUgc3BlZWQtY29udHJvbGxlZCBlbmdpbmVzIHdoZW4gdGhlIHRyYW5zcG9ydCBoaXRzIHRoZSBlbmdpbmUncyBzdGFydCBhbmQgZW5kIHBvc2l0aW9uXG5jbGFzcyBUcmFuc3BvcnRlZFNwZWVkQ29udHJvbGxlZCBleHRlbmRzIFRyYW5zcG9ydGVkIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0LCBlbmdpbmUsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uLCBvZmZzZXRQb3NpdGlvbikge1xuICAgIHN1cGVyKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pO1xuICB9XG5cbiAgc3RhcnQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX2VuZ2luZS5zeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkLCB0cnVlKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLl9fZW5naW5lLnN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgMCk7XG4gIH1cblxuICBzeW5jU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgaWYgKHRoaXMuX19oYWx0UG9zaXRpb24gPT09IG51bGwpIC8vIGVuZ2luZSBpcyBhY3RpdmVcbiAgICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX19lbmdpbmUuc3luY1NwZWVkKHRoaXMubWFzdGVyLmN1cnJlbnRUaW1lLCB0aGlzLm1hc3Rlci5jdXJyZW50UG9zaXRpb24gLSB0aGlzLl9fb2Zmc2V0UG9zaXRpb24sIDApO1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgfVxufVxuXG4vLyBUcmFuc3BvcnRlZFNjaGVkdWxlZFxuLy8gaGFzIHRvIHN3aXRjaCBvbiBhbmQgb2ZmIHRoZSBzY2hlZHVsZWQgZW5naW5lcyB3aGVuIHRoZSB0cmFuc3BvcnQgaGl0cyB0aGUgZW5naW5lJ3Mgc3RhcnQgYW5kIGVuZCBwb3NpdGlvblxuY2xhc3MgVHJhbnNwb3J0ZWRTY2hlZHVsZWQgZXh0ZW5kcyBUcmFuc3BvcnRlZCB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCwgZW5naW5lLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbiwgb2Zmc2V0UG9zaXRpb24pIHtcbiAgICBzdXBlcih0cmFuc3BvcnQsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcblxuICAgIC8vIHNjaGVkdWxpbmcgcXVldWUgYmVjb21lcyBtYXN0ZXIgb2YgZW5naW5lXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGluZ1F1ZXVlLmFkZChlbmdpbmUsIEluZmluaXR5KTtcbiAgfVxuXG4gIHN0YXJ0KHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIHRoaXMubWFzdGVyLl9fc2NoZWR1bGluZ1F1ZXVlLnJlc2V0RW5naW5lVGltZSh0aGlzLl9fZW5naW5lLCB0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZXNldEVuZ2luZVRpbWUodGhpcy5fX2VuZ2luZSwgSW5maW5pdHkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1hc3Rlci5fX3NjaGVkdWxpbmdRdWV1ZS5yZW1vdmUodGhpcy5fX2VuZ2luZSk7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIHRyYW5zbGF0ZXMgYWR2YW5jZVBvc2l0aW9uIG9mICp0cmFuc3BvcnRlZCogZW5naW5lcyBpbnRvIGdsb2JhbCBzY2hlZHVsZXIgdGltZXNcbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxlckhvb2sgZXh0ZW5kcyBUaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IodHJhbnNwb3J0KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuX190cmFuc3BvcnQgPSB0cmFuc3BvcnQ7XG5cbiAgICB0aGlzLl9fbmV4dFBvc2l0aW9uID0gSW5maW5pdHk7XG4gICAgdGhpcy5fX25leHRUaW1lID0gSW5maW5pdHk7XG4gICAgdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLmFkZCh0aGlzLCBJbmZpbml0eSk7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc2NoZWR1bGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciB0cmFuc3BvcnQgPSB0aGlzLl9fdHJhbnNwb3J0O1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb247XG4gICAgdmFyIHNwZWVkID0gdHJhbnNwb3J0Ll9fc3BlZWQ7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IHRyYW5zcG9ydC5hZHZhbmNlUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICB2YXIgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuXG4gICAgd2hpbGUgKG5leHRUaW1lIDw9IHRpbWUpIHtcbiAgICAgIG5leHRQb3NpdGlvbiA9IHRyYW5zcG9ydC5hZHZhbmNlUG9zaXRpb24obmV4dFRpbWUsIG5leHRQb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgbmV4dFRpbWUgPSB0cmFuc3BvcnQuX19nZXRUaW1lQXRQb3NpdGlvbihuZXh0UG9zaXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBuZXh0UG9zaXRpb247XG4gICAgdGhpcy5fX25leHRUaW1lID0gbmV4dFRpbWU7XG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgcmVzZXRQb3NpdGlvbihwb3NpdGlvbiA9IHRoaXMuX19uZXh0UG9zaXRpb24pIHtcbiAgICB2YXIgdHJhbnNwb3J0ID0gdGhpcy5fX3RyYW5zcG9ydDtcbiAgICB2YXIgdGltZSA9IHRyYW5zcG9ydC5fX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKTtcblxuICAgIHRoaXMuX19uZXh0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLl9fbmV4dFRpbWUgPSB0aW1lO1xuICAgIHRoaXMucmVzZXRUaW1lKHRpbWUpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLl9fdHJhbnNwb3J0Ll9fc2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gbnVsbDtcbiAgfVxufVxuXG4vLyBpbnRlcm5hbCBzY2hlZHVsaW5nIHF1ZXVlIHRoYXQgcmV0dXJucyB0aGUgY3VycmVudCBwb3NpdGlvbiAoYW5kIHRpbWUpIG9mIHRoZSBwbGF5IGNvbnRyb2xcbmNsYXNzIFRyYW5zcG9ydFNjaGVkdWxpbmdRdWV1ZSBleHRlbmRzIFNjaGVkdWxpbmdRdWV1ZSB7XG4gIGNvbnN0cnVjdG9yKHRyYW5zcG9ydCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuICAgIHRyYW5zcG9ydC5fX3NjaGVkdWxlci5hZGQodGhpcywgSW5maW5pdHkpO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9fdHJhbnNwb3J0LmN1cnJlbnRUaW1lO1xuICB9XG5cbiAgZ2V0IGN1cnJlbnRQb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RyYW5zcG9ydC5jdXJyZW50UG9zaXRpb247XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuX190cmFuc3BvcnQuX19zY2hlZHVsZXIucmVtb3ZlKHRoaXMpO1xuICAgIHRoaXMuX190cmFuc3BvcnQgPSBudWxsO1xuICB9XG59XG5cbi8qKlxuICogVHJhbnNwb3J0IGNsYXNzXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zcG9ydCBleHRlbmRzIFRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdWRpb0NvbnRleHQgPSBvcHRpb25zLmF1ZGlvQ29udGV4dCB8fCBkZWZhdWx0QXVkaW9Db250ZXh0O1xuXG4gICAgdGhpcy5fX2VuZ2luZXMgPSBbXTtcbiAgICB0aGlzLl9fdHJhbnNwb3J0ZWQgPSBbXTtcblxuICAgIHRoaXMuX19zY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIodGhpcy5hdWRpb0NvbnRleHQpO1xuICAgIHRoaXMuX19zY2hlZHVsZXJIb29rID0gbmV3IFRyYW5zcG9ydFNjaGVkdWxlckhvb2sodGhpcyk7XG4gICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19zY2hlZHVsaW5nUXVldWUgPSBuZXcgVHJhbnNwb3J0U2NoZWR1bGluZ1F1ZXVlKHRoaXMpO1xuXG4gICAgLy8gc3luY3Jvbml6ZWQgdGltZSwgcG9zaXRpb24sIGFuZCBzcGVlZFxuICAgIHRoaXMuX190aW1lID0gMDtcbiAgICB0aGlzLl9fcG9zaXRpb24gPSAwO1xuICAgIHRoaXMuX19zcGVlZCA9IDA7XG4gIH1cblxuICBfX2dldFRpbWVBdFBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX190aW1lICsgKHBvc2l0aW9uIC0gdGhpcy5fX3Bvc2l0aW9uKSAvIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fZ2V0UG9zaXRpb25BdFRpbWUodGltZSkge1xuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdmFyIG51bVRyYW5zcG9ydGVkRW5naW5lcyA9IHRoaXMuX190cmFuc3BvcnRlZC5sZW5ndGg7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuXG4gICAgaWYgKG51bVRyYW5zcG9ydGVkRW5naW5lcyA+IDApIHtcbiAgICAgIHZhciBlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbjtcblxuICAgICAgdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUuY2xlYXIoKTtcbiAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLnJldmVyc2UgPSAoc3BlZWQgPCAwKTtcblxuICAgICAgZm9yICh2YXIgaSA9IG51bVRyYW5zcG9ydGVkRW5naW5lcyAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkW2ldO1xuICAgICAgICBuZXh0RW5naW5lUG9zaXRpb24gPSBlbmdpbmUuc3luY1Bvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgICAgIHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydChlbmdpbmUsIG5leHRFbmdpbmVQb3NpdGlvbiwgZmFsc2UpOyAvLyBpbnNlcnQgYnV0IGRvbid0IHNvcnRcbiAgICAgIH1cblxuICAgICAgZW5naW5lID0gdGhpcy5fX3RyYW5zcG9ydGVkWzBdO1xuICAgICAgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLnN5bmNQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUuaW5zZXJ0KGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uLCB0cnVlKTsgLy8gaW5zZXJ0IGFuZCBzb3J0XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRQb3NpdGlvbjtcbiAgfVxuXG4gIF9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgZm9yICh2YXIgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuc3luY1NwZWVkKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGN1cnJlbnQgbWFzdGVyIHRpbWVcbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHRpbWVcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydCBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICovXG4gIGdldCBjdXJyZW50VGltZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgY3VycmVudCBtYXN0ZXIgcG9zaXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSBjdXJyZW50IHBsYXlpbmcgcG9zaXRpb25cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIHJlcGxhY2VkIHdoZW4gdGhlIHRyYW5zcG9ydCBpcyBhZGRlZCB0byBhIG1hc3RlciAoaS5lLiB0cmFuc3BvcnQgb3IgcGxheS1jb250cm9sKS5cbiAgICovXG4gIGdldCBjdXJyZW50UG9zaXRpb24oKSB7XG4gICAgdmFyIG1hc3RlciA9IHRoaXMubWFzdGVyO1xuXG4gICAgaWYgKG1hc3RlciAmJiBtYXN0ZXIuY3VycmVudFBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gbWFzdGVyLmN1cnJlbnRQb3NpdGlvbjtcblxuICAgIHJldHVybiB0aGlzLl9fcG9zaXRpb24gKyAodGhpcy5fX3NjaGVkdWxlci5jdXJyZW50VGltZSAtIHRoaXMuX190aW1lKSAqIHRoaXMuX19zcGVlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCBuZXh0IHRyYW5zcG9ydCBwb3NpdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbmV4dCB0cmFuc3BvcnQgcG9zaXRpb25cbiAgICovXG4gIHJlc2V0UG9zaXRpb24ocG9zaXRpb24pIHtcbiAgICB2YXIgbWFzdGVyID0gdGhpcy5tYXN0ZXI7XG5cbiAgICBpZiAobWFzdGVyICYmIG1hc3Rlci5yZXNldEVuZ2luZVBvc2l0aW9uICE9PSB1bmRlZmluZWQpXG4gICAgICBtYXN0ZXIucmVzZXRFbmdpbmVQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XG4gICAgZWxzZVxuICAgICAgdGhpcy5fX3NjaGVkdWxlckhvb2sucmVzZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAodHJhbnNwb3J0ZWQgaW50ZXJmYWNlKVxuICBzeW5jUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKSB7XG4gICAgdGhpcy5fX3RpbWUgPSB0aW1lO1xuICAgIHRoaXMuX19wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuX19zcGVlZCA9IHNwZWVkO1xuXG4gICAgcmV0dXJuIHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtZXRob2QgKHRyYW5zcG9ydGVkIGludGVyZmFjZSlcbiAgYWR2YW5jZVBvc2l0aW9uKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCkge1xuICAgIC8vIGNvbnNvbGUubG9nKHRpbWUsIHBvc2l0aW9uLCBzcGVlZCk7XG4gICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLnRpbWU7XG5cbiAgICB3aGlsZSAobmV4dFBvc2l0aW9uID09PSBwb3NpdGlvbikge1xuICAgICAgdmFyIGVuZ2luZSA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmhlYWQ7XG4gICAgICB2YXIgbmV4dEVuZ2luZVBvc2l0aW9uID0gZW5naW5lLmFkdmFuY2VQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICBpZiAoKChzcGVlZCA+IDAgJiYgbmV4dEVuZ2luZVBvc2l0aW9uID4gcG9zaXRpb24pIHx8IChzcGVlZCA8IDAgJiYgbmV4dEVuZ2luZVBvc2l0aW9uIDwgcG9zaXRpb24pKSAmJlxuICAgICAgICAobmV4dEVuZ2luZVBvc2l0aW9uIDwgSW5maW5pdHkgJiYgbmV4dEVuZ2luZVBvc2l0aW9uID4gLUluZmluaXR5KSkge1xuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fdHJhbnNwb3J0ZWRRdWV1ZS5tb3ZlKGVuZ2luZSwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLnJlbW92ZShlbmdpbmUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXh0UG9zaXRpb247XG4gIH1cblxuICAvLyBUaW1lRW5naW5lIG1ldGhvZCAoc3BlZWQtY29udHJvbGxlZCBpbnRlcmZhY2UpXG4gIHN5bmNTcGVlZCh0aW1lLCBwb3NpdGlvbiwgc3BlZWQsIHNlZWsgPSBmYWxzZSkge1xuICAgIHZhciBsYXN0U3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICB0aGlzLl9fdGltZSA9IHRpbWU7XG4gICAgdGhpcy5fX3Bvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5fX3NwZWVkID0gc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IGxhc3RTcGVlZCB8fCAoc2VlayAmJiBzcGVlZCAhPT0gMCkpIHtcbiAgICAgIHZhciBuZXh0UG9zaXRpb247XG5cbiAgICAgIC8vIHJlc3luYyB0cmFuc3BvcnRlZCBlbmdpbmVzXG4gICAgICBpZiAoc2VlayB8fCBzcGVlZCAqIGxhc3RTcGVlZCA8IDApIHtcbiAgICAgICAgLy8gc2VlayBvciByZXZlcnNlIGRpcmVjdGlvblxuICAgICAgICBuZXh0UG9zaXRpb24gPSB0aGlzLl9fc3luY1RyYW5zcG9ydGVkUG9zaXRpb24odGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH0gZWxzZSBpZiAobGFzdFNwZWVkID09PSAwKSB7XG4gICAgICAgIC8vIHN0YXJ0XG4gICAgICAgIG5leHRQb3NpdGlvbiA9IHRoaXMuX19zeW5jVHJhbnNwb3J0ZWRQb3NpdGlvbih0aW1lLCBwb3NpdGlvbiwgc3BlZWQpO1xuICAgICAgfSBlbHNlIGlmIChzcGVlZCA9PT0gMCkge1xuICAgICAgICAvLyBzdG9wXG4gICAgICAgIG5leHRQb3NpdGlvbiA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hhbmdlIHNwZWVkIHdpdGhvdXQgcmV2ZXJzaW5nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLl9fc3luY1RyYW5zcG9ydGVkU3BlZWQodGltZSwgcG9zaXRpb24sIHNwZWVkKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBhIHRpbWUgZW5naW5lIHRvIHRoZSB0cmFuc3BvcnRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVuZ2luZSBlbmdpbmUgdG8gYmUgYWRkZWQgdG8gdGhlIHRyYW5zcG9ydFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb24gc3RhcnQgcG9zaXRpb25cbiAgICovXG4gIGFkZChlbmdpbmUsIHN0YXJ0UG9zaXRpb24gPSAwLCBlbmRQb3NpdGlvbiA9IEluZmluaXR5LCBvZmZzZXRQb3NpdGlvbiA9IDApIHtcbiAgICB2YXIgdHJhbnNwb3J0ZWQgPSBudWxsO1xuXG4gICAgaWYgKG9mZnNldFBvc2l0aW9uID09PSAtSW5maW5pdHkpXG4gICAgICBvZmZzZXRQb3NpdGlvbiA9IDA7XG5cbiAgICBpZiAoZW5naW5lLm1hc3RlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIGFkZGVkIHRvIGEgbWFzdGVyXCIpO1xuXG4gICAgaWYgKFRpbWVFbmdpbmUuaW1wbGVtZW50c1RyYW5zcG9ydGVkKGVuZ2luZSkpXG4gICAgICB0cmFuc3BvcnRlZCA9IG5ldyBUcmFuc3BvcnRlZFRyYW5zcG9ydGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTcGVlZENvbnRyb2xsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU3BlZWRDb250cm9sbGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlIGlmIChUaW1lRW5naW5lLmltcGxlbWVudHNTY2hlZHVsZWQoZW5naW5lKSlcbiAgICAgIHRyYW5zcG9ydGVkID0gbmV3IFRyYW5zcG9ydGVkU2NoZWR1bGVkKHRoaXMsIGVuZ2luZSwgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24sIG9mZnNldFBvc2l0aW9uKTtcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIGEgdHJhbnNwb3J0XCIpO1xuXG4gICAgaWYgKHRyYW5zcG9ydGVkKSB7XG4gICAgICB2YXIgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICAgIGFkZER1cGxldCh0aGlzLl9fZW5naW5lcywgdGhpcy5fX3RyYW5zcG9ydGVkLCBlbmdpbmUsIHRyYW5zcG9ydGVkKTtcblxuICAgICAgaWYgKHNwZWVkICE9PSAwKSB7XG4gICAgICAgIC8vIHN5bmMgYW5kIHN0YXJ0XG4gICAgICAgIHZhciBuZXh0RW5naW5lUG9zaXRpb24gPSB0cmFuc3BvcnRlZC5zeW5jUG9zaXRpb24odGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIHNwZWVkKTtcbiAgICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLmluc2VydCh0cmFuc3BvcnRlZCwgbmV4dEVuZ2luZVBvc2l0aW9uKTtcblxuICAgICAgICB0aGlzLnJlc2V0UG9zaXRpb24obmV4dFBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJhbnNwb3J0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgdGltZSBlbmdpbmUgZnJvbSB0aGUgdHJhbnNwb3J0XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBlbmdpbmVPclRyYW5zcG9ydGVkIGVuZ2luZSBvciB0cmFuc3BvcnRlZCB0byBiZSByZW1vdmVkIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgcmVtb3ZlKGVuZ2luZU9yVHJhbnNwb3J0ZWQpIHtcbiAgICB2YXIgZW5naW5lID0gZW5naW5lT3JUcmFuc3BvcnRlZDtcbiAgICB2YXIgdHJhbnNwb3J0ZWQgPSByZW1vdmVEdXBsZXQodGhpcy5fX2VuZ2luZXMsIHRoaXMuX190cmFuc3BvcnRlZCwgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG5cbiAgICBpZiAoIXRyYW5zcG9ydGVkKSB7XG4gICAgICBlbmdpbmUgPSByZW1vdmVEdXBsZXQodGhpcy5fX3RyYW5zcG9ydGVkLCB0aGlzLl9fZW5naW5lcywgZW5naW5lT3JUcmFuc3BvcnRlZCk7XG4gICAgICB0cmFuc3BvcnRlZCA9IGVuZ2luZU9yVHJhbnNwb3J0ZWQ7XG4gICAgfVxuXG4gICAgaWYgKGVuZ2luZSAmJiB0cmFuc3BvcnRlZCkge1xuICAgICAgdmFyIG5leHRQb3NpdGlvbiA9IHRoaXMuX190cmFuc3BvcnRlZFF1ZXVlLnJlbW92ZSh0cmFuc3BvcnRlZCk7XG5cbiAgICAgIHRyYW5zcG9ydGVkLmRlc3Ryb3koKTtcblxuICAgICAgaWYgKHRoaXMuX19zcGVlZCAhPT0gMClcbiAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9iamVjdCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gdGhpcyB0cmFuc3BvcnRcIik7XG4gICAgfVxuICB9XG5cbiAgcmVzZXRFbmdpbmVQb3NpdGlvbih0cmFuc3BvcnRlZCwgcG9zaXRpb24gPSB1bmRlZmluZWQpIHtcbiAgICB2YXIgc3BlZWQgPSB0aGlzLl9fc3BlZWQ7XG5cbiAgICBpZiAoc3BlZWQgIT09IDApIHtcbiAgICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBwb3NpdGlvbiA9IHRyYW5zcG9ydGVkLnN5bmNQb3NpdGlvbih0aGlzLmN1cnJlbnRUaW1lLCB0aGlzLmN1cnJlbnRQb3NpdGlvbiwgc3BlZWQpO1xuXG4gICAgICB2YXIgbmV4dFBvc2l0aW9uID0gdGhpcy5fX3RyYW5zcG9ydGVkUXVldWUubW92ZSh0cmFuc3BvcnRlZCwgcG9zaXRpb24pO1xuICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG5leHRQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbGwgdGltZSBlbmdpbmVzIGZyb20gdGhlIHRyYW5zcG9ydFxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zeW5jU3BlZWQodGhpcy5jdXJyZW50VGltZSwgdGhpcy5jdXJyZW50UG9zaXRpb24sIDApO1xuXG4gICAgZm9yICh2YXIgdHJhbnNwb3J0ZWQgb2YgdGhpcy5fX3RyYW5zcG9ydGVkKVxuICAgICAgdHJhbnNwb3J0ZWQuZGVzdHJveSgpO1xuICB9XG59XG4iLCIvKiB3cml0dGVuIGluIEVDTUFzY3JpcHQgNiAqL1xuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgYXVkaW8gcHJpb3JpdHkgcXVldWUgdXNlZCBieSBzY2hlZHVsZXIgYW5kIHRyYW5zcG9ydHNcbiAqIEBhdXRob3IgTm9yYmVydCBTY2huZWxsIDxOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnI+XG4gKlxuICogRmlyc3QgcmF0aGVyIHN0dXBpZCBpbXBsZW1lbnRhdGlvbiB0byBiZSBvcHRpbWl6ZWQuLi5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmlvcml0eVF1ZXVlIHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9fb2JqZWN0cyA9IFtdO1xuICAgIHRoaXMucmV2ZXJzZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqICBHZXQgdGhlIGluZGV4IG9mIGFuIG9iamVjdCBpbiB0aGUgb2JqZWN0IGxpc3RcbiAgICovXG4gIF9fb2JqZWN0SW5kZXgob2JqZWN0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9fb2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG9iamVjdCA9PT0gdGhpcy5fX29iamVjdHNbaV1bMF0pIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaXRoZHJhdyBhbiBvYmplY3QgZnJvbSB0aGUgb2JqZWN0IGxpc3RcbiAgICovXG4gIF9fcmVtb3ZlT2JqZWN0KG9iamVjdCkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX19vYmplY3RJbmRleChvYmplY3QpO1xuXG4gICAgaWYgKGluZGV4ID49IDApXG4gICAgICB0aGlzLl9fb2JqZWN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07IC8vIHJldHVybiB0aW1lIG9mIGZpcnN0IG9iamVjdFxuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG5cbiAgX19zb3J0T2JqZWN0cygpIHtcbiAgICBpZiAoIXRoaXMucmV2ZXJzZSlcbiAgICAgIHRoaXMuX19vYmplY3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYVsxXSAtIGJbMV07XG4gICAgICB9KTtcbiAgICBlbHNlXG4gICAgICB0aGlzLl9fb2JqZWN0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGJbMV0gLSBhWzFdO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IGFuIG9iamVjdCB0byB0aGUgcXVldWVcbiAgICogKGZvciB0aGlzIHByaW1pdGl2ZSB2ZXJzaW9uOiBwcmV2ZW50IHNvcnRpbmcgZm9yIGVhY2ggZWxlbWVudCBieSBjYWxsaW5nIHdpdGggXCJmYWxzZVwiIGFzIHRoaXJkIGFyZ3VtZW50KVxuICAgKi9cbiAgaW5zZXJ0KG9iamVjdCwgdGltZSwgc29ydCA9IHRydWUpIHtcbiAgICBpZiAodGltZSAhPT0gSW5maW5pdHkgJiYgdGltZSAhPSAtSW5maW5pdHkpIHtcbiAgICAgIC8vIGFkZCBuZXcgb2JqZWN0XG4gICAgICB0aGlzLl9fb2JqZWN0cy5wdXNoKFtvYmplY3QsIHRpbWVdKTtcblxuICAgICAgaWYgKHNvcnQpXG4gICAgICAgIHRoaXMuX19zb3J0T2JqZWN0cygpO1xuXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMV07IC8vIHJldHVybiB0aW1lIG9mIGZpcnN0IG9iamVjdFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9fcmVtb3ZlT2JqZWN0KG9iamVjdCk7XG4gIH1cblxuICAvKipcbiAgICogTW92ZSBhbiBvYmplY3QgdG8gYW5vdGhlciB0aW1lIGluIHRoZSBxdWV1ZVxuICAgKi9cbiAgbW92ZShvYmplY3QsIHRpbWUpIHtcbiAgICBpZiAodGltZSAhPT0gSW5maW5pdHkgJiYgdGltZSAhPSAtSW5maW5pdHkpIHtcblxuICAgICAgdmFyIGluZGV4ID0gdGhpcy5fX29iamVjdEluZGV4KG9iamVjdCk7XG5cbiAgICAgIGlmIChpbmRleCA8IDApXG4gICAgICAgIHRoaXMuX19vYmplY3RzLnB1c2goW29iamVjdCwgdGltZV0pOyAvLyBhZGQgbmV3IG9iamVjdFxuICAgICAgZWxzZVxuICAgICAgICB0aGlzLl9fb2JqZWN0c1tpbmRleF1bMV0gPSB0aW1lOyAvLyB1cGRhdGUgdGltZSBvZiBleGlzdGluZyBvYmplY3RcblxuICAgICAgdGhpcy5fX3NvcnRPYmplY3RzKCk7XG5cbiAgICAgIHJldHVybiB0aGlzLl9fb2JqZWN0c1swXVsxXTsgLy8gcmV0dXJuIHRpbWUgb2YgZmlyc3Qgb2JqZWN0XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgYW4gb2JqZWN0IGZyb20gdGhlIHF1ZXVlXG4gICAqL1xuICByZW1vdmUob2JqZWN0KSB7XG4gICAgcmV0dXJuIHRoaXMuX19yZW1vdmVPYmplY3Qob2JqZWN0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciBxdWV1ZVxuICAgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5fX29iamVjdHMubGVuZ3RoID0gMDsgLy8gY2xlYXIgb2JqZWN0IGxpc3RcbiAgICByZXR1cm4gSW5maW5pdHk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGZpcnN0IG9iamVjdCBpbiBxdWV1ZVxuICAgKi9cbiAgZ2V0IGhlYWQoKSB7XG4gICAgaWYgKHRoaXMuX19vYmplY3RzLmxlbmd0aCA+IDApXG4gICAgICByZXR1cm4gdGhpcy5fX29iamVjdHNbMF1bMF07XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGltZSBvZiBmaXJzdCBvYmplY3QgaW4gcXVldWVcbiAgICovXG4gIGdldCB0aW1lKCkge1xuICAgIGlmICh0aGlzLl9fb2JqZWN0cy5sZW5ndGggPiAwKVxuICAgICAgcmV0dXJuIHRoaXMuX19vYmplY3RzWzBdWzFdO1xuXG4gICAgcmV0dXJuIEluZmluaXR5O1xuICB9XG59XG4iLCIvKipcbiAqIFNjaGVkdWxpbmdRdWV1ZSBiYXNlIGNsYXNzXG4gKiBodHRwOi8vd2F2ZXNqcy5naXRodWIuaW8vYXVkaW8vI2F1ZGlvLXNjaGVkdWxpbmctcXVldWVcbiAqXG4gKiBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnJcbiAqIENvcHlyaWdodCAyMDE0LCAyMDE1IElSQ0FNIOKAk8KgQ2VudHJlIFBvbXBpZG91XG4gKi9cblxuaW1wb3J0IFByaW9yaXR5UXVldWUgZnJvbSAnLi4vdXRpbHMvcHJpb3JpdHktcXVldWUnO1xuaW1wb3J0IFRpbWVFbmdpbmUgZnJvbSAnLi4vY29yZS90aW1lLWVuZ2luZSc7XG5pbXBvcnQgZGVmYXVsdEF1ZGlvQ29udGV4dCBmcm9tICcuLi9jb3JlL2F1ZGlvLWNvbnRleHQnO1xuXG4vKipcbiAqIEBjbGFzcyBTY2hlZHVsaW5nUXVldWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGluZ1F1ZXVlIGV4dGVuZHMgVGltZUVuZ2luZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9fcXVldWUgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAgIHRoaXMuX19lbmdpbmVzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSAnc2NoZWR1bGVkJyBpbnRlcmZhY2VcbiAgYWR2YW5jZVRpbWUodGltZSkge1xuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS50aW1lO1xuXG4gICAgd2hpbGUgKG5leHRUaW1lIDw9IHRpbWUpIHtcbiAgICAgIHZhciBlbmdpbmUgPSB0aGlzLl9fcXVldWUuaGVhZDtcbiAgICAgIHZhciBuZXh0RW5naW5lVGltZSA9IGVuZ2luZS5hZHZhbmNlVGltZSh0aW1lKTtcblxuICAgICAgaWYgKCFuZXh0RW5naW5lVGltZSkge1xuICAgICAgICBlbmdpbmUubWFzdGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fX2VuZ2luZXMuZGVsZXRlKGVuZ2luZSk7XG4gICAgICAgIG5leHRUaW1lID0gdGhpcy5fX3F1ZXVlLnJlbW92ZShlbmdpbmUpO1xuICAgICAgfSBlbHNlIGlmIChuZXh0RW5naW5lVGltZSA+IHRpbWUgJiYgbmV4dEVuZ2luZVRpbWUgPD0gSW5maW5pdHkpIHtcbiAgICAgICAgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUubW92ZShlbmdpbmUsIG5leHRFbmdpbmVUaW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZW5naW5lIGRpZCBub3QgYWR2YW5jZSB0aW1lJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5leHRUaW1lO1xuICB9XG5cbiAgLy8gVGltZUVuZ2luZSBtYXN0ZXIgbWV0aG9kIHRvIGJlIGltcGxlbWVudGVkIGJ5IGRlcml2ZWQgY2xhc3NcbiAgZ2V0IGN1cnJlbnRUaW1lKCkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gY2FsbCBhIGZ1bmN0aW9uIGF0IGEgZ2l2ZW4gdGltZVxuICBkZWZlcihmdW4sIHRpbWUgPSB0aGlzLmN1cnJlbnRUaW1lKSB7XG4gICAgaWYgKCEoZnVuIGluc3RhbmNlb2YgRnVuY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGNhbm5vdCBiZSBkZWZlcmVkIGJ5IHNjaGVkdWxlclwiKTtcblxuICAgIHRoaXMuYWRkKHtcbiAgICAgIGFkdmFuY2VUaW1lOiBmdW5jdGlvbih0aW1lKSB7IGZ1bih0aW1lKTsgfSwgLy8gbWFrZSBzdXIgdGhhdCB0aGUgYWR2YW5jZVRpbWUgbWV0aG9kIGRvZXMgbm90IHJldHVybSBhbnl0aGluZ1xuICAgIH0sIHRpbWUpO1xuICB9XG5cbiAgLy8gYWRkIGEgdGltZSBlbmdpbmUgdG8gdGhlIHNjaGVkdWxlclxuICBhZGQoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmICghVGltZUVuZ2luZS5pbXBsZW1lbnRzU2NoZWR1bGVkKGVuZ2luZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgY2Fubm90IGJlIGFkZGVkIHRvIHNjaGVkdWxlclwiKTtcblxuICAgIGlmIChlbmdpbmUubWFzdGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gYWRkZWQgdG8gYSBtYXN0ZXJcIik7XG5cbiAgICBlbmdpbmUubWFzdGVyID0gdGhpcztcblxuICAgIC8vIGFkZCB0byBlbmdpbmVzIGFuZCBxdWV1ZVxuICAgIHRoaXMuX19lbmdpbmVzLmFkZChlbmdpbmUpO1xuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5pbnNlcnQoZW5naW5lLCB0aW1lKTtcblxuICAgIC8vIHJlc2NoZWR1bGUgcXVldWVcbiAgICB0aGlzLnJlc2V0VGltZShuZXh0VGltZSk7XG4gIH1cblxuICAvLyByZW1vdmUgYSB0aW1lIGVuZ2luZSBmcm9tIHRoZSBxdWV1ZVxuICByZW1vdmUoZW5naW5lKSB7XG4gICAgaWYgKGVuZ2luZS5tYXN0ZXIgIT09IHRoaXMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvYmplY3QgaGFzIG5vdCBiZWVuIGFkZGVkIHRvIHRoaXMgc2NoZWR1bGVyXCIpO1xuXG4gICAgZW5naW5lLm1hc3RlciA9IG51bGw7XG5cbiAgICAvLyByZW1vdmUgZnJvbSBhcnJheSBhbmQgcXVldWVcbiAgICB0aGlzLl9fZW5naW5lcy5kZWxldGUoZW5naW5lKTtcbiAgICB2YXIgbmV4dFRpbWUgPSB0aGlzLl9fcXVldWUucmVtb3ZlKGVuZ2luZSk7XG5cbiAgICAvLyByZXNjaGVkdWxlIHF1ZXVlXG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gcmVzZXQgbmV4dCBlbmdpbmUgdGltZVxuICByZXNldEVuZ2luZVRpbWUoZW5naW5lLCB0aW1lID0gdGhpcy5jdXJyZW50VGltZSkge1xuICAgIGlmIChlbmdpbmUubWFzdGVyICE9PSB0aGlzKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwib2JqZWN0IGhhcyBub3QgYmVlbiBhZGRlZCB0byB0aGlzIHNjaGVkdWxlclwiKTtcblxuICAgIHZhciBuZXh0VGltZSA9IHRoaXMuX19xdWV1ZS5tb3ZlKGVuZ2luZSwgdGltZSk7XG4gICAgdGhpcy5yZXNldFRpbWUobmV4dFRpbWUpO1xuICB9XG5cbiAgLy8gY2hlY2sgd2hldGhlciBhIGdpdmVuIGVuZ2luZSBpcyBzY2hlZHVsZWRcbiAgaGFzKGVuZ2luZSkge1xuICAgIHJldHVybiB0aGlzLl9fZW5naW5lcy5oYXMoZW5naW5lKTtcbiAgfVxuXG4gIC8vIGNsZWFyIHF1ZXVlXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuX19xdWV1ZS5jbGVhcigpO1xuICAgIHRoaXMuX19lbmdpbmVzLmNsZWFyO1xuICAgIHRoaXMucmVzZXRUaW1lKEluZmluaXR5KTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2dldC1pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvY3JlYXRlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZlwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZlwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9zZXRcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi93ZWFrLW1hcFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWZpbmVQcm9wZXJ0eSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAoMCwgX2RlZmluZVByb3BlcnR5Mi5kZWZhdWx0KSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dldFByb3RvdHlwZU9mID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZlwiKTtcblxudmFyIF9nZXRQcm90b3R5cGVPZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9nZXRQcm90b3R5cGVPZik7XG5cbnZhciBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9ICgwLCBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yMi5kZWZhdWx0KShvYmplY3QsIHByb3BlcnR5KTtcblxuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBhcmVudCA9ICgwLCBfZ2V0UHJvdG90eXBlT2YyLmRlZmF1bHQpKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9zZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfc2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2NyZWF0ZVwiKTtcblxudmFyIF9jcmVhdGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlKTtcblxudmFyIF90eXBlb2YyID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgKHR5cGVvZiBzdXBlckNsYXNzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShzdXBlckNsYXNzKSkpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gKDAsIF9jcmVhdGUyLmRlZmF1bHQpKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2YyLmRlZmF1bHQgPyAoMCwgX3NldFByb3RvdHlwZU9mMi5kZWZhdWx0KShzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF90eXBlb2YyID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAoKHR5cGVvZiBjYWxsID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShjYWxsKSkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfaXRlcmF0b3IgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC9pdGVyYXRvclwiKTtcblxudmFyIF9pdGVyYXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pdGVyYXRvcik7XG5cbnZhciBfc3ltYm9sID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2xcIik7XG5cbnZhciBfc3ltYm9sMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3N5bWJvbCk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgX2l0ZXJhdG9yMi5kZWZhdWx0ID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gX3N5bWJvbDIuZGVmYXVsdCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIF90eXBlb2YoX2l0ZXJhdG9yMi5kZWZhdWx0KSA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogX3R5cGVvZihvYmopO1xufSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gX3N5bWJvbDIuZGVmYXVsdCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn07IiwicmVxdWlyZSgnLi4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9jb3JlLmdldC1pdGVyYXRvcicpOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUnKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpe1xuICByZXR1cm4gJE9iamVjdC5jcmVhdGUoUCwgRCk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHknKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYyl7XG4gIHJldHVybiAkT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2MpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgcmV0dXJuICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LmdldFByb3RvdHlwZU9mOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Quc2V0UHJvdG90eXBlT2Y7IiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnNldCcpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczcuc2V0LnRvLWpzb24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlNldDsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLlN5bWJvbDsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL193a3MnKSgnaXRlcmF0b3InKTsiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LndlYWstbWFwJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL21vZHVsZXMvX2NvcmUnKS5XZWFrTWFwOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKXsgLyogZW1wdHkgKi8gfTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSwgZm9yYmlkZGVuRmllbGQpe1xuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpIHx8IChmb3JiaWRkZW5GaWVsZCAhPT0gdW5kZWZpbmVkICYmIGZvcmJpZGRlbkZpZWxkIGluIGl0KSl7XG4gICAgdGhyb3cgVHlwZUVycm9yKG5hbWUgKyAnOiBpbmNvcnJlY3QgaW52b2NhdGlvbiEnKTtcbiAgfSByZXR1cm4gaXQ7XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKCFpc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59OyIsInZhciBmb3JPZiA9IHJlcXVpcmUoJy4vX2Zvci1vZicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXIsIElURVJBVE9SKXtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3JPZihpdGVyLCBmYWxzZSwgcmVzdWx0LnB1c2gsIHJlc3VsdCwgSVRFUkFUT1IpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgdG9MZW5ndGggID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCB0b0luZGV4ICAgPSByZXF1aXJlKCcuL190by1pbmRleCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgZWwsIGZyb21JbmRleCl7XG4gICAgdmFyIE8gICAgICA9IHRvSU9iamVjdCgkdGhpcylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IHRvSW5kZXgoZnJvbUluZGV4LCBsZW5ndGgpXG4gICAgICAsIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICBpZihJU19JTkNMVURFUyAmJiBlbCAhPSBlbCl3aGlsZShsZW5ndGggPiBpbmRleCl7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICBpZih2YWx1ZSAhPSB2YWx1ZSlyZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSN0b0luZGV4IGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4O1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwiLy8gMCAtPiBBcnJheSNmb3JFYWNoXG4vLyAxIC0+IEFycmF5I21hcFxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcbi8vIDMgLT4gQXJyYXkjc29tZVxuLy8gNCAtPiBBcnJheSNldmVyeVxuLy8gNSAtPiBBcnJheSNmaW5kXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxudmFyIGN0eCAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBJT2JqZWN0ICA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgYXNjICAgICAgPSByZXF1aXJlKCcuL19hcnJheS1zcGVjaWVzLWNyZWF0ZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUWVBFLCAkY3JlYXRlKXtcbiAgdmFyIElTX01BUCAgICAgICAgPSBUWVBFID09IDFcbiAgICAsIElTX0ZJTFRFUiAgICAgPSBUWVBFID09IDJcbiAgICAsIElTX1NPTUUgICAgICAgPSBUWVBFID09IDNcbiAgICAsIElTX0VWRVJZICAgICAgPSBUWVBFID09IDRcbiAgICAsIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDZcbiAgICAsIE5PX0hPTEVTICAgICAgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWFxuICAgICwgY3JlYXRlICAgICAgICA9ICRjcmVhdGUgfHwgYXNjO1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGNhbGxiYWNrZm4sIHRoYXQpe1xuICAgIHZhciBPICAgICAgPSB0b09iamVjdCgkdGhpcylcbiAgICAgICwgc2VsZiAgID0gSU9iamVjdChPKVxuICAgICAgLCBmICAgICAgPSBjdHgoY2FsbGJhY2tmbiwgdGhhdCwgMylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IDBcbiAgICAgICwgcmVzdWx0ID0gSVNfTUFQID8gY3JlYXRlKCR0aGlzLCBsZW5ndGgpIDogSVNfRklMVEVSID8gY3JlYXRlKCR0aGlzLCAwKSA6IHVuZGVmaW5lZFxuICAgICAgLCB2YWwsIHJlcztcbiAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpe1xuICAgICAgdmFsID0gc2VsZltpbmRleF07XG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xuICAgICAgaWYoVFlQRSl7XG4gICAgICAgIGlmKElTX01BUClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgIC8vIG1hcFxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2goVFlQRSl7XG4gICAgICAgICAgY2FzZSAzOiByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWw7ICAgICAgICAgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcbiAgICAgICAgICBjYXNlIDI6IHJlc3VsdC5wdXNoKHZhbCk7ICAgICAgICAgICAgICAgLy8gZmlsdGVyXG4gICAgICAgIH0gZWxzZSBpZihJU19FVkVSWSlyZXR1cm4gZmFsc2U7ICAgICAgICAgIC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiByZXN1bHQ7XG4gIH07XG59OyIsIi8vIDkuNC4yLjMgQXJyYXlTcGVjaWVzQ3JlYXRlKG9yaWdpbmFsQXJyYXksIGxlbmd0aClcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgaXNBcnJheSAgPSByZXF1aXJlKCcuL19pcy1hcnJheScpXG4gICwgU1BFQ0lFUyAgPSByZXF1aXJlKCcuL193a3MnKSgnc3BlY2llcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvcmlnaW5hbCwgbGVuZ3RoKXtcbiAgdmFyIEM7XG4gIGlmKGlzQXJyYXkob3JpZ2luYWwpKXtcbiAgICBDID0gb3JpZ2luYWwuY29uc3RydWN0b3I7XG4gICAgLy8gY3Jvc3MtcmVhbG0gZmFsbGJhY2tcbiAgICBpZih0eXBlb2YgQyA9PSAnZnVuY3Rpb24nICYmIChDID09PSBBcnJheSB8fCBpc0FycmF5KEMucHJvdG90eXBlKSkpQyA9IHVuZGVmaW5lZDtcbiAgICBpZihpc09iamVjdChDKSl7XG4gICAgICBDID0gQ1tTUEVDSUVTXTtcbiAgICAgIGlmKEMgPT09IG51bGwpQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIG5ldyAoQyA9PT0gdW5kZWZpbmVkID8gQXJyYXkgOiBDKShsZW5ndGgpO1xufTsiLCIvLyBnZXR0aW5nIHRhZyBmcm9tIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpXG4gICwgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJylcbiAgLy8gRVMzIHdyb25nIGhlcmVcbiAgLCBBUkcgPSBjb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnQXJndW1lbnRzJztcblxuLy8gZmFsbGJhY2sgZm9yIElFMTEgU2NyaXB0IEFjY2VzcyBEZW5pZWQgZXJyb3JcbnZhciB0cnlHZXQgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gaXRba2V5XTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBULCBCO1xuICByZXR1cm4gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogaXQgPT09IG51bGwgPyAnTnVsbCdcbiAgICAvLyBAQHRvU3RyaW5nVGFnIGNhc2VcbiAgICA6IHR5cGVvZiAoVCA9IHRyeUdldChPID0gT2JqZWN0KGl0KSwgVEFHKSkgPT0gJ3N0cmluZycgPyBUXG4gICAgLy8gYnVpbHRpblRhZyBjYXNlXG4gICAgOiBBUkcgPyBjb2YoTylcbiAgICAvLyBFUzMgYXJndW1lbnRzIGZhbGxiYWNrXG4gICAgOiAoQiA9IGNvZihPKSkgPT0gJ09iamVjdCcgJiYgdHlwZW9mIE8uY2FsbGVlID09ICdmdW5jdGlvbicgPyAnQXJndW1lbnRzJyA6IEI7XG59OyIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoaXQpLnNsaWNlKDgsIC0xKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGRQICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZlxuICAsIGNyZWF0ZSAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgaGlkZSAgICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCByZWRlZmluZUFsbCA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lLWFsbCcpXG4gICwgY3R4ICAgICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGFuSW5zdGFuY2UgID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKVxuICAsIGRlZmluZWQgICAgID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpXG4gICwgZm9yT2YgICAgICAgPSByZXF1aXJlKCcuL19mb3Itb2YnKVxuICAsICRpdGVyRGVmaW5lID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKVxuICAsIHN0ZXAgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJylcbiAgLCBzZXRTcGVjaWVzICA9IHJlcXVpcmUoJy4vX3NldC1zcGVjaWVzJylcbiAgLCBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJylcbiAgLCBmYXN0S2V5ICAgICA9IHJlcXVpcmUoJy4vX21ldGEnKS5mYXN0S2V5XG4gICwgU0laRSAgICAgICAgPSBERVNDUklQVE9SUyA/ICdfcycgOiAnc2l6ZSc7XG5cbnZhciBnZXRFbnRyeSA9IGZ1bmN0aW9uKHRoYXQsIGtleSl7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xuICBpZihpbmRleCAhPT0gJ0YnKXJldHVybiB0aGF0Ll9pW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvcihlbnRyeSA9IHRoYXQuX2Y7IGVudHJ5OyBlbnRyeSA9IGVudHJ5Lm4pe1xuICAgIGlmKGVudHJ5LmsgPT0ga2V5KXJldHVybiBlbnRyeTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKXtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGhhdCwgaXRlcmFibGUpe1xuICAgICAgYW5JbnN0YW5jZSh0aGF0LCBDLCBOQU1FLCAnX2knKTtcbiAgICAgIHRoYXQuX2kgPSBjcmVhdGUobnVsbCk7IC8vIGluZGV4XG4gICAgICB0aGF0Ll9mID0gdW5kZWZpbmVkOyAgICAvLyBmaXJzdCBlbnRyeVxuICAgICAgdGhhdC5fbCA9IHVuZGVmaW5lZDsgICAgLy8gbGFzdCBlbnRyeVxuICAgICAgdGhhdFtTSVpFXSA9IDA7ICAgICAgICAgLy8gc2l6ZVxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZWRlZmluZUFsbChDLnByb3RvdHlwZSwge1xuICAgICAgLy8gMjMuMS4zLjEgTWFwLnByb3RvdHlwZS5jbGVhcigpXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIGNsZWFyOiBmdW5jdGlvbiBjbGVhcigpe1xuICAgICAgICBmb3IodmFyIHRoYXQgPSB0aGlzLCBkYXRhID0gdGhhdC5faSwgZW50cnkgPSB0aGF0Ll9mOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZihlbnRyeS5wKWVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhhdC5fZiA9IHRoYXQuX2wgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoYXRbU0laRV0gPSAwO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy4zIE1hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcbiAgICAgIC8vIDIzLjIuMy40IFNldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIHZhciB0aGF0ICA9IHRoaXNcbiAgICAgICAgICAsIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KTtcbiAgICAgICAgaWYoZW50cnkpe1xuICAgICAgICAgIHZhciBuZXh0ID0gZW50cnkublxuICAgICAgICAgICAgLCBwcmV2ID0gZW50cnkucDtcbiAgICAgICAgICBkZWxldGUgdGhhdC5faVtlbnRyeS5pXTtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZihwcmV2KXByZXYubiA9IG5leHQ7XG4gICAgICAgICAgaWYobmV4dCluZXh0LnAgPSBwcmV2O1xuICAgICAgICAgIGlmKHRoYXQuX2YgPT0gZW50cnkpdGhhdC5fZiA9IG5leHQ7XG4gICAgICAgICAgaWYodGhhdC5fbCA9PSBlbnRyeSl0aGF0Ll9sID0gcHJldjtcbiAgICAgICAgICB0aGF0W1NJWkVdLS07XG4gICAgICAgIH0gcmV0dXJuICEhZW50cnk7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMi4zLjYgU2V0LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICAvLyAyMy4xLjMuNSBNYXAucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIGZvckVhY2g6IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgICAgIGFuSW5zdGFuY2UodGhpcywgQywgJ2ZvckVhY2gnKTtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWQsIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzLl9mKXtcbiAgICAgICAgICBmKGVudHJ5LnYsIGVudHJ5LmssIHRoaXMpO1xuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjcgTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuMi4zLjcgU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICByZXR1cm4gISFnZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKERFU0NSSVBUT1JTKWRQKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGRlZmluZWQodGhpc1tTSVpFXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XG4gICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KVxuICAgICAgLCBwcmV2LCBpbmRleDtcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcbiAgICBpZihlbnRyeSl7XG4gICAgICBlbnRyeS52ID0gdmFsdWU7XG4gICAgLy8gY3JlYXRlIG5ldyBlbnRyeVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGF0Ll9sID0gZW50cnkgPSB7XG4gICAgICAgIGk6IGluZGV4ID0gZmFzdEtleShrZXksIHRydWUpLCAvLyA8LSBpbmRleFxuICAgICAgICBrOiBrZXksICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0ga2V5XG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxuICAgICAgICBwOiBwcmV2ID0gdGhhdC5fbCwgICAgICAgICAgICAgLy8gPC0gcHJldmlvdXMgZW50cnlcbiAgICAgICAgbjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgIC8vIDwtIG5leHQgZW50cnlcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcbiAgICAgIH07XG4gICAgICBpZighdGhhdC5fZil0aGF0Ll9mID0gZW50cnk7XG4gICAgICBpZihwcmV2KXByZXYubiA9IGVudHJ5O1xuICAgICAgdGhhdFtTSVpFXSsrO1xuICAgICAgLy8gYWRkIHRvIGluZGV4XG4gICAgICBpZihpbmRleCAhPT0gJ0YnKXRoYXQuX2lbaW5kZXhdID0gZW50cnk7XG4gICAgfSByZXR1cm4gdGhhdDtcbiAgfSxcbiAgZ2V0RW50cnk6IGdldEVudHJ5LFxuICBzZXRTdHJvbmc6IGZ1bmN0aW9uKEMsIE5BTUUsIElTX01BUCl7XG4gICAgLy8gYWRkIC5rZXlzLCAudmFsdWVzLCAuZW50cmllcywgW0BAaXRlcmF0b3JdXG4gICAgLy8gMjMuMS4zLjQsIDIzLjEuMy44LCAyMy4xLjMuMTEsIDIzLjEuMy4xMiwgMjMuMi4zLjUsIDIzLjIuMy44LCAyMy4yLjMuMTAsIDIzLjIuMy4xMVxuICAgICRpdGVyRGVmaW5lKEMsIE5BTUUsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgICAgIHRoaXMuX3QgPSBpdGVyYXRlZDsgIC8vIHRhcmdldFxuICAgICAgdGhpcy5fayA9IGtpbmQ7ICAgICAgLy8ga2luZFxuICAgICAgdGhpcy5fbCA9IHVuZGVmaW5lZDsgLy8gcHJldmlvdXNcbiAgICB9LCBmdW5jdGlvbigpe1xuICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAsIGtpbmQgID0gdGhhdC5fa1xuICAgICAgICAsIGVudHJ5ID0gdGhhdC5fbDtcbiAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxuICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XG4gICAgICAvLyBnZXQgbmV4dCBlbnRyeVxuICAgICAgaWYoIXRoYXQuX3QgfHwgISh0aGF0Ll9sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGF0Ll90Ll9mKSl7XG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXG4gICAgICAgIHRoYXQuX3QgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBzdGVwKDEpO1xuICAgICAgfVxuICAgICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxuICAgICAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBlbnRyeS5rKTtcbiAgICAgIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgZW50cnkudik7XG4gICAgICByZXR1cm4gc3RlcCgwLCBbZW50cnkuaywgZW50cnkudl0pO1xuICAgIH0sIElTX01BUCA/ICdlbnRyaWVzJyA6ICd2YWx1ZXMnICwgIUlTX01BUCwgdHJ1ZSk7XG5cbiAgICAvLyBhZGQgW0BAc3BlY2llc10sIDIzLjEuMi4yLCAyMy4yLjIuMlxuICAgIHNldFNwZWNpZXMoTkFNRSk7XG4gIH1cbn07IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuL19jbGFzc29mJylcbiAgLCBmcm9tICAgID0gcmVxdWlyZSgnLi9fYXJyYXktZnJvbS1pdGVyYWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIHRvSlNPTigpe1xuICAgIGlmKGNsYXNzb2YodGhpcykgIT0gTkFNRSl0aHJvdyBUeXBlRXJyb3IoTkFNRSArIFwiI3RvSlNPTiBpc24ndCBnZW5lcmljXCIpO1xuICAgIHJldHVybiBmcm9tKHRoaXMpO1xuICB9O1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgcmVkZWZpbmVBbGwgICAgICAgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKVxuICAsIGdldFdlYWsgICAgICAgICAgID0gcmVxdWlyZSgnLi9fbWV0YScpLmdldFdlYWtcbiAgLCBhbk9iamVjdCAgICAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgaXNPYmplY3QgICAgICAgICAgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGFuSW5zdGFuY2UgICAgICAgID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKVxuICAsIGZvck9mICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fZm9yLW9mJylcbiAgLCBjcmVhdGVBcnJheU1ldGhvZCA9IHJlcXVpcmUoJy4vX2FycmF5LW1ldGhvZHMnKVxuICAsICRoYXMgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBhcnJheUZpbmQgICAgICAgICA9IGNyZWF0ZUFycmF5TWV0aG9kKDUpXG4gICwgYXJyYXlGaW5kSW5kZXggICAgPSBjcmVhdGVBcnJheU1ldGhvZCg2KVxuICAsIGlkICAgICAgICAgICAgICAgID0gMDtcblxuLy8gZmFsbGJhY2sgZm9yIHVuY2F1Z2h0IGZyb3plbiBrZXlzXG52YXIgdW5jYXVnaHRGcm96ZW5TdG9yZSA9IGZ1bmN0aW9uKHRoYXQpe1xuICByZXR1cm4gdGhhdC5fbCB8fCAodGhhdC5fbCA9IG5ldyBVbmNhdWdodEZyb3plblN0b3JlKTtcbn07XG52YXIgVW5jYXVnaHRGcm96ZW5TdG9yZSA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuYSA9IFtdO1xufTtcbnZhciBmaW5kVW5jYXVnaHRGcm96ZW4gPSBmdW5jdGlvbihzdG9yZSwga2V5KXtcbiAgcmV0dXJuIGFycmF5RmluZChzdG9yZS5hLCBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XG4gIH0pO1xufTtcblVuY2F1Z2h0RnJvemVuU3RvcmUucHJvdG90eXBlID0ge1xuICBnZXQ6IGZ1bmN0aW9uKGtleSl7XG4gICAgdmFyIGVudHJ5ID0gZmluZFVuY2F1Z2h0RnJvemVuKHRoaXMsIGtleSk7XG4gICAgaWYoZW50cnkpcmV0dXJuIGVudHJ5WzFdO1xuICB9LFxuICBoYXM6IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuICEhZmluZFVuY2F1Z2h0RnJvemVuKHRoaXMsIGtleSk7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgdmFyIGVudHJ5ID0gZmluZFVuY2F1Z2h0RnJvemVuKHRoaXMsIGtleSk7XG4gICAgaWYoZW50cnkpZW50cnlbMV0gPSB2YWx1ZTtcbiAgICBlbHNlIHRoaXMuYS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0sXG4gICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgIHZhciBpbmRleCA9IGFycmF5RmluZEluZGV4KHRoaXMuYSwgZnVuY3Rpb24oaXQpe1xuICAgICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XG4gICAgfSk7XG4gICAgaWYofmluZGV4KXRoaXMuYS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiAhIX5pbmRleDtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKXtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGhhdCwgaXRlcmFibGUpe1xuICAgICAgYW5JbnN0YW5jZSh0aGF0LCBDLCBOQU1FLCAnX2knKTtcbiAgICAgIHRoYXQuX2kgPSBpZCsrOyAgICAgIC8vIGNvbGxlY3Rpb24gaWRcbiAgICAgIHRoYXQuX2wgPSB1bmRlZmluZWQ7IC8vIGxlYWsgc3RvcmUgZm9yIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RzXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgIH0pO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcbiAgICAgICAgdmFyIGRhdGEgPSBnZXRXZWFrKGtleSk7XG4gICAgICAgIGlmKGRhdGEgPT09IHRydWUpcmV0dXJuIHVuY2F1Z2h0RnJvemVuU3RvcmUodGhpcylbJ2RlbGV0ZSddKGtleSk7XG4gICAgICAgIHJldHVybiBkYXRhICYmICRoYXMoZGF0YSwgdGhpcy5faSkgJiYgZGVsZXRlIGRhdGFbdGhpcy5faV07XG4gICAgICB9LFxuICAgICAgLy8gMjMuMy4zLjQgV2Vha01hcC5wcm90b3R5cGUuaGFzKGtleSlcbiAgICAgIC8vIDIzLjQuMy40IFdlYWtTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcbiAgICAgICAgdmFyIGRhdGEgPSBnZXRXZWFrKGtleSk7XG4gICAgICAgIGlmKGRhdGEgPT09IHRydWUpcmV0dXJuIHVuY2F1Z2h0RnJvemVuU3RvcmUodGhpcykuaGFzKGtleSk7XG4gICAgICAgIHJldHVybiBkYXRhICYmICRoYXMoZGF0YSwgdGhpcy5faSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XG4gICAgdmFyIGRhdGEgPSBnZXRXZWFrKGFuT2JqZWN0KGtleSksIHRydWUpO1xuICAgIGlmKGRhdGEgPT09IHRydWUpdW5jYXVnaHRGcm96ZW5TdG9yZSh0aGF0KS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgZWxzZSBkYXRhW3RoYXQuX2ldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIHVmc3RvcmU6IHVuY2F1Z2h0RnJvemVuU3RvcmVcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCAgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgbWV0YSAgICAgICAgICAgPSByZXF1aXJlKCcuL19tZXRhJylcbiAgLCBmYWlscyAgICAgICAgICA9IHJlcXVpcmUoJy4vX2ZhaWxzJylcbiAgLCBoaWRlICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIHJlZGVmaW5lQWxsICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUtYWxsJylcbiAgLCBmb3JPZiAgICAgICAgICA9IHJlcXVpcmUoJy4vX2Zvci1vZicpXG4gICwgYW5JbnN0YW5jZSAgICAgPSByZXF1aXJlKCcuL19hbi1pbnN0YW5jZScpXG4gICwgaXNPYmplY3QgICAgICAgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIGRQICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZlxuICAsIGVhY2ggICAgICAgICAgID0gcmVxdWlyZSgnLi9fYXJyYXktbWV0aG9kcycpKDApXG4gICwgREVTQ1JJUFRPUlMgICAgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gZ2xvYmFsW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBpZighREVTQ1JJUFRPUlMgfHwgdHlwZW9mIEMgIT0gJ2Z1bmN0aW9uJyB8fCAhKElTX1dFQUsgfHwgcHJvdG8uZm9yRWFjaCAmJiAhZmFpbHMoZnVuY3Rpb24oKXtcbiAgICBuZXcgQygpLmVudHJpZXMoKS5uZXh0KCk7XG4gIH0pKSl7XG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcbiAgICBDID0gY29tbW9uLmdldENvbnN0cnVjdG9yKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpO1xuICAgIHJlZGVmaW5lQWxsKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgICBtZXRhLk5FRUQgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRhcmdldCwgaXRlcmFibGUpe1xuICAgICAgYW5JbnN0YW5jZSh0YXJnZXQsIEMsIE5BTUUsICdfYycpO1xuICAgICAgdGFyZ2V0Ll9jID0gbmV3IEJhc2U7XG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGFyZ2V0W0FEREVSXSwgdGFyZ2V0KTtcbiAgICB9KTtcbiAgICBlYWNoKCdhZGQsY2xlYXIsZGVsZXRlLGZvckVhY2gsZ2V0LGhhcyxzZXQsa2V5cyx2YWx1ZXMsZW50cmllcyx0b0pTT04nLnNwbGl0KCcsJyksZnVuY3Rpb24oS0VZKXtcbiAgICAgIHZhciBJU19BRERFUiA9IEtFWSA9PSAnYWRkJyB8fCBLRVkgPT0gJ3NldCc7XG4gICAgICBpZihLRVkgaW4gcHJvdG8gJiYgIShJU19XRUFLICYmIEtFWSA9PSAnY2xlYXInKSloaWRlKEMucHJvdG90eXBlLCBLRVksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgICBhbkluc3RhbmNlKHRoaXMsIEMsIEtFWSk7XG4gICAgICAgIGlmKCFJU19BRERFUiAmJiBJU19XRUFLICYmICFpc09iamVjdChhKSlyZXR1cm4gS0VZID09ICdnZXQnID8gdW5kZWZpbmVkIDogZmFsc2U7XG4gICAgICAgIHZhciByZXN1bHQgPSB0aGlzLl9jW0tFWV0oYSA9PT0gMCA/IDAgOiBhLCBiKTtcbiAgICAgICAgcmV0dXJuIElTX0FEREVSID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmKCdzaXplJyBpbiBwcm90bylkUChDLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB0aGlzLl9jLnNpemU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzZXRUb1N0cmluZ1RhZyhDLCBOQU1FKTtcblxuICBPW05BTUVdID0gQztcbiAgJGV4cG9ydCgkZXhwb3J0LkcgKyAkZXhwb3J0LlcgKyAkZXhwb3J0LkYsIE8pO1xuXG4gIGlmKCFJU19XRUFLKWNvbW1vbi5zZXRTdHJvbmcoQywgTkFNRSwgSVNfTUFQKTtcblxuICByZXR1cm4gQztcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMi4xLjUnfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsIi8vIFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHlcbm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gNzsgfX0pLmEgIT0gNztcbn0pOyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgZG9jdW1lbnQgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5kb2N1bWVudFxuICAvLyBpbiBvbGQgSUUgdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCdcbiAgLCBpcyA9IGlzT2JqZWN0KGRvY3VtZW50KSAmJiBpc09iamVjdChkb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTsiLCIvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXHJcbm1vZHVsZS5leHBvcnRzID0gKFxyXG4gICdjb25zdHJ1Y3RvcixoYXNPd25Qcm9wZXJ0eSxpc1Byb3RvdHlwZU9mLHByb3BlcnR5SXNFbnVtZXJhYmxlLHRvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnXHJcbikuc3BsaXQoJywnKTsiLCIvLyBhbGwgZW51bWVyYWJsZSBvYmplY3Qga2V5cywgaW5jbHVkZXMgc3ltYm9sc1xudmFyIGdldEtleXMgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpXG4gICwgZ09QUyAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJylcbiAgLCBwSUUgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHZhciByZXN1bHQgICAgID0gZ2V0S2V5cyhpdClcbiAgICAsIGdldFN5bWJvbHMgPSBnT1BTLmY7XG4gIGlmKGdldFN5bWJvbHMpe1xuICAgIHZhciBzeW1ib2xzID0gZ2V0U3ltYm9scyhpdClcbiAgICAgICwgaXNFbnVtICA9IHBJRS5mXG4gICAgICAsIGkgICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShzeW1ib2xzLmxlbmd0aCA+IGkpaWYoaXNFbnVtLmNhbGwoaXQsIGtleSA9IHN5bWJvbHNbaSsrXSkpcmVzdWx0LnB1c2goa2V5KTtcbiAgfSByZXR1cm4gcmVzdWx0O1xufTsiLCJ2YXIgZ2xvYmFsICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGhpZGUgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xuXG52YXIgJGV4cG9ydCA9IGZ1bmN0aW9uKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBJU19GT1JDRUQgPSB0eXBlICYgJGV4cG9ydC5GXG4gICAgLCBJU19HTE9CQUwgPSB0eXBlICYgJGV4cG9ydC5HXG4gICAgLCBJU19TVEFUSUMgPSB0eXBlICYgJGV4cG9ydC5TXG4gICAgLCBJU19QUk9UTyAgPSB0eXBlICYgJGV4cG9ydC5QXG4gICAgLCBJU19CSU5EICAgPSB0eXBlICYgJGV4cG9ydC5CXG4gICAgLCBJU19XUkFQICAgPSB0eXBlICYgJGV4cG9ydC5XXG4gICAgLCBleHBvcnRzICAgPSBJU19HTE9CQUwgPyBjb3JlIDogY29yZVtuYW1lXSB8fCAoY29yZVtuYW1lXSA9IHt9KVxuICAgICwgZXhwUHJvdG8gID0gZXhwb3J0c1tQUk9UT1RZUEVdXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBrZXksIG93biwgb3V0O1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIHRhcmdldFtrZXldICE9PSB1bmRlZmluZWQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBleHBvcnRzW2tleV0gPSBJU19HTE9CQUwgJiYgdHlwZW9mIHRhcmdldFtrZXldICE9ICdmdW5jdGlvbicgPyBzb3VyY2Vba2V5XVxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgOiBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbClcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIDogSVNfV1JBUCAmJiB0YXJnZXRba2V5XSA9PSBvdXQgPyAoZnVuY3Rpb24oQyl7XG4gICAgICB2YXIgRiA9IGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgICBpZih0aGlzIGluc3RhbmNlb2YgQyl7XG4gICAgICAgICAgc3dpdGNoKGFyZ3VtZW50cy5sZW5ndGgpe1xuICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gbmV3IEM7XG4gICAgICAgICAgICBjYXNlIDE6IHJldHVybiBuZXcgQyhhKTtcbiAgICAgICAgICAgIGNhc2UgMjogcmV0dXJuIG5ldyBDKGEsIGIpO1xuICAgICAgICAgIH0gcmV0dXJuIG5ldyBDKGEsIGIsIGMpO1xuICAgICAgICB9IHJldHVybiBDLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5tZXRob2RzLiVOQU1FJVxuICAgIGlmKElTX1BST1RPKXtcbiAgICAgIChleHBvcnRzLnZpcnR1YWwgfHwgKGV4cG9ydHMudmlydHVhbCA9IHt9KSlba2V5XSA9IG91dDtcbiAgICAgIC8vIGV4cG9ydCBwcm90byBtZXRob2RzIHRvIGNvcmUuJUNPTlNUUlVDVE9SJS5wcm90b3R5cGUuJU5BTUUlXG4gICAgICBpZih0eXBlICYgJGV4cG9ydC5SICYmIGV4cFByb3RvICYmICFleHBQcm90b1trZXldKWhpZGUoZXhwUHJvdG8sIGtleSwgb3V0KTtcbiAgICB9XG4gIH1cbn07XG4vLyB0eXBlIGJpdG1hcFxuJGV4cG9ydC5GID0gMTsgICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgIC8vIHN0YXRpY1xuJGV4cG9ydC5QID0gODsgICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7ICAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgIC8vIHdyYXBcbiRleHBvcnQuVSA9IDY0OyAgLy8gc2FmZVxuJGV4cG9ydC5SID0gMTI4OyAvLyByZWFsIHByb3RvIG1ldGhvZCBmb3IgYGxpYnJhcnlgIFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsInZhciBjdHggICAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgY2FsbCAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyLWNhbGwnKVxuICAsIGlzQXJyYXlJdGVyID0gcmVxdWlyZSgnLi9faXMtYXJyYXktaXRlcicpXG4gICwgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIHRvTGVuZ3RoICAgID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCBnZXRJdGVyRm4gICA9IHJlcXVpcmUoJy4vY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCwgSVRFUkFUT1Ipe1xuICB2YXIgaXRlckZuID0gSVRFUkFUT1IgPyBmdW5jdGlvbigpeyByZXR1cm4gaXRlcmFibGU7IH0gOiBnZXRJdGVyRm4oaXRlcmFibGUpXG4gICAgLCBmICAgICAgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGxlbmd0aCwgc3RlcCwgaXRlcmF0b3I7XG4gIGlmKHR5cGVvZiBpdGVyRm4gIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXRlcmFibGUgKyAnIGlzIG5vdCBpdGVyYWJsZSEnKTtcbiAgLy8gZmFzdCBjYXNlIGZvciBhcnJheXMgd2l0aCBkZWZhdWx0IGl0ZXJhdG9yXG4gIGlmKGlzQXJyYXlJdGVyKGl0ZXJGbikpZm9yKGxlbmd0aCA9IHRvTGVuZ3RoKGl0ZXJhYmxlLmxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICBlbnRyaWVzID8gZihhbk9iamVjdChzdGVwID0gaXRlcmFibGVbaW5kZXhdKVswXSwgc3RlcFsxXSkgOiBmKGl0ZXJhYmxlW2luZGV4XSk7XG4gIH0gZWxzZSBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChpdGVyYWJsZSk7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgKXtcbiAgICBjYWxsKGl0ZXJhdG9yLCBmLCBzdGVwLnZhbHVlLCBlbnRyaWVzKTtcbiAgfVxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxudmFyIGdsb2JhbCA9IG1vZHVsZS5leHBvcnRzID0gdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyAmJiB3aW5kb3cuTWF0aCA9PSBNYXRoXG4gID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZi5NYXRoID09IE1hdGggPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbmlmKHR5cGVvZiBfX2cgPT0gJ251bWJlcicpX19nID0gZ2xvYmFsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07IiwidmFyIGRQICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50OyIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcclxuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XHJcbn0pOyIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdCgneicpLnByb3BlcnR5SXNFbnVtZXJhYmxlKDApID8gT2JqZWN0IDogZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gY29mKGl0KSA9PSAnU3RyaW5nJyA/IGl0LnNwbGl0KCcnKSA6IE9iamVjdChpdCk7XG59OyIsIi8vIGNoZWNrIG9uIGRlZmF1bHQgQXJyYXkgaXRlcmF0b3JcbnZhciBJdGVyYXRvcnMgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCBJVEVSQVRPUiAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ICE9PSB1bmRlZmluZWQgJiYgKEl0ZXJhdG9ycy5BcnJheSA9PT0gaXQgfHwgQXJyYXlQcm90b1tJVEVSQVRPUl0gPT09IGl0KTtcbn07IiwiLy8gNy4yLjIgSXNBcnJheShhcmd1bWVudClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5KGFyZyl7XG4gIHJldHVybiBjb2YoYXJnKSA9PSAnQXJyYXknO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2goZSl7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZihyZXQgIT09IHVuZGVmaW5lZClhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNyZWF0ZSAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi9fbGlicmFyeScpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIEl0ZXJhdG9ycyAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY3JlYXRlJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4vX29iamVjdC1ncG8nKVxuICAsIElURVJBVE9SICAgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBCVUdHWSAgICAgICAgICA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKSAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gICwgRkZfSVRFUkFUT1IgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKXtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgaWYoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHICAgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTXG4gICAgLCBWQUxVRVNfQlVHID0gZmFsc2VcbiAgICAsIHByb3RvICAgICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgJG5hdGl2ZSAgICA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgJGRlZmF1bHQgICA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpXG4gICAgLCAkZW50cmllcyAgID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZFxuICAgICwgJGFueU5hdGl2ZSA9IE5BTUUgPT0gJ0FycmF5JyA/IHByb3RvLmVudHJpZXMgfHwgJG5hdGl2ZSA6ICRuYXRpdmVcbiAgICAsIG1ldGhvZHMsIGtleSwgSXRlcmF0b3JQcm90b3R5cGU7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoJGFueU5hdGl2ZSl7XG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZigkYW55TmF0aXZlLmNhbGwobmV3IEJhc2UpKTtcbiAgICBpZihJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSl7XG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAgIC8vIGZpeCBmb3Igc29tZSBvbGQgZW5naW5lc1xuICAgICAgaWYoIUxJQlJBUlkgJiYgIWhhcyhJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZihERUZfVkFMVUVTICYmICRuYXRpdmUgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpe1xuICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCghTElCUkFSWSB8fCBGT1JDRUQpICYmIChCVUdHWSB8fCBWQUxVRVNfQlVHIHx8ICFwcm90b1tJVEVSQVRPUl0pKXtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9IHJldHVyblRoaXM7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6ICBERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICRlbnRyaWVzXG4gICAgfTtcbiAgICBpZihGT1JDRUQpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSlyZWRlZmluZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIChCVUdHWSB8fCBWQUxVRVNfQlVHKSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbiAgcmV0dXJuIG1ldGhvZHM7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9uZSwgdmFsdWUpe1xuICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCJ2YXIgZ2V0S2V5cyAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKVxuICAsIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBlbCl7XG4gIHZhciBPICAgICAgPSB0b0lPYmplY3Qob2JqZWN0KVxuICAgICwga2V5cyAgID0gZ2V0S2V5cyhPKVxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobGVuZ3RoID4gaW5kZXgpaWYoT1trZXkgPSBrZXlzW2luZGV4KytdXSA9PT0gZWwpcmV0dXJuIGtleTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB0cnVlOyIsInZhciBNRVRBICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJylcbiAgLCBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgaGFzICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIHNldERlc2MgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZlxuICAsIGlkICAgICAgID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gaXNFeHRlbnNpYmxlKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7fSkpO1xufSk7XG52YXIgc2V0TWV0YSA9IGZ1bmN0aW9uKGl0KXtcbiAgc2V0RGVzYyhpdCwgTUVUQSwge3ZhbHVlOiB7XG4gICAgaTogJ08nICsgKytpZCwgLy8gb2JqZWN0IElEXG4gICAgdzoge30gICAgICAgICAgLy8gd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfX0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24oaXQsIGNyZWF0ZSl7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZighaGFzKGl0LCBNRVRBKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICBpZighaGFzKGl0LCBNRVRBKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmKCFjcmVhdGUpcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbihpdCl7XG4gIGlmKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSlzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogICAgICBNRVRBLFxuICBORUVEOiAgICAgZmFsc2UsXG4gIGZhc3RLZXk6ICBmYXN0S2V5LFxuICBnZXRXZWFrOiAgZ2V0V2VhayxcbiAgb25GcmVlemU6IG9uRnJlZXplXG59OyIsIid1c2Ugc3RyaWN0Jztcbi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcbnZhciBnZXRLZXlzICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJylcbiAgLCBnT1BTICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BzJylcbiAgLCBwSUUgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKVxuICAsIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCBJT2JqZWN0ICA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsICRhc3NpZ24gID0gT2JqZWN0LmFzc2lnbjtcblxuLy8gc2hvdWxkIHdvcmsgd2l0aCBzeW1ib2xzIGFuZCBzaG91bGQgaGF2ZSBkZXRlcm1pbmlzdGljIHByb3BlcnR5IG9yZGVyIChWOCBidWcpXG5tb2R1bGUuZXhwb3J0cyA9ICEkYXNzaWduIHx8IHJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcbiAgdmFyIEEgPSB7fVxuICAgICwgQiA9IHt9XG4gICAgLCBTID0gU3ltYm9sKClcbiAgICAsIEsgPSAnYWJjZGVmZ2hpamtsbW5vcHFyc3QnO1xuICBBW1NdID0gNztcbiAgSy5zcGxpdCgnJykuZm9yRWFjaChmdW5jdGlvbihrKXsgQltrXSA9IGs7IH0pO1xuICByZXR1cm4gJGFzc2lnbih7fSwgQSlbU10gIT0gNyB8fCBPYmplY3Qua2V5cygkYXNzaWduKHt9LCBCKSkuam9pbignJykgIT0gSztcbn0pID8gZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICB2YXIgVCAgICAgPSB0b09iamVjdCh0YXJnZXQpXG4gICAgLCBhTGVuICA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGluZGV4ID0gMVxuICAgICwgZ2V0U3ltYm9scyA9IGdPUFMuZlxuICAgICwgaXNFbnVtICAgICA9IHBJRS5mO1xuICB3aGlsZShhTGVuID4gaW5kZXgpe1xuICAgIHZhciBTICAgICAgPSBJT2JqZWN0KGFyZ3VtZW50c1tpbmRleCsrXSlcbiAgICAgICwga2V5cyAgID0gZ2V0U3ltYm9scyA/IGdldEtleXMoUykuY29uY2F0KGdldFN5bWJvbHMoUykpIDogZ2V0S2V5cyhTKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBqICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShsZW5ndGggPiBqKWlmKGlzRW51bS5jYWxsKFMsIGtleSA9IGtleXNbaisrXSkpVFtrZXldID0gU1trZXldO1xuICB9IHJldHVybiBUO1xufSA6ICRhc3NpZ247IiwiLy8gMTkuMS4yLjIgLyAxNS4yLjMuNSBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXHJcbnZhciBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXHJcbiAgLCBkUHMgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcHMnKVxyXG4gICwgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJylcclxuICAsIElFX1BST1RPICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpXHJcbiAgLCBFbXB0eSAgICAgICA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH1cclxuICAsIFBST1RPVFlQRSAgID0gJ3Byb3RvdHlwZSc7XHJcblxyXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXHJcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24oKXtcclxuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xyXG4gIHZhciBpZnJhbWUgPSByZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2lmcmFtZScpXHJcbiAgICAsIGkgICAgICA9IGVudW1CdWdLZXlzLmxlbmd0aFxyXG4gICAgLCBndCAgICAgPSAnPidcclxuICAgICwgaWZyYW1lRG9jdW1lbnQ7XHJcbiAgaWZyYW1lLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgcmVxdWlyZSgnLi9faHRtbCcpLmFwcGVuZENoaWxkKGlmcmFtZSk7XHJcbiAgaWZyYW1lLnNyYyA9ICdqYXZhc2NyaXB0Oic7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2NyaXB0LXVybFxyXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XHJcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xyXG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XHJcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xyXG4gIGlmcmFtZURvY3VtZW50LndyaXRlKCc8c2NyaXB0PmRvY3VtZW50LkY9T2JqZWN0PC9zY3JpcHQnICsgZ3QpO1xyXG4gIGlmcmFtZURvY3VtZW50LmNsb3NlKCk7XHJcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XHJcbiAgd2hpbGUoaS0tKWRlbGV0ZSBjcmVhdGVEaWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbaV1dO1xyXG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpe1xyXG4gIHZhciByZXN1bHQ7XHJcbiAgaWYoTyAhPT0gbnVsbCl7XHJcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gYW5PYmplY3QoTyk7XHJcbiAgICByZXN1bHQgPSBuZXcgRW1wdHk7XHJcbiAgICBFbXB0eVtQUk9UT1RZUEVdID0gbnVsbDtcclxuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcclxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xyXG4gIH0gZWxzZSByZXN1bHQgPSBjcmVhdGVEaWN0KCk7XHJcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRQcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xyXG59OyIsInZhciBhbk9iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGRQICAgICAgICAgICAgID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyl7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgIHJldHVybiBkUChPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICBpZignZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCEnKTtcbiAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKU9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07IiwidmFyIGRQICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcclxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcclxuICAsIGdldEtleXMgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKXtcclxuICBhbk9iamVjdChPKTtcclxuICB2YXIga2V5cyAgID0gZ2V0S2V5cyhQcm9wZXJ0aWVzKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpID0gMFxyXG4gICAgLCBQO1xyXG4gIHdoaWxlKGxlbmd0aCA+IGkpZFAuZihPLCBQID0ga2V5c1tpKytdLCBQcm9wZXJ0aWVzW1BdKTtcclxuICByZXR1cm4gTztcclxufTsiLCJ2YXIgcElFICAgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJylcclxuICAsIGNyZWF0ZURlc2MgICAgID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpXHJcbiAgLCB0b0lPYmplY3QgICAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxyXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxyXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxyXG4gICwgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuL19pZTgtZG9tLWRlZmluZScpXHJcbiAgLCBnT1BEICAgICAgICAgICA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XHJcblxyXG5leHBvcnRzLmYgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZ09QRCA6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKXtcclxuICBPID0gdG9JT2JqZWN0KE8pO1xyXG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcclxuICBpZihJRThfRE9NX0RFRklORSl0cnkge1xyXG4gICAgcmV0dXJuIGdPUEQoTywgUCk7XHJcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gIGlmKGhhcyhPLCBQKSlyZXR1cm4gY3JlYXRlRGVzYyghcElFLmYuY2FsbChPLCBQKSwgT1tQXSk7XHJcbn07IiwiLy8gZmFsbGJhY2sgZm9yIElFMTEgYnVnZ3kgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgd2l0aCBpZnJhbWUgYW5kIHdpbmRvd1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIGdPUE4gICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZlxuICAsIHRvU3RyaW5nICA9IHt9LnRvU3RyaW5nO1xuXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xuICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbmRvdykgOiBbXTtcblxudmFyIGdldFdpbmRvd05hbWVzID0gZnVuY3Rpb24oaXQpe1xuICB0cnkge1xuICAgIHJldHVybiBnT1BOLmYoaXQpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59OyIsIi8vIDE5LjEuMi43IC8gMTUuMi4zLjQgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcclxudmFyICRrZXlzICAgICAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpXHJcbiAgLCBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xyXG5cclxuZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgfHwgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhPKXtcclxuICByZXR1cm4gJGtleXMoTywgaGlkZGVuS2V5cyk7XHJcbn07IiwiZXhwb3J0cy5mID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9sczsiLCIvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxyXG52YXIgaGFzICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxyXG4gICwgdG9PYmplY3QgICAgPSByZXF1aXJlKCcuL190by1vYmplY3QnKVxyXG4gICwgSUVfUFJPVE8gICAgPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJylcclxuICAsIE9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uKE8pe1xyXG4gIE8gPSB0b09iamVjdChPKTtcclxuICBpZihoYXMoTywgSUVfUFJPVE8pKXJldHVybiBPW0lFX1BST1RPXTtcclxuICBpZih0eXBlb2YgTy5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKXtcclxuICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcclxuICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xyXG59OyIsInZhciBoYXMgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxyXG4gICwgdG9JT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXHJcbiAgLCBhcnJheUluZGV4T2YgPSByZXF1aXJlKCcuL19hcnJheS1pbmNsdWRlcycpKGZhbHNlKVxyXG4gICwgSUVfUFJPVE8gICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIG5hbWVzKXtcclxuICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KG9iamVjdClcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCByZXN1bHQgPSBbXVxyXG4gICAgLCBrZXk7XHJcbiAgZm9yKGtleSBpbiBPKWlmKGtleSAhPSBJRV9QUk9UTyloYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xyXG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcclxuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSl7XHJcbiAgICB+YXJyYXlJbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0O1xyXG59OyIsIi8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxyXG52YXIgJGtleXMgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cy1pbnRlcm5hbCcpXHJcbiAgLCBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhPKXtcclxuICByZXR1cm4gJGtleXMoTywgZW51bUJ1Z0tleXMpO1xyXG59OyIsImV4cG9ydHMuZiA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlOyIsIi8vIG1vc3QgT2JqZWN0IG1ldGhvZHMgYnkgRVM2IHNob3VsZCBhY2NlcHQgcHJpbWl0aXZlc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBmYWlscyAgID0gcmVxdWlyZSgnLi9fZmFpbHMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZLCBleGVjKXtcbiAgdmFyIGZuICA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZXhwID0ge307XG4gIGV4cFtLRVldID0gZXhlYyhmbik7XG4gICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogZmFpbHMoZnVuY3Rpb24oKXsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59OyIsInZhciBoaWRlID0gcmVxdWlyZSgnLi9faGlkZScpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQsIHNyYywgc2FmZSl7XG4gIGZvcih2YXIga2V5IGluIHNyYyl7XG4gICAgaWYoc2FmZSAmJiB0YXJnZXRba2V5XSl0YXJnZXRba2V5XSA9IHNyY1trZXldO1xuICAgIGVsc2UgaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xuICB9IHJldHVybiB0YXJnZXQ7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faGlkZScpOyIsIi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uKE8sIHByb3RvKXtcbiAgYW5PYmplY3QoTyk7XG4gIGlmKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpdGhyb3cgVHlwZUVycm9yKHByb3RvICsgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gPyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgZnVuY3Rpb24odGVzdCwgYnVnZ3ksIHNldCl7XG4gICAgICB0cnkge1xuICAgICAgICBzZXQgPSByZXF1aXJlKCcuL19jdHgnKShGdW5jdGlvbi5jYWxsLCByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmYoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgIHNldCh0ZXN0LCBbXSk7XG4gICAgICAgIGJ1Z2d5ID0gISh0ZXN0IGluc3RhbmNlb2YgQXJyYXkpO1xuICAgICAgfSBjYXRjaChlKXsgYnVnZ3kgPSB0cnVlOyB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xuICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgIGlmKGJ1Z2d5KU8uX19wcm90b19fID0gcHJvdG87XG4gICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgcmV0dXJuIE87XG4gICAgICB9O1xuICAgIH0oe30sIGZhbHNlKSA6IHVuZGVmaW5lZCksXG4gIGNoZWNrOiBjaGVja1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgZFAgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKVxuICAsIFNQRUNJRVMgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVkpe1xuICB2YXIgQyA9IHR5cGVvZiBjb3JlW0tFWV0gPT0gJ2Z1bmN0aW9uJyA/IGNvcmVbS0VZXSA6IGdsb2JhbFtLRVldO1xuICBpZihERVNDUklQVE9SUyAmJiBDICYmICFDW1NQRUNJRVNdKWRQLmYoQywgU1BFQ0lFUywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9XG4gIH0pO1xufTsiLCJ2YXIgZGVmID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZlxuICAsIGhhcyA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIHRhZywgc3RhdCl7XG4gIGlmKGl0ICYmICFoYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpZGVmKGl0LCBUQUcsIHtjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiB0YWd9KTtcbn07IiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCdrZXlzJylcclxuICAsIHVpZCAgICA9IHJlcXVpcmUoJy4vX3VpZCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XHJcbiAgcmV0dXJuIHNoYXJlZFtrZXldIHx8IChzaGFyZWRba2V5XSA9IHVpZChrZXkpKTtcclxufTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJ1xuICAsIHN0b3JlICA9IGdsb2JhbFtTSEFSRURdIHx8IChnbG9iYWxbU0hBUkVEXSA9IHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB7fSk7XG59OyIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xuICByZXR1cm4gZnVuY3Rpb24odGhhdCwgcG9zKXtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gdG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59OyIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtYXggICAgICAgPSBNYXRoLm1heFxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKXtcbiAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbn07IiwiLy8gNy4xLjQgVG9JbnRlZ2VyXG52YXIgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3I7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG59OyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuL19pb2JqZWN0JylcbiAgLCBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwiLy8gNy4xLjE1IFRvTGVuZ3RoXG52YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbn07IiwiLy8gNy4xLjEzIFRvT2JqZWN0KGFyZ3VtZW50KVxudmFyIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIE9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xIFRvUHJpbWl0aXZlKGlucHV0IFssIFByZWZlcnJlZFR5cGVdKVxudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG4vLyBpbnN0ZWFkIG9mIHRoZSBFUzYgc3BlYyB2ZXJzaW9uLCB3ZSBkaWRuJ3QgaW1wbGVtZW50IEBAdG9QcmltaXRpdmUgY2FzZVxuLy8gYW5kIHRoZSBzZWNvbmQgYXJndW1lbnQgLSBmbGFnIC0gcHJlZmVycmVkIHR5cGUgaXMgYSBzdHJpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIFMpe1xuICBpZighaXNPYmplY3QoaXQpKXJldHVybiBpdDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmKFMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYodHlwZW9mIChmbiA9IGl0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZighUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59OyIsInZhciBpZCA9IDBcbiAgLCBweCA9IE1hdGgucmFuZG9tKCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK2lkICsgcHgpLnRvU3RyaW5nKDM2KSk7XG59OyIsInZhciBzdG9yZSAgICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ3drcycpXG4gICwgdWlkICAgICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpXG4gICwgU3ltYm9sICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLlN5bWJvbFxuICAsIFVTRV9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09ICdmdW5jdGlvbic7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBVU0VfU1lNQk9MICYmIFN5bWJvbFtuYW1lXSB8fCAoVVNFX1NZTUJPTCA/IFN5bWJvbCA6IHVpZCkoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTsiLCJ2YXIgY2xhc3NvZiAgID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fY29yZScpLmdldEl0ZXJhdG9yTWV0aG9kID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCAhPSB1bmRlZmluZWQpcmV0dXJuIGl0W0lURVJBVE9SXVxuICAgIHx8IGl0WydAQGl0ZXJhdG9yJ11cbiAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xufTsiLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIGdldCAgICAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fY29yZScpLmdldEl0ZXJhdG9yID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgaXRlckZuID0gZ2V0KGl0KTtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICByZXR1cm4gYW5PYmplY3QoaXRlckZuLmNhbGwoaXQpKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuL19hZGQtdG8tdW5zY29wYWJsZXMnKVxuICAsIHN0ZXAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKVxuICAsIEl0ZXJhdG9ycyAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICB0aGlzLl90ID0gdG9JT2JqZWN0KGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4gIHRoaXMuX2sgPSBraW5kOyAgICAgICAgICAgICAgICAvLyBraW5kXG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGtpbmQgID0gdGhpcy5fa1xuICAgICwgaW5kZXggPSB0aGlzLl9pKys7XG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcbiAgICB0aGlzLl90ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcbiAgcmV0dXJuIHN0ZXAoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xuXG5hZGRUb1Vuc2NvcGFibGVzKCdrZXlzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCd2YWx1ZXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ2VudHJpZXMnKTsiLCJ2YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXHJcbi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxyXG4kZXhwb3J0KCRleHBvcnQuUywgJ09iamVjdCcsIHtjcmVhdGU6IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKX0pOyIsInZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XHJcbi8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXHJcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyksICdPYmplY3QnLCB7ZGVmaW5lUHJvcGVydHk6IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZ9KTsiLCIvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG52YXIgdG9JT2JqZWN0ICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmY7XG5cbnJlcXVpcmUoJy4vX29iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgICByZXR1cm4gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0b0lPYmplY3QoaXQpLCBrZXkpO1xuICB9O1xufSk7IiwiLy8gMTkuMS4yLjkgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXG52YXIgdG9PYmplY3QgICAgICAgID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCAkZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJyk7XG5cbnJlcXVpcmUoJy4vX29iamVjdC1zYXAnKSgnZ2V0UHJvdG90eXBlT2YnLCBmdW5jdGlvbigpe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xuICAgIHJldHVybiAkZ2V0UHJvdG90eXBlT2YodG9PYmplY3QoaXQpKTtcbiAgfTtcbn0pOyIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7c2V0UHJvdG90eXBlT2Y6IHJlcXVpcmUoJy4vX3NldC1wcm90bycpLnNldH0pOyIsIiIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXN0cm9uZycpO1xuXG4vLyAyMy4yIFNldCBPYmplY3RzXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvbGxlY3Rpb24nKSgnU2V0JywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIFNldCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTsgfTtcbn0sIHtcbiAgLy8gMjMuMi4zLjEgU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRhdCAgPSByZXF1aXJlKCcuL19zdHJpbmctYXQnKSh0cnVlKTtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShTdHJpbmcsICdTdHJpbmcnLCBmdW5jdGlvbihpdGVyYXRlZCl7XG4gIHRoaXMuX3QgPSBTdHJpbmcoaXRlcmF0ZWQpOyAvLyB0YXJnZXRcbiAgdGhpcy5faSA9IDA7ICAgICAgICAgICAgICAgIC8vIG5leHQgaW5kZXhcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGluZGV4ID0gdGhpcy5faVxuICAgICwgcG9pbnQ7XG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiB7dmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZX07XG4gIHBvaW50ID0gJGF0KE8sIGluZGV4KTtcbiAgdGhpcy5faSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiB7dmFsdWU6IHBvaW50LCBkb25lOiBmYWxzZX07XG59KTsiLCIndXNlIHN0cmljdCc7XG4vLyBFQ01BU2NyaXB0IDYgc3ltYm9scyBzaGltXG52YXIgZ2xvYmFsICAgICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIERFU0NSSVBUT1JTICAgID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCByZWRlZmluZSAgICAgICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJylcbiAgLCBNRVRBICAgICAgICAgICA9IHJlcXVpcmUoJy4vX21ldGEnKS5LRVlcbiAgLCAkZmFpbHMgICAgICAgICA9IHJlcXVpcmUoJy4vX2ZhaWxzJylcbiAgLCBzaGFyZWQgICAgICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgdWlkICAgICAgICAgICAgPSByZXF1aXJlKCcuL191aWQnKVxuICAsIHdrcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fd2tzJylcbiAgLCBrZXlPZiAgICAgICAgICA9IHJlcXVpcmUoJy4vX2tleW9mJylcbiAgLCBlbnVtS2V5cyAgICAgICA9IHJlcXVpcmUoJy4vX2VudW0ta2V5cycpXG4gICwgaXNBcnJheSAgICAgICAgPSByZXF1aXJlKCcuL19pcy1hcnJheScpXG4gICwgYW5PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIHRvSU9iamVjdCAgICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgdG9QcmltaXRpdmUgICAgPSByZXF1aXJlKCcuL190by1wcmltaXRpdmUnKVxuICAsIGNyZWF0ZURlc2MgICAgID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpXG4gICwgX2NyZWF0ZSAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJylcbiAgLCBnT1BORXh0ICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BuLWV4dCcpXG4gICwgJEdPUEQgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpXG4gICwgJERQICAgICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIGdPUEQgICAgICAgICAgID0gJEdPUEQuZlxuICAsIGRQICAgICAgICAgICAgID0gJERQLmZcbiAgLCBnT1BOICAgICAgICAgICA9IGdPUE5FeHQuZlxuICAsICRTeW1ib2wgICAgICAgID0gZ2xvYmFsLlN5bWJvbFxuICAsICRKU09OICAgICAgICAgID0gZ2xvYmFsLkpTT05cbiAgLCBfc3RyaW5naWZ5ICAgICA9ICRKU09OICYmICRKU09OLnN0cmluZ2lmeVxuICAsIHNldHRlciAgICAgICAgID0gZmFsc2VcbiAgLCBISURERU4gICAgICAgICA9IHdrcygnX2hpZGRlbicpXG4gICwgaXNFbnVtICAgICAgICAgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZVxuICAsIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKVxuICAsIEFsbFN5bWJvbHMgICAgID0gc2hhcmVkKCdzeW1ib2xzJylcbiAgLCBPYmplY3RQcm90byAgICA9IE9iamVjdC5wcm90b3R5cGVcbiAgLCBVU0VfTkFUSVZFICAgICA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbidcbiAgLCBRT2JqZWN0ICAgICAgICA9IGdsb2JhbC5RT2JqZWN0O1xuXG4vLyBmYWxsYmFjayBmb3Igb2xkIEFuZHJvaWQsIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD02ODdcbnZhciBzZXRTeW1ib2xEZXNjID0gREVTQ1JJUFRPUlMgJiYgJGZhaWxzKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiBkUCh0aGlzLCAnYScsIHt2YWx1ZTogN30pLmE7IH1cbiAgfSkpLmEgIT0gNztcbn0pID8gZnVuY3Rpb24oaXQsIGtleSwgRCl7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZihwcm90b0Rlc2MpZGVsZXRlIE9iamVjdFByb3RvW2tleV07XG4gIGRQKGl0LCBrZXksIEQpO1xuICBpZihwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKWRQKE9iamVjdFByb3RvLCBrZXksIHByb3RvRGVzYyk7XG59IDogZFA7XG5cbnZhciB3cmFwID0gZnVuY3Rpb24odGFnKXtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbC5wcm90b3R5cGUpO1xuICBzeW0uX2sgPSB0YWc7XG4gIERFU0NSSVBUT1JTICYmIHNldHRlciAmJiBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBpZihoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKXRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzeW07XG59O1xuXG52YXIgaXNTeW1ib2wgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCc7XG59O1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCl7XG4gIGFuT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgYW5PYmplY3QoRCk7XG4gIGlmKGhhcyhBbGxTeW1ib2xzLCBrZXkpKXtcbiAgICBpZighRC5lbnVtZXJhYmxlKXtcbiAgICAgIGlmKCFoYXMoaXQsIEhJRERFTikpZFAoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSlpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSBfY3JlYXRlKEQsIHtlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKX0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApe1xuICBhbk9iamVjdChpdCk7XG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvSU9iamVjdChQKSlcbiAgICAsIGkgICAgPSAwXG4gICAgLCBsID0ga2V5cy5sZW5ndGhcbiAgICAsIGtleTtcbiAgd2hpbGUobCA+IGkpJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCl7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyBfY3JlYXRlKGl0KSA6ICRkZWZpbmVQcm9wZXJ0aWVzKF9jcmVhdGUoaXQpLCBQKTtcbn07XG52YXIgJHByb3BlcnR5SXNFbnVtZXJhYmxlID0gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KXtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICB2YXIgRCA9IGdPUEQoaXQgPSB0b0lPYmplY3QoaXQpLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKUQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ09QTih0b0lPYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZighaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4gJiYga2V5ICE9IE1FVEEpcmVzdWx0LnB1c2goa2V5KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCl7XG4gIHZhciBuYW1lcyAgPSBnT1BOKHRvSU9iamVjdChpdCkpXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgaSAgICAgID0gMFxuICAgICwga2V5O1xuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKGhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSlyZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciAkc3RyaW5naWZ5ID0gZnVuY3Rpb24gc3RyaW5naWZ5KGl0KXtcbiAgaWYoaXQgPT09IHVuZGVmaW5lZCB8fCBpc1N5bWJvbChpdCkpcmV0dXJuOyAvLyBJRTggcmV0dXJucyBzdHJpbmcgb24gdW5kZWZpbmVkXG4gIHZhciBhcmdzID0gW2l0XVxuICAgICwgaSAgICA9IDFcbiAgICAsIHJlcGxhY2VyLCAkcmVwbGFjZXI7XG4gIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gIHJlcGxhY2VyID0gYXJnc1sxXTtcbiAgaWYodHlwZW9mIHJlcGxhY2VyID09ICdmdW5jdGlvbicpJHJlcGxhY2VyID0gcmVwbGFjZXI7XG4gIGlmKCRyZXBsYWNlciB8fCAhaXNBcnJheShyZXBsYWNlcikpcmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICBpZigkcmVwbGFjZXIpdmFsdWUgPSAkcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICBpZighaXNTeW1ib2wodmFsdWUpKXJldHVybiB2YWx1ZTtcbiAgfTtcbiAgYXJnc1sxXSA9IHJlcGxhY2VyO1xuICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG59O1xudmFyIEJVR0dZX0pTT04gPSAkZmFpbHMoZnVuY3Rpb24oKXtcbiAgdmFyIFMgPSAkU3ltYm9sKCk7XG4gIC8vIE1TIEVkZ2UgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIHt9XG4gIC8vIFdlYktpdCBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMgbnVsbFxuICAvLyBWOCB0aHJvd3Mgb24gYm94ZWQgc3ltYm9sc1xuICByZXR1cm4gX3N0cmluZ2lmeShbU10pICE9ICdbbnVsbF0nIHx8IF9zdHJpbmdpZnkoe2E6IFN9KSAhPSAne30nIHx8IF9zdHJpbmdpZnkoT2JqZWN0KFMpKSAhPSAne30nO1xufSk7XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYoIVVTRV9OQVRJVkUpe1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCl7XG4gICAgaWYoaXNTeW1ib2wodGhpcykpdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3InKTtcbiAgICByZXR1cm4gd3JhcCh1aWQoYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuIHRoaXMuX2s7XG4gIH0pO1xuXG4gIGlzU3ltYm9sID0gZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdCBpbnN0YW5jZW9mICRTeW1ib2w7XG4gIH07XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mICAgPSAkZGVmaW5lUHJvcGVydHk7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZiA9IGdPUE5FeHQuZiA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICByZXF1aXJlKCcuL19vYmplY3QtcGllJykuZiAgPSAkcHJvcGVydHlJc0VudW1lcmFibGVcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKS5mID0gJGdldE93blByb3BlcnR5U3ltYm9scztcblxuICBpZihERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKXtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7U3ltYm9sOiAkU3ltYm9sfSk7XG5cbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxuLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxuLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcbi8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXG4vLyAxOS40LjIuOSBTeW1ib2wuc2VhcmNoXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcbi8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcbi8vIDE5LjQuMi4xMiBTeW1ib2wudG9QcmltaXRpdmVcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcbi8vIDE5LjQuMi4xNCBTeW1ib2wudW5zY29wYWJsZXNcbmZvcih2YXIgc3ltYm9scyA9IChcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBpID0gMDsgc3ltYm9scy5sZW5ndGggPiBpOyApe1xuICB2YXIga2V5ICAgICA9IHN5bWJvbHNbaSsrXVxuICAgICwgV3JhcHBlciA9IGNvcmUuU3ltYm9sXG4gICAgLCBzeW0gICAgID0gd2tzKGtleSk7XG4gIGlmKCEoa2V5IGluIFdyYXBwZXIpKWRQKFdyYXBwZXIsIGtleSwge3ZhbHVlOiBVU0VfTkFUSVZFID8gc3ltIDogd3JhcChzeW0pfSk7XG59O1xuXG4vLyBEb24ndCB1c2Ugc2V0dGVycyBpbiBRdCBTY3JpcHQsIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8xNzNcbmlmKCFRT2JqZWN0IHx8ICFRT2JqZWN0LnByb3RvdHlwZSB8fCAhUU9iamVjdC5wcm90b3R5cGUuZmluZENoaWxkKXNldHRlciA9IHRydWU7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdTeW1ib2wnLCB7XG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxuICAnZm9yJzogZnVuY3Rpb24oa2V5KXtcbiAgICByZXR1cm4gaGFzKFN5bWJvbFJlZ2lzdHJ5LCBrZXkgKz0gJycpXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cbiAgICAgIDogU3ltYm9sUmVnaXN0cnlba2V5XSA9ICRTeW1ib2woa2V5KTtcbiAgfSxcbiAgLy8gMTkuNC4yLjUgU3ltYm9sLmtleUZvcihzeW0pXG4gIGtleUZvcjogZnVuY3Rpb24ga2V5Rm9yKGtleSl7XG4gICAgcmV0dXJuIGtleU9mKFN5bWJvbFJlZ2lzdHJ5LCBrZXkpO1xuICB9LFxuICB1c2VTZXR0ZXI6IGZ1bmN0aW9uKCl7IHNldHRlciA9IHRydWU7IH0sXG4gIHVzZVNpbXBsZTogZnVuY3Rpb24oKXsgc2V0dGVyID0gZmFsc2U7IH1cbn0pO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogJGNyZWF0ZSxcbiAgLy8gMTkuMS4yLjQgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6ICRkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogJGdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgLy8gMTkuMS4yLjcgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTylcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiAkZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMjQuMy4yIEpTT04uc3RyaW5naWZ5KHZhbHVlIFssIHJlcGxhY2VyIFssIHNwYWNlXV0pXG4kSlNPTiAmJiAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICghVVNFX05BVElWRSB8fCBCVUdHWV9KU09OKSwgJ0pTT04nLCB7c3RyaW5naWZ5OiAkc3RyaW5naWZ5fSk7XG5cbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGVhY2ggICAgICAgICA9IHJlcXVpcmUoJy4vX2FycmF5LW1ldGhvZHMnKSgwKVxuICAsIHJlZGVmaW5lICAgICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJylcbiAgLCBtZXRhICAgICAgICAgPSByZXF1aXJlKCcuL19tZXRhJylcbiAgLCBhc3NpZ24gICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtYXNzaWduJylcbiAgLCB3ZWFrICAgICAgICAgPSByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXdlYWsnKVxuICAsIGlzT2JqZWN0ICAgICA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgaGFzICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBnZXRXZWFrICAgICAgPSBtZXRhLmdldFdlYWtcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlXG4gICwgdW5jYXVnaHRGcm96ZW5TdG9yZSA9IHdlYWsudWZzdG9yZVxuICAsIHRtcCAgICAgICAgICA9IHt9XG4gICwgSW50ZXJuYWxNYXA7XG5cbnZhciB3cmFwcGVyID0gZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIFdlYWtNYXAoKXtcbiAgICByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKTtcbiAgfTtcbn07XG5cbnZhciBtZXRob2RzID0ge1xuICAvLyAyMy4zLjMuMyBXZWFrTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xuICAgIGlmKGlzT2JqZWN0KGtleSkpe1xuICAgICAgdmFyIGRhdGEgPSBnZXRXZWFrKGtleSk7XG4gICAgICBpZihkYXRhID09PSB0cnVlKXJldHVybiB1bmNhdWdodEZyb3plblN0b3JlKHRoaXMpLmdldChrZXkpO1xuICAgICAgcmV0dXJuIGRhdGEgPyBkYXRhW3RoaXMuX2ldIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgfSxcbiAgLy8gMjMuMy4zLjUgV2Vha01hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXG4gIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpe1xuICAgIHJldHVybiB3ZWFrLmRlZih0aGlzLCBrZXksIHZhbHVlKTtcbiAgfVxufTtcblxuLy8gMjMuMyBXZWFrTWFwIE9iamVjdHNcbnZhciAkV2Vha01hcCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fY29sbGVjdGlvbicpKCdXZWFrTWFwJywgd3JhcHBlciwgbWV0aG9kcywgd2VhaywgdHJ1ZSwgdHJ1ZSk7XG5cbi8vIElFMTEgV2Vha01hcCBmcm96ZW4ga2V5cyBmaXhcbmlmKG5ldyAkV2Vha01hcCgpLnNldCgoT2JqZWN0LmZyZWV6ZSB8fCBPYmplY3QpKHRtcCksIDcpLmdldCh0bXApICE9IDcpe1xuICBJbnRlcm5hbE1hcCA9IHdlYWsuZ2V0Q29uc3RydWN0b3Iod3JhcHBlcik7XG4gIGFzc2lnbihJbnRlcm5hbE1hcC5wcm90b3R5cGUsIG1ldGhvZHMpO1xuICBtZXRhLk5FRUQgPSB0cnVlO1xuICBlYWNoKFsnZGVsZXRlJywgJ2hhcycsICdnZXQnLCAnc2V0J10sIGZ1bmN0aW9uKGtleSl7XG4gICAgdmFyIHByb3RvICA9ICRXZWFrTWFwLnByb3RvdHlwZVxuICAgICAgLCBtZXRob2QgPSBwcm90b1trZXldO1xuICAgIHJlZGVmaW5lKHByb3RvLCBrZXksIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgLy8gc3RvcmUgZnJvemVuIG9iamVjdHMgb24gaW50ZXJuYWwgd2Vha21hcCBzaGltXG4gICAgICBpZihpc09iamVjdChhKSAmJiAhaXNFeHRlbnNpYmxlKGEpKXtcbiAgICAgICAgaWYoIXRoaXMuX2YpdGhpcy5fZiA9IG5ldyBJbnRlcm5hbE1hcDtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXMuX2Zba2V5XShhLCBiKTtcbiAgICAgICAgcmV0dXJuIGtleSA9PSAnc2V0JyA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICAvLyBzdG9yZSBhbGwgdGhlIHJlc3Qgb24gbmF0aXZlIHdlYWttYXBcbiAgICAgIH0gcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMsIGEsIGIpO1xuICAgIH0pO1xuICB9KTtcbn0iLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGV4cG9ydCAgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LlIsICdTZXQnLCB7dG9KU09OOiByZXF1aXJlKCcuL19jb2xsZWN0aW9uLXRvLWpzb24nKSgnU2V0Jyl9KTsiLCJyZXF1aXJlKCcuL2VzNi5hcnJheS5pdGVyYXRvcicpO1xudmFyIGdsb2JhbCAgICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGhpZGUgICAgICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCBJdGVyYXRvcnMgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCBUT19TVFJJTkdfVEFHID0gcmVxdWlyZSgnLi9fd2tzJykoJ3RvU3RyaW5nVGFnJyk7XG5cbmZvcih2YXIgY29sbGVjdGlvbnMgPSBbJ05vZGVMaXN0JywgJ0RPTVRva2VuTGlzdCcsICdNZWRpYUxpc3QnLCAnU3R5bGVTaGVldExpc3QnLCAnQ1NTUnVsZUxpc3QnXSwgaSA9IDA7IGkgPCA1OyBpKyspe1xuICB2YXIgTkFNRSAgICAgICA9IGNvbGxlY3Rpb25zW2ldXG4gICAgLCBDb2xsZWN0aW9uID0gZ2xvYmFsW05BTUVdXG4gICAgLCBwcm90byAgICAgID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgaWYocHJvdG8gJiYgIXByb3RvW1RPX1NUUklOR19UQUddKWhpZGUocHJvdG8sIFRPX1NUUklOR19UQUcsIE5BTUUpO1xuICBJdGVyYXRvcnNbTkFNRV0gPSBJdGVyYXRvcnMuQXJyYXk7XG59Il19
