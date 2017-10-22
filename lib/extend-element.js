require('itsa-dom');
require('itsa-jsext');

module.exports = function(WINDOW) {

    var NUMBER = 'number',
        PX = 'px',
        ABSOLUTE = 'absolute',
        utils = require('itsa-utils'),
        later = utils.later,
        async = utils.async,
        STYLE_NODES = {},
        HTML5_NODES_VALUES = {},
        TIMERS = {},
        CLEANUP_TIMER = 60000, // cleanup old css definitions every 10 seconds
        DOCUMENT = WINDOW.document,
        HEAD = DOCUMENT.head,
        BODY = DOCUMENT.body,
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
        BROWSER_SUPPORTS_HTML5;

    // first: check supprt for HTML5 transform:
    var checkHTML5Support = function() {
        var node = DOCUMENT.createElement('div'),
            supportsHTML5;
        node.setAttribute('style', 'position: absolute; z-index: -1; opacity: 0; width: 0; height: 0; left: 0; transform: translateX(-10px);');
        BODY.appendChild(node);
        supportsHTML5 = !!node.itsa_left;
        BODY.removeChild(node);
        return supportsHTML5;
    };

    BROWSER_SUPPORTS_HTML5 = checkHTML5Support();

    var applyCss = function(tagName, dragId, css, dragEnd, clonedNode, reverseCloned) {
        var selector = cssString = tagName+'[data-draggable="'+dragId+'"]',
            cssId = dragId,
            cssString, stylenode, stylenodeOriginal, cssOriginalId, selectorOriginal;

        if (clonedNode) {
            if (reverseCloned) {
                cssOriginalId = cssId + '#proxy_original';
                if (typeof reverseCloned==='string') {
                    // grouped drag
                    selectorOriginal = tagName+'[data-draggable-group="'+reverseCloned+'"]:not(.itsacss-cloned-node)';
                }
                else {
                    selectorOriginal = selector + ':not(.itsacss-cloned-node)';
                }
                // we need an extra css rule for making the original node semi-transparent AND without making the proxynode transparent
                if (!STYLE_NODES[cssOriginalId]) {
                    STYLE_NODES[cssOriginalId] = stylenodeOriginal = DOCUMENT.createElement('style');
                    stylenodeOriginal.setAttribute('type', 'text/css');
                    HEAD.appendChild(stylenodeOriginal);
                }
                if (dragEnd) {
                    HEAD.removeChild(STYLE_NODES[cssOriginalId]);
                    delete STYLE_NODES[cssOriginalId];
                }
                else {
                    STYLE_NODES[cssOriginalId].textContent = selectorOriginal+' {\nopacity: 0.6;filter: alpha(opacity=60);}';
                }
            }
            cssId += '#cloned';
            selector += '.itsacss-cloned-node';
        }
        cssString = selector + ' {\n';
        // if stylenode is not there yet: create it
        if (!STYLE_NODES[cssId]) {
            STYLE_NODES[cssId] = stylenode = DOCUMENT.createElement('style');
            stylenode.setAttribute('type', 'text/css');
            HEAD.appendChild(stylenode);
            // we do not set a dom listener when the draggable node gets out of the dom
            // because that is too expensive
            // instead, we set a timer that checks if the node is in the dom and will remove
            // the according css node if so
            // the timer can be set very lazy, that doesn't matter. It is just to keep the dom clean when working
            // with a everlasting SPA
            TIMERS[cssId] = later(function() {
                if (!DOCUMENT.itsa_getElement(selector)) {
                    TIMERS[cssId].cancel();
                    delete TIMERS[cssId];
                    delete STYLE_NODES[cssId];
                    HEAD.removeChild(stylenode);
                }
            }, CLEANUP_TIMER, true);
        }
        css.itsa_each(function(value, prop) {
            cssString += prop+':'+value+' !important;\n';
        });
        cssString += '}\n';
        STYLE_NODES[cssId].textContent = cssString;
    };

    /**
     * Set the position of an html element in page coordinates.
     *
     * @method setXY
     * @param node {Node} the dom node
     * @param x {Number} x-value for new position (coordinates are page-based)
     * @param y {Number} y-value for new position (coordinates are page-based)
     * @since 0.0.1
     */
    var setXY = function(node, x, y, dragEnd, transitioned) {
        var dragId = node && node.getAttribute && node.getAttribute('data-draggable'),
            xtrans = (typeof x === NUMBER),
            ytrans = (typeof y === NUMBER),
            tagName;

        if (dragId && (xtrans || ytrans)) {
            x || (x=0);
            y || (y=0);
            tagName = node.tagName.toLowerCase();
            // note that with proxy node, we will have to use dragging without transition
            if (BROWSER_SUPPORTS_HTML5 && !node._isCloned) {
                setXyHtml5(node, tagName, dragId, x, y, dragEnd);
            }
            else {
                setXyNoHtml5(node, tagName, dragId, x, y, xtrans, ytrans, dragEnd, transitioned);
            }
        }
    };

    var cleanCss = function(css) {
        delete css.transition;
        delete css.display;
        delete css.boxSizing;
        delete css.opacity;
        return css;
    };

    /**
     * Set the position of an html element in page coordinates.
     *
     * @method setXY
     * @param node {Node} the dom node
     * @param dragId {String} the dom node's data-attr: data-dragable
     * @param x {Number} x-value for new position (coordinates are page-based)
     * @param y {Number} y-value for new position (coordinates are page-based)
     * @since 0.0.1
     */
    var setXyNoHtml5 = function(node, tagName, dragId, x, y, xtrans, ytrans, dragEnd, transitioned) {
        var css, difx, dify, position, prevCSs, cssId;

        if (transitioned) {
            // backup the current css --> we need to set it later
            cssId = dragId;
            node._isCloned && (cssId+='#cloned');
            prevCSs = STYLE_NODES[cssId] ? STYLE_NODES[cssId].textContent : '';
        }
        position = node.itsa_getStyle('position');
        // make sure it has sizes and can be positioned
        // default position to relative
        css = {
            position: ((position===ABSOLUTE) ? ABSOLUTE : 'relative'),
            opacity: '0',
            transition: 'none !important',
            'touch-action': 'none',
            'box-sizing': 'border-box',
            left: x+PX,
            top: y+PX
        };

        // make sure it can be set by enable it in the dom:
        if (node.itsa_getInlineStyle('display')==='none') {
            css.display = 'block';
        }

        applyCss(tagName, dragId, css, dragEnd, node._isCloned);

        // maybe redo when there is a difference
        // between the set value and the true value (which could appear due to a parent node with `position` === 'absolute')
        if (xtrans) {
            difx = (node.itsa_left-x);
            (difx!==0) && (css.left=(x - difx)+PX);
        }
        if (ytrans) {
            dify = (node.itsa_top-y);
            (dify!==0) && (css.top=(y - dify)+PX);
        }
        (difx || dify) && applyCss(tagName, dragId, css, dragEnd, node._isCloned);

        if (transitioned) {
            // reset the css, because we need to transition the new position
            STYLE_NODES[cssId].textContent = prevCSs;
            async(function() {
                addClass(node, 'itsacss-drag-revert-trans');
                css = cleanCss(css);
                applyCss(tagName, dragId, css, dragEnd, node._isCloned, node._isReverseCloned);
            });
        }
        else {
            // remove temporarely styles that we needed to do the transition well:
            css = cleanCss(css);
            applyCss(tagName, dragId, css, dragEnd, node._isCloned, node._isReverseCloned);
        }
    };

    /**
     * Set the position of an html element using HTML5
     *
     * @method setXYtranform
     * @param dragId {String} the dom node's data-attr: data-dragable
     * @param x {Number} x-value for new position (coordinates are page-based)
     * @param y {Number} y-value for new position (coordinates are page-based)
     * @since 0.0.1
     */
    var setXyHtml5 = function(node, tagName, dragId, x, y, dragEnd) {
        var prevCoordinates = HTML5_NODES_VALUES[dragId],
            css, prevX, prevY, newX, newY;

        // make sure it has sizes and can be positioned
        // note: because we transform, we need to correct the x,y with the node's x,y position
        // also, correct for previous values
        if (prevCoordinates) {
            prevX = prevCoordinates.x;
            prevY = prevCoordinates.y;
        }
        else {
            prevX = 0;
            prevY = 0;
        }
        newX = x-node.itsa_left+prevX;
        newY = y-node.itsa_top+prevY;
        HTML5_NODES_VALUES[dragId] = {
            x: newX,
            y: newY
        };
        css = {
            transform: 'translate('+newX+PX+', '+newY+PX+')',
            transition: 'none',
            'touch-action': 'none'
        };
        applyCss(tagName, dragId, css, dragEnd, node._isCloned, node._isReverseCloned);
    };

    var addClass = function(node, className) {
        var doSet = function(cl) {
            var clName = node.getAttribute('class') || '',
                clNameSplitted = clName.split(' ');
            clNameSplitted.itsa_contains(cl) || node.setAttribute('class', clName+(clName ? ' ' : '') + cl);
        };
        if (typeof className==='string') {
            doSet(className);
        }
        else if (Array.isArray(className)) {
            className.forEach(doSet);
        }
    };

    var removeClass = function(node, className) {
        var doRemove = function(cl) {
            var clName = node.getAttribute('class') || '',
                regexp = new RegExp('(?:^|\\s+)' + cl + '(?:\\s+|$)', 'g');
            node.setAttribute('class', clName.replace(regexp, ' ').itsa_trim());
        };
        if (typeof className==='string') {
            doRemove(className);
        }
        else if (Array.isArray(className)) {
            className.forEach(doRemove);
        }
    };

    var transitionTo = function(node, x, y, constrainNode) {
        var marginLeft, marginTop, marginRight, marginBottom, constrainX, constrainY, constrain;
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
            constrain = {
                x1: constrainX,
                y1: constrainY,
                x2: constrainX +
                    Math.min(constrainNode.scrollWidth, constrainNode.offsetWidth) -
                    node.offsetWidth -
                    marginLeft -
                    marginRight,
                y2: constrainY +
                    Math.min(constrainNode.scrollHeight, constrainNode.offsetHeight) -
                    node.offsetHeight -
                    marginTop -
                    marginBottom
            };
            x = Math.min(Math.max(constrain.x1, x), constrain.x2);
            y = Math.min(Math.max(constrain.y1, y), constrain.y2);
        }
        if (!node._isCloned && BROWSER_SUPPORTS_HTML5) {
            // will use setXyHtml5: we can set the transition class:
            addClass(node, 'itsacss-drag-revert-trans');
        }
        setXY(node, x, y, false, true);
        return new Promise(function(resolve) {
            later(function() {
                removeClass(node, 'itsacss-drag-revert-trans');
                resolve();
            }, 300);
        });
    };

    return {
        addClass,
        removeClass,
        setXY,
        transitionTo
    };

};
