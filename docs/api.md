

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr *

## getTimeAtPosition(position)

Extrapolate transport time for given position

### Params: 

* **Number** *position* position

### Return:

* **Number** extrapolated time

## getPositionAtTime(time)

Extrapolate transport position for given time

### Params: 

* **Number** *time* time

### Return:

* **Number** extrapolated position

## time

Get current transport (scheduling) time

### Return:

* **Number** current transport time

## position

Get current transport position

### Return:

* **Number** current transport position

## speed

Get current transport speed

### Return:

* **Number** current transport speed

## seek(position)

Set (jump to) transport position

### Params: 

* **Number** *position* target position

## startPlaying(seek, speed)

Start playing (high level player API)

### Params: 

* **Number** *seek* start position
* **Number** *speed* playing speed

## pausePlaying()

Pause playing (high level player API)

## stopPlaying()

Stop playing (high level player API)

TODO: The following methods should go into a mixin that extends any class 
with a speed attribute and a seek method into a player.

## playingSpeed(speed)

Set playing speed (high level player API)

### Params: 

* **Number** *speed* playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)

## playingSpeed

Get playing speed (high level player API)

### Return:

* **current** playing speed

## add(engine, position)

Add an engine to the transport

### Params: 

* **Object** *engine* engine to be added to the transport
* **Number** *position* start position 
An engine that can be added to the transport is either an TimeEngine
or an engine that implements a speed attribute (that halts with speed = 0).

The attribute "alignToTransportPosition" of an time engine determines whether
the engine is scheduled in time or aligned to the transport position.

## remove(engine)

Remove an engine from the transport

### Params: 

* **object** *engine* engine to be removed from the transport

<!-- End ./src/index.js -->

