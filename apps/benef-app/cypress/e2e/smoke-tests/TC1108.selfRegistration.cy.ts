import { faker } from '@faker-js/faker';
import { getCurrentDateString } from '@libs/cypress-lib/helpers';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { ReviewRegistrationPage } from '@libs/cypress-lib/pages/registration/reviewRegistration.page';
import { PrivacyStatementPage } from '@libs/cypress-lib/pages/registration/privacyStatement.page';
import { HouseholdMembersPage } from '@libs/cypress-lib/pages/registration/householdMembers.page';
import { PersonalInformationPage, IPersonalInfoFields } from '@libs/cypress-lib/pages/registration/personalInformation.page';
import { AddressPage, IAddressPageFields } from '@libs/cypress-lib/pages/registration/address.page';
import { AddHouseholdMembersPage, IAddMembersPersonalInfoFields } from '@libs/cypress-lib/pages/registration/addHouseholdMembers.page';
import { ConfirmationPage } from '@libs/cypress-lib/pages/registration/confirmation.page';
import { RegistrationPage } from '../../pages/registration.page';
import { useProvider } from '../../provider/provider';
import { buildRegistrationUrl } from '../../support/helpers/urlBuilder';

const firstName = `${faker.name.firstName()} - ${getCurrentDateString()}`;
const lastName = faker.name.lastName();

const primaryBeneficiaryData: IPersonalInfoFields = {
  firstName,
  lastName,
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  preferredLanguage: 'French',
  emailAddress: faker.internet.email(firstName, lastName),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
};

const createAddressData: IAddressPageFields = {
  placeName: faker.address.city(),
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: 'AB',
  postalCode: faker.helpers.replaceSymbols('?#?#?#'),
  tempAddress: 'Remaining in home',
};

const additionalMemberData: IAddMembersPersonalInfoFields = {
  firstName: `${faker.name.firstName()} - ${getCurrentDateString()}`,
  lastName: faker.name.lastName(),
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
};

const title = '#TC1108# : SELF REG - Complete self registration';
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

describe(`${title}`, () => {
  before(() => {
    cy.then(async () => {
      event = await provider.events.createEvent(mockCreateEvent());
      await provider.events.toggleSelfRegistration(event.id, true);
      cy.goTo(buildRegistrationUrl(event));
    });
  });

  it('should register someone successfully', () => {
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
      personalInformation.fill(primaryBeneficiaryData);
      address = personalInformation.goToAddressPage();
    })
    .then(() => {
      address.fill(createAddressData);
      householdMembers = address.goToHouseholdMembersPage();
    })
    .then(() => {
      addHouseholdMembers = householdMembers.addMember();
      addHouseholdMembers.fill(additionalMemberData);
      addHouseholdMembers.addHouseholdMember();
      // verify that new member added
      householdMembers.getAdditionalMemberDetails(0).should('string', `${additionalMemberData.firstName} ${additionalMemberData.lastName}`);
      reviewRegistration = householdMembers.goToReviewPage();
    })
    .then(() => {
      reviewRegistration.getFirstName().should('string', primaryBeneficiaryData.firstName);
      reviewRegistration.getLastName().should('string', primaryBeneficiaryData.lastName);
      reviewRegistration.getBirthDate().should('string', reviewRegistration.getDateOfBirthString(primaryBeneficiaryData.dateOfBirth));
      reviewRegistration.getPreferredLanguage().should('string', primaryBeneficiaryData.preferredLanguage);
      reviewRegistration.getGender().should('string', primaryBeneficiaryData.gender);
      reviewRegistration.getStreetHomeAddress().should('string', createAddressData.streetAddress);
      reviewRegistration.getLineHomeAddress().should('string', createAddressData.municipality);
      reviewRegistration.getAdditionalMemberName(0).should('string', `${additionalMemberData.firstName} ${additionalMemberData.lastName}`);
      reviewRegistration.getAdditionalMemberBirthdate(0).should('string', reviewRegistration.getDateOfBirthString(additionalMemberData.dateOfBirth));
      reviewRegistration.getAdditionalMemberGender(0).should('string', additionalMemberData.gender);
      reviewRegistration.editPersonalInformation();
      personalInformation.selectPreferredLanguage('English');

      reviewRegistration.submitRegistration();

      confirmationPage = reviewRegistration.goToConfirmationPage();
      confirmationPage.getMessage().should('string', 'Thank you').and('string', 'for registering!');
      confirmationPage.getFullName().should('string', `${primaryBeneficiaryData.firstName}`).and('string', `${primaryBeneficiaryData.lastName}`);
      confirmationPage.getEventName().should('string', event.name.translation.en);
      confirmationPage.getPhoneAssistance().should('string', event.responseDetails.assistanceNumber);
    });
  });
});
