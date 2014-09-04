

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## scheduler

Scheduler to which the time engine has been added

## transport

Transport to which the time engine has been added

## alignToTransportPosition

Whether the times are aligned to the transport position (or scheduled in time) when the engine is added to a transsport

## outputNode

Output audio node

## syncNext(time)

Synchronize time engine

### Params: 

* **Number** *time* synchronization time or transport position

### Return:

* **Number** delay until next time or Infinity executeNext should not be called

## executeNext(time, audioTime)

Execute next time

### Params: 

* **Number** *time* scheduler time or transport position
* **Number** *audioTime* corresponding audio context's currentTime

### Return:

* **Number** next delay until next time or Infinity to stop execution

## resyncEngine()

Request time engine resynchronization (called by engine itself)

## rescheduleEngine(time)

Request time engine rescheduling (called by engine itself)

### Params: 

* **Number** *time* new next scheduler time or transport position

## connect(target)

Connect audio node

### Params: 

* **Object** *target* audio node

## disconnect(connection)

Disconnect audio node

### Params: 

* **Number** *connection* connection to be disconnected

<!-- End ./src/index.js -->

