import { PrivacyStatementPage } from '@libs/cypress-lib/pages/registration/privacyStatement.page';
import { PersonalInfoSplitMemberPage } from '../split/personalInfoSplitMember.page';

export enum DataTest {
  displayedUserName = 'privacyCRCUsername',
  privacyRegistration = 'privacyRegistrationMethod',
}

export interface ICRCPrivacyStatementPageFields {
  privacyRegistrationMethod?:string;
  userName?:string;
}

export enum PrivacyRegistrationMethod {
  'Phone' = 'Phone',
}

export class CRCPrivacyStatementPage extends PrivacyStatementPage {
  private displayedUserName = { selector: DataTest.displayedUserName, type: 'input' };

  public fillUserNameIfEmpty(name: string) {
    cy.getByDataTest(this.displayedUserName).then((inputField) => {
      if (inputField.val() === '') {
        cy.getByDataTest(this.displayedUserName).type(name);
      }
    });
  }

  public fillPrivacyRegistrationMethod(registrationMethod: string) {
    cy.selectListElementByValue(DataTest.privacyRegistration, registrationMethod);
  }

  public goToPersonalInfoSplitMemberPage() {
    this.goToPersonalInfoPage();
    return new PersonalInfoSplitMemberPage();
  }
}
