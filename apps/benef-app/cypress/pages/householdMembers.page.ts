import { AddHouseholdMembersPage } from './addHouseholdMembers.page';

import { ReviewRegistrationPage } from './reviewRegistration.page';

export enum DataTest {
  additionalMember = 'add-additionalMember',
  nextButton = 'nextButton',
  additionalMemberInfo = 'additionalMember-identity',
}

export interface IFields {
  firstName?: string;
  lastName?: string;
  gender?: string;
  month?: string;
  dob?: string;
  language?: string;
  emailAddress?: string;
  indigenousIdentity?: string;
}

export class HouseholdMembersPage {
  private additionalMember = { selector: DataTest.additionalMember, type: 'button' };

  private nextButton = { selector: DataTest.nextButton, type: 'button' };

  private additionalMemberInfo = { selector: DataTest.additionalMemberInfo, type: 'div' };

  public addMember() {
    cy.getByDataTest(this.additionalMember).click();
    return new AddHouseholdMembersPage();
  }

  public saveAndGoToReviewPage() {
    cy.getByDataTest(this.nextButton).click();
    return new ReviewRegistrationPage();
  }

  public getNewMemberDetails() {
    return cy.getByDataTest(this.additionalMemberInfo).invoke('text').then((text) => text);
  }
}
