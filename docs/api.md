

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## __timeMaster

Time master to which the time engine is synchronized

## getMasterTime()

Function provided by time master to get the master time

## resetEngineTime(time)

Function provided by the time master to reset the engine's next time

### Params: 

* **Number** *time* new engine time (immediately if not specified)

## __positionMaster

Position master to which the time engine is synchronized

## __startPosition

Start position of the engine

## getMasterPosition()

Function provided by position master to get the master position

## resyncEnginePosition(time)

Function provided by the position master to request resynchronizing the engine's position

### Params: 

* **Number** *time* new engine time (immediately if not specified)

## outputNode

Output audio node

## initTime(time)

Synchronize engine to master time ("time-based" interface, optional function)

### Params: 

* **Number** *time* current master time (based on audio time)

### Return:

* **Number** first time 
This optional function is called by the time master and allows the engine to
return its first time.
If the engine returns Infinity or -Infinity, it is not called again until it is
reset by the time master or it calls resetEngineTime().

Advance engine time ("time-based" interface)

### Params: 

* **Number** *time* current master time (based on audio time)

### Return:

* **Number** next engine time 
This function is called by the time master to let the engine do its work
synchronized to the master's time.
If the engine returns Infinity, it is not called again until it is restarted by
the time master or it calls resyncEnginePosition() with a valid position.

Synchronize engine to master position ("position-based" interface)

### Params: 

* **Number** *position* current master position to synchronize to
* **Number** *time* current master time (based on audio time)
* **Number** *speed* current speed

### Return:

* **Number** next position (given the playing direction) 
This function is called by the msater and allows the engine for synchronizing
(seeking) to the current master position and to return its next position.
If the engine returns Infinity or -Infinity, it is not called again until it is
resynchronized by the position master or it calls resyncEnginePosition().

Advance engine position ("position-based" interface)

### Params: 

* **Number** *time* current master time (based on audio time)
* **Number** *position* current master position
* **Number** *speed* current speed

### Return:

* **Number** next engine position (given the playing direction) 
This function is called by the position master to let the engine do its work
aligned to the master's position.
If the engine returns Infinity or -Infinity, it is not called again until it is
resynchronized by the position master or it calls resyncEnginePosition().

Set engine speed ("speed-based" interface)

### Params: 

* **Number** *speed* current master speed 
This function is called by the speed master to propagate the master's speed to the engine.
The speed can be of any bewteen -16 and 16.
With a speed of 0 the engine is halted.

Seek engine to a given position ("speed-based" interface)

### Params: 

* **Number** *position* position to seek to 
This function is called by the speed master to propagate position jumps to the engine.

## implementsTimeBased

Return whether the time engine implements the time-based interface

## implementsPositionBased

Return whether the time engine implements the position-based interface

## implementsSpeedBased

Return whether the time engine implements the speed-based interface

## connect(target)

Connect audio node

### Params: 

* **Object** *target* audio node

## disconnect(connection)

Disconnect audio node

### Params: 

* **Number** *connection* connection to be disconnected

<!-- End ./src/index.js -->

