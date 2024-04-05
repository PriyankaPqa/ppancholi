export enum DataTest {
  addFinancialAssistanceButton = 'table__addButton',
  financialAssistanceTableTitle = 'table_title',
}

export class CaseFileFinancialAssistanceHomePage {
  private addFinancialAssistanceButton = { selector: DataTest.addFinancialAssistanceButton, type: 'button' };

  private financialAssistanceTableTitle = { selector: DataTest.financialAssistanceTableTitle };

  public getAddFinancialAssistanceButton() {
    return cy.getByDataTest(this.addFinancialAssistanceButton);
  }

  public getFinancialAssistanceTableTitle() {
    return cy.getByDataTest(this.financialAssistanceTableTitle);
  }
}
