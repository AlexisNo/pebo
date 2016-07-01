'use strict';

// Let's create a Pebo event emitter
const Pebo = require('..');
class PizzaMaker extends Pebo {}
const pizzaMaker = new PizzaMaker();

// We associate various listener to our emitter
// One of them execute asynchronous code
pizzaMaker.when('margherita', function addMozzarella(primitive, collector) {
  console.log('Inside listener addMozzarella');
  primitive += ' mozzarella';
  collector.push('mozzarella');
  return Promise.resolve([primitive, collector]);
});

pizzaMaker.when('margherita', function addTomato(primitive, collector) {
  console.log('Inside listener addTomato');
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log('Inside listener addTomato (asynchronous)');
      primitive += ' tomato';
      collector.push('tomatoes');
      resolve([primitive, collector]);
    }, 10);
  });
});

pizzaMaker.when('margherita', function addBasil(primitive, collector) {
  console.log('Inside listener addBasil');
  primitive += 'basil';
  collector.push('basil');
  return Promise.resolve([primitive, collector]);
});

// We prepare some data that will be passed to the event
const ingredients = 'Ingredients: ';
const pizza = [];

// Emit a pizza!
console.log('Before emitting');
pizzaMaker.fire('margherita', ingredients, pizza)
.then(args => {
  // Let's see what we've got now
  const ingredients = args[0];
  const pizza = args[1];
  console.log(['After emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));
});
