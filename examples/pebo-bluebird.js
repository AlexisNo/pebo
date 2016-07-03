'use strict';

const bluebird = require('bluebird');
const actions = require('./pebo-actions');

// Let's create a Pebo event emitter
const Pebo = require('..');
Pebo.setPromise(bluebird);
class Pizzaiolo extends Pebo {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

// We associate various listener to our emitter
mario.when('margherita', actions.addMozzarella)
     .when('margherita', actions.addTomatoes)
     .when('margherita', actions.addBasil)
     .when('regina', actions.addMozzarella)
     .when('regina', actions.addTomatoes)
     .when('regina', actions.addHam)
     .when('regina', actions.addMushrooms);

// Emit a pizza!
console.log('Before emitting');
mario.fire('margherita', 'Ingredients:', [])
.spread((ingredients, pizza) => {
  /* *******************************************************************************************************
   * Promise.spread() is not implemented in ES6 Promises, but you can use it by injecting bluebird in Pebo
   * *******************************************************************************************************/
  console.log(['After emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));
  return mario.fireConcurrently('regina', 'Ingredients:', []);
})
.spread((ingredients, pizza) => {
  console.log(['After emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));
});
