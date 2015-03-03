# WAVES - AUDIO

_audio part of the `wavesjs` library._

## Documentation

[https://ircam-rnd.github.io/waves/audio](https://ircam-rnd.github.io/waves/audio)

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


## Custom build

to create your own custom build, you need to
remove/comment all the component you don't need in `waves-audio.js`, then run

```bash
npm run bundle
```

_`core/timeline`, `core/layer`, and `helpers/utils` are mandatory_

## List of components

#### core

- `audioContext`
- `TimeEngine`

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

This code is part of the WAVE project, funded by ANR (The French National Research Agency).
