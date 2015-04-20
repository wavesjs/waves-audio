// This example shows a `GranularEngine` with a few parameter controls running in a `Scheduler`.

var audioContext = wavesAudio.audioContext;
var loader = new wavesLoaders.AudioBufferLoader(); // instantiate loader

loader.load("http://wavesjs.github.io/assets/hendrix.wav")
  .then(function(loaded) {
    var scheduler = wavesAudio.getScheduler();
    var granular = new wavesAudio.GranularEngine();
    granular.buffer = loaded;
    granular.connect(audioContext.destination);

    new wavesBasicControllers.Toggle("Enable", false, '#container', function(value) {
      if (value)
        scheduler.add(granular);
      else
        scheduler.remove(granular);
    });

    new wavesBasicControllers.Slider("Position", 0, 20.6, 0.010, 0, "sec", 'large', '#container', function(value) {
      granular.position = value;
    });

    new wavesBasicControllers.Slider("Position Var", 0, 0.200, 0.001, 0.003, "sec", '', '#container', function(value) {
      granular.positionVar = value;
    });

    new wavesBasicControllers.Slider("Period", 0.001, 0.500, 0.001, 0.010, "sec", '', '#container', function(value) {
      granular.periodAbs = value;
    });

    new wavesBasicControllers.Slider("Duration", 0.010, 0.500, 0.001, 0.100, "sec", '', '#container', function(value) {
      granular.durationAbs = value;
    });

    new wavesBasicControllers.Slider("Resampling", -2400, 2400, 1, 0, "cent", '', '#container', function(value) {
      granular.resampling = value;
    });

    new wavesBasicControllers.Slider("Resampling Var", 0, 1200, 1, 0, "cent", '', '#container', function(value) {
      granular.resamplingVar = value;
    });
  });