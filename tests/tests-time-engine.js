var assert = require('assert');

var TimeEngine = require("../es6/core/time-engine");
var audioContext = require("../es6/core/audio-context");

describe("TimeEngine", function(){
    it("should init correctly", function(){
        var timeEngine = new TimeEngine();
        assert.equal(timeEngine.interface, null);
        assert.equal(timeEngine.outputNode, null);
    });
    it("should properly return currentTime", function(){
        var timeEngine = new TimeEngine();
        assert.equal(timeEngine.currentTime, audioContext.currentTime);
    });
    it("should properly return currentPosition", function(){
        var timeEngine = new TimeEngine();
        assert.equal(timeEngine.currentPosition, 0);
    });
    /*
    it("should connect output node", function(){
        var timeEngine = new TimeEngine();
        var target = audioContext.destination;
        timeEngine.connect(target);
        assert.equal(timeEngine.outputNode.destination, target);
    });
    */
    it("should check well if engine implements the scheduled interface", function(){
        var engine = new TimeEngine();
        engine.advanceTime = function(){};

        assert(engine.implementsScheduled());
        engine.advanceTime = 42;
        assert(!engine.implementsScheduled());
        delete engine.advanceTime;
        assert(!engine.implementsScheduled());
    })
    it("should check well if engine implements the transported interface", function(){
        var engine = {syncPosition: function(){}, advancePosition: function(){}};
        assert(TimeEngine.implementsTransported(engine));
        engine = {syncPosition: 42, advancePosition: function(){}};
        assert(!TimeEngine.implementsTransported(engine));
        engine = {syncPosition: function(){}, advancePosition: 42};
        assert(!TimeEngine.implementsTransported(engine));
        engine = {syncPosition: function(){}};
        assert(!TimeEngine.implementsTransported(engine));
        engine = {advancePosition: function(){}};
        assert(!TimeEngine.implementsTransported(engine));
        engine = {}
        assert(!TimeEngine.implementsTransported(engine));
    })
    it("should check well if engine implements the speed-controlled interface", function(){
        var engine = {syncSpeed: function(){}}
        assert(TimeEngine.implementsSpeedControlled(engine));
        engine.syncSpeed = 42;
        assert(!TimeEngine.implementsSpeedControlled(engine));
        delete engine.syncSpeed;
        assert(!TimeEngine.implementsSpeedControlled(engine));
    })
    it('should correctly set scheduled on an engine', function(){
        var engine = new TimeEngine();
        TimeEngine.setScheduled(engine, 56, function(){return 42}, function(){return 24});
        assert.equal(engine.interface, "scheduled");
        assert.equal(engine.resetNextTime, 56);
        var engine2 = new TimeEngine();
        var initalResetNextTime = engine2.resetNextTime
        TimeEngine.setScheduled(engine2, undefined, function(){return 42}, function(){return 24});
        assert.equal(engine2.resetNextTime, initalResetNextTime);
    })
    it('should correctly set transported on an engine', function(){
        var engine = new TimeEngine();
        TimeEngine.setTransported(engine, 56, function(){return 42}, function(){return 24});
        assert.equal(engine.interface, "transported");
        assert.equal(engine.resetNextPosition, 56);
        var engine2 = new TimeEngine();
        var initalResetNextPosition = engine2.resetNextPosition
        TimeEngine.setTransported(engine2, undefined, function(){return 42}, function(){return 24});
        assert.equal(engine2.resetNextPosition, initalResetNextPosition);
    })
    it('should correctly set speed-control on an engine', function(){
        var engine = new TimeEngine();
        TimeEngine.setSpeedControlled(engine, function(){return 42}, function(){return 24});
        assert.equal(engine.interface, "speed-controlled");
    })
    it('should reset interface on an engine correctly', function(){
        var engine = new TimeEngine();
        var oldResetNextTime = engine.resetNextTime;
        var oldResetNextPosition = engine.resetNextPosition;
        TimeEngine.setScheduled(engine, 56, function(){return 42}, function(){return 24});
        TimeEngine.resetInterface(engine);
        assert.equal(engine.interface, null);
        assert.equal(engine.resetNextTime, oldResetNextTime);
        assert.equal(engine.resetNextPosition, oldResetNextPosition);
    })
    it('should correctly assign currentTime and currentPosition on an engine', function(){
        var engine = new TimeEngine();
        TimeEngine.setScheduled(engine, 56, function(){return 42}, function(){return 24});
        assert.equal(engine.currentTime, 42)
        assert.equal(engine.currentPosition, 24)
    })
});
