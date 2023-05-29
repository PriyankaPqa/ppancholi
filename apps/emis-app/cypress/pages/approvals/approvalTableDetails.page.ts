export enum DataTest {
  groupTable = 'approvalDetail_groupTable',
  programName = 'approvalDetail_programName',
  approvalName = 'approvalDetail_approval_name',
  approvalStatus = 'approvalDetail_approval_status',
  approvalEdit = 'approval_edit_button',
  }

  export class ApprovalTableDetailsPage {
    private groupTable = { selector: DataTest.groupTable };

    private programName = { selector: DataTest.programName };

    private approvalName = { selector: DataTest.approvalName };

    private approvalStatus = { selector: DataTest.approvalStatus };

    private approvalEdit = { selector: DataTest.approvalEdit };

    public getApprovalGroupDetails() {
      return cy.getByDataTest(this.groupTable);
    }

    public getProgramName() {
      return cy.getByDataTest(this.programName).invoke('text').then((text) => text.trim());
    }

    public getApprovalTableName() {
      return cy.getByDataTest(this.approvalName).invoke('text').then((text) => text.trim());
    }

    public getApprovalStatus() {
      return cy.getByDataTest(this.approvalStatus).invoke('text').then((text) => text.trim());
    }

    public getApprovalEditButton() {
      return cy.getByDataTest(this.approvalEdit);
    }
  }
