export enum DataTest {
  searchInput = 'search-input',
  assessmentTable = 'table',
  addAssessment = 'select_undefined',
}

export class AddAssessmentsPage {
  private searchInput = { selector: DataTest.searchInput };

  private assessmentTable = { selector: DataTest.assessmentTable };

  private addAssessment = { selector: DataTest.addAssessment };

  public getSearchAssessmentsField() {
    return cy.getByDataTest(this.searchInput);
  }

  public getAssessmentsTable() {
    return cy.getByDataTestLike(this.assessmentTable);
  }

  public getAddAssessmentButton() {
    return cy.getByDataTestLike(this.addAssessment);
  }
}
