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

  public refreshUntilHouseholdProfileReady(householdId: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => cy.getByDataTest(this.title).should('be.visible'),
        checkCondition: () => Cypress.$("[data-test='household_history_edited-by']").length > 0,
        actionsAfterReload: () => {
          this.waitFetchHouseholdProfileData(householdId);
          cy.get("[data-test='household-profile-history-btn']").should('be.visible').click();
        },
      },
      {
        errorMsg: 'Failed to find element',
        foundMsg: 'History loading success',
      },
    );
  }

  public getHouseholdHistoryEditedBy(index = 0) {
    return cy.getByDataTest(this.householdHistoryEditedBy).eq(index).getAndTrimText();
  }

  public getHouseholdHistoryChangeDate(index = 0) {
    return cy.getByDataTest(this.householdHistoryChangeDate).eq(index).getAndTrimText();
  }

  public getHouseholdHistoryLastAction(index = 0) {
    return cy.getByDataTest(this.householdHistoryLastAction).eq(index).getAndTrimText();
  }

  public getHouseholdHistoryPreviousValue(index = 0) {
    return cy.getByDataTest(this.householdHistoryPreviousValue).eq(index).getAndTrimText();
  }

  public getHouseholdHistoryNewValue(index = 0) {
    return cy.getByDataTest(this.householdHistoryNewValue).eq(index).getAndTrimText();
  }

  public getTitleText() {
    return cy.getByDataTest(this.title).getAndTrimText();
  }

  public goToHouseholdProfilePage() {
    cy.getByDataTest(this.close).click();
  }
}
