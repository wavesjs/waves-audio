// This example shows three `Metronome` engines running in a `SimpleScheduler`.


var audioContext = wavesAudio.audioContext;
var scheduler = wavesAudio.getSimpleScheduler();
var metros = [];

function makeMetroWithControls(index) {
  var metro = new wavesAudio.Metronome();
  metro.gain = 0.3;
  metro.clickFreq = index * 666;
  metro.connect(audioContext.destination);

  metros.push(metro);

  new wavesBasicControllers.Toggle("Metronome " + index, false, '#container', function(value) {
    if (value)
      scheduler.add(metro);
    else
      scheduler.remove(metro);
  });

  var tempoSlider = new wavesBasicControllers.Slider("Tempo", 30, 240, 1, 0, "bpm", '', '#container', function(value) {
    metro.period = 60 / value;
  });

  var tempo = 30 + index * 30;
  tempoSlider.value = tempo;
  metro.period = 60 / tempo;
}

for (var i = 1; i <= 3; i++)
  makeMetroWithControls(i);

new wavesBasicControllers.Buttons("", ['Sync'], '#container', function(value) {
  metros.forEach(function(element) {
    element.resetTime();
  });
});
