/**
 * @fileoverview WAVE audio library element: a web audio granular engine.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 1.2.6
 */


/**
 * Function invocation pattern for object creation.
 * @public
 */

var createGranularEngine = function createGranularEngine(audioBuffer, audioContext, optName) {
  'use strict';

  /**
   * ECMAScript5 property descriptors object.
   */

  var granularEngineObject = {

    // Properties with default values
    period: { // in sec
      writable: true,
      value: 0.01
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
      value: 0.2
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
    nextEventTime: {
      writable: true
    },
    gainNode: {
      writable: true
    },
    outputNode: {
      writable: true
    },
    gain: {
      writable: true
    },
    name: {
      writable: true,
    },


    /**
     * Mandatory initialization method.
     * @public
     * @chainable
     */
    init: {
      enumerable: true,
      value: function(audioBuffer, audioContext, optName) {

        this.context = audioContext;
        this.setBuffer(audioBuffer);
        this.name = optName;

        // Create web audio nodes, relying on the given audio context.
        this.gainNode = this.context.createGain();
        this.outputNode = this.context.createGain(); // dummy node to provide a web audio-like output node
        this.connect(this.context.destination); // default destination

        makeSchedulable(this); // an audio engine has to inherit schedulable properties

        return this; // for chainability
      }
    },

    /**
     * Recommended self-checking public method.
     * @public
     */
    isValid: {
      enumerable: true,
      value: function() {
        if (this.buffer) {
          return true;
        } else {
          console.error("No buffer is set");
          return false;
        }
      }
    },

    /**
     * Optional phase resetting public method.
     * @public
     */
    resetPhase: {
      enumerable: true,
      value: function() {
        // This engine does not manage phase.
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
     * Set buffer position.
     * @public
     * @chainable
     */
    seek: {
      enumerable: true,
      value: function(position) {
        if (!isNaN(parseFloat(position))) { // number check
          if (position >= 0 && position <= this.bufferDuration) {
            this.position = position;
            return this;
          } else {
            console.log("Position is out of bounds");
          }
        } else {
          throw "Seeking error";
        }
      }
    },

    /**
     * Grain factory.
     * @private
     */
    makeNextGrain: {
      enumerable: false,
      value: function() {
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
        source.start(this.nextEventTime, grainPosition, this.duration);
      }
    },

    /**
     * Compute grain position from direct interaction or external transporter delegation.
     * @private
     */
    computeGrainPosition: {
      enumerable: false,
      value: function(grainDuration) {
        var grainPosition;

        // Update grain position when slaved, from last synchronization
        if (this.isTransportable) {
          var position = this.transporter.getPositionAtTime(this.nextEventTime);

          if (position >= 0 && position <= this.bufferDuration) {
            this.position = position;
          } else {
            this.notifyEnd();
            console.log("Position is out of bounds");
          }
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

        var attackEndTime = this.nextEventTime + attackDuration;
        var grainEndTime = this.nextEventTime + grainDuration;
        var releaseStartTime = grainEndTime - releaseDuration;

        // make attack and release
        envelopeNode.gain.setValueAtTime(0.0, this.nextEventTime);
        envelopeNode.gain.linearRampToValueAtTime(this.maxGrainAmplitude, attackEndTime);

        if (releaseStartTime > attackEndTime) {
          envelopeNode.gain.setValueAtTime(this.maxGrainAmplitude, releaseStartTime);
        }

        envelopeNode.gain.linearRampToValueAtTime(0.0, grainEndTime);
        return envelopeNode;
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


    //////////////////////////////////////
    // Required schedulable properties. //
    //////////////////////////////////////


    /**
     * Make next event.
     * @private
     */
    makeAtNextTime: {
      enumerable: false,
      value: function() {
        this.makeNextGrain();
      }
    },

    /**
     * Compute next event time.
     * @private
     */
    computeNextEventTime: {
      enumerable: false,
      value: function() {
        this.nextEventTime = this.nextEventTime + this.period;
        return this.nextEventTime;
      }
    },

    /**
     * Get next event time.
     * @private
     */
    getNextTime: {
      enumerable: false,
      value: function() {
        return this.nextEventTime;
      }
    },

    /**
     * Set next event time.
     * @private
     */
    setNextEventTime: {
      enumerable: false,
      value: function(time) {
        this.nextEventTime = time;
      }
    },

    /**
     * Notify end to the Transporter object.
     * @private
     */
    notifyEnd: {
      enumerable: false,
      value: function() {
        if (this.transporter) {
          console.log("notifyEnd", this);
          this.transporter.onTransportableObjectEnded(this);
        } else {
          throw "notifyEnd error";
        }
      }
    },

  }; // End of object definition.


  // Instantiate an object and initialize it.
  var granularEngine = Object.create({}, granularEngineObject);
  return granularEngine.init(audioBuffer, audioContext, optName);
};


// CommonJS function export
module.exports = createGranularEngine;