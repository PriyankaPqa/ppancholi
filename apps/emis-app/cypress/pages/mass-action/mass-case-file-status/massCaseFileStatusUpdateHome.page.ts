import { MassCaseFileStatusUpdateDetailsPage } from './massCaseFileStatusUpdateDetails.page';
import { BaseMassActionViaFilteredList } from '../base/baseMassActionViaFilteredList';
import { NewMassCaseFileStatusUpdatePage } from './newMassCaseFileStatusUpdate.page';

export enum DataTest {
  createCaseFileStatusMassAction = 'create-case-file-status-mass-action',
  listCaseFileStatusMassAction = 'mass-action-case-file-status-add-list',
  fileCaseFileStatusMassAction = 'mass-action-case-file-status-add-file',
  massAction = 'massAction-name',
}

export class MassCaseFileStatusUpdateHomePage {
  private createCaseFileStatusMassAction = { selector: DataTest.createCaseFileStatusMassAction, type: 'button' };

  private listCaseFileStatusMassAction = { selector: DataTest.listCaseFileStatusMassAction };

  private fileCaseFileStatusMassAction = { selector: DataTest.fileCaseFileStatusMassAction };

  private massAction = { selector: DataTest.massAction };

  public getAddMassCaseFileStatusButton() {
    return cy.getByDataTest(this.createCaseFileStatusMassAction);
  }

  public selectProcessViaFileUpload() {
    cy.getByDataTest(this.fileCaseFileStatusMassAction).click({ force: true });
    return new NewMassCaseFileStatusUpdatePage();
  }

  public goToCreatedMassActionCaseFileStatus(massActionCaseStatusId: string) {
    const caseFileSelector = { selector: `${DataTest.massAction}-${massActionCaseStatusId}`, type: 'a' };
    cy.getByDataTest(caseFileSelector).click();
    return new MassCaseFileStatusUpdateDetailsPage();
  }

  public selectProcessViaFilteredList() {
    cy.getByDataTest(this.listCaseFileStatusMassAction).click({ force: true });
    return new BaseMassActionViaFilteredList();
  }
}
