// This example shows a *scheduled* and a *transported* `Metronome`.

var audioContext = wavesAudio.audioContext;

var scheduler = wavesAudio.getScheduler();
var scheduledMetronome = new wavesAudio.Metronome();
scheduledMetronome.period = 60 / 90;
scheduledMetronome.clickFreq = 666;
scheduledMetronome.connect(audioContext.destination);

new wavesBasicControllers.Toggle("Scheduled Metronome", false, '#container', function(value) {
  if (value)
    scheduler.add(scheduledMetronome);
  else
    scheduler.remove(scheduledMetronome);
});

new wavesBasicControllers.Slider("Metronome Tempo", 30, 240, 1, 90, "bpm", '', '#container', function(value) {
  scheduledMetronome.period = 60 / value;
});

var transport = new wavesAudio.Transport();
var playControl = new wavesAudio.PlayControl(transport);

var transportedMetronome = new wavesAudio.Metronome();
transportedMetronome.period = 60 / 90;
transportedMetronome.clickFreq = 500;
transportedMetronome.connect(audioContext.destination);
transport.add(transportedMetronome);

new wavesBasicControllers.Toggle("Transported Metronome", false, '#container', function(value) {
  if (value)
    playControl.start();
  else
    playControl.stop();
});

new wavesBasicControllers.Slider("Transport Speed", 0, 2, 0.01, 1, "", '', '#container', function(value) {
  playControl.speed = value;
  return playControl.speed;
});

new wavesBasicControllers.Slider("Metronome Tempo", 30, 240, 1, 90, "bpm", '', '#container', function(value) {
  transportedMetronome.period = 60 / value;
});

new wavesBasicControllers.Slider("Metronome Phase", 0, 1, 0.01, 0, "", '', '#container', function(value) {
  transportedMetronome.phase = value;
});