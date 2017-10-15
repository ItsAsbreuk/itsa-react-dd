'use strict';

/**
 * Provides `drag and drop` functionality, without dropzones.
 * For `dropzone`-support, you should use the module: `drag-drop`.
 *
 *
 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 * @example
 * DD = require('drag')(WIN);
 * DD.init();
 *
 * @module drag
 * @class DD
 * @since 0.0.4
*/

require('itsa-dom');
require('itsa-jsext');

var DRAG = 'drag',
    DROP = 'drop',
    Event = require('itsa-event'),
    idGenerator = require('itsa-utils').idGenerator,
    DATA_DRAGGABLE = 'data-draggable',
    CONSTRAIN_ATTR = DATA_DRAGGABLE+'-constrain',
    DATA_DRAGGABLE_DROPTARGET = DATA_DRAGGABLE + '-droptarget',
    MOUSE = 'mouse',
    EMITTER = 'emitter',
    DD_EMITTER = DATA_DRAGGABLE+'-'+EMITTER,
    DD_DRAG = DRAG,
    DD_DROP = DROP,
    DD_FAKE = 'fake-',
    DOWN = 'down',
    UP = 'up',
    MOVE = 'move',
    MOUSEUP = MOUSE+UP,
    MOUSEDOWN = MOUSE+DOWN,
    MOUSEMOVE = MOUSE+MOVE,
    TOUCH = 'touch',
    TOUCHSTART = TOUCH+'start',
    TOUCHMOVE = TOUCH+MOVE,
    TOUCHEND = TOUCH+'end',
    DD_FAKE_MOUSEUP = DD_FAKE+MOUSEUP,
    UI = 'UI',
    BORDER = 'border',
    WIDTH = 'width',
    BORDER_LEFT_WIDTH = BORDER+'-left-'+WIDTH,
    BORDER_TOP_WIDTH = BORDER+'-top-'+WIDTH,
    MARGIN_ = 'margin-',
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
    MARGIN_LEFT = MARGIN_+LEFT,
    MARGIN_RIGHT = MARGIN_+RIGHT,
    MARGIN_TOP = MARGIN_+TOP,
    MARGIN_BOTTOM = MARGIN_+BOTTOM,
    WINDOW = 'window',
    NO_OVERFLOW = 'no-overflow',
    ITSA_WINSCROLL = 'data-itsa-winscroll',
    DIRECTION_X = DATA_DRAGGABLE+'-x',
    DIRECTION_Y = DATA_DRAGGABLE+'-y',
    DRAGGABLE_GROUP = DATA_DRAGGABLE+'-group',
    DRAGGABLE_HANDLE = DATA_DRAGGABLE+'-handle',
    DRAGGABLE_PROXY = DATA_DRAGGABLE+'-proxy',
    ITSA_DRAGGABLE = '['+DATA_DRAGGABLE+']',
    VALID_PROXY = {
        'true': true,
        'outline': true,
        'blur': true,
        'reverse-blur': true
    };

