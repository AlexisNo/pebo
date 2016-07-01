'use strict';

// Let's create an event emitter
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// We associate various listener to our emitter
// One of them execute asynchronous code
myEmitter.on('event', function a(primitive, collector) {
  primitive += 'a';
  collector.push('a');
  console.log('Inside listener A');
});

myEmitter.on('event', function c(primitive, collector) {
  console.log('Inside listener B');
  setTimeout(function() {
    primitive += 'b';
    collector.push('b');
    console.log('Inside listener B (asynchronous)');
  }, 10);
});

myEmitter.on('event', function b(primitive, collector) {
  primitive += 'c';
  collector.push('c');
  console.log('Inside listener C');
});

// We prepare some data that will be passed to the event
const primitiveType = 'my-string-';
const objectType = [];

// Emit!!!
console.log('Before emitting');
myEmitter.emit('event', primitiveType, objectType);

// Let's see what we've got now
console.log('After emitting \n  ', 'Parameters:', primitiveType, objectType);

// Lets's check again a little later
setTimeout(function() {
  console.log('Inside an asynchronous function \n  ', 'Parameters:', primitiveType, objectType);
}, 0);

// Lets's check again a little later
setTimeout(function() {
  console.log('Inside another asynchronous function \n  ', 'Parameters:', primitiveType, objectType);
}, 20);
