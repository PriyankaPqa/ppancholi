import { BaseMassActionViaFilteredList } from '../base/baseMassActionViaFilteredList';
import { NewMassFinancialAssistancePage } from './newMassFinancialAssistance.page';

export enum DataTest {
  createFaMassAction = 'create-fa-mass-action',
  listFaMassAction = 'fa-mass-action-list',
  fileFaMassAction = 'fa-mass-action-file',
}

export class MassFinancialAssistanceHomePage {
  private createFaMassAction = { selector: DataTest.createFaMassAction, type: 'button' };

  private listFaMassAction = { selector: DataTest.listFaMassAction };

  private fileFaMassAction = { selector: DataTest.fileFaMassAction };

  public getAddMassFinancialAssistanceButton() {
    return cy.getByDataTest(this.createFaMassAction);
  }

  public selectProcessViaFilteredList() {
    cy.getByDataTest(this.listFaMassAction).click({ force: true });
    return new BaseMassActionViaFilteredList();
  }

  public selectProcessViaFileUpload() {
    cy.getByDataTest(this.fileFaMassAction).click({ force: true });
    return new NewMassFinancialAssistancePage();
  }
}
