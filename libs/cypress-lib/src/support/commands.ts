/// <reference types="cypress" />
/* eslint-disable import/no-duplicates */
import { ServerAuthorizationTokenResponse } from '@azure/msal-common';
import { UserRoles } from './msal';
import './msal';
import { RefreshUntilOptions } from './wait';
import './wait';
import './ui';

Cypress.Commands.add('goTo', (url: string, lang = 'en', options = {}) => {
  const newUrl = `${lang}/${url}`;
  return cy.visit(newUrl, options);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(as?: UserRoles): Chainable<void>
      loginProd(): Chainable<void>
      getToken(as?: UserRoles): Chainable<ServerAuthorizationTokenResponse>
      // eslint-disable-next-line no-undef
      getByDataTest({ selector, type }: { selector: string; type: string; }, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>
      selectListElementByIndex(dataTest:string, index: number, parentSelectorType?: string): Chainable<string>;
      selectMultipleElementByIndex(dataTest:string, indexes: number[]): Chainable<void>
      selectListElementByValue(dataTest: string, value: string): Chainable<void>
      selectMultipleElementByValues(dataTest: string, values: string[]): Chainable<void>
      writeInputSelect(dataTest: string, value: string): Chainable<void>
      selectCountry(dataTest: string, { countryCode, search }: { countryCode: string; search: string }): Chainable<void>
      escape(): Chainable<void>
      goTo(url: string, lang?: string, options?: Record<string, string>): Chainable<AUTWindow>
      refreshUntil(selector: string | { selector: string, type: string }, opts?: RefreshUntilOptions): Chainable<void>
    }
  }
}
