/* global describe, it, before, after, expect, callPhantom */

var dd = window.itsa_dd; // will also work on nodejs test environment

var getLeft = function(node) {
    return node.getBoundingClientRect().left;
};

var getTop = function(node) {
    return node.getBoundingClientRect().top;
};

describe('Drag and Drop', function() {

    before(function() {
        this.node = document.createElement('div');
        this.node.setAttribute('data-draggable', dd.generateId());
        this.node.setAttribute('style', 'width:100px;height: 100px;left:5px;top:15px;position:absolute;');
        document.body.appendChild(this.node);
    });

    after(function() {
        document.body.removeChild(this.node);
    });

    it('will move', function() {
        // console.warn(getLeft(this.node));
        // console.warn(document.head.outerHTML);
        // callPhantom({'sendEvent': ['mousedown', 50, 60]});
        // callPhantom({'sendEvent': ['mousemove', 260, 370]});
        // callPhantom({'sendEvent': ['mouseup']});
        // document.sendEvent('mousedown', 10, 10);
        // document.sendEvent('mousemove', 210, 310);
        // console.warn(getLeft(this.node));
        // console.warn(document.head.outerHTML);
        // expect(getLeft(this.node)).to.be.eql(205);
        // expect(getTop(this.node)).to.be.equal(315);
    });

});
