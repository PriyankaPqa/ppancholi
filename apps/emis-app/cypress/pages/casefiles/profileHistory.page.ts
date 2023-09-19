import { formatDate } from '@libs/cypress-lib/helpers';

export enum DataTest {
  householdHistoryEditedBy = 'household_history_edited-by',
  householdHistoryLastAction = 'household_history_last-action',
  householdHistoryPreviousValue = 'household_history_previous-value',
  householdHistoryNewValue = 'household_history_new-value',
  householdHistoryChangeDate = 'household_history_date-of-change',
  title = 'dialog-title',
  close = 'dialog-submit-action',
}

export class ProfileHistoryPage {
  private householdHistoryEditedBy = { selector: DataTest.householdHistoryEditedBy };

  private householdHistoryLastAction = { selector: DataTest.householdHistoryLastAction };

  private householdHistoryPreviousValue = { selector: DataTest.householdHistoryPreviousValue };

  private householdHistoryNewValue = { selector: DataTest.householdHistoryNewValue };

  private householdHistoryChangeDate = { selector: DataTest.householdHistoryChangeDate };

  private title = { selector: DataTest.title };

  private close = { selector: DataTest.close };

  private waitFetchHouseholdProfileData(householdId: string) {
    cy.intercept({ method: 'GET', url: `**/household/households/${householdId}/activities` }).as('householdProfile');
    cy.wait('@householdProfile', { timeout: 45000 });
    cy.log('Household profile is fetched');
  }

  public refreshUntilHouseholdProfileReady(householdId: string, maxRetries = 10) {
    let retries = 0;
    const waitForElement = () => {
      // Make sure popup is displayed
      cy.getByDataTest(this.title).should('be.visible').then(() => {
        if (Cypress.$("[data-test='household_history_edited-by']").length) {
          cy.log('history loading success');
        } else {
          retries += 1;
          if (retries <= maxRetries) {
            // eslint-disable-next-line cypress/no-unnecessary-waiting
            cy.wait(2000).then(() => { // We wait for 2 seconds to pause the retries
              cy.reload().then(() => {
                this.waitFetchHouseholdProfileData(householdId);
                cy.get("[data-test='household-profile-history-btn']").should('be.visible').click();
                waitForElement();
              });
            });
          } else {
            throw new Error(`Failed to find element after ${maxRetries} retries.`);
          }
        }
      });
    };
    waitForElement();
  }

  public getHouseholdHistoryEditedBy() {
    return cy.getByDataTest(this.householdHistoryEditedBy).getAndTrimText();
  }

  public getHouseholdHistoryChangeDate() {
    return cy.getByDataTest(this.householdHistoryChangeDate).invoke('text').then((date) => formatDate(date));
  }

  public getHouseholdHistoryLastAction() {
    return cy.getByDataTest(this.householdHistoryLastAction).getAndTrimText();
  }

  public getHouseholdHistoryPreviousValue() {
    return cy.getByDataTest(this.householdHistoryPreviousValue).getAndTrimText();
  }

  public getHouseholdHistoryNewValue() {
    return cy.getByDataTest(this.householdHistoryNewValue).getAndTrimText();
  }

  public getTitleText() {
    return cy.getByDataTest(this.title).getAndTrimText();
  }

  public goToHouseholdProfilePage() {
    cy.getByDataTest(this.close).click();
  }
}
