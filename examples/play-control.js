// This example shows a `PlayControl` as the master of four different engines.

var audioContext = wavesAudio.audioContext;
var loader = new wavesLoaders.SuperLoader();
var containerId = '#play-control-container';

// load audio and marker files
loader.load(["http://wavesjs.github.io/assets/drum-loop.wav", "http://wavesjs.github.io/assets/drum-loop.json"])
  .then(function(loaded) {
    var audioBuffer = loaded[0];
    var markerBuffer = loaded[1];
    var beatDuration = audioBuffer.duration / 4;

    // create and connect metronome engine
    var metronome = new wavesAudio.Metronome();
    metronome.period = beatDuration;
    metronome.connect(audioContext.destination);

    // create and connect player engine
    var playerEngine = new wavesAudio.PlayerEngine({
      buffer: audioBuffer,
      centered: false,
      cyclic: true
    });
    playerEngine.connect(audioContext.destination);

    // create and connect granular engine
    var granularEngine = new wavesAudio.GranularEngine({
      buffer: audioBuffer,
      cyclic: true
    });
    granularEngine.connect(audioContext.destination);

    // create and connect segment engine
    var segmentEngine = new wavesAudio.SegmentEngine({
      buffer: audioBuffer,
      positionArray: markerBuffer.time,
      durationArray: markerBuffer.duration,
      cyclic: true
    });
    segmentEngine.connect(audioContext.destination);

    // create play control
    var playControl = new wavesAudio.PlayControl(metronome);
    playControl.setLoopBoundaries(0, 2 * audioBuffer.duration);
    playControl.loop = true;

    // create position display (as scheduled TimeEngine)
    var scheduler = new wavesAudio.getScheduler();
    var positionDisplay = new wavesAudio.TimeEngine();
    positionDisplay.period = 0.05;

    positionDisplay.advanceTime = function(time) {
      seekSlider.value = (playControl.currentPosition / beatDuration).toFixed(2);
      return time + this.period;
    };

    // create GUI elements
    new wavesBasicControllers.Buttons("Play", ['Start', 'Pause', 'Stop'], containerId, function(value) {
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

    var speedSlider = new wavesBasicControllers.Slider("Speed", -2, 2, 0.01, 1, "", '', containerId, function(value) {
      playControl.speed = value;
      speedSlider.value = playControl.speed;
    });

    var seekSlider = new wavesBasicControllers.Slider("Seek", 0, 8, 0.125, 0, "beats", 'large', containerId, function(value) {
      playControl.seek(value * beatDuration);
    });

    new wavesBasicControllers.Slider("Loop Start", 0, 8, 0.25, 0, "beats", 'large', containerId, function(value) {
      playControl.loopStart = value * beatDuration;
    });

    new wavesBasicControllers.Slider("Loop End", 0, 8, 0.25, 8, "beats", 'large', containerId, function(value) {
      playControl.loopEnd = value * beatDuration;
    });

    new wavesBasicControllers.Buttons("Choose Engine", ['Metronome', 'Player Engine', 'Granular Engine', 'Segment Engine'], containerId, function(value) {
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
