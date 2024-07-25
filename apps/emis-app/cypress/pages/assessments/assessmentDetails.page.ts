export enum DataTest {
  frequency = 'assessmentTemplate_details_frequency',
  assessmentStatus = 'assessmentTemplate_details_status',
  savePartialAssessmentsSurveyResults = 'assessmentTemplate_details_savePartialSurveyResults',
  pageTitle = 'assessmentTemplate_details_page_title',
}

export class AssessmentDetailsPage {
  private frequency = { selector: DataTest.frequency };

  private assessmentStatus = { selector: DataTest.assessmentStatus };

  private savePartialAssessmentsSurveyResults = { selector: DataTest.savePartialAssessmentsSurveyResults };

  private pageTitle = { selector: DataTest.pageTitle };

  public getFrequency() {
    return cy.getByDataTestLike(this.frequency);
  }

  public getPageTitleElement() {
    return cy.getByDataTest(this.pageTitle);
  }

  public getAssessmentStatusTag() {
    return cy.getByDataTestLike(this.assessmentStatus).getAndTrimText();
  }

  public getSavePartialAssessmentsResultsElement() {
    return cy.getByDataTestLike(this.savePartialAssessmentsSurveyResults);
  }
}
