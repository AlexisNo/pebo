'use strict';

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
