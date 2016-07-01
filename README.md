# Pebo

Pebo aims to provide an asynchronous friendly event mechanism.

## How event emitters work

Event emitters call listener functions synchronously. We can pass an object as an argument to an event
and
what if I want to wait for the result of an asynchronous operation?

Let's write a simple example:

```javascript
'use strict';

// Let's create an event emitter like in node's documentation
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// We associate various listener to our emitter
// One of them execute asynchronous code
myEmitter.on('event', function a(primitive, collector) {
  primitive += 'a';
  collector.push('a');
  console.log('Inside the A listener');
});

myEmitter.on('event', function c(primitive, collector) {
  console.log('Inside the B listener');
  setTimeout(function () {
    primitive += 'b';
    collector.push('b');
    console.log('Inside the B listener (asynchronous)');
  }, 10);
});

myEmitter.on('event', function b(primitive, collector) {
  primitive += 'c';
  collector.push('c');
  console.log('Inside the C listener');
});

// We prepare some data that will be passed to the event
const primitiveType = 'my-string-';
const objectType = [];

// Emit!!!
console.log('Before emitting');
myEmitter.emit('event', primitiveType, objectType);

// Let's see what we've got now
console.log('After emitting \n  ', primitiveType, objectType);

// Lets's check again a little later
setTimeout(function () {
  console.log('Inside the asynchronous function \n  ', primitiveType, objectType);
}, 0);

// Lets's check again, again a little later
setTimeout(function () {
  console.log('Inside another asynchronous function \n  ', primitiveType, objectType);
}, 10);
```

Here is the result of the execution:

```text
Before emitting
Inside listener A
Inside listener B
Inside listener C
After emitting
  Parameters: my-string- [ 'a', 'c' ]
Inside an asynchronous function
  Parameters: my-string- [ 'a', 'c' ]
Inside listener B (asynchronous)
Inside another asynchronous function
  Parameters: my-string- [ 'a', 'c', 'b' ]
```

Let's comment it ...

```text
Before emitting

Inside listener A                           // OK, listeners are listening! Functions are called
Inside listener B
Inside listener C

After emitting                              // All listener have been executed synchronously
                                            // but the asynchronous call from listener B has not been executed yet

  Parameters: my-string- [ 'a', 'c' ]       // The first argument passed to the event is a string, it has been passed
                                            // the listeners "by value" and we do not see changes done in the listeners
                                            // The second argument is a array, so its reference has been passed to
                                            // the listeners and we can see changes applied by the listeners

Inside the asynchronous function            // The first setTimeout() call is executed
  Parameters: my-string- [ 'a', 'c' ]       // The data didn't change

Inside the B listener (asynchronous)        // The asynchronous code in the "c" listener is executed now ...

Inside another asynchronous function        // The last setTimeout() call is executed
  Parameters: my-string- [ 'a', 'c', 'b' ]  // Now we can see the changes done by the "B" listener
                                            // but we where never informed about when it happened
```

## How Pebo works

Pebo propose to implement an event emitter based on promises to have access to the data transformed by listeners.

Let's rewrite our example with pebo:

```javascript
// Let's create a Pebo event emitter
const Pebo = require('pebo');
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
```

Here is the result of the execution:

```text
Before emitting
Inside listener A
Inside listener B
Inside listener B (asynchronous)
Inside listener C
After emitting
   my-string-abc [ 'a', 'b', 'c' ]

```

Let's comment it ...

```text
Before emitting

Inside listener A                   // OK, listeners are listening! Functions are called
Inside listener B
Inside listener B (asynchronous)    // The asynchronous function inside listener B is executed  
Inside listener C                   // before the code in listener C

After emitting
   my-string-abc [ 'a', 'b', 'c' ]  // We can see, changes done by all listeners
                                    // We even can see modifications done on the primitive argument
                                    // because its value has been copied between each promise
```

## Alternative usage

Because Pebo execute listeners sequentially, the time to retrieve the data modified may be long.
Indeed, if an event has 3 listeners that execute asynchronous operations that last 100, 200 and 800 ms,
the result will be available only after 800 ms minimum.

If the order of execution does not matter, it would be more efficient to execute listeners concurrently.
Pebo comes with another method to fire these events:  `fireConcurrently()`.

Let's write another example inspired by the first one:

```javascript
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
    console.log('After emitting concurrently\n  ', args);
    console.timeEnd('fireConcurrently');
  });
});
```

Here is the result of the execution:

```text
Before emitting
Inside async listener A
Inside async listener B
Inside async listener C
After emitting
   [ 'my-string-abc', [ 'a', 'b', 'c' ] ]
fire: 811.989ms
Before emitting concurrently
Inside async listener A
Inside async listener C
Inside async listener B
After emitting
   [ 'my-string-a', [ 'a', 'c', 'b' ] ]
fireConcurrently: 501.250ms

```

Let's comment it ...

```text
Before emitting                             // First, we emit the event using fire()
                                            // Listeners will be executed sequentially
Inside async listener A                     // last 100ms
Inside async listener B                     // last 500ms
Inside async listener C                     // last 200ms
After emitting
   [ 'my-string-abc', [ 'a', 'b', 'c' ] ]
fire: 811.989ms                             // The duration of the execution is approximately
                                            // the sum of all listener's execution durations


Before emitting concurrently                // Now, we emit the event using fireConcurrently()
                                            // Listeners will be executed concurrently
Inside async listener A                     // last 100ms
Inside async listener C                     // last 200ms
Inside async listener B                     // last 500ms
After emitting
   [ 'my-string-a', [ 'a', 'c', 'b' ] ]     // The content of the primitive argument is no more reliable
                                            // It has the modification of only one of the listeners
                                            // The content of the second argument correct, but this time
                                            // the alteration of listener C has been applied before liestener B  
fireConcurrently: 501.250ms                 // The duration of the execution is approximately
                                            // the duration of the longest listener
```
