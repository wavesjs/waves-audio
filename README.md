## scheduler

> WAVE audio event scheduler singleton (time-engine master)

The scheduler is a global singleton that allows for scheduling time-engines (see [TimeEngine](https://github.com/Ircam-RnD/time-engine)) like the [granular engine](https://github.com/Ircam-RnD/granular-engine) and the [metronome](https://github.com/Ircam-RnD/metronome) as well as simple callback functions.

## API

Method | Description
--- | ---
`callback(callback, delay = 0, period = 0)` | Schedule (once or periodically) an arbitrary callback function called with the scheduling time as argument.
`add(engine, delay = 0)` | Add an event engine to the scheduler with an optional delay.
`remove(engine)` | Remove an event engine from the scheduler.
`resync(engine)` | Resynchronize an already scheduled event engine.
`reschedule(engine, time)` | Reschedule an already scheduled event engine at teh given time.

Attribute | Description
--- | ---
`period` | Scheduler period (i.e. period of the setTimeout calls).
`advance` | Lookahead time for scheduling events in advance (must be > period).

### Example

```js
var metro = new Metronome();
scheduler.add(metro);
scheduler.callback(function(time) { scheduler.remove(metro); }, 10);
```

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
