import 'cypress-wait-until';

export interface RefreshUntilOptions extends WaitUntilOptions {
 waitAfterRefresh?: number
}

Cypress.Commands.add('refreshUntil', (selector: string | { selector: string, type: string }, opts?: RefreshUntilOptions) => {
  let parsedSelector = '';

  if (!opts.waitAfterRefresh) {
    opts.waitAfterRefresh = 2500;
  }

  if (typeof selector === 'string') {
    parsedSelector = selector;
  }

  if (typeof selector !== 'string' && selector.selector && selector.type) {
    parsedSelector = `${selector.type}[data-test=${selector.selector}]`;
  }

  cy.waitUntil(() => cy.reload().wait(opts.waitAfterRefresh).then(() => Cypress.$(parsedSelector).length), opts);
});