module.exports = function(WIN) {

    // create global `_ITSA` if not created yet
    WIN._ITSA || Object.itsa_protectedProp(WIN, '_ITSA', Object.create(null));

    if (WIN._ITSA.Drag) {
        return WIN._ITSA.Drag; // Drag was already created: don't create multiple times
    }

    var mobileEvents = false,
        extendElement = require('./extend-element')(WIN),
        setXY = extendElement.setXY,
        transitionTo = extendElement.transitionTo,
        addClass = extendElement.addClass,
        removeClass = extendElement.removeClass,
        DOCUMENT = WIN.document,
        htmlNode = DOCUMENT.documentElement,
        HEAD = DOCUMENT.head,
        IE8_EVENTS = !htmlNode.addEventListener,
        DD, noScrollOnDrag, setListener, removeListener, stylenode, transitionCss;

    noScrollOnDrag = function(e) {
        if (e.target.matches(ITSA_DRAGGABLE) || e.target.itsa_inside(ITSA_DRAGGABLE)) {
            e.preventDefault();
        }
    };

    removeListener = function(evt, func) {
        if (IE8_EVENTS) {
            DOCUMENT.detachEvent('on'+evt, func);
        }
        else {
            DOCUMENT.removeEventListener(evt, func, {capture: true, passive: false});
        }
    };

    setListener = function(evt, func) {
        if (IE8_EVENTS) {
            DOCUMENT.attachEvent('on'+evt, func);
        }
        else {
            DOCUMENT.addEventListener(evt, func, {capture: true, passive: false});
        }
    };

    DD = {
        /**
         * Objecthash containing all specific information about the particular drag-cycle.
         * It has a structure like this:
         *
         * ddProps = {
         *     dragNode {HtmlElement} Element that is dragged
         *     x {Number} absolute x-position of the draggable inside `document` when the drag starts
         *     y {Number} absolute y-position of the draggable inside `document` when the drag starts
         *     inlineLeft {String} inline css of the property `left` when drag starts
         *     inlineTop {String} inline css of the property `top` when drag starts
         *     winConstrained {Boolean} whether the draggable should be constrained to `WIN`
         *     xMouseLast {Number} absolute x-position of the mouse inside `document` when the drag starts
         *     yMouseLast {Number} absolute y-position of the draggable inside `document` when the drag starts
         *     winScrollLeft {Number} the left-scroll of WIN when drag starts
         *     winScrollTop {Number} the top-scroll of WIN when drag starts
         *     constrain = { // constrain-properties when constrained to a HtmlElement
         *         xOrig {Number} x-position in the document, included with left-border-width
         *         yOrig {Number} y-position in the document, included with top-border-width
         *         x {Number} xOrig corrected with scroll-left of the constrained node
         *         y {Number} yOrig corrected with scroll-top of the constrained node
         *         w {Number} scrollWidth
         *         h {Number} scrollHeight
         *     };
         *     relatives[{ // Array with objects that represent all draggables that come along with the master-draggable (in case of multiple items), excluded the master draggable itself
         *         sourceNode {HtmlElement} original node (defined by drag-drop)
         *         dragNode {HtmlElement} draggable node
         *         shiftX {Number} the amount of left-pixels that this HtmlElement differs from the dragged element
         *         shiftY {Number} the amount of top-pixels that this HtmlElement differs from the dragged element
         *         inlineLeft {String} inline css of the property `left` when drag starts
         *         inlineTop {String} inline css of the property `top` when drag starts
         *     }]
         * }
         *
         * @property ddProps
         * @default {}
         * @type Object
         * @since 0.0.1
        */
        ddProps: {},

        /**
        * Default function for the `*:drag`-event
        *
        * @method _defFnDrag
        * @param e {Object} eventobject
        * @private
        * @since 0.0.1
        */
        _defFnDrag: function(e) {
            var ddProps = this.ddProps,
                dragNode = ddProps.dragNode,
                constrainNode = ddProps.constrainNode,
                winConstrained = ddProps.winConstrained,
                hasRelatives = !!ddProps.relatives,
                x, y, constrainX, constrainY, marginLeft, marginRight, marginTop, marginBottom,
                constrainX1, constrainX2, constrainY1, constrainY2;
            // is the drag is finished, there will be no ddProps.defined
            // return then, to prevent any events that stayed behind
            if (!ddProps.defined || !dragNode) {
                return;
            }

            // caution: the user might have put the mouse out of the screen and released the mousebutton!
            // If that is the case, the a mouseup-event should be initiated instead of draggin the element
            if (e.buttons===0) {
                // no more button pressed
                /**
                * Fired when the mouse comes back into the browser-WIN while drag was busy yet no buttons are pressed.
                * This is a correction to the fact that the mouseup-event wasn't noticed because the mouse was outside the browser.
                *
                * @event fake-mouseup
                * @private
                * @since 0.1
                */
                Event.emit(dragNode, DD_FAKE_MOUSEUP);
            }
            else {
                // set it again: theoretically, the constrained node might move during dragging:
                if (constrainNode) {
                    marginLeft = parseInt(constrainNode.itsa_getStyle(MARGIN_LEFT), 10);
                    marginTop = parseInt(constrainNode.itsa_getStyle(MARGIN_TOP), 10);
                    marginRight = parseInt(constrainNode.itsa_getStyle(MARGIN_RIGHT), 10);
                    marginBottom = parseInt(constrainNode.itsa_getStyle(MARGIN_BOTTOM), 10);
                    constrainX = constrainNode.itsa_left -
                                 constrainNode.scrollLeft +
                                 parseInt(constrainNode.itsa_getStyle(BORDER_LEFT_WIDTH), 10) +
                                 marginLeft;
                    constrainY = constrainNode.itsa_top -
                                 constrainNode.scrollTop +
                                 parseInt(constrainNode.itsa_getStyle(BORDER_TOP_WIDTH), 10) +
                                 marginTop;
                    ddProps.constrain = {
                        x1: constrainX,
                        y1: constrainY,
                        x2: constrainX +
                            Math.min(constrainNode.scrollWidth, constrainNode.offsetWidth) -
                            dragNode.offsetWidth -
                            marginLeft -
                            marginRight,
                        y2: constrainY +
                            Math.min(constrainNode.scrollHeight, constrainNode.offsetHeight) -
                            dragNode.offsetHeight -
                            marginTop -
                            marginBottom
                    };
                }
                if (ddProps.xMovable) {
                    x = ddProps.x+e.xMouse+(winConstrained ? ddProps.winScrollLeft : WIN.itsa_getScrollLeft())-e.xMouseOrigin;
                }
                if (ddProps.yMovable) {
                    y = ddProps.y+e.yMouse+(winConstrained ? ddProps.winScrollTop : WIN.itsa_getScrollTop())-e.yMouseOrigin;
                }

                if (ddProps.constrain) {
                    constrainX1 = ddProps.constrain.x1;
                    constrainX2 = ddProps.constrain.x2;
                    constrainY1 = ddProps.constrain.y1;
                    constrainY2 = ddProps.constrain.y2;
                    if (hasRelatives) {
                        constrainX1 -= ddProps.relativesExtraConstrain.x1;
                        constrainX2 -= ddProps.relativesExtraConstrain.x2;
                        constrainY1 -= ddProps.relativesExtraConstrain.y1;
                        constrainY2 -= ddProps.relativesExtraConstrain.y2;
                    }
                    x = Math.min(Math.max(constrainX1, x), constrainX2);
                    y = Math.min(Math.max(constrainY1, y), constrainY2);
                }
                setXY(dragNode, x, y);

                hasRelatives && ddProps.relatives.forEach(
                    function(item) {
                        setXY(item.dragNode, x+item.shiftX, y+item.shiftY);
                    }
                );
                ddProps.winConstrained || dragNode.itsa_forceIntoNodeView();
                constrainNode && dragNode.itsa_forceIntoNodeView(constrainNode);
            }
        },

        /**
         * Default function for the `*:drop`-event
         *
         * @method _defFnDrop
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _defFnDrop: function(e) {
            var instance = this,
                dragNode = e.target,
                isCloned = dragNode._isCloned,
                originalDragNode = e.originalDragNode,
                dropTarget = e.dropTarget,
                node, relatives;

            // unset a data-attribute to `htmlNode`
            htmlNode.removeAttribute(DATA_DRAGGABLE_DROPTARGET);
            if (isCloned) {
                // remove proxynode and set original node to the right position:
                instance._removeProxyNode(dragNode, originalDragNode);
                // same for all relatives:
                e.originalRelativeRefs && e.originalRelativeRefs.forEach(function(obj) {
                    instance._removeProxyNode(obj.proxyNode, obj.node);
                });
            }
            // if we have a droptarget, we might need to reposution:
            if (dropTarget) {
                // we might need to reposition the node (or nodes!) a bit in order to make the fit inside the dropzone
                if (isCloned) {
                    node = originalDragNode;
                    relatives = e.originalRelativeRefs;
                }
                else {
                    node = dragNode;
                    relatives = e.relatives;
                }
                relatives && relatives.forEach(function(obj) {
                    var dragNodeRel = obj[isCloned ? 'node' : 'dragNode'];
                    transitionTo(dragNodeRel, dragNodeRel.itsa_left, dragNodeRel.itsa_top, dropTarget);
                });
                return transitionTo(node, node.itsa_left, node.itsa_top, dropTarget); // make it e.returnValue so that afterlisteners can wait
            }
        },

        /**
         * Default function for the `*:dd`-event
         *
         * @method _defFnStart
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _defFnStart: function(e) {
            var instance = this,
                customEventDrag = e.emitter + ':'+DD_DRAG,
                customEventDrop = e.emitter + ':'+DD_DROP;

            Event.defineEvent(customEventDrag)
                 .defaultFn(instance._defFnDrag.bind(instance));
            Event.defineEvent(customEventDrop)
                 .defaultFn(instance._defFnDrop.bind(instance))
                 .preventedFn(instance._prevFnDrop.bind(instance));
            // DOCUMENT.getAll('.'+DD_MASTER_CLASS).removeClass(DD_MASTER_CLASS);
            instance._initializeDrag(e);
            return e.draggable;
        },

        /**
        * Defines the definition of the `dd` event: the first phase of the drag-eventcycle (dd, *:drag, *:drop)
        *
        * @method _defineDDStart
        * @param emitterName {String} the emitterName, which leads into the definition of event `emitterName:dd`
        * @private
        * @since 0.0.1
        */
        _defineDDStart: function(emitterName) {
            var instance = this;
            // by using dd before drag, the user can create a `before`-subscriber to dd
            // and define e.emitter and/or e.relatives before going into `drag`
            // If event already exists, no action will be taken internally
            Event.defineEvent(emitterName+':dd')
                .defaultFn(instance._defFnStart.bind(instance))
                .preventedFn(instance._prevFnStart.bind(instance));
        },

        /**
         * Default function for the `*:drag`-event
         *
         * @method _initializeDrag
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _initializeDrag: function(e) {
            var instance = this,
                dragNode = e.dragNode,
                constrain = dragNode.getAttribute(CONSTRAIN_ATTR),
                directionX = dragNode.getAttribute(DIRECTION_X) || '',
                directionY = dragNode.getAttribute(DIRECTION_Y) || '',
                group = dragNode.getAttribute(DRAGGABLE_GROUP),
                ddProps = instance.ddProps,
                emitterName = e.emitter,
                x, y, constrainNode, winConstrained, winScrollLeft, winScrollTop, moveFn, releaseFn,
                extraClass, groupNodes, parentNode, difX1, difX2, difY1, difY2, dragNodeLeft,
                dragNodeRight, dragNodeTop, dragNodeBottom, proxy, dropTarget;

            moveFn = function(e2) {
                var firstTouch;
                if (e2.touches && (firstTouch=e2.touches[0])) {
                    e2.clientX = firstTouch.clientX;
                    e2.clientY = firstTouch.clientY;
                }
                if (instance.ddProps.itsa_isEmpty() || !e2.clientX) {
                    return;
                }
                // move the object
                e.xMouse = e2.clientX;
                e.yMouse = e2.clientY;
                /**
                * Emitted during the drag-cycle of a draggable Element (while it is dragged).
                *
                * @event *:drag
                * @param e {Object} eventobject including:
                * @param e.target {HtmlElement} the HtmlElement that is being dragged
                * @param e.currentTarget {HtmlElement} the HtmlElement that is delegating
                * @param e.sourceTarget {HtmlElement} the deepest HtmlElement where the mouse lies upon
                * @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
                * @param e.xMouse {Number} the current x-position in the WIN-view
                * @param e.yMouse {Number} the current y-position in the WIN-view
                * @param e.clientX {Number} the current x-position in the WIN-view
                * @param e.clientY {Number} the current y-position in the WIN-view
                * @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
                * @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
                * @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
                *        to inform which nodes are related to the draggable node and should be dragged as well.
                * @since 0.1
                */
                Event.emit(dragNode, emitterName+':'+DD_DRAG, e);
                e.draggable.callback();
            };

            releaseFn = function(e2) {
                var dragNode = instance.ddProps.dragNode,
                    firstTouch;
                // remove listener for `mousemove` and `mouseup`
                removeListener(mobileEvents ? TOUCHMOVE : MOUSEMOVE, moveFn);
                removeListener(mobileEvents ? TOUCHEND : MOUSEUP, releaseFn);

                // set mousepos for the last time:
                if (e2.changedTouches && (firstTouch=e2.changedTouches[0])) {
                    e2.clientX = firstTouch.clientX;
                    e2.clientY = firstTouch.clientY;
                }
                e.xMouse = e2.clientX;
                e.yMouse = e2.clientY;

                if (constrain && ddProps.winConstrained) {
                    // if constrained to WIN:
                    // remove overflow=hidden from the bodynode
                    htmlNode.removeAttribute(ITSA_WINSCROLL);
                }

                // modify event with properties we need inside dd:drop:
                e.originalDragNode = instance.ddProps.originalDragNode;
                e.originalRelativeRefs = instance.ddProps.originalRelativeRefs;
                e.relatives = instance.ddProps.relatives;
                e.originalX = instance.ddProps.x;
                e.originalY = instance.ddProps.y;

                instance.ddProps = {};
                /**
                * Emitted when drag-cycle of a draggable Element is ended.
                *
                * @event *:drop
                * @param e {Object} eventobject including:
                * @param e.target {HtmlElement} the HtmlElement that is being dragged
                * @param e.currentTarget {HtmlElement} the HtmlElement that is delegating
                * @param e.sourceTarget {HtmlElement} the deepest HtmlElement where the mouse lies upon
                * @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
                * @param e.xMouse {Number} the current x-position in the WIN-view
                * @param e.yMouse {Number} the current y-position in the WIN-view
                * @param e.clientX {Number} the current x-position in the WIN-view
                * @param e.clientY {Number} the current y-position in the WIN-view
                * @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
                * @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
                * @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
                *        to inform which nodes are related to the draggable node and should be dragged as well.
                * @since 0.1
                */

                Event.emit(dragNode, emitterName+':'+DD_DROP, e);

                e.draggable.fulfill();
            };

            // check if we need to make a proxy-node:
            proxy = (e.dragNode.getAttribute(DRAGGABLE_PROXY) || '').toLowerCase();
            if (VALID_PROXY[proxy]) {
                parentNode = dragNode.parentNode;
                ddProps.originalDragNode = dragNode;
                dragNode = dragNode.cloneNode(proxy!=='outline');
                dragNode._isCloned = true; // let `setXY` know that were moving a cloned node
                // let `setXY` know that were moving a cloned node; either by `true` or specifying the groupname:
                dragNode._isReverseCloned = (proxy==='reverse-blur') && (group || true);
                if (proxy==='outline') {
                    extraClass = 'itsacss-cloned-node-outline';
                }
                else if (proxy==='blur') {
                    extraClass = 'itsacss-cloned-node-blurred';
                }
                instance._insertProxyNode(parentNode, dragNode, ddProps.originalDragNode.itsa_left, ddProps.originalDragNode.itsa_top, extraClass);
                if (group) {
                    ddProps.originalRelativeRefs = [];
                    groupNodes = DOCUMENT.itsa_getAll('['+DRAGGABLE_GROUP+'="'+group+'"]:not(.itsacss-cloned-node)'); // returns an array-like object
                    Array.prototype.forEach.call(groupNodes, function(node) {
                        var proxyNode;
                        if (node!==ddProps.originalDragNode) {
                            proxyNode = node.cloneNode(true);
                            ddProps.originalRelativeRefs.push({
                                node: node,
                                proxyNode: proxyNode
                            });
                            proxyNode._isCloned = true; // let `setXY` know that were moving a cloned node
                            instance._insertProxyNode(node.parentNode, proxyNode, node.itsa_left, node.itsa_top, extraClass);
                        }
                    });
                }
            }
            // define ddProps --> internal object with data about the draggable instance
            ddProps.dragNode = dragNode;
            if (directionX || directionY) {
                ddProps.xMovable = (directionX.toLowerCase()==='true');
                ddProps.yMovable = (directionY.toLowerCase()==='true');
            }
            else {
                ddProps.xMovable = ddProps.yMovable = true;
            }
            ddProps.x = x = dragNode.itsa_left;
            ddProps.y = y = dragNode.itsa_top;
            ddProps.winConstrained = winConstrained = (constrain===WINDOW);
            ddProps.xMouseLast = x;
            ddProps.yMouseLast = y;
            if (constrain) {
                if (winConstrained) {
                    ddProps.winScrollLeft = winScrollLeft = WIN.itsa_getScrollLeft();
                    ddProps.winScrollTop = winScrollTop = WIN.itsa_getScrollTop();
                    ddProps.constrain = {
                        x1: winScrollLeft,
                        y1: winScrollTop,
                        x2: winScrollLeft+WIN.itsa_getWidth()-dragNode.offsetWidth,
                        y2: winScrollTop+WIN.itsa_getHeight()-dragNode.offsetHeight
                    };
                    // if constrained to WIN:
                    // set a class that makes overflow hidden --> this will prevent
                    // some browsers from scrolling the WIN when a pressed mouse
                    // gets out of the WIN

                    // TODO:
                    htmlNode.setAttribute(ITSA_WINSCROLL, NO_OVERFLOW);

                }
                else {
                    constrainNode = dragNode.itsa_inside(constrain);
                    // if there is a match, then make sure x and y fall within the region
                    if (constrainNode) {
                        ddProps.constrainNode = constrainNode;
                    }
                }
            }

            // create listener for `mousemove` and transform it into the `*:dd:drag`-event
            setListener(mobileEvents ? TOUCHMOVE : MOUSEMOVE, moveFn);
            // Event.onceAfter([mobileEvents ? TOUCHEND : MOUSEUP, DD_FAKE_MOUSEUP], function(e3) {
            setListener(mobileEvents ? TOUCHEND : MOUSEUP, releaseFn);

            setXY(dragNode, ddProps.xMouseLast, ddProps.yMouseLast);

            if (group) {
                // relatives are extra HtmlElements that should be moved aside with the main dragged element
                // e.relatives is a selector, e.relativeNodes will be an array with nodes
                // in case of proxy: only take into account the nodes that are cloned (proxy-nodes)
                groupNodes = DOCUMENT.itsa_getAll('['+DRAGGABLE_GROUP+'="'+group+'"]'+(dragNode._isCloned ? '.itsacss-cloned-node' : '')); // returns an array-like object
                // because ES5 doesn't have Array.filter, we will fill the array `relativeNodes` manually
                e.relativeNodes = [];
                ddProps.relatives = [];
                if (constrain) {
                    ddProps.relativesExtraConstrain = { // correction for positions of the other nodes
                        x1: 0,
                        x2: 0,
                        y1: 0,
                        y2: 0
                    };
                    dragNodeLeft = dragNode.itsa_left;
                    dragNodeRight = dragNode.itsa_right;
                    dragNodeTop = dragNode.itsa_top;
                    dragNodeBottom = dragNode.itsa_bottom;
                }
                Array.prototype.forEach.call(groupNodes, function(node) {
                    var item;
                    if (node!==dragNode) {
                        e.relativeNodes.push(node);
                        item = {
                            dragNode: node,
                            shiftX: node.itsa_left - x,
                            shiftY: node.itsa_top - y
                        };
                        ddProps.relatives.push(item);
                        // we might need to reassign the constrain values:
                        if (constrain) {
                            difX1 = node.itsa_left - dragNodeLeft;
                            difX2 = node.itsa_right - dragNodeRight;
                            difY1 = node.itsa_top - dragNodeTop;
                            difY2 = node.itsa_bottom - dragNodeBottom;
                            ddProps.relativesExtraConstrain.x1 = Math.min(ddProps.relativesExtraConstrain.x1, difX1);
                            ddProps.relativesExtraConstrain.x2 = Math.max(ddProps.relativesExtraConstrain.x2, difX2);
                            ddProps.relativesExtraConstrain.y1 = Math.min(ddProps.relativesExtraConstrain.y1, difY1);
                            ddProps.relativesExtraConstrain.y2 = Math.max(ddProps.relativesExtraConstrain.y2, difY2);
                        }
                    }
                });
                if (ddProps.relatives.length===0) {
                    delete ddProps.relatives;
                }
            }

            // in case of having a drop-target, we set a data-attribute to `head`, so that anyone interested gets informed by css:
            dropTarget = dragNode.getAttribute(DATA_DRAGGABLE_DROPTARGET);
            dropTarget && htmlNode.setAttribute(DATA_DRAGGABLE_DROPTARGET, dropTarget);
        },

        _insertProxyNode: function(parentNode, node, x, y, extraClass) {
            addClass(node, ['itsacss-cloned-node', 'itsacss-display-block', 'itsacss-position-absolute', 'itsacss-invisible']);
            extraClass && addClass(node, extraClass);
            parentNode.appendChild(node);
            setXY(node, x, y);
            removeClass(node, 'itsacss-invisible');
        },

        /**
         * Prevented function for the `*:drop`-event
         *
         * @method _prevFnDrop
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _prevFnDrop: function(e) {
            var instance = this,
                dragNode = e.target,
                x, y;

            // in case of having a drop-target, we unset a data-attribute to `htmlNode`
            htmlNode.removeAttribute(DATA_DRAGGABLE_DROPTARGET);
            if (dragNode._isCloned) {
                // same for all relatives:
                e.originalRelativeRefs && e.originalRelativeRefs.forEach(function(obj) {
                    instance._revertProxyNode(obj.proxyNode, obj.node);
                });
                // remove proxynode and set original node to the right position:
                return instance._revertProxyNode(dragNode, e.originalDragNode);
            }
            // remove proxynode and set original node to the right position:
            x = e.originalX;
            y = e.originalY;
            // same for all relatives:
            e.relatives && e.relatives.forEach(function(obj) {
                instance._revertNode(obj.dragNode, x+obj.shiftX, y+obj.shiftY);
            });
            return instance._revertNode(dragNode, x, y);
        },

        /**
         * Prevented function for the `*:start`-event
         *
         * @method _prevFnStart
         * @param e {Object} eventobject
         * @private
         * @since 0.0.1
         */
        _prevFnStart: function(e) {
            e.draggable.reject();
        },

        _removeProxyNode: function(node, originalDragNode) {
            setXY(originalDragNode, node.itsa_left, node.itsa_top);
            // remove the opacity of the original node:
            node._isReverseCloned && setXY(node, node.itsa_left, node.itsa_top, true);
            node.parentNode.removeChild(node);
        },

        _revertProxyNode: function(node, originalDragNode) {
            // set the position of the proxy back
            // transition the proxy back to its original position:
            return transitionTo(node, originalDragNode.itsa_left, originalDragNode.itsa_top).itsa_finally(function() {
                // remove the opacity of the original node:
                node._isReverseCloned && setXY(node, node.itsa_left, node.itsa_top, true);
                node.parentNode.removeChild(node);

            });
        },

        _revertNode: function(node, x, y) {
            // transition the proxy back to its original position:
            return transitionTo(node, x, y).itsa_finally(function() {
                // remove the opacity of the original node:
                setXY(node, x, y, true);
            });
        },

        /**
        * Engine behind the drag-drop-cycle.
        * Sets up a `mousedown` listener to initiate a drag-drop eventcycle. The eventcycle start whenever
        * one of these events happens on a HtmlElement with the attribute data-draggable="true"`.
        * The drag-drop eventcycle consists of the events: `start`, `emitterName:drag` and `emitterName:drop`
        *
        *
        * @method init
        * @private
        * @since 0.0.1
        */
        init: function() {
            var instance = this,
                nodeTargetFn, setMobileEventSupport;

            setMobileEventSupport = function() {
                removeListener(MOUSEDOWN, nodeTargetFn);
                mobileEvents = true;
            };

            nodeTargetFn = function(e) {
                var node = e.target,
                    isDraggable = node.matchesSelector(ITSA_DRAGGABLE),
                    handle, emitterName, parentDragNode, handleMatch, parentHandleNode, firstTouch;

                parentDragNode = !isDraggable && node.itsa_inside(ITSA_DRAGGABLE);
                if (isDraggable || parentDragNode) {
                    e.dragNode = parentDragNode || node;
                    if (e.touches && (firstTouch=e.touches[0])) {
                        e.clientX = firstTouch.clientX;
                        e.clientY = firstTouch.clientY;
                    }

                    // first check if there is a handle to determine if the drag started here:
                    handle = e.dragNode.getAttribute(DRAGGABLE_HANDLE);
                    if (handle) {
                        handleMatch = node.matchesSelector(handle);
                        // if no match then the click could still be on a descendent node:
                        if (!handleMatch && parentDragNode) {
                            parentHandleNode = node.itsa_inside(handle);
                            e.handleNode = parentHandleNode.itsa_inside(parentDragNode);
                        }
                        else {
                            e.handleNode = handleMatch && node;
                        }
                        if (!e.handleNode) {
                            return;
                        }
                    }

                    // initialize ddProps: have to do here, because the event might not start because it wasn't inside the handle when it should be
                    instance.ddProps = {
                        defined: true,
                        dragOverList: []
                    };

                    // add `drag`-Promise to the eventobject --> this Promise will be resolved once the pointer has released.
                    e.draggable = Promise.itsa_manage();
                    e.draggable.catch(function(err) {
                        console.warn('draggable rejected: '+err);
                    });

                    // define e.setOnDrag --> users
                    e.setOnDrag = function(callbackFn) {
                        e.draggable.setCallback(callbackFn);
                    };
                    // store the orriginal mouseposition:
                    e.xMouseOrigin = e.clientX + WIN.itsa_getScrollLeft();
                    e.yMouseOrigin = e.clientY + WIN.itsa_getScrollTop();

                    // set the emitterName:
                    emitterName = e.dragNode.getAttribute(DD_EMITTER) || UI;
                    // now we can start the eventcycle by emitting emitterName:dd:
                    /**
                    * Emitted when a draggable Element's drag-cycle starts. You can use a `before`-subscriber to specify
                    * e.relatives, which should be a nodelist with HtmlElements, that should be dragged togehter with the master
                    * draggable Element.
                    *
                    * @event *:dd
                    * @param e {Object} eventobject including:
                    * @param e.target {HtmlElement} the HtmlElement that is being dragged
                    * @param e.currentTarget {HtmlElement} the HtmlElement that is delegating
                    * @param e.sourceTarget {HtmlElement} the deepest HtmlElement where the mouse lies upon
                    * @param e.dd {Promise} Promise that gets fulfilled when dragging is ended. The fullfilled-callback has no arguments.
                    * @param e.xMouse {Number} the current x-position in the WIN-view
                    * @param e.yMouse {Number} the current y-position in the WIN-view
                    * @param e.clientX {Number} the current x-position in the WIN-view
                    * @param e.clientY {Number} the current y-position in the WIN-view
                    * @param e.xMouseOrigin {Number} the original x-position in the document when drag started (incl. scrollOffset)
                    * @param e.yMouseOrigin {Number} the original y-position in the document when drag started (incl. scrollOffset)
                    * @param [e.relatives] {NodeList} an optional list that the user could set in a `before`-subscriber of the `dd`-event
                    *        to inform which nodes are related to the draggable node and should be dragged as well.
                    * @since 0.1
                    */
                    instance._defineDDStart(emitterName);
                    Event.emit(e.target, emitterName+':dd', e);
                }
            };

            if (!instance._initiated) {
                instance._initiated = true;

                setListener(MOUSEDOWN, nodeTargetFn); // remove this listener in case of TOUCHSTART is active (mobile):
                setListener(TOUCHSTART, setMobileEventSupport);
                setListener(TOUCHSTART, nodeTargetFn);

                // prevent default behaviour on scrolling: otherwise mobile devices will scroll instead of drag:
                // scrollPreventListener = Event.before('panstart', function(e) {e.preventDefaultContinue();});
                // scrollPreventListener = Event.before('touchmove', function(e) {e.preventDefault();});

                setListener('touchstart', noScrollOnDrag);
                setListener('touchmove', noScrollOnDrag);
            }
        }
    };

    // don't drag when the cursor is above an input, text, or editable element:
    Event.before(
        '*:'+DD_DRAG,
        function(e) {
            e.preventDefault();
        },
        function(e) {
            var sourceNode= e.target,
                tagName = sourceNode.tagName;
            return (tagName==='INPUT') || (tagName==='TEXTAREA') || (sourceNode.getAttribute('contenteditable')==='true');
        }
    );

    // don't drag any native drag-drop items when they are part of dd, because they prevent they corrupt dragging:
    setListener('dragstart', function(e) {
        if (e.target.matchesSelector(ITSA_DRAGGABLE) || e.target.itsa_inside(ITSA_DRAGGABLE)) {
            e.preventDefault();
        }
    });

    // declare a global style:
    stylenode = DOCUMENT.createElement('style');
    stylenode.setAttribute('type', 'text/css');
    HEAD.appendChild(stylenode);
    transitionCss = 'transition: top 0.25s ease-out, left 0.25s ease-out, transform 0.25s ease-out !important;';
    stylenode.textContent = 'html['+ITSA_WINSCROLL+'="'+NO_OVERFLOW+'"] body {\noverflow: hidden !important;\n}\n' +
                            '.itsacss-invisible {\nopacity: 0 !important; left: -9999px !important; top: -9999px !important; z-index: -1001 !important;}\n' +
                            '.itsacss-display-block {\ndisplay: block !important;}\n' +
                            '.itsacss-position-absolute {\nposition: absolute !important;}\n' +
                            'div['+DATA_DRAGGABLE+'].itsacss-drag-revert-trans {\n-webkit-'+ transitionCss +
                                                         ' -moz-' + transitionCss +
                                                         ' -ms-' + transitionCss +
                                                         ' -o-' + transitionCss +
                                                         ' ' + transitionCss + '}\n' +
                            '.itsacss-cloned-node-outline {\nbox-shadow: 0 0 0 1px #333 inset !important; background: transparent !important}\n' +
                            '.itsacss-cloned-node-blurred {\nopacity: 0.6;filter: alpha(opacity=60);}\n';

    DD.init();
    WIN._ITSA.Drag = DD;

    Event.before('*:drop', function(e) {
        var liesInsideNode, dropZones, x, y, dropTargets,
            dragNode = e.dragNode,
            dropTarget = dragNode.getAttribute(DATA_DRAGGABLE_DROPTARGET);
        if (dropTarget) {
            // split droptarget into an array: we might have specified more than 1 target
            dropTargets = dropTarget.split(',').map(function(item) {
                return item.itsa_trim();
            });
            // only accept drop if the draggable node is released above a droptarget
            // first, we need to find all the dropzones:
            dropZones = DOCUMENT.itsa_getAll('[data-dropzone]');
            x = e.xMouse;
            y = e.yMouse;
            // next, check if the position lies within at least one of the dropzones:
            Array.prototype.some.call(dropZones, function(dropZoneNode) {
                if (dropTargets.itsa_contains(dropZoneNode.getAttribute('data-dropzone')) && dropZoneNode.itsa_insidePos(x, y)) {
                    liesInsideNode = dropZoneNode;
                }
                return liesInsideNode;
            });
            if (!liesInsideNode) {
                e.preventDefault(); // will revert the draggable node to its original position
            }
            else {
                e.dropTarget = liesInsideNode;
            }
        }
    });

    return {
        generateId: function() {
            return idGenerator('itsa-dd');
        }
    };
};
