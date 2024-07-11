import { Language } from '@libs/cypress-lib/helpers';

export enum DataTest {
  dialogTitle = 'dialog-title',
  englishTab = 'tab-lang-en',
  frenchTab = 'tab-lang-fr',
  saveButton = 'dialog-submit-action',
  cancelButton = 'dialog-cancel-action',
  consentStatementEmis = "'consent-statement-select_EMIS consent statement'",
  consentStatementButtonEmis = "'consent-statement-select_btn_EMIS consent statement'",
  consentStatementProvincial = "'consent-statement-select_Provincial Agreement'",
  consentStatementButtonProvincial = "'consent-statement-select_btn_Provincial Agreement'",
  consentStatementText = 'selected-consent-statement',
  dialogClose = 'dialog-close',
  }

export class SelectStatementPage {
  private dialogTitle = { selector: DataTest.dialogTitle };

  private frenchTab = { selector: DataTest.frenchTab };

  private englishTab = { selector: DataTest.englishTab };

  private saveButton = { selector: DataTest.saveButton };

  private cancelButton = { selector: DataTest.cancelButton };

  private consentStatementEmis = { selector: DataTest.consentStatementEmis };

  private consentStatementButtonEmis = { selector: DataTest.consentStatementButtonEmis };

  private consentStatementProvincial = { selector: DataTest.consentStatementProvincial };

  private consentStatementButtonProvincial = { selector: DataTest.consentStatementButtonProvincial };

  private consentStatementText = { selector: DataTest.consentStatementText };

  private dialogClose = { selector: DataTest.dialogClose };

  public getDialogTitle() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getConsentStatementText() {
    return cy.getByDataTest(this.consentStatementText);
  }

  public getSaveButton() {
    return cy.getByDataTest(this.saveButton);
  }

  public getCancelButton() {
    return cy.getByDataTest(this.cancelButton);
  }

  public getDialogCloseButton() {
    return cy.getByDataTest(this.dialogClose);
  }

  public getConsentStatementEmis() {
    return cy.getByDataTest(this.consentStatementEmis);
  }

  public getConsentStatementProvincial() {
    return cy.getByDataTest(this.consentStatementProvincial);
  }

  public getEmisConsentStatementButton() {
    return cy.getByDataTest(this.consentStatementButtonEmis);
  }

  public getProvincialConsentStatementButton() {
    return cy.getByDataTest(this.consentStatementButtonProvincial);
  }

  public selectTab(lang: Language) {
    const tabSelectors = {
      [Language.English]: this.englishTab,
      [Language.French]: this.frenchTab,
    };

    cy.getByDataTest(tabSelectors[lang]).click();
  }
}
