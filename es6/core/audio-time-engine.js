import TimeEngine from './time-engine';
import defaultAudioContext from './audio-context';

/**
 * @class AudioTimeEngine
 */
export default class AudioTimeEngine extends TimeEngine{
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
