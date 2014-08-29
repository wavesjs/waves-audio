## scheduler

> WAVE audio event scheduler singleton

The scheduler is a global singleton that allows for scheduling event engines (see [EventEngine](https://github.com/Ircam-RnD/event-engine)) and simple callbacks through the following methods:

- callback(callback, delay = 0)
- add(engine, delay = 0)
- remove(engine)
- resync(engine)
- reschedule(engine, time)


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
