import { CreateFinancialAssistanceTablePage } from './createFinancialAssistanceTable.page';

export enum DataTest {
  name = 'eventDetail-link',
  status = 'chip-text',
  edit = 'edit_financial_assistance',
  createTableButton = 'create-financial-assistance-table-button',
  createNewTable = 'financialAssistanceTables__createNew',
}

export class FinancialAssistancePage {
  private tableName = { selector: DataTest.name };

  private tableStatus = { selector: DataTest.status };

  private tableEdit = { selector: DataTest.edit };

  private createTableButton = { selector: DataTest.createTableButton, type: 'button' };

  private createNewTable = { selector: DataTest.createNewTable };

  public getTableName() {
    return cy.getByDataTest(this.tableName).invoke('text').then((text) => text.trim());
  }

  public getTableStatus() {
    return cy.getByDataTest(this.tableStatus).invoke('text').then((text) => text.trim());
  }

  public getTableEditButton() {
    return cy.getByDataTestLike(this.tableEdit);
  }

  public getCreateFATableButton() {
    return cy.getByDataTest(this.createTableButton);
  }

  public createNewFATable() {
    cy.getByDataTest(this.createNewTable).click();
    return new CreateFinancialAssistanceTablePage();
  }
}
