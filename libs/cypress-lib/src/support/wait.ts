import 'cypress-wait-until';

/**
 * Run a check, and then refresh the page and wait until an element is displayed.
 * Retries for a specified amount of time.
 *
 * @function
 * @param {function} firstCheckFunction - The function to run before checking if the element is displayed.
 * @param {string|{ selector: string, type: string }} selector - The selector to search for. Can be a string or an object with selector and type properties.
 * @param {WaitUntilOptions} [opts={timeout: 5000, interval: 500}] - The options object, with timeout and interval properties.
 * @throws {Error} if the firstWaitFunction parameter is not a function.
 * @throws {Error} if the specified element is not found after all retries.
 * @example
 * cy.refreshUntilDisplayed('#element-id', () => {...});
 * cy.refreshUntilDisplayed({ selector: 'element-id', type: 'div' }, () => {...});
 */
Cypress.Commands.add('waitFirstRefreshUntilDisplayed', (firstCheckFunction, selector: string | { selector: string, type: string }, opts = {}) => {
  if (!(firstCheckFunction instanceof Function)) {
    throw new Error(`\`firstCheckFunction\` parameter should be a function. Found: ${firstCheckFunction}`);
  }

  let parsedSelector = '';

  // Define the default options for the underlying `cy.wait` command
  const defaultOptions = {
    timeout: 5000,
    interval: 500,
  };

  const options = { ...defaultOptions, ...opts };

  // Calculate the number of retries to wait for the element to be displayed
  let retries = Math.floor(options.timeout / options.interval);
  const totalRetries = retries;

  if (typeof selector === 'string') {
    parsedSelector = selector;
  }

  if (typeof selector !== 'string' && selector.selector && selector.type) {
    parsedSelector = `${selector.type}[data-test=${selector.selector}]`;
  }

  // Define the check function that will be called recursively until the element is displayed
  function check(selector: string): boolean {
    if (Cypress.$(selector).length) { // Element exists
      return true;
    }
    if (retries < 1) {
      throw Error(`${selector} not found`);
    }

    if (totalRetries !== retries) { // we don't reload first time
      cy.log(`Element ${parsedSelector} not found. ${retries} left`);
      cy.reload();
    }

    // Waits for the firstCheckFunction to return true,
    // then pause for the time define in options.interval
    // and call recursively the check function
    cy.waitUntil(firstCheckFunction, options).then(() => { // We first for firstCheckFunction to be true
      cy.wait(options.interval).then(() => { // Then we loop until the selector is displayed
        retries -= 1;
        return check(selector);
      });
    });
    return false;
  }

  check(parsedSelector);
});

/**
 * Custom command to wait for the items in a pinia store to be fetched and refreshed, until a specified element is displayed.
 * @function
 * @param {string} piniaStoreId - The identifier of the pinia store.
 * @param {string | { selector: string, type: string }} selector - The selector for the element to wait for. Can be either a string or an object with a "selector" and "type" property.
 * @param {WaitUntilOptions} [opts={}] - Additional options to pass to the underlying `cy.wait` command.
 * @example
 * cy.waitItemsRefreshUntilDisplayed('todos', '.todo-item');
 */
Cypress.Commands.add('waitItemsRefreshUntilDisplayed', (piniaStoreId, selector, opts = {}) => {
  // Define the first check function that determines when the state of the UI has been updated
  // This function returns a boolean indicating whether the items in the specified pinia store have been fetched

  const firstCheckFunction = () => cy.window().then((win) => {
    if (win._app.$pinia.state.value[piniaStoreId]) {
      return win._app.$pinia.state.value[piniaStoreId].items.length > 0;
    }
    throw new Error(`Store ${piniaStoreId} is not yet defined. Please add it to initializeStores() method in helpers/cypress.ts`);
  });
  cy.log(`Items from pinia store ${piniaStoreId} have been fetched`);

  // Call the custom command `cy.waitFirstRefreshUntilDisplayed` and pass the firstCheckFunction, selector, and opts as arguments
  cy.waitFirstRefreshUntilDisplayed(firstCheckFunction, selector, opts);
});

/**
 Custom Cypress command that searches for an element with the specified data-test attribute, types a search string into the associated input field, and selects a corresponding option that matches the search string.
 @param {string} dataTest - The data-test attribute value of the element to search for.
 @param {string} searchString - The string to type into the associated input field and use to select the corresponding option.
 @param {Object} [opts] - Optional object with timeout and interval properties.
 @param {number} [opts.timeout=5000] - The maximum amount of time in milliseconds to wait for the option to be displayed.
 @param {number} [opts.interval=500] - The amount of time in milliseconds to wait between retry attempts to find the option.
 @throws Will throw an error if the option cannot be found after the maximum number of retries has been reached.
 @returns {void}
 */
Cypress.Commands.add('searchAndSelect', (dataTest: string, searchString: string, opts = { timeout: 5000, interval: 500 }) => {
  let retries = Math.floor(opts.timeout / opts.interval);
  const valueWithoutSpace = searchString.replace(/\s/g, '');
  const optionSelector = `div[data-test=${dataTest}__item--${valueWithoutSpace}]`;

  const search = () => {
    if (retries < 1) {
      throw Error(`${searchString} was not found and could not be selected. Try another query or increase timeout`);
    }

    cy.getByDataTest({ selector: dataTest, type: 'input' }).clear({ force: true }).type(searchString, { force: true });

    cy.getByDataTest({ selector: dataTest, type: 'div' }).click().then(() => {
      if (Cypress.$(optionSelector).length) {
        cy.get(optionSelector).click();
      } else {
        cy.wait(opts.interval).then(() => {
          retries -= 1;
          search();
        });
      }
    });
  };

  search();
});
