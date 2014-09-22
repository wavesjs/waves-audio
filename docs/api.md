

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

## currentTime

Get current master time

### Return:

* **Number** current transport position

## currentPosition

Get current master position

### Return:

* **Number** current transport position

## start()

Start playing (high level player API)

## pause()

Pause playing (high level player API)

## stop()

Stop playing (high level player API)

## speed(speed)

Set playing speed (high level player API)

### Params: 

* **Number** *speed* playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)

## speed

Get playing speed (high level player API)

### Return:

* **current** playing speed

## seek(position)

Set (jump to) transport position

### Params: 

* **Number** *position* target position

## add(engine, position)

Add a time engine to the transport

### Params: 

* **Object** *engine* engine to be added to the transport
* **Number** *position* start position

## remove(engine)

Remove a time engine from the transport

### Params: 

* **object** *engine* engine to be removed from the transport

## clear()

Remove all time engines from the transport

<!-- End ./src/index.js -->

