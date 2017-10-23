var isNode = require('itsa-utils').isNode;

module.exports = isNode ? require('./lib/drag-drop-node') : require('./lib/drag-drop')(window);
