'use strict';

// Let's create a Pebo event emitter
const Pebo = require('..');
class MyEmitter extends Pebo {}
const myEmitter = new MyEmitter();

// We associate various listener to our emitter
// One of them execute asynchronous code
myEmitter.when('event', function a(primitive, collector) {
  console.log('Inside listener A');
  primitive += 'a';
  collector.push('a');
  return Promise.resolve([primitive, collector]);
});

myEmitter.when('event', function c(primitive, collector) {
  console.log('Inside listener B');
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log('Inside listener B (asynchronous)');
      primitive += 'b';
      collector.push('b');
      resolve([primitive, collector]);
    }, 10);
  });
});

myEmitter.when('event', function b(primitive, collector) {
  console.log('Inside listener C');
  primitive += 'c';
  collector.push('c');
  return Promise.resolve([primitive, collector]);
});

// We prepare some data that will be passed to the event
const primitiveType = 'my-string-';
const objectType = [];

// Emit!!!
console.log('Before emitting');
myEmitter.fire('event', primitiveType, objectType)
.then(args => {
  // Let's see what we've got now
  console.log('After emitting \n  ', args[0], args[1]);
});
