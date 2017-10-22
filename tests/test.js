/* global describe, it, before, after, expect, sendEvent */

var dd = window.itsa_dd; // will also work on nodejs test environment

var getLeft = function(node) {
    return node.getBoundingClientRect().left;
};

var getTop = function(node) {
    return node.getBoundingClientRect().top;
};

describe('Drag and Drop', function() {

    before(function() {
        this.node1 = this.document.createElement('div');
        this.node1.setAttribute('data-draggable', dd.generateId());
        this.node1.setAttribute('style', 'width:100px;height: 100px;left:5px;top:15px;position:absolute;');
        document.body.appendChild(this.node1);
    });

    after(function() {
        document.body.removeChild(this.node1);
    });

    it('will move', function() {
        sendEvent('mousedown', 10, 10);
        sendEvent('mousemove', 210, 310);
        expect(getLeft(this.node)).to.be.equal(205);
        expect(getTop(this.node)).to.be.equal(315);
    });

});
