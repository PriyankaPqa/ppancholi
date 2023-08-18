import { FinancialAssistanceDetailsPage } from '../financial-assistance-payment/financialAssistanceDetails.page';

export enum DataTest {
  actionButton = 'action_button_',
  pendingRequestsTable = 'approval-requests-table-pending',
  titleDialog = 'dialog-title',
  approvalActionDeclined = 'approval_action_action_declined',
  approvalActionRequestInfo = 'approval_action_action_requestInfo',
  confirmCheckbox = 'checkbox_confirmed',
  approvalActionRationale = 'approval_action_rationale',
  approvalActionSubmit = 'dialog-submit-action',
  faPaymentLink = 'approval_requests_fa-link_',
  }

  export class ApprovalsPage {
    private actionButton = { selector: DataTest.actionButton };

    private pendingRequestsTable = { selector: DataTest.pendingRequestsTable };

    private titleDialog = { selector: DataTest.titleDialog };

    private approvalActionDeclined = { selector: DataTest.approvalActionDeclined, type: 'input' };

    private approvalActionRequestInfo = { selector: DataTest.approvalActionRequestInfo, type: 'input' };

    private confirmCheckboxField = { selector: DataTest.confirmCheckbox };

    private confirmCheckbox = { selector: DataTest.confirmCheckbox, type: 'input' };

    private approvalActionRationale = { selector: DataTest.approvalActionRationale, type: 'textarea' };

    private approvalActionSubmit = { selector: DataTest.approvalActionSubmit };

    private faPaymentLink = { selector: DataTest.faPaymentLink };

    public getActionsButtonByPaymentId(faPaymentId: string) {
      cy.getByDataTest({ selector: `${DataTest.actionButton}${faPaymentId}` }).click();
      return new FinancialAssistanceDetailsPage();
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

    public checkApprovalActionRequestInfo() {
      return cy.getByDataTest(this.approvalActionRequestInfo).check({ force: true });
    }

    public getLabelConfirmedCheckboxField() {
      return cy.getByDataTest(this.confirmCheckboxField);
    }

    public checkConfirmedCheckbox() {
      return cy.getByDataTest(this.confirmCheckbox).check({ force: true });
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
