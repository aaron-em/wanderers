/* jshint esversion: 6 */

var THING_COUNT=100;

var process = require('process');
var blessed = require('blessed');

var scr = blessed.screen({
  smartCSR: true
});

var stepCounter = blessed.box({
  left: 0,
  top: '100%-1',
  height: 1,
  width: 'shrink',
  fg: 'black',
  bg: 'white',
  content: ''
});
stepCounter.setBack();
scr.append(stepCounter);

var rate = 100;
var things = [];
var stepCount = -1;

var randPct = function() {
  return Math.floor(Math.random() * 100) + '%';
};

var randN = function(max) {
  max = max || Math.pow(2, 32);
  var n = -1;
  while (n < 0)
    n = Math.floor(Math.random() * max);
  return n;
};

var range = function(n) {
  var r = [];
  for (var i = 0; i < n; i++) { r.push(i); };
  return r;
};

var randColor = function() {
  return '#' + range(3).
    map(function() {
      var n = 0;
      while (n < 127)
        n = Math.floor(Math.random() * 256);
      return n.toString(16);
    })
    .join('');
};

scr.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

scr.key(['space'], () => makeThings(scr));
scr.on('resize', () => makeThings(scr));

scr.key('+', function() {
  if (rate <= 10) return;
  rate /= 2;
});

scr.key('-', function() {
  rate *= 2;
});

function cond() {
  var done;
  var args = [].slice.call(arguments);
  args
    .forEach(function(t, i) {
      if (done || i % 2) return;
      if (t === true || t()) done = i + 1;
    });
  return args[done];
};

function makeThings(target) {
  things.forEach(function(thing) {
    target.remove(thing.element);
  });

  things = [];
  stepCount = -1;
  
  for (var i = 0; i < THING_COUNT; i++) {
    /* jshint -W083 */ // (don't make functions in a loop; this is an IIFE)
    (function() {
      var color = randColor();
      var faction = color
            .slice(1)
            .split(/(..)/)
            .filter((s) => (s !== ''))
            .map((s, i) => ([i, parseInt(s, 16)]))
            .sort((m, n) => (n[1] > m[1]))[0][0];
      var factionColor = cond(() => faction === 0, 'red',
                              () => faction === 1, 'green',
                              () => faction === 2, 'blue');
      var factionColorHex = cond(() => faction === 0, '#400000',
                                 () => faction === 1, '#004000',
                                 () => faction === 2, '#000040');
      var left = randN(target.width);
      var top = randN(target.height);
      
      things.push({
        x: left,
        y: top,
        last: {x:null, y:null},
        faction: faction,
        element: blessed.text({
          left: left,
          top: top,
          width: 1,
          height: 1,
          fg: color,
          bg: factionColorHex,
          content: '#'
        })});
    })();
  };

  things
    .map((t) => t.element)
    .forEach(target.append.bind(target));

  runThings(target, things);
};

function runThings(target, things) {
  var step = function() {
    stepCounter.setContent((++stepCount).toString()
                           + ' @'+ 1/(1000/rate));
    things = updateThings(target, things);
    target.render();
    global.setTimeout(step, rate);
  };

  step();
};

function updateThings(target, things) {
  return things
    .map(function(thing) {
      return moveThing(pickMove, target, things, thing);
    });
};

var moveThing = function(move, target, things, thing) {
  var candidate = move(things, thing);

  candidate.x = (thing.x + candidate.Δx) % target.width;
  candidate.x = (candidate.x < 0 && target.width + candidate.x)
    || candidate.x;
  
  candidate.y = (thing.y + candidate.Δy) % target.height;
  candidate.y = (candidate.y < 0 && target.height + candidate.y)
    || candidate.y;

  if (isTrivial(candidate)) return thing;
  candidate.x = Math.round(candidate.x);
  candidate.y = Math.round(candidate.y);
  
  if (isOpenSpace(candidate, things) && !isBackstep(candidate, thing)) {
    applyMove(candidate, thing);
  };
  return thing;
};

function pickMove(things, thing) {
  var chance = Math.random();
  return cond(() => chance < 0.9, moves.approachFaction,
              true, moves.random)(things, thing);
};

var isTrivial = function(candidate) {
  return (Math.abs(candidate.x) < 0.5 && Math.abs(candidate.y) < 0.5);
};

var isBackstep = function(candidate, thing) {
  return (thing.last.x === null && thing.last.y === null)
    ? false
    : ((candidate.x === thing.last.x)
        && (candidate.y === thing.last.y));
};

var isOpenSpace = function(candidate, things) {
  return things
    .every((t) => !(candidate.x === t.x && candidate.y === t.y));
};

var applyMove = function(candidate, thing) {
  thing.last.x = thing.x;
  thing.last.y = thing.y;
  thing.x = candidate.x;
  thing.y = candidate.y;
  thing.element.left = thing.x;
  thing.element.top = thing.y;
};

var moves = {
  approachFaction: function(things, thing) {
    var mates = things
          .filter((t) => t.faction === thing.faction);
    var aliens = things
          .filter((t) => t.faction !== thing.faction);
    
    var nearMate = mates
          .map((m) => [m, dist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];
    var nearAlien = aliens
          .map((m) => [m, dist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];

    var near = ((nearMate[1] * 1) < (nearAlien[1] * 2)
                ? nearMate
                : nearAlien);
    var nearDist = near[1];
    near = near[0];
    
    var dir = (nearMate[1] < nearAlien[1] ? 1 : -1);
    
    return {
      Δx: (nearDist > 1 && (near.x > thing.x ? 1*dir : -1*dir)) || 0,
      Δy: (nearDist > 1 && (near.y > thing.y ? 1*dir : -1*dir)) || 0
    };
  },
  
  findOwnFaction: function(things, thing) {
    var mates = things
          .filter((t) => t.faction === thing.faction);
    var near = mates
          .map((m) => [m, dist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];
    var nearDist = near[1];
    near = near[0];
    
    return {
      Δx: (nearDist > 1 && (near.x > thing.x ? 1 : -1)) || 0,
      Δy: (nearDist > 1 && (near.y > thing.y ? 1 : -1)) || 0
    };
  },

  avoidOtherFactions: function(things, thing) {
    var aliens = things
          .filter((t) => t.faction !== thing.faction);
    var near = aliens
          .map((m) => [m, dist([m.x, m.y], [thing.x, thing.y])])
          .sort((m, n) => (m[1] < n[1]))[0];
    return {
      Δx: (near.x > thing.x ? -1 : 1) || 0,
      Δy: (near.y > thing.y ? -1 : 1) || 0
    };
  },

  shiftRight: function(things, thing) {
    return {
      Δx: 1,
      Δy: 0
    };
  },

  random: function(things, thing) {
    return {
      Δx: randN(3) - 1,
      Δy: randN(3) - 1
    };
  }
};

var dist = function(p1, p2) {
  return Math.sqrt(Math.pow(p2[0] - p1[0], 2)
                   + Math.pow(p2[1] - p1[1], 2));
};

makeThings(scr);
