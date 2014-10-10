

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

xxx

## currentTime

Get current master time

### Return:

* **Number** current time 
This function will be replaced when the transport is added to a master (i.e. transport or player).

## currentPosition

Get current master position

### Return:

* **Number** current playing position 
This function will be replaced when the transport is added to a master (i.e. transport or player).

## resetNextPosition(next)

Reset next transport position

### Params: 

* **Number** *next* transport position 
This function will be replaced when the transport is added to a master (i.e. transport or player).

## add(engine, position)

Add a time engine to the transport

### Params: 

* **Object** *engine* engine to be added to the transport
* **Number** *position* start position

## remove(engineOrTransported)

Remove a time engine from the transport

### Params: 

* **object** *engineOrTransported* engine or transported to be removed from the transport

## clear()

Remove all time engines from the transport

<!-- End ./src/index.js -->

