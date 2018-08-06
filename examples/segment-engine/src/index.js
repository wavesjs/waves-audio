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
  const eighthBeatDuration = audioBuffer.duration / 8;

  console.log('heiho');

  // get scheduler and create scheduled segment engine
  const scheduler = audio.getScheduler();
  const scheduledSegmentEngine = new audio.SegmentEngine({
    buffer: audioBuffer,
    periodAbs: eighthBeatDuration,
    periodRel: 0,
    positionArray: markerBuffer.time,
    durationArray: markerBuffer.duration
  });
  scheduledSegmentEngine.connect(audioContext.destination);

  // create transport with play control and transported segment engine
  const transportedSegmentEngine = new audio.SegmentEngine({
    buffer: audioBuffer,
    positionArray: markerBuffer.time,
    durationArray: markerBuffer.duration,
    cyclic: true
  });
  const playControl = new audio.PlayControl(transportedSegmentEngine);
  transportedSegmentEngine.connect(audioContext.destination);

  // create GUI elements
  new controllers.Title({
    label: 'Segment Engine in Scheduler',
    container: container,
  });

  new controllers.Toggle({
    label: 'Enable',
    default: false,
    container: container,
    callback: value => {
      if (value)
        scheduler.add(scheduledSegmentEngine);
      else
        scheduler.remove(scheduledSegmentEngine);
    },
  });

  new controllers.Slider({
    label: 'Segment Index',
    min: 0,
    max: 16,
    step: 1,
    default: 0,
    unit: '',
    size: '',
    container: container,
    callback: value => scheduledSegmentEngine.segmentIndex = value,
  });

  new controllers.Slider({
    label: 'Period',
    min: 0.010,
    max: 1.000,
    step: 0.001,
    default: eighthBeatDuration,
    unit: 'sec',
    size: '',
    container: container,
    callback: value => scheduledSegmentEngine.periodAbs = value,
  });

  new controllers.Title({
    label: 'Segment Engine with Play Control',
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
    },
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

  new controllers.Title({
    label: 'Common Parameters',
    container: container,
  });

  new controllers.Slider({
    label: 'Position Var',
    min: 0,
    max: 0.050,
    step: 0.001,
    default: 0,
    unit: 'sec',
    size: '',
    container: container,
    callback: value => scheduledSegmentEngine.positionVar = transportedSegmentEngine.positionVar = value,
  });

  new controllers.Slider({
    label: 'Duration',
    min: 0,
    max: 100,
    step: 1,
    default: 100,
    unit: '%',
    size: '',
    container: container,
    callback: value => scheduledSegmentEngine.durationRel = transportedSegmentEngine.durationRel = 0.01 * value,
  });

  new controllers.Slider({
    label: 'Resampling',
    min: -2400,
    max: 2400,
    step: 1,
    default: 0,
    unit: 'cent',
    size: '',
    container: container,
    callback: value => scheduledSegmentEngine.resampling = transportedSegmentEngine.resampling = value,
  });

  new controllers.Slider({
    label: 'Resampling Var',
    min: 0,
    max: 1200,
    step: 1,
    default: 0,
    unit: 'cent',
    size: '',
    container: container,
    callback: value => scheduledSegmentEngine.resamplingVar = transportedSegmentEngine.resamplingVar = value,
  });
}

window.addEventListener('load', init);
