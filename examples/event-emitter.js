'use strict';
const actions = require('./event-emitter-actions');

// Let's create an event emitter
const EventEmitter = require('events');
class Pizzaiolo extends EventEmitter {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

// We associate various listener to our emitter
// Some of them execute asynchronous code
mario.on('regina', actions.addMozzarella)
     .on('regina', actions.addTomatoes)
     .on('regina', actions.addHam)
     .on('regina', actions.addMushrooms);

// We prepare some data that will be passed to the event
const ingredients = 'Ingredients: ';
const pizza = [];

// Emit a pizza!
console.log('Before emitting');
mario.emit('regina', ingredients, pizza);

// Let's see what we've got now
console.log(['After emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));

// Let's check again a little later
setTimeout(function() {
  console.log(['Later after emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));
}, 100);
