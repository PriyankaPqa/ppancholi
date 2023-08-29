import { IAssessmentBaseEntity } from '@libs/entities-lib/assessment-template';
import { AssessmentDetailsPage } from './assessmentDetails.page';

export enum DataTest {
  assessmentName = 'assessment-name',
  programSelect = 'assessmentTemplate__programSelect',
  assessmentDescription = 'assessment-description',
  publishStatus = 'assessment-switch-publishstatus',
  frequencyMultiple = 'assessment-form-frequency-multiple',
  savePartialResults = 'save-partial-survey-results',
  create = 'save',
}

export class CreateNewAssessmentPage {
  private assessmentName = { selector: DataTest.assessmentName, type: 'input' };

  private assessmentDescription = { selector: DataTest.assessmentDescription, type: 'textarea' };

  private publishStatus = { selector: DataTest.publishStatus };

  private frequencyMultiple = { selector: DataTest.frequencyMultiple, type: 'input' };

  private savePartialResults = { selector: DataTest.savePartialResults, type: 'input' };

  private create = { selector: DataTest.create };

  async fill(data: Partial<IAssessmentBaseEntity>) {
    if (data.name) {
      cy.getByDataTest(this.assessmentName).type(data.name.translation.en);
    }

    if (data.description) {
      cy.getByDataTest(this.assessmentDescription).type(data.description.translation.en);
    }
  }

  public savePartialAssessmentsResults() {
    cy.getByDataTest(this.savePartialResults).check({ force: true });
  }

  public togglePublishedStatus() {
    cy.getByDataTest(this.publishStatus).check({ force: true });
  }

  public checkFrequencyMultiple() {
    cy.getByDataTest(this.frequencyMultiple).check({ force: true });
  }

  public selectProgram(programName: string) {
    cy.searchAndSelect(DataTest.programSelect, programName);
  }

  public saveAssessment() {
    cy.getByDataTest(this.create).click();
    return new AssessmentDetailsPage();
  }
}
