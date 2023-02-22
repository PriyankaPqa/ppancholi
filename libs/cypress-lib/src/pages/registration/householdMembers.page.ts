import { AddHouseholdMembersPage } from './addHouseholdMembers.page';

import { ReviewRegistrationPage } from './reviewRegistration.page';

export enum DataTest {
  additionalMember = 'add-additionalMember',
  nextButton = 'nextButton',
  additionalMemberInfo = 'additionalMember__identity',
}

export class HouseholdMembersPage {
  private additionalMember = { selector: DataTest.additionalMember };

  private nextButton = { selector: DataTest.nextButton };

  private additionalMemberInfo = { selector: DataTest.additionalMemberInfo };

  public addMember() {
    cy.getByDataTest(this.additionalMember).click();
    return new AddHouseholdMembersPage();
  }

  public goToReviewPage() {
    cy.getByDataTest(this.nextButton).click();
    return new ReviewRegistrationPage();
  }

  public getAdditionalMemberDetails(index: number) {
    return cy.getByDataTest(this.additionalMemberInfo).eq(index).invoke('text').then((text) => text.trim());
  }
}
