var util = require('lib/util');

module.exports = {
  random: function() {
    return {
      Δx: util.randN(3) - 1,
      Δy: util.randN(3) - 1
    };
  }
};
