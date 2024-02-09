export enum DataTest {
  caseFileActivityTitle = 'caseFileActivity-listItem-content-title',
  caseFileActivityBody = 'caseFileActivity-listItem-content-body',
  sortBy = 'caseFileActivity-case-file-activity-sort-select',
  userName = 'caseFileItem__userName',
  roleName = 'caseFileItem__roleName',
  dateCreated = 'caseFileItem__created',
  backButton = 'back-button',
  caseNote = 'case-note',
  primaryBeneficiaryName = 'title-left-menu',
  caseFileNumber = 'caseFileDetails-caseFileNumber',
  eventName = 'caseFileDetails-event',
  financialAssistance = 'case-financial-assistance',
  pageTitle = 'page-title',
  registrationNumber = 'caseFileActivity-listItem-content-body-registration-number',
}

export class CaseFileDetailsPage {
  private caseFileActivityTitle = { selector: DataTest.caseFileActivityTitle };

  private caseFileActivityBody = { selector: DataTest.caseFileActivityBody };

  private userName = { selector: DataTest.userName };

  private roleName = { selector: DataTest.roleName };

  private dateCreated = { selector: DataTest.dateCreated };

  private backButton = { selector: DataTest.backButton };

  private caseNote = { selector: DataTest.caseNote };

  private primaryBeneficiaryName = { selector: DataTest.primaryBeneficiaryName };

  private caseFileNumber = { selector: DataTest.caseFileNumber };

  private eventName = { selector: DataTest.eventName };

  private financialAssistance = { selector: DataTest.financialAssistance };

  private pageTitle = { selector: DataTest.pageTitle };

  private registrationNumber = { selector: DataTest.registrationNumber };

  public getCaseFileActivityTitles() {
    return cy.getByDataTest(this.caseFileActivityTitle).getAndTrimText();
  }

  public getCaseFileActivityBodies() {
    return cy.getByDataTest(this.caseFileActivityBody).getAndTrimText();
  }

  public getUserName(index = 0) {
    return cy.getByDataTest(this.userName).eq(index).getAndTrimText();
  }

  public getRoleName(index = 0) {
    return cy.getByDataTest(this.roleName).eq(index).getAndTrimText();
  }

  public getCaseFileActivityLogDate(index = 0) {
    return cy.getByDataTest(this.dateCreated).eq(index);
  }

  public getCaseFileActivityTitle(index = 0) {
    return cy.getByDataTest(this.caseFileActivityTitle).eq(index).getAndTrimText();
  }

  public getCaseFileActivityBody(index = 0) {
    return cy.getByDataTest(this.caseFileActivityBody).eq(index).getAndTrimText();
  }

  public getAllUserName() {
    return cy.getByDataTest(this.userName).getAndTrimText();
  }

  public getAllCaseFileActivityTitle() {
    return cy.getByDataTest(this.caseFileActivityTitle).getAndTrimText();
  }

  public getAllCaseFileActivityBody() {
    return cy.getByDataTest(this.caseFileActivityBody).getAndTrimText();
  }

  public goBackToHouseholdProfilePage() {
    cy.getByDataTest(this.backButton).click();
  }

  public goToCaseNotesPage() {
    cy.getByDataTest(this.caseNote).click();
  }

  public getPrimaryBeneficiaryName() {
    return cy.getByDataTest(this.primaryBeneficiaryName).getAndTrimText();
  }

  public getCaseFileNumber() {
    return cy.getByDataTest(this.caseFileNumber).getAndTrimText();
  }

  public getEventName() {
    return cy.getByDataTest(this.eventName).getAndTrimText();
  }

  public goToFinancialAssistanceHomePage() {
    return cy.getByDataTest(this.financialAssistance).click();
  }

  public waitAndRefreshUntilCaseFileActivityVisibleWithBody(expectedCaseFileActivityBody: string) {
    cy.waitAndRefreshUntilConditions(
      {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        visibilityCondition: () => cy.getByDataTest(this.pageTitle).contains('Case file activity').should('be.visible').wait(2000),
        checkCondition: () => Cypress.$("[data-test='caseFileActivity-listItem-content-body']").text().includes(expectedCaseFileActivityBody),
      },
      {
        timeoutInSec: 45,
        errorMsg: 'Failed to find case file activity',
        foundMsg: 'Case file Activity visible',
      },
    );
  }

  public goToDuplicateHouseholdProfilebyIndex(index = 0) {
    cy.getByDataTest(this.registrationNumber).eq(index).click();
  }
}
