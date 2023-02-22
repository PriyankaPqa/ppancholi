import { ReviewSplitInformationPage } from './reviewSplitInformation.page';

export enum DataTest {
  nextButton = 'nextButton',
  additionalMemberInfo = 'additionalMember__identity',
}

export class HouseholdMembersAfterSplitPage {
  private additionalMemberInfo = { selector: DataTest.additionalMemberInfo };

  private nextButton = { selector: DataTest.nextButton };

  public getAdditionalMemberDetails(index: number) {
    return cy.getByDataTest(this.additionalMemberInfo).eq(index).invoke('text').then((text) => text.trim());
  }

  public goToReviewSplitInformationPage() {
    cy.getByDataTest(this.nextButton).click();
    return new ReviewSplitInformationPage();
  }
}
