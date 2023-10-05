// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
// Import commands.js using ES2015 syntax:
import '@libs/cypress-lib/support/commands';
import installLogsCollector from 'cypress-terminal-report/src/installLogsCollector';

// "import" with `@ts-ignore`
// @see error 2306 https://github.com/microsoft/TypeScript/blob/3fcd1b51a1e6b16d007b368229af03455c7d5794/src/compiler/diagnosticMessages.json#L1635
// @ts-ignore
import registerCypressGrep from '@cypress/grep';
import { slowCypressDown } from 'cypress-slow-down';
import { IMassActionMetadata, MassActionRunStatus } from '@libs/entities-lib/mass-action';

require('cypress-xpath');

installLogsCollector();
registerCypressGrep();
slowCypressDown();

Cypress.Commands.add('waitForMassActionToBe', (expectedStatus: MassActionRunStatus, forceReload = true, timeoutInSec = 300, intervalInSec = 10) => {
  const timeout = timeoutInSec * 1000;
  const interval = intervalInSec * 1000;
  let elapsedTime = 0;
  const start = Date.now();

  function reload(waitTime = 20000) {
    cy.wait(waitTime); // Needed so we make sure we are on details page to reload
    cy.reload(); // We reload to make sure mass action metadata endpoint will be called
  }

  async function handleRetry(waitTime: number) {
    elapsedTime = Date.now() - start;
    if (elapsedTime >= timeout) {
      throw new Error(`Timeout after ${timeoutInSec}s without seeing the mass action with a status ${MassActionRunStatus[expectedStatus]}`);
    }
    reload(waitTime);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    interceptAndRetry();
  }

  function interceptAndRetry() {
    cy.intercept('GET', '**/case-file/mass-actions/metadata/*').as('massActionMetadata');
    cy.wait('@massActionMetadata', { timeout: 45000 }).then(async (interception) => {
      if (interception.response.statusCode === 404) {
        cy.log(`There was a 404 error while fetching ${interception.request.url}`);
        await handleRetry(interval);
      } else if (interception.response.statusCode === 200) {
        const response = interception.response.body as IMassActionMetadata;
        const runStatus = response.lastRun.runStatus;
        if (runStatus !== expectedStatus) {
          cy.log(`Mass action does not have status ${MassActionRunStatus[expectedStatus]} it has ${MassActionRunStatus[runStatus]}`);
          await handleRetry(interval);
        } else {
          cy.log(`Mass action has status ${MassActionRunStatus[expectedStatus]}`);
          reload(5000);
        }
      }
    });
  }
  if (forceReload) {
    reload(5000);
  }

  interceptAndRetry();
});

declare global {
  namespace Cypress {
    interface Chainable {
      waitForMassActionToBe(expectedStatus: MassActionRunStatus, forceReload?: boolean, timeoutInSec?:number, intervalInSec?: number): Chainable<string>
    }
  }
}
