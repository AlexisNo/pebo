Pebo
===

[![Build Status](https://travis-ci.org/AlexisNo/pebo.svg?branch=master)](https://travis-ci.org/AlexisNo/pebo)
[![bitHound Overall Score](https://www.bithound.io/github/AlexisNo/pebo/badges/score.svg)](https://www.bithound.io/github/AlexisNo/pebo)
[![bitHound Dependencies](https://www.bithound.io/github/AlexisNo/pebo/badges/dependencies.svg)](https://www.bithound.io/github/AlexisNo/pebo/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/AlexisNo/pebo/badges/code.svg)](https://www.bithound.io/github/AlexisNo/pebo)
[![codecov](https://codecov.io/gh/AlexisNo/pebo/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexisNo/pebo)

Pebo is a small JavaScript module that aims to provide an asynchronous friendly event mechanism.

Usage
---

```bash
npm install pebo --save
```

```javascript
// create a Pebo event emitter
const Pebo = require('pebo');
emitter = new Pebo();

// add listeners to an event
// a listener must return an Array containing the event arguments (eventually modified)
emitter.when('myEvent', (arg1, arg2) => {
  // alter arg1 and arg2 here
  arg1.changed = true;
  return [arg1, arg2];
});

// a listener can execute asynchronous code an return the Promise of an Array containing the event arguments (eventually modified)
emitter.when('myEvent', (arg1, arg2) => {
  // We create a Promise manually, but in a real use case, you will probably use Promises from the libraries you
  return new Promise((resolve, reject) => {
    // setTimeout() is used to give an example of asynchronous execution
    setTimeout(() => {
      // alter arg1 and arg2 here
      arg2.newAttribute = 'value';
      resolve([arg1, arg2]);
    }, 100);
  });
});

// emit a event and return a Promise of a array containing the event arguments, eventually modified by listeners
// in this example, we pass two objects as arguments
emitter.fire('myEvent', { changed: false }, {})
.then(args => {
  // access the arguments eventually modified by sync or async listeners
  console.log(args);
  // [ { changed: true }, { newAttribute: 'value' } ]
});
```

Why would I want to use Pebo instead of EventEmitter?
---

It depends on what you want to do with events, if you want to wait for the end of asynchronous operations before continuing the
execution and if you are interested in retrieving the result of listener Functions (more precisely, the alterations they should
apply to the event arguments).

Pebo is inspired by Node.js EventListener but it **returns a `Promise` that resolves when all listeners executions are done**
and the portion of code firing an event can have **access to the modified arguments**. That mean a Pebo listener that executes asynchronous
code should return a `Promise`.

The following sections use the example of a `Pizzaiolo` event emitter that makes pizzas. When a pizzaiolo "emits" a certain type of pizza,
some actions must be called like `addMozzarella()`, `addTomatoes()`, `addHam()` etc. Some actions may execute asynchronous code.

### How EventEmitter works

From [the Node.js documentation about events](https://nodejs.org/api/events.html#events_events)

>When the EventEmitter object emits an event, all of the Functions attached to that specific event are called synchronously.
>Any values returned by the called listeners are ignored and will be discarded.

So, it is not possible to access values returned by event listeners. But *it is possible to pass an object as an argument to an event*, and because JavaScript
passes object arguments by reference, *we are able to see the modifications applied on this object*. But if the modification is performed *asynchronously*,
we cannot know when it will be available.

Let's write a simple example. First, we write a node module containing actions needed to make a pizza `margherita` or a pizza `regina`. Every action logs a
message so we can see when it is executed. These messages also display the property `name` that will be set on the `EventEmitter`, so we can verify that the
`this` keyword is set to reference the `EventEmitter` like described in [Node.js documentation](https://nodejs.org/api/events.html#events_passing_arguments_and_this_to_listeners).

Events that will trigger these functions will be named `margherita` and `regina` and have two arguments:

*   A `string` that will be concatenated with the name of the ingredient of the action
*   An `Array` that represents the pizza and contains ingredients

```javascript
module.exports = {
  addMozzarella(ingredients, pizza) {
    console.log('Inside ' + this.name + ' action addMozzarella()');
    ingredients += ' mozzarella';
    pizza.push('mozzarella');
  },
  addTomatoes(ingredients, pizza) {
    setTimeout(() => {
      console.log('Inside ' + this.name + ' async action addTomatoes()');
      ingredients += ' tomato';
      pizza.push('tomatoes');
    }, 10);
  },
  addBasil(ingredients, pizza) {
    console.log('Inside ' + this.name + ' action addBasil()');
    ingredients += 'basil';
    pizza.push('basil');
  },
  addHam(ingredients, pizza) {
    setTimeout(() => {
      console.log('Inside ' + this.name + ' async action addHam()');
      ingredients += 'ham';
      pizza.push('ham');
    }, 30);
  },
  addMushrooms(ingredients, pizza) {
    setTimeout(() => {
      console.log('Inside ' + this.name + ' async action addMushrooms()');
      ingredients += 'mushrooms';
      pizza.push('mushrooms');
    }, 20);
  }
};
```

We implemented all necessary actions to make margheritas and reginas. Let's write a `Pizzaiolo` EventEmitter that will call these actions
when it makes/emits a pizza.

```javascript
const actions = require('./event-emitter-actions');

// Let's create an event emitter
const EventEmitter = require('events');
class Pizzaiolo extends EventEmitter {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

// We associate various listener to our emitter
// Some of them execute asynchronous code
mario.on('regina', actions.addMozzarella)
     .on('regina', actions.addTomatoes)
     .on('regina', actions.addHam)
     .on('regina', actions.addMushrooms);

// We prepare some data that will be passed to the event
const ingredients = 'Ingredients: ';
const pizza = [];

// Emit a pizza!
console.log('Before emitting');
mario.emit('regina', ingredients, pizza);

// Let's see what we've got now
console.log(['After emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));

// Let's check again a little later
setTimeout(function() {
  console.log(['Later after emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));
}, 100);
```

Here is the result of the execution with some comments:

```text
Before emitting

Inside Mario action addMozzarella()             // Actions are called and the `this` keyword references the Pizzaiolo/EventEmitter
                                                // The logs of addTomatoes(), addMushrooms() and addHam() are missing here because
                                                // they are is written in an asynchronous call

After emitting                                  // The code written after the emission is executed before the addTomatoes(),
  -Ingredients:                                 // addMushrooms() and addHam() action finishes
  -["mozzarella"]                               // The string argument does not contain the modifications because JavaScript passed a copy
                                                // The Array argument does contain the modifications because JavaScript passed its reference

Inside Mario async action addTomatoes()         // Now the asynchronous code from addTomatoes(), addMushrooms() and addHam() is executed
Inside Mario async action addMushrooms()
Inside Mario async action addHam()

Later after emitting                            // Modifications from asynchronous operations are finally applied to the pizza Array
  -Ingredients:                                 // but we cannot know when it happened and if it have been successfully executed
  -["mozzarella","tomatoes","mushrooms","ham"]



Before emitting

Inside Mario action addMozzarella()       // Actions are called and the `this` keyword references the Pizzaiolo/EventEmitter
Inside Mario action addBasil()            // The log of addTomatoes() is missing here because it is written in an asynchronous call

After emitting                            // The code written after the emission is executed before the addTomatoes() action finishes
  -Ingredients:                           // The string argument does not contain the modifications because JavaScript passed a copy of it to the listeners
  -["mozzarella","basil"]                 // The Array argument does contain the modifications because JavaScript passed its reference to the listeners

Inside Mario async action addTomatoes()   // Now the asynchronous code from addTomatoes() is executed

Later after emitting                      // The modification from addTomatoes() is finally applied to the pizza Array
  -Ingredients:                           // but we cannot know when it happened and if it have been successfully executed
  -["mozzarella","basil","tomatoes"]
```

### How Pebo works

Let's rewrite `Pizzaiolo` with Pebo. To avoid confusion, the equivalent of `on()` and `emit()` methods from EventEmitter are
respectively named `when()` and `fire()` in Pebo.

```javascript
const actions = require('./pebo-actions');

// Let's create a Pebo event emitter
const Pebo = require('pebo');
class Pizzaiolo extends Pebo {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

// We associate various listener to our emitter
// Some of them execute asynchronous code
mario.when('regina', actions.addMozzarella)
     .when('regina', actions.addTomatoes)
     .when('regina', actions.addHam)
     .when('regina', actions.addMushrooms);

// Emit a pizza!
console.log('Before emitting');
mario.fire('regina', 'Ingredients:', [])
.then(args => {
  // Let's see what we've got now
  console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
});

```

Here is the result of the execution with some comments:

```text
Before emitting

Inside Mario action addMozzarella()             // Actions are called and the `this` keyword references the Pizzaiolo/Pebo event emitter
Inside Mario async action addTomatoes()         // The log of addTomatoes() appears because Pebo is using Promises to execute asynchronous
Inside Mario async action addMushrooms()        // functions sequentially
Inside Mario async action addHam()

After emitting                                  // We retrieved the margherita with all its ingredients as soon as it is ready
  -Ingredients:                                 // The string argument does not contain the modifications because JavaScript passed
  -["mozzarella","tomatoes","mushrooms","ham"]  // a copy of it to the listeners
                                                // The Array argument does contain the modifications because JavaScript passed its
                                                // reference to the listeners
```

### If the order of execution does matter

By default Pebo will execute listener Functions concurrently.

In some cases, **you may want to execute listeners in the order they have been declared**. For example, our `Pizzaiolo` instance is
making `regina` pizzas that contain `["mozzarella","tomatoes","mushrooms","ham"]`. Some clients should complain that mushrooms have
to be *on* the ham. We have to force the `Pizzaiolo` to execute the operations in the correct order. That is why Pebo comes with a
second method to fire events: `fireSequentially()`.

Note that this could have an strong impact on performances. Indeed, if an event has 3 listeners that execute asynchronous operations
that last 100, 200 and 400 ms, the result will be available only after 700 ms minimum.

Let's write another example, but this time we will log execution durations and our Pizzaiolo will prepare two `regina` pizzas:

*   for the first one, the pizzaiolo will add ingredients one after another
*   for the second one, the pizzaiolo will not care about the order

```javascript
const actions = require('./pebo-actions');

// Let's create a Pebo event emitter
const Pebo = require('pebo');
class Pizzaiolo extends Pebo {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

// We associate various listener to our emitter
// Some of them execute asynchronous code
mario.when('regina', actions.addMozzarella)
     .when('regina', actions.addTomatoes)
     .when('regina', actions.addHam)
     .when('regina', actions.addMushrooms);

// Emit a pizza!
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
```

Here is the result of the execution:

```text
Before emitting                                           // The duration of each action is estimated based on the setTimeout() duration parameter

Inside Mario action addMozzarella()                       // last ~0 ms
Inside Mario async action addTomatoes()                   // last ~100 ms
Inside Mario async action addHam()                        // last ~200 ms
Inside Mario async action addMushrooms()                  // last ~100 ms

After emitting
  -Ingredients:                                           // We received our pizza like previously, except that it's a regina this time
  -["mozzarella","tomatoes","ham","mushrooms"]            // The pizzaiollo last ~400 ms to make it, it is the sum of all actions durations
fire: 408ms

Before emitting concurrently

Inside Mario action addMozzarella()                       // last ~0 ms
Inside Mario async action addTomatoes()                   // last ~100 ms
Inside Mario async action addMushrooms()                  // last ~200 ms
Inside Mario async action addHam()                        // last ~100 ms

After emitting
  -Ingredients:                                           // this time, The string argument does not contain the modifications like for the EventEmitter example
  -["mozzarella","tomatoes","mushrooms","ham"]            // the ingredients were not necessarily added in the right order, but the pizza was prepared much more faster
fireConcurrently: 202ms                                   // The pizzaiollo last ~200 ms to make this regina, it is the duration of the longest action
```

Executing operations sequentially, our `Pizzaiolo` may cook better pizzas, but he will be much longer.

### If retrieving modification on primitive arguments is important

Pebo comes with third method to fire events: `fireSequentiallyPropagatingResponses()`. It is similar to the  `fireSequentially()` method,
but instead of passing the arguments of the event to each listeners, it passes the result of the previous listener. This wait,
modifications a listener can alter a primitive argument like a string or a number or even completely replace an argument.

The drawback of this method is that it requires to alter the code of the listeners:

```text
module.exports = {
  // Synchronous operation
  addMozzarella(ingredients, pizza) {
    console.log('Inside ' + this.name + ' action addMozzarella()');
    ingredients += ' - mozzarella';
    pizza.push('mozzarella');
    return [ingredients, pizza];        // <= return an array contining the arguments eventually transformed
  },
  // Asynchronous operation
  addTomatoes(ingredients, pizza) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Inside ' + this.name + ' async action addTomatoes()');
        ingredients += ' - tomato';
        pizza.push('tomatoes');
        resolve([ingredients, pizza]);  // <= resolve with an array contining the arguments eventually transformed
      }, 100);
    });
  },
  // Synchronous operation
  addBasil(ingredients, pizza) {
    console.log('Inside ' + this.name + ' action addBasil()');
    ingredients += ' - basil';
    pizza.push('basil');
    // You can simply return the "argument" keyword if you wish but modifying primitive arguments like strings and integers will not work
    // return arguments;
    return [ingredients, pizza];        // <= return an array contining the arguments eventually transformed
  },
  // Long Asynchronous operation
  addHam(ingredients, pizza) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Inside ' + this.name + ' async action addHam()');
        ingredients += ' - ham';
        pizza.push('ham');
        resolve([ingredients, pizza]);  // <= resolve with an array contining the arguments eventually transformed
      }, 200);
    });
  },
  // Asynchronous operation
  addMushrooms(ingredients, pizza) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Inside ' + this.name + ' async action addMushrooms()');
        ingredients += ' - mushrooms';
        pizza.push('mushrooms');
        resolve([ingredients, pizza]);  // <= resolve with an array contining the arguments eventually transformed
      }, 100);
    });
  }
};
```

Let's make/fire another `regina`:

```javascript
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

// Emit a pizza!
console.log('Before emitting');
mario.fireSequentiallyPropagatingResponses('regina', 'Ingredients:', [])
.then(args => {
  // Let's see what we've got now
  console.log(['After emitting', args[0], JSON.stringify(args[1])].join('\n  -'));
});
```

Here is the result of the execution:

```text
Before emitting

Inside Mario action addMozzarella()                       // Actions are called and the `this` keyword references the Pizzaiolo/Pebo
Inside Mario async action addTomatoes()                   // event emitter
Inside Mario async action addHam()                        // The log of addTomatoes() appears because Pebo is using Promises to execute
Inside Mario async action addMushrooms()                  // asynchronous functions sequentially

After emitting                                            // We retrieved the margherita with all its ingredients as soon as it is ready
  -Ingredients: - mozzarella - tomato - ham - mushrooms   // We even have the correct string of ingredients because modifications have
  -["mozzarella","tomatoes","ham","mushrooms"]            // been copied for each successive listener
```

Which Promise implementation does Pebo use?
---

**Pebo comes with 0 dependencies**, but **you can use it with your favorite Promise library** using `Pebo.setPromise(myPromiseLib);`.
If you want to use `bluebird` for example:

```javascript
const actions = require('./pebo-actions');
const Pebo = require('pebo');
Pebo.setPromise(require('bluebird'));

// Let's create a Pebo event emitter
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
  // Emit another pizza!
  return mario.fireConcurrently('regina', 'Ingredients:', []);
})
.spread((ingredients, pizza) => {
  console.log(['After emitting', ingredients, JSON.stringify(pizza)].join('\n  -'));
});
```

Here is the result of the execution, but I am too lazy to comment it again ...

```text
Before emitting
Inside Mario action addMozzarella()
Inside Mario async action addTomatoes()
Inside Mario action addBasil()
After emitting
  -Ingredients: - mozzarella - tomato - basil
  -["mozzarella","tomatoes","basil"]
Inside Mario action addMozzarella()
Inside Mario async action addTomatoes()
Inside Mario async action addMushrooms()
Inside Mario async action addHam()
After emitting
  -Ingredients:
  -["mozzarella","tomatoes","mushrooms","ham"]
```

What's next?
---

Pebo will offer [more features inspired from `EventEmitter`](https://nodejs.org/api/events.html#events_passing_arguments_and_this_to_listeners)
