

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## buffer

Audio buffer

## periodAbs

Absolute segment period in sec

## periodRel

Segment period relative to inter-segment distance

## periodVar

Amout of random segment period variation relative to segment period

## positionArray

Array of segment positions (onset times in audio buffer) in sec

## positionVar

Amout of random segment position variation in sec

## durationArray

Array of segment durations in sec

## durationAbs

Absolute segment duration in sec

## durationRel

Segment duration relative to given segment duration or inter-segment distance

## offsetArray

Array of segment offsets in sec

## offsetAbs

Absolute segment offset in sec

## offsetRel

Segment offset relative to segment duration

## delay

Time by which all segments are delayed (especially to realize segment offsets)

## attackAbs

Absolute attack time in sec

## attackRel

Attack time relative to segment duration

## releaseAbs

Absolute release time in sec

## releaseRel

Release time relative to segment duration

## resampling

Segment resampling in cent

## resamplingVar

Amout of random resampling variation in cent

## segmentIndex

Index of

## cyclic

Whether the audio buffer and segment indices are considered as cyclic

## gain(value)

Set gain

### Params: 

* **Number** *value* linear gain factor

## gain

Get gain

### Return:

* **Number** current gain

## trigger(audioTime)

Trigger a segment

### Params: 

* **Number** *audioTime* segment synthesis audio time

### Return:

* **Number** period to next segment 
This function can be called at any time (whether the engine is scheduled or not)
to generate a single segment according to the current segment parameters.

<!-- End ./src/index.js -->

