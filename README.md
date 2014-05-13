# Scheduler module

> WAVE audio library module for scheduling audio events.

The `scheduler` object provides these methods and tuning attributes:

- `add`
- `remove`
- `getSchedulingPeriod`
- `getCurrentTime`
- `schedulingPeriod`
- `scheduleAheadTime`


## Example

```js
// var createScheduler = require("create-scheduler");

// we need a web audio context to get its clock
var audioContext = new AudioContext();

// let's instantiate a scheduler
var scheduler = createScheduler(audioContext);

// we can create an audio engine based on scheduled events
var engine = function engine(scheduler) {
  var engineProperties = {
    // some specific functions are required
    makeEventAndComputeNextTime: function() {
      // 1. do something
      // 2. return next event time
    },
    getNextTime: function() {
      // return next event time
    }
  };
  return Object.create({}, engineProperties);
};
// then some generic properties must be added
makeSchedulable(engine); // see corresponding module

// and just play!
scheduler.add(engine);
```

## API

The `scheduler` object exposes the following API:

Method | Description
--- | ---
 `scheduler.add(schedulableObject)` | Schedule a schedulable object.
`scheduler.remove(scheduledObject)` | Unschedule a scheduled object.
`scheduler.getSchedulingPeriod()` | Get the scheduling period.
`scheduler.getCurrentTime()` | Get the current time of the web audio context.

Attribute | Default | Description
--- | --- | ---
 `scheduler.schedulingPeriod` | 0.025 sec | How frequently to call scheduling loop.
`scheduler.scheduleAheadTime` | 0.01 sec |How far ahead to schedule audio.

## License

This module is released under the [BSD-3-Clause license](http://opensource.org/licenses/BSD-3-Clause).

## Acknowledgments

This code is part of the WAVE project (http://wave.ircam.fr), funded by ANR (The French National Research Agency), *ContInt* program, 2012-2015.
