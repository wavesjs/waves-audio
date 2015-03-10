var assert = require('assert');
var sinon = require('sinon');

var audioContext = require('../es6/core/audio-context');
var GranularEngine = require('../es6/engines/granular-engine');

describe("GranularEngine", function() {
	afterEach(function() {
		this.sinon = sinon.sandbox.restore();
	});

	beforeEach(function() {
		this.sinon = sinon.sandbox.create();
	});

	it("should get buffer duration properly", function() {
		var channels = 2;
		var frameCount = audioContext.sampleRate * 4.0;
		var myArrayBuffer = audioContext.createBuffer(channels, frameCount,
			audioContext.sampleRate);
		var ge = new GranularEngine(myArrayBuffer);

		assert.equal(myArrayBuffer.duration, ge.bufferDuration);
		assert.equal(myArrayBuffer.duration, ge.buffer.duration);
		assert.equal(myArrayBuffer.duration, ge.playbackLength);
	});

	it("should get buffer duration properly considering wrap around extension",
		function() {

			var wrap = 2.0;

			// Taken from loaders
			var wrapAround = function(inBuffer) {
				var length = inBuffer.length + wrap * inBuffer.sampleRate,
					outBuffer = audioContext.createBuffer(inBuffer.numberOfChannels,
						length, inBuffer.sampleRate),
					arrayChData,
					arrayOutChData;

				for (var channel = 0; channel < inBuffer.numberOfChannels; channel++) {
					arrayChData = inBuffer.getChannelData(channel);
					arrayOutChData = outBuffer.getChannelData(channel);

					for (var index = 0; index < arrayOutChData.length; index++) {
						if (index < inBuffer.length)
							arrayOutChData[index] = arrayChData[index];
						else
							arrayOutChData[index] = arrayChData[index - inBuffer.length];
					}
				}
				return outBuffer;
			}

			var channels = 2;
			var frameCount = audioContext.sampleRate * 4.0;
			var myArrayBuffer = audioContext.createBuffer(channels, frameCount,
				audioContext.sampleRate);

			var buffer = wrapAround(myArrayBuffer);
			buffer.wrapAroundExtention = wrap;

			var ge = new GranularEngine(buffer);

			assert.equal(buffer.duration - buffer.wrapAroundExtention,
				ge.bufferDuration);
			assert.equal(buffer.duration - buffer.wrapAroundExtention,
				ge.playbackLength);
			assert.notEqual(buffer.duration, ge.bufferDuration);
		});

	it("should get position properly", function() {
		var ge1 = new GranularEngine();
		var ge2 = new GranularEngine();

		ge2.position = 2.0;

		// SHOULD TEST EFFECT FROM TRIGGER CALL
		assert.equal(ge1.position, ge1.currentPosition);
		assert.equal(ge2.position, ge2.currentPosition);
	});

	it("should set gain properly", function() {
		var ge = new GranularEngine();

		for (var i = 0; i < 100; i++) {
			// Assings random float number between 0 and 1 with 5 decimals precision
			var gainValue = Math.random(0, 1).toFixed(5);
			ge.gain = gainValue;

			// To fixed is used because float precision in web audio is too high
			assert.equal(gainValue, parseFloat(ge.gain).toFixed(5));
		}
	});

	it("should advance time properly", function() {
		var channels = 2;
		var frameCount = audioContext.sampleRate * 4.0;
		var myArrayBuffer = audioContext.createBuffer(channels, frameCount,
			audioContext.sampleRate);

		var ge = new GranularEngine(myArrayBuffer);

		// Advance time should always be the sum of the time value used and trigger 
		// return
		for (var i = 0; i < 100; i++) {
			var time = Math.random();
			assert.equal(time + ge.trigger(time), ge.advanceTime(time));
		}
	});

	it("trigger should return grainPeriod properly if no buffer", function() {
		var ge = new GranularEngine();

		// Without a buffer, trigger should always return pediodAbs
		for (var i = 0; i < 100; i++) {
			assert.equal(ge.trigger(Math.random()), ge.periodAbs); //For decimals
			assert.equal(ge.trigger(Math.random() * 10), ge.periodAbs); //Bigger time
		}
	});

	// Tests attributes on return value, time passed in params has no effect on 
	// return value
	it("trigger should return grainPeriod properly with buffer", function() {
		var channels = 2;
		var frameCount = audioContext.sampleRate * 4.0;
		var myArrayBuffer = audioContext.createBuffer(channels, frameCount,
			audioContext.sampleRate);

		var ge1 = new GranularEngine(myArrayBuffer);

		// By default, with a buffer, trigger should always return pediodAbs
		for (var i = 0; i < 100; i++) {
			assert.equal(ge1.periodAbs, ge1.trigger(Math.random()));
		}

		var ge2 = new GranularEngine(myArrayBuffer);
		// Changing periodAbs, periodRel and durationAbs should change value
		for (var i = 0; i < 100; i++) {
			ge2.pediodAbs = Math.random();
			ge2.periodRel = Math.random();
			ge2.durationAbs = Math.random();

			assert.equal(ge2.periodAbs + ge2.periodRel * ge2.durationAbs,
				ge2.trigger(Math.random()));
		}

		var ge3 = new GranularEngine(myArrayBuffer);
		// for xxxxVar elements trigger calls Math.random(), this function should 
		// be mocked in order to get the same result in this test
		sinon.stub(Math, "random", function() {
			return 0.55;
		});
		// Changing periodVar should induce 
		for (var i = 0; i < 100; i++) {
			ge3.periodVar = i / 100;

			if (ge3.periodVar > 0) {
				assert.equal(ge3.periodAbs + 2.0 * (Math.random() - 0.5) *
					ge3.periodVar * ge3.periodAbs, ge3.trigger(Math.random()));
			}
		}
	});

	it("should inspect audio node", function(done) {

		var channels = 2;
		var frameCount = audioContext.sampleRate * 10.0;
		var myArrayBuffer = audioContext.createBuffer(channels, frameCount,
			audioContext.sampleRate);

		// Generate sine wave for each channel
		for (var channel = 0; channel < channels; channel++) {
			var x = 0;
			var data = myArrayBuffer.getChannelData(channel);

			for (var i = 0; i < data.length; i++) {
				data[i] = Math.sin(x++);
			}
		}

		var ge = new GranularEngine(myArrayBuffer);

		// Analysers and process analysis
		var granularAnalyser = audioContext.createScriptProcessor(2048, 1, 1);
		var simulatedAnalyser = audioContext.createScriptProcessor(2048, 1, 1);

		function generateGrain() {
			ge.connect(granularAnalyser);
			granularAnalyser.connect(audioContext.destination);

			ge.trigger();
		}

		// Simulation of the trigger method algorithms taking by default paths 
		// (if/else)
		function simulateGrain() {
			var source = audioContext.createBufferSource();
			source.buffer = myArrayBuffer;

			var grainTime = audioContext.currentTime;
			var grainPeriod = ge.periodAbs;
			var grainPosition = ge.currentPosition;
			var grainDuration = ge.durationAbs;

			var resamplingRate = 1.0;

			grainPeriod += ge.periodRel * grainDuration;
			grainDuration += ge.durationRel * grainPeriod;

			grainPosition -= 0.5 * grainDuration;

			grainPosition += (2.0 * Math.random() - 1) * ge.positionVar;

			var bufferDuration = source.buffer.duration;

			grainTime -= grainPosition;
			grainDuration += grainPosition;
			grainPosition = 0;

			var envelopeNode = audioContext.createGainNode();
			var attack = ge.attackAbs + ge.attackRel * grainDuration;
			var release = ge.releaseAbs + ge.releaseRel * grainDuration;

			var attackEndTime = grainTime + attack;
			var grainEndTime = grainTime + grainDuration;
			var releaseStartTime = grainEndTime - release;

			envelopeNode.gain.setValueAtTime(0.0, grainTime);
			envelopeNode.gain.linearRampToValueAtTime(1.0, attackEndTime);

			envelopeNode.gain.linearRampToValueAtTime(0.0, grainEndTime);

			source.playbackRate.value = resamplingRate;

			source.connect(envelopeNode);
			envelopeNode.connect(simulatedAnalyser);
			simulatedAnalyser.connect(audioContext.destination);

			source.start(grainTime, grainPosition);
			source.stop(grainTime + grainDuration / resamplingRate);
		}

		var processed = [];
		var simulated = [];

		// Route audio through sript processor node for the granular and fill array
		function processAudio(e) {
			var bufferIn = e.inputBuffer.getChannelData(0);

			var bufferOut = e.outputBuffer.getChannelData(0);

			for (var i = 0; i <  bufferIn.length; i++) {
				if (bufferIn[i] != 0)
					processed.push(bufferIn[i]);
				bufferOut[i] = bufferIn[i];
			}
		}

		// Route audio through sript processor node for the simulated and fill array
		function simulateAudio(e) {
			var bufferIn = e.inputBuffer.getChannelData(0);

			var bufferOut = e.outputBuffer.getChannelData(0);

			for (var i = 0; i <  bufferIn.length; i++) {
				if (bufferIn[i] != 0)
					simulated.push(bufferIn[i]);
				bufferOut[i] = bufferIn[i];
			}
		}

		granularAnalyser.onaudioprocess = processAudio;
		simulatedAnalyser.onaudioprocess = simulateAudio;

		generateGrain();
		simulateGrain();

		setTimeout(function() {
			console.log("Granular Engine grain sample", processed);
			console.log("Simulated grain sample", simulated);
			assert.deepEqual(processed, simulated);
			done();
		}, 1.5);
	});

});