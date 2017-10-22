var isNode = require('itsa-utils').isNode;

module.exports = (isNode && (process.env.NODE_ENV!=='test')) ? require('./lib/drag-drop-node') : require('./lib/drag-drop')(window);
