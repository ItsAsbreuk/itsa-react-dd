/* global describe, it, beforeEach, afterEach, expect */

var dd = window.itsa_dd; // will also work on nodejs test environment

var getLeft = function(node) {
    return node.getBoundingClientRect().left;
};

var getTop = function(node) {
    return node.getBoundingClientRect().top;
};

var mouseDownEvent, mouseUpEvent, mouseMoveEvent, evtFn;

evtFn = (typeof window.MouseEvent==='function') ? 'MouseEvent' : 'Event';

mouseDownEvent = new window[evtFn]('mousedown', {
    bubbles: true,
    view: window,
    cancelable: true
});

mouseUpEvent = new window[evtFn]('mouseup', {
    bubbles: true,
    view: window,
    cancelable: true
});

mouseMoveEvent = new window[evtFn]('mousemove', {
    bubbles: true,
    view: window,
    cancelable: true
});

describe('Drag and Drop without dropzone', function() {

    beforeEach(function() {
        this.node = document.createElement('div');
        this.node.setAttribute('data-draggable', dd.generateId());
        this.node.setAttribute('style', 'width:100px;height: 100px;left:5px;top:15px;position:absolute;');
        document.body.appendChild(this.node);
    });

    afterEach(function() {
        document.body.removeChild(this.node);
    });

    it('will move', function() {
        mouseDownEvent.clientX = 30;
        mouseDownEvent.clientY = 40;
        this.node.dispatchEvent(mouseDownEvent);
        mouseMoveEvent.clientX = 130;
        mouseMoveEvent.clientY = 240;
        this.node.dispatchEvent(mouseMoveEvent);
        this.node.dispatchEvent(mouseUpEvent);
        expect(getLeft(this.node)).to.be.eql(105);
        expect(getTop(this.node)).to.be.equal(215);
    });

});

describe('Drag and Drop with dropzone', function() {

    beforeEach(function() {
        this.node = document.createElement('div');
        this.node.setAttribute('data-draggable', dd.generateId());
        this.node.setAttribute('data-draggable-droptarget', 'dropzone');
        this.node.setAttribute('style', 'width:100px;height: 100px;left:5px;top:15px;position:absolute;');
        document.body.appendChild(this.node);

        this.dropzoneNode = document.createElement('div');
        this.dropzoneNode.setAttribute('data-dropzone', 'dropzone');
        this.dropzoneNode.setAttribute('style', 'width:500px;height: 500px;left:500px;top:500px;position:absolute;');
        document.body.appendChild(this.dropzoneNode);
    });

    afterEach(function() {
        document.body.removeChild(this.node);
        document.body.removeChild(this.dropzoneNode);
    });

    it('will move into dropzone', function(done) {
        var node = this.node;
        mouseDownEvent.clientX = 30;
        mouseDownEvent.clientY = 40;
        node.dispatchEvent(mouseDownEvent);
        mouseMoveEvent.clientX = 530;
        mouseMoveEvent.clientY = 540;
        node.dispatchEvent(mouseMoveEvent);
        mouseUpEvent.clientX = 530;
        mouseUpEvent.clientY = 540;
        node.dispatchEvent(mouseUpEvent);
        setTimeout(function() {
            expect(getLeft(node)).to.be.eql(505);
            expect(getTop(node)).to.be.equal(515);
            done();
        }, 500);
    });

    it('will revert when dropped outside dropzone', function(done) {
        var node = this.node;
        mouseDownEvent.clientX = 30;
        mouseDownEvent.clientY = 40;
        node.dispatchEvent(mouseDownEvent);
        mouseMoveEvent.clientX = 130;
        mouseMoveEvent.clientY = 240;
        node.dispatchEvent(mouseMoveEvent);
        mouseUpEvent.clientX = 130;
        mouseUpEvent.clientY = 240;
        node.dispatchEvent(mouseUpEvent);
        setTimeout(function() {
            expect(getLeft(node)).to.be.eql(5);
            expect(getTop(node)).to.be.equal(15);
            done();
        }, 500);
    });

    it('will move into dropzone and reposition up', function(done) {
        var node = this.node;
        mouseDownEvent.clientX = 30;
        mouseDownEvent.clientY = 40;
        node.dispatchEvent(mouseDownEvent);
        mouseMoveEvent.clientX = 500;
        mouseMoveEvent.clientY = 500;
        node.dispatchEvent(mouseMoveEvent);
        mouseUpEvent.clientX = 500;
        mouseUpEvent.clientY = 500;
        node.dispatchEvent(mouseUpEvent);
        setTimeout(function() {
            expect(getLeft(node)).to.be.eql(500);
            expect(getTop(node)).to.be.equal(500);
            done();
        }, 500);
    });

    it('will move into dropzone and reposition down', function(done) {
        var node = this.node;
        mouseDownEvent.clientX = 30;
        mouseDownEvent.clientY = 40;
        node.dispatchEvent(mouseDownEvent);
        mouseMoveEvent.clientX = 1000;
        mouseMoveEvent.clientY = 1000;
        node.dispatchEvent(mouseMoveEvent);
        mouseUpEvent.clientX = 1000;
        mouseUpEvent.clientY = 1000;
        node.dispatchEvent(mouseUpEvent);
        setTimeout(function() {
            expect(getLeft(node)).to.be.eql(900);
            expect(getTop(node)).to.be.equal(900);
            done();
        }, 500);
    });

});
