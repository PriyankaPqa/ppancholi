import { NewMassCommunicationPage } from './newMassCommunication.page';

export enum DataTest {
  createMassCommunication = 'create-mass-communication',
  addMassCommunicationViaList = 'add-mass-communication-via-list',
  addMassCommunicationViaFile = 'add-mass-communication-via-file',
}

export class MassCommunicationHomePage {
  private createMassCommunication = { selector: DataTest.createMassCommunication, type: 'button' };

  private addMassCommunicationViaList = { selector: DataTest.addMassCommunicationViaList };

  private addMassCommunicationViaFile = { selector: DataTest.addMassCommunicationViaFile };

  public getAddNewMassCommunicationButton() {
    return cy.getByDataTest(this.createMassCommunication);
  }

  public goToCreateMassCommunicationViaFileUploadPage() {
    cy.getByDataTest(this.addMassCommunicationViaFile).click({ force: true });
    return new NewMassCommunicationPage();
  }
}
