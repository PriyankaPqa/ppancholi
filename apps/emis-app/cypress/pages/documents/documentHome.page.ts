import { AddDocumentPage } from './addDocument.page';

export enum DataTest {
  title = 'table_title',
  addDocument = 'table__addButton',
}

export class DocumentHomePage {
  private title = { selector: DataTest.title };

  private documentAdd = { selector: DataTest.addDocument };

  public getPageTitle() {
    return cy.getByDataTest(this.title);
  }

  public addDocumentButton() {
    return cy.getByDataTest(this.documentAdd);
  }

  public addDocument() {
    cy.getByDataTest(this.documentAdd).click();
    return new AddDocumentPage();
  }
}
