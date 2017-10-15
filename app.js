"use strict";

let thisNode;

const React = require("react"),
    Event = require('itsa-event'),
    ReactDOM = require("react-dom");
    // Component = require("./lib/component-styled.jsx");

// let setXY = require('./lib/extend-element').setXY;

const later = require('itsa-utils').later;

var dd = require('./index');

const props = {
    className: 'relative',
    'data-draggable': dd.generateId(),
    // 'data-draggable-x': 'true',
    // 'data-draggable-y': 'true',
    // 'data-draggable-proxy': 'true',
    // 'data-draggable-proxy': 'outline',
    // 'data-draggable-proxy': 'blur',
    'data-draggable-proxy': 'reverse-blur',
    'data-draggable-constrain': 'window',
    'data-draggable-handle': 'h1',
    'data-draggable-droptarget': 'dropzone1',
    'data-draggable-group': 'group-one',
    ref: node => thisNode=node,
    dangerouslySetInnerHTML: {__html: '<h1>ha<i>ndl</i>e</h1>'}
};

const props2 = {
    className: 'relative',
    'data-draggable': dd.generateId(),
    // 'data-draggable-y': 'true',
    'data-draggable-constrain': 'window',
    'data-draggable-group': 'group-one',
    'data-draggable-emitter': 'my-emitter',
    'data-draggable-droptarget': 'dropzone1, dropzone2',
    ref: node => thisNode=node
};

const props3 = {
    className: 'relative',
    'data-draggable': dd.generateId(),
    // 'data-draggable-y': 'true',
    'data-draggable-constrain': 'window',
    'data-draggable-group': 'group-two',
    'data-draggable-droptarget': 'dropzone2',
    ref: node => thisNode=node
};

ReactDOM.render(
    <div {...props} />,
    document.getElementById("component-container")
);

ReactDOM.render(
    <div {...props2} />,
    document.getElementById("component2-container")
);

ReactDOM.render(
    <div {...props3} />,
    document.getElementById("component3-container")
);

Event.after("*:dd", function(e) {
    console.warn("Dragging is started");
    e.returnValue.then(function() {
        console.warn("Ready dragging");
    });
});

// Event.after("*:drop", function(e) {
//     console.warn(e.target, "got dropped inside", e.dropTarget);
// });

// Event.before("*:drop", function(e) {
//     e.preventDefault();
// });
