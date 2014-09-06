

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## timeMaster

Time master to which the time engine is synchronized

## positionMaster

Position master to which the time engine is synchronized

## outputNode

Output audio node

## advanceTime(time)

Advance engine time

### Params: 

* **Number** *time* current master time (based on audio time)

### Return:

* **Number** next engine time 
This function is called by the time master to let the engine do its work
synchronized to the master's time.
If the engine returns Infinity, it is not called again until it is restarted by the master 
or it calls resyncEnginePosition() with a valid position.

## resetEngineTime(time)

Reset engine time at master

### Params: 

* **Number** *time* new engine time, implies current master time if not given 
This function is called by the engine itself to rectify its next time.

## syncPosition(time, position, whether)

Synchronize engine to master position

### Params: 

* **Number** *time* current master time (based on audio time)
* **Number** *position* current master position to synchronize to
* **Bool** *whether* position runs backward (current playing direction)

### Return:

* **Number** next position (given the playing direction) 
This function allows the engine for synchronizing (seeking) to the current master position
and to return its next position.
If the engine returns Infinity or -Infinity, it is not called again until it is 
resynchronized by the master or it calls resyncEnginePosition().

## advancePosition(time, position, whether)

Advance engine position

### Params: 

* **Number** *time* current master time (based on audio time)
* **Number** *position* current master position
* **Bool** *whether* position runs backward (current playing direction)

### Return:

* **Number** next engine position (given the playing direction) 
This function is called by the position master to let the engine do its work
aligned to the master's position.
If the engine returns Infinity or -Infinity, it is not called again until it is 
resynchronized by the master or it calls resyncEnginePosition().

## resyncEnginePosition()

Request the position master to resynchronize the engine's position

This function is called by the engine itself and will result in syncTransportPosition() 
being called with the current master position.

## connect(target)

Connect audio node

### Params: 

* **Object** *target* audio node

## disconnect(connection)

Disconnect audio node

### Params: 

* **Number** *connection* connection to be disconnected

<!-- End ./src/index.js -->

