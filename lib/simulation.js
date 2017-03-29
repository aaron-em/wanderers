var util = require('lib/util');
var cond = require('lib/cond');

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

Simulation.prototype.cleanup = function() {
  var self = this;
  
  if (this.state.running)
    return false;
  
  this.state.things
    .forEach((thing) => self.screen.remove(thing.element));

  return true;
};

Simulation.prototype.resume = function() {
  this.state.running = true;
  this.screen.render();
  
  return true;
};

Simulation.prototype.pause = function() {
  this.state.running = false;

  return true;
};

Simulation.prototype.step = function() {

  return true;
};

module.exports = Simulation;

handlers = {
  exit: () => process.exit(0),
  restart: function() {
    this.init();
    this.resume();
  }
};
