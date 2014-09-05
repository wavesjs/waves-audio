

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## scheduler

Scheduler to which the time engine has been added

## transport

Transport to which the time engine has been added

## outputNode

Output audio node

## executeSchedulerTime(time, position, whether)

Execute engine at next transport position

### Params: 

* **Number** *time* current scheduler (audio) time
* **Number** *position* current transport position
* **Bool** *whether* transport runs backward (current playing direction)

### Return:

* **Number** next transport position (given the playing direction) 
This function is called – more or less regulary – by the scheduler to let the engine do its work
synchronized to the scheduler time.

## rescheduleEngine(time)

Request time engine rescheduling (called by engine itself)

### Params: 

* **Number** *time* new next scheduler time or transport position

## syncTransportPosition(time, position, whether)

Synchronize time engine to transport position

### Params: 

* **Number** *time* current scheduler (audio) time
* **Number** *position* transport position to synchronize to
* **Bool** *whether* transport runs backward (current playing direction)

### Return:

* **Number** next transport position (given the playing direction) 
This function allows the engine for synchronizing (seeking) to the current transport position
and to return the position of the next transport position of the engine.
Engines that return Infinity or -Infinity are not called anymore until they call resyncEngine()
with a valid transport position.

## executeTransportPosition(time, position, whether)

Execute engine at next transport position

### Params: 

* **Number** *time* current scheduler (audio) time
* **Number** *position* current transport position
* **Bool** *whether* transport runs backward (current playing direction)

### Return:

* **Number** next transport position (given the playing direction) 
This function is called – more or less regulary – by the transport to let the engine do its work
aligned to the transport position.

## resyncEngine()

Request time engine to be resynchronized to the current transport position (called by engine itself)

This function will result in syncTransportPosition() being called with the current transport position
to adjust the engines priority in the transport queue.

## connect(target)

Connect audio node

### Params: 

* **Object** *target* audio node

## disconnect(connection)

Disconnect audio node

### Params: 

* **Number** *connection* connection to be disconnected

<!-- End ./src/index.js -->

