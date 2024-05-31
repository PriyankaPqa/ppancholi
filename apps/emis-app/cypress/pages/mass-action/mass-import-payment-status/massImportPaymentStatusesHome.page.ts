import { NewMassImportPaymentStatusPage } from './newMassImportPaymentStatus.page';

export enum DataTest {
  createImportPaymentStatusesMassAction = 'table__addButton',
}

export class MassImportPaymentStatusesHomePage {
  private createImportPaymentStatusesMassAction = { selector: DataTest.createImportPaymentStatusesMassAction, type: 'button' };

  public goToNewMassImportPaymentStatus() {
    cy.getByDataTest(this.createImportPaymentStatusesMassAction).click();
    return new NewMassImportPaymentStatusPage();
  }
}
