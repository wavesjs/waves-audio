var assert = require('assert');

var PriorityQueue = require('../es6/utils/priority-queue-heap');

describe("PriorityQueue", function(){

    it("should insert properly", function(){
        var pq = new PriorityQueue();
        var obj = {foo: 'bar'};
        var time = 1;
        pq.insert(obj, time);
        assert.equal(pq.head, obj);
        assert.equal(pq.time, time);
        // Insert obj with time Infinty == remove object
        var pq2 = new PriorityQueue();
        pq2.insert(obj, Infinity);
        assert.equal(pq2.head, null);
        assert.ok(pq2.__heap.isEmpty());
        // Insert sort is false
        var pq3 = new PriorityQueue();
        var obj1 = {foo1: 'bar1'};
        var time1 = 1;
        var obj2 = {foo2: 'bar2'};
        var time2 = 2;
        pq3.insert(obj2, time2);
        pq3.insert(obj1, time1);
        assert.equal(pq3.head, obj1);
        assert.equal(pq3.time, time1);
        pq3.__heap.deleteHead();        
        assert.equal(pq3.head, obj2);
        assert.equal(pq3.time, time2);
    });
    it("should insert reverse properly", function(){
        var pq1 = new PriorityQueue();
        var obj1 = {foo1: 'bar1'};
        var time1 = 1;
        var obj2 = {foo2: 'bar2'};
        var time2 = 2;
        var obj3 = {foo3: 'bar3'};
        var time3 = 3;
        pq1.insert(obj1, time1);
        pq1.insert(obj2, time2);
        pq1.insert(obj3, time3);
        pq1.reverse = true;
        assert.equal(pq1.head, obj3);
        assert.equal(pq1.time, time3);
        pq1.__heap.deleteHead();  
        assert.equal(pq1.head, obj2);
        assert.equal(pq1.time, time2);
        pq1.__heap.deleteHead();  
        assert.equal(pq1.head, obj1);
        assert.equal(pq1.time, time1);

        var pq2 = new PriorityQueue();
        pq2.reverse = true;
        pq2.insert(obj1, time1);
        pq2.insert(obj2, time2);
        pq2.insert(obj3, time3);
        assert.equal(pq2.head, obj3);
        assert.equal(pq2.time, time3);
        pq2.__heap.deleteHead();  
        assert.equal(pq2.head, obj2);
        assert.equal(pq2.time, time2);
        pq2.__heap.deleteHead();  
        assert.equal(pq2.head, obj1);
        assert.equal(pq2.time, time1);
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
        assert.equal(pq.head, obj2);
        assert.equal(pq.time, time2);
        pq.__heap.deleteHead()
        assert.equal(pq.head, obj1);
        assert.equal(pq.time, time3);
        // Move non existing object
        var pq2 = new PriorityQueue();
        pq2.move(obj1, time1);
        assert.equal(pq2.head, obj1);
        assert.equal(pq2.time, time1);
        // Move object to time Infinity
        var pq3 =  new PriorityQueue();
        pq3.insert(obj1, 1);
        pq3.move(obj1, Infinity);
        assert.ok(pq3.__heap.isEmpty());
                var pq = new PriorityQueue();
        var pq4 = new PriorityQueue();
        pq4.reverse = true;
        pq4.insert(obj1, time1);
        pq4.insert(obj2, time2);
        var time3 = 3;
        pq4.move(obj2, 3);
        assert.equal(pq4.head, obj2);
        assert.equal(pq4.time, time3);
        pq4.__heap.deleteHead()
        assert.equal(pq4.head, obj1);
        assert.equal(pq4.time, time1);
        // Move non existing object
        var pq5 = new PriorityQueue();
        pq5.reverse = true;
        pq5.move(obj1, time1);
        assert.equal(pq5.head, obj1);
        assert.equal(pq5.time, time1);
        // // Move object to time Infinity
        var pq6 =  new PriorityQueue();
        pq6.reverse = true;
        pq6.insert(obj1, 1);
        pq6.move(obj1, Infinity);
        assert.ok(pq6.__heap.isEmpty());
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
        assert.equal(pq.__heap.currentSize, 1);
        pq.__heap.deleteHead()
        assert.ok(pq.__heap.isEmpty());
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
        assert.ok(pq.__heap.isEmpty());
        var pq1 = new PriorityQueue();
        pq1.reverse = true;
        pq1.insert(obj, time);
        pq1.clear();
        assert.ok(pq1.__heap.isEmpty());
    });
});

