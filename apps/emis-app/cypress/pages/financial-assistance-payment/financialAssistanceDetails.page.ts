import { CaseFileDetailsPage } from '../casefiles/caseFileDetails.page';

export enum DataTest {
  addPaymentLineBtn = 'financial-addPaymentLineBtn',
  submitAssistanceButton = 'submit',
  dialogCancel = 'dialog-cancel-action',
  dialogSubmit = 'dialog-submit-action',
  dialogCancellationReasonETransfer = 'paymentGroup__cancellationReason',
  dialogCancellationReasonETransferItems = 'paymentGroup__cancellationReason__item',
  backToFinancialAssistance = 'cancel',
  financialAssistanceApprovalStatus = 'approval_status',
  paymentLineStatus = 'statusSelect__chip',
  paymentLineGroup = 'paymentLineGroup__title',
  itemTitle = 'paymentLineItem__title',
  itemAmount = 'paymentLineItem__amount',
  totalAmount = 'paymentLineGroup__total',
  paymentGroupList = 'paymentGroupList',
  statusNew = 'statusSelect__1',
  statusInProgress = 'statusSelect__2',
  statusSent = 'statusSelect__3',
  statusIssued = 'statusSelect__4',
  statusCompleted = 'statusSelect__5',
  statusCancelled = 'statusSelect__6',
  selectSupervisor = 'approval_supervisor',
  approvalStatusHistory = 'approval-status-history-icon',
  dialogApprovalHistoryCRCPersonnel = 'crc-personnel-item',
  dialogApprovalHistoryRationale = 'rationale-item',
  dialogApprovalHistoryDate = 'date-item',
  dialogApprovalHistoryAction = 'action-item',
  caseFileActivityTab = 'item-text-0',
  pageTitle = 'page-title',
}

export class FinancialAssistanceDetailsPage {
  private addPaymentLineButton = { selector: DataTest.addPaymentLineBtn };

  private submitAssistanceButton = { selector: DataTest.submitAssistanceButton };

  private dialogCancel = { selector: DataTest.dialogCancel };

  private dialogSubmit = { selector: DataTest.dialogSubmit };

  private dialogCancellationReasonETransfer = { selector: DataTest.dialogCancellationReasonETransfer };

  private dialogCancellationReasonETransferItems = { selector: DataTest.dialogCancellationReasonETransferItems };

  private selectSupervisor = { selector: DataTest.selectSupervisor };

  private backToFinancialAssistance = { selector: DataTest.backToFinancialAssistance };

  private financialAssistanceApprovalStatus = { selector: DataTest.financialAssistanceApprovalStatus };

  private paymentLineStatus = { selector: DataTest.paymentLineStatus };

  private paymentLineGroup = { selector: DataTest.paymentLineGroup };

  private itemTitle = { selector: DataTest.itemTitle };

  private totalAmount = { selector: DataTest.totalAmount };

  private statusNew = { selector: DataTest.statusNew };

  private statusInProgress = { selector: DataTest.statusInProgress };

  private statusSent = { selector: DataTest.statusSent };

  private statusIssued = { selector: DataTest.statusIssued };

  private statusCompleted = { selector: DataTest.statusCompleted };

  private statusCancelled = { selector: DataTest.statusCancelled };

  private itemAmount = { selector: DataTest.itemAmount };

  private paymentGroupList = { selector: DataTest.paymentGroupList };

  private approvalStatusHistory = { selector: DataTest.approvalStatusHistory };

  private dialogApprovalHistoryCRCPersonnel = { selector: DataTest.dialogApprovalHistoryCRCPersonnel };

  private dialogApprovalHistoryRationale = { selector: DataTest.dialogApprovalHistoryRationale };

  private dialogApprovalHistoryDate = { selector: DataTest.dialogApprovalHistoryDate };

  private dialogApprovalHistoryAction = { selector: DataTest.dialogApprovalHistoryAction };

  private caseFileActivityTab = { selector: DataTest.caseFileActivityTab };

  private pageTitle = { selector: DataTest.pageTitle };

  public getAddPaymentLineButton() {
    return cy.getByDataTest(this.addPaymentLineButton);
  }

  public getBackToFinancialAssistanceButton() {
    return cy.getByDataTest(this.backToFinancialAssistance);
  }

  public getSubmitAssistanceButton() {
    return cy.getByDataTest(this.submitAssistanceButton);
  }

  public getDialogSubmitFinancialAssistanceButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }

  public getDialogCancelFinancialAssistanceButton() {
    return cy.getByDataTest(this.dialogCancel);
  }

  public getFinancialAssistanceApprovalStatus() {
    return cy.getByDataTest(this.financialAssistanceApprovalStatus).getAndTrimText();
  }

  public getPaymentLineGroupTitle() {
    return cy.getByDataTest(this.paymentLineGroup);
  }

  public getPaymentLineItemAmountField() {
    return cy.getByDataTest(this.itemAmount);
  }

  public getPaymentGroupListField() {
    return cy.getByDataTest(this.paymentGroupList);
  }

  public getCancellationReasonField() {
    return cy.getByDataTest(this.dialogCancellationReasonETransfer).click();
  }

  public getCancellationReasonFieldItems() {
    return cy.getByDataTestLike(this.dialogCancellationReasonETransferItems);
  }

  public chooseAnyCancellationReason() {
    return cy.selectListElementByIndex(DataTest.dialogCancellationReasonETransfer, 1);
  }

  public getPaymentLineStatus() {
    return cy.getByDataTest(this.paymentLineStatus).getAndTrimText();
  }

  public getPaymentLineStatusElement() {
    return cy.getByDataTest(this.paymentLineStatus);
  }

  public getPaymentLineStatusIssued() {
    return cy.getByDataTest(this.statusIssued);
  }

  public selectPaymentLineStatus(status: string) {
    const mapPaymentLineStatus = {
    Issued: this.statusIssued,
    Completed: this.statusCompleted,
    Cancelled: this.statusCancelled,
    Inprogress: this.statusInProgress,
    New: this.statusNew,
    Sent: this.statusSent,
    } as Record<string, { selector: DataTest }>;

    cy.getByDataTest(this.paymentLineStatus).click().then(() => {
      cy.getByDataTest(mapPaymentLineStatus[status]).click();
    });
  }

  public getDialogSubmitButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.dialogCancel);
  }

  public getDialogSelectSupervisorDropdown() {
    return cy.getByDataTest(this.selectSupervisor);
  }

  public refreshUntilApproverGroupVisible() {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => cy.contains('You are submitting the following financial assistance payment').should('be.visible'),
        checkCondition: () => !Cypress.$("[data-test='approval_action_warning']").length,
        actionsAfterReload: () => cy.get("[data-test='submit']").should('be.visible').click(),
      },
      {
        timeoutInSec: 50,
        intervalInSec: 10,
        errorMsg: 'Failed to find approver group',
      },
    );
  }

  public selectFirstAvailableSupervisor() {
    cy.selectListElementByIndex(DataTest.selectSupervisor, 0);
  }

  public goToFinancialAssistanceHomePage() {
    return cy.getByDataTest(this.backToFinancialAssistance).click();
  }

  public getPaymentModalityGroup() {
    return cy.getByDataTest(this.itemTitle).getAndTrimText();
  }

  public getPaymentAmount() {
    return cy.getByDataTest(this.totalAmount).getAndTrimText();
  }

  public getApprovalHistory() {
    return cy.getByDataTest(this.approvalStatusHistory).click();
  }

  public getApprovalHistoryCRCPersonnelByIndex(index: number) {
    return cy.getByDataTest(this.dialogApprovalHistoryCRCPersonnel).eq(index).getAndTrimText();
  }

  public getApprovalHistoryActionByIndex(index: number) {
    return cy.getByDataTest(this.dialogApprovalHistoryAction).eq(index).getAndTrimText();
  }

  public getApprovalHistoryDateSubmittedByIndex(index: number) {
    return cy.getByDataTest(this.dialogApprovalHistoryDate).eq(index).getAndTrimText();
  }

  public getApprovalHistoryRationaleByIndex(index: number) {
    return cy.getByDataTest(this.dialogApprovalHistoryRationale).eq(index).getAndTrimText();
  }

  public closeDialogApprovalStatusHistory() {
    return cy.getByDataTest(this.dialogCancel).click();
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileActivityTab).click();
    return new CaseFileDetailsPage();
  }

  public closeConfirmationMessageAndGoToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileActivityTab).click();
    cy.getByDataTest(this.dialogSubmit).click();
    return new CaseFileDetailsPage();
  }

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }
}
