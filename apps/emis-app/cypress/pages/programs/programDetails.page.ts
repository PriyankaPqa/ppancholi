export enum DataTest {
programName = 'program-details-name',
editButton = 'edit-button',
iconCompletedAssessment = 'program-details-icon-eligibilityCriteria-completedAssessments',
completedAssessmentName = 'program-details-eligibilityCriteria-assessment-name',
assessmentName = 'assessment-0',
backToProgram = 'cancel',
}

export class ProgramDetailsPage {
  private programName = { selector: DataTest.programName };

  private editButton = { selector: DataTest.editButton };

  private iconCompletedAssessment = { selector: DataTest.iconCompletedAssessment };

  private completedAssessmentName = { selector: DataTest.completedAssessmentName };

  private assessmentName = { selector: DataTest.assessmentName };

  private backToProgram = { selector: DataTest.backToProgram };

  public getProgramName() {
    return cy.getByDataTest(this.programName).getAndTrimText();
  }

  public getEditButton() {
    return cy.getByDataTest(this.editButton);
  }

  public getIconCompletedAssessment() {
    return cy.getByDataTest(this.iconCompletedAssessment);
  }

  public getEligibilityCriteriaCompletedAssessmentName() {
    return cy.getByDataTest(this.completedAssessmentName).getAndTrimText();
  }

  public getAssessmentName() {
    return cy.getByDataTest(this.assessmentName).getAndTrimText();
  }

  public getBackToProgramButton() {
    return cy.getByDataTest(this.backToProgram);
  }
}
