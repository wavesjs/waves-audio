

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## master

Master (scheduler, transport, player) to which the time engine is synchronized

## interface

Interface used by the current master

## transportStartPosition

Transport start position of the engine (handled by )

## outputNode

Output audio node

## currentTime

Get the time engine's current master time

## currentPosition

Get the time engine's current master position

Advance engine time (scheduled interface)

### Params: 

* **Number** *time* current scheduler time (based on audio time)

### Return:

* **Number** next engine time 
This function is called by the scheduler to let the engine do its work
synchronized to the scheduler time.
If the engine returns Infinity, it is not called again until it is restarted by
the scheduler or it calls resetNextPosition with a valid position.

## resetNextTime(time)

Function provided by the scheduler to reset the engine's next time

### Params: 

* **Number** *time* new engine time (immediately if not specified)

Synchronize engine to transport position (transported interface)

### Params: 

* **Number** *position* current transport position to synchronize to
* **Number** *time* current scheduler time (based on audio time)
* **Number** *speed* current speed

### Return:

* **Number** next position (given the playing direction) 
This function is called by the msater and allows the engine for synchronizing
(seeking) to the current transport position and to return its next position.
If the engine returns Infinity or -Infinity, it is not called again until it is
resynchronized by the transport or it calls resetNextPosition.

Advance engine position (transported interface)

### Params: 

* **Number** *time* current scheduler time (based on audio time)
* **Number** *position* current transport position
* **Number** *speed* current speed

### Return:

* **Number** next engine position (given the playing direction) 
This function is called by the transport to let the engine do its work
aligned to the transport's position.
If the engine returns Infinity or -Infinity, it is not called again until it is
resynchronized by the transport or it calls resetNextPosition.

## resetNextPosition(position)

Function provided by the transport to reset the next position or to request resynchronizing the engine's position

### Params: 

* **Number** *position* new engine position (will call syncPosition with the current position if not specified)

Set engine speed (speed-controlled interface)

### Params: 

* **Number** *time* current scheduler time (based on audio time)
* **Number** *position* current transport position
* **Number** *speed* current transport speed 
This function is called by the transport to propagate the transport speed to the engine.
The speed can be of any bewteen -16 and 16.
With a speed of 0 the engine is halted.

## removeFromMaster()

Remove engine from current master

## connect(target)

Connect audio node

### Params: 

* **Object** *target* audio node

## disconnect(connection)

Disconnect audio node

### Params: 

* **Number** *connection* connection to be disconnected

## implementsScheduled()

Check whether the time engine implements the scheduled interface

## implementsTransported()

Check whether the time engine implements the transported interface

## implementsSpeedControlled()

Check whether the time engine implements the speed-controlled interface

<!-- End ./src/index.js -->

