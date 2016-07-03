'use strict';

const actions = require('./pebo-actions');

// Let's create a Pebo event emitter
const Pebo = require('..');
class Pizzaiolo extends Pebo {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

// We associate various listener to our emitter
// One of them execute asynchronous code
mario.when('margherita', actions.addMozzarella)
     .when('margherita', actions.addTomatoes)
     .when('margherita', actions.addBasil);

// Emit a pizza!
console.log('Before emitting');
mario.fire('margherita', 'Ingredients:', [])
.then(args => {
  // Let's see what we've got now
  console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
});
