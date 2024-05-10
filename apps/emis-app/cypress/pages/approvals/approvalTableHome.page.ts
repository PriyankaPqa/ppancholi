import { ApprovalTableDetailsPage } from './approvalTableDetails.page';

export enum DataTest {
  approvalTableDetails = 'approval_table_details-link',
}

export class ApprovalTableHomePage {
  private approvalTableDetails = { selector: DataTest.approvalTableDetails };

  public waitAndRefreshUntilApprovalTableVisible(approvalTableId: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => cy.contains('Refresh').should('be.visible'),
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
