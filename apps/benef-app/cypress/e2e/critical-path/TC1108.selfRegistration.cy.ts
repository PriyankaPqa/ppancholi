import { faker } from '@faker-js/faker';
import { getCurrentDateString } from '@libs/cypress-lib/helpers';
import { IEventEntity } from '@libs/entities-lib/event';
import { mockCreateEvent } from '@libs/cypress-lib/mocks/events/event';
import { ReviewRegistrationPage } from '../../pages/reviewRegistration.page';
import { RegistrationPage } from '../../pages/registration.page';
import { PrivacyStatementPage } from '../../pages/privacyStatement.page';
import { HouseholdMembersPage } from '../../pages/householdMembers.page';
import { PersonalInformationPage, IPersonalInfoFields } from '../../pages/personalInformation.page';
import { AddressPage, IAddressPageFields } from '../../pages/address.page';
import { AddHouseholdMembersPage, IAddMembersPersonalInfoFields } from '../../pages/addHouseholdMembers.page';
import { ConfirmationOfRegistrationPage } from '../../pages/confirmationOfRegistration.page';
import { useProvider } from '../../provider/provider';
import { buildRegistrationUrl } from '../../support/helpers/urlBuilder';

const firstName = `${faker.name.firstName()} - ${getCurrentDateString()}`;
const lastName = faker.name.lastName();

const primaryBeneficiaryData: IPersonalInfoFields = {
  firstName,
  lastName,
  gender: faker.helpers.arrayElement(['Female', 'Male']),
  dateOfBirth: faker.date.birthdate({ min: 16, max: 100, mode: 'age' }),
  language: ['French', 'English'],
  emailAddress: faker.internet.email(firstName, lastName),
  indigenousIdentity: faker.helpers.arrayElement(['First Nation', 'Metis', 'Inuit', 'Other']),
};

const createAddressData: IAddressPageFields = {
  placeName: faker.address.city(),
  streetAddress: faker.address.streetAddress(),
  municipality: faker.address.cityName(),
  province: faker.helpers.arrayElement(['Ontario', 'Quebec', 'Manitoba', 'Nunavut']),
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
let confirmationOfRegistrationPage: ConfirmationOfRegistrationPage;

let provider = null as ReturnType<typeof useProvider>;
let event: IEventEntity;
before(() => {
  cy.getToken().then((accessToken) => {
    provider = useProvider(accessToken.access_token);
  });
});

describe(`${title}`, () => {
  beforeEach(() => {
    cy.then(async () => {
      event = await provider.events.createEvent(mockCreateEvent());
      await provider.events.toggleSelfRegistration(event.id, true);
      cy.goTo(buildRegistrationUrl(event));
    });
  });

  it('should register on benef-app', () => {
    const registrationPage = new RegistrationPage();
    cy.wrap(1).then(() => {
      privacyStatement = registrationPage.gotoRegistrationPage();
      // to check event displayed
      privacyStatement.getEventName().then((eventName) => {
      expect(eventName).to.include(event.name.translation.en);
      });
    }).then(() => {
      privacyStatement.agreeToPrivacy();
      personalInformation = privacyStatement.saveAndGoToPersonalInfoPage();
    }).then(() => {
      personalInformation.fill(primaryBeneficiaryData);
      address = personalInformation.saveAndGoToAddressPage();
    })
    .then(() => {
      address.fill(createAddressData);
      householdMembers = address.saveAndGoToHouseholdMembersPage();
    })
    .then(() => {
      addHouseholdMembers = householdMembers.addMember();
      addHouseholdMembers.fill(additionalMemberData);
      addHouseholdMembers.addHouseholdMember();
      // verify that new member added
      householdMembers.getNewMemberDetails().should('string', `${additionalMemberData.firstName} ${additionalMemberData.lastName}`);
      reviewRegistration = householdMembers.saveAndGoToReviewPage();
    })
    .then(() => {
      reviewRegistration.getFirstName().should('string', primaryBeneficiaryData.firstName);
      reviewRegistration.getLastName().should('string', primaryBeneficiaryData.lastName);
      reviewRegistration.getBirthDate().should('string', reviewRegistration.getDateOfBirthString(primaryBeneficiaryData.dateOfBirth));
      reviewRegistration.getPreferredLanguage().should('string', primaryBeneficiaryData.language[0]);
      reviewRegistration.getGender().should('string', primaryBeneficiaryData.gender);
      reviewRegistration.getStreetHomeAddress().should('string', createAddressData.streetAddress);
      reviewRegistration.getLineHomeAddress().should('string', createAddressData.municipality);
      reviewRegistration.getAdditionalMemberName().should('string', `${additionalMemberData.firstName} ${additionalMemberData.lastName}`);
      reviewRegistration.getAdditionalMemberBirthdate().should('string', reviewRegistration.getDateOfBirthString(additionalMemberData.dateOfBirth));
      reviewRegistration.getAdditionalMemberGender().should('string', additionalMemberData.gender);
      reviewRegistration.editPersonalInformation();
      personalInformation.selectLanguageAlternative(primaryBeneficiaryData);

      reviewRegistration.submitRegistration();

      confirmationOfRegistrationPage = reviewRegistration.saveAndGoToConfirmationPage();
      confirmationOfRegistrationPage.getRegistrationMessage().should('string', 'Thank you');
      confirmationOfRegistrationPage.getFullName().should('string', `${primaryBeneficiaryData.firstName}`);
      confirmationOfRegistrationPage.getFullName().should('string', `${primaryBeneficiaryData.lastName}`);
      confirmationOfRegistrationPage.getRegistrationMessage().should('string', 'for registering!');
      confirmationOfRegistrationPage.getEventName().should('string', event.name.translation.en);
      confirmationOfRegistrationPage.getPhoneAssistance().should('string', event.responseDetails.assistanceNumber);
    });
  });
});
