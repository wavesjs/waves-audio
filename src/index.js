
/**
 * @fileoverview WAVE audio library element: a web audio granular engine.
 * @author Karim.Barkati@ircam.fr, Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr
 * @version 2.1.0
 */

"use strict";

class GranularEngine {

  /**
   * Constructor.
   * @public
   * @chainable
   */
  constructor(audioBuffer, optName){
    
    if (!this || this === window)
      throw new SyntaxError("You seem to have forgotten the new operator; Shame on you!");

    this.period = 0.01 // in sec
    this.position = 0 // buffer position (in sec), assumed not normalized
    this.positionVariation = 0.003
    this.duration = 0.2
    this.resampling = 0
    this.resamplingVariation = 0
    this.centered = false
    this.maxGrainAmplitude = 0.2
    this.setBuffer(audioBuffer);
    this.name = optName;
    this.gain = 1;
    
    // Create web audio nodes, relying on the web audio context.
    this.gainNode = audioContext.createGain();
    this.outputNode = audioContext.createGain(); // dummy node to provide a web audio-like output node

  }

  // Private methods
  // ---------------

  /**
   * Grain factory.
   * @private
   */
  __makeNextGrain() {
    var source = audioContext.createBufferSource();
    var resamplingRate = this.__computeResamplingRate();
    var grainDuration = this.duration / resamplingRate;
    var grainPosition = this.__computeGrainPosition(grainDuration);
    var grainEnvelopeNode = this.__makeGrainEnvelope(grainDuration);

    source.buffer = this.buffer;
    source.playbackRate.value = resamplingRate;

    source.connect(grainEnvelopeNode);
    grainEnvelopeNode.connect(this.gainNode);

    // args: schedule time, buffer offset, duration (all in seconds)
    source.start(this.nextEventTime, grainPosition, this.duration);
  }

  /**
   * Compute grain position from direct interaction or external transporter delegation.
   * @private
   */
  __computeGrainPosition(grainDuration) {
    var grainPosition;

    // Update grain position when slaved, from last synchronization
    if (this.isTransportable) {
      var position = this.transporter.timebase.getPositionAtTime(this.nextEventTime);

      if (position >= 0 && position <= this.bufferDuration) {
        this.position = position;
      } else {
        console.log("Grain position is out of bounds");
        if (this.hasOwnProperty("notifyEnd")) {
          this.notifyEnd();
        }
      }
    }

    grainPosition = this.__randomizeGrainPosition(this.position % this.bufferDuration);
    if (this.centered) grainPosition -= 0.5 * grainDuration;

    return grainPosition;
  }

  /**
   * Randomize position to break phasing artifacts, except when playing at normal speed.
   * @private
   */
  __randomizeGrainPosition(grainPosition) {
    var randomGrainShift = (Math.random() - 0.5) * 2.0 * this.positionVariation;

    return (grainPosition + randomGrainShift) % this.bufferDuration;
  }


  /**
   * Simple triangle envelope generator for grains.
   * @todo hanning envelope (or gaussian)
   * @private
   */
  __makeGrainEnvelope(grainDuration) {
    var envelopeNode = audioContext.createGain();
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

  /**
   * Compute resampling rate for pitch shifting.
   * @private
   */
  __computeResamplingRate() {
    var randomResampling = (Math.random() - 0.5) * 2.0 * this.resamplingVariation;
    var totalResampling = this.resampling + randomResampling;
    var resamplingRate = Math.pow(2.0, totalResampling / 1200.0);
    return resamplingRate;
  }

  //////////////////////////////////////
  // Required schedulable properties. //
  //////////////////////////////////////


  /**
   * Make event and compute next event time.
   * @private
   */
  makeEventAndReturnNextTime() {
    this.__makeNextGrain();
    this.nextEventTime = this.nextEventTime + this.period;
    return this.nextEventTime;
  }

  /**
   * Time resetting.
   * @private
   */
  resetAndReturnNextTime(time) {

    this.nextEventTime = time;
    return time; // start immediately
  }

  // Public methods
  // ----–---------

  // remove me (obsolete, validity can be checked in resetAndReturnNextTime returning Infinity)
  isValid() {
    if (this.buffer) {
      return true;
    } else {
      console.error("No buffer is set");
      return false;
    }
  }

  /**
   * Connect public method.
   * @public
   * @chainable
   */
  connect(target) {
    this.outputNode = target;
    this.gainNode.connect(this.outputNode);
    return this;
  }

  /**
   * Web audio API-like disconnect method.
   * @public
   * @chainable
   */
  disconnect(output) {
    this.gainNode.disconnect(output);
    return this;
  }

  /**
   * Set buffer and bufferDuration.
   * @public
   * @chainable
   */
  setBuffer(buffer) {

    this.buffer = buffer;
    this.bufferDuration = buffer.duration;
    return this;
  }

  /**
   * Set gain value and squared volume.
   * @public
   * @chainable
   */
  setGain(gain) {

    this.gain = gain;
    // Let's use an x-squared curve since simple linear (x) does not sound as good.
    this.gainNode.gain.value = gain * gain;
    return this;
  }

  /**
   * Set buffer position.
   * @public
   * @chainable
   */
  seek(position) {
    if (!arguments.length) throw new ReferenceError("seek(): no position");
    if (position < 0 || position > this.bufferDuration)
      throw new ReferenceError("seek(): no position");

    this.position = position;
    return this;
  }

}

module.exports = GranularEngine;