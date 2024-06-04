/// <reference types="cypress" />
/* eslint-disable import/no-duplicates */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Interception } from 'cypress/types/net-stubbing';
import { ServerAuthorizationTokenResponse } from '@azure/msal-common';
import { ICallSearchUntilMeetConditionParams } from '@/support/wait';
import { UserRoles } from './msal';
import './msal';
import './wait';
import './ui';

export interface IInterceptAndValidateConditionParams {
  httpMethod: string;
  url: string | RegExp;
  actionsCallback?: () => void;
  conditionCallBack: (interception: Interception) => boolean;
  actionsWhenValidationPassed: (interception: Interception) => void;
  actionsWhenValidationFailed: (interception: Interception) => void;
  timeout?: number;
  alias: string;
}

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

Cypress.Commands.add('waitForStatusCode', (url: string | RegExp, statusCode: number, timeout = 5000) => {
  cy.interceptAndValidateCondition({
    httpMethod: 'GET',
    url,
    conditionCallBack: (interception) => (interception.response.statusCode === statusCode),
    actionsWhenValidationPassed: (interception) => {
      cy.log(`Expected ${statusCode} received for ${interception.request.url}`);
    },
    actionsWhenValidationFailed: (interception) => {
      throw Error(`Expected ${statusCode} not received for ${interception.request.url}`);
    },
    timeout,
    alias: 'interceptedRequest',
  });
});

/**
 * Intercept an API call, then take actions, validation if API response meet condition
 * @param httpMethod
 * @param url
 * @param actionsCallback
 * @param conditionCallBack
 * @param actionsWhenValidationPassed
 * @param actionsWhenValidationFailed
 * @param timeout
 * @param alias
 */
Cypress.Commands.add('interceptAndValidateCondition', (params: IInterceptAndValidateConditionParams) => {
  cy.intercept(params.httpMethod, params.url).as(params.alias);
  if (params.actionsCallback) {
    params.actionsCallback();
  }
  cy.wait(`@${params.alias}`, { timeout: params.timeout }).then((interception) => {
    if (params.conditionCallBack(interception)) {
      params.actionsWhenValidationPassed(interception);
    } else {
      params.actionsWhenValidationFailed(interception);
    }
  });
});

/** Example
 * cy.findComponentByName(componentName).then((component) => {
    if (component) {
      expect(component.$data.selectedProgram).to.equal(null);
    }
  });
 */
Cypress.Commands.add('findComponentByName', (name: string) => {
  cy.window().then((win) => {
    const root = (win as any)._app as Vue;

    function searchComponent(component: Vue, name: string): Vue | null {
      if (component.$options.name === name) {
        return component;
      }

      for (const child of component.$children) {
        const found = searchComponent(child, name);
        if (found) {
          return found;
        }
      }

      return null;
    }

    const result = searchComponent(root, name);

    if (result === null) {
      throw new Error(`Component with name ${name} not found`);
    }

    return cy.wrap(result);
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
      waitForStatusCode(url: string | RegExp, statusCode: number, timeout?: number): Chainable<string>,
      shouldHaveCrossedText(shouldBeCrossed: boolean): Chainable<string>
      interceptAndValidateCondition(params: IInterceptAndValidateConditionParams): Chainable<void>,
      callSearchUntilMeetCondition(params: ICallSearchUntilMeetConditionParams): Promise<any[]>,
      findComponentByName(name: string): Chainable<Vue | null>;
    }
  }
}
