// monkeypatch old webAudioAPI
require('./ac-monkeypatch');
// exposes a single instance
module.exports = new AudioContext();