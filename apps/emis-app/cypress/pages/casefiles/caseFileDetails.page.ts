import { CaseFileDetailsBase } from './caseFileDetailsBase.page';

export enum DataTest {
  caseFileActivityTitle = 'caseFileActivity-listItem-content-title',
  caseFileActivityBody = 'caseFileActivity-listItem-content-body',
  sortBy = 'caseFileActivity-case-file-activity-sort-select',
  userName = 'caseFileItem__userName',
  roleName = 'caseFileItem__roleName',
  dateCreated = 'caseFileItem__created',
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

  public goToDuplicateHouseholdProfilebyIndex(index = 0) {
    cy.getByDataTest(this.registrationNumber).eq(index).click();
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
}
