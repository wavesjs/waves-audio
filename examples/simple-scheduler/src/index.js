import * as audio from 'waves-audio';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');

const audioContext = audio.audioContext;
const scheduler = audio.getSimpleScheduler();
const container = '.controllers';

function createMetro(index) {
  const tempo = 30 + index * 30;

  // create metronome engine
  const metro = new audio.Metronome();
  metro.period = 60 / tempo;
  metro.gain = 0.3;
  metro.clickFreq = index * 666;
  metro.connect(audioContext.destination);

  // create GUI elements (enable/disable metronome)
  new controllers.Toggle({
    label: `Metronome ${index}`,
    default: false,
    container: container,
    callback: flag => {
      if (flag)
        scheduler.add(metro);
      else
        scheduler.remove(metro);
    }
  });

  const tempoSlider = new controllers.Slider({
    label: 'Tempo',
    min: 30,
    max: 240,
    step: 1,
    default: tempo,
    unit: 'bpm',
    container: container,
    callback: value => metro.period = 60 / value,
  });

  return metro;
}

// create three metronome engines
const engines = [];
engines.push(createMetro(1));
engines.push(createMetro(2));
engines.push(createMetro(3));

new controllers.TriggerButtons({
  label: '&nbsp;',
  options: ['Sync'],
  container: container,
  callback: value => engines.forEach(engine => engine.resetTime()),
});
