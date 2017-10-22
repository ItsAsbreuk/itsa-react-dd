
var isNode = require('itsa-utils').isNode,
    globalObj = isNode ? global : window;

globalObj['itsa_dd'] = require('./index');
