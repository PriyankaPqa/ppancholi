import 'cypress-wait-until';

export interface RefreshUntilOptions extends WaitUntilOptions {
 waitAfterRefresh?: number
}

Cypress.Commands.add('refreshUntil', (selector: string | { selector: string, type: string }, opts?: RefreshUntilOptions) => {
  let parsedSelector = '';
  let waitAfterRefresh = 2500; // Default wait time after reloading the page in ms

  if (opts && opts.waitAfterRefresh) {
    waitAfterRefresh = opts.waitAfterRefresh;
  }

  if (typeof selector === 'string') {
    parsedSelector = selector;
  }

  if (typeof selector !== 'string' && selector.selector && selector.type) {
    parsedSelector = `${selector.type}[data-test=${selector.selector}]`;
  }
  // eslint-disable-next-line
  cy.waitUntil(() => cy.reload().wait(waitAfterRefresh).then(() => Cypress.$(parsedSelector).length), opts);
});
