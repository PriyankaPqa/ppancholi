import { NewMassFinancialAssistancePage } from '../mass-financial-assistance/newMassFinancialAssistance.page';

export enum DataTest {
filter = 'filterToolbar__showFilterBtn',
next = 'dialog-submit-action',
caseFileTable = 'massAction_caseFile_table',
eventSelect = 'filterToolbar__input-EntityEventId-select',
apply = 'dialog-apply-action',
}

export class BaseMassActionViaFilteredList {
  private filter = { selector: DataTest.filter };

  private next = { selector: DataTest.next };

  private caseFileTable = { selector: DataTest.caseFileTable };

  private eventSelect = { selector: DataTest.eventSelect, type: 'input' };

  private apply = { selector: DataTest.apply };

  public addFilter() {
    return cy.getByDataTest(this.filter).click();
  }

  public getCaseFileTable() {
    return cy.getByDataTest(this.caseFileTable);
  }

  public goToNewMassFinancialAssistancePage() {
    cy.getByDataTestLike(this.next).click();
    return new NewMassFinancialAssistancePage();
  }

  public enterEventName(eventName:string) {
    cy.searchAndSelect(DataTest.eventSelect, eventName);
  }

  public applyFilter() {
    cy.getByDataTest(this.apply).click();
  }
}
