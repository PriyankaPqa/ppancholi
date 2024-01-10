import { PersonalInformationPage } from '@libs/cypress-lib/pages/registration/personalInformation.page';

export enum DataTest {
  middleName = 'personalInfo__middleName',
  save = 'dialog-submit-action',
}

export class EditHouseholdProfilePage extends PersonalInformationPage {
  private middleName = { selector: DataTest.middleName, type: 'input' };

  private save = { selector: DataTest.save };

  public fillMiddleName(name: string) {
    cy.getByDataTest(this.middleName).type(name);
  }

  public saveEdit() {
    cy.getByDataTest(this.save).click();
  }
}
