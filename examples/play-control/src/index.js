import * as audio from 'waves-audio';
import * as loaders from 'waves-loaders';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');
const audioContext = audio.audioContext;
const loader = new loaders.SuperLoader();
const container = '.controllers';
const assets = [
  './assets/audio/drum-loop.wav',
  './assets/audio/drum-loop.json'
];

async function init() {
  const [audioBuffer, markerBuffer] = await loader.load(assets)
  const beatDuration = audioBuffer.duration / 4;

  // create and connect metronome engine
  const metronome = new audio.Metronome();
  metronome.period = beatDuration;
  metronome.connect(audioContext.destination);

  // create and connect player engine
  const playerEngine = new audio.PlayerEngine({
    buffer: audioBuffer,
    centered: false,
    cyclic: true
  });
  playerEngine.connect(audioContext.destination);

  // create and connect granular engine
  const granularEngine = new audio.GranularEngine({
    buffer: audioBuffer,
    cyclic: true
  });
  granularEngine.connect(audioContext.destination);

  // create and connect segment engine
  const segmentEngine = new audio.SegmentEngine({
    buffer: audioBuffer,
    positionArray: markerBuffer.time,
    durationArray: markerBuffer.duration,
    cyclic: true
  });
  segmentEngine.connect(audioContext.destination);

  // create play control
  const playControl = new audio.PlayControl(metronome);
  playControl.setLoopBoundaries(0, 2 * audioBuffer.duration);
  playControl.loop = true;

  // create position display (as scheduled TimeEngine)
  const scheduler = new audio.getScheduler();

  class PositionDisplay extends audio.TimeEngine {
    constructor() {
      super();
      this.period = 0.05;
    }

    advanceTime(time) {
      seekSlider.value = Math.floor(playControl.currentPosition / beatDuration).toFixed(2);
      return time + this.period;
    }
  }
  const positionDisplay = new PositionDisplay();

  // create GUI elements
  new controllers.SelectButtons({
    label: 'Play',
    options: ['Start', 'Pause', 'Stop'],
    default: 'Stop',
    container: container,
    callback: value => {
      switch (value) {
        case 'Start':
          playControl.start();
          if (positionDisplay.master === null)
            scheduler.add(positionDisplay);
          break;

        case 'Pause':
          playControl.pause();
          if (positionDisplay.master !== null)
            scheduler.remove(positionDisplay);
          break;

        case 'Stop':
          playControl.stop();
          if (positionDisplay.master !== null)
            scheduler.remove(positionDisplay);
          break;
      }
    }
  });

  const speedSlider = new controllers.Slider({
    label: 'Speed',
    min: -2,
    max: 2,
    step: 0.01,
    default: 1,
    unit: '',
    size: '',
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
    step: 0.125,
    default: 0,
    unit: 'beats',
    size: 'large',
    container: container,
    callback: value => {
      playControl.seek(value * beatDuration);
    }
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
    callback: value => {
      playControl.loopStart = value * beatDuration;
    }
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
    callback: value => {
      playControl.loopEnd = value * beatDuration;
    }
  });

  new controllers.SelectButtons({
    label: 'Choose Engine',
    options: ['Metronome', 'Player Engine', 'Granular Engine', 'Segment Engine'],
    container: container,
    callback: value => {
      switch (value) {
        case 'Metronome':
          playControl.set(metronome);
          break;

        case 'Player Engine':
          playControl.set(playerEngine);
          break;

        case 'Granular Engine':
          playControl.set(granularEngine);
          break;

        case 'Segment Engine':
          playControl.set(segmentEngine);
          break;
      }
    }
  });
}

window.addEventListener('load', init);
