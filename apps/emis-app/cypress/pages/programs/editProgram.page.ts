import { ProgramDetailsPage } from './programDetails.page';

export enum DataTest {
  pageTitle = 'page-title',
  cancel = 'cancel',
  save = 'save',
  completedAssessment = 'program-eligibility-hasCompletedAssessments',
  programSelectAssessment = 'program-selectAssessment',
}

export class EditProgramPage {
  private pageTitle = { selector: DataTest.pageTitle };

  private cancel = { selector: DataTest.cancel };

  private save = { selector: DataTest.save };

  private completedAssessment = { selector: DataTest.completedAssessment, type: 'input' };

  private programSelectAssessment = { selector: DataTest.programSelectAssessment };

  public getPageTitle() {
    return cy.getByDataTest(this.pageTitle).getAndTrimText();
  }

  public getSaveButton() {
    return cy.getByDataTest(this.save);
  }

  public saveEdit() {
    cy.getByDataTest(this.save).click();
    return new ProgramDetailsPage();
  }

  public getCancelButton() {
    return cy.getByDataTest(this.cancel);
  }

  public checkCompletedAssessment() {
    return cy.getByDataTest(this.completedAssessment).check({ force: true });
  }

  public selectProgramAssessment(assessmentName: string) {
    return cy.selectListElementByValue(DataTest.programSelectAssessment, assessmentName);
  }
}
