var assert = require('assert');
var sinon = require('sinon');

var simpleScheduler = require('../simple-scheduler.es6.js');
var audioContext = require("audio-context");
var TimeEngine = require("time-engine");

describe("SimpleScheduler", function() {
    afterEach(function() {
        simpleScheduler.clear();
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
    it("should reschedule a scheduled time engine (or callback correctly)", function(){
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
    it('should correctly manage a time engine', function(done){
        // test that advanceTime is called
        var engine = new TimeEngine();
        var initialTime = audioContext.currentTime;
        engine.advanceTime = function(time) {
            // should be greater than simpleScheduler.period, no?
            return time + 0.06;
        }
        var spy = sinon.spy(engine, "advanceTime");
        setTimeout(()=>{
            assert.equal(spy.callCount, Math.floor((audioContext.currentTime-initialTime) / 0.06)+1)
            done();
        }, 1000)
        simpleScheduler.add(engine);
    })
    it('should correctly call a callback', function(){
        var cb = sinon.spy();
        var cbTime = audioContext.currentTime + 500;
        setTimeout(()=>{
            assert.equal(cb.callCount, 1);
            done();
        }, 1000)
        simpleScheduler.callback(cb, cbTime);
    });
    it('should remove an engine that return an Infinity time', function(){
        var engine = new TimeEngine();
        engine.advanceTime = function(time) {
            // should be greater than simpleScheduler.period, no?
            return Infinity;
        }
        simpleScheduler.add(engine);
        assert.equal(simpleScheduler.__schedEngines.length, 0);
    })
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
