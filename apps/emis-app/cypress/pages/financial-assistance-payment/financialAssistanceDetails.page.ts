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
}

export class FinancialAssistanceDetailsPage {
  private addPaymentLineButton = { selector: DataTest.addPaymentLineBtn };

  private submitAssistanceButton = { selector: DataTest.submitAssistanceButton };

  private dialogCancel = { selector: DataTest.dialogCancel };

  private dialogSubmit = { selector: DataTest.dialogSubmit };

  private dialogCancellationReasonETransfer = { selector: DataTest.dialogCancellationReasonETransfer, type: 'input' };

  private dialogCancellationReasonETransferItems = { selector: DataTest.dialogCancellationReasonETransferItems };

  private selectSupervisor = { selector: DataTest.selectSupervisor };

  private backToFinancialAssistance = { selector: DataTest.backToFinancialAssistance };

  private financialAssistanceApprovalStatus = { selector: DataTest.financialAssistanceApprovalStatus };

  private paymentLineStatus = { selector: DataTest.paymentLineStatus };

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
    return cy.getByDataTest(this.financialAssistanceApprovalStatus).invoke('text').then((text) => text.trim());
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
    return cy.getByDataTest(this.paymentLineStatus).invoke('text').then((text) => text.trim());
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

  public getDialogSubmitConfirmCancellationButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }

  public getDialogCancelConfirmCancellationButton() {
    return cy.getByDataTest(this.dialogCancel);
  }

  public getDialogSelectSupervisorDropdown() {
    return cy.getByDataTest(this.selectSupervisor);
  }

  public selectAvailableSupervisor() {
    cy.selectListElementByIndex(DataTest.selectSupervisor, 0);
  }

  public goToFinancialAssistanceHomePage() {
    return cy.getByDataTest(this.backToFinancialAssistance).click();
  }

  public getPaymentModalityGroup() {
    return cy.getByDataTest(this.itemTitle).invoke('text').then((text) => text.trim());
  }

  public getPaymentAmount() {
    return cy.getByDataTest(this.totalAmount).invoke('text').then((text) => text.trim());
  }
}
