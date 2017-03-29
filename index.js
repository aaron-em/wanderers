var process = require('process');
var blessed = require('blessed');
var _ = require('lodash');

var Simulation = require('lib/Simulation');

var conf = {
  things: 100,
  rate: 100,
  keys: {
    escape: 'exit',
    q: 'exit',
    'C-c': 'exit',
    space: 'pauseToggle',
    r: 'restart',
    '+': 'faster',
    '-': 'slower'
  },
  screen: {
    smartCSR: true
  },
  stepCounter: {
    left: 0,
    top: '100%-1',
    height: 1,
    width: 'shrink',
    fg: 'black',
    bg: 'white',
    content: ''
  }
};

var sim = new Simulation(conf);
sim.resume();
