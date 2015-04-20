// This example shows a `SegmentEngine` with a few parameter controls running in a `Scheduler`.

var audioContext = wavesAudio.audioContext;
var loader = new wavesLoaders.SuperLoader(); // instantiate loader

loader.load(["http://wavesjs.github.io/assets/drum-loop.wav", "http://wavesjs.github.io/assets/drum-loop.json"])
  .then(function(loaded) {
    var scheduler = wavesAudio.getScheduler();
    var segment = new wavesAudio.SegmentEngine();
    segment.buffer = loaded[0];
    segment.periodAbs = 0.150;
    segment.periodRel = 0;
    segment.positionArray = loaded[1].time;
    segment.connect(audioContext.destination);

    new wavesBasicControllers.Toggle("Enable", false, '#container', function(value) {
      if (value)
        scheduler.add(segment);
      else
        scheduler.remove(segment);
    });

    new wavesBasicControllers.Slider("Segment Index", 0, 16, 1, 0, "", '', '#container', function(value) {
      segment.segmentIndex = value;
    });

    new wavesBasicControllers.Slider("Position Var", 0, 0.050, 0.001, 0, "sec", '', '#container', function(value) {
      segment.positionVar = value;
    });

    new wavesBasicControllers.Slider("Period", 0.010, 1.000, 0.001, 0.150, "sec", '', '#container', function(value) {
      segment.periodAbs = value;
    });

    new wavesBasicControllers.Slider("Duration", 0, 100, 1, 100, "%", '', '#container', function(value) {
      segment.durationRel = 0.01 * value;
    });

    new wavesBasicControllers.Slider("Resampling", -2400, 2400, 1, 0, "cent", '', '#container', function(value) {
      segment.resampling = value;
    });

    new wavesBasicControllers.Slider("Resampling Var", 0, 1200, 1, 0, "cent", '', '#container', function(value) {
      segment.resamplingVar = value;
    });
  });
