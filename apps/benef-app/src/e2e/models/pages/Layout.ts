import { Selector, t } from 'testcafe';

class Layout {
    backButton: Selector;

    nextButton: Selector;

    privacyStatementTab: Selector;

    personalInformationTab: Selector;

    AddressesTab: Selector;

    HouseholdMemberTab: Selector;

    ReviewRegistrationTab: Selector;

    constructor() {
      this.backButton = Selector('button').withAttribute('data-test', 'backButton');
      this.nextButton = Selector('button').withAttribute('data-test', 'nextButton');
      this.privacyStatementTab = Selector('div').withAttribute('data-test', 'registration-tab-privacy');
      this.personalInformationTab = Selector('div').withAttribute('data-test', 'registration-tab-personalInfo');
      this.AddressesTab = Selector('div').withAttribute('data-test', 'registration-tab-addresses');
      this.HouseholdMemberTab = Selector('div').withAttribute('data-test', 'registration-tab-additionalMembers');
      this.ReviewRegistrationTab = Selector('div').withAttribute('data-test', 'registration-tab-review');
    }

    async goTo(target: 'privacyStatement' | 'personalInformation' | 'addresses' | 'householdMembers' | 'review') {
      switch (target) {
        case 'privacyStatement': await t.click(this.privacyStatementTab());
          break;
        case 'personalInformation': await t.click(this.personalInformationTab());
          break;
        case 'addresses': await t.click(this.AddressesTab());
          break;
        case 'householdMembers': await t.click(this.HouseholdMemberTab());
          break;
        case 'review': await t.click(this.ReviewRegistrationTab());
          break;
        default: break;
      }
    }

    async goNext() {
      await t.click(this.nextButton());
    }

    async goBack() {
      await t.click(this.backButton());
    }
}

export default new Layout();
