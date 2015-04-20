// This example shows an `AudioTimeEngine` running in a `Scheduler` that repeats the waveform of a given vowel – cut outof a voice recording – at a given frequency.

var audioContext = wavesAudio.audioContext;
var scheduler = wavesAudio.getScheduler();

// Synth AudioTimeEngine class
// The engine repeats a waveform at a given frequency.
// When the frequency changes, the engine is rescheduled accordingly.
function Synth() {
  // call AudioTimeEngine constructor
  wavesAudio.AudioTimeEngine.call(this);

  this.waveform = null; // current waveform
  this.period = 0; // current period
  this.lastTime = 0; // last waveform synth time
}

// extend AudioTimeEngine prototype
Synth.prototype = Object.create(wavesAudio.AudioTimeEngine.prototype, {
  constructor: {
    value: Synth,
  },
});

// AudioTimeEngine scheduled interface method
Synth.prototype.advanceTime = function(time) {
  var s = audioContext.createBufferSource();

  // play current waveform at given time
  s.buffer = this.waveform;
  s.connect(audioContext.destination);
  s.start(time);

  // remeber time to reschedule properly when changing frequency
  this.lastTime = time;

  // advance to next time
  return time + this.period;
};

// set frequency method
Synth.prototype.setFreq = function(freq) {
  var period = 0;

  // set period
  if (freq > 0)
    period = 1 / freq;

  if (period > 0 && this.period === 0)
    this.resetTime(); // start synth now
  else if (period === 0 && this.period > 0)
    this.resetTime(Infinity); // stop synth
  else if (period > 0) {
    // continue playing with new period
    var nextTime = this.lastTime + period;

    // reschedule synth according to new period (when next time > current scheduler time)
    if (nextTime > scheduler.currentTime)
      this.resetTime(nextTime);
  }

  this.period = period;
};

// load three waveforms corresponding to the vowels 'A', I, and O
var files = [
  "http://wavesjs.github.io/assets/wave-a.wav",
  "http://wavesjs.github.io/assets/wave-o.wav",
  "http://wavesjs.github.io/assets/wave-i.wav"
];

var loader = new wavesLoaders.AudioBufferLoader(); // instantiate loader
loader.load(files)
  .then(function(loaded) {
    var waveforms = {}; // dict of loaded waveforms
    waveforms['A'] = loaded[0];
    waveforms['O'] = loaded[1];
    waveforms['I'] = loaded[2];

    // set current waveform of synth to 'A'
    var synth = new Synth(); // instantiate Synth AudioTimeEngine
    synth.waveform = waveforms['A'];

    scheduler.add(synth, Infinity);

    new wavesBasicControllers.Slider("Frequency", 0, 250, 1, 0, "Hz", '', '#container', function(value) {
      synth.setFreq(value);
    });

    new wavesBasicControllers.Buttons("Vowel", ['A', 'O', 'I'], '#container', function(value) {
      synth.waveform = waveforms[value];
    });
  });