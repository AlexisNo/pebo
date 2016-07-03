'use strict';

module.exports = {
  // Synchronous operation
  addMozzarella(ingredients, pizza) {
    console.log('Inside ' + this.name + ' action addMozzarella()');
    ingredients += ' - mozzarella';
    pizza.push('mozzarella');
    return [ingredients, pizza];
  },
  // Asynchronous operation
  addTomatoes(ingredients, pizza) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Inside ' + this.name + ' async action addTomatoes()');
        ingredients += ' - tomato';
        pizza.push('tomatoes');
        resolve([ingredients, pizza]);
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
    return [ingredients, pizza];
  },
  // Long Asynchronous operation
  addHam(ingredients, pizza) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Inside ' + this.name + ' async action addHam()');
        ingredients += ' - ham';
        pizza.push('ham');
        resolve([ingredients, pizza]);
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
        resolve([ingredients, pizza]);
      }, 100);
    });
  }
};
