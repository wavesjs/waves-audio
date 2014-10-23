
<script>
var transport = new Transport();
var playControl = new PlayControl(transport);
var isRunning = false;
var isTransported = false;
var engine = new GranularEngine();

function switchRunning(willBeRunning) {
  if (!willBeRunning) {
    if (!isTransported)
      scheduler.remove(engine);
    else
      transport.remove(engine);
  } else {
    if (!isTransported)
      scheduler.add(engine);
    else
      transport.add(engine);
  }

  isRunning = willBeRunning;
}

function switchTransported(willBeTransported) {
  if (isRunning) {
    if (!willBeTransported && isTransported) {
      transport.remove(engine);
      scheduler.add(engine);
    } else if (willBeTransported && !isTransported) {
      scheduler.remove(engine);
      transport.add(engine);
    }
  }

  isTransported = willBeTransported;
}

/*** time display ***/
var timeDisplay = new TimeEngine();
timeDisplay.period = 0.01;
timeDisplay.syncPosition = function(time, position, speed) {
  var nextPosition = Math.floor(position / this.period) * this.period;

  if (speed > 0 && nextPosition < position)
    nextPosition += this.period;
  else if (speed < 0 && nextPosition > position)
    nextPosition -= this.period;

  return nextPosition;
};
timeDisplay.advancePosition = function(time, position, speed) {
  document.querySelector('#display-position').innerHTML = parseFloat(position).toFixed(2);

  if (speed < 0)
    return position - this.period;

  return position + this.period;
};

transport.add(timeDisplay);


 // Load the file passing the path
 var audioContext = new AudioContext();

new loaders.AudioBufferLoader()
  .load('./snd/demo.wav')
  .then(function(audioBuffer) {
    console.log("laod ok");
    engine.buffer = audioBuffer;
    console.log(engine);
    engine.connect(audioContext.destination);
	
	
    document.querySelector('#gran-enable')
      .addEventListener('change', function() {
        switchRunning(this.checked);
      });

    document.querySelector('#gran-trans')
      .addEventListener('change', function() {
        switchTransported(this.checked);
      });

    document.querySelector('#gran-position')
      .addEventListener('input', function() {
        engine.position = parseFloat(this.value) * engine.buffer.duration;
      });

    document.querySelector('#gran-position-var')
      .addEventListener('input', function() {
        engine.positionVar = parseFloat(this.value);
      });

    document.querySelector('#gran-period')
      .addEventListener('input', function() {
        engine.periodAbs = parseFloat(this.value);
      });

    document.querySelector('#gran-duration')
      .addEventListener('input', function() {
        engine.durationAbs = parseFloat(this.value);
      });

    document.querySelector('#gran-resampling')
      .addEventListener('input', function() {
        engine.resampling = parseFloat(this.value);
      });

    document.querySelector('#gran-resampling-var')
      .addEventListener('input', function() {
        engine.resamplingVar = parseFloat(this.value);
      });

    /*** control transport ***/
    document.querySelector('#trans-enable')
      .addEventListener('change', function() {
      	console.log("play");
        if (this.checked)
          playControl.start();
        else
          playControl.stop();
      });

    document.querySelector('#trans-speed')
      .addEventListener('input', function() {
        playControl.speed = (+this.value);
      });

    document.querySelector('#trans-seek')
      .addEventListener('input', function() {
        var pos = +this.value * 10;
        document.querySelector('#display-position').innerHTML = parseFloat(pos).toFixed(2);
        playControl.seek(pos);
      });
  },
  function(error){
        console.log(error);
      }
  );
</script>

<p><input type="checkbox" id="gran-enable"><label for="gran-enable">Enable</label> | </p>
<p><input type="checkbox" id="gran-trans"><label for="gran-trans">in Transport</label><br></p>
<p><input type="range" id="gran-position" min="0" max="1" value="0" step="0.001"><label for="gran-position">Position</label><br></p>
<p><input type="range" id="gran-position-var" min="0" max="0.2" value="0.003" step="0.001"><label for="gran-position-var">Position Var</label><br></p>
<p><input type="range" id="gran-period" min="0.001" max="0.5" value="0.01" step="0.001"><label for="gran-period">Period</label><br></p>
<p><input type="range" id="gran-duration" min="0.010" max="0.5" value="0.2" step="0.001"><label for="gran-duration">Duration</label><br></p>
<p><input type="range" id="gran-resampling" min="-2400" max="2400" value="0" step="1"><label for="gran-resampling">Resampling</label><br></p>
<p><input type="range" id="gran-resampling-var" min="0" max="1200" value="0" step="0.001"><label for="gran-resampling-var">Resampling Var</label><br></p>
<p><input type="checkbox" id="trans-enable"><label for="trans-enable">Transport</label> |</p>
<p><input type="range" step="0.01" min="-2" max="2" value="1" id="trans-speed"><label for="trans-speed">Speed</label> | </p>
<p><input type="range" step="0.001" min="0" max="1" value="0" id="trans-seek"><label for="trans-seek">Seek</label> | 
<span id="display-position">0</span><label for="display-position">Position (sec)</label> | 
<br></p>