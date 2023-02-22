import { PersonalInformationPage } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { AddressSplitHouseholdPage } from './addressSplitHousehold.page';

export class PersonalInfoSplitMemberPage extends PersonalInformationPage {
  goToAddressSplitHouseholdPage() {
    this.goToAddressPage();
    return new AddressSplitHouseholdPage();
 }
}
