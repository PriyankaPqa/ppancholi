import { BaseMassActionViaFilteredList } from '../base/baseMassActionViaFilteredList';

export enum DataTest {
  createFaMassAction = 'create-fa-mass-action',
  listFaMassAction = 'fa-mass-action-list',
}

export class MassFinancialAssistanceHomePage {
  private createFaMassAction = { selector: DataTest.createFaMassAction, type: 'button' };

  private listFaMassAction = { selector: DataTest.listFaMassAction };

  public getAddMassFinancialAssistanceButton() {
    return cy.getByDataTest(this.createFaMassAction);
  }

  public selectProcessViaFilteredList() {
    cy.getByDataTest(this.listFaMassAction).click({ force: true });
    return new BaseMassActionViaFilteredList();
  }
}
