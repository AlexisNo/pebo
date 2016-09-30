'use strict';

const actions = require('./pebo-actions');

// Let's create a Pebo event emitter
const Pebo = require('..');
class Pizzaiolo extends Pebo {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

// We associate various listener to our emitter
// Some of them execute asynchronous code
mario.when('regina', actions.addMozzarella)
     .when('regina', actions.addTomatoes)
     .when('regina', actions.addHam)
     .when('regina', actions.addMushrooms);

// Emit a pizza!
console.log('Before emitting');
mario.fireSequentiallyPropagatingResponses('regina', 'Ingredients:', [])
.then(args => {
  // Let's see what we've got now
  console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
});
