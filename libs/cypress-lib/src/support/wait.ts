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
Cypress.Commands.add('searchAndSelect', (dataTest, searchString, opts = { timeoutInSec: 20, intervalInSec: 2 }) => {
  const timeout = opts.timeoutInSec * 1000;
  const interval = opts.intervalInSec * 1000;
  const valueWithoutSpace = searchString.replace(/\s/g, '');
  const optionSelector = `div[data-test=${dataTest}__item--${valueWithoutSpace}]`;
  const start = Date.now();
  let elapsedTime = 0;

  const search = () => {
    elapsedTime = Date.now() - start;
    if (elapsedTime >= timeout) {
      throw new Error(`${searchString} was not found and could not be selected. Try another query or increase timeout`);
    }

    cy.getByDataTest({ selector: `${dataTest}_inner_input`, type: 'input' }).clear({ force: true });
    cy.getByDataTest({ selector: `${dataTest}_inner_input`, type: 'input' }).type(searchString, { force: true });
    cy.wait(interval);

    cy.getByDataTest({ selector: `${dataTest}_inner`, type: 'div' }).click();
    cy.then(() => {
      if (Cypress.$(optionSelector).length) {
        cy.get(optionSelector).click();
      } else {
        cy.wait(interval).then(() => {
          search();
        });
      }
    });
  };

  search();
});

/**
 Cypress command that waits until the Table is fully loaded using data-test of refresh button because it is loaded after the data table, before we try to assert something on that table
 @param {string} tableDataTest - The table name part of data test of the table waiting to be loaded
 @returns {void}
 */
Cypress.Commands.add('waitUntilTableFullyLoaded', (tableDataTest) => {
  cy.get(`[data-test="${tableDataTest}_refresh_button"]`).should('be.visible');
});

/**
 Custom Cypress command that types a search string into the associated search field, and selects a corresponding element in the table that matches the search string.
 @param {string} searchString - The string typed into the search field and used to select the corresponding element in the table.
 @param {string} dataTestSearchField - The data-test attribute value of the search field
 @param {string} dataTestSearchResult - The data-test attribute value of the element we expect to find as a result of search operation.
 @param {Object} [opts] - Optional object with timeout and interval properties.
 @param {number} [opts.timeout=20000] - The maximum amount of time in milliseconds to wait for the option to be displayed.
 @param {number} [opts.interval=4000] - The amount of time in milliseconds to wait between retry attempts to find the option.
 @throws Will throw an error if the element cannot be found after the maximum number of retries has been reached.
 @returns {void}
 */
Cypress.Commands.add('typeAndWaitUntilSearchResultsVisible', (searchString, dataTestSearchField, dataTestSearchResult, opts = { timeout: 40000, interval: 2000 }) => {
  const searchResultElementSelector = `[data-test=${dataTestSearchResult}]`;
  const start = Date.now();
  let elapsedTime = 0;
  const search = () => {
    elapsedTime = Date.now() - start;
    if (elapsedTime >= opts.timeout) {
      throw new Error(`${searchString} was not found after ${opts.timeout}ms`);
    }

    cy.getByDataTest({ selector: dataTestSearchField, type: 'input' }).clear({ force: true });
    cy.getByDataTest({ selector: dataTestSearchField, type: 'input' }).type(searchString, { force: true });

    cy.wait(opts.interval)
      .then(() => {
        if (Cypress.$(searchResultElementSelector).length) {
          cy.log('Search operation successful');
        } else {
          search();
        }
      });
  };

  search();
});

// eslint-disable-next-line vue/max-len
Cypress.Commands.add(
  'waitAndRefreshUntilConditions',
  (
    { visibilityCondition, checkCondition, actionsAfterReload = () => {} },
    {
      timeoutInSec = 150,
      intervalInSec = 10,
      errorMsg = 'Timeout: Failed to meet the conditions',
      foundMsg = 'Condition met',
    },
  ) => {
    const timeout = timeoutInSec * 1000;
    const interval = intervalInSec * 1000;
    let elapsedTime = 0;
    const start = Date.now();

    const waitForConditions = () => {
      visibilityCondition().then(() => {
        if (checkCondition()) {
          cy.log(foundMsg);
        } else {
          cy.wait(interval).then(() => {
            elapsedTime = Date.now() - start;
            if (elapsedTime >= timeout) {
              throw new Error(`${errorMsg} after ${timeoutInSec}s`);
            }
            cy.reload().then(async () => {
              await actionsAfterReload();
              waitForConditions();
            });
          });
        }
      });
    };

    waitForConditions();
  },
);
