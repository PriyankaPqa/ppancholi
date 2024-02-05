export enum DataTest {
  duplicateHouseholdPrimaryMember = 'householdDetails-manageDuplicates-household-link',
  duplicateHouseholdRegistrationNumber = 'householdDetails-manageDuplicates-household-registration-number',
  duplicateHouseholdCasefileData = 'householdDetails-manageDuplicates-caseFile-data',
  duplicateHouseholdDetails = 'householdDetails-duplicate-address',
  duplicateHistoryStatus = 'householdDetails-duplicate-history-status',
  duplicateHistoryUser = 'householdDetails-duplicate-history-user',
  duplicateHistoryRationale = 'householdDetails-duplicate-history-rationale',
  duplicateHistoryName = 'householdDetails-duplicate-name',
  duplicateActionDropdown = 'householdDetails-manageDuplicates-actionDropdown_input',
  duplicatePhoneNumber = 'duplicate-home-phone-number',
  duplicateFlagNew = 'householdDetails-manageDuplicates--FlagNew',
  flagNewHouseholdRegistrationNumber = 'flag-new-household-registration-number',
  duplicateReason = 'duplicate-reasons',
  flagNewHouseholdRationale = 'householdDetails-manageDuplicates-actionDialog-rationale',
  memberName = 'payment_modalities',
  closeButton = 'dialog-cancel-action',
  buttonSubmit = 'dialog-submit-action',
  tabLabelPotentialDuplicates = 'rctab-label-badge',
}

// values are search text for duplicated by field
export enum DuplicatedBy {
  'FullName' = 'Full Name',
  'HomePhoneNumber' = 'Home Phone Number',
  'HomeAddress' = 'Home Address',
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

  private duplicateFlagNew = { selector: DataTest.duplicateFlagNew };

  private closeButton = { selector: DataTest.closeButton };

  private memberName = { selector: DataTest.memberName };

  private flagNewHouseholdRationale = { selector: DataTest.flagNewHouseholdRationale, type: 'textarea' };

  private buttonSubmit = { selector: DataTest.buttonSubmit };

  private tabLabelPotentialDuplicates = { selector: DataTest.tabLabelPotentialDuplicates };

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
    // eslint-disable-next-line
    return cy.getByDataTest(this.duplicatePhoneNumber).getAndTrimText().then(phoneNumber => phoneNumber.replace(/[\(\)\-\s]/g, '')); //Modifies phoneNumber from bracketed type i.e. (646) - 767 8898 to unformatted type i.e. 6467678898
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

  public getFlagNewDuplicateButton() {
    return cy.getByDataTest(this.duplicateFlagNew);
  }

  public getFlagNewHouseholdRegistrationNumberField(registrationNumber: string) {
    return cy.searchAndSelect(DataTest.flagNewHouseholdRegistrationNumber, registrationNumber);
  }

  public selectDuplicatedBy(duplicateReason: string) {
    return cy.searchAndSelect(DataTest.duplicateReason, duplicateReason);
  }

  public provideFlagNewDuplicateRationale(rationale: string) {
    return cy.getByDataTest(this.flagNewHouseholdRationale).focus().type(rationale);
  }

  public selectHouseholdMemberByIndex(index = 0) {
    return cy.selectListElementByIndex(DataTest.memberName, index);
  }

  public submitFlagNewDuplicate() {
    cy.getByDataTest(this.buttonSubmit).click();
  }

  public getTabPotentialDuplicates() {
    return cy.getByDataTest(this.tabLabelPotentialDuplicates);
  }
}
