'use strict';

// Let's create a Pebo event emitter
const Pebo = require('..');
class MyEmitter extends Pebo {}
const myEmitter = new MyEmitter();

// We associate various listener to our emitter
// All of them execute asynchronous code
myEmitter.when('event', function a(primitive, collector) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log('Inside async listener A');
      primitive += 'a';
      collector.push('a');
      resolve([primitive, collector]);
    }, 100);
  });
});

myEmitter.when('event', function c(primitive, collector) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log('Inside async listener B');
      primitive += 'b';
      collector.push('b');
      resolve([primitive, collector]);
    }, 500);
  });
});

myEmitter.when('event', function b(primitive, collector) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      console.log('Inside async listener C');
      primitive += 'c';
      collector.push('c');
      resolve([primitive, collector]);
    }, 200);
  });
});

// We prepare some data that will be passed to the event
let primitiveType = 'my-string-';
let objectType = [];

// Emit the event
console.log('Before emitting');
console.time('fire');
myEmitter.fire('event', primitiveType, objectType)
.then(args => {
  // Let's see what we've got now
  console.log('After emitting \n  ', args);
  console.timeEnd('fire');

  // Reinitialize data passed to the event
  primitiveType = 'my-string-';
  objectType = [];
  // Emit the event and execute listeners concurrently
  console.log('Before emitting concurrently');
  console.time('fireConcurrently');
  myEmitter.fireConcurrently('event', primitiveType, objectType)
  .then(args => {
    // Let's see what we've got now
    console.log('After emitting \n  ', args);
    console.timeEnd('fireConcurrently');
  });
});
