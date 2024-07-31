import { CaseFileDetailsBase } from './caseFileDetailsBase.page';

export enum DataTest {
  caseFileActivityTitle = 'caseFileActivity-listItem-content-title',
  caseFileActivityBody = 'caseFileActivity-listItem-content-body',
  sortBy = 'caseFileActivity-case-file-activity-sort-select',
  userName = 'caseFileItem__userName',
  roleName = 'caseFileItem__roleName',
  dateCreated = 'caseFileItem__created',
  roleUserNameSystemAdmin = 'caseFileItem__systemAdmin',
  backButton = 'back-button',
  primaryBeneficiaryName = 'title-left-menu',
  pageTitle = 'page-title',
  registrationNumber = 'caseFileActivity-listItem-content-body-registration-number',
  addTag = 'caseFile-add-tags-btn',
  dialogActionCancel = 'dialog-cancel-action',
  dialogActionSubmit = 'dialog-submit-action',
  addTagItem = 'checkbox-item',
  displayedTagItemChipText = 'caseFileTags-chip',
  caseFileActivityTags = 'caseFileActivity-tags',
  verifyIdentityIcon = 'caseFileDetails-verify-identity-icon',
  identityIconColorValidation = 'caseFileDetails-identity-icon-color-validation',
  impactIconColorValidation = 'caseFileDetails-impact-icon-color-validation',
  triageSelect = 'caseFileActivity-triage-select',
  triageSelectInput = 'caseFileActivity-triage-select_input',
  impactIcon = 'caseFileDetails-verify-impact-icon',
  dialogTitle = 'dialog-title',
  impactValidationMethodRow = 'impactValidation_method',
  impactValidationStatusRow = 'impactValidation_status',
  impactMethodManual = 'impact-method-manual',
  impactMethodNotApplicable = 'impact-method-not-applicable',
  impactStatusUndetermined = 'impact-status-undetermined',
  impactStatusImpacted = 'impact-status-impacted',
}

export enum caseFileTags {
  Irregular = '631e8b83-9ba3-49ad-9595-d959b8d924ba',
}

export class CaseFileDetailsPage extends CaseFileDetailsBase {
  private caseFileActivityTitle = { selector: DataTest.caseFileActivityTitle };

  private caseFileActivityBody = { selector: DataTest.caseFileActivityBody };

  private userName = { selector: DataTest.userName };

  private roleName = { selector: DataTest.roleName };

  private dateCreated = { selector: DataTest.dateCreated };

  private primaryBeneficiaryName = { selector: DataTest.primaryBeneficiaryName };

  private pageTitle = { selector: DataTest.pageTitle };

  private registrationNumber = { selector: DataTest.registrationNumber };

  private addTag = { selector: DataTest.addTag };

  private dialogActionCancel = { selector: DataTest.dialogActionCancel };

  private dialogActionSubmit = { selector: DataTest.dialogActionSubmit };

  private caseFileActivityTags = { selector: DataTest.caseFileActivityTags };

  private verifyIdentityIcon = { selector: DataTest.verifyIdentityIcon };

  private identityIconColorValidation = { selector: DataTest.identityIconColorValidation };

  private impactIconColorValidation = { selector: DataTest.impactIconColorValidation };

  private roleUserNameSystemAdmin = { selector: DataTest.roleUserNameSystemAdmin };

  private triageSelect = { selector: DataTest.triageSelect };

  private triageSelectInput = { selector: DataTest.triageSelectInput, type: 'input' };

  private impactIcon = { selector: DataTest.impactIcon };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private impactValidationMethodRow = { selector: DataTest.impactValidationMethodRow };

  private impactValidationStatusRow = { selector: DataTest.impactValidationStatusRow };

  private impactMethodManual = { selector: DataTest.impactMethodManual, type: 'input' };

  private impactMethodNotApplicable = { selector: DataTest.impactMethodNotApplicable, type: 'input' };

  private impactStatusUndetermined = { selector: DataTest.impactStatusUndetermined, type: 'input' };

