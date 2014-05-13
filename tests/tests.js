var assert = chai.assert;

var audioContext = new webkitAudioContext();

describe("Scheduler test", function() {
  var self = this;
  var scheduler;
  var myObject;

  beforeEach(function() {
    scheduler = createScheduler(audioContext);
    myObject = {
      makeEventAndComputeNextTimeValue: 0,
      getNextTime: function() {
        console.log("getNextTime");
      },
      makeEventAndComputeNextTime: function() {
        myObject.makeEventAndComputeNextTimeValue++;
        return this.getNextTime();
      }
    };
  });

  it('should I add an object to my sceduler', function(done) {
    scheduler.add(myObject);
    assert.equal(scheduler.isScheduling, true);
    assert.isObject(scheduler.schedulingList[0]);
    done();
    scheduler.remove(myObject);
  });

  it('should I remove an object to my sceduler', function() {
    scheduler.add(myObject);
    scheduler.remove(myObject);
    assert.equal(scheduler.isScheduling, false);
    assert.equal(scheduler.schedulingList.length, 0);
  });

  it('should I have an error whend I try to add a non object', function() {
    try {
      scheduler.add("");
    } catch (e) {
      console.log(e);
    }
  });

  it('should I have an error whend I try to add an unconvotional object', function() {
    try {
      scheduler.add({});
    } catch (e) {
      console.log(e);
    }
  });

  it('should I have an error when I try to remove a non object', function() {
    try {
      scheduler.remove("");
    } catch (e) {
      console.log(e);
    }
  });

  it('should I have an error when I try to remove an object that does not exist', function() {
    try {
      scheduler.remove(myObject);
    } catch (e) {
      console.log(e);
    }
  });

  it('should my current time is correct ?', function() {
    assert.equal(scheduler.getCurrentTime(), audioContext.currentTime);
  });

  it('should my scheduling period is correct ?', function() {
    assert.equal(scheduler.getSchedulingPeriod(), 0.025);
  });

  //this test need to be at the end
  it('should my scheduler is running correctly', function(done) {
    var count = 0;
    myObject.getNextTime = function() {
      var nextTime;
      if (count < 2)
        nextTime = audioContext.currentTime + scheduler.scheduleAheadTime;
      else
        nextTime = audioContext.currentTime + scheduler.scheduleAheadTime + 10000;
      count++;
      return nextTime;
    };

    scheduler.schedulingPeriod = 0.5;
    scheduler.add(myObject);

    setTimeout(function() {
      assert.equal(myObject.makeEventAndComputeNextTimeValue, 2);
    }, scheduler.schedulingPeriod + 250);

    setTimeout(function() {
      assert.equal(myObject.makeEventAndComputeNextTimeValue, 2);
      done();
    }, (scheduler.schedulingPeriod + 500));

  });


});