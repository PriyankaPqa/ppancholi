/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// eslint-disable-next-line import/no-duplicates
import { ServerAuthorizationTokenResponse } from '@azure/msal-common';
// eslint-disable-next-line import/no-duplicates
import { UserRoles } from './msal';
// eslint-disable-next-line import/no-duplicates
import './msal';

import './ui';

Cypress.Commands.overwrite('visit', (originalFn, url, lang = 'en', options = {}) => {
  const newUrl = `${lang}/${url}`;
  return originalFn(newUrl, lang, options);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(as?: UserRoles): Chainable<void>
      getToken(as?: UserRoles): Chainable<ServerAuthorizationTokenResponse>
      // eslint-disable-next-line no-undef
      getByDataTest({ selector, type }: { selector: string; type: string; }, options?: Record<string, unknown>): Chainable<JQuery<HTMLElement>>
      selectListElementByIndex(dataTest:string, index: number, parentSelectorType?: string): Chainable<string>;
      selectMultipleElementByIndex(dataTest:string, indexes: number[]): Chainable<void>
      selectListElementByValue(dataTest: string, value: string): Chainable<void>
      selectMultipleElementByValues(dataTest: string, values: string[]): Chainable<void>
      writeInputSelect(dataTest: string, value: string): Chainable<void>
      selectCountry(dataTest: string, { countryCode, search }: { countryCode: string; search: string }): Chainable<void>
      escape(): Chainable<void>
      visit(url: string, lang: string, options?: Record<string, string>): Chainable<AUTWindow>
    }
  }
}
