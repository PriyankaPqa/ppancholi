/// <reference types="cypress" />
/* eslint-disable import/no-duplicates */
import { ServerAuthorizationTokenResponse } from '@azure/msal-common';
import { UserRoles } from './msal';
import './msal';
import './wait';
import './ui';

Cypress.Commands.add('goTo', (url: string, lang = 'en', options = {}) => {
  const newUrl = `${lang}/${url}`;
  cy.visit(newUrl, options);
});

Cypress.Commands.add('interceptAndRetryUntilNoMoreStatus', (url, statusCode, maxRetries = 50) => {
  let retries = 0;
  function interceptAndRetry() {
    cy.intercept('GET', url).as('interceptedRequest');
    cy.wait('@interceptedRequest', { timeout: 45000 }).then((interception) => {
      if (interception.response.statusCode === statusCode) {
        cy.log(`There was a ${statusCode} error while fetching ${interception.request.url}`);
        cy.reload();
        retries += 1;
        if (retries < maxRetries) {
          interceptAndRetry();
        }
      }
    });
  }
  interceptAndRetry();
});

Cypress.Commands.add('waitForStatusCode', (url, statusCode, timeout?: 5000) => {
  cy.intercept('GET', url).as('interceptedRequest');
  cy.wait('@interceptedRequest', { timeout }).then((interception) => {
    if (interception.response.statusCode === statusCode) {
      cy.log(`Expected ${statusCode} received for ${interception.request.url}`);
    } else {
      cy.log(`Expected ${statusCode} not received for ${interception.request.url}`);
    }
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(as?: UserRoles): Chainable<void>
      loginProd(): Chainable<void>
      getToken(as?: UserRoles): Chainable<ServerAuthorizationTokenResponse>
      // eslint-disable-next-line no-undef
      getByDataTest({ selector, type }: { selector: string; type?: string; }, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
      getByDataTestLike({ selector, type }: { selector: string; type?: string; }, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
      selectListElementByIndex(dataTest: string, index: number, parentSelectorType?: string): Chainable<string>;
      selectMultipleElementByIndex(dataTest: string, indexes: number[]): Chainable<void>
      selectListElementByValue(dataTest: string, value: string): Chainable<void>
      selectMultipleElementByValues(dataTest: string, values: string[]): Chainable<void>
      writeInputSelect(dataTest: string, value: string): Chainable<void>
      selectCountry(dataTest: string, { countryCode, search }: { countryCode: string; search: string }): Chainable<void>
      escape(): Chainable<void>
      goTo(url: string, lang?: string, options?: Record<string, string>): Chainable<AUTWindow>
      waitFirstRefreshUntilDisplayed(
        firstWaitFunction: () => Chainable<boolean> | boolean,
        selector: string | { selector: string, type: string },
        opts?: WaitUntilOptions
      ): Chainable<void>
      waitItemsRefreshUntilDisplayed(
        piniaStoreId: string,
        selector: string | { selector: string, type: string },
        opts?: WaitUntilOptions
      ): Chainable<void>
      setDatePicker(dataTest: string, { year, month, day }: { year: number; month: number; day: number }): Chainable<void>
      searchAndSelect(dataTest: string, searchString: string, opts?: { timeoutInSec: number; intervalInSec: number }): Chainable<void>
      shouldBeRequired(label: string): Chainable<void>
      waitUntilTableFullyLoaded(tableDataTest: string): Chainable<void>
      getAndTrimText(): Chainable<string>
      interceptAndRetryUntilNoMoreStatus(url: string | RegExp, statusCode: number, maxRetries?: number): Chainable<string>
      // eslint-disable-next-line
      typeAndWaitUntilSearchResultsVisible(searchString: string, dataTestSearchField: string, dataTestSearchResult: string, opts?: { timeout: number; interval: number }): Chainable<void>
      waitAndRefreshUntilConditions(
        conditions: {
          visibilityCondition: () => Chainable<undefined> | Chainable<JQuery<HTMLElement>>,
          checkCondition: () => boolean,
          actionsAfterReload?: () => void
        },
        options?: {
          timeoutInSec?: number,
          intervalInSec?: number,
          errorMsg?: string,
          foundMsg?: string,
        }
      ): Chainable<string>
      waitForStatusCode(url: string | RegExp, statusCode: number): Chainable<string>
    }
  }
}
