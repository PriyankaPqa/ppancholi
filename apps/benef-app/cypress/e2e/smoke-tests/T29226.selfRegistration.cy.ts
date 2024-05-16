import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { ReviewRegistrationPage } from '@libs/cypress-lib/pages/registration/reviewRegistration.page';
import { PrivacyStatementPage } from '@libs/cypress-lib/pages/registration/privacyStatement.page';
import { HouseholdMembersPage } from '@libs/cypress-lib/pages/registration/householdMembers.page';
import { PersonalInformationPage, PreferredLanguage } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { AddressPage } from '@libs/cypress-lib/pages/registration/address.page';
import { AddHouseholdMembersPage } from '@libs/cypress-lib/pages/registration/addHouseholdMembers.page';
import { ConfirmationPage } from '@libs/cypress-lib/pages/registration/confirmation.page';
import { fixturePrimaryMember, fixtureAddressData, fixtureAdditionalMemberPersonalData } from '../../fixtures/registration';
import { RegistrationPage } from '../../pages/registration.page';
import { useProvider } from '../../provider/provider';
import { buildRegistrationUrl } from '../../support/helpers/urlBuilder';

let privacyStatement: PrivacyStatementPage;
let personalInformation: PersonalInformationPage;
let address: AddressPage;
let householdMembers: HouseholdMembersPage;
let addHouseholdMembers: AddHouseholdMembersPage;
let reviewRegistration: ReviewRegistrationPage;
let confirmationPage: ConfirmationPage;

let provider = null as ReturnType<typeof useProvider>;
let event: IEventEntity;
before(() => {
  cy.getToken().then((accessToken) => {
    provider = useProvider(accessToken.access_token);
  });
});

describe('[T29226] SELF REG - Complete self registration..', { tags: ['@registration'] }, () => {
  beforeEach(() => {
    cy.then(async () => {
      event = await provider.events.createEvent(mockCreateEvent());
      await provider.events.toggleSelfRegistration(event.id, true);
      cy.goTo(buildRegistrationUrl(event));
    });
  });

  it('should register someone successfully', function () {
    const primaryMemberData = fixturePrimaryMember(this.test.retries.length);
    const addressData = fixtureAddressData(this.test.retries.length);
    const additionalMemberPersonalData = fixtureAdditionalMemberPersonalData(this.test.retries.length);
    const registrationPage = new RegistrationPage();

    cy.wrap(1).then(() => {
      privacyStatement = registrationPage.gotoRegistrationPage();
      // to check event displayed
      privacyStatement.getEventName().then((eventName) => {
      expect(eventName).to.include(event.name.translation.en);
      });
    }).then(() => {
      privacyStatement.getPrivacyCheckbox().should('not.be.checked');
      privacyStatement.getPrivacyCheckbox().click({ force: true }).should('be.checked');
      personalInformation = privacyStatement.goToPersonalInfoPage();
    }).then(() => {
      const roleName = '';
      personalInformation.fill(primaryMemberData, roleName);
      address = personalInformation.goToAddressPage();
    })
    .then(() => {
      address.fill(addressData);
      householdMembers = address.goToHouseholdMembersPage();
    })
    .then(() => {
      addHouseholdMembers = householdMembers.addMember();
      addHouseholdMembers.fill(additionalMemberPersonalData);
      addHouseholdMembers.addHouseholdMember();
      // verify that new member is added
      householdMembers.getAdditionalMemberDetails(0).should('string', `${additionalMemberPersonalData.firstName} ${additionalMemberPersonalData.lastName}`);
      reviewRegistration = householdMembers.goToReviewPage();
    })
    .then(() => {
      reviewRegistration.getFirstName().should('string', primaryMemberData.firstName);
      reviewRegistration.getLastName().should('string', primaryMemberData.lastName);
      reviewRegistration.getBirthDate().should('string', reviewRegistration.getDateOfBirthString(primaryMemberData.dateOfBirth));
      reviewRegistration.getPreferredLanguage().should('string', primaryMemberData.preferredLanguage);
      reviewRegistration.getGender().should('string', primaryMemberData.gender);
      reviewRegistration.getStreetHomeAddress().should('string', addressData.streetAddress);
      reviewRegistration.getLineHomeAddress().should('string', addressData.municipality);
      reviewRegistration.getAdditionalMemberName(0).should('string', `${additionalMemberPersonalData.firstName} ${additionalMemberPersonalData.lastName}`);
      reviewRegistration.getAdditionalMemberBirthdate(0).should('string', reviewRegistration.getDateOfBirthString(additionalMemberPersonalData.dateOfBirth));
      reviewRegistration.getAdditionalMemberGender(0).should('string', additionalMemberPersonalData.gender);
      reviewRegistration.editPersonalInformation();
      personalInformation.selectPreferredLanguage(PreferredLanguage.English);

      reviewRegistration.submitRegistration();

      confirmationPage = reviewRegistration.goToConfirmationPage();
      confirmationPage.getMessage().should('string', 'Thank you').and('string', 'for registering!');
      confirmationPage.getFullName().should('string', `${primaryMemberData.firstName}`).and('string', `${primaryMemberData.lastName}`);
      confirmationPage.getEventName().should('string', event.name.translation.en);
      confirmationPage.getPhoneAssistance().should('string', event.responseDetails.assistanceNumber);
    });
  });
});
