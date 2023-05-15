export enum DataTest {
  frequency = 'assessmentTemplate_details_frequency',
  assessmentStatus = 'assessmentTemplate_details_status',
}

export class AssessmentDetailsPage {
  private frequency = { selector: DataTest.frequency };

  private assessmentStatus = { selector: DataTest.assessmentStatus };

  public getFrequency() {
    return cy.getByDataTestLike(this.frequency);
  }

  public getAssessmentStatusTag() {
    return cy.getByDataTestLike(this.assessmentStatus).invoke('text').then((text) => text.trim());
  }
}
