import * as audio from 'waves-audio';
import * as loaders from 'waves-loaders';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');
const audioContext = audio.audioContext;
const scheduler = audio.getScheduler();
const container = '.controllers';

// Synth AudioTimeEngine class
// The engine repeats a waveform at a given frequency.
// When the frequency changes, the engine is rescheduled accordingly.
class Synth extends audio.AudioTimeEngine {
  constructor() {
    super();

    this.waveform = null; // current waveform
    this.period = 0; // current period
    this.lastTime = 0; // last waveform synth time
  }

  // AudioTimeEngine scheduled interface method
  advanceTime(time) {
    var src = audioContext.createBufferSource();

    // play current waveform at given time
    src.buffer = this.waveform;
    src.connect(audioContext.destination);
    src.start(time);

    // remember time to reschedule properly when changing frequency
    this.lastTime = time;

    // advance to next time
    return time + this.period;
  }

  setFreq(freq) {
    let period = 0;

    // set period
    if (freq > 0)
      period = 1 / freq;

    if (period > 0 && this.period === 0) {
      this.resetTime(); // start synth now
    } else if (period === 0 && this.period > 0) {
      this.resetTime(Infinity); // stop synth
    } else if (period > 0) {
      // continue playing with new period
      const nextTime = this.lastTime + period;
      // reschedule synth according to new period (when next time > current scheduler time)
      if (nextTime > scheduler.currentTime)
        this.resetTime(nextTime);
    }

    this.period = period;
  }
}

// load three waveforms corresponding to the vowels 'A', I, and O
const files = [
  './assets/audio/wave-a.wav',
  './assets/audio/wave-o.wav',
  './assets/audio/wave-i.wav'
];

const loader = new loaders.AudioBufferLoader();

async function init() {
  const buffers = await loader.load(files);
  const waveforms = {}; // dict of loaded waveforms
  waveforms['A'] = buffers[0];
  waveforms['O'] = buffers[1];
  waveforms['I'] = buffers[2];

  // set current waveform of synth to 'A'
  const synth = new Synth(); // instantiate Synth AudioTimeEngine
  synth.waveform = waveforms['A'];
  scheduler.add(synth, Infinity);

  // create GUI elements
  new controllers.Slider({
    label: 'Frequency',
    min: 0,
    max: 250,
    step: 1,
    default: 0,
    unit: 'Hz',
    size: 'large',
    container: container,
    callback: value => synth.setFreq(value),
  });

  new controllers.SelectButtons({
    label: 'Vowel',
    options: ['A', 'O', 'I'],
    default: 'A',
    container: container,
    callback: value => synth.waveform = waveforms[value],
  });
}

window.addEventListener('load', init);

