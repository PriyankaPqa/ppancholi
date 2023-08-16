import { FinancialAssistanceDetailsPage } from '../financial-assistance-payment/financialAssistanceDetails.page';

export enum DataTest {
  actionButton = 'action_button',
  pendingRequestsTable = 'approval-requests-table-pending',
  titleDialog = 'dialog-title',
  approvalActionDeclined = 'approval_action_action_declined',
  confirmedDecline = 'checkbox_confirmed',
  approvalActionRationale = 'approval_action_rationale',
  approvalActionSubmit = 'dialog-submit-action',
  faPaymentLink = 'approval_requests_fa-link_',
  }

  export class ApprovalsPage {
    private actionButton = { selector: DataTest.actionButton };

    private pendingRequestsTable = { selector: DataTest.pendingRequestsTable };

    private titleDialog = { selector: DataTest.titleDialog };

    private approvalActionDeclined = { selector: DataTest.approvalActionDeclined, type: 'input' };

    private confirmedDeclineField = { selector: DataTest.confirmedDecline };

    private confirmedDeclineCheckbox = { selector: DataTest.confirmedDecline, type: 'input' };

    private approvalActionRationale = { selector: DataTest.approvalActionRationale, type: 'textarea' };

    private approvalActionSubmit = { selector: DataTest.approvalActionSubmit };

    private faPaymentLink = { selector: DataTest.faPaymentLink };

    public getActionsButton() {
      return cy.getByDataTest(this.actionButton);
    }

    public getPendingRequestsTable() {
      return cy.getByDataTest(this.pendingRequestsTable);
    }

    public getDialogTitle() {
      return cy.getByDataTest(this.titleDialog);
    }

    public checkApprovalActionDecline() {
      return cy.getByDataTest(this.approvalActionDeclined).check({ force: true });
    }

    public getLabelConfirmedDecline() {
      return cy.getByDataTest(this.confirmedDeclineField);
    }

    public checkConfirmedDecline() {
      return cy.getByDataTest(this.confirmedDeclineCheckbox).check({ force: true });
    }

    public enterApprovalActionRationale() {
      return cy.getByDataTest(this.approvalActionRationale);
    }

    public submitActionApproval() {
      return cy.getByDataTest(this.approvalActionSubmit).click();
    }

    public getFAPaymentById(faPaymentId: string) {
      cy.getByDataTest({ selector: `${DataTest.faPaymentLink}${faPaymentId}` }).click();
      return new FinancialAssistanceDetailsPage();
    }
  }
