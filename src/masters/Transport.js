import defaultAudioContext from '../core/audioContext';
import { getScheduler } from './factories';
import * as masters from 'waves-masters';

/**
 * Provides synchronized scheduling of Time Engine instances.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/transport/index.html}
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
class Transport extends masters.Transport {
  constructor(options = {}) {
    const audioContext = options.audioContext || defaultAudioContext;
    const scheduler = getScheduler(audioContext);
    super(scheduler, options);

    this.audioContext = audioContext;
  }
}

export default Transport;
