var assert = require('assert');
var sinon = require('sinon');

var audioContext = require("../es6/core/audio-context");
var scheduler = require("../es6/masters/scheduler");
var TimeEngine = require("../es6/core/time-engine");

var currentTimeDeviation = 128 / 44100; // the audioContext.currentTime accuracy

describe("Scheduler", function() {
    afterEach(function() {
        scheduler.clear();
        // Due to https://github.com/uxebu/mocha-sinon-traceur-example/blob/fb354685b590390f8695f5ecee890c4f9072f944/src/sinon-cleanup.js
        this.sinon = sinon.sandbox.restore();
    });
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
    });
    it('should not add an engine that doesn\'t implement scheduled', function() {
        assert.throws(function() {
            var engine = {};
            scheduler.add(engine)
        }, Error);
    });
    it('should not add an engine to a scheduler if that engine already belong to a scheduler', function() {
        assert.throws(function() {
            var engine = new TimeEngine();
            engine.advanceTime = function(time) {
                return time + 90;
            }
            scheduler.add(engine)
            scheduler.add(engine)
        }, Error);
    });
    it('should not remove an engine that doesn\'t belong to the scheduler', function() {
        assert.throws(function() {
            var engine = new TimeEngine();
            scheduler.remove(engine)
        })
    });
    it('should remove an engine that was previously added to the scheduler', function() {
        var engine = new TimeEngine();
        engine.advanceTime = function(time) {
            return time + 90;
        }
        scheduler.add(engine);
        assert.equal(scheduler.__engines.length, 1);
        scheduler.remove(engine);
        assert.equal(scheduler.__engines.length, 0);
        assert.equal(scheduler.__queue.head, null);
    });
    it('should reset an engine correctly', function(done) {
        var engine = new TimeEngine();
        var initialTime = audioContext.currentTime;
        engine.advanceTime = function(time) {
            assert.equal(initialTime + 0.5, time)
            done();
            return Infinity;
        }
        scheduler.add(engine);
        assert.equal(scheduler.__engines.length, 1);
        scheduler.reset(engine, initialTime + 0.5);
        assert.equal(scheduler.__engines.length, 1);
    });
    it('should add a callback at a time correctly', function(done) {
        var initialTime = audioContext.currentTime;
        var cb = function(time) {
            assert((initialTime + 1.0 - currentTimeDeviation) < time < (initialTime + 1.0 + currentTimeDeviation));
            assert.equal(initialTime + 1.0, time)
            done();
        };
        scheduler.callback(cb, initialTime + 1.0);
    });
    it('should remove from queue an engine that returns null', function(done) {
        var engine = new TimeEngine();
        var initialTime = audioContext.currentTime;
        engine.advanceTime = function(time) {
            return null;
        };
        scheduler.add(engine, initialTime);
        assert.equal(scheduler.__engines.length, 1);
        setTimeout(() => {
            assert.equal(scheduler.__engines.length, 0);
            done()
        }, initialTime + scheduler.period*1000)
    });
    it('should unschedule an engine that return Infinity, but keep in as an engine', function(done){
        var engine = new TimeEngine();
        var initialTime = audioContext.currentTime;
        var times = [0.1, Infinity];
        var i = -1;
        engine.advanceTime = function(time) {
            i++
            return time+times[i];
        };
        scheduler.add(engine, initialTime);
        assert.equal(scheduler.__engines.length, 1);
        setTimeout(() => {
            assert.equal(scheduler.__engines.length, 1);
            done()
        }, initialTime+0.1+scheduler.period*1000)
    });
    it('should clear the scheduler correctly', function(){
        var engine = new TimeEngine();
        var initialTime = audioContext.currentTime;
        engine.advanceTime = function(time) {
            return time+0.1;
        };
        scheduler.add(engine, initialTime);
        assert.equal(scheduler.__engines.length, 1);
        scheduler.clear();
        assert.equal(scheduler.__engines.length, 0);
    })
})
