

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## period

scheduler (setTimeout) period

## lookahead

scheduler lookahead time (> period)

## currentTime

Get scheduler time

### Return:

* **Number** current scheduler time including lookahead

## callback(callback, period, delay)

Add a callback to the scheduler

### Params: 

* **Function** *callback* function(time, audioTime) to be called
* **Number** *period* callback period (default is 0 for one-shot)
* **Number** *delay* of first callback (default is 0)

### Return:

* **Object** scheduled object that can be used to call remove and reschedule

## add(engine, delay, function)

Add a time engine to the scheduler

### Params: 

* **Object** *engine* time engine to be added to the scheduler
* **Number** *delay* scheduling delay time
* **Function** *function* to get current position

## remove(engine)

Remove time engine from the scheduler

### Params: 

* **Object** *engine* time engine or callback to be removed from the scheduler

## reset(engine, time)

Reschedule a scheduled time engine or callback

### Params: 

* **Object** *engine* time engine or callback to be rescheduled
* **Number** *time* time when to reschedule

<!-- End ./src/index.js -->

