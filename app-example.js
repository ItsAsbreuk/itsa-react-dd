'use strict';

const React = require('react'),
    ReactDOM = require('react-dom'),
    dd = require('./index');

const props1 = {
    'data-draggable': dd.generateId(),
    'data-draggable-proxy': 'blur',
    'data-draggable-constrain': 'window',
    'data-draggable-droptarget': 'dropzone',
    dangerouslySetInnerHTML: {__html: 'Drag me'}
};

const props2 = {
    'data-draggable': dd.generateId(),
    'data-draggable-proxy': 'reverse-blur',
    'data-draggable-constrain': 'window',
    'data-draggable-droptarget': 'dropzone',
    dangerouslySetInnerHTML: {__html: 'Drag me'}
};

const props3 = {
    'data-draggable': dd.generateId(),
    'data-draggable-proxy': 'outline',
    'data-draggable-constrain': 'window',
    'data-draggable-droptarget': 'dropzone',
    dangerouslySetInnerHTML: {__html: 'Drag me'}
};

const props4 = {
    'data-draggable': dd.generateId(),
    'data-draggable-constrain': 'window',
    'data-draggable-droptarget': 'dropzone',
    dangerouslySetInnerHTML: {__html: 'Drag me'}
};

ReactDOM.render(
    <div {...props1} />,
    document.getElementById('component-container1')
);

ReactDOM.render(
    <div {...props2} />,
    document.getElementById('component-container2')
);

ReactDOM.render(
    <div {...props3} />,
    document.getElementById('component-container3')
);

ReactDOM.render(
    <div {...props4} />,
    document.getElementById('component-container4')
);
