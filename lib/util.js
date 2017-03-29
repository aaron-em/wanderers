var cond = require('lib/cond');

var _ = require('lodash');

module.exports = {
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
  }
};