// This example shows three `Metronome` engines running in a `SimpleScheduler`.

(function() {
  var audioContext = wavesAudio.audioContext;
  var scheduler = wavesAudio.getSimpleScheduler();
  var containerId = '#simple-scheduler-container';

  function createMetro(index) {
    var tempo = 30 + index * 30;

    // create metronome engine
    var metro = new wavesAudio.Metronome();
    metro.period = 60 / tempo;
    metro.gain = 0.3;
    metro.clickFreq = index * 666;
    metro.connect(audioContext.destination);

    // create GUI elements
    new wavesBasicControllers.Toggle("Metronome " + index, false, containerId, function(value) {
      if (value)
        scheduler.add(metro);
      else
        scheduler.remove(metro);
    });

    var tempoSlider = new wavesBasicControllers.Slider("Tempo", 30, 240, 1, tempo, "bpm", '', containerId, function(value) {
      metro.period = 60 / value;
    });

    return metro;
  }

  // create three metronome engines
  var engines = [];
  engines.push(createMetro(1));
  engines.push(createMetro(2));
  engines.push(createMetro(3));

  new wavesBasicControllers.Buttons("", ['Sync'], containerId, function(value) {
    engines.forEach(function(element) {
      element.resetTime();
    });
  });
})();