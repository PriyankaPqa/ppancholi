export enum DataTest {
  frequency = 'assessmentTemplate_details_frequency',
  assessmentStatus = 'assessmentTemplate_details_status',
  savePartialAssessmentsSurveyResults = 'assessmentTemplate_details_savePartialSurveyResults',
}

export class AssessmentDetailsPage {
  private frequency = { selector: DataTest.frequency };

  private assessmentStatus = { selector: DataTest.assessmentStatus };

  private savePartialAssessmentsSurveyResults = { selector: DataTest.savePartialAssessmentsSurveyResults };

  public getFrequency() {
    return cy.getByDataTestLike(this.frequency);
  }

  public getAssessmentStatusTag() {
    return cy.getByDataTestLike(this.assessmentStatus).getAndTrimText();
  }

  public getSavePartialAssessmentsResultsElement() {
    return cy.getByDataTestLike(this.savePartialAssessmentsSurveyResults);
  }
}
