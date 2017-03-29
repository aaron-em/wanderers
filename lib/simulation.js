var util = require('lib/util');
var cond = require('lib/cond');
var moves = require('lib/moves');

var blessed = require('blessed');
var _ = require('lodash');

var handlers;

var Simulation = function Simulation(conf) {
  var self = this;
  
  this.config = conf;
  this.defaultState = {
    running: false,
    things: [],
    rate: conf.rate,
    step: 0
  };
  this.state = _.clone(this.defaultState);

  this.screen = blessed.screen(conf.screen);
  this.stepCounter = blessed.box(conf.stepCounter);
  
  Object.keys(conf.keys)
    .forEach(function(key) {
      self.screen.key(key, handlers[conf.keys[key]].bind(self));
    });

  this.stepCounter.setBack();
  this.screen.append(this.stepCounter);

  this.nextStep = null;

  this.init();
};

Simulation.prototype.init = function() {
  var self = this;
  
  this.pause();
  this.cleanup();
  
  this.state = _.clone(this.defaultState);

  for (var i = 0; i < this.config.things; i++) {
    /* jshint -W083 */
    (function() {
      var thing = {
        x: 0,
        y: 0,
        last: {
          x: 0,
          y: 0
        },
        faction: null,
        color: null,
        element: null
      };

      thing.color = util.randColor();
      thing.faction = util.factionFor(thing.color);
      thing.x = util.randN(self.screen.width);
      thing.y = util.randN(self.screen.height);

      thing.element = blessed.text({
        left: thing.x,
        top: thing.y,
        width: 1,
        height: 1,
        content: '#',
        fg: thing.color,
        bg: util.factionColorFor(thing.faction)
      });

      self.screen.append(thing.element);
      self.state.things.push(thing);
    })();
  }
};

Simulation.prototype.update = function() {
  var self = this;

  var getMoveFor = function(thing, moveFn) {
    var candidate = moveFn();
    var target = self.screen;

    candidate.x = (thing.x + candidate.Δx) % target.width;
    candidate.x = (candidate.x < 0 && target.width + candidate.x)
      || candidate.x;
    
    candidate.y = (thing.y + candidate.Δy) % target.height;
    candidate.y = (candidate.y < 0 && target.height + candidate.y)
      || candidate.y;

    candidate.x = Math.round(candidate.x);
    candidate.y = Math.round(candidate.y);
    
    // TODO vet move
    
    return candidate;
  };

  var applyMove = function(move, thing) {
    thing.last.x = thing.x;
    thing.last.y = thing.y;
    thing.x = move.x;
    thing.y = move.y;
    thing.element.left = thing.x;
    thing.element.top = thing.y;
  };
  
  this.state.things.forEach(function(thing) {
    var move = getMoveFor(thing, moves.random);
    return (thing = applyMove(move, thing));
  });
};

Simulation.prototype.cleanup = function() {
  var self = this;
  
  if (this.state.running)
    return false;

  if (this.nextStep) {
    global.clearTimeout(this.nextStep);
    this.nextStep = null;
  };
  
  this.state.things
    .forEach((thing) => self.screen.remove(thing.element));

  return true;
};

Simulation.prototype.resume = function() {
  this.state.running = true;
  this.nextStep = this.step();
  
  return true;
};

Simulation.prototype.pause = function() {
  this.state.running = false;
  if (this.nextStep) {
    global.clearTimeout(this.nextStep);
    this.nextStep = null;
  };

  return true;
};

Simulation.prototype.toggleRunState = function() {
  return this[this.state.running ? 'pause' : 'resume']();
};

Simulation.prototype.step = function() {
  var self = this;
  
  return this.nextStep = global.setTimeout(function() {
    self.stepCounter.setContent((self.state.step++).toString()
                                + ' @' + util.roundTo((1/(1000/self.state.rate)), 3));
    self.update();
    self.screen.render();
    self.nextStep = global.setTimeout(self.step.bind(self), self.state.rate);
  }, this.state.rate);
};

module.exports = Simulation;

handlers = {
  exit: () => process.exit(0),
  pauseToggle: function() {
    this.toggleRunState();
  },
  restart: function() {
    this.init();
    this.resume();
  },
  faster: function() {
    if (this.state.rate < 5) return;
    this.state.rate /= 2;
    this.screen.render();
  },
  slower: function() {
    this.state.rate *= 2;
    this.screen.render();
  }
};
