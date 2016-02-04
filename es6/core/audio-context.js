var AudioContext = window.webkitAudioContext || window.AudioContext;
var audioContext = null;

if(AudioContext) {
  audioContext = new AudioContext();

  if (/(iPhone|iPad)/i.test(navigator.userAgent) && audioContext.sampleRate !== 44100) {
    var buffer = audioContext.createBuffer(1, 1, 44100);
    var dummy = audioContext.createBufferSource();
    dummy.buffer = buffer;
    dummy.connect(audioContext.destination);
    dummy.start(0);
    dummy.disconnect();
    audioContext.close();
    audioContext = new AudioContext();
  }
}

export default audioContext;
