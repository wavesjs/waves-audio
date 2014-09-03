

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## period

Metronome period in sec

## clickFreq

Metronome click frequency

## clickAttack

Metronome click attack time

## clickRelease

Metronome click release time

## trigger(audioTime)

Trigger metronome click

### Params: 

* **Number** *audioTime* metronome click synthesis audio time

## gain(value)

Set gain

### Params: 

* **Number** *value* linear gain factor

## gain

Get gain

### Return:

* **Number** current gain

## phase(phase)

Set metronome phase

### Params: 

* **Number** *phase* metronome phase (0...1)

## phase

Get metronome phase

### Return:

* **Number** current metronome phase

## aligned(aligned)

Set whether metronome clicks are aligned to the absolute scheduling time

### Params: 

* **Bool** *aligned* whether metronome is aligned to absolute time 
Aligning the metronome to the absolute scheduling time allows for synchronizing the phases of multiple metronomes.

## aligned

Get whether metronome clicks are aligned to the absolute scheduling time

### Return:

* **Bool** whether metronome is aligned to absolute time

<!-- End ./src/index.js -->

