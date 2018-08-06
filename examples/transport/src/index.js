import * as audio from 'waves-audio';
import * as loaders from 'waves-loaders';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');

const audioContext = audio.audioContext;
const loader = new loaders.SuperLoader(); // instantiate loader
const container = '.controllers';
const assets = [
  './assets/audio/drum-loop.wav',
  './assets/audio/drum-loop.json'
];

async function init() {
  const [audioBuffer, markerBuffer] = await loader.load(assets);
  const beatDuration = audioBuffer.duration / 4;

  // create and connect metronome engine
  const metronome = new audio.Metronome();
  metronome.period = beatDuration;
  metronome.connect(audioContext.destination);

  const playerEngine = new audio.PlayerEngine({
    buffer: audioBuffer,
    cyclic: true
  });

  playerEngine.connect(audioContext.destination);

  // create and connect granular engine
  const granularEngine = new audio.GranularEngine({
    buffer: audioBuffer,
    centered: false, // to be synchronous with other engines
    cyclic: true
  });

  granularEngine.connect(audioContext.destination);

  // create and connect segment engine
  const segmentEngine = new audio.SegmentEngine({
    buffer: audioBuffer,
    cyclic: true,
    positionArray: markerBuffer.time,
    durationArray: markerBuffer.duration
  });

  segmentEngine.connect(audioContext.destination);

  // create position display (as transported TimeEngine)
  class PositionDisplay extends audio.TimeEngine {
    constructor() {
      super();
      this.period = 0.01 * beatDuration;
    }

    syncPosition(time, position, speed) {
      let nextPosition = Math.floor(position / this.period) * this.period;

      if (speed > 0 && nextPosition < position)
        nextPosition += this.period;
      else if (speed < 0 && nextPosition > position)
        nextPosition -= this.period;

      return nextPosition;
    }

    advancePosition(time, position, speed) {
      seekSlider.value = Math.floor(playControl.currentPosition / beatDuration).toFixed(2);

      if (speed < 0)
        return position - this.period;

      return position + this.period;
    }
  }

  const positionDisplay = new PositionDisplay();

  // create transport and add engines
  const transport = new audio.Transport();
  transport.add(metronome);
  // transport.add(playerEngine);
  // transport.add(granularEngine);
  // transport.add(segmentEngine);
  transport.add(positionDisplay);

  // create play control
  const playControl = new audio.PlayControl(transport);
  playControl.setLoopBoundaries(0, 2 * audioBuffer.duration);
  playControl.loop = true;


  new controllers.Title({
    label: 'Transport Play Control',
    container: container,
  });

  new controllers.Toggle({
    label: 'Play',
    active: false,
    container: container,
    callback: value => {
      if (value)
        playControl.start();
      else
        playControl.stop();
    },
  });

  const speedSlider = new controllers.Slider({
    label: 'Speed',
    min: -2,
    max: 2,
    step: 0.01,
    default: 1,
    container: container,
    callback: value => {
      playControl.speed = value;
      speedSlider.value = playControl.speed;
    }
  });

  const seekSlider = new controllers.Slider({
    label: 'Seek',
    min: 0,
    max: 8,
    step: 0.01,
    default: 0,
    unit: 'beats',
    size: 'large',
    container: container,
    callback: value => playControl.seek(value * beatDuration),

  });

  new controllers.Slider({
    label: 'Loop Start',
    min: 0,
    max: 8,
    step: 0.25,
    default: 0,
    unit: 'beats',
    size: 'large',
    container: container,
    callback: value => playControl.loopStart = value * beatDuration,
  });

  new controllers.Slider({
    label: 'Loop End',
    min: 0,
    max: 8,
    step: 0.25,
    default: 8,
    unit: 'beats',
    size: 'large',
    container: container,
    callback: value => playControl.loopEnd = value * beatDuration,

  });

  new controllers.Title({
    label: 'Enable Engines',
    container: container,
  });

  new controllers.Toggle({
    label: 'Metronome',
    active: true,
    container: container,
    callback: value => {
      if (value)
        transport.add(metronome);
      else
        transport.remove(metronome);
    },
  });

  new controllers.Toggle({
    label: 'Player Engine',
    active: false,
    container: container,
    callback: value => {
      if (value)
        transport.add(playerEngine);
      else
        transport.remove(playerEngine);
    },
  });

  new controllers.Toggle({
    label: 'Granular Engine',
    active: false,
    container: container,
    callback: value => {
      if (value)
        transport.add(granularEngine);
      else
        transport.remove(granularEngine);
    },
  });

  new controllers.Toggle({
    label: 'Segment Engine',
    active: false,
    container: container,
    callback: value => {
      if (value)
        transport.add(segmentEngine);
      else
        transport.remove(segmentEngine);
    },
  });
}

window.addEventListener('load', init);
