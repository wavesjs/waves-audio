// This example shows simple audio player composed of a `PlayerEngine` and a `PlayControl`.

(function() {
  var audioContext = wavesAudio.audioContext;
  var loader = new wavesLoaders.AudioBufferLoader(); // instantiate loader
  var containerId = '#player-engine-container';

  // load audio file
  loader.load("http://wavesjs.github.io/assets/drum-loop.wav")
    .then(function(audioBuffer) {
      var beatDuration = audioBuffer.duration / 4;

      // create player engine
      var playerEngine = new wavesAudio.PlayerEngine();
      playerEngine.buffer = audioBuffer;
      playerEngine.cyclic = true;
      playerEngine.connect(audioContext.destination);

      // create play control
      var playControl = new wavesAudio.PlayControl(playerEngine);
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

      var speedSlider = new wavesBasicControllers.Slider("Speed", 0.5, 2, 0.01, 1, "", '', containerId, function(value) {
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
    });
})();