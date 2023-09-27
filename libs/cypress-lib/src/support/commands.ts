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
  cy.interceptAndRetryUntilNoMoreStatus(404);
});

Cypress.Commands.add('interceptAndRetryUntilNoMoreStatus', (statusCode, maxRetries = 50) => {
  let retries = 0;
  function interceptAndRetry() {
    cy.intercept('GET', /^https:\/\/api-dev\.crc-tech\.ca\/.*metadata/).as('interceptedRequest');
    cy.wait('@interceptedRequest', { timeout: 45000 }).then((interception) => {
      if (interception.response.statusCode === statusCode) {
        cy.log(`There was a ${statusCode} error while fetching metadata ${interception.request.url}`);
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

declare global {
  namespace Cypress {
    interface Chainable {
      login(as?: UserRoles): Chainable<void>
      loginProd(): Chainable<void>
      getToken(as?: UserRoles): Chainable<ServerAuthorizationTokenResponse>
      // eslint-disable-next-line no-undef
      getByDataTest({ selector, type }: { selector: string; type?: string; }, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
      getByDataTestLike({ selector, type }: { selector: string; type?: string; }, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
      selectListElementByIndex(dataTest:string, index: number, parentSelectorType?: string): Chainable<string>;
      selectMultipleElementByIndex(dataTest:string, indexes: number[]): Chainable<void>
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
      searchAndSelect(dataTest: string, searchString: string, opts?: { timeout: number; interval: number }): Chainable<void>
      shouldBeRequired(label:string): Chainable<void>
      waitUntilTableFullyLoaded(tableDataTest: string): Chainable<void>
      getAndTrimText(): Chainable<string>
      interceptAndRetryUntilNoMoreStatus(statusCode: number, maxRetries?: number): Chainable<string>
    }
  }
}
