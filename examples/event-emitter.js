'use strict';

// Let's create an event emitter
const EventEmitter = require('events');
class PizzaMaker extends EventEmitter {}
const pizzaMaker = new PizzaMaker();

// We associate various listener to our emitter
// One of them execute asynchronous code
pizzaMaker.on('margherita', function addMozzarella(primitive, collector) {
  console.log('Inside listener addMozzarella');
  primitive += ' mozzarella';
  collector.push('mozzarella');
});

pizzaMaker.on('margherita', function addTomato(primitive, collector) {
  console.log('Inside listener addTomato');
  setTimeout(function() {
    console.log('Inside listener addTomato (asynchronous)');
    primitive += ' tomato';
    collector.push('tomatoes');
  }, 10);
});

pizzaMaker.on('margherita', function addBasil(primitive, collector) {
  console.log('Inside listener addBasil');
  primitive += 'basil';
  collector.push('basil');
});

// We prepare some data that will be passed to the event
const ingredients = 'Ingredients: ';
const pizza = [];

// Emit a pizza!
console.log('Before emitting');
pizzaMaker.emit('margherita', ingredients, pizza);

// Let's see what we've got now
console.log(['After emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));

// Lets's check again a little later
setTimeout(function() {
  console.log(['Check a little later', ingredients, JSON.stringify(pizza)].join('\n  -'));
}, 0);

// Lets's check again a little later
setTimeout(function() {
  console.log(['Check a little later again', ingredients, JSON.stringify(pizza)].join('\n  -'));
}, 20);
