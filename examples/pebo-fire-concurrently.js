'use strict';

// Let's create a Pebo event emitter
const Pebo = require('..');
class PizzaMaker extends Pebo {}
const pizzaMaker = new PizzaMaker();

// We associate various listener to our emitter
// Some of them execute asynchronous code
pizzaMaker.when('regina', function addMozzarella(primitive, collector) {
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
    }, 300);
  });
});

pizzaMaker.when('regina', function addHam(primitive, collector) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log('Inside async listener addHam');
      primitive += 'ham';
      collector.push('ham');
      resolve([primitive, collector]);
    }, 500);
  });
});

pizzaMaker.when('regina', function addMushrooms(primitive, collector) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log('Inside async listener addMushrooms');
      primitive += 'mushrooms';
      collector.push('mushrooms');
      resolve([primitive, collector]);
    }, 400);
  });
});

// We prepare some data that will be passed to the event
let ingredients = 'Ingredients: ';
let pizza = [];

// Emit the event
console.log('Before emitting');
console.time('fire');
pizzaMaker.fire('regina', ingredients, pizza)
.then(args => {
  // Let's see what we've got now
  console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
  console.timeEnd('fire');
  console.log();

  // Reinitialize data passed to the event
  ingredients = 'Ingredients: ';
  pizza = [];
  // Emit the event and execute listeners concurrently
  console.log('Before emitting concurrently');
  console.time('fireConcurrently');
  pizzaMaker.fireConcurrently('regina', ingredients, pizza)
  .then(args => {
    // Let's see what we've got now
    console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
    console.timeEnd('fireConcurrently');
  });
});
