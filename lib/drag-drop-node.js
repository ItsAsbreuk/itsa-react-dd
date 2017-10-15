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

var idGenerator = require('itsa-utils').idGenerator;

module.exports = {
    generateId: function() {
        return idGenerator('itsa-dd');
    }
};
