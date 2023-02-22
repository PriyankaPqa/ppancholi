import { AddressPage } from '@libs/cypress-lib/pages/registration/address.page';
import { HouseholdMembersAfterSplitPage } from './householdMembersAfterSplit.page';

export class AddressSplitHouseholdPage extends AddressPage {
  goToHouseholdMembersAfterSplitPage() {
    this.goToHouseholdMembersPage();
    return new HouseholdMembersAfterSplitPage();
  }
}
