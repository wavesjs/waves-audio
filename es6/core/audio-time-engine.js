'use strict';

var TimeEngine = require("./time-engine");
var defaultAudioContext = require("./audio-context");

/**
 * @class AudioTimeEngine
 */
class AudioTimeEngine extends TimeEngine{
  constructor(audioContext = defaultAudioContext) {
    super();

    this.audioContext = audioContext;
    this.outputNode = null;
  }

  connect(target) {
    this.outputNode.connect(target);
    return this;
  }

  disconnect(connection) {
    this.outputNode.disconnect(connection);
    return this;
  }
}

module.exports = AudioTimeEngine;
