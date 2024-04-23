export enum DataTest {
  duplicateHouseholdPrimaryMember = 'householdDetails-manageDuplicates-household-link',
  duplicateHouseholdRegistrationNumber = 'householdDetails-manageDuplicates-household-registration-number',
  duplicateHouseholdCasefileData = 'householdDetails-manageDuplicates-caseFile-data',
  duplicateHouseholdDetails = 'householdDetails-duplicate-address',
  duplicateHistoryStatus = 'householdDetails-duplicate-history-status',
  duplicateHistoryUser = 'householdDetails-duplicate-history-user',
  duplicateHistoryRationale = 'householdDetails-duplicate-history-rationale',
  duplicateHistoryName = 'householdDetails-duplicate-name',
  duplicateActionDropdownInput = 'householdDetails-manageDuplicates-actionDropdown_input',
  duplicatePhoneNumber = 'duplicate-home-phone-number',
  duplicateFlagNew = 'householdDetails-manageDuplicates--FlagNew',
  flagNewHouseholdRegistrationNumber = 'flag-new-household-registration-number',
  duplicateReason = 'duplicate-reasons',
  flagNewHouseholdRationale = 'householdDetails-manageDuplicates-actionDialog-rationale',
  flagNewHouseholdRationaleTextArea = 'householdDetails-manageDuplicates-actionDialog-rationale_input',
  actionMenuResolved = 'householdDetails-manageDuplicates-action-menu-Resolved',
  actionMenuPotential = 'householdDetails-manageDuplicates-action-menu-Potential',
  memberName = 'payment_modalities',
  closeButton = 'dialog-cancel-action',
  buttonSubmit = 'dialog-submit-action',
  tabPotentialDuplicates = 'householdDetails-manageDuplicates--Potential',
  tabLabelResolved = 'householdDetails-manageDuplicates--Resolved',
  flagAsActionDialog = 'householdDetails-manageDuplicates-actionDialog-flagAs',
  duplicateActionDropdown = 'householdDetails-manageDuplicates-actionDropdown',
}

// values are search text for duplicated by field
export enum DuplicatedBy {
  'FullName' = 'Full Name',
  'HomePhoneNumber' = 'Home Phone Number',
  'HomeAddress' = 'Home Address',
}

export enum UpdateDuplicateRecordTo {
  'Resolved' = 'Resolved',
  'Potential' = 'Potential',
}

export enum ResolvedBy {
  'System' = 'System',
  'Manually' = 'Manually',
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

  private duplicateActionDropdownInput = { selector: DataTest.duplicateActionDropdownInput, type: 'input' };

  private duplicateFlagNew = { selector: DataTest.duplicateFlagNew };

  private closeButton = { selector: DataTest.closeButton };

  private memberName = { selector: DataTest.memberName };

  private flagNewHouseholdRationale = { selector: DataTest.flagNewHouseholdRationaleTextArea, type: 'textarea' };

  private buttonSubmit = { selector: DataTest.buttonSubmit };

  private tabPotentialDuplicates = { selector: DataTest.tabPotentialDuplicates };

  private tabLabelResolved = { selector: DataTest.tabLabelResolved };

  private actionMenuResolved = { selector: DataTest.actionMenuResolved };

  private actionMenuPotential = { selector: DataTest.actionMenuPotential };

  private flagAsActionDialog = { selector: DataTest.flagAsActionDialog };

  private actionDialogRationale = { selector: DataTest.flagNewHouseholdRationale };

  private duplicateActionDropdown = { selector: DataTest.duplicateActionDropdown };

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

  public getDuplicateHistoryStatusByIndex(index = 0) {
    return cy.getByDataTest(this.duplicateHistoryStatus).eq(index).getAndTrimText();
  }

  public getDuplicateHistoryUserByIndex(index = 0) {
    return cy.getByDataTest(this.duplicateHistoryUser).eq(index).getAndTrimText();
  }

  public getDuplicateHistoryRationaleByIndex(index = 0) {
    return cy.getByDataTest(this.duplicateHistoryRationale).eq(index).getAndTrimText();
  }

  public getDuplicatePhoneNumber() {
    // eslint-disable-next-line
    return cy.getByDataTest(this.duplicatePhoneNumber).getAndTrimText().then(phoneNumber => phoneNumber.replace(/[\(\)\-\s]/g, '')); //Modifies phoneNumber from bracketed type i.e. (646) - 767 8898 to unformatted type i.e. 6467678898
  }

  public getDuplicateName() {
    return cy.getByDataTest(this.duplicateHistoryName).getAndTrimText();
  }

  public getActionDropdownInput() {
    return cy.getByDataTest(this.duplicateActionDropdownInput);
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
    cy.getByDataTest(this.flagNewHouseholdRationale).focus();
    cy.getByDataTest(this.flagNewHouseholdRationale).type(rationale);
  }

  public selectHouseholdMemberByValue(memberName: string) {
    return cy.selectListElementByValue(DataTest.memberName, memberName);
  }

  public submitFlagNewDuplicate() {
    cy.getByDataTest(this.buttonSubmit).click();
  }

  public getTabPotentialDuplicates() {
    return cy.getByDataTest(this.tabPotentialDuplicates);
  }

  public selectActionMenuResolved() {
    return cy.getByDataTest(this.actionMenuResolved).click();
  }

  public getFlagAsText() {
    return cy.getByDataTest(this.flagAsActionDialog).getAndTrimText();
  }

  public actionDialogRationaleElement() {
    return cy.getByDataTest(this.actionDialogRationale);
  }

  public getDialogSaveButton() {
    return cy.getByDataTest(this.buttonSubmit);
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.closeButton);
  }

  public provideActionDialogRationale(rationale: string) {
    cy.getByDataTest(this.flagNewHouseholdRationale).focus();
    cy.getByDataTest(this.flagNewHouseholdRationale).type(rationale);
  }

  public getTabResolved() {
    return cy.getByDataTest(this.tabLabelResolved);
  }

  public getDuplicateActionDropdownText() {
    return cy.getByDataTest(this.duplicateActionDropdown).getAndTrimText();
  }

  public getDuplicateActionDropdown() {
    return cy.getByDataTest(this.duplicateActionDropdown);
  }

  public selectActionMenuPotential() {
    return cy.getByDataTest(this.actionMenuPotential).click();
  }
}
