import { ConfirmationPage } from '@libs/cypress-lib/pages/registration/confirmation.page';
import { CaseFilesHomePage } from '../casefiles/caseFilesHome.page';

export enum DataTest {
  newRegistrationButton = 'new-registration-button',
}
export class ConfirmHouseholdAssociationPage extends ConfirmationPage {
  private newRegistrationButton = { selector: DataTest.newRegistrationButton };

  public getNewRegistrationButton() {
    return cy.getByDataTest(this.newRegistrationButton);
  }

  public goToCaseFiles() {
    this.closeRegistration();
    return new CaseFilesHomePage();
  }
}
