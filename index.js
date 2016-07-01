'use strict';

process.on('uncaughtException', function(e) {
  console.log(e);
});

process.on('unhandledRejection', r => {
  console.log('Unhandled rejection');
  console.log(r);
});

/**
 * Construct a emitter instance
 * @constructor
 */
function Pebo() {
  this.events = [];
}

/**
 * Add a listener
 * @param {string} eventName - The name of the event
 * @param {function} fn - The listener function
 * @returns {Pebo}
 */
Pebo.prototype.when = function when(eventName, fn) {
  this.events[eventName] = this.events[eventName] || [];
  this.events[eventName].push(fn);
  return this;
};

/**
 * Fire an event
 * @param {string} eventName - the name of the event
 * @param {...*} arg - the list of arguments provided to the event
 * @returns {Promise<[]>} return the promise of an array containing the event arguments eventually transformed by listeners
 */
Pebo.prototype.fire = function fire() {
  // Extract arguments and eventName
  const args = Array.prototype.slice.call(arguments);
  const eventName = args.shift();

  if (!this.events[eventName]) {
    // Shortcut if no listener has been attached to the event
    return new Promise((resolve, reject) => {
      resolve.call(this, args);
    });
  }

  // Define a recusive function that will check if a plugin implements the hook,
  // execute it and pass the eventually transformed arguments to the next one
  const callListenersSequentially = function callListenersSequentially(i, args) {
    if (!this.events[eventName][i]) {
      // If there is no more plugin to execute, we return a promise of the event arguments/result
      // So we are getting out of the recursive function
      return new Promise((resolve, reject) => {
        resolve(args);
      });
    }

    const p = this.events[eventName][i].apply(this.events[eventName][i], args);
    // return this.events[eventName][i].apply(this.events[eventName][i], args)
    return p.then(function propagateArguments() {
      // We cannot use the () => {} notation here because we use `arguments`
      // When the plugin hook has been executed, we move to the next plugin (recursivity)
      return callListenersSequentially.bind(this)(i + 1, arguments[0]);
    }.bind(this));
  };
  // Call the recursive function
  return callListenersSequentially.bind(this)(0, args);
};


/**
 * Fire an event, executing listener concurrently
 * @param {string} eventName - the name of the event
 * @param {...*} arg - the list of arguments provided to the event
 * @returns {Promise<[]>} return the promise of an array containing the event arguments eventually transformed by listeners
 */
Pebo.prototype.fireConcurrently = function fireConcurrently() {
  // Extract arguments and eventName
  const args = Array.prototype.slice.call(arguments);
  const eventName = args.shift();

  if (!this.events[eventName]) {
    // Shortcut if no listener has been attached to the event
    return new Promise((resolve, reject) => {
      resolve.call(this, args);
    });
  }

  return Promise.all(this.events[eventName].map(fn => fn.apply(this, args)))
  .then(function(responses) {
    return Promise.resolve(responses[0]);
  });
};

module.exports = Pebo;
