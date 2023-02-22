import { ConfirmationPage } from '@libs/cypress-lib/pages/registration/confirmation.page';
import { ReviewRegistrationPage } from '@libs/cypress-lib/pages/registration/reviewRegistration.page';

export enum DataTest {
  nextButton = 'nextButton',
}

export class ReviewSplitInformationPage extends ReviewRegistrationPage {
  private next = { selector: DataTest.nextButton };

  public goToSplitConfirmationPage() {
    cy.getByDataTest(this.next).click();
    return new ConfirmationPage();
  }
}
