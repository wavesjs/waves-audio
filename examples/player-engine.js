// This example shows simple audio player composed of a `PlayerEngine` and a `PlayControl`.

var audioContext = wavesAudio.audioContext;
var loader = new wavesLoaders.AudioBufferLoader(); // instantiate loader

loader.load("http://wavesjs.github.io/assets/drum-loop.wav")
  .then(function(audioBuffer) {
    var beatDuration = audioBuffer.duration / 4;
    var playerEngine = new wavesAudio.PlayerEngine();
    playerEngine.buffer = audioBuffer;
    playerEngine.cyclic = true;
    playerEngine.connect(audioContext.destination);

    var playControl = new wavesAudio.PlayControl(playerEngine);
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

    var speedSlider = new wavesBasicControllers.Slider("Speed", 0.5, 2, 0.01, 1, "", '', '#container', function(value) {
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
  });