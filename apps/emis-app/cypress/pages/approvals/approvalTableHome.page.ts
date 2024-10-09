import { ApprovalTableDetailsPage } from './approvalTableDetails.page';

export enum DataTest {
  approvalTableDetails = 'approval_table_details-link',
  approvalTableRefreshButton = 'approval-tables_refresh_button',
}

export class ApprovalTableHomePage {
  private approvalTableDetails = { selector: DataTest.approvalTableDetails };

  private approvalTableRefreshButton = { selector: DataTest.approvalTableRefreshButton };

  public waitAndRefreshUntilApprovalTableVisible(approvalTableId: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => cy.getByDataTest(this.approvalTableRefreshButton).contains('Refresh').should('be.visible'),
        checkCondition: () => Cypress.$(`[data-test='${this.approvalTableDetails.selector}_${approvalTableId}']`).length > 0,
      },
      {
        timeoutInSec: 60,
        errorMsg: 'Failed to find approval table',
        foundMsg: 'Approval table created',
      },
    );
  }

  public getApprovalTableDetails(approvalTableId: string) {
    cy.getByDataTest({ selector: `${this.approvalTableDetails.selector}_${approvalTableId}` }).click();
    return new ApprovalTableDetailsPage();
  }
}
