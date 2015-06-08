// monkeypatch old webAudioAPI
require('./ac-monkeypatch');

// exposes a single instance
var audioContext;

if (window.AudioContext)
  audioContext = new window.AudioContext();

module.exports = audioContext;