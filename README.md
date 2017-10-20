[![Build Status](https://travis-ci.org/ItsAsbreuk/itsa-react-dd.svg?branch=master)](https://travis-ci.org/ItsAsbreuk/itsa-react-dd)

Drag and Drop for React.js without a wrapper Component.
Note: can also be used in projects without React.

Easy to use, just add a data-attribute.

## How to use

Just set the attribute data-draggable to an arbitrary String and the Component becomes draggable. You need to use unique data-draggablevalues for each draggable item. This is where `dd.generateId()` becomes handy: it generates unique Id's. (note: generate those ids during initialization of the component, NOT inside render as you don't want new Id on every update).

[View live example](http://projects.itsasbreuk.nl/react-components/itsa-dd/component.html)

### Making draggable: `data-draggable`

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} />,
    document.getElementById("container")
);
```

### Constrain: `data-draggable-constrain`
*data-draggable-constrain* can be a css-selector or "window".

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} data-draggable-constrain="window" />,
    document.getElementById("container")
);
```

### Restriction directions: `data-draggable-x` or `data-draggable-y`

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} data-draggable-y={true} />,
    document.getElementById("container")
);
```

### Drag by handle: `data-draggable-handle`
*data-draggable-handle* is a css-selector.

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} data-draggable-handle="h1" />,
    document.getElementById("container")
);
```

### Proxy dragging: `data-draggable-proxy`
*data-draggable-proxy* is either "true", "outline", "blur" or "reverse-blur"

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} data-draggable-proxy="outline" />,
    document.getElementById("container")
);
```


### Dragging related at the same time: `data-draggable-group`
All other Elements with the same *data-draggable-group* will be dragged whenever one item of the group is dragged.

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId1 = dd.generateId(),
    dragId2 = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId1} data-draggable-group="mygroup" />,
    document.getElementById("container1")
);

ReactDOM.render(
    <div data-draggable={dragId2} data-draggable-group="mygroup" />,
    document.getElementById("container2")
);
```

### Drop Targets: `data-draggable-droptarget`
*data-draggable-droptarget* makes releasing (dropping) only available on Elements with a matching *data-dropzone* attribute.

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

// defining the draggable:
ReactDOM.render(
    <div data-draggable={dragId} data-draggable-droptarget="myDropzone" />,
    document.getElementById("container1")
);

// defining the dropzone:
ReactDOM.render(
    <div data-dropzone="myDropzone" />,
    document.getElementById("container2")
);
```

## Event driven
itsa-react-dd is *event driven*. It just works out of the box, but you can use the event system to interact or listen to events. The Event system that is used is [itsa-event](http://itsa.github.io/docs/itsa-event/index.html), which has `before` and `after` listeners.

### Available events:

\*:dd --> dragging starts
\*:drag --> movement
\*.drop --> pointer is released

You can listen by wildcard, for example "\*:dd", or by emitter name: "UI:dd" or "myEmitter:dd"

### Example preventing drop
This example will prevent your drag to drop, leading into moving the Element into its original position:

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} />,
    document.getElementById("container")
);

Event.before("*:drop", function(e) {
    e.preventDefault();
});
```

### Example get informed when dragging is started and ends
This example will inform you when dragging starts and ends, with the same subscriber. Because the default function returns `e.returnValue` as a Promise, we can use this as a handler to get informed when dd is ready.

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} />,
    document.getElementById("container")
);

Event.after("*:dd", function(e) {
    console.warn("Dragging is started");
    e.returnValue.then(function() {
        console.warn("Ready dragging");
    });
});
```

### Example get informed on dropped inside a dropzone
This example will inform you whenever a drop inside a dropzone has taken place.
The after-subscriber only gets invoked upon a successful drop: if dropped outside the dropzone, there won't be an after event.

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

// defining the draggable:
ReactDOM.render(
    <div data-draggable={dragId} data-draggable-droptarget="myDropzone" />,
    document.getElementById("container1")
);

// defining the dropzone:
ReactDOM.render(
    <div data-dropzone="myDropzone" />,
    document.getElementById("container2")
);

Event.after("*:drop", function(e) {
    console.warn(e.target, "got dropped inside", e.dropTarget);
});
```

### Example disable dragging
This example will disable dragging as a whole.

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} />,
    document.getElementById("container")
);

Event.before("*:dd", function(e) {
    e.preventDefault();
});
```

### Using a different emitter-name: `data-draggable-emitter`
By specifying *data-draggable-emitter*, the underlying event-system fires events on behalf of this emitter. Without an emitter, the events "UI:dd", "UI:drag" and "UI:drop" will be used, with emitter (say "myEmitter"), it becomes: "myEmitter:dd", "myEmitter:drag" and "myEmitter:drop".

```js
const ReactDOM = require("react-dom"),
    dd = require("itsa-react-dd"),
    dragId = dd.generateId();

ReactDOM.render(
    <div data-draggable={dragId} data-draggable-emitter="myEmitter" />,
    document.getElementById("container")
);
```

## Browser support
IE8+ and all modern browsers