// This example shows a `PlayControl` as the master of four different engines.

var audioContext = wavesAudio.audioContext;
var loader = new wavesLoaders.SuperLoader(); // instantiate loader

loader.load(["http://wavesjs.github.io/assets/drum-loop.wav", "http://wavesjs.github.io/assets/drum-loop.json"])
  .then(function(loaded) {
    var audioBuffer = loaded[0];
    var markerBuffer = loaded[1];
    var beatDuration = audioBuffer.duration / 4;

    var metronome = new wavesAudio.Metronome();
    metronome.period = beatDuration;
    metronome.connect(audioContext.destination);

    var playerEngine = new wavesAudio.PlayerEngine({
      buffer: audioBuffer,
      centered: false,
      cyclic: true
    });
    playerEngine.connect(audioContext.destination);

    var granularEngine = new wavesAudio.GranularEngine({
      buffer: audioBuffer,
      cyclic: true
    });
    granularEngine.connect(audioContext.destination);

    var segmentEngine = new wavesAudio.SegmentEngine({
      buffer: audioBuffer,
      positionArray: markerBuffer.time,
      durationArray: markerBuffer.duration,
      cyclic: true
    });
    segmentEngine.connect(audioContext.destination);

    var playControl = new wavesAudio.PlayControl(metronome);
    playControl.setLoopBoundaries(0, 2 * audioBuffer.duration);
    playControl.loop = true;

    var scheduler = new wavesAudio.getScheduler();
    var positionDisplay = new wavesAudio.TimeEngine();
    positionDisplay.period = 0.05;

    positionDisplay.advanceTime = function(time) {
      seekSlider.value = 0.01 * Math.floor(100 * playControl.currentPosition / beatDuration); 
      return time + this.period;
    };

    new wavesBasicControllers.Buttons("Play", ['Start', 'Pause', 'Stop'], '#container', function(value) {
      switch (value) {
        case 'Start':
          playControl.start();
          if (positionDisplay.master === null)
            scheduler.add(positionDisplay);
          break;

        case 'Pause':
          playControl.pause();
          if (positionDisplay.master !== null)
            scheduler.remove(positionDisplay);
          break;

        case 'Stop':
          playControl.stop();
          if (positionDisplay.master !== null)
            scheduler.remove(positionDisplay);
          break;
      }
    });

    var speedSlider = new wavesBasicControllers.Slider("Speed", -2, 2, 0.01, 1, "", '', '#container', function(value) {
      playControl.speed = value;
      speedSlider.value = playControl.speed;
    });

    var seekSlider = new wavesBasicControllers.Slider("Seek", 0, 8, 0.125, 0, "beats", 'large', '#container', function(value) {
      playControl.seek(value * beatDuration);
    });

    new wavesBasicControllers.Slider("Loop Start", 0, 8, 0.25, 0, "beats", 'large', '#container', function(value) {
      playControl.loopStart = value * beatDuration;
    });

    new wavesBasicControllers.Slider("Loop End", 0, 8, 0.25, 8, "beats", 'large', '#container', function(value) {
      playControl.loopEnd = value * beatDuration;
    });

    new wavesBasicControllers.Buttons("Choose Engine", ['Metronome', 'Player Engine', 'Granular Engine', 'Segment Engine'], '#container', function(value) {
      switch (value) {
        case 'Metronome':
          playControl.set(metronome);
          break;

        case 'Player Engine':
          playControl.set(playerEngine);
          break;

        case 'Granular Engine':
          playControl.set(granularEngine);
          break;

        case 'Segment Engine':
          playControl.set(segmentEngine);
          break;
      }
    });
  });
