## scheduler

> WAVE audio event scheduler singleton

The scheduler is a global singleton that allows for scheduling event engines (see [EventEngine](https://github.com/Ircam-RnD/event-engine)) and simple callback functions.

## API

The `scheduler` object exposes the following API:

Method | Description
--- | ---
`callback(callback, delay = 0)` | Schedule an arbitrary callback called with (time, audioTime).
`add(engine, delay = 0)` Add an event engine to the scheduler with an optional delay.
`remove(engine)` | Remove an event engine from the scheduler.
`resync(engine)` | Resynchronize an already scheduled event engine.
`reschedule(engine, time)` | Reschedule an already scheduled event engine at teh given time.

### Usage

### Status

This library is under heavy development and subject to change.  
Every new API breaking change we will be adding snapshots to the repository so you can always fetch a working copy.

## License
This module is released under the [BSD-3-Clause license](http://opensource.org/licenses/BSD-3-Clause).

## Acknowledgments
This code is part of the [WAVE project](http://wave.ircam.fr),  
funded by ANR (The French National Research Agency),  
_ContInt_ program,  
2012-2015.
