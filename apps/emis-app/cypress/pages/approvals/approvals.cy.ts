import { FinancialAssistanceDetailsPage } from '../financial-assistance-payment/financialAssistanceDetails.page';

export enum DataTest {
  actionButton = 'action_button_',
  pendingRequestsTable = 'approval-requests-table-pending',
  approvedRequestsTable = 'approval-requests-table-approved',
  titleDialog = 'dialog-title',
  pageTitle = 'page-title',
  approvalActionDeclined = 'approval_action_action_declined',
  approvalActionRequestInfo = 'approval_action_action_requestInfo',
  approvalActionRequestApproved = 'approval_action_action_approved',
  confirmCheckbox = 'checkbox_confirmed',
  approvalActionRationale = 'approval_action_rationale',
  approvalActionSubmit = 'dialog-submit-action',
  faPaymentLink = 'approval_requests_fa-link_',
  selectSupervisor = 'approval_action_supervisor',
  approvedRequestsTab = 'approval.requests.title.--Approved',
  submittedBy = 'submitted_by_fa_id_',
  submittedTo = 'submitted_to_fa_id_',
  submissionDate = 'submission_date_fa_id_',
  actionsCheckIcon = 'check_icon_',
  searchField = 'search',
  }

  export class ApprovalsPage {
    private actionButton = { selector: DataTest.actionButton };

    private pendingRequestsTable = { selector: DataTest.pendingRequestsTable };

    private approvedRequestsTable = { selector: DataTest.approvedRequestsTable };

    private titleDialog = { selector: DataTest.titleDialog };

    private approvalActionDeclined = { selector: DataTest.approvalActionDeclined, type: 'input' };

    private approvalActionRequestInfo = { selector: DataTest.approvalActionRequestInfo, type: 'input' };

    private approvalActionRequestApproved = { selector: DataTest.approvalActionRequestApproved, type: 'input' };

    private confirmCheckboxField = { selector: DataTest.confirmCheckbox };

    private confirmCheckbox = { selector: DataTest.confirmCheckbox, type: 'input' };

    private approvalActionRationale = { selector: DataTest.approvalActionRationale, type: 'textarea' };

    private approvalActionSubmit = { selector: DataTest.approvalActionSubmit };

    private selectSupervisor = { selector: DataTest.selectSupervisor };

    private faPaymentLink = { selector: DataTest.faPaymentLink };

    private approvedRequestsTab = { selector: DataTest.approvedRequestsTab };

    private pageTitle = { selector: DataTest.pageTitle };

    private searchField = { selector: DataTest.searchField, type: 'input' };

    public clickActionsButtonByPaymentId(faPaymentId: string) {
      cy.getByDataTest({ selector: `${DataTest.actionButton}${faPaymentId}` }).click();
      return new FinancialAssistanceDetailsPage();
    }

    public getPendingRequestsTable() {
      return cy.getByDataTest(this.pendingRequestsTable);
    }

    public getApprovedRequestsTable() {
      return cy.getByDataTest(this.approvedRequestsTable);
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

    public checkApprovalActionRequestApproved() {
      return cy.getByDataTest(this.approvalActionRequestApproved).check({ force: true });
    }

    public selectSupervisorForApproval(roleName: string) {
      cy.searchAndSelect(DataTest.selectSupervisor, roleName);
    }

    public getLabelConfirmedCheckboxField() {
      return cy.getByDataTest(this.confirmCheckboxField);
    }

    public getSelectSupervisorField() {
      return cy.getByDataTest(this.selectSupervisor);
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

    public refreshUntilApproverSupervisorVisible(faPaymentId: string) {
      cy.waitAndRefreshUntilConditions(
        {
          visibilityCondition: () => this.getSelectSupervisorField().should('be.visible'),
          checkCondition: () => Cypress.$("div[data-test='approval_action_supervisor']").length > 0,
          actionsAfterReload: () => {
            cy.contains('Pending requests').should('be.visible');
            this.clickActionsButtonByPaymentId(faPaymentId);
            this.checkApprovalActionRequestApproved();
          },
        },
        {
          timeoutInSec: 5,
          intervalInSec: 10,
          errorMsg: 'Failed to find approver supervisor',
          foundMsg: 'Approver supervisor found',
        },
      );
    }

    public getActionsButtonByPaymentId(faPaymentId: string) {
      return cy.getByDataTest({ selector: `${DataTest.actionButton}${faPaymentId}` });
    }

    public getFAPaymentElementById(faPaymentId: string) {
      return cy.getByDataTest({ selector: `${DataTest.faPaymentLink}${faPaymentId}` });
    }

    public getSubmittedByUserNameUsingPaymentId(faPaymentId: string) {
      return cy.getByDataTest({ selector: `${DataTest.submittedBy}${faPaymentId}` }).getAndTrimText();
    }

    public getSubmittedToUserNameUsingPaymentId(faPaymentId: string) {
      return cy.getByDataTest({ selector: `${DataTest.submittedTo}${faPaymentId}` }).getAndTrimText();
    }

    public getDateSubmittedUsingPaymentId(faPaymentId: string) {
      return cy.getByDataTest({ selector: `${DataTest.submissionDate}${faPaymentId}` }).getAndTrimText();
    }

    public getActionIconElementUsingPaymentId(faPaymentId: string) {
      return cy.getByDataTest({ selector: `${DataTest.actionsCheckIcon}${faPaymentId}` });
    }

    public getApprovedRequestsTab() {
      return cy.getByDataTest({ selector: `"${DataTest.approvedRequestsTab}"` }).click();
    }

    public getPageTitle() {
      return cy.getByDataTest(this.pageTitle);
    }

    public searchApprovalTableFor(caseFileNumber: string, faPaymentId: string) {
      cy.typeAndWaitUntilSearchResultsVisible(caseFileNumber, DataTest.searchField, `${DataTest.faPaymentLink}${faPaymentId}`);
    }
  }
