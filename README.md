# WAVES - AUDIO

_audio part of the `wavesjs` library._

## Documentation

[http://wavesjs.github.io/audio/](http://wavesjs.github.io/audio/)

## Use

#### CommonJS (browserify)

install with npm

```bash
npm install --save wavesjs/audio
```

consume in your modules

```javascript
var wavesUI = require('waves-audio');
```

#### AMD (requireJS)

add the waves library to your config

```javascript
requirejs.config({
  paths: {
    waves: 'path/to/waves-audio.umd'
  }
});
```

consume in your modules

```javascript
define(['waves-audio'], function(wavesAudio) {
  var timeEngine = new wavesAudio.TimeEngine();
  // ...
});
```

#### Global

add the script tag in your at the bottom of the `<body>`

```html
<script scr="/path/to/waves-audio.umd.js"></script>
```

the library is exposed in the `window.wavesAudio` namespace

## List of components

#### core

- `audioContext`
- `TimeEngine`
- `AudioTimeEngine`

#### utils

- `PriorityQueue`

#### masters

- `SimpleScheduler`
- `Scheduler`
- `Transport`      
- `PlayControl`

#### engines

- `Metronome`
- `GranularEngine`
- `SegmentEngine`
- `PlayerEngine`

## License

This module is released under the BSD-3-Clause license.

Acknowledgments

This code has been developed in the framework of the WAVE and CoSiMa research projects, funded by the French National Research Agency (ANR).
