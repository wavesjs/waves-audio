var assert = require('assert');
var sinon = require('sinon');

var simpleScheduler = require("../es6/masters/simple-scheduler");
var audioContext = require("../es6/core/audio-context");
var TimeEngine = require("../es6/core/time-engine");

describe("SimpleScheduler", function() {
    afterEach(function() {
        simpleScheduler.clear();
        // Due to https://github.com/uxebu/mocha-sinon-traceur-example/blob/fb354685b590390f8695f5ecee890c4f9072f944/src/sinon-cleanup.js
        this.sinon = sinon.sandbox.restore();
    });
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
    });
    // Test simple scheduler public API
    it('should not add a wrong time engine', function() {
        // one that doesn't implement scheduled interface
        // or one that is already transported
        assert.throws(function() {
            var engine = 'badEngine'
            simpleScheduler.add(engine)
        }, Error);
        assert.throws(function() {
            var engine = new TimeEngine();
            engine.advanceTime = function(time) {
                return time + 10;
            }
            simpleScheduler.add(engine)
                // here the engine is added 2 times, which is not possible
            simpleScheduler.add(engine)
        }, Error);
    });
    it('should add an orthodox time engine', function() {
        var engine = new TimeEngine();
        engine.advanceTime = function(time) {
            return time + 10;
        }
        simpleScheduler.add(engine)
        assert(simpleScheduler.__schedEngines.length, 1);
        assert.equal(simpleScheduler.__schedEngines[0], engine);
    })
    it('should remove an orthodox time engine', function() {
        var engine = new TimeEngine();
        engine.advanceTime = function(time) {
            return time + 10;
        }
        simpleScheduler.add(engine)
        simpleScheduler.remove(engine)
        assert.equal(simpleScheduler.__schedEngines.length, 0);
    });
    it('should not be able to remove an orthodox time engine if it wasn\'t previously added', function() {
        assert.throws(function() {
            var engine = new TimeEngine();
            engine.advanceTime = function(time) {
                return time + 10;
            }
            simpleScheduler.remove(engine)
        }, Error)
    });
    it("should reschedule a scheduled time engine (or callback correctly)", function() {
        var engine = new TimeEngine();
        engine.advanceTime = function(time) {
            return time + 10;
        }
        simpleScheduler.add(engine)
        var time = audioContext.currentTime + 1000
        simpleScheduler.reset(engine, time)
            // assert __rescheduled engine
        assert.equal(simpleScheduler.__schedTimes[0], time);
    });
    it('should correctly manage a regular time engine', function(done) {
        // test that advanceTime is called
        var engine = new TimeEngine();
        var initialTime = audioContext.currentTime;
        var engineTimePeriod = 0.081;
        var currentTimeDeviation = 128 / 44100; // the audioContext.currentTime accuracy
        engine.advanceTime = function(time) {
            return time + engineTimePeriod;
        }
        var spy = sinon.spy(engine, "advanceTime");
        setTimeout(() => {
            var currentTime = audioContext.currentTime
                // At this time how many times the advanceTime method has been called, and it scheduled event has effectively been played
            var n = Math.floor((currentTime - initialTime) / engineTimePeriod);
            // Compute the worst cases for n, taking count of the audioContext.currentTime accuracy
            var nDeviation = [Math.floor((currentTime - initialTime - 2 * currentTimeDeviation) / engineTimePeriod), Math.floor((2 * currentTimeDeviation + currentTime - initialTime) / engineTimePeriod)]
                // Here we compute how many times the advanceTime method has been called, the events that has been scheduled, but have not been played yet
            var m = Math.floor((currentTime + simpleScheduler.lookahead - (initialTime + n * engineTimePeriod)) / engineTimePeriod);
            // Compute the worst cases for m, taking count of the audioContext.currentTime accuracy
            var mDeviation = [Math.floor((currentTime + simpleScheduler.lookahead - (initialTime + n * engineTimePeriod) - 2 * currentTimeDeviation) / engineTimePeriod), Math.floor((2 * currentTimeDeviation + currentTime + simpleScheduler.lookahead - (initialTime + n * engineTimePeriod)) / engineTimePeriod)]
            assert(spy.callCount >= nDeviation[0] + mDeviation[0] + 1);
            assert(spy.callCount <= nDeviation[1] + mDeviation[1] + 1);
            // Below, the hard case, where all works great
            assert.equal(spy.callCount, m + n + 1);
            done();
        }, 1500)
        simpleScheduler.add(engine, initialTime);
    });
    it('should remove the engine is it return a null value - undocumented function, only for happy few', function() {
        var engine = new TimeEngine();
        engine.advanceTime = function(time) {
            return null;
        }
        simpleScheduler.add(engine);
        assert.equal(simpleScheduler.__schedEngines.length, 0);
    })
    it('should correctly call a callback', function() {
        var cb = sinon.spy();
        var cbTime = audioContext.currentTime + 500;
        setTimeout(() => {
            assert.equal(cb.callCount, 1);
            done();
        }, 1000)
        simpleScheduler.callback(cb, cbTime);
    });
    it('should remove an engine that return an Infinity time', function() {
        var engine = new TimeEngine();
        engine.advanceTime = function(time) {
            // should be greater than simpleScheduler.period, no?
            return Infinity;
        }
        simpleScheduler.add(engine);
        assert.equal(simpleScheduler.__schedEngines.length, 0);
    });
    // Test private methods to fix things
    it("should __scheduleEngine correctly", function() {
        var engine = "foo";
        var time = 0.1;
        simpleScheduler.__scheduleEngine(engine, time);
        assert(simpleScheduler.__schedEngines.length, 1);
        assert.equal(simpleScheduler.__schedEngines[0], engine);
        assert(simpleScheduler.__schedTimes.length, 1);
        assert.equal(simpleScheduler.__schedTimes[0], time);
        simpleScheduler.__unscheduleEngine(engine);
    });
    it('should __unscheduleEngine correctly', function() {
        var engine1 = "foo";
        var time1 = 0.1;
        var engine2 = "bar";
        var time2 = 0.2;
        simpleScheduler.__scheduleEngine(engine1, time1);
        simpleScheduler.__scheduleEngine(engine2, time2);
        simpleScheduler.__unscheduleEngine(engine1);
        assert.equal(simpleScheduler.__schedEngines.length, 1)
        assert.equal(simpleScheduler.__schedEngines[0], engine2);
        assert.equal(simpleScheduler.__schedTimes.length, 1)
        assert.equal(simpleScheduler.__schedTimes[0], time2);
    });
    it('should __rescheduleEngine correctly', function() {
        var engine = "foo";
        var time = 0.1;
        simpleScheduler.__scheduleEngine(engine, time);
        time = 0.2
        simpleScheduler.__rescheduleEngine(engine, time);
        assert.equal(simpleScheduler.__schedTimes[0], time);
        time = Infinity;
        simpleScheduler.__rescheduleEngine(engine, time);
        assert.equal(simpleScheduler.__schedTimes.length, 0)
        assert.equal(simpleScheduler.__schedEngines.length, 0)

    });
    it('should correctly return current time', function() {
        assert.equal(simpleScheduler.currentTime, audioContext.currentTime + simpleScheduler.lookahead)
    })
})
