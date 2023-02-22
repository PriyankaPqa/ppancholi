export enum DataTest {
  caseFileActivityTitle = 'caseFileActivity-listItem-content-title',
  caseFileActivityBody = 'caseFileActivity-listItem-content-body',
  sortBy = 'caseFileActivity-case-file-activity-sort-select',
}

export class CaseFileActivityPage {
  private caseFileActivityTitle = { selector: DataTest.caseFileActivityTitle };

  private caseFileActivityBody = { selector: DataTest.caseFileActivityBody };

  public getCaseFileActivityTitles() {
    return cy.getByDataTest(this.caseFileActivityTitle).invoke('text').then((text) => text.trim());
  }

  public getCaseFileActivityBodies() {
    return cy.getByDataTest(this.caseFileActivityBody).invoke('text').then((text) => text.trim());
  }
}