  private impactStatusImpacted = { selector: DataTest.impactStatusImpacted, type: 'input' };

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

  public getRoleNameSystemAdmin() {
    return cy.getByDataTest(this.roleUserNameSystemAdmin).getAndTrimText();
  }

  public getCaseFileActivityLogDate(index = 0) {
    return cy.getByDataTest(this.dateCreated).eq(index).getAndTrimText();
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

  public getPrimaryBeneficiaryName() {
    return cy.getByDataTest(this.primaryBeneficiaryName).getAndTrimText();
  }

  public waitAndRefreshUntilCaseFileActivityVisibleWithBody(expectedCaseFileActivityBody: string) {
    cy.waitAndRefreshUntilConditions(
      {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        visibilityCondition: () => cy.getByDataTest(this.pageTitle).contains('Case file activity').should('be.visible').wait(2000),
        checkCondition: () => Cypress.$("[data-test='caseFileActivity-listItem-content-body']").text().includes(expectedCaseFileActivityBody),
      },
      {
        timeoutInSec: 60,
        errorMsg: 'Failed to find case file activity',
        foundMsg: 'Case file Activity visible',
      },
    );
  }

  public goToDuplicateHouseholdProfilebyIndex(duplicateHouseholdRegistrationNumber: string, index = 0) {
    cy.getByDataTest({ selector: `${this.registrationNumber.selector}-${duplicateHouseholdRegistrationNumber}` }).eq(index).click();
  }

  public addTagButton() {
    cy.getByDataTest(this.addTag).click();
  }

  public getAddTagButton() {
    return cy.getByDataTest(this.addTag);
  }

  public getDialogActionCancelButton() {
    return cy.getByDataTest(this.dialogActionCancel);
  }

  public getDialogActionSubmitButton() {
    return cy.getByDataTest(this.dialogActionSubmit);
  }

  public selectTagItem(caseFileTag: string) {
    const tagItemSelector = { selector: `${DataTest.addTagItem}-${caseFileTag}` };
    cy.getByDataTest(tagItemSelector).click();
  }

  public getCaseFileActivityTags() {
    return cy.getByDataTest(this.caseFileActivityTags).getAndTrimText();
  }

  public getDisplayedSelectedTag(caseFileTag: string) {
    const tagItemSelector = { selector: `${DataTest.displayedTagItemChipText}-${caseFileTag}` };
    return cy.getByDataTest(tagItemSelector);
  }

  public getVerifyIdentityIconElement() {
    return cy.getByDataTest(this.verifyIdentityIcon);
  }

  public getIdentityIconColorValidationElement() {
    return cy.getByDataTest(this.identityIconColorValidation);
  }

  public getImpactIconColorValidationElement() {
    return cy.getByDataTest(this.impactIconColorValidation);
  }

  public selectTriage(level: number) {
    return cy.selectListElementByIndex(DataTest.triageSelect, level);
  }

  public getSelectedTriageElement() {
    return cy.getByDataTest(this.triageSelect);
  }

  public getSelectedTriageInputElement() {
    return cy.getByDataTest(this.triageSelectInput);
  }

  public getValidationOfImpactIconButton() {
    return cy.getByDataTest(this.impactIcon);
  }

  public getDialogTitleElement() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getImpactValidationMethodRow() {
    return cy.getByDataTest(this.impactValidationMethodRow);
  }

  public getImpactValidationStatusRow() {
    return cy.getByDataTest(this.impactValidationStatusRow);
  }

  public getImpactMethodManualButton() {
    return cy.getByDataTest(this.impactMethodManual);
  }

  public getImpactMethodNotApplicableButton() {
    return cy.getByDataTest(this.impactMethodNotApplicable);
  }

  public getImpactStatusUndeterminedButton() {
    return cy.getByDataTest(this.impactStatusUndetermined);
  }

  public getImpactStatusImpactedButton() {
    return cy.getByDataTest(this.impactStatusImpacted);
  }
}
