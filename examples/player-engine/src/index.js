import * as audio from 'waves-audio';
import * as loaders from 'waves-loaders';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');

const audioContext = audio.audioContext;
const loader = new loaders.AudioBufferLoader(); // instantiate loader
const container = '.controllers';
const soundFile = './assets/audio/drum-loop.wav';

async function init() {
  const audioBuffer = await loader.load(soundFile);

  const beatDuration = audioBuffer.duration / 4;
  // create player engine
  const playerEngine = new audio.PlayerEngine();
  playerEngine.buffer = audioBuffer;
  playerEngine.cyclic = true;
  playerEngine.connect(audioContext.destination);

  // create play control
  const playControl = new audio.PlayControl(playerEngine);
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

  new controllers.SelectButtons({
    label: 'Play',
    options: ['start', 'pause', 'stop'],
    default: 'stop',
    container: container,
    callback: value => {
      switch (value) {
        case 'start':
          playControl.start();
          if (positionDisplay.master === null)
            scheduler.add(positionDisplay);
          break;

        case 'pause':
          playControl.pause();
          if (positionDisplay.master !== null)
            scheduler.remove(positionDisplay);
          break;

        case 'stop':
          playControl.stop();
          if (positionDisplay.master !== null)
            scheduler.remove(positionDisplay);
          break;
      }
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
    callback: value => playControl.seek(value * beatDuration),
  });

  const speedSlider = new controllers.Slider({
    label: 'Speed',
    min: 0.5,
    max: 2,
    step: 0.01,
    default: 1,
    container: container,
    callback: value => {
      playControl.speed = value;
      speedSlider.value = playControl.speed;
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
}

window.addEventListener('load', init);
