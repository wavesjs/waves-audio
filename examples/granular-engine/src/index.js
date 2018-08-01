import * as audio from 'waves-audio';
import * as loaders from 'waves-loaders';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');

const audioContext = audio.audioContext;
const loader = new loaders.AudioBufferLoader();
const container = '.controllers';
const audioFile = './assets/audio/hendrix.wav';

async function init() {
  const buffer = await loader.load(audioFile);

  const scheduler = audio.getScheduler();
  const scheduledGranularEngine = new audio.GranularEngine({ buffer });
  scheduledGranularEngine.connect(audioContext.destination);

  // create transport with play control and transported granular engine
  const transportedGranularEngine = new audio.GranularEngine({
    buffer: buffer,
    cyclic: true
  });
  const playControl = new audio.PlayControl(transportedGranularEngine);
  transportedGranularEngine.connect(audioContext.destination);

  new controllers.Title({
    label: 'Granular Engine in Scheduler',
    container: container,
  });

  new controllers.Toggle({
    label: 'Enable',
    default: false,
    container: container,
    callback: value => {
      if (value)
        scheduler.add(scheduledGranularEngine);
      else
        scheduler.remove(scheduledGranularEngine);
    }
  });

  new controllers.Slider({
    label: 'Position',
    min: 0,
    max: 20.6,
    step: 0.010,
    default: 0,
    unit: 'sec',
    size: 'large',
    container: container,
    callback: value => scheduledGranularEngine.position = value,
  });

  new controllers.Title({
    label: 'Granular Engine with Play Control',
    container: container,
  });

  new controllers.Toggle({
    label: 'Play',
    default: false,
    container: container,
    callback: value => {
      if (value)
        playControl.start();
      else
        playControl.stop();
    }
  });

  const speedSlider = new controllers.Slider({
    label: 'Speed',
    min: -2,
    max: 2,
    step: 0.01,
    default: 1,
    size: 'large',
    container: container,
    callback: value => {
      playControl.speed = value;
      speedSlider.value = playControl.speed;
    }
  });

  new controllers.Title({
    label: 'Common Parameters',
    container: container,
  });

  new controllers.Slider({
    label: 'Position Var',
    min: 0,
    max: 0.200,
    step: 0.001,
    default: 0.003,
    unit: 'sec',
    size: 'large',
    container: container,
    callback: value => {
      scheduledGranularEngine.positionVar = value;
      transportedGranularEngine.positionVar = value;
    }
  });

  new controllers.Slider({
    label: 'Period',
    min: 0.001,
    max: 0.500,
    step: 0.001,
    default: 0.010,
    unit: 'sec',
    size: 'large',
    container: container,
    callback: value => {
      scheduledGranularEngine.periodAbs = value;
      transportedGranularEngine.periodAbs = value;
    }
  });

  new controllers.Slider({
    label: 'Duration',
    min: 0.010,
    max: 0.500,
    step: 0.001,
    default: 0.100,
    unit: 'sec',
    size: 'large',
    container: container,
    callback: value => {
      scheduledGranularEngine.durationAbs = value;
      transportedGranularEngine.durationAbs = value;
    }
  });

  new controllers.Slider({
    label: 'Resampling',
    min: -2400,
    max: 2400,
    step: 1,
    default: 0,
    unit: 'cent',
    size: 'large',
    container: container,
    callback: value => {
      scheduledGranularEngine.resampling = value;
      transportedGranularEngine.resampling = value;
    }
  });

  new controllers.Slider({
    label: 'Resampling Var',
    min: 0,
    max: 1200,
    step: 1,
    default: 0,
    unit: 'cent',
    size: 'large',
    container: container,
    callback: value => {
      scheduledGranularEngine.resamplingVar = value;
      transportedGranularEngine.resamplingVar = value;
    }
  });
}

window.addEventListener('load', init);

