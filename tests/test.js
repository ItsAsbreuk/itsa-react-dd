// global describe, it, before, after

"use strict";

// var chai = require("chai"),
//     expect = chai.expect;

var getLeft = function(node) {
    return node.getBoundingClientRect().left;
};

var getTop = function(node) {
    return node.getBoundingClientRect().top;
};

describe("Drag and Drop", function () {

    before(function () {
        // this.jsdom = require("jsdom");
        // this.document = this.jsdom.jsdom("");
        // this.window = this.document.defaultView;
        // this.dd = require("../lib/drag-drop")(this.window);
        // // this.jsdom = require("jsdom-global")();
        // this.node1 = this.document.createElement('div');
        // this.node1.setAttribute('data-draggable', this.dd.generateId());
        // this.node1.setAttribute('style', 'width:100px;height: 100px;left:5px;top:5px;position:absolute;');
        // this.document.body.appendChild(this.node1);
        // this.mouseDownEvent = new this.window.Event("mousedown", {
        //     bubbles: true,
        //     view: this.window,
        //     cancelable: true,
        //     clientX: 50,
        //     clientY: 50
        // });
        // this.mouseMoveEvent = new this.window.Event("mousemove", {
        //     bubbles: true,
        //     view: this.window,
        //     cancelable: true,
        //     clientX: 60,
        //     clientY: 70
        // });
    });

    after(function () {
        // this.jsdom();
    });

    // TODO create testst that can be run on node
    it("will move", function () {
    });

});

describe("DOM Tests", function () {
    var el = document.createElement("div");
    el.id = "myDiv";
    el.innerHTML = "Hi there!";
    el.style.background = "#ccc";
    document.body.appendChild(el);

    var myEl = document.getElementById('myDiv');
    it("is in the DOM", function () {
        expect(myEl).to.not.equal(null);
    });

    it("is a child of the body", function () {
        expect(myEl.parentElement).to.equal(document.body);
    });

    it("has the right text", function () {
        expect(myEl.innerHTML).to.equal("Hi there!");
    });

    it("has the right background", function () {
        expect(myEl.style.background).to.equal("rgb(204, 204, 204)");
    });
});
