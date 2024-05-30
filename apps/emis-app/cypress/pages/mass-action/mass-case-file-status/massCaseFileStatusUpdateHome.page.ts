import { NewMassCaseFileStatusUpdatePage } from './newMassCaseFileStatusUpdate.page';

export enum DataTest {
  createCaseFileStatusMassAction = 'create-case-file-status-mass-action',
  listCaseFileStatusMassAction = 'mass-action-case-file-status-add-list',
  fileCaseFileStatusMassAction = 'mass-action-case-file-status-add-file',
}

export class MassCaseFileStatusUpdateHomePage {
  private createCaseFileStatusMassAction = { selector: DataTest.createCaseFileStatusMassAction, type: 'button' };

  private listCaseFileStatusMassAction = { selector: DataTest.listCaseFileStatusMassAction };

  private fileCaseFileStatusMassAction = { selector: DataTest.fileCaseFileStatusMassAction };

  public getAddMassCaseFileStatusButton() {
    return cy.getByDataTest(this.createCaseFileStatusMassAction);
  }

  public selectProcessViaFileUpload() {
    cy.getByDataTest(this.fileCaseFileStatusMassAction).click({ force: true });
    return new NewMassCaseFileStatusUpdatePage();
  }
}
