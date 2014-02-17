/**
 * @fileoverview WAVE audio library element: a web audio granular engine, separated from the player.
 * @author Karim Barkati
 * @version 0.1.1 (CommonJS compliance)
 */



/**
 * Function invocation pattern for a granular engine.
 * @public
 */
var createGranularEngine = function createGranularEngine(audioContext, audioBuffer) {
  'use strict';

  /**
   * Granular engine object as an ecmascript5 properties object.
   */
   
  var granularEngineObject = {


    // Properties with default values
    period: { // in sec
      writable: true,
      value: 0.01
    },
    lookahead: { // How frequently to call scheduling function (sec)
      writable: true,
      value: 0.025
    },
    scheduleAheadTime: { // How far ahead to schedule audio (sec)
      writable: true,
      value: 0.1
    },
    player: { // if a player is registered then "slave" mode for position handling
      writable: true,
      value: false
    },
    position: { // buffer position (in sec), assumed not normalized
      writable: true,
      value: 0
    },
    positionVariation: {
      writable: true,
      value: 0.003
    },
    duration: {
      writable: true,
      value: 0.2
    },
    resampling: {
      writable: true,
      value: 0
    },
    resamplingVariation: {
      writable: true,
      value: 0
    },
    centered: {
      writable: true,
      value: false
    },
    maxGrainAmplitude: {
      writable: true,
      value: 0.1
    },

    // Other properties
    context: {
      writable: true
    },
    buffer: {
      writable: true
    },
    bufferDuration: {
      writable: true
    },
    nextGrainTime: {
      writable: true
    },
    nextGrainPosition: { // For "position" variable replacement, when namespaced binding will be there...
      writable: true
    },
    timerID: {
      writable: true
    },
    gainNode: {
      writable: true
    },
    outputNode: {
      writable: true
    },
    syncTime: {
      writable: true
    },
    syncPosition: {
      writable: true
    },
    gain: {
      writable: true
    },

    /**
     * Mandatory initialize method.
     */
    init: {
      enumerable: true,
      value: function(audioContext, audioBuffer) {

        this.context = audioContext;
        this.setBuffer(audioBuffer);

        // Create web audio nodes, relying on the given audio context.
        this.gainNode = this.context.createGain();
        this.outputNode = this.context.createGain(); // dummy node to provide a web audio-like output node
        this.connect(this.context.destination); // default destination

        return this; // for chainability
      }
    },

    /**
     * Start and stop grain scheduling.
     * @public
     * @chainable
     */
    enable: {
      enumerable: true,
      value: function(bool) {
        if (bool) {
          if (this.buffer) {
            this.enabled = true;
            // schedule next grain immediately
            this.nextGrainTime = this.context.currentTime;
            if (this.player) {
              this.player.synchronize(this.nextGrainTime, this.position);
            }
            this.schedule();
          } else {
            throw "No buffer is set";
          }
        } else {
          // remove the current settimeout
          clearTimeout(this.timerID);
          this.enabled = false;
        }
        return this; // for chainability        
      }
    },

    /**
     * Connect public method.
     * @public
     * @chainable
     */
    connect: {
      enumerable: true,
      value: function(target) {
        this.outputNode = target;
        this.gainNode.connect(this.outputNode || this.context.destination);
        return this; // for chainability
      }
    },

    /**
     * Set buffer and bufferDuration.
     * @public
     * @chainable
     */
    setBuffer: {
      enumerable: true,
      value: function(buffer) {
        if (buffer) {
          this.buffer = buffer;
          this.bufferDuration = buffer.duration;
          return this; // for chainability
        } else {
          throw "Buffer setting error";
        }
      }
    },

    /**
     * Set gain value and squared volume.
     * @public
     * @chainable
     */
    setGain: {
      enumerable: true,
      value: function(gain) {
        if (gain) {
          this.gain = gain;
          // Let's use an x-squared curve since simple linear (x) does not sound as good.
          this.gainNode.gain.value = gain * gain;
          return this; // for chainability
        } else {
          throw "Gain setting error";
        }
      }
    },

    /**
     * Set external player to manage position advancement in the buffer.
     * @public
     * @chainable
     */
    setPlayer: {
      enumerable: true,
      value: function(player) {
        if (player) {
          this.player = player;
          return this; // for chainability
        } else {
          throw "Player setting error";
        }
      }
    },

    /**
     * Coarse-grained scheduling of audio grains.
     * @private
     */
    schedule: {
      enumerable: false,
      value: function() {
        var that = this;

        // While there are grains that will need to play before the next interval, 
        // schedule them and advance the time pointer.
        while (this.nextGrainTime <= this.context.currentTime + this.scheduleAheadTime) {
          this.makeGrain();
          this.nextGrainTime = this.computeNextGrainTime();
        }

        // Store the setTimeout ID to remove it later.
        this.timerID = setTimeout(function() {
          that.schedule();
        }, that.lookahead * 1000);
      }
    },

    /**
     * Main grain factory.
     * @private
     */
    makeGrain: {
      enumerable: false,
      value: function() {
        if (this.enabled) {

          var source = this.context.createBufferSource();
          var resamplingRate = this.computeResamplingRate();
          var grainDuration = this.duration / resamplingRate;
          var grainPosition = this.computeGrainPosition(grainDuration);
          var grainEnvelopeNode = this.makeGrainEnvelope(grainDuration);

          source.buffer = this.buffer;
          source.playbackRate.value = resamplingRate;

          source.connect(grainEnvelopeNode);
          grainEnvelopeNode.connect(this.gainNode);

          // args: schedule time, buffer offset, duration (all in seconds)
          source.start(this.nextGrainTime, grainPosition, this.duration);
        }
      }
    },

    /**
     * Compute grain position from external player delegation or direct interaction.
     * @private
     */
    computeGrainPosition: {
      enumerable: false,
      value: function(grainDuration) {
        var grainPosition;

        // Update grain position on auto-play, from last synchronization
        if (this.player) {
          this.position = this.player.getPositionAtTime(this.nextGrainTime) % this.bufferDuration;
        }

        grainPosition = this.randomizeGrainPosition(this.position % this.bufferDuration);
        if (this.centered) grainPosition -= 0.5 * grainDuration;

        return grainPosition;
      }
    },

    /**
     * Randomize position to break phasing artifacts, except when playing at normal speed.
     * @private
     */
    randomizeGrainPosition: {
      enumerable: false,
      value: function(grainPosition) {
        var randomGrainShift = (Math.random() - 0.5) * 2.0 * this.positionVariation;

        return (grainPosition + randomGrainShift) % this.bufferDuration;
      }
    },

    /**
     * Simple triangle envelope generator for grains.
     * @todo hanning envelope (or gaussian)
     * @private
     */
    makeGrainEnvelope: {
      enumerable: false,
      value: function(grainDuration) {
        var envelopeNode = this.context.createGain();
        var attackDuration = 0.5 * grainDuration;
        var releaseDuration = 0.5 * grainDuration;

        var attackEndTime = this.nextGrainTime + attackDuration;
        var grainEndTime = this.nextGrainTime + grainDuration;
        var releaseStartTime = grainEndTime - releaseDuration;

        // make attack and release
        envelopeNode.gain.setValueAtTime(0.0, this.nextGrainTime);
        envelopeNode.gain.linearRampToValueAtTime(this.maxGrainAmplitude, attackEndTime);

        if (releaseStartTime > attackEndTime) {
          envelopeNode.gain.setValueAtTime(this.maxGrainAmplitude, releaseStartTime);
        }

        envelopeNode.gain.linearRampToValueAtTime(0.0, grainEndTime);
        return envelopeNode;
      }
    },

    /**
     * Compute next grain time depending on the period.
     * @private
     */
    computeNextGrainTime: {
      enumerable: false,
      value: function() {
        if (this.enabled) {
          this.nextGrainTime = this.nextGrainTime + this.period;
        } else {
          this.nextGrainTime = undefined; // ensure a false value to stop the scheduling loop
        }
        return this.nextGrainTime;
      }
    },

    /**
     * Compute resampling rate for pitch shifting.
     * @private
     */
    computeResamplingRate: {
      enumerable: false,
      value: function() {
        var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVariation;
        var totalResampling = this.resampling + randomResampling;
        var resamplingRate = Math.pow(2.0, totalResampling / 1200.0);
        return resamplingRate;
      }
    },

  };


  // Instantiate a granular engine with audio context and buffer.
  var granularEngine = Object.create({}, granularEngineObject);
  return granularEngine.init(audioContext, audioBuffer);
};


// CommonJS function export
module.exports = createGranularEngine;