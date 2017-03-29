var util = require('lib/util');

module.exports = {
  random: function(things, thing, opts) {
    return {
      Δx: util.randN(3) - 1,
      Δy: util.randN(3) - 1
    };
  },

  approachOwnFaction: function(things, thing, opts) {
    var mates = things
          .filter((t) => t.faction === thing.faction);
    var aliens = things
          .filter((t) => t.faction !== thing.faction);
    
    var nearMate = mates
          .map((m) => [m, util.euclDist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];
    var nearAlien = aliens
          .map((m) => [m, util.euclDist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];

    var near = ((nearMate[1] * opts.attraction) < (nearAlien[1] * opts.repulsion)
                ? nearMate
                : nearAlien);
    var dist = near[1];
    near = near[0];
    
    var dir = (nearMate[1] < nearAlien[1] ? 1 : -1);
    
    return {
      Δx: (dist > 1 && (near.x > thing.x ? 1*dir : -1*dir)) || 0,
      Δy: (dist > 1 && (near.y > thing.y ? 1*dir : -1*dir)) || 0
    };
  },

  approachOwnFactionMaybe: function(things, thing, opts) {
    var mates = things
          .filter((t) => t.faction === thing.faction);
    var aliens = things
          .filter((t) => t.faction !== thing.faction);
    
    var nearMate = mates
          .map((m) => [m, util.euclDist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];
    var nearAlien = aliens
          .map((m) => [m, util.euclDist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];

    var near = ((nearMate[1] * opts.attraction) < (nearAlien[1] * opts.repulsion)
                ? nearMate
                : nearAlien);
    var dist = near[1];
    near = near[0];

    var dir = (nearMate[1] < nearAlien[1] ? 1 : -1);
    
    if (thing.faction === opts.extrovertFaction) {
      dir = -dir;
    };
    
    return {
      Δx: (dist > 1 && (near.x > thing.x ? 1*dir : -1*dir)) || 0,
      Δy: (dist > 1 && (near.y > thing.y ? 1*dir : -1*dir)) || 0
    };
  }
};
