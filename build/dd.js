/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var isNode = __webpack_require__(1).isNode,
	    globalObj = isNode ? global : window;

	globalObj['itsa_dd'] = __webpack_require__(8);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var timers = __webpack_require__(2);

	module.exports = {
	   idGenerator: __webpack_require__(6).idGenerator,
	   later: timers.later,
	   async: timers.async,
	   isNode: __webpack_require__(7)
	};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {/**
	 * Collection of various utility functions.
	 *
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module utils
	 * @class Utils
	 * @static
	*/

	"use strict";

	// NOTE: setTimeout can be up to 2147483647 milliseconds (the max for 32 bit integer: about 24 days

	var TIMEOUT_MAX = process.env.NODE_ENV === 'test' ? 400 : 2147483647,
	    // 2^31-1
	_asynchronizer,
	    _async,
	    later;

	/**
	 * Forces a function to be run asynchronously, but as fast as possible. In Node.js
	 * this is achieved using `setImmediate` or `process.nextTick`.
	 *
	 * @method _asynchronizer
	 * @param callbackFn {Function} The function to call asynchronously
	 * @static
	 * @private
	**/
	_asynchronizer = typeof setImmediate !== "undefined" ? function (fn) {
	  setImmediate(fn);
	} : typeof process !== "undefined" && process.nextTick ? process.nextTick : function (fn) {
	  setTimeout(fn, 0);
	};

	/**
	 * Invokes the callbackFn once in the next turn of the JavaScript event loop. If the function
	 * requires a specific execution context or arguments, wrap it with Function.bind.
	 *
	 * I.async returns an object with a cancel method.  If the cancel method is
	 * called before the callback function, the callback function won"t be called.
	 *
	 * @method async
	 * @param {Function} callbackFn
	 * @param [invokeAfterFn=true] {boolean} set to false to prevent the _afterSyncFn to be invoked
	 * @return {Object} An object with a cancel method.  If the cancel method is
	 * called before the callback function, the callback function won"t be called.
	**/
	_async = function _async(callbackFn, invokeAfterFn) {
	  var canceled;

	  invokeAfterFn = typeof invokeAfterFn === "boolean" ? invokeAfterFn : true;
	  typeof callbackFn === "function" && _asynchronizer(function () {
	    if (!canceled) {
	      callbackFn();
	    }
	  });

	  return {
	    cancel: function cancel() {
	      canceled = true;
	    }
	  };
	};

	var _setLongTimeout = function _setLongTimeout(cb, timeout) {
	  if (timeout <= TIMEOUT_MAX) {
	    return setTimeout(cb, timeout);
	  }
	  // else: use a long timeout by reuse the remaining the timeout
	  return setTimeout(_setLongTimeout.bind(null, cb, TIMEOUT_MAX - timeout), timeout);
	};

	/**
	 * Invokes the callbackFn after a timeout (asynchronous). If the function
	 * requires a specific execution context or arguments, wrap it with Function.bind.
	 *
	 * To invoke the callback function periodic, set "periodic" either "true", or specify a second timeout.
	 * If number, then periodic is considered "true" but with a perdiod defined by "periodic",
	 * which means: the first timer executes after "timeout" and next timers after "period".
	 *
	 * I.later returns an object with a cancel method.  If the cancel() method is
	 * called before the callback function, the callback function won"t be called.
	 *
	 * @method later
	 * @param callbackFn {Function} the function to execute.
	 * @param [timeout] {Number} the number of milliseconds to wait until the callbackFn is executed.
	 * when not set, the callback function is invoked once in the next turn of the JavaScript event loop.
	 * @param [periodic] {boolean|Number} if true, executes continuously at supplied, if number, then periodic is considered "true" but with a perdiod
	 * defined by "periodic", which means: the first timer executes after "timeout" and next timers after "period".
	 * The interval executes until canceled.
	 * @return {object} a timer object. Call the cancel() method on this object to stop the timer.
	*/
	var later = function later(callbackFn, timeout, periodic) {
	  var canceled = false;
	  if (typeof timeout !== "number") {
	    return _async(callbackFn);
	  }
	  var wrapper = function wrapper() {
	    // nodejs may execute a callback, so in order to preserve
	    // the cancel() === no more runny-run, we have to build in an extra conditional
	    if (!canceled) {
	      callbackFn();
	      // we are NOT using setInterval, because that leads to problems when the callback
	      // lasts longer than the interval. Instead, we use the interval as inbetween-phase
	      // between the separate callbacks.
	      id = periodic ? _setLongTimeout(wrapper, typeof periodic === "number" ? periodic : timeout) : null;
	    }
	  },
	      id;
	  typeof callbackFn === "function" && (id = _setLongTimeout(wrapper, timeout));

	  return {
	    cancel: function cancel() {
	      canceled = true;
	      id && clearTimeout(id);
	      // break closure:
	      id = null;
	    }
	  };
	};

	/**
	 * Invokes the callbackFn once in the next turn of the JavaScript event loop. If the function
	 * requires a specific execution context or arguments, wrap it with Function.bind.
	 *
	 * I.async returns an object with a cancel method.  If the cancel method is
	 * called before the callback function, the callback function won"t be called.
	 *
	 * @method async
	 * @param {Function} callbackFn
	 * @param [invokeAfterFn=true] {boolean} set to false to prevent the _afterSyncFn to be invoked
	 * @return {Object} An object with a cancel method.  If the cancel method is
	 * called before the callback function, the callback function won"t be called.
	**/
	module.exports = {
	  async: _async,
	  later: later
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), __webpack_require__(4).setImmediate))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout() {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	})();
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) {
	    return [];
	};

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function () {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function () {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout = exports.clearInterval = function (timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function () {};
	Timeout.prototype.close = function () {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function (item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function (item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function (item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout) item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(5);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {"use strict";

	(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	        // Callback can either be a function or a string
	        if (typeof callback !== "function") {
	            callback = new Function("" + callback);
	        }
	        // Copy function arguments
	        var args = new Array(arguments.length - 1);
	        for (var i = 0; i < args.length; i++) {
	            args[i] = arguments[i + 1];
	        }
	        // Store and register the task
	        var task = { callback: callback, args: args };
	        tasksByHandle[nextHandle] = task;
	        registerImmediate(nextHandle);
	        return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	            case 0:
	                callback();
	                break;
	            case 1:
	                callback(args[0]);
	                break;
	            case 2:
	                callback(args[0], args[1]);
	                break;
	            case 3:
	                callback(args[0], args[1], args[2]);
	                break;
	            default:
	                callback.apply(undefined, args);
	                break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function registerImmediate(handle) {
	            process.nextTick(function () {
	                runIfPresent(handle);
	            });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function () {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function onGlobalMessage(event) {
	            if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function registerImmediate(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function (event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function registerImmediate(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function registerImmediate(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function registerImmediate(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	})(typeof self === "undefined" ? typeof global === "undefined" ? undefined : global : self);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(3)))

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";

	var UNDEFINED_NS = "__undefined__",
	    namespaces = {};

	/**
	 * Collection of various utility functions.
	 *
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module utils
	 * @class Utils
	 * @static
	*/

	/**
	 * Generates an unique id with the signature: "namespace-follownr"
	 *
	 * @example
	 *
	 *     var generator = require("core-utils-idgenerator");
	 *
	 *     console.log(generator()); // --> 1
	 *     console.log(generator()); // --> 2
	 *     console.log(generator(1000)); // --> 1000
	 *     console.log(generator()); // --> 1001
	 *     console.log(generator("Parcel, 500")); // -->"Parcel-500"
	 *     console.log(generator("Parcel")); // -->"Parcel-501"
	 *
	 *
	 * @method idGenerator
	 * @param [namespace] {String} namespace to prepend the generated id.
	 *        When ignored, the generator just returns a number.
	 * @param [start] {Number} startvalue for the next generated id. Any further generated id"s will preceed this id.
	 *        If `start` is lower or equal than the last generated id, it will be ignored.
	 * @return {Number|String} an unique id. Either a number, or a String (digit prepended with "namespace-")
	 */
	module.exports.idGenerator = function (namespace, start) {
	  // in case `start` is set at first argument, transform into (null, start)
	  typeof namespace === "number" && (start = namespace) && (namespace = null);
	  namespace || (namespace = UNDEFINED_NS);

	  if (!namespaces[namespace]) {
	    namespaces[namespace] = start || 1;
	  } else if (start && namespaces[namespace] < start) {
	    namespaces[namespace] = start;
	  }
	  return namespace === UNDEFINED_NS ? namespaces[namespace]++ : namespace + "-" + namespaces[namespace]++;
	};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Collection of various utility functions.
	 *
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module utils
	 * @class Utils
	 * @static
	*/

	/**
	 * Checks whether the environment is Nodejs
	 *
	 * @method isnode
	 * @return {Boolean} whether the environment is Nodejs
	 */

	'use strict';

	var isNode = typeof global !== 'undefined' && {}.toString.call(global) === '[object global]' && (!global.document || {}.toString.call(global.document) !== '[object HTMLDocument]');

	module.exports = isNode;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isNode = __webpack_require__(1).isNode;

	module.exports = isNode ? __webpack_require__(9) : __webpack_require__(10)(window);

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

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

	var idGenerator = __webpack_require__(1).idGenerator;

	module.exports = {
	    generateId: function generateId() {
	        return idGenerator('itsa-dd');
	    }
	};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

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

	__webpack_require__(11);
	__webpack_require__(26);

	var DRAG = 'drag',
	    DROP = 'drop',
	    Event = __webpack_require__(31),
	    idGenerator = __webpack_require__(1).idGenerator,
	    DATA_DRAGGABLE = 'data-draggable',
	    CONSTRAIN_ATTR = DATA_DRAGGABLE + '-constrain',
	    DATA_DRAGGABLE_DROPTARGET = DATA_DRAGGABLE + '-droptarget',
	    MOUSE = 'mouse',
	    EMITTER = 'emitter',
	    DD_EMITTER = DATA_DRAGGABLE + '-' + EMITTER,
	    DD_DRAG = DRAG,
	    DD_DROP = DROP,
	    DD_FAKE = 'fake-',
	    DOWN = 'down',
	    UP = 'up',
	    MOVE = 'move',
	    MOUSEUP = MOUSE + UP,
	    MOUSEDOWN = MOUSE + DOWN,
	    MOUSEMOVE = MOUSE + MOVE,
	    TOUCH = 'touch',
	    TOUCHSTART = TOUCH + 'start',
	    TOUCHMOVE = TOUCH + MOVE,
	    TOUCHEND = TOUCH + 'end',
	    DD_FAKE_MOUSEUP = DD_FAKE + MOUSEUP,
	    UI = 'UI',
	    BORDER = 'border',
	    WIDTH = 'width',
	    BORDER_LEFT_WIDTH = BORDER + '-left-' + WIDTH,
	    BORDER_TOP_WIDTH = BORDER + '-top-' + WIDTH,
	    MARGIN_ = 'margin-',
	    LEFT = 'left',
	    RIGHT = 'right',
	    TOP = 'top',
	    BOTTOM = 'bottom',
	    MARGIN_LEFT = MARGIN_ + LEFT,
	    MARGIN_RIGHT = MARGIN_ + RIGHT,
	    MARGIN_TOP = MARGIN_ + TOP,
	    MARGIN_BOTTOM = MARGIN_ + BOTTOM,
	    WINDOW = 'window',
	    NO_OVERFLOW = 'no-overflow',
	    ITSA_WINSCROLL = 'data-itsa-winscroll',
	    DIRECTION_X = DATA_DRAGGABLE + '-x',
	    DIRECTION_Y = DATA_DRAGGABLE + '-y',
	    DRAGGABLE_GROUP = DATA_DRAGGABLE + '-group',
	    DRAGGABLE_HANDLE = DATA_DRAGGABLE + '-handle',
	    DRAGGABLE_PROXY = DATA_DRAGGABLE + '-proxy',
	    ITSA_DRAGGABLE = '[' + DATA_DRAGGABLE + ']',
	    VALID_PROXY = {
	    'true': true,
	    'outline': true,
	    'blur': true,
	    'reverse-blur': true
	};

	module.exports = function (WIN) {

	    // create global `_ITSA` if not created yet
	    WIN._ITSA || Object.itsa_protectedProp(WIN, '_ITSA', Object.create(null));

	    if (WIN._ITSA.Drag) {
	        return WIN._ITSA.Drag; // Drag was already created: don't create multiple times
	    }

	    var mobileEvents = false,
	        extendElement = __webpack_require__(36)(WIN),
	        setXY = extendElement.setXY,
	        transitionTo = extendElement.transitionTo,
	        addClass = extendElement.addClass,
	        removeClass = extendElement.removeClass,
	        DOCUMENT = WIN.document,
	        htmlNode = DOCUMENT.documentElement,
	        HEAD = DOCUMENT.head,
	        IE8_EVENTS = !htmlNode.addEventListener,
	        DD,
	        noScrollOnDrag,
	        setListener,
	        removeListener,
	        stylenode,
	        transitionCss;

	    noScrollOnDrag = function noScrollOnDrag(e) {
	        if (e.target.matches(ITSA_DRAGGABLE) || e.target.itsa_inside(ITSA_DRAGGABLE)) {
	            e.preventDefault();
	        }
	    };

	    removeListener = function removeListener(evt, func) {
	        if (IE8_EVENTS) {
	            DOCUMENT.detachEvent('on' + evt, func);
	        } else {
	            DOCUMENT.removeEventListener(evt, func, { capture: true, passive: false });
	        }
	    };

	    setListener = function setListener(evt, func) {
	        if (IE8_EVENTS) {
	            DOCUMENT.attachEvent('on' + evt, func);
	        } else {
	            DOCUMENT.addEventListener(evt, func, { capture: true, passive: false });
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
	        _defFnDrag: function _defFnDrag(e) {
	            var ddProps = this.ddProps,
	                dragNode = ddProps.dragNode,
	                constrainNode = ddProps.constrainNode,
	                winConstrained = ddProps.winConstrained,
	                hasRelatives = !!ddProps.relatives,
	                x,
	                y,
	                constrainX,
	                constrainY,
	                marginLeft,
	                marginRight,
	                marginTop,
	                marginBottom,
	                constrainX1,
	                constrainX2,
	                constrainY1,
	                constrainY2;
	            // is the drag is finished, there will be no ddProps.defined
	            // return then, to prevent any events that stayed behind
	            if (!ddProps.defined || !dragNode) {
	                return;
	            }

	            // caution: the user might have put the mouse out of the screen and released the mousebutton!
	            // If that is the case, the a mouseup-event should be initiated instead of draggin the element
	            if (e.buttons === 0) {
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
	            } else {
	                // set it again: theoretically, the constrained node might move during dragging:
	                if (constrainNode) {
	                    marginLeft = parseInt(constrainNode.itsa_getStyle(MARGIN_LEFT), 10);
	                    marginTop = parseInt(constrainNode.itsa_getStyle(MARGIN_TOP), 10);
	                    marginRight = parseInt(constrainNode.itsa_getStyle(MARGIN_RIGHT), 10);
	                    marginBottom = parseInt(constrainNode.itsa_getStyle(MARGIN_BOTTOM), 10);
	                    constrainX = constrainNode.itsa_left - constrainNode.scrollLeft + parseInt(constrainNode.itsa_getStyle(BORDER_LEFT_WIDTH), 10) + marginLeft;
	                    constrainY = constrainNode.itsa_top - constrainNode.scrollTop + parseInt(constrainNode.itsa_getStyle(BORDER_TOP_WIDTH), 10) + marginTop;
	                    ddProps.constrain = {
	                        x1: constrainX,
	                        y1: constrainY,
	                        x2: constrainX + Math.min(constrainNode.scrollWidth, constrainNode.offsetWidth) - dragNode.offsetWidth - marginLeft - marginRight,
	                        y2: constrainY + Math.min(constrainNode.scrollHeight, constrainNode.offsetHeight) - dragNode.offsetHeight - marginTop - marginBottom
	                    };
	                }
	                if (ddProps.xMovable) {
	                    x = ddProps.x + e.xMouse + (winConstrained ? ddProps.winScrollLeft : WIN.itsa_getScrollLeft()) - e.xMouseOrigin;
	                }
	                if (ddProps.yMovable) {
	                    y = ddProps.y + e.yMouse + (winConstrained ? ddProps.winScrollTop : WIN.itsa_getScrollTop()) - e.yMouseOrigin;
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

	                hasRelatives && ddProps.relatives.forEach(function (item) {
	                    setXY(item.dragNode, x + item.shiftX, y + item.shiftY);
	                });
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
	        _defFnDrop: function _defFnDrop(e) {
	            var instance = this,
	                dragNode = e.target,
	                isCloned = dragNode._isCloned,
	                originalDragNode = e.originalDragNode,
	                dropTarget = e.dropTarget,
	                node,
	                relatives;

	            // unset a data-attribute to `htmlNode`
	            htmlNode.removeAttribute(DATA_DRAGGABLE_DROPTARGET);
	            if (isCloned) {
	                // remove proxynode and set original node to the right position:
	                instance._removeProxyNode(dragNode, originalDragNode);
	                // same for all relatives:
	                e.originalRelativeRefs && e.originalRelativeRefs.forEach(function (obj) {
	                    instance._removeProxyNode(obj.proxyNode, obj.node);
	                });
	            }
	            // if we have a droptarget, we might need to reposution:
	            if (dropTarget) {
	                // we might need to reposition the node (or nodes!) a bit in order to make the fit inside the dropzone
	                if (isCloned) {
	                    node = originalDragNode;
	                    relatives = e.originalRelativeRefs;
	                } else {
	                    node = dragNode;
	                    relatives = e.relatives;
	                }
	                relatives && relatives.forEach(function (obj) {
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
	        _defFnStart: function _defFnStart(e) {
	            var instance = this,
	                customEventDrag = e.emitter + ':' + DD_DRAG,
	                customEventDrop = e.emitter + ':' + DD_DROP;

	            Event.defineEvent(customEventDrag).defaultFn(instance._defFnDrag.bind(instance));
	            Event.defineEvent(customEventDrop).defaultFn(instance._defFnDrop.bind(instance)).preventedFn(instance._prevFnDrop.bind(instance));
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
	        _defineDDStart: function _defineDDStart(emitterName) {
	            var instance = this;
	            // by using dd before drag, the user can create a `before`-subscriber to dd
	            // and define e.emitter and/or e.relatives before going into `drag`
	            // If event already exists, no action will be taken internally
	            Event.defineEvent(emitterName + ':dd').defaultFn(instance._defFnStart.bind(instance)).preventedFn(instance._prevFnStart.bind(instance));
	        },

	        /**
	         * Default function for the `*:drag`-event
	         *
	         * @method _initializeDrag
	         * @param e {Object} eventobject
	         * @private
	         * @since 0.0.1
	         */
	        _initializeDrag: function _initializeDrag(e) {
	            var instance = this,
	                dragNode = e.dragNode,
	                constrain = dragNode.getAttribute(CONSTRAIN_ATTR),
	                directionX = dragNode.getAttribute(DIRECTION_X) || '',
	                directionY = dragNode.getAttribute(DIRECTION_Y) || '',
	                group = dragNode.getAttribute(DRAGGABLE_GROUP),
	                ddProps = instance.ddProps,
	                emitterName = e.emitter,
	                x,
	                y,
	                constrainNode,
	                winConstrained,
	                winScrollLeft,
	                winScrollTop,
	                moveFn,
	                _releaseFn,
	                extraClass,
	                groupNodes,
	                parentNode,
	                difX1,
	                difX2,
	                difY1,
	                difY2,
	                dragNodeLeft,
	                dragNodeRight,
	                dragNodeTop,
	                dragNodeBottom,
	                proxy,
	                dropTarget;

	            moveFn = function moveFn(e2) {
	                var firstTouch;
	                if (e2.touches && (firstTouch = e2.touches[0])) {
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
	                Event.emit(dragNode, emitterName + ':' + DD_DRAG, e);
	                e.draggable.callback();
	            };

	            _releaseFn = function releaseFn(e2) {
	                var dragNode = instance.ddProps.dragNode,
	                    firstTouch;
	                // remove listener for `mousemove` and `mouseup`
	                removeListener(mobileEvents ? TOUCHMOVE : MOUSEMOVE, moveFn);
	                removeListener(mobileEvents ? TOUCHEND : MOUSEUP, _releaseFn);

	                // set mousepos for the last time:
	                if (e2.changedTouches && (firstTouch = e2.changedTouches[0])) {
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

	                Event.emit(dragNode, emitterName + ':' + DD_DROP, e);

	                e.draggable.fulfill();
	            };

	            // check if we need to make a proxy-node:
	            proxy = (e.dragNode.getAttribute(DRAGGABLE_PROXY) || '').toLowerCase();
	            if (VALID_PROXY[proxy]) {
	                parentNode = dragNode.parentNode;
	                ddProps.originalDragNode = dragNode;
	                dragNode = dragNode.cloneNode(proxy !== 'outline');
	                dragNode._isCloned = true; // let `setXY` know that were moving a cloned node
	                // let `setXY` know that were moving a cloned node; either by `true` or specifying the groupname:
	                dragNode._isReverseCloned = proxy === 'reverse-blur' && (group || true);
	                if (proxy === 'outline') {
	                    extraClass = 'itsacss-cloned-node-outline';
	                } else if (proxy === 'blur') {
	                    extraClass = 'itsacss-cloned-node-blurred';
	                }
	                instance._insertProxyNode(parentNode, dragNode, ddProps.originalDragNode.itsa_left, ddProps.originalDragNode.itsa_top, extraClass);
	                if (group) {
	                    ddProps.originalRelativeRefs = [];
	                    groupNodes = DOCUMENT.itsa_getAll('[' + DRAGGABLE_GROUP + '="' + group + '"]:not(.itsacss-cloned-node)'); // returns an array-like object
	                    Array.prototype.forEach.call(groupNodes, function (node) {
	                        var proxyNode;
	                        if (node !== ddProps.originalDragNode) {
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
	                ddProps.xMovable = directionX.toLowerCase() === 'true';
	                ddProps.yMovable = directionY.toLowerCase() === 'true';
	            } else {
	                ddProps.xMovable = ddProps.yMovable = true;
	            }
	            ddProps.x = x = dragNode.itsa_left;
	            ddProps.y = y = dragNode.itsa_top;
	            ddProps.winConstrained = winConstrained = constrain === WINDOW;
	            ddProps.xMouseLast = x;
	            ddProps.yMouseLast = y;
	            if (constrain) {
	                if (winConstrained) {
	                    ddProps.winScrollLeft = winScrollLeft = WIN.itsa_getScrollLeft();
	                    ddProps.winScrollTop = winScrollTop = WIN.itsa_getScrollTop();
	                    ddProps.constrain = {
	                        x1: winScrollLeft,
	                        y1: winScrollTop,
	                        x2: winScrollLeft + WIN.itsa_getWidth() - dragNode.offsetWidth,
	                        y2: winScrollTop + WIN.itsa_getHeight() - dragNode.offsetHeight
	                    };
	                    // if constrained to WIN:
	                    // set a class that makes overflow hidden --> this will prevent
	                    // some browsers from scrolling the WIN when a pressed mouse
	                    // gets out of the WIN

	                    // TODO:
	                    htmlNode.setAttribute(ITSA_WINSCROLL, NO_OVERFLOW);
	                } else {
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
	            setListener(mobileEvents ? TOUCHEND : MOUSEUP, _releaseFn);

	            setXY(dragNode, ddProps.xMouseLast, ddProps.yMouseLast);

	            if (group) {
	                // relatives are extra HtmlElements that should be moved aside with the main dragged element
	                // e.relatives is a selector, e.relativeNodes will be an array with nodes
	                // in case of proxy: only take into account the nodes that are cloned (proxy-nodes)
	                groupNodes = DOCUMENT.itsa_getAll('[' + DRAGGABLE_GROUP + '="' + group + '"]' + (dragNode._isCloned ? '.itsacss-cloned-node' : '')); // returns an array-like object
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
	                Array.prototype.forEach.call(groupNodes, function (node) {
	                    var item;
	                    if (node !== dragNode) {
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
	                if (ddProps.relatives.length === 0) {
	                    delete ddProps.relatives;
	                }
	            }

	            // in case of having a drop-target, we set a data-attribute to `head`, so that anyone interested gets informed by css:
	            dropTarget = dragNode.getAttribute(DATA_DRAGGABLE_DROPTARGET);
	            dropTarget && htmlNode.setAttribute(DATA_DRAGGABLE_DROPTARGET, dropTarget);
	        },

	        _insertProxyNode: function _insertProxyNode(parentNode, node, x, y, extraClass) {
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
	        _prevFnDrop: function _prevFnDrop(e) {
	            var instance = this,
	                dragNode = e.target,
	                x,
	                y;

	            // in case of having a drop-target, we unset a data-attribute to `htmlNode`
	            htmlNode.removeAttribute(DATA_DRAGGABLE_DROPTARGET);
	            if (dragNode._isCloned) {
	                // same for all relatives:
	                e.originalRelativeRefs && e.originalRelativeRefs.forEach(function (obj) {
	                    instance._revertProxyNode(obj.proxyNode, obj.node);
	                });
	                // remove proxynode and set original node to the right position:
	                return instance._revertProxyNode(dragNode, e.originalDragNode);
	            }
	            // remove proxynode and set original node to the right position:
	            x = e.originalX;
	            y = e.originalY;
	            // same for all relatives:
	            e.relatives && e.relatives.forEach(function (obj) {
	                instance._revertNode(obj.dragNode, x + obj.shiftX, y + obj.shiftY);
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
	        _prevFnStart: function _prevFnStart(e) {
	            e.draggable.reject();
	        },

	        _removeProxyNode: function _removeProxyNode(node, originalDragNode) {
	            setXY(originalDragNode, node.itsa_left, node.itsa_top);
	            // remove the opacity of the original node:
	            node._isReverseCloned && setXY(node, node.itsa_left, node.itsa_top, true);
	            node.parentNode.removeChild(node);
	        },

	        _revertProxyNode: function _revertProxyNode(node, originalDragNode) {
	            // set the position of the proxy back
	            // transition the proxy back to its original position:
	            var instance = this;
	            instance._isReverting = true;
	            return transitionTo(node, originalDragNode.itsa_left, originalDragNode.itsa_top).itsa_finally(function () {
	                // remove the opacity of the original node:
	                node._isReverseCloned && setXY(node, node.itsa_left, node.itsa_top, true);
	                node.parentNode.removeChild(node);
	                instance._isReverting = false;
	            });
	        },

	        _revertNode: function _revertNode(node, x, y) {
	            // transition the proxy back to its original position:
	            var instance = this;
	            instance._isReverting = true;
	            return transitionTo(node, x, y).itsa_finally(function () {
	                // remove the opacity of the original node:
	                setXY(node, x, y, true);
	                instance._isReverting = false;
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
	        init: function init() {
	            var instance = this,
	                nodeTargetFn,
	                setMobileEventSupport;

	            setMobileEventSupport = function setMobileEventSupport() {
	                removeListener(MOUSEDOWN, nodeTargetFn);
	                mobileEvents = true;
	            };

	            nodeTargetFn = function nodeTargetFn(e) {
	                var node = e.target,
	                    isDraggable = node.matchesSelector(ITSA_DRAGGABLE),
	                    handle,
	                    emitterName,
	                    parentDragNode,
	                    handleMatch,
	                    parentHandleNode,
	                    firstTouch;

	                parentDragNode = !isDraggable && node.itsa_inside(ITSA_DRAGGABLE);
	                if (e.which < 2 && !instance._isReverting && (isDraggable || parentDragNode)) {
	                    e.dragNode = parentDragNode || node;
	                    if (e.touches && (firstTouch = e.touches[0])) {
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
	                        } else {
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
	                    e.draggable.catch(function (err) {
	                        console.warn('draggable rejected: ' + err);
	                    });

	                    // define e.setOnDrag --> users
	                    e.setOnDrag = function (callbackFn) {
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
	                    Event.emit(e.target, emitterName + ':dd', e);
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
	    Event.before('*:' + DD_DRAG, function (e) {
	        e.preventDefault();
	    }, function (e) {
	        var sourceNode = e.target,
	            tagName = sourceNode.tagName;
	        return tagName === 'INPUT' || tagName === 'TEXTAREA' || sourceNode.getAttribute('contenteditable') === 'true';
	    });

	    // don't drag any native drag-drop items when they are part of dd, because they prevent they corrupt dragging:
	    setListener('dragstart', function (e) {
	        if (e.target.matchesSelector(ITSA_DRAGGABLE) || e.target.itsa_inside(ITSA_DRAGGABLE)) {
	            e.preventDefault();
	        }
	    });

	    // declare a global style:
	    stylenode = DOCUMENT.createElement('style');
	    stylenode.setAttribute('type', 'text/css');
	    HEAD.appendChild(stylenode);
	    transitionCss = 'transition: top 0.25s ease-out, left 0.25s ease-out, transform 0.25s ease-out !important;';
	    stylenode.textContent = 'html[' + ITSA_WINSCROLL + '="' + NO_OVERFLOW + '"] body {\noverflow: hidden !important;\n}\n' + '.itsacss-invisible {\nopacity: 0 !important; left: -9999px !important; top: -9999px !important; z-index: -1001 !important;}\n' + '.itsacss-display-block {\ndisplay: block !important;}\n' + '.itsacss-position-absolute {\nposition: absolute !important;}\n' + 'div[' + DATA_DRAGGABLE + '].itsacss-drag-revert-trans {\n-webkit-' + transitionCss + ' -moz-' + transitionCss + ' -ms-' + transitionCss + ' -o-' + transitionCss + ' ' + transitionCss + '}\n' + '.itsacss-cloned-node-outline {\nbox-shadow: 0 0 0 1px #333 inset !important; background: transparent !important}\n' + '.itsacss-cloned-node-blurred {\nopacity: 0.6;filter: alpha(opacity=60);}\n';

	    DD.init();
	    WIN._ITSA.Drag = DD;

	    Event.before('*:drop', function (e) {
	        var liesInsideNode,
	            dropZones,
	            x,
	            y,
	            dropTargets,
	            dragNode = e.dragNode,
	            dropTarget = dragNode.getAttribute(DATA_DRAGGABLE_DROPTARGET);
	        if (dropTarget) {
	            // split droptarget into an array: we might have specified more than 1 target
	            dropTargets = dropTarget.split(',').map(function (item) {
	                return item.itsa_trim();
	            });
	            // only accept drop if the draggable node is released above a droptarget
	            // first, we need to find all the dropzones:
	            dropZones = DOCUMENT.itsa_getAll('[data-dropzone]');
	            x = e.xMouse;
	            y = e.yMouse;
	            // next, check if the position lies within at least one of the dropzones:
	            Array.prototype.some.call(dropZones, function (dropZoneNode) {
	                if (dropTargets.itsa_contains(dropZoneNode.getAttribute('data-dropzone')) && dropZoneNode.itsa_insidePos(x, y)) {
	                    liesInsideNode = dropZoneNode;
	                }
	                return liesInsideNode;
	            });
	            if (!liesInsideNode) {
	                e.preventDefault(); // will revert the draggable node to its original position
	            } else {
	                e.dropTarget = liesInsideNode;
	            }
	        }
	    });

	    return {
	        generateId: function generateId() {
	            return idGenerator('itsa-dd');
	        }
	    };
	};

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	var isNode = __webpack_require__(1).isNode,
	    win = isNode ? global.window : window;

	if (win) {
	    __webpack_require__(12)(win);
	    __webpack_require__(13)(win);
	    __webpack_require__(19)(win);
	    __webpack_require__(20)(win);
	    __webpack_require__(24)(win);
	    __webpack_require__(25)(win);
	}
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 12 */
/***/ (function(module, exports) {

	/**
	 * A few basic polyfills for window and Element
	 *
	 *
	 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module itsa-dom
	 * @class polyfill
	 * @since 0.0.1
	*/

	"use strict";

	var CONSOLE = {
	    log: function log() {/* NOOP */},
	    info: function info() {/* NOOP */},
	    warn: function warn() {/* NOOP */},
	    error: function error() {/* NOOP */}
	};

	module.exports = function (WINDOW) {
	    WINDOW.console || function (GlobalPrototype) {
	        GlobalPrototype && (GlobalPrototype.console = CONSOLE);
	    }(WINDOW.prototype);

	    WINDOW.Element && WINDOW.Element.prototype && function (ElementPrototype) {

	        ElementPrototype.matchesSelector || (ElementPrototype.matchesSelector = ElementPrototype.mozMatchesSelector || ElementPrototype.msMatchesSelector || ElementPrototype.oMatchesSelector || ElementPrototype.webkitMatchesSelector || function (selector) {
	            var node = this,
	                nodes = (node.parentNode || WINDOW.document).querySelectorAll(selector),
	                i = -1;
	            while (nodes[++i] && nodes[i] !== node) {}
	            return !!nodes[i];
	        });

	        if (Object.defineProperty && Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(ElementPrototype, "textContent") && !Object.getOwnPropertyDescriptor(ElementPrototype, "textContent").get) {
	            (function () {
	                var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
	                Object.defineProperty(Element.prototype, "textContent", {
	                    get: function get() {
	                        return innerText.get.call(this);
	                    },
	                    set: function set(s) {
	                        return innerText.set.call(this, s);
	                    }
	                });
	            })();
	        }
	    }(WINDOW.Element.prototype);
	};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Adding sugar utilities to the window-object
	 *
	 *
	 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module itsa-dom
	 * @class window
	 * @since 0.0.1
	*/

	"use strict";

	module.exports = function (WINDOW) {

	    var scrollTo = __webpack_require__(14)(WINDOW);

	    var getScrollOffsets = function getScrollOffsets() {
	        var doc = WINDOW.document;
	        // this works for all browsers in non quircks-mode and only for IE9+:
	        if (WINDOW.pageXOffset !== undefined) {
	            // do not "just" check for `window.pageXOffset` --> it could be `0`
	            return {
	                x: WINDOW.pageXOffset,
	                y: WINDOW.pageYOffset
	            };
	        }
	        // for IE (or any other browser) in standards mode
	        if (doc && doc.compatMode === "CSS1Compat") {
	            return {
	                x: doc.documentElement && doc.documentElement.scrollLeft,
	                y: doc.documentElement && doc.documentElement.scrollTop
	            };
	        }
	        // for browsers in quircks mode:
	        return {
	            x: doc && doc.body && doc.body.scrollLeft,
	            y: doc && doc.body && doc.body.scrollTop
	        };
	    },
	        getViewportSize = function getViewportSize() {
	        var doc = WINDOW.document;
	        // this works for all browsers in non quircks-mode and only for IE9+:
	        if (WINDOW.innerWidth !== undefined) {
	            // do not "just" check for `window.innerWidth` --> it could be `0`
	            return {
	                w: WINDOW.innerWidth,
	                h: WINDOW.innerHeight
	            };
	        }
	        // for IE (or any other browser) in standards mode
	        if (doc && doc.compatMode === "CSS1Compat") {
	            return {
	                w: doc.documentElement && doc.documentElement.clientWidth,
	                h: doc.documentElement && doc.documentElement.clientHeight
	            };
	        }
	        // for browsers in quircks mode:
	        return {
	            w: doc && doc.body && doc.body.clientWidth,
	            h: doc && doc.body && doc.body.clientHeight
	        };
	    };

	    /**
	     * Gets the left-scroll offset of the WINDOW.
	     *
	     * @method getScrollLeft
	     * @return {Number} left-offset in pixels
	     * @since 0.0.1
	    */
	    WINDOW.itsa_getScrollLeft = function () {
	        return getScrollOffsets().x;
	    };
	    /**
	     * Gets the top-scroll offset of the WINDOW.
	     *
	     * @method getScrollTop
	     * @return {Number} top-offset in pixels
	     * @since 0.0.1
	    */
	    WINDOW.itsa_getScrollTop = function () {
	        return getScrollOffsets().y;
	    };
	    /**
	     * Gets the width of the WINDOW.
	     *
	     * @method getWidth
	     * @return {Number} width in pixels
	     * @since 0.0.1
	     */
	    WINDOW.itsa_getWidth = function () {
	        return getViewportSize().w;
	    };
	    /**
	     * Gets the height of the WINDOW.
	     *
	     * @method getHeight
	     * @return {Number} width in pixels
	     * @since 0.0.1
	     */
	    WINDOW.itsa_getHeight = function () {
	        return getViewportSize().h;
	    };

	    WINDOW.itsa_scrollTo = function (left, top, transitionTime) {
	        if (!transitionTime) {
	            WINDOW.scrollTo(left, top);
	        } else {
	            scrollTo(WINDOW, WINDOW.itsa_getScrollLeft(), WINDOW.itsa_getScrollTop(), left, top, transitionTime);
	        }
	    };
	};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	module.exports = function (WINDOW) {

	    var STRING = "string",
	        DOCUMENT = WINDOW.document,
	        TRANSITION = "transition",
	        PX = "px",
	        STYLE = "style",
	        _IMPORTANT = " !important",
	        _LEFT = "-left",
	        _TOP = "-top",
	        MARGIN = "margin",
	        MARGIN_LEFT = MARGIN + _LEFT,
	        MARGIN_TOP = MARGIN + _TOP,
	        SCROLL_TIMER = 20,
	        utils = __webpack_require__(1),
	        async = utils.async,
	        later = utils.later,
	        css3Transition = DOCUMENT.body.style && _typeof(DOCUMENT.body.style.transitionProperty) === STRING,
	        IE8_Events = !DOCUMENT.documentElement.addEventListener,
	        calcSupport,
	        vendorTransition,
	        evTransitionEnd,
	        objToStyle,
	        styleToObj;

	    objToStyle = function objToStyle(obj) {
	        var styles = "";
	        obj.itsa_each(function (value, key) {
	            styles += key + ":" + value + ";";
	        });
	        return styles;
	    };

	    styleToObj = function styleToObj(styles) {
	        var styleArray,
	            obj = {};
	        if (!styles) {
	            return obj;
	        }
	        styleArray = styles.split(";");
	        styleArray.forEach(function (style) {
	            var styleDetails = style.split(":"),
	                key = styleDetails[0] && styleDetails[0].toLowerCase().itsa_trim(),
	                value = styleDetails[1] && styleDetails[1].toLowerCase().itsa_trim();
	            if (key !== undefined && value !== undefined) {
	                obj[key] = value;
	            }
	        });
	        return obj;
	    };

	    return function (container, currentLeft, currentTop, newLeft, newTop, transitionTime) {
	        var incrementX = 1,
	            incrementY = 1,
	            downX = true,
	            downY = true,
	            top = currentTop,
	            left = currentLeft,
	            windowContainer = container === WINDOW,
	            laterFn,
	            _afterTrans,
	            currentMarginTop,
	            currentMarginLeft,
	            marginTop,
	            marginLeft,
	            timeOut,
	            prevStyle,
	            prevStyleObj,
	            inlinestyleNoTrans,
	            maxTop,
	            maxLeft,
	            timer;
	        newLeft === undefined && (newLeft = container === WINDOW ? container.itsa_getScrollLeft() : container.scrollLeft);
	        newTop === undefined && (newTop = container === WINDOW ? container.itsa_getScrollTop() : container.scrollTop);

	        if (currentLeft !== newLeft || currentTop !== newTop) {
	            windowContainer && (container = WINDOW.document.documentElement);
	            if (transitionTime) {
	                if (windowContainer && calcSupport === undefined) {
	                    calcSupport = __webpack_require__(15)(WINDOW);
	                }
	                // on the full-screen, we can use CSS3 transition :)
	                if (windowContainer && css3Transition && calcSupport) {
	                    _afterTrans = function afterTrans(e) {
	                        var node = e.target,
	                            newLeft,
	                            newTop,
	                            inlinestyleNoTrans,
	                            prevStyle;
	                        if (node === e.currentTarget) {
	                            if (IE8_Events) {
	                                node.detachEvent("on" + evTransitionEnd, _afterTrans);
	                            } else {
	                                node.removeEventListener(evTransitionEnd, _afterTrans, true);
	                            }
	                            timer = node.itsa_getData("itsa_scrollTimer");
	                            if (timer) {
	                                // only the first end-transition we will take (in case of simultanious mulitple events)
	                                timer.cancel();
	                                inlinestyleNoTrans = container.itsa_getData("itsa_scrollToInlinestyleNoTrans");
	                                prevStyle = container.itsa_getData("itsa_scrollToPrevStyle");
	                                node.setAttribute(STYLE, inlinestyleNoTrans); // without transitions
	                                newLeft = container.itsa_getData("itsa_scrollToNewLeft");
	                                newTop = container.itsa_getData("itsa_scrollToNewTop");
	                                // we might need a correction, when the original `html` had a margint-top/left set!
	                                newLeft += parseInt(container.itsa_getStyle("marginLeft"), 10);
	                                newTop += parseInt(container.itsa_getStyle("marginTop"), 10);
	                                WINDOW.scrollTo(newLeft, newTop);
	                                // cleaning up
	                                if (prevStyle) {
	                                    node.setAttribute(STYLE, prevStyle); // with possible transition (when defined before)
	                                } else {
	                                    node.removeAttribute(STYLE);
	                                }
	                                node.itsa_removeData("itsa_scrollToInlinestyleNoTrans");
	                                node.itsa_removeData("itsa_scrollToPrevStyle");
	                                node.itsa_removeData("itsa_scrollTimer");
	                                node.itsa_removeData("itsa_scrollToNewLeft");
	                                node.itsa_removeData("itsa_scrollToNewTop");
	                            }
	                        }
	                    };

	                    // cautious: newLeft and newTop cannot just get any value you want: it migh be limited by the scrolloffset
	                    // if window-scroll, then we set the css to HTML
	                    timer = container.itsa_getData("itsa_scrollTimer");
	                    timer && timer.cancel();

	                    prevStyle = container.getAttribute(STYLE);
	                    prevStyleObj = styleToObj(prevStyle);

	                    // first: define the inlyne-style when there was no transition:
	                    // use the right transition-css - vendor-specific:
	                    vendorTransition || (vendorTransition = __webpack_require__(16)(WINDOW).generator(TRANSITION));
	                    prevStyleObj[vendorTransition] = "none" + _IMPORTANT;
	                    inlinestyleNoTrans = objToStyle(prevStyleObj);

	                    // to be able to use `scrollWidth` right in IE, we NEED to disable possible scrollbars:
	                    prevStyleObj.overflow = "hidden" + (windowContainer ? "" : _IMPORTANT);
	                    // set the original style, but only if not yet set
	                    if (!timer) {
	                        container.itsa_setData("itsa_scrollToInlinestyleNoTrans", inlinestyleNoTrans);
	                        container.itsa_setData("itsa_scrollToPrevStyle", prevStyle);
	                        container.setAttribute(STYLE, objToStyle(prevStyleObj)); // with possible transition (when defined before)
	                    }

	                    maxTop = container.scrollHeight - WINDOW.itsa_getHeight();
	                    maxLeft = container.scrollWidth - WINDOW.itsa_getWidth();
	                    maxTop < newTop && (newTop = maxTop);
	                    maxLeft < newLeft && (newLeft = maxLeft);

	                    currentMarginTop = parseInt(container.itsa_getStyle(MARGIN_TOP), 10);
	                    currentMarginLeft = parseInt(container.itsa_getStyle(MARGIN_LEFT), 10);

	                    newTop -= parseInt(currentMarginTop, 10);
	                    newLeft -= parseInt(currentMarginLeft, 10);

	                    container.itsa_setData("itsa_scrollToNewLeft", newLeft); // -parseInt(currentMarginLeft, 10));
	                    container.itsa_setData("itsa_scrollToNewTop", newTop); //-parseInt(currentMarginTop, 10));

	                    marginTop = currentTop - newTop;
	                    marginLeft = currentLeft - newLeft;

	                    // now, set the new inline styles:
	                    marginTop && (prevStyleObj[MARGIN_TOP] = marginTop + PX + _IMPORTANT);
	                    marginLeft && (prevStyleObj[MARGIN_LEFT] = marginLeft + PX + _IMPORTANT);

	                    // now set inlinestyle with transition:
	                    prevStyleObj[vendorTransition] = transitionTime + "ms ease-in-out" + _IMPORTANT;

	                    // set eventlistener: revert when transition is ready:
	                    evTransitionEnd || (evTransitionEnd = __webpack_require__(17)("./vendor-" + TRANSITION + "-end")(WINDOW));
	                    if (IE8_Events) {
	                        container.attachEvent("on" + evTransitionEnd, _afterTrans);
	                    } else {
	                        container.addEventListener(evTransitionEnd, _afterTrans, true);
	                    }
	                    // also, in case when the transistion-end event does not occur for some reason:
	                    // we always need to have a backup that resets the scrollbehaviour of the container:
	                    timeOut = transitionTime + 50;
	                    timer = later(_afterTrans.bind(null, { target: container, currentTarget: container }), timeOut);
	                    container.itsa_setData("itsa_scrollTimer", timer);

	                    // force transition:
	                    container.setAttribute(STYLE, objToStyle(prevStyleObj));
	                } else {
	                    // animate
	                    incrementX = (newLeft - left) * (SCROLL_TIMER / transitionTime);
	                    incrementY = (newTop - top) * (SCROLL_TIMER / transitionTime);
	                    downX = newLeft > left;
	                    downY = newTop > top;
	                    laterFn = container.itsa_getData("itsa_scrollTimer");
	                    laterFn && laterFn.cancel();
	                    laterFn = later(function () {
	                        left += incrementX;
	                        top += incrementY;
	                        if (downX) {
	                            left <= newLeft || (left = newLeft);
	                        } else {
	                            left >= newLeft || (left = newLeft);
	                        }
	                        if (downY) {
	                            top <= newTop || (top = newTop);
	                        } else {
	                            top >= newTop || (top = newTop);
	                        }
	                        if (windowContainer) {
	                            container.scrollTo(Math.round(left), Math.round(top));
	                        } else {
	                            container.itsa_scrollTo(Math.round(left), Math.round(top));
	                        }
	                        if (top === newTop) {
	                            container.itsa_removeData("itsa_scrollTimer");
	                            laterFn.cancel();
	                        }
	                    }, 0, SCROLL_TIMER);
	                    container.itsa_setData("itsa_scrollTimer", laterFn);
	                }
	            } else {
	                async(function () {
	                    if (windowContainer) {
	                        WINDOW.scrollTo(newLeft, newTop);
	                    } else {
	                        container.itsa_scrollTo(newLeft, newTop);
	                    }
	                });
	            }
	        }
	    };
	};

/***/ }),
/* 15 */
/***/ (function(module, exports) {

	"use strict";

	module.exports = function (window) {
	    var document = window.document,
	        body = document.body,
	        node,
	        supportsCalc,
	        childNode;
	    childNode = document.createElement("div");
	    childNode.setAttribute("style", "width: calc(10px - 2px); opacity:0; position: absolute; z-index: -1; left:-9999px; top:-9999px;");
	    node = body.appendChild(childNode);
	    supportsCalc = node.offsetWidth === 8;
	    body.removeChild(node);
	    return supportsCalc;
	};

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	/*
	 * Returns the vendor-specific transform-property for the current environment.
	 *
	 * `transform`, `-webkit-transform`, `-moz-transform`, `-ms-transform`, `-o-transform` or `undefined` when not supported
	 */

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var toCamelCase = function toCamelCase(input) {
	    return input.replace(/-(.)/g, function (match, group) {
	        return group.toUpperCase();
	    });
	},
	    isNode = typeof global !== "undefined" && {}.toString.call(global) === "[object global]" && (!global.document || {}.toString.call(global.document) !== "[object HTMLDocument]"),
	    UNDEFINED = "undefined",
	    VendorCSS;

	module.exports = function (window) {

	    if (VendorCSS) {
	        return VendorCSS; // VendorCSS was already created
	    }

	    var DOCUMENT_STYLE = window.document.documentElement.style,
	        VENDORS = ["-webkit-", "-moz-", "-ms-", "-o-"];

	    VendorCSS = {
	        generator: function generator(cssProperty) {
	            var vendorProperty;
	            if (cssProperty === "") {
	                return "";
	            }
	            if (!isNode && !VendorCSS.cssProps[cssProperty]) {
	                if (_typeof(DOCUMENT_STYLE[cssProperty]) !== UNDEFINED) {
	                    vendorProperty = cssProperty;
	                } else {
	                    VENDORS.some(function (val) {
	                        // then vendor specific
	                        var property = val + cssProperty,
	                            propertyCamelCase = toCamelCase(property);
	                        if (_typeof(DOCUMENT_STYLE[property]) !== UNDEFINED || _typeof(DOCUMENT_STYLE[propertyCamelCase]) !== UNDEFINED) {
	                            vendorProperty = property;
	                        }
	                        return vendorProperty;
	                    });
	                }
	                VendorCSS.cssProps[vendorProperty] = true;
	            }
	            return vendorProperty || cssProperty;
	        },

	        cssProps: {}
	    };

	    return VendorCSS;
	};
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var map = {
		"./vendor-transition-end": 18
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 17;


/***/ }),
/* 18 */
/***/ (function(module, exports) {

	"use strict";

	var TransitionEnd;

	module.exports = function (window) {

	    if (TransitionEnd) {
	        return TransitionEnd; // TransitionEnd was already determined
	    }

	    var DOCUMENT_STYLE = window.document.documentElement.style,
	        transitions = {},
	        ransition = "ransition",
	        transition = "t" + ransition,
	        end = "end",
	        transitionEnd,
	        t;

	    transitions[transition] = transition + end;
	    transitions["WebkitT" + ransition] = "webkitT" + ransition + "End";
	    transitions["MozT" + ransition] = transition + end;
	    transitions["OT" + ransition] = "o" + transition + end;

	    for (t in transitions) {
	        if (typeof DOCUMENT_STYLE[t] !== "undefined") {
	            transitionEnd = transitions[t];
	            break;
	        }
	    }

	    TransitionEnd = transitionEnd;

	    return transitionEnd;
	};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Adding sugar utilities to the document-object
	 *
	 *
	 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module itsa-dom
	 * @class document
	 * @since 0.0.1
	*/

	module.exports = function (WINDOW) {

	    var DOCUMENT = WINDOW.document;

	    if (DOCUMENT) {
	        /**
	         * Gets an ElementArray of Elements, specified by the css-selector.
	         *
	         * @method itsa_getAll
	         * @param cssSelector {String} css-selector to match
	         * @return {ElementArray} ElementArray of Elements that match the css-selector
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_getAll = function (cssSelector) {
	            return this.querySelectorAll(cssSelector);
	        };

	        /**
	         * Gets one Element, specified by the css-selector. To retrieve a single element by id,
	         * you need to prepend the id-name with a `#`. When multiple Element's match, the first is returned.
	         *
	         * @method itsa_getElement
	         * @param cssSelector {String} css-selector to match
	         * @return {Element|null} the Element that was search for
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_getElement = function (cssSelector) {
	            return cssSelector[0] === "#" && cssSelector.indexOf(" ") === -1 ? this.getElementById(cssSelector.substr(1)) : this.querySelector(cssSelector);
	        };

	        /**
	         * Tests if an Element would be selected by the specified cssSelector.
	         * Alias for `matchesSelector()`
	         *
	         * @method itsa_test
	         * @param element {Element} The Element to test
	         * @param cssSelector {String} the css-selector to test against
	         * @return {Boolean} whether or not the node matches the selector
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_test = function (element, cssSelector) {
	            return element.matchesSelector(cssSelector);
	        };
	    }
	};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Adding sugar utilities to Element
	 *
	 *
	 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module itsa-dom
	 * @class Element
	 * @since 0.0.1
	*/

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	__webpack_require__(21);
	__webpack_require__(22);
	__webpack_require__(23);

	var toCamelCase = function toCamelCase(input) {
	    input || (input = "");
	    return input.replace(/-(.)/g, function (match, group) {
	        return group.toUpperCase();
	    });
	},
	    fromCamelCase = function fromCamelCase(input) {
	    input || (input = "");
	    return input.replace(/[a-z]([A-Z])/g, function (match, group) {
	        return match[0] + "-" + group.toLowerCase();
	    });
	},
	    STRING = "string",
	    OVERFLOW = "overflow",
	    SCROLL = "scroll",
	    BORDER = "border",
	    WIDTH = "width",
	    STYLE = "style",
	    _LEFT = "-left",
	    _TOP = "-top",
	    BORDER_LEFT_WIDTH = BORDER + _LEFT + "-" + WIDTH,
	    BORDER_RIGHT_WIDTH = BORDER + "-right-" + WIDTH,
	    BORDER_TOP_WIDTH = BORDER + _TOP + "-" + WIDTH,
	    BORDER_BOTTOM_WIDTH = BORDER + "-bottom-" + WIDTH;

	module.exports = function (WINDOW) {
	    __webpack_require__(13)(WINDOW);

	    var DOCUMENT = WINDOW.document,
	        scrollTo = __webpack_require__(14)(WINDOW);

	    if (WINDOW.Element && WINDOW.Element.prototype) {
	        (function (ElementPrototype) {

	            /**
	             * Reference to the first of sibbling HTMLElements.
	             *
	             * @method itsa_first
	             * @param [cssSelector] {String} to return the first Element that matches the css-selector
	             * @param [container] {HTMLElement} the container-element to search within --> this lead into searching out of the same level
	             * @return {HTMLElement}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_first = function (cssSelector, container) {
	                var containerNode = container || this.parentNode;
	                return cssSelector ? containerNode.querySelector(cssSelector) : containerNode.children[0];
	            };

	            /**
	             * Reference to the first child-HTMLElement.
	             *
	             * @method itsa_firstChild
	             * @param [cssSelector] {String} to return the first Element that matches the css-selector or `undefined` when not found
	             * @return {HTMLElement}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_firstChild = function (cssSelector) {
	                var children = this.children,
	                    node;
	                if (!cssSelector) {
	                    return children[0];
	                }
	                Array.prototype.some.call(children, function (childNode) {
	                    childNode.matchesSelector(cssSelector) && (node = childNode);
	                    return node;
	                });
	                return node;
	            };

	            /**
	             * Forces the Element to be inside an ancestor-Element that has the `overfow="scroll" set.
	             *
	             * @method forceIntoNodeView
	             * @param [ancestor] {Element} the Element where it should be forced into its view.
	             *        Only use this when you know the ancestor and this ancestor has an `overflow="scroll"` property
	             *        when not set, this method will seek through the doc-tree upwards for the first Element that does match this criteria.
	             * @chainable
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_forceIntoNodeView = function (ancestor, transitionTime) {
	                var node = this,
	                    parentOverflowNode = node.parentNode,
	                    left,
	                    width,
	                    right,
	                    height,
	                    top,
	                    bottom,
	                    scrollLeft,
	                    scrollTop,
	                    parentOverflowNodeX,
	                    parentOverflowNodeY,
	                    parentOverflowNodeStartTop,
	                    parentOverflowNodeStartLeft,
	                    parentOverflowNodeStopRight,
	                    parentOverflowNodeStopBottom,
	                    newX,
	                    newY;
	                if (parentOverflowNode) {
	                    if (ancestor) {
	                        parentOverflowNode = ancestor;
	                    } else {
	                        while (parentOverflowNode && parentOverflowNode !== DOCUMENT && !(parentOverflowNode.itsa_getStyle(OVERFLOW) === SCROLL || parentOverflowNode.itsa_getStyle(OVERFLOW + "-y") === SCROLL)) {
	                            parentOverflowNode = parentOverflowNode.parentNode;
	                        }
	                    }
	                    if (parentOverflowNode && parentOverflowNode !== DOCUMENT) {
	                        left = node.itsa_left;
	                        width = node.offsetWidth;
	                        right = left + width;
	                        height = node.offsetHeight;
	                        top = node.itsa_top;
	                        bottom = top + height;
	                        scrollLeft = parentOverflowNode === WINDOW ? parentOverflowNode.itsa_getScrollLeft() : parentOverflowNode.scrollLeft;
	                        scrollTop = parentOverflowNode === WINDOW ? parentOverflowNode.itsa_getScrollTop() : parentOverflowNode.scrollTop;
	                        parentOverflowNodeX = parentOverflowNode.itsa_left;
	                        parentOverflowNodeY = parentOverflowNode.itsa_top;
	                        parentOverflowNodeStartTop = parentOverflowNodeY + parseInt(parentOverflowNode.itsa_getStyle(BORDER_TOP_WIDTH), 10);
	                        parentOverflowNodeStartLeft = parentOverflowNodeX + parseInt(parentOverflowNode.itsa_getStyle(BORDER_LEFT_WIDTH), 10);
	                        parentOverflowNodeStopRight = parentOverflowNodeX + parentOverflowNode.offsetWidth - parseInt(parentOverflowNode.itsa_getStyle(BORDER_RIGHT_WIDTH), 10);
	                        parentOverflowNodeStopBottom = parentOverflowNodeY + parentOverflowNode.offsetHeight - parseInt(parentOverflowNode.itsa_getStyle(BORDER_BOTTOM_WIDTH), 10);

	                        if (left < parentOverflowNodeStartLeft) {
	                            newX = Math.max(0, scrollLeft + left - parentOverflowNodeStartLeft);
	                        } else if (right > parentOverflowNodeStopRight) {
	                            newX = scrollLeft + right - parentOverflowNodeStopRight;
	                        }
	                        if (top < parentOverflowNodeStartTop) {
	                            newY = Math.max(0, scrollTop + top - parentOverflowNodeStartTop);
	                        } else if (bottom > parentOverflowNodeStopBottom) {
	                            newY = scrollTop + bottom - parentOverflowNodeStopBottom;
	                        }
	                        scrollTo(parentOverflowNode, scrollLeft, scrollTop, newX, newY, transitionTime);
	                    }
	                }
	                return node;
	            };

	            /**
	             * Focusses the node (if focussable), and forces the Element to be inside the visible window.
	             *
	             * @method itsa_focus
	             * @param [atTop] {Element} the Element where it should be forced into its view.
	             * @param [atLeft] {Element} the Element where it should be forced into its view.
	             * @param [transitionTime] {Element} the Element where it should be forced into its view.
	             * @chainable
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_focus = function (atTop, atLeft, transitionTime) {
	                // var instance = this;
	                var currentY = WINDOW.itsa_getScrollTop(),
	                    currentX = WINDOW.itsa_getScrollLeft();
	                // focussing will bring the element into view directly, we don;t want that.
	                // We want to scroll it into the view: therefore reset the scroll-position
	                this.focus();
	                WINDOW.scrollTo(currentX, currentY);
	                this.itsa_scrollIntoView(atTop, atLeft, transitionTime);
	            };

	            /**
	             * Gets an ElementArray of Elements that lie within this Element and match the css-selector.
	             *
	             * @method itsa_getAll
	             * @param cssSelector {String} css-selector to match
	             * @param [inspectProtectedNodes=false] {Boolean} no deepsearch in protected Nodes or iTags --> by default, these elements should be hidden
	             * @return {ElementArray} ElementArray of Elements that match the css-selector
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_getAll = function (cssSelector) {
	                return this.querySelectorAll(cssSelector);
	            };

	            /**
	             * Returns data set specified by `key`. If not set, `undefined` will be returned.
	             * The data is efficiently stored on the vnode.
	             *
	             * @method itsa_getData
	             * @param key {string} name of the key
	             * @return {Any|undefined} data set specified by `key`
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_getData = function (key) {
	                return this._data && this._data[key];
	            };

	            /**
	             * Gets one Element, specified by the css-selector. To retrieve a single element by id,
	             * you need to prepend the id-name with a `#`. When multiple Element's match, the first is returned.
	             *
	             * @method itsa_getElement
	             * @param cssSelector {String} css-selector to match
	             * @return {Element|null} the Element that was search for
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_getElement = function (cssSelector) {
	                return this.querySelector(cssSelector);
	            };

	            /**
	             * Returns inline style of the specified property. `Inline` means: what is set directly on the Element,
	             * this doesn't mean necesairy how it is looked like: when no css is set inline, the Element might still have
	             * an appearance because of other CSS-rules.
	             *
	             * In most cases, you would be interesting in using `getStyle()` instead.
	             *
	             * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
	             *
	             * @method itsa_getInlineStyle
	             * @param cssProperty {String} the css-property to look for
	             * @param [pseudo] {String} to look inside a pseudo-style
	             * @return {String|undefined} css-style
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_getInlineStyle = function (cssProperty) {
	                var styles = this.getAttribute(STYLE) || "",
	                    styleArray = styles.split(";"),
	                    value;
	                cssProperty = fromCamelCase(cssProperty);
	                styleArray.some(function (style) {
	                    var styleDetails = style.split(":"),
	                        key = styleDetails[0].toLowerCase().itsa_trim();
	                    if (key === cssProperty) {
	                        value = styleDetails[1] ? styleDetails[1].toLowerCase().itsa_trim() : "";
	                    }
	                    return value !== undefined;
	                });
	                return value;
	            };

	            /**
	             * Returns cascaded style of the specified property. `Cascaded` means: the actual present style,
	             * the way it is visible (calculated through the DOM-tree).
	             *
	             * <ul>
	             *     <li>Note1: values are absolute: percentages and points are converted to absolute values, sizes are in pixels, colors in rgb/rgba-format.</li>
	             *     <li>Note2: you cannot query shotcut-properties: use `margin-left` instead of `margin`.</li>
	             *     <li>Note3: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine.</li>
	             *     <li>Note4: you can query `transition`, `transform`, `perspective` and `transform-origin` instead of their vendor-specific properties.</li>
	             *     <li>Note5: `transition` or `transform` return an Object instead of a String.</li>
	             * </ul>
	             *
	             * @method itsa_getStyle
	             * @param cssProperty {String} property that is queried
	             * @param [pseudo] {String} to query pseudo-element, fe: `:before` or `:first-line`
	             * @return {String|Object} value for the css-property: this is an Object for the properties `transition` or `transform`
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_getStyle = function (cssProperty, pseudo) {
	                // Cautious: when reading the property `transform`, getComputedStyle should
	                // read the calculated value, but some browsers (webkit) only calculate the style on the current element
	                // In those cases, we need a patch and look up the tree ourselves
	                //  Also: we will return separate value, NOT matrices
	                return WINDOW.getComputedStyle(this, pseudo)[toCamelCase(cssProperty)];
	            };

	            /**
	             * Whether the Element has a specific class.
	             *
	             * @method itsa_hasClass
	             * @param classname {String} the class to check for
	             * @return {Boolean}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_hasClass = function (classname) {
	                var classes = this.className || "";
	                return classes.itsa_contains(classname);
	            };

	            /**
	             * If the Element has data set specified by `key`. The data could be set with `itsa_setData()`.
	             *
	             * @method itsa_hasData
	             * @param key {string} name of the key
	             * @return {Boolean}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_hasData = function (key) {
	                return !!(this._data && this._data[key] !== undefined);
	            };

	            /**
	             * Indicates whether Element currently has the focus.
	             *
	             * @method itsa_hasFocus
	             * @param [inside=false] {Boolean} whether focus may also lie on a descendent Element
	             * @return {Boolean}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_hasFocus = function (inside) {
	                return DOCUMENT.activeElement === this || (inside ? this.itsa_hasFocusInside() : false);
	            };

	            /**
	             * Indicates whether the current focussed Element lies inside this Element (on a descendant Element).
	             *
	             * @method itsa_hasFocusInside
	             * @return {Boolean}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_hasFocusInside = function () {
	                var activeElement = DOCUMENT.activeElement;
	                return this !== activeElement && this.contains(activeElement);
	            };

	            /**
	             * Returns whether the inline style of the specified property is present. `Inline` means: what is set directly on the Element.
	             *
	             * Note: no need to camelCase cssProperty: both `margin-left` as well as `marginLeft` are fine
	             *
	             * @method itsa_hasInlineStyle
	             * @param cssProperty {String} the css-property to look for
	             * @return {Boolean} whether the inlinestyle was present
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_hasInlineStyle = function (cssProperty) {
	                return !!this.itsa_getInlineStyle(cssProperty);
	            };

	            /**
	              * Checks whether the Element lies within the specified selector (which can be a CSS-selector or a Element)
	              *
	              * @example
	              * var divnode = childnode.itsa_inside('div.red');
	              *
	              * @example
	              * var divnode = childnode.itsa_inside(containerNode);
	              *
	              * @method itsa_inside
	              * @param selector {Element|String} the selector, specified by a Element or a css-selector
	              * @return {Element|false} the nearest Element that matches the selector, or `false` when not found
	              * @since 0.0.1
	              */
	            ElementPrototype.itsa_inside = function (selector) {
	                var instance = this,
	                    parentNode;
	                if ((typeof selector === "undefined" ? "undefined" : _typeof(selector)) === STRING) {
	                    parentNode = instance.parentNode;
	                    while (parentNode && parentNode.matchesSelector && !parentNode.matchesSelector(selector)) {
	                        parentNode = parentNode.parentNode;
	                    }
	                    return parentNode.matchesSelector ? parentNode : false;
	                } else {
	                    // selector should be an Element
	                    return selector !== instance && selector.contains(instance) ? selector : false;
	                }
	            };

	            /**
	              * Checks whether a point specified with x,y is within the Element's region.
	              *
	              * @method itsa_insidePos
	              * @param x {Number} x-value for new position (coordinates are page-based)
	              * @param y {Number} y-value for new position (coordinates are page-based)
	              * @return {Boolean} whether there is a match
	              * @since 0.0.1
	              */
	            ElementPrototype.itsa_insidePos = function (x, y) {
	                var instance = this,
	                    left = instance.itsa_left,
	                    top = instance.itsa_top,
	                    right = left + instance.offsetWidth,
	                    bottom = top + instance.offsetHeight;
	                return x >= left && x <= right && y >= top && y <= bottom;
	            };

	            /**
	             * Whether the element is an Itag-element
	             *
	             * @method itsa_isEmpty
	             * @return {Boolean}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_isEmpty = function () {
	                return this.childNodes.length === 0;
	            };

	            /**
	             * Reference to the last of sibbling node's, where the related dom-node is an Element(nodeType===1).
	             *
	             * @method itsa_last
	             * @param [cssSelector] {String} to return the last Element that matches the css-selector
	             * @param [container] {HTMLElement} the container-element to search within --> this lead into searching out of the same level
	             * @return {Element}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_last = function (cssSelector, container) {
	                var containerNode = container || this.parentNode,
	                    allNodes = cssSelector ? containerNode.querySelectorAll(cssSelector) : containerNode.children,
	                    len = allNodes.length;
	                return allNodes[len - 1];
	            };

	            /**
	             * Reference to the last child-HTMLElement.
	             *
	             * @method itsa_lastChild
	             * @param [cssSelector] {String} to return the last Element that matches the css-selector or `undefined` when not found
	             * @return {HTMLElement}
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_lastChild = function (cssSelector) {
	                var children = this.children,
	                    lastIndex = children.length - 1,
	                    i = lastIndex,
	                    node,
	                    childNode;
	                if (!cssSelector) {
	                    return children[lastIndex];
	                }
	                while (i >= 0 && !node) {
	                    childNode = children[i];
	                    childNode.matchesSelector(cssSelector) && (node = childNode);
	                    i--;
	                }
	                return node;
	            };

	            /**
	              * Checks whether the Element has its rectangle inside the outbound-Element.
	              * This is no check of the DOM-tree, but purely based upon coordinates.
	              *
	              * @method itsa_rectangleInside
	              * @param outboundElement {Element} the Element where this element should lie inside
	              * @return {Boolean} whether the Element lies inside the outboundElement
	              * @since 0.0.1
	              */
	            ElementPrototype.itsa_rectangleInside = function (outboundElement) {
	                var instance = this,
	                    outerRect = outboundElement.getBoundingClientRect(),
	                    innerRect = instance.getBoundingClientRect();
	                return outerRect.left <= innerRect.left && outerRect.top <= innerRect.top && outerRect.left + outboundElement.offsetWidth >= innerRect.left + instance.offsetWidth && outerRect.top + outboundElement.offsetHeight >= innerRect.top + instance.offsetHeight;
	            };

	            /**
	             * Removes data specified by `key` that was set by using `itsa_setData()`.
	             * When no arguments are passed, all node-data (key-value pairs) will be removed.
	             *
	             * @method itsa_removeData
	             * @param [key] {string} name of the key, when not set, all data is removed
	             * @param [deep] {Boolean} whether to set the data to all descendants recursively
	             * @chainable
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_removeData = function (key, deep) {
	                var instance = this;
	                if (instance._data) {
	                    if (key) {
	                        delete instance._data[key];
	                    } else {
	                        // we cannot just redefine _data, for it is set as readonly
	                        instance.itsa_emptyObject();
	                        if (deep) {
	                            instance.children.forEach(function (element) {
	                                element.itsa_removeData(key, true);
	                            });
	                        }
	                    }
	                }
	                return instance;
	            };

	            /**
	             * Forces the Element to be inside the visible window.
	             *
	             * @method itsa_scrollIntoView
	             * @param [atTop] {Element} the Element where it should be forced into its view.
	             * @param [atLeft] {Element} the Element where it should be forced into its view.
	             * @param [transitionTime] {Element} the Element where it should be forced into its view.
	             * @param [marginTop] {Element} additional top-margin
	             * @param [marginLeft] {Element} additional left-margin
	             * @chainable
	             * @since 0.0.1
	             */
	            ElementPrototype.itsa_scrollIntoView = function (atTop, atLeft, transitionTime, marginTop, marginLeft) {
	                var node = this,
	                    newTop,
	                    newLeft,
	                    windowTop,
	                    windowLeft,
	                    windowBottom,
	                    windowRight;
	                windowTop = WINDOW.itsa_getScrollTop();
	                marginTop || (marginTop = 0);
	                marginLeft || (marginLeft = 0);
	                if (atTop || node.itsa_top - marginTop < windowTop) {
	                    // position top of node on top of window
	                    newTop = node.itsa_top;
	                }
	                if (!atTop) {
	                    windowBottom = windowTop + WINDOW.itsa_getHeight();
	                    if (node.itsa_bottom > windowBottom) {
	                        // correct based on the bottom of the node, but never more than difference between top-node and top-window:
	                        newTop = Math.round(Math.min(node.itsa_bottom - windowBottom, node.itsa_top - windowTop) + windowTop);
	                    }
	                }
	                windowLeft = WINDOW.itsa_getScrollLeft();
	                if (atLeft || node.itsa_left - marginLeft < windowLeft) {
	                    // position left of node on left of window
	                    newLeft = node.itsa_left;
	                }
	                if (!atLeft) {
	                    windowRight = windowLeft + WINDOW.itsa_getWidth();
	                    if (node.itsa_right > windowRight) {
	                        // correct based on the right of the node, but never more than difference between left-node and left-window:
	                        newLeft = Math.round(Math.min(node.itsa_right - windowRight, node.itsa_left - windowLeft) + windowLeft);
	                    }
	                }
	                newLeft !== undefined && (newLeft -= marginLeft);
	                newTop !== undefined && (newTop -= marginTop);
	                scrollTo(WINDOW, windowLeft, windowTop, newLeft, newTop, transitionTime);
	            };

	            /**
	             * Scrolls the content of the Element into the specified scrollposition.
	             * Only available when the Element has overflow.
	             *
	             * @method itsa_scrollTo
	             * @param x {Number} left-offset in pixels
	             * @param y {Number} top-offset in pixels
	             * @chainable
	             * @since 0.0.1
	            */
	            ElementPrototype.itsa_scrollTo = function (x, y) {
	                var instance = this;
	                instance.scrollLeft = x;
	                instance.scrollTop = y;
	                return instance;
	            };

	            /**
	             * Stores arbitary `data` at the Element (actually at vnode). This has nothing to do with node-attributes whatsoever,
	             * it is just a way to bind any data to the specific Element so it can be retrieved later on with `itsa_getData()`.
	             *
	             * @method itsa_setData
	             * @param key {string} name of the key
	             * @param value {Any} the value that belongs to `key`
	             * @param [deep] {Boolean} whether to set the data to all descendants recursively
	             * @chainable
	             * @since 0.0.1
	            */
	            ElementPrototype.itsa_setData = function (key, value, deep) {
	                var instance = this;
	                if (value !== undefined) {
	                    instance._data || Object.itsa_protectedProp(instance, "_data", {});
	                    instance._data[key] = value;
	                    if (deep) {
	                        instance.children.forEach(function (element) {
	                            element.itsa_setData(key, value, true);
	                        });
	                    }
	                }
	                return instance;
	            };

	            if (Object.defineProperty && Object.getOwnPropertyDescriptor && (!Object.getOwnPropertyDescriptor(ElementPrototype, "itsa_bottom") || !Object.getOwnPropertyDescriptor(ElementPrototype, "itsa_bottom").get)) {
	                Object.defineProperties(ElementPrototype, {

	                    /**
	                     * Gets the bottom y-position (in the DOCUMENT) of the element in pixels.
	                     * DOCUMENT-related: regardless of the WINDOW's scroll-position.
	                     *
	                     * @property itsa_bottom
	                     * @since 0.0.1
	                     */
	                    itsa_bottom: {
	                        get: function get() {
	                            return this.itsa_top + this.offsetHeight;
	                        }
	                    },

	                    /**
	                     * Returns the Elments `id`
	                     *
	                     * @method itsa_id
	                     * @return {String|undefined} Elements `id`
	                     * @since 0.0.1
	                     */
	                    itsa_id: {
	                        get: function get() {
	                            return this.getAttribute("id");
	                        }
	                    },

	                    /**
	                     * Gets or set the innerHeight of the element in pixels. Excluded the borders.
	                     * Included are padding.
	                     *
	                     * The getter is calculating through `offsetHeight`, the setter will set inline css-style for the height.
	                     *
	                     * Values are numbers without unity.
	                     *
	                     * @property itsa_innerHeight
	                     * @type {Number}
	                     * @since 0.0.1
	                     */
	                    itsa_innerHeight: {
	                        get: function get() {
	                            var instance = this,
	                                borderTop = parseInt(instance.itsa_getStyle("border-top-width"), 10) || 0,
	                                borderBottom = parseInt(instance.itsa_getStyle("border-bottom-width"), 10) || 0;
	                            return instance.offsetHeight - borderTop - borderBottom;
	                        }
	                    },

	                    /**
	                     * Gets or set the innerHeight of the element in pixels. Excluded the borders.
	                     * Included are padding.
	                     *
	                     * The getter is calculating through `offsetHeight`, the setter will set inline css-style for the height.
	                     *
	                     * Values are numbers without unity.
	                     *
	                     * @property itsa_innerWidth
	                     * @type {Number}
	                     * @since 0.0.1
	                     */
	                    itsa_innerWidth: {
	                        get: function get() {
	                            var instance = this,
	                                borderLeft = parseInt(instance.itsa_getStyle("border-left-width"), 10) || 0,
	                                borderRight = parseInt(instance.itsa_getStyle("border-right-width"), 10) || 0;
	                            return instance.offsetWidth - borderLeft - borderRight;
	                        }
	                    },

	                    /**
	                     * Gets the x-position (in the DOCUMENT) of the element in pixels.
	                     * DOCUMENT-related: regardless of the WINDOW's scroll-position.
	                     *
	                     * @property itsa_left
	                     * @since 0.0.1
	                     */
	                    itsa_left: {
	                        get: function get() {
	                            return Math.round(this.getBoundingClientRect().left + WINDOW.itsa_getScrollLeft());
	                        }
	                    },

	                    /**
	                     * Gets the right-position (in the DOCUMENT) of the element in pixels.
	                     * DOCUMENT-related: regardless of the WINDOW's scroll-position.
	                     *
	                     * @property itsa_right
	                     * @since 0.0.1
	                     */
	                    itsa_right: {
	                        get: function get() {
	                            return this.itsa_left + this.offsetWidth;
	                        }
	                    },

	                    /**
	                     * Gets the y-position (in the DOCUMENT) of the element in pixels.
	                     * DOCUMENT-related: regardless of the WINDOW's scroll-position.
	                     *
	                     * @property itsa_top
	                     * @since 0.0.1
	                     */
	                    itsa_top: {
	                        get: function get() {
	                            return Math.round(this.getBoundingClientRect().top + WINDOW.itsa_getScrollTop());
	                        }
	                    }

	                });
	            }
	        })(WINDOW.Element.prototype);
	    }
	};

/***/ }),
/* 21 */
/***/ (function(module, exports) {

	/**
	 *
	 * Pollyfils for often used functionality for Objects
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module js-ext
	 * @submodule lib/object.js
	 * @class Object
	 *
	*/

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var TYPES = {
	    "undefined": true,
	    "number": true,
	    "boolean": true,
	    "string": true,
	    "[object Function]": true,
	    "[object RegExp]": true,
	    "[object Array]": true,
	    "[object Date]": true,
	    "[object Error]": true,
	    "[object Blob]": true,
	    "[object Promise]": true // DOES NOT WORK in all browsers
	},
	    FUNCTION = "function",


	// Define configurable, writable and non-enumerable props
	// if they don't exist.
	defineProperty = function defineProperty(object, name, method, force) {
	    if (!force && name in object) {
	        return;
	    }
	    Object.defineProperty(object, name, {
	        configurable: true,
	        enumerable: false,
	        writable: true,
	        value: method
	    });
	},
	    defineProperties = function defineProperties(object, map, force) {
	    var names = Object.keys(map),
	        l = names.length,
	        i = -1,
	        name;
	    while (++i < l) {
	        name = names[i];
	        defineProperty(object, name, map[name], force);
	    }
	},
	    cloneObj = function cloneObj(obj, descriptors) {
	    var copy, i, len, value;

	    // Handle Array
	    if (Array.isArray(obj)) {
	        copy = [];
	        len = obj.length;
	        for (i = 0; i < len; i++) {
	            value = obj[i];
	            copy[i] = Object.itsa_isObject(value) || Array.isArray(value) ? cloneObj(value, descriptors) : value;
	        }
	        return copy;
	    }

	    // Handle Date
	    if (obj instanceof Date) {
	        copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Object
	    if (Object.itsa_isObject(obj)) {
	        return obj.itsa_deepClone(descriptors);
	    }

	    return obj;
	},
	    valuesAreTheSame = function valuesAreTheSame(value1, value2) {
	    var same, i, len;
	    // complex values need to be inspected differently:
	    if (Object.itsa_isObject(value1)) {
	        same = Object.itsa_isObject(value2) ? value1.itsa_sameValue(value2) : false;
	    } else if (Array.isArray(value1)) {
	        if (Array.isArray(value2)) {
	            len = value1.length;
	            if (len === value2.length) {
	                same = true;
	                for (i = 0; same && i < len; i++) {
	                    same = valuesAreTheSame(value1[i], value2[i]);
	                }
	            } else {
	                same = false;
	            }
	        } else {
	            same = false;
	        }
	    } else if (value1 instanceof Date) {
	        same = value2 instanceof Date ? value1.getTime() === value2.getTime() : false;
	    } else {
	        same = value1 === value2;
	    }
	    return same;
	},
	    deepCloneObj = function deepCloneObj(source, target, descriptors, proto) {
	    var m = target || Object.create(proto || Object.getPrototypeOf(source)),
	        keys = Object.getOwnPropertyNames(source),
	        l = keys.length,
	        i = -1,
	        key,
	        value,
	        propDescriptor;
	    // loop through the members:
	    while (++i < l) {
	        key = keys[i];
	        value = source[key];
	        if (descriptors) {
	            propDescriptor = Object.getOwnPropertyDescriptor(source, key);
	            if (propDescriptor.writable) {
	                Object.defineProperty(m, key, propDescriptor);
	            }
	            if ((Object.itsa_isObject(value) || Array.isArray(value)) && _typeof(propDescriptor.get) !== FUNCTION && _typeof(propDescriptor.set) !== FUNCTION) {
	                m[key] = cloneObj(value, descriptors);
	            } else {
	                m[key] = value;
	            }
	        } else {
	            m[key] = Object.itsa_isObject(value) || Array.isArray(value) ? cloneObj(value, descriptors) : value;
	        }
	    }
	    return m;
	};

	/**
	 * Pollyfils for often used functionality for objects
	 * @class Object
	*/
	defineProperties(Object.prototype, {
	    /**
	     * Loops through all properties in the object.  Equivalent to Array.forEach.
	     * The callback is provided with the value of the property, the name of the property
	     * and a reference to the whole object itself.
	     * The context to run the callback in can be overriden, otherwise it is undefined.
	     *
	     * @method itsa_each
	     * @param fn {Function} Function to be executed on each item in the object.  It will receive
	     *                      value {any} value of the property
	     *                      key {string} name of the property
	     *                      obj {Object} the whole of the object
	     * @chainable
	     */
	    itsa_each: function itsa_each(fn, context) {
	        var obj = this,
	            keys = Object.keys(obj),
	            l = keys.length,
	            i = -1,
	            key;
	        while (++i < l) {
	            key = keys[i];
	            fn.call(context || obj, obj[key], key, obj);
	        }
	        return obj;
	    },

	    /**
	     * Loops through the properties in an object until the callback function returns *truish*.
	     * The callback is provided with the value of the property, the name of the property
	     * and a reference to the whole object itself.
	     * The order in which the elements are visited is not predictable.
	     * The context to run the callback in can be overriden, otherwise it is undefined.
	     *
	     * @method itsa_some
	     * @param fn {Function} Function to be executed on each item in the object.  It will receive
	     *                      value {any} value of the property
	     *                      key {string} name of the property
	     *                      obj {Object} the whole of the object
	     * @return {Boolean} true if the loop was interrupted by the callback function returning *truish*.
	     */
	    itsa_some: function itsa_some(fn, context) {
	        var keys = Object.keys(this),
	            l = keys.length,
	            i = -1,
	            key;
	        while (++i < l) {
	            key = keys[i];
	            if (fn.call(context || this, this[key], key, this)) {
	                return true;
	            }
	        }
	        return false;
	    },

	    /*
	     * Loops through the properties in an object until the callback assembling a new object
	     * with its properties set to the values returned by the callback function.
	     * If the callback function returns `undefined` the property will not be copied to the new object.
	     * The resulting object will have the same keys as the original, except for those where the callback
	     * returned `undefined` which will have dissapeared.
	     * The callback is provided with the value of the property, the name of the property
	     * and a reference to the whole object itself.
	     * The context to run the callback in can be overriden, otherwise it is undefined.
	     *
	     * @method itsa_map
	     * @param fn {Function} Function to be executed on each item in the object.  It will receive
	     *                      value {any} value of the property
	     *                      key {string} name of the property
	     *                      obj {Object} the whole of the object
	     * @return {Object} The new object with its properties set to the values returned by the callback function.
	     */
	    itsa_map: function itsa_map(fn, context) {
	        var keys = Object.keys(this),
	            l = keys.length,
	            i = -1,
	            m = {},
	            val,
	            key;
	        while (++i < l) {
	            key = keys[i];
	            val = fn.call(context, this[key], key, this);
	            if (val !== undefined) {
	                m[key] = val;
	            }
	        }
	        return m;
	    },

	    /**
	     * Returns the keys of the object: the enumerable properties.
	     *
	     * @method itsa_keys
	     * @return {Array} Keys of the object
	     */
	    itsa_keys: function itsa_keys() {
	        return Object.keys(this);
	    },

	    /**
	     * Checks whether the given property is a key: an enumerable property.
	     *
	     * @method itsa_hasKey
	     * @param property {String} the property to check for
	     * @return {Boolean} Keys of the object
	     */
	    itsa_hasKey: function itsa_hasKey(property) {
	        return this.hasOwnProperty(property) && this.propertyIsEnumerable(property);
	    },

	    /**
	     * Returns the number of keys of the object
	     *
	     * @method itsa_size
	     * @param inclNonEnumerable {Boolean} wether to include non-enumeral members
	     * @return {Number} Number of items
	     */
	    itsa_size: function itsa_size(inclNonEnumerable) {
	        return inclNonEnumerable ? Object.getOwnPropertyNames(this).length : Object.keys(this).length;
	    },

	    /**
	     * Loops through the object collection the values of all its properties.
	     * It is the counterpart of the [`keys`](#method_keys).
	     *
	     * @method itsa_values
	     * @return {Array} values of the object
	     */
	    itsa_values: function itsa_values() {
	        var keys = Object.keys(this),
	            i = -1,
	            len = keys.length,
	            values = [];

	        while (++i < len) {
	            values.push(this[keys[i]]);
	        }

	        return values;
	    },

	    /**
	     * Returns true if the object has no own members
	     *
	     * @method itsa_isEmpty
	     * @return {Boolean} true if the object is empty
	     */
	    itsa_isEmpty: function itsa_isEmpty() {
	        for (var key in this) {
	            if (this.hasOwnProperty(key)) return false;
	        }
	        return true;
	    },

	    /**
	     * Returns a shallow copy of the object.
	     * It does not clone objects within the object, it does a simple, shallow clone.
	     * Fast, mostly useful for plain hash maps.
	     *
	     * @method itsa_shallowClone
	     * @param [options.descriptors=false] {Boolean} If true, the full descriptors will be set. This takes more time, but avoids any info to be lost.
	     * @return {Object} shallow copy of the original
	     */
	    itsa_shallowClone: function itsa_shallowClone(descriptors) {
	        var instance = this,
	            m = Object.create(Object.getPrototypeOf(instance)),
	            keys = Object.getOwnPropertyNames(instance),
	            l = keys.length,
	            i = -1,
	            key,
	            propDescriptor;
	        while (++i < l) {
	            key = keys[i];
	            if (descriptors) {
	                propDescriptor = Object.getOwnPropertyDescriptor(instance, key);
	                if (!propDescriptor.writable) {
	                    m[key] = instance[key];
	                } else {
	                    Object.defineProperty(m, key, propDescriptor);
	                }
	            } else {
	                m[key] = instance[key];
	            }
	        }
	        return m;
	    },

	    /**
	     * Compares this object with the reference-object whether they have the same value.
	     * Not by reference, but their content as simple types.
	     *
	     * Compares both JSON.stringify objects
	     *
	     * @method itsa_sameValue
	     * @param refObj {Object} the object to compare with
	     * @return {Boolean} whether both objects have the same value
	     */
	    itsa_sameValue: function itsa_sameValue(refObj) {
	        var instance = this,
	            keys = Object.getOwnPropertyNames(instance),
	            l = keys.length,
	            i = -1,
	            same,
	            key;
	        same = l === refObj.itsa_size(true);
	        // loop through the members:
	        while (same && ++i < l) {
	            key = keys[i];
	            same = refObj.hasOwnProperty(key) ? valuesAreTheSame(instance[key], refObj[key]) : false;
	        }
	        return same;
	    },

	    /**
	     * Returns a deep copy of the object.
	     * Only handles members of primary types, Dates, Arrays and Objects.
	     * Will clone all the properties, also the non-enumerable.
	     *
	     * @method itsa_deepClone
	     * @param [descriptors=false] {Boolean} If true, the full descriptors will be set. This takes more time, but avoids any info to be lost.
	     * @param [proto] {Object} Another prototype for the new object.
	     * @return {Object} deep-copy of the original
	     */
	    itsa_deepClone: function itsa_deepClone(descriptors, proto) {
	        return deepCloneObj(this, null, descriptors, proto);
	    },

	    /**
	     * Transforms the object into an array with  'key/value' objects
	     *
	     * @example
	     * {country: 'USA', Continent: 'North America'} --> [{key: 'country', value: 'USA'}, {key: 'Continent', value: 'North America'}]
	     *
	     * @method itsa_toArray
	     * @param [options] {Object}
	     * @param [options.key] {String} to overrule the default `key`-property-name
	     * @param [options.value] {String} to overrule the default `value`-property-name
	     * @return {Array} the transformed Array-representation of the object
	     */
	    itsa_toArray: function itsa_toArray(options) {
	        var newArray = [],
	            keyIdentifier = options && options.key || "key",
	            valueIdentifier = options && options.value || "value";
	        this.itsa_each(function (value, key) {
	            var obj = {};
	            obj[keyIdentifier] = key;
	            obj[valueIdentifier] = value;
	            newArray[newArray.length] = obj;
	        });
	        return newArray;
	    },

	    /**
	     * Merges into this object the properties of the given object.
	     * If the second argument is true, the properties on the source object will be overwritten
	     * by those of the second object of the same name, otherwise, they are preserved.
	     *
	     * @method itsa_merge
	     * @param obj {Object} Object with the properties to be added to the original object
	     * @param [options] {Object}
	     * @param [options.force=false] {Boolean|'deep'}
	     *        true ==> the properties in `obj` will override those of the same name in the original object
	     *        false ==> the properties in `obj` will NOT be set if the name already exists in the original object
	     *        'deep' ==> the properties in `obj` will completely be deep-merged with the original object: both deep-proerties will endure. When
	     *                   both `obj` and the original object have the same `simple-type`-property, the `obj` its proerty will be used
	     * @param [options.full=false] {Boolean} If true, also any non-enumerable properties will be merged
	     * @param [options.replace=false] {Boolean} If true, only properties that already exist on the instance will be merged (forced replaced). No need to set force as well.
	     * @param [options.descriptors=false] {Boolean} If true, the full descriptors will be set. This takes more time, but avoids any info to be lost.
	     * @chainable
	     */
	    itsa_merge: function itsa_merge(obj, options) {
	        var instance = this,
	            i = -1,
	            deepForce,
	            keys,
	            l,
	            key,
	            force,
	            replace,
	            descriptors,
	            propDescriptor;
	        if (!Object.itsa_isObject(obj)) {
	            return instance;
	        }
	        options || (options = {});
	        keys = options.full ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
	        l = keys.length;
	        force = options.force;
	        deepForce = force === "deep";
	        replace = options.replace;
	        descriptors = options.descriptors;
	        // we cannot use obj.each --> obj might be an object defined through Object.create(null) and missing Object.prototype!
	        while (++i < l) {
	            key = keys[i];
	            if (force && !replace || !replace && !(key in instance) || replace && key in instance) {
	                if (deepForce && Object.itsa_isObject(instance[key]) && Object.itsa_isObject(obj[key])) {
	                    instance[key].itsa_merge(obj[key], options);
	                } else {
	                    if (descriptors) {
	                        propDescriptor = Object.getOwnPropertyDescriptor(obj, key);
	                        if (!propDescriptor.writable) {
	                            instance[key] = obj[key];
	                        } else {
	                            Object.defineProperty(instance, key, propDescriptor);
	                        }
	                    } else {
	                        instance[key] = obj[key];
	                    }
	                }
	            }
	        }
	        return instance;
	    },

	    /**
	     * Sets the properties of `obj` to the instance. This will redefine the object, while remaining the instance.
	     * This way, external references to the object-instance remain valid.
	     *
	     * @method itsa_defineData
	     * @param obj {Object} the Object that holds the new properties.
	     * @param [clone=false] {Boolean} whether the properties should be cloned
	     * @chainable
	     */
	    itsa_defineData: function itsa_defineData(obj, clone) {
	        var thisObj = this;
	        thisObj.itsa_emptyObject();
	        if (clone) {
	            deepCloneObj(obj, thisObj, true);
	        } else {
	            thisObj.itsa_merge(obj);
	        }
	        return thisObj;
	    },

	    /**
	     * Empties the Object by deleting all its own properties (also non-enumerable).
	     *
	     * @method itsa_emptyObject
	     * @chainable
	     */
	    itsa_emptyObject: function itsa_emptyObject() {
	        var thisObj = this,
	            props = Object.getOwnPropertyNames(thisObj),
	            len = props.length,
	            i;
	        for (i = 0; i < len; i++) {
	            delete thisObj[props[i]];
	        }
	        return thisObj;
	    }

	});

	/**
	* Returns true if the item is an object, but no Array, Function, RegExp, Date or Error object
	*
	* @method itsa_isObject
	* @static
	* @return {Boolean} true if the object is empty
	*/
	Object.itsa_isObject = function (item) {
	    // cautious: some browsers detect Promises as [object Object] --> we always need to check instance of :(
	    return !!(!TYPES[typeof item === "undefined" ? "undefined" : _typeof(item)] && !TYPES[{}.toString.call(item)] && item && (!Promise || !(item instanceof Promise)));
	};

	/**
	 * Returns a new object resulting of merging the properties of the given objects.
	 * The copying is shallow, complex properties will reference the very same object.
	 * Properties in later objects do **not overwrite** properties of the same name in earlier objects.
	 * If any of the objects is missing, it will be skiped.
	 *
	 * @example
	 *
	 *  var foo = function (config) {
	 *       config = Object.itsa_merge(config, defaultConfig);
	 *  }
	 *
	 * @method itsa_merge
	 * @static
	 * @param obj* {Object} Objects whose properties are to be merged
	 * @return {Object} new object with the properties merged in.
	 */
	Object.itsa_merge = function () {
	    var m = {};
	    Array.prototype.forEach.call(arguments, function (obj) {
	        if (obj) m.itsa_merge(obj);
	    });
	    return m;
	};

	/**
	 * Returns a new object with the prototype specified by `proto`.
	 *
	 *
	 * @method itsa_newProto
	 * @static
	 * @param obj {Object} source Object
	 * @param proto {Object} Object that should serve as prototype
	 * @param [clone=false] {Boolean} whether the sourceobject should be deep-cloned. When false, the properties will be merged.
	 * @return {Object} new object with the prototype specified.
	 */
	Object.itsa_newProto = function (obj, proto, clone) {
	    return clone ? obj.itsa_deepClone(true, proto) : Object.create(proto).itsa_merge(obj, { force: true });
	};

	/**
	 * Creates a protected property on the object.
	 *
	 * @method itsa_protectedProp
	 * @static
	 */
	Object.itsa_protectedProp = function (obj, property, value) {
	    Object.defineProperty(obj, property, {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: value
	    });
	};

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	/**
	 *
	 * Pollyfils for often used functionality for Strings
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module js-ext
	 * @submodule lib/string.js
	 * @class String
	 *
	 */

	"use strict";

	(function (StringPrototype) {
	    var SUBREGEX = /\{\s*([^|}]+?)\s*(?:\|([^}]*))?\s*\}/g,
	        DATEPATTERN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
	        WHITESPACE_CLASS = "[\\s\uFEFF\xA0]+",
	        TRIM_LEFT_REGEX = new RegExp("^" + WHITESPACE_CLASS),
	        TRIM_RIGHT_REGEX = new RegExp(WHITESPACE_CLASS + "$"),
	        TRIMREGEX = new RegExp(TRIM_LEFT_REGEX.source + "|" + TRIM_RIGHT_REGEX.source, "g"),
	        PATTERN_EMAIL = new RegExp("^[\\w!#$%&'*+/=?`{|}~^-]+(?:\\.[\\w!#$%&'*+/=?`{|}~^-]+)*@(?:[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\\.)+[a-zA-Z]{2,}$"),
	        PATTERN_URLEND = "([a-zA-Z0-9]+\\.)*(?:[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\\.)+[a-zA-Z]{2,}(/[\\w-]+)*$",
	        PATTERN_URLHTTP = new RegExp("^http://" + PATTERN_URLEND),
	        PATTERN_URLHTTPS = new RegExp("^https://" + PATTERN_URLEND),
	        PATTERN_URL = new RegExp("^(https?://)?" + PATTERN_URLEND),
	        PATTERN_INTEGER = /^(([-]?[1-9][0-9]*)|0)$/,
	        PATTERN_FLOAT_START = "^([-]?(([1-9][0-9]*)|0))?(\\",
	        PATTERN_FLOAT_END = "[0-9]+)?$",
	        PATTERN_FLOAT_COMMA = new RegExp(PATTERN_FLOAT_START + "," + PATTERN_FLOAT_END),
	        PATTERN_FLOAT_DOT = new RegExp(PATTERN_FLOAT_START + "." + PATTERN_FLOAT_END),
	        PATTERN_HEX_COLOR_ALPHA = /^#?[0-9A-F]{4}([0-9A-F]{4})?$/,
	        PATTERN_HEX_COLOR = /^#?[0-9A-F]{3}([0-9A-F]{3})?$/;

	    /**
	     * Checks whether the substring is part if this String.
	     * Alias for (String.indexOf(substring) > -1)
	     *
	     * @method itsa_contains
	     * @param substring {String} the substring to test for
	     * @param [caseInsensitive=false] {Boolean} whether to ignore case-sensivity
	     * @return {Boolean} whether the substring is found
	     */
	    StringPrototype.itsa_contains = function (substring, caseInsensitive) {
	        return caseInsensitive ? this.toLowerCase().indexOf(substring.toLowerCase()) > -1 : this.indexOf(substring) > -1;
	    };

	    /**
	     * Checks if the string ends with the value specified by `test`
	     *
	     * @method itsa_endsWith
	     * @param test {String} the string to test for
	     * @param [caseInsensitive=false] {Boolean} whether to ignore case-sensivity
	     * @return {Boolean} whether the string ends with `test`
	     */
	    // NOTE: ES6 native `endsWith` lacks the second argument
	    StringPrototype.itsa_endsWith = function (test, caseInsensitive) {
	        return new RegExp(test + "$", caseInsensitive ? "i" : "").test(this);
	    };

	    /**
	     * Checks if the string can be parsed into a number when using `parseInt()`
	     *
	     * @method itsa_isParsable
	     * @return {Boolean} whether the string is parsable
	     */
	    StringPrototype.itsa_isParsable = function () {
	        // strange enough, NaN doen't let compare itself, so we need a strange test:
	        // parseInt(value, 10)===parseInt(value, 10)
	        // which returns `true` for a parsable value, otherwise false
	        return parseInt(this) === parseInt(this);
	    };

	    /**
	     * Uppercases the first character
	     *
	     * @method itsa_sentence
	     * @return {String} The same string with its first character uppercased
	     */
	    StringPrototype.itsa_sentence = function () {
	        return this.length > 0 ? this[0].toUpperCase() + this.substr(1) : "";
	    };

	    /**
	     * Checks if the string starts with the value specified by `test`
	     *
	     * @method itsa_startsWith
	     * @param test {String} the string to test for
	     * @param [caseInsensitive=false] {Boolean} whether to ignore case-sensivity
	     * @return {Boolean} whether the string starts with `test`
	     */
	    // NOTE: ES6 native `startsWith` lacks the second argument
	    StringPrototype.itsa_startsWith = function (test, caseInsensitive) {
	        return new RegExp("^" + test, caseInsensitive ? "i" : "").test(this);
	    };

	    /**
	     * Performs `{placeholder}` substitution on a string. The object passed
	     * provides values to replace the `{placeholder}`s.
	     * `{placeholder}` token names must match property names of the object.
	     *
	     * `{placeholder}` tokens that are undefined on the object map will be removed.
	     *
	     * @example
	     * var greeting = '{message} {who}!';
	     * greeting.itsa_substitute({message: 'Hello'}); // results into 'Hello !'
	     *
	     * @method itsa_substitute
	     * @param obj {Object} Object containing replacement values.
	     * @param [retainUndefined=false] {Boolean} whether to keep placeholders that are undefined in `obj`
	     * @return {String} the substitute result.
	     */
	    StringPrototype.itsa_substitute = function (obj, retainUndefined) {
	        return this.itsa_replace(SUBREGEX, function (match, key) {
	            return obj[key] === undefined ? retainUndefined ? "{" + key + "}" : "" : obj[key];
	        });
	    };

	    /**
	     * Returns a ISO-8601 Date-object build by the String's value.
	     * If the String-value doesn't match ISO-8601, `null` will be returned.
	     *
	     * ISO-8601 Date's are generated by JSON.stringify(), so it's very handy to be able to reconvert them.
	     *
	     * @example
	     * var birthday = '2010-02-10T14:45:30.000Z';
	     * birthday.itsa_toDate(); // --> Wed Feb 10 2010 15:45:30 GMT+0100 (CET)
	     *
	     * @method itsa_toDate
	     * @return {Date|null} the Date represented by the String's value or null when invalid
	     */
	    StringPrototype.itsa_toDate = function () {
	        return DATEPATTERN.test(this) ? new Date(this) : null;
	    };

	    /**
	     * Generated the string without any white-spaces at the start or end.
	     *
	     * @method itsa_trim
	     * @return {String} new String without leading and trailing white-spaces
	     */
	    StringPrototype.itsa_trim = function () {
	        return this.itsa_replace(TRIMREGEX, "");
	    };

	    /**
	     * Generated the string without any white-spaces at the beginning.
	     *
	     * @method itsa_trimLeft
	     * @return {String} new String without leading white-spaces
	     */
	    StringPrototype.itsa_trimLeft = function () {
	        return this.itsa_replace(TRIM_LEFT_REGEX, "");
	    };

	    /**
	     * Generated the string without any white-spaces at the end.
	     *
	     * @method itsa_trimRight
	     * @return {String} new String without trailing white-spaces
	     */
	    StringPrototype.itsa_trimRight = function () {
	        return this.itsa_replace(TRIM_RIGHT_REGEX, "");
	    };

	    /**
	     * Replaces search-characters by a replacement. Replaces only the firts occurence.
	     * Does not alter the String itself, but returns a new String with the replacement.
	     *
	     * @method itsa_replace
	     * @param search {String} the character(s) to be replaced
	     * @param replacement {String} the replacement
	     * @param [caseInsensitive=false] {Boolean} whether to do search case-insensitive
	     * @return {String} new String with the replacement
	     */
	    StringPrototype.itsa_replace = function (search, replacement, caseInsensitive) {
	        return StringPrototype.replace.call(this, caseInsensitive ? new RegExp(search, "i") : search, replacement);
	    };

	    /**
	     * Replaces search-characters by a replacement. Replaces all occurences.
	     * Does not alter the String itself, but returns a new String with the replacements.
	     *
	     * @method itsa_replaceAll
	     * @param search {String} the character(s) to be replaced
	     * @param replacement {String} the replacement
	     * @param [caseInsensitive=false] {Boolean} whether to do search case-insensitive
	     * @return {String} new String with the replacements
	     */
	    StringPrototype.itsa_replaceAll = function (search, replacement, caseInsensitive) {
	        return StringPrototype.replace.call(this, new RegExp(search, "g" + (caseInsensitive ? "i" : "")), replacement);
	    };

	    /**
	     * Validates if the String's value represents a valid emailaddress.
	     *
	     * @method itsa_isValidEmail
	     * @return {Boolean} whether the String's value is a valid emailaddress.
	     */
	    StringPrototype.itsa_isValidEmail = function () {
	        return PATTERN_EMAIL.test(this);
	    };

	    /**
	     * Validates if the String's value represents a valid floated number.
	     *
	     * @method itsa_isValidFloat
	     * @param [comma] {Boolean} whether to use a comma as decimal separator instead of a dot
	     * @return {Boolean} whether the String's value is a valid floated number.
	     */
	    StringPrototype.itsa_isValidFloat = function (comma) {
	        return comma ? PATTERN_FLOAT_COMMA.test(this) : PATTERN_FLOAT_DOT.test(this);
	    };

	    /**
	     * Validates if the String's value represents a hexadecimal color.
	     *
	     * @method itsa_isValidHexaColor
	     * @param [alpha=false] {Boolean} whether to accept alpha transparancy
	     * @return {Boolean} whether the String's value is a valid hexadecimal color.
	     */
	    StringPrototype.itsa_isValidHexaColor = function (alpha) {
	        return alpha ? PATTERN_HEX_COLOR_ALPHA.test(this) : PATTERN_HEX_COLOR.test(this);
	    };

	    /**
	     * Validates if the String's value represents a valid integer number.
	     *
	     * @method itsa_isValidNumber
	     * @return {Boolean} whether the String's value is a valid integer number.
	     */
	    StringPrototype.itsa_isValidNumber = function () {
	        return PATTERN_INTEGER.test(this);
	    };

	    /**
	     * Validates if the String's value represents a valid boolean.
	     *
	     * @method itsa_isValidBoolean
	     * @return {Boolean} whether the String's value is a valid boolean.
	     */
	    StringPrototype.itsa_isValidBoolean = function () {
	        var length = this.length,
	            check;
	        if (length < 4 || length > 5) {
	            return false;
	        }
	        check = this.toUpperCase();
	        return check === "TRUE" || check === "FALSE";
	    };

	    /**
	     * Validates if the String's value represents a valid Date.
	     *
	     * @method itsa_isValidDate
	     * @return {Boolean} whether the String's value is a valid Date object.
	     */
	    StringPrototype.itsa_isValidDate = function () {
	        return DATEPATTERN.test(this);
	    };

	    /**
	     * Validates if the String's value represents a valid URL.
	     *
	     * @method itsa_isValidURL
	     * @param [options] {Object}
	     * @param [options.http] {Boolean} to force matching starting with `http://`
	     * @param [options.https] {Boolean} to force matching starting with `https://`
	     * @return {Boolean} whether the String's value is a valid URL.
	     */
	    StringPrototype.itsa_isValidURL = function (options) {
	        var instance = this;
	        options || (options = {});
	        if (options.http && options.https) {
	            return false;
	        }
	        return options.http ? PATTERN_URLHTTP.test(instance) : options.https ? PATTERN_URLHTTPS.test(instance) : PATTERN_URL.test(instance);
	    };
	})(String.prototype);

/***/ }),
/* 23 */
/***/ (function(module, exports) {

	/**
	 *
	 * Pollyfils for often used functionality for Functions
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module js-ext
	 * @submodule lib/function.js
	 * @class Function
	 *
	*/

	"use strict";

	(function (FunctionPrototype) {
		/**
	  * Sets the context of which the function will be execute. in the
	  * supplied object's context, optionally adding any additional
	  * supplied parameters to the end of the arguments the function
	  * is executed with.
	  *
	  * @method itsa_rbind
	  * @param [context] {Object} the execution context.
	  *        The value is ignored if the bound function is constructed using the new operator.
	  * @param [args*] {any} args* 0..n arguments to append to the end of
	  *        arguments collection supplied to the function.
	  * @return {function} the wrapped function.
	  */
		FunctionPrototype.itsa_rbind = function (context /*, args* */) {
			var thisFunction = this,
			    arrayArgs,
			    slice = Array.prototype.slice;
			context || (context = this);
			if (arguments.length > 1) {
				// removing `context` (first item) by slicing it out:
				arrayArgs = slice.call(arguments, 1);
			}

			return arrayArgs ? function () {
				// over here, `arguments` will be the "new" arguments when the final function is called!
				return thisFunction.apply(context, slice.call(arguments, 0).concat(arrayArgs));
			} : function () {
				// over here, `arguments` will be the "new" arguments when the final function is called!
				return thisFunction.apply(context, arguments);
			};
		};
	})(Function.prototype);

/***/ }),
/* 24 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Adding easy to use cookie-methods to the document-object
	 *
	 *
	 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module itsa-dom
	 * @class document
	 * @since 0.0.1
	*/

	var TMP_COOKIE_NAME = "itsa_tmp_cookie_check";

	module.exports = function (WINDOW) {

	    var DOCUMENT = WINDOW.document,
	        COOKIE_SUPPORT = false;

	    if (DOCUMENT) {
	        /**
	         * Gets all cookie-keys
	         *
	         * @method itsa_cookieKeys
	         * @param cssSelector {String} css-selector to match
	         * @return {Array} All the cookie-keys
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_cookieKeys = function () {
	            var aKeys = DOCUMENT.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/),
	                nLen = aKeys.length,
	                nIdx;
	            for (nIdx = 0; nIdx < nLen; nIdx++) {
	                aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
	            }
	            return aKeys;
	        };

	        /**
	         * Tells whether the browser has cookies enabled
	         *
	         * @method itsa_cookieSupport
	         * @return {Boolean} Whether the browser has cookies enabled
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_cookieSupport = function () {
	            return COOKIE_SUPPORT;
	        };

	        /**
	         * Gets a cookie from the document
	         *
	         * @method itsa_getCookie
	         * @param name {String} cookie-name
	         * @return {String} The cookie-value
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_getCookie = function (name) {
	            return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	        };

	        /**
	         * Check if a cookie exists
	         *
	         * @method itsa_hasCookie
	         * @param name {String} The name of the cookie to test
	         * @return {Boolean} Whether the cookie exists
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_hasCookie = function (name) {
	            if (!name) {
	                return false;
	            }
	            return new RegExp("(?:^|;\\s*)" + encodeURIComponent(name).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=").test(DOCUMENT.cookie);
	        };

	        /**
	         * Removes a cookie from the document.
	         *
	         * @method itsa_removeCookie
	         * @param name {String} The name of the cookie to remove
	         * @param [path] {String} E.g., "/", "/mydir"; if not specified, defaults to the current path of the current document location (string or null).
	         *                        The path must be absolute (see RFC 2965).
	         * @param [domain] {String} E.g., "example.com",  or "subdomain.example.com"; if not specified, defaults to the host portion of the current document location (string or null),
	         *                          but not including subdomains. Contrary to earlier specifications, leading dots in domain names are ignored. If a domain is specified,
	         *                          subdomains are always included.
	         * @return {Boolean} If removal was succesfull (returns `false` when coockie does not exist)
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_removeCookie = function (name, path, domain) {
	            if (!DOCUMENT.itsa_hasCookie(name)) {
	                return false;
	            }
	            DOCUMENT.cookie = encodeURIComponent(name) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "");
	            return true;
	        };

	        /**
	         * Sets a cookie to the document.
	         *
	         * @method itsa_setCookie
	         * @param name {String} The name of the cookie to create/overwrite
	         * @param value {String} The value of the cookie
	         * @param [end] {Number|String|Date} The max-age in seconds (e.g. 31536e3 for a year, Infinity for a never-expires cookie),
	         *                                   or the expires date in GMTString format or as Date object; if not, the specified
	         *                                   the cookie will expire at the end of the session (number – finite or Infinity – string, Date object or null).
	         * @param [path] {String} The path from where the cookie will be readable. E.g., "/", "/mydir"; if not specified, defaults to the current path
	         *                        of the current document location (string or null). The path must be absolute (see RFC 2965). For more information on
	         *                        how to use relative paths in this argument, see this paragraph.
	         * @param [domain] {String} The domain from where the cookie will be readable. E.g., "example.com", ".example.com" (includes all subdomains) or
	         *                          "subdomain.example.com"; if not specified, defaults to the host portion of the current document location (string or null).
	         * @param [secure] {Boolean} The cookie will be transmitted only over secure protocol as https (boolean or null).
	         * @return {Boolean} Whether the cookie was created succesfully
	         * @since 0.0.1
	         */
	        DOCUMENT.itsa_setCookie = function (name, value, end, path, domain, secure) {
	            var sExpires = "";
	            if (/^(?:expires|max\-age|path|domain|secure)$/i.test(name)) {
	                return false;
	            }
	            if (typeof end === "number") {
	                sExpires = end === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + end;
	            } else if (typeof end === "string") {
	                sExpires = "; expires=" + end;
	            } else if (end && {}.toString.call(end) === "[object Date]") {
	                sExpires = "; expires=" + end.toUTCString();
	            }
	            DOCUMENT.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + sExpires + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (secure ? "; secure" : "");
	            return true;
	        };

	        // now try to set a cookie and check if it is indeed set and bind it to COOKIE_SUPPORT:
	        DOCUMENT.itsa_setCookie(TMP_COOKIE_NAME, "true");
	        (COOKIE_SUPPORT = DOCUMENT.itsa_getCookie(TMP_COOKIE_NAME) === "true") && DOCUMENT.itsa_removeCookie(TMP_COOKIE_NAME);
	    }
	};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

	"use strict";

	/**
	 * Adding sugar utilities to local storage
	 *
	 *
	 * <i>Copyright (c) 2016 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module itsa-dom
	 * @class document
	 * @since 1.0.0
	*/

	var DATEPATTERN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
	    // datepattern will return date-type
	REVIVER = function REVIVER(key, value) {
	    return DATEPATTERN.test(value) ? new Date(value) : value;
	};

	module.exports = function (WINDOW) {

	    var DOCUMENT = WINDOW.document;

	    if (DOCUMENT) {
	        /**
	         *
	         *
	         * @method itsa_localStorage_getItem
	         * @param key {String}
	         * @param parseDate {boolean}
	         * @since 1.0.0
	         */
	        DOCUMENT.itsa_localStorage_getItem = function (key, parseDate) {
	            var value = localStorage.getItem(key),
	                obj;
	            if (value) {
	                try {
	                    obj = JSON.parse(value, parseDate ? REVIVER : null);
	                } catch (err) {
	                    // error in item: remove it from store
	                    obj = {};
	                }
	            }
	            return obj;
	        };

	        /**
	         *
	         *
	         * @method itsa_localStorage_setItem
	         * @param key {String}
	         * @param value {Any}
	         * @since 1.0.0
	         */
	        DOCUMENT.itsa_localStorage_setItem = function (key, value) {
	            try {
	                value = JSON.stringify(value);
	                localStorage.setItem(key, value);
	            } catch (err) {
	                // error storing
	                return false;
	            }
	            return true;
	        };

	        /**
	         *
	         *
	         * @method itsa_localStorage_removeItem
	         * @param key {String}
	         * @since 1.0.0
	         */
	        DOCUMENT.itsa_localStorage_removeItem = function (key) {
	            try {
	                localStorage.removeItem(key);
	            } catch (err) {
	                // error removing
	                return false;
	            }
	            return true;
	        };
	    }
	};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	__webpack_require__(23);
	__webpack_require__(21);
	__webpack_require__(22);
	__webpack_require__(27);
	__webpack_require__(28);
	__webpack_require__(29);
	__webpack_require__(30);

/***/ }),
/* 27 */
/***/ (function(module, exports) {

	/**
	 *
	 * Pollyfils for often used functionality for Arrays
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module js-ext
	 * @submodule lib/array.js
	 * @class Array
	 *
	 */

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var TYPES = {
	    "undefined": true,
	    "number": true,
	    "boolean": true,
	    "string": true,
	    "[object Function]": true,
	    "[object RegExp]": true,
	    "[object Array]": true,
	    "[object Date]": true,
	    "[object Error]": true,
	    "[object Promise]": true
	},
	    FUNCTION = "function",
	    isObject,
	    objSameValue,
	    _cloneObj,
	    deepCloneObj,
	    valuesAreTheSame;

	isObject = function isObject(item) {
	    return !!(!TYPES[typeof item === "undefined" ? "undefined" : _typeof(item)] && !TYPES[{}.toString.call(item)] && item);
	};

	objSameValue = function objSameValue(obj1, obj2) {
	    var keys = Object.getOwnPropertyNames(obj1),
	        keysObj2 = Object.getOwnPropertyNames(obj2),
	        l = keys.length,
	        i = -1,
	        same,
	        key;
	    same = l === keysObj2.length;
	    // loop through the members:
	    while (same && ++i < l) {
	        key = keys[i];
	        same = obj2.hasOwnProperty(key) ? valuesAreTheSame(obj1[key], obj2[key]) : false;
	    }
	    return same;
	};

	deepCloneObj = function deepCloneObj(obj, descriptors) {
	    var m = Object.create(Object.getPrototypeOf(obj)),
	        keys = Object.getOwnPropertyNames(obj),
	        l = keys.length,
	        i = -1,
	        key,
	        value,
	        propDescriptor;
	    // loop through the members:
	    while (++i < l) {
	        key = keys[i];
	        value = obj[key];
	        if (descriptors) {
	            propDescriptor = Object.getOwnPropertyDescriptor(obj, key);
	            if (propDescriptor.writable) {
	                Object.defineProperty(m, key, propDescriptor);
	            }
	            if ((isObject(value) || Array.isArray(value)) && _typeof(propDescriptor.get) !== FUNCTION && _typeof(propDescriptor.set) !== FUNCTION) {
	                m[key] = _cloneObj(value, descriptors);
	            } else {
	                m[key] = value;
	            }
	        } else {
	            m[key] = isObject(value) || Array.isArray(value) ? _cloneObj(value, descriptors) : value;
	        }
	    }
	    return m;
	};

	_cloneObj = function cloneObj(obj, descriptors, target) {
	    var copy, i, len, value;

	    // Handle Array
	    if (Array.isArray(obj)) {
	        copy = target || [];
	        len = obj.length;
	        for (i = 0; i < len; i++) {
	            value = obj[i];
	            copy[i] = isObject(value) || Array.isArray(value) ? _cloneObj(value, descriptors) : value;
	        }
	        return copy;
	    }

	    // Handle Date
	    if (obj instanceof Date) {
	        copy = new Date();
	        copy.setTime(obj.getTime());
	        return copy;
	    }

	    // Handle Object
	    if (isObject(obj)) {
	        return deepCloneObj(obj, descriptors);
	    }

	    return obj;
	};

	valuesAreTheSame = function valuesAreTheSame(value1, value2) {
	    var same;
	    // complex values need to be inspected differently:
	    if (isObject(value1)) {
	        same = isObject(value2) ? objSameValue(value1, value2) : false;
	    } else if (Array.isArray(value1)) {
	        same = Array.isArray(value2) ? value1.itsa_sameValue(value2) : false;
	    } else if (value1 instanceof Date) {
	        same = value2 instanceof Date ? value1.getTime() === value2.getTime() : false;
	    } else {
	        same = value1 === value2;
	    }
	    return same;
	};

	(function (ArrayPrototype) {

	    /**
	     * Checks whether an item is inside the Array.
	     * Alias for (array.indexOf(item) > -1)
	     *
	     * @method itsa_contains
	     * @param item {Any} the item to seek
	     * @return {Boolean} whether the item is part of the Array
	     */
	    ArrayPrototype.itsa_contains = function (item) {
	        return this.indexOf(item) > -1;
	    };

	    /**
	     * Removes an item from the array
	     *
	     * @method itsa_remove
	     * @param item {any|Array} the item (or an hash of items) to be removed
	     * @param [arrayItem=false] {Boolean} whether `item` is an arrayItem that should be treated as a single item to be removed
	     *        You need to set `arrayItem=true` in those cases. Otherwise, all single items from `item` are removed separately.
	     * @chainable
	     */
	    ArrayPrototype.itsa_remove = function (item, arrayItem) {
	        var instance = this,
	            removeItem = function removeItem(oneItem) {
	            var index = instance.indexOf(oneItem);
	            index > -1 && instance.splice(index, 1);
	        };
	        if (!arrayItem && Array.isArray(item)) {
	            item.forEach(removeItem);
	        } else {
	            removeItem(item);
	        }
	        return instance;
	    };

	    /**
	     * Replaces an item in the array. If the previous item is not part of the array, the new item is appended.
	     *
	     * @method itsa_replace
	     * @param prevItem {any} the item to be replaced
	     * @param newItem {any} the item to be added
	     * @chainable
	     */
	    ArrayPrototype.itsa_replace = function (prevItem, newItem) {
	        var instance = this,
	            index = instance.indexOf(prevItem);
	        index !== -1 ? instance.splice(index, 1, newItem) : instance.push(newItem);
	        return instance;
	    };

	    /**
	     * Inserts an item in the array at the specified position. If index is larger than array.length, the new item(s) will be appended.
	     * If the item already exists, it will be moved to its new position, unless `duplicate` is set true
	     *
	     * @method itsa_insertAt
	     * @param item {any|Array} the item to be replaced, may be an Array of items
	     * @param index {Number} the position where to add the item(s). When larger than Array.length, the item(s) will be appended.
	     * @param [duplicate=false] {boolean} if an item should be duplicated when already in the array
	     * @chainable
	     */
	    ArrayPrototype.itsa_insertAt = function (item, index, duplicate) {
	        var instance = this,
	            prevIndex;
	        if (!duplicate) {
	            prevIndex = instance.indexOf(item);
	            if (prevIndex === index) {
	                return instance;
	            }
	            prevIndex > -1 && instance.splice(prevIndex, 1);
	        }
	        instance.splice(index, 0, item);
	        return instance;
	    };

	    /**
	     * Shuffles the items in the Array randomly
	     *
	     * @method itsa_shuffle
	     * @chainable
	     */
	    ArrayPrototype.itsa_shuffle = function () {
	        var instance = this,
	            counter = instance.length,
	            temp,
	            index;
	        // While there are elements in the instance
	        while (counter > 0) {
	            // Pick a random index
	            index = Math.floor(Math.random() * counter);

	            // Decrease counter by 1
	            counter--;

	            // And swap the last element with it
	            temp = instance[counter];
	            instance[counter] = instance[index];
	            instance[index] = temp;
	        }
	        return instance;
	    };

	    /**
	     * Returns a deep copy of the Array.
	     * Only handles members of primary types, Dates, Arrays and Objects.
	     *
	     * @method itsa_deepClone
	     * @param [descriptors=false] {Boolean} whether to use the descriptors when cloning
	     * @return {Array} deep-copy of the original
	     */
	    ArrayPrototype.itsa_deepClone = function (descriptors) {
	        return _cloneObj(this, descriptors);
	    };

	    /**
	     * Compares this object with the reference-object whether they have the same value.
	     * Not by reference, but their content as simple types.
	     *
	     * Compares both JSON.stringify objects
	     *
	     * @method itsa_sameValue
	     * @param refObj {Object} the object to compare with
	     * @return {Boolean} whether both objects have the same value
	     */
	    ArrayPrototype.itsa_sameValue = function (refArray) {
	        var instance = this,
	            len = instance.length,
	            i = -1,
	            same;
	        same = len === refArray.length;
	        // loop through the members:
	        while (same && ++i < len) {
	            same = valuesAreTheSame(instance[i], refArray[i]);
	        }
	        return same;
	    };

	    /**
	     * Sets the items of `array` to the instance. This will refill the array, while remaining the instance.
	     * This way, external references to the array-instance remain valid.
	     *
	     * @method itsa_defineData
	     * @param array {Array} the Array that holds the new items.
	     * @param [clone=false] {Boolean} whether the items should be cloned
	     * @chainable
	     */
	    ArrayPrototype.itsa_defineData = function (array, clone) {
	        var thisArray = this,
	            len,
	            i;
	        thisArray.itsa_makeEmpty();
	        if (clone) {
	            _cloneObj(array, true, thisArray);
	        } else {
	            len = array.length;
	            for (i = 0; i < len; i++) {
	                thisArray[i] = array[i];
	            }
	        }
	        return thisArray;
	    },

	    /**
	     * Concats `array` into this array (appended by default).
	     *
	     * @method itsa_concat
	     * @param array {Array} the Array to be merged
	     * @param [prepend=false] {Boolean} whether the items prepended
	     * @param [clone=false] {Boolean} whether the items should be cloned
	     * @param [descriptors=false] {Boolean} whether to use the descriptors when cloning
	     * @chainable
	     */
	    ArrayPrototype.itsa_concat = function (array, prepend, clone, descriptors) {
	        var instance = this,
	            mergeArray = clone ? array.itsa_deepClone(descriptors) : array;
	        if (prepend) {
	            mergeArray.reduceRight(function (coll, item) {
	                coll.unshift(item);
	                return coll;
	            }, instance);
	        } else {
	            mergeArray.reduce(function (coll, item) {
	                coll[coll.length] = item;
	                return coll;
	            }, instance);
	        }
	        return instance;
	    };

	    /**
	     * Empties the Array by setting its length to zero.
	     *
	     * @method itsa_makeEmpty
	     * @chainable
	     */
	    ArrayPrototype.itsa_makeEmpty = function () {
	        this.length = 0;
	        return this;
	    };
	})(Array.prototype);

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 *
	 * Pollyfils for often used functionality for Arrays
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module js-ext
	 * @submodule lib/json.js
	 * @class JSON
	 *
	 */

	"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	__webpack_require__(21);
	__webpack_require__(27);
	__webpack_require__(22);

	var STRING = "string";

	var REVIVER = function REVIVER(key, value) {
	    return typeof value === "string" && value.itsa_toDate() || value;
	},
	    px = /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/,
	    _objectStringToDates,
	    _arrayStringToDates,
	    decycle,
	    retrocycle;

	_objectStringToDates = function objectStringToDates(obj) {
	    var date;
	    obj.itsa_each(function (value, key) {
	        if ((typeof value === "undefined" ? "undefined" : _typeof(value)) === STRING) {
	            (date = value.itsa_toDate()) && (obj[key] = date);
	        } else if (Object.itsa_isObject(value)) {
	            _objectStringToDates(value);
	        } else if (Array.isArray(value)) {
	            _arrayStringToDates(value);
	        }
	    });
	};

	_arrayStringToDates = function arrayStringToDates(array) {
	    var i, len, arrayItem, date;
	    len = array.length;
	    for (i = 0; i < len; i++) {
	        arrayItem = array[i];
	        if ((typeof arrayItem === "undefined" ? "undefined" : _typeof(arrayItem)) === STRING) {
	            (date = arrayItem.itsa_toDate()) && (array[i] = date);
	        } else if (Object.itsa_isObject(arrayItem)) {
	            _objectStringToDates(arrayItem);
	        } else if (Array.isArray(arrayItem)) {
	            _arrayStringToDates(arrayItem);
	        }
	    }
	};

	decycle = function decycle(object, replacer) {
	    var objects = []; // Keep a reference to each unique object or array
	    var paths = []; // Keep the path to each unique object or array

	    return function derez(value, path) {
	        // The derez function recurses through the object, producing the deep copy.
	        var i, nu, isArray;

	        // If a replacer function was provided, then call it to get a replacement value.
	        if (replacer !== undefined) {
	            value = replacer(value);
	        }
	        isArray = Array.isArray(value);
	        if (isArray || Object.itsa_isObject(value)) {
	            // If the value is an object or array, look to see if we have already
	            // encountered it. If so, return a {"$ref":PATH} object. This is a hard
	            // linear search that will get slower as the number of unique objects grows.
	            // Someday, this should be replaced with an ES6 WeakMap.
	            i = objects.indexOf(value);
	            if (i >= 0) {
	                return { $ref: paths[i] };
	            }
	            // Otherwise, accumulate the unique value and its path.
	            objects.push(value);
	            paths.push(path);
	            // If it is an array, replicate the array.
	            if (isArray) {
	                nu = [];
	                value.forEach(function (element, i) {
	                    nu[i] = derez(element, path + "[" + i + "]");
	                });
	            } else {
	                // If it is an object, replicate the object.
	                nu = {};
	                value.itsa_each(function (val, key) {
	                    nu[key] = derez(val, path + "[" + JSON.stringify(key) + "]");
	                });
	            }
	            return nu;
	        }
	        return value;
	    }(object, "$");
	};

	retrocycle = function retrocycle($) {
	    (function rez(value) {
	        // The rez function walks recursively through the object looking for $ref
	        // properties. When it finds one that has a value that is a path, then it
	        // replaces the $ref object with a reference to the value that is found by
	        // the path.
	        if (value && (typeof value === "undefined" ? "undefined" : _typeof(value)) === "object") {
	            if (Array.isArray(value)) {
	                value.forEach(function (element, i) {
	                    var path;
	                    if ((typeof element === "undefined" ? "undefined" : _typeof(element)) === "object" && element !== null) {
	                        path = element.$ref;
	                        if (typeof path === "string" && px.test(path)) {
	                            value[i] = eval(path);
	                        } else {
	                            rez(element);
	                        }
	                    }
	                });
	            } else {
	                value.itsa_each(function (val, key) {
	                    var path;
	                    if ((typeof val === "undefined" ? "undefined" : _typeof(val)) === "object" && val !== null) {
	                        path = val.$ref;
	                        if (typeof path === "string" && px.test(path)) {
	                            value[key] = eval(path);
	                        } else {
	                            rez(val);
	                        }
	                    }
	                });
	            }
	        }
	    })($);
	    return $;
	};

	/**
	 * Parses a stringified object and creates true `Date` properties.
	 *
	 * @method itsa_parseWithDate
	 * @param stringifiedObj {Number} lower-edgde
	 * @return {Number|undefined} the value, forced to be inbetween the edges. Returns `undefined` if `max` is lower than `min`.
	 */
	JSON.itsa_parseWithDate = function (stringifiedObj) {
	    return this.parse(stringifiedObj, REVIVER);
	};

	/**
	* Transforms `String`-properties into true Date-objects in case they match the Date-syntax.
	* To be used whenever you have parsed a JSON.stringified object without a Date-reviver.
	*
	* @method itsa_stringToDates
	* @param item {Object|Array} the JSON-parsed object which the date-string fields should be transformed into Dates.
	* @param clone {Boolean=false} whether to clone `item` and leave it unspoiled. Cloning means a performancehit,
	* better leave it `false`, which will lead into changing `item` which in fact will equal the returnvalue.
	* @static
	* @return {Object|Array} the transformed item
	*/
	JSON.itsa_stringToDates = function (item, clone) {
	    var newItem = clone ? item.itsa_deepClone() : item;
	    if (Object.itsa_isObject(newItem)) {
	        _objectStringToDates(newItem);
	    } else if (Array.isArray(newItem)) {
	        _arrayStringToDates(newItem);
	    }
	    return newItem;
	};

	/**
	* Inspired by https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
	*
	* JSON-stringifies an object BUT can handle circular-references.
	* This is done by replacing duplicate references with an object of the form:
	*
	* {"$ref": PATH}
	*
	* where the PATH is a JSONPath string that locates the first occurance.
	*
	* @example
	*     var a = [];
	*     a[0] = a;
	*     JSON.itsa_stringifyNoCycle(a);

	* produces the string: '[{"$ref":"$"}]'
	*
	* @method itsa_stringifyNoCycle
	* @param value {Any} The value to convert to a JSON string.
	* @param [replacer] {Function} A function that alters the behavior of the stringification process,
	*                              or an array of String and Number objects that serve as a whitelist for selecting the properties
	*                              of the value object to be included in the JSON string. If this value is null or not provided,
	*                              all properties of the object are included in the resulting JSON string.
	* @param [space] {String|Number} Is used to insert white space into the output JSON string for readability purposes.
	*                                If this is a Number, it indicates the number of space characters to use as white space;
	*                                this number is capped at 10 if it's larger than that. Values less than 1 indicate that no space should be used.
	*                                If this is a String, the string (or the first 10 characters of the string, if it's longer than that) is used
	*                                as white space. If this parameter is not provided (or is null), no white space is used* @static
	* @return {String} the stringified object
	*/
	JSON.itsa_stringifyNoCycle = function (value, replacer, space) {
	    return JSON.stringify(decycle(value, replacer), null, space);
	};

	/**
	* Inspired by https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
	*
	* Restore an object that was reduced by `JSON.itsa_stringifyNoCycle`. Members whose values are
	* objects of the form
	*      {$ref: PATH}
	* are replaced with references to the value found by the PATH. This will restore cycles. The object will be mutated.
	*
	* @example
	*     var s = '[{"$ref":"$"}]';
	*     itsa_parseNoCycle(s);
	*
	* @method itsa_parseNoCycle
	* @param value {Any} The string to parse as JSON. See the JSON object for a description of JSON syntax.
	* @param [reviver] {Function} If a function, prescribes how the value originally produced by parsing is transformed, before being returned.
	* @return {Object} the reverted object
	*/
	JSON.itsa_parseNoCycle = function (stringifiedObj, replacer) {
	    return retrocycle(JSON.parse(stringifiedObj, replacer));
	};

	/**
	* Inspired by https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
	*
	* Restore an object that was reduced by `JSON.itsa_stringifyNoCycle`.
	* Parses a stringified object and creates true `Date` properties.
	*
	* Members whose values are objects of the form
	*      {$ref: PATH}
	* are replaced with references to the value found by the PATH. This will restore cycles. The object will be mutated.
	*
	* @example
	*     var s = '[{"$ref":"$"}]';
	*     itsa_parseNoCycle(s);
	*
	* @method itsa_parseNoCycleWithDate
	* @param value {Any} The string to parse as JSON. See the JSON object for a description of JSON syntax.
	* @return {Object} the reverted object
	*/
	JSON.itsa_parseNoCycleWithDate = function (stringifiedObj) {
	    return retrocycle(JSON.itsa_parseWithDate(stringifiedObj));
	};

/***/ }),
/* 29 */
/***/ (function(module, exports) {

	/* global Promise:true */

	"use strict";

	/**
	 * Provides additional Promise-methods. These are extra methods which are not part of the PromiseA+ specification,
	 * But are all Promise/A+ compatable.
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module js-ext
	 * @submodule lib/promise.s
	 * @class Promise
	*/

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var FUNCTION_EXPECTED = " expects an array of function-references",
	    // include leading space
	FUNCTION = "function",
	    PROMISE_CHAIN = "Promise.chain";

	if (Promise) {
	    (function (PromisePrototype) {
	        /**
	         * Promise which can be put at the very end of a chain, even after .catch().
	         * Will invoke the callback function regardless whether the chain resolves or rejects.
	         *
	         * The argument of the callback will be either its fulfilled or rejected argument, but
	         * it is wisely not to handle it. The results should have been handled in an earlier step
	         * of the chain: .itsa_finally() basicly means you want to execute code after the chain, regardless
	         * whether it's resolved or rejected.
	         *
	         * **Note:** .itsa_finally() <u>does not return a Promise</u>: it should be used as the very last step of a Promisechain.
	         * If you need an intermediate method, you should take .itsa_fulfillThen().
	         *
	         * @method itsa_finally
	         * @param finallyback {Function} the callback-function to be invoked.
	         * @return {Promise}
	         */
	        PromisePrototype.itsa_finally = function (finallyback) {
	            return this.then(finallyback, finallyback);
	        };

	        /**
	         * Will always return a fulfilled Promise.
	         *
	         * Typical usage will be by making it part of a Promisechain: it makes the chain go
	         * into its fulfilled phase.
	         *
	         * @example
	         *
	         * promise1
	         * .then(promise2)
	         * .itsa_fulfillThen()
	         * .then(handleFulfilled, handleRejected) // handleFulfilled always gets invoked
	         * @method itsa_fulfillThen
	         * @param [response] {Object} parameter to pass through which overrules the original Promise-response.
	         * @return {Promise} Resolved Promise. `response` will be passed trough as parameter when set.
	         *         When not set: in case the original Promise resolved, its parameter is passed through.
	         *         in case of a rejection, no parameter will be passed through.
	         */
	        PromisePrototype.itsa_fulfillThen = function (callback) {
	            return this.then(function (r) {
	                return r;
	            }, function (r) {
	                return r;
	            }).then(callback);
	        };
	    })(Promise.prototype);

	    /**
	     * Returns a Promise that always fulfills. It is fulfilled when ALL items are resolved (either fulfilled
	     * or rejected). This is useful for waiting for the resolution of multiple
	     * promises, such as reading multiple files in Node.js or making multiple XHR
	     * requests in the browser. Because -on the contrary of `Promise.all`- **finishAll** waits until
	     * all single Promises are resolved, you can handle all promises, even if some gets rejected.
	     *
	     * @method itsa_finishAll
	     * @param items {Any[]} an array of any kind of items, promises or not. If a value is not a promise,
	     * its transformed into a resolved promise.
	     * @return {Promise} A promise for an array of all the fulfillment items:
	     * <ul>
	     *     <li>Fulfilled: o {Object}
	     *         <ul>
	     *             <li>fulfilled {Array} all fulfilled responses, any item that was rejected will have a value of `undefined`</li>
	     *             <li>rejected {Array} all rejected responses, any item that was fulfilled will have a value of `undefined`</li>
	     *         </ul>
	     *     </li>
	     *     <li>Rejected: this promise **never** rejects</li>
	     * </ul>
	     * @static
	     */
	    Promise.itsa_finishAll = function (items) {
	        return new Promise(function (fulfill) {
	            // Array.isArray assumes ES5
	            Array.isArray(items) || (items = [items]);

	            var remaining = items.length,
	                length = items.length,
	                fulfilledresults = [],
	                rejectedresults = [],
	                i;

	            function oneDone(index, fulfilled) {
	                return function (value) {
	                    fulfilled ? fulfilledresults[index] = value : rejectedresults[index] = value;
	                    remaining--;
	                    if (!remaining) {
	                        fulfill({
	                            fulfilled: fulfilledresults,
	                            rejected: rejectedresults
	                        });
	                    }
	                };
	            }

	            if (length < 1) {
	                return fulfill({
	                    fulfilled: fulfilledresults,
	                    rejected: rejectedresults
	                });
	            }

	            fulfilledresults.length = length;
	            rejectedresults.length = length;
	            for (i = 0; i < length; i++) {
	                Promise.resolve(items[i]).then(oneDone(i, true), oneDone(i, false));
	            }
	        });
	    };

	    /**
	     * Returns a Promise which chains the function-calls. Like an automated Promise-chain.
	     * Invokes the functionreferences in a chain. You MUST supply function-references, it doesn't
	     * matter wheter these functions return a Promise or not. Any returnvalues are passed through to
	     * the next function.
	     *
	     * **Cautious:** you need to pass function-references, not invoke them!
	     * chainFns will invoke them when the time is ready. Regarding to this, there is a difference with
	     * using Promise.all() where you should pass invoked Promises.
	     *
	     * If one of the functions returns a Promise, the chain
	     * will wait its execution for this function to be resolved.
	     *
	     * If you need specific context or arguments: use Function.bind for these items.
	     * If one of the items returns a rejected Promise, by default: the whole chain rejects
	     * and following functions in the chain will not be invoked. When `finishAll` is set `true`
	     * the chain will always continue even with rejected Promises.
	     *
	     * Returning functionvalues are passed through the chain adding them as an extra argument
	     * to the next function in the chain (argument is added on the right)
	     *
	     * @example
	     *     var a = [], p1, p2, p3;
	     *     p1 = function(a) {
	     *         return new Promise(function(resolve, reject) {
	     *             I.later(function() {
	     *                 console.log('resolving promise p1: '+a);
	     *                 resolve(a);
	     *             }, 1000);
	     *         });
	     *     };
	     *     p2 = function(b, r) {
	     *         var value = b+r;
	     *         console.log('returning p2: '+value);
	     *         return value;
	     *     };
	     *     p3 = function(c, r) {
	     *         return new Promise(function(resolve, reject) {
	     *             I.later(function() {
	     *                 var value = b+r;
	     *                 console.log('resolving promise p3: '+value);
	     *                 resolve(value);
	     *             }, 1000);
	     *         });
	     *     };
	     *     a.push(p1.bind(undefined, 100));
	     *     a.push(p2.bind(undefined, 200));
	     *     a.push(p3.bind(undefined, 300));
	     *     Promise.itsa_chainFns(a).then(
	     *         function(r) {
	     *             console.log('chain resolved with '+r);
	     *         },
	     *         function(err) {
	     *             console.log('chain-error '+err);
	     *         }
	     *     );
	     *
	     * @method itsa_chainFns
	     * @param funcs {function[]} an array of function-references
	     * @param [finishAll=false] {boolean} to force the chain to continue, even if one of the functions
	     *        returns a rejected Promise
	     * @return {Promise}
	     * on success:
	        * o {Object} returnvalue of the laste item in the Promisechain
	     * on failure an Error object
	        * reason {Error}
	     * @static
	     */
	    Promise.itsa_chainFns = function (funcs, finishAll) {
	        var handleFn,
	            length,
	            _handlePromiseChain,
	            promiseErr,
	            i = 0;
	        // Array.isArray assumes ES5
	        Array.isArray(funcs) || (funcs = [funcs]);
	        length = funcs.length;
	        handleFn = function handleFn() {
	            var nextFn = funcs[i],
	                promise;
	            if ((typeof nextFn === "undefined" ? "undefined" : _typeof(nextFn)) !== FUNCTION) {
	                return Promise.reject(new TypeError(PROMISE_CHAIN + FUNCTION_EXPECTED));
	            }
	            promise = Promise.resolve(nextFn.apply(null, arguments));
	            // by using "promise.catch(function(){})" we return a resolved Promise
	            return finishAll ? promise.catch(function (err) {
	                promiseErr = err;
	                return err;
	            }) : promise;
	        };
	        _handlePromiseChain = function handlePromiseChain() {
	            // will loop until rejected, which is at destruction of the class
	            return handleFn.apply(null, arguments).then(++i < length ? _handlePromiseChain : undefined);
	        };
	        return _handlePromiseChain().then(function (response) {
	            // if (promiseErr) {
	            //     throw new Error(promiseErr);
	            // }
	            return promiseErr || response;
	        });
	    };

	    /**
	     * Returns a Promise with 5 additional methods:
	     *
	     * promise.fulfill
	     * promise.reject
	     * promise.callback
	     * promise.setCallback
	     * promise.pending
	     * promise.stayActive --> force the promise not to resolve in the specified time
	     *
	     * With Promise.manage, you get a Promise which is managable from outside, not inside as Promise A+ work.
	     * You can invoke promise.**callback**() which will invoke the original passed-in callbackFn - if any.
	     * promise.**fulfill**() and promise.**reject**() are meant to resolve the promise from outside, just like deferred can do.
	     *
	     * If `stayActive` is defined, the promise will only be resolved after this specified time (ms). When `fulfill` or `reject` is
	     * called, it will be applied after this specified time.
	     *
	     * @example
	     *     var promise = Promise.itsa_manage(
	     *         function(msg) {
	     *             alert(msg);
	     *         }
	     *     );
	     *
	     *     promise.then(
	     *         function() {
	     *             // promise is fulfilled, no further actions can be taken
	     *         }
	     *     );
	     *
	     *     setTimeout(function() {
	     *         promise.callback('hey, I\'m still busy');
	     *     }, 1000);
	     *
	     *     setTimeout(function() {
	     *         promise.fulfill();
	     *     }, 2000);
	     *
	     * @method itsa_manage
	     * @param [callbackFn] {Function} invoked everytime promiseinstance.callback() is called.
	     *        You may as weel (re)set this method atny time lare by using promise.setCallback()
	     * @param [stayActive=false] {Boolean} specified time to wait before the promise really gets resolved
	     * @return {Promise} with three handles: fulfill, reject and callback.
	     * @static
	     */
	    Promise.itsa_manage = function (callbackFn, stayActive) {
	        var fulfillHandler, rejectHandler, promise, finished, stayActivePromise, resolved, isFulfilled, isRejected;

	        promise = new Promise(function (fulfill, reject) {
	            fulfillHandler = fulfill;
	            rejectHandler = reject;
	        });

	        promise.fulfill = function (value) {
	            if (!resolved) {
	                resolved = true;
	                if (stayActivePromise) {
	                    stayActivePromise.then(function () {
	                        finished = true;
	                        fulfillHandler(value);
	                    });
	                } else {
	                    finished = true;
	                    fulfillHandler(value);
	                }
	            }
	        };

	        promise.reject = function (reason) {
	            if (!resolved) {
	                resolved = true;
	                if (stayActivePromise) {
	                    stayActivePromise.then(function () {
	                        finished = true;
	                        rejectHandler(reason);
	                    });
	                } else {
	                    finished = true;
	                    rejectHandler(reason);
	                }
	            }
	        };

	        promise.pending = function () {
	            return !finished;
	        };

	        promise.isFulfilled = function () {
	            return !!isFulfilled;
	        };

	        promise.isRejected = function () {
	            return !!isRejected;
	        };

	        promise.stayActive = function (time) {
	            stayActivePromise = new Promise(function (fulfill) {
	                setTimeout(fulfill, time);
	            });
	        };

	        promise.callback = function () {
	            if (!finished && callbackFn) {
	                callbackFn.apply(undefined, arguments);
	            }
	        };

	        promise.setCallback = function (newCallbackFn) {
	            callbackFn = newCallbackFn;
	        };

	        stayActive && promise.stayActive(stayActive);

	        promise.then(function () {
	            isFulfilled = true;
	        }, function () {
	            isRejected = true;
	        });

	        return promise;
	    };
	}

/***/ }),
/* 30 */
/***/ (function(module, exports) {

	/**
	 *
	 * Extension of Math
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 * @module js-ext
	 * @submodule lib/math.js
	 * @class Math
	 *
	 */

	"use strict";

	/**
	 * Returns the value, while forcing it to be inbetween the specified edges.
	 *
	 * @method itsa_inbetween
	 * @param min {Number} lower-edgde
	 * @param value {Number} the original value that should be inbetween the edges
	 * @param max {Number} upper-edgde
	 * @param [absoluteValue] {boolean} whether `value` should be treaded as an absolute value
	 * @return {Number|undefined} the value, forced to be inbetween the edges. Returns `undefined` if `max` is lower than `min`.
	 */

	Math.itsa_inbetween = function (min, value, max, absoluteValue) {
	  var val = absoluteValue ? Math.abs(value) : value;
	  return max >= min ? this.min(max, this.max(min, val)) : undefined;
	};

	/**
	 * Floors a value in the direction to zero. Native Math.floor does this for positive values,
	 * but negative values are floored more into the negative (Math.floor(-2.3) === -3).
	 * This method floores into the direction of zero: (Math.itsa_floorToZero(-2.3) === -2)
	 *
	 * @method itsa_floorToZero
	 * @param value {Number} the original value that should be inbetween the edges
	 * @return {Number} the floored value
	 */
	Math.itsa_floorToZero = function (value) {
	  return value >= 0 ? Math.floor(value) : Math.ceil(value);
	};

	/**
	 * Ceils a value from zero up. Native Math.ceil does this for positive values,
	 * but negative values are ceiled more into the less negative (Math.ceil(-2.3) === -2).
	 * This method ceiles up from zero: (Math.itsa_ceilFromZero(-2.3) === -3)
	 *
	 * @method itsa_ceilFromZero
	 * @param value {Number} the original value that should be inbetween the edges
	 * @return {Number} the floored value
	 */
	Math.itsa_ceilFromZero = function (value) {
	  return value >= 0 ? Math.ceil(value) : Math.floor(value);
	};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var Event = __webpack_require__(32);
	__webpack_require__(33); // will extent Event
	__webpack_require__(34); // will extent the exported object

	module.exports = Event;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	/**
	 * Defines the Event-Class, which should be instantiated to get its functionality
	 *
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * @module event
	 * @class Event
	 * @constructor
	 * @since 0.0.1
	*/

	__webpack_require__(21);

	// to prevent multiple Event instances
	// (which might happen: http://nodejs.org/docs/latest/api/modules.html#modules_module_caching_caveats)
	// we make sure Event is defined only once. Therefore we bind it to `global` and return it if created before


	(function (global, factory) {

	    "use strict";

	    global._ITSAevent || (global._ITSAevent = factory());

	    module.exports = global._ITSAevent;
	})(typeof global !== 'undefined' ? global : /* istanbul ignore next */undefined, function () {

	    "use strict";

	    var NAME = '[core-event]: ',
	        REGEXP_CUSTOMEVENT = /^((?:\w|-|#)+):((?:\w|-|#)+)$/,
	        WILDCARD_WILDCARD = '*:*',
	        REGEXP_WILDCARD_CUSTOMEVENT = /^(?:((?:(?:\w|-|#)+)|\*):)?((?:(?:\w|-|#)+)|\*)$/,

	    /* REGEXP_WILDCARD_CUSTOMEVENT :
	     *
	     * valid:
	     * 'red:save'
	     * 'red:*'
	     * '*:save'
	     * '*:*'
	     * 'save'
	     *
	     * invalid:
	     * '*red:save'
	     * 're*d:save'
	     * 'red*:save'
	     * 'red:*save'
	     * 'red:sa*ve'
	     * 'red:save*'
	     * ':save'
	     */
	    REGEXP_EMITTERNAME_WITH_SEMICOLON = /^((?:\w|-|#)+):/,
	        REGEXP_EVENTNAME_WITH_SEMICOLON = /:((?:\w|-|#)+)$/,
	        Event;

	    Event = {
	        /**
	         * Subscribes to a customEvent. The callback will be executed `after` the defaultFn.
	         *
	         * @static
	         * @method after
	         * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	         *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	         *        If `emitterName` is not defined, `UI` is assumed.
	         * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	         *        as its only argument.
	         * @param [context] {Object} the instance that subscribes to the event.
	         *        any object can passed through, even those are not extended with event-listener methods.
	         *        Note: Objects who are extended with listener-methods should use instance.after() instead.
	         * @param [filter] {String|Function} to filter the event.
	         *        Use a String if you want to filter DOM-events by a `selector`
	         *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	         *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	         *        the subscriber.
	         * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
	         * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	         * @since 0.0.1
	        */
	        after: function after(customEvent, callback, context, filter, prepend) {
	            return this._addMultiSubs(false, customEvent, callback, context, filter, prepend);
	        },

	        /**
	         * Subscribes to a customEvent. The callback will be executed `before` the defaultFn.
	         *
	         * @static
	         * @method before
	         * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	         *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	         *        If `emitterName` is not defined, `UI` is assumed.
	         * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	         *        as its only argument.
	         * @param [context] {Object} the instance that subscribes to the event.
	         *        any object can passed through, even those are not extended with event-listener methods.
	         *        Note: Objects who are extended with listener-methods should use instance.before() instead.
	         * @param [filter] {String|Function} to filter the event.
	         *        Use a String if you want to filter DOM-events by a `selector`
	         *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	         *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	         *        the subscriber.
	         * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
	         * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	         * @since 0.0.1
	        */
	        before: function before(customEvent, callback, context, filter, prepend) {
	            return this._addMultiSubs(true, customEvent, callback, context, filter, prepend);
	        },

	        /**
	         * Defines an emitterName into the instance (emitter).
	         * This will add a protected property `_emitterName` to the instance.
	         *
	         * @static
	         * @method defineEmitter
	         * @param emitter {Object} instance that should hold the emitterName
	         * @param emitterName {String} identifier that will be added when events are sent (`emitterName:eventName`)
	         * @since 0.0.1
	         */
	        defineEmitter: function defineEmitter(emitter, emitterName) {
	            // ennumerable MUST be set `true` to enable merging
	            Object.defineProperty(emitter, '_emitterName', {
	                configurable: false,
	                enumerable: true,
	                writable: false,
	                value: emitterName
	            });
	        },

	        /**
	         * Defines a CustomEvent. If the eventtype already exists, it will not be overridden,
	         * unless you force to assign with `.forceAssign()`
	         *
	         * The returned object comes with 8 methods which can be invoked chainable:
	         *
	         * <ul>
	         *     <li>defaultFn() --> the default-function of the event</li>
	         *     <li>preventedFn() --> the function that should be invoked when the event is defaultPrevented</li>
	         *     <li>forceAssign() --> overrides any previous definition</li>
	         *     <li>unHaltable() --> makes the customEvent cannot be halted</li>
	         *     <li>unPreventable() --> makes the customEvent's defaultFn cannot be prevented</li>
	         *     <li>unSilencable() --> makes that emitters cannot make this event to perform silently (using e.silent)</li>
	         * </ul>
	         *
	         * @static
	         * @method defineEvent
	         * @param customEvent {String} name of the customEvent conform the syntax: `emitterName:eventName`
	         * @return {Object} with extra methods that can be chained:
	         * <ul>
	         *      <li>unPreventable() --> makes the customEvent's defaultFn cannot be prevented</li>
	         *      <li>forceAssign() --> overrides any previous definition</li>
	         *      <li>defaultFn() --> the default-function of the event</li>
	         *      <li>preventedFn() --> the function that should be invoked when the event is defaultPrevented</li>
	         *      <li>forceAssign() --> overrides any previous definition</li>
	         *      <li>unHaltable() --> makes the customEvent cannot be halted</li>
	         *      <li>unSilencable() --> makes that emitters cannot make this event to perform silently (using e.silent)</li>
	         * </ul>
	         * @since 0.0.1
	         */
	        defineEvent: function defineEvent(customEvent) {
	            var instance = this,
	                customevents = instance._ce,
	                extract,
	                exists,
	                newCustomEvent;

	            if (typeof customEvent !== 'string') {
	                console.error(NAME, 'defineEvent should have a String-type as argument');
	                return;
	            }
	            extract = customEvent.match(REGEXP_CUSTOMEVENT);
	            if (!extract) {
	                console.error(NAME, 'defined Customevent ' + customEvent + ' does not match pattern');
	                return;
	            }
	            newCustomEvent = {
	                preventable: true
	            };
	            exists = customevents[customEvent];
	            // if customEvent not yet exists, we can add it
	            // else, we might need to wait for `forceAssign` to be called
	            if (!exists) {
	                // we can add it
	                customevents[customEvent] = newCustomEvent;
	            }
	            return {
	                defaultFn: function defaultFn(defFn) {
	                    newCustomEvent.defaultFn = defFn;
	                    return this;
	                },
	                preventedFn: function preventedFn(prevFn) {
	                    newCustomEvent.preventedFn = prevFn;
	                    return this;
	                },
	                unHaltable: function unHaltable() {
	                    newCustomEvent.unHaltable = true;
	                    return this;
	                },
	                unSilencable: function unSilencable() {
	                    newCustomEvent.unSilencable = true;
	                    return this;
	                },
	                unPreventable: function unPreventable() {
	                    newCustomEvent.unPreventable = true;
	                    return this;
	                },
	                forceAssign: function forceAssign() {
	                    // only needed when not yet added:
	                    // exists || (customevents[customEvent]=newCustomEvent);
	                    customevents[customEvent] = newCustomEvent;
	                    return this;
	                }
	            };
	        },

	        /**
	         * Detaches (unsubscribes) the listener from the specified customEvent.
	         *
	         * @static
	         * @method detach
	         * @param [listener] {Object} The instance that is going to detach the customEvent.
	         *        When not passed through (or undefined), all customevents of all instances are detached
	         * @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
	         *        `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
	         *        Can be set as the only argument.
	         * @since 0.0.1
	        */
	        detach: function detach(listener, customEvent) {
	            // (typeof listener === 'string') means: only `customEvent` passed through
	            typeof listener === 'string' ? this._removeSubscribers(undefined, listener) : this._removeSubscribers(listener, customEvent);
	        },

	        /**
	         * Detaches (unsubscribes) the listener from all customevents.
	         *
	         * @static
	         * @method detachAll
	         * @param listener {Object} The instance that is going to detach the customEvent
	         * @since 0.0.1
	        */
	        detachAll: function detachAll(listener) {
	            var instance = this;
	            if (listener) {
	                instance._removeSubscribers(listener, '*:*');
	            } else {
	                // we cannot just redefine _subs, for it is set as readonly
	                instance._subs.itsa_each(function (value, key) {
	                    delete instance._subs[key];
	                });
	            }
	        },

	        /**
	         * Emits the event `eventName` on behalf of `emitter`, which becomes e.target in the eventobject.
	         * During this process, all subscribers and the defaultFn/preventedFn get an eventobject passed through.
	         * The eventobject is created with at least these properties:
	         *
	         * <ul>
	         *     <li>e.target --> source that triggered the event (instance or DOM-node), specified by `emitter`</li>
	         *     <li>e.type --> eventName</li>
	         *     <li>e.emitter --> emitterName</li>
	         *     <li>e.status --> status-information:
	         *          <ul>
	         *               <li>e.status.ok --> `true|false` whether the event got executed (not halted or defaultPrevented)</li>
	         *               <li>e.status.defaultFn (optional) --> `true` if any defaultFn got invoked</li>
	         *               <li>e.status.preventedFn (optional) --> `true` if any preventedFn got invoked</li>
	         *               <li>e.status.halted (optional) --> `reason|true` if the event got halted and optional the why</li>
	         *               <li>e.status.defaultPrevented (optional) -->  `reason|true` if the event got defaultPrevented and optional the why</li>
	         *          </ul>
	         *     </li>
	         * </ul>
	         *
	         * The optional `payload` is merged into the eventobject and could be used by the subscribers and the defaultFn/preventedFn.
	         * If payload.silent is set true, the subscribers are not getting invoked: only the defaultFn.
	         *
	         * The eventobject also has these methods:
	         *
	         * <ul>
	         *     <li>e.halt() --> stops immediate all actions: no mer subscribers are invoked, no defaultFn/preventedFn</li>
	         *     <li>e.preventDefault() --> instead of invoking defaultFn, preventedFn will be invoked. No aftersubscribers</li>
	         * </ul>
	         *
	         * <ul>
	         *     <li>First, before-subscribers are invoked: this is the place where you might call `e.halt()`, `a.preventDefault()`</li>
	         *     <li>Next, defaultFn or preventedFn gets invoked, depending on whether e.halt() or a.preventDefault() has been called</li>
	         *     <li>Finally, after-subscribers get invoked (unless e.halt() or a.preventDefault() has been called)</li>
	         * <ul>
	         *
	         * @static
	         * @method emit
	         * @param [emitter] {Object} instance that emits the events
	         * @param customEvent {String} Full customEvent conform syntax `emitterName:eventName`.
	         *        `emitterName` is available as **e.emitter**, `eventName` as **e.type**.
	         * @param payload {Object} extra payload to be added to the event-object
	         * @return {Object|undefined} eventobject or undefined when the event was halted or preventDefaulted.
	         * @since 0.0.1
	         */
	        emit: function emit(emitter, customEvent, payload) {
	            var instance = this;
	            if (typeof emitter === 'string') {
	                // emit is called with signature emit(customEvent, payload)
	                // thus the source-emitter is the Event-instance
	                payload = customEvent;
	                customEvent = emitter;
	                emitter = instance;
	            }
	            return instance._emit(emitter, customEvent, payload);
	        },

	        /**
	         * Creates a notifier for the customEvent.
	         * You can use this to create delayed `defineEvents`. When the customEvent is called, the callback gets invoked
	         * (even before the subsrcibers). Use this callback for delayed customEvent-definitions.
	         *
	         * You may use wildcards for both emitterName and eventName.
	          * You **must** specify the full `emitterName:eventName` syntax.
	         * The module `core-event-dom` uses `notify` to auto-define DOM-events (UI:*).
	         *
	         * @static
	         * @method notify
	         * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	         *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used only  for`eventName`.
	         *        If `emitterName` should be defined.
	         * @param callback {Function} subscriber: will be invoked when the customEvent is called (before any subscribers.
	         *                 Recieves 2 arguments: the `customEvent` and `subscriber-object`.
	         * @param context {Object} context of the callback
	         * @param [once=false] {Boolean} whether the subscriptions should be removed after the first invokation
	         * @chainable
	         * @since 0.0.1
	        */
	        notify: function notify(customEvent, callback, context, once) {
	            var i, len, ce;
	            Array.isArray(customEvent) || (customEvent = [customEvent]);
	            len = customEvent.length;
	            for (i = 0; i < len; i++) {
	                ce = customEvent[i];
	                this._notifiers[ce] = {
	                    cb: callback,
	                    o: context,
	                    r: once // r = remove automaticly
	                };
	            }
	            return this;
	        },

	        /**
	         * Creates a detach-notifier for the customEvent.
	         * You can use this to get informed whenever a subscriber detaches.
	         *
	         * Use **no** wildcards for the emitterName. You might use wildcards for the eventName. Without wildcards, the
	         * notification will be unNotified (callback automaticly detached) on the first time the event occurs.
	          * You **must** specify the full `emitterName:eventName` syntax.
	         * The module `core-event-dom` uses `notify` to auto-define DOM-events (UI:*).
	         *
	         * @static
	         * @method notifyDetach
	         * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	         *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used only  for`eventName`.
	         *        If `emitterName` should be defined.
	         * @param callback {Function} subscriber: will be invoked when the customEvent is called (before any subscribers.
	         *                 Recieves 1 arguments: the `customEvent`.
	         * @param context {Object} context of the callback
	         * @param [once=false] {Boolean} whether the subscriptions should be removed after the first invokation
	         * @chainable
	         * @since 0.0.1
	        */
	        notifyDetach: function notifyDetach(customEvent, callback, context, once) {
	            var i, len, ce;
	            Array.isArray(customEvent) || (customEvent = [customEvent]);
	            len = customEvent.length;
	            for (i = 0; i < len; i++) {
	                ce = customEvent[i];
	                this._detachNotifiers[ce] = {
	                    cb: callback,
	                    o: context,
	                    r: once // r = remove automaticly
	                };
	            }
	            return this;
	        },

	        /**
	         * Subscribes to a customEvent. The callback will be executed `after` the defaultFn.
	         * The subscriber will be automaticly removed once the callback executed the first time.
	         * No need to `detach()` (unless you want to undescribe before the first event)
	         *
	         * @static
	         * @method onceAfter
	         * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	         *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	         *        If `emitterName` is not defined, `UI` is assumed.
	         * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	         *        as its only argument.
	         * @param [context] {Object} the instance that subscribes to the event.
	         *        any object can passed through, even those are not extended with event-listener methods.
	         *        Note: Objects who are extended with listener-methods should use instance.onceAfter() instead.
	         * @param [filter] {String|Function} to filter the event.
	         *        Use a String if you want to filter DOM-events by a `selector`
	         *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	         *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	         *        the subscriber.
	         * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
	         * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	         * @since 0.0.1
	        */
	        onceAfter: function onceAfter(customEvent, callback, context, filter, prepend) {
	            var instance = this,
	                handler,
	                wrapperFn;
	            wrapperFn = function wrapperFn(e) {
	                // CAUTIOUS: removeing the handler right now would lead into a mismatch of the dispatcher
	                // who loops through the array of subscribers!
	                // therefore, we must remove once the eventcycle has finished --> we detach by setting it
	                // at the end of the global-eventstack:
	                // yet there still is a change that the event is called multiple times BEFORE it
	                // will reach the defined `setTimeout` --> to avoid multiple invocations, handler is
	                // extended with the property `_detached`
	                handler._detached || callback.call(this, e);
	                handler._detached = true;
	                setTimeout(function () {
	                    handler.detach();
	                }, 0);
	            };
	            handler = instance._addMultiSubs(false, customEvent, wrapperFn, context, filter, prepend);
	            return handler;
	        },

	        /**
	         * Subscribes to a customEvent. The callback will be executed `before` the defaultFn.
	         * The subscriber will be automaticly removed once the callback executed the first time.
	         * No need to `detach()` (unless you want to undescribe before the first event)
	         *
	         * @static
	         * @method onceBefore
	         * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	         *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	         *        If `emitterName` is not defined, `UI` is assumed.
	         * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	         *        as its only argument.
	         * @param [context] {Object} the instance that subscribes to the event.
	         *        any object can passed through, even those are not extended with event-listener methods.
	         *        Note: Objects who are extended with listener-methods should use instance.onceBefore() instead.
	         * @param [filter] {String|Function} to filter the event.
	         *        Use a String if you want to filter DOM-events by a `selector`
	         *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	         *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	         *        the subscriber.
	         * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
	         * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	         * @since 0.0.1
	        */
	        onceBefore: function onceBefore(customEvent, callback, context, filter, prepend) {
	            var instance = this,
	                handler,
	                wrapperFn;
	            wrapperFn = function wrapperFn(e) {
	                // CAUTIOUS: removeing the handler right now would lead into a mismatch of the dispatcher
	                // who loops through the array of subscribers!
	                // therefore, we must remove once the eventcycle has finished --> we detach by setting it
	                // at the end of the global-eventstack.
	                // yet there still is a change that the event is called multiple times BEFORE it
	                // will reach the defined `setTimeout` --> to avoid multiple invocations, handler is
	                // extended with the property `_detached`
	                handler._detached || callback.call(this, e);
	                handler._detached = true;
	                setTimeout(function () {
	                    handler.detach();
	                }, 0);
	            };
	            handler = instance._addMultiSubs(true, customEvent, wrapperFn, context, filter, prepend);
	            return handler;
	        },

	        /**
	         * Removes all event-definitions of an emitter, specified by its `emitterName`.
	         * When `emitterName` is not set, ALL event-definitions will be removed.
	         *
	         * @static
	         * @method undefAllEvents
	         * @param [emitterName] {String} name of the customEvent conform the syntax: `emitterName:eventName`
	         * @since 0.0.1
	         */
	        undefAllEvents: function undefAllEvents(emitterName) {
	            var instance = this,
	                pattern;
	            if (emitterName) {
	                pattern = new RegExp('^' + emitterName + ':');
	                instance._ce.itsa_each(function (value, key) {
	                    key.match(pattern) && delete instance._ce[key];
	                });
	            } else {
	                instance._ce.itsa_each(function (value, key) {
	                    delete instance._ce[key];
	                });
	            }
	        },

	        /**
	         * Removes the event-definition of the specified customEvent.
	         *
	         * @static
	         * @method undefEvent
	         * @param customEvent {String} name of the customEvent conform the syntax: `emitterName:eventName`
	         * @since 0.0.1
	         */
	        undefEvent: function undefEvent(customEvent) {
	            delete this._ce[customEvent];
	        },

	        /**
	         * unNotifies (unsubscribes) the notifier of the specified customEvent.
	         *
	         * @static
	         * @method unNotify
	         * @param customEvent {String} conform the syntax: `emitterName:eventName`.
	         * @since 0.0.1
	        */
	        unNotify: function unNotify(customEvent) {
	            delete this._notifiers[customEvent];
	        },

	        /**
	         * unNotifies (unsubscribes) the detach-notifier of the specified customEvent.
	         *
	         * @static
	         * @method unNotifyDetach
	         * @param customEvent {String} conform the syntax: `emitterName:eventName`.
	         * @since 0.0.1
	        */
	        unNotifyDetach: function unNotifyDetach(customEvent) {
	            delete this._detachNotifiers[customEvent];
	        },

	        //====================================================================================================
	        // private methods:
	        //====================================================================================================

	        /**
	         * Creates a subscriber to the specified customEvent. The customEvent must conform the syntax:
	         * `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`
	         * If `emitterName` is not defined, `UI` is assumed.
	         *
	         * Examples of valid customevents:
	         *
	         * <ul>
	         *     <li>'redmodel:save'</li>
	         *     <li>'UI:tap'</li>
	         *     <li>'tap' --> alias for 'UI:tap'</li>
	         *     <li>'`*`:click' --> careful: will listen to both UIs and non-UI- click-events</li>
	         *     <li>'redmodel:`*`'</li>
	         *     <li>'`*`:`*`'</li>
	         * </ul>
	         *
	         * @static
	         * @method _addMultiSubs
	         * @param before {Boolean} whether the subscriber is a `before` subscriber. On falsy, an `after`-subscriber is assumed.
	         * @param customEvent {Array} Array of Strings. customEvent should conform the syntax: `emitterName:eventName`, wildcard `*`
	         *         may be used for both `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
	         * @param callback {Function} subscriber to the event.
	         * @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
	         * @param [filter] {String|Function} to filter the event.
	         *        Use a String if you want to filter DOM-events by a `selector`
	         *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	         *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	         *        the subscriber.
	         * @param [prepend=false] {Boolean} whether to make the subscriber the first in the list. By default it will pe appended.
	         * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	         * @private
	         * @since 0.0.1
	        */
	        _addMultiSubs: function _addMultiSubs(before, customEvent, callback, listener, filter, prepend) {
	            var instance = this,
	                subscribers;
	            if (typeof listener === 'string' || typeof listener === 'function') {
	                prepend = filter;
	                filter = listener;
	                listener = null;
	            } else if (typeof listener === 'boolean') {
	                prepend = listener;
	                filter = null;
	                listener = null;
	            }
	            if (typeof filter === 'boolean' || (typeof filter === 'undefined' ? 'undefined' : _typeof(filter)) === undefined || typeof filter === null) {
	                // filter was not set, instead `prepend` is set at this position
	                prepend = filter;
	                filter = null;
	            }
	            if (!Array.isArray(customEvent)) {
	                return instance._addSubscriber(listener, before, customEvent, callback, filter, prepend);
	            }
	            subscribers = [];
	            customEvent.forEach(function (ce) {
	                subscribers.push(instance._addSubscriber(listener, before, ce, callback, filter, prepend));
	            });
	            return {
	                detach: function detach() {
	                    subscribers.itsa_each(function (subscriber) {
	                        subscriber.detach();
	                    });
	                }
	            };
	        },

	        /**
	         * Creates a subscriber to the specified customEvent. The customEvent must conform the syntax:
	         * `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`
	         * If `emitterName` is not defined, `UI` is assumed.
	         *
	         * Examples of valid customevents:
	         *
	         * <ul>
	         *     <li>'redmodel:save'</li>
	         *     <li>'UI:tap'</li>
	         *     <li>'tap' --> alias for 'UI:tap'</li>
	         *     <li>'`*`:click' --> careful: will listen to both UIs and non-UI- click-events</li>
	         *     <li>'redmodel:`*`'</li>
	         *     <li>'`*`:`*`'</li>
	         * </ul>
	         *
	         * @static
	         * @method _addSubscriber
	         * @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
	         * @param before {Boolean} whether the subscriber is a `before` subscriber. On falsy, an `after`-subscriber is assumed.
	         * @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
	         *        `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
	         * @param callback {Function} subscriber to the event.
	         * @param [filter] {String|Function} to filter the event.
	         *        Use a String if you want to filter DOM-events by a `selector`
	         *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	         *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	         *        the subscriber.
	         * @param [prepend=false] {Boolean} whether to make the subscriber the first in the list. By default it will pe appended.
	         * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	         * @private
	         * @since 0.0.1
	        */
	        _addSubscriber: function _addSubscriber(listener, before, customEvent, callback, filter, prepend) {
	            var instance = this,
	                allSubscribers = instance._subs,
	                extract = customEvent.match(REGEXP_WILDCARD_CUSTOMEVENT),
	                hashtable,
	                item,
	                notifier,
	                customEventWildcardEventName,
	                customEventWildcardEmitterName;

	            if (!extract) {
	                console.error(NAME, 'subscribe-error: eventname ' + customEvent + 'does not match pattern');
	                return;
	            }

	            item = {
	                o: listener || instance,
	                cb: callback,
	                f: filter
	            };
	            // if extract[1] is undefined, a simple customEvent is going to subscribe (without :)
	            // therefore: recomposite customEvent:
	            extract[1] || (customEvent = 'UI:' + customEvent);

	            // if extract[1] === 'this', then a listener to its own emitterName is supposed
	            if (extract[1] === 'this') {
	                if (listener._emitterName) {
	                    customEvent = listener._emitterName + ':' + extract[2];
	                    item.s = true; // s --> self
	                } else {
	                    console.error(NAME, 'subscribe-error: "this" cannot be detemined because the object is no emitter');
	                    return;
	                }
	            }

	            allSubscribers[customEvent] || (allSubscribers[customEvent] = {});
	            if (before) {
	                allSubscribers[customEvent].b || (allSubscribers[customEvent].b = []);
	            } else {
	                allSubscribers[customEvent].a || (allSubscribers[customEvent].a = []);
	            }

	            hashtable = allSubscribers[customEvent][before ? 'b' : 'a'];
	            // we need to be able to process an array of customevents

	            // in case of a defined subscription (no wildcard), we should look for notifiers
	            if (extract[1] !== '*' && extract[2] !== '*') {
	                // before subscribing: we might need to activate notifiers --> with defined eventName should also be cleaned up:
	                notifier = instance._notifiers[customEvent];
	                if (notifier) {
	                    notifier.cb.call(notifier.o, customEvent, item);
	                    if (notifier.r) {
	                        delete instance._notifiers[customEvent];
	                    }
	                }
	                // check the same for wildcard eventName:
	                customEventWildcardEventName = customEvent.replace(REGEXP_EVENTNAME_WITH_SEMICOLON, ':*');
	                if (customEventWildcardEventName !== customEvent && (notifier = instance._notifiers[customEventWildcardEventName])) {
	                    notifier.cb.call(notifier.o, customEvent, item);
	                    if (notifier.r) {
	                        delete instance._notifiers[customEvent];
	                    }
	                }
	                // check the same for wildcard emitterName:
	                customEventWildcardEmitterName = customEvent.replace(REGEXP_EMITTERNAME_WITH_SEMICOLON, '*:');
	                if (customEventWildcardEmitterName !== customEvent && (notifier = instance._notifiers[customEventWildcardEmitterName])) {
	                    notifier.cb.call(notifier.o, customEvent, item);
	                    if (notifier.r) {
	                        delete instance._notifiers[customEvent];
	                    }
	                }
	                // check the same for wildcard emitterName and eventName:
	                if (WILDCARD_WILDCARD !== customEvent && (notifier = instance._notifiers[WILDCARD_WILDCARD])) {
	                    notifier.cb.call(notifier.o, customEvent, item);
	                    if (notifier.r) {
	                        delete instance._notifiers[customEvent];
	                    }
	                }
	            }

	            prepend ? hashtable.unshift(item) : hashtable.push(item);

	            return {
	                detach: function detach() {
	                    instance._removeSubscriber(listener, before, customEvent, callback);
	                }
	            };
	        },

	        /**
	         * Emits the event `eventName` on behalf of `emitter`, which becomes e.target in the eventobject.
	         * During this process, all subscribers and the defaultFn/preventedFn get an eventobject passed through.
	         * The eventobject is created with at least these properties:
	         *
	         * <ul>
	         *     <li>e.target --> source that triggered the event (instance or DOM-node), specified by `emitter`</li>
	         *     <li>e.type --> eventName</li>
	         *     <li>e.emitter --> emitterName</li>
	         *     <li>e.status --> status-information:
	         *          <ul>
	         *               <li>e.status.ok --> `true|false` whether the event got executed (not halted or defaultPrevented)</li>
	         *               <li>e.status.defaultFn (optional) --> `true` if any defaultFn got invoked</li>
	         *               <li>e.status.preventedFn (optional) --> `true` if any preventedFn got invoked</li>
	         *               <li>e.status.halted (optional) --> `reason|true` if the event got halted and optional the why</li>
	         *               <li>e.status.defaultPrevented (optional) -->  `reason|true` if the event got defaultPrevented and optional the why</li>
	         *          </ul>
	         *     </li>
	         * </ul>
	         *
	         * The optional `payload` is merged into the eventobject and could be used by the subscribers and the defaultFn/preventedFn.
	         * If payload.silent is set true, the subscribers are not getting invoked: only the defaultFn.
	         *
	         * The eventobject also has these methods:
	         *
	         * <ul>
	         *     <li>e.halt() --> stops immediate all actions: no mer subscribers are invoked, no defaultFn/preventedFn</li>
	         *     <li>e.preventDefault() --> instead of invoking defaultFn, preventedFn will be invoked. No aftersubscribers</li>
	         * </ul>
	         *
	         * <ul>
	         *     <li>First, before-subscribers are invoked: this is the place where you might call `e.halt()` or `a.preventDefault()`</li>
	         *     <li>Next, defaultFn or preventedFn gets invoked, depending on whether e.halt() or a.preventDefault() has been called</li>
	         *     <li>Finally, after-subscribers get invoked (unless e.halt() or a.preventDefault() has been called)</li>
	         * <ul>
	         *
	         * @static
	         * @method emit
	         * @param [emitter] {Object} instance that emits the events
	         * @param customEvent {String} Full customEvent conform syntax `emitterName:eventName`.
	         *        `emitterName` is available as **e.emitter**, `eventName` as **e.type**.
	         * @param payload {Object} extra payload to be added to the event-object
	         * @param [beforeSubscribers] {Array} array of functions to act as beforesubscribers. <b>should not be used</b> other than
	         *                            by any submodule like `event-dom`. If used, than this list of subscribers gets invoked instead
	         *                            of the subscribers that actually subscribed to the event.
	         * @param [afterSubscribers] {Array} array of functions to act as afterSubscribers. <b>should not be used</b> other than
	         *                            by any submodule like `event-dom`. If used, than this list of subscribers gets invoked instead
	         *                            of the subscribers that actually subscribed to the event.
	         * @param [preProcessor] {Function} if passed, this function will be invoked before every single subscriber
	         *                       It is meant to manipulate the eventobject, something that `event-dom` needs to do
	         *                       This function expects 2 arguments: `subscriber` and `eventobject`.
	         *                       <b>should not be used</b> other than by any submodule like `event-dom`.
	         * @param [keepPayload=false] {Boolean} whether `payload` should be used as the ventobject instead of creating a new
	         *                      eventobject and merge payload. <b>should not be used</b> other than by any submodule like `event-dom`.
	         * @param [payloadGetters] {Object} additional payload, where getters inside `payload` are defined as object-values
	         *                      this might be needed, in cae the `payload` has getters that you need to maintain (getters on `payload` are ignored)
	         * @return {Object|undefined} eventobject or undefined when the event was halted or preventDefaulted.
	         * @since 0.0.1
	         */
	        _emit: function _emit(emitter, customEvent, payload, beforeSubscribers, afterSubscribers, preProcessor, keepPayload, payloadGetters) {
	            // NOTE: emit() needs to be synchronous! otherwise we wouldn't be able
	            // to preventDefault DOM-events in time.
	            var instance = this,
	                allCustomEvents = instance._ce,
	                allSubscribers = instance._subs,
	                customEventDefinition,
	                extract,
	                emitterName,
	                eventName,
	                subs,
	                wildcard_named_subs,
	                named_wildcard_subs,
	                wildcard_wildcard_subs,
	                e,
	                invokeSubs,
	                key,
	                propDescriptor;

	            customEvent.indexOf(':') !== -1 || (customEvent = emitter._emitterName + ':' + customEvent);

	            extract = customEvent.match(REGEXP_CUSTOMEVENT);
	            if (!extract) {
	                console.error(NAME, 'defined emit-event ' + customEvent + ' does not match pattern');
	                return;
	            }
	            // prevent running into loop when listeners are emitting the same event:
	            // we will register this event as being active and remove it at the end op the method:
	            if (instance._runningEvents[customEvent]) {
	                console.warn(NAME, 'defined emit-event ' + customEvent + ' got emitted by one of its own listeners, causing it to loop. Event will not be emitted again: exiting Event._emit');
	                return;
	            }
	            instance._runningEvents[customEvent] = true;

	            emitterName = extract[1];
	            eventName = extract[2];
	            customEventDefinition = allCustomEvents[customEvent];

	            subs = allSubscribers[customEvent];
	            wildcard_named_subs = allSubscribers['*:' + eventName];
	            named_wildcard_subs = allSubscribers[emitterName + ':*'];
	            wildcard_wildcard_subs = allSubscribers['*:*'];

	            if (keepPayload) {
	                e = payload || {};
	            } else {
	                e = Object.create(instance._defaultEventObj);
	                // e.target = (payload && payload.target) || emitter; // make it possible to force a specific e.target
	                e.target = emitter;
	                e.type = eventName;
	                e.emitter = emitterName;
	                e.status = {};
	                if (customEventDefinition) {
	                    e._unPreventable = customEventDefinition.unPreventable;
	                    e._unHaltable = customEventDefinition.unHaltable;
	                    customEventDefinition.unSilencable && (e.status.unSilencable = true);
	                }
	                if (payload) {
	                    // e.merge(payload); is not enough --> DOM-eventobject has many properties that are not "own"-properties
	                    for (key in payload) {
	                        if (!(key in e)) {
	                            propDescriptor = Object.getOwnPropertyDescriptor(payload, key);
	                            if (!propDescriptor || !propDescriptor.writable) {
	                                e[key] = payload[key];
	                            } else {
	                                Object.defineProperty(e, key, propDescriptor);
	                            }
	                        }
	                    }
	                }
	                payloadGetters && e.merge(payloadGetters);
	                if (e.status.unSilencable && e.silent) {
	                    console.warn(NAME, ' event ' + e.emitter + ':' + e.type + ' cannot made silent: this customEvent is defined as unSilencable');
	                    e.silent = false;
	                }
	            }
	            if (beforeSubscribers) {
	                instance._invokeSubs(e, false, true, preProcessor, { b: beforeSubscribers });
	            } else {
	                invokeSubs = instance._invokeSubs.bind(instance, e, true, true, false);
	                [subs, named_wildcard_subs, wildcard_named_subs, wildcard_wildcard_subs].forEach(invokeSubs);
	            }
	            e.status.ok = !e.status.halted && !e.status.defaultPrevented;
	            // in case any subscriber changed e.target inside its filter (event-dom does this),
	            // then we reset e.target to its original. But only if e._noResetSourceTarget is undefined:
	            // (e._noResetSourceTarget can be used to supress this behaviour --> dragdrop uses this)
	            e.sourceTarget && !e._noResetSourceTarget && (e.target = e.sourceTarget);
	            if (customEventDefinition && !e.status.halted) {
	                // now invoke defFn
	                e.returnValue = e.status.defaultPrevented || e.status.defaultPreventedContinue ? customEventDefinition.preventedFn && (e.status.preventedFn = true) && customEventDefinition.preventedFn.call(e.target, e) : customEventDefinition.defaultFn && (e.status.defaultFn = true) && customEventDefinition.defaultFn.call(e.target, e);
	            }

	            if (e.status.ok) {
	                if (afterSubscribers) {
	                    instance._invokeSubs(e, false, false, preProcessor, { a: afterSubscribers });
	                } else {
	                    invokeSubs = instance._invokeSubs.bind(instance, e, true, false, false);
	                    [subs, named_wildcard_subs, wildcard_named_subs, wildcard_wildcard_subs].forEach(invokeSubs);
	                }
	            }
	            // cleaning up registration running Events:
	            delete instance._runningEvents[customEvent];
	            return e;
	        },

	        /**
	         * Does the actual invocation of a subscriber.
	         *
	         * @method _invokeSubs
	         * @param e {Object} event-object
	         * @param [checkFilter] {Boolean}
	         * @param [before] {Boolean} whether it concerns before subscribers
	         * @param [checkFilter] {Boolean}
	         * @param subscribers {Array} contains subscribers (objects) with these members:
	         * <ul>
	         *     <li>subscriber.o {Object} context of the callback</li>
	         *     <li>subscriber.cb {Function} callback to be invoked</li>
	         *     <li>subscriber.f {Function} filter to be applied</li>
	         *     <li>subscriber.t {DOM-node} target for the specific selector, which will be set as e.target
	         *         only when event-dom is active and there are filter-selectors</li>
	         *     <li>subscriber.n {DOM-node} highest dom-node that acts as the container for delegation.
	         *         only when event-dom is active and there are filter-selectors</li>
	         *     <li>subscriber.s {Boolean} true when the subscription was set to itself by using "this:eventName"</li>
	         * </ul>
	         * @private
	         * @since 0.0.1
	         */
	        _invokeSubs: function _invokeSubs(e, checkFilter, before, preProcessor, subscribers) {
	            // subscribers, plural
	            var subs, passesThis, passesFilter;
	            if (subscribers && !e.status.halted && !e.silent) {
	                subs = before ? subscribers.b : subscribers.a;
	                subs && subs.some(function (subscriber) {
	                    if (preProcessor && preProcessor(subscriber, e)) {
	                        return true;
	                    }
	                    // check: does it need to be itself because of subscribing through 'this'
	                    passesThis = !subscriber.s || subscriber.o === e.target;
	                    // check: does it pass the filter
	                    passesFilter = !checkFilter || !subscriber.f || subscriber.f.call(subscriber.o, e);
	                    if (passesThis && passesFilter) {
	                        // finally: invoke subscriber
	                        subscriber.cb.call(subscriber.o, e);
	                    }
	                    if (e.status.unSilencable && e.silent) {
	                        console.warn(NAME, ' event ' + e.emitter + ':' + e.type + ' cannot made silent: this customEvent is defined as unSilencable');
	                        e.silent = false;
	                    }
	                    return e.silent || before && e.status.halted; // remember to check whether it was halted for any reason
	                });
	            }
	        },

	        /**
	         * Removes a subscriber from the specified customEvent. The customEvent must conform the syntax:
	         * `emitterName:eventName`.
	         *
	         * @static
	         * @method _removeSubscriber
	         * @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
	         * @param before {Boolean} whether the subscriber is a `before` subscriber. On falsy, an `after`-subscriber is assumed.
	         * @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
	         *        `emitterName` as well as only `eventName`, in which case 'UI' will become the emmiterName.
	         * @param [callback] {Function} subscriber to the event, when not set, all subscribers of the listener to this customEvent
	         *                   will be removed.
	         * @private
	         * @since 0.0.1
	        */
	        _removeSubscriber: function _removeSubscriber(listener, before, customEvent, callback) {
	            var instance = this,
	                eventSubscribers = instance._subs[customEvent],
	                hashtable = eventSubscribers && eventSubscribers[before ? 'b' : 'a'],
	                i,
	                subscriber,
	                beforeUsed,
	                afterUsed,
	                extract,
	                detachNotifier,
	                customEventWildcardEventName;
	            if (hashtable) {
	                // unfortunatly we cannot search by reference, because the array has composed objects
	                // also: can't use native Array.forEach: removing items within its callback change the array
	                // during runtime, making it to skip the next item of the one that's being removed
	                for (i = 0; i < hashtable.length; ++i) {
	                    subscriber = hashtable[i];
	                    if (subscriber.o === (listener || instance) && (!callback || subscriber.cb === callback)) {
	                        hashtable.splice(i--, 1);
	                    }
	                }
	            }
	            // After removal subscriber: check whether both eventSubscribers.a and eventSubscribers.b are empty
	            // if so, remove the member from Event._subs to cleanup memory
	            if (eventSubscribers) {
	                beforeUsed = eventSubscribers.b && eventSubscribers.b.length > 0;
	                afterUsed = eventSubscribers.a && eventSubscribers.a.length > 0;
	                if (!beforeUsed && !afterUsed) {
	                    delete instance._subs[customEvent];
	                }
	            }
	            extract = customEvent.match(REGEXP_CUSTOMEVENT);
	            // in case of a defined subscription (no wildcard),
	            // we need to inform any detachNotifier of the unsubscription:
	            if (extract && extract[1] !== '*' && extract[2] !== '*') {
	                detachNotifier = instance._detachNotifiers[customEvent];
	                if (detachNotifier) {
	                    detachNotifier.cb.call(detachNotifier.o, customEvent);
	                    if (detachNotifier.r) {
	                        delete instance._detachNotifiers[customEvent];
	                    }
	                }
	                // check the same for wildcard eventName:
	                customEventWildcardEventName = customEvent.replace(REGEXP_EVENTNAME_WITH_SEMICOLON, ':*');
	                if (customEventWildcardEventName !== customEvent && (detachNotifier = instance._detachNotifiers[customEventWildcardEventName])) {
	                    detachNotifier.cb.call(detachNotifier.o, customEvent);
	                    if (detachNotifier.r) {
	                        delete instance._detachNotifiers[customEvent];
	                    }
	                }
	            }
	        },

	        /**
	         * Removes subscribers from the multiple customevents. The customEvent must conform the syntax:
	         * `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`
	         * If `emitterName` is not defined, `UI` is assumed.
	         *
	         * Examples of valid customevents:
	         *
	         * <ul>
	         *     <li>'redmodel:save'</li>
	         *     <li>'UI:tap'</li>
	         *     <li>'tap' --> alias for 'UI:tap'</li>
	         *     <li>'`*`:click' --> careful: will listen to both UIs and non-UI- click-events</li>
	         *     <li>'redmodel:`*`'</li>
	         *     <li>'`*`:`*`'</li>
	         * </ul>
	         *
	         * @static
	         * @method _removeSubscriber
	         * @param listener {Object} Object that creates the subscriber (and will be listening by `listener.after(...)`)
	         * @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
	         *        `emitterName` as well as only `eventName`, in which case 'UI' will become the emmiterName.
	         * @private
	         * @since 0.0.1
	        */
	        _removeSubscribers: function _removeSubscribers(listener, customEvent) {
	            var instance = this,
	                emitterName,
	                eventName,
	                extract = customEvent.match(REGEXP_WILDCARD_CUSTOMEVENT);
	            if (!extract) {
	                console.error(NAME, '_removeSubscribers-error: customEvent ' + customEvent + ' does not match pattern');
	                return;
	            }
	            emitterName = extract[1] || 'UI';
	            eventName = extract[2];
	            if (emitterName !== '*' && eventName !== '*') {
	                instance._removeSubscriber(listener, true, customEvent);
	                instance._removeSubscriber(listener, false, customEvent);
	            } else {
	                // wildcard, we need to look at all the members of Event._subs
	                instance._subs.itsa_each(function (value, key) {
	                    var localExtract = key.match(REGEXP_WILDCARD_CUSTOMEVENT),
	                        emitterMatch = emitterName === '*' || emitterName === localExtract[1],
	                        eventMatch = eventName === '*' || eventName === localExtract[2];
	                    if (emitterMatch && eventMatch) {
	                        instance._removeSubscriber(listener, true, key);
	                        instance._removeSubscriber(listener, false, key);
	                    }
	                });
	            }
	        },

	        /**
	         * Adds a property to the default eventobject's prototype which passes through all eventcycles.
	         * Goes through Object.defineProperty with configurable, enumerable and writable
	         * all set to false.
	         *
	         * @method _setEventObjProperty
	         * @param property {String} event-object
	         * @param value {Any}
	         * @chainable
	         * @private
	         * @since 0.0.1
	         */
	        _setEventObjProperty: function _setEventObjProperty(property, value) {
	            Object.itsa_protectedProp(this._defaultEventObj, property, value);
	            return this;
	        }

	    };

	    /**
	     * Objecthash containing all defined custom-events
	     * which has a structure like this:
	     *
	     * _ce = {
	     *     'UI:tap': {
	     *         preventable: true,
	     *         defaultFn: function(){...},
	     *         preventedFn: function(){...}
	     *     },
	     *     'redmodel:save': {
	     *         preventable: true,
	     *         defaultFn: function(){...},
	     *         preventedFn: function(){...}
	     *     }
	     * }
	     *
	     * @property _ce
	     * @default {}
	     * @type Object
	     * @private
	     * @since 0.0.1
	    */
	    Object.defineProperty(Event, '_ce', {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: {} // `writable` is false means we cannot chance the value-reference, but we can change {}'s properties itself
	    });

	    /**
	     * Objecthash containing all running Events.
	     * Meant for local registration inside _emit --> to prevent looping whenever a listener emits the same event.
	     *
	     * @property _runningEvents
	     * @default {}
	     * @type Object
	     * @private
	     * @since 0.0.1
	    */
	    Object.defineProperty(Event, '_runningEvents', {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: {} // `writable` is false means we cannot chance the value-reference, but we can change {}'s properties itself
	    });

	    /**
	     * Objecthash containing all defined before and after subscribers
	     * which has a structure like this (`b` represents `before` and `a` represents `after`)
	     * Every item that gets in the array consist by itself of 3 properties:
	     *                                                          subscriberitem = {
	     *                                                              o: listener,
	     *                                                              cb: callbackFn(e),
	     *                                                              f: filter
	     *                                                          };
	     *
	     * _subs = {
	     *     'UI:tap': {
	     *         b: [
	     *             item,
	     *             item
	     *         ],
	     *         a: [
	     *             item,
	     *             item
	     *         ]
	     *     },
	     *     '*:click': {
	     *         b: [
	     *             item,
	     *             item
	     *         ],
	     *         a: [
	     *             item,
	     *             item
	     *         ]
	     *     },
	     *     'redmodel:save': {
	     *         b: [
	     *             item,
	     *             item
	     *         ],
	     *         a: [
	     *             item,
	     *             item
	     *         ]
	     *     }
	     * }
	     *
	     * @property _ce
	     * @default {}
	     * @type Object
	     * @private
	     * @since 0.0.1
	    */
	    Object.itsa_protectedProp(Event, '_subs', {});

	    /**
	     * Object that acts as the prototype of the eventobject.
	     * To add more methods, you can use `_setEventObjProperty`
	     *
	     * @property _defaultEventObj
	     * @default {
	     *    halt: function(),
	     *    preventDefault: function()
	     * }
	     * @type Object
	     * @private
	     * @since 0.0.1
	    */
	    Object.itsa_protectedProp(Event, '_defaultEventObj', {});

	    /**
	     * Objecthash containing all detach-notifiers, keyed by customEvent name.
	     * This list is maintained by `notifyDetach` and `unNotifyDetach`
	     *
	     * _detachNotifiers = {
	     *     'UI:tap': {
	     *         cb:function() {}
	     *         o: {} // context
	     *     },
	     *     'redmodel:*': {
	     *         cb:function() {}
	     *         o: {} // context
	     *     },
	     *     'bluemodel:save': {
	     *         cb:function() {}
	     *         o: {} // context
	     *     }
	     * }
	     *
	     * @property _detachNotifiers
	     * @default {}
	     * @type Object
	     * @private
	     * @since 0.0.1
	    */
	    Object.itsa_protectedProp(Event, '_detachNotifiers', {});

	    /**
	     * Objecthash containing all notifiers, keyed by customEvent name.
	     * This list is maintained by `notify` and `unNotify`
	     *
	     * _notifiers = {
	     *     'UI:tap': {
	     *         cb:function() {}
	     *         o: {} // context
	     *     },
	     *     'redmodel:*': {
	     *         cb:function() {}
	     *         o: {} // context
	     *     },
	     *     'bluemodel:save': {
	     *         cb:function() {}
	     *         o: {} // context
	     *     }
	     * }
	     *
	     * @property _notifiers
	     * @default {}
	     * @type Object
	     * @private
	     * @since 0.0.1
	    */
	    Object.itsa_protectedProp(Event, '_notifiers', {});

	    Event._setEventObjProperty('halt', function (reason) {
	        this.status.ok || this._unHaltable || (this.status.halted = reason || true);
	    })._setEventObjProperty('preventDefault', function (reason) {
	        this.status.ok || this._unPreventable || (this.status.defaultPrevented = reason || true);
	    })._setEventObjProperty('preventDefaultContinue', function (reason) {
	        this.status.ok || this._unPreventable || (this.status.defaultPreventedContinue = reason || true);
	    });

	    return Event;
	});
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Extends the Event-instance by adding the method `Emitter` to it.
	 * The `Emitter-method` returns an object that should be merged into any Class-instance or object you
	 * want to extend with the emit-methods, so the appropriate methods can be invoked on the instance.
	 *
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * Should be called using  the provided `extend`-method like this:
	 * @example
	 *     var Event = require('event');<br>
	 *
	 * @module event
	 * @submodule event-emitter
	 * @class Event.Emitter
	 * @since 0.0.1
	*/

	var NAME = '[event-emitter]: ',
	    REGEXP_EMITTER = /^(\w|-|#)+$/,
	    Event = __webpack_require__(32);

	Event.Emitter = function (emitterName) {
	    var composeCustomevent = function composeCustomevent(eventName) {
	        return emitterName + ':' + eventName;
	    },
	        newEmitter;
	    if (!REGEXP_EMITTER.test(emitterName)) {
	        console.error(NAME, 'Emitter invoked with invalid argument: you must specify a valid emitterName');
	        return;
	    }
	    newEmitter = {
	        /**
	         * Defines a CustomEvent. If the eventtype already exists, it will not be overridden,
	         * unless you force to assign with `.forceAssign()`
	         *
	         * The returned object comes with 4 methods which can be invoked chainable:
	         *
	         * <ul>
	         *     <li>defaultFn() --> the default-function of the event</li>
	         *     <li>preventedFn() --> the function that should be invoked when the event is defaultPrevented</li>
	         *     <li>forceAssign() --> overrides any previous definition</li>
	         *     <li>unHaltable() --> makes the customEvent cannot be halted</li>
	         *     <li>unPreventable() --> makes the customEvent's defaultFn cannot be prevented</li>
	         *     <li>unSilencable() --> makes that emitters cannot make this event to perform silently (using e.silent)</li>
	         * </ul>
	         *
	         * @method defineEvent
	         * @param eventName {String} name of the customEvent, without `emitterName`.
	         *        The final event that will be created has the syntax: `emitterName:eventName`,
	         *        where `emitterName:` is automaticly prepended.
	         * @return {Object} with extra methods that can be chained:
	         * <ul>
	         *      <li>unPreventable() --> makes the customEvent's defaultFn cannot be prevented</li>
	         *      <li>forceAssign() --> overrides any previous definition</li>
	         *      <li>defaultFn() --> the default-function of the event</li>
	         *      <li>preventedFn() --> the function that should be invoked when the event is defaultPrevented</li>
	         * </ul>
	         * @since 0.0.1
	         */
	        defineEvent: function defineEvent(eventName) {
	            return Event.defineEvent(composeCustomevent(eventName));
	        },

	        /**
	         * Emits the event `eventName` on behalf of the instance holding this method.
	         *
	         * @method emit
	         * @param eventName {String} name of the event to be sent (available as e.type)
	         *        you could pass a customEvent here 'emitterName:eventName', which would
	         *        overrule the `instance-emitterName`
	         * @param payload {Object} extra payload to be added to the event-object
	         * @return {Object|undefined} eventobject or undefined when the event was halted or preventDefaulted.
	         * <ul>
	         *     <li>on success: returnValue {Any} of the defaultFn</li>
	         *     <li>on error: reason {Any} Either: description 'event was halted', 'event was defaultPrevented' or the returnvalue of the preventedFn</li>
	         * </ul>
	         * @since 0.0.1
	         */
	        emit: function emit(eventName, payload) {
	            return Event.emit(this, eventName, payload);
	        },

	        /**
	         * Removes all event-definitions of the instance holding this method.
	         *
	         * @method undefAllEvents
	         * @since 0.0.1
	         */
	        undefAllEvents: function undefAllEvents() {
	            Event.undefEvent(emitterName);
	        },

	        /**
	         * Removes the event-definition of the specified customEvent.
	         *
	         * @method undefEvent
	         * @param eventName {String} name of the customEvent, without `emitterName`.
	         *        The calculated customEvent which will be undefined, will have the syntax: `emitterName:eventName`.
	         *        where `emitterName:` is automaticly prepended.
	         * @since 0.0.1
	         */
	        undefEvent: function undefEvent(eventName) {
	            Event.undefEvent(composeCustomevent(eventName));
	        }

	    };
	    // register the emittername:
	    Event.defineEmitter(newEmitter, emitterName);
	    return newEmitter;
	};

	module.exports = Event;

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	/**
	 * Extends the Event-instance by adding the object `Listener` to it.
	 * The returned object should be merged into any Class-instance or object you want to
	 * extend with the listener-methods, so the appropriate methods can be invoked on the instance.
	 *
	 *
	 * <i>Copyright (c) 2014 ITSA - https://github.com/itsa</i>
	 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	 *
	 *
	 * Should be called using  the provided `extend`-method like this:
	 * @example
	 *     var Event = require('event');<br>
	 *
	 * @module event
	 * @submodule event-listener
	 * @class Event.Listener
	 * @since 0.0.1
	*/

	__webpack_require__(21);

	var Event = __webpack_require__(32),
	    Classes = __webpack_require__(35),
	    callbackFn,
	    ClassListener;

	Event.Listener = {
	    /**
	     * Subscribes to a customEvent on behalf of the object who calls this method.
	     * The callback will be executed `after` the defaultFn.
	     *
	     * @method after
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    after: function after(customEvent, callback, filter, prepend) {
	        return Event.after(customEvent, callback, this, filter, prepend);
	    },

	    /**
	     * Subscribes to a customEvent on behalf of the object who calls this method.
	     * The callback will be executed `before` the defaultFn.
	     *
	     * @method before
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    before: function before(customEvent, callback, filter, prepend) {
	        return Event.before(customEvent, callback, this, filter, prepend);
	    },

	    /**
	     * Detaches (unsubscribes) the listener from the specified customEvent,
	     * on behalf of the object who calls this method.
	     *
	     * @method detach
	     * @param customEvent {String} conform the syntax: `emitterName:eventName`, wildcard `*` may be used for both
	     *        `emitterName` as well as only `eventName`, in which case 'UI' will become the emitterName.
	     * @since 0.0.1
	    */
	    detach: function detach(customEvent) {
	        Event.detach(this, customEvent);
	    },

	    /**
	     * Detaches (unsubscribes) the listener from all customevents,
	     * on behalf of the object who calls this method.
	     *
	     * @method detachAll
	     * @since 0.0.1
	    */
	    detachAll: function detachAll() {
	        Event.detachAll(this);
	    },

	    /**
	     * Subscribes to a customEvent on behalf of the object who calls this method.
	     * The callback will be executed `after` the defaultFn.
	     * The subscriber will be automaticly removed once the callback executed the first time.
	     * No need to `detach()` (unless you want to undescribe before the first event)
	     *
	     * @method onceAfter
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    onceAfter: function onceAfter(customEvent, callback, filter, prepend) {
	        return Event.onceAfter(customEvent, callback, this, filter, prepend);
	    },

	    /**
	     * Subscribes to a customEvent on behalf of the object who calls this method.
	     * The callback will be executed `before` the defaultFn.
	     * The subscriber will be automaticly removed once the callback executed the first time.
	     * No need to `detach()` (unless you want to undescribe before the first event)
	     *
	     * @method onceBefore
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    onceBefore: function onceBefore(customEvent, callback, filter, prepend) {
	        return Event.onceBefore(customEvent, callback, this, filter, prepend);
	    }
	};

	callbackFn = function callbackFn(callback, e) {
	    var instance = this,
	        eTarget = e.target,
	        accept;
	    accept = eTarget === instance || eTarget.vnode && instance.vnode && instance.contains(eTarget);
	    accept && callback.call(instance, e);
	};

	Event._CE_listener = ClassListener = {
	    /**
	     * Is automaticly available for Classes.
	     * Subscribes to a customEvent on behalf of the class-instance and will only
	     * be executed when the emitter is the instance itself.
	     *
	     * The callback will be executed `after` the defaultFn.
	     *
	     * @method selfAfter
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    selfAfter: function selfAfter(customEvent, callback, filter, prepend) {
	        return Event.after(customEvent, callbackFn.bind(this, callback), this, filter, prepend);
	    },

	    /**
	     * Is automaticly available for Classes.
	     * Subscribes to a customEvent on behalf of the class-instance and will only
	     * be executed when the emitter is the instance itself.
	     *
	     * The callback will be executed `before` the defaultFn.
	     *
	     * @method selfBefore
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    selfBefore: function selfBefore(customEvent, callback, filter, prepend) {
	        return Event.before(customEvent, callbackFn.bind(this, callback), this, filter, prepend);
	    },

	    /**
	     * Is automaticly available for Classes.
	     * Subscribes to a customEvent on behalf of the class-instance and will only
	     * be executed when the emitter is the instance itself.
	     *
	     * The callback will be executed `after` the defaultFn.
	     * The subscriber will be automaticly removed once the callback executed the first time.
	     * No need to `detach()` (unless you want to undescribe before the first event)
	     *
	     * @method selfOnceAfter
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of after-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    selfOnceAfter: function selfOnceAfter(customEvent, callback, filter, prepend) {
	        return Event.onceAfter(customEvent, callbackFn.bind(this, callback), this, filter, prepend);
	    },

	    /**
	     * Is automaticly available for Classes.
	     * Subscribes to a customEvent on behalf of the class-instance and will only
	     * be executed when the emitter is the instance itself.
	     *
	     * The callback will be executed `before` the defaultFn.
	     * The subscriber will be automaticly removed once the callback executed the first time.
	     * No need to `detach()` (unless you want to undescribe before the first event)
	     *
	     * @method selfOnceBefore
	     * @param customEvent {String|Array} the custom-event (or Array of events) to subscribe to. CustomEvents should
	     *        have the syntax: `emitterName:eventName`. Wildcard `*` may be used for both `emitterName` as well as `eventName`.
	     *        If `emitterName` is not defined, `UI` is assumed.
	     * @param callback {Function} subscriber:will be invoked when the event occurs. An `eventobject` will be passed
	     *        as its only argument.
	     * @param [filter] {String|Function} to filter the event.
	     *        Use a String if you want to filter DOM-events by a `selector`
	     *        Use a function if you want to filter by any other means. If the function returns a trully value, the
	     *        subscriber gets invoked. The function gets the `eventobject` as its only argument and the context is
	     *        the subscriber.
	     * @param [prepend=false] {Boolean} whether the subscriber should be the first in the list of before-subscribers.
	     * @return {Object} handler with a `detach()`-method which can be used to detach the subscriber
	     * @since 0.0.1
	    */
	    selfOnceBefore: function selfOnceBefore(customEvent, callback, filter, prepend) {
	        return Event.onceBefore(customEvent, callbackFn.bind(this, callback), this, filter, prepend);
	    },

	    destroy: function destroy(notChained) {
	        var instance = this,
	            _superDestroy;
	        if (!instance._destroyed) {
	            _superDestroy = function superDestroy(constructor) {
	                // don't call `hasOwnProperty` directly on obj --> it might have been overruled
	                Object.prototype.hasOwnProperty.call(constructor.prototype, '_destroy') && constructor.prototype._destroy.call(instance);
	                if (!notChained && constructor.$$super) {
	                    instance.__classCarier__ = constructor.$$super.constructor;
	                    _superDestroy(constructor.$$super.constructor);
	                }
	            };
	            _superDestroy(instance.constructor);
	            instance.detachAll();
	            instance.undefAllEvents && instance.undefAllEvents();
	            Object.itsa_protectedProp(instance, '_destroyed', true);
	        }
	    }
	};

	// Patching Classes.BaseClass to make it an eventlistener that auto cleans-up:
	Classes.BaseClass.mergePrototypes(Event.Listener, true).mergePrototypes(ClassListener, true, {}, {});

	module.exports = Event;

/***/ }),
/* 35 */
/***/ (function(module, exports) {

	/**
	*
	* Using Classes in a very flexible and easy way.
	* See http://itsa.io/docs/classes/index.html
	*
	* <i>Copyright (c) 2015 Itsa-react-server - https://github.com/itsa-server</i>
	* New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
	*
	* @module classes
	* @class Classes
	*
	*/

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var NAME = '[Classes]: ',
	    DEFAULT_CHAIN_CONSTRUCT,
	    defineProperty,
	    defineProperties,
	    protectedProp,
	    NOOP,
	    REPLACE_CLASS_METHODS,
	    PROTECTED_CLASS_METHODS,
	    PROTO_RESERVED_NAMES,
	    BASE_MEMBERS,
	    createBaseClass,
	    Classes,
	    coreMethods;

	/**
	 * Defines whether Classes should call their constructor in a chained way top-down.
	 *
	 * @property DEFAULT_CHAIN_CONSTRUCT
	 * @default true
	 * @type Boolean
	 * @protected
	 * @since 0.0.1
	*/
	DEFAULT_CHAIN_CONSTRUCT = true;

	/**
	 * Sugarmethod for Object.defineProperty creating an unenumerable property
	 *
	 * @method defineProperty
	 * @param [object] {Object} The object to define the property to
	 * @param [name] {String} name of the property
	 * @param [method] {Any} value of the property
	 * @param [force=false] {Boolean} to force assignment when the property already exists
	 * @protected
	 * @since 0.0.1
	*/
	defineProperty = function defineProperty(object, name, method, force) {
	    if (!force && name in object) {
	        return;
	    }
	    Object.defineProperty(object, name, {
	        configurable: true,
	        enumerable: false,
	        writable: true,
	        value: method
	    });
	};
	/**
	 * Sugarmethod for using defineProperty for multiple properties at once.
	 *
	 * @method defineProperties
	 * @param [object] {Object} The object to define the property to
	 * @param [map] {Object} object to be set
	 * @param [force=false] {Boolean} to force assignment when the property already exists
	 * @protected
	 * @since 0.0.1
	*/
	defineProperties = function defineProperties(object, map, force) {
	    var names = Object.keys(map),
	        l = names.length,
	        i = -1,
	        name;
	    while (++i < l) {
	        name = names[i];
	        defineProperty(object, name, map[name], force);
	    }
	};

	/**
	 * Empty function
	 *
	 * @method NOOP
	 * @protected
	 * @since 0.0.1
	*/
	NOOP = function NOOP() {};

	/**
	 * Creates a protected property on the object.
	 *
	 * @method protectedProp
	 * @protected
	 */
	protectedProp = function protectedProp(obj, property, value) {
	    Object.defineProperty(obj, property, {
	        configurable: false,
	        enumerable: false,
	        writable: false,
	        value: value
	    });
	};

	/**
	 * Internal hash containing the names of members which names should be transformed
	 *
	 * @property REPLACE_CLASS_METHODS
	 * @default {destroy: '_destroy'}
	 * @type Object
	 * @protected
	 * @since 0.0.1
	*/
	REPLACE_CLASS_METHODS = {
	    destroy: '_destroy'
	};

	/**
	 * Internal hash containing protected members: those who cannot be merged into a Class
	 *
	 *
	 * @property PROTECTED_CLASS_METHODS
	 * @default {$super: true, $superProp: true, $orig: true}
	 * @type Object
	 * @protected
	 * @since 0.0.1
	*/
	PROTECTED_CLASS_METHODS = {
	    $super: true,
	    $superProp: true,
	    $orig: true
	};

	/*jshint proto:true */
	/* jshint -W001 */
	/*
	 * Internal hash containing protected members: those who cannot be merged into a Class
	 *
	 * @property PROTO_RESERVED_NAMES
	 * @default {constructor: true, prototype: true, hasOwnProperty: true, isPrototypeOf: true,
	 *           propertyIsEnumerable: true, __defineGetter__: true, __defineSetter__: true,
	 *           __lookupGetter__: true, __lookupSetter__: true, __proto__: true}
	 * @type Object
	 * @protected
	 * @since 0.0.1
	*/
	PROTO_RESERVED_NAMES = {
	    constructor: true,
	    prototype: true,
	    hasOwnProperty: true,
	    isPrototypeOf: true,
	    propertyIsEnumerable: true,
	    __defineGetter__: true,
	    __defineSetter__: true,
	    __lookupGetter__: true,
	    __lookupSetter__: true,
	    __proto__: true
	};
	/* jshint +W001 */
	/*jshint proto:false */

	defineProperties(Function.prototype, {

	    /**
	     * Merges the given prototypes of properties into the `prototype` of the Class.
	     *
	     * **Note1 ** to be used on instances --> ONLY on Classes
	     * **Note2 ** properties with getters and/or unwritable will NOT be merged
	     *
	     * The members in the hash prototypes will become members with
	     * instances of the merged class.
	     *
	     * By default, this method will not override existing prototype members,
	     * unless the second argument `force` is true.
	     *
	     * @method mergePrototypes
	     * @param prototypes {Object} Hash prototypes of properties to add to the prototype of this object
	     * @param force {Boolean}  If true, existing members will be overwritten
	     * @chainable
	     */
	    mergePrototypes: function mergePrototypes(prototypes, force) {
	        var instance, proto, names, l, i, replaceMap, protectedMap, name, nameInProto, finalName, propDescriptor, extraInfo;
	        if (!prototypes) {
	            return;
	        }
	        instance = this; // the Class
	        proto = instance.prototype;
	        names = Object.getOwnPropertyNames(prototypes);
	        l = names.length;
	        i = -1;
	        replaceMap = arguments[2] || REPLACE_CLASS_METHODS; // hidden feature, used by itags

	        protectedMap = arguments[3] || PROTECTED_CLASS_METHODS; // hidden feature, used by itags
	        while (++i < l) {
	            name = names[i];
	            finalName = replaceMap[name] || name;
	            nameInProto = finalName in proto;
	            if (!PROTO_RESERVED_NAMES[finalName] && !protectedMap[finalName] && (!nameInProto || force)) {
	                // if nameInProto: set the property, but also backup for chaining using $$orig
	                propDescriptor = Object.getOwnPropertyDescriptor(prototypes, name);
	                if (!propDescriptor.writable) {
	                    console.info(NAME + 'mergePrototypes will set property of ' + name + ' without its property-descriptor: for it is an unwritable property.');
	                    proto[finalName] = prototypes[name];
	                } else {
	                    // adding prototypes[name] into $$orig:
	                    instance.$$orig[finalName] || (instance.$$orig[finalName] = []);
	                    instance.$$orig[finalName][instance.$$orig[finalName].length] = prototypes[name];
	                    if (typeof prototypes[name] === 'function') {
	                        /*jshint -W083 */
	                        propDescriptor.value = function (originalMethodName, finalMethodName) {
	                            return function () {
	                                /*jshint +W083 */
	                                // this.$own = prot;
	                                // this.$origMethods = instance.$$orig[finalMethodName];
	                                var context, classCarierBkp, methodClassCarierBkp, origPropBkp, returnValue;
	                                // in some specific situations, this method is called without context.
	                                // can't figure out why (it happens when itable changes some of its its item-values)
	                                // probably reasson is that itable.model.items is not the same as itable.getData('_items')
	                                // anyway: to prevent errors here, we must return when there is no context:
	                                context = this;
	                                if (!context) {
	                                    return;
	                                }
	                                classCarierBkp = context.__classCarier__;
	                                methodClassCarierBkp = context.__methodClassCarier__;
	                                origPropBkp = context.__origProp__;

	                                context.__methodClassCarier__ = instance;

	                                context.__classCarier__ = null;

	                                context.__origProp__ = finalMethodName;
	                                returnValue = prototypes[originalMethodName].apply(context, arguments);
	                                context.__origProp__ = origPropBkp;

	                                context.__classCarier__ = classCarierBkp;

	                                context.__methodClassCarier__ = methodClassCarierBkp;

	                                return returnValue;
	                            };
	                        }(name, finalName);
	                    }
	                    Object.defineProperty(proto, finalName, propDescriptor);
	                }
	            } else {
	                extraInfo = '';
	                nameInProto && (extraInfo = 'property is already available (you might force it to be set)');
	                PROTO_RESERVED_NAMES[finalName] && (extraInfo = 'property is a protected property');
	                protectedMap[finalName] && (extraInfo = 'property is a private property');
	                console.warn(NAME + 'mergePrototypes is not allowed to set the property: ' + name + ' --> ' + extraInfo);
	            }
	        }
	        return instance;
	    },

	    /**
	     * Removes the specified prototypes from the Class.
	     *
	     *
	     * @method removePrototypes
	     * @param properties {String|Array} Hash of properties to be removed from the Class
	     * @chainable
	     */
	    removePrototypes: function removePrototypes(properties) {
	        var proto = this.prototype,
	            replaceMap = arguments[1] || REPLACE_CLASS_METHODS; // hidden feature, used by itags
	        Array.isArray(properties) || (properties = [properties]);
	        properties.forEach(function (prop) {
	            prop = replaceMap[prop] || prop;
	            delete proto[prop];
	        });
	        return this;
	    },

	    /**
	     * Redefines the constructor fo the Class
	     *
	     * @method setConstructor
	     * @param [constructorFn] {Function} The function that will serve as the new constructor for the class.
	     *        If `undefined` defaults to `NOOP`
	     * @param [prototypes] {Object} Hash map of properties to be added to the prototype of the new class.
	     * @param [chainConstruct=true] {Boolean} Whether -during instance creation- to automaticly construct in the complete hierarchy with the given constructor arguments.
	     * @chainable
	     */
	    setConstructor: function setConstructor(constructorFn, chainConstruct) {
	        var instance = this;
	        if (typeof constructorFn === 'boolean') {
	            chainConstruct = constructorFn;
	            constructorFn = null;
	        }
	        typeof chainConstruct === 'boolean' || (chainConstruct = DEFAULT_CHAIN_CONSTRUCT);
	        instance.$$constrFn = constructorFn || NOOP;
	        instance.$$chainConstructed = chainConstruct ? true : false;
	        return instance;
	    },

	    /**
	     * Returns a newly created class inheriting from this class
	     * using the given `constructor` with the
	     * prototypes listed in `prototypes` merged in.
	     *
	     *
	     * The newly created class has the `$$super` static property
	     * available to access all of is ancestor's instance methods.
	     *
	     * Further methods can be added via the [mergePrototypes](#method_mergePrototypes).
	     *
	     * @example
	     *
	     *  var Circle = Shape.subClass(
	     *      function (x, y, r) {
	     *          // arguments will automaticly be passed through to Shape's constructor
	     *          this.r = r;
	     *      },
	     *      {
	     *          area: function () {
	     *              return this.r * this.r * Math.PI;
	     *          }
	     *      }
	     *  );
	     *
	     * @method subClass
	     * @param [constructor] {Function} The function that will serve as constructor for the new class.
	     *        If `undefined` defaults to `NOOP`
	     * @param [prototypes] {Object} Hash map of properties to be added to the prototype of the new class.
	     * @param [chainConstruct=true] {Boolean} Whether -during instance creation- to automaticly construct in the complete hierarchy with the given constructor arguments.
	     * @return the new class.
	     */
	    subClass: function subClass(constructor, prototypes, chainConstruct) {

	        var instance = this,
	            constructorClosure = {},
	            baseProt,
	            proto,
	            constrFn;
	        if (typeof constructor === 'boolean') {
	            constructor = null;
	            prototypes = null;
	            chainConstruct = constructor;
	        } else {
	            if ((typeof constructor === 'undefined' ? 'undefined' : _typeof(constructor)) === 'object' && constructor !== null) {
	                chainConstruct = prototypes;
	                prototypes = constructor;
	                constructor = null;
	            }

	            if (typeof prototypes === 'boolean') {
	                chainConstruct = prototypes;
	                prototypes = null;
	            }
	        }

	        typeof chainConstruct === 'boolean' || (chainConstruct = DEFAULT_CHAIN_CONSTRUCT);

	        constrFn = constructor || NOOP;
	        constructor = function constructor() {
	            constructorClosure.constructor.$$constrFn.apply(this, arguments);
	        };

	        constructor = function (originalConstructor) {
	            return function () {
	                var context = this;
	                if (constructorClosure.constructor.$$chainConstructed) {
	                    context.__classCarier__ = constructorClosure.constructor.$$super.constructor;
	                    context.__origProp__ = 'constructor';
	                    context.__classCarier__.apply(context, arguments);
	                    context.$origMethods = constructorClosure.constructor.$$orig.constructor;
	                }
	                context.__classCarier__ = constructorClosure.constructor;
	                context.__origProp__ = 'constructor';
	                originalConstructor.apply(context, arguments);
	                // only call aferInit on the last constructor of the chain:
	                constructorClosure.constructor === context.constructor && context.afterInit();
	            };
	        }(constructor);

	        baseProt = instance.prototype;
	        proto = Object.create(baseProt);
	        constructor.prototype = proto;

	        // webkit doesn't let all objects to have their constructor redefined
	        // when directly assigned. Using `defineProperty will work:
	        Object.defineProperty(proto, 'constructor', { value: constructor });

	        constructor.$$chainConstructed = chainConstruct ? true : false;
	        constructor.$$super = baseProt;
	        constructor.$$orig = {
	            constructor: constructor
	        };
	        constructor.$$constrFn = constrFn;
	        constructorClosure.constructor = constructor;
	        prototypes && constructor.mergePrototypes(prototypes, true);
	        return constructor;
	    }

	});

	Classes = {};

	/**
	 * Base properties for every Class
	 *
	 *
	 * @property BASE_MEMBERS
	 * @type Object
	 * @protected
	 * @since 0.0.1
	*/
	BASE_MEMBERS = {
	    /**
	     * Transformed from `destroy` --> when `destroy` gets invoked, the instance will invoke `_destroy` through the whole chain.
	     * Defaults to `NOOP`, so that it can be always be invoked.
	     *
	     * @method _destroy
	     * @private
	     * @chainable
	     * @since 0.0.1
	     */
	    _destroy: NOOP,

	    /**
	     * Transformed from `destroy` --> when `destroy` gets invoked, the instance will invoke `_destroy` through the whole chain.
	     * Defaults to `NOOP`, so that it can be always be invoked.
	     *
	     * @method afterInit
	     * @private
	     * @chainable
	     * @since 0.0.1
	     */
	    afterInit: NOOP,

	    /**
	     * Calls `_destroy` on through the class-chain on every level (bottom-up).
	     * _destroy gets defined when the itag defines `destroy` --> transformation under the hood.
	     *
	     * @method destroy
	     * @param [notChained=false] {Boolean} set this `true` to prevent calling `destroy` up through the chain
	     * @chainable
	     * @since 0.0.1
	     */
	    destroy: function destroy(notChained) {
	        var instance = this,
	            _superDestroy;
	        if (!instance._destroyed) {
	            _superDestroy = function superDestroy(constructor) {
	                // don't call `hasOwnProperty` directly on obj --> it might have been overruled
	                Object.prototype.hasOwnProperty.call(constructor.prototype, '_destroy') && constructor.prototype._destroy.call(instance);
	                if (!notChained && constructor.$$super) {
	                    instance.__classCarier__ = constructor.$$super.constructor;
	                    _superDestroy(constructor.$$super.constructor);
	                }
	            };
	            // instance.detachAll();  <-- is what Event will add
	            // instance.undefAllEvents();  <-- is what Event will add
	            _superDestroy(instance.constructor);
	            protectedProp(instance, '_destroyed', true);
	        }
	        return instance;
	    }
	};

	coreMethods = Classes.coreMethods = {
	    /**
	     * Returns the instance, yet sets an internal flag to a higher Class (1 level up)
	     *
	     * @property $super
	     * @chainable
	     * @for BaseClass
	     * @since 0.0.1
	    */
	    $super: {
	        get: function get() {
	            var instance = this;
	            instance.__classCarier__ || (instance.__classCarier__ = instance.__methodClassCarier__);
	            instance.__$superCarierStart__ || (instance.__$superCarierStart__ = instance.__classCarier__);
	            instance.__classCarier__ = instance.__classCarier__ && instance.__classCarier__.$$super.constructor;
	            return instance;
	        }
	    },

	    /**
	     * Calculated value of the specified member at the parent-Class.
	     *
	     * @method $superProp
	     * @return {Any}
	     * @since 0.0.1
	    */
	    $superProp: {
	        configurable: true,
	        writable: true,
	        value: function value() /* member, *args */{
	            var instance = this,
	                classCarierReturn = instance.__$superCarierStart__ || instance.__classCarier__ || instance.__methodClassCarier__,
	                currentClassCarier = instance.__classCarier__ || instance.__methodClassCarier__,
	                args = arguments,
	                superClass,
	                superPrototype,
	                firstArg,
	                returnValue;

	            instance.__$superCarierStart__ = null;
	            if (args.length === 0) {
	                instance.__classCarier__ = classCarierReturn;
	                return;
	            }

	            superClass = currentClassCarier.$$super.constructor, superPrototype = superClass.prototype, firstArg = Array.prototype.shift.apply(args); // will decrease the length of args with one
	            if (firstArg === 'constructor' && currentClassCarier.$$chainConstructed) {
	                console.warn('the constructor of this Class cannot be invoked manually, because it is chainConstructed');
	                return currentClassCarier;
	            }
	            if (typeof superPrototype[firstArg] === 'function') {
	                instance.__classCarier__ = superClass;
	                returnValue = superPrototype[firstArg].apply(instance, args);
	            }
	            instance.__classCarier__ = classCarierReturn;
	            return returnValue !== undefined ? returnValue : superPrototype[firstArg];
	        }
	    },

	    /**
	     * Invokes the original method (from inside where $orig is invoked).
	     * Any arguments will be passed through to the original method.
	     *
	     * @method $orig
	     * @return {Any}
	     * @since 0.0.1
	    */
	    $orig: {
	        configurable: true,
	        writable: true,
	        value: function value() {
	            var instance = this,
	                classCarierReturn = instance.__$superCarierStart__,
	                currentClassCarier = instance.__classCarier__ || instance.__methodClassCarier__,
	                args = arguments,
	                propertyName = instance.__origProp__,
	                returnValue,
	                origArray,
	                orig,
	                item;

	            instance.__$superCarierStart__ = null;

	            origArray = currentClassCarier.$$orig[propertyName];

	            instance.__origPos__ || (instance.__origPos__ = []);

	            // every class can have its own overruled $orig for even the same method
	            // first: seek for the item that matches propertyName/classRef:
	            instance.__origPos__.some(function (element) {
	                if (element.propertyName === propertyName && element.classRef === currentClassCarier) {
	                    item = element;
	                }
	                return item;
	            });

	            if (!item) {
	                item = {
	                    propertyName: propertyName,
	                    classRef: currentClassCarier,
	                    position: origArray.length - 1
	                };
	                instance.__origPos__.push(item);
	            }
	            if (item.position === 0) {
	                return undefined;
	            }
	            item.position--;
	            orig = origArray[item.position];
	            if (typeof orig === 'function') {
	                instance.__classCarier__ = currentClassCarier;
	                returnValue = orig.apply(instance, args);
	            }
	            instance.__classCarier__ = classCarierReturn;

	            item.position++;

	            return returnValue !== undefined ? returnValue : orig;
	        }
	    }
	};

	/**
	* Creates the base Class: the highest Class in the hierarchy of all Classes.
	* Will get extra properties merge into its prototype, which leads into the formation of `BaseClass`.
	*
	* @method createBaseClass
	* @protected
	* @return {Class}
	* @for Classes
	* @since 0.0.1
	*/
	createBaseClass = function createBaseClass() {
	    var InitClass = function InitClass() {};
	    return Function.prototype.subClass.apply(InitClass, arguments);
	};

	/**
	 * The base BaseClass: the highest Class in the hierarchy of all Classes.
	 *
	 * @property BaseClass
	 * @type Class
	 * @since 0.0.1
	*/
	protectedProp(Classes, 'BaseClass', createBaseClass().mergePrototypes(BASE_MEMBERS, true, {}, {}));

	// because `mergePrototypes` cannot merge object-getters, we will add the getter `$super` manually:
	Object.defineProperties(Classes.BaseClass.prototype, coreMethods);

	/**
	 * Returns a base class with the given constructor and prototype methods
	 *
	 * @method createClass
	 * @param [constructor] {Function} constructor for the class
	 * @param [prototype] {Object} Hash map of prototype members of the new class
	 * @return {Class} the new class
	*/
	protectedProp(Classes, 'createClass', Classes.BaseClass.subClass.bind(Classes.BaseClass));

	module.exports = Classes;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	__webpack_require__(11);
	__webpack_require__(26);

	module.exports = function (WINDOW) {

	    var NUMBER = 'number',
	        PX = 'px',
	        ABSOLUTE = 'absolute',
	        utils = __webpack_require__(1),
	        later = utils.later,
	        async = utils.async,
	        STYLE_NODES = {},
	        HTML5_NODES_VALUES = {},
	        TIMERS = {},
	        CLEANUP_TIMER = 60000,
	        // cleanup old css definitions every 10 seconds
	    DOCUMENT = WINDOW.document,
	        HEAD = DOCUMENT.head,
	        BODY = DOCUMENT.body,
	        BORDER = 'border',
	        WIDTH = 'width',
	        BORDER_LEFT_WIDTH = BORDER + '-left-' + WIDTH,
	        BORDER_TOP_WIDTH = BORDER + '-top-' + WIDTH,
	        MARGIN_ = 'margin-',
	        LEFT = 'left',
	        RIGHT = 'right',
	        TOP = 'top',
	        BOTTOM = 'bottom',
	        MARGIN_LEFT = MARGIN_ + LEFT,
	        MARGIN_RIGHT = MARGIN_ + RIGHT,
	        MARGIN_TOP = MARGIN_ + TOP,
	        MARGIN_BOTTOM = MARGIN_ + BOTTOM,
	        BROWSER_SUPPORTS_HTML5;

	    // first: check supprt for HTML5 transform:
	    var checkHTML5Support = function checkHTML5Support() {
	        var node = DOCUMENT.createElement('div'),
	            supportsHTML5;
	        node.setAttribute('style', 'position: absolute; z-index: -1; opacity: 0; width: 0; height: 0; left: 0; transform: translateX(-10px);');
	        BODY.appendChild(node);
	        supportsHTML5 = !!node.itsa_left;
	        BODY.removeChild(node);
	        return supportsHTML5;
	    };

	    BROWSER_SUPPORTS_HTML5 = checkHTML5Support();

	    var applyCss = function applyCss(tagName, dragId, css, dragEnd, clonedNode, reverseCloned) {
	        var selector = cssString = tagName + '[data-draggable="' + dragId + '"]',
	            cssId = dragId,
	            cssString,
	            stylenode,
	            stylenodeOriginal,
	            cssOriginalId,
	            selectorOriginal;

	        if (clonedNode) {
	            if (reverseCloned) {
	                cssOriginalId = cssId + '#proxy_original';
	                if (typeof reverseCloned === 'string') {
	                    // grouped drag
	                    selectorOriginal = tagName + '[data-draggable-group="' + reverseCloned + '"]:not(.itsacss-cloned-node)';
	                } else {
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
	                } else {
	                    STYLE_NODES[cssOriginalId].textContent = selectorOriginal + ' {\nopacity: 0.6;filter: alpha(opacity=60);}';
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
	            TIMERS[cssId] = later(function () {
	                if (!DOCUMENT.itsa_getElement(selector)) {
	                    TIMERS[cssId].cancel();
	                    delete TIMERS[cssId];
	                    delete STYLE_NODES[cssId];
	                    HEAD.removeChild(stylenode);
	                }
	            }, CLEANUP_TIMER, true);
	        }
	        css.itsa_each(function (value, prop) {
	            cssString += prop + ':' + value + ' !important;\n';
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
	    var setXY = function setXY(node, x, y, dragEnd, transitioned) {
	        var dragId = node && node.getAttribute && node.getAttribute('data-draggable'),
	            xtrans = (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === NUMBER,
	            ytrans = (typeof y === 'undefined' ? 'undefined' : _typeof(y)) === NUMBER,
	            tagName;

	        if (dragId && (xtrans || ytrans)) {
	            x || (x = 0);
	            y || (y = 0);
	            tagName = node.tagName.toLowerCase();
	            // note that with proxy node, we will have to use dragging without transition
	            if (BROWSER_SUPPORTS_HTML5 && !node._isCloned) {
	                setXyHtml5(node, tagName, dragId, x, y, dragEnd);
	            } else {
	                setXyNoHtml5(node, tagName, dragId, x, y, xtrans, ytrans, dragEnd, transitioned);
	            }
	        }
	    };

	    var cleanCss = function cleanCss(css) {
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
	    var setXyNoHtml5 = function setXyNoHtml5(node, tagName, dragId, x, y, xtrans, ytrans, dragEnd, transitioned) {
	        var css, difx, dify, position, prevCSs, cssId;

	        if (transitioned) {
	            // backup the current css --> we need to set it later
	            cssId = dragId;
	            node._isCloned && (cssId += '#cloned');
	            prevCSs = STYLE_NODES[cssId] ? STYLE_NODES[cssId].textContent : '';
	        }
	        position = node.itsa_getStyle('position');
	        // make sure it has sizes and can be positioned
	        // default position to relative
	        css = {
	            position: position === ABSOLUTE ? ABSOLUTE : 'relative',
	            opacity: '0',
	            transition: 'none !important',
	            'touch-action': 'none',
	            'box-sizing': 'border-box',
	            left: x + PX,
	            top: y + PX
	        };

	        // make sure it can be set by enable it in the dom:
	        if (node.itsa_getInlineStyle('display') === 'none') {
	            css.display = 'block';
	        }

	        applyCss(tagName, dragId, css, dragEnd, node._isCloned);

	        // maybe redo when there is a difference
	        // between the set value and the true value (which could appear due to a parent node with `position` === 'absolute')
	        if (xtrans) {
	            difx = node.itsa_left - x;
	            difx !== 0 && (css.left = x - difx + PX);
	        }
	        if (ytrans) {
	            dify = node.itsa_top - y;
	            dify !== 0 && (css.top = y - dify + PX);
	        }
	        (difx || dify) && applyCss(tagName, dragId, css, dragEnd, node._isCloned);

	        if (transitioned) {
	            // reset the css, because we need to transition the new position
	            STYLE_NODES[cssId].textContent = prevCSs;
	            async(function () {
	                addClass(node, 'itsacss-drag-revert-trans');
	                css = cleanCss(css);
	                applyCss(tagName, dragId, css, dragEnd, node._isCloned, node._isReverseCloned);
	            });
	        } else {
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
	    var setXyHtml5 = function setXyHtml5(node, tagName, dragId, x, y, dragEnd) {
	        var prevCoordinates = HTML5_NODES_VALUES[dragId],
	            css,
	            prevX,
	            prevY,
	            newX,
	            newY;

	        // make sure it has sizes and can be positioned
	        // note: because we transform, we need to correct the x,y with the node's x,y position
	        // also, correct for previous values
	        if (prevCoordinates) {
	            prevX = prevCoordinates.x;
	            prevY = prevCoordinates.y;
	        } else {
	            prevX = 0;
	            prevY = 0;
	        }
	        newX = x - node.itsa_left + prevX;
	        newY = y - node.itsa_top + prevY;
	        HTML5_NODES_VALUES[dragId] = {
	            x: newX,
	            y: newY
	        };
	        css = {
	            transform: 'translate(' + newX + PX + ', ' + newY + PX + ')',
	            transition: 'none',
	            'touch-action': 'none'
	        };
	        applyCss(tagName, dragId, css, dragEnd, node._isCloned, node._isReverseCloned);
	    };

	    var addClass = function addClass(node, className) {
	        var doSet = function doSet(cl) {
	            var clName = node.getAttribute('class') || '',
	                clNameSplitted = clName.split(' ');
	            clNameSplitted.itsa_contains(cl) || node.setAttribute('class', clName + (clName ? ' ' : '') + cl);
	        };
	        if (typeof className === 'string') {
	            doSet(className);
	        } else if (Array.isArray(className)) {
	            className.forEach(doSet);
	        }
	    };

	    var removeClass = function removeClass(node, className) {
	        var doRemove = function doRemove(cl) {
	            var clName = node.getAttribute('class') || '',
	                regexp = new RegExp('(?:^|\\s+)' + cl + '(?:\\s+|$)', 'g');
	            node.setAttribute('class', clName.replace(regexp, ' ').itsa_trim());
	        };
	        if (typeof className === 'string') {
	            doRemove(className);
	        } else if (Array.isArray(className)) {
	            className.forEach(doRemove);
	        }
	    };

	    var transitionTo = function transitionTo(node, x, y, constrainNode) {
	        var marginLeft, marginTop, marginRight, marginBottom, constrainX, constrainY, constrain;
	        if (constrainNode) {
	            marginLeft = parseInt(constrainNode.itsa_getStyle(MARGIN_LEFT), 10);
	            marginTop = parseInt(constrainNode.itsa_getStyle(MARGIN_TOP), 10);
	            marginRight = parseInt(constrainNode.itsa_getStyle(MARGIN_RIGHT), 10);
	            marginBottom = parseInt(constrainNode.itsa_getStyle(MARGIN_BOTTOM), 10);
	            constrainX = constrainNode.itsa_left - constrainNode.scrollLeft + parseInt(constrainNode.itsa_getStyle(BORDER_LEFT_WIDTH), 10) + marginLeft;
	            constrainY = constrainNode.itsa_top - constrainNode.scrollTop + parseInt(constrainNode.itsa_getStyle(BORDER_TOP_WIDTH), 10) + marginTop;
	            constrain = {
	                x1: constrainX,
	                y1: constrainY,
	                x2: constrainX + Math.min(constrainNode.scrollWidth, constrainNode.offsetWidth) - node.offsetWidth - marginLeft - marginRight,
	                y2: constrainY + Math.min(constrainNode.scrollHeight, constrainNode.offsetHeight) - node.offsetHeight - marginTop - marginBottom
	            };
	            x = Math.min(Math.max(constrain.x1, x), constrain.x2);
	            y = Math.min(Math.max(constrain.y1, y), constrain.y2);
	        }
	        if (!node._isCloned && BROWSER_SUPPORTS_HTML5) {
	            // will use setXyHtml5: we can set the transition class:
	            addClass(node, 'itsacss-drag-revert-trans');
	        }
	        setXY(node, x, y, false, true);
	        return new Promise(function (resolve) {
	            later(function () {
	                removeClass(node, 'itsacss-drag-revert-trans');
	                resolve();
	            }, 300);
	        });
	    };

	    return {
	        addClass: addClass,
	        removeClass: removeClass,
	        setXY: setXY,
	        transitionTo: transitionTo
	    };
	};

/***/ })
/******/ ]);