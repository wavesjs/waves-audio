// This example shows a `TimeEngine` running in a `Scheduler` that counts up at a given frequency.

var audioContext = wavesAudio.audioContext;
var scheduler = wavesAudio.getScheduler();

// Counter TimeEngine class
// The engine counts up at a given frequency.
// When the frequency changes, the engine is rescheduled accordingly.
function Counter() {
  // call TimeEngine constructor
  wavesAudio.TimeEngine.call(this);

  this.count = 0; // current count
  this.period = 0; // current period
  this.lastTime = 0; // last counter time
}

// extend TimeEngine prototype
Counter.prototype = Object.create(wavesAudio.TimeEngine.prototype, {
  constructor: {
    value: Counter,
  },
});

// TimeEngine scheduled interface method
Counter.prototype.advanceTime = function(time) {
  var count = this.count;

  counterSlider.value = count;

  // increment counter
  count = (count + 1) % 100;
  this.count = count;

  // remeber time to reschedule properly when changing frequency
  this.lastTime = time;

  // advance to next time
  return time + this.period;
};

// set frequency method
Counter.prototype.setFreq = function(freq) {
  var period = 0;

  // set period
  if (freq > 0)
    period = 1 / freq;

  if (period > 0 && this.period === 0)
    this.resetTime(); // start counter now
  else if (period === 0 && this.period > 0)
    this.resetTime(Infinity); // stop counter
  else if (period > 0) {
    // continue playing with new period
    var nextTime = this.lastTime + period;

    // reschedule counter according to new period (when next time > current scheduler time)
    if (nextTime > scheduler.currentTime)
      this.resetTime(nextTime);
  }

  this.period = period;
};

var counter = new Counter(); // instantiate Counter TimeEngine
scheduler.add(counter, Infinity);

new wavesBasicControllers.Slider("Frequency", 0, 250, 1, 0, "Hz", '', '#container', function(value) {
  counter.setFreq(value);
});

counterSlider = new wavesBasicControllers.Slider("", 0, 99, 1, 0, "", '', '#container');