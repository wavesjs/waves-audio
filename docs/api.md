

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## buffer

Audio buffer

## periodAbs

Absolute grain period in sec

## periodRel

Grain period relative to absolute duration

## periodVar

Amout of random grain period variation relative to grain period

## position

Grain position (onset time in audio buffer) in sec

## positionVar

Amout of random grain position variation in sec

## durationAbs

Absolute grain duration in sec

## durationRel

Grain duration relative to grain period (overlap)

## attackAbs

Absolute attack time in sec

## attackRel

Attack time relative to grain duration

## releaseAbs

Absolute release time in sec

## releaseRel

Release time relative to grain duration

## resampling

Grain resampling in cent

## resamplingVar

Amout of random resampling variation in cent

## centered

Whether the grain position refers to the center of the grain (or the beginning)

## cyclic

Whether the audio buffer and grain position are considered as cyclic

## gain(value)

Set gain

### Params: 

* **Number** *value* linear gain factor

## gain

Get gain

### Return:

* **Number** current gain

## trigger(grain)

Trigger a grain

### Params: 

* **audioTime** *grain* synthesis audio time

### Return:

* **Number** period to next grain 
This function can be called at any time (whether the engine is scheduled or not)
to generate a single grain according to the current grain parameters.

<!-- End ./src/index.js -->

