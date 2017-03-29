var cond = require('lib/cond');

var _ = require('lodash');

module.exports = {
  roundTo: function(n, figs) {
    figs = Math.pow(10, figs);
    return Math.round(n*figs)/figs;
  },
  
  randN: function(max) {
    max = max || Math.pow(2, 32);
    var n = -1;
    while (n < 0)
      n = Math.floor(Math.random() * max);
    return n;
  },

  randColor: function() {
    return '#' + _.range(3).
      map(function() {
        var n = 0;
        while (n < 127)
          n = Math.floor(Math.random() * 256);
        return n.toString(16);
      })
      .join('');
  },

  // Which RGB element is most intense?
  // #abcdef => 2, #efabcd => 0, ...
  factionFor: function(color) {
    return color
      .slice(1)
      .split(/(..)/)
      .filter((s) => (s !== ''))
      .map((s, i) => ([i, parseInt(s, 16)]))
      .sort((m, n) => (n[1] > m[1]))[0][0];
  },

  factionColorFor: function(faction) {
    return cond(() => faction === 0, '#400000',
                () => faction === 1, '#004000',
                () => faction === 2, '#000040',
                true, '#000000');
  },

  euclDist: function(p1, p2) {
    return Math.sqrt(Math.pow(p2[0] - p1[0], 2)
                     + Math.pow(p2[1] - p1[1], 2));
  }
};
