

<!-- Start ./src/index.js -->

written in ECMAscript 6

Author: Norbert.Schnell@ircam.fr, Victor.Saiz@ircam.fr, Karim.Barkati@ircam.fr

## __getTimeAtPosition(position)

Extrapolate transport time for given position

### Params: 

* **Number** *position* position

### Return:

* **Number** extrapolated time

## __getPositionAtTime(time)

Extrapolate playing position for given time

### Params: 

* **Number** *time* time

### Return:

* **Number** extrapolated position

## __resetNextPosition()

Get current master position

### Return:

* **Number** current playing position

## currentTime

Get current master time

### Return:

* **Number** current time 
This function will be replaced when the play-control is added to a master.

## currentPosition

Get current master position

### Return:

* **Number** current playing position 
This function will be replaced when the play-control is added to a master.

## start()

Start playing

## pause()

Pause playing

## stop()

Stop playing

## speed(speed)

Set playing speed

### Params: 

* **Number** *speed* playing speed (non-zero speed between -16 and -1/16 or between 1/16 and 16)

## speed

Get playing speed

### Return:

* **current** playing speed

## seek(position)

Set (jump to) playing position

### Params: 

* **Number** *position* target position

## clear()

Remove time engine from the transport

<!-- End ./src/index.js -->

