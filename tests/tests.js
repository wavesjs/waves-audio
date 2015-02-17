var assert = require('assert');
var sinon = require('sinon');

var scheduler = require('../scheduler.es6.js');
var TimeEngine = require("time-engine");

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
        scheduler.remove(engine);
        assert.equal(scheduler.__engines.length, 0);
        assert.equal(scheduler.__queue.head, null);
    })
})
