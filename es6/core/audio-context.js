// monkeypatch old webAudioAPI
require('./ac-monkeypatch');

// exposes a single instance
var audioContext;

if(AudioContext)
  audioContext = new AudioContext();

module.exports = audioContext;