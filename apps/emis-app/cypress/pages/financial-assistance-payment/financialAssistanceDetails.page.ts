export enum DataTest {
  addPaymentLineBtn = 'financial-addPaymentLineBtn',
  submitAssistanceButton = 'submit',
  dialogCancel = 'dialog-cancel-action',
  dialogSubmit = 'dialog-submit-action',
  backToFinancialAssistance = 'cancel',
  financialAssistanceApprovalStatus = 'approval_status',
  paymentLineStatus = 'statusSelect__chip',
  itemTitle = 'paymentLineItem__title',
  itemAmount = 'paymentLineItem__amount',
  totalAmount = 'paymentLineGroup__total',
  paymentGroupList = 'paymentGroupList',
  statusNew = 'statusSelect__1',
  statusInProgress = 'statusSelect__2',
  statusIssued = 'statusSelect__4',
  statusCompleted = 'statusSelect__5',
  statusCancelled = 'statusSelect__6',
}

export class FinancialAssistanceDetailsPage {
  private addPaymentLineButton = { selector: DataTest.addPaymentLineBtn };

  private submitAssistanceButton = { selector: DataTest.submitAssistanceButton };

  private dialogCancel = { selector: DataTest.dialogCancel };

  private dialogSubmit = { selector: DataTest.dialogSubmit };

  private backToFinancialAssistance = { selector: DataTest.backToFinancialAssistance };

  private financialAssistanceApprovalStatus = { selector: DataTest.financialAssistanceApprovalStatus };

  private paymentLineStatus = { selector: DataTest.paymentLineStatus };

  private itemTitle = { selector: DataTest.itemTitle };

  private totalAmount = { selector: DataTest.totalAmount };

  private statusNew = { selector: DataTest.statusNew };

  private statusInProgress = { selector: DataTest.statusInProgress };

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
