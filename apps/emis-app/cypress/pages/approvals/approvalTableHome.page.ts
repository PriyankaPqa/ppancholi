import { ApprovalTableDetailsPage } from './approvalTableDetails.page';

export enum DataTest {
  approvalTableDetails = 'approval_table_details-link',
}

export class ApprovalTableHomePage {
  private approvalTableDetails = { selector: DataTest.approvalTableDetails };

  public waitAndRefreshUntilApprovalTableVisible(approvalTableName: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => cy.contains('Refresh').should('be.visible'),
        checkCondition: () => Cypress.$("[data-test='approval_table_details-link']").text().includes(approvalTableName),
      },
      {
        timeoutInSec: 60,
        errorMsg: 'Failed to find approval table',
        foundMsg: 'Approval table created',
      },
    );
  }

  public getApprovalTableDetails(index = 0) {
    cy.getByDataTest(this.approvalTableDetails).eq(index).click();
    return new ApprovalTableDetailsPage();
  }
}
