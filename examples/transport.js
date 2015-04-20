// This example shows four different engines running synchronized in a `Transport`.

var audioContext = wavesAudio.audioContext;
var loader = new wavesLoaders.SuperLoader();

loader.load(["http://wavesjs.github.io/assets/drum-loop.wav", "http://wavesjs.github.io/assets/drum-loop.json"])
  .then(function(loaded) {
    var audioBuffer = loaded[0];
    var markerBuffer = loaded[1];
    var beatDuration = audioBuffer.duration / 4;

    var transport = new wavesAudio.Transport();
    var playControl = new wavesAudio.PlayControl(transport);
    playControl.setLoopBoundaries(0, 2 * audioBuffer.duration);
    playControl.loop = true;

    var metronome = new wavesAudio.Metronome();
    metronome.period = beatDuration;
    metronome.connect(audioContext.destination);
    transport.add(metronome);

    var playerEngine = new wavesAudio.PlayerEngine({
      buffer: audioBuffer,
      cyclic: true
    });
    playerEngine.connect(audioContext.destination);
    transport.add(playerEngine);

    var granularEngine = new wavesAudio.GranularEngine({
      buffer: audioBuffer,
      centered: false, // to be synchronous with other engines
      cyclic: true
    });
    granularEngine.connect(audioContext.destination);
    transport.add(granularEngine);

    var segmentEngine = new wavesAudio.SegmentEngine({
      buffer: audioBuffer,
      cyclic: true,
      positionArray: markerBuffer.time,
      durationArray: markerBuffer.duration
    });
    segmentEngine.connect(audioContext.destination);
    transport.add(segmentEngine);

    var positionDisplay = new wavesAudio.TimeEngine();
    positionDisplay.period = 0.01 * beatDuration;

    positionDisplay.syncPosition = function(time, position, speed) {
      var nextPosition = Math.floor(position / this.period) * this.period;

      if (speed > 0 && nextPosition < position)
        nextPosition += this.period;
      else if (speed < 0 && nextPosition > position)
        nextPosition -= this.period;

      return nextPosition;
    };

    positionDisplay.advancePosition = function(time, position, speed) {
      seekSlider.value = playControl.currentPosition / beatDuration;

      if (speed < 0)
        return position - this.period;

      return position + this.period;
    };

    transport.add(positionDisplay);

    new wavesBasicControllers.Toggle("Play", false, '#container', function(value) {
      if (value)
        playControl.start();
      else
        playControl.stop();
    });

    speedSlider = new wavesBasicControllers.Slider("Speed", -2, 2, 0.01, 1, "", '', '#container', function(value) {
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

    new wavesBasicControllers.Toggle("Metronome", true, '#container', function(value) {
      if (value)
        transport.add(metronome);
      else
        transport.remove(metronome);
    });

    new wavesBasicControllers.Toggle("Player Engine", true, '#container', function(value) {
      if (value)
        transport.add(playerEngine);
      else
        transport.remove(playerEngine);
    });

    new wavesBasicControllers.Toggle("Granular Engine", true, '#container', function(value) {
      if (value)
        transport.add(granularEngine);
      else
        transport.remove(granularEngine);
    });

    new wavesBasicControllers.Toggle("Segment Engine", true, '#container', function(value) {
      if (value)
        transport.add(segmentEngine);
      else
        transport.remove(segmentEngine);
    });
  });