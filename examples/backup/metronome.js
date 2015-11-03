// This example shows a *scheduled* and a *transported* `Metronome`.

(function() {
  var audioContext = wavesAudio.audioContext;
  var containerId = '#metronome-container';

  // get scheduler and create scheduled metronome
  var scheduler = wavesAudio.getScheduler();
  var scheduledMetronome = new wavesAudio.Metronome();
  scheduledMetronome.period = 60 / 90;
  scheduledMetronome.clickFreq = 666;
  scheduledMetronome.connect(audioContext.destination);

  // create transport with play control and transported metronome
  var transportedMetronome = new wavesAudio.Metronome();
  transportedMetronome.period = 60 / 90;
  transportedMetronome.clickFreq = 500;
  transportedMetronome.connect(audioContext.destination);
  var playControl = new wavesAudio.PlayControl(transportedMetronome);

  // create GUI elements
  new wavesBasicControllers.Title("Metronome in Scheduler", containerId);

  new wavesBasicControllers.Toggle("Enable", false, containerId, function(value) {
    if (value)
      scheduler.add(scheduledMetronome);
    else
      scheduler.remove(scheduledMetronome);
  });

  new wavesBasicControllers.Slider("Tempo", 30, 240, 1, 90, "bpm", '', containerId, function(value) {
    scheduledMetronome.period = 60 / value;
  });

  new wavesBasicControllers.Title("Metronome with Play Control", containerId);

  new wavesBasicControllers.Toggle("Play", false, containerId, function(value) {
    if (value)
      playControl.start();
    else
      playControl.stop();
  });

  var speedSlider = new wavesBasicControllers.Slider("Speed", 0, 2, 0.01, 1, "", '', containerId, function(value) {
    playControl.speed = value;
    speedSlider.value = playControl.speed;
  });

  new wavesBasicControllers.Slider("Tempo", 30, 240, 1, 90, "bpm", '', containerId, function(value) {
    transportedMetronome.period = 60 / value;
  });

  new wavesBasicControllers.Slider("Phase", 0, 1, 0.01, 0, "", '', containerId, function(value) {
    transportedMetronome.phase = value;
  });
})();