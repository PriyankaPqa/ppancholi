import { AddNewReferralPage } from './addNewReferral.page';

export enum DataTest {
  addReferralButton = 'table__addButton',
  titleTable = 'table_title',
}

export class ReferralsHomePage {
  private addReferralButton = { selector: DataTest.addReferralButton };

  private titleTable = { selector: DataTest.titleTable };

  public addReferral() {
    cy.getByDataTest(this.addReferralButton).click();
    return new AddNewReferralPage();
  }

  public getAddReferralButton() {
    return cy.getByDataTest(this.addReferralButton);
  }

  public getTableTitleElement() {
    return cy.getByDataTest(this.titleTable);
  }
}
