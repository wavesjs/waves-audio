// monkeypatch old webAudioAPI
import monkeyPatch from './ac-monkeypatch';

// exposes a single instance
var audioContext;

if (window.AudioContext)
  audioContext = new window.AudioContext();

export default audioContext;
