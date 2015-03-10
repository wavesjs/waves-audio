var assert = require('assert');

var PriorityQueue = require('../es6/utils/priority-queue');

describe("PriorityQueue", function(){
    it("should insert properly", function(){
        var pq = new PriorityQueue();
        var obj = {foo: 'bar'};
        var time = 1;
        pq.insert(obj, time);
        assert.deepEqual(pq.__objects[0], [obj, time]);
        // Insert obj with time Infinty == remove object
        var pq2 = new PriorityQueue();
        pq2.insert(obj, Infinity);
        assert.deepEqual(pq2.__objects.length, 0);
        // Insert sort is false
        var pq3 = new PriorityQueue();
        var obj1 = {foo1: 'bar1'};
        var time1 = 1;
        var obj2 = {foo2: 'bar2'};
        var time2 = 2;
        pq3.insert(obj2, time2, false);
        pq3.insert(obj1, time1, false);
        assert.deepEqual(pq3.__objects[0], [obj2, time2]);
        assert.deepEqual(pq3.__objects[1], [obj1, time1]);
    });
    it("should insert reverse properly", function(){
        var pq3 = new PriorityQueue();
        pq3.reverse = true;
        var obj1 = {foo1: 'bar1'};
        var time1 = 1;
        var obj2 = {foo2: 'bar2'};
        var time2 = 2;
        pq3.insert(obj1, time1);
        pq3.insert(obj2, time2);
        assert.deepEqual(pq3.__objects[0], [obj2, time2]);
        assert.deepEqual(pq3.__objects[1], [obj1, time1]);
    });
    it("should move properly", function(){
        var pq = new PriorityQueue();
        var obj1 = {foo1: 'bar1'};
        var time1 = 1;
        var obj2 = {foo2: 'bar2'};
        var time2 = 2;
        pq.insert(obj1, time1);
        pq.insert(obj2, time2);
        var time3 = 3;
        pq.move(obj1, 3);
        assert.deepEqual(pq.__objects[0], [obj2, time2]);
        assert.deepEqual(pq.__objects[1], [obj1, time3]);
        // Move non existing object
        var pq2 = new PriorityQueue();
        pq2.move(obj1, time1);
        assert.deepEqual(pq2.__objects[0], [obj1, time1]);
        // Move object to time Infinity
        var pq3 =  new PriorityQueue();
        pq3.insert(obj1, 1);
        pq3.move(obj1, Infinity);
        assert.equal(pq3.__objects.length, 0);

    });
    it("should remove properly", function(){
        var pq = new PriorityQueue();
        var obj1 = {foo1: 'bar1'};
        var time1 = 1;
        var obj2 = {foo2: 'bar2'};
        var time2 = 2;
        pq.insert(obj1, time1);
        pq.insert(obj2, time2);
        pq.remove(obj2);
        assert.deepEqual(pq.__objects[0], [obj1, time1]);
        assert.equal(pq.__objects.length, 1);
    });
    it("should get head properly", function(){
        var pq = new PriorityQueue();
        var obj = {foo: 'bar'};
        var time = 1;
        pq.insert(obj, time);
        assert.deepEqual(pq.head, obj);
    });
    it("should get time properly", function(){
        var pq = new PriorityQueue();
        var obj = {foo: 'bar'};
        var time = 1;
        pq.insert(obj, time);
        assert.deepEqual(pq.time, time);
    });
    it("should clear properly", function(){
        var pq = new PriorityQueue();
        var obj = {foo: 'bar'};
        var time = 1;
        pq.insert(obj, time);
        pq.clear();
        assert.deepEqual(pq.__objects, []);
    });
});

