import { ApprovalTableDetailsPage } from './approvalTableDetails.page';

export enum DataTest {
  approvalTableDetails = 'approval_table_details-link',
  }

  export class ApprovalTableHomePage {
    private approvalTableDetails = { selector: DataTest.approvalTableDetails };

    public getApprovalTableDetails() {
      cy.getByDataTest(this.approvalTableDetails).click();
      return new ApprovalTableDetailsPage();
    }
  }
