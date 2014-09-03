

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## buffer

Audio buffer

## fadeTime

Fade time for chaining segments (e.g. in start, stop, and seek)

## speed(speed)

Set speed

### Params: 

* **Number** *speed* speed (a speed of 0 corrsponds to stop or pause)

## speed

Get current speed

### Return:

* **Number** current speed

## seek(position)

Set (jump to) transport position

### Params: 

* **Number** *position* target position

## cyclic(cyclic)

Set whether the audio buffer is considered as cyclic

### Params: 

* **Bool** *cyclic* whether the audio buffer is considered as cyclic

## cyclic

Get whether the audio buffer is considered as cyclic

### Return:

* **Bool** whether the audio buffer is considered as cyclic

## gain(value)

Set gain

### Params: 

* **Number** *value* linear gain factor

## gain

Get gain

### Return:

* **Number** current gain

## startPlaying(seek, speed)

Start playing (high level player API)

### Params: 

* **Number** *seek* start position
* **Number** *speed* playing speed

## pausePlaying()

Pause playing (high level player API)

## stopPlaying()

Stop playing (high level player API)

## playingSpeed(speed)

Set playing speed (high level player API)

### Params: 

* **Number** *speed* playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)

## playingSpeed

Get playing speed (high level player API)

### Return:

* **current** playing speed

<!-- End ./src/index.js -->

