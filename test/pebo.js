/*eslint-env mocha */
'use strict';

const assert = require('assert');
const Pebo = require('..');
const actions = require('../examples/pebo-actions');
const bluebird = require('bluebird');

class Pizzaiolo extends Pebo {}
const mario = new Pizzaiolo();
mario.name = 'Mario';

describe('A Pebo instance', function() {

  it('should emit an event even without listeners', () => {
    return mario.fire('margherita', 'Ingredients:', [])
    .then(args => {
      assert.equal(args[0], 'Ingredients:', 'the first argument (string) is retrieved');
      assert.equal(args[1].length, 0, 'the second argument is (Array) retrieved');
      return mario.fireConcurrently('margherita', 'Ingredients:', []);
    })
    .then(args => {
      assert.equal(args[0], 'Ingredients:', 'concurrently, the first argument (string) is retrieved');
      assert.equal(args[1].length, 0, 'concurently, the second argument is (Array) retrieved');
    });
  });

  it('should register listeners', () => {
    mario.when('margherita', actions.addMozzarella)
         .when('margherita', actions.addTomatoes)
         .when('margherita', actions.addBasil)
         .when('regina', actions.addMozzarella)
         .when('regina', actions.addTomatoes)
         .when('regina', actions.addHam)
         .when('regina', actions.addMushrooms);
  });

  it('should emit an event and execute listeners sequentially propagating responses from each listener', () => {
    return mario.fireSequentiallyPropagatingResponses('margherita', 'Ingredients:', [])
    .then(args => {
      assert.equal(args[0], 'Ingredients: - mozzarella - tomato - basil', 'the first argument (string) is retrieved with modifications');
      assert.equal(args[1][0], 'mozzarella', 'the modification of the first listener is retrieved');
      assert.equal(args[1][1], 'tomatoes', 'the modification of the second listener is retrieved');
      assert.equal(args[1][2], 'basil', 'the modification of the third listener is retrieved');
    });
  });

  it('should emit an event and execute listeners sequentially', () => {
    return mario.fireSequentially('margherita', 'Ingredients:', [])
    .then(args => {
      assert.equal(args[0], 'Ingredients:', 'the first argument (string) is retrieved with modifications');
      assert.equal(args[1][0], 'mozzarella', 'the modification of the first listener is retrieved');
      assert.equal(args[1][1], 'tomatoes', 'the modification of the second listener is retrieved');
      assert.equal(args[1][2], 'basil', 'the modification of the third listener is retrieved');
    });
  });

  it('should emit an event and execute listeners concurently', () => {
    return mario.fireConcurrently('regina', 'Ingredients:', [])
    .then(args => {
      assert.equal(args[0], 'Ingredients:', 'the first argument (string) is retrieved without modifications');
      assert.equal(args[1][0], 'mozzarella', 'the modification of the first listener is retrieved');
      assert.equal(args[1][1], 'tomatoes', 'the modification of the second listener is retrieved');
      assert.equal(args[1][2], 'mushrooms', 'the modification of the fourth listener is retrieved');
      assert.equal(args[1][3], 'ham', 'the modification of the third listener is retrieved');
    });
  });

  it('should be able to use a specific Promise library', () => {
    Pebo.setPromise(bluebird);
    return mario.fireSequentiallyPropagatingResponses('margherita', 'Ingredients:', [])
    .spread((ingredients, pizza) => {
      assert.equal(ingredients, 'Ingredients: - mozzarella - tomato - basil', 'the first argument (string) is retrieved with modifications');
      assert.equal(pizza[0], 'mozzarella', 'the modification of the first listener is retrieved');
      assert.equal(pizza[1], 'tomatoes', 'the modification of the second listener is retrieved');
      assert.equal(pizza[2], 'basil', 'the modification of the third listener is retrieved');
    });
  });

});
