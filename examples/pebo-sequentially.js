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

// Emit the event
console.log('Before emitting');
console.time('fire');
mario.fireSequentially('regina', 'Ingredients:', [])
.then(args => {
  // Let's see what we've got now
  console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
  console.timeEnd('fire');
  console.log();

  // Emit the event and execute listeners concurrently
  console.log('Before emitting concurrently');
  console.time('fireConcurrently');
  mario.fire('regina', 'Ingredients:', [])
  .then(args => {
    // Let's see what we've got now
    console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
    console.timeEnd('fireConcurrently');
  });
});
