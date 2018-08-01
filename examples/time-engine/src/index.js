import * as audio from 'waves-audio';
import * as controllers from '@ircam/basic-controllers';

controllers.setTheme('dark');

const audioContext = audio.audioContext;
const scheduler = audio.getScheduler();
const container = '.controllers';

// Counter TimeEngine class
// The engine counts up at a given frequency.
// When the frequency changes, the engine is rescheduled accordingly.
class Counter extends audio.TimeEngine {
  constructor() {
    super();

    this.count = 0; // current count
    this.period = 0; // current period
    this.lastTime = 0; // last counter time
  }

  advanceTime(time) {
    let count = this.count;

    counterSlider.value = count;
    // increment counter
    count = (count + 1) % 100;
    this.count = count;

    // remeber time to reschedule properly when changing frequency
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
      this.resetTime(); // start counter now
    } else if (period === 0 && this.period > 0) {
      this.resetTime(Infinity); // stop counter
    } else if (period > 0) {
      // continue playing with new period
      const nextTime = this.lastTime + period;

      // reschedule counter according to new period (when next time > current scheduler time)
      if (nextTime > scheduler.currentTime)
        this.resetTime(nextTime);
    }

    this.period = period;
  }
}

// create counter engine and add it to the scheduler without running it (i.e. at Infinity)
const counter = new Counter();
scheduler.add(counter, Infinity);

new controllers.Slider({
  label: 'Frequency',
  min: 0,
  max: 250,
  step: 1,
  default: 0,
  unit: 'Hz',
  container: container,
  callback: value => counter.setFreq(value),
});

const counterSlider = new controllers.Slider({
  label: 'Counter',
  min: 0,
  max: 99,
  step: 1,
  default: 0,
  unit: '',
  container: container,
  callback: value => counter.count = value,
});
