import { FinancialAssistanceDetailsPage } from './financialAssistanceDetails.page';
import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';

export enum DataTest {
  faPayment = 'fap_link_',
  approvalStatus = 'chip-text',
  createdDate = 'fap_created',
  totalAmount = 'fap_total',
  groupTitle = 'caseFile-financialAssistance-expand-groupTitle',
  groupTotal = 'caseFile-financialAssistance-expand-groupTotal',
  groupPaymentStatus = 'caseFile-financialAssistance-expand-groupPaymentStatus',
  caseFileDetails = 'item-text-0',
  faHistory = 'history-link',
  addFaPayment = 'table__addButton',
  refreshButton = 'financialAssistanceOverview__table_refresh_button',
  dialogApprovalHistoryRationale = 'rationale-item',
  dialogApprovalHistoryAction = 'action-item',
  dialogCancel = 'dialog-cancel-action',
  dialogSubmit = 'dialog-submit-action',
  dialogTitle = 'dialog-title',
  dialogClose = 'dialog-close',
  errorMessage = 'error-message',
  searchField = 'dataTableHeader__search',
  backButton = 'back-button',
  statsButton = 'financialAssistanceOverview__statsButton',
}

export class FinancialAssistanceHomePage {
  private approvalStatus = { selector: DataTest.approvalStatus };

  private createdDate = { selector: DataTest.createdDate };

  private totalAmount = { selector: DataTest.totalAmount };

  private caseFileDetails = { selector: DataTest.caseFileDetails };

  private groupTitle = { selector: DataTest.groupTitle };

  private groupTotal = { selector: DataTest.groupTotal };

  private groupPaymentStatus = { selector: DataTest.groupPaymentStatus };

  private faPayment = { selector: DataTest.faPayment };

  private faHistory = { selector: DataTest.faHistory };

  private addFaPayment = { selector: DataTest.addFaPayment };

  private refreshButton = { selector: DataTest.refreshButton };

  private dialogApprovalHistoryRationale = { selector: DataTest.dialogApprovalHistoryRationale };

  private dialogApprovalHistoryAction = { selector: DataTest.dialogApprovalHistoryAction };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogCancel = { selector: DataTest.dialogCancel };

  private dialogSubmit = { selector: DataTest.dialogSubmit };

  private dialogClose = { selector: DataTest.dialogClose };

  private errorMessage = { selector: DataTest.errorMessage };

  private searchField = { selector: DataTest.searchField, type: 'input' };

  private backButton = { selector: DataTest.backButton };

  private statsButton = { selector: DataTest.statsButton };

  public getFAPaymentById(financialAssistancePaymentId: string) {
    cy.getByDataTest({ selector: `${DataTest.faPayment}${financialAssistancePaymentId}` }).click();
    return new FinancialAssistanceDetailsPage();
  }

  public getFAPaymentNameById(financialAssistancePaymentId: string) {
    return cy.getByDataTest({ selector: `${DataTest.faPayment}${financialAssistancePaymentId}` }).getAndTrimText();
  }

  public getFAPaymentName() {
    return cy.getByDataTestLike(this.faPayment).getAndTrimText();
  }

  public getFAPayment() {
    cy.getByDataTestLike(this.faPayment).click();
    return new FinancialAssistanceDetailsPage();
  }

  public getApprovalStatus() {
    return cy.getByDataTest(this.approvalStatus).getAndTrimText();
  }

  public getFAPaymentCreatedDate() {
    return cy.getByDataTest(this.createdDate).getAndTrimText();
  }

  public getFAPaymentAmount() {
    return cy.getByDataTest(this.totalAmount).getAndTrimText();
  }

  public expandFAPayment() {
    cy.get('button[class="v-icon notranslate v-data-table__expand-icon v-icon--link mdi mdi-menu-down theme--light"]').click();
  }

  public getFAPaymentGroupTitle() {
    return cy.getByDataTest(this.groupTitle).getAndTrimText();
  }

  public getFAPaymentGroupTotal() {
    return cy.getByDataTest(this.groupTotal).getAndTrimText();
  }

  public getFAPaymentPaymentStatus() {
    return cy.getByDataTest(this.groupPaymentStatus).getAndTrimText();
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileDetails).click();
    return new CaseFileDetailsPage();
  }

  public getApprovalStatusHistoryIcon() {
    return cy.getByDataTest(this.faHistory);
  }

  public getApprovalStatusHistory() {
    return cy.getByDataTest(this.faHistory).click();
  }

  public getAddFaPaymentButton() {
    return cy.getByDataTest(this.addFaPayment);
  }

  public refreshUntilFaPaymentDisplayedWithTotal(faPaymentTotal: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => cy.getByDataTest(this.refreshButton).should('be.visible'),
        checkCondition: () => Cypress.$("[data-test='fap_total']").text().includes(faPaymentTotal),
      },
      {
        timeoutInSec: 60,
        errorMsg: 'Unable to display update FA Payment',
        foundMsg: 'FA Payment updated',
      },
    );
  }

  public getApprovalHistoryRationaleByIndex(index: number) {
    return cy.getByDataTest(this.dialogApprovalHistoryRationale).eq(index).getAndTrimText();
  }

  public getApprovalHistoryActionByIndex(index: number) {
    return cy.getByDataTest(this.dialogApprovalHistoryAction).eq(index).getAndTrimText();
  }

  public getDialogCancelApprovalStatusHistoryButton() {
    return cy.getByDataTest(this.dialogCancel);
  }

  public getDialogSubmitButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }

  public getDialogTitleElement() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getErrorMessageElement() {
    return cy.getByDataTest(this.errorMessage);
  }

  public getDialogCloseElement() {
    return cy.getByDataTest(this.dialogClose);
  }

  public verifyClickSuccessful() {
    return cy.getByDataTest(this.dialogClose);
  }

  public addNewFaPayment() {
    this.getAddFaPaymentButton().should('be.visible');
    this.getAddFaPaymentButton().click();
  }

  public getSearchField() {
    return cy.getByDataTestLike(this.searchField);
  }
}
