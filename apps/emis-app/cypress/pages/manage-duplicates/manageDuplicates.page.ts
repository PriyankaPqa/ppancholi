export enum DataTest {
  duplicateHouseholdPrimaryMember = 'householdDetails-manageDuplicates-household-link',
  duplicateHouseholdRegistrationNumber = 'householdDetails-manageDuplicates-household-registration-number',
  duplicateHouseholdCasefileData = 'householdDetails-manageDuplicates-caseFile-data',
  duplicateHouseholdDetails = 'householdDetails-duplicate-address',
  duplicateHistoryStatus = 'householdDetails-duplicate-history-status',
  duplicateHistoryUser = 'householdDetails-duplicate-history-user',
  duplicateHistoryRationale = 'householdDetails-duplicate-history-rationale',
  duplicateHistoryName = 'householdDetails-duplicate-name',
  duplicateActionDropdown = 'householdDetails-manageDuplicates-actionDropdown',
  duplicatePhoneNumber = 'duplicate-home-phone-number',
  closeButton = 'dialog-cancel-action',
}

export class ManageDuplicatesPage {
  private duplicateHouseholdPrimaryMember = { selector: DataTest.duplicateHouseholdPrimaryMember };

  private duplicateHouseholdRegistrationNumber = { selector: DataTest.duplicateHouseholdRegistrationNumber };

  private duplicateHouseholdCasefileData = { selector: DataTest.duplicateHouseholdCasefileData };

  private duplicateHouseholdDetails = { selector: DataTest.duplicateHouseholdDetails };

  private duplicateHistoryStatus = { selector: DataTest.duplicateHistoryStatus };

  private duplicateHistoryUser = { selector: DataTest.duplicateHistoryUser };

  private duplicateHistoryRationale = { selector: DataTest.duplicateHistoryRationale };

  private duplicatePhoneNumber = { selector: DataTest.duplicatePhoneNumber };

  private duplicateHistoryName = { selector: DataTest.duplicateHistoryName };

  private duplicateActionDropdown = { selector: DataTest.duplicateActionDropdown, type: 'input' };

  private closeButton = { selector: DataTest.closeButton };

  public getDuplicateHouseholdPrimaryMemberName() {
    return cy.getByDataTestLike(this.duplicateHouseholdPrimaryMember).getAndTrimText();
  }

  public getDuplicateHouseholdRegistrationNumber() {
    return cy.getByDataTest(this.duplicateHouseholdRegistrationNumber).getAndTrimText();
  }

  public getDuplicateHouseholdCaseFileData() {
    return cy.getByDataTest(this.duplicateHouseholdCasefileData).getAndTrimText();
  }

  public getDuplicateHouseholdDetails() {
    return cy.getByDataTest(this.duplicateHouseholdDetails).getAndTrimText();
  }

  public getDuplicateHistoryStatus() {
    return cy.getByDataTest(this.duplicateHistoryStatus).getAndTrimText();
  }

  public getDuplicateHistoryUser() {
    return cy.getByDataTest(this.duplicateHistoryUser).getAndTrimText();
  }

  public getDuplicateHistoryRationale() {
    return cy.getByDataTest(this.duplicateHistoryRationale).getAndTrimText();
  }

  public getDuplicatePhoneNumber() {
    return cy.getByDataTest(this.duplicatePhoneNumber).getAndTrimText();
  }

  public getDuplicateName() {
    return cy.getByDataTest(this.duplicateHistoryName).getAndTrimText();
  }

  public getActionDropdown() {
    return cy.getByDataTest(this.duplicateActionDropdown);
  }

  public goToHouseholdProfilePage() {
    cy.getByDataTest(this.closeButton).click();
  }
}
