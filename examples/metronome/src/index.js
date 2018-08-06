import * as audio from 'waves-audio';
import * as loaders from 'waves-loaders';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');
const audioContext = audio.audioContext;
const container = '.controllers';

// get scheduler and create scheduled metronome
const scheduler = audio.getScheduler();
const scheduledMetronome = new audio.Metronome();
scheduledMetronome.period = 60 / 90;
scheduledMetronome.clickFreq = 666;
scheduledMetronome.connect(audioContext.destination);

// create transport with play control and transported metronome
const transportedMetronome = new audio.Metronome();
transportedMetronome.period = 60 / 90;
transportedMetronome.clickFreq = 500;
transportedMetronome.connect(audioContext.destination);
const playControl = new audio.PlayControl(transportedMetronome);

// create GUI elements
new controllers.Title({
  label: 'Metronome in Scheduler',
  container: container,
});

new controllers.Toggle({
  label: 'Enable',
  default: false,
  container: container,
  callback: value => {
    if (value)
      scheduler.add(scheduledMetronome);
    else
      scheduler.remove(scheduledMetronome);
  }
});

new controllers.Slider({
  label: 'Tempo',
  min: 30,
  max: 240,
  step: 1,
  default: 90,
  unit: 'bpm',
  size: 'large',
  container: container,
  callback: value => {
    scheduledMetronome.period = 60 / value;
  }
});

new controllers.Title({
  label: 'Metronome with Play Control',
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
  min: 0,
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

new controllers.Slider({
  label: 'Tempo',
  min: 30,
  max: 240,
  step: 1,
  default: 90,
  unit: 'bpm',
  size: 'large',
  container: container,
  callback: value => {
    transportedMetronome.period = 60 / value;
  }
});

new controllers.Slider({
  label: 'Phase',
  min: 0,
  max: 1,
  step: 0.01,
  default: 0,
  size: 'large',
  container: container,
  callback: value => {
    transportedMetronome.phase = value;
  }
});
