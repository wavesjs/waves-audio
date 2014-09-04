

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## period

scheduler (setTimeout) period

## lookahead

scheduler lookahead time (> period)

## time

Get scheduler time

### Return:

* **Number** current scheduler time including lookahead

## callback(callback, period, delay)

Add a callback to the scheduler

### Params: 

* **Function** *callback* function(time, audioTime) to be called
* **Number** *period* callback period
* **Number** *delay* of first callback

### Return:

* **Object** scheduled object that can be used to call remove and reschedule

## repeat(callback, period, delay)

Add a periodically repeated callback to the scheduler

### Params: 

* **Function** *callback* function(time, audioTime) to be called periodically
* **Number** *period* callback period
* **Number** *delay* of first callback

### Return:

* **Object** scheduled object that can be used to call remove and reschedule

## add(engine, delay)

Add a time engine to the scheduler

### Params: 

* **object** *engine* time engine to be added to the scheduler
* **Number** *delay* scheduling delay time

## remove(engine)

Remove a scheduled time engine or callback from the scheduler

### Params: 

* **Object** *engine* time engine or callback to be removed from the scheduler

## resync(engine)

Resychronize a scheduled time engine

### Params: 

* **Object** *engine* time engine to be resynchronized

## reschedule(engine, time)

Reschedule a scheduled time engine or callback

### Params: 

* **Object** *engine* time engine or callback to be rescheduled
* **Number** *time* time when to reschedule

<!-- End ./src/index.js -->

