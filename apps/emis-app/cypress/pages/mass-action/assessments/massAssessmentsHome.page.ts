import { NewMassAssessmentsPage } from './newMassAssessments.page';

export enum DataTest {
  createMassAssessments = 'create-assessments-mass-action',
  addMassAssessmentsViaList = 'add-mass-assessments-via-list',
  addMassAssessmentsViaFile = 'add-mass-assessments-via-file',
}

export class MassAssessmentsHomePage {
  private createMassAssessments = { selector: DataTest.createMassAssessments, type: 'button' };

  private addMassAssessmentsViaList = { selector: DataTest.addMassAssessmentsViaList };

  private addMassAssessmentsViaFile = { selector: DataTest.addMassAssessmentsViaFile };

  public getAddNewMassAssessmentsButton() {
    return cy.getByDataTest(this.createMassAssessments);
  }

  public goToCreateMassAssessmentsViaFileUploadPage() {
    cy.getByDataTest(this.addMassAssessmentsViaFile).click({ force: true });
    return new NewMassAssessmentsPage();
  }
}
