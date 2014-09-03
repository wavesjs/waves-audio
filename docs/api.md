

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## getPositionAtTime(time)

Extrapolate transport position for given time

### Params: 

* **Number** *time* time

### Return:

* **Number** extrapolated position

## getTimeAtPosition(position)

Extrapolate transport time for given position

### Params: 

* **Number** *position* position

### Return:

* **Number** extrapolated time

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

## reverse

Get whether transport runs in reverse direction (speed < 0)

### Return:

* **Bool** whether transport runs in reverse direction

## speed(speed)

Set transport speed (a speed of 0 corrsponds to stop or pause)

### Params: 

* **Number** *speed* speed

## seek(position)

Set (jump to) transport position

### Params: 

* **Number** *position* target position

## add(engine)

Add an engine to the transport

### Params: 

* **Object** *engine* engine to be added to the transport 
An engine that can be added to the transport is either an EventEngine
or an engine that implements a speed attribute and a seek method.

The attribute "alignEventsToTransportPosition" of an event engine determines whether
the engine's events are scheduled in time or aligned to the transport position.

## remove()

Remove an engine from the transport

## resync(engine)

Resychronize event engine

### Params: 

* **Object** *engine* event engine to be resynchronized

## reschedule(engine, time)

Reschedule event engine at given time or position

### Params: 

* **Object** *engine* event engine to be rescheduled
* **Number** *time* time or position when to reschedule

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

