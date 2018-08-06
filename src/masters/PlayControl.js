import defaultAudioContext from '../core/audioContext';
import { getScheduler } from './factories';
import * as masters from 'waves-masters';

/**
 * Extends Time Engine to provide playback control of a Time Engine instance.
 *
 * [example]{@link https://rawgit.com/wavesjs/waves-audio/master/examples/play-control/index.html}
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
class PlayControl extends masters.PlayControl {
  constructor(engine, options = {}) {
    const audioContext = options.audioContext || defaultAudioContext;
    const scheduler = getScheduler(audioContext);

    super(scheduler, engine, options);

    this.audioContext = audioContext;
  }
}

export default PlayControl;
