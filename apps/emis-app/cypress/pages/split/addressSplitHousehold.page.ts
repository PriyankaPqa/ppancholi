import { AddressPage } from '@libs/cypress-lib/pages/registration/address.page';
import { HouseholdMembersAfterSplitPage } from './householdMembersAfterSplit.page';
import { ReviewSplitInformationPage } from './reviewSplitInformation.page';

export class AddressSplitHouseholdPage extends AddressPage {
  goToHouseholdMembersAfterSplitPage() {
    this.goToHouseholdMembersPage();
    return new HouseholdMembersAfterSplitPage();
  }

  public goToReviewSplitInformationPage() {
    this.goToHouseholdMembersPage();
    return new ReviewSplitInformationPage();
  }
}
